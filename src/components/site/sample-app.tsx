import { Search } from "lucide-react";

/**
 * The app under test: a small, fictional admin console ("Acme Admin"). It is drawn twice with the
 * same boxes: once as its users see it, and once as an attacker does (`mode="xray"`), which is what
 * the lens shows. Every box has a fixed size, so the two copies register exactly whatever the text.
 *
 * The three weak points are the three sample findings from lib/site/content.ts (and the /preview
 * demo): a search field that reaches raw SQL, a refund that can be replayed, and no rate limit.
 * Sample content throughout; none of it is a customer.
 */
const ROWS = [
  { name: "Dana Whitfield", email: "dana@northwind.example", plan: "Pro", order: "#4821", amount: "$42.00" },
  { name: "Iker Zubiri", email: "iker@fathom.example", plan: "Team", order: "#4817", amount: "$129.00" },
  { name: "Priya Raman", email: "priya@lumen.example", plan: "Free", order: "#4809", amount: "$18.50" },
  { name: "Tomasz Wilk", email: "tomasz@orbit.example", plan: "Pro", order: "#4788", amount: "$42.00" },
  { name: "Aiko Tanabe", email: "aiko@kite.example", plan: "Team", order: "#4761", amount: "$129.00" },
  { name: "Caleb Osei", email: "caleb@harbor.example", plan: "Free", order: "#4740", amount: "$18.50" },
  { name: "Marta Lindqvist", email: "marta@tern.example", plan: "Pro", order: "#4733", amount: "$42.00" },
  { name: "Rohan Mehta", email: "rohan@quill.example", plan: "Team", order: "#4729", amount: "$129.00" },
  { name: "Sofia Almeida", email: "sofia@arbor.example", plan: "Pro", order: "#4712", amount: "$42.00" },
] as const;

const SIDE = ["Customers", "Orders", "Refunds", "Settings"] as const;

export function SampleApp({ mode = "app", label = "Sample app" }: { mode?: "app" | "xray"; label?: string }) {
  const x = mode === "xray";
  return (
    <div className="app" data-mode={mode}>
      <div className="app-bar">
        <span className="app-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="app-url">staging.acme.example/admin/customers</span>
        <span className="app-tag">{x ? "Attack view" : label}</span>
      </div>
      <div className="app-body">
        <div className="app-side">
          <span className="app-org">
            <i />
            Acme
          </span>
          {SIDE.map((s, i) => (
            <span key={s} className="app-nav" data-on={i === 0 ? "true" : undefined}>
              {s}
            </span>
          ))}
        </div>
        <div className="app-main">
          <div className="app-head">
            <span className="app-title">{x ? "4,812 rows returned" : "Customers"}</span>
            <span className="app-search" data-hot="sqli">
              <Search size={13} strokeWidth={2.2} />
              <span>{x ? "q=%' OR 1=1 --" : "Search customers"}</span>
              {x && <em className="app-flag">SQL injection · search.ts:87</em>}
            </span>
          </div>
          <div className="app-table">
            <div className="app-row app-row--head">
              <span>Name</span>
              <span>Email</span>
              <span>{x ? "password_hash" : "Plan"}</span>
              <span>Last order</span>
              <span />
            </div>
            {ROWS.map((r, i) => (
              <div key={r.email} className="app-row">
                <span className="app-name">{r.name}</span>
                <span className="app-email">{r.email}</span>
                <span className="app-plan">{x ? "$2b$10$N9qo8…" : r.plan}</span>
                <span className="app-order">
                  {x && i === 0 ? "5 refunds · $210.00" : `${r.order} · ${r.amount}`}
                </span>
                <span className="app-act" data-hot={i === 0 ? "refund" : undefined}>
                  {x && i === 0 ? "×5 in 1s" : "Refund"}
                  {x && i === 0 && <em className="app-flag app-flag--left">No idempotency key · handler.ts:142</em>}
                </span>
              </div>
            ))}
          </div>
          <div className="app-foot">
            <span className="app-route">POST /v1/refund</span>
            <span className="app-meter" data-hot="rate">
              <span className="app-bars">
                {Array.from({ length: 12 }, (_, i) => (
                  <i key={i} data-on={x || i < 3 ? "true" : undefined} />
                ))}
              </span>
              <span>{x ? "200 sent · 0 × 429" : "12 req / min"}</span>
              {x && <em className="app-flag app-flag--up">No rate limit · refund.ts:18</em>}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
