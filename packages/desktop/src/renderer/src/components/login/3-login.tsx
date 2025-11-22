import { useCallback, useRef, useState } from 'react';
import log from 'electron-log';

import useApplicationContext from '@renderer/hooks/useApplicationContext';
import useLoadingCallback from '@renderer/hooks/useLoadingCallback';
import { login } from '@renderer/services/account';
import Spin from '../common/icons/spin';
import WrongServer from './wrongServer';
import BitwardenServer from '@bitclient/common/types/BitwardenServer';
import { TwoFactorAuthProvider } from '@bitclient/common/types/auth';
import NotYou from './notYou';

const { RENDERER_VITE_DEFAULT_PASSWORD } = import.meta.env;

export default function Login({
  email,
  // server: _server,
  goToChooseTwoFactor,
  goBack,
}: {
  email: string;
  // server: BitwardenServer;
  goToChooseTwoFactor: (password: string, providers: TwoFactorAuthProvider[]) => void;
  goBack: () => void;
}) {
  const { ctx, updateContext } = useApplicationContext();
  const [password, setPassword] = useState(RENDERER_VITE_DEFAULT_PASSWORD || '');
  const [passwordIsInvalid, setPasswordIsInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const passwordInput = useRef<HTMLInputElement>(null);

  const onLogin = useLoadingCallback(
    async function (): Promise<void> {
      try {
        setIsLoading(true);
        const res = await login({ email, password, ctx });

        if (res.twoFactor) {
          log.info('2FA required', res.providers);
          goToChooseTwoFactor(password, res.providers as TwoFactorAuthProvider[]);
          return;
        }

        updateContext(ctx.setAccount(res.account));
        setPasswordIsInvalid(false);
        log.info('Login success 🚀');
      } catch (error) {
        log.error(error);
        setPasswordIsInvalid(true);
        passwordInput.current?.focus();
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, ctx],
  );

  const resetServer = useCallback(() => {
    ctx.setServer(BitwardenServer.empty());
    updateContext(ctx);
    goBack();
  }, [ctx, goBack]);

  return (
    <>
      <form
        className="login-form"
        noValidate={true}
        onSubmit={(e) => {
          e.preventDefault();
          onLogin();
        }}
      >
        <div className="form-row">
          <NotYou email={email} goBack={goBack} />
        </div>
        <div className="form-row">
          <input
            type="password"
            name="password"
            id="password"
            ref={passwordInput}
            autoComplete="off"
            value={password}
            placeholder="Master password"
            autoFocus={true}
            required={true}
            className={passwordIsInvalid ? 'invalid' : ''}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-row">
          {!isLoading && (
            <button type="submit" disabled={!password} className="btn">
              Log in with master password
            </button>
          )}
          {isLoading && (
            <button type="button" disabled={true} className="btn loading">
              <Spin className="loading-spinner" />
              Loading...
            </button>
          )}
        </div>
        <WrongServer reset={resetServer} />
      </form>
    </>
  );
}
