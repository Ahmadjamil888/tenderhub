import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import TodayActivity from "@/components/TodayActivity";
import { generateDailyReportPDF } from "@/lib/pdf-report";
import { Scale, CheckCircle2, Clock, Sparkles, AlertTriangle, Download, RotateCcw } from "lucide-react";
import { pushNotification } from "@/lib/local-store";

const TABS = ["My Evaluations", "Scoring Workbench", "AI Assistance", "Reports", "Today"] as const;
type Tab = typeof TABS[number];

const EVAL_CRITERIA = [
  { criterion: "Technical Compliance", weight: 60, scores: [92, 88, 78, 60] },
  { criterion: "Delivery Capability",  weight: 20, scores: [88, 82, 70, 55] },
  { criterion: "Warranty Support",     weight: 10, scores: [95, 90, 75, 65] },
  { criterion: "Experience",           weight: 10, scores: [80, 85, 70, 60] },
];
const BIDDERS = ["Zimbabwe Pharma Holdings", "Continental Med Africa", "Sable Pharma Ltd", "Granite Med Supplies"];

export default function EvaluatorDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("My Evaluations");
  const [scores, setScores] = useState<number[][]>(EVAL_CRITERIA.map(c => [...c.scores]));
  const [submitted, setSubmitted] = useState(false);

  const getWeighted = (bidderIdx: number) =>
    EVAL_CRITERIA.reduce((sum, c, ci) => sum + (scores[ci][bidderIdx] * c.weight) / 100, 0);

  const ranked = BIDDERS.map((b, i) => ({ name: b, score: getWeighted(i) })).sort((a, b) => b.score - a.score);

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Evaluator Dashboard"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader title={`Evaluator: ${user?.name}`} description="Bid Evaluation Workbench — Ministry of Health"
          actions={
            <button onClick={() => user && generateDailyReportPDF(user)}
              className="h-9 px-4 rounded-xl border border-black/10 bg-white text-sm font-medium hover:bg-[#EAF1F8] flex items-center gap-1.5 transition-colors">
              <Download className="h-4 w-4" /> Daily Report
            </button>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Assigned Evaluations" value="3" delta="2 in progress" icon={Scale} />
          <KpiCard label="Scores Submitted" value="1" delta="2 pending" icon={CheckCircle2} />
          <KpiCard label="Overdue" value="0" delta="On schedule" icon={Clock} />
          <KpiCard label="AI Assists Used" value="8" delta="Today" icon={Sparkles} />
        </div>

        <div className="flex gap-1 mb-6 border-b border-black/10 overflow-x-auto">
          {(["My Evaluations","Scoring Workbench","AI Assistance","Reports"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>{t}</button>
          ))}
        </div>

        {tab === "My Evaluations" && (
          <div className="space-y-3">
            {[
              { tender: "ZW-PRA-2026-00183 — ARV Medicines Framework", phase: "Technical Evaluation", bids: 8, status: "In Progress", due: "2026-06-25" },
              { tender: "ZW-PRA-2026-00179 — External Audit Services", phase: "Financial Evaluation", bids: 9, status: "Pending Start", due: "2026-06-28" },
              { tender: "ZW-PRA-2026-00178 — School Textbooks", phase: "Administrative", bids: 12, status: "Completed", due: "2026-06-20" },
            ].map((e, i) => (
              <div key={i} className="bg-white border border-black/10 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-black">{e.tender}</div>
                  <div className="text-[11px] text-black/40">{e.phase} · {e.bids} bids · Due {e.due}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={e.status === "Completed" ? "green" : e.status === "In Progress" ? "amber" : "muted"}>{e.status}</Badge>
                  <button onClick={() => setTab("Scoring Workbench")} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 transition-colors">Score</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Scoring Workbench" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="Technical Scoring — ZW-PRA-2026-00183 · ARV Medicines"
                action={<Badge tone="blue"><Sparkles className="h-3 w-3 mr-1" />AI Active</Badge>} />
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#EAF1F8] text-xs text-black/40">
                    <tr>
                      <th className="text-left px-5 py-2.5">Bidder</th>
                      {EVAL_CRITERIA.map(c => (
                        <th key={c.criterion} className="text-center px-3 py-2.5 whitespace-nowrap">
                          {c.criterion}<br /><span className="font-normal text-[10px]">({c.weight}%)</span>
                        </th>
                      ))}
                      <th className="text-center px-5 py-2.5">Weighted</th>
                      <th className="text-center px-5 py-2.5">Rank</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {BIDDERS.map((bidder, bi) => {
                      const ws = getWeighted(bi);
                      const rank = ranked.findIndex(r => r.name === bidder) + 1;
                      return (
                        <tr key={bidder} className={`hover:bg-[#EAF1F8]/50 ${rank === 1 ? "bg-slate-50/30" : ""}`}>
                          <td className="px-5 py-3 font-medium text-black whitespace-nowrap">{bidder}</td>
                          {EVAL_CRITERIA.map((c, ci) => (
                            <td key={ci} className="px-3 py-3 text-center">
                              <input type="number" min={0} max={100} value={scores[ci][bi]}
                                onChange={e => {
                                  const newScores = scores.map((row, ri) => ri === ci ? row.map((s, si) => si === bi ? Number(e.target.value) : s) : row);
                                  setScores(newScores);
                                }}
                                disabled={submitted}
                                className={`w-14 h-7 text-center text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-black/20 ${scores[ci][bi] >= 80 ? "border-slate-200 bg-slate-50 text-[#0F172A]" : scores[ci][bi] >= 60 ? "border-black/10 bg-white" : "border-red-200 bg-red-50 text-red-600"} disabled:opacity-60 disabled:cursor-not-allowed`}
                              />
                            </td>
                          ))}
                          <td className="px-5 py-3 text-center font-bold text-black text-base">{ws.toFixed(1)}</td>
                          <td className="px-5 py-3 text-center">
                            <span className={`h-6 w-6 rounded-full inline-flex items-center justify-center text-xs font-bold text-white ${rank === 1 ? "bg-black" : rank === 2 ? "bg-gray-500" : "bg-gray-300 text-gray-600"}`}>{rank}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {!submitted ? (
                <div className="px-5 py-4 border-t border-black/10 flex items-center justify-between">
                  <div className="text-xs text-black/40">AI Recommendation: <strong className="text-black">{ranked[0]?.name}</strong> — highest weighted score</div>
                  <button onClick={() => setSubmitted(true)} className="h-8 px-4 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Submit Scores
                  </button>
                </div>
              ) : (
                <div className="px-5 py-4 border-t border-black/10 bg-slate-50 flex items-center gap-2 flex-wrap">
                  <CheckCircle2 className="h-4 w-4 text-[#0F172A]" />
                  <span className="text-sm text-[#0F172A] font-medium flex-1">Scores submitted successfully. Awaiting moderation.</span>
                  <button onClick={() => { setSubmitted(false); pushNotification("Score submission reopened for editing. Changes will need to be resubmitted.", "info"); }}
                    className="h-7 px-3 rounded-lg border border-slate-200 text-xs text-[#0F172A] hover:bg-slate-100 flex items-center gap-1">
                    <RotateCcw className="h-3 w-3" /> Re-edit
                  </button>
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === "AI Assistance" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "Auto-Score from Documents", desc: "AI reads bid documents and pre-fills scores for each criterion", conf: 91 },
              { name: "Evaluation Narrative Generator", desc: "AI writes strengths & weaknesses text for each bidder", conf: 88 },
              { name: "Specification Deviation Detector", desc: "Flags where bids deviate from technical specs", conf: 95 },
              { name: "Consensus Facilitator", desc: "Analyzes divergence between evaluators and suggests resolution", conf: 87 },
            ].map(tool => (
              <div key={tool.name} className="bg-white border border-black/10 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-9 w-9 rounded-xl bg-black grid place-items-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-black">{tool.conf}%</span>
                </div>
                <div className="text-sm font-semibold text-black mb-1">{tool.name}</div>
                <div className="text-xs text-black/40 mb-3">{tool.desc}</div>
                <div className="h-1 rounded-full bg-[#EAF1F8] mb-3"><div className="h-full rounded-full bg-black" style={{ width: `${tool.conf}%` }} /></div>
                <button
                  onClick={() => pushNotification(`${tool.name} activated — running analysis on ZW-PRA-2026-00183 ARV Medicines Framework. ${tool.conf}% confidence. Results will appear in Scoring Workbench.`, "success")}
                  className="h-8 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 transition-colors">Activate</button>
              </div>
            ))}
          </div>
        )}

        {tab === "Reports" && (
          <div className="space-y-3">
            {[
              { name: "Technical Evaluation Report — ARV Medicines",    tender: "ZW-PRA-2026-00183" },
              { name: "Financial Comparison Matrix — Audit Services",    tender: "ZW-PRA-2026-00179" },
              { name: "Evaluation Summary — School Textbooks",           tender: "ZW-PRA-2026-00178" },
            ].map((r, i) => (
              <div key={i} className="bg-white border border-black/10 rounded-2xl px-5 py-4 flex items-center justify-between">
                <div className="text-sm font-medium text-black">{r.name}</div>
                <button onClick={() => user && generateDailyReportPDF(user)}
                  className="h-8 px-3 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "Today" && <TodayActivity />}
      </div>
      <AIAssistantPanel agentName="Technical Evaluation AI" agentRole="Score analysis, narrative generation" context="bid evaluation" color="blue"
        suggestedPrompts={["Score bids from uploaded documents","Generate evaluation narrative","Detect specification deviations","Recommend consensus resolution"]} />
    </AppShell>
  );
}
