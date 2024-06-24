import { Secret, TOTP, HOTP, URI as OTPAuthURI } from 'otpauth';
import { useCallback, useEffect, useState } from 'react';
import log from 'electron-log';
import Copy from '@renderer/components/common/icons/copy';

const DEFAULT_COUNTDOWN_INTERVAL = 30; // seconds

export function TotpField({
  name,
  value,
  copyOnClick = false,
}: {
  name: string;
  value: string;
  copyOnClick?: boolean;
}) {
  const [totp, setTotp] = useState<HOTP | TOTP | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [countdownPercent, setCountdownPercent] = useState(0);
  const [countdownInterval, setCountdownInterval] = useState(DEFAULT_COUNTDOWN_INTERVAL);

  useEffect(() => {
    if (!value) {
      setTotp(null);
      return;
    }
    try {
      const t = value.startsWith('otpauth://')
        ? OTPAuthURI.parse(value)
        : new TOTP({ secret: Secret.fromBase32(value) });
      setTotp(t);
      setCountdownInterval((t as TOTP).period || DEFAULT_COUNTDOWN_INTERVAL);
    } catch (e) {
      setTotp(null);
      log.error(e);
    }
  }, [value]);

  useEffect(() => {
    if (!value || !totp) return;
    function generateToken() {
      setToken(totp!.generate());
      setNextToken(totp!.generate({ timestamp: Date.now() + countdownInterval * 1000 }));
      const newCountdown = Math.ceil(countdownInterval - ((Date.now() / 1000) % countdownInterval));
      setCountdown(newCountdown);
      setCountdownPercent(100 - (newCountdown * 100) / countdownInterval);
    }
    generateToken();
    const interval = setInterval(() => generateToken(), 1000);
    return () => clearInterval(interval);
  }, [totp]);

  function getColor(value: number) {
    return value >= 50 ? 'green' : value >= 25 ? 'yellow' : 'red';
  }

  function formatToken(value: string | null): string | undefined {
    if (!value) return '';
    const tokenLength = value.length;
    if (!tokenLength) return value;
    const delimiterLength = tokenLength % 3 === 0 ? 3 : tokenLength % 4 ? 4 : 0;
    if (!delimiterLength) return value;
    return (
      value.slice(0, -1).replace(new RegExp(`(.{${delimiterLength}})`, 'g'), '$1·') +
      value.slice(-1)
    );
  }

  const onCopy = useCallback(() => window.api.clipboard.writeText(token || ''), [token]);

  return (
    <>
      {totp && (
        <article className="field totp-field" onClick={copyOnClick ? onCopy : undefined}>
          <div>
            <label>{name}</label>
            <p>
              <span className="monospace-slab strong lucida">
                {formatToken(token) || <>&nbsp;</>}
              </span>
              {countdownPercent >= 75 && (
                <span className="totp-next monospace lucida">
                  &nbsp;←&nbsp;{formatToken(nextToken)}
                </span>
              )}
            </p>
          </div>
          <div
            className="totp-countdown"
            style={{
              background: `linear-gradient(var(--color-white), var(--color-white)) content-box no-repeat, conic-gradient(var(--color-grey-04) ${countdownPercent}%, 0, var(--color-${getColor(100 - countdownPercent)})) border-box`,
            }}
          >
            <div className="totp-countdown-value monospace strong lucida">{countdown}</div>
          </div>
          <div className="tools">
            <button className="button">
              <Copy className="icon" onClick={onCopy} />
            </button>
          </div>
        </article>
      )}
    </>
  );
}
