import { describe, expect, it } from 'vitest';
import { resolveSiteUrl } from './site-url';

describe('resolveSiteUrl', () => {
  it('prefers an explicitly configured public URL and trims the trailing slash', () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: 'https://nida-junaid.vercel.app/',
        VERCEL_PROJECT_PRODUCTION_URL: 'something-else.vercel.app',
      }),
    ).toBe('https://nida-junaid.vercel.app');
  });

  it("falls back to Vercel's production domain", () => {
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'nida-junaid.vercel.app' })).toBe(
      'https://nida-junaid.vercel.app',
    );
  });

  it('returns null when no public URL is known (local development)', () => {
    expect(resolveSiteUrl({})).toBeNull();
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: '   ' })).toBeNull();
  });

  it('rejects malformed or non-web URLs', () => {
    expect(() => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'not a url' })).toThrow(
      /NEXT_PUBLIC_SITE_URL/,
    );
    expect(() => resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'ftp://example.com' })).toThrow(/http/);
  });

  it('refuses a localhost URL in a production deployment', () => {
    expect(() =>
      resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'http://localhost:3000', VERCEL_ENV: 'production' }),
    ).toThrow(/localhost/);
  });

  it('allows localhost outside production', () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' })).toBe(
      'http://localhost:3000',
    );
  });
});
