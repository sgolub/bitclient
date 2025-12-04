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
}: {
  ctx: ApplicationContext;
  email: string;
  password: string;
  newDeviceOtp?: string;
}) {
  return await service<
    { ctx: ApplicationContextJSON; email: string; password: string; newDeviceOtp?: string },
    | { twoFactor: false; account: AccountViewModel; unknownDevice: false }
    | { twoFactor: true; providers: TwoFactorAuthProvider[]; unknownDevice: false }
    | { twoFactor: false; unknownDevice: true }
  >('login', {
    ctx: ctx.toJSON(),
    email,
    password,
    newDeviceOtp,
  });
}
