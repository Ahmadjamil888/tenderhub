import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import TodayActivity from "@/components/TodayActivity";
import { pushNotification, pushSeniorAlert, saveAIReport } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import { generateDailyReportPDF } from "@/lib/pdf-report";
import {
  DollarSign, Clock, CheckCircle2, AlertTriangle, Sparkles, Plus,
  Download, X, Eye, Send, Ban, Flag, CreditCard, FileText,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from "recharts";

const TABS = ["Invoice Queue", "Payment Schedule", "Budget", "AI Insights", "Today"] as const;
type Tab = typeof TABS[number];

/* ─── Static demo invoices (always visible, no dependency on seeded store) ── */
type InvoiceStatus = "Pending" | "Matching" | "Approved" | "Rejected" | "Exception" | "Paid" | "Scheduled";

type DemoInvoice = {
  id: string; vendor: string; poRef: string; grnRef: string;
  amount: string; amountNum: number; submitted: string; due: string;
  status: InvoiceStatus;
  matchPO: boolean; matchGRN: boolean; matchAmount: boolean;
  note?: string;
};

const INITIAL_INVOICES: DemoInvoice[] = [
  { id: "INV-2026-4821", vendor: "Highveld Engineering (Pvt) Ltd",   poRef: "PO-2026-0411", grnRef: "GRN-2026-0892", amount: "USD 2,840,000", amountNum: 2840000, submitted: "2026-06-15", due: "2026-07-15", status: "Matching",  matchPO: true,  matchGRN: true,  matchAmount: true,  note: "3-way match passed — ready for approval" },
  { id: "INV-2026-4820", vendor: "Zimbabwe Pharma Holdings",         poRef: "PO-2026-0418", grnRef: "GRN-2026-0891", amount: "USD 1,200,000", amountNum: 1200000, submitted: "2026-06-14", due: "2026-07-14", status: "Pending",   matchPO: true,  matchGRN: false, matchAmount: true,  note: "GRN not yet received — awaiting stores confirmation" },
  { id: "INV-2026-4819", vendor: "Sable ICT Solutions",              poRef: "PO-2026-0404", grnRef: "GRN-2026-0880", amount: "USD 680,000",   amountNum: 680000,  submitted: "2026-06-13", due: "2026-07-13", status: "Exception", matchPO: true,  matchGRN: true,  matchAmount: false, note: "Amount 18% above PO rate — overpricing detected" },
  { id: "INV-2026-4818", vendor: "Mashonaland Agri Supplies",        poRef: "PO-2026-0399", grnRef: "GRN-2026-0875", amount: "USD 3,120,000", amountNum: 3120000, submitted: "2026-06-12", due: "2026-07-12", status: "Paid",      matchPO: true,  matchGRN: true,  matchAmount: true  },
  { id: "INV-2026-4817", vendor: "Eastern Highlands Logistics",      poRef: "PO-2026-0388", grnRef: "GRN-2026-0868", amount: "USD 440,000",   amountNum: 440000,  submitted: "2026-06-11", due: "2026-07-11", status: "Pending",   matchPO: false, matchGRN: false, matchAmount: true,  note: "PO not found in system — vendor to provide revised invoice" },
  { id: "INV-2026-4816", vendor: "Bulawayo Civil Works Ltd",         poRef: "PO-2026-0381", grnRef: "GRN-2026-0860", amount: "USD 5,600,000", amountNum: 5600000, submitted: "2026-06-10", due: "2026-07-10", status: "Approved",  matchPO: true,  matchGRN: true,  matchAmount: true  },
  { id: "INV-2026-4815", vendor: "Zimbabwe Pharma Holdings",         poRef: "PO-2026-0374", grnRef: "GRN-2026-0852", amount: "USD 980,000",   amountNum: 980000,  submitted: "2026-06-09", due: "2026-07-09", status: "Scheduled", matchPO: true,  matchGRN: true,  matchAmount: true,  note: "Scheduled for payment — 2026-07-09" },
  { id: "INV-2026-4814", vendor: "Granite Construction Group",       poRef: "PO-2026-0360", grnRef: "GRN-2026-0841", amount: "USD 720,000",   amountNum: 720000,  submitted: "2026-06-08", due: "2026-07-08", status: "Rejected",  matchPO: true,  matchGRN: true,  matchAmount: false, note: "Rejected — vendor blacklisted. ZACC referral active." },
];

const STATUS_TONE: Record<InvoiceStatus, "blue" | "amber" | "green" | "red" | "muted" | "violet"> = {
  Pending:   "amber",
  Matching:  "blue",
  Approved:  "green",
  Rejected:  "red",
  Exception: "red",
  Paid:      "muted",
  Scheduled: "violet",
};

/* ─── 3-Way Match Detail Modal ──────────────────────────────────────────── */
function MatchModal({ inv, onClose, onApprove, onReject, onFlag, onSchedule }: {
  inv: DemoInvoice;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onFlag: () => void;
  onSchedule: () => void;
}) {
  const checks = [
    { label: "Purchase Order Match",   passed: inv.matchPO,     detail: inv.matchPO ? `PO ${inv.poRef} verified — quantities and unit rates match` : `PO ${inv.poRef} not found or rates mismatch` },
    { label: "Goods Receipt Note",     passed: inv.matchGRN,    detail: inv.matchGRN ? `GRN ${inv.grnRef} confirmed by Stores Officer` : `GRN ${inv.grnRef} not yet issued — delivery unconfirmed` },
    { label: "Invoice Amount",         passed: inv.matchAmount, detail: inv.matchAmount ? `${inv.amount} matches contracted rate` : `${inv.amount} exceeds contracted rate — requires approval override` },
  ];
  const allPassed = inv.matchPO && inv.matchGRN && inv.matchAmount;
  const canApprove = inv.status === "Matching" || inv.status === "Pending";
  const canSchedule = inv.status === "Approved";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg sm:my-4">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-black/10">
          <div>
            <div className="text-sm font-bold text-black">Invoice Detail — 3-Way Match</div>
            <div className="text-xs text-black/50 mt-0.5">{inv.id} · {inv.vendor}</div>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg hover:bg-black/5 grid place-items-center text-black/40"><X className="h-4 w-4" /></button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Key facts */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Invoice ID",   value: inv.id },
              { label: "Vendor",       value: inv.vendor },
              { label: "PO Reference", value: inv.poRef },
              { label: "GRN Reference",value: inv.grnRef },
              { label: "Amount",       value: inv.amount },
              { label: "Due Date",     value: inv.due },
            ].map(f => (
              <div key={f.label} className="bg-[#EAF1F8] rounded-xl p-3">
                <div className="text-[10px] text-black/40 uppercase tracking-wider mb-0.5">{f.label}</div>
                <div className="text-xs font-semibold text-black leading-tight">{f.value}</div>
              </div>
            ))}
          </div>

          {/* 3-way match result */}
          <div>
            <div className="text-xs font-semibold text-black uppercase tracking-wider mb-2">3-Way Match Results</div>
            <div className="space-y-2">
              {checks.map(c => (
                <div key={c.label} className={`flex items-start gap-3 p-3 rounded-xl border ${c.passed ? "bg-slate-50 border-slate-200" : "bg-red-50 border-red-200"}`}>
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${c.passed ? "bg-[#0F172A]" : "bg-red-500"}`}>
                    {c.passed
                      ? <CheckCircle2 className="h-3 w-3 text-white" />
                      : <X className="h-3 w-3 text-white" />
                    }
                  </div>
                  <div>
                    <div className={`text-xs font-semibold ${c.passed ? "text-[#0F172A]" : "text-red-700"}`}>{c.label}</div>
                    <div className={`text-[11px] mt-0.5 ${c.passed ? "text-[#0F172A]" : "text-red-600"}`}>{c.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI note */}
          {inv.note && (
            <div className={`flex items-start gap-2 p-3 rounded-xl border ${allPassed ? "bg-slate-50 border-slate-200" : "bg-slate-50 border-slate-200"}`}>
              <Sparkles className={`h-4 w-4 flex-shrink-0 mt-0.5 ${allPassed ? "text-slate-600" : "text-slate-600"}`} />
              <div className={`text-xs ${allPassed ? "text-[#0F172A]" : "text-[#0F172A]"}`}>
                <strong>AI Note:</strong> {inv.note}
              </div>
            </div>
          )}

          {/* WHT calculation */}
          {(inv.status === "Matching" || inv.status === "Approved" || inv.status === "Scheduled") && (
            <div className="bg-[#EAF1F8] rounded-xl p-3">
              <div className="text-xs font-semibold text-black mb-2">Tax & Statutory Deductions</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-black/50">Invoice Amount</span><span className="font-medium text-black">{inv.amount}</span></div>
                <div className="flex justify-between"><span className="text-black/50">Withholding Tax (10%)</span><span className="text-red-600">- USD {(inv.amountNum * 0.1).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-black/50">IMTT (2%)</span><span className="text-red-600">- USD {(inv.amountNum * 0.02).toLocaleString()}</span></div>
                <div className="border-t border-black/10 pt-1 flex justify-between font-semibold"><span className="text-black">Net Payment</span><span className="text-[#0F172A]">USD {(inv.amountNum * 0.88).toLocaleString()}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Action footer */}
        <div className="px-5 pb-5 pt-3 border-t border-black/10 flex flex-wrap gap-2">
          {canApprove && allPassed && (
            <button onClick={onApprove}
              className="flex-1 h-9 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#0F172A] transition-colors flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Approve Invoice
            </button>
          )}
          {canApprove && !allPassed && (
            <button onClick={onApprove}
              className="flex-1 h-9 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#0F172A] transition-colors flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Override & Approve
            </button>
          )}
          {canApprove && (
            <button onClick={onReject}
              className="flex-1 h-9 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5">
              <Ban className="h-4 w-4" /> Reject
            </button>
          )}
          {(inv.status === "Pending" || inv.status === "Exception") && (
            <button onClick={onFlag}
              className="h-9 px-4 rounded-xl border border-slate-200 text-[#0F172A] bg-slate-50 text-sm font-medium hover:bg-slate-100 transition-colors flex items-center gap-1.5">
              <Flag className="h-4 w-4" /> Flag Exception
            </button>
          )}
          {canSchedule && (
            <button onClick={onSchedule}
              className="flex-1 h-9 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#0F172A] transition-colors flex items-center justify-center gap-1.5">
              <CreditCard className="h-4 w-4" /> Schedule Payment
            </button>
          )}
          <button onClick={onClose} className="h-9 px-4 rounded-xl border border-black/10 text-sm text-black/50 hover:bg-black/5 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

const PAYMENT_DATA = [
  { month: "Jan", invoices: 420, payments: 380 },
  { month: "Feb", invoices: 510, payments: 490 },
  { month: "Mar", invoices: 580, payments: 560 },
  { month: "Apr", invoices: 490, payments: 470 },
  { month: "May", invoices: 620, payments: 595 },
  { month: "Jun", invoices: 540, payments: 510 },
];

const CYCLE_DATA = [
  { month: "Jan", days: 32 }, { month: "Feb", days: 29 }, { month: "Mar", days: 31 },
  { month: "Apr", days: 27 }, { month: "May", days: 28 }, { month: "Jun", days: 26 },
];

export default function FinanceDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("Invoice Queue");
  const [invoices, setInvoices] = useState<DemoInvoice[]>(INITIAL_INVOICES);
  const [selectedInv, setSelectedInv] = useState<DemoInvoice | null>(null);
  const [showNewInv, setShowNewInv] = useState(false);
  const [newInv, setNewInv] = useState({ vendor: "", poRef: "", amount: "" });
  const [filterStatus, setFilterStatus] = useState<"All" | InvoiceStatus>("All");

  const updateStatus = (id: string, status: InvoiceStatus) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    // Push to current user
    pushNotification(`Invoice ${id} → ${status}`, status === "Approved" || status === "Scheduled" ? "success" : status === "Rejected" ? "error" : "warning");
    // Push senior alert to CPO
    pushSeniorAlert(
      `Finance Officer ${status === "Approved" ? "approved" : status === "Rejected" ? "rejected" : status === "Scheduled" ? "scheduled payment for" : status === "Paid" ? "marked as paid" : "flagged"} invoice ${id}`,
      status === "Approved" || status === "Paid" || status === "Scheduled" ? "success" : status === "Rejected" ? "error" : "warning",
      { from: user?.name, fromRole: "Finance Officer", category: "action", ref: id }
    );
    // Save AI report summary
    saveAIReport({
      officer: user?.name ?? "Finance Officer",
      role: "Finance Officer",
      date: new Date().toISOString().split("T")[0],
      summary: `Invoice ${id} status changed to ${status}. Action taken by ${user?.name}.`,
      actions: [
        { time: new Date().toLocaleTimeString(), action: `Invoice ${status}`, ref: id, outcome: status },
      ],
      sentToCPO: true,
    });
    setSelectedInv(null);
  };

  const handleNewInvoice = () => {
    if (!newInv.vendor || !newInv.amount) return;
    const inv: DemoInvoice = {
      id: `INV-2026-${Date.now().toString().slice(-4)}`,
      vendor: newInv.vendor, poRef: newInv.poRef || "PO-TBC", grnRef: "GRN-TBC",
      amount: `USD ${Number(newInv.amount).toLocaleString()}`, amountNum: Number(newInv.amount),
      submitted: new Date().toISOString().split("T")[0],
      due: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      status: "Pending", matchPO: false, matchGRN: false, matchAmount: true,
      note: "Newly submitted — awaiting PO and GRN verification",
    };
    setInvoices(prev => [inv, ...prev]);
    pushNotification(`Invoice ${inv.id} submitted for processing`, "success");
    setShowNewInv(false);
    setNewInv({ vendor: "", poRef: "", amount: "" });
  };

  const filtered = filterStatus === "All" ? invoices : invoices.filter(i => i.status === filterStatus);

  const counts = {
    pending:   invoices.filter(i => i.status === "Pending" || i.status === "Matching").length,
    approved:  invoices.filter(i => i.status === "Approved").length,
    exception: invoices.filter(i => i.status === "Exception" || i.status === "Rejected").length,
    paid:      invoices.filter(i => i.status === "Paid" || i.status === "Scheduled").length,
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Ministry of Finance & Economic Development"
        module="Finance"
        process="Finance Dashboard"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title={`Finance Officer — ${user?.name}`}
          description="Invoice approval, 3-way matching, payment scheduling, and budget monitoring"
          actions={
            <div className="flex gap-2">
              <button onClick={() => user && generateDailyReportPDF(user)}
                className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm font-medium hover:bg-[#EAF1F8] flex items-center gap-1.5 transition-colors">
                <Download className="h-4 w-4" /> <span className="hidden sm:inline">Report</span>
              </button>
              <button onClick={() => setShowNewInv(!showNewInv)}
                className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800 transition-colors">
                <Plus className="h-4 w-4" /> New Invoice
              </button>
            </div>
          }
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Awaiting Action" value={String(counts.pending)} delta="Approve or reject" positive={false} icon={Clock} color="amber" />
          <KpiCard label="Approved" value={String(counts.approved)} delta="Ready to pay" icon={CheckCircle2} color="green" />
          <KpiCard label="Exceptions / Rejected" value={String(counts.exception)} delta="Need resolution" positive={false} icon={AlertTriangle} color="red" />
          <KpiCard label="Paid / Scheduled" value={String(counts.paid)} delta="This cycle" icon={DollarSign} color="blue" />
        </div>

        {/* New invoice form */}
        {showNewInv && (
          <Card className="mb-4 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-black">Submit New Invoice</div>
              <button onClick={() => setShowNewInv(false)}><X className="h-4 w-4 text-black/30" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium text-black/40 uppercase tracking-wider">Vendor Name *</label>
                <input value={newInv.vendor} onChange={e => setNewInv(n => ({ ...n, vendor: e.target.value }))}
                  placeholder="e.g. Highveld Engineering" className="mt-1 w-full h-9 px-3 rounded-xl border border-black/10 bg-[#EAF1F8] text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <div>
                <label className="text-xs font-medium text-black/40 uppercase tracking-wider">PO Reference</label>
                <input value={newInv.poRef} onChange={e => setNewInv(n => ({ ...n, poRef: e.target.value }))}
                  placeholder="PO-2026-XXXX" className="mt-1 w-full h-9 px-3 rounded-xl border border-black/10 bg-[#EAF1F8] text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <div>
                <label className="text-xs font-medium text-black/40 uppercase tracking-wider">Amount (USD) *</label>
                <input type="number" value={newInv.amount} onChange={e => setNewInv(n => ({ ...n, amount: e.target.value }))}
                  placeholder="0.00" className="mt-1 w-full h-9 px-3 rounded-xl border border-black/10 bg-[#EAF1F8] text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleNewInvoice} className="h-9 px-5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors">Submit</button>
              <button onClick={() => setShowNewInv(false)} className="h-9 px-4 rounded-xl border border-black/10 text-sm hover:bg-[#EAF1F8] transition-colors">Cancel</button>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-black/10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0 ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}</button>
          ))}
        </div>

        {/* ── INVOICE QUEUE ── */}
        {tab === "Invoice Queue" && (
          <div className="space-y-4">
            {/* Status filter chips */}
            <div className="flex gap-2 flex-wrap">
              {(["All", "Pending", "Matching", "Approved", "Scheduled", "Exception", "Rejected", "Paid"] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`h-7 px-3 rounded-full text-xs font-medium transition-colors ${filterStatus === s ? "bg-black text-white" : "border border-black/10 bg-white text-black/60 hover:border-black/30"}`}>
                  {s} {s === "All" ? `(${invoices.length})` : `(${invoices.filter(i => i.status === s).length})`}
                </button>
              ))}
            </div>

            {/* Invoice cards — mobile-friendly card layout */}
            <div className="space-y-3">
              {filtered.map(inv => {
                const allPassed = inv.matchPO && inv.matchGRN && inv.matchAmount;
                const canAct = inv.status === "Pending" || inv.status === "Matching";
                const canSchedule = inv.status === "Approved";

                return (
                  <div key={inv.id} className={`bg-white border rounded-2xl p-4 shadow-sm transition-all hover:shadow-md ${
                    inv.status === "Exception" || inv.status === "Rejected" ? "border-red-200" :
                    inv.status === "Matching" ? "border-slate-200" :
                    inv.status === "Approved" ? "border-slate-200" : "border-black/10"
                  }`}>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-mono text-black/40">{inv.id}</span>
                          <Badge tone={STATUS_TONE[inv.status]}>{inv.status}</Badge>
                        </div>
                        <div className="text-sm font-semibold text-black">{inv.vendor}</div>
                        <div className="text-xs text-black/40 mt-0.5">{inv.poRef} · Submitted {inv.submitted} · Due {inv.due}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-base font-bold text-black">{inv.amount}</div>
                        <div className="text-[11px] text-black/40">Net: USD {(inv.amountNum * 0.88).toLocaleString()}</div>
                      </div>
                    </div>

                    {/* 3-way match indicators */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {[
                        { label: "PO Match",   ok: inv.matchPO },
                        { label: "GRN Match",  ok: inv.matchGRN },
                        { label: "Amount OK",  ok: inv.matchAmount },
                      ].map(m => (
                        <span key={m.label} className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${m.ok ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-600"}`}>
                          {m.ok ? "✓" : "✗"} {m.label}
                        </span>
                      ))}
                      {inv.note && (
                        <span className="text-[11px] text-black/40 italic self-center">— {inv.note}</span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {canAct && allPassed && (
                        <button onClick={() => updateStatus(inv.id, "Approved")}
                          className="h-8 px-4 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#0F172A] transition-colors flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </button>
                      )}
                      {canAct && !allPassed && (
                        <button onClick={() => updateStatus(inv.id, "Approved")}
                          className="h-8 px-4 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#0F172A] transition-colors flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Override Approve
                        </button>
                      )}
                      {canAct && (
                        <button onClick={() => updateStatus(inv.id, "Rejected")}
                          className="h-8 px-4 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors flex items-center gap-1.5">
                          <Ban className="h-3.5 w-3.5" /> Reject
                        </button>
                      )}
                      {(inv.status === "Pending" || inv.status === "Exception") && (
                        <button onClick={() => updateStatus(inv.id, "Exception")}
                          className="h-8 px-3 rounded-xl border border-slate-200 bg-slate-50 text-[#0F172A] text-xs font-medium hover:bg-slate-100 transition-colors flex items-center gap-1.5">
                          <Flag className="h-3.5 w-3.5" /> Flag Exception
                        </button>
                      )}
                      {canSchedule && (
                        <button onClick={() => updateStatus(inv.id, "Scheduled")}
                          className="h-8 px-4 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#0F172A] transition-colors flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5" /> Schedule Pay
                        </button>
                      )}
                      {inv.status === "Scheduled" && (
                        <button onClick={() => updateStatus(inv.id, "Paid")}
                          className="h-8 px-4 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 transition-colors flex items-center gap-1.5">
                          <Send className="h-3.5 w-3.5" /> Mark as Paid
                        </button>
                      )}
                      {/* View detail always available */}
                      <button onClick={() => setSelectedInv(inv)}
                        className="h-8 px-3 rounded-xl border border-black/10 text-xs text-black/60 hover:bg-black/5 transition-colors flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> Full Detail
                      </button>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-black/40 text-sm">No invoices with status "{filterStatus}".</div>
              )}
            </div>
          </div>
        )}

        {/* ── PAYMENT SCHEDULE ── */}
        {tab === "Payment Schedule" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader title="Invoice vs Payment Volume" subtitle="Monthly count comparison" />
                <div className="p-4 h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PAYMENT_DATA}>
                      <CartesianGrid stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="month" stroke="#aaa" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#aaa" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #eee", borderRadius: 10, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="invoices" fill="#111" radius={[3,3,0,0]} name="Invoices Received" />
                      <Bar dataKey="payments" fill="#6b7280" radius={[3,3,0,0]} name="Payments Made" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <CardHeader title="Avg Payment Cycle Time" subtitle="Days from invoice to payment" />
                <div className="p-4 h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={CYCLE_DATA}>
                      <CartesianGrid stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="month" stroke="#aaa" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis domain={[20,40]} stroke="#aaa" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #eee", borderRadius: 10, fontSize: 12 }} />
                      <Line type="monotone" dataKey="days" stroke="#334155" strokeWidth={2.5} dot={{ r: 4, fill: "#334155" }} name="Avg Days" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Upcoming payments */}
            <Card>
              <CardHeader title="Approved — Pending Payment" action={<Badge tone="blue">{counts.approved} invoices</Badge>} />
              <div className="divide-y divide-black/5">
                {invoices.filter(i => i.status === "Approved").map(inv => (
                  <div key={inv.id} className="px-5 py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-medium text-black">{inv.vendor}</div>
                      <div className="text-xs text-black/40">{inv.id} · Due {inv.due}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-black">{inv.amount}</div>
                      <div className="text-xs text-black/40">Net USD {(inv.amountNum * 0.88).toLocaleString()}</div>
                      <button onClick={() => updateStatus(inv.id, "Scheduled")}
                        className="h-8 px-4 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#0F172A] transition-colors flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5" /> Schedule
                      </button>
                    </div>
                  </div>
                ))}
                {counts.approved === 0 && (
                  <div className="px-5 py-6 text-sm text-black/40 text-center">No approved invoices pending payment.</div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ── BUDGET ── */}
        {tab === "Budget" && (
          <div className="space-y-3">
            {[
              { cat: "Infrastructure", total: 840, spent: 612, committed: 180, color: "bg-[#0F172A]" },
              { cat: "Health & Pharma", total: 420, spent: 318, committed: 52,  color: "bg-[#0F172A]" },
              { cat: "ICT & Digital",   total: 210, spent: 148, committed: 40,  color: "bg-[#0F172A]" },
              { cat: "Agriculture",     total: 380, spent: 272, committed: 68,  color: "bg-[#0F172A]" },
              { cat: "Education",       total: 180, spent: 124, committed: 31,  color: "bg-[#0F172A]" },
            ].map(b => {
              const spentPct = Math.round((b.spent / b.total) * 100);
              const committedPct = Math.round((b.committed / b.total) * 100);
              const available = b.total - b.spent - b.committed;
              return (
                <div key={b.cat} className="bg-white border border-black/10 rounded-2xl px-5 py-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-black">{b.cat}</span>
                    <span className="text-xs text-black/50">USD {b.spent}M spent · USD {b.committed}M committed · <span className="font-semibold text-black">USD {available}M available</span></span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden mb-1.5">
                    <div className="h-full flex">
                      <div className={`h-full ${b.color}`} style={{ width: `${spentPct}%` }} />
                      <div className="h-full bg-gray-300" style={{ width: `${committedPct}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-4 text-[11px] text-black/50">
                    <span><span className="inline-block h-2 w-2 rounded-full bg-gray-800 mr-1" />Spent {spentPct}%</span>
                    <span><span className="inline-block h-2 w-2 rounded-full bg-gray-300 mr-1" />Committed {committedPct}%</span>
                    <span className="ml-auto">Total: USD {b.total}M</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── AI INSIGHTS ── */}
        {tab === "AI Insights" && (
          <div className="space-y-3">
            {[
              {
                icon: AlertTriangle, color: "text-red-500", bg: "border-red-200 bg-red-50",
                title: "Overpricing Detected",
                body: "INV-2026-4819 — Sable ICT Solutions billed 18% above contract rate for Phase 1 deliverables. Contract rate: USD 576,271. Billed: USD 680,000.",
                action: "Reject Invoice",
                actionColor: "bg-red-600 hover:bg-red-700",
                fn: () => { updateStatus("INV-2026-4819", "Rejected"); }
              },
              {
                icon: CheckCircle2, color: "text-slate-600", bg: "border-slate-200 bg-slate-50",
                title: "3-Way Match Passed — Ready to Approve",
                body: "INV-2026-4821 — Highveld Engineering: PO ✓ · GRN ✓ · Amount ✓. Net payment after deductions: USD 2,499,200. Low risk.",
                action: "Approve Now",
                actionColor: "bg-[#0F172A] hover:bg-[#0F172A]",
                fn: () => { updateStatus("INV-2026-4821", "Approved"); }
              },
              {
                icon: Sparkles, color: "text-slate-600", bg: "border-slate-200 bg-slate-50",
                title: "Payment Forecast — 14 Days",
                body: "USD 48.2M due across 6 approved invoices in the next 14 days. Recommend initiating treasury batch transfer by June 28 to meet all due dates.",
                action: "Generate Schedule",
                actionColor: "bg-[#0F172A] hover:bg-[#0F172A]",
                fn: () => { pushNotification("Payment schedule generated", "success"); toast("Payment batch ready — Highveld USD 2.84M (Jul 15), Bulawayo Civil USD 5.6M (Jul 10), Zim Pharma USD 980K (Jul 09). Net disbursement: USD 8.27M. WHT to ZIMRA: USD 1.01M.", "success"); }
              },
              {
                icon: AlertTriangle, color: "text-slate-600", bg: "border-slate-200 bg-slate-50",
                title: "Duplicate Invoice Risk",
                body: "INV-2026-4817 (Eastern Highlands Logistics — USD 440,000) matches amount and vendor of an invoice paid 31 days ago. AI confidence: 87% duplicate.",
                action: "Flag & Hold",
                actionColor: "bg-[#0F172A] hover:bg-[#0F172A]",
                fn: () => { updateStatus("INV-2026-4817", "Exception"); }
              },
              {
                icon: FileText, color: "text-[#0F172A]", bg: "border-slate-200 bg-slate-50",
                title: "GRN Pending — Zim Pharma",
                body: "INV-2026-4820 cannot be approved until Stores Officer issues GRN-2026-0891. Payment auto-hold active. Estimated GRN clearance: 2 business days.",
                action: "Notify Stores",
                actionColor: "bg-[#0F172A] hover:bg-[#0F172A]",
                fn: () => { pushNotification("Stores Officer notified to issue GRN-2026-0891", "info"); toast("Notification sent to Stores Officer — please issue GRN-2026-0891 for Zimbabwe Pharma Holdings (ARV Batch 7). Payment of USD 1.2M on hold until GRN confirmed.", "info"); }
              },
            ].map((a, i) => (
              <div key={i} className={`border rounded-2xl px-5 py-4 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row ${a.bg}`}>
                <div className="flex items-start gap-3">
                  <a.icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${a.color}`} />
                  <div>
                    <div className="text-sm font-semibold text-black">{a.title}</div>
                    <div className="text-xs text-black/60 mt-0.5 leading-relaxed">{a.body}</div>
                  </div>
                </div>
                <button onClick={a.fn}
                  className={`${a.actionColor} text-white text-xs font-semibold h-8 px-4 rounded-xl transition-colors flex-shrink-0 flex items-center gap-1.5`}>
                  {a.action}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "Today" && <TodayActivity />}
      </div>

      {/* Detail Modal */}
      {selectedInv && (
        <MatchModal
          inv={selectedInv}
          onClose={() => setSelectedInv(null)}
          onApprove={() => updateStatus(selectedInv.id, "Approved")}
          onReject={() => updateStatus(selectedInv.id, "Rejected")}
          onFlag={() => updateStatus(selectedInv.id, "Exception")}
          onSchedule={() => updateStatus(selectedInv.id, "Scheduled")}
        />
      )}

      <AIAssistantPanel agentName="Payment AI" agentRole="Invoice validation, fraud detection, payment risk" context="finance dashboard" color="blue"
        suggestedPrompts={["Check for duplicate invoices","Validate 3-way match","Forecast cash flow","Flag overpriced invoices"]} />
    </AppShell>
  );
}
