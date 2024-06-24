import { ID } from '../types/vault';

export type ProfileModel = {
  id: ID;
  email: string;
  avatarColor: string | null;
  name: string;
  culture: string; //! add enum: 'en-US'

  organizations: OrganisationModel[];

  masterPasswordHint: string;
  twoFactorEnabled: boolean;
  usesKeyConnector: boolean;

  premium: boolean;
  premiumFromOrganization: boolean;

  emailVerified: boolean;
  forcePasswordReset: boolean;

  creationDate: Date;
};

export type OrganisationModel = {
  id: ID;
  name: string;
};
