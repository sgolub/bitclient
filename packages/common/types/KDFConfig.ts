export type KDFConfig =
  | { kdf: 0; kdfIterations: number; kdfMemory: null; kdfParallelism: null }
  | { kdf: 1; kdfIterations: number; kdfMemory: number; kdfParallelism: number };
