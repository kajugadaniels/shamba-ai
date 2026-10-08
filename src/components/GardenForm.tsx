"use client";

import type { CSSProperties } from "react";
import { CROP_IDS, CROPS, type CropId } from "@/lib/crops";
import { gsap, motionAllowed } from "@/lib/client/motion";
import { PlantIcon } from "./PlantIcon";
import { Button } from "./Button";
import { AlertIcon, CheckIcon, MapIcon } from "./Icons";
import styles from "./GardenForm.module.css";

export type FormValues = { width: string; length: string; crops: CropId[] };
export type FormErrors = Partial<Record<"width" | "length" | "crops", string>>;

const QUICK_SIZES = [["1", "2"], ["1.2", "2.4"], ["2", "3"]] as const;

export function GardenForm({ values, errors, busy, onChange, onGenerate }: {
  values: FormValues; errors: FormErrors; busy: boolean;
  onChange: (values: FormValues) => void; onGenerate: () => void;
}) {
  function toggle(crop: CropId, tile: HTMLElement) {
    const selecting = !values.crops.includes(crop);
    onChange({ ...values, crops: selecting ? [...values.crops, crop] : values.crops.filter((id) => id !== crop) });
    const icon = tile.querySelector("[data-crop-icon]");
    if (selecting && icon && motionAllowed()) gsap.fromTo(icon, { scale: 0.8 }, { scale: 1, duration: 0.35, ease: "back.out(2.5)", overwrite: true, clearProps: "transform" });
  }
  const count = values.crops.length;

  return <form className={styles.form} noValidate onSubmit={(event) => { event.preventDefault(); onGenerate(); }} aria-busy={busy}>
    <fieldset className={styles.section} disabled={busy}>
      <legend><span className={styles.step} aria-hidden="true">1</span>Garden size</legend>
      <p className={styles.hint}>A rectangular garden or raised bed, measured in meters.</p>
      <div className={styles.dimensions}>
        {(["width", "length"] as const).map((field) => <div key={field}>
          <label htmlFor={field}>{field === "width" ? "Width" : "Length"} <span className={styles.unitLabel}>(meters)</span></label>
          <div className={styles.inputWrap}>
            <input id={field} type="number" inputMode="decimal" min="1" max="5" step="any" placeholder={field === "width" ? "2" : "3"}
              value={values[field]} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? `${field}-error` : "dimensions-hint"}
              onChange={(event) => onChange({ ...values, [field]: event.target.value })} />
            <span aria-hidden="true">m</span>
          </div>
          {errors[field] ? <p id={`${field}-error`} className={styles.error}><AlertIcon />{errors[field]}</p> : null}
        </div>)}
      </div>
      <p id="dimensions-hint" className={styles.limit}>1–5 meters each. Decimals are welcome.</p>
      <div className={styles.quick}>
        <span className={styles.quickLabel}>Common sizes:</span>
        {QUICK_SIZES.map(([w, l]) => <button key={`${w}x${l}`} type="button" className={styles.chip} data-active={values.width === w && values.length === l || undefined}
          aria-label={`Use a ${w} by ${l} meter bed`} onClick={() => onChange({ ...values, width: w, length: l })}>{w} × {l} m</button>)}
      </div>
    </fieldset>
    <fieldset className={styles.section} disabled={busy} aria-describedby={errors.crops ? "crops-error" : "crops-hint"}>
      <legend><span className={styles.step} aria-hidden="true">2</span>Choose what you want to grow</legend>
      <div className={styles.cropHint}>
        <p id="crops-hint" className={styles.hint}>Select at least two crops.</p>
        <span className={styles.counter} data-ready={count >= 2 || undefined}>{count} of 4 selected</span>
      </div>
      <div className={styles.crops}>
        {CROP_IDS.map((crop) => {
          const selected = values.crops.includes(crop);
          return <button type="button" key={crop} className={styles.crop} data-selected={selected || undefined} aria-pressed={selected}
            style={{ "--crop-color": CROPS[crop].color } as CSSProperties} onClick={(event) => toggle(crop, event.currentTarget)}>
            <span className={styles.cropIcon} data-crop-icon aria-hidden="true"><PlantIcon crop={crop} /></span>
            <span className={styles.cropName}>{CROPS[crop].name}</span>
            <span className={styles.check} aria-hidden="true">{selected ? <CheckIcon /> : null}</span>
          </button>;
        })}
      </div>
      {errors.crops ? <p id="crops-error" tabIndex={-1} className={styles.error}><AlertIcon />{errors.crops}</p> : null}
    </fieldset>
    <div className={styles.submit}>
      <p className={styles.submitTitle}><span className={styles.step} aria-hidden="true">3</span>Create your plan</p>
      <p className={styles.hint}>Generating can take a little while. You&apos;ll see an estimated wait and can cancel at any time.</p>
      <Button className={styles.generate} type="submit" variant="primary" loading={busy}><MapIcon />Generate Garden Plan</Button>
      <p className={styles.bottomNote}>No account needed to start planning.</p>
    </div>
  </form>;
}
