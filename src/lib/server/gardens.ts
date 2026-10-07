import "server-only";
import type { PrismaClient, Garden } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { savedGardenSchema } from "@/lib/schemas";
import type { GardenPlan } from "@/lib/types";

export class GardenConflict extends Error {}
export function gardenView(record: Garden) {
  // Validate stored JSON; corrupt records must never become an empty garden.
  return savedGardenSchema.parse({ id: record.id, revision: record.revision, plan: record.plan,
    createdAt: record.createdAt.toISOString(), updatedAt: record.updatedAt.toISOString() });
}
export async function saveGarden(db: PrismaClient, userId: string, plan: GardenPlan, expectedRevision: number | null, confirmed: boolean) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.$transaction(async (tx) => {
        const current = await tx.garden.findUnique({ where: { clerkUserId: userId } });
        // An ambiguous network retry of the same plan must not delete newer history.
        if (current?.planId === plan.planId) return gardenView(current);
        if (current ? !confirmed || expectedRevision !== current.revision : expectedRevision !== null) {
          throw new GardenConflict("The saved garden changed or replacement was not confirmed. Review your saved garden before trying again.");
        }
        const data = { widthM: plan.input.widthM, lengthM: plan.input.lengthM, crops: plan.input.crops,
          plan: plan as unknown as Prisma.InputJsonValue, planId: plan.planId };
        if (!current) return gardenView(await tx.garden.create({ data: { ...data, clerkUserId: userId } }));
        await tx.identification.deleteMany({ where: { gardenId: current.id } });
        return gardenView(await tx.garden.update({ where: { id: current.id }, data: { ...data, revision: { increment: 1 } } }));
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 10000, timeout: 10000 });
    } catch (error) {
      const retryable = error instanceof Prisma.PrismaClientKnownRequestError && ["P2034", "P2002"].includes(error.code);
      if (!retryable || attempt === 2) throw error;
    }
  }
  throw new Error("SAVE_FAILED");
}
