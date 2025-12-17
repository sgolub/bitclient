import { AccountViewModel } from '@bitclient/common/models/view/Account';
import ApplicationContext, {
  ApplicationContextJSON,
} from '@bitclient/common/types/ApplicationContext';
import { TwoFactorAuthProvider } from '@bitclient/common/types/auth';

const { service } = window.api;

export async function prelogin({ ctx, email }: { ctx: ApplicationContext; email: string }) {
  return await service<{ ctx: ApplicationContextJSON; email: string }, void>('prelogin', {
    ctx: ctx.toJSON(),
    email,
  });
}

export async function login({
  ctx,
  email,
  password,
  newDeviceOtp,
  twoFactor,
}: {
  ctx: ApplicationContext;
  email: string;
  password: string;
  newDeviceOtp?: string;
  twoFactor?: { token: string; provider: string; remember: boolean };
}) {
  return await service<
    {
      ctx: ApplicationContextJSON;
      email: string;
      password: string;
      newDeviceOtp?: string;
      twoFactor?: { token: string; provider: string; remember: boolean };
    },
    | { twoFactor: false; account: AccountViewModel; unknownDevice: false }
    | { twoFactor: true; providers: TwoFactorAuthProvider[]; unknownDevice: false }
    | { twoFactor: false; unknownDevice: true }
  >('login', {
    ctx: ctx.toJSON(),
    email,
    password,
    newDeviceOtp,
    twoFactor,
  });
}

export async function sendEmailLogin({
  ctx,
  email,
  password,
}: {
  ctx: ApplicationContext;
  email: string;
  password: string;
}) {
  return await service<
    {
      ctx: ApplicationContextJSON;
      email: string;
      password: string;
    },
    void
  >('sendEmailLogin', {
    ctx: ctx.toJSON(),
    email,
    password,
  });
}
