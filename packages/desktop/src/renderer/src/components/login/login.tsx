import { useCallback, useRef, useState } from 'react';
import log from 'electron-log';

import useApplicationContext from '@renderer/hooks/useApplicationContext';
import useLoadingCallback from '@renderer/hooks/useLoadingCallback';
import { login } from '@renderer/services/account';
import Spin from '../common/icons/spin';
import ServerInfo from './server';
import BitwardenServer from '@bitclient/common/types/BitwardenServer';
import { toErrorMessage } from '../common/utils';

const { RENDERER_VITE_DEFAULT_PASSWORD } = import.meta.env;

export default function LoginForm({ email, goBack }: { email: string; goBack: () => void }) {
  const { ctx, updateContext } = useApplicationContext();
  const [password, setPassword] = useState(RENDERER_VITE_DEFAULT_PASSWORD || '');
  const [passwordIsInvalid, setPasswordIsInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const passwordInput = useRef<HTMLInputElement>(null);

  const onLogin = useLoadingCallback(
    async function (): Promise<void> {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const account = await login({ email, password, ctx });
        updateContext(ctx.setAccount(account));
        setPasswordIsInvalid(false);

        log.info('Login success 🚀');
      } catch (error) {
        log.info(error);
        setErrorMessage(toErrorMessage(error));
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
          <label>
            Logging in as&nbsp;<strong>{email}</strong>
          </label>
          <br />
          <button type="button" className="btn link" onClick={goBack}>
            Not you?
          </button>
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
            onChange={(e) => {
              setErrorMessage('');
              setPassword(e.target.value);
            }}
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
        {errorMessage && (
          <div className="form-row">
            <p className="error-message">{errorMessage}</p>
          </div>
        )}
        <ServerInfo reset={resetServer} />
      </form>
    </>
  );
}
