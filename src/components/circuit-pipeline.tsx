"use client";

import { motion } from "framer-motion";

function JunctionDot({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.9] }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="h-3 w-3 rounded-full bg-accent" />
      <motion.div
        className="absolute inset-0 h-3 w-3 rounded-full bg-accent"
        animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
        transition={{
          duration: 2,
          delay,
          repeat: Infinity,
          repeatDelay: 4,
        }}
      />
    </motion.div>
  );
}

function DataPulse({ delay }: { delay: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: 12,
        height: 4,
        top: "50%",
        marginTop: -2,
        background:
          "radial-gradient(circle, rgba(224,90,56,0.9) 0%, rgba(224,90,56,0) 70%)",
        boxShadow: "0 0 8px 2px rgba(224,90,56,0.5)",
      }}
      initial={{ left: "0%", opacity: 0 }}
      whileInView={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatDelay: 2,
        ease: "linear",
      }}
    />
  );
}

export function PipelineTrack({ stepCount = 5 }: { stepCount?: number }) {
  const baseDelay = 0.3;

  return (
    <>
      {/* Desktop horizontal track */}
      <div className="hidden md:block absolute top-0 left-0 right-0 pointer-events-none z-[1]">
        {/* The line spanning full width */}
        <div className="relative h-10">
          {/* Background line */}
          <motion.div
            className="absolute left-0 right-0 top-1/2 h-px bg-border"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: baseDelay, duration: 1.2 }}
            style={{ transformOrigin: "left" }}
          />
          {/* Accent glow line */}
          <motion.div
            className="absolute left-0 right-0 top-1/2 h-px"
            style={{
              transformOrigin: "left",
              background:
                "linear-gradient(90deg, transparent, rgba(224,90,56,0.25), transparent)",
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: baseDelay + 0.3, duration: 1 }}
          />

          {/* Data pulses across the full line */}
          <DataPulse delay={baseDelay + 1.5} />
          <DataPulse delay={baseDelay + 4} />

          {/* Junction dots - positioned at center of each grid column */}
          <div
            className="absolute inset-0 grid"
            style={{ gridTemplateColumns: `repeat(${stepCount}, 1fr)`, gap: "1rem" }}
          >
            {Array.from({ length: stepCount }).map((_, i) => (
              <div key={i} className="relative">
                <JunctionDot delay={baseDelay + i * 0.25} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile vertical connectors */}
      <div className="md:hidden absolute left-6 top-0 bottom-0 pointer-events-none z-[1]">
        <div className="relative h-full w-px">
          <motion.div
            className="absolute inset-0 bg-border/50"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2, duration: 1.5 }}
            style={{ transformOrigin: "top" }}
          />
        </div>
      </div>
    </>
  );
}
