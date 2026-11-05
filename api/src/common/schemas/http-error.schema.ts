import { BadRequestException, HttpStatus, type StandardSchemaValidationPipeOptions } from "@nestjs/common";
import { type } from "arktype";

export const apiErrorSchema = type({
  statusCode: type("number.integer").configure({ examples: [409] }),
  error: type("string").configure({ examples: ["Conflict"] }),
  message: type("string").configure({ examples: ["Email already registered"] }),
}).configure({ title: "ApiError", description: "an error response" });

export const fieldErrorSchema = type({
  field: type("string")
    .describe("the dot path of the invalid field, empty when the whole body is invalid")
    .configure({ examples: ["email"] }),
  message: type("string")
    .describe("what is wrong with the value")
    .configure({ examples: ['must be an email address (was "jane")'] }),
}).configure({ title: "FieldError" });

export const validationErrorSchema = type({
  statusCode: "400",
  error: "'Bad Request'",
  message: "'Validation failed'",
  errors: fieldErrorSchema.array().atLeastLength(1),
}).configure({
  title: "ValidationError",
  description: "a body or parameters that did not pass validation, with one entry per invalid field",
});

export type ValidationErrorBody = typeof validationErrorSchema.infer;

export const validationExceptionFactory: NonNullable<StandardSchemaValidationPipeOptions["exceptionFactory"]> = (
  issues,
) =>
  new BadRequestException({
    statusCode: HttpStatus.BAD_REQUEST,
    error: "Bad Request",
    message: "Validation failed",
    errors: issues.map((issue) => ({
      field: (issue.path ?? []).map((segment) => String(typeof segment === "object" ? segment.key : segment)).join("."),
      message: "problem" in issue ? String(issue.problem) : issue.message,
    })),
  } satisfies ValidationErrorBody);
