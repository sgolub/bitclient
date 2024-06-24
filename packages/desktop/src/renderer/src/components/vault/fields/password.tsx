import Copy from '@renderer/components/common/icons/copy';
import Eye from '@renderer/components/common/icons/eye';
import EyeSlash from '@renderer/components/common/icons/eyeSlash';
import Password from '@renderer/components/common/password/password';
import useApplicationContext from '@renderer/hooks/useApplicationContext';
import { copySecret, getSecret } from '@renderer/services/vault';
import { useCallback, useEffect, useState } from 'react';

export function PasswordField({
  name,
  value,
  cipherId,
  highlight = true,
  length,
  showIfEmpty = false,
  copyOnClick = false,
}: {
  name: string;
  value: string;
  cipherId: string;
  highlight?: boolean;
  length?: number;
  showIfEmpty?: boolean;
  copyOnClick?: boolean;
}) {
  const { ctx } = useApplicationContext();
  const [password, setPassword] = useState('');

  useEffect(() => {
    setPassword('');
  }, [value]);

  const showHidePassword = useCallback(async () => {
    if (password) {
      setPassword('');
      return;
    }
    const decrypted = await getSecret({ ctx, cipherId, secret: value });
    setPassword(decrypted);
  }, [ctx, cipherId, value, password]);

  const copyPassword = useCallback(async () => {
    await copySecret({ ctx, cipherId, secret: value });
  }, [ctx, cipherId, value]);

  return (
    <>
      {(value || showIfEmpty) && (
        <article className="field password-field" onClick={copyOnClick ? copyPassword : undefined}>
          <label>{name || <>&nbsp;</>}</label>
          {!password ? (
            <p className="monospace-slab">{value ? '•'.repeat(length || 12) : <>&nbsp;</>}</p>
          ) : (
            <p className="monospace-slab">
              {highlight ? <Password password={password} /> : password}
            </p>
          )}
          {value && (
            <div className="tools">
              <button
                className="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showHidePassword();
                }}
              >
                {password ? <EyeSlash className="icon" /> : <Eye className="icon" />}
              </button>
              <button className="button" onClick={copyPassword}>
                <Copy className="icon" />
              </button>
            </div>
          )}
        </article>
      )}
    </>
  );
}
