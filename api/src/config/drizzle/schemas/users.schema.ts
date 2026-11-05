import { pgTable } from "drizzle-orm/pg-core/table";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/arktype";
import { uuid, varchar, check, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRoles = pgEnum('UserRoles', ['PLAYER', 'ADMIN']);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    username: varchar('username').unique().notNull(),
    email: varchar('email').unique().notNull(),
    password: varchar('password').notNull(),
    role: userRoles('role').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) =>[
    check('email_check', sql`${table.email}~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'`)
  ]
);

export const [
  usersSelectSchema,
  usersInsertSchema,
  usersUpdateSchema,
] = [
  createSelectSchema(users),
  createInsertSchema(users),
  createUpdateSchema(users)
];

export type UsersSelectSchema = typeof usersSelectSchema.infer;
export type UsersInsertSchema = typeof usersInsertSchema.infer;
export type UsersUpdateSchema = typeof usersUpdateSchema.infer;
