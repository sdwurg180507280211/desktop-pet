const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')

let mainWindow = null

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
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  if (process.platform === 'darwin') {
    app.dock?.hide()
  }

  const devUrl = process.env.VITE_DEV_SERVER_URL
  if (devUrl) {
    mainWindow.loadURL(devUrl)
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => app.quit())

ipcMain.on('pet:close', () => mainWindow?.close())
ipcMain.on('pet:minimize', () => mainWindow?.minimize())
ipcMain.on('pet:always-on-top', (_event, enabled) => mainWindow?.setAlwaysOnTop(enabled))
