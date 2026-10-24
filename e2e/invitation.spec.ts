import { expect, test } from '@playwright/test';
import { collectProblems, openWithoutIntro, scrollThrough, SITE_URL } from './helpers';

test.describe('the invitation page', () => {
  test('loads cleanly: no console errors, hydration warnings or exceptions', async ({ page }) => {
    const problems = collectProblems(page);
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'Nida Khatib and Juned Shaikh',
    );
    await page.waitForTimeout(5000); // let the opening sequence and hydration finish
    await scrollThrough(page);
    expect(problems).toEqual([]);
  });

  test('plays the opening and shows every line of it', async ({ page }) => {
    await page.goto('/');
    const hero = page.getByRole('region', { name: 'Nida Khatib and Juned Shaikh' });
    for (const text of [
      'Bismillahir Rahmanir Rahim',
      'Together with our families',
      'Nida Khatib',
      'Juned Shaikh',
      'Cordially invite you to celebrate their Nikah',
      'Friday, 30 April 2027',
      'After Asr Namaaz · 5:30 PM IST',
      'Discover the celebration',
    ]) {
      await expect(hero.getByText(text, { exact: true })).toBeVisible({ timeout: 10_000 });
    }
  });

  test('reveals every chapter while scrolling, in the agreed order', async ({ page }) => {
    await openWithoutIntro(page);
    await scrollThrough(page);
    await expect(page.locator('[data-reveal]:not([data-revealed])')).toHaveCount(0);

    const headings = await page.getByRole('heading', { level: 2 }).allTextContents();
    expect(headings).toEqual([
      'Invitation',
      'Counting down to the Nikah',
      'Nikah Ceremony',
      'Haldi Ceremony',
      'RSVP',
    ]);
    await expect(page.getByRole('contentinfo')).toContainText('Keep us in your duas.');
  });

  test('the discover cue moves on to the invitation message', async ({ page }) => {
    await openWithoutIntro(page);
    await page.getByRole('link', { name: 'Discover the celebration' }).click();
    await expect(page).toHaveURL(/#invitation$/);
    await expect(
      page.getByText(/With the blessings of Allah and the love and duas/),
    ).toBeInViewport();
  });

  test('offers safe, correctly encoded Google Maps directions for the Nikah', async ({ page }) => {
    await openWithoutIntro(page);
    const nikah = page.getByRole('region', { name: 'Nikah Ceremony' });
    const directions = nikah.getByRole('link', { name: /get directions/i });
    await expect(directions).toHaveAttribute('target', '_blank');
    await expect(directions).toHaveAttribute('rel', 'noopener noreferrer');
    const href = (await directions.getAttribute('href')) ?? '';
    const url = new URL(href);
    expect(`${url.origin}${url.pathname}`).toBe('https://www.google.com/maps/dir/');
    expect(url.searchParams.get('api')).toBe('1');
    expect(url.searchParams.get('destination')).toBe(
      'Seawood Jama Masjid, Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai, Maharashtra, India',
    );
  });

  test('keeps the Haldi venue as to be announced, with no directions', async ({ page }) => {
    await openWithoutIntro(page);
    const haldi = page.getByRole('region', { name: 'Haldi Ceremony' });
    await expect(haldi.getByText('Wednesday, 28 April 2027')).toBeAttached();
    await expect(haldi.getByText('4:00 PM IST', { exact: true })).toBeAttached();
    await expect(haldi.getByText('To be announced')).toHaveCount(2);
    await expect(haldi.getByText('Venue details will be announced soon.')).toBeAttached();
    await expect(haldi.getByRole('link', { name: /directions/i })).toHaveCount(0);
  });

  test('never links to localhost', async ({ page }) => {
    await openWithoutIntro(page);
    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href));
    const external = hrefs.filter((href) => !href.startsWith(new URL(page.url()).origin));
    expect(external.length).toBeGreaterThan(0);
    for (const href of external) {
      expect(decodeURIComponent(href)).not.toMatch(/localhost|127\.0\.0\.1/);
    }
    const whatsapp = external.find((href) => href.startsWith('https://wa.me/')) ?? '';
    expect(new URL(whatsapp).searchParams.get('text')).toContain(SITE_URL);
  });
});
