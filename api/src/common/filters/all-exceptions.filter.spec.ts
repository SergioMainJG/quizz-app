import type { ArgumentsHost } from "@nestjs/common";

import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";

import { AllExceptionsFilter } from "./all-exceptions.filter.js";

beforeAll(() => {
  // Server errors are logged on purpose; keep the test output clean.
  vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
});

const createHost = (request: object) => {
  const reply = vi.fn();
  const adapterHost = {
    httpAdapter: { getRequestUrl: () => "/orders/1", reply },
  };
  const host = {
    getType: () => "http",
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => ({}) }),
  } as unknown as ArgumentsHost;
  return { filter: new AllExceptionsFilter(adapterHost as never), host, reply };
};

describe("AllExceptionsFilter", () => {
  it("keeps the status and message of HTTP exceptions", () => {
    const { filter, host, reply } = createHost({ id: "req-1", method: "GET" });

    filter.catch(new NotFoundException("Order not found"), host);

    expect(reply).toHaveBeenCalledWith(
      {},
      expect.objectContaining({
        correlationId: "req-1",
        error: "Not Found",
        message: "Order not found",
        path: "/orders/1",
        statusCode: 404,
      }),
      404,
    );
  });

  it("reuses the incoming correlation id header", () => {
    const { filter, host, reply } = createHost({ headers: { "x-correlation-id": "abc" } });

    filter.catch(new BadRequestException(["email must be an email"]), host);

    expect(reply.mock.calls[0]?.[1]).toMatchObject({
      correlationId: "abc",
      message: ["email must be an email"],
    });
  });

  it("keeps the field errors of a validation failure", () => {
    const { filter, host, reply } = createHost({ id: "req-1" });
    const errors = [{ field: "email", message: 'must be an email address (was "asf")' }];

    filter.catch(
      new BadRequestException({
        statusCode: 400,
        error: "Bad Request",
        message: "Validation failed",
        errors,
      }),
      host,
    );

    expect(reply.mock.calls[0]?.[1]).toMatchObject({
      error: "Bad Request",
      message: "Validation failed",
      errors,
      statusCode: 400,
    });
  });

  it("never lets an exception override the envelope", () => {
    const { filter, host, reply } = createHost({ id: "req-1" });

    filter.catch(
      new BadRequestException({
        message: "Nope",
        statusCode: 200,
        path: "/elsewhere",
        correlationId: "forged",
      }),
      host,
    );

    expect(reply.mock.calls[0]?.[1]).toMatchObject({
      statusCode: 400,
      path: "/orders/1",
      correlationId: "req-1",
    });
    expect(reply.mock.calls[0]?.[2]).toBe(400);
  });

  it("leaves the extra fields of server errors out of the response", () => {
    const { filter, host, reply } = createHost({});

    filter.catch(
      new InternalServerErrorException({ message: "Query failed", query: "SELECT * FROM users" }),
      host,
    );

    expect(reply.mock.calls[0]?.[1]).not.toHaveProperty("query");
  });

  it("hides the details of unexpected errors", () => {
    const { filter, host, reply } = createHost({});

    filter.catch(new Error("connection refused"), host);

    expect(reply.mock.calls[0]?.[1]).toMatchObject({
      message: "Internal server error",
      statusCode: 500,
    });
  });
});
