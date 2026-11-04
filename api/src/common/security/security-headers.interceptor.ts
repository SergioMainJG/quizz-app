import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import type { Observable } from "rxjs";

import { Injectable } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

/** The baseline of the OWASP Secure Headers Project, as helmet sets them. */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'; object-src 'none'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

@Injectable()
export class SecurityHeadersInterceptor implements NestInterceptor {
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() === "http") {
      const response: unknown = context.switchToHttp().getResponse();
      for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
        this.adapterHost.httpAdapter.setHeader(response, name, value);
      }
    }
    return next.handle();
  }
}
