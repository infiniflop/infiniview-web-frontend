import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { mona, jetbrains } from "@/lib/site/fonts";
import { SiteShell } from "@/components/site/shell";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { NotFoundContent } from "@/components/site/status-page";
import "./(site)/site.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

// Lives at the root so it also catches URLs outside the (site) group; it brings its own
// fonts and shell because the root layout intentionally has neither.
export default function NotFound() {
  return (
    <div className={cn(mona.variable, jetbrains.variable)}>
      <SiteShell>
        <Nav />
        <NotFoundContent />
        <Footer />
      </SiteShell>
    </div>
  );
}
