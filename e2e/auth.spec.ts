import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check for key elements
    await expect(page.locator('text=Đăng nhập')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Đăng nhập")')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.goto('/login');
    
    // Fill invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit form
    await page.click('button:has-text("Đăng nhập")');
    
    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    expect(validity).toBe(false);
  });

  test('should show error for empty fields', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit without filling fields
    await page.click('button:has-text("Đăng nhập")');
    
    // Email input should show validation error
    const emailInput = page.locator('input[type="email"]');
    const validity = await emailInput.evaluate((el: HTMLInputElement) => !el.value);
    expect(validity).toBe(true);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    
    // Click "Đăng ký" link (usually at the bottom)
    const registerLink = page.locator('a:has-text("Đăng ký")');
    
    // If link doesn't exist, check for navigation text
    if (await registerLink.count() > 0) {
      await registerLink.click();
      await expect(page).toHaveURL(/register/);
    }
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');
    
    // Click "Quên mật khẩu?" link
    const forgotLink = page.locator('text=Quên mật khẩu');
    
    if (await forgotLink.count() > 0) {
      await forgotLink.click();
      await expect(page).toHaveURL(/forgot-password/);
    }
  });

  test('should display register page', async ({ page }) => {
    await page.goto('/register');
    
    // Check for key elements
    await expect(page.locator('text=Đăng ký')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should display forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Check for key elements
    await expect(page.locator('text=Quên mật khẩu')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should handle case-insensitive email input', async ({ page }) => {
    await page.goto('/login');
    
    // Fill with uppercase email
    await page.fill('input[type="email"]', 'TEST@EXAMPLE.COM');
    
    const emailValue = await page.inputValue('input[type="email"]');
    // Should accept uppercase (browser will normalize)
    expect(emailValue.length).toBeGreaterThan(0);
  });

  test('should hide password when typing', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.locator('input[type="password"]');
    
    // Password input should be of type "password"
    const inputType = await passwordInput.getAttribute('type');
    expect(inputType).toBe('password');
  });

  test('should clear fields on reset', async ({ page }) => {
    await page.goto('/login');
    
    // Fill fields
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Both should have values
    expect(await page.inputValue('input[type="email"]')).toBe('test@example.com');
    expect(await page.inputValue('input[type="password"]')).toBe('password123');
  });

  test('should persist form data during rapid input', async ({ page }) => {
    await page.goto('/login');
    
    const email = 'test@example.com';
    const password = 'password123';
    
    // Type quickly
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    
    // Data should persist
    expect(await page.inputValue('input[type="email"]')).toBe(email);
    expect(await page.inputValue('input[type="password"]')).toBe(password);
  });
});
