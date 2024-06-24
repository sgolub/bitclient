import { ID } from '../types/vault';

export type KeysModel = {
  email: string;
  keys: {
    accessToken: string;
    expiresIn: Date;
    tokenType: string;
    refreshToken: string;
    privateKey: string;
    key: string;
    organizationKeys: { [organizationId: ID]: string };
  };
};
