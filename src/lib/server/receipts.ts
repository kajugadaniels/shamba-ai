import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { isUsableEvidence } from "./identification";
import { filterGuidance } from "@/lib/guidance";
import { identificationContextSchema, identifiedPlantSchema, planSchema } from "@/lib/schemas";
import type { GardenPlan } from "@/lib/types";

const receiptSchema = z.object({ purpose: z.literal("garden-plan"), expiresAt: z.number().int(), plan: planSchema }).strict();
const lifetime = 24 * 60 * 60 * 1000;

export function signPlan(plan: GardenPlan, secret: string, now = Date.now()): string {
  const data = receiptSchema.parse({ purpose: "garden-plan", expiresAt: now + lifetime, plan });
  const body = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${body}.${createHmac("sha256", secret).update(body).digest("base64url")}`;
}

export function verifyPlan(receipt: string, secret: string, now = Date.now()): GardenPlan {
  if (receipt.length > 40000) throw new Error("INVALID_RECEIPT");
  const [body, signature, extra] = receipt.split(".");
  if (!body || !signature || extra !== undefined || !/^[\w-]+$/.test(body) || !/^[\w-]+$/.test(signature)) throw new Error("INVALID_RECEIPT");
  const expected = createHmac("sha256", secret).update(body).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error("INVALID_RECEIPT");
  const parsed = receiptSchema.parse(JSON.parse(Buffer.from(body, "base64url").toString("utf8")));
  if (parsed.expiresAt <= now) throw new Error("EXPIRED_RECEIPT");
  return parsed.plan;
}

const resultReceiptSchema = z.object({ purpose: z.literal("plant-identification"), expiresAt: z.number().int(), userId: z.string().min(1), context: identificationContextSchema, result: identifiedPlantSchema }).strict();
export function signIdentification(data: Omit<z.infer<typeof resultReceiptSchema>, "purpose" | "expiresAt">, secret: string, now = Date.now()) {
  const body = Buffer.from(JSON.stringify(resultReceiptSchema.parse({ ...data, purpose: "plant-identification", expiresAt: now + lifetime }))).toString("base64url");
  return `${body}.${createHmac("sha256", secret).update(body).digest("base64url")}`;
}
export function verifyIdentification(receipt: string, secret: string, userId: string, now = Date.now()) {
  if (receipt.length > 12000) throw new Error("INVALID_RECEIPT");
  const [body, signature, extra] = receipt.split(".");
  if (!body || !signature || extra !== undefined || !/^[\w-]+$/.test(body) || !/^[\w-]+$/.test(signature)) throw new Error("INVALID_RECEIPT");
  const expected = createHmac("sha256", secret).update(body).digest(), actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error("INVALID_RECEIPT");
  const data = resultReceiptSchema.parse(JSON.parse(Buffer.from(body, "base64url").toString("utf8")));
  if (data.userId !== userId || data.expiresAt <= now) throw new Error("INVALID_RECEIPT");
  if (data.result.classification === "not_weed" && data.result.guidance.length || filterGuidance(data.result.guidance).length !== data.result.guidance.length || data.result.evidence.some((item) => !isUsableEvidence(item))) throw new Error("INVALID_RESULT");
  if (data.result.explanation !== `The provider describes: ${data.result.evidence.join("; ")}`) throw new Error("INVALID_RESULT");
  return data;
}
