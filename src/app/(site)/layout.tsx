import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/site/motion/smooth-scroll";
import { Reveals } from "@/components/site/motion/reveals";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-2 focus:text-graphite"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">{children}</main>
      <Footer />
      <Reveals />
    </SmoothScroll>
  );
}
