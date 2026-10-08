"use client";
import { useEffect, useState } from "react";
import { usePageLoading } from "./GlobalLoading";
import { z } from "zod";
import { historyItemSchema } from "@/lib/schemas";
import styles from "./PlantUpload.module.css";
import { IdentificationResult } from "./IdentificationResult";
export function HistoricalResult({ id, onBack }: { id: string; onBack: () => void }) {
  const [result, setResult] = useState<z.infer<typeof historyItemSchema> | null>(null), [failure, setFailure] = useState(false), [retry, setRetry] = useState(0);
  usePageLoading(!result && !failure, "Loading identification…");
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/identifications/${id}`, { cache: "no-store", signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error(); const payload = await response.json(); const item = historyItemSchema.parse(payload.result);
      if (!controller.signal.aborted) { setResult(item); setFailure(false); }
    }).catch(() => { if (!controller.signal.aborted) setFailure(true); });
    return () => controller.abort();
  }, [id, retry]);
  return result ? <IdentificationResult result={result} onBack={onBack} /> : <section className={styles.result} aria-busy={!failure}>{failure ? <div role="alert"><p>This identification could not be loaded.</p><button onClick={() => { setFailure(false); setResult(null); setRetry((value) => value + 1); }}>Retry loading result</button></div> : null}<button onClick={onBack}>Back to my garden</button></section>;
}
