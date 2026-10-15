import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { AlertTriangle, Shield, Eye, Lock, ShieldCheck, CheckCircle2, X, Activity } from "lucide-react";

const C = ["#DC2626","#475569","#64748B","#334155","#475569"];
const TIP = { contentStyle: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 } };

const INIT_ALERTS = [
  { id:"FA-2026-041", type:"Ghost Vendor",           dept:"Transport",    amount:"USD 240K",  risk:"Critical", status:"Frozen",        pattern:"Vendor registered same day as invoice; no physical address verified." },
  { id:"FA-2026-040", type:"Duplicate Payment",      dept:"Health",       amount:"USD 84K",   risk:"High",     status:"Investigating", pattern:"Same invoice number processed twice within 72 hours." },
  { id:"FA-2026-039", type:"Invoice Splitting",      dept:"Agriculture",  amount:"USD 320K",  risk:"High",     status:"Flagged",       pattern:"Three invoices each just below approval threshold from same vendor." },
  { id:"FA-2026-038", type:"Payroll Anomaly",        dept:"Finance",      amount:"USD 120K",  risk:"Medium",   status:"Under Review",  pattern:"Employee ID appears on payroll for two departments simultaneously." },
  { id:"FA-2026-037", type:"Abnormal Spend Spike",   dept:"Education",    amount:"USD 890K",  risk:"Medium",   status:"Monitoring",    pattern:"130% of monthly average spend in last 3 days of fiscal month." },
  { id:"FA-2026-036", type:"Bid Rigging Pattern",    dept:"Water",        amount:"USD 1.2M",  risk:"Critical", status:"Flagged",       pattern:"Same 3 vendors win all contracts in district over 12 months." },
  { id:"FA-2026-035", type:"Conflict of Interest",   dept:"Transport",    amount:"USD 560K",  risk:"High",     status:"Investigating", pattern:"Approving officer shares director with winning vendor." },
];

const BY_TYPE = [
  { name: "Ghost Vendor",       value: 4  },
  { name: "Duplicate Payment",  value: 7  },
  { name: "Invoice Splitting",  value: 5  },
  { name: "Payroll Anomaly",    value: 3  },
  { name: "Bid Rigging",        value: 2  },
];

const MONTHLY_ALERTS = [
  { month: "Jan", critical:1, high:3, medium:4 },
  { month: "Feb", critical:2, high:4, medium:6 },
  { month: "Mar", critical:1, high:2, medium:5 },
  { month: "Apr", critical:3, high:5, medium:7 },
  { month: "May", critical:2, high:6, medium:8 },
  { month: "Jun", critical:2, high:4, medium:5 },
];

function riskClass(r: string) {
  if (r==="Critical") return "bg-red-100 text-red-700 border border-red-200";
  if (r==="High")     return "bg-slate-100 text-[#0F172A] border border-slate-200";
  if (r==="Medium")   return "bg-slate-100 text-[#0F172A] border border-slate-200";
  return "bg-slate-100 text-[#0F172A] border border-slate-200";
}

function statusClass(s: string) {
  if (s==="Frozen")      return "bg-red-100 text-red-700";
  if (s==="Investigating"||s==="Under Review") return "bg-slate-100 text-[#0F172A]";
  if (s==="Cleared")     return "bg-slate-100 text-[#0F172A]";
  return "bg-slate-100 text-[#0F172A]";
}

