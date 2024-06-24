import ApplicationContext, {
  ApplicationContextJSON,
} from '@bitclient/common/types/ApplicationContext';
import { VaultSearchViewModel } from '@bitclient/common/models/view/VaultSearch';
import { AccountViewModel } from '@bitclient/common/models/view/Account';
import { VaultViewModel } from '@bitclient/common/models/view/Vault';

const { service } = window.api;

export async function sync({
  ctx,
  search,
  forseSync,
}: {
  ctx: ApplicationContext;
  search: VaultSearchViewModel;
  forseSync?: boolean;
}) {
  return await service<
    {
      ctx: ApplicationContextJSON;
      search: VaultSearchViewModel;
      forseSync?: boolean;
    },
    { account: AccountViewModel; vault: VaultViewModel }
  >('sync', {
    ctx: ctx.toJSON(),
    search,
    forseSync,
  });
}

export async function getSecret({
  ctx,
  cipherId,
  secret,
}: {
  ctx: ApplicationContext;
  cipherId: string;
  secret: string;
}) {
  return await service<
    {
      ctx: ApplicationContextJSON;
      cipherId: string;
      secret: string;
    },
    string
  >('getSecret', {
    ctx: ctx.toJSON(),
    cipherId,
    secret,
  });
}

export async function copySecret({
  ctx,
  cipherId,
  secret,
}: {
  ctx: ApplicationContext;
  cipherId: string;
  secret: string;
}) {
  return await service<
    {
      ctx: ApplicationContextJSON;
      cipherId: string;
      secret: string;
    },
    string
  >('copySecret', {
    ctx: ctx.toJSON(),
    cipherId,
    secret,
  });
}
