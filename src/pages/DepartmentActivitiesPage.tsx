import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { pushNotification, pushSeniorAlert } from "@/lib/local-store";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Building2, CheckCircle2, Clock, AlertTriangle, Target, Download, Filter,
  RefreshCw, Plus, Calendar, Users, FileText, TrendingUp, BarChart3,
  Shield, MessageSquare, Zap, BookOpen, Lightbulb, Cpu, ChevronRight,
  Package, Layers, Star, Eye, Activity,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F97316"];

const DEPT_OVERVIEW = {
  name: "Procurement & Supply Chain",
  head: "Director T. Moyo",
  staff: 42,
  healthScore: 84,
  activeProjects: 8,
  openTasks: 128,
  overdueTasks: 14,
  budgetUtilisation: 67,
};

const DEPT_PROJECTS = [
  { id: "DP-001", name: "National e-Procurement Portal Phase II", status: "In Progress", progress: 62, budget: "USD 2.4M", spent: "USD 1.5M", lead: "A. Mpofu", due: "2026-09-30", priority: "Critical" },
  { id: "DP-002", name: "Vendor Prequalification Database Upgrade", status: "Planning", progress: 20, budget: "USD 480K", spent: "USD 96K", lead: "P. Dube", due: "2026-10-15", priority: "High" },
  { id: "DP-003", name: "Contract Management SOP Rollout", status: "In Progress", progress: 78, budget: "USD 120K", spent: "USD 94K", lead: "S. Nkosi", due: "2026-07-31", priority: "High" },
  { id: "DP-004", name: "Annual Procurement Audit Preparation", status: "At Risk", progress: 34, budget: "USD 80K", spent: "USD 27K", lead: "R. Chikwanda", due: "2026-07-20", priority: "Critical" },
  { id: "DP-005", name: "Supplier Development Programme 2026", status: "On Hold", progress: 15, budget: "USD 340K", spent: "USD 51K", lead: "J. Banda", due: "2026-12-31", priority: "Medium" },
];

const DEPT_TASKS = [
  { id: "DT-001", title: "Finalise Q3 procurement plan", assignee: "A. Mpofu", priority: "Critical", due: "2026-06-25", status: "In Progress", category: "Planning" },
  { id: "DT-002", title: "Review 18 pending tender evaluations", assignee: "P. Dube", priority: "High", due: "2026-06-24", status: "In Progress", category: "Evaluation" },
  { id: "DT-003", title: "Submit monthly compliance report", assignee: "S. Nkosi", priority: "High", due: "2026-06-22", status: "Overdue", category: "Compliance" },
  { id: "DT-004", title: "Update vendor prequalification list", assignee: "R. Chikwanda", priority: "Medium", due: "2026-06-28", status: "Not Started", category: "Vendor Mgmt" },
  { id: "DT-005", title: "Prepare award recommendation memo", assignee: "T. Moyo", priority: "Critical", due: "2026-06-26", status: "In Progress", category: "Awards" },
  { id: "DT-006", title: "SOP review — contract amendment procedures", assignee: "J. Banda", priority: "Medium", due: "2026-06-30", status: "Not Started", category: "Governance" },
  { id: "DT-007", title: "PPRA reporting — June submission", assignee: "T. Moyo", priority: "High", due: "2026-07-05", status: "Not Started", category: "Compliance" },
  { id: "DT-008", title: "Quarterly budget reconciliation", assignee: "R. Chikwanda", priority: "High", due: "2026-06-23", status: "In Progress", category: "Finance" },
];

const WORKLOAD_TREND = [
  { week: "W21", tasks: 48, completed: 42, overdue: 6 },
  { week: "W22", tasks: 52, completed: 46, overdue: 8 },
  { week: "W23", tasks: 44, completed: 40, overdue: 5 },
  { week: "W24", tasks: 58, completed: 44, overdue: 14 },
  { week: "W25", tasks: 62, completed: 50, overdue: 12 },
];

const BUDGET_TREND = [
  { month: "Jan", allocated: 480, spent: 320, forecast: 480 },
  { month: "Feb", allocated: 480, spent: 390, forecast: 480 },
  { month: "Mar", allocated: 480, spent: 410, forecast: 480 },
  { month: "Apr", allocated: 520, spent: 360, forecast: 520 },
  { month: "May", allocated: 520, spent: 480, forecast: 530 },
  { month: "Jun", allocated: 520, spent: 350, forecast: 540 },
];

