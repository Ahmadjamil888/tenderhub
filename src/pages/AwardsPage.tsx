import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { FeatureGrid } from "@/components/ModulePage";
import { tenders } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth-context";
import AwardNoticeModal from "@/components/AwardNoticeModal";
import { pushSeniorAlert, pushNotification } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import { Trophy, Clock, CheckCircle2, Scale, AlertTriangle, Send, Eye, FileText, Download } from "lucide-react";

const CANDIDATE_AWARDS = [
  { tenderId: "ZW-PRA-2026-00183", title: "ARV Medicines Framework (2yr)",         entity: "Ministry of Health", value: "USD 42,500,000", vendor: "Zimbabwe Pharma Holdings",    score: 90.45, status: "Ready to Award" },
  { tenderId: "ZW-PRA-2026-00184", title: "Solar Mini-Grids — 12 Rural Clinics",   entity: "Ministry of Energy", value: "USD 14,800,000", vendor: "Highveld Engineering (Pvt) Ltd", score: 88.20, status: "Pending Approval" },
  { tenderId: "ZW-PRA-2026-00179", title: "Provision of External Audit Services",  entity: "OAG",                value: "USD 1,850,000",  vendor: "Deloitte Zimbabwe",           score: 86.10, status: "Due Diligence" },
];

const APPEALS = [
  { ref: "APP-2026-014", tender: "ZW-PRA-2026-00175", bidder: "Granite Construction Group",    grounds: "Specification bias",    filed: "2026-06-10", status: "Under Review" },
  { ref: "APP-2026-013", tender: "ZW-PRA-2026-00172", bidder: "Eastern Highlands Logistics",   grounds: "Evaluation error",      filed: "2026-06-08", status: "Dismissed" },
  { ref: "APP-2026-012", tender: "ZW-PRA-2026-00170", bidder: "Sable ICT Solutions",            grounds: "Procedural breach",     filed: "2026-06-01", status: "Upheld" },
];

type AwardCandidate = typeof CANDIDATE_AWARDS[number];
type Appeal = typeof APPEALS[number];

