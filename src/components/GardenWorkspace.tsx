"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { gardenInputSchema, planResponseSchema, gardenResponseSchema, savedGardenSchema } from "@/lib/schemas";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { rememberDraft, restoreDraft, forgetDraft } from "@/lib/client/draft";
import { MyGarden } from "./MyGarden";
import { ReplaceGardenDialog } from "./ReplaceGardenDialog";
import type { PlanResponse } from "@/lib/types";
import { GardenForm, type FormErrors, type FormValues } from "./GardenForm";
import { GardenPlan } from "./GardenPlan";
import { PlantIcon } from "./PlantIcon";
import styles from "./GardenWorkspace.module.css";

export function GardenWorkspace({ userId = null, authReady = true, onSignOut }: { userId?: string | null; authReady?: boolean; onSignOut?: () => Promise<void> }) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({ width: "", length: "", crops: [] });
  const [errors, setErrors] = useState<FormErrors>({});
  const [failure, setFailure] = useState("");
  const [draft, setDraft] = useState<PlanResponse | null>(null);
  const [saved, setSaved] = useState<z.infer<typeof savedGardenSchema> | null>(null);
  const [restoring, setRestoring] = useState(Boolean(userId));
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [restoreFailure, setRestoreFailure] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const saveLock = useRef(false);
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const formStart = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => () => controller.current?.abort(), []);

  useEffect(() => {
    const active = new AbortController();
    void Promise.resolve().then(async () => {
      if (active.signal.aborted) return;
      const pending = restoreDraft(userId);
      if (pending) {
        if (userId) forgetDraft();
        setDraft(pending); setEditing(true);
        setValues({ width: String(pending.plan.input.widthM), length: String(pending.plan.input.lengthM), crops: pending.plan.input.crops });
      }
      if (!userId) return;
      setRestoring(true); setRestoreFailure("");
      try {
        const response = await fetch("/api/garden", { cache: "no-store", signal: active.signal });
        if (!response.ok) throw new Error();
        const result = gardenResponseSchema.parse(await response.json());
        if (!active.signal.aborted) { setSaved(result.garden); setRestoring(false); }
      } catch { if (!active.signal.aborted) { setRestoreFailure("Your saved garden could not be loaded. Retry before saving a new plan."); setRestoring(false); } }
    });
    return () => active.abort();
  }, [userId, restoreAttempt]);

  async function save(confirmed = false) {
    if (!draft || !authReady || saveLock.current || restoring || restoreFailure) return;
    if (!userId) {
      try { rememberDraft(draft, null); }
      catch { setFailure("Your browser could not preserve this preview for sign-in. Enable session storage and retry; your preview is still here."); return; }
      router.push("/sign-in"); return;
    }
    if (saved && !confirmed) { setConfirming(true); return; }
    saveLock.current = true; setSaving(true); setFailure("");
    const active = new AbortController(); controller.current = active;
    try {
      const response = await fetch("/api/garden", { method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receipt: draft.receipt, expectedRevision: saved?.revision ?? null, confirmReplacement: confirmed }),
        signal: AbortSignal.any([active.signal, AbortSignal.timeout(20000)]) });
      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setConfirming(false);
          const current = await fetch("/api/garden", { cache: "no-store", signal: AbortSignal.any([active.signal, AbortSignal.timeout(20000)]) });
          if (!current.ok) { setRestoreFailure("Your saved garden changed and could not be reloaded. Retry before replacing it."); }
          else {
            try { setSaved(gardenResponseSchema.parse(await current.json()).garden); }
            catch { setRestoreFailure("Your saved garden changed and could not be reloaded. Retry before replacing it."); }
          }
          setConfirming(false);
        }
        if (response.status === 401) { setSessionExpired(true); try { rememberDraft(draft, userId); } catch { /* The current preview remains available. */ } }
        throw new Error(response.status === 401 ? "Your session ended. Sign in again to save this preview." : payload.error?.message ?? "Your garden was not saved. Retry from this preview.");
      }
      const result = gardenResponseSchema.parse(payload);
      if (!result.garden) throw new Error("The saved garden could not be verified. Retry from this preview.");
      if (!active.signal.aborted) { setSaved(result.garden); setDraft(null); setEditing(false); setConfirming(false); forgetDraft(); }
    } catch (error) {
      if (!active.signal.aborted) setConfirming(false);
      if (!active.signal.aborted) setFailure(error instanceof Error && !["ZodError", "SyntaxError", "TypeError", "TimeoutError"].includes(error.name) ? error.message : "Your garden was not saved. Your preview is still here; retry.");
    } finally { saveLock.current = false; controller.current = null; if (!active.signal.aborted) setSaving(false); }
  }

  function cancelEdit() { setDraft(null); setEditing(false); setFailure(""); setErrors({}); forgetDraft(); }

  async function generate() {
    if (controller.current || saving) return;
    const input = { widthM: values.width.trim() ? Number(values.width) : NaN, lengthM: values.length.trim() ? Number(values.length) : NaN, crops: values.crops };
    const parsed = gardenInputSchema.safeParse(input);
    if (!parsed.success) {
      const next: FormErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] === "widthM" ? "width" : issue.path[0] === "lengthM" ? "length" : "crops";
        next[field] = field === "crops" ? "Choose at least two crops for a companion-planting plan." : `${field === "width" ? "Width" : "Length"} must be between 1 and 5 meters.`;
      }
      setErrors(next); setFailure("");
      document.getElementById(next.width ? "width" : next.length ? "length" : "crops-error")?.focus();
      return;
    }
    setErrors({}); setFailure(""); setBusy(true);
    const active = new AbortController(); controller.current = active;
    try {
      const response = await fetch("/api/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data), signal: AbortSignal.any([active.signal, AbortSignal.timeout(100000)]) });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.error?.message === "string" ? payload.error.message : "We could not generate your guide. Try again.");
      const nextDraft = planResponseSchema.parse(payload);
      setDraft(nextDraft); setEditing(true);
    } catch (error) {
      if (!active.signal.aborted) {
        const name = typeof error === "object" && error !== null && "name" in error ? String(error.name) : "";
        setFailure(name === "TimeoutError" || name === "AbortError" ? "The garden guide took too long. Your inputs are still here; try again."
          : name === "TypeError" ? "We could not connect to the garden planner. Check your connection and try again."
          : error instanceof Error && name !== "ZodError" && name !== "SyntaxError" ? error.message : "We could not create a usable garden guide. Try again.");
      }
    } finally { controller.current = null; if (!active.signal.aborted) setBusy(false); }
  }

  function change() {
    if (saved && !draft) setValues({ width: String(saved.plan.input.widthM), length: String(saved.plan.input.lengthM), crops: saved.plan.input.crops });
    forgetDraft(); setEditing(true); setDraft(null); setFailure("");
    // The form remounts after the preview; focus its heading after the DOM update.
    requestAnimationFrame(() => formStart.current?.focus());
  }

  return <main className={styles.workspace}>
    <header className={styles.brand}><span className={styles.brandIcon}><PlantIcon crop="sprout" /></span><span>Shamba AI</span></header>
    <nav className={styles.account} aria-label="Account">{userId ? <button onClick={() => { controller.current?.abort(); cancelEdit(); setValues({ width: "", length: "", crops: [] }); setSaved(null); void onSignOut?.().catch(() => setFailure("Sign-out could not finish. Please retry.")); }} disabled={saving}>Sign out</button> : <Link href="/sign-in" onClick={(event) => { if (draft) { try { rememberDraft(draft, userId); } catch { event.preventDefault(); setFailure("Your browser could not preserve this preview. Enable session storage before signing in."); } } }}>Sign in</Link>}</nav>
    <div className={styles.intro} ref={formStart} tabIndex={-1}>
      <h1>Plan a small food garden<br className={styles.lineBreak} /> that works better together.</h1>
      <p>A little space. A few crops. A good place to start.</p>
    </div>
    <div role="status" aria-live="polite" className="sr-only">{busy ? "Creating your garden guide. Please wait." : ""}</div>
    {failure ? <div className={styles.error} role="alert"><strong>Let&apos;s try that again</strong><p>{failure}</p>{sessionExpired ? <Link href="/sign-in">Sign in again</Link> : null}</div> : null}
    {restoreFailure ? <div role="alert" className={styles.error}><p>{restoreFailure}</p><button onClick={() => setRestoreAttempt((attempt) => attempt + 1)}>Retry loading garden</button></div> : null}
    {restoring ? <p role="status">Loading your saved garden…</p> : saved && !editing && !draft ? <>
      <MyGarden key={`${saved.id}:${saved.revision}`} plan={saved.plan} onChange={change} />
    </> : draft ? <motion.div key={draft.plan.planId} initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0 }}>
      <GardenPlan plan={draft.plan} onChange={change} onSave={() => { void save(); }} saving={saving} saveDisabled={!authReady || sessionExpired || restoring || Boolean(restoreFailure)} />
    </motion.div> : <GardenForm values={values} errors={errors} busy={busy} onChange={(next) => { setValues(next); setErrors({}); setFailure(""); }} onGenerate={generate} />}
    {saved && editing ? <button className={styles.cancel} disabled={busy || saving} onClick={cancelEdit}>Cancel changes · Back to my garden</button> : null}
    {confirming ? <ReplaceGardenDialog busy={saving} onCancel={() => setConfirming(false)} onConfirm={() => { void save(true); }} /> : null}
    <footer className={styles.footer}><PlantIcon crop="sprout" /><p>Made for small outdoor gardens and raised beds.</p></footer>
  </main>;
}
