const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('Starting Playwright test for MindLoop Frontend...\n');

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // Store console messages
  const consoleLogs = [];
  const consoleErrors = [];

  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleLogs.push(text);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  // Store network errors
  const networkErrors = [];
  page.on('response', response => {
    if (!response.ok()) {
      networkErrors.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });

  try {
    // Step 1: Navigate to the URL
    console.log('Step 1: Navigating to https://mindloop-frontend.vercel.app');
    await page.goto('https://mindloop-frontend.vercel.app', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log('Page loaded successfully\n');

    // Step 2: Take initial screenshot
    console.log('Step 2: Taking initial screenshot');
    await page.screenshot({
      path: '/home/puppyn/projects/mindloop-frontend/screenshot-initial.png',
      fullPage: true
    });
    console.log('Initial screenshot saved to screenshot-initial.png\n');

    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Step 3: Find textarea and type the text
    console.log('\nStep 3: Finding textarea input and typing text');

    // Try to find the textarea - try multiple selectors
    let textarea = null;
    const selectors = [
      'textarea',
      'textarea[placeholder*="evento"]',
      'textarea[placeholder*="Evento"]',
      '[data-testid="event-input"]',
      'textarea.w-full'
    ];

    for (const selector of selectors) {
      try {
        textarea = await page.$(selector);
        if (textarea) {
          console.log(`Found textarea using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue trying
      }
    }

    if (!textarea) {
      console.error('ERROR: Could not find textarea element');
      console.log('\nPage content:');
      console.log(await page.content());
      throw new Error('Textarea not found');
    }

    // Type the text
    await textarea.type('Manutenção preventiva realizada', { delay: 50 });
    console.log('Text typed: "Manutenção preventiva realizada"\n');

    // Wait a moment for any debouncing
    await page.waitForTimeout(500);

    // Step 4: Click the "Classificar Evento" button
    console.log('Step 4: Finding and clicking "Classificar Evento" button');

    let button = null;
    const buttonSelectors = [
      'button:has-text("Classificar Evento")',
      'button:has-text("Classificar")',
      'button[type="submit"]',
      'button.bg-blue-600',
      '[data-testid="classify-button"]'
    ];

    for (const selector of buttonSelectors) {
      try {
        button = await page.$(selector);
        if (button) {
          console.log(`Found button using selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue trying
      }
    }

    if (!button) {
      console.error('ERROR: Could not find "Classificar Evento" button');
      throw new Error('Button not found');
    }

    // Click the button
    await button.click();
    console.log('Button clicked\n');

    // Step 5: Wait for response or error
    console.log('Step 5: Waiting for response...');

    // Wait for either success or error response
    try {
      await Promise.race([
        page.waitForSelector('[data-testid="classification-result"]', { timeout: 10000 }),
        page.waitForSelector('.text-red-500', { timeout: 10000 }),
        page.waitForSelector('.error', { timeout: 10000 }),
        page.waitForTimeout(10000)
      ]);
    } catch (e) {
      console.log('Timeout waiting for response - checking what we got...');
    }

    // Wait a bit more to ensure everything is rendered
    await page.waitForTimeout(2000);

    // Step 6: Take final screenshot
    console.log('\nStep 6: Taking final screenshot');
    await page.screenshot({
      path: '/home/puppyn/projects/mindloop-frontend/screenshot-result.png',
      fullPage: true
    });
    console.log('Final screenshot saved to screenshot-result.png\n');

    // Step 7: Check for errors
    console.log('Step 7: Checking for errors\n');

    // Try to find result elements
    const resultText = await page.textContent('body').catch(() => '');

    // Look for classification result
    const hasResult = resultText.includes('Classificação') ||
                      resultText.includes('classificação') ||
                      resultText.includes('Classe:') ||
                      resultText.includes('Confidência:');

    // Look for error messages
    const hasError = resultText.includes('Erro') ||
                     resultText.includes('erro') ||
                     resultText.includes('falha') ||
                     resultText.includes('Error');

    console.log('='.repeat(60));
    console.log('TEST RESULTS');
    console.log('='.repeat(60));

    if (hasResult) {
      console.log('\n✓ SUCCESS: Classification result found on page');

      // Try to extract the classification details
      try {
        const pageContent = await page.content();
        console.log('\nPage content includes:');
        if (pageContent.includes('Acidente')) console.log('  - Found: Acidente classification');
        if (pageContent.includes('Incidente')) console.log('  - Found: Incidente classification');
        if (pageContent.includes('Quase Acidente')) console.log('  - Found: Quase Acidente classification');
        if (pageContent.includes('Confidência')) console.log('  - Found: Confidence score');
      } catch (e) {
        // Ignore
      }
    } else if (hasError) {
      console.log('\n✗ ERROR: Error message found on page');
    } else {
      console.log('\n? UNKNOWN: No clear result or error found');
    }

    // Report console errors
    if (consoleErrors.length > 0) {
      console.log('\n\nBrowser Console Errors:');
      console.log('-'.repeat(60));
      consoleErrors.forEach(err => console.log(err));
    } else {
      console.log('\n\n✓ No browser console errors');
    }

    // Report network errors
    if (networkErrors.length > 0) {
      console.log('\n\nNetwork Errors:');
      console.log('-'.repeat(60));
      networkErrors.forEach(err => {
        console.log(`${err.status} ${err.statusText}: ${err.url}`);
      });
    } else {
      console.log('✓ No network errors');
    }

    // Report all console logs
    if (consoleLogs.length > 0) {
      console.log('\n\nAll Browser Console Logs:');
      console.log('-'.repeat(60));
      consoleLogs.forEach(log => console.log(log));
    }

    console.log('\n' + '='.repeat(60));
    console.log('\nScreenshots saved:');
    console.log('  - screenshot-initial.png (before interaction)');
    console.log('  - screenshot-result.png (after classification)');
    console.log('\n');

  } catch (error) {
    console.error('\n\nFATAL ERROR during test:');
    console.error(error.message);
    console.error(error.stack);

    // Take error screenshot
    try {
      await page.screenshot({
        path: '/home/puppyn/projects/mindloop-frontend/screenshot-error.png',
        fullPage: true
      });
      console.log('\nError screenshot saved to screenshot-error.png');
    } catch (e) {
      // Ignore
    }
  } finally {
    await browser.close();
  }
})();
