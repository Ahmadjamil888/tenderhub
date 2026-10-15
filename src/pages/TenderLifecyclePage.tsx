import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import WorkflowStepper from "@/components/WorkflowStepper";
import { FileText, Plus, CheckCircle2, Clock, Sparkles, AlertTriangle, Users, Download } from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import { useNavigate } from "react-router-dom";

const PHASES = [
  { id: 0,  label: "Governance",     status: "completed" as const, description: "Policies, roles, thresholds configured", aiRole: "Policy Advisor" },
  { id: 1,  label: "Planning",       status: "completed" as const, description: "PR approved, budget validated", aiRole: "Demand Forecaster" },
  { id: 2,  label: "Sourcing Strategy", status: "completed" as const, description: "Method selected: Open Tender", aiRole: "Strategy Advisor" },
  { id: 3,  label: "Preparation",    status: "active" as const,    description: "Drafting specs, BOQ, evaluation design", aiRole: "Drafting AI" },
  { id: 4,  label: "Approval",       status: "pending" as const,   description: "Legal, finance, compliance review", aiRole: "Compliance Checker" },
  { id: 5,  label: "Advertisement",  status: "pending" as const,   description: "Multi-channel publication", aiRole: "Publication AI" },
  { id: 6,  label: "Supplier Mgmt",  status: "pending" as const,   description: "KYC, qualification, risk scoring", aiRole: "Supplier Risk AI" },
  { id: 7,  label: "Clarifications", status: "pending" as const,   description: "Q&A, addenda, pre-bid meeting", aiRole: "Clarification AI" },
  { id: 8,  label: "Bid Submission", status: "pending" as const,   description: "Encrypted vault, compliance check", aiRole: "Bid Compliance AI" },
  { id: 9,  label: "Closing",        status: "pending" as const,   description: "Auto-close, late bid prevention", aiRole: "Closing Auditor" },
  { id: 10, label: "Bid Opening",    status: "pending" as const,   description: "Opening ceremony, minutes", aiRole: "Opening Recorder" },
  { id: 11, label: "Admin Eval",     status: "pending" as const,   description: "Compliance matrix, responsiveness", aiRole: "Compliance Eval AI" },
  { id: 12, label: "Tech Eval",      status: "pending" as const,   description: "Weighted scoring, consensus", aiRole: "Tech Eval AI" },
  { id: 13, label: "Fin Eval",       status: "pending" as const,   description: "BOQ check, arithmetic, LCC", aiRole: "Financial Eval AI" },
  { id: 14, label: "Combined Eval",  status: "pending" as const,   description: "QCBS/LERB ranking, recommendation", aiRole: "Award Rec AI" },
  { id: 15, label: "Due Diligence",  status: "pending" as const,   description: "References, site visits, capacity", aiRole: "Due Diligence AI" },
  { id: 16, label: "Award Approval", status: "pending" as const,   description: "Committee, board, exception handling", aiRole: "Award Review AI" },
  { id: 17, label: "Notification",   status: "pending" as const,   description: "Award/regret notices, standstill", aiRole: "Notification AI" },
  { id: 18, label: "Contract Mgmt",  status: "pending" as const,   description: "Drafting, signing, repository", aiRole: "Contract AI" },
  { id: 19, label: "Execution",      status: "pending" as const,   description: "Milestones, deliverables, SLAs", aiRole: "Performance AI" },
  { id: 20, label: "Invoicing",      status: "pending" as const,   description: "3-way match, tax validation", aiRole: "Invoice AI" },
  { id: 21, label: "Payments",       status: "pending" as const,   description: "Approval, EFT, remittance", aiRole: "Payment AI" },
  { id: 22, label: "Vendor Perf",    status: "pending" as const,   description: "KPIs, scorecards, sanctions", aiRole: "Performance AI" },
  { id: 23, label: "Audit",          status: "pending" as const,   description: "Immutable trail, compliance", aiRole: "Audit AI" },
  { id: 24, label: "Analytics",      status: "pending" as const,   description: "Spend, savings, cycle time", aiRole: "Intelligence AI" },
  { id: 25, label: "Closeout",       status: "pending" as const,   description: "Completion, warranty, archive", aiRole: "Closeout AI" },
];

