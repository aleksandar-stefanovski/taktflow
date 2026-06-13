import { config } from 'dotenv';
config({ path: '.env' });

const { connectDatabase, runMigrations } = await import('@persistence/database.js');
const { databaseConfig } = await import('./config/database.config.js');
const { serverConfig }   = await import('./config/server.config.js');
const { buildApp }       = await import('./app.js');

async function bootstrap(): Promise<void> {
  const db  = await connectDatabase(databaseConfig);
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
