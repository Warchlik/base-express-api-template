import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes.ts';
import exampleRouter from '../modules/example/example.routes.ts';
import userRouter from '../modules/users/user.route.ts';

const router = Router();

router.use(authRouter);
router.use('/examples', exampleRouter);
router.use('/users', userRouter);

export default router;
