import { type } from "arktype";

export const fieldErrorSchema = type({
  field: "string",
  message: "string",
});
