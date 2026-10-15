import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { FeatureGrid } from "@/components/ModulePage";
import { useAuth } from "@/lib/auth-context";
import { pushSeniorAlert, pushNotification } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import { AlertOctagon, ShieldCheck, Eye, MessageSquare, Send, Download } from "lucide-react";
import InlineWorkbench from "@/components/InlineWorkbench";

const INITIAL_ALERTS = [
  { id: "FRD-2026-089", type: "Bid Rotation",         tender: "ZW-PRA-2026-00179", vendors: "VEN-00476, VEN-00481", severity: "Critical", status: "Referred to ZACC"     },
  { id: "FRD-2026-088", type: "Conflict of Interest",  tender: "ZW-PRA-2026-00181", vendors: "VEN-00478",             severity: "High",     status: "Under Investigation"  },
  { id: "FRD-2026-087", type: "Abnormally Low Bid",    tender: "ZW-PRA-2026-00183", vendors: "VEN-00476",             severity: "High",     status: "Flagged for Review"   },
  { id: "FRD-2026-086", type: "PEP Match",             tender: "ZW-PRA-2026-00177", vendors: "VEN-00480",             severity: "Med",      status: "Screening"            },
  { id: "FRD-2026-085", type: "Spec Tailoring",        tender: "ZW-PRA-2026-00182", vendors: "VEN-00479",             severity: "Med",      status: "Closed — No Evidence" },
];

