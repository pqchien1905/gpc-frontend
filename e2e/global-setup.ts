import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for E2E tests
 * Runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test suite setup...');
  
  // Optional: Check if backend is available
  try {
    const browser = await chromium.launch();
    const context = await browser.createContext();
    const page = await context.newPage();
    
    // Try to ping the backend API
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await page.goto(apiUrl, { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null);
      
      if (response) {
        console.log(`✓ Backend API accessible at ${apiUrl}`);
      } else {
        console.log(`⚠ Backend API might not be running at ${apiUrl}`);
        console.log('  Make sure your Laravel backend is running (php artisan serve)');
      }
    } catch (error) {
      console.log('⚠ Could not connect to backend API');
      console.log('  This is optional - tests may still work if only testing frontend');
    }
    
    await browser.close();
  } catch (error) {
    console.error('Error during global setup:', error);
  }
  
  console.log('✓ Setup complete\n');
}

export default globalSetup;
