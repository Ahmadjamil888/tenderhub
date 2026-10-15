import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard, PageContextBar } from "@/components/AppShell";
import { FeatureGrid } from "@/components/ModulePage";
import { useAssets } from "@/hooks/use-store";
import { useAuth } from "@/lib/auth-context";
import { pushSeniorAlert, pushNotification } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import type { StoredAsset } from "@/lib/local-store";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import LifecycleTower from "@/components/LifecycleTower";
import { ASSET_STAGES } from "@/lib/lifecycle-stages";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import {
  Package, Plus, Search, Download, Eye, Edit3, QrCode, AlertTriangle,
  CheckCircle2, Clock, Wrench, MapPin, User, Building2, Tag, RefreshCw,
} from "lucide-react";

const TABS = ["Overview", "Asset Register", "Deployment", "Transfers", "Inspections", "Lifecycle Tower", "AI Agents"] as const;
type Tab = typeof TABS[number];

const ASSET_CLASSES = [
  "Property & Buildings", "Plant & Machinery", "Production Equipment",
  "Vehicles & Fleets", "IT Equipment", "Tools & Instruments",
  "Furniture & Office Assets", "Infrastructure Assets", "Specialized Operational",
];

const STATUS_COLORS: Record<string, "blue" | "green" | "amber" | "red" | "muted" | "violet"> = {
  Active: "green", Idle: "amber", "Under Maintenance": "blue",
  Disposed: "muted", "In Transfer": "violet", Unserviceable: "red",
};

const CONDITION_COLORS: Record<string, string> = {
  Good: "text-[#0F172A]", Fair: "text-[#0F172A]",
  Poor: "text-[#0F172A]", Critical: "text-red-600",
};

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#84CC16", "#F97316"];

