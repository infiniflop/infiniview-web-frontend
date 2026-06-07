// Static demo UI. All data is mocked. No backend logic.
// Local mirror of the product's `lib/findings` severity system + presentation
// helpers, scoped to the /preview demo. Values match the product verbatim so
// the demo renders identical colors, ordering, and labels.

import type { Severity } from "@/components/preview/ui";
import type {
  Exploitability,
  FindingDelta,
  MockFinding,
} from "@/components/preview/mock-data";

export interface SeverityColor {
  bg: string;
  text: string;
  border: string;
  dot: string;
}

export const SEVERITY_COLORS: Record<Severity, SeverityColor> = {
  critical: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    border: "border-red-500/30",
    dot: "#ff4d4d",
  },
  high: {
    bg: "bg-orange-500/15",
    text: "text-orange-400",
    border: "border-orange-500/30",
    dot: "#fb923c",
  },
  medium: {
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    dot: "#facc15",
  },
  low: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    dot: "#34d399",
  },
  info: {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
    dot: "#38bdf8",
  },
};

export const FINDING_SEVERITY_ORDER: Severity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
];

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

export const EXPLOITABILITY_LABELS: Record<Exploitability, string> = {
  verified: "Verified",
  unverified: "Unverified",
  not_tested: "Not tested",
};

export const DELTA_LABELS: Record<FindingDelta, string> = {
  new: "New",
  recurring: "Recurring",
  regressed: "Regressed",
};

export function formatFindingCategory(category: string): string {
  return category.replace(/_/g, " ");
}

export function getFindingConfidencePercent(finding: MockFinding): number {
  // Demo confidences are authored as 0-100 integers already.
  return Math.round(finding.confidence);
}

// Mirrors the product's getModelRecommendation heuristic.
export function getModelRecommendation(finding: MockFinding): string {
  const haystack = `${finding.category} ${finding.primaryFile ?? finding.file}`.toLowerCase();
  const isFrontend =
    haystack.includes("xss") ||
    haystack.includes(".tsx") ||
    haystack.includes("ui") ||
    haystack.includes("frontend") ||
    haystack.includes("component");
  return isFrontend
    ? "We recommend Opus 4.6 for this frontend fix"
    : "We recommend GPT 5.5 for fixing this issue";
}

// Sort comparator used by the findings page sort control.
export type FindingSort = "priority" | "severity" | "confidence" | "recency";

export function sortFindings(
  findings: MockFinding[],
  sort: FindingSort,
): MockFinding[] {
  const copy = [...findings];
  switch (sort) {
    case "severity":
      return copy.sort(
        (a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity],
      );
    case "confidence":
      return copy.sort((a, b) => b.confidence - a.confidence);
    case "recency":
      return copy.sort((a, b) => a.id.localeCompare(b.id));
    case "priority":
    default:
      return copy.sort((a, b) => {
        const sev = SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
        if (sev !== 0) return sev;
        const exploit = (x: Exploitability) =>
          x === "verified" ? 2 : x === "unverified" ? 1 : 0;
        const ex = exploit(b.exploitability) - exploit(a.exploitability);
        if (ex !== 0) return ex;
        return b.confidence - a.confidence;
      });
  }
}
