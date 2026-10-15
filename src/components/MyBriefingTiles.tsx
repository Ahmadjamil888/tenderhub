/**
 * MyBriefingTiles — "My Briefing" tab content.
 * 6 tiles in a blue theme:
 *   1. My Calendar (interactive — navigate months, click dates)
 *   2. My To-Do List (checkable items)
 *   3. My Mails (inbox preview)
 *   4. Alerts & Notifications
 *   5. My Contact Cards (business cards with phone/email/org)
 *   6. Briefing Cards (list → document view → minister comment form → approve/reject/return/clarify)
 */
import { useState, useRef, useCallback } from "react";
import {
  Calendar, Clock, Mail, Bell, Users, FileText,
  ChevronLeft, ChevronRight, X, Phone, AtSign,
  Building2, CheckCircle2, XCircle, RotateCcw, HelpCircle,
  Filter, ArrowUp, Volume2, VolumeX, AlertTriangle,
} from "lucide-react";
import AIAssistantPanel from "./AIAssistantPanel";

// ── Filter option data ─────────────────────────────────────────────────────
const MY_MINISTRIES = [
  "All Ministries", "Finance & Economic Development", "Health & Child Care",
  "Education, Sport & Culture", "Transport & Infrastructural Development",
  "Energy & Power Development", "Water Resources & Sanitation",
  "Agriculture & Rural Resettlement", "Home Affairs & Cultural Heritage",
];
const MY_FINANCIAL_YEARS = ["All Years", "FY 2026", "FY 2025", "FY 2024", "FY 2023"];
const MY_DEPARTMENTS = [
  "All Departments", "Minister's Office", "Treasury", "Procurement",
  "Audit & Compliance", "Legal Services", "Planning & Development",
];

