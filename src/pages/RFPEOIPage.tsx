import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import WorkflowStepper from "@/components/WorkflowStepper";
import { BarChart3, Plus, CheckCircle2, Sparkles, Clock, Users, FileText } from "lucide-react";
import { pushNotification } from "@/lib/local-store";

const EOI_STAGES = [
  { id: 1,  label: "Need ID",          status: "completed" as const, aiRole: "Procurement Advisor" },
  { id: 2,  label: "Planning",         status: "completed" as const, aiRole: "Strategy AI" },
  { id: 3,  label: "EOI Creation",     status: "completed" as const, aiRole: "EOI Authoring AI" },
  { id: 4,  label: "EOI Publication",  status: "completed" as const, aiRole: "Publication AI" },
  { id: 5,  label: "Supplier Reg.",    status: "completed" as const, aiRole: "Qualification AI" },
  { id: 6,  label: "EOI Submission",   status: "active" as const,    aiRole: "Review AI" },
  { id: 7,  label: "EOI Evaluation",   status: "pending" as const,   aiRole: "Evaluation AI" },
  { id: 8,  label: "RFP Development",  status: "pending" as const,   aiRole: "RFP AI" },
  { id: 9,  label: "RFP Approval",     status: "pending" as const,   aiRole: "Compliance AI" },
  { id: 10, label: "RFP Publication",  status: "pending" as const,   aiRole: "Publication AI" },
  { id: 11, label: "Q&A Period",       status: "pending" as const,   aiRole: "Clarification AI" },
  { id: 12, label: "Proposal Sub.",    status: "pending" as const,   aiRole: "Compliance AI" },
  { id: 13, label: "Opening",          status: "pending" as const,   aiRole: "Opening AI" },
  { id: 14, label: "Tech Evaluation",  status: "pending" as const,   aiRole: "Evaluation AI" },
  { id: 15, label: "Fin Evaluation",   status: "pending" as const,   aiRole: "Financial AI" },
  { id: 16, label: "Due Diligence",    status: "pending" as const,   aiRole: "Due Diligence AI" },
  { id: 17, label: "Recommendation",  status: "pending" as const,   aiRole: "Award AI" },
  { id: 18, label: "Negotiation",      status: "pending" as const,   aiRole: "Negotiation AI" },
  { id: 19, label: "Award Approval",   status: "pending" as const,   aiRole: "Governance AI" },
  { id: 20, label: "Notice of Award",  status: "pending" as const,   aiRole: "Notification AI" },
  { id: 21, label: "Contract",         status: "pending" as const,   aiRole: "Contract AI" },
  { id: 22, label: "Onboarding",       status: "pending" as const,   aiRole: "Onboarding AI" },
  { id: 23, label: "Perf Mgmt",        status: "pending" as const,   aiRole: "Performance AI" },
  { id: 24, label: "Closure",          status: "pending" as const,   aiRole: "Closeout AI" },
  { id: 25, label: "Analytics",        status: "pending" as const,   aiRole: "Intelligence AI" },
];

const ACTIVE_RFPS = [
  { id: "EOI-2026-0042", type: "EOI", title: "National Health Information System — Consultancy", stage: 6, stageLabel: "EOI Submissions Open", interested: 14, value: "USD 4.2M", deadline: "2026-07-10" },
  { id: "RFP-2026-0018", type: "RFP", title: "Integrated Financial Management System", stage: 14, stageLabel: "Technical Evaluation", proposals: 6, value: "USD 12.8M", deadline: "2026-06-30" },
  { id: "RFP-2026-0017", type: "RFP", title: "National Road Safety Consultancy", stage: 18, stageLabel: "Negotiation Stage", proposals: 3, value: "USD 2.1M", deadline: "2026-06-20" },
  { id: "EOI-2026-0041", type: "EOI", title: "Public Sector Reform Programme — Advisory", stage: 3, stageLabel: "EOI Development", interested: 0, value: "USD 8.5M", deadline: "2026-08-01" },
];

const PROPOSALS = [
  { vendor: "Deloitte Zimbabwe", tech: 88, fin: 82, qcbs: 86.0, experience: "22 similar projects", team: "8 experts", approach: "Agile + Waterfall", rank: 1 },
  { vendor: "PwC Africa Ltd", tech: 85, fin: 78, qcbs: 82.6, experience: "18 similar projects", team: "10 experts", approach: "Traditional PM", rank: 2 },
  { vendor: "KPMG East Africa", tech: 82, fin: 85, qcbs: 83.1, experience: "15 similar projects", team: "7 experts", approach: "Hybrid", rank: 3 },
  { vendor: "Zim Consulting Group", tech: 74, fin: 92, qcbs: 80.2, experience: "8 similar projects", team: "5 experts", approach: "Local + international", rank: 4 },
];

