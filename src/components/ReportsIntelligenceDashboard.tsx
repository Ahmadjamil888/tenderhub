/**
 * ReportsIntelligenceDashboard — Oracle Fusion-style analytics dashboard
 * Per brief section 7: KPI tiles + donut/pie/line/bar/map + ranked table
 * Tenders segmentable into Supplies / Works / Services
 */
import { useState } from "react";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, DollarSign,
  FileText, Users, Building2, BarChart3, MapPin, Download, Filter,
  ArrowUpRight, ArrowDownRight, Search, Bot, Sparkles, Shield,
  Scale, Award, Clock, Gavel,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line,
} from "recharts";

type Category = "All" | "Supplies" | "Works" | "Services";

const CAT_COLORS: Record<string, string> = {
  Supplies: "#3B82F6",
  Works:    "#10B981",
  Services: "#8B5CF6",
};

const DONUT_COLORS  = ["#3B82F6","#10B981","#8B5CF6","#F59E0B","#EF4444","#06B6D4"];
const MINISTRY_COLORS = ["#0f172a","#1e3a5f","#334155","#475569","#64748b"];

const SPEND_TREND = [
  { month:"Jan", supplies:40, works:80,  services:30 },
  { month:"Feb", supplies:55, works:90,  services:35 },
  { month:"Mar", supplies:48, works:105, services:42 },
  { month:"Apr", supplies:62, works:120, services:38 },
  { month:"May", supplies:71, works:140, services:55 },
  { month:"Jun", supplies:85, works:155, services:68 },
];

const CATEGORY_DATA = [
  { name:"Supplies", value:38 },
  { name:"Works",    value:35 },
  { name:"Services", value:27 },
];

const MINISTRY_DATA = [
  { name:"Health",    value:28 },
  { name:"Transport", value:22 },
  { name:"Education", value:18 },
  { name:"Energy",    value:15 },
  { name:"Others",    value:17 },
];

const TOP_SUPPLIERS = [
  { name:"Highveld Engineering",     awards:18, value:"USD 71M",  category:"Works" },
  { name:"Zimbabwe Pharma Holdings", awards:14, value:"USD 42M",  category:"Supplies" },
  { name:"Mashonaland Agri Supplies",awards:11, value:"USD 31M",  category:"Supplies" },
  { name:"Sable ICT Solutions",      awards: 9, value:"USD 14M",  category:"Services" },
  { name:"Eastern Highlands Logistics",awards:7,value:"USD 8M",   category:"Services" },
];

const COMPLIANCE_DATA = [
  { ministry:"Ministry of Health",     onTime:"92%", budget:"88%", compliance:"94%", score:91 },
  { ministry:"Ministry of Transport",  onTime:"89%", budget:"82%", compliance:"90%", score:87 },
  { ministry:"Ministry of Education",  onTime:"85%", budget:"85%", compliance:"88%", score:86 },
  { ministry:"Ministry of Energy",     onTime:"82%", budget:"79%", compliance:"85%", score:82 },
  { ministry:"Ministry of Agriculture",onTime:"78%", budget:"75%", compliance:"80%", score:78 },
];

const TIP = { contentStyle:{ background:"white",border:"1px solid #e2e8f0",borderRadius:8,fontSize:11 } };

const KPIS_ALL = [
  { label:"Total Tenders",     value:"1,287", change:"+12.5%",  trend:"up"  as const, icon:FileText,    color:"bg-[#0f172a]"    },
  { label:"Active Bids",       value:"847",   change:"+8.3%",   trend:"up"  as const, icon:Users,       color:"bg-blue-600"     },
  { label:"Total Value",       value:"USD 2.4B",change:"+15.2%",trend:"up"  as const, icon:DollarSign,  color:"bg-emerald-600"  },
  { label:"Awarded Contracts", value:"342",   change:"+5.7%",   trend:"up"  as const, icon:Award,       color:"bg-violet-600"   },
  { label:"Pending Awards",    value:"89",    change:"-3.2%",   trend:"down"as const, icon:Clock,       color:"bg-amber-600"    },
  { label:"Open Investigations",value:"23",   change:"+2.1%",   trend:"up"  as const, icon:AlertTriangle,color:"bg-red-600"    },
];

