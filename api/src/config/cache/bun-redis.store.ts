import type { RedisClient } from "bun";

/** Minimal Keyv store over Bun's native Redis client (works with Redis, Valkey and Dragonfly). */
export class BunRedisStore {
  constructor(private readonly client: RedisClient) {}

  async get(key: string): Promise<string | undefined> {
    return (await this.client.get(key)) ?? undefined;
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    await (ttl === undefined
      ? this.client.set(key, value)
      : this.client.send("SET", [key, value, "PX", String(ttl)]));
    return true;
  }

  async delete(key: string): Promise<boolean> {
    return (await this.client.del(key)) > 0;
  }

  async clear(): Promise<void> {
    await this.client.send("FLUSHDB", []);
  }
}
