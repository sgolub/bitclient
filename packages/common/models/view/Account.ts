import { OrganisationModel } from '../Profile';

export type AccountViewModel = {
  email: string;
  avatarColor: string | null;
  name: string;

  organizations: OrganisationModel[];

  premium: boolean;
  premiumFromOrganization: boolean;

  emailVerified: boolean;
  forcePasswordReset: boolean;
};
