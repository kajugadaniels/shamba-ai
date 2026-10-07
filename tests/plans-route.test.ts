import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/plans/route";
import { verifyPlan } from "@/lib/server/receipts";
import two from "../devpost/api-checks/companion-two-decimal.json";

const secret = "test-only-signing-secret-not-a-real-credential";
const input = { widthM: 1.5, lengthM: 2.5, crops: ["tomato", "basil"] };
function request(body: unknown = input, origin = "http://localhost:3000") {
  return new Request("http://localhost:3000/api/plans", { method: "POST", headers: { origin, "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
function configure() {
  vi.stubEnv("RAPIDAPI_KEY", "test-only-provider-key");
  vi.stubEnv("APP_SIGNING_SECRET", secret);
}

describe("plan route using mocked transport and recorded responses", () => {
  it("rejects bad inputs and cross-origin requests before any provider call", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    expect((await POST(request({ ...input, widthM: 0 }))).status).toBe(400);
    expect((await POST(request(input, "https://another-site.example"))).status).toBe(403);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("checks actual body size rather than a client-supplied content length", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    expect((await POST(request("x".repeat(5000)))).status).toBe(413);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("does not spend quota if signing configuration is absent", async () => {
    vi.stubEnv("APP_SIGNING_SECRET", "");
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    expect((await POST(request())).status).toBe(503);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("sends the verified decimal format once and exposes only a normalized signed plan", async () => {
    configure();
    const fetcher = vi.fn().mockResolvedValue(Response.json(two.response)); vi.stubGlobal("fetch", fetcher);
    const response = await POST(request());
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(verifyPlan(payload.receipt, secret)).toEqual(payload.plan);
    expect(payload.plan.input).toEqual(input);
    expect(JSON.stringify(payload)).not.toContain("test-only-provider-key");
    expect(JSON.stringify(payload)).not.toMatch(/metadata|spacingCm|growthStage|knownConflicts/);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ plants: "tomato,basil", bedWidthM: "1.5", bedLengthM: "2.5", language: "en" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it.each([429, 401, 500])("sanitizes provider HTTP %s and makes no automatic retry", async (status) => {
    configure();
    const fetcher = vi.fn().mockResolvedValue(new Response("private upstream error body", { status })); vi.stubGlobal("fetch", fetcher);
    const response = await POST(request());
    expect(response.status).toBe(status === 429 ? 429 : 502);
    expect(await response.text()).not.toContain("private upstream");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("distinguishes timeout, malformed JSON, and incomplete result without leaking raw data", async () => {
    configure();
    const fetcher = vi.fn().mockRejectedValueOnce(new DOMException("timeout", "TimeoutError"))
      .mockResolvedValueOnce(new Response("not json"))
      .mockResolvedValueOnce(Response.json({ status: "success", result: {} }));
    vi.stubGlobal("fetch", fetcher);
    expect((await POST(request())).status).toBe(504);
    expect((await POST(request())).status).toBe(502);
    expect((await POST(request())).status).toBe(502);
  });
});
