import { BadRequestException, StandardSchemaValidationPipe } from "@nestjs/common";
import { type } from "arktype";
import { describe, expect, it } from "vitest";
import { validationErrorSchema, validationExceptionFactory } from "./http-error.schema.js";

const bodySchema = type({ email: "string.email", age: "number >= 18" });

const validate = async (value: unknown) => {
  const pipe = new StandardSchemaValidationPipe({ exceptionFactory: validationExceptionFactory });
  try {
    await pipe.transform(value, { type: "body", schema: bodySchema } as never);
  } catch (error) {
    return error;
  }
  throw new Error("expected the pipe to reject the value");
};

describe("validationExceptionFactory", () => {
  it("returns a 400 with one entry per invalid field", async () => {
    const error = await validate({ email: "jane", age: 3 });

    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as BadRequestException).getResponse()).toEqual({
      statusCode: 400,
      error: "Bad Request",
      message: "Validation failed",
      errors: [
        { field: "age", message: "must be at least 18 (was 3)" },
        { field: "email", message: 'must be an email address (was "jane")' },
      ],
    });
  });

  it("produces a body that matches the documented schema", async () => {
    const error = (await validate({})) as BadRequestException;

    expect(validationErrorSchema(error.getResponse())).not.toBeInstanceOf(type.errors);
  });
});