const KPIS_SUPPLIES = [
  { label:"Total Supplies",    value:"487",   change:"+9.1%",  trend:"up"  as const, icon:FileText,   color:"bg-blue-600"   },
  { label:"Bids Open",         value:"312",   change:"+6.2%",  trend:"up"  as const, icon:Users,      color:"bg-blue-500"   },
  { label:"Total Value",       value:"USD 890M",change:"+12%", trend:"up"  as const, icon:DollarSign, color:"bg-blue-700"   },
  { label:"Awarded",           value:"128",   change:"+4.5%",  trend:"up"  as const, icon:Award,      color:"bg-blue-800"   },
  { label:"Avg Lead Time",     value:"42 days",change:"-5%",   trend:"up"  as const, icon:Clock,      color:"bg-blue-400"   },
  { label:"Flagged",           value:"7",     change:"+1",     trend:"down"as const, icon:AlertTriangle,color:"bg-red-600"  },
];

const KPIS_WORKS = [
  { label:"Total Works",       value:"452",   change:"+14%",   trend:"up"  as const, icon:FileText,   color:"bg-emerald-700"},
  { label:"Bids Open",         value:"298",   change:"+10%",   trend:"up"  as const, icon:Users,      color:"bg-emerald-600"},
  { label:"Total Value",       value:"USD 1.1B",change:"+18%", trend:"up"  as const, icon:DollarSign, color:"bg-emerald-800"},
  { label:"Awarded",           value:"134",   change:"+7%",    trend:"up"  as const, icon:Award,      color:"bg-emerald-600"},
  { label:"Avg Lead Time",     value:"68 days",change:"-3%",   trend:"up"  as const, icon:Clock,      color:"bg-emerald-500"},
  { label:"Flagged",           value:"11",    change:"+3",     trend:"down"as const, icon:AlertTriangle,color:"bg-red-600"  },
];

const KPIS_SERVICES = [
  { label:"Total Services",    value:"348",   change:"+8%",    trend:"up"  as const, icon:FileText,   color:"bg-violet-700" },
  { label:"Bids Open",         value:"237",   change:"+5%",    trend:"up"  as const, icon:Users,      color:"bg-violet-600" },
  { label:"Total Value",       value:"USD 410M",change:"+11%", trend:"up"  as const, icon:DollarSign, color:"bg-violet-800" },
  { label:"Awarded",           value:"80",    change:"+3%",    trend:"up"  as const, icon:Award,      color:"bg-violet-600" },
  { label:"Avg Lead Time",     value:"55 days",change:"-7%",   trend:"up"  as const, icon:Clock,      color:"bg-violet-500" },
  { label:"Flagged",           value:"5",     change:"-1",     trend:"up"  as const, icon:AlertTriangle,color:"bg-red-600"  },
];

const KPIS_BY_CAT: Record<Category, typeof KPIS_ALL> = {
  All:      KPIS_ALL,
  Supplies: KPIS_SUPPLIES,
  Works:    KPIS_WORKS,
  Services: KPIS_SERVICES,
};

