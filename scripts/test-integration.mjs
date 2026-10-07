import { config } from "dotenv";
import { spawnSync } from "node:child_process";
import { assertTestDatabase } from "./test-database-guard.mjs";
config({ path: ".env.local", quiet: true });
try { assertTestDatabase(process.env); } catch {
  console.error("Integration tests stopped: configure TEST_DATABASE_URL for a separate Neon test branch/database. Runtime and migration databases cannot be test targets."); process.exit(1);
}
// Pass credentials through the environment, never command arguments or logs.
const environment = { ...process.env, PRISMA_MIGRATION_URL: process.env.TEST_DATABASE_URL };
const migrate = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { env: environment, encoding: "utf8" });
if (migrate.status !== 0) { console.error("Test schema migration failed; connection output was withheld."); process.exit(1); }
const test = spawnSync(process.execPath, ["node_modules/vitest/vitest.mjs", "run", "--config", "vitest.integration.config.ts"], { env: environment, encoding: "utf8" });
// Withhold raw driver diagnostics and connection configuration on errors.
if (test.status !== 0) { console.error("Database integration checks failed; raw driver output was withheld. Inspect the test cases using sanitized diagnostics."); process.exit(1); }
console.log("All disposable database integration checks passed.");
