import type { CacheManagerOptions, CacheOptionsFactory } from "@nestjs/cache-manager";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { KeyvCacheableMemory } from "cacheable";
import { Keyv } from "keyv";
import { RedisClient } from "bun";

import { BunRedisStore } from "./bun-redis.store.js";

import type { Envs } from "../envs.schema.js";

const MEMORY_CHECK_INTERVAL_MS = 60_000;
const MEMORY_LRU_SIZE = 500;

/** Two tiers: an in-process LRU (L1) in front of valkey (L2). */
@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private readonly configService: ConfigService<Envs, true>) {}

  createCacheOptions(): CacheManagerOptions {
    const ttl = this.configService.get("CACHE_TTL", { infer: true });
    return {
      stores: [
        new Keyv({
          store: new KeyvCacheableMemory({
            checkInterval: MEMORY_CHECK_INTERVAL_MS,
            lruSize: MEMORY_LRU_SIZE,
            ttl,
          }),
        }),
        new Keyv({
          store: new BunRedisStore(
            new RedisClient(this.configService.get("CACHE_URL", { infer: true })),
          ),
        }),
      ],
      ttl,
    };
  }
}
