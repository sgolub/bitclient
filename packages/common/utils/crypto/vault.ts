import { KeysModel } from '../../models/Keys';
import { CipherModel, VaultModel } from '../../models/Vault';
import { CardType, CipherType, CustomFieldType } from '../../types/vault';
import { AesCbc128_HmacSha256, AesCbc256, AesCbc256_HmacSha256 } from './aes';
import {
  Rsa2048_OaepSha1,
  Rsa2048_OaepSha1_HmacSha256,
  Rsa2048_OaepSha256,
  Rsa2048_OaepSha256_HmacSha256,
} from './rsa';

export async function decryptVault(vault: VaultModel, userKey: Uint8Array, keysModel: KeysModel) {
  const { keys } = keysModel;
  for (const folder of vault.folders) {
    const key = await decrypt(keys.key, userKey);
    folder.name = await decrypt_string(folder.name, key);
  }

  for (const collection of vault.collections) {
    const { organizationId } = collection;
    const key =
      organizationId && keys.organizationKeys[organizationId]
        ? await decrypt(
            keys.organizationKeys[organizationId],
            await decrypt(keys.privateKey, await decrypt(keys.key, userKey)),
          )
        : await decrypt(keys.key, userKey);
    collection.name = await decrypt_string(collection.name, key);
  }

  for (const cipher of vault.ciphers) {
    const { type, data } = cipher;

    const theKey = await getCipherKey(cipher, userKey, keysModel);

    data.name = await decrypt_string(data.name, theKey);
    data.notes = await decrypt_string(data.notes, theKey);
    for (const field of data.fields) {
      field.name = await decrypt_string(field.name, theKey);
      switch (field.type) {
        case CustomFieldType.Text:
        case CustomFieldType.Boolean:
          field.value = await decrypt_string(field.value, theKey);
          break;
        case CustomFieldType.Password:
        case CustomFieldType.Linked:
        default:
        // skip decrypting
        // field.value = field.value;
      }
    }

    switch (type) {
      case CipherType.Login:
        data.username = await decrypt_string(data.username, theKey);
        data.totp = await decrypt_string(data.totp, theKey);
        data.uri = await decrypt_string(data.uri, theKey);
        for (let i = 0; i < data.uris.length; i++) {
          const uri = data.uris[i];
          data.uris[i] = await decrypt_string(uri, theKey);
        }
        // data.password - encrypted
        break;
      case CipherType.Card:
        data.cardholderName = await decrypt_string(data.cardholderName, theKey);
        data.brand = (await decrypt_string(data.brand, theKey)) as CardType;
        data.expMonth = await decrypt_string(data.expMonth, theKey);
        data.expYear = await decrypt_string(data.expYear, theKey);
        const number = await decrypt_string(data.number, theKey);
        data.last4digits = number ? number.slice(-4) : '';
        data.numberLength = number ? number.length : 0;
        // data.number - encrypted
        // data.code - encrypted
        break;
      case CipherType.Identity:
        data.title = await decrypt_string(data.title, theKey);
        data.firstName = await decrypt_string(data.firstName, theKey);
        data.middleName = await decrypt_string(data.middleName, theKey);
        data.lastName = await decrypt_string(data.lastName, theKey);
        data.address1 = await decrypt_string(data.address1, theKey);
        data.address2 = await decrypt_string(data.address2, theKey);
        data.address3 = await decrypt_string(data.address3, theKey);
        data.city = await decrypt_string(data.city, theKey);
        data.state = await decrypt_string(data.state, theKey);
        data.postalCode = await decrypt_string(data.postalCode, theKey);
        data.country = await decrypt_string(data.country, theKey);
        data.company = await decrypt_string(data.company, theKey);
        data.email = await decrypt_string(data.email, theKey);
        data.phone = await decrypt_string(data.phone, theKey);
        data.username = await decrypt_string(data.username, theKey);
        // data.ssn - encrypted
        // data.passportNumber - encrypted
        // data.licenseNumber - encrypted
        break;
      case CipherType.SecureNote:
      default:
        break;
    }
  }
}

