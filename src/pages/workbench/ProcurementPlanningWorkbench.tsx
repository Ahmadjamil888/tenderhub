/**
 * ProcurementPlanningWorkbench — Stage 1 of 26
 * Full 10 sub-stage implementation per "Flow - e procurement" spec.
 *
 * Sub-stages:
 *  1. Strategic Procurement Planning
 *  2. Needs Identification
 *  3. Demand Consolidation
 *  4. Budget Verification
 *  5. Procurement Requisition
 *  6. Requisition Review
 *  7. Requisition Approval
 *  8. Procurement Risk Assessment
 *  9. Procurement Method Selection
 * 10. Procurement Strategy Approval
 */
import { useState } from "react";
import { AppShell, PageContextBar } from "@/components/AppShell";
import { StageFormWorkbench } from "@/components/StageFormWorkbench";
import { STAGE1_SUB_STAGES } from "@/lib/stage-configs/stage1-planning";
import { STAGE1_SUB_STAGES_B } from "@/lib/stage-configs/stage1-planning-b";
import {
  ClipboardList, ChevronRight, CheckCircle2, Clock, AlertTriangle,
  LayoutDashboard, Sparkles,
} from "lucide-react";
import TenderGovernancePanel from "@/components/TenderGovernancePanel";

const ALL_SUB_STAGES = [...STAGE1_SUB_STAGES, ...STAGE1_SUB_STAGES_B];

const STATUS_COLORS: Record<string, string> = {
  completed:   "bg-slate-100 text-[#0F172A]",
  active:      "bg-slate-100 text-[#0F172A]",
  pending:     "bg-gray-100 text-gray-500",
  returned:    "bg-slate-100 text-[#0F172A]",
};

