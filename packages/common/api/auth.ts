import {
  hashPassword,
  PBKDF2_ITERATIONS,
  ARGON2_ITERATIONS,
  ARGON2_MEMORY_MB,
  ARGON2_PARALLELISM,
} from '../utils/crypto/auth';
import { fromUtf8ToUrlB64 } from '../utils/string';
import {
  PreloginResponse,
  PreloginValidationErrorsResponse,
  LoginResponse,
  LoginErrorResponse,
  RefreshTokenResponse,
  RefreshTokenErrorResponse,
} from '../types/auth';
import { POST, ContentType } from '../types/http';
import HttpProvider from '../types/HttpProvider';
import { getURL, isBadRequest, isNotFound } from '../utils/http';
import { request } from './request';
import { KDFConfig } from '../types/KDFConfig';

async function prelogin(
  http: HttpProvider,
  { baseUrl, headers = {} }: { baseUrl: string; headers: Record<string, string | string[]> },
  { email }: { email: string },
): Promise<KDFConfig> {
  const { ok, statusCode, body } = await request<
    PreloginResponse,
    PreloginValidationErrorsResponse
  >(http, getURL(baseUrl, '/identity/accounts/prelogin'), headers, POST, { email });

  if (ok) {
    let { kdf, kdfIterations, kdfMemory, kdfParallelism } = body;
    kdf = kdf === 1 ? 1 : 0;
    return {
      kdf,
      kdfIterations: kdfIterations || (kdf === 0 ? PBKDF2_ITERATIONS : ARGON2_ITERATIONS),
      kdfMemory: kdfMemory || (kdf === 0 ? null : ARGON2_MEMORY_MB),
      kdfParallelism: kdfParallelism || (kdf == 0 ? null : ARGON2_PARALLELISM),
    } as KDFConfig;
  } else if (isBadRequest(statusCode) && !isNotFound(statusCode)) {
    const [emailVerificationError] = body?.validationErrors?.Email || [];
    throw new Error(emailVerificationError ?? body?.Message ?? 'Prelogin failed ⛔');
  } else {
    throw new Error('Unknown response.');
  }
}

async function login(
  http: HttpProvider,
  {
    baseUrl,
    headers = {},
    kdfConfig,
  }: { baseUrl: string; headers: Record<string, string | string[]>; kdfConfig: KDFConfig },
  {
    email,
    password,
    clientId,
    deviceName,
    deviceType,
    deviceIdentifier,
  }: {
    email: string;
    password: string;
    clientId: string;
    deviceName: string;
    deviceType: string;
    deviceIdentifier: string;
  },
) {
  headers['Auth-Email'] = fromUtf8ToUrlB64(email);

  const { hashedPassword, userKey } = await hashPassword(email, password, kdfConfig);

  const data = {
    grant_type: 'password',
    client_id: clientId,
    username: email,
    password: hashedPassword,
    scope: 'api offline_access',
    deviceName,
    deviceType,
    deviceIdentifier,
  };

  const { ok, statusCode, body } = await request<LoginResponse, LoginErrorResponse>(
    http,
    getURL(baseUrl, '/identity/connect/token'),
    headers,
    POST,
    data,
    ContentType.x_www_form_urlencoded,
  );

  if (ok) {
    return { response: body, userKey };
  } else if (isBadRequest(statusCode)) {
    throw new Error(body?.ErrorModel.Message);
  } else {
    throw new Error('Unknown response.');
  }
}

async function refreshToken(
  http: HttpProvider,
  { baseUrl, headers }: { baseUrl: string; headers: Record<string, string | string[]> },
  { refreshToken, clientId }: { refreshToken: string; clientId: string },
) {
  const data = {
    grant_type: 'refresh_token',
    client_id: clientId,
    refresh_token: refreshToken,
  };

  const { ok, statusCode, body } = await request<RefreshTokenResponse, RefreshTokenErrorResponse>(
    http,
    getURL(baseUrl, '/identity/connect/token'),
    headers,
    POST,
    data,
    ContentType.x_www_form_urlencoded,
  );

  if (ok) {
    return { response: body };
  } else if (isBadRequest(statusCode)) {
    throw new Error(body?.ErrorModel.Message);
  } else {
    throw new Error('Unknown response.');
  }
}

export default { prelogin, login, refreshToken };
