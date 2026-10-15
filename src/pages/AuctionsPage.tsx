import { useState, useEffect } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import WorkflowStepper from "@/components/WorkflowStepper";
import { Gavel, TrendingUp, Users, Clock, Sparkles, AlertTriangle, CheckCircle2, DollarSign } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { toast } from "@/lib/toast";

const AUCTION_STAGES = [
  { id: 1,  label: "Disposal Planning",  status: "completed" as const, aiRole: "Disposal Advisor" },
  { id: 2,  label: "Asset Registration", status: "completed" as const, aiRole: "Asset AI" },
  { id: 3,  label: "Inspection/Valuation", status: "completed" as const, aiRole: "Valuation AI" },
  { id: 4,  label: "Lot Creation",       status: "completed" as const, aiRole: "Catalog AI" },
  { id: 5,  label: "Media & Catalog",    status: "completed" as const, aiRole: "Catalog AI" },
  { id: 6,  label: "Marketing",          status: "completed" as const, aiRole: "Marketing AI" },
  { id: 7,  label: "Bidder Registration",status: "completed" as const, aiRole: "Registration AI" },
  { id: 8,  label: "Asset Viewing",      status: "completed" as const, aiRole: "Info AI" },
  { id: 9,  label: "Pre-Auction",        status: "active" as const,    aiRole: "Countdown AI" },
  { id: 10, label: "Live Auction",       status: "pending" as const,   aiRole: "Bidding AI" },
  { id: 11, label: "Lot Closure",        status: "pending" as const,   aiRole: "Award AI" },
  { id: 12, label: "Invoicing",          status: "pending" as const,   aiRole: "Finance AI" },
  { id: 13, label: "Payment",            status: "pending" as const,   aiRole: "Payment AI" },
  { id: 14, label: "Release Auth.",      status: "pending" as const,   aiRole: "Release AI" },
  { id: 15, label: "Asset Collection",   status: "pending" as const,   aiRole: "Collections AI" },
  { id: 16, label: "Ownership Transfer", status: "pending" as const,   aiRole: "Docs AI" },
  { id: 17, label: "Seller Settlement",  status: "pending" as const,   aiRole: "Finance AI" },
  { id: 18, label: "Reporting & Audit",  status: "pending" as const,   aiRole: "Audit AI" },
  { id: 19, label: "Post-Auction Intel", status: "pending" as const,   aiRole: "Analytics AI" },
];

const UPCOMING_AUCTIONS = [
  { id: "AUC-2026-014", title: "Government Fleet Vehicles — Harare", date: "2026-06-28 10:00", lots: 24, registered: 142, reserve: "USD 480,000", status: "Pre-Auction" },
  { id: "AUC-2026-013", title: "ICT Equipment Disposal — Ministry of Finance", date: "2026-07-05 09:00", lots: 38, registered: 89, reserve: "USD 120,000", status: "Registration Open" },
  { id: "AUC-2026-012", title: "Office Furniture & Fixtures — ZIMRA HQ", date: "2026-07-12 14:00", lots: 62, registered: 214, reserve: "USD 65,000", status: "Live Now" },
];

const LIVE_LOTS = [
  { lot: "LOT-001", desc: "2019 Toyota Land Cruiser — 78,000km", reserve: 18000, current: 22500, bids: 8, bidder: "B-0421", timeLeft: 45, hot: true },
  { lot: "LOT-002", desc: "2020 Ford Ranger — 62,000km", reserve: 15000, current: 17800, bids: 5, bidder: "B-0318", timeLeft: 120, hot: false },
  { lot: "LOT-003", desc: "2018 Toyota Hilux (x2 units)", reserve: 24000, current: 24000, bids: 1, bidder: "B-0201", timeLeft: 480, hot: false },
  { lot: "LOT-004", desc: "2021 Mitsubishi L200 — 45,000km", reserve: 19500, current: 28400, bids: 12, bidder: "B-0589", timeLeft: 22, hot: true },
];

