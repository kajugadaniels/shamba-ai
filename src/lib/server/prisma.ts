import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalDatabase = globalThis as unknown as { shambaPrisma?: PrismaClient };
export function database() {
  if (globalDatabase.shambaPrisma) return globalDatabase.shambaPrisma;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("SERVER_CONFIGURATION");
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString }), log: [] });
  globalDatabase.shambaPrisma = client;
  return client;
}
