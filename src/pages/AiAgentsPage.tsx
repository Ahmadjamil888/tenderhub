import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from "recharts";
import { aiAgents } from "@/lib/mock-data";
import { Sparkles, CheckCircle2, Clock, Activity, Zap, AlertTriangle, TrendingUp } from "lucide-react";
import { pushNotification } from "@/lib/local-store";

const BLUE = "#334155";
const GREEN = "#475569";

export default function AiAgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState(aiAgents[0]);
  const [consoleOpen, setConsoleOpen] = useState(false);

  const handleOpenConsole = () => {
    setConsoleOpen(true);
    pushNotification(`${selectedAgent.name} console opened — ${selectedAgent.actions.toLocaleString()} actions logged, ${selectedAgent.pending} pending review.`, "info");
  };

  const agentActivityData = Array.from({ length: 12 }, (_, i) => ({
    time: `${String(i * 2).padStart(2, "0")}:00`,
    actions: Math.floor(Math.random() * 200 + 50),
    approvals: Math.floor(Math.random() * 50 + 10),
  }));

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="AI & Automation"
        process="AI Agents Orchestration"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="AI Operations Center"
          description="Real-time status of every AI agent operating across the national procurement lifecycle."
          actions={
            <Badge tone="green">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[#0F172A] inline-block animate-pulse" />
              {aiAgents.filter(a => a.status === "Active").length} agents live
            </Badge>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Actions Today" value="6,284" delta="+12.3%" icon={Activity} />
          <KpiCard label="Pending Reviews" value="74" delta="-5 from yesterday" icon={Clock} />
          <KpiCard label="Avg Confidence" value="92.5%" delta="+0.8 pts" icon={TrendingUp} />
          <KpiCard label="Auto-approved" value="5,840" delta="92.9% rate" icon={Zap} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Agent Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiAgents.map((a) => (
              <div
                key={a.name}
                onClick={() => setSelectedAgent(a)}
              >
              <Card
                className={`p-4 cursor-pointer transition-all hover:border-primary/40 ${selectedAgent.name === a.name ? "border-primary ring-1 ring-primary" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-md bg-slate-50 text-primary grid place-items-center flex-shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{a.name}</div>
                      <Badge tone={a.status === "Active" ? "green" : "muted"}>{a.status}</Badge>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-semibold text-primary">{a.confidence}%</div>
                    <div className="text-[10px] text-muted-foreground">confidence</div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-600" /> {a.actions.toLocaleString()} actions
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-slate-600" /> {a.pending} pending
                  </div>
                </div>
                {/* Confidence bar */}
                <div className="mt-2 h-1 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${a.confidence}%` }} />
                </div>
              </Card>
              </div>
            ))}
          </div>

          {/* Selected Agent Detail */}
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground grid place-items-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">{selectedAgent.name}</div>
                <Badge tone="green">{selectedAgent.status}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Confidence", value: `${selectedAgent.confidence}%` },
                { label: "Actions", value: selectedAgent.actions.toLocaleString() },
                { label: "Pending", value: selectedAgent.pending.toString() },
                { label: "Success Rate", value: "99.2%" },
              ].map((s) => (
                <div key={s.label} className="rounded-md border border-border p-3">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                  <div className="text-base font-semibold mt-0.5">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={agentActivityData}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="actions" stroke={BLUE} strokeWidth={2} dot={false} name="Actions" />
                  <Line type="monotone" dataKey="approvals" stroke={GREEN} strokeWidth={2} dot={false} name="Approvals" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <button onClick={handleOpenConsole} className="mt-4 w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              {consoleOpen ? "Console Active ✓" : "Open Agent Console"}
            </button>
          </Card>
        </div>

        {/* Recent AI Decisions */}
        <Card>
          <CardHeader title="Recent AI Decisions" subtitle="Last 24 hours · explainable AI trail" />
          <div className="divide-y divide-border">
            {[
              { agent: "Fraud Detection Agent", action: "Flagged 4 abnormally low bids on ZW-PRA-2026-00179", confidence: 94, approval: "Pending review", sev: "high" },
              { agent: "Tender Drafting Copilot", action: "Generated TOR & BOQ draft for District Hospitals tender", confidence: 89, approval: "Approved by PO", sev: "ok" },
              { agent: "Supplier Verification Agent", action: "Auto-approved 12 vendor KYC submissions", confidence: 97, approval: "Auto-approved", sev: "ok" },
              { agent: "Contract Intelligence Agent", action: "Extracted 134 obligations from 8 new contracts", confidence: 96, approval: "Auto-approved", sev: "ok" },
              { agent: "Award Recommendation Agent", action: "Recommended Zimbabwe Pharma Holdings for ARV framework", confidence: 92, approval: "Pending adjudication", sev: "med" },
              { agent: "Compliance Checker", action: "Flagged procurement method deviation in ZW-PRA-2026-00182", confidence: 98, approval: "Pending review", sev: "med" },
            ].map((d, i) => (
              <div key={i} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${d.sev === "high" ? "bg-red-500" : d.sev === "med" ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} />
                  <div>
                    <div className="text-sm font-medium text-foreground">{d.action}</div>
                    <div className="text-[11px] text-muted-foreground">{d.agent} · confidence {d.confidence}%</div>
                  </div>
                </div>
                <Badge tone={d.approval.includes("Pending") ? "amber" : "green"}>{d.approval}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
