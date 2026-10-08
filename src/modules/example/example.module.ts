import { and, desc, eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { db } from '../../db/index.ts';
import { example } from '../../db/schema/example.ts';
import type { AuthSession } from '../../lib/auth.ts';
import { AppError } from '../../utils/app-error.ts';
import type {
    ExampleIdParams,
    ListExampleQuery,
    NewExampleInput,
    UpdateExampleInput,
} from './example.schema.ts';
import type { Example, NewExample } from './example.types.ts';

const ownedBy = (
    userId: string, 
    id: string
) => and(eq(example.id, id), eq(example.userId, userId));

const ExampleRepository = {
    findAll: async (
        limit?: number,
        offset?: number
    ): Promise<Example[]> => {
        let query = db.select().from(example).orderBy(desc(example.createdAt)).$dynamic();

        if (limit !== undefined) query = query.limit(limit);
        if (offset !== undefined) query = query.offset(offset);

        return await query;
    },

    insert: async (
        values: NewExample
    ): Promise<Example> => {
        const [row] = await db.insert(example).values(values).returning();
        return row;
    },

    findOneById: async (
        userId: string,
        id: string
    ): Promise<Example | undefined> => {
        const [row] = await db.select().from(example).where(ownedBy(userId, id)).limit(1);
        return row;
    },

    updateOneById: async (
        userId: string,
        id: string,
        values: UpdateExampleInput,
    ): Promise<Example | undefined> => {
        const [row] = await db.update(example).set(values).where(ownedBy(userId, id)).returning();
        return row;
    },

    deleteOneById: async (
        userId: string,
        id: string
    ): Promise<Example | undefined> => {
        const [row] = await db.delete(example).where(ownedBy(userId, id)).returning();
        return row;
    },
};

const ExampleService = {
    all: async ( 
        limit?: number, 
        offset?: number
    ): Promise<Example[]> =>
        ExampleRepository.findAll(limit, offset),

    create: async (
        userId: string, 
        input: NewExampleInput
    ): Promise<Example> =>
        ExampleRepository.insert({ ...input, userId }),

    findById: async (
        userId: string,
        id: string
    ): Promise<Example> => {
        const row = await ExampleRepository.findOneById(userId, id);
        if (!row) throw new AppError(404, 'Example not found');
        return row;
    },

    updateById: async (
        userId: string,
        id: string,
        input: UpdateExampleInput
    ): Promise<Example> => {
        const row = await ExampleRepository.updateOneById(userId, id, input);
        if (!row) throw new AppError(404, 'Example not found');
        return row;
    },

    deleteById: async (
        userId: string,
        id: string
    ): Promise<void> => {
        const row = await ExampleRepository.deleteOneById(userId, id);
        if (!row) throw new AppError(404, 'Example not found');
    },
};

const ExampleController = {
    list: async (
        req: Request<unknown, Example[], unknown, ListExampleQuery>,
        res: Response<Example[]>,
    ) => {
        const { limit, offset } = req.query;
        res.json(await ExampleService.all(limit, offset));
    },

    store: async (
        req: Request<unknown, Example, NewExampleInput>,
        res: Response<Example>
    ) => {
        const { user } = res.locals as AuthSession;
        res.status(201).json(await ExampleService.create(user.id, req.body));
    },

    one: async (
        req: Request<ExampleIdParams, Example>,
        res: Response<Example>
    ) => {
        const { user } = res.locals as AuthSession;
        res.json(await ExampleService.findById(user.id, req.params.id));
    },

    update: async (
        req: Request<ExampleIdParams, Example, UpdateExampleInput>,
        res: Response<Example>,
    ) => {
        const { user } = res.locals as AuthSession;
        res.json(await ExampleService.updateById(user.id, req.params.id, req.body));
    },

    destroy: async (
        req: Request<ExampleIdParams>,
        res: Response
    ) => {
        const { user } = res.locals as AuthSession;
        await ExampleService.deleteById(user.id, req.params.id);
        res.status(204).end();
    },
};

export { ExampleController, ExampleRepository, ExampleService };
