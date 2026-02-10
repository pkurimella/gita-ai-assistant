import { appendFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import type { TelemetryEvent, TelemetrySummary } from '@/types/telemetry';

const DATA_DIR = resolve(process.cwd(), '.data');
const TELEMETRY_FILE = resolve(DATA_DIR, 'telemetry.jsonl');

function ensureDir(): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
}

/** Append one telemetry event as a JSON line */
export function recordEvent(event: TelemetryEvent): void {
  try {
    ensureDir();
    appendFileSync(TELEMETRY_FILE, JSON.stringify(event) + '\n', 'utf8');
  } catch (err) {
    console.error('Telemetry write error:', err);
  }
}

/** Read and parse all events, optionally since a given timestamp */
export function getEvents(since?: string): TelemetryEvent[] {
  if (!existsSync(TELEMETRY_FILE)) return [];

  try {
    const content = readFileSync(TELEMETRY_FILE, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    let events = lines.map((line) => JSON.parse(line) as TelemetryEvent);

    if (since) {
      const sinceDate = new Date(since).getTime();
      events = events.filter((e) => new Date(e.timestamp).getTime() >= sinceDate);
    }

    return events;
  } catch (err) {
    console.error('Telemetry read error:', err);
    return [];
  }
}

/** Aggregate telemetry into a summary for the admin dashboard */
export function getSummary(): TelemetrySummary {
  const allEvents = getEvents();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayEvents = allEvents.filter((e) => e.timestamp >= todayStart);

  // Total tokens today by type
  let verseTokensToday = 0;
  let chatTokensToday = 0;
  for (const e of todayEvents) {
    if (e.totalTokens) {
      if (e.type === 'verse') verseTokensToday += e.totalTokens;
      else chatTokensToday += e.totalTokens;
    }
  }

  // Cache hit rate (verse requests only, all time)
  const verseEvents = allEvents.filter((e) => e.type === 'verse');
  const cacheHits = verseEvents.filter((e) => e.cacheHit === true).length;
  const cacheHitRate = verseEvents.length > 0 ? cacheHits / verseEvents.length : 0;

  // Requests per hour (last 24h)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentEvents = allEvents.filter(
    (e) => new Date(e.timestamp).getTime() >= twentyFourHoursAgo.getTime()
  );

  const hourBuckets: Record<string, number> = {};
  for (let h = 0; h < 24; h++) {
    const hourDate = new Date(now.getTime() - (23 - h) * 60 * 60 * 1000);
    const hourKey = `${hourDate.getFullYear()}-${String(hourDate.getMonth() + 1).padStart(2, '0')}-${String(hourDate.getDate()).padStart(2, '0')}T${String(hourDate.getHours()).padStart(2, '0')}`;
    hourBuckets[hourKey] = 0;
  }
  for (const e of recentEvents) {
    const d = new Date(e.timestamp);
    const hourKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}`;
    if (hourKey in hourBuckets) {
      hourBuckets[hourKey]++;
    }
  }
  const requestsPerHour = Object.entries(hourBuckets).map(([hour, count]) => ({
    hour,
    count,
  }));

  // Popular verses (top 10)
  const verseCountMap: Record<string, { chapter: number; verse: number; count: number }> = {};
  for (const e of allEvents) {
    const key = `${e.chapter}-${e.verse}`;
    if (!verseCountMap[key]) {
      verseCountMap[key] = { chapter: e.chapter, verse: e.verse, count: 0 };
    }
    verseCountMap[key].count++;
  }
  const popularVerses = Object.values(verseCountMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Recent events (last 50, newest first)
  const recent = allEvents.slice(-50).reverse();

  return {
    totalRequests: allEvents.length,
    totalRequestsToday: todayEvents.length,
    totalTokensToday: verseTokensToday + chatTokensToday,
    verseTokensToday,
    chatTokensToday,
    cacheHitRate,
    requestsPerHour,
    popularVerses,
    recentEvents: recent,
  };
}
