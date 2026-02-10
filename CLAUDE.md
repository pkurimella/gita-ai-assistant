# Bhagavad Gita AI Assistant

## Project Overview

A Next.js web app that helps users understand the Bhagavad Gita one verse at a time. Users see a verse with Sanskrit text, transliteration, translation, and commentary, alongside an AI chat agent that can explain meanings, provide cross-references, and relate teachings to modern life.

The visual design evokes the sacred nature of the Gita — aged parchment textures, saffron and Krishna blue accents, ornamental dividers, and Devanagari-appropriate typography.

## Tech Stack

- **Framework**: Next.js 15+ (App Router, TypeScript)
- **Styling**: Tailwind CSS with custom Gita-themed design tokens
- **AI**: Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`) + Claude Sonnet
- **Fonts**: Tiro Devanagari Sanskrit (Sanskrit text) + Crimson Text (English headings/body) + Inter (UI/chat)
- **State**: Client-side only (no database for MVP)

## Architecture (Mobile-Extensible)

The codebase is structured for future React Native / Expo extension:

```
src/
├── app/                        # Next.js pages + API routes (web-specific)
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Main page — state owner, two-panel layout
│   ├── globals.css             # Tailwind directives + Gita design tokens
│   └── api/
│       ├── verse/route.ts      # GET /api/verse?chapter=X&verse=Y
│       └── chat/route.ts       # POST /api/chat — streaming chat
├── components/                 # React components (portable to React Native with adapter)
│   ├── VerseDisplay.tsx        # Verse rendering (Sanskrit, translation, commentary, key terms)
│   ├── VerseNavigation.tsx     # Chapter/verse dropdowns + prev/next buttons
│   ├── ChatPanel.tsx           # Chat UI with useChat hook
│   └── ChatMessage.tsx         # Individual message bubble
├── lib/                        # Pure logic — fully portable to any JS runtime
│   ├── gita-metadata.ts        # Static chapter data (18 chapters, verse counts, nav helpers)
│   └── system-prompts.ts       # System prompts for verse generation + chat agent
└── types/                      # TypeScript interfaces — shared across all platforms
    └── verse.ts                # VerseData interface
```

**Portability layers**:
- `src/lib/input-validation.ts` — chat message validation (length, jailbreak patterns, encoding)
- `src/lib/output-validation.ts` — verse reference extraction + validation
- `src/lib/` and `src/types/` — **zero platform dependencies**, reusable in React Native, Expo, or any JS environment
- `src/components/` — React components using standard hooks and props. For mobile, these would be adapted to React Native equivalents
- `src/app/` — Next.js specific (pages, API routes). For mobile, API routes would move to a shared backend or edge functions

## Key Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
```

## Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...   # Required. Set in .env.local
```

## Design System — Gita Theme

### Color Palette (CSS custom properties in globals.css)

| Token | Hex | Usage |
|---|---|---|
| `--color-saffron` | `#FF902B` | Primary accent, buttons, active states |
| `--color-saffron-dark` | `#D97706` | Button hover, dark accents |
| `--color-gold` | `#D4A574` | Borders, ornamental lines, secondary accents |
| `--color-gold-light` | `#F7E6CA` | Champagne highlights |
| `--color-krishna-blue` | `#1B3A70` | Headings, Sanskrit text, deep accents |
| `--color-blue-muted` | `#4A5A8C` | Secondary text on parchment |
| `--color-parchment` | `#F1E9D2` | Main background |
| `--color-parchment-light` | `#FCF5E5` | Card backgrounds, lighter areas |
| `--color-vellum` | `#EBD5B3` | Gradient endpoints, verse card bg |
| `--color-text-primary` | `#2C3E50` | Body text |
| `--color-burgundy` | `#8B3A3A` | Rare ceremonial accent |

### Typography

- **Sanskrit text**: `font-sanskrit` → Tiro Devanagari Sanskrit (or Noto Serif Devanagari fallback)
- **Headings & translations**: `font-serif` → Crimson Text
- **UI, chat, navigation**: `font-sans` → Inter

### Decorative Elements

- **Ornamental dividers**: Gold gradient lines with ॐ (U+0950) or lotus (🪷) center symbols
- **Verse cards**: Parchment gradient background, saffron left border, subtle inner shadow
- **Section headers**: Small caps, letter-spacing, Krishna blue
- **Corner ornaments**: `✦` glyphs at card corners (subtle, low opacity)

## Security & Guardrails

- **System prompt** uses XML-tagged instruction hierarchy with non-negotiable scope boundaries
- **Input validation** (`src/lib/input-validation.ts`): max 2000 chars, jailbreak pattern detection, encoding checks — runs before every Claude API call
- **Output validation** (`src/lib/output-validation.ts`): extracts verse references from responses, validates against gita-metadata — logged, not blocked
- **Topic scoping**: Agent only answers Gita-related questions. Off-topic gets a polite redirect.
- **Hallucination prevention**: Agent instructed to never invent verse references, say "I'm not certain" when unsure
- **Jailbreak defense**: Standard redirect for override/pretend/ignore attempts. Never reveals system prompt.
- **Token limits**: `maxTokens: 2000` on all chat calls to prevent token exhaustion
- **Neutrality**: Agent presents multiple scholarly interpretations, avoids prescriptive modern applications

## Conventions

- All components in `src/components/` are client components (`'use client'`)
- API routes in `src/app/api/` are server-side only
- Shared types in `src/types/` — keep platform-independent
- Utility functions and constants in `src/lib/` — keep platform-independent (no React imports)
- Use CSS custom properties for all theme colors (defined in `globals.css`)
- Sanskrit text always uses `font-sanskrit` class
- Decorative elements use ॐ (Devanagari Om, U+0950) — never on footwear/inappropriate contexts
- Sacred symbols used respectfully per Hindu American Foundation guidelines

## Testing

Manual verification:
1. `/api/verse?chapter=2&verse=47` returns valid JSON
2. Navigate all 700 verses via dropdowns and prev/next
3. Sanskrit renders in Devanagari script with correct font
4. Chat streams responses about the current verse
5. Chat clears on verse change
6. Desktop: side-by-side two-panel layout with verse scrollable independently
7. Mobile (375px+): stacked layout, chat below verse, touch-friendly controls
8. Parchment texture and saffron accents visible throughout
9. Ornamental dividers render between verse sections
