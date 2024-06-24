import { useEffect, useState } from 'react';

import Copy from '@renderer/components/common/icons/copy';
import Open from '@renderer/components/common/icons/open';

export function UriField({
  name,
  values,
  showIfEmpty = false,
}: {
  name: string;
  values: string[];
  showIfEmpty?: boolean;
  copyOnClick?: boolean;
}) {
  const [uris, setUris] = useState<({ protocol: string; host: string; rest: string } | string)[]>(
    [],
  );
  const [navUri, setNavUri] = useState<string | null>(null);

  useEffect(() => {
    const newUris: ({ protocol: string; host: string; rest: string } | string)[] = [];
    values.forEach((value) => {
      try {
        const url = new URL(value);
        const protocol = url.protocol + '//';
        const host = url.host;
        const rest = value.replace(url.protocol + '//' + url.host, '');
        newUris.push({ protocol, host, rest });
      } catch (e) {
        newUris.push(value);
      }
    });
    if (newUris.length > 0) {
      if (typeof newUris[0] === 'string') {
        setNavUri(newUris[0]);
      } else {
        setNavUri(newUris[0].protocol + newUris[0].host + newUris[0].rest);
      }
    }
    setUris(newUris);
  }, [values]);

  return (
    <>
      {((values && values.length > 0) || showIfEmpty) && (
        <article className="field uri-field">
          <label>{name}</label>
          {uris.map((uri, index) => (
            <p key={index} className="uri">
              {typeof uri === 'string' ? (
                uri ? (
                  <a href={uri} target="_blank">
                    {uri}
                  </a>
                ) : (
                  <>&nbsp;</>
                )
              ) : (
                <a href={uri.protocol + uri.host + uri.rest} target="_blank">
                  {uri.protocol}
                  <span className="host">{uri.host}</span>
                  {uri.rest}
                </a>
              )}
            </p>
          ))}
          <div className="tools">
            {navUri && (
              <a href={navUri} target="_blank" className="button">
                <Open className="icon" />
              </a>
            )}
            <button className="button">
              <Copy
                className="icon"
                onClick={() => navUri && window.api.clipboard.writeText(navUri)}
              />
            </button>
          </div>
        </article>
      )}
    </>
  );
}
