import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST, resetRsvpRateLimit } from './route';

const SHEET = 'https://script.google.com/macros/s/test/exec';

const jsonRequest = (body: unknown, ip = '9.9.9.9') =>
  new Request('https://nida-junaid.example/api/rsvp', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });

const formRequest = (fields: Record<string, string>) =>
  new Request('https://nida-junaid.example/api/rsvp', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', 'x-forwarded-for': '7.7.7.7' },
    body: new URLSearchParams(fields).toString(),
  });

beforeEach(() => {
  resetRsvpRateLimit();
  vi.stubEnv('RSVP_SHEET_WEBHOOK_URL', SHEET);
  vi.stubEnv('RSVP_SHEET_SECRET', 'shh');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('POST /api/rsvp', () => {
  it('records a valid reply in the Google Sheet', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await POST(jsonRequest({ name: ' Ayesha Khan ', attending: 'yes' }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(SHEET);
    expect(JSON.parse(String(init.body))).toEqual({
      secret: 'shh',
      name: 'Ayesha Khan',
      attending: 'yes',
    });
  });

  it('explains invalid input field by field', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const response = await POST(jsonRequest({ name: '', attending: 'maybe' }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(Object.keys(body.fields)).toEqual(expect.arrayContaining(['name', 'attending']));
  });

  it('quietly drops bot submissions without touching the sheet', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const response = await POST(jsonRequest({ name: 'Bot', attending: 'yes', website: 'x' }));
    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects unreadable bodies', async () => {
    const response = await POST(
      new Request('https://x/api/rsvp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{oops',
      }),
    );
    expect(response.status).toBe(400);
  });

  it('rejects oversized bodies', async () => {
    const response = await POST(jsonRequest({ name: 'x'.repeat(5000), attending: 'yes' }));
    expect(response.status).toBe(413);
  });

  it('slows down repeated submissions from one visitor', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () => Response.json({ ok: true })),
    );
    const statuses = [];
    for (let attempt = 0; attempt < 7; attempt += 1) {
      statuses.push((await POST(jsonRequest({ name: 'Ayesha', attending: 'yes' }))).status);
    }
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[6]).toBe(429);
  });

  it('works without a shared secret (the private script link alone protects the sheet)', async () => {
    vi.stubEnv('RSVP_SHEET_SECRET', '');
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    const response = await POST(jsonRequest({ name: 'Ayesha', attending: 'no' }));
    expect(response.status).toBe(200);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ name: 'Ayesha', attending: 'no' });
  });

  it('says so clearly when the sheet has not been set up yet', async () => {
    vi.stubEnv('RSVP_SHEET_WEBHOOK_URL', '');
    const response = await POST(jsonRequest({ name: 'Ayesha', attending: 'yes' }));
    expect(response.status).toBe(503);
    expect((await response.json()).error).toBe('not-configured');
  });

  it('reports a failure if the sheet does not confirm the reply', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ ok: false })));
    const response = await POST(jsonRequest({ name: 'Ayesha', attending: 'yes' }));
    expect(response.status).toBe(502);
  });

  it('reports a failure if the sheet cannot be reached', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const response = await POST(jsonRequest({ name: 'Ayesha', attending: 'yes' }));
    expect(response.status).toBe(502);
  });

  it('works without JavaScript: a plain form post gets a thank-you page', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ ok: true })));
    const response = await POST(formRequest({ name: 'Ayesha', attending: 'yes' }));
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/html');
    expect(await response.text()).toContain('Thank you');
  });

  it('escapes names in the no-JavaScript thank-you page', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ ok: true })));
    const response = await POST(formRequest({ name: '<b>Ayesha</b>', attending: 'no' }));
    const html = await response.text();
    expect(html).not.toContain('<b>Ayesha</b>');
    expect(html).toContain('&lt;b&gt;Ayesha&lt;/b&gt;');
  });
});
