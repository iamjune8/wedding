import { describe, expect, it } from 'vitest';
import { parseWeddingConfig, rawWeddingConfig, weddingConfig } from './wedding-config';

/** Returns a copy of `source` with the value at `path` replaced, leaving `source` untouched. */
function setIn(source: unknown, path: readonly string[], value: unknown): unknown {
  const [head, ...rest] = path;
  if (head === undefined) return value;
  const node = (source ?? {}) as Readonly<Record<string, unknown>>;
  return { ...node, [head]: setIn(node[head], rest, value) };
}

const withOverride = (path: readonly string[], value: unknown) =>
  setIn(rawWeddingConfig, path, value);

describe('weddingConfig (confirmed details)', () => {
  it('spells the couple’s names exactly', () => {
    expect(weddingConfig.couple.bride.fullName).toBe('Nida Khatib');
    expect(weddingConfig.couple.groom.fullName).toBe('Juned Shaikh');
  });

  it('uses India Standard Time for every event', () => {
    expect(weddingConfig.timeZone).toBe('Asia/Kolkata');
    expect(weddingConfig.timeZoneLabel).toBe('IST');
  });

  it('holds the confirmed Nikah details', () => {
    const { nikah } = weddingConfig.events;
    expect(nikah.date).toBe('2027-04-30');
    expect(nikah.startTime).toBe('17:30');
    expect(nikah.timingNote).toBe('After Asr Namaaz');
    expect(nikah.venue).toEqual({
      name: 'Seawood Jama Masjid',
      address: 'Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai, Maharashtra, India',
      shortAddress: 'Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai',
    });
    expect(nikah.calendar.fileName).toBe('nida-juned-nikah.ics');
  });

  it('holds the confirmed Haldi date and time with the venue still to be announced', () => {
    const { haldi } = weddingConfig.events;
    expect(haldi.date).toBe('2027-04-28');
    expect(haldi.startTime).toBe('16:00');
    expect(haldi.venue).toBeNull();
    expect(haldi.calendar.fileName).toBe('nida-juned-haldi.ics');
  });

  it('defaults calendar entries to 60 minutes because no end time was provided', () => {
    expect(weddingConfig.events.nikah.durationMinutes).toBe(60);
    expect(weddingConfig.events.haldi.durationMinutes).toBe(60);
  });
});

describe('parseWeddingConfig', () => {
  it('accepts the shipped configuration', () => {
    expect(() => parseWeddingConfig(rawWeddingConfig)).not.toThrow();
  });

  it('accepts a confirmed Haldi venue later on', () => {
    const updated = withOverride(['events', 'haldi', 'venue'], {
      name: 'Example Hall',
      address: 'Example Road, Navi Mumbai, Maharashtra, India',
      shortAddress: 'Example Road, Navi Mumbai',
    });
    expect(parseWeddingConfig(updated).events.haldi.venue?.name).toBe('Example Hall');
  });

  it.each([
    [['events', 'nikah', 'date'], '2027-02-30', 'events.nikah.date'],
    [['events', 'nikah', 'date'], '30/04/2027', 'events.nikah.date'],
    [['events', 'haldi', 'startTime'], '4:00 PM', 'events.haldi.startTime'],
    [['timeZone'], 'India/Mumbai', 'timeZone'],
    [['events', 'nikah', 'durationMinutes'], 0, 'events.nikah.durationMinutes'],
    [
      ['events', 'haldi', 'calendar', 'fileName'],
      'Haldi Invite.ics',
      'events.haldi.calendar.fileName',
    ],
    [['couple', 'bride', 'fullName'], '   ', 'couple.bride.fullName'],
  ] as const)('rejects an invalid %j with a readable message', (path, value, label) => {
    expect(() => parseWeddingConfig(withOverride(path, value))).toThrow(label);
  });

  it('rejects two events that would share a calendar file', () => {
    const clash = withOverride(['events', 'haldi', 'calendar', 'fileName'], 'nida-juned-nikah.ics');
    expect(() => parseWeddingConfig(clash)).toThrow(/unique/i);
  });

  it('rejects an empty venue name once a venue is set', () => {
    const blank = withOverride(['events', 'haldi', 'venue'], {
      name: '',
      address: 'Somewhere',
      shortAddress: 'Somewhere',
    });
    expect(() => parseWeddingConfig(blank)).toThrow('events.haldi.venue.name');
  });
});
