import { CardType } from '@bitclient/common/types/vault';
import Copy from '@renderer/components/common/icons/copy';
import Eye from '@renderer/components/common/icons/eye';
import EyeSlash from '@renderer/components/common/icons/eyeSlash';
import useApplicationContext from '@renderer/hooks/useApplicationContext';
import { copySecret, getSecret } from '@renderer/services/vault';
import { useCallback, useEffect, useState } from 'react';

export function CardNumberField({
  name,
  value,
  preview,
  cipherId,
  copyOnClick = false,
}: {
  name: string;
  value: string;
  preview: string;
  type: CardType;
  cipherId: string;
  copyOnClick?: boolean;
}) {
  const { ctx } = useApplicationContext();
  const [number, setNumber] = useState('');

  useEffect(() => {
    setNumber('');
  }, [value]);

  const showHideNumber = useCallback(async () => {
    if (number) {
      setNumber('');
      return;
    }
    const decrypted = await getSecret({ ctx, cipherId, secret: value });
    setNumber(decrypted);
  }, [ctx, cipherId, value, number]);

  const copyNumber = useCallback(async () => {
    await copySecret({ ctx, cipherId, secret: value });
  }, [ctx, cipherId, value]);

  return (
    <>
      <article className="field password-field" onClick={copyOnClick ? copyNumber : undefined}>
        <label>{name}</label>
        {!number ? (
          <p className="monospace-slab lucida">{value ? preview : <>&nbsp;</>}</p>
        ) : (
          <p className="monospace-slab lucida">{number}</p>
        )}
        {value && (
          <div className="tools">
            <button
              className="button"
              onClick={(e) => {
                e.stopPropagation();
                showHideNumber();
              }}
            >
              {number ? <EyeSlash className="icon" /> : <Eye className="icon" />}
            </button>
            <button className="button" onClick={copyNumber}>
              <Copy className="icon" />
            </button>
          </div>
        )}
      </article>
    </>
  );
}
