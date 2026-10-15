import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, ChevronRight, ArrowDown, Plus, Eye, EyeOff, Pencil, Trash2,
  CheckCircle2, Circle, XCircle,
} from "lucide-react";
import type { Department, Workstation, WorkstationStatus } from "@/lib/workstation-data";

// ── Status helpers ────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<WorkstationStatus, string> = {
  active:    "bg-slate-100 text-[#0F172A] border border-slate-200",
  vacant:    "bg-slate-100   text-[#0F172A]   border border-slate-200",
  suspended: "bg-red-100     text-red-700     border border-red-200",
};
const STATUS_DOT: Record<WorkstationStatus, string> = {
  active:    "bg-[#0F172A]",
  vacant:    "bg-slate-400",
  suspended: "bg-red-500",
};
const STATUS_ICON: Record<WorkstationStatus, typeof CheckCircle2> = {
  active:    CheckCircle2,
  vacant:    Circle,
  suspended: XCircle,
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface WorkstationTowerProps {
  department: Department;
  /** If true, show admin controls (add/edit/remove/hide) */
  adminMode?: boolean;
  /** Called when the user clicks a workstation card to open its detail */
  onSelectWorkstation?: (ws: Workstation) => void;
}

// ── Card ──────────────────────────────────────────────────────────────────────
function WsCard({
  ws,
  index,
  total,
  adminMode,
  hidden,
  onSelect,
  onToggleHide,
  onEdit,
  onRemove,
}: {
  ws: Workstation;
  index: number;
  total: number;
  adminMode: boolean;
  hidden: boolean;
  onSelect: () => void;
  onToggleHide: () => void;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const StatusIcon = STATUS_ICON[ws.status];
  const isLast = index === total - 1;

  if (hidden && !adminMode) return null;

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div
        className={`w-full max-w-sm group relative bg-white border rounded-2xl px-4 py-3 transition-all cursor-pointer
          ${hidden ? "opacity-40 border-dashed border-black/20" : "border-black/10 hover:border-black/30 hover:shadow-md"}`}
        onClick={onSelect}
      >
        {/* Left accent stripe */}
        <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${STATUS_DOT[ws.status]}`} />

        <div className="pl-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-gray-100 grid place-items-center flex-shrink-0">
              <User className="h-4 w-4 text-gray-500" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-black leading-tight truncate">{ws.role}</div>
              {ws.grade && (
                <div className="text-[10px] text-black/40 font-mono mt-0.5">Grade {ws.grade}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${STATUS_STYLES[ws.status]}`}>
              <StatusIcon className="h-2.5 w-2.5" />
              {ws.status.charAt(0).toUpperCase() + ws.status.slice(1)}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-black/20 group-hover:text-black/60 transition-colors" />
          </div>
        </div>

        {/* Admin controls — shown on hover if adminMode */}
        {adminMode && (
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-white border border-black/10 rounded-lg px-1.5 py-1 shadow-sm z-10"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={onToggleHide} title={hidden ? "Show" : "Hide"}
              className="h-6 w-6 rounded-md hover:bg-gray-100 grid place-items-center text-black/40 hover:text-black transition-colors">
              {hidden ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </button>
            <button onClick={onEdit} title="Edit"
              className="h-6 w-6 rounded-md hover:bg-gray-100 grid place-items-center text-black/40 hover:text-black transition-colors">
              <Pencil className="h-3 w-3" />
            </button>
            <button onClick={onRemove} title="Remove"
              className="h-6 w-6 rounded-md hover:bg-red-50 grid place-items-center text-black/40 hover:text-red-600 transition-colors">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Connector arrow (not after last item) */}
      {!isLast && (
        <div className="flex flex-col items-center py-1">
          <div className="w-px h-3 bg-black/10" />
          <ArrowDown className="h-3.5 w-3.5 text-black/20" />
        </div>
      )}
    </div>
  );
}

// ── Add/Edit modal ────────────────────────────────────────────────────────────
function WsFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Partial<Workstation>;
  onSave: (ws: Workstation) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Workstation>>(initial ?? { status: "active" });
  const set = (k: keyof Workstation, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.role?.trim()) return;
    onSave({
      id: form.id ?? form.role!.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      role: form.role!,
      shortRole: form.shortRole ?? form.role!,
      reportsTo: form.reportsTo ?? "",
      grade: form.grade,
      status: (form.status ?? "active") as WorkstationStatus,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
          <h2 className="text-sm font-semibold">{initial?.role ? "Edit Workstation" : "Add Workstation"}</h2>
          <button onClick={onClose} className="text-black/30 hover:text-black text-xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: "Role Title *",     key: "role"      },
            { label: "Short Label",      key: "shortRole" },
            { label: "Reports To (ID)",  key: "reportsTo" },
            { label: "Grade",            key: "grade"     },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-black/60 mb-1">{label}</label>
              <input
                value={(form as Record<string, string>)[key] ?? ""}
                onChange={e => set(key as keyof Workstation, e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-black/60 mb-1">Status</label>
            <select
              value={form.status ?? "active"}
              onChange={e => set("status", e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="vacant">Vacant</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-black/10">
          <button onClick={onClose} className="h-9 px-4 rounded-xl border border-black/10 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSave} className="h-9 px-4 rounded-xl bg-black text-white text-sm hover:bg-gray-800 transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Main WorkstationTower component ───────────────────────────────────────────
export default function WorkstationTower({ department, adminMode = false, onSelectWorkstation }: WorkstationTowerProps) {
  const [stations, setStations] = useState<Workstation[]>(department.workstations);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [editTarget, setEditTarget] = useState<Workstation | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleHide = (id: string) =>
    setHiddenIds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const removeStation = (id: string) => setStations(s => s.filter(w => w.id !== id));

  const saveEdit = (updated: Workstation) => {
    setStations(s => s.map(w => w.id === updated.id ? updated : w));
    setEditTarget(null);
  };

  const addStation = (ws: Workstation) => {
    setStations(s => [...s, ws]);
    setShowAddForm(false);
  };

  const visible = stations.filter(w => adminMode || !hiddenIds.has(w.id));

  return (
    <div className="flex flex-col items-center w-full">
      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-black/50 mb-4 flex-wrap justify-center">
        {(["active","vacant","suspended"] as WorkstationStatus[]).map(s => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${STATUS_DOT[s]}`} />
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </div>
        ))}
        {adminMode && (
          <div className="flex items-center gap-1.5 text-black/40 ml-2">
            <EyeOff className="h-3 w-3" /> Hover card for controls
          </div>
        )}
      </div>

      {/* Chain tower */}
      <div className="flex flex-col items-center w-full max-w-sm">
        {visible.map((ws, i) => (
          <WsCard
            key={ws.id}
            ws={ws}
            index={i}
            total={visible.length}
            adminMode={adminMode}
            hidden={hiddenIds.has(ws.id)}
            onSelect={() => onSelectWorkstation?.(ws)}
            onToggleHide={() => toggleHide(ws.id)}
            onEdit={() => setEditTarget(ws)}
            onRemove={() => removeStation(ws.id)}
          />
        ))}

        {/* Add new workstation button (admin only) */}
        {adminMode && (
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-black/15 text-xs text-black/40 hover:border-black/30 hover:text-black transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add Workstation
          </button>
        )}
      </div>

      {/* Modals */}
      {editTarget && <WsFormModal initial={editTarget} onSave={saveEdit} onClose={() => setEditTarget(null)} />}
      {showAddForm && <WsFormModal onSave={addStation} onClose={() => setShowAddForm(false)} />}
    </div>
  );
}
