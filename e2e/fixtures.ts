import { test as base } from '@playwright/test';

type TestFixtures = {
  authenticatedPage: any;
};

/**
 * Extended test with authentication fixture
 * Usage: test('my test', async ({ authenticatedPage }) => { ... })
 */
export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill login form with test credentials
    // Note: These would be test user credentials
    const testEmail = process.env.TEST_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_PASSWORD || 'password123';
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    // Submit login form
    await page.click('button:has-text("Đăng nhập")');
    
    // Wait for navigation to photos page (or another protected page)
    await page.waitForURL('/photos', { timeout: 10000 }).catch(() => {
      // If wait fails, the authentication might have failed
      // but we'll continue anyway for testing purposes
    });
    
    // Use the authenticated page
    await use(page);
    
    // Logout after test (optional)
    try {
      await page.goto('/logout');
    } catch (e) {
      // Logout might not be available
    }
  },
});

export { expect } from '@playwright/test';
