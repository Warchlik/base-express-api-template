import { Router } from 'express';
import { requireAuth } from '../../middlewares/require-auth.ts';
import { MeController } from './auth.module.ts';

const authRouter = Router();

authRouter.get('/me', requireAuth, MeController.me);

export default authRouter;
