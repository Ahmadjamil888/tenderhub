/**
 * NewTenderModal — Full-page multi-step tender creation form.
 * 7 steps: Ratio Setup → Tender Details → Scope & Specs →
 *          Compliance Checks → Evaluation Design → Committee → Review & Submit
 */
import { useState, useEffect, useRef } from "react";
import {
  X, CheckCircle2, Sparkles, ChevronRight, ChevronLeft,
  FileText, Users, Zap, Shield, BarChart3, DollarSign,
  Plus, Trash2, Save, Download, Printer, AlertTriangle,
  Building2, Calendar, Clock, Tag, Layers, Award,
} from "lucide-react";
import { Badge } from "@/components/AppShell";
import { addItem, pushNotification } from "@/lib/local-store";
import { useAuth } from "@/lib/auth-context";

type Props = { open: boolean; onClose: () => void };

// ── Step definitions ──────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Ratio & Method",   short: "Ratio",      icon: BarChart3    },
  { id: 2, label: "Tender Details",   short: "Details",    icon: FileText     },
  { id: 3, label: "Scope & Specs",    short: "Specs",      icon: Layers       },
  { id: 4, label: "Compliance",       short: "Compliance", icon: Shield       },
  { id: 5, label: "Evaluation Design",short: "Evaluation", icon: Award        },
  { id: 6, label: "Committee",        short: "Committee",  icon: Users        },
  { id: 7, label: "Review & Submit",  short: "Submit",     icon: CheckCircle2 },
];

// ── Reference data ────────────────────────────────────────────────────────
const MINISTRIES_LIST = [
  "Ministry of Finance and Investment Promotion",
  "Ministry of Health and Child Care",
  "Ministry of Primary and Secondary Education",
  "Ministry of Transport and Infrastructural Development",
  "Ministry of Agriculture, Fisheries, Water and Rural Resettlement",
  "Ministry of Mines and Mining Development",
  "Ministry of Energy and Power Development",
  "Ministry of Environment, Climate and Tourism",
  "Ministry of Home Affairs and Cultural Heritage",
  "Ministry of Defence and War Veterans Affairs",
  "Ministry of Justice, Legal and Parliamentary Affairs",
  "Ministry of Foreign Affairs and International Trade",
  "Ministry of Local Government and Public Works",
  "Ministry of Information, Publicity and Broadcasting",
  "Ministry of Women Affairs, Community, Small and Medium Enterprises",
  "Office of the President and Cabinet",
];

const CATEGORIES = [
  "Infrastructure / Civil Works", "Road & Highway Construction", "Building Construction",
  "Water & Sanitation", "Energy & Power", "Health & Pharmaceuticals",
  "Medical Equipment & Supplies", "ICT & Digital Systems", "Software Development",
  "Agriculture & Food Security", "Education & Training", "Transport & Fleet",
  "Security Services", "Consultancy / Professional Services", "Office Supplies & Stationery",
  "Furniture & Equipment", "Catering & Hospitality", "Cleaning & Maintenance",
  "Environmental Services", "Legal Services", "Audit & Accounting", "Other",
];

const PROCUREMENT_TYPES = ["Open Tender", "RFQ", "RFP", "EOI", "Auction", "RFI", "Framework", "Direct"];
const PROCUREMENT_METHODS = ["Open Competitive", "Restricted Competitive", "Direct Procurement", "Framework Agreement", "Emergency Procurement", "Single Source"];
const EVAL_METHODS = [
  { v: "QCBS",  l: "QCBS — Quality and Cost Based Selection" },
  { v: "LRB",   l: "LRB — Lowest Responsive Bidder" },
  { v: "LERB",  l: "LERB — Lowest Evaluated Responsive Bidder" },
  { v: "QBS",   l: "QBS — Quality Based Selection" },
  { v: "Fixed", l: "Fixed Budget Selection" },
  { v: "CQS",   l: "CQS — Consultant Qualification Selection" },
  { v: "SSS",   l: "SSS — Single Source Selection" },
];

// ── Default compliance checklist ──────────────────────────────────────────
const DEFAULT_COMPLIANCE = [
  { id: 1,  type: "Standard", label: "Valid bid bond / tender security submitted",                               check: "" },
  { id: 2,  type: "Standard", label: "Bid submitted before closing deadline",                                    check: "" },
  { id: 3,  type: "Standard", label: "Bid properly signed, sealed and witnessed",                               check: "" },
  { id: 4,  type: "Standard", label: "Correct bid form used (as issued)",                                       check: "" },
  { id: 5,  type: "Standard", label: "All mandatory documents included and complete",                           check: "" },
  { id: 6,  type: "Standard", label: "Valid tax clearance certificate (ZIMRA)",                                  check: "" },
  { id: 7,  type: "Standard", label: "Valid PRAZ registration certificate",                                      check: "" },
  { id: 8,  type: "Standard", label: "Valid company registration documents (ZIMRA / CRSE)",                     check: "" },
  { id: 9,  type: "Standard", label: "Company solvency — not blacklisted",                                      check: "" },
  { id: 10, type: "Standard", label: "Directors criminal records check",                                         check: "" },
  { id: 11, type: "Optional", label: "Company liquidity ratio check",                                           check: "" },
  { id: 12, type: "Optional", label: "Gearing ratio < 40% (Debt to Assets)",                                   check: "" },
  { id: 13, type: "Optional", label: "Shareholders criminal record check",                                      check: "" },
  { id: 14, type: "Optional", label: "Directors court cases — fraud/theft/tax evasion",                        check: "" },
  { id: 15, type: "Optional", label: "Company court cases — fraud/money laundering",                           check: "" },
  { id: 16, type: "Optional", label: "BEE / indigenisation compliance",                                        check: "" },
  { id: 17, type: "Optional", label: "Insurance coverage (professional indemnity)",                            check: "" },
  { id: 18, type: "Optional", label: "Affirmative action compliance",                                          check: "" },
  { id: 19, type: "Optional", label: "Power of attorney (where applicable)",                                   check: "" },
  { id: 20, type: "Optional", label: "Conflict of interest declaration signed",                                 check: "" },
];

// ── Default technical criteria ────────────────────────────────────────────
const DEFAULT_TECH_CRITERIA = [
  { id: "T1",  label: "Technical Skills & Competency",                  wt: 15, max: 15, subs: ["Core technical expertise demonstrated","Relevant professional certifications","Technical capacity of firm"] },
  { id: "T2",  label: "Teams Relevant Technical Experience",            wt: 10, max: 10, subs: ["Similar projects completed","Team qualifications","Years of experience in sector"] },
  { id: "T3",  label: "Academic Qualifications (Masters/Degree+)",      wt: 10, max: 10, subs: ["Lead professional qualification","Team academic credentials","Continuous professional development"] },
  { id: "T4",  label: "More than 3 Years in Industry",                  wt: 5,  max: 5,  subs: ["Company registration date","Proof of 3+ years trading","Industry body membership"] },
  { id: "T5",  label: "Machinery & Equipment",                          wt: 5,  max: 5,  subs: ["Equipment list provided","Ownership / lease proof","Equipment age and condition"] },
  { id: "T6",  label: "Scale of Operations",                            wt: 5,  max: 5,  subs: ["Turnover evidence","Number of permanent staff","Geographic reach"] },
  { id: "T7",  label: "Technical Proposal / Methodology",               wt: 20, max: 20, subs: ["Logical work plan","Risk mitigation approach","Quality assurance plan","Innovation / value-add"] },
  { id: "T8",  label: "Risk Profile",                                   wt: 5,  max: 5,  subs: ["Risk register provided","Mitigation measures detailed","Insurance coverage"] },
  { id: "T9",  label: "More than 10 Completed Past Projects",           wt: 5,  max: 5,  subs: ["Project list with values","Completion certificates","Client testimonials"] },
  { id: "T10", label: "Reference Letters from Past Projects",           wt: 10, max: 10, subs: ["3+ reference letters","References from govt entities","Contact details verifiable"] },
  { id: "T11", label: "More than 3 Large Completed Projects",           wt: 5,  max: 5,  subs: ["Large project definition met","Satisfactory completion","On-time delivery record"] },
  { id: "T12", label: "Directors Competency Online Test",               wt: 5,  max: 5,  subs: ["Test completed and submitted","Pass mark achieved","Valid within 12 months"] },
  { id: "T13", label: "Technical Team Competency Online Test",          wt: 5,  max: 5,  subs: ["All key personnel tested","Team aggregate score","Individual score above threshold"] },
];

// ── Default financial criteria ────────────────────────────────────────────
const DEFAULT_FIN_CRITERIA = [
  { id: "F1", label: "Total Bid Price (Lowest = Full Marks)", wt: 70, max: 70, subs: ["Price arithmetic verified","Unit rates reasonable","Currency risk assessed"] },
  { id: "F2", label: "Financial Capacity & Stability",        wt: 15, max: 15, subs: ["Audited financials 3 years","Positive net worth","Bank reference provided"] },
  { id: "F3", label: "Payment Terms Favourability",           wt: 5,  max: 5,  subs: ["Advance payment terms","Milestone alignment","Retention terms"] },
  { id: "F4", label: "Life-Cycle / Total Cost of Ownership",  wt: 5,  max: 5,  subs: ["Operating cost stated","Maintenance estimate","Disposal cost included"] },
  { id: "F5", label: "Local Content / Indigenisation %",      wt: 5,  max: 5,  subs: ["Local procurement %","Local workforce %","SMME subcontracting %"] },
];

