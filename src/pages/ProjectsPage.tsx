import { useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import { ModulePage, Card, CardHeader, Badge } from "@/components/ModulePage";
import {
  LayoutDashboard, Briefcase, ClipboardList, BarChart3, Wallet, ShieldCheck,
  CheckCircle, UsersRound, Building2, FileText, Sparkles, TrendingUp,
  AlertTriangle, Clock, CheckCircle2, Activity,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from "recharts";

/* ─── Section config — every PM sub-route ───────────────────────────────── */
type Section = {
  path: string;
  title: string;
  description: string;
  icon: React.ElementType;
  phase: string;
};
const SECTIONS: Section[] = [
  { path: "/projects",              title: "PM Control Tower",       description: "Real-time portfolio command center — KPIs, alerts, AI insights across every capital project", icon: LayoutDashboard, phase: "Phase 16" },
  { path: "/projects/portfolio",    title: "Project Portfolio",      description: "Strategic portfolio view — alignment, prioritisation, capacity, value scoring",             icon: Briefcase,       phase: "Phase 16.1" },
  { path: "/projects/planning",     title: "Planning & WBS",         description: "Work Breakdown Structure, scope baselines, deliverables, milestone planning",              icon: ClipboardList,   phase: "Phase 16.2" },
  { path: "/projects/schedule",     title: "Schedule & Gantt",       description: "Critical path, baselines vs actuals, dependency mapping, schedule risk analytics",         icon: BarChart3,       phase: "Phase 16.3" },
  { path: "/projects/costs",        title: "Cost & Finance",         description: "Earned-value management, BCWS/BCWP/ACWP, CPI/SPI, forecast-at-completion, variance",       icon: Wallet,          phase: "Phase 16.4" },
  { path: "/projects/risks",        title: "Risk & Issues",          description: "Probability × impact register, AI risk forecasting, mitigation tracking, escalation",     icon: ShieldCheck,     phase: "Phase 16.5" },
  { path: "/projects/quality",      title: "Quality & Compliance",   description: "Quality plans, inspections, non-conformances, regulatory compliance scoring",              icon: CheckCircle,     phase: "Phase 16.6" },
  { path: "/projects/resources",    title: "Resources",              description: "Resource leveling, utilisation, skills allocation, capacity vs demand forecast",           icon: UsersRound,      phase: "Phase 16.7" },
  { path: "/projects/contractors",  title: "Contractors",            description: "Contractor scorecards, on-site headcount, safety record, performance ranking",             icon: Building2,       phase: "Phase 16.8" },
  { path: "/projects/documents",    title: "Project Documents",      description: "Drawings, RFIs, submittals, change orders, document control register",                    icon: FileText,        phase: "Phase 16.9" },
  { path: "/projects/ai-tower",     title: "AI Control Tower",       description: "Predictive delivery, AI-driven escalation, anomaly detection across all projects",         icon: Sparkles,        phase: "Phase 16.10" },
];

/* ─── Shared mock data ──────────────────────────────────────────────────── */
const PROJECTS = [
  { id: "P-001", name: "Beitbridge–Harare Highway Rehab",   ministry: "Transport",      budget: 248_000_000, spent: 161_200_000, progress: 65, status: "On Track",  risk: "Medium", health: 78 },
  { id: "P-002", name: "Hwange Unit 7 & 8 Expansion",       ministry: "Energy",         budget: 412_000_000, spent: 318_000_000, progress: 77, status: "At Risk",   risk: "High",   health: 56 },
  { id: "P-003", name: "Mpilo Hospital Upgrade",            ministry: "Health",         budget:  82_500_000, spent:  47_600_000, progress: 58, status: "On Track",  risk: "Low",    health: 84 },
  { id: "P-004", name: "Tugwi-Mukosi Irrigation Phase II",  ministry: "Lands",          budget: 156_700_000, spent:  98_400_000, progress: 63, status: "On Track",  risk: "Medium", health: 72 },
  { id: "P-005", name: "ZBC Digital Migration",             ministry: "Information",    budget:  64_300_000, spent:  41_900_000, progress: 65, status: "Delayed",   risk: "High",   health: 48 },
  { id: "P-006", name: "Smart Schools National Rollout",    ministry: "Education",      budget: 198_000_000, spent: 102_400_000, progress: 52, status: "On Track",  risk: "Medium", health: 70 },
  { id: "P-007", name: "Victoria Falls Airport Terminal 2", ministry: "Transport",      budget: 134_500_000, spent: 121_000_000, progress: 90, status: "On Track",  risk: "Low",    health: 88 },
  { id: "P-008", name: "Kariba Dam Spillway Refurb.",       ministry: "Water",          budget: 295_000_000, spent: 187_500_000, progress: 64, status: "At Risk",   risk: "High",   health: 54 },
];

const MONTHLY = [
  { m: "Jan", planned: 42, actual: 38, ev: 36 },
  { m: "Feb", planned: 78, actual: 71, ev: 69 },
  { m: "Mar", planned:120, actual:112, ev:108 },
  { m: "Apr", planned:165, actual:158, ev:151 },
  { m: "May", planned:212, actual:201, ev:188 },
  { m: "Jun", planned:262, actual:248, ev:231 },
  { m: "Jul", planned:316, actual:299, ev:278 },
  { m: "Aug", planned:374, actual:351, ev:325 },
  { m: "Sep", planned:438, actual:408, ev:376 },
];

const fmt = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`;
const BLUE = ["#0F172A", "#334155", "#475569", "#94A3B8", "#bfdbfe", "#dbeafe"];

/* ─── Reusable mini components ──────────────────────────────────────────── */
function KPI({ label, value, delta, tone = "default" }: { label: string; value: string; delta?: string; tone?: "default" | "good" | "bad" | "warn" }) {
  const toneCls = { default: "text-black", good: "text-[#0F172A]", bad: "text-red-600", warn: "text-[#0F172A]" }[tone];
  return (
    <Card className="p-4">
      <div className="text-[11px] text-black/50 uppercase tracking-wider font-medium">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${toneCls}`}>{value}</div>
      {delta && <div className="text-[11px] text-black/40 mt-1">{delta}</div>}
    </Card>
  );
}

