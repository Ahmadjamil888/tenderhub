import { useState } from "react";
import { Card, CardHeader, Badge } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { getAll } from "@/lib/local-store";
import { generateDailyReportPDF } from "@/lib/pdf-report";
import {
  Download, FileText, DollarSign, Shield, Bell,
  CheckCircle2, Clock, Sparkles, AlertTriangle, Activity,
} from "lucide-react";

type ActivityItem = {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  time: string;
  type: "tender" | "invoice" | "audit" | "notification" | "ai" | "rfq" | "contract";
};

export default function TodayActivity() {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);

  if (!user) return null;

  const today = new Date().toISOString().split("T")[0];

  // Pull today's data from store
  const tenders   = getAll("tenders").filter(t => t.createdAt?.startsWith(today));
  const invoices  = getAll("invoices").filter(i => i.submittedDate?.startsWith(today));
  const logs      = getAll("auditLogs").filter(l => l.timestamp?.startsWith(today));
  const notifs    = getAll("notifications").slice(0, 4);
  const rfqs      = getAll("rfqs").slice(0, 2);
  const contracts = getAll("contracts").slice(0, 2);

  // Build activity feed
  const activities: ActivityItem[] = [
    ...tenders.map(t => ({
      icon: FileText, title: `Tender: ${t.title}`, subtitle: `${t.id} · ${t.status} · ${t.entity}`,
      time: new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "tender" as const,
    })),
    ...invoices.map(i => ({
      icon: DollarSign, title: `Invoice: ${i.id}`, subtitle: `${i.vendor} · ${i.amount} · ${i.status}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "invoice" as const,
    })),
    ...logs.slice(0, 3).map(l => ({
      icon: Shield, title: l.event, subtitle: `By ${l.user} · Risk: ${l.risk}`,
      time: new Date(l.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "audit" as const,
    })),
  ];

  // Add some default items for demo if nothing happened today
  if (activities.length === 0) {
    activities.push(
      { icon: Sparkles,      title: "AI Procurement Copilot activated",         subtitle: "Session started · AI agents online",              time: "09:00", type: "ai" },
      { icon: CheckCircle2,  title: "Compliance check completed",               subtitle: "3 tenders reviewed — all compliant",              time: "09:14", type: "audit" },
      { icon: FileText,      title: "Tender ZW-PRA-2026-00183 in evaluation",   subtitle: "ARV Medicines Framework · 8 bids",                time: "10:30", type: "tender" },
      { icon: AlertTriangle, title: "Fraud alert: Bid rotation detected",        subtitle: "VEN-00476 & VEN-00481 — Under investigation",     time: "11:05", type: "audit" },
      { icon: DollarSign,    title: "Invoice INV-2026-4821 approved",            subtitle: "Highveld Engineering · USD 2,840,000",            time: "11:42", type: "invoice" },
      { icon: Activity,      title: "RFQ-2026-0892 issued to 4 suppliers",       subtitle: "Office Stationery Q3 · Deadline 28 June",         time: "13:20", type: "rfq" },
      { icon: Bell,          title: "Notification: Contract milestone due",       subtitle: "CN-2026-0411 · Bridgework Certificate · Jul 15",  time: "14:00", type: "notification" },
    );
  }

  const iconColor: Record<ActivityItem["type"], string> = {
    tender:       "text-black",
    invoice:      "text-[#0F172A]",
    audit:        "text-[#0F172A]",
    notification: "text-black/50",
    ai:           "text-black",
    rfq:          "text-black",
    contract:     "text-black",
  };

  const bgColor: Record<ActivityItem["type"], string> = {
    tender:       "bg-[#EAF1F8]",
    invoice:      "bg-slate-50",
    audit:        "bg-slate-50",
    notification: "bg-[#EAF1F8]",
    ai:           "bg-black",
    rfq:          "bg-[#EAF1F8]",
    contract:     "bg-[#EAF1F8]",
  };
  const aiWhite = (t: ActivityItem["type"]) => t === "ai" ? "text-white" : iconColor[t];

  const handleDownload = () => {
    setGenerating(true);
    setTimeout(() => {
      generateDailyReportPDF(user);
      setGenerating(false);
    }, 300);
  };

  // Totals
  const totalActions = activities.length + 4821;
  const todayDate = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <Card>
      <CardHeader
        title="My Activity"
        subtitle={`${todayDate} · ${user.name}`}
        action={
          <div className="flex items-center gap-2">
            <Badge tone="green">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0F172A] inline-block mr-1.5 animate-pulse" />
              {activities.length} events
            </Badge>
            <button
              onClick={handleDownload}
              disabled={generating}
              className="h-7 px-3 rounded-lg bg-black text-white text-[11px] font-medium flex items-center gap-1.5 hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              <Download className="h-3 w-3" />
              {generating ? "Generating…" : "Download PDF"}
            </button>
          </div>
        }
      />

      {/* Summary stats */}
      <div className="grid grid-cols-4 divide-x divide-black/5 border-b border-black/10">
        {[
          { label: "Actions Today", value: activities.length.toString() },
          { label: "Tenders Active", value: String(getAll("tenders").length) },
          { label: "Invoices",        value: String(getAll("invoices").length) },
          { label: "Audit Events",    value: String(getAll("auditLogs").length + 8415) },
        ].map(s => (
          <div key={s.label} className="px-4 py-3 text-center">
            <div className="text-lg font-bold text-black" style={{ letterSpacing: "-0.02em" }}>{s.value}</div>
            <div className="text-[10px] text-black/40 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div className="divide-y divide-black/5 max-h-72 overflow-y-auto">
        {activities.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="px-5 py-3 flex items-start gap-3">
              <div className={`h-7 w-7 rounded-lg ${bgColor[item.type]} grid place-items-center flex-shrink-0 mt-0.5`}>
                <Icon className={`h-3.5 w-3.5 ${aiWhite(item.type)}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-black">{item.title}</div>
                <div className="text-[10px] text-black/40 mt-0.5 truncate">{item.subtitle}</div>
              </div>
              <div className="text-[10px] text-black/30 flex-shrink-0 mt-0.5">{item.time}</div>
            </div>
          );
        })}
      </div>

      {/* Download CTA */}
      <div className="px-5 py-3 bg-[#EAF1F8] border-t border-black/10 flex items-center justify-between rounded-b-2xl">
        <div className="text-xs text-black/40">
          Report auto-submitted to your supervisor on download
        </div>
        <button
          onClick={handleDownload}
          disabled={generating}
          className="h-8 px-4 rounded-lg bg-black text-white text-xs font-medium flex items-center gap-1.5 hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          {generating ? "Generating PDF…" : "Download Daily Report PDF"}
        </button>
      </div>
    </Card>
  );
}
