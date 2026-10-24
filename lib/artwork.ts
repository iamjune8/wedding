/*
 * Illustrations used on the page (from the couple's Canva artwork in assets/canva elements).
 *
 * The originals are large PNGs; the files in public/art are trimmed, resized WebP copies
 * (transparent backgrounds kept). To replace one, export a new PNG with a transparent
 * background, convert it to WebP at about the width below, keep the same file name and update
 * its width and height here so the page reserves the right space while it loads.
 */

export interface Artwork {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  /** Empty for purely decorative art (its meaning is already in the text). */
  readonly alt: string;
}

export const ARTWORK = {
  /** Bismillah calligraphy, brightened to warm gold for the navy sky. Decorative: the
   * transliteration beneath it is the text. */
  bismillah: { src: '/art/bismillah.webp', width: 731, height: 269, alt: '' },
  /** Floral arch on classical pillars: ivory, peach and white roses with sage leaves. */
  nikahGate: { src: '/art/nikah-gate.webp', width: 1100, height: 1223, alt: '' },
  coupleSeated: {
    src: '/art/couple-seated.webp',
    width: 1000,
    height: 760,
    alt: 'Illustration of the bride and groom in ivory, seated together beside an open Quran on its stand',
  },
  coupleStanding: {
    src: '/art/couple-standing.webp',
    width: 800,
    height: 1152,
    alt: 'Illustration of the bride in an ivory gown and veil standing beside the groom in an ivory sherwani',
  },
} as const satisfies Record<string, Artwork>;
