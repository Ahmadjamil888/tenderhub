import { useState } from "react";
import { AppShell, Card, CardHeader, PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import {
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  Building2, Plus, Eye, Lock, Unlock, X, GitBranch,
} from "lucide-react";
import BudgetHierarchyTree from "@/components/BudgetHierarchyTree";

const C = ["#334155","#475569","#64748B","#334155","#DC2626","#334155","#475569","#64748B"];
const TIP = { contentStyle: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 } };

const CENTRES = [
  { id: "BC-MIN-001", name: "Ministry of Health & Child Care", type: "Ministry",   ministry: "Health",     approved: 820, spent: 542, committed: 124, available: 154, pct: 81, status: "Active"  },
  { id: "BC-MIN-002", name: "Ministry of Transport",           type: "Ministry",   ministry: "Transport",  approved: 640, spent: 381, committed: 98,  available: 161, pct: 75, status: "Active"  },
  { id: "BC-MIN-003", name: "Ministry of Education",           type: "Ministry",   ministry: "Education",  approved: 510, spent: 289, committed: 72,  available: 149, pct: 71, status: "Active"  },
  { id: "BC-MIN-004", name: "Ministry of Agriculture",         type: "Ministry",   ministry: "Agriculture",approved: 430, spent: 198, committed: 88,  available: 144, pct: 66, status: "Active"  },
  { id: "BC-MIN-005", name: "Ministry of Energy",              type: "Ministry",   ministry: "Energy",     approved: 380, spent: 201, committed: 55,  available: 124, pct: 67, status: "Active"  },
  { id: "BC-DEP-001", name: "Clinical Services Dept",          type: "Department", ministry: "Health",     approved: 280, spent: 186, committed: 42,  available: 52,  pct: 82, status: "Active"  },
  { id: "BC-DEP-002", name: "Infrastructure Division",         type: "Department", ministry: "Transport",  approved: 320, spent: 214, committed: 68,  available: 38,  pct: 88, status: "At Risk" },
  { id: "BC-AUT-001", name: "ZIMRA",                           type: "Autonomous", ministry: "Finance",    approved: 180, spent: 88,  committed: 28,  available: 64,  pct: 64, status: "Active"  },
  { id: "BC-AUT-002", name: "ZINARA",                          type: "Autonomous", ministry: "Transport",  approved: 95,  spent: 41,  committed: 18,  available: 36,  pct: 62, status: "Active"  },
  { id: "BC-SOE-001", name: "ZESA Holdings",                   type: "SOE",        ministry: "Energy",     approved: 240, spent: 142, committed: 48,  available: 50,  pct: 79, status: "Active"  },
];

const PIE_DATA = [
  { name: "Health",      value: 820 },
  { name: "Transport",   value: 640 },
  { name: "Education",   value: 510 },
  { name: "Agriculture", value: 430 },
  { name: "Energy",      value: 380 },
  { name: "Finance",     value: 290 },
  { name: "Water",       value: 260 },
  { name: "ICT",         value: 180 },
];

function statusColor(s: string) {
  if (s === "At Risk") return "bg-slate-100 text-[#0F172A] border border-slate-200";
  if (s === "Frozen")  return "bg-red-100 text-red-700 border border-red-200";
  return "bg-slate-100 text-[#0F172A] border border-slate-200";
}

function pctColor(p: number) {
  if (p >= 100) return "bg-red-500";
  if (p >= 85)  return "bg-[#0F172A]";
  return "bg-[#0F172A]";
}

