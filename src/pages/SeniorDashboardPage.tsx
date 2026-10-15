import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  ArrowLeft, Star, Phone, Mail, Lock, Briefcase,
  FileText, ShieldCheck, Activity, TrendingUp, DollarSign,
  CheckCircle2, Clock, AlertTriangle, Users, ChevronRight,
} from "lucide-react";
import { MINISTRY_DASH } from "@/lib/ministry-dashboard-data";

const TIP = { contentStyle: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 } };

const CLEARANCE_COLORS: Record<string, string> = {
  "Top Secret":   "bg-red-100 text-red-700",
  Secret:         "bg-slate-100 text-[#0F172A]",
  Confidential:   "bg-slate-100 text-[#0F172A]",
  Restricted:     "bg-gray-100 text-gray-600",
};

// Generate deterministic-ish monthly spend data for a senior officer
function monthlyData(seed: number) {
  return ["Jan","Feb","Mar","Apr","May","Jun"].map((month, i) => ({
    month,
    approved: Math.round(18 + (seed % 3) * 4 + i),
    processed: Math.round(14 + (seed % 3) * 3 + i * 0.8),
  }));
}

type Tab = "dashboard" | "approvals" | "tasks" | "compliance";

export default function SeniorDashboardPage() {
  const { ministryId, officerIdx } = useParams<{ ministryId: string; officerIdx: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const ministry = ministryId ? MINISTRY_DASH[ministryId] : undefined;
  const idx = officerIdx ? parseInt(officerIdx, 10) : 0;
  const officer = ministry?.seniorOfficers[idx];

  if (!officer || !ministry) {
    return (
      <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Executive Oversight"
        process="Senior Management Dashboard"
        financialYear="FY2026"
        pageType="dashboard"
      />
        <div className="flex flex-col items-center justify-center py-24 text-black/30">
          <Star className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">Senior officer not found.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-xs text-black hover:underline">Go back</button>
        </div>
      </AppShell>
    );
  }

  const chartData = monthlyData(idx * 7 + officer.name.length);

  return (
    <AppShell>
      {/* Back */}
      <button onClick={() => navigate(`/ministry/${ministryId}/dashboard`)}
        className="flex items-center gap-2 text-sm text-black/50 hover:text-black mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to {ministry.name.split(" ").slice(0,3).join(" ")}
      </button>

      {/* Officer Header */}
      <div className="flex items-start gap-5 mb-6 p-5 rounded-2xl border border-black/8 bg-[#0F172A]">
        <div className="h-16 w-16 rounded-2xl bg-black text-white text-xl font-bold flex items-center justify-center flex-shrink-0">
          {officer.name.split(" ").map(n => n[0]).join("").slice(0,2)}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-black">{officer.name}</h1>
              <p className="text-sm text-black/50 mt-0.5">{officer.title}</p>
              <p className="text-xs text-black/40 mt-0.5">{officer.dept} · {ministry.name}</p>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1 ${CLEARANCE_COLORS[officer.clearanceLevel] ?? "bg-gray-100 text-gray-600"}`}>
              <Lock className="h-3 w-3" />{officer.clearanceLevel}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <a href={`mailto:${officer.email}`} className="flex items-center gap-1.5 text-xs text-black/50 hover:text-black transition-colors">
              <Mail className="h-3.5 w-3.5" />{officer.email}
            </a>
            <span className="flex items-center gap-1.5 text-xs text-black/50">
              <Phone className="h-3.5 w-3.5" />{officer.phone}
            </span>
          </div>
        </div>
        <button onClick={() => navigate(`/workbench/${ministryId}`)}
          className="h-8 px-3 rounded-xl bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1.5 flex-shrink-0">
          <Briefcase className="h-3.5 w-3.5" />Workbench
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Pending Approvals"  value="7"     icon={Clock}       color="amber"  />
        <KpiCard label="Approved This Month" value="24"   icon={CheckCircle2} color="green"  />
        <KpiCard label="Active Tenders"     value="3"     icon={FileText}    color="blue"   />
        <KpiCard label="Value Managed"      value="$48M"  icon={DollarSign}  color="violet" />
        <KpiCard label="Compliance Score"   value="96%"   icon={ShieldCheck} color="cyan"   />
        <KpiCard label="Overdue Tasks"      value="2"     icon={AlertTriangle} color="red"  />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-black/5 mb-6">
        {(["dashboard","approvals","tasks","compliance"] as Tab[]).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`h-9 px-4 text-sm font-medium capitalize border-b-2 transition-colors
              ${activeTab === t ? "border-black text-black" : "border-transparent text-black/40 hover:text-black/70"}`}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <SeniorDashboardView officer={officer} chartData={chartData} ministry={ministry} ministryId={ministryId ?? ""} navigate={navigate} />
      )}
      {activeTab === "approvals" && <ApprovalsView officer={officer} />}
      {activeTab === "tasks" && <TasksView officer={officer} />}
      {activeTab === "compliance" && <ComplianceView officer={officer} />}
    </AppShell>
  );
}

// ─── Main dashboard view ──────────────────────────────────────────────────────
function SeniorDashboardView({ officer, chartData, ministry, ministryId, navigate }: {
  officer: import("@/lib/ministry-dashboard-data").SeniorOfficer;
  chartData: { month: string; approved: number; processed: number }[];
  ministry: import("@/lib/ministry-dashboard-data").MinistryDashData;
  ministryId: string;
  navigate: (p: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Monthly Procurement Activity" subtitle="Tenders approved & processed" />
          <div className="p-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...TIP} />
                <Area type="monotone" dataKey="approved"  stroke="#3B82F6" fill="#eff6ff" strokeWidth={2} />
                <Area type="monotone" dataKey="processed" stroke="#10B981" fill="#f0fdf4" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Key Responsibilities" subtitle={officer.dept} />
          <div className="divide-y divide-black/5">
            {officer.responsibilities.map((r, i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3">
                <Star className="h-3.5 w-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-black/70">{r}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader title="Quick Actions" subtitle="Shortcuts to key procurement & admin functions" />
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Open Workbench",     icon: Briefcase,    action: () => navigate(`/workbench/${ministryId}`) },
            { label: "Ministry Dashboard", icon: TrendingUp,   action: () => navigate(`/ministry/${ministryId}/dashboard`) },
            { label: "Review Tenders",     icon: FileText,     action: () => navigate("/tenders") },
            { label: "Contracts",          icon: Activity,     action: () => navigate("/contracts") },
          ].map(q => (
            <button key={q.label} onClick={q.action}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-black/8 hover:border-black/20 hover:bg-gray-50 transition-all text-center">
              <q.icon className="h-5 w-5 text-black/60" />
              <span className="text-xs font-medium text-black/70">{q.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Other senior officers in ministry */}
      <Card>
        <CardHeader title="Ministry Senior Officers" subtitle="Your colleagues in this ministry" />
        <div className="divide-y divide-black/5">
          {ministry.seniorOfficers.map((o, idx) => (
            <div key={o.email} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/60 cursor-pointer"
              onClick={() => navigate(`/ministry/${ministryId}/senior/${idx}`)}>
              <div className="h-8 w-8 rounded-full bg-gray-100 text-black text-xs font-bold flex items-center justify-center flex-shrink-0">
                {o.name.split(" ").map(n => n[0]).join("").slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-black">{o.name}</div>
                <div className="text-xs text-black/40">{o.title}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-black/20" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Approvals View ───────────────────────────────────────────────────────────
function ApprovalsView({ officer }: { officer: import("@/lib/ministry-dashboard-data").SeniorOfficer }) {
  const items = [
    { id: "TND-2026-041", title: "Q3 Supplies Tender",         type: "Tender",    value: "USD 4.2M", status: "Pending", daysAgo: 1 },
    { id: "RFQ-2026-088", title: "Office Stationery RFQ",      type: "RFQ",       value: "USD 48K",  status: "Pending", daysAgo: 2 },
    { id: "INV-2026-210", title: "Invoice — Apex Contractors", type: "Invoice",   value: "USD 820K", status: "Pending", daysAgo: 3 },
    { id: "VAR-2026-012", title: "Contract Variation — Sec 3", type: "Variation", value: "USD 1.2M", status: "Pending", daysAgo: 3 },
    { id: "TND-2026-038", title: "IT Systems Tender",          type: "Tender",    value: "USD 2.8M", status: "Approved", daysAgo: 5 },
    { id: "RFQ-2026-082", title: "Vehicle Fuel Supply",        type: "RFQ",       value: "USD 120K", status: "Approved", daysAgo: 6 },
  ];
  const [approved, setApproved] = useState<string[]>(["TND-2026-038","RFQ-2026-082"]);

  return (
    <Card>
      <CardHeader title={`Approval Queue — ${officer.name}`} subtitle="Procurement items awaiting your action" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-black/40 uppercase">
            <tr>{["Reference","Title","Type","Value","Days","Status","Action"].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {items.map(item => {
              const isDone = approved.includes(item.id);
              return (
                <tr key={item.id} className={`hover:bg-gray-50/60 ${isDone ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 font-mono text-[11px] text-black/40">{item.id}</td>
                  <td className="px-4 py-3 font-medium text-black">{item.title}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{item.type}</td>
                  <td className="px-4 py-3 font-semibold text-black">{item.value}</td>
                  <td className="px-4 py-3 text-xs text-black/50">{item.daysAgo}d ago</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${isDone ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>
                      {isDone ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!isDone ? (
                      <button onClick={() => setApproved(prev => [...prev, item.id])}
                        className="h-6 px-2.5 rounded-md bg-black text-white text-[10px] font-medium hover:bg-gray-800 transition-colors">
                        Approve
                      </button>
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-slate-600" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Tasks View ───────────────────────────────────────────────────────────────
function TasksView({ officer }: { officer: import("@/lib/ministry-dashboard-data").SeniorOfficer }) {
  const tasks = [
    { title: "Review ARV tender evaluation report",        due: "Today",     priority: "High",   done: false },
    { title: "Sign off Q3 budget allocation request",      due: "Today",     priority: "High",   done: false },
    { title: "Attend procurement committee meeting",        due: "Tomorrow",  priority: "Medium", done: false },
    { title: "Approve supplier performance reports",        due: "2026-07-02", priority: "Medium", done: false },
    { title: "Review contract variation for Sec 3",        due: "2026-07-05", priority: "High",   done: false },
    { title: "Submit monthly KPI report to PS",            due: "2026-07-08", priority: "Low",    done: true  },
    { title: "Complete annual declaration of interest",    due: "2026-07-10", priority: "Low",    done: true  },
  ];
  const [done, setDone] = useState<number[]>(tasks.map((t,i) => t.done ? i : -1).filter(i => i >= 0));
  const priority_colors: Record<string,string> = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-slate-100 text-[#0F172A]",
    Low: "bg-gray-100 text-gray-600",
  };
  return (
    <Card>
      <CardHeader title={`Task List — ${officer.name}`} subtitle="Your pending and completed tasks" />
      <div className="divide-y divide-black/5">
        {tasks.map((task, i) => (
          <div key={i} className={`px-5 py-3.5 flex items-start gap-3 ${done.includes(i) ? "opacity-50" : ""}`}>
            <button onClick={() => setDone(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
              className={`h-5 w-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${done.includes(i) ? "bg-black border-black" : "border-black/20 hover:border-black/40"}`}>
              {done.includes(i) && <CheckCircle2 className="h-3 w-3 text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <span className={`text-sm ${done.includes(i) ? "line-through text-black/40" : "text-black"}`}>{task.title}</span>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3 text-black/30" />
                <span className="text-xs text-black/40">Due: {task.due}</span>
              </div>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 ${priority_colors[task.priority]}`}>{task.priority}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Compliance View ──────────────────────────────────────────────────────────
function ComplianceView({ officer }: { officer: import("@/lib/ministry-dashboard-data").SeniorOfficer }) {
  const checks = [
    { item: "Annual Declaration of Interest",     status: "Filed",      date: "2026-01-12" },
    { item: "Procurement Ethics Training",         status: "Complete",   date: "2026-03-08" },
    { item: "Financial Disclosure",               status: "Filed",      date: "2026-01-20" },
    { item: "PRAZ Certification",                 status: "Current",    date: "2026-06-01" },
    { item: "Conflict of Interest Screening",     status: "Clear",      date: "2026-06-15" },
    { item: "Anti-Money Laundering Training",     status: "Due",        date: "2026-08-01" },
  ];
  const statusColor: Record<string,string> = {
    Filed: "bg-slate-100 text-[#0F172A]",
    Complete: "bg-slate-100 text-[#0F172A]",
    Current: "bg-slate-100 text-[#0F172A]",
    Clear: "bg-slate-100 text-[#0F172A]",
    Due: "bg-slate-100 text-[#0F172A]",
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Compliance Score" value="96%"  icon={ShieldCheck}  color="green" />
        <KpiCard label="Checks Passed"    value="5/6"  icon={CheckCircle2} color="blue"  />
        <KpiCard label="Upcoming Due"     value="1"    icon={Clock}        color="amber" />
      </div>
      <Card>
        <CardHeader title={`Compliance Checklist — ${officer.name}`} subtitle="Annual & periodic requirements" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-black/40 uppercase">
              <tr>{["Compliance Item","Status","Date"].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {checks.map(c => (
                <tr key={c.item} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-black">{c.item}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${statusColor[c.status] ?? "bg-gray-100 text-gray-600"}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-black/50">{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
