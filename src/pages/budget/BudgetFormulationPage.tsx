import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  FileText, CheckCircle2, Clock, AlertTriangle, Plus, X,
  ChevronRight, Users, DollarSign, Target,
} from "lucide-react";

const TIP = { contentStyle: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 } };

const HIST_DATA = [
  { dept: "Health",     "2024": 720, "2025": 780, "2026": 820 },
  { dept: "Transport",  "2024": 580, "2025": 610, "2026": 640 },
  { dept: "Education",  "2024": 460, "2025": 490, "2026": 510 },
  { dept: "Agriculture","2024": 380, "2025": 400, "2026": 430 },
  { dept: "Energy",     "2024": 320, "2025": 350, "2026": 380 },
];

const WORKFLOW_STEPS = [
  { label: "Dept Head",        done: true  },
  { label: "Finance Officer",  done: true  },
  { label: "Budget Officer",   done: false },
  { label: "Treasury",         done: false },
  { label: "Approved",         done: false },
];

const INITIAL_REQUESTS = [
  { id: "BR-2026-048", dept: "Clinical Services",   amount: "USD 42.5M", method: "Incremental", stage: "Approved",      risk: "Low",    submitted: "2026-02-01" },
  { id: "BR-2026-047", dept: "Infrastructure Div",  amount: "USD 71.0M", method: "Zero-Based",  stage: "Under Review",  risk: "Medium", submitted: "2026-02-05" },
  { id: "BR-2026-046", dept: "Primary Education",   amount: "USD 28.0M", method: "Incremental", stage: "Draft",         risk: "Low",    submitted: "2026-01-28" },
  { id: "BR-2026-045", dept: "Rural Electrification",amount: "USD 32.0M",method: "Zero-Based",  stage: "Under Review",  risk: "High",   submitted: "2026-02-08" },
  { id: "BR-2026-044", dept: "Irrigation Projects", amount: "USD 18.0M", method: "Incremental", stage: "Approved",      risk: "Low",    submitted: "2026-01-25" },
];

const STAGE_COLORS: Record<string, string> = {
  Draft:         "bg-gray-100 text-gray-600",
  "Under Review":"bg-slate-100 text-[#0F172A]",
  Approved:      "bg-slate-100 text-[#0F172A]",
};
const RISK_COLORS: Record<string, string> = {
  Low:   "bg-slate-100 text-[#0F172A]",
  Medium:"bg-slate-100 text-[#0F172A]",
  High:  "bg-red-100 text-red-700",
};

