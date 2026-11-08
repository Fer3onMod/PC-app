const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 800,
    minWidth: 1024,
    minHeight: 680,
    title: 'Top Security - أنظمة المراقبة وإدارة المبيعات والحسابات',
    backgroundColor: '#0f172a',
    frame: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      spellcheck: false,
    },
  });

  // Determine path to built index.html
  // Handles running unpackaged, packaged in asar, or with custom dev URL
  const isDev = process.env.NODE_ENV === 'development' && process.env.VITE_DEV_SERVER_URL;
  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // Check multiple potential locations for dist/index.html
    const candidates = [
      path.join(__dirname, '../dist/index.html'),
      path.join(app.getAppPath(), 'dist/index.html'),
      path.join(process.resourcesPath || '', 'app.asar/dist/index.html'),
      path.join(process.resourcesPath || '', 'app/dist/index.html'),
    ];

    let targetFile = candidates.find((p) => {
      try {
        return fs.existsSync(p);
      } catch {
        return false;
      }
    }) || candidates[0];

    mainWindow.loadFile(targetFile);
  }

  // Fallback handler if load fails
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load URL:', errorCode, errorDescription, validatedURL);
    try {
      mainWindow.loadFile(path.join(app.getAppPath(), 'dist/index.html'));
    } catch (e) {
      console.error('Fallback load error:', e);
    }
  });

  // Enable F12 toggle for debugging if needed
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // Maximize by default for full workstation POS feel
  mainWindow.maximize();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Window control handlers from renderer (custom Windows titlebar)
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('print-invoice', (event, options) => {
  if (mainWindow) {
    mainWindow.webContents.print({
      silent: false,
      printBackground: true,
      deviceName: options?.deviceName || '',
      ...options,
    });
  }
});

ipcMain.on('open-external-url', (event, url) => {
  if (url && typeof url === 'string') {
    shell.openExternal(url);
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
