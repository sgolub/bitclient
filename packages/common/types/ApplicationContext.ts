import BitwardenServer from './BitwardenServer';
import { AccountViewModel } from '../models/view/Account';

export type DeviceInfo = {
  clientId: 'desktop'; // desktop | web
  deviceType: '6' | '7' | '8'; // windows:6 | macos:7 | linux:8
  deviceName: 'windows' | 'macos' | 'linux'; // windows | macos | linux
  deviceIdentifier: string;
};

export type ApplicationContextJSON = {
  account: AccountViewModel | null;
  platform: 'win32' | 'darwin' | 'linux';
  device: { clientId: string; deviceType: string; deviceName: string; deviceIdentifier: string };
  server: { displayName: string; desciption: string; url: string; userAgent: string };
};

export default class ApplicationContext {
  account: AccountViewModel | null = null;
  platform: 'win32' | 'darwin' | 'linux' = 'linux'; // windows | macos | linux
  device: DeviceInfo = {
    clientId: 'desktop',
    deviceType: '8',
    deviceName: 'linux',
    deviceIdentifier: '00000000-0000-0000-0000-000000000000',
  };
  server: BitwardenServer = BitwardenServer.empty();

  setAccount(account: AccountViewModel | null) {
    this.account = account ? { ...account } : null;
    return this;
  }

  setPlatform(platform: string) {
    switch (platform) {
      case 'win32':
        this.platform = platform;
        this.device.deviceType = '6';
        this.device.deviceName = 'windows';
        break;
      case 'darwin':
        this.platform = platform;
        this.device.deviceType = '7';
        this.device.deviceName = 'macos';
        break;
      case 'linux':
      default:
        this.platform = 'linux';
        this.device.deviceType = '8';
        this.device.deviceName = 'linux';
    }
    return this;
  }

  setDeviceIdentifier(deviceIdentifier: string) {
    this.device.deviceIdentifier = deviceIdentifier;
    return this;
  }

  setClientId(clientId: string) {
    this.device.clientId = clientId ? (clientId as typeof this.device.clientId) : 'desktop';
    return this;
  }

  setServer(newServer: BitwardenServer) {
    this.server = newServer;
    return this;
  }

  getServerMandatoryHeaders() {
    return this.server.getMandatoryHeaders(this.device);
  }

  clone() {
    return ApplicationContext.fronmInstance(this);
  }

  reset() {
    this.setAccount(null).setServer(BitwardenServer.empty());
    return this;
  }

  toJSON(): ApplicationContextJSON {
    return {
      account: this.account ? { ...this.account } : null,
      platform: this.platform,
      device: {
        clientId: this.device.clientId,
        deviceType: this.device.deviceType,
        deviceName: this.device.deviceName,
        deviceIdentifier: this.device.deviceIdentifier,
      },
      server: {
        displayName: this.server.displayName,
        desciption: this.server.desciption,
        url: this.server.url,
        userAgent: this.server.userAgent,
      },
    };
  }

  static fromJSON(json: ApplicationContextJSON) {
    const ctx = new ApplicationContext();
    ctx.setAccount(json.account);
    ctx.setPlatform(json.platform);
    ctx.setDeviceIdentifier(json.device.deviceIdentifier);
    ctx.setServer(
      new BitwardenServer(
        json.server.displayName,
        json.server.desciption,
        json.server.url,
        json.server.userAgent,
      ),
    );
    return ctx;
  }

  static fronmInstance(ctx: ApplicationContext): ApplicationContext {
    return new ApplicationContext()
      .setAccount(ctx.account)
      .setPlatform(ctx.platform)
      .setDeviceIdentifier(ctx.device.deviceIdentifier)
      .setClientId(ctx.device.clientId)
      .setServer(ctx.server);
  }
}
