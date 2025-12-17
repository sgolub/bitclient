import { useMemo, useState } from 'react';
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';
import log from 'electron-log';

import ApplicationContext from '@bitclient/common/types/ApplicationContext';
import { ReactApplicationContext } from '@renderer/contexts/applicationContext';
import LoginPage from '@renderer/components/login/page';
import VaultPage from '@renderer/components/vault/page';
import { sync } from '@renderer/services/vault';
import LockPage from '@renderer/components/lock/page';

const LOADING_CLASS = 'loading';
const { body } = document;

export default function App() {
  const [ctx, updateContext] = useState(() => {
    const { platform, machineId } = window.api;
    return new ApplicationContext().setPlatform(platform).setDeviceIdentifier(machineId);
  });

  const router = useMemo(
    () =>
      createHashRouter([
        {
          path: '/',
          index: true,
          element: <Navigate to="/auth" replace />,
        },
        {
          path: '/auth/*',
          Component: LoginPage,
        },
        {
          Component: LockPage,
          path: '/lock',
        },
        {
          Component: VaultPage,
          path: '/vault/:cipherId?',
          shouldRevalidate: ({ currentUrl, nextUrl }) => {
            if (
              currentUrl.searchParams.get('type') === nextUrl.searchParams.get('type') &&
              currentUrl.searchParams.get('folderId') === nextUrl.searchParams.get('folderId') &&
              currentUrl.searchParams.get('collectionId') ===
                nextUrl.searchParams.get('collectionId') &&
              currentUrl.searchParams.get('q') === nextUrl.searchParams.get('q') &&
              currentUrl.searchParams.get('vaults') === nextUrl.searchParams.get('vaults') &&
              currentUrl.searchParams.get('sortBy') === nextUrl.searchParams.get('sortBy') &&
              currentUrl.searchParams.get('reverse') === nextUrl.searchParams.get('reverse')
            ) {
              return false;
            }

            return true;
          },
          loader: async ({ request }) => {
            try {
              log.info('Syncing vault ⚡');
              body.classList.add(LOADING_CLASS);
              const { searchParams } = new URL(request.url);
              const type = searchParams.get('type');
              const collectionId = searchParams.get('collectionId');
              const folderId = searchParams.get('folderId');
              const vaults = searchParams.get('vaults')?.split(',') || [];
              const query = searchParams.get('q') || '';
              const sortBy = searchParams.get('sortBy') || '';
              const reverse = searchParams.get('reverse') === 'true';
              return await sync({
                ctx,
                search: {
                  type,
                  collectionId,
                  folderId,
                  vaults,
                  query,
                  sortBy,
                  reverse,
                },
              });
            } catch (error) {
              log.error(error);
              return null;
            } finally {
              body.classList.remove(LOADING_CLASS);
            }
          },
        },
      ]),
    [ctx],
  );

  return (
    <ReactApplicationContext.Provider value={{ ctx, updateContext }}>
      <header className="title-bar"></header>
      <RouterProvider router={router} />
    </ReactApplicationContext.Provider>
  );
}