const ACTIVE_TENDERS = [
  { id: "ZW-PRA-2026-00184", title: "Solar Mini-Grids — 12 Rural Clinics", entity: "Min. Energy", phase: "Phase 3", phaseLabel: "Preparation", value: "USD 14.8M", status: "Drafting", aiAlert: null },
  { id: "ZW-PRA-2026-00183", title: "ARV Medicines Framework (2yr)", entity: "Min. Health", phase: "Phase 12", phaseLabel: "Technical Eval", value: "USD 42.5M", status: "Evaluation", aiAlert: "Consensus required — 2 evaluators diverge >15pts" },
  { id: "ZW-PRA-2026-00182", title: "National Tax Administration System II", entity: "ZIMRA", phase: "Phase 5", phaseLabel: "Advertisement", value: "USD 9.2M", status: "Bidding", aiAlert: null },
  { id: "ZW-PRA-2026-00181", title: "Beitbridge–Harare Highway Section 4", entity: "Min. Transport", phase: "Phase 3", phaseLabel: "Preparation", value: "USD 88M", status: "Drafting", aiAlert: "BOQ incomplete — 3 sections missing" },
];

const PHASE_DETAIL: Record<string, { title: string; features: string[]; automation: string[]; aiCapabilities: string[] }> = {
  "3": {
    title: "Tender Preparation — Workspace",
    features: ["Auto-generate tender number & reference", "Document repository with version control", "Templates: Supplies/Works/Services", "Evaluation design — stages, weights, pass marks", "Committee assignment & COI declarations", "Electronic signatures"],
    automation: ["AI drafts specifications from similar tenders", "BOQ auto-populated from item catalog", "Evaluation criteria suggested by AI", "Timeline auto-generated based on method"],
    aiCapabilities: ["Generate full TOR from project description", "Suggest evaluation weights based on category", "Detect specification ambiguities", "Draft contract clauses"],
  },
  "12": {
    title: "Technical Evaluation — Evaluator Workbench",
    features: ["Multi-evaluator scoring portal", "Weighted criteria engine", "Consensus meeting management", "Score moderation workflows", "Technical ranking report generation", "Document analysis — TORs, CVs, methodology"],
    automation: ["Scores consolidated automatically", "Divergence flagged for moderation", "Narrative auto-generated per bidder", "Conflict of interest auto-checked"],
    aiCapabilities: ["AI scores each criterion from documents", "Extracts relevant experience automatically", "Generates evaluation narrative per bidder", "Flags specification deviations"],
  },
  "16": {
    title: "Award Approval — Workflow",
    features: ["Multi-tier approval routing", "Committee review portal", "Board approval interface", "Exception handling", "Electronic approvals with digital signature", "Approval audit trail"],
    automation: ["Routes to correct approver based on value threshold", "Escalates overdue approvals automatically", "Generates approval summary package", "Publishes to PRAZ system"],
    aiCapabilities: ["Validates evaluation integrity", "Checks for compliance issues", "Assesses approval readiness", "Prepares award justification"],
  },
};

