/**
 * Role-specific dashboards for all remaining roles.
 * Each dashboard shows ONLY what that role needs — no senior-level data visible.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import { tenders, contracts, vendors } from "@/lib/mock-data";
import { useRFQs } from "@/hooks/use-store";
import { pushNotification } from "@/lib/local-store";
import {
  FileText, CheckCircle2, Clock, AlertTriangle, Shield, DollarSign,
  Users, TrendingUp, Briefcase, Search, Download, Package,
  BookOpen, Gavel, Settings, Activity, BarChart3, Wrench,
  Leaf, Heart, Star, Globe2, Archive, Zap, Eye,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

/* ─── Shared helpers ─────────────────────────────────────────────────────── */
import { toast } from "@/lib/toast";
function act(msg: string) { pushNotification(msg, "success"); toast(msg, "success"); }

/* ════════════════════════════════════════════════════════════════════════════
   CONTRACT MANAGER — manage active contracts, milestones, variations
════════════════════════════════════════════════════════════════════════════ */
export function ContractManagerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"Contracts" | "Milestones" | "Variations">("Contracts");

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="System"
        process="Role-Based Dashboard"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader title={`Contract Manager — ${user?.name}`} description="Manage active contracts, milestones, variations, and performance." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Active Contracts" value={String(contracts.length)} delta="Under management" icon={FileText} color="blue" />
          <KpiCard label="On Track" value={String(contracts.filter(c => c.status === "On Track").length)} delta="All milestones met" icon={CheckCircle2} color="green" />
          <KpiCard label="At Risk" value={String(contracts.filter(c => c.status === "At Risk").length)} delta="Needs attention" positive={false} icon={AlertTriangle} color="red" />
          <KpiCard label="Variations Pending" value="4" delta="Awaiting approval" icon={Clock} color="amber" />
        </div>
        <div className="flex gap-1 mb-5 border-b border-black/10 overflow-x-auto">
          {(["Contracts","Milestones","Variations"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}</button>
          ))}
        </div>
        {tab === "Contracts" && (
          <Card>
            <CardHeader title="My Contracts" />
            <div className="divide-y divide-black/5">
              {contracts.map(c => (
                <div key={c.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div><div className="text-sm font-semibold text-black">{c.title}</div>
                      <div className="text-xs text-black/40">{c.id} · {c.vendor} · {c.value}</div></div>
                    <Badge tone={c.status === "Completed" ? "green" : c.status === "At Risk" ? "amber" : "blue"}>{c.status}</Badge>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-1">
                    <div className={`h-full rounded-full transition-all ${c.status === "At Risk" ? "bg-[#0F172A]" : "bg-black"}`} style={{ width: `${c.progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-black/40">
                    <span>{c.progress}% complete</span><span>Ends {c.end}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => act(`Milestone updated for ${c.id}`)} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800">Update Milestone</button>
                    <button onClick={() => act(`Variation logged for ${c.id}`)} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-gray-100">Log Variation</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
        {tab === "Milestones" && (
          <div className="space-y-3">
            {contracts.map(c => (
              <div key={c.id} className="bg-white border border-black/10 rounded-2xl p-4">
                <div className="text-sm font-semibold text-black mb-3">{c.title}</div>
                {["Mobilisation", "Interim Delivery", "Practical Completion", "Final Acceptance"].map((m, i) => (
                  <div key={m} className="flex items-center gap-3 mb-2">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${i < Math.ceil(c.progress / 25) ? "bg-black" : "bg-gray-200 text-gray-400"}`}>{i + 1}</div>
                    <span className={`text-sm ${i < Math.ceil(c.progress / 25) ? "text-black line-through text-black/40" : "text-black"}`}>{m}</span>
                    {i < Math.ceil(c.progress / 25) && <Badge tone="green">Done</Badge>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {tab === "Variations" && (
          <div className="space-y-3">
            {[
              { ref: "VAR-2026-012", contract: "CN-2026-0411", type: "Scope Extension", value: "+USD 2.4M", status: "Pending Approval" },
              { ref: "VAR-2026-011", contract: "CN-2026-0404", type: "Time Extension", value: "+45 days", status: "Approved" },
              { ref: "VAR-2026-010", contract: "CN-2026-0399", type: "Price Adjustment", value: "+USD 480K", status: "Rejected" },
            ].map(v => (
              <div key={v.ref} className="bg-white border border-black/10 rounded-2xl px-5 py-4 flex items-center justify-between">
                <div><div className="text-sm font-semibold text-black">{v.type}</div>
                  <div className="text-xs text-black/40">{v.ref} · {v.contract} · {v.value}</div></div>
                <div className="flex items-center gap-2">
                  <Badge tone={v.status === "Approved" ? "green" : v.status === "Rejected" ? "red" : "amber"}>{v.status}</Badge>
                  {v.status === "Pending Approval" && (
                    <button onClick={() => act(`Variation ${v.ref} submitted for approval`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800">Submit</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <AIAssistantPanel agentName="Contract AI" agentRole="Variation analysis, milestone tracking" context="contract management" color="blue" suggestedPrompts={["Analyse variation risk","Draft extension justification","Check contract compliance","Generate milestone report"]} />
    </AppShell>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPLIANCE OFFICER — PPDPA checks, compliance monitoring
════════════════════════════════════════════════════════════════════════════ */
export function ComplianceOfficerDashboard() {
  const { user } = useAuth();
  const CHECKS = [
    { area: "Procurement Method", pct: 97, color: "bg-[#0F172A]" },
    { area: "Approval Thresholds", pct: 94, color: "bg-[#0F172A]" },
    { area: "Documentation", pct: 88, color: "bg-[#0F172A]" },
    { area: "Vendor Eligibility", pct: 92, color: "bg-[#0F172A]" },
    { area: "Advertisement Period", pct: 96, color: "bg-[#0F172A]" },
    { area: "Evaluation Process", pct: 91, color: "bg-[#0F172A]" },
  ];
  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader title={`Compliance Officer — ${user?.name}`} description="PPDPA compliance monitoring, exceptions, and remediation." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Overall Compliance" value="94.2%" delta="+1.8 pts" icon={Shield} color="green" />
          <KpiCard label="Open Exceptions" value="47" delta="5 critical" positive={false} icon={AlertTriangle} color="red" />
          <KpiCard label="Checks Run Today" value="312" delta="Auto & manual" icon={CheckCircle2} color="blue" />
          <KpiCard label="Remediated This Month" value="88" delta="93% resolution" icon={TrendingUp} color="cyan" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader title="Compliance by Area" />
            <div className="p-5 space-y-3">
              {CHECKS.map(c => (
                <div key={c.area}>
                  <div className="flex justify-between text-xs mb-1"><span className="font-medium text-black">{c.area}</span><span className="font-bold text-black">{c.pct}%</span></div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden"><div className={`h-full rounded-full ${c.color}`} style={{ width: `${c.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Recent Exceptions" action={<Badge tone="red">47 open</Badge>} />
            <div className="divide-y divide-black/5">
              {[
                { ref: "EXC-2026-089", issue: "Tender published without legal clearance", risk: "High", tender: "ZW-PRA-2026-00182" },
                { ref: "EXC-2026-088", issue: "Evaluation committee lacks quorum", risk: "High", tender: "ZW-PRA-2026-00183" },
                { ref: "EXC-2026-087", issue: "COI declaration missing — 2 evaluators", risk: "Med", tender: "ZW-PRA-2026-00179" },
                { ref: "EXC-2026-086", issue: "Award letter not issued within 5 days", risk: "Low", tender: "ZW-PRA-2026-00178" },
              ].map(e => (
                <div key={e.ref} className="px-5 py-3 flex items-start justify-between gap-3">
                  <div><div className="text-xs font-medium text-black">{e.issue}</div>
                    <div className="text-[11px] text-black/40">{e.ref} · {e.tender}</div></div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge tone={e.risk === "High" ? "red" : e.risk === "Med" ? "amber" : "muted"}>{e.risk}</Badge>
                    <button onClick={() => act(`Exception ${e.ref} remediation initiated`)} className="h-6 px-2 rounded-lg bg-black text-white text-[10px] hover:bg-gray-800">Fix</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <AIAssistantPanel agentName="Compliance AI" agentRole="PPDPA checks, exception resolution" context="compliance monitoring" color="blue" suggestedPrompts={["Run compliance scan","List open exceptions","Check procurement method","Generate compliance certificate"]} />
    </AppShell>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   LEGAL OFFICER — contract legal review, clause analysis
════════════════════════════════════════════════════════════════════════════ */
export function LegalOfficerDashboard() {
  const { user } = useAuth();
  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader title={`Legal Officer — ${user?.name}`} description="Contract legal review, clause analysis, and legal opinions." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Reviews Pending" value="8" delta="3 urgent" positive={false} icon={Clock} color="amber" />
          <KpiCard label="Reviewed This Month" value="34" delta="+12%" icon={CheckCircle2} color="green" />
          <KpiCard label="Risky Clauses Flagged" value="17" delta="Across 5 contracts" icon={AlertTriangle} color="red" />
          <KpiCard label="Legal Opinions Issued" value="12" delta="This quarter" icon={FileText} color="blue" />
        </div>
        <Card className="mb-4">
          <CardHeader title="Contracts Pending Legal Review" action={<Badge tone="amber">8 pending</Badge>} />
          <div className="divide-y divide-black/5">
            {contracts.map((c, i) => (
              <div key={c.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-black">{c.title}</div>
                  <div className="text-xs text-black/40">{c.id} · {c.vendor} · {c.value}</div>
                  <div className="text-xs text-[#0F172A] mt-0.5">{i < 2 ? "⚠️ Unlimited liability clause detected" : "✅ No major issues"}</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => act(`Legal review completed for ${c.id}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800">Review</button>
                  <button onClick={() => act(`Legal opinion issued for ${c.id}`)} className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-gray-100">Opinion</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Flagged Clauses" subtitle="AI-identified risky contract clauses" />
          <div className="divide-y divide-black/5">
            {["Unlimited liability in Section 14", "Ambiguous delivery standard — Section 8", "Missing dispute resolution clause", "Force majeure not aligned with treasury guidelines"].map((c, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-start gap-2"><AlertTriangle className="h-3.5 w-3.5 text-slate-600 mt-0.5 flex-shrink-0" /><span className="text-sm text-black">{c}</span></div>
                <button onClick={() => act("Clause recommendation applied")} className="h-6 px-2 rounded-lg bg-black text-white text-[10px] hover:bg-gray-800 flex-shrink-0">Fix</button>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <AIAssistantPanel agentName="Legal AI" agentRole="Clause analysis, legal opinion drafting" context="legal review" color="blue" suggestedPrompts={["Analyse contract clauses","Draft legal opinion","Check liability terms","Flag non-standard clauses"]} />
    </AppShell>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   STORES / INVENTORY OFFICER — GRN, stock, delivery inspection
════════════════════════════════════════════════════════════════════════════ */
export function StoresOfficerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader title={`Stores Officer — ${user?.name}`} description="Inventory &amp; Warehouse Management — full lifecycle from demand planning to reconciliation." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Pending GRNs" value="6" delta="Today" icon={Package} color="amber" />
          <KpiCard label="GRNs Issued Today" value="3" delta="Verified" icon={CheckCircle2} color="green" />
          <KpiCard label="Rejected Deliveries" value="1" delta="Non-conforming" positive={false} icon={AlertTriangle} color="red" />
          <KpiCard label="Stock Items" value="1,284" delta="In custody" icon={Archive} color="blue" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {[
            { label: "Open Inventory Module", desc: "Full inventory dashboard — stock levels, alerts, KPIs", path: "/inventory", icon: "📦", color: "bg-slate-50 border-slate-200" },
            { label: "Item Master", desc: "Browse, add, and manage all inventory items and SKUs", path: "/inventory/items", icon: "🏷️", color: "bg-slate-50 border-slate-200" },
            { label: "Receiving & GRN", desc: "Process goods received notes and quality inspection", path: "/inventory/receiving", icon: "✅", color: "bg-slate-50 border-slate-200" },
            { label: "Issue Requests", desc: "Manage department requests for stock issuance", path: "/inventory/requests", icon: "📋", color: "bg-slate-50 border-slate-200" },
            { label: "Warehouse & Storage", desc: "Zone management, locations, capacity utilization", path: "/inventory/warehouse", icon: "🏭", color: "bg-slate-50 border-slate-200" },
            { label: "Stock Count", desc: "Schedule and manage cycle counts and stock takes", path: "/inventory/stock-count", icon: "🔍", color: "bg-slate-50 border-slate-200" },
            { label: "Reconciliation", desc: "Variance investigation and adjustment workflows", path: "/inventory/reconciliation", icon: "⚖️", color: "bg-rose-50 border-rose-200" },
            { label: "AI Agents", desc: "14 specialized AI agents for inventory intelligence", path: "/inventory/ai-agents", icon: "🤖", color: "bg-slate-50 border-slate-200" },
          ].map(m => (
            <button key={m.path} onClick={() => navigate(m.path)}
              className={`${m.color} border rounded-2xl px-4 py-3 text-left hover:shadow-md transition-all flex items-center gap-3`}>
              <span className="text-2xl">{m.icon}</span>
              <div>
                <div className="text-sm font-semibold text-black">{m.label}</div>
                <div className="text-xs text-black/50 mt-0.5">{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
        <Card>
          <CardHeader title="Quick Stock Status" subtitle="Critical alerts requiring attention" />
          <div className="divide-y divide-black/5">
            {[
              { item: "ARV Tenofovir/Lamivudine Tablets", status: "Critical", stock: "1,240 packs", alert: "Below reorder point — replenishment needed", color: "text-red-600" },
              { item: "Portland Cement 42.5N", status: "Damaged", stock: "680 bags", alert: "15 bags damaged — write-off pending approval", color: "text-[#0F172A]" },
              { item: "Dell Latitude 5540 Laptops", status: "Quarantine", stock: "2 units", alert: "Quarantine pending IT inspection clearance", color: "text-[#0F172A]" },
            ].map((s, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold">{s.item}</div>
                  <div className={`text-xs mt-0.5 ${s.color} font-medium`}>{s.alert}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-black/50">{s.stock}</span>
                  <Badge tone={s.status === "Critical" ? "red" : s.status === "Damaged" ? "amber" : "blue"}>{s.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <AIAssistantPanel agentName="Inventory Chief Intelligence Agent" agentRole="Full inventory lifecycle intelligence — demand forecasting, shortage prevention, warehouse optimization" context="stores officer dashboard" color="emerald" suggestedPrompts={["Which items need immediate replenishment?","Show pending GRNs","List quarantine items","Generate daily stock report"]} />
    </AppShell>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   BUDGET OFFICER — budget commitment, utilisation, approvals
════════════════════════════════════════════════════════════════════════════ */
export function BudgetOfficerDashboard() {
  const { user } = useAuth();
  const BUDGETS = [
    { cat: "Infrastructure", total: 840, spent: 612, committed: 180, color: "bg-[#0F172A]" },
    { cat: "Health & Pharma", total: 420, spent: 318, committed: 52, color: "bg-[#0F172A]" },
    { cat: "ICT & Digital", total: 210, spent: 148, committed: 40, color: "bg-[#0F172A]" },
    { cat: "Agriculture", total: 380, spent: 272, committed: 68, color: "bg-[#0F172A]" },
    { cat: "Education", total: 180, spent: 124, committed: 31, color: "bg-[#0F172A]" },
  ];
  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader title={`Budget Officer — ${user?.name}`} description="Budget commitment control, utilisation tracking, and fund authorisation." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Budget FY26" value="USD 2.03B" delta="Approved" icon={DollarSign} color="blue" />
          <KpiCard label="Spent YTD" value="USD 1.47B" delta="72.6% utilised" icon={TrendingUp} color="green" />
          <KpiCard label="Committed (POs)" value="USD 371M" delta="Reserved" icon={Clock} color="amber" />
          <KpiCard label="Available Balance" value="USD 192M" delta="3 months left" positive={false} icon={AlertTriangle} color="red" />
        </div>
        <div className="space-y-3 mb-6">
          {BUDGETS.map(b => {
            const spentPct = Math.round((b.spent / b.total) * 100);
            const committedPct = Math.round((b.committed / b.total) * 100);
            return (
              <div key={b.cat} className="bg-white border border-black/10 rounded-2xl px-5 py-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-black">{b.cat}</span>
                  <span className="text-sm text-black/50">USD {b.spent}M / <span className="font-semibold text-black">USD {b.total}M</span></span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 overflow-hidden mb-1">
                  <div className="h-full flex">
                    <div className={`h-full ${b.color} rounded-l-full`} style={{ width: `${spentPct}%` }} />
                    <div className="h-full bg-gray-300" style={{ width: `${committedPct}%` }} />
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-black/40">
                  <span><span className="inline-block h-2 w-2 rounded-full bg-gray-800 mr-1" />Spent {spentPct}%</span>
                  <span><span className="inline-block h-2 w-2 rounded-full bg-gray-300 mr-1" />Committed {committedPct}%</span>
                  <span className="ml-auto font-semibold text-black">Available: USD {b.total - b.spent - b.committed}M</span>
                </div>
              </div>
            );
          })}
        </div>
        <Card>
          <CardHeader title="Commitment Requests — Pending Approval" action={<Badge tone="amber">7 pending</Badge>} />
          <div className="divide-y divide-black/5">
            {[
              { ref: "COMM-2026-041", title: "Solar Mini-Grids Equipment", amount: "USD 14.8M", dept: "Ministry of Energy", status: "Pending" },
              { ref: "COMM-2026-040", title: "Hospital Construction — Phase 2", amount: "USD 56M", dept: "Ministry of Health", status: "Pending" },
              { ref: "COMM-2026-039", title: "School Textbooks 2026/27", amount: "USD 6.7M", dept: "Ministry of Education", status: "Approved" },
            ].map(c => (
              <div key={c.ref} className="px-5 py-3 flex items-center justify-between gap-4">
                <div><div className="text-sm font-medium text-black">{c.title}</div>
                  <div className="text-xs text-black/40">{c.ref} · {c.dept} · {c.amount}</div></div>
                <div className="flex items-center gap-2">
                  <Badge tone={c.status === "Approved" ? "green" : "amber"}>{c.status}</Badge>
                  {c.status === "Pending" && (
                    <button onClick={() => act(`Commitment ${c.ref} approved`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800">Approve</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <AIAssistantPanel agentName="Budget AI" agentRole="Budget analysis, commitment control" context="budget management" color="blue" suggestedPrompts={["Check available balance","Forecast year-end spend","Flag overcommitment risk","Generate budget utilisation report"]} />
    </AppShell>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   PLANNING OFFICER — procurement plans, demand forecasting
════════════════════════════════════════════════════════════════════════════ */
export function PlanningOfficerDashboard() {
  const { user } = useAuth();
  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader title={`Planning Officer — ${user?.name}`} description="Annual procurement plans, demand aggregation, and pipeline management." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Planned Tenders Q3" value="42" delta="8 approved" icon={FileText} color="blue" />
          <KpiCard label="Plans Submitted" value="28" delta="66% of plan" icon={CheckCircle2} color="green" />
          <KpiCard label="Unplanned Tenders" value="6" delta="Needs justification" positive={false} icon={AlertTriangle} color="amber" />
          <KpiCard label="Budget Coverage" value="94%" delta="Plan vs budget" icon={TrendingUp} color="cyan" />
        </div>
        <Card className="mb-4">
          <CardHeader title="Annual Procurement Plan — FY2026" subtitle="By quarter" />
          <div className="p-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { q: "Q1", planned: 18, actual: 18 },
                { q: "Q2", planned: 24, actual: 21 },
                { q: "Q3", planned: 42, actual: 12 },
                { q: "Q4", planned: 38, actual: 0 },
              ]}>
                <CartesianGrid stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="q" stroke="#aaa" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#aaa" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #eee", borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="planned" fill="#d1d5db" radius={[3,3,0,0]} name="Planned" />
                <Bar dataKey="actual" fill="#111" radius={[3,3,0,0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Upcoming Planned Tenders — Q3 2026" />
          <div className="divide-y divide-black/5">
            {tenders.slice(0, 4).map(t => (
              <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div><div className="text-sm font-medium text-black">{t.title}</div>
                  <div className="text-xs text-black/40">{t.entity} · {t.value} · {t.method}</div></div>
                <div className="flex items-center gap-2">
                  <Badge tone={t.status === "Draft" ? "muted" : "blue"}>{t.status}</Badge>
                  <button onClick={() => act(`Procurement plan updated for ${t.id}`)} className="h-6 px-2 rounded-lg border border-black/10 text-[10px] hover:bg-gray-100">Update</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <AIAssistantPanel agentName="Planning AI" agentRole="Demand forecasting, plan optimisation" context="procurement planning" color="blue" suggestedPrompts={["Aggregate demand by category","Identify unplanned tenders","Forecast Q4 pipeline","Generate annual plan PDF"]} />
    </AppShell>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   RISK OFFICER — risk register, mitigation tracking
════════════════════════════════════════════════════════════════════════════ */
export function RiskOfficerDashboard() {
  const { user } = useAuth();
  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader title={`Risk Officer — ${user?.name}`} description="Procurement risk register, mitigation tracking, and risk reporting." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Open Risks" value="28" delta="4 critical" positive={false} icon={AlertTriangle} color="red" />
          <KpiCard label="Mitigated This Month" value="12" delta="43% closed" icon={CheckCircle2} color="green" />
          <KpiCard label="Risk Score Avg" value="3.4/5" delta="-0.2 pts" icon={Activity} color="amber" />
          <KpiCard label="Upcoming Reviews" value="8" delta="Next 14 days" icon={Clock} color="blue" />
        </div>
        <Card>
          <CardHeader title="Risk Register" action={<Badge tone="red">28 open risks</Badge>} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-black/40"><tr>
                {["ID","Risk","Category","Likelihood","Impact","Score","Mitigation","Status"].map(h => <th key={h} className="text-left px-4 py-2.5 font-medium whitespace-nowrap">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-black/5">
                {[
                  ["RISK-041","Single-source dependency — medicines","Supply","High","Critical",4.5,"Dual-source strategy","Open"],
                  ["RISK-040","Currency risk — USD contracts","Financial","Med","High",3.8,"Multi-currency clause","Mitigated"],
                  ["RISK-039","Bid rigging — road contracts","Fraud","High","Critical",4.8,"ZACC referral","Escalated"],
                  ["RISK-038","Evaluator conflict of interest","Governance","Med","High",3.5,"COI review process","Open"],
                  ["RISK-037","Budget overrun — infrastructure","Budget","Med","Med",3.0,"Quarterly budget review","Monitoring"],
                ].map(([id,risk,cat,like,impact,score,mit,status], i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-[11px] text-black/40">{id}</td>
                    <td className="px-4 py-3 font-medium text-black max-w-[200px]">{risk}</td>
                    <td className="px-4 py-3 text-black/60">{cat}</td>
                    <td className="px-4 py-3"><Badge tone={like === "High" ? "red" : "amber"}>{like}</Badge></td>
                    <td className="px-4 py-3"><Badge tone={impact === "Critical" ? "red" : impact === "High" ? "amber" : "muted"}>{impact}</Badge></td>
                    <td className="px-4 py-3 font-bold text-black">{score}</td>
                    <td className="px-4 py-3 text-xs text-black/60 max-w-[160px]">{mit}</td>
                    <td className="px-4 py-3"><Badge tone={status === "Mitigated" ? "green" : status === "Escalated" ? "red" : "amber"}>{status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <AIAssistantPanel agentName="Risk AI" agentRole="Risk analysis, mitigation recommendations" context="risk management" color="blue" suggestedPrompts={["Assess top 5 risks","Suggest mitigation strategies","Generate risk report","Score contract risk profile"]} />
    </AppShell>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   PROJECT MANAGER — delivery, milestones, contractor oversight
════════════════════════════════════════════════════════════════════════════ */
export function ProjectManagerDashboard() {
  const { user } = useAuth();
  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader title={`Project Manager — ${user?.name}`} description="Contract delivery monitoring, milestones, and contractor performance." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Active Projects" value="4" delta="2 on schedule" icon={Briefcase} color="blue" />
          <KpiCard label="Milestones Due" value="3" delta="This week" icon={Clock} color="amber" />
          <KpiCard label="Issues Open" value="2" delta="Needs escalation" positive={false} icon={AlertTriangle} color="red" />
          <KpiCard label="On-Time Delivery" value="87%" delta="-3% this month" icon={TrendingUp} color="green" />
        </div>
        <div className="space-y-4">
          {contracts.slice(0, 3).map(c => (
            <div key={c.id} className="bg-white border border-black/10 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div><div className="text-sm font-bold text-black">{c.title}</div>
                  <div className="text-xs text-black/40">{c.id} · {c.vendor} · {c.value}</div></div>
                <Badge tone={c.status === "At Risk" ? "red" : "green"}>{c.status}</Badge>
              </div>
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-2">
                <div className={`h-full rounded-full ${c.status === "At Risk" ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} style={{ width: `${c.progress}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-black/40 mb-3">
                <span>{c.progress}% complete</span><span>Deadline: {c.end}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {["Site Visit", "Milestone Report", "Issue Log"].map((btn) => (
                  <button key={btn} onClick={() => act(`${btn} logged for ${c.id}`)} className="h-7 rounded-lg border border-black/10 text-xs hover:bg-gray-50 transition-colors">{btn}</button>
                ))}
              </div>
              {c.status === "At Risk" && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-[#0F172A] flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                  Delivery at risk — hardware procurement delayed 14 days. Contractor notified.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <AIAssistantPanel agentName="Delivery AI" agentRole="Milestone tracking, contractor performance" context="project delivery" color="blue" suggestedPrompts={["Summarise project status","Generate milestone report","Flag delivery risks","Draft contractor notice"]} />
    </AppShell>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   ANTI-CORRUPTION OFFICER — investigations, fraud referrals
════════════════════════════════════════════════════════════════════════════ */
export function AntiCorruptionOfficerDashboard() {
  const { user } = useAuth();
  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader title={`Anti-Corruption Officer — ${user?.name}`} description="Fraud detection, investigation management, and ZACC referrals." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Active Investigations" value="7" delta="2 critical" positive={false} icon={Search} color="red" />
          <KpiCard label="ZACC Referrals YTD" value="3" delta="Pending outcome" icon={Shield} color="amber" />
          <KpiCard label="Alerts Triaged" value="89" delta="94% rate" icon={CheckCircle2} color="green" />
          <KpiCard label="Vendors Flagged" value="12" delta="Under review" icon={Users} color="blue" />
        </div>
        <Card className="mb-4">
          <CardHeader title="Active Investigations" action={<Badge tone="red">7 open</Badge>} />
          <div className="divide-y divide-black/5">
            {[
              { id: "INV-2026-007", type: "Bid Rotation",         vendors: "VEN-00476, VEN-00481", ref: "ZW-PRA-2026-00179", status: "ZACC Referred",    sev: "Critical" },
              { id: "INV-2026-006", type: "Conflict of Interest", vendors: "VEN-00478",             ref: "ZW-PRA-2026-00181", status: "Evidence Gathering", sev: "High" },
              { id: "INV-2026-005", type: "Abnormally Low Bid",   vendors: "VEN-00476",             ref: "ZW-PRA-2026-00183", status: "Under Review",      sev: "High" },
              { id: "INV-2026-004", type: "PEP Match",            vendors: "VEN-00480",             ref: "ZW-PRA-2026-00177", status: "Screening",         sev: "Med" },
            ].map(inv => (
              <div key={inv.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-black">{inv.type}</div>
                  <div className="text-xs text-black/40">{inv.id} · {inv.vendors} · {inv.ref}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge tone={inv.sev === "Critical" ? "red" : inv.sev === "High" ? "amber" : "muted"}>{inv.sev}</Badge>
                  <Badge tone={inv.status.includes("ZACC") ? "red" : "blue"}>{inv.status}</Badge>
                  <button onClick={() => act(`Action taken on ${inv.id}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800">Act</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <AIAssistantPanel agentName="Anti-Corruption AI" agentRole="Pattern detection, evidence analysis" context="fraud investigation" color="rose" suggestedPrompts={["Detect bid collusion","Build evidence package","Generate ZACC referral","Cross-reference vendor networks"]} />
    </AppShell>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   PERFORMANCE OFFICER — KPIs, scorecards, SLA monitoring
════════════════════════════════════════════════════════════════════════════ */
export function PerformanceOfficerDashboard() {
  const { user } = useAuth();
  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader title={`Performance Officer — ${user?.name}`} description="Vendor KPIs, SLA monitoring, and contract performance scorecards." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Vendors Monitored" value="42" delta="Active contracts" icon={Users} color="blue" />
          <KpiCard label="Avg Performance" value="4.3/5" delta="+0.2 pts" icon={Star} color="green" />
          <KpiCard label="SLA Breaches" value="3" delta="This month" positive={false} icon={AlertTriangle} color="red" />
          <KpiCard label="Deductions Applied" value="USD 84K" delta="5 vendors" icon={DollarSign} color="amber" />
        </div>
        <Card>
          <CardHeader title="Vendor Performance Scorecards" action={<Badge tone="blue">Live Scoring</Badge>} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-black/40"><tr>
                {["Vendor","Delivery","Quality","Comms","Overall","Trend","Action"].map(h => <th key={h} className="text-left px-4 py-2.5 font-medium">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-black/5">
                {vendors.slice(0, 5).map(v => {
                  const overall = v.rating;
                  return (
                    <tr key={v.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 font-medium text-black">{v.name}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1"><Star className="h-3 w-3 text-slate-500 fill-amber-400" />{(overall - 0.1).toFixed(1)}</div></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1"><Star className="h-3 w-3 text-slate-500 fill-amber-400" />{overall.toFixed(1)}</div></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1"><Star className="h-3 w-3 text-slate-500 fill-amber-400" />{(overall + 0.1).toFixed(1)}</div></td>
                      <td className="px-4 py-3 font-bold text-black">{overall}/5</td>
                      <td className="px-4 py-3 text-xs text-[#0F172A]">▲ +0.2</td>
                      <td className="px-4 py-3"><button onClick={() => act(`Scorecard updated for ${v.name}`)} className="h-6 px-2 rounded-lg bg-black text-white text-[10px] hover:bg-gray-800">Score</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
      <AIAssistantPanel agentName="Performance AI" agentRole="KPI analysis, SLA monitoring" context="vendor performance" color="blue" suggestedPrompts={["Flag underperforming vendors","Calculate SLA deductions","Generate scorecard report","Compare vendor performance"]} />
    </AppShell>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   IT OFFICER — system health, integrations, user management
════════════════════════════════════════════════════════════════════════════ */
export function ITOfficerDashboard() {
  const { user } = useAuth();
  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader title={`IT Officer — ${user?.name}`} description="System health monitoring, integrations, and user access management." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="System Uptime" value="99.94%" delta="+0.02%" icon={Activity} color="green" />
          <KpiCard label="Active Users" value="1,284" delta="Online now" icon={Users} color="blue" />
          <KpiCard label="Open IT Tickets" value="14" delta="3 critical" positive={false} icon={AlertTriangle} color="red" />
          <KpiCard label="API Integrations" value="8" delta="All healthy" icon={Zap} color="cyan" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader title="System Health" action={<Badge tone="green">All Systems Go</Badge>} />
            <div className="divide-y divide-black/5">
              {[
                { service: "Procurement Intelligence Core API", status: "Online", latency: "12ms",  uptime: "99.98%" },
                { service: "AI Agents Engine",        status: "Online", latency: "48ms",  uptime: "99.91%" },
                { service: "ZIMRA Integration",       status: "Online", latency: "182ms", uptime: "99.72%" },
                { service: "Document Vault",          status: "Online", latency: "24ms",  uptime: "100%"   },
                { service: "Payment Gateway",         status: "Degraded",latency: "840ms",uptime: "98.4%"  },
                { service: "Notification Service",    status: "Online", latency: "8ms",   uptime: "99.99%" },
              ].map(s => (
                <div key={s.service} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${s.status === "Online" ? "bg-[#0F172A]" : s.status === "Degraded" ? "bg-[#0F172A]" : "bg-red-500"}`} />
                    <span className="text-sm text-black">{s.service}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-black/40">
                    <span>{s.latency}</span><span>{s.uptime}</span>
                    <Badge tone={s.status === "Online" ? "green" : "amber"}>{s.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Recent IT Tickets" action={<Badge tone="amber">14 open</Badge>} />
            <div className="divide-y divide-black/5">
              {[
                { id: "TKT-2026-084", issue: "Payment gateway latency spike",       priority: "Critical", assigned: "Self" },
                { id: "TKT-2026-083", issue: "User unable to export PDF reports",    priority: "High",     assigned: "Tier 2" },
                { id: "TKT-2026-082", issue: "AI agent timeout — Fraud Detection",  priority: "High",     assigned: "AI Team" },
                { id: "TKT-2026-081", issue: "Password reset not sending email",     priority: "Med",      assigned: "Self" },
              ].map(t => (
                <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div><div className="text-xs font-medium text-black">{t.issue}</div>
                    <div className="text-[11px] text-black/40">{t.id} · Assigned: {t.assigned}</div></div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge tone={t.priority === "Critical" ? "red" : t.priority === "High" ? "amber" : "muted"}>{t.priority}</Badge>
                    <button onClick={() => act(`Ticket ${t.id} updated`)} className="h-6 px-2 rounded-lg bg-black text-white text-[10px] hover:bg-gray-800">Update</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      <AIAssistantPanel agentName="Tech AI" agentRole="System diagnostics, integration support" context="IT operations" color="blue" suggestedPrompts={["Check system health","Diagnose integration error","Generate uptime report","List active user sessions"]} />
    </AppShell>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   GENERIC ROLE DASHBOARD — for roles not needing a custom view
════════════════════════════════════════════════════════════════════════════ */
export function GenericRoleDashboard({ roleLabel, roleDesc, features, aiName, aiRole, color }: {
  roleLabel: string;
  roleDesc: string;
  features: { icon: React.ElementType; title: string; desc: string; action: string; link?: string }[];
  aiName: string;
  aiRole: string;
  color?: "blue" | "violet" | "emerald" | "amber" | "rose";
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader title={`${roleLabel} — ${user?.name}`} description={`${roleDesc} · ${user?.entity}`} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <div key={f.title} className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-xl bg-black grid place-items-center">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-black">{f.title}</div>
                <div className="text-xs text-black/40 mt-1 leading-relaxed">{f.desc}</div>
              </div>
              <button
                onClick={() => f.link ? navigate(f.link) : act(`${f.action} initiated`)}
                className="mt-auto h-8 px-4 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors self-start"
              >{f.action}</button>
            </div>
          ))}
        </div>
      </div>
      <AIAssistantPanel agentName={aiName} agentRole={aiRole} context={roleLabel.toLowerCase()} color={color ?? "blue"} suggestedPrompts={features.slice(0,4).map(f => f.action)} />
    </AppShell>
  );
}
