/* eslint-disable @typescript-eslint/no-explicit-any */
import { DependencyList, useCallback } from 'react';
import log from 'electron-log/renderer';

const LOADING_CLASS = 'loading';
const { body } = document;

export default function useLoadingCallback<T extends (...args: any[]) => Promise<void>>(
  callback: T,
  deps: DependencyList,
): T {
  return useCallback(async (...args: any[]) => {
    if (body.classList.contains(LOADING_CLASS)) {
      log.info('Action abort');
      return;
    }
    body.classList.add(LOADING_CLASS);
    await callback(...args);
    body.classList.remove(LOADING_CLASS);
  }, deps) as T;
}
