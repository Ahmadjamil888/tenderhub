import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { pushNotification, pushSeniorAlert } from "@/lib/local-store";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Users, TrendingUp, CheckCircle2, Clock, AlertTriangle, Target, Award,
  Activity, BarChart3, Brain, BookOpen, Zap, Star, Download, Filter,
  RefreshCw, ChevronRight, ArrowUp, ArrowDown, Eye, UserCheck, Shield,
  Cpu, Calendar, MessageSquare, Flame, Lightbulb,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F97316"];

const PROD_TREND = [
  { month: "Jan", org: 74, dept: 78, team: 80, individual: 82 },
  { month: "Feb", org: 76, dept: 79, team: 82, individual: 84 },
  { month: "Mar", org: 75, dept: 80, team: 83, individual: 81 },
  { month: "Apr", org: 78, dept: 82, team: 85, individual: 86 },
  { month: "May", org: 80, dept: 84, team: 87, individual: 88 },
  { month: "Jun", org: 82, dept: 85, team: 88, individual: 90 },
];

const TEAM_PERF = [
  { team: "Procurement", score: 88, tasks: 142, overdue: 8, sla: 94 },
  { team: "Finance", score: 84, tasks: 98, overdue: 5, sla: 91 },
  { team: "Contracts", score: 91, tasks: 76, overdue: 3, sla: 97 },
  { team: "Audit", score: 79, tasks: 54, overdue: 7, sla: 86 },
  { team: "Asset Mgmt", score: 86, tasks: 63, overdue: 4, sla: 92 },
  { team: "ICT", score: 93, tasks: 118, overdue: 2, sla: 98 },
];

const STAFF_RECORDS = [
  { id: "EMP-001", name: "T. Moyo", department: "Procurement", role: "Senior Officer", score: 92, tasks: 28, overdue: 1, sla: 97, attendance: 98, quality: 94, efficiency: 91, status: "Excellent" },
  { id: "EMP-002", name: "P. Dube", department: "Evaluations", role: "Evaluator", score: 88, tasks: 22, overdue: 2, sla: 93, attendance: 96, quality: 90, efficiency: 88, status: "Good" },
  { id: "EMP-003", name: "A. Mpofu", department: "Contracts", role: "Contract Manager", score: 95, tasks: 18, overdue: 0, sla: 99, attendance: 100, quality: 97, efficiency: 94, status: "Excellent" },
  { id: "EMP-004", name: "J. Banda", department: "Asset Management", role: "Asset Officer", score: 79, tasks: 31, overdue: 6, sla: 82, attendance: 91, quality: 78, efficiency: 80, status: "Needs Improvement" },
  { id: "EMP-005", name: "R. Chikwanda", department: "Finance", role: "Budget Analyst", score: 85, tasks: 24, overdue: 3, sla: 89, attendance: 95, quality: 86, efficiency: 85, status: "Good" },
  { id: "EMP-006", name: "S. Nkosi", department: "Compliance", role: "Compliance Officer", score: 90, tasks: 19, overdue: 1, sla: 95, attendance: 98, quality: 92, efficiency: 89, status: "Excellent" },
  { id: "EMP-007", name: "M. Dlamini", department: "ICT", role: "Systems Analyst", score: 96, tasks: 42, overdue: 0, sla: 99, attendance: 99, quality: 96, efficiency: 97, status: "Excellent" },
  { id: "EMP-008", name: "C. Nyathi", department: "Procurement", role: "Procurement Officer", score: 72, tasks: 20, overdue: 8, sla: 74, attendance: 87, quality: 70, efficiency: 73, status: "At Risk" },
];

const KPI_TREND = [
  { month: "Jan", achieved: 68, target: 80 },
  { month: "Feb", achieved: 72, target: 80 },
  { month: "Mar", achieved: 75, target: 82 },
  { month: "Apr", achieved: 79, target: 82 },
  { month: "May", achieved: 83, target: 85 },
  { month: "Jun", achieved: 87, target: 85 },
];

const SKILL_MATRIX = [
  { skill: "Procurement Law", score: 82 },
  { skill: "Negotiation", score: 74 },
  { skill: "Financial Analysis", score: 68 },
  { skill: "Vendor Management", score: 79 },
  { skill: "Digital Tools", score: 85 },
  { skill: "Risk Management", score: 71 },
];

