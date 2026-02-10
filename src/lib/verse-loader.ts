import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import type { VerseData } from '@/types/verse';

const VERSES_DIR = resolve(process.cwd(), 'data', 'verses');

function versePath(chapter: number, verse: number): string {
  return resolve(VERSES_DIR, `${chapter}-${verse}.json`);
}

export function readVerseFile(chapter: number, verse: number): VerseData | null {
  try {
    const filePath = versePath(chapter, verse);
    if (!existsSync(filePath)) return null;
    const content = readFileSync(filePath, 'utf8');
    return JSON.parse(content) as VerseData;
  } catch {
    return null;
  }
}

export function writeVerseFile(chapter: number, verse: number, data: VerseData): void {
  const filePath = versePath(chapter, verse);
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export function verseFileExists(chapter: number, verse: number): boolean {
  return existsSync(versePath(chapter, verse));
}
