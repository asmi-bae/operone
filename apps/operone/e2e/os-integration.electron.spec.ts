import { test, expect } from '@playwright/test'
import { 
  launchElectronApp, 
  setupCommonIPCMocks,
  setupSystemStatusMocks,
  waitForAppReady 
} from './test-utils'

test.describe('OS Integration', () => {
  let app: any

  test.beforeAll(async () => {
    // Launch Electron app
    app = await launchElectronApp()
    
    // Setup common IPC mocks
    await setupCommonIPCMocks(app)
    
    // Setup system status mocks
    await setupSystemStatusMocks(app)
  })

  test.afterAll(async () => {
    await app.close()
  })

  test('should display system status metrics', async () => {
    const page = await app.firstWindow()
    
    // Log console messages for debugging
    page.on('console', (msg: any) => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`))
    page.on('pageerror', (err: any) => console.log(`[Browser Page Error] ${err.message}`))
    
    // Wait for app to be ready
    await waitForAppReady(page)
    
    // Wait for the main app to load
    await page.waitForSelector('text=Operone', { timeout: 10000 })
    
    // Click on System Status in sidebar
    await page.click('text=System Status')
    
    // Wait for navigation
    await page.waitForTimeout(1000)
    
    // Verify System Status page is displayed
    await expect(page.locator('h3')).toContainText('System Status', { timeout: 10000 })
    
    try {
      // Verify metrics are present (CPU, Memory, Uptime, Platform)
      await expect(page.locator('text=CPU Usage')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=Memory Usage')).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=Uptime')).toBeVisible({ timeout: 5000 })
      
      // Verify actual values are rendered (checking for % or h)
      await expect(page.locator('text=%').first()).toBeVisible({ timeout: 5000 })
      await expect(page.locator('text=h').first()).toBeVisible({ timeout: 5000 })
    } catch (e) {
      console.log('Test failed. Page content:');
      console.log(await page.content());
      throw e;
    }
  })
})
