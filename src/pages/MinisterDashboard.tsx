import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import TodayActivity from "@/components/TodayActivity";
import { DollarSign, TrendingUp, Shield, AlertTriangle, BarChart3, Zap, Download } from "lucide-react";
import { generateDailyReportPDF } from "@/lib/pdf-report";
import { toast } from "@/lib/toast";
import NewFeaturesBanner from "@/components/NewFeaturesBanner";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { spendTrend, categorySpend, provinceSpend } from "@/lib/mock-data";

const TABS = ["Executive Overview", "Spend Analysis", "Risk & Alerts", "Today's Report"] as const;
type Tab = typeof TABS[number];

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F97316"];

export default function MinisterDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("Executive Overview");

  const handleBriefing = () => {
    if (!user) return;
    generateDailyReportPDF(user);
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Executive Oversight"
        process="Minister Dashboard"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <NewFeaturesBanner />
        <PageHeader
          title={`Executive Briefing — ${user?.name}`}
          description="Strategic procurement intelligence · Cabinet Level · FY2026 Year-to-Date"
          actions={
            <div className="flex gap-2">
              <button onClick={handleBriefing}
                className="h-9 px-4 rounded-xl border border-black/10 bg-white text-sm font-medium hover:bg-[#EAF1F8] flex items-center gap-1.5 transition-colors">
                <Download className="h-4 w-4" /> Briefing Pack PDF
              </button>
              <button onClick={handleBriefing}
                className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 flex items-center gap-1.5 transition-colors">
                <Zap className="h-4 w-4" /> AI Briefing
              </button>
            </div>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <KpiCard label="Total Spend YTD" value="USD 2.84B" delta="+6.2%" icon={DollarSign} />
          <KpiCard label="Savings Achieved" value="USD 184M" delta="+11.4%" icon={TrendingUp} />
          <KpiCard label="Compliance Score" value="94.2%" delta="+1.8 pts" icon={Shield} />
          <KpiCard label="Active Tenders" value="1,287" delta="+42" icon={BarChart3} />
          <KpiCard label="Open Fraud Alerts" value="23" delta="+3 new" positive={false} icon={AlertTriangle} />
          <KpiCard label="Budget Utilization" value="67.8%" delta="On track" icon={Zap} />
        </div>

        <div className="flex gap-1 mb-6 border-b border-black/10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}</button>
          ))}
        </div>

        {tab === "Executive Overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader title="National Procurement Spend vs Savings" subtitle="Monthly, USD millions — FY2026" action={<Badge tone="blue">Live</Badge>} />
                <div className="p-4 h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendTrend}>
                      <defs>
                        <linearGradient id="mig1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="mig2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="month" stroke="#aaa" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#aaa" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #eee", borderRadius: 10, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="spend" stroke="#3B82F6" strokeWidth={2.5} fill="url(#mig1)" name="Spend (USD M)" />
                      <Area type="monotone" dataKey="savings" stroke="#10B981" strokeWidth={2} fill="url(#mig2)" strokeDasharray="4 2" name="Savings (USD M)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <CardHeader title="Spend by Sector" subtitle="YTD portfolio" />
                <div className="p-4 h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categorySpend} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                        {categorySpend.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #eee", borderRadius: 10, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <Card>
              <CardHeader title="AI Strategic Alerts" subtitle="Requiring ministerial attention" action={<Badge tone="red">7 critical</Badge>} />
              <div className="divide-y divide-black/5">
                {[
                  { sev: "Critical", msg: "Infrastructure budget 94% utilized — 3 months remaining", action: "Request supplementary budget" },
                  { sev: "High",     msg: "Bid rigging pattern detected — Harare road contracts", action: "Refer to ZACC" },
                  { sev: "High",     msg: "Health sector: 3 contracts at risk of delay — medicines", action: "Emergency procurement" },
                  { sev: "Med",      msg: "15 contracts expiring in Q3 — renewal required", action: "Review contracts" },
                  { sev: "Med",      msg: "USD 48M in invoices overdue > 60 days", action: "Finance directive" },
                ].map((a, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${a.sev === "Critical" ? "bg-red-600" : a.sev === "High" ? "bg-red-400" : "bg-slate-400"}`} />
                      <span className="text-sm text-black">{a.msg}</span>
                    </div>
                    <button onClick={() => toast(`Action initiated: ${a.action}`, "info")}
                      className="h-7 px-3 rounded-lg bg-black text-white text-xs font-medium whitespace-nowrap hover:bg-gray-800 transition-colors flex-shrink-0">{a.action}</button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "Spend Analysis" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader title="Spend by Province" subtitle="Top 8 — USD M" />
              <div className="p-4 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={provinceSpend.slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" stroke="#aaa" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="province" stroke="#aaa" fontSize={10} tickLine={false} axisLine={false} width={120} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #eee", borderRadius: 10, fontSize: 12 }} />
                    <Bar dataKey="spend" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Spend (USD M)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title="Budget Utilization by Sector" />
              <div className="p-5 space-y-3">
                {[
                  { cat: "Infrastructure",  pct: 73 }, { cat: "Health & Pharma", pct: 76 },
                  { cat: "ICT & Digital",   pct: 70 }, { cat: "Agriculture",     pct: 72 },
                  { cat: "Education",       pct: 69 },
                ].map(b => (
                  <div key={b.cat}>
                    <div className="flex justify-between text-xs mb-1"><span className="font-medium text-black">{b.cat}</span><span className="text-black/40">{b.pct}%</span></div>
                    <div className="h-2 rounded-full bg-[#EAF1F8] overflow-hidden"><div className="h-full rounded-full bg-black" style={{ width: `${b.pct}%` }} /></div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "Risk & Alerts" && (
          <div className="space-y-3">
            {[
              { id: "FRD-2026-089", type: "Bid Rotation",        sev: "Critical", entity: "Harare Road Contracts", status: "ZACC Referred" },
              { id: "FRD-2026-088", type: "Budget Overrun Risk", sev: "High",     entity: "Infrastructure Portfolio", status: "Monitoring" },
              { id: "FRD-2026-087", type: "Contract Delay Risk", sev: "High",     entity: "Health Sector — 3 Contracts", status: "Escalated" },
              { id: "ALD-2026-042", type: "Compliance Gap",      sev: "Med",      entity: "15 Expiring Contracts", status: "Action Required" },
              { id: "ALD-2026-041", type: "Payment Delay",       sev: "Med",      entity: "Finance — USD 48M Overdue", status: "Directive Issued" },
            ].map(a => (
              <div key={a.id} className="bg-white border border-black/10 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${a.sev === "Critical" || a.sev === "High" ? "text-red-500" : "text-slate-600"}`} />
                  <div>
                    <div className="text-sm font-semibold text-black">{a.type}</div>
                    <div className="text-xs text-black/40">{a.id} · {a.entity}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={a.sev === "Critical" || a.sev === "High" ? "red" : "amber"}>{a.sev}</Badge>
                  <Badge tone={a.status.includes("ZACC") ? "red" : a.status === "Escalated" ? "amber" : "muted"}>{a.status}</Badge>
                  <button onClick={() => toast(`Ministerial directive issued for: ${a.type}`, "warning")}
                    className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 transition-colors">Act</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Today's Report" && <TodayActivity />}
      </div>

      <AIAssistantPanel agentName="Executive AI Advisor" agentRole="Strategic procurement intelligence" context="executive dashboard" color="blue"
        suggestedPrompts={["Which tenders are overdue?","Which contracts are high risk?","How much savings this quarter?","Show infrastructure spend","Which suppliers have poor performance?"]} />
    </AppShell>
  );
}
