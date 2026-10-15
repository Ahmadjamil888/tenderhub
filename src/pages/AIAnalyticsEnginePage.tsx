import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import {
  Sparkles, TrendingUp, TrendingDown, AlertTriangle, Shield, BarChart3,
  DollarSign, Activity, Clock, RefreshCcw, Download, ChevronRight, X, Send,
  Target, Brain,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

const AI_AGENTS = [
  { name: "Procurement Trend Analysis Agent", status: "Active", confidence: 94, actions: 1842, pending: 3, module: "Procurement" },
  { name: "Budget Forecasting Agent", status: "Active", confidence: 96, actions: 621, pending: 1, module: "Finance" },
  { name: "Supplier Performance Prediction Agent", status: "Active", confidence: 91, actions: 984, pending: 5, module: "Suppliers" },
  { name: "Risk Prediction Agent", status: "Active", confidence: 89, actions: 412, pending: 14, module: "Risk" },
  { name: "Fraud Detection Agent", status: "Active", confidence: 97, actions: 2104, pending: 2, module: "Compliance" },
  { name: "Bid Pattern Analysis Agent", status: "Active", confidence: 92, actions: 748, pending: 7, module: "Procurement" },
  { name: "Contract Performance Analysis Agent", status: "Active", confidence: 93, actions: 587, pending: 4, module: "Contracts" },
  { name: "Compliance Monitoring Agent", status: "Active", confidence: 98, actions: 3201, pending: 1, module: "Compliance" },
  { name: "Procurement Recommendations Agent", status: "Active", confidence: 90, actions: 312, pending: 8, module: "Procurement" },
  { name: "Executive Insights Agent", status: "Active", confidence: 95, actions: 154, pending: 0, module: "Executive" },
  { name: "Supplier Verification Agent", status: "Active", confidence: 96, actions: 1284, pending: 4, module: "Suppliers" },
  { name: "Contract Closure AI", status: "Active", confidence: 93, actions: 248, pending: 2, module: "Contracts" },
];

const TREND_DATA = [
  { month: "Jan", tenders: 142, spend: 180, risk: 12, compliance: 91 },
  { month: "Feb", tenders: 168, spend: 210, risk: 10, compliance: 93 },
  { month: "Mar", tenders: 195, spend: 245, risk: 14, compliance: 92 },
  { month: "Apr", tenders: 178, spend: 230, risk: 11, compliance: 94 },
  { month: "May", tenders: 212, spend: 268, risk: 8, compliance: 95 },
  { month: "Jun", tenders: 234, spend: 290, risk: 7, compliance: 94 },
  { month: "Jul", tenders: 248, spend: 305, risk: 9, compliance: 95 },
];

const FRAUD_PATTERNS = [
  { category: "Bid Rotation", detected: 8, mitigated: 7, severity: "Critical" },
  { category: "Ghost Vendors", detected: 4, mitigated: 4, severity: "High" },
  { category: "Price Collusion", detected: 6, mitigated: 5, severity: "High" },
  { category: "Fictitious Invoices", detected: 3, mitigated: 3, severity: "Critical" },
  { category: "Duplicate Payments", detected: 12, mitigated: 12, severity: "Medium" },
  { category: "Spec Manipulation", detected: 2, mitigated: 1, severity: "High" },
];

const BUDGET_FORECAST = [
  { month: "Jul", actual: 305, forecast: 310, upper: 335, lower: 285 },
  { month: "Aug", actual: null, forecast: 320, upper: 350, lower: 290 },
  { month: "Sep", actual: null, forecast: 335, upper: 368, lower: 302 },
  { month: "Oct", actual: null, forecast: 348, upper: 385, lower: 311 },
  { month: "Nov", actual: null, forecast: 362, upper: 402, lower: 322 },
  { month: "Dec", actual: null, forecast: 378, upper: 420, lower: 336 },
];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F97316"];
const MODULE_COLORS: Record<string, string> = {
  Procurement: "bg-slate-100 text-[#0F172A]", Finance: "bg-slate-100 text-[#0F172A]",
  Suppliers: "bg-slate-100 text-[#0F172A]", Risk: "bg-red-100 text-red-700",
  Compliance: "bg-slate-100 text-[#0F172A]", Contracts: "bg-slate-100 text-[#0F172A]",
  Executive: "bg-black text-white",
};

function AIChat() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<{ from: "ai" | "user"; text: string }[]>([
    { from: "ai", text: "I'm the Executive AI Analytics Engine. I can analyse procurement trends, forecast budgets, detect fraud patterns, predict supplier performance, monitor compliance, and generate strategic recommendations. What would you like to explore?" },
  ]);

  const RESPONSES: Record<string, string> = {
    trend: "Procurement trend analysis shows a 14.2% increase in tender activity YTD. Infrastructure dominates at 38% of spend. AI predicts Q3 spend will be USD 320M ±3%, with strong demand in ICT and Health sectors. SME participation is up 2.1% — a positive equity indicator.",
    budget: "Budget forecasting model: Current burn rate projects year-end utilisation at 82% of approved budget (USD 2.32B of USD 2.84B). Q4 acceleration expected due to agricultural procurement. Risk of underspend in Education sector — recommend release of reserved funds by September.",
    fraud: "Fraud detection update: 8 bid rotation patterns detected this quarter, 7 mitigated. Ghost vendor analysis flagged 4 entities — all debarred. Fictitious invoice AI caught USD 840,000 in fraudulent claims. Compliance monitoring detects 98% of anomalies within 24 hours.",
    supplier: "Supplier performance prediction: 3 suppliers in ICT category show declining performance trajectory — recommend early engagement. Highveld Engineering predicted Grade A+ for next evaluation. 2 suppliers at risk of failing minimum threshold — performance improvement plan triggered.",
    risk: "Risk prediction model: Overall procurement risk score: LOW (2.1/5.0). 2 medium risks active — Beitbridge contractor cash flow and ZIMRA system delivery. AI predicts 92% probability of on-time delivery for all other active contracts. No critical risks emerging.",
    compliance: "Compliance monitoring: Overall score 94.2% (+1.8 pts). 3 contracts flagged for late approvals in Education. PPDPA adherence rate: 96.8%. All procurement methods appropriate. No deviations requiring OAG referral. Regulatory compliance fully maintained.",
    default: "Analysing procurement data across all modules. Current system health: EXCELLENT. All AI agents active. Last model update: 2 hours ago. Data sources: IFMIS, ZIMRA, vendor registry, contract management system. 14,284 procurement records analysed. Confidence level: 94.2%.",
  };

  const send = () => {
    if (!msg.trim()) return;
    const user = msg.trim(); setMsg("");
    setChat(c => [...c, { from: "user", text: user }]);
    setTimeout(() => {
      const q = user.toLowerCase();
      const reply = q.includes("trend") ? RESPONSES.trend
        : q.includes("budget") || q.includes("forecast") ? RESPONSES.budget
        : q.includes("fraud") ? RESPONSES.fraud
        : q.includes("supplier") || q.includes("performance") ? RESPONSES.supplier
        : q.includes("risk") ? RESPONSES.risk
        : q.includes("compliance") ? RESPONSES.compliance
        : RESPONSES.default;
      setChat(c => [...c, { from: "ai", text: reply }]);
    }, 600);
  };

  return (
    <Card>
      <CardHeader title="AI Analytics Copilot" subtitle="Ask any procurement intelligence question" />
      <div className="flex flex-col" style={{ height: 320 }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fafafa]">
          {chat.map((m, i) => (
            <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              {m.from === "ai" && (
                <div className="h-6 w-6 rounded-full bg-black grid place-items-center mr-2 flex-shrink-0 mt-0.5">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${m.from === "user" ? "bg-black text-white" : "bg-white border border-black/8 text-black"}`}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-black/8 p-3 flex gap-2">
          <input
            value={msg} onChange={e => setMsg(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            placeholder="Ask about trends, forecasts, risks, fraud, compliance…"
            className="flex-1 h-8 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          <button onClick={send} className="h-8 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1">
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function AIAnalyticsEnginePage() {
  const [tab, setTab] = useState<"Overview" | "Trend Analysis" | "Budget Forecast" | "Fraud Detection" | "AI Agents" | "Recommendations">("Overview");

  const TABS = ["Overview", "Trend Analysis", "Budget Forecast", "Fraud Detection", "AI Agents", "Recommendations"] as const;

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Analytics & Intelligence"
        process="AI Analytics Engine"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="AI Analytics Engine"
          description="Enterprise-grade AI analytics covering procurement trends, budget forecasting, fraud detection, supplier prediction, compliance monitoring, and executive insights."
          actions={
            <>
              <button onClick={() => pushNotification("AI analytics report generated.", "success")} className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary">
                <Download className="h-4 w-4" /> Export Insights
              </button>
              <button onClick={() => pushNotification("AI models refreshed with latest data.", "info")} className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary">
                <RefreshCcw className="h-4 w-4" /> Refresh Models
              </button>
            </>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: "AI Agents Active", value: String(AI_AGENTS.filter(a => a.status === "Active").length), delta: "All systems operational", positive: true },
            { label: "Avg Confidence", value: `${Math.round(AI_AGENTS.reduce((s, a) => s + a.confidence, 0) / AI_AGENTS.length)}%`, delta: "Model accuracy", positive: true },
            { label: "Actions Today", value: AI_AGENTS.reduce((s, a) => s + a.actions, 0).toLocaleString(), delta: "Automated actions", positive: true },
            { label: "Fraud Alerts", value: "23", delta: "Active investigations", positive: false },
            { label: "Risk Score", value: "2.1/5", delta: "LOW risk", positive: true },
            { label: "Compliance", value: "94.2%", delta: "+1.8 pts", positive: true },
          ].map(k => <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} positive={k.positive} />)}
        </div>

        <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIChat />
              <Card>
                <CardHeader title="AI Intelligence Summary" subtitle="Real-time procurement health" />
                <div className="p-4 space-y-3">
                  {[
                    { label: "Procurement Health", value: "EXCELLENT", color: "text-[#0F172A]", detail: "94.2% compliance, all workflows normal" },
                    { label: "Budget Position", value: "ON TRACK", color: "text-[#0F172A]", detail: "67.8% utilised, forecast within budget" },
                    { label: "Supplier Risk", value: "LOW", color: "text-[#0F172A]", detail: "3 suppliers flagged for monitoring" },
                    { label: "Fraud Risk", value: "MANAGED", color: "text-[#0F172A]", detail: "23 active alerts, all being investigated" },
                    { label: "Contract Performance", value: "GOOD", color: "text-[#0F172A]", detail: "87% contracts on track" },
                    { label: "AI Confidence Level", value: "94.2%", color: "text-[#0F172A]", detail: "Models updated 2 hours ago" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-black/5">
                      <div>
                        <div className="text-xs font-semibold text-black">{item.label}</div>
                        <div className="text-[10px] text-black/40">{item.detail}</div>
                      </div>
                      <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader title="Procurement Activity Trend" subtitle="Tender volume and spend — YTD" />
                <div className="p-4 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={TREND_DATA}>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="tenders" stroke="#3B82F6" strokeWidth={2} dot={false} name="Tenders" />
                      <Line type="monotone" dataKey="compliance" stroke="#10B981" strokeWidth={2} dot={false} name="Compliance %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <CardHeader title="Risk Score Trend" subtitle="Lower is better" />
                <div className="p-4 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={TREND_DATA}>
                      <defs>
                        <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="risk" stroke="#EF4444" strokeWidth={2} fill="url(#riskGrad)" name="Risk Score" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "Trend Analysis" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader title="Procurement Spend Trend" subtitle="Monthly YTD with AI forecast" />
                <div className="p-4 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={TREND_DATA}>
                      <defs>
                        <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="spend" stroke="#3B82F6" strokeWidth={2} fill="url(#spendGrad)" name="Spend (USD M)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <CardHeader title="Tender Volume by Month" subtitle="Open tenders count" />
                <div className="p-4 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={TREND_DATA}>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="tenders" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Tenders" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
            <Card>
              <CardHeader title="AI Trend Insights" subtitle="Generated by Procurement Trend Analysis Agent" />
              <div className="p-4 space-y-3">
                {[
                  { insight: "Infrastructure procurement is up 18% YoY, driven by road and water projects. This trend is projected to continue through Q4 2026.", icon: TrendingUp, type: "Trend" },
                  { insight: "SME participation has increased to 34.2%, up from 32.1% last year. AI recommends maintaining set-aside policies to sustain this growth.", icon: Target, type: "Recommendation" },
                  { insight: "Average procurement cycle time reduced to 42 days from 49 days. Primary driver: AI-assisted bid evaluation saving 8-12 days on evaluation phase.", icon: Clock, type: "Efficiency" },
                  { insight: "Health & Pharma procurement showing seasonal pattern — spike in Q1 for annual medicine frameworks. Pre-positioning recommended for 2027.", icon: Brain, type: "Prediction" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[#F8F8F8] rounded-xl">
                    <div className="h-8 w-8 bg-black rounded-full grid place-items-center flex-shrink-0"><item.icon className="h-4 w-4 text-white" /></div>
                    <div>
                      <div className="text-[10px] font-bold text-black/50 uppercase mb-1">{item.type}</div>
                      <div className="text-xs text-black/80 leading-relaxed">{item.insight}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "Budget Forecast" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="Budget Forecast — H2 2026" subtitle="AI predictive model with confidence intervals" />
              <div className="p-4 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={BUDGET_FORECAST}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area type="monotone" dataKey="upper" stroke="transparent" fill="#e5e7eb" fillOpacity={0.5} name="Upper Bound" />
                    <Area type="monotone" dataKey="lower" stroke="transparent" fill="#ffffff" fillOpacity={1} name="Lower Bound" />
                    <Line type="monotone" dataKey="forecast" stroke="#3B82F6" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 4, fill: "#3B82F6" }} name="Forecast" />
                    <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} dot={{ r: 4, fill: "#10B981" }} name="Actual" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Year-End Forecast", value: "USD 2.32B", detail: "82% of approved budget — within target", positive: true },
                { title: "Q3 Forecast", value: "USD 335M", detail: "±5% confidence interval", positive: true },
                { title: "Underspend Risk", value: "Education: 12%", detail: "May require supplementary reallocation", positive: false },
              ].map(item => (
                <Card key={item.title} className={item.positive ? "bg-slate-50" : "bg-slate-50"}>
                  <div className="p-4">
                    <div className="text-xs text-black/50 mb-1">{item.title}</div>
                    <div className="text-xl font-bold text-black">{item.value}</div>
                    <div className="text-xs text-black/60 mt-1">{item.detail}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === "Fraud Detection" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Detections YTD", value: "35", delta: "All fraud types" },
                { label: "Mitigated", value: "32", delta: "91% success rate", positive: true },
                { label: "Under Investigation", value: "3", delta: "Active cases" },
                { label: "Amount Saved", value: "USD 4.2M", delta: "Prevented losses", positive: true },
              ].map(k => <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} positive={k.positive !== false} />)}
            </div>
            <Card>
              <CardHeader title="Fraud Pattern Analysis" subtitle="By category — detected and mitigated" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F8F8F8] border-b border-black/8">
                    <tr>{["Pattern", "Detected", "Mitigated", "Open", "Severity", "AI Confidence"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-black/50">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {FRAUD_PATTERNS.map(p => (
                      <tr key={p.category} className="hover:bg-[#F8F8F8]/60">
                        <td className="px-4 py-3 text-xs font-semibold text-black">{p.category}</td>
                        <td className="px-4 py-3 text-xs text-black">{p.detected}</td>
                        <td className="px-4 py-3 text-xs text-[#0F172A] font-semibold">{p.mitigated}</td>
                        <td className="px-4 py-3 text-xs font-semibold">{p.detected - p.mitigated > 0 ? <span className="text-red-600">{p.detected - p.mitigated}</span> : <span className="text-[#0F172A]">0</span>}</td>
                        <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.severity === "Critical" ? "bg-red-100 text-red-700" : p.severity === "High" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{p.severity}</span></td>
                        <td className="px-4 py-3 text-xs text-black/70">97%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab === "AI Agents" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {AI_AGENTS.map(agent => (
              <Card key={agent.name}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-black rounded-xl grid place-items-center flex-shrink-0"><Sparkles className="h-4 w-4 text-white" /></div>
                      <div>
                        <div className="text-xs font-semibold text-black leading-tight">{agent.name}</div>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${MODULE_COLORS[agent.module]}`}>{agent.module}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-slate-100 text-[#0F172A] px-2 py-0.5 rounded-full flex-shrink-0">{agent.status}</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[10px] text-black/40 mb-1">
                        <span>Confidence</span><span>{agent.confidence}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${agent.confidence}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-black/50">
                      <span>{agent.actions.toLocaleString()} actions</span>
                      {agent.pending > 0 && <span className="text-[#0F172A] font-semibold">{agent.pending} pending</span>}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === "Recommendations" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="AI-Powered Procurement Recommendations" subtitle="Generated by Executive Insights Agent — updated hourly" />
              <div className="p-4 space-y-3">
                {[
                  { priority: "Critical", title: "Implement Pre-Qualification for Large Infrastructure Contracts", body: "Analysis of 18 troubled contracts shows lack of pre-qualification is a primary failure factor. Implementing compulsory pre-qualification for contracts >USD 10M could reduce troubled contracts by 35%.", action: "Issue Policy Circular" },
                  { priority: "High", title: "Accelerate Digital Procurement Adoption in 8 Ministries", body: "8 ministries still processing >40% of low-value procurement manually. Digitisation would save an estimated USD 12M annually through efficiency and reduced error rates.", action: "Deploy Training Programme" },
                  { priority: "High", title: "Establish Framework Agreements for Common Items", body: "Analysis shows 2,841 individual low-value tenders for standard items (stationery, ICT consumables, fuel). Framework agreements would reduce procurement cycle time by 60% for these items.", action: "Draft Framework" },
                  { priority: "Medium", title: "Enhance SME Support Mechanisms", body: "Despite 34.2% SME participation, payment delays to SMEs average 48 days vs 22 days for large suppliers. Expedited payment process for SME contracts recommended.", action: "Update Payment Policy" },
                  { priority: "Medium", title: "Introduce AI Evaluation Scoring for All Technical Evaluations", body: "Pilot in 3 ministries shows AI-assisted evaluation reduces evaluation time by 42% and increases score consistency by 28%. Full deployment recommended.", action: "Scale Deployment" },
                  { priority: "Low", title: "Review Contract Extension Policies", body: "Analysis shows 23% of contracts extended beyond original scope. Stricter extension criteria and re-tendering thresholds would improve market competition.", action: "Policy Review" },
                ].map((rec, i) => (
                  <div key={i} className={`p-4 border rounded-xl ${rec.priority === "Critical" ? "border-red-200 bg-red-50" : rec.priority === "High" ? "border-slate-200 bg-slate-50" : rec.priority === "Medium" ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-slate-50"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rec.priority === "Critical" ? "bg-red-100 text-red-700" : rec.priority === "High" ? "bg-slate-100 text-[#0F172A]" : rec.priority === "Medium" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{rec.priority}</span>
                          <span className="text-xs font-bold text-black">{rec.title}</span>
                        </div>
                        <div className="text-xs text-black/60 leading-relaxed">{rec.body}</div>
                      </div>
                      <button onClick={() => pushNotification(`Action initiated: ${rec.action}`, "success")} className="h-7 px-3 rounded-lg bg-black text-white text-[10px] font-medium hover:bg-gray-800 whitespace-nowrap flex-shrink-0">
                        {rec.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