export function ReportsIntelligenceDashboard() {
  const [category, setCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const kpis = KPIS_BY_CAT[category];

  const SPEND_KEYS: Record<Category, string[]> = {
    All:      ["supplies","works","services"],
    Supplies: ["supplies"],
    Works:    ["works"],
    Services: ["services"],
  };
  const spendKeys = SPEND_KEYS[category];

  return (
    <div className="space-y-5">
      {/* ── Page header ── */}
      <div className="bg-[#0f172a] text-white rounded-xl px-5 py-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</div>
          <h2 className="text-base font-black text-white mt-0.5">Reports & Intelligence</h2>
          <div className="text-xs text-slate-400 mt-0.5">Tender analytics · Alerts & flagging · Standard reports · FY2026/27</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search reports…"
              className="h-8 w-44 pl-8 pr-3 text-xs bg-white/10 border border-white/15 text-white placeholder-white/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/20" />
          </div>
          <button className="h-8 px-3 flex items-center gap-1.5 text-xs font-semibold bg-white/10 border border-white/15 text-white rounded-lg hover:bg-white/20">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button className="h-8 px-3 flex items-center gap-1.5 text-xs font-semibold bg-white/10 border border-white/15 text-white rounded-lg hover:bg-white/20">
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
        </div>
      </div>

      {/* ── Category segmented control ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mr-1">Segment:</span>
        {(["All","Supplies","Works","Services"] as Category[]).map(c => (
          <button key={c} onClick={() => setCategory(c)}
            className={`h-8 px-4 rounded-full text-xs font-semibold border transition-all ${
              category === c
                ? c === "Supplies" ? "bg-blue-600 text-white border-blue-600"
                : c === "Works"    ? "bg-emerald-600 text-white border-emerald-600"
                : c === "Services" ? "bg-violet-600 text-white border-violet-600"
                : "bg-[#0f172a] text-white border-[#0f172a]"
                : "border-gray-200 text-gray-600 hover:border-gray-400"
            }`}>
            {c}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 font-mono">Live data · FY2026/27</span>
      </div>

      {/* ── KPI tiles row (Oracle Fusion style) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className={`h-8 w-8 rounded-lg ${k.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className={`text-[10px] font-bold flex items-center gap-0.5 ${k.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                  {k.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {k.change}
                </span>
              </div>
              <div className="text-xl font-black text-gray-900">{k.value}</div>
              <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{k.label}</div>
            </div>
          );
        })}
      </div>

      {/* ── Chart widgets row 1: Donut + Pie + Line trend ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Donut — Tenders by Category */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-sm font-bold text-gray-900 mb-3">Tenders by Category</div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={CATEGORY_DATA} cx={55} cy={55} innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={2}>
                  {CATEGORY_DATA.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 flex-1">
              {CATEGORY_DATA.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: DONUT_COLORS[i] }} />
                  <span className="text-xs text-gray-600 flex-1">{d.name}</span>
                  <span className="text-xs font-bold text-gray-800">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pie — Tenders by Ministry */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-sm font-bold text-gray-900 mb-3">Tenders by Ministry</div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={MINISTRY_DATA} cx={55} cy={55} outerRadius={55} dataKey="value" paddingAngle={1}>
                  {MINISTRY_DATA.map((_, i) => <Cell key={i} fill={MINISTRY_COLORS[i % MINISTRY_COLORS.length]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 flex-1">
              {MINISTRY_DATA.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: MINISTRY_COLORS[i % MINISTRY_COLORS.length] }} />
                  <span className="text-xs text-gray-600 flex-1">{d.name}</span>
                  <span className="text-xs font-bold text-gray-800">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sparkline — AI Insights */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-[#0f172a]" />
            <div className="text-sm font-bold text-gray-900">AI Intelligence Alerts</div>
          </div>
          <div className="space-y-2">
            {[
              { label:"Fraud risk flags",     value:"23", color:"text-red-600",    bg:"bg-red-50 border-red-200"         },
              { label:"Bid collusion signals",value:"7",  color:"text-amber-600",  bg:"bg-amber-50 border-amber-200"     },
              { label:"COI declarations due", value:"14", color:"text-orange-600", bg:"bg-orange-50 border-orange-200"   },
              { label:"Budget overruns",      value:"5",  color:"text-red-700",    bg:"bg-red-50 border-red-200"         },
              { label:"Compliance gap items", value:"31", color:"text-[#0f172a]",  bg:"bg-slate-50 border-slate-200"     },
            ].map(a => (
              <div key={a.label} className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs ${a.bg}`}>
                <span className="text-gray-700">{a.label}</span>
                <span className={`font-black ${a.color}`}>{a.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Chart row 2: Line trend + Bar chart ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Monthly tender value trend */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-sm font-bold text-gray-900 mb-3">Monthly Procurement Spend Trend (USD M)</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SPEND_TREND}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
                <Tooltip {...TIP} formatter={(v: number) => [`USD ${v}M`]} />
                <Legend iconSize={10} wrapperStyle={{ fontSize:11 }} />
                {spendKeys.includes("supplies") && <Line type="monotone" dataKey="supplies" stroke="#3B82F6" strokeWidth={2} dot={false} name="Supplies" />}
                {spendKeys.includes("works")    && <Line type="monotone" dataKey="works"    stroke="#10B981" strokeWidth={2} dot={false} name="Works"    />}
                {spendKeys.includes("services") && <Line type="monotone" dataKey="services" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Services" />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 suppliers bar chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-sm font-bold text-gray-900 mb-3">Top 5 Suppliers by Awards</div>
          <div className="space-y-2.5">
            {TOP_SUPPLIERS.map((s, i) => {
              const max = TOP_SUPPLIERS[0].awards;
              const catColor = s.category === "Supplies" ? "bg-blue-500" : s.category === "Works" ? "bg-emerald-500" : "bg-violet-500";
              return (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 w-3">{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-semibold text-gray-800 truncate max-w-[160px]">{s.name}</span>
                      <span className="text-[10px] text-gray-500 ml-2 shrink-0">{s.value}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${catColor} rounded-full transition-all`} style={{ width: `${(s.awards / max) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-8 text-right">{s.awards}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Geographic distribution placeholder + Ranked table ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Map placeholder */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-[#0f172a]" />
            <div className="text-sm font-bold text-gray-900">Geographic Distribution — Zimbabwe</div>
          </div>
          <div className="relative h-44 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <div className="text-xs text-slate-400">Province-level procurement map</div>
            </div>
            {/* Province dots */}
            {[{x:48,y:30,r:7,l:"Harare"},{x:28,y:55,r:5,l:"Bulawayo"},{x:70,y:35,r:4,l:"Mutare"},{x:42,y:48,r:4,l:"Gweru"},{x:58,y:55,r:3,l:"Masvingo"},{x:22,y:35,r:3,l:"Hwange"}].map(p => (
              <div key={p.l} className="absolute flex flex-col items-center" style={{ left:`${p.x}%`, top:`${p.y}%` }}>
                <div className="rounded-full bg-[#0f172a] animate-pulse" style={{ width:`${p.r*4}px`, height:`${p.r*4}px`, opacity:0.7 }} />
                <span className="text-[8px] text-gray-500 mt-0.5">{p.l}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[{r:"Harare",v:"USD 720M",c:312},{r:"Bulawayo",v:"USD 410M",c:188},{r:"Manicaland",v:"USD 280M",c:124}].map(p => (
              <div key={p.r} className="text-center">
                <div className="text-xs font-bold text-gray-800">{p.r}</div>
                <div className="text-[10px] text-gray-500">{p.v} · {p.c} tenders</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranked performance table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-[#1a6b3a] px-4 py-2.5">
            <span className="text-white text-xs font-black uppercase tracking-widest">Ministry Performance Ranking</span>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Rank","Ministry","On-time","Budget","Compliance","Score"].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {COMPLIANCE_DATA.map((r, i) => (
                <tr key={r.ministry} className={`hover:bg-slate-50/40 ${i === 0 ? "bg-emerald-50/40" : ""}`}>
                  <td className="px-3 py-2.5">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black text-white ${i===0?"bg-emerald-600":i===1?"bg-blue-600":"bg-gray-400"}`}>{i+1}</div>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-gray-900 max-w-[140px] truncate">{r.ministry.replace("Ministry of ","Min. of ")}</td>
                  <td className="px-3 py-2.5 text-emerald-700 font-semibold">{r.onTime}</td>
                  <td className="px-3 py-2.5 text-blue-700 font-semibold">{r.budget}</td>
                  <td className="px-3 py-2.5 text-violet-700 font-semibold">{r.compliance}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0f172a] rounded-full" style={{ width:`${r.score}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-700 w-6 text-right">{r.score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Bar chart — spend by category ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="text-sm font-bold text-gray-900 mb-3">H1 2026 Spend by Category (USD M) — Monthly Breakdown</div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SPEND_TREND} barSize={18}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
              <Tooltip {...TIP} formatter={(v: number) => [`USD ${v}M`]} />
              <Legend iconSize={10} wrapperStyle={{ fontSize:11 }} />
              {spendKeys.includes("supplies") && <Bar dataKey="supplies" fill="#3B82F6" radius={[3,3,0,0]} name="Supplies" />}
              {spendKeys.includes("works")    && <Bar dataKey="works"    fill="#10B981" radius={[3,3,0,0]} name="Works"    />}
              {spendKeys.includes("services") && <Bar dataKey="services" fill="#8B5CF6" radius={[3,3,0,0]} name="Services" />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
