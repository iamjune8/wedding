import ICAL from 'ical.js';
import { describe, expect, it } from 'vitest';
import { buildGoogleCalendarUrl, buildIcsCalendar, type CalendarEventInput } from './calendar';

const nikahInput: CalendarEventInput = {
  uid: 'nikah-2027-04-30@nida-junaid.invitation',
  sequence: 0,
  title: 'Nikah Ceremony — Nida Khatib & Junaid Shaikh',
  description:
    'You are warmly invited to the Nikah of Nida Khatib & Junaid Shaikh.\n\nSeawood Jama Masjid',
  location:
    'Seawood Jama Masjid, Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai, Maharashtra, India',
  url: 'https://nida-junaid.example',
  timeZone: 'Asia/Kolkata',
  timeZoneLabel: 'IST',
  utcOffsetMinutes: 330,
  startLocal: { date: '2027-04-30', time: '17:30' },
  endLocal: { date: '2027-04-30', time: '18:30' },
  startUtc: new Date('2027-04-30T12:00:00Z'),
  endUtc: new Date('2027-04-30T13:00:00Z'),
  reminder: {
    minutesBefore: 1440,
    description: 'Nikah Ceremony is tomorrow at 5:30 PM IST',
  },
};

const mehndiInput: CalendarEventInput = {
  ...nikahInput,
  uid: 'mehndi-2027-04-29@nida-junaid.invitation',
  title: 'Mehndi Ceremony — Nida Khatib & Junaid Shaikh',
  description: 'Venue: To be announced (not yet confirmed).',
  location: 'Venue to be announced',
  startLocal: { date: '2027-04-29', time: '16:00' },
  endLocal: { date: '2027-04-29', time: '17:00' },
  startUtc: new Date('2027-04-29T10:30:00Z'),
  endUtc: new Date('2027-04-29T11:30:00Z'),
  reminder: { minutesBefore: 1440, description: 'Mehndi Ceremony is tomorrow at 4:00 PM IST' },
};

const generatedAt = new Date('2026-10-24T08:15:30Z');

function parseEvent(ics: string) {
  const root = new ICAL.Component(ICAL.parse(ics));
  const vtimezone = root.getFirstSubcomponent('vtimezone');
  if (!vtimezone) throw new Error('missing VTIMEZONE');
  ICAL.TimezoneService.register(new ICAL.Timezone(vtimezone));
  const vevent = root.getFirstSubcomponent('vevent');
  if (!vevent) throw new Error('missing VEVENT');
  return { root, vevent, event: new ICAL.Event(vevent) };
}

