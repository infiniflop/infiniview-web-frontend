"use client";

import { Terminal } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { buttonVariants } from "@/components/ui/button";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.docksmith.dev";

const NAV_LINKS = [
  ["How It Works", "/#how-it-works"],
  ["Agents", "/#agents"],
  ["Security & Testing", "/#security-testing"],
  ["Features", "/#features"],
  ["Pricing", "/pricing"],
];

export function Nav({ activePath }: { activePath?: string }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="fixed top-0 z-50 w-full border-b border-border/50 bg-bg/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15">
            <Terminal size={13} className="text-accent" />
          </div>
          <span className="text-[14px] font-bold tracking-tight">docksmith</span>
        </a>

        <div className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className={cn(
                "text-[13px] font-medium transition hover:text-text",
                activePath === href
                  ? "text-accent"
                  : "text-text-muted"
              )}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`${APP_URL}/login`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-[13px] text-text-muted hover:text-text hover:bg-transparent"
            )}
          >
            Sign In
          </a>
          <a
            href={APP_URL}
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-accent px-4 text-[13px] font-semibold text-white hover:bg-accent-light"
            )}
          >
            Get Started
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
