"use client";

import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "destructive";
  size?: "md" | "sm";
  loading?: boolean;
};

// Keep the label and width stable: while pending, the spinner takes the leading icon's place.
export function Button({ variant = "outline", size = "md", loading = false, disabled, type = "button", className = "", children, ...props }: ButtonProps) {
  return <button {...props} type={type} disabled={disabled || loading} aria-busy={loading || props["aria-busy"]}
    data-loading={loading || undefined} className={`${styles.button} ${styles[variant]} ${size === "sm" ? styles.sm : ""} ${className}`}>
    <span className={styles.content}>{loading ? <span className={styles.spinner} aria-hidden="true" /> : null}{children}</span>
  </button>;
}