export default function AntiCorruptionPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [showWhistle, setShowWhistle] = useState(false);
  const [whistleMsg, setWhistleMsg] = useState("");

  const investigate = (id: string) => {
    setAlerts(prev => prev.map(a =>
      a.id === id && !a.status.includes("ZACC") && !a.status.includes("Closed")
        ? { ...a, status: "Under Investigation" } : a
    ));
    pushSeniorAlert(`Anti-Corruption investigation opened: ${id}`, "warning", { from: user?.name, fromRole: user?.role ?? "officer", category: "fraud", ref: id });
    pushNotification(`Investigation opened: ${id}`, "warning");
    toast(`Investigation opened for ${id}. Gather evidence, cross-check vendor relationships, prepare ZACC referral if confirmed. CPO notified.`, "warning");
  };

  const referToZACC = (id: string, type: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: "Referred to ZACC" } : a));
    pushSeniorAlert(`ZACC Referral submitted: ${id} — ${type}`, "error", { from: user?.name, fromRole: user?.role ?? "officer", category: "fraud", ref: id });
    pushNotification(`${id} referred to ZACC`, "error");
    toast(`ZACC Referral submitted for ${id} (${type}). Case ref: ZACC-2026-${id.slice(-3)}. Related procurement suspended. CPO and Minister notified.`, "error");
  };

  const downloadEvidence = (id: string) => {
    const content = `EVIDENCE PACKAGE\n\nAlert ID: ${id}\nGenerated: ${new Date().toLocaleString()}\nBy: ${user?.name ?? "System"}\n\nContents:\n• AI fraud detection analysis\n• Bid comparison data\n• Vendor relationship map\n• Timeline of events\n• Supporting procurement records\n\nConfidential — AI Powered Electronic Public Procurement and Oversight Intelligence System · Anti-Corruption Unit`;
    const blob = new Blob([content], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${id}-evidence.txt`; a.click();
    URL.revokeObjectURL(url);
    pushNotification(`Evidence pack downloaded: ${id}`, "info");
  };

  const submitWhistle = () => {
    if (!whistleMsg.trim()) return;
    pushSeniorAlert("Anonymous whistleblower report received — review required", "warning", { from: "Anonymous", fromRole: "Public", category: "fraud" });
    pushNotification("Whistleblower report submitted securely", "success");
    const ref = "WB-2026-" + Math.floor(Math.random() * 900 + 100);
    toast(`Report submitted securely. Reference: ${ref}. You are protected under the Zimbabwe Whistleblower Protection Act. Response within 10 business days.`, "success");
    setWhistleMsg(""); setShowWhistle(false);
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Integrity & Oversight"
        process="Anti-Corruption Intelligence"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="red">Anti-Corruption</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Anti-Corruption Command"
          description="AI-driven detection of corruption red flags across the entire procurement lifecycle, with secure whistleblower channels and ZACC integration."
          actions={
            <button onClick={() => setShowWhistle(!showWhistle)}
              className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 flex items-center gap-1.5 transition-colors">
              <MessageSquare className="h-4 w-4" /> Whistleblower Report
            </button>
          }
        />

        {showWhistle && (
          <div className="mb-6 bg-slate-900 rounded-2xl p-5">
            <div className="text-sm font-bold text-white mb-1">🔒 Anonymous Whistleblower Channel</div>
            <div className="text-xs text-white/50 mb-3">End-to-end encrypted · Identity never stored · Protected under Zimbabwe Whistleblower Act</div>
            <textarea value={whistleMsg} onChange={e => setWhistleMsg(e.target.value)} rows={3}
              placeholder="Describe the suspected fraud or corruption. Include tender references, vendor names, and dates…"
              className="w-full px-3 py-2.5 rounded-xl bg-white/10 text-white text-sm placeholder-white/30 border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none mb-3" />
            <div className="flex gap-2">
              <button onClick={submitWhistle}
                className="h-9 px-4 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 flex items-center gap-1.5 transition-colors">
                <Send className="h-4 w-4" /> Submit Anonymously
              </button>
              <button onClick={() => setShowWhistle(false)}
                className="h-9 px-4 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Active Fraud Alerts"    value={String(alerts.filter(a => !a.status.includes("Closed")).length)} delta="+3 today"        positive={false} icon={AlertOctagon} />
          <KpiCard label="ZACC Referrals"         value={String(alerts.filter(a => a.status.includes("ZACC")).length)}   delta="This year"        icon={ShieldCheck} />
          <KpiCard label="Whistleblower Reports"  value="12"                                                               delta="4 under review"   icon={MessageSquare} />
          <KpiCard label="PEP Matches"            value="8"                                                                delta="Active screening" positive={false} icon={Eye} />
        </div>

        <Card className="mb-6">
          <CardHeader title="Active Fraud & Corruption Alerts" subtitle="AI-generated, requires human review"
            action={<Badge tone="red">{alerts.filter(a => !a.status.includes("Closed")).length} open</Badge>} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs text-muted-foreground">
                <tr>{["Alert ID","Type","Tender","Vendor(s)","Severity","Status","Actions"].map(h => (
                  <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {alerts.map(a => (
                  <tr key={a.id} className="hover:bg-secondary/40">
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{a.id}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{a.type}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{a.tender}</td>
                    <td className="px-4 py-3 text-foreground text-xs">{a.vendors}</td>
                    <td className="px-4 py-3"><Badge tone={a.severity === "Critical" || a.severity === "High" ? "red" : "amber"}>{a.severity}</Badge></td>
                    <td className="px-4 py-3"><Badge tone={a.status.includes("ZACC") ? "red" : a.status.includes("Closed") ? "muted" : "amber"}>{a.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {!a.status.includes("Closed") && !a.status.includes("ZACC") && (
                          <button onClick={() => investigate(a.id)}
                            className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 transition-colors">Investigate</button>
                        )}
                        {(a.status === "Under Investigation" || a.status === "Flagged for Review") && (
                          <button onClick={() => referToZACC(a.id, a.type)}
                            className="h-7 px-2.5 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700 transition-colors">ZACC Refer</button>
                        )}
                        <button onClick={() => downloadEvidence(a.id)}
                          className="h-7 px-2 rounded-lg border border-border text-xs hover:bg-secondary transition-colors flex items-center gap-1">
                          <Download className="h-3 w-3" /> Pack
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <FeatureGrid features={[
          { title: "Fraud Pattern Detection",       desc: "Repeat winners, bid rotation, identical bids, abnormally low bids, last-minute specification changes." },
          { title: "Conflict of Interest Screening", desc: "Cross-check officers, evaluators, and approvers against vendor directors and beneficial owners." },
          { title: "Beneficial Ownership Registry", desc: "Mandatory UBO disclosure matched against politically exposed person lists." },
          { title: "Whistleblower Portal",           desc: "Encrypted, anonymous channel with case management and protection guarantees." },
          { title: "Sanction & PEP Screening",       desc: "OFAC, UN, EU, and PRAZ blacklist screening on every vendor and transaction." },
          { title: "ZACC Integration",               desc: "Secure case referral and evidence package generation for the Anti-Corruption Commission." },
        ]} />
      </div>
      <InlineWorkbench context="Anti-Corruption" />
    </AppShell>
  );
}
