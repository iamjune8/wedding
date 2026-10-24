import { describe, expect, it } from 'vitest';
import { formatLongDate, formatTime12h, getWeekdayName } from './format';
import { zonedDateTimeToUtc } from './time';

describe('formatLongDate', () => {
  it('formats the Nikah date with its weekday', () => {
    expect(formatLongDate('2027-04-30')).toBe('Friday, 30 April 2027');
  });

  it('formats the Haldi date with its weekday', () => {
    expect(formatLongDate('2027-04-28')).toBe('Wednesday, 28 April 2027');
  });

  it('agrees with the platform calendar in India Standard Time', () => {
    const cases = [
      ['2027-04-30', '17:30'],
      ['2027-04-28', '16:00'],
    ] as const;
    for (const [date, time] of cases) {
      const instant = zonedDateTimeToUtc(date, time, 'Asia/Kolkata');
      const platform = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
        .formatToParts(instant)
        .filter((part) => part.type !== 'literal')
        .map((part) => part.value);
      const ours = formatLongDate(date).replace(',', '').split(' ');
      expect(ours).toEqual(platform);
    }
  });
});

describe('getWeekdayName', () => {
  it('returns the weekday for a calendar date', () => {
    expect(getWeekdayName('2027-04-30')).toBe('Friday');
    expect(getWeekdayName('2027-04-28')).toBe('Wednesday');
  });
});

describe('formatTime12h', () => {
  it.each([
    ['17:30', '5:30 PM'],
    ['16:00', '4:00 PM'],
    ['00:05', '12:05 AM'],
    ['12:00', '12:00 PM'],
    ['09:07', '9:07 AM'],
  ])('formats %s as %s', (input, expected) => {
    expect(formatTime12h(input)).toBe(expected);
  });
});
