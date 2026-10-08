import { env } from './config/env.ts';
import { logger } from './config/logger.ts';
import { pool } from './db/index.ts';
import { app } from './index.ts';

const SHUTDOWN_TIMEOUT_MS = 8_000;

const server = app.listen(env.PORT, (error?: Error) => {
  if (error) {
    logger.fatal({ err: error }, 'failed to start server');
    process.exit(1);
  }
  logger.info({ port: env.PORT, env: env.NODE_ENV }, 'server listening');
});

let shuttingDown = false;

async function shutdown(reason: string, exitCode: number): Promise<never> {
  if (shuttingDown) return new Promise<never>(() => {});
  shuttingDown = true;
  logger.info({ reason }, 'shutting down');

  setTimeout(() => {
    logger.error('graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);

  try {
    await new Promise<void>((resolve, reject) => {
      server.close((err?: Error) => (err ? reject(err) : resolve()));
    });

    await pool.end();
    logger.info('shutdown complete');
  } catch (err) {
    logger.error({ err }, 'error during shutdown');
    exitCode = 1;
  }
  process.exit(exitCode);
}

process.on('SIGTERM', () => void shutdown('SIGTERM', 0));
process.on('SIGINT', () => void shutdown('SIGINT', 0));

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaught exception');
  void shutdown('uncaughtException', 1);
});
process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'unhandled rejection');
  void shutdown('unhandledRejection', 1);
});
