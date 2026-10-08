import { auth } from "@clerk/nextjs/server";
import { database } from "@/lib/server/prisma";
import { readUpload, UploadError } from "@/lib/server/upload";
import { ownedGarden, saveIdentification, identificationView } from "@/lib/server/history";
import { requestIdentification, ProviderError } from "@/lib/server/rapidapi";
import { normalizeIdentification } from "@/lib/server/identification";
import { signIdentification } from "@/lib/server/receipts";
import { serverEnv } from "@/lib/server/env";
import { GardenConflict } from "@/lib/server/gardens";
export const runtime = "nodejs";
export const maxDuration = 120;
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return json({ error: { message: "Upload from Shamba AI." } }, 403);
  try {
    const { userId } = await auth(); if (!userId) return json({ error: { message: "Sign in before identifying a plant." } }, 401);
    const { file, context } = await readUpload(request); const db = database();
    await ownedGarden(db, userId, context);
    const { rapidapiKey, signingSecret } = serverEnv();
    const duplicate = await db.identification.findFirst({ where: { requestId: context.requestId, gardenId: context.gardenId, gardenRevision: context.gardenRevision } });
    if (duplicate) {
      const record = identificationView(duplicate);
      // A duplicate uses already-saved botanical explanation, not another provider request.
      const evidence = [record.explanation.replace(/^The provider describes: /, "")];
      const { id, gardenId: _gardenId, gardenRevision: _gardenRevision, requestId: _requestId, ...fields } = record;
      void _gardenId; void _gardenRevision; void _requestId;
      const result = { ...fields, evidence };
      return json({ outcome: "identified", result, context, saveState: "saved", id, receipt: signIdentification({ result, context, userId }, signingSecret) });
    }
    const result = normalizeIdentification(await requestIdentification(file, rapidapiKey));
    if (!result) return json({ outcome: "uncertain" });
    const receipt = signIdentification({ userId, context, result }, signingSecret);
    try {
      const record = await saveIdentification(db, userId, context, result);
      return json({ outcome: "identified", result, context, receipt, saveState: "saved", id: record.id });
    } catch (error) {
      return json({ outcome: "identified", result, context, receipt, saveState: "failed", saveMessage: error instanceof GardenConflict ? error.message : "The identification was not saved. Retry saving without analyzing the photo again." });
    }
  } catch (error) {
    const status = error instanceof UploadError || error instanceof ProviderError ? error.status : error instanceof GardenConflict ? 409 : 503;
    return json({ error: { message: error instanceof UploadError || error instanceof ProviderError || error instanceof GardenConflict ? error.message : "Plant identification could not start. Please retry." } }, status);
  }
}
