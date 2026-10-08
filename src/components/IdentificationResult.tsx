"use client";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { identifiedPlantSchema } from "@/lib/schemas";
import { filterGuidance, guidanceFallback, nonWeedMessage } from "@/lib/guidance";
import { gsap, motionAllowed, useGSAP } from "@/lib/client/motion";
import { Button } from "./Button";
import { AlertIcon, ArrowLeftIcon, CheckIcon, InfoIcon, LeafIcon, ScanIcon } from "./Icons";
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
    gsap.timeline()
      .from(element, { y: 16, opacity: 0, duration: 0.45 })
      .from("[data-stamp]", { scale: 1.6, rotation: -8, opacity: 0, duration: 0.5, ease: "back.out(2.2)" }, "-=0.15")
      .from("[data-fact]", { y: 10, opacity: 0, duration: 0.35, stagger: 0.06 }, "-=0.25")
      .from("[data-reveal]", { y: 10, opacity: 0, duration: 0.35, stagger: 0.06 }, "-=0.2");
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
      <span className={styles.badge} data-stamp>{weed ? "Weed" : "Not a weed"}</span>
    </div>
    <dl className={styles.facts}>
      <div data-fact><dt>Classification</dt><dd>{weed ? "Classified as a weed by the provider" : "Not classified as a weed"}</dd></div>
      <div data-fact><dt>Provider score</dt><dd className={styles.score}>Provider confidence: {result.confidence}/100</dd></div>
      <div data-fact><dt>Identified</dt><dd><time dateTime={result.identifiedAt}>{new Date(result.identifiedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time></dd></div>
    </dl>
    <div className={styles.evidence} data-reveal><h3>Provider evidence</h3><p>{result.explanation}</p></div>
    {weed ? <section className={styles.guidance} data-reveal><h3><LeafIcon />Control guidance</h3>{guidance.length ? <ul>{guidance.map((item) => <li key={item}>{item}</li>)}</ul> : <p>{guidanceFallback}</p>}</section>
      : <div className={styles.info} data-reveal><InfoIcon /><p>{nonWeedMessage}</p></div>}
    {saved === false ? <div role="alert" className={styles.warning}><AlertIcon /><div><strong>The identification was not saved.</strong><p>{saveMessage}</p>{onRetry ? <Button loading={busy} variant="primary" onClick={onRetry}>Retry saving result</Button> : null}</div></div>
      : saved ? <p role="status" className={styles.saved}><CheckIcon />Saved to Identification History</p> : null}
    <div className={styles.actions} data-reveal>{onAnother ? <Button variant="primary" disabled={busy} onClick={onAnother}><ScanIcon />Identify another plant</Button> : null}<Button disabled={busy} onClick={onBack}><ArrowLeftIcon />Back to my garden</Button></div>
  </section>;
}
