"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import { gsap } from "@/lib/site/gsap";
import { cn } from "@/lib/utils";

type Status = "idle" | "success" | "already" | "error" | "invalid" | "limited";

/**
 * Waitlist form. Same contract as before: POST /api/waitlist {email}, optimistic
 * confirmation, rollback on failure. Restyled as one glass pill.
 */
export function WaitlistForm({
  id,
  className,
  size = "lg",
}: {
  id?: string;
  className?: string;
  size?: "lg" | "md";
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const doneRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const shake = () => {
    if (!formRef.current) return;
    gsap.fromTo(
      formRef.current,
      { x: 0 },
      { keyframes: [{ x: -8 }, { x: 7 }, { x: -4 }, { x: 0 }], duration: 0.4, ease: "power2.out" },
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("invalid");
      shake();
      return;
    }

    // Optimistically confirm so submission feels instant; the write happens in
    // the background and only rolls back to an error if it actually fails.
    setStatus("success");
    requestAnimationFrame(() => {
      if (doneRef.current) {
        gsap.fromTo(
          doneRef.current,
          { autoAlpha: 0, y: 14, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, ease: "expo.out" },
        );
      }
    });

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
        setStatus(res.status === 429 ? "limited" : "error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success" || status === "already") {
    return (
      <div
        id={id}
        ref={doneRef}
        role="status"
        className={cn("glass glass--lime flex items-center gap-4 px-6 py-4", className)}
        style={{ ["--r" as string]: "999px" }}
      >
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[var(--iv-lime)] text-[#070a02]">
          <Check size={18} strokeWidth={3} />
        </span>
        <span className="text-[1.02rem] font-medium leading-snug">
          {status === "already"
            ? "You’re already on the list. We’ll be in touch."
            : "You’re on the list. We’ll be in touch."}
        </span>
      </div>
    );
  }

  return (
    <form
      id={id}
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className={cn("w-full", className)}
    >
      <div
        className={cn(
          "waitlist glass glass--thin flex items-center gap-2 p-[7px]",
          size === "lg" ? "waitlist--lg" : "waitlist--md",
        )}
        style={{ ["--r" as string]: "999px" }}
      >
        <label htmlFor={id ? `${id}-email` : undefined} className="sr-only">
          Work email
        </label>
        <input
          id={id ? `${id}-email` : undefined}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="you@company.com"
          value={email}
          aria-invalid={status === "invalid"}
          aria-describedby={status === "invalid" || status === "error" || status === "limited" ? `${id ?? "wl"}-msg` : undefined}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "invalid" || status === "error" || status === "limited") setStatus("idle");
          }}
          className="waitlist-input"
        />
        <button type="submit" className="btn btn--lime">
          Get early access
          <ArrowRight className="arrow" size={17} strokeWidth={2.6} />
        </button>
      </div>
      <p
        id={`${id ?? "wl"}-msg`}
        aria-live="polite"
        className="mt-3 min-h-[1.25rem] pl-5 text-sm text-[#ff8a7a]"
      >
        {status === "invalid" && "Enter a valid email address."}
        {status === "error" && "Something went wrong. Try again."}
        {status === "limited" && "Too many attempts. Please try again in a few minutes."}
      </p>
    </form>
  );
}
