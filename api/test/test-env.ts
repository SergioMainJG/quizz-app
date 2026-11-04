/** Environment used by every test run (see vitest.config.ts). */
export const testEnv = {
  APP_NAME: "app-test",
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: "3000",
  DATABASE_URL: "postgres://app:change-me@localhost:5432/app",
  CACHE_TTL: "60000",
  CACHE_URL: "redis://localhost:6379",
  LOG_LEVEL: "error",
  DOMAIN_ORIGIN: "http://localhost:5173",
  MAIL_FROM: "Test <test@example.com>",
} as const satisfies Record<string, string>;
