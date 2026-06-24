import type { Metadata } from "next";
import "./globals.css";
import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";

const SITE_URL = "https://infiniview.dev";
const SITE_DESCRIPTION =
  "AI-powered code review, SAST, DAST, and penetration testing — fully automated in cloud sandboxes. Proof-backed security findings for every vulnerability.";

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
      mainEntity: [
        {
          "@type": "Question",
          name: "How is this different from Snyk or SonarQube?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Snyk and SonarQube are static analysis tools - they scan code without running it. Infiniview deploys your app in a sandbox and tests it at runtime with AI agents that attempt real attacks, test interactions, and review code.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need to write any configuration or test cases?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Connect your GitHub repo and Infiniview handles everything - it discovers your attack surface, generates test plans, and executes them autonomously.",
          },
        },
        {
          "@type": "Question",
          name: "Is my code safe?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Your code runs inside isolated cloud sandboxes that are torn down after every scan. We never store your source code. Only findings, proof bundles, and scan metadata persist.",
          },
        },
        {
          "@type": "Question",
          name: "What languages and frameworks do you support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Infiniview supports any language or framework that can be built and deployed in a container. Static scanners cover JavaScript/TypeScript, Python, Go, Ruby, Java, PHP, and Rust. Runtime and interaction testing works with any web application.",
          },
        },
        {
          "@type": "Question",
          name: "How long does a scan take?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Agents run in parallel with a 10-minute timeout per phase. You see real-time progress in the dashboard as each agent completes.",
          },
        },
        {
          "@type": "Question",
          name: "How do I get access?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Join the waitlist and we'll invite you as spots open. Early members get priority access and free scans during the beta period.",
          },
        },
      ],
    },
  ],
};

// Runs before paint to set the initial theme - avoids a flash of the wrong
// palette on first load. Reads the saved preference, then falls back to the
// OS preference. Kept tiny and inlined; no React state involved.
const themeInitScript = `(function(){try{var c=document.cookie.match(/(?:^|; )theme=(light|dark)/);var s=localStorage.getItem('theme');var t=(c?c[1]:null)||(s==='light'||s==='dark'?s:null)||(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(interTight.variable, jetbrains.variable)}
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
