/**
 * ApplicationsPortalPage — Entry portal for all 6 public application modules.
 * Accessed from the Login Page → Applications tab.
 */
import { useNavigate } from "react-router-dom";
import {
  Landmark, Briefcase, Building2, User, Star, Mail,
  ChevronRight, ArrowLeft, Sparkles, Shield,
} from "lucide-react";
import { Link } from "react-router-dom";

export const APP_MODULES = [
  {
    key: "government-services",
    label: "Government Services",
    icon: Landmark,
    color: "bg-[#0F172A]",
    accent: "border-slate-200",
    lightBg: "bg-slate-50",
    desc: "Processing applications for government services. Apply for licensing, building permits, certificates and more. Track every stage and chat with admin.",
    features: ["Licensing & permits", "Certificates & approvals", "Track per office", "Save & continue later", "Chat with admin", "AI-assisted processing"],
    path: "/applications/government-services",
  },
  {
    key: "employment-services",
    label: "Employment Services",
    icon: Briefcase,
    color: "bg-[#0F172A]",
    accent: "border-slate-200",
    lightBg: "bg-slate-50",
    desc: "Recruitment, training, posting to workstations, transfer requests for all government workers. Create a profile and apply for new posts or promotions.",
    features: ["Job applications & profiles", "Promotions & transfers", "AI shortlisting", "Training requests", "Track application stage", "Chat with HR admin"],
    path: "/applications/employment-services",
  },
  {
    key: "annual-returns-companies",
    label: "Annual Returns — Companies",
    icon: Building2,
    color: "bg-[#0F172A]",
    accent: "border-slate-200",
    lightBg: "bg-slate-50",
    desc: "File annual returns, confirm profile validity, add updated documents if some have expired. Track submission progress at every stage.",
    features: ["Annual returns filing", "Profile validity confirmation", "Upload updated docs", "Track per stage & office", "Chat with admin", "Alerts & notifications"],
    path: "/applications/annual-returns-companies",
  },
  {
    key: "annual-returns-individuals",
    label: "Annual Returns — Individuals",
    icon: User,
    color: "bg-[#0F172A]",
    accent: "border-slate-200",
    lightBg: "bg-slate-50",
    desc: "Create a profile and declare assets, employment history, achievements and biography. Build your electronic CV with attachments and asset declarations.",
    features: ["Asset declarations", "Employment history", "Electronic CV builder", "Biography & achievements", "Photo & attachments", "Alerts & notifications"],
    path: "/applications/annual-returns-individuals",
  },
  {
    key: "opportunities",
    label: "Opportunities",
    icon: Star,
    color: "bg-rose-700",
    accent: "border-rose-700",
    lightBg: "bg-rose-50",
    desc: "Links all registered individuals to opportunities such as scholarships, employment alerts, financing opportunities, projects and grants.",
    features: ["Scholarships & bursaries", "Employment alerts", "Financing & grants", "Projects & tenders", "Auto-matched to your profile", "Alerts & notifications"],
    path: "/applications/opportunities",
  },
  {
    key: "communications",
    label: "Communications",
    icon: Mail,
    color: "bg-[#0F172A]",
    accent: "border-slate-200",
    lightBg: "bg-slate-50",
    desc: "Submit mails, letters and proposals to government offices. Mark confidentiality level, urgency and recipient. Track which office holds your communication.",
    features: ["Submit letters & proposals", "Specify recipient", "Confidential / urgent flags", "Track delivery per office", "Chat with admin", "System directs to registry if unknown"],
    path: "/applications/communications",
  },
];

export default function ApplicationsPortalPage() {
  const navigate = useNavigate();

  return (
    <div className="page-standalone bg-[#EAF1F8] flex flex-col">
      {/* Header */}
      <div className="bg-[#0f172a] text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <div className="h-10 w-10 rounded-full ai-logo-gradient ai-logo-glow flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm md:text-base leading-tight truncate">
            Artificial Intelligence Powered Electronic Government Procurement &amp; Automated Oversight Intelligence System
          </div>
          <div className="text-slate-400 text-xs">Applications &amp; Services Portal</div>
        </div>
        <Link to="/signin" className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors flex-shrink-0">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Title block */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0f172a] text-slate-400 text-xs font-semibold rounded-full mb-3">
            <Shield className="h-3.5 w-3.5" />
            Government of Zimbabwe — Citizens &amp; Public Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] leading-tight mb-2">
            Applications &amp; Services
          </h1>
          <p className="text-sm text-black/55 max-w-xl mx-auto">
            Select a service below to register, apply or track your existing applications.
            All submissions are tracked at every stage with real-time notifications.
          </p>
        </div>

        {/* 6 Module Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {APP_MODULES.map(mod => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.key}
                onClick={() => navigate(mod.path)}
                className={`group text-left bg-white border-2 ${mod.accent} rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
              >
                {/* Card top colour strip */}
                <div className={`${mod.color} px-5 py-4 flex items-center gap-3`}>
                  <div className="h-10 w-10 rounded-xl bg-white/20 grid place-items-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm leading-tight">{mod.label}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/60 group-hover:text-white flex-shrink-0 transition-colors" />
                </div>

                {/* Card body */}
                <div className="px-5 py-4">
                  <p className="text-xs text-black/60 leading-relaxed mb-3">{mod.desc}</p>
                  <div className="space-y-1">
                    {mod.features.slice(0, 4).map(f => (
                      <div key={f} className="flex items-center gap-2 text-xs text-black/55">
                        <div className="h-1.5 w-1.5 rounded-full bg-black/25 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-8 bg-white border border-black/10 rounded-xl p-4 text-center">
          <p className="text-xs text-black/50">
            All services are free to access. Save your application and continue later. Track progress at every stage.
            Need help? Use the <strong>Chat with Admin</strong> feature inside any module.
          </p>
        </div>
      </div>
    </div>
  );
}
