/**
 * SpendIntelligencePage — Real-time Spend Intelligence
 * Better than Coupa community-driven benchmarking.
 * Shows: market pricing vs gov prices, spend by supplier/category,
 * savings opportunities, anomaly detection, community benchmarks.
 * Route: /spend-intelligence
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader, KpiCard, Badge , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import { pushNotification } from "@/lib/local-store";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, DollarSign,
  BarChart3, Sparkles, Download, RefreshCw, Eye, Target, Zap,
  ArrowUp, ArrowDown, Minus, Package, Building2, Globe2, Filter,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
  ComposedChart, ReferenceLine, ScatterChart, Scatter, ZAxis,
} from "recharts";

const C = ["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#EC4899"];
const TIP = { contentStyle:{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:8, fontSize:12 }};

// ─── Spend trend ──────────────────────────────────────────────────────────────
const SPEND_TREND = [
  { month:"Jan", actual:180, market:185, savings:20, forecast:0  },
  { month:"Feb", actual:210, market:218, savings:22, forecast:0  },
  { month:"Mar", actual:245, market:260, savings:28, forecast:0  },
  { month:"Apr", actual:230, market:238, savings:24, forecast:0  },
  { month:"May", actual:268, market:272, savings:32, forecast:0  },
  { month:"Jun", actual:290, market:308, savings:38, forecast:0  },
  { month:"Jul", actual:305, market:320, savings:35, forecast:310 },
  { month:"Aug", actual:0,   market:0,   savings:0,  forecast:328 },
  { month:"Sep", actual:0,   market:0,   savings:0,  forecast:342 },
  { month:"Oct", actual:0,   market:0,   savings:0,  forecast:360 },
];

// ─── Category benchmarks ──────────────────────────────────────────────────────
const CATEGORY_BENCH = [
  { cat:"Infrastructure",  govSpend:840, marketAvg:880, variance:-4.5, items:142, saving:true  },
  { cat:"Health & Pharma", govSpend:420, marketAvg:390, variance:+7.7, items:287, saving:false },
  { cat:"ICT & Digital",   govSpend:280, marketAvg:244, variance:+14.8,items:56,  saving:false },
  { cat:"Agriculture",     govSpend:210, marketAvg:218, variance:-3.7, items:119, saving:true  },
  { cat:"Education",       govSpend:175, marketAvg:181, variance:-3.3, items:204, saving:true  },
  { cat:"General Supplies",govSpend:140, marketAvg:128, variance:+9.4, items:892, saving:false },
  { cat:"Logistics",       govSpend:95,  marketAvg:98,  variance:-3.1, items:33,  saving:true  },
];

// ─── Savings opportunities ────────────────────────────────────────────────────
const SAVINGS_OPP = [
  { id:"SO-001", title:"Consolidate Stationery Procurement",     saving:"USD 340K/yr", effort:"Low",    priority:"High",   category:"Stationery",  status:"Actionable" },
  { id:"SO-002", title:"Joint Fuel Procurement — 3 Ministries",  saving:"USD 180K/yr", effort:"Medium", priority:"High",   category:"Energy",       status:"Actionable" },
  { id:"SO-003", title:"Renegotiate IT Hardware Contracts",       saving:"USD 420K/yr", effort:"Medium", priority:"High",   category:"ICT",          status:"In Progress" },
  { id:"SO-004", title:"Framework Agreement — Medical Supplies",  saving:"USD 620K/yr", effort:"High",   priority:"High",   category:"Health",       status:"Planned" },
  { id:"SO-005", title:"Bulk Purchase — Construction Materials",  saving:"USD 210K/yr", effort:"Low",    priority:"Medium", category:"Construction", status:"Actionable" },
  { id:"SO-006", title:"Replace Office Chair Supplier Contract",  saving:"USD 84K/yr",  effort:"Low",    priority:"Medium", category:"Furniture",    status:"Actionable" },
];

// ─── Anomalies ────────────────────────────────────────────────────────────────
const ANOMALIES = [
  { ref:"RFQ-2026-00091", item:"Toner Cartridges (HP 85A)",      govPrice:"USD 84.00",  market:"USD 48.00",  overpay:75,  supplier:"Office Supplies Co.",     action:"Renegotiate" },
  { ref:"TND-2026-00184", item:"Office Chairs (Ergonomic)",      govPrice:"USD 310.00", market:"USD 180.00", overpay:72,  supplier:"Harare Office Furniture",  action:"Competitive tender" },
  { ref:"RFQ-2026-00090", item:"A4 Paper (Ream 500)",           govPrice:"USD 5.80",   market:"USD 4.20",   overpay:38,  supplier:"ZIMTRADE Office Supplies",  action:"Renegotiate" },
  { ref:"TND-2026-00183", item:"Laptop HP i7 16GB",             govPrice:"USD 1,240",  market:"USD 920",    overpay:35,  supplier:"TechHub Zimbabwe",         action:"Open tender" },
];

// ─── Scatter data for spend vs market ────────────────────────────────────────
const SCATTER = CATEGORY_BENCH.map(c => ({
  x: c.marketAvg, y: c.govSpend, z: c.items, name: c.cat,
  fill: c.variance > 0 ? "#DC2626" : "#475569",
}));

function varBadge(v: number) {
  if (v > 5)  return <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1"><ArrowUp className="h-3 w-3"/>{Math.abs(v).toFixed(1)}% over market</span>;
  if (v < -2) return <span className="text-[10px] font-bold text-[#0F172A] bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1"><ArrowDown className="h-3 w-3"/>{Math.abs(v).toFixed(1)}% below market</span>;
  return <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1"><Minus className="h-3 w-3"/>At market</span>;
}

function effortColor(e: string) {
  return e === "Low" ? "text-[#0F172A] bg-slate-100" : e === "Medium" ? "text-[#0F172A] bg-slate-100" : "text-red-700 bg-red-100";
}
function statusColor(s: string) {
  return s === "Actionable" ? "text-[#0F172A] bg-slate-100" : s === "In Progress" ? "text-[#0F172A] bg-slate-100" : "text-[#0F172A] bg-slate-100";
}

export default function SpendIntelligencePage() {
  const [activeTab, setActiveTab] = useState<"overview"|"benchmarks"|"anomalies"|"savings">("overview");
  const [filterCat, setFilterCat] = useState("All");

  const totalSavings = SAVINGS_OPP.reduce((s, o) => {
    const n = parseFloat(o.saving.replace(/[^0-9.]/g,""));
    return s + n;
  }, 0);

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Analytics & Intelligence"
        process="Spend Intelligence"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Spend Intelligence"
          description="Real-time procurement spend benchmarked against market prices. AI identifies savings opportunities, pricing anomalies, and community benchmarks across all 12,847 suppliers."
          actions={
            <div className="flex items-center gap-2">
              <button onClick={() => toast("Market data refreshed from 6 live sources", "info")}
                className="h-9 px-4 rounded-xl border border-black/10 text-sm hover:bg-gray-50 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              <button onClick={() => { pushNotification("Spend Intelligence report exported", "success"); toast("Report downloaded","success"); }}
                className="h-9 px-4 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 flex items-center gap-2">
                <Download className="h-4 w-4" /> Export Report
              </button>
            </div>
          }
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Gov Spend YTD"    value="USD 2.84B" delta="+6.2% vs prior year"         icon={DollarSign}    color="blue"   />
          <KpiCard label="Savings vs Market"      value="USD 184M"  delta="6.5% below market avg"        icon={TrendingDown}  color="green"  />
          <KpiCard label="Price Anomalies"        value="4"         delta="Items 30%+ above market"       icon={AlertTriangle} color="red"    positive={false} />
          <KpiCard label="Savings Opportunities"  value={`USD ${(totalSavings/1000).toFixed(1)}M/yr`} delta={`${SAVINGS_OPP.length} identified`} icon={Target} color="violet" />
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 mb-5 border-b border-black/8">
          {([
            { k:"overview"    as const, l:"Spend Overview",       i:BarChart3   },
            { k:"benchmarks"  as const, l:"Category Benchmarks",  i:TrendingUp  },
            { k:"anomalies"   as const, l:"Pricing Anomalies",    i:AlertTriangle },
            { k:"savings"     as const, l:"Savings Opportunities",i:Target      },
          ]).map(t => (
            <button key={t.k} onClick={() => setActiveTab(t.k)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${activeTab===t.k?"border-black text-black":"border-transparent text-black/40 hover:text-black/70"}`}>
              <t.i className="h-3.5 w-3.5"/>{t.l}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader title="Actual Spend vs Market Average" subtitle="Monthly USD M — with AI forecast"/>
                <div className="p-4 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={SPEND_TREND}>
                      <CartesianGrid stroke="#f1f5f9" vertical={false}/>
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false}/>
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}M`}/>
                      <Tooltip {...TIP} formatter={(v:number)=>[`USD ${v}M`]}/>
                      <Legend/>
                      <Area  type="monotone" dataKey="market"   fill="#fee2e2" stroke="#DC2626" strokeWidth={1.5} strokeDasharray="4 2" name="Market Avg" fillOpacity={0.3}/>
                      <Area  type="monotone" dataKey="actual"   fill="#dbeafe" stroke="#3B82F6" strokeWidth={2}   name="Gov Spend" fillOpacity={0.4}/>
                      <Line  type="monotone" dataKey="forecast" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="6 3" dot={false} name="Forecast"/>
                      <Bar   dataKey="savings" fill="#10B981" opacity={0.7} name="Savings" radius={[3,3,0,0]}/>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <CardHeader title="Spend vs Market by Category" subtitle="Gov spend vs market average (USD M)"/>
                <div className="p-4 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CATEGORY_BENCH} layout="vertical" barCategoryGap="20%">
                      <CartesianGrid stroke="#f1f5f9" horizontal={false}/>
                      <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}M`}/>
                      <YAxis type="category" dataKey="cat" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={100}/>
                      <Tooltip {...TIP} formatter={(v:number)=>[`USD ${v}M`]}/>
                      <Bar dataKey="marketAvg" fill="#e2e8f0" radius={[0,3,3,0]} name="Market Avg"/>
                      <Bar dataKey="govSpend"  fill="#3B82F6" radius={[0,3,3,0]} name="Gov Spend"/>
                      <Legend/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Market position summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label:"Below Market (Savings)",  count: CATEGORY_BENCH.filter(c=>c.variance<0).length, pct:"43% of categories", color:"bg-slate-50 border-slate-200", icon:TrendingDown, tc:"text-[#0F172A]" },
                { label:"At Market",               count: 0,                                              pct:"0% of categories",  color:"bg-gray-50 border-gray-200",     icon:Minus,        tc:"text-gray-600"   },
                { label:"Above Market (Overpay)",  count: CATEGORY_BENCH.filter(c=>c.variance>0).length, pct:"43% of categories", color:"bg-red-50 border-red-200",       icon:TrendingUp,   tc:"text-red-600"    },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-5 w-5 ${s.tc}`}/>
                      <span className="text-sm font-bold text-black">{s.label}</span>
                    </div>
                    <div className={`text-2xl font-bold ${s.tc}`}>{s.count}</div>
                    <div className="text-xs text-black/50 mt-0.5">{s.pct}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Benchmarks Tab ── */}
        {activeTab === "benchmarks" && (
          <div className="space-y-3">
            <div className="text-sm text-black/50 mb-3">Comparing government procurement prices against live market data from 6 verified sources. Updated every 4 hours.</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CATEGORY_BENCH.map(c => (
                <div key={c.cat} className={`bg-white border rounded-xl p-4 ${c.variance > 5 ? "border-red-200" : c.variance < -2 ? "border-slate-200" : "border-black/8"}`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="text-sm font-bold text-black">{c.cat}</div>
                      <div className="text-[11px] text-black/40">{c.items} catalogue items tracked</div>
                    </div>
                    {varBadge(c.variance)}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] text-black/40 mb-0.5">Government Price</div>
                      <div className={`text-lg font-bold ${c.variance > 5 ? "text-red-600" : "text-black"}`}>USD {c.govSpend}M</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-black/40 mb-0.5">Market Average</div>
                      <div className="text-lg font-bold text-black/60">USD {c.marketAvg}M</div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full ${c.variance > 5 ? "bg-red-500" : c.variance < -2 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`}
                      style={{ width:`${Math.min((c.govSpend/c.marketAvg)*100, 120)}%` }}/>
                  </div>
                  <div className="flex justify-between text-[9px] text-black/30 mt-0.5">
                    <span>0</span><span>Market avg</span><span>+20%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Anomalies Tab ── */}
        {activeTab === "anomalies" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0"/>
              <span className="text-sm text-red-700 font-medium">4 items detected where government is paying significantly above market rates. Estimated overspend: <strong>USD 840K/yr</strong>.</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white border border-black/8 rounded-xl overflow-hidden">
                <thead className="bg-gray-50 text-xs text-black/40 uppercase">
                  <tr>
                    {["Reference","Item","Gov Price","Market Price","Overpay %","Supplier","Recommended Action"].map(h=>(
                      <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {ANOMALIES.map(a=>(
                    <tr key={a.ref} className="hover:bg-red-50/40">
                      <td className="px-4 py-3 font-mono text-[11px] text-black/40">{a.ref}</td>
                      <td className="px-4 py-3 font-medium text-black">{a.item}</td>
                      <td className="px-4 py-3 font-bold text-red-600">{a.govPrice}</td>
                      <td className="px-4 py-3 font-semibold text-black/60">{a.market}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded text-xs">+{a.overpay}%</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-black/60">{a.supplier}</td>
                      <td className="px-4 py-3">
                        <button onClick={()=>toast(`Action initiated: ${a.action} for ${a.item}`,"info")}
                          className="h-7 px-3 rounded-lg bg-black text-white text-[10px] font-semibold hover:bg-gray-800 whitespace-nowrap">
                          {a.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Savings Tab ── */}
        {activeTab === "savings" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3">
              <Sparkles className="h-4 w-4 text-[#0F172A] flex-shrink-0"/>
              <span className="text-sm text-[#0F172A] font-medium">AI identified <strong>USD {totalSavings.toLocaleString()}</strong>/yr in savings opportunities across {SAVINGS_OPP.length} procurement categories.</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SAVINGS_OPP.map(o=>(
                <div key={o.id} className="bg-white border border-black/8 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-bold text-black">{o.title}</div>
                      <div className="text-[11px] text-black/40 mt-0.5">{o.category} · {o.id}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-bold text-[#0F172A]">{o.saving}</div>
                      <div className="text-[10px] text-black/30">potential saving</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${effortColor(o.effort)}`}>Effort: {o.effort}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${statusColor(o.status)}`}>{o.status}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${o.priority==="High"?"bg-red-100 text-red-700":"bg-slate-100 text-[#0F172A]"}`}>{o.priority} Priority</span>
                    <button onClick={()=>{ toast(`Action plan created for: ${o.title}`,"success"); pushNotification(`Savings initiative started: ${o.title}`,"success"); }}
                      className="ml-auto h-7 px-3 rounded-lg bg-black text-white text-[10px] font-semibold hover:bg-gray-800">
                      Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
