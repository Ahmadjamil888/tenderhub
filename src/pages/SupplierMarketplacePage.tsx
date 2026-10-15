/**
 * SupplierMarketplacePage — National Supplier Marketplace
 * Better than Coupa's Business Trade Network — government-specific,
 * with pricing intelligence, market benchmarks, and 151+ AI agents.
 * Route: /marketplace
 */
import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard, Badge , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import {
  Search, Star, Shield, TrendingUp, TrendingDown, MapPin, Phone, Mail,
  CheckCircle2, AlertTriangle, Filter, Building2, DollarSign, Package,
  Sparkles, Users, BarChart3, Award, Eye, Zap, Clock, Globe2,
  ChevronRight, RefreshCw,
} from "lucide-react";

// ─── Supplier data ────────────────────────────────────────────────────────────
const SUPPLIERS = [
  { id:"VEN-00481", name:"Zimbabwe Pharma Holdings",    category:"Health & Pharma",    rating:4.5, contracts:24, risk:"Low",    status:"Verified", province:"Harare",   spend:"USD 42.5M", items:142, trend:+12, certified:true, praz:true },
  { id:"VEN-00482", name:"Highveld Engineering (Pvt)", category:"Infrastructure",      rating:4.7, contracts:18, risk:"Low",    status:"Verified", province:"Harare",   spend:"USD 71.0M", items:88,  trend:+8,  certified:true, praz:true },
  { id:"VEN-00483", name:"Sable ICT Solutions",        category:"ICT & Digital",       rating:4.2, contracts:11, risk:"Medium", status:"Verified", province:"Harare",   spend:"USD 9.8M",  items:56,  trend:-3,  certified:true, praz:true },
  { id:"VEN-00484", name:"Mashonaland Agri Supplies",  category:"Agriculture",         rating:4.4, contracts:16, risk:"Low",    status:"Verified", province:"Mashonaland East", spend:"USD 28.4M", items:204, trend:+22, certified:true, praz:true },
  { id:"VEN-00485", name:"Eastern Highlands Logistics",category:"Logistics",           rating:4.1, contracts:7,  risk:"Low",    status:"Verified", province:"Manicaland", spend:"USD 6.2M", items:33,  trend:+5,  certified:false, praz:true },
  { id:"VEN-00486", name:"Bulawayo Civil Works",       category:"Infrastructure",      rating:3.9, contracts:9,  risk:"Medium", status:"Under Review", province:"Bulawayo", spend:"USD 14.8M", items:62, trend:-8,  certified:true, praz:true },
  { id:"VEN-00487", name:"ZIMTRADE Office Supplies",   category:"General Supplies",    rating:4.0, contracts:31, risk:"Low",    status:"Verified", province:"Harare",   spend:"USD 3.2M",  items:892, trend:+4,  certified:false, praz:true },
  { id:"VEN-00488", name:"Kariba Construction Ltd",    category:"Infrastructure",      rating:4.6, contracts:5,  risk:"Low",    status:"Verified", province:"Mashonaland West", spend:"USD 55.0M", items:44, trend:+18, certified:true, praz:true },
  { id:"VEN-00489", name:"National Med Distributors",  category:"Health & Pharma",     rating:4.3, contracts:14, risk:"Low",    status:"Verified", province:"Harare",   spend:"USD 18.6M", items:287, trend:+9,  certified:true, praz:true },
  { id:"VEN-00490", name:"Telecom Support Services",   category:"ICT & Digital",       rating:3.8, contracts:8,  risk:"Medium", status:"Verified", province:"Harare",   spend:"USD 5.4M",  items:28,  trend:-12, certified:false, praz:false },
  { id:"VEN-00491", name:"Midlands Steel Fabricators", category:"Infrastructure",      rating:4.2, contracts:12, risk:"Low",    status:"Verified", province:"Midlands", spend:"USD 22.1M", items:71,  trend:+7,  certified:true, praz:true },
  { id:"VEN-00492", name:"Lowveld Agro-Chemicals",     category:"Agriculture",         rating:4.5, contracts:19, risk:"Low",    status:"Verified", province:"Masvingo", spend:"USD 11.3M", items:119, trend:+14, certified:true, praz:true },
];

