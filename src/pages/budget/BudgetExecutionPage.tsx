import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle2, Clock, DollarSign, Calendar } from "lucide-react";

const TIP = { contentStyle: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 } };

const BURN_DATA = [
  { month: "Jan", budget: 850, actual: 620 },
  { month: "Feb", budget: 850, actual: 680 },
  { month: "Mar", budget: 850, actual: 720 },
  { month: "Apr", budget: 850, actual: 760 },
  { month: "May", budget: 850, actual: 810 },
  { month: "Jun", budget: 850, actual: 855 },
  { month: "Jul", budget: 850, actual: 0   },
  { month: "Aug", budget: 850, actual: 0   },
  { month: "Sep", budget: 850, actual: 0   },
];

const MONTHLY = [
  { month: "Jan", approved: 120, spent: 98, committed: 14, variance: 8  },
  { month: "Feb", approved: 120, spent: 104,committed: 12, variance: 4  },
  { month: "Mar", approved: 120, spent: 112,committed: 8,  variance: 0  },
  { month: "Apr", approved: 120, spent: 108,committed: 10, variance: 2  },
  { month: "May", approved: 120, spent: 115,committed: 4,  variance: 1  },
  { month: "Jun", approved: 120, spent: 122,committed: 0,  variance: -2 },
];

const DEPT_STATUS = [
  { dept: "Clinical Services",    pct: 82, status: "On Track",   burnRate: "USD 31M/mo" },
  { dept: "Infrastructure Div",   pct: 88, status: "Warning",    burnRate: "USD 45M/mo" },
  { dept: "Primary Education",    pct: 71, status: "On Track",   burnRate: "USD 21M/mo" },
  { dept: "Irrigation Projects",  pct: 51, status: "On Track",   burnRate: "USD 12M/mo" },
  { dept: "Rural Electrification",pct: 70, status: "On Track",   burnRate: "USD 18M/mo" },
  { dept: "Treasury Operations",  pct: 101,status: "Overrun",    burnRate: "USD 28M/mo" },
];

function statusBadge(s: string) {
  if (s === "Overrun") return "bg-red-100 text-red-700 border border-red-200";
  if (s === "Warning") return "bg-slate-100 text-[#0F172A] border border-slate-200";
  return "bg-slate-100 text-[#0F172A] border border-slate-200";
}

function barColor(p: number) {
  if (p >= 100) return "bg-red-500";
  if (p >= 85)  return "bg-[#0F172A]";
  return "bg-[#0F172A]";
}

