"use client";

import { Fragment } from "react";
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
        ...(vertical
          ? { left: "50%", marginLeft: -2 }
          : { top: "50%", marginTop: -2 }),
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

function JunctionDot({ delay }: { delay: number }) {
  return (
    <motion.div
      className="relative z-10 flex shrink-0 items-center justify-center"
      initial={{ scale: 0.5, opacity: 0.3 }}
      whileInView={{ scale: [0.5, 1.2, 1], opacity: [0.3, 1, 0.8] }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.6 }}
    >
      <div className="h-3 w-3 rounded-full bg-accent" />
      <motion.div
        className="absolute h-3 w-3 rounded-full bg-accent"
        animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
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

function SmallDot({ delay }: { delay: number }) {
  return (
    <motion.div
      className="shrink-0"
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 0.6 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.4 }}
    >
      <div className="h-1.5 w-1.5 rounded-full bg-accent/60" />
    </motion.div>
  );
}

function ConnectorLine({
  delay,
  showPulse = false,
  pulseDelay = 0,
}: {
  delay: number;
  showPulse?: boolean;
  pulseDelay?: number;
}) {
  return (
    <div className="flex-1 relative h-px mx-0.5">
      <motion.div
        className="absolute inset-0 bg-border"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ delay, duration: 0.5 }}
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
        transition={{ delay: delay + 0.2, duration: 0.4 }}
      />
      {showPulse && <DataPulse delay={pulseDelay} duration={1.2} />}
    </div>
  );
}

function Segment({ delay, index }: { delay: number; index: number }) {
  return (
    <>
      <ConnectorLine delay={delay} />
      <SmallDot delay={delay + 0.1} />
      <ConnectorLine delay={delay + 0.12} showPulse pulseDelay={delay + index * 0.4 + 1} />
      <SmallDot delay={delay + 0.2} />
      <ConnectorLine delay={delay + 0.22} />
    </>
  );
}

export function PipelineTrack({ stepCount = 5 }: { stepCount?: number }) {
  const baseDelay = 0.3;

  return (
    <>
      {/* Desktop: horizontal track with dots centered above each card */}
      <div
        className="hidden md:flex absolute top-0 left-0 right-0 h-8 pointer-events-none z-[1] items-center"
        style={{
          paddingLeft: "calc((100% - 4 * 1rem) / 10)",
        }}
      >
        {Array.from({ length: stepCount }).map((_, i) => {
          const segDelay = baseDelay + i * 0.5;
          const isLast = i === stepCount - 1;
          return (
            <Fragment key={i}>
              <JunctionDot delay={segDelay} />
              <Segment delay={segDelay} index={i} />
              {isLast && (
                <>
                  <SmallDot delay={segDelay + 0.3} />
                  <ConnectorLine delay={segDelay + 0.35} />
                  <JunctionDot delay={segDelay + 0.5} />
                </>
              )}
            </Fragment>
          );
        })}
      </div>

      {/* Mobile: vertical connectors */}
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