const TRAINING_RECORDS = [
  { course: "Public Procurement Act 2018", staff: 142, completed: 138, score: 97, due: "2026-09-30", status: "On Track" },
  { course: "Anti-Corruption Compliance", staff: 142, completed: 128, score: 90, due: "2026-08-15", status: "On Track" },
  { course: "e-Procurement Platform", staff: 142, completed: 142, score: 100, due: "Completed", status: "Done" },
  { course: "Contract Management", staff: 142, completed: 89, score: 63, due: "2026-07-31", status: "At Risk" },
  { course: "Financial Controls", staff: 60, completed: 52, score: 87, due: "2026-10-01", status: "On Track" },
  { course: "Data Protection & GDPR", staff: 142, completed: 41, score: 29, due: "2026-07-20", status: "Overdue" },
];

const AI_INSIGHTS = [
  { type: "Burnout Risk", staff: "C. Nyathi", detail: "18% above average overtime — burnout probability 74%", severity: "high" },
  { type: "Top Performer", staff: "M. Dlamini", detail: "Productivity score 96 — recommend for leadership fast-track", severity: "positive" },
  { type: "Skill Gap", staff: "J. Banda", detail: "Contract management training incomplete — 3 SLA breaches this month", severity: "medium" },
  { type: "Engagement Drop", staff: "Audit Team", detail: "Engagement score dropped 12 pts in June — sentiment negative", severity: "medium" },
  { type: "Coaching Needed", staff: "C. Nyathi", detail: "Response time 42% above SLA — coaching recommended immediately", severity: "high" },
];

const DEPT_SCORES = [
  { dept: "ICT", productivity: 93, engagement: 88, training: 95 },
  { dept: "Contracts", productivity: 91, engagement: 84, training: 87 },
  { dept: "Procurement", productivity: 83, engagement: 79, training: 82 },
  { dept: "Finance", productivity: 84, engagement: 81, training: 89 },
  { dept: "Compliance", productivity: 88, engagement: 85, training: 91 },
  { dept: "Audit", productivity: 79, engagement: 72, training: 78 },
  { dept: "Asset Mgmt", productivity: 85, engagement: 77, training: 80 },
];

