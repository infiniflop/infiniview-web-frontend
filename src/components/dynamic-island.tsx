"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Code,
  Eye,
  Bug,
  FileText,
  Check,
  AlertTriangle,
  Activity,
} from "lucide-react";

const TABS = [
  { id: "scan", label: "Scan", icon: Activity },
  { id: "review", label: "Review", icon: Code },
  { id: "attack", label: "Attack", icon: Bug },
  { id: "interact", label: "Interact", icon: Eye },
  { id: "report", label: "Report", icon: FileText },
] as const;

type TabId = (typeof TABS)[number]["id"];

const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 1,
};

const SCAN_STEPS = [
  { label: "Sandbox Ready", done: true },
  { label: "App Deployed", done: true },
  { label: "Graph Built", done: true },
  { label: "Scanners Done", done: true },
  { label: "Agents Running", done: false, active: true },
];

const REVIEW_FINDINGS = [
  { severity: "critical", message: "Unsanitized SQL query in /api/users", file: "src/api/users.ts:42" },
  { severity: "high", message: "Missing auth middleware on admin route", file: "src/routes/admin.ts:15" },
  { severity: "medium", message: "Unhandled promise rejection in webhook handler", file: "src/webhooks/stripe.ts:88" },
];

const ATTACK_AGENTS = [
  { name: "SSRF Prober", status: "exploited", detail: "Internal metadata endpoint accessible" },
  { name: "Auth Attacker", status: "testing", detail: "Brute-forcing login endpoint" },
  { name: "Injection Tester", status: "clean", detail: "SQL injection - 0 findings" },
  { name: "API Fuzzer", status: "testing", detail: "Fuzzing /api/v2 endpoints" },
];

const INTERACT_TESTS = [
  { name: "Form Fuzzing", progress: 100, result: "2 XSS vectors found" },
  { name: "Auth Flow", progress: 100, result: "Session fixation detected" },
  { name: "Deep Links", progress: 72, result: "Testing route guards..." },
  { name: "Multi-Tab", progress: 0, result: "Queued" },
];

const REPORT_STATS = [
  { label: "Critical", value: 3, color: "bg-red" },
  { label: "High", value: 7, color: "bg-[#f59e0b]" },
  { label: "Medium", value: 12, color: "bg-[#06b6d4]" },
  { label: "Low", value: 4, color: "bg-[#6b7280]" },
];

