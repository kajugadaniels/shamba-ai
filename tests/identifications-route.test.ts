// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ auth: vi.fn(), owned: vi.fn(), save: vi.fn(), provider: vi.fn(), duplicate: vi.fn(), detail: vi.fn() }));
vi.mock("@clerk/nextjs/server", () => ({ auth: mocks.auth }));
vi.mock("@/lib/server/prisma", () => ({ database: () => ({ identification: { findFirst: mocks.duplicate } }) }));
vi.mock("@/lib/server/history", async (original) => ({ ...await original<typeof import("@/lib/server/history")>(), ownedGarden: mocks.owned, saveIdentification: mocks.save }));
vi.mock("@/lib/server/rapidapi", async (original) => ({ ...await original<typeof import("@/lib/server/rapidapi")>(), requestIdentification: mocks.provider }));
import { POST } from "@/app/api/identifications/route";
import { POST as retry } from "@/app/api/identifications/retry/route";
import { signIdentification } from "@/lib/server/receipts";
import { normalizeIdentification } from "@/lib/server/identification";
import { GardenConflict } from "@/lib/server/gardens";
import weed from "../devpost/api-checks/weed-dandelion.json";
const context = { gardenId: "9512afef-4fa6-4e71-8102-56a1f98698f7", gardenRevision: 1, requestId: "142bddcc-b703-44b3-8aeb-d2fdeaa399c5" };
const secret = "simulated-route-signing-secret-32-bytes";
function request(size = 12) {
  const data = new Uint8Array(size); data.set([255,216,255]); const body = new FormData(); body.set("image", new File([data], "plant.jpg", { type: "image/jpeg" }));
  for (const [key, value] of Object.entries(context)) body.set(key, String(value));
  return new Request("http://localhost:3000/api/identifications", { method: "POST", headers: { origin: "http://localhost:3000" }, body });
}
beforeEach(() => {
  vi.clearAllMocks(); vi.stubEnv("APP_SIGNING_SECRET", secret); vi.stubEnv("RAPIDAPI_KEY", "simulated-provider-key");
  mocks.auth.mockResolvedValue({ userId: "owner-a" }); mocks.owned.mockResolvedValue({}); mocks.duplicate.mockResolvedValue(null);
  mocks.provider.mockResolvedValue(weed.response); mocks.save.mockResolvedValue({ id: context.requestId });
});
describe("identification routes with simulated provider and persistence", () => {
  it("rejects absent identity, oversize, and stale garden before spending quota", async () => {
    mocks.auth.mockResolvedValueOnce({ userId: null }); expect((await POST(request())).status).toBe(401);
    expect((await POST(request(3000001))).status).toBe(413);
    mocks.owned.mockRejectedValueOnce(new GardenConflict("Garden changed.")); expect((await POST(request())).status).toBe(409);
    expect(mocks.provider).not.toHaveBeenCalled();
  });
  it("does not save uncertainty and keeps provider failure distinct", async () => {
    const raw = structuredClone(weed.response); raw.result.confidence = 89;
    mocks.provider.mockResolvedValueOnce(raw); expect(await (await POST(request())).json()).toEqual({ outcome: "uncertain" });
    expect(mocks.save).not.toHaveBeenCalled();
    mocks.provider.mockRejectedValueOnce(new Error("simulated provider failure")); expect((await POST(request())).status).toBe(503);
  });
  it("returns a visible confident result and signed retry receipt after database failure", async () => {
    mocks.save.mockRejectedValueOnce(new Error("simulated database failure"));
    const response = await POST(request()); const result = await response.json();
    expect(response.status).toBe(200); expect(result.saveState).toBe("failed"); expect(result.result.classification).toBe("weed"); expect(result.receipt).toBeTruthy();
    const retried = await retry(new Request("http://localhost:3000/api/identifications/retry", { method: "POST", headers: { origin: "http://localhost:3000", "content-type": "application/json" }, body: JSON.stringify({ receipt: result.receipt }) }));
    expect(retried.status).toBe(200); expect((await retried.json()).saveState).toBe("saved"); expect(mocks.provider).toHaveBeenCalledTimes(1);
  });
  it("rejects an old revision on receipt retry without a provider request", async () => {
    const receipt = signIdentification({ userId: "owner-a", context, result: normalizeIdentification(weed.response)! }, secret);
    mocks.save.mockRejectedValueOnce(new GardenConflict("Garden changed."));
    const response = await retry(new Request("http://localhost:3000/api/identifications/retry", { method: "POST", headers: { origin: "http://localhost:3000" }, body: JSON.stringify({ receipt }) }));
    expect(response.status).toBe(409); expect(mocks.provider).not.toHaveBeenCalled();
  });
});
