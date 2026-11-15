import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Content for the 404 page: on-brand, with a real way back. Rendered inside the marketing shell. */
export function NotFoundContent() {
  return (
    <main id="main" className="status wrap">
      <p className="status-code">
        <span className="chip chip--crit">
          <i /> 404
        </span>
        <span className="t-label">Not found</span>
      </p>
      <h1 className="t-display status-title">Nothing here to break.</h1>
      <p className="t-lede status-lede">
        This page (a 404) doesn’t exist. It may have moved, or the link may be wrong.
      </p>
      <div className="status-actions">
        <Link href="/" prefetch={false} className="btn btn--lime">
          Back to the start
          <ArrowRight className="arrow" size={17} strokeWidth={2.6} />
        </Link>
        <Link href="/preview" prefetch={false} className="btn btn--line">
          See the live demo
        </Link>
      </div>
    </main>
  );
}
