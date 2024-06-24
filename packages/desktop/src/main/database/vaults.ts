import { VaultModel } from '@bitclient/common/models/Vault';
import { UserKeysModel } from '@bitclient/common/models/UserKeys';
import { getDatabase } from './database';

const VAULTS_DATABASE = 'vaults';
const USER_KEYS_COLLECTION = 'user_keys';
const VAULTS_COLLECTION = 'vaults';

async function getVaultsDatabase() {
  return await getDatabase(VAULTS_DATABASE, /* inMemory */ true);
}

export async function getUserKeysCollection() {
  const db = await getVaultsDatabase();
  return (
    db.getCollection<UserKeysModel>(USER_KEYS_COLLECTION) ||
    db.addCollection<UserKeysModel>(USER_KEYS_COLLECTION, {
      indices: ['email'],
    })
  );
}

export async function getVaultsCollection() {
  const db = await getVaultsDatabase();
  return (
    db.getCollection<VaultModel>(VAULTS_COLLECTION) ||
    db.addCollection<VaultModel>(VAULTS_COLLECTION, {
      indices: ['email'],
    })
  );
}
