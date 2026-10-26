import type { Metadata, Viewport } from "next";
import { cn } from "@/lib/utils";
import { mona, jetbrains } from "@/lib/site/fonts";
import { SiteShell } from "@/components/site/shell";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { NotFoundContent } from "@/components/site/status-page";
import "./globals.css";
import "./(site)/site.css";

export const metadata: Metadata = {
  // this document sits outside the root layout, so it does not inherit its metadataBase
  metadataBase: new URL("https://infiniview.dev"),
  // Next adds <meta name="robots" content="noindex"> to every 404 itself
  title: "Page not found | Infiniview",
};

export const viewport: Viewport = {
  themeColor: "#03040a",
  colorScheme: "dark",
  viewportFit: "cover",
};

/**
 * The 404 for every URL that matches no route. It is a document of its own (Next's global-not-found),
 * so the marketing stylesheet and fonts are loaded here and by the site routes only, never by /preview.
 * It has to repeat the two classes the root layout's bootstrap script would set.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={cn("js surface-dark", mona.variable, jetbrains.variable)} suppressHydrationWarning>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SiteShell>
          <Nav />
          <NotFoundContent />
          <Footer />
        </SiteShell>
      </body>
    </html>
  );
}
