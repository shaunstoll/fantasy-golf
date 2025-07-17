import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.tsx"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**", // Exclude Playwright tests
      "**/.{idea,git,cache}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc}.config.*",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: "./e2e/coverage",
      exclude: [
        "node_modules/**",
        "e2e/**",
        "**/*.d.ts",
        "**/*.config.ts",
        "**/types.ts",
        "coverage/**",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/__test?(s)__/**",
        "**/__mocks__/**",
        "**/index.ts",
        "**/index.tsx",
        "**/vite-env.d.ts",
        "**/vitest.setup.ts",
        "src/app/**",
        "src/env.ts",
        "src/overrides.ts",
        "src/db/**",
        "src/scripts/**",
        "src/server/api/root.ts",
        "src/server/api/trpc.ts",
        "src/trpc/**",
      ],
      all: true,
      include: ["src/**/*.{ts,tsx}"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      watermarks: {
        statements: [50, 80],
        branches: [50, 80],
        functions: [50, 80],
        lines: [50, 80],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"),
    },
  },
});