export default function TenderLifecyclePage() {
  const navigate = useNavigate();
  const [selectedPhase, setSelectedPhase] = useState<string>("3");
  const [activeTab, setActiveTab] = useState<"overview" | "workflow" | "evaluation" | "ai">("overview");
  const [resolvedAlerts, setResolvedAlerts] = useState<string[]>([]);
  const detail = PHASE_DETAIL[selectedPhase];

  const handleNewTender = () => {
    navigate("/tenders");
    pushNotification("Redirecting to Tenders Register — click 'New Tender' to create a procurement.", "info");
  };

  const handleResolveAlert = (tenderId: string, alert: string) => {
    setResolvedAlerts(prev => [...prev, tenderId]);
    pushNotification(`Alert resolved for ${tenderId}: ${alert} — assigned to evaluation committee for action.`, "success");
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Tender Lifecycle"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">25 Phases · Full Lifecycle</Badge>
          <Badge tone="muted">Government of Zimbabwe · PRAZ</Badge>
          <Badge tone="green"><span className="h-1.5 w-1.5 rounded-full bg-[#0F172A] inline-block mr-1 animate-pulse" />8 AI Agents Active</Badge>
        </div>
        <PageHeader
          title="Tender Management — Full Lifecycle"
          description="End-to-end tender lifecycle from Governance setup through Contract Closeout. Every phase automated with AI assistants."
          actions={
            <button onClick={handleNewTender} className="h-9 px-3 rounded-md bg-primary text-white text-sm font-medium flex items-center gap-1.5 hover:opacity-90">
              <Plus className="h-4 w-4" /> New Tender
            </button>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Active Tenders" value="1,287" delta="+42 this week" icon={FileText} />
          <KpiCard label="In Evaluation" value="318" delta="12 needing attention" icon={Clock} />
          <KpiCard label="Awarded This Month" value="142" delta="+18%" icon={CheckCircle2} />
          <KpiCard label="AI Actions Today" value="4,821" delta="All phases covered" icon={Sparkles} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-border flex-wrap">
          {([["overview","Overview"],["workflow","Workflow Stages"],["evaluation","Evaluation Workbench"],["ai","AI Agents"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setActiveTab(k)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="Active Tenders — Live Status" action={<Badge tone="blue">Live</Badge>} />
              <div className="divide-y divide-border">
                {ACTIVE_TENDERS.map((t) => (
                  <div key={t.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">{t.title}</div>
                        <div className="text-[11px] text-muted-foreground">{t.entity} · {t.id} · {t.value}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge tone="muted">{t.phase}</Badge>
                        <Badge tone={t.status === "Evaluation" ? "amber" : t.status === "Bidding" ? "blue" : "muted"}>{t.phaseLabel}</Badge>
                      </div>
                    </div>
                    {t.aiAlert && !resolvedAlerts.includes(t.id) && (
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mt-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-[#0F172A] flex-shrink-0" />
                        <span className="text-xs text-[#0F172A] font-medium">AI Alert: {t.aiAlert}</span>
                        <button onClick={() => handleResolveAlert(t.id, t.aiAlert!)} className="ml-auto text-[10px] text-[#0F172A] font-semibold hover:underline bg-slate-100 px-2 py-0.5 rounded-md hover:bg-slate-200 transition-colors">Resolve</button>
                      </div>
                    )}
                    {t.aiAlert && resolvedAlerts.includes(t.id) && (
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mt-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#0F172A] flex-shrink-0" />
                        <span className="text-xs text-[#0F172A] font-medium">Alert resolved — committee notified.</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "workflow" && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="25-Phase Tender Lifecycle" subtitle="Click a phase to explore features and AI capabilities" />
              <div className="p-5">
                <WorkflowStepper steps={PHASES.slice(0, 13)} orientation="horizontal" compact={false} />
                <div className="my-4 border-t border-dashed border-border" />
                <WorkflowStepper steps={PHASES.slice(13)} orientation="horizontal" compact={false} />
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {["3","12","16"].map((p) => (
                <button key={p}
                  onClick={() => setSelectedPhase(p)}
                  className={`rounded-lg border p-3 text-left transition-all hover:border-primary/40 ${selectedPhase === p ? "border-primary bg-primary/5" : "border-border"}`}>
                  <Badge tone="blue">Phase {p}</Badge>
                  <div className="text-sm font-semibold mt-1">{PHASE_DETAIL[p].title.split(" — ")[0]}</div>
                </button>
              ))}
            </div>

            {detail && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader title="Software Features" />
                  <div className="p-4 space-y-2">
                    {detail.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-xs text-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-600 mt-0.5 flex-shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <CardHeader title="Automation Features" />
                  <div className="p-4 space-y-2">
                    {detail.automation.map((a) => (
                      <div key={a} className="flex items-start gap-2 text-xs text-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-slate-600 mt-0.5 flex-shrink-0" /> {a}
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <CardHeader title="AI Assistant Capabilities" action={<Badge tone="blue">Live</Badge>} />
                  <div className="p-4 space-y-2">
                    {detail.aiCapabilities.map((c) => (
                      <div key={c} className="flex items-start gap-2 text-xs text-foreground">
                        <div className="h-3.5 w-3.5 rounded-full bg-slate-100 grid place-items-center mt-0.5 flex-shrink-0">
                          <div className="h-1.5 w-1.5 rounded-full bg-[#0F172A] animate-pulse" />
                        </div>
                        {c}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === "evaluation" && <TechnicalEvalWorkbench />}
        {activeTab === "ai" && <AIAgentsOverview />}
      </div>

      <AIAssistantPanel
        agentName="Tender Drafting AI"
        agentRole="Specs, TORs, BOQs, evaluation design"
        context="tender management"
        color="blue"
        suggestedPrompts={["Draft specifications for solar panels", "Recommend evaluation method", "Check compliance issues", "Generate evaluation criteria for services"]}
      />
    </AppShell>
  );
}

// ── Evaluation Workbench ──────────────────────────────────────────────────────
const EVAL_CATEGORIES = ["Supplies", "Works", "Services"] as const;
type EvalCat = typeof EVAL_CATEGORIES[number];

const EVAL_CRITERIA: Record<EvalCat, { criterion: string; weight: number }[]> = {
  Supplies: [
    { criterion: "Technical Compliance", weight: 60 },
    { criterion: "Delivery Capability", weight: 20 },
    { criterion: "Warranty Support", weight: 10 },
    { criterion: "Experience", weight: 10 },
  ],
  Works: [
    { criterion: "Similar Projects (Experience)", weight: 25 },
    { criterion: "Key Personnel", weight: 20 },
    { criterion: "Equipment Availability", weight: 20 },
    { criterion: "Methodology", weight: 20 },
    { criterion: "Financial Capacity", weight: 15 },
  ],
  Services: [
    { criterion: "Understanding of TOR / Methodology", weight: 30 },
    { criterion: "Team Qualifications", weight: 30 },
    { criterion: "Relevant Experience", weight: 25 },
    { criterion: "Work Plan", weight: 15 },
  ],
};

const BIDDERS = ["Zimbabwe Pharma Holdings", "Continental Med Africa", "Sable Pharma Ltd", "Granite Med Supplies"];

function TechnicalEvalWorkbench() {
  const [category, setCategory] = useState<EvalCat>("Supplies");
  const [scores, setScores] = useState<Record<string, Record<string, number>>>(() => {
    const init: Record<string, Record<string, number>> = {};
    BIDDERS.forEach((b) => {
      init[b] = {};
      EVAL_CRITERIA.Supplies.forEach((c) => { init[b][c.criterion] = Math.floor(65 + Math.random() * 30); });
      EVAL_CRITERIA.Works.forEach((c) => { init[b][c.criterion] = Math.floor(65 + Math.random() * 30); });
      EVAL_CRITERIA.Services.forEach((c) => { init[b][c.criterion] = Math.floor(65 + Math.random() * 30); });
    });
    return init;
  });

  const criteria = EVAL_CRITERIA[category];

  const getWeighted = (bidder: string) =>
    criteria.reduce((sum, c) => sum + ((scores[bidder]?.[c.criterion] ?? 0) * c.weight) / 100, 0);

  const ranked = [...BIDDERS].sort((a, b) => getWeighted(b) - getWeighted(a));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Technical Evaluation Workbench"
          subtitle="AI-assisted scoring — ZW-PRA-2026-00183 · ARV Medicines Framework"
          action={<Badge tone="blue"><Sparkles className="h-3 w-3 mr-1" />AI Scoring Active</Badge>}
        />
        <div className="px-5 py-3 border-b border-border flex gap-2 flex-wrap">
          {EVAL_CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`h-8 px-3 rounded-md text-xs font-medium transition-colors ${category === c ? "bg-primary text-white" : "border border-border bg-card hover:bg-secondary"}`}>
              {c} Evaluation
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-5 py-2.5">Bidder</th>
                {criteria.map((c) => (
                  <th key={c.criterion} className="text-center font-medium px-3 py-2.5 whitespace-nowrap">
                    {c.criterion}<br /><span className="font-normal text-[10px]">({c.weight}%)</span>
                  </th>
                ))}
                <th className="text-center font-medium px-5 py-2.5">Weighted</th>
                <th className="text-center font-medium px-5 py-2.5">AI Rec.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ranked.map((bidder, rank) => {
                const ws = getWeighted(bidder);
                return (
                  <tr key={bidder} className={`hover:bg-secondary/40 ${rank === 0 ? "bg-slate-50/50" : ""}`}>
                    <td className="px-5 py-3">
                      <div className="font-medium text-foreground">{bidder}</div>
                      {rank === 0 && <div className="text-[10px] text-[#0F172A] font-medium">🏆 Recommended</div>}
                    </td>
                    {criteria.map((c) => {
                      const sc = scores[bidder]?.[c.criterion] ?? 0;
                      return (
                        <td key={c.criterion} className="px-3 py-3 text-center">
                          <input
                            type="number" min={0} max={100} value={sc}
                            onChange={(e) => setScores((prev) => ({ ...prev, [bidder]: { ...prev[bidder], [c.criterion]: Number(e.target.value) } }))}
                            className={`w-14 h-7 text-center text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-ring ${sc >= 80 ? "border-slate-200 bg-slate-50 text-[#0F172A]" : sc >= 60 ? "border-border bg-card" : "border-red-300 bg-red-50 text-red-600"}`}
                          />
                        </td>
                      );
                    })}
                    <td className="px-5 py-3 text-center font-bold text-primary text-base">{ws.toFixed(1)}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge tone={ws >= 80 ? "green" : ws >= 65 ? "blue" : "amber"}>
                        {ws >= 80 ? "Strong" : ws >= 65 ? "Acceptable" : "Marginal"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-slate-50 border-t border-border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#0F172A]" />
            <span className="text-sm text-[#0F172A] font-medium">
              AI Recommendation: <strong>{ranked[0]}</strong> — Highest weighted score ({getWeighted(ranked[0]).toFixed(1)}/100). Proceed to financial evaluation.
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AIAgentsOverview() {
  const agents = [
    { name: "Procurement Policy Advisor", phase: "Phase 0", color: "blue", action: "Checking procurement method compliance…", conf: 98 },
    { name: "Demand Planning AI", phase: "Phase 1", color: "emerald", action: "Forecasting Q3 2026 demand — 12 categories", conf: 91 },
    { name: "Sourcing Strategy Advisor", phase: "Phase 2", color: "violet", action: "Recommending Open Tender — USD 88M highway", conf: 94 },
    { name: "Tender Drafting AI", phase: "Phase 3", color: "blue", action: "Generating BOQ — Solar Mini-Grids project", conf: 89 },
    { name: "Compliance Review AI", phase: "Phase 4", color: "amber", action: "Reviewing ARV tender — 2 issues flagged", conf: 97 },
    { name: "Publication Optimizer AI", phase: "Phase 5", color: "blue", action: "Optimizing tender reach — 4 channels", conf: 92 },
    { name: "Supplier Risk AI", phase: "Phase 6", color: "rose", action: "Screening 124 vendor applications", conf: 96 },
    { name: "Clarification AI", phase: "Phase 7", color: "emerald", action: "Drafting 8 Q&A responses for ZW-PRA-00182", conf: 88 },
    { name: "Bid Compliance AI", phase: "Phase 8–9", color: "violet", action: "Validated 14 submissions — 2 non-responsive", conf: 95 },
    { name: "Technical Evaluation AI", phase: "Phase 12", color: "blue", action: "Scoring 8 bids — ARV Medicines Framework", conf: 91 },
    { name: "Financial Evaluation AI", phase: "Phase 13", color: "amber", action: "Running arithmetic checks — 3 BOQs", conf: 93 },
    { name: "Award Recommendation AI", phase: "Phase 14–16", color: "emerald", action: "Preparing award package — ZW-PRA-00180", conf: 90 },
  ];
  const [activeConsole, setActiveConsole] = useState<string | null>(null);

  const colorMap: Record<string, string> = {
    blue: "bg-[#0F172A]", emerald: "bg-[#0F172A]", violet: "bg-[#0F172A]", amber: "bg-[#0F172A]", rose: "bg-rose-600",
  };
  const lightMap: Record<string, string> = {
    blue: "text-[#0F172A]", emerald: "text-[#0F172A]", violet: "text-[#0F172A]", amber: "text-[#0F172A]", rose: "text-rose-700",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {agents.map((a) => (
        <Card key={a.name} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg ${colorMap[a.color] ?? "bg-[#0F172A]"} grid place-items-center flex-shrink-0`}>
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground leading-tight">{a.name}</div>
                <Badge tone="blue">{a.phase}</Badge>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className={`text-base font-bold ${lightMap[a.color]}`}>{a.conf}%</div>
              <div className="text-[9px] text-muted-foreground">conf.</div>
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground mb-2">{a.action}</div>
          <div className="h-1 rounded-full bg-secondary overflow-hidden">
            <div className={`h-full rounded-full ${colorMap[a.color]}`} style={{ width: `${a.conf}%` }} />
          </div>
          <button
            onClick={() => {
              setActiveConsole(a.name);
              pushNotification(`${a.name} console opened — currently: ${a.action} Confidence: ${a.conf}%.`, "info");
            }}
            className={`mt-2 w-full h-7 rounded-md text-xs font-medium transition-colors ${activeConsole === a.name ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary hover:bg-primary/10 hover:text-primary"}`}>
            {activeConsole === a.name ? "Console Active ✓" : "View Agent Console"}
          </button>
        </Card>
      ))}
    </div>
  );
}
