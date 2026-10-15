import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { Bell, CheckCircle2, AlertTriangle, Info, X, Filter, Search, Settings, Sparkles, Shield, DollarSign, FileSignature, Clock } from "lucide-react";
import { pushNotification, markNotificationsRead } from "@/lib/local-store";
import { useNotifications } from "@/hooks/use-store";

type NotifCategory = "All" | "Contract Closure" | "Warranty" | "Supplier Evaluation" | "Risk Alerts" | "Compliance" | "Budget" | "Reports" | "AI Recommendations" | "Audit" | "System";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Contract Closure": FileSignature, "Warranty": Shield,
  "Supplier Evaluation": CheckCircle2, "Risk Alerts": AlertTriangle,
  "Compliance": Shield, "Budget": DollarSign, "Reports": Bell,
  "AI Recommendations": Sparkles, "Audit": Shield, "System": Settings,
};

const STATIC_NOTIFS = [
  { id: "SN-001", title: "Contract Closure Due", category: "Contract Closure", msg: "CN-2025-0312 — Harare Water Treatment Phase I is ready for formal closure. All conditions verified.", time: "2 hours ago", read: false, priority: "High" },
  { id: "SN-002", title: "Warranty Expiring", category: "Warranty", msg: "ZESA Substation Upgrade warranty expires in 5 days (01 July 2026). Action required by T. Moyo.", time: "4 hours ago", read: false, priority: "Critical" },
  { id: "SN-003", title: "Supplier Evaluation Due", category: "Supplier Evaluation", msg: "Final evaluation due for Highveld Engineering — contract CN-2026-0411. Deadline: 30 June 2026.", time: "6 hours ago", read: false, priority: "Medium" },
  { id: "SN-004", title: "Outstanding Issue", category: "Risk Alerts", msg: "Punch list item #3 on Beitbridge Highway project remains unresolved for 14 days.", time: "Yesterday", read: true, priority: "High" },
  { id: "SN-005", title: "Risk Alert", category: "Risk Alerts", msg: "Fraud pattern detected: bid rotation in Transport Ministry. Referred to Anti-Corruption unit.", time: "Yesterday", read: false, priority: "Critical" },
  { id: "SN-006", title: "Compliance Alert", category: "Compliance", msg: "3 contracts in Ministry of Education past approval deadline. Immediate escalation required.", time: "2 days ago", read: true, priority: "High" },
  { id: "SN-007", title: "Budget Alert", category: "Budget", msg: "ICT procurement budget 88% utilized with 6 months remaining. CPO review required.", time: "2 days ago", read: true, priority: "Medium" },
  { id: "SN-008", title: "Executive Report Ready", category: "Reports", msg: "Monthly Executive Dashboard Report for June 2026 is ready for download.", time: "3 days ago", read: true, priority: "Low" },
  { id: "SN-009", title: "AI Recommendation", category: "AI Recommendations", msg: "AI recommends pre-qualifying 3 additional SME suppliers for the upcoming infrastructure framework tender.", time: "3 days ago", read: true, priority: "Low" },
  { id: "SN-010", title: "Audit Finding", category: "Audit", msg: "Internal Audit finding FA-2026-041 — management response due by 05 July 2026.", time: "4 days ago", read: true, priority: "Medium" },
];

const PRIORITY_COLOR: Record<string, string> = {
  Critical: "border-l-4 border-red-500 bg-red-50/40",
  High: "border-l-4 border-slate-200 bg-slate-50/30",
  Medium: "border-l-4 border-slate-200 bg-slate-50/20",
  Low: "border-l-4 border-slate-200 bg-slate-50/20",
};
const PRIORITY_BADGE: Record<string, string> = {
  Critical: "bg-red-100 text-red-700", High: "bg-slate-100 text-[#0F172A]",
  Medium: "bg-slate-100 text-[#0F172A]", Low: "bg-slate-100 text-[#0F172A]",
};

