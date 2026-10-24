import { describe, expect, it } from 'vitest';
import { buildMetadata } from './metadata';
import { weddingConfig } from './wedding-config';

describe('buildMetadata', () => {
  it('uses the agreed title and description', () => {
    const metadata = buildMetadata(weddingConfig, null);
    expect(metadata.title).toBe('Nida & Juned | Nikah & Haldi Invitation');
    expect(metadata.description).toBe(
      'You are warmly invited to the Nikah of Nida Khatib and Juned Shaikh on Friday, 30 April 2027, and their Haldi celebration on Wednesday, 28 April 2027.',
    );
  });

  it('points previews and the canonical link at the public address', () => {
    const metadata = buildMetadata(weddingConfig, 'https://nida-juned.vercel.app');
    expect(metadata.metadataBase?.toString()).toBe('https://nida-juned.vercel.app/');
    expect(metadata.alternates?.canonical).toBe('/');
    expect(metadata.openGraph).toMatchObject({
      type: 'website',
      url: 'https://nida-juned.vercel.app',
      siteName: 'Nida & Juned',
      locale: 'en_IN',
    });
  });

  it('omits address-dependent fields when the public address is unknown', () => {
    const metadata = buildMetadata(weddingConfig, null);
    expect(metadata.metadataBase).toBeUndefined();
    expect(metadata.alternates).toBeUndefined();
  });

  it('keeps the invitation out of search results by default', () => {
    expect(buildMetadata(weddingConfig, null).robots).toMatchObject({
      index: false,
      follow: false,
    });
  });

  it('can be opened up to search engines from the configuration', () => {
    const open = { ...weddingConfig, site: { ...weddingConfig.site, allowSearchIndexing: true } };
    expect(buildMetadata(open, null).robots).toEqual({ index: true, follow: true });
  });
});
