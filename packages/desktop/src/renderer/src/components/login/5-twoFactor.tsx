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
  const [isUnsupported, setIsUnsupported] = useState(false);
  const otpInput = useRef<HTMLInputElement>(null);

  const { ctx, updateContext } = useApplicationContext();
  const isSupportedTwoFactorType = useCallback((type: TwoFactorAuthProvider): boolean => {
    return type === TwoFactorAuthProvider.TOTP || type === TwoFactorAuthProvider.Email;
  }, []);

  const onTwoFactorVerification = useLoadingCallback(
    async function (): Promise<void> {
      try {
        setErrorMessage('');
        setIsLoading(true);

        if (!isSupportedTwoFactorType(twoFactorType)) {
          throw new Error(
            'This two-factor authentication method is not yet supported. Please try another authentication method.',
          );
        }

        log.info('Submitting 2FA of code:', otp);
        const loginRequest = login({
          email,
          password,
          twoFactor: {
            token: otp,
            provider: twoFactorType as string,
            remember: false,
          },
          ctx,
        });

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
    [email, ctx, otp, password, twoFactorType, updateContext, isSupportedTwoFactorType],
  );

  const resetServer = useCallback(() => {
    ctx.setServer(BitwardenServer.empty());
    updateContext(ctx);
    goBack();
  }, [ctx, goBack]);

  useEffect(() => {
    log.info('Setting up 2FA of type:', twoFactorType);

    // Check if the 2FA type is supported
    if (!isSupportedTwoFactorType(twoFactorType)) {
      const unsupportedMessage =
        'This two-factor authentication method is not yet supported. Please try another authentication method.';
      log.warn('Unsupported 2FA type:', twoFactorType);
      setErrorMessage(unsupportedMessage);
      setIsUnsupported(true);
      return;
    }

    // Reset unsupported state if switching to a supported type
    setIsUnsupported(false);
    setErrorMessage('');

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
  }, [twoFactorType, ctx, email, password, isSupportedTwoFactorType]);

  return (
    <>
      {isUnsupported ? (
        <>
          <div className="form-row">
            <p className="error-message">{errorMessage}</p>
          </div>
          <div className="form-row">
            <button type="button" className="btn" onClick={goBack}>
              Try another method
            </button>
          </div>
        </>
      ) : (
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
      )}
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
