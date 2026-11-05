import { StandardSchemaValidationPipe } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { apiReference } from "@scalar/nestjs-api-reference";
import type { NestBunApplication } from "nestjs-platform-bun";
import { BunAdapter } from "nestjs-platform-bun";
import { BunIoAdapter } from "nestjs-platform-bun/socket.io";
import { validationExceptionFactory } from "./common/schemas/http-error.schema.js";
import type { Envs } from "./config/envs.schema.js";
import { createOpenApiDocument } from "./config/openapi/openapi.js";

/** nestjs-platform-bun is a third-party adapter, not maintained by the NestJS team. */
export const createAdapter = (): BunAdapter => new BunAdapter();

/** The HTTP pipeline (validation, security, docs…), applied by main.ts and the e2e tests. */
export const configureApplication = (
  app: NestBunApplication,
  config: ConfigService<Envs, true>,
): void => {
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new StandardSchemaValidationPipe({ exceptionFactory: validationExceptionFactory }),
  );
  app.enableCors({
    credentials: false,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
    origin: config.get("DOMAIN_ORIGIN", { infer: true }),
  });

  const document = createOpenApiDocument(
    app,
    config.get("APP_NAME", { infer: true }),
  );
  app.use("/reference", apiReference({ content: document }));
  app.useSecurityHeaders();
  app.useWebSocketAdapter(new BunIoAdapter(app));
};
