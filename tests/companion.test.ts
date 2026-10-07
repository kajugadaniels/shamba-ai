import { describe, expect, it } from "vitest";
import { normalizeCompanion } from "@/lib/server/companion";
import four from "../devpost/api-checks/companion-four.json";
import two from "../devpost/api-checks/companion-two-decimal.json";
import type { GardenInput } from "@/lib/types";

const fourInput: GardenInput = { widthM: 3, lengthM: 4, crops: ["tomato", "carrot", "onion", "basil"] };
const twoInput: GardenInput = { widthM: 1.5, lengthM: 2.5, crops: ["tomato", "basil"] };

describe("companion normalization: recorded live fixtures", () => {
  it("represents all four crops without fabricated counts, spacing, or orientation", () => {
    const plan = normalizeCompanion(four.response, fourInput);
    expect(new Set(plan.rows.flatMap((row) => row.crops))).toEqual(new Set(fourInput.crops));
    expect(JSON.stringify(plan)).not.toMatch(/spacingCm|growthStage|northern|full sun|knownConflicts|badPairs|count/);
    expect(plan.relationships.find((pair) => pair.crops.includes("tomato") && pair.crops.includes("onion"))).toMatchObject({ kind: "advisory", evidence: "generated" });
    expect(plan.relationships.some((pair) => /traditional|mixed/i.test(pair.explanation))).toBe(true);
  });
  it("keeps repeated basil rows and decimal dimensions", () => {
    const plan = normalizeCompanion(two.response, twoInput);
    expect(plan.input).toEqual(twoInput);
    expect(plan.rows.filter((row) => row.crops.includes("basil"))).toHaveLength(2);
  });
  it("rejects omitted and extra crops in the map", () => {
    const missing = structuredClone(four.response);
    missing.result.layout.rows = [{ position: "north", plants: ["Tomato"], spacingCm: 60, why: "test" }];
    expect(() => normalizeCompanion(missing, fourInput)).toThrow(/selected crops/);
    const extra = structuredClone(four.response);
    extra.result.layout.rows[0].plants.push("potato");
    expect(() => normalizeCompanion(extra, fourInput)).toThrow(/unsupported crop/);
  });
  it("rejects an incomplete provider envelope rather than inventing rows", () => {
    expect(() => normalizeCompanion({ status: "success", result: {} }, fourInput)).toThrow(/complete garden guide/);
  });
});

describe("simulated conflicts: not observed provider runtime", () => {
  function simulated(evidence: string, plants = ["tomato", "basil"]) {
    return { ...four.response, result: { ...four.response.result, knownConflicts: [{ plants, evidence, reason: "Simulated structured conflict reason" }] } };
  }
  it("strong structured evidence suppresses contradictory generated benefits and separates rows deterministically", () => {
    const raw = simulated("strong");
    const first = normalizeCompanion(raw, fourInput);
    const second = normalizeCompanion(raw, fourInput);
    expect(first.rows).toEqual(second.rows);
    const pair = first.relationships.find((pair) => pair.crops.includes("tomato") && pair.crops.includes("basil"));
    expect(pair).toMatchObject({ kind: "conflict", evidence: "strong", explanation: "Simulated structured conflict reason" });
    const tomatoIndex = first.rows.findIndex((row) => row.crops.includes("tomato"));
    const basilIndex = first.rows.findIndex((row) => row.crops.includes("basil"));
    expect(Math.abs(tomatoIndex - basilIndex)).toBeGreaterThan(1);
  });
  it("traditional evidence wins over a generated negative advisory without adopting strong wording", () => {
    const plan = normalizeCompanion(simulated("traditional", ["tomato", "onion"]), fourInput);
    expect(plan.relationships.find((pair) => pair.crops.includes("tomato") && pair.crops.includes("onion"))).toMatchObject({ kind: "advisory", evidence: "traditional", explanation: "Some gardening guidance suggests keeping these crops apart." });
  });
  it("unknown evidence never becomes a strong conflict", () => {
    expect(normalizeCompanion(simulated("unverified"), fourInput).relationships.every((pair) => pair.kind !== "conflict")).toBe(true);
  });
  it("warns clearly for an unrepresentable two-crop strong conflict", () => {
    const raw = { ...two.response, result: { ...two.response.result, knownConflicts: [{ plants: ["tomato", "basil"], evidence: "strong", reason: "Simulated" }] } };
    expect(() => normalizeCompanion(raw, twoInput)).toThrow(/could not create a clear layout that separates/);
  });
});
