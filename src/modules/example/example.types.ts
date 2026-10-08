import type { example } from "../../db/schema/example.ts";

export type Example = typeof example.$inferSelect;
export type NewExample = typeof example.$inferInsert;