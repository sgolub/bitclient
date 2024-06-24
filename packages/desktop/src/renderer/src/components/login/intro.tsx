import { useCallback } from 'react';

import { BITWARDEN_OFFICIAL_SERVERS } from '@renderer/contexts/applicationContext';
import useApplicationContext from '@renderer/hooks/useApplicationContext';
import Europe from '../common/icons/Europe';
import USA from '../common/icons/USA';

export default function Intro() {
  const { ctx, updateContext } = useApplicationContext();

  const onServerChange = useCallback(
    (i: number) => {
      ctx.setServer(BITWARDEN_OFFICIAL_SERVERS[i]);
      updateContext(ctx);
    },
    [ctx],
  );

  return (
    <>
      <h1 className="title">
        <strong>bit</strong>client
      </h1>
      <ul className="server-list">
        {BITWARDEN_OFFICIAL_SERVERS.map((server, i) => (
          <li key={i} value={i}>
            <button onClick={() => onServerChange(i)}>
              {server.url.endsWith('com') ? <USA className="icon" /> : <Europe className="icon" />}
              <span className="btn-content">
                <label>{server.displayName}</label>
                <small>{server.desciption}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