const DEPT_RISKS = [
  { id: "DR-001", risk: "Procurement plan approval delayed by finance", level: "High", status: "Open", owner: "T. Moyo", dateLogged: "2026-06-10" },
  { id: "DR-002", risk: "Insufficient evaluators for Q3 tender surge", level: "Critical", status: "Escalated", owner: "P. Dube", dateLogged: "2026-06-08" },
  { id: "DR-003", risk: "SOP documentation out of date — compliance risk", level: "Medium", status: "Mitigating", owner: "S. Nkosi", dateLogged: "2026-06-01" },
  { id: "DR-004", risk: "Budget overrun risk — e-Procurement project", level: "High", status: "Open", owner: "A. Mpofu", dateLogged: "2026-06-15" },
];

const ANNOUNCEMENTS = [
  { title: "Q3 Procurement Planning Workshop — 28 June 2026", type: "Notice", date: "2026-06-20", author: "Director T. Moyo", priority: "High" },
  { title: "Updated Anti-Corruption Declaration Form — All Staff", type: "Compliance", date: "2026-06-18", author: "Compliance Unit", priority: "High" },
  { title: "New SOP: Framework Agreement Management", type: "Policy", date: "2026-06-15", author: "Legal Unit", priority: "Medium" },
  { title: "System Maintenance: e-Procurement Portal — 25 June 01:00–04:00", type: "ICT", date: "2026-06-14", author: "ICT Department", priority: "Low" },
  { title: "Staff Recognition: Outstanding performance — T. Moyo, M. Dlamini", type: "HR", date: "2026-06-12", author: "HR Unit", priority: "Low" },
];

const SOPS = [
  { title: "Procurement Planning & Demand Forecasting", version: "v3.2", updated: "2026-03-01", status: "Current" },
  { title: "Tender Preparation & Advertisement", version: "v4.1", updated: "2026-01-15", status: "Current" },
  { title: "Bid Evaluation Procedures", version: "v5.0", updated: "2026-04-10", status: "Current" },
  { title: "Contract Award & Notification", version: "v3.8", updated: "2025-11-20", status: "Under Review" },
  { title: "Contract Management & Administration", version: "v2.4", updated: "2025-08-30", status: "Outdated" },
  { title: "Vendor Prequalification Process", version: "v4.0", updated: "2026-05-01", status: "Current" },
];

const RESOURCE_ALLOC = [
  { resource: "Senior Officers", allocated: 8, used: 7, utilisation: 88 },
  { resource: "Procurement Officers", allocated: 22, used: 20, utilisation: 91 },
  { resource: "Support Staff", allocated: 12, used: 9, utilisation: 75 },
  { resource: "Budget (USD M)", allocated: 3.2, used: 2.14, utilisation: 67 },
  { resource: "Office Equipment", allocated: 45, used: 38, utilisation: 84 },
];

const TASK_STATUS_TONE: Record<string, "green"|"blue"|"amber"|"red"|"muted"|"violet"> = {
  "In Progress": "blue", Completed: "green", Overdue: "red", "Not Started": "muted", "On Hold": "violet",
};

const RISK_TONE: Record<string, "red"|"amber"|"muted"|"violet"> = {
  Critical: "red", High: "amber", Medium: "muted", Low: "muted",
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  "Department Dashboard", "Projects & Milestones", "Activities & Tasks",
  "Performance", "Communications", "Resource Management", "Knowledge Base", "Automation",
] as const;
type Tab = typeof TABS[number];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DepartmentActivitiesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Department Dashboard");
  const { user } = useAuth();

  const handleAction = (msg: string) => {
    pushNotification(msg, "success");
    pushSeniorAlert(msg, "info");
  };

  const handleFilter = () => handleAction("Department filter panel opened — select department, period or category to narrow results.");
  const handleExport = () => handleAction("Department activities report exported — PDF/Excel will download shortly.");

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Department Management"
        process="Department Activities"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Department Activities Workbench"
          description="Department planning, coordination, performance management, communications, and strategic execution."
          actions={
            <>
              <button onClick={() => handleAction("New task created")} className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> New Task
              </button>
              <button onClick={() => handleFilter()} className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm flex items-center gap-1.5 hover:bg-[#EAF1F8] transition-colors">
                <Filter className="h-4 w-4" /><span className="hidden sm:inline">Filter</span>
              </button>
              <button onClick={() => handleExport()} className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm flex items-center gap-1.5 hover:bg-[#EAF1F8] transition-colors">
                <Download className="h-4 w-4" /><span className="hidden sm:inline">Export</span>
              </button>
            </>
          }
        />

        <div className="flex gap-1 mb-6 border-b border-black/10 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap flex-shrink-0 transition-colors ${
                activeTab === tab ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Department Dashboard" && <DeptDashboard onAction={handleAction} />}
        {activeTab === "Projects & Milestones" && <DeptProjects onAction={handleAction} />}
        {activeTab === "Activities & Tasks" && <DeptActivities onAction={handleAction} />}
        {activeTab === "Performance" && <DeptPerformance />}
        {activeTab === "Communications" && <DeptCommunications onAction={handleAction} />}
        {activeTab === "Resource Management" && <DeptResources onAction={handleAction} />}
        {activeTab === "Knowledge Base" && <DeptKnowledge onAction={handleAction} />}
        {activeTab === "Automation" && <DeptAutomation onAction={handleAction} />}
      </div>
    </AppShell>
  );
}

