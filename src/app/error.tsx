"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { mona, jetbrains } from "@/lib/site/fonts";
import { StatusFrame } from "@/components/site/status-page";
import "./(site)/site.css";

// Runtime errors in any route below the root layout land here. It deliberately avoids the
// marketing shell (WebGL, smooth scroll): if that is what broke, this page must still render.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={cn(mona.variable, jetbrains.variable)}>
      <StatusFrame>
        <main id="main" className="status wrap">
          <p className="kicker">Something broke</p>
          <h1 className="t-display status-title">That one’s on us.</h1>
          <p className="t-lede status-lede">
            The page hit an unexpected error. Trying again usually clears it.
            {error.digest ? <span className="status-digest"> Reference: {error.digest}</span> : null}
          </p>
          <div className="status-actions">
            <button type="button" className="btn btn--lime" onClick={reset}>
              Try again
              <RotateCcw size={16} strokeWidth={2.4} />
            </button>
            <Link href="/" className="btn btn--glass">
              Back to the start
            </Link>
          </div>
        </main>
      </StatusFrame>
    </div>
  );
}
