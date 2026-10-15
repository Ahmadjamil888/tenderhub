import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import LifecycleTower from "@/components/LifecycleTower";
import { CONTRACT_EXECUTION_STAGES } from "@/lib/lifecycle-stages";
import {
  type ContractExecution, type ContractMilestone, type ContractDeliverable,
  type PaymentCertificate, type ContractVariation, type ContractRisk,
  type SupplierPerformanceScore, type CommunicationLog,
  SEED_CONTRACT_EXECUTIONS,
} from "@/lib/procurement-workbench-data";
import { useAuth } from "@/lib/auth-context";
import { pushNotification, pushSeniorAlert } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import {
  Plus, Search, Sparkles, FileText, Eye, Check, X, ChevronRight,
  Download, Send, AlertTriangle, CheckCircle2, Clock, DollarSign,
  BarChart3, Users, Calendar, Shield, Star, RefreshCcw, Printer,
  Activity, TrendingUp, TrendingDown, Milestone, Target, FileSignature,
  MessageSquare, Bell, ChevronUp, ChevronDown, Layers,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  "In Progress": "bg-slate-100 text-[#0F172A]",
  "On Track":    "bg-slate-100 text-[#0F172A]",
  "At Risk":     "bg-slate-100 text-[#0F172A]",
  Delayed:       "bg-red-100 text-red-700",
  Completed:     "bg-slate-100 text-[#0F172A]",
  Suspended:     "bg-gray-100 text-gray-600",
  Terminated:    "bg-red-100 text-red-700",
  Mobilisation:  "bg-slate-100 text-[#0F172A]",
};

const MILESTONE_COLORS: Record<string, string> = {
  Completed: "text-[#0F172A] bg-slate-50",
  "On Track": "text-[#0F172A] bg-slate-50",
  "At Risk":  "text-[#0F172A] bg-slate-50",
  Delayed:    "text-red-600 bg-red-50",
  Pending:    "text-gray-500 bg-gray-50",
};

function ProgressRing({ value, size = 56, stroke = 5 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={value >= 80 ? "#475569" : value >= 50 ? "#334155" : "#64748B"} strokeWidth={stroke} strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
    </svg>
  );
}

