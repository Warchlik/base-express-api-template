import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes.ts';
import userRouter from '../modules/users/user.route.ts';

const router = Router();

router.use(authRouter);
router.use('/users', userRouter);

export default router;
