import Loki, { LokiFsAdapter, LokiMemoryAdapter } from 'lokijs';

const dbs: {
  [key: string]: Loki;
} = {};

export async function getDatabase(name, inMemory = false): Promise<Loki> {
  if (dbs[name]) {
    return Promise.resolve(dbs[name]);
  }

  return new Promise((resolve, reject) => {
    const db = new Loki(name, {
      autosave: true,
      autoload: true,
      autoloadCallback: (err) => {
        err ? reject(err) : resolve(db);
      },
      env: 'NODEJS',
      adapter: inMemory ? new LokiMemoryAdapter() : new LokiFsAdapter(),
    });
    dbs[name] = db;
  });
}
