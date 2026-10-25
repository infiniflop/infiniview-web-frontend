import { GUARANTEES } from "../content";
import { SplitHeading } from "../motion/split-heading";

// Sits over the scene right after the run: the block has just been
// destroyed, and what it found hangs in the air to the right.
export function Guarantees() {
  return (
    <section id="sandbox" className="relative z-10" aria-labelledby="sandbox-title">
      <div className="frame grid grid-cols-1 pt-[clamp(110px,14vw,200px)] pb-[clamp(120px,16vw,240px)] max-lg:pt-[48svh] lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SplitHeading id="sandbox-title" className="t-h2 max-w-[11ch]">
            Nothing stays in the glass.
          </SplitHeading>
          <p data-reveal className="t-lead mt-8 max-w-[34ch]">
            Every run gets a sandbox of its own, and every sandbox is destroyed when the run ends. Only findings,
            proof bundles and scan metadata come out.
          </p>
          <dl className="mt-[clamp(48px,6vw,80px)] grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {GUARANTEES.map((g) => (
              <div key={g.title} data-reveal>
                <dt className="text-[1.25rem] font-[650] leading-tight tracking-[-0.02em] [font-variation-settings:'wdth'_112]">
                  {g.title}
                </dt>
                <dd className="mt-2.5 text-ink-2">{g.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
