// Static demo UI. All data is mocked. No backend logic.

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

// The demo mirrors the product dashboard, so it keeps the product's faces.
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Dashboard preview — Infiniview",
  description:
    "Static, sample-data preview of the Infiniview dashboard. All data shown is fictional and intended for demonstration only.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cn("dark preview-fonts", interTight.variable, jetbrains.variable)}>
      {children}
    </div>
  );
}
