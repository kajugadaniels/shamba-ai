import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeftIcon, BrandMark } from "./Icons";
import styles from "./AuthShell.module.css";

// Shared frame for the direct sign-in and sign-up routes; in-app sign-in uses Clerk's dialog instead.
export function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return <main className={styles.shell}>
    <Link href="/" className={styles.brand}><BrandMark className={styles.mark} />Shamba AI</Link>
    <div className={styles.intro}>
      <h1>{title}</h1>
      <p>An account lets you save one garden, come back to it, and keep a history of plants you identify there.</p>
    </div>
    {children}
    <Link href="/" className={styles.back}><ArrowLeftIcon />Back to Shamba AI</Link>
  </main>;
}
