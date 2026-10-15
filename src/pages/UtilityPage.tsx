import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { pushNotification, pushSeniorAlert } from "@/lib/local-store";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import {
  BookOpen, MessageSquare, Newspaper, Megaphone, Globe2, Radio,
  Search, Plus, Download, Eye, Edit3, CheckCircle2, Clock, AlertTriangle,
  FileText, Send, Bell, Filter, Star, Tag, Package, DollarSign,
  Zap, Cpu, Shield, Activity, TrendingUp, Users, RefreshCw,
  Mail, Phone, Link2, Image, Archive, Trash2, BarChart3, Target,
  ChevronRight, Info, Calendar, MapPin, ExternalLink,
} from "lucide-react";

// ─── Shared Types & Helpers ───────────────────────────────────────────────────
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#84CC16"];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-black mb-3 mt-6">{children}</h2>;
}

function FeatureCard({ title, desc, icon: Icon, color = "blue" }: {
  title: string; desc: string; icon?: React.ElementType; color?: string;
}) {
  const bg: Record<string,string> = {
    blue:"bg-slate-50 text-[#0F172A]", green:"bg-slate-50 text-[#0F172A]",
    amber:"bg-slate-50 text-[#0F172A]", violet:"bg-slate-50 text-[#0F172A]",
    cyan:"bg-slate-50 text-[#0F172A]", red:"bg-red-50 text-red-600",
    orange:"bg-slate-50 text-[#0F172A]", pink:"bg-slate-50 text-[#0F172A]",
  };
  return (
    <div className="bg-white border border-black/8 rounded-xl p-4 hover:shadow-sm hover:border-black/15 transition-all">
      {Icon && <div className={`h-8 w-8 rounded-lg grid place-items-center mb-2 ${bg[color]??bg.blue}`}><Icon className="h-4 w-4"/></div>}
      <div className="text-sm font-semibold text-black mb-1">{title}</div>
      <div className="text-xs text-black/50 leading-relaxed">{desc}</div>
    </div>
  );
}

