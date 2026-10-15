import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import {
  Plus, Search, Sparkles, FileText, Upload, Download, Save, Send,
  Edit2, X, Check, Trash2, AlertTriangle, ChevronRight, ClipboardList,
  DollarSign, Calendar, Users, Shield, Eye, RefreshCcw, Lock,
  FileSignature, CheckCircle2, Clock, Building2, Tag,
} from "lucide-react";
import { pushNotification, pushSeniorAlert } from "@/lib/local-store";
import { useAuth } from "@/lib/auth-context";
import { toast } from "@/lib/toast";
import LifecycleTower from "@/components/LifecycleTower";
import { TENDER_PREPARATION_STAGES } from "@/lib/lifecycle-stages";
import {
  type TenderPreparation, type BOQItem, type EvaluationCriterion,
  SEED_TENDER_PREPARATIONS, ZIMBABWE_MINISTRIES, PROCUREMENT_CATEGORIES,
  TENDER_WORKFLOW_STAGES,
} from "@/lib/procurement-workbench-data";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const STATUS_TONE: Record<string, "green" | "amber" | "blue" | "red" | "muted" | "violet"> = {
  Approved:          "green",
  Published:         "green",
  Draft:             "muted",
  "Internal Review": "amber",
  "Legal Review":    "amber",
  "Finance Review":  "amber",
  "Compliance Check":"violet",
  Approval:          "blue",
  Rejected:          "red",
};

