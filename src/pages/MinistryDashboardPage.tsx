import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  Building2, TrendingUp, ShieldCheck, Users, FileText,
  Plus, Eye, Activity, DollarSign, Star, Phone, Mail,
  Lock, ChevronRight, Briefcase,
} from "lucide-react";
import { MINISTRY_DASH } from "@/lib/ministry-dashboard-data";

const C = ["#334155","#475569","#64748B","#334155","#DC2626","#06b6d4","#ec4899"];
const TIP = { contentStyle: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 } };

const STATUS_COLORS: Record<string,string> = {
  Bidding:"bg-slate-100 text-[#0F172A]", Evaluation:"bg-slate-100 text-[#0F172A]",
  Awarded:"bg-slate-100 text-[#0F172A]", Draft:"bg-gray-100 text-gray-600",
  Published:"bg-slate-100 text-[#0F172A]", "At Risk":"bg-red-100 text-red-700",
  Active:"bg-slate-100 text-[#0F172A]", Critical:"bg-red-100 text-red-700",
};

const CLEARANCE_COLORS: Record<string,string> = {
  "Top Secret": "bg-red-100 text-red-700",
  Secret: "bg-slate-100 text-[#0F172A]",
  Confidential: "bg-slate-100 text-[#0F172A]",
  Restricted: "bg-gray-100 text-gray-600",
};

type Tab = "overview" | "departments" | "tenders" | "budget" | "senior" | "projects";

