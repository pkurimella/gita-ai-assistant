'use client';

import { useState, useEffect, useCallback } from 'react';
import { VerseDisplay } from '@/components/VerseDisplay';
import { VerseNavigation } from '@/components/VerseNavigation';
import type { VerseData } from '@/types/verse';

export default function Home() {
  const [chapter, setChapter] = useState(1);
  const [verse, setVerse] = useState(1);
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <header className="border-b border-gold/40 bg-parchment-light/80 backdrop-blur-sm px-6 py-4">
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

        {/* Right panel: Chat (placeholder for now) */}
        <div className="w-full lg:w-[440px] lg:max-h-[calc(100vh-80px)] flex flex-col border-t lg:border-t-0 border-gold/30 bg-parchment-light/50">
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-blue-muted text-sm text-center font-serif italic">
              Chat panel coming soon...
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
