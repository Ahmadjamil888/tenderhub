import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { Package, Plus, Search, Eye, X, Download, CheckCircle2, AlertTriangle, FileText, Users, Send } from "lucide-react";
import { pushNotification } from "@/lib/local-store";

type HandoverStatus = "Pending" | "Scheduled" | "In Progress" | "Completed" | "Disputed";
type AssetCondition = "Excellent" | "Good" | "Fair" | "Poor" | "Damaged";

type HandoverAsset = {
  id: string; assetId: string; assetName: string; quantity: number;
  unit: string; location: string; condition: AssetCondition;
  serialNumber: string; description: string;
};

type AssetHandover = {
  id: string; handoverNumber: string; contractNumber: string; projectTitle: string;
  supplierName: string; ministry: string; department: string;
  handoverDate: string; receivingOfficer: string; receivingDept: string;
  status: HandoverStatus; assets: HandoverAsset[];
  handoverCertificate: boolean; notes: string; createdAt: string;
};

const SEED_HANDOVERS: AssetHandover[] = [
  {
    id: "AHO-2026-001", handoverNumber: "AHO-2026-001", contractNumber: "CN-2025-0312",
    projectTitle: "Harare Water Treatment Phase I", supplierName: "Highveld Engineering",
    ministry: "Ministry of Water", department: "Water & Sanitation", handoverDate: "2026-01-20",
    receivingOfficer: "J. Banda", receivingDept: "Ministry of Water — Assets Division",
    status: "Completed", handoverCertificate: true,
    notes: "All equipment in excellent condition. Full documentation provided.",
    createdAt: "2026-01-18",
    assets: [
      { id: "HA-001", assetId: "AST-WTP-001", assetName: "Water Pump System Unit 1–3", quantity: 3, unit: "Units", location: "Harare Water Treatment Plant", condition: "Excellent", serialNumber: "WPS-HWT-001-003", description: "High-capacity centrifugal pumps" },
      { id: "HA-002", assetId: "AST-WTP-002", assetName: "Chemical Dosing System", quantity: 1, unit: "System", location: "Treatment Building A", condition: "Good", serialNumber: "CDS-HWT-001", description: "Automated chemical dosing for water treatment" },
      { id: "HA-003", assetId: "AST-WTP-003", assetName: "SCADA Control System", quantity: 1, unit: "System", location: "Control Room", condition: "Excellent", serialNumber: "SCADA-HWT-2025", description: "Plant monitoring and control system" },
    ],
  },
  {
    id: "AHO-2026-002", handoverNumber: "AHO-2026-002", contractNumber: "CN-2026-0399",
    projectTitle: "Pfumvudza Fertiliser 2025/26", supplierName: "Mashonaland Agri Supplies",
    ministry: "Ministry of Agriculture", department: "Agronomy Division", handoverDate: "2026-06-01",
    receivingOfficer: "P. Dube", receivingDept: "Ministry of Agriculture — Distribution",
    status: "Pending", handoverCertificate: false,
    notes: "Awaiting final delivery to district distribution centres.",
    createdAt: "2026-05-25",
    assets: [
      { id: "HA-004", assetId: "AST-AGR-001", assetName: "Compound D Fertiliser (50kg bags)", quantity: 50000, unit: "Bags", location: "Harare Agro Depot", condition: "Good", serialNumber: "COMPD-2026-BATCH-A", description: "Compound D fertiliser for Pfumvudza programme" },
    ],
  },
];

const STATUS_COLOR: Record<HandoverStatus, string> = {
  "Pending": "bg-gray-100 text-gray-600",
  "Scheduled": "bg-slate-100 text-[#0F172A]",
  "In Progress": "bg-slate-100 text-[#0F172A]",
  "Completed": "bg-slate-100 text-[#0F172A]",
  "Disputed": "bg-red-100 text-red-700",
};
const CONDITION_COLOR: Record<AssetCondition, string> = {
  "Excellent": "text-[#0F172A]", "Good": "text-[#0F172A]",
  "Fair": "text-[#0F172A]", "Poor": "text-red-500", "Damaged": "text-red-700",
};

