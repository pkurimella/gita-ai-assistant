import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InMemoryRateLimiter } from '../src/lib/rate-limiter';

describe('InMemoryRateLimiter', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('allows requests up to the limit', () => {
    const limiter = new InMemoryRateLimiter(60_000, 3);
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(false);
  });

  it('returns correct remaining count', () => {
    const limiter = new InMemoryRateLimiter(60_000, 5);
    expect(limiter.check('a').remaining).toBe(4);
    expect(limiter.check('a').remaining).toBe(3);
    expect(limiter.check('a').remaining).toBe(2);
  });

  it('blocks after max requests then re-allows after window expires', () => {
    const limiter = new InMemoryRateLimiter(1000, 2);
    limiter.check('a');
    limiter.check('a');
    expect(limiter.check('a').allowed).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(limiter.check('a').allowed).toBe(true);
  });

  it('tracks keys independently', () => {
    const limiter = new InMemoryRateLimiter(60_000, 1);
    expect(limiter.check('a').allowed).toBe(true);
    expect(limiter.check('b').allowed).toBe(true);
    expect(limiter.check('a').allowed).toBe(false);
    expect(limiter.check('b').allowed).toBe(false);
  });

  it('returns positive resetMs when blocked', () => {
    const limiter = new InMemoryRateLimiter(60_000, 1);
    limiter.check('a');
    const result = limiter.check('a');
    expect(result.allowed).toBe(false);
    expect(result.resetMs).toBeGreaterThan(0);
    expect(result.resetMs).toBeLessThanOrEqual(60_000);
  });

  it('cleanup removes stale entries', () => {
    const limiter = new InMemoryRateLimiter(1000, 5);
    limiter.check('a');
    limiter.check('b');

    vi.advanceTimersByTime(1001);
    limiter.cleanup();

    // After cleanup, entries should be gone — new requests allowed at full capacity
    expect(limiter.check('a').remaining).toBe(4);
    expect(limiter.check('b').remaining).toBe(4);
  });
});
