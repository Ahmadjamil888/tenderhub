import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth, ALL_ROLES } from "@/lib/auth-context";
import { ZW_MINISTRIES, type ZWRole } from "@/lib/zw-ministries";
import {
  Eye, EyeOff, ArrowRight, Shield, Building2, ChevronLeft, X,
  Phone, User, Mail, Lock, Briefcase, Landmark, Search, Users,
  ChevronDown, ChevronRight, Crown, Star, AlertTriangle,
} from "lucide-react";
import { seedIfEmpty } from "@/lib/local-store";

function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
    </svg>
  );
}

// ─── Visual left panel — system overview ──────────────────────────────────────
function GovVisualPanel() {
  const totalDepts = ZW_MINISTRIES.reduce((a, m) => a + m.departments.length, 0);

  const kpis = [
    { label: "Ministries", value: ZW_MINISTRIES.length, color: "text-slate-400", bg: "bg-[#0F172A]/15 border-slate-200/25" },
    { label: "Departments", value: totalDepts, color: "text-slate-400", bg: "bg-[#0F172A]/15 border-slate-200/25" },
    { label: "Roles", value: ALL_ROLES.length + 10, color: "text-slate-400", bg: "bg-[#0F172A]/15 border-slate-200/25" },
    { label: "Active Tenders", value: 247, color: "text-slate-400", bg: "bg-[#0F172A]/15 border-slate-200/25" },
    { label: "Contracts Live", value: 1_842, color: "text-slate-400", bg: "bg-[#0F172A]/15 border-slate-200/25" },
    { label: "Suppliers", value: "12,470", color: "text-slate-300", bg: "bg-white/10 border-white/20" },
  ];

  const modules = [
    { label: "E-Procurement", icon: Shield, color: "bg-[#0F172A]" },
    { label: "Budget Intelligence", icon: Landmark, color: "bg-[#0F172A]" },
    { label: "Contract Management", icon: Briefcase, color: "bg-[#0F172A]" },
    { label: "Supplier Management", icon: Building2, color: "bg-[#0F172A]" },
    { label: "Anti-Corruption", icon: Star, color: "bg-[#0F172A]" },
    { label: "E-Recruitment", icon: Users, color: "bg-[#0F172A]" },
    { label: "Asset Management", icon: Crown, color: "bg-[#0F172A]" },
    { label: "Audit & Oversight", icon: Search, color: "bg-slate-600" },
  ];

  return (
    <div className="flex flex-col h-full gap-5 px-1">
      {/* KPI grid */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400/70 mb-3">Platform Overview</div>
        <div className="grid grid-cols-3 gap-2">
          {kpis.map(k => (
            <div key={k.label} className={`rounded-xl border px-3 py-3 ${k.bg} text-center`}>
              <div className={`text-2xl font-bold tabular-nums ${k.color}`}>
                {typeof k.value === "number" ? k.value.toLocaleString() : k.value}
              </div>
              <div className="text-[9px] text-white/50 uppercase tracking-wider mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* System modules */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400/70 mb-3">System Modules</div>
        <div className="grid grid-cols-2 gap-2">
          {modules.map(m => (
            <div key={m.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <span className={`h-7 w-7 rounded-lg ${m.color} grid place-items-center flex-shrink-0`}>
                <m.icon className="h-3.5 w-3.5 text-white" />
              </span>
              <span className="text-[11px] font-medium text-white/80 leading-tight">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* System status */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400/70 mb-3">System Status</div>
        <div className="space-y-2">
          {[
            { label: "E-Procurement Platform", status: "Operational", ok: true },
            { label: "AI Analysis Engine",     status: "Operational", ok: true },
            { label: "Payment Gateway",        status: "Operational", ok: true },
            { label: "Document Vault",         status: "Operational", ok: true },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/8">
              <span className="text-[11px] text-white/70">{s.label}</span>
              <span className={`flex items-center gap-1.5 text-[10px] font-semibold ${s.ok ? "text-white" : "text-red-500"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${s.ok ? "bg-white animate-pulse" : "bg-red-500"}`} />
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ministries quick list */}
      <div className="flex-1 min-h-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400/70 mb-3">
          Ministries ({ZW_MINISTRIES.length})
        </div>
        <div
          className="space-y-1 overflow-y-auto max-h-[200px] pr-1"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 #0F172A" }}
        >
          {ZW_MINISTRIES.map(m => (
            <div key={m.id} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-white/8 transition-colors">
              <span className="h-5 w-5 rounded-md bg-[#0F172A] grid place-items-center flex-shrink-0">
                <Landmark className="h-2.5 w-2.5 text-white" />
              </span>
              <span className="text-[11px] text-white/70 truncate flex-1">{m.name.replace("Ministry of ", "")}</span>
              <span className="text-[9px] text-slate-400/50 font-mono flex-shrink-0">{m.code}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Procurement workflow roles added to every department
const PROCUREMENT_WORKFLOW_ROLES: ZWRole[] = [
  { title: "Chief Procurement Officer (CPO)",    level: "Executive", count: 1 },
  { title: "Procurement Officer",                level: "Senior",    count: 4 },
  { title: "Initiator",                          level: "Officer",   count: 6 },
  { title: "Approver",                           level: "Senior",    count: 3 },
  { title: "Authorizer",                         level: "Senior",    count: 2 },
  { title: "Adjudicator / Adjudication Board",   level: "Executive", count: 1 },
  { title: "Evaluator",                          level: "Officer",   count: 5 },
  { title: "Oversight / Auditor",                level: "Senior",    count: 2 },
  { title: "Bid Committee Member",               level: "Officer",   count: 4 },
  { title: "Contract Manager",                   level: "Senior",    count: 2 },
];

// ─── Interactive hierarchy selector (Ministry → Department → Role) ────────────
type HierarchySelection = { ministryId: string; departmentId: string; roleTitle: string };

function GovHierarchySelector({
  value,
  onChange,
  onClose,
}: {
  value: HierarchySelection;
  onChange: (v: HierarchySelection) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [openMin, setOpenMin] = useState<string | null>(value.ministryId || null);
  const [openDept, setOpenDept] = useState<string | null>(value.departmentId || null);

  const filtered = search.length > 1
    ? ZW_MINISTRIES.map(m => ({
        ...m,
        departments: m.departments.map(d => ({
          ...d,
          roles: d.roles.filter(r =>
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            m.name.toLowerCase().includes(search.toLowerCase())
          ),
        })).filter(d => d.roles.length > 0),
      })).filter(m => m.departments.length > 0)
    : ZW_MINISTRIES;

  const selectRole = (ministryId: string, departmentId: string, roleTitle: string) => {
    onChange({ ministryId, departmentId, roleTitle });
    onClose();
  };

  return (
    <div className="bg-white rounded-2xl border border-black/10 shadow-xl p-4 w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-black">Select Role from Hierarchy</span>
        <button onClick={onClose} className="text-black/30 hover:text-black"><X className="h-4 w-4" /></button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search ministries, departments, roles…"
          className="w-full h-9 pl-9 pr-8 rounded-xl border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 bg-white" />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* President node — selectable */}
      <button
        onClick={() => selectRole("presidency", "opc-cabinet", "President / Head of State")}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border mb-2 transition-all text-left
          ${value.ministryId === "presidency" && value.roleTitle === "President / Head of State"
            ? "bg-slate-50 border-slate-200 ring-1 ring-[#0F172A]"
            : "bg-slate-50 border-slate-200 hover:border-slate-200 hover:bg-slate-100"}`}
      >
        <Crown className="h-4 w-4 text-slate-600 flex-shrink-0" />
        <div className="flex-1">
          <span className="text-xs font-semibold text-[#0F172A] block">President / Head of State</span>
          <span className="text-[9px] text-slate-600">Office of the President and Cabinet · OPC</span>
        </div>
        {value.ministryId === "presidency" && value.roleTitle === "President / Head of State" && (
          <Star className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />
        )}
      </button>

      <div className="max-h-[48vh] overflow-y-auto space-y-0.5 pr-1">
        {filtered.map(ministry => (
          <div key={ministry.id}>
            <button
              onClick={() => setOpenMin(openMin === ministry.id ? null : ministry.id)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left"
            >
              <span className="h-6 w-6 rounded-lg bg-[#0F172A] grid place-items-center flex-shrink-0">
                <Landmark className="h-3 w-3 text-white" />
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-black block truncate">{ministry.name}</span>
                <span className="text-[9px] text-black/40">{ministry.code} · {ministry.departments.length} depts</span>
              </div>
              <ChevronRight className={`h-3.5 w-3.5 text-black/25 flex-shrink-0 transition-transform ${openMin === ministry.id ? "rotate-90" : ""}`} />
            </button>
            {openMin === ministry.id && (
              <div className="ml-4 pl-3 border-l border-black/8 space-y-0.5 mb-1">
                {/* CPO pinned at top of each ministry — selectable */}
                <button
                  onClick={() => selectRole(ministry.id, `${ministry.id}-cpo`, "Chief Procurement Officer (CPO)")}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all text-left
                    ${value.ministryId === ministry.id && value.departmentId === `${ministry.id}-cpo`
                      ? "bg-[#0F172A] text-white border-slate-200"
                      : "bg-slate-50 border-slate-200 hover:bg-[#0F172A] hover:text-white hover:border-slate-200"}`}
                >
                  <Shield className={`h-3.5 w-3.5 flex-shrink-0 ${value.ministryId === ministry.id && value.departmentId === `${ministry.id}-cpo` ? "text-white" : "text-[#0F172A]"}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold block truncate">Chief Procurement Officer (CPO)</span>
                    <span className={`text-[9px] truncate block ${value.ministryId === ministry.id && value.departmentId === `${ministry.id}-cpo` ? "text-white/70" : "text-[#0F172A]"}`}>
                      {ministry.cpo}
                    </span>
                  </div>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-slate-100 text-[#0F172A] flex-shrink-0">Executive</span>
                </button>

                {ministry.departments.map(dept => (
                  <div key={dept.id}>
                    <button
                      onClick={() => setOpenDept(openDept === dept.id ? null : dept.id)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left"
                    >
                      <span className="h-5 w-5 rounded-md bg-[#0F172A] grid place-items-center flex-shrink-0">
                        <Building2 className="h-2.5 w-2.5 text-white" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-medium text-black truncate block">{dept.name}</span>
                        <span className="text-[9px] text-black/40">{dept.code} · {dept.roles.length} roles</span>
                      </div>
                      <ChevronRight className={`h-3 w-3 text-black/25 flex-shrink-0 transition-transform ${openDept === dept.id ? "rotate-90" : ""}`} />
                    </button>
                    {openDept === dept.id && (
                      <div className="ml-4 pl-2.5 border-l border-black/8 space-y-0.5 mb-1">
                        {/* Departmental roles */}
                        {dept.roles.length > 0 && (
                          <div className="px-2 py-1 text-[9px] font-bold text-black/35 uppercase tracking-wider">Departmental Roles</div>
                        )}
                        {dept.roles.map(role => (
                          <button
                            key={`dept-${role.title}`}
                            onClick={() => selectRole(ministry.id, dept.id, role.title)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left group
                              ${value.ministryId === ministry.id && value.departmentId === dept.id && value.roleTitle === role.title
                                ? "bg-black text-white"
                                : "hover:bg-black hover:text-white"}`}
                          >
                            <Users className="h-3 w-3 text-black/30 group-hover:text-white flex-shrink-0" />
                            <span className="text-[10.5px] text-black/65 group-hover:text-white truncate flex-1">{role.title}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 
                              ${role.level === "Executive" ? "bg-slate-100 text-[#0F172A] group-hover:bg-[#0F172A] group-hover:text-white" :
                                role.level === "Senior" ? "bg-slate-100 text-[#0F172A] group-hover:bg-[#0F172A] group-hover:text-white" :
                                "bg-gray-100 text-gray-600 group-hover:bg-gray-600 group-hover:text-white"}`}>
                              {role.level}
                            </span>
                          </button>
                        ))}
                        {/* Procurement workflow roles */}
                        <div className="px-2 py-1 mt-1 text-[9px] font-bold text-[#0F172A] uppercase tracking-wider border-t border-black/8">Procurement Roles</div>
                        {PROCUREMENT_WORKFLOW_ROLES.map(role => (
                          <button
                            key={`proc-${role.title}`}
                            onClick={() => selectRole(ministry.id, dept.id, role.title)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left group
                              ${value.ministryId === ministry.id && value.departmentId === dept.id && value.roleTitle === role.title
                                ? "bg-[#0F172A] text-white"
                                : "hover:bg-[#0F172A] hover:text-white"}`}
                          >
                            <Shield className="h-3 w-3 text-slate-400 group-hover:text-white flex-shrink-0" />
                            <span className="text-[10.5px] text-black/65 group-hover:text-white truncate flex-1">{role.title}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 
                              ${role.level === "Executive" ? "bg-slate-100 text-[#0F172A] group-hover:bg-[#0F172A] group-hover:text-white" :
                                role.level === "Senior" ? "bg-slate-100 text-[#0F172A] group-hover:bg-[#0F172A] group-hover:text-white" :
                                "bg-slate-100 text-[#0F172A] group-hover:bg-[#0F172A] group-hover:text-white"}`}>
                              {role.level}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-8 text-center text-xs text-black/40">No results for "{search}"</div>
        )}
      </div>
    </div>
  );
}

// ─── Supplier / Company Portal ────────────────────────────────────────────────
function PublicLogin({ onBack, initialMode = "login", isGuest = false }: { onBack: () => void; initialMode?: "login" | "register"; isGuest?: boolean }) {
  const { loginPublic } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "",
    businessReg: "", taxId: "", password: "", confirm: "",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!form.email || !form.password) { setError("Email and password are required."); return; }
    if (mode === "register") {
      if (!form.name || !form.company) { setError("Full name and company name are required."); return; }
      if (!form.phone) { setError("Phone number is required."); return; }
      if (!form.businessReg) { setError("Business Registration Number is required."); return; }
      if (!form.taxId) { setError("Tax Identification Number is required."); return; }
      if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    }
    setLoading(true);
    setTimeout(() => {
      loginPublic(form.email, form.name || form.email.split("@")[0], form.company || (isGuest ? "Guest User" : "Company"));
      seedIfEmpty(form.email);
      if (isGuest) {
        navigate("/reports-complaints");
      } else {
        navigate("/supplier-portal");
      }
    }, 600);
  };

  const Field = ({ label, icon: Icon, name, type = "text", placeholder, required = false }: {
    label: string; icon: React.ElementType; name: string; type?: string; placeholder: string; required?: boolean;
  }) => (
    <div>
      <label className="text-xs font-medium text-black/50 uppercase tracking-wider">{label}{required && " *"}</label>
      <div className="relative mt-1">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
        <input type={type} value={(form as Record<string, string>)[name]}
          onChange={e => set(name, e.target.value)} placeholder={placeholder}
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20" />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-[#0F172A] grid place-items-center flex-shrink-0">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-semibold text-black">Supplier Portal</div>
          <div className="text-xs text-black/50">Browse tenders, bid, and track your applications</div>
        </div>
      </div>

      <div className="flex rounded-xl bg-black/5 p-1 mb-5">
        {(["login", "register"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? "bg-white text-black shadow-sm" : "text-black/50 hover:text-black"}`}>
            {m === "login" ? "Sign In" : "Register"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "register" && (
          <>
            <Field label="Full Name" icon={User} name="name" placeholder="John Banda" required />
            <Field label="Company Name" icon={Briefcase} name="company" placeholder="Highveld Engineering (Pvt) Ltd" required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Email" icon={Mail} name="email" type="email" placeholder="you@company.com" required />
              <Field label="Phone Number" icon={Phone} name="phone" placeholder="+263 77 000 0000" required />
            </div>
            <Field label="Business Registration Number" icon={Star} name="businessReg" placeholder="BR-2024-XXXXXX" required />
            <Field label="Tax Identification Number" icon={Shield} name="taxId" placeholder="TIN-XXXXXXXXX" required />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Password *</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                  <input type={showPwd ? "text" : "password"} value={form.password}
                    onChange={e => set("password", e.target.value)} placeholder="••••••••"
                    className="w-full h-10 pl-9 pr-9 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Confirm *</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                  <input type="password" value={form.confirm}
                    onChange={e => set("confirm", e.target.value)} placeholder="••••••••"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20" />
                </div>
              </div>
            </div>
          </>
        )}
        {mode === "login" && (
          <>
            <Field label="Email" icon={Mail} name="email" type="email" placeholder="you@company.com" required />
            <div>
              <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Password *</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                <input type={showPwd ? "text" : "password"} value={form.password}
                  onChange={e => set("password", e.target.value)} placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-10 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </>
        )}
        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full h-11 rounded-xl bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#0F172A] disabled:opacity-50 flex items-center justify-center gap-2 mt-1">
          {loading ? "Please wait…" : <><Building2 className="h-4 w-4" /> {mode === "login" ? "Sign In" : "Create Account"}</>}
        </button>
      </form>
    </div>
  );
}

// ─── E-Recruitment Login (navigates to /e-recruitment portal) ────────────────
function ERecruitmentLogin({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { loginWithDetails } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [ministry, setMinistry] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!email.trim() || !password.trim()) { setError("Email and password are required."); return; }
    if (mode === "register" && !fullName.trim()) { setError("Full name is required."); return; }
    setLoading(true);
    setTimeout(() => {
      loginWithDetails({
        role: "hr_officer",
        name: mode === "register" ? fullName : email.split("@")[0].replace(/[._]/g," ").replace(/\b\w/g, c => c.toUpperCase()),
        email,
        department: "Human Resources",
        entity: ministry || "Government",
      });
      navigate("/e-recruitment");
    }, 500);
  };

  return (
    <div className="w-full max-w-md">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-[#0F172A] grid place-items-center flex-shrink-0">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-semibold text-black">E-Recruitment</div>
          <div className="text-xs text-black/50">Government HR management & job applications portal</div>
        </div>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5">
        <p className="text-xs text-[#0F172A]">
          All government vacancies are applied for using the E-Recruitment portal. Applies to all government workers, prospective employees, new employees and current employees.
        </p>
      </div>
      <div className="flex rounded-xl bg-black/5 p-1 mb-5">
        {(["login","register"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode===m ? "bg-white text-black shadow-sm" : "text-black/50 hover:text-black"}`}>
            {m === "login" ? "Sign In" : "Create Profile"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "register" && (
          <>
            <div>
              <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Full Name *</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Moyo"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Employee No.</label>
                <div className="relative mt-1">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                  <input value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="EMP-XXXXX"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Ministry</label>
                <div className="relative mt-1">
                  <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                  <input value={ministry} onChange={e => setMinistry(e.target.value)} placeholder="Ministry…"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20" />
                </div>
              </div>
            </div>
          </>
        )}
        <div>
          <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Work Email *</label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@gov.zw"
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Password *</label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
            <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full h-10 pl-9 pr-9 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black">
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full h-11 rounded-xl bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#0F172A] disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? "Please wait…" : <><Users className="h-4 w-4" /> {mode === "login" ? "Access E-Recruitment" : "Create Profile"}</>}
        </button>
      </form>
    </div>
  );
}

// ─── Government Staff Registration Form ──────────────────────────────────────
// ─── Simple Role Selector with Sign In + Register ────────────────────────────
function RoleSelectForm({ onBack }: { onBack: () => void }) {
  const { loginWithDetails } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<typeof ALL_ROLES[0] | null>(null);
  const [mode, setMode] = useState<"signin" | "register">("signin");

  // ── Shared state ──────────────────────────────────────────────────────
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [showCfm, setShowCfm]   = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // ── Register-only fields ──────────────────────────────────────────────
  const [fullName, setFullName]         = useState("");
  const [phone, setPhone]               = useState("");
  const [employeeId, setEmployeeId]     = useState("");
  const [ministry, setMinistry]         = useState("");
  const [department, setDepartment]     = useState("");

  const filtered = ALL_ROLES.filter(r =>
    r.label.toLowerCase().includes(search.toLowerCase()) ||
    r.desc.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setEmail(""); setPassword(""); setConfirm(""); setError("");
    setFullName(""); setPhone(""); setEmployeeId(""); setMinistry(""); setDepartment("");
  };

  // ── Sign In submit ────────────────────────────────────────────────────
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!email.trim())    { setError("Work email is required."); return; }
    if (!password.trim()) { setError("Password is required."); return; }
    setLoading(true);
    setTimeout(() => {
      loginWithDetails({
        role: selectedRole!.role,
        name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        email,
        department: department || selectedRole!.label,
        entity: ministry || "Government of Zimbabwe",
      });
      navigate("/dashboard");
    }, 500);
  };

  // ── Register submit ───────────────────────────────────────────────────
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!fullName.trim())    { setError("Full name is required."); return; }
    if (!email.trim())       { setError("Work email is required."); return; }
    if (!phone.trim())       { setError("Phone number is required."); return; }
    if (!ministry.trim())    { setError("Ministry / Entity is required."); return; }
    if (!password.trim())    { setError("Password is required."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    setTimeout(() => {
      loginWithDetails({
        role: selectedRole!.role,
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        department: department || selectedRole!.label,
        entity: ministry || "Government of Zimbabwe",
      });
      navigate("/dashboard");
    }, 600);
  };

  // ── Credential / Register step (after role chosen) ────────────────────
  if (selectedRole) {
    return (
      <div className="w-full max-w-md">
        {/* Back */}
        <button onClick={() => { setSelectedRole(null); resetForm(); }}
          className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black mb-5 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to roles
        </button>

        {/* Selected role badge */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-primary/20 bg-primary/5 mb-5">
          <div className={`h-11 w-11 rounded-xl ${selectedRole.color} grid place-items-center flex-shrink-0`}>
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-black truncate">{selectedRole.label}</div>
            <div className="text-xs text-black/50 truncate">{selectedRole.desc}</div>
          </div>
          <button onClick={() => { setSelectedRole(null); resetForm(); }}
            className="text-black/25 hover:text-black transition-colors flex-shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sign In / Register tabs */}
        <div className="flex rounded-xl bg-black/5 p-1 mb-5">
          {(["signin", "register"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                mode === m ? "bg-white text-black shadow-sm" : "text-black/45 hover:text-black"
              }`}>
              {m === "signin" ? "Sign In" : "New Registration"}
            </button>
          ))}
        </div>

        {/* ── SIGN IN FORM ── */}
        {mode === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Work Email *</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="name@gov.zw" autoFocus
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/15" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Password *</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                <input type={showPwd ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-10 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/15" />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />{error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full h-10 rounded-xl bg-gray-950 text-white text-sm font-semibold hover:bg-gray-900 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? "Signing in…" : <><Shield className="h-4 w-4" /> Sign In as {selectedRole.label}</>}
            </button>
            <p className="text-center text-xs text-black/40 pt-1">
              New here?{" "}
              <button type="button" onClick={() => { setMode("register"); setError(""); }}
                className="text-primary font-medium hover:underline">
                Register here
              </button>
            </p>
          </form>
        )}

        {/* ── REGISTER FORM ── */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-3">
            {/* Full Name */}
            <div>
              <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Full Name *</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Tendai Moyo" autoFocus
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/15" />
              </div>
            </div>

            {/* Email + Phone row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Work Email *</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="name@gov.zw"
                    className="w-full h-10 pl-9 pr-2 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/15" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Phone *</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                  <input value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+263 77 000 0000"
                    className="w-full h-10 pl-9 pr-2 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/15" />
                </div>
              </div>
            </div>

            {/* Employee ID */}
            <div>
              <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Employee / Staff ID</label>
              <div className="relative mt-1">
                <Star className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                <input value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                  placeholder="e.g. GOV-2024-00123"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/15" />
              </div>
            </div>

            {/* Ministry + Department row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Ministry / Entity *</label>
                <div className="relative mt-1">
                  <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                  <input value={ministry} onChange={e => setMinistry(e.target.value)}
                    placeholder="e.g. Ministry of Health"
                    className="w-full h-10 pl-9 pr-2 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/15" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Department</label>
                <div className="relative mt-1">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                  <input value={department} onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. Procurement"
                    className="w-full h-10 pl-9 pr-2 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/15" />
                </div>
              </div>
            </div>

            {/* Role display (read-only) */}
            <div>
              <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Assigned Role</label>
              <div className="mt-1 h-10 px-3 rounded-xl border border-black/10 bg-black/3 flex items-center gap-2 text-sm text-black/60">
                <Shield className="h-4 w-4 text-black/30" />
                {selectedRole.label}
              </div>
            </div>

            {/* Password + Confirm row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Password *</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                  <input type={showPwd ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="Min 6 chars"
                    className="w-full h-10 pl-9 pr-8 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/15" />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-black/30 hover:text-black">
                    {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Confirm *</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
                  <input type={showCfm ? "text" : "password"} value={confirm}
                    onChange={e => setConfirm(e.target.value)} placeholder="Repeat password"
                    className="w-full h-10 pl-9 pr-8 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/15" />
                  <button type="button" onClick={() => setShowCfm(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-black/30 hover:text-black">
                    {showCfm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-10 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? "Creating account…" : <><Shield className="h-4 w-4" /> Register as {selectedRole.label}</>}
            </button>
            <p className="text-center text-xs text-black/40 pt-1">
              Already registered?{" "}
              <button type="button" onClick={() => { setMode("signin"); setError(""); }}
                className="text-primary font-medium hover:underline">
                Sign in
              </button>
            </p>
          </form>
        )}
      </div>
    );
  }

  // ── Role picker step ──────────────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-black mb-1" style={{ letterSpacing: "-0.02em" }}>
        Select Your Role
      </h1>
      <p className="text-sm text-black/50 mb-6">
        Choose your government role to access the appropriate dashboard
      </p>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search roles..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-black/10 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/10 shadow-sm"
        />
      </div>

      {/* Role grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
        {filtered.map(role => (
          <button
            key={role.role}
            onClick={() => { setSelectedRole(role); resetForm(); setMode("signin"); }}
            className="flex items-center gap-3 p-4 rounded-xl border border-black/8 bg-white hover:border-primary/40 hover:shadow-md transition-all text-left group"
          >
            <div className={`h-10 w-10 rounded-xl ${role.color} grid place-items-center flex-shrink-0`}>
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-black group-hover:text-primary transition-colors truncate">
                {role.label}
              </div>
              <div className="text-xs text-black/45 truncate">{role.desc}</div>
            </div>
            <ChevronRight className="h-4 w-4 text-black/20 group-hover:text-primary flex-shrink-0 transition-colors" />
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 py-10 text-center text-black/35 text-sm">
            No roles match "{search}"
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Government Staff Form (full login with credentials) ──────────────────────
function GovStaffForm({ onBack, redirectTo = "/dashboard" }: { onBack: () => void; redirectTo?: string }) {
  const { loginWithDetails, login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "", ministry: "",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (mode === "register") {
      const errors: string[] = [];
      if (!form.name) errors.push("Full name is required.");
      if (!form.phone) errors.push("Phone number is required.");
      if (!form.email) errors.push("Work email is required.");
      if (!form.ministry) errors.push("Ministry / Entity is required.");
      if (!form.password) errors.push("Password is required.");
      if (form.password && form.password !== form.confirm) errors.push("Passwords do not match.");
      if (errors.length > 0) { setError(errors.join(" ")); return; }
    } else {
      // Sign In — only email + password required, no role selection
      const errors: string[] = [];
      if (!form.email) errors.push("Email is required.");
      if (!form.password) errors.push("Password is required.");
      if (errors.length > 0) { setError(errors.join(" ")); return; }
    }
    setLoading(true);
    setTimeout(() => {
      if (mode === "login") {
        // Credentials-only login — role is determined server-side from account
        const success = login(form.email, form.password);
        if (!success) {
          setLoading(false);
          setError("Invalid email or password. Please check your credentials and try again.");
          return;
        }
      } else {
        // Register mode — default role to procurement_officer; actual role assigned after approval
        const resolvedRole = ALL_ROLES.find(r => r.role === "procurement_officer") ?? ALL_ROLES[5];
        loginWithDetails({
          role: resolvedRole.role,
          name: form.name || form.email.split("@")[0],
          email: form.email,
          phone: form.phone,
          department: form.ministry || "Government of Zimbabwe",
          entity: form.ministry || "Government of Zimbabwe",
        });
      }
      seedIfEmpty(form.email);
      setLoading(false);
      navigate(redirectTo);
    }, 600);
  };

  return (
    <div className="w-full max-w-lg">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl grid place-items-center flex-shrink-0" style={{ background: "#0d1a2d" }}>
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">Government Staff Portal</div>
          <div className="text-xs text-gray-500">Sign in with your government credentials</div>
        </div>
      </div>

      <div className="flex rounded-xl bg-black/5 p-1 mb-5">
        {(["login", "register"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? "bg-white text-gray-900 shadow-sm" : "text-black/50 hover:text-black"}`}>
            {m === "login" ? "Sign In" : "Register"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "register" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Full Name *</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="T. Moyo"
                  className="w-full h-9 pl-8 pr-2 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 bg-white" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Phone Number *</label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
                <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+263 77 000 0000"
                  className="w-full h-9 pl-8 pr-2 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 bg-white" />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Work Email *</label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="name@gov.zw"
              className="w-full h-9 pl-8 pr-2 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 bg-white" />
          </div>
        </div>

        {/* Ministry selector — shown for REGISTER only */}
        {mode === "register" && (
          <div>
            <label className="text-xs font-medium text-black/50 uppercase tracking-wider">
              Ministry / Entity *
            </label>
            <div className="relative mt-1">
              <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30 pointer-events-none" />
              <select
                value={form.ministry ?? ""}
                onChange={e => set("ministry", e.target.value)}
                className="w-full h-9 pl-8 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 bg-white appearance-none"
              >
                <option value="" disabled>Select ministry…</option>
                {ZW_MINISTRIES.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Password *</label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
            <input type={showPwd ? "text" : "password"} value={form.password}
              onChange={e => set("password", e.target.value)} placeholder="••••••••"
              className="w-full h-9 pl-8 pr-10 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 bg-white" />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black">
              {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {mode === "register" && (
          <div>
            <label className="text-xs font-medium text-black/50 uppercase tracking-wider">Confirm Password *</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
              <input type="password" value={form.confirm}
                onChange={e => set("confirm", e.target.value)} placeholder="••••••••"
                className="w-full h-9 pl-8 pr-2 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 bg-white" />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3 font-medium shadow-sm">
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full h-11 rounded-xl text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
          style={{ background: "#0d1a2d" }}
          onMouseEnter={e => !loading && ((e.currentTarget as HTMLButtonElement).style.background = "#162032")}
          onMouseLeave={e => !loading && ((e.currentTarget as HTMLButtonElement).style.background = "#0d1a2d")}
        >
          {loading ? "Please wait…" : <><Shield className="h-4 w-4" /> {mode === "login" ? "Sign In" : "Create Account"}</>}
        </button>
      </form>
    </div>
  );
}

// ─── Applications Portal modules ─────────────────────────────────────────────
const APP_MODULES = [
  { key: "government-services",        label: "Government Services",          icon: Landmark,   color: "bg-[#0F172A]",    desc: "Apply for licensing, permits, certificates. Track progress at every stage.",            path: "/applications/government-services" },
  { key: "employment-services",        label: "Employment Services",          icon: Briefcase,  color: "bg-[#0F172A]",  desc: "Apply for government jobs, promotions and transfers. Build your profile.",               path: "/applications/employment-services" },
  { key: "annual-returns-companies",   label: "Annual Returns — Companies",   icon: Building2,  color: "bg-[#0F172A]", desc: "File annual company returns, update profile and attach updated documents.",              path: "/applications/annual-returns-companies" },
  { key: "annual-returns-individuals", label: "Annual Returns — Individuals", icon: User,       color: "bg-[#0F172A]",   desc: "Declare assets, employment history, create your electronic CV.",                         path: "/applications/annual-returns-individuals" },
  { key: "opportunities",              label: "Opportunities",                icon: Star,       color: "bg-[#0F172A]",    desc: "Scholarships, employment alerts, financing and project opportunities.",                  path: "/applications/opportunities" },
  { key: "communications",             label: "Communications",               icon: Mail,       color: "bg-[#0F172A]",    desc: "Submit letters, proposals and mails to government offices. Track delivery.",             path: "/applications/communications" },
];

// ─── Entry Choice — 3 Login Tabs ─────────────────────────────────────────────
type LoginTab = "suppliers" | "applications" | "role-based";

function EntryChoice({ onPublic, onStaff, onRoleSelect }: { onPublic: () => void; onStaff: () => void; onRoleSelect: () => void }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LoginTab>("suppliers");

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-gray-900 leading-tight" style={{ letterSpacing: "-0.02em" }}>
          Artificial Intelligence Powered Electronic Government Procurement &amp; Automated Oversight Intelligence System
        </h1>
        <p className="text-xs text-gray-500 mt-2">Integrity · Public Trust · Transparency · Good Governance · Clean Procurement</p>
      </div>

      {/* 3 Tabs */}
      <div className="flex rounded-xl bg-black/5 p-1 mb-5 gap-0.5">
        {([
          { key: "suppliers",    label: "1. Suppliers" },
          { key: "applications", label: "2. Applications" },
          { key: "role-based",   label: "3. Role Based Login" },
        ] as { key: LoginTab; label: string }[]).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 px-1 rounded-lg text-[11px] font-semibold transition-all leading-tight text-center
              ${activeTab === tab.key ? "bg-white text-black shadow-sm" : "text-black/50 hover:text-black"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1 — Suppliers */}
      {activeTab === "suppliers" && (
        <div className="space-y-3">
          <button onClick={onPublic}
            className="w-full flex items-center gap-4 p-5 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 hover:border-slate-200 rounded-2xl transition-all text-left group shadow-sm hover:shadow-md">
            <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 grid place-items-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-[#0F172A]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-[#0F172A]">Supplier Portal</div>
              <div className="text-sm text-[#0F172A]/80 mt-0.5">Browse tenders · Bid · Submit applications</div>
              <div className="text-xs text-slate-600/70 mt-0.5">Sign in or register with company details</div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-[#0F172A] flex-shrink-0 transition-colors" />
          </button>
          <button onClick={onStaff}
            className="w-full flex items-center gap-3 p-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-2xl transition-all text-left group shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-gray-100 border border-gray-200 grid place-items-center flex-shrink-0">
              <Users className="h-5 w-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800">Sign in with credentials</div>
              <div className="text-xs text-gray-500 mt-0.5">Use email &amp; password</div>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 flex-shrink-0 transition-colors" />
          </button>
        </div>
      )}

      {/* Tab 2 — Applications */}
      {activeTab === "applications" && (
        <div className="space-y-2">
          <p className="text-xs text-black/50 mb-3">Select a service to register or continue. Track progress at every stage.</p>

          {/* SELECT FROM DROP DOWN LIST */}
          <div className="mb-3">
            <label className="block text-[10px] font-bold text-black/50 uppercase tracking-widest mb-1">
              SELECT FROM DROP DOWN LIST
            </label>
            <select
              className="w-full h-10 px-3 rounded-xl border border-black/15 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
              onChange={e => {
                const path = APP_MODULES.find(m => m.label === e.target.value)?.path;
                if (path) navigate(path);
              }}
              defaultValue=""
            >
              <option value="" disabled>Select a service category…</option>
              <option value="Government Services">Government Services</option>
              <option value="Employment Services">Employment Services</option>
              <option value="Annual Returns — Companies">Annual Returns — Companies</option>
              <option value="Annual Returns — Individuals">Annual Returns — Individuals</option>
              <option value="Opportunities">Opportunities</option>
              <option value="Communications">Communications</option>
            </select>
          </div>

          {APP_MODULES.map(mod => (
            <button key={mod.key} onClick={() => navigate(mod.path)}
              className="w-full flex items-center gap-3 p-3.5 bg-white hover:bg-gray-50 border border-black/10 hover:border-black/20 rounded-xl transition-all text-left group shadow-sm">
              <div className={`h-9 w-9 rounded-lg ${mod.color} grid place-items-center flex-shrink-0`}>
                <mod.icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-black">{mod.label}</div>
                <div className="text-[11px] text-black/45 mt-0.5 line-clamp-1">{mod.desc}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-black/20 group-hover:text-black/60 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Tab 3 — Role Based Login */}
      {activeTab === "role-based" && (
        <div className="space-y-3">
          <button onClick={onRoleSelect}
            className="w-full flex items-center gap-4 p-5 bg-[#0f172a] hover:bg-[#1e293b] border-2 border-[#1e3a5f] hover:border-slate-200 rounded-2xl transition-all text-left group shadow-sm hover:shadow-lg">
            <div className="h-12 w-12 rounded-xl bg-[#0F172A]/20 border border-slate-200/30 grid place-items-center flex-shrink-0">
              <Shield className="h-6 w-6 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold text-white">Government Staff Portal</div>
              <div className="text-sm text-slate-400 mt-0.5">Ministry · Department · Role access</div>
              <div className="text-xs text-white/40 mt-0.5">{ALL_ROLES.length} roles · {ZW_MINISTRIES.length} ministries</div>
            </div>
            <ArrowRight className="h-5 w-5 text-white/30 group-hover:text-white flex-shrink-0 transition-colors" />
          </button>
          <button onClick={onStaff}
            className="w-full flex items-center gap-3 p-4 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-2xl transition-all text-left group shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-gray-100 border border-gray-200 grid place-items-center flex-shrink-0">
              <Users className="h-5 w-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800">Sign in with credentials</div>
              <div className="text-xs text-gray-500 mt-0.5">Use email &amp; password</div>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 flex-shrink-0 transition-colors" />
          </button>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">← Back to home</Link>
      </div>
    </div>
  );
}

// ─── Portal Landing Screen (6 tiles from the document) ───────────────────────
function PortalLanding({ onSelect }: { onSelect: (portal: Screen) => void }) {

  const portals: { label: string; sub: string; screen: Screen; color: string; icon: React.ElementType }[] = [
    {
      label: "Applications",
      sub: "Government services, returns & opportunities",
      screen: "applications",
      color: "bg-[#0F172A]",
      icon: Briefcase,
    },
    {
      label: "Suppliers",
      sub: "Register, browse tenders & submit bids",
      screen: "public",
      color: "bg-[#0F172A]",
      icon: Building2,
    },
    {
      label: "E-Recruitment",
      sub: "Job applications & HR self-service",
      screen: "recruitment",
      color: "bg-[#0F172A]",
      icon: Users,
    },
    {
      label: "Asset Declarations",
      sub: "Public officer asset & interest declarations",
      screen: "asset-declarations",
      color: "bg-[#0F172A]",
      icon: Shield,
    },
    {
      label: "E-Procurement\nRole Based Log in",
      sub: "Government staff — select your ministry & role",
      screen: "role-select",
      color: "bg-[#0F172A]",
      icon: Shield,
    },
    {
      label: "Report Service Delivery",
      sub: "Report infrastructure & service issues",
      screen: "report-service",
      color: "bg-red-600",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="w-full max-w-lg">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 leading-snug" style={{ letterSpacing: "-0.02em" }}>
          Log in Page
        </h1>
        <p className="text-xs text-gray-400 mt-1">Select the portal you want to access</p>
      </div>

      {/* 6-tile grid — 2 columns, 3 rows */}
      <div className="grid grid-cols-2 gap-4">
        {portals.map((p) => (
          <button
            key={p.label}
            onClick={() => onSelect(p.screen)}
            className={`${p.color} hover:brightness-110 active:scale-95 transition-all rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-white shadow-md min-h-[120px] group`}
          >
            <p.icon className="h-7 w-7 text-white/80 group-hover:text-white transition-colors" />
            <div className="text-center">
              <div className="text-base font-semibold leading-snug whitespace-pre-line">{p.label}</div>
              <div className="text-[11px] text-white/70 mt-1 leading-snug hidden group-hover:block">{p.sub}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">← Back to home</Link>
      </div>
    </div>
  );
}

// ─── Main SignInPage ───────────────────────────────────────────────────────────
type Screen = "portal" | "choice" | "applications" | "public" | "staff" | "role-select" | "recruitment" | "asset-declarations" | "report-service";

export default function SignInPage() {
  const location = useLocation();
  const locationState = location.state as { screen?: Screen; mode?: "login" | "register" } | null;
  const [screen, setScreen] = useState<Screen>(locationState?.screen ?? "portal");

  return (
    <div className="page-standalone flex" style={{ background: "#f0f4f8" }}>

      {/* ── Left portal-themed panel (desktop only) ──────────────────────── */}
      <div className="hidden lg:flex lg:w-[48%] flex-col border-r border-slate-200/40" style={{ background: "#162032" }}>

        {/* Government header strip */}
        <div className="px-6 py-5 border-b-2 border-slate-200 flex-shrink-0" style={{ background: "#0d1a2d" }}>
          <Link to="/" className="block w-full">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              GOVERNMENT OF THE REPUBLIC OF ZIMBABWE
            </div>
            <div className="text-base font-bold text-white leading-snug">
              AI-Powered E-Procurement &amp; Automated Oversight Intelligence System
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
              <span className="text-[11px] text-slate-400 font-semibold">LIVE</span>
              <span className="text-[11px] text-white/40 ml-1">Integrity · Transparency · Good Governance</span>
            </div>
          </Link>
        </div>

        {/* Visual content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-5 py-5"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 #0F172A" }}>
          <GovVisualPanel />
        </div>

        <div className="px-5 py-2 border-t border-slate-200/30 flex-shrink-0" style={{ background: "#0d1a2d" }}>
          <p className="text-[10px] text-slate-400/40">© 2026 AI E-Procurement &amp; Oversight Intelligence System — Government of Zimbabwe</p>
        </div>
      </div>


      {/* ── Right content panel ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-14 overflow-y-auto" style={{ background: "#f0f4f8" }}>
        {screen === "portal" && (
          <PortalLanding onSelect={(s) => setScreen(s as Screen)} />
        )}
        {screen === "choice" && (
          <EntryChoice
            onPublic={() => setScreen("public")}
            onStaff={() => setScreen("staff")}
            onRoleSelect={() => setScreen("role-select")}
          />
        )}
        {screen === "applications" && (
          <EntryChoice
            onPublic={() => setScreen("public")}
            onStaff={() => setScreen("staff")}
            onRoleSelect={() => setScreen("role-select")}
          />
        )}
        {screen === "public" && (
          <PublicLogin onBack={() => setScreen("portal")} initialMode={locationState?.mode ?? "login"} />
        )}
        {screen === "staff" && (
          <GovStaffForm onBack={() => setScreen("portal")} />
        )}
        {screen === "role-select" && (
          <RoleSelectForm onBack={() => setScreen("portal")} />
        )}
        {screen === "recruitment" && (
          <ERecruitmentLogin onBack={() => setScreen("portal")} />
        )}
        {screen === "asset-declarations" && (
          <div className="w-full max-w-md">
            <button onClick={() => setScreen("portal")}
              className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-[#0F172A] grid place-items-center flex-shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-black">Asset Declarations</div>
                <div className="text-xs text-black/50">Public officer asset & interest declarations portal</div>
              </div>
            </div>
            <GovStaffForm onBack={() => setScreen("portal")} redirectTo="/asset-declarations" />
          </div>
        )}
        {screen === "report-service" && (
          <div className="w-full max-w-md">
            <button onClick={() => setScreen("portal")}
              className="flex items-center gap-1.5 text-sm text-black/50 hover:text-black mb-6 transition-colors">
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-red-600 grid place-items-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-black">Report Service Delivery</div>
                <div className="text-xs text-black/50">Report infrastructure & service issues (guest access)</div>
              </div>
            </div>
            <PublicLogin onBack={() => setScreen("portal")} initialMode="login" isGuest={true} />
          </div>
        )}
      </div>
    </div>
  );
}



