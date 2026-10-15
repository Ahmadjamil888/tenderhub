import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Target, CheckCircle2, TrendingDown, Flag, AlertTriangle, TrendingUp } from "lucide-react";

const C = ["#334155","#475569","#64748B","#334155","#DC2626","#334155"];
const TIP = { contentStyle: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 } };

const MONTHLY = [
  { month: "Jan", target: 420, actual: 398 },
  { month: "Feb", target: 420, actual: 412 },
  { month: "Mar", target: 420, actual: 435 },
  { month: "Apr", target: 420, actual: 401 },
  { month: "May", target: 420, actual: 418 },
  { month: "Jun", target: 420, actual: 422 },
];

const BY_SOURCE = [
  { name: "Corporate Tax",         value: 840 },
  { name: "Individual Tax",        value: 620 },
  { name: "VAT",                   value: 480 },
  { name: "Customs & Excise",      value: 310 },
  { name: "Non-Tax Revenue",       value: 180 },
  { name: "Grants & Donations",    value: 84  },
];

const AGENCIES = [
  { name: "ZIMRA",          target: 2120, actual: 2094, rate: 98.8 },
  { name: "ZINARA",         target: 180,  actual: 162,  rate: 90.0 },
  { name: "Dept of Mines",  target: 120,  actual: 108,  rate: 90.0 },
  { name: "Local Authorities",target: 80, actual: 70,   rate: 87.5 },
  { name: "Other",          target: 40,  actual: 56,   rate: 140  },
];

const TOP_SOURCES = [
  { source: "Corporate Income Tax",   ytd: 840,  target: 920  },
  { source: "PAYE (Individual)",      ytd: 620,  target: 680  },
  { source: "VAT Collections",        ytd: 480,  target: 520  },
  { source: "Customs Duties",         ytd: 310,  target: 340  },
  { source: "Mining Royalties",       ytd: 220,  target: 200  },
  { source: "Road User Charges",      ytd: 162,  target: 180  },
  { source: "Government Fees",        ytd: 88,   target: 90   },
  { source: "Dividend Income",        ytd: 64,   target: 60   },
  { source: "Grant — World Bank",     ytd: 42,   target: 42   },
  { source: "Grant — AFDB",           ytd: 28,   target: 28   },
];

