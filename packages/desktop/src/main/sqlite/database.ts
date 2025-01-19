import BetterSqlite3, { Database } from 'better-sqlite3';

const dbs: {
  [key: string]: Database;
} = {};

export function getDatabase(name, inMemory = false): Database {
  if (!dbs[name]) {
    dbs[name] = new BetterSqlite3(inMemory ? ':memory:' : `data/${name}.db`);
  }

  return dbs[name];
}
