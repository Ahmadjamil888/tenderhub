import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ToastContainer from "@/components/ToastContainer";
import {
  LayoutDashboard, BarChart3, Sparkles, ClipboardList, FileText, Trophy,
  Building2, FileSignature, TrendingUp, Wallet, ShieldCheck, AlertOctagon,
  Landmark, UsersRound, Globe2, Globe, Image, Search, Bell, Inbox, MessageSquare,
  ChevronDown, ChevronRight, Scale, ShoppingCart, Gavel, LogOut, User, X, CheckCircle2, Menu,
  Package, Wrench, PiggyBank, Trash2, Tag, Boxes, PackageCheck, Warehouse, ScanLine, RefreshCcw,
  Briefcase, CheckCircle, BookOpen, Newspaper, Megaphone, Radio, DollarSign,
  Mail, Send, Clock, AlertTriangle, Settings, Sun, Moon,
  Crown, Target, Headphones, Monitor, Users, Star, MapPin,
  Edit3, FolderOpen, Award, Activity, BadgeCheck, UserPlus, CalendarDays,
  Bot, Globe as GlobeIcon, Zap,
  Layers, Plus, KeyRound,
} from "lucide-react";
import { navSections } from "@/lib/mock-data";
import { useAuth, type UserRole } from "@/lib/auth-context";
import { useNotifications, useTenders } from "@/hooks/use-store";
import { markNotificationsRead } from "@/lib/local-store";

/* ─── Click-outside hook ────────────────────────────────────────────────── */
function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

/* ─── Notifications Panel ───────────────────────────────────────────────── */
const NOTIF_ICONS: Record<string, { cls: string; Icon: React.ElementType }> = {
  success: { cls: "text-emerald-700 bg-emerald-100", Icon: CheckCircle2 },
  error:   { cls: "text-red-600 bg-red-50",          Icon: AlertTriangle },
  warning: { cls: "text-amber-700 bg-amber-100",     Icon: AlertTriangle },
  info:    { cls: "text-blue-700 bg-blue-100",        Icon: Bell },
};

