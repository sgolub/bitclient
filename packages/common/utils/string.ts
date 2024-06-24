export function fromUtf8ToUrlB64(str: string): string {
  const strUtf8 = decodeURIComponent(encodeURIComponent(str));
  const arr = new Uint8Array(strUtf8.length);
  for (let i = 0; i < strUtf8.length; i++) {
    arr[i] = strUtf8.charCodeAt(i);
  }

  let binary = '';
  const bytes = new Uint8Array(arr);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function fromArrayBufferToString(arr: ArrayBuffer) {
  let result = '';
  const bytes = new Uint8Array(arr);
  for (let i = 0; i < bytes.byteLength; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  return result;
}

export function fromArrayBufferToB64(binary: ArrayBuffer): string {
  return fromUint8ArrayToB64(new Uint8Array(binary));
}

export function fromUint8ArrayToB64(binary: Uint8Array): string {
  let binaryString = '';
  for (let i = 0; i < binary.byteLength; i++) {
    binaryString += String.fromCharCode(binary[i]);
  }
  return btoa(binaryString);
}

export function fromB64ToUint8Array(str: string): Uint8Array {
  const binaryString = atob(str);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function fromStringToUint8Array(str: string): Uint8Array {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
}
