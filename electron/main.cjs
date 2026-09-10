const { app, BrowserWindow, ipcMain, protocol, net } = require('electron')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

const APP_SCHEME = 'desktop-pet'
const isSmoke = process.argv.includes('--smoke') || process.env.DESKTOP_PET_SMOKE === '1'
let mainWindow = null
let smokeTimer = null

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true
    }
  }
])

function failSmoke(message) {
  if (!isSmoke) return
  console.error(`[desktop-pet-smoke] ${message}`)
  clearTimeout(smokeTimer)
  app.exit(1)
}

function registerAppProtocol() {
  const distRoot = path.resolve(__dirname, '..', 'dist')
  protocol.handle(APP_SCHEME, (request) => {
    const url = new URL(request.url)
    const relativePath = decodeURIComponent(url.pathname || '/')
      .replace(/^\/+/, '') || 'index.html'
    const filePath = path.resolve(distRoot, relativePath)
    const allowedPrefix = `${distRoot}${path.sep}`

    if (filePath !== distRoot && !filePath.startsWith(allowedPrefix)) {
      return new Response('Forbidden', { status: 403 })
    }

    return net.fetch(pathToFileURL(filePath).toString())
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 520,
    height: 720,
    minWidth: 320,
    minHeight: 420,
    transparent: true,
    frame: false,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    show: !isSmoke,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false
    }
  })

  if (process.platform === 'darwin') {
    app.dock?.hide()
  }

  mainWindow.webContents.on('did-fail-load', (_event, code, description) => {
    failSmoke(`page load failed (${code}): ${description}`)
  })
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    failSmoke(`renderer process exited: ${details.reason}`)
  })

  const devUrl = process.env.VITE_DEV_SERVER_URL
  if (devUrl) {
    mainWindow.loadURL(devUrl)
  } else {
    mainWindow.loadURL(`${APP_SCHEME}://app/index.html`)
  }

  if (isSmoke) {
    smokeTimer = setTimeout(() => failSmoke('timeout waiting for default Live2D model'), 45000)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  registerAppProtocol()
  createWindow()
})

app.on('window-all-closed', () => app.quit())

ipcMain.on('pet:close', () => mainWindow?.close())
ipcMain.on('pet:minimize', () => mainWindow?.minimize())
ipcMain.on('pet:always-on-top', (_event, enabled) => mainWindow?.setAlwaysOnTop(enabled))
ipcMain.on('pet:ready', (_event, modelId) => {
  if (!isSmoke) return
  console.log(`[desktop-pet-smoke] ready model=${modelId}`)
  clearTimeout(smokeTimer)
  setTimeout(() => app.exit(0), 100)
})
ipcMain.on('pet:error', (_event, message) => failSmoke(`renderer error: ${message}`))
