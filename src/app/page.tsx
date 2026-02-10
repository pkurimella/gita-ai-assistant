'use client';

import { useState, useEffect, useCallback } from 'react';
import { VerseDisplay } from '@/components/VerseDisplay';
import { VerseNavigation } from '@/components/VerseNavigation';
import { ChatPanel } from '@/components/ChatPanel';
import { MobileChatSheet } from '@/components/MobileChatSheet';
import { getRandomVerse } from '@/lib/random-verse';
import type { VerseData } from '@/types/verse';

export default function Home() {
  const [chapter, setChapter] = useState(1);
  const [verse, setVerse] = useState(1);
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchVerse = useCallback(async (ch: number, v: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/verse?chapter=${ch}&verse=${v}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch verse');
      }
      const data: VerseData = await res.json();
      setVerseData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Pick random verse on client mount only (avoids SSR/hydration mismatch)
  useEffect(() => {
    if (!initialized) {
      const random = getRandomVerse();
      setChapter(random.chapter);
      setVerse(random.verse);
      setInitialized(true);
    }
  }, [initialized]);

  useEffect(() => {
    fetchVerse(chapter, verse);
  }, [chapter, verse, fetchVerse]);

  const navigateTo = (ch: number, v: number) => {
    setChapter(ch);
    setVerse(v);
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gold/40 bg-parchment-light/80 backdrop-blur-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="font-sanskrit text-3xl text-saffron opacity-80">
            {'\u0950'}
          </span>
          <div>
            <h1 className="text-2xl font-serif font-bold text-krishna-blue">
              Bhagavad Gita Guide
            </h1>
            <p className="text-sm text-blue-muted font-serif italic">
              Learn the Gita, one verse at a time
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
        {/* Left panel: Verse display */}
        <div className="flex-1 p-6 lg:border-r border-gold/30 lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto verse-scrollbar">
          <VerseNavigation
            chapter={chapter}
            verse={verse}
            onNavigate={navigateTo}
          />
          <VerseDisplay
            verseData={verseData}
            loading={loading}
            error={error}
          />
        </div>

        {/* Desktop chat sidebar — hidden on mobile */}
        <div className="hidden lg:flex w-[440px] max-h-[calc(100vh-80px)] flex-col border-gold/30 bg-parchment-light/50">
          <ChatPanel verseData={verseData} />
        </div>
      </div>

      {/* Mobile chat FAB + bottom sheet — hidden on desktop */}
      <MobileChatSheet verseData={verseData} />
    </main>
  );
}
