import { AuthenticationModule } from "@nestjs/authentication";
import type { INestApplication } from "@nestjs/common";
import type { OpenAPIObject } from "@nestjs/swagger";
import { Test } from "@nestjs/testing";
import { type } from "arktype";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AuthModule } from "../../auth/auth.module.js";
import { UsersRepository } from "../../users/users.repository.js";
import { arkTypeSchemaConverter, createOpenApiDocument } from "./openapi.js";

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });

const jsonBody = (operation: { requestBody?: unknown } | undefined) =>
  (operation?.requestBody as { content: { "application/json": { schema: unknown } } }).content["application/json"].schema;

const responseBody = (operation: { responses?: Record<string, unknown> } | undefined, status: string) =>
  (operation?.responses?.[status] as { content: { "application/json": { schema: unknown } } }).content[
    "application/json"
  ].schema;

describe("OpenAPI document", () => {
  let app: INestApplication;
  let document: OpenAPIObject;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthenticationModule.forRoot({ session: { absoluteTtl: "14d", idleTtl: "3d" } }), AuthModule],
    })
      .overrideProvider(UsersRepository)
      .useValue({})
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix("api");
    document = createOpenApiDocument(app, "Test");
  });

  afterAll(() => app.close());

  it("uses OpenAPI 3.1 and documents the session cookie", () => {
    expect(document.openapi).toBe("3.1.0");
    expect(document.components?.securitySchemes?.cookie).toMatchObject({ in: "cookie", name: "__Host-sid" });
  });

  it("documents sign-up with named request, response and error schemas", () => {
    const signUp = document.paths["/api/auth/sign-up"]?.post;

    expect(jsonBody(signUp)).toEqual(ref("SignUpRequest"));
    expect(responseBody(signUp, "201")).toEqual(ref("User"));
    expect(responseBody(signUp, "400")).toEqual(ref("ValidationError"));
    expect(responseBody(signUp, "409")).toEqual(ref("ApiError"));
  });

  it("documents sign-in with named request, response and error schemas", () => {
    const signIn = document.paths["/api/auth/sign-in"]?.post;

    expect(jsonBody(signIn)).toEqual(ref("SignInRequest"));
    expect(responseBody(signIn, "200")).toEqual(ref("SignInResult"));
    expect(responseBody(signIn, "401")).toEqual(ref("ApiError"));
  });

  it("never documents a password in a response", () => {
    const user = document.components?.schemas?.User as { properties: Record<string, unknown> };

    expect(user.properties).not.toHaveProperty("password");
  });
});

describe("arkTypeSchemaConverter", () => {
  it("leaves schemas from other libraries to Nest", () => {
    const notArkType = { "~standard": { vendor: "zod", version: 1, validate: () => ({ value: null }) } };

    expect(arkTypeSchemaConverter(notArkType, { schemaType: "input" })).toBeUndefined();
  });

  it("inlines a schema without a title", () => {
    expect(arkTypeSchemaConverter(type({ name: "string" }), { schemaType: "input" })).toEqual({
      schema: expect.objectContaining({ type: "object" }),
    });
  });
});
