import { type } from "arktype";
import { responseErrorSchema } from "./response-error.schema";

export const signInResponseSchema = type({
  mfaRequired: 'boolean'
}).or(responseErrorSchema);

export type SignInResponse = typeof signInResponseSchema.infer;