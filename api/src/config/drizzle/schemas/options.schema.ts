import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/arktype";
import { boolean, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const options = pgTable("options", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  questionId: uuid("questionId"),
  text: varchar("text").unique().notNull(),
  isCorrect: boolean("isCorrect").default(false),
});

export const [optionsSelectSchema, optionsInsertSchema, optionsUpdateSchema] = [
  createSelectSchema(options),
  createInsertSchema(options),
  createUpdateSchema(options),
];

export type OptionsSelectSchema = typeof optionsSelectSchema.infer;
export type OptionsInsertSchema = typeof optionsInsertSchema.infer;
export type OptionsUpdateSchema = typeof optionsUpdateSchema.infer;
