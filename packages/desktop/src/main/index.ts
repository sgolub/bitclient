import { platform } from 'node:process';
import { app, BrowserWindow, Menu, nativeTheme } from 'electron/main';
import { shell } from 'electron/common';
import log from 'electron-log/main';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import registerIPCHandlers from './ipc';

!app.requestSingleInstanceLock() && app.quit();

log.initialize();
log.transports.console.level = is.dev ? 'debug' : 'info';

const BACKGROUNDCOLOR_DARK = '#343a40';
const BACKGROUNDCOLOR_LIGHT = '#e9ecef';

nativeTheme.themeSource = 'dark';

const isMac = process.platform === 'darwin';

function createWindow(): BrowserWindow {
  const backgroundColor = nativeTheme.shouldUseDarkColors
    ? BACKGROUNDCOLOR_DARK
    : BACKGROUNDCOLOR_LIGHT;
  log.info('nativeTheme.themeSource', nativeTheme.themeSource);
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    show: false,
    alwaysOnTop: is.dev,
    title: 'Bitclient',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: backgroundColor,
      symbolColor: nativeTheme.shouldUseDarkColors ? BACKGROUNDCOLOR_LIGHT : BACKGROUNDCOLOR_DARK,
      height: 16 * 3 - 8, // 2.5rem
    },
    backgroundColor,
    ...(platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      scrollBounce: true,
      spellcheck: false,
      devTools: is.dev,
    },
  });
  !isMac
    ? Menu.setApplicationMenu(null)
    : Menu.setApplicationMenu(
        Menu.buildFromTemplate([
          {
            label: 'Bitclient',
            role: 'appMenu',
            submenu: [
              {
                role: 'about',
                label: 'About Bitclient',
                click: async () => {
                  await shell.openExternal(
                    'https://github.com/sgolub/bitclient/blob/main/README.md',
                  );
                },
              },
              { type: 'separator' },
              {
                label: 'Password Generator',
                click: () => {
                  // TODO: Implement password generator
                },
              },
              { type: 'separator' },
              {
                label: 'Sync vault',
                click: () => {},
              },
              {
                label: 'Preferences',
                enabled: false,
              },
              { type: 'separator' },
              {
                label: 'Lock',
                enabled: false,
              },
              {
                label: 'Logout',
                enabled: false,
              },
              {
                label: 'Exit',
                role: 'quit',
                click: () => app.quit(),
              },
            ],
          },
          {
            label: 'Window',
            role: 'windowMenu',
            submenu: [{ role: 'minimize' }, { type: 'separator' }, { role: 'front' }],
          },
          {
            role: 'help',
            submenu: [
              {
                role: 'services',
                label: 'Report Issue',
                click: async () => {
                  await shell.openExternal('https://github.com/sgolub/bitclient/issues/new');
                },
              },
            ],
          },
        ]),
      );

  mainWindow.on('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.bitclient');

  // globalShortcut.register('CommandOrControl+F', () => {
  //   // search
  // });

  // globalShortcut.register('CommandOrControl+N', () => {
  //   // create new item
  // });

  // globalShortcut.register('CommandOrControl+G', () => {
  //   // password generator
  // });

  // globalShortcut.register('CommandOrControl+Shift+R', () => {
  //   // resync
  // });

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    log.debug('Window created');
    optimizer.watchWindowShortcuts(window);
    log.debug('Window shortcuts registered');
    registerIPCHandlers(window);
    log.debug('IPC handlers registered');
  });

  const window = createWindow();
  window.setContentProtection(!is.dev);

  if (is.dev) {
    window.webContents.openDevTools();
    log.debug('DevTools opened');
  }

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
