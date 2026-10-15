import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { BookOpen, Plus, Search, Eye, X, Download, Sparkles, Tag, CheckCircle2, AlertTriangle, TrendingUp, Filter } from "lucide-react";
import { pushNotification } from "@/lib/local-store";

type LessonCategory = "Process" | "Technical" | "Financial" | "Supplier" | "Risk" | "Legal" | "HR" | "General";
type LessonStatus = "Draft" | "Under Review" | "Approved" | "Published";

type LessonLearned = {
  id: string; refNumber: string; contractNumber: string; projectTitle: string;
  ministry: string; category: LessonCategory; status: LessonStatus;
  projectSummary: string; successes: string[]; challenges: string[];
  risksEncountered: string[]; riskMitigation: string[];
  recommendations: string[]; futureImprovements: string[];
  bestPractices: string[]; authorName: string; authorRole: string;
  submittedDate: string; approvedDate: string; tags: string[];
};

const SEED_LESSONS: LessonLearned[] = [
  {
    id: "LL-2026-001", refNumber: "LL-2026-001", contractNumber: "CN-2025-0312", projectTitle: "Harare Water Treatment Phase I", ministry: "Ministry of Water", category: "Technical", status: "Published",
    projectSummary: "Successfully completed Phase I of Harare Water Treatment Plant upgrade. Project delivered 7 days early with 2.1% cost savings achieved through competitive procurement.",
    successes: ["Early completion by 7 days", "2.1% cost savings vs contract value", "Zero safety incidents throughout execution", "Strong collaboration between contractor and government team"],
    challenges: ["Geological surprises during excavation added 4 weeks to planning phase", "Community consultations required more time than anticipated", "Equipment delivery delays due to import permits"],
    risksEncountered: ["Unexpected rock formations at depth 8m", "Contractor cash flow stress at Month 4", "Specification ambiguity on pump specifications"],
    riskMitigation: ["Additional geotechnical borings commissioned early", "Mobilisation advance reviewed and disbursed", "Technical clarification meeting held with all bidders"],
    recommendations: ["Include geotechnical survey as mandatory pre-procurement activity", "Build 10% time contingency for community consultation in all infrastructure projects", "Pre-clear import permits before contract award"],
    futureImprovements: ["Develop detailed specification library for water treatment equipment", "Establish standing arrangement for geotechnical consultants"],
    bestPractices: ["Weekly progress meetings with contractor proved highly effective", "3-way payment matching eliminated all payment disputes", "Digital document management ensured complete audit trail"],
    authorName: "T. Moyo", authorRole: "CPO", submittedDate: "2026-02-01", approvedDate: "2026-02-15",
    tags: ["Water", "Infrastructure", "Procurement", "Contract Management"],
  },
  {
    id: "LL-2026-002", refNumber: "LL-2026-002", contractNumber: "CN-2026-0399", projectTitle: "Pfumvudza Fertiliser 2025/26", ministry: "Ministry of Agriculture", category: "Process", status: "Published",
    projectSummary: "Framework agreement for fertiliser supply achieved full national coverage on time for the agricultural season. Strong supplier performance noted.",
    successes: ["100% of target districts covered on schedule", "Quality specifications met in all sample tests", "SME supplier participation at 28%"],
    challenges: ["Logistics coordination across 10 provinces was complex", "Last-mile delivery to remote areas required additional resources"],
    risksEncountered: ["Fuel shortages impacting transport", "Counterfeit fertiliser identified in one batch from sub-supplier"],
    riskMitigation: ["Fuel pre-purchase arrangement put in place", "Independent quality testing at depot level implemented"],
    recommendations: ["Include logistics plan as scored criterion in tender evaluation", "Mandatory quality testing at all district distribution points"],
    futureImprovements: ["Establish regional fertiliser warehouses for faster distribution"],
    bestPractices: ["Framework agreement model with quarterly ordering proved highly efficient"],
    authorName: "R. Chikwanda", authorRole: "Contract Manager", submittedDate: "2026-06-05", approvedDate: "",
    tags: ["Agriculture", "Framework", "Logistics", "Quality"],
  },
];

