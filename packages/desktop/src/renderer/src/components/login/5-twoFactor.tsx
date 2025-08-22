import { TwoFactorAuthProvider } from '@bitclient/common/types/auth';
import useLoadingCallback from '@renderer/hooks/useLoadingCallback';
import { useCallback, useState, useRef } from 'react';
import log from 'electron-log';
import Spin from '../common/icons/spin';
import WrongServer from './wrongServer';
import NotYou from './notYou';
import BitwardenServer from '@bitclient/common/types/BitwardenServer';
import useApplicationContext from '@renderer/hooks/useApplicationContext';

export default function TwoFactor({
  email,
  twoFactorType,
  goBack,
}: {
  email: string;
  // password: string;
  // server: BitwardenServer;
  twoFactorType: TwoFactorAuthProvider;
  goBack: () => void;
}) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpIsInvalid, setOtpIsInvalid] = useState(false);
  const otpInput = useRef<HTMLInputElement>(null);

  const { ctx, updateContext } = useApplicationContext();
  const onTwoFactorVerification = useLoadingCallback(
    async function (): Promise<void> {
      try {
        setIsLoading(true);
        throw new Error('Not implemented'); // TODO: implement 2FA verification
      } catch (error) {
        log.error(error);
        setOtpIsInvalid(true);
        otpInput.current?.focus();
      } finally {
        setIsLoading(false);
      }
    },
    [email, ctx],
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
