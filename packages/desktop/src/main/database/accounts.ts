import { AccountModel } from '@bitclient/common/models/Account';
import { getDatabase } from './database';
import { KeysModel } from '@bitclient/common/models/Keys';

const ACCOUNTS_DATABASE = 'accounts';
const ACCOUNTS_COLLECTION = 'accounts';
const KEYS_COLLECTION = 'keys';

export async function getAccountsDatabase() {
  return await getDatabase(ACCOUNTS_DATABASE);
}

export async function getAccountsCollection() {
  const db = await getAccountsDatabase();
  return (
    db.getCollection<AccountModel>(ACCOUNTS_COLLECTION) ||
    db.addCollection<AccountModel>(ACCOUNTS_COLLECTION, {
      indices: ['email'],
    })
  );
}

export async function getKeysCollection() {
  const db = await getAccountsDatabase();
  return (
    db.getCollection<KeysModel>(KEYS_COLLECTION) ||
    db.addCollection<KeysModel>(KEYS_COLLECTION, {
      indices: ['email'],
    })
  );
}
