import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      service: <TInput, TOutput>(serviceName: string, options: TInput) => Promise<TOutput>;
      platform: string;
      machineId: string;
      isPackaged: Promise<boolean>;
      clipboard: {
        writeText: (text: string) => void;
      };
      openSettings: () => void;
      checkForUpdates: () => void;
      openAbout: () => void;
      lock: (email: string) => void;
      logout: (email: string) => void;
      quit: () => void;
      on: (channel: string, callback: (event: IpcRendererEvent, ...args: any[]) => void) => void;
      removeAllListeners: (channel: string) => void;
    };
    isPackaged: boolean;
    isDev: boolean;
  }
}
