import { Star, Search, ArrowRight, Clock } from "lucide-react";
import ApplicationModuleBase, { type ModuleConfig } from "./ApplicationModuleBase";

const DEMO_OPPORTUNITIES = [
  { id:"OPP-001", title:"Zimbabwe Human Capital Development Scholarship 2026/27", type:"Scholarship", deadline:"31 Aug 2026", match:94, sponsor:"Ministry of Higher Education", value:"Full tuition + stipend" },
  { id:"OPP-002", title:"SME Growth Finance Facility — Round 3", type:"Financing", deadline:"15 Sep 2026", match:87, sponsor:"Reserve Bank of Zimbabwe", value:"Up to USD 250,000" },
  { id:"OPP-003", title:"Rural Infrastructure Contractor Register — Works Contractors", type:"Employment", deadline:"Open", match:81, sponsor:"Ministry of Rural Development", value:"Contract opportunities" },
  { id:"OPP-004", title:"Community Development Projects — Mashonaland East", type:"Project", deadline:"30 Sep 2026", match:76, sponsor:"Ministry of Local Government", value:"Project grants" },
  { id:"OPP-005", title:"Government Internship Programme 2026/27", type:"Employment", deadline:"31 Jul 2026", match:72, sponsor:"Public Service Commission", value:"Monthly allowance" },
];

const TYPE_COLORS: Record<string,string> = {
  Scholarship: "bg-slate-100 text-[#0F172A]",
  Financing: "bg-slate-100 text-[#0F172A]",
  Employment: "bg-slate-100 text-[#0F172A]",
  Project: "bg-slate-100 text-[#0F172A]",
};

const config: ModuleConfig = {
  key: "opportunities",
  label: "Opportunities",
  color: "bg-rose-700",
  textAccent: "text-rose-700",
  borderAccent: "border-rose-700",
  icon: Star,
  desc: "Opportunities linked to your registered profile: scholarships, employment alerts, financing, projects and grants.",
  steps: ["Browse","Apply","Track","Award"],
  formFields: [
    { key:"opportunityType", label:"Type of Opportunity", type:"select", required:true,
      options:["Scholarship / Bursary","Employment Alert","Financing / Grant","Project / Contract","Training Programme","Other"] },
    { key:"opportunityRef", label:"Opportunity Reference / ID", required:true, placeholder:"e.g. OPP-001" },
    { key:"motivation", label:"Motivation / Statement of Interest", type:"textarea", required:true,
      placeholder:"Why are you applying for this opportunity?…" },
    { key:"relevantExp", label:"Relevant Experience / Qualifications", type:"textarea",
      placeholder:"Describe relevant experience or qualifications…" },
  ],
};

// Extra panel shown above the form — opportunity listings
function OpportunityListings() {
  return (
    <div className="space-y-3 mb-2">
      <div className="flex items-center gap-2 mb-4">
        <input placeholder="Search opportunities by keyword, type or sponsor…"
          className="flex-1 h-10 px-3 border border-black/15 text-sm focus:outline-none rounded-none" />
        <button className="h-10 px-4 bg-[#0f172a] text-white text-sm font-semibold flex items-center gap-1.5">
          <Search className="h-4 w-4" /> Search
        </button>
      </div>
      {DEMO_OPPORTUNITIES.map(o => (
        <div key={o.id} className="bg-white border border-black/10 p-4 hover:shadow-md transition-all">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 ${TYPE_COLORS[o.type]||"bg-gray-100 text-gray-600"}`}>{o.type}</span>
                <span className="text-[10px] font-semibold text-[#0F172A] bg-slate-50 px-2 py-0.5">{o.match}% match</span>
              </div>
              <div className="text-sm font-semibold text-black">{o.title}</div>
              <div className="text-xs text-black/50 mt-1 flex items-center gap-3 flex-wrap">
                <span>{o.sponsor}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Deadline: {o.deadline}</span>
                <span className="font-medium text-black/70">{o.value}</span>
              </div>
            </div>
            <button className="h-8 px-3 bg-[#0f172a] text-white text-xs flex items-center gap-1 flex-shrink-0">
              Apply <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OpportunitiesPage() {
  return <ApplicationModuleBase config={config} extraRegistrationContent={<OpportunityListings />} />;
}
