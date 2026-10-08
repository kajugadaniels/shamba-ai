import { z } from "zod";
import { CROP_IDS } from "./crops";

export const cropSchema = z.enum(CROP_IDS);
export const gardenInputSchema = z.object({
  widthM: z.number().min(1, "Width must be between 1 and 5 meters.").max(5, "Width must be between 1 and 5 meters."),
  lengthM: z.number().min(1, "Length must be between 1 and 5 meters.").max(5, "Length must be between 1 and 5 meters."),
  crops: z.array(cropSchema).min(2, "Choose at least two crops for a companion-planting plan.").max(4)
    .refine((crops) => new Set(crops).size === crops.length, "Choose each crop only once."),
}).strict();

export const relationshipSchema = z.object({
  crops: z.tuple([cropSchema, cropSchema]).refine(([a, b]) => a !== b),
  kind: z.enum(["companion", "advisory", "conflict"]),
  evidence: z.enum(["generated", "traditional", "strong"]),
  explanation: z.string().trim().min(1).max(2000),
});

export const planSchema = z.object({
  version: z.literal(1),
  planId: z.uuid(),
  mode: z.literal("companion-placement-guide"),
  input: gardenInputSchema,
  rows: z.array(z.object({ id: z.string().min(1), crops: z.array(cropSchema).min(1).max(4) })).min(1).max(8),
  relationships: z.array(relationshipSchema).max(6),
}).strict().superRefine((plan, ctx) => {
  const selected = new Set(plan.input.crops);
  const represented = new Set(plan.rows.flatMap((row) => row.crops));
  if (selected.size !== represented.size || [...represented].some((crop) => !selected.has(crop))) {
    ctx.addIssue({ code: "custom", message: "The map must represent exactly the selected crops." });
  }
  if (plan.relationships.some((pair) => pair.crops.some((crop) => !selected.has(crop)))) {
    ctx.addIssue({ code: "custom", message: "Companion notes must use selected crops." });
  }
  if (new Set(plan.rows.map((row) => row.id)).size !== plan.rows.length) {
    ctx.addIssue({ code: "custom", message: "Map row IDs must be unique." });
  }
  for (const pair of plan.relationships) {
    if ((pair.kind === "conflict") !== (pair.evidence === "strong")) {
      ctx.addIssue({ code: "custom", message: "Only strong evidence can be a conflict warning." });
    }
  }
});

export const planResponseSchema = z.object({ plan: planSchema, receipt: z.string().min(1).max(40000) });

export const savedGardenSchema = z.object({
  id: z.uuid(), revision: z.number().int().positive(), plan: planSchema,
  createdAt: z.iso.datetime(), updatedAt: z.iso.datetime(),
}).strict();
export const gardenResponseSchema = z.object({ garden: savedGardenSchema.nullable() }).strict();
export const saveGardenSchema = z.object({
  receipt: z.string().min(1).max(40000),
  expectedRevision: z.number().int().positive().nullable(),
  confirmReplacement: z.boolean(),
}).strict();

const plantName = z.string().trim().min(1).max(160).refine((value) => !/^(unknown|unidentified|n\/?a|none|null|not identified)$/i.test(value));
const identifiedPlantBase = z.object({
  classification: z.enum(["weed", "not_weed"]), commonName: plantName.nullable(), scientificName: plantName.nullable(),
  confidence: z.number().min(90).max(100), evidence: z.array(z.string().trim().min(1).max(800)).min(1).max(2),
  explanation: z.string().trim().min(1).max(800), guidance: z.array(z.string().max(300)).max(2),
  identifiedAt: z.iso.datetime(),
}).strict();
export const identifiedPlantSchema = identifiedPlantBase.refine((value) => value.commonName !== null || value.scientificName !== null);
export const identificationContextSchema = z.object({ gardenId: z.uuid(), gardenRevision: z.number().int().positive(), requestId: z.uuid() }).strict();
export const historyItemSchema = identifiedPlantBase.omit({ evidence: true }).extend({ id: z.uuid(), gardenId: z.uuid(), gardenRevision: z.number().int().positive(), requestId: z.uuid() }).refine((value) => value.commonName !== null || value.scientificName !== null);
export const identificationResponseSchema = z.discriminatedUnion("outcome", [
  z.object({ outcome: z.literal("uncertain") }).strict(),
  z.object({ outcome: z.literal("identified"), result: identifiedPlantSchema, context: identificationContextSchema,
    saveState: z.enum(["saved", "failed"]), receipt: z.string().min(1).max(12000), saveMessage: z.string().optional(), id: z.uuid().optional() }).strict(),
]);
