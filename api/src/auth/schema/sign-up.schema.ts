import { usersInsertSchema, usersSelectSchema } from "../../config/drizzle/schemas/users.schema.js";

export const signUpSchema = usersInsertSchema
  .omit('createdAt','id', 'role')
  .describe(`The values for user's sign-up`);
export const signInSchema = usersSelectSchema.pick('email', 'password');

export type SignUpSchemaDto = typeof signUpSchema.infer;
export type SignInSchemaDto = typeof signInSchema.infer;
