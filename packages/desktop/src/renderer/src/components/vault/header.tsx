import { useHotkeys } from 'react-hotkeys-hook';
import ArrowRight from '../common/icons/arrowRight';
// import Plus from '../common/icons/plus';
import Search from '../common/icons/search';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import './header.scss';

export default function HeaderSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const input = useRef<HTMLInputElement>(null);
  useHotkeys(
    'ctrl+f,meta+f',
    () => {
      input.current?.focus();
      if (input.current?.value) {
        input.current?.select();
      }
    },
    [input],
  );
  const [searchText, setSearchText] = useState(searchParams.get('q') || '');

  useEffect(() => {
    if (!searchParams.has('q') && searchText) {
      setSearchText('');
    }
  }, [searchParams]);

  const search = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    if (searchText) {
      params.set('q', searchText);
      params.delete('type');
      params.delete('folderId');
      params.delete('collectionId');
    } else {
      params.delete('q');
    }
    navigate({
      pathname: '/vault',
      search: params.toString(),
    });
    input.current?.blur();
  }, [searchText, searchParams, navigate, input]);

  return (
    <div className="header-container">
      <div className="search-container">
        <Search className="search-icon" />
        <input
          ref={input}
          className="search-input"
          type="search"
          placeholder="Search in vaults (Ctrl + F)"
          autoComplete="off"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            e.key === 'Enter' && search();
          }}
        />
        <button className="search-button" onClick={search}>
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}
