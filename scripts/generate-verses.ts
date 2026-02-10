/**
 * Bhagavad Gita Verse Generator
 *
 * Uses the Anthropic Message Batches API for 50% cost savings.
 *
 * Modes:
 *   submit      — Create a batch of all 700 verse requests (skips cached)
 *   status      — Check batch processing status
 *   collect     — Download results and save verse JSON files
 *   sequential  — Fallback: generate one-by-one (full price, immediate)
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';

// ---------------------------------------------------------------------------
// Inline copies of functions from src/lib (tsx can't resolve @/ aliases)
// ---------------------------------------------------------------------------

interface ChapterInfo {
  number: number;
  name: string;
  meaning: string;
  verseCount: number;
}

const CHAPTERS: ChapterInfo[] = [
  { number: 1, name: 'Arjuna Vishada Yoga', meaning: "Arjuna's Dilemma", verseCount: 46 },
  { number: 2, name: 'Sankhya Yoga', meaning: 'Transcendental Knowledge', verseCount: 72 },
  { number: 3, name: 'Karma Yoga', meaning: 'The Yoga of Action', verseCount: 43 },
  { number: 4, name: 'Jnana Karma Sanyasa Yoga', meaning: 'The Yoga of Knowledge and Renunciation of Action', verseCount: 42 },
  { number: 5, name: 'Karma Sanyasa Yoga', meaning: 'The Yoga of Renunciation', verseCount: 29 },
  { number: 6, name: 'Dhyana Yoga', meaning: 'The Yoga of Meditation', verseCount: 47 },
  { number: 7, name: 'Jnana Vijnana Yoga', meaning: 'The Yoga of Knowledge and Wisdom', verseCount: 30 },
  { number: 8, name: 'Akshara Brahma Yoga', meaning: 'The Yoga of the Imperishable Absolute', verseCount: 28 },
  { number: 9, name: 'Raja Vidya Raja Guhya Yoga', meaning: 'The Yoga of Royal Knowledge and Royal Secret', verseCount: 34 },
  { number: 10, name: 'Vibhuti Yoga', meaning: 'The Yoga of Divine Glories', verseCount: 42 },
  { number: 11, name: 'Vishwarupa Darshana Yoga', meaning: 'The Yoga of the Universal Form', verseCount: 55 },
  { number: 12, name: 'Bhakti Yoga', meaning: 'The Yoga of Devotion', verseCount: 20 },
  { number: 13, name: 'Kshetra Kshetragna Vibhaga Yoga', meaning: 'The Yoga of the Field and the Knower', verseCount: 35 },
  { number: 14, name: 'Gunatraya Vibhaga Yoga', meaning: 'The Yoga of the Three Gunas', verseCount: 27 },
  { number: 15, name: 'Purushottama Yoga', meaning: 'The Yoga of the Supreme Person', verseCount: 20 },
  { number: 16, name: 'Daivasura Sampad Vibhaga Yoga', meaning: 'The Yoga of Divine and Demoniac Natures', verseCount: 24 },
  { number: 17, name: 'Shraddhatraya Vibhaga Yoga', meaning: 'The Yoga of the Three Divisions of Faith', verseCount: 28 },
  { number: 18, name: 'Moksha Sanyasa Yoga', meaning: 'The Yoga of Liberation through Renunciation', verseCount: 78 },
];

function getVerseGenerationPrompt(chapter: number, verse: number): string {
  return `You are a Bhagavad Gita scholar. Generate the verse data for Chapter ${chapter}, Verse ${verse} of the Bhagavad Gita.

Return ONLY a valid JSON object with this exact structure (no markdown, no code fences, no extra text):
{
  "chapter": ${chapter},
  "verse": ${verse},
  "chapterName": "<Sanskrit chapter name>",
  "chapterMeaning": "<English meaning of chapter name>",
  "sanskrit": "<verse in Devanagari script>",
  "transliteration": "<IAST romanized transliteration>",
  "translation": "<clear English translation>",
  "commentary": "<2-3 paragraph commentary explaining the meaning, context within the chapter, and philosophical significance>",
  "speaker": "<who speaks this verse: Krishna, Arjuna, Sanjaya, or Dhritarashtra>",
  "keyTerms": ["<important Sanskrit term 1>", "<important Sanskrit term 2>"]
}

Requirements:
- The Sanskrit text must be accurate Devanagari
- The transliteration must use standard IAST romanization
- The translation should be clear and accessible to modern readers
- The commentary should explain the verse's meaning in the context of the chapter and the overall Gita
- Include 2-5 key Sanskrit terms that are important for understanding this verse
- Return ONLY the JSON object, nothing else`;
}

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT = resolve(process.cwd());
const VERSES_DIR = resolve(ROOT, 'data', 'verses');
const DATA_DIR = resolve(ROOT, '.data');
const BATCH_ID_FILE = resolve(DATA_DIR, 'batch-id.txt');
const MODEL = 'claude-sonnet-4-5-20250929';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readEnvLocal(key: string): string {
  try {
    const envPath = resolve(ROOT, '.env.local');
    const content = readFileSync(envPath, 'utf8');
    const match = content.match(new RegExp(`^${key}=(.+)$`, 'm'));
    return match?.[1]?.trim() || '';
  } catch {
    return '';
  }
}

function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY || readEnvLocal('ANTHROPIC_API_KEY');
  if (!key) {
    console.error('ERROR: No ANTHROPIC_API_KEY found in env or .env.local');
    process.exit(1);
  }
  return key;
}

function versePath(ch: number, v: number): string {
  return resolve(VERSES_DIR, `${ch}-${v}.json`);
}

function verseExists(ch: number, v: number): boolean {
  return existsSync(versePath(ch, v));
}

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}

function saveVerse(ch: number, v: number, data: object): void {
  const filePath = versePath(ch, v);
  ensureDir(dirname(filePath));
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/** All (chapter, verse) pairs not yet cached */
function getMissingVerses(): { chapter: number; verse: number }[] {
  const missing: { chapter: number; verse: number }[] = [];
  for (const ch of CHAPTERS) {
    for (let v = 1; v <= ch.verseCount; v++) {
      if (!verseExists(ch.number, v)) {
        missing.push({ chapter: ch.number, verse: v });
      }
    }
  }
  return missing;
}

