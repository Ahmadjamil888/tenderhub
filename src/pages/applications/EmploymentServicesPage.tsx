import { useState } from "react";
import { Briefcase, Bell, Clock, MapPin, DollarSign, Share2, MessageCircle, Bookmark } from "lucide-react";
import ApplicationModuleBase, { type ModuleConfig } from "./ApplicationModuleBase";

// ── Vacancy listing card shown above the application form ─────────────────
const SAMPLE_VACANCIES = [
  {
    id: "VAC-2026-0041",
    title: "Senior Procurement Officer",
    employmentType: "Permanent",
    closingDate: "2026-07-31",
    contractDuration: "Indefinite",
    location: "Harare, Harare Province",
    salaryGrade: "Grade C3 — USD 1,200–1,800 per month",
    specialInstructions: "Applicants must hold a valid CIPS qualification. Only shortlisted candidates will be contacted.",
    employer: "Ministry of Finance and Economic Development",
  },
  {
    id: "VAC-2026-0038",
    title: "ICT Support Technician (Internship)",
    employmentType: "Internship",
    closingDate: "2026-07-20",
    contractDuration: "12 months",
    location: "Bulawayo, Bulawayo Province",
    salaryGrade: "Internship Stipend — USD 250 per month",
    specialInstructions: "Final-year students or recent graduates only. Must attach transcript.",
    employer: "Ministry of Information Communication Technology",
  },
  {
    id: "VAC-2026-0035",
    title: "Infrastructure Project Manager",
    employmentType: "Temporary",
    closingDate: "2026-08-05",
    contractDuration: "24 months",
    location: "Masvingo, Masvingo Province",
    salaryGrade: "Grade B2 — USD 2,400–3,200 per month",
    specialInstructions: "Must have 10+ years civil engineering experience. Security clearance required.",
    employer: "Ministry of Transport and Infrastructural Development",
  },
];

const EMPLOYMENT_TYPE_COLORS: Record<string, string> = {
  Permanent:  "bg-slate-100 text-[#0F172A] border-slate-200",
  Temporary:  "bg-slate-100 text-[#0F172A] border-slate-200",
  Internship: "bg-slate-100 text-[#0F172A] border-slate-200",
};

