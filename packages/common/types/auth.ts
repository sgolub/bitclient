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
