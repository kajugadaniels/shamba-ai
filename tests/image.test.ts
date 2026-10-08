import { beforeEach, describe, expect, it, vi } from "vitest";
import { prepareImage, IMAGE_LIMIT } from "@/lib/client/image";
const close = vi.fn();
beforeEach(() => { close.mockClear(); vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 4000, height: 3000, close })); });
const photo = (size: number, type = "image/jpeg") => new File([new Uint8Array(size)], "phone.jpg", { type });
const context = () => ({ fillStyle: "", fillRect: vi.fn(), drawImage: vi.fn() });
describe("bounded browser photo preparation", () => {
  it.each([IMAGE_LIMIT - 1, IMAGE_LIMIT])("keeps a usable %s-byte photo unchanged", async (size) => {
    const file = photo(size); expect(await prepareImage(file)).toBe(file); expect(close).toHaveBeenCalledOnce();
  });
  it("returns a resized processed JPEG while preserving the aspect ratio", async () => {
    const draw = context(); vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(draw as unknown as CanvasRenderingContext2D);
    const encode = vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(function (this: HTMLCanvasElement, callback) {
      expect(this.width).toBe(2048); expect(this.height).toBe(1536); callback(new Blob([new Uint8Array(2900000)], { type: "image/jpeg" }));
    });
    const result = await prepareImage(photo(IMAGE_LIMIT + 1)); expect(result.size).toBeLessThanOrEqual(IMAGE_LIMIT); expect(result.type).toBe("image/jpeg"); expect(encode).toHaveBeenCalledOnce(); expect(close).toHaveBeenCalledOnce();
  });
  it("stops after five compression attempts and releases the decoded image", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context() as unknown as CanvasRenderingContext2D);
    const encode = vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => callback(new Blob([new Uint8Array(IMAGE_LIMIT + 1)], { type: "image/jpeg" })));
    await expect(prepareImage(photo(4000000))).rejects.toThrow("still larger than 3 MB"); expect(encode).toHaveBeenCalledTimes(5); expect(close).toHaveBeenCalledOnce();
  });
  it("rejects unsupported format, decode failure, and export failure", async () => {
    await expect(prepareImage(photo(10, "image/heic"))).rejects.toThrow("JPG, PNG, or WEBP");
    vi.stubGlobal("createImageBitmap", vi.fn().mockRejectedValue(new Error())); await expect(prepareImage(photo(10))).rejects.toThrow("could not be opened");
    vi.stubGlobal("createImageBitmap", vi.fn().mockResolvedValue({ width: 1000, height: 1000, close }));
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(context() as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation((callback) => callback(null)); await expect(prepareImage(photo(4000000))).rejects.toThrow("could not prepare");
  });
});
