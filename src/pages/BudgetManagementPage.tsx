import { useState, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard, PageContextBar } from "@/components/AppShell";
import { FeatureGrid } from "@/components/ModulePage";
import LifecycleTower from "@/components/LifecycleTower";
import { BUDGET_STAGES } from "@/lib/lifecycle-stages";
import { useAuth } from "@/lib/auth-context";
import { pushSeniorAlert, pushNotification } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line,
} from "recharts";
import {
  Wallet, TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, Building2,
  Plus, Download, Eye, CheckCircle2, Clock, XCircle, Zap, Activity,
  DollarSign, BarChart3, PieChart as PieIcon, Flag, Lock, Unlock,
  RefreshCw, Target, Layers, Users, FileText, Search,
  LayoutDashboard, BookOpen, GitBranch, PlayCircle, ShoppingCart,
  Link2, CreditCard, TrendingUp as Spend, Banknote, FolderOpen,
  Globe, Shield, Cpu, Layers as Layers2, Wrench, Map,
} from "lucide-react";
import InlineWorkbench from "@/components/InlineWorkbench";
import BudgetIntelligenceCentre from "@/components/BudgetIntelligenceCentre";

// ── Tab definitions ────────────────────────────────────────────────────────
const TABS = [
  "Executive Command",
  "Budget Centres",
  "Formulation",
  "Approval Workflow",
  "Budget Execution",
  "Procurement Control",
  "Commitments",
  "Expenditure",
  "Revenue",
  "Treasury & Cash",
  "Projects",
  "Grants & Donors",
  "Fraud Detection",
  "Corruption Intel",
  "Waste Detection",
  "Compliance",
  "Audit",
  "Hazard Breakers",
  "Budget Intelligence",
  "AI Agents",
  "Lifecycle Tower",
] as const;
type Tab = typeof TABS[number];

// ── Sidebar nav groups ─────────────────────────────────────────────────────
const NAV_GROUPS: { label: string; icon: React.ElementType; items: { label: Tab; icon: React.ElementType }[] }[] = [
  {
    label: "COMMAND & PLANNING",
    icon: LayoutDashboard,
    items: [
      { label: "Executive Command",  icon: LayoutDashboard },
      { label: "Budget Centres",     icon: Building2       },
      { label: "Formulation",        icon: BookOpen        },
      { label: "Approval Workflow",  icon: GitBranch       },
      { label: "Lifecycle Tower",    icon: Layers          },
    ],
  },
  {
    label: "EXECUTION & CONTROL",
    icon: PlayCircle,
    items: [
      { label: "Budget Execution",   icon: PlayCircle      },
      { label: "Procurement Control",icon: ShoppingCart    },
      { label: "Commitments",        icon: Link2           },
      { label: "Expenditure",        icon: CreditCard      },
      { label: "Revenue",            icon: DollarSign      },
      { label: "Treasury & Cash",    icon: Banknote        },
      { label: "Projects",           icon: FolderOpen      },
      { label: "Grants & Donors",    icon: Globe           },
    ],
  },
  {
    label: "INTEGRITY & RISK",
    icon: Shield,
    items: [
      { label: "Fraud Detection",    icon: AlertTriangle   },
      { label: "Corruption Intel",   icon: Shield          },
      { label: "Waste Detection",    icon: Wrench          },
      { label: "Hazard Breakers",    icon: Zap             },
    ],
  },
  {
    label: "COMPLIANCE & AUDIT",
    icon: ShieldCheck,
    items: [
      { label: "Compliance",         icon: ShieldCheck     },
      { label: "Audit",              icon: FileText        },
    ],
  },
  {
    label: "INTELLIGENCE & AI",
    icon: BarChart3,
    items: [
      { label: "Budget Intelligence",icon: BarChart3       },
      { label: "AI Agents",          icon: Cpu             },
    ],
  },
];

// ── Chart colours ──────────────────────────────────────────────────────────
const C = ["#334155","#475569","#64748B","#334155","#DC2626","#334155","#475569","#64748B","#475569"];
const TIP = { contentStyle: { background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 } };

// ── Mock budget data ───────────────────────────────────────────────────────
const MINISTRY_BUDGETS = [
  { ministry: "Clinical Services Dept",     approved: 280, spent: 186, committed: 42, available: 52, pct: 81 },
  { ministry: "Pharmacy & Medical Stores",  approved: 120, spent: 72,  committed: 24, available: 24, pct: 80 },
  { ministry: "Infrastructure Division",    approved: 320, spent: 214, committed: 68, available: 38, pct: 88 },
  { ministry: "Roads & Bridges Dept",       approved: 200, spent: 118, committed: 40, available: 42, pct: 79 },
  { ministry: "Primary Education Dept",     approved: 210, spent: 122, committed: 32, available: 56, pct: 73 },
  { ministry: "ZIMRA Operations",           approved: 180, spent: 98,  committed: 28, available: 54, pct: 70 },
  { ministry: "Treasury Operations",        approved: 140, spent: 98,  committed: 20, available: 22, pct: 83 },
  { ministry: "ICT & Digital Services",     approved: 180, spent: 88,  committed: 28, available: 64, pct: 64 },
];

const DEPT_BUDGETS = [
  { dept: "Clinical Services",        ministry: "Health",     approved: 280, spent: 186, pct: 82, status: "On Track" },
  { dept: "Pharmacy & Medical Stores",ministry: "Health",     approved: 120, spent: 96,  pct: 80, status: "Warning"  },
  { dept: "Infrastructure Division",  ministry: "Transport",  approved: 320, spent: 214, pct: 87, status: "At Risk"  },
  { dept: "Roads & Bridges",          ministry: "Transport",  approved: 200, spent: 118, pct: 79, status: "On Track" },
  { dept: "Primary Education",        ministry: "Education",  approved: 210, spent: 122, pct: 71, status: "On Track" },
  { dept: "Treasury Operations",      ministry: "Finance",    approved: 140, spent: 98,  pct: 83, status: "Warning"  },
];

const BURN_TREND = [
  { month: "Jan", budget: 850, actual: 620, forecast: 820 },
  { month: "Feb", budget: 850, actual: 680, forecast: 840 },
  { month: "Mar", budget: 850, actual: 720, forecast: 860 },
  { month: "Apr", budget: 850, actual: 760, forecast: 870 },
  { month: "May", budget: 850, actual: 810, forecast: 890 },
  { month: "Jun", budget: 850, actual: 855, forecast: 920 },
  { month: "Jul", budget: 850, actual: 0,   forecast: 940 },
  { month: "Aug", budget: 850, actual: 0,   forecast: 960 },
  { month: "Sep", budget: 850, actual: 0,   forecast: 980 },
];

const REVENUE_DATA = [
  { month: "Jan", target: 420, actual: 398 },
  { month: "Feb", target: 420, actual: 412 },
  { month: "Mar", target: 420, actual: 435 },
  { month: "Apr", target: 420, actual: 401 },
  { month: "May", target: 420, actual: 418 },
  { month: "Jun", target: 420, actual: 422 },
];

const CATEGORY_SPEND = [
  { name: "Staff Costs",             value: 28 },
  { name: "Capital Projects",        value: 22 },
  { name: "Allowances & Travel",     value: 12 },
  { name: "Goods & Services",        value: 14 },
  { name: "ICT & Technology",        value: 8  },
  { name: "Rent & Facilities",       value: 7  },
  { name: "Legal & Consulting",      value: 5  },
  { name: "Fuel & Vehicle Maint.",   value: 4  },
];

