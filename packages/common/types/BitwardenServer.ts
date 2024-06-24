import { DeviceInfo } from './ApplicationContext.js';

export default class BitwardenServer {
  displayName: string;
  desciption: string;
  url: string;
  userAgent: string;

  constructor(displayName: string, desciption: string, url: string, userAgent: string) {
    this.displayName = displayName;
    this.desciption = desciption;
    this.url = url;
    this.userAgent = userAgent;
  }

  static empty(): BitwardenServer {
    return new BitwardenServer('', '', '', '');
  }

  getMandatoryHeaders({ deviceType, clientId }: DeviceInfo): Record<string, string | string[]> {
    return {
      //! Bitwarden mandatory headers
      'Device-Type': deviceType,
      'Bitwarden-Client-Name': clientId,
      'Bitwarden-Client-Version': '2024.6.3', // seems like any number is acceptable
      'User-Agent': this.userAgent,
      //! headers below are required only for clientId: 'web'
      // 'Accept-Language': 'en-US', //'en-US,en;q=0.9,ru;q=0.8,be;q=0.7',
      // Referer: 'https://vault.bitwarden.com/',
      // 'Sec-CH-UA':
      //   '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
      // 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    };
  }
}