function CountdownTimer({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = Math.floor(left / 60), s = left % 60;
  const urgent = left < 60;
  return (
    <span className={`font-mono text-sm font-bold ${urgent ? "text-red-600 animate-pulse" : "text-foreground"}`}>
      {m}:{String(s).padStart(2, "0")}
    </span>
  );
}

const BID_HISTORY = Array.from({ length: 12 }, (_, i) => ({
  time: `${String(10 + i).padStart(2,"0")}:${String(Math.floor(Math.random()*59)).padStart(2,"0")}`,
  bid: 18000 + i * 450 + Math.floor(Math.random() * 200),
}));

export default function AuctionsPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "live" | "workflow" | "agents">("dashboard");
  const [selectedLot, setSelectedLot] = useState(LIVE_LOTS[0]);
  const [bidAmount, setBidAmount] = useState(selectedLot.current + 500);
  const [bidPlaced, setBidPlaced] = useState(false);
  const [lots, setLots] = useState(LIVE_LOTS);

  const handleBid = () => {
    if (bidAmount <= selectedLot.current) {
      toast(`Invalid bid — USD ${bidAmount.toLocaleString()} must exceed current bid of USD ${selectedLot.current.toLocaleString()}. Minimum: USD ${(selectedLot.current + 500).toLocaleString()}.`, "error");
      return;
    }
    setLots(prev => prev.map(l =>
      l.lot === selectedLot.lot
        ? { ...l, current: bidAmount, bids: l.bids + 1, bidder: "B-YOUR" }
        : l
    ));
    const updated = { ...selectedLot, current: bidAmount, bids: selectedLot.bids + 1, bidder: "B-YOUR" };
    setSelectedLot(updated);
    setBidAmount(bidAmount + 500);
    setBidPlaced(true);
    setTimeout(() => setBidPlaced(false), 3000);
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Auctions & Reverse Auctions"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="amber">Live Online Auctions · Asset Disposal</Badge>
          <Badge tone="muted">Government of Zimbabwe · Public Asset Management</Badge>
          <Badge tone="green"><span className="h-1.5 w-1.5 rounded-full bg-[#0F172A] inline-block mr-1 animate-pulse" />1 Auction Live Now</Badge>
        </div>
        <PageHeader
          title="Live Online Auction Platform"
          description="Real-time asset disposal with 19-stage automated workflow, AI fraud detection, and instant settlement. Transparent public asset management."
          actions={
            <button
              onClick={() => toast("Create Auction Event — 19-stage setup wizard. Required: Disposal approval, PRAZ notification, asset valuation certificates, AI catalog generation. Navigate to 19-Stage Workflow tab.", "info")}
              className="h-9 px-3 rounded-md bg-[#0F172A] text-white text-sm font-medium hover:opacity-90 flex items-center gap-1.5"
            >
              <Gavel className="h-4 w-4" /> Create Auction Event
            </button>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Active Auctions" value="3" delta="1 live now" icon={Gavel} />
          <KpiCard label="Registered Bidders" value="445" delta="+142 for June event" icon={Users} />
          <KpiCard label="Revenue This Month" value="USD 1.84M" delta="+18% vs plan" icon={DollarSign} />
          <KpiCard label="Lots Sold YTD" value="284" delta="92.3% sold rate" icon={TrendingUp} />
        </div>

        <div className="flex gap-1 mb-6 border-b border-border flex-wrap">
          {([["dashboard","Auction Dashboard"],["live","🔴 Live Auction Room"],["workflow","19-Stage Workflow"],["agents","AI Agents"]] as const).map(([k, label]) => (
            <button key={k} onClick={() => setActiveTab(k)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === k ? "border-slate-200 text-[#0F172A]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {UPCOMING_AUCTIONS.map((a) => (
                <Card key={a.id} className={`p-5 ${a.status === "Live Now" ? "border-slate-200 shadow-elevated" : ""}`}>
                  {a.status === "Live Now" && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-xs font-bold text-red-600 uppercase">LIVE NOW</span>
                    </div>
                  )}
                  <div className="text-sm font-bold text-foreground mb-1">{a.title}</div>
                  <div className="text-[11px] text-muted-foreground mb-3">{a.id} · {a.date}</div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-center p-2 bg-secondary rounded-lg">
                      <div className="text-lg font-bold text-foreground">{a.lots}</div>
                      <div className="text-[10px] text-muted-foreground">Lots</div>
                    </div>
                    <div className="text-center p-2 bg-secondary rounded-lg">
                      <div className="text-lg font-bold text-foreground">{a.registered}</div>
                      <div className="text-[10px] text-muted-foreground">Registered</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">Reserve: <span className="font-semibold text-foreground">{a.reserve}</span></div>
                  <button
                    onClick={() => setActiveTab("live")}
                    className={`w-full h-8 rounded-md text-xs font-semibold transition-colors ${a.status === "Live Now" ? "bg-[#0F172A] text-white hover:opacity-90" : "border border-border hover:bg-secondary"}`}
                  >
                    {a.status === "Live Now" ? "Enter Auction Room →" : "View Details"}
                  </button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "live" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Lot List */}
            <Card>
              <CardHeader title="Active Lots" subtitle="AUC-2026-012 · Office Furniture" action={<Badge tone="red">Live</Badge>} />
              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {lots.map((lot) => (
                  <div key={lot.lot} onClick={() => { setSelectedLot(lot); setBidAmount(lot.current + 500); }}
                    className={`px-4 py-3 cursor-pointer hover:bg-secondary/40 transition-colors ${selectedLot.lot === lot.lot ? "bg-slate-50 border-l-2 border-slate-200" : ""}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-foreground">{lot.lot}</span>
                      <CountdownTimer seconds={lot.timeLeft} />
                    </div>
                    <div className="text-xs text-muted-foreground mb-1.5">{lot.desc}</div>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-[10px] text-muted-foreground">Current Bid</div>
                        <div className="text-sm font-bold text-[#0F172A]">USD {lot.current.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground">{lot.bids} bids</div>
                        {lot.hot && <Badge tone="red">Hot</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Live Bidding Interface */}
            <Card className="lg:col-span-2">
              <CardHeader
                title={selectedLot.lot}
                subtitle={selectedLot.desc}
                action={<div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /><span className="text-xs font-bold text-red-600">LIVE</span></div>}
              />
              <div className="p-5">
                {/* Bid Stats */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { l: "Reserve Price", v: `USD ${selectedLot.reserve.toLocaleString()}` },
                    { l: "Current Bid", v: `USD ${selectedLot.current.toLocaleString()}`, highlight: true },
                    { l: "Total Bids", v: selectedLot.bids.toString() },
                    { l: "Leading Bidder", v: selectedLot.bidder },
                  ].map((s) => (
                    <div key={s.l} className={`rounded-lg p-3 text-center ${s.highlight ? "bg-slate-50 border border-slate-200" : "bg-secondary"}`}>
                      <div className="text-[10px] text-muted-foreground">{s.l}</div>
                      <div className={`text-sm font-bold mt-0.5 ${s.highlight ? "text-[#0F172A]" : "text-foreground"}`}>{s.v}</div>
                    </div>
                  ))}
                </div>

                {/* Bid Chart */}
                <div className="h-[160px] mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={BID_HISTORY}>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11 }} />
                      <Line type="stepAfter" dataKey="bid" stroke="#64748B" strokeWidth={2.5} dot={{ r: 3, fill: "#64748B" }} name="Bid (USD)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Bidding Controls */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="text-sm font-bold text-foreground mb-3">Place Your Bid</div>
                  <div className="flex gap-2 mb-3">
                    {[500, 1000, 2000, 5000].map((inc) => (
                      <button key={inc} onClick={() => setBidAmount(selectedLot.current + inc)}
                        className="flex-1 h-8 rounded-md border border-slate-200 bg-white text-xs font-semibold text-[#0F172A] hover:bg-slate-100 transition-colors">
                        +{inc.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">USD</span>
                      <input
                        type="number" value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        className="w-full h-10 pl-12 pr-3 rounded-lg border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <button
                      onClick={handleBid}
                      className="h-10 px-5 rounded-lg bg-[#0F172A] text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-1.5"
                    >
                      <Gavel className="h-4 w-4" /> {bidPlaced ? "✓ Bid Placed!" : "Bid Now"}
                    </button>
                  </div>
                  <div className="mt-2 text-[11px] text-[#0F172A]">Min increment: USD 500 · Your deposit: USD 5,000 (confirmed)</div>
                </div>

                {/* AI Fraud Monitor */}
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-[#0F172A] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-[#0F172A]">AI Fraud Monitor: </span>
                    <span className="text-xs text-[#0F172A]">No suspicious bidding patterns detected. 3 registered bidders active on this lot. Bidding velocity: normal.</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "workflow" && (
          <div className="space-y-6">
            <Card>
              <CardHeader title="Live Auction 19-Stage Workflow" subtitle="AI agent active at every stage" />
              <div className="p-5">
                <WorkflowStepper steps={AUCTION_STAGES.slice(0, 10)} orientation="horizontal" />
                <div className="my-4 border-t border-dashed border-border" />
                <WorkflowStepper steps={AUCTION_STAGES.slice(10)} orientation="horizontal" />
              </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Pre-Auction (Stages 1–9)", items: ["Asset registration & QR tagging", "AI photo analysis for condition scoring", "Market-comparable valuation AI", "Smart lot bundling recommendations", "Automated catalog generation", "Multi-channel marketing campaigns", "Bidder KYC & deposit management"] },
                { title: "Live Auction (Stages 10–11)", items: ["Real-time bidding engine", "Anti-sniping time extensions", "AI fraud pattern detection", "Auto-bid system", "Live bid history & dashboard", "Automatic lot closure & winner determination"] },
                { title: "Post-Auction (Stages 12–19)", items: ["Automated invoicing with buyer premiums", "Payment integration (EFT, mobile money)", "QR-coded gate passes for collection", "Digital ownership transfer documents", "Seller settlement & commission deduction", "AI-generated auction performance reports"] },
              ].map((s) => (
                <Card key={s.title} className="p-4">
                  <div className="text-sm font-bold text-foreground mb-3">{s.title}</div>
                  <div className="space-y-1.5">
                    {s.items.map(item => (
                      <div key={item} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "agents" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: "Disposal Advisor AI", resp: "Plans auctions & disposal strategy", conf: 92, action: "Recommending optimal auction dates for July fleet disposal" },
              { name: "Asset Valuation AI", resp: "Estimates market values from photos & data", conf: 89, action: "Valued 24 vehicles — comparable market analysis completed" },
              { name: "Catalog AI", resp: "Generates descriptions & listings", conf: 94, action: "Created 38 ICT equipment listings with enhanced photos" },
              { name: "Marketing AI", resp: "Runs automated campaigns", conf: 88, action: "Email campaign sent — 2,841 potential bidders reached" },
              { name: "Registration AI", resp: "Assists bidder onboarding & KYC", conf: 96, action: "142 bidders verified for AUC-2026-014" },
              { name: "Fraud Detection AI", resp: "Detects suspicious bidding patterns", conf: 91, action: "Monitoring AUC-2026-012 — no anomalies detected" },
              { name: "Bidding Intelligence AI", resp: "Real-time auction analytics", conf: 87, action: "Predicting LOT-001 final bid: USD 26,500–28,000" },
              { name: "Finance AI", resp: "Invoices, payments & settlement", conf: 98, action: "Processed 14 invoices — USD 284,000 collected" },
              { name: "Compliance AI", resp: "Ensures regulatory compliance", conf: 97, action: "All disposal approvals verified — PRAZ & Treasury" },
            ].map((a) => (
              <Card key={a.name} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[#0F172A] grid place-items-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-foreground leading-tight">{a.name}</div>
                      <div className="text-[10px] text-muted-foreground">{a.resp}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-[#0F172A]">{a.conf}%</div>
                    <div className="text-[9px] text-muted-foreground">conf.</div>
                  </div>
                </div>
                <div className="text-[11px] text-muted-foreground italic mb-2">"{a.action}"</div>
                <div className="h-1 rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-[#0F172A]" style={{ width: `${a.conf}%` }} />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AIAssistantPanel
        agentName="Auction Intelligence AI"
        agentRole="Disposal strategy, fraud detection, bidding analytics"
        context="live auction platform"
        color="amber"
        suggestedPrompts={["What is the reserve price strategy?", "Detect suspicious bidders", "Predict final lot values", "Generate auction report"]}
      />
    </AppShell>
  );
}
