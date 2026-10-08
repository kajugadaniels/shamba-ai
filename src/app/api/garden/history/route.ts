import { auth } from "@clerk/nextjs/server";
import { identificationView } from "@/lib/server/history";
import { database } from "@/lib/server/prisma";
export const runtime = "nodejs";
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: { message: "Sign in to view your garden history." } }, { status: 401, headers });
    // Ownership is part of the database predicate; no user-supplied identity.
    const history = await database().identification.findMany({
      where: { garden: { clerkUserId: userId } }, orderBy: [{ identifiedAt: "desc" }, { id: "desc" }],
    });
    return Response.json({ history: history.map(identificationView) }, { headers });
  } catch { return Response.json({ error: { message: "Identification history could not be loaded. Please retry." } }, { status: 503, headers }); }
}
