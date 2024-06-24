import Copy from '@renderer/components/common/icons/copy';
import { useCallback } from 'react';

export function TextField({
  name,
  value,
  className,
  showIfEmpty = false,
  hideCopyButton = false,
  copyOnClick = false,
}: {
  name: string;
  value: string;
  className?: string;
  showIfEmpty?: boolean;
  hideCopyButton?: boolean;
  copyOnClick?: boolean;
}) {
  const onCopy = useCallback(() => window.api.clipboard.writeText(value), [value]);
  return (
    <>
      {(value || showIfEmpty) && (
        <article className="field text-field" onClick={copyOnClick ? onCopy : undefined}>
          <label>{name || <>&nbsp;</>}</label>
          <p className={className}>{value || <>&nbsp;</>}</p>
          {value && !hideCopyButton && (
            <div className="tools">
              <button className="button">
                <Copy className="icon" onClick={onCopy} />
              </button>
            </div>
          )}
        </article>
      )}
    </>
  );
}
