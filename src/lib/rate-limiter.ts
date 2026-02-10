/**
 * In-memory sliding window rate limiter.
 * No external dependencies — portable to any JS runtime.
 */
export class InMemoryRateLimiter {
  private windows = new Map<string, number[]>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(key: string): { allowed: boolean; remaining: number; resetMs: number } {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    const timestamps = (this.windows.get(key) || []).filter((t) => t > cutoff);

    if (timestamps.length >= this.maxRequests) {
      const resetMs = timestamps[0] + this.windowMs - now;
      this.windows.set(key, timestamps);
      return { allowed: false, remaining: 0, resetMs };
    }

    timestamps.push(now);
    this.windows.set(key, timestamps);
    return {
      allowed: true,
      remaining: this.maxRequests - timestamps.length,
      resetMs: timestamps[0] + this.windowMs - now,
    };
  }

  /** Remove entries whose entire window has expired */
  cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    for (const [key, timestamps] of this.windows) {
      const active = timestamps.filter((t) => t > cutoff);
      if (active.length === 0) this.windows.delete(key);
      else this.windows.set(key, active);
    }
  }
}
