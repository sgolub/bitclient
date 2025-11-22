import { BITWARDEN_OFFICIAL_SERVERS } from '@renderer/contexts/applicationContext';
import BitwardenServer from '@bitclient/common/types/BitwardenServer';
import Europe from '../common/icons/Europe';
import USA from '../common/icons/USA';

export default function ChooseServer({
  goToPrelogin,
}: {
  goToPrelogin: (newServer: BitwardenServer) => void;
}) {
  const onServerChange = (i: number) => {
    goToPrelogin(BITWARDEN_OFFICIAL_SERVERS[i]);
  };

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
                <small>{server.description}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
