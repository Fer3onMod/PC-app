const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  print: (options) => ipcRenderer.send('print-invoice', options),
  openExternal: (url) => ipcRenderer.send('open-external-url', url),
  isWindowsApp: true,
});
