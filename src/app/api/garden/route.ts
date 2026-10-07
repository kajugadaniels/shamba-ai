import { auth } from "@clerk/nextjs/server";
import { database } from "@/lib/server/prisma";
import { gardenView, saveGarden, GardenConflict } from "@/lib/server/gardens";
import { verifyPlan } from "@/lib/server/receipts";
import { signingSecret } from "@/lib/server/env";
import { saveGardenSchema } from "@/lib/schemas";

export const runtime = "nodejs";
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
const failure = (message: string, status: number) => json({ error: { message } }, status);
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return failure("Sign in to open your saved garden.", 401);
    const record = await database().garden.findUnique({ where: { clerkUserId: userId } });
    return json({ garden: record ? gardenView(record) : null });
  } catch { return failure("Your saved garden could not be loaded. Please retry.", 503); }
}
export async function PUT(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return failure("Use Shamba AI to save your garden.", 403);
  try {
    const { userId } = await auth();
    if (!userId) return failure("Sign in before saving your garden.", 401);
    if (!request.headers.get("content-type")?.startsWith("application/json")) return failure("Send a garden plan as JSON.", 415);
    // Bound bytes as they arrive; Content-Length is not trusted.
    const reader = request.body?.getReader();
    if (!reader) return failure("A plan receipt is required.", 400);
    const chunks: Uint8Array[] = []; let bytes = 0;
    while (true) {
      const chunk = await reader.read(); if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 45000) { await reader.cancel(); return failure("The garden request is too large.", 413); }
      chunks.push(chunk.value);
    }
    let input;
    try { input = saveGardenSchema.parse(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
    catch { return failure("A valid plan receipt and garden revision are required.", 400); }
    const secret = signingSecret();
    let plan;
    try { plan = verifyPlan(input.receipt, secret); }
    catch { return failure("This plan receipt is invalid or expired. Generate a new plan before saving.", 400); }
    return json({ garden: await saveGarden(database(), userId, plan, input.expectedRevision, input.confirmReplacement) });
  } catch (error) {
    if (error instanceof GardenConflict) return failure(error.message, 409);
    return failure("The garden was not saved. Your preview is still available; please retry.", 503);
  }
}
