import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { pushNotification } from "@/lib/local-store";
import {
  Building2, Users, Settings, Wallet, ShoppingCart, HeadphonesIcon,
  UserCog, Monitor, ClipboardCheck, Scale, Crown, TrendingUp,
  Activity, FileText, Target, Zap, ChevronRight, BarChart3,
  CheckCircle2, Clock, AlertTriangle, Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

// ─── Department Registry ─────────────────────────────────────────────────────
export const DEPARTMENTS = [
  {
    id: "permanent-secretary",
    name: "Permanent Secretary",
    shortName: "PS Office",
    icon: Crown,
    color: "violet",
    processTitle: "Strategic Leadership & Organisational Oversight",
    steps: 13,
    description: "Sets institutional strategic direction, approves plans and budgets, monitors implementation and reports to Cabinet.",
    kpis: { staff: 12, openTasks: 8, compliance: 98, performanceScore: 94 },
    tags: ["Strategy", "Governance", "Leadership"],
  },
  {
    id: "strategy-policy-planning",
    name: "Strategy, Policy & Planning",
    shortName: "SPP",
    icon: Target,
    color: "blue",
    processTitle: "Policy Development & Strategic Planning",
    steps: 14,
    description: "Develops policies and strategic plans through research, stakeholder input, impact assessment, and iterative review.",
    kpis: { staff: 18, openTasks: 23, compliance: 95, performanceScore: 88 },
    tags: ["Policy", "Planning", "Research"],
  },
  {
    id: "finance-accounting",
    name: "Finance & Accounting",
    shortName: "Finance",
    icon: Wallet,
    color: "green",
    processTitle: "Budgeting & Financial Management",
    steps: 16,
    description: "Manages budgeting, expenditure, payments, reconciliations, financial reporting, and audit support.",
    kpis: { staff: 32, openTasks: 41, compliance: 96, performanceScore: 91 },
    tags: ["Budget", "Payments", "Reporting"],
  },
  {
    id: "procurement-supply-chain",
    name: "Procurement & Supply Chain",
    shortName: "Procurement",
    icon: ShoppingCart,
    color: "amber",
    processTitle: "Procurement of Goods & Services",
    steps: 20,
    description: "Full procurement lifecycle from needs identification through requisitioning, tendering, evaluation, awarding, delivery, and supplier performance.",
    kpis: { staff: 28, openTasks: 67, compliance: 94, performanceScore: 89 },
    tags: ["Tenders", "Suppliers", "Contracts"],
  },
  {
    id: "service-delivery",
    name: "Service Delivery & Client Services",
    shortName: "Service Delivery",
    icon: HeadphonesIcon,
    color: "cyan",
    processTitle: "Client Service Management",
    steps: 14,
    description: "Handles client inquiries, service requests, status communication, complaint resolution, and service improvement.",
    kpis: { staff: 45, openTasks: 112, compliance: 92, performanceScore: 87 },
    tags: ["Clients", "Service", "Feedback"],
  },
  {
    id: "operations",
    name: "Operations",
    shortName: "Operations",
    icon: Settings,
    color: "orange",
    processTitle: "Operational Service Execution",
    steps: 12,
    description: "Executes operational plans, allocates resources, monitors activities, records operational data, and drives continuous improvement.",
    kpis: { staff: 56, openTasks: 34, compliance: 91, performanceScore: 86 },
    tags: ["Operations", "Resources", "Performance"],
  },
  {
    id: "human-resources",
    name: "Human Resources",
    shortName: "HR",
    icon: Users,
    color: "pink",
    processTitle: "Recruitment & Employee Lifecycle Management",
    steps: 23,
    description: "Manages full employee lifecycle: recruitment, onboarding, performance, training, leave, discipline, and separation.",
    kpis: { staff: 24, openTasks: 55, compliance: 97, performanceScore: 92 },
    tags: ["Recruitment", "Performance", "Training"],
  },
  {
    id: "ict-digital",
    name: "ICT & Digital Transformation",
    shortName: "ICT",
    icon: Monitor,
    color: "blue",
    processTitle: "ICT Solution Development & Support",
    steps: 17,
    description: "Drives digital transformation through system development, user support, incident management, security reviews, and continuous improvement.",
    kpis: { staff: 21, openTasks: 29, compliance: 99, performanceScore: 93 },
    tags: ["Systems", "Digital", "Security"],
  },
  {
    id: "administration-facilities",
    name: "Administration & Facilities Management",
    shortName: "Admin & Facilities",
    icon: Building2,
    color: "muted",
    processTitle: "Facilities & Administrative Support Management",
    steps: 14,
    description: "Provides administrative and facilities support, logistics, maintenance, asset management, and service performance reviews.",
    kpis: { staff: 38, openTasks: 47, compliance: 90, performanceScore: 84 },
    tags: ["Facilities", "Logistics", "Maintenance"],
  },
  {
    id: "legal-compliance-audit-risk",
    name: "Legal, Compliance, Internal Audit & Risk",
    shortName: "Legal & Audit",
    icon: Scale,
    color: "red",
    processTitle: "Legal · Compliance · Audit · Risk Management",
    steps: 34,
    description: "Provides legal services, manages compliance frameworks, conducts internal audits, and drives enterprise risk management.",
    kpis: { staff: 19, openTasks: 38, compliance: 99, performanceScore: 95 },
    tags: ["Legal", "Audit", "Risk", "Compliance"],
  },
] as const;

export type DepartmentId = typeof DEPARTMENTS[number]["id"];

// ─── CRM Module definitions (from PDF) ──────────────────────────────────────
const CRM_MODULES = [
  {
    slug: "communications-crm",
    label: "Communications CRM",
    icon: "💬",
    color: "bg-[#0F172A]",
    desc: "Submit and track letters, mails and proposals to government offices. Mark as confidential, official, urgent or escalation. Track which office holds your communication.",
    features: ["Submit letters & proposals", "Track delivery per office", "Confidential / official / urgent flags", "Chat with admin", "Alerts & notifications", "Save & continue later"],
  },
  {
    slug: "service-complaints-crm",
    label: "Service Delivery Complaints CRM",
    icon: "📋",
    color: "bg-red-600",
    desc: "Lodge, track and resolve service delivery complaints. See which office is handling your complaint and how many stages remain to resolution.",
    features: ["Lodge complaints online", "Track per stage & office", "Request more information", "Flag incomplete submissions", "Chat with admin", "Escalation workflow"],
  },
  {
    slug: "recruitment-crm",
    label: "Recruitment CRM",
    icon: "👤",
    color: "bg-[#0F172A]",
    desc: "Process recruitment, training, posting to workstations and transfer requests for all government workers. Create a profile and apply for new posts or promotions.",
    features: ["Create profile & apply for posts", "Apply for promotions & transfers", "AI shortlisting assistant", "Track application stage", "Chat with HR admin", "Alerts & notifications"],
  },
  {
    slug: "services-applications-crm",
    label: "Services Applications CRM",
    icon: "🏛️",
    color: "bg-[#0F172A]",
    desc: "Apply for government services such as licensing, building permits, certificates and more. Track which office holds your application at every stage.",
    features: ["Apply for any government service", "Licensing, permits, certificates", "Track progress per office", "Request more information", "Save and continue later", "Alerts & notifications"],
  },
  {
    slug: "annual-returns-crm",
    label: "Annual Returns CRM",
    icon: "📅",
    color: "bg-[#0F172A]",
    desc: "Companies and individuals file annual returns, confirm profile validity, add new documents, declare assets and submit electronic CVs with attachments.",
    features: ["Companies: file annual returns", "Individuals: asset declarations & CV", "Update expired documents", "Track submission stage", "Alerts & notifications", "Save & continue later"],
  },
  {
    slug: "customer-services-crm",
    label: "Customer Services Delivery CRM",
    icon: "🎯",
    color: "bg-[#0F172A]",
    desc: "Manage all customer service interactions, track service requests and measure delivery performance against service level agreements.",
    features: ["Service request management", "SLA monitoring & alerts", "Customer feedback tracking", "Performance dashboards", "Escalation workflows", "AI response suggestions"],
  },
];

// ─── CRM View Component ───────────────────────────────────────────────────────
function CRMView({ slug }: { slug: string }) {
  const crm = CRM_MODULES.find(c => c.slug === slug);
  const [tab, setTab] = useState<"register" | "track" | "inbox" | "analytics">("register");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", id: "", subject: "", details: "", type: "", priority: "Normal", attachFile: false });

  if (!crm) return null;

  const MOCK_CASES = [
    { ref: `CRM-2026-00184`, subject: "Application for Business Licence", status: "In Review", stage: "Ministry Registry", days: 3, priority: "Normal" },
    { ref: `CRM-2026-00183`, subject: "Transfer Request — Bulawayo Office", status: "Approved", stage: "HR Director", days: 1, priority: "High" },
    { ref: `CRM-2026-00182`, subject: "Annual Returns Filing 2026", status: "Pending Docs", stage: "ZIMRA", days: 7, priority: "Normal" },
    { ref: `CRM-2026-00181`, subject: "Service Complaint — Road Maintenance", status: "Escalated", stage: "Director General", days: 14, priority: "Urgent" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* CRM Header */}
      <div className={`${crm.color} text-white px-6 py-4 flex-shrink-0`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{crm.icon}</span>
          <div>
            <h2 className="text-lg font-bold">{crm.label}</h2>
            <p className="text-sm opacity-75">{crm.desc}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-black/10 bg-white flex-shrink-0">
        {([
          { k: "register", l: "📝 New Application" },
          { k: "track",    l: "🔍 Track Cases" },
          { k: "inbox",    l: "📬 Inbox & Alerts" },
          { k: "analytics",l: "📊 Analytics" },
        ] as const).map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors
              ${tab === t.k ? "border-black text-black" : "border-transparent text-black/50 hover:text-black"}`}>
            {t.l}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 smooth-scroll">
        {/* Register Tab */}
        {tab === "register" && !submitted && (
          <div className="max-w-2xl space-y-5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-[#0F172A]">
              <strong>How it works:</strong> Fill in your registration form below. You can save and continue later. Track your submission at every stage. Chat with admin if you need help.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { k: "name",    l: "Full Name / Organisation *",  ph: "John Banda / Highveld Ltd" },
                { k: "id",      l: "National ID / Reg Number *",  ph: "63-123456 A78 / BR-2024-00001" },
                { k: "subject", l: "Subject / Purpose *",         ph: "e.g. Business Licence Application" },
                { k: "type",    l: "Application Type",            ph: "" },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-xs font-bold text-black/50 uppercase tracking-wider block mb-1">{f.l}</label>
                  {f.k === "type" ? (
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                      className="w-full h-10 px-3 border border-black/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/30">
                      <option value="">Select type…</option>
                      {crm.features.map(feat => <option key={feat}>{feat}</option>)}
                    </select>
                  ) : (
                    <input value={(form as Record<string, unknown>)[f.k] as string} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                      placeholder={f.ph}
                      className="w-full h-10 px-3 border border-black/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/30" />
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs font-bold text-black/50 uppercase tracking-wider block mb-1">Priority</label>
              <div className="flex gap-2">
                {["Normal", "High", "Urgent"].map(p => (
                  <label key={p} className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg cursor-pointer text-sm font-medium transition-colors
                    ${form.priority === p ? "bg-black text-white border-black" : "border-black/15 hover:border-black/30"}`}>
                    <input type="radio" checked={form.priority === p} onChange={() => setForm(prev => ({ ...prev, priority: p }))} className="hidden" />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-black/50 uppercase tracking-wider block mb-1">Details / Description *</label>
              <textarea value={form.details} onChange={e => setForm(p => ({ ...p, details: e.target.value }))}
                rows={4} placeholder="Describe your request in detail…"
                className="w-full px-3 py-2 border border-black/15 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/30" />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-black/60">
                <input type="checkbox" checked={form.attachFile} onChange={e => setForm(p => ({ ...p, attachFile: e.target.checked }))} className="h-4 w-4 accent-black" />
                Attach supporting documents (PDF, DOCX, JPG)
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setSubmitted(true)}
                className="flex-1 h-11 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                Submit Application →
              </button>
              <button className="h-11 px-5 border border-black/20 rounded-lg text-sm hover:bg-gray-50 font-medium">
                Save & Continue Later
              </button>
            </div>
          </div>
        )}

        {/* Success */}
        {tab === "register" && submitted && (
          <div className="max-w-lg">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-lg font-bold text-black mb-1">Application Submitted</h3>
              <p className="text-sm text-black/60 mb-4">Your reference number: <strong>CRM-2026-{String(Math.floor(Math.random() * 90000) + 10000)}</strong></p>
              <p className="text-xs text-black/50 mb-5">You will receive notifications at each stage. You can track progress and chat with admin from the Track Cases tab.</p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => { setSubmitted(false); setTab("track"); }} className="h-9 px-4 bg-black text-white rounded-lg text-sm font-medium">Track My Case</button>
                <button onClick={() => setSubmitted(false)} className="h-9 px-4 border border-black/20 rounded-lg text-sm">New Application</button>
              </div>
            </div>
          </div>
        )}

        {/* Track Cases */}
        {tab === "track" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <input placeholder="Search by reference number or subject…"
                className="flex-1 h-10 px-4 border border-black/15 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              <button className="h-10 px-4 bg-black text-white rounded-lg text-sm font-medium">Search</button>
            </div>
            {MOCK_CASES.map(c => (
              <div key={c.ref} className="bg-white border border-black/10 rounded-xl p-4 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-black/40">{c.ref}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${c.status === "Approved" ? "bg-slate-100 text-[#0F172A]" :
                          c.status === "Escalated" ? "bg-red-100 text-red-700" :
                          c.status === "Pending Docs" ? "bg-slate-100 text-[#0F172A]" :
                          "bg-slate-100 text-[#0F172A]"}`}>
                        {c.status}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
                        ${c.priority === "Urgent" ? "bg-red-100 text-red-700" :
                          c.priority === "High" ? "bg-slate-100 text-[#0F172A]" :
                          "bg-gray-100 text-gray-600"}`}>
                        {c.priority}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-black">{c.subject}</div>
                    <div className="text-xs text-black/50 mt-1">Currently with: <strong>{c.stage}</strong> · {c.days} days at this stage</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button className="h-8 px-3 bg-black text-white rounded-lg text-xs font-medium">Chat Admin</button>
                    <button className="h-8 px-3 border border-black/15 rounded-lg text-xs">View Details</button>
                  </div>
                </div>
                {/* Stage progress */}
                <div className="mt-3 flex gap-1">
                  {["Submitted", "Registry", "Department", "Director", "Final"].map((s, i) => (
                    <div key={s} className="flex-1 text-center">
                      <div className={`h-1.5 rounded-full mb-1 ${i <= 2 ? "bg-black" : "bg-black/10"}`} />
                      <div className="text-[9px] text-black/40">{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inbox */}
        {tab === "inbox" && (
          <div className="space-y-3 max-w-2xl">
            {[
              { icon: "🔔", title: "Document Required — CRM-2026-00182", body: "Please upload your latest company registration certificate within 7 days.", time: "2 hours ago", type: "warning" },
              { icon: "✅", title: "Stage Completed — CRM-2026-00183", body: "Your transfer request has been approved by the HR Director. Next stage: PS Office.", time: "Yesterday", type: "success" },
              { icon: "💬", title: "Message from Admin — CRM-2026-00184", body: "Thank you for your application. Your case has been assigned to the Licensing Department.", time: "2 days ago", type: "info" },
              { icon: "⚠️", title: "Incomplete Submission — CRM-2026-00181", body: "Your complaint was flagged as incomplete. Please provide additional information.", time: "3 days ago", type: "error" },
            ].map((n, i) => (
              <div key={i} className={`border rounded-xl p-4 flex gap-3
                ${n.type === "warning" ? "bg-slate-50 border-slate-200" :
                  n.type === "success" ? "bg-slate-50 border-slate-200" :
                  n.type === "error"   ? "bg-red-50 border-red-200" :
                  "bg-slate-50 border-slate-200"}`}>
                <span className="text-xl flex-shrink-0">{n.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-black">{n.title}</div>
                  <div className="text-xs text-black/60 mt-0.5">{n.body}</div>
                  <div className="text-[10px] text-black/35 mt-1">{n.time}</div>
                </div>
                <button className="h-8 px-3 bg-black text-white rounded-lg text-xs flex-shrink-0 self-start">Reply</button>
              </div>
            ))}
          </div>
        )}

        {/* Analytics */}
        {tab === "analytics" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Cases",      value: "1,284", delta: "+42 this month",   color: "text-[#0F172A]" },
              { label: "Resolved",         value: "1,107", delta: "86.2% resolution",  color: "text-[#0F172A]" },
              { label: "Avg. Resolution",  value: "4.2 days", delta: "Target: 5 days", color: "text-black" },
              { label: "Escalated",        value: "23",    delta: "1.8% rate",         color: "text-red-600" },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-black/10 rounded-xl p-4">
                <div className="text-xs text-black/50 font-medium">{stat.label}</div>
                <div className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
                <div className="text-[11px] text-black/40 mt-0.5">{stat.delta}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Colour helpers ───────────────────────────────────────────────────────────
const ICON_BG: Record<string, string> = {
  violet: "bg-slate-100 text-[#0F172A]",
  blue:   "bg-slate-100 text-[#0F172A]",
  green:  "bg-slate-100 text-[#0F172A]",
  amber:  "bg-slate-100 text-[#0F172A]",
  cyan:   "bg-slate-100 text-[#0F172A]",
  orange: "bg-slate-100 text-[#0F172A]",
  pink:   "bg-slate-100 text-[#0F172A]",
  red:    "bg-red-100 text-red-600",
  muted:  "bg-gray-100 text-gray-600",
};
const BADGE_TONE: Record<string, "violet"|"blue"|"green"|"amber"|"red"|"muted"> = {
  violet: "violet", blue: "blue", green: "green",
  amber: "amber", cyan: "blue", orange: "amber",
  pink: "violet", red: "red", muted: "muted",
};

// ─── Performance data ─────────────────────────────────────────────────────────
const PERF_DATA = DEPARTMENTS.map(d => ({
  dept: d.shortName,
  score: d.kpis.performanceScore,
  compliance: d.kpis.compliance,
}));

const RADAR_DATA = [
  { subject: "Leadership",   A: 94 },
  { subject: "Compliance",   A: 96 },
  { subject: "Efficiency",   A: 88 },
  { subject: "Innovation",   A: 82 },
  { subject: "Service",      A: 87 },
  { subject: "HR",           A: 92 },
];

// ─── Department Card ──────────────────────────────────────────────────────────
function DeptCard({ dept, onOpen }: { dept: typeof DEPARTMENTS[number]; onOpen: () => void }) {
  const Icon = dept.icon;
  const ibg  = ICON_BG[dept.color] ?? ICON_BG.blue;
  const tone = BADGE_TONE[dept.color] ?? "blue";

  return (
    <div
      onClick={onOpen}
      className="bg-white border border-black/8 rounded-2xl p-5 hover:shadow-md hover:border-black/20 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={`h-10 w-10 rounded-xl grid place-items-center flex-shrink-0 ${ibg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <ChevronRight className="h-4 w-4 text-black/20 group-hover:text-black/60 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
      </div>

      <div className="text-sm font-semibold text-black leading-tight mb-1">{dept.name}</div>
      <div className="text-[11px] text-black/45 leading-relaxed mb-3">{dept.description}</div>

      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {dept.tags.map(tag => (
          <Badge key={tag} tone={tone}>{tag}</Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-black/5">
        <div className="text-center">
          <div className="text-base font-bold text-black">{dept.kpis.staff}</div>
          <div className="text-[10px] text-black/40">Staff</div>
        </div>
        <div className="text-center">
          <div className="text-base font-bold text-black">{dept.kpis.performanceScore}%</div>
          <div className="text-[10px] text-black/40">Performance</div>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-black/40">Compliance</span>
          <span className="text-[10px] font-semibold text-black">{dept.kpis.compliance}%</span>
        </div>
        <div className="h-1 rounded-full bg-black/5 overflow-hidden">
          <div
            className={`h-full rounded-full ${dept.kpis.compliance >= 95 ? "bg-[#0F172A]" : dept.kpis.compliance >= 90 ? "bg-[#0F172A]" : "bg-red-500"}`}
            style={{ width: `${dept.kpis.compliance}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-black/40">
        <Activity className="h-3 w-3" />
        <span>{dept.steps} process steps</span>
        <span className="ml-auto text-[10px] font-medium text-black/60">{dept.kpis.openTasks} open tasks</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function CorporatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "High Performing" | "Needs Attention">("All");

  // Detect CRM route from URL
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const crmSlug = CRM_MODULES.find(c => pathname.includes(c.slug))?.slug;

  // If on a CRM sub-route, show CRM view inside AppShell
  if (crmSlug) {
    const crm = CRM_MODULES.find(c => c.slug === crmSlug)!;
    return (
      <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Corporate Governance"
        process="Corporate Overview"
        financialYear="FY2026"
        pageType="dashboard"
      />
        <div className="h-full flex flex-col">
          {/* Breadcrumb */}
          <div className="px-6 py-3 border-b border-black/8 bg-white flex items-center gap-2 flex-shrink-0">
            <button onClick={() => navigate("/corporate")} className="text-xs text-black/50 hover:text-black transition-colors">Corporate Module</button>
            <span className="text-black/25">›</span>
            <span className="text-xs font-semibold text-black">{crm.label}</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <CRMView slug={crmSlug} />
          </div>
        </div>
      </AppShell>
    );
  }

  const totalStaff        = DEPARTMENTS.reduce((s, d) => s + d.kpis.staff, 0);
  const totalOpenTasks    = DEPARTMENTS.reduce((s, d) => s + d.kpis.openTasks, 0);
  const avgPerformance    = Math.round(DEPARTMENTS.reduce((s, d) => s + d.kpis.performanceScore, 0) / DEPARTMENTS.length);
  const avgCompliance     = Math.round(DEPARTMENTS.reduce((s, d) => s + d.kpis.compliance, 0) / DEPARTMENTS.length);

  const filtered = DEPARTMENTS.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchFilter =
      filter === "All" ? true :
      filter === "High Performing" ? d.kpis.performanceScore >= 90 :
      d.kpis.performanceScore < 90;
    return matchSearch && matchFilter;
  });

  const openDept = (dept: typeof DEPARTMENTS[number]) => {
    navigate(`/corporate/${dept.id}`);
    pushNotification(`Opened ${dept.name} department`, "info");
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="violet">Corporate Module</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Corporate Module"
          description="Institutional management hub — all departments, their process towers, performance dashboards, and AI assistants in one place."
        />

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Staff"           value={String(totalStaff)}    delta="Across all depts"   icon={Users}        color="blue"   />
          <KpiCard label="Open Tasks"            value={String(totalOpenTasks)} delta="Across all depts"  icon={Clock}        color="amber"  positive={false} />
          <KpiCard label="Avg Performance Score" value={`${avgPerformance}%`}  delta="+2 pts this quarter" icon={TrendingUp}   color="green"  />
          <KpiCard label="Avg Compliance Rate"   value={`${avgCompliance}%`}   delta="Target: 95%"        icon={CheckCircle2} color="violet" />
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search departments…"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
          <div className="flex gap-1">
            {(["All", "High Performing", "Needs Attention"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`h-9 px-3 rounded-lg text-xs font-medium transition-colors ${
                  filter === f ? "bg-black text-white" : "border border-black/10 text-black/60 hover:bg-black/5"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Department Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {filtered.map(dept => (
            <DeptCard key={dept.id} dept={dept} onOpen={() => openDept(dept)} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-sm text-black/40">
              No departments match "{search}"
            </div>
          )}
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader title="Department Performance Scores" subtitle="Compared to compliance rates" />
            <div className="p-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PERF_DATA} margin={{ bottom: 20 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="dept" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} angle={-30} textAnchor="end" interval={0} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[70, 100]} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="score"      fill="#334155" radius={[3, 3, 0, 0]} name="Performance %" />
                  <Bar dataKey="compliance" fill="#475569" radius={[3, 3, 0, 0]} name="Compliance %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader title="Institutional Health Radar" subtitle="Overall departmental balance" />
            <div className="p-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Radar name="Score" dataKey="A" stroke="#334155" fill="#334155" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Summary Table */}
        <Card className="mb-6">
          <CardHeader title="Department Summary" subtitle="All 10 departments at a glance" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/8">
                  {["Department", "Head", "Staff", "Open Tasks", "Process Steps", "Compliance", "Performance", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-black/40 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {DEPARTMENTS.map((d, i) => {
                  const Icon = d.icon;
                  const ibg  = ICON_BG[d.color] ?? ICON_BG.blue;
                  const tone = BADGE_TONE[d.color] ?? "blue";
                  const heads = ["T. Moyo", "P. Dube", "A. Mpofu", "R. Chikwanda", "S. Nkosi", "J. Banda", "C. Sithole", "N. Ndlovu", "E. Mutasa", "F. Ncube"];
                  return (
                    <tr
                      key={d.id}
                      onClick={() => navigate(`/corporate/${d.id}`)}
                      className="hover:bg-black/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-7 w-7 rounded-lg grid place-items-center flex-shrink-0 ${ibg}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-xs font-semibold text-black">{d.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-black/60">{heads[i]}</td>
                      <td className="px-4 py-3 text-xs text-black">{d.kpis.staff}</td>
                      <td className="px-4 py-3 text-xs text-black">{d.kpis.openTasks}</td>
                      <td className="px-4 py-3 text-xs text-black">{d.steps}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-black/5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${d.kpis.compliance >= 95 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`}
                              style={{ width: `${d.kpis.compliance}%` }}
                            />
                          </div>
                          <span className="text-xs text-black">{d.kpis.compliance}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-black">{d.kpis.performanceScore}%</td>
                      <td className="px-4 py-3">
                        <Badge tone={d.kpis.performanceScore >= 90 ? "green" : "amber"}>
                          {d.kpis.performanceScore >= 90 ? "On Track" : "Review"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* CRM Modules Row */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-black mb-3 uppercase tracking-wider">CRM Modules</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {CRM_MODULES.map(crm => (
              <button key={crm.slug} onClick={() => navigate(`/corporate/${crm.slug}`)}
                className="bg-white border border-black/8 rounded-2xl p-4 hover:shadow-md hover:border-black/20 transition-all text-left group">
                <div className={`h-10 w-10 rounded-xl ${crm.color} grid place-items-center flex-shrink-0 mb-3`}>
                  <span className="text-xl">{crm.icon}</span>
                </div>
                <div className="text-xs font-semibold text-black leading-tight group-hover:text-[#0F172A] transition-colors">{crm.label}</div>
                <div className="text-[10px] text-black/40 mt-1 line-clamp-2">{crm.desc.slice(0, 60)}…</div>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-black/30">
                  <span>{crm.features.length} features</span>
                  <ChevronRight className="h-3 w-3 ml-auto group-hover:text-black/60 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Row */}
        <div className="bg-[#0F172A] border border-slate-200/60 rounded-2xl p-5 flex items-start gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 text-[#0F172A] grid place-items-center flex-shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-black mb-1">Corporate AI Assistant</div>
            <p className="text-xs text-black/60 leading-relaxed">
              Each department has a dedicated AI assistant. Open any department to access its process tower, performance dashboard, and embedded AI assistant for process guidance, anomaly alerts, and decision support.
            </p>
          </div>
          <button
            onClick={() => navigate("/corporate/permanent-secretary")}
            className="flex-shrink-0 h-8 px-4 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-1.5"
          >
            <Zap className="h-3.5 w-3.5" /> Open First Dept
          </button>
        </div>
      </div>
    </AppShell>
  );
}
