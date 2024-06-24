import { createContext } from 'react';

import BitwardenServer from '@bitclient/common/types/BitwardenServer';
import ApplicationContext from '@bitclient/common/types/ApplicationContext';

export const USER_AGENT = window.navigator.userAgent;

export const BITWARDEN_OFFICIAL_SERVERS: BitwardenServer[] = [
  new BitwardenServer(
    'bitwarden.com',
    'Official US Bitwarden Server',
    'https://vault.bitwarden.com',
    USER_AGENT,
  ),
  new BitwardenServer(
    'bitwarden.eu',
    'Official EU Bitwarden Server',
    'https://vault.bitwarden.eu',
    USER_AGENT,
  ),
];

export const [DEFAULT_SERVER] = BITWARDEN_OFFICIAL_SERVERS;

export const ReactApplicationContext = createContext<{
  ctx: ApplicationContext;
  updateContext: React.Dispatch<React.SetStateAction<ApplicationContext>>;
} | null>(null);
