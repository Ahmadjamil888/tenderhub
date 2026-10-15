import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import LifecycleTower from "@/components/LifecycleTower";
import { CONTRACT_AWARD_STAGES } from "@/lib/lifecycle-stages";
import {
  type ContractAward, SEED_CONTRACT_AWARDS, AWARD_WORKFLOW_STAGES,
  type AwardDocument, type AwardCondition, type ContractClause,
} from "@/lib/procurement-workbench-data";
import { useAuth } from "@/lib/auth-context";
import { pushNotification, pushSeniorAlert } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import {
  Trophy, Plus, Search, Sparkles, FileText, Eye, Check, X, ChevronRight,
  Download, Send, Edit2, Shield, Clock, CheckCircle2, AlertTriangle,
  FileSignature, Users, Building2, DollarSign, Calendar, Star,
  Lock, Unlock, Printer, RefreshCcw, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_TONE: Record<string, "green" | "amber" | "blue" | "red" | "muted" | "violet"> = {
  "Contract Signed":  "green",
  "Award Issued":     "green",
  "Approved":         "blue",
  "Pending Approval": "amber",
  "Under Review":     "amber",
  Draft:              "muted",
  Standstill:         "violet",
  Rejected:           "red",
};

const WORKFLOW_STEPS = AWARD_WORKFLOW_STAGES;

function WorkflowBar({ stage }: { stage: string }) {
  const idx = WORKFLOW_STEPS.indexOf(stage as typeof WORKFLOW_STEPS[number]);
  return (
    <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
      {WORKFLOW_STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-shrink-0">
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap
            ${i < idx ? "bg-slate-50 text-[#0F172A]" : i === idx ? "bg-black text-white" : "bg-[#EAF1F8] text-black/40"}`}>
            {i < idx && <Check className="h-3 w-3" />}
            {s}
          </div>
          {i < WORKFLOW_STEPS.length - 1 && (
            <ChevronRight className={`h-3 w-3 mx-0.5 flex-shrink-0 ${i < idx ? "text-slate-500" : "text-black/15"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── AI Assistant ─────────────────────────────────────────────────────────────
function AIAwardAssistant({ award, onClose }: { award: ContractAward | null; onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<{ from: "ai" | "user"; text: string }[]>([
    { from: "ai", text: "I'm the Contract Award Intelligence AI. I can help with award justification, contract generation, compliance checks, and risk assessment. What would you like to explore?" },
  ]);
  const sendMsg = () => {
    if (!msg.trim()) return;
    const user = msg.trim(); setMsg("");
    setChat(c => [...c, { from: "user", text: user }]);
    setTimeout(() => {
      let reply = "Based on procurement best practices and PPDPA regulations, this award appears well-documented with appropriate justification and supporting documentation.";
      if (user.toLowerCase().includes("risk")) reply = "Key risks for this award: 1) Standstill period appeals — ensure regret letters are issued promptly. 2) Performance bond must be lodged within 14 days. 3) Insurance certificates must be verified before contract commencement.";
      else if (user.toLowerCase().includes("contract")) reply = "I recommend including milestone-based payment terms, clear penalty clauses with specific rates, and a detailed scope of work annex. The contract should also include an explicit variation order procedure.";
      else if (user.toLowerCase().includes("justification")) reply = `The award justification for ${award?.contractTitle ?? "this contract"} is well-structured. Ensure it addresses: evaluation methodology, scoring summary, price reasonableness assessment, and compliance with PPDPA Section 49.`;
      else if (user.toLowerCase().includes("compliance")) reply = `Compliance score: ${award?.complianceScore ?? 0}%. Critical items: Verify standstill period calculation (14 working days), confirm public award notice publication, and ensure regret letters include right of appeal information.`;
      setChat(c => [...c, { from: "ai", text: reply }]);
    }, 600);
  };
  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-black/10 shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 bg-black text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <div>
            <div className="text-xs font-bold">Award Intelligence AI</div>
            <div className="text-[10px] text-white/60">Contract Award Assistant</div>
          </div>
        </div>
        <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-white/10"><X className="h-4 w-4" /></button>
      </div>
      {award && (
        <div className="px-4 py-2.5 bg-black/5 border-b border-black/8">
          <div className="text-[10px] font-semibold text-black/60 uppercase tracking-wide mb-1">Active Record</div>
          <div className="text-xs font-semibold text-black truncate">{award.contractTitle}</div>
          <div className="text-[10px] text-black/50">{award.awardReferenceNumber}</div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${m.from === "user" ? "bg-black text-white" : "bg-[#EAF1F8] text-black"}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-black/10 p-3 flex gap-2">
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Ask about awards…" className="flex-1 h-8 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
        <button onClick={sendMsg} className="h-8 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800"><Send className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

// ─── New Award Modal ───────────────────────────────────────────────────────────
function NewAwardModal({ onSave, onClose }: { onSave: (a: ContractAward) => void; onClose: () => void }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    tenderReference: "", contractTitle: "", winningSupplier: "", supplierEmail: "",
    supplierPhone: "", contractAmount: "", currency: "USD", awardDate: "",
    effectiveDate: "", contractDurationMonths: "12", startDate: "", endDate: "",
    awardJustification: "", ministry: user?.entity ?? "", department: "",
  });
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.tenderReference.trim()) { setError("Tender reference is required."); return; }
    if (!form.winningSupplier.trim()) { setError("Winning supplier is required."); return; }
    if (!form.contractAmount.trim()) { setError("Contract amount is required."); return; }
    const now = new Date().toISOString().split("T")[0];
    const seq = String(Date.now()).slice(-4);
    const newAward: ContractAward = {
      id: `award-${Date.now()}`,
      awardReferenceNumber: `AWD-2026-${seq}`,
      tenderReference: form.tenderReference,
      contractNumber: `CN-2026-${seq}`,
      winningSupplier: form.winningSupplier,
      supplierEmail: form.supplierEmail,
      supplierPhone: form.supplierPhone,
      contractTitle: form.contractTitle,
      contractAmount: form.contractAmount,
      currency: form.currency,
      awardDate: form.awardDate || now,
      awardApprovalDate: "",
      effectiveDate: form.effectiveDate,
      contractDurationMonths: Number(form.contractDurationMonths),
      startDate: form.startDate,
      endDate: form.endDate,
      awardStatus: "Draft",
      workflowStage: "Draft",
      workflowProgress: 5,
      awardJustification: form.awardJustification,
      ministry: form.ministry,
      department: form.department,
      procurementMethod: "Open Tender",
      complianceScore: 70,
      aiRecommendations: ["Review and complete all award conditions", "Generate supporting documents after approval"],
      awardConditions: [],
      documents: [],
      digitalSignatureRef: "",
      version: "v1.0",
      approvedBy: "",
      approvedAt: "",
      contractClauses: [],
      owner: user?.name ?? "System",
      createdAt: now,
      updatedAt: now,
    };
    onSave(newAward);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
          <div>
            <div className="text-sm font-bold">New Contract Award</div>
            <div className="text-xs text-black/40 mt-0.5">Step {step} of 3</div>
          </div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EAF1F8]"><X className="h-4 w-4" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}
          {step === 1 && (
            <>
              <div className="text-xs font-semibold text-black/60 uppercase tracking-wide">Award Header</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="text-xs font-medium text-black/60 block mb-1">Contract Title *</label><input className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" value={form.contractTitle} onChange={e => set("contractTitle", e.target.value)} placeholder="e.g. Supply of ICT Equipment" /></div>
                <div><label className="text-xs font-medium text-black/60 block mb-1">Tender Reference *</label><input className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" value={form.tenderReference} onChange={e => set("tenderReference", e.target.value)} placeholder="ZW-PRA-2026-XXXXX" /></div>
                <div><label className="text-xs font-medium text-black/60 block mb-1">Winning Supplier *</label><input className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" value={form.winningSupplier} onChange={e => set("winningSupplier", e.target.value)} /></div>
                <div><label className="text-xs font-medium text-black/60 block mb-1">Supplier Email</label><input className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" value={form.supplierEmail} onChange={e => set("supplierEmail", e.target.value)} /></div>
                <div><label className="text-xs font-medium text-black/60 block mb-1">Supplier Phone</label><input className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" value={form.supplierPhone} onChange={e => set("supplierPhone", e.target.value)} /></div>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="text-xs font-semibold text-black/60 uppercase tracking-wide">Contract & Financial Details</div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-black/60 block mb-1">Contract Amount *</label><input className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" value={form.contractAmount} onChange={e => set("contractAmount", e.target.value)} placeholder="e.g. 1,200,000" /></div>
                <div><label className="text-xs font-medium text-black/60 block mb-1">Currency</label>
                  <select className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 bg-white" value={form.currency} onChange={e => set("currency", e.target.value)}>
                    {["USD","ZWG","EUR","GBP","ZAR"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium text-black/60 block mb-1">Award Date</label><input type="date" className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" value={form.awardDate} onChange={e => set("awardDate", e.target.value)} /></div>
                <div><label className="text-xs font-medium text-black/60 block mb-1">Effective Date</label><input type="date" className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" value={form.effectiveDate} onChange={e => set("effectiveDate", e.target.value)} /></div>
                <div><label className="text-xs font-medium text-black/60 block mb-1">Start Date</label><input type="date" className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" value={form.startDate} onChange={e => set("startDate", e.target.value)} /></div>
                <div><label className="text-xs font-medium text-black/60 block mb-1">End Date</label><input type="date" className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" value={form.endDate} onChange={e => set("endDate", e.target.value)} /></div>
                <div><label className="text-xs font-medium text-black/60 block mb-1">Duration (months)</label><input type="number" className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" value={form.contractDurationMonths} onChange={e => set("contractDurationMonths", e.target.value)} /></div>
                <div><label className="text-xs font-medium text-black/60 block mb-1">Ministry</label><input className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" value={form.ministry} onChange={e => set("ministry", e.target.value)} /></div>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <div className="text-xs font-semibold text-black/60 uppercase tracking-wide">Award Justification</div>
              <textarea rows={8} className="w-full px-3 py-2.5 rounded-lg border border-black/10 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-black/10" placeholder="Provide the award justification — evaluation outcome, scoring summary, price reasonableness, and compliance with PPDPA..." value={form.awardJustification} onChange={e => set("awardJustification", e.target.value)} />
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-xs font-semibold text-[#0F172A] mb-1">AI Recommendation</div>
                <div className="text-xs text-[#0F172A]">A complete justification should include: methodology used, evaluation scores summary, price competitiveness assessment, and reference to applicable PPDPA sections.</div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/8">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : onClose()} className="h-8 px-4 rounded-xl border border-black/10 text-xs hover:bg-[#EAF1F8]">{step === 1 ? "Cancel" : "Back"}</button>
          {step < 3 ? <button onClick={() => { setError(""); setStep(s => s + 1); }} className="h-8 px-4 rounded-xl bg-black text-white text-xs hover:bg-gray-800">Next →</button>
           : <button onClick={handleSave} className="h-8 px-4 rounded-xl bg-black text-white text-xs hover:bg-gray-800">Create Award</button>}
        </div>
      </div>
    </div>
  );
}

// ─── Award Detail Panel ───────────────────────────────────────────────────────
function AwardDetailPanel({ award, onClose, onUpdate }: {
  award: ContractAward; onClose: () => void; onUpdate: (patch: Partial<ContractAward>) => void;
}) {
  const [tab, setTab] = useState<"Summary" | "Documents" | "Conditions" | "Contract" | "Audit">("Summary");

  const generateDocument = (type: AwardDocument["type"]) => {
    const doc: AwardDocument = {
      id: `doc-${Date.now()}`, name: `${type} — ${award.contractNumber}.pdf`,
      type, version: "v1.0", generatedAt: new Date().toISOString().split("T")[0],
      generatedBy: "System (AI)", isSigned: false, signedAt: "", signedBy: "", status: "Draft",
    };
    onUpdate({ documents: [...(award.documents ?? []), doc] });
    pushNotification(`${type} generated for ${award.contractNumber}`, "success");
    toast(`${type} generated successfully`, "success");
  };

  const advanceWorkflow = () => {
    const stages = AWARD_WORKFLOW_STAGES;
    const idx = stages.indexOf(award.workflowStage);
    if (idx < stages.length - 1) {
      const next = stages[idx + 1];
      const progress = Math.round(((idx + 2) / stages.length) * 100);
      onUpdate({ workflowStage: next, workflowProgress: progress, awardStatus: next === "Signed" ? "Contract Signed" : next === "Award Issued" ? "Award Issued" : "Under Review" });
      pushNotification(`Award ${award.awardReferenceNumber} advanced to: ${next}`, "success");
      toast(`Workflow advanced to: ${next}`, "success");
    }
  };

  const downloadDoc = (doc: AwardDocument) => {
    const content = [
      doc.type.toUpperCase(),
      "",
      `Award Reference: ${award.awardReferenceNumber}`,
      `Contract Number: ${award.contractNumber}`,
      `Tender Reference: ${award.tenderReference}`,
      `Contract Title: ${award.contractTitle}`,
      `Winning Supplier: ${award.winningSupplier}`,
      `Contract Amount: ${award.currency} ${award.contractAmount}`,
      `Award Date: ${award.awardDate}`,
      `Effective Date: ${award.effectiveDate}`,
      "",
      `Award Justification:`,
      award.awardJustification,
      "",
      `Generated by AI Powered Electronic Public Procurement and Oversight Intelligence System`,
      `Government of Zimbabwe · ${new Date().toLocaleString()}`,
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = doc.name.replace(".pdf", ".txt"); a.click();
    URL.revokeObjectURL(url);
    pushNotification(`${doc.name} downloaded`, "success");
  };

  const TABS = ["Summary", "Documents", "Conditions", "Contract", "Audit"] as const;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-4xl shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/8 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold">{award.contractTitle}</span>
              <Badge tone={STATUS_TONE[award.awardStatus] ?? "muted"}>{award.awardStatus}</Badge>
            </div>
            <div className="text-xs text-black/40 mt-0.5">{award.awardReferenceNumber} · {award.contractNumber} · {award.winningSupplier}</div>
          </div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EAF1F8]"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 pt-3 border-b border-black/8 flex-shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex gap-1 mb-3"><WorkflowBar stage={award.workflowStage} /></div>
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors
                  ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-5">
          {tab === "Summary" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Award Reference", value: award.awardReferenceNumber },
                  { label: "Tender Reference", value: award.tenderReference },
                  { label: "Contract Number", value: award.contractNumber },
                  { label: "Winning Supplier", value: award.winningSupplier },
                  { label: "Contract Amount", value: `${award.currency} ${award.contractAmount}` },
                  { label: "Award Date", value: award.awardDate },
                  { label: "Approval Date", value: award.awardApprovalDate || "—" },
                  { label: "Effective Date", value: award.effectiveDate },
                  { label: "Duration", value: `${award.contractDurationMonths} months` },
                  { label: "Start Date", value: award.startDate },
                  { label: "End Date", value: award.endDate },
                  { label: "Procurement Method", value: award.procurementMethod },
                ].map(f => (
                  <div key={f.label} className="bg-[#EAF1F8] rounded-xl p-3">
                    <div className="text-[10px] text-black/40 uppercase tracking-wide mb-0.5">{f.label}</div>
                    <div className="text-xs font-semibold text-black">{f.value}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-xs font-semibold text-black/60 uppercase tracking-wide mb-2">Award Justification</div>
                <div className="bg-[#EAF1F8] rounded-xl p-4 text-xs text-black/80 leading-relaxed">{award.awardJustification || "Not yet provided."}</div>
              </div>
              {award.aiRecommendations.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-black/60 uppercase tracking-wide mb-2">AI Recommendations</div>
                  <div className="space-y-2">
                    {award.aiRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#0F172A] mt-0.5 flex-shrink-0" />
                        <span className="text-[#0F172A]">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2 flex-wrap pt-2">
                {award.workflowStage !== "Signed" && (
                  <button onClick={advanceWorkflow} className="h-8 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5">
                    <ChevronRight className="h-3.5 w-3.5" /> Advance Workflow
                  </button>
                )}
                <button onClick={() => generateDocument("Award Letter")} className="h-8 px-4 rounded-xl border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Generate Award Letter
                </button>
                <button onClick={() => generateDocument("Notice of Award")} className="h-8 px-4 rounded-xl border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Notice of Award
                </button>
                <button onClick={() => generateDocument("Regret Letter")} className="h-8 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[#0F172A] text-xs hover:bg-slate-100 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Regret Letters
                </button>
                <button onClick={() => generateDocument("Contract Document")} className="h-8 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[#0F172A] text-xs hover:bg-slate-100 flex items-center gap-1.5">
                  <FileSignature className="h-3.5 w-3.5" /> Generate Contract
                </button>
              </div>
            </div>
          )}

          {tab === "Documents" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-black/60 uppercase tracking-wide">Award Documents</div>
                <button onClick={() => generateDocument("Supporting")} className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1"><Plus className="h-3 w-3" /> Add Document</button>
              </div>
              {award.documents.length === 0 ? (
                <div className="text-center py-12 text-black/30 text-xs">No documents generated yet. Use the Summary tab to generate documents.</div>
              ) : (
                <div className="space-y-2">
                  {award.documents.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 border border-black/8 rounded-xl hover:bg-[#EAF1F8] transition-colors">
                      <div className="h-9 w-9 bg-slate-50 rounded-lg grid place-items-center flex-shrink-0"><FileText className="h-4 w-4 text-[#0F172A]" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-black truncate">{doc.name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-black/40">{doc.type}</span>
                          <span className="text-[10px] text-black/25">·</span>
                          <span className="text-[10px] text-black/40">{doc.version}</span>
                          <span className="text-[10px] text-black/25">·</span>
                          <span className={`text-[10px] font-medium ${doc.status === "Signed" ? "text-[#0F172A]" : doc.status === "Sent" ? "text-[#0F172A]" : "text-[#0F172A]"}`}>{doc.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {doc.isSigned && <span className="text-[10px] font-medium text-[#0F172A] flex items-center gap-1"><Shield className="h-3 w-3" /> Signed</span>}
                        <button onClick={() => downloadDoc(doc)} className="h-7 px-2.5 rounded-lg border border-black/10 text-[10px] hover:bg-[#EAF1F8] flex items-center gap-1"><Download className="h-3 w-3" /> Download</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Conditions" && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-black/60 uppercase tracking-wide">Award Conditions</div>
              {award.awardConditions.length === 0 ? (
                <div className="text-center py-8 text-black/30 text-xs">No conditions recorded.</div>
              ) : (
                <div className="space-y-2">
                  {award.awardConditions.map(cond => (
                    <div key={cond.id} className="flex items-start gap-3 p-3 border border-black/8 rounded-xl">
                      <div className={`h-5 w-5 rounded-full grid place-items-center flex-shrink-0 mt-0.5 ${cond.status === "Met" ? "bg-slate-100 text-[#0F172A]" : cond.status === "Waived" ? "bg-gray-100 text-gray-500" : "bg-slate-100 text-[#0F172A]"}`}>
                        {cond.status === "Met" ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-black leading-relaxed">{cond.condition}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-black/40">{cond.responsible}</span>
                          <span className="text-[10px] text-black/25">·</span>
                          <span className="text-[10px] text-black/40">Due: {cond.dueDate}</span>
                        </div>
                      </div>
                      <Badge tone={cond.status === "Met" ? "green" : cond.status === "Waived" ? "muted" : "amber"}>{cond.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Contract" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-black/60 uppercase tracking-wide">Contract Clauses</div>
                <button onClick={() => generateDocument("Contract Document")} className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1"><Plus className="h-3 w-3" /> Generate Contract</button>
              </div>
              {award.contractClauses.length === 0 ? (
                <div className="text-center py-8 text-black/30 text-xs">No clauses yet. Generate the contract to auto-populate clauses from the approved template.</div>
              ) : (
                <div className="space-y-2">
                  {award.contractClauses.map(clause => (
                    <div key={clause.id} className="border border-black/8 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#EAF1F8]">
                        <span className="text-[10px] font-mono text-black/50">{clause.clauseNumber}</span>
                        <span className="text-xs font-semibold text-black flex-1">{clause.title}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${clause.category === "General" ? "bg-gray-100 text-gray-600" : clause.category === "Financial" ? "bg-slate-100 text-[#0F172A]" : clause.category === "Performance" ? "bg-slate-100 text-[#0F172A]" : clause.category === "Dispute" ? "bg-red-100 text-red-700" : "bg-slate-100 text-[#0F172A]"}`}>{clause.category}</span>
                      </div>
                      <div className="px-4 py-3 text-xs text-black/70 leading-relaxed">{clause.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Audit" && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-black/60 uppercase tracking-wide">Audit Trail</div>
              <div className="space-y-2">
                {[
                  { action: "Award created", user: award.owner, timestamp: award.createdAt, type: "info" },
                  { action: "Workflow advanced to " + award.workflowStage, user: award.owner, timestamp: award.updatedAt, type: "success" },
                  ...(award.approvedBy ? [{ action: `Approved by ${award.approvedBy}`, user: award.approvedBy, timestamp: award.approvedAt, type: "success" }] : []),
                ].map((entry, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 border border-black/8 rounded-xl">
                    <div className={`h-6 w-6 rounded-full grid place-items-center flex-shrink-0 ${entry.type === "success" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>
                      {entry.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-black">{entry.action}</div>
                      <div className="text-[10px] text-black/40 mt-0.5">{entry.user} · {entry.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
type Tab = "Awards" | "Lifecycle Tower" | "Reports";

export default function ContractAwardWorkbenchPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("Awards");
  const [awards, setAwards] = useState<ContractAward[]>(SEED_CONTRACT_AWARDS);
  const [search, setSearch] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<ContractAward | null>(null);
  const [showAI, setShowAI] = useState(false);

  const filtered = awards.filter(a =>
    a.contractTitle.toLowerCase().includes(search.toLowerCase()) ||
    a.awardReferenceNumber.toLowerCase().includes(search.toLowerCase()) ||
    a.winningSupplier.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (a: ContractAward) => {
    setAwards(prev => [a, ...prev]);
    pushSeniorAlert(`New contract award created: ${a.contractTitle}`, "success", { from: user?.name, fromRole: user?.role ?? "officer", category: "award" });
    setShowNew(false);
    toast(`Award ${a.awardReferenceNumber} created successfully`, "success");
  };

  const handleUpdate = (id: string, patch: Partial<ContractAward>) => {
    setAwards(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
    setSelected(prev => prev?.id === id ? { ...prev, ...patch } as ContractAward : prev);
  };

  const downloadReport = (type: string) => {
    const content = [
      `CONTRACT AWARD ${type.toUpperCase()} REPORT`,
      `Generated: ${new Date().toLocaleString()}`,
      `Generated By: ${user?.name ?? "System"} · ${user?.role ?? ""}`,
      "",
      `Total Awards: ${awards.length}`,
      `Signed: ${awards.filter(a => a.awardStatus === "Contract Signed").length}`,
      `Issued: ${awards.filter(a => a.awardStatus === "Award Issued").length}`,
      `Draft: ${awards.filter(a => a.awardStatus === "Draft").length}`,
      "",
      "AWARD REGISTER:",
      ...awards.map(a => `  ${a.awardReferenceNumber} | ${a.contractTitle} | ${a.winningSupplier} | ${a.currency} ${a.contractAmount} | ${a.awardStatus}`),
      "",
      "AI Powered Electronic Public Procurement and Oversight Intelligence System",
      "Government of Zimbabwe",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `award-${type.toLowerCase()}-report.txt`; a.click();
    URL.revokeObjectURL(url);
    pushNotification(`${type} Report downloaded`, "success");
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Contract Management"
        process="Contract Award Workbench"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Stage 11 — Contract Award Workbench</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
          <Badge tone="green">PPDPA Compliant</Badge>
        </div>
        <PageHeader
          title="Contract Award Workbench"
          description="Complete contract award management: award summary, document generation, contract drafting, digital signatures, version control, and approval workflow."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Awards" value={String(awards.length)} delta="This financial year" />
          <KpiCard label="Contracts Signed" value={String(awards.filter(a => a.awardStatus === "Contract Signed").length)} delta="Fully executed" />
          <KpiCard label="Awards Issued" value={String(awards.filter(a => a.awardStatus === "Award Issued").length)} delta="Standstill active" />
          <KpiCard label="Avg Compliance" value={`${Math.round(awards.reduce((s, a) => s + a.complianceScore, 0) / Math.max(awards.length, 1))}%`} delta="Compliance score" />
        </div>

        <div className="flex gap-1 mb-5 border-b border-black/8 overflow-x-auto scrollbar-none">
          {(["Awards", "Lifecycle Tower", "Reports"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors flex-shrink-0
                ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}</button>
          ))}
        </div>

        {tab === "Lifecycle Tower" && (
          <LifecycleTower
            title="Contract Award Lifecycle — 7 Stages"
            subtitle="From award preparation to signed contract. Click any stage for full toolset."
            stages={CONTRACT_AWARD_STAGES}
            context="Contract Award"
            badgeLabel="7 Stages · Award Process"
          />
        )}

        {tab === "Reports" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Award Summary", "Contract Register", "Compliance Report", "Award Notification Log", "Standstill Register", "Digital Signature Audit"].map(rpt => (
              <div key={rpt} className="border border-black/8 rounded-2xl p-4 hover:bg-[#EAF1F8] transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-black rounded-xl grid place-items-center"><FileText className="h-5 w-5 text-white" /></div>
                  <div>
                    <div className="text-sm font-semibold text-black">{rpt}</div>
                    <div className="text-[10px] text-black/40">Auto-generated · PDF/Excel/Print</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => downloadReport(rpt)} className="h-7 px-3 rounded-lg bg-black text-white text-[10px] flex items-center gap-1"><Download className="h-3 w-3" /> Download</button>
                  <button onClick={() => downloadReport(rpt)} className="h-7 px-3 rounded-lg border border-black/10 text-[10px] hover:bg-white flex items-center gap-1"><Printer className="h-3 w-3" /> Print</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Awards" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search awards…" className="w-full h-9 pl-9 pr-4 rounded-xl border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <button onClick={() => setShowAI(true)} className="h-9 px-3 rounded-xl border border-black/10 text-xs flex items-center gap-1.5 hover:bg-[#EAF1F8]"><Sparkles className="h-3.5 w-3.5" /> AI Assistant</button>
              <button onClick={() => setShowNew(true)} className="h-9 px-4 rounded-xl bg-black text-white text-xs font-medium flex items-center gap-1.5 hover:bg-gray-800"><Plus className="h-3.5 w-3.5" /> New Award</button>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-black/30 text-sm">No awards found matching your search.</div>
            )}

            <div className="space-y-3">
              {filtered.map(award => (
                <div key={award.id} className="border border-black/8 rounded-2xl hover:border-black/15 transition-all overflow-hidden">
                  <div className="px-4 sm:px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-3 flex-col sm:flex-row">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] font-mono text-black/40">{award.awardReferenceNumber}</span>
                          <Badge tone={STATUS_TONE[award.awardStatus] ?? "muted"}>{award.awardStatus}</Badge>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${award.complianceScore >= 90 ? "bg-slate-50 text-[#0F172A] border-slate-200" : award.complianceScore >= 70 ? "bg-slate-50 text-[#0F172A] border-slate-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                            Compliance {award.complianceScore}%
                          </span>
                        </div>
                        <div className="text-sm font-bold text-black">{award.contractTitle}</div>
                        <div className="text-xs text-black/50 mt-0.5">
                          {award.winningSupplier} · {award.contractNumber} · {award.ministry}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-base font-bold text-black">{award.currency} {award.contractAmount}</div>
                        <div className="text-[10px] text-black/40">{award.startDate} → {award.endDate}</div>
                      </div>
                    </div>
                    <div className="mb-3 overflow-x-auto scrollbar-none"><WorkflowBar stage={award.workflowStage} /></div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setSelected(award)} className="h-7 px-3 rounded-lg bg-black text-white text-[10px] font-medium hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3" /> View Details</button>
                        <button onClick={() => setSelected(award)} className="h-7 px-3 rounded-lg border border-black/10 text-[10px] hover:bg-[#EAF1F8] flex items-center gap-1"><FileText className="h-3 w-3" /> Documents ({award.documents.length})</button>
                        {award.awardStatus !== "Contract Signed" && (
                          <button onClick={() => { const stages = AWARD_WORKFLOW_STAGES; const idx = stages.indexOf(award.workflowStage); if (idx < stages.length - 1) { handleUpdate(award.id, { workflowStage: stages[idx + 1], workflowProgress: Math.round(((idx + 2) / stages.length) * 100) }); toast(`Workflow advanced`, "success"); } }}
                            className="h-7 px-3 rounded-lg border border-slate-200 bg-slate-50 text-[#0F172A] text-[10px] hover:bg-slate-100 flex items-center gap-1">
                            <ChevronRight className="h-3 w-3" /> Advance
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] text-black/30">v{award.version} · {award.documents.length} doc{award.documents.length !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showNew && <NewAwardModal onSave={handleAdd} onClose={() => setShowNew(false)} />}
      {selected && <AwardDetailPanel award={selected} onClose={() => setSelected(null)} onUpdate={(patch) => handleUpdate(selected.id, patch)} />}
      {showAI && <AIAwardAssistant award={selected} onClose={() => setShowAI(false)} />}
    </AppShell>
  );
}
