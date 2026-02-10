'use client';

import {
  CHAPTERS,
  getNextVerse,
  getPrevVerse,
  getChapter,
} from '@/lib/gita-metadata';

interface VerseNavigationProps {
  chapter: number;
  verse: number;
  onNavigate: (chapter: number, verse: number) => void;
}

export function VerseNavigation({
  chapter,
  verse,
  onNavigate,
}: VerseNavigationProps) {
  const prev = getPrevVerse(chapter, verse);
  const next = getNextVerse(chapter, verse);
  const currentChapter = getChapter(chapter);

  return (
    <nav className="flex items-center justify-between gap-3">
      <button
        onClick={() => prev && onNavigate(prev.chapter, prev.verse)}
        disabled={!prev}
        className="min-h-[44px] px-3 py-2 text-sm rounded-lg border border-gold bg-parchment-light hover:bg-gold-light text-krishna-blue disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
      >
        &larr; Prev
      </button>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        <select
          value={chapter}
          onChange={(e) => onNavigate(parseInt(e.target.value), 1)}
          className="min-h-[44px] px-2 py-1.5 text-sm rounded-lg border border-gold bg-parchment-light text-krishna-blue focus:outline-none focus:ring-2 focus:ring-saffron/50"
        >
          {CHAPTERS.map((ch) => (
            <option key={ch.number} value={ch.number}>
              Ch. {ch.number}: {ch.name}
            </option>
          ))}
        </select>

        <span className="text-gold">:</span>

        <select
          value={verse}
          onChange={(e) => onNavigate(chapter, parseInt(e.target.value))}
          className="min-h-[44px] px-2 py-1.5 text-sm rounded-lg border border-gold bg-parchment-light text-krishna-blue focus:outline-none focus:ring-2 focus:ring-saffron/50"
        >
          {currentChapter &&
            Array.from(
              { length: currentChapter.verseCount },
              (_, i) => i + 1
            ).map((v) => (
              <option key={v} value={v}>
                Verse {v}
              </option>
            ))}
        </select>
      </div>

      <button
        onClick={() => next && onNavigate(next.chapter, next.verse)}
        disabled={!next}
        className="min-h-[44px] px-3 py-2 text-sm rounded-lg border border-gold bg-parchment-light hover:bg-gold-light text-krishna-blue disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
      >
        Next &rarr;
      </button>
    </nav>
  );
}
