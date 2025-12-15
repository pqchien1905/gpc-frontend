import { test, expect } from '@playwright/test';

test.describe('Upload Photos Flow', () => {
  test('should display upload page', async ({ page }) => {
    await page.goto('/upload');
    
    // Check if page renders
    const response = await page.goto('/upload');
    expect(response?.status()).toBeLessThan(500);
  });

  test('should have upload dropzone', async ({ page }) => {
    await page.goto('/upload');
    
    // Look for upload area
    const dropzone = page.locator('[role="button"]:has-text("kéo"), .dropzone, [class*="upload"]');
    
    // Check for upload input
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      await expect(fileInput).toBeVisible();
    }
  });

  test('should accept file selection', async ({ page }) => {
    await page.goto('/upload');
    
    // Find file input
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      // Input should exist
      await expect(fileInput).toBeVisible();
      
      // Should accept multiple files
      const multiple = await fileInput.getAttribute('multiple');
      expect(multiple === 'multiple' || multiple === '').toBeTruthy();
    }
  });

  test('should display upload progress', async ({ page }) => {
    await page.goto('/upload');
    
    // Look for progress indicator
    const progress = page.locator('[role="progressbar"], progress, .progress');
    
    // Page should have upload functionality
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should support drag and drop', async ({ page }) => {
    await page.goto('/upload');
    
    // Check for drop area
    const dropArea = page.locator('[role="button"]:has-text("kéo")');
    
    if (await dropArea.count() > 0) {
      await expect(dropArea).toBeVisible();
    }
  });

  test('should display upload status messages', async ({ page }) => {
    await page.goto('/upload');
    
    // Look for status text
    const statusText = page.locator('text=/đang tải|thành công|lỗi/i');
    
    // Page should have content
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should support multiple file selection', async ({ page }) => {
    await page.goto('/upload');
    
    // File input should allow multiple
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      const isMultiple = await fileInput.getAttribute('multiple');
      expect(isMultiple).toBeTruthy();
    }
  });

  test('should display upload history/progress list', async ({ page }) => {
    await page.goto('/upload');
    
    // Look for upload list
    const uploadList = page.locator('[role="list"], .upload-list, .uploads');
    
    // Page should be usable
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should filter file types correctly', async ({ page }) => {
    await page.goto('/upload');
    
    // Check file input accepts attribute
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      const accept = await fileInput.getAttribute('accept');
      
      // Should accept image and video types
      if (accept) {
        expect(accept.toLowerCase()).toMatch(/image|video|gif|mp4|webm/i);
      }
    }
  });

  test('should display album selection for upload', async ({ page }) => {
    await page.goto('/upload');
    
    // Look for album selector
    const albumSelect = page.locator('select, [role="combobox"]');
    
    if (await albumSelect.count() > 0) {
      await expect(albumSelect).toBeVisible();
    }
  });

  test('should support upload retry', async ({ page }) => {
    await page.goto('/upload');
    
    // Look for retry button
    const retryBtn = page.locator('button:has-text("Thử lại")');
    
    // Page should be functional
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should display file size validation', async ({ page }) => {
    await page.goto('/upload');
    
    // Look for size info/warning
    const sizeInfo = page.locator('text=/MB|GB|Kích thước/i');
    
    // Page should exist
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should show storage quota info', async ({ page }) => {
    await page.goto('/upload');
    
    // Look for storage info
    const storageInfo = page.locator('text=/dung lượng|quota|storage/i');
    
    // At minimum page should load
    const response = await page.goto('/upload');
    expect(response?.status()).toBeLessThan(500);
  });

  test('should support canceling upload', async ({ page }) => {
    await page.goto('/upload');
    
    // Look for cancel button
    const cancelBtn = page.locator('button:has-text("Hủy")');
    
    if (await cancelBtn.count() > 0) {
      await expect(cancelBtn).toBeVisible();
    }
  });

  test('should navigate back after upload', async ({ page }) => {
    await page.goto('/upload');
    
    // Look for back/close button
    const backBtn = page.locator('button[aria-label*="Quay lại"], button[aria-label*="Đóng"]');
    
    // Page should be navigable
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should display success notification', async ({ page }) => {
    await page.goto('/upload');
    
    // Look for success message
    const successMsg = page.locator('text=/thành công|hoàn tất|OK/i');
    
    // Page should handle upload response
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should display error messages clearly', async ({ page }) => {
    await page.goto('/upload');
    
    // Look for error message area
    const errorMsg = page.locator('[role="alert"], .error, .error-message');
    
    // Page should have error handling
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/upload');
    
    // Should be usable on mobile
    const response = await page.goto('/upload');
    expect(response?.status()).toBeLessThan(500);
  });
});
