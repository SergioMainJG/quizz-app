import { type } from "arktype";

const indicatorSchema = type({
  status: type("'up' | 'down'").describe("whether the dependency answered within its timeout"),
  "[string]": "unknown",
}).configure({ title: "HealthIndicator", description: "the result of one dependency check" });

const indicators = type({ "[string]": indicatorSchema });

export const healthCheckResultSchema = type({
  status: type("'ok' | 'error' | 'shutting_down'").describe("the overall result of the probe"),
  "info?": indicators
    .describe("the checks that passed, by name")
    .configure({ examples: [{ database: { status: "up" }, cache: { status: "up" } }] }),
  "error?": indicators.describe("the checks that failed, by name").configure({ examples: [{}] }),
  details: indicators
    .describe("every check, passed or failed, by name")
    .configure({ examples: [{ database: { status: "up" }, cache: { status: "up" } }] }),
}).configure({ title: "HealthCheckResult", description: "the result of a health probe" });

export type HealthCheckResultDto = typeof healthCheckResultSchema.infer;
