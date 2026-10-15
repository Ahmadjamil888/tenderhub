import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import {
  Plus, Search, Sparkles, FileText, Upload, Download, Send, Eye, X,
  CheckCircle2, Clock, Shield, Lock, Unlock, AlertTriangle, FileSignature,
  RefreshCcw, Check, Users, Bell, ChevronRight, Package,
} from "lucide-react";
import { pushNotification, pushSeniorAlert } from "@/lib/local-store";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/lib/toast";
import LifecycleTower from "@/components/LifecycleTower";
import { BID_SUBMISSION_STAGES } from "@/lib/lifecycle-stages";
import {
  type BidSubmission, type BidDocument, SEED_BID_SUBMISSIONS, BID_WORKFLOW_STAGES,
} from "@/lib/procurement-workbench-data";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_TONE: Record<string, "green" | "amber" | "blue" | "red" | "muted" | "violet"> = {
  "Receipt Generated":     "green",
  "Submission Confirmation":"green",
  "Encrypted Submission":  "blue",
  "Digital Signature":     "blue",
  Validation:              "amber",
  Draft:                   "muted",
  Late:                    "red",
  Rejected:                "red",
};

const DOC_CATEGORY_COLOR: Record<string, string> = {
  "Technical Proposal": "bg-slate-50 text-[#0F172A]",
  "Financial Proposal": "bg-slate-50 text-[#0F172A]",
  "Bid Security":       "bg-slate-50 text-[#0F172A]",
  Supporting:           "bg-gray-100 text-gray-600",
  Legal:                "bg-slate-50 text-[#0F172A]",
  Certificates:         "bg-slate-50 text-slate-500",
};

