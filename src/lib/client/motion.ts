import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useSyncExternalStore } from "react";

gsap.registerPlugin(useGSAP);
gsap.defaults({ ease: "power3.out", duration: 0.5 });

const REDUCE = "(prefers-reduced-motion: reduce)";
const canQuery = () => typeof window !== "undefined" && typeof window.matchMedia === "function";

// Checked when an animation starts: decorative motion runs only for visitors who have not asked to reduce it.
export function motionAllowed() {
  return canQuery() && window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
}

function subscribeReduced(onChange: () => void) {
  if (!canQuery()) return () => {};
  const query = window.matchMedia(REDUCE);
  query.addEventListener?.("change", onChange);
  return () => query.removeEventListener?.("change", onChange);
}
export function useReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => canQuery() && window.matchMedia(REDUCE).matches, () => false);
}

// False on the server and during hydration, so client-only artwork never mismatches server HTML.
const subscribeNever = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(subscribeNever, () => true, () => false);
}

export { gsap, useGSAP };
