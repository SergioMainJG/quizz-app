/** Environment contract. Add a variable here, in template.env and in test/test-env.ts. */
import { type } from "arktype";

const numericEnv = type("string.numeric.parse");

export const envsSchema = type({
  APP_NAME: "string > 0",
  NODE_ENV: "'development' | 'production' | 'test'",
  HOST: "string > 0",
  PORT: numericEnv.to("1 <= number.integer <= 65535"),
  DATABASE_URL: "string.url",
  CACHE_TTL: numericEnv.to("number.integer >= 0"),
  CACHE_URL: "string.url",
  "LOG_LEVEL?": "'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'",
  DOMAIN_ORIGIN: "string.url",
  "SMTP_URL?": "string.url",
  MAIL_FROM: "string > 0",
});

export type Envs = typeof envsSchema.infer;

export const validateEnv = (config: Record<string, unknown>): Envs => envsSchema.assert(config);
