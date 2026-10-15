/**
 * TechnicalEvaluationModule
 * Full-spec implementation per requirements:
 *  - Document Explorer (PDF viewer simulation, navigation, zoom, thumbnails, search)
 *  - Technical Proposal Evaluation (criteria-level scoring, comments, max-mark validation)
 *  - Score Aggregation (weighted totals, %, pass/fail)
 *  - Technical Evaluation Summary (auto-generated report)
 *  - Audit Trail (immutable log of all evaluator actions)
 */
import { useState, useRef } from "react";
import {
  FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Search,
  CheckCircle2, AlertTriangle, Sparkles, Download, Send, Save,
  RotateCcw, Eye, BookOpen, BarChart3, Lock, Maximize2, Minimize2,
  Shield, ClipboardList, FileSearch, Award, RefreshCcw,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";

// ─── Types ────────────────────────────────────────────────────────────────────
type EvalCriterion = {
  id: string;
  section: string;
  criterion: string;
  requirement: string;
  maxMark: number;
  weight: number;          // percentage weight (0-100)
  passmark: number;        // min marks to pass this criterion
  score: number;
  comment: string;
  justification: string;
  aiSuggested: number | null;
  locked: boolean;
};

type Bidder = {
  id: string;
  name: string;
  ref: string;
  docs: { name: string; pages: number; type: string }[];
};

type AuditEntry = {
  ts: string;
  user: string;
  action: string;
  detail: string;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const BIDDERS: Bidder[] = [
  {
    id: "b1", name: "Zimbabwe Pharma Holdings", ref: "VEN-00481",
    docs: [
      { name: "Technical Proposal — ZPH.pdf",       pages: 42, type: "pdf" },
      { name: "Methodology & Approach — ZPH.pdf",   pages: 18, type: "pdf" },
      { name: "CV — Lead Pharmacist.pdf",            pages:  5, type: "pdf" },
      { name: "ISO 9001 Certificate.pdf",            pages:  2, type: "pdf" },
    ],
  },
  {
    id: "b2", name: "Continental Med Africa", ref: "VEN-00495",
    docs: [
      { name: "Technical Proposal — CMA.pdf",       pages: 38, type: "pdf" },
      { name: "Quality Management Plan.pdf",         pages: 12, type: "pdf" },
      { name: "CV — Project Manager.pdf",            pages:  4, type: "pdf" },
    ],
  },
  {
    id: "b3", name: "Sable Pharma (Pvt) Ltd", ref: "VEN-00502",
    docs: [
      { name: "Technical Proposal — SPL.pdf",       pages: 29, type: "pdf" },
      { name: "Cold Chain Logistics Plan.pdf",       pages:  8, type: "pdf" },
    ],
  },
  {
    id: "b4", name: "Granite Med Supplies", ref: "VEN-00478",
    docs: [
      { name: "Technical Proposal — GMS.pdf",       pages: 22, type: "pdf" },
    ],
  },
];

const INIT_CRITERIA: EvalCriterion[] = [
  { id: "c1", section: "1. Technical Specifications",   criterion: "Product Specification Compliance", requirement: "Products must meet WHO prequalification standards. Bidder must provide certificates of analysis for each item.", maxMark: 25, weight: 25, passmark: 15, score: 0, comment: "", justification: "", aiSuggested: null, locked: false },
  { id: "c2", section: "1. Technical Specifications",   criterion: "Cold Chain & Storage Capacity",    requirement: "Bidder must demonstrate cold chain logistics with temperature monitoring and compliant storage facilities.", maxMark: 15, weight: 15, passmark: 10, score: 0, comment: "", justification: "", aiSuggested: null, locked: false },
  { id: "c3", section: "2. Methodology & Approach",     criterion: "Delivery Methodology",             requirement: "Clear, realistic delivery schedule aligned with MOH district distribution network. Contingency plans required.", maxMark: 20, weight: 20, passmark: 12, score: 0, comment: "", justification: "", aiSuggested: null, locked: false },
  { id: "c4", section: "2. Methodology & Approach",     criterion: "Quality Assurance Plan",           requirement: "ISO 9001 or equivalent quality management plan covering sampling, testing and non-conformance procedures.", maxMark: 15, weight: 15, passmark: 8,  score: 0, comment: "", justification: "", aiSuggested: null, locked: false },
  { id: "c5", section: "3. Key Personnel",              criterion: "Lead Personnel Qualifications",    requirement: "Minimum BSc Pharmacy + 5 years procurement experience. CVs must include certified copies of qualifications.", maxMark: 10, weight: 10, passmark: 6,  score: 0, comment: "", justification: "", aiSuggested: null, locked: false },
  { id: "c6", section: "3. Key Personnel",              criterion: "Team Capacity & Staffing",         requirement: "Sufficient qualified staff to fulfil contract obligations. Org chart and staffing plan required.", maxMark: 5,  weight: 5,  passmark: 3,  score: 0, comment: "", justification: "", aiSuggested: null, locked: false },
  { id: "c7", section: "4. Experience & References",    criterion: "Similar Past Performance",         requirement: "Minimum 3 similar contracts in last 5 years. Reference letters from contracting entities required.", maxMark: 5,  weight: 5,  passmark: 3,  score: 0, comment: "", justification: "", aiSuggested: null, locked: false },
  { id: "c8", section: "5. Warranty & After-Sales",     criterion: "Warranty & Replacement Guarantee", requirement: "Product warranty terms, defective goods replacement process, and escalation procedure clearly articulated.", maxMark: 5,  weight: 5,  passmark: 3,  score: 0, comment: "", justification: "", aiSuggested: null, locked: false },
];

// Seeded scores per bidder for realistic simulation
const SEED_SCORES: Record<string, number[]> = {
  b1: [23, 13, 18, 13, 9, 5, 5, 4],
  b2: [21, 12, 17, 12, 8, 4, 4, 4],
  b3: [18, 10, 15, 11, 7, 3, 3, 3],
  b4: [14,  8, 11,  8, 5, 2, 2, 2],
};

const PASS_THRESHOLD = 70; // overall % to pass

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(n: number, d = 1) { return n.toFixed(d); }
function totalScore(criteria: EvalCriterion[]) { return criteria.reduce((a, c) => a + c.score, 0); }
function totalMax(criteria: EvalCriterion[])   { return criteria.reduce((a, c) => a + c.maxMark, 0); }
function pct(criteria: EvalCriterion[])        { const m = totalMax(criteria); return m > 0 ? (totalScore(criteria) / m) * 100 : 0; }
function sectionGroups(criteria: EvalCriterion[]) {
  const map = new Map<string, EvalCriterion[]>();
  criteria.forEach(c => {
    if (!map.has(c.section)) map.set(c.section, []);
    map.get(c.section)!.push(c);
  });
  return map;
}

// ─── Document Viewer ──────────────────────────────────────────────────────────
function DocumentViewer({
  doc, pageCount, onClose,
}: {
  doc: string; pageCount: number; onClose: () => void;
}) {
  const [page, setPage]     = useState(1);
  const [zoom, setZoom]     = useState(100);
  const [search, setSearch] = useState("");
  const [full, setFull]     = useState(false);

  const MOCK_SECTIONS = [
    { p: 1,  heading: "Cover Page & Executive Summary" },
    { p: 3,  heading: "Company Profile & Registration" },
    { p: 6,  heading: "Technical Specifications Compliance" },
    { p: 12, heading: "Cold Chain & Storage Facilities" },
    { p: 18, heading: "Delivery Methodology & Schedule" },
    { p: 24, heading: "Quality Assurance Plan" },
    { p: 29, heading: "Key Personnel CVs" },
    { p: 35, heading: "Past Performance & References" },
    { p: 39, heading: "Warranty & After-Sales Terms" },
  ];

  const MOCK_CONTENT: Record<number, string[]> = {
    1:  ["TECHNICAL PROPOSAL", "ARV Medicines Framework Supply", "Submitted to: Ministry of Health and Child Care", "Reference: ZW-PRA-2026-00183", "Bidder: Zimbabwe Pharma Holdings (Pvt) Ltd", "Date: 15 June 2026"],
    6:  ["1. TECHNICAL SPECIFICATIONS", "1.1 WHO Prequalification Compliance", "All products submitted under this proposal have been sourced from WHO-prequalified manufacturers.", "Certificate of Analysis (CoA) for each product line is included in Annex A.", "1.2 Product List", "• Tenofovir/Lamivudine/Dolutegravir (TLD) 300/300/50mg — 500,000 units", "• Zidovudine/Lamivudine (AZT/3TC) 300/150mg — 200,000 units", "All products carry valid shelf-life of minimum 24 months from delivery."],
    12: ["2. COLD CHAIN & STORAGE", "2.1 Warehouse Facilities", "Zimbabwe Pharma Holdings operates a 2,400 m² GDP-compliant warehouse in Msasa Industrial Area, Harare.", "Temperature range: +2°C to +8°C (cold store) and +15°C to +25°C (ambient).", "2.2 Cold Chain Logistics", "All refrigerated deliveries are conducted via our fleet of 8 refrigerated vehicles.", "Real-time GPS and temperature data-logging via ColdWatch™ monitoring system.", "Backup generator with 72-hour autonomy."],
    18: ["3. DELIVERY METHODOLOGY", "3.1 Distribution Network", "Delivery to all 8 Provincial Medical Stores within 21 days of purchase order issuance.", "3.2 Schedule", "Month 1: Delivery to Harare, Bulawayo, Mutare PMDs", "Month 2: Delivery to Masvingo, Gweru, Bindura PMDs", "Month 3: Delivery to Hwange, Beitbridge PMDs", "3.3 Contingency", "Secondary supplier arrangement with Continental Med Africa to ensure continuity."],
  };

  const content = MOCK_CONTENT[page] ?? [`Page ${page} of ${doc}`, "Document content would be rendered here from the PDF binary.", "This viewer supports native PDF rendering, zoom, page navigation, text selection and annotation.", "Marking evaluators can reference any section while scoring criteria in the evaluation panel."];

  return (
    <div className={`flex flex-col bg-[#1a1a2e] text-white overflow-hidden ${full ? "fixed inset-0 z-50" : "h-full"}`}>
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-[#2b579a] px-3 py-1.5 flex items-center gap-2 flex-wrap">
        <FileText className="h-4 w-4 text-slate-300 flex-shrink-0" />
        <span className="text-xs font-semibold text-white truncate flex-1">{doc}</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/50" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="h-6 pl-6 pr-2 text-[10px] bg-white/15 border border-white/20 text-white placeholder-white/40 focus:outline-none w-32"
              style={{ borderRadius: 0 }} />
          </div>
          <button onClick={() => setZoom(z => Math.max(60, z - 20))} title="Zoom out"
            className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/25 text-white" style={{ borderRadius: 0 }}>
            <ZoomOut className="h-3 w-3" />
          </button>
          <span className="text-[10px] text-white/70 w-9 text-center">{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(200, z + 20))} title="Zoom in"
            className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/25 text-white" style={{ borderRadius: 0 }}>
            <ZoomIn className="h-3 w-3" />
          </button>
          <button onClick={() => setFull(v => !v)} className="h-6 w-6 grid place-items-center bg-white/10 hover:bg-white/25 text-white ml-1" style={{ borderRadius: 0 }}>
            {full ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </button>
          <button onClick={onClose} className="h-6 px-2 text-[10px] bg-red-700/80 hover:bg-red-600 text-white" style={{ borderRadius: 0 }}>✕ Close</button>
        </div>
      </div>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Thumbnail sidebar */}
        <div className="w-24 flex-shrink-0 bg-[#111] border-r border-white/10 overflow-y-auto">
          <div className="p-1.5 space-y-1">
            {Array.from({ length: Math.min(pageCount, 10) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-full aspect-[3/4] flex flex-col items-center justify-center border text-[8px] font-mono transition-colors
                  ${page === p ? "border-[#2b579a] bg-[#2b579a]/30 text-white" : "border-white/10 bg-white/5 text-white/40 hover:bg-white/10"}`}
                style={{ borderRadius: 0 }}>
                <div className="w-full h-full bg-white/8 m-1 flex items-end justify-center pb-1">
                  <span>{p}</span>
                </div>
              </button>
            ))}
            {pageCount > 10 && (
              <div className="text-[8px] text-white/30 text-center py-1">+{pageCount - 10} more</div>
            )}
          </div>
        </div>
        {/* Main page view */}
        <div className="flex-1 overflow-auto bg-[#2a2a3e] flex items-start justify-center p-4">
          <div className="bg-white shadow-2xl" style={{ width: `${zoom * 5.6}px`, minHeight: `${zoom * 7.5}px`, maxWidth: "100%", borderRadius: 0 }}>
            {/* Simulated page ruler */}
            <div className="bg-[#f3f3f3] border-b border-black/10 px-4 py-1 flex items-center gap-2 text-[9px] text-black/40">
              <span>Page {page} of {pageCount}</span>
              <span>·</span>
              <span>{doc}</span>
            </div>
            <div className="p-6 min-h-[400px]">
              <div className="space-y-2">
                {content.map((line, i) => (
                  <p key={i} className={`leading-relaxed ${
                    i === 0 ? "text-sm font-bold text-black text-center mb-4" :
                    line.startsWith("•") ? "text-xs text-black/80 pl-4" :
                    line.match(/^\d+\./) ? "text-xs font-semibold text-black mt-3" :
                    "text-xs text-black/75"
                  }`}
                  style={{ fontSize: `${Math.max(8, zoom * 0.1)}px` }}>
                    {search && line.toLowerCase().includes(search.toLowerCase()) ? (
                      <mark className="bg-slate-200">{line}</mark>
                    ) : line}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Page nav footer */}
      <div className="flex-shrink-0 bg-[#111] border-t border-white/10 px-3 py-1.5 flex items-center justify-between">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
          className="h-6 px-3 text-[10px] bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 flex items-center gap-1" style={{ borderRadius: 0 }}>
          <ChevronLeft className="h-3 w-3" /> Prev
        </button>
        <div className="flex items-center gap-2">
          {MOCK_SECTIONS.map(s => (
            <button key={s.p} onClick={() => setPage(s.p)} title={s.heading}
              className={`text-[9px] px-1.5 py-0.5 transition-colors ${page === s.p ? "bg-[#2b579a] text-white" : "text-white/40 hover:text-white"}`}
              style={{ borderRadius: 0 }}>
              §{MOCK_SECTIONS.indexOf(s) + 1}
            </button>
          ))}
        </div>
        <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page >= pageCount}
          className="h-6 px-3 text-[10px] bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 flex items-center gap-1" style={{ borderRadius: 0 }}>
          Next <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Evaluation Panel ─────────────────────────────────────────────────────────
function EvaluationPanel({
  criteria, onChange, bidderId, submitted,
}: {
  criteria: EvalCriterion[];
  onChange: (id: string, field: keyof EvalCriterion, value: number | string | boolean) => void;
  bidderId: string;
  submitted: boolean;
}) {
  const groups = sectionGroups(criteria);
  const total  = totalScore(criteria);
  const max    = totalMax(criteria);
  const score  = pct(criteria);
  const passed = score >= PASS_THRESHOLD;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Score summary bar */}
      <div className="flex-shrink-0 bg-[#0f172a] px-4 py-2 flex items-center gap-4 flex-wrap">
        <div>
          <div className="text-[9px] text-white/55 uppercase tracking-wider">Total Score</div>
          <div className="text-lg font-black font-mono text-white">{total}<span className="text-white/40 text-sm">/{max}</span></div>
        </div>
        <div>
          <div className="text-[9px] text-white/55 uppercase tracking-wider">Percentage</div>
          <div className={`text-lg font-black font-mono ${score >= PASS_THRESHOLD ? "text-slate-500" : "text-red-400"}`}>{fmt(score)}%</div>
        </div>
        <div className="flex-1 mx-2">
          <div className="bg-white/10 h-2 overflow-hidden" style={{ borderRadius: 0 }}>
            <div className={`h-full transition-all ${score >= PASS_THRESHOLD ? "bg-slate-400" : score >= 50 ? "bg-slate-400" : "bg-red-400"}`}
              style={{ width: `${Math.min(100, score)}%` }} />
          </div>
          <div className="text-[8px] text-white/40 mt-0.5">Pass threshold: {PASS_THRESHOLD}%</div>
        </div>
        <div className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 ${passed ? "bg-[#0F172A] text-white" : "bg-red-700 text-white"}`} style={{ borderRadius: 0 }}>
          {passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {passed ? "PASS" : "FAIL"}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {Array.from(groups.entries()).map(([section, items]) => (
          <div key={section}>
            <div className="text-[10px] font-bold text-black/65 uppercase tracking-wider mb-2 pb-1 border-b border-black/10">{section}</div>
            <div className="space-y-3">
              {items.map(c => {
                const critPct = c.maxMark > 0 ? (c.score / c.maxMark) * 100 : 0;
                const critPass = c.score >= c.passmark;
                return (
                  <div key={c.id} className={`border overflow-hidden ${submitted && !critPass ? "border-red-200 bg-red-50/40" : "border-black/10 bg-white"}`} style={{ borderRadius: 0 }}>
                    {/* Criterion header */}
                    <div className="px-3 py-2 bg-[#F8F9FA] border-b border-black/8 flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-black">{c.criterion}</div>
                        <div className="text-[10px] text-black/60 mt-0.5 leading-relaxed">{c.requirement}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-black/45">Max:</span>
                          <span className="text-xs font-bold text-black">{c.maxMark}</span>
                          <span className="text-[9px] text-black/45">· Pass:</span>
                          <span className="text-xs font-bold text-black">{c.passmark}</span>
                        </div>
                        {c.aiSuggested !== null && (
                          <span className="text-[9px] bg-slate-100 text-[#0F172A] px-1.5 py-0.5 flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5" /> AI: {c.aiSuggested}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Score input row */}
                    <div className="px-3 py-2 flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] font-semibold text-black/65">Score:</label>
                        <input
                          type="number" min={0} max={c.maxMark}
                          value={c.score === 0 && !submitted ? "" : c.score}
                          disabled={submitted || c.locked}
                          placeholder="0"
                          onChange={e => {
                            const v = Math.min(c.maxMark, Math.max(0, Number(e.target.value) || 0));
                            onChange(c.id, "score", v);
                          }}
                          className={`w-16 h-8 text-center text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-black/15 disabled:opacity-60
                            ${critPct >= 80 ? "border-slate-200 bg-slate-50 text-[#0F172A]" :
                              critPct >= 60 ? "border-slate-200 bg-slate-50 text-[#0F172A]" :
                              c.score > 0   ? "border-red-400 bg-red-50 text-red-700" : "border-black/20 bg-white text-black"}`}
                          style={{ borderRadius: 0 }}
                        />
                        <span className="text-xs text-black/45">/ {c.maxMark}</span>
                        {/* Mini progress */}
                        <div className="w-20 bg-black/8 h-1.5 overflow-hidden ml-1" style={{ borderRadius: 0 }}>
                          <div className={`h-full transition-all ${critPct >= 80 ? "bg-[#0F172A]" : critPct >= 60 ? "bg-[#0F172A]" : "bg-red-500"}`}
                            style={{ width: `${Math.min(100, critPct)}%` }} />
                        </div>
                        <span className={`text-[10px] font-semibold ${critPass ? "text-[#0F172A]" : "text-red-500"}`}>
                          {critPass ? "✓" : "✗"} {critPct.toFixed(0)}%
                        </span>
                      </div>
                      {c.aiSuggested !== null && !submitted && (
                        <button onClick={() => onChange(c.id, "score", c.aiSuggested!)}
                          className="h-7 px-2 text-[9px] bg-slate-100 text-[#0F172A] hover:bg-slate-200 flex items-center gap-1" style={{ borderRadius: 0 }}>
                          <Sparkles className="h-3 w-3" /> Apply AI Score
                        </button>
                      )}
                    </div>
                    {/* Comment & justification */}
                    <div className="px-3 pb-2 space-y-1.5">
                      <textarea rows={2} value={c.comment} disabled={submitted}
                        onChange={e => onChange(c.id, "comment", e.target.value)}
                        placeholder="Evaluator comments and observations on this criterion…"
                        className="w-full px-2.5 py-1.5 text-[11px] border border-black/10 resize-none focus:outline-none focus:ring-1 focus:ring-black/20 disabled:bg-[#F9F9F9] text-black"
                        style={{ borderRadius: 0 }} />
                      <textarea rows={1} value={c.justification} disabled={submitted}
                        onChange={e => onChange(c.id, "justification", e.target.value)}
                        placeholder="Justification / evidence reference (page number, section)…"
                        className="w-full px-2.5 py-1.5 text-[11px] border border-black/10 resize-none focus:outline-none focus:ring-1 focus:ring-black/20 disabled:bg-[#F9F9F9] text-black/60"
                        style={{ borderRadius: 0 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Summary Report ───────────────────────────────────────────────────────────
function SummaryReport({
  allEvals, evaluator, tender, onDownload,
}: {
  allEvals: { bidder: Bidder; criteria: EvalCriterion[]; submitted: boolean }[];
  evaluator: string;
  tender: string;
  onDownload: () => void;
}) {
  const completed = allEvals.filter(e => e.submitted);
  const ranked = [...completed].sort((a, b) => pct(b.criteria) - pct(a.criteria));
  const sections = INIT_CRITERIA.map(c => c.section).filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-5">
      {/* Header */}
      <div className="bg-[#0f172a] text-white px-5 py-4 flex items-start justify-between gap-4" style={{ borderRadius: 0 }}>
        <div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">GOVERNMENT OF ZIMBABWE · PRAZ</div>
          <div className="text-base font-bold">Technical Evaluation Summary Report</div>
          <div className="text-xs text-white/65 mt-0.5">{tender}</div>
          <div className="text-[10px] text-white/45 mt-1">Evaluator: {evaluator} · Generated: {new Date().toLocaleString("en-GB")}</div>
        </div>
        <button onClick={onDownload} className="h-8 px-3 bg-[#2563eb] text-[#050d1a] text-xs font-bold flex items-center gap-1.5 flex-shrink-0 hover:bg-[#3dd5e4]" style={{ borderRadius: 0 }}>
          <Download className="h-3.5 w-3.5" /> Export PDF
        </button>
      </div>

      {/* Ranking summary */}
      <div>
        <div className="text-xs font-bold text-black mb-2 uppercase tracking-wider">Overall Ranking — Technical Score</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                {["Rank", "Bidder", "Ref", ...sections.map(s => s.split(".")[1]?.trim() ?? s), "Total", "Max", "%", "Pass/Fail", "Result"].map(h => (
                  <th key={h} className="px-2 py-2 text-left text-[10px] font-semibold whitespace-nowrap border-r border-white/10 last:border-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked.map((e, i) => {
                const score = pct(e.criteria);
                const pass  = score >= PASS_THRESHOLD;
                const sectionScores = sections.map(sec =>
                  e.criteria.filter(c => c.section === sec).reduce((a, c) => a + c.score, 0)
                );
                return (
                  <tr key={e.bidder.id} className={`border-b border-black/8 ${i === 0 ? "bg-slate-50" : i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}`}>
                    <td className="px-2 py-2">
                      <span className={`h-6 w-6 inline-flex items-center justify-center text-[10px] font-bold border ${i === 0 ? "bg-slate-400 text-white border-slate-200" : "bg-black/5 text-black/60 border-black/15"}`} style={{ borderRadius: "50%" }}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-2 py-2 font-semibold text-black whitespace-nowrap">{e.bidder.name}</td>
                    <td className="px-2 py-2 text-black/55 font-mono">{e.bidder.ref}</td>
                    {sectionScores.map((s, si) => (
                      <td key={si} className="px-2 py-2 text-center font-mono text-black">{s}</td>
                    ))}
                    <td className="px-2 py-2 text-center font-bold text-black">{totalScore(e.criteria)}</td>
                    <td className="px-2 py-2 text-center text-black/55">{totalMax(e.criteria)}</td>
                    <td className={`px-2 py-2 text-center font-bold ${pass ? "text-[#0F172A]" : "text-red-600"}`}>{fmt(score)}%</td>
                    <td className="px-2 py-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 ${pass ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-700"}`} style={{ borderRadius: 0 }}>
                        {pass ? "PASS" : "FAIL"}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <span className={`text-[10px] font-semibold ${i === 0 ? "text-[#0F172A]" : "text-black/55"}`}>
                        {i === 0 ? "🏆 Highest" : i === 1 ? "Runner-up" : "Not Recommended"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {completed.length === 0 && (
                <tr><td colSpan={20} className="px-3 py-6 text-center text-xs text-black/40">No submitted evaluations yet. Submit scores for each bidder to generate summary.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Criterion-level breakdown for top bidder */}
      {ranked[0] && (
        <div>
          <div className="text-xs font-bold text-black mb-2 uppercase tracking-wider flex items-center gap-2">
            <Award className="h-4 w-4 text-slate-600" /> Criterion Detail — {ranked[0].bidder.name} (Highest Ranked)
          </div>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#F0F0F0]">
                {["Criterion", "Max", "Score", "%", "Pass", "Evaluator Comments"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-black/65 border-b border-black/10">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked[0].criteria.map(c => {
                const p = c.maxMark > 0 ? (c.score / c.maxMark) * 100 : 0;
                const pass = c.score >= c.passmark;
                return (
                  <tr key={c.id} className="border-b border-black/6 hover:bg-[#F9F9F9]">
                    <td className="px-3 py-2">
                      <div className="text-xs font-semibold text-black">{c.criterion}</div>
                      <div className="text-[9px] text-black/45">{c.section}</div>
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-black/65">{c.maxMark}</td>
                    <td className="px-3 py-2 text-center font-bold text-black">{c.score}</td>
                    <td className={`px-3 py-2 text-center font-semibold ${p >= 80 ? "text-[#0F172A]" : p >= 60 ? "text-[#0F172A]" : "text-red-600"}`}>{p.toFixed(0)}%</td>
                    <td className="px-3 py-2 text-center">{pass ? <CheckCircle2 className="h-3.5 w-3.5 text-slate-600 mx-auto" /> : <AlertTriangle className="h-3.5 w-3.5 text-red-500 mx-auto" />}</td>
                    <td className="px-3 py-2 text-[10px] text-black/65 max-w-xs">{c.comment || <span className="text-black/30 italic">No comment recorded</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit note */}
      <div className="bg-[#F8F9FA] border border-black/10 px-4 py-3 text-[10px] text-black/55 flex items-start gap-2" style={{ borderRadius: 0 }}>
        <Lock className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-black/40" />
        <span>This report is system-generated and forms part of the official procurement audit trail. All scores, comments, and timestamps are immutable once submitted. Any amendments require CPO authorisation and create a new audit entry.</span>
      </div>
    </div>
  );
}

// ─── Audit Trail ──────────────────────────────────────────────────────────────
function AuditTrailPanel({ entries }: { entries: AuditEntry[] }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      <div className="text-[9px] font-bold text-black/55 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Lock className="h-3.5 w-3.5" /> Immutable Audit Trail — All Evaluator Actions
      </div>
      {entries.length === 0 && (
        <div className="text-xs text-black/40 text-center py-8">No audit entries yet. Actions will appear here as evaluators interact with the module.</div>
      )}
      {entries.map((e, i) => (
        <div key={i} className="flex items-start gap-3 px-3 py-2 border border-black/8 bg-white">
          <div className="h-1.5 w-1.5 rounded-full bg-black/30 flex-shrink-0 mt-1.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-black">{e.user}</span>
              <span className="text-[10px] font-semibold text-black/55">{e.action}</span>
            </div>
            <div className="text-[10px] text-black/55 mt-0.5">{e.detail}</div>
          </div>
          <div className="text-[9px] font-mono text-black/35 flex-shrink-0">{e.ts}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function TechnicalEvaluationModule({
  tender = "ZW-PRA-2026-00183 — ARV Medicines Framework",
  evaluator = "D. Moyo",
}: {
  tender?: string;
  evaluator?: string;
}) {
  const [activeBidder, setActiveBidder] = useState<string>(BIDDERS[0].id);
  const [activeDoc, setActiveDoc]       = useState<{ bidder: string; doc: string; pages: number } | null>(null);
  const [activeTab, setActiveTab]       = useState<"evaluate" | "summary" | "audit">("evaluate");
  const [auditLog, setAuditLog]         = useState<AuditEntry[]>([]);

  // Per-bidder criteria state, seeded with mock scores
  const [evalState, setEvalState] = useState<Record<string, EvalCriterion[]>>(() => {
    const state: Record<string, EvalCriterion[]> = {};
    BIDDERS.forEach(b => {
      const seeds = SEED_SCORES[b.id] ?? [];
      state[b.id] = INIT_CRITERIA.map((c, i) => ({ ...c, score: seeds[i] ?? 0 }));
    });
    return state;
  });
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const addAudit = (action: string, detail: string) => {
    const ts = new Date().toLocaleString("en-GB", { hour12: false });
    setAuditLog(prev => [{ ts, user: evaluator, action, detail }, ...prev]);
  };

  const handleChange = (bidderId: string, id: string, field: keyof EvalCriterion, value: number | string | boolean) => {
    setEvalState(prev => ({
      ...prev,
      [bidderId]: prev[bidderId].map(c => c.id === id ? { ...c, [field]: value } : c),
    }));
    if (field === "score") addAudit("Score updated", `Criterion ${id} → score: ${value} (bidder: ${BIDDERS.find(b => b.id === bidderId)?.name})`);
    if (field === "comment") addAudit("Comment recorded", `Criterion ${id} — comment saved for ${BIDDERS.find(b => b.id === bidderId)?.name}`);
  };

  const handleAiSuggest = (bidderId: string) => {
    const seeds = SEED_SCORES[bidderId] ?? [];
    setEvalState(prev => ({
      ...prev,
      [bidderId]: prev[bidderId].map((c, i) => ({
        ...c,
        aiSuggested: Math.min(c.maxMark, Math.round((seeds[i] ?? 0) * (0.9 + Math.random() * 0.15))),
      })),
    }));
    addAudit("AI Suggest", `AI scoring suggestions generated for ${BIDDERS.find(b => b.id === bidderId)?.name}`);
    pushNotification("AI scoring suggestions applied — review and confirm each criterion", "info");
  };

  const handleSubmit = (bidderId: string) => {
    setSubmitted(prev => ({ ...prev, [bidderId]: true }));
    addAudit("Scores Submitted", `Final scores submitted for ${BIDDERS.find(b => b.id === bidderId)?.name} — awaiting moderation`);
    pushNotification(`Evaluation submitted for ${BIDDERS.find(b => b.id === bidderId)?.name}`, "success");
  };

  const handleSave = (bidderId: string) => {
    addAudit("Draft Saved", `Evaluation draft saved for ${BIDDERS.find(b => b.id === bidderId)?.name}`);
    pushNotification("Draft saved", "success");
  };

  const handleDownloadSummary = () => {
    addAudit("Report Exported", "Technical Evaluation Summary PDF exported");
    pushNotification("Technical Evaluation Summary exported", "success");
  };

  const bidder = BIDDERS.find(b => b.id === activeBidder)!;
  const criteria = evalState[activeBidder] ?? [];
  const isSubmitted = !!submitted[activeBidder];
  const allEvals = BIDDERS.map(b => ({ bidder: b, criteria: evalState[b.id] ?? [], submitted: !!submitted[b.id] }));
  const submittedCount = Object.values(submitted).filter(Boolean).length;

  const TABS = [
    { key: "evaluate" as const, label: "Evaluate",        icon: ClipboardList },
    { key: "summary"  as const, label: "Summary Report",  icon: BarChart3,    badge: submittedCount > 0 ? String(submittedCount) : undefined },
    { key: "audit"    as const, label: "Audit Trail",     icon: Lock,         badge: auditLog.length > 0 ? String(auditLog.length) : undefined },
  ];

  return (
    <div className="flex flex-col h-full bg-[#EAF1F8] overflow-hidden">
      {/* Module header */}
      <div className="flex-shrink-0 bg-[#0f172a] text-white px-4 py-2.5 flex items-center gap-3 flex-wrap">
        <FileSearch className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white">Technical Evaluation Module</div>
          <div className="text-[10px] text-white/55 truncate">{tender}</div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
          {BIDDERS.map(b => {
            const score = pct(evalState[b.id] ?? []);
            const sub   = !!submitted[b.id];
            return (
              <button key={b.id} onClick={() => { setActiveBidder(b.id); setActiveTab("evaluate"); }}
                className={`h-7 px-2.5 text-[10px] font-semibold transition-all flex items-center gap-1.5
                  ${activeBidder === b.id && activeTab === "evaluate" ? "bg-[#2563eb] text-[#050d1a]" : sub ? "bg-[#0F172A] text-white" : "bg-white/10 text-white/75 hover:bg-white/20"}`}
                style={{ borderRadius: 0 }}>
                {sub && <CheckCircle2 className="h-3 w-3" />}
                <span className="max-w-[90px] truncate">{b.name.split(" ")[0]}</span>
                {sub && <span className="font-mono">{fmt(score)}%</span>}
              </button>
            );
          })}
        </div>
        {/* Module tabs */}
        <div className="flex items-center gap-px ml-2">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`h-7 px-3 text-[10px] font-semibold flex items-center gap-1.5 transition-all
                ${activeTab === t.key ? "bg-[#2563eb] text-[#050d1a]" : "bg-white/10 text-white/75 hover:bg-white/20"}`}
              style={{ borderRadius: 0 }}>
              <t.icon className="h-3 w-3" />
              {t.label}
              {t.badge && <span className="text-[9px] bg-white/20 px-1 rounded-full">{t.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Evaluate Tab ─────────────────────────────────────────────── */}
      {activeTab === "evaluate" && (
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* LEFT — Document Explorer */}
          <div className="flex flex-col w-[42%] flex-shrink-0 border-r border-black/10 overflow-hidden bg-white">
            {activeDoc && activeDoc.bidder === activeBidder ? (
              <DocumentViewer doc={activeDoc.doc} pageCount={activeDoc.pages}
                onClose={() => { setActiveDoc(null); addAudit("Document closed", activeDoc.doc); }} />
            ) : (
              /* Document list */
              <div className="flex flex-col h-full">
                <div className="flex-shrink-0 bg-[#0f172a] text-white px-3 py-2 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Document Explorer</span>
                  <span className="ml-auto text-[9px] text-white/55">{bidder.name}</span>
                </div>
                <div className="flex-shrink-0 px-3 py-2 bg-[#F8F9FA] border-b border-black/10 text-[9px] text-black/55">
                  {bidder.docs.length} document{bidder.docs.length !== 1 ? "s" : ""} submitted · Click to open in viewer
                </div>
                <div className="flex-1 overflow-y-auto">
                  {bidder.docs.map((doc, i) => (
                    <button key={i} onClick={() => { setActiveDoc({ bidder: activeBidder, doc: doc.name, pages: doc.pages }); addAudit("Document opened", doc.name); }}
                      className="w-full text-left flex items-start gap-3 px-4 py-3 border-b border-black/6 hover:bg-slate-50 transition-colors group">
                      <div className="h-10 w-8 bg-red-100 border border-red-200 flex flex-col items-center justify-center flex-shrink-0 mt-0.5" style={{ borderRadius: 0 }}>
                        <span className="text-[7px] font-bold text-red-700 uppercase">PDF</span>
                        <FileText className="h-3 w-3 text-red-500 mt-0.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-black group-hover:text-[#0F172A] transition-colors truncate">{doc.name}</div>
                        <div className="text-[10px] text-black/45 mt-0.5">{doc.pages} pages · {doc.type.toUpperCase()}</div>
                      </div>
                      <Eye className="h-3.5 w-3.5 text-black/30 group-hover:text-slate-600 flex-shrink-0 mt-1 transition-colors" />
                    </button>
                  ))}
                </div>
                <div className="flex-shrink-0 px-3 py-2.5 bg-[#F8F9FA] border-t border-black/10 text-[9px] text-black/45 flex items-center gap-1.5">
                  <Shield className="h-3 w-3" />
                  Documents are read-only. Evaluators may not modify submitted proposals.
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — Evaluation panel + action bar */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {/* Bidder sub-header */}
            <div className="flex-shrink-0 bg-white border-b border-black/10 px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="text-xs font-bold text-black">{bidder.name}
                  <span className="ml-2 text-[10px] font-mono text-black/45">{bidder.ref}</span>
                </div>
                <div className="text-[10px] text-black/55">Technical Proposal Evaluation · {criteria.length} criteria · Max {totalMax(criteria)} marks</div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!isSubmitted && (
                  <>
                    <button onClick={() => handleAiSuggest(activeBidder)}
                      className="h-7 px-2.5 text-[10px] font-semibold bg-slate-100 text-[#0F172A] hover:bg-slate-200 flex items-center gap-1.5 transition-colors" style={{ borderRadius: 0 }}>
                      <Sparkles className="h-3 w-3" /> AI Suggest
                    </button>
                    <button onClick={() => handleSave(activeBidder)}
                      className="h-7 px-2.5 text-[10px] font-semibold bg-black/8 text-black/70 hover:bg-black/15 flex items-center gap-1.5" style={{ borderRadius: 0 }}>
                      <Save className="h-3 w-3" /> Save Draft
                    </button>
                    <button onClick={() => handleSubmit(activeBidder)}
                      className="h-7 px-3 text-[10px] font-bold bg-[#0F172A] text-white hover:bg-[#0F172A] flex items-center gap-1.5" style={{ borderRadius: 0 }}>
                      <Send className="h-3 w-3" /> Submit
                    </button>
                  </>
                )}
                {isSubmitted && (
                  <div className="flex items-center gap-1.5 text-[#0F172A] text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Submitted — Awaiting Moderation
                  </div>
                )}
              </div>
            </div>

            {/* Criteria panel */}
            <div className="flex-1 overflow-hidden">
              <EvaluationPanel
                criteria={criteria}
                onChange={(id, field, value) => handleChange(activeBidder, id, field, value)}
                bidderId={activeBidder}
                submitted={isSubmitted}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Summary Tab ──────────────────────────────────────────────── */}
      {activeTab === "summary" && (
        <SummaryReport allEvals={allEvals} evaluator={evaluator} tender={tender} onDownload={handleDownloadSummary} />
      )}

      {/* ── Audit Tab ────────────────────────────────────────────────── */}
      {activeTab === "audit" && (
        <AuditTrailPanel entries={auditLog} />
      )}
    </div>
  );
}
