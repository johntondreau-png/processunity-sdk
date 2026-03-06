import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup/index.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
    },
  },
});
