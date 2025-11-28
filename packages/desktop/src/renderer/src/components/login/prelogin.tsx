import { useState, useCallback, useRef } from 'react';
import log from 'electron-log';

import useApplicationContext from '@renderer/hooks/useApplicationContext';
import useLoadingCallback from '@renderer/hooks/useLoadingCallback';
import { prelogin } from '@renderer/services/account';
import BitwardenServer from '@bitclient/common/types/BitwardenServer';
import Spin from '../common/icons/spin';
import ServerInfo from './server';
import { toErrorMessage } from '../common/utils';

const { RENDERER_VITE_DEFAULT_EMAIL } = import.meta.env;

export default function PreloginForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const [email, setEmail] = useState(RENDERER_VITE_DEFAULT_EMAIL || '');
  const [emailIsInvalid, setEmailIsInvalid] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { ctx, updateContext } = useApplicationContext();
  const [errorMessage, setErrorMessage] = useState('');
  const emailInput = useRef<HTMLInputElement>(null);

  const onPrelogin = useLoadingCallback(
    async function (): Promise<void> {
      try {
        setErrorMessage('');
        setIsLoading(true);
        await prelogin({ email, ctx });
        log.info('Prelogin success 🚀');
        onSuccess(email);
        setEmailIsInvalid(false);
      } catch (error) {
        log.error(error);
        setErrorMessage(toErrorMessage(error));
        setEmailIsInvalid(true);
        emailInput.current?.focus();
      } finally {
        setIsLoading(false);
      }
    },
    [email, ctx],
  );

  const resetServer = useCallback(() => {
    ctx.setServer(BitwardenServer.empty());
    updateContext(ctx);
  }, [ctx]);

  return (
    <>
      <form
        className="login-form"
        noValidate={true}
        onSubmit={(e) => {
          e.preventDefault();
          onPrelogin();
        }}
      >
        <div className="form-row">
          <input
            type="email"
            name="email"
            id="email"
            ref={emailInput}
            autoComplete="off"
            value={email}
            placeholder="Email address"
            autoFocus={true}
            inputMode="email"
            required={true}
            className={emailIsInvalid ? 'invalid' : ''}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage('');
            }}
          />
        </div>
        <div className="form-row toggle-control">
          <label htmlFor="rememberMe">Remember email</label>
          <input
            className="toggle"
            type="checkbox"
            name="rememberMe"
            id="rememberMe"
            autoComplete="off"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
        </div>
        <div className="form-row">
          {!isLoading && (
            <button type="submit" disabled={!email} className="btn">
              Continue
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
