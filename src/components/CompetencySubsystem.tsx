/**
 * Competency Assessment Subsystem
 * Government of Zimbabwe · PRAZ Procurement Platform
 *
 * Six integrated layers:
 *   A. Resource Registration & Profiling
 *   B. Assessment Assignment Management
 *   C. Assessment Participation (Test-Taking)
 *   D. Assessment Scoring
 *   E. Competency Record Storage (resource-linked)
 *   F. Tender Technical Evaluation Integration
 */
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users, ClipboardList, PlayCircle, BarChart3, BadgeCheck, Link2,
  Plus, Search, ChevronRight, ChevronLeft, CheckCircle2, XCircle,
  Clock, AlertTriangle, Eye, Download, Save, Send, Lock, Shield,
  Award, Sparkles, UserPlus, FileText, RefreshCcw, Filter, Trash2,
  Building2, Phone, Mail, Calendar, Star, ArrowRight, TrendingUp,
  Edit3, Check, X,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import {
  ResourceProfile, ResourceCategory, AssessmentType, AssessmentStatus,
  AssessmentAssignment, AssessmentAttempt, AttemptAnswer, TenderResourceLink,
  CompetencyRecord, SEED_RESOURCES, SEED_ASSIGNMENTS, SEED_TENDER_LINKS,
  ASSESSMENT_META, deriveAssessmentType, getStatusColor,
  DIRECTOR_QUESTIONS, LEAD_TECH_TEAM_QUESTIONS,
  AssessmentQuestion,
} from "@/lib/competency-data";

// ─── Layer tabs ────────────────────────────────────────────────────────────────
type Layer = "resources" | "assignments" | "assessment" | "scoring" | "records" | "integration";

const LAYERS: { id: Layer; label: string; shortLabel: string; Icon: React.ElementType; description: string; route: string }[] = [
  { id: "resources",    label: "A · Resource Profiles",          shortLabel: "Resources",   Icon: Users,         description: "Register & profile directors and technical team members",         route: "/workbench/competency-assessment/resources" },
  { id: "assignments",  label: "B · Assessment Assignments",     shortLabel: "Assignments", Icon: ClipboardList, description: "Assign and track assessment status per resource",                 route: "/workbench/competency-assessment/assignments" },
  { id: "assessment",   label: "C · Assessment Participation",   shortLabel: "Take Test",   Icon: PlayCircle,    description: "Structured test-taking flow for assigned resources",              route: "/workbench/competency-assessment/assessment" },
  { id: "scoring",      label: "D · Scoring Engine",             shortLabel: "Scoring",     Icon: BarChart3,     description: "Score computation, result generation and storage",                route: "/workbench/competency-assessment/scoring" },
  { id: "records",      label: "E · Competency Records",         shortLabel: "Records",     Icon: BadgeCheck,    description: "Resource-linked official competency score records",               route: "/workbench/competency-assessment/records" },
  { id: "integration",  label: "F · Tender Evaluation Integration", shortLabel: "Integration", Icon: Link2,      description: "Competency scores feeding into tender technical evaluation",      route: "/workbench/competency-assessment/integration" },
];

// ─── Shared Styles ─────────────────────────────────────────────────────────────
const BTN_PRIMARY   = "h-8 px-4 bg-[#0f172a] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1e293b] transition-colors";
const BTN_SECONDARY = "h-8 px-3 border border-black/20 text-xs flex items-center gap-1.5 hover:bg-gray-50 transition-colors";
const BTN_SUCCESS   = "h-8 px-4 bg-[#0F172A] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#0F172A] transition-colors";
const BTN_DANGER    = "h-8 px-3 bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-red-700 transition-colors";
const INPUT_BASE    = "h-8 px-3 border border-black/15 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black/20 w-full";
const SELECT_BASE   = "h-8 px-2 border border-black/15 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-black/20";

