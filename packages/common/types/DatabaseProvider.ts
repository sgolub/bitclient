import { AccountModel } from '../models/Account';
import { KeysModel } from '../models/Keys';
import { UserKeysModel } from '../models/UserKeys';
import { VaultModel } from '../models/Vault';

export default interface DatabaseProvider {
  getAllAccounts: () => Promise<AccountModel[]>;
  getAccount: (email: string) => Promise<AccountModel>;
  addAccount: (account: AccountModel) => Promise<AccountModel>;
  updateAccount: (account: AccountModel) => Promise<AccountModel>;
  deleteAccount: (email: string) => Promise<void>;

  addKeys: (account: KeysModel) => Promise<KeysModel>;
  getKeys: (email: string) => Promise<KeysModel>;
  updateKeys: (account: KeysModel) => Promise<KeysModel>;
  deleteKeys: (email: string) => Promise<void>;

  addVault: (vault: VaultModel) => Promise<VaultModel>;
  getVault: (email: string) => Promise<VaultModel>;
  deleteVault: (email: string) => Promise<void>;

  addUserKey: (userKey: UserKeysModel) => Promise<UserKeysModel>;
  getUserKey: (email: string) => Promise<UserKeysModel>;
  deleteUserKey: (email: string) => Promise<void>;
}
