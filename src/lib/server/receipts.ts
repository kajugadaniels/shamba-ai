import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { planSchema } from "@/lib/schemas";
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
