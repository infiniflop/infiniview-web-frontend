import type { Metadata } from "next";
import "./globals.css";
import { Archivo, Martian_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";
import { FAQS } from "@/components/site/content";

const SITE_URL = "https://infiniview.dev";
const SITE_DESCRIPTION =
  "AI-powered code review, SAST, DAST, and penetration testing — fully automated in cloud sandboxes. Proof-backed security findings for every vulnerability.";

// One family does the work: Archivo's width axis runs from condensed (62)
// to extended (125). Martian Mono is reserved for real code and traces.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
  display: "swap",
});

const martian = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-martian",
  axes: ["wdth"],
  display: "swap",
});

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
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

// Runs before paint. Sets the saved theme for the /preview product mirror
// (the marketing site itself is always dark; the demo embedded on the home
// page, ?embed=1, matches it), and marks the document as scripted so
// entrance animations may start content hidden.
const themeInitScript = `(function(){try{var c=document.cookie.match(/(?:^|; )theme=(light|dark)/);var s=localStorage.getItem('theme');var t=(c?c[1]:null)||(s==='light'||s==='dark'?s:null)||(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');if(t==='light'&&!/[?&]embed=1/.test(location.search))document.documentElement.classList.add('light');}catch(e){}document.documentElement.classList.add('js');})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(archivo.variable, martian.variable)}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
