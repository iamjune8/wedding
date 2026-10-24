import { expect, test } from '@playwright/test';
import { openStill, SITE_URL } from './helpers';

const EXPECTED_MESSAGE = [
  'Assalamu Alaikum,',
  '',
  'With the blessings of Allah, you are warmly invited to the Nikah of Nida Khatib & Juned Shaikh.',
  '',
  'Nikah:',
  'Friday, 30 April 2027',
  '5:30 PM IST · After Asr Namaaz',
  '',
  'Venue:',
  'Seawood Jama Masjid',
  'Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai.',
  '',
  'Haldi:',
  'Wednesday, 28 April 2027',
  '4:00 PM IST',
  'Venue to be announced.',
  '',
  'We would be honoured by your presence and duas.',
].join('\n');

test.describe('sharing', () => {
  test('WhatsApp receives the full message and the public link', async ({ page }) => {
    await openStill(page);
    const nikah = page.getByRole('region', { name: 'Nikah Ceremony' });
    await nikah.getByText('Share Invitation').click();
    const whatsapp = nikah.getByRole('link', { name: /share on whatsapp/i });
    await expect(whatsapp).toBeVisible();
    const href = (await whatsapp.getAttribute('href')) ?? '';
    expect(href.startsWith('https://wa.me/?text=')).toBe(true);
    expect(new URL(href).searchParams.get('text')).toBe(`${EXPECTED_MESSAGE}\n\n${SITE_URL}`);
  });

  test('uses the device share menu where available', async ({ page }) => {
    await page.addInitScript(() => {
      const calls: unknown[] = [];
      Object.defineProperty(window, '__shareCalls', { value: calls });
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: async (data: unknown) => {
          calls.push(data);
        },
      });
    });
    await openStill(page);
    const nikah = page.getByRole('region', { name: 'Nikah Ceremony' });
    await nikah.getByText('Share Invitation').click();
    await nikah.getByRole('button', { name: /more ways to share/i }).click();
    const calls = await page.evaluate(
      () => (window as unknown as { __shareCalls: unknown[] }).__shareCalls,
    );
    expect(calls).toEqual([
      { title: 'Nida & Juned | Nikah & Haldi Invitation', text: EXPECTED_MESSAGE, url: SITE_URL },
    ]);
  });

  test('copies the link where there is no share menu', async ({ page, context }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop-chromium',
      'Clipboard permissions are Chromium-only',
    );
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
    });
    await openStill(page);
    const nikah = page.getByRole('region', { name: 'Nikah Ceremony' });
    await nikah.getByText('Share Invitation').click();
    await nikah.getByRole('button', { name: /copy invitation link/i }).click();
    await expect(nikah.getByRole('status')).toHaveText('Invitation link copied.');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(SITE_URL);
  });
});
