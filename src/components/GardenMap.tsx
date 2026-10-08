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

  // Planting sequence: the bed settles, rows till in, plants sprout, labels follow. Actions stay usable throughout.
  useGSAP(() => {
    if (!motionAllowed()) return;
    const q = gsap.utils.selector(figure);
    gsap.timeline()
      .from(q("[data-map-bed]"), { scale: 0.96, opacity: 0, duration: 0.4 })
      .from(q("[data-map-row]"), { scaleX: 0, transformOrigin: "0% 50%", duration: 0.42, stagger: 0.07, ease: "power2.out" }, "-=0.2")
      .from(q("[data-map-plant]"), { scale: 0, rotation: -16, transformOrigin: "50% 100%", duration: 0.5, ease: "back.out(2.4)", stagger: 0.05 }, "-=0.25")
      .from(q("[data-map-label]"), { y: 6, opacity: 0, duration: 0.3, stagger: 0.04 }, "<0.1")
      .from(q("[data-map-measure]"), { opacity: 0, duration: 0.35 }, "<")
      .from(q("[data-map-legend] > li"), { y: 8, opacity: 0, duration: 0.3, stagger: 0.05 }, "<0.05");
  }, { scope: figure, dependencies: [plan.planId] });

  return <figure ref={figure} className={styles.figure} aria-label="Top-down companion-placement guide">
    <div className={styles.measureTop} data-map-measure aria-hidden="true"><span className={styles.line} /><b>{widthM} m</b><span className={styles.line} /></div>
    <div className={styles.frame}>
      <div className={`${styles.bed} ${compact ? styles.compact : ""}`} data-map-bed style={{ "--map-width": `${520 * widthM / lengthM}px`, "--map-ratio": `${widthM} / ${lengthM}` } as CSSProperties}>
        {plan.rows.map((row, i) => <div className={styles.row} role="group" key={row.id} aria-label={`Row ${i + 1}`} data-map-row>
          {row.crops.map((crop) => <div className={styles.zone} role="group" key={crop} aria-label={CROPS[crop].name} style={{ "--crop-color": CROPS[crop].color } as CSSProperties}>
            {compact ? <svg viewBox="0 0 32 12" aria-hidden="true"><text x="16" y="10" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="800">{plan.input.crops.indexOf(crop) + 1}</text></svg>
              : <><span className={styles.plant} data-map-plant><PlantIcon crop={crop} /></span><span className={styles.name} data-map-label>{CROPS[crop].name}</span></>}
          </div>)}
        </div>)}
      </div>
      <div className={styles.measureSide} data-map-measure aria-hidden="true"><span className={styles.line} /><b>{lengthM} m</b><span className={styles.line} /></div>
    </div>
    <ul className={styles.legend} aria-label="Selected crops" data-map-legend>
      {plan.input.crops.map((crop, index) => <li key={crop} style={{ "--crop-color": CROPS[crop].color } as CSSProperties}>
        {compact ? <b>{index + 1}</b> : null}<PlantIcon crop={crop} /><span>{CROPS[crop].name}</span>
      </li>)}
    </ul>
    <figcaption>Companion-placement guide · Zones show relative placement, not exact spacing or planting capacity.</figcaption>
  </figure>;
}
