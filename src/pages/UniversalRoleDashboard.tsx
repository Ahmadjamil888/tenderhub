import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { pushNotification } from "@/lib/local-store";
import { getRoleDashboardConfig } from "@/lib/role-dashboard-data";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import {
  Sparkles, LayoutDashboard, FileText, TrendingUp, MessageSquare,
  Settings, ChevronRight, Activity, CheckCircle2, Clock,
  AlertTriangle, Users, Star, Send, Search, Download,
  BarChart3, Shield, DollarSign, Package, Wallet, BookOpen,
  Plus, Eye, RefreshCcw, Target, Landmark, Building2,
  ClipboardList, ShieldCheck, AlertOctagon, Crown, Globe,
  Newspaper, Bell, Image, Trash2, Wrench, Boxes, Warehouse,
  ScanLine, PackageCheck, Briefcase, PiggyBank, FileSignature,
  Archive, Gavel, Scale, MapPin, Calendar, Award,
  GraduationCap, Leaf, XCircle, ArrowRight, User,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, FileText, TrendingUp, MessageSquare, Settings,
  Activity, CheckCircle2, Clock, AlertTriangle, Users, Star, Send,
  Search, Download, BarChart3, Shield, DollarSign, Package, Wallet,
  BookOpen, Plus, Eye, RefreshCcw, Target, Landmark, Building2,
  ClipboardList, ShieldCheck, AlertOctagon, Crown, Globe, Newspaper,
  Bell, Image, Trash2, Wrench, Boxes, Warehouse, ScanLine, PackageCheck,
  Briefcase, PiggyBank, FileSignature, Archive, Gavel, Scale, MapPin,
  Calendar, Award, GraduationCap, Leaf, XCircle, ArrowRight, User,
  Sparkles, BarChart: BarChart3, ChevronRight,
};

type DashTab = "Overview" | "My Work" | "Reports" | "Communications" | "AI Assistant" | "Settings";
const TABS: DashTab[] = ["Overview", "My Work", "Reports", "Communications", "AI Assistant", "Settings"];

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

function ActivityDot({ type }: { type: string }) {
  const cls = type === "success" ? "bg-[#0F172A]" : type === "error" ? "bg-red-500"
    : type === "warning" ? "bg-[#0F172A]" : "bg-[#0F172A]";
  return <div className={`h-2 w-2 rounded-full flex-shrink-0 mt-1.5 ${cls}`} />;
}

function QuickActionCard({ action, onPress }: { action: { label: string; desc: string; icon: string; route?: string }; onPress: () => void }) {
  const Icon = ICON_MAP[action.icon] ?? Activity;
  return (
    <button onClick={onPress}
      className="flex items-center gap-3 p-3 rounded-xl bg-white border border-black/8 hover:border-black/25 hover:shadow-sm transition-all text-left group w-full">
      <div className="h-9 w-9 rounded-xl bg-gray-100 grid place-items-center flex-shrink-0 group-hover:bg-black/5">
        <Icon className="h-4 w-4 text-black/60" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-black truncate">{action.label}</div>
        <div className="text-[10px] text-black/40 truncate">{action.desc}</div>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-black/20 group-hover:text-black flex-shrink-0" />
    </button>
  );
}

function SubModuleCard({ mod, onPress }: { mod: { label: string; route: string; icon: string; desc: string }; onPress: () => void }) {
  const Icon = ICON_MAP[mod.icon] ?? Activity;
  return (
    <button onClick={onPress}
      className="p-4 rounded-2xl bg-white border border-black/8 hover:border-black/25 hover:shadow-md transition-all text-left group">
      <div className="h-10 w-10 rounded-xl bg-gray-100 grid place-items-center mb-3 group-hover:bg-black/5">
        <Icon className="h-5 w-5 text-black/60" />
      </div>
      <div className="text-sm font-semibold text-black mb-0.5">{mod.label}</div>
      <div className="text-[11px] text-black/40">{mod.desc}</div>
    </button>
  );
}

