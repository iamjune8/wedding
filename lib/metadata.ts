import type { Metadata } from 'next';
import type { WeddingConfig } from './wedding-config';

/**
 * Page metadata, including the link preview shown by WhatsApp and other apps. The preview
 * image comes from app/opengraph-image.tsx and is resolved against the public site URL.
 */
export function buildMetadata(config: WeddingConfig, siteUrl: string | null): Metadata {
  const { title, description, allowSearchIndexing } = config.site;
  const siteName = `${config.couple.bride.firstName} & ${config.couple.groom.firstName}`;

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title,
    description,
    applicationName: siteName,
    alternates: siteUrl ? { canonical: '/' } : undefined,
    openGraph: {
      type: 'website',
      title,
      description,
      siteName,
      locale: 'en_IN',
      url: siteUrl ?? undefined,
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: allowSearchIndexing
      ? { index: true, follow: true }
      : { index: false, follow: false, googleBot: { index: false, follow: false } },
    // Stop iOS from turning the address and dates into blue auto-links.
    formatDetection: { telephone: false, email: false, address: false, date: false },
  };
}
