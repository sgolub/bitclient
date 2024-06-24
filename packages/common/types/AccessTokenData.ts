type AccessTokenDataType = {
  amr: [string];
  auth_time: number;
  client_id: string;
  device: string;
  email: string;
  email_verified: boolean;
  exp: number;
  iat: number;
  idp: string; // 'bitwarden';
  iss: string; // 'https://identity.bitwarden.eu';
  jti: string;
  name: string;
  nbf: number;
  orgowner: string;
  premium: boolean;
  scope: [string];
  sstamp: string;
  sub: string;
};

export default class AccessTokenData {
  clientId: string;
  userId: string;
  name: string;
  email: string;
  premium: boolean;
  deviceIdentifier: string;
  constructor({ client_id, name, email, premium, device, sub }: AccessTokenDataType) {
    this.clientId = client_id;
    this.userId = sub;
    this.name = name;
    this.email = email;
    this.premium = premium;
    this.deviceIdentifier = device;
  }
}
