import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { FeatureGrid } from "@/components/ModulePage";
import { useAuth } from "@/lib/auth-context";
import { pushSeniorAlert, pushNotification } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Shield, AlertTriangle, CheckCircle2, FileText, Download } from "lucide-react";
import InlineWorkbench from "@/components/InlineWorkbench";

const AUDIT_LOG = [
  { id: "AUD-2026-4281", event: "Tender specification modified post-publication",  entity: "Min. Energy",    risk: "High", timestamp: "2026-06-21 09:14", resolved: false },
  { id: "AUD-2026-4280", event: "Bid vault accessed outside opening window",        entity: "Min. Health",    risk: "High", timestamp: "2026-06-21 08:42", resolved: false },
  { id: "AUD-2026-4279", event: "Approval threshold exceeded without override",     entity: "ZIMRA",          risk: "Med",  timestamp: "2026-06-20 17:22", resolved: true  },
  { id: "AUD-2026-4278", event: "Contract variation approved without committee",    entity: "Min. Transport", risk: "Med",  timestamp: "2026-06-20 14:05", resolved: false },
  { id: "AUD-2026-4277", event: "Tax clearance certificate expired — vendor active",entity: "ZINARA",         risk: "Low",  timestamp: "2026-06-19 11:18", resolved: true  },
];

const COMPLIANCE_TREND = [
  { month: "Jan", score: 91.2 }, { month: "Feb", score: 92.1 },
  { month: "Mar", score: 90.8 }, { month: "Apr", score: 93.4 },
  { month: "May", score: 93.8 }, { month: "Jun", score: 94.2 },
];

export default function AuditPage() {
  const { user } = useAuth();
  const [log, setLog] = useState(AUDIT_LOG);

  const resolve = (id: string) => {
    setLog(prev => prev.map(e => e.id === id ? { ...e, resolved: true } : e));
    pushSeniorAlert(`Audit exception resolved: ${id}`, "success", { from: user?.name, fromRole: user?.role ?? "officer", category: "action", ref: id });
    pushNotification(`Exception ${id} resolved`, "success");
    toast(`Exception ${id} resolved. Recorded in audit trail. CPO notified.`, "success");
  };

  const escalate = (id: string, event: string) => {
    pushSeniorAlert(`Audit exception escalated: ${id} — ${event}`, "error", { from: user?.name, fromRole: user?.role ?? "officer", category: "action", ref: id });
    pushNotification(`Exception ${id} escalated`, "warning");
    toast(`Escalated: ${id} — ${event}. Notified: Compliance Officer, CPO, OAG.`, "warning");
  };

  const downloadReport = () => {
    const content = `AUDIT REPORT\n\nDate: ${new Date().toLocaleString()}\nBy: ${user?.name}\n\nCompliance: 94.2%\nOpen Exceptions: ${log.filter(e => !e.resolved).length}\n\n` +
      log.map(e => `${e.id} | ${e.event} | ${e.entity} | ${e.risk} | ${e.resolved ? "Resolved" : "Open"}`).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "audit-report.txt"; a.click();
    URL.revokeObjectURL(url);
    pushNotification("Audit report downloaded", "success");
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Audit & Compliance"
        process="Audit Management"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Phase 23</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader title="Audit & Compliance"
          description="Continuous-audit engine, real-time policy adherence monitoring, exception management, and audit-ready trails."
          actions={
            <button onClick={downloadReport}
              className="h-9 px-4 rounded-xl border border-black/10 bg-white text-sm font-medium hover:bg-[#EAF1F8] flex items-center gap-1.5 transition-colors">
              <Download className="h-4 w-4" /> Audit Report
            </button>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Compliance Score"    value="94.2%" delta="+1.8 pts"                                               icon={Shield} />
          <KpiCard label="Open Exceptions"     value={String(log.filter(e => !e.resolved).length)} delta="+5 today" positive={false} icon={AlertTriangle} />
          <KpiCard label="Resolved This Month" value="312"   delta="87% resolution rate"                                    icon={CheckCircle2} />
          <KpiCard label="Audit Events Today"  value="8,421" delta="All logged"                                              icon={FileText} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader title="Compliance Score Trend" subtitle="Rolling 6-month" />
            <div className="p-4 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={COMPLIANCE_TREND}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[88, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="#334155" strokeWidth={2} dot={{ r: 4, fill: "#334155" }} name="Score %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <CardHeader title="Exceptions by Category" />
            <div className="p-4 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { cat: "Approval", count: 14 }, { cat: "Docs", count: 11 },
                  { cat: "Method",   count: 8  }, { cat: "Vendor", count: 7 },
                  { cat: "Timeline", count: 4  }, { cat: "Finance", count: 3 },
                ]}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="cat" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#64748B" radius={[3, 3, 0, 0]} name="Exceptions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader title="Live Audit Trail" subtitle="Real-time exception log" action={<Badge tone="blue">Continuous</Badge>} />
          <div className="divide-y divide-border">
            {log.map(e => (
              <div key={e.id} className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${e.risk === "High" ? "bg-red-500" : e.risk === "Med" ? "bg-[#0F172A]" : "bg-slate-400"}`} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{e.event}</div>
                    <div className="text-[11px] text-muted-foreground">{e.entity} · {e.id} · {e.timestamp}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <Badge tone={e.risk === "High" ? "red" : e.risk === "Med" ? "amber" : "muted"}>{e.risk}</Badge>
                  <Badge tone={e.resolved ? "green" : "amber"}>{e.resolved ? "Resolved" : "Open"}</Badge>
                  {!e.resolved && <>
                    <button onClick={() => resolve(e.id)}
                      className="h-7 px-2.5 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A] transition-colors">Resolve</button>
                    {e.risk !== "Low" && (
                      <button onClick={() => escalate(e.id, e.event)}
                        className="h-7 px-2.5 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700 transition-colors">Escalate</button>
                    )}
                  </>}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <FeatureGrid features={[
          { title: "Immutable Audit Trail",   desc: "Every event, decision, and AI action cryptographically hashed and logged." },
          { title: "Continuous Audit Engine", desc: "Rules engine evaluates every transaction against PPDPA and Treasury Instructions." },
          { title: "Exception Management",    desc: "Auto-routed exception queues with root-cause analysis and corrective-action tracking." },
          { title: "Auditor Workspace",       desc: "Dedicated workspace for OAG and internal auditors with sampling tools and working papers." },
          { title: "Compliance Dashboards",   desc: "Entity-level scoring, peer benchmarking, trend analysis." },
          { title: "Regulatory Reporting",    desc: "Pre-built PRAZ, OAG, Parliament, and donor-ready reports." },
        ]} />
      </div>
      <InlineWorkbench context="Audit & Compliance" />
    </AppShell>
  );
}
