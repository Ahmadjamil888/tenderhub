/**
 * TenderEvaluationForms — Full suite of evaluation forms per Zimbabwe PRAZ standards
 * Covers exactly the Excel specification:
 *  1. Compliance Checklist (comp)
 *  2. Technical Bid Evaluation Score Card (tech)
 *  3. Technical Assessment / Marking Sheet (assessment)
 *  4. Financial Evaluation (fin)
 *  5. Individual Bidder Result Slip (score)
 *  6. All-Bidders Result Register (result)
 */
import { useState, useRef } from "react";
import {
  CheckCircle2, XCircle, AlertTriangle, FileText, Download,
  ChevronDown, ChevronUp, Eye, Save, Send, Plus, Trash2,
  Shield, BarChart3, DollarSign, Trophy, ClipboardList, Users,
  Sparkles, Lock, Upload, Printer, RefreshCcw,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";

// ─── Types ────────────────────────────────────────────────────────────────────
type ComplianceItem = {
  no: number;
  standard: "Standard" | "Optional";
  metric: string;
  check: "pass" | "fail" | "na" | "";
  file?: string;
};

type TechCriterion = {
  no: string;
  metric: string;
  maxScore: number;
  actualScore: number;
  questions: string[];
  answers: string[];
  marks: string[];
  file?: string;
};

type Bidder = { name: string; ref: string; technicalScore: number; financialOffer: number };

type WorkflowStep = {
  role: "Initiated by" | "Reviewed by" | "Approved By" | "Authorized by" | "Adjudicated by" | "Appealed by";
  person: string;
  timestamp: string;
  action: "submit" | "approve" | "reject" | "return" | "escalate" | "final";
  court?: string;
};

// ─── Initial data (from Excel spec) ──────────────────────────────────────────
const INIT_COMPLIANCE: ComplianceItem[] = [
  { no: 1,  standard: "Standard", metric: "Company Solvency",                                                          check: "" },
  { no: 2,  standard: "Optional", metric: "Company Liquidity",                                                          check: "" },
  { no: 3,  standard: "Optional", metric: "Company Gearing ratio (Less than 40% debt to Assets Ratio)",                check: "" },
  { no: 4,  standard: "Standard", metric: "Black Listed company",                                                       check: "" },
  { no: 5,  standard: "Standard", metric: "Tax Clearance",                                                              check: "" },
  { no: 6,  standard: "Standard", metric: "Directors Criminal Records",                                                 check: "" },
  { no: 7,  standard: "Optional", metric: "Shareholders criminal records",                                              check: "" },
  { no: 8,  standard: "Optional", metric: "Directors Court cases involving fraud, Theft, Tax evasion, Money laundering",check: "" },
  { no: 9,  standard: "Standard", metric: "Company registration",                                                       check: "" },
  { no: 10, standard: "Optional", metric: "Company Court cases involving fraud, Theft, Tax evasion, Money laundering",  check: "" },
  { no: 11, standard: "Optional", metric: "BEE",                                                                        check: "" },
  { no: 12, standard: "Optional", metric: "NASA",                                                                       check: "" },
  { no: 13, standard: "Optional", metric: "Insurance",                                                                  check: "" },
  { no: 14, standard: "Optional", metric: "Affirmative Action",                                                         check: "" },
];

const INIT_TECH_CRITERIA: TechCriterion[] = [
  { no: "1",   metric: "Technical Skills & Competency",               maxScore: 15, actualScore: 0,  questions: ["","","",""], answers: ["","","",""], marks: ["","","",""] },
  { no: "2",   metric: "Teams Relevant Technical experience",         maxScore: 5,  actualScore: 0,  questions: ["","","",""], answers: ["","","",""], marks: ["","","",""] },
  { no: "2b",  metric: "Teams Academic Qualifications Masters/Degree",maxScore: 15, actualScore: 0,  questions: ["","","",""], answers: ["","","",""], marks: ["","","",""] },
  { no: "3",   metric: "More than 3 Years in Industry",               maxScore: 4,  actualScore: 0,  questions: ["","","",""], answers: ["","","",""], marks: ["","","",""] },
  { no: "4",   metric: "Machinery & Equipment",                       maxScore: 5,  actualScore: 0,  questions: ["","","",""], answers: ["","","",""], marks: ["","","",""] },
  { no: "5a",  metric: "Scale of operations",                         maxScore: 5,  actualScore: 0,  questions: ["","","",""], answers: ["","","",""], marks: ["","","",""] },
  { no: "5b",  metric: "Technical Proposal",                          maxScore: 25, actualScore: 0,  questions: ["","","",""], answers: ["","","",""], marks: ["","","",""] },
  { no: "5c",  metric: "Risk profile",                                maxScore: 5,  actualScore: 0,  questions: ["","","",""], answers: ["","","",""], marks: ["","","",""] },
  { no: "5d",  metric: "More than 10 completed past projects",        maxScore: 3,  actualScore: 0,  questions: ["","","",""], answers: ["","","",""], marks: ["","","",""] },
  { no: "5e",  metric: "Reference letters past projects",             maxScore: 5,  actualScore: 0,  questions: ["","","",""], answers: ["","","",""], marks: ["","","",""] },
  { no: "5f",  metric: "More than 3 completed large projects",        maxScore: 3,  actualScore: 0,  questions: ["","","",""], answers: ["","","",""], marks: ["","","",""] },
  { no: "6a",  metric: "Directors Competency online test — Score pulled from Vendor Registration (Track 1)",   maxScore: 5,  actualScore: 0,  questions: ["","","",""], answers: ["","","",""], marks: ["","","",""] },
  { no: "6b",  metric: "Technical Team Competency online test — Score pulled from Vendor Registration (Track 2)", maxScore: 5, actualScore: 0, questions: ["","","",""], answers: ["","","",""], marks: ["","","",""] },
];

const WORKFLOW_ROLES: WorkflowStep["role"][] = [
  "Initiated by","Reviewed by","Approved By","Authorized by","Adjudicated by","Appealed by",
];
const COURTS: Record<string, string> = {
  "Authorized by": "Magistrate court",
  "Adjudicated by": "High court",
  "Appealed by": "Appeals court",
};

// ─── Shared Header ────────────────────────────────────────────────────────────
function GovHeader({ title, tender, bidder, status }: {
  title: string; tender: string; bidder?: string; status?: string;
}) {
  return (
    <div className="bg-[#0f172a] text-white px-5 py-4 flex-shrink-0" style={{ borderRadius: 0 }}>
      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        GOVERNMENT OF ZIMBABWE · MINISTRY OF FINANCE · DEPARTMENT OF CORPORATE AFFAIRS · 2026-2027 FINANCIAL YEAR
      </div>
      <div className="text-base font-bold mt-1 uppercase">{title}</div>
      {bidder && <div className="text-sm font-semibold text-slate-300 mt-0.5">{bidder}</div>}
      <div className="flex flex-wrap gap-4 mt-2 text-[10px] text-white/65">
        <span>TENDER: {tender}</span>
        {status && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${status === "PASSED" || status === "PASSED MIN THRESHOLD" ? "bg-[#0F172A] text-white" : "bg-red-600 text-white"}`}>
            {status}
          </span>
        )}
      </div>
      <div className="text-[9px] text-white/45 mt-1">OWNER: M. CHANGU — HOD · LOCATION: OFFICE 2 ZEL BUILDING FLOOR 3, HARARE</div>
    </div>
  );
}

// ─── Workflow Footer ───────────────────────────────────────────────────────────
function WorkflowFooter({ steps, onChange }: {
  steps: WorkflowStep[];
  onChange: (idx: number, field: keyof WorkflowStep, val: string) => void;
}) {
  return (
    <div className="flex-shrink-0 border-t border-black/10 bg-[#F8F9FA] px-4 py-3">
      <div className="text-[10px] font-bold text-black/50 uppercase tracking-wider mb-2">Workflow Sign-off Chain</div>
      <div className="space-y-1.5">
        {steps.map((step, i) => (
          <div key={step.role} className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold text-black/65 w-28 flex-shrink-0">{step.role}:</span>
            <input
              value={step.person}
              onChange={e => onChange(i, "person", e.target.value)}
              placeholder="Name / role"
              className="flex-1 min-w-[120px] h-7 px-2 border border-black/15 text-[10px] bg-white focus:outline-none"
              style={{ borderRadius: 0 }}
            />
            <input
              value={step.timestamp}
              onChange={e => onChange(i, "timestamp", e.target.value)}
              placeholder="Date / time"
              className="w-36 h-7 px-2 border border-black/15 text-[10px] bg-white focus:outline-none"
              style={{ borderRadius: 0 }}
            />
            <select
              value={step.action}
              onChange={e => onChange(i, "action", e.target.value)}
              className="h-7 px-2 border border-black/15 text-[10px] bg-white focus:outline-none"
              style={{ borderRadius: 0 }}
            >
              {["submit","approve","reject","return","escalate","final"].map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            {COURTS[step.role] && (
              <span className="text-[10px] text-black/40 italic">{COURTS[step.role]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function initWorkflow(): WorkflowStep[] {
  return WORKFLOW_ROLES.map(role => ({
    role, person: "", timestamp: "", action: "submit",
    court: COURTS[role],
  }));
}

// ─── 1. Compliance Checklist ──────────────────────────────────────────────────
function ComplianceForm({ tender, bidder }: { tender: string; bidder: string }) {
  const [items, setItems] = useState<ComplianceItem[]>(INIT_COMPLIANCE.map(i => ({ ...i })));
  const [wf, setWf] = useState(initWorkflow());
  const [saved, setSaved] = useState(false);

  const allStandards = items.filter(i => i.standard === "Standard");
  const result = allStandards.every(i => i.check === "pass") ? "PASS" : "DISQUALIFIED";

  const setCheck = (no: number, val: ComplianceItem["check"]) =>
    setItems(prev => prev.map(i => i.no === no ? { ...i, check: val } : i));

  const handleSave = () => {
    setSaved(true);
    pushNotification(`Compliance checklist saved for ${bidder}`, "success");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <GovHeader title="Tender Technical Bid Evaluation Compliance" tender={tender} bidder={bidder}
        status={result === "PASS" ? "PASSED" : undefined} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 bg-[#1e40af] text-white text-[10px] font-bold uppercase tracking-wider">
          COMPLIANCE CHECKLIST — Technical Evaluation Stage (Applicable to all and every)
        </div>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[#F0F4F8] border-b border-black/10">
              <th className="px-3 py-2 text-left w-8 font-semibold text-black/60">No.</th>
              <th className="px-3 py-2 text-left w-20 font-semibold text-black/60">Type</th>
              <th className="px-3 py-2 text-left font-semibold text-black/60">Metric</th>
              <th className="px-3 py-2 text-center w-24 font-semibold text-black/60">Check</th>
              <th className="px-3 py-2 text-center w-16 font-semibold text-black/60">Source</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.no} className={`border-b border-black/6 ${item.check === "fail" ? "bg-red-50" : item.check === "pass" ? "bg-slate-50/40" : ""}`}>
                <td className="px-3 py-2 font-mono text-black/50">{item.no}</td>
                <td className="px-3 py-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 ${item.standard === "Standard" ? "bg-black text-white" : "bg-slate-100 text-[#0F172A]"}`}
                    style={{ borderRadius: 0 }}>
                    {item.standard}
                  </span>
                </td>
                <td className="px-3 py-2 text-black/80">{item.metric}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1">
                    {(["pass","fail","na"] as const).map(v => (
                      <button key={v} onClick={() => setCheck(item.no, v)}
                        className={`h-6 w-12 text-[9px] font-bold border transition-colors
                          ${item.check === v
                            ? v === "pass" ? "bg-[#0F172A] text-white border-slate-200"
                            : v === "fail" ? "bg-red-600 text-white border-red-600"
                            : "bg-gray-500 text-white border-gray-500"
                            : "bg-white text-black/40 border-black/20 hover:bg-gray-50"
                          }`}
                        style={{ borderRadius: 0 }}>
                        {v.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 text-center">
                  <button className="text-[10px] text-[#0F172A] underline hover:text-[#0F172A]">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Result banner */}
        <div className={`mx-4 my-3 px-4 py-3 border-2 text-sm font-bold flex items-center gap-3 ${result === "PASS" ? "border-slate-200 bg-slate-50 text-[#0F172A]" : "border-red-600 bg-red-50 text-red-800"}`}
          style={{ borderRadius: 0 }}>
          {result === "PASS" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          RESULT: {result}
          <span className="text-xs font-normal ml-2">{result === "PASS" ? "→ PROCEED TO NEXT STAGE" : "→ DISQUALIFIED"}</span>
        </div>
        <div className="px-4 pb-2 text-[9px] text-black/40 italic">Standards are mandatory. Optionals are subject to admin preferences.</div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 bg-white border-t border-black/10 px-4 py-2 flex items-center gap-2">
        <button onClick={handleSave} className="h-8 px-4 bg-[#0f172a] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1e293b]" style={{ borderRadius: 0 }}>
          {saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? "Saved" : "Save"}
        </button>
        <button onClick={() => pushNotification("Compliance form exported", "info")}
          className="h-8 px-3 border border-black/20 text-xs flex items-center gap-1.5 hover:bg-gray-50" style={{ borderRadius: 0 }}>
          <Download className="h-3.5 w-3.5" /> Export PDF
        </button>
        <button onClick={() => pushNotification("Form printed", "info")}
          className="h-8 px-3 border border-black/20 text-xs flex items-center gap-1.5 hover:bg-gray-50" style={{ borderRadius: 0 }}>
          <Printer className="h-3.5 w-3.5" /> Print
        </button>
      </div>
      <WorkflowFooter steps={wf} onChange={(i, f, v) => setWf(prev => prev.map((s, idx) => idx === i ? { ...s, [f]: v } : s))} />
    </div>
  );
}

// ─── 2. Technical Score Card (Simple) ─────────────────────────────────────────
function TechScoreCard({ tender, bidder }: { tender: string; bidder: string }) {
  const [criteria, setCriteria] = useState<TechCriterion[]>(INIT_TECH_CRITERIA.map(c => ({ ...c })));
  const [wf, setWf] = useState(initWorkflow());
  const totalMax = criteria.reduce((a, c) => a + c.maxScore, 0);
  const totalActual = criteria.reduce((a, c) => a + c.actualScore, 0);
  const pct = totalMax > 0 ? ((totalActual / totalMax) * 100).toFixed(1) : "0.0";
  const passed = parseFloat(pct) >= 70;

  const setScore = (no: string, val: number) =>
    setCriteria(prev => prev.map(c => c.no === no ? { ...c, actualScore: Math.min(c.maxScore, Math.max(0, val)) } : c));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <GovHeader title="Tender Technical Bid Evaluation Score Card" tender={tender} bidder={bidder}
        status={passed ? "PASSED MIN THRESHOLD" : undefined} />

      {/* Competency lifecycle note */}
      <div className="flex-shrink-0 bg-slate-50 border-b border-[#7c3aed]/20 px-4 py-2 flex items-start gap-2">
        <div className="flex-1 text-[9px] text-black/60 leading-relaxed">
          <span className="font-bold text-[#7c3aed]">Criteria 6a (Track 1 · Director)</span> and{" "}
          <span className="font-bold text-[#0369a1]">6b (Track 2 · Technical)</span> are auto-populated from
          competency scores stored against the bidder's registered resource profiles during vendor onboarding.
          These scores are not entered manually — they originate from the{" "}
          <span className="font-semibold text-black/70">Vendor Registration Step 5 (Resource Profiling)</span>{" "}
          and are verified in the Competency Assessment Workbench before any tender is submitted.
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Score summary */}
        <div className="flex items-center gap-4 px-4 py-2 bg-[#0a1628] text-white flex-wrap">
          <div><div className="text-[9px] text-white/55">Total Score</div>
            <div className={`text-lg font-black font-mono ${passed ? "text-slate-500" : "text-red-400"}`}>{totalActual}/{totalMax}</div></div>
          <div><div className="text-[9px] text-white/55">Percentage</div>
            <div className={`text-lg font-black font-mono ${passed ? "text-slate-500" : "text-red-400"}`}>{pct}%</div></div>
          <div className="flex-1 mx-2">
            <div className="bg-white/10 h-2">
              <div className={`h-full transition-all ${passed ? "bg-slate-400" : "bg-red-400"}`} style={{ width: `${Math.min(100, parseFloat(pct))}%` }} />
            </div>
            <div className="text-[8px] text-white/40 mt-0.5">Pass threshold: 70%</div>
          </div>
          <div className={`px-3 py-1.5 text-xs font-bold ${passed ? "bg-[#0F172A] text-white" : "bg-red-700 text-white"}`} style={{ borderRadius: 0 }}>
            {passed ? "PASS" : "FAIL"}
          </div>
        </div>

        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[#F0F4F8] border-b border-black/10">
              <th className="px-3 py-2 text-left w-8 font-semibold text-black/60">No.</th>
              <th className="px-3 py-2 text-left font-semibold text-black/60">Metric</th>
              <th className="px-3 py-2 text-center w-24 font-semibold text-black/60">Max Score</th>
              <th className="px-3 py-2 text-center w-28 font-semibold text-black/60">Actual Score</th>
              <th className="px-3 py-2 text-center w-16 font-semibold text-black/60">Source</th>
            </tr>
          </thead>
          <tbody>
            {criteria.map(c => {
              const p = c.maxScore > 0 ? (c.actualScore / c.maxScore) * 100 : 0;
              const isCompetency6a = c.no === "6a";
              const isCompetency6b = c.no === "6b";
              const isCompetency = isCompetency6a || isCompetency6b;
              return (
                <tr key={c.no} className={`border-b border-black/6 hover:bg-gray-50 ${isCompetency ? (isCompetency6a ? "bg-[#faf5ff]" : "bg-[#f0f9ff]") : ""}`}>
                  <td className="px-3 py-2 font-mono text-black/50">
                    {c.no}
                    {isCompetency && (
                      <div className={`text-[7px] font-black uppercase tracking-widest mt-0.5 ${isCompetency6a ? "text-[#7c3aed]" : "text-[#0369a1]"}`}>
                        {isCompetency6a ? "Track 1" : "Track 2"}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium text-black">
                    {c.metric}
                    {isCompetency && (
                      <div className={`mt-1 text-[8px] font-semibold flex items-center gap-1 ${isCompetency6a ? "text-[#7c3aed]" : "text-[#0369a1]"}`}>
                        <span>↑ Auto-populated from vendor resource profiles (stored at registration)</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center font-bold text-black">{c.maxScore}%</td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <input type="number" min={0} max={c.maxScore} value={c.actualScore}
                        onChange={e => setScore(c.no, Number(e.target.value))}
                        className={`w-16 h-7 text-center text-sm font-bold border focus:outline-none
                          ${p >= 80 ? "border-slate-200 bg-slate-50 text-[#0F172A]"
                            : p >= 50 ? "border-slate-200 bg-slate-50 text-[#0F172A]"
                            : "border-red-300 bg-red-50 text-red-700"}`}
                        style={{ borderRadius: 0 }} />
                      <span className="text-[10px] text-black/40">%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {isCompetency
                      ? <span className={`text-[8px] font-bold px-1.5 py-0.5 ${isCompetency6a ? "bg-[#f5f3ff] text-[#7c3aed]" : "bg-[#e0f2fe] text-[#0369a1]"}`} style={{ borderRadius: 0 }}>
                          {isCompetency6a ? "← Vendor Reg." : "← Vendor Reg."}
                        </span>
                      : <button className="text-[10px] text-[#0F172A] underline">View</button>
                    }
                  </td>
                </tr>
              );
            })}
            <tr className="bg-[#0f172a] text-white font-bold">
              <td colSpan={2} className="px-3 py-2 text-xs">TOTAL SCORE (Manual score metrics settings)</td>
              <td className="px-3 py-2 text-center text-xs">{totalMax}%</td>
              <td className="px-3 py-2 text-center text-xs">{totalActual}%</td>
              <td className="px-3 py-2 text-center"><button className="text-[10px] text-slate-400 underline">View</button></td>
            </tr>
          </tbody>
        </table>
        <div className="px-4 py-2 text-[9px] text-black/40 italic">Score mark allocation subject to discretion of the admin at tender planning stage.</div>
      </div>
      <div className="flex-shrink-0 bg-white border-t border-black/10 px-4 py-2 flex gap-2">
        <button onClick={() => pushNotification("Technical scorecard saved", "success")} className="h-8 px-4 bg-[#0f172a] text-white text-xs font-semibold flex items-center gap-1.5" style={{ borderRadius: 0 }}>
          <Save className="h-3.5 w-3.5" /> Save
        </button>
        <button className="h-8 px-3 border border-black/20 text-xs flex items-center gap-1.5" style={{ borderRadius: 0 }}>
          <Download className="h-3.5 w-3.5" /> Export PDF
        </button>
      </div>
      <WorkflowFooter steps={wf} onChange={(i, f, v) => setWf(prev => prev.map((s, idx) => idx === i ? { ...s, [f]: v } : s))} />
    </div>
  );
}

// ─── 3. Technical Assessment / Marking Sheet ─────────────────────────────────
function TechAssessmentForm({ tender, bidder }: { tender: string; bidder: string }) {
  const [criteria, setCriteria] = useState<TechCriterion[]>(INIT_TECH_CRITERIA.map(c => ({ ...c })));
  const [wf, setWf] = useState(initWorkflow());

  const totalMax = criteria.reduce((a, c) => a + c.maxScore, 0);
  const totalActual = criteria.reduce((a, c) => a + c.actualScore, 0);
  const pct = totalMax > 0 ? ((totalActual / totalMax) * 100).toFixed(1) : "0.0";

  const updateQuestion = (no: string, qi: number, val: string) =>
    setCriteria(prev => prev.map(c => c.no === no ? { ...c, questions: c.questions.map((q, i) => i === qi ? val : q) } : c));
  const updateAnswer = (no: string, qi: number, val: string) =>
    setCriteria(prev => prev.map(c => c.no === no ? { ...c, answers: c.answers.map((a, i) => i === qi ? val : a) } : c));
  const updateMark = (no: string, qi: number, val: string) =>
    setCriteria(prev => prev.map(c => c.no === no ? { ...c, marks: c.marks.map((m, i) => i === qi ? val : m) } : c));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <GovHeader title="Tender Technical Bid Evaluation Assessment Form" tender={tender} bidder={bidder}
        status="PASSED MIN THRESHOLD" />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 bg-[#1e40af] text-white text-[10px] font-bold uppercase tracking-wider">
          Technical Evaluation Stage — Marking Sheet (Applicable to tenders, EOI, RFP, Unsolicited Bids)
        </div>

        {/* Total bar */}
        <div className="flex items-center gap-4 px-4 py-2 bg-[#0a1628] text-white">
          <span className="text-[10px] text-white/55">Total:</span>
          <span className="text-sm font-black font-mono text-slate-500">{totalActual}% / {totalMax}%</span>
          <div className="flex-1 bg-white/10 h-1.5">
            <div className="h-full bg-slate-400" style={{ width: `${Math.min(100, (totalActual/Math.max(totalMax,1))*100)}%` }} />
          </div>
          <span className="text-[10px] font-bold text-slate-500">{pct}%</span>
        </div>

        {criteria.map(c => (
          <div key={c.no} className="border-b border-black/8">
            {/* Row header */}
            <div className="flex items-center gap-3 px-4 py-2 bg-[#F8F9FA] border-b border-black/6">
              <span className="text-[10px] font-bold text-black/50 w-6">{c.no}</span>
              <span className="text-xs font-semibold text-black flex-1">{c.metric}</span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-black/40">Actual:</span>
                <input type="number" min={0} max={c.maxScore} value={c.actualScore}
                  onChange={e => setCriteria(prev => prev.map(x => x.no === c.no ? { ...x, actualScore: Math.min(x.maxScore, Number(e.target.value)) } : x))}
                  className="w-12 h-6 text-center text-xs font-bold border border-black/20 bg-white focus:outline-none"
                  style={{ borderRadius: 0 }} />
                <span className="text-[9px] text-black/40">/ {c.maxScore}%</span>
                <button className="text-[10px] text-[#0F172A] underline ml-2">View</button>
              </div>
            </div>
            {/* Q&A grid */}
            <div className="grid grid-cols-3 gap-0 text-[9px]">
              <div className="border-r border-black/6 px-3 py-2">
                <div className="font-bold text-black/50 uppercase mb-1">Questions</div>
                {c.questions.map((q, qi) => (
                  <input key={qi} value={q} onChange={e => updateQuestion(c.no, qi, e.target.value)}
                    placeholder={`${qi+1}. Question…`}
                    className="w-full h-6 px-2 mb-1 border border-black/10 bg-white text-[9px] focus:outline-none"
                    style={{ borderRadius: 0 }} />
                ))}
              </div>
              <div className="border-r border-black/6 px-3 py-2">
                <div className="font-bold text-black/50 uppercase mb-1">Bidder Answers</div>
                {c.answers.map((a, qi) => (
                  <input key={qi} value={a} onChange={e => updateAnswer(c.no, qi, e.target.value)}
                    placeholder={`${qi+1}. Answer…`}
                    className="w-full h-6 px-2 mb-1 border border-black/10 bg-white text-[9px] focus:outline-none"
                    style={{ borderRadius: 0 }} />
                ))}
              </div>
              <div className="px-3 py-2">
                <div className="font-bold text-black/50 uppercase mb-1">Marks Awarded</div>
                {c.marks.map((m, qi) => (
                  <input key={qi} value={m} onChange={e => updateMark(c.no, qi, e.target.value)}
                    placeholder={`${qi+1}. Marks…`}
                    className="w-full h-6 px-2 mb-1 border border-black/10 bg-white text-[9px] focus:outline-none"
                    style={{ borderRadius: 0 }} />
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Totals row */}
        <div className="flex items-center gap-4 px-4 py-3 bg-[#0f172a] text-white">
          <span className="text-xs font-bold flex-1">TOTAL SCORE (Manual score metrics settings)</span>
          <span className="text-xs font-bold text-slate-500">{totalActual}%</span>
          <span className="text-xs text-white/55">/ {totalMax}%</span>
          <button className="text-[10px] text-slate-400 underline">View</button>
        </div>
        <div className="px-4 py-2 text-[9px] text-black/40 italic">Score mark allocation subject to discretion of the admin at tender planning stage.</div>
      </div>
      <div className="flex-shrink-0 bg-white border-t border-black/10 px-4 py-2 flex gap-2">
        <button onClick={() => pushNotification("Assessment form saved", "success")} className="h-8 px-4 bg-[#0f172a] text-white text-xs font-semibold flex items-center gap-1.5" style={{ borderRadius: 0 }}>
          <Save className="h-3.5 w-3.5" /> Save
        </button>
        <button className="h-8 px-3 border border-black/20 text-xs flex items-center gap-1.5" style={{ borderRadius: 0 }}>
          <Download className="h-3.5 w-3.5" /> Export PDF
        </button>
      </div>
      <WorkflowFooter steps={wf} onChange={(i, f, v) => setWf(prev => prev.map((s, idx) => idx === i ? { ...s, [f]: v } : s))} />
    </div>
  );
}

// ─── 4. Financial Evaluation ───────────────────────────────────────────────────
function FinancialEvalForm({ tender }: { tender: string }) {
  const [bidders, setBidders] = useState<Bidder[]>([
    { name: "CLEMENT PTY LTD",  ref: "VEN-001", technicalScore: 80, financialOffer: 4000 },
    { name: "SEASONS PTY LTD",  ref: "VEN-002", technicalScore: 70, financialOffer: 7000 },
    { name: "MATRIX PTY LTD",   ref: "VEN-003", technicalScore: 60, financialOffer: 9000 },
  ]);
  const [wf, setWf] = useState(initWorkflow());

  const minOffer = Math.min(...bidders.map(b => b.financialOffer));
  const withScores = bidders.map(b => ({
    ...b,
    financialScore: minOffer > 0 ? Math.round((minOffer / b.financialOffer) * 100) : 0,
    isLowest: b.financialOffer === minOffer,
  }));

  const addBidder = () => setBidders(prev => [...prev, { name: "", ref: "", technicalScore: 0, financialOffer: 0 }]);
  const setField = (idx: number, field: keyof Bidder, val: string | number) =>
    setBidders(prev => prev.map((b, i) => i === idx ? { ...b, [field]: val } : b));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <GovHeader title="Financial Evaluations Score" tender={tender} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 bg-[#0F172A] text-white text-[10px] font-bold">
          FORMULA: LOWEST/CURRENT BID % — A % OF THE LOWEST BID. LOWEST = 100%
        </div>
        <div className="px-4 py-1 text-[9px] text-black/50 bg-slate-50 border-b border-slate-200">
          Financial bids vault opens on bid opening date and this result is emailed / displayed at the bidders portal instantly
        </div>

        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[#F0F4F8] border-b border-black/10">
              <th className="px-3 py-2 text-left w-8 font-semibold text-black/60">No.</th>
              <th className="px-3 py-2 text-left font-semibold text-black/60">Bidder</th>
              <th className="px-3 py-2 text-right font-semibold text-black/60">Offer ($)</th>
              <th className="px-3 py-2 text-center font-semibold text-black/60">Score</th>
              <th className="px-3 py-2 text-center font-semibold text-black/60">Comment</th>
              <th className="px-3 py-2 text-center w-16 font-semibold text-black/60">Source</th>
            </tr>
          </thead>
          <tbody>
            {withScores.map((b, i) => (
              <tr key={i} className={`border-b border-black/6 ${b.isLowest ? "bg-slate-50" : ""}`}>
                <td className="px-3 py-2 font-mono text-black/50">{i+1}</td>
                <td className="px-3 py-2">
                  <input value={b.name} onChange={e => setField(i, "name", e.target.value)}
                    className="w-full h-7 px-2 border border-black/10 text-xs bg-white focus:outline-none" style={{ borderRadius: 0 }} />
                </td>
                <td className="px-3 py-2">
                  <input type="number" value={b.financialOffer} onChange={e => setField(i, "financialOffer", Number(e.target.value))}
                    className="w-full h-7 px-2 border border-black/10 text-xs text-right bg-white focus:outline-none font-mono" style={{ borderRadius: 0 }} />
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`text-sm font-black font-mono ${b.isLowest ? "text-[#0F172A]" : "text-[#0F172A]"}`}>{b.financialScore}%</span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 ${b.isLowest ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-600"}`} style={{ borderRadius: 0 }}>
                    {b.isLowest ? "LOWEST" : "OTHERS"}
                  </span>
                </td>
                <td className="px-3 py-2 text-center"><button className="text-[10px] text-[#0F172A] underline">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3">
          <button onClick={addBidder} className="text-xs text-[#0F172A] border border-dashed border-slate-200 px-3 py-1.5 flex items-center gap-1.5 hover:bg-slate-50" style={{ borderRadius: 0 }}>
            <Plus className="h-3.5 w-3.5" /> Add Bidder
          </button>
        </div>
        <div className="mx-4 mb-3 px-3 py-2 bg-[#F0F4F8] border border-black/10 text-[10px] text-black/55 flex gap-4">
          <span>System generated</span>
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> No approvals required — auto-computed</span>
        </div>
      </div>
      <div className="flex-shrink-0 bg-white border-t border-black/10 px-4 py-2 flex gap-2">
        <button onClick={() => pushNotification("Financial evaluation saved", "success")} className="h-8 px-4 bg-[#0f172a] text-white text-xs font-semibold flex items-center gap-1.5" style={{ borderRadius: 0 }}>
          <Save className="h-3.5 w-3.5" /> Save
        </button>
        <button className="h-8 px-3 border border-black/20 text-xs flex items-center gap-1.5" style={{ borderRadius: 0 }}>
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>
      <WorkflowFooter steps={wf} onChange={(i, f, v) => setWf(prev => prev.map((s, idx) => idx === i ? { ...s, [f]: v } : s))} />
    </div>
  );
}

// ─── 5. Bidder Result Slip (Individual) ───────────────────────────────────────
function BidderResultSlip({ tender, bidder }: { tender: string; bidder: string }) {
  const [scores, setScores] = useState({
    technicalScore: 80, technicalRatio: 60,
    financialScore: 100, financialRatio: 40,
  });
  const [wf, setWf] = useState(initWorkflow());

  const techFinal = ((scores.technicalScore / 100) * scores.technicalRatio).toFixed(1);
  const finFinal  = ((scores.financialScore / 100) * scores.financialRatio).toFixed(1);
  const total     = (parseFloat(techFinal) + parseFloat(finFinal)).toFixed(1);
  const result    = parseFloat(total) >= 70 ? "WIN" : "UNSUCCESSFUL";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <GovHeader title="Tender Bid Evaluation Results Slip — Bidders Individual Result Slip" tender={tender} bidder={bidder} />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Score inputs */}
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[#F0F4F8] border-b border-black/10">
              {["No.", "Metric", "Bidder Score", "Score Ratio", "Bidder Final", "Source"].map(h => (
                <th key={h} className="px-3 py-2 text-left font-semibold text-black/60">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { no: 1, metric: "TECHNICAL SCORE", score: "technicalScore" as const, ratio: "technicalRatio" as const },
              { no: 2, metric: "FINANCIAL SCORE", score: "financialScore" as const, ratio: "financialRatio" as const },
            ].map(row => {
              const finalVal = ((scores[row.score] / 100) * scores[row.ratio]).toFixed(1);
              return (
                <tr key={row.no} className="border-b border-black/6">
                  <td className="px-3 py-2 font-mono text-black/50">{row.no}</td>
                  <td className="px-3 py-2 font-semibold text-black">{row.metric}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <input type="number" min={0} max={100} value={scores[row.score]}
                        onChange={e => setScores(s => ({ ...s, [row.score]: Math.min(100, Number(e.target.value)) }))}
                        className="w-16 h-7 text-center border border-black/20 text-xs font-bold bg-white focus:outline-none" style={{ borderRadius: 0 }} />
                      <span className="text-[10px] text-black/40">%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <input type="number" min={0} max={100} value={scores[row.ratio]}
                        onChange={e => setScores(s => ({ ...s, [row.ratio]: Math.min(100, Number(e.target.value)) }))}
                        className="w-16 h-7 text-center border border-black/20 text-xs font-bold bg-white focus:outline-none" style={{ borderRadius: 0 }} />
                      <span className="text-[10px] text-black/40">%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-black text-black">{finalVal}%</td>
                  <td className="px-3 py-2"><button className="text-[10px] text-[#0F172A] underline">View</button></td>
                </tr>
              );
            })}
            <tr className="bg-[#0f172a] text-white font-bold">
              <td colSpan={2} className="px-3 py-2 text-xs">TOTAL SCORE</td>
              <td className="px-3 py-2 text-xs"></td>
              <td className="px-3 py-2 text-center text-xs">100%</td>
              <td className="px-3 py-2 text-xs font-black text-slate-400">{total}%</td>
              <td className="px-3 py-2"><button className="text-[10px] text-slate-400 underline">View</button></td>
            </tr>
          </tbody>
        </table>

        {/* Result banner */}
        <div className={`px-5 py-4 border-2 flex items-center gap-4 ${result === "WIN" ? "border-slate-200 bg-slate-50" : "border-red-600 bg-red-50"}`} style={{ borderRadius: 0 }}>
          {result === "WIN" ? <Trophy className="h-8 w-8 text-[#0F172A]" /> : <XCircle className="h-8 w-8 text-red-600" />}
          <div>
            <div className="text-xs text-black/50">TOTAL BIDDER SCORE — WEIGHTED SCORE</div>
            <div className={`text-2xl font-black font-mono ${result === "WIN" ? "text-[#0F172A]" : "text-red-700"}`}>{total}%</div>
            <div className={`text-lg font-black mt-0.5 ${result === "WIN" ? "text-[#0F172A]" : "text-red-700"}`}>
              {result === "WIN" ? "🏆 WIN" : "UNSUCCESSFUL"}
            </div>
          </div>
          <div className="ml-auto text-[9px] text-black/40 flex items-center gap-1">
            <Lock className="h-3 w-3" /> System generated
          </div>
        </div>
        <div className="text-[9px] text-black/40 italic px-1">No approvals. System generated results.</div>
      </div>
      <div className="flex-shrink-0 bg-white border-t border-black/10 px-4 py-2 flex gap-2">
        <button onClick={() => pushNotification("Result slip exported", "info")} className="h-8 px-4 bg-[#0f172a] text-white text-xs font-semibold flex items-center gap-1.5" style={{ borderRadius: 0 }}>
          <Download className="h-3.5 w-3.5" /> Export Slip
        </button>
      </div>
      <WorkflowFooter steps={wf} onChange={(i, f, v) => setWf(prev => prev.map((s, idx) => idx === i ? { ...s, [f]: v } : s))} />
    </div>
  );
}

// ─── 6. All-Bidders Result Register ───────────────────────────────────────────
function BidderResultRegister({ tender }: { tender: string }) {
  const [bidders, setBidders] = useState([
    { rank: 1, result: "WINNER",       name: "CLEMENT PTY LTD", score: 88 },
    { rank: 2, result: "UNSUCCESSFUL", name: "SEASONS PTY LTD",  score: 70 },
    { rank: 3, result: "UNSUCCESSFUL", name: "MATRIX PTY LTD",   score: 60 },
  ]);
  const [wf, setWf] = useState(initWorkflow());

  const addBidder = () => setBidders(prev => [...prev, { rank: prev.length+1, result: "UNSUCCESSFUL", name: "", score: 0 }]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <GovHeader title="Tender Bid Evaluation Results — Register (All Bidders)" tender={tender} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 bg-[#065f46] text-white text-[10px] font-bold">
          RESULTS EMAILED TO ALL BIDDERS AND THE BIDDERS PORTAL
        </div>
        <div className="px-4 py-1 text-[9px] text-black/50 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <Lock className="h-3 w-3" /> System generated / Blockchain secure / No edit / No tamper / No changes
        </div>

        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-[#F0F4F8] border-b border-black/10">
              <th className="px-3 py-2 text-center w-12 font-semibold text-black/60">Rank</th>
              <th className="px-3 py-2 text-center w-28 font-semibold text-black/60">Result</th>
              <th className="px-3 py-2 text-left font-semibold text-black/60">Bidder</th>
              <th className="px-3 py-2 text-center w-24 font-semibold text-black/60">Score</th>
              <th className="px-3 py-2 text-center w-16 font-semibold text-black/60">Source</th>
            </tr>
          </thead>
          <tbody>
            {bidders.map((b, i) => (
              <tr key={i} className={`border-b border-black/6 ${b.result === "WINNER" ? "bg-slate-50" : ""}`}>
                <td className="px-3 py-2 text-center">
                  <span className={`h-7 w-7 inline-flex items-center justify-center text-xs font-black border ${b.result === "WINNER" ? "bg-slate-400 text-white border-slate-200" : "bg-gray-100 text-gray-600 border-gray-200"}`} style={{ borderRadius: "50%" }}>
                    {b.rank}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`text-[10px] font-bold px-2 py-0.5 ${b.result === "WINNER" ? "bg-[#0F172A] text-white" : "bg-red-100 text-red-700"}`} style={{ borderRadius: 0 }}>
                    {b.result}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <input value={b.name} onChange={e => setBidders(prev => prev.map((x, xi) => xi === i ? { ...x, name: e.target.value } : x))}
                    className="w-full h-7 px-2 border border-black/10 text-xs bg-transparent focus:bg-white focus:outline-none" style={{ borderRadius: 0 }} />
                </td>
                <td className="px-3 py-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <input type="number" min={0} max={100} value={b.score}
                      onChange={e => setBidders(prev => prev.map((x, xi) => xi === i ? { ...x, score: Number(e.target.value) } : x))}
                      className="w-14 h-7 text-center border border-black/20 text-xs font-bold bg-white focus:outline-none" style={{ borderRadius: 0 }} />
                    <span className="text-[10px] text-black/40">%</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-center"><button className="text-[10px] text-[#0F172A] underline">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 flex items-center gap-3">
          <button onClick={addBidder} className="text-xs text-[#0F172A] border border-dashed border-slate-200 px-3 py-1 flex items-center gap-1.5 hover:bg-slate-50" style={{ borderRadius: 0 }}>
            <Plus className="h-3.5 w-3.5" /> Add Bidder
          </button>
          <span className="text-[9px] text-black/40 flex items-center gap-1">
            <Lock className="h-3 w-3" /> Mapped for view only — no edit after lock
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 bg-white border-t border-black/10 px-4 py-2 flex gap-2">
        <button onClick={() => pushNotification("Result register exported & emailed to all bidders", "success")}
          className="h-8 px-4 bg-[#0F172A] text-white text-xs font-semibold flex items-center gap-1.5" style={{ borderRadius: 0 }}>
          <Send className="h-3.5 w-3.5" /> Publish & Email Bidders
        </button>
        <button className="h-8 px-3 border border-black/20 text-xs flex items-center gap-1.5" style={{ borderRadius: 0 }}>
          <Download className="h-3.5 w-3.5" /> Export Register
        </button>
      </div>
      <WorkflowFooter steps={wf} onChange={(i, f, v) => setWf(prev => prev.map((s, idx) => idx === i ? { ...s, [f]: v } : s))} />
    </div>
  );
}

// ─── Main exported container ───────────────────────────────────────────────────
type FormTab = "compliance" | "tech" | "assessment" | "financial" | "score" | "result";

const FORM_TABS: { id: FormTab; label: string; Icon: React.ElementType }[] = [
  { id: "compliance",  label: "Compliance Checklist",    Icon: Shield        },
  { id: "tech",        label: "Technical Score Card",    Icon: ClipboardList },
  { id: "assessment",  label: "Assessment / Marking",    Icon: BarChart3     },
  { id: "financial",   label: "Financial Evaluation",    Icon: DollarSign    },
  { id: "score",       label: "Bidder Result Slip",      Icon: FileText      },
  { id: "result",      label: "Results Register",        Icon: Trophy        },
];

interface TenderEvaluationFormsProps {
  tender?: string;
  bidder?: string;
  /** If true, renders without border/shadow (for embedding inside workbench) */
  embedded?: boolean;
}

export default function TenderEvaluationForms({
  tender = "MCP/DES/2283/26-27-01",
  bidder = "CLEMENT PTY LTD",
  embedded = false,
}: TenderEvaluationFormsProps) {
  const [activeForm, setActiveForm] = useState<FormTab>("compliance");

  return (
    <div className={`flex flex-col h-full min-h-0 ${embedded ? "" : "bg-white border border-black/10 rounded-xl shadow-sm overflow-hidden"}`}>
      {/* Form tab strip */}
      <div className="flex-shrink-0 bg-[#0f172a] overflow-x-auto flex">
        {FORM_TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveForm(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-semibold whitespace-nowrap border-b-2 transition-colors flex-shrink-0
              ${activeForm === id
                ? "border-[#2563eb] text-white bg-[#2563eb]/20"
                : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
              }`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Form content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeForm === "compliance"  && <ComplianceForm    tender={tender} bidder={bidder} />}
        {activeForm === "tech"        && <TechScoreCard     tender={tender} bidder={bidder} />}
        {activeForm === "assessment"  && <TechAssessmentForm tender={tender} bidder={bidder} />}
        {activeForm === "financial"   && <FinancialEvalForm  tender={tender} />}
        {activeForm === "score"       && <BidderResultSlip   tender={tender} bidder={bidder} />}
        {activeForm === "result"      && <BidderResultRegister tender={tender} />}
      </div>
    </div>
  );
}
