import { describe, expect, it } from "vitest";
import { toOpenApiSchema } from "../../config/openapi/openapi.js";
import { userResponseSchema } from "./user-response.schema.js";

const user = {
  id: "5f1c6a3e-8a9b-4c2d-9e7f-1a2b3c4d5e6f",
  username: "janeDoe0003",
  email: "jane-doe@outlook.com",
  role: "PLAYER" as const,
  createdAt: new Date("2026-11-05T00:00:00.000Z"),
};

describe("userResponseSchema", () => {
  it("removes the password hash from a full row", () => {
    expect(userResponseSchema.assert({ ...user, password: "$scrypt$hash" })).toEqual(user);
  });

  it("throws when a row is missing a field, so a broken response never goes out", () => {
    const { email: _, ...withoutEmail } = user;

    expect(() => userResponseSchema.assert(withoutEmail)).toThrow();
  });

  it("documents ids and timestamps as read-only and dates as date-time strings", () => {
    const { properties } = toOpenApiSchema(userResponseSchema, "output") as { properties: Record<string, object> };

    expect(properties).not.toHaveProperty("password");
    expect(properties.id).toMatchObject({ readOnly: true });
    expect(properties.createdAt).toMatchObject({ type: "string", format: "date-time", readOnly: true });
  });
});
