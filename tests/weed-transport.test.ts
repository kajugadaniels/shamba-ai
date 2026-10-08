// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { requestIdentification } from "@/lib/server/rapidapi";
import basil from "../devpost/api-checks/weed-basil.json";
describe("simulated weed provider transport", () => {
  it("forwards a temporary image with the verified fields and no invented crop/location", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json(basil.response)); vi.stubGlobal("fetch", fetcher);
    const file = new File([new Uint8Array([255,216,255])], "private-user-filename.jpg", { type: "image/jpeg" });
    await requestIdentification(file, "simulated-test-key");
    const [url, options] = fetcher.mock.calls[0]; expect(url).toContain("weed-identification-api-ai-weed-detection-control");
    expect(options.headers["Content-Type"]).toBeUndefined();
    expect([...options.body.keys()]).toEqual(["image", "language", "system"]);
    expect(options.body.get("system")).toBe("garden"); expect(options.body.get("image").name).toBe("plant.jpg");
  });
  it("does not retry throttling or unreadable success responses", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response("", { status: 429 })).mockResolvedValueOnce(Response.json({ status: "error" })); vi.stubGlobal("fetch", fetcher);
    const file = new File(["image"], "image.jpg", { type: "image/jpeg" });
    await expect(requestIdentification(file, "simulated-test-key")).rejects.toMatchObject({ status: 429 }); expect(fetcher).toHaveBeenCalledTimes(1);
    await expect(requestIdentification(file, "simulated-test-key")).rejects.toMatchObject({ status: 502 }); expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
