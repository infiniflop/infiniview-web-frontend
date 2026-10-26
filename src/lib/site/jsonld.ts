// Structured data helpers. Server-side only: crawlers read the HTML, nothing executes this.

/** Serialise for an inline <script type="application/ld+json">, neutralising "</script>" and "<!--". */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** FAQPage markup generated from the same data the page renders, so the two cannot drift apart. */
export function faqPage(items: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
