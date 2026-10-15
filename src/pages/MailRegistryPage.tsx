/**
 * MailRegistryPage — Corporate Mail Registry
 * Gmail-style inbox with 5 folder types.
 * Each mail item tracks: source, subject, allocation, action status,
 * approval status, received date, and age (days since receipt).
 */
import { useState, useRef } from "react";
import { AppShell , PageContextBar } from "@/components/AppShell";
import {
  Mail, Inbox, Send, FileText, Users, Globe, Paperclip,
  Search, Plus, Filter, Download, Printer, ChevronRight,
  X, CheckCircle, AlertCircle, Clock, RefreshCcw, Archive,
  Eye, MessageSquare, Star, StarOff, ArrowLeft, Upload,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────
type FolderType = "External Mail" | "External Emails" | "Internal Memo" | "Internal Circular" | "Internal Mail";
type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Escalated" | "Returned";
type ActionStatus = "Not Actioned" | "Actioned";
type Priority = "High" | "Medium" | "Low";

interface MailItem {
  id: string;
  folder: FolderType;
  subject: string;
  senderOrg: string;
  senderName: string;
  allocatedTo: string;
  department: string;
  receivedDate: string;
  actionDate?: string;
  priority: Priority;
  approvalStatus: ApprovalStatus;
  actionStatus: ActionStatus;
  body: string;
  starred: boolean;
  attachments: { name: string; size: string }[];
}

// ── Age helper ────────────────────────────────────────────────────────────
function ageLabel(receivedDate: string, actionDate?: string): { days: number; label: string; color: string } {
  const from = new Date(receivedDate);
  const to = actionDate ? new Date(actionDate) : new Date();
  const days = Math.max(0, Math.floor((to.getTime() - from.getTime()) / 86400000));
  const label = days === 0 ? "Today" : days === 1 ? "1 day" : `${days} days`;
  const color = days <= 2 ? "text-[#0F172A]" : days <= 5 ? "text-[#0F172A]" : "text-red-600";
  return { days, label, color };
}

// ── Mock data ─────────────────────────────────────────────────────────────
const SEED: MailItem[] = [
  {
    id: "MR-2026-001", folder: "External Mail",
    subject: "Request for Information — Procurement of Medical Equipment",
    senderOrg: "World Health Organisation (AFRO)",
    senderName: "Dr. A. Kamara",
    allocatedTo: "Director — Procurement & Supply", department: "Ministry of Health",
    receivedDate: "2026-07-01", actionDate: "2026-07-03",
    priority: "High", approvalStatus: "Approved", actionStatus: "Actioned",
    body: "Dear Minister,\n\nThe WHO AFRO Regional Office requests information on the current procurement status of essential medical equipment under the 2026–2027 national health programme.\n\nKindly provide a status update at your earliest convenience.\n\nYours faithfully,\nDr. A. Kamara\nWHO AFRO",
    starred: true, attachments: [{ name: "RFI-WHO-2026-MED.pdf", size: "312 KB" }],
  },
  {
    id: "MR-2026-002", folder: "External Mail",
    subject: "Contractor Complaint — Highway Rehabilitation Lot 3 Award",
    senderOrg: "Granite Construction (Pvt) Ltd",
    senderName: "CEO — J. Moyo",
    allocatedTo: "Procurement Manager", department: "Roads Authority",
    receivedDate: "2026-07-02",
    priority: "High", approvalStatus: "Pending", actionStatus: "Not Actioned",
    body: "We write to formally register our objection to the award of the Highway Rehabilitation Lot 3 contract. We believe the evaluation process was compromised and request an immediate review.",
    starred: false, attachments: [{ name: "Complaint-HC-Lot3.pdf", size: "890 KB" }, { name: "Evidence-Annex-A.pdf", size: "1.2 MB" }],
  },
  {
    id: "MR-2026-003", folder: "External Emails",
    subject: "ARV Stock Shortage — Urgent Intervention Required",
    senderOrg: "Clinton Health Access Initiative (CHAI)",
    senderName: "M. Patel — Country Director",
    allocatedTo: "Chief Pharmacist", department: "Ministry of Health",
    receivedDate: "2026-07-03",
    priority: "High", approvalStatus: "Escalated", actionStatus: "Not Actioned",
    body: "Subject: URGENT — ARV stock levels critically low\n\nDear PS,\n\nCHAI has been monitoring ARV stock levels in Zimbabwe. We note with grave concern that TDF/3TC and EFV stocks will be depleted within 21 days. We urge immediate action.",
    starred: true, attachments: [],
  },
  {
    id: "MR-2026-004", folder: "External Emails",
    subject: "RE: Solar Mini-Grid Tender — Request for Bid Document Clarification",
    senderOrg: "SunPower Africa Ltd",
    senderName: "Procurement Team",
    allocatedTo: "Tender Officer", department: "Ministry of Energy",
    receivedDate: "2026-07-01", actionDate: "2026-07-02",
    priority: "Medium", approvalStatus: "Approved", actionStatus: "Actioned",
    body: "Please clarify the technical specification for grid connection requirements as detailed in Section 4.2 of the bidding document.",
    starred: false, attachments: [{ name: "Clarification-Request.docx", size: "78 KB" }],
  },
  {
    id: "MR-2026-005", folder: "Internal Memo",
    subject: "MEMO: Q3 Budget Submission Deadline — All Departments",
    senderOrg: "Ministry of Finance & Economic Development",
    senderName: "Secretary for Finance",
    allocatedTo: "All Heads of Department", department: "All Ministries",
    receivedDate: "2026-07-02",
    priority: "High", approvalStatus: "Pending", actionStatus: "Not Actioned",
    body: "TO: All Heads of Department\nFROM: Secretary for Finance\nRE: Q3 Budget Submission\n\nAll ministries are hereby advised that Q3 budget submissions are due by 15 July 2026. Non-compliance will result in budget freeze.",
    starred: true, attachments: [{ name: "Q3-Budget-Template.xlsx", size: "445 KB" }],
  },
  {
    id: "MR-2026-006", folder: "Internal Memo",
    subject: "MEMO: Ghost Vendor Investigation — Immediate Action Required",
    senderOrg: "Office of the Comptroller & Auditor General",
    senderName: "CAG — P. Murambadoro",
    allocatedTo: "Accounting Officer", department: "Ministry of Transport",
    receivedDate: "2026-07-03",
    priority: "High", approvalStatus: "Pending", actionStatus: "Not Actioned",
    body: "This memo advises of an active investigation into ghost vendor payments linked to VEN-00476 and VEN-00481. All payments to these vendors must be suspended pending investigation. Please acknowledge receipt within 24 hours.",
    starred: false, attachments: [],
  },
  {
    id: "MR-2026-007", folder: "Internal Circular",
    subject: "CIRCULAR: New Procurement Approval Thresholds — Effective 1 August 2026",
    senderOrg: "Procurement Regulatory Authority of Zimbabwe (PRAZ)",
    senderName: "Director General — PRAZ",
    allocatedTo: "All Procurement Officers", department: "All Government Entities",
    receivedDate: "2026-07-01",
    priority: "Medium", approvalStatus: "Approved", actionStatus: "Actioned",
    body: "This circular notifies all procuring entities of revised approval thresholds effective 1 August 2026 as gazetted under Statutory Instrument 45 of 2026. Please ensure compliance and update internal SoPs accordingly.",
    starred: false, attachments: [{ name: "SI-45-2026-Thresholds.pdf", size: "220 KB" }, { name: "New-SOP-Template.docx", size: "156 KB" }],
  },
  {
    id: "MR-2026-008", folder: "Internal Circular",
    subject: "CIRCULAR: PRAZ Registration Renewal Reminder — June 2026",
    senderOrg: "PRAZ",
    senderName: "Registrar",
    allocatedTo: "All Procuring Entities", department: "All",
    receivedDate: "2026-06-28", actionDate: "2026-06-30",
    priority: "Low", approvalStatus: "Approved", actionStatus: "Actioned",
    body: "All procuring entities are reminded to renew their PRAZ registration certificates before 30 June 2026. Entities operating without valid registration will be subject to penalties.",
    starred: false, attachments: [],
  },
  {
    id: "MR-2026-009", folder: "Internal Mail",
    subject: "Request for Approval — Direct Procurement: Emergency ARV Medicines",
    senderOrg: "Ministry of Health & Child Care",
    senderName: "Acting PS — Dr. T. Nkosi",
    allocatedTo: "Minister of Health", department: "Ministry of Health",
    receivedDate: "2026-07-03",
    priority: "High", approvalStatus: "Pending", actionStatus: "Not Actioned",
    body: "Minister,\n\nPursuant to PPDPA Section 32, we request your approval for emergency direct procurement of ARV medicines (USD 3.2M) to address the critical stock shortage. Supporting briefing note attached.",
    starred: true, attachments: [{ name: "Emergency-Procurement-Brief.pdf", size: "512 KB" }, { name: "Stock-Levels-Report.xlsx", size: "340 KB" }],
  },
  {
    id: "MR-2026-010", folder: "Internal Mail",
    subject: "Tender Award Recommendation — Solar Mini-Grid, Binga District",
    senderOrg: "Ministry of Energy & Power Development",
    senderName: "Director Renewable Energy",
    allocatedTo: "Minister of Energy", department: "Ministry of Energy",
    receivedDate: "2026-07-02",
    priority: "High", approvalStatus: "Returned", actionStatus: "Not Actioned",
    body: "Minister,\n\nThe evaluation committee has completed its assessment for the Binga Solar Mini-Grid tender (ZW-PRA-2026-00184). We recommend award to BrightSolar Ltd at USD 4.78M. Kindly sign the award recommendation attached.",
    starred: false, attachments: [{ name: "Award-Recommendation-Signed.pdf", size: "670 KB" }],
  },
];

// ── Status style maps ─────────────────────────────────────────────────────
const APPROVAL_STYLE: Record<ApprovalStatus, string> = {
  Pending:   "bg-slate-100 text-[#0F172A] border-slate-200",
  Approved:  "bg-slate-100 text-[#0F172A] border-slate-200",
  Rejected:  "bg-red-100 text-red-700 border-red-200",
  Escalated: "bg-slate-100 text-[#0F172A] border-slate-200",
  Returned:  "bg-slate-100 text-[#0F172A] border-slate-200",
};

const ACTION_STYLE: Record<ActionStatus, string> = {
  "Not Actioned": "bg-gray-100 text-gray-600",
  "Actioned":     "bg-slate-100 text-[#0F172A]",
};

const PRIORITY_DOT: Record<Priority, string> = {
  High: "bg-red-500", Medium: "bg-[#0F172A]", Low: "bg-[#0F172A]",
};

const FOLDER_META: Record<FolderType, { icon: React.ElementType; color: string; bg: string }> = {
  "External Mail":     { icon: Globe,       color: "text-[#0F172A]",   bg: "bg-slate-50"   },
  "External Emails":   { icon: Mail,        color: "text-[#0F172A]", bg: "bg-slate-50" },
  "Internal Memo":     { icon: FileText,    color: "text-[#0F172A]",  bg: "bg-slate-50"  },
  "Internal Circular": { icon: Users,       color: "text-slate-500",   bg: "bg-slate-50"   },
  "Internal Mail":     { icon: Inbox,       color: "text-[#0F172A]",bg: "bg-slate-50"},
};

const ALL_FOLDERS: FolderType[] = ["External Mail", "External Emails", "Internal Memo", "Internal Circular", "Internal Mail"];

// ── Compose Modal ─────────────────────────────────────────────────────────
function ComposeModal({ onClose, onSend }: { onClose: () => void; onSend: (m: MailItem) => void }) {
  const [form, setForm] = useState({ folder: "Internal Mail" as FolderType, subject: "", senderOrg: "", senderName: "", allocatedTo: "", department: "", priority: "Medium" as Priority, body: "" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const handleSend = () => {
    if (!form.subject || !form.senderOrg) return;
    const now = new Date().toISOString().split("T")[0];
    const id = `MR-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    onSend({ id, ...form, receivedDate: now, approvalStatus: "Pending", actionStatus: "Not Actioned", starred: false, attachments: [] });
    onClose();
  };
  const inp = "w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20";
  const lb = (t: string) => <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{t}</label>;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-900">Register New Mail</span>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-gray-100"><X className="h-4 w-4"/></button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          <div className="col-span-2">{lb("Folder / Mail Type")}
            <select value={form.folder} onChange={e => set("folder", e.target.value)} className={inp}>
              {ALL_FOLDERS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div className="col-span-2">{lb("Subject *")}<input className={inp} value={form.subject} onChange={e => set("subject", e.target.value)} placeholder="What is the issue or topic of this mail"/></div>
          <div>{lb("Sender Organisation *")}<input className={inp} value={form.senderOrg} onChange={e => set("senderOrg", e.target.value)} placeholder="e.g. Ministry of Finance"/></div>
          <div>{lb("Sender Name")}<input className={inp} value={form.senderName} onChange={e => set("senderName", e.target.value)} placeholder="e.g. J. Dube"/></div>
          <div>{lb("Allocated To")}<input className={inp} value={form.allocatedTo} onChange={e => set("allocatedTo", e.target.value)} placeholder="e.g. Director Procurement"/></div>
          <div>{lb("Department")}<input className={inp} value={form.department} onChange={e => set("department", e.target.value)} placeholder="e.g. Ministry of Health"/></div>
          <div>{lb("Priority")}
            <select value={form.priority} onChange={e => set("priority", e.target.value)} className={inp}>
              {["High","Medium","Low"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="col-span-2">{lb("Message / Body")}
            <textarea value={form.body} onChange={e => set("body", e.target.value)} rows={4} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20 resize-none" placeholder="Enter correspondence content…"/>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 pb-4">
          <button onClick={onClose} className="h-9 px-4 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSend} className="h-9 px-5 bg-[#0F172A] text-white text-sm font-semibold rounded-lg hover:bg-[#0F172A] flex items-center gap-1.5"><Send className="h-4 w-4"/>Register</button>
        </div>
      </div>
    </div>
  );
}

// ── Mail Detail View ──────────────────────────────────────────────────────
function MailDetail({
  mail, onClose, onStatusChange,
}: {
  mail: MailItem;
  onClose: () => void;
  onStatusChange: (id: string, field: "approvalStatus" | "actionStatus", val: string) => void;
}) {
  const [msgTab, setMsgTab] = useState<"content" | "reply" | "attachments">("content");
  const [reply, setReply] = useState("");
  const age = ageLabel(mail.receivedDate, mail.actionDate);
  const fm = FOLDER_META[mail.folder];
  const FIcon = fm.icon;

  return (
    <div className="flex flex-col h-full">
      {/* Detail top bar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-200 flex-wrap">
        <button onClick={onClose} className="flex items-center gap-1.5 h-8 px-3 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50">
          <ArrowLeft className="h-3.5 w-3.5"/> Back
        </button>
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${fm.bg}`}>
          <FIcon className={`h-4 w-4 ${fm.color}`}/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gray-900 truncate">{mail.subject}</div>
          <div className="text-[10px] text-gray-400">{mail.id} · {mail.senderOrg}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {/* Approval status */}
          <select value={mail.approvalStatus} onChange={e => onStatusChange(mail.id,"approvalStatus",e.target.value)}
            className={`h-7 px-2 text-[10px] font-bold rounded-lg border focus:outline-none cursor-pointer ${APPROVAL_STYLE[mail.approvalStatus]}`}>
            {(["Pending","Approved","Rejected","Escalated","Returned"] as ApprovalStatus[]).map(s => <option key={s}>{s}</option>)}
          </select>
          {/* Action status */}
          <select value={mail.actionStatus} onChange={e => onStatusChange(mail.id,"actionStatus",e.target.value)}
            className={`h-7 px-2 text-[10px] font-bold rounded-lg border-0 focus:outline-none cursor-pointer ${ACTION_STYLE[mail.actionStatus]}`}>
            {(["Not Actioned","Actioned"] as ActionStatus[]).map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={() => window.print()} className="h-7 px-3 border border-gray-200 text-xs text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-1"><Printer className="h-3 w-3"/>Print</button>
        </div>
      </div>

      {/* Meta strip */}
      <div className="flex-shrink-0 bg-gray-50 border-b border-gray-100 px-5 py-2.5 flex items-center gap-6 flex-wrap text-[11px]">
        <div><span className="text-gray-400 font-medium">From:</span> <span className="font-semibold text-gray-800">{mail.senderName}</span> <span className="text-gray-400">({mail.senderOrg})</span></div>
        <div><span className="text-gray-400 font-medium">Allocated to:</span> <span className="font-semibold text-gray-800">{mail.allocatedTo}</span></div>
        <div><span className="text-gray-400 font-medium">Dept:</span> <span className="font-semibold text-gray-800">{mail.department}</span></div>
        <div><span className="text-gray-400 font-medium">Received:</span> <span className="font-semibold text-gray-800">{mail.receivedDate}</span></div>
        {mail.actionDate && <div><span className="text-gray-400 font-medium">Actioned:</span> <span className="font-semibold text-gray-800">{mail.actionDate}</span></div>}
        <div><span className="text-gray-400 font-medium">Age:</span> <span className={`font-bold ${age.color}`}>{age.label}</span></div>
        <div className="flex items-center gap-1"><div className={`h-2 w-2 rounded-full ${PRIORITY_DOT[mail.priority]}`}/><span className="font-semibold text-gray-700">{mail.priority} Priority</span></div>
      </div>

      {/* Sub-tab strip */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-5 flex gap-1">
        {(["content","reply","attachments"] as const).map(t => (
          <button key={t} onClick={() => setMsgTab(t)}
            className={`px-4 py-2.5 text-xs font-semibold capitalize whitespace-nowrap border-b-2 transition-colors ${msgTab===t?"border-slate-200 text-[#0F172A]":"border-transparent text-gray-500 hover:text-gray-800"}`}>
            {t === "content" ? "📄 Content" : t === "reply" ? "↩ Reply / Notes" : `📎 Attachments (${mail.attachments.length})`}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">
        {msgTab === "content" && (
          <div className="max-w-2xl bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <pre className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">{mail.body}</pre>
          </div>
        )}
        {msgTab === "reply" && (
          <div className="max-w-2xl space-y-3">
            <textarea value={reply} onChange={e => setReply(e.target.value)} rows={6}
              className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20"
              placeholder="Type your reply, note, or instruction here…"/>
            <div className="flex gap-2">
              <button onClick={() => { alert("Reply saved."); setReply(""); }} className="h-9 px-5 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A] flex items-center gap-1.5"><Send className="h-3.5 w-3.5"/>Send Reply</button>
              <button onClick={() => setReply("")} className="h-9 px-4 border border-gray-200 text-xs text-gray-600 rounded-lg hover:bg-gray-50">Clear</button>
            </div>
          </div>
        )}
        {msgTab === "attachments" && (
          <div className="max-w-2xl space-y-2">
            {mail.attachments.length === 0 && <div className="text-sm text-gray-400 py-8 text-center">No attachments on this mail item.</div>}
            {mail.attachments.map((att, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
                <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0"><Paperclip className="h-4 w-4 text-red-500"/></div>
                <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-gray-800 truncate">{att.name}</div><div className="text-[10px] text-gray-400">{att.size}</div></div>
                <button className="h-7 px-3 bg-gray-100 hover:bg-gray-200 text-xs text-gray-600 rounded-lg flex items-center gap-1"><Download className="h-3 w-3"/>Download</button>
              </div>
            ))}
            <label className="flex items-center gap-2 h-9 px-4 border border-dashed border-slate-200 text-[#0F172A] text-xs font-semibold rounded-lg hover:bg-slate-50 cursor-pointer w-full justify-center">
              <Upload className="h-3.5 w-3.5"/>Attach File
              <input type="file" className="hidden"/>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function MailRegistryPage() {
  const [mails, setMails] = useState<MailItem[]>(SEED);
  const [activeFolder, setActiveFolder] = useState<FolderType | "All">("All");
  const [selected, setSelected] = useState<MailItem | null>(null);
  const [search, setSearch] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [filterApproval, setFilterApproval] = useState<string>("All");

  const setStatus = (id: string, field: "approvalStatus" | "actionStatus", val: string) => {
    setMails(prev => prev.map(m => m.id === id ? { ...m, [field]: val, ...(field === "actionStatus" && val === "Actioned" && !m.actionDate ? { actionDate: new Date().toISOString().split("T")[0] } : {}) } : m));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, [field]: val as never } : prev);
  };

  const toggleStar = (id: string) => setMails(prev => prev.map(m => m.id === id ? { ...m, starred: !m.starred } : m));

  const filtered = mails.filter(m => {
    if (activeFolder !== "All" && m.folder !== activeFolder) return false;
    if (filterApproval !== "All" && m.approvalStatus !== filterApproval) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!m.subject.toLowerCase().includes(q) && !m.senderOrg.toLowerCase().includes(q) && !m.allocatedTo.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const folderCount = (f: FolderType | "All") => f === "All" ? mails.length : mails.filter(m => m.folder === f).length;
  const unread = (f: FolderType | "All") => (f === "All" ? mails : mails.filter(m => m.folder === f)).filter(m => m.actionStatus === "Not Actioned").length;

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Records Management"
        process="Mail Registry"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="flex flex-col h-full min-h-0 bg-[#f3f4f6]">
        {/* Top header bar */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-[#0F172A] flex items-center justify-center"><Inbox className="h-5 w-5 text-white"/></div>
            <div><div className="text-sm font-black text-gray-900">Corporate Mail Registry</div><div className="text-[10px] text-gray-400">All official correspondence</div></div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by subject, organisation, allocation…"
                className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20 bg-gray-50"/>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <select value={filterApproval} onChange={e => setFilterApproval(e.target.value)}
              className="h-9 px-3 text-xs border border-gray-200 rounded-xl focus:outline-none text-gray-700 bg-white">
              <option value="All">All Statuses</option>
              {(["Pending","Approved","Rejected","Escalated","Returned"] as ApprovalStatus[]).map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => setShowCompose(true)}
              className="h-9 px-4 bg-[#0F172A] text-white text-xs font-semibold rounded-xl hover:bg-[#0F172A] flex items-center gap-1.5">
              <Plus className="h-4 w-4"/>Register Mail
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left sidebar — Gmail-style folders */}
          <div className="flex-shrink-0 w-52 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
            <div className="p-3 space-y-0.5">
              {/* All */}
              <button onClick={() => { setActiveFolder("All"); setSelected(null); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${activeFolder==="All"?"bg-slate-50 text-[#0F172A]":"text-gray-700 hover:bg-gray-50"}`}>
                <Inbox className={`h-4 w-4 flex-shrink-0 ${activeFolder==="All"?"text-[#0F172A]":"text-gray-400"}`}/>
                <span className="flex-1 text-left">All Mail</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeFolder==="All"?"bg-[#0F172A] text-white":"bg-gray-100 text-gray-500"}`}>{unread("All")}</span>
              </button>

              <div className="pt-2 pb-1 px-3 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Folders</div>

              {ALL_FOLDERS.map(f => {
                const fm = FOLDER_META[f];
                const FIcon = fm.icon;
                const isActive = activeFolder === f;
                const unreadCount = unread(f);
                return (
                  <button key={f} onClick={() => { setActiveFolder(f); setSelected(null); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${isActive?`${fm.bg} ${fm.color}`:"text-gray-700 hover:bg-gray-50"}`}>
                    <FIcon className={`h-4 w-4 flex-shrink-0 ${isActive?fm.color:"text-gray-400"}`}/>
                    <span className="flex-1 text-left leading-tight">{f}</span>
                    {unreadCount > 0 && <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${isActive?"bg-white/60 text-current":"bg-[#0F172A] text-white"}`}>{unreadCount}</span>}
                  </button>
                );
              })}

              {/* Stats */}
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-1 px-1">
                {[
                  { label: "Total", count: mails.length, color: "text-gray-700" },
                  { label: "Pending", count: mails.filter(m=>m.approvalStatus==="Pending").length, color: "text-[#0F172A]" },
                  { label: "Not Actioned", count: mails.filter(m=>m.actionStatus==="Not Actioned").length, color: "text-red-500" },
                  { label: "Starred", count: mails.filter(m=>m.starred).length, color: "text-[#0F172A]" },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between px-2 py-0.5">
                    <span className="text-[10px] text-gray-400">{s.label}</span>
                    <span className={`text-[10px] font-bold ${s.color}`}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mail list */}
          {!selected && (
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-white">
              {/* List header */}
              <div className="flex-shrink-0 grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto_auto] items-center gap-x-2 px-4 py-2 bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <span className="w-6"/>
                <span>Subject / Organisation</span>
                <span className="w-32 text-center hidden lg:block">Allocated To</span>
                <span className="w-24 text-center hidden xl:block">Folder</span>
                <span className="w-24 text-center">Approval</span>
                <span className="w-24 text-center">Action</span>
                <span className="w-20 text-center">Received</span>
                <span className="w-16 text-center">Age</span>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-48 text-sm text-gray-400 gap-2">
                    <Inbox className="h-10 w-10 text-gray-200"/>No mail items found.
                  </div>
                )}
                {filtered.map(m => {
                  const age = ageLabel(m.receivedDate, m.actionDate);
                  const fm = FOLDER_META[m.folder];
                  const FIcon = fm.icon;
                  const isUnread = m.actionStatus === "Not Actioned";
                  return (
                    <div key={m.id} onClick={() => setSelected(m)}
                      className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto_auto_auto] items-center gap-x-2 px-4 py-3 cursor-pointer hover:bg-slate-50/40 transition-colors ${isUnread?"bg-white":"bg-gray-50/30"}`}>
                      {/* Star */}
                      <button onClick={e => { e.stopPropagation(); toggleStar(m.id); }}
                        className="w-6 text-gray-300 hover:text-[#0F172A]">
                        {m.starred ? <Star className="h-4 w-4 text-slate-400 fill-yellow-400"/> : <StarOff className="h-4 w-4"/>}
                      </button>
                      {/* Subject + org */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[m.priority]}`}/>
                          <span className={`text-sm truncate ${isUnread?"font-bold text-gray-900":"font-medium text-gray-600"}`}>{m.subject}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                          <FIcon className={`h-3 w-3 flex-shrink-0 ${fm.color}`}/>
                          <span className="truncate">{m.senderOrg}</span>
                          {m.attachments.length > 0 && <Paperclip className="h-3 w-3 text-gray-300 flex-shrink-0"/>}
                        </div>
                      </div>
                      {/* Allocated to */}
                      <div className="w-32 hidden lg:block text-center">
                        <span className="text-[10px] text-gray-600 truncate block">{m.allocatedTo}</span>
                      </div>
                      {/* Folder */}
                      <div className="w-24 hidden xl:flex justify-center">
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${fm.bg} ${fm.color} leading-tight text-center`}>{m.folder.replace("Internal ","Int. ").replace("External ","Ext. ")}</span>
                      </div>
                      {/* Approval status */}
                      <div className="w-24 flex justify-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${APPROVAL_STYLE[m.approvalStatus]}`}>{m.approvalStatus}</span>
                      </div>
                      {/* Action status */}
                      <div className="w-24 flex justify-center">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${ACTION_STYLE[m.actionStatus]}`}>{m.actionStatus}</span>
                      </div>
                      {/* Received date */}
                      <div className="w-20 text-center text-[10px] text-gray-400">{m.receivedDate}</div>
                      {/* Age */}
                      <div className={`w-16 text-center text-[10px] font-bold ${age.color}`}>{age.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Mail detail */}
          {selected && (
            <div className="flex-1 min-w-0 overflow-hidden flex flex-col bg-white">
              <MailDetail
                mail={selected}
                onClose={() => setSelected(null)}
                onStatusChange={setStatus}
              />
            </div>
          )}
        </div>
      </div>

      {showCompose && (
        <ComposeModal
          onClose={() => setShowCompose(false)}
          onSend={m => setMails(prev => [m, ...prev])}
        />
      )}
    </AppShell>
  );
}
