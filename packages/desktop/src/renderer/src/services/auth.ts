import ApplicationContext, {
  ApplicationContextJSON,
} from '@bitclient/common/types/ApplicationContext';
import { LoginResponse } from '@bitclient/common/types/auth';
import { KDFConfig } from '@bitclient/common/types/KDFConfig';

const { service } = window.api;

export async function prelogin({ ctx, email }: { ctx: ApplicationContext; email: string }) {
  return await service<{ ctx: ApplicationContextJSON; email: string }, KDFConfig>('prelogin', {
    ctx: ctx.toJSON(),
    email,
  });
}

export async function login({
  ctx,
  email,
  password,
  kdfConfig,
}: {
  ctx: ApplicationContext;
  email: string;
  password: string;
  kdfConfig: KDFConfig;
}) {
  return await service<
    { ctx: ApplicationContextJSON; email: string; password: string; kdfConfig: KDFConfig },
    LoginResponse
  >('login', {
    ctx: ctx.toJSON(),
    email,
    password,
    kdfConfig,
  });
}

export async function unlock({ ctx, password }: { ctx: ApplicationContext; password: string }) {
  return await service<{ ctx: ApplicationContextJSON; password: string }, LoginResponse>('unlock', {
    ctx: ctx.toJSON(),
    password,
  });
}
