import { NavLink, useSearchParams } from 'react-router-dom';
import Check from '../../common/icons/check';
import { useState, useEffect } from 'react';

import './sorting.scss';

export default function SortingMenu() {
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'name');
  const [reverse, setReverse] = useState(searchParams.get('reverse') === 'true');

  useEffect(() => {
    setSortBy(searchParams.get('sortBy') || 'name');
    setReverse(searchParams.get('reverse') === 'true');
  }, [searchParams]);

  function getSearchParams(sortBy: string, reverse: boolean): string {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('sortBy');
    newSearchParams.delete('reverse');
    if (sortBy && sortBy !== 'name') {
      newSearchParams.set('sortBy', sortBy);
    }
    if (reverse) {
      newSearchParams.set('reverse', 'true');
    }
    return newSearchParams.toString();
  }
  return (
    <article>
      <ul className="sorting-dropdown">
        <li className="sorting-value">
          <NavLink
            className={() => ''}
            to={{
              pathname: `/vault`,
              search: getSearchParams('name', reverse),
            }}
          >
            <label>Name</label>
            {sortBy === 'name' && <Check className="icon-check" />}
          </NavLink>
        </li>
        <li className="sorting-value">
          <NavLink
            className={() => ''}
            to={{
              pathname: `/vault`,
              search: getSearchParams('createdDate', reverse),
            }}
          >
            <label>Date created</label>
            {sortBy === 'createdDate' && <Check className="icon-check" />}
          </NavLink>
        </li>
        <li className="sorting-value">
          <NavLink
            className={() => ''}
            to={{
              pathname: `/vault`,
              search: getSearchParams('updatedDate', reverse),
            }}
          >
            <label>Date updated</label>
            {sortBy === 'updatedDate' && <Check className="icon-check" />}
          </NavLink>
        </li>
      </ul>
      <hr />
      <ul className="sorting-dropdown">
        <li className="sorting-value">
          <NavLink
            className={() => ''}
            to={{
              pathname: `/vault`,
              search: getSearchParams(sortBy, false),
            }}
          >
            <label>{sortBy === 'name' ? 'Alphabetical' : 'Newest First'}</label>
            {!reverse && <Check className="icon-check" />}
          </NavLink>
        </li>
        <li className="sorting-value">
          <NavLink
            className={() => ''}
            to={{
              pathname: `/vault`,
              search: getSearchParams(sortBy, true),
            }}
          >
            <label>{sortBy === 'name' ? 'Reverse Alphabetical' : 'Oldest First'}</label>
            {reverse && <Check className="icon-check" />}
          </NavLink>
        </li>
      </ul>
    </article>
  );
}
