"use client";

import { useEffect, useRef, useState } from "react";
import type { CropId } from "@/lib/crops";
import { CROPS } from "@/lib/crops";
import { Button } from "./Button";
import { PlantIcon } from "./PlantIcon";
import styles from "./GardenProgressDialog.module.css";

const estimateSeconds = 40;

export function GardenProgressDialog({ width, length, crops, onCancel }: {
  width: string; length: string; crops: CropId[]; onCancel: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const started = performance.now();
    const timer = window.setInterval(() => setElapsed(Math.floor((performance.now() - started) / 1000)), 1000);
    return () => { window.clearInterval(timer); element?.close(); };
  }, []);
  const extended = elapsed >= estimateSeconds;
  const message = elapsed >= 75 ? "This is taking longer than expected. You can keep waiting or cancel and retry."
    : extended ? "Still waiting for your garden plan. Some requests take longer."
    : "Your garden plan is on its way. Keep this page open while it is prepared.";
  const estimate = Math.min(90, Math.round(elapsed / estimateSeconds * 90));

  return <dialog ref={dialog} className={styles.dialog} data-progress-dialog aria-labelledby="garden-progress-title" aria-describedby="garden-progress-estimate" onCancel={(event) => { event.preventDefault(); onCancel(); }}>
    <div className={styles.head}>
      <span className={styles.icon} aria-hidden="true"><PlantIcon crop="sprout" /></span>
      <div>
        <h2 id="garden-progress-title">Growing your garden plan</h2>
        <p className={styles.summary}>{width}m × {length}m · {crops.map((crop) => CROPS[crop].name).join(", ")}</p>
      </div>
    </div>
    <p role="status" aria-live="polite" className={styles.status}>{message}</p>
    <div className={styles.track} role="progressbar" aria-label="Estimated waiting progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={extended ? undefined : estimate} aria-valuetext={`${elapsed} seconds elapsed. This is a time-based estimate; actual service progress is unavailable.`}>
      <span className={`${styles.fill} ${extended ? styles.indeterminate : ""}`} style={extended ? undefined : { width: `${estimate}%` }} />
    </div>
    <div className={styles.timing}><span>Estimated wait: 20–40 seconds</span><time>{elapsed}s elapsed</time></div>
    <p id="garden-progress-estimate" className={styles.note}>Time-based estimate, not live progress. Your plan may finish sooner or take longer. If you cancel, your dimensions and crop choices will stay here.</p>
    <div className={styles.actions}><Button autoFocus onClick={onCancel}>Cancel generation</Button></div>
  </dialog>;
}
