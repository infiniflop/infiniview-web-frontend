import { WaitlistForm } from "@/components/waitlist-form";

/**
 * The closing sentence has a gap in it, and the gap is the form.
 */
export function Closing() {
  return (
    <section className="bg-ground-2 py-28 md:py-40" aria-labelledby="closing-h">
      <div className="frame">
        <h2 id="closing-h" className="t-display max-w-[14ch] text-ink" data-reveal="lines">
          Put your app in the sandbox.
        </h2>
        <div
          role="paragraph"
          className="mt-12 max-w-[40ch] text-[clamp(1.5rem,1rem+2.2vw,2.75rem)] leading-[1.3] font-medium tracking-[-0.02em] text-ink md:mt-16"
          data-reveal
        >
          Send early access to{" "}
          <WaitlistForm id="waitlist-closing" variant="sentence" buttonLabel="request" />
        </div>
        <p className="t-body mt-8 max-w-[50ch] text-ink-2" data-reveal>
          We invite in batches. Early members get priority access and free runs during the beta.
        </p>
      </div>
    </section>
  );
}
