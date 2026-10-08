import { z } from 'zod';

const nameSchema = z.string().trim().min(1).max(255);

export const exampleSchema = z.object({
  id: z.uuid(),
  userId: z.string(),
  name: nameSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const newExampleSchema = z.object({
  name: nameSchema,
});

export const updateExampleSchema = z
  .object({
    name: nameSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export const exampleIdParamsSchema = z.object({
  id: z.uuid(),
});

export const listExampleQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ExampleResponse = z.infer<typeof exampleSchema>;
export type NewExampleInput = z.infer<typeof newExampleSchema>;
export type UpdateExampleInput = z.infer<typeof updateExampleSchema>;
export type ExampleIdParams = z.infer<typeof exampleIdParamsSchema>;
export type ListExampleQuery = z.infer<typeof listExampleQuerySchema>;
