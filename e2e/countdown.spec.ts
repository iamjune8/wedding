import { expect, test, type Locator, type Page } from '@playwright/test';
import { openWithoutIntro } from './helpers';

const NIKAH_UTC = Date.parse('2027-04-30T12:00:00Z');

const unit = (timer: Locator, label: RegExp) =>
  timer
    .locator('.countdown__unit', {
      has: timer.page().locator('.countdown__label', { hasText: label }),
    })
    .locator('.countdown__value');

async function readTimer(page: Page, sectionName: string) {
  const timer = page.getByRole('region', { name: sectionName }).getByRole('timer');
  const read = async (label: RegExp) => Number(await unit(timer, label).textContent());
  return {
    days: await read(/^Days?$/),
    hours: await read(/^Hours?$/),
    minutes: await read(/^Minutes?$/),
    seconds: await read(/^Seconds?$/),
  };
}

test.describe('countdowns', () => {
  test('match the real time remaining (computed, not hard-coded)', async ({ page }) => {
    await openWithoutIntro(page);
    const region = page.getByRole('region', { name: 'Counting down to the Nikah' });
    await expect(region.getByRole('timer')).toHaveAttribute('aria-busy', 'false');
    const shown = await readTimer(page, 'Counting down to the Nikah');
    const browserNow = await page.evaluate(() => Date.now());
    const shownSeconds =
      ((shown.days * 24 + shown.hours) * 60 + shown.minutes) * 60 + shown.seconds;
    const expectedSeconds = Math.ceil((NIKAH_UTC - browserNow) / 1000);
    expect(Math.abs(shownSeconds - expectedSeconds)).toBeLessThanOrEqual(2);
  });

  /** Loads the page a minute early, then freezes the clock at `moment` so slow loads can't skew it. */
  async function openAt(page: Page, moment: string) {
    const frozen = new Date(moment);
    await page.clock.install({ time: new Date(frozen.getTime() - 60_000) });
    await openWithoutIntro(page);
    await page.clock.pauseAt(frozen);
    // The shared clock ticks just after each whole second; this lands on frozen + 1s.
    await page.clock.runFor(1100);
  }

  test('do not depend on the guest’s device time zone', async ({ browser }) => {
    const context = await browser.newContext({ timezoneId: 'America/Los_Angeles' });
    const page = await context.newPage();
    await openAt(page, '2027-04-29T11:59:59Z');
    await expect
      .poll(() => readTimer(page, 'Counting down to the Nikah'))
      .toEqual({
        days: 1,
        hours: 0,
        minutes: 0,
        seconds: 0,
      });
    await context.close();
  });

  test('reach zero at 17:30 IST on 30 April and show the event-day message', async ({ page }) => {
    await openAt(page, '2027-04-30T11:59:57Z');
    const region = page.getByRole('region', { name: 'Counting down to the Nikah' });
    await expect
      .poll(() => readTimer(page, 'Counting down to the Nikah'))
      .toEqual({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 2,
      });
    await page.clock.runFor(2500);
    await expect(region.getByText('The blessed day is here')).toBeAttached();
    await expect(region.getByRole('timer')).toHaveCount(0);
  });

  test('count the Haldi separately, reaching zero at 16:00 IST on 28 April', async ({ page }) => {
    await openAt(page, '2027-04-28T10:29:57Z');
    const haldi = page.getByRole('region', { name: 'Haldi Ceremony' });
    await expect
      .poll(() => readTimer(page, 'Haldi Ceremony'))
      .toEqual({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 2,
      });
    // At the same moment the Nikah is still 2 days and 1½ hours away.
    await expect
      .poll(() => readTimer(page, 'Counting down to the Nikah'))
      .toEqual({
        days: 2,
        hours: 1,
        minutes: 30,
        seconds: 2,
      });
    await page.clock.runFor(2500);
    await expect(haldi.getByText('The Haldi celebration is here')).toBeAttached();
  });

  test('settle into a thank-you once the day has passed', async ({ page }) => {
    await page.clock.install({ time: new Date('2027-05-01T00:00:00+05:30') });
    await openWithoutIntro(page);
    await expect(page.getByText('Alhamdulillah. Thank you for your duas.')).toBeAttached();
    await expect(
      page.getByText('Alhamdulillah. Thank you for celebrating with us.'),
    ).toBeAttached();
  });
});
