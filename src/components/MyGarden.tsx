"use client";
import { useEffect, useRef, useState } from "react";
import { usePageLoading } from "./GlobalLoading";
import { z } from "zod";
import type { GardenPlan as Plan } from "@/lib/types";
import { gsap, motionAllowed, useGSAP } from "@/lib/client/motion";
import { GardenPlan } from "./GardenPlan";
import { Button } from "./Button";
import { AlertIcon, ArrowRightIcon, ClockIcon, LeafIcon } from "./Icons";
import styles from "./MyGarden.module.css";
const historySchema = z.object({ history: z.array(z.object({
  id: z.uuid(), classification: z.enum(["weed", "not_weed"]), commonName: z.string().nullable(), scientificName: z.string().nullable(),
  confidence: z.number().min(90).max(100), explanation: z.string(), identifiedAt: z.iso.datetime(),
})) });
export function MyGarden({ plan, onChange, onIdentify, onDetails }: { plan: Plan; onChange: () => void; onIdentify?: () => void; onDetails?: (id: string) => void }) {
  const [history, setHistory] = useState<z.infer<typeof historySchema>["history"] | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const root = useRef<HTMLElement>(null);
  usePageLoading(history === null && !failed, "Loading identification history…");
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/garden/history", { cache: "no-store", signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error();
      const result = historySchema.parse(await response.json());
      if (!controller.signal.aborted) { setHistory(result.history); setFailed(false); }
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [retry]);
  useGSAP(() => {
    if (!history || !motionAllowed()) return;
    gsap.from("[data-history-item]", { y: 18, opacity: 0, duration: 0.45, stagger: 0.07 });
  }, { scope: root, dependencies: [history] });
  return <><GardenPlan plan={plan} saved onChange={onChange} onIdentify={onIdentify} />
    <section ref={root} className={styles.history} aria-labelledby="history-heading" aria-busy={history === null && !failed}>
      <header className={styles.header}>
        <div><h2 id="history-heading">Identification History</h2><p>Newest first. Confident results are saved here automatically.</p></div>
        {history?.length ? <span className={styles.count}>{history.length} saved</span> : null}
      </header>
      {failed || (retry > 0 && history === null) ? <div role={failed ? "alert" : undefined} className={failed ? styles.failed : undefined}>{failed ? <p><AlertIcon />Identification history could not be loaded.</p> : null}<Button loading={!failed && history === null} onClick={() => { setFailed(false); setHistory(null); setRetry((value) => value + 1); }}>Retry history</Button></div>
        : history === null ? null
        : history.length === 0 ? <div className={styles.empty} data-history-item>
          <span className={styles.emptyArt} aria-hidden="true"><LeafIcon /></span>
          <p>Identified plants will appear here after you scan your first unwanted plant.</p>
        </div>
        : <ul className={styles.grid}>{history.map((item) => <li key={item.id} data-history-item><article className={styles.card} data-kind={item.classification}>
          <div className={styles.cardTop}>
            <span className={styles.badge}>{item.classification === "weed" ? "Weed" : "Not a weed"}</span>
            <time dateTime={item.identifiedAt}><ClockIcon />{new Date(item.identifiedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time>
          </div>
          <h3 id={`history-${item.id}`}>{item.commonName ?? item.scientificName}</h3>
          <p className={styles.confidence}>Provider confidence: {item.confidence}/100</p>
          <p className={styles.summary}>{item.explanation}</p>
          <Button className={styles.details} aria-describedby={`history-${item.id}`} onClick={() => onDetails?.(item.id)}>View details<ArrowRightIcon data-nudge /></Button>
        </article></li>)}</ul>}
    </section></>;
}
