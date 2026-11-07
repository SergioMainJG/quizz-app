import {
  BadRequestException,
  HttpStatus,
  type StandardSchemaValidationPipeOptions,
} from "@nestjs/common";
import { type } from "arktype";

const errorEnvelope = type({
  statusCode: type("number.integer").configure({ examples: [409] }),
  error: type("string").configure({ examples: ["Conflict"] }),
  message: type("string").configure({ examples: ["Email already registered"] }),
  correlationId: type("string | number")
    .describe("the id of the request in the server logs")
    .configure({ examples: [18] }),
  path: type("string").configure({ examples: ["/api/auth/sign-up"] }),
  timestamp: type("string").configure({
    format: "date-time",
    examples: ["2026-11-05T09:13:19.876Z"],
  }),
});

export const apiErrorSchema = errorEnvelope.configure({
  title: "ApiError",
  description: "an error response",
});

export const fieldErrorSchema = type({
  field: type("string")
    .describe("the dot path of the invalid field, empty when the whole body is invalid")
    .configure({ examples: ["email"] }),
  message: type("string")
    .describe("what is wrong with the value")
    .configure({ examples: ['must be an email address (was "jane")'] }),
}).configure({ title: "FieldError" });

export const validationErrorDetailsSchema = type({
  statusCode: "400",
  error: "'Bad Request'",
  message: "'Validation failed'",
  errors: fieldErrorSchema.array().atLeastLength(1),
});

export const validationErrorSchema = errorEnvelope.merge(validationErrorDetailsSchema).configure({
  title: "ValidationError",
  description:
    "a body or parameters that did not pass validation, with one entry per invalid field",
});

export type ValidationErrorDetails = typeof validationErrorDetailsSchema.infer;

export const validationExceptionFactory: NonNullable<
  StandardSchemaValidationPipeOptions["exceptionFactory"]
> = (issues) =>
  new BadRequestException({
    statusCode: HttpStatus.BAD_REQUEST,
    error: "Bad Request",
    message: "Validation failed",
    errors: issues.map((issue) => ({
      field: (issue.path ?? [])
        .map((segment) => String(typeof segment === "object" ? segment.key : segment))
        .join("."),
      message: "problem" in issue ? String(issue.problem) : issue.message,
    })),
  } satisfies ValidationErrorDetails);
