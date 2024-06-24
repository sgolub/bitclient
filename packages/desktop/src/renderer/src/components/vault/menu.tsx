import { NavLink, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import map from 'lodash/map';
import includes from 'lodash/includes';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import filter from 'lodash/filter';

import { CollectionViewModel } from '@bitclient/common/models/view/Vault';
import { OrganisationModel } from '@bitclient/common/models/Profile';
import useApplicationContext from '@renderer/hooks/useApplicationContext';
import { FolderViewModel } from '@bitclient/common/models/view/Vault';

import Card from '../common/icons/card';
import Key from '../common/icons/key';
import List from '../common/icons/list';
import Notes from '../common/icons/notes';
import Identity from '../common/icons/identity';
import Star from '../common/icons/star';
import Vault from '../common/icons/vault';
import Office from '../common/icons/office';
import Folder from '../common/icons/folder';
import Collection from '../common/icons/collection';
import Trash from '../common/icons/trash';
import Circle from '../common/icons/circle';
import Check from '../common/icons/check';
import DoubleCheck from '../common/icons/doulbleCheck';
import Logo from '../common/icons/logo';
import EllipsisVertical from '../common/icons/ellipsisVertical';
import Dropdown from '../common/dropdown/dropdown';
// import Password from '../common/password/password';

import './menu.scss';

export default function VaultMenu({
  organizations,
  folders,
  collections,
  resyncVault,
}: {
  organizations: OrganisationModel[];
  folders: FolderViewModel[];
  collections: CollectionViewModel[];
  resyncVault: () => Promise<void>;
}) {
  const { ctx } = useApplicationContext();
  const [searchParams] = useSearchParams();
  // const navigate = useNavigate();
  const { name, avatarColor } = ctx.account || {};
  const vaults = useMemo(() => {
    return sortBy([...map(organizations, (organization) => organization.id), '_']);
  }, [organizations]);
  const [type, setType] = useState<string>('');
  const [folderId, setFolderId] = useState<string>('');
  const [collectionId, setCollectionId] = useState<string>('');
  const [selectedVaults, setSelectedVaults] = useState<string[]>([]);

  useEffect(() => {
    setType(searchParams.get('type') || '');
    setFolderId(searchParams.get('folderId') || '');
    setCollectionId(searchParams.get('collectionId') || '');
    setSelectedVaults(searchParams.get('vaults')?.split(',') || [...vaults]);
  }, [searchParams, vaults]);

  function getVaultsList(id: string): string[] {
    if (selectedVaults.length === 1 && selectedVaults[0] === id) {
      return [...selectedVaults];
    }
    if (includes(selectedVaults, id)) {
      return filter([...selectedVaults], (val) => val === id);
    }
    return sortBy([...selectedVaults, id]);
  }

  function getSearchParams(params: object = {}): string {
    const result = new URLSearchParams(searchParams);
    result.delete('q');
    result.delete('type');
    result.delete('folderId');
    result.delete('collectionId');

    for (const [key, value] of Object.entries(params)) {
      if (value) {
        result.set(key, value);
      }
    }

    return result.toString();
  }

  return (
    <>
      <section className="vault-menu">
        <header>
          <div>
            {ctx.platform !== 'darwin' && (
              <>
                <Logo className="logo" />
                <strong>bit</strong>client
              </>
            )}
          </div>
          <Dropdown className="btn-menu" content={<EllipsisVertical className="menu-icon fill" />}>
            <ul className="menu-list">
              <li className="menu-item">
                <a className="disabled">Add item</a>
              </li>
              <li className="menu-item">
                <a className="disabled">Add folder</a>
              </li>
              <li className="menu-item">
                <a>Generator...</a>
              </li>
            </ul>
            <hr />
            <ul className="menu-list">
              <li className="menu-item">
                <a onClick={resyncVault}>Sync vault</a>
              </li>
              <li className="menu-item" onClick={() => window.api.openSettings()}>
                <a className="disabled">Setings...</a>
              </li>
            </ul>
            <hr />
            <ul className="menu-list">
              <li className="menu-item" onClick={() => window.api.checkForUpdates()}>
                <a className="disabled">Check for updates...</a>
              </li>
              <li className="menu-item" onClick={() => window.api.openAbout()}>
                <a>
                  About&nbsp;<strong>bit</strong>client
                </a>
              </li>
            </ul>
            <hr />
            <ul className="menu-list">
              <li className="menu-item">
                <a onClick={() => window.api.lock(ctx.account!.email)}>Lock vault</a>
              </li>
              <li className="menu-item">
                <a onClick={() => window.api.logout(ctx.account!.email)}>Log out</a>
              </li>
              <li className="menu-item">
                <a onClick={() => window.api.quit()}>Quit</a>
              </li>
            </ul>
          </Dropdown>
        </header>
        <nav>
          <menu>
            {organizations.length > 0 ? (
              <>
                <li>
                  <NavLink to="/vault" className={() => 'vaults-list-item'}>
                    <Vault className="icon fill" />
                    <span className="label">All Vaults</span>
                    {isEqual(selectedVaults, vaults) && <DoubleCheck className="icon-check" />}
                  </NavLink>
                </li>
                {name && (
                  <li>
                    <NavLink
                      to={{
                        pathname: '/vault',
                        search: getSearchParams({ vaults: getVaultsList('_') }),
                      }}
                      className={() => 'vaults-list-item'}
                    >
                      <Circle fill={avatarColor || ''} className="icon" />
                      <span className="label">{name}</span>
                      {includes(selectedVaults, '_') && <Check className="icon-check" />}
                    </NavLink>
                  </li>
                )}
                {organizations.map((org) => (
                  <li key={org.id}>
                    <NavLink
                      to={{
                        pathname: '/vault',
                        search: getSearchParams({ vaults: getVaultsList(org.id) }),
                      }}
                      className={() => 'vaults-list-item'}
                    >
                      <Office className="icon fill" />
                      <span className="label">{org.name}</span>
                      {includes(selectedVaults, org.id) && <Check className="icon-check" />}
                    </NavLink>
                  </li>
                ))}
              </>
            ) : (
              <>
                {name && (
                  <li>
                    <div className="vaults-list-item">
                      <Circle fill={avatarColor || ''} className="icon" />
                      <span className="label">{name}</span>
                    </div>
                  </li>
                )}
              </>
            )}
          </menu>
          <hr />
          <menu>
            <li>
              <NavLink
                to={{
                  pathname: '/vault',
                  search: getSearchParams(),
                }}
                className={() => (!type && !searchParams.has('q') ? 'active' : '')}
              >
                <List className="icon fill" />
                All items
              </NavLink>
            </li>
            <li>
              <NavLink
                to={{
                  pathname: '/vault',
                  search: getSearchParams({ type: 'favorites' }),
                }}
                className={() => (type === 'favorites' ? 'active' : '')}
              >
                <Star className="icon" />
                Favorites
              </NavLink>
            </li>
            <li>
              <NavLink
                to={{
                  pathname: '/vault',
                  search: getSearchParams({ type: 'logins' }),
                }}
                className={() => (type === 'logins' ? 'active' : '')}
              >
                <Key className="icon" />
                Logins
              </NavLink>
            </li>
            <li>
              <NavLink
                to={{
                  pathname: '/vault',
                  search: getSearchParams({ type: 'cards' }),
                }}
                className={() => (type === 'cards' ? 'active' : '')}
              >
                <Card className="icon" />
                Cards
              </NavLink>
            </li>
            <li>
              <NavLink
                to={{
                  pathname: '/vault',
                  search: getSearchParams({ type: 'identities' }),
                }}
                className={() => (type === 'identities' ? 'active' : '')}
              >
                <Identity className="icon" />
                Identities
              </NavLink>
            </li>
            <li>
              <NavLink
                to={{
                  pathname: '/vault',
                  search: getSearchParams({ type: 'notes' }),
                }}
                className={() => (type === 'notes' ? 'active' : '')}
              >
                <Notes className="icon" />
                Secure notes
              </NavLink>
            </li>
          </menu>
          <hr />
          <menu>
            {folders.map(({ id, name }) => (
              <li key={id}>
                <NavLink
                  to={{
                    pathname: '/vault',
                    search: getSearchParams({ type: 'folder', folderId: id }),
                  }}
                  className={() => (type === 'folder' && folderId === id ? 'active' : '')}
                >
                  <Folder className="icon" />
                  <span className="label">{name}</span>
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                to={{
                  pathname: '/vault',
                  search: getSearchParams({ type: 'folder' }),
                }}
                className={() => (type === 'folder' && !folderId ? 'active' : '')}
              >
                <Folder className="icon" />
                No folder
              </NavLink>
            </li>
          </menu>
          <hr />
          {collections.length > 0 && (
            <>
              <menu>
                {collections.map(({ id, name }) => (
                  <li key={id}>
                    <NavLink
                      to={{
                        pathname: '/vault',
                        search: getSearchParams({ type: 'collection', collectionId: id }),
                      }}
                      className={() =>
                        type === 'collection' && collectionId === id ? 'active' : ''
                      }
                    >
                      <Collection className="icon fill" />
                      {name}
                    </NavLink>
                  </li>
                ))}
              </menu>
              <hr />
            </>
          )}
          <menu>
            <li>
              <NavLink
                to={{
                  pathname: '/vault',
                  search: getSearchParams({ type: 'trash' }),
                }}
                className={() => (type === 'trash' ? 'active' : '')}
              >
                <Trash className="icon fill" />
                Trash
              </NavLink>
            </li>
          </menu>
        </nav>
      </section>
    </>
  );
}
