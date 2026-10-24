import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateStaticParams, GET } from './route';

const call = (file: string) =>
  GET(new Request(`https://nida-juned.example/calendar/${file}`), {
    params: Promise.resolve({ file }),
  });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('calendar file route', () => {
  it('pre-renders exactly the two event files', () => {
    expect(generateStaticParams()).toEqual([
      { file: 'nida-juned-nikah.ics' },
      { file: 'nida-juned-haldi.ics' },
    ]);
  });

  it('serves the Nikah file as an iCalendar document', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://nida-juned.example');
    const response = await call('nida-juned-nikah.ics');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/calendar; charset=utf-8');
    expect(response.headers.get('content-disposition')).toBe(
      'inline; filename="nida-juned-nikah.ics"',
    );
    const body = await response.text();
    expect(body.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(body).toContain('URL:https://nida-juned.example');
  });

  it('answers unknown files with 404', async () => {
    const response = await call('reception.ics');
    expect(response.status).toBe(404);
  });
});
