import { AccountViewModel } from '@bitclient/common/models/view/Account';
import ApplicationContext, {
  ApplicationContextJSON,
} from '@bitclient/common/types/ApplicationContext';

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
}: {
  ctx: ApplicationContext;
  email: string;
  password: string;
}) {
  return await service<
    { ctx: ApplicationContextJSON; email: string; password: string },
    AccountViewModel
  >('login', {
    ctx: ctx.toJSON(),
    email,
    password,
  });
}
