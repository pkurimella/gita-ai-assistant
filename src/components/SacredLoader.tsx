'use client';

import { useState, useEffect } from 'react';

const TEACHINGS = [
  'You have the right to act, but not to the fruits of action',
  'The soul is neither born, nor does it ever die',
  'When meditation is mastered, the mind is unwavering',
  'Perform your duty with a calm and equal mind',
  'From contemplation of sense objects, attachment arises',
];

export function SacredLoader() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % TEACHINGS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 12 dots for chakra wheel
  const dots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const x = 50 + 38 * Math.cos(angle);
    const y = 50 + 38 * Math.sin(angle);
    return { x, y, opacity: 0.3 + (i / 12) * 0.7 };
  });

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      {/* Om symbol with chakra ring */}
      <div className="relative w-28 h-28">
        {/* Rotating chakra dots */}
        <svg
          className="absolute inset-0 w-full h-full animate-chakra-rotate"
          viewBox="0 0 100 100"
        >
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r="2.5"
              fill="var(--color-gold)"
              opacity={d.opacity}
            />
          ))}
        </svg>
        {/* Om symbol */}
        <span className="absolute inset-0 flex items-center justify-center font-sanskrit text-5xl text-saffron animate-om-pulse">
          {'\u0950'}
        </span>
      </div>

      {/* Rotating quote */}
      <p
        key={quoteIndex}
        className="text-center text-blue-muted font-serif italic text-sm max-w-xs animate-quote-fade"
      >
        &ldquo;{TEACHINGS[quoteIndex]}&rdquo;
      </p>

      <p className="text-xs text-gold tracking-wide uppercase">
        Preparing verse&hellip;
      </p>
    </div>
  );
}
