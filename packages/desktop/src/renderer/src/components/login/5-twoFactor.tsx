import { TwoFactorAuthProvider } from '@bitclient/common/types/auth';
import useLoadingCallback from '@renderer/hooks/useLoadingCallback';
import { useCallback, useState, useRef, useEffect } from 'react';
import log from 'electron-log';
import Spin from '../common/icons/spin';
import WrongServer from './wrongServer';
import NotYou from './notYou';
import BitwardenServer from '@bitclient/common/types/BitwardenServer';
import useApplicationContext from '@renderer/hooks/useApplicationContext';
import { toErrorMessage } from '../common/utils';
import { login, sendEmailLogin } from '@renderer/services/account';

export default function TwoFactor({
  email,
  password,
  twoFactorType,
  goBack,
}: {
  email: string;
  password: string;
  twoFactorType: TwoFactorAuthProvider;
  goBack: () => void;
}) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpIsInvalid, setOtpIsInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const otpInput = useRef<HTMLInputElement>(null);

  const { ctx, updateContext } = useApplicationContext();
  const onTwoFactorVerification = useLoadingCallback(
    async function (): Promise<void> {
      try {
        setErrorMessage('');
        setIsLoading(true);
        let loginRequest: ReturnType<typeof login>;
        switch (twoFactorType) {
          case TwoFactorAuthProvider.TOTP:
          case TwoFactorAuthProvider.Email:
            log.info('Submitting 2FA of code:', otp);
            loginRequest = login({
              email,
              password,
              twoFactor: {
                token: otp,
                provider: twoFactorType,
                remember: false,
              },
              ctx,
            });
            break;
          case TwoFactorAuthProvider.Passkey:
          case TwoFactorAuthProvider.Yubikey:
          case TwoFactorAuthProvider.Duo:
          default:
            throw new Error('Unsupported two-factor authentication type');
        }

        const res = await loginRequest;

        if (res.unknownDevice || res.twoFactor) {
          log.info('2FA verification failed or device still unknown', res);
          throw new Error('Unknown device error on 2FA verification');
        }

        updateContext(ctx.setAccount(res.account));
      } catch (error) {
        log.error(error);
        setErrorMessage(toErrorMessage(error));
        setOtpIsInvalid(true);
        otpInput.current?.focus();
      } finally {
        setIsLoading(false);
      }
    },
    [email, ctx, otp, password, twoFactorType, updateContext],
  );

  const resetServer = useCallback(() => {
    ctx.setServer(BitwardenServer.empty());
    updateContext(ctx);
    goBack();
  }, [ctx, goBack]);

  useEffect(() => {
    log.info('Submitting 2FA of type:', twoFactorType);
    switch (twoFactorType) {
      case TwoFactorAuthProvider.Email:
        sendEmailLogin({
          ctx,
          email,
          password,
        });
        break;
      case TwoFactorAuthProvider.TOTP:
        // TOTP uses an authenticator app; nothing to do on mount
        break;
      case TwoFactorAuthProvider.Passkey:
        // TODO: Handle passkey authentication
        break;
      case TwoFactorAuthProvider.Yubikey:
        // TODO: Handle YubiKey authentication
        break;
      case TwoFactorAuthProvider.Duo:
        // TODO: Handle Duo authentication
        break;
      case TwoFactorAuthProvider.None:
      default:
        // No action required for unsupported/none providers on mount
        break;
    }
  }, [twoFactorType, ctx, email, password]);

  return (
    <>
      <form
        className="login-form"
        noValidate={true}
        onSubmit={(e) => {
          e.preventDefault();
          onTwoFactorVerification();
        }}
      >
        <div className="form-row">
          <NotYou email={email} goBack={goBack} />
        </div>
        <div className="form-row">{description(twoFactorType, { email })}</div>
        <div className="form-row">
          <input
            type="text"
            name="otp"
            id="otp"
            ref={otpInput}
            autoComplete="off"
            value={otp}
            placeholder="One-time code"
            autoFocus={true}
            required={true}
            className={otpIsInvalid ? 'invalid' : ''}
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>
        <div className="form-row">
          {!isLoading && (
            <button type="submit" disabled={!otp} className="btn">
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
      </form>
      <WrongServer reset={resetServer} />
    </>
  );
}

function description(provider: TwoFactorAuthProvider, {}: { email?: string }) {
  switch (provider) {
    case TwoFactorAuthProvider.TOTP:
      return 'Enter the code from your authenticator app.';
    case TwoFactorAuthProvider.Email:
      return 'We sent a code to your email';
    case TwoFactorAuthProvider.Passkey:
      return 'Use your passkey to sign in.';
    case TwoFactorAuthProvider.Yubikey:
      return 'Use your YubiKey to sign in.';
    case TwoFactorAuthProvider.Duo:
      return 'Use Duo to sign in.';
    case TwoFactorAuthProvider.None:
    default:
      return '';
  }
}
