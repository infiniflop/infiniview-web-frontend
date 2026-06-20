"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function WaitlistForm({ id, className }: { id?: string; className?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "already" | "error" | "invalid">("idle");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
      <div id={id} className={cn("font-mono text-[15px] text-lime py-4", className)}>
        {status === "already" ? "you're already on the list. we'll be in touch." : "you're on the list. we'll be in touch."}
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-2", className)}
    >
      <div className="flex gap-2 items-stretch flex-wrap sm:flex-nowrap">
        <input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "invalid" || status === "error") setStatus("idle");
          }}
          className="font-mono text-sm bg-bg-elevated border border-border px-4 py-4 text-text placeholder:text-text-muted focus:outline-none focus:border-lime w-full sm:w-[260px]"
        />
        <button
          type="submit"
          className="btn-lime text-[15px] px-5 py-4 tracking-[-0.015em] whitespace-nowrap inline-flex items-center gap-1.5"
        >
          GET EARLY ACCESS <ArrowRight size={16} strokeWidth={2.5} />
        </button>
      </div>
      {status === "invalid" && (
        <p className="font-mono text-xs text-red">enter a valid email address.</p>
      )}
      {status === "error" && (
        <p className="font-mono text-xs text-red">something went wrong. try again.</p>
      )}
    </form>
  );
}
