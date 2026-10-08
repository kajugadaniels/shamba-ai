"use client";
import { useEffect, useState } from "react";
import { usePageLoading } from "./GlobalLoading";
import { z } from "zod";
import { historyItemSchema } from "@/lib/schemas";
import { Button } from "./Button";
import { AlertIcon, ArrowLeftIcon, RefreshIcon } from "./Icons";
import styles from "./IdentificationResult.module.css";
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
  return result ? <IdentificationResult result={result} onBack={onBack} /> : <section className={styles.result} aria-busy={!failure}>
    {failure ? <div role="alert" className={styles.warning}><AlertIcon /><p>This identification could not be loaded. Check your connection and retry, or go back to your garden.</p></div>
      : <div className={styles.placeholder} aria-hidden="true"><span /><span /><span /></div>}
    <div className={styles.actions}>
      {failure || retry > 0 ? <Button loading={!failure} onClick={() => { setFailure(false); setResult(null); setRetry((value) => value + 1); }}><RefreshIcon />Retry loading result</Button> : null}
      <Button onClick={onBack}><ArrowLeftIcon />Back to my garden</Button>
    </div>
  </section>;
}