function HandoverDetailModal({ ho, onClose, onComplete }: { ho: AssetHandover; onClose: () => void; onComplete: () => void }) {
  const [tab, setTab] = useState<"Overview" | "Assets" | "Certificate">("Overview");
  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <div>
            <div className="text-sm font-bold">{ho.handoverNumber} — {ho.projectTitle}</div>
            <div className="text-xs text-black/50 mt-0.5">{ho.supplierName} → {ho.receivingDept}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[ho.status]}`}>{ho.status}</span>
            <button onClick={onClose}><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="flex gap-1 px-6 border-b border-black/8">
          {(["Overview", "Assets", "Certificate"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-2.5 text-xs font-medium border-b-2 -mb-px ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "Overview" && (
            <div className="grid grid-cols-2 gap-4">
              {[
                ["Handover Number", ho.handoverNumber], ["Contract Number", ho.contractNumber],
                ["Ministry", ho.ministry], ["Department", ho.department],
                ["Handover Date", ho.handoverDate], ["Receiving Officer", ho.receivingOfficer],
                ["Receiving Department", ho.receivingDept], ["Status", ho.status],
                ["Total Assets", String(ho.assets.length)], ["Certificate Issued", ho.handoverCertificate ? "Yes" : "No"],
              ].map(([l, v]) => (
                <div key={l} className="bg-[#F8F8F8] rounded-xl p-3">
                  <div className="text-[10px] text-black/40 uppercase">{l}</div>
                  <div className="text-xs font-semibold text-black mt-0.5">{v}</div>
                </div>
              ))}
              {ho.notes && (
                <div className="col-span-2 bg-slate-50 rounded-xl p-3">
                  <div className="text-[10px] text-[#0F172A] font-semibold uppercase mb-1">Notes</div>
                  <div className="text-xs text-black/70">{ho.notes}</div>
                </div>
              )}
            </div>
          )}
          {tab === "Assets" && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-black mb-2">Asset Register ({ho.assets.length} items)</div>
              {ho.assets.map(a => (
                <div key={a.id} className="border border-black/8 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-semibold text-black">{a.assetName}</div>
                      <div className="text-[10px] text-black/50 mt-0.5">ID: {a.assetId} · S/N: {a.serialNumber}</div>
                    </div>
                    <span className={`text-xs font-semibold ${CONDITION_COLOR[a.condition]}`}>{a.condition}</span>
                  </div>
                  <div className="flex gap-4 mt-2 text-[10px] text-black/50">
                    <span>Qty: <span className="font-semibold text-black">{a.quantity} {a.unit}</span></span>
                    <span>Location: <span className="font-semibold text-black">{a.location}</span></span>
                  </div>
                  <div className="text-[10px] text-black/40 mt-1">{a.description}</div>
                </div>
              ))}
            </div>
          )}
          {tab === "Certificate" && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-black/20 rounded-2xl p-8 text-center">
                <FileText className="h-12 w-12 text-black/20 mx-auto mb-3" />
                {ho.handoverCertificate ? (
                  <>
                    <div className="text-sm font-bold text-[#0F172A]">Handover Certificate Issued</div>
                    <div className="text-xs text-black/50 mt-1">Document generated on {ho.handoverDate}</div>
                    <button onClick={() => pushNotification("Handover certificate downloaded.", "success")} className="mt-4 h-9 px-4 rounded-lg bg-black text-white text-sm flex items-center gap-2 mx-auto hover:bg-gray-800">
                      <Download className="h-4 w-4" />Download Certificate
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-semibold text-black/60">Certificate Not Yet Issued</div>
                    <div className="text-xs text-black/40 mt-1">Complete the handover process to generate the certificate.</div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-black/8 px-6 py-3 flex justify-between bg-[#fafafa]">
          {ho.status !== "Completed" && (
            <button onClick={onComplete} className="h-8 px-4 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800">
              Complete Handover
            </button>
          )}
          <button onClick={() => pushNotification("Asset register report generated.", "success")} className="h-8 px-4 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1.5 ml-auto">
            <Download className="h-3.5 w-3.5" />Asset Register Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AssetHandoverPage() {
  const [handovers, setHandovers] = useState(SEED_HANDOVERS);
  const [selected, setSelected] = useState<AssetHandover | null>(null);
  const [search, setSearch] = useState("");

  const stats = {
    total: handovers.length,
    completed: handovers.filter(h => h.status === "Completed").length,
    pending: handovers.filter(h => h.status === "Pending").length,
    totalAssets: handovers.reduce((sum, h) => sum + h.assets.length, 0),
  };

  const complete = (id: string) => {
    setHandovers(prev => prev.map(h => h.id === id ? { ...h, status: "Completed", handoverCertificate: true } : h));
    pushNotification("Asset handover completed and certificate generated.", "success");
    setSelected(null);
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Enterprise Asset Management"
        process="Asset Handover"
        financialYear="FY2026"
        pageType="form"
      />
      {selected && <HandoverDetailModal ho={selected} onClose={() => setSelected(null)} onComplete={() => complete(selected.id)} />}
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Asset Handover"
          description="Manage asset handover from contractors to government departments. Track asset registers and generate handover certificates."
          actions={
            <button onClick={() => pushNotification("New asset handover record created.", "success")} className="h-9 px-3 rounded-md bg-black text-white text-sm flex items-center gap-1.5 hover:bg-gray-800">
              <Plus className="h-4 w-4" />New Handover
            </button>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Handovers" value={String(stats.total)} delta="All records" />
          <KpiCard label="Completed" value={String(stats.completed)} delta="Successfully handed over" positive />
          <KpiCard label="Pending" value={String(stats.pending)} delta="Awaiting completion" positive={false} />
          <KpiCard label="Total Assets" value={String(stats.totalAssets)} delta="Assets tracked" />
        </div>

        <Card>
          <div className="flex gap-3 p-4 border-b border-black/8">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search handovers…" className="w-full h-9 pl-9 pr-4 rounded-lg border border-black/10 text-sm focus:outline-none" /></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F8F8] border-b border-black/8">
                <tr>{["Handover #", "Contract #", "Project", "Supplier", "Ministry", "Handover Date", "Receiving Officer", "Assets", "Status", "Certificate", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-black/50 whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {handovers.filter(h => h.projectTitle.toLowerCase().includes(search.toLowerCase()) || h.handoverNumber.toLowerCase().includes(search.toLowerCase())).map(h => (
                  <tr key={h.id} className="hover:bg-[#F8F8F8]/60">
                    <td className="px-4 py-3 text-xs font-semibold text-black">{h.handoverNumber}</td>
                    <td className="px-4 py-3 text-xs text-black/60">{h.contractNumber}</td>
                    <td className="px-4 py-3 text-xs text-black max-w-[180px] truncate">{h.projectTitle}</td>
                    <td className="px-4 py-3 text-xs text-black/70">{h.supplierName}</td>
                    <td className="px-4 py-3 text-xs text-black/60">{h.ministry}</td>
                    <td className="px-4 py-3 text-xs text-black/60">{h.handoverDate}</td>
                    <td className="px-4 py-3 text-xs text-black">{h.receivingOfficer}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-black">{h.assets.length}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[h.status]}`}>{h.status}</span></td>
                    <td className="px-4 py-3">{h.handoverCertificate ? <CheckCircle2 className="h-4 w-4 text-slate-600" /> : <X className="h-4 w-4 text-red-400" />}</td>
                    <td className="px-4 py-3"><button onClick={() => setSelected(h)} className="h-7 px-2.5 rounded-lg bg-black text-white text-[10px] hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3" />View</button></td>
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
