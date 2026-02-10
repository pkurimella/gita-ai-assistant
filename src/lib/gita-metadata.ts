export interface ChapterInfo {
  number: number;
  name: string;
  meaning: string;
  verseCount: number;
}

export const CHAPTERS: ChapterInfo[] = [
  { number: 1, name: 'Arjuna Vishada Yoga', meaning: "Arjuna's Dilemma", verseCount: 46 },
  { number: 2, name: 'Sankhya Yoga', meaning: 'Transcendental Knowledge', verseCount: 72 },
  { number: 3, name: 'Karma Yoga', meaning: 'The Yoga of Action', verseCount: 43 },
  { number: 4, name: 'Jnana Karma Sanyasa Yoga', meaning: 'The Yoga of Knowledge and Renunciation of Action', verseCount: 42 },
  { number: 5, name: 'Karma Sanyasa Yoga', meaning: 'The Yoga of Renunciation', verseCount: 29 },
  { number: 6, name: 'Dhyana Yoga', meaning: 'The Yoga of Meditation', verseCount: 47 },
  { number: 7, name: 'Jnana Vijnana Yoga', meaning: 'The Yoga of Knowledge and Wisdom', verseCount: 30 },
  { number: 8, name: 'Akshara Brahma Yoga', meaning: 'The Yoga of the Imperishable Absolute', verseCount: 28 },
  { number: 9, name: 'Raja Vidya Raja Guhya Yoga', meaning: 'The Yoga of Royal Knowledge and Royal Secret', verseCount: 34 },
  { number: 10, name: 'Vibhuti Yoga', meaning: 'The Yoga of Divine Glories', verseCount: 42 },
  { number: 11, name: 'Vishwarupa Darshana Yoga', meaning: 'The Yoga of the Universal Form', verseCount: 55 },
  { number: 12, name: 'Bhakti Yoga', meaning: 'The Yoga of Devotion', verseCount: 20 },
  { number: 13, name: 'Kshetra Kshetragna Vibhaga Yoga', meaning: 'The Yoga of the Field and the Knower', verseCount: 35 },
  { number: 14, name: 'Gunatraya Vibhaga Yoga', meaning: 'The Yoga of the Three Gunas', verseCount: 27 },
  { number: 15, name: 'Purushottama Yoga', meaning: 'The Yoga of the Supreme Person', verseCount: 20 },
  { number: 16, name: 'Daivasura Sampad Vibhaga Yoga', meaning: 'The Yoga of Divine and Demoniac Natures', verseCount: 24 },
  { number: 17, name: 'Shraddhatraya Vibhaga Yoga', meaning: 'The Yoga of the Three Divisions of Faith', verseCount: 28 },
  { number: 18, name: 'Moksha Sanyasa Yoga', meaning: 'The Yoga of Liberation through Renunciation', verseCount: 78 },
];

export const TOTAL_VERSES = 700;

export function getChapter(num: number): ChapterInfo | undefined {
  return CHAPTERS.find((c) => c.number === num);
}

export function isValidVerse(chapter: number, verse: number): boolean {
  const ch = getChapter(chapter);
  return !!ch && verse >= 1 && verse <= ch.verseCount;
}

export function getNextVerse(
  chapter: number,
  verse: number
): { chapter: number; verse: number } | null {
  const ch = getChapter(chapter);
  if (!ch) return null;
  if (verse < ch.verseCount) return { chapter, verse: verse + 1 };
  if (chapter < 18) return { chapter: chapter + 1, verse: 1 };
  return null;
}

export function getPrevVerse(
  chapter: number,
  verse: number
): { chapter: number; verse: number } | null {
  if (verse > 1) return { chapter, verse: verse - 1 };
  if (chapter > 1) {
    const prevCh = getChapter(chapter - 1);
    return prevCh ? { chapter: chapter - 1, verse: prevCh.verseCount } : null;
  }
  return null;
}
