import { describe, it, expect, vi } from 'vitest';
import { getRandomVerse } from '../src/lib/random-verse';
import { isValidVerse, CHAPTERS, TOTAL_VERSES } from '../src/lib/gita-metadata';

describe('getRandomVerse', () => {
  it('always returns a valid verse', () => {
    for (let i = 0; i < 100; i++) {
      const { chapter, verse } = getRandomVerse();
      expect(isValidVerse(chapter, verse)).toBe(true);
    }
  });

  it('returns Ch.1 V.1 when Math.random() returns 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(getRandomVerse()).toEqual({ chapter: 1, verse: 1 });
    vi.restoreAllMocks();
  });

  it('returns last verse when Math.random() returns 0.999', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999);
    const result = getRandomVerse();
    expect(result.chapter).toBe(18);
    expect(result.verse).toBe(CHAPTERS[17].verseCount);
    vi.restoreAllMocks();
  });

  it('covers all chapters over many iterations', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 5000; i++) {
      seen.add(getRandomVerse().chapter);
    }
    expect(seen.size).toBe(18);
  });

  it('chapter distribution is roughly proportional to verse count', () => {
    const counts = new Map<number, number>();
    const N = 10000;
    for (let i = 0; i < N; i++) {
      const { chapter } = getRandomVerse();
      counts.set(chapter, (counts.get(chapter) || 0) + 1);
    }
    // Ch.18 has 78 verses (11.1%), Ch.12 has 20 (2.9%) — Ch.18 should appear ~3-4x more
    const ch18 = counts.get(18) || 0;
    const ch12 = counts.get(12) || 0;
    expect(ch18).toBeGreaterThan(ch12 * 2);
  });
});