export async function getCipherKey(cipher: CipherModel, userKey: Uint8Array, { keys }: KeysModel) {
  const { organizationId, key: cipherKey } = cipher;
  let key = await decrypt(keys.key, userKey);

  if (organizationId && keys.organizationKeys[organizationId]) {
    key = await decrypt(keys.organizationKeys[organizationId], await decrypt(keys.privateKey, key));
  }

  return cipherKey ? await decrypt(cipherKey, key) : key;
}

export async function decrypt_string(value: string, key: Uint8Array): Promise<string> {
  if (!value) {
    return value;
  }
  try {
    const result = await decrypt(value, key);
    return new TextDecoder().decode(result);
  } catch (e) {
    console.error(e);
    return value;
  }
}

export async function decrypt(value: string, key: Uint8Array): Promise<Uint8Array> {
  const [encType] = value.split('.');
  const encKey = key.slice(0, 32);
  const macKey = key.slice(32, 64);

  switch (Number(encType)) {
    case 0:
      const [, [iv_AesCbc256, ct_AesCbc256]] = value.split('.').map((x) => x.split('|'));
      return await AesCbc256({ iv: iv_AesCbc256, ct: ct_AesCbc256 }, encKey);
    case 1:
      const [, [iv_AesCbc128_HmacSha256, ct_AesCbc128_HmacSha256, mac_AesCbc128_HmacSha256]] = value
        .split('.')
        .map((x) => x.split('|'));

      return await AesCbc128_HmacSha256(
        { iv: iv_AesCbc128_HmacSha256, ct: ct_AesCbc128_HmacSha256, mac: mac_AesCbc128_HmacSha256 },
        encKey,
        macKey,
      );
    case 2:
      const [, [iv_AesCbc256_HmacSha256, ct_AesCbc256_HmacSha256, mac_AesCbc256_HmacSha256]] = value
        .split('.')
        .map((x) => x.split('|'));
      return await AesCbc256_HmacSha256(
        { iv: iv_AesCbc256_HmacSha256, ct: ct_AesCbc256_HmacSha256, mac: mac_AesCbc256_HmacSha256 },
        encKey,
        macKey,
      );
    case 3:
      const [, ct_Rsa2048_OaepSha256] = value.split('.');
      return await Rsa2048_OaepSha256({ ct: ct_Rsa2048_OaepSha256 }, key);
    case 4:
      const [, ct_Rsa2048_OaepSha1] = value.split('.');
      return await Rsa2048_OaepSha1({ ct: ct_Rsa2048_OaepSha1 }, key);
    case 5:
      // TODO: Test Rsa2048_OaepSha256_HmacSha256
      const [
        ,
        [
          iv_Rsa2048_OaepSha256_HmacSha256,
          ct_Rsa2048_OaepSha256_HmacSha256,
          mac_Rsa2048_OaepSha256_HmacSha256,
        ],
      ] = value.split('.').map((x) => x.split('|'));
      return await Rsa2048_OaepSha256_HmacSha256(
        {
          iv: iv_Rsa2048_OaepSha256_HmacSha256,
          ct: ct_Rsa2048_OaepSha256_HmacSha256,
          mac: mac_Rsa2048_OaepSha256_HmacSha256,
        },
        key,
      );
    case 6:
      // TODO: Test Rsa2048_OaepSha1_HmacSha256
      const [
        ,
        [
          iv_Rsa2048_OaepSha1_HmacSha256,
          ct_Rsa2048_OaepSha1_HmacSha256,
          mac_Rsa2048_OaepSha1_HmacSha256,
        ],
      ] = value.split('.').map((x) => x.split('|'));
      return await Rsa2048_OaepSha1_HmacSha256(
        {
          iv: iv_Rsa2048_OaepSha1_HmacSha256,
          ct: ct_Rsa2048_OaepSha1_HmacSha256,
          mac: mac_Rsa2048_OaepSha1_HmacSha256,
        },
        key,
      );
    default:
      throw new Error(`Unknown encryption type ${encType}`);
  }
}
