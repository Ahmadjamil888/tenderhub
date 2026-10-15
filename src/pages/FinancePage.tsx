import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { FeatureGrid } from "@/components/ModulePage";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";
import { DollarSign, Clock, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import InlineWorkbench from "@/components/InlineWorkbench";

const invoices = [
  { id: "INV-2026-4821", vendor: "Highveld Engineering", po: "PO-2026-0411", amount: "USD 2,840,000", submitted: "2026-06-15", due: "2026-07-15", status: "Approved" },
  { id: "INV-2026-4820", vendor: "Zimbabwe Pharma Holdings", po: "PO-2026-0418", amount: "USD 1,200,000", submitted: "2026-06-14", due: "2026-07-14", status: "Matching" },
  { id: "INV-2026-4819", vendor: "Sable ICT Solutions", po: "PO-2026-0404", amount: "USD 680,000", submitted: "2026-06-13", due: "2026-07-13", status: "Exception" },
  { id: "INV-2026-4818", vendor: "Mashonaland Agri Supplies", po: "PO-2026-0399", amount: "USD 3,120,000", submitted: "2026-06-12", due: "2026-07-12", status: "Paid" },
  { id: "INV-2026-4817", vendor: "Eastern Highlands Logistics", po: "PO-2026-0388", amount: "USD 440,000", submitted: "2026-06-11", due: "2026-07-11", status: "Pending Auth" },
];

const paymentData = [
  { month: "Jan", invoices: 420, payments: 380, pending: 40 },
  { month: "Feb", invoices: 510, payments: 490, pending: 20 },
  { month: "Mar", invoices: 580, payments: 560, pending: 20 },
  { month: "Apr", invoices: 490, payments: 470, pending: 22 },
  { month: "May", invoices: 620, payments: 595, pending: 25 },
  { month: "Jun", invoices: 540, payments: 510, pending: 30 },
];

const STATUS_TONE: Record<string, "blue" | "amber" | "green" | "red" | "muted"> = {
  Approved: "blue", Matching: "blue", Exception: "red", Paid: "green", "Pending Auth": "amber",
};

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<"Invoices" | "Payments" | "Analytics">("Invoices");

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Ministry of Finance & Economic Development"
        module="Finance"
        process="Financial Management"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Phases 20 – 21</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Invoice & Payment Management"
          description="From invoice submission to treasury disbursement: three-way matching, statutory deductions, tax withholding, and supplier payment tracking."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Invoices This Month" value="2,841" delta="+142" icon={DollarSign} />
          <KpiCard label="Awaiting Payment" value="USD 48.2M" delta="312 invoices" icon={Clock} />
          <KpiCard label="Paid This Month" value="USD 124.6M" delta="+8.4%" icon={CheckCircle2} />
          <KpiCard label="Exceptions" value="23" delta="Needs review" positive={false} icon={AlertTriangle} />
        </div>

        <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
          {(["Invoices", "Payments", "Analytics"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0 ${activeTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {activeTab === "Invoices" && (
          <Card className="mb-6">
            <CardHeader title="Invoice Queue" subtitle="Three-way matching status" action={<Badge tone="blue">Live</Badge>} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-xs text-muted-foreground">
                  <tr>
                    {["Invoice ID", "Vendor", "PO Reference", "Amount", "Submitted", "Due Date", "Status", ""].map((h) => (
                      <th key={h} className="text-left font-medium px-5 py-2.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-secondary/40">
                      <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">{inv.id}</td>
                      <td className="px-5 py-3 font-medium text-foreground">{inv.vendor}</td>
                      <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">{inv.po}</td>
                      <td className="px-5 py-3 font-semibold text-foreground">{inv.amount}</td>
                      <td className="px-5 py-3 text-foreground">{inv.submitted}</td>
                      <td className="px-5 py-3 text-foreground">{inv.due}</td>
                      <td className="px-5 py-3"><Badge tone={STATUS_TONE[inv.status] ?? "default"}>{inv.status}</Badge></td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => pushNotification(`Reviewing ${inv.id} — ${inv.vendor}: ${inv.amount} | Status: ${inv.status} | PO: ${inv.po} | Due: ${inv.due}. Three-way match check initiated.`, inv.status === "Exception" ? "error" : "info")}
                          className="h-7 px-2.5 rounded-md border border-border text-xs hover:bg-secondary">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "Payments" && (
          <Card className="mb-6">
            <CardHeader title="Payment Schedule" subtitle="Upcoming and recent disbursements" />
            <div className="p-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentData}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="invoices" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Invoices Received" />
                  <Bar dataKey="payments" fill="#10B981" radius={[3, 3, 0, 0]} name="Payments Made" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {activeTab === "Analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader title="Payment Cycle Time" subtitle="Avg days from invoice to payment" />
              <div className="p-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paymentData.map((d) => ({ ...d, avgDays: Math.floor(Math.random() * 5 + 28) }))}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="avgDays" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} name="Avg Days" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title="Ageing Payables" subtitle="Outstanding invoice aging" />
              <div className="p-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { range: "0–30 days", amount: 24.2 },
                    { range: "31–60 days", amount: 14.8 },
                    { range: "61–90 days", amount: 6.4 },
                    { range: "91+ days", amount: 2.8 },
                  ]}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="amount" fill="#3B82F6" radius={[3, 3, 0, 0]} name="USD M" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        <h2 className="text-sm font-semibold mb-3">Payment Capabilities</h2>
        <FeatureGrid features={[
          { title: "Invoice Submission", desc: "Supplier portal e-invoicing, ZIMRA fiscal compliance, automatic PO matching." },
          { title: "Three-Way Matching", desc: "Automatic match of PO, GRN, and invoice with exception routing." },
          { title: "Tax & Statutory Deductions", desc: "Withholding tax, VAT handling, IMTT, and NSSA where applicable." },
          { title: "Payment Authorization", desc: "Multi-tier approval, accounting officer sign-off, treasury authorization." },
          { title: "Treasury Disbursement", desc: "Integration with PFMS / RBZ payment rails, batch payments, payment proofs." },
          { title: "Supplier Payment Tracking", desc: "Real-time payment status visible to suppliers via portal — citizen transparency on ageing payables." },
        ]} />
      </div>
      <InlineWorkbench context="Finance" />
    </AppShell>
  );
}
