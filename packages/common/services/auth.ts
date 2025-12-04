import ApplicationContext, { ApplicationContextJSON } from '../types/ApplicationContext';
import api from '../api/auth';
import Service from '../types/Service';
import { AccountViewModel } from '../models/view/Account';
import { toAccountViewModel } from '../models/view/mapping';
import { hashPassword } from '../utils/crypto/auth';
import { AesCbc256_HmacSha256, AesCbc256_HmacSha256_Encrypt } from '../utils/crypto/aes';
import { fromStringToUint8Array, fromUint8ArrayToB64 } from '../utils/string';
import { sha256 } from 'hash-wasm';
import { LoginResponse, LoginResponseTwoFactorAuth, TwoFactorAuthProvider } from '../types/auth';

export const prelogin: Service<{ email: string; ctx: ApplicationContextJSON }, void> =
  async function ({ http, db }, { email, ctx: ctxJSON }) {
    const ctx = ApplicationContext.fromJSON(ctxJSON);
    const kdfConfig = await api.prelogin(
      http,
      {
        baseUrl: ctx.server.url,
        headers: ctx.getServerMandatoryHeaders(),
      },
      { email },
    );

    await db.addAccount({
      email,
      kdf: kdfConfig,
      profile: null,
    });
  };

export const login: Service<
  {
    email: string;
    password: string;
    newDeviceOtp?: string;
    twoFactorToken: string;
    twoFactorProvider: string;
    ctx: ApplicationContextJSON;
  },
  | { twoFactor: false; account: AccountViewModel; unknownDevice: false }
  | { twoFactor: true; providers: TwoFactorAuthProvider[]; unknownDevice: false }
  | { twoFactor: false; unknownDevice: true }
> = async function (
  { http, db },
  { email, password, newDeviceOtp, twoFactorToken, twoFactorProvider, ctx: ctxJSON },
) {
  const ctx = ApplicationContext.fromJSON(ctxJSON);
  let account = await db.getAccount(email);

  if (!account) {
    throw new Error('Account not found ⛔');
  }

  const kdfConfig = account.kdf;

  const { twoFactorAuth, deviceError, response, userKey } = await api.login(
    http,
    {
      baseUrl: ctx.server.url,
      headers: ctx.getServerMandatoryHeaders(),
      kdfConfig,
    },
    {
      email,
      password,
      clientId: ctx.device.clientId,
      deviceName: ctx.device.deviceName,
      deviceType: ctx.device.deviceType,
      deviceIdentifier: ctx.device.deviceIdentifier,
      newDeviceOtp,
      twoFactor: twoFactorProvider
        ? {
            token: twoFactorToken,
            provider: twoFactorProvider,
            remember: false,
          }
        : undefined,
    },
  );

  if (twoFactorAuth) {
    let res = response as LoginResponseTwoFactorAuth;

    return {
      twoFactor: true,
      providers: res.TwoFactorProviders,
      unknownDevice: false,
    };
  }

  if (deviceError) {
    return {
      twoFactor: false,
      unknownDevice: true,
    };
  }

  let res = response as LoginResponse;

  account.kdf =
    res.Kdf === 1
      ? {
          kdf: 1,
          kdfIterations: res.KdfIterations as number,
          kdfMemory: res.KdfMemory as number,
          kdfParallelism: res.KdfParallelism as number,
        }
      : {
          kdf: 0,
          kdfIterations: res.KdfIterations as number,
          kdfMemory: null,
          kdfParallelism: null,
        };

  await db.updateAccount(account);

  const emailHash = fromUint8ArrayToB64(fromStringToUint8Array(await sha256(email)).slice(0, 16));

  const { accessToken, refreshToken } = await encryptTokens(
    res.access_token,
    res.refresh_token,
    emailHash,
    userKey,
  );

  await db.addKeys({
    email,
    keys: {
      accessToken,
      expiresIn: new Date(res.expires_in),
      tokenType: res.token_type,
      refreshToken,
      privateKey: res.PrivateKey,
      key: res.Key,
      organizationKeys: {},
    },
  });
  await db.addUserKey({ email, userKey });

  return {
    twoFactor: false,
    account: toAccountViewModel(account),
    unknownDevice: false,
  };
};

export const lock: Service<{ email?: string }, void> = async function ({ db }, { email }) {
  if (email) {
    await Promise.all([db.deleteUserKey(email), db.deleteVault(email)]);
    return;
  }

  const accounts = await db.getAllAccounts();
  await Promise.all(
    accounts.map(({ email }) => Promise.all([db.deleteUserKey(email), db.deleteVault(email)])),
  );
};

export const unlock: Service<{ password: string; ctx: ApplicationContextJSON }, void> =
  async function ({ http, db }, { password, ctx: ctxJSON }) {
    const ctx = ApplicationContext.fromJSON(ctxJSON);

    if (!ctx.account) {
      throw new Error('Account not found 🛸');
    }

    const { email } = ctx.account;

    const account = await db.getAccount(email);
    if (!account) {
      throw new Error('Account not found 🛸');
    }

    const keys = await db.getKeys(email);
    if (!keys) {
      throw new Error('Keys not found 🛸');
    }

    const kdfConfig = account.kdf;
    const { userKey } = await hashPassword(email, password, kdfConfig);

    const {
      keys: { refreshToken, key, privateKey },
    } = keys;
    const emailHash = fromUint8ArrayToB64(fromStringToUint8Array(await sha256(email)).slice(0, 16));
    const [ct, mac] = refreshToken.split('.');
    const decryptedRefreshToken = await AesCbc256_HmacSha256(
      { ct, iv: emailHash, mac },
      userKey.slice(0, 32),
      userKey.slice(32, 64),
    );

    const { response } = await api.refreshToken(
      http,
      {
        baseUrl: ctx.server.url,
        headers: ctx.getServerMandatoryHeaders(),
      },
      {
        refreshToken: new TextDecoder().decode(decryptedRefreshToken),
        clientId: ctx.device.clientId,
      },
    );

    const { accessToken, refreshToken: newRefreshToken } = await encryptTokens(
      response.access_token,
      response.refresh_token,
      emailHash,
      userKey,
    );

    keys.keys = {
      accessToken,
      expiresIn: new Date(response.expires_in),
      tokenType: response.token_type,
      refreshToken: newRefreshToken,
      privateKey,
      key,
      organizationKeys: {},
    };
    await db.updateKeys(keys);
    await db.addUserKey({ email, userKey });
  };

export const logout: Service<{ email: string }, void> = async function ({ db }, { email }) {
  await db.deleteUserKey(email);
  await db.deleteVault(email);
  await db.deleteKeys(email);
  await db.deleteAccount(email);
};

async function encryptTokens(
  accessToken: string,
  refreshToken: string,
  iv: string,
  userKey: Uint8Array<ArrayBuffer>,
): Promise<{ accessToken: string; refreshToken: string }> {
  const encKey = userKey.slice(0, 32);
  const macKey = userKey.slice(32, 64);

  const { ct: accessTokenCt, mac: accessTokenMac } = await AesCbc256_HmacSha256_Encrypt(
    {
      ct: accessToken,
      iv,
    },
    encKey,
    macKey,
  );

  const { ct: refreshTokenCt, mac: refreshTokenMac } = await AesCbc256_HmacSha256_Encrypt(
    {
      ct: refreshToken,
      iv,
    },
    encKey,
    macKey,
  );

  return {
    accessToken: `${accessTokenCt}.${accessTokenMac}`,
    refreshToken: `${refreshTokenCt}.${refreshTokenMac}`,
  };
}
