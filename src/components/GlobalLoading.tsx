"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./GlobalLoading.module.css";

type LoadingContext = { start: (label: string) => () => void };
const Context = createContext<LoadingContext | null>(null);

// A small status pill, never a second dialog. It fades in after a short delay so quick requests do not flash.
function LoadingStatus({ label, inline = false }: { label: string; inline?: boolean }) {
  return <div className={inline ? styles.inline : styles.floating}>
    <div className={styles.indicator} role="status" aria-label="Application loading" aria-live="polite" aria-atomic="true">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </div>
  </div>;
}

// Route fallbacks join the same operation registry rather than drawing a second status.
export function LoadingIndicator({ label = "Loading Shamba AI…" }: { label?: string }) {
  const context = useContext(Context);
  usePageLoading(true, label);
  return context ? null : <LoadingStatus label={label} />;
}

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<Map<symbol, string>>(() => new Map());
  const [host, setHost] = useState<HTMLElement | null>(() => typeof document === "undefined" ? null : document.body);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);
  const start = useCallback((label: string) => {
    const token = Symbol();
    setRequests((current) => new Map(current).set(token, label));
    return () => setRequests((current) => { const next = new Map(current); next.delete(token); return next; });
  }, []);
  useEffect(() => {
    // Native dialogs occupy the browser's top layer. While the owned replacement dialog is open,
    // the status renders inside it as an inline row so it stays visible without stacking dialogs.
    let active = true;
    const updateHost = () => {
      if (!active) return;
      setHost(document.querySelector<HTMLElement>('dialog[open][data-loading-host]') ?? document.body);
      setProgressDialogOpen(Boolean(document.querySelector('dialog[open][data-progress-dialog]')));
    };
    queueMicrotask(updateHost);
    const observer = new MutationObserver(updateHost);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["open"] });
    return () => { active = false; observer.disconnect(); };
  }, []);
  const context = useMemo(() => ({ start }), [start]);
  const label = [...requests.values()].at(-1);
  const inline = host !== null && host !== document.body;
  return <Context.Provider value={context}>{children}{label && host && !progressDialogOpen ? createPortal(<LoadingStatus label={label} inline={inline} />, host) : null}</Context.Provider>;
}

// Each operation owns its token; completion/unmount cannot hide another request.
export function usePageLoading(active: boolean, label: string) {
  const context = useContext(Context);
  useEffect(() => {
    if (active && context) return context.start(label);
  }, [active, label, context]);
}
