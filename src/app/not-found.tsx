import type { Metadata } from "next";
import Link from "next/link";
import { Mark } from "@/components/site/mark";

export const metadata: Metadata = {
  title: "Not found",
};

export default function NotFound() {
  return (
    <main className="frame flex min-h-[100svh] flex-col justify-between py-10">
      <Link href="/" aria-label="Infiniview home" className="inline-flex w-fit items-center gap-2.5">
        <Mark />
        <span className="text-[1.08rem] font-[680] tracking-[-0.02em] [font-variation-settings:'wdth'_118]">Infiniview</span>
      </Link>
      <div>
        <p className="text-[clamp(7rem,30vw,26rem)] font-[780] leading-[0.8] tracking-[-0.06em] text-flare [font-variation-settings:'wdth'_125]" aria-hidden>
          404
        </p>
        <h1 className="t-h2 mt-8 max-w-[16ch]">Nothing at this address.</h1>
        <p className="mt-6 max-w-[40ch] text-ink-2">
          The page may have moved, or never existed. Everything that does exist starts at the front door.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-flare">
            Back to Infiniview
          </Link>
          <Link href="/preview" prefetch={false} className="btn btn-glass">
            Walk the demo
          </Link>
        </div>
      </div>
      <span />
    </main>
  );
}
