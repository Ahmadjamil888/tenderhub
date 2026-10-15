import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { Star, TrendingUp, Plus, Search, Eye, X, Download, Sparkles, BarChart3, Users } from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

type PerformanceGrade = "A+" | "A" | "B+" | "B" | "C" | "D" | "F";

type SupplierEvaluation = {
  id: string; evalNumber: string; contractNumber: string; supplierName: string;
  supplierId: string; projectTitle: string; ministry: string;
  evaluationDate: string; evaluatorName: string; evaluatorRole: string;
  quality: number; delivery: number; costControl: number; communication: number;
  innovation: number; compliance: number; professionalism: number;
  riskManagement: number; responsiveness: number; overallPerformance: number;
  overallScore: number; rating: number; grade: PerformanceGrade;
  comments: string; recommendForFuture: boolean;
};

const calcGrade = (score: number): PerformanceGrade => {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
};

const SEED_EVALS: SupplierEvaluation[] = [
  { id: "SEV-2026-001", evalNumber: "SEV-2026-001", contractNumber: "CN-2025-0312", supplierName: "Highveld Engineering (Pvt) Ltd", supplierId: "VEN-00482", projectTitle: "Harare Water Treatment Phase I", ministry: "Ministry of Water", evaluationDate: "2026-01-25", evaluatorName: "T. Moyo", evaluatorRole: "CPO", quality: 4.6, delivery: 4.2, costControl: 4.4, communication: 4.5, innovation: 4.0, compliance: 4.8, professionalism: 4.7, riskManagement: 4.3, responsiveness: 4.5, overallPerformance: 4.3, overallScore: 91.2, rating: 4.5, grade: "A", comments: "Excellent overall performance. Delivery was slightly delayed due to weather but managed well. Strong safety record.", recommendForFuture: true },
  { id: "SEV-2026-002", evalNumber: "SEV-2026-002", contractNumber: "CN-2026-0399", supplierName: "Mashonaland Agri Supplies", supplierId: "VEN-00479", projectTitle: "Pfumvudza Fertiliser 2025/26", ministry: "Ministry of Agriculture", evaluationDate: "2026-05-30", evaluatorName: "R. Chikwanda", evaluatorRole: "Contract Manager", quality: 4.5, delivery: 4.6, costControl: 4.5, communication: 4.2, innovation: 3.8, compliance: 4.7, professionalism: 4.4, riskManagement: 4.1, responsiveness: 4.3, overallPerformance: 4.2, overallScore: 88.9, rating: 4.3, grade: "B+", comments: "Good delivery performance. Product quality met specifications. Minor communication delays noted.", recommendForFuture: true },
  { id: "SEV-2025-018", evalNumber: "SEV-2025-018", contractNumber: "CN-2025-0287", supplierName: "Zimbabwe Electro Systems", supplierId: "VEN-00483", projectTitle: "ZESA Substation Upgrade", ministry: "ZESA", evaluationDate: "2025-08-10", evaluatorName: "A. Mpofu", evaluatorRole: "Project Manager", quality: 3.8, delivery: 3.5, costControl: 3.9, communication: 3.6, innovation: 3.2, compliance: 4.0, professionalism: 3.7, riskManagement: 3.4, responsiveness: 3.6, overallPerformance: 3.5, overallScore: 74.1, rating: 3.6, grade: "B", comments: "Performance below expectations. Delays on multiple phases. Warranty claims indicate quality issues. Not recommended without improvement plan.", recommendForFuture: false },
];

const GRADE_COLOR: Record<PerformanceGrade, string> = {
  "A+": "bg-[#0F172A] text-white", "A": "bg-slate-100 text-[#0F172A]",
  "B+": "bg-slate-100 text-[#0F172A]", "B": "bg-slate-50 text-[#0F172A]",
  "C": "bg-slate-100 text-[#0F172A]", "D": "bg-slate-100 text-[#0F172A]", "F": "bg-red-100 text-red-700",
};

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`h-3 w-3 ${s <= Math.round(value) ? "fill-amber-400 text-slate-500" : "text-gray-200"}`} />
      ))}
      <span className="text-[10px] text-black/50 ml-1">{value.toFixed(1)}</span>
    </div>
  );
}

