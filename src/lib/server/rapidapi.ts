import "server-only";
import type { GardenInput } from "@/lib/types";

const host = "companion-planting-api-ai-garden-planner-layout.p.rapidapi.com";
export class ProviderError extends Error {
  constructor(public code: string, public status: number, message: string) { super(message); }
}

export async function requestCompanion(input: GardenInput, key: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`https://${host}/analyze`, {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(90000),
      headers: { "Content-Type": "application/json", "X-RapidAPI-Key": key, "X-RapidAPI-Host": host },
      body: JSON.stringify({ plants: input.crops.join(","), bedWidthM: String(input.widthM), bedLengthM: String(input.lengthM), language: "en" }),
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "name" in error && ["TimeoutError", "AbortError"].includes(String(error.name))) throw new ProviderError("PROVIDER_TIMEOUT", 504, "The garden guide took too long. Your inputs are still here; try again.");
    throw new ProviderError("PROVIDER_UNAVAILABLE", 502, "We could not reach the garden planner. Try again shortly.");
  }
  if (response.status === 429) throw new ProviderError("PROVIDER_QUOTA", 429, "The garden planner has reached its request limit. Try again when requests are available.");
  if (!response.ok) throw new ProviderError("PROVIDER_UNAVAILABLE", 502, "The garden planner could not complete this request. Your inputs are still here; try again.");
  // Bound upstream response memory and reject invalid JSON without exposing it.
  const reader = response.body?.getReader();
  if (!reader) throw new ProviderError("INVALID_PROVIDER_RESPONSE", 502, "The garden planner returned an incomplete response. Try again.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 256000) { await reader.cancel(); throw new Error("RESPONSE_TOO_LARGE"); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ProviderError("INVALID_PROVIDER_RESPONSE", 502, "The garden planner returned an incomplete response. Try again.");
  }
}

export async function requestIdentification(file: File, key: string): Promise<unknown> {
  const weedHost = "weed-identification-api-ai-weed-detection-control.p.rapidapi.com";
  const body = new FormData(); body.set("image", file, file.type === "image/png" ? "plant.png" : file.type === "image/webp" ? "plant.webp" : "plant.jpg"); body.set("language", "en"); body.set("system", "garden");
  try {
    const response = await fetch(`https://${weedHost}/analyze`, { method: "POST", cache: "no-store", signal: AbortSignal.timeout(90000),
      headers: { "X-RapidAPI-Key": key, "X-RapidAPI-Host": weedHost }, body });
    if (response.status === 429) throw new ProviderError("PROVIDER_QUOTA", 429, "Plant identification has reached its request limit. Try again when requests are available.");
    if (!response.ok) throw new ProviderError("PROVIDER_UNAVAILABLE", 502, "Plant identification could not complete. Please retry.");
    const reader = response.body?.getReader(); if (!reader) throw new Error();
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength;
      if (size > 256000) { await reader.cancel(); throw new Error(); } chunks.push(part.value); }
    const result: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (typeof result !== "object" || !result || !("status" in result) || result.status !== "success") throw new Error();
    return result;
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    const timeout = typeof error === "object" && error && "name" in error && ["TimeoutError", "AbortError"].includes(String(error.name));
    throw new ProviderError(timeout ? "PROVIDER_TIMEOUT" : "PROVIDER_UNAVAILABLE", timeout ? 504 : 502, timeout ? "Plant identification took too long. Please retry." : "Plant identification is unavailable or returned an unreadable response. Please retry.");
  }
}