const BUDGET_CENTRES = [
  { id: "BC-ENT-001", name: "Ministry of Health & Child Care",   type: "Entity",     units: 6,  budget: "USD 820M", status: "Active" },
  { id: "BC-ENT-002", name: "Ministry of Transport",             type: "Entity",     units: 4,  budget: "USD 640M", status: "Active" },
  { id: "BC-ENT-003", name: "Ministry of Education",             type: "Entity",     units: 5,  budget: "USD 510M", status: "Active" },
  { id: "BC-DEP-001", name: "Clinical Services Dept",            type: "Department", units: 0,  budget: "USD 280M", status: "Active", parent: "BC-ENT-001" },
  { id: "BC-DEP-002", name: "Pharmacy & Medical Stores",         type: "Department", units: 0,  budget: "USD 120M", status: "Active", parent: "BC-ENT-001" },
  { id: "BC-DEP-003", name: "Infrastructure Division",           type: "Department", units: 0,  budget: "USD 320M", status: "Active", parent: "BC-ENT-002" },
  { id: "BC-DEP-004", name: "Roads & Bridges Dept",              type: "Department", units: 0,  budget: "USD 200M", status: "Active", parent: "BC-ENT-002" },
  { id: "BC-DEP-005", name: "Primary Education Dept",            type: "Department", units: 0,  budget: "USD 210M", status: "Active", parent: "BC-ENT-003" },
  { id: "BC-SOE-001", name: "ZIMRA",                             type: "State Entity",units: 3, budget: "USD 180M", status: "Active" },
  { id: "BC-SOE-002", name: "ZINARA",                            type: "State Entity",units: 2, budget: "USD 95M",  status: "Active" },
];

const COMMITMENTS = [
  { id: "CMT-2026-0481", dept: "Clinical Services",    vendor: "Zimbabwe Pharma",      amount: "USD 42.5M", type: "Contract",    status: "Active",  risk: "Low"  },
  { id: "CMT-2026-0480", dept: "Infrastructure Div",   vendor: "Highveld Engineering", amount: "USD 71.0M", type: "Contract",    status: "Active",  risk: "Medium" },
  { id: "CMT-2026-0479", dept: "Primary Education",    vendor: "Sable Press Ltd",      amount: "USD 6.7M",  type: "Purchase Order", status: "Active", risk: "Low"  },
  { id: "CMT-2026-0478", dept: "Treasury Operations",  vendor: "Multiple Creditors",   amount: "USD 18.4M", type: "Debt Service", status: "Active",  risk: "High" },
];

const FRAUD_ALERTS = [
  { id: "FA-2026-041", type: "Ghost Vendor",          dept: "Transport",   amount: "USD 240K",  risk: "Critical", status: "Frozen"        },
  { id: "FA-2026-040", type: "Duplicate Payment",     dept: "Health",      amount: "USD 84K",   risk: "High",     status: "Investigating" },
  { id: "FA-2026-039", type: "Invoice Splitting",     dept: "Agriculture", amount: "USD 320K",  risk: "High",     status: "Flagged"       },
  { id: "FA-2026-038", type: "Payroll Anomaly",       dept: "Finance",     amount: "USD 120K",  risk: "Medium",   status: "Under Review"  },
  { id: "FA-2026-037", type: "Abnormal Spend Spike",  dept: "Education",   amount: "USD 890K",  risk: "Medium",   status: "Monitoring"    },
];

const HAZARD_EVENTS = [
  { level: 5, label: "Emergency Stop",  event: "Unauthorised transfer — Finance Dept",  amount: "USD 2.1M",  status: "Blocked",     time: "06:14" },
  { level: 4, label: "Freeze",          event: "Duplicate payment detected — INV-4821", amount: "USD 840K",  status: "Frozen",      time: "08:32" },
  { level: 4, label: "Freeze",          event: "Ghost vendor pattern — VEN-00476",      amount: "USD 240K",  status: "Frozen",      time: "09:05" },
  { level: 3, label: "Restriction",     event: "Budget ceiling reached — Transport Div",amount: "USD 71.0M", status: "Restricted",  time: "10:18" },
  { level: 2, label: "Warning",         event: "Cost overrun risk — Water Treatment",   amount: "USD 56.0M", status: "Escalated",   time: "11:44" },
  { level: 1, label: "Alert",           event: "Variance > 5% — Education Dept",        amount: "USD 4.2M",  status: "Notified",    time: "12:01" },
];

const AI_AGENTS = [
  { name: "Chief Budget Officer AI",   role: "Executive portfolio monitoring & briefing",           status: "Active", conf: 94, actions: 842  },
  { name: "Budget Guardian AI",        role: "Real-time budget ceiling & burn-rate monitoring",     status: "Active", conf: 97, actions: 2104 },
  { name: "Fraud Investigator AI",     role: "Ghost vendors, duplicate payments, fake invoices",    status: "Active", conf: 91, actions: 1284 },
  { name: "Corruption Detection AI",   role: "Collusion, favouritism, conflict-of-interest",        status: "Active", conf: 89, actions: 412  },
  { name: "Treasury AI",               role: "Cash flow optimisation & liquidity management",       status: "Active", conf: 93, actions: 628  },
  { name: "Cost Overrun AI",           role: "Predict future overruns & recommend cost controls",   status: "Active", conf: 88, actions: 384  },
  { name: "Revenue Assurance AI",      role: "Revenue leakage detection & collection efficiency",   status: "Active", conf: 92, actions: 521  },
  { name: "Compliance AI",             role: "Continuous law, policy & treasury-regulation checks", status: "Active", conf: 96, actions: 1742 },
  { name: "Audit AI",                  role: "Continuous auditing, evidence collection, findings",  status: "Active", conf: 95, actions: 987  },
  { name: "Waste Detection AI",        role: "Duplicate purchases, idle assets, excess inventory",  status: "Active", conf: 90, actions: 463  },
  { name: "Project Intelligence AI",   role: "Delay & cost-overrun prediction for capital projects",status: "Standby",conf: 87, actions: 201  },
  { name: "Forecasting AI",            role: "Multi-year expenditure & revenue forecasting",        status: "Active", conf: 91, actions: 334  },
];

