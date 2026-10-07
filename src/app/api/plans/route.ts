import { gardenInputSchema } from "@/lib/schemas";
import { CompanionError, normalizeCompanion } from "@/lib/server/companion";
import { serverEnv } from "@/lib/server/env";
import { ProviderError, requestCompanion } from "@/lib/server/rapidapi";
import { signPlan } from "@/lib/server/receipts";

export const runtime = "nodejs";
export const maxDuration = 120;

const headers = { "Cache-Control": "no-store" };
function failure(code: string, message: string, status: number) {
  return Response.json({ error: { code, message } }, { status, headers });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin !== new URL(request.url).origin) return failure("INVALID_ORIGIN", "This request must come from Shamba AI.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return failure("INVALID_FORMAT", "Send garden dimensions and selected crops.", 415);
  // Read a small bounded body before validation; do not trust Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return failure("INVALID_INPUT", "Enter garden dimensions and choose at least two crops.", 400);
  let body: unknown;
  try {
    let size = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) { await reader.cancel(); return failure("INPUT_TOO_LARGE", "The garden request is too large.", 413); }
      chunks.push(value);
    }
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch { return failure("INVALID_INPUT", "Enter valid garden dimensions and crop selections.", 400); }
  const parsed = gardenInputSchema.safeParse(body);
  if (!parsed.success) return failure("INVALID_INPUT", "Use dimensions between 1 and 5 meters and choose two to four different crops.", 400);
  let config: ReturnType<typeof serverEnv>;
  try { config = serverEnv(); }
  catch { return failure("SERVER_CONFIGURATION", "Garden planning is not configured yet. Please try again after setup.", 503); }
  try {
    const raw = await requestCompanion(parsed.data, config.rapidapiKey);
    const plan = normalizeCompanion(raw, parsed.data);
    return Response.json({ plan, receipt: signPlan(plan, config.signingSecret) }, { headers });
  } catch (error) {
    if (error instanceof ProviderError) return failure(error.code, error.message, error.status);
    if (error instanceof CompanionError) return failure(error.code, error.message, 502);
    return failure("GENERATION_FAILED", "We could not create a usable garden guide. Your inputs are still here; try again.", 502);
  }
}
