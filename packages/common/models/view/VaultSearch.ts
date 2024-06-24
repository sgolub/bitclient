export type VaultSearchViewModel = {
  type: string | null;
  collectionId: string | null;
  folderId: string | null;
  vaults: string[];
  query: string;
  sortBy: string;
  reverse: boolean;
};
