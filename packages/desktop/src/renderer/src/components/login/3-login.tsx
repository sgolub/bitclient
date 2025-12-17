import { useCallback, useRef, useState } from 'react';
import log from 'electron-log';

import useApplicationContext from '@renderer/hooks/useApplicationContext';
import useLoadingCallback from '@renderer/hooks/useLoadingCallback';
import { login, sendEmailLogin } from '@renderer/services/account';
import Spin from '../common/icons/spin';
import WrongServer from './wrongServer';
import BitwardenServer from '@bitclient/common/types/BitwardenServer';
import { TwoFactorAuthProvider } from '@bitclient/common/types/auth';
import NotYou from './notYou';
import { toErrorMessage } from '../common/utils';

const { RENDERER_VITE_DEFAULT_PASSWORD } = import.meta.env;

export default function Login({
  email,
  goToChooseTwoFactor,
  goBack,
}: {
  email: string;
  goToChooseTwoFactor: (password: string, providers: TwoFactorAuthProvider[]) => void;
  goBack: () => void;
}) {
  const { ctx, updateContext } = useApplicationContext();
  const [password, setPassword] = useState(RENDERER_VITE_DEFAULT_PASSWORD || '');
  const [newDeviceOtp, setNewDeviceOtp] = useState('');
  const [deviceIsUnknown, setDeviceIsUnknown] = useState(false);
  const [deviceOtpIsInvalid, setDeviceOtpIsInvalid] = useState(false);
  const [passwordIsInvalid, setPasswordIsInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const passwordInput = useRef<HTMLInputElement>(null);

  const onLogin = useLoadingCallback(
    async function (): Promise<void> {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const res = newDeviceOtp
          ? await login({ email, password, newDeviceOtp, ctx })
          : await login({ email, password, ctx });

        if (res.twoFactor) {
          log.info('2FA required', res.providers);
          goToChooseTwoFactor(password, res.providers as TwoFactorAuthProvider[]);
          return;
        }

        if (res.unknownDevice) {
          sendEmailLogin({
            ctx,
            email,
            password,
          });
          setDeviceIsUnknown(true);
          setNewDeviceOtp('');
          if (newDeviceOtp) {
            setDeviceOtpIsInvalid(true);
          }
          log.info('Unknown device error');
          return;
        }

        updateContext(ctx.setAccount(res.account));
        setPasswordIsInvalid(false);
        setDeviceOtpIsInvalid(false);

        log.info('Login success 🚀');
      } catch (error) {
        log.info(error);
        setErrorMessage(toErrorMessage(error));
        newDeviceOtp ? setDeviceOtpIsInvalid(true) : setPasswordIsInvalid(true);
        setDeviceIsUnknown(false);
        setNewDeviceOtp('');
        passwordInput.current?.focus();
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, newDeviceOtp, ctx],
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
        {!deviceIsUnknown ? (
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
        ) : (
          <>
            <div className="form-row">
              <label>Enter the code sent to your email to verify your identity.</label>
            </div>
            <div className="form-row">
              <input
                type="text"
                name="otp"
                id="otp"
                autoComplete="off"
                value={newDeviceOtp}
                placeholder="One-time code"
                autoFocus={true}
                required={true}
                className={deviceOtpIsInvalid ? 'invalid' : ''}
                onChange={(e) => {
                  setErrorMessage('');
                  setNewDeviceOtp(e.target.value);
                }}
              />
            </div>
          </>
        )}
        <div className="form-row">
          {!isLoading && (
            <button type="submit" disabled={!password} className="btn">
              {!deviceIsUnknown ? 'Log in with master password' : 'Continue logging in'}
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
        <WrongServer reset={resetServer} />
      </form>
    </>
  );
}
