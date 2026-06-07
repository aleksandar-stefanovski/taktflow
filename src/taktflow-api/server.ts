import { config } from 'dotenv';
config({ path: '.env.local' });

import { connectDatabase, runMigrations } from '@persistence/database.js';
import { databaseConfig } from './config/database.config.js';
import { serverConfig }   from './config/server.config.js';
import { buildApp } from './app.js';

async function bootstrap(): Promise<void> {
  const db  = await connectDatabase(databaseConfig.DATABASE_URL);
  await runMigrations(db);
  const app = await buildApp(db);

  await app.listen({ port: serverConfig.PORT, host: '0.0.0.0' });

  const shutdown = async (): Promise<void> => {
    await app.close();
    process.exit(0);
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT',  shutdown);
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
