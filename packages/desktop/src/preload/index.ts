import { platform } from 'node:process';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron/renderer';
import { exposeElectronAPI } from '@electron-toolkit/preload';
import { machineIdSync } from './machineId';

// Custom APIs for renderer
const api = {
  service: <TInput, TOutput>(serviceName: string, options: TInput): Promise<TOutput> =>
    ipcRenderer.invoke('service', serviceName, options),
  platform,
  machineId: machineIdSync(),
  isPackaged: ipcRenderer.invoke('isPackaged'),
  clipboard: {
    writeText: (text: string) => ipcRenderer.send('clipboard.writeText', text),
  },
  openSettings: () => ipcRenderer.send('open-settings'),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  openAbout: () => ipcRenderer.send('open-about'),
  lock: (email: string) => ipcRenderer.send('lock', email),
  logout: (email: string) => ipcRenderer.send('logout', email),
  quit: () => ipcRenderer.send('quit'),
  on: (channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void) =>
    ipcRenderer.on(channel, callback),
  removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
try {
  exposeElectronAPI();
  contextBridge.exposeInMainWorld('api', api);
} catch (error) {
  console.error(error);
}