// ── Shared UI helpers ─────────────────────────────────────────────────────
const inp = "w-full h-9 px-3 border border-black/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/40 rounded-none";
const sel = "w-full h-9 px-3 border border-black/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/40 rounded-none";
const lbl = "block text-[10px] font-bold text-black/50 uppercase tracking-wider mb-1";

function SectionHead({ n, title, color = "bg-[#0f172a]" }: { n: string; title: string; color?: string }) {
  return (
    <div className={`${color} text-white px-4 py-2 flex items-center gap-2 mb-3`}>
      <span className="text-[10px] font-black opacity-60">{n}</span>
      <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
    </div>
  );
}

function FieldGroup({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`grid gap-3 ${className}`}>{children}</div>;
}

// ── Main component ────────────────────────────────────────────────────────
export default function NewTenderModal({ open, onClose }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Form state ────────────────────────────────────────────────────────
  const [techWeight, setTechWeight] = useState(70);
  const [passmark, setPassmark]     = useState(70);
  const [minQual, setMinQual]       = useState(60);
  const [evalMethod, setEvalMethod] = useState("QCBS");
  const [scoringScale, setScoringScale]   = useState("100-point scale");
  const [tieBreaker, setTieBreaker]       = useState("Lowest price wins");
  const [evalRounds, setEvalRounds]       = useState("2-envelope (Tech then Fin)");
  const [negotiations, setNegotiations]   = useState("No — fixed bid");
  const finWeight = 100 - techWeight;

  const [f, setF] = useState({
    title: "", ref: "", ministry: "", department: "", division: "",
    programmeCode: "", budgetCode: "", ppaPBCode: "", financialYear: "2026/2027",
    category: "", method: "Open Tender", procurementMethod: "Open Competitive",
    tenderType: "National", supplyType: "Supplies",
    estimatedValue: "", currency: "USD", fundingSource: "",
    advertisementDate: "", closingDate: "", closingTime: "10:00",
    openingDate: "", openingTime: "10:00", evaluationDate: "",
    awardDate: "", contractStartDate: "", contractEndDate: "",
    tenderPeriod: "90", deliveryPeriod: "", warrantyPeriod: "",
    venue: "", contactPerson: "", contactEmail: "", contactPhone: "",
    description: "", specs: "", boqAttached: false, torAttached: false,
    drawingsAttached: false, siteVisitRequired: false, siteVisitDate: "",
    briefingRequired: false, briefingDate: "", briefingVenue: "",
    location: "", province: "", district: "",
    costBidDocument: "", bidDocumentCurrency: "USD",
    insuranceRequired: false, performanceBondPct: "10",
    retentionPct: "5", mobilisationPct: "15",
    prequalRequired: false, prequalRef: "",
    aiScoring: true, blockchainRecord: true,
  });

  const set = (k: string, v: string | boolean) => setF(p => ({ ...p, [k]: v }));

  // compliance checklist state
  const [compliance, setCompliance] = useState(DEFAULT_COMPLIANCE.map(c => ({ ...c })));
  // tech criteria
  const [techCriteria, setTechCriteria] = useState(DEFAULT_TECH_CRITERIA.map(c => ({ ...c })));
  // fin criteria
  const [finCriteria, setFinCriteria] = useState(DEFAULT_FIN_CRITERIA.map(c => ({ ...c })));
  // required documents
  const [reqDocs, setReqDocs] = useState([
    "Completed bid form","Bid security / tender guarantee","Company profile",
    "Certificate of incorporation","Tax clearance (ZIMRA)","PRAZ registration",
    "Audited financials (3 years)","Bank reference letter","Key personnel CVs",
    "Equipment ownership proof","Similar project references","Subcontracting plan",
    "HSE policy document","Insurance certificates","Local content declaration",
    "Conflict of interest declaration","Directors competency test result",
    "Technical team competency test result",
  ]);
  const [reqDocChecked, setReqDocChecked] = useState<boolean[]>(Array(18).fill(false).map((_, i) => i < 12));
  // committee
  const [committee, setCommittee] = useState([
    { role: "Chairperson",              name: "", designation: "", dept: "", phone: "", email: "", coi: false },
    { role: "Technical Evaluator 1",    name: "", designation: "", dept: "", phone: "", email: "", coi: false },
    { role: "Technical Evaluator 2",    name: "", designation: "", dept: "", phone: "", email: "", coi: false },
    { role: "Financial Evaluator",      name: "", designation: "", dept: "", phone: "", email: "", coi: false },
    { role: "Legal Advisor",            name: "", designation: "", dept: "", phone: "", email: "", coi: false },
    { role: "Procurement Officer",      name: "", designation: "", dept: "", phone: "", email: "", coi: false },
  ]);

  const tenderRef = useRef(`ZW-PRA-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`);

  useEffect(() => {
    if (open) {
      setStep(1);
      setSubmitted(false);
      scrollRef.current?.scrollTo(0, 0);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const handleSubmit = () => {
    addItem("tenders", {
      id: tenderRef.current,
      title: f.title || "Untitled Tender",
      entity: f.ministry || "Unknown",
      category: f.category || "General",
      method: f.method,
      value: `${f.currency} ${Number(f.estimatedValue || 0).toLocaleString()}`,
      status: "Draft",
      closing: f.closingDate || "TBD",
      bids: 0,
      createdBy: user?.name ?? "System",
      createdAt: new Date().toISOString(),
    });
    pushNotification(`New tender created: ${f.title}`, "success");
    setSubmitted(true);
  };

  if (!open) return null;

  // ── Success screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 bg-[#EAF1F8] flex flex-col">
        <div className="bg-[#0f172a] text-white px-6 py-3 flex items-center gap-3 flex-shrink-0">
          <Sparkles className="h-5 w-5 text-slate-400" />
          <span className="text-sm font-bold uppercase tracking-wider">Tender Successfully Created — Ai Powered e-Government Procurement & Automated Oversight Intelligence System</span>
          <button onClick={() => { onClose(); setSubmitted(false); }} className="ml-auto h-8 px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded">
            <X className="h-4 w-4 inline mr-1" /> Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
          <div className="bg-white border border-black/10 rounded-2xl shadow-xl w-full max-w-2xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-slate-100 grid place-items-center flex-shrink-0">
                <CheckCircle2 className="h-8 w-8 text-[#0F172A]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-black">Tender Created Successfully</h2>
                <p className="text-sm text-black/50 mt-0.5">Submitted for approval workflow — routing to Legal → Finance → Procurement Manager</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                ["Reference", tenderRef.current], ["Title", f.title || "New Tender"],
                ["Ministry", f.ministry || "—"], ["Category", f.category || "—"],
                ["Method", f.method], ["Value", `${f.currency} ${Number(f.estimatedValue || 0).toLocaleString()}`],
                ["Closing Date", f.closingDate || "TBD"], ["Evaluation Method", evalMethod],
                ["Technical Weight", `${techWeight}%`], ["Financial Weight", `${finWeight}%`],
                ["Pass Mark", `${passmark}%`], ["Status", "Pending Approval"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-2 border-b border-black/5 pb-1.5 text-xs">
                  <span className="text-black/45 font-medium">{k}</span>
                  <span className="font-semibold text-black text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-[#0F172A] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#0F172A]">
                <strong>AI Actions triggered:</strong> Specification compliance check, evaluation framework validation, conflict-of-interest scan, and approval routing initiated. Expected approval: 3–5 business days.
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { onClose(); setSubmitted(false); }} className="flex-1 h-10 bg-[#0f172a] text-white font-semibold text-sm rounded-lg hover:opacity-90">
                Back to Tenders
              </button>
              <button onClick={() => window.print()} className="h-10 px-5 border border-black/20 text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Printer className="h-4 w-4" /> Print
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step content renderers ──────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Gov header */}
      <div className="bg-[#0f172a] text-white px-5 py-4">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          GOVERNMENT OF ZIMBABWE · PUBLIC PROCUREMENT AND DISPOSAL OF PUBLIC ASSETS ACT (PPDPA) 2018
        </div>
        <div className="text-lg font-bold uppercase">Tender Registration — Evaluation Ratio & Method Setup</div>
        <div className="text-xs text-white/50 mt-0.5">Step 1 of 7 · Define the financial vs technical ratio FIRST before designing the rest of the evaluation</div>
      </div>

      <div className="px-1 space-y-5">
        <SectionHead n="1.1" title="Evaluation Method Selection" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Evaluation Method *</label>
            <select value={evalMethod} onChange={e => setEvalMethod(e.target.value)} className={sel}>
              {EVAL_METHODS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
            </select>
            <p className="text-[10px] text-black/40 mt-1">QCBS recommended for most tenders above USD 5M (PPDPA Section 32)</p>
          </div>
          <div>
            <label className={lbl}>Scoring Scale</label>
            <select value={scoringScale} onChange={e => setScoringScale(e.target.value)} className={sel}>
              <option>100-point scale</option><option>10-point scale</option><option>Custom max score</option>
            </select>
          </div>
        </div>

        <SectionHead n="1.2" title="Master Technical vs Financial Ratio" color="bg-[#1e3a5f]" />
        <div className="border-2 border-[#0f172a] bg-white p-5">
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <label className={lbl}>Technical Weight (%) *</label>
              <input type="number" min={0} max={100} value={techWeight}
                onChange={e => setTechWeight(Math.min(100, Math.max(0, Number(e.target.value))))}
                className={`${inp} text-2xl font-black text-center h-14 border-2 border-[#0f172a]`} />
              <p className="text-[10px] text-black/40 mt-1 text-center">Technical component weight</p>
            </div>
            <div>
              <label className={lbl}>Financial Weight (%) — Auto</label>
              <div className={`${inp} text-2xl font-black text-center h-14 border-2 border-slate-200 bg-slate-50 text-[#0F172A] flex items-center justify-center`}>
                {finWeight}%
              </div>
              <p className="text-[10px] text-black/40 mt-1 text-center">Financial component weight (auto)</p>
            </div>
          </div>
          {/* Visual bar */}
          <div className="mb-4">
            <div className="flex h-8 overflow-hidden border border-black/10">
              <div className="bg-[#0f172a] flex items-center justify-center text-white text-xs font-bold transition-all" style={{ width: `${techWeight}%` }}>
                T: {techWeight}%
              </div>
              <div className="bg-[#0F172A] flex items-center justify-center text-white text-xs font-bold transition-all" style={{ width: `${finWeight}%` }}>
                F: {finWeight}%
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={lbl}>Technical Pass Mark (%)</label>
              <input type="number" min={0} max={100} value={passmark} onChange={e => setPassmark(Number(e.target.value))} className={inp} />
            </div>
            <div>
              <label className={lbl}>Min Qualifying Score (%)</label>
              <input type="number" min={0} max={100} value={minQual} onChange={e => setMinQual(Number(e.target.value))} className={inp} />
            </div>
            <div>
              <label className={lbl}>Tie-Breaker Rule</label>
              <select value={tieBreaker} onChange={e => setTieBreaker(e.target.value)} className={sel}>
                <option>Lowest price wins</option>
                <option>Higher technical score wins</option>
                <option>Random draw by committee</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Evaluation Rounds</label>
              <select value={evalRounds} onChange={e => setEvalRounds(e.target.value)} className={sel}>
                <option>2-envelope (Tech then Fin)</option>
                <option>1-envelope simultaneous</option>
                <option>3-stage (Admin+Tech+Fin)</option>
              </select>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Negotiations Policy</label>
              <select value={negotiations} onChange={e => setNegotiations(e.target.value)} className={sel}>
                <option>No — fixed bid</option>
                <option>Yes — with top-ranked bidder</option>
                <option>Yes — with top 3 bidders</option>
              </select>
            </div>
            <div>
              <label className={lbl}>AI Auto-Scoring</label>
              <div className="flex items-center gap-3 h-9">
                {[true, false].map(v => (
                  <label key={String(v)} className={`flex items-center gap-2 px-4 py-1.5 border cursor-pointer text-xs font-semibold transition-colors ${f.aiScoring === v ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-black/15 hover:bg-gray-50"}`}>
                    <input type="radio" checked={f.aiScoring === v} onChange={() => set("aiScoring", v)} className="hidden" />
                    {v ? "Enabled" : "Disabled"}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3 flex gap-2">
          <Sparkles className="h-4 w-4 text-[#0F172A] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[#0F172A]">
            <strong>AI Recommendation:</strong> For tenders above USD 5M, a 70/30 Technical/Financial split is recommended under PPDPA. The Technical passmark of 70% means bidders scoring below are automatically disqualified before financial envelopes are opened.
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="bg-[#0f172a] text-white px-5 py-4">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">TENDER REGISTRATION FORM — GOVERNMENT OF ZIMBABWE</div>
        <div className="text-lg font-bold uppercase">Tender Details</div>
        <div className="text-xs text-white/50 mt-0.5">Step 2 of 7 · Full tender identification, entity, dates and financial parameters</div>
      </div>
      <div className="px-1 space-y-5">
        {/* Ref + Title */}
        <SectionHead n="2.1" title="Tender Identification" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-1">
            <label className={lbl}>Tender Reference (Auto)</label>
            <div className="h-9 px-3 border-2 border-[#0f172a] bg-[#f9f9f9] flex items-center text-sm font-mono font-bold text-[#0f172a]">
              {tenderRef.current}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={lbl}>Procurement Title *</label>
            <input value={f.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Two Year Supply Framework — Office Furniture" className={`${inp} font-semibold h-9`} />
          </div>
        </div>

        {/* Ministry / Dept / Division */}
        <SectionHead n="2.2" title="Procuring Entity" />
        <FieldGroup className="grid-cols-1 md:grid-cols-3">
          <div>
            <label className={lbl}>Ministry *</label>
            <select value={f.ministry} onChange={e => set("ministry", e.target.value)} className={sel}>
              <option value="">Select ministry…</option>
              {MINISTRIES_LIST.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Department *</label>
            <input value={f.department} onChange={e => set("department", e.target.value)} placeholder="Department name…" className={inp} />
          </div>
          <div>
            <label className={lbl}>Division / Unit</label>
            <input value={f.division} onChange={e => set("division", e.target.value)} placeholder="Division / Unit…" className={inp} />
          </div>
        </FieldGroup>

        {/* Codes */}
        <SectionHead n="2.3" title="Budget & Programme Codes" />
        <FieldGroup className="grid-cols-2 md:grid-cols-4">
          <div>
            <label className={lbl}>Financial Year *</label>
            <select value={f.financialYear} onChange={e => set("financialYear", e.target.value)} className={sel}>
              <option>2026/2027</option><option>2025/2026</option><option>2027/2028</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Budget Code</label>
            <input value={f.budgetCode} onChange={e => set("budgetCode", e.target.value)} placeholder="BC-MOH-2026-0001" className={inp} />
          </div>
          <div>
            <label className={lbl}>Programme Code</label>
            <input value={f.programmeCode} onChange={e => set("programmeCode", e.target.value)} placeholder="PROG-001" className={inp} />
          </div>
          <div>
            <label className={lbl}>PPADB / CPB Code</label>
            <input value={f.ppaPBCode} onChange={e => set("ppaPBCode", e.target.value)} placeholder="PPADB-2026-…" className={inp} />
          </div>
        </FieldGroup>

        {/* Procurement type */}
        <SectionHead n="2.4" title="Procurement Classification" />
        <div className="border-2 border-[#0f172a] bg-white p-4 space-y-4">
          {/* Bid Type — from PDF: Open Bid, Direct Appointment, Unsolicited, RFQ, RFP, EOI, Auction */}
          <div>
            <label className={lbl}>Bid / Procurement Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { v: "Open Tender",       desc: "Open competitive" },
                { v: "RFQ",               desc: "Request for quotation (free)" },
                { v: "RFP",               desc: "Request for proposal" },
                { v: "EOI",               desc: "Expression of interest" },
                { v: "Auction",           desc: "Public auction" },
                { v: "Unsolicited Bid",   desc: "Unsolicited bid" },
                { v: "Direct Appointment",desc: "Direct/single source" },
                { v: "Framework",         desc: "Framework agreement" },
              ].map(t => (
                <label key={t.v} className={`flex flex-col gap-0.5 px-3 py-2 border-2 cursor-pointer text-xs transition-colors
                  ${f.method === t.v ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-black/15 hover:bg-gray-50"}`}>
                  <input type="radio" name="ptype" checked={f.method === t.v} onChange={() => set("method", t.v)} className="hidden" />
                  <span className="font-bold">{t.v}</span>
                  <span className={`text-[10px] ${f.method === t.v ? "text-white/60" : "text-black/40"}`}>{t.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Class: Works / Supplies / Services */}
          <div>
            <label className={lbl}>Class (Select one) *</label>
            <div className="flex gap-3">
              {["Works / Construction", "Supplies / Goods", "Services / Consultancy"].map(cls => (
                <label key={cls} className={`flex items-center gap-2 px-4 py-2 border-2 cursor-pointer text-xs font-semibold transition-colors
                  ${f.supplyType === cls ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-black/15 hover:bg-gray-50"}`}>
                  <input type="radio" name="stype" checked={f.supplyType === cls} onChange={() => set("supplyType", cls)} className="hidden" />
                  {cls}
                </label>
              ))}
            </div>
          </div>

          {/* PPADB Codes */}
          <div>
            <label className={lbl}>PPADB / Registration Codes Required *</label>
            <p className="text-[10px] text-black/50 mb-2">Only bidders possessing these codes can submit bids. Enter comma-separated codes.</p>
            <input value={f.ppaPBCode} onChange={e => set("ppaPBCode", e.target.value)}
              placeholder="e.g. PPADB-CW-001, PPADB-CW-015, PPADB-SV-042"
              className={inp} />
            <div className="mt-2 flex flex-wrap gap-1">
              {["PPADB-CW-001 Civil Works","PPADB-CW-015 Roads","PPADB-SP-010 Pharma","PPADB-SV-001 Consulting","PPADB-SV-020 ICT","PPADB-SU-001 Supplies","PPADB-AU-001 Audit"].map(code => (
                <button key={code} type="button"
                  onClick={() => set("ppaPBCode", f.ppaPBCode ? `${f.ppaPBCode}, ${code.split(" ")[0]}` : code.split(" ")[0])}
                  className="text-[10px] px-2 py-0.5 bg-slate-50 border border-slate-200 text-[#0F172A] hover:bg-slate-100">
                  + {code}
                </button>
              ))}
            </div>
          </div>

          {/* RFQ: note it's free to download */}
          {f.method === "RFQ" && (
            <div className="bg-slate-50 border border-slate-200 p-3 text-xs text-[#0F172A]">
              <strong>RFQ Note:</strong> RFQ documents are free to download. No bid document cost applies. Technical evaluation is not applicable for RFQ — only compliance and financial evaluation.
            </div>
          )}
          {f.method === "Auction" && (
            <div className="bg-slate-50 border border-slate-200 p-3 text-xs text-[#0F172A]">
              <strong>Auction Note:</strong> Technical evaluation is not applicable. Provide a listing of items to be auctioned with descriptions, specifications, pictures, packaging list, and bid start value.
            </div>
          )}
          {f.method === "Unsolicited Bid" && (
            <div className="bg-slate-50 border border-slate-200 p-3 text-xs text-[#0F172A]">
              <strong>Unsolicited Bid:</strong> Complete all registration steps and add technical specifications. Subject to committee approval and compliance with PPDPA unsolicited bid provisions.
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            <div>
              <label className={lbl}>Procurement Method *</label>
              <select value={f.procurementMethod} onChange={e => set("procurementMethod", e.target.value)} className={sel}>
                {PROCUREMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Category *</label>
              <select value={f.category} onChange={e => set("category", e.target.value)} className={sel}>
                <option value="">Select category…</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Tender Scope</label>
              <select value={f.tenderType} onChange={e => set("tenderType", e.target.value)} className={sel}>
                <option>National</option><option>International</option><option>Regional (SADC)</option><option>Local (Province)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial */}
        <SectionHead n="2.5" title="Financial Parameters" />
        <FieldGroup className="grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <label className={lbl}>Estimated Contract Value *</label>
            <div className="flex">
              <select value={f.currency} onChange={e => set("currency", e.target.value)} className={`w-20 ${sel} border-r-0`}>
                <option>USD</option><option>ZWL</option><option>EUR</option><option>GBP</option><option>ZAR</option>
              </select>
              <input type="number" value={f.estimatedValue} onChange={e => set("estimatedValue", e.target.value)} placeholder="0.00" className={`${inp} flex-1`} />
            </div>
          </div>
          <div>
            <label className={lbl}>Funding Source</label>
            <select value={f.fundingSource} onChange={e => set("fundingSource", e.target.value)} className={sel}>
              <option value="">Select…</option>
              <option>Government Treasury</option><option>World Bank</option><option>African Development Bank</option>
              <option>IMF</option><option>Donor Grant</option><option>Bilateral Loan</option><option>Own Revenue</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Bid Document Cost ({f.currency})</label>
            <input value={f.costBidDocument} onChange={e => set("costBidDocument", e.target.value)} placeholder="e.g. 500" className={inp} />
          </div>
        </FieldGroup>
        <FieldGroup className="grid-cols-2 md:grid-cols-3">
          <div>
            <label className={lbl}>Performance Bond (%)</label>
            <input value={f.performanceBondPct} onChange={e => set("performanceBondPct", e.target.value)} placeholder="10" className={inp} />
          </div>
          <div>
            <label className={lbl}>Retention (%)</label>
            <input value={f.retentionPct} onChange={e => set("retentionPct", e.target.value)} placeholder="5" className={inp} />
          </div>
          <div>
            <label className={lbl}>Mobilisation Advance (%)</label>
            <input value={f.mobilisationPct} onChange={e => set("mobilisationPct", e.target.value)} placeholder="15" className={inp} />
          </div>
        </FieldGroup>

        {/* Dates */}
        <SectionHead n="2.6" title="Key Procurement Dates" color="bg-[#1e3a5f]" />
        <FieldGroup className="grid-cols-2 md:grid-cols-4">
          {[
            { k: "advertisementDate", l: "Advertisement Date *" },
            { k: "closingDate",       l: "Bid Closing Date *"   },
            { k: "openingDate",       l: "Bid Opening Date"     },
            { k: "evaluationDate",    l: "Evaluation Date"      },
            { k: "awardDate",         l: "Award Date (Target)"  },
            { k: "contractStartDate", l: "Contract Start Date"  },
            { k: "contractEndDate",   l: "Contract End Date"    },
            { k: "siteVisitDate",     l: "Site Visit Date"      },
          ].map(({ k, l }) => (
            <div key={k}>
              <label className={lbl}>{l}</label>
              <input type="date" value={(f as unknown as Record<string, string>)[k] ?? ""} onChange={e => set(k, e.target.value)} className={inp} />
            </div>
          ))}
        </FieldGroup>
        <FieldGroup className="grid-cols-2 md:grid-cols-3">
          <div>
            <label className={lbl}>Closing Time</label>
            <input type="time" value={f.closingTime} onChange={e => set("closingTime", e.target.value)} className={inp} />
          </div>
          <div>
            <label className={lbl}>Opening Time</label>
            <input type="time" value={f.openingTime} onChange={e => set("openingTime", e.target.value)} className={inp} />
          </div>
          <div>
            <label className={lbl}>Tender Period (days)</label>
            <input value={f.tenderPeriod} onChange={e => set("tenderPeriod", e.target.value)} placeholder="90" className={inp} />
          </div>
          <div>
            <label className={lbl}>Delivery Period</label>
            <input value={f.deliveryPeriod} onChange={e => set("deliveryPeriod", e.target.value)} placeholder="e.g. 120 days ARO" className={inp} />
          </div>
          <div>
            <label className={lbl}>Warranty Period</label>
            <input value={f.warrantyPeriod} onChange={e => set("warrantyPeriod", e.target.value)} placeholder="e.g. 24 months" className={inp} />
          </div>
          <div>
            <label className={lbl}>Pre-Qualification Reference</label>
            <input value={f.prequalRef} onChange={e => set("prequalRef", e.target.value)} placeholder="PQ-2026-…" className={inp} />
          </div>
        </FieldGroup>

        {/* Contact + Location */}
        <SectionHead n="2.7" title="Contact & Location" />
        <FieldGroup className="grid-cols-1 md:grid-cols-3">
          <div>
            <label className={lbl}>Contact Person</label>
            <input value={f.contactPerson} onChange={e => set("contactPerson", e.target.value)} placeholder="Name & designation" className={inp} />
          </div>
          <div>
            <label className={lbl}>Contact Email</label>
            <input type="email" value={f.contactEmail} onChange={e => set("contactEmail", e.target.value)} placeholder="procurement@ministry.gov.zw" className={inp} />
          </div>
          <div>
            <label className={lbl}>Contact Phone</label>
            <input value={f.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="+263 242 …" className={inp} />
          </div>
          <div>
            <label className={lbl}>Bid Opening Venue</label>
            <input value={f.venue} onChange={e => set("venue", e.target.value)} placeholder="e.g. Room 4B, Mukwati Building" className={inp} />
          </div>
          <div>
            <label className={lbl}>Province</label>
            <select value={f.province} onChange={e => set("province", e.target.value)} className={sel}>
              <option value="">Select…</option>
              {["Harare","Bulawayo","Manicaland","Mashonaland Central","Mashonaland East","Mashonaland West","Masvingo","Matabeleland North","Matabeleland South","Midlands"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>District / Location</label>
            <input value={f.location} onChange={e => set("location", e.target.value)} placeholder="District / physical location" className={inp} />
          </div>
        </FieldGroup>

        {/* Special conditions */}
        <SectionHead n="2.8" title="Special Conditions & Requirements" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { k: "siteVisitRequired",  l: "Site Visit Required",     d: "siteVisitDate",    dl: "Site Visit Date"  },
            { k: "briefingRequired",   l: "Briefing Session Req.",   d: "briefingDate",     dl: "Briefing Date"    },
            { k: "prequalRequired",    l: "Pre-qualification Req.",  d: null,               dl: ""                 },
            { k: "insuranceRequired",  l: "Insurance Required",      d: null,               dl: ""                 },
            { k: "boqAttached",        l: "BOQ Attached",            d: null,               dl: ""                 },
            { k: "torAttached",        l: "TOR Attached",            d: null,               dl: ""                 },
            { k: "drawingsAttached",   l: "Drawings Attached",       d: null,               dl: ""                 },
            { k: "blockchainRecord",   l: "Blockchain Record",       d: null,               dl: ""                 },
            { k: "aiScoring",          l: "AI Auto-Scoring",         d: null,               dl: ""                 },
          ].map(({ k, l, d, dl }) => (
            <div key={k} className="flex flex-col gap-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!(f as Record<string, unknown>)[k]} onChange={e => set(k, e.target.checked)} className="h-4 w-4 accent-[#0f172a]" />
                <span className="text-xs font-medium text-black/70">{l}</span>
              </label>
              {d && !!(f as Record<string, unknown>)[k] && (
                <input type="date" value={(f as unknown as Record<string, string>)[d] ?? ""} onChange={e => set(d, e.target.value)} className={`${inp} text-xs`} placeholder={dl} />
              )}
            </div>
          ))}
        </div>

        <div>
          <label className={lbl}>Brief Description / Scope Summary</label>
          <textarea value={f.description} onChange={e => set("description", e.target.value)} rows={3}
            placeholder="Briefly describe the procurement need, objective and expected deliverables…"
            className="w-full px-3 py-2 border border-black/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/40 rounded-none resize-none" />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="bg-[#0f172a] text-white px-5 py-4">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">SCOPE, SPECIFICATIONS & DOCUMENTS</div>
        <div className="text-lg font-bold uppercase">Scope of Work, Technical Specifications & Attachments</div>
        <div className="text-xs text-white/50 mt-0.5">Step 3 of 7 · Full scope, BOQ, TOR, drawings and required bidder documents</div>
      </div>
      <div className="px-1 space-y-5">
        <SectionHead n="3.1" title="Technical Specifications / Scope of Work" />
        <textarea value={f.specs} onChange={e => set("specs", e.target.value)} rows={10}
          placeholder="Paste or describe your technical specifications here. Include: objectives, scope boundaries, deliverables, standards, performance requirements, inspection criteria…"
          className="w-full px-3 py-2 border border-black/15 bg-white text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/40 rounded-none resize-none" />

        <SectionHead n="3.2" title="Required Bidder Documents Checklist" color="bg-[#065f46]" />
        <div className="border border-black/10 bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {reqDocs.map((doc, i) => (
              <label key={i} className="flex items-center gap-2 text-xs text-black/70 cursor-pointer hover:text-black">
                <input type="checkbox" checked={reqDocChecked[i] ?? false}
                  onChange={e => {
                    const n = [...reqDocChecked];
                    while (n.length <= i) n.push(false);
                    n[i] = e.target.checked;
                    setReqDocChecked(n);
                  }}
                  className="h-3.5 w-3.5 accent-[#0f172a]" />
                {doc}
              </label>
            ))}
          </div>
          <button onClick={() => {
            setReqDocs(d => [...d, ""]);
            setReqDocChecked(c => [...c, false]);
          }} className="mt-3 text-xs text-[#0F172A] hover:underline font-semibold flex items-center gap-1">
            <Plus className="h-3 w-3" /> Add required document
          </button>
        </div>

        <SectionHead n="3.3" title="Document Attachments" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Invitation to Tender", "Technical Specifications", "Bill of Quantities (BOQ)", "Terms of Reference (TOR)",
            "Bid Data Sheet", "General Conditions of Contract", "Special Conditions of Contract", "Price Schedule / Form",
            "Bid Bond Template", "Draft Contract", "Site Plans / Drawings", "Environmental Impact Assessment"].map(doc => (
            <label key={doc} className={`flex items-center gap-2 px-3 py-2 border cursor-pointer text-xs font-medium transition-colors border-dashed border-black/20 hover:border-slate-200 hover:bg-slate-50`}>
              <input type="checkbox" className="h-3.5 w-3.5 accent-blue-600" />
              <span>📎 {doc}</span>
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 border border-dashed border-black/20 px-4 py-3 cursor-pointer hover:bg-gray-50 text-xs text-black/50 hover:text-black">
          <Plus className="h-4 w-4" /> Upload additional document (PDF, DOCX, XLSX, DWG)
          <input type="file" multiple accept=".pdf,.docx,.xlsx,.dwg,.zip" className="hidden" />
        </label>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5">
      <div className="bg-[#0f172a] text-white px-5 py-4">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">COMPLIANCE CHECKLIST — STAGE 1</div>
        <div className="text-lg font-bold uppercase">Administrative & Compliance Verification</div>
        <div className="text-xs text-white/50 mt-0.5">Step 4 of 7 · Define mandatory and optional compliance checks for bid evaluation Stage 1 (Pass/Fail)</div>
      </div>
      <div className="px-1 space-y-4">
        <div className="bg-slate-50 border border-slate-200 p-3 flex gap-2">
          <AlertTriangle className="h-4 w-4 text-[#0F172A] flex-shrink-0 mt-0.5" />
          <div className="text-xs text-[#0F172A]">
            <strong>Standards are mandatory</strong> — failure on any Standard item = DISQUALIFIED. Optional items are subject to admin preferences at planning stage. Results are Pass or Disqualified; Disqualified bidders are eliminated before technical evaluation.
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-black/10">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                <th className="px-3 py-2 text-left w-8 text-[10px] font-semibold">No.</th>
                <th className="px-3 py-2 text-left w-24 text-[10px] font-semibold">Type</th>
                <th className="px-3 py-2 text-left text-[10px] font-semibold">Compliance Metric</th>
                <th className="px-3 py-2 text-center w-32 text-[10px] font-semibold">Check Type</th>
                <th className="px-3 py-2 text-center w-16 text-[10px] font-semibold">Remove</th>
              </tr>
            </thead>
            <tbody>
              {compliance.map((c, i) => (
                <tr key={c.id} className={`border-b border-black/6 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                  <td className="px-3 py-2 font-mono text-black/40">{c.id}</td>
                  <td className="px-3 py-2">
                    <select value={c.type} onChange={e => {
                      const n = [...compliance]; n[i] = { ...n[i], type: e.target.value }; setCompliance(n);
                    }} className="w-20 h-7 px-1 border border-black/15 bg-white text-[10px] focus:outline-none">
                      <option>Standard</option><option>Optional</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input value={c.label} onChange={e => {
                      const n = [...compliance]; n[i] = { ...n[i], label: e.target.value }; setCompliance(n);
                    }} className="w-full h-7 px-2 border border-black/10 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20" />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <select className="w-28 h-7 px-1 border border-black/15 bg-white text-[10px] focus:outline-none">
                      <option>Pass / Fail</option><option>Scored (0–10)</option><option>Yes / No</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => setCompliance(c => c.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => setCompliance(c => [...c, { id: c.length + 1, type: "Optional", label: "", check: "" }])}
          className="text-xs text-[#0F172A] hover:underline font-semibold flex items-center gap-1">
          <Plus className="h-3 w-3" /> Add compliance criterion
        </button>
      </div>
    </div>
  );

  const CriterionRow = ({ c, i, set: setFn, label }: { c: { id: string; label: string; wt: number; max: number; subs: string[] }; i: number; set: (fn: (p: typeof techCriteria) => typeof techCriteria) => void; label: string }) => (
    <div className="border border-black/10 bg-white mb-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-black/6">
        <span className="text-[9px] font-bold text-black/40 w-6">{c.id}</span>
        <input value={c.label} onChange={e => setFn(prev => prev.map((x, j) => j === i ? { ...x, label: e.target.value } : x))}
          className="flex-1 h-7 px-2 border border-black/10 text-xs font-medium focus:outline-none bg-white" />
        <div className="flex items-center gap-1 flex-shrink-0">
          <label className="text-[9px] text-black/40">Wt%</label>
          <input type="number" value={c.wt} onChange={e => setFn(prev => prev.map((x, j) => j === i ? { ...x, wt: Number(e.target.value) } : x))}
            className="w-12 h-7 px-1 text-center border border-black/10 text-xs font-bold focus:outline-none" />
          <label className="text-[9px] text-black/40">Max</label>
          <input type="number" value={c.max} onChange={e => setFn(prev => prev.map((x, j) => j === i ? { ...x, max: Number(e.target.value) } : x))}
            className="w-12 h-7 px-1 text-center border border-black/10 text-xs font-bold focus:outline-none" />
          <button onClick={() => setFn(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 ml-1">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="px-3 py-2 grid grid-cols-1 md:grid-cols-2 gap-1">
        {c.subs.map((sc, j) => (
          <div key={j} className="flex items-center gap-1">
            <span className="text-[9px] text-black/30 w-4">{j + 1}.</span>
            <input value={sc} onChange={e => setFn(prev => prev.map((x, xi) => xi === i ? { ...x, subs: x.subs.map((s, si) => si === j ? e.target.value : s) } : x))}
              className="flex-1 h-6 px-2 border border-black/8 text-[10px] focus:outline-none bg-gray-50/80" />
            <button onClick={() => setFn(prev => prev.map((x, xi) => xi === i ? { ...x, subs: x.subs.filter((_, si) => si !== j) } : x))}
              className="text-red-300 hover:text-red-500">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button onClick={() => setFn(prev => prev.map((x, xi) => xi === i ? { ...x, subs: [...x.subs, ""] } : x))}
          className="text-[10px] text-slate-600 hover:underline text-left mt-0.5 col-span-2">+ sub-check</button>
      </div>
    </div>
  );

  const renderStep5 = () => {
    const techTotal = techCriteria.reduce((a, c) => a + c.wt, 0);
    const finTotal  = finCriteria.reduce((a, c) => a + c.wt, 0);
    const isRFQ     = f.method === "RFQ" || f.method === "Auction";
    return (
      <div className="space-y-5">
        <div className="bg-[#0f172a] text-white px-5 py-4">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">EVALUATION DESIGN — 4-PHASE SYSTEM</div>
          <div className="text-lg font-bold uppercase">Evaluation Criteria — {f.method || "Tender"}</div>
          <div className="text-xs text-white/50 mt-0.5">Step 5 of 7 · Phase 1: Compliance → Phase 2: Technical → Phase 3: Financial → Phase 4: Final Score</div>
        </div>
        <div className="px-1 space-y-5">

          {/* 4-Phase overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { n: "1", label: "Compliance Phase", color: "bg-red-600",     desc: "Pass/Fail — non-compliant = disqualified. Cannot proceed to Technical." },
              { n: "2", label: "Technical Phase",   color: isRFQ ? "bg-gray-400" : "bg-[#1e3a5f]", desc: isRFQ ? "Not applicable for RFQ/Auction" : "AI + evaluator marks. Must pass threshold to proceed." },
              { n: "3", label: "Financial Phase",   color: "bg-[#0F172A]", desc: "Cheapest = highest score. System auto-ranks and scores." },
              { n: "4", label: "Final Score",        color: "bg-[#0f172a]",  desc: "System calculates weighted total. Generates recommended winner report." },
            ].map(ph => (
              <div key={ph.n} className={`${ph.color} text-white p-3 rounded-sm`}>
                <div className="text-[9px] font-black opacity-60 uppercase">Phase {ph.n}</div>
                <div className="text-sm font-bold mt-0.5">{ph.label}</div>
                <div className="text-[10px] opacity-70 mt-1 leading-snug">{ph.desc}</div>
              </div>
            ))}
          </div>

          {/* Ratio reminder bar */}
          <div className="flex gap-4 p-3 bg-[#0f172a] text-white">
            <div className="text-center px-4 border-r border-white/10">
              <div className="text-[9px] text-white/40 uppercase">Technical Weight</div>
              <div className="text-2xl font-black text-slate-500">{isRFQ ? "N/A" : `${techWeight}%`}</div>
            </div>
            <div className="text-center px-4 border-r border-white/10">
              <div className="text-[9px] text-white/40 uppercase">Financial Weight</div>
              <div className="text-2xl font-black text-slate-400">{isRFQ ? "100%" : `${finWeight}%`}</div>
            </div>
            <div className="text-center px-4 border-r border-white/10">
              <div className="text-[9px] text-white/40 uppercase">Tech Pass Mark</div>
              <div className="text-2xl font-black text-slate-500">{isRFQ ? "N/A" : `${passmark}%`}</div>
            </div>
            <div className="text-center px-4">
              <div className="text-[9px] text-white/40 uppercase">Method</div>
              <div className="text-lg font-black text-white">{evalMethod}</div>
            </div>
          </div>

          {/* Phase 2 — Technical (3 forms) */}
          {!isRFQ && (
            <>
              <SectionHead n="Phase 2" title="Technical Evaluation — 3 Assessment Forms" color="bg-[#1e3a5f]" />
              <div className="border border-black/10 bg-white p-4 space-y-3">
                <p className="text-xs text-black/60 leading-relaxed">
                  Technical bids are assessed in 3 forms. <strong>AI auto-marks all 3</strong>. Evaluators review and can override with justification.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { n: "2A", title: "System-Generated Forms", icon: "📋", desc: "Bidder completes online forms with technical details. System scores as they fill. Most accurate — preferred over OCR of documents." },
                    { n: "2B", title: "Competence Examination", icon: "📝", desc: "Multiple-choice test. Bidder answers online. System auto-marks at bid close date and scores the bidder." },
                    { n: "2C", title: "Attached Proposals",     icon: "📄", desc: "PDF/Word proposals uploaded by bidder. AI analyses and scores against specifications. Used when above not possible." },
                  ].map(f => (
                    <div key={f.n} className="border border-black/10 p-3 bg-gray-50/60">
                      <div className="text-lg mb-1">{f.icon}</div>
                      <div className="text-xs font-bold text-black">Form {f.n}: {f.title}</div>
                      <div className="text-[11px] text-black/50 mt-1 leading-snug">{f.desc}</div>
                      <label className="flex items-center gap-2 mt-2 text-[10px] text-black/60 cursor-pointer">
                        <input type="checkbox" defaultChecked={f.n !== "2C"} className="h-3.5 w-3.5 accent-[#0f172a]" />
                        Include in this bid
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-[#0F172A] mb-2">Technical Score Report — System Generates:</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      "Score marks for competency test per bidder",
                      "Score marks for technical requirements per bidder",
                      "Score marks for attached proposals per bidder",
                      "Total final technical score per bidder",
                    ].map(r => (
                      <div key={r} className="text-[10px] text-[#0F172A] flex items-start gap-1">
                        <span className="text-slate-400 flex-shrink-0">→</span>{r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Technical scoring matrix */}
              <SectionHead n="5.1" title={`Technical Scoring Matrix (Total: ${techTotal}% — must equal 100%)`} color="bg-[#1e3a5f]" />
              <div className={`text-[10px] font-semibold mb-2 ${techTotal === 100 ? "text-[#0F172A]" : "text-red-600"}`}>
                {techTotal === 100 ? "✓ Technical weights sum to 100%" : `⚠ Technical weights sum to ${techTotal}% — must equal 100%`}
              </div>
              {techCriteria.map((c, i) => (
                <CriterionRow key={c.id} c={c} i={i} set={setTechCriteria as Parameters<typeof CriterionRow>[0]["set"]} label="Technical" />
              ))}
              <button onClick={() => setTechCriteria(p => [...p, { id: `T${p.length + 1}`, label: "New Technical Criterion", wt: 5, max: 5, subs: ["Sub-criterion 1"] }])}
                className="text-xs text-[#0F172A] hover:underline font-semibold flex items-center gap-1">
                <Plus className="h-3 w-3" /> Add technical criterion
              </button>
            </>
          )}

          {/* Phase 3 — Financial */}
          <SectionHead n="Phase 3" title="Financial Evaluation — Auto-Ranking by System" color="bg-[#0F172A]" />
          <div className="border border-black/10 bg-white p-4 space-y-3">
            <p className="text-xs text-black/60 leading-relaxed">
              The system automatically lists all bidders ranked from cheapest to most expensive and scores them accordingly.
              A list of all bidders with scores is shown when the bid opens.
            </p>
            <div className={`text-[10px] font-semibold mb-2 ${finTotal === 100 ? "text-[#0F172A]" : "text-red-600"}`}>
              {finTotal === 100 ? "✓ Financial weights sum to 100%" : `⚠ Financial weights sum to ${finTotal}% — must equal 100%`}
            </div>
            {finCriteria.map((c, i) => (
              <CriterionRow key={c.id} c={c as typeof techCriteria[0]} i={i} set={setFinCriteria as Parameters<typeof CriterionRow>[0]["set"]} label="Financial" />
            ))}
            <button onClick={() => setFinCriteria(p => [...p, { id: `F${p.length + 1}`, label: "New Financial Criterion", wt: 5, max: 5, subs: ["Sub-criterion 1"] }])}
              className="text-xs text-[#0F172A] hover:underline font-semibold flex items-center gap-1">
              <Plus className="h-3 w-3" /> Add financial criterion
            </button>
          </div>

          {/* Phase 4 — Final Score */}
          <SectionHead n="Phase 4" title="Final Score — System Auto-Calculates & Recommends Winner" color="bg-[#0f172a]" />
          <div className="border border-black/10 bg-white p-4 space-y-3">
            <p className="text-xs text-black/60 leading-relaxed">
              The system automatically calculates the final weighted score for all bidders and generates the recommended winner report.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 border border-black/8">
                <div className="text-[10px] font-bold text-black mb-2">Final Score Report includes:</div>
                {[
                  "All bidders with total technical score",
                  "All bidders with total financial score",
                  "Weighted final score per bidder",
                  "Recommended winner (highest score)",
                  "Award letter draft (auto-generated)",
                  "Notification to unsuccessful bidders (auto-generated)",
                ].map(item => (
                  <div key={item} className="text-[11px] text-black/60 flex items-start gap-1.5 py-0.5">
                    <span className="text-slate-600 flex-shrink-0 font-bold">✓</span>{item}
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 p-3 border border-black/8">
                <div className="text-[10px] font-bold text-black mb-2">Cooling-Off & Appeals:</div>
                {[
                  "Evaluator can override AI score with justification report",
                  "Override goes to independent adjudicator for ruling",
                  "If not satisfied → appeal to oversight committee",
                  "Bidder can launch appeal for reported irregularities",
                  "All overrides and appeals recorded in audit trail",
                ].map(item => (
                  <div key={item} className="text-[11px] text-black/60 flex items-start gap-1.5 py-0.5">
                    <span className="text-slate-600 flex-shrink-0 font-bold">!</span>{item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scoring Rules */}
          <SectionHead n="5.3" title="Scoring Rules & Result Parameters" color="bg-[#065f46]" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border border-black/10 bg-white">
            {[
              { l: "Scoring Scale",           v: scoringScale,   fn: setScoringScale,   opts: ["100-point scale","10-point scale","Custom max score"] },
              { l: "Tie-Breaker Rule",         v: tieBreaker,     fn: setTieBreaker,     opts: ["Lowest price wins","Higher technical score wins","Random draw"] },
              { l: "Evaluation Rounds",        v: evalRounds,     fn: setEvalRounds,     opts: ["2-envelope (Tech then Fin)","1-envelope simultaneous","3-stage (Admin+Tech+Fin)"] },
              { l: "Negotiations Allowed",     v: negotiations,   fn: setNegotiations,   opts: ["No — fixed bid","Yes — with top-ranked bidder","Yes — with top 3 bidders"] },
            ].map(f2 => (
              <div key={f2.l}>
                <label className={lbl}>{f2.l}</label>
                <select value={f2.v} onChange={e => f2.fn(e.target.value)} className={sel}>
                  {f2.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className={lbl}>Technical Pass Mark (%)</label>
              <input type="number" value={passmark} onChange={e => setPassmark(Number(e.target.value))} className={inp} />
            </div>
            <div>
              <label className={lbl}>Minimum Qualifying Score (%)</label>
              <input type="number" value={minQual} onChange={e => setMinQual(Number(e.target.value))} className={inp} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep6 = () => (
    <div className="space-y-5">
      <div className="bg-[#0f172a] text-white px-5 py-4">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">EVALUATION COMMITTEE</div>
        <div className="text-lg font-bold uppercase">Committee Composition & Conflict of Interest</div>
        <div className="text-xs text-white/50 mt-0.5">Step 6 of 7 · Assign evaluators. All members must complete COI declarations before evaluation begins.</div>
      </div>
      <div className="px-1 space-y-4">
        <div className="bg-slate-50 border border-slate-200 p-3 text-xs text-[#0F172A]">
          For tenders above USD 1M — minimum 5 committee members required. Chairperson must be a Senior Officer. No evaluator may have a commercial relationship with any bidder.
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-black/10">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                {["Role","Full Name","Designation","Department","Phone","Email","COI Declared"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {committee.map((m, i) => (
                <tr key={i} className={`border-b border-black/6 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                  <td className="px-3 py-2">
                    <div className="text-[10px] font-bold text-[#0f172a]">{m.role}</div>
                  </td>
                  {(["name", "designation", "dept", "phone", "email"] as const).map(k => (
                    <td key={k} className="px-2 py-2">
                      <input value={m[k]} onChange={e => {
                        const n = [...committee]; n[i] = { ...n[i], [k]: e.target.value }; setCommittee(n);
                      }} placeholder={k === "email" ? "email@gov.zw" : k === "phone" ? "+263…" : `${k}…`}
                        className="w-full h-7 px-2 border border-black/10 text-xs focus:outline-none bg-white focus:ring-1 focus:ring-[#0F172A]/20" />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center">
                    <input type="checkbox" checked={m.coi} onChange={e => {
                      const n = [...committee]; n[i] = { ...n[i], coi: e.target.checked }; setCommittee(n);
                    }} className="h-4 w-4 accent-emerald-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => setCommittee(c => [...c, { role: `Member ${c.length + 1}`, name: "", designation: "", dept: "", phone: "", email: "", coi: false }])}
          className="text-xs text-[#0F172A] hover:underline font-semibold flex items-center gap-1">
          <Plus className="h-3 w-3" /> Add committee member
        </button>

        {/* Approval workflow */}
        <SectionHead n="6.2" title="Approval Workflow Chain" color="bg-[#1e3a5f]" />
        <div className="border border-black/10 bg-white overflow-hidden">
          {[
            { step: "Initiated by",   person: user?.name ?? "Current User", action: "submit",    court: "" },
            { step: "Reviewed by",    person: "Procurement Manager",         action: "review / approve / reject / return / escalate", court: "" },
            { step: "Approved by",    person: "Head of Department (HOD)",    action: "approve / reject / return", court: "" },
            { step: "Authorized by",  person: "Accounting Officer / PS",     action: "authorize / reject / return", court: "Magistrate Court" },
            { step: "Adjudicated by", person: "Tender Committee",            action: "adjudicate / approve / reject", court: "High Court" },
            { step: "Appealed by",    person: "Appeals Authority",           action: "final decision",        court: "Appeals Court" },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-black/5 last:border-0">
              <div className="h-6 w-6 rounded-full bg-[#0f172a] text-white text-[10px] font-bold grid place-items-center flex-shrink-0">{i + 1}</div>
              <div className="w-28 text-[10px] font-bold text-black/60 flex-shrink-0">{row.step}:</div>
              <div className="flex-1 text-xs font-medium text-black">{row.person}</div>
              <div className="text-[10px] text-black/40 flex-1">{row.action}</div>
              {row.court && <div className="text-[10px] text-[#0F172A] italic flex-shrink-0">{row.court}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep7 = () => {
    const techTotal = techCriteria.reduce((a, c) => a + c.wt, 0);
    const finTotal  = finCriteria.reduce((a, c) => a + c.wt, 0);
    const coiPct    = Math.round((committee.filter(m => m.coi).length / committee.length) * 100);
    return (
      <div className="space-y-5">
        <div className="bg-[#0f172a] text-white px-5 py-4">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">FINAL REVIEW & SUBMISSION</div>
          <div className="text-lg font-bold uppercase">Review All Sections & Submit Tender for Approval</div>
          <div className="text-xs text-white/50 mt-0.5">Step 7 of 7 · Verify all fields before submitting to the approval workflow</div>
        </div>
        <div className="px-1 space-y-4">
          {/* Summary grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l: "Reference",        v: tenderRef.current,                          color: "bg-[#0f172a] text-white" },
              { l: "Title",            v: f.title || "⚠ Not set",                     color: f.title ? "bg-white" : "bg-red-50 text-red-700" },
              { l: "Ministry",         v: f.ministry || "⚠ Not set",                  color: f.ministry ? "bg-white" : "bg-red-50 text-red-700" },
              { l: "Category",         v: f.category || "⚠ Not set",                  color: f.category ? "bg-white" : "bg-red-50 text-red-700" },
              { l: "Method",           v: f.method,                                    color: "bg-white" },
              { l: "Value",            v: `${f.currency} ${Number(f.estimatedValue || 0).toLocaleString()}`, color: f.estimatedValue ? "bg-white" : "bg-red-50 text-red-700" },
              { l: "Closing Date",     v: f.closingDate || "⚠ Not set",               color: f.closingDate ? "bg-white" : "bg-red-50 text-red-700" },
              { l: "Eval Method",      v: evalMethod,                                  color: "bg-white" },
              { l: "Tech Weight",      v: `${techWeight}%`,                            color: "bg-slate-50 text-[#0F172A]" },
              { l: "Fin Weight",       v: `${finWeight}%`,                             color: "bg-slate-50 text-[#0F172A]" },
              { l: "Pass Mark",        v: `${passmark}%`,                              color: "bg-white" },
              { l: "Compliance Items", v: `${compliance.length} items (${compliance.filter(c => c.type === "Standard").length} standard)`, color: "bg-white" },
              { l: "Tech Criteria",    v: `${techCriteria.length} criteria (Total: ${techTotal}%)`, color: techTotal === 100 ? "bg-slate-50 text-[#0F172A]" : "bg-red-50 text-red-700" },
              { l: "Fin Criteria",     v: `${finCriteria.length} criteria (Total: ${finTotal}%)`,   color: finTotal === 100  ? "bg-slate-50 text-[#0F172A]" : "bg-red-50 text-red-700" },
              { l: "Committee Size",   v: `${committee.length} members`,               color: "bg-white" },
              { l: "COI Declarations", v: `${committee.filter(m => m.coi).length}/${committee.length} (${coiPct}%)`, color: coiPct === 100 ? "bg-slate-50 text-[#0F172A]" : "bg-slate-50 text-[#0F172A]" },
            ].map(({ l, v, color }) => (
              <div key={l} className={`border border-black/8 p-3 ${color}`}>
                <div className="text-[9px] text-current opacity-60 uppercase font-semibold tracking-wider mb-0.5">{l}</div>
                <div className="text-xs font-bold leading-tight">{v}</div>
              </div>
            ))}
          </div>

          {/* AI check */}
          <div className="bg-slate-50 border border-slate-200 p-4 flex gap-3">
            <Sparkles className="h-5 w-5 text-[#0F172A] flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-[#0F172A] mb-1">AI Compliance Check</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-[11px] text-[#0F172A]">
                {[
                  [!!f.title,                           "Tender title set"],
                  [!!f.ministry,                        "Ministry assigned"],
                  [!!f.estimatedValue,                  "Estimated value entered"],
                  [!!f.closingDate,                     "Closing date set"],
                  [techTotal === 100,                   "Technical weights = 100%"],
                  [finTotal === 100,                    "Financial weights = 100%"],
                  [compliance.length >= 5,              "Compliance checklist configured"],
                  [committee.length >= 5,               "Min 5 committee members"],
                  [passmark >= 50,                      "Technical pass mark ≥ 50%"],
                  [techWeight + finWeight === 100,      "Ratio totals 100%"],
                ].map(([ok, msg]) => (
                  <div key={String(msg)} className={`flex items-center gap-1.5 ${ok ? "text-[#0F172A]" : "text-red-600"}`}>
                    {ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                    {String(msg)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Document editor */}
          <SectionHead n="7.1" title="Tender Document Editor — Final Draft Before Submission" />
          <div className="border border-black/10 p-3 bg-white">
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {["Invitation to Tender","Bid Data Sheet","Technical Specs","BOQ","Price Schedule","Draft Contract"].map(tpl => (
                <button key={tpl} className="h-7 px-2 bg-[#0f172a] text-white text-[10px] font-semibold hover:opacity-80">{tpl}</button>
              ))}
            </div>
            <div className="border border-black/10 p-2">
              <div className="flex flex-wrap gap-1 mb-2 border-b border-black/8 pb-1.5">
                {["B","I","U","H1","H2","List","Quote","Table"].map(t => (
                  <button key={t} className="h-6 min-w-6 px-1 border border-black/10 text-[10px] hover:bg-gray-50 font-semibold">{t}</button>
                ))}
              </div>
              <textarea rows={6} className="w-full text-xs text-gray-700 resize-none focus:outline-none placeholder:text-gray-300"
                placeholder="Draft tender document will be auto-populated from the form data. Edit or add content before submission…" />
            </div>
            <div className="flex gap-2 mt-2">
              <button className="h-7 px-3 bg-[#0F172A] text-white text-[10px] font-bold flex items-center gap-1"><Save className="h-3 w-3" /> Save Draft</button>
              <button className="h-7 px-3 bg-gray-100 text-gray-700 text-[10px] font-bold flex items-center gap-1"><Download className="h-3 w-3" /> Export DOCX</button>
              <button className="h-7 px-3 bg-gray-100 text-gray-700 text-[10px] font-bold flex items-center gap-1"><Printer className="h-3 w-3" /> Print Preview</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── Main render — FULL PAGE (not floating modal) ──────────────────────
  const stepContent = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#EAF1F8] overflow-hidden">

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-[#0f172a] text-white px-4 py-2.5 flex items-center gap-3 shadow-lg">
        <div className="h-7 w-7 rounded bg-[#0F172A] flex items-center justify-center flex-shrink-0">
          <FileText className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-widest text-white">Ai Powered e-Government Procurement & Automated Oversight Intelligence System — New Tender Registration</div>
          <div className="text-[10px] text-white/40">Government of Zimbabwe · PPDPA 2018 · {tenderRef.current}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => window.print()} className="h-7 px-3 bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold flex items-center gap-1">
            <Printer className="h-3 w-3" /> Print
          </button>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center bg-red-600/80 hover:bg-red-500 text-white rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Step strip ───────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-black/10 overflow-x-auto">
        <div className="flex px-4 pt-2 pb-0 gap-0">
          {STEPS.map((s, i) => {
            const done   = i + 1 < step;
            const active = i + 1 === step;
            return (
              <button key={s.id} onClick={() => done && setStep(s.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-all flex-shrink-0
                  ${active ? "border-[#0f172a] text-[#0f172a] bg-white" : done ? "border-slate-200 text-[#0F172A] cursor-pointer hover:bg-slate-50" : "border-transparent text-black/35 cursor-not-allowed"}`}>
                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0
                  ${active ? "bg-[#0f172a] text-white" : done ? "bg-[#0F172A] text-white" : "bg-black/8 text-black/35"}`}>
                  {done ? <CheckCircle2 className="h-3 w-3" /> : s.id}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content + right AI panel ─────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Main form scroll area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white min-w-0">
          <div className="max-w-5xl mx-auto px-4 py-5 pb-8">
            {stepContent[step - 1]?.()}
          </div>
        </div>

        {/* Right AI panel */}
        <div className="hidden xl:flex flex-col w-64 flex-shrink-0 bg-[#faf8ff] border-l border-slate-200 overflow-y-auto">
          <div className="px-4 py-3 bg-[#0F172A] text-white flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Assistant</span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-200 animate-pulse ml-auto" />
          </div>
          <div className="p-4 space-y-4">
            {/* Step-specific AI hint */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="text-[10px] font-bold text-[#0F172A] uppercase mb-1">
                {step === 1 && "Ratio Guidance"}
                {step === 2 && "Details Check"}
                {step === 3 && "Specification Help"}
                {step === 4 && "Compliance Advisor"}
                {step === 5 && "Criteria Weights"}
                {step === 6 && "Committee Rules"}
                {step === 7 && "Final Validation"}
              </div>
              <div className="text-[11px] text-[#0F172A] leading-relaxed">
                {step === 1 && "A 70/30 T/F split is standard for most PPDPA tenders. For purely financial procurement (RFQ Supplies), use 0/100. Set passmark ≥ 70%."}
                {step === 2 && "Ensure all starred (*) fields are complete. The tender reference is auto-generated and cannot be changed. Ministry and Category are mandatory for routing."}
                {step === 3 && "Specifications must be neutral — avoid brand names unless justified. Include measurable deliverables. Attach BOQ for works and TOR for consulting."}
                {step === 4 && "All Standard items are mandatory. A bidder failing any Standard item is automatically disqualified. Optionals are configurable by the Procurement Officer."}
                {step === 5 && "Technical weights must sum to exactly 100%. AI will auto-score sub-criteria during evaluation. Evaluators can override AI scores with justification."}
                {step === 6 && "Minimum 5 members for tenders > USD 1M. All must complete COI declarations. No member may be related to, employed by, or have interest in any bidder."}
                {step === 7 && "Check all red indicators before submitting. Incomplete fields will not be accepted. Blockchain record will be created on submission."}
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <div className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-2">Quick Actions</div>
              <div className="space-y-1.5">
                {[
                  { l: "Auto-fill from template", icon: "📋" },
                  { l: "Import from last tender", icon: "📂" },
                  { l: "AI spec generator",       icon: "✨" },
                  { l: "PPDPA threshold check",   icon: "⚖️" },
                  { l: "Preview PDF",             icon: "👁" },
                ].map(a => (
                  <button key={a.l} className="w-full text-left text-[11px] px-3 py-2 rounded-lg bg-slate-100 text-[#0F172A] hover:bg-slate-200 font-medium flex items-center gap-2">
                    <span>{a.icon}</span>{a.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Progress indicator */}
            <div>
              <div className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-2">Completion</div>
              {[
                { l: "Ratio & Method",  done: true },
                { l: "Tender Details",  done: !!f.title && !!f.ministry && !!f.closingDate },
                { l: "Scope & Specs",   done: !!f.specs },
                { l: "Compliance",      done: compliance.length > 0 },
                { l: "Evaluation",      done: techCriteria.length > 0 },
                { l: "Committee",       done: committee.filter(m => m.name).length >= 3 },
                { l: "Review",          done: false },
              ].map((item, i) => (
                <div key={item.l} className="flex items-center gap-2 py-1">
                  <div className={`h-3 w-3 rounded-full flex-shrink-0 ${item.done ? "bg-[#0F172A]" : i + 1 === step ? "bg-[#0F172A]" : "bg-black/10"}`} />
                  <span className={`text-[10px] ${item.done ? "text-[#0F172A] font-semibold" : i + 1 === step ? "text-[#0F172A] font-semibold" : "text-black/35"}`}>{item.l}</span>
                  {item.done && <CheckCircle2 className="h-3 w-3 text-slate-600 ml-auto" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom nav bar ────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-t border-black/10 px-4 py-3 flex items-center gap-2 flex-wrap">
        {/* Left side — created by metadata */}
        <div className="text-[10px] text-black/35 hidden md:flex items-center gap-3">
          <span>Created by: <strong className="text-black/55">{user?.name ?? "—"}</strong></span>
          <span>·</span>
          <span>Initiator: <strong className="text-[#0F172A]">{user?.name ?? "—"}</strong></span>
          <span>·</span>
          <span>Approver: <strong className="text-[#0F172A]">Procurement Manager</strong></span>
          <span>·</span>
          <span>Authorizer: <strong className="text-[#0F172A]">CPO / Director</strong></span>
          <span>·</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex-1" />
        {/* Navigation */}
        <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
          className="h-9 px-4 border border-black/15 text-sm font-medium flex items-center gap-1.5 hover:bg-gray-50 disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <button onClick={onClose} className="h-9 px-4 border border-black/15 text-sm text-black/50 hover:bg-gray-50">
          Cancel
        </button>
        <button onClick={() => window.print()} className="h-9 px-3 border border-black/15 text-xs flex items-center gap-1.5 hover:bg-gray-50">
          <Printer className="h-3.5 w-3.5" /> Print
        </button>
        {step < STEPS.length ? (
          <button onClick={() => setStep(s => Math.min(STEPS.length, s + 1))}
            className="h-9 px-6 bg-[#0f172a] text-white text-sm font-bold flex items-center gap-1.5 hover:opacity-90">
            Next: {STEPS[step]?.short} <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={handleSubmit}
            className="h-9 px-6 bg-[#0F172A] text-white text-sm font-bold flex items-center gap-1.5 hover:opacity-90">
            <Zap className="h-4 w-4" /> Submit Tender for Approval
          </button>
        )}
      </div>
    </div>
  );
}


