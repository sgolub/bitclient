import { CardType, CipherType, CustomFieldType, ID } from '../../types/vault';

export type VaultViewModel = {
  ciphers: CipherViewModel[];
  collections: CollectionViewModel[];
  folders: FolderViewModel[];
};

export type CipherViewModel = {
  id: ID;
  favorite: boolean;

  // attachments: any[] | null;
  collectionIds: ID[];
  folderId: ID | null;

  organizationId: ID | null;

  creationDate: Date;
  revisionDate: Date;
  deletedDate: Date | null;

  edit: boolean;
  viewPassword: boolean;
} & (
  | {
      type: CipherType.None;
      data: BaseDataViewModel;
    }
  | {
      type: CipherType.Login;
      data: BaseDataViewModel & LoginDataViewModel;
    }
  | {
      type: CipherType.SecureNote;
      data: BaseDataViewModel;
    }
  | {
      type: CipherType.Card;
      data: BaseDataViewModel & CardDataViewModel;
    }
  | {
      type: CipherType.Identity;
      data: BaseDataViewModel & IdentityDataViewModel;
    }
);

export type CustomFieldViewModel = {
  type: CustomFieldType;
  name: string;
  value: string;
};

export type CollectionViewModel = {
  id: ID;
  name: string;
  organizationId: ID;

  hidePasswords: boolean;
  manage: boolean;
  readOnly: boolean;
};

export type FolderViewModel = {
  id: ID;
  name: string;
  // revisionDate: Date;
};

export type BaseDataViewModel = {
  fields: CustomFieldViewModel[];
  name: string;
  notes: string;
};

export type LoginDataViewModel = {
  uri: string;
  uris: string[];
  username: string;
  password: string;
  passwordRevisionDate: Date | null;
  totp: string;
};

export type CardDataViewModel = {
  brand: CardType;
  cardholderName: string;
  number: string;
  preview: string;
  expMonth: string;
  expYear: string;
  code: string;
};

export type IdentityDataViewModel = {
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
