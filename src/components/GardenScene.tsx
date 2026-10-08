"use client";

import { useRef, type ReactNode } from "react";
import { CROPS, type CropId } from "@/lib/crops";
import { gsap, motionAllowed, useGSAP, useHydrated } from "@/lib/client/motion";
import styles from "./GardenScene.module.css";

const PLANTS: Array<{ crop: CropId; x: number; art: ReactNode }> = [
  { crop: "tomato", x: 150, art: <>
    <path d="M0 2V-108" stroke="#9B7651" strokeWidth="4" strokeLinecap="round" />
    <path d="M3 2C3-30-1-62 3-98" stroke="#4F7F45" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M3-30C-17-35-30-27-36-14-20-10-6-16 3-30Z" fill="#5E8F4E" />
    <path d="M3-52C21-58 33-50 39-38 23-33 9-40 3-52Z" fill="#6F9E55" />
    <path d="M3-74C-15-80-28-72-32-60-18-55-4-62 3-74Z" fill="#5E8F4E" />
    <path d="M3-92C15-100 27-96 31-86 19-80 9-84 3-92Z" fill="#6F9E55" />
    <circle cx="-18" cy="-40" r="10" fill="#D5785F" /><circle cx="-21" cy="-43" r="2.5" fill="#F2B19B" />
    <circle cx="21" cy="-64" r="11" fill="#C9654A" /><circle cx="18" cy="-67" r="2.5" fill="#F2B19B" />
    <circle cx="-13" cy="-84" r="8" fill="#D5785F" />
  </> },
  { crop: "carrot", x: 250, art: <>
    <path d="M0 0C-4-20-14-34-26-44M0 0C0-24 2-44 6-60M0 0C6-18 16-30 28-38" stroke="#5E8F4E" strokeWidth="4" strokeLinecap="round" fill="none" />
    <ellipse cx="-26" cy="-46" rx="9" ry="5.5" transform="rotate(-35 -26 -46)" fill="#6F9E55" />
    <ellipse cx="-14" cy="-30" rx="8" ry="5" transform="rotate(-50 -14 -30)" fill="#7FAA62" />
    <ellipse cx="6" cy="-62" rx="6" ry="9" fill="#6F9E55" />
    <ellipse cx="4" cy="-40" rx="5" ry="8" transform="rotate(10 4 -40)" fill="#7FAA62" />
    <ellipse cx="29" cy="-40" rx="9" ry="5.5" transform="rotate(30 29 -40)" fill="#6F9E55" />
    <path d="M-12 3C-12-8 12-8 12 3Z" fill="#DB9851" />
  </> },
  { crop: "onion", x: 350, art: <>
    <path d="M-4 0C-8-30-14-58-22-80M0 0C0-34 2-66 2-96M4 0C10-26 16-50 24-70" stroke="#6F9E55" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M-15 3C-15-15 15-15 15 3Z" fill="#C6AAC8" />
    <path d="M0-13V3M-7-9c-2 4-2 8 0 12M7-9c2 4 2 8 0 12" stroke="#A688AA" strokeWidth="1.8" fill="none" />
  </> },
  { crop: "basil", x: 450, art: <>
    <path d="M0 2V-50" stroke="#4F7F45" strokeWidth="4" strokeLinecap="round" />
    <ellipse cx="-17" cy="-16" rx="17" ry="10" transform="rotate(-25 -17 -16)" fill="#739959" />
    <ellipse cx="17" cy="-22" rx="17" ry="10" transform="rotate(25 17 -22)" fill="#93AF71" />
    <ellipse cx="-13" cy="-40" rx="15" ry="9" transform="rotate(-35 -13 -40)" fill="#93AF71" />
    <ellipse cx="13" cy="-44" rx="15" ry="9" transform="rotate(35 13 -44)" fill="#739959" />
    <ellipse cx="0" cy="-60" rx="10" ry="14" fill="#658B53" />
  </> },
];

// Decorative hero art. Chosen crops grow; the others rest as seedlings until picked.
export function GardenScene({ crops }: { crops: CropId[] }) {
  const hydrated = useHydrated();
  return hydrated ? <SceneArt crops={crops} /> : <div className={styles.scene} aria-hidden="true" />;
}

