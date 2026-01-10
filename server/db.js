import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = process.env.DB_PATH || path.resolve('server', 'data.sqlite');
const schemaPath = path.resolve('server', 'schema.sql');

export const db = new Database(dbPath);

export const initDb = () => {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
};

export const nowIso = () => new Date().toISOString();

export const makeId = (prefix) => {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2)}`;
};
