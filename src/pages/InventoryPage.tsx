import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { FeatureGrid } from "@/components/ModulePage";
import { useInventoryItems, useInventoryReceipts, useInventoryRequests, useStockAdjustments, useStockCounts } from "@/hooks/use-store";
import { useAuth } from "@/lib/auth-context";
import { pushSeniorAlert, pushNotification } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import type { StoredInventoryItem, StoredInventoryRequest } from "@/lib/local-store";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import InlineWorkbench from "@/components/InlineWorkbench";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";
import {
  Boxes, Plus, Search, Download, Eye, AlertTriangle, CheckCircle2, Clock,
  Package, Tag, ArrowRight, RefreshCcw, Warehouse, PackageCheck, ScanLine,
  TrendingUp, TrendingDown, Truck, ClipboardList, Filter,
} from "lucide-react";

const TABS = ["Dashboard", "Item Master", "Stock Levels", "Receiving", "Issue Requests", "Warehouse", "Stock Count", "Reconciliation", "AI Agents"] as const;
type Tab = typeof TABS[number];

const CLASSIFICATION_COLORS: Record<string, string> = {
  "Fast-Moving": "text-[#0F172A]", "Slow-Moving": "text-[#0F172A]",
  "Critical": "text-red-600", "High-Value": "text-[#0F172A]",
  "Hazardous": "text-[#0F172A]", "Consumable": "text-[#0F172A]", "Asset": "text-gray-600",
};

const STATUS_BADGE: Record<string, "blue" | "green" | "amber" | "red" | "muted"> = {
  Active: "green", Inactive: "muted", Discontinued: "red", "On Hold": "amber",
};

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#84CC16", "#F97316"];

