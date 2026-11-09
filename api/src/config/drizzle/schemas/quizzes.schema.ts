import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/arktype";
import { boolean, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const quizDifficulties = pgEnum("QuizDifficulties", ["EASY", "MEDIUM", "HARD"]);
export const quizzes = pgTable("quizzes", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  title: varchar("title").unique().notNull(),
  description: text("description").unique().notNull(),
  category: varchar("category").notNull(),
  difficulty: quizDifficulties("difficulty").default("EASY"),
  isPublished: boolean("isPublished").default(false),
  authorId: uuid("authorId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const [quizSelectSchema, quizInsertSchema, quizUpdateSchema] = [
  createSelectSchema(quizzes),
  createInsertSchema(quizzes),
  createUpdateSchema(quizzes),
];

export type QuizSelectSchema = typeof quizSelectSchema.infer;
export type QuizInsertSchema = typeof quizInsertSchema.infer;
export type QuizUpdateSchema = typeof quizUpdateSchema.infer;
