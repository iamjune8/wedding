import { afterEach, describe, expect, it } from 'vitest';
import {
  addDaysToIsoDate,
  formatUtcOffset,
  getTimeZoneOffsetMinutes,
  getZonedParts,
  isValidTimeZone,
  parseIsoDate,
  parseTime24,
  zonedDateTimeToUtc,
} from './time';

const originalTz = process.env.TZ;

afterEach(() => {
  process.env.TZ = originalTz;
});

describe('zonedDateTimeToUtc', () => {
  it('resolves the Nikah start (30 Apr 2027, 17:30 IST) to 12:00 UTC', () => {
    expect(zonedDateTimeToUtc('2027-04-30', '17:30', 'Asia/Kolkata').toISOString()).toBe(
      '2027-04-30T12:00:00.000Z',
    );
  });

  it('resolves the Mehndi start (29 Apr 2027, 16:00 IST) to 10:30 UTC', () => {
    expect(zonedDateTimeToUtc('2027-04-29', '16:00', 'Asia/Kolkata').toISOString()).toBe(
      '2027-04-29T10:30:00.000Z',
    );
  });

  it('does not depend on the time zone of the machine running it', () => {
    process.env.TZ = 'America/Los_Angeles';
    expect(zonedDateTimeToUtc('2027-04-30', '17:30', 'Asia/Kolkata').toISOString()).toBe(
      '2027-04-30T12:00:00.000Z',
    );
    process.env.TZ = 'Pacific/Kiritimati';
    expect(zonedDateTimeToUtc('2027-04-30', '17:30', 'Asia/Kolkata').toISOString()).toBe(
      '2027-04-30T12:00:00.000Z',
    );
  });

  it('handles zones with daylight saving time', () => {
    expect(zonedDateTimeToUtc('2027-03-14', '03:30', 'America/New_York').toISOString()).toBe(
      '2027-03-14T07:30:00.000Z',
    );
    expect(zonedDateTimeToUtc('2027-01-14', '03:30', 'America/New_York').toISOString()).toBe(
      '2027-01-14T08:30:00.000Z',
    );
  });

  it('rejects a local time that does not exist (skipped by a DST change)', () => {
    expect(() => zonedDateTimeToUtc('2027-03-14', '02:30', 'America/New_York')).toThrow(
      /does not exist/,
    );
  });

  it('rejects an unknown time zone', () => {
    expect(() => zonedDateTimeToUtc('2027-04-30', '17:30', 'Mars/Olympus_Mons')).toThrow(
      /time zone/i,
    );
  });
});

describe('getZonedParts', () => {
  it('reads wall-clock parts of an instant in a given zone', () => {
    const parts = getZonedParts(new Date('2027-04-30T12:00:00Z'), 'Asia/Kolkata');
    expect(parts).toEqual({ year: 2027, month: 4, day: 30, hour: 17, minute: 30, second: 0 });
  });

  it('reports midnight as hour 0, not 24', () => {
    const parts = getZonedParts(new Date('2027-04-30T18:30:00Z'), 'Asia/Kolkata');
    expect(parts).toMatchObject({ year: 2027, month: 5, day: 1, hour: 0, minute: 0 });
  });
});

describe('getTimeZoneOffsetMinutes', () => {
  it('returns +330 minutes for India Standard Time', () => {
    expect(getTimeZoneOffsetMinutes(new Date('2027-04-30T12:00:00Z'), 'Asia/Kolkata')).toBe(330);
  });

  it('returns negative offsets west of UTC', () => {
    expect(getTimeZoneOffsetMinutes(new Date('2027-07-01T12:00:00Z'), 'America/New_York')).toBe(
      -240,
    );
  });
});

describe('formatUtcOffset', () => {
  it.each([
    [330, '+05:30'],
    [-240, '-04:00'],
    [0, '+00:00'],
    [345, '+05:45'],
  ])('formats %i minutes as %s', (minutes, expected) => {
    expect(formatUtcOffset(minutes)).toBe(expected);
  });
});

describe('parseIsoDate', () => {
  it('parses a valid calendar date', () => {
    expect(parseIsoDate('2027-04-30')).toEqual({ year: 2027, month: 4, day: 30 });
  });

  it.each(['2027-02-30', '2027-4-30', '30-04-2027', '2027-13-01', ''])('rejects %s', (value) => {
    expect(() => parseIsoDate(value)).toThrow(/date/i);
  });
});

describe('parseTime24', () => {
  it('parses a valid 24-hour time', () => {
    expect(parseTime24('17:30')).toEqual({ hour: 17, minute: 30 });
  });

  it.each(['24:00', '7:30', '17:60', '5:30 PM', ''])('rejects %s', (value) => {
    expect(() => parseTime24(value)).toThrow(/time/i);
  });
});

describe('addDaysToIsoDate', () => {
  it('moves across month and year boundaries', () => {
    expect(addDaysToIsoDate('2027-04-30', 1)).toBe('2027-05-01');
    expect(addDaysToIsoDate('2027-12-31', 1)).toBe('2028-01-01');
    expect(addDaysToIsoDate('2027-03-01', -1)).toBe('2027-02-28');
  });
});

describe('isValidTimeZone', () => {
  it('accepts IANA zones and rejects unknown ones', () => {
    expect(isValidTimeZone('Asia/Kolkata')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus_Mons')).toBe(false);
    expect(isValidTimeZone('')).toBe(false);
  });
});
