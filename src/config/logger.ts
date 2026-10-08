import pino from 'pino';
import { env } from './env.ts';

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: env.NODE_ENV === 'dev' ? { target: 'pino-pretty' } : undefined,
});
