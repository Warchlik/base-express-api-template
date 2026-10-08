import { Router } from 'express';
import { requireAuth } from '../../middlewares/require-auth.ts';
import { validate } from '../../middlewares/validate.ts';
import { ExampleController } from './example.module.ts';
import {
    exampleIdParamsSchema,
    listExampleQuerySchema,
    newExampleSchema,
    updateExampleSchema,
} from './example.schema.ts';

const exampleRouter = Router();
exampleRouter.use(requireAuth);

exampleRouter.get(
    '/',
    validate({ query: listExampleQuerySchema }),
    ExampleController.list
);

exampleRouter.post(
    '/',
    validate({ body: newExampleSchema }),
    ExampleController.store
);
exampleRouter.get(
    '/:id',
    validate({ params: exampleIdParamsSchema }),
    ExampleController.one
);

exampleRouter.patch(
  '/:id',
  validate({ params: exampleIdParamsSchema, body: updateExampleSchema }),
  ExampleController.update,
);

exampleRouter.delete(
  '/:id',
  validate({ params: exampleIdParamsSchema }),
  ExampleController.destroy,
);

export default exampleRouter;
