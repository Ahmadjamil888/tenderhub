/**
 * EvaluateTenders — redesigned per 21 July Final Tenders Flow Design
 *
 * Per document spec:
 * - List rows: Tender Name, Tender Code, Closing Date & Time, Stage of Evaluation, View button
 * - Tenders separated into 3 categories (Supplies, Works, Services) on the same page
 * - Click any tender → Process Tower (sidebar) + Menu bar (all procurement stages)
 * - Evaluation stages: Compliance, Competency Exams, Technical Proposal, Technical Specifications, Financial Evaluation, Final Score, Award
 * - Document viewer (full screen, hide/show), AI chatbot (hide/show)
 * - Audit trail: back<>next, approve, authorize, adjudicate, appeal approval, date, time
 * - Approval signatures block at bottom
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClosingCountdownTimer } from "./ui/ClosingCountdownTimer";
import { WorkflowActionBar } from "./ui/WorkflowActionBar";
import { ApprovalSignatureBlock } from "./ui/ApprovalSignatureBlock";
import { DocumentViewerPanel } from "./ui/DocumentViewerPanel";
import { AiAgentChatPanel } from "./ui/AiAgentChatPanel";
import {
  Eye, Calendar, Building2, Tag, CheckCircle2, Clock, Circle,
  ChevronRight, FileText, Bot, User, Scale, AlertTriangle
} from "lucide-react";

type Tender = {
  id: string;
  name: string;
  code: string;
  ministry: string;
  closingDate: Date;
  evaluationStage: string;
  category: "Supplies" | "Works" | "Services";
  completion: number;
  createdBy: string;
  createdAt: string;
};

const MOCK_TENDERS: Tender[] = [
  { id:"1", name:"Procurement of Antiretroviral Medicines (2-Year Framework)",       code:"ZW-PRA-2026-00183", ministry:"Ministry of Health and Child Care",   closingDate:new Date("2026-06-12T16:00:00"), evaluationStage:"Technical Evaluation",  category:"Supplies", completion:65, createdBy:"R. Chikwanda — Procurement Officer",     createdAt:"2026-03-08T11:30:00" },
  { id:"2", name:"Supply of School Textbooks — Primary Grades 1–7",                  code:"ZW-PRA-2026-00178", ministry:"Ministry of Primary Education",      closingDate:new Date("2026-07-02T16:00:00"), evaluationStage:"Financial Evaluation",  category:"Supplies", completion:85, createdBy:"T. Moyo — Chief Procurement Officer",   createdAt:"2026-04-01T09:00:00" },
  { id:"3", name:"National Tax Administration System — Phase II",                    code:"ZW-PRA-2026-00182", ministry:"ZIMRA",                               closingDate:new Date("2026-07-21T16:00:00"), evaluationStage:"Compliance Check",      category:"Services", completion:25, createdBy:"P. Dube — Senior Procurement Officer",  createdAt:"2026-04-20T14:00:00" },
  { id:"4", name:"External Audit Services (3 Years)",                                code:"ZW-PRA-2026-00176", ministry:"Auditor-General Office",             closingDate:new Date("2026-06-18T16:00:00"), evaluationStage:"Competency Exams",      category:"Services", completion:55, createdBy:"S. Nkosi — Audit Officer",              createdAt:"2026-03-15T10:30:00" },
  { id:"5", name:"Rehabilitation of Beitbridge–Harare Highway (Section 4)",          code:"ZW-PRA-2026-00181", ministry:"Ministry of Transport",              closingDate:new Date("2026-08-04T16:00:00"), evaluationStage:"Technical Specifications",category:"Works",   completion:40, createdBy:"A. Mpofu — Procurement Officer",        createdAt:"2026-05-01T08:00:00" },
  { id:"6", name:"Construction of Rural Health Clinics — Mashonaland East (Phase 3)",code:"ZW-PRA-2026-00177", ministry:"Ministry of Health and Child Care",  closingDate:new Date("2026-04-30T16:00:00"), evaluationStage:"Final Score",           category:"Works",   completion:92, createdBy:"T. Moyo — Chief Procurement Officer",   createdAt:"2026-02-10T09:00:00" },
];

// Full tender lifecycle stages per document
const PROCUREMENT_STAGES = [
  { id:"planning",       label:"Tender Planning",               status:"completed" as const },
  { id:"publishing",     label:"Tender Publishing",             status:"completed" as const },
  { id:"submissions",    label:"Bid Submissions Response",      status:"completed" as const },
  { id:"opening",        label:"Bids Opening",                  status:"completed" as const },
  { id:"compliance",     label:"Compliance",                    status:"active" as const },
  { id:"competency",     label:"Competency Exams",              status:"pending" as const },
  { id:"tech-proposal",  label:"Technical Proposal",            status:"pending" as const },
  { id:"tech-specs",     label:"Technical Specifications",      status:"pending" as const },
  { id:"financial",      label:"Financial Evaluation",          status:"pending" as const },
  { id:"final-score",    label:"Final Score",                   status:"pending" as const },
  { id:"award",          label:"Award",                         status:"pending" as const },
  { id:"appeals",        label:"Bid Appeals & Adjudication",    status:"pending" as const },
  { id:"contracts",      label:"Bid Contracts",                 status:"pending" as const },
  { id:"implementation", label:"Tender Implementation & Delivery", status:"pending" as const },
  { id:"payment",        label:"Tender Payment",                status:"pending" as const },
  { id:"reconciliation", label:"Reconciliations & Audit",       status:"pending" as const },
  { id:"lessons",        label:"Lessons Learnt",                status:"pending" as const },
  { id:"performance",    label:"Bidder Performance Profiling",  status:"pending" as const },
  { id:"closeout",       label:"Tender Close Out",              status:"pending" as const },
];

// Technical evaluation sub-stages per document
const EVAL_STAGES = [
  "Compliance",
  "Competency Exams",
  "Technical Proposal",
  "Technical Specifications",
  "Financial Evaluation",
  "Final Score",
  "Award",
];

type CategoryFilter = "All" | "Supplies" | "Works" | "Services";

const STAGE_COLOR: Record<string, string> = {
  "Compliance Check":        "bg-blue-100 text-blue-700",
  "Competency Exams":        "bg-amber-100 text-amber-700",
  "Technical Evaluation":    "bg-violet-100 text-violet-700",
  "Technical Specifications":"bg-indigo-100 text-indigo-700",
  "Financial Evaluation":    "bg-emerald-100 text-emerald-700",
  "Final Score":             "bg-green-100 text-green-700",
  "Award":                   "bg-gray-100 text-gray-700",
};

const CAT_COLORS: Record<string, { header: string; badge: string }> = {
  Supplies: { header:"bg-blue-600",    badge:"bg-blue-600 text-white" },
  Works:    { header:"bg-emerald-600", badge:"bg-emerald-600 text-white" },
  Services: { header:"bg-violet-600",  badge:"bg-violet-600 text-white" },
};

function CompletionBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? "bg-green-500" : pct >= 60 ? "bg-amber-400" : "bg-blue-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[50px]">
        <div className={`h-full ${color}`} style={{ width:`${pct}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-gray-500 w-7">{pct}%</span>
    </div>
  );
}

function StageIcon({ status }: { status: "completed" | "active" | "pending" }) {
  if (status === "completed") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />;
  if (status === "active")    return <Clock className="h-3.5 w-3.5 text-[#0f172a] animate-pulse flex-shrink-0" />;
  return <Circle className="h-3.5 w-3.5 text-gray-200 flex-shrink-0" />;
}

export function EvaluateTenders() {
  const navigate = useNavigate();
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [activeStage, setActiveStage]       = useState("compliance");
  const [activeEvalTab, setActiveEvalTab]   = useState(0);
  const [showDoc, setShowDoc]               = useState(true);
  const [showAI, setShowAI]                 = useState(true);

  const categories: ("Supplies" | "Works" | "Services")[] = ["Supplies", "Works", "Services"];

  const filteredByCategory = (cat: "Supplies" | "Works" | "Services") =>
    MOCK_TENDERS.filter(t => {
      if (categoryFilter !== "All" && t.category !== categoryFilter) return false;
      return t.category === cat;
    });

  /* ── LIST VIEW ──────────────────────────────────────────────────── */
  if (!selectedTender) {
    return (
      <div className="space-y-4">
        {/* Category filter tabs */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mr-1">Show:</span>
          {(["All","Supplies","Works","Services"] as CategoryFilter[]).map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className={`h-7 px-3 rounded-full text-xs font-semibold border transition-all ${
                categoryFilter === c
                  ? c === "Supplies" ? "bg-blue-600 text-white border-blue-600"
                  : c === "Works"    ? "bg-emerald-600 text-white border-emerald-600"
                  : c === "Services" ? "bg-violet-600 text-white border-violet-600"
                  : "bg-[#0f172a] text-white border-[#0f172a]"
                  : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}>
              {c}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">
            {MOCK_TENDERS.filter(t => categoryFilter === "All" || t.category === categoryFilter).length} tenders in evaluation
          </span>
        </div>

        {/* Three category sections */}
        {categories.map(cat => {
          const tenders = filteredByCategory(cat);
          if (tenders.length === 0) return null;
          const cc = CAT_COLORS[cat];
          return (
            <div key={cat} className="overflow-hidden rounded-xl border border-gray-200">
              <div className={`${cc.header} px-4 py-2.5 flex items-center justify-between`}>
                <span className="text-white text-xs font-black uppercase tracking-widest">{cat}</span>
                <span className="text-white/60 text-xs">{tenders.length} tender{tenders.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="bg-white overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Tender Name","Tender Code","Ministry","Closing Date & Time","Stage of Evaluation","% Complete","Action"].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tenders.map(t => (
                      <tr key={t.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer group" onClick={() => setSelectedTender(t)}>
                        <td className="px-3 py-3">
                          <div className="font-medium text-gray-900 text-xs max-w-[220px] truncate" title={t.name}>{t.name}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="font-mono text-[10px] text-gray-400">{t.code}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-gray-500 max-w-[140px] truncate flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-gray-300 flex-shrink-0" />{t.ministry}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="text-xs text-gray-600 whitespace-nowrap">
                            {t.closingDate.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {t.closingDate.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STAGE_COLOR[t.evaluationStage] ?? "bg-gray-100 text-gray-600"}`}>
                            {t.evaluationStage}
                          </span>
                        </td>
                        <td className="px-3 py-3 min-w-[90px]">
                          <CompletionBar pct={t.completion} />
                        </td>
                        <td className="px-3 py-3">
                          <button onClick={e => { e.stopPropagation(); setSelectedTender(t); }}
                            className="flex items-center gap-1 h-7 px-2.5 bg-[#0f172a] text-white text-[10px] font-bold rounded-lg hover:bg-black/80 whitespace-nowrap">
                            <Eye className="h-3 w-3" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ── DETAIL / PROCESS TOWER VIEW ──────────────────────────────── */
  const currentStageObj = PROCUREMENT_STAGES.find(s => s.id === activeStage) ?? PROCUREMENT_STAGES[4];

  return (
    <div className="flex gap-0 h-full">
      {/* ── Process Tower sidebar ── */}
      <div className="w-52 shrink-0 bg-white border-r border-gray-200 overflow-y-auto rounded-l-xl">
        <div className="px-3 pt-3 pb-2 border-b border-gray-100">
          <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">Process Tower</div>
          <div className="text-[10px] text-gray-500 mt-0.5 font-mono truncate">{selectedTender.code}</div>
        </div>
        <div className="p-2 space-y-0.5">
          {PROCUREMENT_STAGES.map((stage, idx) => (
            <button key={stage.id} onClick={() => setActiveStage(stage.id)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all ${
                activeStage === stage.id
                  ? "bg-[#0f172a] text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}>
              <StageIcon status={stage.status} />
              <span className="text-[9px] font-mono text-gray-300 w-3 shrink-0">{idx + 1}</span>
              <span className="text-[10px] font-medium truncate flex-1">{stage.label}</span>
              {activeStage === stage.id && <ChevronRight className="h-2.5 w-2.5 shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Tender header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] text-gray-400">{selectedTender.code}</span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded text-white ${CAT_COLORS[selectedTender.category].badge}`}>
                {selectedTender.category}
              </span>
            </div>
            <h2 className="text-sm font-black text-gray-900 leading-snug max-w-xl">{selectedTender.name}</h2>
            <div className="text-xs text-gray-500 mt-0.5">{selectedTender.ministry}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setShowAI(v => !v)}
              className={`h-7 px-2.5 text-xs rounded-lg border flex items-center gap-1 transition-colors ${showAI ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-gray-200 text-gray-500"}`}>
              <Bot className="h-3 w-3" /> AI
            </button>
            <button onClick={() => setShowDoc(v => !v)}
              className={`h-7 px-2.5 text-xs rounded-lg border flex items-center gap-1 transition-colors ${showDoc ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-gray-200 text-gray-500"}`}>
              <FileText className="h-3 w-3" /> Doc
            </button>
            <button onClick={() => setSelectedTender(null)}
              className="h-7 px-3 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">
              ← List
            </button>
          </div>
        </div>

        {/* Evaluation stage tabs — shown only when in Bid Evaluation stage */}
        {activeStage === "compliance" && (
          <div className="bg-white border-b border-gray-200 px-4 flex items-center gap-1 overflow-x-auto shrink-0">
            {EVAL_STAGES.map((es, i) => (
              <button key={es} onClick={() => setActiveEvalTab(i)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-bold whitespace-nowrap border-b-2 transition-all ${
                  activeEvalTab === i
                    ? "border-[#0f172a] text-[#0f172a]"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}>
                {i < activeEvalTab && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                {i === activeEvalTab && <Scale className="h-3 w-3" />}
                {i > activeEvalTab && <Circle className="h-3 w-3 text-gray-300" />}
                {es}
              </button>
            ))}
          </div>
        )}

        {/* Form area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Stage header card */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <StageIcon status={currentStageObj.status} />
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                currentStageObj.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                currentStageObj.status === "active"    ? "bg-[#0f172a] text-white" :
                "bg-gray-100 text-gray-500"
              }`}>{currentStageObj.status}</span>
            </div>
            <h3 className="text-base font-black text-gray-900">{currentStageObj.label}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {activeStage === "compliance" ? `Sub-stage: ${EVAL_STAGES[activeEvalTab]}` : ""}
            </p>
          </div>

          {/* Form fields — 2-column grid as per design standard */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
              {currentStageObj.label} — Evaluation Form
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "Tender Name","Reference Code","Ministry","Evaluation Stage",
                "Evaluator Name","Evaluation Date","Remarks","Score / Result"
              ].map(f => (
                <div key={f} className="border border-gray-200 rounded-lg p-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">{f}</label>
                  <input defaultValue={
                    f === "Tender Name" ? selectedTender.name :
                    f === "Reference Code" ? selectedTender.code :
                    f === "Ministry" ? selectedTender.ministry :
                    f === "Evaluation Stage" ? currentStageObj.label : ""
                  } className="w-full text-xs text-gray-800 outline-none bg-transparent" />
                </div>
              ))}
            </div>
          </div>

          {/* Workflow action bar */}
          <WorkflowActionBar
            visibleButtons={["back","saveDraft","approve","authorize","adjudicate","appealApproval"]}
            onBack={() => setSelectedTender(null)}
            showUtilities={true}
          />

          {/* Approval signatures */}
          <ApprovalSignatureBlock
            reviewedBy={{ name:"P. Dube",    position:"Evaluation Officer",        department:"Procurement",   role:"Evaluator",  authority:"Evaluation Officer", dateTime:new Date().toLocaleString() }}
            approvedBy={{ name:"T. Moyo",    position:"Chief Procurement Officer", department:"Procurement",   role:"Approver",   authority:"CPO",                dateTime:new Date().toLocaleString() }}
            createdBy={{ name:selectedTender.createdBy, date:new Date(selectedTender.createdAt).toLocaleDateString(), time:new Date(selectedTender.createdAt).toLocaleTimeString() }}
          />

          {/* Created by — full details at bottom per spec */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <User className="h-4 w-4 text-gray-400" />
            <div className="text-xs text-gray-600">
              <span className="font-semibold">Created by:</span> {selectedTender.createdBy} &nbsp;·&nbsp;
              {new Date(selectedTender.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panels ── */}
      {(showDoc || showAI) && (
        <div className="w-72 shrink-0 flex flex-col gap-3 p-3 bg-gray-50 border-l border-gray-200 overflow-y-auto rounded-r-xl">
          {showDoc && (
            <DocumentViewerPanel
              documents={[{
                id:"1", name:"Evaluation Report", type:"pdf",
                content:`<div style="font-family:Arial,sans-serif;padding:20px">
                  <h2 style="text-align:center;font-size:13px;text-transform:uppercase">BID EVALUATION REPORT</h2>
                  <p><strong>Tender:</strong> ${selectedTender.name}</p>
                  <p><strong>Reference:</strong> ${selectedTender.code}</p>
                  <p><strong>Stage:</strong> ${currentStageObj.label}</p>
                </div>`
              }]}
              defaultVisible={true}
            />
          )}
          {showAI && (
            <AiAgentChatPanel
              agentName="Evaluation Assistant"
              agentRole="Procurement Intelligence"
              context="bid evaluation process"
              suggestedPrompts={["Check compliance status","Compare technical scores","Identify risk factors","Generate evaluation summary"]}
              color="violet"
              defaultVisible={true}
            />
          )}
        </div>
      )}
    </div>
  );
}
