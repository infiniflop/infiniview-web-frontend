import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { Magnetic } from "@/components/site/magnetic";
import { DOCS_URL } from "@/lib/site";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <Magnetic />
      <Nav docsUrl={DOCS_URL} />
      {children}
      <Footer docsUrl={DOCS_URL} />
    </SmoothScroll>
  );
}
