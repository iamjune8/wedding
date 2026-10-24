import { describe, expect, it } from 'vitest';
import { buildCalendarInput, buildEventView, buildEventViews } from './events';
import { weddingConfig } from './wedding-config';

const SITE = 'https://nida-junaid.example';

describe('buildEventViews', () => {
  const { nikah, mehndi } = buildEventViews(weddingConfig, SITE);

  it('derives the Nikah display details and instants', () => {
    expect(nikah.title).toBe('Nikah Ceremony');
    expect(nikah.dateLabel).toBe('Friday, 30 April 2027');
    expect(nikah.timeLabel).toBe('5:30 PM IST');
    expect(nikah.timingNote).toBe('After Asr Namaaz');
    expect(nikah.startIsoWithOffset).toBe('2027-04-30T17:30:00+05:30');
    expect(nikah.startsAtMs).toBe(Date.parse('2027-04-30T12:00:00Z'));
    expect(nikah.dayEndsAtMs).toBe(Date.parse('2027-04-30T18:30:00Z'));
  });

  it('derives the Mehndi display details and instants', () => {
    expect(mehndi.title).toBe('Mehndi Ceremony');
    expect(mehndi.dateLabel).toBe('Thursday, 29 April 2027');
    expect(mehndi.timeLabel).toBe('4:00 PM IST');
    expect(mehndi.timingNote).toBeNull();
    expect(mehndi.startIsoWithOffset).toBe('2027-04-29T16:00:00+05:30');
    expect(mehndi.startsAtMs).toBe(Date.parse('2027-04-29T10:30:00Z'));
    expect(mehndi.dayEndsAtMs).toBe(Date.parse('2027-04-29T18:30:00Z'));
  });

  it('keeps the two events distinct and in the right order', () => {
    expect(mehndi.startsAtMs).toBeLessThan(nikah.startsAtMs);
    expect(nikah.startsAtMs - mehndi.startsAtMs).toBe((24 + 1.5) * 60 * 60 * 1000);
  });

  it('links Nikah directions and calendar actions', () => {
    expect(nikah.directionsUrl).toContain('https://www.google.com/maps/dir/?api=1&destination=');
    expect(nikah.calendar.path).toBe('/calendar/nida-junaid-nikah.ics');
    expect(new URL(nikah.calendar.googleUrl).searchParams.get('dates')).toBe(
      '20270430T120000Z/20270430T130000Z',
    );
  });

  it('offers no directions while the Mehndi venue is unconfirmed', () => {
    expect(mehndi.venue).toBeNull();
    expect(mehndi.directionsUrl).toBeNull();
    expect(mehndi.calendar.path).toBe('/calendar/nida-junaid-mehndi.ics');
    expect(new URL(mehndi.calendar.googleUrl).searchParams.get('dates')).toBe(
      '20270429T103000Z/20270429T113000Z',
    );
  });

  it('generates Mehndi directions automatically once a venue is configured', () => {
    const view = buildEventView(
      {
        ...weddingConfig.events.mehndi,
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
    expect(input.title).toBe('Nikah Ceremony — Nida Khatib & Junaid Shaikh');
    expect(input.location).toBe(
      'Seawood Jama Masjid, Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai, Maharashtra, India',
    );
    expect(input.description).toContain('Friday, 30 April 2027');
    expect(input.description).toContain('5:30 PM IST · After Asr Namaaz');
    expect(input.description).toContain(`Invitation: ${SITE}`);
    expect(input.url).toBe(SITE);
    expect(input.uid).toBe('nikah@nida-junaid.invitation');
    expect(input.reminder?.minutesBefore).toBe(1440);
    expect(input.endUtc.toISOString()).toBe('2027-04-30T13:00:00.000Z');
    expect(input.endLocal).toEqual({ date: '2027-04-30', time: '18:30' });
  });

  it('places the Mehndi at the family home without inventing an address', () => {
    const input = buildCalendarInput(weddingConfig.events.mehndi, weddingConfig, null);
    expect(input.title).toBe('Mehndi Ceremony — Nida Khatib & Junaid Shaikh');
    expect(input.location).toBe('At our residence');
    expect(input.description).toContain('At our residence');
    expect(input.description).not.toContain('To be announced');
    expect(input.description).not.toContain('Invitation:');
    expect(input.url).toBeUndefined();
  });

  it('still marks a venue as to be announced when neither a venue nor a home is given', () => {
    const event = { ...weddingConfig.events.mehndi, hostedAt: null };
    const input = buildCalendarInput(event, weddingConfig, null);
    expect(input.location).toBe('Venue to be announced');
    expect(input.description).toContain('To be announced (not yet confirmed)');
  });
});
