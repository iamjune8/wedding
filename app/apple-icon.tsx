import { ImageResponse } from 'next/og';
import { loadOgFonts } from '@/lib/og/fonts';
import { Monogram } from '@/lib/og/monogram';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default async function AppleIcon() {
  return new ImageResponse(<Monogram size={size.width} />, {
    ...size,
    fonts: await loadOgFonts(),
  });
}
