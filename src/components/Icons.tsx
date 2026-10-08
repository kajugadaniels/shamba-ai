import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
const stroke = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, focusable: false } as const;

export function ArrowRightIcon(props: IconProps) { return <svg {...stroke} {...props}><path d="M5 12h14M13 6l6 6-6 6" /></svg>; }
export function ArrowLeftIcon(props: IconProps) { return <svg {...stroke} {...props}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>; }
export function CheckIcon(props: IconProps) { return <svg {...stroke} {...props}><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>; }
export function AlertIcon(props: IconProps) { return <svg {...stroke} {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" /></svg>; }
export function InfoIcon(props: IconProps) { return <svg {...stroke} {...props}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.5v.01" /></svg>; }
export function CameraIcon(props: IconProps) { return <svg {...stroke} {...props}><path d="M3.5 8.5A2.5 2.5 0 0 1 6 6h1.7l1.5-2h5.6l1.5 2H18a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5z" /><circle cx="12" cy="12.5" r="3.5" /></svg>; }
export function ScanIcon(props: IconProps) { return <svg {...stroke} {...props}><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M7 12h10" /></svg>; }
export function FocusIcon(props: IconProps) { return <svg {...stroke} {...props}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.4-4.4" /></svg>; }
export function FrameIcon(props: IconProps) { return <svg {...stroke} {...props}><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M12 16.5V11m0 0c-2.4 0-3.6-1.3-3.6-3.2 2.2 0 3.6 1 3.6 3.2Zm0 1.2c0-2 1.3-3.2 3.6-3.2 0 2-1.3 3.2-3.6 3.2Z" /></svg>; }
export function SunIcon(props: IconProps) { return <svg {...stroke} {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></svg>; }
export function ClockIcon(props: IconProps) { return <svg {...stroke} {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.2 2" /></svg>; }
export function BookmarkIcon(props: IconProps) { return <svg {...stroke} {...props}><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z" /></svg>; }
export function PencilIcon(props: IconProps) { return <svg {...stroke} {...props}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></svg>; }
export function LeafIcon(props: IconProps) { return <svg {...stroke} {...props}><path d="M5 19c0-8 5-13.5 14.5-14.5C19.5 14 14 19 5 19Z" /><path d="m5 19 8-8" /></svg>; }
export function RulerIcon(props: IconProps) { return <svg {...stroke} {...props}><path d="m3.5 15.5 12-12 5 5-12 12z" /><path d="m7.5 11.5 2 2M10.5 8.5l2 2M13.5 5.5l2 2" /></svg>; }
export function MapIcon(props: IconProps) { return <svg {...stroke} {...props}><path d="M3.5 6.5 9 4l6 2.5L20.5 4v13.5L15 20l-6-2.5-5.5 2.5z" /><path d="M9 4v13.5M15 6.5V20" /></svg>; }

// Flat brand mark: forest tile with a two-leaf sprout.
export function BrandMark({ className }: { className?: string }) {
  return <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" className={className}>
    <rect width="40" height="40" rx="12" fill="#1F4D3A" />
    <path d="M20 31.5V18.5" stroke="#F7F5EE" strokeWidth="2.6" strokeLinecap="round" />
    <path d="M20 23c-6.6 0-9.2-3.7-8.7-8.4 5.3-.6 9.3 2.5 8.7 8.4Z" fill="#A8C686" />
    <path d="M20 19.4c-.3-5.7 3.4-8.9 8.7-8.5.4 5.1-3 8.9-8.7 8.5Z" fill="#F7F5EE" />
  </svg>;
}
