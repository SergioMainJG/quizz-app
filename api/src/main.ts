import type { Envs } from "./config/envs.schema.js";
import type { NestBunApplication } from "nestjs-platform-bun";

import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { Logger as PinoLogger } from "nestjs-pino";

import { AppModule } from "./app.module.js";
import { configureApplication, createAdapter } from "./main.setup.js";

const app = await NestFactory.create<NestBunApplication>(AppModule, createAdapter(), {
  bufferLogs: true,
});
const config = app.get<ConfigService<Envs, true>>(ConfigService);
app.useLogger(app.get(PinoLogger));

configureApplication(app, config);
app.enableShutdownHooks();
await app.listen(config.get("PORT", { infer: true }), config.get("HOST", { infer: true }));
Logger.log(`Listening on ${await app.getUrl()}`, "Bootstrap");
