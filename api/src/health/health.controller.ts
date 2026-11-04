import type { HealthCheckResult } from "@nestjs/terminus";

import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";
import { SkipThrottle } from "@nestjs/throttler";

import { CacheHealthIndicator } from "./indicators/cache.health.js";
import { DatabaseHealthIndicator } from "./indicators/database.health.js";

/** Liveness (process up) and readiness (dependencies reachable) probes. */
@SkipThrottle()
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: DatabaseHealthIndicator,
    private readonly cache: CacheHealthIndicator,
  ) {}

  @Get("live")
  @HealthCheck()
  live(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get("ready")
  @HealthCheck()
  ready(): Promise<HealthCheckResult> {
    return this.health.check([() => this.database.isHealthy(), () => this.cache.isHealthy()]);
  }
}
