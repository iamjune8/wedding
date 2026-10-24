import { expect, test } from '@playwright/test';
import ICAL from 'ical.js';
import { openStill, SITE_URL } from './helpers';

function parse(ics: string) {
  const root = new ICAL.Component(ICAL.parse(ics));
  const vtimezone = root.getFirstSubcomponent('vtimezone');
  if (vtimezone) ICAL.TimezoneService.register(new ICAL.Timezone(vtimezone));
  const vevent = root.getFirstSubcomponent('vevent');
  if (!vevent) throw new Error('No VEVENT in calendar file');
  return { vevent, event: new ICAL.Event(vevent) };
}

const files = [
  {
    file: 'nida-junaid-nikah.ics',
    summary: 'Nikah Ceremony — Nida Khatib & Junaid Shaikh',
    start: '2027-04-30T12:00:00.000Z',
    location:
      'Seawood Jama Masjid, Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai, Maharashtra, India',
  },
  {
    file: 'nida-junaid-mehndi.ics',
    summary: 'Mehndi Ceremony — Nida Khatib & Junaid Shaikh',
    start: '2027-04-29T10:30:00.000Z',
    location: 'At our residence',
  },
] as const;

test.describe('calendar files', () => {
  for (const expected of files) {
    test(`${expected.file} is a valid iCalendar file with the right details`, async ({
      request,
    }) => {
      const response = await request.get(`/calendar/${expected.file}`);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toBe('text/calendar; charset=utf-8');
      expect(response.headers()['content-disposition']).toBe(`inline; filename="${expected.file}"`);

      const ics = await response.text();
      expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
      for (const line of ics.split('\r\n')) {
        expect(Buffer.byteLength(line, 'utf8')).toBeLessThanOrEqual(75);
      }

      const { vevent, event } = parse(ics);
      expect(event.summary).toBe(expected.summary);
      expect(event.location).toBe(expected.location);
      expect(event.startDate.toJSDate().toISOString()).toBe(expected.start);
      expect(event.endDate.toJSDate().getTime() - event.startDate.toJSDate().getTime()).toBe(
        60 * 60 * 1000,
      );
      expect(String(vevent.getFirstSubcomponent('valarm')?.getFirstPropertyValue('trigger'))).toBe(
        '-P1D',
      );
      expect(vevent.getFirstPropertyValue('url')).toBe(SITE_URL);
    });
  }

  test('the two files describe different events', async ({ request }) => {
    const [nikah, mehndi] = await Promise.all(
      files.map(async ({ file }) => parse(await (await request.get(`/calendar/${file}`)).text())),
    );
    expect(nikah?.event.uid).not.toBe(mehndi?.event.uid);
  });

  test('unknown calendar files return 404', async ({ request }) => {
    expect((await request.get('/calendar/reception.ics')).status()).toBe(404);
  });
});

test.describe('Add to Calendar', () => {
  test('opens both options from the Nikah section and links Google Calendar correctly', async ({
    page,
  }) => {
    await openStill(page);
    const nikah = page.getByRole('region', { name: 'The Day Our Forever Begins' });
    await nikah.getByText('Add to Calendar').click();

    const apple = nikah.getByRole('link', { name: /apple calendar/i });
    const google = nikah.getByRole('link', { name: /google calendar/i });
    await expect(apple).toBeVisible();
    await expect(google).toBeVisible();
    await expect(apple).toHaveAttribute('href', '/calendar/nida-junaid-nikah.ics');
    await expect(nikah.getByText(/Reminders depend on your calendar app/)).toBeVisible();

    const url = new URL((await google.getAttribute('href')) ?? '');
    expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render');
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('text')).toBe('Nikah Ceremony — Nida Khatib & Junaid Shaikh');
    expect(url.searchParams.get('dates')).toBe('20270430T120000Z/20270430T130000Z');
    expect(url.searchParams.get('ctz')).toBe('Asia/Kolkata');
    await expect(google).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('the Mehndi Google Calendar link uses the Mehndi time and the home venue', async ({
    page,
  }) => {
    await openStill(page);
    const mehndi = page.getByRole('region', { name: 'A Little Colour, A Lot of Love' });
    await mehndi.getByText('Add to Calendar').click();
    const url = new URL(
      (await mehndi.getByRole('link', { name: /google calendar/i }).getAttribute('href')) ?? '',
    );
    expect(url.searchParams.get('dates')).toBe('20270429T103000Z/20270429T113000Z');
    expect(url.searchParams.get('location')).toBe('At our residence');
    expect(url.searchParams.get('details')).toContain('At our residence');
    expect(url.searchParams.get('details')).not.toContain('not yet confirmed');
  });

  test('desktop browsers save the .ics file with its meaningful name', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Download behaviour is desktop-only');
    await openStill(page);
    const nikah = page.getByRole('region', { name: 'The Day Our Forever Begins' });
    await nikah.getByText('Add to Calendar').click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      nikah.getByRole('link', { name: /apple calendar/i }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('nida-junaid-nikah.ics');
  });
});