describe('buildIcsCalendar', () => {
  const ics = buildIcsCalendar(nikahInput, generatedAt);

  it('uses CRLF line endings throughout and ends with CRLF', () => {
    expect(ics.endsWith('\r\n')).toBe(true);
    expect(ics.replace(/\r\n/g, '')).not.toMatch(/[\r\n]/);
  });

  it('keeps every physical line within 75 octets', () => {
    for (const line of ics.split('\r\n')) {
      expect(Buffer.byteLength(line, 'utf8')).toBeLessThanOrEqual(75);
    }
  });

  it('contains the required calendar and event properties', () => {
    const unfolded = ics.replace(/\r\n /g, '');
    expect(unfolded).toMatch(/^BEGIN:VCALENDAR\r\n/);
    for (const line of [
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE',
      'TZID:Asia/Kolkata',
      'TZOFFSETFROM:+0530',
      'TZOFFSETTO:+0530',
      'TZNAME:IST',
      'UID:nikah-2027-04-30@nida-junaid.invitation',
      'SEQUENCE:0',
      'DTSTAMP:20261024T081530Z',
      'DTSTART;TZID=Asia/Kolkata:20270430T173000',
      'DTEND;TZID=Asia/Kolkata:20270430T183000',
      'SUMMARY:Nikah Ceremony — Nida Khatib & Junaid Shaikh',
      'LOCATION:Seawood Jama Masjid\\, Plot No. 144\\, Sector New 50\\, Seawoods\\, Nerul\\, Navi Mumbai\\, Maharashtra\\, India',
      'URL:https://nida-junaid.example',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ]) {
      expect(unfolded.split('\r\n')).toContain(line);
    }
    expect(unfolded).toMatch(/^PRODID:.+$/m);
  });

  it('parses with a standards-based iCalendar parser and resolves the correct instant', () => {
    const { root, event } = parseEvent(ics);
    expect(root.getFirstPropertyValue('version')).toBe('2.0');
    expect(event.summary).toBe('Nikah Ceremony — Nida Khatib & Junaid Shaikh');
    expect(event.location).toBe(nikahInput.location);
    expect(event.description).toBe(nikahInput.description);
    expect(event.startDate.toJSDate().toISOString()).toBe('2027-04-30T12:00:00.000Z');
    expect(event.endDate.toJSDate().toISOString()).toBe('2027-04-30T13:00:00.000Z');
  });

  it('includes a one-day reminder that parsers understand', () => {
    const { vevent } = parseEvent(ics);
    const alarm = vevent.getFirstSubcomponent('valarm');
    expect(alarm?.getFirstPropertyValue('action')).toBe('DISPLAY');
    expect(String(alarm?.getFirstPropertyValue('trigger'))).toBe('-P1D');
    expect(alarm?.getFirstPropertyValue('description')).toBe(nikahInput.reminder?.description);
  });

  it('omits the reminder and URL when they are not provided', () => {
    const minimal = buildIcsCalendar(
      { ...nikahInput, url: undefined, reminder: undefined },
      generatedAt,
    );
    expect(minimal).not.toContain('BEGIN:VALARM');
    expect(minimal).not.toContain('URL:');
  });

  it('marks the Mehndi venue as unconfirmed and keeps its own identity and time', () => {
    const mehndi = buildIcsCalendar(mehndiInput, generatedAt);
    const { event } = parseEvent(mehndi);
    expect(event.location).toBe('Venue to be announced');
    expect(event.description).toContain('not yet confirmed');
    expect(event.uid).not.toBe('nikah-2027-04-30@nida-junaid.invitation');
    expect(event.startDate.toJSDate().toISOString()).toBe('2027-04-29T10:30:00.000Z');
  });

  it('rejects an end time before the start time', () => {
    expect(() =>
      buildIcsCalendar({ ...nikahInput, endUtc: new Date('2027-04-30T11:00:00Z') }, generatedAt),
    ).toThrow(/end/i);
  });
});

describe('buildGoogleCalendarUrl', () => {
  it('builds an encoded Google Calendar template link in UTC', () => {
    const url = new URL(buildGoogleCalendarUrl(nikahInput));
    expect(url.origin).toBe('https://calendar.google.com');
    expect(url.pathname).toBe('/calendar/render');
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('text')).toBe('Nikah Ceremony — Nida Khatib & Junaid Shaikh');
    expect(url.searchParams.get('dates')).toBe('20270430T120000Z/20270430T130000Z');
    expect(url.searchParams.get('ctz')).toBe('Asia/Kolkata');
    expect(url.searchParams.get('location')).toBe(nikahInput.location);
    expect(url.searchParams.get('details')).toBe(nikahInput.description);
  });

  it('does not leave raw spaces, ampersands or newlines in the URL', () => {
    const raw = buildGoogleCalendarUrl(nikahInput);
    expect(raw).not.toMatch(/\s/);
    expect(raw.split('?')[1]?.split('&')).toHaveLength(6);
  });

  it('uses the Mehndi date and time for the Mehndi link', () => {
    const url = new URL(buildGoogleCalendarUrl(mehndiInput));
    expect(url.searchParams.get('dates')).toBe('20270429T103000Z/20270429T113000Z');
    expect(url.searchParams.get('location')).toBe('Venue to be announced');
  });
});
