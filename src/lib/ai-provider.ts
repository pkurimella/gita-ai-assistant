import { createAnthropic } from '@ai-sdk/anthropic';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function readEnvLocal(key: string): string {
  try {
    const envPath = resolve(process.cwd(), '.env.local');
    const content = readFileSync(envPath, 'utf8');
    const match = content.match(new RegExp(`^${key}=(.+)$`, 'm'));
    return match?.[1]?.trim() || '';
  } catch {
    return '';
  }
}

function loadEnvKey(): string {
  return process.env.ANTHROPIC_API_KEY || readEnvLocal('ANTHROPIC_API_KEY');
}

function loadBaseURL(): string {
  // Check .env.local first (system env may have incorrect value without /v1)
  const fromFile = readEnvLocal('ANTHROPIC_BASE_URL');
  if (fromFile) return fromFile;
  const fromEnv = process.env.ANTHROPIC_BASE_URL;
  if (fromEnv) return fromEnv;
  return 'https://api.anthropic.com/v1';
}

export const anthropic = createAnthropic({
  apiKey: loadEnvKey(),
  baseURL: loadBaseURL(),
});
