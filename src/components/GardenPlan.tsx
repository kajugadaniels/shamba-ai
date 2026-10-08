"use client";

import { useEffect, useRef } from "react";
import type { GardenPlan as Plan } from "@/lib/types";
import { CROPS } from "@/lib/crops";
import { gsap, motionAllowed, useGSAP } from "@/lib/client/motion";
import { GardenMap } from "./GardenMap";
import { PlantIcon } from "./PlantIcon";
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
    gsap.from("[data-reveal]", { y: 18, opacity: 0, duration: 0.55, stagger: 0.06 });
    gsap.from("[data-note]", { y: 16, opacity: 0, duration: 0.45, stagger: 0.08, delay: 0.35 });
  }, { scope: root });

  return <section ref={root} className={styles.plan} aria-busy={saving} data-saved={saved || undefined}>
    <header className={styles.header}>
      <span className={styles.status} data-reveal><span className={styles.dot} aria-hidden="true" />{saved ? "Saved garden" : "Unsaved preview"}</span>
      <h2 ref={heading} tabIndex={-1} data-reveal>{saved ? "My Garden" : "Your Garden Plan"}</h2>
      <p className={styles.meta} data-reveal>{plan.input.widthM}m × {plan.input.lengthM}m · {saved ? plan.input.crops.map((crop) => CROPS[crop].name).join(", ") : `${plan.input.crops.length} crops selected`}</p>
    </header>
    <div className={styles.body}>
      <div className={styles.mapColumn} data-reveal><GardenMap plan={plan} /></div>
      <div className={styles.aside}>
        <section className={styles.explanations} aria-labelledby="why-heading">
          <h3 id="why-heading" data-reveal>Why this layout works</h3>
          {plan.relationships.length ? <ul className={styles.notes}>
            {plan.relationships.map((pair) => <li key={pair.crops.join(":")} data-note className={`${styles.note} ${pair.kind === "conflict" ? styles.conflict : pair.kind === "advisory" ? styles.advisory : styles.companion}`}>
              <span className={styles.label}>{pair.kind === "companion" ? <LeafIcon /> : <AlertIcon />}{NOTE_LABELS[pair.kind]}</span>
              <h4><span className={styles.pairIcons} aria-hidden="true">{pair.crops.map((crop) => <PlantIcon key={crop} crop={crop} />)}</span>{pair.crops.map((crop) => CROPS[crop].name).join(" + ")}</h4>
              <p>{pair.explanation}</p>
              {pair.kind === "conflict" ? <p className={styles.attribution}>This is the provider&apos;s evidence category, not independent verification by Shamba AI.</p> : null}
            </li>)}
          </ul> : <p className={styles.noNotes} data-note><InfoIcon />The provider supplied planting rows without usable companion notes. This guide does not establish that every combination is compatible.</p>}
        </section>
        <div className={styles.actionCard} data-reveal>
          <div className={styles.actions}>
            {!saved ? <Button variant="primary" loading={saving} disabled={saveDisabled || !onSave} onClick={onSave} aria-describedby="save-note"><BookmarkIcon />Save Garden</Button>
              : <Button variant="primary" disabled={!onIdentify} onClick={onIdentify} aria-describedby="save-note"><ScanIcon />Identify an unwanted plant</Button>}
            <Button disabled={saving} variant="outline" onClick={onChange}><PencilIcon />Change Garden</Button>
          </div>
          <p className={styles.saveNote} id="save-note">{saved ? "Identify plants in this saved garden and keep their results together." : onSave ? "Your preview stays separate until you save it." : "Saving isn’t available yet. You can still adjust your garden guide."}</p>
        </div>
      </div>
    </div>
  </section>;
}