function EvalDetailModal({ ev, onClose }: { ev: SupplierEvaluation; onClose: () => void }) {
  const radarData = [
    { subject: "Quality", value: ev.quality * 20 },
    { subject: "Delivery", value: ev.delivery * 20 },
    { subject: "Cost Control", value: ev.costControl * 20 },
    { subject: "Communication", value: ev.communication * 20 },
    { subject: "Compliance", value: ev.compliance * 20 },
    { subject: "Professionalism", value: ev.professionalism * 20 },
    { subject: "Responsiveness", value: ev.responsiveness * 20 },
    { subject: "Risk Mgmt", value: ev.riskManagement * 20 },
  ];
  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <div>
            <div className="text-sm font-bold">{ev.supplierName}</div>
            <div className="text-xs text-black/50 mt-0.5">{ev.evalNumber} · {ev.projectTitle}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${GRADE_COLOR[ev.grade]}`}>{ev.grade}</span>
            <button onClick={onClose}><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-black text-white rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{ev.overallScore.toFixed(1)}</div>
              <div className="text-xs text-white/60 mt-1">Overall Score</div>
            </div>
            <div className="bg-[#F8F8F8] rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-slate-600">{ev.rating.toFixed(1)}</div>
              <div className="text-xs text-black/50 mt-1">Rating / 5.0</div>
              <StarRating value={ev.rating} />
            </div>
            <div className={`rounded-xl p-4 text-center ${GRADE_COLOR[ev.grade]}`}>
              <div className="text-3xl font-bold">{ev.grade}</div>
              <div className="text-xs opacity-70 mt-1">Performance Grade</div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold text-black mb-3">Dimension Scores</div>
              <div className="space-y-2">
                {[
                  ["Quality", ev.quality], ["Delivery", ev.delivery], ["Cost Control", ev.costControl],
                  ["Communication", ev.communication], ["Innovation", ev.innovation], ["Compliance", ev.compliance],
                  ["Professionalism", ev.professionalism], ["Risk Management", ev.riskManagement],
                  ["Responsiveness", ev.responsiveness], ["Overall Performance", ev.overallPerformance],
                ].map(([label, score]) => (
                  <div key={label as string} className="flex items-center gap-3">
                    <span className="text-xs text-black/60 w-32 flex-shrink-0">{label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-black rounded-full" style={{ width: `${(score as number) * 20}%` }} />
                    </div>
                    <span className="text-xs font-semibold text-black w-8 text-right">{(score as number).toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} />
                  <Radar dataKey="value" stroke="#000" fill="#000" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-[#F8F8F8] rounded-xl p-4">
            <div className="text-xs font-semibold text-black mb-2">Evaluator Comments</div>
            <div className="text-xs text-black/70 leading-relaxed">{ev.comments}</div>
          </div>
          <div className="flex items-center gap-3 bg-[#F8F8F8] rounded-xl p-3">
            <div className={`h-8 w-8 rounded-full grid place-items-center ${ev.recommendForFuture ? "bg-slate-100" : "bg-red-100"}`}>
              {ev.recommendForFuture ? <TrendingUp className="h-4 w-4 text-[#0F172A]" /> : <X className="h-4 w-4 text-red-500" />}
            </div>
            <div>
              <div className="text-xs font-semibold text-black">{ev.recommendForFuture ? "Recommended for Future Procurements" : "Not Recommended Without Improvement"}</div>
              <div className="text-[10px] text-black/50">Historical performance recorded for future tender evaluation</div>
            </div>
          </div>
        </div>
        <div className="border-t border-black/8 px-6 py-3 flex justify-end bg-[#fafafa]">
          <button onClick={() => pushNotification("Evaluation report downloaded.", "success")} className="h-8 px-4 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" />Download Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SupplierEvaluationPage() {
  const [evals, setEvals] = useState(SEED_EVALS);
  const [selected, setSelected] = useState<SupplierEvaluation | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"Evaluations" | "Analytics" | "Leaderboard">("Evaluations");

  const avgScore = evals.length ? evals.reduce((s, e) => s + e.overallScore, 0) / evals.length : 0;

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Vendor Management"
        process="Supplier Evaluation"
        financialYear="FY2026"
        pageType="form"
      />
      {selected && <EvalDetailModal ev={selected} onClose={() => setSelected(null)} />}
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Supplier Performance Evaluation"
          description="Comprehensive supplier evaluation across quality, delivery, compliance, and 7 other dimensions. Historical records maintained for future procurement decisions."
          actions={
            <button onClick={() => pushNotification("New supplier evaluation initiated.", "success")} className="h-9 px-3 rounded-md bg-black text-white text-sm flex items-center gap-1.5 hover:bg-gray-800">
              <Plus className="h-4 w-4" />New Evaluation
            </button>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Evaluations" value={String(evals.length)} delta="Historical records" />
          <KpiCard label="Average Score" value={`${avgScore.toFixed(1)}%`} delta="All suppliers" positive={avgScore >= 80} />
          <KpiCard label="A Grade Suppliers" value={String(evals.filter(e => e.grade === "A" || e.grade === "A+").length)} delta="Top performers" positive />
          <KpiCard label="Recommended" value={String(evals.filter(e => e.recommendForFuture).length)} delta="For future use" positive />
        </div>
        <div className="flex gap-1 mb-6 border-b border-border">
          {(["Evaluations", "Analytics", "Leaderboard"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>
        {tab === "Evaluations" && (
          <Card>
            <div className="flex gap-3 p-4 border-b border-black/8">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search supplier evaluations…" className="w-full h-9 pl-9 pr-4 rounded-lg border border-black/10 text-sm focus:outline-none" /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F8F8] border-b border-black/8">
                  <tr>{["Eval #", "Supplier", "Contract #", "Project", "Ministry", "Date", "Score", "Rating", "Grade", "Recommended", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-black/50 whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {evals.filter(e => e.supplierName.toLowerCase().includes(search.toLowerCase()) || e.contractNumber.toLowerCase().includes(search.toLowerCase())).map(ev => (
                    <tr key={ev.id} className="hover:bg-[#F8F8F8]/60">
                      <td className="px-4 py-3 text-xs font-semibold text-black">{ev.evalNumber}</td>
                      <td className="px-4 py-3 text-xs text-black max-w-[180px] truncate">{ev.supplierName}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{ev.contractNumber}</td>
                      <td className="px-4 py-3 text-xs text-black/70 max-w-[160px] truncate">{ev.projectTitle}</td>
                      <td className="px-4 py-3 text-xs text-black/60 max-w-[140px] truncate">{ev.ministry}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{ev.evaluationDate}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-black">{ev.overallScore.toFixed(1)}%</td>
                      <td className="px-4 py-3"><StarRating value={ev.rating} /></td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${GRADE_COLOR[ev.grade]}`}>{ev.grade}</span></td>
                      <td className="px-4 py-3 text-center">{ev.recommendForFuture ? "✓" : "✗"}</td>
                      <td className="px-4 py-3"><button onClick={() => setSelected(ev)} className="h-7 px-2.5 rounded-lg bg-black text-white text-[10px] hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3" />View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
        {tab === "Analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader title="Score Distribution by Supplier" />
              <div className="p-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={evals.map(e => ({ name: e.supplierName.split(" ")[0], score: e.overallScore }))}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="score" fill="#000" radius={[3, 3, 0, 0]} name="Overall Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title="Dimension Averages Across All Suppliers" />
              <div className="p-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={[
                    { d: "Quality", avg: evals.reduce((s, e) => s + e.quality, 0) / evals.length },
                    { d: "Delivery", avg: evals.reduce((s, e) => s + e.delivery, 0) / evals.length },
                    { d: "Compliance", avg: evals.reduce((s, e) => s + e.compliance, 0) / evals.length },
                    { d: "Cost Control", avg: evals.reduce((s, e) => s + e.costControl, 0) / evals.length },
                    { d: "Communication", avg: evals.reduce((s, e) => s + e.communication, 0) / evals.length },
                  ]}>
                    <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" domain={[0, 5]} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="d" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={80} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="avg" fill="#3B82F6" radius={[0, 3, 3, 0]} name="Avg Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
        {tab === "Leaderboard" && (
          <Card>
            <CardHeader title="Supplier Performance Leaderboard" subtitle="Ranked by overall score — historical records" />
            <div className="p-4 space-y-3">
              {[...evals].sort((a, b) => b.overallScore - a.overallScore).map((ev, idx) => (
                <div key={ev.id} className="flex items-center gap-4 p-4 border border-black/8 rounded-xl hover:bg-[#F8F8F8]">
                  <div className={`h-8 w-8 rounded-full grid place-items-center text-sm font-bold flex-shrink-0 ${idx === 0 ? "bg-slate-400 text-white" : idx === 1 ? "bg-gray-300 text-black" : idx === 2 ? "bg-[#0F172A] text-white" : "bg-gray-100 text-black/50"}`}>#{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-black truncate">{ev.supplierName}</div>
                    <div className="text-xs text-black/50 mt-0.5">{ev.projectTitle}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-black">{ev.overallScore.toFixed(1)}%</div>
                    <StarRating value={ev.rating} />
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${GRADE_COLOR[ev.grade]}`}>{ev.grade}</span>
                  <button onClick={() => setSelected(ev)} className="h-8 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800">View</button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
