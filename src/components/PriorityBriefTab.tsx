/**
 * PriorityBriefTab — 15 executive brief panels with visual + scroll alerts,
 * start/stop ticker, AI Audio option. Each panel is data-rich, purposeful,
 * and meets the criteria: educates, informs, demonstrates logic, relevant.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import {
  AlertTriangle, TrendingUp, TrendingDown,
  DollarSign, ShieldAlert, Users, Building2, BarChart3, FileText,
  AlertOctagon, Flame, Package, Activity, Clock, CheckCircle2,
  ChevronRight, Wifi, ListChecks, Paperclip, MessageSquare,
  Download, ChevronUp, Filter, Send, ArrowUp, Volume2, VolumeX,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from "recharts";
import AIAssistantPanel from "./AIAssistantPanel";

// ── Colour palette ─────────────────────────────────────────────────────────
const C = {
  navy:   "#0f172a", blue:   "#3B82F6", sky:    "#0EA5E9",
  green:  "#10B981", amber:  "#F59E0B", red:    "#EF4444",
  violet: "#8B5CF6", teal:   "#14B8A6", orange: "#F97316",
  slate:  "#64748b",
};
const PIE_COLORS = [C.blue, C.green, C.amber, C.red, C.violet, C.teal, C.orange];

// ── Filter options ────────────────────────────────────────────────────────
const MINISTRIES = [
  "All Ministries", "Finance & Economic Development", "Health & Child Care",
  "Education, Sport & Culture", "Transport & Infrastructural Development",
  "Energy & Power Development", "Water Resources, Sanitation & Climate",
  "Agriculture, Lands & Rural Resettlement", "Home Affairs & Cultural Heritage",
  "Justice, Legal & Parliamentary Affairs", "Public Service, Labour & Social Welfare",
];
const FINANCIAL_YEARS = ["All Years", "FY 2026", "FY 2025", "FY 2024", "FY 2023", "FY 2022"];
const DEPARTMENTS = [
  "All Departments", "Treasury", "Revenue Authority (ZIMRA)", "Procurement",
  "Infrastructure", "Social Services", "Human Resources", "Audit & Compliance",
  "Legal Services", "Planning & Development",
];

// ── Brief-level document data ──────────────────────────────────────────────
function buildBriefDocs(panelId: string) {
  const labels = ["Main Report", "Annexure A", "Supporting Data", "Executive Summary", "Risk Register"];
  return labels.map((label, i) => ({
    name: `${label} — ${panelId.charAt(0).toUpperCase() + panelId.slice(1)} Brief.pdf`,
    size: `${(0.8 + i * 0.6).toFixed(1)} MB`,
    type: i % 3 === 0 ? "xlsx" : "pdf",
    date: `2026-0${(i % 6) + 1}-${String((i * 4 + 10) % 28 + 1).padStart(2, "0")}`,
  }));
}

function buildBriefResolutions(panelId: string) {
  return [
    `RESOLVED that the ${panelId.charAt(0).toUpperCase() + panelId.slice(1)} Brief be received, noted and tabled for action.`,
    `RESOLVED that the responsible ministry submit an implementation plan within 14 working days.`,
    `RESOLVED that a progress report be presented at the next scheduled briefing session.`,
    `RESOLVED that Treasury allocate the necessary resources to address identified gaps.`,
  ];
}

function buildBriefMinutes(panelId: string) {
  return [
    { time: "09:00", item: "Opening — Quorum confirmed. 7 of 9 members present." },
    { time: "09:10", item: `${panelId.charAt(0).toUpperCase() + panelId.slice(1)} briefing presented by the lead analyst.` },
    { time: "09:45", item: "Discussion on key risk indicators and threshold breaches." },
    { time: "10:15", item: "Resource allocation and budget implications reviewed." },
    { time: "10:40", item: "Resolutions passed unanimously. Action log updated." },
    { time: "11:00", item: "Adjournment. Next sitting: 14 days." },
  ];
}

// ── Scroll-alert ticker data ───────────────────────────────────────────────
const ALERTS_BY_PANEL: Record<string, string[]> = {
  priority: [
    "🔴 CRITICAL: Public debt at 82.6% of GDP — threshold breached",
    "⚠️ 23 fraud alerts active across 6 ministries",
    "📌 Solar Mini-Grid tender closing in 48 hours — no award yet",
    "🔴 Foreign reserves at 1.8 months — minimum 3 months required",
    "⚠️ Budget absorption at 38% vs 50% target for Q2",
  ],
  cabinet: [
    "📋 Cabinet meeting scheduled: 3 pending agenda items from Finance",
    "✅ Resolution 24/2026: Infrastructure levy approved — effective Aug 1",
    "⚠️ 2 Cabinet resolutions still pending implementation (overdue by 30+ days)",
    "📌 Next Cabinet sitting: Budget policy statement discussion",
  ],
  parliament: [
    "🏛️ Parliament resumes: 14 questions directed to Ministry of Finance",
    "📋 Supplementary budget estimates tabled — ZWG 4.8B requested",
    "⚠️ 3 parliamentary questions unanswered beyond 21-day limit",
    "✅ Public Finance Management Act amendment passed — 3rd reading",
  ],
  emergency: [
    "🔴 EMERGENCY: Cyclone alert — 3 provinces under warning",
    "🔴 Hospital drug stockout — 62% facilities report critical shortages",
    "⚠️ Bridge collapse: Beitbridge–Harare route disrupted",
    "📌 Emergency procurement protocol activated — 2 active orders",
  ],
  economic: [
    "📈 Inflation: 34.8% — food basket up 41% year-on-year",
    "💱 ZiG exchange rate: 13.42 official | 18.4 parallel market",
    "⚠️ GDP growth 3.2% — below 5% development target",
    "🔴 Trade balance: -$284M — imports outpacing exports",
  ],
  revenue: [
    "💰 Revenue H1 2026: $5.34B vs $5.83B target — $490M shortfall",
    "📈 VAT collections up 8% YoY — strongest revenue stream",
    "⚠️ Mining royalty revenues down 12% — production disruptions",
    "🔴 Revenue leakage estimated at $380M — enforcement gap",
  ],
  budget: [
    "💵 Approved Budget FY2026: $3.4B | Utilised: 67.8%",
    "⚠️ 3 ministries over budget: Water 132%, Agri 108%, Home 117%",
    "📌 Budget variance alert: Infrastructure underspent by $180M",
    "🔴 Supplementary budget likely required — Q3 projections",
  ],
  project: [
    "🏗️ 1,487 active infrastructure projects — only 19% on time & on budget",
    "⚠️ 147 projects abandoned/stalled — $418M idle investment",
    "📌 Average cost overrun: 43% above original contract value",
    "🔴 Roads sector overrun: 49% above planned budget",
  ],
  procurement: [
    "📋 1,287 active tenders across all ministries",
    "⚠️ 67 spec-tailoring cases detected — up 41% year-on-year",
    "🔴 Ghost vendor payments: 31 cases, USD 28.4M at risk",
    "✅ e-Procurement adoption: 62% of ministries onboarded",
  ],
  debt: [
    "🔴 Public debt / GDP: 82.6% — threshold 70% breached",
    "⚠️ Domestic debt servicing: 28% of revenue consumed",
    "📌 External debt service ratio: 14.2% of export earnings",
    "🔴 Debt rollover risk: $420M maturing in Q3 2026",
  ],
  payroll: [
    "👥 Civil service payroll: 42% of total government expenditure",
    "⚠️ 284 ghost workers detected in Q1 audit",
    "📌 Payroll verification exercise ongoing — 3 ministries pending",
    "🔴 PAYE remittances: 3 SOEs 60+ days in arrears",
  ],
  citizen: [
    "🏥 Hospital wait time: avg 6.4 hrs vs 2-hr benchmark",
    "🏫 Pupil-teacher ratio: 48:1 vs recommended 30:1",
    "💧 Rural water access: only 38% served — 52% gap",
    "⚡ ZESA uptime: 54% — 41% load-shedding losses",
  ],
  audit: [
    "📋 141 active audit investigations across 8 ministries",
    "⚠️ 48 audit findings unresolved beyond 90 days",
    "🔴 Material misstatements in 3 ministry financial statements",
    "✅ 12 prior-year recommendations fully implemented",
  ],
  fraud: [
    "🔴 23 active fraud alerts — 4 ghost vendor transactions this week",
    "⚠️ Bid rigging detected: 48 cases, $84.2M estimated loss",
    "🔴 Inflated contracts: 124 cases, $312.8M in losses",
    "📌 AI fraud engine: 124 alerts/month average",
  ],
  corruption: [
    "🔴 Estimated corruption losses: $798M per year",
    "⚠️ Spec tailoring cases: +41% year-on-year — highest risk",
    "🔴 PEP (politically exposed) vendor awards: 18 new cases",
    "✅ Beneficial ownership disclosure portal: 18 cases detected",
  ],
};

// ── Mock data for charts ───────────────────────────────────────────────────
const REVENUE_DATA = [
  { month: "Jan", target: 890, actual: 812 }, { month: "Feb", target: 890, actual: 847 },
  { month: "Mar", target: 890, actual: 923 }, { month: "Apr", target: 920, actual: 874 },
  { month: "May", target: 920, actual: 901 }, { month: "Jun", target: 950, actual: 988 },
];
const BUDGET_DATA = [
  { name: "Transport", budget: 620, spent: 578 }, { name: "Health", budget: 480, spent: 392 },
  { name: "Education", budget: 380, spent: 291 }, { name: "Energy", budget: 320, spent: 184 },
  { name: "Agriculture", budget: 290, spent: 312 }, { name: "Water", budget: 240, spent: 318 },
];
const DEBT_TREND = [
  { year: "2022", debt: 68.2 }, { year: "2023", debt: 72.4 },
  { year: "2024", debt: 76.8 }, { year: "2025", debt: 79.1 }, { year: "2026", debt: 82.6 },
];
const FRAUD_TYPES = [
  { name: "Inflated Contracts", value: 312.8 }, { name: "Spec Tailoring", value: 142.1 },
  { name: "Bid Rigging", value: 84.2 }, { name: "Ghost Vendors", value: 28.4 },
  { name: "Method Abuse", value: 98.4 }, { name: "PEP Awards", value: 48.6 },
];
const PAYROLL_DATA = [
  { month: "Jan", payroll: 180, budget: 165 }, { month: "Feb", payroll: 182, budget: 165 },
  { month: "Mar", payroll: 184, budget: 165 }, { month: "Apr", payroll: 186, budget: 165 },
  { month: "May", payroll: 185, budget: 165 }, { month: "Jun", payroll: 188, budget: 165 },
];
const PROCUREMENT_MIX = [
  { name: "Open Tender", value: 38 }, { name: "RFQ", value: 24 },
  { name: "Direct", value: 10 }, { name: "EOI", value: 9 },
  { name: "RFP", value: 12 }, { name: "Auction", value: 7 },
];

// ── Tooltip style ──────────────────────────────────────────────────────────
const tt = {
  contentStyle: {
    background: "#0f172a", border: "1px solid #ffffff15",
    borderRadius: 8, fontSize: 11, color: "#fff",
  },
};

// ── Scroll Alert Ticker ────────────────────────────────────────────────────
function ScrollTicker({ alerts, running }: { alerts: string[]; running: boolean }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setIdx(i => (i + 1) % alerts.length), 4000);
    return () => clearInterval(id);
  }, [running, alerts.length]);
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0f172a] rounded-lg overflow-hidden">
      <Wifi className="h-3.5 w-3.5 text-slate-500 flex-shrink-0 animate-pulse" />
      <div className="flex-1 overflow-hidden">
        <div key={idx} className="text-xs text-slate-400 font-medium animate-pulse truncate">
          {alerts[idx]}
        </div>
      </div>
    </div>
  );
}

// ── KPI card ───────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, color = "blue", Icon, trend,
}: {
  label: string; value: string; sub?: string;
  color?: "blue"|"green"|"amber"|"red"|"violet"|"teal";
  Icon?: React.ElementType; trend?: "up"|"down"|"neutral";
}) {
  const colors = {
    blue:   "bg-slate-50 text-[#0F172A] border-slate-200",
    green:  "bg-slate-50 text-[#0F172A] border-slate-200",
    amber:  "bg-slate-50 text-[#0F172A] border-slate-200",
    red:    "bg-red-50 text-red-700 border-red-200",
    violet: "bg-slate-50 text-[#0F172A] border-slate-200",
    teal:   "bg-slate-50 text-slate-500 border-slate-200",
  };
  return (
    <div className={`rounded-xl p-3 border ${colors[color]} flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</span>
        {Icon && <Icon className="h-4 w-4 opacity-60" />}
      </div>
      <div className="text-xl font-black tracking-tight">{value}</div>
      {sub && (
        <div className="flex items-center gap-1 text-[10px] opacity-70">
          {trend === "up" && <TrendingUp className="h-3 w-3" />}
          {trend === "down" && <TrendingDown className="h-3 w-3" />}
          <span>{sub}</span>
        </div>
      )}
    </div>
  );
}

// ── Panel definitions ──────────────────────────────────────────────────────
const BRIEF_PANELS = [
  { id: "priority",    label: "Priority Brief",          icon: AlertOctagon,  color: "red"    as const },
  { id: "cabinet",     label: "Cabinet Brief",           icon: Building2,     color: "blue"   as const },
  { id: "parliament",  label: "Parliament Brief",        icon: FileText,      color: "violet" as const },
  { id: "emergency",   label: "Emergency Brief",         icon: Flame,         color: "red"    as const },
  { id: "economic",    label: "National Economic Brief", icon: TrendingUp,    color: "teal"   as const },
  { id: "revenue",     label: "Revenue Brief",           icon: DollarSign,    color: "green"  as const },
  { id: "budget",      label: "Budget Brief",            icon: BarChart3,     color: "blue"   as const },
  { id: "project",     label: "Project Brief",           icon: Activity,      color: "amber"  as const },
  { id: "procurement", label: "Procurement Brief",       icon: Package,       color: "blue"   as const },
  { id: "debt",        label: "Debt Brief",              icon: AlertTriangle, color: "red"    as const },
  { id: "payroll",     label: "Payroll Brief",           icon: Users,         color: "violet" as const },
  { id: "citizen",     label: "Citizen Services Brief",  icon: CheckCircle2,  color: "teal"   as const },
  { id: "audit",       label: "Audit Brief",             icon: ShieldAlert,   color: "amber"  as const },
  { id: "fraud",       label: "Fraud Brief",             icon: AlertOctagon,  color: "red"    as const },
  { id: "corruption",  label: "Corruption Risk Brief",   icon: ShieldAlert,   color: "red"    as const },
] as const;

type PanelId = typeof BRIEF_PANELS[number]["id"];

// ── Brief Detail Panel (Report / Resolutions / Minutes / Attachments) ─────
type BriefSubTab = "report" | "resolutions" | "minutes" | "attachments";

function BriefDetailPanel({ panelId, panelLabel }: { panelId: string; panelLabel: string }) {
  const [activeTab, setActiveTab] = useState<BriefSubTab>("report");
  const [chatMsg, setChatMsg] = useState("");
  const [chats, setChats] = useState([
    { author: "Cabinet Secretary", text: "Please ensure the risk section is updated before the next sitting.", time: "08:30", mine: false },
    { author: "You", text: "Noted. Updated version will be ready by 10:00.", time: "08:45", mine: true },
  ]);

  const docs = buildBriefDocs(panelId);
  const resolutions = buildBriefResolutions(panelId);
  const minutes = buildBriefMinutes(panelId);

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChats(p => [...p, {
      author: "You", text: chatMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      mine: true,
    }]);
    setChatMsg("");
  };

  const TABS: { id: BriefSubTab; label: string; Icon: React.ElementType }[] = [
    { id: "report",       label: "Report",       Icon: FileText     },
    { id: "resolutions",  label: "Resolutions",  Icon: ListChecks   },
    { id: "minutes",      label: "Minutes",      Icon: Clock        },
    { id: "attachments",  label: "Attachments",  Icon: Paperclip    },
  ];

  return (
    <div className="mt-4 border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#0f172a] text-white">
        <FileText className="h-4 w-4 opacity-70 flex-shrink-0" />
        <span className="text-sm font-semibold">{panelLabel} — Briefing Documents</span>
      </div>

      {/* Metadata strip */}
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase block">Prepared By</span>
            <span className="text-gray-700">Treasury — Analytics Unit</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase block">Date &amp; Time</span>
            <span className="text-gray-700">2026-07-14 · 09:00</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase block">Pages</span>
            <span className="text-gray-700">8 pages</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase block">Status</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-[#0F172A]">Pending</span>
          </div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex border-b border-gray-100">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold border-b-2 -mb-px transition-colors flex-1 justify-center
              ${activeTab === id ? "border-slate-200 text-[#0F172A]" : "border-transparent text-gray-400 hover:text-gray-700"}`}>
            <Icon className="h-3 w-3" />{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 py-3 max-h-72 overflow-y-auto">
        {activeTab === "report" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              This {panelLabel.toLowerCase()} covers national performance indicators, key deliverables, and outstanding
              action items for the current financial year. The report was prepared by the Treasury Analytics Unit and
              submitted for executive review on 2026-07-14.
            </p>
            {/* Details section */}
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Details</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                {[
                  { label: "Report Reference", value: `PB-${panelId.toUpperCase()}-2026-07` },
                  { label: "Classification", value: "CONFIDENTIAL — Executive Use Only" },
                  { label: "Reporting Period", value: "FY 2026 — H1 (Jan–Jun)" },
                  { label: "Next Review Date", value: "2026-07-28" },
                  { label: "Ministry / Entity", value: "Ministry of Finance & Economic Development" },
                  { label: "Approved By", value: "Cabinet Secretary — Office of the President" },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-gray-200 rounded p-3 bg-white m-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</label>
                    <div className="text-xs text-gray-800">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-[#0F172A]">
              <div className="font-bold mb-1">Key Highlights</div>
              <ul className="space-y-1 list-disc list-inside">
                <li>All major KPIs assessed against approved annual targets</li>
                <li>3 critical thresholds breached — immediate executive action required</li>
                <li>Fraud detection engine flagged 23 new cases this week</li>
                <li>Budget absorption at 67.8% — 7.2% below target pace</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A]">
                <Download className="h-3.5 w-3.5" /> Download Report
              </button>
            </div>
          </div>
        )}

        {activeTab === "resolutions" && (
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Resolutions Passed</div>
            {resolutions.map((r, i) => (
              <div key={i} className="flex gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="h-5 w-5 rounded-full bg-[#0F172A] text-white text-[10px] font-bold grid place-items-center flex-shrink-0">{i + 1}</span>
                <span className="text-xs text-gray-700">{r}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "minutes" && (
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Meeting Minutes</div>
            {minutes.map((m, i) => (
              <div key={i} className="flex gap-2 text-xs py-1 border-b border-gray-50 last:border-0">
                <span className="font-mono text-gray-400 flex-shrink-0 w-12">{m.time}</span>
                <span className="text-gray-700">{m.item}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "attachments" && (
          <div className="space-y-2">
            {docs.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`h-7 w-7 rounded-lg grid place-items-center flex-shrink-0
                    ${a.type === "pdf" ? "bg-red-100 text-red-600" : "bg-slate-100 text-[#0F172A]"}`}>
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-700 truncate">{a.name}</div>
                    <div className="text-[10px] text-gray-400">{a.size} · {a.date}</div>
                  </div>
                </div>
                <button className="h-6 w-6 rounded-lg hover:bg-slate-100 text-gray-400 hover:text-[#0F172A] grid place-items-center flex-shrink-0 transition-colors">
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {/* Comments / chat */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Questions / Comments
              </div>
              <div className="space-y-2 mb-2 max-h-28 overflow-y-auto">
                {chats.map((c, i) => (
                  <div key={i} className={`flex gap-2 ${c.mine ? "flex-row-reverse" : ""}`}>
                    <div className={`h-5 w-5 rounded-full text-[9px] font-bold grid place-items-center flex-shrink-0 ${c.mine ? "bg-[#0F172A] text-white" : "bg-gray-200 text-gray-600"}`}>
                      {c.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div className={`flex flex-col ${c.mine ? "items-end" : "items-start"} max-w-[80%]`}>
                      {!c.mine && <span className="text-[9px] text-gray-400 mb-0.5">{c.author}</span>}
                      <div className={`px-2.5 py-1.5 text-[11px] rounded-xl ${c.mine ? "bg-[#0F172A] text-white" : "bg-gray-100 text-gray-800"}`}>{c.text}</div>
                      <span className="text-[9px] text-gray-400 mt-0.5">{c.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), sendChat())}
                  placeholder="Send a comment…"
                  className="flex-1 h-7 px-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20" />
                <button onClick={sendChat} className="h-7 w-7 bg-[#0F172A] text-white rounded-lg grid place-items-center hover:bg-[#0F172A]">
                  <Send className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Panel content renderer ─────────────────────────────────────────────────
function PanelContent({ id }: { id: PanelId }) {
  const panelLabel = BRIEF_PANELS.find(p => p.id === id)?.label ?? "";
  if (id === "priority") return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="National Spend YTD" value="$2.84B" sub="+6.2% vs last year" color="blue" Icon={DollarSign} trend="up" />
        <KpiCard label="Fraud Alerts Active" value="23" sub="4 ghost vendor this week" color="red" Icon={AlertOctagon} trend="up" />
        <KpiCard label="Budget Utilisation" value="67.8%" sub="vs 75% target pace" color="amber" Icon={BarChart3} trend="down" />
        <KpiCard label="Public Debt / GDP" value="82.6%" sub="🔴 Threshold 70% breached" color="red" Icon={AlertTriangle} trend="up" />
      </div>
      <div className="bg-white border border-black/8 rounded-xl p-4">
        <div className="text-xs font-bold text-black/50 uppercase tracking-wider mb-3">Top Priority Issues — Requiring Immediate Executive Attention</div>
        <div className="space-y-2">
          {[
            { sev: "critical", msg: "Foreign reserves at 1.8 months — minimum 3 months required for fiscal stability" },
            { sev: "critical", msg: "3 ministries over budget: Water 132%, Agriculture 108%, Home Affairs 117%" },
            { sev: "high",     msg: "Ghost vendor payments — 31 cases detected, USD 28.4M at risk of loss" },
            { sev: "high",     msg: "Spec tailoring cases up 41% YoY — procurement integrity at risk" },
            { sev: "medium",   msg: "Budget absorption only 38% vs 50% target for Q2 — underspending in capital projects" },
            { sev: "medium",   msg: "147 infrastructure projects abandoned or stalled — USD 418M idle investment" },
          ].map((item, i) => (
            <div key={i} className={`flex items-start gap-2.5 px-3 py-2 rounded-lg text-xs
              ${item.sev === "critical" ? "bg-red-50 text-red-800 border border-red-200"
              : item.sev === "high" ? "bg-slate-50 text-[#0F172A] border border-slate-200"
              : "bg-slate-50 text-[#0F172A] border border-slate-200"}`}>
              <span className="font-bold uppercase text-[10px] flex-shrink-0 mt-0.5">
                {item.sev === "critical" ? "🔴 CRITICAL" : item.sev === "high" ? "🟡 HIGH" : "🔵 MEDIUM"}
              </span>
              <span>{item.msg}</span>
            </div>
          ))}
        </div>
      </div>
      <BriefDetailPanel panelId={id} panelLabel={panelLabel} />
    </div>
  );
  if (id === "cabinet") return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Pending Cabinet Items" value="3" sub="Finance, Transport, Health" color="amber" Icon={FileText} />
        <KpiCard label="Resolutions This Year" value="47" sub="38 implemented, 9 pending" color="blue" Icon={CheckCircle2} />
        <KpiCard label="Overdue Resolutions" value="2" sub=">30 days without implementation" color="red" Icon={Clock} />
        <KpiCard label="Next Cabinet Sitting" value="Jul 24" sub="Budget policy statement" color="violet" Icon={Building2} />
      </div>
      <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-black/8 bg-[#f8fafc]">
          <div className="text-xs font-bold text-black/60 uppercase tracking-wider">Recent Cabinet Resolutions — Status Tracker</div>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-[#f1f5f9] text-black/50">
            <tr>{["Resolution", "Date", "Ministry", "Status", "Days"].map(h => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {[
              { res: "24/2026 — Infrastructure Levy", date: "Jun 15", min: "Finance", status: "Implemented", days: 18 },
              { res: "23/2026 — Drug Import Waiver", date: "Jun 10", min: "Health", status: "In Progress", days: 23 },
              { res: "22/2026 — Civil Service Pay Review", date: "May 28", min: "Public Service", status: "Overdue", days: 51 },
              { res: "21/2026 — Road Levy Amendment", date: "May 14", min: "Transport", status: "Overdue", days: 65 },
              { res: "20/2026 — SOE Dividend Policy", date: "Apr 30", min: "Finance", status: "Implemented", days: 79 },
            ].map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-medium text-black">{r.res}</td>
                <td className="px-3 py-2 text-black/50">{r.date}</td>
                <td className="px-3 py-2 text-black/70">{r.min}</td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold
                    ${r.status === "Implemented" ? "bg-slate-100 text-[#0F172A]"
                    : r.status === "In Progress" ? "bg-slate-100 text-[#0F172A]"
                    : "bg-red-100 text-red-700"}`}>{r.status}</span>
                </td>
                <td className={`px-3 py-2 font-mono font-bold ${r.days > 50 ? "text-red-600" : "text-black/60"}`}>{r.days}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BriefDetailPanel panelId={id} panelLabel={panelLabel} />
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#0F172A]">
        <strong>{panelLabel}</strong> — live data panel active. Scroll alerts are updating above.
      </div>
      <GenericBriefPanel id={id} />
      <BriefDetailPanel panelId={id} panelLabel={panelLabel} />
    </div>
  );
}