export default function AwardsPage() {
  const { user } = useAuth();
  const [awarded, setAwarded] = useState<string[]>([]);
  const [awardTarget, setAwardTarget] = useState<AwardCandidate | null>(null);
  const [appeals, setAppeals] = useState(APPEALS);
  const [showAppealDetail, setShowAppealDetail] = useState<Appeal | null>(null);

  const awardedTenders = tenders.filter(t => t.status === "Awarded");

  const downloadAwardNotice = (c: AwardCandidate) => {
    const content = `LETTER OF AWARD\n\nReference: ${c.tenderId}\nTender: ${c.title}\nAwarded To: ${c.vendor}\nContract Value: ${c.value}\nEvaluation Score: ${c.score}/100\nAward Date: ${new Date().toLocaleDateString()}\nStandstill Period: 14 working days\n\n${c.entity} · Government of Zimbabwe · AI Powered Electronic Public Procurement and Oversight Intelligence System\n© 2026 All Rights Reserved`;
    const blob = new Blob([content], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `LOA-${c.tenderId}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleAppealAction = (ref: string, action: string) => {
    setAppeals(prev => prev.map(a => a.ref === ref ? { ...a, status: action } : a));
    pushSeniorAlert(`Appeal ${ref} — Decision: ${action}`, "info", { from: user?.name, fromRole: user?.role ?? "officer", category: "action", ref });
    pushNotification(`Appeal ${ref}: ${action}`, "info");
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Contract Awards"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Phases 15 – 17</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Awards & Appeals Management"
          description="Due diligence, award approval, award notification with legal documents, and full electronic appeals lifecycle."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Awards Issued YTD" value={String(1842 + awarded.length)} delta="+142 this month" icon={Trophy} />
          <KpiCard label="Standstill Active" value="24" delta="14 days avg remaining" icon={Clock} />
          <KpiCard label="Open Appeals" value={String(appeals.filter(a => a.status === "Under Review").length)} delta="+3 this week" positive={false} icon={Scale} />
          <KpiCard label="Appeals Upheld" value={String(appeals.filter(a => a.status === "Upheld").length)} delta="This year" icon={CheckCircle2} />
        </div>

        {/* ── Award Candidates ── */}
        <Card className="mb-4">
          <CardHeader title="Pending Award Decisions" subtitle="Evaluation complete — awaiting formal award" action={<Badge tone="amber">{CANDIDATE_AWARDS.filter(c => !awarded.includes(c.tenderId)).length} pending</Badge>} />
          <div className="divide-y divide-black/5">
            {CANDIDATE_AWARDS.map(c => {
              const isAwarded = awarded.includes(c.tenderId);
              return (
                <div key={c.tenderId} className={`px-4 sm:px-5 py-4 ${isAwarded ? "bg-slate-50/40" : ""}`}>
                  <div className="flex items-start justify-between gap-3 mb-2 flex-col sm:flex-row">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono text-black/40">{c.tenderId}</span>
                        <Badge tone={isAwarded ? "green" : c.status === "Ready to Award" ? "blue" : c.status === "Due Diligence" ? "amber" : "muted"}>
                          {isAwarded ? "Awarded ✓" : c.status}
                        </Badge>
                      </div>
                      <div className="text-sm font-semibold text-black">{c.title}</div>
                      <div className="text-xs text-black/50 mt-0.5">{c.entity} · Recommended: <strong>{c.vendor}</strong> · Score: {c.score}/100</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-base font-bold text-black">{c.value}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap mt-3">
                    {!isAwarded && c.status === "Ready to Award" && (
                      <button onClick={() => setAwardTarget(c)}
                        className="h-8 px-4 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#0F172A] transition-colors flex items-center gap-1.5">
                        <Send className="h-3.5 w-3.5" /> Issue Award Notice
                      </button>
                    )}
                    {!isAwarded && c.status !== "Ready to Award" && (
                      <button onClick={() => { pushNotification(`${c.tenderId} moved to Ready to Award`, "success"); }}
                        className="h-8 px-4 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#0F172A] transition-colors flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Complete {c.status}
                      </button>
                    )}
                    <button onClick={() => downloadAwardNotice(c)}
                      className="h-8 px-3 rounded-xl border border-black/10 text-xs hover:bg-[#EAF1F8] transition-colors flex items-center gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Download LOA
                    </button>
                    <button onClick={() => toast(`${c.tenderId} — ${c.title} | ${c.vendor} | Score: ${c.score}/100 | QCBS 70/30. AI: No conflict detected. Proceed with award.`, "info")}
                      className="h-8 px-3 rounded-xl border border-black/10 text-xs hover:bg-[#EAF1F8] transition-colors flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" /> View Evaluation
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ── Recent Awards ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader title="Recently Awarded Tenders" />
            <div className="divide-y divide-black/5">
              {[...awardedTenders,
                { id: "ZW-PRA-2026-00175", title: "ZIMRA HQ Renovation",       entity: "ZIMRA",                   value: "USD 4.2M", closing: "2026-05-20", bids: 8, status: "Awarded", category: "", method: "Open" } as typeof tenders[0],
                { id: "ZW-PRA-2026-00172", title: "Ministry Fleet Vehicles",    entity: "Ministry of Transport",   value: "USD 1.8M", closing: "2026-05-15", bids: 6, status: "Awarded", category: "", method: "Framework" } as typeof tenders[0],
              ].map(t => (
                <div key={t.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-black truncate">{t.title}</div>
                    <div className="text-[11px] text-black/40">{t.entity} · {t.id} · {t.value}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge tone="green">Awarded</Badge>
                    <span className="text-[11px] text-black/40 hidden sm:inline">14d standstill</span>
                    <button onClick={() => toast(`Award Record: ${t.title} | ${t.entity} | ${t.value} | Status: Awarded | 14-day standstill applies.`, "info")}
                      className="h-6 px-2 rounded-lg border border-black/10 text-[10px] hover:bg-[#EAF1F8] transition-colors">View</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Appeals Tribunal ── */}
          <Card>
            <CardHeader title="Appeals Tribunal" subtitle="Active appeals" action={<Badge tone="amber">{appeals.filter(a => a.status === "Under Review").length} open</Badge>} />
            <div className="divide-y divide-black/5">
              {appeals.map(a => (
                <div key={a.ref} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-black">{a.ref}</span>
                    <Badge tone={a.status === "Under Review" ? "amber" : a.status === "Upheld" ? "green" : "muted"}>{a.status}</Badge>
                  </div>
                  <div className="text-[11px] text-black/60">{a.bidder} · Grounds: {a.grounds}</div>
                  <div className="text-[11px] text-black/40">{a.tender} · Filed {a.filed}</div>
                  {a.status === "Under Review" && (
                    <div className="flex gap-2 mt-2">
                      <button onClick={() => handleAppealAction(a.ref, "Upheld")}
                        className="h-7 px-2.5 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A] transition-colors">Uphold</button>
                      <button onClick={() => handleAppealAction(a.ref, "Dismissed")}
                        className="h-7 px-2.5 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700 transition-colors">Dismiss</button>
                      <button onClick={() => toast(`Appeal ${a.ref} — ${a.tender} | ${a.bidder} | Grounds: ${a.grounds} | Filed: ${a.filed} | Status: ${a.status}`, "info")}
                        className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] transition-colors">Review</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <FeatureGrid features={[
          { title: "Due Diligence (Phase 15)",     desc: "Background checks, financial revalidation, site visits, capacity verification before award." },
          { title: "Award Approval (Phase 16)",     desc: "Multi-tier approval, adjudication committee, accounting officer authorization, PRAZ notification." },
          { title: "Award Notification (Phase 17)", desc: "Congratulation notice, legal documents request, standstill period, unsuccessful bidder notification." },
          { title: "Appeals Submission",            desc: "Aggrieved bidder e-submission with grounds, evidence, and fee handling." },
          { title: "Appeals Tribunal Workflow",     desc: "Independent review, hearing scheduling, decision publication, remedy execution." },
          { title: "Immutable Audit Trail",         desc: "Every decision, approval, override, and AI recommendation is cryptographically logged." },
        ]} />
      </div>

      {awardTarget && (
        <AwardNoticeModal
          tender={{ id: awardTarget.tenderId, title: awardTarget.title, value: awardTarget.value, entity: awardTarget.entity }}
          vendor={awardTarget.vendor}
          awardedBy={user?.name ?? "Adjudication Officer"}
          onClose={() => {
            setAwarded(prev => [...prev, awardTarget.tenderId]);
            setAwardTarget(null);
          }}
        />
      )}
    </AppShell>
  );
}
