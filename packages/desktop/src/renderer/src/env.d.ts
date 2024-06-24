/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly RENDERER_DEFAULT_EMAIL: string;
  readonly RENDERER_DEFAULT_PASSWORD: string;
  readonly RENDERER_DEFAULT_SERVER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