export default function FraudDetectionPage() {
  const [alerts, setAlerts] = useState(INIT_ALERTS);
  const [detail, setDetail] = useState<typeof INIT_ALERTS[0]|null>(null);

  function handleAction(id: string, action: "Freeze"|"Investigate"|"Clear"|"Block") {
    const nextStatus: Record<string, string> = {
      Freeze: "Frozen", Investigate: "Investigating", Clear: "Cleared", Block: "Frozen",
    };
    setAlerts(p => p.map(a => a.id===id ? {...a, status: nextStatus[action]} : a));
    toast(`Alert ${id}: ${action} action taken`, action==="Clear"?"success":"warning");
  }

  const critical = alerts.filter(a=>a.risk==="Critical").length;
  const high      = alerts.filter(a=>a.risk==="High").length;
  const frozen    = alerts.filter(a=>a.status==="Frozen").length;

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Integrity & Oversight"
        process="Fraud Detection"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <PageHeader title="Budget Fraud Detection" subtitle="AI-powered real-time financial fraud monitoring and investigation" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Open Alerts"        value={String(alerts.filter(a=>a.status!=="Cleared").length)} delta="+3 new today" icon={AlertTriangle} color="red" positive={false} />
        <KpiCard label="Critical / High"    value={`${critical} / ${high}`} delta="require action" icon={Shield}      color="orange" positive={false} />
        <KpiCard label="Frozen Transactions"value={String(frozen)} delta="under lock"        icon={Lock}        color="amber"  />
        <KpiCard label="Loss Prevented YTD" value="USD 12.8M" delta="from 34 cases"           icon={ShieldCheck} color="green"  />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader title="Monthly Fraud Alerts" subtitle="By risk level" />
          <div className="p-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_ALERTS}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...TIP} />
                <Bar dataKey="critical" fill="#DC2626" radius={[3,3,0,0]} name="Critical" stackId="a" />
                <Bar dataKey="high"     fill="#475569" radius={[0,0,0,0]} name="High"     stackId="a" />
                <Bar dataKey="medium"   fill="#64748B" radius={[3,3,0,0]} name="Medium"   stackId="a" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Alerts by Fraud Type" subtitle="Current open cases" />
          <div className="p-4 h-[240px] flex flex-col gap-3">
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={BY_TYPE} cx="50%" cy="50%" innerRadius={44} outerRadius={68} dataKey="value" nameKey="name">
                    {BY_TYPE.map((_,i)=><Cell key={i} fill={C[i%C.length]}/>)}
                  </Pie>
                  <Tooltip {...TIP} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1">
              {BY_TYPE.map((d,i)=>(
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{backgroundColor:C[i%C.length]}}/>
                    <span className="text-black/60">{d.name}</span>
                  </div>
                  <span className="font-semibold text-black">{d.value} cases</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Alerts table */}
      <Card>
        <CardHeader title="Active Fraud Alerts" subtitle="AI-detected financial anomalies requiring investigation" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-black/40 uppercase">
              <tr>{["Alert ID","Fraud Type","Department","Amount at Risk","Risk Level","Status","Actions"].map(h=>(
                <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {alerts.map(f=>(
                <tr key={f.id} className={`hover:bg-gray-50/60 ${f.risk==="Critical"?"bg-red-50/20":""}`}>
                  <td className="px-4 py-3 font-mono text-[11px] text-black/40">{f.id}</td>
                  <td className="px-4 py-3 font-medium text-black">{f.type}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{f.dept}</td>
                  <td className="px-4 py-3 font-semibold text-black">{f.amount}</td>
                  <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${riskClass(f.risk)}`}>{f.risk}</span></td>
                  <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${statusClass(f.status)}`}>{f.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={()=>setDetail(f)} className="h-6 px-2 rounded border border-black/10 text-[11px] hover:bg-gray-50 flex items-center gap-1"><Eye className="h-3 w-3"/>View</button>
                      {f.status !== "Frozen"   && <button onClick={()=>handleAction(f.id,"Freeze")} className="h-6 px-2 rounded bg-red-600 text-white text-[11px] hover:bg-red-700">Freeze</button>}
                      {f.status !== "Investigating" && f.status !== "Cleared" && <button onClick={()=>handleAction(f.id,"Investigate")} className="h-6 px-2 rounded bg-black text-white text-[11px] hover:bg-gray-800">Investigate</button>}
                      {f.status !== "Cleared"  && <button onClick={()=>handleAction(f.id,"Clear")}       className="h-6 px-2 rounded border border-slate-200 bg-slate-50 text-[#0F172A] text-[11px] hover:bg-slate-100">Clear</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {[
          { icon: AlertTriangle, color:"red",    title:"Ghost Vendor Detection",    desc:"Cross-references vendor registrations, tax IDs, and bank accounts against national business registry." },
          { icon: Activity,      color:"orange", title:"Duplicate Payment Guard",   desc:"Real-time detection of duplicate invoices, payments, and POs before processing." },
          { icon: Eye,           color:"amber",  title:"Payroll Fraud Detection",   desc:"Identifies ghost employees, dual employment, and payroll manipulation patterns." },
          { icon: Shield,        color:"violet", title:"Invoice Fraud Analytics",   desc:"Pattern analysis on invoice amounts, dates, and sequences to detect artificial splitting." },
          { icon: Lock,          color:"blue",   title:"Network Relationship Map",  desc:"AI maps employee-vendor relationships to identify undisclosed conflicts and collusion." },
          { icon: ShieldCheck,   color:"green",  title:"Fraud Risk Scoring",        desc:"Every transaction gets a real-time fraud risk score with automatic escalation above thresholds." },
        ].map(item=>(
          <Card key={item.title} className="p-4">
            <div className={`h-8 w-8 rounded-xl mb-3 flex items-center justify-center ${
              item.color==="red"?"bg-red-100":item.color==="orange"?"bg-slate-100":item.color==="amber"?"bg-slate-100":
              item.color==="violet"?"bg-slate-100":item.color==="blue"?"bg-slate-100":"bg-slate-100"
            }`}>
              <item.icon className={`h-4 w-4 ${
                item.color==="red"?"text-red-600":item.color==="orange"?"text-[#0F172A]":item.color==="amber"?"text-[#0F172A]":
                item.color==="violet"?"text-[#0F172A]":item.color==="blue"?"text-[#0F172A]":"text-[#0F172A]"
              }`}/>
            </div>
            <div className="text-sm font-semibold text-black mb-1">{item.title}</div>
            <div className="text-xs text-black/50 leading-relaxed">{item.desc}</div>
          </Card>
        ))}
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-black">{detail.id}</h2>
                <p className="text-xs text-black/40 mt-0.5">{detail.type} — {detail.dept}</p>
              </div>
              <button onClick={()=>setDetail(null)} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-gray-100"><X className="h-4 w-4"/></button>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <div className="text-xs font-semibold text-red-700 mb-1">AI Fraud Pattern Detected</div>
                <div className="text-sm text-red-600">{detail.pattern}</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[["Amount at Risk",detail.amount],["Risk Level",detail.risk],["Status",detail.status],["Department",detail.dept]].map(([k,v])=>(
                  <div key={k}><div className="text-xs text-black/40 mb-0.5">{k}</div><div className="font-medium text-black">{v}</div></div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={()=>{handleAction(detail.id,"Freeze");setDetail(null);}} className="flex-1 h-9 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700">Freeze</button>
              <button onClick={()=>{handleAction(detail.id,"Investigate");setDetail(null);}} className="flex-1 h-9 rounded-lg bg-black text-white text-sm hover:bg-gray-800">Investigate</button>
              <button onClick={()=>{handleAction(detail.id,"Clear");setDetail(null);}} className="flex-1 h-9 rounded-lg border border-slate-200 bg-slate-50 text-[#0F172A] text-sm hover:bg-slate-100">Clear</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