// ── Add Item Modal ────────────────────────────────────────────────────────────
function AddItemModal({ onClose, onSave }: { onClose: () => void; onSave: (i: StoredInventoryItem) => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "", sku: "", description: "", category: "", classification: "Fast-Moving" as StoredInventoryItem["classification"],
    unitOfMeasure: "Unit", alternativeUnits: "", barcode: "",
    minStockLevel: "10", maxStockLevel: "100", reorderPoint: "20", safetyStock: "5",
    unitCost: "", supplierName: "", leadTimeDays: "14",
    warehouse: "", location: "", bin: "", notes: "",
  });

  const save = () => {
    if (!form.name.trim()) { toast("Item name is required.", "error"); return; }
    const id = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;
    const sku = form.sku.trim() || `SKU-${String(Date.now()).slice(-6)}`;
    onSave({
      id, sku,
      name: form.name, description: form.description, category: form.category,
      classification: form.classification, unitOfMeasure: form.unitOfMeasure,
      alternativeUnits: form.alternativeUnits,
      barcode: form.barcode || `BC-${id}`,
      minStockLevel: Number(form.minStockLevel),
      maxStockLevel: Number(form.maxStockLevel),
      reorderPoint: Number(form.reorderPoint),
      safetyStock: Number(form.safetyStock),
      currentStock: 0, reservedStock: 0, availableStock: 0,
      damagedStock: 0, expiredStock: 0, quarantineStock: 0,
      unitCost: form.unitCost,
      leadTimeDays: Number(form.leadTimeDays),
      totalValue: "USD 0", supplierId: "",
      supplierName: form.supplierName,
      location: form.location, warehouse: form.warehouse, bin: form.bin,
      notes: form.notes,
      expiryDate: "", lastReceivedDate: "", lastIssuedDate: "",
      status: "Active", photos: [],
      createdBy: user?.name ?? "System", createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <h2 className="text-base font-semibold">Add Inventory Item</h2>
          <button onClick={onClose} className="text-black/30 hover:text-black text-xl leading-none">×</button>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Item Name *", key: "name" }, { label: "SKU Code", key: "sku" },
            { label: "Category", key: "category" }, { label: "Unit of Measure", key: "unitOfMeasure" },
            { label: "Alternative Units", key: "alternativeUnits" }, { label: "Barcode", key: "barcode" },
            { label: "Min Stock Level", key: "minStockLevel" }, { label: "Max Stock Level", key: "maxStockLevel" },
            { label: "Reorder Point", key: "reorderPoint" }, { label: "Safety Stock", key: "safetyStock" },
            { label: "Unit Cost (USD)", key: "unitCost" }, { label: "Supplier Name", key: "supplierName" },
            { label: "Lead Time (Days)", key: "leadTimeDays" }, { label: "Warehouse", key: "warehouse" },
            { label: "Location", key: "location" }, { label: "Bin", key: "bin" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-black/60 mb-1">{label}</label>
              <input value={(form as Record<string,string>)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-black/60 mb-1">Classification</label>
            <select value={form.classification} onChange={e => setForm(f => ({ ...f, classification: e.target.value as StoredInventoryItem["classification"] }))}
              className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm bg-white focus:outline-none">
              {["Fast-Moving","Slow-Moving","Critical","High-Value","Hazardous","Consumable","Asset"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-black/60 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-black/60 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-black/10">
          <button onClick={onClose} className="h-9 px-4 rounded-xl border border-black/10 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={save} className="h-9 px-4 rounded-xl bg-black text-white text-sm hover:bg-gray-800 transition-colors">Add Item</button>
        </div>
      </div>
    </div>
  );
}

// ── Issue Request Modal ───────────────────────────────────────────────────────
function IssueRequestModal({ items, onClose, onSave }: {
  items: StoredInventoryItem[];
  onClose: () => void;
  onSave: (r: StoredInventoryRequest) => void;
}) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    itemId: items[0]?.id ?? "", quantity: "1",
    purpose: "", priority: "Medium" as StoredInventoryRequest["priority"], notes: "",
  });
  const selectedItem = items.find(i => i.id === form.itemId);

  const save = () => {
    if (!form.itemId || Number(form.quantity) < 1) { toast("Select item and enter a valid quantity.", "error"); return; }
    const id = `IRQ-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    onSave({
      id, itemId: form.itemId, itemName: selectedItem?.name ?? "",
      requestedBy: user?.name ?? "System",
      requestingDepartment: user?.department ?? "",
      quantityRequested: Number(form.quantity), quantityIssued: 0,
      purpose: form.purpose, priority: form.priority,
      status: "Pending", approvedBy: "", approvedAt: "",
      issuedBy: "", issuedAt: "",
      requestedAt: new Date().toISOString(), notes: form.notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <h2 className="text-base font-semibold">New Issue Request</h2>
          <button onClick={onClose} className="text-black/30 hover:text-black text-xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-black/60 mb-1">Select Item</label>
            <select value={form.itemId} onChange={e => setForm(f => ({ ...f, itemId: e.target.value }))}
              className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm bg-white focus:outline-none">
              {items.map(i => <option key={i.id} value={i.id}>{i.name} (Avail: {i.availableStock} {i.unitOfMeasure})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-black/60 mb-1">Quantity</label>
              <input type="number" min="1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-black/60 mb-1">Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as StoredInventoryRequest["priority"] }))}
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm bg-white focus:outline-none">
                {["Low","Medium","High","Urgent"].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-black/60 mb-1">Purpose</label>
            <input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
              className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-black/60 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-black/10">
          <button onClick={onClose} className="h-9 px-4 rounded-xl border border-black/10 text-sm hover:bg-gray-50">Cancel</button>
          <button onClick={save} className="h-9 px-4 rounded-xl bg-black text-white text-sm hover:bg-gray-800">Submit Request</button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard Tab ─────────────────────────────────────────────────────────────
function DashboardTab({ items, receipts, requests }: {
  items: StoredInventoryItem[];
  receipts: ReturnType<typeof useInventoryReceipts>["receipts"];
  requests: ReturnType<typeof useInventoryRequests>["requests"];
}) {
  const byCategory = items.reduce((acc, i) => { acc[i.category] = (acc[i.category] || 0) + 1; return acc; }, {} as Record<string,number>);
  const categoryData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

  const byClassification = items.reduce((acc, i) => { acc[i.classification] = (acc[i.classification] || 0) + 1; return acc; }, {} as Record<string,number>);
  const classData = Object.entries(byClassification).map(([name, value]) => ({ name, value }));

  const stockTrendData = [
    { month: "Jan", received: 240, issued: 180 }, { month: "Feb", received: 310, issued: 220 },
    { month: "Mar", received: 280, issued: 260 }, { month: "Apr", received: 350, issued: 290 },
    { month: "May", received: 420, issued: 380 }, { month: "Jun", received: 390, issued: 340 },
  ];

  const belowMin = items.filter(i => i.currentStock <= i.minStockLevel);
  const nearReorder = items.filter(i => i.currentStock <= i.reorderPoint && i.currentStock > i.minStockLevel);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Stock Movement Trend" subtitle="Monthly receipts vs issues (YTD)" action={<Badge tone="blue">Live</Badge>} />
          <div className="p-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockTrendData}>
                <defs>
                  <linearGradient id="recv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="iss" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} /><stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" stroke="#aaa" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#aaa" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #eee", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="received" stroke="#3B82F6" strokeWidth={2.5} fill="url(#recv)" name="Received" />
                <Area type="monotone" dataKey="issued" stroke="#10B981" strokeWidth={2} fill="url(#iss)" name="Issued" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Inventory by Classification" subtitle="Item distribution" />
          <div className="p-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={classData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} dataKey="value" paddingAngle={2}>
                  {classData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "white", border: "1px solid #eee", borderRadius: 8, fontSize: 12 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Items by Category" subtitle="Top categories" />
          <div className="p-4 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData.slice(0,6)} layout="vertical">
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={110} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" fill="#3B82F6" radius={[0,3,3,0]} name="Items" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Critical Stock Alerts" subtitle={`${belowMin.length} items below minimum`}
            action={belowMin.length > 0 ? <Badge tone="red">{belowMin.length} Critical</Badge> : undefined} />
          <div className="divide-y divide-border max-h-[200px] overflow-y-auto">
            {belowMin.length === 0 && <div className="px-5 py-6 text-center text-sm text-black/40">No critical stock alerts.</div>}
            {belowMin.map(i => (
              <div key={i.id} className="px-4 py-2.5">
                <div className="text-sm font-medium text-black truncate">{i.name}</div>
                <div className="flex items-center gap-3 text-[11px] mt-0.5">
                  <span className="text-red-600 font-semibold flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Stock: {i.currentStock} {i.unitOfMeasure}</span>
                  <span className="text-black/40">Min: {i.minStockLevel}</span>
                  <span className="text-black/40">Reorder: {i.reorderPoint}</span>
                </div>
              </div>
            ))}
            {nearReorder.map(i => (
              <div key={i.id} className="px-4 py-2.5">
                <div className="text-sm font-medium text-black truncate">{i.name}</div>
                <div className="flex items-center gap-3 text-[11px] mt-0.5">
                  <span className="text-[#0F172A] font-semibold flex items-center gap-1"><Clock className="h-3 w-3" /> Stock: {i.currentStock} {i.unitOfMeasure}</span>
                  <span className="text-black/40">Near reorder point ({i.reorderPoint})</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <h2 className="text-sm font-semibold mt-2">Inventory Management Capabilities</h2>
      <FeatureGrid features={[
        { title: "Demand Planning & Forecasting", desc: "AI-driven demand prediction using historical consumption, seasonality patterns, and planned activities to pre-position stock." },
        { title: "Supplier Integration", desc: "Automated PO generation for replenishment, supplier performance tracking, lead time analysis, and delivery prediction." },
        { title: "Goods Receiving & GRN", desc: "Barcode-scanned receiving, PO matching, quantity verification, document capture, batch recording, and exception management." },
        { title: "Quality Inspection", desc: "Inspection checklists, pass/fail/quarantine workflows, defect tracking, supplier quality scoring, and AI visual inspection." },
        { title: "Warehouse Location Management", desc: "Zone/shelf/bin configuration, capacity management, temperature and hazmat zones, and put-away optimization." },
        { title: "Real-Time Stock Control", desc: "Live stock balances — available, reserved, damaged, expired, quarantine — with automatic reorder alerts and shortage prevention." },
        { title: "Internal Issue Management", desc: "Department requests, approval workflows, stock reservation, picking, issue notes, and consumption tracking." },
        { title: "Inventory Valuation", desc: "FIFO and weighted average costing, inventory valuation reports, write-offs, holding cost analysis, and finance integration." },
        { title: "Stock Take & Reconciliation", desc: "Cycle counts, full stock takes, mobile blind counting, variance analysis, adjustment workflows, and fraud detection." },
        { title: "Returns Management", desc: "Return request workflows, inspection, restocking, supplier return processing, and recovery value tracking." },
        { title: "Asset & Equipment Tracking", desc: "Asset tagging, location tracking, maintenance schedules, usage history, and IoT sensor integration." },
        { title: "Compliance & Audit Trail", desc: "Immutable audit logs, user activity tracking, approval history, compliance reports, and continuous monitoring." },
      ]} />
    </div>
  );
}

// ── Item Master Tab ───────────────────────────────────────────────────────────
function ItemMasterTab({ items, onUpdate }: { items: StoredInventoryItem[]; onUpdate: (id: string, patch: Partial<StoredInventoryItem>) => void }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const categories = [...new Set(items.map(i => i.category))];
  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return (!q || i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))
      && (filterCat === "All" || i.category === filterCat)
      && (filterStatus === "All" || i.status === filterStatus);
  });

  const exportCSV = () => {
    const rows = ["ID,SKU,Name,Category,Classification,Status,Current Stock,Min,Max,Unit Cost,Warehouse,Supplier",
      ...filtered.map(i => `${i.id},${i.sku},"${i.name}","${i.category}","${i.classification}",${i.status},${i.currentStock},${i.minStockLevel},${i.maxStockLevel},"${i.unitCost}","${i.warehouse}","${i.supplierName}"`)
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "item-master.csv"; a.click(); URL.revokeObjectURL(url);
    pushNotification("Item master exported to CSV", "success");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items, SKU…"
            className="w-full h-9 pl-8 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="h-9 px-3 rounded-xl border border-black/10 text-sm bg-white focus:outline-none">
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-9 px-3 rounded-xl border border-black/10 text-sm bg-white focus:outline-none">
          {["All","Active","Inactive","Discontinued","On Hold"].map(s => <option key={s}>{s}</option>)}
        </select>
        <button onClick={exportCSV} className="h-9 px-3 rounded-xl border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
          <Download className="h-3.5 w-3.5" /> Export
        </button>
      </div>
      <Card>
        <CardHeader title="Item Master Register" subtitle={`${filtered.length} of ${items.length} items`} />
        <div className="divide-y divide-border">
          {filtered.length === 0 && <div className="px-5 py-8 text-center text-sm text-black/40">No items match your filters.</div>}
          {filtered.map(i => (
            <div key={i.id} className="px-4 sm:px-5 py-3 hover:bg-secondary/40">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{i.name}</div>
                  <div className="text-[11px] text-black/50 font-mono mt-0.5">{i.id} · SKU: {i.sku}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[11px] font-medium ${CLASSIFICATION_COLORS[i.classification] ?? "text-gray-600"}`}>{i.classification}</span>
                  <Badge tone={STATUS_BADGE[i.status] ?? "muted"}>{i.status}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] text-black/50 mb-2">
                <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{i.category}</span>
                <span className="flex items-center gap-1"><Warehouse className="h-3 w-3" />{i.warehouse}</span>
                <span className="flex items-center gap-1"><Package className="h-3 w-3" />Stock: {i.currentStock} {i.unitOfMeasure}</span>
                <span className="flex items-center gap-1"><Truck className="h-3 w-3" />{i.supplierName}</span>
                {i.currentStock <= i.minStockLevel && <span className="text-red-600 font-semibold flex items-center gap-1"><AlertTriangle className="h-3 w-3" />BELOW MIN</span>}
                {i.currentStock <= i.reorderPoint && i.currentStock > i.minStockLevel && <span className="text-[#0F172A] font-semibold flex items-center gap-1"><Clock className="h-3 w-3" />NEAR REORDER</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => toast(`${i.name} | ${i.id} | ${i.category} | Stock: ${i.currentStock} ${i.unitOfMeasure} (avail: ${i.availableStock}) | Min: ${i.minStockLevel} | Reorder: ${i.reorderPoint} | ${i.unitCost} | ${i.warehouse} — ${i.location}`, "info")}
                  className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1 transition-colors">
                  <Eye className="h-3 w-3" /> View
                </button>
                <button onClick={() => { onUpdate(i.id, { status: i.status === "Active" ? "Inactive" : "Active" }); pushNotification(`${i.name} status toggled`, "info"); }}
                  className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1 transition-colors">
                  <RefreshCcw className="h-3 w-3" /> Toggle Status
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Stock Levels Tab ──────────────────────────────────────────────────────────
function StockLevelsTab({ items }: { items: StoredInventoryItem[] }) {
  const [search, setSearch] = useState("");
  const filtered = items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));
  const totalValue = items.reduce((s, i) => s + (parseFloat(i.totalValue.replace(/[^0-9.]/g,"")) || 0), 0);
  const belowMin = items.filter(i => i.currentStock <= i.minStockLevel).length;
  const aboveMax = items.filter(i => i.currentStock > i.maxStockLevel).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-black/8 rounded-2xl p-4">
          <div className="text-xs text-black/50 font-medium">Total Inventory Value</div>
          <div className="text-xl font-bold mt-1">USD {(totalValue/1000).toFixed(1)}K</div>
          <div className="text-xs text-[#0F172A] mt-1">▲ Book value (all items)</div>
        </div>
        <div className="bg-white border border-black/8 rounded-2xl p-4">
          <div className="text-xs text-black/50 font-medium">Items Below Minimum</div>
          <div className="text-xl font-bold mt-1 text-red-600">{belowMin}</div>
          <div className="text-xs text-red-500 mt-1">▼ Requires immediate replenishment</div>
        </div>
        <div className="bg-white border border-black/8 rounded-2xl p-4">
          <div className="text-xs text-black/50 font-medium">Overstock Items</div>
          <div className="text-xl font-bold mt-1 text-[#0F172A]">{aboveMax}</div>
          <div className="text-xs text-slate-600 mt-1">▼ Above maximum stock level</div>
        </div>
        <div className="bg-white border border-black/8 rounded-2xl p-4">
          <div className="text-xs text-black/50 font-medium">Active SKUs</div>
          <div className="text-xl font-bold mt-1">{items.filter(i => i.status === "Active").length}</div>
          <div className="text-xs text-[#0F172A] mt-1">▲ In active use</div>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stock levels…"
          className="w-full h-9 pl-8 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 bg-white" />
      </div>
      <Card>
        <CardHeader title="Real-Time Stock Balance" subtitle="Live availability, reservations, and stock positions" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["Item","SKU","Available","Reserved","Damaged","Quarantine","Min","Reorder","Max","Value","Status"].map(h =>
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map(i => {
                const pct = i.maxStockLevel > 0 ? Math.min(100, Math.round(i.currentStock / i.maxStockLevel * 100)) : 0;
                const barColor = i.currentStock <= i.minStockLevel ? "bg-red-500" : i.currentStock <= i.reorderPoint ? "bg-[#0F172A]" : "bg-[#0F172A]";
                return (
                  <tr key={i.id} className="hover:bg-[#EAF1F8]/50">
                    <td className="px-4 py-3 font-medium text-black max-w-[160px]">
                      <div className="truncate">{i.name}</div>
                      <div className="h-1.5 mt-1 rounded-full bg-gray-100 w-24 overflow-hidden">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] font-mono text-black/50">{i.sku}</td>
                    <td className="px-4 py-3 font-semibold text-[#0F172A]">{i.availableStock}</td>
                    <td className="px-4 py-3 text-black/60">{i.reservedStock}</td>
                    <td className="px-4 py-3 text-red-600">{i.damagedStock || "—"}</td>
                    <td className="px-4 py-3 text-[#0F172A]">{i.quarantineStock || "—"}</td>
                    <td className="px-4 py-3 text-black/50">{i.minStockLevel}</td>
                    <td className="px-4 py-3 text-black/50">{i.reorderPoint}</td>
                    <td className="px-4 py-3 text-black/50">{i.maxStockLevel}</td>
                    <td className="px-4 py-3 text-black/70 whitespace-nowrap">{i.totalValue}</td>
                    <td className="px-4 py-3">
                      {i.currentStock <= i.minStockLevel
                        ? <Badge tone="red">Critical</Badge>
                        : i.currentStock <= i.reorderPoint
                        ? <Badge tone="amber">Reorder</Badge>
                        : i.currentStock > i.maxStockLevel
                        ? <Badge tone="violet">Overstock</Badge>
                        : <Badge tone="green">OK</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Receiving Tab ─────────────────────────────────────────────────────────────
function ReceivingTab({ receipts }: { receipts: ReturnType<typeof useInventoryReceipts>["receipts"] }) {
  const passRate = receipts.length > 0 ? Math.round(receipts.filter(r => r.qualityStatus === "Passed").length / receipts.length * 100) : 0;

  const qStatusBadge: Record<string, "green" | "amber" | "red" | "blue"> = {
    Passed: "green", Pending: "amber", Failed: "red", Quarantine: "blue",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="GRNs Processed" value={receipts.length.toString()} delta="All time" icon={PackageCheck} color="blue" />
        <KpiCard label="Quality Pass Rate" value={`${passRate}%`} delta="vs target 95%" icon={CheckCircle2} color="green" />
        <KpiCard label="In Quarantine" value={receipts.filter(r => r.qualityStatus === "Quarantine").length.toString()} delta="Pending inspection" positive={false} icon={AlertTriangle} color="amber" />
        <KpiCard label="Total Value Received" value={`USD ${receipts.reduce((s,r) => s + (parseFloat(r.totalValue.replace(/[^0-9.]/g,"")) || 0), 0).toLocaleString()}`} delta="All receipts" icon={TrendingUp} color="violet" />
      </div>
      <Card>
        <CardHeader title="Goods Receipt Notes (GRN)" subtitle={`${receipts.length} receipts`} />
        <div className="divide-y divide-border">
          {receipts.length === 0 && <div className="px-5 py-8 text-center text-sm text-black/40">No receiving records yet.</div>}
          {receipts.map(r => (
            <div key={r.id} className="px-4 sm:px-5 py-3 hover:bg-secondary/40">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{r.itemName}</div>
                  <div className="text-[11px] text-black/50 font-mono mt-0.5">{r.id} · PO: {r.poReference} · Supplier: {r.supplierName}</div>
                </div>
                <Badge tone={qStatusBadge[r.qualityStatus] ?? "muted"}>{r.qualityStatus}</Badge>
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] text-black/50 mb-2">
                <span>Ordered: {r.quantityOrdered}</span>
                <span className="text-[#0F172A] font-semibold">Accepted: {r.quantityAccepted}</span>
                {r.quantityRejected > 0 && <span className="text-red-600 font-semibold">Rejected: {r.quantityRejected}</span>}
                <span>Value: {r.totalValue}</span>
                {r.batchNumber && r.batchNumber !== "N/A" && <span>Batch: {r.batchNumber}</span>}
                <span>Received: {r.receivedAt?.split("T")[0] ?? r.receivedAt}</span>
              </div>
              {r.notes && <div className="text-[11px] text-black/40 italic">{r.notes}</div>}
            </div>
          ))}
        </div>
      </Card>
      <h2 className="text-sm font-semibold">Receiving Process Capabilities</h2>
      <FeatureGrid features={[
        { title: "Barcode & QR Scanning", desc: "Mobile barcode scanning validates items against PO line items in real time, flagging mismatches instantly." },
        { title: "PO Matching & Verification", desc: "Automated 3-way matching: PO, delivery note, and physical count to detect quantity and specification discrepancies." },
        { title: "OCR Document Processing", desc: "AI reads supplier invoices and delivery notes to auto-populate GRN fields and extract key data." },
        { title: "Quality Inspection Integration", desc: "Immediate linkage to quality inspection workflow — quarantine suspicious items without disrupting receiving flow." },
        { title: "Batch & Expiry Recording", desc: "Capture batch numbers, lot codes, manufacturing dates, and expiry dates for full traceability." },
        { title: "Exception Management", desc: "Automated alerts for quantity shortfalls, specification deviations, and damaged goods with supplier notification." },
      ]} />
    </div>
  );
}

// ── Issue Requests Tab ────────────────────────────────────────────────────────
function IssueRequestsTab({ requests, onUpdate }: {
  requests: ReturnType<typeof useInventoryRequests>["requests"];
  onUpdate: (id: string, patch: Partial<StoredInventoryRequest>) => void;
}) {
  const { user } = useAuth();
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? requests : requests.filter(r => r.status === filter);

  const reqStatusBadge: Record<string, "blue" | "green" | "amber" | "red" | "muted"> = {
    Pending: "amber", Approved: "blue", "Partially Issued": "blue", Issued: "green", Rejected: "red", Cancelled: "muted",
  };

  const priorityBadge: Record<string, "red" | "amber" | "blue" | "muted"> = {
    Urgent: "red", High: "amber", Medium: "blue", Low: "muted",
  };

  const approve = (r: StoredInventoryRequest) => {
    onUpdate(r.id, { status: "Approved", approvedBy: user?.name ?? "System", approvedAt: new Date().toISOString() });
    pushSeniorAlert(`Issue request approved: ${r.itemName} × ${r.quantityRequested} — ${r.requestingDepartment}`, "success", { from: user?.name, fromRole: user?.role, category: "action" });
  };

  const issue = (r: StoredInventoryRequest) => {
    onUpdate(r.id, { status: "Issued", quantityIssued: r.quantityRequested, issuedBy: user?.name ?? "System", issuedAt: new Date().toISOString() });
    pushSeniorAlert(`Stock issued: ${r.itemName} × ${r.quantityRequested} → ${r.requestingDepartment}`, "success", { from: user?.name, fromRole: user?.role, category: "action" });
  };

  const reject = (r: StoredInventoryRequest) => {
    onUpdate(r.id, { status: "Rejected", approvedBy: user?.name ?? "System", approvedAt: new Date().toISOString() });
    pushNotification(`Request rejected: ${r.itemName}`, "warning");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Pending Approval" value={requests.filter(r => r.status === "Pending").length.toString()} delta="Awaiting action" positive={false} icon={ClipboardList} color="amber" />
        <KpiCard label="Approved" value={requests.filter(r => r.status === "Approved").length.toString()} delta="Ready for issuing" icon={CheckCircle2} color="blue" />
        <KpiCard label="Issued Today" value={requests.filter(r => r.status === "Issued").length.toString()} delta="Fulfilled" icon={PackageCheck} color="green" />
        <KpiCard label="Urgent Requests" value={requests.filter(r => r.priority === "Urgent" && r.status !== "Issued").length.toString()} delta="High priority" positive={false} icon={AlertTriangle} color="red" />
      </div>
      <div className="flex gap-2 flex-wrap">
        {["All","Pending","Approved","Issued","Rejected"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`h-8 px-3 rounded-xl text-xs font-medium transition-colors ${filter === s ? "bg-black text-white" : "bg-white border border-black/10 text-black/60 hover:text-black"}`}>{s}</button>
        ))}
      </div>
      <Card>
        <CardHeader title="Issue Requests" subtitle={`${filtered.length} requests`} />
        <div className="divide-y divide-border">
          {filtered.length === 0 && <div className="px-5 py-8 text-center text-sm text-black/40">No requests in this status.</div>}
          {filtered.map(r => (
            <div key={r.id} className="px-4 sm:px-5 py-3 hover:bg-secondary/40">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{r.itemName}</div>
                  <div className="text-[11px] text-black/50 font-mono mt-0.5">{r.id} · {r.requestingDepartment} · Qty: {r.quantityRequested}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge tone={priorityBadge[r.priority] ?? "muted"}>{r.priority}</Badge>
                  <Badge tone={reqStatusBadge[r.status] ?? "muted"}>{r.status}</Badge>
                </div>
              </div>
              <div className="text-[11px] text-black/50 mb-2">
                Requested by: {r.requestedBy} · {r.purpose}
                {r.approvedBy && ` · Approved by: ${r.approvedBy}`}
              </div>
              <div className="flex gap-2 flex-wrap">
                {r.status === "Pending" && <>
                  <button onClick={() => approve(r)} className="h-7 px-3 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A] flex items-center gap-1 transition-colors">
                    <CheckCircle2 className="h-3 w-3" /> Approve
                  </button>
                  <button onClick={() => reject(r)} className="h-7 px-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs hover:bg-red-100 flex items-center gap-1 transition-colors">
                    Reject
                  </button>
                </>}
                {r.status === "Approved" && (
                  <button onClick={() => issue(r)} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1 transition-colors">
                    <PackageCheck className="h-3 w-3" /> Issue Stock
                  </button>
                )}
                {r.status === "Issued" && <span className="text-[11px] text-[#0F172A] font-semibold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Issued by {r.issuedBy}</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Warehouse Tab ─────────────────────────────────────────────────────────────
function WarehouseTab({ items }: { items: StoredInventoryItem[] }) {
  const warehouses = [...new Set(items.map(i => i.warehouse).filter(Boolean))];
  const warehouseData = warehouses.map(w => {
    const wItems = items.filter(i => i.warehouse === w);
    return { name: w, items: wItems.length, value: wItems.reduce((s,i) => s + (parseFloat(i.totalValue.replace(/[^0-9.]/g,"")) || 0), 0) };
  });

  const hazardous = items.filter(i => i.classification === "Hazardous");
  const critical = items.filter(i => i.classification === "Critical");

  const zones = [
    { name: "General Storage (Zone A)", capacity: 500, used: 312, type: "General", color: "bg-[#0F172A]" },
    { name: "Cold Chain (Zone B)", capacity: 100, used: 67, type: "Pharmaceutical", color: "bg-[#0F172A]" },
    { name: "Hazmat Store (Zone H)", capacity: 80, used: 34, type: "Hazardous", color: "bg-[#0F172A]" },
    { name: "High-Value Cage (Zone C)", capacity: 50, used: 18, type: "Secured", color: "bg-[#0F172A]" },
    { name: "Bulk Storage (Zone D)", capacity: 2000, used: 1248, type: "Bulk/Heavy", color: "bg-[#0F172A]" },
    { name: "Fuel Depot (Zone F)", capacity: 50000, used: 22400, type: "Fuel", color: "bg-[#0F172A]" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Warehouse Inventory Value" subtitle="Stock value by location" />
          <div className="p-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseData} layout="vertical">
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} width={130} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`USD ${v.toLocaleString()}`, "Value"]} />
                <Bar dataKey="value" fill="#3B82F6" radius={[0,3,3,0]} name="Value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Zone Capacity Utilization" subtitle="Occupancy by storage zone" />
          <div className="p-4 space-y-3">
            {zones.map(z => {
              const pct = Math.round(z.used / z.capacity * 100);
              return (
                <div key={z.name}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-medium text-black">{z.name}</span>
                    <span className="text-xs font-bold text-black">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full ${z.color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] text-black/40 mt-0.5">{z.type} · {z.used.toLocaleString()} / {z.capacity.toLocaleString()} units</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Hazardous Materials" subtitle={`${hazardous.length} hazmat items`}
            action={<Badge tone="amber">{hazardous.length} Items</Badge>} />
          <div className="divide-y divide-border">
            {hazardous.length === 0 && <div className="px-5 py-4 text-center text-sm text-black/40">No hazardous items.</div>}
            {hazardous.map(i => (
              <div key={i.id} className="px-4 py-3">
                <div className="text-sm font-medium">{i.name}</div>
                <div className="text-[11px] text-black/50 mt-0.5">{i.warehouse} — {i.bin} · Stock: {i.currentStock} {i.unitOfMeasure}</div>
                <div className="text-[11px] text-[#0F172A] font-medium mt-0.5">⚠ HAZMAT — {i.notes}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Critical Items Storage" subtitle={`${critical.length} critical items in stock`}
            action={<Badge tone="red">{critical.length} Critical</Badge>} />
          <div className="divide-y divide-border">
            {critical.length === 0 && <div className="px-5 py-4 text-center text-sm text-black/40">No critical items.</div>}
            {critical.map(i => (
              <div key={i.id} className="px-4 py-3">
                <div className="text-sm font-medium">{i.name}</div>
                <div className="text-[11px] text-black/50 mt-0.5">{i.warehouse} — {i.bin} · Stock: {i.currentStock} {i.unitOfMeasure}</div>
                {i.currentStock <= i.reorderPoint && (
                  <div className="text-[11px] text-red-600 font-medium mt-0.5 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Stock approaching reorder level</div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <h2 className="text-sm font-semibold">Warehouse Management Capabilities</h2>
      <FeatureGrid features={[
        { title: "Zone & Location Setup", desc: "Configure warehouses, zones, aisles, shelves, and bins with capacity, temperature, and safety classification." },
        { title: "Put-Away Optimization", desc: "AI recommends optimal storage locations for incoming stock based on velocity, classification, and available space." },
        { title: "Space Utilization AI", desc: "Real-time capacity tracking with heat map visualization and automatic congestion prediction." },
        { title: "Mobile Scanning", desc: "Warehouse staff use mobile devices for barcode scanning of receiving, put-away, picking, and counting operations." },
        { title: "Temperature Zone Monitoring", desc: "IoT sensor integration monitors temperature-sensitive zones (pharmaceuticals, biologicals) with automatic alerts." },
        { title: "Warehouse Task Management", desc: "Digital task assignment, shift planning, worker productivity monitoring, and equipment tracking." },
      ]} />
    </div>
  );
}

// ── Stock Count Tab ───────────────────────────────────────────────────────────
function StockCountTab({ counts, onUpdate }: {
  counts: ReturnType<typeof useStockCounts>["counts"];
  onUpdate: (id: string, patch: Partial<ReturnType<typeof useStockCounts>["counts"][number]>) => void;
}) {
  const { user } = useAuth();
  const countStatusBadge: Record<string, "blue" | "green" | "amber" | "muted"> = {
    Scheduled: "amber", "In Progress": "blue", Completed: "green", Cancelled: "muted",
  };

  const startCount = (id: string) => {
    onUpdate(id, { status: "In Progress" });
    pushNotification(`Stock count started: ${id}`, "info");
  };

  const completeCount = (id: string) => {
    onUpdate(id, { status: "Completed", completedDate: new Date().toISOString().split("T")[0], countedBy: user?.name ?? "System", accuracyRate: 97.8, variances: 1 });
    pushSeniorAlert(`Stock count completed: ${id}`, "success", { from: user?.name, fromRole: user?.role, category: "action" });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Count Events" value={counts.length.toString()} delta="All time" icon={ScanLine} color="blue" />
        <KpiCard label="Completed Counts" value={counts.filter(c => c.status === "Completed").length.toString()} delta="Verified" icon={CheckCircle2} color="green" />
        <KpiCard label="Scheduled" value={counts.filter(c => c.status === "Scheduled").length.toString()} delta="Upcoming" icon={Clock} color="amber" />
        <KpiCard label="Avg Accuracy" value={counts.filter(c => c.accuracyRate > 0).length > 0 ? `${(counts.filter(c => c.accuracyRate > 0).reduce((s,c) => s + c.accuracyRate, 0) / counts.filter(c => c.accuracyRate > 0).length).toFixed(1)}%` : "N/A"} delta="vs target 99%" icon={TrendingUp} color="violet" />
      </div>
      <Card>
        <CardHeader title="Stock Count Schedule & History" subtitle={`${counts.length} count events`} />
        <div className="divide-y divide-border">
          {counts.length === 0 && <div className="px-5 py-8 text-center text-sm text-black/40">No stock counts scheduled.</div>}
          {counts.map(c => (
            <div key={c.id} className="px-4 sm:px-5 py-3 hover:bg-secondary/40">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{c.countType}</div>
                  <div className="text-[11px] text-black/50 font-mono mt-0.5">{c.id} · Scheduled: {c.scheduledDate} · Supervised by: {c.supervisedBy}</div>
                </div>
                <Badge tone={countStatusBadge[c.status] ?? "muted"}>{c.status}</Badge>
              </div>
              {c.status === "Completed" && (
                <div className="flex flex-wrap gap-4 text-[11px] mb-2">
                  <span className="text-[#0F172A] font-semibold">✓ Accuracy: {c.accuracyRate}%</span>
                  <span className="text-black/50">Items counted: {c.countedItems}</span>
                  <span className={c.variances > 0 ? "text-[#0F172A] font-semibold" : "text-[#0F172A]"}>Variances: {c.variances}</span>
                  <span className="text-black/40">Completed: {c.completedDate}</span>
                </div>
              )}
              {c.notes && <div className="text-[11px] text-black/40 italic mb-2">{c.notes}</div>}
              <div className="flex gap-2">
                {c.status === "Scheduled" && (
                  <button onClick={() => startCount(c.id)} className="h-7 px-3 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A] flex items-center gap-1 transition-colors">
                    <ScanLine className="h-3 w-3" /> Start Count
                  </button>
                )}
                {c.status === "In Progress" && (
                  <button onClick={() => completeCount(c.id)} className="h-7 px-3 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A] flex items-center gap-1 transition-colors">
                    <CheckCircle2 className="h-3 w-3" /> Mark Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <h2 className="text-sm font-semibold">Stock Count Capabilities</h2>
      <FeatureGrid features={[
        { title: "Cycle Count Scheduling", desc: "AI-generated risk-based cycle count schedules prioritizing high-value, fast-moving, and critical items." },
        { title: "Blind Count Mode", desc: "Staff count without seeing system quantities to ensure objectivity. AI compares results after submission." },
        { title: "Mobile Counting App", desc: "Barcode/QR scanning via mobile devices enables fast, accurate counting with offline capability." },
        { title: "Variance Analysis", desc: "Automatic variance calculation with drill-down investigation tools to identify root causes." },
        { title: "Annual Stock Take", desc: "Full warehouse stock take management with team assignments, progress tracking, and final reconciliation." },
        { title: "Fraud Detection", desc: "AI monitors variance patterns to detect systematic discrepancies that may indicate theft or fraud." },
      ]} />
    </div>
  );
}

// ── Reconciliation Tab ────────────────────────────────────────────────────────
function ReconciliationTab({ adjustments }: { adjustments: ReturnType<typeof useStockAdjustments>["adjustments"] }) {
  const adjTypeBadge: Record<string, "blue" | "green" | "amber" | "red" | "muted" | "violet"> = {
    Received: "green", Issued: "blue", Damaged: "red", Expired: "amber",
    Found: "green", Lost: "red", Transfer: "violet", Return: "amber", "Write-Off": "muted",
  };

  const totalAdjusted = adjustments.reduce((s,a) => s + Math.abs(a.quantityAdjusted), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Adjustments" value={adjustments.length.toString()} delta="All time" icon={RefreshCcw} color="blue" />
        <KpiCard label="Units Adjusted" value={totalAdjusted.toString()} delta="All adjustment types" icon={Package} color="violet" />
        <KpiCard label="Write-Offs" value={adjustments.filter(a => a.adjustmentType === "Write-Off").length.toString()} delta="Requires approval" positive={false} icon={TrendingDown} color="red" />
        <KpiCard label="Damage Adjustments" value={adjustments.filter(a => a.adjustmentType === "Damaged").length.toString()} delta="Loss incidents" positive={false} icon={AlertTriangle} color="amber" />
      </div>
      <Card>
        <CardHeader title="Stock Adjustment Register" subtitle="All inventory adjustments — audit trail" />
        <div className="divide-y divide-border">
          {adjustments.length === 0 && <div className="px-5 py-8 text-center text-sm text-black/40">No adjustments recorded.</div>}
          {adjustments.map(a => (
            <div key={a.id} className="px-4 sm:px-5 py-3 hover:bg-secondary/40">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{a.itemName}</div>
                  <div className="text-[11px] text-black/50 font-mono mt-0.5">{a.id} · Ref: {a.reference} · By: {a.adjustedBy}</div>
                </div>
                <Badge tone={adjTypeBadge[a.adjustmentType] ?? "muted"}>{a.adjustmentType}</Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-[11px] mb-1.5">
                <span className="text-black/50">Before: {a.quantityBefore}</span>
                <span className={`font-semibold ${a.quantityAdjusted < 0 ? "text-red-600" : "text-[#0F172A]"}`}>
                  {a.quantityAdjusted > 0 ? "+" : ""}{a.quantityAdjusted}
                </span>
                <span className="text-black/50">After: {a.quantityAfter}</span>
                <span className="text-black/40">Approved by: {a.approvedBy}</span>
                <span className="text-black/40">{a.adjustedAt?.split("T")[0]}</span>
              </div>
              <div className="text-[11px] text-black/50 italic">{a.reason}</div>
            </div>
          ))}
        </div>
      </Card>
      <h2 className="text-sm font-semibold">Reconciliation Capabilities</h2>
      <FeatureGrid features={[
        { title: "Variance Investigation", desc: "AI-assisted root cause analysis for stock discrepancies — matches adjustments to transactions and activities." },
        { title: "Approval Workflows", desc: "Multi-level approval for adjustments above threshold values with complete documentation requirements." },
        { title: "Audit Trail", desc: "Every stock movement, adjustment, and reconciliation event is immutably logged with user, timestamp, and justification." },
        { title: "Financial Impact Tracking", desc: "Automatic calculation of financial impact for each adjustment with budget code allocation and write-off reporting." },
        { title: "Fraud Pattern Detection", desc: "AI monitors adjustment patterns to detect systematic theft, collusion, or manipulation of stock records." },
        { title: "IFMS Integration", desc: "Approved adjustments automatically post to the Integrated Financial Management System for accounting treatment." },
      ]} />
    </div>
  );
}

// ── AI Agents Tab ─────────────────────────────────────────────────────────────
function AIAgentsTab() {
  const agents = [
    { name: "Inventory Chief Intelligence Agent", role: "Monitors entire inventory ecosystem — predicts shortages, recommends purchases, detects fraud, optimizes warehouse operations, and generates executive briefings", status: "Active", confidence: 95, actions: 4821, color: "bg-slate-800" },
    { name: "Demand Forecast Agent", role: "Analyses historical consumption, seasonality, and planned activities to predict future stock requirements by item and location", status: "Active", confidence: 91, actions: 2104, color: "bg-[#0F172A]" },
    { name: "Procurement Agent", role: "Auto-generates purchase recommendations, selects optimal suppliers, determines order quantities, and schedules orders to prevent stockouts", status: "Active", confidence: 93, actions: 1482, color: "bg-[#0F172A]" },
    { name: "Receiving Verification Agent", role: "Validates incoming goods against POs, reads supplier documents via OCR, detects quantity discrepancies, and routes exceptions", status: "Active", confidence: 97, actions: 892, color: "bg-[#0F172A]" },
    { name: "Quality Inspection Agent", role: "Reviews inspection history, scores supplier quality, predicts future quality issues, and recommends inspection sampling levels", status: "Active", confidence: 89, actions: 643, color: "bg-[#0F172A]" },
    { name: "Warehouse Optimization Agent", role: "Analyses storage patterns, recommends optimal layouts, suggests put-away locations, and predicts space utilization trends", status: "Active", confidence: 88, actions: 1023, color: "bg-[#0F172A]" },
    { name: "Shortage Prevention Agent", role: "Continuously monitors stock levels against predicted demand, issues early warning alerts, and escalates critical shortage risks", status: "Active", confidence: 94, actions: 3201, color: "bg-red-600" },
    { name: "Overstock & Slow-Moving Agent", role: "Identifies excess inventory, slow-moving stock, and aging items — recommends redistribution, return to supplier, or disposal", status: "Active", confidence: 90, actions: 721, color: "bg-[#0F172A]" },
    { name: "Stock Count Intelligence Agent", role: "Generates risk-based count schedules, guides blind count procedures, analyses variances, and flags suspicious count patterns", status: "Active", confidence: 96, actions: 418, color: "bg-[#0F172A]" },
    { name: "Reconciliation Agent", role: "Automates variance matching, suggests adjustment reasons, monitors reconciliation patterns, and escalates unresolved differences", status: "Active", confidence: 92, actions: 284, color: "bg-[#0F172A]" },
    { name: "Finance Inventory Agent", role: "Monitors inventory financial impact, calculates holding costs, identifies valuation anomalies, and posts adjustments to IFMS", status: "Standby", confidence: 87, actions: 198, color: "bg-lime-700" },
    { name: "Fraud Detection Agent", role: "Analyses transaction patterns, stock movements, and user behaviour to detect theft, collusion, and fraudulent inventory manipulation", status: "Active", confidence: 93, actions: 562, color: "bg-rose-700" },
    { name: "Supplier Intelligence Agent", role: "Scores supplier delivery performance, quality ratings, price trends, and alternative sourcing options", status: "Active", confidence: 91, actions: 834, color: "bg-[#0F172A]" },
    { name: "Safety & Compliance Agent", role: "Monitors hazmat storage compliance, expiry dates, safety certifications, and regulatory requirements for controlled substances", status: "Active", confidence: 98, actions: 1204, color: "bg-[#0F172A]" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-[#0F172A] rounded-2xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Boxes className="h-6 w-6 text-slate-500" />
          <div>
            <div className="text-sm font-semibold">Inventory AI Command Centre</div>
            <div className="text-xs text-white/60">19-module inventory intelligence platform with 14 specialized AI agents</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
            <span className="text-xs text-slate-500 font-medium">All Systems Active</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {[
            { label: "Active Agents", value: agents.filter(a => a.status === "Active").length.toString() },
            { label: "Actions Today", value: "8,240" },
            { label: "Avg Confidence", value: `${Math.round(agents.reduce((s,a) => s+a.confidence,0)/agents.length)}%` },
            { label: "Alerts Raised", value: "142" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3">
              <div className="text-xs text-white/60">{label}</div>
              <div className="text-lg font-bold mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {agents.map(ag => (
          <Card key={ag.name} className="p-4 hover:border-primary/40 transition-colors">
            <div className="flex items-start gap-3 mb-3">
              <div className={`h-9 w-9 rounded-xl ${ag.color} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white text-xs font-bold">{ag.name.split(" ")[0][0]}{ag.name.split(" ").slice(-1)[0][0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-tight">{ag.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-semibold ${ag.status === "Active" ? "text-[#0F172A]" : "text-[#0F172A]"}`}>● {ag.status}</span>
                  <span className="text-[10px] text-black/40">{ag.confidence}% confidence</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-black/60 leading-relaxed mb-3">{ag.role}</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-black/40">{ag.actions.toLocaleString()} actions logged</span>
              <button onClick={() => toast(`${ag.name} — ${ag.status} | Confidence: ${ag.confidence}% | ${ag.actions.toLocaleString()} actions logged`, "info")}
                className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 transition-colors">Consult</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const { user } = useAuth();
  const location = useLocation();
  const { items, add, update } = useInventoryItems();
  const { receipts } = useInventoryReceipts();
  const { requests, add: addRequest, update: updateRequest } = useInventoryRequests();
  const { adjustments } = useStockAdjustments();
  const { counts, update: updateCount } = useStockCounts();

  // Map sub-routes to tabs
  const routeTabMap: Record<string, Tab> = {
    "/inventory/items": "Item Master",
    "/inventory/receiving": "Receiving",
    "/inventory/requests": "Issue Requests",
    "/inventory/warehouse": "Warehouse",
    "/inventory/stock-count": "Stock Count",
    "/inventory/reconciliation": "Reconciliation",
    "/inventory/ai-agents": "AI Agents",
  };
  const initialTab: Tab = routeTabMap[location.pathname] ?? "Dashboard";
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const mapped: Record<string, Tab> = {
      "/inventory/items": "Item Master",
      "/inventory/receiving": "Receiving",
      "/inventory/requests": "Issue Requests",
      "/inventory/warehouse": "Warehouse",
      "/inventory/stock-count": "Stock Count",
      "/inventory/reconciliation": "Reconciliation",
      "/inventory/ai-agents": "AI Agents",
    };
    if (mapped[location.pathname]) setTab(mapped[location.pathname]);
  }, [location.pathname]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showIssueRequest, setShowIssueRequest] = useState(false);

  const totalValue = items.reduce((s,i) => s + (parseFloat(i.totalValue.replace(/[^0-9.]/g,"")) || 0), 0);
  const belowMin = items.filter(i => i.currentStock <= i.minStockLevel).length;
  const pendingRequests = requests.filter(r => r.status === "Pending").length;
  const activeItems = items.filter(i => i.status === "Active").length;

  const handleAddItem = (item: StoredInventoryItem) => {
    add(item);
    pushSeniorAlert(`New inventory item created: ${item.name}`, "info", { from: user?.name, fromRole: user?.role, category: "action" });
    setShowAddItem(false);
  };

  const handleIssueRequest = (r: StoredInventoryRequest) => {
    addRequest(r);
    pushSeniorAlert(`Issue request submitted: ${r.itemName} × ${r.quantityRequested} — ${r.requestingDepartment}`, "info", { from: user?.name, fromRole: user?.role, category: "action" });
    setShowIssueRequest(false);
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Inventory Management"
        process="Inventory Control"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Inventory &amp; Warehouse Management</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Inventory Management"
          description="End-to-end inventory lifecycle: Demand Planning → Procurement → Receiving → Quality → Put-Away → Storage → Control → Issue → Dispatch → Returns → Stock Take → Reconciliation → Reporting."
          actions={
            <div className="flex gap-2">
              <button onClick={() => setShowIssueRequest(true)}
                className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm font-medium hover:bg-gray-50 flex items-center gap-1.5 transition-colors">
                <ClipboardList className="h-4 w-4" /> <span className="hidden sm:inline">New Request</span>
              </button>
              <button onClick={() => setShowAddItem(true)}
                className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 flex items-center gap-2 transition-colors">
                <Plus className="h-4 w-4" /> Add Item
              </button>
            </div>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Inventory Value" value={`USD ${(totalValue/1000).toFixed(0)}K`} delta="All active stock" icon={Boxes} color="blue" />
          <KpiCard label="Active SKUs" value={activeItems.toString()} delta={`${items.length} total items`} icon={Tag} color="green" />
          <KpiCard label="Critical Stock Alerts" value={belowMin.toString()} delta="Below minimum levels" positive={false} icon={AlertTriangle} color="red" />
          <KpiCard label="Pending Requests" value={pendingRequests.toString()} delta="Awaiting approval" positive={false} icon={ClipboardList} color="amber" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="GRNs Processed" value={receipts.length.toString()} delta="Total receipts" icon={PackageCheck} color="cyan" />
          <KpiCard label="Stock Adjustments" value={adjustments.length.toString()} delta="All adjustments" icon={RefreshCcw} color="violet" />
          <KpiCard label="Near Reorder" value={items.filter(i => i.currentStock <= i.reorderPoint && i.currentStock > i.minStockLevel).length.toString()} delta="Approaching reorder point" positive={false} icon={TrendingDown} color="orange" />
          <KpiCard label="Hazmat Items" value={items.filter(i => i.classification === "Hazardous").length.toString()} delta="Hazardous materials" icon={AlertTriangle} color="amber" />
        </div>

        <div className="flex gap-1 mb-6 border-b border-black/10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 sm:px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px flex-shrink-0 ${
                tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"
              }`}>{t}</button>
          ))}
        </div>

        {tab === "Dashboard" && <DashboardTab items={items} receipts={receipts} requests={requests} />}
        {tab === "Item Master" && <ItemMasterTab items={items} onUpdate={update} />}
        {tab === "Stock Levels" && <StockLevelsTab items={items} />}
        {tab === "Receiving" && <ReceivingTab receipts={receipts} />}
        {tab === "Issue Requests" && <IssueRequestsTab requests={requests} onUpdate={updateRequest} />}
        {tab === "Warehouse" && <WarehouseTab items={items} />}
        {tab === "Stock Count" && <StockCountTab counts={counts} onUpdate={updateCount} />}
        {tab === "Reconciliation" && <ReconciliationTab adjustments={adjustments} />}
        {tab === "AI Agents" && <AIAgentsTab />}
      </div>

      {showAddItem && <AddItemModal onClose={() => setShowAddItem(false)} onSave={handleAddItem} />}
      {showIssueRequest && <IssueRequestModal items={items.filter(i => i.status === "Active")} onClose={() => setShowIssueRequest(false)} onSave={handleIssueRequest} />}

      <AIAssistantPanel
        agentName="Inventory Chief Intelligence Agent"
        agentRole="End-to-end inventory intelligence — demand forecasting, shortage prevention, warehouse optimization, and financial analysis"
        context="inventory and warehouse management"
        color="emerald"
        suggestedPrompts={[
          "Which items are critically low and need immediate replenishment?",
          "Show me slow-moving stock for potential disposal",
          "Predict stock requirements for next quarter",
          "Identify any suspicious stock movements",
          "Generate inventory performance summary",
        ]}
      />
      <InlineWorkbench context="Inventory" />
    </AppShell>
  );
}
