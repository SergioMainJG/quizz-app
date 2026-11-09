import { usersSelectSchema as row } from "../../config/drizzle/schemas/users.schema.js";

const id = row
  .get("id")
  .configure({ readOnly: true, examples: ["5f1c6a3e-8a9b-4c2d-9e7f-1a2b3c4d5e6f"] });
const username = row.get("username").configure({ examples: ["janeDoe0003"] });
const email = row.get("email").configure({ format: "email", examples: ["jane-doe@outlook.com"] });
const role = row.get("role").describe("what the account is allowed to do");
const createdAt = row.get("createdAt").configure({ readOnly: true });

export const userResponseSchema = row
  .omit("password")
  .merge({ id, username, email, role, createdAt })
  .onUndeclaredKey("delete")
  .configure({ title: "User", description: "a user account" });

export type UserResponse = typeof userResponseSchema.infer;
