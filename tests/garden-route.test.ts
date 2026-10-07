import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), findUnique: vi.fn(), save: vi.fn(), history: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));
vi.mock("@/lib/server/prisma", () => ({ database: () => ({ garden: { findUnique: mocks.findUnique }, identification: { findMany: mocks.history } }) }));
vi.mock("@/lib/server/gardens", async (original) => ({ ...await original<typeof import("@/lib/server/gardens")>(), saveGarden: mocks.save }));
import { GET, PUT } from "@/app/api/garden/route";
import { GET as history } from "@/app/api/garden/history/route";
import { signPlan } from "@/lib/server/receipts";
import { normalizeCompanion } from "@/lib/server/companion";
import two from "../devpost/api-checks/companion-two-decimal.json";
const secret = "simulated-secret-32-bytes-for-tests-only";
const plan = normalizeCompanion(two.response, { widthM: 1.5, lengthM: 2.5, crops: ["tomato", "basil"] });
function request(body: unknown, origin = "http://localhost:3000") {
  return new Request("http://localhost:3000/api/garden", { method: "PUT", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) });
}
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv("APP_SIGNING_SECRET", secret); mocks.auth.mockResolvedValue({ userId: "owner-a" }); });
describe("owned garden routes with simulated auth/database", () => {
  it("returns 401 without touching the database when signed out", async () => {
    mocks.auth.mockResolvedValue({ userId: null });
    expect((await GET()).status).toBe(401); expect((await PUT(request({}))).status).toBe(401);
    expect((await history()).status).toBe(401); expect(mocks.findUnique).not.toHaveBeenCalled(); expect(mocks.save).not.toHaveBeenCalled();
  });
  it("uses authenticated identity for reading and distinguishes retrieval failure from no garden", async () => {
    mocks.findUnique.mockResolvedValue(null);
    expect(await (await GET()).json()).toEqual({ garden: null });
    expect(mocks.findUnique).toHaveBeenCalledWith({ where: { clerkUserId: "owner-a" } });
    mocks.findUnique.mockRejectedValue(new Error("simulated private driver detail"));
    const response = await GET(); expect(response.status).toBe(503); expect(await response.text()).not.toContain("private driver");
  });
  it("rejects cross-origin, tampered and identity-injected saves before persistence", async () => {
    const input = { receipt: signPlan(plan, secret), expectedRevision: null, confirmReplacement: false };
    expect((await PUT(request(input, "https://elsewhere.example"))).status).toBe(403);
    expect((await PUT(request({ ...input, receipt: `${input.receipt}broken` }))).status).toBe(400);
    expect((await PUT(request({ ...input, clerkUserId: "other" }))).status).toBe(400);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("saves the signed normalized plan without calling RapidAPI", async () => {
    mocks.save.mockResolvedValue({ id: "simulated-saved-garden" });
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    expect((await PUT(request({ receipt: signPlan(plan, secret), expectedRevision: 2, confirmReplacement: true }))).status).toBe(200);
    expect(mocks.save).toHaveBeenCalledWith(expect.anything(), "owner-a", plan, 2, true);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("queries only the owner's history, newest first", async () => {
    mocks.history.mockResolvedValue([]); expect((await history()).status).toBe(200);
    expect(mocks.history.mock.calls[0][0].where).toEqual({ garden: { clerkUserId: "owner-a" } });
    expect(mocks.history.mock.calls[0][0].orderBy[0]).toEqual({ identifiedAt: "desc" });
  });
});
