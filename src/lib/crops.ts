export const CROP_IDS = ["tomato", "carrot", "onion", "basil"] as const;
export type CropId = (typeof CROP_IDS)[number];
export const CROPS: Record<CropId, { name: string; color: string }> = {
  tomato: { name: "Tomato", color: "#d58269" },
  carrot: { name: "Carrot", color: "#d1a16a" },
  onion: { name: "Onion", color: "#b7a3bd" },
  basil: { name: "Basil", color: "#87ab79" },
};
