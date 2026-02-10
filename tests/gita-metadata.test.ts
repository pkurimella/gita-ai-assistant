import { describe, it, expect } from 'vitest';
import {
  CHAPTERS,
  TOTAL_VERSES,
  getChapter,
  isValidVerse,
  getNextVerse,
  getPrevVerse,
} from '../src/lib/gita-metadata';

describe('CHAPTERS', () => {
  it('has 18 chapters', () => {
    expect(CHAPTERS).toHaveLength(18);
  });

  it('chapters are numbered 1 through 18', () => {
    CHAPTERS.forEach((ch, i) => {
      expect(ch.number).toBe(i + 1);
    });
  });

  it('every chapter has a name and meaning', () => {
    CHAPTERS.forEach((ch) => {
      expect(ch.name.length).toBeGreaterThan(0);
      expect(ch.meaning.length).toBeGreaterThan(0);
    });
  });

  it('every chapter has at least 1 verse', () => {
    CHAPTERS.forEach((ch) => {
      expect(ch.verseCount).toBeGreaterThan(0);
    });
  });

  it('total verses sum to 700', () => {
    const sum = CHAPTERS.reduce((acc, ch) => acc + ch.verseCount, 0);
    expect(sum).toBe(TOTAL_VERSES);
    expect(sum).toBe(700);
  });
});

describe('getChapter', () => {
  it('returns chapter info for valid chapter', () => {
    const ch = getChapter(2);
    expect(ch).toBeDefined();
    expect(ch!.number).toBe(2);
    expect(ch!.name).toBe('Sankhya Yoga');
  });

  it('returns undefined for invalid chapter', () => {
    expect(getChapter(0)).toBeUndefined();
    expect(getChapter(19)).toBeUndefined();
    expect(getChapter(-1)).toBeUndefined();
  });
});

describe('isValidVerse', () => {
  it('accepts first verse of first chapter', () => {
    expect(isValidVerse(1, 1)).toBe(true);
  });

  it('accepts last verse of last chapter', () => {
    expect(isValidVerse(18, 78)).toBe(true);
  });

  it('accepts last verse of chapter 1', () => {
    expect(isValidVerse(1, 46)).toBe(true);
  });

  it('accepts last verse of chapter 2', () => {
    expect(isValidVerse(2, 72)).toBe(true);
  });

  it('rejects chapter 0', () => {
    expect(isValidVerse(0, 1)).toBe(false);
  });

  it('rejects chapter 19', () => {
    expect(isValidVerse(19, 1)).toBe(false);
  });

  it('rejects verse 0', () => {
    expect(isValidVerse(1, 0)).toBe(false);
  });

  it('rejects verse beyond chapter count', () => {
    expect(isValidVerse(1, 47)).toBe(false);
    expect(isValidVerse(2, 73)).toBe(false);
    expect(isValidVerse(18, 79)).toBe(false);
  });
});

describe('getNextVerse', () => {
  it('increments verse within a chapter', () => {
    expect(getNextVerse(1, 1)).toEqual({ chapter: 1, verse: 2 });
    expect(getNextVerse(2, 47)).toEqual({ chapter: 2, verse: 48 });
  });

  it('wraps to next chapter at chapter boundary', () => {
    expect(getNextVerse(1, 46)).toEqual({ chapter: 2, verse: 1 });
    expect(getNextVerse(2, 72)).toEqual({ chapter: 3, verse: 1 });
  });

  it('returns null at the very last verse', () => {
    expect(getNextVerse(18, 78)).toBeNull();
  });

  it('returns null for invalid chapter', () => {
    expect(getNextVerse(19, 1)).toBeNull();
  });
});

describe('getPrevVerse', () => {
  it('decrements verse within a chapter', () => {
    expect(getPrevVerse(1, 2)).toEqual({ chapter: 1, verse: 1 });
    expect(getPrevVerse(2, 47)).toEqual({ chapter: 2, verse: 46 });
  });

  it('wraps to previous chapter at chapter boundary', () => {
    expect(getPrevVerse(2, 1)).toEqual({ chapter: 1, verse: 46 });
    expect(getPrevVerse(3, 1)).toEqual({ chapter: 2, verse: 72 });
  });

  it('returns null at the very first verse', () => {
    expect(getPrevVerse(1, 1)).toBeNull();
  });
});
