"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

// A runtime error in a page below the (site) layout: the layout (shell, nav, footer) stays up and
// only the page is replaced. An error in the layout itself falls through to global-error.tsx, which
// is dependency-free for exactly that reason.
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
    <main id="main" className="status wrap">
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
  );
}
