/**
 * HODBriefingTab — Head of Department Briefing Reports module.
 *
 * 8 domain sub-tabs × 4 period folders (Weekly/Monthly/Quarterly/Annual)
 * with accordion collapse, count badges, detail panel, Download & Print.
 * When clicking a week slot, shows HOD reports under: Operations, Projects,
 * Finance, Governance, Risk, Audits, Compliance — each viewable with
 * report, resolutions, minutes, chats, dates and time.
 */
import { useState, useCallback, useRef } from "react";
import {
  Building2, ChevronDown, ChevronRight, Calendar, Clock,
  BarChart3, Truck, Stethoscope, BookOpen, Zap, Droplets,
  Wrench, ShieldAlert, Download, Printer, FileText, CheckCircle,
  AlertCircle, Clock3, Circle, Paperclip, MessageSquare, ListChecks,
  Eye, Maximize2, X, Activity, Layers, Settings, AlertTriangle,
  Send, Users, FolderOpen, Filter, ArrowUp, Volume2, VolumeX,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import AIAssistantPanel from "./AIAssistantPanel";

// ── Filter options ────────────────────────────────────────────────────────
const HOD_MINISTRIES = [
  "All Ministries", "Finance & Economic Development", "Health & Child Care",
  "Education, Sport & Culture", "Transport & Infrastructural Development",
  "Energy & Power Development", "Water Resources & Sanitation",
  "Agriculture & Rural Resettlement", "Home Affairs & Cultural Heritage",
  "Justice, Legal & Parliamentary Affairs",
];
const HOD_FINANCIAL_YEARS = ["All Years", "FY 2026", "FY 2025", "FY 2024", "FY 2023"];
const HOD_DEPARTMENTS = [
  "All Departments", "Operations", "Finance", "Procurement",
  "Human Resources", "Audit & Compliance", "Legal Services",
  "Planning & Development", "ICT & Systems",
];

// ── Domain sub-tab definitions ─────────────────────────────────────────────
const DOMAIN_TABS = [
  { id: "hod-reports",    label: "H.O.D Briefing Reports",       Icon: Building2   },
  { id: "procurement",    label: "Procurement & Supply",          Icon: Truck       },
  { id: "finance",        label: "Finance & Budget",              Icon: BarChart3   },
  { id: "health",         label: "Health & Child Care",           Icon: Stethoscope },
  { id: "education",      label: "Education & Training",          Icon: BookOpen    },
  { id: "energy",         label: "Energy & Power",                Icon: Zap         },
  { id: "water",          label: "Water & Sanitation",            Icon: Droplets    },
  { id: "infrastructure", label: "Infrastructure & Works",        Icon: Wrench      },
  { id: "compliance",     label: "Compliance & Risk",             Icon: ShieldAlert },
] as const;

type DomainId = typeof DOMAIN_TABS[number]["id"];

// ── HOD Weekly Report domains (shown when a weekly slot is clicked) ────────
const HOD_REPORT_DOMAINS = [
  { id: "operations",  label: "Operations",  Icon: Activity    },
  { id: "projects",    label: "Projects",    Icon: Layers      },
  { id: "finance",     label: "Finance",     Icon: BarChart3   },
  { id: "governance",  label: "Governance",  Icon: Settings    },
  { id: "risk",        label: "Risk",        Icon: AlertTriangle },
  { id: "audits",      label: "Audits",      Icon: ShieldAlert },
  { id: "compliance",  label: "Compliance",  Icon: CheckCircle },
] as const;

type HodReportDomain = typeof HOD_REPORT_DOMAINS[number]["id"];

// ── HOD Report data builder ───────────────────────────────────────────────
interface HodReport {
  domain: HodReportDomain;
  title: string;
  preparedBy: string;
  date: string;
  time: string;
  status: "Approved" | "Pending" | "Under Review" | "Draft";
  pages: number;
  summary: string;
  resolutions: string[];
  minutes: { time: string; item: string }[];
}

function buildHodReport(domain: HodReportDomain, slot: number): HodReport {
  const domainLabel = HOD_REPORT_DOMAINS.find(d => d.id === domain)?.label ?? domain;
  const statuses: HodReport["status"][] = ["Approved", "Approved", "Under Review", "Pending", "Approved", "Draft", "Approved"];
  const date = `2026-${String(((slot - 1) % 12) + 1).padStart(2, "0")}-${String(((slot - 1) % 28) + 1).padStart(2, "0")}`;
  return {
    domain,
    title: `${domainLabel} — Week ${slot} Report`,
    preparedBy: `HOD — ${domainLabel} Unit`,
    date,
    time: "09:00",
    status: statuses[(slot + domain.length) % statuses.length],
    pages: 4 + (slot % 5),
    summary: `This ${domainLabel.toLowerCase()} report covers departmental activities for Week ${slot}. Key deliverables have been tracked against approved targets. Budget performance, staffing levels, and risk indicators have been assessed and summarised for executive review.`,
    resolutions: [
      `RESOLVED that the Week ${slot} ${domainLabel} Report be received and noted.`,
      `RESOLVED that the HOD table an action plan addressing the flagged issues within 10 working days.`,
      `RESOLVED that the Finance Officer confirm budget reallocation status by ${date}.`,
    ],
    minutes: [
      { time: "09:00", item: "Opening and quorum confirmation — 5/6 members present." },
      { time: "09:15", item: `${domainLabel} departmental briefing presented by HOD.` },
      { time: "09:45", item: "Discussion on key risks and action items." },
      { time: "10:00", item: "Budget variance review — underspend of 12% noted." },
      { time: "10:30", item: "Resolutions passed. Meeting adjourned." },
    ],
  };
}

// ── HOD Report Detail Panel ───────────────────────────────────────────────
function HodReportDetail({ report, onClose }: { report: HodReport; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"report" | "resolutions" | "minutes" | "chats">("report");
  const [chatMsg, setChatMsg] = useState("");
  const [chats, setChats] = useState([
    { author: "Director General", text: "Please ensure the risk section is updated before submission.", time: "08:30", mine: false },
    { author: "You", text: "Noted. Updated version will be ready by 10:00.", time: "08:45", mine: true },
  ]);

  const TABS_DEF = [
    { id: "report" as const, label: "Report", Icon: FileText },
    { id: "resolutions" as const, label: "Resolutions", Icon: ListChecks },
    { id: "minutes" as const, label: "Minutes", Icon: Clock },
    { id: "chats" as const, label: "Chats", Icon: MessageSquare },
  ];

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChats(p => [...p, { author: "You", text: chatMsg.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), mine: true }]);
    setChatMsg("");
  };

  const statusColor = report.status === "Approved" ? "bg-slate-100 text-[#0F172A]"
    : report.status === "Under Review" ? "bg-slate-100 text-[#0F172A]"
    : report.status === "Pending" ? "bg-slate-100 text-[#0F172A]"
    : "bg-gray-100 text-gray-600";

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0f172a] text-white flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 opacity-70 flex-shrink-0" />
          <span className="text-sm font-semibold truncate">{report.title}</span>
        </div>
        <button onClick={onClose} className="h-6 w-6 grid place-items-center rounded hover:bg-white/20 flex-shrink-0">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Metadata */}
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex-shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div><span className="text-[10px] font-semibold text-gray-400 uppercase block">Prepared By</span><span className="text-gray-700">{report.preparedBy}</span></div>
          <div><span className="text-[10px] font-semibold text-gray-400 uppercase block">Date &amp; Time</span><span className="text-gray-700">{report.date} · {report.time}</span></div>
          <div><span className="text-[10px] font-semibold text-gray-400 uppercase block">Pages</span><span className="text-gray-700">{report.pages} pages</span></div>
          <div><span className="text-[10px] font-semibold text-gray-400 uppercase block">Status</span><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor}`}>{report.status}</span></div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex border-b border-gray-100 flex-shrink-0">
        {TABS_DEF.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 -mb-px transition-colors flex-1 justify-center
              ${activeTab === id ? "border-slate-200 text-[#0F172A]" : "border-transparent text-gray-400 hover:text-gray-700"}`}>
            <Icon className="h-3 w-3" />{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        {activeTab === "report" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-600 leading-relaxed">{report.summary}</p>

            {/* Details section */}
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Details</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {[
                  { label: "Report Reference",   value: `HOD-${report.domain.toUpperCase()}-${report.date.replace(/-/g,"")}` },
                  { label: "Classification",      value: "CONFIDENTIAL — Internal Use Only" },
                  { label: "Reporting Period",    value: report.title.includes("Week") ? "Weekly" : "Monthly" },
                  { label: "Prepared By",         value: report.preparedBy },
                  { label: "Date & Time",         value: `${report.date} · ${report.time}` },
                  { label: "Status",              value: report.status },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-gray-200 rounded p-3 bg-white m-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</label>
                    <div className="text-xs text-gray-800">{value || "—"}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-[#0F172A]">
              <div className="font-bold mb-1">Key Highlights</div>
              <ul className="space-y-1 list-disc list-inside">
                <li>Budget utilisation: 74% of weekly allocation consumed</li>
                <li>2 deliverables completed on schedule</li>
                <li>1 risk item escalated to Director level</li>
                <li>Staff attendance: 94% this week</li>
              </ul>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => pushNotification(`Downloading: ${report.title}`, "success")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F172A] text-white text-xs font-semibold rounded-lg hover:bg-[#0F172A]">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
              <button onClick={() => pushNotification(`Printing: ${report.title}`, "info")}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50">
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
            </div>
          </div>
        )}
        {activeTab === "resolutions" && (
          <div className="space-y-3">
            {/* Details sub-section for resolutions */}
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Resolution Details</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {[
                  { label: "Meeting Reference",  value: `MTG-${report.domain.toUpperCase()}-${report.date}` },
                  { label: "Meeting Date",        value: `${report.date} at ${report.time}` },
                  { label: "Chairperson",         value: "Director General — " + report.preparedBy.replace("HOD — ", "") },
                  { label: "Quorum",              value: "7 of 9 members present" },
                  { label: "Total Resolutions",   value: `${report.resolutions.length} passed` },
                  { label: "Implementation Lead", value: report.preparedBy },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-gray-200 rounded p-3 bg-white m-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</label>
                    <div className="text-xs text-gray-800">{value || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Resolutions Passed</div>
            {report.resolutions.map((r, i) => (
              <div key={i} className="flex gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="h-5 w-5 rounded-full bg-[#0F172A] text-white text-[10px] font-bold grid place-items-center flex-shrink-0">{i + 1}</span>
                <span className="text-xs text-gray-700">{r}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === "minutes" && (
          <div className="space-y-3">
            {/* Details for minutes */}
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Minutes Details</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {[
                  { label: "Minutes Reference",  value: `MIN-${report.domain.toUpperCase()}-${report.date}` },
                  { label: "Date of Meeting",     value: report.date },
                  { label: "Start Time",          value: report.time },
                  { label: "End Time",            value: "11:00" },
                  { label: "Venue",               value: "Cabinet Boardroom — Munhumutapa Building" },
                  { label: "Minute Taker",        value: "Deputy Director — " + report.preparedBy.replace("HOD — ", "") },
                ].map(({ label, value }) => (
                  <div key={label} className="border border-gray-200 rounded p-3 bg-white m-1">
                    <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</label>
                    <div className="text-xs text-gray-800">{value || "—"}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Meeting Minutes</div>
            {report.minutes.map((m, i) => (
              <div key={i} className="flex gap-2 text-xs py-1.5 border-b border-gray-50 last:border-0">
                <span className="font-mono text-gray-400 flex-shrink-0 w-12">{m.time}</span>
                <span className="text-gray-700">{m.item}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === "chats" && (
          <div className="flex flex-col h-full min-h-[200px]">
            <div className="flex-1 space-y-2 mb-3">
              {chats.map((c, i) => (
                <div key={i} className={`flex gap-2 ${c.mine ? "flex-row-reverse" : ""}`}>
                  <div className={`h-6 w-6 rounded-full text-[9px] font-bold grid place-items-center flex-shrink-0 ${c.mine ? "bg-[#0F172A] text-white" : "bg-gray-200 text-gray-600"}`}>
                    {c.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div className={`flex flex-col ${c.mine ? "items-end" : "items-start"} max-w-[80%]`}>
                    {!c.mine && <span className="text-[9px] text-gray-400 mb-0.5">{c.author}</span>}
                    <div className={`px-2.5 py-1.5 text-[11px] rounded-xl ${c.mine ? "bg-[#0F172A] text-white" : "bg-gray-100 text-gray-800"}`}>{c.text}</div>
                    <span className="text-[9px] text-gray-400 mt-0.5">{c.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), sendChat())}
                placeholder="Send a message…"
                className="flex-1 h-8 px-3 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20" />
              <button onClick={sendChat} className="h-8 w-8 bg-[#0F172A] text-white rounded-lg grid place-items-center hover:bg-[#0F172A] flex-shrink-0">
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── HOD Weekly Reports Panel (shown when a weekly slot is selected) ────────
function HodWeeklyReportsPanel({ slot, onBack }: { slot: number; onBack: () => void }) {
  const [activeDomain, setActiveDomain] = useState<HodReportDomain>("operations");
  const [selectedReport, setSelectedReport] = useState<HodReport | null>(null);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Back + title */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] text-white flex-shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 text-xs font-semibold hover:bg-white/20 px-2 py-1 rounded">
          <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Back
        </button>
        <span className="text-sm font-bold">Week {slot} — HOD Reports</span>
        <span className="text-xs text-slate-300 ml-auto">Operations · Projects · Finance · Governance · Risk · Audits · Compliance</span>
      </div>

      {/* Domain sub-tabs */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 overflow-x-auto">
        <div className="flex px-3 py-1.5 gap-0.5 min-w-max">
          {HOD_REPORT_DOMAINS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => { setActiveDomain(id); setSelectedReport(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap rounded-lg transition-colors
                ${activeDomain === id ? "bg-[#0f172a] text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
              <Icon className="h-3 w-3" />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Two-column: report list | detail */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
        {/* Report list */}
        <div className="border-r border-gray-100 overflow-y-auto p-3">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
            {HOD_REPORT_DOMAINS.find(d => d.id === activeDomain)?.label} Reports — Week {slot}
          </div>
          <div className="space-y-1.5">
            {(["Report", "Summary", "Risk Register", "Action Plan", "Attachments"] as const).map((item, i) => {
              const report = buildHodReport(activeDomain, slot * 10 + i);
              const isSelected = selectedReport?.title === report.title;
              const statusColor = report.status === "Approved" ? "bg-slate-100 text-[#0F172A]"
                : report.status === "Under Review" ? "bg-slate-100 text-[#0F172A]"
                : report.status === "Pending" ? "bg-slate-100 text-[#0F172A]"
                : "bg-gray-100 text-gray-600";
              return (
                <button key={i} onClick={() => setSelectedReport({ ...report, title: `${HOD_REPORT_DOMAINS.find(d=>d.id===activeDomain)?.label} — ${item} (Week ${slot})` })}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors border
                    ${isSelected ? "bg-slate-50 border-slate-200" : "bg-white border-gray-100 hover:bg-gray-50"}`}>
                  <FolderOpen className={`h-4 w-4 flex-shrink-0 ${isSelected ? "text-[#0F172A]" : "text-gray-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-black truncate">{item}</div>
                    <div className="text-[10px] text-gray-400">{report.date} · {report.pages} pages</div>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${statusColor}`}>{report.status}</span>
                  <span className="text-[10px] font-semibold text-[#0F172A] flex-shrink-0">View</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="overflow-hidden p-3">
          {selectedReport ? (
            <HodReportDetail report={selectedReport} onClose={() => setSelectedReport(null)} />
          ) : (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-xl bg-white text-center p-6">
              <FileText className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-400">Click a report to view details</p>
              <p className="text-[11px] text-gray-300 mt-1">Report · Resolutions · Minutes · Chats</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Period folder definitions ──────────────────────────────────────────────
type Period = "weekly" | "monthly" | "quarterly" | "annual";

const PERIODS: Array<{
  id: Period;
  label: string;
  Icon: React.FC<{ className?: string }>;
  count: number;
  badge: string;
}> = [
  { id: "weekly",    label: "Weekly Reports",    Icon: Clock,    count: 48, badge: "48" },
  { id: "monthly",   label: "Monthly Reports",   Icon: Calendar, count: 12, badge: "12" },
  { id: "quarterly", label: "Quarterly Reports", Icon: BarChart3, count: 4, badge: "4"  },
  { id: "annual",    label: "Annual Reports",    Icon: FileText,  count: 1, badge: "1"  },
];

// ── Status type ────────────────────────────────────────────────────────────
type DocStatus = "Approved" | "Draft" | "Under Review" | "Pending";

interface BriefingDoc {
  domain: DomainId;
  period: Period;
  label: string;
  slot: number;
  status: DocStatus;
  preparedBy: string;
  date: string;
  pages: number;
  size: string;
}

// ── Deterministic status spread helper ────────────────────────────────────
function getStatus(slot: number, period: Period): DocStatus {
  const map: Record<Period, DocStatus[]> = {
    weekly:    ["Approved", "Approved", "Under Review", "Draft", "Approved", "Pending"],
    monthly:   ["Approved", "Approved", "Under Review", "Draft", "Approved", "Approved",
                "Approved", "Under Review", "Draft", "Approved", "Pending", "Approved"],
    quarterly: ["Approved", "Approved", "Under Review", "Draft"],
    annual:    ["Approved"],
  };
  const arr = map[period];
  return arr[(slot - 1) % arr.length];
}

// ── Sparse-data placeholder labels (Monthly) ─────────────────────────────
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ── Build slot label ───────────────────────────────────────────────────────
function slotLabel(period: Period, slot: number): string {
  switch (period) {
    case "weekly":    return `Week ${slot}`;
    case "monthly":   return `${MONTH_NAMES[slot - 1]} (Month ${slot})`;
    case "quarterly": return `Quarter ${slot} (Q${slot})`;
    case "annual":    return "Annual Report 2026";
  }
}

// ── Build a mock BriefingDoc for a given domain/period/slot ───────────────
function buildDoc(domain: DomainId, period: Period, slot: number): BriefingDoc {
  const domainLabel = DOMAIN_TABS.find(d => d.id === domain)?.label ?? domain;
  return {
    domain,
    period,
    label: slotLabel(period, slot),
    slot,
    status: getStatus(slot, period),
    preparedBy: `HOD — ${domainLabel.split(" ")[0]} Dept`,
    date: `${2026}-${String(((slot - 1) % 12) + 1).padStart(2, "0")}-01`,
    pages: 4 + (slot % 6),
    size: `${(1.2 + (slot % 8) * 0.3).toFixed(1)} MB`,
  };
}

// ── Status badge config ────────────────────────────────────────────────────
const STATUS_CONFIG: Record<DocStatus, { bg: string; text: string; dot: string; Icon: React.FC<{ className?: string }> }> = {
  "Approved":     { bg: "bg-slate-50",  text: "text-[#0F172A]", dot: "bg-[#0F172A]", Icon: CheckCircle  },
  "Draft":        { bg: "bg-gray-50",     text: "text-gray-600",    dot: "bg-gray-400",    Icon: Circle       },
  "Under Review": { bg: "bg-slate-50",    text: "text-[#0F172A]",   dot: "bg-[#0F172A]",   Icon: Clock3       },
  "Pending":      { bg: "bg-slate-50",     text: "text-[#0F172A]",    dot: "bg-[#0F172A]",    Icon: AlertCircle  },
};

// ── StatusBadge component ──────────────────────────────────────────────────
function StatusBadge({ status }: { status: DocStatus }) {
  const cfg = STATUS_CONFIG[status];
  const { Icon } = cfg;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

// ── Detail Panel ───────────────────────────────────────────────────────────
function DetailPanel({ doc, onClose }: { doc: BriefingDoc; onClose: () => void }) {
  const domainLabel = DOMAIN_TABS.find(d => d.id === doc.domain)?.label ?? doc.domain;
  const periodLabel = PERIODS.find(p => p.id === doc.period)?.label ?? doc.period;
  const [activeSection, setActiveSection] = useState<"summary" | "minutes" | "attachments">("summary");
  const [fullscreen, setFullscreen] = useState(false);

  // Build deterministic timestamps from doc data
  const createdTime = `${doc.date} 08:30`;
  const submittedTime = `${doc.date} 14:15`;
  const approvedTime = doc.status === "Approved" ? `${doc.date} 16:00` : null;

  function handleDownload() { pushNotification(`Downloading: ${doc.label}`, "success"); }
  function handlePrint()    { pushNotification(`Sending to printer: ${doc.label}`, "info"); }

  const SECTIONS = [
    { id: "summary"     as const, label: "Briefing Summary",        Icon: FileText      },
    { id: "minutes"     as const, label: "Minutes & Resolutions",   Icon: ListChecks    },
    { id: "attachments" as const, label: "Attachments",             Icon: Paperclip     },
  ];

  const MOCK_ATTACHMENTS = [
    { name: `${doc.label} — Full Report.pdf`,          size: doc.size,                 type: "pdf"  },
    { name: `${doc.label} — Annexure A.xlsx`,          size: "0.4 MB",                 type: "xlsx" },
    { name: `${doc.label} — Presentation Slides.pptx`, size: "2.1 MB",                type: "pptx" },
  ];

  return (
    <div className={`border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col ${fullscreen ? "fixed inset-4 z-50 shadow-2xl" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0F172A] text-white flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="h-4 w-4 opacity-80 flex-shrink-0" />
          <span className="text-sm font-semibold truncate">{doc.label}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setFullscreen(f => !f)} aria-label="Toggle fullscreen"
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50">
            {fullscreen ? <X className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          <button onClick={onClose} aria-label="Close detail panel"
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50">
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </div>

      {/* Metadata strip — time/date stamped */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex-shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Domain</span>
            <span className="text-gray-700 font-medium">{domainLabel}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Period</span>
            <span className="text-gray-700 font-medium">{periodLabel}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Approval Status</span>
            <StatusBadge status={doc.status} />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Prepared By</span>
            <span className="text-gray-700">{doc.preparedBy}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Created</span>
            <span className="text-gray-700 flex items-center gap-1"><Clock className="h-3 w-3 inline text-gray-400" /> {createdTime}</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Submitted</span>
            <span className="text-gray-700 flex items-center gap-1"><Clock className="h-3 w-3 inline text-gray-400" /> {submittedTime}</span>
          </div>
          {approvedTime && (
            <div>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Approved</span>
              <span className="text-[#0F172A] flex items-center gap-1"><CheckCircle className="h-3 w-3 inline" /> {approvedTime}</span>
            </div>
          )}
          <div>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">Pages / Size</span>
            <span className="text-gray-700">{doc.pages} pages · {doc.size}</span>
          </div>
        </div>
      </div>

      {/* Document preview (inline) */}
      <div className="px-4 pt-3 flex-shrink-0">
        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-200 h-28 flex items-center justify-center relative group cursor-pointer"
          onClick={() => pushNotification(`Opening preview: ${doc.label}`, "info")}>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 gap-1.5">
            <FileText className="h-8 w-8 opacity-40" />
            <span className="text-xs font-medium opacity-60">{doc.label} — {doc.pages} pages</span>
            <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded flex items-center gap-1"><Eye className="h-3 w-3" /> Preview</span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded flex items-center gap-1"><Maximize2 className="h-3 w-3" /> Full Screen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex border-b border-gray-100 px-4 mt-3 flex-shrink-0">
        {SECTIONS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setActiveSection(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold border-b-2 -mb-px transition-colors ${
              activeSection === id ? "border-slate-200 text-[#0F172A]" : "border-transparent text-gray-400 hover:text-gray-700"
            }`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">

        {activeSection === "summary" && (
          <div className="space-y-3 text-sm text-gray-700">
            <p className="text-xs text-gray-500 leading-relaxed">
              This briefing covers departmental performance, key deliverables, and outstanding action items
              for the {periodLabel.toLowerCase()} period. The report was prepared by {doc.preparedBy} and
              submitted on {submittedTime}.
            </p>
            {[
              { heading: "Key Highlights",     text: "All major procurement targets met. Three contracts awarded under competitive bidding. Budget utilisation at 78% of allocation." },
              { heading: "Issues & Risks",      text: "Two supplier deliveries delayed due to transport constraints. Escalation to logistics unit in progress." },
              { heading: "Recommendations",     text: "Approve reallocation of underspent Q2 budget to infrastructure maintenance line. Review supplier performance quarterly." },
            ].map(s => (
              <div key={s.heading}>
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{s.heading}</div>
                <div className="text-xs text-gray-600 leading-relaxed">{s.text}</div>
              </div>
            ))}
          </div>
        )}

        {activeSection === "minutes" && (
          <div className="space-y-3">
            <div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Meeting Minutes</div>
              <div className="space-y-2">
                {[
                  { time: "09:00", item: "Opening & quorum confirmation — Chair confirmed quorum of 7/9 members present." },
                  { time: "09:15", item: "Adoption of previous minutes — Adopted without amendment." },
                  { time: "09:30", item: `${domainLabel} departmental briefing — ${doc.preparedBy} presented the ${doc.label}.` },
                  { time: "10:15", item: "Q&A and discussion — Three members raised clarifications on budget reallocation." },
                  { time: "10:45", item: "Resolutions passed — See resolutions below." },
                  { time: "11:00", item: "Adjournment." },
                ].map(m => (
                  <div key={m.time} className="flex gap-2 text-xs">
                    <span className="font-mono text-gray-400 flex-shrink-0 w-10">{m.time}</span>
                    <span className="text-gray-600">{m.item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Resolutions</div>
              <div className="space-y-1.5">
                {[
                  "RESOLVED that the briefing report be received and noted.",
                  "RESOLVED that the budget reallocation proposal be referred to the Finance Committee for review by end of month.",
                  "RESOLVED that the procurement officer submit a supplier performance report within 14 working days.",
                ].map((r, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span className="h-4 w-4 rounded-full bg-slate-100 text-[#0F172A] font-bold grid place-items-center flex-shrink-0 text-[10px] mt-0.5">{i + 1}</span>
                    <span className="text-gray-600">{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === "attachments" && (
          <div className="space-y-2">
            {MOCK_ATTACHMENTS.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={() => pushNotification(`Opening: ${a.name}`, "info")}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`h-7 w-7 rounded-lg grid place-items-center flex-shrink-0 ${
                    a.type === "pdf" ? "bg-red-100 text-red-600" : a.type === "xlsx" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"
                  }`}>
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-700 truncate">{a.name}</div>
                    <div className="text-[10px] text-gray-400">{a.size}</div>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                  className="h-6 w-6 rounded-lg hover:bg-slate-100 text-gray-400 hover:text-[#0F172A] grid place-items-center flex-shrink-0 transition-colors">
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {/* Comments to presenter */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Questions / Comments to Presenter
              </div>
              <textarea rows={3} placeholder="Leave a question or comment directed to the report presenter…"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/30" />
              <button className="mt-1.5 h-7 px-3 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#0F172A] transition-colors">
                Submit Comment
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-4 pt-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
        <button onClick={handleDownload}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#0F172A] hover:bg-[#0F172A] text-white text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 focus:ring-offset-1"
          aria-label={`Download ${doc.label}`}>
          <Download className="h-3.5 w-3.5" /> Download
        </button>
        <button onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
          aria-label={`Print ${doc.label}`}>
          <Printer className="h-3.5 w-3.5" /> Print
        </button>
        <button onClick={() => pushNotification(`Opening full preview: ${doc.label}`, "info")}
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200 transition-colors">
          <Maximize2 className="h-3.5 w-3.5" /> Full Screen
        </button>
      </div>
    </div>
  );
}

// ── Period Accordion folder ────────────────────────────────────────────────
interface PeriodFolderProps {
  domain: DomainId;
  period: (typeof PERIODS)[number];
  isOpen: boolean;
  onToggle: () => void;
  selectedDoc: BriefingDoc | null;
  onSelectDoc: (doc: BriefingDoc) => void;
}

function PeriodFolder({ domain, period, isOpen, onToggle, selectedDoc, onSelectDoc }: PeriodFolderProps) {
  const { Icon } = period;
  const slots = Array.from({ length: period.count }, (_, i) => i + 1);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Accordion header */}
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className={`w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0F172A]/20 ${
          isOpen ? "bg-slate-50 border-b border-slate-200" : "bg-white hover:bg-gray-50"
        }`}
      >
        <Icon className={`h-4 w-4 flex-shrink-0 ${isOpen ? "text-[#0F172A]" : "text-gray-400"}`} />
        <span className={`text-sm font-semibold flex-1 ${isOpen ? "text-[#0F172A]" : "text-gray-700"}`}>
          {period.label}
        </span>
        {/* Count badge */}
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          isOpen ? "bg-[#0F172A] text-white" : "bg-gray-100 text-gray-500"
        }`}>
          {period.badge}
        </span>
        {/* Chevron */}
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#0F172A]" : "text-gray-400"
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Accordion body */}
      {isOpen && (
        <div
          className="bg-white"
          role="region"
          aria-label={`${period.label} list`}
        >
          <ul className="max-h-64 overflow-y-auto divide-y divide-gray-50">
            {slots.map(slot => {
              const doc = buildDoc(domain, period.id, slot);
              const isSelected = selectedDoc?.domain === domain &&
                                 selectedDoc?.period === period.id &&
                                 selectedDoc?.slot === slot;
              const cfg = STATUS_CONFIG[doc.status];
              return (
                <li key={slot}>
                  <button
                    onClick={() => onSelectDoc(doc)}
                    aria-selected={isSelected}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0F172A]/20 ${
                      isSelected
                        ? "bg-slate-50 text-[#0F172A]"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {/* Status dot */}
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${cfg.dot}`} aria-hidden="true" />
                    {/* Label — truncate for long monthly names */}
                    <span className="flex-1 truncate text-[13px]">{doc.label}</span>
                    {/* Status badge (compact) */}
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text} flex-shrink-0`}>
                      {doc.status}
                    </span>
                    {/* Weekly: hint to open HOD reports */}
                    {period.id === "weekly" && (
                      <span className="text-[9px] font-bold text-slate-600 flex-shrink-0 flex items-center gap-0.5">
                        HOD Reports <ChevronRight className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Main HOD Briefing Tab ─────────────────────────────────────────────────
export default function HODBriefingTab() {
  // Default to first domain sub-tab
  const [activeDomain, setActiveDomain] = useState<DomainId>("hod-reports");

  // When a weekly slot is clicked, show the HOD weekly reports panel
  const [weeklyPanel, setWeeklyPanel] = useState<{ slot: number } | null>(null);

  // Filter state
  const [ministry, setMinistry] = useState("All Ministries");
  const [financialYear, setFinancialYear] = useState("FY 2026");
  const [department, setDepartment] = useState("All Departments");
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Scroll-to-top
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) setShowScrollTop(el.scrollTop > 120);
  }, []);
  const scrollToTop = () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  // Per-domain open accordion state: Map<DomainId, Set<Period>>
  const [openFolders, setOpenFolders] = useState<Record<DomainId, Set<Period>>>(() => {
    const init = {} as Record<DomainId, Set<Period>>;
    for (const d of DOMAIN_TABS) {
      init[d.id] = d.id === "hod-reports" ? new Set<Period>(["weekly"]) : new Set<Period>();
    }
    return init;
  });

  // Per-domain selected document (preserves state across sub-tab switches)
  const [selectedDocs, setSelectedDocs] = useState<Partial<Record<DomainId, BriefingDoc>>>({});

  const toggleFolder = useCallback((domain: DomainId, period: Period) => {
    setOpenFolders(prev => {
      const current = new Set(prev[domain]);
      if (current.has(period)) {
        current.delete(period);
      } else {
        current.add(period);
      }
      return { ...prev, [domain]: current };
    });
  }, []);

  const selectDoc = useCallback((domain: DomainId, doc: BriefingDoc) => {
    setSelectedDocs(prev => ({ ...prev, [domain]: doc }));
  }, []);

  const closeDetail = useCallback((domain: DomainId) => {
    setSelectedDocs(prev => {
      const next = { ...prev };
      delete next[domain];
      return next;
    });
  }, []);

  const selectedDoc = selectedDocs[activeDomain] ?? null;
  const domainFolders = openFolders[activeDomain];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-gray-50">

      {/* ── Domain sub-tab strip ── */}
      <div
        className="flex-shrink-0 bg-white border-b border-gray-100 overflow-x-auto"
        role="tablist"
        aria-label="HOD Briefing domain sub-tabs"
      >
        <div className="flex px-3 gap-0.5 py-1.5 min-w-max">
          {DOMAIN_TABS.map(({ id, label, Icon }) => {
            const isActive = activeDomain === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveDomain(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 focus:ring-offset-1 ${
                  isActive
                    ? "bg-[#0F172A] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filter bar ── */}
      {!weeklyPanel && (
        <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-2 flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">Filters:</span>

          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Ministry</label>
            <select value={ministry} onChange={e => setMinistry(e.target.value)}
              className="h-7 px-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20 min-w-[180px]">
              {HOD_MINISTRIES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Financial Year</label>
            <select value={financialYear} onChange={e => setFinancialYear(e.target.value)}
              className="h-7 px-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20">
              {HOD_FINANCIAL_YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Department</label>
            <select value={department} onChange={e => setDepartment(e.target.value)}
              className="h-7 px-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20 min-w-[160px]">
              {HOD_DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          {/* Active filter chips */}
          <div className="flex items-center gap-1.5 ml-auto flex-wrap">
            {ministry !== "All Ministries" && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-[#0F172A] text-[10px] font-semibold rounded-full">
                {ministry.split(" ")[0]}…
                <button onClick={() => setMinistry("All Ministries")} className="hover:text-red-600 ml-0.5">×</button>
              </span>
            )}
            {financialYear !== "FY 2026" && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-[#0F172A] text-[10px] font-semibold rounded-full">
                {financialYear}
                <button onClick={() => setFinancialYear("FY 2026")} className="hover:text-red-600 ml-0.5">×</button>
              </span>
            )}
            {department !== "All Departments" && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-[#0F172A] text-[10px] font-semibold rounded-full">
                {department.split(" ")[0]}…
                <button onClick={() => setDepartment("All Departments")} className="hover:text-red-600 ml-0.5">×</button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── AI Briefing Information Bar with Audio Toggle ── */}
      {!weeklyPanel && (
        <div className="flex-shrink-0 bg-[#0f172a] border-b border-slate-200/20 px-4 py-2 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#0F172A] grid place-items-center flex-shrink-0">
            <AlertTriangle className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white italic">
              AI Analysis: {DOMAIN_TABS.find(d => d.id === activeDomain)?.label} — {ministry !== "All Ministries" ? ministry.split(" ")[0] : "All Ministries"} · {financialYear}. Departmental performance tracking active. 3 reports require immediate HOD review.
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-1.5 py-0.5 bg-[#0F172A] text-white text-[9px] font-bold rounded">HOD REPORTS</span>
              <span className="text-[10px] text-slate-400">Updated 5 minutes ago</span>
            </div>
          </div>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
              audioEnabled ? "bg-[#0F172A] text-white" : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
            title={audioEnabled ? "Disable AI Audio" : "Enable AI Audio"}
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      )}

      {/* ── Main content area ── */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {/* If a weekly slot was clicked, show the HOD weekly reports panel */}
        {weeklyPanel ? (
          <HodWeeklyReportsPanel slot={weeklyPanel.slot} onBack={() => setWeeklyPanel(null)} />
        ) : (
          <div ref={scrollRef} onScroll={handleScroll} className="overflow-y-auto flex-1">
            <div className="max-w-6xl mx-auto p-4 sm:p-6">

              {/* Section title */}
              <div className="mb-4 flex items-center gap-2">
                {(() => {
                  const tab = DOMAIN_TABS.find(d => d.id === activeDomain)!;
                  const { Icon } = tab;
                  return (
                    <>
                      <Icon className="h-5 w-5 text-[#0F172A]" />
                      <div>
                        <h2 className="text-base font-bold text-gray-900">{tab.label}</h2>
                        <p className="text-[11px] text-gray-500">Head of Department Briefing Reports — select a period folder to view slots. Click any <strong>Weekly</strong> entry to view HOD reports by domain.</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Two-column layout on lg+: folders left, detail right */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* ── Period folders ── */}
                <div className="space-y-2">
                  {PERIODS.map(period => (
                    <PeriodFolder
                      key={period.id}
                      domain={activeDomain}
                      period={period}
                      isOpen={domainFolders.has(period.id)}
                      onToggle={() => toggleFolder(activeDomain, period.id)}
                      selectedDoc={selectedDoc}
                      onSelectDoc={(doc) => {
                        // Weekly period: clicking opens the HOD domain reports panel
                        if (doc.period === "weekly") {
                          setWeeklyPanel({ slot: doc.slot });
                        } else {
                          selectDoc(activeDomain, doc);
                        }
                      }}
                    />
                  ))}
                </div>

                {/* ── Detail panel ── */}
                <div>
                  {selectedDoc ? (
                    <DetailPanel
                      doc={selectedDoc}
                      onClose={() => closeDetail(activeDomain)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-200 rounded-xl bg-white text-center p-6">
                      <FileText className="h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-sm font-medium text-gray-400">Select a report to view details</p>
                      <p className="text-[11px] text-gray-300 mt-1">Weekly entries open HOD domain reports · Other periods show document detail</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ── Scroll-to-top bar ── */}
        {showScrollTop && !weeklyPanel && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-white">
            <button onClick={scrollToTop}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors">
              <ArrowUp className="h-3.5 w-3.5" />
              Scroll to top
            </button>
          </div>
        )}
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        agentName="HOD Brief AI"
        agentRole="Department briefing analysis and reporting intelligence"
        context={`${DOMAIN_TABS.find(d => d.id === activeDomain)?.label ?? "HOD Briefing"} module`}
        suggestedPrompts={[
          "Summarize this week's HOD reports",
          "Which departments have overdue reports?",
          "Generate a consolidated briefing report",
          "Show budget utilisation by department",
          "List all pending resolutions",
        ]}
        color="blue"
      />
    </div>
  );
}
