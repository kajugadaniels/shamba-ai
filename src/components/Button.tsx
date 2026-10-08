"use client";

import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "destructive";
  loading?: boolean;
};

// Keep the label and width stable; the spinner lives in the reserved trailing space.
export function Button({ variant = "outline", loading = false, disabled, type = "button", className = "", children, ...props }: ButtonProps) {
  return <button {...props} type={type} disabled={disabled || loading} aria-busy={loading || props["aria-busy"]}
    data-loading={loading || undefined} className={`${styles.button} ${styles[variant]} ${className}`}>
    <span className={styles.content}>{children}</span>
    {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
  </button>;
}
