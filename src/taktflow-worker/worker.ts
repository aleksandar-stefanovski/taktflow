import { config } from 'dotenv';
config({ path: '.env.local' });

const { connectDatabase }     = await import('@persistence/database.js');
const { databaseConfig }      = await import('./config/database.config.js');
const { buildWorkerEngine }   = await import('./extensions/service-collection.extension.js');

async function bootstrap(): Promise<void> {
  const db     = await connectDatabase(databaseConfig);
  const engine = buildWorkerEngine(db);

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
