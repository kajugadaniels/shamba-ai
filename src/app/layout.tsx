import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
export const metadata: Metadata = {
  title: "Shamba AI | Your small food garden",
  description: "Plan a small food garden that works better together.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={manrope.variable}><MotionProvider>{children}</MotionProvider></body></html>;
}
