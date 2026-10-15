import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { FileText, Lock, Activity, AlertTriangle, Plus, X } from "lucide-react";

const C = ["#334155","#475569","#64748B","#334155","#DC2626","#334155","#475569"];
const TIP = { contentStyle: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 } };

const INIT_COMMITMENTS = [
  { id:"CMT-2026-0481", desc:"ARV Medicines Framework",       dept:"Clinical Services",   vendor:"Zimbabwe Pharma",      amount:42.5, type:"Contract",      start:"2026-01-01", end:"2028-03-31", status:"Active",   risk:"Low",    expired:false },
  { id:"CMT-2026-0480", desc:"Beitbridge Highway Section 4",  dept:"Infrastructure Div",  vendor:"Highveld Engineering", amount:71.0, type:"Contract",      start:"2026-01-15", end:"2027-12-31", status:"Active",   risk:"Medium", expired:false },
  { id:"CMT-2026-0479", desc:"Primary School Textbooks",      dept:"Primary Education",   vendor:"Sable Press Ltd",      amount:6.7,  type:"Purchase Order", start:"2026-03-01", end:"2026-11-01", status:"Active",   risk:"Low",    expired:false },
  { id:"CMT-2026-0478", desc:"Debt Servicing Q3",             dept:"Treasury Operations", vendor:"Multiple Creditors",   amount:18.4, type:"Debt Service",  start:"2026-01-01", end:"2026-06-10", status:"Overdue",  risk:"High",   expired:true  },
  { id:"CMT-2026-0477", desc:"Solar Mini-Grid Equipment",     dept:"Energy Projects",     vendor:"SolarTech Africa",     amount:14.8, type:"Framework",     start:"2026-02-01", end:"2027-06-30", status:"Active",   risk:"Low",    expired:false },
  { id:"CMT-2026-0476", desc:"Fertiliser Supply Q3",          dept:"Irrigation Projects", vendor:"Agri Supplies Ltd",    amount:8.2,  type:"Purchase Order", start:"2025-09-01", end:"2025-12-31", status:"Expired",  risk:"Low",    expired:true  },
];

const BY_MINISTRY = [
  { name: "Health",     value: 42.5 },
  { name: "Transport",  value: 71.0 },
  { name: "Education",  value: 6.7  },
  { name: "Finance",    value: 18.4 },
  { name: "Energy",     value: 14.8 },
  { name: "Agriculture",value: 8.2  },
];

const BY_TYPE = [
  { name: "Contract",      value: 3 },
  { name: "Purchase Order",value: 2 },
  { name: "Framework",     value: 1 },
  { name: "Debt Service",  value: 1 },
];

function riskBadge(r: string) {
  if (r==="High")   return "bg-red-100 text-red-700 border border-red-200";
  if (r==="Medium") return "bg-slate-100 text-[#0F172A] border border-slate-200";
  return "bg-slate-100 text-[#0F172A] border border-slate-200";
}

