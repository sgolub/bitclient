export type ID = `${string}-${string}-${string}-${string}-${string}`; //* 'a66fb2eb-a9a1-43f7-914a-b1a700dc8e1a'
// type EncryptedData = `${number}.${string}`;

export type SyncResponse = {
  ciphers: CipherDetails[];
  collections: CollectionDetails[];
  domains: [] | null;
  folders: Folder[];
  policies: any[]; // TODO: add policy model
  profile: Profile;
  sends: any[]; // TODO: add send model
};

export enum CipherType {
  None = 0,
  Login,
  SecureNote,
  Card,
  Identity,
}

export enum CustomFieldType {
  Text = 0,
  Password,
  Boolean,
  Linked,
}

export enum CardType {
  None = '',
  Visa = 'Visa',
  Mastercard = 'Mastercard',
  Amex = 'Amex',
  Discover = 'Discover',
  DinersClub = 'Diners Club',
  JCB = 'JCB',
  Maestro = 'Maestro',
  UnionPay = 'UnionPay',
  RuPay = 'RuPay',
  Other = 'Other',
}

type LoginData = {
  uri: string | null;
  uris: {
    uri: string;
    uriChecksum: string;
    match: number | null; //! enum
  }[];
  username: string | null;
  password: string | null;
  passwordRevisionDate: string | null;
  totp: string | null;
  autofillOnPageLoad: null; //? boolean
  fido2Credentials: null; //? boolean
};

type SecureNoteData = { type: 0 };

type CardData = {
  cardholderName: string | null;
  brand: string | null;
  number: string | null;
  expMonth: string | null;
  expYear: string | null;
  code: string | null;
};

type IdentityData = {
  title: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  address1: string | null;
  address2: string | null;
  address3: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  ssn: string | null;
  username: string | null;
  passportNumber: string | null;
  licenseNumber: string | null;
};

type CustomField = {
  type: CustomFieldType;
  name: string;
  value: string;
  linkedId: string | null;
};

type BaseData = {
  fields: CustomField[] | null;
  name: string | null;
  notes: string | null;
  passwordHistory: null;
};

export type CipherDetails = {
  attachments: any[] | null;
  collectionIds: ID[];
  creationDate: string; //* '2024-07-08T13:23:00.9866667Z'
  deletedDate: string | null;
  edit: boolean;
  favorite: boolean;
  fields: CustomField[] | null;
  folderId: ID | null;
  id: ID;
  key: string | null;
  name: string;
  notes: string | null;
  organizationId: ID | null;
  organizationUseTotp: boolean;
  passwordHistory: any[] | null; //? string[]
  reprompt: number; //?
  revisionDate: string;
  type: CipherType;
  viewPassword: boolean;
} & (
  | {
      type: CipherType.Login;
      login: LoginData;
      secureNote: null;
      card: null;
      identity: null;
      data: BaseData & LoginData;
    }
  | {
      type: CipherType.SecureNote;
      login: null;
      secureNote: SecureNoteData;
      card: null;
      identity: null;
      data: BaseData & SecureNoteData;
    }
  | {
      type: CipherType.Card;
      login: null;
      secureNote: null;
      card: CardData;
      identity: null;
      data: BaseData & CardData;
    }
  | {
      type: CipherType.Identity;
      login: null;
      secureNote: null;
      card: null;
      identity: IdentityData;
      data: BaseData & IdentityData;
    }
);

export type CollectionDetails = {
  externalId: any | null; //? string?
  hidePasswords: boolean;
  id: ID;
  manage: boolean;
  name: string;
  organizationId: string;
  readOnly: boolean;
};

export type Folder = {
  id: ID;
  name: string;
  revisionDate: string;
};

export type Profile = {
  avatarColor: any | null;
  creationDate: string;
  culture: string; //! add enum: 'en-US'
  email: string;
  emailVerified: boolean;
  forcePasswordReset: boolean;
  id: ID;
  key: string;
  masterPasswordHint: string;
  name: string;
  organizations: ProfileOrganization[];
  premium: boolean;
  premiumFromOrganization: boolean;
  privateKey: string;
  providerOrganizations: [];
  providers: [];
  securityStamp: ID;
  twoFactorEnabled: boolean;
  usesKeyConnector: boolean;
};

export type ProfileOrganization = {
  id: ID;
  name: string;
  usePolicies: boolean;
  useSso: boolean;
  useKeyConnector: boolean;
  useScim: boolean;
  useGroups: boolean;
  useDirectory: boolean;
  useEvents: boolean;
  useTotp: boolean;
  use2fa: boolean;
  useApi: boolean;
  useResetPassword: boolean;
  useSecretsManager: boolean;
  usePasswordManager: boolean;
  usersGetPremium: boolean;
  useCustomPermissions: boolean;
  useActivateAutofillPolicy: boolean;
  selfHost: boolean;
  seats: number;
  maxCollections: number;
  maxStorageGb: null;
  key: string;
  status: number; //? enum?
  type: number; //? enum?
  enabled: boolean;
  ssoBound: boolean;
  identifier: null;
  permissions: {
    accessEventLogs: boolean;
    accessImportExport: boolean;
    accessReports: boolean;
    createNewCollections: boolean;
    editAnyCollection: boolean;
    deleteAnyCollection: boolean;
    editAssignedCollections: boolean;
    deleteAssignedCollections: boolean;
    manageGroups: boolean;
    managePolicies: boolean;
    manageSso: boolean;
    manageUsers: boolean;
    manageResetPassword: boolean;
    manageScim: boolean;
  };
  resetPasswordEnrolled: boolean;
  userId: ID;
  organizationUserId: ID;
  hasPublicAndPrivateKeys: boolean;
  providerId: null;
  providerName: null;
  providerType: null;
  familySponsorshipFriendlyName: null;
  familySponsorshipAvailable: boolean;
  productTierType: number; //? enum?
  keyConnectorEnabled: boolean;
  keyConnectorUrl: null;
  familySponsorshipLastSyncDate: null;
  familySponsorshipValidUntil: null;
  familySponsorshipToDelete: null;
  accessSecretsManager: boolean;
  limitCollectionCreationDeletion: boolean;
  allowAdminAccessToAllCollectionItems: boolean;
};
