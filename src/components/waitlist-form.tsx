"use client";

import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

type Status = "idle" | "success" | "already" | "error" | "invalid";

async function submitEmail(email: string): Promise<Status> {
  try {
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) return "error";
    const data = await res.json();
    return data.message === "already_registered" ? "already" : "success";
  } catch {
    return "error";
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Waitlist form. `variant="row"` is the input-and-button pair used in the
 * hero; `variant="sentence"` renders the input and button inline so they can
 * sit inside a sentence (the closing call to action).
 */
export function WaitlistForm({
  id,
  className,
  variant = "row",
  buttonLabel = "Get early access",
}: {
  id?: string;
  className?: string;
  variant?: "row" | "sentence";
  buttonLabel?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setStatus("invalid");
      return;
    }
    // Confirm optimistically so the submission feels instant; roll back only
    // if the write actually fails.
    setStatus("success");
    const result = await submitEmail(email);
    setStatus(result);
  };

  const done = status === "success" || status === "already";

  if (variant === "sentence") {
    if (done) {
      return (
        <span id={id} className={cn("text-mint", className)}>
          {status === "already" ? "you're already on the list." : "you're on the list."}
        </span>
      );
    }
    return (
      <form id={id} onSubmit={handleSubmit} className={cn("inline", className)}>
        <label className="sr-only" htmlFor={`${id ?? "waitlist"}-email`}>Email address</label>
        <input
          id={`${id ?? "waitlist"}-email`}
          type="email"
          required
          placeholder="you@company.com"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          className="cta-input"
        />{" "}
        <button
          type="submit"
          className="inline-block bg-redline px-[0.35em] leading-[1.15] text-white transition-colors hover:bg-redline-bright"
        >
          {buttonLabel}
        </button>
        {status === "invalid" && (
          <span className="block pt-4 text-[16px] text-redline-bright">Enter a valid email address.</span>
        )}
        {status === "error" && (
          <span className="block pt-4 text-[16px] text-redline-bright">Something went wrong. Try again.</span>
        )}
      </form>
    );
  }

  if (done) {
    return (
      <div id={id} className={cn("flex h-12 items-center text-[17px] text-mint", className)}>
        {status === "already"
          ? "You're already on the list. We'll be in touch."
          : "You're on the list. We'll be in touch."}
      </div>
    );
  }

  return (
    <form id={id} onSubmit={handleSubmit} className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`${id ?? "waitlist"}-email`}>Email address</label>
        <input
          id={`${id ?? "waitlist"}-email`}
          type="email"
          required
          placeholder="you@company.com"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          className="h-12 w-full bg-raised px-4 text-[16px] text-ink placeholder:text-ink-4 focus:outline-none focus-visible:outline-2 focus-visible:outline-ink-2 sm:w-[260px]"
        />
        <button type="submit" className="btn btn-ink" data-magnetic>
          {buttonLabel}
        </button>
      </div>
      {status === "invalid" && (
        <p className="t-small text-redline-bright">Enter a valid email address.</p>
      )}
      {status === "error" && (
        <p className="t-small text-redline-bright">Something went wrong. Try again.</p>
      )}
    </form>
  );
}
