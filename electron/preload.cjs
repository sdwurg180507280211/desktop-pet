const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('desktopPet', {
  close: () => ipcRenderer.send('pet:close'),
  minimize: () => ipcRenderer.send('pet:minimize'),
  setAlwaysOnTop: (enabled) => ipcRenderer.send('pet:always-on-top', Boolean(enabled))
})
