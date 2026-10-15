/**
 * MinistryWorkbenchPage — per-ministry procurement workbench
 * Route: /workbench/:ministryId
 * When no ministryId is provided, falls back to the global workbench
 */
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppShell, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import {
  ArrowLeft, Briefcase, FileText, CheckCircle2, Clock,
  AlertTriangle, ChevronRight, Plus, Filter, Search,
  Building2, DollarSign, ShieldCheck, Activity, Users,
  Star, TrendingUp, Eye,
} from "lucide-react";
import { MINISTRY_DASH } from "@/lib/ministry-dashboard-data";

type WBStatus = "Open" | "Pending" | "Approved" | "Rejected" | "On Hold";
type WBType = "Tender" | "RFQ" | "RFP" | "EOI" | "Auction";
type WBPriority = "High" | "Medium" | "Low";

interface WBRecord {
  id: string;
  refNo: string;
  title: string;
  dept: string;
  type: WBType;
  stage: string;
  status: WBStatus;
  priority: WBPriority;
  value: string;
  dueDate: string;
  owner: string;
  pct: number;
}

const PRIORITY_COLORS: Record<WBPriority, string> = {
  High:   "bg-red-100 text-red-700",
  Medium: "bg-slate-100 text-[#0F172A]",
  Low:    "bg-gray-100 text-gray-600",
};
const STATUS_COLORS: Record<WBStatus, string> = {
  Open:     "bg-slate-100 text-[#0F172A]",
  Pending:  "bg-slate-100 text-[#0F172A]",
  Approved: "bg-slate-100 text-[#0F172A]",
  Rejected: "bg-red-100 text-red-700",
  "On Hold":"bg-gray-100 text-gray-600",
};

function buildRecords(ministryId: string, ministry: { name: string; departments: { id: string; name: string }[] }): WBRecord[] {
  const types: WBType[] = ["Tender","RFQ","RFP","EOI","Auction"];
  const stages = ["Planning","Requisition","Preparation","Approval","Advertisement","Bidding","Evaluation","Award","Contract","Delivery"];
  return ministry.departments.flatMap((dept, di) =>
    types.slice(0, 2 + (di % 3)).map((type, ti) => ({
      id: `${ministryId.toUpperCase()}-WB-${String(di * 10 + ti + 1).padStart(3,"0")}`,
      refNo: `ZW-${ministryId.toUpperCase()}-2026-${String((di * 10 + ti + 1) * 7).padStart(5,"0")}`,
      title: `${dept.name} — ${type} ${ti + 1}`,
      dept: dept.name,
      type,
      stage: stages[(di + ti) % stages.length],
      status: (["Open","Pending","Approved","Pending","Open"] as WBStatus[])[(di + ti) % 5],
      priority: (["High","Medium","Low"] as WBPriority[])[(di + ti) % 3],
      value: `USD ${(4.5 + di * 3.2 + ti * 1.8).toFixed(1)}M`,
      dueDate: `2026-${String(7 + di).padStart(2,"0")}-${String(10 + ti * 5).padStart(2,"0")}`,
      owner: `Officer ${di + 1}`,
      pct: 20 + (di * 15 + ti * 8) % 70,
    }))
  );
}

type TabWB = "queue" | "overview" | "departments" | "analytics";

