import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { Shield, AlertTriangle, CheckCircle2, Clock, Plus, Search, Eye, X, Bell, Send, Sparkles, Download, FileText } from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

type WarrantyStatus = "Active" | "Expired" | "Expiring Soon" | "Claimed" | "Resolved";
type ClaimStatus = "Open" | "In Progress" | "Resolved" | "Escalated" | "Closed";

type WarrantyRecord = {
  id: string; contractNumber: string; projectTitle: string; supplierName: string;
  warrantyType: string; startDate: string; endDate: string; period: string;
  status: WarrantyStatus; daysRemaining: number; openClaims: number; resolvedClaims: number;
  coverageDescription: string; responsibleOfficer: string;
};

type WarrantyClaim = {
  id: string; warrantyId: string; contractNumber: string; projectTitle: string;
  claimTitle: string; description: string; claimDate: string; priority: "Low" | "Medium" | "High" | "Critical";
  status: ClaimStatus; supplierResponse: string; resolvedDate: string; resolutionNotes: string;
};

const SEED_WARRANTIES: WarrantyRecord[] = [
  { id: "WRN-2026-001", contractNumber: "CN-2025-0312", projectTitle: "Harare Water Treatment Phase I", supplierName: "Highveld Engineering", warrantyType: "Structural Warranty", startDate: "2026-01-15", endDate: "2028-01-15", period: "24 months", status: "Active", daysRemaining: 569, openClaims: 1, resolvedClaims: 2, coverageDescription: "All structural components, mechanical, and electrical installations", responsibleOfficer: "T. Moyo" },
  { id: "WRN-2026-002", contractNumber: "CN-2026-0399", projectTitle: "Pfumvudza Fertiliser 2025/26", supplierName: "Mashonaland Agri Supplies", warrantyType: "Product Warranty", startDate: "2026-05-28", endDate: "2027-05-28", period: "12 months", status: "Active", daysRemaining: 336, openClaims: 0, resolvedClaims: 0, coverageDescription: "Quality guarantee on all fertiliser products supplied", responsibleOfficer: "R. Chikwanda" },
  { id: "WRN-2025-018", contractNumber: "CN-2025-0287", projectTitle: "ZESA Substation Upgrade", supplierName: "Zimbabwe Electro Systems", warrantyType: "Equipment Warranty", startDate: "2025-07-01", endDate: "2026-07-01", period: "12 months", status: "Expiring Soon", daysRemaining: 5, openClaims: 2, resolvedClaims: 8, coverageDescription: "All electrical equipment and control systems", responsibleOfficer: "A. Mpofu" },
  { id: "WRN-2024-042", contractNumber: "CN-2024-0198", projectTitle: "ZIMRA Tax System Phase I", supplierName: "Sable ICT Solutions", warrantyType: "Software Maintenance", startDate: "2024-09-01", endDate: "2025-09-01", period: "12 months", status: "Expired", daysRemaining: 0, openClaims: 0, resolvedClaims: 12, coverageDescription: "Software bugs, updates and system performance", responsibleOfficer: "P. Dube" },
];

const SEED_CLAIMS: WarrantyClaim[] = [
  { id: "CLM-2026-001", warrantyId: "WRN-2026-001", contractNumber: "CN-2025-0312", projectTitle: "Harare Water Treatment Phase I", claimTitle: "Pump motor failure at Unit 3", description: "Primary pump motor at Treatment Unit 3 failed after 4 months of operation. Suspected manufacturing defect.", claimDate: "2026-05-15", priority: "High", status: "In Progress", supplierResponse: "Site visit scheduled for 2026-06-28. Replacement motor being sourced.", resolvedDate: "", resolutionNotes: "" },
  { id: "CLM-2025-018", warrantyId: "WRN-2025-018", contractNumber: "CN-2025-0287", projectTitle: "ZESA Substation Upgrade", claimTitle: "Voltage regulator malfunction", description: "Voltage regulator at Bay 3 showing erratic readings. Risk of equipment damage.", claimDate: "2026-06-01", priority: "Critical", status: "Escalated", supplierResponse: "Engineer deployed. Root cause analysis underway.", resolvedDate: "", resolutionNotes: "" },
  { id: "CLM-2025-019", warrantyId: "WRN-2025-018", contractNumber: "CN-2025-0287", projectTitle: "ZESA Substation Upgrade", claimTitle: "Control panel display failure", description: "Main SCADA display panel stopped functioning.", claimDate: "2026-05-20", priority: "Medium", status: "Resolved", supplierResponse: "Replacement panel installed.", resolvedDate: "2026-06-05", resolutionNotes: "Panel replaced under warranty. Full functionality restored." },
];

