import { useState, useMemo } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import {
  Building2, Landmark, GitBranch, Users, Plus, ChevronRight, ChevronDown,
  Search, X, Check, UserPlus, Trash2, Edit2, Building, Crown, Shield,
} from "lucide-react";
import { getAll, addItem, deleteItem } from "@/lib/local-store";
import type {
  StoredMinistry, StoredDepartment, StoredStateEntity, StoredBranch, StoredOrgUser,
} from "@/lib/local-store";
import { useAuth } from "@/lib/auth-context";
import { ALL_ROLES } from "@/lib/auth-context";
import { ZW_PRESIDENCY, ZW_MINISTRIES } from "@/lib/zw-ministries";
import { toast } from "@/lib/toast";

// ── Seed demo orgs if store is empty ─────────────────────────────────────────
const SEED_MINISTRIES: Omit<StoredMinistry, "id" | "createdBy" | "createdAt">[] = [
  { name: "Ministry of Finance & Investment Promotion", code: "MOF", description: "National treasury, budget, fiscal policy", minister: "Hon. Prof. M. Ncube", phone: "+263 4 794 571", email: "info@mof.gov.zw", address: "Munhumutapa Building, Samora Machel Ave, Harare", status: "Active" },
  { name: "Ministry of Health & Child Care", code: "MOH", description: "National health services and child welfare", minister: "Hon. Dr D. Murwira", phone: "+263 4 730 011", email: "info@mohcc.gov.zw", address: "Kaguvi Building, 4th Street, Harare", status: "Active" },
  { name: "Ministry of Transport & Infrastructural Development", code: "MOT", description: "Roads, rail, aviation and infrastructure", minister: "Hon. F. Mhona", phone: "+263 4 700 991", email: "info@transport.gov.zw", address: "Kaguvi Building, 4th Street, Harare", status: "Active" },
];

// ── Modal base ────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</label>
      {children}
    </div>
  );
}

const inp = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
const sel = `${inp} cursor-pointer`;

