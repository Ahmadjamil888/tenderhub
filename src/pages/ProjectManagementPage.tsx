import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import GisMapView from "@/components/GisMapView";
import { PROJECT_PINS } from "@/lib/gis-data";
import InlineWorkbench from "@/components/InlineWorkbench";
import {
  projects, projectMilestones, projectRisks, projectTasks,
  projectSpendTrend, projectsByStatus, projectAIAgents, contractorPerformance,
  type Project, type ProjectMilestone, type ProjectRisk, type ProjectTask,
} from "@/lib/mock-data";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  Briefcase, LayoutDashboard, ClipboardList, BarChart3, Wallet, ShieldCheck,
  CheckCircle, UsersRound, Building2, FileText, Sparkles, TrendingUp,
  AlertTriangle, Clock, CheckCircle2, Activity, Plus, Download, RefreshCcw,
  ChevronRight, Star, MapPin,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";

// ── Tab definition ─────────────────────────────────────────────────────────
const TABS = [
  "Dashboard", "Project Portfolio", "Planning & WBS", "Schedule & Gantt",
  "Cost & Finance", "Risk & Issues", "Quality Management", "Resource Management",
  "Contractor Management", "Documents Repository", "Reports & Analytics", "GIS Map",
] as const;
type Tab = typeof TABS[number];

// ── Colour helpers ─────────────────────────────────────────────────────────
const STATUS_TONE: Record<string, "green" | "blue" | "amber" | "red" | "muted" | "violet"> = {
  "In Progress": "blue", "On Track": "green", "Troubled": "red",
  "Planning": "amber", "Initiation": "muted", "Completed": "green",
  "On Hold": "amber", "Cancelled": "red",
};
const RISK_TONE: Record<string, "green" | "amber" | "red" | "muted"> = {
  Low: "green", Medium: "amber", High: "red", Critical: "red",
};
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

const fmt = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`;

function act(msg: string) { pushNotification(msg, "success"); }

// ── Dashboard Tab ──────────────────────────────────────────────────────────
function DashboardTab() {
  const total       = projects.length;
  const active      = projects.filter(p => p.status === "In Progress").length;
  const delayed     = projects.filter(p => p.daysDelay > 0).length;
  const troubled    = projects.filter(p => p.status === "Troubled").length;
  const budgetTotal = projects.reduce((s, p) => s + p.budgetNum, 0);
  const spentTotal  = projects.reduce((s, p) => s + p.spentNum, 0);
  const utilPct     = Math.round((spentTotal / budgetTotal) * 100);
  const avgComplete = Math.round(projects.reduce((s, p) => s + p.progress, 0) / total);
  const avgAlloc    = 74; // resource allocation %

  return (
    <>
      {/* KPI row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        <KpiCard label="Total Projects"      value={String(total)}   delta={`${active} active`}           icon={Briefcase}     color="blue"   />
        <KpiCard label="Active Projects"     value={String(active)}  delta={`${troubled} troubled`}       icon={Activity}      color="green"  positive={troubled === 0} />
        <KpiCard label="Delayed Projects"    value={String(delayed)} delta="Behind schedule"              icon={Clock}         color="amber"  positive={false} />
        <KpiCard label="Budget Utilization"  value={`${utilPct}%`}   delta={`${fmt(spentTotal)} spent`}   icon={Wallet}        color="violet" />
        <KpiCard label="Completion Rate"     value={`${avgComplete}%`} delta="Avg across portfolio"       icon={CheckCircle2}  color="cyan"   />
        <KpiCard label="Resource Allocation" value={`${avgAlloc}%`}  delta="Avg team utilisation"         icon={UsersRound}    color="orange" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-4">
          <CardHeader title="Planned vs Actual Spend" subtitle="Cumulative $M" />
          <div className="h-52 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectSpendTrend}>
                <defs>
                  <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="month" fontSize={10}/>
                <YAxis fontSize={10}/>
                <Tooltip/>
                <Area type="monotone" dataKey="planned" name="Planned" stroke="#94a3b8" strokeDasharray="4 4" fill="none"/>
                <Area type="monotone" dataKey="actual"  name="Actual"  stroke="#3B82F6" fill="url(#ga)"/>
                <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#F59E0B" strokeDasharray="3 3" fill="none"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <CardHeader title="Portfolio Health" subtitle="By status" />
          <div className="h-52 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={(e: {value: number}) => e.value}>
                  {projectsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <CardHeader title="Budget by Category" subtitle="$M allocated" />
          <div className="h-52 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { cat: "Infrastructure", v: 204 },
                { cat: "ICT & Digital",  v: 33  },
                { cat: "Health",         v: 80  },
                { cat: "Agriculture",    v: 31  },
                { cat: "Education",      v: 7   },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="cat" fontSize={9} angle={-20} textAnchor="end" height={45}/>
                <YAxis fontSize={10}/>
                <Tooltip/>
                <Bar dataKey="v" name="$M" fill="#3B82F6" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Live project register */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-black/8 flex items-center justify-between">
          <div className="text-sm font-semibold text-black">Live Project Register</div>
          <div className="flex items-center gap-2">
            <Badge tone="blue">{total} projects</Badge>
            <button onClick={() => act("New project created")}
              className="h-7 px-3 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1 transition-colors">
              <Plus className="h-3 w-3"/> New
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#fafafa] text-black/50 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="text-left px-4 py-2.5">ID</th>
                <th className="text-left px-4 py-2.5">Project</th>
                <th className="text-left px-4 py-2.5">Manager</th>
                <th className="text-right px-4 py-2.5">Budget</th>
                <th className="text-right px-4 py-2.5">Spent</th>
                <th className="text-left px-4 py-2.5 w-36">Progress</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-center px-4 py-2.5">SPI</th>
                <th className="text-center px-4 py-2.5">CPI</th>
                <th className="text-right px-4 py-2.5">Health</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id} className="border-t border-black/5 hover:bg-[#fafafa]">
                  <td className="px-4 py-2.5 font-mono text-black/50 whitespace-nowrap">{p.id}</td>
                  <td className="px-4 py-2.5 font-medium text-black max-w-[260px]">
                    <div className="truncate">{p.title}</div>
                    <div className="text-[10px] text-black/40 mt-0.5">{p.entity}</div>
                  </td>
                  <td className="px-4 py-2.5 text-black/60 whitespace-nowrap">{p.manager}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums whitespace-nowrap">{p.budget}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-black/60 whitespace-nowrap">{p.spent}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-black/5 overflow-hidden">
                        <div className="h-full bg-[#0F172A] rounded-full" style={{ width: `${p.progress}%` }}/>
                      </div>
                      <span className="text-[10px] text-black/50 w-6 text-right">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <Badge tone={STATUS_TONE[p.status] ?? "muted"}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-xs font-semibold ${p.spi >= 1 ? "text-[#0F172A]" : p.spi >= 0.85 ? "text-[#0F172A]" : "text-red-600"}`}>{p.spi.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`text-xs font-semibold ${p.cpi >= 1 ? "text-[#0F172A]" : p.cpi >= 0.85 ? "text-[#0F172A]" : "text-red-600"}`}>{p.cpi.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`text-xs font-bold ${p.healthScore >= 80 ? "text-[#0F172A]" : p.healthScore >= 60 ? "text-[#0F172A]" : "text-red-600"}`}>{p.healthScore}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

