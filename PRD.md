# Product Requirements Document: Bhagavad Gita AI Assistant

## 1. Problem Statement

The Bhagavad Gita contains 700 verses across 18 chapters of profound philosophical teaching. For modern learners, approaching this text can be overwhelming — the Sanskrit is unfamiliar, the concepts are dense, and the relevance to daily life isn't always obvious. Existing resources tend to be either too academic (full commentaries) or too shallow (quote cards).

There is a need for a tool that lets users explore the Gita **one verse at a time**, with an AI guide that can explain, elaborate, cross-reference, and connect the ancient wisdom to real-world situations — like having a patient, knowledgeable teacher available on demand.

## 2. Target Users

- Spiritual seekers exploring Hindu philosophy
- Students studying the Bhagavad Gita (academic or personal)
- People curious about applying ancient wisdom to modern life
- Anyone who wants to understand the Gita but finds traditional commentaries inaccessible

## 3. Product Vision

A web application with a visual identity rooted in the Bhagavad Gita's sacred tradition — aged parchment textures, saffron and deep blue accents, ornamental Sanskrit typography — paired with modern, intuitive UX.

Two core interactions:

1. **Read**: Browse the Gita verse by verse, seeing the Sanskrit text alongside clear English translations and commentary
2. **Ask**: Chat with an AI agent about the current verse — ask questions, explore meaning, get real-world applications

The experience should feel like studying an ancient manuscript with a wise, approachable guide beside you.

## 4. MVP Features

### 4.1 Verse Display

**Description**: Show a single verse with full context and metadata, presented as a sacred manuscript page.

**Requirements**:
- Display Sanskrit text in Devanagari script using Tiro Devanagari Sanskrit font, centered in a parchment-textured card with saffron left border
- Show IAST romanized transliteration in italic serif
- Provide clear English translation in Crimson Text serif
- Include 2-3 paragraph commentary explaining meaning, context, and philosophical significance
- Show metadata: chapter number, chapter name (Sanskrit + English), verse number, speaker (Krishna/Arjuna/Sanjaya/Dhritarashtra)
- Display key Sanskrit terms as pill badges with gold/saffron styling
- Ornamental dividers (gold gradient lines with ॐ or lotus symbols) between sections
- Show a skeleton loading state while verse data is being generated (~2-5 seconds)

### 4.2 Verse Navigation

**Description**: Navigate through all 700 verses across 18 chapters.

**Requirements**:
- Chapter dropdown selector (shows chapter number + Sanskrit name)
- Verse number dropdown (dynamically sized per chapter)
- Previous/Next buttons that cross chapter boundaries (e.g., after Ch.1 v.46 comes Ch.2 v.1)
- Prev disabled at Chapter 1, Verse 1; Next disabled at Chapter 18, Verse 78
- Selecting a new chapter resets to verse 1
- Touch-friendly controls: minimum 44px tap targets for mobile

### 4.3 AI Chat

**Description**: Conversational interface to ask questions about the currently displayed verse.

**Requirements**:
- Text input field with send button
- Messages stream in real-time (token by token)
- User messages displayed on the right (saffron background, white text), assistant on the left (parchment-light background, Krishna blue text)
- The AI agent is contextually grounded in the current verse — it knows what verse the user is looking at
- Agent capabilities:
  - **Explain**: Break down the verse meaning, Sanskrit terms, philosophical concepts
  - **Connect**: Reference related verses from other chapters (cited as "Chapter X, Verse Y")
  - **Apply**: Provide real-world applications — work, relationships, decision-making, mental health, personal growth
  - **Context**: Explain who is speaking, the narrative situation, and where this fits in the Gita's arc
- Chat history clears when user navigates to a new verse
- Empty state shows suggested starter prompts (e.g., "What does this verse mean in simple terms?")
- Input disabled while a response is streaming
- Error state displayed if chat request fails

### 4.4 Visual Design & Theme

**Design Philosophy**: Ancient manuscript meets clean modern UI. The app should feel sacred, warm, and authentic — not generic or corporate.

