import { z } from 'zod';

const DatabaseSchema = z.object({
  DATABASE_URL: z.string().url(),
});

export const databaseConfig = DatabaseSchema.parse(process.env);