export default function RFPEOIPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "workflow" | "evaluation" | "agents">("dashboard");

  const handleNewEOI = () => pushNotification("New EOI wizard opened — fill in the Expression of Interest details and publish to the portal.", "info");
  const handleNewRFP = () => pushNotification("New RFP wizard opened — configure evaluation method (QCBS/QBS/Fixed Budget), criteria and timeline.", "info");
  const handleOpenRecord = (id: string, title: string) => pushNotification(`Opening ${id}: ${title} — full record with documents, proposals and evaluation status.`, "info");

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="RFP & EOI Management"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="violet">RFP · EOI · Complex Services</Badge>
          <Badge tone="muted">QCBS · QBS · Fixed Budget · Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="RFP & Expression of Interest Management"
          description="Complex procurement via EOI shortlisting and Request for Proposals. 25-stage automated workflow with AI at every decision point."
          actions={
            <div className="flex gap-2">
              <button onClick={handleNewEOI} className="h-9 px-3 rounded-md border border-border bg-card text-sm hover:bg-secondary">New EOI</button>
              <button onClick={handleNewRFP} className="h-9 px-3 rounded-md bg-primary text-white text-sm font-medium hover:opacity-90 flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> New RFP
              </button>
            </div>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Active RFPs" value="18" delta="6 in evaluation" icon={BarChart3} />
          <KpiCard label="Active EOIs" value="7" delta="4 in submission" icon={FileText} />
          <KpiCard label="Shortlisted Vendors" value="84" delta="Across 18 RFPs" icon={Users} />
          <KpiCard label="Avg Evaluation Time" value="18 days" delta="-4 days vs manual" icon={Clock} />
        </div>

        <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
          {([["dashboard","Dashboard"],["workflow","25-Stage Workflow"],["evaluation","QCBS Evaluation"],["agents","AI Agents"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setActiveTab(k)}
              className={`px-3 sm:px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap flex-shrink-0 ${activeTab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="Active EOIs & RFPs" action={<Badge tone="blue">Live</Badge>} />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-xs text-muted-foreground">
                    <tr>
                      {["ID","Type","Title","Stage","Value","Deadline",""].map(h => (
                        <th key={h} className="text-left font-medium px-5 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ACTIVE_RFPS.map((r) => (
                      <tr key={r.id} className="hover:bg-secondary/40">
                        <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">{r.id}</td>
                        <td className="px-5 py-3">
                          <Badge tone={r.type === "EOI" ? "muted" : "violet"}>{r.type}</Badge>
                        </td>
                        <td className="px-5 py-3 font-medium text-foreground">{r.title}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full rounded-full bg-[#0F172A]" style={{ width: `${(r.stage / 25) * 100}%` }} />
                            </div>
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">S{r.stage}: {r.stageLabel}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-semibold text-foreground">{r.value}</td>
                        <td className="px-5 py-3 text-foreground">{r.deadline}</td>
                        <td className="px-5 py-3">
                          <button onClick={() => handleOpenRecord(r.id, r.title)} className="h-7 px-2.5 rounded border border-border text-xs hover:bg-secondary">Open</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "workflow" && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="EOI → RFP → Contract — 25-Stage Lifecycle" subtitle="AI assistant active at every stage" />
              <div className="p-5">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Phase 1 — EOI (Stages 1–7)</div>
                <WorkflowStepper steps={EOI_STAGES.slice(0, 7)} orientation="horizontal" />
                <div className="my-4 border-t border-dashed border-border" />
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Phase 2 — RFP (Stages 8–17)</div>
                <WorkflowStepper steps={EOI_STAGES.slice(7, 17)} orientation="horizontal" />
                <div className="my-4 border-t border-dashed border-border" />
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Phase 3 — Contract Execution (Stages 18–25)</div>
                <WorkflowStepper steps={EOI_STAGES.slice(17)} orientation="horizontal" />
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "AI Agents Deployed", items: ["Procurement Advisor", "Market Research Agent", "EOI Authoring Agent", "Supplier Qualification Agent", "Proposal Review Agent", "Evaluation Agent", "Financial Analysis Agent", "Due Diligence Agent", "Contract Agent", "Negotiation Agent", "Performance Agent", "Executive Intelligence Agent"] },
                { title: "EOI Stage Features", items: ["EOI creation wizard", "Supplier eligibility criteria", "Multi-channel publication", "Supplier registration & KYC", "Submission validation", "AI-assisted shortlisting", "Scoring matrices with COI"] },
                { title: "RFP Stage Features", items: ["RFP authoring with templates", "Technical & financial scoring", "QCBS / QBS / Fixed Budget", "Negotiation workspace", "Due diligence workflows", "E-signature contract generation", "Performance monitoring & KPIs"] },
              ].map((s) => (
                <Card key={s.title} className="p-4">
                  <div className="text-sm font-bold text-foreground mb-3">{s.title}</div>
                  <div className="space-y-1.5">
                    {s.items.map(item => (
                      <div key={item} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "evaluation" && (
          <div className="space-y-4">
            <Card>
              <CardHeader
                title="QCBS Evaluation — RFP-2026-0018: Integrated Financial Management System"
                subtitle="Quality and Cost Based Selection (70/30 split)"
                action={<Badge tone="violet"><Sparkles className="h-3 w-3 mr-1" />AI Evaluation Active</Badge>}
              />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-xs text-muted-foreground">
                    <tr>
                      {["Rank","Vendor","Tech Score (70%)","Fin Score (30%)","QCBS Score","Experience","Team Size","Approach","AI Rec."].map(h => (
                        <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[...PROPOSALS].sort((a,b) => b.qcbs - a.qcbs).map((p, i) => (
                      <tr key={p.vendor} className={`hover:bg-secondary/40 ${i === 0 ? "bg-slate-50/40" : ""}`}>
                        <td className="px-4 py-3">
                          <span className={`h-6 w-6 rounded-full inline-flex items-center justify-center text-xs font-bold text-white ${i === 0 ? "bg-[#0F172A]" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-slate-400" : "bg-secondary text-foreground"}`}>{i+1}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">{p.vendor}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{p.tech}</td>
                        <td className="px-4 py-3 text-foreground">{p.fin}</td>
                        <td className="px-4 py-3 font-bold text-primary text-base">{p.qcbs.toFixed(1)}</td>
                        <td className="px-4 py-3 text-[11px] text-muted-foreground">{p.experience}</td>
                        <td className="px-4 py-3 text-foreground">{p.team}</td>
                        <td className="px-4 py-3 text-foreground text-[11px]">{p.approach}</td>
                        <td className="px-4 py-3">
                          <Badge tone={i === 0 ? "green" : i === 1 ? "blue" : "muted"}>{i === 0 ? "Award" : i === 1 ? "Reserve" : "Unsuccessful"}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#0F172A]" />
                  <span className="text-sm text-[#0F172A] font-medium">
                    AI Recommendation: Invite <strong>KPMG East Africa</strong> (QCBS 83.1) to negotiate. Despite ranking 3rd on pure tech, strongest financial competitiveness delivers best overall value under QCBS.
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "agents" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: "Procurement Advisor", resp: "Procurement planning & method selection", conf: 94, action: "Analysing RFP-2026-0018 procurement strategy…" },
              { name: "Market Research Agent", resp: "Supplier market analysis & benchmarking", conf: 88, action: "Benchmarking 6 consultancy firms in IFMS market" },
              { name: "EOI Authoring Agent", resp: "EOI document generation", conf: 91, action: "Drafting EOI-2026-0042 qualification criteria" },
              { name: "Proposal Review Agent", resp: "Proposal completeness & compliance", conf: 96, action: "Checking 6 proposals — RFP-2026-0018" },
              { name: "Evaluation Agent", resp: "QCBS/QBS scoring assistance", conf: 90, action: "Consolidating technical scores — 4 evaluators" },
              { name: "Due Diligence Agent", resp: "Reference checks & risk profiling", conf: 93, action: "Verifying 3 finalists — reference checks ongoing" },
              { name: "Negotiation Agent", resp: "Commercial optimization", conf: 87, action: "Tracking negotiation — RFP-2026-0017 round 2" },
              { name: "Contract Agent", resp: "Contract drafting & legal review", conf: 95, action: "Drafted IFMS contract — 42 clauses, 8 schedules" },
              { name: "Executive Intelligence Agent", resp: "Strategic reporting", conf: 92, action: "Preparing quarterly RFP performance briefing" },
            ].map((a) => (
              <Card key={a.name} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#0F172A] grid place-items-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground leading-tight">{a.name}</div>
                      <div className="text-[10px] text-muted-foreground">{a.resp}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-base font-bold text-[#0F172A]">{a.conf}%</div>
                    <div className="text-[9px] text-muted-foreground">conf.</div>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground mb-2 italic">"{a.action}"</div>
                <div className="h-1 rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-[#0F172A]" style={{ width: `${a.conf}%` }} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AIAssistantPanel
        agentName="RFP Intelligence AI"
        agentRole="EOI authoring, proposal evaluation, QCBS scoring"
        context="RFP and EOI management"
        color="violet"
        suggestedPrompts={["Draft EOI qualification criteria", "Evaluate proposals using QCBS", "Recommend shortlist candidates", "Draft negotiation agenda"]}
      />
    </AppShell>
  );
}
