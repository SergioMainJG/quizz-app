import { UsersSelectSchema } from "../../config/drizzle/schemas/users.schema.js";

export type User = Omit<UsersSelectSchema, "password">;
