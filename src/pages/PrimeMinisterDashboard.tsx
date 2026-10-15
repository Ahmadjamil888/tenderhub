import { useState } from "react";
import { ModulePage, Card, CardHeader, Badge } from "@/components/ModulePage";
import { useAuth } from "@/lib/auth-context";
import { ZW_MINISTRIES } from "@/lib/zw-ministries";
import {
  Briefcase, Building2, UsersRound, Wallet, FileText, ShieldCheck,
  AlertTriangle, TrendingUp, Sparkles, Star, Globe2, Activity,
  CheckCircle2, Clock, BarChart3, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

const fmt = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`;
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#84CC16"];

/* ── Aggregated data ─────────────────────────────────────────────────────── */
const ministryData = ZW_MINISTRIES.map((m, i) => ({
  code:       m.code,
  name:       m.name.replace("Ministry of ", ""),
  budget:     80 + ((i * 73) % 540),
  spent:      50 + ((i * 47) % 420),
  tenders:    3  + ((i * 11) % 28),
  projects:   2  + ((i * 7)  % 16),
  compliance: 65 + ((i * 13) % 32),
  performance:70 + ((i * 9)  % 28),
}));

const totalBudget    = ministryData.reduce((s, m) => s + m.budget, 0) * 1_000_000;
const totalSpent     = ministryData.reduce((s, m) => s + m.spent, 0) * 1_000_000;
const totalTenders   = ministryData.reduce((s, m) => s + m.tenders, 0);
const totalProjects  = ministryData.reduce((s, m) => s + m.projects, 0);
const avgCompliance  = Math.round(ministryData.reduce((s, m) => s + m.compliance, 0) / ministryData.length);
const avgPerformance = Math.round(ministryData.reduce((s, m) => s + m.performance, 0) / ministryData.length);

const deliveryTrend = [
  { q: "Q1 2025", onTrack: 72, atRisk: 18, delayed: 10, spend: 318 },
  { q: "Q2 2025", onTrack: 68, atRisk: 20, delayed: 12, spend: 384 },
  { q: "Q3 2025", onTrack: 74, atRisk: 16, delayed: 10, spend: 421 },
  { q: "Q4 2025", onTrack: 78, atRisk: 15, delayed: 7,  spend: 467 },
  { q: "Q1 2026", onTrack: 80, atRisk: 13, delayed: 7,  spend: 512 },
  { q: "Q2 2026", onTrack: 76, atRisk: 17, delayed: 7,  spend: 544 },
];

const cabinetProgrammes = [
  { theme: "Infrastructure Development",  on: 21, atRisk: 6, delayed: 3, budget: 284 },
  { theme: "Economic Empowerment",        on: 14, atRisk: 4, delayed: 2, budget: 120 },
  { theme: "Health & Social Welfare",     on: 11, atRisk: 3, delayed: 1, budget: 98  },
  { theme: "Education Modernisation",     on: 16, atRisk: 2, delayed: 0, budget: 74  },
  { theme: "Agricultural Transformation", on: 12, atRisk: 5, delayed: 2, budget: 88  },
  { theme: "Digital Zimbabwe",            on: 18, atRisk: 3, delayed: 1, budget: 52  },
  { theme: "Energy & Climate",            on: 9,  atRisk: 4, delayed: 3, budget: 116 },
  { theme: "Public Service Reform",       on: 13, atRisk: 2, delayed: 1, budget: 38  },
];

const seniorOfficers = [
  { name: "T. Moyo",     role: "Cabinet Secretary",             ministry: "Office of the PM",    performance: 94 },
  { name: "P. Dube",     role: "Secretary to Cabinet",          ministry: "Cabinet Affairs",      performance: 91 },
  { name: "J. Banda",    role: "Principal Director",            ministry: "Finance",              performance: 88 },
  { name: "F. Mutasa",   role: "Director General",              ministry: "Economic Planning",    performance: 86 },
  { name: "R. Chiweshe", role: "Permanent Secretary",           ministry: "Infrastructure",       performance: 84 },
  { name: "S. Ncube",    role: "Chief Government Statistician", ministry: "ZIMSTAT",              performance: 90 },
];

const pmAlerts = [
  { sev: "critical", text: "Energy Ministry: Hwange Unit 7&8 likely 4-month delay — contractor liquidity risk",   ts: "8 min ago"  },
  { sev: "high",     text: "Transport Ministry: Beitbridge Highway cost variance now -12% — VfM review needed",    ts: "35 min ago" },
  { sev: "high",     text: "Health: ARV procurement 14 days behind schedule — stock-out risk in 3 provinces",     ts: "1h ago"     },
  { sev: "medium",   text: "Budget absorption at 68% — 6 ministries at risk of year-end lapse",                   ts: "2h ago"     },
  { sev: "medium",   text: "Parliament session in 9 days — 4 Cabinet papers still require final sign-off",        ts: "3h ago"     },
  { sev: "low",      text: "Compliance training overdue for 42 procurement officers across 5 ministries",         ts: "6h ago"     },
];

const SEV_TONE: Record<string, "red" | "amber" | "blue" | "green"> = {
  critical: "red", high: "red", medium: "amber", low: "blue",
};

const radarData = [
  { metric: "Budget",      score: Math.round((totalSpent / totalBudget) * 100) },
  { metric: "Delivery",    score: 76 },
  { metric: "Compliance",  score: avgCompliance },
  { metric: "Performance", score: avgPerformance },
  { metric: "Procurement", score: 82 },
  { metric: "Governance",  score: 79 },
];

/* ── Sub-components ──────────────────────────────────────────────────────── */
function KPI({ label, value, delta, icon: Icon, positive = true }: {
  label: string; value: string; delta?: string; icon?: React.ElementType; positive?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] text-black/50 uppercase tracking-wider font-medium leading-tight">{label}</div>
        {Icon && <div className="h-8 w-8 rounded-xl grid place-items-center bg-slate-50 text-[#0F172A] flex-shrink-0"><Icon className="h-4 w-4" /></div>}
      </div>
      <div className="text-2xl font-semibold mt-2 text-black">{value}</div>
      {delta && (
        <div className={`text-[11px] mt-1 flex items-center gap-1 ${positive ? "text-[#0F172A]" : "text-red-500"}`}>
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {delta}
        </div>
      )}
    </Card>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function PrimeMinisterDashboard() {
  const { user } = useAuth();
  const [scope, setScope] = useState("all");

  return (
    <ModulePage
      title="Office of the Prime Minister — Cabinet Command Centre"
      description="Whole-of-government delivery oversight: Cabinet programmes, ministry performance, spending, procurement, and strategic priorities."
      phase="Executive"
    >
      {/* Hero ribbon */}
      <Card className="p-5 mb-5 bg-[#0F172A] border-0 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-white/15 grid place-items-center">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm text-white/70">Welcome,</div>
              <div className="text-xl font-semibold">{user?.name ?? "Rt. Hon. Prime Minister"}</div>
              <div className="text-xs text-white/60 mt-0.5">Office of the Prime Minister · Cabinet Affairs</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-lg bg-white/10 text-xs">
              Live · {new Date().toLocaleString("en-GB")}
            </div>
            <select value={scope} onChange={e => setScope(e.target.value)}
              className="bg-white/10 border border-white/20 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none">
              <option value="all" className="text-black">All Ministries (whole-of-government)</option>
              {ZW_MINISTRIES.map(m => <option key={m.id} value={m.id} className="text-black">{m.name}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* National KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-5">
        <KPI label="Ministries"       value={String(ZW_MINISTRIES.length)} icon={Building2}  delta="All active" />
        <KPI label="Total Budget"     value={fmt(totalBudget)}             icon={Wallet}      delta={`${Math.round((totalSpent / totalBudget) * 100)}% absorbed`} />
        <KPI label="Active Projects"  value={String(totalProjects)}        icon={Briefcase}   delta="Govt portfolio" />
        <KPI label="Live Tenders"     value={String(totalTenders)}         icon={FileText}    delta="In market" />
        <KPI label="Avg Compliance"   value={`${avgCompliance}%`}          icon={ShieldCheck} delta="PPDPA score" positive={avgCompliance >= 80} />
        <KPI label="Delivery Rate"    value="76%"                          icon={CheckCircle2} delta="+4pts vs Q1" />
        <KPI label="Civil Servants"   value={ZW_MINISTRIES.reduce((s, m) => s + 120 + m.departments.length * 48, 0).toLocaleString()} icon={UsersRound} delta="Across all ministries" />
        <KPI label="Avg Performance"  value={`${avgPerformance}%`}         icon={TrendingUp}  delta="Ministry avg" positive={avgPerformance >= 75} />
      </div>

      {/* Delivery trend + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <Card className="p-4 col-span-2">
          <CardHeader title="Government Delivery — On Track vs At Risk vs Delayed" subtitle="Programme count per quarter" />
          <div className="h-[260px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={deliveryTrend}>
                <defs>
                  <linearGradient id="gon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.4}/><stop offset="100%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="grisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4}/><stop offset="100%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                <XAxis dataKey="q" fontSize={10}/>
                <YAxis fontSize={11}/>
                <Tooltip/><Legend wrapperStyle={{ fontSize: 11 }}/>
                <Area type="monotone" dataKey="onTrack" name="On Track"  stroke="#10B981" fill="url(#gon)" />
                <Area type="monotone" dataKey="atRisk"  name="At Risk"   stroke="#F59E0B" fill="url(#grisk)" />
                <Area type="monotone" dataKey="delayed" name="Delayed"   stroke="#DC2626" fill="none" strokeDasharray="4 4"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <CardHeader title="Governance Radar" subtitle="6 key dimensions" />
          <div className="h-[260px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={90}>
                <PolarGrid/>
                <PolarAngleAxis dataKey="metric" fontSize={10}/>
                <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={9}/>
                <Radar name="Score" dataKey="score" stroke="#059669" fill="#059669" fillOpacity={0.25}/>
                <Tooltip/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Spend by ministry + Cabinet programme tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <Card className="p-4">
          <CardHeader title="Top 10 Ministries by Budget ($M)" />
          <div className="h-[280px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...ministryData].sort((a,b)=>b.budget-a.budget).slice(0,10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                <XAxis type="number" fontSize={10} tickFormatter={(v:number)=>`${v}M`}/>
                <YAxis dataKey="code" type="category" fontSize={9} width={44}/>
                <Tooltip formatter={(v:number)=>`$${v}M`}/>
                <Bar dataKey="budget" name="Budget" fill="#059669" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden col-span-2">
          <div className="px-4 py-3 border-b border-black/8 flex items-center justify-between">
            <div className="text-sm font-semibold">Cabinet Priority Programmes</div>
            <Badge tone="green">{cabinetProgrammes.length} themes</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#fafafa] text-black/50 uppercase text-[10px]">
                <tr>
                  <th className="text-left px-4 py-2">Programme Theme</th>
                  <th className="text-center px-4 py-2">On Track</th>
                  <th className="text-center px-4 py-2">At Risk</th>
                  <th className="text-center px-4 py-2">Delayed</th>
                  <th className="text-right px-4 py-2">Budget ($M)</th>
                  <th className="text-left px-4 py-2 w-36">Delivery</th>
                </tr>
              </thead>
              <tbody>
                {cabinetProgrammes.map(p => {
                  const total = p.on + p.atRisk + p.delayed;
                  const score = Math.round((p.on / total) * 100);
                  return (
                    <tr key={p.theme} className="border-t border-black/5 hover:bg-[#fafafa]">
                      <td className="px-4 py-2.5 font-medium text-black">{p.theme}</td>
                      <td className="px-4 py-2.5 text-center"><Badge tone="green">{p.on}</Badge></td>
                      <td className="px-4 py-2.5 text-center"><Badge tone="amber">{p.atRisk}</Badge></td>
                      <td className="px-4 py-2.5 text-center"><Badge tone="red">{p.delayed}</Badge></td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium">${p.budget}M</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-black/5 overflow-hidden">
                            <div className="h-full rounded-full transition-all"
                              style={{ width: `${score}%`, background: score >= 80 ? "#475569" : score >= 65 ? "#64748B" : "#DC2626" }}/>
                          </div>
                          <span className="text-[10px] w-7 text-right">{score}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Compliance chart + AI alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
        <Card className="p-4 col-span-2">
          <CardHeader title="Ministry Compliance Score (PPDPA)" subtitle="Current reporting period — higher is better" />
          <div className="h-[260px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...ministryData].map(m=>({name:m.code, score:m.compliance})).sort((a,b)=>b.score-a.score)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                <XAxis dataKey="name" fontSize={9} angle={-30} textAnchor="end" height={50} interval={0}/>
                <YAxis fontSize={11} domain={[0,100]}/>
                <Tooltip/>
                <Bar dataKey="score" name="Compliance %" radius={[4,4,0,0]}>
                  {ministryData.map((m,i) => (
                    <Cell key={i} fill={m.compliance>=85?"#475569":m.compliance>=70?"#334155":m.compliance>=60?"#64748B":"#DC2626"}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/8 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#0F172A]"/>
            <div className="text-sm font-semibold">AI Executive Alerts</div>
          </div>
          <div className="divide-y divide-black/5 max-h-[300px] overflow-y-auto">
            {pmAlerts.map((a, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-2">
                <Badge tone={SEV_TONE[a.sev] ?? "blue"}>{a.sev.toUpperCase()}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-black leading-snug">{a.text}</div>
                  <div className="text-[10px] text-black/40 mt-0.5">{a.ts}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Senior officers + spend vs performance scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-5">
        <Card className="p-4">
          <CardHeader title="Senior Officers Performance" subtitle="Cabinet Secretary & Principal Directors" />
          <div className="mt-3 space-y-2">
            {seniorOfficers.map(o => (
              <div key={o.name} className="flex items-center gap-3 p-2.5 rounded-lg border border-black/5 hover:bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-[#0F172A] flex-shrink-0">
                  {o.name.split(" ").map(n=>n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-black">{o.name}</div>
                  <div className="text-[10px] text-black/45">{o.role} · {o.ministry}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-20 h-1.5 rounded-full bg-black/5 overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width:`${o.performance}%`, background: o.performance>=90?"#475569":o.performance>=80?"#334155":"#64748B" }}/>
                  </div>
                  <span className={`text-xs font-bold w-8 text-right ${o.performance>=90?"text-[#0F172A]":o.performance>=80?"text-[#0F172A]":"text-[#0F172A]"}`}>
                    {o.performance}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <CardHeader title="Budget Spend vs Performance by Ministry" subtitle="Bubble size = tenders" />
          <div className="h-[260px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...ministryData].slice(0,10).map(m=>({ name:m.code, spend:m.spent, perf:m.performance }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                <XAxis dataKey="name" fontSize={9}/>
                <YAxis yAxisId="left" fontSize={10} orientation="left" label={{ value:"$M", position:"insideTop", offset:-5, fontSize:9 }}/>
                <YAxis yAxisId="right" fontSize={10} orientation="right" domain={[0,100]} label={{ value:"%", position:"insideTop", offset:-5, fontSize:9 }}/>
                <Tooltip/>
                <Legend wrapperStyle={{ fontSize:11 }}/>
                <Bar yAxisId="left"  dataKey="spend" name="Spend $M"   fill="#059669" radius={[3,3,0,0]}/>
                <Bar yAxisId="right" dataKey="perf"  name="Performance %" fill="#8B5CF6" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Full ministry leaderboard */}
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-black/8 flex items-center justify-between">
          <div className="text-sm font-semibold">Ministry Leaderboard — All Ministries</div>
          <Badge tone="green">{ZW_MINISTRIES.length} ministries</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#fafafa] text-black/50 uppercase text-[10px]">
              <tr>
                <th className="text-left px-4 py-2">Ministry</th>
                <th className="text-center px-4 py-2">Code</th>
                <th className="text-center px-4 py-2">Depts</th>
                <th className="text-right px-4 py-2">Budget</th>
                <th className="text-right px-4 py-2">Spent</th>
                <th className="text-center px-4 py-2">Tenders</th>
                <th className="text-center px-4 py-2">Projects</th>
                <th className="text-center px-4 py-2">Compliance</th>
                <th className="text-center px-4 py-2">Performance</th>
              </tr>
            </thead>
            <tbody>
              {ZW_MINISTRIES.map((m, i) => {
                const d = ministryData[i];
                return (
                  <tr key={m.id} className="border-t border-black/5 hover:bg-[#fafafa]">
                    <td className="px-4 py-2 font-medium text-black truncate max-w-[260px]">{m.name}</td>
                    <td className="px-4 py-2 text-center font-mono text-black/60">{m.code}</td>
                    <td className="px-4 py-2 text-center">{m.departments.length}</td>
                    <td className="px-4 py-2 text-right tabular-nums">${d.budget}M</td>
                    <td className="px-4 py-2 text-right tabular-nums text-black/60">${d.spent}M</td>
                    <td className="px-4 py-2 text-center">{d.tenders}</td>
                    <td className="px-4 py-2 text-center">{d.projects}</td>
                    <td className="px-4 py-2 text-center">
                      <Badge tone={d.compliance>=85?"green":d.compliance>=70?"blue":d.compliance>=60?"amber":"red"}>
                        {d.compliance}%
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Badge tone={d.performance>=85?"green":d.performance>=75?"blue":d.performance>=65?"amber":"red"}>
                        {d.performance}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </ModulePage>
  );
}
