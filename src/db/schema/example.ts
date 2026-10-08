import { relations, sql } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth.ts';

export const example = pgTable('example', {
    id: uuid('id').primaryKey().default(sql`uuidv7()`),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (table) => [index('example_user_id_idx').on(table.userId)],
);

export const exampleRelations = relations(example, ({ one }) => ({
  user: one(user, {
    fields: [example.userId],
    references: [user.id],
  }),
}));
