import { BrowserWindow, ipcMain, IpcMainInvokeEvent, app, powerMonitor } from 'electron/main';
import { clipboard } from 'electron/common';
import { login, prelogin, lock, logout, unlock, sendEmailLogin } from '@bitclient/common/services/auth';
import { getSecret, sync } from '@bitclient/common/services/vault';
import Service from '@bitclient/common/types/Service';
import Injections from '@bitclient/common/types/Injections';

import http from './httpRequest';
import db from './database';
import { ApplicationContextJSON } from '@bitclient/common/types/ApplicationContext';

const copySecret: Service<
  {
    ctx: ApplicationContextJSON;
    cipherId: string;
    secret: string;
  },
  void
> = async function (injections, { ctx, cipherId, secret }) {
  const decrypted = await getSecret(injections, { ctx, cipherId, secret });
  clipboard.writeText(decrypted);

  setTimeout(() => {
    if (clipboard.readText() !== decrypted) return;
    clipboard.clear();
  }, 1000 * 60);
};

const SERVICEs: { [name: string]: Service<any, any> } = {
  prelogin,
  login,
  sync,
  getSecret,
  copySecret,
  lock,
  logout,
  unlock,
  sendEmailLogin,
};

const INJECTIONs: Injections = {
  http,
  db,
};

export default function registerIPCHandlers(window: BrowserWindow) {
  // remove handlers
  ipcMain.removeHandler('isPackaged');
  ipcMain.removeHandler('service');

  // register handlers
  ipcMain.handle('isPackaged', () => app.isPackaged);
  ipcMain.handle(
    'service',
    <TArgs, TResult>({ sender }: IpcMainInvokeEvent, service: string, args: TArgs): TResult => {
      if (sender !== window.webContents) {
        throw new UFOError();
      }
      if (!SERVICEs[service]) {
        throw new Error(`Service ${service} not found 🛸`);
      }
      return SERVICEs[service](INJECTIONs, args);
    },
  );

  // remove listeners
  ipcMain.removeAllListeners();

  // register listeners
  ipcMain.on('lock', ({ sender }: IpcMainInvokeEvent, email?: string) => {
    if (sender !== window.webContents) {
      throw new UFOError();
    }
    Promise.resolve(lock(INJECTIONs, { email })).then(() => window.webContents.send('lock'));
  });
  ipcMain.on('logout', ({ sender }: IpcMainInvokeEvent, email: string) => {
    if (sender !== window.webContents) {
      throw new UFOError();
    }
    Promise.resolve(logout(INJECTIONs, { email })).then(() => window.webContents.send('logout'));
  });
  ipcMain.on('quit', () => app.quit());
  ipcMain.on('clipboard.writeText', (_e, text) => clipboard.writeText(text));

  // power monitor events
  powerMonitor.removeAllListeners();
  powerMonitor.addListener('lock-screen', async () => {
    await Promise.resolve(lock(INJECTIONs, {}));
    window.webContents.send('lock');
  });
}

class UFOError extends Error {
  name: string = 'UFO Error';
  message: string = '🛸';
}