export default function UniversalRoleDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<DashTab>("Overview");
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const cfg = getRoleDashboardConfig(user?.role ?? "");

  const go = (route?: string) => {
    if (route) navigate(route);
    pushNotification(`Navigating to ${route ?? "dashboard"}`, "info");
  };

  const handleAI = () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setTimeout(() => {
      setAiResponse(
        `[${cfg.aiName}] Analysis complete for: "${aiQuery}"\n\n` +
        `Based on current data from ${cfg.department}:\n` +
        cfg.aiCapabilities.map((c, i) => `${i + 1}. ${c} — operational`).join("\n") +
        `\n\nKey insight: Your ${cfg.kpis[0]?.label} is currently ${cfg.kpis[0]?.value}. ` +
        `Recommendation: Review ${cfg.subModules[0]?.label} for detailed action items.`
      );
      setAiLoading(false);
    }, 1200);
  };

  const colorKpi = (c: string) => c as "blue"|"green"|"amber"|"red"|"violet"|"cyan"|"orange"|"pink";

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Executive Oversight"
        process="Universal Role Dashboard"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">

        {/* Role header banner */}
        <div className="rounded-2xl mb-5 p-5 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${cfg.gradientFrom}, ${cfg.gradientTo})` }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
          <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge tone="default">{cfg.department}</Badge>
                <span className="text-[10px] text-white/50 font-mono uppercase tracking-wider">{user?.entity}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
                {cfg.title}
              </h1>
              <p className="text-sm text-white/70 mt-1">{cfg.subtitle}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => { pushNotification("AI summary requested", "info"); setTab("AI Assistant"); }}
                className="h-9 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur transition-colors">
                <Sparkles className="h-3.5 w-3.5" /> AI Briefing
              </button>
              <button onClick={() => pushNotification("Daily report generated", "success")}
                className="h-9 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur transition-colors">
                <Download className="h-3.5 w-3.5" /> Daily Report
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          {cfg.kpis.map((kpi, i) => (
            <KpiCard key={i} label={kpi.label} value={kpi.value} delta={kpi.delta}
              positive={kpi.positive} color={colorKpi(kpi.color)} />
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-5 border-b border-black/10 overflow-x-auto scrollbar-none">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-2.5 text-xs font-medium border-b-2 -mb-px whitespace-nowrap transition-colors flex-shrink-0
                ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
        {tab === "Overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Chart */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader title={cfg.chartTitle} subtitle={`${cfg.chartLabel1}${cfg.chartLabel2 ? ` vs ${cfg.chartLabel2}` : ""}`} />
                  <div className="p-4 h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {cfg.chartLabel2 ? (
                        <BarChart data={cfg.chartData} margin={{ bottom: 0 }}>
                          <CartesianGrid stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                          <Bar dataKey="value" fill={cfg.accentHex} radius={[3,3,0,0]} name={cfg.chartLabel1} />
                          <Bar dataKey="value2" fill="#e2e8f0" radius={[3,3,0,0]} name={cfg.chartLabel2} />
                        </BarChart>
                      ) : cfg.chartData.length <= 5 ? (
                        <PieChart>
                          <Pie data={cfg.chartData.map(d => ({ name: d.label, value: d.value }))}
                            cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value">
                            {cfg.chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                        </PieChart>
                      ) : (
                        <AreaChart data={cfg.chartData} margin={{ bottom: 0 }}>
                          <defs>
                            <linearGradient id={`grad-${cfg.role}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={cfg.accentHex} stopOpacity={0.2} />
                              <stop offset="95%" stopColor={cfg.accentHex} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                          <Area type="monotone" dataKey="value" stroke={cfg.accentHex}
                            fill={`url(#grad-${cfg.role})`} name={cfg.chartLabel1} strokeWidth={2} />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader title="Recent Activity" subtitle="Latest actions & alerts" />
                <div className="divide-y divide-black/5 max-h-[240px] overflow-y-auto">
                  {cfg.recentActivity.map((a, i) => (
                    <div key={i} className="px-4 py-3 flex items-start gap-2.5">
                      <ActivityDot type={a.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-black leading-relaxed">{a.action}</p>
                        <p className="text-[10px] text-black/35 mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sub-modules grid */}
            <div>
              <h3 className="text-sm font-semibold text-black mb-3">Quick Module Access</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {cfg.subModules.map((mod, i) => (
                  <SubModuleCard key={i} mod={mod} onPress={() => go(mod.route)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MY WORK TAB ──────────────────────────────────────────────────── */}
        {tab === "My Work" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {cfg.quickActions.map((action, i) => (
                <QuickActionCard key={i} action={action} onPress={() => go(action.route)} />
              ))}
            </div>
            <Card>
              <CardHeader title="My Tasks" subtitle="Current workload" />
              <div className="divide-y divide-black/5">
                {[
                  { task: `Complete ${cfg.quickActions[0]?.label ?? "primary task"}`, due: "Today", status: "In Progress" },
                  { task: `Review ${cfg.kpis[0]?.label ?? "KPI"} report`, due: "Tomorrow", status: "Pending" },
                  { task: `Submit ${cfg.chartTitle.split(" ")[0]} update`, due: "This week", status: "Pending" },
                  { task: `Coordinate with ${cfg.department} team`, due: "This week", status: "In Progress" },
                  { task: "Complete CPD training module", due: "End of month", status: "Planned" },
                ].map((t, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-black truncate">{t.task}</p>
                      <p className="text-[10px] text-black/40 mt-0.5">Due: {t.due}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold flex-shrink-0
                      ${t.status === "In Progress" ? "bg-slate-100 text-[#0F172A]"
                        : t.status === "Pending" ? "bg-slate-100 text-[#0F172A]"
                        : "bg-gray-100 text-gray-600"}`}>{t.status}</span>
                    <button onClick={() => pushNotification(`Task updated: ${t.task}`, "success")}
                      className="h-7 px-2.5 rounded-lg bg-black text-white text-[10px] hover:bg-gray-800 flex-shrink-0">Done</button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── REPORTS TAB ──────────────────────────────────────────────────── */}
        {tab === "Reports" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cfg.kpis.slice(0, 4).map((kpi, i) => (
                <KpiCard key={i} label={kpi.label} value={kpi.value} delta={kpi.delta}
                  positive={kpi.positive} color={colorKpi(kpi.color)} />
              ))}
            </div>
            <Card>
              <CardHeader title="My Reports Register" subtitle="All reports with status and age"
                action={
                  <button onClick={() => pushNotification("New report created", "success")}
                    className="h-8 px-3 rounded-xl bg-black text-white text-xs flex items-center gap-1.5 hover:bg-gray-800">
                    <Plus className="h-3.5 w-3.5" /> New Report
                  </button>
                } />
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-black/8">
                    <tr>{["Report Title", "Date", "Status", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-black/40 whitespace-nowrap">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {[
                      { title: `Monthly ${cfg.title} Report — June 2026`, date: "2026-07-01", status: "Draft" },
                      { title: `${cfg.chartTitle} — Q2 2026`, date: "2026-06-30", status: "Submitted" },
                      { title: `${cfg.kpis[0]?.label ?? "KPI"} Analysis Report`, date: "2026-06-15", status: "Approved" },
                      { title: `${cfg.department} Activity Summary`, date: "2026-06-01", status: "Archived" },
                    ].map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50/60">
                        <td className="px-4 py-3 text-xs text-black">{r.title}</td>
                        <td className="px-4 py-3 text-xs text-black/50">{r.date}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold
                            ${r.status === "Approved" ? "bg-slate-100 text-[#0F172A]"
                              : r.status === "Draft" ? "bg-gray-100 text-gray-600"
                              : r.status === "Submitted" ? "bg-slate-100 text-[#0F172A]"
                              : "bg-gray-50 text-gray-400"}`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => pushNotification(`Opened ${r.title}`, "info")}
                              className="h-7 px-2.5 rounded-lg border border-black/10 text-[10px] hover:bg-gray-100">Open</button>
                            <button onClick={() => pushNotification(`Downloaded ${r.title}`, "success")}
                              className="h-7 px-2.5 rounded-lg border border-black/10 text-[10px] hover:bg-gray-100">PDF</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ── COMMUNICATIONS TAB ───────────────────────────────────────────── */}
        {tab === "Communications" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader title="Internal Messages" subtitle="Recent messages"
                action={
                  <button onClick={() => pushNotification("New message composed", "info")}
                    className="h-8 px-3 rounded-xl bg-black text-white text-xs flex items-center gap-1.5 hover:bg-gray-800">
                    <Send className="h-3.5 w-3.5" /> Compose
                  </button>
                } />
              <div className="divide-y divide-black/5">
                {[
                  { from: "CPO — T. Moyo", subject: `Action required: ${cfg.quickActions[0]?.label}`, time: "09:14", unread: true },
                  { from: "Finance — R. Chikwanda", subject: "Q2 budget confirmation needed", time: "08:42", unread: true },
                  { from: "HR Department", subject: "Performance review scheduled", time: "Yesterday", unread: false },
                  { from: "AI System", subject: `Daily ${cfg.title} briefing ready`, time: "06:00", unread: false },
                ].map((m, i) => (
                  <div key={i} className={`px-5 py-3.5 hover:bg-gray-50/60 cursor-pointer ${m.unread ? "" : "opacity-60"}`}
                    onClick={() => pushNotification(`Opened message from ${m.from}`, "info")}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs ${m.unread ? "font-semibold text-black" : "font-medium text-black/70"}`}>{m.from}</span>
                      <span className="text-[10px] text-black/35">{m.time}</span>
                    </div>
                    <p className={`text-xs truncate ${m.unread ? "text-black" : "text-black/50"}`}>{m.subject}</p>
                    {m.unread && <div className="h-1.5 w-1.5 rounded-full bg-black mt-1.5 ml-auto" />}
                  </div>
                ))}
              </div>
            </Card>
            <div className="space-y-4">
              <Card>
                <CardHeader title="Quick Communication" subtitle="Send message or call" />
                <div className="p-4 space-y-3">
                  <input placeholder="To: name@gov.zw" className="w-full h-9 px-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                  <input placeholder="Subject" className="w-full h-9 px-3 rounded-xl border border-black/10 text-sm focus:outline-none" />
                  <textarea rows={4} placeholder="Message…" className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm resize-none focus:outline-none" />
                  <div className="flex gap-2">
                    <button onClick={() => pushNotification("Message sent successfully", "success")}
                      className="flex-1 h-9 rounded-xl bg-black text-white text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-gray-800">
                      <Send className="h-3.5 w-3.5" /> Send
                    </button>
                    <button onClick={() => pushNotification("Voice call initiated", "info")}
                      className="h-9 px-3 rounded-xl border border-black/10 text-xs hover:bg-gray-50">📞 Call</button>
                  </div>
                </div>
              </Card>
              <Card>
                <CardHeader title="Notification Centre" />
                <div className="divide-y divide-black/5">
                  {cfg.recentActivity.slice(0, 3).map((a, i) => (
                    <div key={i} className="px-4 py-3 flex items-start gap-2.5">
                      <ActivityDot type={a.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-black">{a.action}</p>
                        <p className="text-[10px] text-black/35 mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ── AI ASSISTANT TAB ─────────────────────────────────────────────── */}
        {tab === "AI Assistant" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#0F172A] border border-slate-200/60 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-[#0F172A] grid place-items-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-black">{cfg.aiName}</div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#0F172A] animate-pulse" />
                      <span className="text-[10px] text-[#0F172A] font-medium">Active — ready to assist</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input value={aiQuery} onChange={e => setAiQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAI()}
                    placeholder={`Ask ${cfg.aiName} anything about ${cfg.department}…`}
                    className="flex-1 h-10 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
                  <button onClick={handleAI} disabled={aiLoading}
                    className="h-10 px-4 rounded-xl bg-[#0F172A] text-white text-xs font-medium hover:bg-[#0F172A] disabled:opacity-50 flex items-center gap-1.5">
                    {aiLoading ? <RefreshCcw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {aiLoading ? "Thinking…" : "Ask AI"}
                  </button>
                </div>
                {aiResponse && (
                  <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 text-xs text-black/70 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                    {aiResponse}
                  </div>
                )}
              </div>
              <Card>
                <CardHeader title="Suggested Questions" subtitle="Click to ask automatically" />
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    `Summarise today's ${cfg.title} activities`,
                    `What tasks are pending for ${cfg.department}?`,
                    `Generate a performance report for ${cfg.kpis[0]?.label}`,
                    `What are the key risks in ${cfg.department} this week?`,
                    "Which items need urgent attention today?",
                    "Draft a summary email to my supervisor",
                  ].map((q, i) => (
                    <button key={i} onClick={() => { setAiQuery(q); setTimeout(handleAI, 100); }}
                      className="text-left p-3 rounded-xl bg-gray-50 hover:bg-slate-50 border border-black/5 hover:border-slate-200 text-xs text-black/70 transition-colors">
                      💬 {q}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader title="AI Capabilities" subtitle={`${cfg.aiName} can help with:`} />
                <div className="p-4 space-y-2">
                  {cfg.aiCapabilities.map((cap, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => { setAiQuery(cap); handleAI(); }}>
                      <div className="h-4 w-4 rounded-full bg-slate-100 grid place-items-center flex-shrink-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#0F172A] animate-pulse" />
                      </div>
                      <span className="text-xs text-black/70">{cap}</span>
                      <button className="ml-auto text-[10px] bg-slate-100 text-[#0F172A] px-2 py-0.5 rounded-md hover:bg-slate-200">Run</button>
                    </div>
                  ))}
                </div>
              </Card>
              <div className="bg-black rounded-2xl p-4 text-white">
                <div className="text-xs font-semibold mb-2">Automated Daily Report</div>
                <p className="text-[11px] text-white/60 leading-relaxed mb-3">
                  Your daily AI briefing is auto-generated each morning at 06:00 and sent to your supervisor.
                </p>
                <button onClick={() => pushNotification("Daily AI report sent to supervisor", "success")}
                  className="w-full h-8 rounded-xl bg-white text-black text-xs font-medium hover:bg-gray-100 flex items-center justify-center gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Send Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS TAB ─────────────────────────────────────────────────── */}
        {tab === "Settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardHeader title="My Profile" subtitle="Account & role information" />
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-black text-white text-xl font-bold grid place-items-center flex-shrink-0">
                    {user?.avatar ?? "U"}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-black">{user?.name ?? "User"}</div>
                    <div className="text-sm text-black/50">{cfg.title}</div>
                    <div className="text-xs text-black/35">{user?.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Department", cfg.department],
                    ["Entity", user?.entity ?? "Government of Zimbabwe"],
                    ["Role", cfg.title],
                    ["Phone", user?.phone ?? "Not set"],
                  ].map(([label, value]) => (
                    <div key={label} className="p-3 rounded-xl bg-gray-50 border border-black/5">
                      <div className="text-[10px] text-black/40 uppercase tracking-wide mb-0.5">{label}</div>
                      <div className="text-xs font-semibold text-black truncate">{value}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => pushNotification("Profile updated", "success")}
                  className="w-full h-9 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800">
                  Update Profile
                </button>
              </div>
            </Card>
            <Card>
              <CardHeader title="Dashboard Preferences" subtitle="Customise your workspace" />
              <div className="p-5 space-y-3">
                {[
                  { label: "Daily AI Briefing", desc: "Receive automated morning report", enabled: true },
                  { label: "Email Notifications", desc: "Alert emails for critical items", enabled: true },
                  { label: "Mobile Push Alerts", desc: "Real-time mobile notifications", enabled: false },
                  { label: "Weekly Performance Report", desc: "Auto-generated KPI summary", enabled: true },
                  { label: "Supervisor Escalations", desc: "Auto-escalate overdue items", enabled: true },
                ].map((pref, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-black/5">
                    <div>
                      <div className="text-xs font-medium text-black">{pref.label}</div>
                      <div className="text-[10px] text-black/40">{pref.desc}</div>
                    </div>
                    <button onClick={() => pushNotification(`${pref.label} preference toggled`, "info")}
                      className={`h-6 w-11 rounded-full transition-colors ${pref.enabled ? "bg-black" : "bg-gray-200"}`}>
                      <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform mx-0.5 ${pref.enabled ? "translate-x-5" : ""}`} />
                    </button>
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
