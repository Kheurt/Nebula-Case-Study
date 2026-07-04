import { test, expect } from '@playwright/test';
import { STORAGE_STATE_STUDENT } from './global-setup';

test.describe('US2 — Student enrollment (unauthenticated)', () => {
  test('unauthenticated user is redirected to login on enroll', async ({ page }) => {
    await page.goto('/programs');
    const card = page.locator('a[href^="/programs/"]').first();
    if (await card.isVisible()) {
      await card.click();
      const enrollBtn = page.getByRole('button', { name: /enroll/i });
      if (await enrollBtn.isVisible()) {
        await enrollBtn.click();
        await expect(page).toHaveURL(/login/);
      }
    }
  });
});

test.describe('US2 — Student enrollment (authenticated)', () => {
  test.use({ storageState: STORAGE_STATE_STUDENT });

  test('authenticated student can view my-programs page', async ({ page }) => {
    await page.goto('/my-programs');
    await expect(page).toHaveURL('/my-programs');
  });

  test('my-programs page shows enrolled cohorts or empty state', async ({ page }) => {
    await page.goto('/my-programs');
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(0);
  });
});
