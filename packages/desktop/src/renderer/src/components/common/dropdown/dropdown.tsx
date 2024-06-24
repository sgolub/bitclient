import { useEffect, useMemo, useRef, useState } from 'react';

import './dropdown.scss';
import { useHotkeys } from 'react-hotkeys-hook';

export default function Dropdown({
  content,
  children,
  className,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const [vissible, setVissible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useHotkeys('esc', () => setVissible(false), []);

  const close = useMemo(
    () => (e: Event) => {
      try {
        // e.preventDefault();
        // e.stopPropagation();
        if (!vissible) return;

        if (!e.target || e.target === window) {
          setVissible(false);
        }

        if (!buttonRef.current?.parentElement?.contains(e.target as Node)) {
          setVissible(false);
        }

        if (menuRef.current?.contains(e.target as Node)) {
          setVissible(false);
        }
      } catch {}
    },
    [buttonRef, vissible, menuRef],
  );

  function addEvent() {
    window.addEventListener('click', close);
    window.addEventListener('blur', close);
    window.addEventListener('resize', close);
  }

  function cleanEvent() {
    window.removeEventListener('click', close);
    window.removeEventListener('blur', close);
    window.removeEventListener('resize', close);
  }

  useEffect(() => {
    vissible ? addEvent() : cleanEvent();
    return () => cleanEvent();
  }, [vissible]);

  return (
    <>
      <div className="dropdown-button-container">
        <button className={className} ref={buttonRef} onClick={() => setVissible(!vissible)}>
          {content}
        </button>
        <div className={'dropdown-menu ' + (vissible ? '' : 'hidden')} ref={menuRef}>
          {children}
        </div>
      </div>
    </>
  );
}
