import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.ts';
import { logger } from './config/logger.ts';
import { errorHandler, notFoundHandler } from './middlewares/error-handle.ts';
import routes from './routes/index.ts';

export const app = express();

// Behind a reverse proxy (nginx/caddy): trust exactly one hop so req.ip
// and the rate limiter see the real client, not the proxy.
app.set('trust proxy', 1);

app.use(
  pinoHttp({
    logger,
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    autoLogging: { ignore: (req: Request) => req.url === '/health' },
  }),
);
app.use(helmet());

// Health check stays before the rate limiter so probes are never throttled.
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  }),
);

// better-auth handler (app.all('/api/auth/*splat', toNodeHandler(auth)))
app.use(express.json({ limit: '100kb' }));

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);
