import type { Envs } from "./config/envs.schema.js";
import type { ConfigService } from "@nestjs/config";
import type { NestBunApplication } from "nestjs-platform-bun";

import { StandardSchemaValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { BunAdapter } from "nestjs-platform-bun";
import { BunIoAdapter } from "nestjs-platform-bun/socket.io";

/** nestjs-platform-bun is a third-party adapter, not maintained by the NestJS team. */
export const createAdapter = (): BunAdapter => new BunAdapter();

/** The HTTP pipeline (validation, security, docs…), applied by main.ts and the e2e tests. */
export const configureApplication = (
  app: NestBunApplication,
  config: ConfigService<Envs, true>,
): void => {
  app.useGlobalPipes(new StandardSchemaValidationPipe());
  app.enableCors({
    credentials: false,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
    origin: config.get("DOMAIN_ORIGIN", { infer: true }),
  });
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(`${config.get("APP_NAME", { infer: true })} API`)
      .setVersion("1.0")
      .addBearerAuth()
      .build(),
  );
  app.use("/reference", apiReference({ content: document }));
  app.useWebSocketAdapter(new BunIoAdapter(app));
};
