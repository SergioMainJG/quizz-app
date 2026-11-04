import type { HealthIndicatorResult } from "@nestjs/terminus";
import type { Cache } from "cache-manager";

import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { HealthIndicatorService } from "@nestjs/terminus";

const PROBE_KEY = "health:probe";

/** Writes and reads back a probe key through every cache tier. */
@Injectable()
export class CacheHealthIndicator {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  isHealthy(key = "cache"): PromiseLike<HealthIndicatorResult> {
    return this.healthIndicatorService
      .check(key)
      .attempt(async () => {
        const probe = Date.now();
        await this.cache.set(PROBE_KEY, probe, 5000);
        if ((await this.cache.get<number>(PROBE_KEY)) !== probe) {
          throw new Error("Cache read-back mismatch");
        }
      })
      .withTimeout(1000);
  }
}
