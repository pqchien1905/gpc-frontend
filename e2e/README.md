# E2E Tests - Google Photos Clone Frontend

## Overview

End-to-End tests for Google Photos Clone using Playwright. Tests cover authentication, photos, albums, uploads, friends, sharing, and notifications.

## Prerequisites

- Node.js 18+
- Frontend running on `http://localhost:3000` (or configure in `playwright.config.ts`)
- Backend API running on `http://localhost:8000` (optional, for full integration tests)

## Setup

```bash
# Install dependencies (already done)
npm install -D @playwright/test

# Install browsers
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests in debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test e2e/auth.spec.ts
```

### Run tests matching pattern
```bash
npx playwright test --grep "login"
```

### Run tests on specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

### Test Files

1. **auth.spec.ts** - Authentication tests
   - Login page display
   - Form validation
   - Navigation to register/forgot password
   - Email validation
   - Password field behavior

2. **photos.spec.ts** - Photos gallery tests
   - Photos page rendering
   - Search functionality
   - Navigation
   - Image loading
   - Pagination/infinite scroll
   - Filtering/sorting
   - Favorites action
   - Multi-select
   - Upload button
   - Responsive design
   - Network error handling

3. **albums.spec.ts** - Albums management tests
   - Albums list/grid display
   - Create album
   - Album details view
   - Album actions (edit, delete, share)
   - Set cover photo
   - Add/remove photos
   - Album deletion confirmation
   - Responsive design

4. **upload.spec.ts** - Photo upload tests
   - Upload page display
   - Dropzone functionality
   - File selection
   - Upload progress
   - Status messages
   - Multiple file selection
   - File type filtering
   - Album selection
   - Upload retry
   - Size validation
   - Storage quota info
   - Responsive design

5. **friends.spec.ts** - Friends and sharing tests
   - Friends list
   - Add friend
   - Friend search
   - Pending requests
   - Accept/reject/remove friend
   - Block/unblock friend
   - Shares page
   - Notifications page
   - Mark as read
   - Unread count badge
   - Responsive design

## Environment Variables

```bash
# Backend API URL (optional)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Storage URL
NEXT_PUBLIC_STORAGE_URL=http://localhost:8000/storage

# Test credentials (for authenticated tests)
TEST_EMAIL=test@example.com
TEST_PASSWORD=password123
```

## Configuration

See `playwright.config.ts` for:
- Test directory
- Browser configurations
- Reporter options
- Screenshot/trace collection
- Web server settings

## Test Patterns

### Basic test
```typescript
test('should display login page', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('text=Đăng nhập')).toBeVisible();
});
```

### Test with fixtures
```typescript
import { test, expect } from './fixtures';

test('authenticated action', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/albums');
  // Test authenticated features
});
```

### Test with multiple steps
```typescript
test('should create album and add photo', async ({ page }) => {
  // Step 1: Navigate to albums
  await page.goto('/albums');
  
  // Step 2: Create album
  await page.click('button:has-text("Tạo")');
  await page.fill('input[name="name"]', 'My Album');
  
  // Step 3: Verify creation
  await expect(page.locator('text=My Album')).toBeVisible();
});
```

## Best Practices

1. **Selectors**: Use semantic selectors
   - Prefer `text=` for buttons
   - Use `role=` for accessible elements
   - Use `aria-label` for icons
   - Avoid hardcoded coordinates

2. **Waits**: Be explicit
   - Use `waitForURL()` for navigation
   - Use `waitForLoadState()` for loading
   - Use `timeout` for important waits

3. **Error Handling**: Test gracefully
   - Use `.catch()` for optional elements
   - Check element count with `.count()`
   - Handle missing elements

4. **Assertions**: Use proper matchers
   - `toBeVisible()` - element is visible
   - `toHaveCount()` - element count
   - `toHaveText()` - element text
   - `toHaveURL()` - page URL

## Debugging

### View test report
```bash
npx playwright show-report
```

### Record test actions
```bash
npx playwright codegen http://localhost:3000
```

### Enable verbose logging
```bash
DEBUG=pw:api npx playwright test
```

### Inspector
```bash
npx playwright test --debug
```

## CI/CD Integration

For GitHub Actions:

```yaml
- name: Run Playwright tests
  run: npm run test:e2e
  env:
    NEXT_PUBLIC_API_URL: http://localhost:8000
```

## Notes

- Tests check for UI structure and functionality
- Some tests may skip if features are not yet implemented
- All navigation is tested on mobile viewport (375x667)
- Tests are designed to work with or without backend API
- Error states are tested gracefully

## Troubleshooting

### Tests timeout
- Ensure frontend is running: `npm run dev`
- Check `baseURL` in playwright.config.ts
- Increase timeout with `timeout: 30000`

### Tests fail to find elements
- Check Vietnamese text matches exactly
- Use page inspector: `npx playwright codegen`
- Check element selectors are correct

### Browser won't launch
- Run `npx playwright install`
- Check system requirements
- Try `--headed` mode to see what's happening

## Future Improvements

- [ ] Add authentication fixture for all protected tests
- [ ] Add database seeding for test data
- [ ] Add visual regression tests
- [ ] Add performance tests
- [ ] Add accessibility tests
- [ ] Add API mocking for offline testing
