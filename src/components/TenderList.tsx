/**
 * TenderList — redesigned per 21 July Final Tenders Flow Design
 *
 * Per document spec:
 * - Each row: Ministry, Tender Name, Tender Code, Closing Date & Time, Stage, % Completion, Tender View button
 * - Filters: New Created Tenders, Evaluation stage, Awarded, Closed, Flagged, Financial year, Ministry
 * - Tenders separated into 3 categories (Supplies, Works, Services) on the same list
 * - Government header: dark navy "GOVERNMENT OF THE REPUBLIC OF ZIMBABWE"
 * - Clean, neat, simple, logical — Oracle Fusion-style layout
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClosingCountdownTimer } from "./ui/ClosingCountdownTimer";
import { DocumentViewerPanel } from "./ui/DocumentViewerPanel";
import { AiAgentChatPanel } from "./ui/AiAgentChatPanel";
import {
  Search, Download, Eye, Filter, ChevronDown, LayoutGrid, Table2,
  Building2, Tag, Calendar, AlertTriangle, Bot, FileText, X
} from "lucide-react";

type Tender = {
  id: string;
  name: string;
  code: string;
  ministry: string;
  stage: string;
  completion: number;
  closingDate: Date;
  category: "Supplies" | "Works" | "Services";
  value: string;
  flagged?: boolean;
  financialYear: string;
};

const MOCK_TENDERS: Tender[] = [
  { id:"1", name:"Supply & Installation of Solar Mini-Grids — 12 Rural Clinics",      code:"ZW-PRA-2026-00184", ministry:"Ministry of Energy",                     stage:"Bidding Open",       completion:35, closingDate:new Date("2026-07-08T16:00:00"), category:"Works",    value:"USD 14,800,000", financialYear:"2026/27" },
  { id:"2", name:"Procurement of Antiretroviral Medicines (2-Year Framework)",         code:"ZW-PRA-2026-00183", ministry:"Ministry of Health and Child Care",      stage:"Evaluation",         completion:65, closingDate:new Date("2026-06-12T16:00:00"), category:"Supplies", value:"USD 42,500,000", financialYear:"2026/27" },
  { id:"3", name:"National Tax Administration System — Phase II",                      code:"ZW-PRA-2026-00182", ministry:"ZIMRA",                                  stage:"Bidding Open",       completion:25, closingDate:new Date("2026-07-21T16:00:00"), category:"Services", value:"USD 9,200,000",  financialYear:"2026/27" },
  { id:"4", name:"Rehabilitation of Beitbridge–Harare Highway (Section 4)",            code:"ZW-PRA-2026-00181", ministry:"Ministry of Transport",                  stage:"Published",          completion:15, closingDate:new Date("2026-08-04T16:00:00"), category:"Works",    value:"USD 88,000,000", financialYear:"2026/27" },
  { id:"5", name:"Supply of Fertiliser — Pfumvudza Programme 2026/27",                code:"ZW-PRA-2026-00180", ministry:"Ministry of Agriculture",                stage:"Awarded",            completion:100,closingDate:new Date("2026-05-30T16:00:00"), category:"Supplies", value:"USD 31,400,000", financialYear:"2026/27" },
  { id:"6", name:"ICT Managed Services — Government Datacentre",                       code:"ZW-PRA-2026-00179", ministry:"Ministry of ICT",                        stage:"Evaluation",         completion:78, closingDate:new Date("2026-07-02T16:00:00"), category:"Services", value:"USD 4,200,000",  financialYear:"2026/27", flagged:true },
  { id:"7", name:"Supply of School Textbooks — Primary Grades 1–7",                   code:"ZW-PRA-2026-00178", ministry:"Ministry of Primary Education",           stage:"New",                completion:5,  closingDate:new Date("2026-08-15T16:00:00"), category:"Supplies", value:"USD 6,700,000",  financialYear:"2026/27" },
  { id:"8", name:"Construction of Rural Health Clinics — Mashonaland East (Phase 3)", code:"ZW-PRA-2026-00177", ministry:"Ministry of Health and Child Care",      stage:"Closed",             completion:100,closingDate:new Date("2026-04-30T16:00:00"), category:"Works",    value:"USD 22,000,000", financialYear:"2025/26" },
  { id:"9", name:"External Audit Services (3 Years)",                                  code:"ZW-PRA-2026-00176", ministry:"Auditor-General Office",                 stage:"Evaluation",         completion:55, closingDate:new Date("2026-06-18T16:00:00"), category:"Services", value:"USD 1,850,000",  financialYear:"2026/27", flagged:true },
  { id:"10",name:"Office Stationery & Supplies — Q3 2026",                            code:"ZW-PRA-2026-00175", ministry:"Ministry of Finance",                    stage:"Awarded",            completion:100,closingDate:new Date("2026-06-01T16:00:00"), category:"Supplies", value:"USD 45,000",     financialYear:"2025/26" },
];

type StageFilter = "All" | "New" | "Evaluation" | "Awarded" | "Closed" | "Flagged";
type CategoryFilter = "All" | "Supplies" | "Works" | "Services";
type ViewMode = "table" | "cards";

const STAGE_COLORS: Record<string, string> = {
  "New":         "bg-slate-100 text-slate-700",
  "Published":   "bg-blue-100 text-blue-700",
  "Bidding Open":"bg-emerald-100 text-emerald-700",
  "Evaluation":  "bg-amber-100 text-amber-700",
  "Awarded":     "bg-green-100 text-green-800",
  "Closed":      "bg-gray-100 text-gray-600",
  "Flagged":     "bg-red-100 text-red-700",
};

const CAT_COLORS: Record<string, string> = {
  Supplies: "bg-blue-600",
  Works:    "bg-emerald-600",
  Services: "bg-violet-600",
};

function StageBadge({ stage, flagged }: { stage: string; flagged?: boolean }) {
  const cls = STAGE_COLORS[stage] ?? "bg-gray-100 text-gray-600";
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{stage}</span>
      {flagged && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
    </span>
  );
}

function CompletionBar({ pct }: { pct: number }) {
  const color = pct === 100 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-400" : "bg-blue-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-gray-500 w-7 text-right">{pct}%</span>
    </div>
  );
}

export function TenderList() {
  const navigate = useNavigate();
  const [stageFilter, setStageFilter]     = useState<StageFilter>("All");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All");
  const [ministryFilter, setMinistryFilter] = useState("All");
  const [fyFilter, setFyFilter]           = useState("All");
  const [search, setSearch]               = useState("");
  const [viewMode, setViewMode]           = useState<ViewMode>("table");
  const [showDoc, setShowDoc]             = useState(false);
  const [showAI, setShowAI]               = useState(false);

  const ministries = ["All", ...Array.from(new Set(MOCK_TENDERS.map(t => t.ministry)))];
  const fyears     = ["All", ...Array.from(new Set(MOCK_TENDERS.map(t => t.financialYear)))];

  const filtered = MOCK_TENDERS.filter(t => {
    if (stageFilter === "Flagged" && !t.flagged) return false;
    if (stageFilter !== "All" && stageFilter !== "Flagged" && t.stage !== stageFilter) return false;
    if (categoryFilter !== "All" && t.category !== categoryFilter) return false;
    if (ministryFilter !== "All" && t.ministry !== ministryFilter) return false;
    if (fyFilter !== "All" && t.financialYear !== fyFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) &&
        !t.code.toLowerCase().includes(search.toLowerCase()) &&
        !t.ministry.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by category for the three-section view
  const byCategory: Record<CategoryFilter, Tender[]> = {
    All:      filtered,
    Supplies: filtered.filter(t => t.category === "Supplies"),
    Works:    filtered.filter(t => t.category === "Works"),
    Services: filtered.filter(t => t.category === "Services"),
  };

  const categories: CategoryFilter[] = ["Supplies", "Works", "Services"];

  const handleExportCSV = () => {
    const headers = ["Ministry","Tender Name","Tender Code","Stage","% Complete","Category","Value","Closing Date"];
    const rows = filtered.map(t => [t.ministry, t.name, t.code, t.stage, t.completion, t.category, t.value, t.closingDate.toISOString()]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv],{type:"text/csv"})), download:"tenders-register.csv" });
    a.click();
  };

  const kpis = {
    total:   MOCK_TENDERS.length,
    open:    MOCK_TENDERS.filter(t => t.stage === "Bidding Open").length,
    eval:    MOCK_TENDERS.filter(t => t.stage === "Evaluation").length,
    awarded: MOCK_TENDERS.filter(t => t.stage === "Awarded").length,
    flagged: MOCK_TENDERS.filter(t => t.flagged).length,
  };

  const TableSection = ({ cat, tenders }: { cat: string; tenders: Tender[] }) => (
    <div className="mb-6">
      {/* Category section header */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-t-lg ${
        cat === "Supplies" ? "bg-blue-600" : cat === "Works" ? "bg-emerald-600" : "bg-violet-600"
      }`}>
        <span className="text-white text-xs font-black uppercase tracking-widest">{cat}</span>
        <span className="text-white/70 text-xs">— {tenders.length} tender{tenders.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="border border-t-0 border-gray-200 rounded-b-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a3a5c]">
                {["Ministry","Tender Name","Tender Code","Closing Date & Time","Countdown","Stage","% Complete","Action"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-white whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenders.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">No {cat.toLowerCase()} tenders found</td></tr>
              )}
              {tenders.map(t => (
                <tr key={t.id} className="hover:bg-blue-50/40 transition-colors group">
                  <td className="px-3 py-2.5">
                    <div className="text-xs text-gray-600 max-w-[140px] truncate" title={t.ministry}>
                      <Building2 className="h-3 w-3 inline mr-1 text-gray-400" />{t.ministry}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-gray-900 text-xs max-w-[220px]" title={t.name}>
                      <div className="truncate">{t.name}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[10px] text-gray-500">{t.code}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-xs text-gray-600 whitespace-nowrap">
                      <Calendar className="h-3 w-3 inline mr-1 text-gray-400" />
                      {t.closingDate.toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                    </div>
                    <div className="text-[10px] text-gray-400">{t.closingDate.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <ClosingCountdownTimer closingDate={t.closingDate} size="sm" />
                  </td>
                  <td className="px-3 py-2.5">
                    <StageBadge stage={t.stage} flagged={t.flagged} />
                  </td>
                  <td className="px-3 py-2.5 min-w-[100px]">
                    <CompletionBar pct={t.completion} />
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => navigate(`/tenders/${t.id}`)}
                      className="flex items-center gap-1 h-7 px-2.5 bg-[#0f172a] text-white text-[10px] font-bold rounded-lg hover:bg-black/80 transition-colors whitespace-nowrap"
                    >
                      <Eye className="h-3 w-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex gap-4">
      <div className="flex-1 min-w-0 space-y-4">
        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label:"Total Tenders",    value:kpis.total,   color:"text-[#0f172a]",  bg:"bg-white" },
            { label:"Bidding Open",     value:kpis.open,    color:"text-emerald-700",bg:"bg-emerald-50 border-emerald-200" },
            { label:"In Evaluation",    value:kpis.eval,    color:"text-amber-700",  bg:"bg-amber-50 border-amber-200"   },
            { label:"Awarded",          value:kpis.awarded, color:"text-blue-700",   bg:"bg-blue-50 border-blue-200"     },
            { label:"Flagged",          value:kpis.flagged, color:"text-red-700",    bg:"bg-red-50 border-red-200"       },
          ].map(k => (
            <div key={k.label} className={`${k.bg} border rounded-xl px-4 py-3`}>
              <div className={`text-2xl font-black ${k.color}`}>{k.value}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>

        {/* ── Filter bar ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          {/* Stage quick filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mr-1">Stage:</span>
            {(["All","New","Evaluation","Awarded","Closed","Flagged"] as StageFilter[]).map(s => (
              <button key={s} onClick={() => setStageFilter(s)}
                className={`h-7 px-3 rounded-full text-xs font-semibold border transition-all ${
                  stageFilter === s
                    ? s === "Flagged" ? "bg-red-600 text-white border-red-600"
                    : "bg-[#0f172a] text-white border-[#0f172a]"
                    : "border-gray-200 text-gray-600 hover:border-gray-400"
                }`}>
                {s === "Flagged" && <AlertTriangle className="h-3 w-3 inline mr-1" />}{s}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mr-1">Category:</span>
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
          </div>

          {/* Search + dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tenders, codes, entities…"
                className="w-full h-8 pl-8 pr-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0f172a]/10" />
            </div>

            {/* Ministry dropdown */}
            <div className="relative">
              <select value={ministryFilter} onChange={e => setMinistryFilter(e.target.value)}
                className="h-8 pl-2.5 pr-6 text-xs border border-gray-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#0f172a]/10">
                {ministries.map(m => <option key={m}>{m === "All" ? "All Ministries" : m}</option>)}
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
            </div>

            {/* Financial year */}
            <div className="relative">
              <select value={fyFilter} onChange={e => setFyFilter(e.target.value)}
                className="h-8 pl-2.5 pr-6 text-xs border border-gray-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#0f172a]/10">
                {fyears.map(y => <option key={y}>{y === "All" ? "All Financial Years" : y}</option>)}
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-xs text-gray-400">{filtered.length} results</span>
              <button onClick={handleExportCSV}
                className="h-8 px-3 flex items-center gap-1.5 text-xs font-semibold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
              {/* View toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setViewMode("table")}
                  className={`h-8 px-2.5 flex items-center ${viewMode === "table" ? "bg-[#0f172a] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                  <Table2 className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setViewMode("cards")}
                  className={`h-8 px-2.5 flex items-center border-l border-gray-200 ${viewMode === "cards" ? "bg-[#0f172a] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
              </div>
              {/* AI / Doc toggles */}
              <button onClick={() => setShowAI(v => !v)}
                className={`h-8 px-2.5 flex items-center gap-1 text-xs rounded-lg border transition-colors ${showAI ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                <Bot className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setShowDoc(v => !v)}
                className={`h-8 px-2.5 flex items-center gap-1 text-xs rounded-lg border transition-colors ${showDoc ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                <FileText className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Table / Cards ── */}
        {viewMode === "table" ? (
          categoryFilter === "All" ? (
            /* Show all 3 category sections */
            <>
              {categories.map(cat => (
                <TableSection key={cat} cat={cat} tenders={byCategory[cat]} />
              ))}
            </>
          ) : (
            <TableSection cat={categoryFilter} tenders={byCategory[categoryFilter]} />
          )
        ) : (
          /* Cards view */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(t => (
              <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded text-white ${CAT_COLORS[t.category]}`}>
                    {t.category}
                  </span>
                  <StageBadge stage={t.stage} flagged={t.flagged} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 leading-snug line-clamp-2">{t.name}</h3>
                <div className="text-[10px] text-gray-400 font-mono mb-2">{t.code}</div>
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />{t.ministry}
                </div>
                <div className="mt-3 mb-2">
                  <CompletionBar pct={t.completion} />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <ClosingCountdownTimer closingDate={t.closingDate} size="sm" />
                  <button onClick={() => navigate(`/tenders/${t.id}`)}
                    className="flex items-center gap-1 h-7 px-2.5 bg-[#0f172a] text-white text-[10px] font-bold rounded-lg hover:bg-black/80">
                    <Eye className="h-3 w-3" /> View
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 py-16 text-center text-gray-400 text-sm">No tenders match the selected filters.</div>
            )}
          </div>
        )}
      </div>

      {/* ── Right panels: Doc viewer + AI ── */}
      {(showDoc || showAI) && (
        <div className="w-80 shrink-0 space-y-3">
          {showDoc && (
            <DocumentViewerPanel
              documents={[{ id:"1", name:"Tenders Register", type:"letter", content:"<p>Document viewer placeholder</p>" }]}
              defaultVisible={true}
            />
          )}
          {showAI && (
            <AiAgentChatPanel
              agentName="Tender AI"
              agentRole="Procurement Intelligence"
              context="tender list and register"
              suggestedPrompts={["Show tenders closing next week","Which tenders are flagged?","Show all awarded tenders","Filter by Ministry of Health"]}
              color="blue"
              defaultVisible={true}
            />
          )}
        </div>
      )}
    </div>
  );
}
