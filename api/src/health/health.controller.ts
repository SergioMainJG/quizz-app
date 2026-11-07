import { Controller, Get } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { HealthCheckResult } from "@nestjs/terminus";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";
import { SkipThrottle } from "@nestjs/throttler";

import { apiErrorSchema } from "../common/schemas/http-error.schema.js";
import { CacheHealthIndicator } from "./indicators/cache.health.js";
import { DatabaseHealthIndicator } from "./indicators/database.health.js";
import { healthCheckResultSchema } from "./schema/health.schema.js";

/** Liveness (process up) and readiness (dependencies reachable) probes. */
@ApiTags("Health")
@SkipThrottle()
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: DatabaseHealthIndicator,
    private readonly cache: CacheHealthIndicator,
  ) {}

  @Get("live")
  @HealthCheck({ noCache: true, swaggerDocumentation: false })
  @ApiOperation({
    summary: "Liveness probe",
    description:
      "Answers as long as the process is running; it checks no dependency. Use it to decide when to restart the container.",
  })
  @ApiOkResponse({
    description: "The process is up.",
    standardSchema: healthCheckResultSchema,
    example: { status: "ok", info: {}, error: {}, details: {} },
  })
  live(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get("ready")
  @HealthCheck({ noCache: true, swaggerDocumentation: false })
  @ApiOperation({
    summary: "Readiness probe",
    description:
      "Checks that the database answers `select 1` and that the cache can write and read back a key, each within 1 second. Use it to decide when to send traffic to the instance.",
  })
  @ApiOkResponse({
    description: "Every dependency is reachable.",
    standardSchema: healthCheckResultSchema,
  })
  @ApiServiceUnavailableResponse({
    description:
      "The database or the cache is unreachable. The failing check is only reported in the server logs.",
    standardSchema: apiErrorSchema,
  })
  ready(): Promise<HealthCheckResult> {
    return this.health.check([() => this.database.isHealthy(), () => this.cache.isHealthy()]);
  }
}
