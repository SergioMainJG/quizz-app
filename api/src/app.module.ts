import { AuthenticationModule } from '@nestjs/authentication';
import { CacheInterceptor, CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { DrizzleModule } from "@nestjs/drizzle";
import { LogMailTransport, MailModule, SmtpTransport } from "@nestjs/mail";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { AuthModule } from "./auth/auth.module.js";

import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter.js";
import { HashingModule } from "./common/hashing/hashing.module.js";
import { SecurityHeadersInterceptor } from "./common/security/security-headers.interceptor.js";
import { DrizzleConfigService } from "./config/drizzle/drizzle-config.service.js";
import type { Envs } from "./config/envs.schema.js";
import { validateEnv } from "./config/envs.schema.js";
import { ThrottlerConfigService } from "./config/throttler/throttler-config.service.js";
import { EventsModule } from "./events/events.module.js";
import { HealthModule } from "./health/health.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      ignoreEnvFile: Bun.env.NODE_ENV === "test",
      isGlobal: true,
      validate: validateEnv,
    }),
    DrizzleModule.forRootAsync({ useClass: DrizzleConfigService }),
    HashingModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Envs, true>) => {
        return {
          ttl: config.get<number>("CACHE_TTL"),
        };
      },
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Envs, true>) => {
        const isProduction = config.get("NODE_ENV", { infer: true }) === "production";
        return {
          pinoHttp: {
            level: config.get("LOG_LEVEL", { infer: true }) ?? (isProduction ? "info" : "debug"),
            transport: isProduction ? undefined : { target: "pino-pretty" },
          },
        };
      },
    }),
    HealthModule,
    ThrottlerModule.forRootAsync({ useClass: ThrottlerConfigService }),
    MailModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Envs, true>) => {
        const url = config.get("SMTP_URL", { infer: true });
        return {
          from: config.get("MAIL_FROM", { infer: true }),
          transport: url === undefined ? new LogMailTransport() : new SmtpTransport({ url }),
        };
      },
    }),
    EventsModule,
    AuthModule,
    AuthenticationModule.forRoot({
      session: {
        absoluteTtl: '14d',
        idleTtl: '3d',
      }
    }),
    UsersModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: SecurityHeadersInterceptor },
    { provide: APP_INTERCEPTOR, useClass: CacheInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
