import { describe, expect, it } from 'vitest';
import { buildDirectionsUrl } from './maps';

const nikahVenue = {
  name: 'Seawood Jama Masjid',
  address: 'Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai, Maharashtra, India',
};

describe('buildDirectionsUrl', () => {
  it('builds a public Google Maps directions link from the full venue address', () => {
    expect(buildDirectionsUrl(nikahVenue)).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=Seawood%20Jama%20Masjid%2C%20Plot%20No.%20144%2C%20Sector%20New%2050%2C%20Seawoods%2C%20Nerul%2C%20Navi%20Mumbai%2C%20Maharashtra%2C%20India',
    );
  });

  it('round-trips the destination exactly', () => {
    const url = new URL(buildDirectionsUrl(nikahVenue) ?? '');
    expect(url.searchParams.get('api')).toBe('1');
    expect(url.searchParams.get('destination')).toBe(
      'Seawood Jama Masjid, Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai, Maharashtra, India',
    );
    expect(url.searchParams.has('destination_place_id')).toBe(false);
  });

  it('returns null while a venue is still to be announced', () => {
    expect(buildDirectionsUrl(null)).toBeNull();
  });

  it('encodes characters that would otherwise break the query string', () => {
    const url = buildDirectionsUrl({ name: 'Hall A & B', address: 'Lane #4, Mumbai' }) ?? '';
    expect(url).toContain('Hall%20A%20%26%20B%2C%20Lane%20%234%2C%20Mumbai');
    expect(new URL(url).searchParams.get('destination')).toBe('Hall A & B, Lane #4, Mumbai');
  });
});
