/**
 * generate-audio.ts — Pre-generate MP3 audio for all 700 Bhagavad Gita verses
 *
 * Uses ElevenLabs TTS with the eleven_multilingual_v2 model.
 *
 * Usage:
 *   npm run generate-audio          # Generate all missing audio files
 *   npm run generate-audio:status   # Show how many are cached vs missing
 */

import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// ElevenLabs SDK import
// ---------------------------------------------------------------------------
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VOICE_ID = 'ngxiIuQceji6XLqmhIBI';
const MODEL_ID = 'eleven_multilingual_v2';
const OUTPUT_FORMAT = 'mp3_44100_128';

const VOICE_SETTINGS = {
  stability: 0.65,
  similarityBoost: 0.85,
  style: 0.45,
  speed: 0.75,
};

const AUDIO_DIR = path.join(process.cwd(), 'data', 'audio');
const VERSES_DIR = path.join(process.cwd(), 'data', 'verses');

const DELAY_MS = 1500; // 1.5s between API calls (rate limiting)
const MAX_RETRIES = 3;

// 18 chapters, verse counts (must match src/lib/gita-metadata.ts)
const CHAPTERS: { chapter: number; verses: number }[] = [
  { chapter: 1, verses: 46 },
  { chapter: 2, verses: 72 },
  { chapter: 3, verses: 43 },
  { chapter: 4, verses: 42 },
  { chapter: 5, verses: 29 },
  { chapter: 6, verses: 47 },
  { chapter: 7, verses: 30 },
  { chapter: 8, verses: 28 },
  { chapter: 9, verses: 34 },
  { chapter: 10, verses: 42 },
  { chapter: 11, verses: 55 },
  { chapter: 12, verses: 20 },
  { chapter: 13, verses: 35 },
  { chapter: 14, verses: 27 },
  { chapter: 15, verses: 20 },
  { chapter: 16, verses: 24 },
  { chapter: 17, verses: 28 },
  { chapter: 18, verses: 78 },
];

const TOTAL_VERSES = 700;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readEnvLocal(key: string): string {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local not found');
  }
  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith(`${key}=`)) {
      return trimmed.slice(key.length + 1);
    }
  }
  throw new Error(`${key} not found in .env.local`);
}

function audioPath(chapter: number, verse: number): string {
  return path.join(AUDIO_DIR, `${chapter}-${verse}.mp3`);
}

function audioExists(chapter: number, verse: number): boolean {
  return fs.existsSync(audioPath(chapter, verse));
}

function versePath(chapter: number, verse: number): string {
  return path.join(VERSES_DIR, `${chapter}-${verse}.json`);
}

function readSanskritText(chapter: number, verse: number): string | null {
  const filePath = versePath(chapter, verse);
  if (!fs.existsSync(filePath)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    // Some verse files have keys with trailing spaces (e.g. "sanskrit " instead of "sanskrit")
    const sanskrit = data.sanskrit || data['sanskrit '];
    return sanskrit?.trim() || null;
  } catch {
    return null;
  }
}

function getMissingAudio(): { chapter: number; verse: number }[] {
  const missing: { chapter: number; verse: number }[] = [];
  for (const { chapter, verses } of CHAPTERS) {
    for (let v = 1; v <= verses; v++) {
      if (!audioExists(chapter, v)) {
        missing.push({ chapter, verse: v });
      }
    }
  }
  return missing;
}

