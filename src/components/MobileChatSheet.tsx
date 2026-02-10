'use client';

import { useState, useEffect } from 'react';
import { ChatPanel } from './ChatPanel';
import type { VerseData } from '@/types/verse';

interface MobileChatSheetProps {
  verseData: VerseData | null;
}

export function MobileChatSheet({ verseData }: MobileChatSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Close sheet when verse changes
  useEffect(() => {
    setIsOpen(false);
  }, [verseData?.chapter, verseData?.verse]);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-saffron to-saffron-dark text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
          aria-label="Open chat"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      )}

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 h-[85vh] bg-parchment-light rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Drag handle */}
        <div className="flex flex-col items-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gold/60" />
        </div>

        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-4 w-8 h-8 flex items-center justify-center rounded-full text-blue-muted hover:bg-gold-light transition-colors text-lg"
          aria-label="Close chat"
        >
          &times;
        </button>

        {/* Chat content */}
        <div className="h-[calc(85vh-2rem)] flex flex-col">
          <ChatPanel verseData={verseData} />
        </div>
      </div>
    </div>
  );
}
