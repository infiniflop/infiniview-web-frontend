"use client";

// Last resort: an error in the root layout itself. It has to supply its own <html>/<body> and
// cannot rely on any stylesheet, font or component, so everything it needs is inline.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#03040a",
          color: "#f3f5fa",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <main>
          <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", letterSpacing: "-0.04em", margin: "0 0 12px" }}>
            That one’s on us.
          </h1>
          <p style={{ color: "#b3b9ca", margin: "0 0 28px" }}>Something went wrong. Please try again.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              height: 52,
              padding: "0 28px",
              border: 0,
              borderRadius: 999,
              background: "#d2fb5a",
              color: "#070a02",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
