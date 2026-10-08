import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// Reads DATABASE_URL directly instead of src/config/env.ts: the migrate container
// only gets DATABASE_URL, while env.ts also requires the auth variables.
const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dbCredentials: { url },
});
