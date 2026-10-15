import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import {
  ArrowLeft, ChevronRight, User, Briefcase, ClipboardList, FileText,
  TrendingUp, Award, BookOpen, Heart, Scale, Send, GraduationCap,
  Clock, AlertTriangle, Image, CheckCircle2, Calendar, Star,
} from "lucide-react";
import { getDepartmentById, getWorkstationById, WORKSTATION_TABS } from "@/lib/workstation-data";
import type { WorkstationTab } from "@/lib/workstation-data";

// ── Tab icon map ──────────────────────────────────────────────────────────────
const TAB_ICON: Record<WorkstationTab, typeof User> = {
  "Profile":         User,
  "Role":            Briefcase,
  "Workload":        ClipboardList,
  "Reports":         FileText,
  "Performance":     TrendingUp,
  "Awards":          Award,
  "Training":        BookOpen,
  "Health & Wellness": Heart,
  "Declarations":    Scale,
  "Applications":    Send,
  "CPD":             GraduationCap,
  "Time Clocking":   Clock,
  "Discipline":      AlertTriangle,
  "Documents":       Image,
};

// ── Mock workload items ───────────────────────────────────────────────────────
const MOCK_WORKLOAD = [
  { task: "Review Q2 budget variance report",         date: "2026-07-01", status: "In Progress", approver: "Finance Manager" },
  { task: "Prepare monthly reconciliation statement", date: "2026-06-30", status: "Pending",     approver: "CFO"             },
  { task: "Process supplier payment batch #2314",     date: "2026-06-28", status: "Approved",    approver: "Accounting Officer" },
  { task: "Audit file preparation — Q1 2026",         date: "2026-06-25", status: "Completed",   approver: "Internal Auditor" },
];

const MOCK_REPORTS = [
  { title: "Monthly Expenditure Report — June 2026",  date: "2026-07-05", age: "0 days",  status: "Draft"    },
  { title: "Budget Utilisation Report — Q2 2026",     date: "2026-07-01", age: "4 days",  status: "Submitted" },
  { title: "Cash Flow Forecast — July 2026",          date: "2026-06-28", age: "7 days",  status: "Approved"  },
  { title: "Variance Analysis Report — May 2026",     date: "2026-06-15", age: "20 days", status: "Archived"  },
];

const MOCK_TRAINING = [
  { course: "Public Finance Management Act — Refresher",    provider: "Ministry of Finance",  date: "2026-05-10", status: "Completed", cpd: 8  },
  { course: "Advanced Excel for Financial Analysis",        provider: "ZIMCODD Institute",    date: "2026-04-22", status: "Completed", cpd: 16 },
  { course: "Procurement Regulations Update 2026",         provider: "PRAZ",                 date: "2026-07-15", status: "Enrolled",  cpd: 6  },
  { course: "Leadership & Management Development",          provider: "PSC Training Centre",  date: "2026-08-01", status: "Planned",   cpd: 24 },
];

const MOCK_DECLARATIONS = [
  { type: "Assets Declaration",            year: "2026", status: "Submitted", date: "2026-01-15" },
  { type: "Conflict of Interest",          year: "2026", status: "Submitted", date: "2026-01-15" },
  { type: "Independence Declaration",      year: "2026", status: "Submitted", date: "2026-01-15" },
  { type: "Assets Declaration",            year: "2025", status: "Archived",  date: "2025-01-12" },
];

const MOCK_APPLICATIONS = [
  { type: "Annual Leave",       from: "2026-07-14", to: "2026-07-18", days: 5,  status: "Approved"  },
  { type: "Study Leave",        from: "2026-08-01", to: "2026-08-15", days: 10, status: "Pending"   },
  { type: "Transfer Request",   from: "—",          to: "—",          days: 0,  status: "Under Review" },
];