// ─── Two-Track Identity Banner ─────────────────────────────────────────────────
// Always visible — this makes the two-track separation immediately clear to users.
function TwoTrackBanner() {
  return (
    <div className="flex-shrink-0 flex border-b border-black/10 bg-white">
      {/* Track 1 */}
      <div className="flex-1 flex items-stretch border-r-2 border-[#7c3aed]">
        <div className="w-1.5 bg-[#7c3aed] flex-shrink-0" />
        <div className="flex-1 px-3 py-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[8px] font-black text-[#7c3aed] uppercase tracking-widest bg-[#f5f3ff] px-1.5 py-0.5">Track 1</span>
            <Shield className="h-3 w-3 text-[#7c3aed]" />
          </div>
          <div className="text-[11px] font-black text-[#4c1d95]">Director Competency Assessment</div>
          <div className="text-[9px] text-black/50 mt-0.5 leading-relaxed">
            For: Company Directors · Governance, Ethics, Contract &amp; Financial Obligations
          </div>
          <div className="text-[8px] text-[#7c3aed] font-semibold mt-1">
            Score Card Criterion → 6a · Max 5 marks
          </div>
        </div>
      </div>
      {/* Track 2 */}
      <div className="flex-1 flex items-stretch">
        <div className="w-1.5 bg-[#0369a1] flex-shrink-0" />
        <div className="flex-1 px-3 py-2">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[8px] font-black text-[#0369a1] uppercase tracking-widest bg-[#e0f2fe] px-1.5 py-0.5">Track 2</span>
            <Award className="h-3 w-3 text-[#0369a1]" />
          </div>
          <div className="text-[11px] font-black text-[#0c4a6e]">Technical Engineer / Lead Technical Team Competency Assessment</div>
          <div className="text-[9px] text-black/50 mt-0.5 leading-relaxed">
            For: Technical Engineers &amp; Lead Technical Team · Execution, Quality, HSE &amp; Technical Methodology
          </div>
          <div className="text-[8px] text-[#0369a1] font-semibold mt-1">
            Score Card Criterion → 6b · Max 5 marks
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lifecycle Context Banner ──────────────────────────────────────────────────
// Shown at the top of Layer A to make the vendor-lifecycle connection explicit.
// Competency is NOT a tender-time action — it begins at vendor / resource registration.
function LifecycleContextBanner() {
  return (
    <div className="flex-shrink-0 bg-[#0F172A] text-white px-4 py-3 border-b border-white/10">
      <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
        VENDOR CAPABILITY LIFECYCLE — Where competency assessment fits
      </div>
      <div className="flex items-center gap-0 overflow-x-auto">
        {[
          { n: "1", label: "Vendor Registers", sub: "Company onboarding", done: true },
          { n: "2", label: "Resource Profiled", sub: "Directors & technical staff added", active: true },
          { n: "3", label: "Assessment Assigned", sub: "Track auto-assigned by role", done: false },
          { n: "4", label: "Assessment Completed", sub: "Resource takes their test", done: false },
          { n: "5", label: "Score Stored", sub: "Against resource profile", done: false },
          { n: "6", label: "Tender Participation", sub: "Vendor submits bid", done: false },
          { n: "7", label: "Score Used", sub: "6a & 6b auto-populated", done: false },
        ].map((s, i, arr) => (
          <div key={s.n} className="flex items-center flex-shrink-0">
            <div className={`flex flex-col items-center px-2 py-1 ${s.active ? "bg-[#2563eb]/30 ring-1 ring-[#2563eb]" : ""}`}>
              <div className={`h-5 w-5 flex items-center justify-center text-[9px] font-black flex-shrink-0 mb-0.5 ${s.active ? "bg-[#2563eb] text-white" : s.done ? "bg-[#0F172A] text-white" : "bg-white/10 text-white/50"}`}>
                {s.n}
              </div>
              <div className={`text-[8px] font-bold text-center whitespace-nowrap ${s.active ? "text-[#93c5fd]" : s.done ? "text-slate-500" : "text-white/40"}`}>{s.label}</div>
              <div className="text-[7px] text-white/25 text-center hidden sm:block">{s.sub}</div>
            </div>
            {i < arr.length - 1 && <div className="h-px w-2 bg-white/10 flex-shrink-0 mx-0.5" />}
          </div>
        ))}
      </div>
      <div className="text-[8px] text-white/40 mt-2">
        Resource competency scores are stored at the resource level (Step 5), not at the tender level.
        When resources are included in a tender team (Step 6), their pre-verified scores feed directly into criteria 6a and 6b — no new test is triggered.
      </div>
    </div>
  );
}
// ─── Gov header ────────────────────────────────────────────────────────────────
function SubsystemHeader({ activeLayer }: { activeLayer: Layer }) {
  const layer = LAYERS.find(l => l.id === activeLayer)!;
  return (
    <div className="flex-shrink-0 bg-[#0f172a] text-white px-5 py-3 flex items-start gap-3">
      <div className="h-9 w-9 bg-[#2563eb] flex items-center justify-center flex-shrink-0 mt-0.5">
        <layer.Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
          GOVERNMENT OF ZIMBABWE · PRAZ · COMPETENCY ASSESSMENT SUBSYSTEM
        </div>
        <div className="text-sm font-bold text-white">{layer.label}</div>
        <div className="text-[10px] text-white/55">{layer.description}</div>
      </div>
      {/* Two-track pill indicators */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        <div className="flex items-center gap-1.5 bg-[#4c1d95]/40 px-2 py-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[#a78bfa]" />
          <span className="text-[8px] text-[#c4b5fd] font-semibold whitespace-nowrap">Track 1 · Director</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#0c4a6e]/40 px-2 py-0.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]" />
          <span className="text-[8px] text-[#7dd3fc] font-semibold whitespace-nowrap">Track 2 · Technical</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER A — Resource Registration & Profiling
// ═══════════════════════════════════════════════════════════════════════════════
function ResourceLayer({
  resources, setResources, onAssign,
}: {
  resources: ResourceProfile[];
  setResources: React.Dispatch<React.SetStateAction<ResourceProfile[]>>;
  onAssign: (r: ResourceProfile) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<ResourceCategory | "All">("All");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const blank: Omit<ResourceProfile, "id" | "createdAt" | "updatedAt" | "competencyRecords"> = {
    fullName: "", role: "Technical Engineer", designation: "", company: "", companyId: "",
    email: "", phone: "", specialisation: "", professionalBody: "", membershipNumber: "",
    idNumber: "", status: "Active", isDirector: false, isTechnical: true,
    eligibleForAssessment: true,
  };
  const [form, setForm] = useState({ ...blank });

  const filtered = resources.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || r.fullName.toLowerCase().includes(q) || r.company.toLowerCase().includes(q) || r.email.toLowerCase().includes(q);
    const matchR = filterRole === "All" || r.role === filterRole;
    return matchQ && matchR;
  });

  const handleSave = () => {
    if (!form.fullName.trim() || !form.company.trim()) {
      pushNotification("Full Name and Company are required", "error"); return;
    }
    if (editId) {
      setResources(prev => prev.map(r => r.id === editId ? {
        ...r, ...form,
        isDirector: form.role === "Director",
        isTechnical: form.role !== "Director",
        assignedAssessmentType: deriveAssessmentType(form.role),
        updatedAt: new Date().toISOString().split("T")[0],
      } : r));
      pushNotification(`Resource profile updated: ${form.fullName}`, "success");
    } else {
      const newR: ResourceProfile = {
        ...form, id: `RES-${Date.now()}`,
        isDirector: form.role === "Director",
        isTechnical: form.role !== "Director",
        assignedAssessmentType: deriveAssessmentType(form.role),
        competencyRecords: [],
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setResources(prev => [...prev, newR]);
      pushNotification(`Resource registered: ${form.fullName}`, "success");
    }
    setShowForm(false); setEditId(null); setForm({ ...blank });
  };

  const handleEdit = (r: ResourceProfile) => {
    setForm({
      fullName: r.fullName, role: r.role, designation: r.designation,
      company: r.company, companyId: r.companyId, email: r.email, phone: r.phone,
      specialisation: r.specialisation, professionalBody: r.professionalBody ?? "",
      membershipNumber: r.membershipNumber ?? "", idNumber: r.idNumber,
      status: r.status, isDirector: r.isDirector, isTechnical: r.isTechnical,
      eligibleForAssessment: r.eligibleForAssessment,
    });
    setEditId(r.id); setShowForm(true);
  };

  const roleColors: Record<ResourceCategory, string> = {
    "Director":            "bg-[#7c3aed] text-white",
    "Technical Engineer":  "bg-[#0369a1] text-white",
    "Lead Technical Team": "bg-[#0c4a6e] text-white",
    "Other":               "bg-gray-500 text-white",
  };

  // Track helpers
  const trackLabel = (role: ResourceCategory) =>
    role === "Director" ? "Track 1 · Director" : "Track 2 · Technical";
  const trackColor = (role: ResourceCategory) =>
    role === "Director"
      ? "bg-[#f5f3ff] text-[#7c3aed] border border-[#7c3aed]/30"
      : "bg-[#e0f2fe] text-[#0369a1] border border-[#0369a1]/30";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SubsystemHeader activeLayer="resources" />
      <LifecycleContextBanner />
      <TwoTrackBanner />

      {/* Toolbar */}
      <div className="flex-shrink-0 bg-white border-b border-black/10 px-4 py-2 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/35" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search resources…"
            className="pl-8 pr-3 h-8 border border-black/15 text-xs w-full focus:outline-none focus:ring-1 focus:ring-black/20" style={{ borderRadius: 0 }} />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value as ResourceCategory | "All")}
          className={SELECT_BASE} style={{ borderRadius: 0 }}>
          <option value="All">All Roles</option>
          <option value="Director">Director</option>
          <option value="Technical Engineer">Technical Engineer</option>
          <option value="Lead Technical Team">Lead Technical Team</option>
          <option value="Other">Other</option>
        </select>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[10px] text-black/45">{filtered.length} resource{filtered.length !== 1 ? "s" : ""}</span>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ ...blank }); }}
            className={BTN_PRIMARY} style={{ borderRadius: 0 }}>
            <UserPlus className="h-3.5 w-3.5" /> Register Resource
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Resource list */}
        <div className={`flex flex-col overflow-hidden ${showForm ? "w-[55%] border-r border-black/10" : "flex-1"}`}>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center text-xs text-black/40">No resources found. Register your first resource to begin.</div>
            )}
            {filtered.map(r => {
              const latestRecord = r.competencyRecords[r.competencyRecords.length - 1];
              return (
                <div key={r.id} className="border-b border-black/6 px-4 py-3 hover:bg-[#F8FAFB] group flex items-start gap-3">
                  {/* Avatar */}
                  <div className="h-10 w-10 flex-shrink-0 bg-[#0f172a] text-white flex items-center justify-center text-xs font-bold">
                    {r.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-black">{r.fullName}</div>
                        <div className="text-[10px] text-black/55 mt-0.5">{r.designation} · {r.company}</div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 ${roleColors[r.role]}`} style={{ borderRadius: 0 }}>
                            {r.role}
                          </span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 ${trackColor(r.role)}`} style={{ borderRadius: 0 }}>
                            {trackLabel(r.role)}
                          </span>
                          {latestRecord ? (
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 flex items-center gap-1 ${latestRecord.passed ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-700"}`} style={{ borderRadius: 0 }}>
                              <BadgeCheck className="h-2.5 w-2.5" />
                              {latestRecord.passed ? `PASS ${latestRecord.percentage.toFixed(0)}%` : `FAIL ${latestRecord.percentage.toFixed(0)}%`}
                            </span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-[#0F172A] font-semibold" style={{ borderRadius: 0 }}>
                              No Assessment
                            </span>
                          )}
                          <span className="text-[9px] text-black/40 font-mono">{r.id}</span>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => handleEdit(r)}
                          className="h-7 px-2 text-[10px] bg-black/5 hover:bg-black/10 text-black flex items-center gap-1" style={{ borderRadius: 0 }}>
                          <Edit3 className="h-3 w-3" /> Edit
                        </button>
                        {!latestRecord && (
                          <button onClick={() => onAssign(r)}
                            className="h-7 px-2 text-[10px] bg-[#2563eb] text-white hover:bg-[#1d4ed8] flex items-center gap-1" style={{ borderRadius: 0 }}>
                            <ClipboardList className="h-3 w-3" /> Assign Test
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-[9px] text-black/40">
                      <span className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" />{r.email}</span>
                      <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{r.phone}</span>
                      {r.professionalBody && <span className="flex items-center gap-1"><Award className="h-2.5 w-2.5" />{r.professionalBody} {r.membershipNumber}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Registration form */}
        {showForm && (
          <div className="w-[45%] flex flex-col overflow-hidden border-l border-black/10 bg-[#F9FAFB]">
            <div className="flex-shrink-0 bg-[#0f172a] text-white px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-semibold">{editId ? "Edit Resource Profile" : "Register New Resource"}</span>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className="h-6 w-6 grid place-items-center hover:bg-white/20" style={{ borderRadius: 0 }}>
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {/* Basic fields */}
              {[
                { label: "Full Name *",        key: "fullName"      as const, type: "text"   },
                { label: "Designation / Title", key: "designation"  as const, type: "text"   },
                { label: "Company / Bidder *",  key: "company"      as const, type: "text"   },
                { label: "Company ID (VEN-)",   key: "companyId"    as const, type: "text"   },
                { label: "Email Address *",     key: "email"        as const, type: "email"  },
                { label: "Phone Number",        key: "phone"        as const, type: "text"   },
                { label: "Area of Specialisation", key: "specialisation" as const, type: "text" },
                { label: "Professional Body",   key: "professionalBody" as const, type: "text" },
                { label: "Membership Number",   key: "membershipNumber" as const, type: "text" },
                { label: "National ID Number",  key: "idNumber"     as const, type: "text"   },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-semibold text-black/60 block mb-1">{f.label}</label>
                  <input type={f.type} value={(form as unknown as Record<string, string>)[f.key] ?? ""}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className={INPUT_BASE} style={{ borderRadius: 0 }} />
                </div>
              ))}
              {/* Role dropdown */}
              <div>
                <label className="text-[10px] font-semibold text-black/60 block mb-1">Professional Category *</label>
                <select value={form.role} onChange={e => setForm(prev => ({
                  ...prev, role: e.target.value as ResourceCategory,
                  isDirector: e.target.value === "Director",
                  isTechnical: e.target.value !== "Director",
                }))} className={`${SELECT_BASE} w-full`} style={{ borderRadius: 0 }}>
                  <option value="Director">Director</option>
                  <option value="Technical Engineer">Technical Engineer</option>
                  <option value="Lead Technical Team">Lead Technical Team</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {/* Eligible checkbox */}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="eligible" checked={form.eligibleForAssessment}
                  onChange={e => setForm(prev => ({ ...prev, eligibleForAssessment: e.target.checked }))}
                  className="h-4 w-4 border-black/30" />
                <label htmlFor="eligible" className="text-xs text-black/70">Eligible for competency assessment</label>
              </div>
              <div className="text-[9px] text-black/40 bg-slate-50 border border-slate-200 px-3 py-2">
                Assessment track auto-assigned based on role:
                <br />
                <strong className={form.role === "Director" ? "text-[#7c3aed]" : "text-[#0369a1]"}>
                  {form.role === "Director"
                    ? "✦ Track 1 · Director Competency Assessment"
                    : "✦ Track 2 · Technical Engineer / Lead Technical Team Competency Assessment"}
                </strong>
              </div>
            </div>
            <div className="flex-shrink-0 border-t border-black/10 px-4 py-2 flex gap-2 bg-white">
              <button onClick={handleSave} className={BTN_SUCCESS} style={{ borderRadius: 0 }}>
                <Save className="h-3.5 w-3.5" /> {editId ? "Update Profile" : "Register Resource"}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); }} className={BTN_SECONDARY} style={{ borderRadius: 0 }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER B — Assessment Assignment Management
// ═══════════════════════════════════════════════════════════════════════════════
function AssignmentLayer({
  resources, assignments, setAssignments, selectedResourceId, setSelectedResourceId, onTakeTest,
}: {
  resources: ResourceProfile[];
  assignments: AssessmentAssignment[];
  setAssignments: React.Dispatch<React.SetStateAction<AssessmentAssignment[]>>;
  selectedResourceId: string | null;
  setSelectedResourceId: (id: string | null) => void;
  onTakeTest: (assignment: AssessmentAssignment) => void;
}) {
  const [filterStatus, setFilterStatus] = useState<AssessmentStatus | "All">("All");

  const filtered = assignments.filter(a => {
    const r = resources.find(x => x.id === a.resourceId);
    if (selectedResourceId && a.resourceId !== selectedResourceId) return false;
    if (filterStatus !== "All" && a.status !== filterStatus) return false;
    return true;
  });

  const handleAssign = (r: ResourceProfile) => {
    const existing = assignments.find(a => a.resourceId === r.id && a.status !== "Completed" && a.status !== "Failed");
    if (existing) { pushNotification(`${r.fullName} already has an active assignment`, "info"); return; }
    const newAsn: AssessmentAssignment = {
      id: `ASN-${Date.now()}`, resourceId: r.id,
      assessmentType: deriveAssessmentType(r.role),
      assignedBy: "PRAZ-Evaluator",
      assignedAt: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
      status: "Assigned",
      accessCode: `${r.role.slice(0,2).toUpperCase()}-${r.id.split("-")[1]}`,
      otpVerified: false,
    };
    setAssignments(prev => [...prev, newAsn]);
    setSelectedResourceId(null);
    pushNotification(`Assessment assigned to ${r.fullName}`, "success");
  };

  const statusBadge = (s: AssessmentStatus) => (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 ${getStatusColor(s)}`} style={{ borderRadius: 0 }}>
      {s}
    </span>
  );

  const unassigned = resources.filter(r =>
    r.eligibleForAssessment &&
    !assignments.find(a => a.resourceId === r.id && (a.status === "Assigned" || a.status === "Pending" || a.status === "In Progress" || a.status === "Completed"))
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SubsystemHeader activeLayer="assignments" />
      <TwoTrackBanner />

      {/* Quick-assign banner */}
      {unassigned.length > 0 && (
        <div className="flex-shrink-0 bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-[#0F172A] flex-shrink-0" />
          <span className="text-xs text-[#0F172A] font-semibold">{unassigned.length} resource{unassigned.length !== 1 ? "s" : ""} awaiting assignment:</span>
          <div className="flex gap-1.5 flex-wrap">
            {unassigned.slice(0, 4).map(r => (
              <button key={r.id} onClick={() => handleAssign(r)}
                className="text-[9px] bg-[#0F172A] text-white px-2 py-0.5 hover:bg-[#0F172A] flex items-center gap-1" style={{ borderRadius: 0 }}>
                <Plus className="h-2.5 w-2.5" /> {r.fullName.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex-shrink-0 bg-white border-b border-black/10 px-4 py-2 flex items-center gap-2 flex-wrap">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as AssessmentStatus | "All")}
          className={SELECT_BASE} style={{ borderRadius: 0 }}>
          <option value="All">All Statuses</option>
          {(["Assigned","Pending","In Progress","Completed","Expired","Failed","Not Assigned"] as AssessmentStatus[]).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        {selectedResourceId && (
          <button onClick={() => setSelectedResourceId(null)}
            className="h-7 px-2 text-[10px] bg-black/8 flex items-center gap-1" style={{ borderRadius: 0 }}>
            <X className="h-3 w-3" /> Clear filter
          </button>
        )}
        <span className="ml-auto text-[10px] text-black/45">{filtered.length} assignment{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Assignment table */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#0f172a] text-white">
              {["Resource", "Company", "Assessment Type", "Assigned", "Due", "Status", "Access Code", "Actions"].map(h => (
                <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold whitespace-nowrap border-r border-white/10 last:border-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-xs text-black/40">No assignments found.</td></tr>
            )}
            {filtered.map(a => {
              const r = resources.find(x => x.id === a.resourceId);
              const isOverdue = a.status !== "Completed" && a.status !== "Failed" && new Date(a.dueDate) < new Date();
              const canTake = a.status === "Assigned" || a.status === "Pending" || a.status === "In Progress";
              return (
                <tr key={a.id} className={`border-b border-black/6 hover:bg-[#F8FAFB] ${isOverdue ? "bg-red-50/50" : ""}`}>
                  <td className="px-3 py-2.5">
                    <div className="font-semibold text-black">{r?.fullName ?? "—"}</div>
                    <div className="text-[9px] text-black/45 font-mono">{a.resourceId}</div>
                  </td>
                  <td className="px-3 py-2.5 text-black/70">{r?.company ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-10 flex-shrink-0 ${a.assessmentType === "Director Competency Assessment" ? "bg-[#7c3aed]" : "bg-[#0369a1]"}`} />
                      <div>
                        <div className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 inline-block mb-0.5 ${a.assessmentType === "Director Competency Assessment" ? "bg-[#f5f3ff] text-[#7c3aed]" : "bg-[#e0f2fe] text-[#0369a1]"}`} style={{ borderRadius: 0 }}>
                          {a.assessmentType === "Director Competency Assessment" ? "Track 1 · Director" : "Track 2 · Technical"}
                        </div>
                        <div className="text-[10px] font-semibold text-black">{a.assessmentType}</div>
                        <div className="text-[9px] text-black/40">{ASSESSMENT_META[a.assessmentType]?.timeLimitMinutes} min · {ASSESSMENT_META[a.assessmentType]?.questions.length} questions</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-[10px] text-black/60 font-mono">{a.assignedAt}</td>
                  <td className={`px-3 py-2.5 text-[10px] font-mono ${isOverdue ? "text-red-600 font-bold" : "text-black/60"}`}>
                    {a.dueDate} {isOverdue && "⚠"}
                  </td>
                  <td className="px-3 py-2.5">{statusBadge(a.status)}</td>
                  <td className="px-3 py-2.5 font-mono text-[10px] text-black/55">{a.accessCode ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      {canTake && (
                        <button onClick={() => onTakeTest(a)}
                          className="h-7 px-2 text-[9px] bg-[#2563eb] text-white hover:bg-[#1d4ed8] flex items-center gap-1" style={{ borderRadius: 0 }}>
                          <PlayCircle className="h-3 w-3" /> Take
                        </button>
                      )}
                      {a.status === "Completed" && (
                        <span className="text-[9px] text-[#0F172A] flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Done
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex-shrink-0 border-t border-black/10 px-4 py-2 bg-[#F8F9FA] flex items-center gap-4 flex-wrap text-[9px] text-black/45">
        <Lock className="h-3 w-3" />
        <span>Assignments are system-managed. Status auto-updates on participation and scoring.</span>
        <span className="ml-auto">Total assigned: {assignments.length}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER C — Assessment Participation (Test-Taking Flow)
// ═══════════════════════════════════════════════════════════════════════════════

type TestPhase = "availability" | "instructions" | "otp" | "active" | "review" | "submitted";

function AssessmentLayer({
  assignment, resource, onComplete,
}: {
  assignment: AssessmentAssignment | null;
  resource: ResourceProfile | null;
  onComplete: (attempt: AssessmentAttempt) => void;
}) {
  const [phase, setPhase] = useState<TestPhase>("availability");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<AttemptAnswer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startedAt, setStartedAt] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const meta = assignment ? ASSESSMENT_META[assignment.assessmentType] : null;
  const questions: AssessmentQuestion[] = meta?.questions ?? [];

  useEffect(() => {
    if (phase === "active" && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); handleSubmit(); return 0; }
        return t - 1;
      }), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleStartTest = () => {
    setAnswers(questions.map(q => ({ questionId: q.id, selectedOptionId: null, marksAwarded: 0 })));
    setTimeLeft((meta?.timeLimitMinutes ?? 40) * 60);
    setStartedAt(new Date().toLocaleString("en-GB", { hour12: false }));
    setCurrentQ(0);
    setPhase("active");
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => prev.map(a => a.questionId === questionId ? { ...a, selectedOptionId: optionId } : a));
  };

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    // Score the answers
    const scored = answers.map(a => {
      const q = questions.find(x => x.id === a.questionId)!;
      return { ...a, marksAwarded: a.selectedOptionId === q.correctOptionId ? q.marks : 0 };
    });
    setAnswers(scored);
    const score = scored.reduce((s, a) => s + a.marksAwarded, 0);
    const maxScore = questions.reduce((s, q) => s + q.marks, 0);
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const passed = percentage >= (meta?.passPercentage ?? 70);
    const attempt: AssessmentAttempt = {
      id: `ATT-${Date.now()}`,
      assignmentId: assignment?.id ?? "",
      resourceId: resource?.id ?? "",
      assessmentType: assignment!.assessmentType,
      startedAt,
      submittedAt: new Date().toLocaleString("en-GB", { hour12: false }),
      timeLimitMinutes: meta?.timeLimitMinutes ?? 40,
      answers: scored,
      status: "Scored",
      score, maxScore, percentage, passed,
    };
    setPhase("submitted");
    onComplete(attempt);
  };

  const answeredCount = answers.filter(a => a.selectedOptionId !== null).length;

  if (!assignment || !resource) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <SubsystemHeader activeLayer="assessment" />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8">
          <PlayCircle className="h-14 w-14 text-black/15" />
          <div className="text-sm font-semibold text-black/40">No assignment selected</div>
          <div className="text-xs text-black/30 max-w-sm">Navigate to the Assignments layer and click "Take" on an assigned assessment to begin the test-taking flow.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SubsystemHeader activeLayer="assessment" />
      <TwoTrackBanner />

      {/* ── Phase: Availability screen ── */}
      {phase === "availability" && (
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-8 gap-6">
          <div className="w-full max-w-lg bg-white border border-black/10 shadow-sm">
            <div className={`text-white px-5 py-4 ${assignment.assessmentType === "Director Competency Assessment" ? "bg-[#4c1d95]" : "bg-[#0c4a6e]"}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[8px] font-black bg-white/20 px-2 py-0.5 uppercase tracking-widest">
                  {assignment.assessmentType === "Director Competency Assessment" ? "TRACK 1 · DIRECTOR" : "TRACK 2 · TECHNICAL"}
                </span>
                <span className="text-[9px] text-white/60 uppercase tracking-wider">Assessment Available</span>
              </div>
              <div className="text-sm font-bold">{assignment.assessmentType}</div>
              <div className="text-[10px] text-white/55 mt-0.5">Assigned to: {resource.fullName} · {resource.company}</div>
              <div className="text-[9px] text-white/40 mt-1 italic">{ASSESSMENT_META[assignment.assessmentType]?.audience}</div>
            </div>
            <div className="px-5 py-5 space-y-3">
              {[
                ["Resource", resource.fullName],
                ["Role", resource.role],
                ["Assessment Track", assignment.assessmentType === "Director Competency Assessment" ? "Track 1 — Director Competency Assessment" : "Track 2 — Technical Engineer / Lead Technical Team Competency Assessment"],
                ["Questions", String(questions.length)],
                ["Time Limit", `${meta?.timeLimitMinutes} minutes`],
                ["Pass Mark", `${meta?.passPercentage}%`],
                ["Score Card Criterion", ASSESSMENT_META[assignment.assessmentType]?.scorecardCriterion],
                ["Access Code", assignment.accessCode ?? "—"],
                ["Due Date", assignment.dueDate],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between border-b border-black/5 pb-2 last:border-0 gap-4">
                  <span className="text-[10px] text-black/50 font-semibold flex-shrink-0">{label}</span>
                  <span className="text-xs font-bold text-black text-right">{value}</span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <button onClick={() => setPhase("instructions")} className={`${BTN_PRIMARY} w-full justify-center`} style={{ borderRadius: 0 }}>
                <ArrowRight className="h-4 w-4" /> Proceed to Instructions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Phase: Instructions ── */}
      {phase === "instructions" && (
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-8 gap-4">
          <div className="w-full max-w-lg bg-white border border-black/10 shadow-sm">
            <div className={`text-white px-5 py-3 ${assignment.assessmentType === "Director Competency Assessment" ? "bg-[#4c1d95]" : "bg-[#0c4a6e]"}`}>
              <div className="text-[8px] font-black uppercase tracking-widest text-white/60 mb-1">
                {assignment.assessmentType === "Director Competency Assessment" ? "TRACK 1 · DIRECTOR COMPETENCY ASSESSMENT" : "TRACK 2 · TECHNICAL ENGINEER / LEAD TECHNICAL TEAM COMPETENCY ASSESSMENT"}
              </div>
              <div className="text-xs font-bold">Assessment Instructions</div>
              <div className="text-[10px] text-white/65">{assignment.assessmentType}</div>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                "This assessment consists of multiple-choice questions. Each question has one correct answer.",
                `You have ${meta?.timeLimitMinutes} minutes to complete all ${questions.length} questions.`,
                `The pass mark is ${meta?.passPercentage}%. Your score will be recorded against your competency profile immediately upon submission.`,
                "Your score will be used in the technical evaluation of tenders you are named on.",
                "Once you begin, the timer starts. Do not close the browser. Progress is auto-saved.",
                "You cannot return to the assessment once submitted. Review your answers before final submission.",
                "Identity verification (OTP) is required before the test begins.",
              ].map((line, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-black/75">
                  <span className="h-5 w-5 bg-[#0f172a] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {line}
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button onClick={() => setPhase("availability")} className={BTN_SECONDARY} style={{ borderRadius: 0 }}>
                <ChevronLeft className="h-3.5 w-3.5" /> Back
              </button>
              <button onClick={() => setPhase("otp")} className={`${BTN_PRIMARY} flex-1 justify-center`} style={{ borderRadius: 0 }}>
                I Understand — Proceed to Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Phase: OTP Verification ── */}
      {phase === "otp" && (
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-sm bg-white border border-black/10 shadow-sm">
            <div className="bg-[#0f172a] text-white px-5 py-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-400" />
              <div>
                <div className="text-xs font-bold">Identity Verification</div>
                <div className="text-[10px] text-white/55">Enter the OTP sent to {resource.email}</div>
              </div>
            </div>
            <div className="px-5 py-6 space-y-4">
              <div className="text-xs text-black/60">
                A one-time passcode has been sent to <strong>{resource.email}</strong>. For demo purposes, enter your Access Code: <strong className="font-mono">{assignment.accessCode}</strong>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-black/60 block mb-1">Enter OTP / Access Code</label>
                <input value={otpInput} onChange={e => { setOtpInput(e.target.value); setOtpError(false); }}
                  placeholder="e.g. DA-2841"
                  className={`${INPUT_BASE} text-center font-mono tracking-widest text-base ${otpError ? "border-red-400 bg-red-50" : ""}`}
                  style={{ borderRadius: 0 }} />
                {otpError && <div className="text-[10px] text-red-600 mt-1">Incorrect code. Please try again.</div>}
              </div>
              <button onClick={() => {
                if (otpInput.trim().toLowerCase() === (assignment.accessCode ?? "").toLowerCase()) {
                  setPhase("active"); handleStartTest();
                } else { setOtpError(true); }
              }} className={`${BTN_SUCCESS} w-full justify-center`} style={{ borderRadius: 0 }}>
                <Check className="h-3.5 w-3.5" /> Verify & Begin Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Phase: Active Test ── */}
      {phase === "active" && (() => {
        const q = questions[currentQ];
        const currentAnswer = answers.find(a => a.questionId === q.id);
        const pctTime = (timeLeft / ((meta?.timeLimitMinutes ?? 40) * 60)) * 100;
        return (
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Timer bar */}
            <div className={`flex-shrink-0 px-4 py-2 flex items-center gap-3 ${pctTime < 20 ? "bg-red-700" : "bg-[#0f172a]"}`}>
              <Clock className={`h-4 w-4 ${pctTime < 20 ? "text-red-200 animate-pulse" : "text-slate-400"}`} />
              <span className="text-white text-sm font-bold font-mono">{formatTime(timeLeft)}</span>
              <div className="flex-1 bg-white/15 h-2">
                <div className={`h-full transition-all ${pctTime > 40 ? "bg-slate-400" : pctTime > 20 ? "bg-slate-400" : "bg-red-400"}`}
                  style={{ width: `${pctTime}%` }} />
              </div>
              <span className="text-white/55 text-[10px]">{answeredCount}/{questions.length} answered</span>
              <button onClick={() => setPhase("review")}
                className="h-7 px-3 bg-white/15 hover:bg-white/25 text-white text-[10px] flex items-center gap-1" style={{ borderRadius: 0 }}>
                <Eye className="h-3 w-3" /> Review
              </button>
            </div>

            {/* Question */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Question navigator sidebar */}
              <div className="w-32 flex-shrink-0 bg-[#F0F4F8] border-r border-black/10 overflow-y-auto p-2">
                <div className="text-[9px] font-bold text-black/40 uppercase mb-2">Questions</div>
                <div className="grid grid-cols-4 gap-1">
                  {questions.map((q2, i) => {
                    const ans = answers.find(a => a.questionId === q2.id);
                    const isAnswered = ans?.selectedOptionId !== null;
                    return (
                      <button key={q2.id} onClick={() => setCurrentQ(i)}
                        className={`h-7 w-full text-[9px] font-bold border transition-colors
                          ${i === currentQ ? "bg-[#2563eb] text-white border-[#2563eb]"
                            : isAnswered ? "bg-[#0F172A] text-white border-slate-200"
                            : "bg-white text-black/50 border-black/15 hover:bg-gray-50"}`}
                        style={{ borderRadius: 0 }}>
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main question area */}
              <div className="flex-1 overflow-y-auto p-5">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[9px] font-bold text-black/40 uppercase tracking-wider">Question {currentQ + 1} of {questions.length}</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-black/8 text-black/55">{q.section}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 ${q.difficulty === "Hard" ? "bg-red-100 text-red-700" : q.difficulty === "Medium" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`} style={{ borderRadius: 0 }}>
                      {q.difficulty}
                    </span>
                    <span className="ml-auto text-[9px] font-bold text-black/60">{q.marks} mark{q.marks !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="text-sm font-semibold text-black mb-5 leading-relaxed">{q.questionText}</div>
                  <div className="space-y-2.5">
                    {q.options.map(opt => {
                      const selected = currentAnswer?.selectedOptionId === opt.id;
                      return (
                        <button key={opt.id} onClick={() => handleAnswer(q.id, opt.id)}
                          className={`w-full text-left px-4 py-3 border text-xs font-medium transition-all flex items-center gap-3
                            ${selected ? "border-[#2563eb] bg-[#2563eb]/10 text-[#1d4ed8] font-semibold" : "border-black/15 bg-white text-black hover:border-black/30 hover:bg-[#F8FAFB]"}`}
                          style={{ borderRadius: 0 }}>
                          <span className={`h-6 w-6 flex-shrink-0 border flex items-center justify-center text-[10px] font-bold
                            ${selected ? "bg-[#2563eb] border-[#2563eb] text-white" : "border-black/25 text-black/55"}`}
                            style={{ borderRadius: "50%" }}>
                            {opt.id.toUpperCase()}
                          </span>
                          {opt.text}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <button onClick={() => setCurrentQ(q => Math.max(0, q - 1))} disabled={currentQ === 0}
                      className={`${BTN_SECONDARY} disabled:opacity-40`} style={{ borderRadius: 0 }}>
                      <ChevronLeft className="h-3.5 w-3.5" /> Previous
                    </button>
                    {currentQ < questions.length - 1 ? (
                      <button onClick={() => setCurrentQ(q => q + 1)} className={BTN_PRIMARY} style={{ borderRadius: 0 }}>
                        Next <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button onClick={() => setPhase("review")} className={BTN_SUCCESS} style={{ borderRadius: 0 }}>
                        <Eye className="h-3.5 w-3.5" /> Review & Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Phase: Review before submit ── */}
      {phase === "review" && (
        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-2xl mx-auto">
            <div className="text-sm font-bold text-black mb-4">Review Your Answers</div>
            <div className="space-y-2 mb-6">
              {questions.map((q, i) => {
                const ans = answers.find(a => a.questionId === q.id);
                const selectedOpt = q.options.find(o => o.id === ans?.selectedOptionId);
                return (
                  <div key={q.id} className={`border px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-gray-50 ${ans?.selectedOptionId ? "border-black/15" : "border-slate-200 bg-slate-50"}`}
                    onClick={() => { setCurrentQ(i); setPhase("active"); }} style={{ borderRadius: 0 }}>
                    <span className={`h-6 w-6 flex-shrink-0 text-[10px] font-bold flex items-center justify-center border
                      ${ans?.selectedOptionId ? "bg-[#0F172A] text-white border-slate-200" : "bg-slate-400 text-white border-slate-200"}`} style={{ borderRadius: "50%" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold text-black truncate">{q.questionText}</div>
                      <div className="text-[10px] text-black/50 mt-0.5">
                        {selectedOpt ? `Selected: ${selectedOpt.id.toUpperCase()}. ${selectedOpt.text}` : "⚠ Not answered"}
                      </div>
                    </div>
                    <span className="text-[9px] text-black/35">{q.marks} mk</span>
                  </div>
                );
              })}
            </div>
            <div className={`px-4 py-3 border-2 mb-4 ${answeredCount === questions.length ? "border-slate-200 bg-slate-50" : "border-slate-200 bg-slate-50"}`} style={{ borderRadius: 0 }}>
              <div className="text-xs font-semibold text-black">{answeredCount} of {questions.length} questions answered</div>
              {answeredCount < questions.length && (
                <div className="text-[10px] text-[#0F172A] mt-1">{questions.length - answeredCount} question(s) unanswered. Unanswered questions score zero.</div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPhase("active")} className={BTN_SECONDARY} style={{ borderRadius: 0 }}>
                <ChevronLeft className="h-3.5 w-3.5" /> Back to Test
              </button>
              <button onClick={handleSubmit} className={BTN_SUCCESS} style={{ borderRadius: 0 }}>
                <Send className="h-3.5 w-3.5" /> Submit Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Phase: Submitted ── */}
      {phase === "submitted" && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
          <div className="w-full max-w-md bg-white border border-black/10 shadow-sm text-center">
            <div className="bg-[#0F172A] text-white px-5 py-4">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-2" />
              <div className="text-sm font-bold">Assessment Submitted Successfully</div>
              <div className="text-[10px] text-white/70 mt-0.5">Your responses have been recorded and are being scored</div>
            </div>
            <div className="px-5 py-5 space-y-2 text-xs text-black/70">
              <div><strong>{resource.fullName}</strong> · {resource.company}</div>
              <div>{assignment.assessmentType}</div>
              <div className="text-[10px] text-black/45">Navigate to Layer D (Scoring) and Layer E (Records) to view the result.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER D — Scoring Engine
// ═══════════════════════════════════════════════════════════════════════════════
function ScoringLayer({
  attempts, resources,
}: {
  attempts: AssessmentAttempt[];
  resources: ResourceProfile[];
}) {
  const [selected, setSelected] = useState<AssessmentAttempt | null>(attempts[0] ?? null);

  const sorted = [...attempts].sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));

  function ScoreDonut({ pct, pass }: { pct: number; pass: boolean }) {
    const r = 36; const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="45" cy="45" r={r} fill="none"
          stroke={pass ? "#059669" : "#dc2626"} strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="butt" transform="rotate(-90 45 45)" />
        <text x="45" y="48" textAnchor="middle" fontSize="14" fontWeight="bold" fill={pass ? "#059669" : "#dc2626"}>{pct.toFixed(0)}%</text>
      </svg>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SubsystemHeader activeLayer="scoring" />
      <TwoTrackBanner />

      {attempts.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
          <BarChart3 className="h-14 w-14 text-black/15" />
          <div className="text-sm font-semibold text-black/40">No scored attempts yet</div>
          <div className="text-xs text-black/30 max-w-sm">Complete an assessment via Layer C. The scoring engine will process and display results here.</div>
        </div>
      )}

      {attempts.length > 0 && (
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Attempt list */}
          <div className="w-72 flex-shrink-0 border-r border-black/10 overflow-y-auto bg-[#F8F9FA]">
            <div className="px-3 py-2 text-[9px] font-bold text-black/40 uppercase border-b border-black/10">
              {sorted.length} Scored Attempt{sorted.length !== 1 ? "s" : ""}
            </div>
            {sorted.map(a => {
              const r = resources.find(x => x.id === a.resourceId);
              const pass = a.passed ?? false;
              return (
                <button key={a.id} onClick={() => setSelected(a)}
                  className={`w-full text-left px-3 py-3 border-b border-black/6 hover:bg-white transition-colors
                    ${selected?.id === a.id ? "bg-white border-l-2 border-l-[#2563eb]" : ""}`}>
                  <div className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 inline-block mb-1 ${a.assessmentType === "Director Competency Assessment" ? "bg-[#f5f3ff] text-[#7c3aed]" : "bg-[#e0f2fe] text-[#0369a1]"}`} style={{ borderRadius: 0 }}>
                    {a.assessmentType === "Director Competency Assessment" ? "Track 1 · Director" : "Track 2 · Technical"}
                  </div>
                  <div className="text-xs font-semibold text-black">{r?.fullName ?? a.resourceId}</div>
                  <div className="text-[9px] text-black/50 mt-0.5">{a.assessmentType}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 ${pass ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-700"}`} style={{ borderRadius: 0 }}>
                      {pass ? "PASS" : "FAIL"}
                    </span>
                    <span className="text-[9px] font-mono text-black/55">{(a.percentage ?? 0).toFixed(1)}%</span>
                    <span className="text-[9px] text-black/35 ml-auto">{a.submittedAt?.split(" ")[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Score detail */}
          {selected && (() => {
            const r = resources.find(x => x.id === selected.resourceId);
            const questions = ASSESSMENT_META[selected.assessmentType]?.questions ?? [];
            const pass = selected.passed ?? false;
            const sections = [...new Set(questions.map(q => q.section))];
            return (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Score header card */}
                <div className={`border-2 px-5 py-4 flex items-center gap-5 ${pass ? "border-slate-200 bg-slate-50" : "border-red-600 bg-red-50"}`} style={{ borderRadius: 0 }}>
                  <ScoreDonut pct={selected.percentage ?? 0} pass={pass} />
                  <div className="flex-1">
                    <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 inline-block mb-1 ${selected.assessmentType === "Director Competency Assessment" ? "bg-[#f5f3ff] text-[#7c3aed]" : "bg-[#e0f2fe] text-[#0369a1]"}`} style={{ borderRadius: 0 }}>
                      {selected.assessmentType === "Director Competency Assessment" ? "TRACK 1 · DIRECTOR COMPETENCY ASSESSMENT" : "TRACK 2 · TECHNICAL COMPETENCY ASSESSMENT"}
                    </div>
                    <div className="text-[9px] text-black/45 uppercase font-semibold">Official Competency Score</div>
                    <div className="text-2xl font-black text-black">{selected.score}<span className="text-base font-normal text-black/40"> / {selected.maxScore}</span></div>
                    <div className={`text-lg font-black mt-0.5 ${pass ? "text-[#0F172A]" : "text-red-700"}`}>
                      {pass ? "✓ COMPETENT" : "✗ NOT YET COMPETENT"}
                    </div>
                    <div className="text-[10px] text-black/50 mt-1">Pass mark: {ASSESSMENT_META[selected.assessmentType]?.passPercentage}% · Achieved: {(selected.percentage ?? 0).toFixed(1)}%</div>
                  </div>
                  <div className="text-right text-[10px] text-black/50 space-y-0.5">
                    <div><strong>Resource:</strong> {r?.fullName}</div>
                    <div><strong>Company:</strong> {r?.company}</div>
                    <div><strong>Assessment:</strong> {selected.assessmentType}</div>
                    <div><strong>Attempt ID:</strong> {selected.id}</div>
                    <div><strong>Submitted:</strong> {selected.submittedAt}</div>
                  </div>
                </div>

                {/* Section breakdown */}
                <div>
                  <div className="text-xs font-bold text-black mb-2 uppercase tracking-wider">Score Breakdown by Section</div>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0f172a] text-white">
                        {["Section", "Questions", "Max", "Scored", "%", "Status"].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sections.map(sec => {
                        const secQs = questions.filter(q => q.section === sec);
                        const secMax = secQs.reduce((s, q) => s + q.marks, 0);
                        const secScored = secQs.reduce((s, q) => {
                          const ans = selected.answers.find(a => a.questionId === q.id);
                          return s + (ans?.marksAwarded ?? 0);
                        }, 0);
                        const secPct = secMax > 0 ? (secScored / secMax) * 100 : 0;
                        return (
                          <tr key={sec} className="border-b border-black/8 hover:bg-gray-50">
                            <td className="px-3 py-2 font-semibold text-black">{sec}</td>
                            <td className="px-3 py-2 text-center text-black/55">{secQs.length}</td>
                            <td className="px-3 py-2 text-center font-mono text-black/55">{secMax}</td>
                            <td className="px-3 py-2 text-center font-bold text-black">{secScored}</td>
                            <td className={`px-3 py-2 text-center font-bold ${secPct >= 70 ? "text-[#0F172A]" : "text-red-600"}`}>{secPct.toFixed(0)}%</td>
                            <td className="px-3 py-2">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 ${secPct >= 70 ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-700"}`} style={{ borderRadius: 0 }}>
                                {secPct >= 70 ? "Pass" : "Fail"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Question-level breakdown */}
                <div>
                  <div className="text-xs font-bold text-black mb-2 uppercase tracking-wider">Question-Level Breakdown</div>
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F0F4F8]">
                        {["#", "Question", "Max", "Correct?", "Marks"].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-black/60 border-b border-black/10">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map((q, i) => {
                        const ans = selected.answers.find(a => a.questionId === q.id);
                        const correct = ans?.selectedOptionId === q.correctOptionId;
                        const unanswered = !ans?.selectedOptionId;
                        return (
                          <tr key={q.id} className={`border-b border-black/6 ${correct ? "bg-slate-50/40" : "bg-red-50/30"}`}>
                            <td className="px-3 py-2 text-black/40 font-mono">{i + 1}</td>
                            <td className="px-3 py-2 text-black/80 max-w-xs truncate">{q.questionText}</td>
                            <td className="px-3 py-2 text-center text-black/55">{q.marks}</td>
                            <td className="px-3 py-2 text-center">
                              {unanswered ? <span className="text-[9px] text-[#0F172A]">—</span>
                                : correct ? <CheckCircle2 className="h-4 w-4 text-[#0F172A] mx-auto" />
                                : <XCircle className="h-4 w-4 text-red-500 mx-auto" />}
                            </td>
                            <td className={`px-3 py-2 text-center font-bold font-mono ${correct ? "text-[#0F172A]" : "text-red-600"}`}>
                              {ans?.marksAwarded ?? 0}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#F8F9FA] border border-black/10 px-4 py-3 text-[10px] text-black/55 flex items-start gap-2">
                  <Lock className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-black/40" />
                  This scored result is immutable. It will be stored against the resource's competency profile and referenced in tender technical evaluations.
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER E — Competency Records (Resource-linked)
// ═══════════════════════════════════════════════════════════════════════════════
function RecordsLayer({
  resources, attempts,
}: {
  resources: ResourceProfile[];
  attempts: AssessmentAttempt[];
}) {
  const [selected, setSelected] = useState<ResourceProfile | null>(resources[0] ?? null);
  const [search, setSearch] = useState("");

  const filtered = resources.filter(r =>
    !search || r.fullName.toLowerCase().includes(search.toLowerCase()) || r.company.toLowerCase().includes(search.toLowerCase())
  );

  const getResourceAttempts = (resourceId: string) =>
    attempts.filter(a => a.resourceId === resourceId);

  const getBadgeColor = (r: ResourceProfile) => {
    const latest = r.competencyRecords[r.competencyRecords.length - 1];
    if (!latest) return "bg-gray-100 text-gray-500 border border-gray-200";
    if (latest.passed && latest.status === "Valid") return "bg-slate-100 text-[#0F172A] border border-slate-200";
    if (!latest.passed) return "bg-red-100 text-red-700 border border-red-200";
    return "bg-slate-100 text-[#0F172A] border border-slate-200";
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SubsystemHeader activeLayer="records" />
      <TwoTrackBanner />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Resource list */}
        <div className="w-64 flex-shrink-0 border-r border-black/10 flex flex-col overflow-hidden bg-[#F8F9FA]">
          <div className="flex-shrink-0 px-3 py-2 border-b border-black/10">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-black/35" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search…" className="pl-7 h-7 border border-black/15 text-xs w-full focus:outline-none" style={{ borderRadius: 0 }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(r => {
              const liveAttempt = getResourceAttempts(r.id).slice(-1)[0];
              const latestSeed  = r.competencyRecords[r.competencyRecords.length - 1];
              const pct    = liveAttempt?.percentage ?? latestSeed?.percentage;
              const passed = liveAttempt?.passed     ?? latestSeed?.passed;
              return (
                <button key={r.id} onClick={() => setSelected(r)}
                  className={`w-full text-left px-3 py-3 border-b border-black/6 hover:bg-white transition-colors flex items-start gap-2
                    ${selected?.id === r.id ? "bg-white border-l-2 border-l-[#2563eb]" : ""}`}>
                  <div className="h-8 w-8 flex-shrink-0 bg-[#0f172a] text-white flex items-center justify-center text-[10px] font-bold">
                    {r.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-black truncate">{r.fullName}</div>
                    <div className="text-[9px] text-black/45 truncate">{r.company}</div>
                    <div className={`text-[8px] font-bold px-1.5 py-0.5 mt-1 inline-block ${getBadgeColor(r)}`} style={{ borderRadius: 0 }}>
                      {pct !== undefined ? `${pct.toFixed(0)}% ${passed ? "✓" : "✗"}` : "No Record"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Competency record detail */}
        {selected && (() => {
          const liveAttempts = getResourceAttempts(selected.id);
          const allRecords: CompetencyRecord[] = [
            ...selected.competencyRecords,
            ...liveAttempts.filter(a => a.status === "Scored").map(a => ({
              assessmentType: a.assessmentType,
              attemptId: a.id,
              score: a.score ?? 0,
              maxScore: a.maxScore ?? 0,
              percentage: a.percentage ?? 0,
              passed: a.passed ?? false,
              dateTaken: a.submittedAt?.split(" ")[0] ?? "",
              expiryDate: a.submittedAt ? new Date(new Date(a.submittedAt.split(" ")[0]).getTime() + 365 * 86400000).toISOString().split("T")[0] : "N/A",
              status: (a.passed ? "Valid" : "Expired") as "Valid" | "Expired" | "Pending",
            })),
          ];
          const latestRecord = allRecords[allRecords.length - 1];
          return (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Resource profile card */}
              <div className="bg-[#0f172a] text-white px-5 py-4 flex items-start gap-4">
                <div className="h-14 w-14 bg-[#2563eb] flex items-center justify-center text-lg font-bold flex-shrink-0">
                  {selected.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-base font-bold">{selected.fullName}</div>
                  <div className="text-[10px] text-white/60">{selected.designation} · {selected.company}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[9px] bg-white/15 px-2 py-0.5 text-white/80">{selected.role}</span>
                    {selected.professionalBody && (
                      <span className="text-[9px] bg-white/10 px-2 py-0.5 text-white/60">{selected.professionalBody} · {selected.membershipNumber}</span>
                    )}
                    <span className="text-[9px] bg-white/10 px-2 py-0.5 text-white/60 font-mono">{selected.id}</span>
                  </div>
                </div>
                {latestRecord && (
                  <div className={`px-3 py-2 text-center flex-shrink-0 ${latestRecord.passed && latestRecord.status === "Valid" ? "bg-[#0F172A]" : "bg-red-700"}`}>
                    <div className="text-2xl font-black">{latestRecord.percentage.toFixed(0)}%</div>
                    <div className="text-[9px] font-bold">{latestRecord.passed ? "COMPETENT" : "NOT COMPETENT"}</div>
                    <div className="text-[8px] text-white/60 mt-0.5">{latestRecord.status}</div>
                  </div>
                )}
              </div>

              {/* Contact & identification */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Email", selected.email],
                  ["Phone", selected.phone],
                  ["National ID", selected.idNumber],
                  ["Specialisation", selected.specialisation],
                  ["Company ID", selected.companyId],
                  ["Status", selected.status],
                ].map(([label, val]) => (
                  <div key={label} className="border border-black/10 px-3 py-2 bg-white">
                    <div className="text-[9px] text-black/45 font-semibold">{label}</div>
                    <div className="text-xs font-semibold text-black mt-0.5">{val || "—"}</div>
                  </div>
                ))}
              </div>

              {/* Competency records history */}
              <div>
                <div className="text-xs font-bold text-black mb-2 uppercase tracking-wider flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-[#0F172A]" /> Competency Assessment Records
                </div>
                {allRecords.length === 0 ? (
                  <div className="border border-dashed border-black/15 px-4 py-6 text-center text-xs text-black/40">
                    No assessment records yet. This resource has not completed any assessment.
                  </div>
                ) : (
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#0f172a] text-white">
                        {["Assessment Type", "Date Taken", "Score", "Max", "%", "Result", "Expiry", "Status"].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allRecords.map((rec, i) => (
                        <tr key={i} className={`border-b border-black/8 ${rec.passed && rec.status === "Valid" ? "bg-slate-50/40" : "bg-red-50/30"}`}>
                          <td className="px-3 py-2 font-semibold text-black">{rec.assessmentType}</td>
                          <td className="px-3 py-2 font-mono text-black/60">{rec.dateTaken}</td>
                          <td className="px-3 py-2 text-center font-bold text-black">{rec.score}</td>
                          <td className="px-3 py-2 text-center text-black/55">{rec.maxScore}</td>
                          <td className={`px-3 py-2 text-center font-bold ${rec.passed ? "text-[#0F172A]" : "text-red-600"}`}>{rec.percentage.toFixed(1)}%</td>
                          <td className="px-3 py-2">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 ${rec.passed ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-700"}`} style={{ borderRadius: 0 }}>
                              {rec.passed ? "PASS" : "FAIL"}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-[10px] text-black/55">{rec.expiryDate}</td>
                          <td className="px-3 py-2">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 ${rec.status === "Valid" ? "bg-slate-100 text-[#0F172A]" : rec.status === "Expired" ? "bg-red-100 text-red-600" : "bg-slate-100 text-[#0F172A]"}`} style={{ borderRadius: 0 }}>
                              {rec.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="bg-[#F8F9FA] border border-black/10 px-4 py-3 text-[10px] text-black/55 flex items-start gap-2">
                <Lock className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-black/40" />
                Competency records are stored permanently against this resource profile. They are referenced automatically when this resource is linked to a tender response.
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LAYER F — Tender Technical Evaluation Integration
// ═══════════════════════════════════════════════════════════════════════════════
// LAYER F — Tender Technical Evaluation Integration
// Two-track: 6a (Directors) and 6b (Technical Team) feed separately into scorecard
// ═══════════════════════════════════════════════════════════════════════════════
function IntegrationLayer({
  resources, attempts, tenderLinks, setTenderLinks,
}: {
  resources: ResourceProfile[];
  attempts: AssessmentAttempt[];
  tenderLinks: TenderResourceLink[];
  setTenderLinks: React.Dispatch<React.SetStateAction<TenderResourceLink[]>>;
}) {
  const [selectedTender, setSelectedTender] = useState("ZW-PRA-2026-00181");
  const [showAddForm, setShowAddForm] = useState(false);
  const [addResourceId, setAddResourceId] = useState("");
  const [addRole, setAddRole] = useState<ResourceCategory>("Director");

  const DEMO_TENDERS = [
    { id: "ZW-PRA-2026-00181", ref: "ZW-PRA-2026-00181", title: "Rehabilitation of Beitbridge–Harare Highway (Section 4)" },
    { id: "ZW-PRA-2026-00182", ref: "ZW-PRA-2026-00182", title: "National Tax Administration System — Phase II" },
    { id: "ZW-PRA-2026-00183", ref: "ZW-PRA-2026-00183", title: "ARV Medicines Framework Supply (2-Year)" },
  ];

  const tenderData = DEMO_TENDERS.find(t => t.id === selectedTender)!;

  const getScore = (resourceId: string): Partial<TenderResourceLink> => {
    const r = resources.find(x => x.id === resourceId);
    const liveAttempt = attempts.filter(a => a.resourceId === resourceId && a.status === "Scored").slice(-1)[0];
    const seedRecord = r?.competencyRecords.slice(-1)[0];
    if (liveAttempt) {
      return {
        competencyScore: liveAttempt.score, competencyMaxScore: liveAttempt.maxScore,
        competencyPercentage: liveAttempt.percentage, competencyPassed: liveAttempt.passed,
        assessmentType: liveAttempt.assessmentType, dateTaken: liveAttempt.submittedAt?.split(" ")[0],
      };
    }
    if (seedRecord) {
      return {
        competencyScore: seedRecord.score, competencyMaxScore: seedRecord.maxScore,
        competencyPercentage: seedRecord.percentage, competencyPassed: seedRecord.passed,
        assessmentType: seedRecord.assessmentType, dateTaken: seedRecord.dateTaken,
      };
    }
    return {};
  };

  const tenderResourceLinks = tenderLinks.filter(l => l.tenderId === selectedTender)
    .map(l => ({ ...l, ...getScore(l.resourceId) }));

  const handleAddResource = () => {
    if (!addResourceId) { pushNotification("Select a resource", "error"); return; }
    const r = resources.find(x => x.id === addResourceId);
    if (!r) return;
    if (tenderLinks.find(l => l.tenderId === selectedTender && l.resourceId === addResourceId)) {
      pushNotification("Resource already linked to this tender", "info"); return;
    }
    const selectedResource = resources.find(x => x.id === addResourceId);
    const derivedRole = selectedResource ? selectedResource.role : addRole;
    const link: TenderResourceLink = {
      tenderId: selectedTender, tenderRef: tenderData.ref, tenderTitle: tenderData.title,
      resourceId: addResourceId, role: derivedRole, ...getScore(addResourceId),
    };
    setTenderLinks(prev => [...prev, link]);
    setShowAddForm(false); setAddResourceId("");
    pushNotification(`${r.fullName} linked to tender ${tenderData.ref} under ${derivedRole === "Director" ? "Track 1 · Director" : "Track 2 · Technical"} assessment`, "success");
  };

  // ── TRACK 1: Director resources only
  const track1Links = tenderResourceLinks.filter(l => l.role === "Director");
  // ── TRACK 2: Technical Engineer + Lead Technical Team
  const track2Links = tenderResourceLinks.filter(l => l.role === "Technical Engineer" || l.role === "Lead Technical Team");

  const avgPct = (links: typeof tenderResourceLinks) => {
    const valid = links.filter(l => l.competencyPercentage !== undefined);
    return valid.length > 0 ? valid.reduce((s, l) => s + (l.competencyPercentage ?? 0), 0) / valid.length : 0;
  };

  const track1Avg = avgPct(track1Links);
  const track2Avg = avgPct(track2Links);
  // Scorecard marks: proportional to avg%, max 5 each
  const score6a = Math.round((track1Avg / 100) * 5);
  const score6b = Math.round((track2Avg / 100) * 5);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <SubsystemHeader activeLayer="integration" />
      <TwoTrackBanner />

      {/* Lifecycle source callout */}
      <div className="flex-shrink-0 bg-[#0F172A] text-white px-4 py-2.5 border-b border-slate-200/50">
        <div className="flex items-start gap-2.5">
          <BadgeCheck className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
              COMPETENCY SCORES SOURCED FROM VENDOR REGISTRATION LIFECYCLE — NOT TRIGGERED AT BID TIME
            </div>
            <div className="text-[10px] text-white/80 leading-relaxed">
              The scores shown below were recorded at the <strong className="text-white">resource profile level</strong> during vendor onboarding (Step 5 of vendor registration).
              The system pulls those pre-verified results here automatically when resources are added to a tender team.
              No new competency test is triggered — the evaluation consumes the existing, verified record.
            </div>
          </div>
          <div className="flex flex-col items-center flex-shrink-0 text-center">
            <div className="text-[7px] text-slate-500 uppercase font-bold">Flow</div>
            <div className="text-[8px] text-white/70 font-semibold">Registration → Resource Profile → Score Stored → Tender → Used Here</div>
          </div>
        </div>
      </div>

      {/* Tender selector toolbar */}
      <div className="flex-shrink-0 bg-white border-b border-black/10 px-4 py-2 flex items-center gap-3 flex-wrap">
        <label className="text-[10px] font-semibold text-black/60">Tender Reference:</label>
        <select value={selectedTender} onChange={e => setSelectedTender(e.target.value)}
          className="h-8 px-3 border border-black/15 text-xs bg-white focus:outline-none flex-1 min-w-[200px] max-w-md" style={{ borderRadius: 0 }}>
          {DEMO_TENDERS.map(t => <option key={t.id} value={t.id}>{t.ref} — {t.title.slice(0, 60)}</option>)}
        </select>
        <button onClick={() => setShowAddForm(v => !v)} className={BTN_PRIMARY} style={{ borderRadius: 0 }}>
          <Plus className="h-3.5 w-3.5" /> Link Resource
        </button>
      </div>

      {/* Add resource form — role auto-determines track */}
      {showAddForm && (
        <div className="flex-shrink-0 bg-slate-50 border-b border-black/15 px-4 py-3 space-y-2">
          <div className="text-[10px] font-bold text-black/60 uppercase tracking-wider mb-1">
            Link Resource to Tender — Role determines assessment track automatically
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select value={addResourceId} onChange={e => {
              setAddResourceId(e.target.value);
              const r = resources.find(x => x.id === e.target.value);
              if (r) setAddRole(r.role);
            }} className={`${SELECT_BASE} min-w-[200px]`} style={{ borderRadius: 0 }}>
              <option value="">— Select Resource —</option>
              <optgroup label="Track 1 · Directors">
                {resources.filter(r => r.role === "Director").map(r =>
                  <option key={r.id} value={r.id}>{r.fullName} ({r.company})</option>
                )}
              </optgroup>
              <optgroup label="Track 2 · Technical Engineers &amp; Lead Technical Team">
                {resources.filter(r => r.role !== "Director" && r.role !== "Other").map(r =>
                  <option key={r.id} value={r.id}>{r.fullName} — {r.role} ({r.company})</option>
                )}
              </optgroup>
            </select>
            {addResourceId && (
              <div className={`text-[9px] font-black px-2 py-1 ${addRole === "Director" ? "bg-[#f5f3ff] text-[#7c3aed] border border-[#7c3aed]/30" : "bg-[#e0f2fe] text-[#0369a1] border border-[#0369a1]/30"}`} style={{ borderRadius: 0 }}>
                {addRole === "Director" ? "→ Track 1 · Director Competency Assessment" : "→ Track 2 · Technical / Lead Tech Team Competency Assessment"}
              </div>
            )}
            <button onClick={handleAddResource} className={BTN_SUCCESS} style={{ borderRadius: 0 }}>
              <Check className="h-3.5 w-3.5" /> Link Resource
            </button>
            <button onClick={() => { setShowAddForm(false); setAddResourceId(""); }} className={BTN_SECONDARY} style={{ borderRadius: 0 }}>
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Tender info banner */}
        <div className="bg-[#0f172a] text-white px-4 py-3 flex items-start justify-between gap-4">
          <div>
            <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Active Tender — Two-Track Competency Score Integration</div>
            <div className="text-sm font-bold">{tenderData.title}</div>
            <div className="text-[10px] text-white/55 font-mono mt-0.5">{tenderData.ref}</div>
          </div>
          <div className="flex flex-col gap-1 text-right flex-shrink-0">
            <div className="text-[9px] text-white/50">Track 1 (Director) resources: <strong className="text-[#c4b5fd]">{track1Links.length}</strong></div>
            <div className="text-[9px] text-white/50">Track 2 (Technical) resources: <strong className="text-[#7dd3fc]">{track2Links.length}</strong></div>
          </div>
        </div>

        {/* ── TRACK 1 PANEL ─────────────────────────────────────────── */}
        <div className="border-l-4 border-[#7c3aed]">
          <div className="bg-[#4c1d95] text-white px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#c4b5fd]" />
              <div>
                <div className="text-[8px] font-black uppercase tracking-widest text-[#c4b5fd]">Track 1 · Score Card Criterion 6a</div>
                <div className="text-sm font-bold">Director Competency Assessment</div>
                <div className="text-[9px] text-white/50">For: Company Directors and equivalent leadership resources</div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[9px] text-white/50">6a Max Marks</div>
              <div className="text-2xl font-black text-[#c4b5fd]">5</div>
            </div>
          </div>
          {track1Links.length === 0 ? (
            <div className="bg-[#f5f3ff] border border-[#7c3aed]/20 px-4 py-5 text-center">
              <div className="text-xs text-[#7c3aed] font-semibold">No Directors linked yet</div>
              <div className="text-[10px] text-black/40 mt-1">Use "Link Resource" above and select a Director. They will be assigned the Director Competency Assessment automatically.</div>
            </div>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#ede9fe]">
                  {["Director Resource", "Company", "Assessment Track", "Score", "Max", "%", "Result", "Date Taken", "Action"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-[#4c1d95] border-b border-[#7c3aed]/20">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {track1Links.map(link => {
                  const r = resources.find(x => x.id === link.resourceId);
                  const hasScore = link.competencyPercentage !== undefined;
                  const pass = link.competencyPassed ?? false;
                  return (
                    <tr key={link.resourceId} className={`border-b border-[#7c3aed]/10 hover:bg-[#faf5ff] ${hasScore ? (pass ? "bg-slate-50/40" : "bg-red-50/30") : "bg-white"}`}>
                      <td className="px-3 py-2.5"><div className="font-semibold text-black">{r?.fullName ?? link.resourceId}</div><div className="text-[9px] text-[#7c3aed] font-semibold">{link.role}</div></td>
                      <td className="px-3 py-2.5 text-black/60 text-[10px]">{r?.company ?? "—"}</td>
                      <td className="px-3 py-2.5"><div className="text-[9px] font-semibold text-[#7c3aed]">Director Competency Assessment</div><div className="text-[8px] text-black/40">Track 1 · 6a</div></td>
                      <td className="px-3 py-2.5 text-center font-bold font-mono text-black">{hasScore ? link.competencyScore : "—"}</td>
                      <td className="px-3 py-2.5 text-center text-black/45 font-mono">{hasScore ? link.competencyMaxScore : "—"}</td>
                      <td className={`px-3 py-2.5 text-center font-bold ${hasScore ? (pass ? "text-[#0F172A]" : "text-red-600") : "text-black/30"}`}>{hasScore ? `${(link.competencyPercentage ?? 0).toFixed(1)}%` : "—"}</td>
                      <td className="px-3 py-2.5">{hasScore ? <span className={`text-[9px] font-bold px-1.5 py-0.5 ${pass ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-700"}`} style={{ borderRadius: 0 }}>{pass ? "PASS" : "FAIL"}</span> : <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-[#0F172A] font-semibold" style={{ borderRadius: 0 }}>Pending</span>}</td>
                      <td className="px-3 py-2.5 font-mono text-[10px] text-black/45">{link.dateTaken ?? "—"}</td>
                      <td className="px-3 py-2.5"><button onClick={() => setTenderLinks(prev => prev.filter(l => !(l.tenderId === selectedTender && l.resourceId === link.resourceId)))} className="h-6 px-2 text-[9px] text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-1" style={{ borderRadius: 0 }}><Trash2 className="h-2.5 w-2.5" /> Remove</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <div className={`px-4 py-2.5 flex items-center justify-between border border-t-0 border-[#7c3aed]/20 ${track1Links.some(l => l.competencyPercentage !== undefined) ? "bg-[#f5f3ff]" : "bg-[#fafafa]"}`}>
            <div>
              <div className="text-[9px] font-bold text-[#4c1d95] uppercase tracking-wider">6a — Directors Competency Online Test</div>
              <div className="text-[9px] text-black/45">Avg Director Competency: {track1Avg.toFixed(1)}% · Proportional to max 5 marks</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right"><div className="text-[9px] text-black/40">Score Awarded</div><div className={`text-3xl font-black font-mono ${score6a >= 4 ? "text-[#0F172A]" : score6a >= 3 ? "text-[#0F172A]" : track1Links.length === 0 ? "text-black/25" : "text-red-600"}`}>{track1Links.length === 0 ? "—" : score6a}</div></div>
              <div className="text-right"><div className="text-[9px] text-black/40">Max</div><div className="text-3xl font-black font-mono text-black/30">5</div></div>
            </div>
          </div>
        </div>

        {/* ── TRACK 2 PANEL ─────────────────────────────────────────── */}
        <div className="border-l-4 border-[#0369a1]">
          <div className="bg-[#0c4a6e] text-white px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#7dd3fc]" />
              <div>
                <div className="text-[8px] font-black uppercase tracking-widest text-[#7dd3fc]">Track 2 · Score Card Criterion 6b</div>
                <div className="text-sm font-bold">Technical Engineer / Lead Technical Team Competency Assessment</div>
                <div className="text-[9px] text-white/50">For: Technical Engineers, Lead Technical Team Members, Specialist Technical Resources</div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[9px] text-white/50">6b Max Marks</div>
              <div className="text-2xl font-black text-[#7dd3fc]">5</div>
            </div>
          </div>
          {track2Links.length === 0 ? (
            <div className="bg-[#e0f2fe] border border-[#0369a1]/20 px-4 py-5 text-center">
              <div className="text-xs text-[#0369a1] font-semibold">No Technical resources linked yet</div>
              <div className="text-[10px] text-black/40 mt-1">Use "Link Resource" above and select a Technical Engineer or Lead Technical Team member. They will be assigned the Technical / Lead Technical Team Competency Assessment automatically.</div>
            </div>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#e0f2fe]">
                  {["Technical Resource", "Company", "Assessment Track", "Score", "Max", "%", "Result", "Date Taken", "Action"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-[#0c4a6e] border-b border-[#0369a1]/20">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {track2Links.map(link => {
                  const r = resources.find(x => x.id === link.resourceId);
                  const hasScore = link.competencyPercentage !== undefined;
                  const pass = link.competencyPassed ?? false;
                  return (
                    <tr key={link.resourceId} className={`border-b border-[#0369a1]/10 hover:bg-[#f0f9ff] ${hasScore ? (pass ? "bg-slate-50/40" : "bg-red-50/30") : "bg-white"}`}>
                      <td className="px-3 py-2.5"><div className="font-semibold text-black">{r?.fullName ?? link.resourceId}</div><div className="text-[9px] text-[#0369a1] font-semibold">{link.role}</div></td>
                      <td className="px-3 py-2.5 text-black/60 text-[10px]">{r?.company ?? "—"}</td>
                      <td className="px-3 py-2.5"><div className="text-[9px] font-semibold text-[#0369a1]">Technical / Lead Technical Team Assessment</div><div className="text-[8px] text-black/40">Track 2 · 6b</div></td>
                      <td className="px-3 py-2.5 text-center font-bold font-mono text-black">{hasScore ? link.competencyScore : "—"}</td>
                      <td className="px-3 py-2.5 text-center text-black/45 font-mono">{hasScore ? link.competencyMaxScore : "—"}</td>
                      <td className={`px-3 py-2.5 text-center font-bold ${hasScore ? (pass ? "text-[#0F172A]" : "text-red-600") : "text-black/30"}`}>{hasScore ? `${(link.competencyPercentage ?? 0).toFixed(1)}%` : "—"}</td>
                      <td className="px-3 py-2.5">{hasScore ? <span className={`text-[9px] font-bold px-1.5 py-0.5 ${pass ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-700"}`} style={{ borderRadius: 0 }}>{pass ? "PASS" : "FAIL"}</span> : <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-[#0F172A] font-semibold" style={{ borderRadius: 0 }}>Pending</span>}</td>
                      <td className="px-3 py-2.5 font-mono text-[10px] text-black/45">{link.dateTaken ?? "—"}</td>
                      <td className="px-3 py-2.5"><button onClick={() => setTenderLinks(prev => prev.filter(l => !(l.tenderId === selectedTender && l.resourceId === link.resourceId)))} className="h-6 px-2 text-[9px] text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-1" style={{ borderRadius: 0 }}><Trash2 className="h-2.5 w-2.5" /> Remove</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <div className={`px-4 py-2.5 flex items-center justify-between border border-t-0 border-[#0369a1]/20 ${track2Links.some(l => l.competencyPercentage !== undefined) ? "bg-[#e0f2fe]" : "bg-[#fafafa]"}`}>
            <div>
              <div className="text-[9px] font-bold text-[#0c4a6e] uppercase tracking-wider">6b — Technical Team Competency Online Test</div>
              <div className="text-[9px] text-black/45">Avg Technical Competency: {track2Avg.toFixed(1)}% · Proportional to max 5 marks</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right"><div className="text-[9px] text-black/40">Score Awarded</div><div className={`text-3xl font-black font-mono ${score6b >= 4 ? "text-[#0F172A]" : score6b >= 3 ? "text-[#0F172A]" : track2Links.length === 0 ? "text-black/25" : "text-red-600"}`}>{track2Links.length === 0 ? "—" : score6b}</div></div>
              <div className="text-right"><div className="text-[9px] text-black/40">Max</div><div className="text-3xl font-black font-mono text-black/30">5</div></div>
            </div>
          </div>
        </div>

        {/* ── Combined Score Card Summary ─────────────────────────── */}
        {(track1Links.length > 0 || track2Links.length > 0) && (
          <div>
            <div className="text-xs font-bold text-black mb-2 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#0F172A]" />
              Technical Bid Evaluation Score Card — Two-Track Competency Subtotal (Auto-Populated)
            </div>
            <div className="bg-[#0a1628] text-white px-4 py-3">
              <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-3">
                These two separate assessment track scores feed directly into the Technical Bid Evaluation Score Card:
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/50 border-b border-white/10 text-[9px]">
                    <th className="text-left pb-2 font-semibold">Criterion</th>
                    <th className="text-center pb-2 font-semibold">Track</th>
                    <th className="text-center pb-2 font-semibold">Assessment Type</th>
                    <th className="text-center pb-2 font-semibold">Avg %</th>
                    <th className="text-center pb-2 font-semibold">Max</th>
                    <th className="text-center pb-2 font-semibold">Score Awarded</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="py-2.5 font-semibold text-[#c4b5fd]">6a — Directors Competency Online Test</td>
                    <td className="py-2.5 text-center"><span className="text-[8px] bg-[#4c1d95] px-2 py-0.5 text-[#c4b5fd] font-black">Track 1</span></td>
                    <td className="py-2.5 text-center text-[10px] text-white/60">Director Competency Assessment</td>
                    <td className="py-2.5 text-center font-mono text-white">{track1Avg.toFixed(1)}%</td>
                    <td className="py-2.5 text-center font-mono text-white/50">5</td>
                    <td className="py-2.5 text-center"><span className={`text-2xl font-black font-mono ${score6a >= 4 ? "text-slate-500" : score6a >= 3 ? "text-slate-500" : track1Links.length === 0 ? "text-white/25" : "text-red-400"}`}>{track1Links.length === 0 ? "—" : score6a}</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2.5 font-semibold text-[#7dd3fc]">6b — Technical Team Competency Online Test</td>
                    <td className="py-2.5 text-center"><span className="text-[8px] bg-[#0c4a6e] px-2 py-0.5 text-[#7dd3fc] font-black">Track 2</span></td>
                    <td className="py-2.5 text-center text-[10px] text-white/60">Technical / Lead Technical Team Assessment</td>
                    <td className="py-2.5 text-center font-mono text-white">{track2Avg.toFixed(1)}%</td>
                    <td className="py-2.5 text-center font-mono text-white/50">5</td>
                    <td className="py-2.5 text-center"><span className={`text-2xl font-black font-mono ${score6b >= 4 ? "text-slate-500" : score6b >= 3 ? "text-slate-500" : track2Links.length === 0 ? "text-white/25" : "text-red-400"}`}>{track2Links.length === 0 ? "—" : score6b}</span></td>
                  </tr>
                  <tr>
                    <td className="pt-3 text-white font-black text-xs uppercase tracking-wider" colSpan={4}>Competency Subtotal (6a + 6b)</td>
                    <td className="pt-3 text-center font-mono text-white/50">10</td>
                    <td className="pt-3 text-center"><span className="text-3xl font-black font-mono text-slate-400">{(track1Links.length === 0 ? 0 : score6a) + (track2Links.length === 0 ? 0 : score6b)}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-3 flex items-start gap-2 text-[10px] text-[#0F172A]">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#0F172A]" />
              <div>
                <strong>Two-track integration complete.</strong> Track 1 (Director Competency Assessment) populates criterion <strong>6a</strong> and
                Track 2 (Technical / Lead Technical Team Competency Assessment) populates criterion <strong>6b</strong> of the Tender Technical Bid
                Evaluation Score Card. These two tracks are kept entirely separate — the evaluating officer does not manually enter them.
              </div>
            </div>
          </div>
        )}

        <div className="bg-[#F8F9FA] border border-black/10 px-4 py-3 text-[10px] text-black/55 flex items-start gap-2">
          <Lock className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-black/40" />
          Competency scores are read-only in this panel. They originate from each resource's official competency record (Layer E).
          Track 1 (Director) and Track 2 (Technical) scores are stored and reported separately — they are never merged into a single generic competency score.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT — CompetencySubsystem (ties all six layers)
// ═══════════════════════════════════════════════════════════════════════════════
export default function CompetencySubsystem() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Derive active layer from URL path
  const pathSegment = location.pathname.split("/").pop() ?? "";
  const layerFromUrl: Layer =
    (LAYERS.find(l => l.route.endsWith("/" + pathSegment))?.id) ?? "resources";
  const [activeLayer, setActiveLayer] = useState<Layer>(layerFromUrl);

  // Sync state when URL changes externally
  useEffect(() => {
    const seg = location.pathname.split("/").pop() ?? "";
    const found = LAYERS.find(l => l.route.endsWith("/" + seg));
    if (found) setActiveLayer(found.id);
  }, [location.pathname]);

  // Navigate to a layer's route
  const goToLayer = (layer: Layer) => {
    const l = LAYERS.find(x => x.id === layer);
    if (l) navigate(l.route);
  };

  // Shared state across layers
  const [resources,    setResources]    = useState<ResourceProfile[]>(SEED_RESOURCES);
  const [assignments,  setAssignments]  = useState<AssessmentAssignment[]>(SEED_ASSIGNMENTS);
  const [attempts,     setAttempts]     = useState<AssessmentAttempt[]>([]);
  const [tenderLinks,  setTenderLinks]  = useState<TenderResourceLink[]>(SEED_TENDER_LINKS);

  // Cross-layer navigation state
  const [activeAssignment, setActiveAssignment] = useState<AssessmentAssignment | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);

  // When "Assign Test" is clicked on a resource → go to Assignments layer
  const handleAssignFromResource = (r: ResourceProfile) => {
    setSelectedResourceId(r.id);
    goToLayer("assignments");
  };

  // When "Take" is clicked on an assignment → go to Assessment layer
  const handleTakeTest = (asn: AssessmentAssignment) => {
    setActiveAssignment(asn);
    // Update assignment status
    setAssignments(prev => prev.map(a => a.id === asn.id ? { ...a, status: "In Progress" } : a));
    goToLayer("assessment");
  };

  // When assessment is completed → store result, update records
  const handleAssessmentComplete = (attempt: AssessmentAttempt) => {
    setAttempts(prev => [...prev, attempt]);
    // Update assignment
    setAssignments(prev => prev.map(a =>
      a.id === attempt.assignmentId
        ? { ...a, status: attempt.passed ? "Completed" : "Failed", attemptId: attempt.id, otpVerified: true }
        : a
    ));
    // Store result in resource competency records
    setResources(prev => prev.map(r => {
      if (r.id !== attempt.resourceId) return r;
      const newRecord: CompetencyRecord = {
        assessmentType: attempt.assessmentType,
        attemptId: attempt.id,
        score: attempt.score ?? 0,
        maxScore: attempt.maxScore ?? 0,
        percentage: attempt.percentage ?? 0,
        passed: attempt.passed ?? false,
        dateTaken: attempt.submittedAt?.split(" ")[0] ?? new Date().toISOString().split("T")[0],
        expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
        status: attempt.passed ? "Valid" : "Expired",
      };
      return { ...r, competencyRecords: [...r.competencyRecords, newRecord], updatedAt: new Date().toISOString().split("T")[0] };
    }));
    // Navigate to scoring
    goToLayer("scoring");
    pushNotification(
      `Assessment completed — ${attempt.passed ? "PASS" : "FAIL"} (${(attempt.percentage ?? 0).toFixed(1)}%) — result stored in competency profile`,
      attempt.passed ? "success" : "error"
    );
  };

  const activeResource = activeAssignment
    ? resources.find(r => r.id === activeAssignment.resourceId) ?? null
    : null;

  // Badge counts for layer tabs
  const pendingAssignments = assignments.filter(a => a.status === "Assigned" || a.status === "Pending").length;
  const completedAttempts  = attempts.length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F1F5F9]">
      {/* ── Layer Navigation Strip ── */}
      <div className="flex-shrink-0 bg-[#0f172a] overflow-x-auto">
        <div className="flex min-w-max">
          {LAYERS.map(l => {
            const badge = l.id === "assignments" && pendingAssignments > 0
              ? String(pendingAssignments)
              : l.id === "scoring" && completedAttempts > 0
              ? String(completedAttempts)
              : undefined;
            return (
              <button key={l.id} onClick={() => goToLayer(l.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-semibold whitespace-nowrap border-b-2 transition-all flex-shrink-0
                  ${activeLayer === l.id
                    ? "border-[#2563eb] text-white bg-[#2563eb]/20"
                    : "border-transparent text-white/50 hover:text-white hover:bg-white/5"
                  }`}>
                <l.Icon className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{l.label}</span>
                <span className="sm:hidden">{l.shortLabel}</span>
                {badge && (
                  <span className="text-[9px] bg-[#2563eb] text-white px-1.5 py-0.5 font-bold min-w-[18px] text-center" style={{ borderRadius: "999px" }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Layer Content ── */}
      <div className="flex-1 min-h-0 overflow-hidden bg-white">
        {activeLayer === "resources" && (
          <ResourceLayer resources={resources} setResources={setResources} onAssign={handleAssignFromResource} />
        )}
        {activeLayer === "assignments" && (
          <AssignmentLayer
            resources={resources} assignments={assignments} setAssignments={setAssignments}
            selectedResourceId={selectedResourceId} setSelectedResourceId={setSelectedResourceId}
            onTakeTest={handleTakeTest}
          />
        )}
        {activeLayer === "assessment" && (
          <AssessmentLayer
            assignment={activeAssignment}
            resource={activeResource}
            onComplete={handleAssessmentComplete}
          />
        )}
        {activeLayer === "scoring" && (
          <ScoringLayer attempts={attempts} resources={resources} />
        )}
        {activeLayer === "records" && (
          <RecordsLayer resources={resources} attempts={attempts} />
        )}
        {activeLayer === "integration" && (
          <IntegrationLayer
            resources={resources} attempts={attempts}
            tenderLinks={tenderLinks} setTenderLinks={setTenderLinks}
          />
        )}
      </div>
    </div>
  );
}
