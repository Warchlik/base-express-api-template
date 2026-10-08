import { STATUS_CODES } from 'node:http';

export function codeFromStatus(statusCode: number): string {
  const text = STATUS_CODES[statusCode] ?? 'Error';
  return text.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
}

interface AppErrorOptions {
  /** Machine-readable code for clients; defaults to one derived from the status. */
  code?: string;
  /** Extra data safe to show to the client (e.g. validation issues). */
  details?: unknown;
  /** Underlying error, kept for logs only, never sent to the client. */
  cause?: unknown;
}

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = options.code ?? codeFromStatus(statusCode);
    this.details = options.details;
  }
}