export default function RevenuePage() {
  const totalTarget = 2520;
  const totalCollected = 2490;
  const rate = ((totalCollected/totalTarget)*100).toFixed(1);
  const shortfall = totalTarget - totalCollected;

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Ministry of Finance & Economic Development"
        module="Budget Management"
        process="Revenue Management"
        financialYear="FY2026"
        pageType="workbench"
      />
      <PageHeader title="Revenue Management" subtitle="National revenue collection, monitoring, and forecasting" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Revenue Target"    value={`USD ${totalTarget/1000}B`}   icon={Target}       color="blue"  />
        <KpiCard label="Collected YTD"     value={`USD ${totalCollected/1000}B`} delta={`${rate}%`} icon={CheckCircle2} color="green" />
        <KpiCard label="Collection Rate %"  value={`${rate}%`}                   delta="vs 95% target" icon={TrendingUp} color="cyan" />
        <KpiCard label="Shortfall"         value={`USD ${shortfall}M`}           delta="below target" icon={TrendingDown} color="amber" positive={false} />
      </div>

      {/* Monthly trend */}
      <Card className="mb-6">
        <CardHeader title="Revenue vs Target — Monthly" subtitle="Actual vs target (USD M)" />
        <div className="p-4 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MONTHLY}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}M`} />
              <Tooltip {...TIP} formatter={(v:number)=>[`USD ${v}M`]} />
              <Area type="monotone" dataKey="target" stroke="#e2e8f0" fill="#f8fafc" strokeWidth={1.5} name="Target" />
              <Area type="monotone" dataKey="actual" stroke="#475569" fill="#ecfdf5" strokeWidth={2} name="Collected" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader title="Revenue by Source" subtitle="YTD (USD M)" />
          <div className="p-4 h-[250px] flex flex-col gap-3">
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={BY_SOURCE} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="value" nameKey="name">
                    {BY_SOURCE.map((_,i)=><Cell key={i} fill={C[i%C.length]}/>)}
                  </Pie>
                  <Tooltip {...TIP} formatter={(v:number)=>[`USD ${v}M`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {BY_SOURCE.map((d,i)=>(
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{backgroundColor:C[i%C.length]}}/>
                  <span className="text-black/60 truncate">{d.name}</span>
                  <span className="font-semibold text-black ml-auto">{d.value}M</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Agency Collection Rate" subtitle="Target vs actual by collecting agency (USD M)" />
          <div className="p-4 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={AGENCIES}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}M`} />
                <Tooltip {...TIP} formatter={(v:number)=>[`USD ${v}M`]} />
                <Bar dataKey="target" fill="#e2e8f0" radius={[3,3,0,0]} name="Target" />
                <Bar dataKey="actual" fill="#475569" radius={[3,3,0,0]} name="Collected" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top 10 sources */}
      <Card className="mb-6">
        <CardHeader title="Top 10 Revenue Sources" subtitle="YTD vs annual target (USD M)" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-black/40 uppercase">
              <tr>{["Source","YTD (M)","Target (M)","% Achieved","Status"].map(h=>(
                <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {TOP_SOURCES.map(s=>{
                const pct = Math.round((s.ytd/s.target)*100);
                return (
                  <tr key={s.source} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-medium text-black">{s.source}</td>
                    <td className="px-4 py-3 font-semibold text-black">{s.ytd}</td>
                    <td className="px-4 py-3 text-black/60">{s.target}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className={`h-full rounded-full ${pct>=100?"bg-[#0F172A]":pct>=85?"bg-[#0F172A]":"bg-[#0F172A]"}`} style={{width:`${Math.min(pct,100)}%`}}/>
                        </div>
                        <span className="text-xs font-semibold">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${pct>=100?"bg-slate-100 text-[#0F172A]":pct>=85?"bg-slate-100 text-[#0F172A]":"bg-slate-100 text-[#0F172A]"}`}>
                        {pct>=100?"On Target":pct>=85?"Near Target":"Below Target"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Arrears & AI intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Outstanding Revenue (Arrears)" subtitle="Amounts not yet collected" />
          <div className="divide-y divide-black/5">
            {[
              { type: "Corporate Tax Arrears", amount: "USD 84M",  age: "30-90 days",   action: "Dunning letters sent" },
              { type: "VAT Refund Overpaid",   amount: "USD 28M",  age: "90-180 days",  action: "Under investigation" },
              { type: "Mining Royalties Overdue",amount: "USD 18M",age: "> 180 days",   action: "Legal action pending" },
              { type: "Road Levy Short Collection",amount:"USD 12M",age:"60 days",      action: "ZINARA audit ordered" },
            ].map((a,i)=>(
              <div key={i} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black">{a.type}</span>
                  <span className="font-bold text-red-600 text-sm">{a.amount}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-black/40">Age: {a.age}</span>
                  <button onClick={()=>toast(`Action taken: ${a.action}`,"info")} className="text-xs text-[#0F172A] hover:underline">{a.action}</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Revenue Intelligence" subtitle="AI-powered forecasts and alerts" />
          <div className="p-4 space-y-3">
            {[
              { color:"text-red-500 bg-red-50",     icon: AlertTriangle, title:"Leakage Detected",      msg:"Under-billing on ICT licensing fees. Estimated leakage: USD 4.2M. Immediate billing audit recommended." },
              { color:"text-[#0F172A] bg-slate-50", icon: TrendingDown,  title:"Collection Drop Alert", msg:"Road levy collection efficiency fell from 94% to 87% in May. ZINARA process under review." },
              { color:"text-[#0F172A] bg-slate-50",   icon: Target,        title:"Q3 Shortfall Risk",     msg:"Revenue AI forecasts Q3 shortfall of USD 18M if current trends persist. Proactive measures advised." },
              { color:"text-[#0F172A] bg-slate-50",icon:Flag,         title:"Tax Compliance Up",    msg:"Corporate tax compliance improved 3.2% this quarter. ZIMRA AI enforcement credited." },
            ].map((item,i)=>(
              <div key={i} className="flex gap-3 p-3 rounded-xl border border-black/5 bg-gray-50/50">
                <div className={`h-7 w-7 rounded-lg grid place-items-center flex-shrink-0 ${item.color}`}>
                  <item.icon className="h-3.5 w-3.5"/>
                </div>
                <div>
                  <div className="text-xs font-semibold text-black mb-0.5">{item.title}</div>
                  <div className="text-xs text-black/50 leading-relaxed">{item.msg}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
