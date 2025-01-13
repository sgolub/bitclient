import {
  pbkdf2 as pbkdf2Wasm,
  argon2id as argon2idWasm,
  createHMAC,
  createSHA256,
  createSHA512,
} from 'hash-wasm';
import { KDFConfig } from '../../types/KDFConfig';
import { IS_WASM_SUPPORTED } from './isWasmSupported';

export const PBKDF2_KEY_LENGTH = 32;
export const PBKDF2_ITERATIONS = 600000;
export const ARGON2_ITERATIONS = 3;
export const ARGON2_MEMORY_MB = 64;
export const ARGON2_PARALLELISM = 4;

export async function hashPassword(
  email: string,
  password: string,
  { kdf, kdfIterations, kdfMemory, kdfParallelism }: KDFConfig,
) {
  if (!IS_WASM_SUPPORTED) {
    throw new Error('WASM is not supported.');
  }

  const passwordBytes = new TextEncoder().encode(password);
  const emailBytes = new TextEncoder().encode(email.toLocaleLowerCase('en'));

  let masterKey: Uint8Array;

  switch (kdf) {
    case 0:
      masterKey = await pbkdf2(passwordBytes, emailBytes, kdfIterations, PBKDF2_KEY_LENGTH);
      break;
    case 1:
      const emailHash = await sha256(emailBytes);
      masterKey = await argon2id(
        passwordBytes,
        emailHash,
        kdfIterations,
        kdfMemory,
        kdfParallelism,
      );
      break;
    default:
      throw new Error(`KDF mode ${kdf} is not supported.`);
  }

  const passwordKey = await pbkdf2(masterKey, passwordBytes, 1, PBKDF2_KEY_LENGTH);

  const encKey = await hkdfExpand(masterKey, 'enc', 32, 'sha256');
  const macKey = await hkdfExpand(masterKey, 'mac', 32, 'sha256');

  const userKey = new Uint8Array(64);
  userKey.set(new Uint8Array(encKey));
  userKey.set(new Uint8Array(macKey), 32);

  return {
    // masterKey,
    hashedPassword: btoa(
      Array.from(passwordKey)
        .map((byte) => String.fromCharCode(byte))
        .join(''),
    ),
    userKey,
  };
}

async function pbkdf2(
  pass: Uint8Array,
  salt: Uint8Array,
  iterations: number,
  length: number = PBKDF2_KEY_LENGTH,
): Promise<Uint8Array> {
  return await pbkdf2Wasm({
    password: pass,
    salt,
    iterations,
    hashLength: length,
    outputType: 'binary',
    hashFunction: createSHA256(),
  });
}

async function argon2id(
  pass: Uint8Array,
  salt: Uint8Array,
  iterations: number,
  memory: number,
  parallelism: number,
): Promise<Uint8Array> {
  return await argon2idWasm({
    password: pass,
    salt,
    iterations,
    memorySize: memory * 1024,
    parallelism: parallelism,
    hashLength: 32,
    outputType: 'binary',
  });
}

async function sha256(buffer: Uint8Array) {
  const hashFn = await createSHA256();
  return hashFn.update(Buffer.from(buffer)).digest('binary');
}

async function hkdfExpand(
  prk: Uint8Array,
  info: string,
  outputByteSize: number,
  algorithm: 'sha256' | 'sha512',
): Promise<ArrayBuffer> {
  const hashLen = algorithm === 'sha256' ? 32 : 64;
  if (outputByteSize > 255 * hashLen) {
    throw new Error('outputByteSize is too large.');
  }
  const prkArr = new Uint8Array(prk);
  if (prkArr.length < hashLen) {
    throw new Error('prk is too small.');
  }
  const infoBuf = Buffer.from(info);
  const infoArr = new Uint8Array(infoBuf);
  let runningOkmLength = 0;
  let previousT = new Uint8Array(0);
  const n = Math.ceil(outputByteSize / hashLen);
  const okm = new Uint8Array(n * hashLen);
  for (let i = 0; i < n; i++) {
    const t = new Uint8Array(previousT.length + infoArr.length + 1);
    t.set(previousT);
    t.set(infoArr, previousT.length);
    t.set([i + 1], t.length - 1);
    previousT = new Uint8Array(await hmac(t, prk, algorithm));
    okm.set(previousT, runningOkmLength);
    runningOkmLength += previousT.length;
    if (runningOkmLength >= outputByteSize) {
      break;
    }
  }
  return okm.slice(0, outputByteSize).buffer;
}

async function hmac(
  value: Uint8Array,
  key: Uint8Array,
  algorithm: 'sha256' | 'sha512',
): Promise<Uint8Array> {
  const hashFn = await createHMAC(
    algorithm === 'sha256' ? createSHA256() : createSHA512(),
    Buffer.from(key),
  );
  return hashFn.update(Buffer.from(value)).digest('binary');
}
