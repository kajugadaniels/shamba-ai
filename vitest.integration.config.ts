import { defineConfig } from "vitest/config";
import base from "./vitest.config";
export default defineConfig({ ...base, test: {
  ...base.test, environment: "node", setupFiles: ["./tests/integration-setup.ts"],
  include: ["tests/garden.integration.test.ts"], exclude: [], testTimeout: 30000, hookTimeout: 30000,
} });
