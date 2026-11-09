import { provideHttpClient } from "@angular/common/http";
import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from "@angular/core";
import {
  provideClientHydration,
  withEventReplay,
  withHttpTransferCacheOptions,
} from "@angular/platform-browser";
import { provideRouter, withComponentInputBinding, withViewTransitions } from "@angular/router";
import { provideServiceWorker } from "@angular/service-worker";
import { routes } from "../routes/app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withViewTransitions({
        onViewTransitionCreated: ({ transition }) => {
          if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
            transition.skipTransition();
          }
        },
      }),
      withComponentInputBinding(),
    ),
    provideClientHydration(
      withEventReplay(),
      withHttpTransferCacheOptions({ includeRequestsWithAuthHeaders: true }),
    ),
    provideServiceWorker("ngsw-worker.js", {
      enabled: !isDevMode(),
      registrationStrategy: "registerWhenStable:30000",
    }),
    provideHttpClient(),
  ],
};
