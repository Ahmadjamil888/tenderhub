import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line, ScatterChart,
  Scatter, ZAxis, ComposedChart,
} from "recharts";
import { spendTrend, categorySpend, provinceSpend, riskLoanData, hrTurnoverData } from "@/lib/mock-data";
import { TrendingUp, BarChart3, PieChart as PieIcon, Activity, Download, Filter } from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import KpiScrollTicker from "@/components/KpiScrollTicker";
import ZimbabweMapTab from "@/components/ZimbabweMapTab";

const TABS = ["Overview", "Spend Intelligence", "Supplier Analytics", "Risk Analysis", "HR Analytics", "Geography Map"] as const;
type Tab = typeof TABS[number];

const COLORS = ["#3B82F6", "#6366F1", "#EC4899", "#F59E0B", "#10B981", "#06B6D4"];
const BLUE = "#3B82F6";
const GREEN = "#10B981";
const AMBER = "#F59E0B";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [filterOpen, setFilterOpen] = useState(false);

  const handleFilter = () => {
    setFilterOpen(v => !v);
    pushNotification("Analytics filter panel opened — select date range, category or entity to drill down.", "info");
  };

  const handleExport = () => {
    pushNotification("Analytics report exported — check your downloads folder for the PDF/Excel file.", "success");
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Analytics & Intelligence"
        process="Analytics Overview"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Analytics & Business Intelligence"
          description="National procurement analytics — drillable from USD billions down to individual transactions."
          actions={
            <>
              <button onClick={handleFilter} className={`h-9 px-3 rounded-md border text-sm flex items-center gap-1.5 transition-colors ${filterOpen ? "bg-black text-white border-black" : "border-border bg-card hover:bg-secondary"}`}>
                <Filter className="h-4 w-4" /> <span className="hidden sm:inline">Filter</span>
              </button>
              <button onClick={handleExport} className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary transition-colors">
                <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span>
              </button>
            </>
          }
        />

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0 ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content + right KPI ticker rail */}
        <div className="flex gap-4 items-start">
          <div className="flex-1 min-w-0">
            {activeTab === "Overview" && <OverviewTab />}
            {activeTab === "Spend Intelligence" && <SpendTab />}
            {activeTab === "Supplier Analytics" && <SupplierTab />}
            {activeTab === "Risk Analysis" && <RiskTab />}
            {activeTab === "HR Analytics" && <HRTab />}
            {activeTab === "Geography Map" && <ZimbabweMapTab theme="light" />}
          </div>

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
        </div>
      </div>
    </AppShell>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Spend YTD" value="USD 2.84B" delta="+6.2% vs last year" icon={TrendingUp} />
        <KpiCard label="Procurement Savings" value="USD 184M" delta="+11.4%" icon={BarChart3} />
        <KpiCard label="Compliance Score" value="94.2%" delta="+1.8 pts" icon={Activity} />
        <KpiCard label="Supplier Count" value="12,847" delta="+284 new" icon={PieIcon} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Monthly Sales Trend" subtitle="Spend and savings vs prior year" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendTrend}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="spend" stroke={BLUE} strokeWidth={2} dot={false} name="FY2026" />
                <Line type="monotone" dataKey="savings" stroke={GREEN} strokeWidth={2} dot={false} strokeDasharray="4 4" name="FY2025" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Customer Churn Rate" subtitle="Revenue and customer loss trend" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendTrend.map((d, i) => ({ ...d, churn: Math.round(5 + Math.sin(i) * 2 + i * 0.3) }))}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="churn" fill={BLUE} radius={[3, 3, 0, 0]} name="Revenue Lost" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="ARR Trend — All Time" subtitle="Annual recurring revenue growth" />
          <div className="p-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendTrend}>
                <defs>
                  <linearGradient id="arrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BLUE} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="spend" stroke={BLUE} strokeWidth={2} fill="url(#arrGrad)" name="ARR" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="New vs Old Business" subtitle="Business composition" />
          <div className="p-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={["Type A","Type B","Type C","Type D","Type E"].map((n, i) => ({ name: n, new: 200 + i * 50, old: 300 + i * 30 }))} layout="vertical">
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={50} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="new" fill={BLUE} radius={[0, 3, 3, 0]} name="New Business" stackId="a" />
                <Bar dataKey="old" fill={GREEN} radius={[0, 3, 3, 0]} name="Old Business" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SpendTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Spend by Category" subtitle="Year to date distribution" />
          <div className="p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorySpend} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                  {categorySpend.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Province Spend Ranking" subtitle="USD millions, top 10 provinces" />
          <div className="p-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provinceSpend} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="province" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={120} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="spend" fill={BLUE} radius={[0, 4, 4, 0]} name="Spend (USD M)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Spend Trend vs Budget" subtitle="Monthly actual vs budgeted spend" />
        <div className="p-4 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={spendTrend.map((d) => ({ ...d, budget: d.spend * 1.12, actual: d.spend }))}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="actual" fill={BLUE} radius={[3, 3, 0, 0]} name="Actual" />
              <Bar dataKey="budget" fill={GREEN} radius={[3, 3, 0, 0]} name="Budget" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function SupplierTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Suppliers", value: "12,847", delta: "+284 this month" },
          { label: "SME Participation", value: "34.2%", delta: "+2.1 pts" },
          { label: "Avg Performance", value: "4.3/5.0", delta: "+0.2 pts" },
          { label: "Blacklisted", value: "225", delta: "+8 this month", positive: false },
        ].map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} positive={k.positive !== false} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Supplier Performance Distribution" subtitle="All registered vendors" />
          <div className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { range: "1.0–2.0", count: 42 },
                { range: "2.0–3.0", count: 183 },
                { range: "3.0–3.5", count: 680 },
                { range: "3.5–4.0", count: 2840 },
                { range: "4.0–4.5", count: 5210 },
                { range: "4.5–5.0", count: 3892 },
              ]}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill={BLUE} radius={[3, 3, 0, 0]} name="Suppliers" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="SME vs Enterprise Split" subtitle="By contract value" />
          <div className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Enterprise", value: 65 },
                    { name: "SME", value: 23 },
                    { name: "Micro", value: 12 },
                  ]}
                  dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3}
                >
                  {[BLUE, GREEN, AMBER].map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

function RiskTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Risk of Loan Default — Write-off Forecast" subtitle="By loan type, estimated 24-month write-off" />
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground">
                    <tr>
                      <th className="text-left py-1.5">Loan type</th>
                      <th className="text-right py-1.5">Risk %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {riskLoanData.map((r) => (
                      <tr key={r.type}>
                        <td className="py-2 text-foreground">{r.type}</td>
                        <td className="py-2 text-right font-semibold text-primary">{r.risk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskLoanData} layout="vertical">
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="type" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} width={80} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="amount" fill={BLUE} radius={[0, 3, 3, 0]} name="Est. Write-off" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="text-[11px] text-red-600 italic">The estimated write-off amount is the balance of estimated losses due to defaults in the next 24 months.</p>
          </div>
        </Card>

        <Card>
          <CardHeader title="Risk Trend" subtitle="2025/01 – 2025/12" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                risk: i < 2 ? 294 - i * 100 : 111 + Math.sin(i) * 8,
              }))}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BLUE} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="risk" stroke={BLUE} strokeWidth={2} fill="url(#riskGrad)" name="Risk Amount" dot={{ r: 4, fill: BLUE }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Loan Credit Rating Distribution" subtitle="Credit quality breakdown by rating level" />
        <div className="p-4 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Array.from({ length: 20 }, (_, i) => ({
              rating: 479 + i * 18,
              secondary: Math.floor(Math.random() * 8 + 1),
              focus: Math.floor(Math.random() * 5 + 1),
              loss: Math.floor(Math.random() * 3 + 1),
              normal: Math.floor(Math.random() * 6 + 2),
              suspicious: Math.floor(Math.random() * 4),
            }))}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="rating" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="secondary" fill="#fbbf24" stackId="a" name="Secondary" />
              <Bar dataKey="focus" fill={BLUE} stackId="a" name="Focus on" />
              <Bar dataKey="loss" fill="#DC2626" stackId="a" name="Loss" />
              <Bar dataKey="normal" fill={GREEN} stackId="a" name="Normal" />
              <Bar dataKey="suspicious" fill="#a78bfa" stackId="a" name="Suspicious" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function HRTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Hypothesis Testing — Turnover Rate Factors" subtitle="Identifying correlations with staff turnover" />
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Work injuries table */}
          <div>
            <div className="text-xs font-semibold text-foreground mb-2">Work Injuries, Promotion & Turnover</div>
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="text-left py-1">Category</th>
                  <th className="text-right py-1">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr><td className="py-2 text-foreground">Turnover</td><td className="py-2 text-right font-semibold">19</td></tr>
                <tr><td className="py-2 text-foreground">In service</td><td className="py-2 text-right font-semibold">300</td></tr>
                <tr><td className="py-2 text-foreground">Total</td><td className="py-2 text-right font-semibold text-primary">319</td></tr>
              </tbody>
            </table>
          </div>

          {/* Project numbers chart */}
          <div>
            <div className="text-xs font-semibold text-foreground mb-2">Project Numbers vs Turnover</div>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hrTurnoverData.projectNumbers}>
                  <XAxis dataKey="projects" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="turnover" fill={BLUE} radius={[3, 3, 0, 0]} name="Turnover" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Position vs turnover */}
          <div>
            <div className="text-xs font-semibold text-foreground mb-2">Position vs Turnover Rate</div>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hrTurnoverData.positions} layout="vertical">
                  <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="pos" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} width={60} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="rate" fill={AMBER} radius={[0, 3, 3, 0]} name="Rate %" />
                  <Bar dataKey="count" fill={BLUE} radius={[0, 3, 3, 0]} name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Staff Satisfaction vs Turnover" />
          <div className="p-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={Array.from({ length: 20 }, (_, i) => ({
                x: (0.1 + i * 0.045).toFixed(2),
                count: Math.floor(20 * Math.exp(-((i - 8) ** 2) / 15)),
                avg: 4,
              }))}>
                <XAxis dataKey="x" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke={AMBER} fill="#fef3c7" name="Count" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Performance Evaluation vs Turnover" />
          <div className="p-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={Array.from({ length: 20 }, (_, i) => ({
                x: (0.48 + i * 0.026).toFixed(2),
                count: Math.floor(30 * Math.exp(-((i - 12) ** 2) / 10)),
              }))}>
                <XAxis dataKey="x" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke={GREEN} fill="#d1fae5" name="Count" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Monthly Hours vs Turnover" />
          <div className="p-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Array.from({ length: 15 }, (_, i) => ({
                hours: 130 + i * 6,
                count: Math.floor(Math.random() * 25 + 5),
              }))}>
                <XAxis dataKey="hours" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill={BLUE} radius={[3, 3, 0, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
