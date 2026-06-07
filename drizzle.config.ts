import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/taktflow-persistence/schema/index.ts',
  out: './src/taktflow-persistence/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env['DATABASE_URL']! },
});
