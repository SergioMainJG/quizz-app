import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, type OpenAPIObject, type SwaggerDocumentOptions, SwaggerModule } from "@nestjs/swagger";
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

export const createOpenApiDocument = (app: INestApplication, appName: string): OpenAPIObject =>
  SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(`${appName} API`)
      .setVersion("1.0")
      .setOpenAPIVersion("3.1.0")
      .addCookieAuth("__Host-sid", {
        type: "apiKey",
        in: "cookie",
        description: "Session cookie set by sign-up and sign-in (named `sid` when served over plain HTTP).",
      })
      .build(),
    { standardSchemaConverter: arkTypeSchemaConverter },
  );