export default function MinistryWorkbenchPage() {
  const { ministryId } = useParams<{ ministryId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabWB>("queue");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<WBStatus | "All">("All");
  const [filterType, setFilterType] = useState<WBType | "All">("All");

  const ministry = ministryId ? MINISTRY_DASH[ministryId] : undefined;

  if (!ministry) {
    // No ministry param — redirect to generic workbench
    navigate("/workbench");
    return null;
  }

  const allRecords = buildRecords(ministryId!, ministry);
  const records = allRecords.filter(r => {
    if (filterStatus !== "All" && r.status !== filterStatus) return false;
    if (filterType   !== "All" && r.type !== filterType)     return false;
    if (search && !r.title.toLowerCase().includes(search.toLowerCase()) && !r.refNo.includes(search)) return false;
    return true;
  });

  const pendingCount  = allRecords.filter(r => r.status === "Pending").length;
  const openCount     = allRecords.filter(r => r.status === "Open").length;
  const approvedCount = allRecords.filter(r => r.status === "Approved").length;
  const highPriority  = allRecords.filter(r => r.priority === "High" && r.status !== "Approved").length;

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Ministry Management"
        process="Ministry Workbench"
        financialYear="FY2026"
        pageType="workbench"
      />
      {/* Back */}
      <button onClick={() => navigate(`/ministry/${ministryId}/dashboard`)}
        className="flex items-center gap-2 text-sm text-black/50 hover:text-black mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />Back to {ministry.name.split(" ").slice(0,3).join(" ")} Dashboard
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="h-12 w-12 rounded-2xl bg-black text-white text-xl flex items-center justify-center flex-shrink-0">
          {ministry.badge}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-black">Procurement Workbench</h1>
          <p className="text-sm text-black/50 mt-0.5">{ministry.name} · Minister: {ministry.minister}</p>
        </div>
        <button onClick={() => navigate("/workbench")}
          className="h-8 px-3 rounded-lg border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5 flex-shrink-0">
          <Briefcase className="h-3.5 w-3.5" />Global Workbench
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <KpiCard label="Total Records"    value={String(allRecords.length)} icon={FileText}    color="blue" />
        <KpiCard label="Pending Action"   value={String(pendingCount)}      icon={Clock}       color="amber" />
        <KpiCard label="Open"             value={String(openCount)}          icon={Activity}   color="blue" />
        <KpiCard label="Approved"         value={String(approvedCount)}      icon={CheckCircle2} color="green" />
        <KpiCard label="High Priority"    value={String(highPriority)}       icon={AlertTriangle} color="red" />
        <KpiCard label="Departments"      value={String(ministry.departments.length)} icon={Building2} color="violet" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-black/5 mb-6">
        {(["queue","overview","departments","analytics"] as TabWB[]).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`h-9 px-4 text-sm font-medium capitalize border-b-2 transition-colors
              ${activeTab === t ? "border-black text-black" : "border-transparent text-black/40 hover:text-black/70"}`}>
            {t === "queue" ? "Work Queue" : t}
          </button>
        ))}
      </div>

      {activeTab === "queue" && (
        <WorkQueueTab
          records={records} search={search} setSearch={setSearch}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          filterType={filterType} setFilterType={setFilterType}
          navigate={navigate}
        />
      )}
      {activeTab === "overview" && <WorkbenchOverviewTab ministry={ministry} allRecords={allRecords} />}
      {activeTab === "departments" && <WorkbenchDeptsTab ministry={ministry} ministryId={ministryId ?? ""} navigate={navigate} />}
      {activeTab === "analytics" && <WorkbenchAnalyticsTab allRecords={allRecords} />}
    </AppShell>
  );
}

