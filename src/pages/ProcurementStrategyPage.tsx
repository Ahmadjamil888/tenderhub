import { useState } from "react";
import { AppShell, Card, Badge , PageContextBar } from "@/components/AppShell";
import {
  Plus, Search, ChevronRight, Sparkles, FileText, Upload, Download,
  Save, Send, RotateCcw, Edit2, X, Check, Trash2, Shield, BarChart3,
  TrendingUp, AlertTriangle, Users, Target, ClipboardList,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import {
  type ProcurementStrategy, type StrategyRisk, type SupplierAnalysis,
  SEED_STRATEGIES, ZIMBABWE_MINISTRIES, type ProcurementMethod,
} from "@/lib/procurement-workbench-data";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_TONE: Record<string, "green" | "amber" | "blue" | "red" | "muted" | "violet"> = {
  Approved: "green", Draft: "muted", "Under Review": "amber",
  Submitted: "blue", Rejected: "red", Returned: "violet",
};
const PRIORITY_COLOR: Record<string, string> = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High: "bg-slate-100 text-[#0F172A] border-slate-200",
  Medium: "bg-slate-100 text-[#0F172A] border-slate-200",
  Low: "bg-slate-100 text-[#0F172A] border-slate-200",
};
const WORKFLOW_STEPS = ["Draft", "Strategy Review", "Compliance Check", "Final Approval", "Approved"];
const METHODS: ProcurementMethod[] = [
  "Open Tender", "Restricted Tender", "Request for Quotation",
  "Direct Procurement", "Framework Agreement", "Two-Stage Tender",
  "Request for Proposals", "Expression of Interest",
];

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
            <div className={`h-1.5 w-full rounded-full ${i <= idx ? "bg-black" : "bg-black/10"}`} />
            <span className={`text-[9px] text-center leading-tight hidden sm:block ${i === idx ? "font-bold text-black" : "text-black/40"}`}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI Strategy Assistant ─────────────────────────────────────────────────────
