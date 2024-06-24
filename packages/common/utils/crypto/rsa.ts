import { fromB64ToUint8Array } from '../string';
import { HmacSha256 } from './hmac';
import { crypto } from './crypto';

export async function Rsa2048_OaepSha(
  hash: 'SHA-1' | 'SHA-256',
  { ct }: { ct: string },
  key: Uint8Array,
): Promise<Uint8Array> {
  const keyPair = await crypto.subtle.importKey(
    'pkcs8',
    key,
    {
      name: 'RSA-OAEP',
      hash,
      length: 2048,
    },
    false,
    ['decrypt'],
  );

  const encryptedContent = fromB64ToUint8Array(ct);

  const result = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
      length: 2048,
    },
    keyPair,
    encryptedContent,
  );
  return new Uint8Array(result);
}

export async function Rsa2048_OaepSha256({ ct }: { ct: string }, key: Uint8Array) {
  return await Rsa2048_OaepSha('SHA-256', { ct }, key);
}

export async function Rsa2048_OaepSha1({ ct }: { ct: string }, key: Uint8Array) {
  return await Rsa2048_OaepSha('SHA-1', { ct }, key);
}

export async function Rsa2048_OaepSha256_HmacSha256(
  { iv, ct, mac }: { iv: string; ct: string; mac: string },
  key: Uint8Array,
) {
  await HmacSha256({ iv, ct, mac }, key);
  return await Rsa2048_OaepSha('SHA-256', { ct }, key);
}

export async function Rsa2048_OaepSha1_HmacSha256(
  { iv, ct, mac }: { iv: string; ct: string; mac: string },
  key: Uint8Array,
) {
  await HmacSha256({ iv, ct, mac }, key);
  return await Rsa2048_OaepSha('SHA-1', { ct }, key);
}