// ── Helper badge ──────────────────────────────────────────────────────────
function RiskBadge({ risk }: { risk: string }) {
  const c: Record<string, string> = {
    Critical: "bg-red-100 text-red-700 border border-red-200",
    High:     "bg-slate-100 text-[#0F172A] border border-slate-200",
    Medium:   "bg-slate-100 text-[#0F172A] border border-slate-200",
    Low:      "bg-slate-100 text-[#0F172A] border border-slate-200",
    Warning:  "bg-slate-100 text-[#0F172A] border border-slate-200",
    "On Track":"bg-slate-100 text-[#0F172A] border border-slate-200",
    "At Risk": "bg-slate-100 text-[#0F172A] border border-slate-200",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${c[risk] ?? "bg-gray-100 text-gray-600 border border-gray-200"}`}>{risk}</span>;
}

// ══════════════════════════════════════════════════════════════════════════
// TAB: Executive Command Center
// ══════════════════════════════════════════════════════════════════════════
function ExecutiveCommandTab() {
  return (
    <div className="space-y-6">
      {/* KPI row 1 — Budget Health */}
      <div>
        <p className="text-xs font-semibold text-black/40 uppercase tracking-wider mb-2">Budget Health</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="National Budget" value="USD 3.51B" icon={Wallet} color="blue" />
          <KpiCard label="Spent YTD"       value="USD 2.01B" delta="57.2%" icon={TrendingUp} color="green" />
          <KpiCard label="Committed"       value="USD 544M"  delta="15.5%" icon={Lock} color="amber" />
          <KpiCard label="Available"       value="USD 956M"  delta="Remaining" icon={Unlock} color="cyan" />
          <KpiCard label="Budget Util %"   value="57.2%"     delta="On track" icon={Activity} color="blue" />
          <KpiCard label="Burn Rate"       value="USD 335M/mo" delta="+4.1%" icon={TrendingDown} color="orange" />
        </div>
      </div>
      {/* KPI row 2 — Revenue & Risk */}
      <div>
        <p className="text-xs font-semibold text-black/40 uppercase tracking-wider mb-2">Revenue & Risk Health</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard label="Revenue Target"    value="USD 2.52B" icon={Target} color="blue" />
          <KpiCard label="Revenue Collected" value="USD 2.49B" delta="98.8%" icon={CheckCircle2} color="green" />
          <KpiCard label="Fraud Risk Score"  value="72/100"    delta="Medium" positive={false} icon={AlertTriangle} color="red" />
          <KpiCard label="Compliance Score"  value="94.2%"     delta="+1.8pts" icon={ShieldCheck} color="green" />
          <KpiCard label="Waste Risk Score"  value="38/100"    delta="Low" icon={Flag} color="amber" />
          <KpiCard label="Corruption Index"  value="61/100"    delta="Medium" positive={false} icon={Eye} color="violet" />
        </div>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="National Budget Execution Trend" subtitle="Budget vs Actual vs Forecast (USD M)" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={BURN_TREND}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
                <Tooltip {...TIP} formatter={(v: number) => [`USD ${v}M`]} />
                <Area type="monotone" dataKey="budget"   stroke="#e2e8f0" fill="#f8fafc" strokeWidth={1.5} name="Budget" />
                <Area type="monotone" dataKey="actual"   stroke="#334155" fill="#eff6ff" strokeWidth={2}   name="Actual" />
                <Area type="monotone" dataKey="forecast" stroke="#64748B" fill="#fffbeb" strokeWidth={1.5} strokeDasharray="5 3" name="Forecast" />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Spend by Category" subtitle="National allocation %" />
          <div className="p-4 flex flex-col gap-3">
            {/* Pie — no built-in Legend inside to avoid overflow */}
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={CATEGORY_SPEND} cx="50%" cy="50%" innerRadius={48} outerRadius={78} dataKey="value" nameKey="name">
                    {CATEGORY_SPEND.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                  </Pie>
                  <Tooltip {...TIP} formatter={(v: number) => [`${v}%`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom legend list — always readable */}
            <div className="space-y-1.5">
              {CATEGORY_SPEND.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: C[i % C.length] }} />
                    <span className="text-xs text-black/70 truncate">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-black flex-shrink-0">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Ministry budget table */}
      <Card>
        <CardHeader title="Department Budget Performance" subtitle="FY2026 — All departments" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-black/40 uppercase">
              <tr>{["Department / Unit","Approved (USD M)","Spent","Committed","Available","Utilisation","Status"].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {MINISTRY_BUDGETS.map(m => (
                <tr key={m.ministry} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-black">{m.ministry}</td>
                  <td className="px-4 py-3 text-black/70">{m.approved}</td>
                  <td className="px-4 py-3 text-black/70">{m.spent}</td>
                  <td className="px-4 py-3 text-black/70">{m.committed}</td>
                  <td className="px-4 py-3 text-black/70">{m.available}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full ${m.pct >= 80 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} style={{ width: `${m.pct}%` }} />
                      </div>
                      <span className="text-xs text-black/60">{m.pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><RiskBadge risk={m.pct >= 90 ? "At Risk" : m.pct >= 75 ? "Warning" : "On Track"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Executive Insights */}
      <Card>
        <CardHeader title="AI Executive Insights" subtitle="Top predictions & recommendations from Budget AI agents" />
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { icon: AlertTriangle, color: "text-red-500 bg-red-50",     title: "Budget Overrun Predicted",    msg: "Ministry of Transport Infrastructure Division forecast to exceed budget by 12% (USD 38.4M) if spend rate continues." },
            { icon: TrendingDown,  color: "text-[#0F172A] bg-slate-50", title: "Revenue Shortfall Risk",      msg: "ICT & Digital revenue collection trending 8% below target. Revenue Assurance AI recommends enforcement review." },
            { icon: ShieldCheck,   color: "text-[#0F172A] bg-slate-50", title: "Compliance Improving",   msg: "Compliance score improved from 92.4% to 94.2% this quarter. Treasury regulation adherence at all-time high." },
            { icon: Zap,           color: "text-[#0F172A] bg-slate-50",   title: "Cash Optimisation Opportunity", msg: "USD 124M idle in Education dept accounts. Treasury AI recommends redeployment to capital projects." },
            { icon: Flag,          color: "text-[#0F172A] bg-slate-50", title: "Waste Detected",           msg: "Duplicate procurement of office equipment across 4 departments. Estimated waste: USD 2.8M. Recommend consolidation." },
            { icon: Target,        color: "text-[#0F172A] bg-slate-50",   title: "Programme Reallocation",      msg: "Rural Electrification budget 30% underspent. Budget Guardian AI recommends reallocation to Water Treatment overrun." },
          ].map((i, idx) => (
            <div key={idx} className="flex gap-3 p-3 rounded-xl border border-black/5 bg-gray-50/60">
              <div className={`h-8 w-8 rounded-xl grid place-items-center flex-shrink-0 ${i.color}`}><i.icon className="h-4 w-4" /></div>
              <div><div className="text-xs font-semibold text-black mb-0.5">{i.title}</div><div className="text-xs text-black/50 leading-relaxed">{i.msg}</div></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB: Budget Centres
// ══════════════════════════════════════════════════════════════════════════
function BudgetCentresTab({ onAction }: { onAction: (msg: string) => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", type: "Ministry", parent: "", budget: "" });

  const handleCreate = () => {
    if (!form.name.trim() || !form.budget.trim()) { toast("Name and budget are required.", "error"); return; }
    onAction(`Budget centre created: ${form.name} (${form.type}) — ${form.budget}`);
    setShowCreate(false);
    setForm({ name: "", type: "Ministry", parent: "", budget: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-black/50">Manage the hierarchy: Parent Entity → Departments → Sub-units. Each centre formulates its own budget; the system auto-consolidates upward.</p>
        <button onClick={() => setShowCreate(true)} className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Budget Centre
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
              <h2 className="text-sm font-semibold">New Budget Centre</h2>
              <button onClick={() => setShowCreate(false)} className="text-black/30 hover:text-black text-xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              {[["Centre Name *","name","text"],["Budget Allocation (USD) *","budget","text"]].map(([lbl,k,t]) => (
                <div key={k}><label className="block text-xs font-medium text-black/60 mb-1">{lbl}</label>
                  <input type={t} value={(form as Record<string,string>)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
              ))}
              <div><label className="block text-xs font-medium text-black/60 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none">
                  {["Ministry","Department","Autonomous Body"].map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label className="block text-xs font-medium text-black/60 mb-1">Parent Ministry (if applicable)</label>
                <select value={form.parent} onChange={e => setForm(f => ({ ...f, parent: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none">
                  <option value="">— None (Top-level) —</option>
                  {BUDGET_CENTRES.filter(c => c.type === "Ministry").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-black/10">
              <button onClick={() => setShowCreate(false)} className="h-9 px-4 rounded-xl border border-black/10 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleCreate} className="h-9 px-4 rounded-xl bg-black text-white text-sm hover:bg-gray-800 transition-colors">Create Centre</button>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader title="Budget Centre Hierarchy" subtitle={`${BUDGET_CENTRES.length} centres registered`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-black/40 uppercase">
              <tr>{["Centre ID","Name","Type","Sub-units","Budget","Parent","Status",""].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {BUDGET_CENTRES.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-mono text-[11px] text-black/50">{c.id}</td>
                  <td className="px-4 py-3 font-medium text-black">{c.name}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${c.type === "Ministry" ? "bg-slate-100 text-[#0F172A]" : c.type === "Entity" ? "bg-slate-100 text-[#0F172A]" : c.type === "Department" ? "bg-slate-100 text-[#0F172A]" : c.type === "State Entity" ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-600"}`}>{c.type}</span></td>
                  <td className="px-4 py-3 text-black/60">{c.units}</td>
                  <td className="px-4 py-3 font-medium text-black">{c.budget}</td>
                  <td className="px-4 py-3 text-black/50 text-xs">{(c as {parent?: string}).parent ?? "—"}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-slate-100 text-[#0F172A] px-2 py-0.5 rounded-md">{c.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => onAction(`Viewing budget centre: ${c.name}`)} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-gray-50 transition-colors">View</button>
                      <button onClick={() => onAction(`Budget submitted for: ${c.name}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 transition-colors">Submit Budget</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <FeatureGrid features={[
        { title: "Ministry Budgets",        desc: "Create and manage top-level ministry budgets with multi-year expenditure frameworks and strategic alignment." },
        { title: "Department Budgets",      desc: "Each department under a ministry submits its own budget. System auto-consolidates to ministry master budget." },
        { title: "Autonomous Bodies",       desc: "State enterprises and revenue authorities manage independent budgets linked to national fiscal framework." },
        { title: "Budget Consolidation",    desc: "Automatic bottom-up consolidation: Departments → Ministry Master → National Budget Frame." },
        { title: "Cost Centre Planning",    desc: "Granular cost-centre budgeting with activity-based and zero-based budgeting support." },
        { title: "AI Budget Validation",    desc: "AI flags padding, unrealistic estimates, duplicate requests, and historical misalignment before submission." },
      ]} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB: Budget Execution
// ══════════════════════════════════════════════════════════════════════════
function BudgetExecutionTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Budget vs Actual" value="57.2%" delta="On track" icon={BarChart3} color="blue" />
        <KpiCard label="Monthly Burn Rate" value="USD 335M" delta="+4.1%" positive={false} icon={TrendingDown} color="amber" />
        <KpiCard label="Year-end Forecast" value="USD 3.48B" delta="vs USD 3.51B budget" icon={Target} color="green" />
        <KpiCard label="Departments At Risk" value="2" delta="of 18 monitored" positive={false} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Department Budget Performance" subtitle="Spend vs approved budget" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-black/40 uppercase">
                <tr>{["Department","Ministry","Approved (M)","Spent (M)","% Used","Status"].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {DEPT_BUDGETS.map(d => (
                  <tr key={d.dept} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-medium text-black">{d.dept}</td>
                    <td className="px-4 py-3 text-black/50 text-xs">{d.ministry}</td>
                    <td className="px-4 py-3 text-black/70">{d.approved}</td>
                    <td className="px-4 py-3 text-black/70">{d.spent}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className={`h-full rounded-full ${d.pct >= 85 ? "bg-red-500" : d.pct >= 75 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} style={{ width: `${Math.min(d.pct,100)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-black/70">{d.pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><RiskBadge risk={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardHeader title="Department Budget Comparison" subtitle="Approved vs Spent (USD M)" />
          <div className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MINISTRY_BUDGETS.slice(0,6)} layout="vertical">
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}M`} />
                <YAxis type="category" dataKey="ministry" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={80} />
                <Tooltip {...TIP} formatter={(v:number)=>[`USD ${v}M`]} />
                <Bar dataKey="approved" fill="#e2e8f0" radius={[0,3,3,0]} name="Approved" />
                <Bar dataKey="spent"    fill="#334155" radius={[0,3,3,0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <FeatureGrid features={[
        { title: "Budget vs Actual Analysis",    desc: "Real-time variance tracking across all departments and programmes with drill-down capability." },
        { title: "Burn Rate Monitoring",         desc: "Monthly, quarterly, and YTD burn-rate analysis with year-end expenditure forecasting." },
        { title: "Spending Spike Detection",     desc: "AI detects abnormal spending patterns and end-of-year rush spending for investigation." },
        { title: "Programme Performance",        desc: "Track budget utilisation by programme, activity, and cost centre against planned targets." },
        { title: "Virement Management",          desc: "Request and approve budget reallocations between line items with full audit trail." },
        { title: "Supplementary Budgets",        desc: "Manage mid-year supplementary budget requests with Treasury and Cabinet approval workflow." },
      ]} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB: Commitments
// ══════════════════════════════════════════════════════════════════════════
function CommitmentsTab({ onAction }: { onAction: (msg: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Registered Commitments" value="1,284"    delta="+18 this week" icon={FileText} color="blue" />
        <KpiCard label="Outstanding Commitments" value="USD 544M" delta="15.5% of budget" icon={Lock} color="amber" />
        <KpiCard label="Encumbrances"            value="USD 218M" delta="6.2% of budget" icon={Activity} color="violet" />
        <KpiCard label="Hazard Breakers Fired"   value="7"        delta="this month" positive={false} icon={AlertTriangle} color="red" />
      </div>

      <Card>
        <CardHeader title="Active Commitments Register" subtitle="Contracts, POs, and standing orders with budget reservations" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-black/40 uppercase">
              <tr>{["Commitment ID","Department","Vendor / Payee","Amount","Type","Status","Risk",""].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {COMMITMENTS.map(c => (
                <tr key={c.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-mono text-[11px] text-black/50">{c.id}</td>
                  <td className="px-4 py-3 text-black/70">{c.dept}</td>
                  <td className="px-4 py-3 font-medium text-black">{c.vendor}</td>
                  <td className="px-4 py-3 font-semibold text-black">{c.amount}</td>
                  <td className="px-4 py-3 text-black/60 text-xs">{c.type}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-slate-100 text-[#0F172A] px-2 py-0.5 rounded-md">{c.status}</span></td>
                  <td className="px-4 py-3"><RiskBadge risk={c.risk} /></td>
                  <td className="px-4 py-3"><button onClick={() => onAction(`Reviewing commitment ${c.id}`)} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-gray-50">Review</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <FeatureGrid features={[
        { title: "Commitment Registration",  desc: "Register all financial obligations before they become expenditures — contracts, POs, standing orders." },
        { title: "Funds Availability Check", desc: "System automatically verifies available budget before accepting any commitment." },
        { title: "Encumbrance Management",   desc: "Track reserved funds across the fiscal year to prevent over-commitment." },
        { title: "Duplicate Commitment Block", desc: "AI and system rules prevent duplicate commitments for the same obligation." },
        { title: "Budget Ceiling Enforcer",  desc: "Hard stop prevents any commitment that exceeds the approved budget ceiling." },
        { title: "Commitment Risk Scoring",  desc: "AI scores each commitment for risk of future funding gaps and overruns." },
      ]} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB: Revenue Management
// ══════════════════════════════════════════════════════════════════════════
function RevenueTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Revenue Target"         value="USD 2.52B"  icon={Target} color="blue" />
        <KpiCard label="Collected YTD"          value="USD 2.49B"  delta="98.8%" icon={CheckCircle2} color="green" />
        <KpiCard label="Outstanding Receivables" value="USD 284M"  delta="-12% vs last year" positive={false} icon={Clock} color="amber" />
        <KpiCard label="Leakage Score"           value="18/100"    delta="Low risk" icon={Flag} color="green" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Revenue Collection vs Target" subtitle="Monthly — USD M" />
          <div className="p-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}M`} />
                <Tooltip {...TIP} formatter={(v:number)=>[`USD ${v}M`]} />
                <Bar dataKey="target" fill="#e2e8f0" radius={[3,3,0,0]} name="Target" />
                <Bar dataKey="actual" fill="#475569" radius={[3,3,0,0]} name="Collected" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Revenue Intelligence" subtitle="AI-detected issues & recommendations" />
          <div className="p-4 space-y-3">
            {[
              { color: "text-red-500 bg-red-50",     title: "Revenue Leakage Detected",     msg: "Under-billing on ICT licensing fees. Estimated leakage: USD 4.2M. AI recommends immediate billing audit." },
              { color: "text-[#0F172A] bg-slate-50", title: "Collection Efficiency Drop",   msg: "Road levies collection efficiency dropped from 94% to 87% in May. ZINARA collection process under review." },
              { color: "text-[#0F172A] bg-slate-50",   title: "Forecast: Q3 Shortfall Risk",  msg: "Revenue AI predicts Q3 shortfall of USD 18M if current trends continue. Proactive measures recommended." },
              { color: "text-[#0F172A] bg-slate-50", title: "Tax Compliance Improving", msg: "Corporate tax compliance up 3.2% this quarter. ZIMRA AI-assisted enforcement credited for improvement." },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-xl border border-black/5 bg-gray-50/50">
                <div className={`h-7 w-7 rounded-lg grid place-items-center flex-shrink-0 ${item.color}`}><Flag className="h-3.5 w-3.5" /></div>
                <div><div className="text-xs font-semibold text-black mb-0.5">{item.title}</div><div className="text-xs text-black/50 leading-relaxed">{item.msg}</div></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <FeatureGrid features={[
        { title: "Revenue Collection Tracking", desc: "Monitor all revenue streams in real-time against annual and quarterly targets." },
        { title: "Revenue Forecasting",         desc: "AI-powered multi-year revenue forecasts using historical trends and economic indicators." },
        { title: "Leakage Detection",           desc: "Automated detection of under-billing, missing collections, and revenue fraud." },
        { title: "Receivables Management",      desc: "Track outstanding receivables with automated dunning and enforcement workflows." },
        { title: "Variance Analysis",           desc: "Root-cause analysis of revenue variances with corrective action recommendations." },
        { title: "Donor Revenue Tracking",      desc: "Separate tracking of grants, donor funds, and development partner contributions." },
      ]} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB: Fraud Detection
// ══════════════════════════════════════════════════════════════════════════
function FraudDetectionTab({ onAction }: { onAction: (msg: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Open Fraud Alerts"    value="18"          delta="+3 new today" positive={false} icon={AlertTriangle} color="red" />
        <KpiCard label="Frozen Transactions"  value="4"           delta="USD 3.2M frozen" icon={Lock} color="amber" />
        <KpiCard label="Cases Investigating"  value="7"           delta="2 critical" icon={Eye} color="violet" />
        <KpiCard label="Loss Prevented YTD"   value="USD 12.8M"   delta="from 34 cases" icon={ShieldCheck} color="green" />
      </div>

      <Card>
        <CardHeader title="Active Fraud Alerts" subtitle="AI-detected financial fraud indicators" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-black/40 uppercase">
              <tr>{["Alert ID","Fraud Type","Department","Amount at Risk","Risk Level","Status","Actions"].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {FRAUD_ALERTS.map(f => (
                <tr key={f.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-mono text-[11px] text-black/50">{f.id}</td>
                  <td className="px-4 py-3 font-medium text-black">{f.type}</td>
                  <td className="px-4 py-3 text-black/60">{f.dept}</td>
                  <td className="px-4 py-3 font-semibold text-black">{f.amount}</td>
                  <td className="px-4 py-3"><RiskBadge risk={f.risk} /></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-md font-semibold ${f.status === "Frozen" ? "bg-red-100 text-red-700" : f.status === "Investigating" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{f.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => onAction(`Investigating fraud alert ${f.id}: ${f.type}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 transition-colors">Investigate</button>
                      <button onClick={() => onAction(`Escalating fraud alert ${f.id} to Audit Committee`)} className="h-7 px-2.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-xs hover:bg-red-100 transition-colors">Escalate</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <FeatureGrid features={[
        { title: "Ghost Vendor Detection",    desc: "AI cross-references vendor registrations, tax numbers, and bank accounts to identify fictitious suppliers." },
        { title: "Duplicate Payment Guard",   desc: "Automatic detection of duplicate invoices, payments, and purchase orders across the system." },
        { title: "Payroll Fraud Detection",   desc: "Ghost employees, duplicate employees, fake overtime, and payroll manipulation detection." },
        { title: "Invoice Fraud Analytics",   desc: "Pattern analysis on invoice amounts, dates, and sequences to identify artificial splitting and fraud." },
        { title: "Network Analysis",          desc: "AI maps employee-vendor relationships to identify suspicious connections and collusion networks." },
        { title: "Fraud Risk Scoring",        desc: "Every transaction receives a real-time fraud risk score with automatic escalation above thresholds." },
      ]} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB: Hazard Breakers
// ══════════════════════════════════════════════════════════════════════════
function HazardBreakersTab() {
  const LEVEL_COLORS: Record<number, string> = {
    5: "bg-red-600 text-white",
    4: "bg-red-100 text-red-700 border border-red-200",
    3: "bg-slate-100 text-[#0F172A] border border-slate-200",
    2: "bg-slate-100 text-[#0F172A] border border-slate-200",
    1: "bg-slate-100 text-[#0F172A] border border-slate-200",
  };
  const STATUS_COLORS: Record<string, string> = {
    Blocked: "bg-red-100 text-red-700", Frozen: "bg-slate-100 text-[#0F172A]",
    Restricted: "bg-slate-100 text-[#0F172A]", Escalated: "bg-slate-100 text-[#0F172A]",
    Notified: "bg-slate-100 text-[#0F172A]",
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { level: "L5 Emergency Stops", value: "1", color: "red"    },
          { level: "L4 Freezes",         value: "3", color: "orange" },
          { level: "L3 Restrictions",    value: "4", color: "amber"  },
          { level: "L2 Warnings",        value: "8", color: "violet" },
          { level: "L1 Alerts",          value: "21",color: "blue"   },
        ].map(k => (
          <KpiCard key={k.level} label={k.level} value={k.value}
            icon={k.level.includes("5") ? XCircle : k.level.includes("4") ? Lock : AlertTriangle}
            color={k.color as "red" | "orange" | "amber" | "violet" | "blue"} />
        ))}
      </div>

      <Card>
        <CardHeader title="Hazard Breaker Events — Today" subtitle="Automatic financial circuit breakers" />
        <div className="divide-y divide-black/5">
          {HAZARD_EVENTS.map((h, idx) => (
            <div key={idx} className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-50/50">
              <div className="flex items-start gap-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap ${LEVEL_COLORS[h.level]}`}>L{h.level} {h.label}</span>
                <div>
                  <div className="text-sm font-medium text-black">{h.event}</div>
                  <div className="text-xs text-black/40 mt-0.5">{h.amount} — triggered at {h.time}</div>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md flex-shrink-0 ${STATUS_COLORS[h.status] ?? "bg-gray-100 text-gray-600"}`}>{h.status}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { level: "Level 1 — Alert",          color: "border-slate-200 bg-slate-50",   triggers: ["Variance > 5%", "Delayed approval", "Spending spike"], action: "Notify responsible officer" },
          { level: "Level 2 — Warning",         color: "border-slate-200 bg-slate-50", triggers: ["Variance > 10%", "Cost overrun risk", "Procurement anomaly"], action: "Escalate to supervisor" },
          { level: "Level 3 — Restriction",     color: "border-slate-200 bg-slate-50", triggers: ["Budget ceiling reached", "High fraud score", "Procurement threshold breach"], action: "Restrict transaction value; require additional approvals" },
          { level: "Level 4 — Freeze",          color: "border-red-200 bg-red-50",    triggers: ["Duplicate payment detected", "Fraud likely", "Corruption indicators"], action: "Freeze transaction; open investigation case" },
          { level: "Level 5 — Emergency Stop",  color: "border-red-300 bg-red-100",   triggers: ["Unauthorised fund transfer", "Major corruption pattern", "Massive budget breach"], action: "Block transaction; lock account; notify auditors & executives" },
        ].map(b => (
          <Card key={b.level} className={`p-4 border-2 ${b.color}`}>
            <div className="text-sm font-bold text-black mb-2">{b.level}</div>
            <div className="text-xs text-black/60 font-medium mb-1">Triggers:</div>
            <ul className="text-xs text-black/50 space-y-0.5 mb-3">{b.triggers.map(t => <li key={t}>• {t}</li>)}</ul>
            <div className="text-xs font-semibold text-black/80">Action: {b.action}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// TAB: AI Agents
// ══════════════════════════════════════════════════════════════════════════
function AIAgentsTab({ onAction }: { onAction: (msg: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Active AI Agents"    value="11"          delta="1 on standby" icon={Zap} color="blue" />
        <KpiCard label="Actions Today"       value="8,421"       delta="+12% vs yesterday" icon={Activity} color="green" />
        <KpiCard label="Risks Detected"      value="37"          delta="18 critical" positive={false} icon={AlertTriangle} color="red" />
        <KpiCard label="Avg Confidence"      value="92.1%"       delta="+0.4pts" icon={Target} color="violet" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {AI_AGENTS.map(ag => (
          <Card key={ag.name} className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="text-sm font-semibold text-black leading-tight">{ag.name}</div>
                <div className="text-xs text-black/50 mt-0.5 leading-relaxed">{ag.role}</div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap flex-shrink-0 ${ag.status === "Active" ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-500"}`}>{ag.status}</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full bg-black" style={{ width: `${ag.conf}%` }} />
              </div>
              <span className="text-xs font-bold text-black">{ag.conf}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-black/40">{ag.actions.toLocaleString()} actions logged</span>
              <button onClick={() => onAction(`Consulting ${ag.name}`)} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 transition-colors">Consult</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Generic placeholder tab for remaining modules
// ══════════════════════════════════════════════════════════════════════════
function GenericTab({ title, kpis, features }: {
  title: string;
  kpis: { label: string; value: string; delta?: string; icon: React.ElementType; color: "blue"|"green"|"amber"|"red"|"violet"|"cyan"|"orange"|"pink" }[];
  features: { title: string; desc: string }[];
}) {
  return (
    <div className="space-y-6">
      <div className={`grid grid-cols-2 ${kpis.length > 4 ? "md:grid-cols-3 lg:grid-cols-6" : "md:grid-cols-4"} gap-3`}>
        {kpis.map(k => <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} icon={k.icon} color={k.color} />)}
      </div>
      <FeatureGrid features={features} />
    </div>
  );
}

// ── Path → Tab mapping ────────────────────────────────────────────────────
const PATH_TAB_MAP: Record<string, Tab> = {
  "/budget":             "Executive Command",
  "/budget/centres":     "Budget Centres",
  "/budget/formulation": "Formulation",
  "/budget/execution":   "Budget Execution",
  "/budget/commitments": "Commitments",
  "/budget/expenditure": "Expenditure",
  "/budget/revenue":     "Revenue",
  "/budget/treasury":    "Treasury & Cash",
  "/budget/fraud":       "Fraud Detection",
  "/budget/ai-agents":   "AI Agents",
};

// ══════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function BudgetManagementPage() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [scrolling, setScrolling] = useState(false);
  const [navSearch, setNavSearch] = useState("");

  // Derive the initial tab from the URL so every sub-route opens its own tab
  const initialTab = useMemo<Tab>(
    () => PATH_TAB_MAP[pathname] ?? "Executive Command",
    [pathname],
  );
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const handleAction = (msg: string) => {
    pushSeniorAlert(msg, "info", { from: user?.name, fromRole: user?.role ?? "officer", category: "action" });
    pushNotification(msg, "success");
    toast(msg, "success");
  };

  const startScroll = () => {
    if (scrollTimerRef.current) return;
    setScrolling(true);
    scrollTimerRef.current = setInterval(() => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
        el.scrollTop = 0; // loop back to top
      } else {
        el.scrollTop += 2;
      }
    }, 30);
  };

  const stopScroll = () => {
    if (scrollTimerRef.current) {
      clearInterval(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }
    setScrolling(false);
  };

  const renderTab = () => {
    switch (activeTab) {
      case "Executive Command":  return <ExecutiveCommandTab />;
      case "Budget Centres":     return <BudgetCentresTab onAction={handleAction} />;
      case "Formulation":        return (
        <GenericTab title="Budget Formulation" kpis={[
          { label: "Requests Submitted", value: "48",       delta: "+6 pending",    icon: FileText,      color: "blue"   },
          { label: "Approved",           value: "31",       delta: "of 48",         icon: CheckCircle2,  color: "green"  },
          { label: "Pending Review",     value: "12",       delta: "awaiting sign-off", icon: Clock,     color: "amber"  },
          { label: "AI Risk Flags",      value: "9",        delta: "padding detected",  icon: AlertTriangle, color: "red" },
        ]} features={[
          { title: "Department Submissions",   desc: "Structured budget templates for each department with AI auto-population of historical data." },
          { title: "Scenario Modelling",       desc: "Model multiple budget scenarios — optimistic, base case, pessimistic — with AI cost projections." },
          { title: "Zero-Based Budgeting",     desc: "Justify every line item from scratch. AI validates each request against mission objectives." },
          { title: "Activity-Based Budgeting", desc: "Allocate budgets based on planned activities and programme outputs with KPI linkage." },
          { title: "Inflation Adjustments",    desc: "Automatic inflation-adjustment calculations applied to multi-year expenditure forecasts." },
          { title: "Budget Consolidation",     desc: "Automatic consolidation from department level to ministry master to national framework." },
        ]} />
      );
      case "Approval Workflow":  return (
        <GenericTab title="Budget Approval Workflow" kpis={[
          { label: "Awaiting Review",    value: "12",   delta: "by Treasury",          icon: Clock,      color: "amber"  },
          { label: "Approved Budgets",   value: "31",   delta: "this cycle",            icon: CheckCircle2, color: "green"},
          { label: "Avg Approval Time",  value: "4.2 days", delta: "-1.1 days vs last", icon: Activity,  color: "blue"   },
          { label: "Escalations",        value: "3",    delta: "to Cabinet level",      icon: AlertTriangle, color: "red"},
        ]} features={[
          { title: "Multi-Level Approval Chain", desc: "Configurable approval routes: Department Head → CFO → Treasury → Cabinet for different thresholds." },
          { title: "Automated Routing",          desc: "System auto-routes budgets based on value, type, and ministry with SLA tracking." },
          { title: "Delegation Management",      desc: "Manage approval delegation during leave periods with full audit trail." },
          { title: "Escalation Workflows",       desc: "Automatic escalation for overdue approvals, threshold breaches, and conflict-of-interest flags." },
          { title: "Committee Review Support",   desc: "Budget committee review tools with collaborative annotation and voting." },
          { title: "Approval Fraud Detection",   desc: "AI detects approval bypasses, concentration, and unusual approval patterns." },
        ]} />
      );
      case "Budget Execution":   return <BudgetExecutionTab />;
      case "Procurement Control": return (
        <GenericTab title="Procurement Budget Control" kpis={[
          { label: "Procurement Plans Approved", value: "284",   delta: "this FY",    icon: CheckCircle2, color: "green" },
          { label: "Budget Reservations",        value: "USD 618M", delta: "active",  icon: Lock,        color: "blue"  },
          { label: "Unfunded Tenders",           value: "4",     delta: "blocked",    icon: XCircle,     color: "red"   },
          { label: "Vendor Collusion Score",     value: "72/100",delta: "High",       icon: AlertTriangle, color: "amber"},
        ]} features={[
          { title: "Procurement Planning",       desc: "Link every procurement to an approved budget line before advertising. Unfunded tenders are blocked." },
          { title: "Budget Reservation",         desc: "Reserve funds at planning stage to prevent over-commitment across the fiscal year." },
          { title: "Tender Funding Validation",  desc: "System validates budget availability before publishing any tender or RFQ." },
          { title: "Contract Funding Control",   desc: "Contract values must be within approved budget reservation. Overruns require formal approval." },
          { title: "Procurement Fraud Detection",desc: "AI monitors for bid rigging, vendor collusion, overpricing, and inflated quotations." },
          { title: "Threshold Enforcement",      desc: "Automatic enforcement of procurement thresholds with escalation for exceptions." },
        ]} />
      );
      case "Commitments":        return <CommitmentsTab onAction={handleAction} />;
      case "Expenditure":        return (
        <GenericTab title="Expenditure Management" kpis={[
          { label: "Total Payments YTD",   value: "USD 2.01B", delta: "+6.2%",       icon: DollarSign,  color: "blue"  },
          { label: "Pending Payments",     value: "84",        delta: "USD 42M",      icon: Clock,       color: "amber" },
          { label: "Duplicate Attempts",   value: "7",         delta: "all blocked",  icon: XCircle,     color: "red"   },
          { label: "Suspicious Payments",  value: "12",        delta: "under review", icon: AlertTriangle, color: "violet"},
        ]} features={[
          { title: "Payment Processing",      desc: "Full payment lifecycle: request, matching (PO-GRN-Invoice), approval, disbursement, receipt." },
          { title: "3-Way Matching",          desc: "Automatic matching of purchase orders, goods received notes, and invoices before payment." },
          { title: "Duplicate Payment Block", desc: "AI and system rules prevent duplicate payments across all payment batches." },
          { title: "Vendor Verification",     desc: "Verify vendor bank accounts and tax status before every payment run." },
          { title: "Spend Analytics",         desc: "Analyse spending by category, department, programme, project, and vendor." },
          { title: "Payment Splitting Detection", desc: "AI detects artificial payment splitting designed to bypass approval thresholds." },
        ]} />
      );
      case "Revenue":            return <RevenueTab />;
      case "Treasury & Cash":    return (
        <GenericTab title="Treasury & Cash Flow" kpis={[
          { label: "Cash Position",     value: "USD 428M",  delta: "Healthy",    icon: Wallet,      color: "green"  },
          { label: "Cash Forecast 30d", value: "USD 412M",  delta: "+14M inflow",icon: TrendingUp,  color: "blue"   },
          { label: "Liquidity Ratio",   value: "2.4x",      delta: "Adequate",   icon: Activity,    color: "cyan"   },
          { label: "Idle Cash Detected",value: "USD 124M",  delta: "3 accounts", icon: AlertTriangle, color: "amber"},
        ]} features={[
          { title: "Cash Flow Forecasting",  desc: "Daily, weekly, and monthly cash flow forecasting with AI-powered scenario analysis." },
          { title: "Liquidity Management",   desc: "Monitor liquidity ratios and trigger alerts when cash reserves fall below safe thresholds." },
          { title: "Fund Release Scheduling",desc: "Optimise timing of fund releases to departments based on cash availability and commitments." },
          { title: "Idle Cash Detection",    desc: "AI identifies idle cash in departmental accounts and recommends redeployment." },
          { title: "Unauthorised Transfer Block", desc: "Automatic block on transfers outside authorised accounts with immediate alert to Treasury." },
          { title: "Treasury Reporting",     desc: "Daily treasury positions, weekly cash flow statements, and monthly liquidity reports." },
        ]} />
      );
      case "Projects":           return (
        <GenericTab title="Project Budget Management" kpis={[
          { label: "Capital Projects",   value: "42",        delta: "8 troubled",    icon: Layers,       color: "blue"  },
          { label: "Total Capital Budget",value: "USD 840M", delta: "FY2026",        icon: Wallet,       color: "green" },
          { label: "Cost Overrun Risk",  value: "12 projects",delta: "USD 84M exposure", icon: AlertTriangle, color: "red"},
          { label: "Avg Cost Variance",  value: "+8.4%",     delta: "vs plan",       icon: TrendingUp,   color: "amber" },
        ]} features={[
          { title: "Project Budget Tracking",  desc: "Track project budgets from inception to closeout with milestone-based release of funds." },
          { title: "Cost Overrun Prediction",  desc: "AI predicts overruns 60–90 days in advance using earned value and spend velocity." },
          { title: "Milestone-Based Funding",  desc: "Release project funds only upon verified milestone completion and quality sign-off." },
          { title: "Contractor Performance",   desc: "Track contractor spend, quality, and schedule performance against contract targets." },
          { title: "Capital Project Cashflows",desc: "Monthly cashflow projections for each capital project with funding gap identification." },
          { title: "Project Risk Intelligence",desc: "AI rates schedule risk, cost risk, and contractor risk for every active project." },
        ]} />
      );
      case "Grants & Donors":    return (
        <GenericTab title="Grants & Donor Funding" kpis={[
          { label: "Active Grants",      value: "18",        delta: "USD 284M total",icon: FileText,    color: "blue"  },
          { label: "Drawdowns YTD",      value: "USD 124M",  delta: "43.7%",         icon: TrendingDown,color: "green" },
          { label: "Donor Compliance",   value: "96.4%",     delta: "+1.2pts",       icon: ShieldCheck, color: "green" },
          { label: "Compliance Issues",  value: "2",         delta: "minor findings",icon: AlertTriangle, color: "amber"},
        ]} features={[
          { title: "Grant Budget Management",  desc: "Separate tracking of each grant with donor-specific budget codes and reporting." },
          { title: "Donor Compliance Monitoring", desc: "Continuous monitoring of fund usage against donor restrictions and conditions." },
          { title: "Funding Drawdown",         desc: "Structured drawdown requests with supporting documentation and donor approval workflow." },
          { title: "Grant Reporting",          desc: "Automated generation of donor reports in required formats with AI narrative." },
          { title: "Multi-Currency Support",   desc: "Manage grants in multiple currencies with automated exchange rate adjustments." },
          { title: "Grant Misuse Detection",   desc: "AI flags any usage of donor funds outside approved purposes for investigation." },
        ]} />
      );
      case "Fraud Detection":    return <FraudDetectionTab onAction={handleAction} />;
      case "Corruption Intel":   return (
        <GenericTab title="Corruption Intelligence" kpis={[
          { label: "Corruption Risk Score",   value: "61/100",  delta: "Medium",       icon: Flag,        color: "amber" },
          { label: "Conflict of Interest",    value: "8 cases", delta: "under review", icon: Users,       color: "violet"},
          { label: "Bid Rigging Score",       value: "44/100",  delta: "Moderate",     icon: AlertTriangle, color: "amber"},
          { label: "Vendor Relationships",    value: "12",      delta: "flagged",      icon: Eye,         color: "red"   },
        ]} features={[
          { title: "Conflict of Interest Detection", desc: "AI maps employee and approver relationships to vendors to identify undisclosed conflicts." },
          { title: "Bid Rigging Analytics",    desc: "Statistical analysis of bid patterns, prices, and timelines to detect collusion." },
          { title: "Influence Network Mapping",desc: "Visualise employee-vendor-contract networks to identify suspicious influence patterns." },
          { title: "Nepotism & Favouritism",   desc: "Track award patterns to identify systematic favouritism toward specific vendors." },
          { title: "Procurement Integrity",    desc: "End-to-end integrity scoring for every tender from advertising to award." },
          { title: "Ethics Investigation",     desc: "Case management tools for ethics and corruption investigations with evidence collection." },
        ]} />
      );
      case "Waste Detection":    return (
        <GenericTab title="Waste Detection" kpis={[
          { label: "Waste Risk Score",      value: "38/100",    delta: "Low-Medium",   icon: Flag,        color: "amber" },
          { label: "Duplicate Purchases",   value: "14",        delta: "USD 2.8M",     icon: RefreshCw,   color: "red"   },
          { label: "Idle Assets Detected",  value: "38",        delta: "USD 4.2M value",icon: Layers,     color: "amber" },
          { label: "Savings Potential",     value: "USD 8.4M",  delta: "identified",   icon: TrendingUp,  color: "green" },
        ]} features={[
          { title: "Duplicate Purchase Detection", desc: "AI identifies duplicate or near-duplicate procurements across departments." },
          { title: "Idle Asset Identification",    desc: "Cross-reference asset register with usage data to flag underutilised resources." },
          { title: "Excess Inventory Detection",   desc: "Identify overstocked items with low turnover for redistribution or disposal." },
          { title: "Spend Efficiency Analysis",    desc: "ROI analysis by programme and activity to identify low-value expenditures." },
          { title: "Savings Recommendations",      desc: "AI generates actionable savings recommendations with estimated financial impact." },
          { title: "Value for Money Scoring",      desc: "Score every procurement on cost, quality, and delivery against market benchmarks." },
        ]} />
      );
      case "Compliance":         return (
        <GenericTab title="Budget Compliance" kpis={[
          { label: "Overall Compliance",    value: "94.2%",    delta: "+1.8pts",      icon: ShieldCheck, color: "green"  },
          { label: "Open Violations",       value: "11",       delta: "2 critical",   icon: AlertTriangle, color: "red"  },
          { label: "Repeat Violations",     value: "3",        delta: "escalated",    icon: Flag,        color: "amber"  },
          { label: "Treasury Compliance",   value: "97.1%",    delta: "Excellent",    icon: CheckCircle2,color: "green"  },
        ]} features={[
          { title: "Budget Law Compliance",        desc: "Continuous monitoring against Public Finance Management Act, Treasury Instructions, and regulations." },
          { title: "Procurement Law Compliance",   desc: "Real-time compliance checking against PPDPA 2018 and subsequent amendments." },
          { title: "Donor Compliance",             desc: "Ensure all donor-funded activities comply with funding agreements and restrictions." },
          { title: "Segregation of Duties",        desc: "Enforce and monitor segregation of duties across all financial processes." },
          { title: "Policy Enforcement",           desc: "AI monitors all transactions against internal financial policies and procedures." },
          { title: "Compliance Trend Analytics",   desc: "Track compliance scores over time and predict emerging compliance risks." },
        ]} />
      );
      case "Audit":              return (
        <GenericTab title="Continuous Audit" kpis={[
          { label: "Audit Findings Open",  value: "28",       delta: "4 critical",   icon: AlertTriangle, color: "red"  },
          { label: "Findings Closed YTD",  value: "84",       delta: "+12 this month",icon: CheckCircle2, color: "green" },
          { label: "Transactions Audited", value: "18,421",   delta: "100% coverage", icon: Activity,    color: "blue"  },
          { label: "Auto-Findings",        value: "62",       delta: "AI-generated",  icon: Zap,         color: "violet"},
        ]} features={[
          { title: "Continuous Audit Monitoring", desc: "AI audits every transaction in real-time — no sampling, full population testing." },
          { title: "Evidence Collection",          desc: "Automatic collection and archiving of supporting documentation for every transaction." },
          { title: "Audit Case Management",        desc: "Structured case management for audit findings with owner assignment and resolution tracking." },
          { title: "Internal Audit Support",       desc: "Tools for internal audit teams including risk-based audit planning and workpaper management." },
          { title: "OAG Preparation",              desc: "Automated preparation of audit files and responses for Office of the Auditor-General." },
          { title: "Repeat Finding Analytics",     desc: "Track and escalate systemic issues that produce repeat audit findings year over year." },
        ]} />
      );
      case "Lifecycle Tower":    return (
        <LifecycleTower
          title="Budget Lifecycle Tower — 10 Stages"
          subtitle="From formulation through evaluation and learning. Click any stage for the full toolset."
          stages={BUDGET_STAGES}
          context="Budget Management"
          badgeLabel="10 Stages · Full Lifecycle"
        />
      );
      case "Budget Intelligence": return (
        <div className="rounded-2xl border border-black/8 overflow-hidden bg-white" style={{ minHeight: 600 }}>
          <BudgetIntelligenceCentre />
        </div>
      );
      default:                   return <ExecutiveCommandTab />;
    }
  };

  // Filter nav groups by search
  const filteredGroups = useMemo(() => {
    if (!navSearch.trim()) return NAV_GROUPS;
    const q = navSearch.toLowerCase();
    return NAV_GROUPS
      .map(g => ({ ...g, items: g.items.filter(it => it.label.toLowerCase().includes(q)) }))
      .filter(g => g.items.length > 0);
  }, [navSearch]);

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        {/* ── Page Context Bar: Ministry · Module · Process · Financial Year · AI ── */}
        <PageContextBar
          ministry="Ministry of Finance & Economic Development"
          module="Budget Management"
          process={activeTab}
          financialYear="FY2026"
          pageType="dashboard"
        />

        {/* ── Top header ── */}
        <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-black/8 bg-white flex-shrink-0">
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <Badge tone="violet">Budget Management</Badge>
            <Badge tone="muted">Government of Zimbabwe · FY2026</Badge>
          </div>
          <PageHeader
            title="Budget Management"
            description="End-to-end budget lifecycle — from strategic planning and formulation through execution, control, audit, and AI-powered financial intelligence."
            actions={
              <div className="flex gap-2 flex-wrap items-center">
                <div className="flex items-center gap-1 border border-black/10 rounded-xl overflow-hidden">
                  <button onClick={startScroll} disabled={scrolling}
                    className={`h-9 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors ${scrolling ? "bg-black text-white cursor-default" : "hover:bg-gray-50 text-black/70"}`}>
                    ▶ Start Scroll
                  </button>
                  <div className="w-px h-5 bg-black/10"/>
                  <button onClick={stopScroll} disabled={!scrolling}
                    className={`h-9 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors ${!scrolling ? "text-black/30 cursor-default" : "hover:bg-gray-50 text-black/70"}`}>
                    ■ Stop
                  </button>
                </div>
                <button onClick={() => handleAction("Budget report exported")}
                  className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
                  <Download className="h-4 w-4" /> Export
                </button>
                <button onClick={() => handleAction("New budget submission created")}
                  className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 flex items-center gap-1.5 transition-colors">
                  <Plus className="h-4 w-4" /> New Budget
                </button>
              </div>
            }
          />
        </div>

        {/* ── Body: sidebar + content ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── Sidebar ── */}
          <aside className="w-60 flex-shrink-0 bg-white border-r border-black/8 flex flex-col overflow-y-auto">
            {/* Search */}
            <div className="p-3 border-b border-black/8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
                <input
                  value={navSearch}
                  onChange={e => setNavSearch(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full pl-8 pr-3 h-9 rounded-xl border-2 border-slate-200 text-xs bg-white text-black placeholder-black/30 focus:outline-none"
                />
              </div>
            </div>

            {/* Groups */}
            <div className="flex-1 p-2 space-y-0.5">
              {filteredGroups.map(group => (
                <div key={group.label} className="mb-1">
                  {/* Group header */}
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <group.icon className="h-4 w-4 flex-shrink-0 text-[#0f172a]" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0f172a]">{group.label}</span>
                  </div>

                  {/* Items — 2-column grid */}
                  <div className="grid grid-cols-2 gap-0.5 px-1 pb-2">
                    {group.items.map(item => {
                      const isActive = activeTab === item.label;
                      return (
                        <button
                          key={item.label}
                          onClick={() => { setActiveTab(item.label); stopScroll(); }}
                          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-left transition-colors group
                            ${isActive
                              ? "bg-slate-50 border border-slate-200"
                              : "hover:bg-gray-50 border border-transparent"
                            }`}
                        >
                          <item.icon className={`h-3.5 w-3.5 flex-shrink-0 transition-colors
                            ${isActive ? "text-[#0F172A]" : "text-black/30 group-hover:text-black/60"}`} />
                          <span className={`text-[11px] leading-tight font-medium transition-colors
                            ${isActive ? "text-[#0F172A] font-semibold" : "text-black/60 group-hover:text-black/80"}`}>
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="h-px bg-black/5 mx-2" />
                </div>
              ))}
            </div>
          </aside>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0 overflow-y-auto bg-[#f8fafc]" ref={scrollRef}>
            <div className="p-4 sm:p-6 max-w-[1400px]">
              {renderTab()}
            </div>
          </div>
        </div>
      </div>
      <InlineWorkbench context="Budget" />
    </AppShell>
  );
}