// ── Project Portfolio Tab ──────────────────────────────────────────────────
function ProjectPortfolioTab() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  const filtered = projects.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.entity.toLowerCase().includes(q);
    const matchS = filterStatus === "All" || p.status === filterStatus;
    const matchP = filterPriority === "All" || p.priority === filterPriority;
    return matchQ && matchS && matchP;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <ChevronRight className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…"
            className="w-full h-9 pl-8 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-9 px-3 rounded-xl border border-black/10 text-sm bg-white focus:outline-none">
          {["All", "Initiation", "Planning", "In Progress", "On Hold", "Completed", "Cancelled", "Troubled"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          className="h-9 px-3 rounded-xl border border-black/10 text-sm bg-white focus:outline-none">
          {["All", "Low", "Medium", "High", "Critical"].map(p => <option key={p}>{p}</option>)}
        </select>
        <button onClick={() => act("New project initiated")}
          className="h-9 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1 transition-colors">
          <Plus className="h-3.5 w-3.5" /> New Project
        </button>
        <button onClick={() => act("Portfolio exported")}
          className="h-9 px-3 rounded-xl border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(p => (
          <Card key={p.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-black leading-tight">{p.title}</div>
                <div className="text-[11px] text-black/40 font-mono mt-0.5">{p.id} · {p.entity}</div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Badge tone={STATUS_TONE[p.status] ?? "muted"}>{p.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-black/55 mb-3">
              <span>Manager: <span className="text-black/80 font-medium">{p.manager}</span></span>
              <span>Priority: <span className={`font-medium ${p.priority === "Critical" ? "text-red-600" : p.priority === "High" ? "text-[#0F172A]" : "text-black/80"}`}>{p.priority}</span></span>
              <span>Budget: <span className="text-black/80 font-medium">{p.budget}</span></span>
              <span>Spent: <span className="text-black/80 font-medium">{p.spent}</span></span>
              <span>Phase: <span className="text-black/80 font-medium">{p.phase}</span></span>
              <span>Delay: <span className={`font-medium ${p.daysDelay > 0 ? "text-red-600" : "text-[#0F172A]"}`}>{p.daysDelay > 0 ? `${p.daysDelay}d late` : "On time"}</span></span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-2 rounded-full bg-black/5 overflow-hidden">
                <div className="h-full bg-[#0F172A] rounded-full transition-all" style={{ width: `${p.progress}%` }}/>
              </div>
              <span className="text-xs font-semibold text-black/60 w-10 text-right">{p.progress}%</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className={`font-semibold ${p.spi >= 1 ? "text-[#0F172A]" : "text-[#0F172A]"}`}>SPI {p.spi.toFixed(2)}</span>
              <span className={`font-semibold ${p.cpi >= 1 ? "text-[#0F172A]" : "text-[#0F172A]"}`}>CPI {p.cpi.toFixed(2)}</span>
              <span className={`font-semibold ${p.healthScore >= 80 ? "text-[#0F172A]" : p.healthScore >= 60 ? "text-[#0F172A]" : "text-red-600"}`}>Health {p.healthScore}/100</span>
              <button onClick={() => act(`Viewing ${p.id}`)}
                className="ml-auto h-6 px-2.5 rounded-lg bg-black text-white text-[10px] hover:bg-gray-800 transition-colors">View</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Planning & WBS Tab ─────────────────────────────────────────────────────
function PlanningWBSTab() {
  const [selProject, setSelProject] = useState(projects[0].id);
  const proj = projects.find(p => p.id === selProject)!;
  const tasks = projectTasks.filter(t => t.projectId === selProject);
  const milestones = projectMilestones.filter(m => m.projectId === selProject);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-black/60">Project:</label>
        <select value={selProject} onChange={e => setSelProject(e.target.value)}
          className="h-9 px-3 rounded-xl border border-black/10 text-sm bg-white focus:outline-none flex-1 max-w-xs">
          {projects.map(p => <option key={p.id} value={p.id}>{p.title.slice(0, 55)}…</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 col-span-2">
          <CardHeader title="Work Breakdown Structure (WBS)" subtitle={`${tasks.length} work packages`} />
          <div className="mt-2 space-y-1.5">
            {tasks.length === 0 && <div className="py-6 text-center text-sm text-black/40">No tasks defined for this project.</div>}
            {tasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 border border-black/5">
                <span className="text-[10px] font-mono text-black/40 w-8">{t.wbsCode}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-black truncate">{t.title}</div>
                  <div className="text-[10px] text-black/45 mt-0.5">{t.assignee} · {t.startDate} → {t.endDate}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-20 h-1.5 rounded-full bg-black/5 overflow-hidden">
                    <div className="h-full bg-[#0F172A] rounded-full" style={{ width: `${t.progress}%` }}/>
                  </div>
                  <span className="text-[10px] text-black/50 w-7 text-right">{t.progress}%</span>
                  <Badge tone={t.status === "Completed" ? "green" : t.status === "Overdue" ? "red" : t.status === "In Progress" ? "blue" : "muted"} >
                    {t.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => act("New WBS task added")}
            className="mt-3 h-8 px-4 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1 transition-colors">
            <Plus className="h-3 w-3" /> Add Work Package
          </button>
        </Card>

        <Card className="p-4">
          <CardHeader title="Milestones" subtitle={`${milestones.length} milestones`} />
          <div className="mt-2 space-y-2">
            {milestones.length === 0 && <div className="py-4 text-center text-sm text-black/40">No milestones.</div>}
            {milestones.map(m => (
              <div key={m.id} className="p-2.5 rounded-lg border border-black/5 hover:bg-gray-50">
                <div className="text-xs font-medium text-black">{m.title}</div>
                <div className="text-[10px] text-black/45 mt-0.5">Planned: {m.plannedDate}</div>
                {m.actualDate && <div className="text-[10px] text-black/45">Actual: {m.actualDate}</div>}
                <div className="flex items-center justify-between mt-1">
                  <div className="w-24 h-1.5 rounded-full bg-black/5 overflow-hidden">
                    <div className="h-full bg-[#0F172A] rounded-full" style={{ width: `${m.progress}%` }}/>
                  </div>
                  <Badge tone={m.status === "Completed" ? "green" : m.status === "Delayed" ? "red" : m.status === "Pending" ? "muted" : "blue"}>
                    {m.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => act("Milestone added")}
            className="mt-3 h-8 px-4 rounded-lg border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1 transition-colors w-full justify-center">
            <Plus className="h-3 w-3" /> Add Milestone
          </button>
        </Card>
      </div>

      <Card className="p-4">
        <CardHeader title="Project Summary" subtitle={proj.title} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
          {[
            { label: "Phase", value: proj.phase },
            { label: "Priority", value: proj.priority },
            { label: "Risk Level", value: proj.riskLevel },
            { label: "Category", value: proj.category },
            { label: "Start Date", value: proj.startDate },
            { label: "End Date", value: proj.endDate },
            { label: "Budget", value: proj.budget },
            { label: "Days Delay", value: proj.daysDelay > 0 ? `${proj.daysDelay} days` : "None" },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-lg bg-gray-50">
              <div className="text-[10px] text-black/45 uppercase tracking-wider mb-0.5">{label}</div>
              <div className="text-sm font-semibold text-black">{value}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Schedule & Gantt Tab ───────────────────────────────────────────────────
function ScheduleGanttTab() {
  const [selProject, setSelProject] = useState(projects[0].id);
  const tasks = projectTasks.filter(t => t.projectId === selProject);

  // Simple Gantt: relative bar positioning
  const startRef = tasks.length ? new Date(tasks.reduce((a, t) => a < t.startDate ? a : t.startDate, tasks[0].startDate)).getTime() : Date.now();
  const endRef   = tasks.length ? new Date(tasks.reduce((a, t) => a > t.endDate   ? a : t.endDate,   tasks[0].endDate)).getTime()   : Date.now() + 86400000;
  const totalMs  = endRef - startRef || 1;

  const barLeft  = (d: string) => ((new Date(d).getTime() - startRef) / totalMs) * 100;
  const barWidth = (s: string, e: string) => Math.max(1, ((new Date(e).getTime() - new Date(s).getTime()) / totalMs) * 100);

  const barColor = (status: string) => {
    if (status === "Completed") return "bg-[#0F172A]";
    if (status === "Overdue") return "bg-red-500";
    if (status === "In Progress") return "bg-[#0F172A]";
    return "bg-gray-300";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-xs font-medium text-black/60">Project:</label>
        <select value={selProject} onChange={e => setSelProject(e.target.value)}
          className="h-9 px-3 rounded-xl border border-black/10 text-sm bg-white focus:outline-none flex-1 max-w-xs">
          {projects.map(p => <option key={p.id} value={p.id}>{p.title.slice(0, 55)}…</option>)}
        </select>
        <button onClick={() => act("Schedule exported")}
          className="h-9 px-3 rounded-xl border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5 transition-colors ml-auto">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>

      <Card className="p-4 overflow-x-auto">
        <CardHeader title="Gantt Chart" subtitle="Task timeline — scaled to project duration" />
        <div className="mt-4 space-y-2 min-w-[600px]">
          {/* header ruler */}
          <div className="flex items-center gap-2 mb-1 pl-[200px]">
            {["Start", "", "", "", "End"].map((l, i) => (
              <div key={i} className="flex-1 text-[9px] text-black/30 uppercase text-center">{l}</div>
            ))}
          </div>
          {tasks.length === 0 && <div className="py-8 text-center text-sm text-black/40">No tasks for this project.</div>}
          {tasks.map(t => (
            <div key={t.id} className="flex items-center gap-2">
              <div className="w-[190px] flex-shrink-0 text-[11px] text-black/70 truncate pr-2">{t.title}</div>
              <div className="relative flex-1 h-6 bg-black/5 rounded-md overflow-hidden">
                <div
                  className={`absolute top-0.5 bottom-0.5 rounded ${barColor(t.status)} opacity-90 flex items-center px-1.5`}
                  style={{ left: `${barLeft(t.startDate)}%`, width: `${barWidth(t.startDate, t.endDate)}%` }}
                  title={`${t.startDate} → ${t.endDate} (${t.progress}%)`}
                >
                  <span className="text-[9px] text-white font-medium truncate">{t.progress}%</span>
                </div>
              </div>
              <Badge tone={t.status === "Completed" ? "green" : t.status === "Overdue" ? "red" : t.status === "In Progress" ? "blue" : "muted"} >
                {t.status}
              </Badge>
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-black/5 text-[10px] text-black/50">
          {[["Completed","bg-[#0F172A]"],["In Progress","bg-[#0F172A]"],["Overdue","bg-red-500"],["Not Started","bg-gray-300"]].map(([l,c]) => (
            <div key={l} className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded ${c}`}/>{l}</div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardHeader title="Schedule Performance Index" subtitle="SPI by project" />
          <div className="h-48 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projects.map(p => ({ name: p.id.replace("PROJ-2026-", ""), spi: p.spi, cpi: p.cpi }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" fontSize={9}/>
                <YAxis domain={[0.7, 1.1]} fontSize={10}/>
                <Tooltip/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
                <Bar dataKey="spi" name="SPI" fill="#3B82F6" radius={[3,3,0,0]}/>
                <Bar dataKey="cpi" name="CPI" fill="#10B981" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <CardHeader title="Milestone Tracker" subtitle="All projects" />
          <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
            {projectMilestones.map(m => (
              <div key={m.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-50">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-black truncate">{m.title}</div>
                  <div className="text-[10px] text-black/45">{m.plannedDate} · {m.owner}</div>
                </div>
                <Badge tone={m.status === "Completed" ? "green" : m.status === "Delayed" ? "red" : m.status === "Pending" ? "muted" : "blue"}>
                  {m.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Cost & Finance Tab ─────────────────────────────────────────────────────
function CostFinanceTab() {
  const totalBudget = projects.reduce((s, p) => s + p.budgetNum, 0);
  const totalSpent  = projects.reduce((s, p) => s + p.spentNum, 0);
  const eac         = totalSpent / (projects.reduce((s, p) => s + p.cpi, 0) / projects.length);
  const variance    = totalBudget - eac;

  const earnedValueData = projects.map(p => ({
    name: p.id.replace("PROJ-2026-", ""),
    BAC: +(p.budgetNum / 1e6).toFixed(1),
    BCWP: +(p.budgetNum * p.progress / 100 / 1e6).toFixed(1),
    ACWP: +(p.spentNum / 1e6).toFixed(1),
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Budget"     value={fmt(totalBudget)} delta="Approved portfolio" icon={Wallet}       color="blue"   />
        <KpiCard label="Total Spent"      value={fmt(totalSpent)}  delta={`${Math.round(totalSpent/totalBudget*100)}% utilised`} icon={TrendingUp}   color="violet" />
        <KpiCard label="EAC (Forecast)"   value={fmt(eac)}         delta="At completion"      icon={Activity}     color="amber"  />
        <KpiCard label="Cost Variance"    value={fmt(Math.abs(variance))} delta={variance >= 0 ? "Under budget" : "Over budget"} icon={variance >= 0 ? CheckCircle2 : AlertTriangle} color={variance >= 0 ? "green" : "red"} positive={variance >= 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardHeader title="Earned Value Analysis" subtitle="BAC vs BCWP vs ACWP ($M)" />
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earnedValueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" fontSize={9}/>
                <YAxis fontSize={10}/>
                <Tooltip/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
                <Bar dataKey="BAC"  name="Budget (BAC)"  fill="#94a3b8" radius={[3,3,0,0]}/>
                <Bar dataKey="BCWP" name="Earned (BCWP)" fill="#10B981" radius={[3,3,0,0]}/>
                <Bar dataKey="ACWP" name="Actual (ACWP)" fill="#EF4444" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <CardHeader title="Cumulative Spend Trend" subtitle="Planned vs Actual vs Forecast ($M)" />
          <div className="h-56 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectSpendTrend}>
                <defs>
                  <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.3}/>
                    <stop offset="100%" stopColor="#94a3b8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="month" fontSize={10}/>
                <YAxis fontSize={10}/>
                <Tooltip/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
                <Area type="monotone" dataKey="planned"  name="Planned"  stroke="#94a3b8" strokeDasharray="4 4" fill="url(#gp)"/>
                <Area type="monotone" dataKey="actual"   name="Actual"   stroke="#3B82F6" fill="none"/>
                <Area type="monotone" dataKey="forecast" name="Forecast" stroke="#F59E0B" strokeDasharray="3 3" fill="none"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-black/8 text-sm font-semibold text-black">Cost Performance by Project</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#fafafa] text-black/50 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="text-left px-4 py-2.5">Project</th>
                <th className="text-right px-4 py-2.5">BAC</th>
                <th className="text-right px-4 py-2.5">ACWP</th>
                <th className="text-right px-4 py-2.5">BCWP</th>
                <th className="text-center px-4 py-2.5">CPI</th>
                <th className="text-center px-4 py-2.5">SPI</th>
                <th className="text-right px-4 py-2.5">Variance</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => {
                const bcwp = p.budgetNum * p.progress / 100;
                const cv   = bcwp - p.spentNum;
                return (
                  <tr key={p.id} className="border-t border-black/5 hover:bg-[#fafafa]">
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-black truncate max-w-[260px]">{p.title}</div>
                      <div className="text-[10px] text-black/40 font-mono">{p.id}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{fmt(p.budgetNum)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{fmt(p.spentNum)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{fmt(bcwp)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`font-semibold ${p.cpi >= 1 ? "text-[#0F172A]" : "text-red-600"}`}>{p.cpi.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`font-semibold ${p.spi >= 1 ? "text-[#0F172A]" : "text-[#0F172A]"}`}>{p.spi.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className={`font-semibold ${cv >= 0 ? "text-[#0F172A]" : "text-red-600"}`}>{cv >= 0 ? "+" : ""}{fmt(cv)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Risk & Issues Tab ─────────────────────────────────────────────────────
function RiskIssuesTab() {
  const critical = projectRisks.filter(r => r.level === "Critical").length;
  const high     = projectRisks.filter(r => r.level === "High").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Risks"    value={String(projectRisks.length)} delta="Across all projects" icon={ShieldCheck}    color="blue"  />
        <KpiCard label="Critical Risks" value={String(critical)}            delta="Immediate action"    icon={AlertTriangle}  color="red"   positive={critical === 0} />
        <KpiCard label="High Risks"     value={String(high)}                delta="Close monitoring"    icon={AlertTriangle}  color="amber" positive={high === 0} />
        <KpiCard label="Mitigated"      value={String(projectRisks.filter(r => r.status === "Mitigating").length)} delta="Mitigation active" icon={CheckCircle2} color="green" />
      </div>

      {/* Risk heat-map */}
      <Card className="p-4">
        <CardHeader title="Risk Register" subtitle={`${projectRisks.length} identified risks`} />
        <div className="mt-3 space-y-2">
          {projectRisks.map(r => (
            <div key={r.id} className="p-3 rounded-lg border border-black/5 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-black">{r.title}</div>
                  <div className="text-[10px] text-black/45 mt-0.5 font-mono">{r.id} · {r.category} · Owner: {r.owner}</div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge tone={RISK_TONE[r.level] ?? "muted"}>{r.level}</Badge>
                  <Badge tone={r.status === "Escalated" ? "red" : r.status === "Mitigating" ? "amber" : r.status === "Closed" ? "green" : "muted"}>{r.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-[10px] text-black/55 my-1.5">
                <span>Likelihood: <span className="font-semibold text-black/80">{r.likelihood}/5</span></span>
                <span>Impact: <span className="font-semibold text-black/80">{r.impact}/5</span></span>
                <span>Score: <span className={`font-semibold ${r.riskScore >= 16 ? "text-red-600" : r.riskScore >= 9 ? "text-[#0F172A]" : "text-[#0F172A]"}`}>{r.riskScore}</span></span>
              </div>
              <div className="text-[10px] text-black/55 bg-slate-50 rounded px-2 py-1">
                <span className="font-medium text-[#0F172A]">Mitigation: </span>{r.mitigation}
              </div>
              <div className="text-[10px] text-black/40 mt-1">Logged: {r.dateLogged}</div>
            </div>
          ))}
        </div>
        <button onClick={() => act("New risk logged")}
          className="mt-3 h-8 px-4 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1 transition-colors">
          <Plus className="h-3 w-3" /> Log New Risk
        </button>
      </Card>

      <Card className="p-4">
        <CardHeader title="Risk Matrix" subtitle="Likelihood × Impact" />
        <div className="grid grid-cols-5 gap-1 mt-3 max-w-sm">
          {[5,4,3,2,1].map(l => (
            [1,2,3,4,5].map(i => {
              const score = l * i;
              const bg = score >= 16 ? "bg-red-200 text-red-800" : score >= 9 ? "bg-slate-200 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]";
              const count = projectRisks.filter(r => r.likelihood === l && r.impact === i).length;
              return (
                <div key={`${l}-${i}`} className={`${bg} rounded text-center text-[9px] font-bold p-1.5 aspect-square flex items-center justify-center`}>
                  {count > 0 ? count : ""}
                </div>
              );
            })
          ))}
        </div>
        <div className="flex gap-3 mt-2 text-[10px] text-black/50">
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-200"/>Critical (≥16)</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-200"/>High (9-15)</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-100"/>Low-Med (&lt;9)</span>
        </div>
      </Card>
    </div>
  );
}

// ── Quality Management Tab ─────────────────────────────────────────────────
function QualityManagementTab() {
  const qualityData = [
    { month: "Jan", passed: 24, failed: 2, ncr: 3 },
    { month: "Feb", passed: 28, failed: 1, ncr: 2 },
    { month: "Mar", passed: 31, failed: 3, ncr: 4 },
    { month: "Apr", passed: 27, failed: 2, ncr: 2 },
    { month: "May", passed: 33, failed: 1, ncr: 1 },
    { month: "Jun", passed: 29, failed: 4, ncr: 5 },
  ];
  const ncrs = [
    { id: "NCR-001", project: "Highway Rehabilitation", desc: "Sub-grade compaction below specification at Ch. 42+000", severity: "Major", status: "Open", date: "2026-05-12" },
    { id: "NCR-002", project: "Hospital Info System", desc: "Data migration script failed integrity checks on patient records module", severity: "Critical", status: "Under Review", date: "2026-06-01" },
    { id: "NCR-003", project: "Solar Power Plant", desc: "Panel mounting torque not meeting structural specs", severity: "Minor", status: "Closed", date: "2026-04-22" },
    { id: "NCR-004", project: "Rural Roads Rehab", desc: "Bitumen application temperature deviation recorded", severity: "Major", status: "Open", date: "2026-06-15" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Inspections Passed" value="143" delta="YTD"               icon={CheckCircle2}  color="green"  />
        <KpiCard label="NCRs Raised"        value="14"  delta="Non-conformances"  icon={AlertTriangle} color="red"    positive={false} />
        <KpiCard label="NCRs Closed"        value="9"   delta="64% closure rate"  icon={Star}          color="amber"  />
        <KpiCard label="Quality Score"      value="87%" delta="Portfolio average"  icon={ShieldCheck}   color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardHeader title="Quality Inspection Trend" subtitle="Passed / Failed / NCRs per month" />
          <div className="h-52 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="month" fontSize={10}/>
                <YAxis fontSize={10}/>
                <Tooltip/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
                <Bar dataKey="passed" name="Passed" fill="#10B981" radius={[3,3,0,0]} stackId="a"/>
                <Bar dataKey="failed" name="Failed" fill="#DC2626" radius={[3,3,0,0]} stackId="a"/>
                <Bar dataKey="ncr"    name="NCRs"   fill="#F59E0B" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <CardHeader title="Non-Conformance Reports (NCRs)" subtitle={`${ncrs.filter(n => n.status !== "Closed").length} open NCRs`} />
          <div className="mt-2 space-y-2 max-h-52 overflow-y-auto">
            {ncrs.map(n => (
              <div key={n.id} className="p-2.5 rounded-lg border border-black/5 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-black">{n.id}</div>
                    <div className="text-[10px] text-black/45">{n.project} · {n.date}</div>
                    <div className="text-[10px] text-black/65 mt-0.5 leading-relaxed">{n.desc}</div>
                  </div>
                  <div className="flex flex-col gap-1 items-end flex-shrink-0">
                    <Badge tone={n.severity === "Critical" ? "red" : n.severity === "Major" ? "amber" : "muted"}>{n.severity}</Badge>
                    <Badge tone={n.status === "Closed" ? "green" : n.status === "Under Review" ? "blue" : "red"}>{n.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => act("NCR raised")}
            className="mt-3 h-8 px-4 rounded-lg border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1 transition-colors">
            <Plus className="h-3 w-3" /> Raise NCR
          </button>
        </Card>
      </div>
    </div>
  );
}

// ── Resource Management Tab ────────────────────────────────────────────────
function ResourceManagementTab() {
  const resources = [
    { name: "T. Moyo",      role: "Project Manager",   dept: "Transport",  projects: 2, allocation: 100, available: 0  },
    { name: "P. Dube",      role: "Project Manager",   dept: "Health",     projects: 1, allocation: 75,  available: 25 },
    { name: "J. Banda",     role: "Civil Engineer",    dept: "Transport",  projects: 2, allocation: 90,  available: 10 },
    { name: "S. Ncube",     role: "IT Architect",      dept: "ICT",        projects: 1, allocation: 60,  available: 40 },
    { name: "F. Mutasa",    role: "Financial Analyst", dept: "Finance",    projects: 3, allocation: 95,  available: 5  },
    { name: "R. Chiweshe",  role: "Risk Manager",      dept: "PMO",        projects: 4, allocation: 80,  available: 20 },
  ];

  const utilizationData = resources.map(r => ({ name: r.name.split(" ")[0], alloc: r.allocation, avail: r.available }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Resources"    value={String(resources.length)} delta="Active PM staff"         icon={UsersRound}    color="blue"   />
        <KpiCard label="Over-allocated"     value={String(resources.filter(r => r.allocation >= 100).length)} delta="100%+ utilised" icon={AlertTriangle} color="red" positive={false} />
        <KpiCard label="Avg Utilisation"    value={`${Math.round(resources.reduce((s,r)=>s+r.allocation,0)/resources.length)}%`} delta="Portfolio average" icon={Activity} color="amber" />
        <KpiCard label="Available Capacity" value={`${Math.round(resources.reduce((s,r)=>s+r.available,0)/resources.length)}%`} delta="Avg headroom" icon={CheckCircle2} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardHeader title="Resource Utilisation" subtitle="Allocation vs availability %" />
          <div className="h-52 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" fontSize={10}/>
                <YAxis domain={[0, 100]} unit="%" fontSize={10}/>
                <Tooltip/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
                <Bar dataKey="alloc" name="Allocated %" fill="#3B82F6" radius={[3,3,0,0]}/>
                <Bar dataKey="avail" name="Available %" fill="#10B981" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <CardHeader title="Resource Register" subtitle={`${resources.length} team members`} />
          <div className="mt-2 space-y-2 max-h-52 overflow-y-auto">
            {resources.map(r => (
              <div key={r.name} className="flex items-center gap-3 p-2.5 rounded-lg border border-black/5 hover:bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-[#0F172A] flex-shrink-0">
                  {r.name.split(" ").map(n=>n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-black">{r.name}</div>
                  <div className="text-[10px] text-black/45">{r.role} · {r.dept}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-xs font-semibold ${r.allocation >= 100 ? "text-red-600" : r.allocation >= 80 ? "text-[#0F172A]" : "text-[#0F172A]"}`}>{r.allocation}%</div>
                  <div className="text-[10px] text-black/40">{r.projects} proj</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Contractor Management Tab ──────────────────────────────────────────────
function ContractorManagementTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Active Contractors" value={String(contractorPerformance.length)} delta="Engaged"       icon={Building2}    color="blue"   />
        <KpiCard label="Top Performer"      value="4.7"    delta="Zimbabwe Pharma"                             icon={Star}          color="green"  />
        <KpiCard label="Underperforming"    value="1"      delta="Score &lt; 3.5"                               icon={AlertTriangle} color="red"    positive={false} />
        <KpiCard label="Total Defects"      value={String(contractorPerformance.reduce((s,c)=>s+c.defects,0))} delta="Across all" icon={ShieldCheck} color="amber" />
      </div>

      <Card className="p-4">
        <CardHeader title="Contractor Performance Scorecard" subtitle="Quality · Schedule · Safety" />
        <div className="h-56 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={contractorPerformance.map(c => ({
              name: c.name.split(" ")[0],
              Quality: c.quality,
              Schedule: c.schedule,
              Safety: c.safety,
            }))}>
              <PolarGrid/>
              <PolarAngleAxis dataKey="name" fontSize={10}/>
              <PolarRadiusAxis angle={30} domain={[0, 5]} fontSize={9}/>
              <Radar name="Quality"  dataKey="Quality"  stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15}/>
              <Radar name="Schedule" dataKey="Schedule" stroke="#10B981" fill="#10B981" fillOpacity={0.15}/>
              <Radar name="Safety"   dataKey="Safety"   stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15}/>
              <Legend wrapperStyle={{ fontSize: 11 }}/>
              <Tooltip/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-black/8 text-sm font-semibold text-black">Contractor Scoreboard</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#fafafa] text-black/50 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="text-left px-4 py-2.5">Contractor</th>
                <th className="text-center px-4 py-2.5">Projects</th>
                <th className="text-center px-4 py-2.5">Quality</th>
                <th className="text-center px-4 py-2.5">Schedule</th>
                <th className="text-center px-4 py-2.5">Safety</th>
                <th className="text-center px-4 py-2.5">Overall</th>
                <th className="text-center px-4 py-2.5">Defects</th>
                <th className="text-center px-4 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {contractorPerformance.map(c => (
                <tr key={c.name} className="border-t border-black/5 hover:bg-[#fafafa]">
                  <td className="px-4 py-2.5 font-medium text-black">{c.name}</td>
                  <td className="px-4 py-2.5 text-center">{c.projects}</td>
                  <td className="px-4 py-2.5 text-center"><span className={`font-semibold ${c.quality >= 4 ? "text-[#0F172A]" : c.quality >= 3 ? "text-[#0F172A]" : "text-red-600"}`}>{c.quality}</span></td>
                  <td className="px-4 py-2.5 text-center"><span className={`font-semibold ${c.schedule >= 4 ? "text-[#0F172A]" : c.schedule >= 3 ? "text-[#0F172A]" : "text-red-600"}`}>{c.schedule}</span></td>
                  <td className="px-4 py-2.5 text-center"><span className={`font-semibold ${c.safety >= 4 ? "text-[#0F172A]" : "text-[#0F172A]"}`}>{c.safety}</span></td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={`font-bold ${c.overall >= 4 ? "text-[#0F172A]" : c.overall >= 3.5 ? "text-[#0F172A]" : "text-red-600"}`}>{c.overall}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <Badge tone={c.defects <= 2 ? "green" : c.defects <= 5 ? "amber" : "red"}>{c.defects}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button onClick={() => act(`Contractor review: ${c.name}`)}
                      className="h-6 px-2.5 rounded-lg bg-black text-white text-[10px] hover:bg-gray-800 transition-colors">Review</button>
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

// ── Documents Repository Tab ───────────────────────────────────────────────
function DocumentsRepositoryTab() {
  const docs = [
    { id: "DOC-001", title: "Beitbridge Highway — Detailed Design Report",        type: "Design",       project: "PROJ-2026-00041", size: "12.4 MB", date: "2025-10-15", uploader: "J. Banda",    status: "Approved"   },
    { id: "DOC-002", title: "National Hospital IS — Functional Specifications",   type: "Specification",project: "PROJ-2026-00040", size: "3.8 MB",  date: "2024-05-10", uploader: "P. Dube",     status: "Approved"   },
    { id: "DOC-003", title: "Solar Power Plant — Environmental Impact Assessment",type: "EIA",           project: "PROJ-2026-00039", size: "28.1 MB", date: "2025-07-22", uploader: "F. Mutasa",   status: "Under Review"},
    { id: "DOC-004", title: "Rural Roads — Bill of Quantities Rev 3",             type: "BOQ",           project: "PROJ-2026-00038", size: "1.2 MB",  date: "2026-01-08", uploader: "T. Moyo",     status: "Approved"   },
    { id: "DOC-005", title: "Harare Water — Project Charter",                     type: "Charter",       project: "PROJ-2026-00037", size: "0.8 MB",  date: "2025-11-30", uploader: "R. Chiweshe", status: "Draft"      },
    { id: "DOC-006", title: "Agriculture Irrigation — Risk Register v2",          type: "Risk",          project: "PROJ-2026-00036", size: "0.5 MB",  date: "2026-04-12", uploader: "S. Ncube",    status: "Approved"   },
  ];

  const typeColors: Record<string, "blue" | "green" | "amber" | "red" | "violet" | "muted"> = {
    Design: "blue", Specification: "violet", EIA: "amber", BOQ: "green", Charter: "blue", Risk: "red",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-black">{docs.length} documents in repository</div>
        <button onClick={() => act("Document uploaded")}
          className="h-9 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Upload Document
        </button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#fafafa] text-black/50 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="text-left px-4 py-2.5">Document</th>
                <th className="text-left px-4 py-2.5">Type</th>
                <th className="text-left px-4 py-2.5">Project</th>
                <th className="text-left px-4 py-2.5">Uploader</th>
                <th className="text-right px-4 py-2.5">Size</th>
                <th className="text-left px-4 py-2.5">Date</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-center px-4 py-2.5">Action</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id} className="border-t border-black/5 hover:bg-[#fafafa]">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-black max-w-[260px] truncate">{d.title}</div>
                    <div className="text-[10px] text-black/40 font-mono">{d.id}</div>
                  </td>
                  <td className="px-4 py-2.5"><Badge tone={typeColors[d.type] ?? "muted"}>{d.type}</Badge></td>
                  <td className="px-4 py-2.5 text-black/60 font-mono text-[10px]">{d.project}</td>
                  <td className="px-4 py-2.5 text-black/60">{d.uploader}</td>
                  <td className="px-4 py-2.5 text-right text-black/50">{d.size}</td>
                  <td className="px-4 py-2.5 text-black/50">{d.date}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={d.status === "Approved" ? "green" : d.status === "Under Review" ? "amber" : "muted"}>{d.status}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button onClick={() => act(`Downloading ${d.id}`)}
                      className="h-6 px-2.5 rounded-lg border border-black/10 text-[10px] hover:bg-gray-50 flex items-center gap-1 mx-auto transition-colors">
                      <Download className="h-2.5 w-2.5" /> Get
                    </button>
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

// ── Reports & Analytics Tab ────────────────────────────────────────────────
function ReportsAnalyticsTab() {
  const healthData = projects.map(p => ({ name: p.id.replace("PROJ-2026-", ""), score: p.healthScore, spi: p.spi * 100, cpi: p.cpi * 100 }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardHeader title="Project Health Scores" subtitle="Current period" />
          <div className="h-52 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" fontSize={10}/>
                <YAxis domain={[0, 100]} fontSize={10}/>
                <Tooltip/>
                <Bar dataKey="score" name="Health Score" radius={[4,4,0,0]}
                  fill="#3B82F6"
                  label={{ position: "top", fontSize: 9 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <CardHeader title="SPI vs CPI (normalised)" subtitle="100 = target; &gt;100 = ahead" />
          <div className="h-52 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={healthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                <XAxis dataKey="name" fontSize={10}/>
                <YAxis domain={[80, 115]} fontSize={10}/>
                <Tooltip/>
                <Legend wrapperStyle={{ fontSize: 11 }}/>
                <Line type="monotone" dataKey="spi" name="SPI %" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }}/>
                <Line type="monotone" dataKey="cpi" name="CPI %" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <CardHeader title="Executive Summary Reports" subtitle="Ready to generate" />
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: "Portfolio Status Report",    desc: "All projects — status, progress, and health scores",    color: "bg-slate-50 border-slate-200"   },
            { title: "Financial Performance Report",desc: "Budget utilisation, EVA, cost variances by project",  color: "bg-slate-50 border-slate-200"},
            { title: "Schedule Performance Report", desc: "SPI trends, milestones, and delay analysis",           color: "bg-slate-50 border-slate-200"  },
            { title: "Risk & Issues Report",        desc: "Open risks, escalations, and mitigation status",       color: "bg-red-50 border-red-200"      },
            { title: "Contractor Performance",      desc: "Scorecard ratings, defects, and compliance",           color: "bg-slate-50 border-slate-200"},
            { title: "Resource Utilisation Report", desc: "Allocation, capacity, and team workload breakdown",    color: "bg-slate-50 border-slate-200"    },
          ].map(r => (
            <div key={r.title} className={`p-3.5 rounded-xl border ${r.color}`}>
              <div className="text-xs font-semibold text-black mb-1">{r.title}</div>
              <div className="text-[10px] text-black/50 leading-relaxed mb-2.5">{r.desc}</div>
              <button onClick={() => act(`${r.title} generated`)}
                className="h-7 px-3 rounded-lg bg-black text-white text-[10px] font-medium hover:bg-gray-800 flex items-center gap-1 transition-colors">
                <Download className="h-3 w-3" /> Generate PDF
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── AI Agents Tab ──────────────────────────────────────────────────────────
function AIAgentsTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projectAIAgents.map(a => (
          <Card key={a.name} className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#0F172A] flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4.5 w-4.5 text-white h-4 w-4"/>
              </div>
              <Badge tone={a.status === "Active" ? "green" : "amber"}>{a.status}</Badge>
            </div>
            <div className="text-sm font-semibold text-black mb-1">{a.name}</div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-[10px]">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="font-bold text-black text-sm">{a.confidence}%</div>
                <div className="text-black/45 mt-0.5">Confidence</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="font-bold text-black text-sm">{a.actions.toLocaleString()}</div>
                <div className="text-black/45 mt-0.5">Actions</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <div className={`font-bold text-sm ${a.pending > 0 ? "text-[#0F172A]" : "text-[#0F172A]"}`}>{a.pending}</div>
                <div className="text-black/45 mt-0.5">Pending</div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => act(`${a.name} review opened`)}
                className="flex-1 h-7 rounded-lg bg-black text-white text-[10px] font-medium hover:bg-gray-800 transition-colors">Review</button>
              <button onClick={() => act(`${a.name} tasks approved`)}
                className="flex-1 h-7 rounded-lg border border-black/10 text-[10px] hover:bg-gray-50 transition-colors">Approve All</button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <CardHeader title="AI Agent Capabilities" subtitle="Autonomous project management intelligence" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          {[
            { title: "Portfolio Intelligence",    desc: "Cross-project analysis, resource conflict detection, portfolio-level KPI monitoring, and executive briefing generation." },
            { title: "Schedule Control",          desc: "Critical path monitoring, automatic delay alerts, schedule compression recommendations, and milestone forecasting." },
            { title: "Cost Forecasting",          desc: "EAC re-forecasting using latest CPI/SPI, variance trend analysis, and budget breach early warning notifications." },
            { title: "Risk Radar",                desc: "Continuous risk scoring updates, emerging risk detection from field reports, and mitigation effectiveness tracking." },
            { title: "Quality Inspector",         desc: "NCR pattern analysis, predictive quality issues based on contractor history, and inspection scheduling optimisation." },
            { title: "Document Intelligence",     desc: "Auto-classification of uploads, version conflict detection, required document completion tracking, and expiry alerts." },
          ].map(c => (
            <div key={c.title} className="p-3 rounded-xl bg-[#0F172A] border border-slate-200">
              <div className="text-xs font-semibold text-black mb-1">{c.title}</div>
              <div className="text-[10px] text-black/55 leading-relaxed">{c.desc}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ProjectManagementPage() {
  const [tab, setTab] = useState<Tab>("Dashboard");
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [scrolling, setScrolling] = useState(false);

  const startScroll = () => {
    if (scrollTimerRef.current) return;
    setScrolling(true);
    scrollTimerRef.current = setInterval(() => {
      if (!scrollRef.current) return;
      const el = scrollRef.current;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
        el.scrollTop = 0;
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

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Project Management"
        process="Project Oversight"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="flex flex-col h-full">
        <PageHeader
          title="Project Management Tower"
          subtitle="Unified PM dashboard — portfolio, planning, finance, risk, quality, and resources"
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              {/* ── Scroll Controls ── */}
              <div className="flex items-center gap-0 border border-black/10 rounded-xl overflow-hidden">
                <button
                  onClick={startScroll}
                  disabled={scrolling}
                  className={`h-8 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors ${scrolling ? "bg-black text-white cursor-default" : "hover:bg-gray-50 text-black/70"}`}>
                  ▶ Start Scroll
                </button>
                <div className="w-px h-5 bg-black/10"/>
                <button
                  onClick={stopScroll}
                  disabled={!scrolling}
                  className={`h-8 px-3 text-xs font-semibold flex items-center gap-1.5 transition-colors ${!scrolling ? "text-black/30 cursor-default" : "hover:bg-gray-50 text-black/70"}`}>
                  ■ Stop
                </button>
              </div>
              <button onClick={() => act("Portfolio refreshed")}
                className="h-8 px-3 rounded-xl border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
                <RefreshCcw className="h-3.5 w-3.5" /> Refresh
              </button>
              <button onClick={() => act("Report downloaded")}
                className="h-8 px-3 rounded-xl border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
          }
        />

        {/* Tab bar */}
        <div className="flex items-center gap-0.5 px-4 sm:px-6 border-b border-black/8 overflow-x-auto flex-shrink-0 bg-white">
          {TABS.map(t => (
            <button key={t} onClick={() => { setTab(t); stopScroll(); }}
              className={`flex items-center gap-1 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t ? "border-black text-black" : "border-transparent text-black/45 hover:text-black/70"
              }`}>
              {t === "GIS Map" && <MapPin className="h-3 w-3" />}
              {t}
            </button>
          ))}
        </div>

        {/* Content — scrollable container with ref for auto-scroll */}
        <div
          ref={scrollRef}
          className={`flex-1 ${tab === "GIS Map" ? "p-0 overflow-hidden" : "overflow-y-auto px-4 sm:px-6 py-5"}`}
        >
          {tab === "Dashboard"              && <DashboardTab />}
          {tab === "Project Portfolio"      && <ProjectPortfolioTab />}
          {tab === "Planning & WBS"         && <PlanningWBSTab />}
          {tab === "Schedule & Gantt"       && <ScheduleGanttTab />}
          {tab === "Cost & Finance"         && <CostFinanceTab />}
          {tab === "Risk & Issues"          && <RiskIssuesTab />}
          {tab === "Quality Management"     && <QualityManagementTab />}
          {tab === "Resource Management"    && <ResourceManagementTab />}
          {tab === "Contractor Management"  && <ContractorManagementTab />}
          {tab === "Documents Repository"   && <DocumentsRepositoryTab />}
          {tab === "Reports & Analytics"    && <ReportsAnalyticsTab />}
          {tab === "GIS Map"                && (
            <GisMapView
              pins={PROJECT_PINS}
              height="100%"
              title="Projects GIS Map"
              onNavigate={() => navigate("/projects")}
            />
          )}
        </div>
      </div>

      <AIAssistantPanel
        agentName="PM Intelligence"
        agentRole="Project portfolio analysis, schedule monitoring, cost forecasting, risk alerts"
        context="project-management"
        color="blue"
      />
      <InlineWorkbench context="Project Management" />
    </AppShell>
  );
}
