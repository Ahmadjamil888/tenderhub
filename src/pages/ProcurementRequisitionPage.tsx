import { useState } from "react";
import { AppShell, PageHeader, Card, Badge , PageContextBar } from "@/components/AppShell";
import {
  Plus, Search, ChevronRight, Sparkles, FileText, CheckCircle2, Clock,
  Upload, Download, Eye, Save, Send, RotateCcw, Printer, Edit2,
  DollarSign, Calendar, Shield, BarChart3, X, Check, Trash2,
  AlertTriangle, Info, ShoppingCart,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import {
  type ProcurementRequisition, type RequisitionItem, SEED_REQUISITIONS,
  ZIMBABWE_MINISTRIES, FUNDING_SOURCES, PROCUREMENT_CATEGORIES,
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
const WORKFLOW_STEPS = ["Draft", "Supervisor Review", "Finance Verification", "Procurement Approval", "Approved"];

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
            <span className={`text-[9px] text-center leading-tight hidden sm:block ${i === idx ? "font-bold text-black" : "text-black/40"}`}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI Requisition Assistant ─────────────────────────────────────────────────
function AIRequisitionAssistant({ req, onClose }: { req: ProcurementRequisition | null; onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<{ from: "ai" | "user"; text: string }[]>([
    { from: "ai", text: "Hello! I'm your AI Requisition Assistant. I can help verify budget availability, check item specifications, identify missing information, and assess compliance. How can I assist?" },
  ]);

  const sendMsg = () => {
    if (!msg.trim()) return;
    const user = msg.trim();
    setMsg("");
    setChat(c => [...c, { from: "user", text: user }]);
    setTimeout(() => {
      let reply = "Based on the requisition details, all mandatory fields appear complete. I recommend verifying the delivery timeline against procurement lead times before final submission.";
      if (user.toLowerCase().includes("budget")) reply = req ? `Budget available: ${req.currency} ${req.budgetAvailable}. Total cost: ${req.currency} ${req.totalEstimatedCost}. Balance after commitment: ${req.currency} ${req.budgetBalance}. Budget is SUFFICIENT for this requisition.` : "Please select a requisition to check budget availability.";
      else if (user.toLowerCase().includes("spec")) reply = "I recommend reviewing item specifications for technical accuracy. Ensure specifications are output-based rather than brand-specific to allow fair competition.";
      else if (user.toLowerCase().includes("justif")) reply = "The justification appears adequate. For high-value or urgent procurements, ensure the justification references the approved procurement plan.";
      else if (user.toLowerCase().includes("compli")) reply = `Compliance score: ${req?.complianceScore ?? 0}%. Key checks: budget availability confirmed, items specified, delivery address provided, justification documented. Review missing attachments.`;
      setChat(c => [...c, { from: "ai", text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-black/10 shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 bg-black text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <div>
            <div className="text-xs font-bold">AI Requisition Assistant</div>
            <div className="text-[10px] text-white/60">Budget · Compliance · Specs</div>
          </div>
        </div>
        <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-white/10"><X className="h-4 w-4" /></button>
      </div>
      {req && (
        <div className="px-4 py-2.5 bg-black/5 border-b border-black/8 space-y-1">
          <div className="text-xs font-semibold text-black truncate">{req.title}</div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-black/50">{req.requisitionNumber}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${req.complianceScore >= 90 ? "bg-slate-100 text-[#0F172A] border-slate-200" : "bg-slate-100 text-[#0F172A] border-slate-200"}`}>
              {req.complianceScore}% compliant
            </span>
          </div>
          <div className="text-[11px] font-bold text-black">{req.currency} {req.totalEstimatedCost} <span className="text-black/40 font-normal">total</span></div>
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
            placeholder="Ask about budget, specs, compliance…" className="flex-1 h-8 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
          <button onClick={sendMsg} className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800">Ask</button>
        </div>
      </div>
    </div>
  );
}

// ─── Requisition Form Modal ───────────────────────────────────────────────────
const EMPTY_REQ: Partial<ProcurementRequisition> = {
  title: "", ministry: "", department: "", requestingOfficer: "",
  requestingOfficerTitle: "", financialYear: "2026/2027",
  budgetCode: "", costCentre: "", fundingSource: "",
  priority: "Medium", currency: "USD", budgetAvailable: "",
  budgetBalance: "", procurementJustification: "",
  deliveryAddress: "", deliveryRequirements: "", requiredDeliveryDate: "",
  notes: "", items: [],
};

function RequisitionFormModal({ req, onSave, onClose }: {
  req: Partial<ProcurementRequisition> | null;
  onSave: (r: ProcurementRequisition) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<ProcurementRequisition>>(req ?? EMPTY_REQ);
  const [items, setItems] = useState<RequisitionItem[]>(req?.items ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"header" | "items" | "budget" | "delivery" | "notes">("header");

  const set = (k: keyof ProcurementRequisition, v: string) => setForm(f => ({ ...f, [k]: v }));

  const addItem = () => setItems(prev => [...prev, {
    id: `ri-${Date.now()}`, itemNo: prev.length + 1, description: "", specifications: "",
    quantity: 1, unit: "Unit", estimatedUnitCost: "0", totalCost: "0", category: "",
  }]);

  const updateItem = (id: string, field: keyof RequisitionItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === "quantity" || field === "estimatedUnitCost") {
        const qty = field === "quantity" ? Number(value) : item.quantity;
        const cost = field === "estimatedUnitCost" ? parseFloat(String(value).replace(/,/g, "")) : parseFloat(item.estimatedUnitCost.replace(/,/g, ""));
        updated.totalCost = isNaN(qty * cost) ? "0" : (qty * cost).toLocaleString();
      }
      return updated;
    }));
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const totalCost = items.reduce((s, i) => s + parseFloat(i.totalCost.replace(/,/g, "") || "0"), 0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title?.trim()) e.title = "Title is required";
    if (!form.ministry?.trim()) e.ministry = "Ministry is required";
    if (!form.department?.trim()) e.department = "Department is required";
    if (!form.requestingOfficer?.trim()) e.requestingOfficer = "Requesting officer is required";
    if (items.length === 0) e.items = "At least one item is required";
    if (!form.procurementJustification?.trim()) e.justification = "Justification is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = (submit = false) => {
    if (submit && !validate()) return;
    const now = new Date().toISOString().slice(0, 10);
    const saved: ProcurementRequisition = {
      id: req?.id ?? `req-${Date.now()}`,
      requisitionNumber: req?.requisitionNumber ?? `PR-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      title: form.title ?? "", ministry: form.ministry ?? "", department: form.department ?? "",
      requestingOfficer: form.requestingOfficer ?? "", requestingOfficerTitle: form.requestingOfficerTitle ?? "",
      financialYear: form.financialYear ?? "2026/2027", budgetCode: form.budgetCode ?? "",
      costCentre: form.costCentre ?? "", fundingSource: form.fundingSource ?? "",
      priority: form.priority ?? "Medium",
      status: submit ? "Submitted" : "Draft",
      workflowStage: submit ? "Supervisor Review" : "Draft",
      workflowProgress: submit ? 20 : 0,
      items,
      totalEstimatedCost: totalCost.toLocaleString(), currency: form.currency ?? "USD",
      budgetAvailable: form.budgetAvailable ?? "0", budgetBalance: form.budgetBalance ?? "0",
      procurementJustification: form.procurementJustification ?? "",
      deliveryAddress: form.deliveryAddress ?? "", deliveryRequirements: form.deliveryRequirements ?? "",
      requiredDeliveryDate: form.requiredDeliveryDate ?? "",
      attachments: req?.attachments ?? [], notes: form.notes ?? "",
      owner: form.requestingOfficer ?? "Current User",
      version: req ? `v${(parseFloat(req.version?.slice(1) ?? "1") + 0.1).toFixed(1)}` : "v1.0",
      createdAt: req?.createdAt ?? now, updatedAt: now,
      linkedPlanId: req?.linkedPlanId,
      complianceScore: submit ? 80 : 55,
    };
    onSave(saved);
    pushNotification(submit ? `Requisition submitted: ${saved.title}` : `Requisition saved: ${saved.title}`, submit ? "success" : "info");
  };

  const TABS = [
    { id: "header", label: "Header" }, { id: "items", label: `Items (${items.length})` },
    { id: "budget", label: "Budget" }, { id: "delivery", label: "Delivery" }, { id: "notes", label: "Notes" },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-black text-white">
          <div>
            <div className="text-sm font-bold">{req?.id ? "Edit Requisition" : "New Procurement Requisition"}</div>
            <div className="text-xs text-white/60">{req?.requisitionNumber ?? "Number auto-assigned"} · {form.currency} {totalCost.toLocaleString()}</div>
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex gap-0 border-b border-black/10 px-6 pt-3 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`px-4 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === t.id ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>
              {t.label} {t.id === "items" && errors.items ? <span className="text-red-500 ml-1">!</span> : null}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {activeTab === "header" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-black/70 mb-1 block">Requisition Title *</label>
                <input value={form.title ?? ""} onChange={e => set("title", e.target.value)}
                  className={`w-full h-9 px-3 rounded-lg border text-sm focus:outline-none ${errors.title ? "border-red-400" : "border-black/10"}`} />
                {errors.title && <p className="text-[10px] text-red-500 mt-0.5">{errors.title}</p>}
              </div>
              {([["ministry", "Ministry *", true], ["department", "Department *", true], ["requestingOfficer", "Requesting Officer *", true], ["requestingOfficerTitle", "Job Title", false]] as [keyof ProcurementRequisition, string, boolean][]).map(([k, lbl, req]) => (
                <div key={k}>
                  <label className="text-xs font-semibold text-black/70 mb-1 block">{lbl}</label>
                  {k === "ministry" ? (
                    <select value={(form[k] as string) ?? ""} onChange={e => set(k, e.target.value)}
                      className={`w-full h-9 px-3 rounded-lg border text-sm focus:outline-none ${errors[k] ? "border-red-400" : "border-black/10"}`}>
                      <option value="">Select…</option>
                      {ZIMBABWE_MINISTRIES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  ) : (
                    <input value={(form[k] as string) ?? ""} onChange={e => set(k, e.target.value)}
                      className={`w-full h-9 px-3 rounded-lg border text-sm focus:outline-none ${errors[k] ? "border-red-400" : "border-black/10"}`} />
                  )}
                  {errors[k] && <p className="text-[10px] text-red-500 mt-0.5">{errors[k]}</p>}
                </div>
              ))}
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
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-black/70 mb-1 block">Procurement Justification *</label>
                <textarea value={form.procurementJustification ?? ""} onChange={e => set("procurementJustification", e.target.value)} rows={3}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none resize-none ${errors.justification ? "border-red-400" : "border-black/10"}`} />
                {errors.justification && <p className="text-[10px] text-red-500 mt-0.5">{errors.justification}</p>}
              </div>
            </div>
          )}

          {activeTab === "items" && (
            <div className="space-y-3">
              {errors.items && <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{errors.items}</div>}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-black/3 text-[11px] text-black/50">
                    <tr>
                      {["#", "Description *", "Specifications", "Qty", "Unit", "Unit Cost (USD)", "Total", "Category", ""].map(h => (
                        <th key={h} className="text-left font-semibold px-2 py-2 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-2 py-1.5 text-black/40 font-bold w-8">{item.itemNo}</td>
                        <td className="px-2 py-1.5 min-w-[180px]">
                          <input value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)}
                            className="w-full h-7 px-2 rounded border border-black/10 text-xs focus:outline-none" placeholder="Item description" />
                        </td>
                        <td className="px-2 py-1.5 min-w-[160px]">
                          <input value={item.specifications} onChange={e => updateItem(item.id, "specifications", e.target.value)}
                            className="w-full h-7 px-2 rounded border border-black/10 text-xs focus:outline-none" placeholder="Technical specs" />
                        </td>
                        <td className="px-2 py-1.5 w-16">
                          <input type="number" min="1" value={item.quantity} onChange={e => updateItem(item.id, "quantity", Number(e.target.value))}
                            className="w-full h-7 px-2 rounded border border-black/10 text-xs focus:outline-none text-right" />
                        </td>
                        <td className="px-2 py-1.5 w-20">
                          <input value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)}
                            className="w-full h-7 px-2 rounded border border-black/10 text-xs focus:outline-none" />
                        </td>
                        <td className="px-2 py-1.5 w-28">
                          <input value={item.estimatedUnitCost} onChange={e => updateItem(item.id, "estimatedUnitCost", e.target.value)}
                            className="w-full h-7 px-2 rounded border border-black/10 text-xs focus:outline-none text-right" />
                        </td>
                        <td className="px-2 py-1.5 w-28 font-semibold text-black/70 text-right whitespace-nowrap">{item.totalCost}</td>
                        <td className="px-2 py-1.5 min-w-[120px]">
                          <select value={item.category} onChange={e => updateItem(item.id, "category", e.target.value)}
                            className="w-full h-7 px-2 rounded border border-black/10 text-xs focus:outline-none">
                            <option value="">Category…</option>
                            {PROCUREMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-1.5">
                          <button onClick={() => removeItem(item.id)} className="h-6 w-6 grid place-items-center rounded hover:bg-red-50 text-red-400">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between">
                <button onClick={addItem} className="h-8 px-3 rounded-lg border border-dashed border-black/20 text-xs font-medium text-black/60 hover:bg-black/3 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Item
                </button>
                <div className="text-sm font-bold text-black">
                  Total: {form.currency ?? "USD"} {totalCost.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {activeTab === "budget" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {([["budgetCode", "Budget Code"], ["costCentre", "Cost Centre"]] as [keyof ProcurementRequisition, string][]).map(([k, lbl]) => (
                <div key={k}>
                  <label className="text-xs font-semibold text-black/70 mb-1 block">{lbl}</label>
                  <input value={(form[k] as string) ?? ""} onChange={e => set(k, e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-black/70 mb-1 block">Funding Source</label>
                <select value={form.fundingSource ?? ""} onChange={e => set("fundingSource", e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none">
                  <option value="">Select…</option>
                  {FUNDING_SOURCES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Available Budget (USD)</label>
                <input value={form.budgetAvailable ?? ""} onChange={e => set("budgetAvailable", e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" placeholder="e.g. 1,500,000" />
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Currency</label>
                <select value={form.currency ?? "USD"} onChange={e => set("currency", e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none">
                  {["USD", "ZWG", "EUR"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {totalCost > 0 && form.budgetAvailable && (
                <div className="sm:col-span-2 p-3 rounded-xl border border-black/8 bg-black/3">
                  <div className="text-xs font-bold text-black mb-2">Budget Availability Check</div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div><div className="text-[10px] text-black/40">Available</div><div className="font-bold text-[#0F172A]">{form.currency} {form.budgetAvailable}</div></div>
                    <div><div className="text-[10px] text-black/40">Requisition Total</div><div className="font-bold text-black">{form.currency} {totalCost.toLocaleString()}</div></div>
                    <div><div className="text-[10px] text-black/40">Balance</div>
                      <div className={`font-bold ${(parseFloat((form.budgetAvailable ?? "0").replace(/,/g, "")) - totalCost) >= 0 ? "text-[#0F172A]" : "text-red-600"}`}>
                        {form.currency} {(parseFloat((form.budgetAvailable ?? "0").replace(/,/g, "")) - totalCost).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "delivery" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-black/70 mb-1 block">Delivery Address</label>
                <textarea value={form.deliveryAddress ?? ""} onChange={e => set("deliveryAddress", e.target.value)} rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Required Delivery Date</label>
                <input type="date" value={form.requiredDeliveryDate ?? ""} onChange={e => set("requiredDeliveryDate", e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-black/70 mb-1 block">Special Delivery Requirements</label>
                <textarea value={form.deliveryRequirements ?? ""} onChange={e => set("deliveryRequirements", e.target.value)} rows={3}
                  placeholder="Cold chain, special handling, phased delivery, etc."
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none resize-none" />
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-black/70 mb-1 block">Notes</label>
                <textarea value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} rows={5}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none resize-none" />
              </div>
              <div className="border-2 border-dashed border-black/10 rounded-xl p-6 text-center">
                <Upload className="h-7 w-7 text-black/20 mx-auto mb-2" />
                <div className="text-xs text-black/50 font-medium">Attach supporting documents</div>
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

// ─── Requisition Detail Panel ─────────────────────────────────────────────────
function ReqDetailPanel({ req, onAction, onClose }: {
  req: ProcurementRequisition;
  onAction: (a: "approve" | "reject" | "return" | "edit") => void;
  onClose: () => void;
}) {
  const [activePanel, setActivePanel] = useState<"details" | "items" | "compliance" | "docs" | "audit">("details");
  const budgetNum = parseFloat((req.budgetAvailable ?? "0").replace(/,/g, ""));
  const totalNum = parseFloat((req.totalEstimatedCost ?? "0").replace(/,/g, ""));
  const isBudgetOk = budgetNum >= totalNum;

  const compChecks = [
    { item: "Title provided", pass: !!req.title },
    { item: "Ministry & Department set", pass: !!req.ministry && !!req.department },
    { item: "Requesting officer identified", pass: !!req.requestingOfficer },
    { item: "At least one line item", pass: req.items.length > 0 },
    { item: "All items have descriptions", pass: req.items.every(i => !!i.description) },
    { item: "Budget availability confirmed", pass: !!req.budgetAvailable },
    { item: "Budget is sufficient", pass: isBudgetOk },
    { item: "Justification provided", pass: !!req.procurementJustification },
    { item: "Delivery date specified", pass: !!req.requiredDeliveryDate },
    { item: "Delivery address provided", pass: !!req.deliveryAddress },
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-[500px] max-w-full bg-white border-l border-black/10 shadow-2xl z-40 flex flex-col">
      <div className="px-5 py-3.5 border-b border-black/10 bg-black text-white flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[10px] font-bold text-white/60 uppercase">{req.requisitionNumber}</div>
          <div className="text-sm font-bold truncate">{req.title}</div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${PRIORITY_COLOR[req.priority]}`}>{req.priority}</span>
            <Badge tone={STATUS_TONE[req.status] ?? "muted"}>{req.status}</Badge>
            <span className="text-[10px] font-bold text-slate-500">{req.currency} {req.totalEstimatedCost}</span>
          </div>
        </div>
        <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-white/10 flex-shrink-0"><X className="h-4 w-4" /></button>
      </div>
      <div className="px-5 py-3 border-b border-black/10 bg-black/5">
        <WorkflowProgress stage={req.workflowStage} progress={req.workflowProgress} />
      </div>
      <div className="flex gap-0 border-b border-black/10 px-5 overflow-x-auto">
        {(["details", "items", "compliance", "docs", "audit"] as const).map(t => (
          <button key={t} onClick={() => setActivePanel(t)}
            className={`px-3 py-2 text-[11px] font-semibold whitespace-nowrap border-b-2 capitalize transition-colors ${activePanel === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 text-xs space-y-3">
        {activePanel === "details" && (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[["Ministry", req.ministry], ["Department", req.department], ["Requesting Officer", req.requestingOfficer], ["Job Title", req.requestingOfficerTitle], ["Financial Year", req.financialYear], ["Budget Code", req.budgetCode], ["Funding Source", req.fundingSource], ["Priority", req.priority], ["Required Delivery", req.requiredDeliveryDate]].map(([k, v]) => (
                <div key={k}><div className="text-[10px] text-black/40">{k}</div><div className="font-semibold text-black">{v || "—"}</div></div>
              ))}
            </div>
            <div className="p-3 rounded-xl border border-black/8 bg-black/3 grid grid-cols-3 gap-3 text-center">
              <div><div className="text-[10px] text-black/40">Total Cost</div><div className="font-bold text-black">{req.currency} {req.totalEstimatedCost}</div></div>
              <div><div className="text-[10px] text-black/40">Budget Available</div><div className={`font-bold ${isBudgetOk ? "text-[#0F172A]" : "text-red-600"}`}>{req.currency} {req.budgetAvailable}</div></div>
              <div><div className="text-[10px] text-black/40">Balance</div><div className={`font-bold ${isBudgetOk ? "text-[#0F172A]" : "text-red-600"}`}>{req.currency} {(budgetNum - totalNum).toLocaleString()}</div></div>
            </div>
            <div><div className="text-[10px] text-black/40 mb-0.5">Justification</div><div className="text-black/70">{req.procurementJustification || "—"}</div></div>
            {req.deliveryAddress && <div><div className="text-[10px] text-black/40 mb-0.5">Delivery Address</div><div className="text-black/70">{req.deliveryAddress}</div></div>}
            {req.deliveryRequirements && <div><div className="text-[10px] text-black/40 mb-0.5">Delivery Requirements</div><div className="text-black/70">{req.deliveryRequirements}</div></div>}
          </>
        )}
        {activePanel === "items" && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-black/3 text-[10px] text-black/50">
                <tr>{["#", "Description", "Qty", "Unit", "Unit Cost", "Total"].map(h => <th key={h} className="text-left px-2 py-1.5 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {req.items.map(i => (
                  <tr key={i.id} className="hover:bg-black/2">
                    <td className="px-2 py-2 text-black/40 font-bold">{i.itemNo}</td>
                    <td className="px-2 py-2">
                      <div className="font-medium text-black">{i.description}</div>
                      {i.specifications && <div className="text-[10px] text-black/40 mt-0.5">{i.specifications}</div>}
                    </td>
                    <td className="px-2 py-2 text-right">{i.quantity.toLocaleString()}</td>
                    <td className="px-2 py-2 text-black/60">{i.unit}</td>
                    <td className="px-2 py-2 text-right text-black/70">{i.estimatedUnitCost}</td>
                    <td className="px-2 py-2 text-right font-semibold text-black">{i.totalCost}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-black/10 bg-black/3">
                  <td colSpan={5} className="px-2 py-2 font-bold text-black text-right">TOTAL</td>
                  <td className="px-2 py-2 font-bold text-black text-right">{req.currency} {req.totalEstimatedCost}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        {activePanel === "compliance" && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-black">Compliance Score</span>
              <span className={`text-sm font-bold ${req.complianceScore >= 90 ? "text-[#0F172A]" : req.complianceScore >= 70 ? "text-[#0F172A]" : "text-red-600"}`}>{req.complianceScore}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/10 mb-4">
              <div className={`h-full rounded-full ${req.complianceScore >= 90 ? "bg-[#0F172A]" : req.complianceScore >= 70 ? "bg-[#0F172A]" : "bg-red-500"}`} style={{ width: `${req.complianceScore}%` }} />
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
        {activePanel === "docs" && (
          <div className="space-y-2">
            {req.attachments.length === 0 ? (
              <div className="text-center py-8 text-black/30"><FileText className="h-8 w-8 mx-auto mb-2 opacity-30" /><p>No documents</p></div>
            ) : (
              req.attachments.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 border border-black/8 rounded-lg">
                  <FileText className="h-4 w-4 text-slate-600 flex-shrink-0" />
                  <span className="flex-1 text-xs truncate">{d}</span>
                  <button className="h-6 w-6 grid place-items-center rounded hover:bg-black/5 text-black/40"><Download className="h-3.5 w-3.5" /></button>
                </div>
              ))
            )}
            <div className="border-2 border-dashed border-black/10 rounded-xl p-4 text-center">
              <button className="text-xs font-medium text-black/60 hover:text-black flex items-center gap-1.5 mx-auto"><Upload className="h-3.5 w-3.5" /> Upload Document</button>
            </div>
          </div>
        )}
        {activePanel === "audit" && (
          <div className="space-y-2">
            {[
              { user: req.requestingOfficer, action: "Submitted requisition", date: req.updatedAt, ip: "192.168.1.20" },
              { user: req.requestingOfficer, action: "Created requisition", date: req.createdAt, ip: "192.168.1.20" },
            ].map((a, i) => (
              <div key={i} className="p-2.5 border border-black/8 rounded-lg">
                <div className="flex justify-between"><span className="font-semibold text-black">{a.user}</span><span className="text-[10px] text-black/40">{a.date}</span></div>
                <div className="text-black/60 mt-0.5">{a.action}</div>
                <div className="text-[10px] text-black/30 mt-0.5">IP: {a.ip}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 py-3.5 border-t border-black/10 flex gap-2 flex-wrap">
        <button onClick={() => onAction("edit")} className="flex-1 h-8 rounded-lg border border-black/10 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-black/5">
          <Edit2 className="h-3.5 w-3.5" /> Edit
        </button>
        {req.status !== "Approved" && req.status !== "Rejected" && (
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
export default function ProcurementRequisitionPage() {
  const [reqs, setReqs] = useState<ProcurementRequisition[]>(SEED_REQUISITIONS);
  const [selected, setSelected] = useState<ProcurementRequisition | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editReq, setEditReq] = useState<ProcurementRequisition | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = reqs.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.requisitionNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalBudget = reqs.reduce((s, r) => s + parseFloat(r.totalEstimatedCost.replace(/,/g, "") || "0"), 0);

  const handleSave = (r: ProcurementRequisition) => {
    setReqs(prev => {
      const idx = prev.findIndex(x => x.id === r.id);
      return idx >= 0 ? prev.map(x => x.id === r.id ? r : x) : [...prev, r];
    });
    setShowForm(false); setEditReq(null); setSelected(r);
  };

  const handleAction = (action: "approve" | "reject" | "return" | "edit") => {
    if (!selected) return;
    if (action === "edit") { setEditReq(selected); setShowForm(true); return; }
    const updates = {
      approve: { status: "Approved" as const, workflowStage: "Approved" as const, workflowProgress: 100 },
      reject: { status: "Rejected" as const, workflowProgress: selected.workflowProgress },
      return: { status: "Returned" as const, workflowStage: "Draft" as const, workflowProgress: 0 },
    }[action];
    const updated = { ...selected, ...updates, updatedAt: new Date().toISOString().slice(0, 10) };
    setReqs(prev => prev.map(r => r.id === selected.id ? updated : r));
    setSelected(updated);
    pushNotification(`Requisition ${action}d: ${selected.title}`, action === "approve" ? "success" : "warning");
  };

  const kpis = [
    { label: "Total Requisitions", value: String(reqs.length) },
    { label: "Approved", value: String(reqs.filter(r => r.status === "Approved").length) },
    { label: "Under Review", value: String(reqs.filter(r => ["Under Review", "Submitted", "Supervisor Review", "Finance Verification", "Procurement Approval"].includes(r.workflowStage)).length) },
    { label: "Drafts", value: String(reqs.filter(r => r.status === "Draft").length) },
    { label: "Total Value (USD)", value: `$${(totalBudget / 1_000_000).toFixed(2)}M` },
    { label: "Avg Compliance", value: `${Math.round(reqs.reduce((s, r) => s + r.complianceScore, 0) / Math.max(reqs.length, 1))}%` },
  ];

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Procurement Requisition"
        financialYear="FY2026"
        pageType="form"
      />
      <div className="p-4 sm:p-6 max-w-[1800px] mx-auto">
        <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge tone="blue">Stage 2</Badge>
              <Badge tone="muted">Procurement Requisition</Badge>
            </div>
            <h1 className="text-2xl font-bold text-black tracking-tight">Requisition Workbench</h1>
            <p className="text-sm text-black/50 mt-1">Create, track and approve procurement requisitions with budget verification and workflow routing.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowAI(v => !v)} className={`h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${showAI ? "bg-[#0F172A] text-white border-slate-200" : "border-black/10 text-black/60 hover:bg-black/5"}`}>
              <Sparkles className="h-3.5 w-3.5" /> AI Assistant
            </button>
            <button onClick={() => { setEditReq(null); setShowForm(true); }} className="h-9 px-4 rounded-xl bg-black text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-800">
              <Plus className="h-3.5 w-3.5" /> New Requisition
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requisitions…"
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
                  {["PR Number", "Title", "Requesting Officer", "Items", "Total Cost", "Budget", "Priority", "Workflow Stage", "Compliance", "Status", ""].map(h => (
                    <th key={h} className="text-left font-semibold px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.length === 0 && (
                  <tr><td colSpan={11} className="text-center py-12 text-black/30 text-xs">No requisitions found.</td></tr>
                )}
                {filtered.map(req => {
                  const budgetNum = parseFloat(req.budgetAvailable.replace(/,/g, ""));
                  const totalNum = parseFloat(req.totalEstimatedCost.replace(/,/g, ""));
                  return (
                    <tr key={req.id} onClick={() => setSelected(req)} className="hover:bg-black/3 cursor-pointer transition-colors">
                      <td className="px-4 py-3 font-mono text-[11px] text-black/60 whitespace-nowrap">{req.requisitionNumber}</td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="font-semibold text-black text-xs truncate">{req.title}</div>
                        <div className="text-[10px] text-black/40 truncate">{req.department}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-black/70 whitespace-nowrap">{req.requestingOfficer}</td>
                      <td className="px-4 py-3 text-center font-semibold text-black">{req.items.length}</td>
                      <td className="px-4 py-3 font-semibold text-black whitespace-nowrap text-xs">{req.currency} {req.totalEstimatedCost}</td>
                      <td className="px-4 py-3">
                        <div className={`text-[10px] font-bold ${budgetNum >= totalNum ? "text-[#0F172A]" : "text-red-600"}`}>
                          {budgetNum >= totalNum ? "✓ Sufficient" : "✗ Shortfall"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PRIORITY_COLOR[req.priority]}`}>{req.priority}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-black/70 whitespace-nowrap">{req.workflowStage}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-14 h-1.5 rounded-full bg-black/8">
                            <div className={`h-full rounded-full ${req.complianceScore >= 90 ? "bg-[#0F172A]" : req.complianceScore >= 70 ? "bg-[#0F172A]" : "bg-red-500"}`} style={{ width: `${req.complianceScore}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-black/60">{req.complianceScore}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge tone={STATUS_TONE[req.status] ?? "muted"}>{req.status}</Badge></td>
                      <td className="px-4 py-3">
                        <button onClick={e => { e.stopPropagation(); setSelected(req); }} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-black/5 text-black/40">
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {selected && !showForm && <ReqDetailPanel req={selected} onAction={handleAction} onClose={() => setSelected(null)} />}
      {showForm && <RequisitionFormModal req={editReq} onSave={handleSave} onClose={() => { setShowForm(false); setEditReq(null); }} />}
      {showAI && <AIRequisitionAssistant req={selected} onClose={() => setShowAI(false)} />}
    </AppShell>
  );
}