// ── Status filter bar — preserved as instructed ────────────────────────────
const STATUS_FILTERS = ["All", "Coming", "Open", "Awarded", "Past", "Flagged", "Plan"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

function VacancyListings() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [askVacancyId, setAskVacancyId] = useState<string | null>(null);
  const [askText, setAskText] = useState("");
  const [sharedId, setSharedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const handleSave = (id: string) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/applications/employment-services?vacancy=${id}`;
    if (navigator.clipboard) navigator.clipboard.writeText(url);
    setSharedId(id);
    setTimeout(() => setSharedId(null), 2500);
  };

  return (
    <div className="mb-6">
      {/* Status filter bar — MAINTAIN THIS STATUS UPDATES BAR */}
      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        {STATUS_FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`h-7 px-3 rounded-full text-xs font-medium transition-colors border ${
              statusFilter === f
                ? "bg-[#0F172A] text-white border-slate-200"
                : "bg-white border-black/10 text-black/60 hover:border-slate-200 hover:text-[#0F172A]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <h3 className="text-xs font-bold text-black/50 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Bell className="h-3.5 w-3.5 text-[#0F172A]" />
        Vacancy Alerts
      </h3>

      <div className="space-y-4">
        {SAMPLE_VACANCIES.map(v => (
          <div key={v.id} className="bg-white border border-black/10 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-[#0F172A] px-4 py-3 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${EMPLOYMENT_TYPE_COLORS[v.employmentType] ?? "bg-gray-100 text-gray-700"}`}>
                    {v.employmentType}
                  </span>
                  <span className="text-[10px] font-mono text-white/60">{v.id}</span>
                </div>
                <div className="text-sm font-bold text-white leading-snug">{v.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">{v.employer}</div>
              </div>
              <button
                onClick={() => handleSave(v.id)}
                title="Save vacancy"
                className={`flex-shrink-0 h-8 w-8 rounded-lg grid place-items-center transition-colors ${savedIds.includes(v.id) ? "bg-white text-[#0F172A]" : "bg-white/20 text-white hover:bg-white/30"}`}
              >
                <Bookmark className={`h-4 w-4 ${savedIds.includes(v.id) ? "fill-violet-700" : ""}`} />
              </button>
            </div>

            {/* Details grid */}
            <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs border-b border-black/6">
              <div className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-black/40 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-black/40 font-semibold uppercase">Closing Date</div>
                  <div className="font-semibold text-black">{v.closingDate}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-black/40 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-black/40 font-semibold uppercase">Contract Duration</div>
                  <div className="font-semibold text-black">{v.contractDuration}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-black/40 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-black/40 font-semibold uppercase">Employer Location</div>
                  <div className="font-semibold text-black">{v.location}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="h-3.5 w-3.5 text-black/40 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-[10px] text-black/40 font-semibold uppercase">Salary Grade</div>
                  <div className="font-semibold text-black">{v.salaryGrade}</div>
                </div>
              </div>
            </div>

            {/* Special instructions */}
            {v.specialInstructions && (
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                <div className="text-[10px] font-bold text-[#0F172A] uppercase mb-0.5">Special Instructions</div>
                <div className="text-xs text-[#0F172A] leading-relaxed">{v.specialInstructions}</div>
              </div>
            )}

            {/* Ask / Share row */}
            <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setAskVacancyId(askVacancyId === v.id ? null : v.id)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 text-[#0F172A] text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Ask for Clarifications
              </button>
              <button
                onClick={() => handleShare(v.id)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-black/10 text-black/60 text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" />
                {sharedId === v.id ? "Link Copied!" : "Share With a Friend"}
              </button>
            </div>

            {/* Ask clarification inline */}
            {askVacancyId === v.id && (
              <div className="px-4 pb-4">
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-3 py-2 text-[10px] font-bold text-[#0F172A] uppercase">
                    Ask a Question — {v.title}
                  </div>
                  <div className="flex gap-2 p-2">
                    <input
                      value={askText}
                      onChange={e => setAskText(e.target.value)}
                      placeholder="Type your clarification question here…"
                      className="flex-1 h-8 px-2 text-xs border border-black/10 rounded focus:outline-none focus:ring-1 focus:ring-violet-400"
                    />
                    <button
                      onClick={() => { if (askText.trim()) { setAskText(""); setAskVacancyId(null); } }}
                      disabled={!askText.trim()}
                      className="h-8 px-3 bg-[#0F172A] text-white text-xs font-semibold rounded hover:bg-[#0F172A] disabled:opacity-40"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const config: ModuleConfig = {
  key: "employment-services",
  label: "Employment Services",
  color: "bg-[#0F172A]",
  textAccent: "text-[#0F172A]",
  borderAccent: "border-slate-200",
  icon: Briefcase,
  desc: "Recruitment, training, posting to workstations and transfer requests for all government workers. Create a profile and apply for new posts or promotions.",
  steps: ["Profile","Application","Shortlisting","Interview","Posting"],
  formFields: [
    { key:"applicationType", label:"Application Type", type:"select", required:true,
      options:["New Recruitment","Internal Promotion","Transfer Request","Training Application","Acting Appointment","Contract Renewal"] },
    { key:"currentPost", label:"Current Post / Grade", placeholder:"e.g. Executive Officer — Grade D4" },
    { key:"targetPost", label:"Post Applied For", required:true, placeholder:"e.g. Senior Executive Officer — Grade C3" },
    { key:"ministry", label:"Ministry / Entity", required:true, placeholder:"e.g. Ministry of Finance" },
    { key:"department", label:"Department", placeholder:"e.g. Budget & Treasury" },
    { key:"qualifications", label:"Highest Qualification", type:"select", required:true,
      options:["Certificate","Diploma","Bachelor's Degree","Honours Degree","Master's Degree","Doctorate","Professional Qualification","Other"] },
    { key:"yearsExp", label:"Years of Experience", type:"select",
      options:["Less than 1 year","1–3 years","3–5 years","5–10 years","10–15 years","15+ years"] },
    { key:"motivation", label:"Motivation Letter / Statement", type:"textarea", required:true,
      placeholder:"Briefly state why you are applying for this position…" },
  ],
};

export default function EmploymentServicesPage() {
  return <ApplicationModuleBase config={config} extraRegistrationContent={<VacancyListings />} />;
}