// ── Ministry Modal ────────────────────────────────────────────────────────────
function MinistryModal({ onClose, onSave }: { onClose: () => void; onSave: (m: StoredMinistry) => void }) {
  const { user } = useAuth();
  const [f, setF] = useState({ name: "", code: "", description: "", minister: "", phone: "", email: "", address: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {
    if (!f.name || !f.code) return toast("Name and code are required", "warning");
    onSave({ id: `MIN-${Date.now()}`, ...f, status: "Active", createdBy: user?.name ?? "System", createdAt: new Date().toISOString() });
  };
  return (
    <Modal title="Register Ministry" onClose={onClose}>
      <Field label="Ministry Name *"><input className={inp} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ministry of Finance" /></Field>
      <Field label="Short Code *"><input className={inp} value={f.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="e.g. MOF" /></Field>
      <Field label="Description"><textarea className={inp} rows={2} value={f.description} onChange={(e) => set("description", e.target.value)} /></Field>
      <Field label="Minister / Head"><input className={inp} value={f.minister} onChange={(e) => set("minister", e.target.value)} placeholder="Hon. Name Surname" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone"><input className={inp} value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Email"><input className={inp} value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
      </div>
      <Field label="Physical Address"><input className={inp} value={f.address} onChange={(e) => set("address", e.target.value)} /></Field>
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onClose} className="h-9 px-4 rounded-md border border-border text-sm hover:bg-secondary">Cancel</button>
        <button onClick={submit} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">Register Ministry</button>
      </div>
    </Modal>
  );
}

// ── Department Modal ──────────────────────────────────────────────────────────
function DepartmentModal({ ministries, onClose, onSave }: { ministries: StoredMinistry[]; onClose: () => void; onSave: (d: StoredDepartment) => void }) {
  const { user } = useAuth();
  const [f, setF] = useState({ ministryId: ministries[0]?.id ?? "", name: "", code: "", description: "", head: "", phone: "", email: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {
    if (!f.ministryId || !f.name || !f.code) return toast("Ministry, name and code are required", "warning");
    onSave({ id: `DEP-${Date.now()}`, ...f, status: "Active", createdBy: user?.name ?? "System", createdAt: new Date().toISOString() });
  };
  return (
    <Modal title="Register Department" onClose={onClose}>
      <Field label="Parent Ministry *">
        <select className={sel} value={f.ministryId} onChange={(e) => set("ministryId", e.target.value)}>
          {ministries.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </Field>
      <Field label="Department Name *"><input className={inp} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Budget & Finance Department" /></Field>
      <Field label="Short Code *"><input className={inp} value={f.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="e.g. BFD" /></Field>
      <Field label="Description"><textarea className={inp} rows={2} value={f.description} onChange={(e) => set("description", e.target.value)} /></Field>
      <Field label="Department Head"><input className={inp} value={f.head} onChange={(e) => set("head", e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone"><input className={inp} value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Email"><input className={inp} value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onClose} className="h-9 px-4 rounded-md border border-border text-sm hover:bg-secondary">Cancel</button>
        <button onClick={submit} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">Register Department</button>
      </div>
    </Modal>
  );
}

// ── State-Owned Entity Modal ──────────────────────────────────────────────────
const ENTITY_TYPES = ["State Enterprise", "Revenue Authority", "Parastatal", "Local Authority", "Regulatory Body", "Development Agency"] as const;

function StateEntityModal({ ministries, onClose, onSave }: { ministries: StoredMinistry[]; onClose: () => void; onSave: (e: StoredStateEntity) => void }) {
  const { user } = useAuth();
  const [f, setF] = useState({ ministryId: ministries[0]?.id ?? "", name: "", code: "", entityType: "State Enterprise" as typeof ENTITY_TYPES[number], description: "", ceo: "", phone: "", email: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const submit = () => {
    if (!f.ministryId || !f.name || !f.code) return toast("Ministry, name and code are required", "warning");
    onSave({ id: `SOE-${Date.now()}`, ...f, status: "Active", createdBy: user?.name ?? "System", createdAt: new Date().toISOString() });
  };
  return (
    <Modal title="Register State-Owned Entity" onClose={onClose}>
      <Field label="Supervising Ministry *">
        <select className={sel} value={f.ministryId} onChange={(e) => set("ministryId", e.target.value)}>
          {ministries.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Entity Name *"><input className={inp} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. ZIMRA" /></Field>
        <Field label="Short Code *"><input className={inp} value={f.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="e.g. ZIMRA" /></Field>
      </div>
      <Field label="Entity Type *">
        <select className={sel} value={f.entityType} onChange={(e) => set("entityType", e.target.value)}>
          {ENTITY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <Field label="Description"><textarea className={inp} rows={2} value={f.description} onChange={(e) => set("description", e.target.value)} /></Field>
      <Field label="CEO / Director General"><input className={inp} value={f.ceo} onChange={(e) => set("ceo", e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone"><input className={inp} value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Email"><input className={inp} value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onClose} className="h-9 px-4 rounded-md border border-border text-sm hover:bg-secondary">Cancel</button>
        <button onClick={submit} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">Register Entity</button>
      </div>
    </Modal>
  );
}

// ── Branch Modal ──────────────────────────────────────────────────────────────
const PROVINCES = ["Harare", "Bulawayo", "Manicaland", "Mashonaland West", "Mashonaland East", "Mashonaland Central", "Midlands", "Masvingo", "Matabeleland North", "Matabeleland South"];

function BranchModal({
  ministries, departments, stateEntities, onClose, onSave,
}: {
  ministries: StoredMinistry[];
  departments: StoredDepartment[];
  stateEntities: StoredStateEntity[];
  onClose: () => void;
  onSave: (b: StoredBranch) => void;
}) {
  const { user } = useAuth();
  const [parentType, setParentType] = useState<"department" | "state_entity">("department");
  const parents = parentType === "department" ? departments : stateEntities;
  const [f, setF] = useState({ parentId: "", name: "", code: "", location: "", province: PROVINCES[0], manager: "", phone: "", email: "" });
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    if (!f.parentId || !f.name || !f.code) return toast("Parent, name and code are required", "warning");
    const parent = parentType === "department"
      ? departments.find((d) => d.id === f.parentId)
      : stateEntities.find((e) => e.id === f.parentId);
    const ministryId = parent ? (parentType === "department" ? (parent as StoredDepartment).ministryId : (parent as StoredStateEntity).ministryId) : "";
    const { parentId, ...rest } = f;
    onSave({ id: `BRN-${Date.now()}`, parentId, parentType, ministryId, ...rest, status: "Active", createdBy: user?.name ?? "System", createdAt: new Date().toISOString() });
  };

  return (
    <Modal title="Register Branch" onClose={onClose}>
      <Field label="Branch belongs to">
        <div className="flex gap-2 mb-3">
          {(["department", "state_entity"] as const).map((t) => (
            <button key={t} onClick={() => { setParentType(t); setF((p) => ({ ...p, parentId: "" })); }}
              className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${parentType === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"}`}>
              {t === "department" ? "Department" : "State-Owned Entity"}
            </button>
          ))}
        </div>
        <select className={sel} value={f.parentId} onChange={(e) => set("parentId", e.target.value)}>
          <option value="">— Select {parentType === "department" ? "Department" : "Entity"} —</option>
          {parents.map((p) => {
            const min = ministries.find((m) => m.id === (p as StoredDepartment | StoredStateEntity).ministryId);
            return <option key={p.id} value={p.id}>{p.name}{min ? ` (${min.code})` : ""}</option>;
          })}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Branch Name *"><input className={inp} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Bulawayo Branch" /></Field>
        <Field label="Short Code *"><input className={inp} value={f.code} onChange={(e) => set("code", e.target.value.toUpperCase())} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Province">
          <select className={sel} value={f.province} onChange={(e) => set("province", e.target.value)}>
            {PROVINCES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Location / Address"><input className={inp} value={f.location} onChange={(e) => set("location", e.target.value)} /></Field>
      </div>
      <Field label="Branch Manager"><input className={inp} value={f.manager} onChange={(e) => set("manager", e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone"><input className={inp} value={f.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
        <Field label="Email"><input className={inp} value={f.email} onChange={(e) => set("email", e.target.value)} /></Field>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button onClick={onClose} className="h-9 px-4 rounded-md border border-border text-sm hover:bg-secondary">Cancel</button>
        <button onClick={submit} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">Register Branch</button>
      </div>
    </Modal>
  );
}

// ── User Mapping Modal ────────────────────────────────────────────────────────
const DEMO_PLATFORM_USERS = [
  { id: "u1", name: "T. Moyo", email: "tmoyo@praz.gov.zw", role: "Chief Procurement Officer", department: "Procurement" },
  { id: "u2", name: "R. Chikwanda", email: "rchikwanda@mof.gov.zw", role: "Finance Officer", department: "Finance" },
  { id: "u3", name: "S. Nkosi", email: "snkosi@oag.gov.zw", role: "Auditor", department: "Audit" },
  { id: "u4", name: "Hon. B. Mutasa", email: "bmutasa@cabinet.gov.zw", role: "Minister", department: "Cabinet" },
  { id: "u6", name: "P. Dube", email: "pdube@moh.gov.zw", role: "Evaluator", department: "Procurement" },
  { id: "u7", name: "A. Mpofu", email: "ampofu@praz.gov.zw", role: "Procurement Officer", department: "Procurement" },
  { id: "u8", name: "E. Chirwa", email: "echirwa@mof.gov.zw", role: "Budget Officer", department: "Budget" },
  { id: "u9", name: "N. Sithole", email: "nsithole@mot.gov.zw", role: "Contract Manager", department: "Contracts" },
  { id: "u10", name: "C. Madzima", email: "cmadzima@moh.gov.zw", role: "Compliance Officer", department: "Compliance" },
  { id: "u11", name: "B. Ndlovu", email: "bndlovu@zimra.gov.zw", role: "Risk Officer", department: "Risk" },
  { id: "u12", name: "F. Mutanga", email: "fmutanga@mot.gov.zw", role: "Planning Officer", department: "Planning" },
  { id: "u13", name: "G. Marima", email: "gmarima@praz.gov.zw", role: "System Administrator", department: "IT" },
];

function UserMapModal({
  orgId, orgType, orgName, existingMaps, onClose, onSave,
}: {
  orgId: string; orgType: StoredOrgUser["orgType"]; orgName: string;
  existingMaps: StoredOrgUser[]; onClose: () => void;
  onSave: (users: StoredOrgUser[]) => void;
}) {
  const { user } = useAuth();
  const alreadyMapped = new Set(existingMaps.filter((m) => m.orgId === orgId).map((m) => m.userId));
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set(alreadyMapped));
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const filtered = DEMO_PLATFORM_USERS.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) ||
           u.role.toLowerCase().includes(search.toLowerCase()) ||
           u.department.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggingId) { setSelected((prev) => new Set([...prev, draggingId])); setDraggingId(null); }
  };

  const save = () => {
    const now = new Date().toISOString();
    const newMaps: StoredOrgUser[] = [...selected].map((uid) => {
      const pu = DEMO_PLATFORM_USERS.find((u) => u.id === uid)!;
      return { id: `OU-${Date.now()}-${uid}`, orgId, orgType, userId: uid, userName: pu.name, userEmail: pu.email, userRole: pu.role, department: pu.department, assignedBy: user?.name ?? "System", assignedAt: now };
    });
    onSave(newMaps);
  };

  return (
    <Modal title={`Map Users → ${orgName}`} onClose={onClose}>
      <div className="text-xs text-muted-foreground mb-4">Check users or drag them into the assigned zone. Previously mapped users are pre-selected.</div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input className={`${inp} pl-9`} placeholder="Search by name, role or department…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* User list (draggable + checkbox) */}
      <div className="max-h-52 overflow-y-auto divide-y divide-border rounded-md border border-border mb-4">
        {filtered.map((u) => (
          <div key={u.id} draggable onDragStart={() => setDraggingId(u.id)}
            className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-secondary/50 ${selected.has(u.id) ? "bg-primary/5" : ""}`}
            onClick={() => toggle(u.id)}>
            <div className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected.has(u.id) ? "bg-primary border-primary" : "border-border"}`}>
              {selected.has(u.id) && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
              {u.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{u.name}</div>
              <div className="text-xs text-muted-foreground truncate">{u.role} · {u.department}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}
        className="rounded-md border-2 border-dashed border-primary/30 bg-primary/5 p-3 min-h-[72px] mb-4">
        <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Assigned ({selected.size}) — drag here or use checkboxes above</div>
        <div className="flex flex-wrap gap-1.5">
          {[...selected].map((uid) => {
            const u = DEMO_PLATFORM_USERS.find((x) => x.id === uid);
            if (!u) return null;
            return (
              <span key={uid} className="flex items-center gap-1 bg-card border border-border rounded-full px-2.5 py-0.5 text-xs">
                {u.name}
                <button onClick={() => toggle(uid)} className="text-muted-foreground hover:text-destructive ml-1"><X className="h-3 w-3" /></button>
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="h-9 px-4 rounded-md border border-border text-sm hover:bg-secondary">Cancel</button>
        <button onClick={save} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5">
          <UserPlus className="h-4 w-4" /> Save Mapping
        </button>
      </div>
    </Modal>
  );
}

// ── Hierarchy Tree Node ───────────────────────────────────────────────────────
function TreeNode({
  icon: Icon, label, code, badge, badgeTone, userCount, onAddUser, onDelete, children, defaultOpen = false,
}: {
  icon: React.FC<{ className?: string }>;
  label: string; code: string;
  badge: string; badgeTone: "blue" | "green" | "purple" | "muted" | "yellow";
  userCount: number;
  onAddUser: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden mb-2.5 shadow-sm">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-card hover:bg-secondary/40 transition-colors">
        {children
          ? <button onClick={() => setOpen((o) => !o)} className="text-muted-foreground">{open ? <ChevronDown className="h-4.5 w-4.5" /> : <ChevronRight className="h-4.5 w-4.5" />}</button>
          : <span className="w-4" />}
        <Icon className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold leading-tight">{label}</span>
          <span className="ml-2 text-xs text-muted-foreground font-medium">{code}</span>
        </div>
        <Badge tone={badgeTone}>{badge}</Badge>
        <span className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded px-2 py-1 bg-secondary/40">
          <Users className="h-3.5 w-3.5" />{userCount}
        </span>
        <button onClick={onAddUser} title="Map Users" className="h-8 w-8 rounded border border-border bg-card flex items-center justify-center hover:bg-primary/10 hover:border-primary/40 transition-colors">
          <UserPlus className="h-4 w-4 text-primary" />
        </button>
        {onDelete && (
          <button onClick={onDelete} title="Delete" className="h-8 w-8 rounded border border-border bg-card flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/40 transition-colors">
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        )}
      </div>
      {open && children && <div className="pl-10 pr-4 py-3 bg-secondary/20 border-t border-border space-y-1">{children}</div>}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OrganisationsPage() {
  const { user } = useAuth();

  // ── Load / seed state ────────────────────────────────────────────────────
  const [ministries, setMinistries] = useState<StoredMinistry[]>(() => {
    const stored = getAll("ministries" as never) as unknown as StoredMinistry[];
    if (stored.length) return stored;
    // Seed demo data on first load
    const seeded: StoredMinistry[] = SEED_MINISTRIES.map((m, i) => ({
      ...m, id: `MIN-SEED-${i + 1}`, createdBy: "System", createdAt: new Date().toISOString(),
    }));
    return seeded;
  });

  const [departments, setDepartments] = useState<StoredDepartment[]>(() => {
    const stored = getAll("departments" as never) as unknown as StoredDepartment[];
    if (stored.length) return stored;
    return [
      { id: "DEP-SEED-1", ministryId: "MIN-SEED-1", name: "Budget & Finance Department", code: "BFD", description: "Manages national budget execution", head: "R. Chikwanda", phone: "+263 4 794 580", email: "budget@mof.gov.zw", status: "Active", createdBy: "System", createdAt: new Date().toISOString() },
      { id: "DEP-SEED-2", ministryId: "MIN-SEED-1", name: "Revenue & Taxation Department", code: "RTD", description: "Tax policy and revenue strategy", head: "B. Ndlovu", phone: "+263 4 794 582", email: "revenue@mof.gov.zw", status: "Active", createdBy: "System", createdAt: new Date().toISOString() },
      { id: "DEP-SEED-3", ministryId: "MIN-SEED-2", name: "Procurement & Supply Department", code: "PSD", description: "Medical supplies and pharmaceutical procurement", head: "P. Dube", phone: "+263 4 730 020", email: "procurement@mohcc.gov.zw", status: "Active", createdBy: "System", createdAt: new Date().toISOString() },
      { id: "DEP-SEED-4", ministryId: "MIN-SEED-3", name: "Roads & Bridges Department", code: "RBD", description: "National roads infrastructure", head: "F. Mutanga", phone: "+263 4 700 995", email: "roads@transport.gov.zw", status: "Active", createdBy: "System", createdAt: new Date().toISOString() },
    ];
  });

  const [stateEntities, setStateEntities] = useState<StoredStateEntity[]>(() => {
    const stored = getAll("stateEntities" as never) as unknown as StoredStateEntity[];
    if (stored.length) return stored;
    return [
      { id: "SOE-SEED-1", ministryId: "MIN-SEED-1", name: "ZIMRA", code: "ZIMRA", entityType: "Revenue Authority", description: "Zimbabwe Revenue Authority — tax collection", ceo: "Mrs. F. Dhliwayo", phone: "+263 4 758 702", email: "info@zimra.gov.zw", status: "Active", createdBy: "System", createdAt: new Date().toISOString() },
      { id: "SOE-SEED-2", ministryId: "MIN-SEED-3", name: "ZINARA", code: "ZINARA", entityType: "State Enterprise", description: "Zimbabwe National Roads Administration", ceo: "Mr. N. Mazango", phone: "+263 4 702 000", email: "info@zinara.co.zw", status: "Active", createdBy: "System", createdAt: new Date().toISOString() },
    ];
  });

  const [branches, setBranches] = useState<StoredBranch[]>(() => {
    const stored = getAll("branches" as never) as unknown as StoredBranch[];
    if (stored.length) return stored;
    return [
      { id: "BRN-SEED-1", parentId: "DEP-SEED-1", parentType: "department", ministryId: "MIN-SEED-1", name: "Bulawayo Regional Office", code: "BYO-BFD", location: "Fife Street, Bulawayo", province: "Bulawayo", manager: "E. Chirwa", phone: "+263 9 888 100", email: "bulawayo@mof.gov.zw", status: "Active", createdBy: "System", createdAt: new Date().toISOString() },
      { id: "BRN-SEED-2", parentId: "SOE-SEED-1", parentType: "state_entity", ministryId: "MIN-SEED-1", name: "ZIMRA Masvingo Branch", code: "MSV-ZIMRA", location: "Robert Mugabe Way, Masvingo", province: "Masvingo", manager: "C. Madzima", phone: "+263 39 262 800", email: "masvingo@zimra.gov.zw", status: "Active", createdBy: "System", createdAt: new Date().toISOString() },
    ];
  });

  const [orgUsers, setOrgUsers] = useState<StoredOrgUser[]>(() =>
    (getAll("orgUsers" as never) as unknown as StoredOrgUser[]) ?? []
  );

  // ── Modal state ──────────────────────────────────────────────────────────
  type ModalType = "ministry" | "department" | "state_entity" | "branch" | "map_users" | null;
  const [modal, setModal] = useState<ModalType>(null);
  const [mapTarget, setMapTarget] = useState<{ id: string; type: StoredOrgUser["orgType"]; name: string } | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"tree" | "users">("tree");

  // ── Helpers ──────────────────────────────────────────────────────────────
  const userCountFor = (id: string) => orgUsers.filter((u) => u.orgId === id).length;

  const openMap = (id: string, type: StoredOrgUser["orgType"], name: string) => {
    setMapTarget({ id, type, name });
    setModal("map_users");
  };

  // ── Persist helpers ──────────────────────────────────────────────────────
  const saveMinistry = (m: StoredMinistry) => {
    const next = [m, ...ministries];
    setMinistries(next);
    // persist via addItem — cast to keep generic util happy
    addItem("ministries" as never, m as never);
    toast(`Ministry "${m.name}" registered`, "success");
    setModal(null);
  };

  const saveDept = (d: StoredDepartment) => {
    const next = [d, ...departments];
    setDepartments(next);
    addItem("departments" as never, d as never);
    toast(`Department "${d.name}" registered`, "success");
    setModal(null);
  };

  const saveEntity = (e: StoredStateEntity) => {
    const next = [e, ...stateEntities];
    setStateEntities(next);
    addItem("stateEntities" as never, e as never);
    toast(`Entity "${e.name}" registered`, "success");
    setModal(null);
  };

  const saveBranch = (b: StoredBranch) => {
    const next = [b, ...branches];
    setBranches(next);
    addItem("branches" as never, b as never);
    toast(`Branch "${b.name}" registered`, "success");
    setModal(null);
  };

  const saveOrgUsers = (newMaps: StoredOrgUser[]) => {
    if (!mapTarget) return;
    // Remove old mappings for this org, then add new ones
    const filtered = orgUsers.filter((u) => u.orgId !== mapTarget.id);
    const next = [...filtered, ...newMaps];
    setOrgUsers(next);
    newMaps.forEach((m) => addItem("orgUsers" as never, m as never));
    toast(`${newMaps.length} user(s) mapped to ${mapTarget.name}`, "success");
    setModal(null);
    setMapTarget(null);
  };

  const deleteMinistry = (id: string) => {
    setMinistries((p) => p.filter((m) => m.id !== id));
    deleteItem("ministries" as never, id);
    toast("Ministry removed", "info");
  };
  const deleteDept = (id: string) => { setDepartments((p) => p.filter((d) => d.id !== id)); deleteItem("departments" as never, id); toast("Department removed", "info"); };
  const deleteEntity = (id: string) => { setStateEntities((p) => p.filter((e) => e.id !== id)); deleteItem("stateEntities" as never, id); toast("Entity removed", "info"); };
  const deleteBranch = (id: string) => { setBranches((p) => p.filter((b) => b.id !== id)); deleteItem("branches" as never, id); toast("Branch removed", "info"); };

  // ── Filter tree by search ────────────────────────────────────────────────
  const filteredMinistries = useMemo(() =>
    ministries.filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.code.toLowerCase().includes(search.toLowerCase())),
    [ministries, search]
  );

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const totalUsers = orgUsers.length;
  const totalNodes = ministries.length + departments.length + stateEntities.length + branches.length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Vendor Management"
        process="Organisations Register"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Administration</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Organisation Registration & Mapping"
          description="Register the national entity hierarchy — Ministries, Departments, State-Owned Entities, and Branches — then map user roles to each node."
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <KpiCard label="Ministries" value={String(ministries.length)} delta="Level 1 — root entities" icon={Landmark} />
          <KpiCard label="Departments" value={String(departments.length)} delta="Level 2a — ministry children" icon={Building2} />
          <KpiCard label="State Entities" value={String(stateEntities.length)} delta="Level 2b — parastatals & SOEs" icon={Building} />
          <KpiCard label="Branches" value={String(branches.length)} delta="Level 3 — grandchildren" icon={GitBranch} />
          <KpiCard label="Mapped Users" value={String(totalUsers)} delta={`Across ${totalNodes} nodes`} icon={Users} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 mb-5 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input className={`${inp} pl-9`} placeholder="Search organisations…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button onClick={() => setModal("ministry")} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5 flex-shrink-0">
            <Plus className="h-4 w-4" /><Landmark className="h-4 w-4" /> Ministry
          </button>
          <button onClick={() => setModal("department")} className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary flex-shrink-0" disabled={!ministries.length}>
            <Plus className="h-4 w-4" /><Building2 className="h-4 w-4" /> Department
          </button>
          <button onClick={() => setModal("state_entity")} className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary flex-shrink-0" disabled={!ministries.length}>
            <Plus className="h-4 w-4" /><Building className="h-4 w-4" /> State Entity
          </button>
          <button onClick={() => setModal("branch")} className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary flex-shrink-0" disabled={!departments.length && !stateEntities.length}>
            <Plus className="h-4 w-4" /><GitBranch className="h-4 w-4" /> Branch
          </button>
        </div>

        {/* Tab toggle */}
        <div className="flex gap-1 mb-5 border-b border-border">
          {(["tree", "users"] as const).map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t === "tree" ? "Hierarchy Tree" : "User Mappings"}
            </button>
          ))}
        </div>

        {/* ── Hierarchy Tree Tab ─────────────────────────────────────────── */}
        {activeTab === "tree" && (
          <div>
            {/* President / OPC root node — always shown at top */}
            <TreeNode
              icon={Crown}
              label={ZW_PRESIDENCY.name}
              code={ZW_PRESIDENCY.code}
              badge="Head of State"
              badgeTone="yellow"
              userCount={userCountFor("presidency")}
              onAddUser={() => openMap("presidency", "ministry", ZW_PRESIDENCY.name)}
              defaultOpen
            >
              {ZW_PRESIDENCY.departments.map(dept => (
                <TreeNode key={dept.id} icon={Building2} label={dept.name} code={dept.code}
                  badge="OPC Department" badgeTone="muted" userCount={0}
                  onAddUser={() => openMap(dept.id, "department", dept.name)}
                />
              ))}
            </TreeNode>

            {filteredMinistries.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Landmark className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No ministries found. Register the first one to get started.</p>
              </div>
            )}
            {filteredMinistries.map((ministry) => {
              const minDepts = departments.filter((d) => d.ministryId === ministry.id);
              const minEntities = stateEntities.filter((e) => e.ministryId === ministry.id);
              const minBranches = branches.filter((b) => b.ministryId === ministry.id);
              const totalMinUsers = userCountFor(ministry.id) + minDepts.reduce((s, d) => s + userCountFor(d.id), 0) + minEntities.reduce((s, e) => s + userCountFor(e.id), 0) + minBranches.reduce((s, b) => s + userCountFor(b.id), 0);

              // Look up CPO from ZW_MINISTRIES by matching code
              const zwMin = ZW_MINISTRIES.find(m => m.code === ministry.code);

              return (
                <TreeNode key={ministry.id} icon={Landmark} label={ministry.name} code={ministry.code}
                  badge="Ministry" badgeTone="blue" userCount={totalMinUsers}
                  onAddUser={() => openMap(ministry.id, "ministry", ministry.name)}
                  onDelete={() => deleteMinistry(ministry.id)}
                  defaultOpen>

                  {/* CPO row — pinned under each ministry */}
                  <div className="mb-3">
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 pl-1">Chief Procurement Officer</div>
                    <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                      <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-50 dark:bg-[#0F172A]/20">
                        <Shield className="h-5 w-5 text-[#0F172A] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-[#0F172A] dark:text-slate-400 block">Chief Procurement Officer (CPO)</span>
                          <span className="text-xs text-[#0F172A]">{zwMin?.cpo ?? "CPO — " + ministry.code}</span>
                        </div>
                        <Badge tone="purple">Executive</Badge>
                        <button onClick={() => openMap(`${ministry.id}-cpo`, "department", `CPO — ${ministry.name}`)}
                          title="Map Users" className="h-8 w-8 rounded border border-border bg-card flex items-center justify-center hover:bg-primary/10 hover:border-primary/40 transition-colors">
                          <UserPlus className="h-4 w-4 text-primary" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {minDepts.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 pl-1">Departments</div>
                      {minDepts.map((dept) => {
                        const deptBranches = branches.filter((b) => b.parentId === dept.id && b.parentType === "department");
                        return (
                          <TreeNode key={dept.id} icon={Building2} label={dept.name} code={dept.code}
                            badge="Department" badgeTone="green" userCount={userCountFor(dept.id)}
                            onAddUser={() => openMap(dept.id, "department", dept.name)}
                            onDelete={() => deleteDept(dept.id)}
                            defaultOpen={false}>
                            {/* Level 3 — Branches under Dept */}
                            {deptBranches.map((branch) => (
                              <TreeNode key={branch.id} icon={GitBranch} label={branch.name} code={branch.code}
                                badge={branch.province} badgeTone="muted" userCount={userCountFor(branch.id)}
                                onAddUser={() => openMap(branch.id, "branch", branch.name)}
                                onDelete={() => deleteBranch(branch.id)} />
                            ))}
                            {deptBranches.length === 0 && (
                              <p className="text-xs text-muted-foreground px-1 py-1">No branches yet — add one via the Branch button above.</p>
                            )}
                          </TreeNode>
                        );
                      })}
                    </div>
                  )}

                  {/* Level 2b — State Entities */}
                  {minEntities.length > 0 && (
                    <div>
                      <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 pl-1">State-Owned Entities</div>
                      {minEntities.map((entity) => {
                        const entityBranches = branches.filter((b) => b.parentId === entity.id && b.parentType === "state_entity");
                        return (
                          <TreeNode key={entity.id} icon={Building} label={entity.name} code={entity.code}
                            badge={entity.entityType} badgeTone="purple" userCount={userCountFor(entity.id)}
                            onAddUser={() => openMap(entity.id, "state_entity", entity.name)}
                            onDelete={() => deleteEntity(entity.id)}
                            defaultOpen={false}>
                            {entityBranches.map((branch) => (
                              <TreeNode key={branch.id} icon={GitBranch} label={branch.name} code={branch.code}
                                badge={branch.province} badgeTone="muted" userCount={userCountFor(branch.id)}
                                onAddUser={() => openMap(branch.id, "branch", branch.name)}
                                onDelete={() => deleteBranch(branch.id)} />
                            ))}
                            {entityBranches.length === 0 && (
                              <p className="text-xs text-muted-foreground px-1 py-1">No branches yet.</p>
                            )}
                          </TreeNode>
                        );
                      })}
                    </div>
                  )}

                  {minDepts.length === 0 && minEntities.length === 0 && (
                    <p className="text-xs text-muted-foreground px-1 py-1">No departments or entities yet. Use the toolbar above to add children.</p>
                  )}
                </TreeNode>
              );
            })}
          </div>
        )}

        {/* ── User Mappings Tab ──────────────────────────────────────────── */}
        {activeTab === "users" && (
          <Card>
            <CardHeader title="User → Organisation Mappings" subtitle={`${orgUsers.length} total assignments`} />
            {orgUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No user mappings yet. Click the <UserPlus className="h-3.5 w-3.5 inline" /> icon on any org node to assign users.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-xs text-muted-foreground">
                    <tr>
                      {["User", "Role", "Department", "Mapped To", "Org Type", "Assigned By", "Date"].map((h) => (
                        <th key={h} className="text-left font-medium px-4 py-2.5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orgUsers.map((m) => {
                      const orgLabel =
                        ministries.find((x) => x.id === m.orgId)?.name ??
                        departments.find((x) => x.id === m.orgId)?.name ??
                        stateEntities.find((x) => x.id === m.orgId)?.name ??
                        branches.find((x) => x.id === m.orgId)?.name ?? m.orgId;
                      const typeBadge: Record<StoredOrgUser["orgType"], { label: string; tone: "blue" | "green" | "purple" | "muted" }> = {
                        ministry: { label: "Ministry", tone: "blue" },
                        department: { label: "Department", tone: "green" },
                        state_entity: { label: "State Entity", tone: "purple" },
                        branch: { label: "Branch", tone: "muted" },
                      };
                      const tb = typeBadge[m.orgType];
                      return (
                        <tr key={m.id} className="hover:bg-secondary/40">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                                {m.userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-medium">{m.userName}</div>
                                <div className="text-xs text-muted-foreground">{m.userEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">{m.userRole}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{m.department}</td>
                          <td className="px-4 py-2.5 font-medium">{orgLabel}</td>
                          <td className="px-4 py-2.5"><Badge tone={tb.tone}>{tb.label}</Badge></td>
                          <td className="px-4 py-2.5 text-muted-foreground">{m.assignedBy}</td>
                          <td className="px-4 py-2.5 text-muted-foreground text-xs">{new Date(m.assignedAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* ── Modals ─────────────────────────────────────────────────────── */}
        {modal === "ministry" && <MinistryModal onClose={() => setModal(null)} onSave={saveMinistry} />}
        {modal === "department" && <DepartmentModal ministries={ministries} onClose={() => setModal(null)} onSave={saveDept} />}
        {modal === "state_entity" && <StateEntityModal ministries={ministries} onClose={() => setModal(null)} onSave={saveEntity} />}
        {modal === "branch" && <BranchModal ministries={ministries} departments={departments} stateEntities={stateEntities} onClose={() => setModal(null)} onSave={saveBranch} />}
        {modal === "map_users" && mapTarget && (
          <UserMapModal orgId={mapTarget.id} orgType={mapTarget.type} orgName={mapTarget.name}
            existingMaps={orgUsers} onClose={() => { setModal(null); setMapTarget(null); }} onSave={saveOrgUsers} />
        )}
      </div>
    </AppShell>
  );
}
