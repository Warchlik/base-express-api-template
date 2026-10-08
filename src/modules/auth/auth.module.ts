import type { Request, Response } from 'express';
import type { AuthSession } from '../../lib/auth.ts';

export const MeController = {
  // Runs behind `requireAuth`, which guarantees both values in `res.locals`.
  // The session token is deliberately not returned: it must stay in the HttpOnly cookie.
  me: (_req: Request, res: Response) => {
    const { user, session } = res.locals as AuthSession;

    res.json({ user, session: { expiresAt: session.expiresAt } });
  },
};