// ── Generic panel for remaining 13 brief types ─────────────────────────────
function GenericBriefPanel({ id }: { id: PanelId }) {
  const configs: Record<string, { kpis: { label: string; value: string; sub?: string; color: "blue"|"green"|"amber"|"red"|"violet"|"teal" }[]; chartTitle: string; chartData: { name: string; value: number; prev?: number }[] }> = {
    parliament: {
      kpis: [
        { label: "Questions to Min. Finance", value: "14", sub: "8 answered, 6 pending", color: "amber" },
        { label: "Bills Tabled", value: "7", sub: "3 passed, 4 in committee", color: "blue" },
        { label: "Supplementary Budget", value: "$4.8B", sub: "ZWG — tabled for approval", color: "violet" },
        { label: "Overdue Answers", value: "3", sub: ">21 days without response", color: "red" },
      ],
      chartTitle: "Parliamentary Questions by Ministry",
      chartData: [
        { name: "Finance", value: 14 }, { name: "Health", value: 9 },
        { name: "Transport", value: 7 }, { name: "Education", value: 6 },
        { name: "Water", value: 5 }, { name: "Energy", value: 4 },
      ],
    },
    emergency: {
      kpis: [
        { label: "Active Emergencies", value: "3", sub: "Cyclone, Drug shortage, Road", color: "red" },
        { label: "Emergency Procurement", value: "2", sub: "Active orders in progress", color: "amber" },
        { label: "Affected Population", value: "420K", sub: "Across 3 provinces", color: "red" },
        { label: "Response Budget Used", value: "$2.4M", sub: "of $5M emergency fund", color: "blue" },
      ],
      chartTitle: "Emergency Fund Utilisation by Type",
      chartData: [
        { name: "Disaster Relief", value: 840 }, { name: "Drug Supply", value: 620 },
        { name: "Infrastructure", value: 480 }, { name: "Food Aid", value: 340 },
        { name: "Equipment", value: 120 },
      ],
    },
    economic: {
      kpis: [
        { label: "Inflation Rate", value: "34.8%", sub: "Food basket +41% YoY", color: "red" },
        { label: "GDP Growth", value: "3.2%", sub: "Target: 5%+", color: "amber" },
        { label: "Unemployment", value: "19.4%", sub: "Youth: 38%", color: "red" },
        { label: "Foreign Reserves", value: "1.8 mo", sub: "Min 3 months required", color: "red" },
      ],
      chartTitle: "Key Economic Indicators — Current vs Target",
      chartData: [
        { name: "GDP Growth%", value: 3.2, prev: 5.0 },
        { name: "Inflation%", value: 34.8, prev: 10.0 },
        { name: "Unemployment%", value: 19.4, prev: 10.0 },
        { name: "Debt/GDP%", value: 82.6, prev: 70.0 },
      ],
    },
    revenue: {
      kpis: [
        { label: "H1 Revenue Collected", value: "$5.34B", sub: "vs $5.83B target", color: "amber" },
        { label: "VAT Collections", value: "$1.42B", sub: "+8% vs last year", color: "green" },
        { label: "PAYE/Income Tax", value: "$1.18B", sub: "Largest single source", color: "blue" },
        { label: "Revenue Shortfall", value: "$490M", sub: "H1 2026 gap", color: "red" },
      ],
      chartTitle: "Monthly Revenue vs Target (USD M)",
      chartData: REVENUE_DATA.map(d => ({ name: d.month, value: d.actual, prev: d.target })),
    },
    budget: {
      kpis: [
        { label: "Approved Budget", value: "$3.4B", sub: "FY2026 total", color: "blue" },
        { label: "Utilised to Date", value: "67.8%", sub: "$2.31B spent", color: "amber" },
        { label: "Over-budget Ministries", value: "3", sub: "Water, Agri, Home Affairs", color: "red" },
        { label: "Savings Achieved", value: "$184M", sub: "6.5% of spend YTD", color: "green" },
      ],
      chartTitle: "Ministry Budget vs Actual Spend (USD M)",
      chartData: BUDGET_DATA.map(d => ({ name: d.name, value: d.spent, prev: d.budget })),
    },
    project: {
      kpis: [
        { label: "Active Projects", value: "1,487", sub: "Valued at USD 14.2B", color: "blue" },
        { label: "On Time & On Budget", value: "19%", sub: "Only 284 of 1,487", color: "red" },
        { label: "Stalled Projects", value: "147", sub: "USD 418M idle", color: "red" },
        { label: "Avg Cost Overrun", value: "43%", sub: "Above original contract", color: "amber" },
      ],
      chartTitle: "Project Delivery Status Distribution",
      chartData: [
        { name: "On Time/Budget", value: 19 }, { name: "Delayed <6m", value: 28 },
        { name: "Delayed 6-24m", value: 21 }, { name: "Delayed >24m", value: 12 },
        { name: "Cost Overrun>25%", value: 10 }, { name: "Abandoned", value: 10 },
      ],
    },
    procurement: {
      kpis: [
        { label: "Active Tenders", value: "1,287", sub: "Across all ministries", color: "blue" },
        { label: "Open Tenders", value: "412", sub: "Bidding in progress", color: "green" },
        { label: "Under Evaluation", value: "187", sub: "Awaiting committee review", color: "amber" },
        { label: "Fraud/Risk Cases", value: "93", sub: "Method abuse detected", color: "red" },
      ],
      chartTitle: "Procurement Method Distribution (%)",
      chartData: PROCUREMENT_MIX,
    },
    debt: {
      kpis: [
        { label: "Debt / GDP Ratio", value: "82.6%", sub: "🔴 Threshold 70% breached", color: "red" },
        { label: "External Debt", value: "$7.8B", sub: "USD-denominated", color: "red" },
        { label: "Domestic Debt", value: "$4.2B", sub: "T-bills & bonds", color: "amber" },
        { label: "Debt Service Cost", value: "28%", sub: "Of total revenue consumed", color: "red" },
      ],
      chartTitle: "Public Debt / GDP Trend (%)",
      chartData: DEBT_TREND.map(d => ({ name: d.year, value: d.debt })),
    },
    payroll: {
      kpis: [
        { label: "Civil Service Payroll", value: "42%", sub: "Of total govt expenditure", color: "red" },
        { label: "Ghost Workers Found", value: "284", sub: "Q1 2026 audit finding", color: "red" },
        { label: "Monthly Payroll Cost", value: "$188M", sub: "vs $165M budget", color: "amber" },
        { label: "SOEs Payroll Arrears", value: "3", sub: "60+ days PAYE outstanding", color: "red" },
      ],
      chartTitle: "Monthly Payroll vs Budget (USD M)",
      chartData: PAYROLL_DATA.map(d => ({ name: d.month, value: d.payroll, prev: d.budget })),
    },
    citizen: {
      kpis: [
        { label: "Hospital Wait Time", value: "6.4 hrs", sub: "vs 2-hr benchmark", color: "red" },
        { label: "Drug Stockout Rate", value: "62%", sub: "Public health facilities", color: "red" },
        { label: "Clean Water Access", value: "38%", sub: "Rural — 52% unserved", color: "amber" },
        { label: "ZESA Uptime", value: "54%", sub: "41% load-shedding", color: "red" },
      ],
      chartTitle: "Citizen Service Gaps — Current vs Standard",
      chartData: [
        { name: "Hospital Wait (hrs)", value: 6.4, prev: 2.0 },
        { name: "Water Access %", value: 38, prev: 90 },
        { name: "ZESA Uptime %", value: 54, prev: 95 },
        { name: "Drug Availability %", value: 38, prev: 95 },
      ],
    },
    audit: {
      kpis: [
        { label: "Active Investigations", value: "141", sub: "Across 8 ministries", color: "red" },
        { label: "Unresolved >90 days", value: "48", sub: "Audit findings overdue", color: "red" },
        { label: "Material Misstatements", value: "3", sub: "Ministry financial statements", color: "red" },
        { label: "Implemented Recs", value: "12", sub: "Prior year recommendations done", color: "green" },
      ],
      chartTitle: "Audit Findings by Ministry",
      chartData: [
        { name: "Transport", value: 32 }, { name: "Health", value: 28 },
        { name: "Education", value: 19 }, { name: "Finance", value: 14 },
        { name: "Energy", value: 12 }, { name: "Water", value: 24 },
        { name: "Agri", value: 12 },
      ],
    },
    fraud: {
      kpis: [
        { label: "Active Fraud Alerts", value: "23", sub: "4 ghost vendor this week", color: "red" },
        { label: "Ghost Vendor Cases", value: "31", sub: "USD 28.4M at risk", color: "red" },
        { label: "Bid Rigging Cases", value: "48", sub: "+18% year-on-year", color: "red" },
        { label: "AI Fraud Detections", value: "124/mo", sub: "Average per month", color: "amber" },
      ],
      chartTitle: "Estimated Fraud Losses by Category (USD M)",
      chartData: FRAUD_TYPES.map(f => ({ name: f.name, value: f.value })),
    },
    corruption: {
      kpis: [
        { label: "Annual Corruption Loss", value: "$798M", sub: "Conservative estimate", color: "red" },
        { label: "Spec Tailoring Cases", value: "67", sub: "+41% YoY — top risk", color: "red" },
        { label: "PEP Awards", value: "18", sub: "Politically exposed entities", color: "red" },
        { label: "ZACC Referrals", value: "48", sub: "Referred for prosecution", color: "amber" },
      ],
      chartTitle: "Corruption Loss by Typology (USD M)",
      chartData: FRAUD_TYPES.map(f => ({ name: f.name, value: f.value })),
    },
  };
  const cfg = configs[id];
  if (!cfg) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cfg.kpis.map((k, i) => <KpiCard key={i} {...k} />)}
      </div>
      <div className="bg-white border border-black/8 rounded-xl p-4">
        <div className="text-xs font-bold text-black/50 uppercase tracking-wider mb-3">{cfg.chartTitle}</div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cfg.chartData} margin={{ top: 2, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip {...tt} />
              <Bar dataKey="value" name="Current" fill={C.blue} radius={[3, 3, 0, 0]} />
              {cfg.chartData[0]?.prev !== undefined && (
                <Bar dataKey="prev" name="Target/Prior" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────
export default function PriorityBriefTab() {
  const [activePanel, setActivePanel] = useState<PanelId>("priority");
  const [ministry, setMinistry] = useState("All Ministries");
  const [financialYear, setFinancialYear] = useState("FY 2026");
  const [department, setDepartment] = useState("All Departments");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) setShowScrollTop(el.scrollTop > 120);
  }, []);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // AI briefing text for current panel
  const panelLabel = BRIEF_PANELS.find(p => p.id === activePanel)?.label ?? "";
  const aiBriefing = `AI Analysis: ${panelLabel} shows critical thresholds requiring immediate executive attention. Three high-priority items detected with actionable recommendations.`;

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#f8fafc]">
      {/* Sub-tab panel selector */}
      <div className="flex-shrink-0 bg-white border-b border-black/8 overflow-x-auto">
        <div className="flex px-3 py-1.5 gap-0.5 min-w-max">
          {BRIEF_PANELS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActivePanel(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap rounded-lg transition-colors
                ${activePanel === id ? "bg-[#0f172a] text-white" : "text-black/50 hover:text-black hover:bg-black/5"}`}>
              <Icon className="h-3 w-3 flex-shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter bar — Ministry / Financial Year / Department */}
      <div className="flex-shrink-0 bg-white border-b border-black/8 px-4 py-2 flex flex-wrap items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">Filters:</span>

        {/* Ministry */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Ministry</label>
          <select value={ministry} onChange={e => setMinistry(e.target.value)}
            className="h-7 px-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20 min-w-[180px]">
            {MINISTRIES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        {/* Financial Year */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Financial Year</label>
          <select value={financialYear} onChange={e => setFinancialYear(e.target.value)}
            className="h-7 px-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20">
            {FINANCIAL_YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        {/* Department */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Department</label>
          <select value={department} onChange={e => setDepartment(e.target.value)}
            className="h-7 px-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20 min-w-[160px]">
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        {/* Active filter chips */}
        <div className="flex items-center gap-1.5 ml-auto flex-wrap">
          {ministry !== "All Ministries" && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-[#0F172A] text-[10px] font-semibold rounded-full">
              {ministry.split(" ")[0]}…
              <button onClick={() => setMinistry("All Ministries")} className="hover:text-red-600 ml-0.5">×</button>
            </span>
          )}
          {financialYear !== "FY 2026" && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-[#0F172A] text-[10px] font-semibold rounded-full">
              {financialYear}
              <button onClick={() => setFinancialYear("FY 2026")} className="hover:text-red-600 ml-0.5">×</button>
            </span>
          )}
          {department !== "All Departments" && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-[#0F172A] text-[10px] font-semibold rounded-full">
              {department.split(" ")[0]}…
              <button onClick={() => setDepartment("All Departments")} className="hover:text-red-600 ml-0.5">×</button>
            </span>
          )}
        </div>
      </div>

      {/* AI Briefing Information Bar with Audio Toggle */}
      <div className="flex-shrink-0 bg-[#0f172a] border-b border-slate-200/20 px-4 py-2 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-[#0F172A] grid place-items-center flex-shrink-0">
          <AlertTriangle className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white italic">{aiBriefing}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="px-1.5 py-0.5 bg-[#0F172A] text-white text-[9px] font-bold rounded">PRIORITY</span>
            <span className="text-[10px] text-slate-400">Updated 2 minutes ago</span>
          </div>
        </div>
        <button
          onClick={() => setAudioEnabled(!audioEnabled)}
          className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
            audioEnabled ? "bg-[#0F172A] text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
          }`}
          title={audioEnabled ? "Disable AI Audio" : "Enable AI Audio"}
        >
          {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
      </div>

      {/* Panel content */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 relative">
        <PanelContent id={activePanel} />
      </div>

      {/* Scroll-to-top bar */}
      {showScrollTop && (
        <div className="flex-shrink-0 border-t border-black/8 bg-white">
          <button onClick={scrollToTop}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors">
            <ArrowUp className="h-3.5 w-3.5" />
            Scroll to top
          </button>
        </div>
      )}

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        agentName="Priority Brief AI"
        agentRole="Executive briefing analysis and recommendations"
        context={`${panelLabel} analysis`}
        suggestedPrompts={[
          "Summarize the top 3 critical issues",
          "What actions should I prioritize today?",
          "Generate executive summary report",
          "Show historical trends for this brief",
          "Which ministries need immediate attention?",
        ]}
        color="amber"
      />
    </div>
  );
}
