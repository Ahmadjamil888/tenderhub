import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { FeatureGrid } from "@/components/ModulePage";
import { useAssets, useWorkOrders } from "@/hooks/use-store";
import { useAuth } from "@/lib/auth-context";
import { pushSeniorAlert, pushNotification } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import type { StoredWorkOrder } from "@/lib/local-store";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from "recharts";
import { Wrench, Plus, Eye, CheckCircle2, Clock, AlertTriangle, Zap, Calendar } from "lucide-react";

const TABS = ["Work Orders", "Schedule", "Predictive AI", "Spare Parts", "History"] as const;
type Tab = typeof TABS[number];

const PRIORITY_COLORS: Record<string, "blue" | "green" | "amber" | "red" | "muted"> = {
  Low: "muted", Medium: "blue", High: "amber", Critical: "red",
};
const STATUS_COLORS: Record<string, "blue" | "green" | "amber" | "red" | "muted"> = {
  Open: "blue", "In Progress": "amber", Completed: "green", Cancelled: "muted",
};
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

function NewWorkOrderModal({ onClose, onSave, assets }: {
  onClose: () => void;
  onSave: (w: StoredWorkOrder) => void;
  assets: { id: string; name: string }[];
}) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    assetId: assets[0]?.id ?? "", type: "Preventive" as StoredWorkOrder["type"],
    priority: "Medium" as StoredWorkOrder["priority"],
    description: "", assignedTo: "", scheduledDate: "",
    laborHours: "4", partsCost: "USD 0", totalCost: "USD 0",
  });
  const assetName = assets.find(a => a.id === form.assetId)?.name ?? "";

  const save = () => {
    if (!form.description.trim() || !form.scheduledDate) {
      toast("Description and Scheduled Date are required.", "error"); return;
    }
    const id = `WO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    onSave({ ...form, id, assetName,
      laborHours: Number(form.laborHours), status: "Open",
      completedDate: "", createdBy: user?.name ?? "System",
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <h2 className="text-base font-semibold">Create Work Order</h2>
          <button onClick={onClose} className="text-black/30 hover:text-black text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-black/60 mb-1">Asset</label>
            <select value={form.assetId} onChange={e => setForm(f => ({ ...f, assetId: e.target.value }))}
              className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm bg-white focus:outline-none">
              {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-black/60 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as StoredWorkOrder["type"] }))}
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm bg-white focus:outline-none">
                {["Preventive", "Corrective", "Predictive", "Emergency"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-black/60 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as StoredWorkOrder["priority"] }))}
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm bg-white focus:outline-none">
                {["Low", "Medium", "High", "Critical"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-black/60 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-black/60 mb-1">Assigned To</label>
              <input value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-black/60 mb-1">Scheduled Date</label>
              <input type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-black/10">
          <button onClick={onClose} className="h-9 px-4 rounded-xl border border-black/10 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={save} className="h-9 px-4 rounded-xl bg-black text-white text-sm hover:bg-gray-800 transition-colors">Create Work Order</button>
        </div>
      </div>
    </div>
  );
}

function WorkOrdersTab({ workOrders, assets, onUpdate }: {
  workOrders: StoredWorkOrder[];
  assets: { id: string; name: string }[];
  onUpdate: (id: string, patch: Partial<StoredWorkOrder>) => void;
}) {
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? workOrders : workOrders.filter(w => w.status === filter);

  const completeWO = (w: StoredWorkOrder) => {
    onUpdate(w.id, { status: "Completed", completedDate: new Date().toISOString().split("T")[0] });
    pushSeniorAlert(`Work order completed: ${w.id} — ${w.assetName}`, "success", { from: user?.name, fromRole: user?.role, category: "action", ref: w.id });
    pushNotification(`Work order ${w.id} completed`, "success");
  };

  const viewWO = (w: StoredWorkOrder) => {
    toast(`${w.id} — ${w.assetName} | ${w.type} | ${w.priority} | ${w.status} | ${w.description.substring(0, 60)}… | Assigned: ${w.assignedTo || "Unassigned"} | Scheduled: ${w.scheduledDate} | Cost: ${w.totalCost}`, "info");
  };

  const byStatus = ["Open", "In Progress", "Completed", "Cancelled"].map(s => ({ name: s, value: workOrders.filter(w => w.status === s).length }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Work Orders" subtitle={`${filtered.length} records`}
            action={
              <div className="flex gap-2">
                {["All", "Open", "In Progress", "Completed"].map(s => (
                  <button key={s} onClick={() => setFilter(s)}
                    className={`h-7 px-3 rounded-lg text-xs font-medium transition-colors ${filter === s ? "bg-black text-white" : "border border-black/10 hover:bg-gray-50"}`}>{s}</button>
                ))}
              </div>
            }
          />
          <div className="divide-y divide-border">
            {filtered.length === 0 && <div className="px-5 py-8 text-center text-sm text-black/40">No work orders found.</div>}
            {filtered.map(w => (
              <div key={w.id} className="px-4 sm:px-5 py-3 hover:bg-secondary/40">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{w.assetName}</div>
                    <div className="text-[11px] text-black/50 font-mono">{w.id} · {w.type}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge tone={PRIORITY_COLORS[w.priority]}>{w.priority}</Badge>
                    <Badge tone={STATUS_COLORS[w.status]}>{w.status}</Badge>
                  </div>
                </div>
                <p className="text-xs text-black/60 mb-2 line-clamp-2">{w.description}</p>
                <div className="flex items-center gap-3 text-[11px] text-black/40 mb-2 flex-wrap">
                  <span>Scheduled: {w.scheduledDate || "—"}</span>
                  {w.assignedTo && <span>Assigned: {w.assignedTo}</span>}
                  <span>{w.laborHours}h labour · {w.totalCost}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => viewWO(w)} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1 transition-colors">
                    <Eye className="h-3 w-3" /> View
                  </button>
                  {(w.status === "Open" || w.status === "In Progress") && (
                    <button onClick={() => completeWO(w)} className="h-7 px-3 rounded-lg border border-slate-200 bg-slate-50 text-[#0F172A] text-xs hover:bg-slate-100 flex items-center gap-1 transition-colors">
                      <CheckCircle2 className="h-3 w-3" /> Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Status Summary" />
          <div className="p-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus.filter(s => s.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}>
                  {byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {byStatus.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-black/60">{s.name}</span>
                </div>
                <span className="font-semibold text-black">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ScheduleTab() {
  const scheduleData = [
    { month: "Jan", preventive: 18, corrective: 5, emergency: 1 },
    { month: "Feb", preventive: 22, corrective: 8, emergency: 2 },
    { month: "Mar", preventive: 19, corrective: 4, emergency: 0 },
    { month: "Apr", preventive: 24, corrective: 9, emergency: 3 },
    { month: "May", preventive: 21, corrective: 6, emergency: 1 },
    { month: "Jun", preventive: 28, corrective: 11, emergency: 2 },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Maintenance Activity — 6-Month Trend" subtitle="Preventive vs Corrective vs Emergency" />
        <div className="p-4 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scheduleData}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="preventive" fill="#334155" radius={[2, 2, 0, 0]} name="Preventive" stackId="a" />
              <Bar dataKey="corrective" fill="#64748B" radius={[0, 0, 0, 0]} name="Corrective" stackId="a" />
              <Bar dataKey="emergency" fill="#DC2626" radius={[2, 2, 0, 0]} name="Emergency" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <h2 className="text-sm font-semibold">Maintenance Planning Capabilities</h2>
      <FeatureGrid features={[
        { title: "Maintenance Schedules", desc: "Auto-generate preventive maintenance schedules from manufacturer specifications and asset criticality." },
        { title: "Calendar Optimization", desc: "AI-optimized maintenance windows minimizing operational downtime and technician travel." },
        { title: "Technician Management", desc: "Skill-based technician assignment, availability tracking, and workload balancing." },
        { title: "Service Contracts", desc: "SLA tracking for outsourced maintenance with performance scoring and automatic renewal alerts." },
        { title: "Maintenance KPIs", desc: "MTBF, MTTR, maintenance compliance rate, cost-per-asset, and wrench-time efficiency." },
        { title: "Mobile Execution", desc: "Technicians receive work orders on mobile, complete checklists, capture photos and parts used." },
      ]} />
    </div>
  );
}

function PredictiveAITab({ assets }: { assets: { id: string; name: string; condition: string; assetClass: string }[] }) {
  const riskAssets = assets.filter(a => a.condition === "Poor" || a.condition === "Critical").map(a => ({
    ...a,
    failureProbability: a.condition === "Critical" ? Math.floor(Math.random() * 30 + 70) : Math.floor(Math.random() * 30 + 40),
    rul: a.condition === "Critical" ? `${Math.floor(Math.random() * 30 + 5)} days` : `${Math.floor(Math.random() * 6 + 2)} months`,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <KpiCard label="Predicted Failures (30 days)" value={riskAssets.length.toString()} delta="Based on AI analysis" positive={false} icon={Zap} color="red" />
        <KpiCard label="Avg Health Score" value={`${assets.length > 0 ? Math.round(assets.filter(a => a.condition === "Good").length / assets.length * 100) : 0}%`} delta="Fleet-wide condition" icon={CheckCircle2} color="green" />
        <KpiCard label="Downtime Avoided" value="142 hrs" delta="Est. savings via predictive" icon={Clock} color="blue" />
      </div>
      <Card>
        <CardHeader title="Asset Risk Assessment" subtitle="AI-predicted failure probability and remaining useful life" />
        <div className="divide-y divide-border">
          {riskAssets.length === 0 && <div className="px-5 py-8 text-center text-sm text-black/40">No high-risk assets detected. All assets in good or fair condition.</div>}
          {riskAssets.map(a => (
            <div key={a.id} className="px-4 sm:px-5 py-3 hover:bg-secondary/40">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-sm font-semibold">{a.name}</div>
                  <div className="text-[11px] text-black/50 font-mono">{a.id} · {a.assetClass}</div>
                </div>
                <Badge tone={a.condition === "Critical" ? "red" : "amber"}>{a.condition}</Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-black/60">
                <div>
                  <span className="font-medium text-black">Failure Probability:</span>{" "}
                  <span className={a.failureProbability >= 70 ? "text-red-600 font-semibold" : "text-[#0F172A] font-semibold"}>{a.failureProbability}%</span>
                </div>
                <div><span className="font-medium text-black">RUL:</span> {a.rul}</div>
                <button
                  onClick={() => {
                    pushNotification(`Maintenance scheduled for ${a.name} (${a.id}) — failure probability ${a.failureProbability}%. Work order created and assigned to maintenance team.`, "success");
                  }}
                  className="ml-auto h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 transition-colors">Schedule Maintenance</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <h2 className="text-sm font-semibold">Predictive AI Capabilities</h2>
      <FeatureGrid features={[
        { title: "IoT Sensor Integration", desc: "Real-time data ingestion from temperature, vibration, pressure, and current sensors via MQTT/REST APIs." },
        { title: "Anomaly Detection", desc: "Machine learning models flag deviations from normal operating parameters in real time." },
        { title: "Failure Probability Scoring", desc: "Asset-specific models calculate probability of failure within 7, 30, and 90-day windows." },
        { title: "Remaining Useful Life", desc: "Deep learning estimators provide RUL predictions for critical equipment components." },
        { title: "Root Cause Analysis", desc: "AI-assisted root cause identification from sensor patterns and maintenance history." },
        { title: "Digital Twins", desc: "Virtual asset representations enable simulation of failure scenarios and maintenance outcomes." },
      ]} />
    </div>
  );
}

function SparePartsTab() {
  const parts = [
    { id: "SPR-001", name: "Hydraulic Pump Seal Kit", assetClass: "Plant & Machinery", stock: 3, reorderPoint: 5, unitCost: "USD 180", status: "Low Stock" },
    { id: "SPR-002", name: "Engine Air Filter (Toyota 1VD-FTV)", assetClass: "Vehicles & Fleets", stock: 12, reorderPoint: 6, unitCost: "USD 45", status: "Adequate" },
    { id: "SPR-003", name: "Server DDR4 32GB RAM Module", assetClass: "IT Equipment", stock: 0, reorderPoint: 4, unitCost: "USD 220", status: "Stockout" },
    { id: "SPR-004", name: "Solar Inverter Battery Cell", assetClass: "Production Equipment", stock: 8, reorderPoint: 10, unitCost: "USD 320", status: "Low Stock" },
    { id: "SPR-005", name: "Caterpillar Track Link Assembly", assetClass: "Plant & Machinery", stock: 2, reorderPoint: 2, unitCost: "USD 1,840", status: "Adequate" },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Spare Parts Inventory" subtitle="Critical parts stock levels" />
        <div className="divide-y divide-border">
          {parts.map(p => (
            <div key={p.id} className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-[11px] text-black/50 mt-0.5">{p.id} · {p.assetClass} · {p.unitCost}/unit</div>
                <div className="text-[11px] mt-1">Stock: <strong>{p.stock}</strong> · Reorder at: {p.reorderPoint}</div>
              </div>
              <Badge tone={p.status === "Stockout" ? "red" : p.status === "Low Stock" ? "amber" : "green"}>{p.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function AssetMaintenancePage() {
  const { user } = useAuth();
  const { assets } = useAssets();
  const { workOrders, add, update } = useWorkOrders();
  const [tab, setTab] = useState<Tab>("Work Orders");
  const [showNewWO, setShowNewWO] = useState(false);

  const open = workOrders.filter(w => w.status === "Open").length;
  const inProgress = workOrders.filter(w => w.status === "In Progress").length;
  const completed = workOrders.filter(w => w.status === "Completed").length;
  const critical = workOrders.filter(w => w.priority === "Critical" && w.status !== "Completed").length;

  const handleAddWO = (w: StoredWorkOrder) => {
    add(w);
    pushSeniorAlert(`Work order created: ${w.id} for ${w.assetName}`, "info", { from: user?.name, fromRole: user?.role, category: "action", ref: w.id });
    setShowNewWO(false);
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Enterprise Asset Management"
        process="Asset Maintenance"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="amber">Maintenance Management</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Asset Maintenance"
          description="Preventive and corrective maintenance management, work order lifecycle, predictive analytics, and spare parts inventory."
          actions={
            <button onClick={() => setShowNewWO(true)}
              className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Work Order
            </button>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Open Work Orders" value={open.toString()} delta="Awaiting assignment" positive={false} icon={Wrench} color="blue" />
          <KpiCard label="In Progress" value={inProgress.toString()} delta="Currently active" icon={Clock} color="amber" />
          <KpiCard label="Completed (All Time)" value={completed.toString()} delta="Successfully closed" icon={CheckCircle2} color="green" />
          <KpiCard label="Critical Priority" value={critical.toString()} delta="Requires immediate action" positive={false} icon={AlertTriangle} color="red" />
        </div>
        <div className="flex gap-1 mb-6 border-b border-black/10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"
              }`}>{t}</button>
          ))}
        </div>
        {tab === "Work Orders" && <WorkOrdersTab workOrders={workOrders} assets={assets} onUpdate={update} />}
        {tab === "Schedule" && <ScheduleTab />}
        {tab === "Predictive AI" && <PredictiveAITab assets={assets} />}
        {tab === "Spare Parts" && <SparePartsTab />}
        {tab === "History" && (
          <Card>
            <CardHeader title="Maintenance History" subtitle="All completed work orders" />
            <div className="divide-y divide-border">
              {workOrders.filter(w => w.status === "Completed").length === 0
                ? <div className="px-5 py-8 text-center text-sm text-black/40">No completed work orders yet.</div>
                : workOrders.filter(w => w.status === "Completed").map(w => (
                    <div key={w.id} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-medium">{w.assetName}</div>
                          <div className="text-[11px] text-black/50">{w.id} · {w.type} · Completed: {w.completedDate}</div>
                        </div>
                        <Badge tone="green">Completed</Badge>
                      </div>
                    </div>
                  ))
              }
            </div>
          </Card>
        )}
      </div>
      {showNewWO && <NewWorkOrderModal onClose={() => setShowNewWO(false)} onSave={handleAddWO} assets={assets} />}
      <AIAssistantPanel agentName="Predictive Maintenance Agent" agentRole="AI-powered maintenance optimization and failure prediction"
        context="asset maintenance and work order management" color="amber"
        suggestedPrompts={["Show assets overdue for maintenance", "Predict failures in next 30 days", "Optimize maintenance schedule", "Identify top maintenance cost drivers"]} />
    </AppShell>
  );
}
