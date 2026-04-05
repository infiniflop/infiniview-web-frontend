"use client";

import { useEffect, useRef, useState } from "react";

const GLITCH_CHARS = "!<>-_\\/[]{}=+*^?#@$%&~:;|01";

interface AsciiScrambleProps {
  /** The target text to resolve to */
  text: string;
  className?: string;
  /** Milliseconds per character resolve step */
  speed?: number;
  /** Delay before scramble starts (ms) */
  delay?: number;
  /** Start immediately instead of waiting for scroll */
  autoStart?: boolean;
}

export function AsciiScramble({
  text,
  className,
  speed = 25,
  delay = 0,
  autoStart = false,
}: AsciiScrambleProps) {
  const [output, setOutput] = useState(text);
  const [started, setStarted] = useState(autoStart);
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  // Trigger on scroll into view
  useEffect(() => {
    if (autoStart) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoStart]);

  // Run the scramble animation
  useEffect(() => {
    if (!started || hasRun.current) return;
    hasRun.current = true;

    let frame = 0;
    const totalFrames = text.length + 12;

    const timeout = setTimeout(() => {
      // Start fully scrambled
      setOutput(
        text
          .split("")
          .map((c) =>
            c === " "
              ? " "
              : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
          )
          .join("")
      );

      const interval = setInterval(() => {
        frame++;
        setOutput(
          text
            .split("")
            .map((char, i) => {
              if (char === " ") return " ";
              // Characters resolve left-to-right with a slight wave
              if (frame - 3 > i) return char;
              return GLITCH_CHARS[
                Math.floor(Math.random() * GLITCH_CHARS.length)
              ];
            })
            .join("")
        );

        if (frame >= totalFrames) clearInterval(interval);
      }, speed);
    }, delay);

    return () => clearTimeout(timeout);
  }, [started, text, delay, speed]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {output}
    </span>
  );
}
