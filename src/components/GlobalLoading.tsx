"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import styles from "./GlobalLoading.module.css";

type LoadingContext = { start: (label: string) => () => void };
const Context = createContext<LoadingContext | null>(null);

export function LoadingIndicator({ label = "Loading Shamba AI…" }: { label?: string }) {
  return <div className={styles.indicator} role="status" aria-label="Application loading" aria-live="polite" aria-atomic="true">
    <span className={styles.spinner} aria-hidden="true" />
    <span><strong>Shamba AI</strong><span className={styles.label}>{label}</span></span>
  </div>;
}

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<Map<symbol, string>>(() => new Map());
  const start = useCallback((label: string) => {
    const token = Symbol();
    setRequests((current) => new Map(current).set(token, label));
    return () => setRequests((current) => { const next = new Map(current); next.delete(token); return next; });
  }, []);
  const context = useMemo(() => ({ start }), [start]);
  const labels = [...requests.values()];
  return <Context.Provider value={context}>{children}{labels.length > 0 ? <LoadingIndicator label={labels.at(-1)} /> : null}</Context.Provider>;
}

// Each operation owns its token, so finishing one cannot hide another's progress.
// Cleanup removes the token on cancellation, account changes, and navigation.
export function usePageLoading(active: boolean, label: string) {
  const context = useContext(Context);
  useEffect(() => {
    if (active && context) return context.start(label);
  }, [active, label, context]);
}
