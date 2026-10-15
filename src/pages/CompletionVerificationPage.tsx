import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import LifecycleTower from "@/components/LifecycleTower";
import { CONTRACT_CLOSURE_STAGES } from "@/lib/lifecycle-stages";
import {
  CheckCircle2, AlertTriangle, Clock, X, Search, Eye, Plus,
  FileText, Package, DollarSign, Star, BookOpen, Shield, Download, Sparkles, Send,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import { useNavigate } from "react-router-dom";

type VerificationStatus = "Not Started" | "In Progress" | "Complete" | "Issues Found";

type VerificationRecord = {
  id: string; contractNumber: string; projectTitle: string;
  supplierName: string; ministry: string;
  currentStage: number; status: VerificationStatus;
  deliverablesVerified: boolean; scopeVerified: boolean;
  milestonesVerified: boolean; qualityPassed: boolean;
  acceptanceCertificate: boolean; defectsCleared: boolean;
  punchListClear: boolean; finalInspectionFiled: boolean;
  complianceScore: number; lastUpdated: string;
};

const SEED_VERIFICATIONS: VerificationRecord[] = [
  {
    id: "CV-2026-001", contractNumber: "CN-2025-0312",
    projectTitle: "Harare Water Treatment Phase I", supplierName: "Highveld Engineering",
    ministry: "Ministry of Water", currentStage: 3, status: "In Progress",
    deliverablesVerified: true, scopeVerified: true, milestonesVerified: true,
    qualityPassed: true, acceptanceCertificate: true, defectsCleared: false,
    punchListClear: false, finalInspectionFiled: true,
    complianceScore: 92, lastUpdated: "2026-06-20",
  },
  {
    id: "CV-2026-002", contractNumber: "CN-2026-0399",
    projectTitle: "Pfumvudza Fertiliser 2025/26", supplierName: "Mashonaland Agri Supplies",
    ministry: "Ministry of Agriculture", currentStage: 2, status: "In Progress",
    deliverablesVerified: true, scopeVerified: false, milestonesVerified: true,
    qualityPassed: false, acceptanceCertificate: false, defectsCleared: false,
    punchListClear: false, finalInspectionFiled: false,
    complianceScore: 68, lastUpdated: "2026-06-15",
  },
  {
    id: "CV-2025-018", contractNumber: "CN-2025-0287",
    projectTitle: "ZESA Substation Upgrade", supplierName: "Zimbabwe Electro Systems",
    ministry: "ZESA", currentStage: 8, status: "Complete",
    deliverablesVerified: true, scopeVerified: true, milestonesVerified: true,
    qualityPassed: true, acceptanceCertificate: true, defectsCleared: true,
    punchListClear: true, finalInspectionFiled: true,
    complianceScore: 96, lastUpdated: "2025-09-10",
  },
];

const STATUS_COLOR: Record<VerificationStatus, string> = {
  "Not Started": "bg-gray-100 text-gray-600",
  "In Progress": "bg-slate-100 text-[#0F172A]",
  "Complete": "bg-slate-100 text-[#0F172A]",
  "Issues Found": "bg-red-100 text-red-700",
};

const CHECKS = [
  { key: "deliverablesVerified", label: "Deliverables Verified" },
  { key: "scopeVerified",        label: "Scope Verified" },
  { key: "milestonesVerified",   label: "Milestones Verified" },
  { key: "qualityPassed",        label: "Quality Inspection Passed" },
  { key: "acceptanceCertificate",label: "Acceptance Certificate Issued" },
  { key: "defectsCleared",       label: "Defects Register Cleared" },
  { key: "punchListClear",       label: "Punch List Resolved" },
  { key: "finalInspectionFiled", label: "Final Inspection Report Filed" },
] as const;

function VerificationDetailModal({ rec, onClose, onUpdate }: {
  rec: VerificationRecord; onClose: () => void;
  onUpdate: (patch: Partial<VerificationRecord>) => void;
}) {
  const allPassed = CHECKS.every(c => rec[c.key as keyof VerificationRecord]);
  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <div>
            <div className="text-sm font-bold">{rec.contractNumber} — Completion Verification</div>
            <div className="text-xs text-black/50 mt-0.5">{rec.projectTitle} · {rec.supplierName}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[rec.status]}`}>{rec.status}</span>
            <button onClick={onClose}><X className="h-4 w-4 text-black/40" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between bg-[#F8F8F8] rounded-xl p-3 mb-2">
            <span className="text-xs font-semibold text-black">Closure Stage Progress</span>
            <span className="text-xs text-black/60">{rec.currentStage}/8 stages</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-black rounded-full transition-all" style={{ width: `${(rec.currentStage / 8) * 100}%` }} />
          </div>

          <div className="text-xs font-semibold text-black mb-2">Obligation Verification Checklist</div>
          <div className="space-y-2">
            {CHECKS.map(({ key, label }) => {
              const passed = rec[key as keyof VerificationRecord] as boolean;
              return (
                <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${passed ? "border-slate-200 bg-slate-50" : "border-red-200 bg-red-50"}`}>
                  {passed
                    ? <CheckCircle2 className="h-4 w-4 text-[#0F172A] flex-shrink-0" />
                    : <X className="h-4 w-4 text-red-500 flex-shrink-0" />
                  }
                  <span className="text-xs font-medium text-black flex-1">{label}</span>
                  <span className={`text-[10px] font-bold ${passed ? "text-[#0F172A]" : "text-red-600"}`}>
                    {passed ? "✓ Verified" : "Pending"}
                  </span>
                  {!passed && (
                    <button
                      onClick={() => onUpdate({ [key]: true } as Partial<VerificationRecord>)}
                      className="h-6 px-2 rounded-md bg-black text-white text-[10px] hover:bg-gray-800 ml-2"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`mt-4 p-4 rounded-xl border-2 ${allPassed ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center gap-2">
              {allPassed
                ? <CheckCircle2 className="h-5 w-5 text-[#0F172A]" />
                : <AlertTriangle className="h-5 w-5 text-slate-600" />
              }
              <div>
                <div className={`text-sm font-bold ${allPassed ? "text-[#0F172A]" : "text-[#0F172A]"}`}>
                  {allPassed ? "All Obligations Verified — Ready for Closure" : "Verification Incomplete — Closure Blocked"}
                </div>
                <div className="text-xs text-black/50 mt-0.5">
                  {allPassed
                    ? "All contractual obligations confirmed. Proceed to formal contract closure."
                    : `${CHECKS.filter(c => !rec[c.key as keyof VerificationRecord]).length} item(s) still pending verification.`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-black/8 px-6 py-3 flex items-center justify-between bg-[#fafafa]">
          {allPassed && rec.status !== "Complete" && (
            <button
              onClick={() => {
                onUpdate({ status: "Complete", currentStage: 8 });
                pushNotification(`Completion verification complete for ${rec.contractNumber}.`, "success");
                onClose();
              }}
              className="h-8 px-4 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800"
            >
              Mark Complete — Proceed to Closure
            </button>
          )}
          <button
            onClick={() => pushNotification("Verification report downloaded.", "success")}
            className="h-8 px-4 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1.5 ml-auto"
          >
            <Download className="h-3.5 w-3.5" />Download Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompletionVerificationPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState(SEED_VERIFICATIONS);
  const [selected, setSelected] = useState<VerificationRecord | null>(null);
  const [search, setSearch] = useState("");
  const [showTower, setShowTower] = useState(false);

  const update = (id: string, patch: Partial<VerificationRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...patch } : prev);
  };

  const stats = {
    total: records.length,
    complete: records.filter(r => r.status === "Complete").length,
    inProgress: records.filter(r => r.status === "In Progress").length,
    readyForClosure: records.filter(r =>
      CHECKS.every(c => r[c.key as keyof VerificationRecord])
    ).length,
  };

  const filtered = records.filter(r =>
    r.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
    r.contractNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Completion Verification"
        financialYear="FY2026"
        pageType="form"
      />
      {selected && (
        <VerificationDetailModal
          rec={selected} onClose={() => setSelected(null)}
          onUpdate={(p) => update(selected.id, p)}
        />
      )}
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Completion Verification"
          description="Automatically verify all contractual obligations before allowing contract closure. Full checklist enforcement with AI assistance."
          actions={
            <>
              <button
                onClick={() => setShowTower(v => !v)}
                className={`h-9 px-3 rounded-md border text-sm flex items-center gap-1.5 transition-colors ${showTower ? "bg-black text-white border-black" : "border-border bg-card hover:bg-secondary"}`}
              >
                <Sparkles className="h-4 w-4" /> Closure Tower
              </button>
              <button
                onClick={() => navigate("/procurement/contract-closure")}
                className="h-9 px-3 rounded-md bg-black text-white text-sm flex items-center gap-1.5 hover:bg-gray-800"
              >
                <FileText className="h-4 w-4" /> Closure Workbench
              </button>
            </>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Records" value={String(stats.total)} delta="All verifications" />
          <KpiCard label="Complete" value={String(stats.complete)} delta="All obligations met" positive />
          <KpiCard label="In Progress" value={String(stats.inProgress)} delta="Being verified" positive={false} />
          <KpiCard label="Ready for Closure" value={String(stats.readyForClosure)} delta="All checks passed" positive />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`${showTower ? "lg:col-span-2" : "lg:col-span-3"}`}>
            <Card>
              <div className="flex gap-3 p-4 border-b border-black/8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                  <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search contracts…"
                    className="w-full h-9 pl-9 pr-4 rounded-lg border border-black/10 text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="divide-y divide-black/5">
                {filtered.map(rec => {
                  const passedCount = CHECKS.filter(c => rec[c.key as keyof VerificationRecord]).length;
                  const allPassed = passedCount === CHECKS.length;
                  return (
                    <div key={rec.id} className="p-4 hover:bg-[#F8F8F8]/60">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-semibold text-black/40">{rec.contractNumber}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[rec.status]}`}>
                              {rec.status}
                            </span>
                            {allPassed && (
                              <span className="text-[10px] font-bold text-[#0F172A] bg-slate-50 px-2 py-0.5 rounded-full">
                                ✓ Ready for Closure
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-black truncate">{rec.projectTitle}</div>
                          <div className="text-xs text-black/50 mt-0.5">{rec.supplierName} · {rec.ministry}</div>
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[200px]">
                              <div
                                className={`h-full rounded-full ${allPassed ? "bg-[#0F172A]" : "bg-black"}`}
                                style={{ width: `${(passedCount / CHECKS.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-black/50">{passedCount}/{CHECKS.length} checks</span>
                            <span className="text-xs text-black/40">Compliance: {rec.complianceScore}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => setSelected(rec)}
                            className="h-8 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />Verify
                          </button>
                          {allPassed && (
                            <button
                              onClick={() => navigate("/procurement/contract-closure")}
                              className="h-8 px-3 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A]"
                            >
                              Close →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {showTower && (
            <div className="lg:col-span-1">
              <LifecycleTower
                stages={CONTRACT_CLOSURE_STAGES}
                title="Contract Closure Tower"
                subtitle="Completion verification stages"
                context="closure"
              />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
