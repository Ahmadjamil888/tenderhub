import { Link, useNavigate } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader, KpiCard, Badge , PageContextBar } from "@/components/AppShell";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar,
} from "recharts";
import {
  kpis, spendTrend, categorySpend, provinceSpend, tenders, aiAgents,
  monthlyTransactions, dailyReport,
} from "@/lib/mock-data";
import KpiScrollTicker from "@/components/KpiScrollTicker";
import {
  Sparkles, ArrowUpRight, AlertTriangle, TrendingUp, DollarSign,
  FileText, Users, Zap, Activity, Shield, Clock,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import { useState } from "react";

const BLUE = "#3B82F6";
const BLUE_SOFT = "#93C5FD";
const GREEN = "#10B981";
const PIE_COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#06B6D4"];

export default function CommandCenter() {
  const navigate = useNavigate();
  const [fyLabel, setFyLabel] = useState("FY 2026");
  const fyOptions = ["FY 2024", "FY 2025", "FY 2026"];

  const handleFYToggle = () => {
    const next = fyOptions[(fyOptions.indexOf(fyLabel) + 1) % fyOptions.length];
    setFyLabel(next);
    pushNotification(`Dashboard filtered to ${next} data.`, "info");
  };

  const handleAskAI = () => {
    navigate("/ai-agents");
    pushNotification("Opening AI Operations Center — AI Advisor ready for your query.", "info");
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Executive Oversight"
        process="Command Centre"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1800px] mx-auto flex gap-4 items-start">
        <div className="flex-1 min-w-0">
        <PageHeader
          title="National Procurement Command Center"
          description="Real-time oversight of all national procurement activity, spend, compliance, and AI agent operations across all Government of Zimbabwe entities."
          actions={
            <>
              <button onClick={handleFYToggle} className="h-9 px-3 rounded-md border border-border bg-card text-sm font-medium hover:bg-secondary transition-colors">{fyLabel}</button>
              <button onClick={handleAskAI} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center gap-1.5 transition-opacity">
                <Sparkles className="h-4 w-4" /> Ask AI Advisor
              </button>
            </>
          }
        />

        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label={kpis.totalSpend.label} value={kpis.totalSpend.value} delta={kpis.totalSpend.delta} icon={DollarSign} />
          <KpiCard label={kpis.activeTenders.label} value={kpis.activeTenders.value} delta={kpis.activeTenders.delta} icon={FileText} />
          <KpiCard label={kpis.openEvaluations.label} value={kpis.openEvaluations.value} delta={kpis.openEvaluations.delta} icon={Activity} />
          <KpiCard label={kpis.contractsInProgress.label} value={kpis.contractsInProgress.value} delta={kpis.contractsInProgress.delta} icon={FileText} />
          <KpiCard label={kpis.procurementSavings.label} value={kpis.procurementSavings.value} delta={kpis.procurementSavings.delta} icon={TrendingUp} />
          <KpiCard label={kpis.complianceScore.label} value={kpis.complianceScore.value} delta={kpis.complianceScore.delta} icon={Shield} />
          <KpiCard label={kpis.fraudAlerts.label} value={kpis.fraudAlerts.value} delta={kpis.fraudAlerts.delta} positive={false} icon={AlertTriangle} />
          <KpiCard label={kpis.budgetUtilization.label} value={kpis.budgetUtilization.value} delta={kpis.budgetUtilization.delta} icon={Zap} />
        </div>

        {/* Daily Report Bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {dailyReport.map((r) => (
            <Card key={r.label} className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-6 w-6 rounded-full flex items-center justify-center" style={{ background: r.color + "20" }}>
                  <r.icon className="h-3.5 w-3.5" style={{ color: r.color }} />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">{r.label}</span>
              </div>
              <div className="text-lg font-bold text-foreground">{r.today}</div>
              <div className="text-[10px] text-muted-foreground">Total: {r.total}</div>
            </Card>
          ))}
        </div>

        {/* Spend trend + category */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader title="National Procurement Spend & Savings" subtitle="Monthly, USD millions" action={<Badge tone="blue">Live</Badge>} />
            <div className="p-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendTrend}>
                  <defs>
                    <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={BLUE} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={GREEN} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="spend" stroke={BLUE} strokeWidth={2} fill="url(#spendGrad)" name="Spend (USD M)" />
                  <Area type="monotone" dataKey="savings" stroke={GREEN} strokeWidth={2} fill="url(#savingsGrad)" name="Savings (USD M)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader title="Spend by Category" subtitle="Year to date" />
            <div className="p-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categorySpend} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {categorySpend.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Real-time Transactions + Province */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader title="Real-time Transactions" subtitle="Trading volume and market share" action={<Badge tone="green">Live</Badge>} />
            <div className="p-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTransactions}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="volume" fill={BLUE} radius={[3, 3, 0, 0]} name="Volume" />
                  <Area yAxisId="right" type="monotone" dataKey="share" stroke="#64748B" strokeWidth={2} fill="transparent" name="Market Share %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader title="Procurement by Province" subtitle="Spend (USD M)" />
            <div className="p-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={provinceSpend.slice(0, 6)} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="province" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={110} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="spend" fill={BLUE} radius={[0, 3, 3, 0]} name="Spend (USD M)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Top 5 tables + AI Agents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader title="New Accounts — TOP 5" subtitle="By province, this period" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-2">Rank</th>
                    <th className="text-left font-medium px-4 py-2">Province</th>
                    <th className="text-right font-medium px-4 py-2">New Accounts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {provinceSpend.slice(0, 5).map((p, i) => (
                    <tr key={p.province} className="hover:bg-secondary/40">
                      <td className="px-4 py-2.5">
                        <span className={`h-5 w-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold text-white ${i === 0 ? "bg-red-500" : i === 1 ? "bg-slate-200" : i === 2 ? "bg-slate-200" : "bg-slate-400"}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-foreground">{p.province}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-primary">{(p.tenders * 6 + 200).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title="Real-time Transactions — TOP 5" subtitle="By trading volume" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-2">Rank</th>
                    <th className="text-left font-medium px-4 py-2">Province</th>
                    <th className="text-right font-medium px-4 py-2">Trading Vol.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {provinceSpend.slice(0, 5).map((p, i) => (
                    <tr key={p.province} className="hover:bg-secondary/40">
                      <td className="px-4 py-2.5">
                        <span className={`h-5 w-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold text-white ${i === 0 ? "bg-red-500" : i === 1 ? "bg-slate-200" : i === 2 ? "bg-slate-200" : "bg-slate-400"}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-foreground">{p.province}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-primary">{(p.spend * 40).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title="AI Agents" subtitle="Live operations" action={<Badge tone="green">11 active</Badge>} />
            <div className="divide-y divide-border max-h-[220px] overflow-y-auto">
              {aiAgents.slice(0, 7).map((a) => (
                <div key={a.name} className="px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-foreground">{a.name}</div>
                    <div className="text-[10px] text-muted-foreground">{a.actions.toLocaleString()} actions · {a.pending} pending</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary">{a.confidence}%</div>
                    <div className="text-[10px] text-muted-foreground">conf.</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent tenders + alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader title="Recent National Tenders" subtitle="Across all government entities" action={<Link to="/tenders" className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">View all <ArrowUpRight className="h-3 w-3" /></Link>} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-xs text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-5 py-2">Reference</th>
                    <th className="text-left font-medium px-5 py-2">Title</th>
                    <th className="text-left font-medium px-5 py-2">Value</th>
                    <th className="text-left font-medium px-5 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tenders.slice(0, 6).map((t) => (
                    <tr key={t.id} className="hover:bg-secondary/40 cursor-pointer">
                      <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{t.id}</td>
                      <td className="px-5 py-3">
                        <div className="text-foreground font-medium truncate max-w-[280px]">{t.title}</div>
                        <div className="text-[11px] text-muted-foreground">{t.entity}</div>
                      </td>
                      <td className="px-5 py-3 text-foreground whitespace-nowrap">{t.value}</td>
                      <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title="Risk & Fraud Alerts" subtitle="Flagged by AI" action={<Badge tone="red">23 open</Badge>} />
            <div className="divide-y divide-border">
              {[
                { sev: "High", title: "Abnormally low bid detected", ctx: "ZW-PRA-2026-00179 · Audit Services", time: "12 min ago" },
                { sev: "High", title: "Repeat winner pattern in Bulawayo", ctx: "VEN-00478 · 4 awards in 30 days", time: "1 h ago" },
                { sev: "Med", title: "Director conflict of interest match", ctx: "ZW-PRA-2026-00181 · Highway Sec. 4", time: "3 h ago" },
                { sev: "Med", title: "Specification mirrors single vendor", ctx: "ZW-PRA-2026-00177 · Hospitals", time: "5 h ago" },
                { sev: "Low", title: "Budget threshold 90% reached", ctx: "Min. Education · FY26 Q3", time: "1 d ago" },
              ].map((a, i) => (
                <div key={i} className="px-5 py-3 flex items-start gap-3">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${a.sev === "High" ? "text-red-500" : a.sev === "Med" ? "text-slate-600" : "text-muted-foreground"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{a.title}</div>
                    <div className="text-[11px] text-muted-foreground">{a.ctx} · {a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        </div>{/* end flex-1 */}

        {/* Sticky live KPI ticker — right rail */}
        <div className="hidden xl:flex flex-col w-56 flex-shrink-0 sticky top-4 bg-[#0f172a] rounded-2xl overflow-hidden border border-white/8 shadow-xl" style={{ height: "calc(100vh - 120px)" }}>
          <div className="px-3 py-2.5 border-b border-white/10 flex-shrink-0">
            <div className="text-[10px] font-bold text-[#2563eb] uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] animate-pulse" />
              Live National KPIs
            </div>
            <div className="text-[9px] text-white/30 mt-0.5">Hover to pause · 50+ indicators</div>
          </div>
          <KpiScrollTicker theme="dark" height="100%" speed={0.7} showCategory />
        </div>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone: Record<string, "blue" | "amber" | "green" | "muted" | "red"> = {
    Draft: "muted", Published: "blue", Bidding: "blue", Evaluation: "amber",
    Awarded: "green", Cancelled: "red",
  };
  return <Badge tone={tone[status] ?? "default"}>{status}</Badge>;
}
