export type PreloginValidationErrorsResponse = {
  validationErrors?: {
    Email: [string];
  };
  Message?: string;
};

export type PreloginResponse = {
  kdf: 0 | 1;
  kdfIterations: number;
  kdfMemory: number | null;
  kdfParallelism: number | null;
};

export type LoginResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token: string;
  scope: string;
  PrivateKey: string;
  Key: string;
  MasterPasswordPolicy: { Object: string };
  ForcePasswordReset: boolean;
  ResetMasterPassword: boolean;
  Kdf: number | null;
  KdfIterations: number | null;
  KdfMemory: number | null;
  KdfParallelism: number | null;
  UserDecryptionOptions: {
    HasMasterPassword: boolean;
    Object: string;
  };
};

export type LoginResponseTwoFactorAuth = {
  error: string;
  error_description: string;
  TwoFactorProviders: TwoFactorAuthProvider[];
  TwoFactorProviders2: Record<TwoFactorAuthProvider, { Email: string }>;
  SsoEmail2faSessionToken: string;
  Email: string;
  MasterPasswordPolicy: { Object: string };
};

export enum TwoFactorAuthProvider {
  None,
  TOTP = '0',
  Email = '1',
  Passkey = '2', // ?
  Yubikey = '3', // ?
  Duo = '4', // ?
}

export type RefreshTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token: string;
  scope: string;
};

export type ErrorResponse = {
  error: string;
  error_description: string;
  ErrorModel: {
    Message: string;
    Object: string;
  };
};

export type LoginErrorResponse = ErrorResponse;
export type RefreshTokenErrorResponse = ErrorResponse;
