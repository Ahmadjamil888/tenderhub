/**
 * InvestigationCases — redesigned per ZEPS Master Build brief (Section 6)
 *
 * List columns: Ministry, Tender Name, Tender Code, Closing Date & Time,
 *               Stage, Type of Investigation, % Completion, View button
 * Detail: Process Tower sidebar + form + WorkflowActionBar + ApprovalSignatureBlock
 *         + DocumentViewerPanel + AiAgentChatPanel
 * Investigation stages: Intake → Preliminary Review → Formal Investigation
 *                       → Findings → Recommendation → Disciplinary/Legal Action
 *                       → Disposal/Close-out
 */
import { useState } from "react";
import { ClosingCountdownTimer } from "./ui/ClosingCountdownTimer";
import { WorkflowActionBar } from "./ui/WorkflowActionBar";
import { ApprovalSignatureBlock } from "./ui/ApprovalSignatureBlock";
import { DocumentViewerPanel } from "./ui/DocumentViewerPanel";
import { AiAgentChatPanel } from "./ui/AiAgentChatPanel";
import {
  Eye, Calendar, Building2, AlertTriangle, Scale, CheckCircle2,
  Clock, Circle, FileText, Gavel, Bot, ChevronRight,
  Shield, User, Search, Download, Filter,
} from "lucide-react";

type Investigation = {
  id: string;
  tenderName: string;
  tenderCode: string;
  ministry: string;
  closingDate: Date;
  stage: string;
  type: string;
  completion: number;
  createdBy: string;
  createdAt: string;
};

const INVESTIGATION_STAGES = [
  { id: "intake",        label: "Intake",                    shortLabel: "Intake"        },
  { id: "prelim",        label: "Preliminary Review",        shortLabel: "Prelim Review" },
  { id: "formal",        label: "Formal Investigation",      shortLabel: "Investigation" },
  { id: "findings",      label: "Findings",                  shortLabel: "Findings"      },
  { id: "recommendation",label: "Recommendation",            shortLabel: "Recommend"     },
  { id: "action",        label: "Disciplinary / Legal Action",shortLabel: "Action"       },
  { id: "disposal",      label: "Disposal / Close-out",      shortLabel: "Closure"       },
];

const TYPE_COLORS: Record<string, string> = {
  "Bid Rigging":          "bg-red-100 text-red-700",
  "Irregularities":       "bg-amber-100 text-amber-700",
  "Conflict of Interest": "bg-orange-100 text-orange-700",
  "Fraud":                "bg-red-100 text-red-800",
  "Collusion":            "bg-purple-100 text-purple-700",
  "Misrepresentation":    "bg-rose-100 text-rose-700",
};

const STAGE_ORDER = INVESTIGATION_STAGES.map(s => s.id);

const MOCK_CASES: Investigation[] = [
  {
    id: "1",
    tenderName: "Supply & Installation of Solar Mini-Grids — 12 Rural Clinics",
    tenderCode: "ZW-PRA-2026-00184",
    ministry: "Ministry of Energy and Power Development",
    closingDate: new Date("2026-08-15T16:00:00"),
    stage: "formal",
    type: "Bid Rigging",
    completion: 45,
    createdBy: "S. Nkosi — Anti-Corruption Officer",
    createdAt: "2026-05-10T09:15:00",
  },
  {
    id: "2",
    tenderName: "Procurement of Antiretroviral Medicines (2-Year Framework)",
    tenderCode: "ZW-PRA-2026-00183",
    ministry: "Ministry of Health and Child Care",
    closingDate: new Date("2026-07-30T16:00:00"),
    stage: "prelim",
    type: "Irregularities",
    completion: 25,
    createdBy: "T. Moyo — Chief Procurement Officer",
    createdAt: "2026-06-01T11:30:00",
  },
  {
    id: "3",
    tenderName: "Rehabilitation of Beitbridge–Harare Highway (Section 4)",
    tenderCode: "ZW-PRA-2026-00181",
    ministry: "Ministry of Transport and Infrastructural Development",
    closingDate: new Date("2026-09-01T16:00:00"),
    stage: "intake",
    type: "Conflict of Interest",
    completion: 10,
    createdBy: "R. Chikwanda — Compliance Officer",
    createdAt: "2026-06-20T14:00:00",
  },
  {
    id: "4",
    tenderName: "ICT Managed Services — Government Datacentre",
    tenderCode: "ZW-PRA-2026-00179",
    ministry: "Ministry of ICT, Postal and Courier Services",
    closingDate: new Date("2026-08-22T16:00:00"),
    stage: "findings",
    type: "Fraud",
    completion: 70,
    createdBy: "P. Dube — Audit Officer",
    createdAt: "2026-04-18T08:00:00",
  },
  {
    id: "5",
    tenderName: "Supply of Fertiliser — Pfumvudza Programme 2026/27",
    tenderCode: "ZW-PRA-2026-00180",
    ministry: "Ministry of Agriculture, Land Reform and Rural Resettlement",
    closingDate: new Date("2026-07-20T16:00:00"),
    stage: "recommendation",
    type: "Collusion",
    completion: 85,
    createdBy: "A. Mpofu — Procurement Officer",
    createdAt: "2026-03-25T10:00:00",
  },
];

