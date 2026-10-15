/**
 * E-PROCUREMENT WORKBENCH
 * Full 21-stage procurement workbench covering Tender, RFQ, RFP, EOI, Auctions
 * Based on the E-Procurement Work Station Forms specification document.
 * Each stage has: Form tabs, AI assistance, approval workflow, audit trail,
 * and integrated email communication.
 */
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { pushNotification } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import {
  FileText, ShoppingCart, BarChart3, Gavel, ChevronRight, ChevronDown,
  Plus, Send, Mail, X, Minimize2, Maximize2, Sparkles, CheckCircle2,
  Clock, AlertTriangle, Search, Download, Upload, Shield, DollarSign,
  Users, Activity, Paperclip, RefreshCcw, Eye, BookOpen, Scale,
  ClipboardList, Package, Settings, Globe, Bell, Inbox, Archive,
  TrendingUp, Landmark, Building2, Award, FilePlus, FileSearch,
  MessageSquare, Phone, Trash2, Star, Filter, ChevronLeft, MapPin,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProcType = "tender" | "rfq" | "rfp" | "eoi" | "auction";
type StageStatus = "completed" | "active" | "pending" | "blocked";

interface Stage {
  id: number;
  label: string;
  short: string;
  status: StageStatus;
  owner: string;
  formTabs: string[];
}

// ─── 21-Stage Procurement Lifecycle ──────────────────────────────────────────
const ALL_STAGES: Stage[] = [
  { id: 1,  label: "Strategic Procurement Planning",      short: "Planning",        status: "completed", owner: "Planning Officer",     formTabs: ["Requirements & Business Need","Market Analysis & Strategy","Procurement Packaging & Schedule","Risk, Budget & Funding","Ethics & Compliance","Approval Workflow"] },
  { id: 2,  label: "Procurement Requisition",             short: "Requisition",     status: "completed", owner: "Requisition Officer",  formTabs: ["Requisition & Requirements","Budget Commitment & Funding","Compliance & Validation","Requisition Approval"] },
  { id: 3,  label: "Strategy & Sourcing Approval",        short: "Sourcing",        status: "completed", owner: "Procurement Officer",  formTabs: ["Sourcing Strategy & Method","Compliance Validation","Tender Committee Approval"] },
  { id: 4,  label: "Tender Preparation",                  short: "Preparation",     status: "active",    owner: "Procurement Officer",  formTabs: ["Tender Package Definition","Bid Requirements & Evaluation","Contract & Compliance Review","Tender Approval Workflow"] },
  { id: 5,  label: "Tender Advertisement",                short: "Advertisement",   status: "pending",   owner: "Communications Officer",formTabs: ["Tender Publication","Supplier Notification","OCDS Publication","Publication Audit"] },
  { id: 6,  label: "Supplier Engagement",                 short: "Engagement",      status: "pending",   owner: "Procurement Officer",  formTabs: ["Supplier Registration","Prequalification","Clarifications & Pre-Bid","Addenda & Corrigenda","Communication Audit"] },
  { id: 7,  label: "Electronic Bid Submission",           short: "Bid Submission",  status: "pending",   owner: "Suppliers",            formTabs: ["Bid Header","Technical Proposal","Financial Proposal","Bid Security","Submission Validation","Audit Trail"] },
  { id: 8,  label: "Bid Opening",                         short: "Bid Opening",     status: "pending",   owner: "Evaluation Committee", formTabs: ["Opening Session","Bid Opening Results","Attendance Register","Minutes","Audit Log"] },
  { id: 9,  label: "Bid Evaluation",                      short: "Evaluation",      status: "pending",   owner: "Evaluation Committee", formTabs: ["Evaluation Setup","Compliance & Eligibility","Technical Evaluation","Due Diligence & References","Financial Evaluation","Evaluation Approval"] },
  { id: 10, label: "Recommendation for Award",            short: "Award Rec.",      status: "pending",   owner: "Evaluation Committee", formTabs: ["Award Recommendation","Governance Review Panel","Approval Workflow & Audit"] },
  { id: 11, label: "Contract Award",                      short: "Award",           status: "pending",   owner: "Accounting Officer",   formTabs: ["Award Decision","Notifications & Standstill","Complaints & Appeals","Contract Establishment","Contract Activation","Audit Trail"] },
  { id: 12, label: "Contract Execution",                  short: "Execution",       status: "pending",   owner: "Contract Manager",     formTabs: ["Contract Performance","Deliverables & Milestones","Change Management","Project Monitoring","Progress Certification","Risk & Analytics","Audit Trail"] },
  { id: 13, label: "Contract Performance Reporting",      short: "Perf. Reporting", status: "pending",   owner: "Contract Manager",     formTabs: ["Performance Reports","SLA Monitoring","KPI Scorecard","Reporting Workflow"] },
  { id: 14, label: "Project Implementation Monitoring",   short: "Proj. Monitoring",status: "pending",   owner: "Project Manager",      formTabs: ["Site Inspections","Engineer Reports","GIS Verification","Progress Certificates","Drone Monitoring"] },
  { id: 15, label: "Goods Receipt & Acceptance",          short: "GRN & Acceptance",status: "pending",   owner: "Stores Officer",       formTabs: ["Delivery & GRN","Inspection & QA","Acceptance Certification","Document Repository"] },
  { id: 16, label: "Invoice Management",                  short: "Invoice",         status: "pending",   owner: "Finance Officer",      formTabs: ["Invoice Processing","Tax Verification","Three-Way Matching","Fraud Detection","Invoice Approval"] },
  { id: 17, label: "Payment Management",                  short: "Payment",         status: "pending",   owner: "Treasury Officer",     formTabs: ["Payment Request","Budget Verification","Payment Authorization","Treasury & EFT","Payment Audit"] },
  { id: 18, label: "Vendor Performance Evaluation",       short: "Vendor Perf.",    status: "pending",   owner: "Performance Officer",  formTabs: ["Performance Scorecard","KPI Assessment","Improvement Actions","Performance Report"] },
  { id: 19, label: "Contract Close-Out",                  short: "Close-Out",       status: "pending",   owner: "Contract Manager",     formTabs: ["Completion Verification","Defects Liability","Final Settlement","Closure Approval","Closure Repository"] },
  { id: 20, label: "Final Acceptance & Handover",         short: "Final Acceptance",status: "pending",   owner: "End User Department",  formTabs: ["Final Inspection","Handover Documentation","Warranty Registration","Asset Handover"] },
  { id: 21, label: "Records Management & Archiving",      short: "Records",         status: "pending",   owner: "Records Officer",      formTabs: ["Procurement Archive","Records Retention","Audit Repository","Open Contracting","Records Audit Trail"] },
];

// RFQ has a shorter 18-stage cycle, RFP/EOI share most with Tender, Auction has fewer
const getStagesForType = (type: ProcType): Stage[] => {
  if (type === "rfq") {
    return ALL_STAGES.filter(s => [1,2,3,4,5,6,7,8,9,10,11,12,15,16,17,18,19,21].includes(s.id))
      .map((s, i) => ({ ...s, id: i + 1 }));
  }
  if (type === "auction") {
    return ALL_STAGES.filter(s => [1,2,3,4,5,6,7,8,9,10,11,12,15,16,17,19,21].includes(s.id))
      .map((s, i) => ({ ...s, id: i + 1 }));
  }
  return ALL_STAGES;
};

// ─── Email Window Component ───────────────────────────────────────────────────
interface EmailMessage {
  id: string; from: string; to: string; subject: string;
  body: string; time: string; read: boolean; type: "inbox"|"sent"|"draft";
}

const DEMO_EMAILS: EmailMessage[] = [
  { id: "e1", from: "System", to: "procurement@gov.zw", subject: "Tender ZW-PRA-2026-00184 — Stage 4 Active", body: "Tender Preparation stage is now active. Please complete all 4 form tabs before publishing.", time: "09:00", read: false, type: "inbox" },
  { id: "e2", from: "T. Moyo (CPO)", to: "procurement@gov.zw", subject: "Budget Confirmation Required — PR-2026-1283", body: "Please confirm budget availability for the Medical Supplies requisition before proceeding to sourcing.", time: "08:45", read: false, type: "inbox" },
  { id: "e3", from: "Legal Department", to: "procurement@gov.zw", subject: "Legal Review Complete — ARV Framework", body: "Legal review for the ARV Medicines Framework contract has been completed with no objections.", time: "Yesterday", read: true, type: "inbox" },
  { id: "e4", from: "procurement@gov.zw", to: "suppliers@highveld.co.zw", subject: "Clarification Response — ZW-PRA-2026-00181", body: "In response to your clarification query, please note that the specifications require Grade 42.5N cement only.", time: "Yesterday", read: true, type: "sent" },
  { id: "e5", from: "AI System", to: "procurement@gov.zw", subject: "AI Alert — Bid Rotation Pattern Detected", body: "The AI fraud detection engine has flagged a potential bid rotation pattern involving 3 vendors across 7 tenders.", time: "2 days ago", read: true, type: "inbox" },
];

function EmailWindow() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [tab, setTab] = useState<"inbox"|"compose"|"sent">("inbox");
  const [selected, setSelected] = useState<EmailMessage | null>(null);
  const [emails, setEmails] = useState<EmailMessage[]>(DEMO_EMAILS);
  const [compose, setCompose] = useState({ to: "", subject: "", body: "" });

  const unread = emails.filter(e => !e.read && e.type === "inbox").length;

  const send = () => {
    if (!compose.to || !compose.subject) { toast("To and Subject are required", "error"); return; }
    const msg: EmailMessage = {
      id: `e${Date.now()}`, from: "procurement@gov.zw", to: compose.to,
      subject: compose.subject, body: compose.body,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: true, type: "sent",
    };
    setEmails(prev => [msg, ...prev]);
    setCompose({ to: "", subject: "", body: "" });
    setTab("sent");
    toast(`Email sent to ${compose.to}`, "success");
    pushNotification(`Email sent: ${compose.subject}`, "success");
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-6 z-50 flex items-center gap-2 h-11 px-4 rounded-full bg-black text-white text-sm font-medium shadow-2xl hover:bg-gray-800 transition-colors"
      >
        <Mail className="h-4 w-4" />
        <span>Email</span>
        {unread > 0 && (
          <span className="h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center">{unread}</span>
        )}
      </button>
    );
  }

  return (
    <div className={`email-window ${minimized ? "email-window-minimized" : ""}`}>
      {/* Email window header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black text-white rounded-t-xl flex-shrink-0 cursor-pointer"
        onClick={() => setMinimized(m => !m)}>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span className="text-sm font-semibold">Workbench Email</span>
          {unread > 0 && <span className="h-4.5 px-1.5 rounded-full bg-red-500 text-white text-[9px] font-bold">{unread}</span>}
        </div>
        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          <button onClick={() => setMinimized(m => !m)} className="h-6 w-6 rounded hover:bg-white/20 grid place-items-center">
            {minimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => setOpen(false)} className="h-6 w-6 rounded hover:bg-white/20 grid place-items-center">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Tab bar */}
          <div className="flex border-b border-black/10 flex-shrink-0">
            {(["inbox","compose","sent"] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setSelected(null); }}
                className={`flex-1 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px capitalize
                  ${tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>
                {t === "inbox" ? `Inbox${unread > 0 ? ` (${unread})` : ""}` : t === "compose" ? "✏️ Compose" : "Sent"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Inbox */}
            {tab === "inbox" && !selected && (
              <div className="divide-y divide-black/5">
                {emails.filter(e => e.type === "inbox").map(email => (
                  <div key={email.id} onClick={() => { setSelected(email); setEmails(prev => prev.map(e => e.id === email.id ? {...e, read: true} : e)); }}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${!email.read ? "bg-slate-50/50" : ""}`}>
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <span className={`text-xs ${!email.read ? "font-bold text-black" : "font-medium text-black/70"} truncate`}>{email.from}</span>
                      <span className="text-[10px] text-black/35 flex-shrink-0">{email.time}</span>
                    </div>
                    <p className={`text-xs truncate ${!email.read ? "text-black font-medium" : "text-black/60"}`}>{email.subject}</p>
                    <p className="text-[11px] text-black/40 truncate mt-0.5">{email.body.slice(0, 60)}…</p>
                    {!email.read && <div className="h-2 w-2 rounded-full bg-[#0F172A] mt-1.5" />}
                  </div>
                ))}
              </div>
            )}

            {/* Email detail view */}
            {tab === "inbox" && selected && (
              <div className="p-4 space-y-3">
                <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-xs text-black/50 hover:text-black">
                  <ChevronLeft className="h-3.5 w-3.5" /> Back to inbox
                </button>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-black">{selected.subject}</h3>
                  <div className="text-[11px] text-black/50">From: {selected.from} · {selected.time}</div>
                  <p className="text-xs text-black leading-relaxed mt-2">{selected.body}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setTab("compose"); setCompose({ to: selected.from, subject: `Re: ${selected.subject}`, body: "" }); setSelected(null); }}
                    className="h-8 px-3 rounded-xl bg-black text-white text-xs flex items-center gap-1.5 hover:bg-gray-800">
                    <Send className="h-3.5 w-3.5" /> Reply
                  </button>
                  <button onClick={() => { toast("Email forwarded", "success"); }}
                    className="h-8 px-3 rounded-xl border border-black/10 text-xs flex items-center gap-1.5 hover:bg-gray-50">
                    Forward
                  </button>
                </div>
              </div>
            )}

            {/* Compose */}
            {tab === "compose" && (
              <div className="p-4 space-y-3">
                {[
                  { label: "To", key: "to", placeholder: "name@gov.zw" },
                  { label: "Subject", key: "subject", placeholder: "Email subject" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] font-semibold text-black/60 uppercase tracking-wider">{f.label}</label>
                    <input value={(compose as Record<string,string>)[f.key]}
                      onChange={e => setCompose(c => ({...c, [f.key]: e.target.value}))}
                      placeholder={f.placeholder}
                      className="w-full h-9 px-3 mt-1 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-semibold text-black/60 uppercase tracking-wider">Message</label>
                  <textarea value={compose.body} onChange={e => setCompose(c => ({...c, body: e.target.value}))}
                    placeholder="Type your message…" rows={6}
                    className="w-full px-3 py-2 mt-1 rounded-xl border border-black/10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
                <div className="flex gap-2">
                  <button onClick={send} className="flex-1 h-9 rounded-xl bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-gray-800">
                    <Send className="h-3.5 w-3.5" /> Send Email
                  </button>
                  <button onClick={() => toast("Draft saved", "info")}
                    className="h-9 px-3 rounded-xl border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1">
                    <Archive className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3 w-3 text-[#0F172A]" />
                    <span className="text-[10px] font-semibold text-[#0F172A]">AI Email Assist</span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {["Draft procurement notice", "Request clarification", "Notify supplier", "Escalation email"].map(q => (
                      <button key={q} onClick={() => setCompose(c => ({...c, body: `[AI Generated] ${q}: Please review the attached procurement documentation and respond accordingly. This communication is auto-generated by the APPIIOMS AI Email Assistant.\n\nRegards,\nProcurement Department`}))}
                        className="text-[9px] px-2 py-0.5 rounded-full bg-slate-100 text-[#0F172A] hover:bg-slate-200">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sent */}
            {tab === "sent" && (
              <div className="divide-y divide-black/5">
                {emails.filter(e => e.type === "sent").map(email => (
                  <div key={email.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <span className="text-xs font-medium text-black/70 truncate">To: {email.to}</span>
                      <span className="text-[10px] text-black/35 flex-shrink-0">{email.time}</span>
                    </div>
                    <p className="text-xs text-black/70 truncate">{email.subject}</p>
                    <p className="text-[11px] text-black/40 truncate mt-0.5">{email.body.slice(0, 60)}…</p>
                  </div>
                ))}
                {emails.filter(e => e.type === "sent").length === 0 && (
                  <div className="py-8 text-center text-xs text-black/40">No sent emails</div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Stage Status Helpers ─────────────────────────────────────────────────────
const STATUS_DOT: Record<StageStatus, string> = {
  completed: "bg-[#0F172A]", active: "bg-black animate-pulse", pending: "bg-gray-200", blocked: "bg-red-400",
};
const STATUS_BADGE: Record<StageStatus, string> = {
  completed: "bg-slate-100 text-[#0F172A]", active: "bg-black text-white",
  pending: "bg-gray-100 text-gray-500", blocked: "bg-red-100 text-red-700",
};

// ─── Stage Progress Bar ───────────────────────────────────────────────────────
function StageProgressBar({ stages, activeStage, onSelect }: {
  stages: Stage[]; activeStage: number; onSelect: (id: number) => void;
}) {
  return (
    <div className="overflow-x-auto pb-2 tab-strip">
      <div className="flex items-center min-w-max gap-0">
        {stages.map((stage, idx) => {
          const isActive = stage.id === activeStage;
          const isDone = stage.status === "completed";
          return (
            <div key={stage.id} className="flex items-center">
              <button
                onClick={() => onSelect(stage.id)}
                className={`flex flex-col items-center px-2 py-1 rounded-lg transition-all min-w-[64px] group
                  ${isActive ? "bg-black" : isDone ? "hover:bg-slate-50" : "hover:bg-gray-50"}`}
              >
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold mb-0.5 transition-all
                  ${isActive ? "bg-white text-black" : isDone ? "bg-[#0F172A] text-white" : "bg-gray-200 text-gray-700"}`}>
                  {isDone ? "✓" : stage.id}
                </div>
                <span className={`text-[9px] font-medium leading-tight text-center max-w-[60px] truncate
                  ${isActive ? "text-white" : isDone ? "text-[#0F172A]" : "text-gray-600"}`}>
                  {stage.short}
                </span>
              </button>
              {idx < stages.length - 1 && (
                <div className={`w-4 h-0.5 flex-shrink-0 ${isDone ? "bg-slate-300" : "bg-gray-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Generic Form Tab Renderer ────────────────────────────────────────────────
function FormTabContent({ stage, tabName, procType }: { stage: Stage; tabName: string; procType: ProcType }) {
  const act = (msg: string) => { pushNotification(msg, "success"); toast(msg, "success"); };

  // Shared approval workflow table
  const ApprovalTable = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-black">Approval Workflow</h3>
        <button onClick={() => act("Submitted for approval")}
          className="h-8 px-3 rounded-xl bg-black text-white text-xs flex items-center gap-1.5 hover:bg-gray-800">
          <Send className="h-3.5 w-3.5" /> Submit for Approval
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-black/8">
            <tr>{["Level","Stage","Approver","Position","Date","Decision","Status"].map(h => (
              <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-black/40 whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {[
              { level: 1, stage: "Initial Review", approver: "D. Moyo", pos: "Procurement Officer", date: "2026-06-24", decision: "Approved", status: "completed" },
              { level: 2, stage: "Budget Confirmation", approver: "R. Chikwanda", pos: "Finance Officer", date: "2026-06-24", decision: "Approved", status: "completed" },
              { level: 3, stage: "Legal Review", approver: "A. Sithole", pos: "Legal Officer", date: "—", decision: "Pending", status: "active" },
              { level: 4, stage: "Final Approval", approver: "T. Moyo", pos: "CPO", date: "—", decision: "—", status: "pending" },
            ].map(row => (
              <tr key={row.level} className="hover:bg-gray-50/60">
                <td className="px-3 py-3 font-semibold text-black">{row.level}</td>
                <td className="px-3 py-3 text-black">{row.stage}</td>
                <td className="px-3 py-3 text-black">{row.approver}</td>
                <td className="px-3 py-3 text-black/60 text-[10px]">{row.pos}</td>
                <td className="px-3 py-3 text-black/50 whitespace-nowrap">{row.date}</td>
                <td className="px-3 py-3">
                  {row.decision !== "—" && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold
                      ${row.decision === "Approved" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>
                      {row.decision}
                    </span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${STATUS_BADGE[row.status as StageStatus]}`}>
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Compliance checklist
  const ComplianceChecklist = () => (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-black">Compliance Checklist</h3>
      {[
        "Approved Procurement Plan exists",
        "Budget availability confirmed",
        "Funding source verified",
        "Technical specifications complete",
        "Conflict of interest declaration submitted",
        "Segregation of duties validated",
        "Threshold compliance verified",
        "Procurement method approved",
      ].map((item, i) => (
        <label key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-black/5 cursor-pointer hover:bg-gray-100">
          <input type="checkbox" defaultChecked={i < 5} className="rounded flex-shrink-0 h-4 w-4" onChange={() => act(`Compliance item updated: ${item}`)} />
          <span className="text-xs text-black">{item}</span>
          <span className="ml-auto text-[10px] text-black/30">{i < 5 ? "✓ Verified" : "Pending"}</span>
        </label>
      ))}
      <button onClick={() => act("Compliance record locked")}
        className="w-full h-9 mt-2 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#0F172A] flex items-center justify-center gap-1.5">
        <Shield className="h-3.5 w-3.5" /> Submit & Lock Compliance Record
      </button>
    </div>
  );

  // AI assistance panel
  const AIPanel = () => (
    <div className="p-4 bg-[#0F172A] border border-slate-200/60 rounded-2xl space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-xl bg-[#0F172A] grid place-items-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="text-xs font-semibold text-black">AI Procurement Assistant — Stage {stage.id}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[#0F172A] animate-pulse" />
            <span className="text-[10px] text-[#0F172A]">Active — 94% confidence</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          `Validate ${tabName} completeness`,
          `Generate ${stage.short} report`,
          "Check compliance requirements",
          "Identify risks at this stage",
          "Suggest next actions",
          "Draft communication email",
        ].map(cap => (
          <button key={cap} onClick={() => act(`AI: ${cap}`)}
            className="text-left p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-200 text-[11px] text-black/70 transition-colors flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-slate-100 grid place-items-center flex-shrink-0">
              <div className="h-1.5 w-1.5 rounded-full bg-[#0F172A]" />
            </div>
            {cap}
          </button>
        ))}
      </div>
    </div>
  );

  // Render based on tab name
  if (tabName.includes("Approval")) return (
    <div className="space-y-5">
      <ApprovalTable />
      <AIPanel />
    </div>
  );

  if (tabName.includes("Compliance") || tabName.includes("Ethics")) return (
    <div className="space-y-5">
      <ComplianceChecklist />
      <AIPanel />
    </div>
  );

  if (tabName.includes("Audit") || tabName.includes("Audit Trail")) return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-black">Audit Trail — Stage {stage.id}: {stage.label}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-black/8">
            <tr>{["Event ID","DateTime","User","Event Type","Action","IP Address"].map(h => (
              <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-black/40 whitespace-nowrap">{h}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {[
              { id: "AUD-001", dt: "2026-06-24 09:14", user: "D. Moyo", type: "Stage Created", action: `Stage ${stage.id} created`, ip: "192.168.1.42" },
              { id: "AUD-002", dt: "2026-06-24 09:28", user: "D. Moyo", type: "Form Saved", action: `${tabName} form data saved`, ip: "192.168.1.42" },
              { id: "AUD-003", dt: "2026-06-24 10:02", user: "R. Chikwanda", type: "Review Submitted", action: "Budget confirmation submitted", ip: "192.168.1.18" },
              { id: "AUD-004", dt: "2026-06-24 10:15", user: "System AI", type: "AI Analysis", action: "Compliance scan completed — 8/8 checks passed", ip: "System" },
            ].map(row => (
              <tr key={row.id} className="hover:bg-gray-50/60">
                <td className="px-3 py-3 font-mono text-[10px] text-black/50">{row.id}</td>
                <td className="px-3 py-3 text-black/60 whitespace-nowrap">{row.dt}</td>
                <td className="px-3 py-3 text-black">{row.user}</td>
                <td className="px-3 py-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 text-[#0F172A]">{row.type}</span>
                </td>
                <td className="px-3 py-3 text-black max-w-xs">{row.action}</td>
                <td className="px-3 py-3 font-mono text-[10px] text-black/40">{row.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button onClick={() => act("Audit trail exported")} className="h-8 px-3 rounded-xl border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export Audit Trail
        </button>
        <button onClick={() => act("Audit report generated")} className="h-8 px-3 rounded-xl bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" /> Generate Audit Report
        </button>
      </div>
    </div>
  );

  // Default form content for all other tabs
  return (
    <div className="space-y-5">
      {/* Form header info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <Activity className="h-4 w-4 text-[#0F172A] flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-semibold text-[#0F172A]">Stage {stage.id}: {stage.label} — {tabName}</div>
          <div className="text-[11px] text-[#0F172A] mt-0.5">Responsible: {stage.owner} · Status: <span className={`font-semibold px-1.5 rounded ${STATUS_BADGE[stage.status]}`}>{stage.status}</span></div>
        </div>
      </div>

      {/* Dynamic form fields based on tab name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {getFormFields(stage, tabName, procType).map((field, i) => (
          <div key={i} className={field.fullWidth ? "md:col-span-2" : ""}>
            <label className="text-xs font-semibold text-black/50 uppercase tracking-wide mb-1 block">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea defaultValue={field.defaultValue} rows={3} placeholder={field.placeholder}
                className="w-full px-3 py-2 rounded-xl border border-black/10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10" />
            ) : field.type === "select" ? (
              <select defaultValue={field.defaultValue} className="w-full h-10 px-3 rounded-xl border border-black/10 text-sm focus:outline-none appearance-none bg-white">
                {(field.options ?? []).map(o => <option key={o}>{o}</option>)}
              </select>
            ) : field.type === "date" ? (
              <input type="date" defaultValue={field.defaultValue} className="w-full h-10 px-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
            ) : field.type === "currency" ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 text-sm">USD</span>
                <input type="number" defaultValue={field.defaultValue} placeholder="0.00" className="w-full h-10 pl-12 pr-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
            ) : (
              <input type={field.type ?? "text"} defaultValue={field.defaultValue} placeholder={field.placeholder}
                className="w-full h-10 px-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
            )}
            {field.system && <p className="text-[10px] text-black/35 mt-0.5 flex items-center gap-1"><Settings className="h-2.5 w-2.5" /> Auto-generated by system</p>}
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-black/8">
        <button onClick={() => act(`${tabName} saved`)} className="h-9 px-4 rounded-xl bg-black text-white text-xs font-semibold hover:bg-gray-800 flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" /> Save & Continue
        </button>
        <button onClick={() => act(`${tabName} exported`)} className="h-9 px-4 rounded-xl border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export PDF
        </button>
        <button onClick={() => act(`${tabName} sent for review`)} className="h-9 px-4 rounded-xl border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5">
          <Send className="h-3.5 w-3.5" /> Send for Review
        </button>
        <button onClick={() => act("Attachment uploaded")} className="h-9 px-4 rounded-xl border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5">
          <Paperclip className="h-3.5 w-3.5" /> Attach Document
        </button>
      </div>

      <AIPanel />
    </div>
  );
}

// ─── Dynamic form fields per stage/tab ───────────────────────────────────────
type FieldDef = { label: string; type?: string; defaultValue?: string; placeholder?: string; options?: string[]; fullWidth?: boolean; system?: boolean; };

function getFormFields(stage: Stage, tab: string, procType: ProcType): FieldDef[] {
  const fields: FieldDef[] = [];

  // Stage 1 - Planning
  if (stage.id === 1) {
    if (tab.includes("Requirements")) return [
      { label: "Planning Reference No", type: "text", defaultValue: `PPL-2026-${Math.floor(Math.random()*9000+1000)}`, system: true },
      { label: "Financial Year", type: "select", defaultValue: "FY 2026/27", options: ["FY 2025/26","FY 2026/27","FY 2027/28"] },
      { label: "Department", type: "select", defaultValue: "Procurement", options: ["Finance","Procurement","HR","ICT","Operations","Legal","Admin"] },
      { label: "Priority Level", type: "select", defaultValue: "High", options: ["High","Medium","Low"] },
      { label: "Procurement Category", type: "select", defaultValue: "Goods", options: ["Goods","Works","Services","Consultancy"] },
      { label: "Required Delivery Date", type: "date", defaultValue: "2026-09-30" },
      { label: "Requirement Title", type: "text", placeholder: "Enter procurement requirement title" },
      { label: "Required Delivery Date", type: "date" },
      { label: "Business Justification", type: "textarea", placeholder: "Describe the business need and justification…", fullWidth: true },
      { label: "Expected Outcome", type: "textarea", placeholder: "Describe expected outcomes and benefits…", fullWidth: true },
    ];
    if (tab.includes("Market")) return [
      { label: "Number of Known Suppliers", type: "number", defaultValue: "8" },
      { label: "Local Suppliers Available", type: "number", defaultValue: "5" },
      { label: "Competition Level", type: "select", defaultValue: "High", options: ["High","Medium","Low"] },
      { label: "Supply Risk Level", type: "select", defaultValue: "Low", options: ["Low","Medium","High","Critical"] },
      { label: "Estimated Procurement Value", type: "currency", defaultValue: "2400000" },
      { label: "Recommended Procurement Method", type: "select", defaultValue: "Open Tender", options: ["Open Tender","Restricted Tender","RFQ","RFP","EOI","Direct","Framework"] },
      { label: "Market Summary", type: "textarea", placeholder: "Describe market findings…", fullWidth: true },
      { label: "AI Threshold Check", type: "text", defaultValue: "✓ Compliant — value exceeds RFQ threshold, Open Tender required", system: true, fullWidth: true },
    ];
  }

  // Stage 4 - Tender Preparation
  if (stage.id === 4) {
    if (tab.includes("Tender Package")) return [
      { label: "Tender Number", type: "text", defaultValue: `ZW-PRA-2026-${Math.floor(Math.random()*90000+10000)}`, system: true },
      { label: "Tender Title", type: "text", placeholder: "Enter tender title" },
      { label: "Tender Method", type: "select", defaultValue: "Open Tender", options: ["Open Tender","Restricted Tender","RFQ","RFP","EOI","Framework","Direct","Reverse Auction"] },
      { label: "Procurement Category", type: "select", defaultValue: "Goods", options: ["Goods","Works","Services","Consultancy"] },
      { label: "Estimated Value", type: "currency" },
      { label: "Currency", type: "select", defaultValue: "USD", options: ["USD","ZWG","ZAR","GBP","EUR"] },
      { label: "Tender Type", type: "select", defaultValue: "National", options: ["National","International"] },
      { label: "Tender Description", type: "textarea", placeholder: "Describe the scope of this tender…", fullWidth: true },
    ];
    if (tab.includes("Bid Requirements")) return [
      { label: "Technical Weight (%)", type: "number", defaultValue: "70" },
      { label: "Financial Weight (%)", type: "number", defaultValue: "30" },
      { label: "Minimum Technical Score (%)", type: "number", defaultValue: "70" },
      { label: "Evaluation Methodology", type: "select", defaultValue: "QCBS", options: ["QCBS","Lowest Price","Most Responsive","Quality Only","Combined"] },
      { label: "Bid Security Required", type: "select", defaultValue: "Yes", options: ["Yes","No"] },
      { label: "Bid Security Type", type: "select", defaultValue: "Bank Guarantee", options: ["Bank Guarantee","Bid Bond","Insurance Bond","Certified Cheque","Bid Securing Declaration"] },
      { label: "Bid Security Amount (%)", type: "number", defaultValue: "2" },
    ];
  }

  // Stage 7 - Bid Submission
  if (stage.id === 7 || (procType === "rfq" && stage.label.includes("Bid"))) return [
    { label: "Bid Reference", type: "text", defaultValue: `BID-${Date.now().toString().slice(-6)}`, system: true },
    { label: "Bidder Company", type: "text", placeholder: "Registered company name" },
    { label: "Total Bid Value", type: "currency", placeholder: "0.00" },
    { label: "Bid Currency", type: "select", defaultValue: "USD", options: ["USD","ZWG","ZAR","GBP","EUR"] },
    { label: "Bid Validity Period (days)", type: "number", defaultValue: "90" },
    { label: "Submission Channel", type: "select", defaultValue: "e-Procurement Portal", options: ["e-Procurement Portal","Email","Physical (sealed)"] },
    { label: "Digital Signature Status", type: "text", defaultValue: "✓ Verified — PKI Certificate Valid", system: true },
    { label: "Bid Encryption Status", type: "text", defaultValue: "✓ Encrypted — AES-256", system: true },
    { label: "Submission Remarks", type: "textarea", placeholder: "Any additional remarks from bidder…", fullWidth: true },
  ];

  // Stage 9 - Evaluation
  if (stage.id === 9) {
    if (tab.includes("Technical")) return [
      { label: "Bidder Name", type: "text", placeholder: "Bidder company name" },
      { label: "Technical Score (%)", type: "number", placeholder: "0-100" },
      { label: "Experience Score", type: "number", placeholder: "0-100" },
      { label: "Methodology Score", type: "number", placeholder: "0-100" },
      { label: "Key Personnel Score", type: "number", placeholder: "0-100" },
      { label: "Quality Plan Score", type: "number", placeholder: "0-100" },
      { label: "Total Technical Score", type: "text", defaultValue: "Auto-calculated", system: true },
      { label: "Evaluator Comments", type: "textarea", placeholder: "Technical evaluation comments…", fullWidth: true },
    ];
    if (tab.includes("Financial")) return [
      { label: "Bid Price (USD)", type: "currency" },
      { label: "Corrected Bid Price", type: "currency" },
      { label: "Discounts Applied", type: "currency" },
      { label: "Arithmetic Errors Found", type: "select", defaultValue: "No", options: ["Yes","No"] },
      { label: "Financial Score (%)", type: "number", placeholder: "0-100" },
      { label: "Financial Rank", type: "number", placeholder: "1,2,3…" },
    ];
  }

  // Stage 17 - Payment
  if (stage.id === 17 || (procType === "rfq" && stage.label.includes("Payment"))) {
    if (tab.includes("Treasury") || tab.includes("EFT")) return [
      { label: "Treasury Reference No", type: "text", defaultValue: `TRY-2026-${Date.now().toString().slice(-5)}`, system: true },
      { label: "Payment Method", type: "select", defaultValue: "EFT", options: ["EFT","RTGS","SWIFT","Mobile Payment","Govt Payment Gateway"] },
      { label: "Bank Name", type: "text", placeholder: "Bank name" },
      { label: "Account Number", type: "text", placeholder: "Account number" },
      { label: "EFT Reference Number", type: "text", system: true },
      { label: "EFT Amount (USD)", type: "currency" },
      { label: "EFT Status", type: "select", defaultValue: "Pending", options: ["Pending","Processing","Successful","Failed","Reversed"] },
      { label: "Bank Response", type: "text", defaultValue: "Processing…", system: true },
    ];
  }

  // Default fields for any unspecified tab
  return [
    { label: "Reference Number", type: "text", defaultValue: `REF-${Date.now().toString().slice(-6)}`, system: true },
    { label: "Date", type: "date", defaultValue: new Date().toISOString().split("T")[0] },
    { label: "Responsible Officer", type: "text", defaultValue: stage.owner },
    { label: "Status", type: "select", defaultValue: stage.status === "active" ? "In Progress" : stage.status === "completed" ? "Completed" : "Draft", options: ["Draft","In Progress","Under Review","Approved","Rejected","Completed"] },
    { label: "Notes / Comments", type: "textarea", placeholder: "Add notes or comments for this section…", fullWidth: true },
  ];
}

// ─── Procurement Type Configuration ──────────────────────────────────────────
const PROC_TYPE_CONFIG: Record<ProcType, { label: string; icon: React.ElementType; color: string; desc: string; badgeColor: string }> = {
  tender: { label: "Open Tender", icon: FileText, color: "bg-[#0F172A]", desc: "Full open competitive tender process — 21 stages", badgeColor: "bg-slate-100 text-[#0F172A]" },
  rfq:    { label: "RFQ", icon: ShoppingCart, color: "bg-[#0F172A]", desc: "Request for Quotation — small purchases below threshold — 18 stages", badgeColor: "bg-slate-100 text-[#0F172A]" },
  rfp:    { label: "RFP", icon: FileSearch, color: "bg-[#0F172A]", desc: "Request for Proposals — services and consultancy — 21 stages", badgeColor: "bg-slate-100 text-[#0F172A]" },
  eoi:    { label: "EOI", icon: Globe, color: "bg-[#0F172A]", desc: "Expression of Interest — prequalification — 21 stages", badgeColor: "bg-slate-100 text-slate-500" },
  auction: { label: "Auction", icon: Gavel, color: "bg-rose-600", desc: "Reverse auction / live bidding — 17 stages", badgeColor: "bg-rose-100 text-rose-700" },
};

// ─── MAIN WORKBENCH PAGE ──────────────────────────────────────────────────────
export default function ProcurementWorkbenchPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [procType, setProcType] = useState<ProcType>("tender");
  const [activeStageId, setActiveStageId] = useState(4); // Start on active stage
  const [activeFormTab, setActiveFormTab] = useState(0);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProcTitle, setNewProcTitle] = useState("");
  const [newProcType, setNewProcType] = useState<ProcType>("tender");

  const stages = getStagesForType(procType);
  const activeStage = stages.find(s => s.id === activeStageId) ?? stages[0];
  const cfg = PROC_TYPE_CONFIG[procType];
  const Icon = cfg.icon;

  const completedCount = stages.filter(s => s.status === "completed").length;
  const progressPct = Math.round((completedCount / stages.length) * 100);

  const handleStageSelect = (id: number) => {
    setActiveStageId(id);
    setActiveFormTab(0);
  };

  const act = (msg: string) => { pushNotification(msg, "success"); toast(msg, "success"); };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Procurement Workbench"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1800px] mx-auto">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge tone="blue">E-Procurement Workbench</Badge>
              <Badge tone="muted">Government of Zimbabwe · PRAZ</Badge>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badgeColor}`}>{cfg.label}</span>
            </div>
            <PageHeader
              title="Procurement Workbench"
              description={`${cfg.desc} · Logged in as: ${user?.name ?? "Officer"} · ${user?.department ?? ""}`}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setShowNewModal(true)}
              className="h-9 px-4 rounded-xl bg-black text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-800">
              <Plus className="h-3.5 w-3.5" /> New Procurement
            </button>
            <button onClick={() => act("Full report downloaded")}
              className="h-9 px-4 rounded-xl border border-black/10 text-xs hover:bg-gray-50 flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export Report
            </button>
          </div>
        </div>

        {/* ── Procurement Type Switcher ───────────────────────────────── */}
        <div className="flex gap-2 mb-4 overflow-x-auto tab-strip pb-1">
          {(Object.entries(PROC_TYPE_CONFIG) as [ProcType, typeof PROC_TYPE_CONFIG[ProcType]][]).map(([key, c]) => {
            const TIcon = c.icon;
            return (
              <button key={key} onClick={() => { setProcType(key); setActiveStageId(4); setActiveFormTab(0); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0
                  ${procType === key ? "bg-black text-white border-black" : "bg-white text-black/60 border-black/10 hover:border-black/30"}`}>
                <TIcon className="h-3.5 w-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* ── KPI Row ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <KpiCard label="Progress" value={`${progressPct}%`} delta={`${completedCount}/${stages.length} stages`} icon={Activity} color="blue" />
          <KpiCard label="Active Stage" value={`Stage ${activeStageId}`} delta={activeStage?.short ?? ""} icon={CheckCircle2} color="green" />
          <KpiCard label="Open Tasks" value="8" delta="3 overdue" positive={false} icon={Clock} color="amber" />
          <KpiCard label="Vendors Engaged" value="4" delta="2 prequalified" icon={Building2} color="violet" />
          <KpiCard label="Est. Value" value="USD 14.8M" delta="Within budget" icon={DollarSign} color="green" />
        </div>

        {/* ── Stage Progress Bar ──────────────────────────────────────── */}
        <Card className="mb-4 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-black">{cfg.label} — {stages.length}-Stage Lifecycle</span>
            <div className="flex items-center gap-3 text-[10px] text-black/40">
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-[#0F172A]" /> Completed</span>
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-black animate-pulse" /> Active</span>
              <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-gray-200" /> Pending</span>
            </div>
          </div>
          <StageProgressBar stages={stages} activeStage={activeStageId} onSelect={handleStageSelect} />
          <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-[#0F172A] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </Card>

        {/* ── Main Two-Column Layout ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* Left: Stage list */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader title="Stages" subtitle={`${stages.length} stages`} />
              <div className="overflow-y-auto max-h-[600px] workbench-scroll">
                {stages.map(stage => (
                  <button key={stage.id} onClick={() => handleStageSelect(stage.id)}
                    className={`w-full flex items-start gap-2.5 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-black/5 last:border-0
                      ${activeStageId === stage.id ? "bg-black/5 border-l-2 border-l-black" : ""}`}>
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0 mt-0.5
                      ${STATUS_DOT[stage.status] === "bg-[#0F172A]" ? "bg-[#0F172A] text-white" :
                        STATUS_DOT[stage.status].includes("black") ? "bg-black text-white" : "bg-gray-200 text-gray-500"}`}>
                      {stage.status === "completed" ? "✓" : stage.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-[11px] font-semibold truncate ${activeStageId === stage.id ? "text-black" : "text-black/70"}`}>{stage.short}</div>
                      <div className="text-[9px] text-black/35 truncate">{stage.owner}</div>
                    </div>
                    <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 mt-2 ${STATUS_DOT[stage.status]}`} />
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Stage workbench */}
          <div className="lg:col-span-3 space-y-4">
            {/* Stage header */}
            <div className={`rounded-2xl p-4 text-white relative overflow-hidden`}
              style={{ background: `linear-gradient(135deg, #1e293b, #334155)` }}>
              <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[activeStage.status]}`}>
                      Stage {activeStage.id} — {activeStage.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-white/50">Owner: {activeStage.owner}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white leading-tight">{activeStage.label}</h2>
                  <p className="text-sm text-white/60 mt-0.5">{cfg.label} · {activeStage.formTabs.length} form tabs</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => act("Stage marked complete")}
                    className="h-8 px-3 rounded-xl bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#0F172A] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark Complete
                  </button>
                  <button onClick={() => act("Stage report generated")}
                    className="h-8 px-3 rounded-xl bg-white/15 text-white text-xs hover:bg-white/25 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" /> Stage Report
                  </button>
                  <button onClick={() => act("Email sent from workbench")}
                    className="h-8 px-3 rounded-xl bg-white/15 text-white text-xs hover:bg-white/25 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </button>
                </div>
              </div>
            </div>

            {/* Form tabs */}
            <Card>
              {/* Tab strip */}
              <div className="border-b border-black/8 overflow-x-auto tab-strip">
                <div className="flex min-w-max">
                  {activeStage.formTabs.map((tab, idx) => (
                    <button key={tab} onClick={() => setActiveFormTab(idx)}
                      className={`px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-colors flex-shrink-0
                        ${activeFormTab === idx ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form content */}
              <div className="p-5">
                <FormTabContent
                  stage={activeStage}
                  tabName={activeStage.formTabs[activeFormTab]}
                  procType={procType}
                />
              </div>
            </Card>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => { if (activeStageId > 1) { setActiveStageId(activeStageId - 1); setActiveFormTab(0); } }}
                disabled={activeStageId <= 1}
                className="h-9 px-4 rounded-xl border border-black/10 text-xs flex items-center gap-1.5 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft className="h-3.5 w-3.5" /> Previous Stage
              </button>
              <span className="text-xs text-black/40">Stage {activeStageId} of {stages.length}</span>
              <button
                onClick={() => { if (activeStageId < stages.length) { act(`Stage ${activeStageId} completed`); setActiveStageId(activeStageId + 1); setActiveFormTab(0); } }}
                disabled={activeStageId >= stages.length}
                className="h-9 px-4 rounded-xl bg-black text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed">
                Next Stage <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── New Procurement Modal ─────────────────────────────────────── */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
              <h2 className="text-sm font-semibold text-black">Create New Procurement</h2>
              <button onClick={() => setShowNewModal(false)} className="text-black/30 hover:text-black"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-black/50 uppercase tracking-wide mb-1 block">Procurement Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(PROC_TYPE_CONFIG) as [ProcType, typeof PROC_TYPE_CONFIG[ProcType]][]).map(([key, c]) => {
                    const TIcon = c.icon;
                    return (
                      <button key={key} onClick={() => setNewProcType(key)}
                        className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all
                          ${newProcType === key ? "bg-black text-white border-black" : "bg-white text-black/60 border-black/10 hover:border-black/30"}`}>
                        <TIcon className="h-4 w-4" />
                        <div className="text-left">
                          <div className="font-semibold">{c.label}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-black/50 uppercase tracking-wide mb-1 block">Procurement Title</label>
                <input value={newProcTitle} onChange={e => setNewProcTitle(e.target.value)}
                  placeholder="Enter procurement title…"
                  className="w-full h-10 px-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-black/50 uppercase tracking-wide mb-1 block">Category</label>
                  <select className="w-full h-10 px-3 rounded-xl border border-black/10 text-sm focus:outline-none appearance-none bg-white">
                    {["Goods","Works","Services","Consultancy"].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-black/50 uppercase tracking-wide mb-1 block">Est. Value (USD)</label>
                  <input type="number" placeholder="0.00" className="w-full h-10 px-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t border-black/10">
              <button onClick={() => setShowNewModal(false)} className="flex-1 h-10 rounded-xl border border-black/10 text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => {
                if (!newProcTitle.trim()) { toast("Please enter a title", "error"); return; }
                setProcType(newProcType);
                setActiveStageId(1);
                setActiveFormTab(0);
                setShowNewModal(false);
                act(`New ${PROC_TYPE_CONFIG[newProcType].label} created: ${newProcTitle}`);
              }} className="flex-1 h-10 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800">
                Create {PROC_TYPE_CONFIG[newProcType].label}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Email Window ─────────────────────────────────────── */}
      <EmailWindow />
    </AppShell>
  );
}
