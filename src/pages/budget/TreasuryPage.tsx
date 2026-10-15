import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Wallet, TrendingUp, Activity, AlertTriangle, CheckCircle2, Clock, Lock, X } from "lucide-react";

const TIP = { contentStyle: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 } };

const CASH_FORECAST = [
  { day: "Day 1",  cash: 428 }, { day: "Day 7",  cash: 398 }, { day: "Day 14", cash: 362 },
  { day: "Day 21", cash: 345 }, { day: "Day 30", cash: 318 }, { day: "Day 45", cash: 412 },
  { day: "Day 60", cash: 445 }, { day: "Day 90", cash: 486 },
];

const ACCOUNTS = [
  { name: "Consolidated Revenue Fund",  balance: 212.4, currency: "USD", status: "Active",    type: "Treasury"  },
  { name: "Development Fund",           balance: 84.2,  currency: "USD", status: "Active",    type: "Development"},
  { name: "Reserve Bank — Main",        balance: 68.8,  currency: "USD", status: "Active",    type: "Central"   },
  { name: "Debt Servicing Account",     balance: 28.1,  currency: "USD", status: "Restricted",type: "Debt"      },
  { name: "Donor Project Account",      balance: 14.6,  currency: "USD", status: "Active",    type: "Donor"     },
  { name: "Capital Projects Reserve",   balance: 20.0,  currency: "USD", status: "Restricted",type: "Capital"   },
];

const PAYMENT_QUEUE = [
  { id:"PAY-2026-4821", payee:"Zimbabwe Pharma",       amount:8.4,  dept:"Health",    due:"2026-07-05", status:"Pending"  },
  { id:"PAY-2026-4820", payee:"Highveld Engineering",  amount:14.2, dept:"Transport", due:"2026-07-04", status:"Pending"  },
  { id:"PAY-2026-4819", payee:"Sable Press Ltd",       amount:2.1,  dept:"Education", due:"2026-07-03", status:"Approved" },
  { id:"PAY-2026-4818", payee:"Govt Salary Run Jul",   amount:84.0, dept:"All Depts", due:"2026-07-01", status:"Scheduled"},
  { id:"PAY-2026-4817", payee:"AFDB Debt Repayment",   amount:28.0, dept:"Finance",   due:"2026-07-15", status:"Pending"  },
];

const MONTHLY_FLOW = [
  { month: "Jan", inflows: 398, outflows: 360 },
  { month: "Feb", inflows: 412, outflows: 395 },
  { month: "Mar", inflows: 435, outflows: 410 },
  { month: "Apr", inflows: 401, outflows: 385 },
  { month: "May", inflows: 418, outflows: 402 },
  { month: "Jun", inflows: 422, outflows: 418 },
];

