# Bhagavad Gita AI Assistant

An AI-powered web app that helps users understand the Bhagavad Gita one verse at a time. Browse all 700 verses with Sanskrit text, transliteration, translation, and commentary — then chat with an AI guide grounded in Gita knowledge.

## Features

- **Verse Display** — Sanskrit (Devanagari), transliteration, English translation, commentary, speaker attribution, and key terms for every verse
- **Navigation** — Browse all 18 chapters and 700 verses via dropdowns or prev/next buttons
- **AI Chat** — Ask questions about the current verse; responses stream in real-time and are scoped to Gita teachings
- **Gita-Themed UI** — Parchment textures, saffron and Krishna blue accents, ornamental dividers with Om/lotus symbols, Devanagari typography
- **Security** — Prompt injection defense, input validation, jailbreak pattern detection, output verse-reference validation

## Tech Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** with custom Gita design tokens
- **Vercel AI SDK v6** (`ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`)
- **Claude Sonnet 4.5** for verse generation and chat
- **Fonts**: Tiro Devanagari Sanskrit, Crimson Text, Inter

## Getting Started

### Prerequisites

- Node.js 20+
- An [Anthropic API key](https://console.anthropic.com/)

### Setup

```bash
git clone https://github.com/pkurimella/gita-ai-assistant.git
cd gita-ai-assistant
npm install
```

Create `.env.local` in the project root:

```
ANTHROPIC_API_KEY=your-api-key-here
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test

```bash
npm test
```

### Build

```bash
npm run build
npm start
```

## Architecture

```
src/
├── app/                    # Next.js routes (web-specific)
│   ├── api/chat/route.ts   # Streaming chat endpoint
│   ├── api/verse/route.ts  # Verse generation endpoint
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Two-panel main page
│   └── globals.css         # Gita design tokens
├── components/             # React components
│   ├── ChatPanel.tsx       # Chat with useChat + verse context
│   ├── ChatMessage.tsx     # Themed message bubbles
│   ├── VerseDisplay.tsx    # Manuscript-style verse rendering
│   ├── VerseNavigation.tsx # Chapter/verse dropdowns + nav
│   └── OrnamentalDivider.tsx
├── lib/                    # Pure TypeScript (portable)
│   ├── ai-provider.ts     # Anthropic SDK config
│   ├── gita-metadata.ts   # 18 chapters, verse counts, navigation
│   ├── system-prompts.ts  # Verse generation + chat prompts
│   ├── input-validation.ts # Jailbreak detection, length limits
│   └── output-validation.ts # Verse reference validation
└── types/
    └── verse.ts            # VerseData interface
```

The `lib/` and `types/` directories have zero platform dependencies and are designed to be shared with a future React Native mobile app.

## Design System

| Token | Color | Usage |
|-------|-------|-------|
| Saffron | `#FF902B` | Devotion, buttons, user chat bubbles |
| Krishna Blue | `#1B3A70` | Headings, assistant chat bubbles |
| Gold | `#D4A574` | Borders, dividers, accents |
| Parchment | `#F1E9D2` | Background gradient |
| Burgundy | `#8B3A3A` | Error states |

## License

MIT
