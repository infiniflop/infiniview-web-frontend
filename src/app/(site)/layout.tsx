import type { ReactNode } from "react";
import type { Viewport } from "next";
import { cn } from "@/lib/utils";
import { mona, jetbrains } from "@/lib/site/fonts";
import { SiteShell } from "@/components/site/shell";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import "./site.css";

export const viewport: Viewport = {
  themeColor: "#03040a",
  colorScheme: "dark",
  // extend under notches/home indicators; the stylesheet pads with env(safe-area-inset-*)
  viewportFit: "cover",
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cn(mona.variable, jetbrains.variable)}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteShell>
        <Nav />
        {children}
        <Footer />
      </SiteShell>
    </div>
  );
}
