import type { ReactNode } from "react";
import type { Viewport } from "next";
import { Mona_Sans, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { SiteShell } from "@/components/site/shell";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import "./site.css";

// Mona Sans is a variable family with a width axis (wdth 75–125). Headlines
// lean on that axis; JetBrains Mono is reserved for real code and traces.
const mona = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-mona",
  axes: ["wdth"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#03040a",
  colorScheme: "dark",
};

// If the motion layer never boots (blocked script, hydration error), reveal
// everything after a grace period instead of leaving the page invisible.
const failsafe = `setTimeout(function(){if(document.documentElement.dataset.motion!=='ready')document.documentElement.classList.add('reveal-failsafe')},5000);`;

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className={cn(mona.variable, jetbrains.variable)}>
      <script dangerouslySetInnerHTML={{ __html: failsafe }} />
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
