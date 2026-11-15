/**
 * The Infiniview mark: a frame, a frame inside it, and a point of focus (a viewfinder). On hover
 * the frames tighten toward the point.
 */
export function Mark({ size = 26, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      className={`mark ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <rect className="mark-f1" x="2" y="2" width="28" height="28" rx="9" stroke="currentColor" strokeWidth="2.2" />
      <rect className="mark-f2" x="8.5" y="8.5" width="15" height="15" rx="4.5" stroke="currentColor" strokeWidth="2.2" opacity="0.8" />
      <rect className="mark-f3" x="13" y="13" width="6" height="6" rx="1.8" fill="currentColor" />
    </svg>
  );
}

/**
 * A headline whose words rise out of their own masks, in reading order, as a CSS animation that
 * starts with the first paint (no script). The words move but are never transparent, so the
 * headline is painted, and counted as the page's largest paint, in the very first frame.
 * Screen readers get the sentence from the heading's `aria-label`; the spans are hidden from them.
 */
export function MaskedWords({ words }: { words: readonly { text: string; br?: boolean }[] }) {
  return (
    <>
      {words.map((w, i) => (
        <span key={i} aria-hidden>
          <span className="hw" style={{ ["--i" as string]: i }}>
            <span>{w.text}</span>
          </span>{" "}
          {w.br ? <br className="hero-br" /> : null}
        </span>
      ))}
    </>
  );
}