// ─── Market pricing benchmarks ────────────────────────────────────────────────
const PRICE_BENCHMARKS = [
  { item:"A4 Paper (500 sheets)",    cat:"Stationery",  market:"USD 4.20",  gov:"USD 5.80", diff:+38, alert:true  },
  { item:"ARV Medication (30-day)",  cat:"Pharma",      market:"USD 28.50", gov:"USD 26.40",diff:-7,  alert:false },
  { item:"Diesel Fuel (litre)",      cat:"Energy",      market:"USD 1.42",  gov:"USD 1.39", diff:-2,  alert:false },
  { item:"Laptop (i7, 16GB RAM)",    cat:"ICT",         market:"USD 920",   gov:"USD 1,240",diff:+35, alert:true  },
  { item:"Cement (50kg bag)",        cat:"Construction",market:"USD 18.50", gov:"USD 17.80",diff:-4,  alert:false },
  { item:"Office Chair (ergonomic)", cat:"Furniture",   market:"USD 180",   gov:"USD 310",  diff:+72, alert:true  },
  { item:"Surgical Gloves (100pk)",  cat:"Medical",     market:"USD 12.00", gov:"USD 11.40",diff:-5,  alert:false },
  { item:"Toner Cartridge (HP)",     cat:"ICT",         market:"USD 48",    gov:"USD 84",   diff:+75, alert:true  },
];

const CATEGORIES = ["All","Infrastructure","Health & Pharma","ICT & Digital","Agriculture","Logistics","General Supplies"];
const PROVINCES  = ["All","Harare","Bulawayo","Manicaland","Mashonaland East","Mashonaland West","Midlands","Masvingo"];

