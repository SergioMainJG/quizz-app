import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

import { testEnv } from "./test/test-env.js";

const plugins = [swc.vite({ module: { type: "es6" } })];

export default defineConfig({
  test: {
    env: testEnv,
    globals: true,
    passWithNoTests: true,
    projects: [
      {
        plugins,
        test: { globals: true, include: ["src/**/*.spec.ts"], name: "unit" },
      },
      {
        plugins,
        test: {
          fileParallelism: false,
          globals: true,
          include: ["test/**/*.e2e-spec.ts"],
          name: "e2e",
          testTimeout: 20_000,
        },
      },
    ],
  },
});
