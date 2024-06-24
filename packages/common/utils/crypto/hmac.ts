import { fromB64ToUint8Array } from '../string';
import { crypto, isBrowser } from './crypto';

export async function HmacSha256(
  { iv, ct, mac }: { iv: string; ct: string; mac: string },
  macKey: Uint8Array,
) {
  const encryptedContent = fromB64ToUint8Array(ct);
  const integrity = fromB64ToUint8Array(mac);
  const ivBuffer = fromB64ToUint8Array(iv);

  const hmackey = await crypto.subtle.importKey(
    'raw',
    new Uint8Array(macKey),
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  );

  const macData = new Uint8Array(ivBuffer.byteLength + encryptedContent.byteLength);
  macData.set(ivBuffer, 0);
  macData.set(encryptedContent, ivBuffer.byteLength);

  const computedIntegrity = await crypto.subtle.sign(
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    hmackey,
    macData,
  );

  if (
    !integrity ||
    !computedIntegrity ||
    integrity.byteLength !== 32 ||
    computedIntegrity.byteLength !== 32 ||
    !BuffersEqual(integrity, new Uint8Array(computedIntegrity))
  ) {
    throw new Error('Invalid HMAC');
  }
}

function BuffersEqual(a: Uint8Array | Buffer, b: Uint8Array | Buffer) {
  if (!isBrowser) {
    return Buffer.compare(new Uint8Array(a), new Uint8Array(b)) === 0;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
