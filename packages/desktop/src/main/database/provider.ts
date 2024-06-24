import DatabaseProvider from '@bitclient/common/types/DatabaseProvider';
import { AccountModel } from '@bitclient/common/models/Account';
import { KeysModel } from '@bitclient/common/models/Keys';
import { VaultModel } from '@bitclient/common/models/Vault';
import { UserKeysModel } from '@bitclient/common/models/UserKeys';

import { getAccountsCollection, getKeysCollection } from './accounts';
import { getUserKeysCollection, getVaultsCollection } from './vaults';

const provider: DatabaseProvider = {
  //! Account
  getAllAccounts: async () => {
    return (await getAccountsCollection()).find();
  },

  getAccount: async (email: string) => {
    return (await getAccountsCollection()).findOne({ email }) as AccountModel;
  },

  addAccount: async (account: AccountModel) => {
    return (await getAccountsCollection()).insert(account) as AccountModel;
  },

  updateAccount: async (account: AccountModel) => {
    return (await getAccountsCollection()).update(account);
  },

  deleteAccount: async (email: string) => {
    (await getAccountsCollection()).removeWhere({ email });
  },

  //! Keys
  addKeys: async (keys: KeysModel) => {
    return (await getKeysCollection()).insert(keys) as KeysModel;
  },

  getKeys: async (email: string) => {
    return (await getKeysCollection()).findOne({ email }) as KeysModel;
  },

  updateKeys: async (keys: KeysModel) => {
    return (await getKeysCollection()).update(keys);
  },

  deleteKeys: async (email: string) => {
    (await getKeysCollection()).removeWhere({ email });
  },

  //! Vault
  getVault: async (email: string) => {
    return (await getVaultsCollection()).findOne({ email }) as VaultModel;
  },

  addVault: async (vault: VaultModel) => {
    return (await getVaultsCollection()).insert(vault) as VaultModel;
  },

  deleteVault: async (email: string) => {
    (await getVaultsCollection()).removeWhere({ email });
  },

  //! User keys
  addUserKey: async function (userKey: UserKeysModel) {
    return (await getUserKeysCollection()).insert(userKey) as UserKeysModel;
  },

  getUserKey: async function (email: string) {
    return (await getUserKeysCollection()).findOne({ email }) as UserKeysModel;
  },

  deleteUserKey: async function (email: string) {
    (await getUserKeysCollection()).removeWhere({ email });
  },
};

export default provider;
