/**
 * SeniorFeed — CPO/Minister view of all officer actions,
 * AI-compiled daily reports, and award notices.
 * Embedded in CPO Dashboard and Minister Dashboard.
 */
import { useState } from "react";
import { getAll, type StoredNotification, type AIReport, type AwardNotice } from "@/lib/local-store";
import { Card, CardHeader, Badge } from "@/components/AppShell";
import {
  Sparkles, Trophy, AlertTriangle, CheckCircle2, FileText,
  Shield, DollarSign, Activity, ChevronDown, ChevronUp, Bell,
} from "lucide-react";

const CATEGORY_ICON: Record<string, React.ElementType> = {
  action:    Activity,
  ai_report: Sparkles,
  award:     Trophy,
  fraud:     AlertTriangle,
  approval:  CheckCircle2,
  system:    Shield,
};

const CATEGORY_COLOR: Record<string, string> = {
  action:    "bg-blue-100 text-blue-800",
  ai_report: "bg-violet-100 text-violet-800",
  award:     "bg-emerald-100 text-emerald-800",
  fraud:     "bg-red-500 text-white",
  approval:  "bg-amber-100 text-amber-800",
  system:    "bg-gray-200 text-gray-700",
};

function NotifRow({ n }: { n: StoredNotification }) {
  const Icon = CATEGORY_ICON[n.category ?? "system"] ?? Bell;
  const color = CATEGORY_COLOR[n.category ?? "system"] ?? "bg-gray-400 text-white";
  return (
    <div className="flex items-start gap-3 px-5 py-3 hover:bg-[#EAF1F8]/60 transition-colors border-b border-black/5 last:border-0">
      <div className={`h-7 w-7 rounded-lg ${color} grid place-items-center flex-shrink-0 mt-0.5`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-black leading-snug">
          {n.msg.replace("[Senior Alert] ", "")}
        </div>
        <div className="text-[10px] text-black/40 mt-0.5 flex items-center gap-2 flex-wrap">
          {n.from && <span className="font-medium">{n.from}</span>}
          {n.fromRole && <span>· {n.fromRole}</span>}
          {n.ref && <span>· {n.ref}</span>}
          <span>· {n.time}</span>
        </div>
      </div>
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${n.read ? "bg-transparent" : n.type === "error" ? "bg-red-500" : n.type === "warning" ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} />
    </div>
  );
}

function AIReportRow({ r }: { r: AIReport }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/5 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 px-5 py-3 hover:bg-[#EAF1F8]/60 transition-colors text-left">
        <div className="h-7 w-7 rounded-lg bg-[#0F172A] text-white grid place-items-center flex-shrink-0 mt-0.5">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-black">AI Report — {r.officer}</div>
          <div className="text-[10px] text-black/50 mt-0.5">{r.role} · {r.date} · {r.actions.length} actions</div>
          <div className="text-[11px] text-black/70 mt-1 italic">"{r.summary}"</div>
        </div>
        <div className="flex-shrink-0 mt-0.5 text-black/30">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-3 ml-10 space-y-1.5">
          {r.actions.map((a, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <span className="text-black/30 font-mono w-12 flex-shrink-0">{a.time}</span>
              <span className="text-black font-medium">{a.action}</span>
              <span className="text-black/40">·</span>
              <span className="text-black/60">{a.ref}</span>
              <span className="text-[#0F172A] ml-auto">{a.outcome}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AwardRow({ a }: { a: AwardNotice }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/5 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 px-5 py-3 hover:bg-[#EAF1F8]/60 transition-colors text-left">
        <div className="h-7 w-7 rounded-lg bg-[#0F172A] text-white grid place-items-center flex-shrink-0 mt-0.5">
          <Trophy className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-black">Award — {a.tenderTitle}</div>
          <div className="text-[10px] text-black/50 mt-0.5">{a.tenderId} · {a.contractValue} · Awarded to <strong>{a.vendorName}</strong></div>
          <div className="text-[10px] text-black/40 mt-0.5">By {a.awardedBy} · {a.awardDate} · {a.documents.length} legal docs requested</div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-1.5 mt-0.5">
          <Badge tone="green">Awarded</Badge>
          {open ? <ChevronUp className="h-4 w-4 text-black/30" /> : <ChevronDown className="h-4 w-4 text-black/30" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-3 ml-10 space-y-1.5">
          <div className="text-[11px] text-black/50 font-semibold uppercase tracking-wider mb-2">Documents Requested</div>
          {a.documents.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <FileText className="h-3 w-3 text-black/30 flex-shrink-0" />
              <span className="text-black">{d}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type FeedTab = "all" | "ai_reports" | "awards" | "alerts";

export default function SeniorFeed({ compact = false }: { compact?: boolean }) {
  const [tab, setTab] = useState<FeedTab>("all");

  const notifications = getAll("notifications").filter(n => n.forCPO);
  const aiReports     = getAll("aiReports");
  const awardNotices  = getAll("awardNotices");

  const alerts = notifications.filter(n => n.category !== "ai_report" && n.category !== "award");
  const unread  = notifications.filter(n => !n.read).length;

  return (
    <Card>
      <CardHeader
        title="Senior Intelligence Feed"
        subtitle="All officer actions · AI reports · Awards — real-time"
        action={
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <span className="h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold grid place-items-center">{unread > 99 ? "99+" : unread}</span>
            )}
            <Badge tone="blue"><Sparkles className="h-3 w-3 mr-1" />AI compiled</Badge>
          </div>
        }
      />

      {/* Tab strip */}
      <div className="flex border-b border-black/10 overflow-x-auto">
        {([
          ["all",        "All",         notifications.length + aiReports.length + awardNotices.length],
          ["ai_reports", "AI Reports",  aiReports.length],
          ["awards",     "Awards",      awardNotices.length],
          ["alerts",     "Alerts",      alerts.length],
        ] as const).map(([k, label, count]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 -mb-px whitespace-nowrap flex-shrink-0 transition-colors ${tab === k ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}>
            {label} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${tab === k ? "bg-black text-white" : "bg-black/10 text-black/50"}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Feed content */}
      <div className={compact ? "max-h-64 overflow-y-auto" : "max-h-[480px] overflow-y-auto"}>
        {(tab === "all" || tab === "alerts") && alerts.map(n => <NotifRow key={n.id} n={n} />)}
        {(tab === "all" || tab === "ai_reports") && aiReports.map(r => <AIReportRow key={r.id} r={r} />)}
        {(tab === "all" || tab === "awards") && awardNotices.map(a => <AwardRow key={a.id} a={a} />)}

        {((tab === "all" && notifications.length + aiReports.length + awardNotices.length === 0) ||
          (tab === "ai_reports" && aiReports.length === 0) ||
          (tab === "awards" && awardNotices.length === 0) ||
          (tab === "alerts" && alerts.length === 0)) && (
          <div className="px-5 py-8 text-center text-sm text-black/30">
            {tab === "all" ? "No activity yet. Officer actions will appear here." : `No ${tab.replace("_", " ")} yet.`}
          </div>
        )}
      </div>
    </Card>
  );
}