// ─── Tab: Department Dashboard ────────────────────────────────────────────────
function DeptDashboard({ onAction }: { onAction: (m: string) => void }) {
  return (
    <div className="space-y-6">
      {/* Department Header Card */}
      <div className="bg-black text-white rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-white/50 uppercase tracking-wider mb-1">Active Department</div>
          <div className="text-xl font-bold tracking-tight">{DEPT_OVERVIEW.name}</div>
          <div className="text-sm text-white/60 mt-1">{DEPT_OVERVIEW.head} · {DEPT_OVERVIEW.staff} staff members</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{DEPT_OVERVIEW.healthScore}</div>
            <div className="text-[11px] text-white/50">Health Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{DEPT_OVERVIEW.activeProjects}</div>
            <div className="text-[11px] text-white/50">Active Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{DEPT_OVERVIEW.budgetUtilisation}%</div>
            <div className="text-[11px] text-white/50">Budget Used</div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Open Tasks" value="128" delta="14 overdue" positive={false} icon={CheckCircle2} color="blue" />
        <KpiCard label="Dept KPI Score" value="84%" delta="+3 pts" icon={Target} color="green" />
        <KpiCard label="Budget Utilisation" value="67%" delta="On track" icon={BarChart3} color="violet" />
        <KpiCard label="Compliance Score" value="91%" delta="+2 pts" icon={Shield} color="cyan" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Workload & Completion Trend" subtitle="Weekly task load — current period" />
          <div className="p-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WORKLOAD_TREND} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="tasks" name="Tasks Added" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#334155" radius={[3, 3, 0, 0]} />
                <Bar dataKey="overdue" name="Overdue" fill="#DC2626" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Department Risks" subtitle="Open risk register" />
          <div className="divide-y divide-black/5">
            {DEPT_RISKS.map(r => (
              <div key={r.id} className="px-4 py-3 hover:bg-[#EAF1F8]/50">
                <div className="flex items-start gap-2 mb-1">
                  <div className={`h-2 w-2 rounded-full mt-1 flex-shrink-0 ${r.level === "Critical" ? "bg-red-500" : r.level === "High" ? "bg-slate-400" : "bg-slate-400"}`} />
                  <div className="text-xs font-medium text-black leading-snug">{r.risk}</div>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <Badge tone={RISK_TONE[r.level]}>{r.level}</Badge>
                  <span className="text-[10px] text-black/40">{r.owner}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Budget Trend */}
      <Card>
        <CardHeader title="Budget Allocation vs Spend" subtitle="YTD spending against departmental allocation (USD '000)" />
        <div className="p-4 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={BUDGET_TREND}>
              <defs>
                <linearGradient id="gAlloc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#334155" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#334155" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#475569" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="allocated" name="Allocated" stroke="#334155" fill="url(#gAlloc)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="spent" name="Spent" stroke="#475569" fill="url(#gSpent)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Projects & Milestones ───────────────────────────────────────────────
function DeptProjects({ onAction }: { onAction: (m: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Active Projects" value="8" delta="2 at risk" positive={false} icon={Layers} color="blue" />
        <KpiCard label="On-Time Delivery" value="75%" delta="-5 pts" positive={false} icon={Calendar} color="amber" />
        <KpiCard label="Budget Adherence" value="82%" delta="+4 pts" icon={Target} color="green" />
        <KpiCard label="Milestones Due (30d)" value="12" delta="4 at risk" positive={false} icon={AlertTriangle} color="red" />
      </div>

      <Card>
        <CardHeader title="Department Projects"
          action={<button onClick={() => onAction("New project created")} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Plus className="h-3 w-3" /> New Project</button>} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["Project","Lead","Priority","Progress","Budget","Spent","Due","Status",""].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {DEPT_PROJECTS.map(p => (
                <tr key={p.id} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-black">{p.name}</div>
                    <div className="text-[10px] text-black/40">{p.id}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-black/70">{p.lead}</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.priority === "Critical" ? "red" : p.priority === "High" ? "amber" : "muted"}>{p.priority}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 bg-[#EAF1F8] rounded-full overflow-hidden">
                        <div style={{ width: `${p.progress}%`, background: p.progress >= 70 ? "#475569" : p.progress >= 40 ? "#334155" : "#64748B" }} className="h-full rounded-full" />
                      </div>
                      <span className="text-xs font-semibold">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-black/60">{p.budget}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{p.spent}</td>
                  <td className="px-4 py-3 text-xs text-black/50 whitespace-nowrap">{p.due}</td>
                  <td className="px-4 py-3">
                    <Badge tone={p.status === "In Progress" ? "blue" : p.status === "Planning" ? "violet" : p.status === "At Risk" ? "red" : "muted"}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onAction(`Viewing project: ${p.name}`)} className="h-7 px-2 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1">
                      <Eye className="h-3 w-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader title="Upcoming Milestones" subtitle="Next 30 days" />
        <div className="divide-y divide-black/5">
          {[
            { project: "e-Procurement Portal Phase II", milestone: "API integration complete", due: "2026-07-05", status: "On Track", owner: "A. Mpofu" },
            { project: "Contract Management SOP", milestone: "Final document approval", due: "2026-07-10", status: "On Track", owner: "S. Nkosi" },
            { project: "Annual Audit Preparation", milestone: "Internal pre-audit complete", due: "2026-07-12", status: "At Risk", owner: "R. Chikwanda" },
            { project: "Vendor Prequalification DB", milestone: "User requirements sign-off", due: "2026-07-15", status: "Pending", owner: "P. Dube" },
            { project: "Annual Audit Preparation", milestone: "Documentation package submitted", due: "2026-07-20", status: "At Risk", owner: "R. Chikwanda" },
          ].map((m, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-[#EAF1F8]/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${m.status === "On Track" ? "bg-[#0F172A]" : m.status === "At Risk" ? "bg-red-500" : "bg-gray-300"}`} />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-black truncate">{m.milestone}</div>
                  <div className="text-[10px] text-black/40">{m.project} · {m.owner}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-black/40">{m.due}</span>
                <Badge tone={m.status === "On Track" ? "green" : m.status === "At Risk" ? "red" : "muted"}>{m.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Activities & Tasks ──────────────────────────────────────────────────
function DeptActivities({ onAction }: { onAction: (m: string) => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = DEPT_TASKS.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.assignee.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || t.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Open Tasks" value="128" delta="14 overdue" positive={false} icon={CheckCircle2} color="blue" />
        <KpiCard label="Completed This Week" value="44" delta="+6 vs last week" icon={Star} color="green" />
        <KpiCard label="Critical Priority" value="8" delta="Due this week" positive={false} icon={AlertTriangle} color="red" />
        <KpiCard label="Avg Completion Time" value="3.2 days" delta="-0.4 days" icon={Clock} color="violet" />
      </div>

      <Card>
        <CardHeader title="Department Task List"
          action={<button onClick={() => onAction("New task created")} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Plus className="h-3 w-3" /> Add Task</button>} />
        <div className="px-4 py-3 border-b border-black/5 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…"
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none" />
          </div>
          {["All", "In Progress", "Overdue", "Not Started"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors ${filter === s ? "bg-black text-white" : "border border-black/10 text-black/60 hover:bg-[#EAF1F8]"}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["Task","Category","Assignee","Priority","Due Date","Status","Action"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map(t => (
                <tr key={t.id} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-black">{t.title}</div>
                    <div className="text-[10px] text-black/40">{t.id}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-black/60">{t.category}</td>
                  <td className="px-4 py-3 text-xs text-black/70">{t.assignee}</td>
                  <td className="px-4 py-3">
                    <Badge tone={t.priority === "Critical" ? "red" : t.priority === "High" ? "amber" : "blue"}>{t.priority}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-black/50 whitespace-nowrap">{t.due}</td>
                  <td className="px-4 py-3"><Badge tone={TASK_STATUS_TONE[t.status] ?? "default"}>{t.status}</Badge></td>
                  <td className="px-4 py-3">
                    {t.status !== "Completed" && (
                      <button onClick={() => onAction(`Task marked complete: ${t.title}`)} className="h-7 px-2.5 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A] flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Complete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Performance ────────────────────────────────────────────────────────
function DeptPerformance() {
  const kpiData = [
    { kpi: "Tender Processing Time", target: "21d", actual: "18.4d", score: 88, trend: "up" },
    { kpi: "Contract Award Rate", target: "95%", actual: "97.2%", score: 97, trend: "up" },
    { kpi: "Vendor Compliance Rate", target: "90%", actual: "93.4%", score: 94, trend: "up" },
    { kpi: "Procurement Plan Adherence", target: "85%", actual: "78%", score: 78, trend: "down" },
    { kpi: "Budget Utilisation", target: "80–95%", actual: "67%", score: 72, trend: "down" },
    { kpi: "SLA Compliance", target: "90%", actual: "91.4%", score: 91, trend: "up" },
  ];

  const perfHistory = [
    { quarter: "Q3 2025", score: 79, kpiRate: 74 },
    { quarter: "Q4 2025", score: 81, kpiRate: 77 },
    { quarter: "Q1 2026", score: 83, kpiRate: 80 },
    { quarter: "Q2 2026", score: 84, kpiRate: 82 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Dept Overall Score" value="84%" delta="+1 pt" icon={TrendingUp} color="green" />
        <KpiCard label="KPIs On Target" value="4/6" delta="67% attainment" icon={Target} color="blue" />
        <KpiCard label="Benchmarking Rank" value="3rd / 12" delta="Up 2 positions" icon={Star} color="violet" />
        <KpiCard label="Compliance Score" value="91%" delta="+2 pts" icon={Shield} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="KPI Scorecard" subtitle="Current quarter performance" />
          <div className="p-4 space-y-3">
            {kpiData.map(k => (
              <div key={k.kpi} className="flex items-center gap-3">
                <div className="w-44 text-xs font-medium text-black truncate">{k.kpi}</div>
                <div className="flex-1 h-2 bg-[#EAF1F8] rounded-full overflow-hidden">
                  <div style={{ width: `${k.score}%`, background: k.score >= 90 ? "#475569" : k.score >= 80 ? "#334155" : k.score >= 70 ? "#64748B" : "#DC2626" }} className="h-full rounded-full transition-all" />
                </div>
                <span className="text-xs font-bold text-black w-8 text-right">{k.score}</span>
                <span className={`text-xs ${k.trend === "up" ? "text-slate-600" : "text-red-400"}`}>{k.trend === "up" ? "▲" : "▼"}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Performance History" subtitle="Quarterly trend" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={perfHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="score" name="Dept Score" stroke="#334155" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="kpiRate" name="KPI Rate" stroke="#475569" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Scorecard Table */}
      <Card>
        <CardHeader title="Detailed KPI Table" subtitle="Target vs actual with full context" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["KPI","Target","Actual","Score","Trend","Rating"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {kpiData.map(k => (
                <tr key={k.kpi} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3 text-xs font-semibold text-black">{k.kpi}</td>
                  <td className="px-4 py-3 text-xs text-black/50">{k.target}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-black">{k.actual}</td>
                  <td className="px-4 py-3 text-xs font-bold" style={{ color: k.score >= 90 ? "#475569" : k.score >= 80 ? "#334155" : "#64748B" }}>{k.score}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold ${k.trend === "up" ? "text-[#0F172A]" : "text-red-500"}`}>{k.trend === "up" ? "▲ Improving" : "▼ Declining"}</span></td>
                  <td className="px-4 py-3"><Badge tone={k.score >= 90 ? "green" : k.score >= 80 ? "blue" : k.score >= 70 ? "amber" : "red"}>{k.score >= 90 ? "Exceeding" : k.score >= 80 ? "Meeting" : k.score >= 70 ? "Below" : "Failing"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Communications ──────────────────────────────────────────────────────
function DeptCommunications({ onAction }: { onAction: (m: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Announcements (MTD)" value="5" delta="2 critical" icon={MessageSquare} color="blue" />
        <KpiCard label="Open Escalations" value="3" delta="1 critical" positive={false} icon={AlertTriangle} color="red" />
        <KpiCard label="Staff Notified" value="42/42" delta="100% reach" icon={Users} color="green" />
        <KpiCard label="Pending Actions" value="8" delta="From notices" positive={false} icon={Clock} color="amber" />
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader title="Department Announcements & Notices"
          action={<button onClick={() => onAction("New announcement created")} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Plus className="h-3 w-3" /> Post Notice</button>} />
        <div className="divide-y divide-black/5">
          {ANNOUNCEMENTS.map((a, i) => (
            <div key={i} className="px-4 py-4 hover:bg-[#EAF1F8]/50 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`h-8 w-8 rounded-xl grid place-items-center flex-shrink-0 ${
                  a.type === "Compliance" ? "bg-red-100 text-red-600" :
                  a.type === "Policy" ? "bg-slate-100 text-[#0F172A]" :
                  a.type === "HR" ? "bg-slate-100 text-[#0F172A]" :
                  "bg-slate-100 text-[#0F172A]"
                }`}>
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-black">{a.title}</div>
                  <div className="text-[10px] text-black/40 mt-0.5">{a.author} · {a.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge tone={a.priority === "High" ? "amber" : "muted"}>{a.priority}</Badge>
                <Badge tone="default">{a.type}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Challenges & Escalations */}
      <Card>
        <CardHeader title="Department Challenges & Escalations" subtitle="Active bottlenecks and compliance issues" />
        <div className="divide-y divide-black/5">
          {DEPT_RISKS.map(r => (
            <div key={r.id} className="px-4 py-3 flex items-start justify-between gap-4 hover:bg-[#EAF1F8]/50">
              <div className="flex items-start gap-3 min-w-0">
                <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${r.level === "Critical" ? "text-red-500" : r.level === "High" ? "text-slate-600" : "text-slate-400"}`} />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-black">{r.risk}</div>
                  <div className="text-[10px] text-black/40 mt-0.5">Owner: {r.owner} · Logged {r.dateLogged}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge tone={RISK_TONE[r.level]}>{r.level}</Badge>
                <button onClick={() => onAction(`Escalation resolved: ${r.id}`)} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8]">Resolve</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Resource Management ─────────────────────────────────────────────────
function DeptResources({ onAction }: { onAction: (m: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Workforce Utilisation" value="88%" delta="+3 pts" icon={Users} color="blue" />
        <KpiCard label="Budget Consumed" value="67%" delta="On track" icon={TrendingUp} color="green" />
        <KpiCard label="Asset Allocation" value="84%" delta="+1 pt" icon={Package} color="violet" />
        <KpiCard label="Capacity Shortfall" value="6 FTEs" delta="Peak period" positive={false} icon={AlertTriangle} color="amber" />
      </div>

      <Card>
        <CardHeader title="Resource Allocation & Utilisation" subtitle="Staff, budget, and asset utilisation" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["Resource","Allocated","In Use","Utilisation","Status"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {RESOURCE_ALLOC.map(r => (
                <tr key={r.resource} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3 text-xs font-semibold text-black">{r.resource}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{r.allocated}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{r.used}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 bg-[#EAF1F8] rounded-full overflow-hidden">
                        <div style={{ width: `${r.utilisation}%`, background: r.utilisation >= 85 ? "#475569" : r.utilisation >= 65 ? "#334155" : "#64748B" }} className="h-full rounded-full" />
                      </div>
                      <span className="text-xs font-semibold text-black">{r.utilisation}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={r.utilisation >= 85 ? "green" : r.utilisation >= 65 ? "blue" : "amber"}>
                      {r.utilisation >= 85 ? "Optimal" : r.utilisation >= 65 ? "Good" : "Under-utilised"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Capacity Planning */}
      <Card>
        <CardHeader title="Capacity Planning" subtitle="Workforce capacity vs demand — H2 2026"
          action={<button onClick={() => onAction("Capacity plan exported")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Download className="h-3 w-3" /> Export</button>} />
        <div className="p-4 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { month: "Jul", capacity: 42, demand: 44 },
              { month: "Aug", capacity: 42, demand: 46 },
              { month: "Sep", capacity: 44, demand: 50 },
              { month: "Oct", capacity: 44, demand: 47 },
              { month: "Nov", capacity: 45, demand: 48 },
              { month: "Dec", capacity: 45, demand: 46 },
            ]} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis domain={[30, 60]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="capacity" name="Current Capacity" fill="#334155" radius={[3, 3, 0, 0]} />
              <Bar dataKey="demand" name="Forecasted Demand" fill="#64748B" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Knowledge Base ──────────────────────────────────────────────────────
function DeptKnowledge({ onAction }: { onAction: (m: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="SOPs Published" value="24" delta="6 updated this quarter" icon={BookOpen} color="blue" />
        <KpiCard label="Knowledge Articles" value="148" delta="+12 this month" icon={FileText} color="green" />
        <KpiCard label="SOPs Under Review" value="5" delta="Due for update" positive={false} icon={RefreshCw} color="amber" />
        <KpiCard label="Policy Documents" value="32" delta="All current" icon={Shield} color="violet" />
      </div>

      <Card>
        <CardHeader title="SOP Repository" subtitle="Standard Operating Procedures — current status"
          action={<button onClick={() => onAction("New SOP created")} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Plus className="h-3 w-3" /> Add SOP</button>} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["SOP Title","Version","Last Updated","Status","Action"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {SOPS.map((s, i) => (
                <tr key={i} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3 text-xs font-semibold text-black">{s.title}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{s.version}</td>
                  <td className="px-4 py-3 text-xs text-black/50">{s.updated}</td>
                  <td className="px-4 py-3"><Badge tone={s.status === "Current" ? "green" : s.status === "Under Review" ? "amber" : "red"}>{s.status}</Badge></td>
                  <td className="px-4 py-3">
                    <button onClick={() => onAction(`Viewing SOP: ${s.title}`)} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1">
                      <Eye className="h-3 w-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Best Practices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Tender Preparation Checklist", type: "Best Practice", views: 284, updated: "2026-05-10", icon: FileText, color: "blue" },
          { title: "Vendor Risk Assessment Guide", type: "Guide", views: 142, updated: "2026-04-20", icon: Shield, color: "red" },
          { title: "Contract Variation Procedures", type: "Policy", views: 98, updated: "2026-03-15", icon: BookOpen, color: "violet" },
          { title: "Emergency Procurement Procedures", type: "SOP", views: 76, updated: "2026-02-28", icon: AlertTriangle, color: "amber" },
          { title: "Supplier Onboarding Manual", type: "Guide", views: 212, updated: "2026-06-01", icon: Users, color: "green" },
          { title: "KPI Measurement Framework", type: "Framework", views: 164, updated: "2026-05-25", icon: Target, color: "cyan" },
        ].map(item => {
          const Icon = item.icon;
          const bg: Record<string, string> = { blue: "bg-slate-100 text-[#0F172A]", red: "bg-red-100 text-red-600", violet: "bg-slate-100 text-[#0F172A]", amber: "bg-slate-100 text-[#0F172A]", green: "bg-slate-100 text-[#0F172A]", cyan: "bg-slate-100 text-[#0F172A]" };
          return (
            <div key={item.title} className="bg-white border border-black/8 rounded-xl p-4 hover:shadow-sm hover:border-black/15 transition-all cursor-pointer" onClick={() => onAction(`Opened: ${item.title}`)}>
              <div className={`h-8 w-8 rounded-lg grid place-items-center mb-2 ${bg[item.color]}`}><Icon className="h-4 w-4" /></div>
              <div className="text-xs font-semibold text-black mb-1">{item.title}</div>
              <div className="flex items-center justify-between text-[10px] text-black/40">
                <span>{item.type}</span>
                <span>{item.views} views · {item.updated}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab: Automation ─────────────────────────────────────────────────────────
function DeptAutomation({ onAction }: { onAction: (m: string) => void }) {
  const workflows = [
    { name: "Tender Approval Routing", trigger: "New tender submitted", status: "Active", runs: 284, success: 97, lastRun: "2 hrs ago" },
    { name: "KPI Auto-Update Engine", trigger: "Daily at 06:00", status: "Active", runs: 182, success: 100, lastRun: "6 hrs ago" },
    { name: "Compliance Alert Escalation", trigger: "SLA breach detected", status: "Active", runs: 42, success: 95, lastRun: "1 day ago" },
    { name: "Automated Monthly Reports", trigger: "Last day of month", status: "Active", runs: 6, success: 100, lastRun: "23 days ago" },
    { name: "Vendor Document Expiry Alerts", trigger: "14 days before expiry", status: "Active", runs: 128, success: 99, lastRun: "12 hrs ago" },
    { name: "Budget Variance Notification", trigger: "Spend > 10% variance", status: "Paused", runs: 18, success: 88, lastRun: "3 days ago" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Active Workflows" value="5" delta="1 paused" icon={Zap} color="blue" />
        <KpiCard label="Automation Runs (MTD)" value="660" delta="+84 vs last month" icon={Cpu} color="green" />
        <KpiCard label="Avg Success Rate" value="96.5%" delta="+0.8 pts" icon={CheckCircle2} color="violet" />
        <KpiCard label="Hours Saved (MTD)" value="142 hrs" delta="Estimated" icon={Clock} color="amber" />
      </div>

      <Card>
        <CardHeader title="Workflow Automation Engine" subtitle="All department automated workflows and their status"
          action={<button onClick={() => onAction("New workflow created")} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Plus className="h-3 w-3" /> New Workflow</button>} />
        <div className="divide-y divide-black/5">
          {workflows.map((w, i) => (
            <div key={i} className="px-4 py-4 flex items-center justify-between gap-4 hover:bg-[#EAF1F8]/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-8 w-8 rounded-xl grid place-items-center flex-shrink-0 ${w.status === "Active" ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-400"}`}>
                  <Zap className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-black">{w.name}</div>
                  <div className="text-[10px] text-black/40 mt-0.5">Trigger: {w.trigger}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0 text-right">
                <div className="hidden md:block">
                  <div className="text-xs font-semibold text-black">{w.runs}</div>
                  <div className="text-[10px] text-black/40">Total runs</div>
                </div>
                <div className="hidden md:block">
                  <div className={`text-xs font-semibold ${w.success >= 95 ? "text-[#0F172A]" : w.success >= 85 ? "text-slate-600" : "text-red-500"}`}>{w.success}%</div>
                  <div className="text-[10px] text-black/40">Success</div>
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs text-black/50">{w.lastRun}</div>
                  <div className="text-[10px] text-black/30">Last run</div>
                </div>
                <Badge tone={w.status === "Active" ? "green" : "muted"}>{w.status}</Badge>
                <button onClick={() => onAction(`Workflow toggled: ${w.name}`)} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8]">
                  {w.status === "Active" ? "Pause" : "Resume"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Automation Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { title: "Smart Approval Routing", desc: "AI routes approval requests to the right person based on value, type, and workload", icon: Zap, color: "blue" },
          { title: "KPI Auto-Calculation", desc: "Metrics updated automatically from live data — no manual entry required", icon: BarChart3, color: "green" },
          { title: "Escalation Chain Engine", desc: "Automatically escalates overdue tasks and SLA breaches up the management chain", icon: AlertTriangle, color: "red" },
          { title: "Automated Report Generation", desc: "Executive, monthly, quarterly, and compliance reports generated and distributed automatically", icon: FileText, color: "violet" },
          { title: "Document Expiry Monitoring", desc: "Tracks vendor licences, insurance, and compliance document expiry — alerts at 30/14/7 days", icon: Shield, color: "amber" },
          { title: "AI Decision Support", desc: "Provides data-driven recommendations to HODs for resource allocation and strategic decisions", icon: Lightbulb, color: "cyan" },
        ].map(f => {
          const Icon = f.icon;
          const bg: Record<string, string> = { blue: "bg-slate-100 text-[#0F172A]", green: "bg-slate-100 text-[#0F172A]", red: "bg-red-100 text-red-600", violet: "bg-slate-100 text-[#0F172A]", amber: "bg-slate-100 text-[#0F172A]", cyan: "bg-slate-100 text-[#0F172A]" };
          return (
            <div key={f.title} className="bg-white border border-black/8 rounded-xl p-4 hover:shadow-sm hover:border-black/15 transition-all">
              <div className={`h-8 w-8 rounded-lg grid place-items-center mb-2 ${bg[f.color]}`}><Icon className="h-4 w-4" /></div>
              <div className="text-xs font-semibold text-black mb-1">{f.title}</div>
              <div className="text-[11px] text-black/50 leading-relaxed">{f.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
