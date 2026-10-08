import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { errorHandler } from '../src/middlewares/error-handle.ts';
import { validate } from '../src/middlewares/validate.ts';

function createApp() {
  const app = express();
  app.use(express.json());
  app.post(
    '/items/:id',
    validate({
      params: z.object({ id: z.coerce.number().int() }),
      query: z.object({ page: z.coerce.number().int().default(1) }),
      body: z.object({ name: z.string().min(1) }),
    }),
    (req, res) => {
      res.json({ params: req.params, query: req.query, body: req.body });
    },
  );
  app.use(errorHandler);
  return app;
}

describe('validate', () => {
  it('hands the parsed values (coerced, defaulted, stripped) to the handler', async () => {
    const res = await request(createApp())
      .post('/items/42?page=3')
      .send({ name: 'a', extra: 'dropped' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ params: { id: 42 }, query: { page: 3 }, body: { name: 'a' } });
  });

  it('applies defaults for missing query values', async () => {
    const res = await request(createApp()).post('/items/1').send({ name: 'a' });

    expect(res.body.query).toEqual({ page: 1 });
  });

  it('reports failures from every source at once, prefixed with the source', async () => {
    const res = await request(createApp()).post('/items/abc?page=x').send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    const paths = res.body.error.details.map((d: { path: string }) => d.path);
    expect(paths).toEqual(['params.id', 'query.page', 'body.name']);
  });
});
