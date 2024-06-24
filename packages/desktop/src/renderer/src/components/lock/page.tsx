import { useEffect, useRef, useState } from 'react';
import log from 'electron-log';
import { useNavigate } from 'react-router-dom';

import Spin from '../common/icons/spin';
import Vault from '../common/icons/vault';
import useApplicationContext from '@renderer/hooks/useApplicationContext';
import useLoadingCallback from '@renderer/hooks/useLoadingCallback';
import { unlock } from '@renderer/services/auth';

import './login.scss';

export default function LockPage() {
  const navigate = useNavigate();
  const { ctx, updateContext } = useApplicationContext();
  const [isLoading, setIsLoading] = useState(false);
  const [email] = useState(ctx.account?.email);
  const [password, setPassword] = useState('');
  const [passwordIsInvalid, setPasswordIsInvalid] = useState(false);
  const passwordInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.api.on('logout', (_event) => {
      ctx.reset();
      updateContext(ctx);
      navigate('/');
    });
    return () => {
      window.api.removeAllListeners('logout');
    };
  }, [ctx]);

  const onUnlock = useLoadingCallback(
    async function (): Promise<void> {
      try {
        setIsLoading(true);
        await unlock({ ctx, password });
        setPasswordIsInvalid(false);
        navigate('/vault');
        log.info('Unlock success 🚀');
      } catch (error) {
        log.error(error);
        setPasswordIsInvalid(true);
        passwordInput.current?.focus();
      } finally {
        setIsLoading(false);
      }
    },
    [password, ctx],
  );

  return (
    <>
      <section className="form-container">
        <Vault className="logo" />
        <h1 className="title">Your vault is locked</h1>
        <form
          className="login-form"
          noValidate={true}
          onSubmit={(e) => {
            e.preventDefault();
            onUnlock();
          }}
        >
          <div className="form-row text-center">
            <label>{email}</label>
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
                Unlock with master password
              </button>
            )}
            {isLoading && (
              <button type="button" disabled={true} className="btn loading">
                <Spin className="loading-spinner" />
                Loading...
              </button>
            )}
          </div>
          <div className="form-row text-center">
            <button
              type="button"
              className="btn link"
              onClick={() => window.api.logout(ctx.account!.email)}
            >
              Log out
            </button>
          </div>
        </form>
      </section>
      <footer className="footer text-center">Accessing {ctx.server.displayName}</footer>
    </>
  );
}
