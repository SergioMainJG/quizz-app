import { signUpSchema } from "../../auth/schema/sign-up.schema.js";
import { userResponseSchema } from "../../users/schema/user-response.schema.js";
import { toOpenApiSchema } from "../openapi/openapi.js";
import "./arktype.config.js";
import { describe, expect, it } from "vitest";

describe("schemas don't depend on when the global ArkType config is loaded", () => {
  it("still converts schemas with a narrow() to JSON Schema", () => {
    expect(() => toOpenApiSchema(signUpSchema, "input")).not.toThrow();
  });

  it("still strips undeclared keys", () => {
    expect(
      signUpSchema({ username: "janeDoe0003", email: "a@b.co", password: "correct horse battery staple", role: "ADMIN" }),
    ).not.toHaveProperty("role");
    expect(
      userResponseSchema.assert({
        id: "5f1c6a3e-8a9b-4c2d-9e7f-1a2b3c4d5e6f",
        username: "janeDoe0003",
        email: "a@b.co",
        role: "PLAYER",
        createdAt: new Date(0),
        password: "$scrypt$hash",
      }),
    ).not.toHaveProperty("password");
  });
});
