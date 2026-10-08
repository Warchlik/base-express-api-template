import { STATUS_CODES } from 'node:http';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, codeFromStatus } from '../utils/app-error.ts';
import { formatIssues } from '../utils/validation.ts';

interface ErrorBody {
  error: { code: string; message: string; details?: unknown };
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.path} not found`));
};

function isHttpError(err: unknown): err is Error & { statusCode: number; expose: boolean } {
  return (
    err instanceof Error &&
    'statusCode' in err &&
    typeof err.statusCode === 'number' &&
    'expose' in err &&
    typeof err.expose === 'boolean'
  );
}

function toResponse(err: unknown): { statusCode: number; body: ErrorBody } {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      body: { error: { code: err.code, message: err.message, details: err.details } },
    };
  }

  if (err instanceof ZodError) {
    const details = formatIssues(err.issues);
    return {
      statusCode: 400,
      body: { error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details } },
    };
  }

  if (isHttpError(err) && err.statusCode >= 400 && err.statusCode < 500) {
    return {
      statusCode: err.statusCode,
      body: {
        error: {
          code: codeFromStatus(err.statusCode),
          message: err.expose ? err.message : (STATUS_CODES[err.statusCode] ?? 'Bad Request'),
        },
      },
    };
  }

  return {
    statusCode: 500,
    body: { error: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' } },
  };
}

export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const { statusCode, body } = toResponse(err);

  if (statusCode >= 500) {
    res.err = err instanceof Error ? err : new Error(String(err));
  }

  res.status(statusCode).json(body);
};