// ─── AI Execution Assistant ───────────────────────────────────────────────────
function AIExecutionAssistant({ execution, onClose }: { execution: ContractExecution | null; onClose: () => void }) {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState<{ from: "ai" | "user"; text: string }[]>([
    { from: "ai", text: "I'm monitoring this contract in real time. I can predict delays, analyse performance, detect budget risks, recommend corrective actions, and generate executive summaries. How can I help?" },
  ]);
  const sendMsg = () => {
    if (!msg.trim()) return;
    const user = msg.trim(); setMsg("");
    setChat(c => [...c, { from: "user", text: user }]);
    setTimeout(() => {
      let reply = "Based on current contract data and procurement analytics, this contract is performing within acceptable parameters. Continue monitoring milestones and payment certificates closely.";
      if (user.toLowerCase().includes("delay") || user.toLowerCase().includes("progress")) reply = `Current progress: ${execution?.overallProgress ?? 0}%. Based on the milestone trajectory, I predict ${execution?.overallProgress && execution.overallProgress >= 50 ? "completion on schedule" : "a potential 2-3 week delay if current pace continues"}. Recommend reviewing the installation schedule for the next milestone.`;
      else if (user.toLowerCase().includes("budget") || user.toLowerCase().includes("cost")) reply = `Budget utilization is at ${execution?.budgetUtilization ?? 0}% against ${execution?.overallProgress ?? 0}% contract progress — indicating ${(execution?.budgetUtilization ?? 0) > (execution?.overallProgress ?? 0) ? "potential cost overrun risk. Recommend immediate review of payment certificates." : "healthy cost control."} No overrun detected at this stage.`;
      else if (user.toLowerCase().includes("risk")) reply = `Risk level: ${execution?.riskLevel ?? "Low"}. Key risks identified: connectivity issues at remote sites (Low impact), potential schedule pressure on final milestone. All risks within acceptable tolerance. No escalation required at this stage.`;
      else if (user.toLowerCase().includes("performance")) reply = `Supplier performance score: ${execution?.performanceScore?.overallRating?.toFixed(1) ?? "N/A"}/5. Strongest dimensions: compliance (${execution?.performanceScore?.compliance ?? 0}/5) and delivery performance (${execution?.performanceScore?.deliveryPerformance ?? 0}/5). Performance is above the minimum threshold of 3.5. No improvement notice required.`;
      else if (user.toLowerCase().includes("summary") || user.toLowerCase().includes("executive")) reply = `Executive Summary — ${execution?.contractTitle ?? "Contract"}: ${execution?.overallProgress ?? 0}% complete, ${execution?.status ?? "In Progress"}, budget utilization ${execution?.budgetUtilization ?? 0}%, ${execution?.milestones.filter(m => m.status === "Completed").length ?? 0} of ${execution?.milestones.length ?? 0} milestones complete. ${execution?.risks.filter(r => r.monitoringStatus === "Escalated").length ?? 0} escalated risks. Overall assessment: SATISFACTORY.`;
      setChat(c => [...c, { from: "ai", text: reply }]);
    }, 700);
  };
  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-black/10 shadow-2xl z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 bg-black text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <div>
            <div className="text-xs font-bold">Contract Execution AI</div>
            <div className="text-[10px] text-white/60">Live Contract Monitor</div>
          </div>
        </div>
        <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-white/10"><X className="h-4 w-4" /></button>
      </div>
      {execution && (
        <div className="px-4 py-2.5 bg-black/5 border-b border-black/8">
          <div className="text-[10px] font-semibold text-black/60 uppercase tracking-wide mb-1">Monitoring</div>
          <div className="text-xs font-semibold text-black truncate">{execution.contractTitle}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-black/50">{execution.overallProgress}% complete</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${execution.riskLevel === "Low" ? "bg-slate-100 text-[#0F172A]" : execution.riskLevel === "Medium" ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-700"}`}>{execution.riskLevel} Risk</span>
          </div>
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
        <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMsg()} placeholder="Ask about execution…" className="flex-1 h-8 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
        <button onClick={sendMsg} className="h-8 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800"><Send className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

// ─── Execution Detail Panel ───────────────────────────────────────────────────
function ExecutionDetailPanel({ ex, onClose, onUpdate }: {
  ex: ContractExecution; onClose: () => void; onUpdate: (patch: Partial<ContractExecution>) => void;
}) {
  type DetailTab = "Overview" | "Milestones" | "Deliverables" | "Payments" | "Variations" | "Performance" | "Risks" | "Communications";
  const [tab, setTab] = useState<DetailTab>("Overview");

  const completeMilestone = (id: string) => {
    const updated = ex.milestones.map(m =>
      m.id === id ? { ...m, status: "Completed" as const, actualDate: new Date().toISOString().split("T")[0], completionPercent: 100 } : m
    );
    const completedCount = updated.filter(m => m.status === "Completed").length;
    const progress = Math.round((completedCount / updated.length) * 100);
    onUpdate({ milestones: updated, overallProgress: progress });
    pushNotification(`Milestone completed on ${ex.contractNumber}`, "success");
    toast("Milestone marked as completed", "success");
  };

  const approvePayment = (id: string) => {
    const updated = ex.payments.map(p =>
      p.id === id ? { ...p, status: "Paid" as const, paymentDate: new Date().toISOString().split("T")[0] } : p
    );
    onUpdate({ payments: updated });
    pushSeniorAlert(`Payment approved on contract ${ex.contractNumber}`, "success");
    toast("Payment approved and released", "success");
  };

  const totalPaid = ex.payments.filter(p => p.status === "Paid").reduce((s, p) => s + parseFloat(p.netPayment.replace(/,/g, "") || "0"), 0);
  const totalRetention = ex.payments.reduce((s, p) => s + parseFloat(p.retention.replace(/,/g, "") || "0"), 0);
  const progressData = ex.milestones.map((m, i) => ({ name: m.milestoneName.slice(0, 15) + "…", plan: 100, actual: m.completionPercent }));

  const DETAIL_TABS: DetailTab[] = ["Overview", "Milestones", "Deliverables", "Payments", "Variations", "Performance", "Risks", "Communications"];

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-5xl shadow-2xl max-h-[94vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/8 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold">{ex.contractTitle}</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[ex.status] ?? "bg-gray-100 text-gray-600"}`}>{ex.status}</span>
            </div>
            <div className="text-xs text-black/40 mt-0.5">{ex.contractNumber} · {ex.supplierName} · {ex.ministry}</div>
          </div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EAF1F8]"><X className="h-4 w-4" /></button>
        </div>
        <div className="px-5 pt-2 border-b border-black/8 flex-shrink-0 overflow-x-auto scrollbar-none">
          <div className="flex gap-1">
            {DETAIL_TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors flex-shrink-0
                  ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-5">

          {tab === "Overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#EAF1F8] rounded-xl p-3 flex items-center gap-3">
                  <div className="relative"><ProgressRing value={ex.overallProgress} /><span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{ex.overallProgress}%</span></div>
                  <div><div className="text-[10px] text-black/40">Progress</div><div className="text-xs font-bold text-black">Overall</div></div>
                </div>
                <div className="bg-[#EAF1F8] rounded-xl p-3 flex items-center gap-3">
                  <div className="relative"><ProgressRing value={ex.budgetUtilization} size={56} stroke={5} /><span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{ex.budgetUtilization}%</span></div>
                  <div><div className="text-[10px] text-black/40">Budget</div><div className="text-xs font-bold text-black">Utilisation</div></div>
                </div>
                <div className="bg-[#EAF1F8] rounded-xl p-3">
                  <div className="text-[10px] text-black/40 mb-1">Milestones</div>
                  <div className="text-lg font-bold text-black">{ex.milestones.filter(m => m.status === "Completed").length}<span className="text-xs font-normal text-black/40">/{ex.milestones.length}</span></div>
                  <div className="text-[10px] text-black/40">completed</div>
                </div>
                <div className="bg-[#EAF1F8] rounded-xl p-3">
                  <div className="text-[10px] text-black/40 mb-1">Compliance</div>
                  <div className={`text-lg font-bold ${ex.complianceScore >= 90 ? "text-[#0F172A]" : ex.complianceScore >= 70 ? "text-[#0F172A]" : "text-red-600"}`}>{ex.complianceScore}%</div>
                  <div className="text-[10px] text-black/40">score</div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Contract Number", value: ex.contractNumber },
                  { label: "Supplier", value: ex.supplierName },
                  { label: "Contract Value", value: `${ex.currency} ${ex.contractValue}` },
                  { label: "Start Date", value: ex.startDate },
                  { label: "End Date", value: ex.endDate },
                  { label: "Project Manager", value: ex.projectManager },
                  { label: "Contract Manager", value: ex.contractManager },
                  { label: "Risk Level", value: ex.riskLevel },
                  { label: "Total Paid", value: `USD ${totalPaid.toLocaleString()}` },
                ].map(f => (
                  <div key={f.label} className="bg-[#EAF1F8] rounded-xl p-3">
                    <div className="text-[10px] text-black/40 uppercase tracking-wide mb-0.5">{f.label}</div>
                    <div className="text-xs font-semibold text-black">{f.value}</div>
                  </div>
                ))}
              </div>
              {ex.aiRecommendations.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-black/60 uppercase tracking-wide mb-2">AI Recommendations</div>
                  <div className="space-y-2">
                    {ex.aiRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#0F172A] mt-0.5 flex-shrink-0" />
                        <span className="text-[#0F172A]">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "Milestones" && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-black/60 uppercase tracking-wide mb-3">Milestone Tracking</div>
              {ex.milestones.map(ms => (
                <div key={ms.id} className="border border-black/8 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-7 w-7 rounded-full grid place-items-center flex-shrink-0 text-xs font-bold ${MILESTONE_COLORS[ms.status] ?? "bg-gray-50 text-gray-500"}`}>
                      {ms.status === "Completed" ? <Check className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-black">{ms.milestoneName}</span>
                        <Badge tone={ms.status === "Completed" ? "green" : ms.status === "On Track" ? "blue" : ms.status === "At Risk" ? "amber" : ms.status === "Delayed" ? "red" : "muted"}>{ms.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-[10px] text-black/40">
                        <span>Planned: {ms.plannedDate}</span>
                        {ms.actualDate && <span>Actual: {ms.actualDate}</span>}
                        <span>{ms.responsibleOfficer}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-black/8 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${ms.completionPercent >= 100 ? "bg-[#0F172A]" : ms.status === "Delayed" ? "bg-red-500" : "bg-[#0F172A]"}`} style={{ width: `${ms.completionPercent}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-black/60 w-8 text-right">{ms.completionPercent}%</span>
                      </div>
                      {ms.comments && <div className="mt-1.5 text-[10px] text-black/50 italic">{ms.comments}</div>}
                    </div>
                  </div>
                  {ms.status !== "Completed" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-black/5">
                      <button onClick={() => completeMilestone(ms.id)} className="h-7 px-3 rounded-lg bg-black text-white text-[10px] flex items-center gap-1"><Check className="h-3 w-3" /> Mark Complete</button>
                      <button className="h-7 px-3 rounded-lg border border-black/10 text-[10px] hover:bg-[#EAF1F8] flex items-center gap-1"><FileText className="h-3 w-3" /> Upload Document</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === "Deliverables" && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-black/60 uppercase tracking-wide mb-3">Deliverables Management</div>
              {ex.deliverables.map(del => (
                <div key={del.id} className="border border-black/8 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-black">{del.deliverableName}</div>
                      <div className="text-[10px] text-black/40 mt-0.5">Due: {del.dueDate} {del.submissionDate && `· Submitted: ${del.submissionDate}`}</div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {[
                          { label: "Review", value: del.reviewStatus },
                          { label: "Approval", value: del.approvalStatus },
                          { label: "Quality", value: del.qualityStatus },
                          { label: "Acceptance", value: del.acceptanceStatus },
                        ].map(s => (
                          <span key={s.label} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.value === "Approved" || s.value === "Accepted" || s.value === "Passed" ? "bg-slate-100 text-[#0F172A]" : s.value === "Rejected" || s.value === "Failed" ? "bg-red-100 text-red-700" : s.value === "Reviewed" ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-600"}`}>
                            {s.label}: {s.value}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button className="h-7 px-2.5 rounded-lg border border-black/10 text-[10px] hover:bg-[#EAF1F8] flex items-center gap-1"><Download className="h-3 w-3" /> Docs ({del.documents.length})</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "Payments" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-[#0F172A]">USD {totalPaid.toLocaleString()}</div>
                  <div className="text-[10px] text-[#0F172A]">Total Paid</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-[#0F172A]">USD {totalRetention.toLocaleString()}</div>
                  <div className="text-[10px] text-[#0F172A]">Retention Held</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-[#0F172A]">{ex.payments.length}</div>
                  <div className="text-[10px] text-[#0F172A]">Certificates</div>
                </div>
              </div>
              {ex.payments.map(pay => (
                <div key={pay.id} className="border border-black/8 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-xs font-semibold text-black">{pay.certificateNumber} — Invoice {pay.invoiceNumber}</div>
                      <div className="text-[10px] text-black/40">Invoice Date: {pay.invoiceDate} {pay.paymentDate && `· Payment Date: ${pay.paymentDate}`}</div>
                    </div>
                    <Badge tone={pay.status === "Paid" ? "green" : pay.status === "Approved" ? "blue" : pay.status === "Rejected" ? "red" : "amber"}>{pay.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {[
                      { label: "Payment Request", value: `USD ${pay.paymentRequest}` },
                      { label: "Approved Amount", value: `USD ${pay.approvedAmount}` },
                      { label: "Retention", value: `USD ${pay.retention}` },
                      { label: "Net Payment", value: `USD ${pay.netPayment}` },
                    ].map(f => (
                      <div key={f.label} className="bg-[#EAF1F8] rounded-lg p-2">
                        <div className="text-[10px] text-black/40">{f.label}</div>
                        <div className="font-semibold text-black">{f.value}</div>
                      </div>
                    ))}
                  </div>
                  {pay.status !== "Paid" && pay.status !== "Rejected" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-black/5">
                      <button onClick={() => approvePayment(pay.id)} className="h-7 px-3 rounded-lg bg-black text-white text-[10px] flex items-center gap-1"><Check className="h-3 w-3" /> Approve & Release</button>
                    </div>
                  )}
                  {pay.isFinal && <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#0F172A] bg-slate-50 px-2 py-0.5 rounded-full"><Star className="h-3 w-3" /> Final Payment</span>}
                </div>
              ))}
            </div>
          )}

          {tab === "Variations" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-black/60 uppercase tracking-wide">Contract Variations</div>
                <button className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1"><Plus className="h-3 w-3" /> New Variation</button>
              </div>
              {ex.variations.length === 0 ? (
                <div className="text-center py-12 text-black/30 text-xs">No variations raised on this contract.</div>
              ) : (
                ex.variations.map(v => (
                  <div key={v.id} className="border border-black/8 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold">{v.variationNumber} — {v.variationType}</div>
                        <div className="text-[10px] text-black/50 mt-0.5">{v.description}</div>
                        <div className="flex gap-4 mt-2 text-[10px] text-black/40">
                          <span>Original: USD {v.originalContractValue}</span>
                          <span>Revised: USD {v.revisedContractValue}</span>
                        </div>
                      </div>
                      <Badge tone={v.status === "Approved" ? "green" : v.status === "Rejected" ? "red" : "amber"}>{v.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "Performance" && (
            <div className="space-y-5">
              <div className="text-xs font-semibold text-black/60 uppercase tracking-wide">Supplier Performance Evaluation</div>
              {ex.performanceScore ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Quality", value: ex.performanceScore.quality },
                      { label: "Cost Control", value: ex.performanceScore.costControl },
                      { label: "Delivery", value: ex.performanceScore.deliveryPerformance },
                      { label: "Responsiveness", value: ex.performanceScore.responsiveness },
                      { label: "Compliance", value: ex.performanceScore.compliance },
                      { label: "Communication", value: ex.performanceScore.communication },
                      { label: "Innovation", value: ex.performanceScore.innovation },
                      { label: "Overall Rating", value: ex.performanceScore.overallRating },
                    ].map(s => (
                      <div key={s.label} className="bg-[#EAF1F8] rounded-xl p-3 text-center">
                        <div className="text-[10px] text-black/40 mb-1">{s.label}</div>
                        <div className={`text-xl font-bold ${s.value >= 4 ? "text-[#0F172A]" : s.value >= 3 ? "text-[#0F172A]" : "text-red-600"}`}>{s.value.toFixed(1)}</div>
                        <div className="flex justify-center gap-0.5 mt-1">
                          {[1,2,3,4,5].map(n => <Star key={n} className={`h-2.5 w-2.5 ${n <= Math.round(s.value) ? "text-slate-500 fill-amber-400" : "text-gray-200"}`} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-[#EAF1F8] rounded-xl p-4">
                    <div className="text-[10px] text-black/40 mb-1">Evaluator Comments</div>
                    <div className="text-xs text-black">{ex.performanceScore.comments}</div>
                    <div className="text-[10px] text-black/40 mt-1">Evaluated by {ex.performanceScore.evaluatedBy} on {ex.performanceScore.evaluatedAt}</div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-black/30 text-xs">No performance evaluation recorded yet.</div>
              )}
            </div>
          )}

          {tab === "Risks" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-black/60 uppercase tracking-wide">Risk Register</div>
                <button className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1"><Plus className="h-3 w-3" /> Log Risk</button>
              </div>
              {ex.risks.length === 0 ? (
                <div className="text-center py-12 text-black/30 text-xs">No risks logged on this contract.</div>
              ) : ex.risks.map(risk => (
                <div key={risk.id} className="border border-black/8 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold">{risk.riskDescription}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${risk.riskScore >= 12 ? "bg-red-100 text-red-700" : risk.riskScore >= 6 ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>Score: {risk.riskScore}</span>
                      </div>
                      <div className="text-[10px] text-black/50">Category: {risk.riskCategory} · Probability: {risk.probability} · Impact: {risk.impact}</div>
                      <div className="text-[10px] text-black/60 mt-1 italic">Mitigation: {risk.mitigationPlan}</div>
                    </div>
                    <Badge tone={risk.monitoringStatus === "Escalated" ? "red" : risk.monitoringStatus === "Mitigating" ? "amber" : risk.monitoringStatus === "Closed" ? "green" : "muted"}>{risk.monitoringStatus}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "Communications" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-black/60 uppercase tracking-wide">Communication Log</div>
                <button className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1"><Plus className="h-3 w-3" /> Add Message</button>
              </div>
              {ex.communications.map(comm => (
                <div key={comm.id} className="border border-black/8 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-full grid place-items-center flex-shrink-0 text-xs font-bold ${comm.type === "Supplier" ? "bg-slate-100 text-[#0F172A]" : comm.type === "Internal" ? "bg-gray-100 text-gray-600" : "bg-slate-100 text-[#0F172A]"}`}>
                      {comm.from.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-semibold">{comm.subject}</div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${comm.type === "Supplier" ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-600"}`}>{comm.type}</span>
                      </div>
                      <div className="text-[10px] text-black/40">{comm.from} → {comm.to} · {comm.timestamp}</div>
                      <div className="text-xs text-black/70 mt-1 leading-relaxed">{comm.content}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── Monitoring Dashboard ─────────────────────────────────────────────────────
function MonitoringDashboard({ executions }: { executions: ContractExecution[] }) {
  const allMilestones = executions.flatMap(e => e.milestones);
  const allRisks = executions.flatMap(e => e.risks);
  const progressData = executions.map(e => ({ name: e.contractNumber, planned: 100, actual: e.overallProgress, budget: e.budgetUtilization }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-black/8 rounded-2xl p-4">
          <div className="text-xs text-black/40 mb-1">Active Contracts</div>
          <div className="text-2xl font-bold">{executions.filter(e => e.status === "In Progress").length}</div>
          <div className="text-[10px] text-black/40">{executions.length} total</div>
        </div>
        <div className="bg-white border border-black/8 rounded-2xl p-4">
          <div className="text-xs text-black/40 mb-1">Avg Progress</div>
          <div className="text-2xl font-bold text-[#0F172A]">{Math.round(executions.reduce((s, e) => s + e.overallProgress, 0) / Math.max(executions.length, 1))}%</div>
          <div className="text-[10px] text-black/40">overall completion</div>
        </div>
        <div className="bg-white border border-black/8 rounded-2xl p-4">
          <div className="text-xs text-black/40 mb-1">Delayed Milestones</div>
          <div className="text-2xl font-bold text-red-500">{allMilestones.filter(m => m.status === "Delayed").length}</div>
          <div className="text-[10px] text-black/40">require attention</div>
        </div>
        <div className="bg-white border border-black/8 rounded-2xl p-4">
          <div className="text-xs text-black/40 mb-1">Critical Risks</div>
          <div className="text-2xl font-bold text-slate-600">{allRisks.filter(r => r.riskScore >= 12).length}</div>
          <div className="text-[10px] text-black/40">risk register</div>
        </div>
      </div>

      <Card>
        <CardHeader title="Contract Progress vs Budget" subtitle="Planned progress vs actual vs budget utilisation" />
        <div className="px-4 pb-4 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={progressData} barSize={20}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11 }} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="actual" fill="#334155" radius={[3,3,0,0]} name="Progress %" />
              <Bar dataKey="budget" fill="#475569" radius={[3,3,0,0]} name="Budget %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Upcoming Milestones" subtitle="Next 30 days" />
          <div className="divide-y divide-black/5">
            {allMilestones.filter(m => m.status !== "Completed").slice(0, 5).map(ms => (
              <div key={ms.id} className="px-4 py-3 flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${ms.status === "Delayed" ? "bg-red-500" : ms.status === "At Risk" ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{ms.milestoneName}</div>
                  <div className="text-[10px] text-black/40">{ms.plannedDate}</div>
                </div>
                <span className={`text-[10px] font-medium ${ms.status === "Delayed" ? "text-red-600" : ms.status === "At Risk" ? "text-[#0F172A]" : "text-[#0F172A]"}`}>{ms.status}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Risk Alerts" subtitle="Active risks requiring attention" />
          <div className="divide-y divide-black/5">
            {allRisks.filter(r => r.monitoringStatus !== "Closed").slice(0, 5).map(r => (
              <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${r.riskScore >= 12 ? "text-red-500" : r.riskScore >= 6 ? "text-slate-600" : "text-[#0F172A]"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{r.riskDescription}</div>
                  <div className="text-[10px] text-black/40">{r.riskCategory} · Score: {r.riskScore}</div>
                </div>
                <Badge tone={r.monitoringStatus === "Escalated" ? "red" : r.monitoringStatus === "Mitigating" ? "amber" : "muted"}>{r.monitoringStatus}</Badge>
              </div>
            ))}
            {allRisks.filter(r => r.monitoringStatus !== "Closed").length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-black/30">No active risks</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
type Tab = "Executions" | "Dashboard" | "Lifecycle Tower" | "Reports";

export default function ContractExecutionWorkbenchPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("Executions");
  const [executions, setExecutions] = useState<ContractExecution[]>(SEED_CONTRACT_EXECUTIONS);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContractExecution | null>(null);
  const [showAI, setShowAI] = useState(false);

  const filtered = executions.filter(e =>
    e.contractTitle.toLowerCase().includes(search.toLowerCase()) ||
    e.contractNumber.toLowerCase().includes(search.toLowerCase()) ||
    e.supplierName.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdate = (id: string, patch: Partial<ContractExecution>) => {
    setExecutions(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
    setSelected(prev => prev?.id === id ? { ...prev, ...patch } as ContractExecution : prev);
  };

  const downloadReport = (type: string) => {
    const content = [
      `CONTRACT EXECUTION ${type.toUpperCase()} REPORT`,
      `Generated: ${new Date().toLocaleString()}`,
      "",
      ...executions.map(e => [
        `Contract: ${e.contractNumber} | ${e.contractTitle}`,
        `Supplier: ${e.supplierName} | Value: ${e.currency} ${e.contractValue}`,
        `Progress: ${e.overallProgress}% | Budget: ${e.budgetUtilization}% | Risk: ${e.riskLevel}`,
        `Milestones: ${e.milestones.filter(m => m.status === "Completed").length}/${e.milestones.length} complete`,
        "",
      ].join("\n")),
      "AI Powered Electronic Public Procurement and Oversight Intelligence System · Government of Zimbabwe",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `execution-${type.toLowerCase()}-report.txt`; a.click();
    URL.revokeObjectURL(url);
    pushNotification(`${type} Report downloaded`, "success");
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Contract Management"
        process="Contract Execution Workbench"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Stage 12 — Contract Execution Workbench</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
          <Badge tone="green">Live Monitoring</Badge>
        </div>
        <PageHeader
          title="Contract Execution Workbench"
          description="Complete contract execution: milestones, deliverables, payments, variations, performance, risks, communications, and monitoring dashboard."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Active Contracts" value={String(executions.filter(e => e.status === "In Progress").length)} delta={`${executions.length} total`} />
          <KpiCard label="Avg Progress" value={`${Math.round(executions.reduce((s, e) => s + e.overallProgress, 0) / Math.max(executions.length, 1))}%`} delta="overall completion" />
          <KpiCard label="At Risk" value={String(executions.filter(e => e.riskLevel !== "Low").length)} delta="requires review" positive={false} />
          <KpiCard label="Avg Compliance" value={`${Math.round(executions.reduce((s, e) => s + e.complianceScore, 0) / Math.max(executions.length, 1))}%`} delta="compliance score" />
        </div>

        <div className="flex gap-1 mb-5 border-b border-black/8 overflow-x-auto scrollbar-none">
          {(["Executions", "Dashboard", "Lifecycle Tower", "Reports"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors flex-shrink-0
                ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}</button>
          ))}
        </div>

        {tab === "Dashboard" && <MonitoringDashboard executions={executions} />}

        {tab === "Lifecycle Tower" && (
          <LifecycleTower
            title="Contract Execution Lifecycle — 8 Stages"
            subtitle="From activation through completion and handover. Click any stage for full toolset."
            stages={CONTRACT_EXECUTION_STAGES}
            context="Contract Execution"
            badgeLabel="8 Stages · Execution Process"
          />
        )}

        {tab === "Reports" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["Contract Summary", "Progress Report", "Milestone Report", "Performance Report", "Payment Report", "Risk Report", "Compliance Report", "Variation Report", "Financial Summary"].map(rpt => (
              <div key={rpt} className="border border-black/8 rounded-2xl p-4 hover:bg-[#EAF1F8] transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 bg-black rounded-xl grid place-items-center"><FileText className="h-5 w-5 text-white" /></div>
                  <div>
                    <div className="text-sm font-semibold">{rpt}</div>
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

        {tab === "Executions" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contracts…" className="w-full h-9 pl-9 pr-4 rounded-xl border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <button onClick={() => setShowAI(true)} className="h-9 px-3 rounded-xl border border-black/10 text-xs flex items-center gap-1.5 hover:bg-[#EAF1F8]"><Sparkles className="h-3.5 w-3.5" /> AI Monitor</button>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-black/30 text-sm">No contract executions found.</div>
            )}

            <div className="space-y-4">
              {filtered.map(ex => {
                const completedMs = ex.milestones.filter(m => m.status === "Completed").length;
                const totalMs = ex.milestones.length;
                const paidPayments = ex.payments.filter(p => p.status === "Paid").length;
                return (
                  <div key={ex.id} className="border border-black/8 rounded-2xl overflow-hidden hover:border-black/15 transition-all">
                    <div className="px-4 sm:px-5 py-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[10px] font-mono text-black/40">{ex.contractNumber}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[ex.status] ?? "bg-gray-100 text-gray-600"}`}>{ex.status}</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ex.riskLevel === "Low" ? "bg-slate-50 text-[#0F172A] border-slate-200" : ex.riskLevel === "High" || ex.riskLevel === "Critical" ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-50 text-[#0F172A] border-slate-200"}`}>{ex.riskLevel} Risk</span>
                          </div>
                          <div className="text-sm font-bold text-black">{ex.contractTitle}</div>
                          <div className="text-xs text-black/50 mt-0.5">{ex.supplierName} · {ex.ministry}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-base font-bold">{ex.currency} {ex.contractValue}</div>
                          <div className="text-[10px] text-black/40">{ex.startDate} → {ex.endDate}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-black/40 mb-1"><span>Progress</span><span className="font-bold text-black">{ex.overallProgress}%</span></div>
                          <div className="h-1.5 rounded-full bg-black/8 overflow-hidden"><div className="h-full rounded-full bg-[#0F172A] transition-all" style={{ width: `${ex.overallProgress}%` }} /></div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-black/40 mb-1"><span>Budget</span><span className="font-bold text-black">{ex.budgetUtilization}%</span></div>
                          <div className="h-1.5 rounded-full bg-black/8 overflow-hidden"><div className={`h-full rounded-full transition-all ${ex.budgetUtilization > ex.overallProgress ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} style={{ width: `${ex.budgetUtilization}%` }} /></div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-black/40 mb-1"><span>Compliance</span><span className={`font-bold ${ex.complianceScore >= 90 ? "text-[#0F172A]" : "text-[#0F172A]"}`}>{ex.complianceScore}%</span></div>
                          <div className="h-1.5 rounded-full bg-black/8 overflow-hidden"><div className={`h-full rounded-full transition-all ${ex.complianceScore >= 90 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} style={{ width: `${ex.complianceScore}%` }} /></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => setSelected(ex)} className="h-7 px-3 rounded-lg bg-black text-white text-[10px] font-medium hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3" /> View Details</button>
                          <button onClick={() => setSelected(ex)} className="h-7 px-3 rounded-lg border border-black/10 text-[10px] hover:bg-[#EAF1F8] flex items-center gap-1"><Layers className="h-3 w-3" /> Milestones ({completedMs}/{totalMs})</button>
                          <button onClick={() => setSelected(ex)} className="h-7 px-3 rounded-lg border border-black/10 text-[10px] hover:bg-[#EAF1F8] flex items-center gap-1"><DollarSign className="h-3 w-3" /> Payments ({paidPayments})</button>
                          {ex.risks.filter(r => r.monitoringStatus === "Escalated").length > 0 && (
                            <button className="h-7 px-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-[10px] hover:bg-red-100 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> {ex.risks.filter(r => r.monitoringStatus === "Escalated").length} Risk Alert
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-black/30">{ex.projectManager}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selected && <ExecutionDetailPanel ex={selected} onClose={() => setSelected(null)} onUpdate={(patch) => handleUpdate(selected.id, patch)} />}
      {showAI && <AIExecutionAssistant execution={selected ?? (executions[0] ?? null)} onClose={() => setShowAI(false)} />}
    </AppShell>
  );
}
