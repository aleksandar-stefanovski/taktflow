import { config } from 'dotenv';
config({ path: '.env.local' });

const { connectDatabase, disconnect } = await import('@taktflow/persistence/database.js');
const { databaseConfig }  = await import('./config/database.config.js');
const { workerConfig }    = await import('./config/worker.config.js');
const { buildWorker }     = await import('./extensions/service-collection.extension.js');

async function bootstrap(): Promise<void> {
  const db     = await connectDatabase(databaseConfig);
  const worker = buildWorker(db);

  worker.start();

  let shuttingDown = false;
  const shutdown = async (exitCode: number): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;

    const forceExit = setTimeout(() => process.exit(1), workerConfig.WORKER_SHUTDOWN_MAX_WAIT_MS);
    forceExit.unref();

    let code = exitCode;
    try {
      await worker.stop();
      await disconnect(db);
    } catch (error) {
      console.error('Error during shutdown', error);
      code = 1;
    } finally {
      clearTimeout(forceExit);
      process.exit(code);
    }
  };

  process.once('SIGTERM', () => void shutdown(0));
  process.once('SIGINT',  () => void shutdown(0));
  process.on('uncaughtException', (error: unknown) => {
    console.error('Uncaught exception', error);
    void shutdown(1);
  });
  process.on('unhandledRejection', (reason: unknown) => {
    console.error('Unhandled rejection', reason);
    void shutdown(1);
  });
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start worker', error);
  process.exit(1);
});
