import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  Users, TrendingUp, ShieldCheck, FileText, Activity,
  DollarSign, ArrowLeft, Briefcase, Star, Phone, Mail, ChevronRight,
} from "lucide-react";
import { ZW_MINISTRIES } from "@/lib/zw-ministries";
import { MINISTRY_DASH } from "@/lib/ministry-dashboard-data";

const TIP = { contentStyle: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 } };

const STATUS_COLORS: Record<string, string> = {
  "On Track": "bg-slate-100 text-[#0F172A]", Good: "bg-slate-100 text-[#0F172A]",
  Warning: "bg-slate-100 text-[#0F172A]", "At Risk": "bg-red-100 text-red-700",
  Active: "bg-slate-100 text-[#0F172A]", "On Leave": "bg-slate-100 text-[#0F172A]",
  Evaluation: "bg-slate-100 text-[#0F172A]", Bidding: "bg-slate-100 text-[#0F172A]",
  Awarded: "bg-slate-100 text-[#0F172A]", Published: "bg-slate-100 text-[#0F172A]",
  Critical: "bg-red-100 text-red-700",
};

// Build spend trend data from dept budget/spent
function buildSpendTrend(budget: number, spent: number) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun"];
  const avg = spent / 6;
  return months.map((month, i) => ({
    month,
    spend: Math.round(avg * (0.8 + Math.random() * 0.5)),
  }));
}

type TabDept = "overview" | "staff" | "tenders" | "workbench" | "budget";

