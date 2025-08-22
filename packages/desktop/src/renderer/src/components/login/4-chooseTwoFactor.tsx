import { TwoFactorAuthProvider } from '@bitclient/common/types/auth';
import useLoadingCallback from '@renderer/hooks/useLoadingCallback';
import WrongServer from './wrongServer';
import { useCallback } from 'react';
import BitwardenServer from '@bitclient/common/types/BitwardenServer';
import useApplicationContext from '@renderer/hooks/useApplicationContext';
import Mobile from '../common/icons/mobile';
import Key from '../common/icons/key';
import NotYou from './notYou';
import Envelope from '../common/icons/envelope';
// import ServerInfo from './server';

export default function ChooseTwoFactor({
  email,
  twoFactorProviders,
  goToTwoFactor,
  goBack,
}: {
  email: string;
  twoFactorProviders: TwoFactorAuthProvider[];
  goToTwoFactor: (newTwoFactorAuthProvider: TwoFactorAuthProvider) => void;
  goBack: () => void;
}) {
  const { ctx, updateContext } = useApplicationContext();

  const handleTwoFactorClick = useLoadingCallback(
    async (provider: TwoFactorAuthProvider) => {
      goToTwoFactor(provider);
    },
    [goToTwoFactor],
  );

  const resetServer = useCallback(() => {
    ctx.setServer(BitwardenServer.empty());
    updateContext(ctx);
    goBack();
  }, [ctx, goBack]);

  return (
    <>
      <h1 className="title">
        <strong>bit</strong>client
      </h1>
      <span className="mt-1">
        <NotYou email={email} goBack={goBack} />
      </span>
      <ul className="two-factor-list">
        {twoFactorProviders.map((provider, i) => (
          <li key={i} value={i}>
            <button onClick={() => handleTwoFactorClick(provider)}>
              {icon(provider)}
              <span className="btn-content">
                <label>{name(provider)}</label>
                <small>{description(provider, { email })}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <WrongServer reset={resetServer} />
    </>
  );
}

function icon(provider: TwoFactorAuthProvider) {
  switch (provider) {
    case TwoFactorAuthProvider.TOTP:
      return <Mobile className="icon" />;
    case TwoFactorAuthProvider.Email:
      return <Envelope className="icon" />;
    case TwoFactorAuthProvider.Passkey:
      return <Key className="icon" />;
    case TwoFactorAuthProvider.Yubikey:
      return <Key className="icon" />;
    case TwoFactorAuthProvider.Duo:
      return <Mobile className="icon" />;
    case TwoFactorAuthProvider.None:
    default:
      return <Key className="icon" />;
  }
}

function name(provider: TwoFactorAuthProvider) {
  switch (provider) {
    case TwoFactorAuthProvider.TOTP:
      return 'Verification code (TOTP)';
    case TwoFactorAuthProvider.Email:
      return 'Sent code to email';
    case TwoFactorAuthProvider.Passkey:
      return 'Passkey';
    case TwoFactorAuthProvider.Yubikey:
      return 'YubiKey';
    case TwoFactorAuthProvider.Duo:
      return 'Duo';
    case TwoFactorAuthProvider.None:
    default:
      return 'None';
  }
}

function description(provider: TwoFactorAuthProvider, { email }: { email?: string }) {
  switch (provider) {
    case TwoFactorAuthProvider.TOTP:
      return 'Authenticator application';
    case TwoFactorAuthProvider.Email:
      return `${email}`;
    case TwoFactorAuthProvider.Passkey:
      return 'Passkey';
    case TwoFactorAuthProvider.Yubikey:
      return 'YubiKey';
    case TwoFactorAuthProvider.Duo:
      return 'Duo application';
    case TwoFactorAuthProvider.None:
    default:
      return 'None';
  }
}
