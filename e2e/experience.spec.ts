import { expect, test, type Page } from '@playwright/test';
import { openWithoutIntro, scrollThrough } from './helpers';

const WIDTHS = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920];

/** Visible content that sticks out of the viewport (decorative, aria-hidden art is ignored). */
async function findOverflow(page: Page) {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return Array.from(document.querySelectorAll('body *'))
      .filter((element) => !element.closest('[aria-hidden="true"], .sr-only, script, style'))
      .filter((element) => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && (box.right > width + 0.5 || box.left < -0.5);
      })
      .map((element) => `${element.tagName.toLowerCase()}.${element.className}`)
      .slice(0, 5);
  });
}

test.describe('layout', () => {
  test('nothing overflows sideways from 320px phones to large desktops', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chromium', 'Width sweep runs once');
    test.setTimeout(180_000);
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 800 });
      await openWithoutIntro(page);
      await scrollThrough(page);
      expect(await findOverflow(page), `overflow at ${width}px`).toEqual([]);
      const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(pageWidth, `page width at ${width}px`).toBeLessThanOrEqual(width);
    }
  });

  test('the couple’s names never break across lines', async ({ page }) => {
    await openWithoutIntro(page);
    const lines = page.locator('.names__line > span');
    for (const line of await lines.all()) {
      const height = await line.evaluate((element) => element.getBoundingClientRect().height);
      const lineHeight = await line.evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).lineHeight),
      );
      expect(height).toBeLessThan(lineHeight * 1.5);
    }
  });

  test('countdown units sit side by side, even on small phones', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await openWithoutIntro(page);
    const tops = await page
      .getByRole('region', { name: 'Counting down to the Nikah' })
      .locator('.countdown__unit')
      .evaluateAll((units) => units.map((unit) => Math.round(unit.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(1);
  });

  test('every button and link is comfortably tappable', async ({ page }) => {
    await openWithoutIntro(page);
    await page.getByText('Add to Calendar').first().click();
    const small = await page
      .locator('main a, main button, main summary, footer a')
      .evaluateAll((elements) =>
        elements
          .filter((element) => element.getBoundingClientRect().width > 0)
          .filter((element) => !element.classList.contains('skip-link'))
          .filter((element) => element.getBoundingClientRect().height < 44)
          .map((element) => element.textContent?.trim()),
      );
    expect(small).toEqual([]);
  });
});

test.describe('motion and resilience', () => {
  test('the envelope opens by itself, then clears completely', async ({ page }) => {
    await page.goto('/');
    const envelope = page.locator('.envelope');
    await expect(envelope).toBeVisible();
    await expect(envelope).toBeHidden({ timeout: 6000 });
    expect(await envelope.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe(
      'none',
    );
  });

  test('a tap opens the envelope straight away', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.envelope')).toBeVisible();
    await page.getByRole('button', { name: 'Skip intro' }).click();
    await expect(page.locator('.envelope')).toBeHidden({ timeout: 1500 });
  });

  test('the opening can be skipped at once', async ({ page }) => {
    await page.goto('/');
    const skip = page.getByRole('button', { name: 'Skip intro' });
    await skip.click();
    await expect(skip).toHaveCount(0);
    const scrollCue = page.getByRole('link', { name: 'Discover the celebration' });
    await expect
      .poll(() => scrollCue.evaluate((element) => getComputedStyle(element).opacity), {
        timeout: 2000,
      })
      .toBe('1');
  });

  test('reduced-motion visitors get a still, complete page immediately', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Skip intro' })).toHaveCount(0);
    await expect(page.locator('.envelope')).toBeHidden();
    // (The background pattern is intentionally faint, so it is not part of this check.)
    const opacities = await page
      .locator('.intro-step, .intro-fade:not(.hero__pattern), [data-reveal]')
      .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).opacity));
    expect(opacities.every((value) => value === '1')).toBe(true);
    expect(
      await page
        .locator('.intro-mask > span')
        .first()
        .evaluate((element) => getComputedStyle(element).transform),
    ).toBe('none');
  });

  test('without JavaScript the invitation is still complete and usable', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await page.waitForTimeout(7500); // the CSS-only envelope and opening finish on their own
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const hidden = await page
      .locator('[data-reveal]')
      .evaluateAll(
        (elements) =>
          elements.filter((element) => getComputedStyle(element).opacity !== '1').length,
      );
    expect(hidden).toBe(0);

    const nikah = page.getByRole('region', { name: 'Nikah Ceremony' });
    await expect(nikah.getByRole('link', { name: /get directions/i })).toBeVisible();
    await nikah.getByText('Add to Calendar').click();
    await expect(nikah.getByRole('link', { name: /apple calendar/i })).toBeVisible();
    await expect(
      page.getByRole('button', { name: /copy invitation link|more ways to share/i }),
    ).toHaveCount(0);
    await context.close();
  });
});

test.describe('keyboard', () => {
  test('a skip link leads straight to the event details', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'iphone-webkit', 'No hardware keyboard on iPhone');
    await openWithoutIntro(page);
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Skip to the event details' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#nikah$/);
    await expect(page.getByRole('heading', { name: 'Nikah Ceremony' })).toBeInViewport();
  });

  test('focus is always visible and the calendar menu opens from the keyboard', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'iphone-webkit', 'No hardware keyboard on iPhone');
    await openWithoutIntro(page);
    const directions = page.getByRole('link', { name: /get directions/i });
    await directions.focus();
    await page.keyboard.press('Tab');
    const summary = page.locator('#nikah summary', { hasText: 'Add to Calendar' });
    await expect(summary).toBeFocused();
    const outline = await summary.evaluate((element) => getComputedStyle(element).outlineStyle);
    expect(outline).toBe('solid');
    await page.keyboard.press('Enter');
    await expect(
      page.locator('#nikah').getByRole('link', { name: /google calendar/i }),
    ).toBeVisible();
  });
});
