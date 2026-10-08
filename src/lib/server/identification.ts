import "server-only";
import { identifiedPlantSchema } from "@/lib/schemas";
import { filterGuidance } from "@/lib/guidance";
import { z } from "zod";

const envelope = z.object({ status: z.literal("success"), result: z.object({
  weed: z.object({ commonName: z.unknown().optional(), scientificName: z.unknown().optional(), family: z.unknown().optional(), plantType: z.unknown().optional(), lifecycle: z.unknown().optional() }),
  isWeed: z.unknown(), confidence: z.unknown(), identificationFeatures: z.unknown().optional(), control: z.object({ mechanical: z.unknown().optional(), cultural: z.unknown().optional() }).optional(),
}) });
const placeholder = /^(unknown|unidentified|n\/?a|none|null|not identified|not available|unspecified)$/i;
const excluded = /\b(edib\w*|culinary|food|eat\w*|poison\w*|toxic\w*|medicin\w*|herbicide\w*|pesticide\w*|spray\w*|chemical\w*|flame\w*|graz\w*|livestock|acid|regulat\w*|invasive|control|remove|removal|mulch|mow\w*|hand[ -]*dig|fork[ -]*out|apply)\b/i;
function text(value: unknown, limit: number) {
  return typeof value === "string" && value.trim() && value.trim().length <= limit && !placeholder.test(value.trim()) ? value.trim() : null;
}
export function isUsableEvidence(value: string) { return Boolean(text(value, 800) && !excluded.test(value)); }
export function normalizeIdentification(raw: unknown, now = new Date()) {
  const response = envelope.safeParse(raw);
  if (!response.success) return null;
  const result = response.data.result;
  if (typeof result.isWeed !== "boolean" || typeof result.confidence !== "number" || !Number.isFinite(result.confidence) || result.confidence < 90 || result.confidence > 100) return null;
  const commonName = text(result.weed.commonName, 160), scientificName = text(result.weed.scientificName, 160);
  if (!commonName && !scientificName) return null;
  const features = Array.isArray(result.identificationFeatures) ? result.identificationFeatures.map((item) => text(item, 350)).filter((item): item is string => Boolean(item && !excluded.test(item))) : [];
  const characteristics = [result.weed.family, result.weed.plantType, result.weed.lifecycle].map((item) => text(item, 160)).filter((item): item is string => Boolean(item && !excluded.test(item)));
  const evidence = (features.length ? features : characteristics).slice(0, 2);
  if (!evidence.length) return null;
  const data = { classification: result.isWeed ? "weed" : "not_weed", commonName, scientificName, confidence: result.confidence, evidence,
    explanation: `The provider describes: ${evidence.join("; ")}`, identifiedAt: now.toISOString(),
    guidance: result.isWeed ? filterGuidance([...(Array.isArray(result.control?.mechanical) ? result.control.mechanical : []), ...(Array.isArray(result.control?.cultural) ? result.control.cultural : [])]) : [] };
  const parsed = identifiedPlantSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}
