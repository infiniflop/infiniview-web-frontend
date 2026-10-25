"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "./motion/gsap";

type Status = "idle" | "success" | "already" | "error" | "invalid";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function WaitlistForm({ id, className }: { id?: string; className?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const inputId = useId();
  const msgId = useId();
  const doneRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!doneRef.current) return;
      gsap.from(doneRef.current.children, { y: 14, opacity: 0, stagger: 0.07, duration: 0.7 });
    },
    { dependencies: [status === "success" || status === "already"], scope: doneRef },
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!EMAIL.test(email)) {
      setStatus("invalid");
      return;
    }

    // Optimistically confirm immediately so submission feels instant; the write
    // happens in the background. Only roll back to an error if it actually fails.
    setStatus("success");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message === "already_registered") setStatus("already");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success" || status === "already") {
    return (
      <div id={id} ref={doneRef} className={cn("flex min-h-[52px] items-center gap-3.5", className)} role="status">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-flare text-graphite">
          <Check size={18} strokeWidth={2.6} aria-hidden />
        </span>
        <p className="text-[1.0625rem] leading-snug text-ink">
          {status === "already" ? "You're already on the list. We'll be in touch." : "You're on the list. We'll be in touch."}
        </p>
      </div>
    );
  }

  const invalid = status === "invalid" || status === "error";

  return (
    <form id={id} onSubmit={handleSubmit} noValidate className={cn("w-full max-w-[520px]", className)}>
      <div
        className={cn(
          "glass flex flex-col gap-1.5 rounded-[3px] p-1.5 transition-shadow duration-300 focus-within:shadow-[inset_0_0_0_1px_rgba(255,90,31,0.7)] sm:flex-row",
          invalid && "shadow-[inset_0_0_0_1px_rgba(255,90,31,0.9)]",
        )}
      >
        <label htmlFor={inputId} className="sr-only">
          Work email
        </label>
        <input
          id={inputId}
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          value={email}
          aria-invalid={invalid}
          aria-describedby={invalid ? msgId : undefined}
          onChange={(e) => {
            setEmail(e.target.value);
            if (invalid) setStatus("idle");
          }}
          className="h-[48px] min-w-0 flex-1 bg-transparent px-4 text-[1.0625rem] text-ink placeholder:text-ink-3 focus:outline-none"
        />
        <button type="submit" className="btn btn-flare !h-[48px]">
          Get early access <ArrowRight size={17} strokeWidth={2.2} className="btn-arrow" aria-hidden />
        </button>
      </div>
      <p id={msgId} className="mt-2.5 min-h-[1.4em] text-[0.875rem] text-flare-soft" aria-live="polite">
        {status === "invalid" && "Enter a valid email address."}
        {status === "error" && "Something went wrong. Try again."}
      </p>
    </form>
  );
}