function ChartCard({ title, subtitle, children, height = 240 }: { title: string; subtitle?: string; children: React.ReactNode; height?: number }) {
  return (
    <Card className="p-4">
      <CardHeader title={title} subtitle={subtitle} />
      <div style={{ width: "100%", height }}>{children}</div>
    </Card>
  );
}

/* ─── Per-section renderers ─────────────────────────────────────────────── */
function ControlTower() {
  const total = PROJECTS.reduce((s, p) => s + p.budget, 0);
  const spent = PROJECTS.reduce((s, p) => s + p.spent, 0);
  const onTrack = PROJECTS.filter(p => p.status === "On Track").length;
  const atRisk = PROJECTS.filter(p => p.status === "At Risk").length;
  const delayed = PROJECTS.filter(p => p.status === "Delayed").length;

  const healthDist = [
    { name: "Healthy (>75)", value: PROJECTS.filter(p => p.health > 75).length },
    { name: "Watch (50-75)", value: PROJECTS.filter(p => p.health >= 50 && p.health <= 75).length },
    { name: "Critical (<50)", value: PROJECTS.filter(p => p.health < 50).length },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPI label="Active Projects" value={String(PROJECTS.length)} delta={`+2 vs last month`} />
        <KPI label="Portfolio Value" value={fmt(total)} delta="Approved budgets" />
        <KPI label="Committed Spend" value={fmt(spent)} delta={`${Math.round((spent / total) * 100)}% utilised`} tone="warn" />
        <KPI label="On-Time Delivery" value="73%" delta="↑ 4 pts QoQ" tone="good" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPI label="On Track" value={String(onTrack)} tone="good" />
        <KPI label="At Risk" value={String(atRisk)} tone="warn" />
        <KPI label="Delayed" value={String(delayed)} tone="bad" />
        <KPI label="Open Risks" value="47" delta="9 high severity" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        <ChartCard title="Planned vs Actual Spend" subtitle="Cumulative $M across portfolio">
          <ResponsiveContainer>
            <AreaChart data={MONTHLY}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="m" fontSize={11} /><YAxis fontSize={11} />
              <Tooltip />
              <Area type="monotone" dataKey="planned" stroke="#94a3b8" strokeDasharray="4 4" fill="none" />
              <Area type="monotone" dataKey="actual"  stroke="#3B82F6" fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Portfolio Health Distribution">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={healthDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={(e: { value: number }) => e.value}>
                {healthDist.map((_, i) => <Cell key={i} fill={["#475569", "#64748B", "#DC2626"][i]} />)}
              </Pie>
              <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Budget by Ministry">
          <ResponsiveContainer>
            <BarChart data={PROJECTS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="ministry" fontSize={10} angle={-25} textAnchor="end" height={50} interval={0} />
              <YAxis fontSize={11} tickFormatter={(v: number) => `${v / 1e6}M`} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="budget" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-black/8 flex items-center justify-between">
          <div className="text-sm font-semibold text-black">Live Project Register</div>
          <Badge tone="blue">{PROJECTS.length} active</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#fafafa] text-black/50 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="text-left px-4 py-2.5">ID</th><th className="text-left px-4 py-2.5">Project</th>
                <th className="text-left px-4 py-2.5">Ministry</th><th className="text-right px-4 py-2.5">Budget</th>
                <th className="text-right px-4 py-2.5">Spent</th><th className="text-left px-4 py-2.5 w-40">Progress</th>
                <th className="text-left px-4 py-2.5">Status</th><th className="text-left px-4 py-2.5">Risk</th>
                <th className="text-right px-4 py-2.5">Health</th>
              </tr>
            </thead>
            <tbody>
              {PROJECTS.map(p => (
                <tr key={p.id} className="border-t border-black/5 hover:bg-[#fafafa]">
                  <td className="px-4 py-2.5 font-mono text-black/60">{p.id}</td>
                  <td className="px-4 py-2.5 font-medium text-black">{p.name}</td>
                  <td className="px-4 py-2.5 text-black/60">{p.ministry}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{fmt(p.budget)}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-black/60">{fmt(p.spent)}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-black/5 overflow-hidden">
                        <div className="h-full bg-[#0F172A] rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-[10px] text-black/60 w-8">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={p.status === "On Track" ? "green" : p.status === "At Risk" ? "amber" : "red"}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={p.risk === "Low" ? "green" : p.risk === "Medium" ? "amber" : "red"}>{p.risk}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{p.health}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function Portfolio() {
  const alignment = [
    { axis: "Strategic Fit",  Health: 82, Transport: 78, Energy: 65, Education: 88 },
    { axis: "Financial ROI",  Health: 71, Transport: 84, Energy: 76, Education: 62 },
    { axis: "Risk Profile",   Health: 68, Transport: 60, Energy: 45, Education: 79 },
    { axis: "Delivery Mat.",  Health: 75, Transport: 70, Energy: 55, Education: 81 },
    { axis: "Compliance",     Health: 90, Transport: 82, Energy: 73, Education: 87 },
  ];
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPI label="Total Projects"   value="48" />
        <KPI label="Approved Pipeline" value="$1.59B" />
        <KPI label="Avg Strategic Score" value="76 / 100" tone="good" />
        <KPI label="Capital Backlog"   value="$420M" tone="warn" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-4">
        <ChartCard title="Sector Alignment Radar" subtitle="Strategic scoring across dimensions" height={300}>
          <ResponsiveContainer>
            <RadarChart data={alignment}>
              <PolarGrid /><PolarAngleAxis dataKey="axis" fontSize={11} /><PolarRadiusAxis fontSize={10} />
              <Radar dataKey="Health"     stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
              <Radar dataKey="Transport"  stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
              <Radar dataKey="Energy"     stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
              <Radar dataKey="Education"  stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} />
              <Legend wrapperStyle={{ fontSize: 11 }} /><Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Investment vs Expected Value" subtitle="$M committed (x) vs benefit ($M, y)" height={300}>
          <ResponsiveContainer>
            <BarChart data={PROJECTS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="id" fontSize={10} /><YAxis fontSize={11} tickFormatter={(v: number) => `${v / 1e6}M`} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar dataKey="budget" name="Investment" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent"  name="Committed"  fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}

function Planning() {
  const wbs = [
    { lvl: 1, code: "1.0",     name: "Project Initiation",   complete: 100, owner: "PMO" },
    { lvl: 2, code: "1.1",     name: "Charter Approval",     complete: 100, owner: "Sponsor" },
    { lvl: 2, code: "1.2",     name: "Stakeholder Register", complete: 100, owner: "PM" },
    { lvl: 1, code: "2.0",     name: "Planning",             complete: 88,  owner: "PMO" },
    { lvl: 2, code: "2.1",     name: "Scope Baseline",       complete: 95,  owner: "PM" },
    { lvl: 2, code: "2.2",     name: "Schedule Baseline",    complete: 92,  owner: "Scheduler" },
    { lvl: 2, code: "2.3",     name: "Cost Baseline",        complete: 80,  owner: "Cost Eng." },
    { lvl: 1, code: "3.0",     name: "Execution",            complete: 47,  owner: "Site Mgmt." },
    { lvl: 2, code: "3.1",     name: "Site Establishment",   complete: 100, owner: "Contractor" },
    { lvl: 2, code: "3.2",     name: "Earthworks",           complete: 65,  owner: "Contractor" },
    { lvl: 2, code: "3.3",     name: "Structural Works",     complete: 22,  owner: "Contractor" },
    { lvl: 1, code: "4.0",     name: "Monitoring & Control", complete: 35,  owner: "PMO" },
    { lvl: 1, code: "5.0",     name: "Closure",              complete: 0,   owner: "PMO" },
  ];
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPI label="Total Work Packages" value="148" />
        <KPI label="Completed" value="63" tone="good" />
        <KPI label="In Progress" value="47" />
        <KPI label="Not Started" value="38" tone="warn" />
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-black/8 text-sm font-semibold">Work Breakdown Structure — Beitbridge–Harare Highway</div>
        <table className="w-full text-xs">
          <thead className="bg-[#fafafa] text-black/50 uppercase text-[10px]">
            <tr><th className="text-left px-4 py-2">WBS</th><th className="text-left px-4 py-2">Deliverable</th><th className="text-left px-4 py-2">Owner</th><th className="text-left px-4 py-2 w-48">Progress</th></tr>
          </thead>
          <tbody>
            {wbs.map(w => (
              <tr key={w.code} className="border-t border-black/5">
                <td className="px-4 py-2 font-mono text-black/60">{w.code}</td>
                <td className="px-4 py-2 font-medium" style={{ paddingLeft: 16 + (w.lvl - 1) * 24 }}>{w.name}</td>
                <td className="px-4 py-2 text-black/60">{w.owner}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-black/5 overflow-hidden"><div className="h-full bg-[#0F172A]" style={{ width: `${w.complete}%` }} /></div>
                    <span className="text-[10px] w-8 text-right">{w.complete}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function Schedule() {
  const tasks = [
    { id: "T1", name: "Site Survey",          start: 0,  duration: 14, complete: 100, critical: false },
    { id: "T2", name: "Design Approval",      start: 10, duration: 28, complete: 100, critical: true  },
    { id: "T3", name: "Mobilisation",         start: 32, duration: 21, complete: 100, critical: true  },
    { id: "T4", name: "Earthworks Phase 1",   start: 50, duration: 56, complete:  82, critical: true  },
    { id: "T5", name: "Drainage System",      start: 70, duration: 42, complete:  60, critical: false },
    { id: "T6", name: "Sub-base Layers",      start:100, duration: 49, complete:  35, critical: true  },
    { id: "T7", name: "Asphalt Surfacing",    start:140, duration: 56, complete:   0, critical: true  },
    { id: "T8", name: "Road Markings",        start:185, duration: 14, complete:   0, critical: false },
    { id: "T9", name: "Handover & Defects",   start:200, duration: 28, complete:   0, critical: false },
  ];
  const totalDays = 240;
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPI label="Schedule Health (SPI)" value="0.93" tone="warn" delta="< 1.0 = behind plan" />
        <KPI label="Critical Path Tasks"   value="5" />
        <KPI label="Float (days)"          value="12" />
        <KPI label="Slipped Tasks"         value="3" tone="bad" />
      </div>
      <Card className="p-4">
        <CardHeader title="Gantt — Beitbridge–Harare Highway" subtitle={`${totalDays} day baseline · highlighted bars are on the critical path`} />
        <div className="space-y-1 mt-3">
          {tasks.map(t => (
            <div key={t.id} className="grid grid-cols-[140px_1fr_50px] items-center gap-2 text-xs">
              <div className="text-black/70 truncate">{t.name}</div>
              <div className="relative h-5 bg-black/5 rounded">
                <div className="absolute h-full rounded" style={{
                  left: `${(t.start / totalDays) * 100}%`,
                  width: `${(t.duration / totalDays) * 100}%`,
                  background: t.critical ? "#0F172A" : "#94A3B8",
                }} />
                <div className="absolute h-full rounded bg-[#0F172A]/70" style={{
                  left: `${(t.start / totalDays) * 100}%`,
                  width: `${(t.duration * t.complete / 100 / totalDays) * 100}%`,
                }} />
              </div>
              <div className="text-right text-black/50">{t.complete}%</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function Costs() {
  const ev = [
    { m: "Jan", pv:  20, ev:  18, ac:  22 },
    { m: "Feb", pv:  48, ev:  43, ac:  50 },
    { m: "Mar", pv:  86, ev:  78, ac:  92 },
    { m: "Apr", pv: 128, ev: 117, ac: 138 },
    { m: "May", pv: 175, ev: 158, ac: 188 },
    { m: "Jun", pv: 225, ev: 201, ac: 240 },
    { m: "Jul", pv: 278, ev: 247, ac: 296 },
    { m: "Aug", pv: 332, ev: 293, ac: 354 },
    { m: "Sep", pv: 388, ev: 339, ac: 414 },
  ];
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPI label="CPI (Cost Performance)"      value="0.82" tone="bad"  delta="< 1.0 = over budget" />
        <KPI label="SPI (Schedule Performance)"  value="0.87" tone="warn" delta="< 1.0 = behind" />
        <KPI label="EAC (Forecast at Completion)" value="$502M" tone="warn" delta="vs BAC $410M" />
        <KPI label="VAC (Variance)"              value="-$92M" tone="bad" delta="cost overrun" />
      </div>
      <ChartCard title="Earned Value Curve" subtitle="PV (Planned) vs EV (Earned) vs AC (Actual) — $M" height={300}>
        <ResponsiveContainer>
          <LineChart data={ev}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="m" fontSize={11} /><YAxis fontSize={11} />
            <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="pv" name="Planned Value (PV)" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} />
            <Line type="monotone" dataKey="ev" name="Earned Value (EV)"  stroke="#10B981" strokeWidth={2} />
            <Line type="monotone" dataKey="ac" name="Actual Cost (AC)"   stroke="#DC2626" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
}

function Risks() {
  const risks = [
    { id: "R1", desc: "Foreign exchange volatility (USD/ZWL)", prob: 5, impact: 5, owner: "Treasury",    status: "Open" },
    { id: "R2", desc: "Cement supply delay from regional mill", prob: 4, impact: 4, owner: "Procurement", status: "Mitigating" },
    { id: "R3", desc: "Rainy-season earthworks slowdown",        prob: 4, impact: 3, owner: "Site Mgmt",   status: "Open" },
    { id: "R4", desc: "Land acquisition dispute — Chivhu segment", prob: 3, impact: 5, owner: "Legal",      status: "Escalated" },
    { id: "R5", desc: "Skilled-labour shortage (welders)",         prob: 3, impact: 3, owner: "HR",          status: "Mitigating" },
    { id: "R6", desc: "Fuel price shock impact on haulage",         prob: 4, impact: 3, owner: "Logistics",   status: "Open" },
    { id: "R7", desc: "Environmental permit re-issue delay",        prob: 2, impact: 4, owner: "Compliance",  status: "Closed" },
  ];
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPI label="Total Risks" value="47" />
        <KPI label="High Severity (P×I ≥ 15)" value="9" tone="bad" />
        <KPI label="Mitigated YTD" value="22" tone="good" />
        <KPI label="Open Issues"   value="14" tone="warn" />
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-black/8 text-sm font-semibold">Risk Register — Top 7</div>
        <table className="w-full text-xs">
          <thead className="bg-[#fafafa] text-black/50 uppercase text-[10px]">
            <tr><th className="text-left px-4 py-2">ID</th><th className="text-left px-4 py-2">Description</th><th className="text-center px-4 py-2">Probability</th><th className="text-center px-4 py-2">Impact</th><th className="text-center px-4 py-2">Score</th><th className="text-left px-4 py-2">Owner</th><th className="text-left px-4 py-2">Status</th></tr>
          </thead>
          <tbody>
            {risks.map(r => {
              const s = r.prob * r.impact;
              const tone = s >= 15 ? "red" : s >= 9 ? "amber" : "green";
              return (
                <tr key={r.id} className="border-t border-black/5">
                  <td className="px-4 py-2 font-mono text-black/60">{r.id}</td>
                  <td className="px-4 py-2 font-medium">{r.desc}</td>
                  <td className="px-4 py-2 text-center">{r.prob}</td>
                  <td className="px-4 py-2 text-center">{r.impact}</td>
                  <td className="px-4 py-2 text-center"><Badge tone={tone}>{s}</Badge></td>
                  <td className="px-4 py-2 text-black/60">{r.owner}</td>
                  <td className="px-4 py-2"><Badge tone={r.status === "Closed" ? "green" : r.status === "Escalated" ? "red" : "amber"}>{r.status}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function Quality() {
  const ncrs = [
    { m: "Jan", opened: 4, closed: 3 }, { m: "Feb", opened: 6, closed: 5 },
    { m: "Mar", opened: 8, closed: 6 }, { m: "Apr", opened: 5, closed: 7 },
    { m: "May", opened: 9, closed: 6 }, { m: "Jun", opened: 7, closed: 8 },
    { m: "Jul", opened:11, closed: 9 }, { m: "Aug", opened: 6, closed:10 },
    { m: "Sep", opened: 4, closed: 7 },
  ];
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPI label="Quality Index" value="92.4 / 100" tone="good" />
        <KPI label="Open NCRs" value="13" tone="warn" />
        <KPI label="Inspections (MTD)" value="148" />
        <KPI label="Pass Rate" value="96.1%" tone="good" />
      </div>
      <ChartCard title="Non-Conformance Reports — Opened vs Closed" height={260}>
        <ResponsiveContainer>
          <BarChart data={ncrs}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="m" fontSize={11} /><YAxis fontSize={11} />
            <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="opened" name="Opened" fill="#DC2626" radius={[4, 4, 0, 0]} />
            <Bar dataKey="closed" name="Closed" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
}

function Resources() {
  const util = [
    { role: "Project Managers", capacity: 12, demand: 14 },
    { role: "Civil Engineers",  capacity: 38, demand: 42 },
    { role: "Quantity Surveyor",capacity: 18, demand: 16 },
    { role: "Safety Officers",  capacity: 22, demand: 25 },
    { role: "Schedulers",       capacity:  8, demand: 11 },
    { role: "Cost Engineers",   capacity: 14, demand: 13 },
  ];
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPI label="Total Resources Allocated" value="412" />
        <KPI label="Avg Utilisation" value="87%" tone="warn" />
        <KPI label="Over-allocated Roles" value="4" tone="bad" />
        <KPI label="Bench (available)" value="22" tone="good" />
      </div>
      <ChartCard title="Capacity vs Demand by Role" height={280}>
        <ResponsiveContainer>
          <BarChart data={util} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis type="number" fontSize={11} /><YAxis dataKey="role" type="category" fontSize={11} width={120} />
            <Tooltip /><Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="capacity" name="Capacity" fill="#94A3B8" radius={[0, 4, 4, 0]} />
            <Bar dataKey="demand"   name="Demand"   fill="#F59E0B" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
}

function Contractors() {
  const contractors = [
    { name: "Tensor Civils (Pvt) Ltd",   value: 184_000_000, projects: 4, safety: 98, otd: 92, quality: 95, score: "A" },
    { name: "Bitumen World Zimbabwe",    value: 142_000_000, projects: 3, safety: 95, otd: 88, quality: 91, score: "A" },
    { name: "Group Five Construction",   value: 268_000_000, projects: 2, safety: 88, otd: 71, quality: 83, score: "B" },
    { name: "Fossil Mines & Civils",     value:  92_000_000, projects: 2, safety: 92, otd: 85, quality: 88, score: "A-" },
    { name: "Costain Africa",            value: 121_000_000, projects: 1, safety: 78, otd: 62, quality: 74, score: "C" },
  ];
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPI label="Active Contractors" value="28" />
        <KPI label="On-site Headcount" value="3,412" />
        <KPI label="Lost-Time Injuries (YTD)" value="2" tone="good" />
        <KPI label="Avg Performance Score" value="86%" />
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-black/8 text-sm font-semibold">Contractor Scorecards</div>
        <table className="w-full text-xs">
          <thead className="bg-[#fafafa] text-black/50 uppercase text-[10px]">
            <tr><th className="text-left px-4 py-2">Contractor</th><th className="text-right px-4 py-2">Contract Value</th><th className="text-center px-4 py-2">Projects</th><th className="text-center px-4 py-2">Safety</th><th className="text-center px-4 py-2">On-Time</th><th className="text-center px-4 py-2">Quality</th><th className="text-center px-4 py-2">Grade</th></tr>
          </thead>
          <tbody>
            {contractors.map(c => (
              <tr key={c.name} className="border-t border-black/5">
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2 text-right tabular-nums">{fmt(c.value)}</td>
                <td className="px-4 py-2 text-center">{c.projects}</td>
                <td className="px-4 py-2 text-center">{c.safety}</td>
                <td className="px-4 py-2 text-center">{c.otd}</td>
                <td className="px-4 py-2 text-center">{c.quality}</td>
                <td className="px-4 py-2 text-center"><Badge tone={c.score.startsWith("A") ? "green" : c.score === "B" ? "amber" : "red"}>{c.score}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function Documents() {
  const docs = [
    { id: "D-2026-014", type: "Drawing",      title: "Bridge Pier P-12 General Arrangement", rev: "C", status: "Approved", updated: "2d ago" },
    { id: "D-2026-015", type: "RFI",          title: "Subgrade compaction tolerance query",  rev: "1", status: "Open",     updated: "5h ago" },
    { id: "D-2026-016", type: "Submittal",    title: "Asphalt Mix Design — AC 14",            rev: "B", status: "Review",   updated: "1d ago" },
    { id: "D-2026-017", type: "Change Order", title: "Drainage upgrade — section 4",          rev: "0", status: "Pending",  updated: "3d ago" },
    { id: "D-2026-018", type: "Spec",         title: "Reinforcement steel grade 500MPa",      rev: "A", status: "Approved", updated: "1w ago" },
    { id: "D-2026-019", type: "Test Report",  title: "Concrete cube tests — 28-day",          rev: "0", status: "Approved", updated: "4d ago" },
  ];
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPI label="Total Documents" value="1,847" />
        <KPI label="Pending Review" value="34" tone="warn" />
        <KPI label="Open RFIs" value="12" tone="warn" />
        <KPI label="Change Orders YTD" value="28" />
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-black/8 text-sm font-semibold">Document Control Register</div>
        <table className="w-full text-xs">
          <thead className="bg-[#fafafa] text-black/50 uppercase text-[10px]">
            <tr><th className="text-left px-4 py-2">Doc ID</th><th className="text-left px-4 py-2">Type</th><th className="text-left px-4 py-2">Title</th><th className="text-center px-4 py-2">Rev</th><th className="text-left px-4 py-2">Status</th><th className="text-right px-4 py-2">Updated</th></tr>
          </thead>
          <tbody>
            {docs.map(d => (
              <tr key={d.id} className="border-t border-black/5">
                <td className="px-4 py-2 font-mono text-black/60">{d.id}</td>
                <td className="px-4 py-2">{d.type}</td>
                <td className="px-4 py-2 font-medium">{d.title}</td>
                <td className="px-4 py-2 text-center">{d.rev}</td>
                <td className="px-4 py-2"><Badge tone={d.status === "Approved" ? "green" : d.status === "Open" ? "red" : "amber"}>{d.status}</Badge></td>
                <td className="px-4 py-2 text-right text-black/50">{d.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function AITower() {
  const predictions = [
    { project: "P-002 Hwange Unit 7&8", insight: "62% probability of >90-day slippage", driver: "Cement supply + FX exposure", action: "Pre-order H1 supply",       severity: "High" },
    { project: "P-005 ZBC Digital",      insight: "Forecast EAC overrun of $9.4M",      driver: "Scope creep in studio fit-out", action: "Convene change-control",    severity: "High" },
    { project: "P-008 Kariba Spillway",  insight: "Subcontractor underperformance",     driver: "Safety record dropped 12 pts",  action: "Trigger remedy notice",     severity: "Medium" },
    { project: "P-001 Beitbridge Hwy",   insight: "Drainage works likely to overrun",    driver: "Rainy-season productivity loss",action: "Increase shift coverage",    severity: "Medium" },
    { project: "P-004 Tugwi-Mukosi",     insight: "Possible payment-cycle delays",       driver: "Invoice ageing > 45 days",      action: "Escalate to Treasury",       severity: "Low" },
  ];
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KPI label="AI Models Active" value="7" />
        <KPI label="Predictions (last 24h)" value="184" />
        <KPI label="High-severity Alerts" value="2" tone="bad" />
        <KPI label="Forecast Accuracy" value="87.4%" tone="good" />
      </div>
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-black/8 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#0F172A]" />
          <div className="text-sm font-semibold">AI Insights & Recommended Actions</div>
        </div>
        <div className="divide-y divide-black/5">
          {predictions.map((p, i) => (
            <div key={i} className="px-4 py-3 flex items-start gap-3">
              <div className={`h-8 w-8 rounded-lg grid place-items-center flex-shrink-0 ${p.severity === "High" ? "bg-red-50 text-red-600" : p.severity === "Medium" ? "bg-slate-50 text-[#0F172A]" : "bg-slate-50 text-[#0F172A]"}`}>
                {p.severity === "High" ? <AlertTriangle className="h-4 w-4" /> : p.severity === "Medium" ? <Clock className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-black/50">{p.project}</span>
                  <Badge tone={p.severity === "High" ? "red" : p.severity === "Medium" ? "amber" : "blue"}>{p.severity}</Badge>
                </div>
                <div className="text-sm font-medium text-black mt-0.5">{p.insight}</div>
                <div className="text-[11px] text-black/50 mt-1">Driver: {p.driver}</div>
                <div className="text-[11px] text-[#0F172A] font-medium mt-1">▶ Recommended: {p.action}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

/* ─── Main router ────────────────────────────────────────────────────────── */
export default function ProjectsPage() {
  const { pathname } = useLocation();
  const section = useMemo(
    () => SECTIONS.find(s => s.path === pathname) ?? SECTIONS[0],
    [pathname]
  );

  const renderBody = () => {
    switch (section.path) {
      case "/projects":              return <ControlTower />;
      case "/projects/portfolio":    return <Portfolio />;
      case "/projects/planning":     return <Planning />;
      case "/projects/schedule":     return <Schedule />;
      case "/projects/costs":        return <Costs />;
      case "/projects/risks":        return <Risks />;
      case "/projects/quality":      return <Quality />;
      case "/projects/resources":    return <Resources />;
      case "/projects/contractors":  return <Contractors />;
      case "/projects/documents":    return <Documents />;
      case "/projects/ai-tower":     return <AITower />;
      default:                       return <ControlTower />;
    }
  };

  return (
    <ModulePage title={section.title} description={section.description} phase={section.phase}>
      {/* sub-nav across PM sections */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {SECTIONS.map(s => {
          const active = s.path === section.path;
          const Icon = s.icon;
          return (
            <Link key={s.path} to={s.path}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? "bg-black text-white" : "bg-white border border-black/10 text-black/60 hover:border-black/30 hover:text-black"}`}>
              <Icon className="h-3.5 w-3.5" />
              {s.title}
            </Link>
          );
        })}
      </div>
      {renderBody()}
    </ModulePage>
  );
}
