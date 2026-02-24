import { expect, test } from '@playwright/test';

test('loads dashboard shell', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Commodity Market Monitor')).toBeVisible();
});
