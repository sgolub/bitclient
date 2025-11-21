import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  BaseDataViewModel,
  CardDataViewModel,
  CipherViewModel,
} from '@bitclient/common/models/view/Vault';
import CiphersFavicon from '../favicon';
import { CipherType } from '@bitclient/common/types/vault';

import './list.scss';
import Sort from '../../common/icons/sort';
import { useHotkeys } from 'react-hotkeys-hook';
import { useEffect, useRef } from 'react';
import CircleXmark from '../../common/icons/circleXmark';
import Dropdown from '../../common/dropdown/dropdown';
import SortingMenu from './sorting';

export default function CiphersList({
  ciphers,
  cipher: activeCipher,
}: {
  ciphers: CipherViewModel[];
  cipher: CipherViewModel | null;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    list.current
      ?.querySelectorAll('li')
      ?.item(activeCipher ? ciphers.indexOf(activeCipher) : 0)
      ?.querySelector('a')
      ?.focus();
  }, [ciphers, activeCipher, list]);

  useHotkeys(
    'down,up',
    (_e, { hotkey }) => {
      const ul = list.current as HTMLUListElement;
      if (!ul) {
        return;
      }

      const li = (ul.querySelector('li a:focus')?.parentElement ||
        ul.querySelector('li a.active')?.parentElement) as HTMLLIElement;
      if (hotkey === 'down' && li && li.nextSibling) {
        (li.nextSibling as HTMLLIElement).querySelector('a')?.focus();
      }
      if (hotkey === 'up' && li && li.previousSibling) {
        (li.previousSibling as HTMLLIElement).querySelector('a')?.focus();
      }
    },
    {
      preventDefault: true,
    },
    [list],
  );

  return (
    <>
      <div className="ciphers-list">
        {!searchParams.has('q') ? (
          <div className="ciphers-list-details">
            <span className="count">{ciphers?.length}&nbsp;item(s)</span>
            <Dropdown className="sort" content={<Sort className="sort-icon" />}>
              <SortingMenu />
            </Dropdown>
          </div>
        ) : (
          <div className="ciphers-list-search-details">
            <span className="count">{ciphers?.length}&nbsp;item(s) found</span>
            <button className="clear-search" onClick={() => navigate(`/vault`)}>
              <CircleXmark className="clear-search-icon" />
            </button>
          </div>
        )}
        <ul className="ciphers" ref={list}>
          {ciphers?.map((cipher) => (
            <li key={cipher.id}>
              <NavLink
                to={{
                  pathname: `/vault/${cipher.id}`,
                  search: searchParams.toString(),
                }}
                className={activeCipher?.id === cipher.id ? 'active' : ''}
              >
                <span className="cipher">
                  <span className="cipher-icon">
                    <CiphersFavicon cipher={cipher} />
                  </span>
                  <span className="cipher-name">
                    <h3>{cipher.name}</h3>
                    <small>
                      {cipher.type == CipherType.Login && (cipher.data as any).username}
                      {cipher.type == CipherType.Card &&
                        (cipher.data as BaseDataViewModel & CardDataViewModel).preview}
                      {cipher.type == CipherType.Identity && (cipher.data as any).firstName}
                    </small>
                  </span>
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
