// AesCbc256_B64(byte = 0),
// AesCbc128_HmacSha256_B64(byte = 1),
// AesCbc256_HmacSha256_B64(byte = 2),

import { fromArrayBufferToB64, fromB64ToUint8Array } from '../string';
import { HmacSha256 } from './hmac';
import { crypto } from './crypto';

export async function AesCbc256(
  { iv, ct }: { iv: string; ct: string },
  encKey: Uint8Array,
): Promise<Uint8Array> {
  return await AesCbc(256, { iv, ct }, encKey);
}

export async function AesCbc128_HmacSha256(
  { iv, ct, mac }: { iv: string; ct: string; mac: string },
  encKey: Uint8Array,
  macKey: Uint8Array,
): Promise<Uint8Array> {
  await HmacSha256({ iv, ct, mac }, macKey);
  return await AesCbc(128, { iv, ct }, encKey);
}

export async function AesCbc256_HmacSha256(
  { iv, ct, mac }: { iv: string; ct: string; mac: string },
  encKey: Uint8Array,
  macKey: Uint8Array,
): Promise<Uint8Array> {
  await HmacSha256({ iv, ct, mac }, macKey);
  return await AesCbc256({ ct, iv }, encKey);
}

async function AesCbc(
  length: 128 | 256,
  { iv, ct }: { iv: string; ct: string },
  encKey: Uint8Array,
): Promise<Uint8Array> {
  const ckey = await crypto.subtle.importKey(
    'raw',
    encKey,
    {
      name: 'AES-CBC',
      length,
    },
    false,
    ['decrypt'],
  );

  const encryptedContent = fromB64ToUint8Array(ct);
  const ivBuffer = fromB64ToUint8Array(iv);

  const result = await crypto.subtle.decrypt(
    {
      name: 'AES-CBC',
      iv: ivBuffer,
    },
    ckey,
    encryptedContent,
  );

  return new Uint8Array(result);
}

export async function AesCbc256Encrypt(
  { ct, iv }: { ct: Uint8Array; iv: Uint8Array },
  encKey: Uint8Array,
): Promise<string> {
  const ckey = await crypto.subtle.importKey(
    'raw',
    encKey,
    {
      name: 'AES-CBC',
      length: 256,
    },
    false,
    ['encrypt'],
  );

  const result = await crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv,
    },
    ckey,
    ct,
  );

  return fromArrayBufferToB64(result);
}
