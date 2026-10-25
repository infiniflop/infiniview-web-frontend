import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { jsonLd } from "@/lib/site/jsonld";

const SITE_URL = "https://infiniview.dev";
const SITE_DESCRIPTION =
  "AI-powered code review, SAST, DAST, and penetration testing — fully automated in cloud sandboxes. Proof-backed security findings for every vulnerability.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Infiniview - attack your code before anyone else does",
    template: "%s | Infiniview",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Infiniview",
    locale: "en_US",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    description: SITE_DESCRIPTION,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Infiniview",
      url: SITE_URL,
      email: "hello@infiniflop.com",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Infiniview",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "Infiniview",
      applicationCategory: "SecurityApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
    },
  ],
};

// Runs before paint to set the initial theme - avoids a flash of the wrong
// palette on first load. Reads the saved preference, then falls back to the
// OS preference. Also flags `js` so scroll-reveal content is only hidden when
// script can reveal it, marks everything except the light/dark /preview demo as a dark surface (so
// the page ground and overscroll area are right at first paint), and arms a failsafe that un-hides marketing content if the
// motion layer never boots (a no-op elsewhere, e.g. /preview). Kept tiny and
// inlined; no React state involved.
const themeInitScript = `(function(){try{var c=document.cookie.match(/(?:^|; )theme=(light|dark)/);var s=localStorage.getItem('theme');var t=(c?c[1]:null)||(s==='light'||s==='dark'?s:null)||(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');if(t==='light')document.documentElement.classList.add('light');}catch(e){}document.documentElement.classList.add('js');if(location.pathname.indexOf('/preview')!==0)document.documentElement.classList.add('surface-dark');setTimeout(function(){if(document.querySelector('.site-root')&&document.documentElement.dataset.motion!=='ready')document.documentElement.classList.add('reveal-failsafe')},5000);})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
