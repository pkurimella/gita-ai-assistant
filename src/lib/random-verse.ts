import { CHAPTERS, TOTAL_VERSES } from './gita-metadata';

export function getRandomVerse(): { chapter: number; verse: number } {
  const rand = Math.floor(Math.random() * TOTAL_VERSES) + 1;
  let cumulative = 0;
  for (const ch of CHAPTERS) {
    cumulative += ch.verseCount;
    if (rand <= cumulative) {
      const verseInChapter = rand - (cumulative - ch.verseCount);
      return { chapter: ch.number, verse: verseInChapter };
    }
  }
  return { chapter: 1, verse: 1 };
}
