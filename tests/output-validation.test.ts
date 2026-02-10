import { describe, it, expect } from 'vitest';
import { validateVerseReferences } from '../src/lib/output-validation';

describe('validateVerseReferences', () => {
  describe('valid references', () => {
    it('accepts valid Chapter 2, Verse 47', () => {
      expect(validateVerseReferences('Chapter 2, Verse 47 is about karma yoga.').valid).toBe(true);
    });

    it('accepts valid Chapter 18, Verse 66', () => {
      expect(validateVerseReferences('See Chapter 18, Verse 66 for the final teaching.').valid).toBe(true);
    });

    it('accepts text with no verse references', () => {
      expect(validateVerseReferences('No verse references here.').valid).toBe(true);
    });

    it('accepts multiple valid references', () => {
      const result = validateVerseReferences('Chapter 1, Verse 1 and Chapter 18, Verse 78 are the bookends.');
      expect(result.valid).toBe(true);
      expect(result.invalidRefs).toHaveLength(0);
    });
  });

  describe('invalid references', () => {
    it('detects Chapter 19 as invalid', () => {
      const result = validateVerseReferences('Chapter 19, Verse 1 discusses this.');
      expect(result.valid).toBe(false);
      expect(result.invalidRefs).toContain('Chapter 19, Verse 1');
    });

    it('detects verse out of range', () => {
      const result = validateVerseReferences('Chapter 2, Verse 100 mentions this.');
      expect(result.valid).toBe(false);
      expect(result.invalidRefs).toContain('Chapter 2, Verse 100');
    });

    it('detects Chapter 0 as invalid', () => {
      const result = validateVerseReferences('Chapter 0, Verse 1 says something.');
      expect(result.valid).toBe(false);
    });
  });

  describe('mixed references', () => {
    it('reports only invalid refs when mixed with valid', () => {
      const result = validateVerseReferences('Chapter 2, Verse 47 and Chapter 99, Verse 1 are related.');
      expect(result.valid).toBe(false);
      expect(result.invalidRefs).toHaveLength(1);
      expect(result.invalidRefs).toContain('Chapter 99, Verse 1');
    });
  });
});
