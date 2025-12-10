import { ElectronApplication, Page, _electron as electron } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Launch Electron app with common configuration
 */
export async function launchElectronApp(): Promise<ElectronApplication> {
  const electronApp = await electron.launch({
    args: [path.join(__dirname, '../dist-electron/main.js')],
    env: { ...process.env, NODE_ENV: 'test' }
  })
  return electronApp
}

/**
 * Setup common IPC mocks for testing
 */
export async function setupCommonIPCMocks(electronApp: ElectronApplication) {
  // Mock auth:getUser
  await electronApp.evaluate(({ ipcMain }) => {
    ipcMain.removeHandler('auth:getUser')
    ipcMain.handle('auth:getUser', () => {
      return { id: 'test-user', name: 'Test User', email: 'test@example.com' }
    })
  })

  // Mock ai:sendMessage with streaming
  await electronApp.evaluate(({ ipcMain, BrowserWindow }) => {
    ipcMain.removeHandler('ai:sendMessage')
    ipcMain.handle('ai:sendMessage', async (event, message) => {
      const window = BrowserWindow.getAllWindows()[0]
      // Simulate streaming response
      setTimeout(() => {
        window.webContents.send('ai:stream:token', 'Hello ')
      }, 100)
      setTimeout(() => {
        window.webContents.send('ai:stream:token', 'World!')
      }, 200)
      setTimeout(() => {
        window.webContents.send('ai:stream:complete', 'Hello World!')
      }, 300)
      return { success: true }
    })
  })
}

/**
 * Wait for the Electron app to be fully initialized
 */
export async function waitForAppReady(window: Page, timeout = 10000) {
  // Wait for the window to load
  await window.waitForLoadState('domcontentloaded', { timeout })
  
  // Wait for React to render
  await window.waitForSelector('body', { timeout })
  
  // Wait a bit for contexts to initialize
  await window.waitForTimeout(500)
}

/**
 * Wait for chat interface to be ready
 */
export async function waitForChatReady(page: Page, timeout = 10000) {
  // Wait for the chat input to be visible
  await page.waitForSelector('[data-testid="chat-input"]', { 
    state: 'visible',
    timeout 
  })
  
  // Wait for the send button to be visible
  await page.waitForSelector('[data-testid="send-button"]', { 
    state: 'visible',
    timeout 
  })
}

/**
 * Send a chat message and wait for response
 */
export async function sendChatMessage(page: Page, message: string) {
  const input = page.locator('[data-testid="chat-input"]')
  await input.fill(message)
  
  const sendButton = page.locator('[data-testid="send-button"]')
  await sendButton.click()
  
  // Wait for the message to appear
  await page.waitForTimeout(500)
}

/**
 * Navigate to a specific route in browser mode
 */
export async function navigateToRoute(page: Page, route: string) {
  await page.goto(`http://localhost:5173${route}`)
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(500)
}

/**
 * Setup system status IPC mocks
 */
export async function setupSystemStatusMocks(electronApp: ElectronApplication) {
  await electronApp.evaluate(({ ipcMain }) => {
    ipcMain.removeHandler('system:getStatus')
    ipcMain.handle('system:getStatus', () => {
      return {
        cpu: 45.2,
        memory: 62.8,
        disk: 78.5,
        network: {
          upload: 125.5,
          download: 1024.3
        }
      }
    })
  })
}
