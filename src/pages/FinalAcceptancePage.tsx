import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { CheckCircle2, AlertTriangle, FileText, Users, Download, Plus, Search, Eye, X, Pen, Clock, Shield } from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import { useAuth } from "@/lib/auth-context";

type AcceptanceStatus = "Pending" | "Under Review" | "Accepted" | "Rejected" | "Conditional";

type FinalAcceptance = {
  id: string; acceptanceNumber: string; contractNumber: string;
  projectTitle: string; supplierName: string; ministry: string;
  acceptanceDate: string; inspectionDate: string;
  inspectionTeam: string[]; status: AcceptanceStatus;
  acceptanceComments: string; outstandingDefects: number;
  warrantyPeriod: string; digitalSignatures: string[];
  inspectionResults: { area: string; result: "Pass" | "Fail" | "Conditional"; notes: string }[];
};

const SEED_ACCEPTANCES: FinalAcceptance[] = [
  {
    id: "FA-2026-001", acceptanceNumber: "FA-2026-001", contractNumber: "CN-2025-0312",
    projectTitle: "Harare Water Treatment Phase I", supplierName: "Highveld Engineering",
    ministry: "Ministry of Water", acceptanceDate: "2026-01-20", inspectionDate: "2026-01-18",
    inspectionTeam: ["T. Moyo (CPO)", "J. Banda (PM)", "Eng. P. Mwanza (Civil)", "Dr S. Nkosi (Quality)"],
    status: "Accepted", acceptanceComments: "All deliverables meet or exceed contractual specifications. Minor punch list items resolved satisfactorily.",
    outstandingDefects: 0, warrantyPeriod: "24 months",
    digitalSignatures: ["T. Moyo — 2026-01-20 14:22", "Highveld Engineering CEO — 2026-01-20 15:05"],
    inspectionResults: [
      { area: "Civil Structures", result: "Pass", notes: "All structures meet design specifications" },
      { area: "Mechanical Systems", result: "Pass", notes: "All pumps and valves operational" },
      { area: "Electrical & Control", result: "Pass", notes: "SCADA system fully functional" },
      { area: "Water Quality Testing", result: "Pass", notes: "Output water meets WHO standards" },
      { area: "Documentation", result: "Pass", notes: "All as-built drawings and manuals provided" },
    ],
  },
  {
    id: "FA-2026-002", acceptanceNumber: "FA-2026-002", contractNumber: "CN-2026-0399",
    projectTitle: "Pfumvudza Fertiliser 2025/26", supplierName: "Mashonaland Agri Supplies",
    ministry: "Ministry of Agriculture", acceptanceDate: "", inspectionDate: "2026-06-05",
    inspectionTeam: ["R. Chikwanda (CM)", "Dr A. Chiware (Agronomist)"],
    status: "Under Review", acceptanceComments: "Quality samples being analysed. Results expected by 30 June.",
    outstandingDefects: 2, warrantyPeriod: "12 months",
    digitalSignatures: [],
    inspectionResults: [
      { area: "Product Quality — Compound D", result: "Conditional", notes: "2 batches pending lab analysis" },
      { area: "Quantity Delivered", result: "Pass", notes: "50,000 bags confirmed delivered" },
      { area: "Packaging & Labelling", result: "Pass", notes: "All bags correctly labelled" },
      { area: "Documentation", result: "Pass", notes: "Delivery notes and certificates provided" },
    ],
  },
];

const STATUS_COLOR: Record<AcceptanceStatus, string> = {
  "Pending": "bg-gray-100 text-gray-600", "Under Review": "bg-slate-100 text-[#0F172A]",
  "Accepted": "bg-slate-100 text-[#0F172A]", "Rejected": "bg-red-100 text-red-700",
  "Conditional": "bg-slate-100 text-[#0F172A]",
};

