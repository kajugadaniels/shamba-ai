"use client";

import { useEffect, useRef } from "react";
import type { GardenPlan as Plan } from "@/lib/types";
import { CROPS } from "@/lib/crops";
import { gsap, motionAllowed, useGSAP } from "@/lib/client/motion";
import { GardenMap } from "./GardenMap";
import { Button } from "./Button";
import { AlertIcon, BookmarkIcon, InfoIcon, LeafIcon, PencilIcon, ScanIcon } from "./Icons";
import styles from "./GardenPlan.module.css";

const NOTE_LABELS = { conflict: "Provider code-checked conflict", advisory: "Companion advisory", companion: "Companion guidance" } as const;

export function GardenPlan({ plan, onChange, onSave, saving = false, saveDisabled = false, saved = false, onIdentify }: { plan: Plan; onChange: () => void; onSave?: () => void; saving?: boolean; saveDisabled?: boolean; saved?: boolean; onIdentify?: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const root = useRef<HTMLElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  useGSAP(() => {
    if (!motionAllowed()) return;
    gsap.from("[data-reveal]", { y: 10, opacity: 0, duration: 0.4, stagger: 0.05 });
  }, { scope: root });
  const guidance = saved ? "To check a plant growing here, choose Identify an unwanted plant. Confident results are saved to your history below."
    : onSave ? "This preview isn’t saved yet. Review the map and notes, then save it to come back later and identify plants in it."
    : "Saving isn’t available yet. You can still adjust your garden guide.";

  return <section ref={root} className={styles.plan} aria-busy={saving} data-saved={saved || undefined}>
    <header className={styles.header} data-reveal>
      <span className={styles.status}><span className={styles.dot} aria-hidden="true" />{saved ? "Saved garden" : "Unsaved preview"}</span>
      <h2 ref={heading} tabIndex={-1}>{saved ? "My Garden" : "Your Garden Plan"}</h2>
      <p className={styles.meta}>{plan.input.widthM}m × {plan.input.lengthM}m · {saved ? plan.input.crops.map((crop) => CROPS[crop].name).join(", ") : `${plan.input.crops.length} crops selected`}</p>
      <p className={styles.guidance} id="save-note">{guidance}</p>
      <div className={styles.actions}>
        {!saved ? <Button variant="primary" loading={saving} disabled={saveDisabled || !onSave} onClick={onSave} aria-describedby="save-note"><BookmarkIcon />Save Garden</Button>
          : <Button variant="primary" disabled={!onIdentify} onClick={onIdentify} aria-describedby="save-note"><ScanIcon />Identify an unwanted plant</Button>}
        <Button disabled={saving} variant="outline" onClick={onChange}><PencilIcon />Change Garden</Button>
      </div>
    </header>
    <section className={styles.block} aria-labelledby="map-heading" data-reveal>
      <h3 id="map-heading">Where each crop goes</h3>
      <GardenMap plan={plan} />
    </section>
    <section className={styles.block} aria-labelledby="why-heading" data-reveal>
      <h3 id="why-heading">Why this layout works</h3>
      {plan.relationships.length ? <ul className={styles.notes}>
        {plan.relationships.map((pair) => <li key={pair.crops.join(":")} className={`${styles.note} ${pair.kind === "conflict" ? styles.conflict : pair.kind === "advisory" ? styles.advisory : styles.companion}`}>
          <span className={styles.label}>{pair.kind === "companion" ? <LeafIcon /> : <AlertIcon />}{NOTE_LABELS[pair.kind]}</span>
          <h4>{pair.crops.map((crop) => CROPS[crop].name).join(" + ")}</h4>
          <p>{pair.explanation}</p>
          {pair.kind === "conflict" ? <p className={styles.attribution}>This is the provider&apos;s evidence category, not independent verification by Shamba AI.</p> : null}
        </li>)}
      </ul> : <p className={styles.noNotes}><InfoIcon />The provider supplied planting rows without usable companion notes. This guide does not establish that every combination is compatible.</p>}
    </section>
  </section>;
}
