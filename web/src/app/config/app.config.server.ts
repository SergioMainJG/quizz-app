import { ApplicationConfig, mergeApplicationConfig } from "@angular/core";
import { provideServerRendering, withRoutes } from "@angular/ssr";
import { serverRoutes } from "../routes/app.routes.server";
import { appConfig } from "./app.config";

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(
      {
        maxResponseBodySize: 5 * 1024 * 1024,
      },
      withRoutes(serverRoutes),
    ),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
