import { ProfileModel } from '../models/Profile';
import { KDFConfig } from '../types/KDFConfig';

export type AccountModel = {
  email: string;
  kdf: KDFConfig;
  profile: ProfileModel | null;
};
