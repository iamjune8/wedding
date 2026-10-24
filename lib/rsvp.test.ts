import { describe, expect, it } from 'vitest';
import { parseRsvp, toSheetCell } from './rsvp';

describe('parseRsvp', () => {
  it('accepts a name and an attendance answer, trimming spaces', () => {
    expect(parseRsvp({ name: '  Ayesha Khan ', attending: 'yes' })).toEqual({
      success: true,
      data: { name: 'Ayesha Khan', attending: 'yes' },
    });
    expect(parseRsvp({ name: 'Imran', attending: 'no' })).toMatchObject({ success: true });
  });

  it('collapses repeated whitespace inside names', () => {
    expect(parseRsvp({ name: 'Ayesha   \n Khan', attending: 'yes' })).toMatchObject({
      data: { name: 'Ayesha Khan' },
    });
  });

  it.each([
    [{ name: '', attending: 'yes' }, 'name'],
    [{ name: 'A', attending: 'yes' }, 'name'],
    [{ name: 'x'.repeat(81), attending: 'yes' }, 'name'],
    [{ name: 'Ayesha', attending: 'maybe' }, 'attending'],
    [{ name: 'Ayesha' }, 'attending'],
    [null, 'name'],
    ['not an object', 'name'],
  ])('rejects %j and points at the %s field', (input, field) => {
    const result = parseRsvp(input);
    expect(result.success).toBe(false);
    if (!result.success) expect(Object.keys(result.errors)).toContain(field);
  });

  it('flags the hidden anti-spam field when a bot fills it', () => {
    expect(parseRsvp({ name: 'Bot', attending: 'yes', website: 'http://spam' })).toEqual({
      success: false,
      spam: true,
      errors: {},
    });
  });
});

describe('toSheetCell', () => {
  it('neutralises spreadsheet formulas', () => {
    expect(toSheetCell('=HYPERLINK("x")')).toBe(`'=HYPERLINK("x")`);
    expect(toSheetCell('+91 call me')).toBe(`'+91 call me`);
    expect(toSheetCell('-1')).toBe(`'-1`);
    expect(toSheetCell('@everyone')).toBe(`'@everyone`);
  });

  it('leaves ordinary names alone', () => {
    expect(toSheetCell('Ayesha Khan')).toBe('Ayesha Khan');
  });
});
