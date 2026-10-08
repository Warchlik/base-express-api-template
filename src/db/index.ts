import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../config/env.ts';
import { logger } from '../config/logger.ts';

export const pool = new Pool({ connectionString: env.DATABASE_URL });

pool.on('error', (err) => logger.error({ err }, 'idle pg client error'));

export const db = drizzle({ client: pool });
