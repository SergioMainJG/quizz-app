import type { INestApplication } from "@nestjs/common";
import {
  DocumentBuilder,
  type OpenAPIObject,
  type SwaggerDocumentOptions,
  SwaggerModule,
} from "@nestjs/swagger";
import type { Type } from "arktype";

type SchemaConverter = NonNullable<SwaggerDocumentOptions["standardSchemaConverter"]>;
type JsonSchemaOptions = NonNullable<Parameters<Type["toJsonSchema"]>[0]>;

export const jsonSchemaOptions: JsonSchemaOptions = {
  dialect: null,
  fallback: {
    date: (ctx) => ({ ...ctx.base, type: "string", format: "date-time" }),
    default: (ctx) => ctx.base,
  },
};

export const toOpenApiSchema = (schema: Type, schemaType: "input" | "output") =>
  (schemaType === "input" ? schema.in : schema.out).toJsonSchema(jsonSchemaOptions);

const isArkType = (schema: unknown): schema is Type =>
  typeof schema === "function" &&
  (schema as { "~standard"?: { vendor?: string } })["~standard"]?.vendor === "arktype";

export const arkTypeSchemaConverter: SchemaConverter = (schema, { schemaType }) => {
  if (!isArkType(schema)) return undefined;

  const jsonSchema = toOpenApiSchema(schema, schemaType);
  const title = schema.meta.title;
  if (!title) return { schema: jsonSchema };

  return { schema: { $ref: `#/components/schemas/${title}` }, components: { [title]: jsonSchema } };
};

const description = `
The HTTP API of the quiz app. Every route lives under \`/api\`.

## Getting started

1. Create an account with \`POST /api/auth/sign-up\`, or sign in to an existing one with \`POST /api/auth/sign-in\`.
2. Both answers set the session cookie; send it back on every following request.
3. When \`mfaRequired\` comes back as \`true\`, the session can't be used until it passes the second factor.

## Authentication

The API uses a session cookie, not bearer tokens:

- It is named \`__Host-sid\` (\`sid\` when served over plain HTTP) and is \`HttpOnly\`, \`Secure\` and \`SameSite=Lax\`, so scripts can't read it.
- A session expires after 3 days without use, and after 14 days in any case.
- Requests that change state must come from the app's own origin: a form posted from another site is answered with \`403\`.

## Errors

Every error has the same body (\`ApiError\`):

| Field | Meaning |
| --- | --- |
| \`statusCode\` | The HTTP status, repeated in the body. |
| \`error\` | The reason phrase of the status, such as \`Conflict\`. |
| \`message\` | What went wrong, readable by a person. |
| \`correlationId\` | The id of the request in the server logs; quote it when reporting a problem. |
| \`path\` | The route that was called. |
| \`timestamp\` | When the error happened, in ISO 8601. |

A body that does not pass validation is answered with \`400\` and a \`ValidationError\`, which adds \`errors\`: one entry per invalid field, with its dot path and what is wrong with it. Server errors (\`5xx\`) never include details; look them up in the logs by \`correlationId\`.

## Rate limiting

Requests are limited per client IP, in three windows at once:

| Window | Requests allowed |
| --- | --- |
| 1 second | 3 |
| 10 seconds | 20 |
| 1 minute | 100 |

Over any of them, the API answers \`429 Too Many Requests\`. The health probes are not limited.

## Health

\`GET /api/health/live\` tells whether the process is up, and \`GET /api/health/ready\` whether the database and the cache are reachable. They are meant for the orchestrator's liveness and readiness probes.
`.trim();

export const createOpenApiDocument = (app: INestApplication, appName: string): OpenAPIObject =>
  SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(`${appName} API`)
      .setDescription(description)
      .setVersion("1.0")
      .setOpenAPIVersion("3.1.0")
      .addCookieAuth("__Host-sid", {
        type: "apiKey",
        in: "cookie",
        description:
          "Session cookie set by sign-up and sign-in (named `sid` when served over plain HTTP).",
      })
      .build(),
    { standardSchemaConverter: arkTypeSchemaConverter },
  );
