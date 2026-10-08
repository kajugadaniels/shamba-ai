"use client";
import { useEffect, useRef } from "react";
import { Button } from "./Button";
import { AlertIcon } from "./Icons";
import styles from "./ReplaceGardenDialog.module.css";
export function ReplaceGardenDialog({ busy, onCancel, onConfirm }: { busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  return <dialog ref={dialog} className={styles.dialog} data-loading-host aria-labelledby="replace-title" aria-describedby="replace-description"
    onCancel={(event) => { event.preventDefault(); if (!busy) onCancel(); }}>
    <span className={styles.icon} aria-hidden="true"><AlertIcon /></span>
    <h2 id="replace-title">Replace your saved garden?</h2>
    <div id="replace-description" className={styles.consequences}><p>Your existing garden plan will be replaced.</p><p>Its identification history belongs to the old garden and will be cleared.</p><p>This cannot be undone in this proof of concept.</p></div>
    <div className={styles.actions} aria-busy={busy}><Button autoFocus disabled={busy} onClick={onCancel}>Keep my saved garden</Button><Button variant="destructive" loading={busy} onClick={onConfirm}>Replace Garden</Button></div>
  </dialog>;
}