export default function CommitmentsPage() {
  const [commitments, setCommitments] = useState(INIT_COMMITMENTS);
  const [showAdd, setShowAdd] = useState(false);
  const [showRelease, setShowRelease] = useState<string|null>(null);
  const [form, setForm] = useState({ desc:"", dept:"", vendor:"", amount:"", type:"Contract", end:"" });

  function handleAdd() {
    if (!form.desc || !form.dept || !form.vendor || !form.amount) { toast("Fill all required fields","warning"); return; }
    const newC = {
      id: `CMT-2026-${String(commitments.length+482).padStart(4,"0")}`,
      desc: form.desc, dept: form.dept, vendor: form.vendor,
      amount: Number(form.amount), type: form.type,
      start: new Date().toISOString().slice(0,10), end: form.end || "2027-12-31",
      status: "Active", risk: "Low", expired: false,
    };
    setCommitments(p => [newC, ...p]);
    setShowAdd(false);
    setForm({ desc:"", dept:"", vendor:"", amount:"", type:"Contract", end:"" });
    toast(`Commitment ${newC.id} registered`, "success");
  }

  function handleRelease(id: string) {
    setCommitments(p => p.map(c => c.id===id ? {...c, status:"Released"} : c));
    setShowRelease(null);
    toast(`Commitment ${id} released`, "success");
  }

  const active = commitments.filter(c=>c.status==="Active");
  const expired = commitments.filter(c=>c.expired);
  const total = commitments.reduce((s,c)=>s+c.amount,0);

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Ministry of Finance & Economic Development"
        module="Budget Management"
        process="Budget Commitments"
        financialYear="FY2026"
        pageType="workbench"
      />
      <PageHeader title="Commitments" subtitle="All active procurement commitments and financial obligations" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total Commitments"   value={String(commitments.length)} delta="+18 this week" icon={FileText} color="blue" />
        <KpiCard label="Outstanding (USD M)" value={total.toFixed(1)} delta="15.5% of budget" icon={Lock} color="amber" />
        <KpiCard label="Expired/Overdue"     value={String(expired.length)} delta="need action" icon={AlertTriangle} color="red" positive={false} />
        <KpiCard label="Active"              value={String(active.length)} delta="in force" icon={Activity} color="green" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Commitments by Ministry" subtitle="USD M outstanding" />
          <div className="p-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BY_MINISTRY}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}M`} />
                <Tooltip {...TIP} formatter={(v:number)=>[`USD ${v}M`]} />
                <Bar dataKey="value" fill="#334155" radius={[3,3,0,0]} name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="By Type" subtitle="Number of commitments" />
          <div className="p-4 h-[220px] flex flex-col gap-3">
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={BY_TYPE} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" nameKey="name">
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
                  <span className="font-semibold text-black">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader title="Active Commitments Register" subtitle="All registered financial obligations">
          <button onClick={()=>setShowAdd(true)} className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1.5 hover:bg-gray-800">
            <Plus className="h-3.5 w-3.5"/>Add Commitment
          </button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-black/40 uppercase">
              <tr>{["ID","Description","Dept","Vendor","Amount (M)","Type","Start","End","Status","Risk",""].map(h=>(
                <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {commitments.map(c=>(
                <tr key={c.id} className={`hover:bg-gray-50/60 ${c.expired?"bg-red-50/30":""}`}>
                  <td className="px-4 py-3 font-mono text-[11px] text-black/40">{c.id}</td>
                  <td className="px-4 py-3 font-medium text-black max-w-[180px] truncate">{c.desc}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{c.dept}</td>
                  <td className="px-4 py-3 text-xs text-black/70">{c.vendor}</td>
                  <td className="px-4 py-3 font-semibold text-black">{c.amount.toFixed(1)}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{c.type}</td>
                  <td className="px-4 py-3 text-xs text-black/50">{c.start}</td>
                  <td className={`px-4 py-3 text-xs font-medium ${c.expired?"text-red-600":"text-black/50"}`}>{c.end}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      c.status==="Active"?"bg-slate-100 text-[#0F172A]":
                      c.status==="Released"?"bg-gray-100 text-gray-500":
                      "bg-red-100 text-red-700"
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${riskBadge(c.risk)}`}>{c.risk}</span></td>
                  <td className="px-4 py-3">
                    {c.status === "Active" && (
                      <button onClick={()=>setShowRelease(c.id)} className="h-6 px-2 rounded border border-slate-200 bg-slate-50 text-[#0F172A] text-[11px] hover:bg-slate-100">Release</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-black">Add Commitment</h2>
              <button onClick={()=>setShowAdd(false)} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-gray-100"><X className="h-4 w-4"/></button>
            </div>
            <div className="space-y-3">
              {[
                { label:"Description *", key:"desc",    type:"text", placeholder:"e.g. Construction contract" },
                { label:"Department *",  key:"dept",    type:"text", placeholder:"e.g. Clinical Services" },
                { label:"Vendor *",      key:"vendor",  type:"text", placeholder:"e.g. Highveld Engineering" },
                { label:"Amount (USD M)*",key:"amount", type:"number",placeholder:"e.g. 25" },
              ].map(f=>(
                <div key={f.key}>
                  <label className="text-xs font-medium text-black/60 mb-1 block">{f.label}</label>
                  <input type={f.type} className="w-full h-9 rounded-lg border border-black/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    value={(form as Record<string,string>)[f.key]}
                    onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-black/60 mb-1 block">Type</label>
                <select className="w-full h-9 rounded-lg border border-black/10 px-3 text-sm focus:outline-none bg-white"
                  value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>
                  {["Contract","Purchase Order","Framework","Debt Service"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={()=>setShowAdd(false)} className="flex-1 h-9 rounded-lg border border-black/10 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleAdd} className="flex-1 h-9 rounded-lg bg-black text-white text-sm hover:bg-gray-800">Register</button>
            </div>
          </div>
        </div>
      )}

      {/* Release confirm modal */}
      {showRelease && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-slate-600 mx-auto mb-3"/>
            <h2 className="text-base font-semibold text-black mb-2">Release Commitment</h2>
            <p className="text-sm text-black/50 mb-5">Release commitment <span className="font-mono font-bold text-black">{showRelease}</span>? This will free the reserved budget allocation.</p>
            <div className="flex gap-2">
              <button onClick={()=>setShowRelease(null)} className="flex-1 h-9 rounded-lg border border-black/10 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={()=>handleRelease(showRelease)} className="flex-1 h-9 rounded-lg bg-[#0F172A] text-white text-sm hover:bg-[#0F172A]">Release</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
