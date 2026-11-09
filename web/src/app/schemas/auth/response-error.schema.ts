import { type } from "arktype";
import { fieldErrorSchema } from "./field-error.schema";

export const responseErrorSchema = type({
  correlationId: 'number|string',
  error: 'string',
  message: "string",
  path: 'string',
  statusCode: "number.integer",
  timestamp: "string",
  "errors?": fieldErrorSchema.array(),
});

export type ResponseError = typeof responseErrorSchema.infer;