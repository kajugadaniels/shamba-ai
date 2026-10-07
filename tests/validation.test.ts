import { describe, expect, it } from "vitest";
import { gardenInputSchema } from "@/lib/schemas";

describe("garden inputs", () => {
  it.each([[1, 5], [5, 1], [1.5, 2.5]])("accepts inclusive boundaries and decimals %s × %s", (widthM, lengthM) => {
    expect(gardenInputSchema.safeParse({ widthM, lengthM, crops: ["tomato", "basil"] }).success).toBe(true);
  });
  it.each([0.99, 5.01, NaN, Infinity, -Infinity, "", "2", null])("rejects invalid dimension %s", (widthM) => {
    expect(gardenInputSchema.safeParse({ widthM, lengthM: 2, crops: ["tomato", "basil"] }).success).toBe(false);
  });
  it.each([[], ["tomato"], ["tomato", "tomato"], ["tomato", "potato"], ["tomato", "carrot", "onion", "basil", "tomato"]].map((crops) => ({ crops })))("rejects invalid crop selections $crops", ({ crops }) => {
    expect(gardenInputSchema.safeParse({ widthM: 2, lengthM: 3, crops }).success).toBe(false);
  });
});
