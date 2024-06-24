export const isBrowser: boolean =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';
export const crypto = isBrowser ? window.crypto : (require('node:crypto').webcrypto as Crypto);
