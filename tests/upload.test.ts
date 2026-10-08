// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readUpload, IMAGE_LIMIT } from "@/lib/server/upload";
function request(size: number, mime = "image/jpeg", signature = [255,216,255]) {
  const bytes = new Uint8Array(size); bytes.set(signature);
  const body = new FormData(); body.set("image", new File([bytes], "plant.jpg", { type: mime }));
  body.set("gardenId", "9512afef-4fa6-4e71-8102-56a1f98698f7"); body.set("gardenRevision", "1"); body.set("requestId", "142bddcc-b703-44b3-8aeb-d2fdeaa399c5");
  return new Request("http://localhost:3000/api/identifications", { method: "POST", body });
}
describe("independent server upload validation", () => {
  it("accepts exactly 3,000,000 bytes", async () => { expect((await readUpload(request(IMAGE_LIMIT))).file.size).toBe(IMAGE_LIMIT); });
  it("rejects a photo one byte over the cap", async () => { await expect(readUpload(request(IMAGE_LIMIT + 1))).rejects.toMatchObject({ status: 413 }); });
  it("rejects unsupported MIME and mismatched signatures", async () => {
    await expect(readUpload(request(20, "image/heic"))).rejects.toMatchObject({ status: 415 });
    await expect(readUpload(request(20, "image/png"))).rejects.toMatchObject({ status: 415 });
  });
  it("accepts PNG and WEBP signatures", async () => {
    expect((await readUpload(request(20, "image/png", [137,80,78,71,13,10,26,10]))).file.type).toBe("image/png");
    expect((await readUpload(request(20, "image/webp", [82,73,70,70,0,0,0,0,87,69,66,80]))).file.type).toBe("image/webp");
  });
});
