"use client";

import { useEffect, useRef } from "react";
import type { GardenPlan as Plan } from "@/lib/types";
import { CROPS } from "@/lib/crops";
import { GardenMap } from "./GardenMap";
import styles from "./GardenPlan.module.css";

export function GardenPlan({ plan, onChange, onSave, saving = false, saveDisabled = false, saved = false, onIdentify }: { plan: Plan; onChange: () => void; onSave?: () => void; saving?: boolean; saveDisabled?: boolean; saved?: boolean; onIdentify?: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <section className={styles.plan} aria-busy={saving}>
    <div className={styles.summary}><div><h2 ref={heading} tabIndex={-1}>{saved ? "My Garden" : "Your Garden Plan"}</h2>
      <p>{plan.input.widthM}m × {plan.input.lengthM}m · {saved ? plan.input.crops.map((crop) => CROPS[crop].name).join(", ") : `${plan.input.crops.length} crops selected`}</p></div><span className={styles.draft}>{saved ? "Saved garden" : "Unsaved preview"}</span></div>
    <GardenMap plan={plan} />
    <section className={styles.explanations} aria-labelledby="why-heading">
      <h3 id="why-heading">Why this layout works</h3>
      {plan.relationships.length ? plan.relationships.map((pair) => <div key={pair.crops.join(":")} className={`${styles.note} ${pair.kind === "conflict" ? styles.conflict : pair.kind === "advisory" ? styles.advisory : ""}`}>
        <span className={styles.label}>{pair.kind === "conflict" ? "Provider code-checked conflict" : pair.kind === "advisory" ? "Companion advisory" : "Companion guidance"}</span>
        <h4>{pair.crops.map((crop) => CROPS[crop].name).join(" + ")}</h4><p>{pair.explanation}</p>
        {pair.kind === "conflict" ? <p className={styles.attribution}>This is the provider&apos;s evidence category, not independent verification by Shamba AI.</p> : null}
      </div>) : <p className={styles.noNotes}>The provider supplied planting rows without usable companion notes. This guide does not establish that every combination is compatible.</p>}
    </section>
    <div className={styles.actions}>{!saved ? <button disabled={saving || saveDisabled || !onSave} onClick={onSave} className={styles.save} aria-describedby="save-note">Save Garden</button> : <button disabled={!onIdentify} onClick={onIdentify} className={styles.save} aria-describedby="save-note">Identify an unwanted plant</button>}
      <button disabled={saving} className={styles.change} onClick={onChange}>Change Garden</button></div>
    <p className={styles.saveNote} id="save-note">{saved ? "Identify plants in this saved garden and keep their results together." : onSave ? "Your preview stays separate until you save it." : "Saving isn’t available yet. You can still adjust your garden guide."}</p>
  </section>;
}
