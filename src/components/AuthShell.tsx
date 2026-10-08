import Link from "next/link";
import type { ReactNode } from "react";
import { CROP_IDS } from "@/lib/crops";
import { PlantIcon } from "./PlantIcon";
import { ArrowLeftIcon, BrandMark, CheckIcon } from "./Icons";
import styles from "./AuthShell.module.css";

const POINTS = ["Save one garden and return to it anytime", "Identify unwanted plants in that garden", "Keep confident results in one history"];

// Shared frame for the direct sign-in and sign-up routes; in-app sign-in uses Clerk's dialog instead.
export function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return <main className={styles.shell}>
    <section className={styles.brandPanel}>
      <Link href="/" className={styles.brand}><BrandMark className={styles.mark} />Shamba AI</Link>
      <div>
        <h1>{title}</h1>
        <ul className={styles.points}>{POINTS.map((point) => <li key={point}><CheckIcon />{point}</li>)}</ul>
      </div>
      <div className={styles.crops} aria-hidden="true">{CROP_IDS.map((crop) => <span key={crop}><PlantIcon crop={crop} /></span>)}</div>
    </section>
    <section className={styles.formPanel}>
      {children}
      <Link href="/" className={styles.back}><ArrowLeftIcon />Back to Shamba AI</Link>
    </section>
  </main>;
}