function ScanContent() {
  return (
    <div className="flex gap-6 px-2 py-1">
      <div className="flex flex-col gap-2.5 min-w-[140px]">
        {SCAN_STEPS.map((step) => (
          <div key={step.label} className="flex items-center gap-2.5">
            <div
              className={`h-2 w-2 rounded-full shrink-0 ${
                step.done
                  ? "bg-[#22c55e]"
                  : step.active
                    ? "bg-[#f59e0b] animate-pulse"
                    : "bg-[#6b7280]/40"
              }`}
            />
            <span
              className={`text-[12px] font-medium ${
                step.active ? "text-white" : step.done ? "text-[#9ca3af]" : "text-[#6b7280]"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex-1 rounded-lg border border-[#252830] bg-[#0d0f14] p-3.5 min-w-[240px]">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#6b7280] mb-2">
          Live Agent Activity
        </div>
        <div className="space-y-1.5 font-mono text-[11px]">
          <p className="text-[#f59e0b]">&#9656; SSRF Prober scanning /api/webhooks</p>
          <p className="text-[#22c55e]">&#10003; Code review complete (3 findings)</p>
          <p className="text-[#f59e0b]">&#9656; Auth Attacker testing login flow</p>
          <p className="text-[#ef4444]">&#9888; Exploit confirmed: SSRF via webhook URL</p>
        </div>
      </div>
    </div>
  );
}

function ReviewContent() {
  return (
    <div className="space-y-2 px-2 py-1">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">Code Review Findings</span>
        <span className="rounded-full bg-[#ef4444]/15 px-2 py-0.5 text-[10px] font-bold text-[#ef4444]">3 issues</span>
      </div>
      {REVIEW_FINDINGS.map((f) => (
        <div
          key={f.file}
          className="flex items-start gap-3 rounded-lg border border-[#252830] bg-[#0d0f14] p-3"
        >
          <div className="mt-0.5 shrink-0">
            {f.severity === "critical" ? (
              <AlertTriangle size={13} className="text-[#ef4444]" />
            ) : f.severity === "high" ? (
              <AlertTriangle size={13} className="text-[#f59e0b]" />
            ) : (
              <AlertTriangle size={13} className="text-[#06b6d4]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-[#f0f0f2] leading-tight">{f.message}</p>
            <p className="text-[11px] font-mono text-[#6b7280] mt-0.5">{f.file}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function AttackContent() {
  return (
    <div className="space-y-2 px-2 py-1">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">Runtime Attack Agents</span>
        <span className="flex items-center gap-1 rounded-full bg-[#ef4444]/15 px-2 py-0.5 text-[10px] font-bold text-[#ef4444]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444] animate-pulse" /> Live
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ATTACK_AGENTS.map((agent) => (
          <div
            key={agent.name}
            className={`rounded-lg border p-3 ${
              agent.status === "exploited"
                ? "border-[#ef4444]/30 bg-[#ef4444]/5"
                : "border-[#252830] bg-[#0d0f14]"
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  agent.status === "exploited"
                    ? "bg-[#ef4444]"
                    : agent.status === "testing"
                      ? "bg-[#f59e0b] animate-pulse"
                      : "bg-[#22c55e]"
                }`}
              />
              <span className="text-[12px] font-semibold text-[#f0f0f2]">{agent.name}</span>
            </div>
            <p className="text-[11px] text-[#6b7280] leading-tight">{agent.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InteractContent() {
  return (
    <div className="space-y-2 px-2 py-1">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">Interaction Tests</span>
        <span className="rounded-full bg-[#14b8a6]/15 px-2 py-0.5 text-[10px] font-bold text-[#14b8a6]">Browser Agent</span>
      </div>
      <div className="space-y-2">
        {INTERACT_TESTS.map((test) => (
          <div key={test.name} className="rounded-lg border border-[#252830] bg-[#0d0f14] p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-semibold text-[#f0f0f2]">{test.name}</span>
              <span className="text-[11px] font-mono text-[#6b7280]">{test.progress}%</span>
            </div>
            <div className="h-1 rounded-full bg-[#252830] mb-1.5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${test.progress === 100 ? "bg-[#14b8a6]" : test.progress > 0 ? "bg-[#f59e0b]" : "bg-[#6b7280]/30"}`}
                initial={{ width: 0 }}
                animate={{ width: `${test.progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-[11px] text-[#6b7280]">{test.result}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportContent() {
  return (
    <div className="px-2 py-1">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280]">Scan Report</span>
        <span className="rounded-full bg-[#22c55e]/15 px-2 py-0.5 text-[10px] font-bold text-[#22c55e]">
          <Check size={9} className="inline mr-0.5 -mt-px" />
          Complete
        </span>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {REPORT_STATS.map((stat) => (
          <div key={stat.label} className="text-center rounded-lg border border-[#252830] bg-[#0d0f14] p-3">
            <div className={`text-2xl font-bold ${
              stat.label === "Critical" ? "text-[#ef4444]" :
              stat.label === "High" ? "text-[#f59e0b]" :
              stat.label === "Medium" ? "text-[#06b6d4]" : "text-[#6b7280]"
            }`}>{stat.value}</div>
            <div className="text-[10px] font-medium text-[#6b7280] mt-0.5 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg border border-[#22c55e]/20 bg-[#22c55e]/5 p-3">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-[#22c55e]" />
          <span className="text-[12px] font-medium text-[#f0f0f2]">Results posted to PR #247</span>
        </div>
        <span className="text-[11px] font-mono text-[#22c55e]">3 blocking</span>
      </div>
    </div>
  );
}

const TAB_CONTENT: Record<TabId, () => React.ReactNode> = {
  scan: ScanContent,
  review: ReviewContent,
  attack: AttackContent,
  interact: InteractContent,
  report: ReportContent,
};

export function DynamicIsland() {
  const [activeTab, setActiveTab] = useState<TabId>("scan");

  return (
    <motion.div
      layout
      transition={springTransition}
      className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-[24px] border border-[#252830] bg-[#111318] shadow-2xl shadow-black/60"
    >
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                isActive
                  ? "text-white"
                  : "text-[#6b7280] hover:text-[#9ca3af]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="di-tab-bg"
                  className="absolute inset-0 rounded-full bg-[#252830]"
                  transition={springTransition}
                />
              )}
              <span className="relative z-[1] flex items-center gap-1.5">
                <Icon size={12} />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <motion.div layout transition={springTransition} className="px-3 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.2 }}
          >
            {TAB_CONTENT[activeTab]()}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between border-t border-[#252830] px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[11px] font-mono text-[#6b7280]">acme/payments-api</span>
        </div>
        <span className="text-[11px] font-mono text-[#6b7280]">Scan #1847</span>
      </div>
    </motion.div>
  );
}