const STATUS_CHIP: Record<string, string> = {
  "In Progress":   "bg-slate-100 text-[#0F172A]",
  "Pending":       "bg-slate-100 text-[#0F172A]",
  "Approved":      "bg-slate-100 text-[#0F172A]",
  "Completed":     "bg-slate-100 text-[#0F172A]",
  "Draft":         "bg-gray-100 text-gray-600",
  "Submitted":     "bg-slate-100 text-[#0F172A]",
  "Archived":      "bg-gray-100 text-gray-500",
  "Enrolled":      "bg-slate-100 text-[#0F172A]",
  "Planned":       "bg-slate-100 text-[#0F172A]",
  "Under Review":  "bg-slate-100 text-[#0F172A]",
};
function Chip({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${STATUS_CHIP[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ── Tab content renderers ─────────────────────────────────────────────────────
function ProfileTab({ role, dept }: { role: string; dept: string }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Tasks Open"      value="4"    delta="2 overdue"  positive={false} icon={ClipboardList} color="amber"  />
        <KpiCard label="Performance"     value="88%"  delta="+3 pts"     icon={TrendingUp}  color="green"  />
        <KpiCard label="CPD Hours (YTD)" value="24"   delta="Target: 40" icon={GraduationCap} color="blue" />
        <KpiCard label="Leave Balance"   value="18d"  delta="of 30 days" icon={Calendar}     color="violet" />
      </div>
      <Card>
        <CardHeader title="Workstation Profile" subtitle={`${role} · ${dept}`} />
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {[
            ["Full Name",        "T. Moyo"],
            ["Employee ID",      "ZW-GOV-0042"],
            ["Role",             role],
            ["Department",       dept],
            ["Date Appointed",   "2022-03-01"],
            ["Contract Type",    "Permanent"],
            ["Work Location",    "Head Office, Harare"],
            ["Contact",          "t.moyo@gov.zw"],
          ].map(([label, val]) => (
            <div key={label}>
              <div className="text-[10px] text-black/40 uppercase tracking-wide mb-0.5">{label}</div>
              <div className="text-sm text-black font-medium">{val}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function RoleTab({ role, reportsTo }: { role: string; reportsTo: string }) {
  return (
    <Card>
      <CardHeader title="Role & Job Description" subtitle={role} />
      <div className="p-5 space-y-5">
        <div>
          <div className="text-xs font-semibold text-black/50 uppercase tracking-wide mb-2">Reporting To</div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-black/5 text-sm">
            <User className="h-4 w-4 text-black/40" />
            <span className="text-black font-medium">{reportsTo || "Accounting Officer / Board"}</span>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-black/50 uppercase tracking-wide mb-2">Key Responsibilities</div>
          <ul className="space-y-2">
            {[
              `Lead and oversee all activities within the ${role} workstation`,
              "Ensure quality, accuracy, and timeliness of all outputs",
              "Collaborate with upstream and downstream workstations in the chain",
              "Prepare and submit required reports within deadlines",
              "Maintain records and documentation to audit standard",
              "Identify and escalate risks or bottlenecks promptly",
            ].map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-black/70">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold text-black/50 uppercase tracking-wide mb-2">Minimum Requirements</div>
          <ul className="space-y-1.5 text-xs text-black/60">
            {["Relevant degree or professional qualification", "Minimum 3 years relevant experience", "Knowledge of public sector regulations", "Proficiency in applicable systems and tools"].map((r, i) => (
              <li key={i} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-black/20 flex-shrink-0" />{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
}

function WorkloadTab() {
  return (
    <Card>
      <CardHeader title="Current Workload" subtitle="Assigned tasks with dates, status, and approvals" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-black/40 uppercase">
            <tr>{["Task","Due Date","Status","Approver",""].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {MOCK_WORKLOAD.map((w, i) => (
              <tr key={i} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 text-black max-w-xs">{w.task}</td>
                <td className="px-4 py-3 text-black/60 whitespace-nowrap">{w.date}</td>
                <td className="px-4 py-3"><Chip status={w.status} /></td>
                <td className="px-4 py-3 text-black/60 text-xs">{w.approver}</td>
                <td className="px-4 py-3">
                  <button className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-gray-50 transition-colors">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ReportsTab() {
  return (
    <Card>
      <CardHeader title="Reports Register" subtitle="All reports submitted, with age and status" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-black/40 uppercase">
            <tr>{["Report Title","Date","Age","Status",""].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {MOCK_REPORTS.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 text-black max-w-xs">{r.title}</td>
                <td className="px-4 py-3 text-black/60 whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-3 text-black/60 text-xs">{r.age}</td>
                <td className="px-4 py-3"><Chip status={r.status} /></td>
                <td className="px-4 py-3">
                  <button className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-gray-50 transition-colors">Open</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PerformanceTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Current Score"    value="88%"   delta="+3 pts Q-o-Q"  icon={TrendingUp}   color="green"  />
        <KpiCard label="KPIs Met"         value="9/11"  delta="81.8%"          icon={CheckCircle2} color="blue"   />
        <KpiCard label="Targets Achieved" value="7/10"  delta="70%"            icon={Star}         color="amber"  />
        <KpiCard label="Peer Ranking"     value="#3"    delta="of 14"          icon={Award}        color="violet" />
      </div>
      <Card>
        <CardHeader title="KPI Scorecard" subtitle="Current performance period" />
        <div className="divide-y divide-black/5">
          {[
            { kpi: "Task Completion Rate",      target: 95, actual: 92 },
            { kpi: "Report Submission Timeliness", target: 100, actual: 87 },
            { kpi: "Process Adherence",          target: 98, actual: 96 },
            { kpi: "Quality Score",              target: 90, actual: 91 },
            { kpi: "Stakeholder Feedback",       target: 85, actual: 88 },
          ].map(k => (
            <div key={k.kpi} className="px-5 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-black/70">{k.kpi}</span>
                <span className={`text-xs font-semibold ${k.actual >= k.target ? "text-[#0F172A]" : "text-[#0F172A]"}`}>
                  {k.actual}% / {k.target}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
                <div className={`h-full rounded-full ${k.actual >= k.target ? "bg-[#0F172A]" : "bg-[#0F172A]"}`}
                  style={{ width: `${Math.min(100, (k.actual / k.target) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AwardsTab() {
  return (
    <Card>
      <CardHeader title="Awards & Achievements" subtitle="Recognition, commendations, and milestones" />
      <div className="p-5 space-y-3">
        {[
          { award: "Employee of the Quarter",     date: "Q1 2026", issuer: "HR Department",     icon: "🏆" },
          { award: "Excellence in Service Delivery",date: "2025",   issuer: "Ministry Awards",   icon: "⭐" },
          { award: "Zero Audit Findings",          date: "FY2025",  issuer: "Internal Audit",    icon: "🛡️" },
          { award: "5-Year Long Service",          date: "2025",    issuer: "HR Department",     icon: "🎖️" },
        ].map((a, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-black/5">
            <div className="text-2xl">{a.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-black">{a.award}</div>
              <div className="text-xs text-black/50 mt-0.5">{a.issuer} · {a.date}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TrainingTab() {
  return (
    <Card>
      <CardHeader title="Training & Development" subtitle="All courses with CPD points" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-black/40 uppercase">
            <tr>{["Course","Provider","Date","CPD Hrs","Status"].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {MOCK_TRAINING.map((t, i) => (
              <tr key={i} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 text-black max-w-xs">{t.course}</td>
                <td className="px-4 py-3 text-black/60 text-xs">{t.provider}</td>
                <td className="px-4 py-3 text-black/60 whitespace-nowrap">{t.date}</td>
                <td className="px-4 py-3 font-semibold text-black">{t.cpd}</td>
                <td className="px-4 py-3"><Chip status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function HealthWellnessTab() {
  return (
    <Card>
      <CardHeader title="Health & Wellness" subtitle="Occupational health and wellbeing records" />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Sick Days (YTD)"  value="3"    delta="below average" icon={Heart}     color="green"  />
          <KpiCard label="Wellness Score"   value="84%"  delta="Good"          icon={TrendingUp} color="green" />
        </div>
        <div className="space-y-2">
          {[
            { check: "Annual Medical Exam",           date: "2026-03-12", status: "Completed" },
            { check: "Occupational Health Screening", date: "2026-01-20", status: "Completed" },
            { check: "Wellness Programme Enrolment",  date: "2026-01-01", status: "Active"    },
            { check: "EAP Counselling (voluntary)",   date: "—",          status: "Available" },
          ].map((h, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-black/5 text-xs">
              <span className="text-black">{h.check}</span>
              <div className="flex items-center gap-2">
                <span className="text-black/40">{h.date}</span>
                <Chip status={h.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function DeclarationsTab() {
  return (
    <Card>
      <CardHeader title="Declarations" subtitle="Assets, conflicts of interest, and independence" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-black/40 uppercase">
            <tr>{["Declaration Type","Year","Date Filed","Status",""].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {MOCK_DECLARATIONS.map((d, i) => (
              <tr key={i} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 text-black">{d.type}</td>
                <td className="px-4 py-3 text-black/60">{d.year}</td>
                <td className="px-4 py-3 text-black/60 whitespace-nowrap">{d.date}</td>
                <td className="px-4 py-3"><Chip status={d.status} /></td>
                <td className="px-4 py-3">
                  <button className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-gray-50 transition-colors">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ApplicationsTab() {
  return (
    <Card>
      <CardHeader title="Applications" subtitle="Leave, transfers, promotions, and role applications" />
      <div className="p-5 space-y-3">
        <div className="flex justify-end mb-2">
          <button className="h-8 px-3 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-1.5">
            <Send className="h-3.5 w-3.5" /> New Application
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-black/40 uppercase">
              <tr>{["Type","From","To","Days","Status"].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {MOCK_APPLICATIONS.map((a, i) => (
                <tr key={i} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 text-black font-medium">{a.type}</td>
                  <td className="px-4 py-3 text-black/60 whitespace-nowrap">{a.from}</td>
                  <td className="px-4 py-3 text-black/60 whitespace-nowrap">{a.to}</td>
                  <td className="px-4 py-3 text-black/60">{a.days || "—"}</td>
                  <td className="px-4 py-3"><Chip status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}

function CPDTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiCard label="CPD Hours (YTD)"   value="24"   delta="of 40 target"  icon={GraduationCap} color="blue"   />
        <KpiCard label="Courses Completed" value="2"    delta="+1 in progress" icon={BookOpen}      color="green"  />
        <KpiCard label="CPD Score"         value="60%"  delta="Needs 40 more hrs" positive={false} icon={TrendingUp} color="amber" />
      </div>
      <Card>
        <CardHeader title="Continuous Professional Development" subtitle="Annual CPD plan and progress" />
        <div className="p-5">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-black/60">Annual CPD Progress</span>
              <span className="text-xs font-semibold text-black">24 / 40 hrs</span>
            </div>
            <div className="h-2 rounded-full bg-black/5 overflow-hidden">
              <div className="h-full rounded-full bg-[#0F172A]" style={{ width: "60%" }} />
            </div>
          </div>
          <p className="text-xs text-black/50 leading-relaxed">
            CPD activities include formal training courses, workshops, conferences, mentoring, and self-directed learning. 
            All activities must be logged with supporting evidence and approved by the line manager.
          </p>
        </div>
      </Card>
    </div>
  );
}

function TimeClockingtab() {
  return (
    <Card>
      <CardHeader title="Time Clocking" subtitle="Work attendance and activity log" />
      <div className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <KpiCard label="Days Present (Jun)" value="20" delta="of 22 working days" icon={CheckCircle2} color="green" />
          <KpiCard label="Days Absent"        value="2"  delta="Approved leave"     icon={Calendar}     color="amber" />
          <KpiCard label="Avg Clock-In"       value="07:52" delta="Target: 08:00"   icon={Clock}        color="blue" />
          <KpiCard label="Overtime (Jun)"     value="6 hrs" delta="Approved"        icon={TrendingUp}   color="violet" />
        </div>
        <div className="space-y-2">
          {[
            { date: "2026-06-24 (Tue)", clockIn: "07:48", clockOut: "17:12", hours: "9:24", status: "Normal" },
            { date: "2026-06-23 (Mon)", clockIn: "07:55", clockOut: "18:02", hours: "10:07",status: "Overtime" },
            { date: "2026-06-22 (Sun)", clockIn: "—",    clockOut: "—",     hours: "—",    status: "Day Off" },
            { date: "2026-06-21 (Sat)", clockIn: "—",    clockOut: "—",     hours: "—",    status: "Day Off" },
            { date: "2026-06-20 (Fri)", clockIn: "07:51", clockOut: "17:03", hours: "9:12", status: "Normal" },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-black/5 text-xs">
              <span className="text-black font-medium w-44 flex-shrink-0">{r.date}</span>
              <span className="text-black/60">{r.clockIn}</span>
              <span className="text-black/60">{r.clockOut}</span>
              <span className="font-semibold text-black">{r.hours}</span>
              <Chip status={r.status} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function DisciplineTab() {
  return (
    <Card>
      <CardHeader title="Discipline Records" subtitle="Warnings, hearings, and police clearance" />
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <CheckCircle2 className="h-5 w-5 text-slate-600 flex-shrink-0" />
          <div>
            <div className="text-xs font-semibold text-[#0F172A]">Clean Disciplinary Record</div>
            <div className="text-xs text-[#0F172A] mt-0.5">No active warnings or disciplinary proceedings on file.</div>
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-black/50 uppercase tracking-wide mb-2">Police Clearance Certificate</div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-black/5 text-xs">
            <span className="text-black">Police Clearance Certificate</span>
            <div className="flex items-center gap-2">
              <span className="text-black/40">Issued: 2025-01-10 · Expires: 2027-01-10</span>
              <Chip status="Active" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function DocumentsTab() {
  return (
    <Card>
      <CardHeader title="Documents Gallery" subtitle="Photos, voice notes, videos, and files" />
      <div className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { type: "📸 Photos", count: 4 }, { type: "🎙️ Voice Notes", count: 2 },
            { type: "🎥 Videos", count: 1 }, { type: "📄 Documents",   count: 12 },
          ].map(g => (
            <div key={g.type} className="p-3 rounded-xl bg-gray-50 border border-black/5 text-center">
              <div className="text-xl mb-1">{g.type.split(" ")[0]}</div>
              <div className="text-xs font-semibold text-black">{g.count}</div>
              <div className="text-[10px] text-black/40">{g.type.split(" ").slice(1).join(" ")}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <button className="h-8 px-3 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors">
            Upload File
          </button>
        </div>
      </div>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WorkstationDetailPage() {
  const { deptId, wsId } = useParams<{ deptId: string; wsId: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<WorkstationTab>("Profile");

  const dept = getDepartmentById(deptId ?? "");
  const ws   = deptId && wsId ? getWorkstationById(deptId, wsId) : undefined;
  const reportsToWs = dept?.workstations.find(w => w.id === ws?.reportsTo);

  if (!dept || !ws) {
    return (
      <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Workstation Detail"
        financialYear="FY2026"
        pageType="workbench"
      />
        <div className="p-6 text-center">
          <p className="text-sm text-black/50">Workstation not found.</p>
          <button onClick={() => navigate(`/corporate/${deptId}`)} className="mt-3 text-xs text-[#0F172A] hover:underline">
            ← Back to Department
          </button>
        </div>
      </AppShell>
    );
  }

  const renderTab = () => {
    switch (tab) {
      case "Profile":          return <ProfileTab role={ws.role} dept={dept.name} />;
      case "Role":             return <RoleTab role={ws.role} reportsTo={reportsToWs?.role ?? ws.reportsTo} />;
      case "Workload":         return <WorkloadTab />;
      case "Reports":          return <ReportsTab />;
      case "Performance":      return <PerformanceTab />;
      case "Awards":           return <AwardsTab />;
      case "Training":         return <TrainingTab />;
      case "Health & Wellness":return <HealthWellnessTab />;
      case "Declarations":     return <DeclarationsTab />;
      case "Applications":     return <ApplicationsTab />;
      case "CPD":              return <CPDTab />;
      case "Time Clocking":    return <TimeClockingtab />;
      case "Discipline":       return <DisciplineTab />;
      case "Documents":        return <DocumentsTab />;
      default:                 return <ProfileTab role={ws.role} dept={dept.name} />;
    }
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-4 text-xs text-black/40 flex-wrap">
          <button onClick={() => navigate("/corporate")} className="hover:text-black transition-colors">Corporate</button>
          <ChevronRight className="h-3 w-3" />
          <button onClick={() => navigate(`/corporate/${deptId}`)} className="hover:text-black transition-colors">{dept.shortName}</button>
          <ChevronRight className="h-3 w-3" />
          <button onClick={() => navigate(`/corporate/${deptId}?tab=workstations`)} className="hover:text-black transition-colors">Workstations</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-black">{ws.shortRole}</span>
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="h-12 w-12 rounded-2xl bg-gray-100 grid place-items-center flex-shrink-0">
            <User className="h-6 w-6 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge tone="violet">Workstation</Badge>
              <Badge tone="muted">{dept.shortName}</Badge>
              {ws.grade && <Badge tone="blue">Grade {ws.grade}</Badge>}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold
                ${ws.status === "active" ? "bg-slate-100 text-[#0F172A]" : ws.status === "vacant" ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-700"}`}>
                {ws.status.charAt(0).toUpperCase() + ws.status.slice(1)}
              </span>
            </div>
            <PageHeader
              title={ws.role}
              description={`${dept.name} · Reports to: ${reportsToWs?.role ?? "Accounting Officer / Board"}`}
            />
          </div>
          <button onClick={() => navigate(`/corporate/${deptId}`)}
            className="flex-shrink-0 h-8 px-3 rounded-lg border border-black/10 text-xs hover:bg-black/5 transition-colors flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex gap-0.5 mb-6 border-b border-black/10 overflow-x-auto scrollbar-none">
          {WORKSTATION_TABS.map(t => {
            const Icon = TAB_ICON[t];
            return (
              <button key={t} onClick={() => setTab(t)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors flex-shrink-0
                  ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>
                <Icon className="h-3 w-3" />
                {t}
              </button>
            );
          })}
        </div>

        {renderTab()}
      </div>
    </AppShell>
  );
}
