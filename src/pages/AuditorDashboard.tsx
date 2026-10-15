import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import TodayActivity from "@/components/TodayActivity";
import { generateDailyReportPDF } from "@/lib/pdf-report";
import { getAll, pushNotification } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import { Shield, AlertTriangle, CheckCircle2, FileText, Eye, Download } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

const TABS = ["Audit Trail", "Compliance", "Fraud Alerts", "Reports", "Today"] as const;
type Tab = typeof TABS[number];

const COMPLIANCE_TREND = [
  { month: "Jan", score: 91.2, target: 90 },
  { month: "Feb", score: 92.1, target: 90 },
  { month: "Mar", score: 90.8, target: 90 },
  { month: "Apr", score: 93.4, target: 92 },
  { month: "May", score: 93.8, target: 92 },
  { month: "Jun", score: 94.2, target: 92 },
];

const EXCEPTION_DATA = [
  { category: "Approval",        count: 14, color: "#DC2626" },
  { category: "Documentation",   count: 11, color: "#64748B" },
  { category: "Method",          count: 8,  color: "#334155" },
  { category: "Eligibility",     count: 7,  color: "#334155" },
  { category: "Timeline",        count: 4,  color: "#475569" },
  { category: "Financial",       count: 3,  color: "#f97316" },
];

const COMPLIANCE_AREAS = [
  { name: "Approval Process",    pct: 94, color: "bg-[#0F172A]" },
  { name: "Documentation",       pct: 88, color: "bg-[#0F172A]" },
  { name: "Procurement Methods", pct: 97, color: "bg-[#0F172A]" },
  { name: "Vendor Eligibility",  pct: 92, color: "bg-[#0F172A]" },
  { name: "Financial Controls",  pct: 91, color: "bg-[#0F172A]" },
  { name: "Timeline Adherence",  pct: 96, color: "bg-[#0F172A]" },
];

