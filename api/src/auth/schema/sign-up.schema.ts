import { type } from "arktype";
import { usersInsertSchema, usersSelectSchema } from "../../config/drizzle/schemas/users.schema.js";
import { zxcvbnInstance } from "../../lib/password-strength.js";

export const MIN_PASSWORD_SCORE = 3;


const username = type("5 <= string <= 50")
  .describe("a username of 5 to 50 characters")
  .configure({ title: "Username", examples: ["janeDoe0003", "xXesternoXx"] });

const email = type("string.email").configure({
  title: "Email",
  examples: ["john.doe@gmail.com", "jane-doe@outlook.com"],
});

const newPassword = type("12 <= string <= 128")
  .narrow((password, ctx) => {
    const { score, feedback } = zxcvbnInstance.check(password);
    if (score >= MIN_PASSWORD_SCORE) return true;
    return ctx.reject({ expected: `a stronger password (${feedback.warning || "too easy to guess"})`, actual: "" });
  })
  .describe("a password of 12 to 128 characters that is hard to guess")
  .configure({ title: "Password", format: "password", writeOnly: true });

export const signUpSchema = usersInsertSchema
  .omit("createdAt", "id", "role")
  .merge({ username, email, password: newPassword })
  .onUndeclaredKey("delete")
  .configure({ title: "SignUpRequest", description: "the details of a new account" });

const signInEmail = usersSelectSchema
  .get("email")
  .configure({ title: "Email", format: "email", examples: ["jane-doe@outlook.com"] });
const signInPassword = usersSelectSchema
  .get("password")
  .configure({ title: "Password", format: "password", writeOnly: true });

export const signInSchema = usersSelectSchema
  .pick("email", "password")
  .merge({ email: signInEmail, password: signInPassword })
  .onUndeclaredKey("delete")
  .configure({ title: "SignInRequest", description: "the credentials of an existing account" });

export const signInResultSchema = type({
  mfaRequired: type("boolean").describe(
    "whether the session still has to pass a second factor before it can be used",
  ),
}).configure({ title: "SignInResult" });

export type SignUpSchemaDto = typeof signUpSchema.infer;
export type SignInSchemaDto = typeof signInSchema.infer;
export type SignInResult = typeof signInResultSchema.infer;
