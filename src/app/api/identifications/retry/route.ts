import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { database } from "@/lib/server/prisma";
import { verifyIdentification } from "@/lib/server/receipts";
import { signingSecret } from "@/lib/server/env";
import { saveIdentification } from "@/lib/server/history";
import { GardenConflict } from "@/lib/server/gardens";
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return json({ error: { message: "Retry from Shamba AI." } }, 403);
  try {
    const { userId } = await auth(); if (!userId) return json({ error: { message: "Sign in again before retrying the save." } }, 401);
    const reader = request.body?.getReader(); if (!reader) return json({ error: { message: "A result receipt is required." } }, 400);
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 13000) { await reader.cancel(); return json({ error: { message: "The save request is too large." } }, 413); } chunks.push(part.value); }
    let receipt;
    try { receipt = z.object({ receipt: z.string().min(1).max(12000) }).strict().parse(JSON.parse(Buffer.concat(chunks).toString("utf8"))).receipt; }
    catch { return json({ error: { message: "A valid result receipt is required." } }, 400); }
    const secret = signingSecret(); let data;
    try { data = verifyIdentification(receipt, secret, userId); }
    catch { return json({ error: { message: "This result receipt is invalid or expired. A new identification is needed." } }, 400); }
    const saved = await saveIdentification(database(), userId, data.context, data.result);
    return json({ outcome: "identified", result: data.result, context: data.context, receipt, saveState: "saved", id: saved.id });
  } catch (error) { return json({ error: { message: error instanceof GardenConflict ? error.message : "The identification was not saved. Please retry saving." } }, error instanceof GardenConflict ? 409 : 503); }
}
