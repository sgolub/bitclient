import { exec, execSync } from 'node:child_process';
import { platform } from 'node:process';
import { randomUUID } from 'node:crypto';

const win32RegBinPath = {
  native: '%windir%\\System32',
  mixed: '%windir%\\sysnative\\cmd.exe /c %windir%\\System32',
};
const guid = {
  darwin: 'ioreg -rd1 -c IOPlatformExpertDevice',
  win32:
    `${win32RegBinPath[isWindowsProcessMixedOrNativeArchitecture()]}\\REG.exe ` +
    'QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography ' +
    '/v MachineGuid',
  linux:
    '( cat /var/lib/dbus/machine-id /etc/machine-id 2> /dev/null || hostname ) | head -n 1 || :',
  freebsd: 'kenv -q smbios.system.uuid || sysctl -n kern.hostuuid',
};

function isWindowsProcessMixedOrNativeArchitecture(): string {
  // detect if the node binary is the same arch as the Windows OS.
  // or if this is 32 bit node on 64 bit windows.
  if (process.platform !== 'win32') {
    return '';
  }
  if (
    process.arch === 'ia32' &&
    process.env.PROCESSOR_ARCHITEW6432 !== undefined
  ) {
    return 'mixed';
  }
  return 'native';
}

function expose(result: string): string {
  switch (platform) {
    case 'darwin':
      return result
        .split('IOPlatformUUID')[1]
        .split('\n')[0]
        .replace(/\\=|\s+|\\"/gi, '')
        .toLowerCase();
    case 'win32':
      return result
        .toString()
        .split('REG_SZ')[1]
        .replace(/\r+|\n+|\s+/gi, '')
        .toLowerCase();
    case 'linux':
    case 'freebsd':
      return result
        .toString()
        .replace(/\r+|\n+|\s+/gi, '')
        .toLowerCase();
    default:
      return randomUUID();
  }
}

export function machineIdSync(): string {
  return expose(execSync(guid[platform]).toString());
}

export default function machineId(): Promise<string> {
  return new Promise((resolve, reject) => {
    return exec(guid[platform], {}, (err, stdout) => {
      if (err) {
        return reject(
          new Error(`Error while obtaining machine id: ${err.stack}`),
        );
      }
      const id: string = expose(stdout.toString());
      resolve(id);
    });
  });
}
