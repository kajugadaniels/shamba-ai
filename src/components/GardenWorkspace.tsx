"use client";

import { useEffect, useRef, useState } from "react";
import { gardenInputSchema, planResponseSchema, gardenResponseSchema, savedGardenSchema } from "@/lib/schemas";
import { z } from "zod";
import { rememberDraft, restoreDraft, forgetDraft } from "@/lib/client/draft";
import { PlantUpload } from "./PlantUpload";
import { HistoricalResult } from "./HistoricalResult";
import { MyGarden } from "./MyGarden";
import { GardenProgressDialog } from "./GardenProgressDialog";
import { ReplaceGardenDialog } from "./ReplaceGardenDialog";
import type { PlanResponse } from "@/lib/types";
import { GardenForm, type FormErrors, type FormValues } from "./GardenForm";
import { GardenPlan } from "./GardenPlan";
import { usePageLoading } from "./GlobalLoading";
import { Button } from "./Button";
import { AlertIcon, BrandMark, LogOutIcon, PencilIcon, RefreshIcon } from "./Icons";
import styles from "./GardenWorkspace.module.css";

export function GardenWorkspace({ userId = null, authReady = true, onSignOut, onSignIn }: { userId?: string | null; authReady?: boolean; onSignOut?: () => Promise<void>; onSignIn?: () => void }) {
  const [values, setValues] = useState<FormValues>({ width: "", length: "", crops: [] });
  const [errors, setErrors] = useState<FormErrors>({});
  const [failure, setFailure] = useState("");
  const [draft, setDraft] = useState<PlanResponse | null>(null);
  const [saved, setSaved] = useState<z.infer<typeof savedGardenSchema> | null>(null);
  const [restoring, setRestoring] = useState(Boolean(userId));
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [restoreFailure, setRestoreFailure] = useState("");
  const [identifying, setIdentifying] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const saveLock = useRef(false);
  const [signingOut, setSigningOut] = useState(false);
  const signOutLock = useRef(false);
  const mounted = useRef(true);
  const restorationController = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const formStart = useRef<HTMLDivElement>(null);
  usePageLoading(!authReady || restoring || saving || signingOut,
    !authReady ? "Connecting your account…" : restoring ? "Loading your saved garden…" : saving ? (confirming ? "Replacing your garden…" : "Saving your garden…") : signingOut ? "Signing out…" : "Creating your garden guide…");
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; controller.current?.abort(); }; }, []);

  useEffect(() => {
    const active = new AbortController();
    restorationController.current = active;
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

  async function signOut() {
    if (!onSignOut || signOutLock.current) return;
    signOutLock.current = true; setSigningOut(true);
    controller.current?.abort(); restorationController.current?.abort();
    cancelEdit(); setIdentifying(false); setDetailId(null); setConfirming(false); setBusy(false);
    setValues({ width: "", length: "", crops: [] }); setSaved(null); setRestoring(false); setRestoreFailure("");
    try { await onSignOut(); }
    catch {
      // Reload through the owned endpoint; never reinstate a cached private snapshot.
      // The identity-keyed parent unmounts this workspace if the account changes.
      if (mounted.current) {
        setFailure("Sign-out could not finish. Your saved garden is being reloaded; please retry signing out.");
        setRestoring(true); setRestoreAttempt((attempt) => attempt + 1);
      }
    } finally { signOutLock.current = false; if (mounted.current) setSigningOut(false); }
  }

  function signIn() {
    if (!authReady || !onSignIn) return;
    try { if (draft) rememberDraft(draft, userId); }
    catch { setFailure("Your browser could not preserve this preview. Enable session storage before signing in."); return; }
    onSignIn();
  }

  async function save(confirmed = false) {
    if (!draft || !authReady || saveLock.current || restoring || restoreFailure) return;
    if (!userId) { signIn(); return; }
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
      if (!active.signal.aborted) { setDraft(nextDraft); setEditing(true); }
    } catch (error) {
      if (!active.signal.aborted) {
        const name = typeof error === "object" && error !== null && "name" in error ? String(error.name) : "";
        setFailure(name === "TimeoutError" || name === "AbortError" ? "The garden guide took too long. Your inputs are still here; try again."
          : name === "TypeError" ? "We could not connect to the garden planner. Check your connection and try again."
          : error instanceof Error && name !== "ZodError" && name !== "SyntaxError" ? error.message : "We could not create a usable garden guide. Try again.");
      }
    } finally {
      // A canceled request must not release a newer request's lock.
      if (controller.current === active) { controller.current = null; if (!active.signal.aborted) setBusy(false); }
    }
  }

  function cancelGeneration() {
    if (!busy) return;
    controller.current?.abort(); controller.current = null;
    setBusy(false);
  }

  function change() {
    if (saved && !draft) setValues({ width: String(saved.plan.input.widthM), length: String(saved.plan.input.lengthM), crops: saved.plan.input.crops });
    forgetDraft(); setEditing(true); setDraft(null); setFailure("");
    // The form remounts after the preview; focus its heading after the DOM update.
    requestAnimationFrame(() => formStart.current?.focus());
  }

  const view = restoring ? "loading" : saved && identifying ? "identify" : saved && detailId ? "detail" : saved && !editing && !draft ? "garden" : draft ? "plan" : "form";
  const notices = <>
    {failure ? <div className={styles.alert} role="alert"><AlertIcon /><div><strong>Let&apos;s try that again</strong><p>{failure}</p>{sessionExpired ? <Button variant="primary" size="sm" onClick={signIn} disabled={!authReady}>Sign in again</Button> : null}</div></div> : null}
    {restoreFailure || (restoreAttempt > 0 && restoring) ? <div role={restoreFailure ? "alert" : undefined} className={restoreFailure ? styles.alert : styles.retry}>{restoreFailure ? <AlertIcon /> : null}<div>{restoreFailure ? <p>{restoreFailure}</p> : null}<Button size="sm" loading={restoring} onClick={() => { setRestoring(true); setRestoreAttempt((attempt) => attempt + 1); }}><RefreshIcon />Retry loading garden</Button></div></div> : null}
    {saved && editing ? <div className={styles.editing}>
      <PencilIcon /><p><strong>You&apos;re editing your saved garden.</strong> Nothing changes until you save a new plan and confirm the replacement.</p>
      <Button variant="outline" size="sm" aria-label="Cancel changes and return to my garden" disabled={busy || saving} onClick={cancelEdit}>Cancel changes</Button>
    </div> : null}
  </>;

  return <div className={styles.shell}>
    <header className={styles.topbar}>
      <div className={styles.topbarInner}>
        <span className={styles.brand}><BrandMark className={styles.brandMark} /><span>Shamba AI</span></span>
        <nav className={styles.account} aria-label="Account">{userId ? <Button size="sm" onClick={() => { void signOut(); }} disabled={saving} loading={signingOut}><LogOutIcon />Sign out</Button> : <Button size="sm" onClick={signIn} disabled={!authReady}>Sign in</Button>}</nav>
      </div>
    </header>
    <main className={styles.workspace} data-view={view}>
      {view === "form" ? <>
        <div className={styles.intro} ref={formStart} tabIndex={-1}>
          <h1>Plan a small food garden that works better together.</h1>
          <p>Tell us the size of your bed and the crops you want to grow. We&apos;ll suggest where each crop goes. No account needed.</p>
        </div>
        {notices}
        <GardenForm values={values} errors={errors} busy={busy} onChange={(next) => { setValues(next); setErrors({}); setFailure(""); }} onGenerate={generate} />
      </> : <>
        <h1 className="sr-only">Shamba AI</h1>
        {notices}
        {view === "identify" && saved ? <PlantUpload garden={saved} onSignIn={onSignIn} onBack={() => setIdentifying(false)} />
          : view === "detail" && detailId ? <HistoricalResult id={detailId} onBack={() => setDetailId(null)} />
          : view === "garden" && saved ? <MyGarden key={`${saved.id}:${saved.revision}`} plan={saved.plan} onChange={change} onIdentify={() => setIdentifying(true)} onDetails={setDetailId} />
          : view === "plan" && draft ? <GardenPlan key={draft.plan.planId} plan={draft.plan} onChange={change} onSave={() => { void save(); }} saving={saving} saveDisabled={!authReady || sessionExpired || restoring || Boolean(restoreFailure)} />
          : view === "loading" ? <div className={styles.skeleton} aria-hidden="true"><span /><span /><span /><span /></div>
          : null}
      </>}
      {busy ? <GardenProgressDialog width={values.width} length={values.length} crops={values.crops} onCancel={cancelGeneration} /> : null}
      {confirming ? <ReplaceGardenDialog busy={saving} onCancel={() => setConfirming(false)} onConfirm={() => { void save(true); }} /> : null}
    </main>
    <footer className={styles.footer}>
      <div className={styles.footerInner}><p>Made for small outdoor gardens and raised beds.</p></div>
    </footer>
  </div>;
}
