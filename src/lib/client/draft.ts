import { z } from "zod";
import { planResponseSchema } from "@/lib/schemas";

const key = "shamba.pending-garden.v1";
const schema = z.object({ version: z.literal(1), owner: z.string().nullable(), pendingSave: z.literal(true), draft: planResponseSchema }).strict();
export function rememberDraft(draft: z.infer<typeof planResponseSchema>, owner: string | null) {
  const data = JSON.stringify(schema.parse({ version: 1, owner, pendingSave: true, draft }));
  if (data.length > 80000) throw new Error("Draft is too large to preserve.");
  sessionStorage.setItem(key, data);
}
export function restoreDraft(owner: string | null) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw || raw.length > 80000) { forgetDraft(); return null; }
    const result = schema.safeParse(JSON.parse(raw));
    if (!result.success) { forgetDraft(); return null; }
    if (result.data.owner !== null && owner === null) return null;
    if (result.data.owner !== null && result.data.owner !== owner) { forgetDraft(); return null; }
    // Claim the public draft when sign-in completes; it cannot move to another account.
    if (owner) rememberDraft(result.data.draft, owner);
    return result.data.draft;
  } catch { return null; }
}
export function forgetDraft() { try { sessionStorage.removeItem(key); } catch { /* No private database data is cached here. */ } }
