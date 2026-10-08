import { fromNodeHeaders } from 'better-auth/node';
import type { RequestHandler } from 'express';
import { auth } from '../lib/auth.ts';
import { AppError } from '../utils/app-error.ts';

// Reads neither params, query nor body, so it must not narrow them for the rest of the route chain.
export const requireAuth: RequestHandler<any, any, any, any> = async (req, res, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    next(new AppError(401, 'Unauthorized'));
    return;
  }

  res.locals.session = session.session;
  res.locals.user = session.user;
  next();
};
