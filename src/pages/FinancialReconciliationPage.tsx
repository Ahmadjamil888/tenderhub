import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { DollarSign, CheckCircle2, AlertTriangle, Download, Search, Plus, Eye, X, TrendingUp, FileText, Sparkles } from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type ReconciliationStatus = "Complete" | "In Progress" | "Pending" | "Disputed" | "Verified";

type FinancialReconciliation = {
  id: string; contractNumber: string; projectTitle: string; supplierName: string;
  ministry: string; originalContractValue: number; approvedVariations: number;
  finalContractValue: number; totalPayments: number; retentionReleased: number;
  outstandingBalance: number; taxesDeducted: number; status: ReconciliationStatus;
  reconciliationDate: string; verifiedBy: string; allObligationsMet: boolean;
};

const SEED_RECS: FinancialReconciliation[] = [
  { id: "FR-2026-001", contractNumber: "CN-2025-0312", projectTitle: "Harare Water Treatment Phase I", supplierName: "Highveld Engineering", ministry: "Ministry of Water", originalContractValue: 12800000, approvedVariations: 320000, finalContractValue: 13100000, totalPayments: 11770000, retentionReleased: 1310000, outstandingBalance: 20000, taxesDeducted: 1310000, status: "In Progress", reconciliationDate: "2026-06-20", verifiedBy: "R. Chikwanda", allObligationsMet: false },
  { id: "FR-2026-002", contractNumber: "CN-2026-0399", projectTitle: "Pfumvudza Fertiliser 2025/26", supplierName: "Mashonaland Agri Supplies", ministry: "Ministry of Agriculture", originalContractValue: 28400000, approvedVariations: 0, finalContractValue: 28400000, totalPayments: 27018000, retentionReleased: 0, outstandingBalance: 1382000, taxesDeducted: 2840000, status: "Pending", reconciliationDate: "", verifiedBy: "", allObligationsMet: false },
  { id: "FR-2025-018", contractNumber: "CN-2025-0287", projectTitle: "ZESA Substation Upgrade", supplierName: "Zimbabwe Electro Systems", ministry: "ZESA", originalContractValue: 8500000, approvedVariations: 420000, finalContractValue: 8920000, totalPayments: 8920000, retentionReleased: 892000, outstandingBalance: 0, taxesDeducted: 892000, status: "Complete", reconciliationDate: "2025-09-15", verifiedBy: "T. Moyo", allObligationsMet: true },
];

const STATUS_COLOR: Record<ReconciliationStatus, string> = {
  Complete: "bg-slate-100 text-[#0F172A]", "In Progress": "bg-slate-100 text-[#0F172A]",
  Pending: "bg-gray-100 text-gray-600", Disputed: "bg-red-100 text-red-700",
  Verified: "bg-slate-100 text-[#0F172A]",
};

function fmt(n: number) { return `USD ${n.toLocaleString()}`; }

