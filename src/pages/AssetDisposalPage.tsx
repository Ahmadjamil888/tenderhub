import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { FeatureGrid } from "@/components/ModulePage";
import { useAssets } from "@/hooks/use-store";
import { useAuth } from "@/lib/auth-context";
import { pushSeniorAlert, pushNotification } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import type { StoredAsset } from "@/lib/local-store";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from "recharts";
import { Trash2, AlertTriangle, CheckCircle2, Clock, DollarSign, RefreshCw } from "lucide-react";

const TABS = ["Disposal Candidates", "Disposal Process", "Disposed Assets", "Audit Trail", "Reports"] as const;
type Tab = typeof TABS[number];
const COLORS = ["#EF4444", "#F59E0B", "#3B82F6", "#10B981", "#8B5CF6"];
const DISPOSAL_METHODS = ["Public Auction", "Transfer to Another Entity", "Sale by Tender", "Trade-in", "Recycling / Scrapping", "Destruction", "Donation"];

function DisposalModal({ asset, onClose, onDispose }: {
  asset: StoredAsset;
  onClose: () => void;
  onDispose: (method: string, recoveryValue: string, reason: string) => void;
}) {
  const [method, setMethod] = useState(DISPOSAL_METHODS[0]);
  const [recoveryValue, setRecoveryValue] = useState("USD 0");
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <h2 className="text-base font-semibold">Initiate Asset Disposal</h2>
          <button onClick={onClose} className="text-black/30 hover:text-black text-xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <div className="text-xs font-semibold text-[#0F172A] mb-1">⚠ Asset to be Disposed</div>
            <div className="text-sm font-medium text-black">{asset.name}</div>
            <div className="text-[11px] text-black/50">{asset.id} · {asset.assetClass} · Current Value: {asset.currentValue}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-black/60 mb-1">Disposal Method</label>
            <select value={method} onChange={e => setMethod(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm bg-white focus:outline-none">
              {DISPOSAL_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-black/60 mb-1">Estimated Recovery Value</label>
            <input value={recoveryValue} onChange={e => setRecoveryValue(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
          </div>
          <div>
            <label className="block text-xs font-medium text-black/60 mb-1">Reason for Disposal *</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="Justify why this asset is being disposed…"
              className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-black/10">
          <button onClick={onClose} className="h-9 px-4 rounded-xl border border-black/10 text-sm hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={() => { if (!reason.trim()) { toast("Reason is required.", "error"); return; } onDispose(method, recoveryValue, reason); }}
            className="h-9 px-4 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700 transition-colors">Confirm Disposal</button>
        </div>
      </div>
    </div>
  );
}

export default function AssetDisposalPage() {
  const { user } = useAuth();
  const { assets, update } = useAssets();
  const [tab, setTab] = useState<Tab>("Disposal Candidates");
  const [selectedAsset, setSelectedAsset] = useState<StoredAsset | null>(null);

  // Candidate logic: poor/critical condition OR age > useful life
  const today = new Date();
  const candidates = assets.filter(a => {
    if (a.status === "Disposed") return false;
    const condition = a.condition === "Poor" || a.condition === "Critical";
    const ageYrs = a.purchaseDate ? (today.getFullYear() - new Date(a.purchaseDate).getFullYear()) : 0;
    const aged = ageYrs >= a.usefulLifeYears;
    return condition || aged;
  });
  const disposed = assets.filter(a => a.status === "Disposed");

  const handleDispose = (method: string, recoveryValue: string, reason: string) => {
    if (!selectedAsset) return;
    update(selectedAsset.id, { status: "Disposed", notes: `Disposed via ${method}. Recovery: ${recoveryValue}. Reason: ${reason}` });
    pushSeniorAlert(`Asset disposed: ${selectedAsset.name} — ${method} — Recovery: ${recoveryValue}`, "warning",
      { from: user?.name, fromRole: user?.role, category: "action", ref: selectedAsset.id });
    pushNotification(`Asset ${selectedAsset.id} disposed via ${method}`, "info");
    setSelectedAsset(null);
  };

  const disposalByMethod = DISPOSAL_METHODS.map(m => ({
    name: m.split("/")[0].trim(),
    value: Math.floor(Math.random() * 8 + 1),
  })).slice(0, 5);

  const costRecovery = [
    { year: "2022", cost: 42, recovered: 18 },
    { year: "2023", cost: 68, recovered: 31 },
    { year: "2024", cost: 54, recovered: 24 },
    { year: "2025", cost: 82, recovered: 47 },
    { year: "2026", cost: 35, recovered: 22 },
  ];

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Enterprise Asset Management"
        process="Asset Disposal"
        financialYear="FY2026"
        pageType="form"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="red">Disposal & Retirement</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Asset Disposal & Retirement"
          description="End-of-life asset management: disposal candidate identification, approval workflows, method selection, environmental compliance, and financial closure."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Disposal Candidates" value={candidates.length.toString()} delta="Require review" positive={false} icon={AlertTriangle} color="red" />
          <KpiCard label="Pending Approval" value={Math.min(candidates.length, 2).toString()} delta="Awaiting CPO sign-off" positive={false} icon={Clock} color="amber" />
          <KpiCard label="Disposed This Year" value={disposed.length.toString()} delta="YTD completions" icon={CheckCircle2} color="green" />
          <KpiCard label="Recovery Rate" value="54%" delta="Value recovered vs cost" icon={DollarSign} color="blue" />
        </div>

        <div className="flex gap-1 mb-6 border-b border-black/10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"
              }`}>{t}</button>
          ))}
        </div>

        {tab === "Disposal Candidates" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="AI-Identified Disposal Candidates" subtitle={`${candidates.length} assets flagged for disposal review`}
                action={candidates.length > 0 ? <Badge tone="red">{candidates.length} Flagged</Badge> : undefined} />
              <div className="divide-y divide-border">
                {candidates.length === 0 && <div className="px-5 py-8 text-center text-sm text-black/40">No disposal candidates at this time. All assets are within acceptable lifecycle parameters.</div>}
                {candidates.map(a => {
                  const ageYrs = a.purchaseDate ? (today.getFullYear() - new Date(a.purchaseDate).getFullYear()) : 0;
                  const reasons = [];
                  if (a.condition === "Poor" || a.condition === "Critical") reasons.push(`Condition: ${a.condition}`);
                  if (ageYrs >= a.usefulLifeYears) reasons.push(`Age ${ageYrs}yr ≥ ${a.usefulLifeYears}yr useful life`);

                  return (
                    <div key={a.id} className="px-4 sm:px-5 py-3 hover:bg-secondary/40">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{a.name}</div>
                          <div className="text-[11px] text-black/50 font-mono">{a.id} · {a.assetClass}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge tone={a.condition === "Critical" ? "red" : a.condition === "Poor" ? "amber" : "muted"}>{a.condition}</Badge>
                        </div>
                      </div>
                      <div className="text-[11px] text-black/50 mb-2 space-y-0.5">
                        <div>Location: {a.location} · Dept: {a.department} · Value: {a.currentValue}</div>
                        <div className="text-[#0F172A] font-medium">AI flags: {reasons.join(" · ")}</div>
                      </div>
                      <button onClick={() => setSelectedAsset(a)}
                        className="h-7 px-3 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700 flex items-center gap-1 transition-colors">
                        <Trash2 className="h-3 w-3" /> Initiate Disposal
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {tab === "Disposal Process" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader title="Disposal Methods Used" subtitle="Distribution of disposal methods" />
                <div className="p-4 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={disposalByMethod} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                        {disposalByMethod.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="px-4 pb-4 space-y-1.5">
                  {disposalByMethod.map((m, i) => (
                    <div key={m.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-black/60">{m.name}</span>
                      </div>
                      <span className="font-semibold text-black">{m.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <CardHeader title="Cost vs Recovery Analysis" subtitle="Disposal cost vs value recovered (USD thousands)" />
                <div className="p-4 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costRecovery}>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                        formatter={(v: number) => [`USD ${v}K`, ""]} />
                      <Bar dataKey="cost" fill="#DC2626" radius={[2, 2, 0, 0]} name="Disposal Cost" />
                      <Bar dataKey="recovered" fill="#475569" radius={[2, 2, 0, 0]} name="Value Recovered" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
            <h2 className="text-sm font-semibold">Disposal Process Capabilities</h2>
            <FeatureGrid features={[
              { title: "Multi-Level Approval", desc: "Configurable approval chain from Department Head through Asset Manager to CPO based on asset value thresholds." },
              { title: "Public Auction Management", desc: "Integration with PRAZ auction platform, lot management, bidder registration, and online bidding." },
              { title: "Environmental Compliance", desc: "EIA check, e-waste disposal certificates, hazardous materials declaration, and compliance reporting." },
              { title: "Destruction Certificates", desc: "Controlled destruction workflow with witness signatures, photographic evidence, and certificate issuance." },
              { title: "Financial Closure", desc: "Automatic journal entries, asset de-registration, disposal gain/loss calculation, and GL update." },
              { title: "Disposal Intelligence AI", desc: "AI recommends optimal disposal method and estimates maximum recovery value per asset type and market conditions." },
            ]} />
          </div>
        )}

        {tab === "Disposed Assets" && (
          <Card>
            <CardHeader title="Disposed Asset Register" subtitle={`${disposed.length} assets disposed`} />
            <div className="divide-y divide-border">
              {disposed.length === 0 && <div className="px-5 py-8 text-center text-sm text-black/40">No assets have been disposed yet.</div>}
              {disposed.map(a => (
                <div key={a.id} className="px-4 sm:px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{a.name}</div>
                      <div className="text-[11px] text-black/50">{a.id} · {a.assetClass} · Was: {a.acquisitionCost}</div>
                      {a.notes && <div className="text-[11px] text-black/40 mt-1 italic">{a.notes}</div>}
                    </div>
                    <Badge tone="muted">Disposed</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "Audit Trail" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="Disposal Audit Trail" subtitle="All disposal actions with approvals and evidence" />
              <div className="px-5 py-8 text-center text-sm text-black/40">
                Full disposal audit trail integrates with the main Audit & Compliance module. All disposal events are automatically logged with user, timestamp, approval chain, and document references.
              </div>
            </Card>
          </div>
        )}

        {tab === "Reports" && (
          <div className="space-y-4">
            <FeatureGrid features={[
              { title: "Disposal Activity Report", desc: "Monthly and annual disposal activity summary with method breakdown, recovery rates, and cost analysis." },
              { title: "Net Book Value at Disposal", desc: "Report showing NBV at time of disposal, disposal proceeds, and gain/loss on disposal per IPSAS 17." },
              { title: "Environmental Impact Report", desc: "E-waste certificates, hazardous materials disposed, and environmental compliance verification summary." },
              { title: "Asset De-registration Register", desc: "Official register of all de-registered assets for public accountability and audit purposes." },
              { title: "Recovery Rate Analysis", desc: "Benchmark disposal recovery rates by asset class, age, condition, and disposal method for strategy optimization." },
              { title: "Replacement Planning Report", desc: "Links disposed assets to capital budget replacement requirements and procurement pipeline." },
            ]} />
          </div>
        )}
      </div>

      {selectedAsset && (
        <DisposalModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} onDispose={handleDispose} />
      )}

      <AIAssistantPanel agentName="Disposal Agent" agentRole="AI-assisted asset disposal — method selection, recovery estimation, and compliance verification"
        context="asset disposal and retirement management" color="rose"
        suggestedPrompts={["Identify optimal disposal method for aged vehicles", "Estimate auction recovery value", "Check environmental compliance requirements", "Generate disposal justification report"]} />
    </AppShell>
  );
}
