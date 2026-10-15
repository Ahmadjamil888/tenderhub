import { useState } from "react";
import { AppShell, PageHeader, Card, Badge , PageContextBar } from "@/components/AppShell";
import {
  ClipboardList, Plus, Search, Filter, ChevronRight, ChevronDown,
  Sparkles, FileText, CheckCircle2, Clock, AlertTriangle, XCircle,
  Upload, Download, Eye, Save, Send, RotateCcw, Printer,
  DollarSign, Calendar, Shield, BarChart3, MessageSquare,
  Building2, Users, Flag, Edit2, Trash2, Info, Check, X,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import {
  type ProcurementPlan, SEED_PLANS, PROCUREMENT_CATEGORIES,
  FUNDING_SOURCES, ZIMBABWE_MINISTRIES, WORKFLOW_STAGES_PLAN,
  type ProcurementMethod,
} from "@/lib/procurement-workbench-data";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_TONE: Record<string, "green" | "amber" | "blue" | "red" | "muted" | "violet"> = {
  Approved: "green", Draft: "muted", "Under Review": "amber", Submitted: "blue",
  Rejected: "red", Returned: "violet",
};

const PRIORITY_COLOR: Record<string, string> = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High: "bg-slate-100 text-[#0F172A] border-slate-200",
  Medium: "bg-slate-100 text-[#0F172A] border-slate-200",
  Low: "bg-slate-100 text-[#0F172A] border-slate-200",
};

const RISK_COLOR: Record<string, string> = {
  Critical: "text-red-600", High: "text-[#0F172A]",
  Medium: "text-[#0F172A]", Low: "text-[#0F172A]",
};

const WORKFLOW_STEPS = ["Draft", "Department Review", "Budget Review", "Approval", "Approved"];

