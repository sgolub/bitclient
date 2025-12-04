import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@desktop': resolve('src'),
      },
    },
    plugins: [
      externalizeDepsPlugin({
        exclude: ['@bitclient/common'],
      }),
    ],
  },
  preload: {
    resolve: {
      alias: {
        '@desktop': resolve('src'),
      },
    },
    plugins: [
      externalizeDepsPlugin({
        exclude: ['@bitclient/common'],
      }),
    ],
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@desktop': resolve('src'),
      },
    },
    plugins: [react()],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },
});
