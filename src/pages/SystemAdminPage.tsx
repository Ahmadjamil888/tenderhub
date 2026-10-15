import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import {
  Settings, Users, Shield, Building2, Workflow, Database, Search, Plus,
  Eye, Edit, X, CheckCircle2, AlertTriangle, Lock, Key, Globe, Trash2,
  Activity, RefreshCcw, ChevronDown,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import { useAuth } from "@/lib/auth-context";

type AdminTab = "Users" | "Roles" | "Organisation" | "Workflow Config" | "Master Data" | "Security" | "Audit Logs";

const MOCK_USERS = [
  { id: "USR-001", name: "T. Moyo", email: "t.moyo@cpb.gov.zw", role: "Chief Procurement Officer", dept: "PRAZ", status: "Active", lastLogin: "2026-06-26 08:14", mfa: true },
  { id: "USR-002", name: "R. Chikwanda", email: "r.chikwanda@mof.gov.zw", role: "Finance Officer", dept: "Ministry of Finance", status: "Active", lastLogin: "2026-06-26 07:58", mfa: true },
  { id: "USR-003", name: "P. Dube", email: "p.dube@moh.gov.zw", role: "Procurement Officer", dept: "Ministry of Health", status: "Active", lastLogin: "2026-06-25 14:22", mfa: false },
  { id: "USR-004", name: "J. Banda", email: "j.banda@mot.gov.zw", role: "Project Manager", dept: "Ministry of Transport", status: "Active", lastLogin: "2026-06-26 09:01", mfa: true },
  { id: "USR-005", name: "A. Mpofu", email: "a.mpofu@zimra.gov.zw", role: "Evaluator", dept: "ZIMRA", status: "Inactive", lastLogin: "2026-06-10 11:45", mfa: false },
  { id: "USR-006", name: "S. Nkosi", email: "s.nkosi@audit.gov.zw", role: "Internal Auditor", dept: "Office of AG", status: "Active", lastLogin: "2026-06-25 16:30", mfa: true },
];

const ROLES_CONFIG = [
  { role: "System Administrator", users: 2, access: "Full System", description: "Complete system access including user management and configuration." },
  { role: "Chief Procurement Officer", users: 1, access: "Full Procurement", description: "Full procurement oversight, approvals, and executive reporting." },
  { role: "Procurement Officer", users: 48, access: "Procurement Modules", description: "Manage tenders, evaluate bids, process requisitions." },
  { role: "Finance Officer", users: 24, access: "Finance & Budget", description: "Invoice processing, payment authorisation, budget management." },
  { role: "Auditor", users: 12, access: "Audit & Compliance", description: "Full audit access, compliance reporting, fraud detection." },
  { role: "Legal Officer", users: 8, access: "Legal & Contracts", description: "Contract drafting, legal review, governance compliance." },
  { role: "Evaluation Committee", users: 35, access: "Evaluations", description: "Technical and financial bid evaluation access." },
  { role: "Supplier", users: 12847, access: "Supplier Portal", description: "Bid submission, document upload, communication." },
  { role: "Executive Management", users: 18, access: "Dashboard & Reports", description: "Executive dashboard, reports, and oversight functions." },
];

const AUDIT_LOGS = [
  { id: "AUD-001", user: "T. Moyo", role: "CPO", action: "Approved contract closure CN-2025-0312", module: "Contract Closure", ip: "197.221.x.x", timestamp: "2026-06-26 09:14:22", risk: "Low" },
  { id: "AUD-002", user: "R. Chikwanda", role: "Finance Officer", action: "Authorised payment INV-2026-4821 — USD 2,840,000", module: "Finance", ip: "197.221.x.x", timestamp: "2026-06-26 08:42:15", risk: "Medium" },
  { id: "AUD-003", user: "A. Mpofu", role: "Evaluator", action: "Failed login attempt (3rd attempt) — account locked", module: "Authentication", ip: "41.73.x.x", timestamp: "2026-06-26 07:55:40", risk: "High" },
  { id: "AUD-004", user: "System", role: "AI Engine", action: "Fraud pattern detected in Transport Ministry tenders", module: "AI Analytics", ip: "Internal", timestamp: "2026-06-26 07:30:00", risk: "Critical" },
  { id: "AUD-005", user: "P. Dube", role: "Procurement Officer", action: "Uploaded tender document for ZW-PRA-2026-00184", module: "Tender Management", ip: "197.221.x.x", timestamp: "2026-06-25 16:22:10", risk: "Low" },
];

const RISK_COLOR: Record<string, string> = {
  Low: "bg-slate-100 text-[#0F172A]", Medium: "bg-slate-100 text-[#0F172A]",
  High: "bg-slate-100 text-[#0F172A]", Critical: "bg-red-100 text-red-700",
};

export default function SystemAdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<AdminTab>("Users");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(MOCK_USERS);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "", dept: "" });

  if (user?.role !== "system_admin" && user?.role !== "cpo" && user?.role !== "minister") {
    return (
      <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="System Administration"
        process="System Administration"
        financialYear="FY2026"
        pageType="workbench"
      />
        <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
          <Lock className="h-12 w-12 text-black/20 mb-4" />
          <div className="text-lg font-semibold text-black">Access Restricted</div>
          <div className="text-sm text-black/50 mt-1">System Administration requires System Administrator or higher role.</div>
        </div>
      </AppShell>
    );
  }

  const addUser = () => {
    if (!newUser.name || !newUser.email) return;
    setUsers(prev => [{
      id: `USR-${String(prev.length + 100).padStart(3, "0")}`, ...newUser,
      status: "Active", lastLogin: "Never", mfa: false,
    }, ...prev]);
    pushNotification(`User ${newUser.name} created successfully.`, "success");
    setShowAddUser(false);
    setNewUser({ name: "", email: "", role: "", dept: "" });
  };

  const disableUser = (id: string, name: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u));
    pushNotification(`User ${name} ${users.find(u => u.id === id)?.status === "Active" ? "disabled" : "enabled"}.`, "info");
  };

  return (
    <AppShell>
      {showAddUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
              <div className="text-sm font-bold">Create New User</div>
              <button onClick={() => setShowAddUser(false)}><X className="h-4 w-4" /></button>
            </div>
            <div className="p-6 space-y-3">
              <input value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} placeholder="Full Name" className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" />
              <input value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} placeholder="Email Address" className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" />
              <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm bg-white focus:outline-none">
                <option value="">Select Role</option>
                {ROLES_CONFIG.filter(r => r.role !== "Supplier").map(r => <option key={r.role} value={r.role}>{r.role}</option>)}
              </select>
              <input value={newUser.dept} onChange={e => setNewUser(p => ({ ...p, dept: e.target.value }))} placeholder="Department / Ministry" className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none" />
              <div className="flex gap-2 pt-2">
                <button onClick={addUser} className="flex-1 h-9 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800">Create User</button>
                <button onClick={() => setShowAddUser(false)} className="h-9 px-4 rounded-lg border border-black/10 text-sm hover:bg-[#EAF1F8]">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="System Administration"
          description="Manage users, roles, organisation structure, workflow configuration, master data, and enterprise security."
          actions={
            tab === "Users" ? (
              <button onClick={() => setShowAddUser(true)} className="h-9 px-3 rounded-md bg-black text-white text-sm flex items-center gap-1.5 hover:bg-gray-800">
                <Plus className="h-4 w-4" />Create User
              </button>
            ) : undefined
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Users" value={users.length.toLocaleString()} delta="Registered accounts" />
          <KpiCard label="Active Users" value={String(users.filter(u => u.status === "Active").length)} delta="Currently active" positive />
          <KpiCard label="MFA Enabled" value={String(users.filter(u => u.mfa).length)} delta="2FA protected" positive />
          <KpiCard label="Roles Configured" value={String(ROLES_CONFIG.length)} delta="Active roles" />
        </div>

        <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
          {(["Users", "Roles", "Organisation", "Workflow Config", "Master Data", "Security", "Audit Logs"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-2.5 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>

        {tab === "Users" && (
          <Card>
            <div className="flex gap-3 p-4 border-b border-black/8">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" className="w-full h-9 pl-9 pr-4 rounded-lg border border-black/10 text-sm focus:outline-none" /></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F8F8] border-b border-black/8">
                  <tr>{["ID", "Name", "Email", "Role", "Department", "Status", "Last Login", "MFA", "Actions"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-black/50 whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())).map(u => (
                    <tr key={u.id} className="hover:bg-[#F8F8F8]/60">
                      <td className="px-4 py-3 text-xs text-black/50">{u.id}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-black">{u.name}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{u.email}</td>
                      <td className="px-4 py-3 text-xs text-black/70">{u.role}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{u.dept}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.status === "Active" ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-600"}`}>{u.status}</span></td>
                      <td className="px-4 py-3 text-xs text-black/50">{u.lastLogin}</td>
                      <td className="px-4 py-3">{u.mfa ? <CheckCircle2 className="h-4 w-4 text-slate-600" /> : <X className="h-4 w-4 text-red-400" />}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => pushNotification(`Editing user ${u.name}`, "info")} className="h-7 px-2 rounded-lg border border-black/10 text-[10px] hover:bg-[#EAF1F8] flex items-center gap-1"><Edit className="h-3 w-3" />Edit</button>
                          <button onClick={() => disableUser(u.id, u.name)} className={`h-7 px-2 rounded-lg text-[10px] ${u.status === "Active" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-slate-50 text-[#0F172A] hover:bg-slate-100"}`}>{u.status === "Active" ? "Disable" : "Enable"}</button>
                          <button onClick={() => pushNotification(`Password reset link sent to ${u.email}`, "success")} className="h-7 px-2 rounded-lg border border-black/10 text-[10px] hover:bg-[#EAF1F8]"><Key className="h-3 w-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === "Roles" && (
          <div className="space-y-3">
            {ROLES_CONFIG.map(r => (
              <Card key={r.role}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-black/5 grid place-items-center flex-shrink-0"><Shield className="h-5 w-5 text-black/40" /></div>
                    <div>
                      <div className="text-sm font-semibold text-black">{r.role}</div>
                      <div className="text-xs text-black/50 mt-0.5">{r.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-bold text-black">{r.users.toLocaleString()}</div>
                      <div className="text-[10px] text-black/40">users</div>
                    </div>
                    <span className="text-[10px] bg-black/5 text-black/60 px-2 py-1 rounded-lg">{r.access}</span>
                    <button onClick={() => pushNotification(`Editing role: ${r.role}`, "info")} className="h-8 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Edit className="h-3.5 w-3.5" />Configure</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === "Organisation" && (
          <Card>
            <CardHeader title="Organisation Hierarchy" subtitle="Configure ministries, departments, agencies, divisions, cost centres, and procurement units" />
            <div className="p-4 space-y-3">
              {[
                { level: "Level 1 — Ministries", count: 21, icon: Building2, description: "Root government ministries" },
                { level: "Level 2 — Departments", count: 284, icon: Building2, description: "Departments within ministries" },
                { level: "Level 3 — State Entities", count: 62, icon: Building2, description: "Parastatals and state enterprises" },
                { level: "Level 4 — Branches", count: 847, icon: Building2, description: "Provincial and district offices" },
                { level: "Cost Centres", count: 1284, icon: Database, description: "Budget and financial cost centres" },
                { level: "Procurement Units", count: 312, icon: Settings, description: "Registered procurement units" },
              ].map(item => (
                <div key={item.level} className="flex items-center justify-between p-4 border border-black/8 rounded-xl hover:bg-[#F8F8F8]">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-black/40" />
                    <div>
                      <div className="text-sm font-semibold text-black">{item.level}</div>
                      <div className="text-xs text-black/50">{item.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-black">{item.count.toLocaleString()}</span>
                    <button onClick={() => pushNotification(`Managing ${item.level}`, "info")} className="h-8 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800">Manage</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "Workflow Config" && (
          <Card>
            <CardHeader title="Workflow Configuration" subtitle="Configure approval levels, escalation rules, delegation rules, and notification rules — no coding required" />
            <div className="p-4 space-y-3">
              {[
                { name: "Tender Approval Workflow", stages: 5, active: true },
                { name: "Payment Authorisation Workflow", stages: 4, active: true },
                { name: "Contract Award Workflow", stages: 6, active: true },
                { name: "Contract Closure Workflow", stages: 7, active: true },
                { name: "Vendor Registration Workflow", stages: 3, active: true },
                { name: "Budget Reallocation Workflow", stages: 4, active: true },
                { name: "Variation Order Workflow", stages: 5, active: false },
              ].map(wf => (
                <div key={wf.name} className="flex items-center justify-between p-4 border border-black/8 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Workflow className="h-5 w-5 text-black/40" />
                    <div>
                      <div className="text-sm font-semibold text-black">{wf.name}</div>
                      <div className="text-xs text-black/50">{wf.stages} approval stages</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${wf.active ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-600"}`}>{wf.active ? "Active" : "Inactive"}</span>
                    <button onClick={() => pushNotification(`Editing workflow: ${wf.name}`, "info")} className="h-8 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Edit className="h-3.5 w-3.5" />Configure</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "Master Data" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[
              { name: "Procurement Categories", count: 48, icon: Database },
              { name: "Suppliers Register", count: 12847, icon: Users },
              { name: "Item Categories", count: 312, icon: Database },
              { name: "Currencies", count: 8, icon: Database },
              { name: "Tax Rates", count: 6, icon: Database },
              { name: "Budget Codes", count: 2841, icon: Database },
              { name: "Cost Centres", count: 1284, icon: Building2 },
              { name: "Procurement Methods", count: 8, icon: Settings },
              { name: "Evaluation Templates", count: 24, icon: Database },
              { name: "Contract Templates", count: 18, icon: Database },
            ].map(item => (
              <div key={item.name} className="border border-black/10 rounded-xl bg-card hover:border-black/20 cursor-pointer transition-colors" onClick={() => pushNotification(`Managing ${item.name}`, "info")}>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-black/5 rounded-xl grid place-items-center"><item.icon className="h-5 w-5 text-black/40" /></div>
                    <div>
                      <div className="text-sm font-semibold text-black">{item.name}</div>
                      <div className="text-xs text-black/50">{item.count.toLocaleString()} records</div>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-black/30 -rotate-90" />
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Security" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "MFA Adoption", value: `${Math.round((users.filter(u => u.mfa).length / users.length) * 100)}%`, desc: "of active users", icon: Shield },
                { label: "Failed Logins Today", value: "3", desc: "1 account locked", icon: AlertTriangle },
                { label: "Active Sessions", value: "142", desc: "Real-time", icon: Activity },
              ].map(s => (
                <Card key={s.label}>
                  <div className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 bg-black rounded-xl grid place-items-center"><s.icon className="h-5 w-5 text-white" /></div>
                    <div>
                      <div className="text-xl font-bold text-black">{s.value}</div>
                      <div className="text-xs text-black/50">{s.label} · {s.desc}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader title="Security Policies" />
              <div className="p-4 space-y-3">
                {[
                  { policy: "Multi-Factor Authentication", status: "Required for all users", enabled: true },
                  { policy: "Password Complexity", status: "Min 12 chars, mixed case, symbols", enabled: true },
                  { policy: "Session Timeout", status: "30 minutes inactivity", enabled: true },
                  { policy: "IP Whitelisting", status: "Government network only", enabled: false },
                  { policy: "Data Encryption at Rest", status: "AES-256 enabled", enabled: true },
                  { policy: "API Security", status: "OAuth 2.0 + JWT tokens", enabled: true },
                  { policy: "Backup & DR", status: "Daily backup, 4hr RTO", enabled: true },
                ].map(p => (
                  <div key={p.policy} className="flex items-center justify-between py-2.5 border-b border-black/5">
                    <div>
                      <div className="text-sm font-medium text-black">{p.policy}</div>
                      <div className="text-xs text-black/50">{p.status}</div>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${p.enabled ? "text-[#0F172A]" : "text-red-500"}`}>
                      {p.enabled ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      {p.enabled ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "Audit Logs" && (
          <Card>
            <CardHeader title="System Audit Log" subtitle="All user actions — immutable records (never deleted)" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F8F8] border-b border-black/8">
                  <tr>{["Log ID", "User", "Role", "Action", "Module", "IP Address", "Timestamp", "Risk"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-black/50 whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {AUDIT_LOGS.map(log => (
                    <tr key={log.id} className="hover:bg-[#F8F8F8]/60">
                      <td className="px-4 py-3 text-xs text-black/50">{log.id}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-black">{log.user}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{log.role}</td>
                      <td className="px-4 py-3 text-xs text-black max-w-[280px] truncate">{log.action}</td>
                      <td className="px-4 py-3 text-xs text-black/60">{log.module}</td>
                      <td className="px-4 py-3 text-xs font-mono text-black/50">{log.ip}</td>
                      <td className="px-4 py-3 text-xs text-black/60 whitespace-nowrap">{log.timestamp}</td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${RISK_COLOR[log.risk]}`}>{log.risk}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
