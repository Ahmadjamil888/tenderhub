/**
 * ERecruitmentPage — Full E-Recruitment Module
 * 7 sub-modules: HR Planning, Recruitment, Contracting,
 * Orientation & Training, Employee Management,
 * Promotion/Transfers/Dismissal, Close Out - Exit/Retirement
 * Points-based system: Recruitment ≥75%, Promotion ≥80%, Transfers ≥75%, Dismissal ≥75%
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/AppShell";
import {
  Users, UserPlus, GraduationCap, TrendingUp, LogOut,
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle,
  Search, Download, Plus, BarChart3, Star, Shield,
  FileText, MapPin, Eye,
  Sparkles, Building2, Target, Activity,
  UserCheck, UserMinus, RefreshCw,
} from "lucide-react";

// ─── Sub-module definitions ───────────────────────────────────────────────────
type ModStatus = "active" | "pending" | "completed";

type SubModule = {
  id: number;
  label: string;
  short: string;
  icon: React.ElementType;
  color: string;
  bgLight: string;
  status: ModStatus;
  desc: string;
  tabs: string[];
  kpis: { label: string; val: string; trend?: string }[];
};

const SUB_MODULES: SubModule[] = [
  {
    id: 1, label: "HR Planning", short: "HR Planning", icon: BarChart3,
    color: "bg-[#0F172A]", bgLight: "bg-slate-50", status: "active",
    desc: "Strategic workforce planning, manpower budgets, vacancy identification, job analysis & evaluation",
    tabs: ["Strategic Workforce Plan","Manpower Budget","Vacancy Identification","Job Analysis","Job Evaluation","Job Description"],
    kpis: [
      { label: "Funded Positions", val: "1,248", trend: "+12" },
      { label: "Filled Posts", val: "1,091", trend: "+8" },
      { label: "Vacancies", val: "157", trend: "-4" },
      { label: "Pending JDs", val: "23" },
    ],
  },
  {
    id: 2, label: "Recruitment", short: "Recruitment", icon: UserPlus,
    color: "bg-[#0F172A]", bgLight: "bg-slate-50", status: "active",
    desc: "Requisition → Approval → Advertisement → Applications → Screening → Shortlisting → Interviews → Selection → Offer",
    tabs: ["Recruitment Requisition","Recruitment Approval","Vacancy Advertisement","Online Applications","Application Screening","AI Eligibility Screening","Shortlisting","Interview Scheduling","Competency Assessments","Psychometric Testing","Panel Interviews","Background Verification","Security Clearance","Medical Examination","Final Selection","Appointment Approval","Offer Letter","Acceptance of Offer"],
    kpis: [
      { label: "Open Vacancies", val: "34" },
      { label: "Applications", val: "847", trend: "+124" },
      { label: "Shortlisted", val: "112" },
      { label: "Offers Pending", val: "9" },
    ],
  },
  {
    id: 3, label: "Contracting", short: "Contracting", icon: FileText,
    color: "bg-[#0F172A]", bgLight: "bg-slate-50", status: "active",
    desc: "Employment contracts, employee registration, identity verification, payroll & tax registration, benefits, ICT accounts",
    tabs: ["Employment Contract","Employee Registration","Identity Verification","Payroll Registration","Pension Registration","Tax Registration","Benefits Registration","ICT Account Creation","Access Rights","Asset Allocation"],
    kpis: [
      { label: "Active Contracts", val: "1,091" },
      { label: "Contract Renewals", val: "47", trend: "+6" },
      { label: "Expiring 30 Days", val: "18" },
      { label: "Pending ICT Setup", val: "5" },
    ],
  },
  {
    id: 4, label: "Orientation & Training", short: "Orientation", icon: GraduationCap,
    color: "bg-[#0F172A]", bgLight: "bg-slate-50", status: "active",
    desc: "Induction, ethics declaration, probation, performance agreements, training needs, learning management",
    tabs: ["Orientation Programme","Ethics & Integrity Declaration","Confidentiality Agreement","Probation Commencement","Supervisor Assignment","Performance Agreement","Individual Development Plan","Training Needs Assessment","Training Approval","Learning Management","Professional Certification"],
    kpis: [
      { label: "On Induction", val: "23" },
      { label: "On Probation", val: "67" },
      { label: "Training This Month", val: "134", trend: "+22" },
      { label: "Certifications", val: "89" },
    ],
  },
  {
    id: 5, label: "Employee Management", short: "Emp. Mgmt", icon: Users,
    color: "bg-[#0F172A]", bgLight: "bg-slate-50", status: "active",
    desc: "Attendance, leave, overtime, travel, expense claims, payroll processing, performance monitoring & appraisals",
    tabs: ["Attendance Management","Leave Management","Overtime Management","Travel Management","Expense Claims","Payroll Processing","Payroll Approval","Salary Payment","Performance Monitoring","Quarterly Performance Reviews","Annual Performance Appraisal","Recognition & Rewards"],
    kpis: [
      { label: "Active Employees", val: "1,091" },
      { label: "On Leave Today", val: "78" },
      { label: "Overtime This Month", val: "USD 34,200" },
      { label: "Appraisals Due", val: "156" },
    ],
  },
  {
    id: 6, label: "Promotion/Transfers/Dismissal", short: "PTD Admin", icon: TrendingUp,
    color: "bg-[#0F172A]", bgLight: "bg-slate-50", status: "pending",
    desc: "Points-based promotion (≥80%), transfers (≥75%), dismissals (≥75%). Succession, talent management, wellness, relations, disciplinary",
    tabs: ["Promotion Consideration","Promotion Approval","Salary Adjustment","Transfer Request","Transfer Approval","Succession Planning","Talent Management","Employee Wellness","Occupational Health & Safety","Employee Relations","Disciplinary Management","Investigation Process","Hearing","Appeal Process","Suspension Management","Warning Management","Contract Renewal","Contract Expiry Monitoring"],
    kpis: [
      { label: "Promotions This Year", val: "34", trend: "+6" },
      { label: "Transfers Pending", val: "12" },
      { label: "Disciplinary Cases", val: "7" },
      { label: "Wellness Cases", val: "15" },
    ],
  },
  {
    id: 7, label: "Close Out — Exit / Retirement", short: "Exit/Retire", icon: LogOut,
    color: "bg-gray-600", bgLight: "bg-gray-50", status: "pending",
    desc: "Retirement planning & approval, exit interviews, clearance, final benefits, pension processing, record archiving, knowledge transfer",
    tabs: ["Retirement Planning","Retirement Approval","Exit Interview","Clearance Process","Final Benefits Calculation","Final Payroll","Pension Processing","Record Archiving","Knowledge Transfer","Employee Separation","Post-Employment Monitoring"],
    kpis: [
      { label: "Retiring This Year", val: "28" },
      { label: "Exits This Month", val: "6" },
      { label: "Clearances Pending", val: "4" },
      { label: "Pension Claims", val: "19" },
    ],
  },
];

// ─── Mock employee data ───────────────────────────────────────────────────────
const MOCK_EMPLOYEES = [
  { id: "EMP-001", name: "Tatenda Moyo",     ministry: "Finance",   dept: "Revenue",      role: "Senior Revenue Officer",  grade: "D4", status: "Active",    points: 87, joined: "2019-03-15", station: "Harare" },
  { id: "EMP-002", name: "Alois Chikwanda",  ministry: "Health",    dept: "Procurement",  role: "Procurement Officer",     grade: "D3", status: "Active",    points: 82, joined: "2020-07-01", station: "Bulawayo" },
  { id: "EMP-003", name: "Loveness Ndlovu",  ministry: "Justice",   dept: "Legal",        role: "Legal Officer",           grade: "D4", status: "Active",    points: 91, joined: "2018-11-20", station: "Harare" },
  { id: "EMP-004", name: "Rufaro Banda",     ministry: "Education", dept: "Admin",        role: "Administrative Officer",  grade: "D3", status: "Active",    points: 78, joined: "2021-02-10", station: "Gweru" },
  { id: "EMP-005", name: "Simba Nkosi",      ministry: "Finance",   dept: "HR",           role: "HR Manager",              grade: "D5", status: "Active",    points: 93, joined: "2017-09-05", station: "Harare" },
  { id: "EMP-006", name: "Precious Dube",    ministry: "ICT",       dept: "Systems",      role: "Systems Analyst",         grade: "D4", status: "On Leave",  points: 85, joined: "2020-04-15", station: "Harare" },
  { id: "EMP-007", name: "Fortune Mutanga",  ministry: "Lands",     dept: "Stores",       role: "Stores Officer",          grade: "C3", status: "Active",    points: 74, joined: "2022-01-03", station: "Mutare" },
  { id: "EMP-008", name: "Memory Mpofu",     ministry: "Transport", dept: "Planning",     role: "Planning Assistant",      grade: "C2", status: "Probation", points: 68, joined: "2025-09-15", station: "Harare" },
];

const STATUS_COLOR: Record<string, string> = {
  Active: "bg-slate-100 text-[#0F172A]",
  "On Leave": "bg-slate-100 text-[#0F172A]",
  Probation: "bg-slate-100 text-[#0F172A]",
  Suspended: "bg-red-100 text-red-700",
};

const MOD_STATUS_DOT: Record<ModStatus, string> = {
  active: "bg-[#0F172A] animate-pulse", pending: "bg-gray-300", completed: "bg-[#0F172A]",
};

// ─── Points progress bar ──────────────────────────────────────────────────────
function PointsBar({ score, threshold }: { score: number; threshold: number }) {
  const pct = Math.min(100, (score / 100) * 100);
  const pass = score >= threshold;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pass ? "bg-[#0F172A]" : "bg-slate-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-bold ${pass ? "text-[#0F172A]" : "text-[#0F172A]"}`}>{score}%</span>
    </div>
  );
}

// ─── Step-form modal (multi-step workflow form) ───────────────────────────────
function WorkflowFormModal({
  title, steps, onClose,
}: { title: string; steps: string[]; onClose: () => void }) {
  const [step, setStep] = useState(0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-0.5">E-RECRUITMENT WORKFLOW</div>
            <div className="text-lg font-bold text-gray-900">{title}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 mt-1 text-xl font-bold leading-none">&times;</button>
        </div>
        {/* Stepper */}
        <div className="px-6 pt-4 pb-2 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-1">
                <button
                  onClick={() => setStep(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    i < step ? "bg-[#0F172A] text-white" :
                    i === step ? "bg-gray-900 text-white" :
                    "border border-gray-300 text-gray-500 bg-white"
                  }`}
                >
                  {i < step ? <CheckCircle2 className="h-3 w-3" /> : <span>{i+1}</span>}
                  <span className="hidden sm:inline">{s}</span>
                </button>
                {i < steps.length - 1 && <div className="h-px w-4 bg-gray-200" />}
              </div>
            ))}
          </div>
        </div>
        {/* Step content */}
        <div className="px-6 py-4">
          <div className="text-sm font-semibold text-gray-700 mb-3">Step {step+1}: {steps[step]}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              ["Reference Number", "Auto-generated"],
              ["Ministry / Entity", "Select ministry…"],
              ["Department", "Select department…"],
              ["Section / Unit", "Enter section…"],
              ["Station Location", "Enter station…"],
              ["Responsible Officer", "Enter name…"],
              ["Date", new Date().toLocaleDateString()],
              ["Status", "Draft"],
            ].map(([label, placeholder]) => (
              <div key={label} className="border border-gray-200 rounded-lg p-3">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</label>
                <input placeholder={placeholder} className="w-full text-sm text-gray-800 border-none outline-none bg-transparent" />
              </div>
            ))}
          </div>
          {/* Info banner */}
          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex gap-2">
            <AlertTriangle className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#0F172A] italic">
              All documents at this stage are system-generated: Notification Letter, Authorization Letter, Compliance Certificate, Schedule List, Minutes & Resolution Letter.
            </p>
          </div>
        </div>
        {/* Nav buttons */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between gap-3">
          <button
            onClick={() => setStep(s => Math.max(0, s-1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Save Draft
            </button>
            {step < steps.length - 1 ? (
              <button onClick={() => setStep(s => s+1)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#0F172A] text-white text-sm font-semibold">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={onClose}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#0F172A] text-white text-sm font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Submit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-module content panels ────────────────────────────────────────────────

// 1. HR Planning
function HRPlanningPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [showForm, setShowForm] = useState<string | null>(null);
  const tabs = SUB_MODULES[0].tabs;
  return (
    <div className="space-y-4">
      {showForm && <WorkflowFormModal title={showForm} steps={["Details","Documents","Review","Submit"]} onClose={() => setShowForm(null)} />}
      {/* Tab strip */}
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab===i ? "bg-[#0F172A] text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400 uppercase font-bold tracking-widest">HR PLANNING</div>
            <div className="text-base font-bold text-gray-900 mt-0.5">{tabs[activeTab]}</div>
          </div>
          <button onClick={() => setShowForm(tabs[activeTab])}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#0F172A]">
            <Plus className="h-4 w-4" /> New Record
          </button>
        </div>
        {/* Workforce stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "TOTAL FUNDED POSTS", val: "1,248", icon: Target, color: "text-[#0F172A]" },
            { label: "FILLED POSTS", val: "1,091", icon: UserCheck, color: "text-[#0F172A]" },
            { label: "VACANT POSTS", val: "157", icon: UserMinus, color: "text-[#0F172A]" },
            { label: "ON ESTABLISHMENT", val: "98.6%", icon: BarChart3, color: "text-[#0F172A]" },
          ].map(k => (
            <div key={k.label} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
              <k.icon className={`h-5 w-5 ${k.color} mb-1.5`} />
              <div className="text-xl font-bold text-gray-900">{k.val}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Ministry","Department","Funded Posts","Filled","Vacancies","Status"].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Finance","Revenue",245,231,14,"On Track"],
                ["Health","Clinical",380,340,40,"Review Needed"],
                ["Education","Primary",520,498,22,"On Track"],
                ["Justice","Legal",103,98,5,"On Track"],
                ["Transport","Roads",218,178,40,"Critical"],
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  {row.map((cell, j) => (
                    <td key={j} className="py-2.5 px-3 text-gray-700">
                      {j === 5 ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cell==="Critical" ? "bg-red-100 text-red-700" : cell==="Review Needed" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{cell}</span>
                      ) : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 2. Recruitment panel
function RecruitmentPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [showForm, setShowForm] = useState<string | null>(null);
  const tabs = SUB_MODULES[1].tabs;
  const vacancies = [
    { title: "Senior Procurement Officer", ministry: "Finance", closing: "2026-08-15", applicants: 47, grade: "D4", status: "Interviewing", points: 82 },
    { title: "Budget Analyst",             ministry: "Finance", closing: "2026-08-20", applicants: 31, grade: "D3", status: "Screening",   points: 0  },
    { title: "Legal Officer",              ministry: "Justice", closing: "2026-08-25", applicants: 28, grade: "D4", status: "Advertising", points: 0  },
    { title: "ICT Systems Analyst",        ministry: "ICT",     closing: "2026-08-10", applicants: 64, grade: "D4", status: "Shortlisting",points: 0  },
    { title: "Roads Engineer",             ministry: "Transport",closing: "2026-09-01",applicants: 19, grade: "D5", status: "Open",        points: 0  },
  ];
  const statusColor: Record<string, string> = {
    Open: "bg-slate-100 text-[#0F172A]", Advertising: "bg-slate-100 text-[#0F172A]",
    Screening: "bg-slate-100 text-[#0F172A]", Shortlisting: "bg-slate-100 text-[#0F172A]",
    Interviewing: "bg-slate-100 text-[#0F172A]", Closed: "bg-gray-100 text-gray-500",
  };
  return (
    <div className="space-y-4">
      {showForm && <WorkflowFormModal title={showForm} steps={["Requisition","Approval","Advertisement","Applications","Screening","Shortlisting","Interviews","Selection","Offer"]} onClose={() => setShowForm(null)} />}
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab===i ? "bg-[#0F172A] text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400 uppercase font-bold tracking-widest">RECRUITMENT</div>
            <div className="text-base font-bold text-gray-900 mt-0.5">{tabs[activeTab]}</div>
          </div>
          <div className="flex gap-2">
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-[#0F172A] font-semibold">
              Recruitment Pass: <span className="text-[#0F172A]">≥ 75%</span>
            </div>
            <button onClick={() => setShowForm(tabs[activeTab])}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#0F172A]">
              <Plus className="h-4 w-4" /> New Vacancy
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Post Title","Ministry","Closing Date","Applicants","Grade","Status","Points Score","Action"].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vacancies.map((v, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-gray-900">{v.title}</td>
                  <td className="py-2.5 px-3 text-gray-600">{v.ministry}</td>
                  <td className="py-2.5 px-3 text-gray-600">{v.closing}</td>
                  <td className="py-2.5 px-3 font-bold text-[#0F172A]">{v.applicants}</td>
                  <td className="py-2.5 px-3 text-gray-600">{v.grade}</td>
                  <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor[v.status]}`}>{v.status}</span></td>
                  <td className="py-2.5 px-3 w-32">{v.points > 0 ? <PointsBar score={v.points} threshold={75} /> : <span className="text-gray-300 text-xs">—</span>}</td>
                  <td className="py-2.5 px-3">
                    <button onClick={() => setShowForm(v.title)} className="flex items-center gap-1 text-xs text-[#0F172A] hover:text-[#0F172A] font-medium">
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 3. Contracting panel
function ContractingPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [showForm, setShowForm] = useState<string | null>(null);
  const tabs = SUB_MODULES[2].tabs;
  return (
    <div className="space-y-4">
      {showForm && <WorkflowFormModal title={showForm} steps={["Employee Details","Contract Terms","Registration","Benefits","ICT Setup","Review","Submit"]} onClose={() => setShowForm(null)} />}
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab===i ? "bg-[#0F172A] text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400 uppercase font-bold tracking-widest">CONTRACTING</div>
            <div className="text-base font-bold text-gray-900 mt-0.5">{tabs[activeTab]}</div>
          </div>
          <button onClick={() => setShowForm(tabs[activeTab])}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#0F172A]">
            <Plus className="h-4 w-4" /> New Contract
          </button>
        </div>
        {/* Employee directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MOCK_EMPLOYEES.map(emp => (
            <div key={emp.id} className="border border-gray-100 rounded-xl p-4 hover:border-slate-200 hover:bg-slate-50/30 transition-all group">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-[#0F172A] grid place-items-center font-bold text-sm flex-shrink-0">
                  {emp.name.split(" ").map(n=>n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm">{emp.name}</div>
                  <div className="text-xs text-gray-500 truncate">{emp.role}</div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Building2 className="h-3 w-3" />{emp.ministry}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><MapPin className="h-3 w-3" />{emp.station}</span>
                    <span className="text-[10px] font-mono text-gray-400">{emp.grade}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${STATUS_COLOR[emp.status] ?? "bg-gray-100 text-gray-500"}`}>{emp.status}</span>
                  </div>
                </div>
                <button onClick={() => setShowForm(`Contract — ${emp.name}`)}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-[#0F172A] font-medium transition-opacity">
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 4. Orientation & Training panel
function OrientationPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [showForm, setShowForm] = useState<string | null>(null);
  const tabs = SUB_MODULES[3].tabs;
  return (
    <div className="space-y-4">
      {showForm && <WorkflowFormModal title={showForm} steps={["Details","Schedule","Attendance","Assessment","Certificate","Submit"]} onClose={() => setShowForm(null)} />}
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab===i ? "bg-[#0F172A] text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400 uppercase font-bold tracking-widest">ORIENTATION & TRAINING</div>
            <div className="text-base font-bold text-gray-900 mt-0.5">{tabs[activeTab]}</div>
          </div>
          <button onClick={() => setShowForm(tabs[activeTab])}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#0F172A]">
            <Plus className="h-4 w-4" /> New Programme
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {[
            { label: "New Hires on Induction", val: "23", color: "border-slate-200 bg-slate-50" },
            { label: "Employees on Probation", val: "67", color: "border-slate-200 bg-slate-50" },
            { label: "Training Programmes Active", val: "12", color: "border-slate-200 bg-slate-50" },
          ].map(c => (
            <div key={c.label} className={`border rounded-xl p-4 ${c.color}`}>
              <div className="text-2xl font-bold text-gray-900">{c.val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Programme","Type","Participants","Start Date","End Date","Status","Attendance"].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Public Procurement Fundamentals","Training",24,"2026-07-21","2026-07-25","Active","92%"],
                ["Financial Management","Training",18,"2026-07-28","2026-08-01","Upcoming","—"],
                ["Ethics & Integrity Induction","Orientation",23,"2026-07-20","2026-07-20","Active","100%"],
                ["Records Management","Training",31,"2026-08-04","2026-08-06","Upcoming","—"],
                ["Project Management Fundamentals","Training",15,"2026-08-11","2026-08-15","Upcoming","—"],
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  {row.map((cell, j) => (
                    <td key={j} className="py-2.5 px-3 text-gray-700">
                      {j === 5 ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cell==="Active" ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-500"}`}>{cell}</span>
                      ) : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 5. Employee Management panel
function EmployeeManagementPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [showForm, setShowForm] = useState<string | null>(null);
  const tabs = SUB_MODULES[4].tabs;
  return (
    <div className="space-y-4">
      {showForm && <WorkflowFormModal title={showForm} steps={["Employee","Details","Documents","Review","Submit"]} onClose={() => setShowForm(null)} />}
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab===i ? "bg-[#0F172A] text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400 uppercase font-bold tracking-widest">EMPLOYEE MANAGEMENT</div>
            <div className="text-base font-bold text-gray-900 mt-0.5">{tabs[activeTab]}</div>
          </div>
          <button onClick={() => setShowForm(tabs[activeTab])}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#0F172A]">
            <Plus className="h-4 w-4" /> New Record
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Emp No.","Name","Ministry","Dept","Role","Grade","Station","Status","Points","Action"].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_EMPLOYEES.map(emp => (
                <tr key={emp.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-xs text-gray-500">{emp.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">{emp.name}</td>
                  <td className="py-2.5 px-3 text-gray-600">{emp.ministry}</td>
                  <td className="py-2.5 px-3 text-gray-600">{emp.dept}</td>
                  <td className="py-2.5 px-3 text-gray-700">{emp.role}</td>
                  <td className="py-2.5 px-3 text-gray-600">{emp.grade}</td>
                  <td className="py-2.5 px-3 text-gray-600">{emp.station}</td>
                  <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[emp.status] ?? "bg-gray-100 text-gray-500"}`}>{emp.status}</span></td>
                  <td className="py-2.5 px-3 w-28"><PointsBar score={emp.points} threshold={75} /></td>
                  <td className="py-2.5 px-3">
                    <button onClick={() => setShowForm(emp.name)} className="text-xs text-[#0F172A] hover:text-[#0F172A] font-medium flex items-center gap-0.5">
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 6. Promotion/Transfers/Dismissal panel
function PTDPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [showForm, setShowForm] = useState<string | null>(null);
  const tabs = SUB_MODULES[5].tabs;
  const thresholds = [
    { label: "Recruitment", pct: 75, color: "bg-[#0F172A]" },
    { label: "Promotion", pct: 80, color: "bg-[#0F172A]" },
    { label: "Transfers", pct: 75, color: "bg-[#0F172A]" },
    { label: "Dismissal", pct: 75, color: "bg-red-600" },
  ];
  return (
    <div className="space-y-4">
      {showForm && <WorkflowFormModal title={showForm} steps={["Initiate","Investigation","Committee Review","Decision","Notification","Appeal","Close"]} onClose={() => setShowForm(null)} />}
      {/* Points thresholds info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="h-4 w-4 text-[#0F172A]" />
          <span className="text-sm font-bold text-[#0F172A]">Points-Based System Thresholds</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {thresholds.map(t => (
            <div key={t.label} className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">{t.label}</div>
              <div className={`text-xl font-bold text-white ${t.color} rounded-lg px-3 py-1 text-center`}>≥ {t.pct}%</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#0F172A] mt-2 italic">Merit criteria: Hard work, Punctuality, Effective duty management, Good conduct, Good behaviour, Good character, Competence, Relevant experience, Skill, Team player</p>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab===i ? "bg-[#0F172A] text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400 uppercase font-bold tracking-widest">PROMOTION / TRANSFERS / DISMISSAL</div>
            <div className="text-base font-bold text-gray-900 mt-0.5">{tabs[activeTab]}</div>
          </div>
          <button onClick={() => setShowForm(tabs[activeTab])}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#0F172A]">
            <Plus className="h-4 w-4" /> Initiate
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Reference","Employee","Type","From","To","Points Score","Pass/Fail","Status","Action"].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["PTD-2026-001","Tatenda Moyo","Promotion","D4","D5",87,80,"Approved"],
                ["PTD-2026-002","Alois Chikwanda","Transfer","Bulawayo","Harare",82,75,"Pending"],
                ["PTD-2026-003","Fortune Mutanga","Disciplinary","C3","—",68,75,"Review"],
                ["PTD-2026-004","Memory Mpofu","Promotion","C2","C3",78,80,"Below Threshold"],
              ].map((row, i) => {
                const [ref,name,type,from,to,score,threshold,status] = row;
                const passed = Number(score) >= Number(threshold);
                return (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs text-gray-500">{ref}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">{name}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${type==="Promotion" ? "bg-slate-100 text-[#0F172A]" : type==="Transfer" ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-700"}`}>{type}</span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">{from}</td>
                    <td className="py-2.5 px-3 text-gray-600">{to}</td>
                    <td className="py-2.5 px-3 w-28"><PointsBar score={Number(score)} threshold={Number(threshold)} /></td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${passed ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-700"}`}>{passed ? "✓ PASS" : "✗ FAIL"}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status==="Approved" ? "bg-slate-100 text-[#0F172A]" : status==="Pending" ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-500"}`}>{status}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button onClick={() => setShowForm(String(ref))} className="text-xs text-[#0F172A] hover:text-[#0F172A] font-medium flex items-center gap-0.5">
                        <Eye className="h-3.5 w-3.5" /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 7. Close Out - Exit/Retirement panel
function ExitRetirementPanel() {
  const [activeTab, setActiveTab] = useState(0);
  const [showForm, setShowForm] = useState<string | null>(null);
  const tabs = SUB_MODULES[6].tabs;
  return (
    <div className="space-y-4">
      {showForm && <WorkflowFormModal title={showForm} steps={["Exit Interview","Clearance","Final Pay","Pension","Archive","Separation","Close"]} onClose={() => setShowForm(null)} />}
      <div className="flex gap-1.5 flex-wrap">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab===i ? "bg-gray-700 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400 uppercase font-bold tracking-widest">CLOSE OUT — EXIT / RETIREMENT</div>
            <div className="text-base font-bold text-gray-900 mt-0.5">{tabs[activeTab]}</div>
          </div>
          <button onClick={() => setShowForm(tabs[activeTab])}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-700 text-white text-sm font-semibold hover:bg-gray-800">
            <Plus className="h-4 w-4" /> New Case
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "RETIRING THIS YEAR", val: "28", color: "bg-gray-50 border-gray-200" },
            { label: "EXITS THIS MONTH", val: "6",  color: "bg-red-50 border-red-100" },
            { label: "CLEARANCES PENDING", val: "4", color: "bg-slate-50 border-slate-200" },
            { label: "PENSION CLAIMS",     val: "19", color: "bg-slate-50 border-slate-200" },
          ].map(k => (
            <div key={k.label} className={`border rounded-xl p-3 ${k.color}`}>
              <div className="text-2xl font-bold text-gray-900">{k.val}</div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {["Reference","Employee","Type","Expected Date","Clearance","Pension","Status","Action"].map(h => (
                  <th key={h} className="text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["EX-2026-001","Simba Nkosi","Retirement","2026-09-30","Pending","Processing","In Progress"],
                ["EX-2026-002","Jacob Chirwa","Resignation","2026-07-31","Cleared","N/A","Clearance Done"],
                ["EX-2026-003","Agnes Dube","Retirement","2026-08-31","Pending","Initiated","In Progress"],
                ["EX-2026-004","Peter Mwanza","Contract End","2026-08-15","Not Started","N/A","Pending"],
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-xs text-gray-500">{row[0]}</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">{row[1]}</td>
                  <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row[2]==="Retirement" ? "bg-slate-100 text-[#0F172A]" : row[2]==="Resignation" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{row[2]}</span></td>
                  <td className="py-2.5 px-3 text-gray-600">{row[3]}</td>
                  <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row[4]==="Cleared" ? "bg-slate-100 text-[#0F172A]" : row[4]==="Pending" ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-500"}`}>{row[4]}</span></td>
                  <td className="py-2.5 px-3 text-gray-600">{row[5]}</td>
                  <td className="py-2.5 px-3"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row[6]==="Clearance Done" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{row[6]}</span></td>
                  <td className="py-2.5 px-3">
                    <button onClick={() => setShowForm(String(row[0]))} className="text-xs text-gray-700 hover:text-gray-900 font-medium flex items-center gap-0.5">
                      <Eye className="h-3.5 w-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── AI Assistant sidebar ─────────────────────────────────────────────────────
function AIPanel() {
  const suggestions = [
    { icon: Sparkles, text: "3 employees eligible for promotion based on points score ≥80%", color: "text-[#0F172A]" },
    { icon: AlertTriangle, text: "18 contracts expiring within 30 days — action required", color: "text-[#0F172A]" },
    { icon: TrendingUp, text: "Vacancy gap in Transport: 40 unfilled posts above average", color: "text-red-500" },
    { icon: Activity, text: "AI CV Screening: 847 applications ranked — top 15 ready for shortlist", color: "text-[#0F172A]" },
    { icon: Star, text: "Succession planning: 4 high-potential employees identified for D5", color: "text-[#0F172A]" },
    { icon: RefreshCw, text: "AI attendance anomaly: 2 employees flagged for leave abuse review", color: "text-[#0F172A]" },
  ];
  return (
    <div className="bg-[#0F172A] rounded-xl p-4 text-white">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-slate-400" />
        <span className="text-sm font-bold text-white">AI HR Assistant</span>
        <span className="ml-auto text-[10px] bg-[#0F172A]/30 text-slate-400 px-1.5 py-0.5 rounded-full font-semibold">LIVE</span>
      </div>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-2 bg-white/5 rounded-lg p-2.5 hover:bg-white/10 transition-colors cursor-pointer">
            <s.icon className={`h-3.5 w-3.5 ${s.color} mt-0.5 flex-shrink-0`} />
            <span className="text-xs text-white/80 leading-snug">{s.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ERecruitmentPage ────────────────────────────────────────────────────
const PANEL_MAP: Record<number, React.FC> = {
  1: HRPlanningPanel,
  2: RecruitmentPanel,
  3: ContractingPanel,
  4: OrientationPanel,
  5: EmployeeManagementPanel,
  6: PTDPanel,
  7: ExitRetirementPanel,
};

// ── Applicant Portal View — Section 9.5 ─────────────────────────────────────
const MOCK_VACANCIES = [
  { id: "VAC-2026-041", title: "Procurement Officer — Grade 7", ministry: "Ministry of Finance & Economic Development", location: "Harare", closing: "2026-08-15", type: "Permanent", category: "Finance & Procurement", salaryBand: "Grade 7 (USD 850–1,200/mo)", status: "Open" },
  { id: "VAC-2026-040", title: "Civil Engineer — Roads & Infrastructure", ministry: "Ministry of Transport", location: "Bulawayo", closing: "2026-08-10", type: "Permanent", category: "Engineering", salaryBand: "Grade 9 (USD 1,400–1,800/mo)", status: "Open" },
  { id: "VAC-2026-039", title: "Registered Nurse — Rural Health Centres", ministry: "Ministry of Health & Child Care", location: "Manicaland", closing: "2026-08-20", type: "Permanent", category: "Health & Medical", salaryBand: "Grade 6 (USD 750–950/mo)", status: "Open" },
  { id: "VAC-2026-038", title: "ICT Systems Administrator", ministry: "Ministry of ICT", location: "Harare", closing: "2026-08-05", type: "Contract (2yr)", category: "ICT & Technology", salaryBand: "Grade 8 (USD 1,100–1,500/mo)", status: "Open" },
  { id: "VAC-2026-037", title: "Primary School Teacher — Masvingo Province", ministry: "Ministry of Primary & Secondary Education", location: "Masvingo", closing: "2026-08-25", type: "Permanent", category: "Education", salaryBand: "Grade 5 (USD 650–850/mo)", status: "Open" },
  { id: "VAC-2026-036", title: "Budget Officer — Treasury", ministry: "Ministry of Finance", location: "Harare", closing: "2026-07-31", type: "Permanent", category: "Finance & Procurement", salaryBand: "Grade 7 (USD 850–1,200/mo)", status: "Closing Soon" },
];

const APPLY_STEPS = ["Personal Details", "Qualifications", "Experience", "Referees", "Documents Upload", "Declaration", "Review & Submit"];

function ApplicantPortalView() {
  const [apView, setApView] = useState<"browse" | "apply" | "track">("browse");
  const [selectedVac, setSelectedVac] = useState<typeof MOCK_VACANCIES[0] | null>(null);
  const [applyStep, setApplyStep] = useState(0);
  const [searchQ, setSearchQ] = useState("");
  const [appliedIds] = useState<Set<string>>(new Set(["VAC-2026-036"]));

  const filtered = MOCK_VACANCIES.filter(v =>
    !searchQ || v.title.toLowerCase().includes(searchQ.toLowerCase()) ||
    v.ministry.toLowerCase().includes(searchQ.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
      {/* Portal header */}
      <div className="bg-[#0f172a] text-white px-6 py-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</div>
        <div className="text-lg font-black uppercase tracking-wide mt-0.5">Public Service Commission — Job Application Portal</div>
        <div className="text-xs text-slate-400 mt-0.5">Browse vacancies, apply online and track your application status</div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="flex gap-0">
          {(["browse","apply","track"] as const).map(t => (
            <button key={t} onClick={() => setApView(t)}
              className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all capitalize ${apView === t ? "border-[#0f172a] text-[#0f172a]" : "border-transparent text-slate-400 hover:text-slate-700"}`}>
              {t === "browse" ? "🔍 Browse Vacancies" : t === "apply" ? "📝 My Applications" : "📊 Track Status"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        {apView === "browse" && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search by title, ministry, category…"
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172a]/20" />
              </div>
              <span className="text-xs text-slate-500">{filtered.length} vacancies found</span>
            </div>

            {selectedVac ? (
              <div className="max-w-2xl">
                <button onClick={() => setSelectedVac(null)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
                  <ChevronLeft className="h-4 w-4" /> Back to listings
                </button>
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{selectedVac.id}</span>
                      <h2 className="text-xl font-bold text-slate-900 mt-0.5">{selectedVac.title}</h2>
                      <div className="text-sm text-slate-500 mt-1">{selectedVac.ministry} · {selectedVac.location}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${selectedVac.status === "Closing Soon" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>{selectedVac.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {[
                      { label: "CATEGORY",       val: selectedVac.category },
                      { label: "CONTRACT TYPE",  val: selectedVac.type },
                      { label: "SALARY BAND",    val: selectedVac.salaryBand },
                      { label: "CLOSING DATE",   val: selectedVac.closing },
                    ].map(f => (
                      <div key={f.label} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{f.label}</div>
                        <div className="text-sm font-semibold text-slate-800 mt-0.5">{f.val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-5">
                    <div className="text-xs font-bold text-slate-700 mb-2">Job Description</div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      The {selectedVac.ministry} invites applications from suitably qualified candidates for the above position. The successful candidate will be responsible for carrying out duties as assigned by the Head of Department in accordance with the Public Service Regulations and the strategic objectives of the Ministry.
                    </p>
                  </div>
                  {/* Multi-step application form */}
                  <div className="border-t border-slate-200 pt-4">
                    <div className="text-sm font-bold text-slate-800 mb-3">Online Application</div>
                    {/* Stepper */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-4">
                      {APPLY_STEPS.map((s, i) => (
                        <div key={i} className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => setApplyStep(i)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                              i < applyStep ? "bg-[#0f172a] text-white" :
                              i === applyStep ? "bg-[#0f172a] text-white" :
                              "border border-slate-300 text-slate-500"
                            }`}>
                            {i < applyStep ? <CheckCircle2 className="h-3 w-3" /> : <span>{i+1}</span>}
                            <span className="hidden sm:inline">{s}</span>
                          </button>
                          {i < APPLY_STEPS.length - 1 && <div className="h-px w-3 bg-slate-200 flex-shrink-0" />}
                        </div>
                      ))}
                    </div>
                    {/* Step content */}
                    <div className="border border-slate-200 rounded-lg p-4">
                      <div className="text-sm font-semibold text-slate-800 mb-3">Step {applyStep + 1}: {APPLY_STEPS[applyStep]}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {applyStep === 0 && [
                          { label: "FULL NAME", ph: "e.g. Tendai Moyo" },
                          { label: "NATIONAL ID / PASSPORT NO", ph: "e.g. 63-123456 A 72" },
                          { label: "PHONE NUMBER", ph: "+263 7X XXX XXXX" },
                          { label: "EMAIL ADDRESS", ph: "yourname@email.com" },
                          { label: "DATE OF BIRTH", ph: "DD/MM/YYYY" },
                          { label: "PHYSICAL ADDRESS", ph: "Street, City, Province" },
                        ].map(f => (
                          <div key={f.label} className="border border-slate-200 rounded-lg p-3 bg-white">
                            <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">{f.label}</label>
                            <input placeholder={f.ph} className="w-full text-sm text-slate-800 border-none outline-none bg-transparent placeholder-slate-300" />
                          </div>
                        ))}
                        {applyStep !== 0 && (
                          <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-500">
                            Complete {APPLY_STEPS[applyStep]} details here. Fields for this step will be pre-populated from your profile where available.
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <button disabled={applyStep === 0} onClick={() => setApplyStep(s => s - 1)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40">
                        <ChevronLeft className="h-4 w-4" /> Back
                      </button>
                      {applyStep < APPLY_STEPS.length - 1 ? (
                        <button onClick={() => setApplyStep(s => s + 1)}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0f172a] text-white text-sm font-semibold">
                          Next <ChevronRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button onClick={() => { setApView("track"); setSelectedVac(null); }}
                          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold">
                          <CheckCircle2 className="h-4 w-4" /> Submit Application
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(v => (
                  <div key={v.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400">{v.id}</span>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">{v.title}</h3>
                      </div>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${v.status === "Closing Soon" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-700"}`}>{v.status}</span>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                      <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3" />{v.ministry}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{v.location}</div>
                      <div className="flex items-center gap-1.5"><Star className="h-3 w-3" />{v.type}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Closes {v.closing}</span>
                      {appliedIds.has(v.id) ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Applied</span>
                      ) : (
                        <button onClick={() => { setSelectedVac(v); setApplyStep(0); }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0f172a] text-white text-xs font-semibold hover:bg-slate-800">
                          Apply <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {apView === "apply" && (
          <div className="max-w-2xl">
            <div className="text-sm font-bold text-slate-800 mb-3">My Applications</div>
            <div className="space-y-3">
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-400">VAC-2026-036</div>
                  <div className="text-sm font-bold text-slate-900">Budget Officer — Treasury</div>
                  <div className="text-xs text-slate-500">Ministry of Finance · Harare</div>
                </div>
                <span className="px-2 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">Under Review</span>
              </div>
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-5 text-center text-sm text-slate-400">
                No other applications. Browse vacancies to apply.
              </div>
            </div>
          </div>
        )}

        {apView === "track" && (
          <div className="max-w-2xl">
            <div className="text-sm font-bold text-slate-800 mb-3">Application Tracking</div>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-[#0f172a] text-white px-5 py-3">
                <div className="text-xs font-bold">Budget Officer — Treasury · VAC-2026-036</div>
                <div className="text-[10px] text-slate-400">Ministry of Finance · Submitted 18 July 2026</div>
              </div>
              <div className="p-5">
                {[
                  { stage: "Application Submitted",      done: true,  date: "18 Jul 2026" },
                  { stage: "Eligibility Screening",      done: true,  date: "19 Jul 2026" },
                  { stage: "Shortlisting",               done: false, date: "Pending"     },
                  { stage: "Interview Scheduling",       done: false, date: "—"           },
                  { stage: "Competency Assessment",      done: false, date: "—"           },
                  { stage: "Final Selection",            done: false, date: "—"           },
                  { stage: "Offer Letter",               done: false, date: "—"           },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 mb-3">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${s.done ? "bg-emerald-600" : "border-2 border-slate-200 bg-white"}`}>
                      {s.done ? <CheckCircle2 className="h-4 w-4 text-white" /> : <span className="text-[10px] font-bold text-slate-400">{i+1}</span>}
                    </div>
                    <div className="flex-1">
                      <div className={`text-xs font-semibold ${s.done ? "text-slate-900" : "text-slate-400"}`}>{s.stage}</div>
                    </div>
                    <div className="text-[10px] text-slate-400">{s.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ERecruitmentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState(1);
  const [search, setSearch] = useState("");
  // Portal mode: "admin" = HR admin view, "applicant" = public job applicant portal
  const [portalMode, setPortalMode] = useState<"admin" | "applicant">("admin");

  const mod = SUB_MODULES[activeModule - 1];
  const PanelComponent = PANEL_MAP[activeModule];

  const filtered = SUB_MODULES.filter(m =>
    search.length < 2 ||
    m.label.toLowerCase().includes(search.toLowerCase()) ||
    m.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="flex flex-col min-h-0 h-full">
        {/* Top header bar */}
        <div className="border-b border-gray-200 bg-white px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/signin")}
                className="h-8 w-8 rounded-lg border border-gray-200 grid place-items-center text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-all">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="h-9 w-9 rounded-xl bg-[#0F172A] grid place-items-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400">E-RECRUITMENT PORTAL</div>
                <div className="text-base font-bold text-gray-900 leading-snug">Human Resource Management System</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mode switcher */}
              <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
                <button
                  onClick={() => setPortalMode("applicant")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${portalMode === "applicant" ? "bg-[#0F172A] text-white shadow" : "text-gray-500 hover:text-gray-800"}`}
                >
                  🌐 Applicant Portal
                </button>
                <button
                  onClick={() => setPortalMode("admin")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${portalMode === "admin" ? "bg-[#0F172A] text-white shadow" : "text-gray-500 hover:text-gray-800"}`}
                >
                  🔒 HR Admin
                </button>
              </div>
              {portalMode === "admin" && (
                <>
                  <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search modules…"
                      className="h-9 w-56 pl-9 pr-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20" />
                  </div>
                  <button className="flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                    <Download className="h-4 w-4" /> Export
                  </button>
                  <button className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#0F172A]">
                    <Plus className="h-4 w-4" /> New Application
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Applicant Portal view */}
        {portalMode === "applicant" && <ApplicantPortalView />}

        {/* Admin layout — hidden when applicant mode active */}
        {portalMode === "admin" && <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left sidebar — 7 modules */}
          <div className="w-56 border-r border-gray-200 bg-white flex-shrink-0 overflow-y-auto">
            <div className="p-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2 mb-2">Modules</div>
              <div className="space-y-0.5">
                {filtered.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setActiveModule(m.id)}
                    className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                      activeModule === m.id
                        ? `${m.color} text-white shadow`
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <m.icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${activeModule === m.id ? "text-white" : "text-gray-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold leading-snug truncate ${activeModule === m.id ? "text-white" : "text-gray-900"}`}>{m.label}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${activeModule === m.id ? "bg-white/60" : MOD_STATUS_DOT[m.status]}`} />
                        <span className={`text-[10px] ${activeModule === m.id ? "text-white/70" : "text-gray-400"} capitalize`}>{m.status}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="p-5 space-y-4">
              {/* Module KPI bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {mod.kpis.map(k => (
                  <div key={k.label} className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{k.label}</div>
                    <div className="text-xl font-bold text-gray-900 mt-0.5">{k.val}</div>
                    {k.trend && <div className="text-xs text-[#0F172A] font-semibold">{k.trend} this period</div>}
                  </div>
                ))}
              </div>

              {/* Module desc banner */}
              <div className={`${mod.bgLight} border rounded-xl px-4 py-3 flex items-start gap-3`}>
                <mod.icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${mod.color.replace("bg-","text-")}`} />
                <div>
                  <div className="text-sm font-bold text-gray-900">{mod.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{mod.desc}</div>
                </div>
              </div>

              {/* Panel content */}
              <PanelComponent />
            </div>
          </div>

          {/* Right AI panel */}
          <div className="w-64 border-l border-gray-200 bg-white flex-shrink-0 overflow-y-auto p-3 hidden xl:block">
            <AIPanel />
            {/* GIS employee location note */}
            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-[#0F172A]" />
                <span className="text-xs font-bold text-[#0F172A]">Employee GIS Map</span>
              </div>
              <p className="text-xs text-[#0F172A]">Location pins for all employees. Green = Active, Yellow = Temporary, Red = Fired/Retired.</p>
              <button onClick={() => navigate("/gis")}
                className="mt-2 w-full py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#0F172A] flex items-center justify-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> Open GIS Map
              </button>
            </div>
            {/* Reports shortcut */}
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="text-xs font-bold text-gray-700 mb-2">Quick Reports</div>
              <div className="space-y-1.5">
                {["Staff per Ministry","New Recruits per Year","Promotions per Year","Retirements per Year"].map(r => (
                  <button key={r} className="w-full text-left text-xs text-gray-600 hover:text-[#0F172A] py-1 flex items-center gap-1.5 hover:bg-slate-50 rounded px-1.5 transition-colors">
                    <BarChart3 className="h-3.5 w-3.5 text-gray-400" /> {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>}
      </div>
    </AppShell>
  );
}
