"use client";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { identifiedPlantSchema } from "@/lib/schemas";
import { filterGuidance, guidanceFallback, nonWeedMessage } from "@/lib/guidance";
import { gsap, motionAllowed, useGSAP } from "@/lib/client/motion";
import { Button } from "./Button";
import { AlertIcon, ArrowLeftIcon, CheckIcon, InfoIcon, LeafIcon, RefreshIcon, ScanIcon } from "./Icons";
import styles from "./IdentificationResult.module.css";
export function IdentificationResult({ result, saved, onBack, onAnother, onRetry, busy = false, saveMessage, embedded = false }: {
  result: Pick<z.infer<typeof identifiedPlantSchema>, "classification" | "commonName" | "scientificName" | "confidence" | "explanation" | "guidance" | "identifiedAt">;
  saved?: boolean; onBack: () => void; onAnother?: () => void; onRetry?: () => void; busy?: boolean; saveMessage?: string; embedded?: boolean;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const root = useRef<HTMLElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  useGSAP(() => {
    const element = root.current;
    if (!element || !motionAllowed()) return;
    gsap.from(element, { y: 10, opacity: 0, duration: 0.4 });
  }, { scope: root });
  const weed = result.classification === "weed";
  const guidance = weed ? filterGuidance(result.guidance) : [];
  return <section ref={root} className={`${styles.result} ${embedded ? styles.embedded : ""}`} data-kind={result.classification} aria-labelledby="plant-name" aria-busy={busy}>
    <div className={styles.head}>
      <div className={styles.title}>
        <p className={styles.eyebrow}>Identification for your saved garden</p>
        <h2 id="plant-name" ref={heading} tabIndex={-1}>{result.commonName ?? result.scientificName}</h2>
        {result.commonName && result.scientificName ? <p className={styles.scientific}>{result.scientificName}</p> : null}
      </div>
      <span className={styles.badge}>{weed ? "Weed" : "Not a weed"}</span>
    </div>
    <dl className={styles.facts}>
      <div><dt>Classification</dt><dd>{weed ? "Classified as a weed by the provider" : "Not classified as a weed"}</dd></div>
      <div><dt>Score</dt><dd className={styles.score}>Provider confidence: {result.confidence}/100</dd></div>
      <div><dt>Identified</dt><dd><time dateTime={result.identifiedAt}>{new Date(result.identifiedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time></dd></div>
    </dl>
    <p className={styles.scoreNote}>This score comes from the identification service. Only results scoring 90 or higher are shown and saved, and a high score is not a guarantee.</p>
    <div className={styles.section}><h3>What the provider saw</h3><p>{result.explanation}</p></div>
    {weed ? <section className={styles.section}><h3><LeafIcon />Control guidance</h3>{guidance.length ? <ul>{guidance.map((item) => <li key={item}>{item}</li>)}</ul> : <p>{guidanceFallback}</p>}</section>
      : <div className={styles.info}><InfoIcon /><p>{nonWeedMessage}</p></div>}
    {saved === false ? <div role="alert" className={styles.warning}><AlertIcon /><div><strong>The identification was not saved.</strong><p>{saveMessage}</p>{onRetry ? <Button size="sm" loading={busy} variant="primary" onClick={onRetry}><RefreshIcon />Retry saving result</Button> : null}</div></div>
      : saved ? <p role="status" className={styles.saved}><CheckIcon />Saved to Identification History</p> : null}
    <div className={styles.actions}>{onAnother ? <Button variant="primary" disabled={busy} onClick={onAnother}><ScanIcon />Identify another plant</Button> : null}<Button disabled={busy} onClick={onBack}><ArrowLeftIcon />Back to my garden</Button></div>
  </section>;
}
