'use client';

interface OrnamentalDividerProps {
  symbol?: 'om' | 'lotus' | 'dot';
  className?: string;
}

const symbols = {
  om: '\u0950',    // ॐ Devanagari Om
  lotus: '\u{1FAB7}', // 🪷 Lotus
  dot: '\u2726',   // ✦ Four-pointed star
};

export function OrnamentalDivider({
  symbol = 'dot',
  className = '',
}: OrnamentalDividerProps) {
  return (
    <div className={`flex items-center gap-3 my-6 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      <span
        className={`text-lg opacity-50 ${
          symbol === 'om'
            ? 'font-sanskrit text-krishna-blue text-xl'
            : symbol === 'lotus'
              ? 'text-saffron'
              : 'text-gold text-sm'
        }`}
      >
        {symbols[symbol]}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
    </div>
  );
}
