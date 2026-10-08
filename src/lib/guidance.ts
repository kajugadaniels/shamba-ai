// Reviewed whole-item advice only. Expanding this list requires explicit review.
const reviewed = [
  "Hand-dig or fork out the entire taproot, especially after rain when soil is soft.",
  "Apply mulch in garden beds to suppress seedling establishment.",
];
const canonical = (text: string) => text.trim().replace(/\s+/g, " ").toLowerCase();
export function filterGuidance(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const accepted = values.filter((value): value is string => typeof value === "string" && reviewed.some((item) => canonical(item) === canonical(value)));
  return [...new Map(accepted.map((item) => [canonical(item), item.trim()])).values()].slice(0, 2);
}
export const guidanceFallback = "No suitable control guidance was provided for this small food garden.";
export const nonWeedMessage = "Shamba AI identified this plant, but the service does not classify it as a weed, so no weed-control guidance is shown.";