**Color Palette**:
| Color | Hex | Role |
|---|---|---|
| Saffron | `#FF902B` | Primary accent — buttons, active states, user chat bubbles. Symbolizes devotion, purification, fire. |
| Saffron Dark | `#D97706` | Hover/pressed states |
| Gold | `#D4A574` | Borders, ornamental lines, dividers. Symbolizes divine consciousness. |
| Champagne | `#F7E6CA` | Light highlights, card edges |
| Krishna Blue | `#1B3A70` | Headings, Sanskrit text, deep accents. Symbolizes infinite divine love. |
| Blue Muted | `#4A5A8C` | Secondary text |
| Parchment | `#F1E9D2` | Main background. Evokes aged manuscript paper. |
| Parchment Light | `#FCF5E5` | Card backgrounds |
| Vellum | `#EBD5B3` | Gradient endpoints, verse card backgrounds |
| Text Primary | `#2C3E50` | Body text |
| Burgundy | `#8B3A3A` | Rare ceremonial accent |

**Typography**:
- **Tiro Devanagari Sanskrit** (or Noto Serif Devanagari fallback): For all Sanskrit/Devanagari text. Designed specifically for Sanskrit literary publishing with Vedic accent support.
- **Crimson Text**: For English headings, translations, and commentary. Literary serif that evokes scholarly works.
- **Inter**: For UI elements, chat interface, navigation. Clean sans-serif for readability.

**Decorative Elements**:
- Ornamental dividers between verse sections — gold gradient lines with centered ॐ (U+0950) or lotus (🪷) symbol
- Verse cards: parchment gradient background (`#F1E9D2` → `#FFF8DC`), saffron left border (4px), subtle inner shadow
- Section labels in small caps with letter-spacing
- Subtle corner ornaments (`✦`) on verse cards at low opacity
- Parchment texture on main background using CSS gradients

**Cultural Respectfulness**:
- Sacred symbols (ॐ, lotus) used only in appropriate, respectful contexts per Hindu American Foundation guidelines
- Design serves to elevate and honor the tradition
- No kitsch or commercialization of sacred imagery

### 4.5 Layout & Responsiveness

**Desktop (1024px+)**:
- Two-panel layout — verse display on the left (~60% width), chat on the right (~40% width, fixed 440px)
- Both panels independently scrollable
- Header with app title and subtitle

**Tablet (768px - 1023px)**:
- Same two-panel layout but with tighter spacing
- Chat panel may be slightly narrower

**Mobile (375px - 767px)**:
- Single-column stacked layout — verse above, chat below
- Full-width panels
- Sticky chat input at bottom of chat section
- Touch-friendly: minimum 44px tap targets, adequate spacing between interactive elements
- Swipe-friendly navigation (future enhancement)

## 5. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Verse load time | < 5 seconds (LLM generation) |
| Chat first token | < 1 second (streaming) |
| Mobile responsive | Works on 375px+ viewports |
| Browser support | Modern browsers (Chrome, Firefox, Safari, Edge) |
| Accessibility | Semantic HTML, sufficient color contrast, keyboard navigable |
| Touch targets | Minimum 44px for mobile |

## 6. Data Source

For the MVP, all verse data is generated by the Claude LLM on demand. No external API or static dataset.

**Trade-offs**:
- Pro: Zero data setup, works immediately, rich commentary generated per-request
- Con: ~2-5 second latency per verse, potential minor inaccuracies on less popular verses, API costs per request
- Mitigation: Skeleton loader for perceived performance; low temperature (0.3) for accuracy

**Future**: Migrate to a curated static dataset or external API for instant loading and verified accuracy.

## 7. AI Agent Design

### Verse Generation Agent
- Model: Claude Sonnet
- Temperature: 0.3 (prioritize accuracy)
- Output: Strict JSON matching the `VerseData` schema
- Prompt instructs: accurate Devanagari, IAST transliteration, accessible translation, contextual commentary

### Chat Agent
- Model: Claude Sonnet
- Temperature: 0.7 (warmer, conversational)
- System prompt dynamically includes current verse (Sanskrit, translation, commentary)
- Personality: Warm, patient, encouraging. Uses simple language but includes Sanskrit terms with explanations
- Response length: 2-4 paragraphs by default
- `maxTokens: 2000` to prevent token exhaustion
- Guardrails: See Section 7.1 below

### 7.1 Security & Guardrails

**Prompt Injection Defense**:
- System prompt uses XML-tagged sections with clear instruction hierarchy
- Critical security directives marked as non-negotiable and placed at highest priority
- Agent never reveals or explains its system instructions
- Standard redirect response for all jailbreak attempt patterns ("ignore instructions", "pretend you are", "override constraints", etc.)

