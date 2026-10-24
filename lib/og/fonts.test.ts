import { describe, expect, it, vi } from 'vitest';

describe('loadOgFonts', () => {
  it('loads the three Cormorant Garamond styles used by the preview image', async () => {
    const { loadOgFonts } = await import('./fonts');
    const fonts = await loadOgFonts();
    expect(fonts.map(({ weight, style }) => `${weight}-${style}`)).toEqual([
      '300-normal',
      '500-normal',
      '400-italic',
    ]);
    for (const font of fonts) {
      expect(font.name).toBe('Cormorant');
      expect(font.data.byteLength).toBeGreaterThan(10_000);
    }
  });

  it('explains clearly when the font files are missing', async () => {
    vi.resetModules();
    vi.doMock('node:fs/promises', () => ({
      readFile: vi.fn().mockRejectedValue(new Error('ENOENT')),
    }));
    const { loadOgFonts } = await import('./fonts');
    await expect(loadOgFonts()).rejects.toThrow(/assets\/fonts\/og/);
    vi.doUnmock('node:fs/promises');
  });
});
