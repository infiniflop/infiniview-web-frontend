"use client";

// The live demo, embedded: the /preview dashboard rendered at desktop size
// and scaled into a frame that tips flat as it arrives. It stays inert until
// the visitor asks for it, so scrolling past never gets trapped inside it.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP, prefersReducedMotion } from "../motion/gsap";
import { SplitHeading } from "../motion/split-heading";

const W = 1440;
const H = 900;

export function DemoFrame() {
  const root = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [load, setLoad] = useState(false);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / W));
    ro.observe(el);
    // Load the dashboard shortly before it scrolls into view.
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "120% 0px" },
    );
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !tilt.current) return;
      gsap.fromTo(
        tilt.current,
        { rotateX: 24, scale: 0.86, yPercent: 6 },
        {
          rotateX: 0,
          scale: 1,
          yPercent: 0,
          ease: "none",
          scrollTrigger: { trigger: box.current, start: "top bottom", end: "top 18%", scrub: true },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="demo" className="relative z-10 overflow-hidden bg-void-2" aria-labelledby="demo-title">
      <div className="frame section-gap">
        <div className="grid grid-cols-1 items-end gap-y-8 lg:grid-cols-12">
          <SplitHeading id="demo-title" className="t-h2 lg:col-span-7">
            Walk the dashboard.
          </SplitHeading>
          <div className="lg:col-span-5 lg:col-start-8">
            <p data-reveal className="max-w-[40ch] text-ink-2">
              The demo is the product&apos;s dashboard filled with sample data. Open a review, follow its attack paths,
              inspect a finding and its proof.
            </p>
            <div data-reveal className="mt-6">
              <Link href="/preview" prefetch={false} className="btn btn-glass">
                Open the full demo <ArrowUpRight size={17} className="btn-arrow" aria-hidden />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-[clamp(48px,6vw,96px)] [perspective:1800px]">
          <div ref={tilt} className="origin-[50%_0%] will-change-transform">
            <div
              ref={box}
              data-ui
              className="relative overflow-hidden rounded-[6px] bg-void shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
              style={{ aspectRatio: `${W} / ${H}` }}
              onMouseLeave={() => setLive(false)}
            >
              {load && (
                <iframe
                  src="/preview?embed=1"
                  title="Infiniview dashboard demo with sample data"
                  loading="lazy"
                  tabIndex={live ? 0 : -1}
                  className="absolute left-0 top-0 origin-top-left border-0"
                  style={{ width: W, height: H, transform: `scale(${scale})`, pointerEvents: live ? "auto" : "none" }}
                />
              )}
              <button
                type="button"
                onClick={() => setLive(true)}
                className={cn(
                  "group absolute inset-0 flex items-center justify-center transition-opacity duration-300",
                  live ? "pointer-events-none opacity-0" : "opacity-100",
                )}
                aria-label="Use the demo dashboard here"
              >
                <span className="glass-strong inline-flex items-center gap-2.5 rounded-[3px] px-5 py-3.5 text-[1.0625rem] font-[600] transition-transform duration-300 group-hover:scale-[1.04]">
                  <MousePointerClick size={18} aria-hidden /> Click to explore
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
