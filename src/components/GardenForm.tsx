"use client";

import type { CSSProperties } from "react";
import { CROP_IDS, CROPS, type CropId } from "@/lib/crops";
import { gsap, motionAllowed } from "@/lib/client/motion";
import { PlantIcon } from "./PlantIcon";
import { Button } from "./Button";
import { AlertIcon, ArrowRightIcon, CheckIcon } from "./Icons";
import styles from "./GardenForm.module.css";

export type FormValues = { width: string; length: string; crops: CropId[] };
export type FormErrors = Partial<Record<"width" | "length" | "crops", string>>;

const CROP_TYPES: Record<CropId, string> = { tomato: "Fruiting", carrot: "Root", onion: "Bulb", basil: "Herb" };
const QUICK_SIZES = [["1", "2"], ["1.2", "2.4"], ["2", "3"]] as const;

function meters(value: string) {
  const number = value.trim() ? Number(value) : NaN;
  return Number.isFinite(number) && number >= 1 && number <= 5 ? number : null;
}

export function GardenForm({ values, errors, busy, onChange, onGenerate }: {
  values: FormValues; errors: FormErrors; busy: boolean;
  onChange: (values: FormValues) => void; onGenerate: () => void;
}) {
  function toggle(crop: CropId, tile: HTMLElement) {
    const selecting = !values.crops.includes(crop);
    onChange({ ...values, crops: selecting ? [...values.crops, crop] : values.crops.filter((id) => id !== crop) });
    const icon = tile.querySelector("[data-crop-icon]");
    if (icon && motionAllowed()) {
      gsap.fromTo(icon, selecting ? { scale: 0.7, rotation: -14 } : { scale: 1.08, rotation: 0 },
        { scale: 1, rotation: 0, duration: selecting ? 0.6 : 0.3, ease: selecting ? "back.out(3)" : "power2.out", overwrite: true, clearProps: "transform" });
    }
  }
  const width = meters(values.width), length = meters(values.length);
  // Live outline of the bed: width runs across, length runs down, like the generated map.
  const shape = width !== null && length !== null
    ? { width: `${(width / Math.max(width, length)) * 100}%`, height: `${(length / Math.max(width, length)) * 100}%`, label: `${width} × ${length} m` }
    : null;
  const count = values.crops.length;

  return <form className={styles.form} noValidate onSubmit={(event) => { event.preventDefault(); onGenerate(); }} aria-busy={busy}>
    <fieldset className={styles.section} disabled={busy}>
      <legend><span className={styles.step} aria-hidden="true">1</span>Garden size</legend>
      <p className={styles.hint}>A rectangular garden or raised bed, measured in meters.</p>
      <div className={styles.sizeGrid}>
        <div>
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
            <span className={styles.quickLabel}>Quick sizes</span>
            {QUICK_SIZES.map(([w, l]) => <button key={`${w}x${l}`} type="button" className={styles.chip} data-active={values.width === w && values.length === l || undefined}
              aria-label={`Use a ${w} by ${l} meter bed`} onClick={() => onChange({ ...values, width: w, length: l })}>{w} × {l} m</button>)}
          </div>
        </div>
        <div className={styles.bedPreview} aria-hidden="true">
          <div className={styles.bedBox}>
            <div className={styles.bedShape} data-ready={shape ? true : undefined}
              style={{ width: shape?.width ?? "62%", height: shape?.height ?? "62%" }} />
          </div>
          <span>{shape?.label ?? "Your bed shape"}</span>
        </div>
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
            <span className={styles.check} aria-hidden="true">{selected ? <CheckIcon /> : null}</span>
            <span className={styles.cropIcon} data-crop-icon aria-hidden="true"><PlantIcon crop={crop} /></span>
            <span className={styles.cropName}>{CROPS[crop].name}</span>
            <span className={styles.cropType} aria-hidden="true">{CROP_TYPES[crop]}</span>
          </button>;
        })}
      </div>
      {errors.crops ? <p id="crops-error" tabIndex={-1} className={styles.error}><AlertIcon />{errors.crops}</p> : null}
    </fieldset>
    <div className={styles.submit}>
      <Button className={styles.generate} type="submit" variant="primary" loading={busy}>
        Generate Garden Plan<ArrowRightIcon data-nudge />
      </Button>
      <p className={styles.bottomNote}>No account needed to start planning.</p>
    </div>
  </form>;
}
