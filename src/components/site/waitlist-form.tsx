"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Check } from "lucide-react";
import { gsap, prefersReducedMotion } from "@/lib/site/gsap";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "already" | "error" | "invalid" | "limited";

/**
 * Waitlist form. Same API contract as before: POST /api/waitlist {email}. The confirmation is only
 * shown once the server has said yes (a "You're on the list" that can turn out false is worse than
 * a half-second of "Joining…"); every failure puts the visitor back in the field with a reason.
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
  const inputRef = useRef<HTMLInputElement>(null);

  const shake = () => {
    if (!formRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      formRef.current,
      { x: 0 },
      { keyframes: [{ x: -8 }, { x: 7 }, { x: -4 }, { x: 0 }], duration: 0.4, ease: "power2.out" },
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return; // aria-disabled, not disabled: a focused button must not lose focus

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("invalid");
      shake();
      inputRef.current?.focus();
      return;
    }

    setStatus("loading");
    const abort = new AbortController();
    const timer = window.setTimeout(() => abort.abort(), 10_000); // a hung request must not hang the form
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: abort.signal,
      });
      if (res.ok) {
        // the address is saved once the response is ok; an unreadable body must not turn that into an error
        const data = await res.json().catch(() => null);
        setStatus(data?.message === "already_registered" ? "already" : "success");
        return;
      }
      const body = await res.json().catch(() => null);
      setStatus(res.status === 429 ? "limited" : res.status === 400 && body?.error === "invalid_email" ? "invalid" : "error");
    } catch {
      setStatus("error");
    } finally {
      window.clearTimeout(timer);
    }
    // back to the field, with the reason in the (already mounted) live region
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // the form is replaced by the confirmation: move focus to it (which also announces it) and bring it in
  useEffect(() => {
    if (status !== "success" && status !== "already") return;
    const el = doneRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    if (prefersReducedMotion()) return;
    // opacity, not autoAlpha: visibility:hidden would make the browser drop focus from the element
    const tween = gsap.fromTo(el, { opacity: 0, y: 14, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "expo.out" });
    return () => {
      tween.kill();
    };
  }, [status]);

  if (status === "success" || status === "already") {
    return (
      <div
        id={id}
        ref={doneRef}
        role="status"
        tabIndex={-1}
        className={cn("waitlist-done glass glass--lime mb-8 flex w-full items-center gap-4 px-6 py-4", size === "lg" ? "waitlist--lg" : "waitlist--md", className)}
        style={{ ["--r" as string]: "999px" }}
      >
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-[var(--iv-lime)] text-[#070a02]">
          <Check size={18} strokeWidth={3} />
        </span>
        <span className="text-[1.02rem] font-medium leading-snug [text-wrap:balance]">
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
      // before the script has loaded (or without it) a native submit must not put the address in the URL
      method="post"
      action="/api/waitlist"
      noValidate
      aria-busy={status === "loading"}
      className={cn("w-full", className)}
    >
      <div
        className={cn(
          "waitlist glass glass--thin flex items-center gap-2 p-[7px]",
          size === "lg" ? "waitlist--lg" : "waitlist--md",
        )}
        data-status={status}
        style={{ ["--r" as string]: "999px" }}
      >
        <label htmlFor={id ? `${id}-email` : undefined} className="sr-only">
          Work email
        </label>
        <input
          id={id ? `${id}-email` : undefined}
          ref={inputRef}
          type="email"
          name="email"
          maxLength={254}
          autoComplete="email"
          inputMode="email"
          required
          placeholder="you@company.com"
          value={email}
          aria-invalid={status === "invalid"}
          readOnly={status === "loading"}
          aria-describedby={status === "invalid" || status === "error" || status === "limited" ? `${id ?? "wl"}-msg` : undefined}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "invalid" || status === "error" || status === "limited") setStatus("idle");
          }}
          className="waitlist-input"
        />
        <button type="submit" className="btn btn--lime" aria-disabled={status === "loading"}>
          {status === "loading" ? (
            "Joining…"
          ) : (
            <>
              Get early access
              <ArrowRight className="arrow" size={17} strokeWidth={2.6} />
            </>
          )}
        </button>
      </div>
      <p
        id={`${id ?? "wl"}-msg`}
        aria-live="polite"
        className="waitlist-msg mt-3 min-h-[1.25rem] pl-5 text-sm"
      >
        {status === "loading" && <span className="sr-only">Joining the waitlist…</span>}
        {status === "invalid" && "Enter a valid email address."}
        {status === "error" && "Something went wrong. Try again."}
        {status === "limited" && "Too many attempts. Please try again in a few minutes."}
      </p>
    </form>
  );
}
