"use client";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { motion, useReducedMotion } from "motion/react";
import { identifiedPlantSchema } from "@/lib/schemas";
import { filterGuidance, guidanceFallback, nonWeedMessage } from "@/lib/guidance";
import { Button } from "./Button";
import styles from "./PlantUpload.module.css";
export function IdentificationResult({ result, saved, onBack, onAnother, onRetry, busy = false, saveMessage }: {
  result: Pick<z.infer<typeof identifiedPlantSchema>, "classification" | "commonName" | "scientificName" | "confidence" | "explanation" | "guidance" | "identifiedAt">;
  saved?: boolean; onBack: () => void; onAnother?: () => void; onRetry?: () => void; busy?: boolean; saveMessage?: string;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  const reduce = useReducedMotion(); const guidance = result.classification === "weed" ? filterGuidance(result.guidance) : [];
  return <motion.section className={styles.result} initial={{ opacity: 0, y: reduce ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} aria-labelledby="plant-name" aria-busy={busy}>
    <p className={styles.eyebrow}>Identification for your saved garden</p>
    <h2 id="plant-name" ref={heading} tabIndex={-1}>{result.commonName ?? result.scientificName}</h2>
    {result.commonName && result.scientificName ? <p className={styles.scientific}>{result.scientificName}</p> : null}
    <span className={styles.badge}>{result.classification === "weed" ? "Weed" : "Not a weed"}</span>
    <p>{result.classification === "not_weed" ? "Not classified as a weed" : "Classified as a weed by the provider"}</p>
    <p className={styles.score}>Provider confidence: {result.confidence}/100</p>
    <p className={styles.explanation}>{result.explanation}</p>
    <time dateTime={result.identifiedAt}>{new Date(result.identifiedAt).toLocaleString()}</time>
    {result.classification === "weed" ? <section className={styles.guidance}><h3>Control guidance</h3>{guidance.length ? <ul>{guidance.map((item) => <li key={item}>{item}</li>)}</ul> : <p>{guidanceFallback}</p>}</section> : <p className={styles.guidance}>{nonWeedMessage}</p>}
    {saved === false ? <div role="alert" className={styles.warning}><strong>The identification was not saved.</strong><p>{saveMessage}</p>{onRetry ? <Button loading={busy} variant="primary" onClick={onRetry}>Retry saving result</Button> : null}</div> : saved ? <p role="status" className={styles.saved}>Saved to Identification History</p> : null}
    <div className={styles.actions}>{onAnother ? <Button variant="primary" disabled={busy} onClick={onAnother}>Identify another plant</Button> : null}<Button disabled={busy} onClick={onBack}>Back to my garden</Button></div>
  </motion.section>;
}
