import { describe, expect, it } from 'vitest';
import { buildCalendarInput, buildEventView, buildEventViews } from './events';
import { weddingConfig } from './wedding-config';

const SITE = 'https://nida-juned.example';

describe('buildEventViews', () => {
  const { nikah, haldi } = buildEventViews(weddingConfig, SITE);

  it('derives the Nikah display details and instants', () => {
    expect(nikah.title).toBe('Nikah Ceremony');
    expect(nikah.dateLabel).toBe('Friday, 30 April 2027');
    expect(nikah.timeLabel).toBe('5:30 PM IST');
    expect(nikah.timingNote).toBe('After Asr Namaaz');
    expect(nikah.startIsoWithOffset).toBe('2027-04-30T17:30:00+05:30');
    expect(nikah.startsAtMs).toBe(Date.parse('2027-04-30T12:00:00Z'));
    expect(nikah.dayEndsAtMs).toBe(Date.parse('2027-04-30T18:30:00Z'));
  });

  it('derives the Haldi display details and instants', () => {
    expect(haldi.title).toBe('Haldi Ceremony');
    expect(haldi.dateLabel).toBe('Wednesday, 28 April 2027');
    expect(haldi.timeLabel).toBe('4:00 PM IST');
    expect(haldi.timingNote).toBeNull();
    expect(haldi.startIsoWithOffset).toBe('2027-04-28T16:00:00+05:30');
    expect(haldi.startsAtMs).toBe(Date.parse('2027-04-28T10:30:00Z'));
    expect(haldi.dayEndsAtMs).toBe(Date.parse('2027-04-28T18:30:00Z'));
  });

  it('keeps the two events distinct and in the right order', () => {
    expect(haldi.startsAtMs).toBeLessThan(nikah.startsAtMs);
    expect(nikah.startsAtMs - haldi.startsAtMs).toBe((2 * 24 + 1.5) * 60 * 60 * 1000);
  });

  it('links Nikah directions and calendar actions', () => {
    expect(nikah.directionsUrl).toContain('https://www.google.com/maps/dir/?api=1&destination=');
    expect(nikah.calendar.path).toBe('/calendar/nida-juned-nikah.ics');
    expect(new URL(nikah.calendar.googleUrl).searchParams.get('dates')).toBe(
      '20270430T120000Z/20270430T130000Z',
    );
  });

  it('offers no directions while the Haldi venue is unconfirmed', () => {
    expect(haldi.venue).toBeNull();
    expect(haldi.directionsUrl).toBeNull();
    expect(haldi.calendar.path).toBe('/calendar/nida-juned-haldi.ics');
    expect(new URL(haldi.calendar.googleUrl).searchParams.get('dates')).toBe(
      '20270428T103000Z/20270428T113000Z',
    );
  });

  it('generates Haldi directions automatically once a venue is configured', () => {
    const view = buildEventView(
      {
        ...weddingConfig.events.haldi,
        venue: { name: 'Example Hall', address: 'Example Road, Mumbai', shortAddress: 'Mumbai' },
      },
      weddingConfig,
      SITE,
    );
    expect(view.directionsUrl).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Example%20Hall%2C%20Example%20Road%2C%20Mumbai',
    );
  });
});

describe('buildCalendarInput', () => {
  it('describes the Nikah with its venue and the invitation link', () => {
    const input = buildCalendarInput(weddingConfig.events.nikah, weddingConfig, SITE);
    expect(input.title).toBe('Nikah Ceremony — Nida Khatib & Juned Shaikh');
    expect(input.location).toBe(
      'Seawood Jama Masjid, Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai, Maharashtra, India',
    );
    expect(input.description).toContain('Friday, 30 April 2027');
    expect(input.description).toContain('5:30 PM IST · After Asr Namaaz');
    expect(input.description).toContain(`Invitation: ${SITE}`);
    expect(input.url).toBe(SITE);
    expect(input.uid).toBe('nikah@nida-juned.invitation');
    expect(input.reminder?.minutesBefore).toBe(1440);
    expect(input.endUtc.toISOString()).toBe('2027-04-30T13:00:00.000Z');
    expect(input.endLocal).toEqual({ date: '2027-04-30', time: '18:30' });
  });

  it('clearly marks the Haldi venue as not yet confirmed', () => {
    const input = buildCalendarInput(weddingConfig.events.haldi, weddingConfig, null);
    expect(input.title).toBe('Haldi Ceremony — Nida Khatib & Juned Shaikh');
    expect(input.location).toBe('Venue to be announced');
    expect(input.description).toContain('To be announced (not yet confirmed)');
    expect(input.description).not.toContain('Invitation:');
    expect(input.url).toBeUndefined();
  });
});
