import { config } from "dotenv";
import { spawnSync } from "node:child_process";
config({ path: ".env.local", quiet: true });
const command = process.argv[2];
if (!["generate", "deploy", "diff"].includes(command)) { console.error("Choose generate, deploy, or diff."); process.exit(1); }
if (command === "deploy" && !process.env.DIRECT_URL) { console.error("DIRECT_URL is required; no credential values were printed."); process.exit(1); }
const args = command === "generate" ? ["generate"] : command === "deploy" ? ["migrate", "deploy"] : ["migrate", "diff", "--from-empty", "--to-schema", "prisma/schema.prisma", "--script"];
const result = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", ...args], { encoding: "utf8", env: process.env });
if (result.status !== 0) { console.error(`Prisma ${command} failed. Provider output is withheld to protect connection settings.`); process.exit(1); }
if (command === "diff") {
  const { writeFileSync } = await import("node:fs");
  writeFileSync("prisma/migrations/20261008000000_initial/migration.sql", result.stdout);
}
console.log(`Prisma ${command} completed; credential-bearing output was withheld.`);
