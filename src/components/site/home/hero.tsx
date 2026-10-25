import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SplitHeading } from "../motion/split-heading";
import { WaitlistForm } from "../waitlist-form";
import { RunConsole } from "./run-console";

export function Hero() {
  return (
    <section id="top" className="relative z-10 flex min-h-[100svh] flex-col" aria-labelledby="hero-title">
      <div className="frame flex flex-1 flex-col pt-[88px] pb-[clamp(28px,4.5vh,56px)]">
        {/* Wide screens: the run console sits beside the block it narrates.
            Small screens: the block takes the upper half, the console follows the form. */}
        <div className="order-4 mt-14 lg:order-1 lg:mt-0 lg:flex lg:flex-1 lg:items-start lg:pt-[clamp(16px,5vh,64px)]">
          <div data-reveal>
            <RunConsole className="max-lg:max-w-none" />
          </div>
        </div>
        <div className="order-1 min-h-[34svh] flex-1 lg:hidden" aria-hidden />

        <SplitHeading
          as="h1"
          id="hero-title"
          immediate
          delay={0.35}
          className="t-display hero-title order-2"
        >
          Break it before
          <br />
          they do.
        </SplitHeading>

        <div className="order-3 mt-[clamp(24px,4vh,44px)] grid grid-cols-1 items-end gap-x-10 gap-y-7 lg:grid-cols-12">
          <p data-reveal className="t-lead max-w-[36ch] text-ink lg:col-span-6">
            Infiniview builds every pull request inside a sealed cloud sandbox, lets AI agents review, scan and
            attack it, then hands you proof of everything they broke.
          </p>
          <div data-reveal className="flex flex-col items-start gap-3 lg:col-span-6 lg:items-end">
            <WaitlistForm id="waitlist" />
            <Link
              href="/preview"
              prefetch={false}
              className="group inline-flex items-center gap-1.5 text-[1.0625rem] text-ink-2 transition-colors hover:text-ink"
            >
              <span className="link-draw">Or walk the live demo</span>
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
