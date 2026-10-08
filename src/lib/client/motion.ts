import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);
gsap.defaults({ ease: "power2.out", duration: 0.4 });

// Checked when an animation starts: motion runs only for visitors who have not asked to reduce it.
export function motionAllowed() {
  return typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
}

export { gsap, useGSAP };
