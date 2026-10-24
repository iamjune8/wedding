import { expect, type Page } from '@playwright/test';

export const SITE_URL = 'https://nida-juned.example';

/** Opens the invitation with the opening sequence already marked as seen (instant, still page). */
export async function openWithoutIntro(page: Page, path = '/') {
  await page.addInitScript(() => {
    window.sessionStorage.setItem('nj-intro-seen', '1');
  });
  await page.goto(path);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

/**
 * For tests about buttons and links: a still page (reduced motion), so nothing is mid-reveal
 * or covered by a falling petal at the moment of the tap. Motion itself is tested separately.
 */
export async function openStill(page: Page, path = '/') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openWithoutIntro(page, path);
}

/** Scrolls through the whole page in viewport-sized steps, like a guest reading it. */
export async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewport = page.viewportSize()?.height ?? 800;
  for (let top = 0; top <= height; top += Math.round(viewport * 0.8)) {
    await page.evaluate((y) => window.scrollTo(0, y), top);
    await page.waitForTimeout(60);
  }
}

/** Collects console errors, warnings and uncaught exceptions for the lifetime of the page. */
export function collectProblems(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      problems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  return problems;
}
