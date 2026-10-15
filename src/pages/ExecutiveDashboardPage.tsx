import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import {
  TrendingUp, TrendingDown, BarChart3, DollarSign, Shield, AlertTriangle,
  CheckCircle2, Clock, Sparkles, Download, Filter, RefreshCcw, Target,
  Users, Building2, FileSignature, Activity, Layers, ChevronRight,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import KpiScrollTicker from "@/components/KpiScrollTicker";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line, ComposedChart,
} from "recharts";

const EXEC_KPIS = [
  { label: "Total Procurement Projects", value: "1,487", delta: "+42 this quarter", icon: Layers, positive: true },
  { label: "Active Contracts", value: "964", delta: "+8 this month", icon: FileSignature, positive: true },
  { label: "Closed Contracts", value: "3,241", delta: "YTD", icon: CheckCircle2, positive: true },
  { label: "Procurement Value", value: "USD 2.84B", delta: "+6.2% vs prior year", icon: DollarSign, positive: true },
  { label: "Budget Utilization", value: "67.8%", delta: "On track", icon: Target, positive: true },
  { label: "Savings Achieved", value: "USD 184M", delta: "+11.4%", icon: TrendingDown, positive: true },
  { label: "Supplier Performance", value: "4.3/5.0", delta: "+0.2 pts", icon: Users, positive: true },
  { label: "Procurement Cycle Time", value: "42 days", delta: "-3 days", icon: Clock, positive: true },
  { label: "Compliance Score", value: "94.2%", delta: "+1.8 pts", icon: Shield, positive: true },
  { label: "Risk Score", value: "Low", delta: "2 medium risks", icon: AlertTriangle, positive: true },
  { label: "AI Alerts", value: "7", delta: "Needs attention", icon: Sparkles, positive: false },
  { label: "Outstanding Actions", value: "23", delta: "Pending", icon: Clock, positive: false },
];

const SPEND_TREND = [
  { month: "Jan", actual: 180, budget: 200, savings: 20 },
  { month: "Feb", actual: 210, budget: 220, savings: 22 },
  { month: "Mar", actual: 245, budget: 255, savings: 28 },
  { month: "Apr", actual: 230, budget: 240, savings: 24 },
  { month: "May", actual: 268, budget: 275, savings: 32 },
  { month: "Jun", actual: 290, budget: 300, savings: 38 },
  { month: "Jul", actual: 305, budget: 310, savings: 35 },
];

const CATEGORY_DIST = [
  { name: "Infrastructure", value: 38 }, { name: "Health & Pharma", value: 22 },
  { name: "ICT & Digital", value: 14 }, { name: "Agriculture", value: 11 },
  { name: "Education", value: 9 }, { name: "Other", value: 6 },
];
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F97316"];

const AI_ALERTS = [
  { id: 1, type: "Risk", msg: "Harare Water Treatment — contractor cash flow stress detected. Escalation recommended.", severity: "High" },
  { id: 2, type: "Fraud", msg: "Bid rotation pattern detected in Transport Ministry tenders. Refer to Anti-Corruption unit.", severity: "Critical" },
  { id: 3, type: "Budget", msg: "ICT procurement budget 88% utilized with 6 months remaining. Review required.", severity: "Medium" },
  { id: 4, type: "Compliance", msg: "3 contracts in Ministry of Education past approval deadline. Immediate action needed.", severity: "High" },
  { id: 5, type: "Warranty", msg: "ZESA Substation warranty expires in 5 days. Renewal or extension required.", severity: "High" },
  { id: 6, type: "Performance", msg: "Bulawayo Civil Works KPI score below 60% for 2nd consecutive period. Default notice due.", severity: "Medium" },
  { id: 7, type: "Supplier", msg: "2 new supplier debarment applications pending CPO review.", severity: "Low" },
];

const PROCUREMENT_STATS = [
  { stage: "Planning", count: 142, pct: 10 },
  { stage: "Tender Prep", count: 203, pct: 14 },
  { stage: "Advertisement", count: 287, pct: 19 },
  { stage: "Bid Evaluation", count: 318, pct: 21 },
  { stage: "Contract Award", count: 89, pct: 6 },
  { stage: "Execution", count: 964, pct: 65 },
  { stage: "Closure", count: 23, pct: 2 },
];

const SEVERITY_COLOR: Record<string, string> = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High: "bg-slate-100 text-[#0F172A] border-slate-200",
  Medium: "bg-slate-100 text-[#0F172A] border-slate-200",
  Low: "bg-slate-100 text-[#0F172A] border-slate-200",
};