export default function NotificationsCenterPage() {
  const [notifs, setNotifs] = useState(STATIC_NOTIFS);
  const [catFilter, setCatFilter] = useState<NotifCategory>("All");
  const [search, setSearch] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filtered = notifs.filter(n =>
    (catFilter === "All" || n.category === catFilter) &&
    (!showUnreadOnly || !n.read) &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.msg.toLowerCase().includes(search.toLowerCase()))
  );

  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => { setNotifs(prev => prev.map(n => ({ ...n, read: true }))); markNotificationsRead(); };
  const dismiss = (id: string) => setNotifs(prev => prev.filter(n => n.id !== id));

  const unread = notifs.filter(n => !n.read).length;

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="System"
        process="Notifications Centre"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Notifications Center"
          description="Centralized hub for all procurement notifications — contract closures, warranty alerts, risk signals, AI recommendations, and compliance alerts."
          actions={
            <button onClick={markAllRead} className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary">
              <CheckCircle2 className="h-4 w-4" /> Mark All Read
            </button>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Notifications" value={String(notifs.length)} delta="All messages" />
          <KpiCard label="Unread" value={String(unread)} delta="Need attention" positive={unread === 0} />
          <KpiCard label="Critical" value={String(notifs.filter(n => n.priority === "Critical").length)} delta="Immediate action" positive={false} />
          <KpiCard label="Today" value={String(notifs.filter(n => n.time.includes("ago")).length)} delta="Received today" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notifications…" className="w-full h-9 pl-9 pr-4 rounded-lg border border-black/10 text-sm focus:outline-none" /></div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value as NotifCategory)} className="h-9 px-3 rounded-lg border border-black/10 text-sm bg-white focus:outline-none">
            <option value="All">All Categories</option>
            {["Contract Closure", "Warranty", "Supplier Evaluation", "Risk Alerts", "Compliance", "Budget", "Reports", "AI Recommendations", "Audit", "System"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => setShowUnreadOnly(v => !v)} className={`h-9 px-3 rounded-lg border text-sm transition-colors ${showUnreadOnly ? "bg-black text-white border-black" : "border-black/10 hover:bg-[#EAF1F8]"}`}>
            Unread only
          </button>
        </div>

        <Card>
          <div className="divide-y divide-black/5">
            {filtered.length === 0 && (
              <div className="p-12 text-center">
                <Bell className="h-8 w-8 text-black/20 mx-auto mb-2" />
                <div className="text-sm text-black/40">No notifications matching your filters</div>
              </div>
            )}
            {filtered.map(n => {
              const CatIcon = CATEGORY_ICONS[n.category] ?? Bell;
              return (
                <div key={n.id} className={`flex items-start gap-3 p-4 transition-colors ${PRIORITY_COLOR[n.priority]} ${!n.read ? "" : "opacity-70"}`} onClick={() => markRead(n.id)}>
                  <div className={`h-8 w-8 rounded-full grid place-items-center flex-shrink-0 mt-0.5 ${n.priority === "Critical" ? "bg-red-100" : n.priority === "High" ? "bg-slate-100" : "bg-gray-100"}`}>
                    <CatIcon className={`h-4 w-4 ${n.priority === "Critical" ? "text-red-600" : n.priority === "High" ? "text-[#0F172A]" : "text-gray-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-black">{n.title}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${PRIORITY_BADGE[n.priority]}`}>{n.priority}</span>
                      <span className="text-[10px] bg-black/5 text-black/50 px-1.5 py-0.5 rounded-full">{n.category}</span>
                      {!n.read && <div className="h-2 w-2 rounded-full bg-black flex-shrink-0" />}
                    </div>
                    <div className="text-xs text-black/60 mt-0.5 leading-relaxed">{n.msg}</div>
                    <div className="text-[10px] text-black/35 mt-1 flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{n.time}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); dismiss(n.id); }} className="h-6 w-6 grid place-items-center rounded-lg hover:bg-black/5 flex-shrink-0">
                    <X className="h-3 w-3 text-black/30" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Notification Settings */}
        <div className="mt-6">
          <Card>
            <CardHeader title="Notification Preferences" subtitle="Configure which alerts you receive and how" />
            <div className="p-4 space-y-3">
              {[
                { label: "Contract Closure Alerts", desc: "When contracts are ready for closure or closed", enabled: true },
                { label: "Warranty Expiration Alerts", desc: "30, 14, and 7 days before warranty expires", enabled: true },
                { label: "Supplier Evaluation Due", desc: "Reminder when supplier evaluations are due", enabled: true },
                { label: "Outstanding Issues", desc: "Unresolved issues and punch list items", enabled: true },
                { label: "Risk Alerts", desc: "High and critical risk notifications", enabled: true },
                { label: "Compliance Alerts", desc: "Regulatory and compliance violations", enabled: true },
                { label: "Budget Alerts", desc: "Budget utilization thresholds (75%, 90%, 100%)", enabled: true },
                { label: "AI Recommendations", desc: "AI-generated procurement insights and recommendations", enabled: false },
              ].map(pref => (
                <div key={pref.label} className="flex items-center justify-between py-2 border-b border-black/5">
                  <div>
                    <div className="text-sm font-medium text-black">{pref.label}</div>
                    <div className="text-xs text-black/50">{pref.desc}</div>
                  </div>
                  <div className={`h-5 w-9 rounded-full flex items-center px-0.5 cursor-pointer transition-colors ${pref.enabled ? "bg-black justify-end" : "bg-gray-200 justify-start"}`} onClick={() => pushNotification(`Notification preference updated: ${pref.label}`, "info")}>
                    <div className="h-4 w-4 bg-white rounded-full shadow" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