function NotificationsPanel({ notifications, onClose, onMarkAllRead }: {
  notifications: { id: string; msg: string; type: string; time: string; read: boolean }[];
  onClose: () => void;
  onMarkAllRead: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);
  const unread = notifications.filter(n => !n.read);
  const read   = notifications.filter(n => n.read);

  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div>
          <span className="text-sm font-semibold text-[#0F172A]">Notifications</span>
          {unread.length > 0 && (
            <span className="ml-2 text-[10px] font-bold bg-[#0F172A] text-white px-1.5 py-0.5 rounded-full">{unread.length} new</span>
          )}
        </div>
        <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#0F172A] transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-y-auto max-h-[420px] divide-y divide-slate-100">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-300">
            <Bell className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No notifications yet</p>
          </div>
        )}
        {unread.length > 0 && (
          <>
            <div className="px-5 py-2 bg-slate-50">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">New</span>
            </div>
            {unread.slice(0, 8).map(n => {
              const { cls, Icon } = NOTIF_ICONS[n.type] ?? NOTIF_ICONS.info;
              return (
                <div key={n.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className={`h-8 w-8 rounded-lg grid place-items-center flex-shrink-0 mt-0.5 ${cls}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#0F172A] leading-relaxed">{n.msg}</p>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{n.time}</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-[#0F172A] mt-1.5 flex-shrink-0" />
                </div>
              );
            })}
          </>
        )}
        {read.length > 0 && (
          <>
            <div className="px-5 py-2 bg-slate-50">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Earlier</span>
            </div>
            {read.slice(0, 5).map(n => {
              const { cls, Icon } = NOTIF_ICONS[n.type] ?? NOTIF_ICONS.info;
              return (
                <div key={n.id} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer opacity-60">
                  <div className={`h-7 w-7 rounded-lg grid place-items-center flex-shrink-0 mt-0.5 ${cls}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#0F172A] leading-relaxed">{n.msg}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
      <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between bg-slate-50">
        <span className="text-xs text-slate-400">{notifications.length} total notifications</span>
        <button onClick={onMarkAllRead} className="text-xs font-medium text-[#0F172A] hover:underline transition-colors">Mark all read</button>
      </div>
    </div>
  );
}

/* ─── Messages Panel ────────────────────────────────────────────────────── */
const DEMO_MESSAGES = [
  { id: "m1", from: "T. Moyo",       avatar: "TM", role: "CPO",               subject: "Solar Mini-Grids — Evaluation Update",      preview: "Please review the updated scoresheet before the committee meeting at 14:00.",  time: "09:14", unread: true  },
  { id: "m2", from: "R. Chikwanda",  avatar: "RC", role: "Finance Officer",    subject: "INV-2026-4821 Approved",                     preview: "Invoice approved and queued for payment. EFT reference will follow.",            time: "08:42", unread: true  },
  { id: "m3", from: "P. Dube",       avatar: "PD", role: "Evaluator",          subject: "ARV Framework — Technical Scores",           preview: "Attached are the consolidated technical evaluation scores for your review.",       time: "Yesterday", unread: false },
  { id: "m4", from: "S. Nkosi",      avatar: "SN", role: "Auditor",            subject: "Audit Finding — FA-2026-041",                preview: "Ghost vendor pattern detected in Transport Dept. Immediate action required.",      time: "Yesterday", unread: false },
  { id: "m5", from: "A. Mpofu",      avatar: "AM", role: "Procurement Officer",subject: "Infrastructure Working Group — Agenda",      preview: "Agenda for Thursday's working group meeting is now available on the shared drive.", time: "Mon",       unread: false },
];

function MessagesPanel({ user, onClose }: { user: { name?: string; avatar?: string } | null; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [compose, setCompose] = useState(false);
  const [to, setTo] = useState(""); const [subject, setSubject] = useState(""); const [body, setBody] = useState("");
  const [sentMsg, setSentMsg] = useState<string | null>(null);
  useClickOutside(ref, onClose);

  const handleSend = () => {
    if (!to.trim() || !subject.trim()) return;
    setSentMsg(`Message sent to ${to} — Subject: "${subject}"`);
    setCompose(false); setTo(""); setSubject(""); setBody("");
    setTimeout(() => setSentMsg(null), 3000);
  };

  const handleViewAll = () => { navigate("/teams"); onClose(); };
  const handleOpenMessage = (m: typeof DEMO_MESSAGES[0]) => {
    navigate("/teams");
    onClose();
  };

  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 w-[420px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl border border-black/10 shadow-2xl z-50 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/8">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-black">Messages</span>
          <span className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded-full">2 unread</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCompose(c => !c)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs font-medium flex items-center gap-1 hover:bg-gray-800 transition-colors">
            <Send className="h-3 w-3" /> Compose
          </button>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EAF1F8] text-black/40 transition-colors"><X className="h-4 w-4" /></button>
        </div>
      </div>

      {sentMsg && (
        <div className="px-5 py-2 bg-slate-50 border-b border-slate-200 text-xs text-[#0F172A] font-medium">{sentMsg}</div>
      )}

      {compose && (
        <div className="border-b border-black/8 bg-[#fafafa] p-4 space-y-2">
          <input value={to} onChange={e => setTo(e.target.value)} placeholder="To: name@gov.zw" className="w-full h-8 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
          <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full h-8 px-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Message…" rows={3} className="w-full px-3 py-2 rounded-lg border border-black/10 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-black/10" />
          <div className="flex justify-end gap-2">
            <button onClick={() => setCompose(false)} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8]">Discard</button>
            <button onClick={handleSend} disabled={!to.trim() || !subject.trim()} className="h-7 px-3 rounded-lg bg-black text-white text-xs flex items-center gap-1 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"><Send className="h-3 w-3" /> Send</button>
          </div>
        </div>
      )}

      <div className="overflow-y-auto max-h-[360px] divide-y divide-black/5">
        {DEMO_MESSAGES.map(m => (
          <div key={m.id} onClick={() => handleOpenMessage(m)} className={`flex items-start gap-3 px-5 py-3.5 hover:bg-[#EAF1F8]/60 transition-colors cursor-pointer ${m.unread ? "" : "opacity-60"}`}>
            <div className="h-8 w-8 rounded-full bg-black text-white text-xs font-bold grid place-items-center flex-shrink-0">{m.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className={`text-xs ${m.unread ? "font-semibold text-black" : "font-medium text-black/70"} truncate`}>{m.from}</span>
                <span className="text-[10px] text-black/35 flex-shrink-0">{m.time}</span>
              </div>
              <p className={`text-xs truncate ${m.unread ? "text-black" : "text-black/60"}`}>{m.subject}</p>
              <p className="text-[11px] text-black/40 truncate mt-0.5">{m.preview}</p>
            </div>
            {m.unread && <div className="h-2 w-2 rounded-full bg-black flex-shrink-0 mt-1.5" />}
          </div>
        ))}
      </div>
      <div className="border-t border-black/8 px-5 py-2.5 bg-[#fafafa]">
        <button onClick={handleViewAll} className="text-xs font-medium text-black hover:underline">View all messages →</button>
      </div>
    </div>
  );
}

/* ─── Inbox Panel ───────────────────────────────────────────────────────── */
const DEMO_INBOX = [
  { id: "i1", title: "Solar Mini-Grids Tender — Awaiting Approval",  type: "Approval",  priority: "High",   from: "P. Dube",       time: "09:30", status: "Pending"   },
  { id: "i2", title: "INV-2026-4821 — Payment Authorisation Request", type: "Payment",   priority: "High",   from: "R. Chikwanda",  time: "08:55", status: "Pending"   },
  { id: "i3", title: "Contract Variation — Beitbridge Sect 3",        type: "Variation", priority: "Medium", from: "A. Mpofu",      time: "Yesterday", status: "Pending" },
  { id: "i4", title: "Vendor Registration — VEN-00489",               type: "Review",    priority: "Low",    from: "System",        time: "Yesterday", status: "Pending" },
  { id: "i5", title: "Budget Reallocation Request — Transport",       type: "Approval",  priority: "Medium", from: "F. Mutanga",    time: "Mon",    status: "Approved"  },
];
const ITEM_COLORS: Record<string, string> = {
  Approval: "bg-slate-100 text-[#0F172A]", Payment: "bg-slate-100 text-[#0F172A]",
  Variation: "bg-slate-100 text-[#0F172A]", Review: "bg-slate-100 text-[#0F172A]",
};

function InboxPanel({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  useClickOutside(ref, onClose);
  const [approvedItems, setApprovedItems] = useState<string[]>(["i5"]);
  const pending = DEMO_INBOX.filter(i => !approvedItems.includes(i.id));

  const handleApprove = (id: string, title: string) => {
    setApprovedItems(prev => [...prev, id]);
    markNotificationsRead();
  };

  const handleReview = (id: string, title: string) => {
    // navigate to relevant page based on item type
  };

  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 w-[400px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl border border-black/10 shadow-2xl z-50 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/8">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-black">Action Inbox</span>
          {pending.length > 0 && <span className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded-full">{pending.length} pending</span>}
        </div>
        <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-[#EAF1F8] text-black/40 transition-colors"><X className="h-4 w-4" /></button>
      </div>
      <div className="overflow-y-auto max-h-[380px] divide-y divide-black/5">
        {DEMO_INBOX.map(item => {
          const isApproved = approvedItems.includes(item.id);
          return (
            <div key={item.id} className="px-5 py-3.5 hover:bg-[#EAF1F8]/60 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 mt-0.5 ${ITEM_COLORS[item.type] ?? "bg-gray-100 text-gray-600"}`}>{item.type}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${!isApproved ? "text-black" : "text-black/50"}`}>{item.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-black/40">From: {item.from}</span>
                    <span className="text-[10px] text-black/25">·</span>
                    <span className="text-[10px] text-black/40">{item.time}</span>
                  </div>
                </div>
                {!isApproved ? (
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleApprove(item.id, item.title)} className="h-6 px-2 rounded-md bg-black text-white text-[10px] font-medium hover:bg-gray-800 transition-colors">Approve</button>
                    <button onClick={() => handleReview(item.id, item.title)} className="h-6 px-2 rounded-md border border-black/10 text-[10px] text-black/60 hover:bg-[#EAF1F8] transition-colors">Review</button>
                  </div>
                ) : (
                  <span className="text-[10px] font-semibold text-[#0F172A] flex-shrink-0">✓ Done</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-black/8 px-5 py-2.5 bg-[#fafafa]">
        <button onClick={() => { navigate("/tenders"); onClose(); }} className="text-xs font-medium text-black hover:underline">View full inbox →</button>
      </div>
    </div>
  );
}

/* ─── Role-based nav whitelist ──────────────────────────────────────────── */
// minister and system_admin get full access (no whitelist = all routes allowed)
const FULL_ACCESS_ROLES = new Set<string>(["minister", "system_admin", "cpo", "permanent_secretary", "president", "prime_minister", "procurement_director", "hr_manager", "chief_executive", "executive_director"]);

// New routes always accessible to all authenticated users
const ALWAYS_ALLOWED = new Set([
  "/intake", "/marketplace", "/agents/orchestration", "/spend-intelligence",
  "/tenders-hub", "/tenders/module", "/asset-declarations", "/annual-procurement-plan",
  "/report-service-delivery",
]);

const ROLE_NAV_WHITELIST: Partial<Record<UserRole, string[]>> = {
  // Procurement officer — manages tenders, RFQs, lifecycle
  procurement_officer: [
    "/dashboard", "/teams", "/workbench", "/tenders", "/tenders-lifecycle", "/lifecycle",
    "/tenders-hub", "/tenders/module",
    "/rfq", "/rfp-eoi", "/planning", "/vendors", "/certificates",
    "/intake", "/marketplace",
    "/annual-procurement-plan",
    "/utility", "/utility/catalogue", "/utility/communications", "/utility/gazette", "/utility/announcements",
    "/procurement/planning", "/procurement/requisition", "/procurement/strategy",
    "/procurement/tender-preparation", "/procurement/advertisement", "/procurement/bid-submission",
    "/procurement/contract-award", "/procurement/contract-execution", "/procurement/contract-closure",
    "/procurement/final-acceptance", "/procurement/warranty-management",
    "/procurement/supplier-evaluation",
    // New workbench routes
    "/workbench/planning", "/workbench/requisition", "/workbench/strategy",
    "/workbench/tender-preparation", "/workbench/tender-management", "/workbench/rfq",
    "/workbench/rfp", "/workbench/eoi", "/workbench/auction", "/workbench/bid-submission",
    "/workbench/bid-opening", "/workbench/bid-evaluation", "/workbench/recommendation",
    "/workbench/contract-award", "/workbench/contract-execution", "/workbench/contract-management",
    "/workbench/project-monitoring", "/workbench/payment-management", "/workbench/contract-closure",
    "/workbench/asset-management", "/workbench/performance-eval", "/workbench/governance",
    "/workbench/appeals", "/workbench/audit", "/workbench/reports", "/workbench/ai-analytics",
    "/workbench/competency-assessment",
    "/knowledge-base", "/notifications",
  ],

  // Evaluator — only evaluation-related pages
  evaluator: [
    "/dashboard", "/teams", "/workbench", "/tenders", "/evaluations", "/awards", "/certificates",
    "/workbench/bid-evaluation", "/workbench/recommendation", "/workbench/bid-submission",
    "/procurement/bid-submission",
  ],

  // Finance officer — payments, invoices, budget
  finance_officer: [
    "/dashboard", "/teams", "/workbench", "/finance",
    "/budget", "/budget/execution", "/budget/expenditure", "/budget/commitments",
    "/budget/revenue", "/budget/treasury", "/utility/catalogue",
    "/workbench/payment-management", "/workbench/contract-management",
  ],

  // Auditor — audit, anti-corruption, compliance
  auditor: [
    "/dashboard", "/teams", "/audit", "/anti-corruption", "/analytics",
    "/bi-dashboards", "/utility/public-records", "/budget", "/budget/fraud", "/budget/execution",
    "/workbench/audit", "/workbench/governance", "/workbench/reports",
  ],

  // Contract manager / officer
  contract_manager: [
    "/dashboard", "/teams", "/contracts", "/vendors", "/performance", "/finance",
    "/certificates", "/utility/catalogue", "/utility/communications",
    "/procurement/contract-award", "/procurement/contract-execution", "/procurement/contract-closure",
    "/procurement/final-acceptance", "/procurement/warranty-management",
    "/procurement/asset-handover", "/procurement/supplier-evaluation",
    "/procurement/financial-reconciliation", "/lessons-learned", "/knowledge-base",
    "/workbench/contract-award", "/workbench/contract-execution", "/workbench/contract-management",
    "/workbench/project-monitoring", "/workbench/payment-management", "/workbench/contract-closure",
    "/workbench/performance-eval",
  ],
  contract_officer: [
    "/dashboard", "/teams", "/contracts", "/vendors", "/certificates",
    "/procurement/contract-award", "/procurement/contract-execution",
    "/procurement/contract-closure", "/procurement/final-acceptance", "/knowledge-base",
    "/workbench/contract-award", "/workbench/contract-execution", "/workbench/contract-closure",
  ],

  // Budget / treasury officer
  budget_officer: [
    "/dashboard", "/teams", "/budget", "/budget/centres", "/budget/formulation",
    "/budget/execution", "/budget/commitments", "/budget/expenditure", "/budget/revenue",
    "/budget/treasury", "/budget/fraud", "/budget/ai-agents", "/finance", "/analytics",
    "/utility/catalogue", "/workbench/payment-management",
    "/annual-procurement-plan",
  ],
  treasury_officer: [
    "/dashboard", "/teams", "/budget", "/budget/treasury", "/budget/revenue",
    "/budget/execution", "/finance", "/workbench/payment-management",
  ],

  // Planning officer
  planning_officer: [
    "/dashboard", "/teams", "/planning", "/tenders", "/utility/catalogue",
    "/procurement/planning", "/procurement/requisition", "/procurement/strategy",
    "/procurement/tender-preparation", "/procurement/advertisement", "/procurement/contract-award",
    "/workbench/planning", "/workbench/requisition", "/workbench/strategy",
    "/workbench/tender-preparation", "/workbench/tender-management",
  ],

  // Compliance officer
  compliance_officer: [
    "/dashboard", "/teams", "/audit", "/anti-corruption", "/governance",
    "/utility/public-records", "/utility/announcements", "/corporate",
    "/procurement/tender-preparation", "/procurement/advertisement", "/procurement/bid-submission",
    "/workbench/governance", "/workbench/appeals", "/workbench/audit",
  ],

  // Legal officer
  legal_officer: [
    "/dashboard", "/teams", "/contracts", "/audit", "/governance",
    "/utility/announcements",
    "/procurement/tender-preparation", "/procurement/advertisement",
    "/workbench/contract-award", "/workbench/contract-execution", "/workbench/governance",
  ],

  // Stores officer
  stores_officer: [
    "/dashboard", "/teams", "/inventory", "/inventory/items", "/inventory/receiving",
    "/inventory/requests", "/inventory/warehouse", "/inventory/stock-count",
    "/inventory/reconciliation", "/inventory/ai-agents", "/contracts", "/utility/catalogue",
    "/workbench/asset-management",
  ],

  // Project manager
  project_manager: [
    "/dashboard", "/teams", "/staff-productivity", "/department-activities",
    "/contracts", "/performance", "/vendors", "/utility/catalogue",
    "/procurement/contract-execution",
    "/workbench/project-monitoring", "/workbench/contract-management",
    "/workbench/payment-management",
  ],

  // Anti-corruption / ethics
  anti_corruption_officer: ["/dashboard", "/teams", "/anti-corruption", "/audit", "/vendors", "/workbench/audit"],
  ethics_officer:          ["/dashboard", "/teams", "/anti-corruption", "/governance", "/workbench/governance"],

  // Performance officer
  performance_officer: [
    "/dashboard", "/teams", "/staff-productivity", "/department-activities",
    "/performance", "/vendors", "/contracts", "/analytics", "/corporate",
    "/workbench/performance-eval",
  ],

  // IT officer / system admin — full access
  it_officer: [
    "/dashboard", "/teams", "/staff-productivity", "/department-activities",
    "/analytics", "/bi-dashboards", "/ai-agents", "/roles", "/governance",
    "/organisations", "/utility", "/corporate", "/prime-entity", "/system-admin",
    "/notifications", "/reports", "/executive-dashboard", "/knowledge-base",
  ],
  system_admin: [
    "/dashboard", "/teams", "/staff-productivity", "/department-activities",
    "/analytics", "/bi-dashboards", "/ai-agents", "/roles", "/governance",
    "/organisations", "/utility", "/corporate", "/prime-entity", "/system-admin",
    "/notifications", "/reports", "/executive-dashboard", "/knowledge-base", "/lessons-learned",
  ],

  // Risk officer
  risk_officer: ["/dashboard", "/teams", "/audit", "/anti-corruption", "/analytics", "/contracts", "/workbench/audit"],

  // Adjudication officer
  adjudication_officer: [
    "/dashboard", "/teams", "/evaluations", "/awards", "/tenders", "/certificates",
    "/utility/announcements", "/procurement/bid-submission", "/procurement/advertisement",
    "/workbench/bid-evaluation", "/workbench/recommendation",
  ],

  // Audit officer / public auditor
  audit_officer:  ["/dashboard", "/teams", "/audit", "/anti-corruption", "/analytics", "/workbench/audit"],
  public_auditor: ["/dashboard", "/audit", "/portal", "/utility/public-records"],

  // Records officer
  records_officer: ["/dashboard", "/teams", "/audit", "/governance", "/utility/public-records"],

  // Inspection / QA
  inspection_officer: ["/dashboard", "/teams", "/contracts", "/performance", "/workbench/project-monitoring"],
  qa_officer:         ["/dashboard", "/teams", "/contracts", "/vendors", "/performance", "/workbench/performance-eval"],

  // Asset manager
  asset_manager: [
    "/dashboard", "/teams", "/assets", "/assets/maintenance", "/assets/financials",
    "/assets/disposal", "/contracts", "/governance", "/utility/catalogue",
    "/workbench/asset-management",
  ],

  // Logistics officer
  logistics_officer: [
    "/dashboard", "/teams", "/inventory", "/inventory/receiving", "/inventory/requests",
    "/inventory/warehouse", "/contracts", "/vendors", "/utility/catalogue",
    "/workbench/asset-management",
  ],

  // Vendor / supplier access — vendor portal workbench
  supplier: [
    "/dashboard", "/portal", "/supplier-portal",
    "/procurement/bid-submission", "/procurement/advertisement",
    "/vendor-workbench", "/vendor-workbench/dashboard", "/vendor-workbench/tasks",
    "/vendor-workbench/tender-search", "/vendor-workbench/rfq-search",
    "/vendor-workbench/rfp-search", "/vendor-workbench/eoi-search",
    "/vendor-workbench/auctions", "/vendor-workbench/bid-submission",
    "/vendor-workbench/submitted-bids", "/vendor-workbench/clarifications",
    "/vendor-workbench/contracts", "/vendor-workbench/payments",
    "/vendor-workbench/notifications", "/vendor-workbench/messages",
    "/vendor-workbench/documents", "/vendor-workbench/ai", "/vendor-workbench/audit",
  ],
  sme_supplier: [
    "/dashboard", "/portal", "/supplier-portal",
    "/vendor-workbench", "/vendor-workbench/dashboard", "/vendor-workbench/tasks",
    "/vendor-workbench/tender-search", "/vendor-workbench/bid-submission",
    "/vendor-workbench/submitted-bids", "/vendor-workbench/clarifications",
    "/vendor-workbench/payments", "/vendor-workbench/documents",
  ],
  vendor_user: [
    "/dashboard", "/portal", "/supplier-portal",
    "/vendor-workbench", "/vendor-workbench/dashboard", "/vendor-workbench/tasks",
    "/vendor-workbench/tender-search", "/vendor-workbench/bid-submission",
    "/vendor-workbench/submitted-bids", "/vendor-workbench/notifications",
  ],

  // Communications officer — gets full utility access + advertisement management
  communications_officer: [
    "/dashboard", "/teams", "/tenders", "/portal", "/governance",
    "/utility", "/utility/communications", "/utility/gazette", "/utility/announcements",
    "/utility/public-records", "/utility/media",
    "/procurement/advertisement", "/procurement/tender-preparation",
    "/workbench/tender-management",
  ],

  // HSE / environment
  health_safety_officer: ["/dashboard", "/teams", "/contracts", "/governance"],
  environment_officer:   ["/dashboard", "/teams", "/contracts", "/governance"],

  // Citizen / end user
  citizen:  ["/dashboard", "/portal"],
  end_user: [
    "/dashboard", "/teams", "/tenders", "/planning",
    "/procurement/requisition", "/procurement/bid-submission",
    "/vendor-workbench/tender-search",
  ],

  // Board / executive director — strategic overview only
  executive_director: [
    "/dashboard", "/teams", "/analytics", "/contracts", "/finance",
    "/utility/announcements", "/corporate",
    "/workbench/reports", "/workbench/ai-analytics",
  ],
  board_member: ["/dashboard", "/analytics", "/governance", "/corporate", "/workbench/reports"],

  // Regulator
  regulator: [
    "/dashboard", "/teams", "/analytics", "/audit", "/anti-corruption", "/governance",
    "/vendors", "/tenders", "/utility/public-records", "/utility/gazette", "/prime-entity",
    "/workbench/audit", "/workbench/reports",
  ],

  // AI governance
  ai_governance_officer:  ["/dashboard", "/teams", "/ai-agents", "/analytics", "/governance", "/workbench/ai-analytics"],
  data_analytics_officer: ["/dashboard", "/teams", "/staff-productivity", "/analytics", "/bi-dashboards", "/ai-agents", "/workbench/ai-analytics"],

  // HR roles — full E-Recruitment portal access
  hr_manager: [
    "/dashboard", "/teams", "/human-resources", "/human-resources/recruitment-crm",
    "/e-recruitment", "/e-recruitment/hr-planning", "/e-recruitment/recruitment",
    "/e-recruitment/contracting", "/e-recruitment/orientation", "/e-recruitment/employee-management",
    "/e-recruitment/ptd", "/e-recruitment/exit-retirement",
    "/staff-productivity", "/department-activities", "/analytics", "/bi-dashboards",
    "/reports", "/notifications", "/gis",
  ],
  hr_officer: [
    "/dashboard", "/teams", "/human-resources", "/human-resources/recruitment-crm",
    "/e-recruitment", "/e-recruitment/hr-planning", "/e-recruitment/recruitment",
    "/e-recruitment/contracting", "/e-recruitment/orientation", "/e-recruitment/employee-management",
    "/e-recruitment/ptd", "/e-recruitment/exit-retirement",
    "/staff-productivity", "/notifications", "/gis",
  ],
  welfare_officer: [
    "/dashboard", "/teams", "/human-resources", "/e-recruitment",
    "/e-recruitment/employee-management", "/e-recruitment/exit-retirement",
    "/staff-productivity", "/notifications",
  ],
};


function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
    </svg>
  );
}

/** Database-folder icon matching the sidebar design in the reference image */
function DbFolderIcon({ active = false, size = 22 }: { active?: boolean; size?: number }) {
  const teal = active ? "#fff" : "#334155";
  const dark = active ? "rgba(255,255,255,0.7)" : "#0F172A";
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      {/* Folder body */}
      <rect x="2" y="14" width="28" height="19" rx="2.5" fill={dark} />
      {/* Folder tab */}
      <path d="M2 14 L2 11 Q2 9 4 9 L13 9 L15.5 12 L30 12 Q32 12 32 14 Z" fill={dark} opacity="0.75" />
      {/* Database cylinders (stacked) */}
      <ellipse cx="21" cy="10" rx="9" ry="3" fill={teal} />
      <rect x="12" y="10" width="18" height="5" fill={teal} />
      <ellipse cx="21" cy="15" rx="9" ry="3" fill={teal} />
      <rect x="12" y="15" width="18" height="5" fill={teal} opacity="0.85" />
      <ellipse cx="21" cy="20" rx="9" ry="3" fill={teal} opacity="0.7" />
      {/* Shine on top cylinder */}
      <path d="M15 9.5 Q21 7 27 9.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

const iconMap: Record<string, React.ElementType> = {
  // Layout & navigation
  LayoutDashboard, ChevronRight, ChevronDown, Menu,
  // Charts & data
  BarChart3, TrendingUp, Activity,
  // Procurement & documents
  Sparkles, ClipboardList, FileText, Trophy, FileSignature, BookOpen, Newspaper,
  Briefcase, CheckCircle, FolderOpen, Edit3,
  // Finance
  Wallet, DollarSign, PiggyBank,
  // Security & compliance
  ShieldCheck, AlertOctagon, Landmark, Scale, ShoppingCart, Gavel, Award,
  // People
  UsersRound, Users, User, UserPlus, Headphones, Crown, Monitor, Target,
  // Buildings & locations
  Building2, MapPin, Globe2, Globe, Warehouse,
  // Assets & inventory
  Package, Wrench, Trash2, Tag, Boxes, PackageCheck, ScanLine,
  // Communication
  MessageSquare, Mail, Send, Bell, Megaphone, Radio, Image,
  // Misc
  Star, Search, Settings, Clock,
  // New feature icons
  BadgeCheck, CalendarDays,
  // 2026 feature icons
  Bot, Zap,
  // Budget & procurement additions
  Layers, Plus, KeyRound,
};

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const { user, logout } = useAuth();
  const { notifications, unread, refresh: refreshNotifs } = useNotifications();
  const [showNotifs, setShowNotifs]   = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showInbox, setShowInbox]     = useState(false);
  const [showSearch, setShowSearch]   = useState(false);
  // Mobile drawer open/close
  const [mobileOpen, setMobileOpen]   = useState(false);
  // Desktop sidebar collapsed/expanded (persisted in localStorage)
  const [collapsed, setCollapsed]     = useState(() => {
    try { return localStorage.getItem("sidebar-collapsed") === "true"; } catch { return false; }
  });
  const [search, setSearch] = useState("");
  const { tenders } = useTenders();

  // ── Light / Dark theme toggle (persisted) ───────────────────────────────
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      return (localStorage.getItem("theme") as "light" | "dark") ?? "light";
    } catch { return "light"; }
  });
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);
  const toggleTheme = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  const toggleCollapsed = () => {
    setCollapsed(v => {
      const next = !v;
      try { localStorage.setItem("sidebar-collapsed", String(next)); } catch {}
      return next;
    });
  };

  const handleLogout = () => { logout(); navigate("/"); };

  const closeAll = () => { setShowNotifs(false); setShowMessages(false); setShowInbox(false); };

  const toggleNotifs = () => {
    const next = !showNotifs;
    closeAll();
    setShowNotifs(next);
    if (next) { markNotificationsRead(); setTimeout(refreshNotifs, 200); }
  };
  const toggleMessages = () => { closeAll(); setShowMessages(v => !v); };
  const toggleInbox    = () => { closeAll(); setShowInbox(v => !v); };

  // Filter nav items based on the user's role whitelist
  const allowedRoutes = user?.role ? ROLE_NAV_WHITELIST[user.role] : undefined;

  const isRouteAllowed = (itemTo: string) => {
    if (ALWAYS_ALLOWED.has(itemTo)) return true;
    if (user?.role && FULL_ACCESS_ROLES.has(user.role)) return true;
    if (!allowedRoutes) return true;
    return allowedRoutes.some(
      allowed =>
        allowed === itemTo ||
        allowed.startsWith(itemTo + "/") ||
        itemTo.startsWith(allowed + "/")
    );
  };

  const filteredNavSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => isRouteAllowed(item.to)),
  })).filter(section => section.items.length > 0);

  // ── Global search: pages + tenders + vendors ────────────────────────────
  const q = search.trim().toLowerCase();
  const pageResults = q.length > 1
    ? navSections.flatMap(s => s.items.map(i => ({ ...i, section: s.label })))
        .filter(i => i.label.toLowerCase().includes(q) || i.section.toLowerCase().includes(q))
        .slice(0, 6)
    : [];
  const tenderResults = q.length > 1
    ? tenders.filter(t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)).slice(0, 5)
    : [];
  const hasResults = pageResults.length > 0 || tenderResults.length > 0;

  // Sidebar width tokens
  const sidebarW = collapsed ? "w-[52px]" : "w-[240px]";

  // ── Expandable sidebar sections state ────────────────────────────────────
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    navSections.forEach(section => {
      if (section.items.some(item =>
        pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to + "/"))
      )) {
        initial.add(section.label);
      }
    });
    if (initial.size === 0 && navSections.length > 0) initial.add(navSections[0].label);
    return initial;
  });

  const toggleSection = (label: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  // ── Shared nav content renderer ──────────────────────────────────────────
  // Design: dark navy sidebar, blue active row, pill badges, numbered sub-items
  const NavContent = ({ onLinkClick }: { onLinkClick?: () => void }) => {
    return (
      <nav className="py-2 space-y-px">
        {filteredNavSections.map((section, sectionIdx) => {
          const SectionIcon = iconMap[(section as any).icon ?? "LayoutDashboard"] ?? LayoutDashboard;
          const isExpanded = expandedSections.has(section.label);
          const hasActiveItem = section.items.some(item =>
            pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to + "/"))
          );
          // Section-level badge = number of items
          const sectionBadge = section.items.length;

          // ── Collapsed: icon-only with blue dot for active ──────────────
          if (collapsed) {
            return (
              <div key={section.label} className="relative group/section px-1.5">
                <button
                  onClick={() => toggleSection(section.label)}
                  title={section.label}
                  className={`w-9 h-9 mx-auto flex items-center justify-center rounded-lg transition-all
                    ${hasActiveItem
                      ? "bg-[#0F172A] text-white shadow-[0_0_10px_#0F172A40]"
                      : "text-white/40 hover:bg-white/10 hover:text-white"}`}
                >
                  <DbFolderIcon active={hasActiveItem} size={20} />
                </button>
                {/* Flyout */}
                <div className="absolute left-full top-0 ml-2 w-56 bg-[#0F172A] rounded-xl border border-white/10 shadow-2xl z-50 opacity-0 pointer-events-none group-hover/section:opacity-100 group-hover/section:pointer-events-auto transition-opacity overflow-hidden">
                  <div className="px-3 py-2.5 border-b border-white/8 flex items-center gap-2">
                    <DbFolderIcon active={false} size={18} />
                    <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">{section.label}</span>
                  </div>
                  <div className="py-1.5">
                    {section.items.map((item, idx) => {
                      const Icon = iconMap[item.icon] ?? LayoutDashboard;
                      const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to + "/"));
                      return (
                        <Link key={item.to} to={item.to} onClick={onLinkClick}
                          className={`flex items-center gap-2.5 px-3 py-2 text-xs transition-colors
                            ${active ? "bg-[#0F172A] text-white" : "text-white/80 hover:bg-white/8 hover:text-white"}`}>
                          <span className="text-[10px] text-white/50 w-4 flex-shrink-0 font-mono">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="flex-1 truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          // ── Expanded sidebar ───────────────────────────────────────────
          return (
            <div key={section.label}>
              {/* Section header row */}
              <button
                onClick={() => toggleSection(section.label)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 transition-all group
                  ${hasActiveItem && isExpanded
                    ? "bg-[#0F172A] text-white"
                    : hasActiveItem
                    ? "bg-[#0F172A]/20 text-[#60a5fa]"
                    : "text-white/85 hover:bg-white/8 hover:text-white"}`}
              >
                <DbFolderIcon active={hasActiveItem && isExpanded} size={22} />
                <span className="flex-1 text-left text-[13px] font-medium tracking-wide truncate">
                  {section.label}
                </span>
                {/* Pill badge */}
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 transition-colors
                  ${hasActiveItem && isExpanded
                    ? "bg-[#0F172A] text-white"
                    : "bg-white/10 text-white/75"}`}>
                  {sectionBadge}
                </span>
              </button>

              {/* Sub-items */}
              {isExpanded && (
                <div className="bg-[#0F172A]">
                  {section.items.map((item, idx) => {
                    const Icon = iconMap[item.icon] ?? LayoutDashboard;
                    const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to + "/"));
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={onLinkClick}
                        className={`flex items-center gap-2.5 px-4 py-2 transition-colors group/item
                          ${active
                            ? "bg-[#0F172A]/20 text-[#93c5fd] border-l-2 border-[#3b82f6]"
                            : "text-white/75 hover:bg-white/6 hover:text-white border-l-2 border-transparent"}`}
                      >
                        {/* Number */}
                        <span className="text-[10px] font-mono text-white/45 w-5 flex-shrink-0 select-none">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${active ? "text-[#60a5fa]" : "text-white/55 group-hover/item:text-white/80"}`} />
                        <span className="flex-1 truncate text-[12px]">{item.label}</span>
                        {/* Pill badge on active */}
                        {active && (
                          <span className="text-[10px] bg-[#0F172A]/20 text-[#93c5fd] border border-[#3b82f6]/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            ●
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#EAF1F8] text-foreground overflow-hidden">

      {/* ── Top nav ─────────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-white/8 bg-[#0f172a] flex items-center px-3 md:px-4 gap-2 md:gap-3 flex-shrink-0 z-30 shadow-md">

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors flex-shrink-0"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors flex-shrink-0"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed
            ? <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          }
        </button>

        <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
          <div className="h-8 w-8 rounded-full ai-logo-gradient ai-logo-glow flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="leading-none hidden sm:block">
            <div className="text-[11px] font-extrabold text-white tracking-wide leading-tight uppercase">Electronic Government Procurement</div>
            <div className="text-[9px] font-semibold text-white/65 tracking-tight leading-snug">Artificial Intelligence Powered · Automated Oversight</div>
            <div className="text-[9px] font-semibold text-white/45 tracking-tight leading-snug">Intelligence System</div>
          </div>
          <div className="leading-tight sm:hidden">
            <div className="text-[10px] font-extrabold text-white tracking-wide uppercase">Electronic Government Procurement</div>
            <div className="text-[9px] font-semibold text-white/50 tracking-tight">Artificial Intelligence Powered · Oversight</div>
          </div>
        </Link>

        {/* Desktop Search */}
        <div className="flex-1 max-w-2xl relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tenders, vendors, contracts…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-white/10 bg-white/8 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 transition-shadow"
          />
          {hasResults && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-[#0F172A] rounded-xl border border-white/10 shadow-2xl z-50 max-h-96 overflow-y-auto">
              {pageResults.length > 0 && (
                <div>
                  <div className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">Pages</div>
                  {pageResults.map((r, i) => (
                    <button key={`p-${i}`} onClick={() => { navigate(r.to); setSearch(""); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors border-b border-white/5">
                      <div className="text-sm font-medium text-white truncate">{r.label}</div>
                      <div className="text-[11px] text-white/40">{r.section} · {r.to}</div>
                    </button>
                  ))}
                </div>
              )}
              {tenderResults.length > 0 && (
                <div>
                  <div className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-white/40">Tenders</div>
                  {tenderResults.map(t => (
                    <button key={t.id} onClick={() => { navigate(`/tenders/${t.id}`); setSearch(""); }}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0">
                      <div className="text-sm font-medium text-white truncate">{t.title}</div>
                      <div className="text-[11px] text-white/40">{t.id} · {t.status}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 md:hidden" />

        {/* Mobile search toggle */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="md:hidden h-9 w-9 grid place-items-center rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors flex-shrink-0"
          aria-label="Toggle search"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Action Inbox */}
        <div className="relative flex-shrink-0">
          <button onClick={toggleInbox}
            className={`relative h-9 w-9 grid place-items-center rounded-lg transition-colors ${showInbox ? "bg-[#0F172A] text-white" : "hover:bg-white/10 text-white/50 hover:text-white"}`}
            aria-label="Action inbox">
            <Inbox className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-3.5 min-w-3.5 px-0.5 rounded-full bg-[#0F172A] text-white text-[9px] font-bold grid place-items-center">4</span>
          </button>
          {showInbox && <InboxPanel onClose={() => setShowInbox(false)} />}
        </div>

        {/* Messages */}
        <div className="relative flex-shrink-0">
          <button onClick={toggleMessages}
            className={`relative h-9 w-9 grid place-items-center rounded-lg transition-colors ${showMessages ? "bg-[#0F172A] text-white" : "hover:bg-white/10 text-white/50 hover:text-white"}`}
            aria-label="Messages">
            <MessageSquare className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-3.5 min-w-3.5 px-0.5 rounded-full bg-[#0F172A] text-white text-[9px] font-bold grid place-items-center">2</span>
          </button>
          {showMessages && <MessagesPanel user={user} onClose={() => setShowMessages(false)} />}
        </div>

        {/* Notifications */}
        <div className="relative flex-shrink-0">
          <button onClick={toggleNotifs}
            className={`relative h-9 w-9 grid place-items-center rounded-lg transition-colors ${showNotifs ? "bg-[#0F172A] text-white" : "hover:bg-white/10 text-white/50 hover:text-white"}`}
            aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 h-3.5 min-w-3.5 px-0.5 rounded-full bg-[#0F172A] text-white text-[9px] font-bold grid place-items-center">{unread > 9 ? "9+" : unread}</span>
            )}
          </button>
          {showNotifs && (
            <NotificationsPanel
              notifications={notifications as { id: string; msg: string; type: string; time: string; read: boolean }[]}
              onClose={() => setShowNotifs(false)}
              onMarkAllRead={() => { markNotificationsRead(); setTimeout(refreshNotifs, 200); setShowNotifs(false); }}
            />
          )}
        </div>

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors flex-shrink-0"
          aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* AI Co-Pilot button — top right */}
        <Link
          to="/ai-agents"
          className="hidden sm:flex items-center gap-1.5 px-3 h-9 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:opacity-90 transition-opacity flex-shrink-0 shadow-sm border border-white/10"
          aria-label="AI Co-Pilot"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Co&#8209;Pilot</span>
          <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse" />
        </Link>

        {/* User menu */}
        <div className="relative group flex-shrink-0">
          <button className="flex items-center gap-1.5 pl-2 pr-1 h-9 rounded-lg hover:bg-white/10 transition-colors">
            <div className="h-7 w-7 rounded-full bg-white/20 text-white text-xs font-semibold grid place-items-center">{user?.avatar ?? "U"}</div>
            <div className="text-left leading-tight hidden md:block">
              <div className="text-xs font-medium text-white">{user?.name ?? "Guest"}</div>
              <div className="text-[10px] text-white/40">{user?.department ?? ""}</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-white/30 hidden md:block" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-white/10 bg-[#0F172A] shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 overflow-hidden">
            <div className="px-3 py-2.5 border-b border-white/10">
              <div className="text-xs font-semibold text-white">{user?.name}</div>
              <div className="text-[10px] text-white/40">{user?.entity}</div>
            </div>
            <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:bg-white/8 hover:text-white transition-colors">
              <User className="h-3.5 w-3.5" /> My Dashboard
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile search bar ────────────────────────────────────────────── */}
      {showSearch && (
        <div className="md:hidden px-3 py-2 bg-[#0f172a] border-b border-white/8 flex-shrink-0 z-20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tenders, vendors, contracts…"
              className="w-full h-9 pl-9 pr-8 rounded-lg border border-white/10 bg-white/8 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20"
            />
            <button onClick={() => { setShowSearch(false); setSearch(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          {hasResults && (
            <div className="mt-1 bg-[#0F172A] rounded-xl border border-white/10 shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto">
              {pageResults.map((r, i) => (
                <button key={`mp-${i}`} onClick={() => { navigate(r.to); setSearch(""); setShowSearch(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors border-b border-white/5">
                  <div className="text-sm font-medium text-white truncate">{r.label}</div>
                  <div className="text-[11px] text-white/40">{r.section}</div>
                </button>
              ))}
              {tenderResults.map(t => (
                <button key={t.id} onClick={() => { navigate(`/tenders/${t.id}`); setSearch(""); setShowSearch(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0">
                  <div className="text-sm font-medium text-white truncate">{t.title}</div>
                  <div className="text-[11px] text-white/40">{t.id} · {t.status}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Body row (sidebar + main) ────────────────────────────────────── */}
      {/* Key: flex row fills remaining height, both children overflow-y-auto independently */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Desktop sidebar ───────────────────────────────────────────── */}
        <aside className={`
          hidden md:flex flex-col flex-shrink-0
          border-r border-white/5 bg-[#0f172a]
          transition-[width] duration-200 ease-in-out
          overflow-hidden
          ${sidebarW}
        `}>
          {/* Scrollable nav */}
          <div className="sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden py-2 min-h-0">
            <NavContent />
          </div>

          {/* Sign Out / Collapse pinned at bottom */}
          <div className="flex-shrink-0 border-t border-white/8 p-2 space-y-1">
            {/* Sign out button — matches design image */}
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-white/50 hover:text-white hover:bg-white/8 transition-colors rounded-lg"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className="text-[13px] font-medium">Sign Out</span>
              </button>
            )}
            {collapsed && (
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="w-9 h-9 mx-auto flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
            {/* Collapse toggle */}
            <button
              onClick={toggleCollapsed}
              className={`w-full h-7 flex items-center gap-2 text-white/25 hover:text-white/60 transition-colors text-xs
                ${collapsed ? "justify-center" : "px-4"}`}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed
                ? <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                : <>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                    <span>Collapse</span>
                  </>
              }
            </button>
          </div>
        </aside>

        {/* ── Mobile sidebar backdrop ──────────────────────────────────── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ── Mobile sidebar drawer ────────────────────────────────────── */}
        <aside className={`
          fixed top-0 left-0 h-full w-72 bg-[#0f172a] border-r border-white/5 z-50 flex flex-col
          transform transition-transform duration-300 ease-in-out md:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="flex items-center justify-between px-4 h-14 border-b border-white/8 flex-shrink-0">
            <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <div className="leading-none">
                <div className="text-[13px] font-extrabold text-white tracking-wide leading-tight uppercase">Artificial Intelligence Powered Electronic Government Procurement &amp; Automated Oversight Intelligence System</div>
                <div className="text-[10px] font-semibold text-white/50 tracking-tight leading-snug">Artificial Intelligence Powered Public Procurement</div>
              </div>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="h-9 w-9 grid place-items-center rounded-lg hover:bg-white/10 text-white/40 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="sidebar-scroll flex-1 overflow-y-auto min-h-0">
            <NavContent onLinkClick={() => setMobileOpen(false)} />
          </div>
          <div className="flex-shrink-0 border-t border-white/8 p-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-white/50 hover:text-white hover:bg-white/8 transition-colors rounded-lg"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span className="text-[13px] font-medium">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        {/* overflow-y-auto here means only this column scrolls when hovering page */}
        <main className="main-scroll flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden bg-[#EAF1F8] pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ─────────────────────────────────────── */}
      {/* Shows only on mobile — 5 key actions always accessible */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-white/10 z-30 flex-shrink-0 safe-area-inset-bottom">
        <div className="grid grid-cols-5 h-14">
          {[
            { to: "/dashboard",           icon: LayoutDashboard, label: "Home"     },
            { to: "/intake",              icon: Send,            label: "Intake"   },
            { to: "/workbench",           icon: ShoppingCart,    label: "Procure"  },
            { to: "/marketplace",         icon: Globe2,          label: "Suppliers"},
            { to: "/agents/orchestration",icon: Bot,             label: "AI"       },
          ].map(item => {
            const Icon = item.icon;
            const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? "text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                <div className={`h-7 w-7 grid place-items-center rounded-lg transition-colors ${active ? "bg-[#0F172A]" : ""}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[9px] font-semibold leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <ToastContainer />
    </div>
  );
}

/* ─── Shared UI primitives ──────────────────────────────────────────────── */
export function PageHeader({ title, description, subtitle, actions }: { title: string; description?: string; subtitle?: string; actions?: ReactNode }) {
  const desc = description ?? subtitle;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-black" style={{ letterSpacing: "-0.02em" }}>{title}</h1>
        {desc && <p className="text-sm text-black/50 mt-1 max-w-2xl">{desc}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white border border-black/10 rounded-2xl shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 sm:px-5 pt-4 pb-3 border-b border-black/10">
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-black">{title}</h3>
        {subtitle && <p className="text-xs text-black/40 mt-0.5">{subtitle}</p>}
        {children && <div className="mt-1">{children}</div>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function KpiCard({ label, value, delta, positive = true, icon: Icon, color = "blue" }: {
  label: string; value: string; delta?: string; positive?: boolean; icon?: React.ElementType;
  color?: "blue" | "green" | "amber" | "red" | "violet" | "cyan" | "orange" | "pink";
}) {
  const iconColors: Record<string, string> = {
    blue:   "bg-slate-100 text-[#0F172A]",
    green:  "bg-slate-100 text-[#0F172A]",
    amber:  "bg-slate-100 text-[#0F172A]",
    red:    "bg-red-100 text-red-600",
    violet: "bg-slate-100 text-[#0F172A]",
    cyan:   "bg-slate-100 text-[#0F172A]",
    orange: "bg-slate-100 text-[#0F172A]",
    pink:   "bg-slate-100 text-[#0F172A]",
  };
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 hover:shadow-md hover:border-black/15 transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs text-black/50 font-medium leading-tight">{label}</div>
        {Icon && (
          <div className={`h-8 w-8 rounded-xl grid place-items-center flex-shrink-0 ${iconColors[color]}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-2 text-xl sm:text-2xl font-bold text-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>{value}</div>
      {delta && (
        <div className={`mt-1 text-xs font-semibold flex items-center gap-1 ${positive ? "text-[#0F172A]" : "text-red-500"}`}>
          <span>{positive ? "▲" : "▼"}</span> {delta}
        </div>
      )}
    </div>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "blue" | "green" | "amber" | "red" | "muted" | "violet" | "purple" | "yellow" }) {
  const tones: Record<string, string> = {
    default: "bg-gray-100 text-gray-600 border border-gray-200",
    blue:    "bg-slate-100 text-[#0F172A] border border-slate-200",
    green:   "bg-slate-100 text-[#0F172A] border border-slate-200",
    amber:   "bg-slate-100 text-[#0F172A] border border-slate-200",
    red:     "bg-red-100 text-red-700 border border-red-200",
    muted:   "bg-gray-50 text-gray-400 border border-gray-100",
    violet:  "bg-slate-100 text-[#0F172A] border border-slate-200",
    purple:  "bg-slate-100 text-[#0F172A] border border-slate-200",
    yellow:  "bg-slate-100 text-[#0F172A] border border-slate-200",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap ${tones[tone] ?? tones.default}`}>{children}</span>;
}

/* ─── PageContextBar ─────────────────────────────────────────────────────── */
/**
 * Standardised page context bar shown at the top of every page/module.
 * Displays: Ministry Name · Module · Specific Process · Financial Year · AI Assistant
 *
 * Rules:
 * - Dashboards (analytics, KPIs, charts) render ONLY their dashboard content beneath this bar.
 * - Forms (multi-step, data capture) render ONLY the form structure beneath this bar.
 * - Never mix dashboard KPI tiles with form fields on the same page.
 */
export function PageContextBar({
  ministry,
  module,
  process,
  financialYear,
  pageType,
  briefingMode = false,
}: {
  /** Ministry or entity name override — if omitted, uses the logged-in user's entity */
  ministry?: string;
  /** Module name, e.g. "Budget Management" */
  module: string;
  /** Specific process, e.g. "Budget Planning" or "Expenditure Tracking" */
  process: string;
  /** Financial year string override — defaults to "2026/2027" */
  financialYear?: string;
  /** Whether this page is a 'dashboard', 'form', 'workbench', or 'report' */
  pageType?: "dashboard" | "form" | "workbench" | "report";
  /** Briefing mode — hides the government header, shows only breadcrumb (for Executive Briefing) */
  briefingMode?: boolean;
}) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Resolve ministry: prop → user entity → fallback
  const resolvedMinistry =
    ministry ??
    (user?.entity && user.entity !== "Government of Zimbabwe" ? user.entity : null) ??
    "Government of Zimbabwe";

  // Resolve financial year from user entity or default
  const resolvedFY = financialYear ?? "2026/2027";

  const typeStyles: Record<string, { cls: string; label: string }> = {
    dashboard:  { cls: "bg-slate-100 text-[#0F172A] border border-slate-200",          label: "Dashboard"  },
    form:       { cls: "bg-slate-100 text-[#0F172A] border border-slate-200",  label: "Form"       },
    workbench:  { cls: "bg-slate-100 text-[#0F172A] border border-slate-200",     label: "Workbench"  },
    report:     { cls: "bg-slate-100 text-[#0F172A] border border-slate-200",        label: "Report"     },
  };
  const typeBadge = pageType ? typeStyles[pageType] : null;

  // Briefing mode — lightweight header only
  if (briefingMode) {
    return (
      <div className="flex-shrink-0 bg-white border-b border-black/8 shadow-sm" role="banner">
        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 flex-wrap min-h-[40px]">
          {/* Module */}
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[10px] font-semibold text-black/35 uppercase tracking-wide flex-shrink-0 hidden sm:inline">Module</span>
            <span className="text-[11px] font-bold text-[#0f172a] truncate max-w-[140px]" title={module}>{module}</span>
          </div>

          <span className="text-black/20 text-sm flex-shrink-0" aria-hidden="true">›</span>

          {/* Process */}
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-[10px] font-semibold text-black/35 uppercase tracking-wide flex-shrink-0 hidden sm:inline">Process</span>
            <span className="text-[11px] font-bold text-[#0F172A] truncate max-w-[200px]" title={process}>{process}</span>
          </div>

          <div className="flex-1" />

          {/* Financial year */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-[9px] font-semibold text-black/35 uppercase tracking-widest hidden sm:inline">FY</span>
            <span className="text-[11px] font-bold text-[#0f172a]">{resolvedFY}</span>
          </div>

          {typeBadge && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${typeBadge.cls}`}>
              {typeBadge.label}
            </span>
          )}

          <Link
            to="/ai-agents"
            className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg bg-[#0F172A] text-white text-[11px] font-semibold hover:opacity-90 transition-opacity flex-shrink-0 shadow-sm"
            aria-label="Open AI Assistant"
          >
            <Sparkles className="h-3 w-3 flex-shrink-0" />
            <span className="hidden sm:inline">AI Assistant</span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse flex-shrink-0" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 border-b border-black/10 shadow-sm" role="banner">

      {/* ── Row 1 — Government identity bar (collapsible) ─────────────────── */}
      {!collapsed && (
        <div
          className="flex items-center gap-3 px-4 sm:px-6 py-2.5 flex-wrap"
          style={{ background: "#0f172a" }}
        >
          {/* GOZ coat-of-arms icon */}
          <div className="h-7 w-7 rounded bg-white/10 border border-white/20 grid place-items-center flex-shrink-0">
            <svg viewBox="0 0 16 16" className="h-4 w-4 fill-white/90" aria-hidden="true">
              <path d="M8 1L1 5v1h14V5L8 1zm-6 7h2v4H2v-4zm3 0h2v4H5v-4zm3 0h2v4H8v-4zm3 0h2v4h-2v-4zM1 13h14v2H1v-2z"/>
            </svg>
          </div>

          {/* GOVERNMENT OF THE REPUBLIC OF ZIMBABWE */}
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none">
              GOVERNMENT OF THE REPUBLIC OF ZIMBABWE
            </span>
            <span
              className="text-sm font-bold text-white leading-snug mt-0.5 truncate"
              title={resolvedMinistry}
            >
              {resolvedMinistry}
            </span>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-white/15 flex-shrink-0 hidden sm:block" aria-hidden="true" />

          {/* Financial Year */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="1" y="3" width="14" height="12" rx="1.5"/>
              <path d="M1 7h14M5 1v4M11 1v4"/>
            </svg>
            <div className="flex flex-col leading-none">
              <span className="text-[9px] font-semibold text-white/40 uppercase tracking-widest">Financial Year</span>
              <span className="text-[11px] font-bold text-white/90 mt-0.5">{resolvedFY}</span>
            </div>
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(true)}
            title="Collapse header to maximise content space"
            aria-label="Collapse government header"
            className="flex-shrink-0 ml-1 h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 grid place-items-center transition-colors"
          >
            <ChevronDown className="h-3.5 w-3.5 text-white/70 rotate-180" />
          </button>
        </div>
      )}

      {/* ── Row 2 — Module / Process breadcrumb (always visible) ─────────── */}
      <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 bg-white flex-wrap min-h-[40px]">

        {/* Expand button — only shown when header is collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            title="Expand government header"
            aria-label="Expand government header"
            className="flex-shrink-0 h-6 w-6 rounded bg-[#0f172a] hover:bg-[#0F172A] grid place-items-center transition-colors mr-1"
          >
            <ChevronDown className="h-3 w-3 text-white" />
          </button>
        )}

        {/* Ministry pill — shown in breadcrumb row when header is collapsed */}
        {collapsed && (
          <span
            className="text-[10px] font-bold text-[#0f172a] truncate max-w-[160px] flex-shrink-0"
            title={resolvedMinistry}
          >
            {resolvedMinistry}
          </span>
        )}
        {collapsed && <span className="text-black/20 text-sm flex-shrink-0" aria-hidden="true">›</span>}

        {/* Module */}
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[10px] font-semibold text-black/35 uppercase tracking-wide flex-shrink-0 hidden sm:inline">Module</span>
          <span className="text-[11px] font-bold text-[#0f172a] truncate max-w-[140px]" title={module}>{module}</span>
        </div>

        <span className="text-black/20 text-sm flex-shrink-0" aria-hidden="true">›</span>

        {/* Process */}
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[10px] font-semibold text-black/35 uppercase tracking-wide flex-shrink-0 hidden sm:inline">Process</span>
          <span className="text-[11px] font-bold text-[#0F172A] truncate max-w-[200px]" title={process}>{process}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Financial year pill — always visible */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-[9px] font-semibold text-black/35 uppercase tracking-widest hidden sm:inline">FY</span>
          <span className="text-[11px] font-bold text-[#0f172a]">{resolvedFY}</span>
        </div>

        {/* Page type badge */}
        {typeBadge && (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold flex-shrink-0 ${typeBadge.cls}`}>
            {typeBadge.label}
          </span>
        )}

        {/* AI Assistant */}
        <Link
          to="/ai-agents"
          className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg bg-[#0F172A] text-white text-[11px] font-semibold hover:opacity-90 transition-opacity flex-shrink-0 shadow-sm"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="h-3 w-3 flex-shrink-0" />
          <span className="hidden sm:inline">AI Assistant</span>
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-pulse flex-shrink-0" />
        </Link>
      </div>
    </div>
  );
}