function AcceptanceDetailModal({ acc, onClose, onAccept }: { acc: FinalAcceptance; onClose: () => void; onAccept: () => void }) {
  const [tab, setTab] = useState<"Overview" | "Inspection" | "Signatures">("Overview");
  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <div>
            <div className="text-sm font-bold">{acc.acceptanceNumber} — {acc.projectTitle}</div>
            <div className="text-xs text-black/50 mt-0.5">{acc.supplierName} · {acc.ministry}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[acc.status]}`}>{acc.status}</span>
            <button onClick={onClose}><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="flex gap-1 px-6 border-b border-black/8">
          {(["Overview", "Inspection", "Signatures"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-2.5 text-xs font-medium border-b-2 -mb-px ${tab === t ? "border-black text-black" : "border-transparent text-black/40"}`}>{t}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === "Overview" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Contract Number", acc.contractNumber], ["Ministry", acc.ministry],
                  ["Inspection Date", acc.inspectionDate], ["Acceptance Date", acc.acceptanceDate || "Pending"],
                  ["Warranty Period", acc.warrantyPeriod], ["Outstanding Defects", String(acc.outstandingDefects)],
                ].map(([l, v]) => (
                  <div key={l} className="bg-[#F8F8F8] rounded-xl p-3">
                    <div className="text-[10px] text-black/40 uppercase">{l}</div>
                    <div className="text-xs font-semibold text-black mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#F8F8F8] rounded-xl p-3">
                <div className="text-[10px] text-black/40 uppercase mb-2">Inspection Team</div>
                <div className="flex flex-wrap gap-1.5">{acc.inspectionTeam.map(m => <span key={m} className="text-xs bg-black text-white px-2 py-0.5 rounded-full">{m}</span>)}</div>
              </div>
              <div className="bg-[#F8F8F8] rounded-xl p-3">
                <div className="text-[10px] text-black/40 uppercase mb-2">Acceptance Comments</div>
                <div className="text-xs text-black/70 leading-relaxed">{acc.acceptanceComments}</div>
              </div>
            </>
          )}
          {tab === "Inspection" && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-black mb-2">Inspection Results by Area</div>
              {acc.inspectionResults.map((r, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${r.result === "Pass" ? "border-slate-200 bg-slate-50" : r.result === "Fail" ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
                  {r.result === "Pass" ? <CheckCircle2 className="h-4 w-4 text-[#0F172A] flex-shrink-0 mt-0.5" /> : r.result === "Fail" ? <X className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />}
                  <div>
                    <div className="text-xs font-semibold text-black">{r.area}</div>
                    <div className="text-[10px] text-black/60 mt-0.5">{r.notes}</div>
                  </div>
                  <span className={`ml-auto text-[10px] font-bold flex-shrink-0 ${r.result === "Pass" ? "text-[#0F172A]" : r.result === "Fail" ? "text-red-600" : "text-[#0F172A]"}`}>{r.result}</span>
                </div>
              ))}
            </div>
          )}
          {tab === "Signatures" && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-black mb-2">Digital Signatures</div>
              {acc.digitalSignatures.length === 0 ? (
                <div className="p-8 text-center text-black/30">
                  <Pen className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <div className="text-sm">No signatures yet</div>
                </div>
              ) : acc.digitalSignatures.map((sig, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-slate-200 bg-slate-50 rounded-xl">
                  <CheckCircle2 className="h-4 w-4 text-[#0F172A]" />
                  <span className="text-xs font-medium text-black">{sig}</span>
                </div>
              ))}
              <button onClick={() => pushNotification("Digital signature request sent.", "info")} className="h-8 px-4 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1.5">
                <Pen className="h-3.5 w-3.5" />Request Signature
              </button>
            </div>
          )}
        </div>
        <div className="border-t border-black/8 px-6 py-3 flex items-center justify-between bg-[#fafafa]">
          {acc.status !== "Accepted" && (
            <button onClick={onAccept} className="h-8 px-4 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800">
              Accept & Sign
            </button>
          )}
          <button onClick={() => pushNotification("Acceptance certificate downloaded.", "success")} className="h-8 px-4 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1.5 ml-auto">
            <Download className="h-3.5 w-3.5" />Acceptance Certificate
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FinalAcceptancePage() {
  const [acceptances, setAcceptances] = useState(SEED_ACCEPTANCES);
  const [selected, setSelected] = useState<FinalAcceptance | null>(null);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const accept = (id: string) => {
    setAcceptances(prev => prev.map(a => a.id === id ? {
      ...a, status: "Accepted" as AcceptanceStatus,
      acceptanceDate: new Date().toISOString().split("T")[0],
      digitalSignatures: [...a.digitalSignatures, `${user?.name ?? "Officer"} — ${new Date().toLocaleString()}`],
    } : a));
    pushNotification("Final acceptance confirmed. Acceptance certificate generated.", "success");
    setSelected(null);
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Final Acceptance"
        financialYear="FY2026"
        pageType="form"
      />
      {selected && <AcceptanceDetailModal acc={selected} onClose={() => setSelected(null)} onAccept={() => accept(selected.id)} />}
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Final Acceptance Workbench"
          description="Formal acceptance of completed works, services and supplies with inspection results, digital signatures and acceptance certificates."
          actions={
            <button onClick={() => pushNotification("New final acceptance record created.", "success")} className="h-9 px-3 rounded-md bg-black text-white text-sm flex items-center gap-1.5 hover:bg-gray-800">
              <Plus className="h-4 w-4" />New Acceptance
            </button>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Records" value={String(acceptances.length)} delta="All acceptance records" />
          <KpiCard label="Accepted" value={String(acceptances.filter(a => a.status === "Accepted").length)} delta="Formally accepted" positive />
          <KpiCard label="Under Review" value={String(acceptances.filter(a => a.status === "Under Review").length)} delta="Being reviewed" positive={false} />
          <KpiCard label="Outstanding Defects" value={String(acceptances.reduce((s, a) => s + a.outstandingDefects, 0))} delta="Total open defects" positive={false} />
        </div>
        <Card>
          <div className="flex gap-3 p-4 border-b border-black/8">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search acceptances…" className="w-full h-9 pl-9 pr-4 rounded-lg border border-black/10 text-sm focus:outline-none" /></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F8F8] border-b border-black/8">
                <tr>{["Acceptance #", "Contract #", "Project", "Supplier", "Inspection Date", "Acceptance Date", "Defects", "Warranty", "Status", "Signed", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-black/50 whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {acceptances.filter(a => a.projectTitle.toLowerCase().includes(search.toLowerCase()) || a.acceptanceNumber.toLowerCase().includes(search.toLowerCase())).map(a => (
                  <tr key={a.id} className="hover:bg-[#F8F8F8]/60">
                    <td className="px-4 py-3 text-xs font-semibold text-black">{a.acceptanceNumber}</td>
                    <td className="px-4 py-3 text-xs text-black/60">{a.contractNumber}</td>
                    <td className="px-4 py-3 text-xs text-black max-w-[180px] truncate">{a.projectTitle}</td>
                    <td className="px-4 py-3 text-xs text-black/70">{a.supplierName}</td>
                    <td className="px-4 py-3 text-xs text-black/60">{a.inspectionDate}</td>
                    <td className="px-4 py-3 text-xs text-black/60">{a.acceptanceDate || "—"}</td>
                    <td className="px-4 py-3 text-xs font-semibold">{a.outstandingDefects > 0 ? <span className="text-red-600">{a.outstandingDefects}</span> : <span className="text-[#0F172A]">0</span>}</td>
                    <td className="px-4 py-3 text-xs text-black/60">{a.warrantyPeriod}</td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[a.status]}`}>{a.status}</span></td>
                    <td className="px-4 py-3 text-xs font-semibold">{a.digitalSignatures.length > 0 ? <span className="text-[#0F172A]">{a.digitalSignatures.length}</span> : <span className="text-black/30">0</span>}</td>
                    <td className="px-4 py-3"><button onClick={() => setSelected(a)} className="h-7 px-2.5 rounded-lg bg-black text-white text-[10px] hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3" />View</button></td>
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
