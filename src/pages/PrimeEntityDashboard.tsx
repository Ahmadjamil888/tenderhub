import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import { ZW_MINISTRIES } from "@/lib/zw-ministries";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";
import {
  Building2, Users, FileText, DollarSign, Shield, TrendingUp,
  AlertTriangle, BarChart3, Eye, Settings, Globe, ChevronRight,
  Activity, CheckCircle2, Landmark, Star, Zap,
} from "lucide-react";

const C = ["#f97316","#334155","#475569","#334155","#64748B","#DC2626","#06b6d4","#ec4899","#84cc16","#a78bfa"];
const TIP = { contentStyle: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 } };

// Ministry summary data for the prime entity overview
const MINISTRY_SUMMARY = ZW_MINISTRIES.map((m, i) => ({
  id: m.id,
  name: m.name,
  code: m.code,
  minister: m.minister,
  deptCount: m.departments.length,
  entityCount: m.stateEntities.length,
  budget: [280, 820, 180, 95, 420, 340, 125, 78, 210, 95, 65, 45, 120, 55, 38, 85, 45, 30][i] ?? 50,
  spent: [186, 542, 120, 58, 280, 198, 84, 45, 142, 62, 38, 28, 76, 32, 22, 54, 28, 18][i] ?? 30,
  activeTenders: [24, 18, 12, 8, 9, 6, 4, 3, 7, 4, 2, 2, 5, 3, 1, 3, 2, 1][i] ?? 2,
  compliance: [96, 91, 94, 88, 92, 89, 95, 90, 87, 93, 91, 88, 94, 90, 92, 85, 88, 91][i] ?? 90,
  staff: [4820, 2840, 42000, 8200, 1640, 3200, 840, 380, 1200, 420, 160, 95, 580, 240, 110, 320, 180, 85][i] ?? 200,
  status: i < 14 ? "Active" : "Active",
  risk: ["Low","Medium","Low","Low","Medium","High","Low","Low","Low","Low","Low","Medium","Low","Low","Low","Low","Low","Low"][i] ?? "Low",
}));

const nationalKPIs = {
  totalBudget: MINISTRY_SUMMARY.reduce((s, m) => s + m.budget, 0),
  totalSpent:  MINISTRY_SUMMARY.reduce((s, m) => s + m.spent, 0),
  totalTenders: MINISTRY_SUMMARY.reduce((s, m) => s + m.activeTenders, 0),
  totalStaff:  MINISTRY_SUMMARY.reduce((s, m) => s + m.staff, 0),
  totalDepts:  MINISTRY_SUMMARY.reduce((s, m) => s + m.deptCount, 0),
  avgCompliance: Math.round(MINISTRY_SUMMARY.reduce((s, m) => s + m.compliance, 0) / MINISTRY_SUMMARY.length),
};

const spendTrend = [
  { month: "Jan", health: 28, transport: 38, education: 12, finance: 22, energy: 18, other: 24 },
  { month: "Feb", health: 32, transport: 42, education: 14, finance: 24, energy: 20, other: 28 },
  { month: "Mar", health: 36, transport: 46, education: 18, finance: 28, energy: 24, other: 32 },
  { month: "Apr", health: 30, transport: 40, education: 16, finance: 26, energy: 22, other: 29 },
  { month: "May", health: 38, transport: 48, education: 20, finance: 30, energy: 26, other: 34 },
  { month: "Jun", health: 34, transport: 44, education: 18, finance: 27, energy: 23, other: 31 },
];

const tendersByMinistry = MINISTRY_SUMMARY.slice(0, 10).map(m => ({ name: m.code, tenders: m.activeTenders }));
const budgetByMinistry  = MINISTRY_SUMMARY.slice(0, 8).map(m => ({ name: m.code, budget: m.budget, spent: m.spent }));
const complianceByMin   = MINISTRY_SUMMARY.slice(0, 8).map(m => ({ name: m.code, score: m.compliance }));

const fraudAlerts = [
  { id: "FRD-001", ministry: "MOT",  alert: "Irregular bid rotation — 3 firms cycling awards", level: "High",   date: "2026-06-18" },
  { id: "FRD-002", ministry: "MOH",  alert: "Ghost vendor pattern in Pharmacy dept invoices",  level: "High",   date: "2026-06-17" },
  { id: "FRD-003", ministry: "MOAM", alert: "Single-source bypass threshold exceeded by 42%",   level: "Medium", date: "2026-06-16" },
  { id: "FRD-004", ministry: "MOF",  alert: "ZIMRA — unusual split order pattern detected",     level: "Medium", date: "2026-06-15" },
  { id: "FRD-005", ministry: "MODWV",alert: "Contractor advance payment without performance bond",level:"Low",  date: "2026-06-14" },
];

