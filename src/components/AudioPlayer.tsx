'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface AudioPlayerProps {
  chapter: number;
  verse: number;
}

export function AudioPlayer({ chapter, verse }: AudioPlayerProps) {
  const [state, setState] = useState<AudioState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset when verse changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    setState('idle');
  }, [chapter, verse]);

  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);

  const handleToggle = useCallback(() => {
    if (state === 'loading') return;

    if (state === 'playing') {
      audioRef.current?.pause();
      setState('paused');
      return;
    }

    if (state === 'paused') {
      audioRef.current?.play();
      setState('playing');
      return;
    }

    // idle or error — start fresh
    setState('loading');

    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    audio.src = `/api/audio?chapter=${chapter}&verse=${verse}`;

    const onCanPlay = () => {
      audio.play().then(() => {
        setState('playing');
      }).catch(() => {
        setState('error');
      });
    };

    const onEnded = () => {
      setState('idle');
    };

    const onError = () => {
      setState('error');
    };

    // Remove existing listeners to avoid duplicates
    audio.removeEventListener('canplaythrough', onCanPlay);
    audio.removeEventListener('ended', onEnded);
    audio.removeEventListener('error', onError);

    audio.addEventListener('canplaythrough', onCanPlay, { once: true });
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    audio.load();
  }, [state, chapter, verse]);

  const ariaLabel =
    state === 'playing'
      ? 'Pause verse recitation'
      : state === 'paused'
        ? 'Resume verse recitation'
        : state === 'loading'
          ? 'Loading audio...'
          : state === 'error'
            ? 'Audio unavailable, try again'
            : 'Listen to verse recitation';

  return (
    <button
      onClick={handleToggle}
      disabled={state === 'loading'}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`
        group relative flex items-center justify-center
        w-10 h-10 rounded-full
        bg-gradient-to-br from-saffron to-saffron-dark
        text-white shadow-md
        transition-all duration-200
        hover:scale-105 hover:shadow-lg
        active:scale-95
        disabled:opacity-70 disabled:cursor-wait
        ${state === 'playing' ? 'animate-glow-saffron' : ''}
      `}
    >
      {state === 'loading' ? (
        /* Pulsing Om while loading */
        <span className="font-sanskrit text-lg animate-pulse">
          {'\u0950'}
        </span>
      ) : state === 'playing' ? (
        /* Pause bars */
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="drop-shadow-sm"
        >
          <rect x="3" y="2" width="4" height="12" rx="1" />
          <rect x="9" y="2" width="4" height="12" rx="1" />
        </svg>
      ) : state === 'error' ? (
        /* Retry icon (circular arrow) */
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="drop-shadow-sm"
        >
          <path d="M2 8a6 6 0 0 1 10.5-4" />
          <path d="M14 2v4h-4" />
          <path d="M14 8a6 6 0 0 1-10.5 4" />
          <path d="M2 14v-4h4" />
        </svg>
      ) : (
        /* Play triangle */
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="drop-shadow-sm ml-0.5"
        >
          <path d="M4 2.5v11a1 1 0 0 0 1.5.87l9-5.5a1 1 0 0 0 0-1.74l-9-5.5A1 1 0 0 0 4 2.5z" />
        </svg>
      )}
    </button>
  );
}