function allVerses(): { chapter: number; verse: number }[] {
  const all: { chapter: number; verse: number }[] = [];
  for (const ch of CHAPTERS) {
    for (let v = 1; v <= ch.verseCount; v++) {
      all.push({ chapter: ch.number, verse: v });
    }
  }
  return all;
}

// ---------------------------------------------------------------------------
// Mode: submit — Create a Message Batch
// ---------------------------------------------------------------------------

async function submitBatch() {
  const missing = getMissingVerses();
  const total = allVerses().length;
  const cached = total - missing.length;

  console.log(`\nTotal verses: ${total}`);
  console.log(`Already cached: ${cached}`);
  console.log(`To generate: ${missing.length}\n`);

  if (missing.length === 0) {
    console.log('All verses are already cached! Nothing to do.');
    return;
  }

  const client = new Anthropic({ apiKey: getApiKey() });

  const requests = missing.map(({ chapter, verse }) => ({
    custom_id: `ch${chapter}-v${verse}`,
    params: {
      model: MODEL,
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        { role: 'user' as const, content: getVerseGenerationPrompt(chapter, verse) },
      ],
    },
  }));

  console.log(`Submitting batch of ${requests.length} requests...`);
  const batch = await client.messages.batches.create({ requests });

  ensureDir(DATA_DIR);
  writeFileSync(BATCH_ID_FILE, batch.id, 'utf8');

  console.log(`\nBatch submitted successfully!`);
  console.log(`Batch ID: ${batch.id}`);
  console.log(`Status: ${batch.processing_status}`);
  console.log(`\nSaved batch ID to ${BATCH_ID_FILE}`);
  console.log(`\nNext steps:`);
  console.log(`  npm run generate-verses:status   — check progress`);
  console.log(`  npm run generate-verses:collect   — download results when done`);
}

// ---------------------------------------------------------------------------
// Mode: status — Check batch progress
// ---------------------------------------------------------------------------

async function checkStatus() {
  if (!existsSync(BATCH_ID_FILE)) {
    console.error('No batch ID found. Run "npm run generate-verses" first to submit a batch.');
    process.exit(1);
  }

  const batchId = readFileSync(BATCH_ID_FILE, 'utf8').trim();
  const client = new Anthropic({ apiKey: getApiKey() });

  console.log(`Checking batch: ${batchId}\n`);
  const batch = await client.messages.batches.retrieve(batchId);

  console.log(`Status: ${batch.processing_status}`);
  console.log(`Request counts:`);
  console.log(`  Processing: ${batch.request_counts.processing}`);
  console.log(`  Succeeded:  ${batch.request_counts.succeeded}`);
  console.log(`  Errored:    ${batch.request_counts.errored}`);
  console.log(`  Canceled:   ${batch.request_counts.canceled}`);
  console.log(`  Expired:    ${batch.request_counts.expired}`);
  console.log(`Created: ${batch.created_at}`);
  if (batch.ended_at) console.log(`Ended:   ${batch.ended_at}`);

  if (batch.processing_status === 'ended') {
    console.log(`\nBatch is complete! Run: npm run generate-verses:collect`);
  } else {
    console.log(`\nBatch is still processing. Check again later.`);
  }
}

// ---------------------------------------------------------------------------
// Mode: collect — Download results and save verse files
// ---------------------------------------------------------------------------

