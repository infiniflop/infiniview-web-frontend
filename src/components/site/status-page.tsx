import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

/** Content for the 404 page: on-brand, with a real way back. Rendered inside the marketing shell. */
export function NotFoundContent() {
  return (
    <main id="main" className="status wrap">
      <h1 className="t-display status-title">This frame doesn’t exist.</h1>
      <p className="t-lede status-lede">
        The page you’re after (a 404) isn’t part of the corridor. It may have moved, or the link may be wrong.
      </p>
      <div className="status-actions">
        <Link href="/" className="btn btn--lime">
          Back to the start
          <ArrowRight className="arrow" size={17} strokeWidth={2.6} />
        </Link>
        <Link href="/preview" prefetch={false} className="btn btn--glass">
          See the live demo
        </Link>
      </div>
    </main>
  );
}

/** Shell-free frame used by the error boundary: it must render even if the marketing shell is what failed. */
export function StatusFrame({ children }: { children: ReactNode }) {
  return (
    <div className="site-root status-frame">
      <div className="corridor-fallback" aria-hidden />
      <div className="site-content">{children}</div>
    </div>
  );
}