export default function MinistryDashboardPage() {
  const { ministryId } = useParams<{ ministryId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Resolve ministry — try exact match, fallback to first entry
  const ministry = (ministryId && MINISTRY_DASH[ministryId])
    ? MINISTRY_DASH[ministryId]
    : Object.values(MINISTRY_DASH)[0];

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Ministry Management"
        process="Ministry Dashboard"
        financialYear="FY2026"
        pageType="dashboard"
      />
      {/* ── Header ── */}
      <div className="flex items-start gap-4 mb-6">
        <div className="h-14 w-14 rounded-2xl bg-black text-white text-2xl flex items-center justify-center flex-shrink-0">
          {ministry.badge}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-black">{ministry.name}</h1>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <span className="text-sm text-black/50">Minister: {ministry.minister}</span>
            <span className="text-sm text-black/50">HQ: {ministry.hq}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-[#0F172A]">Active</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
          <button onClick={() => navigate(`/workbench/${ministryId}`)} className="h-8 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />Procurement Workbench
          </button>
          <button onClick={() => navigate("/tenders")} className="h-8 px-3 rounded-lg border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />New Tender
          </button>
          <button onClick={() => navigate("/budget")} className="h-8 px-3 rounded-lg border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />Budget
          </button>
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <KpiCard label="Active Tenders"   value={String(ministry.kpis.activeTenders)}   icon={FileText}    color="blue" />
        <KpiCard label="Contracts"        value={String(ministry.kpis.activeContracts)}  icon={Activity}    color="green" />
        <KpiCard label="Budget Util"      value={`${ministry.kpis.budgetUtil}%`}          icon={TrendingUp}  color={ministry.kpis.budgetUtil >= 85 ? "red" : "amber"} />
        <KpiCard label="Compliance"       value={`${ministry.kpis.compliance}%`}          icon={ShieldCheck} color="cyan" />
        <KpiCard label="Projects"         value={String(ministry.kpis.activeProjects)}   icon={Building2}   color="violet" />
        <KpiCard label="Staff"            value={ministry.kpis.staffCount.toLocaleString()} icon={Users}    color="blue" />
        <KpiCard label="Spent (M)"        value={`$${ministry.kpis.spentM}M`}             icon={DollarSign}  color="green" />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-black/5 mb-6 overflow-x-auto">
        {(["overview","departments","tenders","budget","senior","projects"] as Tab[]).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`h-9 px-4 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors
              ${activeTab === t ? "border-black text-black" : "border-transparent text-black/40 hover:text-black/70"}`}>
            {t === "senior" ? "Senior Officers" : t}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <OverviewTab ministry={ministry} ministryId={ministryId ?? ""} navigate={navigate} />
      )}
      {activeTab === "departments" && (
        <DepartmentsTab ministry={ministry} ministryId={ministryId ?? ""} navigate={navigate} />
      )}
      {activeTab === "tenders" && (
        <TendersTab ministry={ministry} navigate={navigate} />
      )}
      {activeTab === "budget" && (
        <BudgetTab ministry={ministry} />
      )}
      {activeTab === "senior" && (
        <SeniorTab ministry={ministry} ministryId={ministryId ?? ""} navigate={navigate} />
      )}
      {activeTab === "projects" && (
        <ProjectsTab ministry={ministry} />
      )}
    </AppShell>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ ministry, ministryId, navigate }: {
  ministry: import("@/lib/ministry-dashboard-data").MinistryDashData;
  ministryId: string;
  navigate: (path: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Spend by Department" subtitle="YTD (USD M)" />
          <div className="p-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ministry.spendByDept}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="dept" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
                <Tooltip {...TIP} formatter={(v: number) => [`USD ${v}M`]} />
                <Bar dataKey="spend" fill="#3B82F6" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Tender Status" subtitle="All ministry tenders" />
          <div className="p-4 h-[220px] flex flex-col gap-3">
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ministry.tenderStatus} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" nameKey="name">
                    {ministry.tenderStatus.map((_,i) => <Cell key={i} fill={C[i % C.length]} />)}
                  </Pie>
                  <Tooltip {...TIP} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {ministry.tenderStatus.map((d,i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: C[i % C.length] }} />
                  <span className="text-black/60">{d.name}</span>
                  <span className="font-semibold text-black ml-auto">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Departments summary */}
        <Card>
          <CardHeader title="Department Overview" subtitle="Click a row to open department dashboard" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-black/40 uppercase">
                <tr>{["Department","Head","Spent/Budget","Status"].map(h => <th key={h} className="px-4 py-2 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {ministry.departments.map(d => {
                  const pct = Math.round((d.spent / d.budget) * 100);
                  return (
                    <tr key={d.id} className="hover:bg-gray-50/60 cursor-pointer"
                      onClick={() => navigate(`/ministry/${ministryId}/department/${d.id}`)}>
                      <td className="px-4 py-2.5 font-medium text-black flex items-center gap-1">
                        {d.name}<ChevronRight className="h-3 w-3 text-black/20 ml-1" />
                      </td>
                      <td className="px-4 py-2.5 text-xs text-black/60">{d.head}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden w-16">
                            <div className={`h-full rounded-full ${pct >= 85 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} style={{ width: `${Math.min(pct,100)}%` }} />
                          </div>
                          <span className="text-xs text-black/60 whitespace-nowrap">${d.spent}M / ${d.budget}M</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${STATUS_COLORS[d.status] ?? "bg-gray-100"}`}>{d.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Activity feed */}
        <Card>
          <CardHeader title="Recent Activity" subtitle="Live ministry feed" />
          <div className="divide-y divide-black/5">
            {ministry.activity.map((a,i) => (
              <div key={i} className="px-5 py-3 flex items-start gap-3">
                <span className="text-xs text-black/30 font-mono mt-0.5 whitespace-nowrap">{a.time}</span>
                <div className={`h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0 ${a.type === "success" ? "bg-[#0F172A]" : a.type === "warning" ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} />
                <span className="text-sm text-black/70">{a.event}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* State Entities */}
      <Card>
        <CardHeader title="State Entities" subtitle="Parastatals, SOEs and autonomous bodies" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-black/40 uppercase">
              <tr>{["Entity","Type","Budget (Annual)","Status",""].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {ministry.entities.map(e => (
                <tr key={e.name} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3 font-medium text-black">{e.name}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{e.type}</td>
                  <td className="px-4 py-3 font-semibold text-black">{e.budget}</td>
                  <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${STATUS_COLORS[e.status] ?? "bg-gray-100 text-gray-600"}`}>{e.status}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => toast(`Opening ${e.name} dashboard`, "info")}
                      className="h-6 px-2 rounded border border-black/10 text-[11px] hover:bg-gray-50 flex items-center gap-1">
                      <Eye className="h-3 w-3" />View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Departments Tab ──────────────────────────────────────────────────────────
function DepartmentsTab({ ministry, ministryId, navigate }: {
  ministry: import("@/lib/ministry-dashboard-data").MinistryDashData;
  ministryId: string;
  navigate: (path: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ministry.departments.map(d => {
        const pct = Math.round((d.spent / d.budget) * 100);
        return (
          <div key={d.id} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl border border-black/8 bg-white"
            onClick={() => navigate(`/ministry/${ministryId}/department/${d.id}`)}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-black">{d.name}</h3>
                  <p className="text-xs text-black/50 mt-0.5">Head: {d.head}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 ${STATUS_COLORS[d.status] ?? "bg-gray-100"}`}>{d.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="text-sm font-bold text-[#0F172A]">${d.budget}M</div>
                  <div className="text-[10px] text-black/40 mt-0.5">Budget</div>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="text-sm font-bold text-[#0F172A]">${d.spent}M</div>
                  <div className="text-[10px] text-black/40 mt-0.5">Spent</div>
                </div>
                <div className="text-center p-2 bg-slate-50 rounded-lg">
                  <div className="text-sm font-bold text-[#0F172A]">{d.staff.toLocaleString()}</div>
                  <div className="text-[10px] text-black/40 mt-0.5">Staff</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 85 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} style={{ width: `${Math.min(pct,100)}%` }} />
                </div>
                <span className="text-xs font-bold text-black/60 whitespace-nowrap">{pct}% utilised</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-black/40">Click to open department dashboard</span>
                <ChevronRight className="h-4 w-4 text-black/30" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tenders Tab ──────────────────────────────────────────────────────────────
function TendersTab({ ministry, navigate }: {
  ministry: import("@/lib/ministry-dashboard-data").MinistryDashData;
  navigate: (path: string) => void;
}) {
  return (
    <Card>
      <CardHeader title="Ministry Tenders" subtitle="All procurement tenders">
        <button onClick={() => navigate("/tenders")}
          className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1">
          <Plus className="h-3.5 w-3.5" />New
        </button>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-black/40 uppercase">
            <tr>{["ID","Title","Value","Status","Closing Date",""].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {ministry.tenders.map(t => (
              <tr key={t.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 font-mono text-[11px] text-black/40">{t.id}</td>
                <td className="px-4 py-3 font-medium text-black">{t.title}</td>
                <td className="px-4 py-3 font-semibold text-black">{t.value}</td>
                <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${STATUS_COLORS[t.status] ?? "bg-gray-100"}`}>{t.status}</span></td>
                <td className="px-4 py-3 text-xs text-black/50">{t.closing}</td>
                <td className="px-4 py-3">
                  <button onClick={() => navigate("/tenders")} className="h-6 px-2 rounded border border-black/10 text-[11px] hover:bg-gray-50">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Budget Tab ───────────────────────────────────────────────────────────────
function BudgetTab({ ministry }: { ministry: import("@/lib/ministry-dashboard-data").MinistryDashData }) {
  const avail = ministry.kpis.totalBudgetM - ministry.kpis.spentM;
  const pct = Math.round((ministry.kpis.spentM / ministry.kpis.totalBudgetM) * 100);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Approved Budget" value={`USD ${ministry.kpis.totalBudgetM}M`} icon={DollarSign} color="blue" />
        <KpiCard label="Spent YTD"       value={`USD ${ministry.kpis.spentM}M`} delta={`${pct}%`} icon={TrendingUp} color="green" />
        <KpiCard label="Committed"       value="See Depts"  icon={Activity}   color="amber" />
        <KpiCard label="Available"       value={`USD ${avail}M`} icon={DollarSign} color="cyan" />
      </div>
      <Card>
        <CardHeader title="Budget Overview" subtitle={`FY2026 — ${ministry.name}`} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-black">Approved: USD {ministry.kpis.totalBudgetM}M</span>
            <span className="text-sm font-bold text-black">{pct}% utilised</span>
          </div>
          <div className="h-4 rounded-full bg-gray-100 overflow-hidden mb-6">
            <div className={`h-full rounded-full ${pct >= 85 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} style={{ width: `${Math.min(pct,100)}%` }} />
          </div>
        </div>
        <div className="px-5 pb-4">
          <div className="text-xs font-semibold text-black/40 uppercase tracking-wider mb-3">Department Breakdown</div>
          <div className="space-y-3">
            {ministry.departments.map(d => {
              const dp = Math.round((d.spent / d.budget) * 100);
              return (
                <div key={d.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-black">{d.name}</span>
                    <span className="text-xs text-black/60">${d.spent}M / ${d.budget}M — {dp}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full ${dp >= 85 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} style={{ width: `${Math.min(dp,100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Senior Officers Tab ──────────────────────────────────────────────────────
function SeniorTab({ ministry, ministryId, navigate }: {
  ministry: import("@/lib/ministry-dashboard-data").MinistryDashData;
  ministryId: string;
  navigate: (path: string) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Star className="h-4 w-4 text-slate-600" />
        <span className="text-sm font-semibold text-black">Senior Officers — {ministry.name}</span>
        <span className="ml-auto text-xs text-black/40">Click an officer to view their dashboard</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ministry.seniorOfficers.map((officer, idx) => (
          <div key={officer.email}
            className={`border rounded-2xl p-5 cursor-pointer transition-all ${selected === idx ? "border-black shadow-lg bg-gray-50" : "border-black/8 hover:border-black/20 hover:shadow-sm bg-white"}`}
            onClick={() => setSelected(selected === idx ? null : idx)}>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                {officer.name.split(" ").map(n => n[0]).join("").slice(0,2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-black">{officer.name}</div>
                    <div className="text-xs text-black/50 mt-0.5">{officer.title}</div>
                    <div className="text-xs text-black/40 mt-0.5">{officer.dept}</div>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 ${CLEARANCE_COLORS[officer.clearanceLevel] ?? "bg-gray-100 text-gray-600"}`}>
                    <Lock className="h-2.5 w-2.5 inline mr-0.5" />{officer.clearanceLevel}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <a href={`mailto:${officer.email}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-[11px] text-black/50 hover:text-black transition-colors">
                    <Mail className="h-3 w-3" />{officer.email}
                  </a>
                  <span className="flex items-center gap-1 text-[11px] text-black/50">
                    <Phone className="h-3 w-3" />{officer.phone}
                  </span>
                </div>
              </div>
            </div>

            {selected === idx && (
              <div className="mt-4 pt-4 border-t border-black/8">
                <div className="text-xs font-semibold text-black/40 uppercase tracking-wider mb-2">Key Responsibilities</div>
                <ul className="space-y-1">
                  {officer.responsibilities.map((r, ri) => (
                    <li key={ri} className="flex items-start gap-2 text-xs text-black/70">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-black/30 flex-shrink-0" />{r}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/ministry/${ministryId}/senior/${idx}`); }}
                  className="mt-4 h-8 w-full rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                  <Star className="h-3.5 w-3.5" />Open Senior Officer Dashboard
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Projects Tab ─────────────────────────────────────────────────────────────
function ProjectsTab({ ministry }: { ministry: import("@/lib/ministry-dashboard-data").MinistryDashData }) {
  const projects = [
    { name: `${ministry.name} — ICT Modernisation`, phase: "Procurement", budget: "USD 8.4M", progress: 38, risk: "Medium" },
    { name: `${ministry.name} — Capacity Building Programme`, phase: "Implementation", budget: "USD 3.2M", progress: 64, risk: "Low" },
    { name: `${ministry.name} — Infrastructure Upgrade`, phase: "Planning", budget: "USD 12.8M", progress: 12, risk: "Medium" },
  ];
  return (
    <Card>
      <CardHeader title="Active Projects" subtitle="Capital and development projects" />
      <div className="divide-y divide-black/5">
        {projects.map(p => (
          <div key={p.name} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-sm font-semibold text-black">{p.name}</div>
                <div className="text-xs text-black/40 mt-0.5">Phase: {p.phase} · Budget: {p.budget}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-[#0F172A]" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="text-xs font-bold text-black/60">{p.progress}%</span>
                </div>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 ${p.risk === "Low" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{p.risk}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