// ─── Workflow Progress Bar ─────────────────────────────────────────────────────
function WorkflowProgress({ stage, progress }: { stage: string; progress: number }) {
  const idx = WORKFLOW_STEPS.indexOf(stage);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium text-black/70">Workflow Progress</span>
        <span className="font-bold text-black">{progress}%</span>
      </div>
      <div className="flex gap-1">
        {WORKFLOW_STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1.5 w-full rounded-full transition-all ${i <= idx ? "bg-black" : "bg-black/10"}`} />
            <span className={`text-[9px] text-center leading-tight ${i === idx ? "font-bold text-black" : "text-black/40"}`}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI Assistant Panel ───────────────────────────────────────────────────────
function AIPlanningAssistant({ plan, onClose }: { plan: ProcurementPlan | null; onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<{ from: "ai" | "user"; text: string }[]>([
    { from: "ai", text: "Hello! I'm your AI Planning Assistant. I can help you with procurement method selection, compliance checks, risk assessment, and budget validation. What would you like to know?" },
  ]);

  const sendMsg = () => {
    if (!msg.trim()) return;
    const user = msg.trim();
    setMsg("");
    setChat(c => [...c, { from: "user", text: user }]);
    setTimeout(() => {
      let reply = "I've reviewed your query. Based on procurement best practices and PPDPA regulations, I recommend reviewing the estimated budget against prior-year actuals and ensuring all mandatory fields are completed before submission.";
      if (user.toLowerCase().includes("method")) reply = "For this procurement value and category, Open Tender is the most appropriate method. It ensures maximum competition and compliance with PPDPA Section 28.";
      else if (user.toLowerCase().includes("risk")) reply = "I've identified 3 key risks: supply chain delays, single-source dependency, and currency volatility. I recommend adding mitigation strategies for each in the Risk Assessment section.";
      else if (user.toLowerCase().includes("budget")) reply = "The estimated budget appears consistent with market rates. However, I recommend including a 10% contingency buffer and confirming the ZINARA board approval for ZINARA-funded projects.";
      else if (user.toLowerCase().includes("compliance")) reply = `Current compliance score: ${plan?.complianceScore ?? 0}%. Missing items: Bill of Quantities, approval letter, and environmental impact note. Completing these will raise your score above 90%.`;
      setChat(c => [...c, { from: "ai", text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-black/10 shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 bg-black text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <div>
            <div className="text-xs font-bold">AI Planning Assistant</div>
            <div className="text-[10px] text-white/60">Procurement Intelligence</div>
          </div>
        </div>
        <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-white/10"><X className="h-4 w-4" /></button>
      </div>
      {plan && (
        <div className="px-4 py-2.5 bg-black/5 border-b border-black/8 space-y-1">
          <div className="text-[10px] font-semibold text-black/60 uppercase tracking-wide">Active Record</div>
          <div className="text-xs font-semibold text-black truncate">{plan.title}</div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-black/50">{plan.planNumber}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${plan.complianceScore >= 90 ? "bg-slate-100 text-[#0F172A] border-slate-200" : plan.complianceScore >= 70 ? "bg-slate-100 text-[#0F172A] border-slate-200" : "bg-red-100 text-red-700 border-red-200"}`}>
              Compliance {plan.complianceScore}%
            </span>
          </div>
        </div>
      )}
      {plan?.aiRecommendations && plan.aiRecommendations.length > 0 && (
        <div className="px-4 py-2.5 border-b border-black/8 bg-slate-50">
          <div className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wide mb-1.5">AI Recommendations</div>
          {plan.aiRecommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-1.5 mb-1">
              <Sparkles className="h-3 w-3 text-[#0F172A] mt-0.5 flex-shrink-0" />
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
            placeholder="Ask about compliance, methods, risks…" className="flex-1 h-8 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
          <button onClick={sendMsg} className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800">Ask</button>
        </div>
      </div>
    </div>
  );
}

// ─── Plan Form Modal ──────────────────────────────────────────────────────────
const METHODS: ProcurementMethod[] = [
  "Open Tender", "Restricted Tender", "Request for Quotation",
  "Direct Procurement", "Framework Agreement", "Two-Stage Tender",
  "Request for Proposals", "Expression of Interest",
];

const EMPTY_PLAN: Partial<ProcurementPlan> = {
  title: "", ministry: "", department: "", financialYear: "2026/2027",
  costCentre: "", fundingSource: "", procurementCategory: "",
  procurementMethod: "Open Tender", estimatedBudget: "", currency: "USD",
  priority: "Medium", planningStartDate: "", planningEndDate: "",
  expectedAwardDate: "", expectedDeliveryDate: "", riskLevel: "Low",
  riskSummary: "", objectives: "", justification: "", notes: "",
};

function PlanFormModal({ plan, onSave, onClose }: {
  plan: Partial<ProcurementPlan> | null;
  onSave: (p: ProcurementPlan) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<ProcurementPlan>>(plan ?? EMPTY_PLAN);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"basic" | "budget" | "schedule" | "risk" | "notes">("basic");

  const set = (k: keyof ProcurementPlan, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title?.trim()) e.title = "Title is required";
    if (!form.ministry?.trim()) e.ministry = "Ministry is required";
    if (!form.department?.trim()) e.department = "Department is required";
    if (!form.procurementCategory) e.procurementCategory = "Category is required";
    if (!form.estimatedBudget?.trim()) e.estimatedBudget = "Budget is required";
    if (!form.fundingSource) e.fundingSource = "Funding source is required";
    if (!form.planningStartDate) e.planningStartDate = "Start date is required";
    if (!form.expectedAwardDate) e.expectedAwardDate = "Award date is required";
    if (!form.objectives?.trim()) e.objectives = "Objectives are required";
    if (!form.justification?.trim()) e.justification = "Justification is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (submit = false) => {
    if (submit && !validate()) return;
    const now = new Date().toISOString().slice(0, 10);
    const saved: ProcurementPlan = {
      id: plan?.id ?? `plan-${Date.now()}`,
      planNumber: plan?.planNumber ?? `APP-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      title: form.title ?? "", ministry: form.ministry ?? "", department: form.department ?? "",
      financialYear: form.financialYear ?? "2026/2027", costCentre: form.costCentre ?? "",
      fundingSource: form.fundingSource ?? "", procurementCategory: form.procurementCategory ?? "",
      procurementMethod: form.procurementMethod ?? "Open Tender",
      estimatedBudget: form.estimatedBudget ?? "", currency: form.currency ?? "USD",
      priority: form.priority ?? "Medium",
      status: submit ? "Submitted" : "Draft",
      workflowStage: submit ? "Department Review" : "Draft",
      workflowProgress: submit ? 25 : 0,
      planningStartDate: form.planningStartDate ?? "", planningEndDate: form.planningEndDate ?? "",
      expectedAwardDate: form.expectedAwardDate ?? "", expectedDeliveryDate: form.expectedDeliveryDate ?? "",
      riskLevel: form.riskLevel ?? "Low", riskSummary: form.riskSummary ?? "",
      objectives: form.objectives ?? "", justification: form.justification ?? "",
      notes: form.notes ?? "", attachments: plan?.attachments ?? [],
      owner: "Current User", assignedUser: "Current User",
      version: plan ? `v${(parseFloat(plan.version?.slice(1) ?? "1") + 0.1).toFixed(1)}` : "v1.0",
      createdAt: plan?.createdAt ?? now, updatedAt: now,
      complianceScore: 75, aiRecommendations: [],
    };
    onSave(saved);
    pushNotification(submit ? `Plan submitted: ${saved.title}` : `Plan saved: ${saved.title}`, submit ? "success" : "info");
  };

  const TABS = [
    { id: "basic", label: "Basic Info" }, { id: "budget", label: "Budget & Method" },
    { id: "schedule", label: "Schedule" }, { id: "risk", label: "Risk Assessment" },
    { id: "notes", label: "Notes & Docs" },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-black text-white">
          <div>
            <div className="text-sm font-bold">{plan?.id ? "Edit Procurement Plan" : "New Procurement Plan"}</div>
            <div className="text-xs text-white/60">{plan?.planNumber ?? "Auto-assigned on save"}</div>
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex gap-0 border-b border-black/10 px-6 pt-3 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`px-4 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === t.id ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {activeTab === "basic" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-black/70 mb-1 block">Plan Title *</label>
                  <input value={form.title ?? ""} onChange={e => set("title", e.target.value)}
                    className={`w-full h-9 px-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-black/10 ${errors.title ? "border-red-400" : "border-black/10"}`} />
                  {errors.title && <p className="text-[10px] text-red-500 mt-0.5">{errors.title}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-black/70 mb-1 block">Ministry *</label>
                  <select value={form.ministry ?? ""} onChange={e => set("ministry", e.target.value)}
                    className={`w-full h-9 px-3 rounded-lg border text-sm focus:outline-none ${errors.ministry ? "border-red-400" : "border-black/10"}`}>
                    <option value="">Select ministry…</option>
                    {ZIMBABWE_MINISTRIES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  {errors.ministry && <p className="text-[10px] text-red-500 mt-0.5">{errors.ministry}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-black/70 mb-1 block">Department *</label>
                  <input value={form.department ?? ""} onChange={e => set("department", e.target.value)}
                    className={`w-full h-9 px-3 rounded-lg border text-sm focus:outline-none ${errors.department ? "border-red-400" : "border-black/10"}`} />
                  {errors.department && <p className="text-[10px] text-red-500 mt-0.5">{errors.department}</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-black/70 mb-1 block">Financial Year</label>
                  <select value={form.financialYear ?? ""} onChange={e => set("financialYear", e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none">
                    {["2025/2026", "2026/2027", "2027/2028"].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-black/70 mb-1 block">Priority</label>
                  <select value={form.priority ?? "Medium"} onChange={e => set("priority", e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none">
                    {["Critical", "High", "Medium", "Low"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-black/70 mb-1 block">Cost Centre</label>
                  <input value={form.costCentre ?? ""} onChange={e => set("costCentre", e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-black/70 mb-1 block">Procurement Objectives *</label>
                  <textarea value={form.objectives ?? ""} onChange={e => set("objectives", e.target.value)} rows={3}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none resize-none ${errors.objectives ? "border-red-400" : "border-black/10"}`} />
                  {errors.objectives && <p className="text-[10px] text-red-500 mt-0.5">{errors.objectives}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-black/70 mb-1 block">Justification *</label>
                  <textarea value={form.justification ?? ""} onChange={e => set("justification", e.target.value)} rows={3}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none resize-none ${errors.justification ? "border-red-400" : "border-black/10"}`} />
                  {errors.justification && <p className="text-[10px] text-red-500 mt-0.5">{errors.justification}</p>}
                </div>
              </div>
            </>
          )}
          {activeTab === "budget" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Procurement Category *</label>
                <select value={form.procurementCategory ?? ""} onChange={e => set("procurementCategory", e.target.value)}
                  className={`w-full h-9 px-3 rounded-lg border text-sm focus:outline-none ${errors.procurementCategory ? "border-red-400" : "border-black/10"}`}>
                  <option value="">Select category…</option>
                  {PROCUREMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.procurementCategory && <p className="text-[10px] text-red-500 mt-0.5">{errors.procurementCategory}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Procurement Method</label>
                <select value={form.procurementMethod ?? ""} onChange={e => set("procurementMethod", e.target.value as ProcurementMethod)}
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none">
                  {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Estimated Budget *</label>
                <input value={form.estimatedBudget ?? ""} onChange={e => set("estimatedBudget", e.target.value)}
                  placeholder="e.g. 1,200,000" className={`w-full h-9 px-3 rounded-lg border text-sm focus:outline-none ${errors.estimatedBudget ? "border-red-400" : "border-black/10"}`} />
                {errors.estimatedBudget && <p className="text-[10px] text-red-500 mt-0.5">{errors.estimatedBudget}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Currency</label>
                <select value={form.currency ?? "USD"} onChange={e => set("currency", e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none">
                  {["USD", "ZWG", "EUR", "GBP"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-black/70 mb-1 block">Funding Source *</label>
                <select value={form.fundingSource ?? ""} onChange={e => set("fundingSource", e.target.value)}
                  className={`w-full h-9 px-3 rounded-lg border text-sm focus:outline-none ${errors.fundingSource ? "border-red-400" : "border-black/10"}`}>
                  <option value="">Select funding source…</option>
                  {FUNDING_SOURCES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                {errors.fundingSource && <p className="text-[10px] text-red-500 mt-0.5">{errors.fundingSource}</p>}
              </div>
            </div>
          )}
          {activeTab === "schedule" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([["planningStartDate", "Planning Start Date *"], ["planningEndDate", "Planning End Date"], ["expectedAwardDate", "Expected Award Date *"], ["expectedDeliveryDate", "Expected Delivery Date"]] as [keyof ProcurementPlan, string][]).map(([k, lbl]) => (
                <div key={k}>
                  <label className="text-xs font-semibold text-black/70 mb-1 block">{lbl}</label>
                  <input type="date" value={(form[k] as string) ?? ""} onChange={e => set(k, e.target.value)}
                    className={`w-full h-9 px-3 rounded-lg border text-sm focus:outline-none ${errors[k] ? "border-red-400" : "border-black/10"}`} />
                  {errors[k] && <p className="text-[10px] text-red-500 mt-0.5">{errors[k]}</p>}
                </div>
              ))}
            </div>
          )}
          {activeTab === "risk" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Overall Risk Level</label>
                <div className="flex gap-2 flex-wrap">
                  {(["Low", "Medium", "High", "Critical"] as const).map(r => (
                    <button key={r} onClick={() => set("riskLevel", r)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.riskLevel === r ? "bg-black text-white border-black" : "bg-white text-black/60 border-black/10 hover:bg-black/5"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Risk Summary</label>
                <textarea value={form.riskSummary ?? ""} onChange={e => set("riskSummary", e.target.value)} rows={4}
                  placeholder="Describe key risks and initial mitigation strategies…"
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none resize-none" />
              </div>
            </div>
          )}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Planning Notes</label>
                <textarea value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} rows={5}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none resize-none" />
              </div>
              <div className="border-2 border-dashed border-black/10 rounded-xl p-6 text-center">
                <Upload className="h-8 w-8 text-black/20 mx-auto mb-2" />
                <div className="text-xs text-black/50 font-medium">Drag & drop documents or click to upload</div>
                <div className="text-[10px] text-black/30 mt-1">PDF, DOCX, XLSX — max 10MB per file</div>
                <button className="mt-3 h-7 px-4 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800">Browse Files</button>
              </div>
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-black/10 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            <button onClick={onClose} className="h-8 px-4 rounded-lg border border-black/10 text-xs text-black/60 hover:bg-black/5">Cancel</button>
            <button onClick={() => handleSave(false)} className="h-8 px-4 rounded-lg border border-black/10 text-xs font-medium flex items-center gap-1.5 hover:bg-black/5">
              <Save className="h-3.5 w-3.5" /> Save Draft
            </button>
          </div>
          <button onClick={() => handleSave(true)} className="h-8 px-5 rounded-lg bg-black text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-800">
            <Send className="h-3.5 w-3.5" /> Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Plan Detail Panel ────────────────────────────────────────────────────────
function PlanDetailPanel({ plan, onAction, onClose }: {
  plan: ProcurementPlan;
  onAction: (action: "approve" | "reject" | "return" | "edit") => void;
  onClose: () => void;
}) {
  const [activePanel, setActivePanel] = useState<"details" | "audit" | "compliance" | "docs" | "comms">("details");

  const auditLog = [
    { user: "A. Mpofu", action: "Submitted for review", date: plan.updatedAt, ip: "192.168.1.42" },
    { user: plan.owner, action: "Created plan", date: plan.createdAt, ip: "192.168.1.18" },
  ];

  const complianceChecks = [
    { item: "Title and description complete", pass: !!plan.title && !!plan.objectives },
    { item: "Ministry and Department assigned", pass: !!plan.ministry && !!plan.department },
    { item: "Financial year specified", pass: !!plan.financialYear },
    { item: "Budget amount entered", pass: !!plan.estimatedBudget },
    { item: "Funding source identified", pass: !!plan.fundingSource },
    { item: "Procurement method selected", pass: !!plan.procurementMethod },
    { item: "Planning timeline set", pass: !!plan.planningStartDate && !!plan.expectedAwardDate },
    { item: "Justification provided", pass: !!plan.justification },
    { item: "Risk assessment completed", pass: !!plan.riskSummary },
    { item: "Supporting documents attached", pass: plan.attachments.length > 0 },
  ];
  const passCount = complianceChecks.filter(c => c.pass).length;

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] max-w-full bg-white border-l border-black/10 shadow-2xl z-40 flex flex-col">
      <div className="px-5 py-3.5 border-b border-black/10 bg-black text-white flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{plan.planNumber}</div>
          <div className="text-sm font-bold leading-tight mt-0.5 truncate">{plan.title}</div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${PRIORITY_COLOR[plan.priority]}`}>{plan.priority}</span>
            <Badge tone={STATUS_TONE[plan.status] ?? "muted"}>{plan.status}</Badge>
            <span className="text-[10px] text-white/50">{plan.version}</span>
          </div>
        </div>
        <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10 flex-shrink-0"><X className="h-4 w-4" /></button>
      </div>

      <div className="px-5 py-3 border-b border-black/10 bg-black/5">
        <WorkflowProgress stage={plan.workflowStage} progress={plan.workflowProgress} />
      </div>

      <div className="flex gap-0 border-b border-black/10 px-5 overflow-x-auto">
        {(["details", "compliance", "docs", "audit", "comms"] as const).map(t => (
          <button key={t} onClick={() => setActivePanel(t)}
            className={`px-3 py-2 text-[11px] font-semibold whitespace-nowrap border-b-2 capitalize transition-colors ${activePanel === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>
            {t === "comms" ? "Comments" : t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 text-xs space-y-3">
        {activePanel === "details" && (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                ["Ministry", plan.ministry], ["Department", plan.department],
                ["Financial Year", plan.financialYear], ["Cost Centre", plan.costCentre],
                ["Procurement Method", plan.procurementMethod], ["Category", plan.procurementCategory],
                ["Estimated Budget", `${plan.currency} ${plan.estimatedBudget}`], ["Funding Source", plan.fundingSource],
                ["Planning Start", plan.planningStartDate], ["Expected Award", plan.expectedAwardDate],
                ["Risk Level", plan.riskLevel], ["Owner", plan.owner],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-[10px] text-black/40 font-medium">{k}</div>
                  <div className="font-semibold text-black">{v || "—"}</div>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <div className="text-[10px] text-black/40 font-medium mb-0.5">Objectives</div>
              <div className="text-xs text-black/70">{plan.objectives || "—"}</div>
            </div>
            <div>
              <div className="text-[10px] text-black/40 font-medium mb-0.5">Justification</div>
              <div className="text-xs text-black/70">{plan.justification || "—"}</div>
            </div>
            {plan.riskSummary && (
              <div>
                <div className="text-[10px] text-black/40 font-medium mb-0.5">Risk Summary</div>
                <div className={`text-xs font-medium ${RISK_COLOR[plan.riskLevel]}`}>{plan.riskSummary}</div>
              </div>
            )}
          </>
        )}
        {activePanel === "compliance" && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-black">Compliance Score</span>
              <span className={`text-sm font-bold ${plan.complianceScore >= 90 ? "text-[#0F172A]" : plan.complianceScore >= 70 ? "text-[#0F172A]" : "text-red-600"}`}>{plan.complianceScore}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/10 mb-4">
              <div className={`h-full rounded-full transition-all ${plan.complianceScore >= 90 ? "bg-[#0F172A]" : plan.complianceScore >= 70 ? "bg-[#0F172A]" : "bg-red-500"}`} style={{ width: `${plan.complianceScore}%` }} />
            </div>
            <div className="space-y-1.5">
              {complianceChecks.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 ${c.pass ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-500"}`}>
                    {c.pass ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                  </div>
                  <span className={c.pass ? "text-black/70" : "text-red-600 font-medium"}>{c.item}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 p-2.5 bg-black/5 rounded-lg text-[11px] text-black/60">
              {passCount} of {complianceChecks.length} checks passed. {complianceChecks.length - passCount > 0 && `Complete ${complianceChecks.length - passCount} remaining item(s) before submission.`}
            </div>
          </>
        )}
        {activePanel === "docs" && (
          <div className="space-y-2">
            {plan.attachments.length === 0 ? (
              <div className="text-center py-8 text-black/30">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">No documents attached</p>
              </div>
            ) : (
              plan.attachments.map((doc, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 border border-black/8 rounded-lg hover:bg-black/3">
                  <FileText className="h-4 w-4 text-slate-600 flex-shrink-0" />
                  <span className="flex-1 text-xs truncate">{doc}</span>
                  <button className="h-6 w-6 grid place-items-center rounded hover:bg-black/5 text-black/40"><Download className="h-3.5 w-3.5" /></button>
                  <button className="h-6 w-6 grid place-items-center rounded hover:bg-black/5 text-black/40"><Eye className="h-3.5 w-3.5" /></button>
                </div>
              ))
            )}
            <div className="border-2 border-dashed border-black/10 rounded-xl p-4 text-center mt-2">
              <button className="flex items-center gap-1.5 text-xs font-medium text-black/60 hover:text-black mx-auto">
                <Upload className="h-3.5 w-3.5" /> Upload Document
              </button>
            </div>
          </div>
        )}
        {activePanel === "audit" && (
          <div className="space-y-2">
            {auditLog.map((a, i) => (
              <div key={i} className="p-2.5 border border-black/8 rounded-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-black">{a.user}</div>
                  <div className="text-[10px] text-black/40">{a.date}</div>
                </div>
                <div className="text-black/60 mt-0.5">{a.action}</div>
                <div className="text-[10px] text-black/30 mt-0.5">IP: {a.ip}</div>
              </div>
            ))}
          </div>
        )}
        {activePanel === "comms" && (
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-[10px] font-bold text-[#0F172A] mb-1">Budget Review Note</div>
              <div className="text-xs text-[#0F172A]">Budget allocation confirmed against Vote 8. Please ensure BOQ is attached before progressing to final approval.</div>
              <div className="text-[10px] text-slate-600 mt-1">Finance Office · 2 days ago</div>
            </div>
            <div className="border-2 border-dashed border-black/10 rounded-xl p-4">
              <textarea rows={3} placeholder="Add a comment…" className="w-full text-xs focus:outline-none resize-none" />
              <div className="flex justify-end mt-2">
                <button className="h-7 px-3 bg-black text-white rounded-lg text-xs font-medium">Post Comment</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-3.5 border-t border-black/10 flex gap-2 flex-wrap">
        <button onClick={() => onAction("edit")} className="flex-1 h-8 rounded-lg border border-black/10 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-black/5">
          <Edit2 className="h-3.5 w-3.5" /> Edit
        </button>
        {plan.status !== "Approved" && plan.status !== "Rejected" && (
          <>
            <button onClick={() => onAction("approve")} className="flex-1 h-8 rounded-lg bg-[#0F172A] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#0F172A]">
              <Check className="h-3.5 w-3.5" /> Approve
            </button>
            <button onClick={() => onAction("return")} className="flex-1 h-8 rounded-lg bg-[#0F172A] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-[#0F172A]">
              <RotateCcw className="h-3.5 w-3.5" /> Return
            </button>
            <button onClick={() => onAction("reject")} className="flex-1 h-8 rounded-lg bg-red-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-red-600">
              <X className="h-3.5 w-3.5" /> Reject
            </button>
          </>
        )}
        <button className="h-8 w-8 flex-shrink-0 rounded-lg border border-black/10 grid place-items-center hover:bg-black/5 text-black/50">
          <Printer className="h-3.5 w-3.5" />
        </button>
        <button className="h-8 w-8 flex-shrink-0 rounded-lg border border-black/10 grid place-items-center hover:bg-black/5 text-black/50">
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProcurementPlanningPage() {
  const [plans, setPlans] = useState<ProcurementPlan[]>(SEED_PLANS);
  const [selected, setSelected] = useState<ProcurementPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editPlan, setEditPlan] = useState<ProcurementPlan | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeView, setActiveView] = useState<"list" | "dashboard">("list");

  const filtered = plans.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.planNumber.toLowerCase().includes(search.toLowerCase()) || p.ministry.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const kpis = [
    { label: "Total Plans", value: String(plans.length), delta: `${plans.filter(p => p.financialYear === "2026/2027").length} in FY2026/27`, color: "blue" as const },
    { label: "Approved Plans", value: String(plans.filter(p => p.status === "Approved").length), delta: "Ready to tender", color: "green" as const },
    { label: "Under Review", value: String(plans.filter(p => p.status === "Under Review" || p.status === "Submitted").length), delta: "Awaiting action", color: "amber" as const },
    { label: "Draft Plans", value: String(plans.filter(p => p.status === "Draft").length), delta: "Incomplete", color: "muted" as const },
    { label: "Total Budget (USD)", value: `$${(plans.reduce((s, p) => s + parseFloat(p.estimatedBudget.replace(/,/g, "") || "0"), 0) / 1_000_000).toFixed(1)}M`, delta: "FY2026/27 APP", color: "violet" as const },
    { label: "Avg Compliance", value: `${Math.round(plans.reduce((s, p) => s + p.complianceScore, 0) / plans.length)}%`, delta: "Across all plans", color: "cyan" as const },
  ];

  const handleSavePlan = (p: ProcurementPlan) => {
    setPlans(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      return idx >= 0 ? prev.map(x => x.id === p.id ? p : x) : [...prev, p];
    });
    setShowForm(false);
    setEditPlan(null);
    setSelected(p);
  };

  const handleAction = (action: "approve" | "reject" | "return" | "edit") => {
    if (!selected) return;
    if (action === "edit") { setEditPlan(selected); setShowForm(true); return; }
    let updates: Partial<ProcurementPlan>;
    if (action === "approve") {
      updates = { status: "Approved", workflowStage: "Approved", workflowProgress: 100 };
    } else if (action === "reject") {
      updates = { status: "Rejected", workflowProgress: selected.workflowProgress };
    } else {
      updates = { status: "Returned", workflowStage: "Draft", workflowProgress: 0 };
    }
    const updated = { ...selected, ...updates, updatedAt: new Date().toISOString().slice(0, 10) } as ProcurementPlan;
    setPlans(prev => prev.map(p => p.id === selected.id ? updated : p));
    setSelected(updated);
    pushNotification(`Plan ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "returned"}: ${selected.title}`, action === "approve" ? "success" : action === "reject" ? "error" : "warning");
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Procurement Planning"
        financialYear="FY2026"
        pageType="form"
      />
      <div className="p-4 sm:p-6 max-w-[1800px] mx-auto">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge tone="blue">Stage 1</Badge>
              <Badge tone="muted">Procurement Planning</Badge>
              <Badge tone="green">FY 2026/27</Badge>
            </div>
            <h1 className="text-2xl font-bold text-black tracking-tight">Procurement Planning Workbench</h1>
            <p className="text-sm text-black/50 mt-1">Annual procurement plans — creation, budget linkage, risk assessment, and approval workflows.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowAI(v => !v)} className={`h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${showAI ? "bg-[#0F172A] text-white border-slate-200" : "border-black/10 text-black/60 hover:bg-black/5"}`}>
              <Sparkles className="h-3.5 w-3.5" /> AI Assistant
            </button>
            <button onClick={() => { setActiveView(v => v === "list" ? "dashboard" : "list"); }} className="h-9 px-3 rounded-xl border border-black/10 text-xs font-medium text-black/60 hover:bg-black/5 flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> {activeView === "list" ? "Dashboard" : "List View"}
            </button>
            <button onClick={() => { setEditPlan(null); setShowForm(true); }} className="h-9 px-4 rounded-xl bg-black text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-800">
              <Plus className="h-3.5 w-3.5" /> New Plan
            </button>
          </div>
        </div>

        {/* ── KPI Row ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          {kpis.map(k => (
            <div key={k.label} className="bg-white border border-black/8 rounded-2xl p-3.5 hover:shadow-md transition-all">
              <div className="text-[10px] text-black/40 font-semibold uppercase tracking-wide">{k.label}</div>
              <div className="text-xl font-bold text-black mt-1">{k.value}</div>
              <div className="text-[10px] text-black/50 mt-0.5">{k.delta}</div>
            </div>
          ))}
        </div>

        {activeView === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <Card className="p-4">
              <div className="text-xs font-bold text-black mb-3">Workflow Status</div>
              <div className="space-y-2">
                {WORKFLOW_STAGES_PLAN.map(stage => {
                  const count = plans.filter(p => p.workflowStage === stage).length;
                  return (
                    <div key={stage} className="flex items-center justify-between">
                      <span className="text-xs text-black/60">{stage}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-black/8">
                          <div className="h-full rounded-full bg-black" style={{ width: `${plans.length > 0 ? (count / plans.length) * 100 : 0}%` }} />
                        </div>
                        <span className="text-xs font-bold text-black w-4 text-right">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-xs font-bold text-black mb-3">Risk Distribution</div>
              <div className="space-y-2">
                {(["Critical", "High", "Medium", "Low"] as const).map(r => {
                  const count = plans.filter(p => p.riskLevel === r).length;
                  return (
                    <div key={r} className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${RISK_COLOR[r]}`}>{r}</span>
                      <span className="text-xs font-bold text-black">{count} plans</span>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-xs font-bold text-black mb-3">Budget by Category</div>
              <div className="space-y-2">
                {PROCUREMENT_CATEGORIES.slice(0, 5).map(cat => {
                  const total = plans.filter(p => p.procurementCategory === cat).reduce((s, p) => s + parseFloat(p.estimatedBudget.replace(/,/g, "") || "0"), 0);
                  if (total === 0) return null;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-[10px] mb-0.5">
                        <span className="text-black/60 truncate mr-2">{cat}</span>
                        <span className="font-bold text-black whitespace-nowrap">USD {(total / 1_000_000).toFixed(1)}M</span>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </Card>
          </div>
        )}

        {/* ── Search & Filter Bar ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search plans…"
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-black/10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {["All", "Draft", "Submitted", "Under Review", "Approved", "Rejected", "Returned"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`h-9 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${filterStatus === s ? "bg-black text-white" : "bg-white border border-black/10 text-black/60 hover:bg-black/5"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── Plans Table ─────────────────────────────────────────────────── */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/3 text-[11px] text-black/50 border-b border-black/8">
                <tr>
                  {["Plan Number", "Title", "Ministry / Department", "Method", "Budget", "Priority", "Workflow Stage", "Compliance", "Status", ""].map(h => (
                    <th key={h} className="text-left font-semibold px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="text-center py-12 text-black/30 text-xs">No plans found. Create a new plan to get started.</td></tr>
                )}
                {filtered.map(plan => (
                  <tr key={plan.id} onClick={() => setSelected(plan)} className="hover:bg-black/3 cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-black/60 whitespace-nowrap">{plan.planNumber}</td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <div className="font-semibold text-black text-xs truncate">{plan.title}</div>
                      <div className="text-[10px] text-black/40 mt-0.5">{plan.procurementCategory}</div>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <div className="text-xs text-black truncate">{plan.ministry}</div>
                      <div className="text-[10px] text-black/40 truncate">{plan.department}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-black/70 whitespace-nowrap">{plan.procurementMethod}</td>
                    <td className="px-4 py-3 font-semibold text-black whitespace-nowrap text-xs">{plan.currency} {plan.estimatedBudget}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLOR[plan.priority]}`}>{plan.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-black/70 whitespace-nowrap">{plan.workflowStage}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1.5 rounded-full bg-black/8">
                          <div className={`h-full rounded-full ${plan.complianceScore >= 90 ? "bg-[#0F172A]" : plan.complianceScore >= 70 ? "bg-[#0F172A]" : "bg-red-500"}`} style={{ width: `${plan.complianceScore}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-black/60">{plan.complianceScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge tone={STATUS_TONE[plan.status] ?? "muted"}>{plan.status}</Badge></td>
                    <td className="px-4 py-3">
                      <button onClick={e => { e.stopPropagation(); setSelected(plan); }} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-black/5 text-black/40">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* AI Panel Note */}
        {!showAI && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-[#0F172A] flex-shrink-0" />
            <div className="text-xs text-[#0F172A] flex-1">AI Planning Assistant is available to help with compliance checks, method selection, and risk assessment.</div>
            <button onClick={() => setShowAI(true)} className="h-7 px-3 rounded-lg bg-[#0F172A] text-white text-xs font-medium hover:bg-[#0F172A]">Open AI</button>
          </div>
        )}
      </div>

      {/* Panels & Modals */}
      {selected && !showForm && (
        <PlanDetailPanel plan={selected} onAction={handleAction} onClose={() => setSelected(null)} />
      )}
      {showForm && (
        <PlanFormModal plan={editPlan} onSave={handleSavePlan} onClose={() => { setShowForm(false); setEditPlan(null); }} />
      )}
      {showAI && (
        <AIPlanningAssistant plan={selected} onClose={() => setShowAI(false)} />
      )}
    </AppShell>
  );
}