const CATEGORY_COLOR: Record<LessonCategory, string> = {
  Process: "bg-slate-100 text-[#0F172A]", Technical: "bg-slate-100 text-[#0F172A]",
  Financial: "bg-slate-100 text-[#0F172A]", Supplier: "bg-slate-100 text-[#0F172A]",
  Risk: "bg-red-100 text-red-700", Legal: "bg-slate-100 text-[#0F172A]",
  HR: "bg-slate-100 text-[#0F172A]", General: "bg-gray-100 text-gray-600",
};
const STATUS_COLOR: Record<LessonStatus, string> = {
  Draft: "bg-gray-100 text-gray-600", "Under Review": "bg-slate-100 text-[#0F172A]",
  Approved: "bg-slate-100 text-[#0F172A]", Published: "bg-slate-100 text-[#0F172A]",
};

function LessonDetailModal({ lesson, onClose }: { lesson: LessonLearned; onClose: () => void }) {
  const [tab, setTab] = useState<"Overview" | "Details" | "Recommendations">("Overview");
  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <div>
            <div className="text-sm font-bold">{lesson.refNumber} — {lesson.projectTitle}</div>
            <div className="text-xs text-black/50 mt-0.5">{lesson.ministry} · by {lesson.authorName} ({lesson.authorRole})</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[lesson.status]}`}>{lesson.status}</span>
            <button onClick={onClose}><X className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="flex gap-1 px-6 border-b border-black/8">
          {(["Overview", "Details", "Recommendations"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-2.5 text-xs font-medium border-b-2 -mb-px ${tab === t ? "border-black text-black" : "border-transparent text-black/40"}`}>{t}</button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === "Overview" && (
            <>
              <div className="bg-[#F8F8F8] rounded-xl p-4">
                <div className="text-xs font-semibold text-black mb-2">Project Summary</div>
                <div className="text-xs text-black/70 leading-relaxed">{lesson.projectSummary}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2"><CheckCircle2 className="h-4 w-4 text-slate-600" /><span className="text-xs font-semibold text-black">Successes</span></div>
                  <ul className="space-y-1">{lesson.successes.map((s, i) => <li key={i} className="text-xs text-black/70 flex gap-2"><span className="text-slate-600">•</span>{s}</li>)}</ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-slate-600" /><span className="text-xs font-semibold text-black">Challenges</span></div>
                  <ul className="space-y-1">{lesson.challenges.map((c, i) => <li key={i} className="text-xs text-black/70 flex gap-2"><span className="text-slate-600">•</span>{c}</li>)}</ul>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {lesson.tags.map(tag => <span key={tag} className="text-[10px] font-medium bg-black/5 text-black/60 px-2 py-0.5 rounded-full">{tag}</span>)}
              </div>
            </>
          )}
          {tab === "Details" && (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-black mb-2">Risks Encountered</div>
                <ul className="space-y-1">{lesson.risksEncountered.map((r, i) => <li key={i} className="text-xs text-black/70 flex gap-2"><span className="text-red-400">▸</span>{r}</li>)}</ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-black mb-2">Risk Mitigation Actions</div>
                <ul className="space-y-1">{lesson.riskMitigation.map((r, i) => <li key={i} className="text-xs text-black/70 flex gap-2"><span className="text-slate-400">▸</span>{r}</li>)}</ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-black mb-2">Best Practices Identified</div>
                <ul className="space-y-1">{lesson.bestPractices.map((b, i) => <li key={i} className="text-xs text-black/70 flex gap-2"><span className="text-slate-600">★</span>{b}</li>)}</ul>
              </div>
            </div>
          )}
          {tab === "Recommendations" && (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-black mb-2">Recommendations for Future</div>
                <ul className="space-y-2">{lesson.recommendations.map((r, i) => <li key={i} className="text-xs text-black/70 bg-[#F8F8F8] rounded-lg p-2.5 flex gap-2"><span className="text-slate-600 font-bold">{i + 1}.</span>{r}</li>)}</ul>
              </div>
              <div>
                <div className="text-xs font-semibold text-black mb-2">Future Improvements</div>
                <ul className="space-y-1">{lesson.futureImprovements.map((f, i) => <li key={i} className="text-xs text-black/70 flex gap-2"><span className="text-[#0F172A]">→</span>{f}</li>)}</ul>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-black/8 px-6 py-3 flex justify-end bg-[#fafafa]">
          <button onClick={() => pushNotification("Lessons learned report downloaded.", "success")} className="h-8 px-4 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1.5"><Download className="h-3.5 w-3.5" />Download</button>
        </div>
      </div>
    </div>
  );
}

export default function LessonsLearnedPage() {
  const [lessons, setLessons] = useState(SEED_LESSONS);
  const [selected, setSelected] = useState<LessonLearned | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filtered = lessons.filter(l =>
    (categoryFilter === "All" || l.category === categoryFilter) &&
    (l.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
     l.refNumber.toLowerCase().includes(search.toLowerCase()) ||
     l.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Knowledge Management"
        process="Lessons Learned"
        financialYear="FY2026"
        pageType="form"
      />
      {selected && <LessonDetailModal lesson={selected} onClose={() => setSelected(null)} />}
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Lessons Learned Repository"
          description="Capture, share, and access knowledge from completed procurement projects. Enable future teams to benefit from past experience."
          actions={
            <button onClick={() => pushNotification("New lessons learned record created.", "success")} className="h-9 px-3 rounded-md bg-black text-white text-sm flex items-center gap-1.5 hover:bg-gray-800">
              <Plus className="h-4 w-4" />Add Lessons
            </button>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Records" value={String(lessons.length)} delta="Knowledge base entries" />
          <KpiCard label="Published" value={String(lessons.filter(l => l.status === "Published").length)} delta="Available to all teams" positive />
          <KpiCard label="Best Practices" value={String(lessons.reduce((s, l) => s + l.bestPractices.length, 0))} delta="Identified practices" positive />
          <KpiCard label="Recommendations" value={String(lessons.reduce((s, l) => s + l.recommendations.length, 0))} delta="Future improvements" positive />
        </div>
        <Card>
          <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-black/8">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lessons, projects, tags…" className="w-full h-9 pl-9 pr-4 rounded-lg border border-black/10 text-sm focus:outline-none" /></div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-black/10 text-sm bg-white focus:outline-none">
              <option value="All">All Categories</option>
              {["Process", "Technical", "Financial", "Supplier", "Risk", "Legal", "HR", "General"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="divide-y divide-black/5">
            {filtered.map(lesson => (
              <div key={lesson.id} className="p-4 hover:bg-[#F8F8F8]/60 cursor-pointer" onClick={() => setSelected(lesson)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-black/40">{lesson.refNumber}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLOR[lesson.category]}`}>{lesson.category}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[lesson.status]}`}>{lesson.status}</span>
                    </div>
                    <div className="text-sm font-semibold text-black mt-1">{lesson.projectTitle}</div>
                    <div className="text-xs text-black/50 mt-0.5">{lesson.ministry} · {lesson.authorName} · {lesson.submittedDate}</div>
                    <div className="text-xs text-black/60 mt-1 line-clamp-2">{lesson.projectSummary}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {lesson.tags.slice(0, 4).map(tag => <span key={tag} className="text-[10px] bg-black/5 text-black/50 px-1.5 py-0.5 rounded">{tag}</span>)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="text-xs text-black/40">{lesson.successes.length} successes · {lesson.challenges.length} challenges</div>
                    <div className="text-xs text-black/40">{lesson.recommendations.length} recommendations</div>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-12 text-center text-black/30">
                <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <div className="text-sm">No lessons found</div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
