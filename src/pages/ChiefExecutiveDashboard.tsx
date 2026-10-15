import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { pushNotification } from "@/lib/local-store";
import KpiScrollTicker from "@/components/KpiScrollTicker";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import {
  TrendingUp, DollarSign, Users, ShieldCheck, AlertTriangle, Sparkles,
  LayoutDashboard, Target, Activity, Download, Building2, Wallet,
  BarChart3, Crown, Landmark, ChevronRight, Send, RefreshCcw,
  CheckCircle2, Clock, FileText, Briefcase,
} from "lucide-react";

const TABS = ["Executive Overview", "Financial Control", "HR & People", "Operations", "Strategic Goals", "Board Reports"] as const;
type Tab = typeof TABS[number];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F97316"];

const DEPT_PERFORMANCE = [
  { dept: "PS Office", score: 94, staff: 12, tasks: 8 },
  { dept: "Finance", score: 91, staff: 32, tasks: 41 },
  { dept: "Procurement", score: 89, staff: 28, tasks: 67 },
  { dept: "HR", score: 92, staff: 24, tasks: 55 },
  { dept: "ICT", score: 93, staff: 21, tasks: 29 },
  { dept: "Legal", score: 95, staff: 19, tasks: 38 },
  { dept: "Operations", score: 86, staff: 56, tasks: 34 },
  { dept: "Service Delivery", score: 87, staff: 45, tasks: 112 },
];

const FINANCIAL_TREND = [
  { month: "Jan", revenue: 6.2, costs: 5.1, profit: 1.1 },
  { month: "Feb", revenue: 7.1, costs: 5.6, profit: 1.5 },
  { month: "Mar", revenue: 6.8, costs: 5.3, profit: 1.5 },
  { month: "Apr", revenue: 7.9, costs: 5.9, profit: 2.0 },
  { month: "May", revenue: 8.4, costs: 6.1, profit: 2.3 },
  { month: "Jun", revenue: 7.6, costs: 5.8, profit: 1.8 },
];

const STRATEGIC_RADAR = [
  { subject: "Revenue", A: 88 },
  { subject: "Compliance", A: 94 },
  { subject: "Efficiency", A: 82 },
  { subject: "Innovation", A: 76 },
  { subject: "People", A: 91 },
  { subject: "Risk", A: 79 },
];

const DEPT_PIE = [
  { name: "Finance", value: 28 }, { name: "Procurement", value: 22 },
  { name: "Operations", value: 18 }, { name: "HR", value: 12 },
  { name: "ICT", value: 10 }, { name: "Other", value: 10 },
];

