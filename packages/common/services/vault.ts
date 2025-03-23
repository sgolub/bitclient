import filter from 'lodash/filter';
import includes from 'lodash/includes';
import sortBy from 'lodash/sortBy';
import { sha256 } from 'hash-wasm';

import api from '../api/vault';
import ApplicationContext, { ApplicationContextJSON } from '../types/ApplicationContext';
import Service from '../types/Service';
import { toProfileModel, toVaultModel } from '../models/mapping';
import { decrypt, decryptVault, getCipherKey } from '../utils/crypto/vault';
import { CipherType, ID } from '../types/vault';
import { VaultViewModel } from '../models/view/Vault';
import { toAccountViewModel, toVaultViewModel } from '../models/view/mapping';
import { VaultSearchViewModel } from '../models/view/VaultSearch';
import { AccountViewModel } from '../models/view/Account';
import { fromStringToUint8Array, fromUint8ArrayToB64 } from '../utils/string';
import { AesCbc256_HmacSha256 } from '../utils/crypto/aes';

export const sync: Service<
  {
    ctx: ApplicationContextJSON;
    search: VaultSearchViewModel;
    forseSync?: boolean;
  },
  { account: AccountViewModel; vault: VaultViewModel }
> = async function (
  { http, db },
  { ctx: ctxJSON, search, forseSync = false },
): Promise<{ account: AccountViewModel; vault: VaultViewModel }> {
  const ctx = ApplicationContext.fromJSON(ctxJSON);
  if (!ctx.account?.email) {
    throw new Error('Account not found 🛸');
  }

  const { email } = ctx.account;
  const account = await db.getAccount(email);

  if (account === null) {
    throw new Error('Account not found 🛸');
  }

  const vault = await db.getVault(email);

  if (!forseSync && vault !== null && account.profile !== null) {
    const viewModel = toVaultViewModel(vault);
    applySearch(viewModel, search);
    return { vault: viewModel, account: toAccountViewModel(account) };
  }

  const { userKey } = await db.getUserKey(email);
  if (!userKey) {
    throw new Error('User key not found 🛸');
  }

  const keys = await db.getKeys(email);
  if (!keys) {
    throw new Error('Keys not found 🛸');
  }

  const {
    keys: { accessToken },
  } = keys;

  const emailHash = fromStringToUint8Array(await sha256(email)).slice(0, 16);
  const [ct, mac] = accessToken.split('.');
  const decryptedAccessToken = await AesCbc256_HmacSha256(
    { ct, iv: fromUint8ArrayToB64(emailHash), mac },
    userKey.slice(0, 32),
    userKey.slice(32, 64),
  );

  const response = await api.sync(
    http,
    {
      baseUrl: ctx.server.url,
      headers: ctx.getServerMandatoryHeaders(),
    },
    { bearerToken: new TextDecoder().decode(decryptedAccessToken) },
  );

  account.profile = toProfileModel(response.profile);
  await db.updateAccount(account);

  const model = toVaultModel(response);

  keys.keys.organizationKeys = {};
  for (const organization of response.profile.organizations) {
    keys.keys.organizationKeys[organization.id] = organization.key;
  }
  await db.updateKeys(keys);

  await decryptVault(model, userKey, keys);
  await db.addVault(model);

  const viewModel = toVaultViewModel(model);
  applySearch(viewModel, search);

  return { vault: viewModel, account: toAccountViewModel(account) };
};

function applySearch(vault: VaultViewModel, search: VaultSearchViewModel) {
  vault.ciphers = filter(vault.ciphers, (c) => {
    switch (search.type) {
      case 'logins':
        return c.type === CipherType.Login && c.deletedDate === null;
      case 'cards':
        return c.type === CipherType.Card && c.deletedDate === null;
      case 'identities':
        return c.type === CipherType.Identity && c.deletedDate === null;
      case 'notes':
        return c.type === CipherType.SecureNote && c.deletedDate === null;
      case 'favorites':
        return c.favorite && c.deletedDate === null;
      case 'collection':
        return includes(c.collectionIds, search.collectionId as ID) && c.deletedDate === null;
      case 'folder':
        return (
          (c.folderId === search.folderId || (!c.folderId && !search.folderId)) &&
          c.deletedDate === null
        );
      case 'trash':
        return c.deletedDate !== null;
      default:
        return c.deletedDate === null;
    }
  });
  if (search.vaults.length > 0) {
    vault.ciphers = filter(vault.ciphers, (c) => {
      return (
        includes(search.vaults, c.organizationId) ||
        (c.organizationId === null && includes(search.vaults, '_'))
      );
    });
    vault.collections = filter(vault.collections, (c) => {
      return includes(search.vaults, c.organizationId);
    });
  }
  if (search.query) {
    vault.ciphers = filter(vault.ciphers, (c) => {
      return c.data.name.toLowerCase().includes(search.query.toLowerCase());
    });
    // TODO: implement search by other fields
  } else {
    switch (search.sortBy) {
      case 'createdDate':
        vault.ciphers = search.reverse
          ? sortBy(vault.ciphers, 'createdDate')
          : sortBy(vault.ciphers, 'createdDate').reverse();
        break;
      case 'updatedDate':
        vault.ciphers = search.reverse
          ? sortBy(vault.ciphers, 'updatedDate')
          : sortBy(vault.ciphers, 'updatedDate').reverse();
        break;
      case 'name':
      default:
        vault.ciphers = search.reverse
          ? sortBy(vault.ciphers, 'data.name').reverse()
          : sortBy(vault.ciphers, 'data.name');
    }
  }
}

export const getSecret: Service<
  {
    ctx: ApplicationContextJSON;
    cipherId: string;
    secret: string;
  },
  string
> = async function ({ db }, { ctx: ctxJSON, cipherId, secret }) {
  if (!secret) {
    return '';
  }

  const ctx = ApplicationContext.fromJSON(ctxJSON);
  if (!ctx.account?.email) {
    throw new Error('Account not found 🛸');
  }

  const { email } = ctx.account;
  const vault = await db.getVault(email);

  if (vault === null) {
    return '';
  }

  const cipher = vault.ciphers.find((c) => c.id === cipherId);

  if (!cipher) {
    return '';
  }

  const userKeyModel = await db.getUserKey(email);

  if (!userKeyModel || !userKeyModel.userKey) {
    throw new Error('User key not found 🛸');
  }

  const keys = await db.getKeys(email);

  if (!keys) {
    throw new Error('Keys not found 🛸');
  }

  const theKey = await getCipherKey(cipher, userKeyModel.userKey, keys);

  try {
    const result = await decrypt(secret, theKey);
    return new TextDecoder().decode(result);
  } catch (e) {
    return '';
  }
};

export default { sync, getSecret };
