import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import NewTenderModal from "@/components/NewTenderModal";
import TodayActivity from "@/components/TodayActivity";
import { useTenders, useRFQs } from "@/hooks/use-store";
import { FileText, Plus, Clock, CheckCircle2, Sparkles, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { generateDailyReportPDF } from "@/lib/pdf-report";
import { Download } from "lucide-react";
import { toast } from "@/lib/toast";

const TABS = ["My Tenders", "My RFQs", "Pending Actions", "AI Tools", "Today"] as const;
type Tab = typeof TABS[number];

export default function ProcurementOfficerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("My Tenders");
  const [showNewTender, setShowNewTender] = useState(false);
  const { tenders } = useTenders();
  const { rfqs } = useRFQs();

  const myTenders = tenders.filter(t => t.createdBy === user?.name || tenders.indexOf(t) < 3);
  const pending = myTenders.filter(t => ["Bidding", "Evaluation"].includes(t.status));

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Procurement Officer Dashboard"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title={`Welcome, ${user?.name?.split(" ")[0]}`}
          description="Procurement Officer · Manage your tenders, RFQs, and procurement actions"
          actions={
            <div className="flex gap-2">
              <button onClick={() => user && generateDailyReportPDF(user)}
                className="h-9 px-4 rounded-xl border border-black/10 bg-white text-sm font-medium hover:bg-[#EAF1F8] flex items-center gap-1.5 transition-colors">
                <Download className="h-4 w-4" /> Daily Report
              </button>
              <button onClick={() => setShowNewTender(true)}
                className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800 transition-colors">
                <Plus className="h-4 w-4" /> New Tender
              </button>
            </div>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="My Tenders" value={String(myTenders.length)} delta="Active" icon={FileText} />
          <KpiCard label="Pending Evaluation" value={String(pending.length)} delta="Needs attention" icon={Clock} />
          <KpiCard label="My RFQs" value={String(rfqs.length)} delta="In progress" icon={CheckCircle2} />
          <KpiCard label="AI Assists Today" value="12" delta="Actions completed" icon={Sparkles} />
        </div>

        <div className="flex gap-1 mb-6 border-b border-black/10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}</button>
          ))}
        </div>

        {tab === "My Tenders" && (
          <Card>
            <CardHeader title="My Tender Register" subtitle={`${myTenders.length} tenders`} />
            <div className="divide-y divide-black/5">
              {myTenders.map(t => (
                <div key={t.id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-black truncate">{t.title}</div>
                    <div className="text-[11px] text-black/40">{t.id} · {t.entity} · {t.value}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge tone={t.status === "Awarded" ? "green" : t.status === "Evaluation" ? "amber" : t.status === "Bidding" ? "blue" : "muted"}>{t.status}</Badge>
                    <Link to="/tenders-lifecycle" className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] transition-colors">Open</Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "My RFQs" && (
          <Card>
            <CardHeader title="My RFQ Register" action={<Link to="/rfq" className="text-xs text-black/40 hover:text-black flex items-center gap-1">All RFQs <ArrowRight className="h-3 w-3" /></Link>} />
            <div className="divide-y divide-black/5">
              {rfqs.map(r => (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-black">{r.title}</div>
                    <div className="text-[11px] text-black/40">{r.id} · {r.dept} · Due {r.deadline}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-[#EAF1F8] overflow-hidden"><div className="h-full rounded-full bg-black" style={{ width: `${(r.stage / 18) * 100}%` }} /></div>
                    <span className="text-[11px] text-black/40">S{r.stage}/18</span>
                    <Badge tone="blue">{r.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "Pending Actions" && (
          <div className="space-y-3">
            {[
              { type: "Urgent", action: "Consensus required — ARV Medicines Technical Evaluation", tender: "ZW-PRA-2026-00183", due: "Today" },
              { type: "Action", action: "BOQ incomplete — Beitbridge Highway Section 4", tender: "ZW-PRA-2026-00181", due: "Tomorrow" },
              { type: "Review", action: "4 bid submissions to validate — Tax System tender", tender: "ZW-PRA-2026-00182", due: "Jun 25" },
              { type: "Approve", action: "Evaluation report ready for submission — Solar Mini-Grids", tender: "ZW-PRA-2026-00184", due: "Jun 26" },
            ].map((a, i) => (
              <div key={i} className="bg-white border border-black/10 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${a.type === "Urgent" ? "text-red-500" : a.type === "Action" ? "text-slate-600" : "text-black/30"}`} />
                  <div>
                    <div className="text-sm font-medium text-black">{a.action}</div>
                    <div className="text-[11px] text-black/40">{a.tender} · Due {a.due}</div>
                  </div>
                </div>
                <button className="h-8 px-3 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors flex-shrink-0">Act Now</button>
              </div>
            ))}
          </div>
        )}

        {tab === "AI Tools" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Specification Drafter", desc: "Generate technical specs from a project description", action: "Draft Specs", msg: "Opening AI Specification Drafter…\n\nDescribe your project and the AI will generate compliant technical specs, TOR, and BOQ." },
              { name: "Compliance Checker", desc: "Check your tender against PPDPA requirements", action: "Check Now", msg: "Running PPDPA compliance check on your latest tender…\n\n✅ Procurement method: Correct\n✅ Evaluation criteria: Complete\n⚠️ Conflict of interest declaration: Required for 2 committee members." },
              { name: "Evaluation Designer", desc: "Suggest evaluation criteria and weights by category", action: "Design Criteria", msg: "AI Evaluation Designer ready.\n\nFor Works category, recommended weights:\n• Experience: 25%\n• Key Personnel: 20%\n• Equipment: 20%\n• Methodology: 20%\n• Financial Capacity: 15%" },
              { name: "BOQ Generator", desc: "Auto-generate Bill of Quantities from scope description", action: "Generate BOQ", msg: "BOQ Generator activated.\n\nPaste or type your project scope and the AI will auto-generate a complete Bill of Quantities aligned with standard line items." },
              { name: "Timeline Planner", desc: "Build a procurement timeline based on method and value", action: "Plan Timeline", msg: "AI Timeline Planner:\n\nFor Open Tender (USD 14.8M):\n• Preparation: 14 days\n• Approval: 7 days\n• Advertisement: 30 days\n• Bid submission: 30 days\n• Evaluation: 21 days\n• Award: 14 days\nTotal: ~116 days" },
              { name: "Award Advisor", desc: "Get AI recommendation on evaluation outcomes", action: "Get Advice", msg: "Award Advisor Analysis:\n\nBased on current scores for ZW-PRA-2026-00183:\n🏆 Recommended: Zimbabwe Pharma Holdings (90.45/100)\n\nRationale: Highest technical score, compliant financial proposal, references verified, no conflict of interest detected." },
            ].map(tool => (
              <div key={tool.name} className="bg-white border border-black/10 rounded-2xl p-5 flex flex-col gap-3">
                <div className="h-9 w-9 rounded-xl bg-black grid place-items-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-black">{tool.name}</div>
                  <div className="text-xs text-black/40 mt-1">{tool.desc}</div>
                </div>
                <button onClick={() => toast(tool.msg, "info")} className="mt-auto h-8 px-3 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors self-start">{tool.action}</button>
              </div>
            ))}
          </div>
        )}

        {tab === "Today" && <TodayActivity />}
      </div>

      <NewTenderModal open={showNewTender} onClose={() => setShowNewTender(false)} />
      <AIAssistantPanel agentName="Tender Drafting AI" agentRole="Specs, TORs, evaluation design" context="procurement officer portal" color="blue"
        suggestedPrompts={["Draft specs for solar panels","Check compliance of my tender","Generate evaluation criteria","What is the correct method for USD 5M?"]} />
    </AppShell>
  );
}