async function collectResults() {
  if (!existsSync(BATCH_ID_FILE)) {
    console.error('No batch ID found. Run "npm run generate-verses" first to submit a batch.');
    process.exit(1);
  }

  const batchId = readFileSync(BATCH_ID_FILE, 'utf8').trim();
  const client = new Anthropic({ apiKey: getApiKey() });

  // First check if batch is done
  const batch = await client.messages.batches.retrieve(batchId);
  if (batch.processing_status !== 'ended') {
    console.error(`Batch is not yet complete. Status: ${batch.processing_status}`);
    console.error(`Run "npm run generate-verses:status" to check progress.`);
    process.exit(1);
  }

  console.log(`Collecting results for batch: ${batchId}\n`);

  let successCount = 0;
  let errorCount = 0;

  const resultsStream = await client.messages.batches.results(batchId);
  for await (const result of resultsStream) {
    const customId = result.custom_id;
    const match = customId.match(/^ch(\d+)-v(\d+)$/);
    if (!match) {
      console.warn(`  Skipping unknown custom_id: ${customId}`);
      errorCount++;
      continue;
    }

    const ch = parseInt(match[1], 10);
    const v = parseInt(match[2], 10);

    if (result.result.type === 'succeeded') {
      try {
        const message = result.result.message;
        const textContent = message.content.find(
          (block: { type: string }) => block.type === 'text'
        );
        if (!textContent || textContent.type !== 'text') {
          throw new Error('No text content in response');
        }
        const jsonText = cleanJsonResponse((textContent as { type: 'text'; text: string }).text);
        const verseData = JSON.parse(jsonText);
        saveVerse(ch, v, verseData);
        successCount++;
        console.log(`  [${successCount}] Saved Ch.${ch} V.${v}`);
      } catch (err) {
        console.error(`  ERROR parsing Ch.${ch} V.${v}: ${err}`);
        errorCount++;
      }
    } else {
      console.error(`  FAILED Ch.${ch} V.${v}: ${result.result.type}`);
      errorCount++;
    }
  }

  console.log(`\nCollection complete!`);
  console.log(`  Succeeded: ${successCount}`);
  console.log(`  Errors:    ${errorCount}`);

  const remaining = getMissingVerses().length;
  if (remaining > 0) {
    console.log(`  Still missing: ${remaining} verses`);
    console.log(`  Re-run "npm run generate-verses" to submit another batch for missing verses.`);
  } else {
    console.log(`  All 700 verses are now cached!`);
  }
}

// ---------------------------------------------------------------------------
// Mode: sequential — Fallback one-by-one generation
// ---------------------------------------------------------------------------

async function sequentialGenerate() {
  const missing = getMissingVerses();
  const total = allVerses().length;
  const cached = total - missing.length;

  console.log(`\nTotal verses: ${total}`);
  console.log(`Already cached: ${cached}`);
  console.log(`To generate: ${missing.length}\n`);

  if (missing.length === 0) {
    console.log('All verses are already cached! Nothing to do.');
    return;
  }

  const client = new Anthropic({ apiKey: getApiKey() });
  let generated = 0;
  let errors = 0;

  for (const { chapter, verse } of missing) {
    const label = `[${generated + errors + 1}/${missing.length}] Ch.${chapter} V.${verse}`;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`  ${label} (attempt ${attempt})...`);
        const message = await client.messages.create({
          model: MODEL,
          max_tokens: 4096,
          temperature: 0.3,
          messages: [
            { role: 'user', content: getVerseGenerationPrompt(chapter, verse) },
          ],
        });

        const textContent = message.content.find((block) => block.type === 'text');
        if (!textContent || textContent.type !== 'text') {
          throw new Error('No text content in response');
        }

        const jsonText = cleanJsonResponse(textContent.text);
        const verseData = JSON.parse(jsonText);
        saveVerse(chapter, verse, verseData);
        generated++;
        console.log(`  ${label} DONE`);
        break;
      } catch (err) {
        console.error(`  ${label} attempt ${attempt} FAILED: ${err}`);
        if (attempt === 3) {
          errors++;
          console.error(`  ${label} GIVING UP after 3 attempts`);
        }
      }
    }

    // 1.2s delay between API calls to avoid rate limits
    await new Promise((r) => setTimeout(r, 1200));
  }

  console.log(`\nSequential generation complete!`);
  console.log(`  Generated: ${generated}`);
  console.log(`  Errors:    ${errors}`);
}

// ---------------------------------------------------------------------------
// Main — Route to the correct mode
// ---------------------------------------------------------------------------

const mode = process.argv[2] || 'submit';

switch (mode) {
  case 'submit':
    submitBatch().catch(console.error);
    break;
  case 'status':
    checkStatus().catch(console.error);
    break;
  case 'collect':
    collectResults().catch(console.error);
    break;
  case 'sequential':
    sequentialGenerate().catch(console.error);
    break;
  default:
    console.error(`Unknown mode: ${mode}`);
    console.error('Usage: tsx scripts/generate-verses.ts [submit|status|collect|sequential]');
    process.exit(1);
}
