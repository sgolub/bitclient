import { AccountModel } from '../../models/Account';
import { CipherType } from '../../types/vault';
import {
  BaseDataModel,
  CardDataModel,
  CipherModel,
  CollectionModel,
  FolderModel,
  IdentityDataModel,
  LoginDataModel,
  VaultModel,
} from '../Vault';
import {
  BaseDataViewModel,
  CardDataViewModel,
  CipherViewModel,
  CollectionViewModel,
  FolderViewModel,
  LoginDataViewModel,
  VaultViewModel,
} from './Vault';
import { AccountViewModel } from './Account';

export function toVaultViewModel(vault: VaultModel): VaultViewModel {
  const viewModel: VaultViewModel = {
    ciphers: vault.ciphers.map(toCipherViewModel),
    collections: vault.collections.map(toCollectionViewModel),
    folders: vault.folders.map(toFolderViewModel),
  };

  return viewModel;
}

function toCipherViewModel(value: CipherModel): CipherViewModel {
  return {
    id: value.id,
    favorite: value.favorite,
    name: value.name,
    notes: value.notes || '',
    collectionIds: value.collectionIds.map((id) => id),
    folderId: value.folderId,
    organizationId: value.organizationId,
    key: value.key,
    creationDate: value.creationDate,
    revisionDate: value.revisionDate,
    deletedDate: value.deletedDate,
    edit: value.edit,
    viewPassword: value.viewPassword,
    type: value.type,
    data: toDataViewModel(value.data, value.type),
  } as CipherViewModel;
}

function toCollectionViewModel(value: CollectionModel): CollectionViewModel {
  return {
    id: value.id,
    name: value.name,
    organizationId: value.organizationId,
    hidePasswords: value.hidePasswords,
    manage: value.manage,
    readOnly: value.readOnly,
  };
}

function toFolderViewModel(value: FolderModel): FolderViewModel {
  return {
    id: value.id,
    name: value.name,
  };
}

function toDataViewModel(data: BaseDataModel, cipherType: CipherType) {
  const base: BaseDataViewModel = {
    fields: data.fields.map((field) => ({
      name: field.name,
      value: field.value,
      type: field.type,
    })),
  };

  switch (cipherType) {
    case CipherType.Login:
      const dataLogin = data as BaseDataModel & LoginDataModel;
      return {
        ...base,
        uri: dataLogin.uri,
        uris: [...dataLogin.uris],
        username: dataLogin.username,
        password: dataLogin.password,
        passwordRevisionDate: dataLogin.passwordRevisionDate,
        totp: dataLogin.totp,
      } as BaseDataViewModel & LoginDataViewModel;
    case CipherType.SecureNote:
      return base as BaseDataViewModel;
    case CipherType.Card:
      const dataCard = data as BaseDataModel & CardDataModel;
      return {
        ...base,
        number: dataCard.number,
        cardholderName: dataCard.cardholderName,
        preview:
          dataCard.numberLength > 0 ? '•••• •••• •••• ' + (dataCard.last4digits || '••••') : '',
        expMonth: dataCard.expMonth,
        expYear: dataCard.expYear,
        code: dataCard.code,
        brand: dataCard.brand,
      } as BaseDataViewModel & CardDataViewModel;
    case CipherType.Identity:
      const dataIdentity = data as BaseDataModel & IdentityDataModel;
      return { ...base, ...dataIdentity } as BaseDataViewModel & IdentityDataModel;
    default:
      return base as BaseDataViewModel;
  }
}

export function toAccountViewModel(account: AccountModel): AccountViewModel {
  return {
    email: account.email,
    avatarColor: account.profile?.avatarColor || null,
    name: account.profile?.name || '',
    organizations: [...(account.profile?.organizations || [])],
    premium: account.profile?.premium || false,
    premiumFromOrganization: account.profile?.premiumFromOrganization || false,
    emailVerified: account.profile?.emailVerified || true,
    forcePasswordReset: account.profile?.forcePasswordReset || false,
  };
}
