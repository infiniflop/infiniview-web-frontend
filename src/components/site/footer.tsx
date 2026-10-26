import Link from "next/link";
import { Mark } from "@/components/site/ui";
import { HashLink } from "@/components/site/hash-link";
import { FOOTER_LINKS } from "@/lib/site/content";

const INTERNAL = new Set(["/pricing", "/preview"]);

const COLS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Findings", href: "/#findings" },
      { label: "Arsenal", href: "/#arsenal" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: FOOTER_LINKS.filter((l) => ["Docs", "Live demo"].includes(l.label)),
  },
  {
    title: "Company",
    links: FOOTER_LINKS.filter((l) => ["Contact", "Privacy", "Terms"].includes(l.label)),
  },
];

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-top">
          <div className="foot-brand">
            <Mark size={34} className="text-[var(--iv-lime)]" />
            <p className="foot-line">Attack your code before anyone else does.</p>
          </div>
          <nav aria-label="Footer" className="foot-cols">
            {COLS.map((c) => (
              <div key={c.title} className="foot-col">
                <h2>{c.title}</h2>
                <ul>
                  {c.links.map((l) => (
                    <li key={l.label}>
                      {/* /privacy and /terms are not routes of this app: a plain anchor, so Next does not
                          prefetch (and 404) them */}
                      {l.href.startsWith("/#") ? (
                        <HashLink href={l.href} className="foot-link">
                          {l.label}
                        </HashLink>
                      ) : INTERNAL.has(l.href) ? (
                        <Link href={l.href} prefetch={l.href === "/preview" ? false : undefined} className="foot-link">
                          {l.label}
                        </Link>
                      ) : (
                        <a href={l.href} className="foot-link">
                          {l.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="foot-word" aria-hidden>
        infiniview
      </div>

      <div className="wrap foot-base">
        <span>© {new Date().getFullYear()} Infiniview · Built by Infiniflop Labs</span>
        <a className="link" href="mailto:hello@infiniflop.com">
          hello@infiniflop.com
        </a>
      </div>
    </footer>
  );
}
