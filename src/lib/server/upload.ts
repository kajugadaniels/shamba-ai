import "server-only";
import { identificationContextSchema } from "@/lib/schemas";
export const IMAGE_LIMIT = 3000000;
export class UploadError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export async function readUpload(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) throw new UploadError(415, "Choose a JPG, PNG, or WEBP photo.");
  const reader = request.body?.getReader(); if (!reader) throw new UploadError(400, "Choose one photo first.");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const part = await reader.read(); if (part.done) break;
    size += part.value.byteLength;
    if (size > IMAGE_LIMIT + 20000) { await reader.cancel(); throw new UploadError(413, "The processed photo must be 3 MB or smaller."); }
    chunks.push(part.value);
  }
  let form: FormData;
  try { form = await new Request(request.url, { method: "POST", headers: { "Content-Type": request.headers.get("content-type")! }, body: Buffer.concat(chunks) }).formData(); }
  catch { throw new UploadError(400, "The photo upload could not be read. Choose another photo."); }
  if ([...form.keys()].some((key) => !["image", "gardenId", "gardenRevision", "requestId"].includes(key)) || [...new Set(form.keys())].some((key) => form.getAll(key).length !== 1)) throw new UploadError(400, "Upload one photo for your saved garden.");
  const parsed = identificationContextSchema.safeParse({ gardenId: form.get("gardenId"), gardenRevision: typeof form.get("gardenRevision") === "string" && /^[1-9]\d*$/.test(String(form.get("gardenRevision"))) ? Number(form.get("gardenRevision")) : NaN, requestId: form.get("requestId") });
  if (!parsed.success) throw new UploadError(400, "Open your saved garden before uploading a photo.");
  const file = form.get("image");
  if (!(file instanceof File) || !file.size) throw new UploadError(400, "Choose one usable photo.");
  if (file.size > IMAGE_LIMIT) throw new UploadError(413, "The processed photo must be 3 MB or smaller.");
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const valid = file.type === "image/jpeg" ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    : file.type === "image/png" ? [137,80,78,71,13,10,26,10].every((byte, index) => bytes[index] === byte)
    : file.type === "image/webp" ? Buffer.from(bytes.slice(0,4)).toString() === "RIFF" && Buffer.from(bytes.slice(8,12)).toString() === "WEBP" : false;
  if (!valid) throw new UploadError(415, "Choose a valid JPG, PNG, or WEBP photo.");
  return { file, context: parsed.data };
}
