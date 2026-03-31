"use client";

import { motion } from "framer-motion";

function DataPulse({
  delay,
  duration = 2,
  vertical = false,
}: {
  delay: number;
  duration?: number;
  vertical?: boolean;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: vertical ? 4 : 12,
        height: vertical ? 12 : 4,
        background:
          "radial-gradient(circle, rgba(224,90,56,0.9) 0%, rgba(224,90,56,0) 70%)",
        boxShadow: "0 0 8px 2px rgba(224,90,56,0.5)",
        ...(vertical ? { left: "50%", marginLeft: -2 } : { top: "50%", marginTop: -2 }),
      }}
      initial={vertical ? { top: "0%", opacity: 0 } : { left: "0%", opacity: 0 }}
      whileInView={
        vertical
          ? { top: ["0%", "100%"], opacity: [0, 1, 1, 0] }
          : { left: ["0%", "100%"], opacity: [0, 1, 1, 0] }
      }
      viewport={{ once: false, margin: "-50px" }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "linear",
      }}
    />
  );
}

function JunctionDot({ delay, index }: { delay: number; index: number }) {
  return (
    <motion.div
      className="relative z-10 flex items-center justify-center"
      initial={{ scale: 0.5, opacity: 0.3 }}
      whileInView={{ scale: [0.5, 1.2, 1], opacity: [0.3, 1, 0.8] }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: delay + index * 0.4, duration: 0.6 }}
    >
      <div className="h-3 w-3 rounded-full bg-accent" />
      <motion.div
        className="absolute h-3 w-3 rounded-full bg-accent"
        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
        transition={{
          duration: 2,
          delay: delay + index * 0.4,
          repeat: Infinity,
          repeatDelay: 4,
        }}
      />
    </motion.div>
  );
}

export function PipelineTrack({ stepCount = 5 }: { stepCount?: number }) {
  const baseDelay = 0.3;

  return (
    <>
      {/* Desktop horizontal track */}
      <div className="hidden md:block absolute top-0 left-0 right-0 h-8 pointer-events-none z-[1]">
        <div className="relative h-full mx-auto flex items-center">
          {Array.from({ length: stepCount }).map((_, i) => (
            <div key={i} className="flex-1 flex items-center">
              <JunctionDot delay={baseDelay} index={i} />
              {i < stepCount - 1 && (
                <div className="flex-1 relative h-px mx-1">
                  <motion.div
                    className="absolute inset-0 bg-border"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      delay: baseDelay + i * 0.4,
                      duration: 0.5,
                    }}
                    style={{ transformOrigin: "left" }}
                  />
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(224,90,56,0.3), transparent)",
                      transformOrigin: "left",
                    }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      delay: baseDelay + i * 0.4 + 0.2,
                      duration: 0.4,
                    }}
                  />
                  <DataPulse delay={baseDelay + i * 0.6 + 1} duration={1.2} />
                </div>
              )}
            </div>
          ))}
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
          <DataPulse delay={2} duration={4} vertical />
          <DataPulse delay={5} duration={4} vertical />
        </div>
      </div>
    </>
  );
}
