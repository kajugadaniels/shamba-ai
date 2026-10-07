"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { gardenInputSchema, planResponseSchema } from "@/lib/schemas";
import type { PlanResponse } from "@/lib/types";
import { GardenForm, type FormErrors, type FormValues } from "./GardenForm";
import { GardenPlan } from "./GardenPlan";
import { PlantIcon } from "./PlantIcon";
import styles from "./GardenWorkspace.module.css";

export function GardenWorkspace() {
  const [values, setValues] = useState<FormValues>({ width: "", length: "", crops: [] });
  const [errors, setErrors] = useState<FormErrors>({});
  const [failure, setFailure] = useState("");
  const [draft, setDraft] = useState<PlanResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const formStart = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => () => controller.current?.abort(), []);

  async function generate() {
    if (controller.current) return;
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
      setDraft(planResponseSchema.parse(payload));
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
    setDraft(null); setFailure("");
    // The form remounts after the preview; focus its heading after the DOM update.
    requestAnimationFrame(() => formStart.current?.focus());
  }

  return <main className={styles.workspace}>
    <header className={styles.brand}><span className={styles.brandIcon}><PlantIcon crop="sprout" /></span><span>Shamba AI</span></header>
    <div className={styles.intro} ref={formStart} tabIndex={-1}>
      <h1>Plan a small food garden<br className={styles.lineBreak} /> that works better together.</h1>
      <p>A little space. A few crops. A good place to start.</p>
    </div>
    <div role="status" aria-live="polite" className="sr-only">{busy ? "Creating your garden guide. Please wait." : ""}</div>
    {failure ? <div className={styles.error} role="alert"><strong>Let&apos;s try that again</strong><p>{failure}</p></div> : null}
    {draft ? <motion.div key={draft.plan.planId} initial={{ opacity: 0, y: reduce ? 0 : 8 }} animate={{ opacity: 1, y: 0 }}>
      <GardenPlan plan={draft.plan} onChange={change} />
    </motion.div> : <GardenForm values={values} errors={errors} busy={busy} onChange={(next) => { setValues(next); setErrors({}); setFailure(""); }} onGenerate={generate} />}
    <footer className={styles.footer}><PlantIcon crop="sprout" /><p>Made for small outdoor gardens and raised beds.</p></footer>
  </main>;
}
