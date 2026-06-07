import { config } from 'dotenv';
config({ path: '.env.local' });

import { connectDatabase } from '@persistence/database.js';

import { env } from './config/env.js';
import { buildWorkerEngine } from './extensions/service-collection.extension.js';

async function bootstrap(): Promise<void> {
  const db     = await connectDatabase(env.DATABASE_URL);
  const engine = buildWorkerEngine(db, env);

  engine.start();

  const shutdown = async (): Promise<void> => {
    await engine.stop();
    process.exit(0);
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT',  shutdown);
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start worker', error);
  process.exit(1);
});