export default function DepartmentDashboardPage() {
  const { ministryId, deptId } = useParams<{ ministryId: string; deptId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabDept>("overview");

  // Resolve ZWMinistry from zw-ministries.ts
  const zwMin = ZW_MINISTRIES.find(m => m.id === ministryId);
  const zwDept = zwMin?.departments.find(d => d.id === deptId);

  // Resolve ministry dashboard data for financial figures
  const dashMin = ministryId ? MINISTRY_DASH[ministryId] : undefined;
  const dashDept = dashMin?.departments.find(d => d.id === deptId);

  // Fallback values
  const deptName = zwDept?.name ?? dashDept?.name ?? "Department";
  const minName = zwMin?.name ?? dashMin?.name ?? "Ministry";
  const head = zwDept?.head ?? dashDept?.head ?? "—";
  const budget = dashDept?.budget ?? 100;
  const spent = dashDept?.spent ?? 60;
  const staff = dashDept?.staff ?? zwDept?.roles.reduce((s, r) => s + r.count, 0) ?? 0;
  const pct = Math.round((spent / budget) * 100);
  const spendTrend = buildSpendTrend(budget, spent);

  // Senior roles from ZW data
  const seniorRoles = zwDept?.roles.filter(r => r.level === "Senior" || r.level === "Executive") ?? [];
  const allRoles = zwDept?.roles ?? [];

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Department Management"
        process="Department Dashboard"
        financialYear="FY2026"
        pageType="dashboard"
      />
      {/* Back */}
      <button onClick={() => navigate(`/ministry/${ministryId}/dashboard`)}
        className="flex items-center gap-2 text-sm text-black/50 hover:text-black mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to {minName.split(" ").slice(0,3).join(" ")}
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="h-12 w-12 rounded-2xl bg-black text-white text-xl flex items-center justify-center flex-shrink-0">🏢</div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-black">{deptName}</h1>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <span className="text-sm text-black/50">{minName}</span>
            <span className="text-sm text-black/50">Head: {head}</span>
            {zwDept && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Code: {zwDept.code}</span>}
          </div>
        </div>
        <button onClick={() => navigate(`/workbench/${ministryId}`)}
          className="h-8 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1.5 flex-shrink-0">
          <Briefcase className="h-3.5 w-3.5" />Procurement Workbench
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Budget (M)"       value={`USD ${budget}M`}             icon={DollarSign}  color="blue" />
        <KpiCard label="Spent (M)"        value={`USD ${spent}M`} delta={`${pct}%`} icon={TrendingUp} color={pct >= 85 ? "amber" : "green"} />
        <KpiCard label="Available (M)"    value={`USD ${budget - spent}M`}     icon={Activity}    color="cyan" />
        <KpiCard label="Staff Count"      value={staff.toLocaleString()}        icon={Users}       color="violet" />
        <KpiCard label="Senior Roles"     value={String(seniorRoles.reduce((s,r) => s + r.count, 0))} icon={Star} color="amber" />
        <KpiCard label="Compliance"       value="94%"                          icon={ShieldCheck} color="green" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-black/5 mb-6 overflow-x-auto">
        {(["overview","staff","tenders","workbench","budget"] as TabDept[]).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`h-9 px-4 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors
              ${activeTab === t ? "border-black text-black" : "border-transparent text-black/40 hover:text-black/70"}`}>
            {t === "workbench" ? "Procurement" : t}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <DeptOverviewTab spendTrend={spendTrend} allRoles={allRoles} deptName={deptName} navigate={navigate} />
      )}
      {activeTab === "staff" && (
        <DeptStaffTab allRoles={allRoles} head={head} deptName={deptName} />
      )}
      {activeTab === "tenders" && (
        <DeptTendersTab minName={minName} deptName={deptName} navigate={navigate} />
      )}
      {activeTab === "workbench" && (
        <DeptWorkbenchTab ministryId={ministryId ?? ""} navigate={navigate} />
      )}
      {activeTab === "budget" && (
        <DeptBudgetTab budget={budget} spent={spent} pct={pct} deptName={deptName} />
      )}
    </AppShell>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function DeptOverviewTab({ spendTrend, allRoles, deptName, navigate }: {
  spendTrend: { month: string; spend: number }[];
  allRoles: { title: string; level: string; count: number }[];
  deptName: string;
  navigate: (p: string) => void;
}) {
  const performanceMetrics = [
    { metric: "Budget Utilisation",           value: "66%",      status: "On Track" },
    { metric: "Procurement Plan Adherence",   value: "92%",      status: "Good"     },
    { metric: "Contract Performance",         value: "4.4/5.0",  status: "Good"     },
    { metric: "Open Audit Findings",          value: "3",        status: "Warning"  },
    { metric: "Supplier Rating Avg",          value: "4.1/5.0",  status: "Good"     },
    { metric: "Invoice Payment Avg",          value: "24 days",  status: "On Track" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Monthly Expenditure Trend" subtitle="USD M" />
          <div className="p-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendTrend}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
                <Tooltip {...TIP} formatter={(v: number) => [`USD ${v}M`]} />
                <Area type="monotone" dataKey="spend" stroke="#334155" fill="#eff6ff" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Performance Metrics" subtitle={deptName} />
          <div className="divide-y divide-black/5">
            {performanceMetrics.map(p => (
              <div key={p.metric} className="px-5 py-2.5 flex items-center justify-between">
                <span className="text-sm text-black/70">{p.metric}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-black">{p.value}</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${STATUS_COLORS[p.status] ?? "bg-gray-100"}`}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Staff Role Breakdown */}
      <Card>
        <CardHeader title="Staffing Structure" subtitle="Roles by level" />
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Executive","Senior","Officer","Support"].map(level => {
              const roles = allRoles.filter(r => r.level === level);
              const count = roles.reduce((s, r) => s + r.count, 0);
              const levelColors: Record<string,string> = {
                Executive: "bg-slate-50 text-[#0F172A] border-slate-200",
                Senior: "bg-slate-50 text-[#0F172A] border-slate-200",
                Officer: "bg-slate-50 text-[#0F172A] border-slate-200",
                Support: "bg-gray-50 text-gray-600 border-gray-100",
              };
              return (
                <div key={level} className={`rounded-xl border p-3 text-center ${levelColors[level]}`}>
                  <div className="text-2xl font-bold">{count.toLocaleString()}</div>
                  <div className="text-xs mt-1 font-medium">{level}</div>
                  <div className="text-[10px] mt-0.5 opacity-70">{roles.length} role type{roles.length !== 1 ? "s" : ""}</div>
                </div>
              );
            })}
          </div>
          {allRoles.length > 0 && (
            <div className="mt-4 space-y-2">
              {allRoles.map(r => (
                <div key={r.title} className="flex items-center justify-between text-sm">
                  <span className="text-black/70">{r.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-black/40">{r.level}</span>
                    <span className="text-sm font-bold text-black">{r.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Staff Tab ─────────────────────────────────────────────────────────────────
function DeptStaffTab({ allRoles, head, deptName }: {
  allRoles: { title: string; level: string; count: number }[];
  head: string;
  deptName: string;
}) {
  return (
    <Card>
      <CardHeader title={`Staff — ${deptName}`} subtitle={`Head of Department: ${head}`} />
      {allRoles.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-black/40 uppercase">
              <tr>
                {["Role Title","Level","Headcount","Workload"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {allRoles.map(r => {
                const workload = r.level === "Executive" ? 95 : r.level === "Senior" ? 82 : r.level === "Officer" ? 74 : 68;
                return (
                  <tr key={r.title} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-medium text-black">{r.title}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        r.level === "Executive" ? "bg-slate-100 text-[#0F172A]" :
                        r.level === "Senior"    ? "bg-slate-100 text-[#0F172A]"  :
                        r.level === "Officer"   ? "bg-slate-100 text-[#0F172A]"    :
                        "bg-gray-100 text-gray-600"
                      }`}>{r.level}</span>
                    </td>
                    <td className="px-4 py-3 font-bold text-black">{r.count.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden w-20">
                          <div className={`h-full rounded-full ${workload >= 90 ? "bg-red-500" : workload >= 80 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} style={{ width: `${workload}%` }} />
                        </div>
                        <span className="text-xs text-black/50">{workload}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-8 text-center text-sm text-black/40">No staff data available for this department.</div>
      )}
    </Card>
  );
}

// ─── Tenders Tab ──────────────────────────────────────────────────────────────
function DeptTendersTab({ minName, deptName, navigate }: {
  minName: string;
  deptName: string;
  navigate: (p: string) => void;
}) {
  const mockTenders = [
    { id: `ZW-${deptName.substring(0,4).toUpperCase()}-2026-001`, title: `${deptName} — Q3 Supplies`, value: "USD 4.2M", status: "Bidding", closing: "2026-08-15" },
    { id: `ZW-${deptName.substring(0,4).toUpperCase()}-2026-002`, title: `${deptName} — IT Systems`, value: "USD 2.8M", status: "Evaluation", closing: "2026-07-30" },
    { id: `ZW-${deptName.substring(0,4).toUpperCase()}-2026-003`, title: `${deptName} — Consultancy Services`, value: "USD 1.4M", status: "Awarded", closing: "2026-06-20" },
  ];
  return (
    <Card>
      <CardHeader title={`Tenders — ${deptName}`} subtitle={minName}>
        <button onClick={() => navigate("/tenders")} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1">
          New Tender
        </button>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-black/40 uppercase">
            <tr>{["ID","Title","Value","Status","Closing",""].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {mockTenders.map(t => (
              <tr key={t.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 font-mono text-[11px] text-black/40">{t.id}</td>
                <td className="px-4 py-3 font-medium text-black">{t.title}</td>
                <td className="px-4 py-3 font-semibold">{t.value}</td>
                <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${STATUS_COLORS[t.status] ?? "bg-gray-100"}`}>{t.status}</span></td>
                <td className="px-4 py-3 text-xs text-black/50">{t.closing}</td>
                <td className="px-4 py-3"><button onClick={() => navigate("/tenders")} className="h-6 px-2 rounded border border-black/10 text-[11px] hover:bg-gray-50">View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Workbench Tab ─────────────────────────────────────────────────────────────
function DeptWorkbenchTab({ ministryId, navigate }: { ministryId: string; navigate: (p: string) => void }) {
  return (
    <Card>
      <CardHeader title="Procurement Workbench" subtitle="Department procurement tasks & workflow" />
      <div className="p-8 text-center">
        <Briefcase className="h-12 w-12 text-black/20 mx-auto mb-3" />
        <p className="text-sm text-black/50 mb-4">Open the ministry procurement workbench to manage this department's tenders, RFQs and approvals.</p>
        <button onClick={() => navigate(`/workbench/${ministryId}`)}
          className="h-9 px-5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors">
          Open Procurement Workbench
        </button>
      </div>
    </Card>
  );
}

// ─── Budget Tab ────────────────────────────────────────────────────────────────
function DeptBudgetTab({ budget, spent, pct, deptName }: {
  budget: number; spent: number; pct: number; deptName: string;
}) {
  const committed = Math.round(budget * 0.12);
  const available = budget - spent - committed;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Approved Budget" value={`USD ${budget}M`} icon={DollarSign} color="blue" />
        <KpiCard label="Spent YTD"       value={`USD ${spent}M`} delta={`${pct}%`} icon={TrendingUp} color={pct >= 85 ? "amber" : "green"} />
        <KpiCard label="Available"       value={`USD ${available}M`} icon={Activity} color="cyan" />
      </div>
      <Card>
        <CardHeader title="Budget Allocation & Utilisation" subtitle={`FY2026 — ${deptName}`} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Approved Budget: USD {budget}M</span>
            <span className="text-sm font-bold">{pct}% utilised</span>
          </div>
          <div className="h-4 rounded-full bg-gray-100 overflow-hidden mb-6">
            <div className={`h-full rounded-full ${pct >= 85 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} style={{ width: `${Math.min(pct,100)}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              ["Spent", spent, "text-[#0F172A]"],
              ["Committed", committed, "text-[#0F172A]"],
              ["Available", available, "text-[#0F172A]"],
            ].map(([label, val, cls]) => (
              <div key={label as string} className="p-3 rounded-xl bg-gray-50">
                <div className={`text-xl font-bold ${cls}`}>{val}</div>
                <div className="text-xs text-black/40 mt-0.5">{label} (USD M)</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
