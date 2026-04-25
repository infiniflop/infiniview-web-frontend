import type { Metadata } from "next";
import "./globals.css";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

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
  title: "Infiniview — attack your code before anyone else does",
  description:
    "Continuous adversarial review for your codebase. Pull requests and on-demand scans are reviewed with AI agents that attack the way a real outsider would, with reproducible proof and a suggested fix — never a wall of warnings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(interTight.variable, jetbrains.variable)}>
      <body>{children}</body>
    </html>
  );
}
