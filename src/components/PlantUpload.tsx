/* eslint-disable @next/next/no-img-element -- Blob URLs are temporary processed previews. */
"use client";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { identificationResponseSchema, savedGardenSchema } from "@/lib/schemas";
import { prepareImage } from "@/lib/client/image";
import { IdentificationResult } from "./IdentificationResult";
import { usePageLoading } from "./GlobalLoading";
import styles from "./PlantUpload.module.css";
type ResponseData = z.infer<typeof identificationResponseSchema>;
export function PlantUpload({ garden, onBack, onSignIn }: { garden: z.infer<typeof savedGardenSchema>; onBack: () => void; onSignIn?: () => void }) {
  const [file, setFile] = useState<File | null>(null), [preview, setPreview] = useState("");
  const [preparing, setPreparing] = useState(false), [busy, setBusy] = useState(false), [failure, setFailure] = useState("");
  const [outcome, setOutcome] = useState<ResponseData | null>(null), [retryUnavailable, setRetryUnavailable] = useState(false);
  usePageLoading(preparing || busy, preparing ? "Preparing your photo…" : outcome?.outcome === "identified" ? "Saving identification…" : "Identifying your plant…");
  const mounted = useRef(true);
  const sequence = useRef(0), controller = useRef<AbortController | null>(null), lock = useRef(false), requestId = useRef<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { mounted.current = true; heading.current?.focus(); return () => { mounted.current = false; controller.current?.abort(); }; }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  async function choose(source: File | undefined) {
    const generation = ++sequence.current; setFile(null); setPreview(""); setOutcome(null); setFailure(""); requestId.current = null; setRetryUnavailable(false);
    if (!source) { setPreparing(false); return; }
    setPreparing(true);
    try { const processed = await prepareImage(source); if (mounted.current && sequence.current === generation) { setFile(processed); setPreview(URL.createObjectURL(processed)); } }
    catch (error) { if (mounted.current && sequence.current === generation) setFailure(error instanceof Error ? error.message : "Choose another photo."); }
    finally { if (mounted.current && sequence.current === generation) setPreparing(false); }
  }
  async function identify(retry = false) {
    if (lock.current || preparing || (!retry && !file)) return;
    if (retry && (outcome?.outcome !== "identified" || retryUnavailable)) return;
    lock.current = true; setBusy(true); setFailure("");
    const active = new AbortController(); controller.current = active;
    try {
      let response: Response;
      if (retry && outcome?.outcome === "identified") response = await fetch("/api/identifications/retry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ receipt: outcome.receipt }), signal: AbortSignal.any([active.signal, AbortSignal.timeout(30000)]) });
      else {
        requestId.current ??= crypto.randomUUID();
        const body = new FormData(); body.set("image", file!); body.set("gardenId", garden.id); body.set("gardenRevision", String(garden.revision)); body.set("requestId", requestId.current);
        response = await fetch("/api/identifications", { method: "POST", body, signal: AbortSignal.any([active.signal, AbortSignal.timeout(110000)]) });
      }
      const payload = await response.json();
      if (!response.ok) {
        if (retry && [400,409].includes(response.status)) setRetryUnavailable(true);
        throw new Error(payload.error?.message ?? "The request could not complete. Please retry.");
      }
      const next = identificationResponseSchema.parse(payload);
      if (next.outcome === "identified" && (next.context.gardenId !== garden.id || next.context.gardenRevision !== garden.revision || next.context.requestId !== requestId.current)) throw new Error("This result does not belong to the current garden. Return to My Garden.");
      if (!active.signal.aborted) { setOutcome(next); if (next.outcome === "uncertain") requestId.current = null; }
    } catch (error) {
      if (!active.signal.aborted) setFailure(error instanceof Error && !["ZodError", "TypeError", "SyntaxError", "TimeoutError"].includes(error.name) ? error.message : "The request could not complete. Check your connection and retry.");
    } finally { lock.current = false; controller.current = null; if (!active.signal.aborted) setBusy(false); }
  }
  return <section className={styles.upload}>
    <h2 tabIndex={-1} ref={heading}>Identify an unwanted plant</h2>
    <p className={styles.intro}>Upload a clear photo showing the plant, especially its leaves and as much of the whole plant as possible.</p>
    <p className={styles.garden}>Your saved garden · {garden.plan.input.widthM}m × {garden.plan.input.lengthM}m</p>
    {failure ? <div role="alert" className={styles.error}><p>{failure}</p>{/Sign in/i.test(failure) ? <button onClick={onSignIn}>Sign in again to retry</button> : null}</div> : null}
    {file && preview ? <div className={styles.preview}>{/* Native blob preview is temporary and needs no image optimization. */}<img src={preview} alt="Processed plant photo that will be analyzed" /></div> : null}
    {outcome?.outcome === "identified" ? <IdentificationResult result={outcome.result} saved={outcome.saveState === "saved"} saveMessage={outcome.saveMessage} busy={busy} onRetry={outcome.saveState === "failed" && !retryUnavailable ? () => { void identify(true); } : undefined} onBack={onBack} onAnother={() => { void choose(undefined); }} />
      : outcome?.outcome === "uncertain" ? <div role="status" className={styles.uncertain}><h3>We couldn&apos;t confidently identify this plant.</h3><p>Try a clearer photo in good light, showing the leaves and the whole plant.</p><button onClick={() => { void choose(undefined); }}>Try another photo</button></div>
      : <><label className={styles.picker}>Choose or replace photo<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { const selected = event.target.files?.[0]; event.target.value = ""; void choose(selected); }} /></label>
        {preparing ? <p role="status">Preparing your photo…</p> : null}
        {file ? <button disabled={busy} onClick={() => { void choose(undefined); }}>Remove photo</button> : null}
        <div className={styles.actions}><button disabled={!file || preparing || busy} onClick={() => { void identify(); }}>{busy ? "Identifying plant…" : "Identify Plant"}</button></div>
        {busy ? <p role="status"><span className={styles.spinner} aria-hidden="true" />Analyzing your photo. This can take a moment.</p> : null}</>}
    {outcome?.outcome !== "identified" ? <button className={styles.back} disabled={busy} onClick={onBack}>Back to my garden</button> : null}
  </section>;
}
