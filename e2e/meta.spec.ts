import { expect, test } from '@playwright/test';
import { SITE_URL } from './helpers';

test.describe('link previews and metadata', () => {
  test('uses the public address for previews and keeps search engines out', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Nida & Junaid | Nikah & Haldi Invitation');

    const meta = (selector: string) => page.locator(selector).getAttribute('content');
    expect(await meta('meta[name="description"]')).toBe(
      'You are warmly invited to the Nikah of Nida Khatib and Junaid Shaikh on Friday, 30 April 2027, and their Haldi celebration on Wednesday, 28 April 2027.',
    );
    expect(await meta('meta[property="og:title"]')).toBe('Nida & Junaid | Nikah & Haldi Invitation');
    expect(await meta('meta[property="og:url"]')).toBe(SITE_URL);
    expect(await meta('meta[property="og:image"]')).toMatch(
      new RegExp(`^${SITE_URL}/opengraph-image`),
    );
    expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
    expect(await meta('meta[name="robots"]')).toBe('noindex, nofollow');
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(SITE_URL);
    expect(await page.locator('html').getAttribute('lang')).toBe('en-IN');
  });

  test('stays in its light design when the phone is in dark mode', async ({ browser }) => {
    // Android Chrome and Samsung Internet auto-darken pages unless they declare "only light".
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();
    await page.goto('/');
    expect(
      await page.locator('meta[name="color-scheme"]').getAttribute('content'),
    ).toBe('only light');
    const scheme = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
    expect(scheme).toMatch(/^(only light|light only)$/); // browsers normalise the word order
    await context.close();
  });

  test('serves a 1200×630 preview image and icons', async ({ request }) => {
    const preview = await request.get('/opengraph-image');
    expect(preview.headers()['content-type']).toBe('image/png');
    const png = await preview.body();
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
    expect(png.byteLength).toBeLessThan(300_000); // WhatsApp skips very large preview images

    for (const path of ['/icon', '/apple-icon']) {
      const icon = await request.get(path);
      expect(icon.status()).toBe(200);
      expect(icon.headers()['content-type']).toBe('image/png');
    }
  });

  test('sends basic security headers', async ({ request }) => {
    const headers = (await request.get('/')).headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['x-frame-options']).toBe('DENY');
  });
});