export default function ProcurementPlanningWorkbench() {
  const [activeSubStage, setActiveSubStage] = useState<number | null>(null);
  const [stageStatuses, setStageStatuses]   = useState<Record<number, string>>(
    Object.fromEntries(ALL_SUB_STAGES.map((_, i) => [i, i === 0 ? "active" : "pending"]))
  );

  function handleComplete(idx: number) {
    setStageStatuses(prev => {
      const next = { ...prev, [idx]: "completed" };
      if (idx + 1 < ALL_SUB_STAGES.length) next[idx + 1] = "active";
      return next;
    });
    setActiveSubStage(null);
  }

  // ── Overview grid ──────────────────────────────────────────────────────────
  if (activeSubStage === null) {
    return (
      <AppShell>
        <PageContextBar
          ministry="Government of Zimbabwe"
          module="E-Procurement"
          process="Stage 1 — Procurement Planning"
          financialYear="FY2026"
          pageType="workbench"
        />
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0 bg-[#0f172a] text-white px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#0F172A]/30 grid place-items-center flex-shrink-0">
                <ClipboardList className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400">E-Procurement Module</div>
                <div className="text-lg font-bold">Stage 1 — Procurement Planning</div>
                <div className="text-xs text-white/50">10 sub-stages · Annual procurement planning through strategy approval</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex-shrink-0 bg-white border-b border-black/8 px-5 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-black/60">Stage Completion</span>
              <span className="text-xs font-bold text-black">
                {Object.values(stageStatuses).filter(s => s === "completed").length} / {ALL_SUB_STAGES.length} sub-stages complete
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0F172A] rounded-full transition-all"
                style={{ width: `${(Object.values(stageStatuses).filter(s => s === "completed").length / ALL_SUB_STAGES.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Sub-stage grid */}
          <div className="flex-1 overflow-y-auto bg-[#f4f7fb] p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_SUB_STAGES.map((sub, idx) => {
                const status = stageStatuses[idx] ?? "pending";
                return (
                  <button
                    key={idx}
                    onClick={() => status !== "pending" || idx === 0 ? setActiveSubStage(idx) : undefined}
                    disabled={status === "pending" && idx > 0}
                    className={`text-left bg-white border-2 rounded-xl p-4 transition-all group
                      ${status === "completed" ? "border-slate-200 hover:shadow-md" :
                        status === "active"    ? "border-slate-200 shadow-md hover:shadow-lg" :
                        status === "returned"  ? "border-slate-200 hover:shadow-md" :
                        "border-gray-200 opacity-60 cursor-not-allowed"}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0
                        ${status === "completed" ? "bg-[#0F172A] text-white" :
                          status === "active"    ? "bg-[#0F172A] text-white" :
                          "bg-gray-200 text-gray-500"}`}>
                        {status === "completed"
                          ? <CheckCircle2 className="h-4 w-4" />
                          : idx + 1}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
                        {status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#0f172a] mb-1 group-hover:text-[#0F172A] transition-colors">
                      {sub.subStageName}
                    </div>
                    <div className="text-[10px] text-black/45 mb-2">{sub.majorActivity}</div>
                    <div className="flex items-center gap-1.5 text-[10px] text-black/40">
                      <Sparkles className="h-3 w-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{sub.aiControl.split(" — ")[0]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-black/40 mt-0.5">
                      <AlertTriangle className="h-3 w-3 text-slate-500 flex-shrink-0" />
                      <span>Auth: {sub.requiredAuthorization}</span>
                    </div>
                    {status !== "pending" && (
                      <div className="mt-3 flex items-center gap-1 text-[10px] text-[#0F172A] font-semibold">
                        Open Sub-Stage <ChevronRight className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tender Governance Controls */}
            <div className="mt-6">
              <TenderGovernancePanel mode="inline" defaultOpen={false} />
            </div>

            {/* Tender Layered Approval Matrix */}
            <div className="mt-6 bg-white border border-black/8 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-black/8 flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-[#0f172a]" />
                <span className="text-sm font-bold text-[#0f172a]">Tender Layered Approval Matrix</span>
                <span className="text-[10px] bg-slate-100 text-[#0F172A] px-2 py-0.5 rounded font-bold ml-auto">From Spec</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#0f172a] text-white">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold">Procurement Value</th>
                      <th className="text-left px-4 py-2.5 text-[10px] font-semibold">Typical Approval Levels</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {[
                      { value:"Up to USD 10,000",          approval:"Supervisor" },
                      { value:"USD 10,001 – 100,000",       approval:"HOD + Finance Manager" },
                      { value:"USD 100,001 – 500,000",      approval:"Director + Procurement Manager" },
                      { value:"USD 500,001 – 2 Million",    approval:"Procurement Committee + CFO" },
                      { value:"USD 2 Million – 10 Million", approval:"Accounting Officer / Permanent Secretary" },
                      { value:"Above USD 10 Million",       approval:"Minister / Central Tender Authority / Board" },
                    ].map(r => (
                      <tr key={r.value} className="hover:bg-[#f4f7fb]">
                        <td className="px-4 py-2.5 font-semibold text-black">{r.value}</td>
                        <td className="px-4 py-2.5 text-black/70">{r.approval}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── Active sub-stage form ──────────────────────────────────────────────────
  const subStage = ALL_SUB_STAGES[activeSubStage];
  return (
    <AppShell>
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="E-Procurement"
        process={`Stage 1 · ${subStage.subStageName}`}
        financialYear="FY2026"
        pageType="form"
      />
      {/* Back button */}
      <div className="flex-shrink-0 bg-white border-b border-black/8 px-4 py-2 flex items-center gap-2">
        <button
          onClick={() => setActiveSubStage(null)}
          className="h-7 px-3 border border-black/15 text-xs font-semibold text-black/60 hover:bg-gray-50 rounded flex items-center gap-1.5 transition-colors"
        >
          ← Back to Stage 1 Overview
        </button>
        <div className="flex items-center gap-1.5 text-xs text-black/40">
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-black/60">{subStage.subStageName}</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <StageFormWorkbench
          config={subStage}
          ministry="Ministry of Finance & Economic Development"
          onComplete={() => handleComplete(activeSubStage)}
        />
      </div>
    </AppShell>
  );
}
