import { describe, expect, it } from "vitest";
import { normalizeIdentification } from "@/lib/server/identification";
import { filterGuidance } from "@/lib/guidance";
import { signIdentification, verifyIdentification } from "@/lib/server/receipts";
import weed from "../devpost/api-checks/weed-dandelion.json";
import basil from "../devpost/api-checks/weed-basil.json";
const context = { gardenId: "9512afef-4fa6-4e71-8102-56a1f98698f7", gardenRevision: 1, requestId: "142bddcc-b703-44b3-8aeb-d2fdeaa399c5" };
const secret = "simulated-identification-secret-32-bytes";
describe("recorded identification evidence and simulated confidence cases", () => {
  it("normalizes the recorded weed and retains only the two approved complete sentences", () => {
    const result = normalizeIdentification(weed.response)!;
    expect(result.classification).toBe("weed"); expect(result.guidance).toHaveLength(2);
    expect(result.guidance.every((item) => /Hand-dig|Apply mulch/.test(item))).toBe(true);
    expect(result.explanation).not.toMatch(/edible|medicinal|livestock/i);
  });
  it("normalizes the recorded non-weed without control guidance", () => {
    const result = normalizeIdentification(basil.response)!;
    expect(result.classification).toBe("not_weed"); expect(result.commonName).toBe("sweet basil"); expect(result.guidance).toEqual([]);
  });
  it.each([89, -1, 101, NaN, Infinity, "98", null, undefined])("rejects simulated invalid or low confidence %s without overallConfidence rescue", (confidence) => {
    const raw = structuredClone(basil.response); Object.assign(raw.result, { confidence, overallConfidence: 100 });
    expect(normalizeIdentification(raw)).toBeNull();
  });
  it("accepts exactly 90 with evidence", () => {
    const raw = structuredClone(basil.response); raw.result.confidence = 90;
    expect(normalizeIdentification(raw)?.confidence).toBe(90);
  });
  it("rejects missing names, classification, or usable botanical evidence", () => {
    const raw = structuredClone(basil.response);
    Object.assign(raw.result, { isWeed: "false" }); expect(normalizeIdentification(raw)).toBeNull();
    Object.assign(raw.result, { isWeed: false, weed: { commonName: "unknown", scientificName: "N/A" } }); expect(normalizeIdentification(raw)).toBeNull();
    Object.assign(raw.result, { weed: { commonName: "Basil" }, identificationFeatures: ["Edible leaves", "Spray chemical herbicide", "N/A"] }); expect(normalizeIdentification(raw)).toBeNull();
  });
  it("uses supplied plant characteristics when features are absent", () => {
    const raw = structuredClone(basil.response); raw.result.identificationFeatures = [];
    expect(normalizeIdentification(raw)?.evidence).toContain("Lamiaceae");
  });
  it("excludes mixed or unreviewed advice instead of extracting acceptable substrings", () => {
    expect(filterGuidance(["Hand-dig or fork out the entire taproot, especially after rain when soil is soft. Then spray herbicide.", "Flame weed", "Use acid", "Apply mulch"])).toEqual([]);
    expect(filterGuidance(["  APPLY MULCH IN GARDEN BEDS TO SUPPRESS SEEDLING ESTABLISHMENT.  "])).toHaveLength(1);
  });
  it("binds result receipts to identity, revision, purpose, signature, and expiry", () => {
    const result = normalizeIdentification(weed.response)!;
    const receipt = signIdentification({ result, context, userId: "owner-a" }, secret, 1000);
    expect(verifyIdentification(receipt, secret, "owner-a", 2000).context).toEqual(context);
    expect(() => verifyIdentification(receipt, secret, "owner-b", 2000)).toThrow();
    expect(() => verifyIdentification(`${receipt}broken`, secret, "owner-a", 2000)).toThrow();
    expect(() => verifyIdentification(receipt, secret, "owner-a", 1000 + 86400000)).toThrow();
  });
  it("revalidates evidence and guidance even for a signed retry receipt", () => {
    const valid = normalizeIdentification(weed.response)!;
    const evidence = ["Spray chemical herbicide on the leaves."];
    const unsafeEvidence = signIdentification({ userId: "owner-a", context, result: { ...valid, evidence, explanation: `The provider describes: ${evidence.join("; ")}` } }, secret);
    expect(() => verifyIdentification(unsafeEvidence, secret, "owner-a")).toThrow("INVALID_RESULT");
    const unsafeGuidance = signIdentification({ userId: "owner-a", context, result: { ...valid, guidance: ["Use concentrated acid."] } }, secret);
    expect(() => verifyIdentification(unsafeGuidance, secret, "owner-a")).toThrow("INVALID_RESULT");
  });

});
