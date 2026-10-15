/**
 * EnterpriseWorkbench — Universal workbench template
 * Used across ALL procurement lifecycle stages and the Vendor Portal.
 * Only the Main Work Area content (rendered via `children`) changes per module.
 * Everything else — layout, panels, nav, AI, actions, bottom tabs — is identical.
 */
import { useState, useEffect, useRef, ReactNode } from "react";
import { AppShell, Badge } from "@/components/AppShell";
import {
  FileText, CheckCircle2, Clock, ChevronRight, ChevronLeft, ChevronDown,
  Sparkles, Users, Upload, Download, Eye, MessageSquare,  AlertTriangle, DollarSign, Shield, BarChart3, Search,
  BookOpen, Save, Send, RotateCcw, HelpCircle, ArrowUp,
  UserPlus, PauseCircle, XCircle, Check, X, Filter, Plus,
  Flag, Lock, FolderOpen, Link2,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import { ZW_MINISTRIES } from "@/lib/zw-ministries";
import { useAuth } from "@/lib/auth-context";
import {
  SEED_PLANS, SEED_REQUISITIONS, SEED_STRATEGIES, SEED_TENDER_PREPARATIONS,
  PROCUREMENT_CATEGORIES,
} from "@/lib/procurement-workbench-data";

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserHierarchyRole =
  | "Initiator" | "Approver" | "Authorizer" | "Adjudicator" | "Oversight";

export type WorkbenchRecord = {
  recordNumber: string;
  referenceNumber: string;
  title: string;
  ministry: string;
  department: string;
  division?: string;
  unit?: string;
  procurementEntity?: string;
  financialYear: string;
  budgetCode: string;
  procurementType: string;
  currentStage: string;
  status: "Open" | "Pending" | "Approved" | "Rejected" | "On Hold";
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  ageOnStage: string;
  owner: string;
  organization: string;
  percentageComplete: number;
  userRole: UserHierarchyRole;
  userName: string;
  userJobTitle: string;
  userLocation: string;
  lastSaved: string;
  connectionStatus: "Online" | "Offline";
  version: string;
  value: string;
};

export type NavTab =
  | "overview" | "details" | "participants" | "suppliers"
  | "documents" | "approvals" | "communications" | "risks"
  | "compliance" | "financials" | "performance" | "audit" | "ai" | "casefile"
  | "docprocessor";

type WorkQueueStatus =
  | "My Tasks" | "Pending Tasks" | "Overdue Tasks"
  | "Escalated Tasks" | "Delegated Tasks";

type BottomTab =
  | "stages" | "documents" | "notes" | "audit"
  | "intelligence" | "search" | "knowledge";

export type WorkbenchModule = {
  id: string;
  label: string;
  stageNumber?: number;
  procurementType?: string;
  /** Routes shown in the Stage Modules bottom panel */
  allModules?: Array<{ num: number; label: string; route: string; status: "completed" | "active" | "pending"; desc: string }>;
};

// ─── Shared mock data (panels use these; overridable via props) ───────────────
const MOCK_QUEUE_ITEMS = [
  { id: "WQ-001", title: "Technical Evaluation — ARV Medicines",   type: "My Tasks",        priority: "High",   due: "2026-06-25", status: "active"   },
  { id: "WQ-002", title: "Approve RFQ-2026-0892 Award",            type: "Pending Tasks",   priority: "Medium", due: "2026-06-27", status: "pending"  },
  { id: "WQ-003", title: "BOQ Review — Highway Section 4",         type: "Overdue Tasks",   priority: "High",   due: "2026-06-22", status: "overdue"  },
  { id: "WQ-004", title: "EOI Shortlist — Water Treatment",        type: "Delegated Tasks", priority: "Low",    due: "2026-06-30", status: "delegated"},
];

const MOCK_DOCUMENTS: {
  name: string; category: string; size: string; uploaded: string; status: string; uploader?: string;
}[] = [
  // ── Minutes ───────────────────────────────────────────────────────────────
  { name: "Procurement Committee Minutes — 12 Jun 2026.pdf",  category: "Minutes",              size: "320 KB", uploaded: "2026-06-12", status: "Final",   uploader: "D. Moyo"      },
  { name: "Evaluation Panel Minutes — 20 Jun 2026.pdf",       category: "Minutes",              size: "280 KB", uploaded: "2026-06-20", status: "Final",   uploader: "A. Chikwanda" },
  // ── Resolutions ───────────────────────────────────────────────────────────
  { name: "Award Resolution — MOH-2026-00183.pdf",            category: "Resolutions",          size: "190 KB", uploaded: "2026-06-22", status: "Approved",uploader: "L. Ndlovu"    },
  { name: "Procurement Committee Resolution No. 14.pdf",      category: "Resolutions",          size: "145 KB", uploaded: "2026-06-15", status: "Draft",   uploader: "D. Moyo"      },
  // ── Compliance Checklist ──────────────────────────────────────────────────
  { name: "PRAZ Compliance Checklist v2.xlsx",                category: "Compliance Checklist", size: "210 KB", uploaded: "2026-06-21", status: "Final",   uploader: "L. Ndlovu"    },
  { name: "Anti-Corruption Declaration Forms.pdf",            category: "Compliance Checklist", size: "390 KB", uploaded: "2026-06-19", status: "Approved",uploader: "S. Nkosi"     },
  // ── Attachments ───────────────────────────────────────────────────────────
  { name: "Tender Document v3.pdf",                           category: "Attachments",          size: "2.4 MB", uploaded: "2026-06-20", status: "Final",   uploader: "D. Moyo"      },
  { name: "BOQ_2026.xlsx",                                    category: "Attachments",          size: "840 KB", uploaded: "2026-06-21", status: "Final",   uploader: "D. Moyo"      },
  { name: "Evaluation Matrix.xlsx",                           category: "Attachments",          size: "1.1 MB", uploaded: "2026-06-23", status: "Draft",   uploader: "A. Chikwanda" },
  { name: "Budget Approval Letter.pdf",                       category: "Attachments",          size: "310 KB", uploaded: "2026-06-18", status: "Approved",uploader: "L. Ndlovu"    },
  // ── Notices ───────────────────────────────────────────────────────────────
  { name: "Clarification Notice No. 1.pdf",                   category: "Notices",              size: "125 KB", uploaded: "2026-06-17", status: "Final",   uploader: "D. Moyo"      },
  { name: "Award Notice — MOH-2026-00183.pdf",                category: "Notices",              size: "168 KB", uploaded: "2026-06-23", status: "Final",   uploader: "D. Moyo"      },
];

const MOCK_AUDIT = [
  { user: "D. Moyo",      action: "Submitted for review",          timestamp: "2026-06-25 09:14", reason: "Stage work completed"              },
  { user: "A. Chikwanda", action: "Returned for Correction",       timestamp: "2026-06-24 16:42", reason: "Documentation incomplete"          },
  { user: "D. Moyo",      action: "Uploaded revised document",     timestamp: "2026-06-23 11:08", reason: "Revision per reviewer comments"    },
  { user: "L. Ndlovu",    action: "Budget line confirmed",         timestamp: "2026-06-22 08:55", reason: "Confirmed in IFMIS"                },
  { user: "System",       action: "AI alert triggered",            timestamp: "2026-06-21 14:30", reason: "Compliance gap detected"           },
];

const MOCK_NOTES = [
  { author: "D. Moyo",      time: "09:14",     type: "internal", text: "Work form completed. Awaiting approval before next stage."             },
  { author: "A. Chikwanda", time: "Yesterday", type: "comment",  text: "Please ensure all required documents are signed before submission."   },
  { author: "System AI",    time: "2 days ago",type: "alert",    text: "Risk detected — budget utilisation at 94%. Review before proceeding." },
];

const MOCK_PARTICIPANTS = [
  { name: "D. Moyo",          role: "Senior Procurement Officer",  hierarchy: "Initiator"   as UserHierarchyRole, status: "Stage Coordinating", task: "Stage coordination",  done: false,
    coachingNotes: "Ensure all evaluation score sheets are co-signed before submission. Flag any divergence above 15 points for moderation." },
  { name: "A. Chikwanda",     role: "Finance Officer",             hierarchy: "Approver"    as UserHierarchyRole, status: "Pending Approval",   task: "Budget confirmation", done: false,
    coachingNotes: "Verify IFMIS budget line availability before approving. Check performance bond amount aligns with tender value." },
  { name: "L. Ndlovu",        role: "Legal Officer",               hierarchy: "Authorizer"  as UserHierarchyRole, status: "Authorised",         task: "Compliance clearance",done: true,
    coachingNotes: "PPDPA compliance confirmed. Ensure award notice includes debriefing clause per Section 42." },
  { name: "CPO — D. Sithole", role: "Chief Procurement Officer",   hierarchy: "Authorizer"  as UserHierarchyRole, status: "Awaiting Sign-off",  task: "Final sign-off",      done: false,
    coachingNotes: "Final sign-off requires evaluation report and budget confirmation on file. No award can proceed until both conditions are met." },
  { name: "S. Nkosi",         role: "Auditor",                     hierarchy: "Oversight"   as UserHierarchyRole, status: "Under Observation",  task: "Observation only",    done: false,
    coachingNotes: "Reviewing for conflict-of-interest declarations. Flag any evaluator who submitted a bid in the past 12 months." },
];

const MOCK_SUPPLIERS = [
  { id: "VEN-00481", name: "Zimbabwe Holdings Ltd",      score: 87, financial: 92, status: "Qualified",   risk: "Low"    },
  { id: "VEN-00495", name: "National Distributors",      score: 74, financial: 81, status: "Qualified",   risk: "Low"    },
  { id: "VEN-00502", name: "Bulawayo Supplies Co.",      score: 68, financial: 70, status: "Qualified",   risk: "Medium" },
  { id: "VEN-00511", name: "Eastern Consortium Ltd",     score: 55, financial: 62, status: "Under Review",risk: "Medium" },
  { id: "VEN-00478", name: "Mutare Trading Group",       score: 41, financial: 38, status: "Non-Responsive",risk:"High"  },
];

const MOCK_APPROVALS: {
  stage: string; stageLabel: string; approver: string; role: string;
  startDate: string; endDate: string; time: string; age: string;
  status: string; comment: string;
  complianceMet: boolean | null; complianceFile: string | null;
  discussionLink: string;
}[] = [
  {
    stage: "Budget Confirmation",   stageLabel: "Stage 1",
    approver: "L. Ndlovu",          role: "Finance Officer",
    startDate: "2026-06-20",        endDate: "2026-06-22", time: "2026-06-22 08:55",
    age: "2 days",                  status: "Approved",
    comment: "Budget line confirmed",
    complianceMet: true,            complianceFile: "Budget_Compliance_Checklist_Stage1.pdf",
    discussionLink: "Stage 1 — Budget Thread",
  },
  {
    stage: "Legal Clearance",       stageLabel: "Stage 2",
    approver: "A. Mpofu",           role: "Legal Officer",
    startDate: "2026-06-22",        endDate: "2026-06-23", time: "2026-06-23 14:10",
    age: "1 day",                   status: "Approved",
    comment: "Method compliant with PPDPA",
    complianceMet: true,            complianceFile: "Legal_Compliance_Checklist_Stage2.pdf",
    discussionLink: "Stage 2 — Legal Thread",
  },
  {
    stage: "Stage Review",          stageLabel: "Stage 3",
    approver: "D. Moyo",            role: "Procurement Officer",
    startDate: "2026-06-23",        endDate: "—",           time: "—",
    age: "3 days (active)",         status: "Pending",
    comment: "",
    complianceMet: false,           complianceFile: "Stage_Review_Compliance_Checklist_Stage3.pdf",
    discussionLink: "Stage 3 — Review Thread",
  },
  {
    stage: "Adjudication",          stageLabel: "Stage 4",
    approver: "CPO Board",          role: "Adjudicator",
    startDate: "—",                 endDate: "—",           time: "—",
    age: "—",                       status: "Not Yet",
    comment: "",
    complianceMet: null,            complianceFile: null,
    discussionLink: "Stage 4 — Adjudication Thread",
  },
  {
    stage: "Final Authorisation",   stageLabel: "Stage 5",
    approver: "PS — R. Dube",       role: "Authorizer",
    startDate: "—",                 endDate: "—",           time: "—",
    age: "—",                       status: "Not Yet",
    comment: "",
    complianceMet: null,            complianceFile: null,
    discussionLink: "Stage 5 — Authorisation Thread",
  },
];

const MOCK_RISKS = [
  { id: "RSK-001", title: "Process delay risk",         category: "Process",   level: "High",   status: "Open",       owner: "D. Moyo",      mitigation: "Expedite approvals" },
  { id: "RSK-002", title: "Budget at 94%",              category: "Financial", level: "Medium", status: "Monitoring", owner: "A. Chikwanda", mitigation: "Weekly IFMIS monitoring" },
  { id: "RSK-003", title: "Single-source risk",         category: "Supply",    level: "Medium", status: "Open",       owner: "D. Moyo",      mitigation: "Expand supplier list" },
  { id: "RSK-004", title: "Deadline — 2 days left",     category: "Time",      level: "High",   status: "Escalated",  owner: "CPO",          mitigation: "CPO expediting sign-offs" },
];

// ─── Stage definitions ────────────────────────────────────────────────────────
const STAGES_BY_TYPE: Record<string, string[]> = {
  Tender: [
    "Planning","Requisition","Preparation","Approval","Advertisement",
    "Supplier Mgmt","Clarifications","Bid Submission","Bid Opening",
    "Admin Evaluation","Technical Evaluation","Financial Evaluation",
    "Combined Ranking","Due Diligence","Award Approval","Notification",
    "Contract Draft","Contract Execution","Delivery","Invoicing","Payment","Closeout",
  ],
  RFQ: [
    "Planning","Requisition","Preparation","Quotation Invite",
    "Quote Submission","Admin Evaluation","Technical Evaluation","Financial Evaluation",
    "Award","Contract","Delivery","Invoicing","Payment",
  ],
  RFP: [
    "Planning","Requisition","TOR Preparation","Approval","Advertisement",
    "Proposal Submission","Admin Evaluation","Technical Evaluation",
    "Financial Evaluation","Negotiation","Award","Contract","Delivery","Payment",
  ],
  EOI: [
    "Planning","EOI Preparation","Approval","EOI Advertisement",
    "EOI Submission","Shortlisting","Notification","RFP Stage",
  ],
  Auction: [
    "Planning","Asset Assessment","Approval","Advertisement",
    "Registration","Pre-Auction","Live Auction","Award","Payment","Handover",
  ],
  "Vendor Portal": [
    "Registration","KYC Verification","Profile Setup","Tender Search",
    "Bid Submission","Under Review","Shortlisted","Award","Contract","Payment",
  ],
};

function getStages(record: WorkbenchRecord) {
  const stages = STAGES_BY_TYPE[record.procurementType] ?? STAGES_BY_TYPE["Tender"];
  const idx = stages.findIndex(s => s.toLowerCase() === record.currentStage.toLowerCase());
  const currentIndex = idx >= 0 ? idx : Math.round((record.percentageComplete / 100) * Math.max(stages.length - 1, 1));
  return { stages, currentIndex };
}

// ─── ALL procurement stage modules ────────────────────────────────────────────
export const PROCUREMENT_MODULES: WorkbenchModule["allModules"] = [
  { num:  1, label: "Procurement Planning",       route: "/workbench/planning",            status: "completed", desc: "Annual plan · Budget · Demand"            },
  { num:  2, label: "Requisition",                route: "/workbench/requisition",         status: "completed", desc: "Purchase requisition · Items · Approval"  },
  { num:  3, label: "Procurement Strategy",       route: "/workbench/strategy",            status: "completed", desc: "Method · Market · Supplier analysis"      },
  { num:  4, label: "Tender Preparation",         route: "/workbench/tender-preparation",  status: "active",    desc: "BOQ · Specs · Evaluation criteria"        },
  { num:  5, label: "Tender Management",          route: "/workbench/tender-management",   status: "pending",   desc: "Publication · Clarifications · Q&A"       },
  { num:  6, label: "RFQ Management",             route: "/workbench/rfq",                 status: "pending",   desc: "Quotations · Evaluation · Award"          },
  { num:  7, label: "RFP Management",             route: "/workbench/rfp",                 status: "pending",   desc: "Proposals · TOR · Negotiation"            },
  { num:  8, label: "EOI Management",             route: "/workbench/eoi",                 status: "pending",   desc: "Expressions of Interest · Shortlisting"   },
  { num:  9, label: "Auction Management",         route: "/workbench/auction",             status: "pending",   desc: "Assets · Live Auction · Handover"         },
  { num: 10, label: "Bid Submission",             route: "/workbench/bid-submission",      status: "pending",   desc: "Encrypted vault · Validation · Receipt"   },
  { num: 11, label: "Bid Opening",                route: "/workbench/bid-opening",         status: "pending",   desc: "Opening ceremony · Register · Records"   },
  { num: 12, label: "Bid Evaluation",             route: "/workbench/bid-evaluation",      status: "pending",   desc: "Admin · Technical · Financial scoring"    },
  { num: 13, label: "Recommendation for Award",   route: "/workbench/recommendation",      status: "pending",   desc: "Adjudication · Report · Justification"   },
  { num: 14, label: "Contract Award",             route: "/workbench/contract-award",      status: "pending",   desc: "Award notice · Standstill · Objections"  },
  { num: 15, label: "Contract Execution",         route: "/workbench/contract-execution",  status: "pending",   desc: "Drafting · Signing · Performance bond"    },
  { num: 16, label: "Contract Management",        route: "/workbench/contract-management", status: "pending",   desc: "Variations · Extensions · Disputes"       },
  { num: 17, label: "Project Monitoring",         route: "/workbench/project-monitoring",  status: "pending",   desc: "Milestones · KPIs · Site visits"          },
  { num: 18, label: "Payment Management",         route: "/workbench/payment-management",  status: "pending",   desc: "Invoicing · 3-Way Match · EFT"            },
  { num: 19, label: "Contract Closure",           route: "/workbench/contract-closure",    status: "pending",   desc: "Final account · Acceptance · Archive"     },
  { num: 20, label: "Asset Management",           route: "/workbench/asset-management",    status: "pending",   desc: "Registration · Maintenance · Disposal"   },
  { num: 21, label: "Performance Evaluation",     route: "/workbench/performance-eval",    status: "pending",   desc: "Vendor scoring · KPI review · Reports"    },
  { num: 22, label: "Governance",                 route: "/workbench/governance",          status: "pending",   desc: "Committees · Policy · Ethics"             },
  { num: 23, label: "Appeals",                    route: "/workbench/appeals",             status: "pending",   desc: "Objections · Review · Decisions"          },
  { num: 24, label: "Audit",                      route: "/workbench/audit",               status: "pending",   desc: "Internal · External · Findings"           },
  { num: 25, label: "Reports",                    route: "/workbench/reports",             status: "pending",   desc: "Statutory · Management · Executive"       },
  { num: 26, label: "AI Analytics",               route: "/workbench/ai-analytics",        status: "pending",   desc: "Insights · Predictions · Intelligence"    },
];

export const VENDOR_MODULES: WorkbenchModule["allModules"] = [
  { num:  1, label: "Vendor Dashboard",     route: "/vendor-workbench/dashboard",      status: "active",    desc: "Summary · KPIs · Alerts"                },
  { num:  2, label: "Vendor Tasks",         route: "/vendor-workbench/tasks",          status: "pending",   desc: "My tasks · Deadlines · Actions"          },
  { num:  3, label: "Tender Search",        route: "/vendor-workbench/tender-search",  status: "pending",   desc: "Browse · Filter · Download"              },
  { num:  4, label: "RFQ Search",           route: "/vendor-workbench/rfq-search",     status: "pending",   desc: "Quotations · Invitations"                },
  { num:  5, label: "RFP Search",           route: "/vendor-workbench/rfp-search",     status: "pending",   desc: "Proposals · TOR documents"               },
  { num:  6, label: "EOI Search",           route: "/vendor-workbench/eoi-search",     status: "pending",   desc: "Expressions of Interest"                 },
  { num:  7, label: "Auction Participation",route: "/vendor-workbench/auctions",       status: "pending",   desc: "Live · Upcoming · History"               },
  { num:  8, label: "Bid Submission",       route: "/vendor-workbench/bid-submission", status: "pending",   desc: "Prepare · Encrypt · Submit"              },
  { num:  9, label: "Submitted Bids",       route: "/vendor-workbench/submitted-bids", status: "pending",   desc: "Track · Receipts · Status"               },
  { num: 10, label: "Clarifications",       route: "/vendor-workbench/clarifications", status: "pending",   desc: "Questions · Responses · Addenda"         },
  { num: 11, label: "Contracts",            route: "/vendor-workbench/contracts",      status: "pending",   desc: "Active · Milestones · Deliverables"      },
  { num: 12, label: "Payments",             route: "/vendor-workbench/payments",       status: "pending",   desc: "Invoices · Status · History"             },
  { num: 13, label: "Notifications",        route: "/vendor-workbench/notifications",  status: "pending",   desc: "Alerts · Deadlines · Outcomes"           },
  { num: 14, label: "Messages",             route: "/vendor-workbench/messages",       status: "pending",   desc: "Procurement officers · Clarifications"   },
  { num: 15, label: "Documents",            route: "/vendor-workbench/documents",      status: "pending",   desc: "Upload · Download · Manage"              },
  { num: 16, label: "AI Assistant",         route: "/vendor-workbench/ai",             status: "pending",   desc: "Guidance · Compliance · Scoring"         },
  { num: 17, label: "Audit History",        route: "/vendor-workbench/audit",          status: "pending",   desc: "All actions · Immutable log"             },
];

// ─── Color maps ───────────────────────────────────────────────────────────────
const ROLE_COLORS: Record<UserHierarchyRole, string> = {
  Initiator:   "bg-slate-600 text-white",
  Approver:    "bg-blue-700 text-white",
  Authorizer:  "bg-indigo-700 text-white",
  Adjudicator: "bg-violet-700 text-white",
  Oversight:   "bg-red-600 text-white",
};
const ROLE_SOFT: Record<UserHierarchyRole, string> = {
  Initiator:   "bg-slate-100 text-slate-700",
  Approver:    "bg-blue-100 text-blue-800",
  Authorizer:  "bg-indigo-100 text-indigo-800",
  Adjudicator: "bg-violet-100 text-violet-800",
  Oversight:   "bg-red-100 text-red-700",
};

// ─── Role-specific outcome status colours ─────────────────────────────────────
const OUTCOME_STATUS_COLORS: Record<string, string> = {
  // Initiator
  "Stage Coordinating": "bg-slate-50 text-[#0F172A] border-slate-200",
  "Stage Complete":     "bg-slate-50 text-[#0F172A] border-slate-200",
  "Returned":           "bg-red-50 text-red-700 border-red-200",
  // Approver
  "Pending Approval":   "bg-slate-50 text-[#0F172A] border-slate-200",
  "Budget Confirmed":   "bg-slate-50 text-[#0F172A] border-slate-200",
  "Approval Rejected":  "bg-red-50 text-red-700 border-red-200",
  // Authorizer
  "Awaiting Sign-off":  "bg-slate-50 text-[#0F172A] border-slate-200",
  "Authorised":         "bg-slate-50 text-[#0F172A] border-slate-200",
  "Deferred":           "bg-slate-50 text-[#0F172A] border-slate-200",
  // Adjudicator
  "Award Recommended":  "bg-slate-50 text-[#0F172A] border-slate-200",
  "Pending Review":     "bg-slate-50 text-[#0F172A] border-slate-200",
  "Award Declined":     "bg-red-50 text-red-700 border-red-200",
  // Oversight
  "Under Observation":  "bg-slate-50 text-slate-700 border-slate-200",
  "Cleared":            "bg-slate-50 text-[#0F172A] border-slate-200",
  "Risk Flagged":       "bg-red-50 text-red-700 border-red-200",
  // fallback
  default:              "bg-gray-50 text-gray-600 border-gray-200",
};

// ─── Participants Tab ────────────────────────────────────────────────────────
type ChatMsg = { author: string; text: string; time: string };
type ParticipantState = { notes: string; chatOpen: boolean };

function ParticipantsTab({ onAct }: { onAct: (msg: string) => void }) {
  // Per-participant coaching notes (keyed by name)
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(MOCK_PARTICIPANTS.map(p => [p.name, p.coachingNotes]))
  );
  // Per-participant expand state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  // Shared group chat for all participants
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { author: "D. Moyo",      text: "Budget confirmation is still outstanding. Can Finance confirm IFMIS line by COB today?", time: "09:14" },
    { author: "A. Chikwanda", text: "I'll check and revert by 14:00. IFMIS was updated last night.",                           time: "10:02" },
    { author: "L. Ndlovu",    text: "Legal clearance is done on my end. Awaiting CPO final sign-off.",                        time: "10:45" },
  ]);
  const [draft, setDraft] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const toggle = (name: string) =>
    setExpanded(prev => ({ ...prev, [name]: !prev[name] }));

  const sendMsg = () => {
    const text = draft.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setChatMsgs(prev => [...prev, { author: "You", text, time }]);
    setDraft("");
    onAct("Participant message sent");
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const statusCls = (status: string) =>
    OUTCOME_STATUS_COLORS[status] ?? OUTCOME_STATUS_COLORS.default;

  return (
    <div className="p-4 space-y-3 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-black/60">Participants — Role Hierarchy</span>
        <button onClick={() => onAct("User added")} className="h-7 px-2.5 bg-black text-white rounded-lg text-[10px] flex items-center gap-1 hover:opacity-90">
          <Plus className="h-3 w-3" /> Add
        </button>
      </div>

      {/* Participant cards */}
      {MOCK_PARTICIPANTS.map((p) => {
        const isOpen = !!expanded[p.name];
        return (
          <div key={p.name} className="border border-black/8 rounded-xl overflow-hidden">
            {/* Card row */}
            <button
              onClick={() => toggle(p.name)}
              className="w-full flex items-center justify-between p-3 hover:bg-[#EAF1F8] transition-colors text-left"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-full bg-black text-white text-[10px] font-bold grid place-items-center flex-shrink-0">
                  {p.name.replace(/^.*?—\s*/, "").split(" ").map((x: string) => x[0]).join("").slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-black truncate">{p.name}</div>
                  <div className="text-[10px] text-black/40 truncate">{p.role} · {p.task}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${ROLE_SOFT[p.hierarchy]}`}>{p.hierarchy}</span>
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${statusCls(p.status)}`}>{p.status}</span>
                <ChevronDown className={`h-3 w-3 text-black/30 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </div>
            </button>

            {/* Expanded: coaching notes */}
            {isOpen && (
              <div className="border-t border-black/8 bg-[#FAFAFA] px-3 py-3 space-y-3">
                <div>
                  <label className="text-[10px] font-semibold text-black/50 uppercase tracking-wider block mb-1">
                    Coaching Notes
                  </label>
                  <textarea
                    rows={3}
                    value={notes[p.name] ?? ""}
                    onChange={e => setNotes(prev => ({ ...prev, [p.name]: e.target.value }))}
                    onBlur={() => onAct(`Coaching notes saved for ${p.name}`)}
                    placeholder="Add coaching guidance, role-specific instructions, or compliance reminders…"
                    className="w-full resize-none rounded-lg border border-black/10 bg-white px-2.5 py-2 text-[11px] text-black focus:outline-none focus:ring-1 focus:ring-black/20 leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ─── Shared group chat ─────────────────────────────────────── */}
      <div className="border border-black/8 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-black/3 border-b border-black/8">
          <MessageSquare className="h-3.5 w-3.5 text-black/40" />
          <span className="text-[10px] font-semibold text-black/60">Participant Discussion</span>
          <span className="ml-auto text-[9px] bg-black/5 text-black/40 px-1.5 py-0.5 rounded-full">{chatMsgs.length} messages</span>
        </div>
        {/* Messages */}
        <div className="max-h-52 overflow-y-auto px-3 py-3 space-y-2.5 bg-white">
          {chatMsgs.map((m, i) => {
            const isYou = m.author === "You";
            return (
              <div key={i} className={`flex flex-col ${isYou ? "items-end" : "items-start"}`}>
                {!isYou && <span className="text-[9px] font-semibold text-black/40 mb-0.5 px-1">{m.author}</span>}
                <div className={`max-w-[85%] px-2.5 py-1.5 rounded-xl text-[11px] leading-relaxed ${
                  isYou ? "bg-black text-white rounded-br-sm" : "bg-black/5 text-black rounded-bl-sm"
                }`}>{m.text}</div>
                <span className="text-[9px] text-black/30 mt-0.5 px-1">{m.time}</span>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>
        {/* Compose */}
        <div className="flex gap-2 px-3 pb-3 pt-2 border-t border-black/8 bg-[#FAFAFA]">
          <textarea
            rows={2}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
            placeholder="Message all participants… (Enter to send)"
            className="flex-1 resize-none rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-[11px] text-black focus:outline-none focus:ring-1 focus:ring-black/20"
          />
          <button
            onClick={sendMsg}
            disabled={!draft.trim()}
            className="h-9 w-9 rounded-lg bg-black text-white flex items-center justify-center hover:bg-black/80 disabled:opacity-30 flex-shrink-0 self-end"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 1. Context Header ────────────────────────────────────────────────────────

/** Derive a rough "age in days" label from a date string. */
function ageInDays(dateStr: string): string {
  if (!dateStr || dateStr === "—") return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const now = new Date("2026-06-26");
  const diff = Math.round((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "today";
  if (diff > 0) return `${diff}d ago`;
  return `in ${Math.abs(diff)}d`;
}

/** Color ramp for a progress percentage. */
function progressColor(pct: number): string {
  if (pct >= 80) return "bg-[#0F172A]";
  if (pct >= 50) return "bg-[#0F172A]";
  if (pct >= 25) return "bg-slate-400";
  return "bg-red-400";
}

function ContextHeader({ record }: { record: WorkbenchRecord }) {
  const statusCls: Record<string, string> = {
    Open:       "bg-slate-100 text-[#0F172A] border-slate-200",
    Pending:    "bg-slate-100 text-[#0F172A] border-slate-200",
    Approved:   "bg-slate-100 text-[#0F172A] border-slate-200",
    Rejected:   "bg-red-100 text-red-700 border-red-200",
    "On Hold":  "bg-gray-100 text-gray-600 border-gray-200",
  };
  const priCls: Record<string, string> = {
    High:   "bg-red-100 text-red-700 border-red-200",
    Medium: "bg-slate-100 text-[#0F172A] border-slate-200",
    Low:    "bg-slate-100 text-[#0F172A] border-slate-200",
  };

  const barColor   = progressColor(record.percentageComplete);
  const dueDays    = ageInDays(record.dueDate);
  const stageAge   = record.ageOnStage;

  return (
    <div className="bg-white border-b border-black/10 px-4 py-3 flex-shrink-0">
      {/* ── Row 1: IDs · badges · title · role ── */}
      <div className="flex flex-wrap items-start gap-3 mb-2">
        <div className="min-w-0 flex-1">
          {/* Reference line */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-mono font-bold text-black/60">{record.recordNumber}</span>
            <span className="text-[10px] text-black/30">·</span>
            <span className="text-xs font-mono text-black/50">{record.referenceNumber}</span>
            <Badge tone="blue">{record.procurementType}</Badge>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${statusCls[record.status] ?? statusCls["On Hold"]}`}>{record.status}</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${priCls[record.priority] ?? ""}`}>{record.priority}</span>
          </div>
          {/* Tender Name — prominently labelled */}
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-semibold text-black/40 uppercase tracking-wide flex-shrink-0">Tender Name</span>
            <h2 className="text-sm font-bold text-black leading-snug">{record.title}</h2>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg flex-shrink-0 ${ROLE_COLORS[record.userRole]}`}>
          <Users className="h-3 w-3" />
          <span className="text-[11px] font-bold">{record.userRole}</span>
        </div>
      </div>

      {/* ── Row 2: Detail field grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-2">
        {/* Each cell: label on top, value below for consistent alignment */}
        {[
          { label: "Ministry",     value: record.ministry,                              wide: true  },
          { label: "Department",   value: record.department,                            wide: false },
          { label: "Fin. Year",    value: record.financialYear,                         wide: false },
          { label: "Budget Code",  value: record.budgetCode,                            wide: false },
          { label: "Value",        value: record.value,                                 wide: false },
          { label: "Organization", value: record.organization,                          wide: false },
        ].map(({ label, value }) => (
          <div key={label} className="min-w-0 bg-[#F9F9F9] border border-black/5 rounded-lg px-2 py-1">
            <div className="text-[9px] font-bold text-black/55 uppercase tracking-wider mb-0.5">{label}</div>
            <div className="text-[11px] font-semibold text-black truncate">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-2">
        {/* Stage */}
        <div className="min-w-0 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Stage</div>
          <div className="text-[11px] font-bold text-[#0F172A] truncate">{record.currentStage}</div>
        </div>
        {/* Due Date with age */}
        <div className="min-w-0 bg-[#F9F9F9] border border-black/5 rounded-lg px-2 py-1">
          <div className="text-[9px] font-bold text-black/55 uppercase tracking-wider mb-0.5">Due Date</div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-black">{record.dueDate}</span>
            {dueDays && (
              <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                dueDays.startsWith("in") ? "bg-slate-100 text-[#0F172A]" : "bg-black/8 text-black/50"
              }`}>{dueDays}</span>
            )}
          </div>
        </div>
        {/* Age on Stage with days counter */}
        <div className="min-w-0 bg-[#F9F9F9] border border-black/5 rounded-lg px-2 py-1">
          <div className="text-[9px] font-bold text-black/55 uppercase tracking-wider mb-0.5">Age on Stage</div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-black">{stageAge}</span>
            <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-slate-100 text-[#0F172A]">
              {/(\d+)/.test(stageAge) ? `${stageAge.match(/\d+/)?.[0]}d` : "—"}
            </span>
          </div>
        </div>
        {/* Owner */}
        <div className="min-w-0 bg-[#F9F9F9] border border-black/5 rounded-lg px-2 py-1">
          <div className="text-[9px] font-bold text-black/55 uppercase tracking-wider mb-0.5">Owner</div>
          <div className="text-[11px] font-semibold text-black truncate">{record.owner}</div>
        </div>
        {/* User */}
        <div className="min-w-0 bg-[#F9F9F9] border border-black/5 rounded-lg px-2 py-1">
          <div className="text-[9px] font-bold text-black/55 uppercase tracking-wider mb-0.5">User</div>
          <div className="text-[11px] font-semibold text-black truncate">{record.userName}</div>
          <div className="text-[9px] text-black/40 truncate">{record.userJobTitle}</div>
        </div>
        {/* Location */}
        <div className="min-w-0 bg-[#F9F9F9] border border-black/5 rounded-lg px-2 py-1">
          <div className="text-[9px] font-bold text-black/55 uppercase tracking-wider mb-0.5">Location</div>
          <div className="text-[11px] font-semibold text-black truncate">{record.userLocation}</div>
        </div>
      </div>

      {/* ── Row 3: Progress bar ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-black/8 rounded-full h-2 overflow-hidden">
          <div
            className={`${barColor} h-full rounded-full transition-all`}
            style={{ width: `${record.percentageComplete}%` }}
          />
        </div>
        <span className={`text-[10px] font-bold flex-shrink-0 ${
          record.percentageComplete >= 80 ? "text-[#0F172A]"
          : record.percentageComplete >= 50 ? "text-[#0F172A]"
          : record.percentageComplete >= 25 ? "text-[#0F172A]"
          : "text-red-500"
        }`}>{record.percentageComplete}% complete</span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className={`h-1.5 w-1.5 rounded-full ${record.connectionStatus === "Online" ? "bg-[#0F172A]" : "bg-red-500"}`} />
          <span className="text-[10px] text-black/40">{record.connectionStatus} · {record.lastSaved} · {record.version}</span>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Workflow Progress Tracker ─────────────────────────────────────────────
function WorkflowTracker({ stages, currentIndex }: { stages: string[]; currentIndex: number }) {
  const start   = Math.max(0, currentIndex - 2);
  const end     = Math.min(stages.length, currentIndex + 3);
  const visible = stages.slice(start, end).map((label, i) => ({
    label,
    index: start + i,
    status: start + i < currentIndex ? "completed" : start + i === currentIndex ? "active" : "pending",
  }));
  const pct = stages.length > 1 ? Math.round((currentIndex / (stages.length - 1)) * 100) : 0;
  return (
    <div className="bg-white border-b border-black/10 px-4 py-2.5 flex-shrink-0">
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
        {start > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-black/30 mr-2 flex-shrink-0">
            <ChevronLeft className="h-3 w-3" /> {start} before
          </div>
        )}
        {visible.map((s, i) => (
          <div key={s.index} className="flex items-center flex-shrink-0">
            <div className={`flex flex-col items-center px-2 py-1 rounded-lg transition-colors
              ${s.status === "active" ? "bg-[#0F172A] text-white" : s.status === "completed" ? "text-[#0F172A]" : "text-black/65"}`}>
              <div className={`h-5 w-5 rounded-full flex items-center justify-center mb-0.5 text-[9px] font-bold
                ${s.status === "active" ? "bg-white text-[#0F172A]" : s.status === "completed" ? "bg-[#0F172A] text-white" : "bg-black/15 text-black/55"}`}>
                {s.status === "completed" ? <Check className="h-3 w-3" /> : s.index + 1}
              </div>
              <span className={`text-[9px] font-semibold whitespace-nowrap ${s.status === "active" ? "text-white" : ""}`}>{s.label}</span>
            </div>
            {i < visible.length - 1 && (
              <div className={`w-6 h-0.5 flex-shrink-0 ${s.status === "completed" ? "bg-slate-400" : "bg-black/10"}`} />
            )}
          </div>
        ))}
        {end < stages.length && (
          <div className="flex items-center gap-1 text-[10px] text-black/30 ml-2 flex-shrink-0">
            {stages.length - end} more <ChevronRight className="h-3 w-3" />
          </div>
        )}
        <div className="ml-auto pl-4 flex items-center gap-2 flex-shrink-0">
          <div className="w-20 bg-black/8 rounded-full h-1.5 overflow-hidden">
            <div className="bg-black h-full rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] text-black/50 font-semibold">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── 3. Navigation Panel ──────────────────────────────────────────────────────
const NAV_TABS: { key: NavTab; label: string; icon: React.ElementType }[] = [
  { key: "overview",       label: "Overview",       icon: Eye           },
  { key: "casefile",       label: "Case File",      icon: FolderOpen    },
  { key: "details",        label: "Details",        icon: FileText      },
  { key: "participants",   label: "Participants",   icon: Users         },
  { key: "suppliers",      label: "Suppliers",      icon: Users         },
  { key: "documents",      label: "Documents",      icon: FileText      },
  { key: "docprocessor",   label: "Doc Processor",  icon: FolderOpen    },
  { key: "approvals",      label: "Approvals",      icon: CheckCircle2  },
  { key: "communications", label: "Comms",          icon: MessageSquare },
  { key: "risks",          label: "Risks",          icon: AlertTriangle },
  { key: "compliance",     label: "Compliance",     icon: Shield        },
  { key: "financials",     label: "Financials",     icon: DollarSign    },
  { key: "performance",    label: "Performance",    icon: BarChart3     },
  { key: "audit",          label: "Audit",          icon: Lock          },
  { key: "ai",             label: "AI Assistant",   icon: Sparkles      },
];
const QUEUE_FILTERS: WorkQueueStatus[] = [
  "My Tasks","Pending Tasks","Overdue Tasks","Escalated Tasks","Delegated Tasks",
];
// Tabs shown to vendors — no internal procurement management tabs
const VENDOR_NAV_TABS: Set<NavTab> = new Set([
  "overview", "documents", "communications", "audit", "ai",
]);

function NavigationPanel({ activeTab, onTabChange, queueFilter, onQueueFilterChange, isVendorPortal = false }: {
  activeTab: NavTab; onTabChange: (t: NavTab) => void;
  queueFilter: WorkQueueStatus; onQueueFilterChange: (f: WorkQueueStatus) => void;
  isVendorPortal?: boolean;
}) {
  const [queueSearch, setQueueSearch] = useState("");
  const visibleTabs = isVendorPortal
    ? NAV_TABS.filter(t => VENDOR_NAV_TABS.has(t.key))
    : NAV_TABS;
  const filteredQueue = MOCK_QUEUE_ITEMS.filter(
    q => q.type === queueFilter &&
    (queueSearch === "" || q.title.toLowerCase().includes(queueSearch.toLowerCase()))
  );
  return (
    <div className="flex flex-col h-full border-r border-black/10 bg-white overflow-hidden">
      <div className="px-3 pt-3 pb-1">
        <span className="text-[9px] font-bold text-black/55 uppercase tracking-wider">Navigation</span>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2 min-h-0">
        <div className="space-y-0.5">
          {visibleTabs.map(t => (
            <button key={t.key} onClick={() => onTabChange(t.key)}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors
                ${activeTab === t.key ? "bg-black text-white" : "text-black/70 hover:bg-[#EAF1F8] hover:text-black"}`}>
              <t.icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{t.label}</span>
            </button>
          ))}
        </div>
        {/* Vendor portal: hide work queue — vendors don't have internal task queues */}
        {!isVendorPortal && (
        <div className="mt-3 pt-2 border-t border-black/8">
          <span className="text-[9px] font-bold text-black/55 uppercase tracking-wider px-2 mb-1 block">Work Queue</span>
          {QUEUE_FILTERS.map(f => {
            const count = MOCK_QUEUE_ITEMS.filter(q => q.type === f).length;
            return (
              <button key={f} onClick={() => onQueueFilterChange(f)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors
                  ${queueFilter === f ? "bg-black text-white" : "text-black/70 hover:bg-[#EAF1F8] hover:text-black"}`}>
                <span className="truncate">{f}</span>
                {count > 0 && <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${queueFilter === f ? "bg-white/20 text-white" : "bg-black/10 text-black/65"}`}>{count}</span>}
              </button>
            );
          })}
          {/* Stage queue search bar */}
          <div className="relative mt-2 mb-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-black/30" />
            <input
              value={queueSearch}
              onChange={e => setQueueSearch(e.target.value)}
              placeholder="Search queue…"
              className="w-full h-6 pl-6 pr-2 text-[10px] border border-black/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/20 bg-[#F9F9F9]"
            />
          </div>
          {filteredQueue.length === 0 && (
            <div className="mx-1 mt-1 p-2 text-[10px] text-black/30 text-center">No tasks match</div>
          )}
          {filteredQueue.map(q => (
            <div key={q.id} className={`mx-1 mt-1 p-2 rounded-lg border text-[10px] cursor-pointer hover:bg-[#EAF1F8]
              ${q.status === "overdue" ? "border-red-100 bg-red-50" : q.status === "active" ? "border-slate-200 bg-slate-50" : "border-black/8"}`}>
              <div className="font-semibold text-black truncate">{q.title}</div>
              <div className={`mt-0.5 ${q.status === "overdue" ? "text-red-500" : "text-black/40"}`}>Due: {q.due}</div>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}

// ─── Case File Tab ────────────────────────────────────────────────────────────
function CaseFileTab({ record }: { record: WorkbenchRecord }) {
  const plan      = SEED_PLANS.find(p => p.ministry === record.ministry) ?? SEED_PLANS[0];
  const req       = SEED_REQUISITIONS.find(r => r.linkedPlanId === plan.id) ?? SEED_REQUISITIONS[0];
  const strategy  = SEED_STRATEGIES.find(s => s.linkedPlanId === plan.id) ?? SEED_STRATEGIES[0];
  const tender    = SEED_TENDER_PREPARATIONS.find(t => t.linkedStrategyId === strategy.id) ?? SEED_TENDER_PREPARATIONS[0];

  const stages = [
    {
      num: 1, label: "Procurement Plan", ref: plan.planNumber,
      status: plan.status, stage: plan.workflowStage,
      progress: plan.workflowProgress, value: `USD ${plan.estimatedBudget}`,
      owner: plan.owner, updated: plan.updatedAt,
      color: "bg-slate-50 border-slate-200", badge: "bg-slate-100 text-[#0F172A]",
    },
    {
      num: 2, label: "Requisition", ref: req.requisitionNumber,
      status: req.status, stage: req.workflowStage,
      progress: req.workflowProgress, value: `USD ${req.totalEstimatedCost}`,
      owner: req.owner, updated: req.updatedAt,
      color: "bg-slate-50 border-slate-200", badge: "bg-slate-100 text-[#0F172A]",
    },
    {
      num: 3, label: "Strategy", ref: strategy.strategyNumber,
      status: strategy.status, stage: strategy.workflowStage,
      progress: strategy.workflowProgress, value: `USD ${strategy.estimatedBudget}`,
      owner: strategy.owner, updated: strategy.updatedAt,
      color: "bg-slate-50 border-slate-200", badge: "bg-slate-100 text-[#0F172A]",
    },
    {
      num: 4, label: "Tender Preparation", ref: tender.tenderNumber,
      status: tender.approvalStatus, stage: tender.approvalStatus,
      progress: tender.workflowProgress, value: `USD ${tender.budgetAllocation}`,
      owner: tender.owner, updated: tender.updatedAt,
      color: "bg-slate-50 border-slate-200", badge: "bg-slate-100 text-[#0F172A]",
    },
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-black/60">Case File — Procurement Record Chain</span>
        <span className="text-[10px] text-black/30 bg-black/5 px-2 py-0.5 rounded-full italic">Linked stages</span>
      </div>

      {/* Linked record chain */}
      {stages.map((s, i) => (
        <div key={s.num} className="relative">
          <div className={`border rounded-xl p-3 ${s.color}`}>
            <div className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-full bg-black text-white text-[10px] font-bold grid place-items-center flex-shrink-0">
                {s.num}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-bold text-black truncate">{s.label}</span>
                    <span className="text-[9px] font-mono text-black/40 flex-shrink-0">{s.ref}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${s.badge}`}>{s.status}</span>
                </div>
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-[10px] text-black/50">Stage: <strong className="text-black">{s.stage}</strong></span>
                  <span className="text-[10px] text-black/50">Value: <strong className="text-black">{s.value}</strong></span>
                  <span className="text-[10px] text-black/50">Owner: <strong className="text-black">{s.owner}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-black/10 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-black h-full rounded-full" style={{ width: `${s.progress}%` }} />
                  </div>
                  <span className="text-[9px] text-black/40 flex-shrink-0">{s.progress}%</span>
                  <span className="text-[9px] text-black/30 flex-shrink-0">Updated {s.updated}</span>
                </div>
              </div>
            </div>
          </div>
          {i < stages.length - 1 && (
            <div className="flex justify-center my-0.5">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-px h-2 bg-black/15" />
                <Link2 className="h-3 w-3 text-black/20" />
                <div className="w-px h-2 bg-black/15" />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Case summary */}
      <div className="mt-2 p-3 bg-black text-white rounded-xl">
        <div className="text-[9px] font-bold text-white/50 uppercase tracking-wider mb-2">Case Summary</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
          {[
            { label: "Record",    value: record.recordNumber },
            { label: "Ministry",  value: record.ministry.replace("Ministry of ", "MoE").slice(0, 28) },
            { label: "Stage",     value: record.currentStage },
            { label: "Value",     value: record.value },
            { label: "Due",       value: record.dueDate },
            { label: "Complete",  value: `${record.percentageComplete}%` },
          ].map(f => (
            <div key={f.label}>
              <span className="text-white/40">{f.label}: </span>
              <span className="text-white font-semibold">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations from linked records */}
      {plan.aiRecommendations.length > 0 && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#0F172A]" />
            <span className="text-[10px] font-bold text-[#0F172A]">AI Insights — Plan</span>
          </div>
          {plan.aiRecommendations.map((r, i) => (
            <div key={i} className="text-[10px] text-[#0F172A] flex items-start gap-1.5 mb-0.5">
              <span className="text-slate-400 flex-shrink-0">•</span>
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Doc Processor Tab ───────────────────────────────────────────────────────
type DocAction = "View" | "Edit" | "Share" | "Comment" | "Accept" | "Reject" | "Return" | "Escalate" | "Approve" | "Review Only" | "Authorize";
type MarkScore = { section: string; maxMark: number; allocated: number; comment: string };

function DocProcessorTab({ record, moduleLabel }: { record: WorkbenchRecord; moduleLabel: string }) {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [action, setAction] = useState<DocAction | null>(null);
  const [showMarkKey, setShowMarkKey] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [comment, setComment] = useState("");
  const [aiMarking, setAiMarking] = useState(false);
  const [markScores, setMarkScores] = useState<MarkScore[]>([
    { section: "Technical Compliance",    maxMark: 30, allocated: 0, comment: "" },
    { section: "Delivery Capability",     maxMark: 20, allocated: 0, comment: "" },
    { section: "Experience & References", maxMark: 25, allocated: 0, comment: "" },
    { section: "Financial Capacity",      maxMark: 15, allocated: 0, comment: "" },
    { section: "Warranty & After-Sales",  maxMark: 10, allocated: 0, comment: "" },
  ]);
  const [checklist, setChecklist] = useState([
    { item: "Document is legible and complete",          checked: false },
    { item: "All required signatures present",           checked: false },
    { item: "Document matches submission requirements",  checked: false },
    { item: "Version matches latest issued",             checked: false },
    { item: "No unauthorized amendments",                checked: false },
    { item: "All attachments accounted for",             checked: false },
  ]);
  const act = (msg: string) => pushNotification(msg, "success");

  const totalMax = markScores.reduce((a, s) => a + s.maxMark, 0);
  const totalAllocated = markScores.reduce((a, s) => a + s.allocated, 0);
  const pct = totalMax > 0 ? Math.round((totalAllocated / totalMax) * 100) : 0;

  const handleAiMark = () => {
    setAiMarking(true);
    setTimeout(() => {
      setMarkScores(p => p.map(s => ({
        ...s,
        allocated: Math.round(s.maxMark * (0.65 + Math.random() * 0.3)),
        comment: "AI assessed based on document content, database cross-reference, and compliance standards.",
      })));
      setAiMarking(false);
      act("AI auto-marking completed");
    }, 1400);
  };

  const DOC_ACTIONS: DocAction[] = ["View", "Edit", "Share", "Comment", "Accept", "Reject", "Return", "Escalate", "Approve", "Review Only", "Authorize"];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-[#0f172a] text-white px-4 py-2 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Document Explorer</span>
        <span className="text-white/30">·</span>
        <span className="text-[10px] text-white/60">{moduleLabel}</span>
        <div className="ml-auto flex gap-1.5">
          <button onClick={() => setShowMarkKey(v => !v)}
            className={`h-6 px-2 text-[10px] font-semibold transition-colors appois-glow-on-hover ${showMarkKey ? "bg-[#0F172A] text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            style={{ borderRadius: 0 }}>
            ✏️ Marking Key
          </button>
          <button onClick={() => setShowChecklist(v => !v)}
            className={`h-6 px-2 text-[10px] font-semibold transition-colors appois-glow-on-hover ${showChecklist ? "bg-[#0F172A] text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            style={{ borderRadius: 0 }}>
            ☑️ Checklist
          </button>
          <button onClick={() => act("Document uploaded")}
            className="h-6 px-2 text-[10px] font-semibold bg-[#0F172A] text-white hover:bg-[#0F172A] appois-glow-on-hover" style={{ borderRadius: 0 }}>
            + Upload
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Document list */}
        <div className="w-52 flex-shrink-0 border-r border-black/10 overflow-y-auto bg-[#FAFAFA]">
          <div className="px-2 py-1.5 text-[9px] font-bold text-black/40 uppercase tracking-wider border-b border-black/8">
            Attached Documents ({MOCK_DOCUMENTS.length})
          </div>
          {MOCK_DOCUMENTS.map((doc, i) => (
            <button key={i} onClick={() => setSelectedDoc(doc.name)}
              className={`w-full text-left px-2 py-2.5 border-b border-black/5 transition-colors group ${selectedDoc === doc.name ? "bg-[#0f172a] text-white" : "hover:bg-[#EAF1F8]"}`}>
              <div className="flex items-start gap-1.5">
                <FileText className={`h-3 w-3 flex-shrink-0 mt-0.5 ${selectedDoc === doc.name ? "text-slate-400" : "text-black/30"}`} />
                <div className="min-w-0 flex-1">
                  <div className={`text-[10px] font-semibold leading-tight truncate ${selectedDoc === doc.name ? "text-white" : "text-black"}`}>{doc.name}</div>
                  <div className={`text-[9px] mt-0.5 ${selectedDoc === doc.name ? "text-slate-300" : "text-black/40"}`}>{doc.category} · v1.0 · {doc.size}</div>
                  <div className={`text-[9px] ${doc.status === "Final" || doc.status === "Approved" ? "text-[#0F172A]" : "text-[#0F172A]"} font-semibold`}>{doc.status}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Main doc area */}
        <div className="flex-1 min-w-0 overflow-y-auto flex flex-col">
          {selectedDoc ? (
            <>
              {/* Action toolbar */}
              <div className="flex-shrink-0 bg-white border-b border-black/10 px-3 py-2 flex items-center gap-1.5 flex-wrap">
                {DOC_ACTIONS.map(a => (
                  <button key={a} onClick={() => { setAction(a); act(`${a}: ${selectedDoc}`); }}
                    className={`h-6 px-2 text-[10px] font-semibold transition-all appois-glow-on-hover ${action === a ? "bg-[#0f172a] text-white" : "bg-[#EAF1F8] text-black/70 hover:bg-[#0f172a] hover:text-white"}`}
                    style={{ borderRadius: 0 }}>
                    {a}
                  </button>
                ))}
              </div>

              {/* Document viewer simulation */}
              <div className="flex-1 bg-[#F0F0F0] p-4 flex items-center justify-center relative">
                <div className="bg-white shadow-lg w-full max-w-2xl" style={{ minHeight: "400px", borderRadius: 0 }}>
                  {/* MS Word-style toolbar */}
                  <div className="bg-[#2b579a] text-white px-3 py-1.5 flex items-center gap-4 text-[10px]">
                    <span className="font-semibold">{selectedDoc}</span>
                    <div className="flex items-center gap-2 ml-auto">
                      {["File", "Home", "Insert", "Review", "View"].map(t => (
                        <button key={t} className="hover:bg-white/20 px-1.5 py-0.5 transition-colors">{t}</button>
                      ))}
                    </div>
                  </div>
                  {/* Formatting toolbar */}
                  <div className="bg-[#f3f3f3] border-b border-black/10 px-3 py-1 flex items-center gap-2 text-[10px]">
                    {["B", "I", "U"].map(f => (
                      <button key={f} className="h-5 w-5 border border-black/15 bg-white font-bold hover:bg-slate-50 transition-colors" style={{ borderRadius: 0 }}>{f}</button>
                    ))}
                    <div className="h-4 w-px bg-black/15" />
                    {["Align L", "Center", "Align R"].map(f => (
                      <button key={f} className="h-5 px-1.5 border border-black/10 bg-white hover:bg-slate-50 text-[9px] transition-colors" style={{ borderRadius: 0 }}>{f}</button>
                    ))}
                    <div className="h-4 w-px bg-black/15" />
                    <span className="text-black/50">Font: </span>
                    <select className="h-5 px-1 border border-black/10 bg-white text-[9px]" style={{ borderRadius: 0 }}>
                      <option>Calibri</option><option>Arial</option><option>Times New Roman</option>
                    </select>
                    <input type="number" defaultValue={11} className="h-5 w-8 border border-black/10 bg-white text-[9px] text-center" style={{ borderRadius: 0 }} />
                  </div>
                  {/* Document content area */}
                  <div className="p-6 min-h-64">
                    <div className="text-center text-xs font-bold mb-2">GOVERNMENT OF ZIMBABWE</div>
                    <div className="text-center text-xs font-semibold mb-4">{record.ministry.toUpperCase()}</div>
                    <div className="text-center text-[11px] mb-6">{selectedDoc}</div>
                    <div className="text-xs text-black/60 leading-relaxed space-y-2">
                      <p><strong>Reference:</strong> {record.recordNumber} · {record.referenceNumber}</p>
                      <p><strong>Subject Matter:</strong> {record.title}</p>
                      <p><strong>Department:</strong> {record.department}</p>
                      <p><strong>Financial Year:</strong> {record.financialYear}</p>
                      <p className="mt-4">This document has been prepared in accordance with the Public Procurement and Disposal of Public Assets Act (PPDPA) 2018 and Treasury Instructions. All procurement activities have been conducted transparently and in compliance with applicable regulations.</p>
                      <p>For any queries regarding this document, please contact the Procurement Department at the above-referenced ministry.</p>
                    </div>
                  </div>
                </div>

                {/* AI Glow overlay when reviewing */}
                {action === "Review Only" && (
                  <div className="absolute top-2 right-2 bg-[#0F172A] text-white text-[10px] font-bold px-2 py-1 flex items-center gap-1" style={{ boxShadow: "0 0 12px rgba(139,92,246,0.5)", borderRadius: 0 }}>
                    <Sparkles className="h-3 w-3" /> Review Mode
                  </div>
                )}
              </div>

              {/* Comment / report box */}
              <div className="flex-shrink-0 border-t border-black/10 bg-white p-3">
                <div className="text-[10px] font-bold text-black/50 uppercase tracking-wider mb-1.5">Comment / Report on Document</div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2}
                  placeholder="Type a comment, justification, or review report about this document…"
                  className="w-full px-2.5 py-2 text-xs border border-black/10 resize-none focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20" style={{ borderRadius: 0 }} />
                <div className="flex gap-2 mt-1.5">
                  <button onClick={() => act("Comment saved")}
                    className="h-7 px-3 bg-[#0f172a] text-white text-[10px] font-semibold appois-glow-on-hover" style={{ borderRadius: 0 }}>Save Comment</button>
                  <button onClick={() => act("Document shared")}
                    className="h-7 px-3 border border-black/10 text-[10px] text-black/60 hover:bg-[#EAF1F8] appois-glow-on-hover" style={{ borderRadius: 0 }}>Share</button>
                  <button onClick={() => act("PDF exported")}
                    className="h-7 px-3 border border-black/10 text-[10px] text-black/60 hover:bg-[#EAF1F8] appois-glow-on-hover" style={{ borderRadius: 0 }}>Export PDF</button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-black/30 gap-2 p-8">
              <FileText className="h-12 w-12 opacity-30" />
              <span className="text-sm">Select a document from the list to view</span>
              <span className="text-xs">or upload a new document</span>
            </div>
          )}
        </div>

        {/* Marking Key & Checklist panel */}
        {(showMarkKey || showChecklist) && (
          <div className="w-64 flex-shrink-0 border-l border-black/10 overflow-y-auto bg-white flex flex-col">
            {showMarkKey && (
              <div className="flex-1 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0f172a]">Marking Key Score Card</span>
                  <div className="flex gap-1">
                    <button onClick={handleAiMark} disabled={aiMarking}
                      className="h-6 px-2 bg-[#0F172A] text-white text-[9px] font-bold flex items-center gap-1 disabled:opacity-50 appois-glow-on-hover" style={{ borderRadius: 0 }}>
                      <Sparkles className="h-2.5 w-2.5" /> {aiMarking ? "Marking…" : "AI Mark"}
                    </button>
                  </div>
                </div>
                {/* Score summary */}
                <div className="bg-[#0f172a] text-white p-2.5" style={{ borderRadius: 0 }}>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">Total Score</div>
                  <div className="text-2xl font-bold">{totalAllocated}<span className="text-sm text-white/50">/{totalMax}</span></div>
                  <div className="mt-1 bg-white/10 h-1.5 overflow-hidden" style={{ borderRadius: 0 }}>
                    <div className={`h-full transition-all ${pct >= 70 ? "bg-slate-400" : pct >= 50 ? "bg-slate-400" : "bg-red-400"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{pct}% — {pct >= 70 ? "Pass" : pct >= 50 ? "Marginal" : "Fail"}</div>
                </div>
                {/* Per-section scores */}
                {markScores.map((s, i) => (
                  <div key={i} className="border border-black/8 p-2" style={{ borderRadius: 0 }}>
                    <div className="text-[10px] font-semibold text-black mb-1">{s.section}</div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-[9px] text-black/40">Score:</label>
                      <input type="number" min={0} max={s.maxMark} value={s.allocated}
                        onChange={e => setMarkScores(p => p.map((sc, idx) => idx === i ? { ...sc, allocated: Math.min(s.maxMark, Math.max(0, Number(e.target.value))) } : sc))}
                        className="w-12 h-6 px-1.5 text-xs border border-black/10 text-center" style={{ borderRadius: 0 }} />
                      <span className="text-[9px] text-black/40">/ {s.maxMark}</span>
                    </div>
                    <textarea rows={1} value={s.comment}
                      onChange={e => setMarkScores(p => p.map((sc, idx) => idx === i ? { ...sc, comment: e.target.value } : sc))}
                      placeholder="Comment…"
                      className="w-full px-1.5 py-1 text-[9px] border border-black/8 resize-none focus:outline-none" style={{ borderRadius: 0 }} />
                  </div>
                ))}
                <button onClick={() => act("Marking submitted")}
                  className="w-full h-8 bg-[#0F172A] text-white text-xs font-semibold appois-glow-on-hover" style={{ borderRadius: 0 }}>
                  Submit Marks
                </button>
              </div>
            )}
            {showChecklist && (
              <div className="p-3 space-y-2 border-t border-black/8">
                <div className="text-xs font-bold text-[#0f172a]">Document Checklist</div>
                {checklist.map((item, i) => (
                  <label key={i} className={`flex items-center gap-2 p-2 border cursor-pointer text-xs transition-colors ${item.checked ? "bg-slate-50 border-slate-200" : "border-black/8 hover:bg-[#EAF1F8]"}`}
                    style={{ borderRadius: 0 }}>
                    <input type="checkbox" checked={item.checked}
                      onChange={() => setChecklist(p => p.map((c, idx) => idx === i ? { ...c, checked: !c.checked } : c))}
                      className="accent-emerald-600" />
                    <span className={item.checked ? "line-through text-black/40" : ""}>{item.item}</span>
                    {item.checked && <CheckCircle2 className="h-3 w-3 text-slate-600 ml-auto flex-shrink-0" />}
                  </label>
                ))}
                <div className="text-[10px] text-black/50 text-center pt-1">
                  {checklist.filter(c => c.checked).length}/{checklist.length} items verified
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 4. Main Work Area — renders children for the module-specific form ────────
function MainWorkArea({ activeTab, record, moduleLabel, children }: {
  activeTab: NavTab;
  record: WorkbenchRecord;
  moduleLabel: string;
  children?: ReactNode;
}) {
  const [checks, setChecks] = useState({
    specAttached: true, budgetApproved: true, evalCompleted: false,
    declarationsSigned: false, conflictsChecked: true,
  });
  const [workAreaTab, setWorkAreaTab] = useState<"form" | "checklist" | "instructions">("form");
  const toggle = (k: keyof typeof checks) => setChecks(p => ({ ...p, [k]: !p[k] }));
  const act = (msg: string) => pushNotification(msg, "success");

  if (activeTab === "overview") return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-black/8 bg-white flex-shrink-0 px-4 pt-2">
        {(["form","checklist","instructions"] as const).map(t => (
          <button key={t} onClick={() => setWorkAreaTab(t)}
            className={`px-3 pb-2 text-[10px] font-semibold border-b-2 transition-colors -mb-px mr-1
              ${workAreaTab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>
            {t === "form" ? "Work Form" : t === "checklist" ? "Checklist" : "Task Instructions"}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {workAreaTab === "form" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Module",        value: moduleLabel,                  color: "bg-slate-50 border-slate-200 text-[#0F172A]"    },
                { label: "Current Stage", value: record.currentStage,          color: "bg-black text-white border-black"             },
                { label: "Value",         value: record.value,                 color: "bg-slate-50 border-slate-200 text-[#0F172A]" },
                { label: "Completion",    value: `${record.percentageComplete}%`, color: "bg-slate-50 border-slate-200 text-[#0F172A]" },
              ].map(c => (
                <div key={c.label} className={`p-3 rounded-xl border ${c.color}`}>
                  <div className="text-[10px] font-medium opacity-70">{c.label}</div>
                  <div className="text-sm font-bold mt-0.5">{c.value}</div>
                </div>
              ))}
            </div>
            {/* Module-specific work form content */}
            {children ? (
              <div>{children}</div>
            ) : (
              <div className="p-3 bg-white border border-black/10 rounded-xl space-y-3">
                <div className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                  Stage Work Form — {moduleLabel} · {record.currentStage}
                </div>
                {[
                  { label: "Description / Notes", placeholder: "Enter stage notes or summary…" },
                  { label: "Recommendation",      placeholder: "State your recommendation for this stage…" },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-[10px] font-semibold text-black/50 mb-1">{f.label}</label>
                    <textarea rows={2} placeholder={f.placeholder}
                      className="w-full px-3 py-2 text-xs border border-black/10 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-black/10" />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Amount (USD)",  placeholder: "e.g. 1,250,000" },
                    { label: "Budget Code",   placeholder: record.budgetCode },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="block text-[10px] font-semibold text-black/50 mb-1">{f.label}</label>
                      <input placeholder={f.placeholder} className="w-full h-8 px-3 text-xs border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" />
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-white border border-black/10 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Line Items</div>
                    <button onClick={() => act("Row added")} className="h-6 px-2 bg-black text-white rounded-lg text-[9px] flex items-center gap-1 hover:opacity-90">
                      <Plus className="h-3 w-3" /> Add Row
                    </button>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-black/8">
                        {["Item","Qty","Unit Price (USD)","Total (USD)"].map(h => (
                          <th key={h} className="text-left text-[9px] font-bold text-black/40 uppercase pb-1.5 pr-2">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { item: `${moduleLabel} — Item A`, qty:"100",unit:"1,250.00",total:"125,000" },
                        { item: `${moduleLabel} — Item B`, qty:"50", unit:"2,400.00",total:"120,000" },
                        { item: "Delivery & Installation (5%)", qty:"—", unit:"—", total:"12,250" },
                      ].map((row,i) => (
                        <tr key={i} className="border-b border-black/5 hover:bg-[#EAF1F8]">
                          <td className="py-1.5 pr-2 text-black/80">{row.item}</td>
                          <td className="py-1.5 pr-2 text-black/60">{row.qty}</td>
                          <td className="py-1.5 pr-2 text-black/60">{row.unit}</td>
                          <td className="py-1.5 text-black font-semibold">{row.total}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-black/20">
                        <td colSpan={3} className="py-2 text-xs font-bold text-right pr-2">TOTAL</td>
                        <td className="py-2 text-sm font-bold text-black">257,250</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#0F172A]">
                <strong>AI Alert:</strong> Verify all required documents and approvals before advancing to the next stage.
              </div>
            </div>
          </>
        )}
        {workAreaTab === "checklist" && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-black/50 mb-1">Stage Completeness Checklist — {moduleLabel}</div>
            {[
              { key: "specAttached"        as const, label: "Specification / TOR attached",       required: true  },
              { key: "budgetApproved"      as const, label: "Budget approved and confirmed",       required: true  },
              { key: "evalCompleted"       as const, label: "Stage work completed and signed",     required: true  },
              { key: "declarationsSigned"  as const, label: "All declarations signed",             required: true  },
              { key: "conflictsChecked"    as const, label: "Conflict of interest checks done",    required: true  },
            ].map(item => (
              <label key={item.key} className="flex items-center gap-3 p-3 border border-black/8 rounded-xl cursor-pointer hover:bg-[#EAF1F8] transition-colors">
                <div onClick={() => toggle(item.key)}
                  className={`h-5 w-5 rounded-md border-2 grid place-items-center flex-shrink-0 transition-colors cursor-pointer
                    ${checks[item.key] ? "bg-black border-black" : "border-black/20"}`}>
                  {checks[item.key] && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-xs text-black flex-1">{item.label}</span>
                {item.required && <span className="text-[9px] text-red-500 font-semibold">Required</span>}
                {checks[item.key] && <span className="text-[10px] text-[#0F172A] font-semibold">✓ Met</span>}
              </label>
            ))}
            <div className={`p-2.5 rounded-xl text-xs font-semibold text-center ${Object.values(checks).every(Boolean) ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>
              {Object.values(checks).filter(Boolean).length}/{Object.values(checks).length} items met
              {!Object.values(checks).every(Boolean) && " — resolve all before submitting"}
            </div>
          </div>
        )}
        {workAreaTab === "instructions" && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-black/50 mb-1">Task Instructions — {moduleLabel} · {record.currentStage}</div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0F172A] leading-relaxed">
              <strong>Your role: {record.userRole}.</strong> Complete all stage tasks below before submitting for review.
            </div>
            {[
              { step:1, title: "Review all submitted documents for completeness", done: true  },
              { step:2, title: "Verify approvals from all required signatories",   done: true  },
              { step:3, title: "Complete the stage work form with all details",    done: false },
              { step:4, title: "Upload supporting documents to the document vault", done: false },
              { step:5, title: "Submit for next approval level",                   done: false },
            ].map(s => (
              <div key={s.step} className={`flex items-start gap-3 p-3 border rounded-xl ${s.done ? "border-slate-200 bg-slate-50" : "border-black/8 bg-white"}`}>
                <div className={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold flex-shrink-0 ${s.done ? "bg-[#0F172A] text-white" : "bg-black/10 text-black/40"}`}>
                  {s.done ? <Check className="h-3.5 w-3.5" /> : s.step}
                </div>
                <span className={`text-xs ${s.done ? "text-[#0F172A] line-through opacity-70" : "text-black"}`}>{s.title}</span>
              </div>
            ))}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-[#0F172A]" />
                <span className="text-[10px] font-bold text-[#0F172A]">AI Guidance — {moduleLabel}</span>
              </div>
              <p className="text-xs text-[#0F172A] leading-relaxed">
                Based on your current stage, your priority is to complete all required fields in the work form and ensure all supporting documents are attached before submission.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (activeTab === "details") return (
    <div className="p-4 space-y-2">
      <div className="text-xs font-semibold text-black/50 mb-1">Core Information — {moduleLabel}</div>
      {[
        { label: "Module",              value: moduleLabel },
        { label: "Estimated Value",     value: record.value },
        { label: "Budget Code",         value: record.budgetCode },
        { label: "Financial Year",      value: record.financialYear },
        { label: "Procuring Entity",    value: record.organization },
        { label: "Responsible Officer", value: `${record.userName} — ${record.userJobTitle}` },
        { label: "Ministry",            value: record.ministry },
        { label: "Department",          value: record.department },
        { label: "Record Number",       value: record.recordNumber },
        { label: "Reference",           value: record.referenceNumber },
      ].map(f => (
        <div key={f.label} className="flex items-start gap-2 p-2.5 border border-black/8 rounded-lg">
          <span className="text-[11px] font-medium text-black/50 flex-shrink-0 w-36">{f.label}:</span>
          <span className="text-xs text-black">{f.value}</span>
        </div>
      ))}
    </div>
  );

  if (activeTab === "participants") return (
    <ParticipantsTab onAct={act} />
  );

  if (activeTab === "suppliers") return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-black/60">Bidders & Vendors — {MOCK_SUPPLIERS.length} registered</span>
        <span className="text-[10px] bg-black/5 text-black/50 px-2 py-0.5 rounded-full">Bids received</span>
      </div>
      {MOCK_SUPPLIERS.map((s) => (
        <div key={s.id} className="p-3 border border-black/8 rounded-xl hover:bg-[#EAF1F8] transition-colors">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-black truncate">{s.name}</div>
              <div className="text-[10px] text-black/40">{s.id}</div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${s.status === "Qualified" ? "bg-slate-100 text-[#0F172A]" : s.status === "Under Review" ? "bg-slate-100 text-[#0F172A]" : "bg-red-100 text-red-700"}`}>{s.status}</span>
              <span className={`text-[9px] font-semibold px-1 py-0.5 rounded ${s.risk === "Low" ? "bg-slate-50 text-[#0F172A]" : s.risk === "Medium" ? "bg-slate-50 text-[#0F172A]" : "bg-red-50 text-red-600"}`}>{s.risk}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-black/50">Tech: <strong className="text-black">{s.score}</strong></span>
            <span className="text-[10px] text-black/50">Financial: <strong className="text-black">{s.financial}</strong></span>
            <div className="flex-1 bg-black/8 rounded-full h-1 overflow-hidden">
              <div className="bg-black h-full rounded-full" style={{ width: `${s.score}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (activeTab === "approvals") return (
    <div className="p-4 space-y-2">
      <div className="text-xs font-semibold text-black/60 mb-2">Approval Chain & History</div>
      {MOCK_APPROVALS.map((a, i) => (
        <div key={i} className="flex gap-3 p-3 border border-black/8 rounded-xl">
          {/* Timeline spine */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className={`h-6 w-6 rounded-full grid place-items-center ${a.status === "Approved" ? "bg-[#0F172A]" : a.status === "Pending" ? "bg-slate-400" : "bg-black/10"}`}>
              {a.status === "Approved" ? <Check className="h-3 w-3 text-white" /> : <Clock className="h-3 w-3 text-white" />}
            </div>
            {i < MOCK_APPROVALS.length - 1 && <div className="w-px flex-1 bg-black/8 mt-0.5 mb-0.5 min-h-[20px]" />}
          </div>

          {/* Card body */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Row 1 — Stage label + stage name + status badge */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/5 text-black/40 flex-shrink-0">{a.stageLabel}</span>
                <span className="text-xs font-semibold text-black truncate">{a.stage}</span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${a.status === "Approved" ? "bg-slate-100 text-[#0F172A]" : a.status === "Pending" ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-500"}`}>{a.status}</span>
            </div>

            {/* Row 2 — Approver & role */}
            <div className="text-[10px] text-black/50">{a.approver} · {a.role}</div>

            {/* Row 3 — Dates, time, age */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              <div className="text-[9px] text-black/35"><span className="font-semibold text-black/50">Start:</span> {a.startDate}</div>
              <div className="text-[9px] text-black/35"><span className="font-semibold text-black/50">End:</span> {a.endDate}</div>
              <div className="text-[9px] text-black/35"><span className="font-semibold text-black/50">Time:</span> {a.time}</div>
              <div className="text-[9px] text-black/35"><span className="font-semibold text-black/50">Age:</span> {a.age}</div>
            </div>

            {/* Row 4 — Compliance indicator + file link */}
            <div className="flex items-center gap-3 pt-0.5">
              {/* Compliance checkbox */}
              <div className="flex items-center gap-1">
                <div className={`h-3.5 w-3.5 rounded border flex-shrink-0 grid place-items-center
                  ${a.complianceMet === true ? "bg-[#0F172A] border-slate-200"
                    : a.complianceMet === false ? "bg-red-400 border-red-400"
                    : "border-black/20 bg-white"}`}>
                  {a.complianceMet === true  && <Check className="h-2.5 w-2.5 text-white" />}
                  {a.complianceMet === false && <X className="h-2.5 w-2.5 text-white" />}
                </div>
                <span className={`text-[9px] font-medium
                  ${a.complianceMet === true ? "text-[#0F172A]"
                    : a.complianceMet === false ? "text-red-500"
                    : "text-black/30"}`}>
                  {a.complianceMet === true ? "Compliant" : a.complianceMet === false ? "Non-compliant" : "Not assessed"}
                </span>
              </div>
              {/* Compliance file link */}
              {a.complianceFile ? (
                <button onClick={() => act(`Opened compliance file: ${a.complianceFile}`)}
                  className="flex items-center gap-1 text-[9px] text-[#0F172A] hover:text-[#0F172A] transition-colors">
                  <FileText className="h-3 w-3" />
                  <span className="underline underline-offset-2 truncate max-w-[120px]">{a.complianceFile}</span>
                </button>
              ) : (
                <span className="text-[9px] text-black/20 italic">No compliance file</span>
              )}
            </div>

            {/* Row 5 — Comment */}
            {a.comment && <div className="text-[10px] text-black/40 italic">"{a.comment}"</div>}

            {/* Row 6 — Discussion thread link */}
            <div className="pt-0.5">
              <button onClick={() => act(`Opened discussion: ${a.discussionLink}`)}
                className="flex items-center gap-1 text-[9px] text-black/40 hover:text-black transition-colors">
                <MessageSquare className="h-3 w-3" />
                <span className="underline underline-offset-2">{a.discussionLink}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => act("Submitted for next approval")} className="w-full h-9 mt-1 bg-black text-white rounded-xl text-xs font-medium hover:opacity-90 transition-opacity">
        Submit for Next Approval
      </button>
    </div>
  );

  if (activeTab === "communications") return (
    <div className="p-4 space-y-3">
      <div className="text-xs font-semibold text-black/60">Communications — Messages & Clarifications</div>
      <div className="flex gap-2 flex-wrap">
        {["Team Chat","Clarification Request","Meeting Notes"].map(t => (
          <button key={t} onClick={() => act(`${t} opened`)} className="h-7 px-2.5 border border-black/10 rounded-lg text-[10px] hover:bg-black hover:text-white transition-colors">{t}</button>
        ))}
      </div>
      {MOCK_NOTES.map((n, i) => (
        <div key={i} className="p-3 border border-black/8 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-5 rounded-full bg-black text-white text-[9px] font-bold grid place-items-center flex-shrink-0">
              {n.author.split(" ").map((x: string) => x[0]).join("").slice(0, 2)}
            </div>
            <span className="text-xs font-semibold text-black">{n.author}</span>
            <span className="text-[10px] text-black/30 ml-auto">{n.time}</span>
          </div>
          <p className="text-xs text-black/70 leading-relaxed pl-7">{n.text}</p>
        </div>
      ))}
    </div>
  );

  if (activeTab === "risks") return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-black/60">Risk Register</span>
        <button onClick={() => act("Risk logged")} className="h-7 px-2.5 bg-black text-white rounded-lg text-[10px] flex items-center gap-1 hover:opacity-90">
          <Flag className="h-3 w-3" /> Log Risk
        </button>
      </div>
      {MOCK_RISKS.map((r) => (
        <div key={r.id} className={`p-3 border rounded-xl ${r.level === "High" ? "border-red-100 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-semibold text-black">{r.title}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${r.level === "High" ? "bg-red-200 text-red-700" : "bg-slate-200 text-[#0F172A]"}`}>{r.level}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${r.status === "Open" ? "bg-slate-100 text-[#0F172A]" : r.status === "Escalated" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>{r.status}</span>
            </div>
          </div>
          <div className="text-[10px] text-black/50 mb-0.5">{r.category} · Owner: {r.owner}</div>
          <div className="text-[10px] text-black/60 italic">Mitigation: {r.mitigation}</div>
        </div>
      ))}
    </div>
  );

  if (activeTab === "compliance") return (
    <div className="p-4 space-y-3">
      <div className="text-xs font-semibold text-black/50">Compliance Checklist — {moduleLabel}</div>
      {[
        { key: "specAttached"        as const, label: "Specification / TOR attached"      },
        { key: "budgetApproved"      as const, label: "Budget approved and confirmed"      },
        { key: "evalCompleted"       as const, label: "Stage work completed and signed"    },
        { key: "declarationsSigned"  as const, label: "All declarations signed"            },
        { key: "conflictsChecked"    as const, label: "Conflict of interest checks done"   },
      ].map(item => (
        <label key={item.key} className="flex items-center gap-3 p-3 border border-black/8 rounded-xl cursor-pointer hover:bg-[#EAF1F8] transition-colors">
          <div onClick={() => toggle(item.key)}
            className={`h-5 w-5 rounded-md border-2 grid place-items-center flex-shrink-0 transition-colors cursor-pointer ${checks[item.key] ? "bg-black border-black" : "border-black/20"}`}>
            {checks[item.key] && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className="text-xs text-black flex-1">{item.label}</span>
          {checks[item.key] && <span className="text-[10px] text-[#0F172A] font-semibold">✓ Met</span>}
        </label>
      ))}
      <div className={`p-2.5 rounded-xl text-xs font-semibold text-center ${Object.values(checks).every(Boolean) ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>
        {Object.values(checks).filter(Boolean).length}/{Object.values(checks).length} items met
      </div>
    </div>
  );

  if (activeTab === "financials") return (
    <div className="p-4 space-y-2">
      <div className="text-xs font-semibold text-black/50">Budget & Expenditure</div>
      {[
        { label: "Approved Budget",   value: record.value,   cls: "bg-slate-50 border-slate-200 text-[#0F172A]"       },
        { label: "Committed (PO)",    value: record.value,   cls: "bg-slate-50 border-slate-200 text-[#0F172A]"    },
        { label: "Invoiced to Date",  value: "USD 0",        cls: "bg-gray-50 border-gray-200 text-gray-700"       },
        { label: "Available Balance", value: "USD 0",        cls: "bg-slate-50 border-slate-200 text-[#0F172A]" },
      ].map(b => (
        <div key={b.label} className={`flex items-center justify-between p-3 border rounded-xl ${b.cls}`}>
          <span className="text-xs font-medium">{b.label}</span>
          <span className="text-sm font-bold">{b.value}</span>
        </div>
      ))}
    </div>
  );

  if (activeTab === "performance") return (
    <div className="p-4 space-y-2">
      <div className="text-xs font-semibold text-black/50">KPIs & Performance</div>
      {[
        { label: "Cycle Time",          value: "18 days", target: "14 days", met: false, bar: 70  },
        { label: "Compliance Score",    value: "82%",     target: "90%",     met: false, bar: 82  },
        { label: "Document Complete",   value: "94%",     target: "100%",    met: false, bar: 94  },
        { label: "Budget Accuracy",     value: "On track",target: "On track",met: true,  bar: 96  },
      ].map(k => (
        <div key={k.label} className="p-3 border border-black/8 rounded-xl">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-black">{k.label}</span>
            <span className={`text-[9px] px-1 py-0.5 rounded font-semibold ${k.met ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>
              {k.met ? "✓ Met" : `Target: ${k.target}`}
            </span>
          </div>
          <div className="w-full bg-black/8 rounded-full h-1 overflow-hidden">
            <div className={`h-full rounded-full ${k.met ? "bg-[#0F172A]" : "bg-slate-400"}`} style={{ width: `${k.bar}%` }} />
          </div>
        </div>
      ))}
    </div>
  );

  if (activeTab === "audit") return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-black/60">Activity History</span>
        <span className="text-[10px] text-black/30 italic">Immutable — nothing hidden</span>
      </div>
      {MOCK_AUDIT.map((a, i) => (
        <div key={i} className="flex gap-3 p-2.5 border border-black/8 rounded-xl">
          <div className="h-6 w-6 rounded-full bg-black/10 text-black/50 text-[9px] font-bold grid place-items-center flex-shrink-0">
            {a.user.split(" ").map((x: string) => x[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-black">{a.user}</span>
              <span className="text-[10px] text-black/30 flex-shrink-0">{a.timestamp}</span>
            </div>
            <p className="text-xs text-black/70 mt-0.5">{a.action}</p>
            {a.reason && <p className="text-[10px] text-black/40 italic mt-0.5">"{a.reason}"</p>}
          </div>
        </div>
      ))}
    </div>
  );

  if (activeTab === "ai") return (
    <div className="p-4 space-y-3">
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#0F172A] flex-shrink-0" />
        <div>
          <div className="text-xs font-bold text-[#0F172A]">AI Assistant — {moduleLabel}</div>
          <div className="text-[10px] text-[#0F172A]">Monitoring this record · 94% confidence</div>
        </div>
        <span className="ml-auto h-2 w-2 rounded-full bg-[#0F172A] animate-pulse flex-shrink-0" />
      </div>
      {[
        { insight: "Verify all required documents before advancing", action: "Review Docs", priority: "High"   },
        { insight: "Budget utilisation approaching ceiling",         action: "Review Budget", priority: "Medium"},
        { insight: "Approval deadline approaching",                  action: "Escalate Now",  priority: "High"   },
      ].map((item, i) => (
        <div key={i} className={`p-3 border rounded-xl flex items-start gap-2 ${item.priority === "High" ? "border-red-100 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
          <Sparkles className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${item.priority === "High" ? "text-red-400" : "text-slate-500"}`} />
          <p className={`text-xs flex-1 ${item.priority === "High" ? "text-red-800" : "text-[#0F172A]"}`}>{item.insight}</p>
          <button onClick={() => act(item.action)} className="h-6 px-2 rounded-lg bg-black text-white text-[9px] font-medium hover:opacity-90 flex-shrink-0 whitespace-nowrap">{item.action}</button>
        </div>
      ))}
      <div className="flex gap-2">
        <input placeholder={`Ask AI about ${moduleLabel}…`} className="flex-1 h-8 px-3 text-xs border border-black/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200" />
        <button onClick={() => act("AI query sent")} className="h-8 px-3 bg-[#0F172A] text-white rounded-xl text-xs hover:bg-[#0F172A] flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Ask
        </button>
      </div>
    </div>
  );

  if (activeTab === "casefile") return <CaseFileTab record={record} />;

  if (activeTab === "docprocessor") return <DocProcessorTab record={record} moduleLabel={moduleLabel} />;

  return (
    <div className="p-4 flex flex-col items-center justify-center h-32 text-black/30">
      <FileText className="h-8 w-8 mb-2 opacity-40" />
      <span className="text-sm font-medium capitalize">{activeTab}</span>
    </div>
  );
}

// ─── 5. Action Panel ──────────────────────────────────────────────────────────
// Maps auth UserRole → workbench UserHierarchyRole
function resolveHierarchy(authRole: string): UserHierarchyRole {
  if (["cpo","permanent_secretary","procurement_director","executive_director"].includes(authRole))
    return "Authorizer";
  if (["adjudication_officer","board_member","regulator"].includes(authRole))
    return "Adjudicator";
  if (["auditor","anti_corruption_officer","public_auditor","regulator","compliance_officer"].includes(authRole))
    return "Oversight";
  if (["finance_officer","budget_officer","legal_officer","contract_officer","project_manager","contract_manager"].includes(authRole))
    return "Approver";
  // Initiators: procurement_officer, end_user, planning_officer, etc.
  return "Initiator";
}

// Allowed actions per hierarchy level
const ROLE_ACTIONS: Record<UserHierarchyRole, string[]> = {
  Initiator:   ["Save Draft", "Submit", "Request Clarification", "Hold", "Close"],
  Approver:    ["Approve", "Return for Correction", "Request Clarification", "Escalate", "Delegate"],
  Authorizer:  ["Approve", "Return for Correction", "Escalate", "Reject", "Delegate"],
  Adjudicator: ["Approve", "Reject", "Return for Correction"],
  Oversight:   [], // view-only
};

function ActionPanel({ record }: { record: WorkbenchRecord }) {
  const { user } = useAuth();
  const act = (msg: string) => pushNotification(msg, "success");

  // Resolve which hierarchy role the signed-in user has
  const effectiveRole: UserHierarchyRole = user
    ? resolveHierarchy(user.role)
    : record.userRole;

  const allowed = ROLE_ACTIONS[effectiveRole];
  const isOvernight = effectiveRole === "Oversight";

  const ALL_ACTIONS = [
    { label: "Save Draft",            icon: Save,        cls: "border border-black/10 text-black hover:bg-[#EAF1F8] appois-glow-on-hover",         fn: () => act("Draft saved — " + record.recordNumber)            },
    { label: "Submit",                icon: Send,        cls: "bg-black text-white hover:bg-black/90 appois-glow-white",                        fn: () => act("Submitted — " + record.recordNumber)              },
    { label: "Approve",               icon: CheckCircle2,cls: "bg-[#0F172A] text-white hover:bg-[#0F172A] appois-glow-on-hover",               fn: () => act("Approved — " + record.recordNumber)               },
    { label: "Return for Correction", icon: RotateCcw,   cls: "bg-[#0F172A] text-white hover:bg-[#0F172A] appois-glow-on-hover",                   fn: () => act("Returned for correction")                         },
    { label: "Reject",                icon: XCircle,     cls: "bg-red-600 text-white hover:bg-red-700 appois-glow-on-hover",                       fn: () => act("Rejected — " + record.recordNumber)               },
    { label: "Request Clarification", icon: HelpCircle,  cls: "border border-slate-200 text-[#0F172A] hover:bg-slate-50 appois-glow-on-hover",        fn: () => act("Clarification requested")                         },
    { label: "Escalate",              icon: ArrowUp,     cls: "border border-slate-200 text-[#0F172A] hover:bg-slate-50 appois-glow-on-hover",     fn: () => act("Escalated to higher authority")                   },
    { label: "Delegate",              icon: UserPlus,    cls: "border border-slate-200 text-[#0F172A] hover:bg-slate-50 appois-glow-on-hover",  fn: () => act("Delegated to another user")                       },
    { label: "Hold",                  icon: PauseCircle, cls: "border border-gray-200 text-gray-600 hover:bg-gray-50 appois-glow-on-hover",        fn: () => act("Process placed on hold")                          },
    { label: "Close",                 icon: X,           cls: "border border-black/10 text-black/50 hover:bg-[#EAF1F8]",      fn: () => act("Task closed")                                     },
  ];

  return (
    <div className="flex flex-col h-full border-l border-black/10 bg-white overflow-hidden">
      <div className="px-3 pt-3 pb-1 flex-shrink-0">
        <span className="text-[9px] font-bold text-black/55 uppercase tracking-wider">Actions</span>
      </div>

      {/* Role badge */}
      <div className="px-2 mb-1 flex-shrink-0">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-bold ${ROLE_COLORS[effectiveRole]}`}>
          <Shield className="h-3 w-3" />
          {effectiveRole}
        </div>
      </div>

      {isOvernight ? (
        <div className="px-3 py-3 text-[10px] text-black/50 leading-snug">
          <div className="flex items-center gap-1.5 mb-1 text-[#0F172A] font-semibold">
            <Eye className="h-3.5 w-3.5" /> View-Only Access
          </div>
          Your role ({user?.role ?? "Oversight"}) is limited to observation. No actions are permitted on this record.
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-2 pb-3 min-h-0 space-y-1">
          {ALL_ACTIONS.filter(a => allowed.includes(a.label)).map(a => (
            <button key={a.label} onClick={a.fn}
              className={`w-full flex items-center gap-2 px-2.5 py-2 text-xs font-medium transition-colors ${a.cls}`}
              style={{ borderRadius: 0 }}>
              <a.icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate text-left">{a.label}</span>
            </button>
          ))}
          {/* Show disabled/unavailable actions grayed out */}
          {ALL_ACTIONS.filter(a => !allowed.includes(a.label)).map(a => (
            <button key={a.label} disabled
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-black/20 cursor-not-allowed opacity-50"
              title={`Not permitted for ${effectiveRole}`}>
              <Lock className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate text-left">{a.label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex-shrink-0 mx-2 mb-2 p-2.5 bg-slate-50 border border-slate-200" style={{ borderRadius: 0 }}>
        <div className="flex items-center gap-1.5 mb-1">
          <div className="h-5 w-5 rounded-full ai-logo-gradient ai-logo-glow flex items-center justify-center">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span className="text-[10px] font-semibold text-[#0F172A]">AI Recommends</span>
        </div>
        <p className="text-[10px] text-[#0F172A] leading-snug">Complete all required fields and submit for approval to maintain stage timeline.</p>
      </div>
    </div>
  );
}

// ─── 6. Documents Panel ───────────────────────────────────────────────────────
const DOC_CATEGORY_META: { key: string; label: string; color: string }[] = [
  { key: "Minutes",              label: "Minutes",              color: "bg-slate-50 text-[#0F172A]"        },
  { key: "Resolutions",          label: "Resolutions",          color: "bg-slate-50 text-[#0F172A]"    },
  { key: "Compliance Checklist", label: "Compliance Checklist", color: "bg-slate-50 text-[#0F172A]"  },
  { key: "Attachments",          label: "Attachments",          color: "bg-slate-50 text-slate-600"      },
  { key: "Notices",              label: "Notices",              color: "bg-slate-50 text-[#0F172A]"      },
];

function DocumentsPanel() {
  const act = (msg: string) => pushNotification(msg, "success");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (cat: string) => setCollapsed(p => ({ ...p, [cat]: !p[cat] }));

  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-black/60">Case File Documents</span>
        <div className="flex gap-1">
          <button onClick={() => act("Document uploaded")} className="h-7 px-2.5 bg-black text-white rounded-lg text-[10px] flex items-center gap-1 hover:opacity-90">
            <Upload className="h-3 w-3" /> Upload
          </button>
          <button onClick={() => act("All documents downloaded")} className="h-7 px-2.5 border border-black/10 rounded-lg text-[10px] flex items-center gap-1 hover:bg-[#EAF1F8]">
            <Download className="h-3 w-3" /> All
          </button>
        </div>
      </div>

      {/* Category sections */}
      {DOC_CATEGORY_META.map(({ key, label, color }) => {
        const docs = MOCK_DOCUMENTS.filter(d => d.category === key);
        const isOpen = !collapsed[key];
        return (
          <div key={key} className="border border-black/8 rounded-xl overflow-hidden">
            {/* Section header */}
            <button
              onClick={() => toggle(key)}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#EAF1F8] transition-colors"
            >
              <div className="flex items-center gap-2">
                <ChevronDown className={`h-3 w-3 text-black/30 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                <span className="text-[11px] font-semibold text-black/70">{label}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>{docs.length}</span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); act(`Document added to ${label}`); }}
                className="h-5 w-5 rounded flex items-center justify-center bg-black/5 hover:bg-black hover:text-white transition-colors text-black/40"
              >
                <Plus className="h-3 w-3" />
              </button>
            </button>

            {/* Document rows */}
            {isOpen && (
              <div className="border-t border-black/5">
                {docs.length === 0 ? (
                  <div className="px-4 py-3 text-[10px] text-black/30 italic">No documents in this category yet.</div>
                ) : (
                  docs.map(doc => (
                    <div key={doc.name} className="flex items-center justify-between px-3 py-2 hover:bg-[#EAF1F8] group border-b border-black/5 last:border-b-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-3.5 w-3.5 text-black/25 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs text-black truncate">{doc.name}</div>
                          <div className="text-[10px] text-black/35">{doc.size} · {doc.uploaded}{doc.uploader ? ` · ${doc.uploader}` : ""}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <span className={`text-[9px] px-1 py-0.5 rounded font-semibold ${doc.status === "Final" || doc.status === "Approved" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{doc.status}</span>
                        <button onClick={() => act(`Viewing ${doc.name}`)} className="h-6 px-1.5 rounded bg-[#EAF1F8] text-[10px] hover:bg-black hover:text-white transition-colors"><Eye className="h-3 w-3" /></button>
                        <button onClick={() => act(`Downloaded ${doc.name}`)} className="h-6 px-1.5 rounded bg-[#EAF1F8] text-[10px] hover:bg-black hover:text-white transition-colors"><Download className="h-3 w-3" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── 7. Notes Panel ───────────────────────────────────────────────────────────
function NotesPanel() {
  const [note, setNote] = useState("");
  const act = (msg: string) => pushNotification(msg, "success");
  const typeColors = { internal:"bg-slate-50 text-[#0F172A] border-slate-200", comment:"bg-gray-100 text-gray-600 border-gray-200", alert:"bg-slate-50 text-[#0F172A] border-slate-200" };
  return (
    <div className="p-4 space-y-3">
      <div className="text-xs font-semibold text-black/60">Notes, Discussions & Communications</div>
      <div className="space-y-2">
        {MOCK_NOTES.map((n, i) => (
          <div key={i} className="p-3 border border-black/8 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-black text-white text-[9px] font-bold grid place-items-center flex-shrink-0">
                  {n.author.split(" ").map(x => x[0]).join("").slice(0, 2)}
                </div>
                <span className="text-xs font-semibold text-black">{n.author}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-semibold ${typeColors[n.type as keyof typeof typeColors]}`}>{n.type}</span>
              </div>
              <span className="text-[10px] text-black/30">{n.time}</span>
            </div>
            <p className="text-xs text-black/70 leading-relaxed pl-7">{n.text}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
          placeholder="Add an internal note or comment…"
          className="flex-1 px-3 py-2 text-xs border border-black/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-black/10" />
        <button onClick={() => { act("Note added"); setNote(""); }}
          className="h-9 px-3 bg-black text-white rounded-xl text-xs self-end hover:opacity-90">
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── 8. Audit Trail ───────────────────────────────────────────────────────────
function AuditTrailPanel() {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-black/60">Audit Trail & Activity History</span>
        <span className="text-[10px] text-black/40 bg-black/5 px-2 py-0.5 rounded-full">Nothing happens without appearing here</span>
      </div>
      <div className="space-y-2">
        {MOCK_AUDIT.map((a, i) => (
          <div key={i} className="flex gap-3 p-3 border border-black/8 rounded-xl">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="h-6 w-6 rounded-full bg-black/10 text-black/50 text-[9px] font-bold grid place-items-center">
                {a.user.split(" ").map(x => x[0]).join("").slice(0, 2)}
              </div>
              {i < MOCK_AUDIT.length - 1 && <div className="w-px flex-1 bg-black/8 mt-0.5" />}
            </div>
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-black">{a.user}</span>
                <span className="text-[10px] text-black/30 flex-shrink-0">{a.timestamp}</span>
              </div>
              <p className="text-xs text-black/70 mt-0.5">{a.action}</p>
              {a.reason && <p className="text-[11px] text-black/40 mt-0.5 italic">"{a.reason}"</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 9. Intelligence Panel ────────────────────────────────────────────────────
function IntelligencePanel() {
  const act = (msg: string) => pushNotification(msg, "info");
  return (
    <div className="p-4 space-y-3">
      <div className="text-xs font-semibold text-black/60">Intelligence & Compliance</div>
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Compliance Status</div>
        {[
          { label: "Required approvals",    met: true  },
          { label: "Missing documents",      met: true  },
          { label: "Procurement thresholds", met: true  },
          { label: "Declarations signed",    met: false },
        ].map(c => (
          <div key={c.label} className={`flex items-center justify-between p-2 rounded-lg border ${c.met ? "bg-slate-50 border-slate-200" : "bg-red-50 border-red-100"}`}>
            <span className={`text-xs ${c.met ? "text-[#0F172A]" : "text-red-700"}`}>{c.label}</span>
            <span className={`text-[10px] font-bold ${c.met ? "text-[#0F172A]" : "text-red-600"}`}>{c.met ? "✓ Met" : "✗ Missing"}</span>
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <div className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Risk Indicators</div>
        {[
          { label: "Budget utilisation 94%",    level: "Medium" },
          { label: "Deadline approaching",       level: "High"   },
        ].map(r => (
          <div key={r.label} className={`flex items-center justify-between p-2 rounded-lg border ${r.level === "High" ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-200"}`}>
            <span className={`text-xs ${r.level === "High" ? "text-red-700" : "text-[#0F172A]"}`}>{r.label}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.level === "High" ? "bg-red-200 text-red-700" : "bg-slate-200 text-[#0F172A]"}`}>{r.level}</span>
          </div>
        ))}
      </div>
      <div className="p-3 bg-black text-white rounded-xl">
        <div className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">SLA Monitor</div>
        <div className="text-sm font-bold">Remaining: 2 Days 4 Hours</div>
        <div className="w-full bg-white/20 rounded-full h-1.5 mt-1.5 overflow-hidden">
          <div className="bg-slate-400 h-full rounded-full" style={{ width: "78%" }} />
        </div>
      </div>
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="h-3.5 w-3.5 text-[#0F172A]" />
          <span className="text-[10px] font-bold text-[#0F172A]">Recommendation Engine</span>
        </div>
        <p className="text-xs text-[#0F172A]">Complete all required fields and submit for approval to keep the process on track.</p>
        <button onClick={() => act("AI recommendation applied")} className="mt-2 h-6 px-2.5 bg-[#0F172A] text-white text-[10px] rounded-lg font-medium hover:bg-[#0F172A] flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Apply
        </button>
      </div>
    </div>
  );
}

// ─── 11. Search Panel ─────────────────────────────────────────────────────────
function SearchPanel() {
  const [q, setQ]         = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate]     = useState("");
  const [category, setCategory] = useState("");

  type SearchResult = {
    ref: string; title: string; type: string; category: string;
    status: string; value: string; updated: string; ministry: string;
  };

  // Build a unified results list from all seed data
  const ALL_RECORDS: SearchResult[] = [
    ...SEED_PLANS.map(p => ({
      ref: p.planNumber, title: p.title, type: "Plan",
      category: p.procurementCategory, status: p.status,
      value: `USD ${p.estimatedBudget}`, updated: p.updatedAt, ministry: p.ministry,
    })),
    ...SEED_REQUISITIONS.map(r => ({
      ref: r.requisitionNumber, title: r.title, type: "Requisition",
      category: "Requisition", status: r.status,
      value: `USD ${r.totalEstimatedCost}`, updated: r.updatedAt, ministry: r.ministry,
    })),
    ...SEED_STRATEGIES.map(s => ({
      ref: s.strategyNumber, title: s.title, type: "Strategy",
      category: "Strategy", status: s.status,
      value: `USD ${s.estimatedBudget}`, updated: s.updatedAt, ministry: s.ministry,
    })),
    ...SEED_TENDER_PREPARATIONS.map(t => ({
      ref: t.tenderNumber, title: t.tenderTitle, type: "Tender",
      category: t.procurementCategory, status: t.approvalStatus,
      value: `USD ${t.budgetAllocation}`, updated: t.updatedAt, ministry: t.ministry,
    })),
  ];

  const results = ALL_RECORDS.filter(r => {
    const matchText = q === "" || r.title.toLowerCase().includes(q.toLowerCase()) ||
                      r.ref.toLowerCase().includes(q.toLowerCase()) ||
                      r.ministry.toLowerCase().includes(q.toLowerCase());
    const matchCat  = category === "" || r.category === category || r.type === category;
    const matchFrom = fromDate === "" || r.updated >= fromDate;
    const matchTo   = toDate === ""   || r.updated <= toDate;
    return matchText && matchCat && matchFrom && matchTo;
  });

  const hasFilters = q !== "" || category !== "" || fromDate !== "" || toDate !== "";

  const statusBadge = (s: string) => {
    if (["Approved", "Published", "Advertisement Active", "Approved"].includes(s))
      return "bg-slate-100 text-[#0F172A]";
    if (["Draft"].includes(s))
      return "bg-gray-100 text-gray-600";
    return "bg-slate-100 text-[#0F172A]";
  };

  return (
    <div className="p-4 space-y-3">
      <div className="text-xs font-semibold text-black/60">Search & Discovery</div>

      {/* Main search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search records, tenders, requisitions…"
          className="w-full h-9 pl-9 pr-3 rounded-xl border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10"
        />
        {q && (
          <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Date + category filters */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[9px] font-semibold text-black/40 uppercase tracking-wider mb-0.5">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="w-full h-7 px-2 text-[10px] border border-black/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/20"
          />
        </div>
        <div>
          <label className="block text-[9px] font-semibold text-black/40 uppercase tracking-wider mb-0.5">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="w-full h-7 px-2 text-[10px] border border-black/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/20"
          />
        </div>
      </div>
      <div>
        <label className="block text-[9px] font-semibold text-black/40 uppercase tracking-wider mb-0.5">Category / Type</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full h-7 px-2 text-[10px] border border-black/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-black/20 bg-white"
        >
          <option value="">All categories &amp; types</option>
          <optgroup label="Record Types">
            {["Plan", "Requisition", "Strategy", "Tender"].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </optgroup>
          <optgroup label="Procurement Categories">
            {PROCUREMENT_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => { setQ(""); setFromDate(""); setToDate(""); setCategory(""); }}
          className="flex items-center gap-1.5 text-[10px] text-black/50 hover:text-black"
        >
          <X className="h-3 w-3" /> Clear all filters
        </button>
      )}

      {/* Results */}
      {hasFilters && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-black/50">{results.length} result{results.length !== 1 ? "s" : ""}</span>
          </div>
          {results.length === 0 ? (
            <div className="p-4 text-center text-xs text-black/30">No records match your search</div>
          ) : (
            results.map((r, i) => (
              <div key={i} className="p-2.5 border border-black/8 rounded-xl hover:bg-[#EAF1F8] transition-colors cursor-pointer group">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-black/8 text-black/50">{r.type}</span>
                      <span className="text-[9px] font-mono text-black/40 truncate">{r.ref}</span>
                    </div>
                    <div className="text-xs font-semibold text-black leading-tight truncate">{r.title}</div>
                    <div className="text-[10px] text-black/40 mt-0.5 truncate">{r.ministry}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusBadge(r.status)}`}>{r.status}</span>
                    <span className="text-[10px] font-semibold text-black/60">{r.value}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-black/30">Updated {r.updated}</span>
                  {r.category && r.category !== r.type && (
                    <span className="text-[9px] text-black/40 bg-black/5 px-1.5 py-0.5 rounded">{r.category}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quick access when no search */}
      {!hasFilters && (
        <div className="flex gap-2 flex-wrap">
          {["Recent Records", "Saved Searches", "Advanced"].map(f => (
            <button key={f} className="h-7 px-3 border border-black/10 rounded-lg text-[10px] hover:bg-[#EAF1F8] flex items-center gap-1">
              <Filter className="h-3 w-3" /> {f}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 12. Knowledge Panel ──────────────────────────────────────────────────────
function KnowledgePanel() {
  const act = (msg: string) => pushNotification(msg, "info");
  const items = [
    { title: "PPDPA 2018 — Procurement Regulations",  type: "Law",       action: "View"     },
    { title: "Treasury Instructions — Financial Mgmt",type: "Policy",    action: "View"     },
    { title: "Evaluation Committee SOP",               type: "Procedure", action: "View"     },
    { title: "Standard Bidding Document — Goods",      type: "Template",  action: "Download" },
    { title: "Conflict of Interest Declaration Form",  type: "Template",  action: "Download" },
    { title: "Procurement Regulations FAQs 2026",      type: "FAQ",       action: "View"     },
  ];
  return (
    <div className="p-4 space-y-2">
      <div className="text-xs font-semibold text-black/60">Knowledge Centre — Policies, Procedures, Templates</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map(item => (
          <div key={item.title} className="flex items-center justify-between p-2.5 border border-black/8 rounded-xl hover:bg-[#EAF1F8] group">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="h-3.5 w-3.5 text-black/30 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs text-black truncate">{item.title}</div>
                <div className="text-[10px] text-black/40">{item.type}</div>
              </div>
            </div>
            <button onClick={() => act(`${item.title} opened`)} className="h-6 px-2 rounded-lg bg-[#EAF1F8] text-[10px] opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white transition-all flex-shrink-0">{item.action}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stage Modules panel ──────────────────────────────────────────────────────
function StageModulesPanel({ modules, currentModuleId }: {
  modules: WorkbenchModule["allModules"];
  currentModuleId: string;
}) {
  const list = modules ?? PROCUREMENT_MODULES ?? [];
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold">Workbench Modules</div>
        <a href="/lifecycle" className="text-[10px] text-black/40 hover:text-black underline">Full lifecycle →</a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {list.map(s => {
          const isCurrent = s.route.includes(currentModuleId);
          return (
            <a key={s.num} href={s.route}
              className={`block p-2.5 rounded-xl border transition-all hover:border-slate-200 hover:shadow-sm cursor-pointer
                ${isCurrent ? "border-slate-200 bg-[#0F172A] text-white" : s.status === "completed" ? "border-slate-200 bg-slate-50" : "border-black/8 bg-white hover:bg-[#F9F9F9]"}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0
                  ${isCurrent ? "bg-white text-[#0F172A]" : s.status === "completed" ? "bg-[#0F172A] text-white" : "bg-black/10 text-black/50"}`}>
                  {s.num}
                </div>
                <span className={`text-[10px] font-bold truncate ${isCurrent ? "text-white" : s.status === "completed" ? "text-[#0F172A]" : "text-black"}`}>
                  {s.label}
                </span>
              </div>
              <div className={`text-[9px] leading-tight ${isCurrent ? "text-white/70" : "text-black/40"}`}>{s.desc}</div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ─── Bottom section ───────────────────────────────────────────────────────────
function BottomSection({ tab, setTab, modules, currentModuleId }: {
  tab: BottomTab; setTab: (t: BottomTab) => void;
  modules?: WorkbenchModule["allModules"]; currentModuleId: string;
}) {
  const tabs = [
    { key: "stages"       as BottomTab, label: "📋 Modules"       },
    { key: "documents"    as BottomTab, label: "6. Documents"      },
    { key: "notes"        as BottomTab, label: "7. Communications" },
    { key: "audit"        as BottomTab, label: "8. Audit Trail"    },
    { key: "intelligence" as BottomTab, label: "9. Intelligence"   },
    { key: "search"       as BottomTab, label: "11. Search"        },
    { key: "knowledge"    as BottomTab, label: "12. Knowledge"     },
  ];
  return (
    <div className="flex flex-col h-full border-t border-black/10 bg-white overflow-hidden">
      <div className="flex overflow-x-auto border-b border-black/8 flex-shrink-0">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-[10px] font-semibold whitespace-nowrap border-b-2 transition-colors -mb-px flex-shrink-0
              ${tab === t.key ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {tab === "stages"       && <StageModulesPanel modules={modules} currentModuleId={currentModuleId} />}
        {tab === "documents"    && <DocumentsPanel />}
        {tab === "notes"        && <NotesPanel />}
        {tab === "audit"        && <AuditTrailPanel />}
        {tab === "intelligence" && <IntelligencePanel />}
        {tab === "search"       && <SearchPanel />}
        {tab === "knowledge"    && <KnowledgePanel />}
      </div>
    </div>
  );
}

// ─── Status Bar ───────────────────────────────────────────────────────────────
function StatusBar({ record }: { record: WorkbenchRecord }) {
  return (
    <div className="bg-white border-t border-black/10 px-4 py-1.5 flex items-center gap-4 text-[10px] text-black/50 flex-shrink-0">
      <div className="flex items-center gap-1">
        <div className={`h-1.5 w-1.5 rounded-full ${record.connectionStatus === "Online" ? "bg-[#0F172A]" : "bg-red-500"}`} />
        {record.connectionStatus}
      </div>
      <span>Last saved: {record.lastSaved}</span>
      <span>Status: <span className="text-black font-medium">{record.status}</span></span>
      <span>Stage: <span className="text-black font-medium">{record.currentStage}</span></span>
      <span>{record.version}</span>
      <span className="ml-auto">{record.userName} · {record.userLocation}</span>
    </div>
  );
}

// ─── Hierarchy Strip ──────────────────────────────────────────────────────────
function HierarchyStrip({ currentRole }: { currentRole: UserHierarchyRole }) {
  const ROLES: { key: UserHierarchyRole; label: string; short: string }[] = [
    { key: "Initiator",   label: "Initiator",   short: "1" },
    { key: "Approver",    label: "Approver",    short: "2" },
    { key: "Authorizer",  label: "Authorizer",  short: "3" },
    { key: "Adjudicator", label: "Adjudicator", short: "4" },
    { key: "Oversight",   label: "Oversight",   short: "5" },
  ];
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {ROLES.map((r, i) => (
        <div key={r.key} className="flex items-center gap-1">
          <div className="flex flex-col items-center">
            <div className={`h-5 w-5 rounded-full grid place-items-center text-[9px] font-bold transition-all
              ${currentRole === r.key ? ROLE_COLORS[r.key] : "bg-black/8 text-black/30"}`}>
              {r.short}
            </div>
            <span className={`text-[8px] mt-0.5 whitespace-nowrap ${currentRole === r.key ? "text-black font-bold" : "text-black/30"}`}>
              {r.label}
            </span>
          </div>
          {i < ROLES.length - 1 && <div className="w-4 h-px bg-black/10 mb-3 flex-shrink-0" />}
        </div>
      ))}
    </div>
  );
}

// ─── Mock workbench tender records for the filter panel ──────────────────────
type WbFilterRecord = {
  id: string; title: string; type: string; entity: string;
  value: string; status: string; stage: string;
  closing: string; // YYYY-MM-DD
};
const WORKBENCH_RECORDS: WbFilterRecord[] = [
  { id: "ZW-PRA-2026-00184", title: "Supply & Installation of Solar Mini-Grids — 12 Rural Clinics", type: "Tender",  entity: "Ministry of Energy",               value: "USD 14,800,000",     status: "Bidding",    stage: "Bid Submission",       closing: "2026-07-08" },
  { id: "ZW-PRA-2026-00183", title: "Procurement of Antiretroviral Medicines (2-Year Framework)",   type: "Tender",  entity: "Ministry of Health & Child Care",  value: "USD 42,500,000",     status: "Evaluation", stage: "Technical Evaluation", closing: "2026-06-12" },
  { id: "ZW-PRA-2026-00182", title: "National Tax Administration System — Phase II",                type: "Tender",  entity: "ZIMRA",                            value: "USD 9,200,000",      status: "Bidding",    stage: "Advertisement",        closing: "2026-07-21" },
  { id: "RFQ-2026-0892",     title: "Office Stationery — Q3 2026",                                 type: "RFQ",     entity: "Finance Department",               value: "USD 4,200",          status: "Evaluating", stage: "Admin Evaluation",     closing: "2026-06-28" },
  { id: "RFP-2026-0041",     title: "Provision of Legal Advisory Services — 3 Years",              type: "RFP",     entity: "Ministry of Justice",              value: "USD 2,400,000",      status: "Evaluation", stage: "Financial Evaluation", closing: "2026-06-30" },
  { id: "EOI-2026-0018",     title: "Expression of Interest — Water Treatment Consultancy",         type: "EOI",     entity: "Ministry of Water",                value: "Est. USD 800,000",   status: "Open",       stage: "EOI Advertisement",    closing: "2026-07-15" },
  { id: "AUC-2026-0007",     title: "Disposal of Surplus Government Vehicles (42 Units)",           type: "Auction", entity: "Ministry of Finance",              value: "Reserve: USD 420,000",status: "Bidding",   stage: "Live Auction",         closing: "2026-06-25" },
  { id: "ZW-PRA-2026-00181", title: "Rehabilitation of Beitbridge–Harare Highway (Section 4)",     type: "Tender",  entity: "Ministry of Transport",            value: "USD 88,000,000",     status: "Published",  stage: "Approval",             closing: "2026-08-04" },
];
const PROC_TYPES = ["All Types", "Tender", "RFQ", "RFP", "EOI", "Auction"];

// ─── Tender Filter+Search panel (shown when record button is clicked) ─────────
function TenderFilterPanel({
  onClose,
}: { onClose: () => void }) {
  const [search,   setSearch]   = useState("");
  const [typeF,    setTypeF]    = useState("All Types");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const filtered = WORKBENCH_RECORDS.filter(r => {
    const matchType  = typeF === "All Types" || r.type === typeF;
    const matchText  = search === "" || [r.title, r.id, r.entity].some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchFrom  = dateFrom === "" || r.closing >= dateFrom;
    const matchTo    = dateTo   === "" || r.closing <= dateTo;
    return matchType && matchText && matchFrom && matchTo;
  });

  const statusBadge = (s: string) => {
    if (s === "Approved" || s === "Evaluating") return "bg-slate-100 text-[#0F172A]";
    if (s === "Bidding"  || s === "Evaluation") return "bg-slate-100 text-[#0F172A]";
    if (s === "Open"     || s === "Published")  return "bg-slate-100 text-[#0F172A]";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="absolute right-0 top-full mt-1 z-50 w-[520px] bg-white border border-black/12 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/8 bg-[#F9F9F9]">
        <span className="text-xs font-bold text-black">Switch / Find Tender</span>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-black/8 transition-colors">
          <X className="h-3.5 w-3.5 text-black/40" />
        </button>
      </div>

      {/* Filter controls */}
      <div className="px-4 pt-3 pb-2 space-y-2">
        {/* Free-text search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, ref, entity…"
            className="w-full h-8 pl-8 pr-3 text-xs border border-black/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-300 bg-[#F9F9F9]"
            autoFocus
          />
        </div>
        {/* Type + date range in one row */}
        <div className="flex gap-2">
          <select
            value={typeF}
            onChange={e => setTypeF(e.target.value)}
            className="h-7 px-2 text-[11px] border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300 flex-shrink-0"
          >
            {PROC_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <div className="flex items-center gap-1 flex-1">
            <span className="text-[10px] text-black/40 flex-shrink-0">From</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="flex-1 h-7 px-2 text-[11px] border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300" />
            <span className="text-[10px] text-black/40 flex-shrink-0">To</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="flex-1 h-7 px-2 text-[11px] border border-black/10 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-300" />
            {(typeF !== "All Types" || dateFrom || dateTo || search) && (
              <button
                onClick={() => { setSearch(""); setTypeF("All Types"); setDateFrom(""); setDateTo(""); }}
                className="h-7 px-2 text-[10px] text-black/50 border border-black/10 rounded-lg hover:bg-[#EAF1F8] flex-shrink-0"
              >Clear</button>
            )}
          </div>
        </div>
      </div>

      {/* Results list */}
      <div className="max-h-72 overflow-y-auto px-3 pb-3 space-y-1">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-xs text-black/30">No records match</div>
        ) : filtered.map(r => (
          <button
            key={r.id}
            onClick={() => { pushNotification(`Switched to ${r.id}`, "success"); onClose(); }}
            className="w-full text-left p-2.5 border border-black/8 rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-colors group"
          >
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-[#0F172A]">{r.type}</span>
                  <span className="text-[9px] font-mono text-black/40 truncate">{r.id}</span>
                </div>
                <div className="text-xs font-semibold text-black leading-tight">{r.title}</div>
                <div className="text-[10px] text-black/40 truncate mt-0.5">{r.entity}</div>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${statusBadge(r.status)}`}>{r.status}</span>
                <span className="text-[10px] font-semibold text-black/60">{r.value}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-black/30">Closing {r.closing}</span>
              <span className="text-[9px] text-[#0F172A] opacity-0 group-hover:opacity-100 transition-opacity">Open →</span>
            </div>
          </button>
        ))}
      </div>
      <div className="px-4 py-2 border-t border-black/8 bg-[#F9F9F9] flex items-center justify-between">
        <span className="text-[10px] text-black/40">{filtered.length} of {WORKBENCH_RECORDS.length} records</span>
        <span className="text-[10px] text-black/30">Click to open</span>
      </div>
    </div>
  );
}

// ─── Props for the main exported component ────────────────────────────────────
export type EnterpriseWorkbenchProps = {
  module: WorkbenchModule;
  /** Optional override record; defaults to a generated demo record */
  record?: WorkbenchRecord;
  /** Optional custom content for the Main Work Area form tab */
  children?: ReactNode;
  /** Show vendor-portal modules in bottom panel instead of procurement modules */
  isVendorPortal?: boolean;
  /** Override the page title */
  title?: string;
  /** Override the page subtitle */
  subtitle?: string;
};

/** Build a default WorkbenchRecord from a ministry context */
export function buildDefaultRecord(ministryName: string, deptName: string, moduleLabel: string): WorkbenchRecord {
  const ministryCodes: Record<string, string> = {
    "Ministry of Finance and Investment Promotion": "MOF",
    "Ministry of Health and Child Care": "MOH",
    "Ministry of Primary and Secondary Education": "MOPSE",
    "Ministry of Higher and Tertiary Education": "MOHTE",
    "Ministry of Transport and Infrastructural Development": "MOT",
    "Ministry of Agriculture, Mechanisation and Irrigation Development": "MOAM",
    "Ministry of Lands, Agriculture, Water and Rural Resettlement": "MOLAWR",
    "Ministry of Mines and Mining Development": "MOMMD",
    "Ministry of Energy and Power Development": "MOEPD",
    "Ministry of Environment, Climate and Tourism": "MOECT",
    "Ministry of Home Affairs and Cultural Heritage": "MOHACH",
    "Ministry of Defence and War Veterans": "MODWV",
    "Ministry of Foreign Affairs and International Trade": "MOFAIT",
    "Ministry of Justice, Legal and Parliamentary Affairs": "MOJLPA",
  };
  const code = ministryCodes[ministryName] ?? "ZW";
  const year = "2026/2027";
  const random = Math.floor(Math.random() * 900) + 100;
  return {
    recordNumber:       `TND-2026-${random}`,
    referenceNumber:    `ZW-PRA-2026-${String(random * 7).padStart(5,"0")}`,
    title:              `${moduleLabel} — ${deptName}`,
    ministry:           ministryName,
    department:         deptName,
    financialYear:      year,
    budgetCode:         `BC-${code}-${year.slice(0,4)}-${String(random).padStart(4,"0")}`,
    procurementType:    "Tender",
    currentStage:       moduleLabel,
    status:             "Pending",
    priority:           "High",
    dueDate:            "2026-07-31",
    ageOnStage:         "1 day",
    owner:              "D. Moyo",
    organization:       ministryName,
    percentageComplete: 35,
    userRole:           "Initiator",
    userName:           "D. Moyo",
    userJobTitle:       "Senior Procurement Officer",
    userLocation:       "Harare HQ",
    lastSaved:          "2026-06-26 09:00",
    connectionStatus:   "Online",
    version:            "v1.0",
    value:              "USD 1,250,000",
  };
}

// ─── EnterpriseWorkbench — main exported component ───────────────────────────
// ─── 4 Focal Areas ───────────────────────────────────────────────────────────
type FocalArea = "form" | "visuals" | "tables" | "documents";

const FOCAL_TABS: { key: FocalArea; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "form",      label: "Form",      icon: FileText,  desc: "Stage work form · Multi-step data capture" },
  { key: "visuals",   label: "Visuals",   icon: BarChart3, desc: "Charts · KPIs · Analytics for this record" },
  { key: "tables",    label: "Tables",    icon: DollarSign,desc: "Data grids · Financials · Evaluation tables" },
  { key: "documents", label: "Documents", icon: FolderOpen,desc: "Doc viewer · Board pack · Generated documents" },
];

// ─── Visuals focal area — record KPIs and analytics ──────────────────────────
function VisualsArea({ record }: { record: WorkbenchRecord }) {
  const { stages, currentIndex } = getStages(record);
  const pct = stages.length > 1 ? Math.round((currentIndex / (stages.length - 1)) * 100) : 0;
  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-[#f4f7fb]">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Completion",       value: `${record.percentageComplete}%`, color: "#0F172A" },
          { label: "Stage",            value: record.currentStage,             color: "#475569" },
          { label: "Value",            value: record.value,                    color: "#64748B" },
          { label: "Priority",         value: record.priority,                 color: record.priority === "High" ? "#DC2626" : record.priority === "Medium" ? "#64748B" : "#475569" },
        ].map(k => (
          <div key={k.label} className="bg-white border border-black/8 rounded-xl p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-black/40 mb-1">{k.label}</div>
            <div className="text-xl font-black" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>
      {/* Progress bar card */}
      <div className="bg-white border border-black/8 rounded-xl p-4">
        <div className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-3">Lifecycle Progress — {record.currentStage}</div>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-black/8 rounded-full h-3 overflow-hidden">
            <div className="h-full rounded-full bg-[#0F172A] transition-all" style={{ width: `${record.percentageComplete}%` }} />
          </div>
          <span className="text-sm font-black text-[#0F172A] flex-shrink-0">{record.percentageComplete}%</span>
        </div>
        {/* Stage pills */}
        <div className="flex flex-wrap gap-1.5">
          {stages.map((s, i) => (
            <span key={i} className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
              i < currentIndex ? "bg-slate-100 text-[#0F172A]" :
              i === currentIndex ? "bg-[#0F172A] text-white" :
              "bg-black/5 text-black/40"
            }`}>{s}</span>
          ))}
        </div>
      </div>
      {/* Record metadata grid */}
      <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
        <div className="bg-[#0f172a] text-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest">Record Intelligence</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
          {[
            { label: "Record No.",      value: record.recordNumber       },
            { label: "Reference",       value: record.referenceNumber    },
            { label: "Type",            value: record.procurementType    },
            { label: "Ministry",        value: record.ministry           },
            { label: "Department",      value: record.department         },
            { label: "Financial Year",  value: record.financialYear      },
            { label: "Budget Code",     value: record.budgetCode         },
            { label: "Owner",           value: record.owner              },
            { label: "Due Date",        value: record.dueDate            },
          ].map((f, i) => (
            <div key={f.label} className={`px-4 py-3 border-b border-r border-black/5 ${i % 3 === 2 ? "border-r-0" : ""}`}>
              <div className="text-[9px] font-bold uppercase tracking-wide text-black/40 mb-0.5">{f.label}</div>
              <div className="text-xs font-semibold text-black">{f.value}</div>
            </div>
          ))}
        </div>
      </div>
      {/* AI insights */}
      <div className="bg-[#0f172a] rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">AI Intelligence</span>
          <span className="ml-auto h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
        </div>
        <div className="space-y-2">
          {[
            { text: `Stage "${record.currentStage}" is ${record.percentageComplete}% complete. Priority: ${record.priority}.`, tone: "blue" },
            { text: `Budget code ${record.budgetCode} confirmed. Value: ${record.value}.`, tone: "green" },
            { text: `Due ${record.dueDate} — Age on stage: ${record.ageOnStage}. Monitor closely.`, tone: "amber" },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`text-[9px] font-black flex-shrink-0 mt-0.5 ${a.tone === "blue" ? "text-slate-400" : a.tone === "green" ? "text-slate-500" : "text-slate-500"}`}>●</span>
              <p className="text-[11px] text-white/70 leading-relaxed">{a.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tables focal area — evaluation grid / financials ─────────────────────────
function TablesArea({ record }: { record: WorkbenchRecord }) {
  return (
    <div className="h-full overflow-auto">
      {/* Gov header */}
      <div className="bg-[#0f172a] text-white px-6 py-4 text-center flex-shrink-0">
        <div className="text-sm font-black uppercase tracking-[0.15em]">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</div>
        <div className="text-xs text-slate-400 mt-0.5 font-semibold">{record.ministry}</div>
        <div className="text-[11px] text-white/60 mt-1 uppercase tracking-widest">
          {record.currentStage.toUpperCase()} — FINANCIAL YEAR {record.financialYear}
        </div>
      </div>
      {/* Evaluation / data table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#1a6b3a] text-white">
              {["#", "Item / Line", "Description", "Qty", "Unit Price (USD)", "Total (USD)", "Budget Code", "Status"].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-bold uppercase tracking-wider border-r border-slate-200 last:border-r-0 text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { item: `${record.currentStage} — Line A`,  desc: "Primary procurement line item",    qty: "100", unit: "1,250.00",   total: "125,000.00",   code: record.budgetCode, status: "Approved"  },
              { item: `${record.currentStage} — Line B`,  desc: "Secondary procurement line item",  qty: "50",  unit: "2,400.00",   total: "120,000.00",   code: record.budgetCode, status: "Approved"  },
              { item: "Delivery & Installation",           desc: "5% of contract value",             qty: "1",   unit: "12,250.00",  total: "12,250.00",    code: record.budgetCode, status: "Pending"   },
              { item: "Contingency (3%)",                  desc: "Risk contingency allocation",      qty: "1",   unit: "7,722.00",   total: "7,722.00",     code: record.budgetCode, status: "Pending"   },
              { item: "Performance Bond",                  desc: "10% of contract value",            qty: "1",   unit: "25,722.00",  total: "25,722.00",    code: record.budgetCode, status: "Withheld"  },
            ].map((row, i) => (
              <tr key={i} className={`border-b border-gray-100 hover:bg-slate-50/30 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td className="px-3 py-2 text-gray-400 font-mono border-r border-gray-100">{i + 1}</td>
                <td className="px-3 py-2 font-semibold text-gray-800 border-r border-gray-100">{row.item}</td>
                <td className="px-3 py-2 text-gray-600 border-r border-gray-100">{row.desc}</td>
                <td className="px-3 py-2 text-right font-mono text-gray-700 border-r border-gray-100">{row.qty}</td>
                <td className="px-3 py-2 text-right font-mono text-gray-700 border-r border-gray-100">{row.unit}</td>
                <td className="px-3 py-2 text-right font-mono font-bold text-gray-800 border-r border-gray-100">{row.total}</td>
                <td className="px-3 py-2 font-mono text-[10px] text-gray-500 border-r border-gray-100">{row.code}</td>
                <td className="px-3 py-2">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    row.status === "Approved" ? "bg-slate-100 text-[#0F172A]" :
                    row.status === "Pending"  ? "bg-slate-100 text-[#0F172A]" :
                    "bg-gray-100 text-gray-600"
                  }`}>{row.status}</span>
                </td>
              </tr>
            ))}
            {/* Total row */}
            <tr className="bg-slate-50 border-t-2 border-gray-300">
              <td colSpan={5} className="px-3 py-2.5 text-right font-black text-[11px] uppercase tracking-wide text-[#0F172A] border-r border-gray-200">TOTAL CONTRACT VALUE</td>
              <td className="px-3 py-2.5 text-right font-black text-sm text-[#0F172A] border-r border-gray-200">290,694.00</td>
              <td colSpan={2} className="px-3 py-2.5 text-[10px] text-gray-400">{record.financialYear}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Approval chain table */}
      <div className="overflow-x-auto border-t border-gray-200">
        <div className="bg-[#0f172a] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Approval Register</div>
        <table className="w-full text-xs border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#1a6b3a] text-white">
              {["Stage", "Approver", "Role", "Date", "Status", "Comment"].map(h => (
                <th key={h} className="px-3 py-2 text-left font-bold uppercase tracking-wider border-r border-slate-200 last:border-r-0 text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_APPROVALS.map((a, i) => (
              <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <td className="px-3 py-2 font-semibold border-r border-gray-100">{a.stageLabel} — {a.stage}</td>
                <td className="px-3 py-2 border-r border-gray-100">{a.approver}</td>
                <td className="px-3 py-2 text-gray-500 border-r border-gray-100">{a.role}</td>
                <td className="px-3 py-2 font-mono text-gray-500 border-r border-gray-100">{a.time === "—" ? "—" : a.time.split(" ")[0]}</td>
                <td className="px-3 py-2 border-r border-gray-100">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    a.status === "Approved" ? "bg-slate-100 text-[#0F172A]" :
                    a.status === "Pending"  ? "bg-slate-100 text-[#0F172A]" :
                    "bg-gray-100 text-gray-500"
                  }`}>{a.status}</span>
                </td>
                <td className="px-3 py-2 text-gray-400 italic text-[10px]">{a.comment || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Documents focal area — doc viewer + board pack ───────────────────────────
function DocumentsArea({ record, moduleLabel }: { record: WorkbenchRecord; moduleLabel: string }) {
  return (
    <div className="h-full overflow-hidden">
      <DocProcessorTab record={record} moduleLabel={moduleLabel} />
    </div>
  );
}

export default function EnterpriseWorkbench({
  module, record, children, isVendorPortal = false, title, subtitle,
}: EnterpriseWorkbenchProps) {
  const [focalArea,   setFocalArea]   = useState<FocalArea>("form");
  const [showRecords, setShowRecords] = useState(false);

  // Use the first ZW ministry as default if no record provided
  const defaultMinistry = ZW_MINISTRIES[1]; // MoH
  const defaultDept     = defaultMinistry.departments[0];
  const activeRecord    = record ?? buildDefaultRecord(
    defaultMinistry.name, defaultDept.name, module.label
  );

  const { stages, currentIndex } = getStages(activeRecord);

  return (
    <AppShell>

      {/* ── 1. Gov top bar ───────────────────────────────────────────────── */}
      <div className="bg-[#0f172a] border-b border-slate-200/50 px-4 py-1.5 flex-shrink-0">
        <div className="text-center text-[9px] text-slate-400 font-semibold uppercase tracking-widest">
          GOVERNMENT OF THE REPUBLIC OF ZIMBABWE
        </div>
        <div className="text-center text-[10px] text-white font-bold uppercase tracking-wide leading-tight mt-0.5">
          AI-POWERED ELECTRONIC PUBLIC PROCUREMENT &amp; OVERSIGHT INTELLIGENCE MANAGEMENT SYSTEM
        </div>
        <div className="flex items-center justify-between text-[9px] text-slate-400/70 mt-0.5 flex-wrap gap-1">
          <span>{activeRecord.ministry}</span>
          <span>·</span>
          <span>{activeRecord.department}</span>
          <span>·</span>
          <span>FY {activeRecord.financialYear}</span>
          <span>·</span>
          <span>{new Date().toLocaleDateString("en-GB")}</span>
          <span>·</span>
          <span>{new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>

      {/* ── 2. Page header bar ───────────────────────────────────────────── */}
      <div className="bg-white border-b border-black/10 px-4 py-2 flex items-center gap-3 flex-shrink-0 relative">
        <div className="min-w-0 flex-1">
          <h1 className="text-sm font-bold text-black leading-tight">
            {title ?? `E-Procurement — ${module.label}`}
          </h1>
          <p className="text-[10px] text-black/40">
            {subtitle ?? `${activeRecord.ministry} · ${activeRecord.department} · ${module.label}`}
          </p>
        </div>
        <div className="h-7 w-7 rounded-full ai-logo-gradient ai-logo-glow flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="hidden lg:flex items-center px-3 py-1 bg-[#EAF1F8] rounded-lg flex-shrink-0">
          <HierarchyStrip currentRole={activeRecord.userRole} />
        </div>
        {/* Switch tender */}
        <div className="flex items-center gap-2 flex-shrink-0 relative">
          <button
            onClick={() => setShowRecords(v => !v)}
            className={`h-8 px-3 border text-xs flex items-center gap-1.5 transition-colors appois-glow-on-hover ${showRecords ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-black/10 hover:bg-[#EAF1F8]"}`}
            style={{ borderRadius: 0 }}>
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{activeRecord.recordNumber}</span>
            <span className="sm:hidden">Switch</span>
            <ChevronRight className={`h-3 w-3 transition-transform ${showRecords ? "rotate-90" : ""}`} />
          </button>
          {showRecords && <TenderFilterPanel onClose={() => setShowRecords(false)} />}
        </div>
      </div>

      {/* ── 3. Context header ────────────────────────────────────────────── */}
      <ContextHeader record={activeRecord} />

      {/* ── 4. Workflow stepper ──────────────────────────────────────────── */}
      <WorkflowTracker stages={stages} currentIndex={currentIndex} />

      {/* ── 5. Four focal area tab bar ────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-white border-b border-black/10 flex items-stretch">
        {FOCAL_TABS.map(tab => {
          const Icon    = tab.icon;
          const active  = focalArea === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFocalArea(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-colors flex-shrink-0
                ${active
                  ? "border-[#0f172a] text-[#0f172a] bg-white"
                  : "border-transparent text-black/40 hover:text-black hover:bg-gray-50"}`}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="uppercase tracking-wide">{tab.label}</span>
            </button>
          );
        })}

        {/* Workflow actions — right-aligned in the same bar */}
        <div className="ml-auto flex items-center gap-1 px-3">
          {(["Save Draft","Approve","Return","Escalate"] as const).map(action => {
            const cls =
              action === "Approve"   ? "bg-[#0F172A] text-white hover:bg-[#0F172A]" :
              action === "Return"    ? "bg-[#0F172A] text-white hover:bg-[#0F172A]" :
              action === "Escalate"  ? "bg-red-600 text-white hover:bg-red-700" :
              "border border-black/10 text-black/60 hover:bg-gray-50";
            return (
              <button
                key={action}
                onClick={() => pushNotification(`${action} — ${activeRecord.recordNumber}`, "success")}
                className={`h-7 px-3 text-[10px] font-bold rounded flex items-center gap-1 transition-colors ${cls}`}
              >
                {action === "Save Draft" && <Save className="h-3 w-3" />}
                {action === "Approve"    && <CheckCircle2 className="h-3 w-3" />}
                {action === "Return"     && <RotateCcw className="h-3 w-3" />}
                {action === "Escalate"   && <ArrowUp className="h-3 w-3" />}
                <span className="hidden sm:inline">{action}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 6. Focal area content ─────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">

        {/* FORM — stage work form, stepper, document preview */}
        {focalArea === "form" && (
          <div className="h-full overflow-y-auto bg-[#f4f7fb]">
            <MainWorkArea
              activeTab="overview"
              record={activeRecord}
              moduleLabel={module.label}
            >
              {children}
            </MainWorkArea>
          </div>
        )}

        {/* VISUALS — KPIs, lifecycle progress, record intelligence */}
        {focalArea === "visuals" && (
          <VisualsArea record={activeRecord} />
        )}

        {/* TABLES — financial grid, approval register */}
        {focalArea === "tables" && (
          <TablesArea record={activeRecord} />
        )}

        {/* DOCUMENTS — MS Word viewer, board pack, doc processor */}
        {focalArea === "documents" && (
          <DocumentsArea record={activeRecord} moduleLabel={module.label} />
        )}

      </div>

      {/* ── 7. Status bar ────────────────────────────────────────────────── */}
      <StatusBar record={activeRecord} />

    </AppShell>
  );
}


