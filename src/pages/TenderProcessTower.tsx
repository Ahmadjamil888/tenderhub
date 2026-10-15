/**
 * TenderProcessTower — Full tender lifecycle tower for a single tender
 * Routes: /tenders/module/:moduleType/evaluate/:tenderId
 *         /tenders/investigation/:tenderId
 */
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { WorkflowActionBar } from "@/components/ui/WorkflowActionBar";
import { ApprovalSignatureBlock } from "@/components/ui/ApprovalSignatureBlock";
import { DocumentViewerPanel } from "@/components/ui/DocumentViewerPanel";
import { AiAgentChatPanel } from "@/components/ui/AiAgentChatPanel";
import { ArrowLeft, CheckCircle2, Circle, Clock, ChevronRight } from "lucide-react";

const PROCESS_STAGES = [
  { id: "planning",       label: "Tender Planning",              status: "completed" as const },
  { id: "publishing",     label: "Tender Publishing",            status: "completed" as const },
  { id: "submissions",    label: "Bid Submissions",              status: "completed" as const },
  { id: "opening",        label: "Bids Opening",                 status: "active" as const },
  { id: "compliance",     label: "Compliance Check",             status: "pending" as const },
  { id: "competency",     label: "Competency Exams",             status: "pending" as const },
  { id: "technical",      label: "Technical Evaluation",         status: "pending" as const },
  { id: "financial",      label: "Financial Evaluation",         status: "pending" as const },
  { id: "final-score",    label: "Final Score & Ranking",        status: "pending" as const },
  { id: "award",          label: "Bid Award",                    status: "pending" as const },
  { id: "appeals",        label: "Appeals & Adjudication",       status: "pending" as const },
  { id: "contracts",      label: "Bid Contracts",                status: "pending" as const },
  { id: "implementation", label: "Implementation & Delivery",    status: "pending" as const },
  { id: "payment",        label: "Tender Payment",               status: "pending" as const },
  { id: "reconciliation", label: "Reconciliations & Audit",      status: "pending" as const },
  { id: "lessons",        label: "Lessons Learnt",               status: "pending" as const },
  { id: "performance",    label: "Bidder Performance Profiling", status: "pending" as const },
  { id: "closeout",       label: "Tender Close Out",             status: "pending" as const },
];

const STAGE_ICON = (status: "completed" | "active" | "pending") => {
  if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (status === "active")    return <Clock className="h-4 w-4 text-[#0f172a] animate-pulse" />;
  return <Circle className="h-4 w-4 text-gray-300" />;
};

export default function TenderProcessTower() {
  const { moduleType = "tenders", tenderId = "1" } = useParams<{ moduleType?: string; tenderId?: string }>();
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState("opening");
  const [showDoc, setShowDoc] = useState(true);
  const [showAI, setShowAI]   = useState(true);

  const current = PROCESS_STAGES.find(s => s.id === activeStage) ?? PROCESS_STAGES[3];

  return (
    <AppShell>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-[#0F172A] text-white px-6 py-3 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Tender Process Tower · Ref: ZW-PRA-2026-{tenderId.padStart(5,"0")}
            </div>
            <div className="text-sm font-black text-white">Supply & Installation of Solar Mini-Grids</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowDoc(v=>!v)} className="text-xs border border-white/20 rounded px-2 py-1 text-white/60 hover:text-white">{showDoc?"Hide Doc":"Show Doc"}</button>
            <button onClick={() => setShowAI(v=>!v)}  className="text-xs border border-white/20 rounded px-2 py-1 text-white/60 hover:text-white">{showAI ?"Hide AI":"Show AI"}</button>
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white border border-white/20 rounded-lg px-3 py-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Process Tower sidebar */}
          <div className="w-56 shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="px-3 pt-3 pb-2">
              <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Process Tower</div>
              <div className="space-y-0.5">
                {PROCESS_STAGES.map((stage, idx) => (
                  <button key={stage.id} onClick={() => setActiveStage(stage.id)}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs transition-all ${
                      activeStage === stage.id
                        ? "bg-[#0f172a] text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}>
                    <span className="flex-shrink-0">{STAGE_ICON(stage.status)}</span>
                    <span className="text-[10px] font-mono text-gray-400 w-4 flex-shrink-0">{String(idx+1).padStart(2,"0")}</span>
                    <span className="flex-1 truncate font-medium">{stage.label}</span>
                    {activeStage === stage.id && <ChevronRight className="h-3 w-3 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Stage header */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                {STAGE_ICON(current.status)}
                <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${
                  current.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                  current.status === "active"    ? "bg-[#0f172a] text-white" :
                  "bg-gray-100 text-gray-500"}`}>
                  {current.status}
                </span>
              </div>
              <h2 className="text-lg font-black text-gray-900">{current.label}</h2>
              <p className="text-xs text-gray-500 mt-0.5">Tender Ref: ZW-PRA-2026-{tenderId.padStart(5,"0")} · Ministry of Energy and Power Development</p>
            </div>

            {/* Form area */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{current.label} — Form</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {["Tender Name","Reference Code","Ministry","Department","Stage","Assigned To","Date","Remarks"].map(f => (
                  <div key={f} className="border border-gray-200 rounded-lg p-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">{f}</label>
                    <input className="w-full text-sm text-gray-800 outline-none bg-transparent" />
                  </div>
                ))}
              </div>
              <ApprovalSignatureBlock createdBy={{ name: "Current User", date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() }} />
            </div>

            <WorkflowActionBar
              visibleButtons={["back","saveDraft","approve","authorize","adjudicate","appealApproval"]}
              showUtilities={true}
              onBack={() => navigate(-1)}
            />
          </div>

          {/* Right panels */}
          <div className="w-80 shrink-0 flex flex-col gap-3 p-3 bg-gray-50 border-l border-gray-200 overflow-y-auto">
            {showDoc && (
              <DocumentViewerPanel
                documents={[{ id:"1", name:"Notification Letter (External)", type:"letter", content:"<p>Document content here</p>" }]}
                defaultVisible={true}
              />
            )}
            {showAI && (
              <AiAgentChatPanel
                agentName="Process AI"
                agentRole="Tender Evaluation Assistant"
                context={current.label}
                suggestedPrompts={["Check compliance","Score evaluation","Flag anomaly","Summarise bids"]}
                color="blue"
                defaultVisible={true}
              />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