function WorkflowSteps({ status }: { status: string }) {
  const steps = BID_WORKFLOW_STAGES;
  const idx = steps.indexOf(status as typeof steps[number]);
  return (
    <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center flex-shrink-0">
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap
            ${i < idx ? "bg-slate-50 text-[#0F172A]" : i === idx ? "bg-black text-white" : "bg-[#EAF1F8] text-black/40"}`}>
            {i < idx && <Check className="h-3 w-3" />}
            {s}
          </div>
          {i < steps.length - 1 && <ChevronRight className={`h-3 w-3 mx-0.5 flex-shrink-0 ${i < idx ? "text-slate-500" : "text-black/15"}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── New Bid Modal ─────────────────────────────────────────────────────────────
function NewBidModal({ onSave, onClose }: { onSave: (b: BidSubmission) => void; onClose: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    tenderTitle: "", tenderNumber: "", supplierName: user?.entity ?? "",
    supplierEmail: user?.email ?? "", supplierPhone: "",
    supplierRegistrationNo: "", financialProposalAmount: "", currency: "USD",
    bidSecurityAmount: "", bidSecurityProvider: "", bidSecurityExpiry: "",
    submissionDeadline: "", technicalProposalSummary: "",
  });
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const handleSubmit = () => {
    if (!form.tenderNumber.trim()) { setError("Tender number is required."); return; }
    if (!form.supplierName.trim()) { setError("Supplier name is required."); return; }
    const id = `bid-${Date.now()}`;
    const ref = `BID-2026-${form.tenderNumber.split("-").pop()}-${String(Date.now()).slice(-3)}`;
    const now = new Date().toISOString().split("T")[0];
    const newBid: BidSubmission = {
      id, bidReference: ref,
      tenderId: "", tenderTitle: form.tenderTitle, tenderNumber: form.tenderNumber,
      supplierName: form.supplierName, supplierEmail: form.supplierEmail,
      supplierPhone: form.supplierPhone, supplierRegistrationNo: form.supplierRegistrationNo,
      technicalProposalSummary: form.technicalProposalSummary,
      financialProposalAmount: form.financialProposalAmount, currency: form.currency,
      bidSecurityAmount: form.bidSecurityAmount, bidSecurityProvider: form.bidSecurityProvider,
      bidSecurityExpiry: form.bidSecurityExpiry,
      submissionTime: "", submissionDeadline: form.submissionDeadline,
      status: "Draft", workflowProgress: 5,
      isEncrypted: false, isDigitallySigned: false,
      digitalSignatureRef: "", submissionReceiptNo: "",
      documents: [], complianceScore: 0, ipAddress: "", deviceInfo: "",
      validationResults: [
        { check: "Mandatory documents submitted", passed: false, notes: "No documents uploaded yet" },
        { check: "File format compliance", passed: false, notes: "Pending document upload" },
        { check: "Submission before deadline", passed: true, notes: "Not yet submitted" },
        { check: "Bid security provided", passed: !!form.bidSecurityAmount, notes: form.bidSecurityAmount ? "Bid security details entered" : "No bid security provided" },
        { check: "Digital signature applied", passed: false, notes: "Pending" },
        { check: "Encryption verified", passed: false, notes: "Pending" },
        { check: "Eligibility requirements", passed: false, notes: "Pending verification" },
      ],
      createdAt: now, updatedAt: now,
    };
    onSave(newBid);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
          <div>
            <div className="text-sm font-bold">New Bid Submission</div>
            <div className="text-xs text-black/40 mt-0.5">Step {step} of 3</div>
          </div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EAF1F8]"><X className="h-4 w-4" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-black/60 uppercase tracking-wide mb-2">Bid Header — Tender Information</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1">Tender Title</label>
                  <input value={form.tenderTitle} onChange={e => setForm(f => ({ ...f, tenderTitle: e.target.value }))}
                    placeholder="e.g. ICT Equipment — Secondary Schools Digital Programme"
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Tender Number *</label>
                  <input value={form.tenderNumber} onChange={e => setForm(f => ({ ...f, tenderNumber: e.target.value }))}
                    placeholder="e.g. ZW-PRA-2026-00186"
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Submission Deadline</label>
                  <input type="datetime-local" value={form.submissionDeadline} onChange={e => setForm(f => ({ ...f, submissionDeadline: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-black/60 uppercase tracking-wide mb-2">Supplier Information & Proposals</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Supplier Name *</label>
                  <input value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Registration No.</label>
                  <input value={form.supplierRegistrationNo} onChange={e => setForm(f => ({ ...f, supplierRegistrationNo: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Email</label>
                  <input type="email" value={form.supplierEmail} onChange={e => setForm(f => ({ ...f, supplierEmail: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Phone</label>
                  <input value={form.supplierPhone} onChange={e => setForm(f => ({ ...f, supplierPhone: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Financial Proposal Amount</label>
                  <input value={form.financialProposalAmount} onChange={e => setForm(f => ({ ...f, financialProposalAmount: e.target.value }))}
                    placeholder="e.g. 1,184,400"
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Currency</label>
                  <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none">
                    {["USD","ZWG","EUR","GBP","ZAR"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1">Technical Proposal Summary</label>
                  <textarea value={form.technicalProposalSummary} onChange={e => setForm(f => ({ ...f, technicalProposalSummary: e.target.value }))}
                    rows={3} placeholder="Brief summary of your technical approach and key differentiators…"
                    className="w-full px-3 py-2 rounded-lg border border-black/10 text-xs focus:outline-none resize-none" />
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-black/60 uppercase tracking-wide mb-2">Bid Security</div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-[#0F172A]" />
                  <div className="text-xs font-semibold text-[#0F172A]">Bid Security Required</div>
                </div>
                <p className="text-xs text-[#0F172A]">Bid security is mandatory. Bids submitted without valid bid security will be rejected automatically.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Bid Security Amount</label>
                  <input value={form.bidSecurityAmount} onChange={e => setForm(f => ({ ...f, bidSecurityAmount: e.target.value }))}
                    placeholder="e.g. 24,000"
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Provider (Bank/Insurance)</label>
                  <input value={form.bidSecurityProvider} onChange={e => setForm(f => ({ ...f, bidSecurityProvider: e.target.value }))}
                    placeholder="e.g. CBZ Bank Zimbabwe"
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Expiry Date</label>
                  <input type="date" value={form.bidSecurityExpiry} onChange={e => setForm(f => ({ ...f, bidSecurityExpiry: e.target.value }))}
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-semibold text-[#0F172A] mb-2">Submission will be:</div>
                <div className="space-y-1 text-xs text-[#0F172A]">
                  <div className="flex items-center gap-2"><Lock className="h-3 w-3" /> Encrypted with 256-bit AES encryption</div>
                  <div className="flex items-center gap-2"><FileSignature className="h-3 w-3" /> Sealed until bid opening ceremony</div>
                  <div className="flex items-center gap-2"><Shield className="h-3 w-3" /> Recorded with digital timestamp</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Receipt issued on successful submission</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/8">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : onClose()} className="h-9 px-4 rounded-xl border border-black/10 text-xs hover:bg-[#EAF1F8]">{step > 1 ? "Back" : "Cancel"}</button>
          {step < 3
            ? <button onClick={() => setStep(s => s + 1)} className="h-9 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800">Next →</button>
            : <button onClick={handleSubmit} className="h-9 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5"><Send className="h-3.5 w-3.5" /> Submit Bid</button>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Bid Detail Panel ─────────────────────────────────────────────────────────
type BidTab = "Overview" | "Documents" | "Validation" | "Audit Trail";

function BidDetailPanel({ bid, onClose, onAction }: {
  bid: BidSubmission;
  onClose: () => void;
  onAction: (id: string, action: string) => void;
}) {
  const [tab, setTab] = useState<BidTab>("Overview");

  const passedChecks = bid.validationResults.filter(v => v.passed).length;
  const totalChecks = bid.validationResults.length;
  const allPassed = passedChecks === totalChecks;

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-start justify-end p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-black/8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge tone={STATUS_TONE[bid.status] ?? "muted"}>{bid.status}</Badge>
              <span className="text-[10px] text-black/40 font-mono">{bid.bidReference}</span>
              {bid.isEncrypted && <span className="flex items-center gap-1 text-[10px] text-[#0F172A]"><Lock className="h-3 w-3" />Encrypted</span>}
              {bid.isDigitallySigned && <span className="flex items-center gap-1 text-[10px] text-[#0F172A]"><FileSignature className="h-3 w-3" />Signed</span>}
            </div>
            <div className="text-sm font-bold">{bid.tenderTitle}</div>
            <div className="text-xs text-black/50 mt-0.5">{bid.supplierName} · {bid.tenderNumber}</div>
          </div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EAF1F8] flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1 px-6 border-b border-black/8 overflow-x-auto scrollbar-none flex-shrink-0">
          {(["Overview", "Documents", "Validation", "Audit Trail"] as BidTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors relative
                ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>
              {t}
              {t === "Validation" && !allPassed && (
                <span className="absolute -top-0.5 -right-1 h-4 w-4 bg-[#0F172A] text-white text-[9px] rounded-full flex items-center justify-center">
                  {totalChecks - passedChecks}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === "Overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Supplier",         value: bid.supplierName },
                  { label: "Reg. No.",          value: bid.supplierRegistrationNo || "—" },
                  { label: "Email",             value: bid.supplierEmail },
                  { label: "Phone",             value: bid.supplierPhone || "—" },
                  { label: "Financial Proposal",value: `${bid.currency} ${bid.financialProposalAmount}` },
                  { label: "Compliance",        value: `${bid.complianceScore}%` },
                  { label: "Submission Time",   value: bid.submissionTime || "Not yet submitted" },
                  { label: "Deadline",          value: bid.submissionDeadline || "—" },
                  { label: "Receipt No.",        value: bid.submissionReceiptNo || "—" },
                ].map(f => (
                  <div key={f.label} className="p-3 bg-[#F9F9F9] rounded-xl">
                    <div className="text-[10px] text-black/40 uppercase tracking-wide">{f.label}</div>
                    <div className="text-xs font-semibold mt-0.5 truncate">{f.value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="text-xs font-semibold mb-2">Submission Workflow</div>
                <div className="overflow-x-auto pb-2">
                  <WorkflowSteps status={bid.status} />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-black/8 bg-[#F9F9F9]">
                <div className="text-xs font-semibold mb-3">Bid Security</div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div><div className="text-[10px] text-black/40">Amount</div><div className="font-semibold">{bid.currency} {bid.bidSecurityAmount || "—"}</div></div>
                  <div><div className="text-[10px] text-black/40">Provider</div><div className="font-semibold">{bid.bidSecurityProvider || "—"}</div></div>
                  <div><div className="text-[10px] text-black/40">Expiry</div><div className="font-semibold">{bid.bidSecurityExpiry || "—"}</div></div>
                </div>
              </div>

              {bid.technicalProposalSummary && (
                <div>
                  <div className="text-xs font-semibold mb-1.5">Technical Proposal Summary</div>
                  <p className="text-xs text-black/60 leading-relaxed">{bid.technicalProposalSummary}</p>
                </div>
              )}

              {bid.submissionReceiptNo && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-[#0F172A]" />
                    <div className="text-xs font-bold text-[#0F172A]">Submission Confirmed</div>
                  </div>
                  <div className="text-xs text-[#0F172A]">Receipt No: <span className="font-bold font-mono">{bid.submissionReceiptNo}</span></div>
                  <div className="text-xs text-[#0F172A] mt-0.5">Digital Signature: <span className="font-mono">{bid.digitalSignatureRef}</span></div>
                </div>
              )}
            </div>
          )}

          {tab === "Documents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold">Bid Documents ({bid.documents.length})</div>
                <button className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center gap-1">
                  <Upload className="h-3 w-3" /> Upload
                </button>
              </div>
              {bid.documents.length === 0 ? (
                <div className="py-12 text-center">
                  <Upload className="h-8 w-8 text-black/20 mx-auto mb-2" />
                  <div className="text-xs text-black/30">No documents uploaded yet.</div>
                  <div className="text-[11px] text-black/20 mt-1">Upload technical proposal, financial proposal, bid security, and supporting documents.</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {bid.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-[#F9F9F9] rounded-xl border border-black/8">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-white border border-black/8 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-black/40" />
                        </div>
                        <div>
                          <div className="text-xs font-medium">{doc.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${DOC_CATEGORY_COLOR[doc.category] ?? "bg-gray-100 text-gray-600"}`}>{doc.category}</span>
                            <span className="text-[10px] text-black/40">{doc.size} · {doc.uploadedAt} · v{doc.version}</span>
                            {doc.isSigned && <span className="text-[10px] text-[#0F172A] flex items-center gap-0.5"><FileSignature className="h-2.5 w-2.5" />Signed</span>}
                            {doc.isEncrypted && <span className="text-[10px] text-[#0F172A] flex items-center gap-0.5"><Lock className="h-2.5 w-2.5" />Encrypted</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${doc.status === "Verified" ? "bg-slate-50 text-[#0F172A]" : doc.status === "Rejected" ? "bg-red-50 text-red-700" : "bg-slate-50 text-[#0F172A]"}`}>{doc.status}</span>
                        <button className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EBEBEB]"><Eye className="h-3.5 w-3.5 text-black/50" /></button>
                        <button className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EBEBEB]"><Download className="h-3.5 w-3.5 text-black/50" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Validation" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold">Validation Results</div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${allPassed ? "bg-slate-50 text-[#0F172A]" : "bg-slate-50 text-[#0F172A]"}`}>
                  {allPassed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                  {passedChecks}/{totalChecks} checks passed
                </div>
              </div>
              <div className="space-y-2">
                {bid.validationResults.map((v, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${v.passed ? "bg-slate-50 border-slate-200" : "bg-red-50 border-red-100"}`}>
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${v.passed ? "bg-[#0F172A]" : "bg-red-500"}`}>
                      {v.passed ? <Check className="h-3 w-3 text-white" /> : <X className="h-3 w-3 text-white" />}
                    </div>
                    <div>
                      <div className={`text-xs font-semibold ${v.passed ? "text-[#0F172A]" : "text-red-800"}`}>{v.check}</div>
                      <div className={`text-[11px] mt-0.5 ${v.passed ? "text-[#0F172A]" : "text-red-600"}`}>{v.notes}</div>
                    </div>
                  </div>
                ))}
              </div>
              {!allPassed && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-xs font-semibold text-[#0F172A] mb-1">⚠ Submission Blocked</div>
                  <div className="text-xs text-[#0F172A]">All validation checks must pass before the bid can be submitted. Please resolve the failed checks above.</div>
                </div>
              )}
            </div>
          )}

          {tab === "Audit Trail" && (
            <div className="space-y-3">
              <div className="text-xs font-semibold">Submission Audit Trail</div>
              <div className="space-y-2">
                {[
                  { action: "Bid submission created", time: bid.createdAt, user: bid.supplierName, detail: "Bid reference generated" },
                  ...(bid.documents.map(d => ({ action: `Document uploaded: ${d.name}`, time: d.uploadedAt, user: bid.supplierName, detail: `${d.category} · ${d.size}` }))),
                  ...(bid.isDigitallySigned ? [{ action: "Digital signature applied", time: bid.submissionTime, user: bid.supplierName, detail: `Signature ref: ${bid.digitalSignatureRef}` }] : []),
                  ...(bid.isEncrypted ? [{ action: "Submission encrypted", time: bid.submissionTime, user: "System", detail: "AES-256 encryption applied" }] : []),
                  ...(bid.submissionReceiptNo ? [{ action: "Submission receipt generated", time: bid.submissionTime, user: "System", detail: `Receipt: ${bid.submissionReceiptNo}` }] : []),
                ].filter(e => e.time).map((entry, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-[#F9F9F9] rounded-xl border border-black/8">
                    <div className="h-7 w-7 rounded-full bg-black/8 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-black/50">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium">{entry.action}</div>
                      <div className="text-[10px] text-black/40 mt-0.5">{entry.user} · {entry.time}</div>
                      {entry.detail && <div className="text-[10px] text-black/30 mt-0.5">{entry.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs font-semibold text-[#0F172A] mb-1">System Information</div>
                <div className="text-[11px] text-[#0F172A] space-y-0.5">
                  {bid.ipAddress && <div>IP Address: {bid.ipAddress}</div>}
                  {bid.deviceInfo && <div>Device: {bid.deviceInfo}</div>}
                  <div>Submission ID: {bid.bidReference}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-black/8 flex-shrink-0">
          <div className="flex gap-2">
            {bid.status === "Draft" && (
              <button onClick={() => { onAction(bid.id, "validate"); onClose(); }}
                className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center gap-1">
                <Shield className="h-3 w-3" /> Validate Bid
              </button>
            )}
            {bid.status === "Validation" && allPassed && (
              <button onClick={() => { onAction(bid.id, "sign"); onClose(); }}
                className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center gap-1">
                <FileSignature className="h-3 w-3" /> Apply Digital Signature
              </button>
            )}
            {bid.status === "Digital Signature" && (
              <button onClick={() => { onAction(bid.id, "submit"); onClose(); }}
                className="h-8 px-3 bg-[#0F172A] text-white rounded-lg text-xs font-medium hover:bg-[#0F172A] flex items-center gap-1">
                <Send className="h-3 w-3" /> Submit Encrypted Bid
              </button>
            )}
          </div>
          <button onClick={() => onAction(bid.id, "download")}
            className="h-8 px-3 border border-black/10 rounded-lg text-xs hover:bg-[#EAF1F8] flex items-center gap-1">
            <Download className="h-3 w-3" /> Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type PageTab = "Bid Submissions" | "Dashboard" | "Lifecycle Tower" | "Capabilities";

export default function BidSubmissionPage() {
  const { user } = useAuth();
  const [bids, setBids] = useState<BidSubmission[]>(SEED_BID_SUBMISSIONS);
  const [tab, setTab] = useState<PageTab>("Bid Submissions");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selected, setSelected] = useState<BidSubmission | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = bids.filter(b => {
    const matchSearch = b.tenderTitle.toLowerCase().includes(search.toLowerCase()) ||
      b.bidReference.toLowerCase().includes(search.toLowerCase()) ||
      b.supplierName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAction = (id: string, action: string) => {
    const bid = bids.find(b => b.id === id);
    if (!bid) return;
    const now = new Date().toLocaleString();

    if (action === "validate") {
      const allPass = bid.documents.length > 0;
      const updatedResults = bid.validationResults.map(v => ({
        ...v,
        passed: v.check === "Mandatory documents submitted" ? allPass : v.passed,
        notes: v.check === "Mandatory documents submitted"
          ? (allPass ? `${bid.documents.length} document(s) uploaded` : "No documents uploaded yet") : v.notes,
      }));
      setBids(prev => prev.map(b => b.id === id ? { ...b, status: "Validation" as const, workflowProgress: 25, validationResults: updatedResults, updatedAt: now } : b));
      pushNotification(`Bid ${bid.bidReference} validation started`, "info");
      toast(`Validation initiated for ${bid.bidReference}. Please review all checks.`, "info");

    } else if (action === "sign") {
      const sigRef = `DSIG-2026-${bid.supplierName.toUpperCase().replace(/\s/g, "-").slice(0, 10)}-${id.slice(-4)}`;
      setBids(prev => prev.map(b => b.id === id ? { ...b, status: "Digital Signature" as const, workflowProgress: 50, isDigitallySigned: true, digitalSignatureRef: sigRef, updatedAt: now } : b));
      pushNotification(`Digital signature applied: ${bid.bidReference}`, "success");
      toast(`Digital signature applied. Bid is ready for encrypted submission.`, "success");

    } else if (action === "submit") {
      const receiptNo = `RCPT-2026-${bid.tenderNumber.split("-").pop()}-${String(bids.length + 1).padStart(3, "0")}`;
      setBids(prev => prev.map(b => b.id === id ? {
        ...b, status: "Receipt Generated" as const, workflowProgress: 100,
        isEncrypted: true, submissionTime: now, submissionReceiptNo: receiptNo,
        complianceScore: 95, updatedAt: now,
        validationResults: b.validationResults.map(v => ({ ...v, passed: true, notes: v.notes || "Validated on submission" })),
      } : b));
      pushSeniorAlert(`Bid submitted: ${bid.tenderTitle} by ${bid.supplierName}`, "success", { from: user?.name, fromRole: user?.role ?? "officer", category: "action", ref: id });
      pushNotification(`Bid ${bid.bidReference} submitted — receipt ${receiptNo}`, "success");
      toast(`Bid submitted successfully! Receipt: ${receiptNo}. Encrypted and sealed until opening.`, "success");

    } else if (action === "download") {
      const content = [
        "BID SUBMISSION RECEIPT",
        `\nReceipt No: ${bid.submissionReceiptNo || "N/A"}`,
        `Bid Reference: ${bid.bidReference}`,
        `Tender: ${bid.tenderTitle}`,
        `Tender No: ${bid.tenderNumber}`,
        `Supplier: ${bid.supplierName}`,
        `Financial Proposal: ${bid.currency} ${bid.financialProposalAmount}`,
        `Submission Time: ${bid.submissionTime || "Not yet submitted"}`,
        `Status: ${bid.status}`,
        `Digital Signature: ${bid.digitalSignatureRef || "N/A"}`,
        `Encrypted: ${bid.isEncrypted ? "Yes" : "No"}`,
        `\nGenerated: ${new Date().toLocaleString()}`,
        `\nThis receipt confirms that the above bid has been received and secured in the e-procurement system.`,
      ].join("\n");
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${bid.bidReference}-receipt.txt`; a.click();
      URL.revokeObjectURL(url);
      pushNotification(`Receipt downloaded for ${bid.bidReference}`, "success");
    }
  };

  const handleAddBid = (b: BidSubmission) => {
    setBids(prev => [b, ...prev]);
    pushNotification(`New bid submission created: ${b.bidReference}`, "success");
    toast(`Bid ${b.bidReference} created. Please upload required documents and complete validation.`, "info");
    setShowNew(false);
  };

  const submittedBids = bids.filter(b => ["Receipt Generated", "Submission Confirmation"].includes(b.status));
  const pendingBids = bids.filter(b => ["Draft", "Validation", "Digital Signature", "Encrypted Submission"].includes(b.status));
  const avgCompliance = bids.length > 0 ? Math.round(bids.reduce((s, b) => s + b.complianceScore, 0) / bids.length) : 0;

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Bid Submission"
        financialYear="FY2026"
        pageType="form"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Stage 6 — Bid Submission</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Bid Submission Workbench"
          description="Manage encrypted electronic bid submissions with digital signatures, automatic validation, compliance verification, and submission receipts."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Bids" value={String(bids.length)} delta={`${submittedBids.length} submitted`} />
          <KpiCard label="Pending Submission" value={String(pendingBids.length)} delta="Awaiting completion" positive={pendingBids.length === 0} />
          <KpiCard label="Submitted & Sealed" value={String(submittedBids.length)} delta="Encrypted vault" />
          <KpiCard label="Avg Compliance" value={`${avgCompliance}%`} delta="Validation score" positive={avgCompliance >= 80} />
        </div>

        <div className="flex gap-1 mb-5 border-b border-black/8 overflow-x-auto scrollbar-none">
          {(["Bid Submissions", "Dashboard", "Lifecycle Tower", "Capabilities"] as PageTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors
                ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}
            </button>
          ))}
        </div>

        {tab === "Lifecycle Tower" && (
          <LifecycleTower
            title="Bid Submission Lifecycle — 7 Stages"
            subtitle="From bid preparation through document upload, validation, digital signature, encrypted submission, receipt, and portal closure. Click any stage for full toolset."
            stages={BID_SUBMISSION_STAGES}
            context="Bid Submission"
            badgeLabel="7 Stages · Stage 6 of Procurement Lifecycle"
          />
        )}

        {tab === "Capabilities" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Encrypted Bid Vault", desc: "All bids encrypted with AES-256 on submission. Sealed until official opening ceremony. No premature access possible." },
              { title: "Digital Signature", desc: "Mandatory digital signature on technical and financial proposals. Signature authenticity verified automatically on submission." },
              { title: "Automatic Validation", desc: "7-point validation: mandatory documents, file formats, deadline compliance, bid security, digital signature, encryption, and eligibility." },
              { title: "Submission Workflow", desc: "Guided 5-step workflow: Draft → Validation → Digital Signature → Encrypted Submission → Receipt Generated." },
              { title: "Bid Security Verification", desc: "Bank guarantee or insurance bond details recorded and verified. Automatic rejection of bids with invalid or expired bid security." },
              { title: "Submission Receipt", desc: "Official electronic receipt issued on every successful submission with unique reference, timestamp, and digital proof." },
              { title: "Document Management", desc: "Categorised document upload: Technical Proposal, Financial Proposal, Bid Security, Legal, Certificates. Version control and preview." },
              { title: "Late Bid Prevention", desc: "Portal automatically closes at submission deadline. Late bids are rejected without opening. Deadline countdown displayed to bidders." },
              { title: "Complete Audit Trail", desc: "Immutable log of all bid actions with user, timestamp, IP address, and device information for full accountability." },
            ].map(c => (
              <div key={c.title} className="p-4 rounded-2xl border border-black/8 bg-white hover:border-black/20 transition-colors">
                <div className="text-xs font-bold mb-1.5">{c.title}</div>
                <div className="text-xs text-black/50 leading-relaxed">{c.desc}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "Dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader title="Active Tenders Open for Bidding" subtitle="Submissions currently being accepted" />
              <div className="divide-y divide-black/5">
                {[
                  { tender: "ZW-PRA-2026-00186", title: "ICT Equipment — Secondary Schools", deadline: "2026-08-30 16:00", bids: 1, status: "Open" },
                  { tender: "ZW-PRA-2026-00185", title: "ARV Medicines Framework 2026/27", deadline: "2026-09-15 16:00", bids: 0, status: "Open" },
                  { tender: "ZW-PRA-2026-00184", title: "Solar Mini-Grids — 12 Rural Clinics", deadline: "2026-07-08 16:00", bids: 11, status: "Closed" },
                ].map(t => (
                  <div key={t.tender} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-semibold">{t.title}</div>
                      <div className="text-[10px] text-black/40 mt-0.5 font-mono">{t.tender}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xs font-bold ${t.status === "Open" ? "text-[#0F172A]" : "text-black/40"}`}>{t.status}</div>
                      <div className="text-[10px] text-black/40">{t.bids} bid{t.bids !== 1 ? "s" : ""} · closes {t.deadline}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Submission Status Summary" subtitle="All bids in the system" />
              <div className="p-5 space-y-3">
                {BID_WORKFLOW_STAGES.map(stage => {
                  const count = bids.filter(b => b.status === stage).length;
                  const pct = bids.length > 0 ? Math.round((count / bids.length) * 100) : 0;
                  return (
                    <div key={stage}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-black/60">{stage}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-black/8 overflow-hidden">
                        <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <CardHeader title="Pending Actions" subtitle="Bids requiring attention" />
              <div className="divide-y divide-black/5">
                {bids.filter(b => b.status !== "Receipt Generated").length === 0 ? (
                  <div className="px-5 py-6 text-center text-xs text-black/30">All bids are in order — no pending actions.</div>
                ) : (
                  bids.filter(b => b.status !== "Receipt Generated").map(b => (
                    <div key={b.id} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold">{b.supplierName}</div>
                          <div className="text-[10px] text-black/40">{b.bidReference}</div>
                        </div>
                        <Badge tone={STATUS_TONE[b.status] ?? "muted"}>{b.status}</Badge>
                      </div>
                      <div className="mt-1.5 text-[11px] text-[#0F172A]">
                        {b.status === "Draft" && "→ Upload documents and run validation"}
                        {b.status === "Validation" && "→ Review validation results"}
                        {b.status === "Digital Signature" && "→ Apply digital signature to submit"}
                        {b.status === "Encrypted Submission" && "→ Confirm submission"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Recent Notifications" subtitle="System alerts for bid submissions" />
              <div className="p-5 space-y-2">
                {[
                  { msg: "Bid RCPT-2026-00186-001 successfully submitted — Sable ICT Solutions", type: "success", time: "28 Aug 14:22" },
                  { msg: "Submission deadline approaching: ZW-PRA-2026-00186 closes 30 Aug 16:00", type: "warning", time: "27 Aug 09:00" },
                  { msg: "Digital signature verified for BID-2026-00186-001", type: "info", time: "28 Aug 14:10" },
                  { msg: "Bid portal opens for ZW-PRA-2026-00185 on 2026-08-01", type: "info", time: "25 Aug 08:00" },
                ].map((n, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${n.type === "success" ? "bg-slate-50 border-slate-200 text-[#0F172A]" : n.type === "warning" ? "bg-slate-50 border-slate-200 text-[#0F172A]" : "bg-slate-50 border-slate-200 text-[#0F172A]"}`}>
                    <Bell className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <div>{n.msg}</div>
                      <div className="text-[10px] opacity-60 mt-0.5">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "Bid Submissions" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bids, suppliers, tenders…"
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="h-9 px-3 rounded-xl border border-black/10 text-xs focus:outline-none">
                <option>All</option>
                {BID_WORKFLOW_STAGES.map(s => <option key={s}>{s}</option>)}
                <option>Late</option>
                <option>Rejected</option>
              </select>
              <button onClick={() => setShowNew(true)}
                className="h-9 px-3 bg-black text-white rounded-xl text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> New Bid
              </button>
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-xs text-black/30">No bids match your search.</div>
            )}
            {filtered.map(bid => {
              const passedChecks = bid.validationResults.filter(v => v.passed).length;
              const totalChecks = bid.validationResults.length;
              const validationPct = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

              return (
                <Card key={bid.id}>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge tone={STATUS_TONE[bid.status] ?? "muted"}>{bid.status}</Badge>
                          <span className="text-[10px] font-mono text-black/40">{bid.bidReference}</span>
                          {bid.isEncrypted && <span className="flex items-center gap-0.5 text-[10px] text-[#0F172A]"><Lock className="h-2.5 w-2.5" />Encrypted</span>}
                          {bid.isDigitallySigned && <span className="flex items-center gap-0.5 text-[10px] text-[#0F172A]"><FileSignature className="h-2.5 w-2.5" />Signed</span>}
                        </div>
                        <div className="text-sm font-bold">{bid.tenderTitle}</div>
                        <div className="text-xs text-black/50 mt-0.5">{bid.supplierName} · {bid.tenderNumber}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm font-bold">{bid.currency} {bid.financialProposalAmount || "—"}</div>
                        <div className="text-[10px] text-black/40 mt-0.5">Financial Proposal</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[11px]">
                      <div><span className="text-black/40">Deadline:</span> <span className="font-medium">{bid.submissionDeadline || "—"}</span></div>
                      <div><span className="text-black/40">Documents:</span> <span className="font-medium">{bid.documents.length} uploaded</span></div>
                      <div><span className="text-black/40">Validation:</span> <span className={`font-bold ${validationPct === 100 ? "text-[#0F172A]" : validationPct >= 50 ? "text-[#0F172A]" : "text-red-600"}`}>{validationPct}%</span></div>
                      <div><span className="text-black/40">Compliance:</span> <span className={`font-bold ${bid.complianceScore >= 80 ? "text-[#0F172A]" : "text-[#0F172A]"}`}>{bid.complianceScore}%</span></div>
                    </div>

                    <div className="mb-3 overflow-x-auto pb-1">
                      <WorkflowSteps status={bid.status} />
                    </div>

                    {bid.submissionReceiptNo && (
                      <div className="mb-3 flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#0F172A] flex-shrink-0" />
                        <span className="text-xs text-[#0F172A]">Receipt: <span className="font-mono font-bold">{bid.submissionReceiptNo}</span> · Submitted {bid.submissionTime}</span>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => setSelected(bid)}
                        className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Open
                      </button>
                      {bid.status === "Draft" && (
                        <button onClick={() => handleAction(bid.id, "validate")}
                          className="h-8 px-3 border border-slate-200 bg-slate-50 text-[#0F172A] rounded-lg text-xs hover:bg-slate-100 flex items-center gap-1">
                          <Shield className="h-3 w-3" /> Validate
                        </button>
                      )}
                      {bid.status === "Validation" && (
                        <button onClick={() => handleAction(bid.id, "sign")}
                          className="h-8 px-3 border border-slate-200 bg-slate-50 text-[#0F172A] rounded-lg text-xs hover:bg-slate-100 flex items-center gap-1">
                          <FileSignature className="h-3 w-3" /> Sign
                        </button>
                      )}
                      {bid.status === "Digital Signature" && (
                        <button onClick={() => handleAction(bid.id, "submit")}
                          className="h-8 px-3 bg-[#0F172A] text-white rounded-lg text-xs font-medium hover:bg-[#0F172A] flex items-center gap-1">
                          <Send className="h-3 w-3" /> Submit
                        </button>
                      )}
                      <button onClick={() => handleAction(bid.id, "download")}
                        className="h-8 px-3 border border-black/10 rounded-lg text-xs hover:bg-[#EAF1F8] flex items-center gap-1">
                        <Download className="h-3 w-3" /> Receipt
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {selected && <BidDetailPanel bid={selected} onClose={() => setSelected(null)} onAction={handleAction} />}
      {showNew && <NewBidModal onSave={handleAddBid} onClose={() => setShowNew(false)} />}
    </AppShell>
  );
}