export default function ChiefExecutiveDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Executive Overview");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const go = (route: string) => { navigate(route); pushNotification(`Navigating to ${route}`, "info"); };

  const handleAI = () => {
    if (!aiQuery.trim()) return;
    setAiResponse(
      `[CEO AI Advisor] Executive analysis for: "${aiQuery}"\n\n` +
      `Revenue YTD: USD 84.2M (+12% vs target)\n` +
      `Operating Costs: USD 61.8M (within budget)\n` +
      `8 departments performing above 85% threshold\n` +
      `3 strategic projects require board attention\n` +
      `Recommendation: Schedule immediate review of Operations dept — 86% score.`
    );
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Executive Oversight"
        process="Chief Executive Dashboard"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="rounded-2xl mb-5 p-6 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 85% 40%, white 0%, transparent 55%)" }} />
          <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge tone="default">Executive Office</Badge>
                <span className="text-[10px] text-white/40 font-mono uppercase tracking-wider">{user?.entity}</span>
              </div>
              <h1 className="text-2xl font-bold text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
                Chief Executive Officer
              </h1>
              <p className="text-sm text-white/60 mt-1">Entity-Level Strategic Oversight · All Departments · Board Accountability</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => pushNotification("Executive briefing generated", "success")}
                className="h-9 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-medium flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI Briefing
              </button>
              <button onClick={() => pushNotification("Board pack generated", "success")}
                className="h-9 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-medium flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> Board Pack
              </button>
              <button onClick={() => go("/prime-entity")}
                className="h-9 px-3 rounded-xl bg-white text-black text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-100">
                <LayoutDashboard className="h-3.5 w-3.5" /> Full Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          <KpiCard label="Revenue YTD" value="USD 84.2M" delta="+12% vs target" positive={true} icon={DollarSign} color="green" />
          <KpiCard label="Operating Costs" value="USD 61.8M" delta="Within budget" positive={true} icon={Wallet} color="blue" />
          <KpiCard label="Total Staff" value="1,240" delta="14 vacancies" positive={false} icon={Users} color="amber" />
          <KpiCard label="Active Projects" value="23" delta="5 at risk" positive={false} icon={Briefcase} color="red" />
          <KpiCard label="Compliance Score" value="94.8%" delta="+0.6 pts" positive={true} icon={ShieldCheck} color="violet" />
          <KpiCard label="Avg Dept Score" value="90.4%" delta="All 8 reviewed" positive={true} icon={TrendingUp} color="cyan" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-black/10 overflow-x-auto scrollbar-none">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-2.5 text-xs font-medium border-b-2 -mb-px whitespace-nowrap transition-colors flex-shrink-0
                ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}</button>
          ))}
        </div>

        {/* ── EXECUTIVE OVERVIEW ─────────────────────────────────────────── */}
        {/* Tab content + right KPI ticker rail */}
        <div className="flex gap-4 items-start">
          <div className="flex-1 min-w-0">

        {tab === "Executive Overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader title="Revenue vs Operating Costs (USD M)" subtitle="Monthly comparison" />
                <div className="p-4 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={FINANCIAL_TREND}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#475569" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#334155" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#334155" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="revenue" stroke="#475569" fill="url(#revGrad)" name="Revenue" strokeWidth={2} />
                      <Area type="monotone" dataKey="costs" stroke="#334155" fill="url(#costGrad)" name="Costs" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <CardHeader title="Institutional Health" subtitle="6 strategic dimensions" />
                <div className="p-4 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={STRATEGIC_RADAR}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} />
                      <Radar name="Score" dataKey="A" stroke="#334155" fill="#334155" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Department drilldown */}
            <Card>
              <CardHeader title="Department Performance Matrix" subtitle="Click any department to drill down"
                action={<button onClick={() => go("/corporate")} className="h-8 px-3 rounded-xl bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1.5"><Crown className="h-3.5 w-3.5" /> Corporate Module</button>} />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-black/8">
                    <tr>{["Department", "Staff", "Open Tasks", "Score", "Status", "Action"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-black/40 whitespace-nowrap">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {DEPT_PERFORMANCE.map((d) => (
                      <tr key={d.dept} className="hover:bg-gray-50/60 cursor-pointer" onClick={() => go("/corporate")}>
                        <td className="px-4 py-3 text-xs font-semibold text-black">{d.dept}</td>
                        <td className="px-4 py-3 text-xs text-black/60">{d.staff}</td>
                        <td className="px-4 py-3 text-xs text-black/60">{d.tasks}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-black/5 overflow-hidden">
                              <div className={`h-full rounded-full ${d.score >= 90 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`}
                                style={{ width: `${d.score}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-black">{d.score}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={d.score >= 90 ? "green" : "amber"}>{d.score >= 90 ? "On Track" : "Review"}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={e => { e.stopPropagation(); go("/corporate"); }}
                            className="h-7 px-2.5 rounded-lg border border-black/10 text-[10px] hover:bg-gray-100 flex items-center gap-1">
                            Open <ChevronRight className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ── FINANCIAL CONTROL ──────────────────────────────────────────── */}
        {tab === "Financial Control" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Budget Available" value="USD 184M" delta="32.2% remaining" positive={true} color="green" />
              <KpiCard label="Commitments" value="USD 124M" delta="67.4% committed" positive={true} color="blue" />
              <KpiCard label="Expenditure YTD" value="USD 84.2M" delta="On track" positive={true} color="violet" />
              <KpiCard label="Overruns" value="3 depts" delta="Requires attention" positive={false} color="red" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader title="Budget Utilisation by Department" subtitle="Spend as % of allocation" />
                <div className="p-4 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { dept: "Finance", pct: 78 }, { dept: "Procurement", pct: 71 }, { dept: "HR", pct: 65 },
                      { dept: "ICT", pct: 82 }, { dept: "Operations", pct: 91 }, { dept: "Legal", pct: 58 },
                    ]} margin={{ bottom: 20 }}>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="dept" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} angle={-20} textAnchor="end" />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="pct" fill="#334155" radius={[3,3,0,0]} name="Utilisation %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <CardHeader title="Budget Allocation Split" subtitle="By department" />
                <div className="p-4 h-[240px] flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={DEPT_PIE} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                        {DEPT_PIE.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "Budget Dashboard", route: "/budget", icon: Wallet },
                { label: "Finance Module", route: "/finance", icon: DollarSign },
                { label: "Treasury", route: "/budget/treasury", icon: Landmark },
                { label: "Fraud Detection", route: "/budget/fraud", icon: AlertTriangle },
              ].map(a => (
                <button key={a.label} onClick={() => go(a.route)}
                  className="flex items-center gap-2 h-9 px-4 rounded-xl bg-white border border-black/10 text-xs font-medium hover:border-black/30 hover:shadow-sm transition-all">
                  <a.icon className="h-3.5 w-3.5 text-black/50" /> {a.label} <ChevronRight className="h-3 w-3 text-black/30" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── HR & PEOPLE ────────────────────────────────────────────────── */}
        {tab === "HR & People" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Total Headcount" value="1,240" delta="14 vacancies open" positive={false} icon={Users} color="blue" />
              <KpiCard label="Avg Performance" value="88.4%" delta="+2.1% this quarter" positive={true} icon={TrendingUp} color="green" />
              <KpiCard label="Training Hours YTD" value="4,820" delta="3.9 hrs per person" positive={true} icon={CheckCircle2} color="violet" />
              <KpiCard label="Staff Turnover" value="4.2%" delta="Below 5% target" positive={true} icon={Activity} color="cyan" />
            </div>
            <Card>
              <CardHeader title="Staff Performance by Department" subtitle="Average performance scores"
                action={<button onClick={() => go("/staff-productivity")} className="h-8 px-3 rounded-xl bg-black text-white text-xs hover:bg-gray-800">View All</button>} />
              <div className="p-4 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={DEPT_PERFORMANCE.map(d => ({ dept: d.dept, score: d.score - 2, staff: d.staff }))} margin={{ bottom: 20 }}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="dept" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} angle={-20} textAnchor="end" />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[70, 100]} />
                    <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="score" fill="#334155" radius={[3,3,0,0]} name="Performance %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* ── OPERATIONS ─────────────────────────────────────────────────── */}
        {tab === "Operations" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Active Projects" value="23" delta="5 at risk" positive={false} icon={Briefcase} color="amber" />
              <KpiCard label="Service Delivery Rate" value="87%" delta="Target: 90%" positive={false} icon={Activity} color="blue" />
              <KpiCard label="Compliance Rate" value="94.8%" delta="PRAZ target: 95%" positive={false} icon={ShieldCheck} color="green" />
              <KpiCard label="Open Risk Items" value="34" delta="8 critical" positive={false} icon={AlertTriangle} color="red" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { label: "Projects", route: "/projects", icon: Briefcase, desc: "PM Portfolio" },
                { label: "Operations", route: "/department-activities", icon: Activity, desc: "Dept activities" },
                { label: "Audit & Risk", route: "/audit", icon: ShieldCheck, desc: "Risk register" },
                { label: "Procurement", route: "/lifecycle", icon: BarChart3, desc: "Lifecycle tower" },
                { label: "Contracts", route: "/contracts", icon: FileText, desc: "Contract portfolio" },
                { label: "Asset Register", route: "/assets", icon: Building2, desc: "Govt assets" },
                { label: "Inventory", route: "/inventory", icon: BarChart3, desc: "Stock levels" },
                { label: "Anti-Corruption", route: "/anti-corruption", icon: AlertTriangle, desc: "Fraud detection" },
              ].map(mod => (
                <button key={mod.label} onClick={() => go(mod.route)}
                  className="p-4 rounded-2xl bg-white border border-black/8 hover:border-black/25 hover:shadow-md text-left transition-all group">
                  <div className="h-9 w-9 rounded-xl bg-gray-100 grid place-items-center mb-2.5 group-hover:bg-black/5">
                    <mod.icon className="h-4.5 w-4.5 text-black/60" style={{ height: 18, width: 18 }} />
                  </div>
                  <div className="text-xs font-semibold text-black">{mod.label}</div>
                  <div className="text-[10px] text-black/40 mt-0.5">{mod.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STRATEGIC GOALS ────────────────────────────────────────────── */}
        {tab === "Strategic Goals" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="Strategic Plan Progress — FY2026" subtitle="7 strategic objectives" />
              <div className="divide-y divide-black/5">
                {[
                  { goal: "Increase revenue by 15% through improved service delivery", progress: 80, status: "On Track" },
                  { goal: "Achieve 95% procurement compliance rating", progress: 94, status: "On Track" },
                  { goal: "Complete digital transformation of 6 core systems", progress: 67, status: "At Risk" },
                  { goal: "Reduce operational costs by 8% through efficiency gains", progress: 45, status: "At Risk" },
                  { goal: "Achieve 90% staff performance score average", progress: 88, status: "On Track" },
                  { goal: "Zero tolerance anti-corruption — all staff trained", progress: 91, status: "On Track" },
                  { goal: "Complete infrastructure project portfolio on schedule", progress: 62, status: "Behind" },
                ].map((g, i) => (
                  <div key={i} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-xs text-black flex-1">{g.goal}</p>
                      <Badge tone={g.status === "On Track" ? "green" : g.status === "At Risk" ? "amber" : "red"}>{g.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-black/5 overflow-hidden">
                        <div className={`h-full rounded-full ${g.progress >= 85 ? "bg-[#0F172A]" : g.progress >= 60 ? "bg-[#0F172A]" : "bg-red-500"}`}
                          style={{ width: `${g.progress}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-black flex-shrink-0">{g.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── BOARD REPORTS ──────────────────────────────────────────────── */}
        {tab === "Board Reports" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card>
                <CardHeader title="Board Pack — Q2 2026" subtitle="Documents for board meeting"
                  action={<button onClick={() => pushNotification("Board pack generated", "success")}
                    className="h-8 px-3 rounded-xl bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5" /> Generate PDF</button>} />
                <div className="divide-y divide-black/5">
                  {[
                    { doc: "CEO Report Q2 2026", status: "Ready", pages: 12 },
                    { doc: "Financial Statements — H1 2026", status: "Draft", pages: 28 },
                    { doc: "Procurement Performance Report", status: "Ready", pages: 8 },
                    { doc: "Risk Management Report", status: "Ready", pages: 14 },
                    { doc: "HR & People Report", status: "Draft", pages: 10 },
                    { doc: "Strategic Plan Progress Update", status: "Ready", pages: 6 },
                  ].map((d, i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-black/30 flex-shrink-0" />
                        <div>
                          <div className="text-xs font-medium text-black">{d.doc}</div>
                          <div className="text-[10px] text-black/40">{d.pages} pages</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge tone={d.status === "Ready" ? "green" : "amber"}>{d.status}</Badge>
                        <button onClick={() => pushNotification(`Opened ${d.doc}`, "info")}
                          className="h-7 px-2 rounded-lg border border-black/10 text-[10px] hover:bg-gray-100">Open</button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <div className="space-y-4">
                <Card>
                  <CardHeader title="Executive AI Briefing" />
                  <div className="p-4 space-y-3">
                    <div className="flex gap-2">
                      <input value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleAI()}
                        placeholder="Ask CEO AI Advisor anything…"
                        className="flex-1 h-9 px-3 rounded-xl border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
                      <button onClick={handleAI}
                        className="h-9 px-3 rounded-xl bg-black text-white text-xs flex items-center gap-1.5 hover:bg-gray-800">
                        <Sparkles className="h-3.5 w-3.5" /> Ask
                      </button>
                    </div>
                    {aiResponse && (
                      <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-black/70 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto">
                        {aiResponse}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      {["Summarise Q2 performance", "Key risks for board", "Financial highlights", "HR report summary"].map(q => (
                        <button key={q} onClick={() => { setAiQuery(q); handleAI(); }}
                          className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-[#0F172A] text-left hover:bg-slate-100">
                          💬 {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
                <Card>
                  <CardHeader title="Communication Centre" />
                  <div className="p-4 space-y-2">
                    {[
                      { name: "Board Chairman", subject: "Q2 Meeting agenda confirmation" },
                      { name: "Finance Director", subject: "H1 financial statements review" },
                      { name: "All Dept Heads", subject: "Strategic goals Q3 alignment" },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-black/5">
                        <div>
                          <div className="text-xs font-medium text-black">{m.name}</div>
                          <div className="text-[10px] text-black/40 truncate max-w-[200px]">{m.subject}</div>
                        </div>
                        <button onClick={() => pushNotification(`Message sent to ${m.name}`, "success")}
                          className="h-7 px-2 rounded-lg bg-black text-white text-[10px] flex items-center gap-1 hover:bg-gray-800">
                          <Send className="h-3 w-3" /> Send
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

          </div>{/* end flex-1 content */}

          {/* Sticky live KPI ticker — right rail */}
          <div className="hidden xl:flex flex-col w-56 flex-shrink-0 sticky top-4 bg-[#0f172a] rounded-2xl overflow-hidden border border-white/8 shadow-xl" style={{ height: "calc(100vh - 200px)" }}>
            <div className="px-3 py-2.5 border-b border-white/10 flex-shrink-0">
              <div className="text-[10px] font-bold text-[#2563eb] uppercase tracking-widest flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] animate-pulse" />
                Live KPIs
              </div>
              <div className="text-[9px] text-white/30 mt-0.5">Hover to pause</div>
            </div>
            <KpiScrollTicker theme="dark" height="100%" speed={0.7} showCategory />
          </div>
        </div>{/* end flex container */}

      </div>
    </AppShell>
  );
}