function RecDetailModal({ rec, onClose, onVerify }: { rec: FinancialReconciliation; onClose: () => void; onVerify: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <div>
            <div className="text-sm font-bold">{rec.contractNumber} — Financial Reconciliation</div>
            <div className="text-xs text-black/50 mt-0.5">{rec.projectTitle} · {rec.supplierName}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[rec.status]}`}>{rec.status}</span>
            <button onClick={onClose}><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-black text-white rounded-xl p-4">
            <div className="text-xs text-white/60 mb-3 uppercase tracking-wider font-semibold">Financial Summary</div>
            <div className="space-y-2">
              {[
                ["Original Contract Value", fmt(rec.originalContractValue)],
                ["Approved Variations", fmt(rec.approvedVariations)],
                ["Final Contract Value", fmt(rec.finalContractValue)],
                ["Total Payments Made", fmt(rec.totalPayments)],
                ["Retention Released", fmt(rec.retentionReleased)],
                ["Taxes / WHT Deducted", fmt(rec.taxesDeducted)],
                ["Outstanding Balance", fmt(rec.outstandingBalance)],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-xs text-white/70">{l}</span>
                  <span className={`text-xs font-semibold ${l === "Outstanding Balance" && rec.outstandingBalance > 0 ? "text-slate-400" : "text-white"}`}>{v}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/20 mt-3 pt-3 flex justify-between">
              <span className="text-xs text-white/60">Net Position</span>
              <span className={`text-sm font-bold ${rec.outstandingBalance === 0 ? "text-slate-400" : "text-slate-400"}`}>
                {rec.outstandingBalance === 0 ? "✓ BALANCED" : `${fmt(rec.outstandingBalance)} OUTSTANDING`}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "All Obligations Met", done: rec.allObligationsMet },
              { label: "Final Payment Made", done: rec.outstandingBalance === 0 },
              { label: "Retention Released", done: rec.retentionReleased > 0 },
            ].map(({ label, done }) => (
              <div key={label} className={`rounded-xl p-3 flex items-center gap-2 ${done ? "bg-slate-50" : "bg-slate-50"}`}>
                {done ? <CheckCircle2 className="h-4 w-4 text-[#0F172A]" /> : <AlertTriangle className="h-4 w-4 text-slate-600" />}
                <span className="text-xs font-medium text-black">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-black/8 px-6 py-3 flex justify-between bg-[#fafafa]">
          {rec.status !== "Complete" && (
            <button onClick={onVerify} className="h-8 px-4 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800">
              Verify & Complete
            </button>
          )}
          <button onClick={() => pushNotification("Financial summary report downloaded.", "success")} className="h-8 px-4 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1.5 ml-auto">
            <Download className="h-3.5 w-3.5" />Financial Summary
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FinancialReconciliationPage() {
  const [recs, setRecs] = useState(SEED_RECS);
  const [selected, setSelected] = useState<FinancialReconciliation | null>(null);
  const [search, setSearch] = useState("");

  const verify = (id: string) => {
    setRecs(prev => prev.map(r => r.id === id ? { ...r, status: "Complete", allObligationsMet: true, outstandingBalance: 0, reconciliationDate: new Date().toISOString().split("T")[0], verifiedBy: "T. Moyo" } : r));
    pushNotification("Financial reconciliation verified and completed.", "success");
    setSelected(null);
  };

  const totalValue = recs.reduce((s, r) => s + r.finalContractValue, 0);
  const totalPaid = recs.reduce((s, r) => s + r.totalPayments, 0);

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Ministry of Finance & Economic Development"
        module="Finance"
        process="Financial Reconciliation"
        financialYear="FY2026"
        pageType="workbench"
      />
      {selected && <RecDetailModal rec={selected} onClose={() => setSelected(null)} onVerify={() => verify(selected.id)} />}
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Final Financial Reconciliation"
          description="Verify all financial obligations before contract closure. Track contract values, payments, retention releases, and outstanding balances."
          actions={
            <button onClick={() => pushNotification("Financial reconciliation report generated.", "success")} className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary">
              <Download className="h-4 w-4" />Export
            </button>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Contract Value" value={`USD ${(totalValue / 1000000).toFixed(1)}M`} delta="Final values" />
          <KpiCard label="Total Paid" value={`USD ${(totalPaid / 1000000).toFixed(1)}M`} delta="Payments processed" positive />
          <KpiCard label="Completed" value={String(recs.filter(r => r.status === "Complete").length)} delta="Fully reconciled" positive />
          <KpiCard label="Pending" value={String(recs.filter(r => r.status !== "Complete").length)} delta="Awaiting completion" positive={false} />
        </div>
        <Card>
          <div className="flex gap-3 p-4 border-b border-black/8">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reconciliations…" className="w-full h-9 pl-9 pr-4 rounded-lg border border-black/10 text-sm focus:outline-none" /></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F8F8] border-b border-black/8">
                <tr>{["Contract #", "Project", "Supplier", "Final Value", "Total Paid", "Retention", "Outstanding", "Taxes", "Status", "Verified By", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-black/50 whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {recs.filter(r => r.projectTitle.toLowerCase().includes(search.toLowerCase()) || r.contractNumber.toLowerCase().includes(search.toLowerCase())).map(r => (
                  <tr key={r.id} className="hover:bg-[#F8F8F8]/60">
                    <td className="px-4 py-3 text-xs font-semibold text-black">{r.contractNumber}</td>
                    <td className="px-4 py-3 text-xs text-black max-w-[180px] truncate">{r.projectTitle}</td>
                    <td className="px-4 py-3 text-xs text-black/70">{r.supplierName}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-black">{fmt(r.finalContractValue)}</td>
                    <td className="px-4 py-3 text-xs text-[#0F172A] font-medium">{fmt(r.totalPayments)}</td>
                    <td className="px-4 py-3 text-xs text-black/60">{fmt(r.retentionReleased)}</td>
                    <td className="px-4 py-3 text-xs font-semibold">{r.outstandingBalance > 0 ? <span className="text-[#0F172A]">{fmt(r.outstandingBalance)}</span> : <span className="text-[#0F172A]">USD 0</span>}</td>
                    <td className="px-4 py-3 text-xs text-black/60">{fmt(r.taxesDeducted)}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status]}`}>{r.status}</span></td>
                    <td className="px-4 py-3 text-xs text-black/60">{r.verifiedBy || "—"}</td>
                    <td className="px-4 py-3"><button onClick={() => setSelected(r)} className="h-7 px-2.5 rounded-lg bg-black text-white text-[10px] hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3" />View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
