import { expect, test } from '@playwright/test';
import { openStill } from './helpers';

test.describe('RSVP', () => {
  test('a guest replies and is thanked by name', async ({ page }) => {
    const sent: unknown[] = [];
    await page.route('**/api/rsvp', async (route) => {
      sent.push(route.request().postDataJSON());
      await route.fulfill({ json: { success: true } });
    });
    await openStill(page);
    const rsvp = page.getByRole('region', { name: 'RSVP' });
    await rsvp.getByLabel('Your name').fill('Ayesha Khan');
    await rsvp.getByRole('radio', { name: /joyfully attending/i }).check();
    await rsvp.getByRole('button', { name: /send my reply/i }).click();
    await expect(rsvp.getByText('JazakAllah khair, Ayesha')).toBeVisible();
    expect(sent).toEqual([{ name: 'Ayesha Khan', attending: 'yes' }]);
  });

  test('explains politely while the Google Sheet is not connected', async ({ page }) => {
    // The test server has no sheet configured, so the real endpoint answers "not configured".
    await openStill(page);
    const rsvp = page.getByRole('region', { name: 'RSVP' });
    await rsvp.getByLabel('Your name').fill('Ayesha');
    await rsvp.getByRole('radio', { name: /regretfully unable/i }).check();
    await rsvp.getByRole('button', { name: /send my reply/i }).click();
    await expect(rsvp.getByText(/Replies are not open just yet/)).toBeVisible();
  });

  test('the server rejects invalid replies on its own', async ({ request }) => {
    const response = await request.post('/api/rsvp', { data: { name: '', attending: 'maybe' } });
    expect(response.status()).toBe(400);
    expect((await response.json()).success).toBe(false);
  });

  test('the reply card fits small phones', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await openStill(page);
    const box = await page.locator('.rsvp-card').boundingBox();
    expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
  });
});
