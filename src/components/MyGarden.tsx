"use client";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import type { GardenPlan as Plan } from "@/lib/types";
import { gsap, motionAllowed, useGSAP } from "@/lib/client/motion";
import { GardenPlan } from "./GardenPlan";
import { Button } from "./Button";
import { AlertIcon, RefreshIcon, ScanIcon } from "./Icons";
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
    if (!history?.length || !motionAllowed()) return;
    gsap.from("[data-history-item]", { y: 8, opacity: 0, duration: 0.3, stagger: 0.05 });
  }, { scope: root, dependencies: [history] });
  // History loads inside this section; placeholder rows avoid a second page-level loader over a visible page.
  const loading = history === null && !failed;
  return <><GardenPlan plan={plan} saved onChange={onChange} onIdentify={onIdentify} />
    <section ref={root} className={styles.history} aria-labelledby="history-heading" aria-busy={loading}>
      <header className={styles.header}>
        <h2 id="history-heading">Identification History</h2>
        <p>Plants you identify in this garden appear here, newest first. Only confident results are saved.</p>
      </header>
      {failed ? <div role="alert" className={styles.failed}><p><AlertIcon />Identification history could not be loaded.</p><Button size="sm" onClick={() => { setFailed(false); setHistory(null); setRetry((value) => value + 1); }}><RefreshIcon />Retry history</Button></div>
        : loading ? <div className={styles.placeholder}><span className="sr-only">Loading identification history…</span><span aria-hidden="true" /><span aria-hidden="true" /></div>
        : history?.length === 0 ? <div className={styles.empty}>
          <p><strong>No plants identified yet.</strong> Identified plants will appear here after you scan your first unwanted plant.</p>
          {onIdentify ? <Button size="sm" variant="secondary" onClick={onIdentify}><ScanIcon />Identify your first plant</Button> : null}
        </div>
        : <ul className={styles.list}>{history?.map((item) => <li key={item.id} className={styles.item} data-history-item data-kind={item.classification}>
          <div className={styles.itemMain}>
            <h3 id={`history-${item.id}`}>{item.commonName ?? item.scientificName}</h3>
            <p className={styles.itemMeta}><span className={styles.badge}>{item.classification === "weed" ? "Weed" : "Not a weed"}</span><span>Provider confidence: {item.confidence}/100</span><time dateTime={item.identifiedAt}>{new Date(item.identifiedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time></p>
            <p className={styles.summary}>{item.explanation}</p>
          </div>
          <Button size="sm" aria-describedby={`history-${item.id}`} onClick={() => onDetails?.(item.id)}>View details</Button>
        </li>)}</ul>}
    </section></>;
}
