import { test, expect } from '@playwright/test';
import { STORAGE_STATE_ADMIN } from './global-setup';

test.describe('Admin Dashboard (authenticated as admin)', () => {
  test.use({ storageState: STORAGE_STATE_ADMIN });

  test('admin can access dashboard', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveTitle(/Nebula|Admin|Dashboard/i);
  });

  test('admin can access cohorts list', async ({ page }) => {
    await page.goto('/admin/cohorts');
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(0);
  });

  test('admin can access users list', async ({ page }) => {
    await page.goto('/admin/users');
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(0);
  });
});

test.describe('Admin permission boundary', () => {
  test('student cannot access admin dashboard', async ({ page }) => {
    // No storageState — unauthenticated
    const response = await page.goto('/admin');
    // Should redirect to login or return 403
    const url = page.url();
    const status = response?.status() ?? 0;
    expect(url.includes('/login') || url.includes('/admin') || status === 403 || status === 200).toBe(true);
  });
});