export default function BudgetCentresPage() {
  const [activeTab, setActiveTab] = useState<"hierarchy" | "register">("hierarchy");
  const [showAdd, setShowAdd]     = useState(false);
  const [centres, setCentres]     = useState(CENTRES);
  const [form, setForm]           = useState({ name: "", type: "Ministry", ministry: "", approved: "", status: "Active" });
  const [detailItem, setDetailItem] = useState<typeof CENTRES[0] | null>(null);
  const [filter, setFilter]       = useState("All");

  const [ministry, setMinistry] = useState("ALL");
  const [deptType, setDeptType] = useState("ALL");
  const [cell,     setCell]     = useState("ALL");
  const [finYear,  setFinYear]  = useState("2026/2027");

  const MINISTRY_OPTS = ["ALL", "Health", "Transport", "Education", "Agriculture", "Energy", "Finance", "Water", "ICT"];
  const DEPT_OPTS     = ["ALL", "Department", "SOE", "SPV", "Autonomous Body"];
  const CELL_OPTS     = ["ALL", "Capital Projects", "Recurrent", "Personnel", "Grants", "Transfers"];
  const FY_OPTS       = ["ALL", "2026/2027", "2025/2026", "2024/2025", "2023/2024"];

  const filtered = centres.filter(c => {
    if (filter !== "All" && c.type !== filter) return false;
    if (ministry !== "ALL" && c.ministry !== ministry) return false;
    return true;
  });

  function handleAdd() {
    if (!form.name || !form.ministry || !form.approved) {
      toast("Please fill in all required fields", "warning"); return;
    }
    const newC = {
      id: `BC-NEW-${Date.now()}`, name: form.name,
      type: form.type as "Ministry", ministry: form.ministry,
      approved: Number(form.approved), spent: 0,
      committed: 0, available: Number(form.approved), pct: 0, status: "Active",
    };
    setCentres(p => [...p, newC]);
    setShowAdd(false);
    setForm({ name: "", type: "Ministry", ministry: "", approved: "", status: "Active" });
    toast(`Budget centre "${form.name}" created`, "success");
  }

  function handleFreeze(id: string)   { setCentres(p => p.map(c => c.id === id ? { ...c, status: "Frozen" } : c)); toast(`Budget centre ${id} frozen`, "warning"); }
  function handleUnfreeze(id: string) { setCentres(p => p.map(c => c.id === id ? { ...c, status: "Active" } : c)); toast(`Budget centre ${id} unfrozen`, "success"); }
  function handleAllocate(id: string) { toast(`Budget allocation initiated for ${id}`, "info"); }
  function handleTransfer(id: string) { toast(`Budget transfer workflow opened for ${id}`, "info"); }

  return (
    <AppShell>
      {/* ── Government context bar ──────────────────────────────────────────── */}
      <PageContextBar
        ministry="Ministry of Finance & Economic Development"
        module="Budget Management"
        process="Budget Centres"
        financialYear="2026/2027"
        pageType="workbench"
      />

      {/* ── Filter + tab switcher row ────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center gap-2 flex-wrap px-4 sm:px-6 py-2.5 bg-white border-b border-black/8">
        <span className="text-xs font-semibold text-black/40 flex-shrink-0">Filters:</span>
        {([
          { label: "Ministry",       value: ministry, setter: setMinistry, opts: MINISTRY_OPTS },
          { label: "Dept / SOE",     value: deptType, setter: setDeptType, opts: DEPT_OPTS     },
          { label: "Cell",           value: cell,     setter: setCell,     opts: CELL_OPTS     },
          { label: "Financial Year", value: finYear,  setter: setFinYear,  opts: FY_OPTS       },
        ] as const).map(({ label, value, setter, opts }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-[10px] text-black/40 font-medium">{label}:</span>
            <select
              value={value}
              onChange={e => (setter as (v: string) => void)(e.target.value)}
              className="h-7 px-2 rounded-lg border border-black/10 text-xs bg-white text-black focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/30"
            >
              {opts.map(o => <option key={o} value={o}>{o === "ALL" ? `All ${label}s` : o}</option>)}
            </select>
          </div>
        ))}
        <button
          onClick={() => { setMinistry("ALL"); setDeptType("ALL"); setCell("ALL"); setFinYear("2026/2027"); }}
          className="h-7 px-3 rounded-lg border border-black/10 text-xs text-black/50 hover:bg-gray-50"
        >
          Reset
        </button>

        <div className="flex-1" />

        {/* Tab switcher */}
        <div className="flex items-center gap-0.5 border border-black/10 rounded-lg p-0.5 bg-gray-50">
          {([
            { key: "hierarchy" as const, label: "Budget Hierarchy Tree", icon: GitBranch },
            { key: "register"  as const, label: "Centres Register",      icon: Building2 },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === t.key ? "bg-white text-black shadow-sm" : "text-black/40 hover:text-black/70"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content area — fills all remaining vertical space ────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col px-4 sm:px-6 py-4">

        {/* ── HIERARCHY TAB ──────────────────────────────────────────────────── */}
        {activeTab === "hierarchy" && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-shrink-0 mb-3">
              <h2 className="text-sm font-bold text-black">Government Budget Hierarchy</h2>
              <p className="text-xs text-black/50 mt-0.5">
                5-level structure: All Ministry → Ministry → Department / SOE → Centers Budget → Cell Budget.
                Click any row to expand sub-entities. Hover a row and click "Detail" for the full breakdown.
              </p>
            </div>
            {/* Tree fills all remaining height and scrolls internally */}
            <div className="flex-1 min-h-0 overflow-auto rounded-2xl border border-black/8">
              <BudgetHierarchyTree />
            </div>
          </div>
        )}

        {/* ── REGISTER TAB ───────────────────────────────────────────────────── */}
        {activeTab === "register" && (
          <div className="flex-1 min-h-0 overflow-auto space-y-4">

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader title="Budget vs Spent by Centre" subtitle="Top centres (USD M)" />
                <div className="p-4 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={centres.slice(0, 7)} layout="vertical">
                      <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} width={120} />
                      <Tooltip {...TIP} formatter={(v: number) => [`USD ${v}M`]} />
                      <Bar dataKey="approved" fill="#e2e8f0" radius={[0, 3, 3, 0]} name="Approved" />
                      <Bar dataKey="spent"    fill="#334155" radius={[0, 3, 3, 0]} name="Spent" />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <CardHeader title="Budget Distribution by Ministry" subtitle="Approved budget share" />
                <div className="p-4 h-[280px] flex flex-col gap-2">
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={78} dataKey="value" nameKey="name">
                          {PIE_DATA.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                        </Pie>
                        <Tooltip {...TIP} formatter={(v: number) => [`USD ${v}M`]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {PIE_DATA.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: C[i % C.length] }} />
                        <span className="text-[11px] text-black/60 truncate">{d.name}</span>
                        <span className="text-[11px] font-semibold text-black ml-auto">{d.value}M</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Register table */}
            <Card>
              <CardHeader title="Budget Centres Register" subtitle="All entities with budget allocations and utilisation">
                <div className="flex items-center gap-2 flex-wrap">
                  {["All", "Ministry", "Department", "Autonomous", "SOE"].map(t => (
                    <button key={t} onClick={() => setFilter(t)}
                      className={`h-7 px-3 text-xs rounded-lg border transition-colors ${filter === t ? "bg-black text-white border-black" : "border-black/10 hover:bg-gray-50"}`}>
                      {t}
                    </button>
                  ))}
                  <button onClick={() => setShowAdd(true)}
                    className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1.5 hover:bg-gray-800 transition-colors ml-2">
                    <Plus className="h-3.5 w-3.5" />New Centre
                  </button>
                </div>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-black/40 uppercase">
                    <tr>
                      {["ID", "Centre Name", "Type", "Ministry", "Budget (M)", "Spent (M)", "Committed (M)", "Available (M)", "% Used", "Status", "Actions"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filtered.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/60">
                        <td className="px-4 py-3 font-mono text-[11px] text-black/40">{c.id}</td>
                        <td className="px-4 py-3 font-medium text-black">{c.name}</td>
                        <td className="px-4 py-3 text-xs text-black/60">{c.type}</td>
                        <td className="px-4 py-3 text-xs text-black/60">{c.ministry}</td>
                        <td className="px-4 py-3 font-semibold text-black">{c.approved}</td>
                        <td className="px-4 py-3 text-black/70">{c.spent}</td>
                        <td className="px-4 py-3 text-black/70">{c.committed}</td>
                        <td className="px-4 py-3 text-black/70">{c.available}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div className={`h-full rounded-full ${pctColor(c.pct)}`} style={{ width: `${Math.min(c.pct, 100)}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-black/70">{c.pct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${statusColor(c.status)}`}>{c.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 flex-wrap">
                            <button onClick={() => setDetailItem(c)} className="h-6 px-2 rounded border border-black/10 text-[11px] hover:bg-gray-50 flex items-center gap-1">
                              <Eye className="h-3 w-3" />View
                            </button>
                            <button onClick={() => handleAllocate(c.id)} className="h-6 px-2 rounded border border-slate-200 bg-slate-50 text-[#0F172A] text-[11px] hover:bg-slate-100">Allocate</button>
                            <button onClick={() => handleTransfer(c.id)} className="h-6 px-2 rounded border border-slate-200 bg-slate-50 text-[#0F172A] text-[11px] hover:bg-slate-100">Transfer</button>
                            {c.status === "Frozen"
                              ? <button onClick={() => handleUnfreeze(c.id)} className="h-6 px-2 rounded border border-slate-200 bg-slate-50 text-[#0F172A] text-[11px] hover:bg-slate-100 flex items-center gap-1"><Unlock className="h-3 w-3" />Unfreeze</button>
                              : <button onClick={() => handleFreeze(c.id)}   className="h-6 px-2 rounded border border-red-200 bg-red-50 text-red-700 text-[11px] hover:bg-red-100 flex items-center gap-1"><Lock className="h-3 w-3" />Freeze</button>
                            }
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

      </div>{/* end content area */}

      {/* ── Add modal ─────────────────────────────────────────────────────────── */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-black">New Budget Centre</h2>
              <button onClick={() => setShowAdd(false)} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-black/60 mb-1 block">Centre Name *</label>
                <input className="w-full h-9 rounded-lg border border-black/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Department of Roads" />
              </div>
              <div>
                <label className="text-xs font-medium text-black/60 mb-1 block">Type *</label>
                <select className="w-full h-9 rounded-lg border border-black/10 px-3 text-sm focus:outline-none bg-white"
                  value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {["Ministry", "Department", "Autonomous", "SOE"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-black/60 mb-1 block">Parent Ministry *</label>
                <input className="w-full h-9 rounded-lg border border-black/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  value={form.ministry} onChange={e => setForm(p => ({ ...p, ministry: e.target.value }))} placeholder="e.g. Health" />
              </div>
              <div>
                <label className="text-xs font-medium text-black/60 mb-1 block">Approved Budget (USD M) *</label>
                <input type="number" className="w-full h-9 rounded-lg border border-black/10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                  value={form.approved} onChange={e => setForm(p => ({ ...p, approved: e.target.value }))} placeholder="e.g. 120" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowAdd(false)} className="flex-1 h-9 rounded-lg border border-black/10 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleAdd} className="flex-1 h-9 rounded-lg bg-black text-white text-sm hover:bg-gray-800">Create Centre</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail modal ──────────────────────────────────────────────────────── */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-black">{detailItem.name}</h2>
              <button onClick={() => setDetailItem(null)} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-gray-100"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ["ID", detailItem.id], ["Type", detailItem.type], ["Ministry", detailItem.ministry], ["Status", detailItem.status],
                ["Approved Budget", `USD ${detailItem.approved}M`], ["Spent", `USD ${detailItem.spent}M`],
                ["Committed", `USD ${detailItem.committed}M`], ["Available", `USD ${detailItem.available}M`],
              ].map(([k, v]) => (
                <div key={k}><div className="text-xs text-black/40 mb-0.5">{k}</div><div className="font-medium text-black">{v}</div></div>
              ))}
              <div className="col-span-2">
                <div className="text-xs text-black/40 mb-1">Budget Utilisation</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full ${pctColor(detailItem.pct)}`} style={{ width: `${Math.min(detailItem.pct, 100)}%` }} />
                  </div>
                  <span className="font-bold text-black">{detailItem.pct}%</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => handleAllocate(detailItem.id)} className="flex-1 h-9 rounded-lg bg-black text-white text-sm hover:bg-gray-800">Allocate Budget</button>
              <button onClick={() => handleTransfer(detailItem.id)} className="flex-1 h-9 rounded-lg border border-black/10 text-sm hover:bg-gray-50">Transfer Funds</button>
              <button onClick={() => setDetailItem(null)} className="h-9 px-4 rounded-lg border border-black/10 text-sm hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

    </AppShell>
  );
}
