import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode } from "@angular/core";
import { provideClientHydration } from "@angular/platform-browser";
import { provideRouter, withViewTransitions } from "@angular/router";
import { routes } from "./app.routes";
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions({
      onViewTransitionCreated: ({ transition }) => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
          transition.skipTransition();
        }
      },
    })),
    provideClientHydration(), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ],
};
