import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

import * as schema from './schema/index.js';

export type DrizzleDb = ReturnType<typeof drizzle>;

export async function connectDatabase(config: {
  url:                string;
  poolMax:            number;
  idleTimeoutMs:      number;
  connectionTimeoutMs: number;
}): Promise<DrizzleDb> {
  const pool = new Pool({
    connectionString:        config.url,
    max:                     config.poolMax,
    idleTimeoutMillis:       config.idleTimeoutMs,
    connectionTimeoutMillis: config.connectionTimeoutMs,
  });

  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }

  return drizzle(pool, { schema });
}

export async function disconnect(db: DrizzleDb): Promise<void> {
  const pool = (db as unknown as { $client: Pool }).$client;
  await pool.end();
}

export async function runMigrations(db: DrizzleDb): Promise<void> {
  const currentFile = fileURLToPath(import.meta.url);
  const packageDir  = currentFile.includes('/dist/') || currentFile.includes('\\dist\\')
    ? resolve(dirname(currentFile), '..')
    : dirname(currentFile);

  await migrate(db, { migrationsFolder: resolve(packageDir, 'migrations') });
}
