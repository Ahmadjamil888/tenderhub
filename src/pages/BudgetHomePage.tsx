/**
 * BudgetHomePage — Budget Module Entry Point
 * 4 focal tiles: 1. Tower  2. Create Budget  3. Budget Reports  4. Budget Admin Workbench
 * Each tile opens a full-screen view. Inside each view, a ministry list on the left
 * lets users drill into per-ministry budget details.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, PageContextBar } from "@/components/AppShell";
import BudgetIntelligenceCentre from "@/components/BudgetIntelligenceCentre";
import LifecycleTower from "@/components/LifecycleTower";
import { BUDGET_STAGES } from "@/lib/lifecycle-stages";
import {
  Wallet, Layers, FileText, Settings, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, BarChart3,
  Building2, Plus, Download, Eye, Lock, Target, DollarSign,
  Activity, Zap, ShieldCheck, Flag, Clock, Search, ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

// ── Ministry list ────────────────────────────────────────────────────────
const MINISTRIES = [
  { id: "mof",   name: "Ministry of Finance & Economic Development", short: "Finance",    budget: "USD 840M",  spent: "USD 481M", pct: 57, status: "On Track"   },
  { id: "moh",   name: "Ministry of Health & Child Care",            short: "Health",     budget: "USD 820M",  spent: "USD 574M", pct: 70, status: "On Track"   },
  { id: "moe",   name: "Ministry of Education",                      short: "Education",  budget: "USD 510M",  spent: "USD 292M", pct: 57, status: "On Track"   },
  { id: "mot",   name: "Ministry of Transport",                      short: "Transport",  budget: "USD 640M",  spent: "USD 558M", pct: 87, status: "At Risk"    },
  { id: "moag",  name: "Ministry of Agriculture",                    short: "Agriculture",budget: "USD 380M",  spent: "USD 196M", pct: 52, status: "On Track"   },
  { id: "moict", name: "Ministry of ICT",                            short: "ICT",        budget: "USD 180M",  spent: "USD 115M", pct: 64, status: "On Track"   },
  { id: "moenrg",name: "Ministry of Energy",                         short: "Energy",     budget: "USD 420M",  spent: "USD 361M", pct: 86, status: "Warning"    },
  { id: "mow",   name: "Ministry of Water",                          short: "Water",      budget: "USD 310M",  spent: "USD 208M", pct: 67, status: "On Track"   },
  { id: "moha",  name: "Ministry of Home Affairs",                   short: "Home Affairs",budget: "USD 240M", spent: "USD 168M", pct: 70, status: "On Track"   },
  { id: "moland",name: "Ministry of Lands",                          short: "Lands",      budget: "USD 160M",  spent: "USD 88M",  pct: 55, status: "On Track"   },
  { id: "zimra", name: "ZIMRA",                                      short: "ZIMRA",      budget: "USD 180M",  spent: "USD 126M", pct: 70, status: "On Track"   },
  { id: "zinara",name: "ZINARA",                                     short: "ZINARA",     budget: "USD 95M",   spent: "USD 76M",  pct: 80, status: "Warning"    },
];

// ── Shared chart/table data ───────────────────────────────────────────────
const BURN_TREND = [
  { month: "Jan", budget: 850, actual: 620 }, { month: "Feb", budget: 850, actual: 680 },
  { month: "Mar", budget: 850, actual: 720 }, { month: "Apr", budget: 850, actual: 760 },
  { month: "May", budget: 850, actual: 810 }, { month: "Jun", budget: 850, actual: 855 },
  { month: "Jul", budget: 850, actual: 0   }, { month: "Aug", budget: 850, actual: 0   },
];
const TIP = { contentStyle: { background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 } };

// ── Status badge helper ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const c: Record<string, string> = {
    "On Track": "bg-slate-100 text-[#0F172A]",
    "Warning":  "bg-slate-100 text-[#0F172A]",
    "At Risk":  "bg-red-100 text-red-700",
    "Critical": "bg-red-200 text-red-800 font-bold",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${c[status] ?? "bg-gray-100 text-gray-600"}`}>{status}</span>;
}

// ── Ministry sidebar ──────────────────────────────────────────────────────
function MinistrySidebar({
  selected, onSelect,
}: { selected: string; onSelect: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = MINISTRIES.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.short.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="w-60 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col h-full">
      <div className="px-3 pt-3 pb-2 border-b border-gray-100">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Ministries & Entities</div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="w-full h-7 pl-7 pr-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map(m => (
          <button key={m.id} onClick={() => onSelect(m.id)}
            className={`w-full text-left px-3 py-2.5 border-b border-gray-50 transition-colors ${
              selected === m.id ? "bg-[#0f172a] text-white" : "hover:bg-slate-50/60 text-gray-800"
            }`}>
            <div className={`text-xs font-semibold truncate ${selected === m.id ? "text-white" : "text-gray-900"}`}>{m.short}</div>
            <div className="flex items-center justify-between mt-0.5 gap-1">
              <div className={`flex-1 h-1 rounded-full overflow-hidden ${selected === m.id ? "bg-white/20" : "bg-gray-100"}`}>
                <div className={`h-full rounded-full ${m.pct >= 85 ? "bg-red-400" : m.pct >= 75 ? "bg-slate-400" : "bg-slate-400"}`}
                  style={{ width: `${m.pct}%` }} />
              </div>
              <span className={`text-[9px] font-bold flex-shrink-0 ${selected === m.id ? "text-white/80" : "text-gray-500"}`}>{m.pct}%</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// VIEW 1: TOWER
// ══════════════════════════════════════════════════════════════════════════
function TowerView({ selectedMinistry }: { selectedMinistry: string }) {
  const ministry = MINISTRIES.find(m => m.id === selectedMinistry) ?? MINISTRIES[0];
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
      {/* Ministry title bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-400 uppercase font-bold tracking-widest">Budget Lifecycle Tower</div>
          <div className="text-base font-bold text-gray-900 mt-0.5">{ministry.name}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase">Budget FY2026</div>
            <div className="text-base font-bold text-gray-900">{ministry.budget}</div>
          </div>
          <StatusBadge status={ministry.status} />
        </div>
      </div>
      {/* Tower */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ minHeight: 600 }}>
        <LifecycleTower
          title={`Budget Lifecycle — ${ministry.short}`}
          subtitle="10 stages from formulation through evaluation"
          stages={BUDGET_STAGES}
          context="Budget Management"
          badgeLabel="Budget Lifecycle"
        />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// VIEW 2: CREATE BUDGET
