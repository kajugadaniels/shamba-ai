/* eslint-disable @next/next/no-img-element -- Blob URLs are temporary processed previews. */
"use client";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { identificationResponseSchema, savedGardenSchema } from "@/lib/schemas";
import { prepareImage } from "@/lib/client/image";
import { gsap, motionAllowed, useGSAP } from "@/lib/client/motion";
import { IdentificationResult } from "./IdentificationResult";
import { usePageLoading } from "./GlobalLoading";
import { Button } from "./Button";
import { AlertIcon, ArrowLeftIcon, CameraIcon, FocusIcon, ScanIcon } from "./Icons";
import styles from "./PlantUpload.module.css";
type ResponseData = z.infer<typeof identificationResponseSchema>;
const STEPS = [
  ["Choose a photo.", "Large photos are resized on this device first."],
  ["Check the preview.", "This exact photo is the one analyzed."],
  ["Select Identify Plant.", "Confident results are saved to your history automatically."],
];
const formatBytes = (bytes: number) => bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;
export function PlantUpload({ garden, onBack, onSignIn }: { garden: z.infer<typeof savedGardenSchema>; onBack: () => void; onSignIn?: () => void }) {
  const [file, setFile] = useState<File | null>(null), [preview, setPreview] = useState("");
  const [preparing, setPreparing] = useState(false), [busy, setBusy] = useState(false), [failure, setFailure] = useState("");
  const [outcome, setOutcome] = useState<ResponseData | null>(null), [retryUnavailable, setRetryUnavailable] = useState(false);
  const [dragging, setDragging] = useState(false);
  usePageLoading(preparing || busy, preparing ? "Preparing your photo…" : outcome?.outcome === "identified" ? "Saving identification…" : "Identifying your plant…");
  const mounted = useRef(true);
  const sequence = useRef(0), controller = useRef<AbortController | null>(null), lock = useRef(false), requestId = useRef<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const root = useRef<HTMLElement>(null);
  useEffect(() => { mounted.current = true; heading.current?.focus(); return () => { mounted.current = false; controller.current?.abort(); }; }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  useGSAP(() => {
    if (!motionAllowed()) return;
    gsap.from("[data-reveal]", { y: 10, opacity: 0, duration: 0.4, stagger: 0.05 });
  }, { scope: root });
  useGSAP(() => {
    if (!preview || !motionAllowed()) return;
    gsap.from("[data-preview]", { opacity: 0, duration: 0.35 });
  }, { scope: root, dependencies: [preview] });
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
  const photo = file && preview ? file : null;
  return <section ref={root} className={styles.upload} aria-busy={preparing || busy}>
    <header className={styles.header} data-reveal>
      <p className={styles.garden}><span className={styles.gardenDot} aria-hidden="true" />Your saved garden · {garden.plan.input.widthM}m × {garden.plan.input.lengthM}m</p>
      <h2 tabIndex={-1} ref={heading}>Identify an unwanted plant</h2>
      <p className={styles.intro}>Upload a clear photo showing the plant, especially its leaves and as much of the whole plant as possible.</p>
    </header>
    {!outcome ? <ol className={styles.steps} aria-label="How identification works" data-reveal>
      {STEPS.map(([title, text], index) => <li key={title}><span className={styles.stepNumber} aria-hidden="true">{index + 1}</span><p><strong>{title}</strong> {text}</p></li>)}
    </ol> : null}
    {failure ? <div role="alert" className={styles.error}><AlertIcon /><div><p>{failure}</p>{/Sign in/i.test(failure) ? <Button size="sm" onClick={onSignIn}>Sign in again to retry</Button> : null}</div></div> : null}
    {photo ? <figure className={styles.preview} data-preview data-scanning={busy || undefined}>
      <img src={preview} alt="Processed plant photo that will be analyzed" />
      <span className={styles.scan} aria-hidden="true" />
      <figcaption>Prepared photo · {formatBytes(photo.size)}</figcaption>
    </figure> : null}
    {outcome?.outcome === "identified" ? <IdentificationResult embedded result={outcome.result} saved={outcome.saveState === "saved"} saveMessage={outcome.saveMessage} busy={busy} onRetry={outcome.saveState === "failed" && !retryUnavailable ? () => { void identify(true); } : undefined} onBack={onBack} onAnother={() => { void choose(undefined); }} />
      : outcome?.outcome === "uncertain" ? <div className={styles.uncertain}>
        <div role="status" className={styles.uncertainText}><FocusIcon /><div><h3>We couldn&apos;t confidently identify this plant.</h3><p>Try a clearer photo in good light, showing the leaves and the whole plant. Uncertain results are not saved.</p></div></div>
        <div className={styles.actions}><Button variant="primary" onClick={() => { void choose(undefined); }}><CameraIcon />Try another photo</Button><Button onClick={onBack}><ArrowLeftIcon />Back to my garden</Button></div>
      </div>
      : <>
        <div className={styles.dropzone} data-compact={photo ? true : undefined} data-dragging={dragging || undefined} data-reveal
          onDragOver={(event) => { if (busy) return; event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); if (!busy) void choose(event.dataTransfer.files[0]); }}>
          <input id="plant-photo" className={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} aria-describedby="plant-photo-hint"
            onChange={(event) => { const selected = event.target.files?.[0]; event.target.value = ""; void choose(selected); }} />
          <label htmlFor="plant-photo" className={styles.dropLabel}><span className={styles.dropIcon} aria-hidden="true"><CameraIcon /></span><span className={styles.dropTitle}>Choose or replace photo</span></label>
          <p id="plant-photo-hint" className={styles.dropHint}>{photo ? "Want a different photo? Choose another one." : "Drag a photo here, or select to browse. JPG, PNG, or WEBP."}</p>
        </div>
        <div className={styles.actions} data-reveal>
          <Button variant="primary" loading={busy} disabled={!file || preparing} onClick={() => { void identify(); }}><ScanIcon />Identify Plant</Button>
          {file ? <Button disabled={busy} onClick={() => { void choose(undefined); }}>Remove photo</Button> : null}
          <Button disabled={busy} onClick={onBack}><ArrowLeftIcon />Back to my garden</Button>
        </div>
      </>}
  </section>;
}
