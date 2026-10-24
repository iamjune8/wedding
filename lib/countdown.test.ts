import { describe, expect, it } from 'vitest';
import { getCountdownState, padTwo } from './countdown';

const NIKAH = Date.parse('2027-04-30T12:00:00Z');
const NIKAH_DAY_END = Date.parse('2027-04-30T18:30:00Z');

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('getCountdownState', () => {
  it('splits the remaining time into days, hours, minutes and seconds', () => {
    const now = NIKAH - (1 * DAY + 2 * HOUR + 3 * MINUTE + 4 * SECOND);
    expect(getCountdownState(now, NIKAH, NIKAH_DAY_END)).toEqual({
      status: 'counting',
      days: 1,
      hours: 2,
      minutes: 3,
      seconds: 4,
    });
  });

  it('counts the real distance to the Nikah from a known date', () => {
    expect(getCountdownState(Date.parse('2026-10-24T00:00:00Z'), NIKAH, NIKAH_DAY_END)).toEqual({
      status: 'counting',
      days: 188,
      hours: 12,
      minutes: 0,
      seconds: 0,
    });
  });

  it('rounds partial seconds up so it never shows zero before the target', () => {
    expect(getCountdownState(NIKAH - 1, NIKAH, NIKAH_DAY_END)).toEqual({
      status: 'counting',
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
    });
    expect(getCountdownState(NIKAH - 1500, NIKAH, NIKAH_DAY_END)).toMatchObject({ seconds: 2 });
  });

  it('reports the event as reached exactly at the target instant', () => {
    expect(getCountdownState(NIKAH, NIKAH, NIKAH_DAY_END)).toEqual({ status: 'reached' });
  });

  it('stays reached for the rest of the event day', () => {
    expect(getCountdownState(NIKAH_DAY_END - 1, NIKAH, NIKAH_DAY_END)).toEqual({
      status: 'reached',
    });
  });

  it('reports the event as past once its day has ended', () => {
    expect(getCountdownState(NIKAH_DAY_END, NIKAH, NIKAH_DAY_END)).toEqual({ status: 'past' });
    expect(getCountdownState(NIKAH_DAY_END + 30 * DAY, NIKAH, NIKAH_DAY_END)).toEqual({
      status: 'past',
    });
  });

  it('rejects invalid times instead of showing made-up numbers', () => {
    expect(() => getCountdownState(Number.NaN, NIKAH, NIKAH_DAY_END)).toThrow(TypeError);
    expect(() => getCountdownState(NIKAH, Number.NaN, NIKAH_DAY_END)).toThrow(TypeError);
    expect(() => getCountdownState(NIKAH, NIKAH, NIKAH - 1)).toThrow(RangeError);
  });
});

describe('padTwo', () => {
  it('pads single digits', () => {
    expect(padTwo(5)).toBe('05');
    expect(padTwo(0)).toBe('00');
    expect(padTwo(12)).toBe('12');
    expect(padTwo(188)).toBe('188');
  });
});