export default function BudgetExecutionPage() {
  const [realloc, setRealloc] = useState({ from: "", to: "", amount: "" });
  const [showRealloc, setShowRealloc] = useState(false);

  function handleRealloc() {
    if (!realloc.from || !realloc.to || !realloc.amount) { toast("Please fill all fields","warning"); return; }
    toast(`Reallocation of USD ${realloc.amount}M from ${realloc.from} to ${realloc.to} submitted for approval`,"success");
    setShowRealloc(false);
    setRealloc({ from:"", to:"", amount:"" });
  }

  const daysRemaining = 184;
  const budgetUtil = 57.2;

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Ministry of Finance & Economic Development"
        module="Budget Management"
        process="Budget Execution"
        financialYear="FY2026"
        pageType="workbench"
      />
      <PageHeader title="Budget Execution" subtitle="Real-time monitoring of national budget utilisation" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Budget Utilized %"  value={`${budgetUtil}%`} delta="On track" icon={Activity}     color="blue"   />
        <KpiCard label="Monthly Burn Rate"  value="USD 335M/mo" delta="+4.1% MoM"   icon={TrendingDown}  color="amber"  />
        <KpiCard label="Year-end Forecast"  value="USD 3.62B"   delta="+USD 110M over" icon={TrendingUp} color="red" positive={false} />
        <KpiCard label="Days Remaining"     value={String(daysRemaining)} delta="FY2026"  icon={Calendar}    color="cyan"   />
      </div>

      {/* Burn rate chart */}
      <Card className="mb-6">
        <CardHeader title="Budget Burn Rate — FY2026" subtitle="Actual vs approved budget (USD M) — monthly cumulative" />
        <div className="p-4 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={BURN_DATA}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}M`} />
              <Tooltip {...TIP} formatter={(v:number)=>[`USD ${v}M`]} />
              <Area type="monotone" dataKey="budget" stroke="#e2e8f0" fill="#f8fafc" strokeWidth={1.5} name="Budget" />
              <Area type="monotone" dataKey="actual" stroke="#334155" fill="#eff6ff" strokeWidth={2} name="Actual" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Monthly breakdown & dept status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader title="Monthly Breakdown" subtitle="Approved vs spent vs committed (USD M)" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}M`} />
                <Tooltip {...TIP} formatter={(v:number)=>[`USD ${v}M`]} />
                <Bar dataKey="approved"  fill="#e2e8f0" radius={[3,3,0,0]} name="Approved" />
                <Bar dataKey="spent"     fill="#334155" radius={[3,3,0,0]} name="Spent" />
                <Bar dataKey="committed" fill="#64748B" radius={[3,3,0,0]} name="Committed" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Department Execution Status" subtitle="Budget utilisation per department">
            <button onClick={()=>setShowRealloc(true)} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800">Request Reallocation</button>
          </CardHeader>
          <div className="divide-y divide-black/5">
            {DEPT_STATUS.map(d=>(
              <div key={d.dept} className="px-5 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-black truncate">{d.dept}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ml-2 flex-shrink-0 ${statusBadge(d.status)}`}>{d.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className={`h-full rounded-full ${barColor(d.pct)}`} style={{width:`${Math.min(d.pct,100)}%`}}/>
                    </div>
                    <span className="text-xs font-bold text-black/70 w-10 text-right">{d.pct}%</span>
                  </div>
                  <div className="text-[11px] text-black/40 mt-0.5">{d.burnRate}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Variance alerts */}
      <Card>
        <CardHeader title="Variance Alerts" subtitle="Over / under spending alerts requiring attention" />
        <div className="divide-y divide-black/5">
          {[
            { level: "red",   dept: "Treasury Operations", msg: "Budget overrun: 101% utilisation. Spending exceeds approved ceiling by USD 1.2M. Immediate action required.", action: "Freeze" },
            { level: "amber", dept: "Infrastructure Div",  msg: "Warning: 88% utilisation with 184 days remaining. Year-end overrun risk if burn rate continues.", action: "Review" },
            { level: "blue",  dept: "Irrigation Projects", msg: "Under-utilisation: only 51% spent with fiscal year past midpoint. Budget release schedule review needed.", action: "Investigate" },
          ].map((a,i)=>(
            <div key={i} className={`px-5 py-4 flex items-start justify-between gap-4 border-l-4 ${a.level==="red"?"border-red-400":a.level==="amber"?"border-slate-200":"border-slate-200"}`}>
              <div>
                <div className="text-sm font-semibold text-black">{a.dept}</div>
                <div className="text-xs text-black/50 mt-0.5 leading-relaxed">{a.msg}</div>
              </div>
              <button onClick={()=>toast(`${a.action} action initiated for ${a.dept}`,"info")}
                className={`h-7 px-3 rounded-lg text-xs flex-shrink-0 font-medium ${a.level==="red"?"bg-red-600 text-white hover:bg-red-700":a.level==="amber"?"bg-slate-100 text-[#0F172A] hover:bg-slate-200":"bg-slate-100 text-[#0F172A] hover:bg-slate-200"}`}>
                {a.action}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Reallocation modal */}
      {showRealloc && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-black">Budget Reallocation Request</h2>
              <button onClick={()=>setShowRealloc(false)} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-gray-100 text-black/40">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-black/60 mb-1 block">From Department *</label>
                <select className="w-full h-9 rounded-lg border border-black/10 px-3 text-sm focus:outline-none bg-white"
                  value={realloc.from} onChange={e=>setRealloc(p=>({...p,from:e.target.value}))}>
                  <option value="">Select…</option>
                  {DEPT_STATUS.map(d=><option key={d.dept}>{d.dept}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-black/60 mb-1 block">To Department *</label>
                <select className="w-full h-9 rounded-lg border border-black/10 px-3 text-sm focus:outline-none bg-white"
                  value={realloc.to} onChange={e=>setRealloc(p=>({...p,to:e.target.value}))}>
                  <option value="">Select…</option>
                  {DEPT_STATUS.map(d=><option key={d.dept}>{d.dept}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-black/60 mb-1 block">Amount (USD M) *</label>
                <input type="number" className="w-full h-9 rounded-lg border border-black/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  value={realloc.amount} onChange={e=>setRealloc(p=>({...p,amount:e.target.value}))} placeholder="e.g. 5" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={()=>setShowRealloc(false)} className="flex-1 h-9 rounded-lg border border-black/10 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleRealloc} className="flex-1 h-9 rounded-lg bg-black text-white text-sm hover:bg-gray-800">Submit Reallocation</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
