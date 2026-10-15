/**
 * TenderPreparationWorkbench — Stage 2 of 26
 * 8 sub-stages per spec (Tender Initiation → Advertisement)
 */
import { useState } from "react";
import { AppShell, PageContextBar } from "@/components/AppShell";
import { StageFormWorkbench } from "@/components/StageFormWorkbench";
import { STAGE2_SUB_STAGES } from "@/lib/stage-configs/stage2-tender-prep";
import {
  FileText, ChevronRight, CheckCircle2, Sparkles, AlertTriangle,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  completed:"bg-slate-100 text-[#0F172A]",
  active:   "bg-slate-100 text-[#0F172A]",
  pending:  "bg-gray-100 text-gray-500",
  returned: "bg-slate-100 text-[#0F172A]",
};

export default function TenderPreparationWorkbench() {
  const [activeSubStage, setActiveSubStage] = useState<number | null>(null);
  const [stageStatuses, setStageStatuses]   = useState<Record<number, string>>(
    Object.fromEntries(STAGE2_SUB_STAGES.map((_, i) => [i, i === 0 ? "active" : "pending"]))
  );

  function handleComplete(idx: number) {
    setStageStatuses(prev => {
      const next = { ...prev, [idx]: "completed" };
      if (idx + 1 < STAGE2_SUB_STAGES.length) next[idx + 1] = "active";
      return next;
    });
    setActiveSubStage(null);
  }

  if (activeSubStage === null) {
    const completed = Object.values(stageStatuses).filter(s => s === "completed").length;
    return (
      <AppShell>
        <PageContextBar ministry="Government of Zimbabwe" module="E-Procurement" process="Stage 2 — Tender Preparation" financialYear="FY2026" pageType="workbench" />
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-shrink-0 bg-[#0f172a] text-white px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#0F172A]/30 grid place-items-center flex-shrink-0">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400">E-Procurement Module</div>
                <div className="text-lg font-bold">Stage 2 — Tender Preparation</div>
                <div className="text-xs text-white/50">{STAGE2_SUB_STAGES.length} sub-stages · Tender initiation through advertisement</div>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 bg-white border-b border-black/8 px-5 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-black/60">Stage 2 Completion</span>
              <span className="text-xs font-bold text-black">{completed} / {STAGE2_SUB_STAGES.length} complete</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#0F172A] rounded-full transition-all" style={{ width:`${(completed/STAGE2_SUB_STAGES.length)*100}%` }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto bg-[#f4f7fb] p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {STAGE2_SUB_STAGES.map((sub, idx) => {
                const status = stageStatuses[idx] ?? "pending";
                return (
                  <button key={idx}
                    onClick={() => status !== "pending" ? setActiveSubStage(idx) : undefined}
                    disabled={status === "pending"}
                    className={`text-left bg-white border-2 rounded-xl p-4 transition-all group
                      ${status==="completed"?"border-slate-200 hover:shadow-md":status==="active"?"border-slate-200 shadow-md hover:shadow-lg":status==="returned"?"border-slate-200":"border-gray-200 opacity-60 cursor-not-allowed"}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 ${status==="completed"?"bg-[#0F172A] text-white":status==="active"?"bg-[#0F172A] text-white":"bg-gray-200 text-gray-500"}`}>
                        {status==="completed" ? <CheckCircle2 className="h-4 w-4" /> : idx+1}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_COLORS[status]||STATUS_COLORS.pending}`}>{status.toUpperCase()}</span>
                    </div>
                    <div className="text-sm font-bold text-[#0f172a] mb-1 group-hover:text-[#0F172A] transition-colors">{sub.subStageName}</div>
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
                        Open <ChevronRight className="h-3 w-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const subStage = STAGE2_SUB_STAGES[activeSubStage];
  return (
    <AppShell>
      <PageContextBar ministry="Government of Zimbabwe" module="E-Procurement" process={`Stage 2 · ${subStage.subStageName}`} financialYear="FY2026" pageType="form" />
      <div className="flex-shrink-0 bg-white border-b border-black/8 px-4 py-2 flex items-center gap-2">
        <button onClick={() => setActiveSubStage(null)} className="h-7 px-3 border border-black/15 text-xs font-semibold text-black/60 hover:bg-gray-50 rounded flex items-center gap-1.5 transition-colors">
          ← Back to Stage 2 Overview
        </button>
        <ChevronRight className="h-3 w-3 text-black/30" />
        <span className="text-xs font-medium text-black/60">{subStage.subStageName}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <StageFormWorkbench config={subStage} ministry="Ministry of Finance & Economic Development" onComplete={() => handleComplete(activeSubStage)} />
      </div>
    </AppShell>
  );
}
