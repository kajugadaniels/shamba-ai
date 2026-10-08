"use client";
import { useEffect, useState } from "react";
import { usePageLoading } from "./GlobalLoading";
import { motion, useReducedMotion } from "motion/react";
import { z } from "zod";
import type { GardenPlan as Plan } from "@/lib/types";
import { GardenPlan } from "./GardenPlan";
import styles from "./GardenWorkspace.module.css";
const historySchema = z.object({ history: z.array(z.object({
  id: z.uuid(), classification: z.enum(["weed", "not_weed"]), commonName: z.string().nullable(), scientificName: z.string().nullable(),
  confidence: z.number().min(90).max(100), explanation: z.string(), identifiedAt: z.iso.datetime(),
})) });
export function MyGarden({ plan, onChange, onIdentify, onDetails }: { plan: Plan; onChange: () => void; onIdentify?: () => void; onDetails?: (id: string) => void }) {
  const reduce = useReducedMotion();
  const [history, setHistory] = useState<z.infer<typeof historySchema>["history"] | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
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
  return <><GardenPlan plan={plan} saved onChange={onChange} onIdentify={onIdentify} />
    <section className={styles.history} aria-labelledby="history-heading" aria-busy={history === null && !failed}><h2 id="history-heading">Identification History</h2>
      {failed ? <div role="alert"><p>Identification history could not be loaded.</p><button onClick={() => { setFailed(false); setHistory(null); setRetry((value) => value + 1); }}>Retry history</button></div>
        : history === null ? null
        : history.length === 0 ? <p>Identified plants will appear here after you scan your first unwanted plant.</p>
        : history.map((item) => <motion.article key={item.id} initial={{ opacity: 0, y: reduce ? 0 : 4 }} animate={{ opacity: 1, y: 0 }}><h3>{item.commonName ?? item.scientificName}</h3><p>{item.classification === "weed" ? "Weed" : "Not a weed"} · Provider confidence: {item.confidence}/100</p><time dateTime={item.identifiedAt}>{new Date(item.identifiedAt).toLocaleString()}</time><p className={styles.summary}>{item.explanation}</p><button onClick={() => onDetails?.(item.id)}>View details</button></motion.article>)}
    </section></>;
}