export default function ExecutiveDashboardPage() {
  const [tab, setTab] = useState<"Overview" | "Contracts" | "Finance" | "Suppliers" | "AI Insights">("Overview");
  const [alertsDismissed, setAlertsDismissed] = useState<number[]>([]);

  const visibleAlerts = AI_ALERTS.filter(a => !alertsDismissed.includes(a.id));

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Executive Oversight"
        process="Executive Dashboard"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Executive Dashboard"
          description="Real-time national procurement intelligence for executive management. Drill-down from USD billions to individual transactions."
          actions={
            <>
              <button onClick={() => pushNotification("Executive report generated and ready for download.", "success")} className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary">
                <Download className="h-4 w-4" /> Export Report
              </button>
              <button onClick={() => pushNotification("Dashboard refreshed with latest data.", "info")} className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary">
                <RefreshCcw className="h-4 w-4" /> Refresh
              </button>
            </>
          }
        />

        {visibleAlerts.length > 0 && (
          <div className="mb-6 space-y-2">
            <div className="text-xs font-semibold text-black/65 uppercase tracking-wider">AI Alerts — {visibleAlerts.length} requiring attention</div>
            {visibleAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className={`flex items-center gap-3 p-3 border rounded-xl ${SEVERITY_COLOR[alert.severity]}`}>
                <Sparkles className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs font-semibold flex-shrink-0">{alert.type}</span>
                <span className="text-xs flex-1">{alert.msg}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${SEVERITY_COLOR[alert.severity]}`}>{alert.severity}</span>
                <button onClick={() => setAlertsDismissed(p => [...p, alert.id])} className="text-[10px] underline flex-shrink-0">Dismiss</button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {EXEC_KPIS.slice(0, 6).map(k => (
            <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} positive={k.positive} />
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {EXEC_KPIS.slice(6).map(k => (
            <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} positive={k.positive} />
          ))}
        </div>

        <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
          {(["Overview", "Contracts", "Finance", "Suppliers", "AI Insights"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${tab === t ? "border-primary text-primary" : "border-transparent text-foreground/65 hover:text-foreground"}`}>{t}</button>
          ))}
        </div>

        {/* Tab content + right KPI ticker rail */}
        <div className="flex gap-4 items-start">
          <div className="flex-1 min-w-0">

        {tab === "Overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader title="Procurement Spend vs Budget" subtitle="Monthly YTD — USD millions" />
                <div className="p-4 h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={SPEND_TREND}>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="actual" fill="#000" radius={[3, 3, 0, 0]} name="Actual" />
                      <Bar dataKey="budget" fill="#e5e7eb" radius={[3, 3, 0, 0]} name="Budget" />
                      <Line type="monotone" dataKey="savings" stroke="#475569" strokeWidth={2} dot={false} name="Savings" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <CardHeader title="Spend by Category" subtitle="Year to date distribution" />
                <div className="p-4 h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={CATEGORY_DIST} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={2}>
                        {CATEGORY_DIST.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader title="Procurement Pipeline by Stage" subtitle="Current distribution of all procurement activities" />
                <div className="p-4 h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PROCUREMENT_STATS}>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="stage" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="count" fill="#000" radius={[3, 3, 0, 0]} name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <CardHeader title="Outstanding Actions" subtitle="Pending items requiring attention" />
                <div className="p-4 space-y-2">
                  {[
                    { label: "Contract Approvals", count: 8, color: "text-red-600" },
                    { label: "Payment Authorisations", count: 6, color: "text-[#0F172A]" },
                    { label: "Vendor Reviews", count: 4, color: "text-[#0F172A]" },
                    { label: "Audit Responses", count: 3, color: "text-[#0F172A]" },
                    { label: "Warranty Renewals", count: 2, color: "text-[#0F172A]" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-black/5">
                      <span className="text-xs text-black/65">{item.label}</span>
                      <span className={`text-sm font-bold ${item.color}`}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "Finance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Committed", value: "USD 1.94B", delta: "68.3% of budget" },
                { label: "Total Paid YTD", value: "USD 1.12B", delta: "39.4% of budget" },
                { label: "Retained Funds", value: "USD 84.2M", delta: "Under warranty" },
                { label: "Savings YTD", value: "USD 184M", delta: "+11.4% vs target" },
              ].map(k => <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} positive />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader title="Cumulative Spend vs Budget" subtitle="12 months rolling" />
                <div className="p-4 h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={SPEND_TREND}>
                      <defs>
                        <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#000" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#000" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="actual" stroke="#000" strokeWidth={2} fill="url(#spendGrad)" name="Actual Spend" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <CardHeader title="Savings Achievement vs Target" subtitle="Monthly savings vs 8% target" />
                <div className="p-4 h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SPEND_TREND}>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="savings" fill="#475569" radius={[3, 3, 0, 0]} name="Savings (USD M)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "Suppliers" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Registered Suppliers", value: "12,847" },
                { label: "Active Suppliers", value: "8,214" },
                { label: "SME Suppliers", value: "4,392" },
                { label: "Blacklisted", value: "225" },
              ].map(k => <KpiCard key={k.label} label={k.label} value={k.value} delta="" positive />)}
            </div>
            <Card>
              <CardHeader title="Top Performing Suppliers" subtitle="By overall performance score — YTD" />
              <div className="p-4 space-y-3">
                {[
                  { name: "Zimbabwe Pharma Holdings", score: 4.7, contracts: 24, value: "USD 42.5M", grade: "A+" },
                  { name: "Highveld Engineering (Pvt) Ltd", score: 4.5, contracts: 18, value: "USD 71.0M", grade: "A" },
                  { name: "Mashonaland Agri Supplies", score: 4.5, contracts: 16, value: "USD 28.4M", grade: "A" },
                  { name: "Eastern Highlands Logistics", score: 4.1, contracts: 7, value: "USD 8.2M", grade: "B+" },
                  { name: "Sable ICT Solutions", score: 4.0, contracts: 11, value: "USD 7.8M", grade: "B+" },
                ].map((s, i) => (
                  <div key={s.name} className="flex items-center gap-4 p-3 border border-black/8 rounded-xl">
                    <div className="h-8 w-8 rounded-full bg-black text-white text-xs font-bold grid place-items-center flex-shrink-0">#{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-black truncate">{s.name}</div>
                      <div className="text-xs text-black/65">{s.contracts} contracts · {s.value}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-black">{s.score.toFixed(1)}/5.0</div>
                      <div className="text-xs text-black/55">Score</div>
                    </div>
                    <span className="text-sm font-bold bg-slate-100 text-[#0F172A] px-2 py-1 rounded-full">{s.grade}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "AI Insights" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="AI Intelligence Alerts" subtitle="Real-time procurement risk and opportunity signals" />
              <div className="p-4 space-y-3">
                {AI_ALERTS.map(alert => (
                  <div key={alert.id} className={`flex items-start gap-3 p-4 border rounded-xl ${SEVERITY_COLOR[alert.severity]}`}>
                    <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold">{alert.type}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${SEVERITY_COLOR[alert.severity]}`}>{alert.severity}</span>
                      </div>
                      <div className="text-xs leading-relaxed">{alert.msg}</div>
                    </div>
                    <button onClick={() => pushNotification(`Action taken on: ${alert.msg.substring(0, 40)}...`, "info")} className="text-[10px] font-medium underline flex-shrink-0">Take Action</button>
                  </div>
                ))}
              </div>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[
                { title: "Budget Forecast", body: "Based on current spend trajectory, budget utilization will reach 78% by year-end. Recommend reviewing Q3 procurement plan allocation.", icon: BarChart3, color: "bg-slate-50" },
                { title: "Supplier Risk Prediction", body: "AI predicts 3 suppliers in ICT category have elevated default risk based on payment behavior patterns. Proactive engagement recommended.", icon: AlertTriangle, color: "bg-slate-50" },
                { title: "Procurement Efficiency", body: "Cycle time reduced 6.7% this quarter vs prior year. Main driver: AI-assisted bid evaluation reducing evaluation time by 40%.", icon: TrendingUp, color: "bg-slate-50" },
              ].map(insight => (
                <Card key={insight.title} className={insight.color}>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2"><insight.icon className="h-4 w-4 text-black/60" /><span className="text-sm font-semibold text-black">{insight.title}</span></div>
                    <div className="text-xs text-black/70 leading-relaxed">{insight.body}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === "Contracts" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Active Contracts", value: "964", delta: "In execution" },
                { label: "On Track", value: "841", delta: "87.2%" },
                { label: "At Risk", value: "89", delta: "9.2%" },
                { label: "Delayed", value: "34", delta: "3.5%" },
              ].map(k => <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} positive={k.label !== "At Risk" && k.label !== "Delayed"} />)}
            </div>
            <Card>
              <CardHeader title="Contract Health Distribution" subtitle="Current contract portfolio status" />
              <div className="p-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { ministry: "Transport", onTrack: 42, atRisk: 8, delayed: 4 },
                    { ministry: "Health", onTrack: 38, atRisk: 5, delayed: 2 },
                    { ministry: "Education", onTrack: 28, atRisk: 3, delayed: 1 },
                    { ministry: "Energy", onTrack: 22, atRisk: 4, delayed: 2 },
                    { ministry: "Agriculture", onTrack: 35, atRisk: 6, delayed: 3 },
                    { ministry: "Water", onTrack: 18, atRisk: 7, delayed: 4 },
                  ]}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="ministry" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="onTrack" fill="#475569" radius={[3, 3, 0, 0]} name="On Track" stackId="a" />
                    <Bar dataKey="atRisk" fill="#64748B" radius={[0, 0, 0, 0]} name="At Risk" stackId="a" />
                    <Bar dataKey="delayed" fill="#DC2626" radius={[3, 3, 0, 0]} name="Delayed" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
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
              <div className="text-[9px] text-white/55 mt-0.5">Hover to pause</div>
            </div>
            <KpiScrollTicker theme="dark" height="100%" speed={0.7} showCategory />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
