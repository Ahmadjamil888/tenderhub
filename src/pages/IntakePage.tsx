/**
 * IntakePage — Unified Procurement Intake Portal
 * Single "front door" for all procurement requests.
 * AI auto-routes each request to the correct workflow.
 * Better than SAP Ariba's intake management — government-specific, AI-native.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import { pushNotification } from "@/lib/local-store";
import {
  Sparkles, ChevronRight, FileText, ShoppingCart, Users, Gavel,
  Zap, CheckCircle2, Clock, AlertTriangle, ArrowRight, Search,
  Building2, DollarSign, Calendar, Send, X, Bot, TrendingUp,
  Shield, Package, Wrench, FileSearch, Target, RefreshCw,
} from "lucide-react";

// ─── Request Types ────────────────────────────────────────────────────────────
type RequestType = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  desc: string;
  route: string;
  threshold?: string;
  aiAction: string;
};

const REQUEST_TYPES: RequestType[] = [
  { id: "tender",      label: "New Tender",         icon: FileText,    color: "text-[#0F172A]",   bg: "bg-slate-50",    desc: "Open/restricted tender. Value > USD 50,000. Full technical + financial evaluation.", route: "/workbench/planning",          threshold: "> USD 50K",  aiAction: "Analysing procurement method & budget…" },
  { id: "rfq",         label: "Request for Quote",   icon: ShoppingCart,color: "text-[#0F172A]",bg: "bg-slate-50", desc: "Goods/services. Value USD 5K–50K. At least 3 quotations required.",                   route: "/workbench/rfq",               threshold: "USD 5K–50K", aiAction: "Checking 3-quote compliance & supplier list…" },
  { id: "direct",      label: "Direct Procurement",  icon: Target,      color: "text-[#0F172A]",  bg: "bg-slate-50",   desc: "Emergency or sole-source. Requires pre-approval. Value < USD 5,000.",                   route: "/workbench/strategy",          threshold: "< USD 5K",   aiAction: "Verifying emergency justification…" },
  { id: "rfp",         label: "Request for Proposal",icon: FileSearch,  color: "text-[#0F172A]", bg: "bg-slate-50",  desc: "Consultancy services. QCBS evaluation. Requires TOR and budget.",                        route: "/workbench/rfp",               threshold: "Any value",  aiAction: "Drafting TOR template & evaluation criteria…" },
  { id: "eoi",         label: "Expression of Interest",icon: Users,     color: "text-[#0F172A]",   bg: "bg-slate-50",    desc: "Shortlisting exercise for complex engagements. Prequalification.",                        route: "/workbench/eoi",               threshold: "Any value",  aiAction: "Building supplier qualification matrix…" },
  { id: "asset",       label: "Asset Requisition",   icon: Package,     color: "text-[#0F172A]", bg: "bg-slate-50",  desc: "Capital equipment or asset acquisition. Requires asset register entry.",                   route: "/workbench/asset-management",  threshold: "Any value",  aiAction: "Checking existing assets & depreciation…" },
  { id: "maintenance", label: "Maintenance Request", icon: Wrench,      color: "text-rose-700",   bg: "bg-rose-50",    desc: "Repair/maintenance services. Links to asset record and maintenance schedule.",              route: "/assets/maintenance",          threshold: "Any value",  aiAction: "Retrieving asset history & maintenance log…" },
  { id: "inventory",   label: "Stock Requisition",   icon: Package,     color: "text-slate-500",   bg: "bg-slate-50",    desc: "Inventory replenishment or internal issue request from stores.",                          route: "/inventory/requests",          threshold: "Any value",  aiAction: "Checking stock levels & reorder points…" },
];

// ─── Recent Requests ──────────────────────────────────────────────────────────
const RECENT: { id: string; title: string; type: string; status: string; submitted: string; value: string; route: string }[] = [
  { id: "INT-2026-0841", title: "Procurement of Laboratory Reagents — Q3 2026",    type: "RFQ",    status: "Routing",   submitted: "Today 09:14",  value: "USD 38,000",   route: "/workbench/rfq" },
  { id: "INT-2026-0840", title: "CCTV Installation — Harare Regional Office",      type: "Tender", status: "Approved",  submitted: "Today 08:42",  value: "USD 142,000",  route: "/workbench/planning" },
  { id: "INT-2026-0839", title: "Consultancy — Procurement Audit FY2026",          type: "RFP",    status: "Approved",  submitted: "Yesterday",    value: "USD 85,000",   route: "/workbench/rfp" },
  { id: "INT-2026-0838", title: "Office Furniture — New Masvingo Branch",          type: "Direct", status: "Rejected",  submitted: "Yesterday",    value: "USD 4,200",    route: "/workbench/strategy" },
  { id: "INT-2026-0837", title: "Server Room UPS Replacement",                     type: "RFQ",    status: "Submitted", submitted: "Mon",          value: "USD 22,500",   route: "/workbench/rfq" },
  { id: "INT-2026-0836", title: "Expression of Interest — Urban Roads Framework",  type: "EOI",    status: "Approved",  submitted: "Mon",          value: "USD 2.4M",     route: "/workbench/eoi" },
];

// ─── AI Routing Logic ─────────────────────────────────────────────────────────
function deriveRoute(value: number, urgency: string, category: string): RequestType {
  if (urgency === "emergency" && value < 5000) return REQUEST_TYPES.find(r => r.id === "direct")!;
  if (category === "consultancy" || category === "professional")  return REQUEST_TYPES.find(r => r.id === "rfp")!;
  if (category === "asset")       return REQUEST_TYPES.find(r => r.id === "asset")!;
  if (category === "maintenance") return REQUEST_TYPES.find(r => r.id === "maintenance")!;
  if (category === "inventory")   return REQUEST_TYPES.find(r => r.id === "inventory")!;
  if (value > 50000)  return REQUEST_TYPES.find(r => r.id === "tender")!;
  if (value >= 5000)  return REQUEST_TYPES.find(r => r.id === "rfq")!;
  return REQUEST_TYPES.find(r => r.id === "direct")!;
}

function statusBadge(s: string) {
  const m: Record<string, string> = {
    Routing:   "bg-slate-100 text-[#0F172A]",
    Approved:  "bg-slate-100 text-[#0F172A]",
    Rejected:  "bg-red-100 text-red-700",
    Submitted: "bg-slate-100 text-[#0F172A]",
    Draft:     "bg-gray-100 text-gray-600",
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${m[s] ?? "bg-gray-100 text-gray-600"}`}>{s}</span>;
}

// ─── New Request Form ─────────────────────────────────────────────────────────
function NewRequestForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: RequestType) => void }) {
  const [step, setStep] = useState(1);
  const [title, setTitle]       = useState("");
  const [dept, setDept]         = useState("");
  const [category, setCategory] = useState("goods");
  const [valueStr, setValueStr] = useState("");
  const [urgency, setUrgency]   = useState("normal");
  const [justification, setJustification] = useState("");
  const [aiRouting, setAiRouting] = useState<RequestType | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  const runAI = () => {
    setAiThinking(true);
    setTimeout(() => {
      const val = parseFloat(valueStr.replace(/[^0-9.]/g, "")) || 0;
      const routed = deriveRoute(val, urgency, category);
      setAiRouting(routed);
      setAiThinking(false);
      setStep(3);
    }, 1400);
  };

  const CATEGORIES = [
    { v: "goods",        l: "Goods / Supplies" },
    { v: "services",     l: "General Services" },
    { v: "consultancy",  l: "Consultancy / Professional" },
    { v: "works",        l: "Works / Construction" },
    { v: "asset",        l: "Capital Asset" },
    { v: "maintenance",  l: "Maintenance / Repair" },
    { v: "inventory",    l: "Stock / Inventory" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-[#0f172a] text-white px-5 py-3.5 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[#0F172A]/30 grid place-items-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-slate-300" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold">New Procurement Request</div>
            <div className="text-[11px] text-white/50">AI will automatically route to the correct workflow</div>
          </div>
          <button onClick={onClose} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-white/10 text-white/50">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex border-b border-black/8">
          {[1,2,3].map(s => (
            <div key={s} className={`flex-1 py-2 text-center text-[11px] font-semibold transition-colors ${step === s ? "text-black border-b-2 border-black" : step > s ? "text-[#0F172A]" : "text-black/30"}`}>
              {step > s ? "✓ " : ""}{["Request Details","Budget & Urgency","AI Routing"][s-1]}
            </div>
          ))}
        </div>

        <div className="p-5">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-black/60 mb-1 block">Request Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Procurement of Office Supplies Q3 2026"
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <div>
                <label className="text-xs font-semibold text-black/60 mb-1 block">Requesting Department *</label>
                <input value={dept} onChange={e => setDept(e.target.value)} placeholder="e.g. Ministry of Health — Clinical Services"
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
              <div>
                <label className="text-xs font-semibold text-black/60 mb-1 block">Procurement Category *</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm bg-white focus:outline-none">
                  {CATEGORIES.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-black/60 mb-1 block">Estimated Value (USD) *</label>
                <input value={valueStr} onChange={e => setValueStr(e.target.value)} placeholder="e.g. 45000"
                  className="w-full h-9 px-3 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                <p className="text-[10px] text-black/40 mt-1">AI will use this to determine the correct procurement method</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-black/60 mb-2 block">Urgency Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[{v:"normal",l:"Normal",c:"border-black/10"},{v:"urgent",l:"Urgent",c:"border-slate-200"},{v:"emergency",l:"Emergency",c:"border-red-300"}].map(u => (
                    <button key={u.v} onClick={() => setUrgency(u.v)}
                      className={`py-2 rounded-lg border text-xs font-semibold transition-colors ${urgency === u.v ? "bg-black text-white border-black" : `border ${u.c} hover:bg-gray-50`}`}>
                      {u.l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-black/60 mb-1 block">Brief Justification</label>
                <textarea value={justification} onChange={e => setJustification(e.target.value)} rows={3}
                  placeholder="Why is this procurement needed?"
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/10" />
              </div>
            </div>
          )}

          {/* Step 3 — AI Routing result */}
          {step === 3 && (
            <div>
              {aiThinking ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-50 grid place-items-center">
                    <Bot className="h-6 w-6 text-[#0F172A] animate-pulse" />
                  </div>
                  <div className="text-sm font-semibold text-black">AI is analysing your request…</div>
                  <div className="text-xs text-black/40">Checking procurement regulations, budget thresholds, and supplier availability</div>
                </div>
              ) : aiRouting ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-5 w-5 text-[#0F172A]" />
                    <span className="text-sm font-bold text-black">AI Routing Complete</span>
                  </div>
                  <div className={`rounded-xl p-4 ${aiRouting.bg} border border-black/8`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`h-9 w-9 rounded-lg bg-white grid place-items-center ${aiRouting.color}`}>
                        <aiRouting.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-black">{aiRouting.label}</div>
                        <div className="text-[11px] text-black/50">Threshold: {aiRouting.threshold}</div>
                      </div>
                    </div>
                    <p className="text-xs text-black/60 mb-2">{aiRouting.desc}</p>
                    <div className="flex items-center gap-2 text-[11px] text-black/50">
                      <Bot className="h-3.5 w-3.5 text-[#0F172A]" />
                      <span className="text-[#0F172A] font-medium">{aiRouting.aiAction}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-xs text-black/50 space-y-1">
                    <div className="font-semibold text-black/70 mb-1.5">Request Summary</div>
                    <div className="flex justify-between"><span>Title:</span><span className="font-medium text-black truncate max-w-[60%] text-right">{title || "—"}</span></div>
                    <div className="flex justify-between"><span>Department:</span><span className="font-medium text-black">{dept || "—"}</span></div>
                    <div className="flex justify-between"><span>Value:</span><span className="font-medium text-black">USD {valueStr || "—"}</span></div>
                    <div className="flex justify-between"><span>Urgency:</span><span className="font-medium text-black capitalize">{urgency}</span></div>
                    <div className="flex justify-between"><span>Route:</span><span className="font-semibold text-[#0F172A]">{aiRouting.label}</span></div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-5 py-3.5 border-t border-black/8 flex gap-2 justify-end">
          {step > 1 && step < 3 && (
            <button onClick={() => setStep(s => s - 1)} className="h-9 px-4 rounded-lg border border-black/10 text-sm hover:bg-gray-50">Back</button>
          )}
          {step === 1 && (
            <button onClick={() => { if (title && dept) setStep(2); else toast("Please fill all required fields", "warning"); }}
              className="h-9 px-5 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-800 flex items-center gap-2">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          )}
          {step === 2 && (
            <button onClick={() => { if (valueStr) { setStep(3); runAI(); } else toast("Please enter an estimated value", "warning"); }}
              className="h-9 px-5 rounded-lg bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#0F172A] flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> AI Route Request
            </button>
          )}
          {step === 3 && !aiThinking && aiRouting && (
            <button onClick={() => onSubmit(aiRouting)}
              className="h-9 px-5 rounded-lg bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#0F172A] flex items-center gap-2">
              <Send className="h-4 w-4" /> Submit & Open Workflow
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function IntakePage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [submitted, setSubmitted] = useState<{ type: RequestType; id: string } | null>(null);

  const filtered = RECENT.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || r.type === filter;
    return matchSearch && matchFilter;
  });

  function handleSubmit(routed: RequestType) {
    const id = `INT-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
    setSubmitted({ type: routed, id });
    setShowForm(false);
    pushNotification(`Intake request ${id} submitted — routed to ${routed.label}`, "success");
    toast(`Request ${id} submitted. Opening ${routed.label} workflow…`, "success");
    setTimeout(() => navigate(routed.route), 1800);
  }

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Procurement Intake"
        financialYear="FY2026"
        pageType="form"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Procurement Intake Portal"
          description="Single front door for all procurement requests. AI automatically routes each request to the correct workflow — Tender, RFQ, RFP, EOI, or Direct."
          actions={
            <button onClick={() => setShowForm(true)}
              className="h-9 px-4 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> New Request
            </button>
          }
        />

        {/* Success banner */}
        {submitted && (
          <div className="mb-5 rounded-xl bg-slate-50 border border-slate-200 px-5 py-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#0F172A] flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-bold text-[#0F172A]">Request {submitted.id} submitted successfully</div>
              <div className="text-xs text-[#0F172A]">AI routed to: {submitted.type.label} · Redirecting to workflow…</div>
            </div>
            <button onClick={() => setSubmitted(null)} className="text-slate-600 hover:text-[#0F172A]"><X className="h-4 w-4" /></button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Requests Today"      value="24"    delta="+8 vs yesterday"     icon={FileText}    color="blue"   />
          <KpiCard label="Avg Routing Time"    value="1.4s"  delta="AI-powered"          icon={Zap}         color="violet" />
          <KpiCard label="Pending Approval"    value="11"    delta="4 urgent"            icon={Clock}       color="amber"  />
          <KpiCard label="Approved Today"      value="18"    delta="75% approval rate"   icon={CheckCircle2} color="green" />
        </div>

        {/* Quick Select Request Type */}
        <div className="mb-6">
          <div className="text-sm font-bold text-black mb-3">Quick Start — Select Procurement Type</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {REQUEST_TYPES.map(rt => {
              const Icon = rt.icon;
              return (
                <button key={rt.id} onClick={() => navigate(rt.route)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-black/8 ${rt.bg} hover:shadow-md hover:-translate-y-0.5 transition-all`}>
                  <Icon className={`h-5 w-5 ${rt.color}`} />
                  <span className="text-[10px] font-semibold text-black/70 text-center leading-tight">{rt.label}</span>
                  <span className="text-[9px] text-black/40">{rt.threshold}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Routing Engine Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader title="AI Routing Engine" subtitle="Real-time request classification and workflow assignment">
                <div className="mt-2 flex items-center gap-2 text-[11px] text-black/40">
                  <span className="h-2 w-2 rounded-full bg-[#0F172A] animate-pulse" />
                  Active · 1.4s avg routing time
                </div>
              </CardHeader>
              <div className="p-4 space-y-2">
                {[
                  { rule: "Value > USD 50,000",            method: "Open Tender",         conf: 98, icon: FileText,     color: "text-[#0F172A]" },
                  { rule: "Value USD 5K–50K (Goods/Svcs)", method: "Request for Quotation",conf: 96, icon: ShoppingCart, color: "text-[#0F172A]" },
                  { rule: "Consultancy / Professional",    method: "Request for Proposal", conf: 95, icon: FileSearch,   color: "text-[#0F172A]" },
                  { rule: "Emergency + Value < USD 5K",    method: "Direct Procurement",   conf: 91, icon: Zap,          color: "text-[#0F172A]" },
                  { rule: "Shortlisting / Complex EOI",    method: "Expression of Interest",conf: 93, icon: Users,       color: "text-[#0F172A]" },
                  { rule: "Capital Equipment",             method: "Asset Requisition",    conf: 97, icon: Package,      color: "text-[#0F172A]" },
                ].map(r => {
                  const Icon = r.icon;
                  return (
                    <div key={r.rule} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-black/5 hover:bg-gray-100 transition-colors">
                      <Icon className={`h-4 w-4 flex-shrink-0 ${r.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-black/50">If: <span className="font-semibold text-black">{r.rule}</span></div>
                        <div className="text-xs text-black/50">Then: <span className="font-semibold text-black">{r.method}</span></div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[10px] font-bold text-black/40">{r.conf}%</div>
                        <div className="text-[9px] text-black/30">accuracy</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Stats panel */}
          <div className="space-y-3">
            <Card>
              <div className="p-4">
                <div className="text-xs font-bold text-black/60 mb-3">Requests by Type (Today)</div>
                {[
                  { t: "Tenders", v: 8, c: "bg-[#0F172A]" },
                  { t: "RFQ", v: 10, c: "bg-[#0F172A]" },
                  { t: "RFP", v: 3, c: "bg-[#0F172A]" },
                  { t: "Direct", v: 2, c: "bg-[#0F172A]" },
                  { t: "EOI", v: 1, c: "bg-[#0F172A]" },
                ].map(s => (
                  <div key={s.t} className="flex items-center gap-2 mb-2">
                    <div className="text-[11px] text-black/50 w-14 flex-shrink-0">{s.t}</div>
                    <div className="flex-1 h-2 rounded-full bg-black/5 overflow-hidden">
                      <div className={`h-full rounded-full ${s.c}`} style={{ width: `${(s.v / 24) * 100}%` }} />
                    </div>
                    <div className="text-[11px] font-bold text-black w-4 text-right">{s.v}</div>
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div className="p-4 space-y-2">
                <div className="text-xs font-bold text-black/60 mb-3">PPDPA Compliance</div>
                {[
                  { l: "Method Compliance", v: "100%", ok: true },
                  { l: "Budget Pre-approval", v: "94%", ok: true },
                  { l: "Justification Filed", v: "87%", ok: true },
                  { l: "Overrides (flagged)", v: "3", ok: false },
                ].map(c => (
                  <div key={c.l} className="flex justify-between text-xs">
                    <span className="text-black/50">{c.l}</span>
                    <span className={`font-bold ${c.ok ? "text-[#0F172A]" : "text-red-600"}`}>{c.v}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Requests Table */}
        <Card>
          <CardHeader title="Recent Requests" subtitle="All procurement intake requests — auto-routed by AI">
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests…"
                  className="h-7 pl-8 pr-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10 w-48" />
              </div>
              {["All","Tender","RFQ","RFP","EOI","Direct"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`h-7 px-3 rounded-lg text-xs font-semibold transition-colors ${filter === f ? "bg-black text-white" : "border border-black/10 hover:bg-gray-50"}`}>
                  {f}
                </button>
              ))}
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-black/40 uppercase">
                <tr>
                  {["Request ID","Title","Type","Value","Status","Submitted","Action"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50/60 cursor-pointer" onClick={() => navigate(r.route)}>
                    <td className="px-4 py-3 font-mono text-[11px] text-black/40">{r.id}</td>
                    <td className="px-4 py-3 font-medium text-black max-w-xs"><div className="truncate">{r.title}</div></td>
                    <td className="px-4 py-3 text-xs text-black/60">{r.type}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-black">{r.value}</td>
                    <td className="px-4 py-3">{statusBadge(r.status)}</td>
                    <td className="px-4 py-3 text-xs text-black/40">{r.submitted}</td>
                    <td className="px-4 py-3">
                      <button className="h-6 px-2.5 rounded-lg bg-black text-white text-[10px] font-semibold hover:bg-gray-800 flex items-center gap-1">
                        Open <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {showForm && <NewRequestForm onClose={() => setShowForm(false)} onSubmit={handleSubmit} />}
    </AppShell>
  );
}