// ─── Work Queue ───────────────────────────────────────────────────────────────
function WorkQueueTab({ records, search, setSearch, filterStatus, setFilterStatus, filterType, setFilterType, navigate }: {
  records: WBRecord[];
  search: string; setSearch: (s: string) => void;
  filterStatus: WBStatus | "All"; setFilterStatus: (s: WBStatus | "All") => void;
  filterType: WBType | "All"; setFilterType: (t: WBType | "All") => void;
  navigate: (p: string) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or reference…"
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as WBStatus | "All")}
          className="h-9 px-3 rounded-xl border border-black/10 text-sm bg-white focus:outline-none">
          {["All","Open","Pending","Approved","Rejected","On Hold"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value as WBType | "All")}
          className="h-9 px-3 rounded-xl border border-black/10 text-sm bg-white focus:outline-none">
          {["All","Tender","RFQ","RFP","EOI","Auction"].map(t => <option key={t}>{t}</option>)}
        </select>
        <button onClick={() => navigate("/workbench")}
          className="h-9 px-3 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" />New Record
        </button>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-black/40 uppercase">
              <tr>
                {["Ref No","Title","Dept","Type","Stage","Status","Priority","Value","Due","Progress",""].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {records.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-8 text-center text-sm text-black/30">No records match your filters.</td></tr>
              )}
              {records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50/60">
                  <td className="px-3 py-2.5 font-mono text-[10px] text-black/40 whitespace-nowrap">{r.refNo}</td>
                  <td className="px-3 py-2.5 font-medium text-black max-w-[200px] truncate">{r.title}</td>
                  <td className="px-3 py-2.5 text-xs text-black/60 whitespace-nowrap max-w-[120px] truncate">{r.dept}</td>
                  <td className="px-3 py-2.5">
                    <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">{r.type}</span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-black/60 whitespace-nowrap">{r.stage}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${PRIORITY_COLORS[r.priority]}`}>{r.priority}</span>
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-black whitespace-nowrap">{r.value}</td>
                  <td className="px-3 py-2.5 text-[11px] text-black/50 whitespace-nowrap">{r.dueDate}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full bg-[#0F172A]" style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="text-[10px] text-black/40">{r.pct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => navigate("/workbench")}
                      className="h-6 px-2 rounded border border-black/10 text-[10px] hover:bg-gray-50 flex items-center gap-1">
                      <Eye className="h-3 w-3" />Open
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

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function WorkbenchOverviewTab({ ministry, allRecords }: {
  ministry: import("@/lib/ministry-dashboard-data").MinistryDashData;
  allRecords: WBRecord[];
}) {
  const byStatus = ["Open","Pending","Approved","Rejected","On Hold"].map(s => ({
    status: s, count: allRecords.filter(r => r.status === s).length,
  }));
  const byType = ["Tender","RFQ","RFP","EOI","Auction"].map(t => ({
    type: t, count: allRecords.filter(r => r.type === t).length,
  }));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Records by Status" subtitle="All ministry procurement records" />
          <div className="divide-y divide-black/5">
            {byStatus.map(s => (
              <div key={s.status} className="px-5 py-3 flex items-center justify-between">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${STATUS_COLORS[s.status as WBStatus] ?? "bg-gray-100"}`}>{s.status}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-[#0F172A]" style={{ width: `${(s.count / allRecords.length) * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-black w-6 text-right">{s.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Records by Type" subtitle="Procurement modality breakdown" />
          <div className="divide-y divide-black/5">
            {byType.filter(t => t.count > 0).map(t => (
              <div key={t.type} className="px-5 py-3 flex items-center justify-between">
                <span className="text-sm font-medium text-black">{t.type}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-[#0F172A]" style={{ width: `${(t.count / allRecords.length) * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-black w-6 text-right">{t.count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader title="Ministry Context" subtitle={ministry.name} />
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <div className="text-2xl font-bold text-[#0F172A]">{ministry.kpis.activeTenders}</div>
            <div className="text-xs text-black/40 mt-0.5">Active Tenders</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <div className="text-2xl font-bold text-[#0F172A]">{ministry.kpis.activeContracts}</div>
            <div className="text-xs text-black/40 mt-0.5">Active Contracts</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <div className="text-2xl font-bold text-[#0F172A]">{ministry.kpis.budgetUtil}%</div>
            <div className="text-xs text-black/40 mt-0.5">Budget Utilised</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-xl">
            <div className="text-2xl font-bold text-[#0F172A]">{ministry.kpis.compliance}%</div>
            <div className="text-xs text-black/40 mt-0.5">Compliance</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Departments Tab ──────────────────────────────────────────────────────────
function WorkbenchDeptsTab({ ministry, ministryId, navigate }: {
  ministry: import("@/lib/ministry-dashboard-data").MinistryDashData;
  ministryId: string;
  navigate: (p: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ministry.departments.map(dept => (
        <div key={dept.id} className="cursor-pointer hover:shadow-md transition-shadow rounded-2xl border border-black/8 bg-white"
          onClick={() => navigate(`/ministry/${ministryId}/department/${dept.id}`)}>
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-black">{dept.name}</h3>
                <p className="text-xs text-black/50 mt-0.5">Head: {dept.head}</p>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${dept.status === "Active" ? "bg-slate-100 text-[#0F172A]" : dept.status === "At Risk" ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-700"}`}>{dept.status}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-black/40">
              <span>Budget: USD {dept.budget}M</span>
              <span>Staff: {dept.staff.toLocaleString()}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-black/40">View department dashboard →</span>
              <ChevronRight className="h-4 w-4 text-black/30" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Analytics Tab ─────────────────────────────────────────────────────────────
function WorkbenchAnalyticsTab({ allRecords }: { allRecords: WBRecord[] }) {
  const avgPct = Math.round(allRecords.reduce((s, r) => s + r.pct, 0) / (allRecords.length || 1));
  const highP  = allRecords.filter(r => r.priority === "High").length;
  const overdue = allRecords.filter(r => r.status === "Pending" && new Date(r.dueDate) < new Date()).length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Avg Completion"  value={`${avgPct}%`}       icon={TrendingUp}   color="blue" />
        <KpiCard label="High Priority"   value={String(highP)}      icon={AlertTriangle} color="red" />
        <KpiCard label="Overdue"         value={String(overdue)}    icon={Clock}         color="amber" />
        <KpiCard label="Total Value"     value="—"                  icon={DollarSign}    color="green" />
      </div>
      <Card>
        <CardHeader title="Progress by Department" subtitle="Average procurement completion %" />
        <div className="divide-y divide-black/5">
          {Array.from(new Set(allRecords.map(r => r.dept))).map(dept => {
            const dRecs = allRecords.filter(r => r.dept === dept);
            const dAvg  = Math.round(dRecs.reduce((s, r) => s + r.pct, 0) / (dRecs.length || 1));
            return (
              <div key={dept} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-black truncate">{dept}</span>
                  <span className="text-xs text-black/60 ml-2 whitespace-nowrap">{dRecs.length} records · {dAvg}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${dAvg >= 80 ? "bg-[#0F172A]" : dAvg >= 50 ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} style={{ width: `${dAvg}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