export default function AuditorDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("Audit Trail");
  const logs = getAll("auditLogs");

  const handleReportDownload = (name: string) => {
    if (!user) return;
    pushNotification(`Report downloaded: ${name}`, "success");
    generateDailyReportPDF(user);
  };

  const handleFraudAction = (id: string, action: string) => {
    pushNotification(`Fraud alert ${id}: ${action}`, "warning");
    toast(`Action taken: ${action} — Alert ${id}. Relevant authorities notified.`, "success");
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Audit & Compliance"
        process="Auditor Dashboard"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title={`Auditor: ${user?.name}`}
          description="Compliance & Audit Command — Office of Auditor-General"
          actions={
            <button
              onClick={() => user && generateDailyReportPDF(user)}
              className="h-9 px-4 rounded-xl border border-black/10 bg-white text-sm font-medium hover:bg-[#EAF1F8] flex items-center gap-1.5 transition-colors"
            >
              <Download className="h-4 w-4" /> Daily Report
            </button>
          }
        />

        {/* Colorful KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Compliance Score"    value="94.2%" delta="+1.8 pts"   icon={Shield}        color="green"  />
          <KpiCard label="Open Exceptions"     value="47"    delta="+5 today"   positive={false} icon={AlertTriangle} color="red" />
          <KpiCard label="Audit Events Today"  value="8,421" delta="All logged" icon={FileText}       color="blue"   />
          <KpiCard label="Resolved This Month" value="312"   delta="87% rate"   icon={CheckCircle2}  color="cyan"   />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-black/10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"
              }`}>{t}</button>
          ))}
        </div>

        {/* ── Audit Trail ── */}
        {tab === "Audit Trail" && (
          <Card>
            <CardHeader title="Live Audit Trail" subtitle="All system events — immutable log" action={<Badge tone="blue">Continuous</Badge>} />
            <div className="divide-y divide-black/5 max-h-[500px] overflow-y-auto">
              {[
                ...logs.slice(0, 5).map(l => ({
                  event: l.event, user: l.user,
                  time: new Date(l.timestamp).toLocaleString(),
                  risk: l.risk, resolved: true,
                })),
                { event: "Tender specification modified post-publication", user: "P. Dube",        time: "2026-06-21 09:14", risk: "High", resolved: false },
                { event: "Bid vault accessed outside opening window",       user: "A. Mpofu",       time: "2026-06-21 08:42", risk: "High", resolved: false },
                { event: "Approval threshold exceeded without override",    user: "R. Chikwanda",   time: "2026-06-20 17:22", risk: "Med",  resolved: true  },
                { event: "Contract variation approved without committee",   user: "T. Moyo",        time: "2026-06-20 14:05", risk: "Med",  resolved: false },
                { event: "Tax clearance certificate expired — active vendor", user: "System",       time: "2026-06-19 11:18", risk: "Low",  resolved: true  },
              ].map((e, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between gap-4 hover:bg-[#EAF1F8]/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                      e.risk === "High" ? "bg-red-500" : e.risk === "Med" ? "bg-[#0F172A]" : "bg-slate-400"
                    }`} />
                    <div>
                      <div className="text-xs font-medium text-black">{e.event}</div>
                      <div className="text-[10px] text-black/40">{e.user} · {e.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge tone={e.risk === "High" ? "red" : e.risk === "Med" ? "amber" : "green"}>{e.risk}</Badge>
                    <Badge tone={e.resolved ? "green" : "amber"}>{e.resolved ? "Resolved" : "Open"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Compliance ── */}
        {tab === "Compliance" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Trend chart */}
              <Card>
                <CardHeader title="Compliance Score Trend" subtitle="Rolling 6-month vs target" />
                <div className="p-4 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={COMPLIANCE_TREND}>
                      <CartesianGrid stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="month" stroke="#aaa" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis domain={[88, 100]} stroke="#aaa" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #eee", borderRadius: 10, fontSize: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="score"  stroke="#475569" strokeWidth={2.5} dot={{ r: 4, fill: "#475569" }} name="Score %" />
                      <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Target" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Exception breakdown */}
              <Card>
                <CardHeader title="Exceptions by Category" subtitle="Current period" />
                <div className="p-4 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={EXCEPTION_DATA} layout="vertical">
                      <CartesianGrid stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" stroke="#aaa" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="category" stroke="#aaa" fontSize={10} tickLine={false} axisLine={false} width={90} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #eee", borderRadius: 10, fontSize: 12 }} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Exceptions">
                        {EXCEPTION_DATA.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Per-area compliance bars */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {COMPLIANCE_AREAS.map((c) => (
                <div key={c.name} className="bg-white border border-black/10 rounded-2xl p-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <div className="text-xs font-semibold text-black">{c.name}</div>
                    <div className="text-sm font-bold text-black">{c.pct}%</div>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full ${c.color} transition-all`} style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Fraud Alerts ── */}
        {tab === "Fraud Alerts" && (
          <div className="space-y-3">
            {[
              { id: "FRD-2026-089", type: "Bid Rotation",          sev: "Critical", entity: "VEN-00476 & VEN-00481 — Harare Roads",     status: "Referred to ZACC",    color: "border-l-red-500" },
              { id: "FRD-2026-088", type: "Conflict of Interest",  sev: "High",     entity: "VEN-00478 — ZW-PRA-2026-00181",            status: "Under Investigation", color: "border-l-orange-500" },
              { id: "FRD-2026-087", type: "Abnormally Low Bid",    sev: "High",     entity: "VEN-00476 — ZW-PRA-2026-00183",            status: "Flagged for Review",  color: "border-l-amber-500" },
              { id: "FRD-2026-086", type: "PEP Match",             sev: "Med",      entity: "VEN-00480 — ZW-PRA-2026-00177",            status: "Screening",           color: "border-l-yellow-400" },
              { id: "FRD-2026-085", type: "Spec Tailoring",        sev: "Med",      entity: "VEN-00479 — ZW-PRA-2026-00182",            status: "Closed — No Evidence",color: "border-l-gray-300" },
            ].map(a => (
              <div key={a.id} className={`bg-white border border-black/10 border-l-4 ${a.color} rounded-2xl px-5 py-4 flex items-center justify-between gap-4`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    a.sev === "Critical" ? "text-red-600" : a.sev === "High" ? "text-[#0F172A]" : "text-slate-600"
                  }`} />
                  <div>
                    <div className="text-sm font-semibold text-black">{a.type}</div>
                    <div className="text-xs text-black/40 mt-0.5">{a.id} · {a.entity}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge tone={a.sev === "Critical" ? "red" : a.sev === "High" ? "red" : "amber"}>{a.sev}</Badge>
                  <Badge tone={
                    a.status.includes("ZACC") ? "red" :
                    a.status.includes("Closed") ? "muted" :
                    a.status.includes("Investigation") ? "amber" : "blue"
                  }>{a.status}</Badge>
                  <button
                    onClick={() => handleFraudAction(a.id, a.status.includes("Closed") ? "Reopen Case" : "Escalate")}
                    className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] transition-colors flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" /> {a.status.includes("Closed") ? "Reopen" : "Escalate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Reports ── */}
        {tab === "Reports" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: "Annual Audit Report FY2026",          color: "bg-slate-50 border-slate-200",   icon: "📋" },
              { name: "Procurement Compliance Summary",      color: "bg-slate-50 border-slate-200", icon: "✅" },
              { name: "Fraud Risk Assessment Report",        color: "bg-red-50 border-red-200",     icon: "🚨" },
              { name: "Exception Resolution Report",         color: "bg-slate-50 border-slate-200", icon: "⚠️" },
              { name: "Vendor Risk Register",                color: "bg-slate-50 border-slate-200", icon: "🏢" },
              { name: "Anti-Corruption Monitoring Report",   color: "bg-slate-50 border-slate-200", icon: "🛡️" },
            ].map(r => (
              <div key={r.name} className={`${r.color} border rounded-2xl px-5 py-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{r.icon}</span>
                  <span className="text-sm font-medium text-black">{r.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toast(`${r.name} — Opening report viewer. FY2026 procurement audit findings compiled from 8,421 audit events.`, "info")}
                    className="h-7 px-2.5 rounded-lg border border-black/10 bg-white text-xs hover:bg-[#EAF1F8] transition-colors"
                  >View</button>
                  <button
                    onClick={() => handleReportDownload(r.name)}
                    className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 transition-colors flex items-center gap-1"
                  >
                    <Download className="h-3 w-3" /> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "Today" && <TodayActivity />}
      </div>

      <AIAssistantPanel
        agentName="Procurement Auditor AI"
        agentRole="Compliance monitoring, fraud detection"
        context="audit dashboard"
        color="blue"
        suggestedPrompts={["Detect collusion indicators","Generate compliance report","List approval anomalies","Find bid rigging patterns"]}
      />
    </AppShell>
  );
}