function RiskBadge({ risk }: { risk: string }) {
  const m: Record<string, string> = {
    Low:    "bg-slate-100 text-[#0F172A]",
    Medium: "bg-slate-100 text-[#0F172A]",
    High:   "bg-red-100 text-red-700",
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${m[risk] ?? "bg-gray-100 text-gray-600"}`}>{risk} Risk</span>;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`h-3 w-3 ${i <= Math.round(rating) ? "fill-amber-400 text-slate-500" : "text-gray-200"}`} />
      ))}
      <span className="text-[11px] font-semibold text-black/60 ml-0.5">{rating}</span>
    </div>
  );
}

function SupplierCard({ s, onContact }: { s: typeof SUPPLIERS[0]; onContact: () => void }) {
  const trending = s.trend > 0;
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 hover:shadow-md hover:border-black/15 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-10 w-10 rounded-xl bg-[#0f172a] grid place-items-center flex-shrink-0">
          <span className="text-white font-bold text-sm">{s.name.charAt(0)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-bold text-black truncate">{s.name}</span>
            {s.praz && <span title="PRAZ Registered"><Shield className="h-3.5 w-3.5 text-[#0F172A] flex-shrink-0" /></span>}
            {s.certified && <span title="ISO Certified"><Award className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" /></span>}
          </div>
          <div className="text-[10px] text-black/40 font-mono">{s.id}</div>
        </div>
        <RiskBadge risk={s.risk} />
      </div>

      <StarRating rating={s.rating} />

      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-black/50">
          <Package className="h-3 w-3" />{s.category}
        </div>
        <div className="flex items-center gap-1.5 text-black/50">
          <MapPin className="h-3 w-3" />{s.province}
        </div>
        <div className="flex items-center gap-1.5 text-black/50">
          <DollarSign className="h-3 w-3" />Gov Spend: <span className="font-semibold text-black">{s.spend}</span>
        </div>
        <div className="flex items-center gap-1.5 text-black/50">
          <CheckCircle2 className="h-3 w-3" />{s.contracts} contracts
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className={`flex items-center gap-1 text-[11px] font-semibold ${trending ? "text-[#0F172A]" : "text-red-600"}`}>
          {trending ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {trending ? "+" : ""}{s.trend}% vs last quarter
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => toast(`Viewing ${s.name} profile`, "info")}
            className="h-7 px-2.5 rounded-lg border border-black/10 text-[10px] font-semibold hover:bg-gray-50 flex items-center gap-1">
            <Eye className="h-3 w-3" /> View
          </button>
          <button onClick={onContact}
            className="h-7 px-2.5 rounded-lg bg-black text-white text-[10px] font-semibold hover:bg-gray-800 flex items-center gap-1">
            <Mail className="h-3 w-3" /> Contact
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SupplierMarketplacePage() {
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("All");
  const [province, setProvince]   = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<"suppliers"|"pricing"|"intelligence">("suppliers");

  const filtered = SUPPLIERS.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
    const matchCat  = category === "All" || s.category === category;
    const matchProv = province === "All" || s.province === province;
    const matchRisk = riskFilter === "All" || s.risk === riskFilter;
    return matchSearch && matchCat && matchProv && matchRisk;
  });

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Vendor Management"
        process="Supplier Marketplace"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="National Supplier Marketplace"
          description="Zimbabwe's government-verified supplier network — real-time performance scores, market pricing benchmarks, and AI-powered supplier intelligence."
          actions={
            <div className="flex items-center gap-2">
              <button onClick={() => toast("Supplier intelligence report generated", "success")}
                className="h-9 px-4 rounded-xl border border-black/10 text-sm hover:bg-gray-50 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> AI Report
              </button>
              <button onClick={() => toast("Inviting suppliers to marketplace…", "info")}
                className="h-9 px-4 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 flex items-center gap-2">
                <Users className="h-4 w-4" /> Invite Supplier
              </button>
            </div>
          }
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Verified Suppliers"   value="12,847"  delta="+284 this month"    icon={Building2}    color="blue"   />
          <KpiCard label="Active Contracts"     value="964"     delta="68% on-track"       icon={CheckCircle2} color="green"  />
          <KpiCard label="Avg Performance Score"value="4.2/5"   delta="+0.1 vs last qtr"   icon={Star}         color="amber"  />
          <KpiCard label="Price Alerts Today"   value="4"       delta="Items above market"  icon={AlertTriangle} color="red" positive={false} />
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 mb-5 border-b border-black/8">
          {([
            { k: "suppliers" as const,    l: "Supplier Directory",      i: Building2  },
            { k: "pricing" as const,      l: "Pricing Intelligence",    i: TrendingUp },
            { k: "intelligence" as const, l: "AI Market Intelligence",  i: Sparkles   },
          ]).map(t => (
            <button key={t.k} onClick={() => setActiveTab(t.k)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors ${activeTab === t.k ? "border-black text-black" : "border-transparent text-black/40 hover:text-black/70"}`}>
              <t.i className="h-3.5 w-3.5" />{t.l}
            </button>
          ))}
        </div>

        {/* ── Suppliers Tab ── */}
        {activeTab === "suppliers" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers…"
                  className="h-8 pl-8 pr-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 w-48" />
              </div>
              <select value={category} onChange={e => setCategory(e.target.value)} className="h-8 px-2 rounded-lg border border-black/10 text-xs bg-white focus:outline-none">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={province} onChange={e => setProvince(e.target.value)} className="h-8 px-2 rounded-lg border border-black/10 text-xs bg-white focus:outline-none">
                {PROVINCES.map(p => <option key={p}>{p}</option>)}
              </select>
              {["All","Low","Medium","High"].map(r => (
                <button key={r} onClick={() => setRiskFilter(r)}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors ${riskFilter === r ? "bg-black text-white" : "border border-black/10 hover:bg-gray-50"}`}>
                  {r === "All" ? "All Risk" : `${r} Risk`}
                </button>
              ))}
              <span className="text-xs text-black/40 ml-auto">{filtered.length} suppliers found</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map(s => (
                <SupplierCard key={s.id} s={s} onContact={() => toast(`Contact request sent to ${s.name}`, "success")} />
              ))}
            </div>
          </>
        )}

        {/* ── Pricing Intelligence Tab ── */}
        {activeTab === "pricing" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-[#0F172A] animate-pulse" />
                <span className="text-black/60">Live market pricing vs government procurement prices</span>
              </div>
              <button onClick={() => toast("Pricing data refreshed from market sources", "info")}
                className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5 ml-auto">
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {PRICE_BENCHMARKS.map(b => (
                <div key={b.item} className={`flex items-center gap-3 p-4 rounded-xl border ${b.alert ? "border-red-200 bg-red-50" : "border-black/8 bg-white"}`}>
                  <div className={`h-9 w-9 rounded-xl grid place-items-center flex-shrink-0 ${b.alert ? "bg-red-100" : "bg-gray-100"}`}>
                    {b.alert ? <AlertTriangle className="h-4 w-4 text-red-600" /> : <CheckCircle2 className="h-4 w-4 text-[#0F172A]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-black truncate">{b.item}</div>
                    <div className="text-[11px] text-black/40">{b.cat}</div>
                    <div className="flex items-center gap-3 mt-1 text-[11px]">
                      <span className="text-black/50">Market: <span className="font-bold text-black">{b.market}</span></span>
                      <span className="text-black/50">Gov: <span className={`font-bold ${b.alert ? "text-red-600" : "text-[#0F172A]"}`}>{b.gov}</span></span>
                    </div>
                  </div>
                  <div className={`text-sm font-bold flex-shrink-0 ${b.diff > 0 ? "text-red-600" : "text-[#0F172A]"}`}>
                    {b.diff > 0 ? "+" : ""}{b.diff}%
                  </div>
                </div>
              ))}
            </div>

            <Card>
              <CardHeader title="Pricing Intelligence Summary" subtitle="AI-generated savings opportunities" />
              <div className="p-4 space-y-3">
                {[
                  { alert: "4 items priced above market average by 35%+", action: "Renegotiate contracts for Office Chairs, Toner, A4 Paper, Laptops", savings: "Est. USD 840K savings/yr", sev: "high" },
                  { alert: "Pharma prices 7% below market — maintain", action: "Renew Zimbabwe Pharma Holdings framework for 2 more years", savings: "Est. USD 420K protected", sev: "ok" },
                  { alert: "Fuel pricing 2% favorable — no action needed", action: "Continue current fuel procurement framework", savings: "On track", sev: "ok" },
                ].map((a, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl ${a.sev === "high" ? "bg-red-50 border border-red-200" : "bg-slate-50 border border-slate-200"}`}>
                    <Sparkles className={`h-4 w-4 flex-shrink-0 mt-0.5 ${a.sev === "high" ? "text-red-600" : "text-[#0F172A]"}`} />
                    <div>
                      <div className="text-xs font-bold text-black">{a.alert}</div>
                      <div className="text-[11px] text-black/60 mt-0.5">{a.action}</div>
                      <div className={`text-[11px] font-semibold mt-1 ${a.sev === "high" ? "text-red-700" : "text-[#0F172A]"}`}>{a.savings}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ── AI Intelligence Tab ── */}
        {activeTab === "intelligence" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { title: "Supplier Risk Predictions", icon: Shield, color: "text-rose-600", items: [
                { name: "Bulawayo Civil Works", insight: "Cash flow concerns detected — 3 delayed payments, credit rating downgraded. 67% probability of performance issues in next 60 days.", sev: "high" },
                { name: "Telecom Support Services", insight: "Performance declining — 12% below KPI targets. Recommend issuing formal warning notice.", sev: "medium" },
                { name: "Sable ICT Solutions", insight: "Minor risk: Contract delivery 3 weeks behind schedule. Currently being monitored.", sev: "low" },
              ]},
              { title: "Market Opportunity Alerts", icon: TrendingUp, color: "text-[#0F172A]", items: [
                { name: "New Pharma Suppliers", insight: "2 new PRAZ-registered pharmaceutical suppliers available. May reduce ARV medication costs by 12%.", sev: "ok" },
                { name: "ICT Hardware Market", insight: "Global chip prices down 18% — ideal time to renegotiate server procurement contracts.", sev: "ok" },
                { name: "Construction Materials", insight: "Cement and steel prices stable. Lock in 12-month framework agreements now for infrastructure projects.", sev: "ok" },
              ]},
              { title: "Performance Rankings", icon: Star, color: "text-[#0F172A]", items: [
                { name: "Top Performer: Highveld Engineering", insight: "4.7/5 rating. 18 contracts. 0 disputes. 100% on-time delivery. Recommend preferred supplier status.", sev: "top" },
                { name: "Top Pharma: Zimbabwe Pharma Holdings", insight: "4.5/5 rating. 24 contracts. ISO certified. Consistent quality scores above 95%.", sev: "top" },
                { name: "Declining: Telecom Support Services", insight: "Rating dropped from 4.2 to 3.8 in 2 quarters. Requires performance improvement plan.", sev: "warn" },
              ]},
              { title: "Procurement Savings Intelligence", icon: DollarSign, color: "text-[#0F172A]", items: [
                { name: "Framework Agreement Savings", insight: "Consolidating 8 stationery suppliers into 1 national framework could save USD 340K annually.", sev: "ok" },
                { name: "Bulk Procurement Opportunity", insight: "3 ministries procuring identical fuel. Joint procurement would save 8% = USD 180K.", sev: "ok" },
                { name: "Contract Duplication Detected", insight: "2 contracts for identical office equipment detected across Harare & Bulawayo offices. Review needed.", sev: "warn" },
              ]},
            ].map(section => {
              const Icon = section.icon;
              return (
                <Card key={section.title}>
                  <CardHeader title={section.title} subtitle="AI-generated intelligence · updated every 15 min">
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-black/40">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0F172A] animate-pulse" />
                      Live
                    </div>
                  </CardHeader>
                  <div className="p-4 space-y-3">
                    {section.items.map(item => {
                      const sevClasses: Record<string, string> = {
                        high:   "bg-red-50 border-red-200",
                        medium: "bg-slate-50 border-slate-200",
                        low:    "bg-slate-50 border-slate-200",
                        ok:     "bg-slate-50 border-slate-200",
                        top:    "bg-slate-50 border-slate-200",
                        warn:   "bg-slate-50 border-slate-200",
                      };
                      return (
                        <div key={item.name} className={`p-3 rounded-xl border ${sevClasses[item.sev] ?? "bg-gray-50 border-black/8"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${section.color}`} />
                            <span className="text-xs font-bold text-black">{item.name}</span>
                          </div>
                          <p className="text-[11px] text-black/60 leading-relaxed">{item.insight}</p>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