const STATUS_COLOR: Record<WarrantyStatus, string> = {
  "Active": "bg-slate-100 text-[#0F172A]",
  "Expiring Soon": "bg-slate-100 text-[#0F172A]",
  "Expired": "bg-gray-100 text-gray-600",
  "Claimed": "bg-slate-100 text-[#0F172A]",
  "Resolved": "bg-slate-100 text-[#0F172A]",
};
const CLAIM_STATUS_COLOR: Record<ClaimStatus, string> = {
  "Open": "bg-slate-100 text-[#0F172A]", "In Progress": "bg-slate-100 text-[#0F172A]",
  "Resolved": "bg-slate-100 text-[#0F172A]", "Escalated": "bg-red-100 text-red-700",
  "Closed": "bg-gray-100 text-gray-600",
};
const COLORS = ["#475569", "#10B981", "#F59E0B", "#3B82F6", "#8B5CF6"];

export default function WarrantyManagementPage() {
  const [warranties, setWarranties] = useState(SEED_WARRANTIES);
  const [claims, setClaims] = useState(SEED_CLAIMS);
  const [tab, setTab] = useState<"Warranties" | "Claims" | "Analytics">("Warranties");
  const [search, setSearch] = useState("");
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyRecord | null>(null);
  const [newClaimFor, setNewClaimFor] = useState<WarrantyRecord | null>(null);
  const [claimForm, setClaimForm] = useState({ title: "", description: "", priority: "Medium" });

  const stats = {
    active: warranties.filter(w => w.status === "Active").length,
    expiringSoon: warranties.filter(w => w.status === "Expiring Soon").length,
    openClaims: claims.filter(c => c.status === "Open" || c.status === "In Progress").length,
    escalated: claims.filter(c => c.status === "Escalated").length,
  };

  const submitClaim = () => {
    if (!newClaimFor || !claimForm.title) return;
    const newClaim: WarrantyClaim = {
      id: `CLM-2026-${String(claims.length + 100).padStart(3, "0")}`,
      warrantyId: newClaimFor.id, contractNumber: newClaimFor.contractNumber,
      projectTitle: newClaimFor.projectTitle, claimTitle: claimForm.title,
      description: claimForm.description, claimDate: new Date().toISOString().split("T")[0],
      priority: claimForm.priority as any, status: "Open",
      supplierResponse: "", resolvedDate: "", resolutionNotes: "",
    };
    setClaims(prev => [newClaim, ...prev]);
    pushNotification(`Warranty claim submitted: ${claimForm.title}`, "info");
    setNewClaimFor(null);
    setClaimForm({ title: "", description: "", priority: "Medium" });
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Enterprise Asset Management"
        process="Warranty Management"
        financialYear="FY2026"
        pageType="workbench"
      />
      {newClaimFor && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
              <div className="text-sm font-bold">New Warranty Claim</div>
              <button onClick={() => setNewClaimFor(null)}><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 space-y-3">
              <div className="bg-[#F8F8F8] rounded-lg p-3 text-xs text-black/60">{newClaimFor.contractNumber} — {newClaimFor.projectTitle}</div>
              <input value={claimForm.title} onChange={e => setClaimForm(p => ({ ...p, title: e.target.value }))} placeholder="Claim title" className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" />
              <textarea value={claimForm.description} onChange={e => setClaimForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the defect or issue…" rows={3} className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm resize-none focus:outline-none" />
              <select value={claimForm.priority} onChange={e => setClaimForm(p => ({ ...p, priority: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm bg-white focus:outline-none">
                {["Low", "Medium", "High", "Critical"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div className="flex gap-2 pt-2">
                <button onClick={submitClaim} className="flex-1 h-9 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800">Submit Claim</button>
                <button onClick={() => setNewClaimFor(null)} className="h-9 px-4 rounded-lg border border-black/10 text-sm hover:bg-[#EAF1F8]">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Warranty Management"
          description="Track warranty periods, manage claims, monitor supplier responses, and auto-notify before expiration."
          actions={
            <button onClick={() => pushNotification("Warranty expiry alerts sent to responsible officers.", "info")} className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary">
              <Bell className="h-4 w-4" /> Send Alerts
            </button>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Active Warranties" value={String(stats.active)} delta="Currently active" positive />
          <KpiCard label="Expiring Soon" value={String(stats.expiringSoon)} delta="Within 30 days" positive={false} />
          <KpiCard label="Open Claims" value={String(stats.openClaims)} delta="Requiring action" positive={false} />
          <KpiCard label="Escalated" value={String(stats.escalated)} delta="Needs attention" positive={false} />
        </div>

        {stats.expiringSoon > 0 && (
          <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-slate-600 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[#0F172A]">{stats.expiringSoon} warranty expiring within 30 days</div>
              <div className="text-xs text-[#0F172A] mt-0.5">Responsible officers have been automatically notified. Review and take action.</div>
            </div>
          </div>
        )}

        <div className="flex gap-1 mb-6 border-b border-border">
          {(["Warranties", "Claims", "Analytics"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>

        {tab === "Warranties" && (
          <Card>
            <div className="flex gap-3 p-4 border-b border-black/8">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search warranties…" className="w-full h-9 pl-9 pr-4 rounded-lg border border-black/10 text-sm focus:outline-none" /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F8F8] border-b border-black/8">
                  <tr>{["Contract #", "Project", "Supplier", "Type", "Start", "End", "Period", "Days Left", "Status", "Claims", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-black/50 whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {warranties.filter(w => w.projectTitle.toLowerCase().includes(search.toLowerCase()) || w.contractNumber.toLowerCase().includes(search.toLowerCase())).map(w => (
                    <tr key={w.id} className="hover:bg-[#F8F8F8]/60">
                      <td className="px-4 py-3 text-xs font-semibold text-black">{w.contractNumber}</td>
                      <td className="px-4 py-3 text-xs text-black max-w-[180px] truncate">{w.projectTitle}</td>
                      <td className="px-4 py-3 text-xs text-black/70">{w.supplierName}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{w.warrantyType}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{w.startDate}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{w.endDate}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{w.period}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-black">{w.daysRemaining > 0 ? `${w.daysRemaining}d` : "—"}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[w.status]}`}>{w.status}</span></td>
                      <td className="px-4 py-3 text-xs text-black">{w.openClaims > 0 ? <span className="text-red-600 font-semibold">{w.openClaims} open</span> : <span className="text-black/40">None</span>}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setSelectedWarranty(w)} className="h-7 px-2 rounded-lg bg-black text-white text-[10px] hover:bg-gray-800">View</button>
                          {w.status === "Active" && <button onClick={() => setNewClaimFor(w)} className="h-7 px-2 rounded-lg border border-black/10 text-[10px] hover:bg-[#EAF1F8]">Claim</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === "Claims" && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F8F8] border-b border-black/8">
                  <tr>{["Claim ID", "Contract #", "Project", "Claim Title", "Date", "Priority", "Status", "Supplier Response", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-black/50 whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {claims.map(cl => (
                    <tr key={cl.id} className="hover:bg-[#F8F8F8]/60">
                      <td className="px-4 py-3 text-xs font-semibold text-black">{cl.id}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{cl.contractNumber}</td>
                      <td className="px-4 py-3 text-xs text-black/70 max-w-[160px] truncate">{cl.projectTitle}</td>
                      <td className="px-4 py-3 text-xs text-black max-w-[200px] truncate">{cl.claimTitle}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{cl.claimDate}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cl.priority === "Critical" ? "bg-red-100 text-red-700" : cl.priority === "High" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{cl.priority}</span></td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CLAIM_STATUS_COLOR[cl.status]}`}>{cl.status}</span></td>
                      <td className="px-4 py-3 text-xs text-black/60 max-w-[200px] truncate">{cl.supplierResponse || "Awaiting response"}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setClaims(prev => prev.map(c => c.id === cl.id ? { ...c, status: "Resolved", resolvedDate: new Date().toISOString().split("T")[0] } : c)); pushNotification(`Claim ${cl.id} resolved.`, "success"); }} className="h-7 px-2 rounded-lg bg-[#0F172A] text-white text-[10px] hover:bg-[#0F172A]">Resolve</button>
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
              <CardHeader title="Warranty Status Distribution" />
              <div className="p-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[
                      { name: "Active", value: stats.active }, { name: "Expiring Soon", value: stats.expiringSoon },
                      { name: "Expired", value: warranties.filter(w => w.status === "Expired").length },
                    ]} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={3}>
                      {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title="Claims by Status" />
              <div className="p-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={["Open", "In Progress", "Escalated", "Resolved", "Closed"].map(s => ({ name: s, count: claims.filter(c => c.status === s).length }))}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Claims" />
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
