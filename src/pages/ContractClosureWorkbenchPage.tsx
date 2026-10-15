import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import {
  FileSignature, CheckCircle2, AlertTriangle, Clock, Download, Send, Search,
  Plus, X, Eye, Archive, RefreshCcw, DollarSign, Shield, Star, Sparkles,
  ChevronDown, ChevronRight, FileText, Users, Calendar, Package, TrendingUp,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import { useAuth } from "@/lib/auth-context";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type ClosureStatus = "Open" | "In Progress" | "Pending Approval" | "Closed" | "Archived" | "Reopened";
type ContractClosure = {
  id: string; contractNumber: string; tenderNumber: string;
  supplierName: string; projectTitle: string; ministry: string;
  contractValue: string; finalContractValue: string;
  completionDate: string; actualCompletionDate: string;
  contractStatus: ClosureStatus; finalPaymentStatus: "Paid" | "Pending" | "Partial" | "Disputed";
  warrantyStatus: "Active" | "Expired" | "Claimed" | "N/A";
  retentionReleased: boolean; closureCertificate: boolean;
  complianceScore: number; workflowProgress: number;
};

const SEED_CLOSURES: ContractClosure[] = [
  { id: "CCL-2026-001", contractNumber: "CN-2026-0399", tenderNumber: "ZW-PRA-2026-00180",
    supplierName: "Mashonaland Agri Supplies", projectTitle: "Pfumvudza Fertiliser 2025/26",
    ministry: "Ministry of Agriculture", contractValue: "USD 28,400,000", finalContractValue: "USD 28,150,000",
    completionDate: "2026-05-30", actualCompletionDate: "2026-05-28",
    contractStatus: "Pending Approval", finalPaymentStatus: "Pending", warrantyStatus: "Active",
    retentionReleased: false, closureCertificate: false, complianceScore: 96, workflowProgress: 75 },
  { id: "CCL-2026-002", contractNumber: "CN-2026-0388", tenderNumber: "ZW-PRA-2026-00178",
    supplierName: "Sable Press Ltd", projectTitle: "Primary School Textbooks 2025",
    ministry: "Ministry of Education", contractValue: "USD 5,200,000", finalContractValue: "USD 5,200,000",
    completionDate: "2026-11-01", actualCompletionDate: "",
    contractStatus: "In Progress", finalPaymentStatus: "Partial", warrantyStatus: "N/A",
    retentionReleased: false, closureCertificate: false, complianceScore: 88, workflowProgress: 45 },
  { id: "CCL-2025-018", contractNumber: "CN-2025-0312", tenderNumber: "ZW-PRA-2025-00142",
    supplierName: "Highveld Engineering (Pvt) Ltd", projectTitle: "Harare Water Treatment Phase I",
    ministry: "Ministry of Water", contractValue: "USD 12,800,000", finalContractValue: "USD 13,100,000",
    completionDate: "2025-12-31", actualCompletionDate: "2026-01-15",
    contractStatus: "Closed", finalPaymentStatus: "Paid", warrantyStatus: "Active",
    retentionReleased: true, closureCertificate: true, complianceScore: 92, workflowProgress: 100 },
];

const STATUS_COLOR: Record<ClosureStatus, string> = {
  "Open": "bg-gray-100 text-gray-600",
  "In Progress": "bg-slate-100 text-[#0F172A]",
  "Pending Approval": "bg-slate-100 text-[#0F172A]",
  "Closed": "bg-slate-100 text-[#0F172A]",
  "Archived": "bg-slate-100 text-[#0F172A]",
  "Reopened": "bg-red-100 text-red-700",
};

function AIClosureAssistant({ closure, onClose }: { closure: ContractClosure | null; onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<{ from: "ai" | "user"; text: string }[]>([
    { from: "ai", text: "I'm your Contract Closure AI. I can verify all contractual obligations, check financial reconciliation, validate warranty status, and generate closure certificates. How can I assist?" },
  ]);
  const send = () => {
    if (!msg.trim()) return;
    const user = msg.trim(); setMsg("");
    setChat(c => [...c, { from: "user", text: user }]);
    setTimeout(() => {
      let reply = "All closure conditions appear to be met. I recommend proceeding with the formal closure process.";
      if (user.toLowerCase().includes("warranty")) reply = `Warranty status: ${closure?.warrantyStatus ?? "N/A"}. I have configured automated alerts for warranty expiration. All warranty claims will be tracked in the defects register.`;
      else if (user.toLowerCase().includes("retention")) reply = `Retention release status: ${closure?.retentionReleased ? "Released" : "Pending"}. Retention can be released once the DLP certificate is issued and all defects are resolved.`;
      else if (user.toLowerCase().includes("payment")) reply = `Final payment status: ${closure?.finalPaymentStatus ?? "Unknown"}. Contract value: ${closure?.contractValue}. Final value: ${closure?.finalContractValue}. Variation: ${closure ? "Variance is within acceptable limits." : "N/A"}`;
      else if (user.toLowerCase().includes("certificate") || user.toLowerCase().includes("close")) reply = `Closure certificate can be generated once: (1) Final payment is confirmed, (2) DLP certificate issued, (3) Retention released, (4) All audit findings resolved. Current progress: ${closure?.workflowProgress ?? 0}%.`;
      setChat(c => [...c, { from: "ai", text: reply }]);
    }, 700);
  };
  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-black/10 shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 bg-black text-white">
        <div className="flex items-center gap-2"><Sparkles className="h-4 w-4" /><div><div className="text-xs font-bold">Closure AI</div><div className="text-[10px] text-white/60">Contract Closure Assistant</div></div></div>
        <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-white/10"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${m.from === "user" ? "bg-black text-white" : "bg-[#EAF1F8] text-black"}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-black/10 p-3 flex gap-2">
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about closure…" className="flex-1 h-8 px-3 rounded-lg border border-black/10 text-xs focus:outline-none" />
        <button onClick={send} className="h-8 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800"><Send className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

function ClosureDetailPanel({ cl, onClose, onUpdate }: {
  cl: ContractClosure; onClose: () => void;
  onUpdate: (patch: Partial<ContractClosure>) => void;
}) {
  const [tab, setTab] = useState<"Summary" | "Verification" | "Financial" | "Warranty" | "Documents">("Summary");
  const tabs = ["Summary", "Verification", "Financial", "Warranty", "Documents"] as const;
  const { user } = useAuth();
  const canReopen = user?.role === "cpo" || user?.role === "minister" || user?.role === "system_admin";

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <div>
            <div className="text-sm font-bold text-black">{cl.contractNumber} — {cl.projectTitle}</div>
            <div className="text-xs text-black/50 mt-0.5">{cl.supplierName} · {cl.ministry}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[cl.contractStatus]}`}>{cl.contractStatus}</span>
            <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-[#EAF1F8]"><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="flex gap-1 px-6 border-b border-black/8 overflow-x-auto">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-2.5 text-xs font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "Summary" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Contract Number", cl.contractNumber], ["Tender Number", cl.tenderNumber],
                  ["Supplier", cl.supplierName], ["Ministry", cl.ministry],
                  ["Contract Value", cl.contractValue], ["Final Contract Value", cl.finalContractValue],
                  ["Planned Completion", cl.completionDate], ["Actual Completion", cl.actualCompletionDate || "Ongoing"],
                  ["Final Payment Status", cl.finalPaymentStatus], ["Warranty Status", cl.warrantyStatus],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#F8F8F8] rounded-xl p-3">
                    <div className="text-[10px] text-black/40 uppercase tracking-wide">{label}</div>
                    <div className="text-xs font-semibold text-black mt-0.5">{value}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#F8F8F8] rounded-xl p-3">
                <div className="text-[10px] text-black/40 uppercase tracking-wide mb-2">Workflow Progress</div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-black rounded-full transition-all" style={{ width: `${cl.workflowProgress}%` }} />
                </div>
                <div className="text-xs text-black/60 mt-1">{cl.workflowProgress}% complete</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Retention Released", done: cl.retentionReleased },
                  { label: "Closure Certificate", done: cl.closureCertificate },
                  { label: "Final Payment", done: cl.finalPaymentStatus === "Paid" },
                ].map(({ label, done }) => (
                  <div key={label} className={`rounded-xl p-3 flex items-center gap-2 ${done ? "bg-slate-50" : "bg-slate-50"}`}>
                    {done ? <CheckCircle2 className="h-4 w-4 text-[#0F172A]" /> : <AlertTriangle className="h-4 w-4 text-slate-600" />}
                    <span className="text-xs font-medium text-black">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "Verification" && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-black mb-3">Contractual Obligation Verification</div>
              {[
                { item: "All deliverables received and inspected", done: true },
                { item: "Scope verification complete", done: true },
                { item: "Quality inspection passed", done: true },
                { item: "Acceptance certificate issued", done: cl.workflowProgress >= 80 },
                { item: "Defects register cleared", done: cl.contractStatus === "Closed" },
                { item: "Final inspection report filed", done: cl.workflowProgress >= 70 },
                { item: "Punch list items resolved", done: cl.contractStatus === "Closed" },
                { item: "Outstanding issues resolved", done: cl.contractStatus === "Closed" },
              ].map(({ item, done }) => (
                <div key={item} className={`flex items-center gap-3 p-3 rounded-xl ${done ? "bg-slate-50" : "bg-red-50"}`}>
                  {done ? <CheckCircle2 className="h-4 w-4 text-[#0F172A] flex-shrink-0" /> : <X className="h-4 w-4 text-red-500 flex-shrink-0" />}
                  <span className="text-xs text-black">{item}</span>
                  <span className={`ml-auto text-[10px] font-semibold ${done ? "text-[#0F172A]" : "text-red-600"}`}>{done ? "✓ Verified" : "Pending"}</span>
                </div>
              ))}
            </div>
          )}
          {tab === "Financial" && (
            <div className="space-y-4">
              {[
                { label: "Original Contract Value", value: cl.contractValue },
                { label: "Approved Variations", value: "USD 250,000" },
                { label: "Final Contract Value", value: cl.finalContractValue },
                { label: "Total Payments Made", value: cl.finalPaymentStatus === "Paid" ? cl.finalContractValue : "Pending" },
                { label: "Retention Amount", value: "USD 1,420,000" },
                { label: "Retention Released", value: cl.retentionReleased ? "Yes" : "Pending" },
                { label: "Outstanding Balance", value: cl.finalPaymentStatus === "Paid" ? "USD 0" : "Pending Final Payment" },
                { label: "WHT Deducted", value: "USD 282,000" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-black/5">
                  <span className="text-xs text-black/60">{label}</span>
                  <span className="text-xs font-semibold text-black">{value}</span>
                </div>
              ))}
            </div>
          )}
          {tab === "Warranty" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Warranty Status", cl.warrantyStatus],
                  ["Warranty Start", cl.actualCompletionDate || "Pending"],
                  ["Warranty End", "2027-05-28"],
                  ["Warranty Period", "24 months"],
                  ["Open Claims", "0"],
                  ["Resolved Claims", "2"],
                ].map(([l, v]) => (
                  <div key={l} className="bg-[#F8F8F8] rounded-xl p-3">
                    <div className="text-[10px] text-black/40 uppercase">{l}</div>
                    <div className="text-xs font-semibold text-black mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "Documents" && (
            <div className="space-y-2">
              {["Practical Completion Certificate", "Final Inspection Report", "Acceptance Certificate",
                "DLP Certificate", "Retention Release Certificate", "Final Payment Voucher",
                "Audit Compliance Report", "Closure Certificate (Draft)"].map(doc => (
                <div key={doc} className="flex items-center justify-between p-3 border border-black/8 rounded-xl hover:bg-[#F8F8F8]">
                  <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-black/40" /><span className="text-xs text-black">{doc}</span></div>
                  <button className="text-[10px] font-medium text-black/50 hover:text-black flex items-center gap-1"><Download className="h-3 w-3" />Download</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-black/8 px-6 py-3 flex items-center justify-between bg-[#fafafa]">
          <div className="flex gap-2">
            {cl.contractStatus !== "Closed" && (
              <button onClick={() => { onUpdate({ contractStatus: "Closed", closureCertificate: true, workflowProgress: 100 }); pushNotification(`Contract ${cl.contractNumber} closed successfully.`, "success"); onClose(); }}
                className="h-8 px-4 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800">
                Close Contract
              </button>
            )}
            {cl.contractStatus === "Closed" && canReopen && (
              <button onClick={() => { onUpdate({ contractStatus: "Reopened", workflowProgress: 80 }); pushNotification(`Contract ${cl.contractNumber} reopened by authorised user.`, "warning"); onClose(); }}
                className="h-8 px-4 rounded-lg bg-[#0F172A] text-white text-xs font-medium hover:bg-[#0F172A]">
                Reopen Contract
              </button>
            )}
            <button onClick={() => { onUpdate({ contractStatus: "Archived" }); pushNotification(`Contract ${cl.contractNumber} archived.`, "info"); onClose(); }}
              className="h-8 px-4 rounded-lg border border-black/10 text-xs text-black/60 hover:bg-[#EAF1F8]">
              Archive
            </button>
          </div>
          <button onClick={() => pushNotification("Closure certificate generated successfully.", "success")}
            className="h-8 px-4 rounded-lg border border-black/10 text-xs text-black/60 hover:bg-[#EAF1F8] flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" />Generate Certificate
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ContractClosureWorkbenchPage() {
  const [closures, setClosures] = useState<ContractClosure[]>(SEED_CLOSURES);
  const [selected, setSelected] = useState<ContractClosure | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [tab, setTab] = useState<"Workbench" | "Analytics">("Workbench");

  const filtered = closures.filter(c =>
    (statusFilter === "All" || c.contractStatus === statusFilter) &&
    (c.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
     c.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
     c.supplierName.toLowerCase().includes(search.toLowerCase()))
  );

  const update = (id: string, patch: Partial<ContractClosure>) => {
    setClosures(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...patch } : prev);
  };

  const stats = {
    total: closures.length,
    closed: closures.filter(c => c.contractStatus === "Closed").length,
    pending: closures.filter(c => c.contractStatus === "Pending Approval").length,
    inProgress: closures.filter(c => c.contractStatus === "In Progress").length,
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Contract Management"
        process="Contract Closure Workbench"
        financialYear="FY2026"
        pageType="workbench"
      />
      {selected && <ClosureDetailPanel cl={selected} onClose={() => setSelected(null)} onUpdate={(p) => update(selected.id, p)} />}
      {showAI && <AIClosureAssistant closure={selected} onClose={() => setShowAI(false)} />}
      <div className={`p-4 sm:p-6 max-w-[1600px] mx-auto transition-all ${showAI ? "mr-80" : ""}`}>
        <PageHeader
          title="Contract Closure Workbench"
          description="Stage 13 — Manage the complete contract closure lifecycle from completion verification to archival."
          actions={
            <>
              <button onClick={() => setShowAI(v => !v)} className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary transition-colors">
                <Sparkles className="h-4 w-4" /> AI Assistant
              </button>
              <button onClick={() => pushNotification("New closure record created.", "success")} className="h-9 px-3 rounded-md bg-black text-white text-sm flex items-center gap-1.5 hover:bg-gray-800">
                <Plus className="h-4 w-4" /> New Closure
              </button>
            </>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Closures" value={String(stats.total)} delta="All contracts" />
          <KpiCard label="Closed" value={String(stats.closed)} delta="Fully closed" positive />
          <KpiCard label="Pending Approval" value={String(stats.pending)} delta="Awaiting sign-off" />
          <KpiCard label="In Progress" value={String(stats.inProgress)} delta="Being processed" />
        </div>

        <div className="flex gap-1 mb-6 border-b border-border">
          {(["Workbench", "Analytics"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>

        {tab === "Workbench" && (
          <Card>
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-black/8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contracts, suppliers, projects…" className="w-full h-9 pl-9 pr-4 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none bg-white">
                <option value="All">All Status</option>
                {["Open", "In Progress", "Pending Approval", "Closed", "Archived", "Reopened"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F8F8] border-b border-black/8">
                  <tr>{["Contract #", "Tender #", "Supplier", "Project", "Contract Value", "Final Value", "Completion", "Status", "Payment", "Warranty", "Progress", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-black/50 whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filtered.map(cl => (
                    <tr key={cl.id} className="hover:bg-[#F8F8F8]/60 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-black whitespace-nowrap">{cl.contractNumber}</td>
                      <td className="px-4 py-3 text-xs text-black/60 whitespace-nowrap">{cl.tenderNumber}</td>
                      <td className="px-4 py-3 text-xs text-black max-w-[150px] truncate">{cl.supplierName}</td>
                      <td className="px-4 py-3 text-xs text-black/70 max-w-[180px] truncate">{cl.projectTitle}</td>
                      <td className="px-4 py-3 text-xs font-medium text-black whitespace-nowrap">{cl.contractValue}</td>
                      <td className="px-4 py-3 text-xs font-medium text-[#0F172A] whitespace-nowrap">{cl.finalContractValue}</td>
                      <td className="px-4 py-3 text-xs text-black/60 whitespace-nowrap">{cl.actualCompletionDate || cl.completionDate}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${STATUS_COLOR[cl.contractStatus]}`}>{cl.contractStatus}</span></td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cl.finalPaymentStatus === "Paid" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{cl.finalPaymentStatus}</span></td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cl.warrantyStatus === "Active" ? "bg-slate-100 text-[#0F172A]" : cl.warrantyStatus === "Expired" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{cl.warrantyStatus}</span></td>
                      <td className="px-4 py-3 min-w-[100px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-black rounded-full" style={{ width: `${cl.workflowProgress}%` }} /></div>
                          <span className="text-[10px] text-black/50">{cl.workflowProgress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelected(cl)} className="h-7 px-2.5 rounded-lg bg-black text-white text-[10px] font-medium hover:bg-gray-800 flex items-center gap-1">
                          <Eye className="h-3 w-3" />View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === "Analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader title="Closure Status Distribution" subtitle="All closure records" />
              <div className="p-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "Closed", count: stats.closed },
                    { name: "In Progress", count: stats.inProgress },
                    { name: "Pending Approval", count: stats.pending },
                    { name: "Open", count: closures.filter(c => c.contractStatus === "Open").length },
                  ]}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="#000" radius={[3, 3, 0, 0]} name="Contracts" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title="Closure Compliance Scores" subtitle="By contract" />
              <div className="p-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={closures.map(c => ({ name: c.contractNumber, score: c.complianceScore }))}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="score" fill="#475569" radius={[3, 3, 0, 0]} name="Compliance %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
