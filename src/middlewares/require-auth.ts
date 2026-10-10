import { fromNodeHeaders } from 'better-auth/node';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { auth } from '../lib/auth.ts';
import { AppError } from '../utils/app-error.ts';

export const requireAuth: RequestHandler<any, any, any, any> = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
