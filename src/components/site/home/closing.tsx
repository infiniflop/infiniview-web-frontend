import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SALES_EMAIL } from "../content";
import { SplitHeading } from "../motion/split-heading";
import { WaitlistForm } from "../waitlist-form";

// The close: the glass block reassembles behind this section (see
// SceneDirector) for the next run, and the visitor is offered one.
export function Closing() {
  return (
    <section id="closing" className="relative z-10 flex min-h-[100svh] items-end" aria-labelledby="closing-title">
      <div className="frame grid grid-cols-1 pb-[clamp(56px,9vh,110px)] pt-[52svh] lg:grid-cols-12 lg:pt-40">
        <div className="lg:col-span-9">
          <SplitHeading id="closing-title" className="t-h2 max-w-[17ch]">
            Think your app is unbreakable?
          </SplitHeading>
          <p data-reveal className="t-lead mt-8 max-w-[34ch]">
            Put it in the glass. Early members get priority access and free scans during the beta.
          </p>
          <div data-reveal className="mt-10">
            <WaitlistForm id="waitlist-final" />
          </div>
          <div data-reveal className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-[1.0625rem] text-ink-2">
            <Link href="/preview" prefetch={false} className="group inline-flex items-center gap-1.5 hover:text-ink">
              <span className="link-draw">Walk the live demo</span>
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </Link>
            <a href={`mailto:${SALES_EMAIL}`} className="group inline-flex items-center gap-1.5 hover:text-ink">
              <span className="link-draw">Talk to sales</span>
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
