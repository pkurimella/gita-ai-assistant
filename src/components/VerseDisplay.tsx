'use client';

import type { VerseData } from '@/types/verse';
import { OrnamentalDivider } from './OrnamentalDivider';

interface VerseDisplayProps {
  verseData: VerseData | null;
  loading: boolean;
  error: string | null;
}

export function VerseDisplay({ verseData, loading, error }: VerseDisplayProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-6 mt-6">
        <div className="h-6 bg-vellum/60 rounded w-3/4" />
        <div className="h-28 bg-vellum/40 rounded-lg" />
        <div className="h-4 bg-vellum/40 rounded w-1/2" />
        <div className="h-20 bg-vellum/40 rounded" />
        <div className="h-36 bg-vellum/40 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-burgundy/10 border border-burgundy/30 rounded-lg text-burgundy">
        {error}
      </div>
    );
  }

  if (!verseData) return null;

  return (
    <article className="mt-6 space-y-2">
      {/* Chapter heading */}
      <div>
        <h2 className="text-lg font-serif font-semibold text-krishna-blue">
          Chapter {verseData.chapter}: {verseData.chapterName}
        </h2>
        <p className="text-sm text-blue-muted italic font-serif">
          {verseData.chapterMeaning}
        </p>
        <p className="text-sm text-text-secondary mt-1">
          Verse {verseData.verse} &middot;{' '}
          <span className="inline-block px-2 py-0.5 bg-gold-light text-krishna-blue text-xs rounded-full font-medium">
            {verseData.speaker}
          </span>
        </p>
      </div>

      <OrnamentalDivider symbol="om" />

      {/* Sanskrit text card */}
      <div className="relative bg-gradient-to-br from-parchment to-cream rounded-lg p-5 border-l-4 border-saffron shadow-[inset_0_0_15px_rgba(139,90,43,0.05)]">
        <span className="absolute top-2 left-3 text-gold/30 text-xs">✦</span>
        <span className="absolute bottom-2 right-3 text-gold/30 text-xs">✦</span>
        <p className="text-xl font-sanskrit leading-relaxed text-krishna-blue text-center">
          {verseData.sanskrit}
        </p>
      </div>

      <OrnamentalDivider symbol="dot" />

      {/* Transliteration */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-blue-muted font-semibold mb-1">
          Transliteration
        </h3>
        <p className="text-text-primary italic font-serif">
          {verseData.transliteration}
        </p>
      </div>

      {/* Translation */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-blue-muted font-semibold mb-1">
          Translation
        </h3>
        <p className="text-text-primary leading-relaxed font-serif">
          {verseData.translation}
        </p>
      </div>

      <OrnamentalDivider symbol="lotus" />

      {/* Commentary */}
      <div>
        <h3 className="text-xs uppercase tracking-wider text-blue-muted font-semibold mb-1">
          Commentary
        </h3>
        <div className="text-text-secondary leading-relaxed whitespace-pre-line">
          {verseData.commentary}
        </div>
      </div>

      {/* Key Terms */}
      {verseData.keyTerms && verseData.keyTerms.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-wider text-blue-muted font-semibold mb-2">
            Key Terms
          </h3>
          <div className="flex flex-wrap gap-2">
            {verseData.keyTerms.map((term) => (
              <span
                key={term}
                className="px-3 py-1 bg-gold-light text-krishna-blue text-sm rounded-full border border-gold font-medium"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
