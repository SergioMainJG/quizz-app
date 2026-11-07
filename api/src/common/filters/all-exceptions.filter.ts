import { randomUUID } from "node:crypto";
import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { Catch, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

export interface ErrorResponseBody {
  correlationId: string;
  error: string;
  message: string | string[];
  path: string;
  statusCode: number;
  timestamp: string;
  /** Anything else a client error carries, such as the field `errors` of a validation failure. */
  [detail: string]: unknown;
}

type ExceptionResponse = Record<string, unknown> & { error?: string; message?: string | string[] };

interface RequestLike {
  headers?: Record<string, string | string[] | undefined>;
  id?: string;
  method?: string;
}

export const CORRELATION_ID_HEADER = "x-correlation-id";

const toReasonPhrase = (status: number): string | undefined =>
  (HttpStatus[status] as string | undefined)
    ?.toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

type BodyFromException = Pick<ErrorResponseBody, "error" | "message"> & Record<string, unknown>;

const toBody = (exception: unknown): BodyFromException => {
  if (!(exception instanceof HttpException)) {
    return { error: "Internal Server Error", message: "Internal server error" };
  }
  const status = exception.getStatus();
  const reason = toReasonPhrase(status) ?? exception.name;
  const response = exception.getResponse();
  if (typeof response === "string") {
    return { error: reason, message: response };
  }
  const { error, message, ...details } = response as ExceptionResponse;
  return {
    // Client errors keep their extra fields (the validation `errors`, for one); a server
    // error's details stay out of the response.
    ...(status < 500 ? details : {}),
    error: error ?? reason,
    message: message ?? exception.message,
  };
};

const correlationIdOf = (request: RequestLike): string => {
  const header = request.headers?.[CORRELATION_ID_HEADER];
  return request.id ?? (typeof header === "string" ? header : randomUUID());
};

/**
 * Every HTTP error leaves as { statusCode, error, message, path, timestamp, correlationId },
 * plus the extra fields of a 4xx exception (such as the validation `errors`).
 * It uses the HttpAdapterHost, so it works with any HTTP adapter.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly adapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): unknown {
    if (host.getType() !== "http") {
      return exception;
    }
    const { httpAdapter } = this.adapterHost;
    const http = host.switchToHttp();
    const request = http.getRequest<RequestLike>();
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const path = String(httpAdapter.getRequestUrl(request));

    if (statusCode >= 500) {
      this.logger.error(
        `${request.method ?? "?"} ${path}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponseBody = {
      ...toBody(exception),
      correlationId: correlationIdOf(request),
      path,
      statusCode,
      timestamp: new Date().toISOString(),
    };
    httpAdapter.reply(http.getResponse(), body, statusCode);
    return undefined;
  }
}