function WorkflowProgress({ stage, progress }: { stage: string; progress: number }) {
  const steps = TENDER_WORKFLOW_STAGES;
  const idx = steps.indexOf(stage as typeof steps[number]);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium text-black/60">Workflow</span>
        <span className="font-bold">{progress}%</span>
      </div>
      <div className="flex gap-0.5">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= idx ? "bg-black" : "bg-black/10"}`} />
          </div>
        ))}
      </div>
      <div className="text-[10px] text-black/50 text-right">{stage}</div>
    </div>
  );
}

// ─── AI Tender Assistant ──────────────────────────────────────────────────────
function AITenderAssistant({ tender, onClose }: { tender: TenderPreparation | null; onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<{ from: "ai" | "user"; text: string }[]>([
    { from: "ai", text: "Hello! I'm your AI Tender Preparation Assistant. I can review your tender document, detect missing requirements, validate specifications, check compliance, identify risks, and recommend procurement best practices. How can I help?" },
  ]);

  const sendMsg = () => {
    if (!msg.trim()) return;
    const user = msg.trim(); setMsg("");
    setChat(c => [...c, { from: "user", text: user }]);
    setTimeout(() => {
      let reply = "I've analysed the tender document and found it substantially complete. Please ensure all mandatory documents are listed and the BOQ is finalised.";
      const q = user.toLowerCase();
      if (q.includes("compli")) reply = `Compliance score: ${tender?.complianceScore ?? 0}%. ${tender?.complianceScore && tender.complianceScore >= 80 ? "Document is substantially compliant." : "Key gaps detected: missing risk assessment section, incomplete BOQ."} Ensure evaluation criteria weights sum to 100%.`;
      else if (q.includes("spec") || q.includes("technical")) reply = "Technical specifications review: Ensure all specifications are technology-neutral (avoid brand-specific references), include minimum standards and testing criteria, reference applicable standards (ISO, SABS, etc.).";
      else if (q.includes("boq") || q.includes("bill")) reply = `BOQ Analysis: ${tender?.boqItems.length ?? 0} line items totalling ${tender?.boqTotalAmount ?? "N/A"}. Verify quantities against scope of work. Ensure all items have unit rates. Consider including provisional sums for contingencies.`;
      else if (q.includes("risk")) reply = "Risk Flags: (1) Supplier eligibility requirements may be too restrictive — review minimum thresholds; (2) Bid security amount should be 1-2% of estimated value; (3) Evaluation criteria should be published in advance; (4) Timeline for evaluation appears tight.";
      else if (q.includes("evaluat")) reply = "Evaluation criteria recommendation: Technical (40%), Price (35%), Delivery (15%), Financial Stability (10%). All criteria weights must be pre-announced in tender documents. Pass/fail requirements must be objective and measurable.";
      else if (q.includes("missing") || q.includes("incomplete")) reply = "Missing elements detected: (1) Dispute resolution clause not specified; (2) Force majeure provisions missing; (3) Variation order procedure not described; (4) Liquidated damages formula not defined; (5) Insurance requirements not specified.";
      setChat(c => [...c, { from: "ai", text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-black/10 shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 bg-black text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <div>
            <div className="text-xs font-bold">AI Tender Assistant</div>
            <div className="text-[10px] text-white/60">Review · Validate · Recommend</div>
          </div>
        </div>
        <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-white/10"><X className="h-4 w-4" /></button>
      </div>
      {tender?.aiRecommendations && tender.aiRecommendations.length > 0 && (
        <div className="px-4 py-2.5 border-b border-black/8 bg-slate-50">
          <div className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wide mb-1.5">AI Recommendations ({tender.aiRecommendations.length})</div>
          {tender.aiRecommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-1.5 mb-1.5">
              <Sparkles className="h-3 w-3 text-slate-600 mt-0.5 flex-shrink-0" />
              <span className="text-[11px] text-[#0F172A]">{r}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.map((m, i) => (
          <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${m.from === "user" ? "bg-black text-white rounded-br-sm" : "bg-black/5 text-black rounded-bl-sm"}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-black/10">
        <div className="flex gap-2">
          <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()}
            placeholder="Ask about specs, BOQ, compliance…" className="flex-1 h-8 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
          <button onClick={sendMsg} className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800">Ask</button>
        </div>
      </div>
    </div>
  );
}

// ─── New Tender Modal ─────────────────────────────────────────────────────────
function NewTenderModal({ onSave, onClose }: { onSave: (t: TenderPreparation) => void; onClose: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    tenderTitle: "", procurementMethod: "Open Tender" as TenderPreparation["procurementMethod"],
    procurementCategory: "Health & Pharmaceuticals", ministry: ZIMBABWE_MINISTRIES[0],
    department: "", budgetAllocation: "", currency: "USD",
    tenderDescription: "", scopeOfWork: "", closingDate: "", openingDate: "",
    eligibilityRequirements: "", tenderConditions: "",
  });
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!form.tenderTitle.trim()) { setError("Tender title is required."); return; }
    if (!form.closingDate) { setError("Closing date is required."); return; }
    const id = `tp-${Date.now()}`;
    const num = `ZW-PRA-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
    const now = new Date().toISOString().split("T")[0];
    const newTender: TenderPreparation = {
      id, tenderNumber: num, ...form,
      procuringEntity: form.ministry,
      requiredDocuments: ["Company Registration Certificate", "Tax Clearance Certificate", "Technical Proposal", "Financial Proposal", "Bid Security"],
      approvalStatus: "Draft", workflowProgress: 5,
      boqItems: [], boqTotalAmount: "0",
      evaluationCriteria: [
        { id: "ec-new-1", criterion: "Technical Compliance", weight: 40, description: "Quality, specifications, experience", passMark: 70 },
        { id: "ec-new-2", criterion: "Price", weight: 35, description: "Total bid price", passMark: 0 },
        { id: "ec-new-3", criterion: "Delivery Schedule", weight: 15, description: "Lead times and delivery plan", passMark: 0 },
        { id: "ec-new-4", criterion: "Financial Stability", weight: 10, description: "Turnover and references", passMark: 60 },
      ],
      procurementSchedule: [
        { milestone: "Advertisement Published", date: form.closingDate, responsible: "Communications" },
        { milestone: "Bid Closing", date: form.closingDate, responsible: "System" },
      ],
      attachments: [], complianceScore: 50,
      aiRecommendations: ["Ensure BOQ is complete before publishing", "Verify evaluation criteria weights sum to 100%", "Schedule pre-bid meeting for complex procurements"],
      owner: user?.name ?? "System", version: "v1.0",
      createdAt: now, updatedAt: now, technicalSpecifications: "", termsOfReference: "",
    };
    onSave(newTender);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8">
          <div className="text-sm font-bold">New Tender Preparation</div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EAF1F8]"><X className="h-4 w-4" /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1">Tender Title *</label>
              <input value={form.tenderTitle} onChange={e => setForm(f => ({ ...f, tenderTitle: e.target.value }))}
                placeholder="e.g. Supply of Medical Equipment — District Hospitals 2026/27"
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Ministry</label>
              <select value={form.ministry} onChange={e => setForm(f => ({ ...f, ministry: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10">
                {ZIMBABWE_MINISTRIES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Department</label>
              <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                placeholder="e.g. Pharmacy & Medicines Control"
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Procurement Method</label>
              <select value={form.procurementMethod} onChange={e => setForm(f => ({ ...f, procurementMethod: e.target.value as TenderPreparation["procurementMethod"] }))}
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10">
                {["Open Tender","Restricted Tender","Request for Quotation","Direct Procurement","Framework Agreement","Two-Stage Tender","Request for Proposals","Expression of Interest"].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <select value={form.procurementCategory} onChange={e => setForm(f => ({ ...f, procurementCategory: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10">
                {PROCUREMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Budget Allocation (USD)</label>
              <input value={form.budgetAllocation} onChange={e => setForm(f => ({ ...f, budgetAllocation: e.target.value }))}
                placeholder="e.g. 2,400,000"
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Closing Date *</label>
              <input type="date" value={form.closingDate} onChange={e => setForm(f => ({ ...f, closingDate: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Opening Date</label>
              <input type="date" value={form.openingDate} onChange={e => setForm(f => ({ ...f, openingDate: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1">Tender Description</label>
              <textarea value={form.tenderDescription} onChange={e => setForm(f => ({ ...f, tenderDescription: e.target.value }))}
                rows={3} placeholder="Brief description of what is being procured and its purpose…"
                className="w-full px-3 py-2 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1">Scope of Work</label>
              <textarea value={form.scopeOfWork} onChange={e => setForm(f => ({ ...f, scopeOfWork: e.target.value }))}
                rows={3} placeholder="Detailed scope of goods, works, or services required…"
                className="w-full px-3 py-2 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 resize-none" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-black/8">
          <button onClick={onClose} className="h-9 px-4 rounded-xl border border-black/10 text-xs hover:bg-[#EAF1F8]">Cancel</button>
          <button onClick={handleSave} className="h-9 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> Create Tender</button>
        </div>
      </div>
    </div>
  );
}

// ─── Tender Detail Panel ──────────────────────────────────────────────────────
type DetailTab = "Overview" | "BOQ" | "Evaluation" | "Schedule" | "Documents" | "Conditions";

function TenderDetailPanel({ tender, onClose, onAction }: {
  tender: TenderPreparation;
  onClose: () => void;
  onAction: (id: string, action: string) => void;
}) {
  const [tab, setTab] = useState<DetailTab>("Overview");
  const [boqItems, setBoqItems] = useState<BOQItem[]>(tender.boqItems);
  const [newBoq, setNewBoq] = useState({ description: "", unit: "Unit", quantity: 0, unitRate: "0", notes: "" });
  const detailTabs: DetailTab[] = ["Overview", "BOQ", "Evaluation", "Schedule", "Documents", "Conditions"];

  const addBoqItem = () => {
    if (!newBoq.description) return;
    const qty = Number(newBoq.quantity) || 0;
    const rate = parseFloat(newBoq.unitRate) || 0;
    const total = (qty * rate).toLocaleString();
    const item: BOQItem = {
      id: `boq-${Date.now()}`,
      itemNo: boqItems.length + 1,
      description: newBoq.description, unit: newBoq.unit,
      quantity: qty, unitRate: newBoq.unitRate, totalAmount: total, notes: newBoq.notes,
    };
    setBoqItems(prev => [...prev, item]);
    setNewBoq({ description: "", unit: "Unit", quantity: 0, unitRate: "0", notes: "" });
  };

  const boqTotal = boqItems.reduce((s, i) => s + parseFloat(i.totalAmount.replace(/,/g, "")) || 0, 0);

  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-start justify-end p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl h-[calc(100vh-2rem)] flex flex-col">
        <div className="flex items-start justify-between px-6 py-4 border-b border-black/8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge tone={STATUS_TONE[tender.approvalStatus] ?? "muted"}>{tender.approvalStatus}</Badge>
              <span className="text-[10px] text-black/40 font-mono">{tender.tenderNumber}</span>
            </div>
            <div className="text-sm font-bold leading-tight">{tender.tenderTitle}</div>
            <div className="text-xs text-black/50 mt-0.5">{tender.ministry} · {tender.department}</div>
          </div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EAF1F8] flex-shrink-0"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex gap-1 px-6 border-b border-black/8 overflow-x-auto scrollbar-none flex-shrink-0">
          {detailTabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors
                ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === "Overview" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Method", value: tender.procurementMethod },
                  { label: "Category", value: tender.procurementCategory },
                  { label: "Budget", value: `${tender.currency} ${tender.budgetAllocation}` },
                  { label: "Closing Date", value: tender.closingDate },
                  { label: "Opening Date", value: tender.openingDate },
                  { label: "Compliance", value: `${tender.complianceScore}%` },
                ].map(f => (
                  <div key={f.label} className="p-3 bg-[#F9F9F9] rounded-xl">
                    <div className="text-[10px] text-black/40 uppercase tracking-wide">{f.label}</div>
                    <div className="text-xs font-semibold text-black mt-0.5">{f.value || "—"}</div>
                  </div>
                ))}
              </div>
              <WorkflowProgress stage={tender.approvalStatus} progress={tender.workflowProgress} />
              <div>
                <div className="text-xs font-semibold mb-2">Description</div>
                <p className="text-xs text-black/70 leading-relaxed">{tender.tenderDescription || "No description provided."}</p>
              </div>
              <div>
                <div className="text-xs font-semibold mb-2">Scope of Work</div>
                <p className="text-xs text-black/70 leading-relaxed">{tender.scopeOfWork || "Not specified."}</p>
              </div>
              <div>
                <div className="text-xs font-semibold mb-2">Eligibility Requirements</div>
                <p className="text-xs text-black/70 leading-relaxed">{tender.eligibilityRequirements || "Not specified."}</p>
              </div>
              <div>
                <div className="text-xs font-semibold mb-2">Required Documents ({tender.requiredDocuments.length})</div>
                <div className="flex flex-wrap gap-1.5">
                  {tender.requiredDocuments.map((d, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-50 text-[#0F172A] rounded-lg text-[11px]">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "BOQ" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold">Bill of Quantities ({boqItems.length} items)</div>
                <div className="text-xs font-bold text-black">Total: USD {boqTotal.toLocaleString()}</div>
              </div>
              <div className="overflow-x-auto rounded-xl border border-black/8">
                <table className="w-full text-xs">
                  <thead className="bg-[#EAF1F8]">
                    <tr>{["#","Description","Unit","Qty","Unit Rate","Total","Notes"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-black/60 whitespace-nowrap">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {boqItems.map(item => (
                      <tr key={item.id} className="hover:bg-[#F9F9F9]">
                        <td className="px-3 py-2 text-black/40">{item.itemNo}</td>
                        <td className="px-3 py-2 font-medium max-w-xs">{item.description}</td>
                        <td className="px-3 py-2 text-black/60">{item.unit}</td>
                        <td className="px-3 py-2 text-right">{item.quantity.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">{item.unitRate}</td>
                        <td className="px-3 py-2 text-right font-semibold">{item.totalAmount}</td>
                        <td className="px-3 py-2 text-black/40 max-w-[120px] truncate">{item.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#EAF1F8]">
                    <tr>
                      <td colSpan={5} className="px-3 py-2 font-bold text-right">Grand Total</td>
                      <td className="px-3 py-2 font-bold text-right">USD {boqTotal.toLocaleString()}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="p-4 bg-[#F9F9F9] rounded-xl border border-black/8">
                <div className="text-xs font-semibold mb-3">Add BOQ Item</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                  <input value={newBoq.description} onChange={e => setNewBoq(n => ({ ...n, description: e.target.value }))}
                    placeholder="Description" className="sm:col-span-2 h-8 px-3 rounded-lg border border-black/10 text-xs focus:outline-none" />
                  <input value={newBoq.unit} onChange={e => setNewBoq(n => ({ ...n, unit: e.target.value }))}
                    placeholder="Unit" className="h-8 px-3 rounded-lg border border-black/10 text-xs focus:outline-none" />
                  <input type="number" value={newBoq.quantity} onChange={e => setNewBoq(n => ({ ...n, quantity: Number(e.target.value) }))}
                    placeholder="Qty" className="h-8 px-3 rounded-lg border border-black/10 text-xs focus:outline-none" />
                  <input value={newBoq.unitRate} onChange={e => setNewBoq(n => ({ ...n, unitRate: e.target.value }))}
                    placeholder="Unit Rate" className="h-8 px-3 rounded-lg border border-black/10 text-xs focus:outline-none" />
                  <input value={newBoq.notes} onChange={e => setNewBoq(n => ({ ...n, notes: e.target.value }))}
                    placeholder="Notes (optional)" className="sm:col-span-2 h-8 px-3 rounded-lg border border-black/10 text-xs focus:outline-none" />
                  <button onClick={addBoqItem} className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center gap-1">
                    <Plus className="h-3 w-3" /> Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "Evaluation" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold">Evaluation Criteria</div>
                <div className={`text-xs font-bold ${tender.evaluationCriteria.reduce((s, c) => s + c.weight, 0) === 100 ? "text-[#0F172A]" : "text-red-600"}`}>
                  Total: {tender.evaluationCriteria.reduce((s, c) => s + c.weight, 0)}% {tender.evaluationCriteria.reduce((s, c) => s + c.weight, 0) === 100 ? "✓" : "⚠ Must equal 100%"}
                </div>
              </div>
              <div className="space-y-3">
                {tender.evaluationCriteria.map(ec => (
                  <div key={ec.id} className="p-4 bg-[#F9F9F9] rounded-xl border border-black/8">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-xs font-semibold">{ec.criterion}</div>
                      <div className="flex items-center gap-2">
                        {ec.passMark !== undefined && ec.passMark > 0 && (
                          <span className="text-[10px] text-[#0F172A] bg-slate-50 px-2 py-0.5 rounded">Pass mark: {ec.passMark}%</span>
                        )}
                        <span className="text-sm font-bold text-black">{ec.weight}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/8 overflow-hidden">
                      <div className="h-full bg-black rounded-full" style={{ width: `${ec.weight}%` }} />
                    </div>
                    <div className="text-[11px] text-black/50 mt-1.5">{ec.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "Schedule" && (
            <div className="space-y-3">
              <div className="text-xs font-semibold mb-3">Procurement Schedule</div>
              <div className="relative">
                <div className="absolute left-[20px] top-0 bottom-0 w-px bg-black/10" />
                {tender.procurementSchedule.map((s, i) => (
                  <div key={i} className="relative flex gap-4 pb-4">
                    <div className="w-10 h-10 rounded-full bg-black/8 border-2 border-white flex items-center justify-center flex-shrink-0 z-10">
                      <span className="text-[10px] font-bold text-black/60">{i + 1}</span>
                    </div>
                    <div className="flex-1 pt-1.5">
                      <div className="text-xs font-semibold">{s.milestone}</div>
                      <div className="flex gap-3 mt-0.5">
                        <span className="text-[11px] text-black/50">{s.date}</span>
                        <span className="text-[11px] text-black/40">Responsible: {s.responsible}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "Documents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold">Attached Documents ({tender.attachments.length})</div>
                <button className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center gap-1">
                  <Upload className="h-3 w-3" /> Upload
                </button>
              </div>
              {tender.attachments.length === 0 ? (
                <div className="py-12 text-center text-xs text-black/30">No documents attached yet.</div>
              ) : (
                <div className="space-y-2">
                  {tender.attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between p-3 bg-[#F9F9F9] rounded-xl border border-black/8">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-[#0F172A]" />
                        </div>
                        <div>
                          <div className="text-xs font-medium">{att.name}</div>
                          <div className="text-[10px] text-black/40">{att.category} · {att.size} · {att.uploadedAt}</div>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EBEBEB]"><Eye className="h-3.5 w-3.5 text-black/50" /></button>
                        <button className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EBEBEB]"><Download className="h-3.5 w-3.5 text-black/50" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Conditions" && (
            <div className="space-y-4">
              <div className="text-xs font-semibold">Tender Conditions</div>
              <p className="text-xs text-black/70 leading-relaxed">{tender.tenderConditions || "No conditions specified."}</p>
              <div className="text-xs font-semibold">Technical Specifications</div>
              <p className="text-xs text-black/70 leading-relaxed">{tender.technicalSpecifications || "Not provided."}</p>
              <div className="text-xs font-semibold">Terms of Reference</div>
              <p className="text-xs text-black/70 leading-relaxed">{tender.termsOfReference || "Not provided."}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-black/8 flex-shrink-0">
          <div className="flex gap-2">
            <button onClick={() => { onAction(tender.id, "submit"); onClose(); }}
              className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center gap-1">
              <Send className="h-3 w-3" /> Submit for Review
            </button>
            <button onClick={() => { onAction(tender.id, "download"); }}
              className="h-8 px-3 border border-black/10 rounded-lg text-xs hover:bg-[#EAF1F8] flex items-center gap-1">
              <Download className="h-3 w-3" /> Download
            </button>
          </div>
          <button onClick={() => { onAction(tender.id, "approve"); onClose(); }}
            className="h-8 px-3 border border-slate-200 bg-slate-50 text-[#0F172A] rounded-lg text-xs hover:bg-slate-100 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Approve
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type PageTab = "Tender Preparation" | "Lifecycle Tower" | "Capabilities";

export default function TenderPreparationPage() {
  const { user } = useAuth();
  const [tenders, setTenders] = useState<TenderPreparation[]>(SEED_TENDER_PREPARATIONS);
  const [tab, setTab] = useState<PageTab>("Tender Preparation");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selected, setSelected] = useState<TenderPreparation | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiContext, setAiContext] = useState<TenderPreparation | null>(null);

  const filtered = tenders.filter(t => {
    const matchSearch = t.tenderTitle.toLowerCase().includes(search.toLowerCase()) ||
      t.tenderNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.ministry.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || t.approvalStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleAction = (id: string, action: string) => {
    const t = tenders.find(x => x.id === id);
    if (!t) return;
    if (action === "submit") {
      setTenders(prev => prev.map(x => x.id === id ? { ...x, approvalStatus: "Internal Review" as const, workflowProgress: 25 } : x));
      pushSeniorAlert(`Tender submitted for review: ${t.tenderTitle}`, "info", { from: user?.name, fromRole: user?.role ?? "officer", category: "action", ref: id });
      pushNotification(`Tender ${t.tenderNumber} submitted for review`, "info");
      toast(`${t.tenderTitle} submitted for internal review.`, "success");
    } else if (action === "approve") {
      setTenders(prev => prev.map(x => x.id === id ? { ...x, approvalStatus: "Approved" as const, workflowProgress: 100 } : x));
      pushSeniorAlert(`Tender approved: ${t.tenderTitle}`, "success", { from: user?.name, fromRole: user?.role ?? "officer", category: "action", ref: id });
      pushNotification(`Tender ${t.tenderNumber} approved`, "success");
      toast(`${t.tenderTitle} approved. Ready for advertisement.`, "success");
    } else if (action === "download") {
      const content = [`TENDER DOCUMENT\n`, `Tender No: ${t.tenderNumber}`, `Title: ${t.tenderTitle}`, `Ministry: ${t.ministry}`, `Method: ${t.procurementMethod}`, `Budget: ${t.currency} ${t.budgetAllocation}`, `Closing: ${t.closingDate}`, `Status: ${t.approvalStatus}`, `\nScope of Work:\n${t.scopeOfWork}`, `\nEligibility Requirements:\n${t.eligibilityRequirements}`, `\nGenerated: ${new Date().toLocaleString()}`].join("\n");
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${t.tenderNumber}-tender.txt`; a.click();
      URL.revokeObjectURL(url);
      pushNotification(`Tender ${t.tenderNumber} downloaded`, "success");
    }
  };

  const handleAddTender = (t: TenderPreparation) => {
    setTenders(prev => [t, ...prev]);
    pushNotification(`New tender preparation created: ${t.tenderTitle}`, "success");
    toast(`Tender ${t.tenderNumber} created successfully.`, "success");
    setShowNew(false);
  };

  const statusOptions = ["All", ...TENDER_WORKFLOW_STAGES];

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Tender Preparation"
        financialYear="FY2026"
        pageType="form"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Stage 4 — Tender Preparation</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Tender Preparation Workbench"
          description="Draft, review and approve complete tender documents including BOQ, technical specifications, evaluation criteria, and procurement schedules."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Active Tenders" value={String(tenders.length)} delta={`+${tenders.filter(t => t.approvalStatus === "Draft").length} drafts`} />
          <KpiCard label="Approved" value={String(tenders.filter(t => t.approvalStatus === "Approved").length)} delta="Ready to advertise" />
          <KpiCard label="Under Review" value={String(tenders.filter(t => ["Internal Review","Legal Review","Finance Review","Compliance Check","Approval"].includes(t.approvalStatus)).length)} delta="In review cycle" />
          <KpiCard label="Avg Compliance" value={`${Math.round(tenders.reduce((s,t) => s + t.complianceScore, 0) / (tenders.length || 1))}%`} delta="Document quality score" />
        </div>

        <div className="flex gap-1 mb-5 border-b border-black/8 overflow-x-auto scrollbar-none">
          {(["Tender Preparation", "Lifecycle Tower", "Capabilities"] as PageTab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors
                ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}
            </button>
          ))}
        </div>

        {tab === "Lifecycle Tower" && (
          <LifecycleTower
            title="Tender Preparation Lifecycle — 8 Stages"
            subtitle="From initiation through BOQ, evaluation criteria, conditions, schedule, and CPO approval. Click any stage for full toolset."
            stages={TENDER_PREPARATION_STAGES}
            context="Tender Preparation"
            badgeLabel="8 Stages · Stage 4 of Procurement Lifecycle"
          />
        )}

        {tab === "Capabilities" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Tender Document Builder", desc: "Complete tender document authoring with all mandatory sections: description, scope, ToR, specs, BOQ, conditions." },
              { title: "Bill of Quantities Editor", desc: "Editable BOQ table with auto-calculation of line totals, subtotals, and grand total. Import/export to Excel." },
              { title: "Evaluation Criteria Designer", desc: "Design scoring methodology with weighted criteria, pass marks, and scoring guidance. Auto-validates weights sum to 100%." },
              { title: "AI Tender Assistant", desc: "AI reviews tender document for missing elements, validates specifications, checks compliance, identifies risks, and recommends best practices." },
              { title: "Procurement Schedule", desc: "Timeline management for all procurement milestones from advertisement to award. Automated reminders and alerts." },
              { title: "Workflow Management", desc: "Multi-stage approval workflow: Draft → Internal Review → Legal → Finance → Compliance → Approval → Published." },
              { title: "Document Management", desc: "Secure upload, preview, versioning, and download of all tender supporting documents with audit trail." },
              { title: "Compliance Scoring", desc: "Real-time compliance score based on document completeness, regulatory requirements, and best practice standards." },
              { title: "Linked Procurement Chain", desc: "Tender preparation links to approved requisition and procurement strategy for complete audit trail from plan to tender." },
            ].map(c => (
              <div key={c.title} className="p-4 rounded-2xl border border-black/8 bg-white hover:border-black/20 transition-colors">
                <div className="text-xs font-bold mb-1.5">{c.title}</div>
                <div className="text-xs text-black/50 leading-relaxed">{c.desc}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "Tender Preparation" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tenders…"
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="h-9 px-3 rounded-xl border border-black/10 text-xs focus:outline-none">
                {statusOptions.map(s => <option key={s}>{s}</option>)}
              </select>
              <button onClick={() => setShowAI(true)} className="h-9 px-3 border border-slate-200 bg-slate-50 text-[#0F172A] rounded-xl text-xs font-medium hover:bg-slate-100 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI Assistant
              </button>
              <button onClick={() => setShowNew(true)} className="h-9 px-3 bg-black text-white rounded-xl text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> New Tender
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filtered.length === 0 && (
                <div className="py-16 text-center text-xs text-black/30">No tenders match your search.</div>
              )}
              {filtered.map(t => (
                <Card key={t.id}>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge tone={STATUS_TONE[t.approvalStatus] ?? "muted"}>{t.approvalStatus}</Badge>
                          <span className="text-[10px] font-mono text-black/40">{t.tenderNumber}</span>
                          <span className="text-[10px] text-black/30">v{t.version}</span>
                        </div>
                        <div className="text-sm font-bold text-black leading-tight">{t.tenderTitle}</div>
                        <div className="text-xs text-black/50 mt-0.5">{t.ministry} · {t.department}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm font-bold text-black">{t.currency} {t.budgetAllocation}</div>
                        <div className="text-[10px] text-black/40 mt-0.5">{t.procurementMethod}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 text-[11px]">
                      <div><span className="text-black/40">Category:</span> <span className="font-medium">{t.procurementCategory}</span></div>
                      <div><span className="text-black/40">Closing:</span> <span className="font-medium">{t.closingDate}</span></div>
                      <div><span className="text-black/40">BOQ Items:</span> <span className="font-medium">{t.boqItems.length}</span></div>
                      <div><span className="text-black/40">Compliance:</span> <span className={`font-bold ${t.complianceScore >= 80 ? "text-[#0F172A]" : t.complianceScore >= 60 ? "text-[#0F172A]" : "text-red-600"}`}>{t.complianceScore}%</span></div>
                    </div>

                    <WorkflowProgress stage={t.approvalStatus} progress={t.workflowProgress} />

                    {t.aiRecommendations.length > 0 && (
                      <div className="mt-3 flex items-start gap-1.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <Sparkles className="h-3 w-3 text-slate-600 mt-0.5 flex-shrink-0" />
                        <span className="text-[11px] text-[#0F172A]">{t.aiRecommendations[0]}</span>
                      </div>
                    )}

                    <div className="mt-3 flex gap-2 flex-wrap">
                      <button onClick={() => setSelected(t)}
                        className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Open Workbench
                      </button>
                      <button onClick={() => handleAction(t.id, "submit")}
                        className="h-8 px-3 border border-black/10 rounded-lg text-xs hover:bg-[#EAF1F8] flex items-center gap-1">
                        <Send className="h-3 w-3" /> Submit
                      </button>
                      <button onClick={() => { setAiContext(t); setShowAI(true); }}
                        className="h-8 px-3 border border-slate-200 bg-slate-50 text-[#0F172A] rounded-lg text-xs hover:bg-slate-100 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> AI Review
                      </button>
                      <button onClick={() => handleAction(t.id, "download")}
                        className="h-8 px-3 border border-black/10 rounded-lg text-xs hover:bg-[#EAF1F8] flex items-center gap-1">
                        <Download className="h-3 w-3" /> Download
                      </button>
                      <button onClick={() => handleAction(t.id, "approve")}
                        className="h-8 px-3 border border-slate-200 bg-slate-50 text-[#0F172A] rounded-lg text-xs hover:bg-slate-100 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Approve
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {selected && (
        <TenderDetailPanel tender={selected} onClose={() => setSelected(null)} onAction={handleAction} />
      )}
      {showNew && <NewTenderModal onSave={handleAddTender} onClose={() => setShowNew(false)} />}
      {showAI && <AITenderAssistant tender={aiContext} onClose={() => { setShowAI(false); setAiContext(null); }} />}
    </AppShell>
  );
}
