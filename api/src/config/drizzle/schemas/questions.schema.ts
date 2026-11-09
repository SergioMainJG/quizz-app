import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/arktype";
import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  quizId: uuid("quizId"),
  text: varchar("text").unique().notNull(),
  points: integer("points").notNull().default(10),
  order: integer("order").notNull(),
});

export const [questionsSelectSchema, questionsInsertSchema, questionsUpdateSchema] = [
  createSelectSchema(questions),
  createInsertSchema(questions),
  createUpdateSchema(questions),
];

export type QuestionsSelectSchema = typeof questionsSelectSchema.infer;
export type QuestionsInsertSchema = typeof questionsInsertSchema.infer;
export type QuestionsUpdateSchema = typeof questionsUpdateSchema.infer;
