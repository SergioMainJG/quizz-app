import { HttpErrorResponse } from "@angular/common/http";
import type { FieldTree, TreeValidationResult } from "@angular/forms/signals";
import { ArkErrors } from "arktype";
import { responseErrorSchema } from "../../schemas/auth/response-error.schema";

const GENERIC_ERROR = "Something went wrong. Try again later";

export const toFormErrors = <T extends object>(error: unknown, fields: FieldTree<T>): TreeValidationResult => {
  if (!(error instanceof HttpErrorResponse)) throw error;

  if (error.status === 0) {
    return { kind: "network", message: "Can't reach the server. Check your connection and try again." };
  }
  if (error.status === 429) {
    return { kind: "rateLimited", message: "Too many attempts. Wait a moment and try again." };
  }

  const body = responseErrorSchema(error.error);
  if (body instanceof ArkErrors) {
    return { kind: "server", message: `${GENERIC_ERROR}.` };
  }
  if (error.status >= 500) {
    return { kind: "server", message: `${GENERIC_ERROR} (reference ${body.correlationId}).` };
  }
  if (body.errors?.length) {
    return body.errors.map(({ field, message }) => ({
      kind: "server",
      fieldTree: (fields as Record<string, FieldTree<unknown>>)[field] ?? fields,
      message,
    }));
  }
  return { kind: "server", message: Array.isArray(body.message) ? body.message.join(". ") : body.message };
}