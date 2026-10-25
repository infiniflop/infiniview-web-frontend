import Link from "next/link";
import { Mark } from "@/components/site/mark";
import { CONTACT_EMAIL } from "@/lib/site";

export function Footer({ docsUrl }: { docsUrl: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-ground-2">
      <div className="frame pt-20 pb-8 md:pt-28">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 md:col-span-5">
            <p className="t-lead max-w-[22ch] text-ink">
              Infiniview is built by Infiniflop Labs.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="link-ink mt-6 inline-block text-[17px]"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
          <ul className="col-span-6 flex flex-col gap-3 text-[16px] md:col-span-3 md:col-start-7">
            <li><Link href="/#how-it-works" className="link-ink">How it works</Link></li>
            <li><Link href="/#proof" className="link-ink">Proof</Link></li>
            <li><Link href="/#agents" className="link-ink">Agents</Link></li>
            <li><Link href="/pricing" className="link-ink">Pricing</Link></li>
          </ul>
          <ul className="col-span-6 flex flex-col gap-3 text-[16px] md:col-span-3">
            <li><a href={docsUrl} className="link-ink">Docs</a></li>
            <li><Link href="/preview" prefetch={false} className="link-ink">Demo</Link></li>
            <li><a href="/privacy" className="link-ink">Privacy</a></li>
            <li><a href="/terms" className="link-ink">Terms</a></li>
          </ul>
        </div>

        <div className="mt-20 flex items-end justify-between gap-6 md:mt-28">
          <div className="flex items-center gap-3 text-ink">
            <Mark size={28} />
            <span className="t-small text-ink-3">© {year} Infiniview</span>
          </div>
          <span className="t-small text-ink-3">Your code runs in a sandbox and is deleted after every run.</span>
        </div>
      </div>

      {/* The name returns at full width. */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none px-[2vw] text-center font-medium leading-[0.78] tracking-[-0.05em] text-raised-2"
        style={{ fontSize: "clamp(72px, 15.6vw, 268px)", marginBottom: "-0.14em" }}
      >
        Infiniview
      </div>
    </footer>
  );
}
