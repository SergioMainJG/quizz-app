import { ArkErrors } from "arktype";
import { describe, expect, it } from "vitest";
import { toOpenApiSchema } from "../../config/openapi/openapi.js";
import { signInResultSchema, signInSchema, signUpSchema } from "./sign-up.schema.js";

const strongPassword = "correct horse battery staple";

const validSignUp = {
  username: "janeDoe0003",
  email: "jane-doe@outlook.com",
  password: strongPassword,
};

const validSignIn = {
  email: "jane-doe@outlook.com",
  password: strongPassword,
};

const problemsOf = (result: unknown) => {
  expect(result).toBeInstanceOf(ArkErrors);
  return (result as ArkErrors).flatProblemsByPath;
};

describe("signUpSchema", () => {
  it("accepts a username, an email and a strong password", () => {
    expect(signUpSchema(validSignUp)).toEqual(validSignUp);
  });

  it("drops keys it doesn't declare, such as a role sent by the client", () => {
    expect(signUpSchema({ ...validSignUp, role: "ADMIN" })).toEqual(validSignUp);
  });

  it.each(["username", "email", "password"] as const)("rejects a body without %s", (field) => {
    const { [field]: _, ...body } = validSignUp;

    expect(problemsOf(signUpSchema(body))).toHaveProperty(field);
  });

  it.each(["username", "email", "password"] as const)("rejects a non-string %s", (field) => {
    expect(problemsOf(signUpSchema({ ...validSignUp, [field]: 123 }))).toHaveProperty(field);
  });

  it.each([
    ["shorter than 5 characters", "jane"],
    ["longer than 50 characters", "j".repeat(51)],
  ])("rejects a username %s", (_, username) => {
    expect(problemsOf(signUpSchema({ ...validSignUp, username }))).toHaveProperty("username");
  });

  it("rejects an invalid email", () => {
    expect(problemsOf(signUpSchema({ ...validSignUp, email: "jane" }))).toHaveProperty("email");
  });

  it("rejects a password shorter than 12 characters", () => {
    expect(problemsOf(signUpSchema({ ...validSignUp, password: "Sh0rt!" }))).toHaveProperty("password");
  });

  it("rejects a password that is easy to guess, without echoing it", () => {
    const weakPassword = "password1234";

    const problems = problemsOf(signUpSchema({ ...validSignUp, password: weakPassword }));

    expect(problems.password?.[0]).toMatch(/^must be a stronger password/);
    expect(JSON.stringify(problems)).not.toContain(weakPassword);
  });

  it("documents the password as a write-only field", () => {
    const { properties } = toOpenApiSchema(signUpSchema, "input") as { properties: Record<string, object> };

    expect(properties.password).toMatchObject({ format: "password", writeOnly: true, minLength: 12, maxLength: 128 });
  });
});

describe("signInSchema", () => {
  it("accepts an email and a password", () => {
    expect(signInSchema(validSignIn)).toEqual(validSignIn);
  });

  it.each(["email", "password"] as const)("rejects a body without %s", (field) => {
    const { [field]: _, ...body } = validSignIn;

    expect(problemsOf(signInSchema(body))).toHaveProperty(field);
  });

  it("does not apply the sign-up password rules, so older passwords still work", () => {
    const body = { ...validSignIn, password: "short" };

    expect(signInSchema(body)).toEqual(body);
  });
});

describe("signInResultSchema", () => {
  it("documents mfaRequired", () => {
    const { properties } = toOpenApiSchema(signInResultSchema, "output") as { properties: Record<string, object> };

    expect(properties.mfaRequired).toMatchObject({ type: "boolean" });
  });
});
