"use client";
import { useEffect, useState } from "react";
import { z } from "zod";
import type { GardenPlan as Plan } from "@/lib/types";
import { GardenPlan } from "./GardenPlan";
import styles from "./GardenWorkspace.module.css";
const historySchema = z.object({ history: z.array(z.object({
  id: z.uuid(), classification: z.enum(["weed", "not_weed"]), commonName: z.string().nullable(), scientificName: z.string().nullable(),
  confidence: z.number().min(90).max(100), explanation: z.string(), identifiedAt: z.iso.datetime(),
})) });
export function MyGarden({ plan, onChange }: { plan: Plan; onChange: () => void }) {
  const [history, setHistory] = useState<z.infer<typeof historySchema>["history"] | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/garden/history", { cache: "no-store", signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error();
      const result = historySchema.parse(await response.json());
      if (!controller.signal.aborted) { setHistory(result.history); setFailed(false); }
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [retry]);
  return <><GardenPlan plan={plan} saved onChange={onChange} />
    <section className={styles.history} aria-labelledby="history-heading"><h2 id="history-heading">Identification History</h2>
      {failed ? <div role="alert"><p>Identification history could not be loaded.</p><button onClick={() => setRetry((value) => value + 1)}>Retry history</button></div>
        : history === null ? <p role="status">Loading identification history…</p>
        : history.length === 0 ? <p>Identified plants will appear here after you scan your first unwanted plant.</p>
        : history.map((item) => <article key={item.id}><h3>{item.commonName ?? item.scientificName}</h3><p>{item.classification === "weed" ? "Weed" : "Not a weed"} · Provider confidence: {item.confidence}/100</p><time dateTime={item.identifiedAt}>{new Date(item.identifiedAt).toLocaleString()}</time><p>{item.explanation}</p></article>)}
    </section></>;
}
