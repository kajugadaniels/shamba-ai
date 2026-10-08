"use client";

import { CROP_IDS, CROPS, type CropId } from "@/lib/crops";
import { PlantIcon } from "./PlantIcon";
import styles from "./GardenForm.module.css";

export type FormValues = { width: string; length: string; crops: CropId[] };
export type FormErrors = Partial<Record<"width" | "length" | "crops", string>>;

export function GardenForm({ values, errors, busy, onChange, onGenerate }: {
  values: FormValues; errors: FormErrors; busy: boolean;
  onChange: (values: FormValues) => void; onGenerate: () => void;
}) {
  function toggle(crop: CropId) {
    onChange({ ...values, crops: values.crops.includes(crop) ? values.crops.filter((id) => id !== crop) : [...values.crops, crop] });
  }
  return <form className={styles.form} noValidate onSubmit={(event) => { event.preventDefault(); onGenerate(); }} aria-busy={busy}>
    <fieldset className={styles.section} disabled={busy}>
      <legend>Garden size</legend>
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
          {errors[field] ? <p id={`${field}-error`} className={styles.error}>{errors[field]}</p> : null}
        </div>)}
      </div>
      <p id="dimensions-hint" className={styles.limit}>1–5 meters each. Decimals are welcome.</p>
    </fieldset>
    <fieldset className={styles.section} disabled={busy} aria-describedby={errors.crops ? "crops-error" : "crops-hint"}>
      <legend>Choose what you want to grow</legend>
      <div className={styles.cropHint}><p id="crops-hint" className={styles.hint}>Select at least two crops.</p><span>{values.crops.length} selected</span></div>
      <div className={styles.crops}>
        {CROP_IDS.map((crop) => <button type="button" key={crop} className={`${styles.crop} ${values.crops.includes(crop) ? styles.selected : ""}`}
          aria-pressed={values.crops.includes(crop)} onClick={() => toggle(crop)}>
          <span className={styles.check} aria-hidden="true">{values.crops.includes(crop) ? "✓" : ""}</span>
          <PlantIcon crop={crop} />
          <span>{CROPS[crop].name}</span>
        </button>)}
      </div>
      {errors.crops ? <p id="crops-error" tabIndex={-1} className={styles.error}>{errors.crops}</p> : null}
    </fieldset>
    <button className={styles.generate} type="submit" disabled={busy} aria-busy={busy}>
      Generate Garden Plan <span aria-hidden="true">↗</span>
    </button>
    <p className={styles.bottomNote}>No account needed to start planning.</p>
  </form>;
}
