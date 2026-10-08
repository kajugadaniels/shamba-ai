import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { database } from "@/lib/server/prisma";
import { identificationView } from "@/lib/server/history";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "no-store" };
  try {
    const { userId } = await auth(); if (!userId) return Response.json({ error: { message: "Sign in to view this identification." } }, { status: 401, headers });
    const { id } = await params;
    if (!z.uuid().safeParse(id).success) return Response.json({ error: { message: "Identification not found." } }, { status: 404, headers });
    const record = await database().identification.findFirst({ where: { id, garden: { clerkUserId: userId } } });
    if (!record) return Response.json({ error: { message: "Identification not found." } }, { status: 404, headers });
    return Response.json({ result: identificationView(record) }, { headers });
  } catch { return Response.json({ error: { message: "This identification could not be loaded. Please retry." } }, { status: 503, headers }); }
}
