import type { CropId } from "@/lib/crops";

export function PlantIcon({ crop, className }: { crop: CropId | "sprout"; className?: string }) {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
    {crop === "tomato" ? <>
      <path d="M33 23C13 13 7 29 12 44c5 15 34 17 42 1 9-19-2-30-21-22Z" fill="#D5785F" />
      <path d="m32 26-12-8 12 2 6-13 2 13 13-3-11 10-5-3-5 2Z" fill="#527C49" />
      <path d="M20 33c-3 4-3 8-1 12" stroke="#F2B19B" strokeWidth="4" strokeLinecap="round" />
    </> : crop === "carrot" ? <>
      <path d="M22 25c-4 12 0 31 3 34 3 0 15-12 18-25 4-15-17-22-21-9Z" fill="#DB9851" />
      <path d="m31 25 3-15m-3 14L21 8m12 17L47 12" stroke="#668B4D" strokeWidth="5" strokeLinecap="round" />
      <path d="m23 34 9 4m-9 6 6 3" stroke="#B8793A" strokeWidth="2" strokeLinecap="round" />
    </> : crop === "onion" ? <>
      <path d="M31 23C14 33 10 40 15 49c7 13 33 12 37 0 4-13-9-22-17-26Z" fill="#C6AAC8" />
      <path d="M32 26c-9 9-13 20-6 29m8-29c9 10 12 21 4 30" stroke="#A688AA" strokeWidth="2" />
      <path d="m30 24-6-15m9 15 0-19m3 19 8-14" stroke="#70925D" strokeWidth="4" strokeLinecap="round" />
      <path d="m26 56-3 5m9-5v6m6-6 4 5" stroke="#8A6746" strokeWidth="1.5" />
    </> : <>
      <path d="M31 54V24" stroke="#456F45" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 38C10 38 7 26 10 18c14-2 24 5 22 20Z" fill="#739959" />
      <path d="M32 29C31 13 42 7 54 10c2 14-5 22-22 19Z" fill="#93AF71" />
      <path d="M32 48C32 34 43 29 54 33c0 13-9 19-22 15Z" fill="#658B53" />
      <path d="m16 24 15 13m15-20L33 28m14 11-14 9" stroke="#3E6D47" strokeWidth="1.5" strokeLinecap="round" />
    </>}
  </svg>;
}
