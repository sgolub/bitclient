import { CardType, CipherType, CustomFieldType, ID } from '../types/vault';

export type VaultModel = {
  email: string;
  ciphers: CipherModel[];
  collections: CollectionModel[];
  // domains: [] | null;
  folders: FolderModel[];
};

export type CipherModel = {
  id: ID;
  name: string;
  notes: string | null;
  // fields: CustomFieldModel[];
  favorite: boolean;

  // attachments: any[] | null;
  collectionIds: ID[];
  folderId: ID | null;

  key: string | null;
  organizationId: ID | null;
  organizationUseTotp: boolean;

  creationDate: Date;
  revisionDate: Date;
  deletedDate: Date | null;

  edit: boolean;
  viewPassword: boolean;
  // type: CipherType;
} & (
  | {
      type: CipherType.None;
      data: BaseDataModel;
    }
  | {
      type: CipherType.Login;
      data: BaseDataModel & LoginDataModel;
    }
  | {
      type: CipherType.SecureNote;
      data: BaseDataModel & SecureNoteDataModel;
    }
  | {
      type: CipherType.Card;
      data: BaseDataModel & CardDataModel;
    }
  | {
      type: CipherType.Identity;
      data: BaseDataModel & IdentityDataModel;
    }
);

export type CustomFieldModel = {
  type: CustomFieldType;
  name: string;
  value: string;
  linkedId: string | null;
};

export type CollectionModel = {
  id: ID;
  name: string;
  organizationId: ID;

  hidePasswords: boolean;
  manage: boolean;
  readOnly: boolean;
};

export type FolderModel = {
  id: ID;
  name: string;
  revisionDate: Date;
};

export type BaseDataModel = {
  fields: CustomFieldModel[];
};

export type LoginDataModel = {
  uri: string;
  uris: string[];
  username: string;
  password: string;
  passwordRevisionDate: Date | null;
  totp: string;
};

export type SecureNoteDataModel = {};

export type CardDataModel = {
  cardholderName: string;
  brand: CardType;
  number: string;
  last4digits: string;
  numberLength: number;
  expMonth: string;
  expYear: string;
  code: string;
};

export type IdentityDataModel = {
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  address1: string;
  address2: string;
  address3: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  company: string;
  email: string;
  phone: string;
  ssn: string;
  username: string;
  passportNumber: string;
  licenseNumber: string;
};
