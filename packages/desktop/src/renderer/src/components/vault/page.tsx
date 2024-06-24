import log from 'electron-log';
import { useCallback, useEffect, useState } from 'react';
import {
  CipherViewModel,
  FolderViewModel,
  VaultViewModel,
} from '@bitclient/common/models/view/Vault';
import { useLoaderData, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import find from 'lodash/find';
import filter from 'lodash/filter';
import includes from 'lodash/includes';

import './vault.scss';

import useApplicationContext from '@renderer/hooks/useApplicationContext';
import VaultHeader from './header';
import CiphersList from './list/list';
import CipherContent from './content';
import VaultMenu from './menu';
import { useHotkeys } from 'react-hotkeys-hook';
import { AccountViewModel } from '@bitclient/common/models/view/Account';
import { sync } from '@renderer/services/vault';
import { OrganisationModel } from '@bitclient/common/models/Profile';

const LOADING_CLASS = 'loading';
const { body } = document;

export default function VaultPage() {
  log.info('VaultPage');
  const navigate = useNavigate();
  const { ctx, updateContext } = useApplicationContext();
  const [searchParams] = useSearchParams();
  const { account: loadedAccountData, vault: loadedVaultData } = useLoaderData() as {
    account: AccountViewModel;
    vault: VaultViewModel;
  };
  const [account, setAccount] = useState<AccountViewModel>(loadedAccountData);
  const [vault, setVault] = useState<VaultViewModel>(loadedVaultData);
  let { cipherId } = useParams();
  if (!cipherId && vault.ciphers.length > 0) {
    cipherId = vault.ciphers[0].id;
  }
  const [cipher, setCipher] = useState<CipherViewModel | null>(null);
  const [cipherFolder, setCipherFolder] = useState<string | null>(null);
  const [cipherOrganization, setCipherOrganization] = useState<string | null>(null);
  const [cipherCollections, setCipherCollections] = useState<string[]>([]);

  useEffect(() => {
    ctx.setAccount(account);
    updateContext(ctx);
  }, [account]);

  useEffect(() => {
    setVault(loadedVaultData);
  }, [loadedVaultData]);

  useEffect(() => {
    window.api.on('lock', (_event) => navigate('/lock'));
    window.api.on('logout', (_event) => {
      ctx.reset();
      updateContext(ctx);
      navigate('/');
    });
    return () => {
      window.api.removeAllListeners('lock');
      window.api.removeAllListeners('logout');
    };
  }, [ctx]);

  useEffect(() => {
    if (vault.ciphers.length === 0) {
      return;
    }
    const newChiper = (find(vault.ciphers, { id: cipherId }) as CipherViewModel) || null;
    const newFolder = find(vault.folders, { id: newChiper?.folderId }) as FolderViewModel;
    const newOrganization = find(ctx.account?.organizations, {
      id: newChiper?.organizationId,
    }) as OrganisationModel;
    const newCollections = filter(vault.collections, (collection) =>
      includes(newChiper?.collectionIds, collection.id),
    );
    setCipher(newChiper);
    setCipherFolder(newFolder?.name || null);
    setCipherOrganization(newOrganization?.name || null);
    setCipherCollections(newCollections.map((c) => c.name));
  }, [cipherId]);

  const escHotKey = useHotkeys(
    'esc',
    () => {
      if (searchParams.has('q')) {
        navigate('/vault');
      }
    },
    [searchParams, navigate],
  );

  const resyncVault = useCallback(async () => {
    try {
      log.info('Resyncing vault ⚡');
      body.classList.add(LOADING_CLASS);
      const type = searchParams.get('type');
      const collectionId = searchParams.get('collectionId');
      const folderId = searchParams.get('folderId');
      const vaults = searchParams.get('vaults')?.split(',') || [];
      const query = searchParams.get('q') || '';
      const sortBy = searchParams.get('sortBy') || '';
      const reverse = searchParams.get('reverse') === 'true';
      const { account, vault } = await sync({
        ctx,
        search: {
          type,
          collectionId,
          folderId,
          vaults,
          query,
          sortBy,
          reverse,
        },
        forseSync: true,
      });
      setAccount(account);
      setVault(vault);
    } catch (error) {
      log.error(error);
    } finally {
      body.classList.remove(LOADING_CLASS);
    }
  }, [searchParams]);

  return (
    <>
      <section ref={escHotKey} className="vault-container">
        <VaultMenu
          folders={vault.folders}
          collections={vault.collections}
          organizations={ctx.account?.organizations || []}
          resyncVault={resyncVault}
        />
        <div className="vault">
          <VaultHeader />
          <div className="vault-content">
            {vault.ciphers.length > 0 && <CiphersList ciphers={vault.ciphers} cipher={cipher} />}
            {cipherId && cipher && (
              <CipherContent
                cipher={cipher}
                folder={cipherFolder}
                organization={cipherOrganization}
                collections={cipherCollections}
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