// ── Register Asset Modal ──────────────────────────────────────────────────────
function RegisterAssetModal({ onClose, onSave }: { onClose: () => void; onSave: (a: StoredAsset) => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "", assetClass: ASSET_CLASSES[0], category: "", location: "",
    department: user?.department ?? "", custodian: user?.name ?? "",
    serialNumber: "", manufacturer: "", model: "",
    purchaseDate: "", acquisitionCost: "", usefulLifeYears: "5",
    depreciationMethod: "Straight-Line" as StoredAsset["depreciationMethod"],
    warrantyExpiry: "", notes: "",
  });

  const save = () => {
    if (!form.name.trim() || !form.location.trim()) {
      toast("Asset Name and Location are required.", "error"); return;
    }
    const id = `AST-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    onSave({
      id, ...form,
      status: "Active", condition: "Good",
      currentValue: form.acquisitionCost,
      usefulLifeYears: Number(form.usefulLifeYears),
      lastInspectionDate: new Date().toISOString().split("T")[0],
      nextMaintenanceDate: "",
      barcode: `BC-${id}`,
      createdBy: user?.name ?? "System",
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <h2 className="text-base font-semibold">Register New Asset</h2>
          <button onClick={onClose} className="text-black/30 hover:text-black text-xl leading-none">×</button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Asset Name *", key: "name", type: "text" },
            { label: "Location *", key: "location", type: "text" },
            { label: "Department", key: "department", type: "text" },
            { label: "Custodian", key: "custodian", type: "text" },
            { label: "Serial Number", key: "serialNumber", type: "text" },
            { label: "Manufacturer", key: "manufacturer", type: "text" },
            { label: "Model", key: "model", type: "text" },
            { label: "Category", key: "category", type: "text" },
            { label: "Purchase Date", key: "purchaseDate", type: "date" },
            { label: "Acquisition Cost (USD)", key: "acquisitionCost", type: "text" },
            { label: "Useful Life (Years)", key: "usefulLifeYears", type: "number" },
            { label: "Warranty Expiry", key: "warrantyExpiry", type: "date" },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-black/60 mb-1">{label}</label>
              <input type={type} value={(form as Record<string, string>)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-black/60 mb-1">Asset Class</label>
            <select value={form.assetClass} onChange={e => setForm(f => ({ ...f, assetClass: e.target.value }))}
              className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none bg-white">
              {ASSET_CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-black/60 mb-1">Depreciation Method</label>
            <select value={form.depreciationMethod}
              onChange={e => setForm(f => ({ ...f, depreciationMethod: e.target.value as StoredAsset["depreciationMethod"] }))}
              className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none bg-white">
              <option>Straight-Line</option>
              <option>Declining Balance</option>
              <option>Units of Production</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-black/60 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-black/10">
          <button onClick={onClose} className="h-9 px-4 rounded-xl border border-black/10 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={save} className="h-9 px-4 rounded-xl bg-black text-white text-sm hover:bg-gray-800 transition-colors">Register Asset</button>
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ assets }: { assets: StoredAsset[] }) {
  const byClass = ASSET_CLASSES.map(c => ({ name: c.replace(" & ", " & "), value: assets.filter(a => a.assetClass === c).length })).filter(x => x.value > 0);
  const byStatus = ["Active", "Idle", "Under Maintenance", "In Transfer", "Unserviceable", "Disposed"].map(s => ({
    name: s, value: assets.filter(a => a.status === s).length,
  })).filter(x => x.value > 0);
  const agingData = [
    { age: "0–2 yrs", count: assets.filter(a => { const y = new Date().getFullYear() - new Date(a.purchaseDate).getFullYear(); return y >= 0 && y <= 2; }).length },
    { age: "3–5 yrs", count: assets.filter(a => { const y = new Date().getFullYear() - new Date(a.purchaseDate).getFullYear(); return y >= 3 && y <= 5; }).length },
    { age: "6–10 yrs", count: assets.filter(a => { const y = new Date().getFullYear() - new Date(a.purchaseDate).getFullYear(); return y >= 6 && y <= 10; }).length },
    { age: "11–20 yrs", count: assets.filter(a => { const y = new Date().getFullYear() - new Date(a.purchaseDate).getFullYear(); return y >= 11 && y <= 20; }).length },
    { age: "20+ yrs", count: assets.filter(a => new Date().getFullYear() - new Date(a.purchaseDate).getFullYear() > 20).length },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader title="Asset Portfolio by Class" subtitle="Distribution across asset classes" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byClass} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={2}>
                  {byClass.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Asset Status Distribution" subtitle="Operational status breakdown" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byStatus} layout="vertical">
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={100} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#334155" radius={[0, 3, 3, 0]} name="Assets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Asset Age Profile" subtitle="Lifecycle distribution by age" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="age" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#475569" radius={[3, 3, 0, 0]} name="Assets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <h2 className="text-sm font-semibold mt-2">Asset Management Capabilities</h2>
      <FeatureGrid features={[
        { title: "Asset Master Registry", desc: "Single source of truth with unique ID generation, barcode/QR/RFID tagging, classification hierarchy, ownership, and depreciation details." },
        { title: "Acquisition & Receiving", desc: "PO integration, supplier delivery tracking, inspection workflows, acceptance testing, document capture, and warranty activation." },
        { title: "Deployment & Assignment", desc: "Asset allocation to employees and departments, digital handover forms, custodian management, and usage agreements." },
        { title: "Operations & Utilization", desc: "Operating hours tracking, IoT sensor integration, downtime logging, utilization KPIs, and energy consumption monitoring." },
        { title: "Preventive Maintenance", desc: "Scheduled maintenance plans, task checklists, technician assignments, spare parts management, and maintenance history." },
        { title: "Predictive Maintenance AI", desc: "Sensor data analysis, anomaly detection, failure probability scoring, remaining useful life estimation, and automated alerts." },
        { title: "Work Order Management", desc: "AI-generated work orders, priority assignment, technician scheduling, labor tracking, material consumption, and completion reports." },
        { title: "Transfer & Movement", desc: "Transfer request workflows, approval processes, GPS-based tracking, RFID movement detection, and unauthorized movement alerts." },
        { title: "Inspection & Compliance", desc: "Inspection schedules, safety certifications, calibration tracking, regulatory reporting, and compliance scoring." },
        { title: "Financial Management", desc: "Acquisition cost tracking, depreciation calculations, book value, ROI analysis, ERP integration, and disposal value estimation." },
        { title: "Lifecycle Planning", desc: "Asset aging analysis, replacement planning, capital budgeting, lifecycle cost modelling, and AI repair-vs-replace recommendations." },
        { title: "Disposal & Retirement", desc: "Retirement approval workflows, disposal methods (auction, recycling, destruction), environmental compliance, and financial closure." },
      ]} />
    </div>
  );
}

// ── Asset Register Tab ────────────────────────────────────────────────────────
function AssetRegisterTab({ assets, onUpdate }: { assets: StoredAsset[]; onUpdate: (id: string, patch: Partial<StoredAsset>) => void }) {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = assets.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.location.toLowerCase().includes(q) || a.department.toLowerCase().includes(q);
    const matchClass = filterClass === "All" || a.assetClass === filterClass;
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    return matchSearch && matchClass && matchStatus;
  });

  const viewAsset = (a: StoredAsset) => {
    toast(`${a.id} — ${a.name} | ${a.assetClass} | ${a.status} | ${a.condition} | ${a.location} | Cost: ${a.acquisitionCost}`, "info");
  };

  const updateStatus = (a: StoredAsset, status: StoredAsset["status"]) => {
    onUpdate(a.id, { status });
    pushSeniorAlert(`Asset status updated: ${a.name} → ${status}`, "info", { from: user?.name, fromRole: user?.role, category: "action", ref: a.id });
    pushNotification(`${a.id} status updated to ${status}`, "success");
  };

  const exportCSV = () => {
    const rows = ["ID,Name,Class,Status,Condition,Location,Department,Custodian,Value,Purchase Date",
      ...filtered.map(a => `${a.id},"${a.name}","${a.assetClass}","${a.status}","${a.condition}","${a.location}","${a.department}","${a.custodian}","${a.currentValue}","${a.purchaseDate}"`)
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "asset-register.csv"; a.click();
    URL.revokeObjectURL(url);
    pushNotification("Asset register exported to CSV", "success");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets…"
            className="w-full h-9 pl-8 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white" />
        </div>
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
          className="h-9 px-3 rounded-xl border border-black/10 text-sm bg-white focus:outline-none">
          <option value="All">All Classes</option>
          {ASSET_CLASSES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-9 px-3 rounded-xl border border-black/10 text-sm bg-white focus:outline-none">
          {["All", "Active", "Idle", "Under Maintenance", "In Transfer", "Unserviceable", "Disposed"].map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={exportCSV} className="h-9 px-3 rounded-xl border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>
      <Card>
        <CardHeader title={`Asset Register`} subtitle={`${filtered.length} of ${assets.length} assets`} />
        <div className="divide-y divide-border">
          {filtered.length === 0 && <div className="px-5 py-8 text-center text-sm text-black/40">No assets match your filters.</div>}
          {filtered.map(a => (
            <div key={a.id} className="px-4 sm:px-5 py-3 hover:bg-secondary/40">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground leading-tight truncate">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{a.id} · {a.assetClass}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs font-medium ${CONDITION_COLORS[a.condition]}`}>{a.condition}</span>
                  <Badge tone={STATUS_COLORS[a.status] ?? "muted"}>{a.status}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-black/50 mb-2 flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.location}</span>
                <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{a.department}</span>
                <span className="flex items-center gap-1"><User className="h-3 w-3" />{a.custodian}</span>
                <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{a.currentValue}</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => viewAsset(a)} className="h-7 px-3 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1 transition-colors">
                  <Eye className="h-3 w-3" /> View
                </button>
                <button onClick={() => updateStatus(a, "Under Maintenance")} className="h-7 px-3 rounded-lg border border-slate-200 bg-slate-50 text-[#0F172A] text-xs hover:bg-slate-100 flex items-center gap-1 transition-colors">
                  <Wrench className="h-3 w-3" /> Maintenance
                </button>
                <button onClick={() => updateStatus(a, "In Transfer")} className="h-7 px-3 rounded-lg border border-slate-200 bg-slate-50 text-[#0F172A] text-xs hover:bg-slate-100 flex items-center gap-1 transition-colors">
                  <RefreshCw className="h-3 w-3" /> Transfer
                </button>
                {a.status !== "Active" && (
                  <button onClick={() => updateStatus(a, "Active")} className="h-7 px-3 rounded-lg border border-slate-200 bg-slate-50 text-[#0F172A] text-xs hover:bg-slate-100 flex items-center gap-1 transition-colors">
                    <CheckCircle2 className="h-3 w-3" /> Set Active
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Deployment Tab ────────────────────────────────────────────────────────────
function DeploymentTab({ assets }: { assets: StoredAsset[] }) {
  const byDept = assets.reduce((acc, a) => {
    acc[a.department] = (acc[a.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const deptData = Object.entries(byDept).map(([dept, count]) => ({ dept: dept.replace("Ministry of ", "Min. "), count })).sort((a, b) => b.count - a.count).slice(0, 8);

  const idle = assets.filter(a => a.status === "Idle");
  const noCustodian = assets.filter(a => !a.custodian || a.custodian.trim() === "");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Asset Deployment by Department" subtitle="Top 8 departments by asset count" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="dept" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" fill="#334155" radius={[3, 3, 0, 0]} name="Assets" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Idle Assets Requiring Deployment" subtitle={`${idle.length} assets currently idle`}
            action={idle.length > 0 ? <Badge tone="amber">{idle.length} Idle</Badge> : undefined} />
          <div className="divide-y divide-border max-h-[240px] overflow-y-auto">
            {idle.length === 0 && <div className="px-5 py-6 text-center text-sm text-black/40">No idle assets.</div>}
            {idle.map(a => (
              <div key={a.id} className="px-4 py-3">
                <div className="text-sm font-medium text-black truncate">{a.name}</div>
                <div className="text-[11px] text-black/50 mt-0.5">{a.id} · {a.location} · {a.department}</div>
                <div className="text-[11px] text-[#0F172A] font-medium mt-0.5">⚠ Idle — recommend redeployment or disposal review</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card>
        <CardHeader title="Missing Custodians" subtitle={`${noCustodian.length} assets without assigned custodian`} />
        {noCustodian.length === 0
          ? <div className="px-5 py-6 text-center text-sm text-black/40">All assets have custodians assigned.</div>
          : <div className="divide-y divide-border">
              {noCustodian.map(a => (
                <div key={a.id} className="px-4 py-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">{a.name}</div>
                    <div className="text-[11px] text-black/50">{a.id} · {a.department}</div>
                  </div>
                  <Badge tone="red">No Custodian</Badge>
                </div>
              ))}
            </div>
        }
      </Card>
    </div>
  );
}

// ── Transfers Tab ─────────────────────────────────────────────────────────────
function TransfersTab({ assets }: { assets: StoredAsset[] }) {
  const inTransfer = assets.filter(a => a.status === "In Transfer");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Active Asset Transfers" subtitle={`${inTransfer.length} assets currently in transit`} />
        <div className="divide-y divide-border">
          {inTransfer.length === 0 && <div className="px-5 py-8 text-center text-sm text-black/40">No assets currently in transfer.</div>}
          {inTransfer.map(a => (
            <div key={a.id} className="px-4 sm:px-5 py-3 hover:bg-secondary/40">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <div className="text-sm font-semibold">{a.name}</div>
                  <div className="text-[11px] text-black/50 font-mono">{a.id} · {a.assetClass}</div>
                </div>
                <Badge tone="violet">In Transfer</Badge>
              </div>
              <div className="text-[11px] text-black/50 mb-2">From: {a.department} — {a.location}</div>
              <div className="text-[11px] text-black/50">Custodian: {a.custodian}</div>
            </div>
          ))}
        </div>
      </Card>
      <h2 className="text-sm font-semibold">Transfer Workflow Capabilities</h2>
      <FeatureGrid features={[
        { title: "Transfer Requests", desc: "Submit inter-department transfer requests with justification, destination, and new custodian details." },
        { title: "Multi-Level Approval", desc: "Configurable approval chain: Department Head → Asset Manager → CPO for high-value assets." },
        { title: "GPS Tracking", desc: "Real-time GPS monitoring of assets during physical transportation with geofence alerts." },
        { title: "RFID Movement Detection", desc: "Automated RFID reader integration triggers alerts when assets cross facility boundaries." },
        { title: "Handover Documentation", desc: "Digital handover forms with electronic signature capture and automatic audit trail entry." },
        { title: "Unauthorized Movement Alerts", desc: "AI monitors expected asset locations and flags unauthorized movements to Asset Manager." },
      ]} />
    </div>
  );
}

// ── Inspections Tab ───────────────────────────────────────────────────────────
function InspectionsTab({ assets }: { assets: StoredAsset[] }) {
  const today = new Date().toISOString().split("T")[0];
  const overdueInspection = assets.filter(a => a.nextMaintenanceDate && a.nextMaintenanceDate < today && a.status !== "Disposed");
  const warrantyExpiring = assets.filter(a => {
    if (!a.warrantyExpiry || a.warrantyExpiry === "N/A") return false;
    const diff = (new Date(a.warrantyExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 90;
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Overdue Maintenance" subtitle={`${overdueInspection.length} assets past scheduled date`}
            action={overdueInspection.length > 0 ? <Badge tone="red">{overdueInspection.length} Overdue</Badge> : undefined} />
          <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
            {overdueInspection.length === 0 && <div className="px-5 py-6 text-center text-sm text-black/40">No overdue maintenance. ✓</div>}
            {overdueInspection.map(a => (
              <div key={a.id} className="px-4 py-3">
                <div className="text-sm font-medium">{a.name}</div>
                <div className="text-[11px] text-black/50 mt-0.5">{a.id} · {a.location}</div>
                <div className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Next due: {a.nextMaintenanceDate} (overdue)
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Warranty Expiring Soon" subtitle="Within the next 90 days"
            action={warrantyExpiring.length > 0 ? <Badge tone="amber">{warrantyExpiring.length} Expiring</Badge> : undefined} />
          <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
            {warrantyExpiring.length === 0 && <div className="px-5 py-6 text-center text-sm text-black/40">No warranties expiring within 90 days.</div>}
            {warrantyExpiring.map(a => (
              <div key={a.id} className="px-4 py-3">
                <div className="text-sm font-medium">{a.name}</div>
                <div className="text-[11px] text-black/50 mt-0.5">{a.id} · {a.manufacturer} {a.model}</div>
                <div className="text-[11px] text-[#0F172A] font-medium mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Warranty expires: {a.warrantyExpiry}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <h2 className="text-sm font-semibold">Inspection & Compliance Capabilities</h2>
      <FeatureGrid features={[
        { title: "Scheduled Inspections", desc: "Auto-generate inspection schedules based on asset class, regulatory requirements, and manufacturer recommendations." },
        { title: "Mobile Inspections", desc: "Technicians complete checklists on mobile devices with photo capture, GPS tagging, and offline capability." },
        { title: "Safety Certifications", desc: "Track safety certificates with expiry alerts and automatic compliance reporting to regulatory bodies." },
        { title: "Calibration Management", desc: "Schedule and record calibration events for instruments and specialized equipment with calibration certificates." },
        { title: "Defect Detection AI", desc: "Image-based AI analysis during inspections identifies defects, anomalies, and deterioration patterns." },
        { title: "Compliance Scoring", desc: "Real-time compliance score calculated across all assets with drill-down to individual compliance gaps." },
      ]} />
    </div>
  );
}

// ── AI Agents Tab ─────────────────────────────────────────────────────────────
function AIAgentsTab() {
  const agents = [
    { name: "Asset Registry Agent", role: "Maintains asset data quality, detects duplicates, recommends missing fields", status: "Active", confidence: 96, actions: 1842, color: "bg-[#0F172A]" },
    { name: "Asset Classification Agent", role: "Auto-categorizes new assets from invoices, suggests hierarchy, validates class attributes", status: "Active", confidence: 94, actions: 621, color: "bg-[#0F172A]" },
    { name: "Acquisition Agent", role: "Automates receiving workflows, matches deliveries to POs, detects discrepancies", status: "Active", confidence: 97, actions: 408, color: "bg-[#0F172A]" },
    { name: "Allocation Agent", role: "Recommends optimal asset assignments based on utilization data and department needs", status: "Active", confidence: 91, actions: 284, color: "bg-[#0F172A]" },
    { name: "Predictive Maintenance Agent", role: "Analyses sensor data, predicts failures, estimates remaining useful life, schedules proactive maintenance", status: "Active", confidence: 89, actions: 1203, color: "bg-[#0F172A]" },
    { name: "Compliance Agent", role: "Tracks certifications, calibration dates, regulatory deadlines and sends automated reminders", status: "Active", confidence: 98, actions: 2140, color: "bg-[#0F172A]" },
    { name: "Financial Asset Agent", role: "Automates depreciation calculations, asset valuations, and replacement cost estimates", status: "Active", confidence: 93, actions: 762, color: "bg-rose-500" },
    { name: "Lifecycle Strategy Agent", role: "Recommends repair vs replace decisions, optimal retirement timing, and capital investment priorities", status: "Standby", confidence: 88, actions: 94, color: "bg-[#0F172A]" },
    { name: "Disposal Agent", role: "Determines best disposal method, estimates recovery value, and ensures environmental compliance", status: "Active", confidence: 90, actions: 187, color: "bg-[#0F172A]" },
    { name: "Inventory Optimization Agent", role: "Forecasts spare parts demand, prevents stockouts, optimizes reorder points and safety stock levels", status: "Active", confidence: 92, actions: 543, color: "bg-[#0F172A]" },
    { name: "Chief Asset Intelligence Agent", role: "Enterprise-wide asset strategy, risk analysis, investment recommendations, and executive briefings", status: "Active", confidence: 95, actions: 312, color: "bg-slate-700" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {agents.map(ag => (
          <Card key={ag.name} className="p-4 hover:border-primary/40 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className={`h-9 w-9 rounded-xl ${ag.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xs font-bold">{ag.name.split(" ")[0][0]}{ag.name.split(" ").slice(-1)[0][0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-black leading-tight">{ag.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-semibold ${ag.status === "Active" ? "text-[#0F172A]" : "text-[#0F172A]"}`}>● {ag.status}</span>
                  <span className="text-[10px] text-black/40">{ag.confidence}% confidence</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-black/60 leading-relaxed mb-3">{ag.role}</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-black/40">{ag.actions.toLocaleString()} actions logged</span>
              <button className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 transition-colors">Consult</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AssetManagementPage() {
  const { user } = useAuth();
  const { assets, add, update } = useAssets();
  const [tab, setTab] = useState<Tab>("Overview");
  const [showRegister, setShowRegister] = useState(false);

  const totalValue = assets.reduce((sum, a) => {
    const v = parseFloat(a.currentValue.replace(/[^0-9.]/g, "")) || 0;
    return sum + v;
  }, 0);
  const active = assets.filter(a => a.status === "Active").length;
  const underMaint = assets.filter(a => a.status === "Under Maintenance").length;
  const critical = assets.filter(a => a.condition === "Critical" || a.condition === "Poor").length;

  const handleRegister = (asset: StoredAsset) => {
    add(asset);
    pushSeniorAlert(`New asset registered: ${asset.name}`, "info", { from: user?.name, fromRole: user?.role, category: "action", ref: asset.id });
    setShowRegister(false);
  };

  return (
    <AppShell>
      {/* ── Page Context Bar ─────────────────────────────────────────── */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Enterprise Asset Management"
        process={tab}
        financialYear="FY2026"
        pageType={tab === "Overview" || tab === "AI Agents" ? "dashboard" : "workbench"}
      />

      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Enterprise Asset Management</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Asset Management"
          description="Full asset lifecycle management: Plan → Procure → Receive → Register → Deploy → Operate → Maintain → Inspect → Transfer → Retire → Dispose → Audit → Analyze."
          actions={
            <button onClick={() => setShowRegister(true)}
              className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
              <Plus className="h-4 w-4" /> Register Asset
            </button>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Assets" value={assets.length.toString()} delta={`+${assets.filter(a => { const d = new Date(a.createdAt); return (Date.now() - d.getTime()) < 30 * 24 * 60 * 60 * 1000; }).length} this month`} icon={Package} color="blue" />
          <KpiCard label="Active Assets" value={active.toString()} delta={`${assets.length > 0 ? Math.round(active / assets.length * 100) : 0}% utilised`} icon={CheckCircle2} color="green" />
          <KpiCard label="Under Maintenance" value={underMaint.toString()} delta="Scheduled & corrective" positive={false} icon={Wrench} color="amber" />
          <KpiCard label="Critical / Poor Condition" value={critical.toString()} delta="Requires immediate action" positive={false} icon={AlertTriangle} color="red" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Asset Value" value={`USD ${(totalValue / 1e6).toFixed(1)}M`} delta="Book value (current)" icon={QrCode} color="violet" />
          <KpiCard label="Idle Assets" value={assets.filter(a => a.status === "Idle").length.toString()} delta="Awaiting redeployment" positive={false} icon={Clock} color="orange" />
          <KpiCard label="In Transfer" value={assets.filter(a => a.status === "In Transfer").length.toString()} delta="Pending completion" icon={RefreshCw} color="cyan" />
          <KpiCard label="Disposed / Retired" value={assets.filter(a => a.status === "Disposed").length.toString()} delta="YTD" icon={Tag} color="red" />
        </div>

        <div className="flex gap-1 mb-6 border-b border-black/10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"
              }`}>{t}</button>
          ))}
        </div>

        {tab === "Overview" && <OverviewTab assets={assets} />}
        {tab === "Asset Register" && <AssetRegisterTab assets={assets} onUpdate={update} />}
        {tab === "Deployment" && <DeploymentTab assets={assets} />}
        {tab === "Transfers" && <TransfersTab assets={assets} />}
        {tab === "Inspections" && <InspectionsTab assets={assets} />}
        {tab === "Lifecycle Tower" && (
          <LifecycleTower
            title="Asset Lifecycle Tower — 12 Stages"
            subtitle="From planning through acquisition, operation, maintenance, disposal, and register closure."
            stages={ASSET_STAGES}
            context="Asset Management"
            badgeLabel="12 Stages · Full Asset Lifecycle"
          />
        )}
        {tab === "AI Agents" && <AIAgentsTab />}
      </div>

      {showRegister && <RegisterAssetModal onClose={() => setShowRegister(false)} onSave={handleRegister} />}

      <AIAssistantPanel
        agentName="Chief Asset Intelligence Agent"
        agentRole="Enterprise Asset Management AI — lifecycle optimization, predictive maintenance, and strategic replacement planning"
        context="asset management and lifecycle optimization"
        color="emerald"
        suggestedPrompts={[
          "Which assets are due for maintenance this month?",
          "Identify underutilized assets for redeployment",
          "Show assets at risk of failure",
          "Recommend assets for disposal",
          "Forecast replacement capital requirements",
        ]}
      />
    </AppShell>
  );
}
