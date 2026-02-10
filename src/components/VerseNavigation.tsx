'use client';

import {
  CHAPTERS,
  getNextVerse,
  getPrevVerse,
  getChapter,
} from '@/lib/gita-metadata';
import { getRandomVerse } from '@/lib/random-verse';

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

  const handleDiscover = () => {
    const { chapter: ch, verse: v } = getRandomVerse();
    onNavigate(ch, v);
  };

  return (
    <nav className="space-y-1.5">
      {/* Navigation row */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Prev button */}
        <button
          onClick={() => prev && onNavigate(prev.chapter, prev.verse)}
          disabled={!prev}
          className="min-h-[44px] min-w-[44px] px-2 sm:px-3 py-2 text-sm rounded-lg border border-gold bg-parchment-light hover:bg-gold-light text-krishna-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all font-serif hover:scale-105 active:scale-95"
        >
          <span>&larr;</span>
          <span className="hidden sm:inline"> Prev</span>
        </button>

        {/* Chapter select */}
        <div className="relative flex-1 min-w-0">
          <select
            value={chapter}
            onChange={(e) => onNavigate(parseInt(e.target.value), 1)}
            className="w-full appearance-none min-h-[44px] pr-7 pl-2.5 py-1.5 text-sm rounded-lg border border-gold bg-parchment-light text-krishna-blue font-serif truncate focus:outline-none focus:ring-2 focus:ring-saffron/40 cursor-pointer"
          >
            {CHAPTERS.map((ch) => (
              <option key={ch.number} value={ch.number}>
                Ch. {ch.number}: {ch.name}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none w-3.5 h-3.5 text-gold"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </div>

        <span className="text-gold font-serif">:</span>

        {/* Verse select */}
        <div className="relative w-[5.5rem] sm:w-28">
          <select
            value={verse}
            onChange={(e) => onNavigate(chapter, parseInt(e.target.value))}
            className="w-full appearance-none min-h-[44px] pr-7 pl-2.5 py-1.5 text-sm rounded-lg border border-gold bg-parchment-light text-krishna-blue font-serif focus:outline-none focus:ring-2 focus:ring-saffron/40 cursor-pointer"
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
          <svg
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none w-3.5 h-3.5 text-gold"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </div>

        {/* Next button */}
        <button
          onClick={() => next && onNavigate(next.chapter, next.verse)}
          disabled={!next}
          className="min-h-[44px] min-w-[44px] px-2 sm:px-3 py-2 text-sm rounded-lg border border-gold bg-parchment-light hover:bg-gold-light text-krishna-blue disabled:opacity-40 disabled:cursor-not-allowed transition-all font-serif hover:scale-105 active:scale-95"
        >
          <span className="hidden sm:inline">Next </span>
          <span>&rarr;</span>
        </button>

        {/* Discover (random verse) button */}
        <button
          onClick={handleDiscover}
          className="min-h-[44px] min-w-[44px] px-2.5 rounded-lg bg-gradient-to-br from-saffron to-saffron-dark text-white font-sanskrit text-lg shadow-md hover:animate-glow-saffron hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
          aria-label="Discover a random verse"
          title="Discover a random verse"
        >
          {'\u0950'}
        </button>
      </div>

      {/* Chapter meaning subtitle */}
      {currentChapter && (
        <p className="text-center text-xs text-blue-muted font-serif italic">
          {currentChapter.meaning}
        </p>
      )}
    </nav>
  );
}
