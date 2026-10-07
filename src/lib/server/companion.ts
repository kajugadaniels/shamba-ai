import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { CROP_IDS, CROPS, type CropId } from "@/lib/crops";
import { gardenInputSchema, planSchema } from "@/lib/schemas";
import type { GardenInput, GardenPlan, Relationship } from "@/lib/types";

const names = z.array(z.string().trim().min(1)).min(1).max(4);
const pairFields = { plants: names, explanation: z.string().max(2000).optional(), benefit: z.string().optional(), problem: z.string().optional() };
const providerSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    plants: z.array(z.object({ name: z.string(), englishName: z.string().optional() })).min(1).max(4),
    goodPairs: z.array(z.object(pairFields)).max(24).default([]),
    badPairs: z.array(z.object(pairFields)).max(24).default([]),
    knownConflicts: z.array(z.object({ plants: names, evidence: z.string(), reason: z.string().max(2000).optional() })).max(24).default([]),
    layout: z.object({ rows: z.array(z.object({ plants: names })).min(1).max(8) }),
  }),
});

export class CompanionError extends Error {
  constructor(public code: string, message: string) { super(message); }
}

function match(name: string): CropId {
  const id = name.trim().toLowerCase();
  if (!CROP_IDS.includes(id as CropId)) throw new CompanionError("INVALID_PLAN", "The provider's guide included an unsupported crop. Try generating again.");
  return id as CropId;
}

function permutations(crops: CropId[]): CropId[][] {
  if (crops.length <= 1) return [crops];
  return crops.flatMap((crop, i) => permutations(crops.filter((_, j) => i !== j)).map((tail) => [crop, ...tail]));
}

// Separation means non-touching row bands. No centimeter distance is implied.
function touching(rows: GardenPlan["rows"], [a, b]: Relationship["crops"]): boolean {
  return rows.some((row, i) => row.crops.includes(a) && rows.some((other, j) => other.crops.includes(b) && Math.abs(i - j) <= 1));
}

function arrange(rows: GardenPlan["rows"], selected: CropId[], pairs: Relationship[]) {
  const strong = pairs.filter((pair) => pair.kind === "conflict");
  const advisory = pairs.filter((pair) => pair.kind === "advisory");
  if (strong.every((pair) => !touching(rows, pair.crops))) return rows;
  // At most 24 orders, two fixed templates, stable first-best selection.
  const candidates = permutations(CROP_IDS.filter((crop) => selected.includes(crop))).flatMap((order) => [
    order.map((crop, i) => ({ id: `row-${i + 1}`, crops: [crop] })),
    [{ id: "row-1", crops: order.slice(0, 2) }, ...order.slice(2).map((crop, i) => ({ id: `row-${i + 2}`, crops: [crop] }))],
  ]);
  let best: GardenPlan["rows"] | undefined;
  let bestScore = Infinity;
  for (const candidate of candidates) {
    if (strong.some((pair) => touching(candidate, pair.crops))) continue;
    const score = advisory.filter((pair) => touching(candidate, pair.crops)).length;
    if (score < bestScore) { best = candidate; bestScore = score; }
  }
  if (!best) {
    const pair = strong[0];
    throw new CompanionError("UNREPRESENTABLE_CONFLICT", `We could not create a clear layout that separates these crops. ${CROPS[pair.crops[0]].name} + ${CROPS[pair.crops[1]].name}: provider code-checked conflict. Change your crop selections and try again.`);
  }
  return best;
}

export function normalizeCompanion(raw: unknown, input: GardenInput): GardenPlan {
  gardenInputSchema.parse(input);
  const parsed = providerSchema.safeParse(raw);
  if (!parsed.success) throw new CompanionError("INVALID_PLAN", "The provider did not return a complete garden guide. Your inputs are still here; try again.");
  const result = parsed.data.result;
  const selected = new Set(input.crops);
  const identities = new Set(result.plants.map((plant) => match(plant.englishName || plant.name)));
  if (identities.size !== selected.size || [...identities].some((crop) => !selected.has(crop))) {
    throw new CompanionError("INVALID_PLAN", "The provider did not include exactly your selected crops. Try again or adjust your selection.");
  }
  const rows = result.layout.rows.map((row, i) => ({ id: `row-${i + 1}`, crops: [...new Set(row.plants.map(match))] }));
  const represented = new Set(rows.flatMap((row) => row.crops));
  if (represented.size !== selected.size || [...represented].some((crop) => !selected.has(crop))) {
    throw new CompanionError("INVALID_PLAN", "The layout did not include exactly your selected crops. Try again or adjust your selection.");
  }
  const pairs = new Map<string, Relationship>();
  const rank = { companion: 0, generated: 1, traditional: 2, strong: 3 };
  function add(plantNames: string[], kind: Relationship["kind"], evidence: Relationship["evidence"], explanation: string) {
    const crops = [...new Set(plantNames.map(match))].sort() as CropId[];
    if (crops.length !== 2 || crops.some((crop) => !selected.has(crop))) return;
    const key = crops.join(":");
    const current = pairs.get(key);
    const weight = kind === "companion" ? rank.companion : rank[evidence];
    const previousWeight = current ? (current.kind === "companion" ? rank.companion : rank[current.evidence]) : -1;
    if (weight > previousWeight) pairs.set(key, { crops: crops as [CropId, CropId], kind, evidence, explanation });
  }
  for (const pair of result.goodPairs) {
    if (pair.explanation?.trim()) add(pair.plants, "companion", "generated", `The provider's companion guidance: ${pair.explanation.trim()}`);
  }
  for (const pair of result.badPairs) {
    // Never echo a generated categorical incompatibility claim.
    add(pair.plants, "advisory", "generated", "The provider recommends separating these crops, but this is not presented as a strongly verified conflict.");
  }
  for (const pair of result.knownConflicts) {
    if (pair.evidence === "strong") add(pair.plants, "conflict", "strong", pair.reason?.trim() || "The provider flags a code-checked conflict. Keep these crops separated in this guide.");
    else add(pair.plants, "advisory", pair.evidence === "traditional" ? "traditional" : "generated", "Some gardening guidance suggests keeping these crops apart.");
  }
  const relationships = [...pairs.values()].sort((a, b) => a.crops.join(":").localeCompare(b.crops.join(":")));
  return planSchema.parse({ version: 1, planId: randomUUID(), mode: "companion-placement-guide", input,
    rows: arrange(rows, input.crops, relationships), relationships });
}