function AIStrategyAssistant({ strategy, onClose }: { strategy: ProcurementStrategy | null; onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<{ from: "ai" | "user"; text: string }[]>([
    { from: "ai", text: "Hello! I'm your AI Procurement Strategy Assistant. I can recommend procurement methods, analyse market conditions, assess supplier risks, and generate evaluation criteria. How can I help?" },
  ]);

  const sendMsg = () => {
    if (!msg.trim()) return;
    const user = msg.trim();
    setMsg("");
    setChat(c => [...c, { from: "user", text: user }]);
    setTimeout(() => {
      let reply = "Based on my analysis of the procurement strategy and market data, I recommend validating the supplier shortlist before advertising.";
      if (user.toLowerCase().includes("method")) reply = strategy ? `For ${strategy.title}, the recommended method is ${strategy.procurementMethod}. This is appropriate given the contract value and nature of procurement. Framework agreements would be ideal for recurring requirements.` : "Please select a strategy to analyse procurement method suitability.";
      else if (user.toLowerCase().includes("market")) reply = "Market analysis indicates moderate competition with 3–5 capable suppliers. I recommend a pre-qualification stage to shortlist capable vendors and reduce evaluation burden.";
      else if (user.toLowerCase().includes("risk")) reply = "Key strategic risks identified: (1) Supplier concentration risk — mitigate via multi-lot approach; (2) Price volatility — include price adjustment clause; (3) Non-performance — mandatory performance bond and liquidated damages clause.";
      else if (user.toLowerCase().includes("criteria")) reply = "Recommended evaluation criteria: Technical capability (40%), Price (35%), Delivery schedule (15%), Financial stability (10%). Ensure criteria are objective and measurable.";
      else if (user.toLowerCase().includes("compli")) reply = `Compliance score: ${strategy?.complianceScore ?? 0}%. The strategy document is ${strategy?.complianceScore && strategy.complianceScore >= 80 ? "substantially complete" : "missing key sections"}. Priority items: evaluation criteria weights must sum to 100%, justify chosen procurement method.`;
      setChat(c => [...c, { from: "ai", text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-black/10 shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 bg-black text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <div>
            <div className="text-xs font-bold">AI Strategy Assistant</div>
            <div className="text-[10px] text-white/60">Method · Market · Evaluation</div>
          </div>
        </div>
        <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-white/10"><X className="h-4 w-4" /></button>
      </div>
      {strategy?.aiRecommendations && strategy.aiRecommendations.length > 0 && (
        <div className="px-4 py-2.5 border-b border-black/8 bg-slate-50">
          <div className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wide mb-1.5">AI Recommendations</div>
          {strategy.aiRecommendations.map((r, i) => (
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
            placeholder="Ask about method, market, risks…" className="flex-1 h-8 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
          <button onClick={sendMsg} className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800">Ask</button>
        </div>
      </div>
    </div>
  );
}

// ─── Strategy Form Modal ──────────────────────────────────────────────────────
function StrategyFormModal({ strategy, onSave, onClose }: {
  strategy: Partial<ProcurementStrategy> | null;
  onSave: (s: ProcurementStrategy) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<ProcurementStrategy>>(strategy ?? {
    title: "", ministry: "", department: "", financialYear: "2026/2027",
    procurementMethod: "Open Tender", methodJustification: "", strategyObjective: "",
    estimatedBudget: "", currency: "USD", costAnalysisSummary: "",
    plannedAdvertisementDate: "", plannedClosingDate: "", plannedEvaluationDate: "", plannedAwardDate: "",
    priority: "Medium", notes: "",
    marketAnalysis: { marketSize: "", activeSuppliers: 0, competitionLevel: "Medium", marketNotes: "" },
  });
  const [risks, setRisks] = useState<StrategyRisk[]>(strategy?.risks ?? []);
  const [suppliers, setSuppliers] = useState<SupplierAnalysis[]>(strategy?.supplierAnalysis ?? []);
  const [criteria, setCriteria] = useState(strategy?.evaluationCriteria ?? [
    { criterion: "Technical Compliance", weight: 40 },
    { criterion: "Price", weight: 35 },
    { criterion: "Delivery Schedule", weight: 15 },
    { criterion: "Financial Stability", weight: 10 },
  ]);
  const [activeTab, setActiveTab] = useState<"overview" | "market" | "suppliers" | "risks" | "evaluation" | "schedule">("overview");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof ProcurementStrategy, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const setMarket = (k: string, v: string | number) => setForm(f => ({ ...f, marketAnalysis: { ...(f.marketAnalysis as object), [k]: v } as typeof form.marketAnalysis }));

  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title?.trim()) e.title = "Title is required";
    if (!form.ministry?.trim()) e.ministry = "Ministry is required";
    if (!form.strategyObjective?.trim()) e.objective = "Objective is required";
    if (!form.methodJustification?.trim()) e.method = "Method justification is required";
    if (totalWeight !== 100) e.criteria = "Evaluation criteria weights must total 100%";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (submit = false) => {
    if (submit && !validate()) return;
    const now = new Date().toISOString().slice(0, 10);
    const saved: ProcurementStrategy = {
      id: strategy?.id ?? `strat-${Date.now()}`,
      strategyNumber: strategy?.strategyNumber ?? `PS-2026-${String(Math.floor(Math.random() * 900) + 100)}`,
      title: form.title ?? "", ministry: form.ministry ?? "", department: form.department ?? "",
      financialYear: form.financialYear ?? "2026/2027",
      linkedRequisitionId: form.linkedRequisitionId, linkedPlanId: form.linkedPlanId,
      procurementMethod: form.procurementMethod ?? "Open Tender",
      methodJustification: form.methodJustification ?? "",
      strategyObjective: form.strategyObjective ?? "",
      marketAnalysis: form.marketAnalysis ?? { marketSize: "", activeSuppliers: 0, competitionLevel: "Medium", marketNotes: "" },
      supplierAnalysis: suppliers, risks,
      evaluationCriteria: criteria,
      estimatedBudget: form.estimatedBudget ?? "", currency: form.currency ?? "USD",
      costAnalysisSummary: form.costAnalysisSummary ?? "",
      plannedAdvertisementDate: form.plannedAdvertisementDate ?? "",
      plannedClosingDate: form.plannedClosingDate ?? "",
      plannedEvaluationDate: form.plannedEvaluationDate ?? "",
      plannedAwardDate: form.plannedAwardDate ?? "",
      status: submit ? "Submitted" : "Draft",
      workflowStage: submit ? "Strategy Review" : "Draft",
      workflowProgress: submit ? 20 : 0,
      priority: form.priority ?? "Medium",
      aiRecommendations: strategy?.aiRecommendations ?? [],
      complianceScore: submit ? 80 : 45,
      notes: form.notes ?? "", attachments: strategy?.attachments ?? [],
      owner: "Current User", version: strategy ? `v${(parseFloat((strategy.version ?? "v1.0").slice(1)) + 0.1).toFixed(1)}` : "v1.0",
      createdAt: strategy?.createdAt ?? now, updatedAt: now,
    };
    onSave(saved);
    pushNotification(submit ? `Strategy submitted: ${saved.title}` : `Strategy saved: ${saved.title}`, submit ? "success" : "info");
  };

  const TABS = [
    { id: "overview", label: "Overview" }, { id: "market", label: "Market Analysis" },
    { id: "suppliers", label: `Suppliers (${suppliers.length})` }, { id: "risks", label: `Risks (${risks.length})` },
    { id: "evaluation", label: "Evaluation" }, { id: "schedule", label: "Schedule" },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-black text-white">
          <div>
            <div className="text-sm font-bold">{strategy?.id ? "Edit Procurement Strategy" : "New Procurement Strategy"}</div>
            <div className="text-xs text-white/60">{strategy?.strategyNumber ?? "Number auto-assigned"}</div>
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
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-black/70 mb-1 block">Strategy Title *</label>
                <input value={form.title ?? ""} onChange={e => set("title", e.target.value)}
                  className={`w-full h-9 px-3 rounded-lg border text-sm focus:outline-none ${errors.title ? "border-red-400" : "border-black/10"}`} />
                {errors.title && <p className="text-[10px] text-red-500 mt-0.5">{errors.title}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Ministry *</label>
                <select value={form.ministry ?? ""} onChange={e => set("ministry", e.target.value)}
                  className={`w-full h-9 px-3 rounded-lg border text-sm focus:outline-none ${errors.ministry ? "border-red-400" : "border-black/10"}`}>
                  <option value="">Select…</option>
                  {ZIMBABWE_MINISTRIES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {errors.ministry && <p className="text-[10px] text-red-500 mt-0.5">{errors.ministry}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Department</label>
                <input value={form.department ?? ""} onChange={e => set("department", e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Procurement Method</label>
                <select value={form.procurementMethod ?? ""} onChange={e => set("procurementMethod", e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none">
                  {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
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
                <label className="text-xs font-semibold text-black/70 mb-1 block">Estimated Budget</label>
                <input value={form.estimatedBudget ?? ""} onChange={e => set("estimatedBudget", e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" placeholder="e.g. 8,200,000" />
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Currency</label>
                <select value={form.currency ?? "USD"} onChange={e => set("currency", e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none">
                  {["USD", "ZWG", "EUR"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-black/70 mb-1 block">Strategy Objective *</label>
                <textarea value={form.strategyObjective ?? ""} onChange={e => set("strategyObjective", e.target.value)} rows={3}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none resize-none ${errors.objective ? "border-red-400" : "border-black/10"}`} />
                {errors.objective && <p className="text-[10px] text-red-500 mt-0.5">{errors.objective}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-black/70 mb-1 block">Method Justification *</label>
                <textarea value={form.methodJustification ?? ""} onChange={e => set("methodJustification", e.target.value)} rows={3}
                  placeholder="Explain why this procurement method is appropriate…"
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none resize-none ${errors.method ? "border-red-400" : "border-black/10"}`} />
                {errors.method && <p className="text-[10px] text-red-500 mt-0.5">{errors.method}</p>}
              </div>
            </div>
          )}

          {activeTab === "market" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Market Size Estimate</label>
                <input value={(form.marketAnalysis as {marketSize:string})?.marketSize ?? ""} onChange={e => setMarket("marketSize", e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" placeholder="e.g. USD 800M global" />
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Active Qualified Suppliers</label>
                <input type="number" value={(form.marketAnalysis as {activeSuppliers:number})?.activeSuppliers ?? 0} onChange={e => setMarket("activeSuppliers", Number(e.target.value))}
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Competition Level</label>
                <select value={(form.marketAnalysis as {competitionLevel:string})?.competitionLevel ?? "Medium"} onChange={e => setMarket("competitionLevel", e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none">
                  {["Low", "Medium", "High"].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-black/70 mb-1 block">Market Analysis Notes</label>
                <textarea value={(form.marketAnalysis as {marketNotes:string})?.marketNotes ?? ""} onChange={e => setMarket("marketNotes", e.target.value)} rows={5}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-black/70 mb-1 block">Cost Analysis Summary</label>
                <textarea value={form.costAnalysisSummary ?? ""} onChange={e => set("costAnalysisSummary", e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none resize-none" />
              </div>
            </div>
          )}

          {activeTab === "suppliers" && (
            <div className="space-y-3">
              <table className="w-full text-xs">
                <thead className="bg-black/3 text-[11px] text-black/50">
                  <tr>{["Supplier Name", "Capability", "Experience", "Risk Rating", ""].map(h => <th key={h} className="text-left px-2 py-2 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {suppliers.map((s, i) => (
                    <tr key={i}>
                      <td className="px-2 py-1.5 min-w-[160px]">
                        <input value={s.supplierName} onChange={e => setSuppliers(prev => prev.map((x, j) => j === i ? { ...x, supplierName: e.target.value } : x))}
                          className="w-full h-7 px-2 rounded border border-black/10 text-xs focus:outline-none" />
                      </td>
                      <td className="px-2 py-1.5">
                        <select value={s.capability} onChange={e => setSuppliers(prev => prev.map((x, j) => j === i ? { ...x, capability: e.target.value as "Low"|"Medium"|"High" } : x))}
                          className="h-7 px-2 rounded border border-black/10 text-xs focus:outline-none">
                          {["Low", "Medium", "High"].map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-1.5 min-w-[140px]">
                        <input value={s.experience} onChange={e => setSuppliers(prev => prev.map((x, j) => j === i ? { ...x, experience: e.target.value } : x))}
                          className="w-full h-7 px-2 rounded border border-black/10 text-xs focus:outline-none" />
                      </td>
                      <td className="px-2 py-1.5">
                        <select value={s.riskRating} onChange={e => setSuppliers(prev => prev.map((x, j) => j === i ? { ...x, riskRating: e.target.value as "Low"|"Medium"|"High" } : x))}
                          className="h-7 px-2 rounded border border-black/10 text-xs focus:outline-none">
                          {["Low", "Medium", "High"].map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <button onClick={() => setSuppliers(prev => prev.filter((_, j) => j !== i))} className="h-6 w-6 grid place-items-center rounded hover:bg-red-50 text-red-400"><Trash2 className="h-3 w-3" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={() => setSuppliers(prev => [...prev, { supplierName: "", capability: "Medium", experience: "", riskRating: "Medium" }])}
                className="h-8 px-3 rounded-lg border border-dashed border-black/20 text-xs font-medium text-black/60 hover:bg-black/3 flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Supplier
              </button>
            </div>
          )}

          {activeTab === "risks" && (
            <div className="space-y-3">
              {risks.map((risk, i) => (
                <div key={risk.id} className="p-3 border border-black/8 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-black/40 uppercase">Risk #{i + 1}</span>
                    <button onClick={() => setRisks(prev => prev.filter(r => r.id !== risk.id))} className="h-5 w-5 grid place-items-center rounded hover:bg-red-50 text-red-400"><Trash2 className="h-3 w-3" /></button>
                  </div>
                  <input value={risk.risk} onChange={e => setRisks(prev => prev.map(r => r.id === risk.id ? { ...r, risk: e.target.value } : r))}
                    className="w-full h-8 px-2 rounded-lg border border-black/10 text-xs focus:outline-none" placeholder="Risk description" />
                  <div className="grid grid-cols-2 gap-2">
                    {(["likelihood", "impact"] as const).map(field => (
                      <div key={field}>
                        <label className="text-[10px] text-black/50 capitalize">{field}</label>
                        <select value={risk[field]} onChange={e => setRisks(prev => prev.map(r => r.id === risk.id ? { ...r, [field]: e.target.value } : r))}
                          className="w-full h-7 px-2 rounded-lg border border-black/10 text-xs focus:outline-none mt-0.5">
                          {["Low", "Medium", "High"].map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                  <input value={risk.mitigation} onChange={e => setRisks(prev => prev.map(r => r.id === risk.id ? { ...r, mitigation: e.target.value } : r))}
                    className="w-full h-8 px-2 rounded-lg border border-black/10 text-xs focus:outline-none" placeholder="Mitigation strategy" />
                </div>
              ))}
              <button onClick={() => setRisks(prev => [...prev, { id: `sr-${Date.now()}`, risk: "", likelihood: "Medium", impact: "Medium", mitigation: "" }])}
                className="h-8 px-3 rounded-lg border border-dashed border-black/20 text-xs font-medium text-black/60 hover:bg-black/3 flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Risk
              </button>
            </div>
          )}

          {activeTab === "evaluation" && (
            <div className="space-y-3">
              <div className={`flex items-center justify-between p-2.5 rounded-lg ${totalWeight === 100 ? "bg-slate-50 border border-slate-200" : "bg-red-50 border border-red-200"}`}>
                <span className="text-xs font-semibold text-black">Total Criteria Weight</span>
                <span className={`text-sm font-bold ${totalWeight === 100 ? "text-[#0F172A]" : "text-red-600"}`}>{totalWeight}% {totalWeight !== 100 && "(must be 100%)"}</span>
              </div>
              {criteria.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={c.criterion} onChange={e => setCriteria(prev => prev.map((x, j) => j === i ? { ...x, criterion: e.target.value } : x))}
                    className="flex-1 h-8 px-2 rounded-lg border border-black/10 text-xs focus:outline-none" placeholder="Criterion" />
                  <input type="number" min="0" max="100" value={c.weight} onChange={e => setCriteria(prev => prev.map((x, j) => j === i ? { ...x, weight: Number(e.target.value) } : x))}
                    className="w-20 h-8 px-2 rounded-lg border border-black/10 text-xs focus:outline-none text-right" />
                  <span className="text-xs text-black/40 w-4">%</span>
                  <button onClick={() => setCriteria(prev => prev.filter((_, j) => j !== i))} className="h-6 w-6 grid place-items-center rounded hover:bg-red-50 text-red-400"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
              <button onClick={() => setCriteria(prev => [...prev, { criterion: "", weight: 0 }])}
                className="h-8 px-3 rounded-lg border border-dashed border-black/20 text-xs font-medium text-black/60 hover:bg-black/3 flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Criterion
              </button>
              {errors.criteria && <p className="text-[10px] text-red-500">{errors.criteria}</p>}
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([
                ["plannedAdvertisementDate", "Planned Advertisement Date"],
                ["plannedClosingDate", "Planned Closing Date"],
                ["plannedEvaluationDate", "Planned Evaluation Date"],
                ["plannedAwardDate", "Planned Award Date"],
              ] as [keyof ProcurementStrategy, string][]).map(([k, lbl]) => (
                <div key={k}>
                  <label className="text-xs font-semibold text-black/70 mb-1 block">{lbl}</label>
                  <input type="date" value={(form[k] as string) ?? ""} onChange={e => set(k, e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-black/70 mb-1 block">Notes</label>
                <textarea value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none resize-none" />
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

// ─── Strategy Detail Panel ────────────────────────────────────────────────────
function StrategyDetailPanel({ strategy, onAction, onClose }: {
  strategy: ProcurementStrategy;
  onAction: (a: "approve" | "reject" | "return" | "edit") => void;
  onClose: () => void;
}) {
  const [activePanel, setActivePanel] = useState<"overview" | "market" | "suppliers" | "risks" | "evaluation" | "compliance">("overview");

  const compChecks = [
    { item: "Title provided", pass: !!strategy.title },
    { item: "Ministry assigned", pass: !!strategy.ministry },
    { item: "Procurement method selected", pass: !!strategy.procurementMethod },
    { item: "Method justification provided", pass: !!strategy.methodJustification },
    { item: "Strategy objective defined", pass: !!strategy.strategyObjective },
    { item: "Market analysis completed", pass: !!strategy.marketAnalysis?.marketNotes },
    { item: "At least one supplier analysed", pass: strategy.supplierAnalysis.length > 0 },
    { item: "At least one risk identified", pass: strategy.risks.length > 0 },
    { item: "Evaluation criteria defined", pass: strategy.evaluationCriteria.length > 0 },
    { item: "Evaluation weights sum to 100%", pass: strategy.evaluationCriteria.reduce((s, c) => s + c.weight, 0) === 100 },
    { item: "Procurement schedule set", pass: !!strategy.plannedAdvertisementDate },
    { item: "Budget estimate provided", pass: !!strategy.estimatedBudget },
  ];

  const RISK_COLOR: Record<string, string> = {
    Low: "bg-slate-100 text-[#0F172A]", Medium: "bg-slate-100 text-[#0F172A]", High: "bg-red-100 text-red-700",
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[520px] max-w-full bg-white border-l border-black/10 shadow-2xl z-40 flex flex-col">
      <div className="px-5 py-3.5 border-b border-black/10 bg-black text-white flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-bold text-white/60 uppercase">{strategy.strategyNumber}</div>
          <div className="text-sm font-bold truncate">{strategy.title}</div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${PRIORITY_COLOR[strategy.priority]}`}>{strategy.priority}</span>
            <Badge tone={STATUS_TONE[strategy.status] ?? "muted"}>{strategy.status}</Badge>
            <span className="text-[10px] text-white/60">{strategy.procurementMethod}</span>
          </div>
        </div>
        <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10 flex-shrink-0"><X className="h-4 w-4" /></button>
      </div>
      <div className="px-5 py-3 border-b border-black/10 bg-black/5">
        <WorkflowProgress stage={strategy.workflowStage} progress={strategy.workflowProgress} />
      </div>
      <div className="flex gap-0 border-b border-black/10 px-5 overflow-x-auto">
        {(["overview", "market", "suppliers", "risks", "evaluation", "compliance"] as const).map(t => (
          <button key={t} onClick={() => setActivePanel(t)}
            className={`px-3 py-2 text-[11px] font-semibold whitespace-nowrap border-b-2 capitalize transition-colors ${activePanel === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 text-xs space-y-3">
        {activePanel === "overview" && (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[["Ministry", strategy.ministry], ["Department", strategy.department], ["Method", strategy.procurementMethod], ["Financial Year", strategy.financialYear], ["Budget", `${strategy.currency} ${strategy.estimatedBudget}`], ["Priority", strategy.priority]].map(([k, v]) => (
                <div key={k}><div className="text-[10px] text-black/40">{k}</div><div className="font-semibold text-black">{v || "—"}</div></div>
              ))}
            </div>
            <div><div className="text-[10px] text-black/40 mb-0.5">Objective</div><div className="text-black/70">{strategy.strategyObjective || "—"}</div></div>
            <div><div className="text-[10px] text-black/40 mb-0.5">Method Justification</div><div className="text-black/70">{strategy.methodJustification || "—"}</div></div>
            {strategy.costAnalysisSummary && <div><div className="text-[10px] text-black/40 mb-0.5">Cost Analysis</div><div className="text-black/70">{strategy.costAnalysisSummary}</div></div>}
            {strategy.aiRecommendations.length > 0 && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold text-[#0F172A] uppercase mb-1.5">AI Recommendations</div>
                {strategy.aiRecommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5 mb-1"><Sparkles className="h-3 w-3 text-[#0F172A] mt-0.5 flex-shrink-0" /><span className="text-[11px] text-[#0F172A]">{r}</span></div>
                ))}
              </div>
            )}
          </>
        )}
        {activePanel === "market" && (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
              {[["Market Size", strategy.marketAnalysis.marketSize], ["Active Suppliers", String(strategy.marketAnalysis.activeSuppliers)], ["Competition Level", strategy.marketAnalysis.competitionLevel]].map(([k, v]) => (
                <div key={k}><div className="text-[10px] text-black/40">{k}</div><div className="font-semibold text-black">{v || "—"}</div></div>
              ))}
            </div>
            <div><div className="text-[10px] text-black/40 mb-0.5">Market Notes</div><div className="text-black/70">{strategy.marketAnalysis.marketNotes || "—"}</div></div>
          </>
        )}
        {activePanel === "suppliers" && (
          <table className="w-full text-xs">
            <thead className="bg-black/3 text-[10px] text-black/50">
              <tr>{["Supplier", "Capability", "Experience", "Risk"].map(h => <th key={h} className="text-left px-2 py-1.5 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {strategy.supplierAnalysis.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-black/30">No suppliers analysed</td></tr>}
              {strategy.supplierAnalysis.map((s, i) => (
                <tr key={i}>
                  <td className="px-2 py-2 font-medium text-black">{s.supplierName}</td>
                  <td className="px-2 py-2"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${RISK_COLOR[s.capability]}`}>{s.capability}</span></td>
                  <td className="px-2 py-2 text-black/60">{s.experience}</td>
                  <td className="px-2 py-2"><span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${RISK_COLOR[s.riskRating]}`}>{s.riskRating}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {activePanel === "risks" && (
          <div className="space-y-2">
            {strategy.risks.length === 0 && <div className="text-center py-4 text-black/30">No risks identified</div>}
            {strategy.risks.map((r, i) => (
              <div key={r.id} className="p-3 border border-black/8 rounded-xl">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="font-semibold text-black">{r.risk}</span>
                  <div className="flex gap-1 flex-shrink-0">
                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${RISK_COLOR[r.likelihood]}`}>L:{r.likelihood}</span>
                    <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${RISK_COLOR[r.impact]}`}>I:{r.impact}</span>
                  </div>
                </div>
                <div className="text-[11px] text-black/60">{r.mitigation}</div>
              </div>
            ))}
          </div>
        )}
        {activePanel === "evaluation" && (
          <div className="space-y-2">
            <div className="text-[10px] text-black/40 font-semibold uppercase mb-2">Evaluation Criteria</div>
            {strategy.evaluationCriteria.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 border border-black/8 rounded-lg">
                <span className="font-medium text-black">{c.criterion}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-black/10">
                    <div className="h-full rounded-full bg-black" style={{ width: `${c.weight}%` }} />
                  </div>
                  <span className="font-bold text-black w-8 text-right">{c.weight}%</span>
                </div>
              </div>
            ))}
            <div className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold mt-2 ${strategy.evaluationCriteria.reduce((s, c) => s + c.weight, 0) === 100 ? "bg-slate-50 text-[#0F172A]" : "bg-red-50 text-red-700"}`}>
              <span>Total</span>
              <span>{strategy.evaluationCriteria.reduce((s, c) => s + c.weight, 0)}%</span>
            </div>
          </div>
        )}
        {activePanel === "compliance" && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-black">Compliance Score</span>
              <span className={`text-sm font-bold ${strategy.complianceScore >= 90 ? "text-[#0F172A]" : strategy.complianceScore >= 70 ? "text-[#0F172A]" : "text-red-600"}`}>{strategy.complianceScore}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/10 mb-4">
              <div className={`h-full rounded-full ${strategy.complianceScore >= 90 ? "bg-[#0F172A]" : strategy.complianceScore >= 70 ? "bg-[#0F172A]" : "bg-red-500"}`} style={{ width: `${strategy.complianceScore}%` }} />
            </div>
            <div className="space-y-1.5">
              {compChecks.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 ${c.pass ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-500"}`}>
                    {c.pass ? <Check className="h-2.5 w-2.5" /> : <X className="h-2.5 w-2.5" />}
                  </div>
                  <span className={c.pass ? "text-black/70" : "text-red-600 font-medium"}>{c.item}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="px-5 py-3.5 border-t border-black/10 flex gap-2 flex-wrap">
        <button onClick={() => onAction("edit")} className="flex-1 h-8 rounded-lg border border-black/10 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-black/5">
          <Edit2 className="h-3.5 w-3.5" /> Edit
        </button>
        {strategy.status !== "Approved" && strategy.status !== "Rejected" && (
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
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProcurementStrategyPage() {
  const [strategies, setStrategies] = useState<ProcurementStrategy[]>(SEED_STRATEGIES);
  const [selected, setSelected] = useState<ProcurementStrategy | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editStrategy, setEditStrategy] = useState<ProcurementStrategy | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = strategies.filter(s => {
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.strategyNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = (s: ProcurementStrategy) => {
    setStrategies(prev => {
      const idx = prev.findIndex(x => x.id === s.id);
      return idx >= 0 ? prev.map(x => x.id === s.id ? s : x) : [...prev, s];
    });
    setShowForm(false); setEditStrategy(null); setSelected(s);
  };

  const handleAction = (action: "approve" | "reject" | "return" | "edit") => {
    if (!selected) return;
    if (action === "edit") { setEditStrategy(selected); setShowForm(true); return; }
    const updates = {
      approve: { status: "Approved" as const, workflowStage: "Approved" as const, workflowProgress: 100 },
      reject: { status: "Rejected" as const, workflowProgress: selected.workflowProgress },
      return: { status: "Returned" as const, workflowStage: "Draft" as const, workflowProgress: 0 },
    }[action];
    const updated = { ...selected, ...updates, updatedAt: new Date().toISOString().slice(0, 10) };
    setStrategies(prev => prev.map(s => s.id === selected.id ? updated : s));
    setSelected(updated);
    pushNotification(`Strategy ${action}d: ${selected.title}`, action === "approve" ? "success" : "warning");
  };

  const kpis = [
    { label: "Total Strategies", value: String(strategies.length) },
    { label: "Approved", value: String(strategies.filter(s => s.status === "Approved").length) },
    { label: "Under Review", value: String(strategies.filter(s => s.status === "Under Review" || s.status === "Submitted").length) },
    { label: "Draft", value: String(strategies.filter(s => s.status === "Draft").length) },
    { label: "Total Budget", value: `$${(strategies.reduce((s, x) => s + parseFloat(x.estimatedBudget.replace(/,/g, "") || "0"), 0) / 1_000_000).toFixed(1)}M` },
    { label: "Avg Compliance", value: `${Math.round(strategies.reduce((s, x) => s + x.complianceScore, 0) / Math.max(strategies.length, 1))}%` },
  ];

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Procurement Strategy"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1800px] mx-auto">
        <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge tone="blue">Stage 3</Badge>
              <Badge tone="muted">Procurement Strategy</Badge>
            </div>
            <h1 className="text-2xl font-bold text-black tracking-tight">Procurement Strategy Workbench</h1>
            <p className="text-sm text-black/50 mt-1">Define procurement method, analyse markets and suppliers, assess risks, set evaluation criteria.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowAI(v => !v)} className={`h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${showAI ? "bg-[#0F172A] text-white border-slate-200" : "border-black/10 text-black/60 hover:bg-black/5"}`}>
              <Sparkles className="h-3.5 w-3.5" /> AI Assistant
            </button>
            <button onClick={() => { setEditStrategy(null); setShowForm(true); }} className="h-9 px-4 rounded-xl bg-black text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-800">
              <Plus className="h-3.5 w-3.5" /> New Strategy
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
          {kpis.map(k => (
            <div key={k.label} className="bg-white border border-black/8 rounded-2xl p-3.5 hover:shadow-md transition-all">
              <div className="text-[10px] text-black/40 font-semibold uppercase tracking-wide">{k.label}</div>
              <div className="text-xl font-bold text-black mt-1">{k.value}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search strategies…"
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-black/10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {["All", "Draft", "Submitted", "Under Review", "Approved", "Rejected"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`h-9 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${filterStatus === s ? "bg-black text-white" : "bg-white border border-black/10 text-black/60 hover:bg-black/5"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/3 text-[11px] text-black/50 border-b border-black/8">
                <tr>
                  {["Strategy Number", "Title", "Ministry", "Method", "Budget", "Suppliers", "Risks", "Priority", "Workflow Stage", "Compliance", "Status", ""].map(h => (
                    <th key={h} className="text-left font-semibold px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.length === 0 && <tr><td colSpan={12} className="text-center py-12 text-black/30 text-xs">No strategies found.</td></tr>}
                {filtered.map(s => (
                  <tr key={s.id} onClick={() => setSelected(s)} className="hover:bg-black/3 cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-black/60 whitespace-nowrap">{s.strategyNumber}</td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="font-semibold text-black text-xs truncate">{s.title}</div>
                      <div className="text-[10px] text-black/40 truncate">{s.department}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-black/70 max-w-[160px] truncate">{s.ministry}</td>
                    <td className="px-4 py-3 text-xs text-black/70 whitespace-nowrap">{s.procurementMethod}</td>
                    <td className="px-4 py-3 font-semibold text-black text-xs whitespace-nowrap">{s.currency} {s.estimatedBudget}</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-black">{s.supplierAnalysis.length}</td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-black">{s.risks.length}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLOR[s.priority]}`}>{s.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-black/70 whitespace-nowrap">{s.workflowStage}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1.5 rounded-full bg-black/8">
                          <div className={`h-full rounded-full ${s.complianceScore >= 90 ? "bg-[#0F172A]" : s.complianceScore >= 70 ? "bg-[#0F172A]" : "bg-red-500"}`} style={{ width: `${s.complianceScore}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-black/60">{s.complianceScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge tone={STATUS_TONE[s.status] ?? "muted"}>{s.status}</Badge></td>
                    <td className="px-4 py-3">
                      <button onClick={e => { e.stopPropagation(); setSelected(s); }} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-black/5 text-black/40">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {selected && !showForm && <StrategyDetailPanel strategy={selected} onAction={handleAction} onClose={() => setSelected(null)} />}
      {showForm && <StrategyFormModal strategy={editStrategy} onSave={handleSave} onClose={() => { setShowForm(false); setEditStrategy(null); }} />}
      {showAI && <AIStrategyAssistant strategy={selected} onClose={() => setShowAI(false)} />}
    </AppShell>
  );
}