function getCachedCount(): number {
  let count = 0;
  for (const { chapter, verses } of CHAPTERS) {
    for (let v = 1; v <= verses; v++) {
      if (audioExists(chapter, v)) count++;
    }
  }
  return count;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Convert a ReadableStream to a Buffer.
 */
async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

// ---------------------------------------------------------------------------
// Main: generate
// ---------------------------------------------------------------------------

async function generate() {
  const apiKey = readEnvLocal('ELEVENLABS_API_KEY');
  const client = new ElevenLabsClient({ apiKey });

  // Ensure audio directory exists
  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  const missing = getMissingAudio();
  const cached = TOTAL_VERSES - missing.length;

  console.log(`\n🔊 Audio Generation`);
  console.log(`   Cached: ${cached}/${TOTAL_VERSES}`);
  console.log(`   Missing: ${missing.length}`);

  if (missing.length === 0) {
    console.log('\n✅ All audio files already generated!');
    return;
  }

  console.log(`\n   Voice: ${VOICE_ID}`);
  console.log(`   Model: ${MODEL_ID}`);
  console.log(`   Speed: ${VOICE_SETTINGS.speed}`);
  console.log(`   Format: ${OUTPUT_FORMAT}`);
  console.log(`   Estimated time: ~${Math.ceil((missing.length * (DELAY_MS + 2000)) / 60000)} minutes\n`);

  let generated = 0;
  let errors = 0;

  for (const { chapter, verse } of missing) {
    const sanskrit = readSanskritText(chapter, verse);
    if (!sanskrit) {
      console.log(`   ⚠️  ${chapter}:${verse} — no Sanskrit text found, skipping`);
      errors++;
      continue;
    }

    let success = false;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        process.stdout.write(
          `   🎙  ${chapter}:${verse} (${cached + generated + 1}/${TOTAL_VERSES})${attempt > 1 ? ` [retry ${attempt}]` : ''}...`
        );

        const audioStream = await client.textToSpeech.convert(VOICE_ID, {
          text: sanskrit,
          modelId: MODEL_ID,
          outputFormat: OUTPUT_FORMAT,
          voiceSettings: {
            stability: VOICE_SETTINGS.stability,
            similarityBoost: VOICE_SETTINGS.similarityBoost,
            style: VOICE_SETTINGS.style,
            speed: VOICE_SETTINGS.speed,
          },
        });

        // The SDK may return a ReadableStream or a Buffer-like — handle both
        let buffer: Buffer;
        if (audioStream instanceof ReadableStream) {
          buffer = await streamToBuffer(audioStream);
        } else if (Buffer.isBuffer(audioStream)) {
          buffer = audioStream;
        } else {
          // Might be an async iterable (Node.js Readable)
          const chunks: Uint8Array[] = [];
          for await (const chunk of audioStream as AsyncIterable<Uint8Array>) {
            chunks.push(chunk);
          }
          buffer = Buffer.concat(chunks);
        }

        const filePath = audioPath(chapter, verse);
        fs.writeFileSync(filePath, buffer);

        const sizeKB = (buffer.length / 1024).toFixed(1);
        console.log(` ✅ (${sizeKB} KB)`);

        generated++;
        success = true;
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(` ❌ ${msg}`);

        if (attempt < MAX_RETRIES) {
          const backoff = attempt * 2000;
          console.log(`        Retrying in ${backoff / 1000}s...`);
          await sleep(backoff);
        }
      }
    }

    if (!success) {
      errors++;
    }

    // Rate limiting delay
    await sleep(DELAY_MS);
  }

  console.log(`\n📊 Results:`);
  console.log(`   Generated: ${generated}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total cached: ${cached + generated}/${TOTAL_VERSES}`);
}

// ---------------------------------------------------------------------------
// Main: status
// ---------------------------------------------------------------------------

function status() {
  const cached = getCachedCount();
  const missing = getMissingAudio();

  console.log(`\n🔊 Audio Generation Status`);
  console.log(`   Cached: ${cached}/${TOTAL_VERSES}`);
  console.log(`   Missing: ${missing.length}`);

  if (missing.length > 0 && missing.length <= 20) {
    console.log(`\n   Missing verses:`);
    for (const { chapter, verse } of missing) {
      console.log(`     ${chapter}:${verse}`);
    }
  } else if (missing.length > 20) {
    console.log(`\n   First 20 missing:`);
    for (const { chapter, verse } of missing.slice(0, 20)) {
      console.log(`     ${chapter}:${verse}`);
    }
    console.log(`     ... and ${missing.length - 20} more`);
  }

  // Show per-chapter breakdown
  console.log(`\n   Per chapter:`);
  for (const { chapter, verses } of CHAPTERS) {
    let chCached = 0;
    for (let v = 1; v <= verses; v++) {
      if (audioExists(chapter, v)) chCached++;
    }
    const pct = Math.round((chCached / verses) * 100);
    const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(20 - Math.round(pct / 5));
    console.log(`     Ch ${String(chapter).padStart(2)}: ${bar} ${chCached}/${verses} (${pct}%)`);
  }
}

// ---------------------------------------------------------------------------
// CLI entry
// ---------------------------------------------------------------------------

const mode = process.argv[2];

switch (mode) {
  case 'generate':
    generate().catch((err) => {
      console.error('\n❌ Fatal error:', err);
      process.exit(1);
    });
    break;
  case 'status':
    status();
    break;
  default:
    console.log('Usage: tsx scripts/generate-audio.ts <generate|status>');
    process.exit(1);
}
