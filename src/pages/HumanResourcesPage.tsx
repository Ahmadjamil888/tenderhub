/**
 * HumanResourcesPage — Full HR Workbench
 * Mirrors the ProcurementWorkbenchPage pattern exactly:
 *  - Left sidebar: 10 HR modules (like stages)
 *  - Right: active module header + form tab strip + rich form content
 *  - Top: KPI bar + module type switcher
 */
import { useState } from "react";
import { AppShell, Badge, PageHeader, Card, CardHeader, KpiCard, PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { pushNotification } from "@/lib/local-store";
import {
  Users, UserPlus, Star, TrendingUp, DollarSign, Calendar, FileText,
  Sparkles, Search, Download, BarChart3, CheckCircle2, Clock,
  AlertTriangle, Shield, Briefcase, GraduationCap, Heart, Award,
  ChevronLeft, ChevronRight, Plus, Send, Save, RotateCcw,
  Mail, Phone, MapPin, Activity, RefreshCcw, Eye, Lock,
} from "lucide-react";
import InlineWorkbench from "@/components/InlineWorkbench";

// ─── Types ────────────────────────────────────────────────────────────────────
type ModuleStatus = "active" | "pending" | "completed";

type HRModule = {
  id: number;
  label: string;
  short: string;
  owner: string;
  status: ModuleStatus;
  color: string;
  icon: React.ElementType;
  formTabs: string[];
  desc: string;
};

// ─── HR Modules (mirror of procurement stages) ───────────────────────────────
const HR_MODULES: HRModule[] = [
  { id: 1,  label: "HR Dashboard",          short: "HR Dashboard",    owner: "HR Manager",            status: "active",    color: "bg-[#0F172A]",    icon: BarChart3,     desc: "Overview, KPIs, alerts",
    formTabs: ["Overview","Headcount Analytics","Turnover & Attrition","AI Insights"] },
  { id: 2,  label: "Recruitment & Hiring",  short: "Recruitment",     owner: "Recruitment Officer",   status: "active",    color: "bg-[#0F172A]",  icon: UserPlus,      desc: "Job postings, applications, interviews, offers",
    formTabs: ["Job Requisition","Vacancy Posting","Applications","Shortlisting","Interviews","Offer & Approval"] },
  { id: 3,  label: "Staff Records",         short: "Staff Records",   owner: "HR Records Officer",    status: "active",    color: "bg-[#0F172A]",  icon: FileText,      desc: "Personnel files, contracts, history",
    formTabs: ["Employee Profile","Contract Details","Document Repository","Employment History","Personal Details"] },
  { id: 4,  label: "Performance Mgmt",      short: "Performance",     owner: "Performance Officer",   status: "active",    color: "bg-[#0F172A]",   icon: Star,          desc: "Appraisals, KPIs, reviews, PIPs",
    formTabs: ["KPI Setup","Mid-Year Review","Annual Appraisal","Improvement Plan","Performance Rating"] },
  { id: 5,  label: "Payroll & Benefits",    short: "Payroll",         owner: "Payroll Officer",       status: "active",    color: "bg-[#0F172A]", icon: DollarSign,    desc: "Salaries, deductions, allowances, payslips",
    formTabs: ["Payroll Processing","Allowances & Deductions","Payslip Generation","PAYE & Tax","Benefits Administration","Payroll Audit"] },
  { id: 6,  label: "Leave Management",      short: "Leave",           owner: "HR Officer",            status: "active",    color: "bg-[#0F172A]",    icon: Calendar,      desc: "Annual, sick, maternity, special leave",
    formTabs: ["Leave Application","Leave Approvals","Leave Balances","Leave Calendar","Leave Reports"] },
  { id: 7,  label: "Training & Development",short: "Training",        owner: "L&D Officer",           status: "pending",   color: "bg-[#0F172A]",    icon: GraduationCap, desc: "Courses, certifications, skills matrix",
    formTabs: ["Training Needs Analysis","Training Plan","Course Registration","Attendance & Results","Skills Matrix","Certifications"] },
  { id: 8,  label: "Disciplinary & Grievance",short:"Disciplinary",   owner: "HR Manager",            status: "pending",   color: "bg-red-600",     icon: Shield,        desc: "Warnings, hearings, appeals, resolutions",
    formTabs: ["Incident Report","Investigation","Disciplinary Hearing","Outcome & Sanction","Appeals","Grievance Register"] },
  { id: 9,  label: "Health & Wellness",     short: "Wellness",        owner: "OHS Officer",           status: "pending",   color: "bg-rose-500",    icon: Heart,         desc: "Occupational health, wellness programmes",
    formTabs: ["Health Declaration","OHS Incidents","Wellness Programmes","Medical Aid","Return to Work"] },
  { id: 10, label: "Retirement & Exit",     short: "Exit",            owner: "HR Manager",            status: "pending",   color: "bg-gray-600",    icon: Award,         desc: "Resignation, retirement, clearance, handover",
    formTabs: ["Exit Interview","Clearance Checklist","Final Pay Calculation","Provident Fund","Handover Documentation","Exit Report"] },
];

const STATUS_DOT: Record<ModuleStatus, string> = {
  active: "bg-[#2563eb] animate-pulse", pending: "bg-gray-300", completed: "bg-[#0F172A]",
};
const STATUS_BADGE: Record<ModuleStatus, string> = {
  active: "bg-[#2563eb]/20 text-[#2563eb]", pending: "bg-gray-100 text-gray-500", completed: "bg-slate-100 text-[#0F172A]",
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_EMPLOYEES = [
  { id: "EMP-001", name: "Tatenda Moyo",     dept: "Procurement",  role: "Senior Procurement Officer", grade: "D4", salary: "USD 3,200", status: "Active",    perf: 87, joined: "2019-03-15" },
  { id: "EMP-002", name: "Alois Chikwanda",  dept: "Finance",      role: "Finance Officer",             grade: "D3", salary: "USD 2,800", status: "Active",    perf: 82, joined: "2020-07-01" },
  { id: "EMP-003", name: "Loveness Ndlovu",  dept: "Legal",        role: "Legal Officer",               grade: "D4", salary: "USD 3,500", status: "Active",    perf: 91, joined: "2018-11-20" },
  { id: "EMP-004", name: "Rufaro Chikwanda", dept: "Audit",        role: "Internal Auditor",            grade: "D3", salary: "USD 2,900", status: "Active",    perf: 78, joined: "2021-02-10" },
  { id: "EMP-005", name: "Simba Nkosi",      dept: "HR",           role: "HR Manager",                  grade: "D5", salary: "USD 3,800", status: "Active",    perf: 93, joined: "2017-09-05" },
  { id: "EMP-006", name: "Precious Dube",    dept: "ICT",          role: "Systems Analyst",             grade: "D4", salary: "USD 3,100", status: "On Leave",  perf: 85, joined: "2020-04-15" },
  { id: "EMP-007", name: "Fortune Mutanga",  dept: "Stores",       role: "Stores Officer",              grade: "C3", salary: "USD 1,900", status: "Active",    perf: 74, joined: "2022-01-03" },
  { id: "EMP-008", name: "Memory Mpofu",     dept: "Procurement",  role: "Procurement Assistant",       grade: "C2", salary: "USD 1,600", status: "Probation", perf: 68, joined: "2025-09-15" },
];
const VACANCIES = [
  { title: "Senior Procurement Officer",   dept: "Procurement", closing: "2026-07-15", applicants: 24, grade: "D4", status: "Open" },
  { title: "Budget Analyst",               dept: "Finance",     closing: "2026-07-20", applicants: 18, grade: "D3", status: "Open" },
  { title: "IT Support Specialist",        dept: "ICT",         closing: "2026-06-30", applicants: 31, grade: "C4", status: "Interview" },
  { title: "Compliance Officer",           dept: "Audit",       closing: "2026-07-10", applicants: 12, grade: "D4", status: "Shortlisted" },
];
const LEAVE_REQUESTS = [
  { emp: "T. Moyo",      type: "Annual",    from: "2026-07-14", to: "2026-07-25", days: 8,  status: "Approved" },
  { emp: "A. Chikwanda", type: "Medical",   from: "2026-06-28", to: "2026-07-02", days: 3,  status: "Approved" },
  { emp: "P. Dube",      type: "Annual",    from: "2026-06-20", to: "2026-07-11", days: 15, status: "Active" },
  { emp: "F. Mutanga",   type: "Maternity", from: "2026-07-01", to: "2026-09-30", days: 90, status: "Approved" },
  { emp: "M. Mpofu",     type: "Study",     from: "2026-07-18", to: "2026-07-22", days: 3,  status: "Pending" },
];
const HR_KPIS = [
  { label: "Total Headcount",    value: "1,284", delta: "+12 this month",  positive: true,  icon: Users,         color: "blue"   as const },
  { label: "Vacancies",          value: "47",    delta: "Open positions",  positive: false, icon: UserPlus,      color: "amber"  as const },
  { label: "Leave This Month",   value: "89",    delta: "Approved",        positive: true,  icon: Calendar,      color: "pink"   as const },
  { label: "Avg Performance",    value: "83.4%", delta: "+2.1% vs LY",    positive: true,  icon: Star,          color: "green"  as const },
  { label: "Payroll (Monthly)",  value: "USD 3.2M", delta: "This cycle",  positive: true,  icon: DollarSign,    color: "green"  as const },
  { label: "Training Hrs (MTD)", value: "2,481", delta: "On target",       positive: true,  icon: GraduationCap, color: "cyan"   as const },
  { label: "Turnover Rate",      value: "4.2%",  delta: "-0.8% vs LY",    positive: true,  icon: TrendingUp,    color: "violet" as const },
  { label: "Disciplinary Cases", value: "6",     delta: "Active",          positive: false, icon: Shield,        color: "red"    as const },
];

// ─── Form Field Renderer (mirrors FormTabContent in ProcurementWorkbenchPage) ─
type FieldDef = { label: string; type: string; defaultValue?: string; placeholder?: string; options?: string[]; system?: boolean; fullWidth?: boolean };

function getHRFormFields(module: HRModule, tab: string): FieldDef[] {
  const ref = `HR-${Date.now().toString().slice(-6)}`;
  // Module 1 — HR Dashboard
  if (module.id === 1) {
    if (tab.includes("Overview")) return [
      { label: "Report Period",    type: "select", defaultValue: "July 2026",   options: ["July 2026","June 2026","Q2 2026","YTD 2026"] },
      { label: "Ministry / Entity",type: "select", defaultValue: "All",         options: ["All","Ministry of Health","Ministry of Finance","ZIMRA","ZINARA"] },
      { label: "Department Filter",type: "select", defaultValue: "All",         options: ["All","Procurement","Finance","ICT","HR","Audit","Legal"] },
    ];
    if (tab.includes("Turnover")) return [
      { label: "Period",       type: "select", defaultValue: "YTD 2026", options: ["MTD","QTD","YTD 2026","FY 2025"] },
      { label: "Voluntary Exits",  type: "number", defaultValue: "12" },
      { label: "Involuntary Exits",type: "number", defaultValue: "3" },
      { label: "Total Headcount",  type: "number", defaultValue: "1284", system: true },
      { label: "Turnover Rate (%)",type: "text",   defaultValue: "4.2%", system: true },
      { label: "Benchmark (%)",    type: "text",   defaultValue: "5.0% industry average", system: true },
    ];
  }
  // Module 2 — Recruitment
  if (module.id === 2) {
    if (tab.includes("Job Requisition")) return [
      { label: "Requisition No",      type: "text",   defaultValue: `JR-${ref}`, system: true },
      { label: "Position Title",      type: "text",   placeholder: "e.g. Senior Procurement Officer" },
      { label: "Department",          type: "select", defaultValue: "Procurement", options: ["Procurement","Finance","ICT","HR","Audit","Legal","Stores"] },
      { label: "Grade",               type: "select", defaultValue: "D4", options: ["C1","C2","C3","C4","D1","D2","D3","D4","D5","E1","E2"] },
      { label: "No. of Posts",        type: "number", defaultValue: "1" },
      { label: "Justification",       type: "textarea", placeholder: "Business justification for the post…", fullWidth: true },
      { label: "Budget Code",         type: "text",   placeholder: "IFMIS budget line code" },
      { label: "Approved by",         type: "select", defaultValue: "Pending", options: ["Pending","HR Manager","Director","PS","Minister"] },
    ];
    if (tab.includes("Applications")) return [
      { label: "Applicant Name",      type: "text",   placeholder: "Full name" },
      { label: "Application Ref",     type: "text",   defaultValue: `APP-${ref}`, system: true },
      { label: "Gender",              type: "select", defaultValue: "Select", options: ["Male","Female","Other","Prefer not to say"] },
      { label: "Disability",          type: "select", defaultValue: "No", options: ["No","Yes"] },
      { label: "Qualifications",      type: "select", defaultValue: "Select", options: ["Certificate","Diploma","Degree","Masters","PhD"] },
      { label: "Experience (years)",  type: "number", defaultValue: "3" },
      { label: "Interview Score",     type: "number", defaultValue: "0" },
      { label: "Shortlist Status",    type: "select", defaultValue: "Pending", options: ["Pending","Shortlisted","Not Shortlisted","Invited to Interview","Offered","Declined"] },
      { label: "Notes",               type: "textarea", placeholder: "Recruiter notes…", fullWidth: true },
    ];
    if (tab.includes("Offer")) return [
      { label: "Offer Letter No",     type: "text",   defaultValue: `OL-${ref}`, system: true },
      { label: "Candidate Name",      type: "text",   placeholder: "Successful candidate name" },
      { label: "Offer Grade",         type: "select", defaultValue: "D4", options: ["C1","C2","C3","C4","D1","D2","D3","D4","D5"] },
      { label: "Offer Salary (USD)",  type: "currency" },
      { label: "Reporting Date",      type: "date",   defaultValue: new Date().toISOString().split("T")[0] },
      { label: "Acceptance Status",   type: "select", defaultValue: "Pending", options: ["Pending","Accepted","Declined","Counter-offer"] },
      { label: "Contract Type",       type: "select", defaultValue: "Permanent", options: ["Permanent","Fixed Term","Contract","Casual","Internship"] },
      { label: "Approved by HR",      type: "select", defaultValue: "Pending", options: ["Pending","HR Manager","Director","PS"] },
    ];
  }
  // Module 3 — Staff Records
  if (module.id === 3) {
    if (tab.includes("Employee Profile")) return [
      { label: "Employee ID",         type: "text",   defaultValue: `EMP-${ref}`, system: true },
      { label: "Full Name",           type: "text",   placeholder: "Full legal name" },
      { label: "National ID",         type: "text",   placeholder: "National ID number" },
      { label: "Date of Birth",       type: "date" },
      { label: "Gender",              type: "select", defaultValue: "Select", options: ["Male","Female","Other"] },
      { label: "Nationality",         type: "text",   defaultValue: "Zimbabwean" },
      { label: "Phone",               type: "text",   placeholder: "+263 7X XXX XXXX" },
      { label: "Email",               type: "text",   placeholder: "name@gov.zw" },
      { label: "Home Address",        type: "textarea", placeholder: "Residential address…", fullWidth: true },
    ];
    if (tab.includes("Contract Details")) return [
      { label: "Contract No",         type: "text",   defaultValue: `CON-${ref}`, system: true },
      { label: "Department",          type: "select", defaultValue: "Procurement", options: ["Procurement","Finance","ICT","HR","Audit","Legal","Stores"] },
      { label: "Job Title",           type: "text",   placeholder: "Official job title" },
      { label: "Grade",               type: "select", defaultValue: "D4", options: ["C1","C2","C3","C4","D1","D2","D3","D4","D5","E1","E2"] },
      { label: "Employment Date",     type: "date" },
      { label: "Contract Type",       type: "select", defaultValue: "Permanent", options: ["Permanent","Fixed Term","Contract","Casual"] },
      { label: "Contract End Date",   type: "date" },
      { label: "Reporting To",        type: "text",   placeholder: "Supervisor name & title" },
      { label: "Basic Salary (USD)",  type: "currency" },
    ];
  }
  // Module 4 — Performance
  if (module.id === 4) {
    if (tab.includes("KPI Setup")) return [
      { label: "Review Period",       type: "select", defaultValue: "2026 Annual", options: ["2026 Annual","2026 Mid-Year","Q1 2026","Q2 2026"] },
      { label: "Employee Name",       type: "text",   placeholder: "Select employee" },
      { label: "KPI 1 — Description", type: "text",   placeholder: "Key performance indicator 1" },
      { label: "KPI 1 — Weight (%)",  type: "number", defaultValue: "30" },
      { label: "KPI 1 — Target",      type: "text",   placeholder: "Measurable target" },
      { label: "KPI 2 — Description", type: "text",   placeholder: "Key performance indicator 2" },
      { label: "KPI 2 — Weight (%)",  type: "number", defaultValue: "25" },
      { label: "KPI 3 — Description", type: "text",   placeholder: "Key performance indicator 3" },
      { label: "KPI 3 — Weight (%)",  type: "number", defaultValue: "20" },
      { label: "KPI 4 — Description", type: "text",   placeholder: "Key performance indicator 4" },
      { label: "KPI 4 — Weight (%)",  type: "number", defaultValue: "15" },
      { label: "KPI 5 — Description", type: "text",   placeholder: "Key performance indicator 5" },
      { label: "KPI 5 — Weight (%)",  type: "number", defaultValue: "10" },
      { label: "Agreed by Employee",  type: "select", defaultValue: "Pending", options: ["Pending","Agreed","Disputed"] },
    ];
    if (tab.includes("Annual Appraisal")) return [
      { label: "Employee",            type: "text",   placeholder: "Employee name" },
      { label: "Appraiser",           type: "text",   placeholder: "Supervisor/Manager name" },
      { label: "Overall Rating",      type: "select", defaultValue: "Select", options: ["1 — Unsatisfactory","2 — Needs Improvement","3 — Meets Expectations","4 — Exceeds Expectations","5 — Outstanding"] },
      { label: "KPI Achievement (%)", type: "number", defaultValue: "83" },
      { label: "Strengths",           type: "textarea", placeholder: "Key strengths observed…", fullWidth: true },
      { label: "Areas for Improvement", type: "textarea", placeholder: "Development areas…", fullWidth: true },
      { label: "Employee Comments",   type: "textarea", placeholder: "Employee self-assessment…", fullWidth: true },
      { label: "Approved by HR",      type: "select", defaultValue: "Pending", options: ["Pending","Approved","Returned"] },
    ];
  }
  // Module 5 — Payroll
  if (module.id === 5) {
    if (tab.includes("Payroll Processing")) return [
      { label: "Payroll Run No",      type: "text",   defaultValue: `PAY-${ref}`, system: true },
      { label: "Pay Period",          type: "select", defaultValue: "July 2026", options: ["July 2026","June 2026","May 2026"] },
      { label: "Currency",            type: "select", defaultValue: "USD", options: ["USD","ZWG"] },
      { label: "Total Gross Payroll", type: "currency", defaultValue: "3200000" },
      { label: "Total PAYE",          type: "currency", defaultValue: "320000" },
      { label: "Total Net Payroll",   type: "currency", defaultValue: "2880000" },
      { label: "No. of Employees",    type: "number", defaultValue: "1284" },
      { label: "EFT Batch Reference", type: "text",   defaultValue: `EFT-${ref}`, system: true },
      { label: "Run Status",          type: "select", defaultValue: "Draft", options: ["Draft","Submitted","Approved","Processed","Paid"] },
    ];
    if (tab.includes("Payslip Generation")) return [
      { label: "Employee ID",         type: "text",   placeholder: "EMP-XXXXXX" },
      { label: "Pay Period",          type: "select", defaultValue: "July 2026", options: ["July 2026","June 2026","May 2026"] },
      { label: "Basic Salary",        type: "currency" },
      { label: "Housing Allowance",   type: "currency" },
      { label: "Transport Allowance", type: "currency" },
      { label: "Gross Pay",           type: "currency", defaultValue: "Auto-calculated", system: true },
      { label: "PAYE",                type: "currency", defaultValue: "Auto-calculated", system: true },
      { label: "NSSA Contribution",   type: "currency", defaultValue: "Auto-calculated", system: true },
      { label: "Net Pay",             type: "currency", defaultValue: "Auto-calculated", system: true },
    ];
  }
  // Module 6 — Leave
  if (module.id === 6) {
    if (tab.includes("Leave Application")) return [
      { label: "Leave Application No",type: "text",   defaultValue: `LEA-${ref}`, system: true },
      { label: "Employee Name",       type: "text",   placeholder: "Employee name" },
      { label: "Leave Type",          type: "select", defaultValue: "Annual", options: ["Annual","Sick","Maternity","Paternity","Study","Compassionate","Special","Unpaid"] },
      { label: "From Date",           type: "date" },
      { label: "To Date",             type: "date" },
      { label: "No. of Days",         type: "number", defaultValue: "Auto-calculated", system: true },
      { label: "Leave Balance (days)",type: "number", defaultValue: "Auto-calculated", system: true },
      { label: "Acting Officer",      type: "text",   placeholder: "Name of officer covering duties" },
      { label: "Reason",              type: "textarea", placeholder: "Reason for leave…", fullWidth: true },
      { label: "Supervisor Approval", type: "select", defaultValue: "Pending", options: ["Pending","Approved","Declined"] },
      { label: "HR Approval",         type: "select", defaultValue: "Pending", options: ["Pending","Approved","Declined"] },
    ];
  }
  // Module 7 — Training
  if (module.id === 7) {
    if (tab.includes("Training Needs")) return [
      { label: "TNA Reference",       type: "text",   defaultValue: `TNA-${ref}`, system: true },
      { label: "Department",          type: "select", defaultValue: "All", options: ["All","Procurement","Finance","ICT","HR","Audit","Legal"] },
      { label: "Assessment Period",   type: "select", defaultValue: "Q3 2026", options: ["Q1 2026","Q2 2026","Q3 2026","Q4 2026","FY 2026"] },
      { label: "Training Gap Description", type: "textarea", placeholder: "Identified training gaps and needs…", fullWidth: true },
      { label: "Priority Level",      type: "select", defaultValue: "Medium", options: ["Critical","High","Medium","Low"] },
      { label: "Estimated Cost (USD)",type: "currency" },
      { label: "No. of Staff",        type: "number" },
      { label: "Approved",            type: "select", defaultValue: "Pending", options: ["Pending","Approved","Declined","Deferred"] },
    ];
  }
  // Module 8 — Disciplinary
  if (module.id === 8) {
    if (tab.includes("Incident Report")) return [
      { label: "Incident Ref",        type: "text",   defaultValue: `INC-${ref}`, system: true },
      { label: "Employee Name",       type: "text",   placeholder: "Employee name" },
      { label: "Date of Incident",    type: "date" },
      { label: "Nature of Misconduct",type: "select", defaultValue: "Select", options: ["Insubordination","Absenteeism","Theft","Fraud","Harassment","Negligence","Other"] },
      { label: "Description",         type: "textarea", placeholder: "Detailed description of the incident…", fullWidth: true },
      { label: "Witnesses",           type: "text",   placeholder: "Names of witnesses" },
      { label: "Reported by",         type: "text",   placeholder: "Reporting officer" },
      { label: "Action Taken",        type: "select", defaultValue: "Under Investigation", options: ["Verbal Warning","Written Warning","Final Written Warning","Suspension","Dismissal","Under Investigation","Referred to Police"] },
    ];
  }
  // Module 10 — Exit
  if (module.id === 10) {
    if (tab.includes("Exit Interview")) return [
      { label: "Exit Ref",            type: "text",   defaultValue: `EXIT-${ref}`, system: true },
      { label: "Employee Name",       type: "text",   placeholder: "Departing employee" },
      { label: "Last Working Day",    type: "date" },
      { label: "Reason for Leaving",  type: "select", defaultValue: "Select", options: ["Resignation","Retirement","Retrenchment","End of Contract","Dismissal","Death","Medical Incapacity"] },
      { label: "Exit Interview Score",type: "number", defaultValue: "0" },
      { label: "Would Recommend",     type: "select", defaultValue: "Yes", options: ["Yes","No","Maybe"] },
      { label: "Key Comments",        type: "textarea", placeholder: "Employee exit comments…", fullWidth: true },
      { label: "Clearance Signed",    type: "select", defaultValue: "No", options: ["No","In Progress","Yes"] },
    ];
  }
  // Default
  return [
    { label: "Reference No",          type: "text",   defaultValue: ref, system: true },
    { label: "Date",                  type: "date",   defaultValue: new Date().toISOString().split("T")[0] },
    { label: "Responsible Officer",   type: "text",   defaultValue: module.owner },
    { label: "Status",                type: "select", defaultValue: "In Progress", options: ["Draft","In Progress","Pending Approval","Approved","Completed"] },
    { label: "Notes / Comments",      type: "textarea", placeholder: "Add notes…", fullWidth: true },
  ];
}

// ─── Form Field Renderer component ───────────────────────────────────────────
function HRFormField({ f }: { f: FieldDef }) {
  const base = "w-full border border-black/15 px-3 text-xs text-black focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 disabled:bg-[#EAF1F8] disabled:text-black/40";
  if (f.type === "textarea") return (
    <textarea rows={3} defaultValue={f.defaultValue} placeholder={f.placeholder} disabled={f.system}
      className={`${base} py-2 resize-none`} style={{ borderRadius: 0 }} />
  );
  if (f.type === "select") return (
    <select defaultValue={f.defaultValue} disabled={f.system} className={`${base} h-8`} style={{ borderRadius: 0 }}>
      {f.options?.map(o => <option key={o}>{o}</option>)}
    </select>
  );
  return (
    <input type={f.type === "currency" ? "number" : f.type} defaultValue={f.defaultValue} placeholder={f.placeholder}
      disabled={f.system} className={`${base} h-8`} style={{ borderRadius: 0 }} />
  );
}

function HRFormTabContent({ module, tab }: { module: HRModule; tab: string }) {
  const act = (msg: string) => pushNotification(msg, "success");
  const fields = getHRFormFields(module, tab);

  // Special dashboard overview rendering
  if (module.id === 1 && tab.includes("Overview")) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {HR_KPIS.slice(0, 4).map(k => (
            <div key={k.label} className="bg-[#F8F9FA] border border-black/8 p-3">
              <div className="text-[9px] text-black/45 uppercase tracking-wider">{k.label}</div>
              <div className="text-xl font-bold text-[#0f172a] mt-1">{k.value}</div>
              <div className={`text-[10px] font-semibold mt-0.5 ${k.positive ? "text-[#0F172A]" : "text-red-500"}`}>{k.delta}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {HR_KPIS.slice(4).map(k => (
            <div key={k.label} className="bg-[#F8F9FA] border border-black/8 p-3">
              <div className="text-[9px] text-black/45 uppercase tracking-wider">{k.label}</div>
              <div className="text-xl font-bold text-[#0f172a] mt-1">{k.value}</div>
              <div className={`text-[10px] font-semibold mt-0.5 ${k.positive ? "text-[#0F172A]" : "text-red-500"}`}>{k.delta}</div>
            </div>
          ))}
        </div>
        {/* AI Alert */}
        <div className="bg-slate-50 border border-slate-200 px-4 py-3 flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-[#0F172A] flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-[#0F172A] mb-0.5">AI HR Assistant</div>
            <p className="text-xs text-[#0F172A] leading-relaxed">47 open vacancies. Turnover rate improved to 4.2% (↓ 0.8%). 8 employees on probation have appraisals due this month. 12 training certificates expire within 30 days. EMP-008 (M. Mpofu) probation review due 15 Dec.</p>
          </div>
        </div>
        {/* Employee directory preview */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#0f172a] text-white">
              <tr>{["ID","Name","Dept","Role","Grade","Salary","Performance","Status"].map(h => (
                <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {MOCK_EMPLOYEES.map(e => (
                <tr key={e.id} className="hover:bg-[#F9F9F9] transition-colors">
                  <td className="px-3 py-2 font-mono text-[10px] text-black/45">{e.id}</td>
                  <td className="px-3 py-2 font-semibold text-[#0f172a] whitespace-nowrap">{e.name}</td>
                  <td className="px-3 py-2 text-black/65">{e.dept}</td>
                  <td className="px-3 py-2 text-black/65 whitespace-nowrap">{e.role}</td>
                  <td className="px-3 py-2 font-bold text-black/55">{e.grade}</td>
                  <td className="px-3 py-2 font-semibold text-[#0F172A]">{e.salary}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-14 bg-black/8 h-1.5 overflow-hidden" style={{ borderRadius: 0 }}>
                        <div className={`h-full ${e.perf >= 90 ? "bg-[#0F172A]" : e.perf >= 75 ? "bg-[#0F172A]" : "bg-red-500"}`} style={{ width: `${e.perf}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold ${e.perf >= 90 ? "text-[#0F172A]" : e.perf >= 75 ? "text-[#0F172A]" : "text-red-500"}`}>{e.perf}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 ${e.status === "Active" ? "bg-slate-100 text-[#0F172A]" : e.status === "On Leave" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`} style={{ borderRadius: 0 }}>{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Recruitment — Applications renders a list
  if (module.id === 2 && tab.includes("Applications")) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-black/60">Applicant Register — {VACANCIES[0].title}</span>
          <button onClick={() => act("Application registered")} className="h-7 px-3 bg-[#0f172a] text-white text-[10px] flex items-center gap-1 hover:bg-black/80" style={{ borderRadius: 0 }}>
            <Plus className="h-3 w-3" /> New Application
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#F0F0F0]">
              <tr>{["#","Applicant","Gender","Qualifications","Experience","Score","Status"].map(h => (
                <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-black/60 border-b border-black/10">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {["T. Mutamba","S. Dube","F. Mpofu","A. Ndlovu","R. Chikwanda"].map((name, i) => (
                <tr key={name} className="hover:bg-[#F9F9F9]">
                  <td className="px-3 py-2 text-black/40 font-mono">APP-00{i + 1}</td>
                  <td className="px-3 py-2 font-semibold text-black">{name}</td>
                  <td className="px-3 py-2 text-black/65">{["M","F","M","F","M"][i]}</td>
                  <td className="px-3 py-2 text-black/65">{["Degree","Masters","Degree","Degree","PhD"][i]}</td>
                  <td className="px-3 py-2 text-black/65">{[7, 12, 4, 8, 15][i]} yrs</td>
                  <td className="px-3 py-2 font-bold text-black">{[87, 92, 71, 83, 95][i]}</td>
                  <td className="px-3 py-2">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 ${i < 3 ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-500"}`} style={{ borderRadius: 0 }}>
                      {i < 3 ? "Shortlisted" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Leave — Approvals renders a list
  if (module.id === 6 && tab.includes("Approvals")) {
    return (
      <div className="space-y-2">
        <div className="text-xs font-semibold text-black/55 mb-3">Pending & Recent Leave Requests</div>
        {LEAVE_REQUESTS.map((l, i) => (
          <div key={i} className="flex items-center gap-3 p-3 border border-black/8 bg-white">
            <div className="h-8 w-8 bg-slate-100 text-[#0F172A] text-[10px] font-bold flex items-center justify-center flex-shrink-0" style={{ borderRadius: 0 }}>
              {l.emp.split(" ").map(x => x[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-black">{l.emp}</div>
              <div className="text-[10px] text-black/45">{l.type} · {l.from} → {l.to} · {l.days} days</div>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 flex-shrink-0 ${l.status === "Approved" ? "bg-slate-100 text-[#0F172A]" : l.status === "Active" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`} style={{ borderRadius: 0 }}>{l.status}</span>
            {l.status === "Pending" && (
              <div className="flex gap-1">
                <button onClick={() => act(`Leave approved: ${l.emp}`)} className="h-6 px-2 bg-[#0F172A] text-white text-[9px] font-bold hover:bg-[#0F172A]" style={{ borderRadius: 0 }}>Approve</button>
                <button onClick={() => act(`Leave declined: ${l.emp}`)} className="h-6 px-2 bg-red-100 text-red-700 text-[9px] font-bold hover:bg-red-200" style={{ borderRadius: 0 }}>Decline</button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Generic form renderer
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {fields.map(f => (
        <div key={f.label} className={f.fullWidth ? "md:col-span-2" : ""}>
          <label className="block text-[10px] font-semibold text-black/55 uppercase tracking-wider mb-1">
            {f.label}
            {f.system && <span className="ml-1 text-[9px] text-[#2563eb] font-normal">(system)</span>}
          </label>
          <HRFormField f={f} />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HumanResourcesPage() {
  const { user } = useAuth();
  const [activeModuleId, setActiveModuleId] = useState(1);
  const [activeTab, setActiveTab]           = useState(0);
  const [search, setSearch]                 = useState("");

  const act = (msg: string) => pushNotification(msg, "success");

  const activeModule = HR_MODULES.find(m => m.id === activeModuleId) ?? HR_MODULES[0];
  const Icon         = activeModule.icon;

  const handleModuleSelect = (id: number) => { setActiveModuleId(id); setActiveTab(0); };

  const filteredEmployees = MOCK_EMPLOYEES.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      {/* ── Page Context Bar ─────────────────────────────────────────── */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Human Resources Management"
        process={activeModule.label}
        financialYear="FY2026"
        pageType={activeModuleId === 1 ? "dashboard" : "form"}
      />

      <div className="p-4 sm:p-5 max-w-[1800px] mx-auto">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge tone="blue">HR Workbench</Badge>
              <Badge tone="muted">Government of Zimbabwe</Badge>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#2563eb]/15 text-[#2563eb]">AI-Powered</span>
            </div>
            <PageHeader
              title="Human Resources Management"
              description={`Complete HR lifecycle — Recruitment to Retirement · ${user?.name ?? "HR Officer"}`}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { handleModuleSelect(2); }}
              className="h-9 px-4 bg-[#0f172a] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-black/80 appois-glow-on-hover" style={{ borderRadius: 0 }}>
              <UserPlus className="h-3.5 w-3.5" /> New Employee
            </button>
            <button onClick={() => act("HR report exported")}
              className="h-9 px-4 border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5" style={{ borderRadius: 0 }}>
              <Download className="h-3.5 w-3.5" /> Export Report
            </button>
          </div>
        </div>

        {/* ── KPI Row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-4">
          {HR_KPIS.map(k => (
            <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta}
              positive={k.positive} icon={k.icon} color={k.color} />
          ))}
        </div>

        {/* ── Module type buttons (mirror of procurement type switcher) ── */}
        <div className="flex gap-2 mb-4 overflow-x-auto tab-strip pb-1">
          {HR_MODULES.map(m => {
            const MIcon = m.icon;
            return (
              <button key={m.id} onClick={() => handleModuleSelect(m.id)}
                className={`flex items-center gap-2 px-3 py-2 border text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0
                  ${activeModuleId === m.id ? "bg-[#0f172a] text-white border-[#0f172a]" : "bg-white text-black/65 border-black/10 hover:border-black/30"}`}
                style={{ borderRadius: 0 }}>
                <MIcon className="h-3.5 w-3.5" />
                {m.short}
              </button>
            );
          })}
        </div>

        {/* ── Main Two-Column Layout ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* LEFT — Module list (mirrors stage list) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader title="HR Modules" subtitle={`${HR_MODULES.length} modules`} />
              <div className="overflow-y-auto workbench-scroll" style={{ maxHeight: 600 }}>
                {HR_MODULES.map(m => {
                  const MIcon = m.icon;
                  return (
                    <button key={m.id} onClick={() => handleModuleSelect(m.id)}
                      className={`w-full flex items-start gap-2.5 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-black/5 last:border-0
                        ${activeModuleId === m.id ? "bg-black/5 border-l-2 border-l-[#2563eb]" : ""}`}>
                      <div className={`h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 ${m.color}`} style={{ borderRadius: 0 }}>
                        <MIcon className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[11px] font-semibold truncate ${activeModuleId === m.id ? "text-black" : "text-black/70"}`}>{m.short}</div>
                        <div className="text-[9px] text-black/40 truncate">{m.owner}</div>
                      </div>
                      <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 mt-2 ${STATUS_DOT[m.status]}`} />
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* RIGHT — Active module workbench */}
          <div className="lg:col-span-3 space-y-4">

            {/* Module header banner */}
            <div className="p-4 text-white" style={{ background: "linear-gradient(135deg, #0f172a, #1e3a5f)", borderRadius: 0 }}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[activeModule.status]}`}>
                      Module {activeModule.id} — {activeModule.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-white/55">Owner: {activeModule.owner}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white leading-tight">{activeModule.label}</h2>
                  <p className="text-sm text-white/60 mt-0.5">{activeModule.desc} · {activeModule.formTabs.length} sub-tabs</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => act("Module marked complete")}
                    className="h-8 px-3 bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#0F172A] flex items-center gap-1.5" style={{ borderRadius: 0 }}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark Complete
                  </button>
                  <button onClick={() => act("Report generated")}
                    className="h-8 px-3 bg-white/15 text-white text-xs hover:bg-white/25 flex items-center gap-1.5" style={{ borderRadius: 0 }}>
                    <FileText className="h-3.5 w-3.5" /> Module Report
                  </button>
                  <button onClick={() => act("Email sent")}
                    className="h-8 px-3 bg-white/15 text-white text-xs hover:bg-white/25 flex items-center gap-1.5" style={{ borderRadius: 0 }}>
                    <Mail className="h-3.5 w-3.5" /> Email
                  </button>
                </div>
              </div>
            </div>

            {/* Form card */}
            <Card>
              {/* Tab strip */}
              <div className="border-b border-black/8 overflow-x-auto tab-strip">
                <div className="flex min-w-max">
                  {activeModule.formTabs.map((tab, idx) => (
                    <button key={tab} onClick={() => setActiveTab(idx)}
                      className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors flex-shrink-0
                        ${activeTab === idx ? "border-[#2563eb] text-[#2563eb]" : "border-transparent text-black/60 hover:text-black"}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              {/* Form content */}
              <div className="p-5">
                <HRFormTabContent module={activeModule} tab={activeModule.formTabs[activeTab]} />
              </div>
              {/* Action footer */}
              <div className="px-5 py-3 border-t border-black/8 flex items-center justify-between gap-3 flex-wrap bg-[#FAFAFA]">
                <div className="text-[10px] text-black/40">
                  Module {activeModule.id} · {activeModule.formTabs[activeTab]} · {activeModule.owner}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => act("Draft saved")}
                    className="h-8 px-3 border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5" style={{ borderRadius: 0 }}>
                    <Save className="h-3.5 w-3.5" /> Save Draft
                  </button>
                  <button onClick={() => act("Submitted for approval")}
                    className="h-8 px-4 bg-[#0f172a] text-white text-xs font-semibold hover:bg-black/80 flex items-center gap-1.5" style={{ borderRadius: 0 }}>
                    <Send className="h-3.5 w-3.5" /> Submit
                  </button>
                </div>
              </div>
            </Card>

            {/* Previous / Next navigation */}
            <div className="flex items-center justify-between gap-3">
              <button onClick={() => { if (activeModuleId > 1) handleModuleSelect(activeModuleId - 1); }}
                disabled={activeModuleId <= 1}
                className="h-9 px-4 border border-black/10 text-xs flex items-center gap-1.5 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed" style={{ borderRadius: 0 }}>
                <ChevronLeft className="h-3.5 w-3.5" /> Previous Module
              </button>
              <span className="text-xs text-black/40">Module {activeModuleId} of {HR_MODULES.length}</span>
              <button onClick={() => { if (activeModuleId < HR_MODULES.length) handleModuleSelect(activeModuleId + 1); }}
                disabled={activeModuleId >= HR_MODULES.length}
                className="h-9 px-4 bg-[#0f172a] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-black/80 disabled:opacity-30 disabled:cursor-not-allowed" style={{ borderRadius: 0 }}>
                Next Module <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <InlineWorkbench context="Human Resources" />
    </AppShell>
  );
}