// ─── Shared tile header ────────────────────────────────────────────────────
function TileHead({ icon, title, badge }: {
  icon: React.ReactNode;
  title: string;
  badge?: number;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-slate-200">
      <div className="h-8 w-8 rounded-lg bg-[#0F172A] flex items-center justify-center flex-shrink-0 shadow-sm">
        {icon}
      </div>
      <span className="text-[11px] font-bold uppercase tracking-widest text-[#0F172A] flex-1">{title}</span>
      {badge !== undefined && badge > 0 && (
        <span className="h-5 min-w-[20px] px-1 rounded-full bg-[#0F172A] text-white text-[9px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── TILE 1: Interactive Calendar ─────────────────────────────────────────
const CAL_EVENTS: Record<string, { label: string; color: string }[]> = {
  "2026-07-07": [{ label: "Cabinet Meeting",         color: "bg-[#0F172A]"   }],
  "2026-07-09": [{ label: "Procurement Review",      color: "bg-[#0F172A]" }],
  "2026-07-10": [{ label: "Board Pack Sign-off",     color: "bg-[#0F172A]"    }],
  "2026-07-14": [{ label: "Ministry Visit — Energy", color: "bg-[#0F172A]"   }],
  "2026-07-16": [{ label: "Vendor Performance Mtg",  color: "bg-slate-400"   }],
  "2026-07-21": [{ label: "Budget Submission Due",   color: "bg-red-500"    }],
  "2026-07-24": [{ label: "Q3 Audit Committee",      color: "bg-[#0F172A]" }],
  "2026-07-28": [{ label: "ZACC Referral Review",    color: "bg-[#0F172A]"  }],
};

function CalendarTile() {
  const today = new Date(2026, 6, 7); // July 7 2026
  const [viewDate, setViewDate] = useState(new Date(2026, 6, 1));
  const [selectedDay, setSelectedDay] = useState<string>("2026-07-07");

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = (firstDow + 6) % 7; // shift to Mon-start
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: startOffset + daysInMonth }, (_, i) =>
    i < startOffset ? null : i - startOffset + 1
  );
  // pad to 6 rows
  while (cells.length % 7 !== 0) cells.push(null);

  function pad(d: number) { return `${year}-${String(month + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`; }

  const selectedEvents = selectedDay ? (CAL_EVENTS[selectedDay] ?? []) : [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3">
      <TileHead icon={<Calendar className="h-4 w-4 text-white"/>} title="My Calendar"/>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20">
          <ChevronLeft className="h-4 w-4 text-slate-600"/>
        </button>
        <span className="text-xs font-bold text-[#0F172A]">{monthLabel}</span>
        <button onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="h-7 w-7 rounded-lg hover:bg-slate-50 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20">
          <ChevronRight className="h-4 w-4 text-slate-600"/>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center">
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
          <div key={d} className="text-[9px] font-bold text-slate-400 pb-1">{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i}/>;
          const key = pad(day);
          const hasEvent = !!CAL_EVENTS[key];
          const isToday  = today.getFullYear()===year && today.getMonth()===month && today.getDate()===day;
          const isSel    = selectedDay === key;
          return (
            <button key={i} onClick={() => setSelectedDay(key)}
              className={`h-8 w-full rounded-lg text-[11px] font-semibold flex flex-col items-center justify-center relative transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20
                ${isSel ? "bg-[#0F172A] text-white shadow-sm"
                : isToday ? "bg-slate-100 text-[#0F172A] font-bold"
                : "hover:bg-slate-50 text-[#0F172A]"}`}>
              {day}
              {hasEvent && !isSel && (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[#0F172A]"/>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      {selectedDay && (
        <div className="border-t border-slate-200 pt-2 space-y-1">
          {selectedEvents.length === 0
            ? <p className="text-[10px] text-slate-400 text-center">No events on this date</p>
            : selectedEvents.map((ev, i) => (
                <div key={i} className={`${ev.color} text-white text-[10px] font-semibold px-2 py-1 rounded-md truncate`}>
                  {ev.label}
                </div>
              ))
          }
        </div>
      )}
    </div>
  );
}

// ─── TILE 2: To-Do List ────────────────────────────────────────────────────
const INITIAL_TODOS = [
  { id: 1, time: "09:00", task: "Approve Solar Mini-Grid award",            done: false, priority: "high"   },
  { id: 2, time: "10:30", task: "Review ZACC referral pack",                done: false, priority: "high"   },
  { id: 3, time: "11:00", task: "Prep Q3 budget submission",                done: false, priority: "medium" },
  { id: 4, time: "14:00", task: "Sign INV-2026-4821 payment authority",     done: true,  priority: "medium" },
  { id: 5, time: "15:30", task: "Cabinet committee — Infrastructure brief", done: false, priority: "low"    },
  { id: 6, time: "16:00", task: "Vendor portal review — procurement list",  done: true,  priority: "low"    },
];

const PRIORITY_DOT: Record<string, string> = {
  high:   "bg-red-400",
  medium: "bg-slate-400",
  low:    "bg-slate-300",
};

function TodoTile() {
  const [todos, setTodos] = useState(INITIAL_TODOS);
  const pending = todos.filter(t => !t.done).length;

  function toggle(id: number) {
    setTodos(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">
      <TileHead icon={<Clock className="h-4 w-4 text-white"/>} title="My To-Do List" badge={pending}/>
      <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 240 }}>
        {todos.map(t => (
          <div key={t.id}
            onClick={() => toggle(t.id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-all select-none
              ${t.done ? "border-slate-200 bg-gray-50 opacity-60" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`}>
            <span className={`h-2 w-2 rounded-full flex-shrink-0 mt-0.5 ${PRIORITY_DOT[t.priority]}`}/>
            <div className={`h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0
              ${t.done ? "bg-[#0F172A] border-slate-200" : "border-slate-200 bg-white"}`}>
              {t.done && <span className="text-white text-[8px] font-black">✓</span>}
            </div>
            <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">{t.time}</span>
            <span className={`text-[11px] flex-1 ${t.done ? "line-through text-gray-400" : "text-[#0F172A] font-medium"}`}>
              {t.task}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TILE 3: My Mails ─────────────────────────────────────────────────────
const MAILS = [
  { id: 1, from: "Treasury Secretary",   subject: "Q3 Budget Submission Deadline",       time: "07:22", read: false, body: "Please submit Q3 budget estimates by Friday 10 July 2026. Treasury requires all ministry submissions in the prescribed format." },
  { id: 2, from: "Chief Procurement",   subject: "Solar Mini-Grid Award Recommendation", time: "08:14", read: false, body: "The evaluation committee recommends award to SunPower Zimbabwe Ltd at USD 14.8M. Please provide ministerial approval to proceed." },
  { id: 3, from: "Auditor-General",     subject: "ZACC Referral — VEN-00476",            time: "08:41", read: true,  body: "Ghost vendor pattern confirmed. ZACC referral pack attached for your review and signature before submission." },
  { id: 4, from: "PS Health",           subject: "ARV Stockout Critical Alert",          time: "09:02", read: false, body: "Three ARV lines are at critically low stock. Emergency procurement request submitted to PRAZ — requires HOD co-signature." },
  { id: 5, from: "World Bank Mission",  subject: "Project Disbursement Schedule",        time: "09:35", read: true,  body: "Revised disbursement schedule for the USD 120M infrastructure project attached. Please confirm minister's endorsement." },
  { id: 6, from: "Cabinet Secretariat", subject: "Cabinet Agenda — 9 July 2026",        time: "10:05", read: false, body: "Cabinet meeting convened for 9 July at 10:00 hrs. Ministry briefing notes due by COB 8 July." },
];

function MailsTile() {
  const [mails, setMails] = useState(MAILS);
  const [open, setOpen]   = useState<typeof MAILS[0] | null>(null);
  const unread = mails.filter(m => !m.read).length;

  function openMail(m: typeof MAILS[0]) {
    setMails(ms => ms.map(x => x.id === m.id ? { ...x, read: true } : x));
    setOpen(m);
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">
      <TileHead icon={<Mail className="h-4 w-4 text-white"/>} title="My Mails" badge={unread}/>

      {open ? (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-[#0F172A]">{open.subject}</div>
              <div className="text-[10px] text-slate-600">From: {open.from} · {open.time}</div>
            </div>
            <button onClick={() => setOpen(null)}
              className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center flex-shrink-0 hover:bg-slate-200 transition-colors">
              <X className="h-3.5 w-3.5 text-[#0F172A]"/>
            </button>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-[#0F172A] leading-relaxed border border-slate-200">
            {open.body}
          </div>
          <div className="flex gap-2">
            <button className="flex-1 h-7 bg-[#0F172A] hover:bg-[#0F172A] text-white text-[10px] font-bold rounded-lg transition-colors">Reply</button>
            <button className="flex-1 h-7 border border-slate-200 hover:bg-slate-50 text-[#0F172A] text-[10px] font-bold rounded-lg transition-colors">Forward</button>
          </div>
        </div>
      ) : (
        <div className="space-y-1 overflow-y-auto" style={{ maxHeight: 240 }}>
          {mails.map(m => (
            <div key={m.id} onClick={() => openMail(m)}
              className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer transition-colors
                ${m.read ? "hover:bg-gray-50" : "bg-slate-50 hover:bg-slate-100 border-l-2 border-slate-200"}`}>
              <div className="h-7 w-7 rounded-full bg-[#0F172A] flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-white">{m.from[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[11px] truncate ${m.read ? "text-gray-600" : "font-bold text-[#0F172A]"}`}>{m.from}</div>
                <div className="text-[10px] text-slate-400 truncate">{m.subject}</div>
              </div>
              <span className="text-[9px] font-mono text-slate-400 flex-shrink-0">{m.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TILE 4: Alerts ───────────────────────────────────────────────────────
const ALERTS_DATA = [
  { msg: "Ghost vendor pattern detected — ZACC referral pending urgent action", level: "critical" },
  { msg: "Solar Mini-Grid tender closing in 48 hours — no award issued yet",    level: "critical" },
  { msg: "Infrastructure Div approaching 88% budget ceiling",                   level: "critical" },
  { msg: "Budget submission reminder — 3 days remaining to deadline",           level: "warning"  },
  { msg: "Q3 Cabinet meeting rescheduled to Friday 10 July",                    level: "warning"  },
  { msg: "3 ARV medicines at critically low stock — emergency proc. raised",    level: "critical" },
  { msg: "API health check OK — 10 days continuous uptime",                     level: "info"     },
  { msg: "Vendor portal uptime normal — no incidents in 2 days",                level: "info"     },
  { msg: "Dashboard load performance OK for 3 consecutive days",                level: "info"     },
];

const ALERT_STYLE: Record<string, { bar: string; bg: string; dot: string; label: string; labelColor: string }> = {
  critical: { bar: "border-red-400",    bg: "bg-red-50",     dot: "bg-red-400",    label: "CRITICAL", labelColor: "text-red-600"    },
  warning:  { bar: "border-amber-400",  bg: "bg-amber-50",   dot: "bg-amber-400",  label: "WARN",     labelColor: "text-amber-700"  },
  info:     { bar: "border-blue-300",   bg: "bg-blue-50",    dot: "bg-blue-400",   label: "INFO",     labelColor: "text-blue-700"   },
};

function AlertsTile() {
  const critCount = ALERTS_DATA.filter(a => a.level === "critical").length;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">
      <TileHead icon={<Bell className="h-4 w-4 text-white"/>} title="Alerts & Notifications" badge={critCount}/>
      <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 250 }}>
        {ALERTS_DATA.map((a, i) => {
          const s = ALERT_STYLE[a.level];
          return (
            <div key={i} className={`flex items-start gap-2.5 px-3 py-2 border-l-4 rounded-r-lg ${s.bar} ${s.bg}`}>
              <span className={`h-2 w-2 rounded-full flex-shrink-0 mt-1 ${s.dot}`}/>
              <div className="flex-1 min-w-0">
                <span className={`text-[9px] font-black uppercase tracking-wider mr-1 ${s.labelColor}`}>{s.label}</span>
                <span className="text-[10px] text-gray-700">{a.msg}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TILE 5: My Contact Cards ─────────────────────────────────────────────
const CONTACTS = [
  { name: "Prof. Mthuli Ncube",    role: "Minister of Finance",              org: "MoF",    phone: "+263 242 123 456", email: "mncube@gov.zw",       avatar: "MN", color: "bg-[#0F172A]"    },
  { name: "Dr. Elias Murwira",     role: "Minister of ICT",                  org: "MoICT",  phone: "+263 242 234 567", email: "emurwira@gov.zw",     avatar: "EM", color: "bg-[#0F172A]"  },
  { name: "Eng. Fortune Mhere",    role: "Minister of Energy",               org: "MoE",    phone: "+263 242 345 678", email: "fmhere@gov.zw",       avatar: "FM", color: "bg-[#0F172A]"    },
  { name: "Dr. C. Mnangagwa",      role: "Permanent Secretary",              org: "OPC",    phone: "+263 242 456 789", email: "cmnangagwa@gov.zw",   avatar: "CM", color: "bg-[#0F172A]"     },
  { name: "Mr. Lovemore Sibanda",  role: "Chief Procurement Officer",        org: "PRAZ",   phone: "+263 242 567 890", email: "lsibanda@praz.zw",    avatar: "LS", color: "bg-[#0F172A]"    },
  { name: "Ms. Tendai Makoni",     role: "Treasury Secretary",               org: "MoF",    phone: "+263 242 678 901", email: "tmakoni@mof.zw",      avatar: "TM", color: "bg-[#0F172A]"  },
  { name: "Mr. Albert Ndlovu",     role: "Auditor-General",                  org: "OAG",    phone: "+263 242 789 012", email: "andlovu@oag.gov.zw",  avatar: "AN", color: "bg-[#0F172A]"    },
  { name: "Dr. Rudo Chikwanda",    role: "Permanent Secretary — Health",     org: "MoHCC",  phone: "+263 242 890 123", email: "rchikwanda@mohcc.zw", avatar: "RC", color: "bg-[#0F172A]"    },
];

function ContactsTile() {
  const [selected, setSelected] = useState<typeof CONTACTS[0] | null>(null);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">
      <TileHead icon={<Users className="h-4 w-4 text-white"/>} title="My Contact Cards"/>

      {selected ? (
        /* ── Business card detail view ── */
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className={`h-14 w-14 rounded-xl ${selected.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
              <span className="text-lg font-black text-white">{selected.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-[#0F172A]">{selected.name}</div>
              <div className="text-[11px] text-[#0F172A] font-medium">{selected.role}</div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full mt-1">
                <Building2 className="h-2.5 w-2.5 text-slate-600"/>
                <span className="text-[9px] font-bold text-[#0F172A]">{selected.org}</span>
              </div>
            </div>
            <button onClick={() => setSelected(null)}
              className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0">
              <X className="h-3.5 w-3.5 text-[#0F172A]"/>
            </button>
          </div>

          <div className="space-y-2 bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-slate-600 flex-shrink-0"/>
              <span className="text-[11px] text-[#0F172A] font-mono">{selected.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <AtSign className="h-3.5 w-3.5 text-slate-600 flex-shrink-0"/>
              <span className="text-[11px] text-[#0F172A]">{selected.email}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a href={`tel:${selected.phone}`}
              className="h-8 bg-[#0F172A] hover:bg-[#0F172A] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition-colors">
              <Phone className="h-3 w-3"/> Call
            </a>
            <a href={`mailto:${selected.email}`}
              className="h-8 border border-slate-200 hover:bg-slate-50 text-[#0F172A] text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition-colors">
              <Mail className="h-3 w-3"/> Email
            </a>
          </div>
        </div>
      ) : (
        /* ── Card grid ── */
        <div className="grid grid-cols-2 gap-2 overflow-y-auto" style={{ maxHeight: 260 }}>
          {CONTACTS.map((c, i) => (
            <button key={i} onClick={() => setSelected(c)}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-slate-200 hover:bg-slate-50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20">
              <div className={`h-9 w-9 rounded-full ${c.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <span className="text-[10px] font-black text-white">{c.avatar}</span>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-[#0F172A] truncate">{c.name.split(" ").slice(-1)[0]}</div>
                <div className="text-[9px] text-slate-600 truncate">{c.role.split(" ").slice(0,2).join(" ")}</div>
                <div className="text-[8px] text-slate-400 font-mono">{c.org}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TILE 6: Briefing Cards ───────────────────────────────────────────────
type BriefStatus = "Pending Review" | "Approved" | "Rejected" | "Returned" | "Clarification Requested";

interface BriefCard {
  id: number;
  ref: string;
  subject: string;
  from: string;
  date: string;
  priority: "Urgent" | "High" | "Normal";
  status: BriefStatus;
  body: string;
  comments: string;
}

const INITIAL_BRIEFS: BriefCard[] = [
  { id: 1, ref: "BC-2026-0041", subject: "Q2 Procurement Performance Review",         from: "Chief Procurement Officer", date: "2026-07-01", priority: "High",   status: "Pending Review", body: "Quarterly procurement performance against national targets. Implementation rate stands at 73.4%. Full analysis and recommendations attached.",       comments: "" },
  { id: 2, ref: "BC-2026-0042", subject: "Solar Mini-Grid Tender Award Brief",         from: "Ministry of Energy",        date: "2026-07-02", priority: "Urgent", status: "Approved",       body: "Evaluation committee recommends award to SunPower Zimbabwe Ltd at USD 14.8M. Compliant with PRAZ regulations. Seeking ministerial approval.",         comments: "Proceed to contract award. Ensure performance bond is in place before mobilisation." },
  { id: 3, ref: "BC-2026-0043", subject: "Ghost Vendor ZACC Referral Brief",           from: "Internal Audit Unit",       date: "2026-07-03", priority: "Urgent", status: "Returned",       body: "Ghost vendor pattern confirmed involving VEN-00476 and VEN-00481. Total exposure USD 2.1M. ZACC referral requires ministerial co-signature.",         comments: "Clarify VEN-00476 share structure before ZACC submission. Return to CPO." },
  { id: 4, ref: "BC-2026-0044", subject: "ARV Medicines Stockout Emergency",           from: "PS Health & Child Care",    date: "2026-07-04", priority: "Urgent", status: "Pending Review", body: "Three ARV therapy lines at critically low levels (< 2 weeks stock). Emergency procurement of USD 3.2M sought under direct contracting provisions.",    comments: "" },
  { id: 5, ref: "BC-2026-0045", subject: "Infrastructure Budget Overrun Report",       from: "Ministry of Transport",     date: "2026-07-05", priority: "High",   status: "Pending Review", body: "Infrastructure Division has consumed 88% of annual budget with 5 months remaining. Supplementary budget request of USD 12M attached for consideration.", comments: "" },
  { id: 6, ref: "BC-2026-0046", subject: "National Tax System Phase II Procurement",  from: "ZIMRA",                     date: "2026-07-06", priority: "Normal", status: "Pending Review", body: "Restricted tender for National Tax Administration System Phase II. USD 9.2M. Shortlisted bidders attached. Ministerial no-objection required.",        comments: "" },
];

const BRIEF_STATUS_STYLE: Record<BriefStatus, { bg: string; text: string; dot: string }> = {
  "Pending Review":           { bg: "bg-amber-50",   text: "text-amber-800",   dot: "bg-amber-400"   },
  "Approved":                 { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500"  },
  "Rejected":                 { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500"      },
  "Returned":                 { bg: "bg-orange-50",  text: "text-orange-800",  dot: "bg-orange-400"   },
  "Clarification Requested":  { bg: "bg-blue-50",    text: "text-blue-800",    dot: "bg-blue-400"     },
};

const PRIORITY_STYLE: Record<string, string> = {
  Urgent: "bg-red-100 text-red-700",
  High:   "bg-amber-100 text-amber-800",
  Normal: "bg-slate-100 text-slate-700",
};

const ACTION_BUTTONS: { label: string; status: BriefStatus; Icon: React.FC<{className?:string}>; style: string }[] = [
  { label: "Approve",    status: "Approved",               Icon: CheckCircle2, style: "bg-[#0F172A] hover:bg-[#0F172A] text-white" },
  { label: "Reject",     status: "Rejected",               Icon: XCircle,      style: "bg-red-600 hover:bg-red-700 text-white"         },
  { label: "Return",     status: "Returned",               Icon: RotateCcw,    style: "bg-[#0F172A] hover:bg-[#0F172A] text-white"   },
  { label: "Clarify",    status: "Clarification Requested",Icon: HelpCircle,   style: "bg-[#0F172A] hover:bg-[#0F172A] text-white"   },
];

function BriefingCardsTile() {
  const [briefs, setBriefs] = useState<BriefCard[]>(INITIAL_BRIEFS);
  const [open, setOpen]     = useState<BriefCard | null>(null);
  const [comment, setComment] = useState("");

  const pending = briefs.filter(b => b.status === "Pending Review").length;

  function openBrief(b: BriefCard) { setOpen(b); setComment(b.comments); }

  function applyAction(status: BriefStatus) {
    if (!open) return;
    setBriefs(bs => bs.map(b => b.id === open.id ? { ...b, status, comments: comment } : b));
    setOpen(null);
    setComment("");
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">
      <TileHead icon={<FileText className="h-4 w-4 text-white"/>} title="Briefing Cards" badge={pending}/>

      {open ? (
        /* ── Document detail + action form ── */
        <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: 340 }}>
          {/* Header bar */}
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <span className="text-[9px] font-mono text-slate-400">{open.ref}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${PRIORITY_STYLE[open.priority]}`}>{open.priority}</span>
              </div>
              <div className="text-xs font-bold text-[#0F172A] leading-snug">{open.subject}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">From: {open.from} · {open.date}</div>
            </div>
            <button onClick={() => setOpen(null)}
              className="h-6 w-6 rounded bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0">
              <X className="h-3.5 w-3.5 text-[#0F172A]"/>
            </button>
          </div>

          {/* Briefing body */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-[#0F172A] leading-relaxed">
            {open.body}
          </div>

          {/* Current status */}
          {open.status !== "Pending Review" && (
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${BRIEF_STATUS_STYLE[open.status].bg}`}>
              <span className={`h-2 w-2 rounded-full ${BRIEF_STATUS_STYLE[open.status].dot}`}/>
              <span className={`text-[10px] font-bold ${BRIEF_STATUS_STYLE[open.status].text}`}>Current status: {open.status}</span>
            </div>
          )}

          {/* Minister's comments */}
          <div>
            <label className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block mb-1">
              Minister's Official Comments
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="Enter your official comments, directives or instructions on this briefing letter…"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[11px] text-[#0F172A] placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 resize-none bg-white"
            />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            {ACTION_BUTTONS.map(({ label, status, Icon, style }) => (
              <button key={label} onClick={() => applyAction(status)}
                className={`h-9 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0F172A]/20 ${style}`}>
                <Icon className="h-3.5 w-3.5"/>
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ── List view ── */
        <div className="space-y-1.5 overflow-y-auto" style={{ maxHeight: 280 }}>
          {briefs.map(b => {
            const s = BRIEF_STATUS_STYLE[b.status];
            return (
              <button key={b.id} onClick={() => openBrief(b)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 hover:border-slate-200 hover:bg-slate-50 transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20">
                <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${s.dot}`}/>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-[#0F172A] truncate">{b.subject}</div>
                  <div className="text-[9px] text-slate-400 truncate">{b.from} · {b.date}</div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${PRIORITY_STYLE[b.priority]}`}>{b.priority}</span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${s.bg} ${s.text}`}>{b.status}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main export: 6-tile grid ─────────────────────────────────────────────
export default function MyBriefingTiles() {
  const [ministry, setMinistry] = useState("All Ministries");
  const [financialYear, setFinancialYear] = useState("FY 2026");
  const [department, setDepartment] = useState("All Departments");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) setShowScrollTop(el.scrollTop > 120);
  }, []);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#EAF4FF]">

      {/* ── Filter bar ── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-shrink-0">Filters:</span>

        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Ministry</label>
          <select value={ministry} onChange={e => setMinistry(e.target.value)}
            className="h-7 px-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20 min-w-[180px]">
            {MY_MINISTRIES.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Financial Year</label>
          <select value={financialYear} onChange={e => setFinancialYear(e.target.value)}
            className="h-7 px-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20">
            {MY_FINANCIAL_YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">Department</label>
          <select value={department} onChange={e => setDepartment(e.target.value)}
            className="h-7 px-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20 min-w-[160px]">
            {MY_DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        {/* Active chips */}
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

      {/* ── AI Briefing Information Bar with Audio Toggle ── */}
      <div className="flex-shrink-0 bg-[#0f172a] border-b border-slate-200/20 px-4 py-2 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-[#0F172A] grid place-items-center flex-shrink-0">
          <AlertTriangle className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white italic">
            AI Summary: {financialYear} · {ministry !== "All Ministries" ? ministry.split(" ")[0] : "All Ministries"} — You have 4 pending briefing cards, 3 urgent tasks and 4 unread mails requiring your attention today.
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="px-1.5 py-0.5 bg-[#0F172A] text-white text-[9px] font-bold rounded">MY BRIEFING</span>
            <span className="text-[10px] text-slate-400">Live · Updated just now</span>
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

      {/* ── Scrollable tile grid ── */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 sm:p-5">
        {/* Page header */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#0F172A] flex items-center justify-center shadow-sm">
            <Building2 className="h-4 w-4 text-white"/>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">My Briefing Workspace</h2>
            <p className="text-[10px] text-slate-400">Minister's daily dashboard — calendar, tasks, mail, alerts, contacts & briefing cards</p>
          </div>
        </div>

        {/* 3-column grid on xl, 2 on md, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <CalendarTile/>
          <TodoTile/>
          <MailsTile/>
          <AlertsTile/>
          <ContactsTile/>
          <BriefingCardsTile/>
        </div>
      </div>

      {/* ── Scroll-to-top bar ── */}
      {showScrollTop && (
        <div className="flex-shrink-0 border-t border-slate-200 bg-white">
          <button onClick={scrollToTop}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-[#0F172A] hover:bg-slate-50 transition-colors">
            <ArrowUp className="h-3.5 w-3.5" />
            Scroll to top
          </button>
        </div>
      )}

      {/* ── AI Assistant Panel ── */}
      <AIAssistantPanel
        agentName="Briefing AI"
        agentRole="Personal briefing assistant for the Minister"
        context="My Briefing workspace"
        suggestedPrompts={[
          "What are my top priorities for today?",
          "Summarize my pending briefing cards",
          "Generate my daily activity report",
          "Which tenders need my approval today?",
          "Show all overdue tasks and deadlines",
        ]}
        color="blue"
      />
    </div>
  );
}
