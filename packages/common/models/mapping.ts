import { CardType, CipherType, Profile, SyncResponse } from '../types/vault';
import { ProfileModel } from './Profile';
import {
  BaseDataModel,
  CardDataModel,
  CipherModel,
  CollectionModel,
  CustomFieldModel,
  FolderModel,
  LoginDataModel,
  SecureNoteDataModel,
  VaultModel,
} from './Vault';

export function toProfileModel(profile: Profile): ProfileModel {
  return {
    id: profile.id,
    email: profile.email,
    avatarColor: profile.avatarColor,
    name: profile.name,
    culture: profile.culture,

    organizations: profile.organizations.map((org) => ({
      id: org.id,
      name: org.name,
    })),

    masterPasswordHint: profile.masterPasswordHint,
    twoFactorEnabled: profile.twoFactorEnabled,
    usesKeyConnector: profile.usesKeyConnector,

    premium: profile.premium,
    premiumFromOrganization: profile.premiumFromOrganization,

    emailVerified: profile.emailVerified,
    forcePasswordReset: profile.forcePasswordReset,

    creationDate: new Date(profile.creationDate),
  };
}

export function toVaultModel(vault: SyncResponse): VaultModel {
  const ciphers: CipherModel[] = vault.ciphers.map((cipher) => {
    const fields: CustomFieldModel[] =
      cipher.fields?.map((field) => ({
        name: field.name || '',
        value: field.value || '',
        linkedId: field.linkedId || '',
        type: field.type,
      })) || [];

    const model = {
      id: cipher.id,
      favorite: cipher.favorite,

      name: cipher.name,
      notes: cipher.notes || '',

      collectionIds: cipher.collectionIds,
      folderId: cipher.folderId,

      organizationId: cipher.organizationId,
      organizationUseTotp: cipher.organizationUseTotp,
      key: cipher.key,

      creationDate: new Date(cipher.creationDate),
      revisionDate: new Date(cipher.revisionDate),
      deletedDate: cipher.deletedDate ? new Date(cipher.deletedDate) : null,

      edit: cipher.edit,
      viewPassword: cipher.viewPassword,
    };

    const data: BaseDataModel = {
      fields,
      // passwordHistory: cipher.data.passwordHistory || [],
    };

    switch (cipher.type) {
      case CipherType.Login:
        const login: LoginDataModel = {
          uri: cipher.login.uri || '',
          uris: cipher.login.uris?.map((u) => u.uri) || [],
          username: cipher.login.username || '',
          password: cipher.login.password || '',
          passwordRevisionDate: cipher.login.passwordRevisionDate
            ? new Date(cipher.login.passwordRevisionDate)
            : null,
          totp: cipher.login.totp || '',
        };
        return {
          ...model,
          type: CipherType.Login,
          data: {
            ...data,
            ...login,
          },
        } as CipherModel;
      case CipherType.SecureNote:
        const secureNote: SecureNoteDataModel = {};
        return {
          ...model,
          type: CipherType.SecureNote,
          data: {
            ...data,
            ...secureNote,
          },
        } as CipherModel;
      case CipherType.Card:
        const card: CardDataModel = {
          cardholderName: cipher.card.cardholderName || '',
          brand: (cipher.card.brand || '') as CardType,
          number: cipher.card.number || '',
          last4digits: '',
          numberLength: 0,
          expMonth: cipher.card.expMonth || '',
          expYear: cipher.card.expYear || '',
          code: cipher.card.code || '',
        };
        return {
          ...model,
          type: CipherType.Card,
          data: {
            ...data,
            ...card,
          },
        } as CipherModel;
      case CipherType.Identity:
        const identity = {
          title: cipher.identity.title || '',
          firstName: cipher.identity.firstName || '',
          middleName: cipher.identity.middleName || '',
          lastName: cipher.identity.lastName || '',
          address1: cipher.identity.address1 || '',
          address2: cipher.identity.address2 || '',
          address3: cipher.identity.address3 || '',
          city: cipher.identity.city || '',
          state: cipher.identity.state || '',
          postalCode: cipher.identity.postalCode || '',
          country: cipher.identity.country || '',
          company: cipher.identity.company || '',
          email: cipher.identity.email || '',
          phone: cipher.identity.phone || '',
          ssn: cipher.identity.ssn || '',
          username: cipher.identity.username || '',
          passportNumber: cipher.identity.passportNumber || '',
          licenseNumber: cipher.identity.licenseNumber || '',
        };
        return {
          ...model,
          type: CipherType.Identity,
          data: {
            ...data,
            ...identity,
          },
        } as CipherModel;
      default:
        return { ...model, type: CipherType.None, data } as CipherModel;
    }
  });

  const collections: CollectionModel[] = vault.collections.map(
    (collection) =>
      ({
        id: collection.id,
        name: collection.name,
        manage: collection.manage,
        organizationId: collection.organizationId,
        readOnly: collection.readOnly,
      }) as CollectionModel,
  );

  const folders: FolderModel[] = vault.folders.map(
    (folder) =>
      ({
        id: folder.id,
        name: folder.name,
        revisionDate: new Date(folder.revisionDate),
      }) as FolderModel,
  );

  return {
    email: vault.profile.email,
    ciphers,
    collections,
    folders,
  };
}
