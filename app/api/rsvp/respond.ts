import type { RsvpFieldErrors } from '@/lib/rsvp-shared';

/** API responses follow { success, error?, fields? }. */
export const jsonReply = (
  status: number,
  body: { success: boolean; error?: string; fields?: RsvpFieldErrors },
) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** A simple page for guests whose browser submitted the form without JavaScript. */
export function htmlReply(status: number, heading: string, message: string) {
  const page = `<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#2f1a3d;color:#fbf8f1;font-family:Georgia,serif;text-align:center;padding:1.5rem}main{max-width:28rem}h1{font-weight:400;font-size:2rem;margin:0 0 1rem;color:#e2c487}p{line-height:1.6}a{color:#e2c487}</style></head><body><main><h1>${escapeHtml(heading)}</h1><p>${escapeHtml(message)}</p><p><a href="/">Return to the invitation</a></p></main></body></html>`;
  return new Response(page, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
