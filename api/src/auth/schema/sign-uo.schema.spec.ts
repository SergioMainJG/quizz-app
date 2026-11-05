import { ArkErrors } from "arktype";
import { describe, expect, it } from "vitest";
import { signInSchema, signUpSchema } from "./sign-up.schema.js";

const validSignUp = {
  username: "jose",
  email: "jose@example.com",
  password: "correct horse battery staple",
};

const validSignIn = {
  email: "jose@example.com",
  password: "correct horse battery staple",
};

describe("signUpSchema", () => {
  it("accepts a username, an email and a password", () => {
    expect(signUpSchema(validSignUp)).toEqual(validSignUp);
  });

  it.each(["username", "email", "password"] as const)("rejects a body without %s", (field) => {
    const { [field]: _, ...body } = validSignUp;

    expect(signUpSchema(body)).toBeInstanceOf(ArkErrors);
  });

  it.each(["username", "email", "password"] as const)("rejects a non-string %s", (field) => {
    expect(signUpSchema({ ...validSignUp, [field]: 123 })).toBeInstanceOf(ArkErrors);
  });
});

describe("signInSchema", () => {
  it("accepts an email and a password", () => {
    expect(signInSchema(validSignIn)).toEqual(validSignIn);
  });

  it.each(["email", "password"] as const)("rejects a body without %s", (field) => {
    const { [field]: _, ...body } = validSignIn;

    expect(signInSchema(body)).toBeInstanceOf(ArkErrors);
  });
});
