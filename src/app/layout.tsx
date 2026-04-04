import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans, JetBrains_Mono, Source_Code_Pro } from "next/font/google";
import { cn } from "@/lib/utils";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600"],
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Docksmith | AI-Powered Code Review, Security Testing & Interaction Testing",
  description:
    "Deep code review, autonomous security testing, and interaction testing in a single platform. AI agents review your code, attack your app, and stress-test your UI inside cloud sandboxes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(jakarta.variable, jetbrains.variable, sourceCodePro.variable)}>
      <body>{children}</body>
    </html>
  );
}
