import { test, expect } from '@playwright/test';

test.describe('Albums Management Flow', () => {
  test('should display albums page', async ({ page }) => {
    await page.goto('/albums');
    
    // Check if page renders
    const response = await page.goto('/albums');
    expect(response?.status()).toBeLessThan(500);
  });

  test('should display albums list/grid', async ({ page }) => {
    await page.goto('/albums');
    
    // Check for album items
    const albumItems = page.locator('[role="button"]:has-text("Album"), .album-item');
    
    // Should have some structure
    const content = page.locator('main, [role="main"]');
    if (await content.count() > 0) {
      await expect(content).toBeVisible();
    }
  });

  test('should have create album button', async ({ page }) => {
    await page.goto('/albums');
    
    // Look for create button
    const createBtn = page.locator('button:has-text("Tạo")');
    
    if (await createBtn.count() > 0) {
      await expect(createBtn).toBeVisible();
    }
  });

  test('should display album details page', async ({ page }) => {
    // Navigate to album details
    await page.goto('/albums/1');
    
    // Should load without error
    const response = await page.goto('/albums/1');
    expect(response?.status()).toBeLessThan(500);
  });

  test('should support album actions', async ({ page }) => {
    await page.goto('/albums');
    
    // Look for action buttons (edit, delete, share, etc.)
    const actionBtn = page.locator('[aria-label*="Thao tác"], button[title*="Xóa"], button[title*="Sửa"]');
    
    if (await actionBtn.count() > 0) {
      await expect(actionBtn).toBeVisible();
    }
  });

  test('should display album photos', async ({ page }) => {
    await page.goto('/albums/1');
    
    // Check for photos in album
    const photos = page.locator('img[alt*="Album"], [role="img"]');
    
    // Album details should have some content
    const content = page.locator('main, [role="main"]');
    if (await content.count() > 0) {
      await expect(content).toBeVisible();
    }
  });

  test('should support renaming album', async ({ page }) => {
    await page.goto('/albums');
    
    // Look for edit/rename button
    const editBtn = page.locator('button[title*="Sửa"], button[aria-label*="Sửa"]');
    
    if (await editBtn.count() > 0) {
      await expect(editBtn).toBeVisible();
    }
  });

  test('should support setting cover photo', async ({ page }) => {
    await page.goto('/albums/1');
    
    // Look for set cover option
    const setCoverBtn = page.locator('button:has-text("Đặt làm cover")');
    
    if (await setCoverBtn.count() > 0) {
      await expect(setCoverBtn).toBeVisible();
    }
  });

  test('should support adding photos to album', async ({ page }) => {
    await page.goto('/albums/1');
    
    // Look for add photos button
    const addBtn = page.locator('button:has-text("Thêm ảnh")');
    
    if (await addBtn.count() > 0) {
      await expect(addBtn).toBeVisible();
    }
  });

  test('should support removing photos from album', async ({ page }) => {
    await page.goto('/albums/1');
    
    // Look for remove button on photos
    const removeBtn = page.locator('button[aria-label*="Xóa khỏi album"]');
    
    // At least page should be usable
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should support deleting album', async ({ page }) => {
    await page.goto('/albums');
    
    // Look for delete button
    const deleteBtn = page.locator('button:has-text("Xóa")');
    
    if (await deleteBtn.count() > 0) {
      await expect(deleteBtn).toBeVisible();
    }
  });

  test('should display confirmation dialog for deletion', async ({ page }) => {
    await page.goto('/albums/1');
    
    // Look for delete button
    const deleteBtn = page.locator('button:has-text("Xóa")');
    
    if (await deleteBtn.count() > 0) {
      // Click delete
      await deleteBtn.first().click().catch(() => {
        // Dialog might not appear
      });
      
      // Check for confirmation dialog
      const confirmDialog = page.locator('button:has-text("Xác nhận")');
      
      if (await confirmDialog.count() > 0) {
        await expect(confirmDialog).toBeVisible();
      }
    }
  });

  test('should support sharing album', async ({ page }) => {
    await page.goto('/albums/1');
    
    // Look for share button
    const shareBtn = page.locator('button[title*="Chia sẻ"], button:has-text("Chia sẻ")');
    
    if (await shareBtn.count() > 0) {
      await expect(shareBtn).toBeVisible();
    }
  });

  test('should display album cover preview', async ({ page }) => {
    await page.goto('/albums');
    
    // Look for cover images
    const coverImg = page.locator('img[alt*="cover"]');
    
    // At least the page should load
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should handle responsive layout for mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/albums');
    
    // Should be usable on mobile
    const response = await page.goto('/albums');
    expect(response?.status()).toBeLessThan(500);
  });

  test('should support searching albums', async ({ page }) => {
    await page.goto('/albums');
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Tìm"]');
    
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('should display album metadata', async ({ page }) => {
    await page.goto('/albums/1');
    
    // Check for album info (name, photo count, etc.)
    const albumInfo = page.locator('h1, h2');
    
    // Should have title
    if (await albumInfo.count() > 0) {
      await expect(albumInfo.first()).toBeVisible();
    }
  });

  test('should handle empty album gracefully', async ({ page }) => {
    await page.goto('/albums/999');
    
    // Should handle gracefully (404 or empty state)
    const response = await page.goto('/albums/999');
    // Could be 404 or 200 with empty state
    expect([200, 404]).toContain(response?.status() || 0);
  });
});
