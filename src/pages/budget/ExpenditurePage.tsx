import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import {
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { DollarSign, Clock, TrendingUp, Download, Calendar, X } from "lucide-react";

const C = ["#334155","#475569","#64748B","#334155","#DC2626","#334155"];
const TIP = { contentStyle: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 } };

const TREND = [
  { month: "Jan", amount: 280 }, { month: "Feb", amount: 310 }, { month: "Mar", amount: 340 },
  { month: "Apr", amount: 295 }, { month: "May", amount: 360 }, { month: "Jun", amount: 425 },
];

const CATEGORIES = [
  { name: "Salaries & Benefits", value: 38 },
  { name: "Capital Projects",    value: 24 },
  { name: "Goods & Services",    value: 19 },
  { name: "Transfers & Grants",  value: 12 },
  { name: "Debt Servicing",      value: 7  },
];

const TOP_DEPTS = [
  { name: "Clinical Services",    spend: 186, budget: 280 },
  { name: "Infrastructure Div",   spend: 214, budget: 320 },
  { name: "Primary Education",    spend: 122, budget: 210 },
  { name: "Irrigation Projects",  spend: 74,  budget: 180 },
  { name: "Rural Electrification",spend: 108, budget: 190 },
  { name: "Treasury Operations",  spend: 98,  budget: 140 },
  { name: "ZIMRA",                spend: 88,  budget: 180 },
  { name: "Roads Dept",           spend: 64,  budget: 120 },
  { name: "Agric Extension",      spend: 52,  budget: 90  },
  { name: "Water Utilities",      spend: 44,  budget: 80  },
];

const MINISTRY_PROGRESS = [
  { ministry: "Health",     approved: 820, spent: 542 },
  { ministry: "Transport",  approved: 640, spent: 381 },
  { ministry: "Education",  approved: 510, spent: 289 },
  { ministry: "Agriculture",approved: 430, spent: 198 },
  { ministry: "Energy",     approved: 380, spent: 201 },
];

