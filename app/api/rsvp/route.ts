import { createRateLimiter } from '@/lib/rate-limit';
import { parseRsvp, toSheetCell } from '@/lib/rsvp';
import type { RsvpReply } from '@/lib/rsvp-shared';
import { htmlReply, jsonReply } from './respond';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 2048;
const SHEET_TIMEOUT_MS = 10_000;
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

/** Test hook: clears the per-visitor counts. */
export const resetRsvpRateLimit = () => limiter.reset();

type BodyKind = 'json' | 'form';

const bodyKindOf = (request: Request): BodyKind =>
  (request.headers.get('content-type') ?? '').includes('application/json') ? 'json' : 'form';

const visitorOf = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  request.headers.get('x-real-ip') ||
  'unknown';

function readBody(text: string, kind: BodyKind): unknown {
  if (kind === 'form') return Object.fromEntries(new URLSearchParams(text));
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** Sends the reply to the Google Apps Script web app that appends it to the sheet. */
async function saveToSheet(reply: RsvpReply, url: string, secret: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      // text/plain avoids a CORS pre-flight that Apps Script cannot answer.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret, name: toSheetCell(reply.name), attending: reply.attending }),
      redirect: 'follow',
      signal: AbortSignal.timeout(SHEET_TIMEOUT_MS),
    });
    const result = (await response.json().catch(() => null)) as { ok?: boolean } | null;
    return response.ok && result?.ok === true;
  } catch (error) {
    console.error('RSVP could not reach the Google Sheet', error);
    return false;
  }
}

function failure(kind: BodyKind, status: number, error: string, message: string) {
  return kind === 'form'
    ? htmlReply(status, 'We could not send your reply', message)
    : jsonReply(status, { success: false, error });
}

export async function POST(request: Request) {
  const kind = bodyKindOf(request);
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return failure(kind, 413, 'too-large', 'That reply was too long. Please try again.');
  }

  const parsed = parseRsvp(readBody(text, kind));
  if (!parsed.success) {
    if (parsed.spam) return jsonReply(200, { success: true });
    return kind === 'form'
      ? htmlReply(400, 'Please check your reply', Object.values(parsed.errors).join(' '))
      : jsonReply(400, { success: false, error: 'invalid', fields: parsed.errors });
  }

  if (!limiter.allow(visitorOf(request))) {
    return failure(kind, 429, 'too-many', 'Too many replies at once. Please try again shortly.');
  }

  const url = process.env.RSVP_SHEET_WEBHOOK_URL?.trim();
  const secret = process.env.RSVP_SHEET_SECRET?.trim();
  if (!url || !secret) {
    return failure(kind, 503, 'not-configured', 'Replies are not open just yet. Please try later.');
  }

  if (!(await saveToSheet(parsed.data, url, secret))) {
    return failure(kind, 502, 'unavailable', 'Something went wrong. Please try again in a moment.');
  }

  return kind === 'form'
    ? htmlReply(200, `Thank you, ${parsed.data.name}`, 'Your reply has been received.')
    : jsonReply(200, { success: true });
}