const recentAwards = [
  { tender: "ZW-PRA-2026-00180", title: "Pfumvudza Fertiliser",          vendor: "Mashonaland Agri", value: "USD 31.4M", ministry: "MOAM" },
  { tender: "ZW-PRA-2026-00171", title: "Medical Equipment Supply",      vendor: "MedEquip Africa",  value: "USD 18.2M", ministry: "MOH"  },
  { tender: "ZW-PRA-2026-00158", title: "Lab Reagents Annual Supply",     vendor: "Zim Pharma Hldg", value: "USD 4.8M",  ministry: "MOH"  },
  { tender: "ZW-PRA-2026-00145", title: "ZIMRA IT Infrastructure Phase I",vendor: "Sable ICT",       value: "USD 7.1M",  ministry: "MOF"  },
];

export default function PrimeEntityDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview"|"ministries"|"finance"|"fraud"|"compliance">("overview");
  const [ministrySearch, setMinistrySearch] = useState("");

  const filteredMinistries = MINISTRY_SUMMARY.filter(m =>
    m.name.toLowerCase().includes(ministrySearch.toLowerCase()) ||
    m.code.toLowerCase().includes(ministrySearch.toLowerCase())
  );

  const utilPct = Math.round((nationalKPIs.totalSpent / nationalKPIs.totalBudget) * 100);

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Executive Oversight"
        process="Prime Entity Dashboard"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        {/* Prime Entity Header */}
        <div className="flex items-start gap-4 mb-6 p-5 bg-[#0F172A] rounded-2xl text-white">
          <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">🏛️</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold">Prime Entity — Super Admin</h1>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">PRAZ</span>
            </div>
            <p className="text-sm text-white/70">National Procurement Intelligence — All {MINISTRY_SUMMARY.length} Ministries · Full Visibility</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => navigate("/organisations")} className="h-9 px-3 rounded-lg bg-white/10 text-white text-xs border border-white/20 hover:bg-white/20 flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5" /> Registry
            </button>
            <button onClick={() => navigate("/roles")} className="h-9 px-3 rounded-lg bg-white text-slate-900 text-xs font-semibold flex items-center gap-1.5 hover:bg-white/90">
              <Users className="h-3.5 w-3.5" /> Roles & Users
            </button>
          </div>
        </div>

        {/* National KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <KpiCard label="Total Budget (USD M)"  value={`${nationalKPIs.totalBudget.toLocaleString()}M`} icon={DollarSign}  color="blue"   />
          <KpiCard label="Total Spent (USD M)"   value={`${nationalKPIs.totalSpent.toLocaleString()}M`}  delta={`${utilPct}%`} icon={TrendingUp} color={utilPct >= 85 ? "amber" : "green"} />
          <KpiCard label="Active Tenders"        value={String(nationalKPIs.totalTenders)}               icon={FileText}    color="violet" />
          <KpiCard label="Government Staff"      value={nationalKPIs.totalStaff.toLocaleString()}        icon={Users}       color="cyan"   />
          <KpiCard label="Departments"           value={String(nationalKPIs.totalDepts)}                 icon={Building2}   color="orange" />
          <KpiCard label="Avg Compliance"        value={`${nationalKPIs.avgCompliance}%`}                icon={Shield}      color="green"  />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
          {(["overview","ministries","finance","fraud","compliance"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`h-9 px-4 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader title="National Spend Trend" subtitle="YTD by ministry (USD M)" />
                <div className="p-4 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={spendTrend}>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
                      <Tooltip {...TIP} />
                      {[["health","#475569"],["transport","#334155"],["education","#64748B"],["finance","#334155"],["energy","#f97316"],["other","#94a3b8"]].map(([k,c]) => (
                        <Area key={k} type="monotone" dataKey={k} stroke={c as string} fill={c + "20"} strokeWidth={2} stackId="1" name={k.charAt(0).toUpperCase() + k.slice(1)} />
                      ))}
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <CardHeader title="Active Tenders by Ministry" subtitle="Top 10 ministries" />
                <div className="p-4 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tendersByMinistry} layout="vertical">
                      <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} width={52} />
                      <Tooltip {...TIP} />
                      <Bar dataKey="tenders" fill="#f97316" radius={[0, 3, 3, 0]} name="Tenders"
                        onClick={(d) => navigate(`/ministry/${ZW_MINISTRIES.find(m => m.code === d.name)?.id ?? "mof"}/dashboard`)} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <CardHeader title="Budget vs Spend by Ministry" subtitle="Top 8 ministries (USD M)" />
                <div className="p-4 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetByMinistry}>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
                      <Tooltip {...TIP} formatter={(v: number) => [`USD ${v}M`]} />
                      <Bar dataKey="budget" fill="#e2e8f0" radius={[3,3,0,0]} name="Budget" />
                      <Bar dataKey="spent"  fill="#3B82F6" radius={[3,3,0,0]} name="Spent"
                        onClick={(d) => navigate(`/ministry/${ZW_MINISTRIES.find(m => m.code === d.name)?.id ?? "mof"}/dashboard`)} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <CardHeader title="Recent Awards" subtitle="Latest contract awards" />
                <div className="divide-y divide-border">
                  {recentAwards.map(a => (
                    <div key={a.tender} className="px-4 py-3 hover:bg-secondary/30 cursor-pointer" onClick={() => navigate("/tenders")}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{a.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{a.vendor}</p>
                        </div>
                        <span className="text-[10px] font-bold text-[#0F172A] whitespace-nowrap">{a.value}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-mono">{a.tender.slice(-5)}</span>
                        <span className="text-[9px] bg-slate-50 text-[#0F172A] px-1.5 py-0.5 rounded font-semibold">{a.ministry}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Fraud alerts summary */}
            <Card>
              <CardHeader title="National Fraud Alerts" subtitle="Active alerts requiring attention"
                action={<button onClick={() => setTab("fraud")} className="h-7 px-3 text-xs rounded-lg border border-border hover:bg-secondary">View All</button>} />
              <div className="divide-y divide-border">
                {fraudAlerts.slice(0, 3).map(f => (
                  <div key={f.id} className="flex items-start gap-3 px-5 py-3">
                    <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${f.level === "High" ? "bg-red-500" : f.level === "Medium" ? "bg-[#0F172A]" : "bg-slate-200"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{f.alert}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-mono">{f.ministry}</span>
                        <span className="text-[10px] text-muted-foreground">{f.date}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${f.level === "High" ? "bg-red-100 text-red-700" : f.level === "Medium" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{f.level}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* MINISTRIES TAB */}
        {tab === "ministries" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input className="w-full pl-9 pr-3 h-9 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Search ministries…" value={ministrySearch} onChange={e => setMinistrySearch(e.target.value)} />
              </div>
              <span className="text-xs text-muted-foreground">{filteredMinistries.length} ministries</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMinistries.map((m) => {
                const pct = Math.round((m.spent / m.budget) * 100);
                return (
                  <div key={m.id} className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/ministry/${m.id}/dashboard`)}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold bg-secondary px-2 py-0.5 rounded font-mono">{m.code}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.risk === "High" ? "bg-red-100 text-red-700" : m.risk === "Medium" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{m.risk} Risk</span>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground leading-tight">{m.name}</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{m.minister}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-secondary/40 rounded-lg p-2">
                        <div className="text-sm font-bold text-foreground">{m.activeTenders}</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Tenders</div>
                      </div>
                      <div className="bg-secondary/40 rounded-lg p-2">
                        <div className="text-sm font-bold text-foreground">{m.deptCount}</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Depts</div>
                      </div>
                      <div className="bg-secondary/40 rounded-lg p-2">
                        <div className="text-sm font-bold text-foreground">{m.compliance}%</div>
                        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Comply</div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Budget Utilisation</span><span className="font-semibold">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 85 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FINANCE TAB */}
        {tab === "finance" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Total Approved Budget" value={`USD ${nationalKPIs.totalBudget}M`} icon={DollarSign} color="blue" />
              <KpiCard label="Total Spent YTD"        value={`USD ${nationalKPIs.totalSpent}M`} delta={`${utilPct}%`} icon={TrendingUp} color="green" />
              <KpiCard label="Total Committed"        value="USD 248M" icon={Activity} color="amber" />
              <KpiCard label="Available Balance"      value={`USD ${nationalKPIs.totalBudget - nationalKPIs.totalSpent - 248}M`} icon={DollarSign} color="cyan" />
            </div>
            <Card>
              <CardHeader title="Budget vs Spend — All Ministries" subtitle="Full national fiscal picture" />
              <div className="p-4 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MINISTRY_SUMMARY.slice(0, 12).map(m => ({ name: m.code, budget: m.budget, spent: m.spent, gap: m.budget - m.spent }))}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
                    <Tooltip {...TIP} formatter={(v: number) => [`USD ${v}M`]} />
                    <Bar dataKey="budget" fill="#e2e8f0" radius={[3,3,0,0]} name="Budget" />
                    <Bar dataKey="spent"  fill="#3B82F6" radius={[3,3,0,0]} name="Spent" />
                    <Bar dataKey="gap"    fill="#10b98130" radius={[3,3,0,0]} name="Available" />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* FRAUD TAB */}
        {tab === "fraud" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard label="Total Alerts"  value="23"  icon={AlertTriangle} color="red"   />
              <KpiCard label="High Risk"     value="8"   icon={AlertTriangle} color="red"   />
              <KpiCard label="Under Review"  value="11"  icon={Eye}          color="amber"  />
              <KpiCard label="Resolved"      value="184" icon={CheckCircle2} color="green"  />
            </div>
            <Card>
              <CardHeader title="Active Fraud Alerts — National" subtitle="Real-time anti-corruption monitoring" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-xs text-muted-foreground">
                    <tr>
                      {["ID","Ministry","Alert Description","Level","Date","Action"].map(h =>
                        <th key={h} className="text-left px-5 py-3 font-medium whitespace-nowrap">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {fraudAlerts.map(f => (
                      <tr key={f.id} className="hover:bg-secondary/20">
                        <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">{f.id}</td>
                        <td className="px-5 py-3"><span className="font-bold text-xs bg-secondary px-1.5 py-0.5 rounded">{f.ministry}</span></td>
                        <td className="px-5 py-3 text-foreground/80 max-w-xs truncate">{f.alert}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${f.level === "High" ? "bg-red-100 text-red-700" : f.level === "Medium" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{f.level}</span>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted-foreground">{f.date}</td>
                        <td className="px-5 py-3">
                          <button onClick={() => toast(`Reviewing alert ${f.id}`, "info")} className="h-7 px-2 rounded border border-border text-[11px] hover:bg-secondary">Investigate</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* COMPLIANCE TAB */}
        {tab === "compliance" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="Compliance Scores — All Ministries" subtitle="PPDPA compliance index" />
              <div className="p-4 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complianceByMin}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[70, 100]} tickFormatter={v => `${v}%`} />
                    <Tooltip {...TIP} formatter={(v: number) => [`${v}%`, "Score"]} />
                    <Bar dataKey="score" radius={[3,3,0,0]} name="Compliance"
                      fill="#10B981"
                      onClick={(d) => navigate(`/ministry/${ZW_MINISTRIES.find(m => m.code === d.name)?.id ?? "mof"}/dashboard`)} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title="Ministry Compliance Register" />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-xs text-muted-foreground">
                    <tr>{["Ministry","Code","Score","Risk","Active Tenders","Staff","Departments"].map(h =>
                      <th key={h} className="text-left px-5 py-3 font-medium whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {MINISTRY_SUMMARY.map(m => (
                      <tr key={m.id} className="hover:bg-secondary/20 cursor-pointer" onClick={() => navigate(`/ministry/${m.id}/dashboard`)}>
                        <td className="px-5 py-3 font-medium text-sm max-w-[200px] truncate">{m.name}</td>
                        <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{m.code}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
                              <div className={`h-full rounded-full ${m.compliance >= 90 ? "bg-[#0F172A]" : m.compliance >= 80 ? "bg-[#0F172A]" : "bg-red-500"}`} style={{ width: `${m.compliance}%` }} />
                            </div>
                            <span className="text-xs font-semibold">{m.compliance}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${m.risk === "High" ? "bg-red-100 text-red-700" : m.risk === "Medium" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{m.risk}</span>
                        </td>
                        <td className="px-5 py-3 text-xs">{m.activeTenders}</td>
                        <td className="px-5 py-3 text-xs">{m.staff.toLocaleString()}</td>
                        <td className="px-5 py-3 text-xs">{m.deptCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
