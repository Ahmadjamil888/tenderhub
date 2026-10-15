import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import TodayActivity from "@/components/TodayActivity";
import { FileText, Clock, CheckCircle2, DollarSign, Bell, ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { pushNotification } from "@/lib/local-store";
import { toast } from "@/lib/toast";

const TABS = ["Overview", "My Bids", "Contracts", "Invoices", "Today"] as const;
type Tab = typeof TABS[number];

const PAYMENT_HISTORY = [
  { month: "Jan", paid: 2.4 }, { month: "Feb", paid: 0 }, { month: "Mar", paid: 4.1 },
  { month: "Apr", paid: 1.8 }, { month: "May", paid: 3.2 }, { month: "Jun", paid: 2.84 },
];

const MY_BIDS = [
  { id: "ZW-PRA-2026-00184", title: "Solar Mini-Grids — 12 Rural Clinics", submitted: "2026-06-10", status: "Under Evaluation", score: null as number | null },
  { id: "ZW-PRA-2026-00183", title: "ARV Medicines Framework", submitted: "2026-06-05", status: "Technically Passed", score: 88.4 },
  { id: "ZW-PRA-2026-00178", title: "School Textbooks Gr 1-7", submitted: "2026-05-28", status: "Awarded", score: 91.2 },
  { id: "ZW-PRA-2026-00176", title: "Office Supplies Framework", submitted: "2026-05-10", status: "Unsuccessful", score: 64.1 },
];

const MY_CONTRACTS = [
  { id: "CN-2026-0411", title: "Beitbridge Highway Section 3", value: "USD 71.0M", progress: 64, nextMilestone: "Bridgework Certificate", due: "2026-07-15" },
  { id: "CN-2026-0388", title: "Primary School Textbooks 2025", value: "USD 5.2M", progress: 47, nextMilestone: "Delivery Batch 2", due: "2026-07-30" },
];

const MY_INVOICES = [
  { id: "INV-2026-4821", contract: "CN-2026-0411", amount: "USD 2,840,000", status: "Approved", due: "2026-07-15" },
  { id: "INV-2026-4810", contract: "CN-2026-0388", amount: "USD 620,000", status: "Matching", due: "2026-07-20" },
];

export default function SupplierDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("Overview");

  const handleSubmitInvoice = () => {
    pushNotification("Invoice submitted for 3-way matching", "success");
    toast("Invoice submitted — 3-way matching (PO → GRN → Invoice) in progress.", "success");
  };

  const handleAskClarification = (id: string) => {
    pushNotification(`Clarification request sent for ${id}`, "info");
    toast(`Clarification request submitted for ${id}. Response expected within 2 business days.`, "info");
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Vendor Management"
        process="Supplier Dashboard"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-6 max-w-[1400px] mx-auto">
        <PageHeader
          title={`Welcome, ${user?.name}`}
          description={`Supplier Portal — ${user?.entity}`}
          actions={
            <div className="flex gap-2">
              <Link to="/tenders" className="h-9 px-4 rounded-xl border border-black/10 bg-white text-sm font-medium hover:bg-[#EAF1F8] flex items-center gap-1.5 transition-colors">
                Browse Tenders <ArrowRight className="h-4 w-4" />
              </Link>
              <button onClick={handleSubmitInvoice}
                className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800 transition-colors">
                <Plus className="h-4 w-4" /> Submit Invoice
              </button>
            </div>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Active Bids" value="3" delta="2 under evaluation" icon={FileText} />
          <KpiCard label="Active Contracts" value="2" delta="Both on track" icon={CheckCircle2} />
          <KpiCard label="Pending Invoices" value="USD 3.46M" delta="2 invoices" icon={DollarSign} />
          <KpiCard label="Overall Rating" value="4.7 / 5.0" delta="+0.2 this quarter" icon={Clock} />
        </div>

        <div className="flex gap-1 mb-6 border-b border-black/10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}</button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader title="My Recent Bids" action={<Link to="/tenders" className="text-xs text-black/40 hover:text-black">Browse tenders →</Link>} />
                <div className="divide-y divide-black/5">
                  {MY_BIDS.slice(0, 3).map(b => (
                    <div key={b.id} className="px-5 py-3 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-black truncate">{b.title}</div>
                        <div className="text-[11px] text-black/40">{b.id} · Submitted {b.submitted}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {b.score && <span className="text-xs font-bold text-black">{b.score}/100</span>}
                        <Badge tone={b.status === "Awarded" ? "green" : b.status === "Unsuccessful" ? "red" : b.status.includes("Passed") ? "blue" : "amber"}>{b.status}</Badge>
                        <button onClick={() => handleAskClarification(b.id)} className="h-6 px-2 rounded-md border border-black/10 text-[10px] hover:bg-[#EAF1F8] transition-colors">Clarify</button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <CardHeader title="Payment History" subtitle="USD millions received" />
                <div className="p-4 h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={PAYMENT_HISTORY}>
                      <CartesianGrid stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="month" stroke="#aaa" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#aaa" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #eee", borderRadius: 10, fontSize: 12 }} />
                      <Line type="monotone" dataKey="paid" stroke="#111" strokeWidth={2.5} dot={{ r: 4, fill: "#111" }} name="Paid (USD M)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader title="Notifications" action={<Badge tone="amber">4 new</Badge>} />
                <div className="divide-y divide-black/5">
                  {[
                    { msg: "New tender: IT Infrastructure Package", time: "2h ago", type: "info" },
                    { msg: "Invoice INV-2026-4821 approved for payment", time: "4h ago", type: "success" },
                    { msg: "Evaluation passed: ARV Medicines", time: "1d ago", type: "success" },
                    { msg: "Clarification required: ZW-PRA-2026-00184", time: "2d ago", type: "warning" },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-3 flex items-start gap-2.5">
                      <Bell className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${n.type === "success" ? "text-slate-600" : n.type === "warning" ? "text-slate-600" : "text-black/30"}`} />
                      <div>
                        <div className="text-xs text-black">{n.msg}</div>
                        <div className="text-[10px] text-black/30 mt-0.5">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <div className="text-xs font-semibold text-black mb-3">Quick Actions</div>
                <div className="space-y-2">
                  {[
                    { label: "Submit a New Bid", action: () => toast("Navigate to open tenders to submit a bid.", "info") },
                    { label: "Submit Invoice", action: handleSubmitInvoice },
                    { label: "Request Clarification", action: () => toast("Select a tender from My Bids to request clarification.", "info") },
                    { label: "Update Company Profile", action: () => { pushNotification("Company profile updated", "success"); toast("Company profile updated successfully.", "success"); } },
                  ].map(q => (
                    <button key={q.label} onClick={q.action}
                      className="w-full text-left px-3 py-2 rounded-lg border border-black/10 text-xs font-medium text-black hover:bg-[#EAF1F8] hover:border-black/20 transition-all flex items-center justify-between group">
                      {q.label}
                      <ArrowRight className="h-3 w-3 text-black/20 group-hover:text-black transition-colors" />
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "My Bids" && (
          <Card>
            <CardHeader title="All My Bids" subtitle={`${MY_BIDS.length} total submissions`} />
            <div className="divide-y divide-black/5">
              {MY_BIDS.map(b => (
                <div key={b.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-black">{b.title}</div>
                    <div className="text-xs text-black/40">{b.id} · Submitted {b.submitted}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {b.score && <span className="text-sm font-bold text-black">{b.score}/100</span>}
                    <Badge tone={b.status === "Awarded" ? "green" : b.status === "Unsuccessful" ? "red" : b.status.includes("Passed") ? "blue" : "amber"}>{b.status}</Badge>
                    <button onClick={() => handleAskClarification(b.id)} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8]">Clarify</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "Contracts" && (
          <div className="space-y-3">
            {MY_CONTRACTS.map(c => (
              <div key={c.id} className="bg-white border border-black/10 rounded-2xl px-5 py-4">
                <div className="flex justify-between mb-3">
                  <div>
                    <div className="text-sm font-bold text-black">{c.title}</div>
                    <div className="text-xs text-black/40">{c.id} · {c.value}</div>
                  </div>
                  <Badge tone="blue">On Track</Badge>
                </div>
                <div className="h-2 rounded-full bg-[#EAF1F8] overflow-hidden mb-2">
                  <div className="h-full rounded-full bg-black transition-all" style={{ width: `${c.progress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-black/50">
                  <span>{c.progress}% complete</span>
                  <span>Next: {c.nextMilestone} · {c.due}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => { pushNotification(`Deliverable submitted for ${c.title} — awaiting acceptance by client.`, "success"); }} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 transition-colors">Submit Deliverable</button>
                  <button onClick={() => toast(`${c.id} — ${c.title} | ${c.value} | ${c.progress}% complete | Next: ${c.nextMilestone} · ${c.due}`, "info")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] transition-colors">View Contract</button>
                  <button onClick={handleSubmitInvoice} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] transition-colors">Submit Invoice</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Invoices" && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <button onClick={handleSubmitInvoice} className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800 transition-colors">
                <Plus className="h-4 w-4" /> New Invoice
              </button>
            </div>
            {MY_INVOICES.map(inv => (
              <div key={inv.id} className="bg-white border border-black/10 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-black">{inv.id} · {inv.amount}</div>
                  <div className="text-xs text-black/40">{inv.contract} · Due {inv.due}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={inv.status === "Approved" ? "green" : "amber"}>{inv.status}</Badge>
                  <button className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8]">Track Payment</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Today" && <TodayActivity />}
      </div>

      <AIAssistantPanel agentName="Supplier AI Advisor" agentRole="Bid guidance & contract support" context="supplier portal" color="blue"
        suggestedPrompts={["What tenders match my category?", "How do I improve my technical score?", "When will my payment be released?", "Draft a clarification response"]} />
    </AppShell>
  );
}
