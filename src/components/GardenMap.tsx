"use client";

import { useRef, type CSSProperties } from "react";
import type { GardenPlan } from "@/lib/types";
import { CROPS } from "@/lib/crops";
import { gsap, motionAllowed, useGSAP } from "@/lib/client/motion";
import { PlantIcon } from "./PlantIcon";
import styles from "./GardenMap.module.css";

export function GardenMap({ plan }: { plan: GardenPlan }) {
  const figure = useRef<HTMLElement>(null);
  const { widthM, lengthM } = plan.input;
  const ratio = widthM / lengthM;
  const compact = ratio >= 3 || ratio <= 1 / 3;

  // A short, quiet reveal: rows fade in, then each plant settles. Actions stay usable throughout.
  useGSAP(() => {
    if (!motionAllowed()) return;
    const q = gsap.utils.selector(figure);
    gsap.timeline()
      .from(q("[data-map-row]"), { opacity: 0, duration: 0.3, stagger: 0.05 })
      .from(q("[data-map-plant]"), { scale: 0.7, opacity: 0, duration: 0.3, stagger: 0.03 }, "-=0.15");
  }, { scope: figure, dependencies: [plan.planId] });

  return <figure ref={figure} className={styles.figure} aria-label="Top-down companion-placement guide">
    <div className={styles.measureTop} aria-hidden="true"><span className={styles.line} /><b>{widthM} m</b><span className={styles.line} /></div>
    <div className={styles.frame}>
      <div className={`${styles.bed} ${compact ? styles.compact : ""}`} style={{ "--map-width": `${420 * widthM / lengthM}px`, "--map-ratio": `${widthM} / ${lengthM}` } as CSSProperties}>
        {plan.rows.map((row, i) => <div className={styles.row} role="group" key={row.id} aria-label={`Row ${i + 1}`} data-map-row>
          {row.crops.map((crop) => <div className={styles.zone} role="group" key={crop} aria-label={CROPS[crop].name} style={{ "--crop-color": CROPS[crop].color } as CSSProperties}>
            {compact ? <svg viewBox="0 0 32 12" aria-hidden="true"><text x="16" y="10" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="800">{plan.input.crops.indexOf(crop) + 1}</text></svg>
              : <><span className={styles.plant} data-map-plant><PlantIcon crop={crop} /></span><span className={styles.name}>{CROPS[crop].name}</span></>}
          </div>)}
        </div>)}
      </div>
      <div className={styles.measureSide} aria-hidden="true"><span className={styles.line} /><b>{lengthM} m</b><span className={styles.line} /></div>
    </div>
    <ul className={styles.legend} aria-label="Selected crops">
      {plan.input.crops.map((crop, index) => <li key={crop} style={{ "--crop-color": CROPS[crop].color } as CSSProperties}>
        {compact ? <b>{index + 1}</b> : null}<PlantIcon crop={crop} /><span>{CROPS[crop].name}</span>
      </li>)}
    </ul>
    <figcaption>Companion-placement guide · Zones show relative placement, not exact spacing or planting capacity.</figcaption>
  </figure>;
}
