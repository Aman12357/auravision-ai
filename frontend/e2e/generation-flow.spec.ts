import { test, expect } from '@playwright/test';

test.describe('Video Generation Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Mock authenticated session
    await page.route('/api/v1/auth/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'demo@aura.ai',
            fullName: 'Demo Creator',
            roles: ['USER']
          }
        }),
      });
    });

    await page.goto('/generate');
  });

  test('User can fill prompt and submit video generation job', async ({ page }) => {
    // Check page title
    await expect(page.getByText('Generate AI Video')).toBeVisible();

    // Fill prompt
    const promptInput = page.getByPlaceholder(/Describe your cinematic vision/i);
    await promptInput.fill('A cyberpunk city at night with neon lights and flying cars, cinematic 4k');

    // Click AI Enhance
    const enhanceBtn = page.getByRole('button', { name: /Enhance/i });
    if (await enhanceBtn.isVisible()) {
      await enhanceBtn.click();
    }

    // Submit job
    const generateBtn = page.getByRole('button', { name: /Generate Video/i });
    await expect(generateBtn).toBeEnabled();
    await generateBtn.click();

    // Verify confirmation modal or progress notification
    await expect(page.getByText(/Job Submitted|Queued/i)).toBeVisible();
  });
});