// ══════════════════════════════════════════════════════════════════════════
const CREATE_STEPS = [
  "Budget Call Circular",
  "Department Submissions",
  "Ministry Consolidation",
  "Treasury Review",
  "Cabinet Approval",
  "Parliamentary Vote",
  "Budget Gazettal",
];

function CreateBudgetView({ selectedMinistry }: { selectedMinistry: string }) {
  const ministry = MINISTRIES.find(m => m.id === selectedMinistry) ?? MINISTRIES[0];
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fy: "FY2027", type: "Recurrent", total: "", personnel: "",
    capital: "", grants: "", dept: "", notes: "",
  });

  const lineItems = [
    { label: "Personnel Emoluments",   key: "personnel", placeholder: "e.g. 1,200,000" },
    { label: "Goods & Services",       key: "capital",   placeholder: "e.g. 600,000"   },
    { label: "Capital Projects",       key: "grants",    placeholder: "e.g. 4,500,000" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <div className="text-xs text-gray-400 uppercase font-bold tracking-widest">Create Budget</div>
        <div className="text-base font-bold text-gray-900 mt-0.5">{ministry.name}</div>
        <div className="text-xs text-gray-500 mt-0.5">Formulate and submit annual budget estimates for Treasury review and approval</div>
      </div>

      {/* Stepper */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {CREATE_STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  i < step ? "bg-[#0F172A] text-white" :
                  i === step ? "bg-[#0f172a] text-white" :
                  "border border-gray-300 text-gray-500 bg-white"
                }`}>
                {i < step ? <CheckCircle2 className="h-3 w-3" /> : <span className="h-4 w-4 flex items-center justify-center">{i + 1}</span>}
                <span>{s}</span>
              </button>
              {i < CREATE_STEPS.length - 1 && <div className="h-px w-4 bg-gray-200 flex-shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Form content */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="text-sm font-bold text-gray-800 mb-4">Step {step + 1}: {CREATE_STEPS[step]}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Ministry / Entity",    val: ministry.name,     readOnly: true  },
            { label: "Financial Year",        val: form.fy,           key: "fy"       },
            { label: "Department / Unit",     val: form.dept,         key: "dept"     },
            { label: "Budget Type",           val: form.type,         key: "type"     },
            { label: "Total Estimate (USD)",  val: form.total,        key: "total"    },
            { label: "Notes / Justification", val: form.notes,        key: "notes"    },
          ].map(f => (
            <div key={f.label} className="border border-gray-200 rounded-lg p-3 bg-white">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{f.label}</label>
              {f.readOnly ? (
                <div className="text-sm text-gray-800">{f.val}</div>
              ) : (
                <input value={f.val} onChange={e => setForm(fm => ({ ...fm, [f.key!]: e.target.value }))}
                  className="w-full text-sm text-gray-800 border-none outline-none bg-transparent" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {lineItems.map(li => (
            <div key={li.key} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{li.label}</label>
              <input placeholder={li.placeholder} value={(form as Record<string, string>)[li.key]}
                onChange={e => setForm(fm => ({ ...fm, [li.key]: e.target.value }))}
                className="w-full text-sm text-gray-800 border-none outline-none bg-transparent" />
            </div>
          ))}
        </div>
        {/* Info banner */}
        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex gap-2">
          <AlertTriangle className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#0F172A] italic">All budget submissions are validated against the Budget Call Circular ceilings. AI will flag any line items exceeding approved limits.</p>
        </div>
        {/* Nav buttons */}
        <div className="mt-5 flex justify-between">
          <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50">Save Draft</button>
            {step < CREATE_STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#0F172A] text-white text-sm font-semibold">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#0F172A] text-white text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Submit to Treasury
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// VIEW 3: BUDGET REPORTS
// ══════════════════════════════════════════════════════════════════════════
const REPORT_TABS = ["Consolidated Cash Flow", "Operations", "Supplies", "Works", "Services"] as const;
type ReportTab = typeof REPORT_TABS[number];

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function BudgetReportsView({ selectedMinistry }: { selectedMinistry: string }) {
  const ministry = MINISTRIES.find(m => m.id === selectedMinistry) ?? MINISTRIES[0];
  const [tab, setTab] = useState<ReportTab>("Consolidated Cash Flow");

  const incomeRows = [
    { label: "Government Allocation", annual: 20_000_000, monthly: 1_666_667, type: "income" },
    { label: "Donor Funds",           annual:    800_000, monthly:    66_667, type: "income" },
    { label: "Own Revenue",           annual:    200_000, monthly:    16_667, type: "income" },
    { label: "TOTAL INCOME",          annual: 21_000_000, monthly: 1_750_000, type: "total-in" },
    { label: "Personnel Emoluments",  annual:  1_200_000, monthly:   100_000, type: "expense" },
    { label: "Goods & Services",      annual:    600_000, monthly:    50_000, type: "expense" },
    { label: "Capital Projects",      annual:  4_800_000, monthly:   400_000, type: "expense" },
    { label: "Debt Servicing",        annual:    960_000, monthly:    80_000, type: "expense" },
    { label: "TOTAL EXPENDITURE",     annual:  7_560_000, monthly:   630_000, type: "total-out" },
    { label: "NET POSITION",          annual: 13_440_000, monthly: 1_120_000, type: "net" },
  ];

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rowStyle = (type: string) => {
    if (type === "total-in")  return "bg-[#0F172A] text-white font-bold";
    if (type === "total-out") return "bg-red-700 text-white font-bold";
    if (type === "net")       return "bg-[#0f172a] text-white font-bold text-sm";
    if (type === "income")    return "bg-slate-50/40";
    return "bg-white";
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
      {/* Ministry bar */}
      <div className="bg-[#0f172a] text-white rounded-xl px-5 py-3 mb-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</div>
          <div className="text-base font-bold mt-0.5">{ministry.name}</div>
          <div className="text-slate-400 text-xs">FY2026 · Budget: {ministry.budget} · Spent: {ministry.spent} ({ministry.pct}%)</div>
        </div>
        <div className="flex gap-2">
          <button className="h-8 px-3 border border-white/20 text-white text-xs flex items-center gap-1.5 rounded-lg hover:bg-white/10">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Report tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {REPORT_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${tab === t ? "bg-[#0f172a] text-white shadow" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Consolidated Cash Flow — replaces Income Statement */}
      {tab === "Consolidated Cash Flow" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1a6b3a] text-white">
                  <th className="text-left px-4 py-2.5 text-xs font-bold whitespace-nowrap">LINE ITEM</th>
                  <th className="text-right px-4 py-2.5 text-xs font-bold whitespace-nowrap">ANNUAL TOTAL</th>
                  {MONTHS_SHORT.map(m => <th key={m} className="text-right px-2 py-2.5 text-[10px] font-bold whitespace-nowrap">{m}</th>)}
                </tr>
              </thead>
              <tbody>
                {incomeRows.map((row, i) => (
                  <tr key={i} className={rowStyle(row.type)}>
                    <td className={`px-4 py-2 text-xs whitespace-nowrap ${row.type === "net" || row.type === "total-in" || row.type === "total-out" ? "" : "pl-6"}`}>
                      {row.label}
                    </td>
                    <td className={`px-4 py-2 text-xs text-right font-semibold ${row.type === "total-out" || row.type === "expense" ? "text-red-300" : ""}`}>
                      {row.type === "expense" || row.type === "total-out" ? `(${fmt(row.annual)})` : fmt(row.annual)}
                    </td>
                    {MONTHS_SHORT.map(m => (
                      <td key={m} className={`px-2 py-2 text-[10px] text-right ${row.type === "expense" || row.type === "total-out" ? "text-red-300" : "opacity-80"}`}>
                        {row.type === "expense" || row.type === "total-out" ? `(${fmt(row.monthly)})` : fmt(row.monthly)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Operations — replaces Budget Variance */}
      {tab === "Operations" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1a6b3a] text-white">
                  {["LINE ITEM","APPROVED BUDGET","ACTUAL","VARIANCE","VARIANCE %","STATUS"].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-bold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {incomeRows.filter(r => r.type !== "total-in" && r.type !== "total-out" && r.type !== "net").map((row, i) => {
                  const actual = row.annual * (0.9 + Math.random() * 0.2);
                  const variance = row.annual - actual;
                  const pct = ((variance / row.annual) * 100).toFixed(1);
                  const over = variance < 0;
                  return (
                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50/60" : "bg-white"}>
                      <td className="px-4 py-2.5 text-xs text-gray-900">{row.label}</td>
                      <td className="px-4 py-2.5 text-xs text-right">{fmt(row.annual)}</td>
                      <td className="px-4 py-2.5 text-xs text-right">{fmt(actual)}</td>
                      <td className={`px-4 py-2.5 text-xs text-right font-semibold ${over ? "text-red-600" : "text-[#0F172A]"}`}>
                        {over ? `(${fmt(Math.abs(variance))})` : fmt(variance)}
                      </td>
                      <td className={`px-4 py-2.5 text-xs text-right font-semibold ${over ? "text-red-600" : "text-[#0F172A]"}`}>
                        {over ? `(${Math.abs(Number(pct))}%)` : `${pct}%`}
                      </td>
                      <td className="px-4 py-2.5 text-xs">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${over ? "bg-red-100 text-red-700" : "bg-slate-100 text-[#0F172A]"}`}>
                          {over ? "Over Budget" : "Under Budget"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generic chart view for Supplies, Works, Services tabs */}
      {(tab === "Supplies" || tab === "Works" || tab === "Services") && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-5 w-5 text-[#0f172a]" />
            <div>
              <div className="text-sm font-bold text-gray-900">{tab} — {ministry.short}</div>
              <div className="text-xs text-gray-500">FY2026 · All months</div>
            </div>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={BURN_TREND}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
                <Tooltip {...TIP} formatter={(v: number) => [`USD ${v}M`]} />
                <Area type="monotone" dataKey="budget" stroke="#e2e8f0" fill="#f8fafc" strokeWidth={1.5} name="Budget" />
                <Area type="monotone" dataKey="actual" stroke="#0f172a" fill="#e2e8f0" strokeWidth={2} name="Actual" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// VIEW 4: BUDGET ADMINISTRATION WORKBENCH
// ══════════════════════════════════════════════════════════════════════════
const ADMIN_TABS = [
  "Executive Command", "Budget Centres", "Formulation", "Approval Workflow",
  "Budget Execution", "Commitments", "Expenditure", "Revenue",
  "Treasury & Cash", "Fraud Detection", "Hazard Breakers", "AI Agents", "Budget Intelligence",
] as const;
type AdminTab = typeof ADMIN_TABS[number];

function AdminWorkbenchView({ selectedMinistry }: { selectedMinistry: string }) {
  const ministry = MINISTRIES.find(m => m.id === selectedMinistry) ?? MINISTRIES[0];
  const [tab, setTab] = useState<AdminTab>("Executive Command");

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Inner nav for workbench tabs */}
      <div className="w-48 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
        <div className="p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-2">Administration</div>
          <div className="space-y-0.5">
            {ADMIN_TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  tab === t ? "bg-[#0f172a] text-white" : "text-gray-700 hover:bg-gray-50"
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
        {/* Ministry context */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 uppercase font-bold tracking-widest">{tab}</div>
            <div className="text-sm font-bold text-gray-900 mt-0.5">{ministry.name}</div>
          </div>
          <StatusBadge status={ministry.status} />
        </div>

        {tab === "Budget Intelligence" ? (
          <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
            <BudgetIntelligenceCentre />
          </div>
        ) : (
          /* KPI cards + feature grid for each tab */
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Budget",    val: ministry.budget,    icon: Wallet,        color: "bg-slate-50 text-[#0F172A] border-slate-200"   },
                { label: "Spent YTD",       val: ministry.spent,     icon: TrendingDown,  color: "bg-slate-50 text-[#0F172A] border-slate-200" },
                { label: "Utilisation",     val: `${ministry.pct}%`, icon: BarChart3,     color: "bg-slate-50 text-[#0F172A] border-slate-200"  },
                { label: "Status",          val: ministry.status,    icon: ShieldCheck,   color: "bg-slate-50 text-[#0F172A] border-slate-200"  },
              ].map(k => (
                <div key={k.label} className={`border rounded-xl p-4 ${k.color}`}>
                  <k.icon className="h-5 w-5 mb-1.5 opacity-70" />
                  <div className="text-lg font-bold">{k.val}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5 opacity-70">{k.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-sm font-bold text-gray-800 mb-3">{tab} — {ministry.short}</div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={BURN_TREND.filter(d => d.actual > 0)}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
                    <Tooltip {...TIP} formatter={(v: number) => [`USD ${v}M`]} />
                    <Bar dataKey="budget" fill="#e2e8f0" radius={[3,3,0,0]} name="Budget" />
                    <Bar dataKey="actual" fill="#0f172a" radius={[3,3,0,0]} name="Actual" />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Action buttons */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["View Full Report", "Download PDF", "Submit for Review", "Compare Periods", "AI Analysis", "Audit Trail"].map(action => (
                <button key={action}
                  className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-[#0f172a] hover:text-white hover:border-[#0f172a] transition-all group">
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-white" />
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// HOME — 4 TILES
// ══════════════════════════════════════════════════════════════════════════
type HomeView = "home" | "tower" | "create" | "reports" | "workbench";

const HOME_TILES = [
  {
    id: "tower" as HomeView,
    number: "1",
    title: "Budget Lifecycle Tower",
    desc: "Visual 10-stage lifecycle from formulation through evaluation. Drill into each stage for full tools, documents and workflows.",
    icon: Layers,
    color: "from-[#0f172a] to-[#1e3a5f]",
    accent: "text-slate-400",
    kpis: [{ label: "Stages", val: "10" }, { label: "Active", val: "6" }],
  },
  {
    id: "create" as HomeView,
    number: "2",
    title: "Create Budget",
    desc: "Formulate and submit annual budget estimates. Multi-step workflow from Budget Call Circular through Parliamentary vote and gazettal.",
    icon: Plus,
    color: "from-[#1a6b3a] to-[#14532d]",
    accent: "text-slate-400",
    kpis: [{ label: "Submissions", val: "48" }, { label: "Pending", val: "12" }],
  },
  {
    id: "reports" as HomeView,
    number: "3",
    title: "Budget Reports",
    desc: "Consolidated Cash Flow, Operations, Supplies, Works and Services budgets — per ministry and national. Variance analysis included.",
    icon: FileText,
    color: "from-[#4c1d95] to-[#312e81]",
    accent: "text-slate-400",
    kpis: [{ label: "Statements", val: "4" }, { label: "FY2026", val: "" }],
  },
  {
    id: "workbench" as HomeView,
    number: "4",
    title: "Budget Administration Workbench",
    desc: "Full workbench: Execution, Commitments, Revenue, Treasury, Fraud Detection, Hazard Breakers, AI Agents and Budget Intelligence.",
    icon: Settings,
    color: "from-[#7c2d12] to-[#92400e]",
    accent: "text-slate-400",
    kpis: [{ label: "Modules", val: "13" }, { label: "AI Agents", val: "12" }],
  },
];

function BudgetHome({ onNavigate }: { onNavigate: (v: HomeView) => void }) {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
      {/* National KPI bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "National Budget FY2026", val: "USD 3.51B", icon: Wallet,       cls: "bg-[#0f172a] text-white" },
          { label: "Spent YTD",              val: "USD 2.01B", icon: TrendingDown, cls: "bg-[#0F172A] text-white" },
          { label: "Available Balance",      val: "USD 1.50B", icon: Lock,         cls: "bg-[#0F172A] text-white"   },
          { label: "Budget Utilisation",     val: "57.2%",     icon: BarChart3,    cls: "bg-[#0F172A] text-white" },
        ].map(k => (
          <div key={k.label} className={`${k.cls} rounded-xl p-4 flex items-center gap-3`}>
            <k.icon className="h-6 w-6 opacity-70 flex-shrink-0" />
            <div>
              <div className="text-xl font-bold">{k.val}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 4 Module tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {HOME_TILES.map(tile => (
          <button key={tile.id} onClick={() => onNavigate(tile.id)}
            className={`bg-[#0F172A] rounded-2xl p-6 text-left text-white shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all group`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`text-5xl font-black opacity-20 leading-none`}>{tile.number}</div>
              <tile.icon className={`h-8 w-8 ${tile.accent} flex-shrink-0`} />
            </div>
            <div className="text-lg font-bold mb-1">{tile.title}</div>
            <div className="text-sm opacity-70 leading-relaxed mb-4">{tile.desc}</div>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                {tile.kpis.filter(k => k.val).map(k => (
                  <div key={k.label}>
                    <div className="text-xl font-bold">{k.val}</div>
                    <div className={`text-[10px] uppercase tracking-wider ${tile.accent}`}>{k.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold opacity-80 group-hover:opacity-100 group-hover:gap-2 transition-all">
                Open <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Ministry quick-view table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="bg-[#0f172a] px-5 py-3">
          <div className="text-xs text-slate-400 uppercase font-bold tracking-widest">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</div>
          <div className="text-sm font-bold text-white mt-0.5">Ministry & Entity Budget Overview — FY2026</div>
          <div className="text-xs text-slate-400 mt-0.5">Click a ministry to open its full budget detail</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a6b3a] text-white">
                {["Ministry / Entity", "Approved Budget", "Spent YTD", "Available", "Utilisation", "Status", ""].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MINISTRIES.map((m, i) => (
                <tr key={m.id} className={`border-b border-gray-100 hover:bg-slate-50/50 cursor-pointer transition-colors ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}
                  onClick={() => onNavigate("reports")}>
                  <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">{m.budget}</td>
                  <td className="px-4 py-3 text-gray-700">{m.spent}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {`USD ${((parseFloat(m.budget.replace(/[^0-9.]/g, "")) - parseFloat(m.spent.replace(/[^0-9.]/g, ""))) ).toFixed(0)}M`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${m.pct >= 85 ? "bg-red-500" : m.pct >= 75 ? "bg-slate-400" : "bg-[#0F172A]"}`}
                          style={{ width: `${m.pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{m.pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-1 text-xs text-[#0F172A] font-semibold hover:text-[#0F172A]">
                      <Eye className="h-3.5 w-3.5" /> View Budget
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
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════
const VIEW_LABELS: Record<HomeView, string> = {
  home:      "Budget Module",
  tower:     "1. Budget Lifecycle Tower",
  create:    "2. Create Budget",
  reports:   "3. Budget Reports",
  workbench: "4. Budget Administration Workbench",
};

export default function BudgetHomePage() {
  const navigate = useNavigate();
  const [view, setView] = useState<HomeView>("home");
  const [selectedMinistry, setSelectedMinistry] = useState(MINISTRIES[0].id);

  const showSidebar = view !== "home";

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        <PageContextBar
          ministry="Ministry of Finance & Economic Development"
          module="Budget Management"
          process={VIEW_LABELS[view]}
          financialYear="FY2026"
          pageType="dashboard"
        />

        {/* Top nav bar */}
        <div className="bg-[#0f172a] px-5 py-3 flex-shrink-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {view !== "home" && (
              <button onClick={() => setView("home")}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold transition-colors">
                <ChevronLeft className="h-4 w-4" /> Budget Module
              </button>
            )}
            <div className="text-white font-bold text-sm">{VIEW_LABELS[view]}</div>
          </div>
          {/* Quick module switcher */}
          {view !== "home" && (
            <div className="flex gap-1.5 overflow-x-auto">
              {(["tower","create","reports","workbench"] as HomeView[]).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    view === v ? "bg-white text-[#0f172a]" : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}>
                  {VIEW_LABELS[v]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Ministry sidebar — shown when inside a module */}
          {showSidebar && (
            <MinistrySidebar selected={selectedMinistry} onSelect={setSelectedMinistry} />
          )}

          {/* Main content */}
          {view === "home"      && <BudgetHome onNavigate={setView} />}
          {view === "tower"     && <TowerView selectedMinistry={selectedMinistry} />}
          {view === "create"    && <CreateBudgetView selectedMinistry={selectedMinistry} />}
          {view === "reports"   && <BudgetReportsView selectedMinistry={selectedMinistry} />}
          {view === "workbench" && <AdminWorkbenchView selectedMinistry={selectedMinistry} />}
        </div>
      </div>
    </AppShell>
  );
}
