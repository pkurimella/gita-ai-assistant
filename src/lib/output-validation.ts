import { isValidVerse } from './gita-metadata';

export interface OutputValidationResult {
  valid: boolean;
  invalidRefs: string[];
}

const VERSE_PATTERN = /Chapter\s+(\d+),?\s*Verse\s+(\d+)/gi;

export function validateVerseReferences(response: string): OutputValidationResult {
  const invalidRefs: string[] = [];
  let match;

  while ((match = VERSE_PATTERN.exec(response)) !== null) {
    const chapter = parseInt(match[1], 10);
    const verse = parseInt(match[2], 10);

    if (!isValidVerse(chapter, verse)) {
      invalidRefs.push(`Chapter ${chapter}, Verse ${verse}`);
    }
  }

  return {
    valid: invalidRefs.length === 0,
    invalidRefs,
  };
}
