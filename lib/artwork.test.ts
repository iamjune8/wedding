import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ARTWORK } from './artwork';

/** Reads the canvas size of a lossless/lossy/extended WebP file. */
function webpSize(file: string): { width: number; height: number } {
  const data = readFileSync(file);
  const chunk = data.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return { width: 1 + data.readUIntLE(24, 3), height: 1 + data.readUIntLE(27, 3) };
  }
  if (chunk === 'VP8 ') {
    return { width: data.readUInt16LE(26) & 0x3fff, height: data.readUInt16LE(28) & 0x3fff };
  }
  const bits = data.readUInt32LE(21);
  return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
}

describe('ARTWORK', () => {
  for (const [name, art] of Object.entries(ARTWORK)) {
    it(`${name}: the file exists and its stated size is correct`, () => {
      const file = path.join(process.cwd(), 'public', art.src);
      expect(existsSync(file)).toBe(true);
      expect(webpSize(file)).toEqual({ width: art.width, height: art.height });
    });
  }

  it('describes the couple illustrations for screen readers', () => {
    expect(ARTWORK.coupleSeated.alt).toMatch(/bride and groom/i);
    expect(ARTWORK.coupleStanding.alt).toMatch(/bride/i);
  });
});
