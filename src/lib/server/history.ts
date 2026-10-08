import "server-only";
import { Prisma, type PrismaClient, type Identification } from "@/generated/prisma/client";
import { z } from "zod";
import { historyItemSchema, identifiedPlantSchema, identificationContextSchema } from "@/lib/schemas";
import { filterGuidance } from "@/lib/guidance";
import { GardenConflict } from "./gardens";

export function identificationView(record: Identification) {
  return historyItemSchema.parse({ ...record, identifiedAt: record.identifiedAt.toISOString(),
    guidance: record.classification === "weed" ? filterGuidance(record.guidance) : [] });
}
export async function ownedGarden(db: PrismaClient, userId: string, context: z.infer<typeof identificationContextSchema>) {
  const garden = await db.garden.findFirst({ where: { id: context.gardenId, clerkUserId: userId } });
  if (!garden || garden.revision !== context.gardenRevision) throw new GardenConflict("Your garden changed. Return to My Garden before identifying another plant.");
  return garden;
}
export async function saveIdentification(db: PrismaClient, userId: string, context: z.infer<typeof identificationContextSchema>, input: z.infer<typeof identifiedPlantSchema>) {
  const result = identifiedPlantSchema.parse(input);
  const guidance = result.classification === "weed" ? filterGuidance(result.guidance) : [];
  if (guidance.length !== result.guidance.length) throw new Error("INVALID_GUIDANCE");
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.$transaction(async (tx) => {
        const garden = await tx.garden.findFirst({ where: { id: context.gardenId, clerkUserId: userId } });
        if (!garden || garden.revision !== context.gardenRevision) throw new GardenConflict("The garden changed, so this identification was not saved. Return to My Garden.");
        const duplicate = await tx.identification.findUnique({ where: { requestId: context.requestId } });
        if (duplicate) {
          if (duplicate.gardenId !== garden.id || duplicate.gardenRevision !== garden.revision) throw new GardenConflict("This identification cannot be attached to this garden.");
          return identificationView(duplicate);
        }
        return identificationView(await tx.identification.create({ data: { ...context, classification: result.classification,
          commonName: result.commonName, scientificName: result.scientificName, confidence: result.confidence,
          explanation: result.explanation, guidance, identifiedAt: new Date(result.identifiedAt) } }));
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 10000, timeout: 10000 });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || !["P2034", "P2002"].includes(error.code) || attempt === 2) throw error;
    }
  }
  throw new Error("SAVE_FAILED");
}