**Topic Scoping (Gita-only responses)**:
- System prompt explicitly constrains agent to Bhagavad Gita domain only
- Off-topic questions (politics, coding, medical advice, etc.) receive a polite redirect: "I'm designed specifically to help with Bhagavad Gita questions. Would you like to explore how the Gita's teachings relate to this topic?"
- Agent can discuss broader Hindu philosophy only when directly relevant to a Gita verse

**Hallucination Prevention**:
- System prompt instructs: "NEVER invent or guess verse references. Only cite verses you are confident exist in the Bhagavad Gita."
- When uncertain, agent must explicitly say so rather than speculate
- Verse references validated at application level: chapter must be 1-18, verse must be within the chapter's known count (using `isValidVerse()` from gita-metadata.ts)
- Agent instructed to preface uncertain claims with "I believe..." or "This may relate to..."

**Input Validation (Application Level)**:
- `src/lib/input-validation.ts` — pure TS, platform-independent
- Maximum message length: 2000 characters
- Minimum message length: 2 characters
- Pattern detection for common jailbreak phrases (reject with friendly message)
- Suspicious encoding detection (hex, base64-like patterns)
- Returns validation result with reason — invalid messages get a gentle "please ask a Gita question" response, not a raw error

**Output Controls**:
- `maxTokens: 2000` on all chat API calls — prevents runaway responses
- Response timeout: 30 seconds
- Verse reference validation on responses: extract "Chapter X, Verse Y" patterns and verify against gita-metadata

**Scholarly Neutrality**:
- Agent presents multiple traditional interpretations when relevant (Advaita, Dvaita, Vishishtadvaita)
- Does not treat any single interpretation as "correct"
- Avoids applying Gita teachings prescriptively to modern political/social situations

## 8. Architecture for Mobile Extensibility

The codebase is structured in layers to enable future React Native / Expo mobile app:

| Layer | Location | Platform Dependency | Portability |
|---|---|---|---|
| Types & Interfaces | `src/types/` | None | Fully portable |
| Business Logic | `src/lib/` | None (pure TS) | Fully portable |
| React Components | `src/components/` | React (DOM) | Adaptable to React Native |
| Pages & API Routes | `src/app/` | Next.js | Web-specific |

**Migration path to mobile**:
1. Extract `src/lib/` and `src/types/` into a shared package
2. Rewrite `src/components/` as React Native components (same props/logic)
3. Replace Next.js API routes with a standalone API server or edge functions
4. Replace Tailwind CSS with React Native styles (or NativeWind)

## 9. Out of Scope (MVP)

- User accounts / authentication
- Persistent data / database
- Bookmarks or favorites
- Daily verse feature
- Full-text search across all verses
- Audio / pronunciation
- Multiple translation sources
- Sharing / social features
- Offline support
- Progress tracking
- Dark mode / theme switching

## 10. Success Criteria

1. User can navigate to any of the 700 verses and see accurate content
2. Sanskrit text renders correctly in Devanagari with appropriate font
3. Chat provides contextually relevant, streaming responses about the current verse
4. The visual design feels sacred and authentic — not generic
5. The app is fully usable on both desktop and mobile (375px+)
6. A first-time user can start reading and asking questions with zero onboarding
7. Ornamental dividers, parchment textures, and saffron/blue accents are present throughout
8. Chat agent stays on-topic — refuses off-topic questions with polite redirect
9. Prompt injection attempts are deflected — "ignore your instructions" type prompts get standard redirect
10. Agent does not hallucinate verse references — cited verses exist in the Gita

## 11. Future Enhancements (Post-MVP)

1. **Verse caching**: Cache generated verse data in localStorage to avoid re-fetching
2. **Static dataset**: Replace LLM-generated verses with a curated, verified dataset for instant loading
3. **React Native mobile app**: Reuse `src/lib/` and `src/types/`, build native UI
4. **Bookmarks**: Save favorite verses for later study
5. **Daily verse**: Surface a new verse each day
6. **Search**: Full-text search across all verses, translations, and commentary
7. **Audio**: Sanskrit pronunciation playback
8. **Multi-commentary**: Show perspectives from different scholars (Shankaracharya, Ramanujacharya, etc.)
9. **Progress tracking**: Track which verses the user has read
10. **Dark mode**: A deep Krishna-blue dark theme
11. **Swipe navigation**: Swipe left/right to move between verses on mobile
