import log from 'electron-log/renderer';
import React from 'react';
import ReactDOM from 'react-dom/client';

import '@renderer/assets/main.css';
import App from '@renderer/App';

log.transports.console.level = 'info';

window.api.isPackaged.then((isPackaged) => {
  window.isPackaged = isPackaged;
  window.isDev = !isPackaged;
  if (isPackaged) {
    window.addEventListener('blur', () => document.body.classList.add('blur'));
    window.addEventListener('focus', () => document.body.classList.remove('blur'));
  }

  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </>,
  );
});
