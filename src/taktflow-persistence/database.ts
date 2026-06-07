import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

import * as schema from './schema/index.js';

export type DrizzleDb = ReturnType<typeof drizzle>;

export async function connectDatabase(url: string): Promise<DrizzleDb> {
  const pool = new Pool({
    connectionString: url,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }

  return drizzle(pool, { schema });
}

export async function runMigrations(db: DrizzleDb): Promise<void> {
  const currentFile = fileURLToPath(import.meta.url);
  const packageDir  = currentFile.includes('/dist/') || currentFile.includes('\\dist\\')
    ? resolve(dirname(currentFile), '..')
    : dirname(currentFile);

  await migrate(db, { migrationsFolder: resolve(packageDir, 'migrations') });
}
