import { cn } from "@/lib/utils";

/**
 * The hero's stage: a pull request as it looks on the surface, and the same
 * pull request as Infiniview saw it. Both are built at interface size with
 * sample data (the same fictional run the demo dashboard uses).
 *
 * `mode="surface"` renders the ordinary PR. `mode="evidence"` renders the
 * annotated version: tainted input, the sink, the request that proved it,
 * and the fix. The two share geometry so the lens can reveal one through
 * the other.
 */

const CODE: { n: number; text: string; role?: "taint" | "sink" }[] = [
  { n: 84, text: "export async function searchUsers(req, res) {" },
  { n: 85, text: "  const q = req.query.q ?? \"\";", role: "taint" },
  { n: 86, text: "  const rows = await db.raw(" },
  { n: 87, text: "    `SELECT id, name, email FROM users", role: "sink" },
  { n: 88, text: "     WHERE name LIKE '%${q}%'`", role: "sink" },
  { n: 89, text: "  );" },
  { n: 90, text: "  res.json(rows);" },
  { n: 91, text: "}" },
];

export function PRStage({ mode, className }: { mode: "surface" | "evidence"; className?: string }) {
  const ev = mode === "evidence";
  return (
    <div
      data-ui
      aria-hidden={ev ? undefined : undefined}
      className={cn(
        "relative flex h-full min-h-[520px] w-full flex-col overflow-hidden text-[13px] leading-[1.45] text-ink-2 select-none lg:min-h-0",
        ev ? "bg-[#0e0f13]" : "bg-surface",
        className,
      )}
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)" }}
    >
      {ev && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(229,72,77,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(229,72,77,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      )}

      {/* Title bar */}
      <div className="relative flex items-center gap-3 px-5 pt-4 pb-3">
        <span className={cn("evidence", ev ? "text-redline-bright" : "text-ink-3")}>
          {ev ? "infiniview · run 2 of 2 · 7m 12s" : "acme/payments-api"}
        </span>
        <span className="flex-1" />
        <span className="evidence text-ink-4">#247</span>
      </div>

      <div className="relative px-5">
        <div className="flex items-baseline gap-3">
          <h3 className="text-[19px] font-medium tracking-[-0.015em] text-ink">Add admin search filter</h3>
          <span className="evidence hidden text-ink-4 sm:inline">feat/admin-search → main</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-ink-3">
          <span className="inline-block h-4 w-4 rounded-full bg-raised-2" />
          <span>j.okafor wants to merge 3 commits</span>
          <span className="text-ink-4">·</span>
          <span>2 files changed</span>
          <span className="text-mint">+61</span>
          <span className="text-redline-bright">−4</span>
        </div>
      </div>

      {/* Checks */}
      <div className="relative mx-5 mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 bg-raised/70 px-4 py-2.5">
        <Check ok label="build" />
        <Check ok label="lint" />
        <Check ok label="unit tests" />
        {ev ? (
          <span className="flex items-center gap-2 text-redline-bright">
            <span className="inline-block h-1.5 w-1.5 bg-redline-bright" />
            infiniview: 1 critical, 2 high
          </span>
        ) : (
          <span className="ml-auto text-ink-3">All checks have passed</span>
        )}
      </div>

      {/* Severity band (evidence only, occupies same slot as a spacer) */}
      <div className="relative mx-5 mt-3 h-[38px]">
        {ev ? (
          <div data-ev="band" className="flex h-full items-center gap-3 bg-redline px-4 text-ground">
            <span className="text-[12px] font-semibold uppercase tracking-[0.02em]">Critical</span>
            <span className="text-[13px] font-medium">SQL injection in admin search filter</span>
            <span className="ml-auto hidden text-[12px] opacity-90 sm:inline">exploit verified</span>
          </div>
        ) : (
          <div className="flex h-full items-center gap-3 text-ink-3">
            <span className="evidence">services/admin/search.ts</span>
            <span className="text-ink-4">·</span>
            <span className="evidence">@@ -84,8 +84,8 @@</span>
          </div>
        )}
      </div>

      {/* Diff */}
      <div className="relative mx-5 mt-2 bg-ground/60">
        <div className="evidence flex items-center gap-3 px-4 pt-2 text-ink-4">
          <span>services/admin/search.ts</span>
          <span>·</span>
          <span>{ev ? "taint: req.query.q → db.raw" : "1 hunk · 8 lines"}</span>
        </div>
        <pre className="evidence overflow-hidden px-2 py-2">
          {CODE.map((l) => {
            const hl = ev && l.role;
            return (
              <div
                key={l.n}
                className={cn(
                  "flex gap-3 px-2",
                  hl === "taint" && "bg-redline/15",
                  hl === "sink" && "bg-redline/10",
                )}
              >
                <span className="w-6 shrink-0 text-right text-ink-4">{l.n}</span>
                <span className={cn("whitespace-pre", ev ? "text-ink" : "text-ink-2")}>
                  {ev && l.role === "taint" ? (
                    <>
                      {"  const "}
                      <span className="text-redline-bright">q</span>
                      {" = "}
                      <span className="underline decoration-redline decoration-2 underline-offset-4">req.query.q</span>
                      {" ?? \"\";"}
                    </>
                  ) : ev && l.n === 88 ? (
                    <>
                      {"     WHERE name LIKE '%"}
                      <span className="bg-redline px-0.5 text-ground">${"{q}"}</span>
                      {"%'`"}
                    </>
                  ) : (
                    l.text
                  )}
                </span>
                {hl === "taint" && (
                  <span className="ml-auto hidden text-redline-bright sm:inline">source</span>
                )}
                {hl === "sink" && l.n === 88 && (
                  <span className="ml-auto hidden text-redline-bright sm:inline">sink</span>
                )}
              </div>
            );
          })}
        </pre>
      </div>

      {/* Footer slot: merge button vs. proof */}
      <div className="relative mx-5 mt-auto mb-5 pt-4">
        {ev ? (
          <div data-ev="trace" className="flex flex-col gap-2">
            <div className="evidence flex flex-wrap items-center gap-x-3 gap-y-1 bg-raised px-4 py-2.5 text-ink">
              <span className="text-ink-3">GET</span>
              <span className="truncate">/admin/search?q=%25&apos;%20OR%201%3D1%20--%20</span>
              <span className="ml-auto text-mint">200</span>
              <span className="text-ink-3">4,812 rows · 212 ms</span>
            </div>
            <div className="evidence flex flex-col bg-raised px-4 py-2.5">
              <span className="text-redline-bright">− db.raw(`... WHERE name LIKE &apos;%${"{q}"}%&apos;`)</span>
              <span className="text-mint">+ db.query(&apos;... WHERE name LIKE ?&apos;, [`%${"{q}"}%`])</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <span className="text-ink-3">This branch has no conflicts with the base branch.</span>
            <span className="inline-flex h-9 shrink-0 items-center bg-mint px-4 text-[13px] font-medium whitespace-nowrap text-ground">
              Merge pull request
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="flex items-center gap-2 text-ink-2">
      <span className={cn("inline-block h-1.5 w-1.5 rounded-full", ok ? "bg-mint" : "bg-redline")} />
      {label}
    </span>
  );
}