export default function TreasuryPage() {
  const [queue, setQueue] = useState(PAYMENT_QUEUE);
  const [scheduleForm, setScheduleForm] = useState({ payee:"", amount:"", date:"", dept:"" });
  const [showSchedule, setShowSchedule] = useState(false);
  const [forecast, setForecast] = useState<30|60|90>(30);

  function handleApprove(id: string) {
    setQueue(p => p.map(pay => pay.id===id ? {...pay, status:"Approved"} : pay));
    toast(`Payment ${id} approved for processing`, "success");
  }

  function handleHold(id: string) {
    setQueue(p => p.map(pay => pay.id===id ? {...pay, status:"On Hold"} : pay));
    toast(`Payment ${id} placed on hold`, "warning");
  }

  function handleScheduleSubmit() {
    if (!scheduleForm.payee || !scheduleForm.amount || !scheduleForm.date) { toast("Fill all required fields","warning"); return; }
    const newPay = {
      id: `PAY-2026-${String(queue.length+4822).padStart(4,"0")}`,
      payee: scheduleForm.payee, amount: Number(scheduleForm.amount),
      dept: scheduleForm.dept || "N/A", due: scheduleForm.date, status: "Scheduled",
    };
    setQueue(p => [newPay, ...p]);
    setShowSchedule(false);
    setScheduleForm({ payee:"", amount:"", date:"", dept:"" });
    toast(`Payment to ${scheduleForm.payee} scheduled for ${scheduleForm.date}`, "success");
  }

  const forecastData = CASH_FORECAST.filter((_,i) => {
    if (forecast===30) return i<=4;
    if (forecast===60) return i<=6;
    return true;
  });

  const totalBalance = ACCOUNTS.reduce((s,a)=>s+a.balance,0);
  const liquidityRatio = (totalBalance / 180).toFixed(1);

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Ministry of Finance & Economic Development"
        module="Budget Management"
        process="Treasury & Cash Management"
        financialYear="FY2026"
        pageType="workbench"
      />
      <PageHeader title="Treasury & Cash Management" subtitle="Cash position, liquidity, and payment authorisation" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total Cash Position" value={`USD ${totalBalance.toFixed(1)}M`} delta="Healthy" icon={Wallet}      color="green"  />
        <KpiCard label="30-Day Forecast"     value="USD 318M"     delta="-USD 110M outflow" icon={TrendingUp} color="blue"   />
        <KpiCard label="Liquidity Ratio"     value={`${liquidityRatio}x`} delta="Adequate"   icon={Activity}    color="cyan"   />
        <KpiCard label="Idle Cash Detected"  value="USD 124M"     delta="3 accounts"       icon={AlertTriangle} color="amber" positive={false} />
      </div>

      {/* Cash forecast chart */}
      <Card className="mb-6">
        <CardHeader title="Cash Flow Forecast" subtitle="Projected cash position (USD M)">
          <div className="flex gap-1">
            {([30,60,90] as const).map(d=>(
              <button key={d} onClick={()=>setForecast(d)}
                className={`h-7 px-3 text-xs rounded-lg border transition-colors ${forecast===d?"bg-black text-white border-black":"border-black/10 hover:bg-gray-50"}`}>{d} days</button>
            ))}
          </div>
        </CardHeader>
        <div className="p-4 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}M`} />
              <Tooltip {...TIP} formatter={(v:number)=>[`USD ${v}M`,"Cash Position"]} />
              <Area type="monotone" dataKey="cash" stroke="#334155" fill="#eff6ff" strokeWidth={2} name="Cash Position" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Bank accounts & monthly flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader title="Bank Account Balances" subtitle="All government accounts" />
          <div className="divide-y divide-black/5">
            {ACCOUNTS.map(a=>(
              <div key={a.name} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-black">{a.name}</div>
                  <div className="text-xs text-black/40 mt-0.5">{a.type} · {a.currency}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-black text-sm">{a.currency} {a.balance.toFixed(1)}M</div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${a.status==="Active"?"bg-slate-100 text-[#0F172A]":"bg-slate-100 text-[#0F172A]"}`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Monthly Cash Flow" subtitle="Inflows vs outflows (USD M)" />
          <div className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_FLOW}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}M`} />
                <Tooltip {...TIP} formatter={(v:number)=>[`USD ${v}M`]} />
                <Bar dataKey="inflows"  fill="#475569" radius={[3,3,0,0]} name="Inflows" />
                <Bar dataKey="outflows" fill="#334155" radius={[3,3,0,0]} name="Outflows" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Payment queue */}
      <Card>
        <CardHeader title="Payment Queue" subtitle="Pending payment authorisations">
          <button onClick={()=>setShowSchedule(true)} className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1.5 hover:bg-gray-800">
            Schedule Payment
          </button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-black/40 uppercase">
              <tr>{["Payment ID","Payee","Amount (M)","Department","Due Date","Status","Actions"].map(h=>(
                <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {queue.map(p=>(
                <tr key={p.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-mono text-[11px] text-black/40">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-black">{p.payee}</td>
                  <td className="px-4 py-3 font-semibold text-black">{p.amount.toFixed(1)}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{p.dept}</td>
                  <td className="px-4 py-3 text-xs text-black/50">{p.due}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      p.status==="Approved"?"bg-slate-100 text-[#0F172A]":
                      p.status==="Scheduled"?"bg-slate-100 text-[#0F172A]":
                      p.status==="On Hold"?"bg-red-100 text-red-700":
                      "bg-slate-100 text-[#0F172A]"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {p.status==="Pending" && <>
                        <button onClick={()=>handleApprove(p.id)} className="h-6 px-2 rounded border border-slate-200 bg-slate-50 text-[#0F172A] text-[11px] hover:bg-slate-100 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/>Approve</button>
                        <button onClick={()=>handleHold(p.id)} className="h-6 px-2 rounded border border-red-200 bg-red-50 text-red-700 text-[11px] hover:bg-red-100 flex items-center gap-1"><Lock className="h-3 w-3"/>Hold</button>
                      </>}
                      {p.status==="Scheduled" && <span className="text-xs text-black/30 flex items-center gap-1"><Clock className="h-3 w-3"/>Queued</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Schedule payment modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-black">Schedule Payment</h2>
              <button onClick={()=>setShowSchedule(false)} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-gray-100"><X className="h-4 w-4"/></button>
            </div>
            <div className="space-y-3">
              {[
                {label:"Payee *",           key:"payee",  type:"text",   ph:"e.g. Ministry of Health"},
                {label:"Amount (USD M) *",  key:"amount", type:"number", ph:"e.g. 12"},
                {label:"Payment Date *",    key:"date",   type:"date",   ph:""},
                {label:"Department",        key:"dept",   type:"text",   ph:"e.g. Clinical Services"},
              ].map(f=>(
                <div key={f.key}>
                  <label className="text-xs font-medium text-black/60 mb-1 block">{f.label}</label>
                  <input type={f.type} className="w-full h-9 rounded-lg border border-black/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    value={(scheduleForm as Record<string,string>)[f.key]}
                    onChange={e=>setScheduleForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={()=>setShowSchedule(false)} className="flex-1 h-9 rounded-lg border border-black/10 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleScheduleSubmit} className="flex-1 h-9 rounded-lg bg-black text-white text-sm hover:bg-gray-800">Schedule</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
