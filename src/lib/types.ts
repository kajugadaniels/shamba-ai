import type { z } from "zod";
import type { gardenInputSchema, planSchema, planResponseSchema, relationshipSchema } from "./schemas";

export type GardenInput = z.infer<typeof gardenInputSchema>;
export type GardenPlan = z.infer<typeof planSchema>;
export type PlanResponse = z.infer<typeof planResponseSchema>;
export type Relationship = z.infer<typeof relationshipSchema>;