function StageIcon({ status }: { status: "completed" | "active" | "pending" }) {
  if (status === "completed") return <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />;
  if (status === "active")    return <Clock className="h-4 w-4 text-amber-600 animate-pulse flex-shrink-0" />;
  return <Circle className="h-4 w-4 text-gray-300 flex-shrink-0" />;
}

function CompletionBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-gray-500 w-7 text-right">{pct}%</span>
    </div>
  );
}

export function InvestigationCases() {
  const [selectedCase, setSelectedCase] = useState<Investigation | null>(null);
  const [activeStage, setActiveStage]   = useState("intake");
  const [search, setSearch]             = useState("");
  const [typeFilter, setTypeFilter]     = useState("All");
  const [showDoc, setShowDoc]           = useState(true);
  const [showAI, setShowAI]             = useState(true);

  const types = ["All", ...Array.from(new Set(MOCK_CASES.map(c => c.type)))];

  const filtered = MOCK_CASES.filter(c => {
    if (typeFilter !== "All" && c.type !== typeFilter) return false;
    if (search && !c.tenderName.toLowerCase().includes(search.toLowerCase()) &&
        !c.tenderCode.toLowerCase().includes(search.toLowerCase()) &&
        !c.ministry.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  /* ── LIST VIEW ────────────────────────────────────────────────────────── */
  if (!selectedCase) {
    return (
      <div className="space-y-4">
        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Cases",        value: MOCK_CASES.length,                                     color: "text-[#0f172a]",  bg: "bg-white"                           },
            { label: "Under Investigation",value: MOCK_CASES.filter(c => c.stage === "formal").length,   color: "text-red-700",    bg: "bg-red-50 border-red-200"           },
            { label: "Findings Stage",     value: MOCK_CASES.filter(c => c.stage === "findings").length, color: "text-amber-700",  bg: "bg-amber-50 border-amber-200"       },
            { label: "Completed",          value: MOCK_CASES.filter(c => c.completion === 100).length,   color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200"   },
          ].map(k => (
            <div key={k.label} className={`${k.bg} border rounded-xl px-4 py-3`}>
              <div className={`text-2xl font-black ${k.color}`}>{k.value}</div>
              <div className="text-[11px] text-gray-500">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mr-1">Type:</span>
            {types.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className={`h-7 px-3 rounded-full text-xs font-semibold border transition-all ${
                  typeFilter === t ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search cases, codes, ministries…"
                className="w-full h-8 pl-8 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a]/10" />
            </div>
            <button className="h-8 px-3 flex items-center gap-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <span className="text-xs text-gray-400 ml-1">{filtered.length} cases</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-[#1a3a5c] px-4 py-2.5">
            <span className="text-white text-xs font-black uppercase tracking-widest">Investigation Cases Register</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0f172a]">
                  {["Ministry","Tender Name","Tender Code","Closing Date","Stage","Type","% Complete","Action"].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-white whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">No investigation cases found</td></tr>
                )}
                {filtered.map(c => {
                  const stageObj = INVESTIGATION_STAGES.find(s => s.id === c.stage);
                  const typeColor = TYPE_COLORS[c.type] ?? "bg-gray-100 text-gray-600";
                  return (
                    <tr key={c.id} className="hover:bg-red-50/30 transition-colors cursor-pointer" onClick={() => { setSelectedCase(c); setActiveStage(c.stage); }}>
                      <td className="px-3 py-2.5">
                        <div className="text-xs text-gray-600 max-w-[140px] truncate flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />{c.ministry}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-gray-900 text-xs max-w-[220px] truncate" title={c.tenderName}>{c.tenderName}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-[10px] text-gray-500">{c.tenderCode}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="text-xs text-gray-600 whitespace-nowrap">{c.closingDate.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>
                        <ClosingCountdownTimer closingDate={c.closingDate} size="sm" showLabel={false} />
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{stageObj?.label ?? c.stage}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${typeColor}`}>
                          <AlertTriangle className="h-2.5 w-2.5" />{c.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 min-w-[100px]">
                        <CompletionBar pct={c.completion} />
                      </td>
                      <td className="px-3 py-2.5">
                        <button onClick={e => { e.stopPropagation(); setSelectedCase(c); setActiveStage(c.stage); }}
                          className="flex items-center gap-1 h-7 px-2.5 bg-[#0f172a] text-white text-[10px] font-bold rounded-lg hover:bg-black/80 whitespace-nowrap">
                          <Eye className="h-3 w-3" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ── DETAIL / PROCESS TOWER VIEW ───────────────────────────────────────── */
  const activeStageIdx = STAGE_ORDER.indexOf(activeStage);

  return (
    <div className="flex gap-0 h-full min-h-[600px]">
      {/* Process Tower sidebar */}
      <div className="w-52 shrink-0 bg-white border-r border-gray-200 overflow-y-auto rounded-l-xl">
        <div className="px-3 pt-3 pb-2 border-b border-gray-100">
          <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">Investigation Tower</div>
          <div className="text-[10px] font-mono text-gray-500 truncate mt-0.5">{selectedCase.tenderCode}</div>
        </div>
        <div className="p-2 space-y-0.5">
          {INVESTIGATION_STAGES.map((stage, idx) => {
            const status = idx < activeStageIdx ? "completed" : idx === activeStageIdx ? "active" : "pending";
            return (
              <button key={stage.id} onClick={() => setActiveStage(stage.id)}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all ${
                  activeStage === stage.id ? "bg-[#0f172a] text-white" : "text-gray-500 hover:bg-gray-50"
                }`}>
                <StageIcon status={status} />
                <span className="text-[10px] font-mono text-gray-300 w-3 shrink-0">{idx + 1}</span>
                <span className="text-[10px] font-medium truncate flex-1">{stage.shortLabel}</span>
                {activeStage === stage.id && <ChevronRight className="h-2.5 w-2.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Case header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-[10px] text-gray-400">{selectedCase.tenderCode}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${TYPE_COLORS[selectedCase.type] ?? "bg-gray-100 text-gray-600"}`}>
                <AlertTriangle className="h-2.5 w-2.5" />{selectedCase.type}
              </span>
            </div>
            <h2 className="text-sm font-black text-gray-900 leading-snug max-w-xl">{selectedCase.tenderName}</h2>
            <div className="text-xs text-gray-500 mt-0.5">{selectedCase.ministry}</div>
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
            <button onClick={() => setSelectedCase(null)}
              className="h-7 px-3 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50">
              ← List
            </button>
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Offence header */}
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <Shield className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-black uppercase text-red-800 tracking-wide">Offence Type: {selectedCase.type}</div>
              <div className="text-xs text-red-700 mt-0.5">Investigation into alleged procurement misconduct in the above-referenced tender. Stage: <strong>{INVESTIGATION_STAGES.find(s => s.id === activeStage)?.label}</strong></div>
            </div>
          </div>

          {/* Stage form */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">
              Stage {activeStageIdx + 1}: {INVESTIGATION_STAGES.find(s => s.id === activeStage)?.label} — Investigation Form
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: "Tender Name",          value: selectedCase.tenderName                             },
                { label: "Tender Code",          value: selectedCase.tenderCode                             },
                { label: "Ministry",             value: selectedCase.ministry                               },
                { label: "Offence / Type",       value: selectedCase.type                                   },
                { label: "Investigation Stage",  value: INVESTIGATION_STAGES.find(s=>s.id===activeStage)?.label ?? "" },
                { label: "Completion",           value: `${selectedCase.completion}%`                       },
                { label: "Investigating Officer",value: "S. Nkosi — Anti-Corruption Officer"                },
                { label: "Date Reported",        value: new Date(selectedCase.createdAt).toLocaleDateString()},
              ].map(f => (
                <div key={f.label} className="border border-gray-200 rounded-lg p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">{f.label}</div>
                  <div className="text-sm text-gray-800">{f.value || "—"}</div>
                </div>
              ))}
              <div className="border border-gray-200 rounded-lg p-3 md:col-span-2">
                <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">Findings / Remarks</div>
                <textarea rows={3} placeholder="Enter investigation findings, evidence notes, or recommendations…"
                  className="w-full text-sm text-gray-800 outline-none bg-transparent resize-none" />
              </div>
            </div>
          </div>

          <WorkflowActionBar
            visibleButtons={["back","saveDraft","approve","authorize","adjudicate","appealApproval"]}
            onBack={() => setSelectedCase(null)}
            showUtilities={true}
          />

          <ApprovalSignatureBlock
            reviewedBy={{ name:"S. Nkosi", position:"Investigation Officer", department:"Anti-Corruption", role:"Investigator", authority:"Investigation Officer", dateTime:new Date().toLocaleString() }}
            approvedBy={{ name:"T. Moyo", position:"Chief Procurement Officer", department:"Procurement", role:"Approver", authority:"CPO", dateTime:new Date().toLocaleString() }}
            authorizedBy={{ name:"R. Chikwanda", position:"Anti-Corruption Director", department:"Anti-Corruption", role:"Authorizer", authority:"AC Director", dateTime:new Date().toLocaleString() }}
            createdBy={{ name: selectedCase.createdBy, date: new Date(selectedCase.createdAt).toLocaleDateString(), time: new Date(selectedCase.createdAt).toLocaleTimeString() }}
          />

          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <User className="h-4 w-4 text-gray-400" />
            <div className="text-xs text-gray-600">
              <span className="font-semibold">Created by:</span> {selectedCase.createdBy} &nbsp;·&nbsp;
              <Calendar className="h-3 w-3 inline mr-0.5 text-gray-400" />
              {new Date(selectedCase.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Right panels */}
      {(showDoc || showAI) && (
        <div className="w-72 shrink-0 flex flex-col gap-3 p-3 bg-gray-50 border-l border-gray-200 overflow-y-auto rounded-r-xl">
          {showDoc && (
            <DocumentViewerPanel
              documents={[{
                id: "1", name: "Investigation Case File", type: "letter",
                content: `<div style="font-family:Arial,sans-serif;padding:20px">
                  <h2 style="text-align:center;font-size:13px;text-transform:uppercase">INVESTIGATION CASE FILE</h2>
                  <p><strong>Case Ref:</strong> ${selectedCase.tenderCode}</p>
                  <p><strong>Offence:</strong> ${selectedCase.type}</p>
                  <p><strong>Ministry:</strong> ${selectedCase.ministry}</p>
                  <p><strong>Stage:</strong> ${INVESTIGATION_STAGES.find(s=>s.id===activeStage)?.label}</p>
                  <p style="margin-top:16px">This file contains all evidence and investigation findings.</p>
                </div>`
              }]}
              defaultVisible={true}
            />
          )}
          {showAI && (
            <AiAgentChatPanel
              agentName="Investigation Intelligence"
              agentRole="Anti-Corruption Analytics"
              context="investigation case analysis"
              suggestedPrompts={["Analyse evidence patterns","Identify related cases","Check prior investigations","Generate investigation report"]}
              color="rose"
              defaultVisible={true}
            />
          )}
        </div>
      )}
    </div>
  );
}