const STATUS_TONE: Record<string, "green" | "amber" | "red" | "blue" | "muted" | "violet"> = {
  Excellent: "green", Good: "blue", "Needs Improvement": "amber", "At Risk": "red",
  "On Track": "green", Done: "muted", Overdue: "red",
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  "Productivity Dashboard", "Individual Metrics", "Performance Management",
  "Team Performance", "Workforce Analytics", "Training & Development", "AI Workforce Engine",
] as const;
type Tab = typeof TABS[number];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StaffProductivityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Productivity Dashboard");
  const { user } = useAuth();

  const handleAction = (msg: string) => {
    pushNotification(msg, "success");
    pushSeniorAlert(msg, "info");
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Human Resources Management"
        process="Staff Productivity"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Staff Productivity & Performance Engine"
          description="Monitor productivity, performance, accountability, training, and workforce optimisation across the organisation."
          actions={
            <>
              <button onClick={() => handleAction("Staff filter opened — filter by department, role or score range to narrow results.")} className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm flex items-center gap-1.5 hover:bg-[#EAF1F8] transition-colors">
                <Filter className="h-4 w-4" /><span className="hidden sm:inline">Filter</span>
              </button>
              <button onClick={() => handleAction("Staff productivity report exported — check your downloads folder for the PDF/Excel file.")} className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm flex items-center gap-1.5 hover:bg-[#EAF1F8] transition-colors">
                <Download className="h-4 w-4" /><span className="hidden sm:inline">Export</span>
              </button>
              <button onClick={() => handleAction("Productivity data refreshed")} className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm flex items-center gap-1.5 hover:bg-[#EAF1F8] transition-colors">
                <RefreshCw className="h-4 w-4" /><span className="hidden sm:inline">Refresh</span>
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

        {activeTab === "Productivity Dashboard" && <ProductivityDashboard onAction={handleAction} />}
        {activeTab === "Individual Metrics" && <IndividualMetrics onAction={handleAction} />}
        {activeTab === "Performance Management" && <PerformanceManagement onAction={handleAction} />}
        {activeTab === "Team Performance" && <TeamPerformance />}
        {activeTab === "Workforce Analytics" && <WorkforceAnalytics />}
        {activeTab === "Training & Development" && <TrainingDevelopment onAction={handleAction} />}
        {activeTab === "AI Workforce Engine" && <AIWorkforceEngine onAction={handleAction} />}
      </div>
    </AppShell>
  );
}

// ─── Tab: Productivity Dashboard ─────────────────────────────────────────────
function ProductivityDashboard({ onAction }: { onAction: (m: string) => void }) {
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Org Productivity Score" value="82%" delta="+4 pts vs last month" icon={Activity} color="blue" />
        <KpiCard label="SLA Compliance" value="91.4%" delta="+2.1 pts" icon={Shield} color="green" />
        <KpiCard label="Tasks Completed (MTD)" value="1,284" delta="+186 vs last period" icon={CheckCircle2} color="violet" />
        <KpiCard label="Overdue Tasks" value="48" delta="-12 resolved" positive={false} icon={AlertTriangle} color="amber" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Avg Efficiency Score" value="84.2%" delta="+1.8 pts" icon={Zap} color="cyan" />
        <KpiCard label="Attendance Rate" value="94.8%" delta="On target" icon={Calendar} color="green" />
        <KpiCard label="First-Time Completion" value="78.3%" delta="+3.2 pts" icon={Star} color="amber" />
        <KpiCard label="Burnout Risk Flags" value="7" delta="3 critical" positive={false} icon={Flame} color="red" />
      </div>

      {/* Trend Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Productivity Trend" subtitle="Staff, team, department, and org-wide — last 6 months" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PROD_TREND}>
                <defs>
                  {["org","dept","team","individual"].map((k, i) => (
                    <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="org" name="Organisation" stroke={COLORS[0]} fill={`url(#g-org)`} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="dept" name="Department" stroke={COLORS[1]} fill={`url(#g-dept)`} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="team" name="Team" stroke={COLORS[2]} fill={`url(#g-team)`} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="individual" name="Individual Avg" stroke={COLORS[3]} fill={`url(#g-individual)`} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Department Scores" subtitle="Current period" />
          <div className="p-4 space-y-3">
            {DEPT_SCORES.map(d => (
              <div key={d.dept}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-black">{d.dept}</span>
                  <span className="text-black/50">{d.productivity}%</span>
                </div>
                <div className="h-1.5 bg-[#EAF1F8] rounded-full overflow-hidden">
                  <div style={{ width: `${d.productivity}%`, background: d.productivity >= 90 ? "#10B981" : d.productivity >= 80 ? "#3B82F6" : "#F59E0B" }} className="h-full rounded-full transition-all" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* KPI vs Target */}
      <Card>
        <CardHeader title="KPI Achievement vs Target" subtitle="Organisational KPI attainment — 6 months" />
        <div className="p-4 h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={KPI_TREND} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="achieved" name="Achieved" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Individual Metrics ──────────────────────────────────────────────────
function IndividualMetrics({ onAction }: { onAction: (m: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = STAFF_RECORDS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Activity className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search staff…"
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none" />
        </div>
        <button onClick={() => onAction("Staff report exported")} className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm flex items-center gap-1.5 hover:bg-[#EAF1F8] transition-colors">
          <Download className="h-4 w-4" /> Export
        </button>
      </div>

      <Card>
        <CardHeader title="Individual Productivity Metrics" subtitle={`${filtered.length} staff records`} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>
                {["Staff Member","Department","Role","Productivity","Efficiency","Quality","Attendance","SLA","Tasks","Overdue","Status",""].map(h => (
                  <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-black text-xs">{s.name}</div>
                    <div className="text-[10px] text-black/40">{s.id}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-black/70">{s.department}</td>
                  <td className="px-4 py-3 text-xs text-black/60 whitespace-nowrap">{s.role}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-[#EAF1F8] rounded-full overflow-hidden">
                        <div style={{ width: `${s.score}%`, background: s.score >= 90 ? "#10B981" : s.score >= 80 ? "#3B82F6" : s.score >= 70 ? "#F59E0B" : "#EF4444" }} className="h-full rounded-full" />
                      </div>
                      <span className="text-xs font-semibold text-black">{s.score}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-center font-medium text-black/70">{s.efficiency}%</td>
                  <td className="px-4 py-3 text-xs text-center font-medium text-black/70">{s.quality}%</td>
                  <td className="px-4 py-3 text-xs text-center font-medium text-black/70">{s.attendance}%</td>
                  <td className="px-4 py-3 text-xs text-center font-medium text-black/70">{s.sla}%</td>
                  <td className="px-4 py-3 text-xs text-center text-black/70">{s.tasks}</td>
                  <td className="px-4 py-3 text-xs text-center">
                    <span className={`font-semibold ${s.overdue > 4 ? "text-red-500" : s.overdue > 1 ? "text-slate-600" : "text-[#0F172A]"}`}>{s.overdue}</span>
                  </td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[s.status] ?? "default"}>{s.status}</Badge></td>
                  <td className="px-4 py-3">
                    <button onClick={() => onAction(`Viewing profile: ${s.name}`)} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1">
                      <Eye className="h-3 w-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Additional Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Avg First-Time Completion" value="78%" delta="+3 pts" icon={CheckCircle2} color="green" />
        <KpiCard label="Avg Rework Rate" value="6.4%" delta="-1.2 pts" icon={RefreshCw} color="amber" />
        <KpiCard label="Collaboration Index" value="81%" delta="+2 pts" icon={Users} color="blue" />
        <KpiCard label="Innovation Score" value="64%" delta="+5 pts" icon={Lightbulb} color="violet" />
      </div>
    </div>
  );
}

// ─── Tab: Performance Management ─────────────────────────────────────────────
function PerformanceManagement({ onAction }: { onAction: (m: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Goal Attainment" value="87%" delta="+5 pts vs target" icon={Target} color="green" />
        <KpiCard label="KPIs on Track" value="68/84" delta="81% on track" icon={BarChart3} color="blue" />
        <KpiCard label="OKRs Completed" value="42%" delta="Q2 progress" icon={Award} color="violet" />
        <KpiCard label="Performance Reviews Due" value="18" delta="by end of month" positive={false} icon={Clock} color="amber" />
      </div>

      {/* KPI Scorecard Table */}
      <Card>
        <CardHeader title="KPI Scorecards" subtitle="Current quarter performance against targets"
          action={<button onClick={() => onAction("Scorecard exported")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Download className="h-3 w-3" /> Export</button>} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>
                {["Department","KPI","Target","Actual","Variance","Trend","Status"].map(h => (
                  <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {[
                { dept: "Procurement", kpi: "Tender Processing Time", target: "21 days", actual: "18.4 days", variance: "-2.6d", trend: "up", status: "Exceeding" },
                { dept: "Contracts", kpi: "Contract Award Rate", target: "95%", actual: "97.2%", variance: "+2.2%", trend: "up", status: "Exceeding" },
                { dept: "Finance", kpi: "Invoice Turnaround", target: "7 days", actual: "9.1 days", variance: "+2.1d", trend: "down", status: "Below Target" },
                { dept: "Audit", kpi: "Audit Finding Closure", target: "85%", actual: "79%", variance: "-6%", trend: "down", status: "At Risk" },
                { dept: "Compliance", kpi: "SLA Adherence", target: "90%", actual: "93.4%", variance: "+3.4%", trend: "up", status: "Exceeding" },
                { dept: "ICT", kpi: "System Uptime", target: "99%", actual: "99.7%", variance: "+0.7%", trend: "up", status: "Exceeding" },
                { dept: "Asset Mgmt", kpi: "Asset Utilisation", target: "80%", actual: "74%", variance: "-6%", trend: "down", status: "Below Target" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3 text-xs font-semibold text-black">{row.dept}</td>
                  <td className="px-4 py-3 text-xs text-black/70">{row.kpi}</td>
                  <td className="px-4 py-3 text-xs text-black/50">{row.target}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-black">{row.actual}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold flex items-center gap-1 ${row.trend === "up" ? "text-[#0F172A]" : "text-red-500"}`}>
                      {row.trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />} {row.variance}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-1 w-16 bg-[#EAF1F8] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${row.trend === "up" ? "bg-[#0F172A] w-4/5" : "bg-red-400 w-2/5"}`} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={row.status === "Exceeding" ? "green" : row.status === "At Risk" ? "amber" : "red"}>{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Accountability Log */}
      <Card>
        <CardHeader title="Accountability & Escalation Log" subtitle="Recent task ownership events and escalation records" />
        <div className="divide-y divide-black/5">
          {[
            { id: "ACT-001", event: "Task overdue: ARV compliance checklist", owner: "S. Nkosi", days: 3, action: "Escalated to HOD", severity: "high" },
            { id: "ACT-002", event: "KPI breach: Invoice turnaround > 7 days", owner: "Finance Team", days: 14, action: "Performance Improvement Notice issued", severity: "medium" },
            { id: "ACT-003", event: "Training incomplete: Data Protection module", owner: "C. Nyathi", days: 8, action: "Reminder sent; supervisor notified", severity: "medium" },
            { id: "ACT-004", event: "Audit finding not closed in 30 days", owner: "J. Banda", days: 12, action: "Escalated to Audit Committee", severity: "high" },
            { id: "ACT-005", event: "Goal attainment review completed", owner: "A. Mpofu", days: 0, action: "Performance bonus approved", severity: "positive" },
          ].map(e => (
            <div key={e.id} className="px-4 py-3 flex items-start gap-3 hover:bg-[#EAF1F8]/50">
              <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${e.severity === "high" ? "bg-red-500" : e.severity === "medium" ? "bg-slate-400" : "bg-[#0F172A]"}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-black">{e.event}</div>
                <div className="text-[10px] text-black/40 mt-0.5">Owner: {e.owner} · {e.id}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-black/60">{e.action}</div>
                {e.days > 0 && <div className="text-[10px] text-black/30 mt-0.5">{e.days} days open</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Team Performance ────────────────────────────────────────────────────
function TeamPerformance() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Top Team Score" value="93%" delta="ICT Team" icon={Award} color="green" />
        <KpiCard label="Avg Team Completion" value="87%" delta="+3 pts" icon={CheckCircle2} color="blue" />
        <KpiCard label="Cross-Team Collaboration" value="79%" delta="+5 pts" icon={Users} color="violet" />
        <KpiCard label="Teams Below Target" value="2" delta="Finance, Audit" positive={false} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Team Productivity Scores" subtitle="All departments — current period" />
          <div className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TEAM_PERF} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} unit="%" />
                <YAxis type="category" dataKey="team" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={72} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="score" name="Score" fill="#3B82F6" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="SLA Compliance by Team" subtitle="Current period" />
          <div className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TEAM_PERF} layout="vertical" barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} unit="%" />
                <YAxis type="category" dataKey="team" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={72} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="sla" name="SLA %" fill="#10B981" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Team Summary" subtitle="Task load, overdue count, and SLA by team" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["Team","Productivity Score","Tasks (MTD)","Overdue","SLA Compliance","Utilisation","Status"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {TEAM_PERF.map(t => (
                <tr key={t.team} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3 text-xs font-semibold text-black">{t.team}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-[#EAF1F8] rounded-full overflow-hidden">
                        <div style={{ width: `${t.score}%`, background: t.score >= 90 ? "#475569" : t.score >= 80 ? "#334155" : "#64748B" }} className="h-full rounded-full" />
                      </div>
                      <span className="text-xs font-semibold">{t.score}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-center text-black/70">{t.tasks}</td>
                  <td className="px-4 py-3 text-xs text-center">
                    <span className={`font-semibold ${t.overdue > 5 ? "text-red-500" : t.overdue > 2 ? "text-slate-600" : "text-[#0F172A]"}`}>{t.overdue}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-center font-medium text-black/70">{t.sla}%</td>
                  <td className="px-4 py-3 text-xs text-center text-black/70">{Math.round(60 + Math.random() * 35)}%</td>
                  <td className="px-4 py-3">
                    <Badge tone={t.score >= 90 ? "green" : t.score >= 80 ? "blue" : "amber"}>
                      {t.score >= 90 ? "Excellent" : t.score >= 80 ? "On Track" : "Needs Focus"}
                    </Badge>
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

// ─── Tab: Workforce Analytics ─────────────────────────────────────────────────
function WorkforceAnalytics() {
  const engagement = [
    { month: "Jan", engagement: 72, sentiment: 68, turnoverRisk: 14 },
    { month: "Feb", engagement: 74, sentiment: 70, turnoverRisk: 13 },
    { month: "Mar", engagement: 71, sentiment: 67, turnoverRisk: 16 },
    { month: "Apr", engagement: 75, sentiment: 72, turnoverRisk: 12 },
    { month: "May", engagement: 78, sentiment: 75, turnoverRisk: 10 },
    { month: "Jun", engagement: 80, sentiment: 77, turnoverRisk: 9 },
  ];

  const turnoverRisk = [
    { name: "Low Risk (< 10%)", value: 89 },
    { name: "Medium Risk (10-30%)", value: 42 },
    { name: "High Risk (> 30%)", value: 11 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Engagement Score" value="80%" delta="+5 pts" icon={Star} color="green" />
        <KpiCard label="Turnover Risk (High)" value="11 staff" delta="-3 vs last month" positive={false} icon={AlertTriangle} color="red" />
        <KpiCard label="Productivity Growth" value="+8.4%" delta="YTD" icon={TrendingUp} color="blue" />
        <KpiCard label="Positive Sentiment" value="77%" delta="+9 pts" icon={MessageSquare} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Workforce Analytics Trends" subtitle="Engagement, sentiment and turnover risk — 6 months" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagement}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} unit="%" />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="engagement" name="Engagement" stroke="#3B82F6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="sentiment" name="Sentiment" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="turnoverRisk" name="Turnover Risk" stroke="#DC2626" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Turnover Risk Distribution" subtitle="142 staff assessed" />
          <div className="p-4 h-[260px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={turnoverRisk} innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                  {turnoverRisk.map((_, i) => <Cell key={i} fill={["#475569", "#64748B", "#DC2626"][i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Radar: Dept Scores */}
      <Card>
        <CardHeader title="Department Multi-Dimension Scores" subtitle="Productivity, engagement, and training by department" />
        <div className="p-4 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEPT_SCORES} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} unit="%" />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="productivity" name="Productivity" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="engagement" name="Engagement" fill="#10B981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="training" name="Training" fill="#F59E0B" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: Training & Development ─────────────────────────────────────────────
function TrainingDevelopment({ onAction }: { onAction: (m: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Training Completion" value="84%" delta="+6 pts" icon={BookOpen} color="blue" />
        <KpiCard label="Certifications Active" value="218" delta="+14 this quarter" icon={Award} color="green" />
        <KpiCard label="Skills Gap Identified" value="24" delta="7 critical" positive={false} icon={AlertTriangle} color="amber" />
        <KpiCard label="Learning Hours (MTD)" value="1,284 hrs" delta="+18%" icon={Clock} color="violet" />
      </div>

      <Card>
        <CardHeader title="Training Completion Register" subtitle="All mandatory and optional programmes"
          action={<button onClick={() => onAction("Training report exported")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Download className="h-3 w-3" /> Export</button>} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["Course","Enrolled","Completed","Completion %","Due Date","Status"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {TRAINING_RECORDS.map((t, i) => (
                <tr key={i} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3 text-xs font-semibold text-black">{t.course}</td>
                  <td className="px-4 py-3 text-xs text-center text-black/70">{t.staff}</td>
                  <td className="px-4 py-3 text-xs text-center text-black/70">{t.completed}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 bg-[#EAF1F8] rounded-full overflow-hidden">
                        <div style={{ width: `${t.score}%`, background: t.score >= 90 ? "#475569" : t.score >= 70 ? "#334155" : "#DC2626" }} className="h-full rounded-full" />
                      </div>
                      <span className="text-xs font-semibold">{t.score}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-black/50">{t.due}</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[t.status] ?? "default"}>{t.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Skill Gap Analysis */}
      <Card>
        <CardHeader title="Skill Gap Analysis" subtitle="Organisation-wide competency mapping" />
        <div className="p-4 space-y-3">
          {SKILL_MATRIX.map(s => (
            <div key={s.skill} className="flex items-center gap-4">
              <div className="w-40 text-xs font-medium text-black truncate">{s.skill}</div>
              <div className="flex-1 h-2 bg-[#EAF1F8] rounded-full overflow-hidden">
                <div style={{ width: `${s.score}%`, background: s.score >= 80 ? "#475569" : s.score >= 65 ? "#334155" : "#DC2626" }} className="h-full rounded-full transition-all" />
              </div>
              <div className="w-10 text-xs font-semibold text-right text-black">{s.score}%</div>
              <Badge tone={s.score >= 80 ? "green" : s.score >= 65 ? "blue" : "red"}>
                {s.score >= 80 ? "Strong" : s.score >= 65 ? "Developing" : "Gap"}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Tab: AI Workforce Engine ─────────────────────────────────────────────────
function AIWorkforceEngine({ onAction }: { onAction: (m: string) => void }) {
  const forecasts = [
    { month: "Jul", capacity: 142, demand: 148, gap: 6 },
    { month: "Aug", capacity: 142, demand: 151, gap: 9 },
    { month: "Sep", capacity: 145, demand: 158, gap: 13 },
    { month: "Oct", capacity: 148, demand: 155, gap: 7 },
    { month: "Nov", capacity: 150, demand: 162, gap: 12 },
    { month: "Dec", capacity: 152, demand: 160, gap: 8 },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="AI Insights Generated" value="184" delta="This week" icon={Brain} color="violet" />
        <KpiCard label="Burnout Risk Flags" value="7" delta="3 critical" positive={false} icon={Flame} color="red" />
        <KpiCard label="Staffing Forecast Gap" value="13 FTEs" delta="Peak in Sep" positive={false} icon={Users} color="amber" />
        <KpiCard label="Coaching Recommendations" value="22" delta="Auto-generated" icon={Lightbulb} color="blue" />
      </div>

      {/* AI Alerts */}
      <Card>
        <CardHeader title="AI Workforce Insights & Alerts" subtitle="Real-time recommendations from the Workforce AI Engine" />
        <div className="divide-y divide-black/5">
          {AI_INSIGHTS.map((ins, i) => (
            <div key={i} className="px-4 py-4 flex items-start gap-3 hover:bg-[#EAF1F8]/50">
              <div className={`h-8 w-8 rounded-xl grid place-items-center flex-shrink-0 ${
                ins.severity === "high" ? "bg-red-100 text-red-600" :
                ins.severity === "positive" ? "bg-slate-100 text-[#0F172A]" :
                "bg-slate-100 text-[#0F172A]"
              }`}>
                {ins.severity === "positive" ? <Star className="h-4 w-4" /> : ins.severity === "high" ? <AlertTriangle className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-black">{ins.type}</span>
                  <Badge tone={ins.severity === "high" ? "red" : ins.severity === "positive" ? "green" : "amber"}>
                    {ins.severity === "positive" ? "Positive" : ins.severity === "high" ? "Critical" : "Warning"}
                  </Badge>
                </div>
                <div className="text-xs text-black/60">{ins.staff}</div>
                <div className="text-xs text-black/50 mt-0.5">{ins.detail}</div>
              </div>
              <button onClick={() => onAction(`Action taken on: ${ins.type} for ${ins.staff}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1 flex-shrink-0">
                Act <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Staffing Forecast */}
      <Card>
        <CardHeader title="Staffing Capacity Forecast" subtitle="AI-predicted staffing demand vs current capacity — H2 2026" />
        <div className="p-4 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forecasts} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <YAxis domain={[120, 180]} tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="capacity" name="Current Capacity" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="demand" name="Predicted Demand" fill="#F59E0B" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* AI Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { name: "Productivity Forecasting Agent", desc: "Predicts individual and team productivity 30–90 days ahead", tasks: 842, accuracy: 91, status: "Active" },
          { name: "Burnout Detection Agent", desc: "Monitors workload patterns, overtime, and wellbeing indicators", tasks: 284, accuracy: 89, status: "Active" },
          { name: "Performance Prediction Agent", desc: "Predicts performance review outcomes and flags at-risk staff", tasks: 612, accuracy: 88, status: "Active" },
          { name: "Coaching Recommendation Agent", desc: "Generates personalised coaching plans from performance data", tasks: 184, accuracy: 93, status: "Active" },
          { name: "Talent Development Agent", desc: "Identifies high-potential staff and recommends development paths", tasks: 124, accuracy: 87, status: "Active" },
          { name: "Staffing Optimisation Agent", desc: "Optimises team composition, forecasts hiring needs, reduces gaps", tasks: 96, accuracy: 85, status: "Active" },
        ].map(agent => (
          <div key={agent.name} className="bg-white border border-black/8 rounded-xl p-4 hover:shadow-sm hover:border-black/15 transition-all">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-slate-100 text-[#0F172A] grid place-items-center flex-shrink-0">
                <Cpu className="h-4 w-4" />
              </div>
              <Badge tone="green">{agent.status}</Badge>
            </div>
            <div className="text-xs font-semibold text-black mb-1">{agent.name}</div>
            <div className="text-[11px] text-black/50 leading-relaxed mb-3">{agent.desc}</div>
            <div className="flex items-center justify-between text-[10px] text-black/40">
              <span>{agent.tasks.toLocaleString()} tasks processed</span>
              <span className="font-semibold text-[#0F172A]">{agent.accuracy}% accuracy</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
