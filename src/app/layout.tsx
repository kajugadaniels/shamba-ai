import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { GlobalLoadingProvider } from "@/components/GlobalLoading";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
export const metadata: Metadata = {
  title: "Shamba AI | Your small food garden",
  description: "Plan a small food garden that works better together.",
};
export const viewport: Viewport = { themeColor: "#F7F5EE" };

// Flat Clerk surfaces: borders instead of shadows, shared button height and radius.
const flatButton = { height: "var(--button-height)", minHeight: "var(--button-height)", paddingBlock: "0", boxShadow: "none" };
const appearance = {
  variables: { colorPrimary: "#1F4D3A", borderRadius: "12px", fontFamily: "var(--font-manrope)" },
  elements: {
    cardBox: { boxShadow: "none", border: "1.5px solid #DDE3D6", borderRadius: "28px" },
    card: { boxShadow: "none" },
    formButtonPrimary: { ...flatButton, fontWeight: 700 },
    socialButtonsBlockButton: flatButton,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // The font variable sits on <html> so the :root --font-sans token can resolve it.
  return <html lang="en" className={manrope.variable}><body><ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" signInForceRedirectUrl="/" signUpForceRedirectUrl="/" appearance={appearance}><GlobalLoadingProvider>{children}</GlobalLoadingProvider></ClerkProvider></body></html>;
}
