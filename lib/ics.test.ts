import { describe, expect, it } from 'vitest';
import {
  escapeIcsText,
  foldIcsLine,
  formatIcsDuration,
  formatIcsLocalDateTime,
  formatIcsUtcDateTime,
} from './ics';

const octets = (value: string) => Buffer.byteLength(value, 'utf8');
const unfold = (value: string) => value.replace(/\r\n /g, '');

describe('escapeIcsText', () => {
  it('escapes backslashes, semicolons, commas and newlines (RFC 5545 §3.3.11)', () => {
    expect(escapeIcsText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
  });

  it('normalises Windows and old Mac newlines', () => {
    expect(escapeIcsText('one\r\ntwo\rthree')).toBe('one\\ntwo\\nthree');
  });

  it('leaves plain text untouched', () => {
    expect(escapeIcsText('Seawood Jama Masjid')).toBe('Seawood Jama Masjid');
  });
});

describe('foldIcsLine', () => {
  it('does not fold lines of 75 octets or fewer', () => {
    const line = `SUMMARY:${'x'.repeat(67)}`;
    expect(octets(line)).toBe(75);
    expect(foldIcsLine(line)).toBe(line);
  });

  it('folds long lines so no physical line exceeds 75 octets', () => {
    const line = `DESCRIPTION:${'abcdefghij'.repeat(20)}`;
    const folded = foldIcsLine(line);
    for (const physical of folded.split('\r\n')) {
      expect(octets(physical)).toBeLessThanOrEqual(75);
    }
    expect(
      folded
        .split('\r\n')
        .slice(1)
        .every((part) => part.startsWith(' ')),
    ).toBe(true);
    expect(unfold(folded)).toBe(line);
  });

  it('never splits a multi-byte character across lines', () => {
    const line = `SUMMARY:${'Nikah — Nida & Junaid · '.repeat(8)}بِسْمِ ٱللَّهِ`;
    const folded = foldIcsLine(line);
    for (const physical of folded.split('\r\n')) {
      expect(octets(physical)).toBeLessThanOrEqual(75);
      expect(Buffer.from(physical, 'utf8').toString('utf8')).toBe(physical);
      expect(physical).not.toContain('�');
    }
    expect(unfold(folded)).toBe(line);
  });

  it('keeps escape sequences such as \\n together for stricter calendar apps', () => {
    const prefix = `DESCRIPTION:${'x'.repeat(62)}`; // 74 octets: a following "\n" would straddle 75
    const line = `${prefix}\\nnext\\, line\\;end\\\\`;
    const physical = foldIcsLine(line).split('\r\n');
    expect(physical[0]).toBe(prefix);
    expect(physical[1]?.startsWith(' \\n')).toBe(true);
    expect(unfold(physical.join('\r\n'))).toBe(line);
  });
});

describe('date-time formatting', () => {
  it('formats UTC instants in basic format with a Z suffix', () => {
    expect(formatIcsUtcDateTime(new Date('2027-04-30T12:00:00Z'))).toBe('20270430T120000Z');
    expect(formatIcsUtcDateTime(new Date('2026-10-24T03:04:05.678Z'))).toBe('20261024T030405Z');
  });

  it('formats local wall-clock times without a suffix', () => {
    expect(formatIcsLocalDateTime({ date: '2027-04-30', time: '17:30' })).toBe('20270430T173000');
    expect(formatIcsLocalDateTime({ date: '2027-04-28', time: '16:00' })).toBe('20270428T160000');
  });
});

describe('formatIcsDuration', () => {
  it.each([
    [1440, 'P1D'],
    [2880, 'P2D'],
    [60, 'PT1H'],
    [90, 'PT90M'],
    [15, 'PT15M'],
  ])('formats %i minutes as %s', (minutes, expected) => {
    expect(formatIcsDuration(minutes)).toBe(expected);
  });
});
