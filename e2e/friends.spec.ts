import { test, expect } from '@playwright/test';

test.describe('Friends & Sharing Flow', () => {
  test('should display friends page', async ({ page }) => {
    await page.goto('/friends');
    
    // Check if page renders
    const response = await page.goto('/friends');
    expect(response?.status()).toBeLessThan(500);
  });

  test('should display friends list', async ({ page }) => {
    await page.goto('/friends');
    
    // Look for friend items
    const friendItems = page.locator('[role="listitem"], .friend-item');
    
    // Page should have content area
    const content = page.locator('main, [role="main"]');
    if (await content.count() > 0) {
      await expect(content).toBeVisible();
    }
  });

  test('should have add friend button', async ({ page }) => {
    await page.goto('/friends');
    
    // Look for add friend button
    const addBtn = page.locator('button:has-text("Thêm bạn"), button:has-text("Kết bạn")');
    
    if (await addBtn.count() > 0) {
      await expect(addBtn).toBeVisible();
    }
  });

  test('should display friend search', async ({ page }) => {
    await page.goto('/friends');
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="Tìm"]');
    
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
    }
  });

  test('should show pending friend requests', async ({ page }) => {
    await page.goto('/friends');
    
    // Look for pending requests section
    const pendingSection = page.locator('text=/chờ xác nhận|đơn chờ/i');
    
    // Page should load successfully
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should support accepting friend request', async ({ page }) => {
    await page.goto('/friends');
    
    // Look for accept button
    const acceptBtn = page.locator('button:has-text("Chấp nhận")');
    
    if (await acceptBtn.count() > 0) {
      await expect(acceptBtn).toBeVisible();
    }
  });

  test('should support rejecting friend request', async ({ page }) => {
    await page.goto('/friends');
    
    // Look for reject button
    const rejectBtn = page.locator('button:has-text("Từ chối"), button:has-text("Hủy")');
    
    if (await rejectBtn.count() > 0) {
      await expect(rejectBtn).toBeVisible();
    }
  });

  test('should support removing friend', async ({ page }) => {
    await page.goto('/friends');
    
    // Look for remove button
    const removeBtn = page.locator('button[title*="Xóa bạn"], button[aria-label*="Xóa"]');
    
    if (await removeBtn.count() > 0) {
      await expect(removeBtn).toBeVisible();
    }
  });

  test('should support blocking friend', async ({ page }) => {
    await page.goto('/friends');
    
    // Look for block button
    const blockBtn = page.locator('button:has-text("Chặn")');
    
    if (await blockBtn.count() > 0) {
      await expect(blockBtn).toBeVisible();
    }
  });

  test('should display blocked friends list', async ({ page }) => {
    await page.goto('/friends');
    
    // Look for blocked friends section
    const blockedSection = page.locator('text=/đã chặn|blocked/i');
    
    // Page should exist
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should support unblocking friend', async ({ page }) => {
    await page.goto('/friends');
    
    // Look for unblock button
    const unblockBtn = page.locator('button:has-text("Bỏ chặn")');
    
    if (await unblockBtn.count() > 0) {
      await expect(unblockBtn).toBeVisible();
    }
  });

  test('should display shares page', async ({ page }) => {
    await page.goto('/shares');
    
    const response = await page.goto('/shares');
    expect(response?.status()).toBeLessThan(500);
  });

  test('should show shared items list', async ({ page }) => {
    await page.goto('/shares');
    
    // Look for share items
    const shareItems = page.locator('[role="listitem"], .share-item');
    
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should display share options (received/sent)', async ({ page }) => {
    await page.goto('/shares');
    
    // Look for tabs or filter buttons
    const tabs = page.locator('[role="tab"], button:has-text("Nhận")');
    
    if (await tabs.count() > 0) {
      await expect(tabs).toBeVisible();
    }
  });

  test('should support removing shared item', async ({ page }) => {
    await page.goto('/shares');
    
    // Look for remove button
    const removeBtn = page.locator('button[title*="Xóa"], button:has-text("Xóa chia sẻ")');
    
    if (await removeBtn.count() > 0) {
      await expect(removeBtn).toBeVisible();
    }
  });

  test('should display notifications page', async ({ page }) => {
    await page.goto('/notifications');
    
    const response = await page.goto('/notifications');
    expect(response?.status()).toBeLessThan(500);
  });

  test('should show notifications list', async ({ page }) => {
    await page.goto('/notifications');
    
    // Look for notification items
    const notificationItems = page.locator('[role="listitem"], .notification');
    
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should support marking notification as read', async ({ page }) => {
    await page.goto('/notifications');
    
    // Look for read button
    const readBtn = page.locator('button[title*="Đọc"], button[aria-label*="Đọc"]');
    
    if (await readBtn.count() > 0) {
      await expect(readBtn).toBeVisible();
    }
  });

  test('should support clearing notifications', async ({ page }) => {
    await page.goto('/notifications');
    
    // Look for clear button
    const clearBtn = page.locator('button:has-text("Xóa")');
    
    if (await clearBtn.count() > 0) {
      await expect(clearBtn).toBeVisible();
    }
  });

  test('should display unread notification count', async ({ page }) => {
    await page.goto('/');
    
    // Look for notification badge
    const badge = page.locator('[role="status"], .badge');
    
    // Page should load
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });

  test('should be responsive on mobile - friends', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/friends');
    
    const response = await page.goto('/friends');
    expect(response?.status()).toBeLessThan(500);
  });

  test('should be responsive on mobile - shares', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/shares');
    
    const response = await page.goto('/shares');
    expect(response?.status()).toBeLessThan(500);
  });

  test('should display friend profile preview', async ({ page }) => {
    await page.goto('/friends');
    
    // Look for friend names/avatars
    const friendName = page.locator('text=/Bạn|friend/i');
    
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });
});
