import type { CSSProperties } from "react";
import type { GardenPlan } from "@/lib/types";
import { CROPS } from "@/lib/crops";
import { PlantIcon } from "./PlantIcon";
import styles from "./GardenMap.module.css";

export function GardenMap({ plan }: { plan: GardenPlan }) {
  const { widthM, lengthM } = plan.input;
  const compact = widthM / lengthM >= 3;
  return <figure className={styles.figure} aria-label="Top-down companion-placement guide">
    <div className={styles.width}>{widthM} m <span aria-hidden="true">↔</span></div>
    <div className={styles.frame}>
      <div className={`${styles.bed} ${compact ? styles.compact : ""}`} style={{ "--map-width": `${560 * widthM / lengthM}px`, "--map-ratio": `${widthM} / ${lengthM}` } as CSSProperties}>
        {plan.rows.map((row, i) => <div className={styles.row} role="group" key={row.id} aria-label={`Row ${i + 1}`}>
          {row.crops.map((crop) => <div className={styles.zone} role="group" key={crop} aria-label={CROPS[crop].name} style={{ "--crop-color": CROPS[crop].color } as CSSProperties}>
            {compact ? <svg viewBox="0 0 32 12" aria-hidden="true"><text x="16" y="10" textAnchor="middle" fill="currentColor" fontSize="11" fontWeight="700">{plan.input.crops.indexOf(crop) + 1}</text></svg> : <><PlantIcon crop={crop} /><span>{CROPS[crop].name}</span></>}
          </div>)}
        </div>)}
      </div>
      <span className={styles.length}>{lengthM} m</span>
    </div>
    <div className={styles.legend} aria-label="Selected crops">
      {plan.input.crops.map((crop, index) => <span key={crop}>{compact ? <b>{index + 1}</b> : null}<PlantIcon crop={crop} />{CROPS[crop].name}</span>)}
    </div>
    <figcaption>Companion-placement guide · Zones show relative placement, not exact spacing or planting capacity.</figcaption>
  </figure>;
}
