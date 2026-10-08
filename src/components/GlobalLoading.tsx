"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "./GlobalLoading.module.css";

type LoadingContext = { start: (label: string) => () => void };
const Context = createContext<LoadingContext | null>(null);

function LoadingCard({ label }: { label: string }) {
  return <div className={styles.overlay}>
    <div className={styles.indicator} role="status" aria-label="Application loading" aria-live="polite" aria-atomic="true">
      <div className={styles.illustration} aria-hidden="true">
        <svg viewBox="0 0 120 120" fill="none" focusable="false">
          <circle cx="60" cy="60" r="51" className={styles.track} />
          <circle cx="60" cy="60" r="51" className={styles.orbit} />
          <ellipse cx="60" cy="82" rx="25" ry="6" className={styles.soil} />
          <path d="M60 82V48" className={styles.stem} />
          <path d="M60 65C41 65 35 55 36 43C51 41 63 50 60 65Z" className={styles.leftLeaf} />
          <path d="M60 54C59 37 72 29 85 32C86 47 76 57 60 54Z" className={styles.rightLeaf} />
          <path d="M44 50L60 65M77 39L60 54" className={styles.veins} />
        </svg>
      </div>
      <span className={styles.brand}>Shamba AI</span>
      <p className={styles.label}>{label}</p>
      <p className={styles.note}>This may take a moment.</p>
    </div>
  </div>;
}

// Route fallbacks join the same operation registry rather than drawing a second card.
export function LoadingIndicator({ label = "Loading Shamba AI…" }: { label?: string }) {
  const context = useContext(Context);
  usePageLoading(true, label);
  return context ? null : <LoadingCard label={label} />;
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
    // Native dialogs occupy the browser's top layer. Render inside the owned
    // replacement dialog while it is open so saving progress stays visible.
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
  return <Context.Provider value={context}>{children}{label && host && !progressDialogOpen ? createPortal(<LoadingCard label={label} />, host) : null}</Context.Provider>;
}

// Each operation owns its token; completion/unmount cannot hide another request.
export function usePageLoading(active: boolean, label: string) {
  const context = useContext(Context);
  useEffect(() => {
    if (active && context) return context.start(label);
  }, [active, label, context]);
}
