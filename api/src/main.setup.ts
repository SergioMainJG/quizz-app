import { StandardSchemaValidationPipe } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import { Type } from "arktype";
import type { NestBunApplication } from "nestjs-platform-bun";
import { BunAdapter } from "nestjs-platform-bun";
import { BunIoAdapter } from "nestjs-platform-bun/socket.io";
import type { Envs } from "./config/envs.schema.js";

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

  const isArkType = (schema: unknown): schema is Type =>
    (typeof schema === "function" || (typeof schema === "object" && schema !== null)) &&
    (schema as { "~standard"?: { vendor?: string } })["~standard"]?.vendor === "arktype";

  const documentOptions: SwaggerDocumentOptions = {
    standardSchemaConverter: (schema, { schemaType }) => {
      if (!isArkType(schema)) return undefined;

      const t = schemaType === "input" ? schema.in : schema.out;
      const { $schema: _, ...jsonSchema } = t.toJsonSchema({
        fallback: {
          date: (ctx) => ({ ...ctx.base, type: "string", format: "date-time" }),
          default: (ctx) => ctx.base,
        },
      }) as Record<string, unknown>;

      return { schema: jsonSchema };
    },
  };

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(`${config.get("APP_NAME", { infer: true })} API`)
      .setVersion("1.0")
      .addBearerAuth()
      .build(),
      documentOptions
  );
  app.use("/reference", apiReference({ content: document }));
  app.useWebSocketAdapter(new BunIoAdapter(app));
};
