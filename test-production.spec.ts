import { test, expect } from '@playwright/test';

test.describe('LoopynSMS Production Tests', () => {
  const PRODUCTION_URL = 'https://projeto-anp.mindloop.ia.br';
  const BACKEND_URL = 'https://mindloop-backend.vercel.app';

  test('should load the page with correct branding', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Check page title
    await expect(page).toHaveTitle(/LoopynLab/);

    // Check for LoopynSMS branding
    await expect(page.locator('text=Loopyn')).toBeVisible();
    await expect(page.locator('text=SMS')).toBeVisible();

    // Check for main elements
    await expect(page.locator('text=Ideia Central')).toBeVisible();
    await expect(page.locator('text=Classificar Evento SMS')).toBeVisible();
  });

  test('should verify backend is accessible', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('ok');
    expect(data.message).toBe('MindLoop Backend API');
  });

  test('should test classification with real backend request', async ({ page }) => {
    // Enable console logging to capture errors
    const consoleLogs: string[] = [];
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else {
        consoleLogs.push(msg.text());
      }
    });

    // Intercept network requests to see what's happening
    const networkRequests: any[] = [];
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    });

    const networkResponses: any[] = [];
    page.on('response', response => {
      networkResponses.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    });

    await page.goto(PRODUCTION_URL);

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Fill in the textarea
    const testEvent = 'Trabalhador escorregou no chão molhado durante limpeza de área industrial';
    await page.fill('textarea', testEvent);

    // Click the classify button
    const classifyButton = page.locator('button', { hasText: 'Classificar Evento' });
    await expect(classifyButton).toBeEnabled();

    await classifyButton.click();

    // Wait for loading state
    await expect(page.locator('text=Classificando...')).toBeVisible({ timeout: 5000 });

    // Wait for result or error (increased timeout for serverless cold start)
    await page.waitForTimeout(15000);

    // Check for errors
    const errorElement = page.locator('text=Erro');
    const errorVisible = await errorElement.isVisible().catch(() => false);

    if (errorVisible) {
      const errorText = await page.locator('.text-destructive').allTextContents();
      console.log('❌ Error found on page:', errorText);

      console.log('\n📋 Console Errors:', consoleErrors);
      console.log('\n📋 Console Logs:', consoleLogs.slice(-10));
      console.log('\n🌐 Network Requests to backend:',
        networkRequests.filter(r => r.url.includes('mindloop-backend') || r.url.includes('predict'))
      );
      console.log('\n🌐 Network Responses:',
        networkResponses.filter(r => r.url.includes('mindloop-backend') || r.url.includes('predict'))
      );
    }

    // Check for success result
    const resultElement = page.locator('text=Classificação da Ocorrência');
    const resultVisible = await resultElement.isVisible().catch(() => false);

    if (resultVisible) {
      console.log('✅ Classification succeeded!');
      await expect(page.locator('text=Classe Atribuída')).toBeVisible();
    }

    // Take screenshot for debugging
    await page.screenshot({ path: '/home/puppyn/projects/mindloop-frontend/test-result.png', fullPage: true });

    console.log('\n📊 Test Summary:');
    console.log('Error visible:', errorVisible);
    console.log('Result visible:', resultVisible);
    console.log('Console errors count:', consoleErrors.length);
    console.log('Backend requests:', networkRequests.filter(r => r.url.includes('predict')).length);

    // The test should have either an error or a result
    expect(errorVisible || resultVisible).toBeTruthy();
  });

  test('should check NEXT_PUBLIC_API_URL configuration', async ({ page }) => {
    await page.goto(PRODUCTION_URL);

    // Execute JavaScript to check the environment variable
    const apiUrl = await page.evaluate(() => {
      return (window as any).NEXT_PUBLIC_API_URL ||
             process?.env?.NEXT_PUBLIC_API_URL ||
             'not found';
    });

    console.log('🔍 NEXT_PUBLIC_API_URL in browser:', apiUrl);

    // Check if it's accessing the correct API URL from the page source
    const pageContent = await page.content();
    console.log('🔍 Checking for API URL references in page...');

    if (pageContent.includes('localhost:8000')) {
      console.log('⚠️  WARNING: Page contains reference to localhost:8000');
    }
    if (pageContent.includes('mindloop-backend.vercel.app')) {
      console.log('✅ Page contains reference to production backend');
    }
  });
});