function AIAgentCard({ name, desc, tasks, accuracy, status = "Active", onRun }: {
  name: string; desc: string; tasks: number; accuracy: number; status?: string; onRun: () => void;
}) {
  return (
    <div className="bg-white border border-black/8 rounded-xl p-4 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="h-8 w-8 rounded-lg bg-slate-100 grid place-items-center flex-shrink-0"><Cpu className="h-4 w-4 text-[#0F172A]"/></div>
        <Badge tone={status === "Active" ? "green" : "muted"}>{status}</Badge>
      </div>
      <div className="text-sm font-semibold text-black mb-1">{name}</div>
      <div className="text-xs text-black/50 mb-3 leading-relaxed">{desc}</div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="text-center bg-[#EAF1F8] rounded-lg p-1.5">
          <div className="text-sm font-bold text-black">{tasks.toLocaleString()}</div>
          <div className="text-[10px] text-black/40">Tasks</div>
        </div>
        <div className="text-center bg-[#EAF1F8] rounded-lg p-1.5">
          <div className="text-sm font-bold text-black">{accuracy}%</div>
          <div className="text-[10px] text-black/40">Accuracy</div>
        </div>
      </div>
      <button onClick={onRun} className="w-full h-7 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center justify-center gap-1.5">
        <Zap className="h-3 w-3"/> Run Agent
      </button>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const MODULES = [
  { id: "catalogue",      label: "Catalogue",            icon: BookOpen },
  { id: "communications", label: "Communications",       icon: MessageSquare },
  { id: "gazette",        label: "Tender Gazette",       icon: Newspaper },
  { id: "announcements",  label: "Announcements",        icon: Megaphone },
  { id: "public-records", label: "Public Records",       icon: Globe2 },
  { id: "media",          label: "Media Briefing",       icon: Radio },
] as const;
type ModuleId = typeof MODULES[number]["id"];

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 1 — CATALOGUE MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

const CATALOGUE_ITEMS = [
  { id:"CAT-2026-0142", name:"ARV Tenofovir/Lamivudine 300mg Tablet (30-pk)", category:"Pharmaceuticals", subCat:"Antiretrovirals", unspsc:"51172001", price:"USD 8.50", supplier:"Zimbabwe Pharma Holdings", status:"Active", contractLinked:true, lastUpdated:"2026-06-10" },
  { id:"CAT-2026-0141", name:"A4 Printing Paper 80gsm — Box of 5 Reams", category:"Office Supplies", subCat:"Paper & Stationery", unspsc:"14111507", price:"USD 12.00", supplier:"Sable ICT Solutions", status:"Active", contractLinked:true, lastUpdated:"2026-06-08" },
  { id:"CAT-2026-0140", name:"Dell Latitude 5540 Laptop 15\"", category:"ICT Equipment", subCat:"Computing", unspsc:"43211501", price:"USD 1,280", supplier:"Sable ICT Solutions", status:"Active", contractLinked:true, lastUpdated:"2026-05-20" },
  { id:"CAT-2026-0139", name:"Portland Cement 42.5N — 50kg Bag", category:"Construction Materials", subCat:"Cement & Binders", unspsc:"30111601", price:"USD 9.80", supplier:"Highveld Engineering", status:"Active", contractLinked:true, lastUpdated:"2026-06-12" },
  { id:"CAT-2026-0138", name:"Diesel Fuel — Bulk Litres (ULSD)", category:"Fuel & Lubricants", subCat:"Diesel", unspsc:"15101505", price:"USD 0.92/L", supplier:"National Oil Corp", status:"Active", contractLinked:true, lastUpdated:"2026-06-18" },
  { id:"CAT-2026-0137", name:"Toyota Land Cruiser VDJ200 — Government Spec", category:"Vehicles", subCat:"4x4 Vehicles", unspsc:"25101503", price:"USD 98,500", supplier:"Toyota Zimbabwe", status:"Pending Approval", contractLinked:false, lastUpdated:"2026-06-15" },
  { id:"CAT-2026-0136", name:"LED Exam Lamp — Surgical 60W", category:"Medical Equipment", subCat:"Surgical Lighting", unspsc:"42182403", price:"USD 2,400", supplier:"MedSupply Africa", status:"Active", contractLinked:true, lastUpdated:"2026-05-28" },
  { id:"CAT-2026-0135", name:"HTH Chlorine Granules 70% — 25kg Drum", category:"Chemicals", subCat:"Water Treatment", unspsc:"12352304", price:"USD 42.00", supplier:"Mashonaland Agri", status:"Expiring", contractLinked:true, lastUpdated:"2026-04-14" },
];

const CATALOGUE_CATS = [
  { name:"Pharmaceuticals", items:842, value:"USD 38M", coverage:"94%", trend:"+4" },
  { name:"ICT Equipment", items:624, value:"USD 24M", coverage:"88%", trend:"+2" },
  { name:"Construction", items:1284, value:"USD 84M", coverage:"91%", trend:"+8" },
  { name:"Office Supplies", items:328, value:"USD 4.2M", coverage:"96%", trend:"+1" },
  { name:"Fuel & Lubricants", items:42, value:"USD 18M", coverage:"100%", trend:"0" },
  { name:"Medical Equipment", items:480, value:"USD 28M", coverage:"86%", trend:"+6" },
];

const CAT_PRICE_TREND = [
  { month:"Jan", avg:100, min:80, max:120 },
  { month:"Feb", avg:102, min:81, max:124 },
  { month:"Mar", avg:104, min:82, max:126 },
  { month:"Apr", avg:101, min:80, max:122 },
  { month:"May", avg:106, min:84, max:130 },
  { month:"Jun", avg:108, min:85, max:132 },
];

function CatalogueModule({ onAction }: { onAction:(m:string)=>void }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeView, setActiveView] = useState<"items"|"categories"|"analytics"|"agents">("items");

  const filtered = CATALOGUE_ITEMS.filter(i =>
    (filterCat === "All" || i.category === filterCat) &&
    (filterStatus === "All" || i.status === filterStatus) &&
    (i.name.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Total Catalogue Items" value="8,284" delta="+142 this month" icon={BookOpen} color="blue"/>
        <KpiCard label="Active Suppliers" value="1,204" delta="87% linked" icon={Users} color="green"/>
        <KpiCard label="Catalogue Value" value="USD 284M" delta="+6.2% YoY" icon={DollarSign} color="violet"/>
        <KpiCard label="Expiring Agreements" value="28" delta="90-day window" positive={false} icon={Clock} color="amber"/>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KpiCard label="Spend Coverage" value="84.2%" delta="+2.1 pts" icon={Target} color="cyan"/>
        <KpiCard label="Savings Opportunities" value="USD 4.2M" delta="AI identified" icon={TrendingUp} color="green"/>
        <KpiCard label="Pending Approvals" value="18" delta="3 urgent" positive={false} icon={CheckCircle2} color="amber"/>
        <KpiCard label="Duplicate Detections" value="4" delta="AI flagged" positive={false} icon={AlertTriangle} color="red"/>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-5 border-b border-black/10">
        {(["items","categories","analytics","agents"] as const).map(v => (
          <button key={v} onClick={()=>setActiveView(v)}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg capitalize transition-colors ${activeView===v?"bg-black text-white":"text-black/50 hover:text-black hover:bg-[#EAF1F8]"}`}>
            {v === "agents" ? "AI Agents" : v.charAt(0).toUpperCase()+v.slice(1)}
          </button>
        ))}
      </div>

      {activeView === "items" && (
        <>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search catalogue items…"
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none"/>
            </div>
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm">
              <option>All</option>
              {["Pharmaceuticals","ICT Equipment","Construction Materials","Office Supplies","Fuel & Lubricants","Medical Equipment","Vehicles","Chemicals"].map(c=><option key={c}>{c}</option>)}
            </select>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm">
              <option>All</option><option>Active</option><option>Pending Approval</option><option>Expiring</option>
            </select>
            <button onClick={()=>onAction("New catalogue item created")} className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800">
              <Plus className="h-4 w-4"/> Add Item
            </button>
          </div>
          <Card className="mb-5">
            <CardHeader title={`Catalogue Repository — ${filtered.length + 8276} items`} action={
              <button onClick={()=>onAction("Catalogue exported")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Download className="h-3 w-3"/> Export</button>
            }/>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EAF1F8] text-xs text-black/40">
                  <tr>{["ID","Item Name","Category","UNSPSC","Unit Price","Supplier","Contract","Status","Actions"].map(h=>(
                    <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filtered.map(item=>(
                    <tr key={item.id} className="hover:bg-[#EAF1F8]/50">
                      <td className="px-4 py-3 font-mono text-[11px] text-black/40">{item.id}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-black max-w-[200px] truncate">{item.name}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{item.category}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-black/40">{item.unspsc}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-black">{item.price}</td>
                      <td className="px-4 py-3 text-xs text-black/60 max-w-[140px] truncate">{item.supplier}</td>
                      <td className="px-4 py-3"><Badge tone={item.contractLinked?"green":"muted"}>{item.contractLinked?"Linked":"None"}</Badge></td>
                      <td className="px-4 py-3"><Badge tone={item.status==="Active"?"green":item.status==="Expiring"?"amber":"violet"}>{item.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={()=>onAction(`Viewing: ${item.name}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3"/> View</button>
                          <button onClick={()=>onAction(`Editing: ${item.id}`)} className="h-7 px-2 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8]"><Edit3 className="h-3 w-3"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <SectionTitle>Catalogue Workflow & Automation</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              {title:"Catalogue Onboarding",desc:"Auto-validate and publish supplier catalogues with completeness checks and compliance verification",icon:CheckCircle2,color:"blue"},
              {title:"Price Monitoring",desc:"Continuous AI monitoring for price anomalies, sudden changes and market deviation alerts",icon:DollarSign,color:"green"},
              {title:"Duplicate Detection",desc:"AI identifies duplicate products/services across supplier submissions and existing catalogue",icon:Filter,color:"red"},
              {title:"Expiry Alerts",desc:"Automated notifications when catalogue agreements or contract-linked items approach expiry",icon:Bell,color:"amber"},
              {title:"Auto Classification",desc:"AI categorises new items using UNSPSC taxonomy and suggests category hierarchy placement",icon:Tag,color:"violet"},
              {title:"Demand Prediction",desc:"Forecast frequently purchased items to pre-position stock and pre-qualify preferred suppliers",icon:TrendingUp,color:"cyan"},
            ].map(f=><FeatureCard key={f.title} {...f}/>)}
          </div>
        </>
      )}

      {activeView === "categories" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {CATALOGUE_CATS.map(cat=>(
              <div key={cat.name} className="bg-white border border-black/8 rounded-xl p-4 hover:shadow-sm transition-all cursor-pointer" onClick={()=>onAction(`Category drill-down: ${cat.name}`)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-semibold text-black">{cat.name}</div>
                    <div className="text-xs text-black/40 mt-0.5">{cat.items.toLocaleString()} items</div>
                  </div>
                  <Badge tone={cat.trend.startsWith("+") && parseInt(cat.trend)>3?"green":"blue"}>{cat.trend} new</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><div className="text-[10px] text-black/40">Catalogue Value</div><div className="text-sm font-bold text-black">{cat.value}</div></div>
                  <div><div className="text-[10px] text-black/40">Spend Coverage</div><div className="text-sm font-bold text-[#0F172A]">{cat.coverage}</div></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeView === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="Price Index Trend" subtitle="Baseline 100 — average/min/max (last 6 months)"/>
            <div className="p-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CAT_PRICE_TREND}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false}/>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[70,140]}/>
                  <Tooltip contentStyle={{background:"white",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12}}/>
                  <Area dataKey="max" stroke="#DC2626" fill="none" strokeDasharray="3 2" name="Max"/>
                  <Area dataKey="avg" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} name="Avg"/>
                  <Area dataKey="min" stroke="#10B981" fill="none" strokeDasharray="3 2" name="Min"/>
                  <Legend wrapperStyle={{fontSize:11}}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <CardHeader title="Spend by Category" subtitle="YTD catalogue utilisation"/>
            <div className="p-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={CATALOGUE_CATS} dataKey="items" cx="50%" cy="50%" innerRadius={55} outerRadius={90} nameKey="name" paddingAngle={3}>
                    {CATALOGUE_CATS.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={(v)=>`${v} items`} contentStyle={{fontSize:11,borderRadius:8}}/>
                  <Legend wrapperStyle={{fontSize:10}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeView === "agents" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[
            {name:"Catalogue Intelligence Agent",desc:"Classifies new items, suggests UNSPSC categories, detects duplicates across supplier submissions",tasks:2841,accuracy:96},
            {name:"Pricing Intelligence Agent",desc:"Tracks price trends, identifies savings opportunities, detects abnormal pricing patterns",tasks:1482,accuracy:94},
            {name:"Catalogue Compliance Agent",desc:"Checks mandatory fields, validates supplier documentation and contract linkage requirements",tasks:3204,accuracy:98},
            {name:"Procurement Advisor Agent",desc:"Recommends preferred suppliers based on performance history, pricing, and availability",tasks:842,accuracy:91},
          ].map(a=><AIAgentCard key={a.name} {...a} onRun={()=>onAction(`${a.name} activated`)}/>)}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 2 — COMMUNICATIONS MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

const COMM_MESSAGES = [
  { id:"MSG-2026-0484",subject:"Clarification on ZW-PRA-2026-00184 — Solar Mini-Grids Specifications",from:"Highveld Engineering",channel:"Portal",date:"2026-06-21",status:"Awaiting Response",priority:"High" },
  { id:"MSG-2026-0483",subject:"Request for Extension of Bid Deadline — ZW-PRA-2026-00182",from:"Sable ICT Solutions",channel:"Email",date:"2026-06-20",status:"Responded",priority:"Medium" },
  { id:"MSG-2026-0482",subject:"Addendum Notice — ARV Medicines Framework Clarification",from:"Procurement Unit",channel:"Broadcast",date:"2026-06-19",status:"Sent",priority:"High" },
  { id:"MSG-2026-0481",subject:"Q3 2026 Supplier Forum — Invitation & Agenda",from:"CPO Office",channel:"Email",date:"2026-06-18",status:"Sent",priority:"Low" },
  { id:"MSG-2026-0480",subject:"Non-Compliance Notice — Expired Tax Clearance Certificate",from:"Compliance Unit",channel:"Portal",date:"2026-06-17",status:"Responded",priority:"Critical" },
  { id:"MSG-2026-0479",subject:"Payment Status Query — INV-2026-4821",from:"Zimbabwe Pharma Holdings",channel:"Email",date:"2026-06-16",status:"Awaiting Response",priority:"Medium" },
];

const COMM_STATS = [
  { month:"Jan", sent:284, received:312, responded:294 },
  { month:"Feb", sent:318, received:342, responded:320 },
  { month:"Mar", sent:294, received:318, responded:308 },
  { month:"Apr", sent:340, received:384, responded:362 },
  { month:"May", sent:362, received:408, responded:390 },
  { month:"Jun", sent:318, received:364, responded:342 },
];

function CommunicationsModule({ onAction }:{ onAction:(m:string)=>void }) {
  const [activeView, setActiveView] = useState<"inbox"|"campaigns"|"templates"|"agents">("inbox");

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Messages Sent (MTD)" value="318" delta="+12 from last month" icon={Send} color="blue"/>
        <KpiCard label="Open Rate" value="84.2%" delta="+2.1 pts" icon={Mail} color="green"/>
        <KpiCard label="Outstanding Queries" value="42" delta="8 urgent" positive={false} icon={AlertTriangle} color="amber"/>
        <KpiCard label="Avg Response Time" value="4.2 hrs" delta="-0.8 hrs" icon={Clock} color="violet"/>
      </div>

      <div className="flex gap-1 mb-5 border-b border-black/10">
        {(["inbox","campaigns","templates","agents"] as const).map(v=>(
          <button key={v} onClick={()=>setActiveView(v)}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg capitalize transition-colors ${activeView===v?"bg-black text-white":"text-black/50 hover:text-black hover:bg-[#EAF1F8]"}`}>
            {v==="agents"?"AI Agents":v.charAt(0).toUpperCase()+v.slice(1)}
          </button>
        ))}
      </div>

      {activeView === "inbox" && (
        <>
          <div className="flex gap-2 mb-4">
            <button onClick={()=>onAction("New message composed")} className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800"><Plus className="h-4 w-4"/> Compose</button>
            <button onClick={()=>onAction("Broadcast notification sent to all suppliers")} className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm font-medium hover:bg-[#EAF1F8] flex items-center gap-1.5"><Megaphone className="h-4 w-4"/> Broadcast</button>
          </div>
          <Card className="mb-5">
            <CardHeader title="Message Centre" subtitle="All procurement communications" action={
              <Badge tone="amber">42 unread</Badge>
            }/>
            <div className="divide-y divide-black/5">
              {COMM_MESSAGES.map(msg=>(
                <div key={msg.id} className="px-5 py-3 hover:bg-[#EAF1F8]/50 cursor-pointer" onClick={()=>onAction(`Opening: ${msg.subject}`)}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-black truncate">{msg.subject}</div>
                      <div className="text-[11px] text-black/40 mt-0.5">{msg.id} · {msg.from} · {msg.date}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge tone={msg.priority==="Critical"?"red":msg.priority==="High"?"amber":msg.priority==="Medium"?"blue":"muted"}>{msg.priority}</Badge>
                      <Badge tone={msg.status==="Responded"||msg.status==="Sent"?"green":"amber"}>{msg.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="muted">{msg.channel}</Badge>
                    {msg.status==="Awaiting Response" && (
                      <button onClick={e=>{e.stopPropagation();onAction(`Replied to: ${msg.from}`)}} className="h-6 px-2 rounded-lg bg-[#0F172A] text-white text-[10px] hover:bg-[#0F172A] ml-auto">Reply</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Communication Volume Trend" subtitle="Sent / Received / Responded (6 months)"/>
            <div className="p-4 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={COMM_STATS}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false}/>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                  <Tooltip contentStyle={{background:"white",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12}}/>
                  <Bar dataKey="sent" fill="#3B82F6" radius={[3,3,0,0]} name="Sent"/>
                  <Bar dataKey="received" fill="#e2e8f0" radius={[3,3,0,0]} name="Received"/>
                  <Bar dataKey="responded" fill="#10B981" radius={[3,3,0,0]} name="Responded"/>
                  <Legend wrapperStyle={{fontSize:11}}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}

      {activeView === "campaigns" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {[
              {name:"Q3 2026 Supplier Forum Invitation",target:"All Active Suppliers",sent:11204,opened:9842,status:"Completed",date:"2026-06-18"},
              {name:"Compliance Reminder — Document Renewal",target:"284 Expiring Vendors",sent:284,opened:218,status:"Active",date:"2026-06-20"},
              {name:"New Framework Agreement Notification",target:"Works Contractors",sent:3284,opened:2840,status:"Completed",date:"2026-06-15"},
              {name:"ARV Tender Clarification Addendum",target:"8 Bidders",sent:8,opened:8,status:"Completed",date:"2026-06-19"},
            ].map(c=>(
              <div key={c.name} className="bg-white border border-black/8 rounded-xl p-4 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm font-semibold text-black leading-tight">{c.name}</div>
                  <Badge tone={c.status==="Active"?"green":"muted"}>{c.status}</Badge>
                </div>
                <div className="text-[11px] text-black/40 mb-3">{c.target} · {c.date}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center bg-[#EAF1F8] rounded-lg p-2">
                    <div className="text-base font-bold text-black">{c.sent.toLocaleString()}</div>
                    <div className="text-[10px] text-black/40">Sent</div>
                  </div>
                  <div className="text-center bg-[#EAF1F8] rounded-lg p-2">
                    <div className="text-base font-bold text-[#0F172A]">{Math.round(c.opened/c.sent*100)}%</div>
                    <div className="text-[10px] text-black/40">Open Rate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeView === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {name:"Tender Invitation to Bid",category:"Procurement",uses:284,lastUsed:"2026-06-21"},
            {name:"Clarification Notice — Addendum",category:"Procurement",uses:142,lastUsed:"2026-06-19"},
            {name:"Non-Compliance Warning Letter",category:"Compliance",uses:48,lastUsed:"2026-06-17"},
            {name:"Contract Award Notification",category:"Awards",uses:84,lastUsed:"2026-06-15"},
            {name:"Supplier Forum Invitation",category:"Engagement",uses:12,lastUsed:"2026-06-18"},
            {name:"Invoice Payment Confirmation",category:"Finance",uses:326,lastUsed:"2026-06-20"},
          ].map(t=>(
            <div key={t.name} className="bg-white border border-black/8 rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-center gap-2 mb-2"><FileText className="h-4 w-4 text-slate-600 flex-shrink-0"/><div className="text-sm font-semibold text-black">{t.name}</div></div>
              <div className="flex items-center justify-between mb-3">
                <Badge tone="blue">{t.category}</Badge>
                <span className="text-[10px] text-black/40">Used {t.uses}×</span>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>onAction(`Using template: ${t.name}`)} className="flex-1 h-7 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center justify-center gap-1"><Send className="h-3 w-3"/> Use</button>
                <button onClick={()=>onAction(`Editing template: ${t.name}`)} className="h-7 px-2 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8]"><Edit3 className="h-3 w-3"/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeView === "agents" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-5">
            {[
              {name:"Communication Assistant Agent",desc:"Drafts emails, creates procurement notices, summarises discussion threads automatically",tasks:1842,accuracy:93},
              {name:"Supplier Engagement Agent",desc:"Answers common supplier questions, tracks engagement quality, monitors response satisfaction",tasks:3204,accuracy:91},
              {name:"Compliance Communication Agent",desc:"Ensures required regulatory wording is used in all official procurement communications",tasks:2841,accuracy:97},
              {name:"Meeting Intelligence Agent",desc:"Creates meeting minutes, extracts action items, tracks follow-up completion",tasks:484,accuracy:89},
            ].map(a=><AIAgentCard key={a.name} {...a} onRun={()=>onAction(`${a.name} activated`)}/>)}
          </div>
          <SectionTitle>Communication Automation Capabilities</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              {title:"Automated Notifications",desc:"Send alerts based on workflow events — bid submissions, approvals, award decisions",icon:Bell,color:"blue"},
              {title:"Reminder Automation",desc:"Follow up unanswered communications after configurable timeout periods",icon:Clock,color:"amber"},
              {title:"Escalation Workflow",desc:"Escalate overdue responses to supervisors with full audit trail",icon:AlertTriangle,color:"red"},
              {title:"Email Classification",desc:"AI categorises incoming messages by type, urgency and required action",icon:Tag,color:"violet"},
              {title:"Auto-Response Assistant",desc:"Handle common supplier queries instantly using knowledge base",icon:Cpu,color:"green"},
              {title:"Sentiment Analysis",desc:"Detect supplier frustration, compliance concerns and relationship risks",icon:Activity,color:"cyan"},
            ].map(f=><FeatureCard key={f.title} {...f}/>)}
          </div>
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 3 — TENDER GAZETTE PUBLISHER
// ══════════════════════════════════════════════════════════════════════════════

const GAZETTE_NOTICES = [
  { id:"GAZ-2026-0284", title:"Supply & Installation of Solar Mini-Grids — 12 Rural Clinics", entity:"Ministry of Energy", type:"Invitation to Bid", value:"USD 14,800,000", published:"2026-06-10", deadline:"2026-07-08", status:"Published", views:842 },
  { id:"GAZ-2026-0283", title:"Procurement of ARV Medicines (2-Year Framework)", entity:"Ministry of Health", type:"Invitation to Bid", value:"USD 42,500,000", published:"2026-06-01", deadline:"2026-06-12", status:"Closed", views:1204 },
  { id:"GAZ-2026-0282", title:"Contract Award — National Tax Administration System Phase II", entity:"ZIMRA", type:"Contract Award Notice", value:"USD 9,200,000", published:"2026-06-18", deadline:"N/A", status:"Published", views:624 },
  { id:"GAZ-2026-0281", title:"Rehabilitation of Beitbridge–Harare Highway Section 4", entity:"Ministry of Transport", type:"Invitation to Bid", value:"USD 88,000,000", published:"2026-06-15", deadline:"2026-08-04", status:"Published", views:3284 },
  { id:"GAZ-2026-0280", title:"Cancellation Notice — District Hospital Phase 2 Tender", entity:"Ministry of Health", type:"Cancellation Notice", value:"N/A", published:"2026-06-12", deadline:"N/A", status:"Published", views:284 },
  { id:"GAZ-2026-0279", title:"Amendment 1 — School Textbooks Grade 1–7 Tender", entity:"Ministry of Education", type:"Amendment Notice", value:"USD 6,700,000", published:"2026-06-08", deadline:"2026-07-02", status:"Published", views:482 },
  { id:"GAZ-2026-0278", title:"Expression of Interest — External Audit Consultancy Services", entity:"Office of Auditor-General", type:"EOI Notice", value:"USD 1,850,000", published:"2026-05-25", deadline:"2026-06-18", status:"Closed", views:924 },
];

function GazetteModule({ onAction }:{ onAction:(m:string)=>void }) {
  const [activeView, setActiveView] = useState<"notices"|"publish"|"portal"|"agents">("notices");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");

  const NOTICE_TYPES = ["Invitation to Bid","Contract Award Notice","Cancellation Notice","Amendment Notice","EOI Notice"];
  const filtered = GAZETTE_NOTICES.filter(n =>
    (filterType === "All" || n.type === filterType) &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.id.includes(search))
  );

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Published Notices (MTD)" value="48" delta="+4 from last month" icon={Newspaper} color="blue"/>
        <KpiCard label="Active Open Tenders" value="18" delta="USD 284M total" icon={FileText} color="green"/>
        <KpiCard label="Public Views (MTD)" value="84,200" delta="+8.4% engagement" icon={Eye} color="violet"/>
        <KpiCard label="Pending Publication" value="6" delta="2 urgent" positive={false} icon={Clock} color="amber"/>
      </div>

      <div className="flex gap-1 mb-5 border-b border-black/10">
        {(["notices","publish","portal","agents"] as const).map(v=>(
          <button key={v} onClick={()=>setActiveView(v)}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg capitalize transition-colors ${activeView===v?"bg-black text-white":"text-black/50 hover:text-black hover:bg-[#EAF1F8]"}`}>
            {v==="publish"?"Publishing Workflow":v==="agents"?"AI Agents":v.charAt(0).toUpperCase()+v.slice(1)}
          </button>
        ))}
      </div>

      {activeView === "notices" && (
        <>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search gazette notices…"
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none"/>
            </div>
            <select value={filterType} onChange={e=>setFilterType(e.target.value)} className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm">
              <option>All</option>
              {NOTICE_TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
            <button onClick={()=>onAction("New gazette notice drafted")} className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800"><Plus className="h-4 w-4"/> New Notice</button>
          </div>
          <Card className="mb-5">
            <CardHeader title={`Official Tender Gazette — ${filtered.length + 4276} notices`} action={
              <button onClick={()=>onAction("Gazette archive downloaded")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Archive className="h-3 w-3"/> Archive</button>
            }/>
            <div className="divide-y divide-black/5">
              {filtered.map(n=>(
                <div key={n.id} className="px-5 py-4 hover:bg-[#EAF1F8]/50">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-black leading-tight">{n.title}</div>
                      <div className="text-[11px] text-black/40 mt-0.5 font-mono">{n.id} · {n.entity}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge tone={n.type==="Contract Award Notice"?"green":n.type==="Cancellation Notice"?"red":n.type==="Amendment Notice"?"amber":"blue"}>
                        {n.type.replace(" Notice","").replace("Invitation to ","ITB - ")}
                      </Badge>
                      <Badge tone={n.status==="Published"?"green":"muted"}>{n.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-black/40 mb-2">
                    {n.value !== "N/A" && <span>Value: <span className="font-semibold text-black/60">{n.value}</span></span>}
                    <span>Published: {n.published}</span>
                    {n.deadline !== "N/A" && <span>Deadline: <span className="font-semibold text-black/60">{n.deadline}</span></span>}
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3"/> {n.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>onAction(`Viewing gazette: ${n.id}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3"/> View</button>
                    <button onClick={()=>onAction(`Downloaded: ${n.id}`)} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Download className="h-3 w-3"/> PDF</button>
                    {n.status === "Published" && <button onClick={()=>onAction(`Amendment drafted for: ${n.id}`)} className="h-7 px-2.5 rounded-lg border border-slate-200 text-[#0F172A] text-xs hover:bg-slate-50">Amend</button>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {activeView === "publish" && (
        <>
          <SectionTitle>Publishing Workflow</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-5">
            {["Draft Notice","Legal Review","Approval","Publish","Archive"].map((step,i)=>(
              <div key={step} className={`relative bg-white border rounded-xl p-4 text-center ${i<2?"border-slate-200 bg-slate-50":i===2?"border-slate-200 bg-slate-50":"border-black/10"}`}>
                <div className={`h-8 w-8 rounded-full mx-auto mb-2 grid place-items-center text-sm font-bold ${i<2?"bg-[#0F172A] text-white":i===2?"bg-[#0F172A] text-white":"bg-[#EAF1F8] text-black/40"}`}>{i+1}</div>
                <div className="text-xs font-semibold text-black">{step}</div>
                {i<2 && <div className="text-[10px] text-[#0F172A] mt-1">✓ Completed</div>}
                {i===2 && <div className="text-[10px] text-[#0F172A] mt-1">⏳ Pending</div>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader title="Pending Legal Review" subtitle="Notices awaiting compliance check"/>
              <div className="divide-y divide-black/5">
                {[
                  {title:"Construction of 4 District Hospitals",entity:"MOH",stage:"Legal Review",urgent:true},
                  {title:"Water Treatment Plant Upgrade Phase 2",entity:"MoWater",stage:"Legal Review",urgent:false},
                  {title:"Fertiliser Supply 2026/27 Season",entity:"MoAgri",stage:"Approval",urgent:false},
                ].map(p=>(
                  <div key={p.title} className="px-4 py-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-black">{p.title}</div>
                      <div className="text-[10px] text-black/40">{p.entity} · {p.stage}</div>
                    </div>
                    <div className="flex gap-2">
                      {p.urgent && <Badge tone="red">Urgent</Badge>}
                      <button onClick={()=>onAction(`Legal review completed: ${p.title}`)} className="h-7 px-2.5 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A]">Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <CardHeader title="Publication Schedule" subtitle="Upcoming gazette publications"/>
              <div className="divide-y divide-black/5">
                {[
                  {title:"Highway Section 4 — Bid Invitation",date:"2026-06-24",time:"09:00"},
                  {title:"Hospital Construction ITB",date:"2026-06-26",time:"08:00"},
                  {title:"Water Treatment Award Notice",date:"2026-06-28",time:"14:00"},
                ].map(s=>(
                  <div key={s.title} className="px-4 py-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-black">{s.title}</div>
                      <div className="text-[10px] text-black/40">{s.date} at {s.time}</div>
                    </div>
                    <button onClick={()=>onAction(`Published: ${s.title}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Send className="h-3 w-3"/> Publish</button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {activeView === "portal" && (
        <>
          <div className="bg-[#0F172A] border border-slate-200 rounded-2xl p-6 mb-5">
            <div className="flex items-center gap-3 mb-4">
              <Globe2 className="h-8 w-8 text-[#0F172A]"/>
              <div>
                <div className="text-base font-semibold text-black">Public Tender Gazette Portal</div>
                <div className="text-xs text-black/50">Zimbabwe Government e-Procurement Transparency Platform</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {[{label:"Open Tenders",value:"18"},{label:"Active Categories",value:"42"},{label:"Registered Subscribers",value:"14,204"},{label:"Downloads Today",value:"284"}].map(s=>(
                <div key={s.label} className="bg-white rounded-xl p-3 text-center border border-slate-200">
                  <div className="text-lg font-bold text-black">{s.value}</div>
                  <div className="text-[10px] text-black/40">{s.label}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>onAction("Public portal preview opened")} className="h-9 px-4 rounded-xl bg-[#0F172A] text-white text-sm font-medium flex items-center gap-2 hover:bg-[#0F172A]">
              <ExternalLink className="h-4 w-4"/> Preview Public Portal
            </button>
          </div>
        </>
      )}

      {activeView === "agents" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[
            {name:"Gazette Editor Agent",desc:"Drafts publications, checks formatting against official gazette standards, suggests corrections",tasks:842,accuracy:94},
            {name:"Tender Compliance Agent",desc:"Validates all regulatory requirements before publication — PPDPA compliance checks",tasks:1284,accuracy:98},
            {name:"Public Information Agent",desc:"Answers public tender questions using published gazette data and procurement records",tasks:3842,accuracy:92},
          ].map(a=><AIAgentCard key={a.name} {...a} onRun={()=>onAction(`${a.name} activated`)}/>)}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 4 — ANNOUNCEMENTS & DECISION OUTCOMES
// ══════════════════════════════════════════════════════════════════════════════

const ANNOUNCEMENTS = [
  { id:"ANN-2026-0142", title:"Award Decision — Beitbridge Highway Section 4", type:"Award Decision", entity:"Ministry of Transport", date:"2026-06-20", status:"Published", appealWindow:"14 days", value:"USD 88M" },
  { id:"ANN-2026-0141", title:"Policy Update — PPDPA Threshold Revision 2026", type:"Policy Announcement", entity:"PRAZ", date:"2026-06-18", status:"Published", appealWindow:"N/A", value:"N/A" },
  { id:"ANN-2026-0140", title:"Evaluation Outcome — ARV Framework Agreement", type:"Evaluation Outcome", entity:"Ministry of Health", date:"2026-06-15", status:"Published", appealWindow:"7 days remaining", value:"USD 42.5M" },
  { id:"ANN-2026-0139", title:"Supplier Suspension Notice — National Maintenance Corp", type:"Supplier Action", entity:"PRAZ", date:"2026-06-12", status:"Published", appealWindow:"Appeal Filed", value:"N/A" },
  { id:"ANN-2026-0138", title:"Internal Notice — Q3 2026 Procurement Plan Approved", type:"Internal Notice", entity:"CPO Office", date:"2026-06-10", status:"Pending Release", appealWindow:"N/A", value:"USD 284M" },
  { id:"ANN-2026-0137", title:"Budget Revision — Infrastructure Procurement Ceiling Increase", type:"Policy Announcement", entity:"Ministry of Finance", date:"2026-06-08", status:"Published", appealWindow:"N/A", value:"USD 120M" },
];

const DECISIONS_PENDING = [
  { tender:"ZW-PRA-2026-00184", title:"Solar Mini-Grids", recommended:"Precision Engineering Ltd", techScore:91, commScore:88, finalScore:90, evaluators:3, status:"Awaiting CPO Approval" },
  { tender:"ZW-PRA-2026-00178", title:"School Textbooks Grade 1–7", recommended:"Pending Evaluation", techScore:0, commScore:0, finalScore:0, evaluators:5, status:"Evaluation in Progress" },
];

function AnnouncementsModule({ onAction }:{ onAction:(m:string)=>void }) {
  const [activeView, setActiveView] = useState<"announcements"|"decisions"|"appeals"|"agents">("announcements");

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Decisions Pending" value="8" delta="3 overdue" positive={false} icon={Clock} color="amber"/>
        <KpiCard label="Awards Published (MTD)" value="14" delta="USD 84.2M value" icon={CheckCircle2} color="green"/>
        <KpiCard label="Avg Approval Time" value="3.8 days" delta="-0.4 days" icon={TrendingUp} color="blue"/>
        <KpiCard label="Active Appeals" value="3" delta="1 deadline today" positive={false} icon={AlertTriangle} color="red"/>
      </div>

      <div className="flex gap-1 mb-5 border-b border-black/10">
        {(["announcements","decisions","appeals","agents"] as const).map(v=>(
          <button key={v} onClick={()=>setActiveView(v)}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg capitalize transition-colors ${activeView===v?"bg-black text-white":"text-black/50 hover:text-black hover:bg-[#EAF1F8]"}`}>
            {v==="agents"?"AI Agents":v.charAt(0).toUpperCase()+v.slice(1)}
          </button>
        ))}
      </div>

      {activeView === "announcements" && (
        <>
          <div className="flex gap-2 mb-4">
            <button onClick={()=>onAction("New announcement drafted")} className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800"><Plus className="h-4 w-4"/> New Announcement</button>
          </div>
          <Card className="mb-5">
            <CardHeader title="Announcements & Decisions Register" subtitle="All official procurement announcements and decisions"/>
            <div className="divide-y divide-black/5">
              {ANNOUNCEMENTS.map(a=>(
                <div key={a.id} className="px-5 py-4 hover:bg-[#EAF1F8]/50">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-black leading-tight">{a.title}</div>
                      <div className="text-[11px] text-black/40 mt-0.5 font-mono">{a.id} · {a.entity} · {a.date}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge tone={a.type==="Award Decision"?"green":a.type==="Policy Announcement"?"blue":a.type==="Supplier Action"?"red":"violet"}>
                        {a.type}
                      </Badge>
                      <Badge tone={a.status==="Published"?"green":"amber"}>{a.status}</Badge>
                    </div>
                  </div>
                  {a.value!=="N/A" && <div className="text-[11px] text-black/50 mb-1">Value: <span className="font-semibold">{a.value}</span></div>}
                  {a.appealWindow!=="N/A" && <div className="text-[11px] text-[#0F172A] mb-2 font-medium">⚖ Appeal Window: {a.appealWindow}</div>}
                  <div className="flex gap-2">
                    <button onClick={()=>onAction(`Viewing: ${a.id}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3"/> View</button>
                    <button onClick={()=>onAction(`Downloaded: ${a.id}`)} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Download className="h-3 w-3"/> PDF</button>
                    {a.status==="Pending Release" && <button onClick={()=>onAction(`Published: ${a.title}`)} className="h-7 px-2.5 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A] flex items-center gap-1"><Send className="h-3 w-3"/> Publish</button>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {activeView === "decisions" && (
        <>
          <SectionTitle>Pending Decisions</SectionTitle>
          <div className="space-y-4 mb-5">
            {DECISIONS_PENDING.map(d=>(
              <Card key={d.tender}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="text-sm font-semibold text-black">{d.title}</div>
                      <div className="text-[11px] text-black/40 font-mono">{d.tender}</div>
                    </div>
                    <Badge tone={d.status==="Awaiting CPO Approval"?"amber":"blue"}>{d.status}</Badge>
                  </div>
                  {d.finalScore > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {[["Technical Score",d.techScore],["Commercial Score",d.commScore],["Final Weighted",d.finalScore]].map(([l,v])=>(
                        <div key={String(l)} className="bg-[#EAF1F8] rounded-xl p-3 text-center">
                          <div className="text-base font-bold text-black">{v}%</div>
                          <div className="text-[10px] text-black/40">{l}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {d.recommended!=="Pending Evaluation" && (
                    <div className="text-xs text-[#0F172A] font-semibold mb-3">✓ Recommended Awardee: {d.recommended}</div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={()=>onAction(`Award approved: ${d.recommended} for ${d.tender}`)} className="h-7 px-3 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A] flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Approve Award</button>
                    <button onClick={()=>onAction(`Decision deferred: ${d.tender}`)} className="h-7 px-3 rounded-lg border border-slate-200 text-[#0F172A] text-xs hover:bg-slate-50">Defer</button>
                    <button onClick={()=>onAction(`Evaluation queried: ${d.tender}`)} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8]">Query</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeView === "appeals" && (
        <Card>
          <CardHeader title="Appeals Register" subtitle="Formal procurement appeals and outcomes" action={
            <button onClick={()=>onAction("New appeal lodged")} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Plus className="h-3 w-3"/> Lodge Appeal</button>
          }/>
          <div className="divide-y divide-black/5">
            {[
              {id:"APL-2026-018",vendor:"Bulawayo Civil Works",against:"Award Decision GAZ-2026-0281",ground:"Evaluation scoring methodology",filed:"2026-06-19",deadline:"2026-07-03",status:"Under Review"},
              {id:"APL-2026-017",vendor:"Delta Transport Co",against:"Suspension Notice",ground:"Procedural non-compliance",filed:"2026-06-12",deadline:"2026-06-26",status:"Hearing Scheduled"},
              {id:"APL-2026-016",vendor:"ZimTech Consulting",against:"Award Decision GAZ-2026-0280",ground:"Conflict of interest allegation",filed:"2026-06-05",deadline:"2026-06-19",status:"Dismissed"},
            ].map(ap=>(
              <div key={ap.id} className="px-5 py-4 hover:bg-[#EAF1F8]/50">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <div className="text-sm font-semibold text-black">{ap.vendor}</div>
                    <div className="text-[11px] text-black/40">{ap.id} · Against: {ap.against}</div>
                  </div>
                  <Badge tone={ap.status==="Dismissed"?"muted":ap.status==="Hearing Scheduled"?"amber":"blue"}>{ap.status}</Badge>
                </div>
                <div className="text-xs text-black/60 mb-2">Ground: {ap.ground} · Deadline: {ap.deadline}</div>
                <div className="flex gap-2">
                  <button onClick={()=>onAction(`Appeal reviewed: ${ap.id}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3"/> Review</button>
                  {ap.status!=="Dismissed" && <button onClick={()=>onAction(`Decision issued: ${ap.id}`)} className="h-7 px-2.5 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A]">Issue Decision</button>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeView === "agents" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[
            {name:"Decision Analyst Agent",desc:"Summarises evaluation outcomes, generates decision memos with supporting evidence and rationale",tasks:284,accuracy:92},
            {name:"Transparency Agent",desc:"Creates public-facing explanations of procurement decisions in plain language for FOI compliance",tasks:142,accuracy:94},
            {name:"Notification Agent",desc:"Securely sends decisions to all affected parties via appropriate channels with delivery confirmation",tasks:842,accuracy:99},
          ].map(a=><AIAgentCard key={a.name} {...a} onRun={()=>onAction(`${a.name} activated`)}/>)}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 5 — PUBLIC INFORMATION & SEARCH RECORDS
// ══════════════════════════════════════════════════════════════════════════════

const PUBLIC_RECORDS = [
  { id:"REC-2026-1042", title:"Solar Mini-Grids Tender — Full Bid Document", category:"Tender Documents", entity:"MoEnergy", date:"2026-06-10", downloads:482, status:"Public", sensitivity:"Open" },
  { id:"REC-2026-1041", title:"ARV Framework Award Decision and Evaluation Report", category:"Award Records", entity:"MoHealth", date:"2026-06-15", downloads:284, status:"Public", sensitivity:"Open" },
  { id:"REC-2026-1040", title:"Beitbridge Highway Contract Register 2025/26", category:"Contract Records", entity:"MoTransport", date:"2026-05-30", downloads:842, status:"Public", sensitivity:"Open" },
  { id:"REC-2026-1039", title:"Q1 2026 Procurement Spend Report — All Entities", category:"Spend Reports", entity:"PRAZ", date:"2026-04-30", downloads:1284, status:"Public", sensitivity:"Open" },
  { id:"REC-2026-1038", title:"Vendor Blacklist Register — June 2026", category:"Supplier Records", entity:"PRAZ", date:"2026-06-01", downloads:624, status:"Restricted", sensitivity:"Restricted" },
  { id:"REC-2026-1037", title:"ZIMRA Tax System Phase I — Project Completion Report", category:"Project Records", entity:"ZIMRA", date:"2026-03-31", downloads:184, status:"Public", sensitivity:"Open" },
];

const SEARCH_STATS = [
  { month:"Jan", searches:8420, downloads:2840 },
  { month:"Feb", searches:9104, downloads:3120 },
  { month:"Mar", searches:8820, downloads:2960 },
  { month:"Apr", searches:10284, downloads:3480 },
  { month:"May", searches:11042, downloads:3840 },
  { month:"Jun", searches:9842, downloads:3280 },
];

function PublicRecordsModule({ onAction }:{ onAction:(m:string)=>void }) {
  const [activeView, setActiveView] = useState<"records"|"search"|"foi"|"agents">("records");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  const filtered = PUBLIC_RECORDS.filter(r=>
    (filterCat==="All"||r.category===filterCat) &&
    (r.title.toLowerCase().includes(search.toLowerCase())||r.id.includes(search))
  );

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Public Records" value="42,840" delta="+284 this month" icon={Globe2} color="blue"/>
        <KpiCard label="Searches (MTD)" value="9,842" delta="+8.4% engagement" icon={Search} color="green"/>
        <KpiCard label="Downloads (MTD)" value="3,280" delta="+6.2% YoY" icon={Download} color="violet"/>
        <KpiCard label="FOI Requests" value="18" delta="12 resolved" icon={FileText} color="amber"/>
      </div>

      <div className="flex gap-1 mb-5 border-b border-black/10">
        {(["records","search","foi","agents"] as const).map(v=>(
          <button key={v} onClick={()=>setActiveView(v)}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg capitalize transition-colors ${activeView===v?"bg-black text-white":"text-black/50 hover:text-black hover:bg-[#EAF1F8]"}`}>
            {v==="foi"?"FOI Requests":v==="agents"?"AI Agents":v.charAt(0).toUpperCase()+v.slice(1)}
          </button>
        ))}
      </div>

      {activeView === "records" && (
        <>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search public records…"
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none"/>
            </div>
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm">
              <option>All</option>
              {["Tender Documents","Award Records","Contract Records","Spend Reports","Supplier Records","Project Records"].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <Card className="mb-5">
            <CardHeader title={`Public Records Archive — ${filtered.length + 42834} records`} action={
              <button onClick={()=>onAction("Records search indexed")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><RefreshCw className="h-3 w-3"/> Re-Index</button>
            }/>
            <div className="divide-y divide-black/5">
              {filtered.map(r=>(
                <div key={r.id} className="px-5 py-3 hover:bg-[#EAF1F8]/50">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-black leading-tight truncate">{r.title}</div>
                      <div className="text-[11px] text-black/40 mt-0.5 font-mono">{r.id} · {r.entity} · {r.date}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge tone="blue">{r.category.split(" ")[0]}</Badge>
                      <Badge tone={r.sensitivity==="Open"?"green":"amber"}>{r.sensitivity}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[11px] text-black/40 flex items-center gap-1"><Download className="h-3 w-3"/> {r.downloads.toLocaleString()} downloads</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>onAction(`Viewing: ${r.id}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3"/> View</button>
                    {r.sensitivity==="Open" && <button onClick={()=>onAction(`Downloaded: ${r.id}`)} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Download className="h-3 w-3"/> Download</button>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {activeView === "search" && (
        <>
          <div className="bg-[#0F172A] border border-slate-200 rounded-2xl p-5 mb-5">
            <div className="text-sm font-semibold text-black mb-3">AI-Powered Semantic Search</div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30"/>
              <input placeholder="Search procurement records… e.g. 'infrastructure awards 2025 Harare'"
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20"/>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["Open Tenders","Contract Awards","Vendor Blacklist","Spend Reports","Appeal Decisions"].map(q=>(
                <button key={q} onClick={()=>onAction(`Searching: ${q}`)} className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs text-[#0F172A] hover:bg-slate-50 transition-colors">{q}</button>
              ))}
            </div>
          </div>
          <Card>
            <CardHeader title="Search Analytics" subtitle="Public engagement with procurement records"/>
            <div className="p-4 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SEARCH_STATS}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false}/>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                  <Tooltip contentStyle={{background:"white",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12}}/>
                  <Area dataKey="searches" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} name="Searches"/>
                  <Area dataKey="downloads" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.1} name="Downloads"/>
                  <Legend wrapperStyle={{fontSize:11}}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}

      {activeView === "foi" && (
        <Card>
          <CardHeader title="Freedom of Information Requests" subtitle="Public information requests and disclosure decisions" action={
            <button onClick={()=>onAction("FOI request received")} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Plus className="h-3 w-3"/> Log Request</button>
          }/>
          <div className="divide-y divide-black/5">
            {[
              {id:"FOI-2026-042",requester:"Zimbabwe Coalition on Debt",request:"All contract awards above USD 5M — FY2025/26",filed:"2026-06-18",due:"2026-07-02",status:"In Review"},
              {id:"FOI-2026-041",requester:"Zimbabwe Broadcasting Corporation",request:"Evaluation reports for Highway Section 4",filed:"2026-06-12",due:"2026-06-26",status:"Disclosure Approved"},
              {id:"FOI-2026-040",requester:"University of Zimbabwe",request:"Procurement spend by ministry 2022–2026",filed:"2026-05-28",due:"2026-06-12",status:"Completed"},
              {id:"FOI-2026-039",requester:"Anonymous",request:"Blacklisted vendor details",filed:"2026-06-10",due:"2026-06-24",status:"Partial Disclosure"},
            ].map(f=>(
              <div key={f.id} className="px-5 py-4 hover:bg-[#EAF1F8]/50">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <div className="text-sm font-semibold text-black">{f.requester}</div>
                    <div className="text-[11px] text-black/40">{f.id} · Filed: {f.filed} · Due: {f.due}</div>
                  </div>
                  <Badge tone={f.status==="Completed"?"muted":f.status.includes("Approved")?"green":f.status==="In Review"?"blue":"amber"}>{f.status}</Badge>
                </div>
                <div className="text-xs text-black/60 mb-2">Request: {f.request}</div>
                <div className="flex gap-2">
                  <button onClick={()=>onAction(`FOI reviewed: ${f.id}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3"/> Review</button>
                  {f.status==="In Review" && <button onClick={()=>onAction(`Disclosure approved: ${f.id}`)} className="h-7 px-2.5 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A]">Approve Disclosure</button>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeView === "agents" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[
            {name:"Public Search Assistant",desc:"Answers citizen queries about procurement records using natural language — 24/7 availability",tasks:42840,accuracy:92},
            {name:"Records Classification Agent",desc:"Categorises procurement records, applies retention tags, ensures metadata completeness",tasks:8420,accuracy:96},
            {name:"Disclosure Review Agent",desc:"Checks records for sensitive information before public release — redacts commercially sensitive data",tasks:1842,accuracy:98},
          ].map(a=><AIAgentCard key={a.name} {...a} onRun={()=>onAction(`${a.name} activated`)}/>)}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MODULE 6 — MEDIA BRIEFING MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

const MEDIA_BRIEFINGS = [
  { id:"BRF-2026-024", title:"Q2 2026 Procurement Performance Briefing", date:"2026-06-25", time:"10:00", venue:"PRAZ HQ — Conference Hall", attendees:18, status:"Scheduled", type:"Press Briefing" },
  { id:"BRF-2026-023", title:"Beitbridge Highway Contract Award Announcement", date:"2026-06-20", time:"14:00", venue:"Ministry of Transport Boardroom", attendees:12, status:"Completed", type:"Ministerial Statement" },
  { id:"BRF-2026-022", title:"Anti-Corruption Procurement Framework Launch", date:"2026-06-15", time:"09:00", venue:"State House Media Centre", attendees:24, status:"Completed", type:"Press Release" },
  { id:"BRF-2026-021", title:"PPDPA 2026 Amendment — Stakeholder Briefing", date:"2026-07-02", time:"11:00", venue:"PRAZ HQ — Conference Hall", attendees:0, status:"Planning", type:"Stakeholder Briefing" },
];

const MEDIA_COVERAGE = [
  { month:"Jan", positive:82, neutral:14, negative:4, articles:42 },
  { month:"Feb", positive:78, neutral:16, negative:6, articles:38 },
  { month:"Mar", positive:84, neutral:12, negative:4, articles:56 },
  { month:"Apr", positive:80, neutral:15, negative:5, articles:44 },
  { month:"May", positive:86, neutral:11, negative:3, articles:62 },
  { month:"Jun", positive:88, neutral:9, negative:3, articles:48 },
];

function MediaBriefingModule({ onAction }:{ onAction:(m:string)=>void }) {
  const [activeView, setActiveView] = useState<"briefings"|"database"|"content"|"analytics"|"agents">("briefings");

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <KpiCard label="Upcoming Briefings" value="4" delta="Next: June 25" icon={Calendar} color="blue"/>
        <KpiCard label="Media Contacts" value="284" delta="48 organisations" icon={Users} color="green"/>
        <KpiCard label="Coverage Volume (MTD)" value="48 articles" delta="+6 from last month" icon={Newspaper} color="violet"/>
        <KpiCard label="Sentiment Score" value="88% positive" delta="+2 pts" icon={Activity} color="amber"/>
      </div>

      <div className="flex gap-1 mb-5 border-b border-black/10">
        {(["briefings","database","content","analytics","agents"] as const).map(v=>(
          <button key={v} onClick={()=>setActiveView(v)}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg capitalize transition-colors ${activeView===v?"bg-black text-white":"text-black/50 hover:text-black hover:bg-[#EAF1F8]"}`}>
            {v==="database"?"Media Database":v==="agents"?"AI Agents":v.charAt(0).toUpperCase()+v.slice(1)}
          </button>
        ))}
      </div>

      {activeView === "briefings" && (
        <>
          <div className="flex gap-2 mb-4">
            <button onClick={()=>onAction("New media briefing scheduled")} className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800"><Plus className="h-4 w-4"/> Schedule Briefing</button>
            <button onClick={()=>onAction("Briefing pack generated by AI")} className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm font-medium hover:bg-[#EAF1F8] flex items-center gap-1.5"><Cpu className="h-4 w-4"/> Generate Pack</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {MEDIA_BRIEFINGS.map(b=>(
              <div key={b.id} className="bg-white border border-black/8 rounded-xl p-4 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-sm font-semibold text-black leading-tight">{b.title}</div>
                    <div className="text-[11px] text-black/40 mt-0.5">{b.id}</div>
                  </div>
                  <Badge tone={b.status==="Completed"?"muted":b.status==="Scheduled"?"green":"blue"}>{b.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-black/60">
                  <div className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {b.date} {b.time}</div>
                  <div className="flex items-center gap-1"><MapPin className="h-3 w-3 flex-shrink-0"/> {b.venue.split("—")[0].trim()}</div>
                  <div className="flex items-center gap-1"><Users className="h-3 w-3"/> {b.attendees} attendees</div>
                  <div><Badge tone="violet">{b.type}</Badge></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>onAction(`Briefing detail: ${b.id}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3"/> View</button>
                  {b.status==="Scheduled" && <>
                    <button onClick={()=>onAction(`Briefing pack for: ${b.id}`)} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><FileText className="h-3 w-3"/> Pack</button>
                    <button onClick={()=>onAction(`Invitations sent: ${b.id}`)} className="h-7 px-2.5 rounded-lg border border-slate-200 text-[#0F172A] text-xs hover:bg-slate-50 flex items-center gap-1"><Send className="h-3 w-3"/> Invite</button>
                  </>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeView === "database" && (
        <>
          <div className="flex gap-2 mb-4">
            <button onClick={()=>onAction("Media contact added")} className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800"><Plus className="h-4 w-4"/> Add Contact</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {name:"Tatenda Murwira",org:"ZBC News",beat:"Government & Procurement",contact:"t.murwira@zbc.co.zw",type:"TV",interactions:12},
              {name:"Simbai Ndlovu",org:"The Herald",beat:"Finance & Economy",contact:"s.ndlovu@herald.co.zw",type:"Print",interactions:8},
              {name:"Rudo Makoni",org:"NewsDay Zimbabwe",beat:"Governance",contact:"r.makoni@newsday.co.zw",type:"Online",interactions:6},
              {name:"Farai Chiremba",org:"Zimbabwe Independent",beat:"Investigations",contact:"f.chiremba@theindependent.co.zw",type:"Print",interactions:4},
              {name:"Blessing Chiwashira",org:"Bulawayo24",beat:"Local Government",contact:"b.chiwashira@byo24.com",type:"Online",interactions:3},
              {name:"Kudakwashe Samson",org:"Daily News",beat:"Business",contact:"k.samson@dailynews.co.zw",type:"Print",interactions:5},
            ].map(c=>(
              <div key={c.name} className="bg-white border border-black/8 rounded-xl p-4 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="h-8 w-8 rounded-full bg-black text-white text-xs font-semibold grid place-items-center flex-shrink-0">{c.name.split(" ").map(n=>n[0]).join("")}</div>
                  <Badge tone="blue">{c.type}</Badge>
                </div>
                <div className="text-sm font-semibold text-black">{c.name}</div>
                <div className="text-xs text-black/50">{c.org}</div>
                <div className="text-[11px] text-black/40 mt-1 mb-2">{c.beat}</div>
                <div className="text-[11px] text-[#0F172A] truncate mb-3">{c.contact}</div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-black/40">{c.interactions} interactions</span>
                  <button onClick={()=>onAction(`Contact: ${c.name}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Mail className="h-3 w-3"/> Contact</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeView === "content" && (
        <>
          <SectionTitle>Media Content Repository</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {[
              {type:"Press Releases",count:18,latest:"PRAZ — Q2 2026 Procurement Milestones",date:"2026-06-20"},
              {type:"Talking Points",count:24,latest:"Infrastructure Procurement — Key Achievements",date:"2026-06-18"},
              {type:"FAQs",count:84,latest:"Public Procurement Process — Citizens Guide",date:"2026-06-15"},
              {type:"Presentations",count:12,latest:"Digital Procurement Transformation 2026",date:"2026-06-22"},
            ].map(c=>(
              <div key={c.type} className="bg-white border border-black/8 rounded-xl p-4 hover:shadow-sm transition-all cursor-pointer" onClick={()=>onAction(`Opening content: ${c.type}`)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-black">{c.type}</div>
                  <Badge tone="blue">{c.count} items</Badge>
                </div>
                <div className="text-xs text-black/60 mb-1">Latest: {c.latest}</div>
                <div className="text-[10px] text-black/40">{c.date}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeView === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="Media Coverage Sentiment" subtitle="6-month sentiment trend (%)"/>
            <div className="p-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MEDIA_COVERAGE}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false}/>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} unit="%"/>
                  <Tooltip contentStyle={{background:"white",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12}} formatter={(v)=>`${v}%`}/>
                  <Bar dataKey="positive" fill="#10B981" radius={[3,3,0,0]} name="Positive"/>
                  <Bar dataKey="neutral" fill="#94a3b8" radius={[3,3,0,0]} name="Neutral"/>
                  <Bar dataKey="negative" fill="#DC2626" radius={[3,3,0,0]} name="Negative"/>
                  <Legend wrapperStyle={{fontSize:11}}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <CardHeader title="Coverage Volume" subtitle="Articles per month"/>
            <div className="p-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MEDIA_COVERAGE}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false}/>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                  <Tooltip contentStyle={{background:"white",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12}}/>
                  <Line dataKey="articles" stroke="#3B82F6" strokeWidth={2} dot={{fill:"#3B82F6",r:4}} name="Articles"/>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeView === "agents" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[
            {name:"Media Relations Agent",desc:"Drafts press communications, tailors messages by audience, maintains consistent tone of voice",tasks:284,accuracy:91},
            {name:"Briefing Preparation Agent",desc:"Creates comprehensive briefing packs, prepares Q&A, summarises key talking points",tasks:142,accuracy:93},
            {name:"Media Monitoring Agent",desc:"Tracks media coverage of procurement topics, sentiment analysis, identifies negative stories early",tasks:1842,accuracy:88},
            {name:"Question Intelligence Agent",desc:"Predicts journalist questions based on recent procurement events and media trends",tasks:84,accuracy:86},
          ].map(a=><AIAgentCard key={a.name} {...a} onRun={()=>onAction(`${a.name} activated`)}/>)}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function UtilityPage() {
  const { user } = useAuth();
  const [activeModule, setActiveModule] = useState<ModuleId>("catalogue");

  const handleAction = (msg: string) => {
    pushSeniorAlert(msg, "info", { from: user?.name, fromRole: user?.role ?? "officer", category: "action" });
    pushNotification(msg, "success");
  };

  const renderModule = () => {
    switch (activeModule) {
      case "catalogue":       return <CatalogueModule onAction={handleAction}/>;
      case "communications":  return <CommunicationsModule onAction={handleAction}/>;
      case "gazette":         return <GazetteModule onAction={handleAction}/>;
      case "announcements":   return <AnnouncementsModule onAction={handleAction}/>;
      case "public-records":  return <PublicRecordsModule onAction={handleAction}/>;
      case "media":           return <MediaBriefingModule onAction={handleAction}/>;
      default:                return null;
    }
  };

  const MODULE_LABELS: Record<ModuleId, string> = {
    catalogue: "Catalogue Management",
    communications: "Communications Management",
    gazette: "Tender Gazette Publisher",
    announcements: "Announcements & Decisions",
    "public-records": "Public Information & Records",
    media: "Media Briefing Management",
  };

  const MODULE_DESCS: Record<ModuleId, string> = {
    catalogue: "Central repository for all procurement items, services, pricing, specifications, and approved buying channels with AI-powered classification.",
    communications: "Manage all procurement-related internal and external communications — messages, campaigns, notifications and supplier engagement.",
    gazette: "Digitally publish procurement opportunities, bid notices, contract awards, amendments, cancellations and official procurement publications.",
    announcements: "Manage procurement announcements, award decisions, approvals, appeals and official procurement outcomes with full audit trail.",
    "public-records": "Public access to procurement information — tender documents, contract awards, spend reports and FOI requests with AI semantic search.",
    media: "Manage government procurement communications with media — briefings, press releases, journalist database and coverage monitoring.",
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="System"
        process="Utility Functions"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Utility Services</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
          <Badge tone="violet">6 Modules · Cross-Platform AI</Badge>
        </div>
        <PageHeader
          title="Procurement Utility Services"
          description="Supporting platform capabilities: catalogue, communications, gazette publishing, announcements, public transparency and media management."
          actions={
            <div className="flex gap-2">
              <button onClick={()=>handleAction("Executive utility dashboard report generated")}
                className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm font-medium hover:bg-[#EAF1F8] flex items-center gap-1.5 transition-colors">
                <Download className="h-4 w-4"/> <span className="hidden sm:inline">Export Report</span>
              </button>
              <button onClick={()=>handleAction("All utility AI agents activated")}
                className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800 transition-colors">
                <Zap className="h-4 w-4"/> Run AI Agents
              </button>
            </div>
          }
        />

        {/* Module Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {MODULES.map(mod=>{
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button key={mod.id} onClick={()=>setActiveModule(mod.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                  isActive ? "bg-black text-white border-black shadow-md" : "bg-white border-black/8 text-black/60 hover:border-black/20 hover:text-black hover:shadow-sm"
                }`}>
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive?"text-white":"text-black/50"}`}/>
                <span className={`text-xs font-semibold text-center leading-tight ${isActive?"text-white":"text-black"}`}>{mod.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Module Header */}
        <div className="mb-5 pb-4 border-b border-black/10">
          <div className="text-base font-semibold text-black">{MODULE_LABELS[activeModule]}</div>
          <div className="text-xs text-black/50 mt-0.5">{MODULE_DESCS[activeModule]}</div>
        </div>

        {/* Module Content */}
        {renderModule()}
      </div>
    </AppShell>
  );
}
