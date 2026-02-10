import { readFileSync } from 'fs';
import { resolve } from 'path';
import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Password validation
// ---------------------------------------------------------------------------

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

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || readEnvLocal('ADMIN_PASSWORD');
}

export function validatePassword(password: string): boolean {
  const expected = getAdminPassword();
  if (!expected) return false;
  return password === expected;
}

// ---------------------------------------------------------------------------
// In-memory session store (lost on restart — acceptable for admin)
// ---------------------------------------------------------------------------

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface SessionEntry {
  expiresAt: number;
}

const sessions = new Map<string, SessionEntry>();

export function createSession(): string {
  // Clean expired sessions
  const now = Date.now();
  for (const [token, entry] of sessions) {
    if (entry.expiresAt <= now) sessions.delete(token);
  }

  const token = randomUUID();
  sessions.set(token, { expiresAt: now + SESSION_TTL_MS });
  return token;
}

export function validateSession(token: string): boolean {
  const entry = sessions.get(token);
  if (!entry) return false;
  if (entry.expiresAt <= Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}