export default function BudgetFormulationPage() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [useZeroBased, setUseZeroBased] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ dept: "", amount: "", method: "Incremental", justification: "" });

  function handleSubmit() {
    if (!form.dept || !form.amount) { toast("Please fill in all required fields","warning"); return; }
    const newReq = {
      id: `BR-2026-${String(requests.length+49).padStart(3,"0")}`,
      dept: form.dept, amount: `USD ${form.amount}M`,
      method: form.method, stage: "Draft", risk: "Low", submitted: new Date().toISOString().slice(0,10),
    };
    setRequests(p => [newReq, ...p]);
    setShowAdd(false);
    setForm({ dept: "", amount: "", method: "Incremental", justification: "" });
    toast(`Budget request for ${form.dept} submitted`, "success");
  }

  function handleApprove(id: string) {
    setRequests(p => p.map(r => r.id===id ? {...r, stage:"Approved"} : r));
    toast(`Budget request ${id} approved`, "success");
  }

  function handleSendReview(id: string) {
    setRequests(p => p.map(r => r.id===id ? {...r, stage:"Under Review"} : r));
    toast(`Budget request ${id} sent for review`, "info");
  }

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Ministry of Finance & Economic Development"
        module="Budget Management"
        process="Budget Formulation"
        financialYear="FY2026"
        pageType="form"
      />
      <PageHeader title="Budget Formulation" subtitle="Multi-year budget planning with approval workflow" />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Requests Submitted" value={String(requests.length)} delta="+6 pending" icon={FileText}      color="blue"  />
        <KpiCard label="Approved"           value={String(requests.filter(r=>r.stage==="Approved").length)} delta={`of ${requests.length}`} icon={CheckCircle2} color="green" />
        <KpiCard label="Under Review"       value={String(requests.filter(r=>r.stage==="Under Review").length)} delta="awaiting sign-off" icon={Clock} color="amber" />
        <KpiCard label="AI Risk Flags"      value="9" delta="padding detected" icon={AlertTriangle} color="red" positive={false} />
      </div>

      {/* Budgeting mode toggle */}
      <Card className="mb-6 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="text-sm font-semibold text-black mb-1">Budgeting Methodology</div>
            <div className="text-xs text-black/50">{useZeroBased ? "Zero-Based: every line must be justified from scratch" : "Incremental: based on prior year with adjustments"}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${!useZeroBased ? "text-black" : "text-black/40"}`}>Incremental</span>
            <button onClick={()=>setUseZeroBased(p=>!p)}
              className={`relative h-6 w-11 rounded-full transition-colors ${useZeroBased?"bg-black":"bg-gray-200"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${useZeroBased?"translate-x-5":"translate-x-0.5"}`}/>
            </button>
            <span className={`text-sm font-medium ${useZeroBased ? "text-black" : "text-black/40"}`}>Zero-Based</span>
          </div>
        </div>
      </Card>

      {/* Approval workflow */}
      <Card className="mb-6">
        <CardHeader title="Approval Workflow" subtitle="Budget approval chain — current cycle" />
        <div className="px-6 py-5 overflow-x-auto">
          <div className="flex items-center gap-0 min-w-max">
            {WORKFLOW_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center gap-0">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 ${step.done?"bg-black border-black text-white":"bg-white border-gray-200 text-black/30"}`}>
                    {step.done ? <CheckCircle2 className="h-4 w-4"/> : <span className="text-xs font-bold">{i+1}</span>}
                  </div>
                  <span className="text-xs text-black/60 font-medium whitespace-nowrap">{step.label}</span>
                </div>
                {i < WORKFLOW_STEPS.length-1 && (
                  <div className={`h-0.5 w-14 mx-1 ${WORKFLOW_STEPS[i+1].done?"bg-black":"bg-gray-200"} mb-4`}/>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Historical comparison chart */}
      <Card className="mb-6">
        <CardHeader title="Historical Budget Comparison" subtitle="Last 3 years by ministry (USD M)" />
        <div className="p-4 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={HIST_DATA}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="dept" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}M`} />
              <Tooltip {...TIP} formatter={(v:number)=>[`USD ${v}M`]} />
              <Bar dataKey="2024" fill="#e2e8f0" radius={[3,3,0,0]} name="FY2024" />
              <Bar dataKey="2025" fill="#94A3B8" radius={[3,3,0,0]} name="FY2025" />
              <Bar dataKey="2026" fill="#334155" radius={[3,3,0,0]} name="FY2026" />
              <Legend />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Requests table */}
      <Card>
        <CardHeader title="Budget Request Register" subtitle={`${requests.length} requests — FY2026 formulation cycle`}>
          <button onClick={()=>setShowAdd(true)} className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1.5 hover:bg-gray-800">
            <Plus className="h-3.5 w-3.5"/>New Request
          </button>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-black/40 uppercase">
              <tr>{["ID","Department","Amount","Method","Stage","Risk","Submitted","Actions"].map(h=>(
                <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {requests.map(r=>(
                <tr key={r.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-mono text-[11px] text-black/40">{r.id}</td>
                  <td className="px-4 py-3 font-medium text-black">{r.dept}</td>
                  <td className="px-4 py-3 font-semibold text-black">{r.amount}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{r.method}</td>
                  <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${STAGE_COLORS[r.stage]||"bg-gray-100 text-gray-600"}`}>{r.stage}</span></td>
                  <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${RISK_COLORS[r.risk]||"bg-gray-100 text-gray-600"}`}>{r.risk}</span></td>
                  <td className="px-4 py-3 text-xs text-black/50">{r.submitted}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {r.stage === "Draft" && <button onClick={()=>handleSendReview(r.id)} className="h-6 px-2 rounded border border-slate-200 bg-slate-50 text-[#0F172A] text-[11px] hover:bg-slate-100">Submit</button>}
                      {r.stage === "Under Review" && <button onClick={()=>handleApprove(r.id)} className="h-6 px-2 rounded border border-slate-200 bg-slate-50 text-[#0F172A] text-[11px] hover:bg-slate-100">Approve</button>}
                      <button onClick={()=>toast(`Viewing details for ${r.id}`,"info")} className="h-6 px-2 rounded border border-black/10 text-[11px] hover:bg-gray-50">View</button>
                    </div>
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
              <h2 className="text-base font-semibold text-black">New Budget Request</h2>
              <button onClick={()=>setShowAdd(false)} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-gray-100"><X className="h-4 w-4"/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-black/60 mb-1 block">Department *</label>
                <input className="w-full h-9 rounded-lg border border-black/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  value={form.dept} onChange={e=>setForm(p=>({...p,dept:e.target.value}))} placeholder="e.g. Clinical Services" />
              </div>
              <div>
                <label className="text-xs font-medium text-black/60 mb-1 block">Requested Amount (USD M) *</label>
                <input type="number" className="w-full h-9 rounded-lg border border-black/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} placeholder="e.g. 45" />
              </div>
              <div>
                <label className="text-xs font-medium text-black/60 mb-1 block">Budgeting Method</label>
                <select className="w-full h-9 rounded-lg border border-black/10 px-3 text-sm focus:outline-none bg-white"
                  value={form.method} onChange={e=>setForm(p=>({...p,method:e.target.value}))}>
                  <option>Incremental</option><option>Zero-Based</option><option>Activity-Based</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-black/60 mb-1 block">Strategic Justification</label>
                <textarea className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none h-20"
                  value={form.justification} onChange={e=>setForm(p=>({...p,justification:e.target.value}))} placeholder="Describe alignment with strategic objectives..." />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={()=>setShowAdd(false)} className="flex-1 h-9 rounded-lg border border-black/10 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} className="flex-1 h-9 rounded-lg bg-black text-white text-sm hover:bg-gray-800">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
