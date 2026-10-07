// Real PostgreSQL tests; run only through test:integration with a guarded database.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { saveGarden, GardenConflict } from "@/lib/server/gardens";
import { normalizeCompanion } from "@/lib/server/companion";
import two from "../devpost/api-checks/companion-two-decimal.json";
import { assertTestDatabase } from "../scripts/test-database-guard.mjs";

const prefix = `shamba-test-${randomUUID()}-`;
let db: PrismaClient;
const plan = () => normalizeCompanion(two.response, { widthM: 1.5, lengthM: 2.5, crops: ["tomato", "basil"] });
async function seed(gardenId: string, gardenRevision: number) {
  return db.identification.create({ data: { gardenId, gardenRevision, requestId: randomUUID(), classification: "not_weed",
    commonName: "Sweet Basil", confidence: 98, explanation: "Simulated integration fixture: opposite leaves.", guidance: [] } });
}
beforeAll(() => {
  assertTestDatabase(process.env);
  db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.TEST_DATABASE_URL! }), log: [] });
});
afterAll(async () => {
  if (db) { await db.garden.deleteMany({ where: { clerkUserId: { startsWith: prefix } } }); await db.$disconnect(); }
});
describe("disposable PostgreSQL garden transactions", () => {
  it("keeps one garden per user and isolates another owner", async () => {
    const a = await saveGarden(db, `${prefix}a`, plan(), null, false);
    const b = await saveGarden(db, `${prefix}b`, plan(), null, false);
    expect(a.id).not.toBe(b.id);
    expect(await db.garden.count({ where: { clerkUserId: `${prefix}a` } })).toBe(1);
    await expect(db.garden.create({ data: { clerkUserId: `${prefix}a`, widthM: 2, lengthM: 2, crops: ["tomato", "basil"], plan: {}, planId: randomUUID() } })).rejects.toMatchObject({ code: "P2002" });
    expect(await db.identification.count({ where: { garden: { clerkUserId: `${prefix}b` } } })).toBe(0);
  });
  it("rejects stale and unconfirmed replacement without deleting history", async () => {
    const user = `${prefix}stale`; const old = await saveGarden(db, user, plan(), null, false); await seed(old.id, old.revision);
    await expect(saveGarden(db, user, plan(), old.revision, false)).rejects.toBeInstanceOf(GardenConflict);
    await expect(saveGarden(db, user, plan(), old.revision + 1, true)).rejects.toBeInstanceOf(GardenConflict);
    expect(await db.identification.count({ where: { gardenId: old.id } })).toBe(1);
    expect((await db.garden.findUniqueOrThrow({ where: { id: old.id } })).revision).toBe(old.revision);
  });
  it("rolls back deleted history when the update fails inside the real transaction", async () => {
    const user = `${prefix}rollback`; const old = await saveGarden(db, user, plan(), null, false); await seed(old.id, old.revision);
    // Inject a failure after deletion, while retaining the actual PostgreSQL transaction.
    const failing = new Proxy(db, { get(target, property) {
      if (property !== "$transaction") return Reflect.get(target, property);
      return (callback: Parameters<PrismaClient["$transaction"]>[0], options: unknown) => target.$transaction(async (tx) => {
        const wrapped = new Proxy(tx, { get(inner, field) {
          if (field !== "garden") return Reflect.get(inner, field);
          return new Proxy(tx.garden, { get(garden, method) { if (method === "update") return () => { throw new Error("SIMULATED_ROLLBACK"); }; return Reflect.get(garden, method); } });
        } });
        return (callback as unknown as (value: typeof tx) => Promise<unknown>)(wrapped);
      }, options as { isolationLevel: "Serializable" });
    } });
    await expect(saveGarden(failing, user, plan(), old.revision, true)).rejects.toThrow("SIMULATED_ROLLBACK");
    expect(await db.identification.count({ where: { gardenId: old.id } })).toBe(1);
    expect((await db.garden.findUniqueOrThrow({ where: { id: old.id } })).planId).toBe(old.plan.planId);
  });
  it("clears history on replacement, increments revision, and preserves new history on duplicate save", async () => {
    const user = `${prefix}replace`; const old = await saveGarden(db, user, plan(), null, false); await seed(old.id, old.revision);
    const nextPlan = plan(); const next = await saveGarden(db, user, nextPlan, old.revision, true);
    expect(next.revision).toBe(old.revision + 1);
    expect(next.plan).toEqual(nextPlan);
    expect(await db.identification.count({ where: { gardenId: next.id } })).toBe(0);
    await seed(next.id, next.revision);
    const duplicate = await saveGarden(db, user, nextPlan, old.revision, true);
    expect(duplicate.revision).toBe(next.revision);
    expect(await db.identification.count({ where: { gardenId: next.id } })).toBe(1);
  });
  it("permits only one of two competing replacements", async () => {
    const user = `${prefix}race`; const old = await saveGarden(db, user, plan(), null, false);
    const results = await Promise.allSettled([saveGarden(db, user, plan(), old.revision, true), saveGarden(db, user, plan(), old.revision, true)]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect((await db.garden.findUniqueOrThrow({ where: { id: old.id } })).revision).toBe(2);
  });
});
