import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Great_Vibes, Inter } from 'next/font/google';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { INTRO_HEAD_SCRIPT } from '@/lib/intro';
import { buildMetadata } from '@/lib/metadata';
import { resolveSiteUrl } from '@/lib/site-url';
import { weddingConfig } from '@/lib/wedding-config';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-cormorant',
});

// Great Vibes (SIL Open Font License) for the single word "Nikah" in the opening.
const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-great-vibes',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-inter',
});

// Amiri, subset to the Bismillah alone (≈22 KB); see assets/fonts/OFL-Amiri.txt.
const amiri = localFont({
  src: '../assets/fonts/amiri-basmala.woff2',
  display: 'swap',
  variable: '--font-amiri',
  fallback: ['Geeza Pro', 'Noto Naskh Arabic', 'serif'],
});

export const metadata: Metadata = buildMetadata(weddingConfig, resolveSiteUrl(process.env));

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1d1a37',
  // "only light" stops Android Chrome / Samsung Internet from auto-darkening the design.
  colorScheme: 'only light',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en-IN"
      className={`${cormorant.variable} ${greatVibes.variable} ${inter.variable} ${amiri.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Decides before first paint whether to skip the opening sequence. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_HEAD_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