function SceneArt({ crops }: { crops: CropId[] }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!motionAllowed()) return;
    const q = gsap.utils.selector(root);
    const sways = q("[data-sway]");
    gsap.from(sways, { scale: 0, transformOrigin: "50% 100%", duration: 1, ease: "back.out(1.5)", stagger: 0.14, delay: 0.25 });
    sways.forEach((plant, index) => gsap.fromTo(plant, { rotation: index % 2 ? 2.5 : -2.5 }, { rotation: index % 2 ? -2.5 : 2.5, transformOrigin: "50% 100%", duration: 2.6 + index * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 }));
    gsap.from(q("[data-bed]"), { y: 30, opacity: 0, duration: 0.8 });
    gsap.to(q("[data-rays]"), { rotation: 360, transformOrigin: "50% 50%", duration: 50, ease: "none", repeat: -1 });
    q("[data-cloud]").forEach((cloud, index) => gsap.to(cloud, { x: index ? -28 : 34, duration: 9 + index * 3, ease: "sine.inOut", yoyo: true, repeat: -1 }));
    gsap.to(q("[data-wing]"), { scaleY: 0.35, transformOrigin: "50% 100%", duration: 0.08, ease: "none", yoyo: true, repeat: -1 });
    const flight = [[110, -34], [230, 6], [320, -24], [170, 26], [0, 0]];
    gsap.to(q("[data-bee]"), { keyframes: flight.map(([x, y]) => ({ x, y, duration: 2.8, ease: "sine.inOut" })), repeat: -1 });

    // Gentle depth on precise pointers only; layers drift by their depth factor.
    const element = root.current;
    if (!element || !window.matchMedia("(pointer: fine)").matches) return;
    const layers = q("[data-depth]").map((layer) => ({ depth: Number(layer.getAttribute("data-depth")), x: gsap.quickTo(layer, "x", { duration: 0.9, ease: "power3" }), y: gsap.quickTo(layer, "y", { duration: 0.9, ease: "power3" }) }));
    const move = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      const dx = (event.clientX - box.left) / box.width - 0.5, dy = (event.clientY - box.top) / box.height - 0.5;
      layers.forEach((layer) => { layer.x(dx * layer.depth * 22); layer.y(dy * layer.depth * 12); });
    };
    const rest = () => layers.forEach((layer) => { layer.x(0); layer.y(0); });
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerleave", rest);
    return () => { element.removeEventListener("pointermove", move); element.removeEventListener("pointerleave", rest); };
  }, { scope: root });

  return <div ref={root} className={styles.scene} aria-hidden="true">
    <svg viewBox="0 0 600 440" preserveAspectRatio="xMidYMid slice" focusable="false">
      <rect width="600" height="440" fill="#E6F0DE" />
      <g data-depth="0.35">
        <g transform="translate(482 92)">
          <g data-rays>{Array.from({ length: 8 }, (_, index) => <rect key={index} x="-3.5" y="-66" width="7" height="16" rx="3.5" fill="#ECC15B" transform={`rotate(${index * 45})`} />)}</g>
          <circle r="38" fill="#ECC15B" />
        </g>
        <g transform="translate(116 92)"><g data-cloud><rect x="-48" y="-4" width="96" height="26" rx="13" fill="#FFFDF8" /><circle cx="-12" cy="-4" r="20" fill="#FFFDF8" /><circle cx="17" cy="0" r="14" fill="#FFFDF8" /></g></g>
        <g transform="translate(318 56)"><g data-cloud><rect x="-34" y="-2" width="68" height="20" rx="10" fill="#FFFDF8" /><circle cx="-6" cy="-2" r="15" fill="#FFFDF8" /></g></g>
      </g>
      <g data-depth="0.7">
        <path d="M-40 278C60 224 170 220 262 256c80 32 170-40 378-14V460H-40Z" fill="#CFE2BE" />
      </g>
      <g data-depth="1.1">
        <path d="M-40 334c140-38 280-26 400-6 100 16 180-12 280-16V460H-40Z" fill="#B7D49C" />
        <rect x="-40" y="402" width="680" height="60" fill="#9DC27F" />
      </g>
      <g data-depth="1.5">
        <g data-bed>
          <rect x="56" y="298" width="488" height="24" rx="8" fill="#5A3F2C" />
          {PLANTS.map(({ crop, x, art }) => <g key={crop} transform={`translate(${x} 306)`}>
            <g className={styles.plant} data-state={crops.length && !crops.includes(crop) ? "resting" : "growing"}><g data-sway>{art}</g></g>
          </g>)}
          <rect x="62" y="316" width="476" height="92" rx="10" fill="#8A6746" />
          <rect x="62" y="346" width="476" height="3" fill="#76573B" />
          <rect x="62" y="377" width="476" height="3" fill="#76573B" />
          <rect x="46" y="304" width="24" height="110" rx="6" fill="#6E5036" />
          <rect x="530" y="304" width="24" height="110" rx="6" fill="#6E5036" />
          {PLANTS.map(({ crop, x }) => <g key={crop} transform={`translate(${x} 362)`}>
            <g className={styles.tag} data-selected={crops.includes(crop) || undefined}><rect x="-38" y="-15" width="76" height="30" rx="15" /><text y="5" textAnchor="middle">{CROPS[crop].name}</text></g>
          </g>)}
        </g>
        <g transform="translate(150 214)"><g data-bee>
          <ellipse data-wing cx="-3" cy="-9" rx="6" ry="8" fill="#FFFDF8" />
          <ellipse data-wing cx="5" cy="-9" rx="6" ry="8" fill="#FFFDF8" />
          <ellipse rx="12" ry="8.5" fill="#ECC15B" />
          <rect x="-4" y="-8" width="3.5" height="16" rx="1.5" fill="#3A2E1F" /><rect x="3" y="-8" width="3.5" height="16" rx="1.5" fill="#3A2E1F" />
          <circle cx="12" cy="0" r="5" fill="#3A2E1F" />
        </g></g>
      </g>
    </svg>
  </div>;
}
