import type { Request, RequestHandler } from 'express';
import type { output, ZodType } from 'zod';
import { AppError } from '../utils/app-error.ts';
import { formatIssues, type ValidationDetail } from '../utils/validation.ts';

const SOURCES = ['params', 'query', 'body'] as const;
type Source = (typeof SOURCES)[number];

type Schemas<P extends ZodType, Q extends ZodType, B extends ZodType> = {
  params?: P;
  query?: Q;
  body?: B;
};

/**
 * The returned handler is typed with the *parsed* output of the given schemas, so a controller
 * declared as `Request<ExampleIdParams, Res, Body, Query>` composes with it without casts.
 * A source without a schema keeps express's default type for it.
 * (`any` as response body: validate never sends one, and it must not narrow the controller's.)
 */
export function validate<
  P extends ZodType = ZodType<Request['params']>,
  Q extends ZodType = ZodType<Request['query']>,
  B extends ZodType = ZodType<Request['body']>,
>(schemas: Schemas<P, Q, B>): RequestHandler<output<P>, any, output<B>, output<Q>> {
  return (req, _res, next) => {
    const parsed: Partial<Record<Source, unknown>> = {};
    const details: ValidationDetail[] = [];

    for (const source of SOURCES) {
      const schema = schemas[source];
      if (!schema) continue;

      const result = schema.safeParse(req[source]);
      if (result.success) {
        parsed[source] = result.data;
      } else {
        details.push(...formatIssues(result.error.issues, source));
      }
    }

    if (details.length > 0) {
      next(new AppError(400, 'Validation failed', { code: 'VALIDATION_ERROR', details }));
      return;
    }

    for (const source of SOURCES) {
      if (!(source in parsed)) continue;
      Object.defineProperty(req, source, {
        value: parsed[source],
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }

    next();
  };
}