export default function ExpenditurePage() {
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate]     = useState("2026-06-30");
  const [drillItem, setDrillItem] = useState<string | null>(null);

  function handleExportCSV() {
    const headers = ["Department","Spend (USD M)","Budget (USD M)","% Used"];
    const rows = TOP_DEPTS.map(d=>[d.name, d.spend, d.budget, Math.round((d.spend/d.budget)*100)+"%"]);
    const csv = [headers, ...rows].map(r=>r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "expenditure.csv"; a.click();
    URL.revokeObjectURL(url);
    toast("Expenditure report exported to CSV", "success");
  }

  function handleExportExcel() {
    toast("Expenditure Excel export queued — download will start shortly", "info");
  }

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Ministry of Finance & Economic Development"
        module="Budget Management"
        process="Expenditure Management"
        financialYear="FY2026"
        pageType="workbench"
      />
      <PageHeader title="Expenditure Tracking" subtitle="National expenditure analysis and payment monitoring" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total Payments YTD" value="USD 2.01B" delta="+6.2%" icon={DollarSign} color="blue"  />
        <KpiCard label="Pending Payments"   value="84"       delta="USD 42M"   icon={Clock}      color="amber" />
        <KpiCard label="Monthly Avg Spend"  value="USD 335M" delta="vs budget 355M" icon={TrendingUp} color="green" />
        <KpiCard label="YTD Savings"        value="USD 184M" delta="+11.4%"    icon={DollarSign} color="cyan"  />
      </div>

      {/* Date filter + export */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-black/40"/>
            <div>
              <label className="text-xs font-medium text-black/60 block mb-1">From</label>
              <input type="date" className="h-9 rounded-lg border border-black/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                value={startDate} onChange={e=>setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-black/60 block mb-1">To</label>
              <input type="date" className="h-9 rounded-lg border border-black/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                value={endDate} onChange={e=>setEndDate(e.target.value)} />
            </div>
            <button onClick={()=>toast(`Filtering from ${startDate} to ${endDate}`,"info")}
              className="mt-4 h-9 px-4 rounded-lg bg-black text-white text-sm hover:bg-gray-800">Apply Filter</button>
          </div>
          <div className="flex gap-2 sm:ml-auto">
            <button onClick={handleExportCSV} className="h-9 px-4 rounded-lg border border-black/10 text-sm flex items-center gap-2 hover:bg-gray-50">
              <Download className="h-4 w-4"/>CSV
            </button>
            <button onClick={handleExportExcel} className="h-9 px-4 rounded-lg border border-black/10 text-sm flex items-center gap-2 hover:bg-gray-50">
              <Download className="h-4 w-4"/>Excel
            </button>
          </div>
        </div>
      </Card>

      {/* Trend chart */}
      <Card className="mb-6">
        <CardHeader title="Monthly Expenditure Trend" subtitle="Total payments per month (USD M)" />
        <div className="p-4 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TREND}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}M`} />
              <Tooltip {...TIP} formatter={(v:number)=>[`USD ${v}M`,"Expenditure"]} />
              <Area type="monotone" dataKey="amount" stroke="#334155" fill="#eff6ff" strokeWidth={2} name="Expenditure" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Category pie + payment types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader title="Expenditure by Category" subtitle="Click segment to drill down" />
          <div className="p-4 h-[260px] flex flex-col gap-3">
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={CATEGORIES} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" nameKey="name"
                    onClick={d=>setDrillItem(d.name)}>
                    {CATEGORIES.map((_,i)=><Cell key={i} fill={C[i%C.length]} cursor="pointer"/>)}
                  </Pie>
                  <Tooltip {...TIP} formatter={(v:number)=>[`${v}%`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1">
              {CATEGORIES.map((d,i)=>(
                <div key={d.name} className="flex items-center justify-between text-xs cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded"
                  onClick={()=>setDrillItem(d.name)}>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{backgroundColor:C[i%C.length]}}/>
                    <span className="text-black/60">{d.name}</span>
                  </div>
                  <span className="font-semibold text-black">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Budget vs Spent by Ministry" subtitle="Progress bars (USD M)" />
          <div className="divide-y divide-black/5">
            {MINISTRY_PROGRESS.map(m=>{
              const pct = Math.round((m.spent/m.approved)*100);
              return (
                <div key={m.ministry} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-black">{m.ministry}</span>
                    <span className="text-xs font-bold text-black/60">{pct}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${pct>=85?"bg-[#0F172A]":"bg-[#0F172A]"}`} style={{width:`${pct}%`}}/>
                    </div>
                    <span className="text-xs text-black/40 w-28 text-right">{m.spent}M / {m.approved}M</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top 10 spending departments */}
      <Card>
        <CardHeader title="Top 10 Spending Departments" subtitle="YTD expenditure vs approved budget (USD M)" />
        <div className="p-4 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={TOP_DEPTS} layout="vertical">
              <CartesianGrid stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}M`} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} width={130} />
              <Tooltip {...TIP} formatter={(v:number)=>[`USD ${v}M`]} />
              <Bar dataKey="budget" fill="#e2e8f0" radius={[0,3,3,0]} name="Budget" />
              <Bar dataKey="spend"  fill="#334155" radius={[0,3,3,0]} name="Spent" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Drill-down modal */}
      {drillItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-black">Drill-down: {drillItem}</h2>
              <button onClick={()=>setDrillItem(null)} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-gray-100"><X className="h-4 w-4"/></button>
            </div>
            <div className="space-y-3 text-sm">
              {["Ministry of Health","Ministry of Finance","Ministry of Transport","Ministry of Education"].map((m,i)=>(
                <div key={m} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <span className="font-medium text-black">{m}</span>
                  <span className="font-bold text-black">USD {[42,28,18,14][i]}M</span>
                </div>
              ))}
            </div>
            <button onClick={()=>setDrillItem(null)} className="w-full mt-5 h-9 rounded-lg border border-black/10 text-sm hover:bg-gray-50">Close</button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
