/**
 * BidEvaluationWorkbench — Stage 12 / Stage 3 Tender Evaluation
 * Top panel: TenderEvaluationForms (existing)
 * Full sub-stage form flow below via WorkbenchStageShell
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WorkbenchStageShell from "@/components/WorkbenchStageShell";
import TenderEvaluationForms from "@/components/TenderEvaluationForms";
import { STAGE3_SUB_STAGES } from "@/lib/stage-configs/stage3-evaluation";
import { BarChart3, ClipboardList, ChevronDown, ChevronUp, BadgeCheck, ExternalLink } from "lucide-react";

export default function BidEvaluationWorkbench() {
  const [showForms, setShowForms] = useState(false);
  const [showSubStages, setShowSubStages] = useState(true);
  const [tender, setTender]   = useState("ZW-PRA-2026-00184");
  const [bidder, setBidder]   = useState("Zimbabwe Pharma Holdings");
  const navigate = useNavigate();

  if (showSubStages) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        {/* Collapsible evaluation forms */}
        <div className={`flex-shrink-0 border-b border-black/10 bg-white transition-all ${showForms ? "h-[55vh]" : "h-12"}`}>
          <div className="flex items-center justify-between px-4 py-2 bg-[#0f172a] text-white h-12 flex-shrink-0">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-semibold">Tender Evaluation Forms</span>
              <span className="text-[10px] text-white/40 ml-3">Tender:</span>
              <input value={tender} onChange={e => setTender(e.target.value)}
                className="h-6 px-2 text-[10px] bg-white/10 border border-white/20 text-white w-44 focus:outline-none rounded" />
              <span className="text-[10px] text-white/40">Bidder:</span>
              <input value={bidder} onChange={e => setBidder(e.target.value)}
                className="h-6 px-2 text-[10px] bg-white/10 border border-white/20 text-white w-40 focus:outline-none rounded" />
              <button onClick={() => navigate("/workbench/competency-assessment")}
                className="h-6 px-2 text-[9px] bg-[#0F172A]/70 hover:bg-[#0F172A] text-white flex items-center gap-1 ml-2 rounded transition-colors">
                <BadgeCheck className="h-3 w-3" /> Competency <ExternalLink className="h-2.5 w-2.5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSubStages(false)}
                className="h-6 px-2 text-[9px] bg-[#0F172A]/70 hover:bg-[#0F172A] text-white rounded transition-colors">
                Stage 3 Sub-Stages
              </button>
              <button onClick={() => setShowForms(v => !v)}
                className="h-7 px-3 text-[10px] bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 rounded transition-colors">
                {showForms ? <><ChevronUp className="h-3.5 w-3.5" /> Collapse</> : <><ChevronDown className="h-3.5 w-3.5" /> Evaluation Forms</>}
              </button>
            </div>
          </div>
          {showForms && (
            <div className="h-[calc(55vh-3rem)] overflow-hidden">
              <TenderEvaluationForms tender={tender} bidder={bidder} embedded />
            </div>
          )}
        </div>
        {/* Sub-stage shell */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <WorkbenchStageShell
            stageNumber={3}
            stageLabel="Tender Evaluation"
            stageDesc={`${STAGE3_SUB_STAGES.length} sub-stages · Bid opening through award recommendation`}
            icon={BarChart3}
            subStages={STAGE3_SUB_STAGES}
          />
        </div>
      </div>
    );
  }

  // Sub-stage form view
  return (
    <WorkbenchStageShell
      stageNumber={3}
      stageLabel="Tender Evaluation"
      stageDesc={`${STAGE3_SUB_STAGES.length} sub-stages`}
      icon={BarChart3}
      subStages={STAGE3_SUB_STAGES}
    />
  );
}
