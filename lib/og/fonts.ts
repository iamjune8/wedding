import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Static Cormorant Garamond instances (OFL) used to draw the preview image and icons. */
const FONT_FILES = [
  { file: 'CormorantGaramond-Light.ttf', weight: 300, style: 'normal' },
  { file: 'CormorantGaramond-Medium.ttf', weight: 500, style: 'normal' },
  { file: 'CormorantGaramond-Italic.ttf', weight: 400, style: 'italic' },
] as const;

export async function loadOgFonts() {
  try {
    return await Promise.all(
      FONT_FILES.map(async ({ file, weight, style }) => ({
        name: 'Cormorant',
        data: await readFile(join(process.cwd(), 'assets', 'fonts', 'og', file)),
        weight,
        style,
      })),
    );
  } catch (error) {
    throw new Error('Could not load the fonts for the preview image (assets/fonts/og).', {
      cause: error,
    });
  }
}
