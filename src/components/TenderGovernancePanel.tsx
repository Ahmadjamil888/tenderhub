/**
 * TenderGovernancePanel
 * Cross-lifecycle governance controls from spec (page 26):
 * Always visible as a collapsible side panel or bottom drawer in workbenches.
 *
 * Controls:
 *  - AI procurement policy compliance engine
 *  - Delegation of Authority (DoA) validation
 *  - Budget availability and commitment control
 *  - Conflict of interest declarations
 *  - Supplier due diligence and sanctions screening
 *  - Price benchmarking
 *  - Bid collusion and cartel detection
 *  - Fraud and corruption risk scoring
 *  - Duplicate detection (req/PO/invoice/payment)
 *  - Three-way matching
 *  - Real-time KPI monitoring
 *  - Predictive analytics
 *  - Immutable audit trails
 *  - Role-based access / segregation of duties
 *  - Digital signatures
 *  - Automated alerts and escalations
 *  - Continuous compliance monitoring
 *  - Executive AI assistant
 */
import { useState } from "react";
import {
  Shield, Sparkles, AlertOctagon, CheckCircle2, AlertTriangle,
  DollarSign, Users, FileText, Lock, BarChart3, Search,
  RefreshCcw, ChevronDown, ChevronUp, Activity, Landmark,
  ShieldCheck, Eye, Clock, Zap,
} from "lucide-react";

type ControlStatus = "active" | "warning" | "clear" | "pending";

interface GovernanceControl {
  id: string;
  label: string;
  description: string;
  status: ControlStatus;
  icon: React.ElementType;
  detail?: string;
}

const GOVERNANCE_CONTROLS: GovernanceControl[] = [
  {
    id: "policy-compliance",
    label: "AI Policy Compliance Engine",
    description: "Validates all procurement actions against PPDPAA and internal policies",
    status: "active",
    icon: ShieldCheck,
    detail: "All current activities compliant — no policy flags",
  },
  {
    id: "doa",
    label: "Delegation of Authority (DoA)",
    description: "Validates approver authority against current DoA register",
    status: "active",
    icon: Users,
    detail: "DoA register last updated: Today — all approvals within limits",
  },
  {
    id: "budget-control",
    label: "Budget Availability & Commitment",
    description: "Real-time IFMIS integration — prevents over-commitment",
    status: "active",
    icon: DollarSign,
    detail: "Budget check: PASSED — sufficient funds available",
  },
  {
    id: "coi",
    label: "Conflict of Interest Monitoring",
    description: "AI relationship mapping — detects undisclosed conflicts",
    status: "warning",
    icon: Eye,
    detail: "⚠ 2 evaluators pending COI declaration",
  },
  {
    id: "due-diligence",
    label: "Supplier Due Diligence & Sanctions",
    description: "Background screening against sanctions lists and PRAZ blacklist",
    status: "active",
    icon: Search,
    detail: "All invited suppliers cleared — no blacklist matches",
  },
  {
    id: "price-bench",
    label: "Price Benchmarking",
    description: "Market and historical price comparison for all items",
    status: "active",
    icon: BarChart3,
    detail: "Benchmark data current — prices within ±8% of market",
  },
  {
    id: "collusion",
    label: "Bid Collusion & Cartel Detection",
    description: "AI analysis of bid patterns, pricing clusters, IP submissions",
    status: "clear",
    icon: AlertOctagon,
    detail: "No collusion signals detected in current tender",
  },
  {
    id: "fraud-scoring",
    label: "Fraud & Corruption Risk Scoring",
    description: "Continuous AI fraud risk scoring across all procurement activities",
    status: "active",
    icon: Shield,
    detail: "Overall fraud risk: LOW (Score: 12/100)",
  },
  {
    id: "duplicate-detect",
    label: "Duplicate Detection",
    description: "Requisition, PO, invoice, and payment duplicate detection",
    status: "clear",
    icon: RefreshCcw,
    detail: "No duplicate requisitions, POs, invoices or payments detected",
  },
  {
    id: "three-way",
    label: "Three-Way Matching",
    description: "Contract–PO–Goods Receipt–Invoice auto-matching",
    status: "active",
    icon: CheckCircle2,
    detail: "Matching engine: ACTIVE — 14 transactions pending match",
  },
  {
    id: "kpi-monitor",
    label: "Real-time KPI Monitoring",
    description: "Live procurement KPI dashboard and threshold alerts",
    status: "active",
    icon: Activity,
    detail: "Cycle time: 38 days (target <45) · Compliance: 88%",
  },
  {
    id: "predictive",
    label: "Predictive Analytics",
    description: "AI forecasts for delays, cost overruns, supplier risks",
    status: "warning",
    icon: Sparkles,
    detail: "⚠ 3 contracts showing elevated delay probability >60%",
  },
  {
    id: "audit-trail",
    label: "Immutable Audit Trails",
    description: "Blockchain-secured — every action timestamped and tamper-proof",
    status: "active",
    icon: Lock,
    detail: "Audit trail: INTACT — 0 integrity violations detected",
  },
  {
    id: "rbac",
    label: "Role-Based Access & Segregation",
    description: "Role-based access control with segregation of duties enforcement",
    status: "active",
    icon: Users,
    detail: "RBAC: ACTIVE — No segregation violations detected",
  },
  {
    id: "digital-sigs",
    label: "Digital Signatures",
    description: "Certificate validation for all signed documents",
    status: "active",
    icon: FileText,
    detail: "All signatures verified — 0 certificate errors",
  },
  {
    id: "alerts",
    label: "Automated Alerts & Escalations",
    description: "Deadline alerts, threshold breaches, workflow timers",
    status: "warning",
    icon: Clock,
    detail: "⚠ 4 items approaching deadline within 48 hours",
  },
  {
    id: "compliance-monitor",
    label: "Continuous Compliance Monitoring",
    description: "Real-time monitoring against PPDPAA and internal policies",
    status: "active",
    icon: Landmark,
    detail: "Compliance score: 88% — 2 minor gaps under review",
  },
  {
    id: "ai-assistant",
    label: "Executive AI Procurement Advisor",
    description: "Natural language Q&A about procurement status, risks, contracts",
    status: "active",
    icon: Zap,
    detail: "AI ready — ask in plain language",
  },
];

const STATUS_CONFIG: Record<ControlStatus, { dot: string; badge: string; text: string }> = {
  active:  { dot: "bg-[#0F172A]",  badge: "bg-slate-100 text-[#0F172A]", text: "ACTIVE"  },
  warning: { dot: "bg-slate-400",    badge: "bg-slate-100 text-[#0F172A]",     text: "WARNING" },
  clear:   { dot: "bg-slate-400",     badge: "bg-slate-100 text-[#0F172A]",       text: "CLEAR"   },
  pending: { dot: "bg-gray-300",     badge: "bg-gray-100 text-gray-500",       text: "PENDING" },
};

interface TenderGovernancePanelProps {
  mode?: "sidebar" | "inline";
  defaultOpen?: boolean;
}

export default function TenderGovernancePanel({
  mode = "inline",
  defaultOpen = false,
}: TenderGovernancePanelProps) {
  const [open, setOpen]             = useState(defaultOpen);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [aiQuery, setAiQuery]       = useState("");
  const [aiResponse, setAiResponse] = useState("");

  const warnings = GOVERNANCE_CONTROLS.filter(c => c.status === "warning").length;
  const active   = GOVERNANCE_CONTROLS.filter(c => c.status === "active").length;

  function handleAiQuery() {
    if (!aiQuery.trim()) return;
    setAiResponse(`Processing: "${aiQuery}" — AI is analysing procurement data...`);
    setTimeout(() => {
      setAiResponse(
        `Based on current procurement data: ${aiQuery.toLowerCase().includes("risk") ?
          "3 contracts show elevated delay risk. Energy ministry has highest fraud risk score at 42/100. Recommend immediate review of sole-source contracts." :
          aiQuery.toLowerCase().includes("compli") ?
          "Overall compliance rate is 88%. 2 tenders have minor compliance gaps. 18 of 26 ministries are fully compliant. 8 require follow-up." :
          "Analysis complete. All key metrics within acceptable thresholds. No immediate executive action required based on current data."
        }`
      );
    }, 1200);
  }

  if (mode === "inline") {
    return (
      <div className="border border-black/10 rounded-xl overflow-hidden bg-white">
        {/* Header — always visible */}
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors"
        >
          <div className="h-7 w-7 rounded-lg bg-[#0F172A]/30 grid place-items-center flex-shrink-0">
            <Shield className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-xs font-bold">Tender Governance Controls</div>
            <div className="text-[10px] text-white/45">
              {active} active · {warnings > 0 ? `${warnings} warnings` : "no warnings"} · Cross-lifecycle AI controls
            </div>
          </div>
          {warnings > 0 && (
            <span className="h-5 w-5 rounded-full bg-slate-400 text-[#0f172a] text-[9px] font-black grid place-items-center flex-shrink-0">
              {warnings}
            </span>
          )}
          {open
            ? <ChevronUp className="h-4 w-4 text-white/40 flex-shrink-0" />
            : <ChevronDown className="h-4 w-4 text-white/40 flex-shrink-0" />}
        </button>

        {open && (
          <div>
            {/* Controls grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-black/5">
              {GOVERNANCE_CONTROLS.map(ctrl => {
                const Icon = ctrl.icon;
                const cfg  = STATUS_CONFIG[ctrl.status];
                const isEx = expandedId === ctrl.id;
                return (
                  <button
                    key={ctrl.id}
                    onClick={() => setExpandedId(isEx ? null : ctrl.id)}
                    className={`text-left p-3 hover:bg-[#f4f7fb] transition-colors ${isEx ? "bg-slate-50/50" : ""}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <Icon className="h-3.5 w-3.5 text-black/50 flex-shrink-0" />
                      <span className="text-[11px] font-bold text-black truncate flex-1">{ctrl.label}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${cfg.badge}`}>
                        {cfg.text}
                      </span>
                    </div>
                    {isEx && (
                      <div className="mt-1.5 pl-4 border-l-2 border-slate-200">
                        <div className="text-[10px] text-black/50 mb-1">{ctrl.description}</div>
                        <div className={`text-[10px] font-medium ${ctrl.status === "warning" ? "text-[#0F172A]" : "text-[#0F172A]"}`}>
                          {ctrl.detail}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* AI Procurement Advisor quick query */}
            <div className="border-t border-black/8 p-4 bg-[#f8fafc]">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-[#0F172A] flex-shrink-0" />
                <span className="text-xs font-bold text-[#0f172a]">Executive AI Procurement Advisor</span>
              </div>
              <div className="flex gap-2">
                <input
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAiQuery()}
                  placeholder='Ask anything — e.g. "Which contracts are at risk?" or "What is our compliance rate?"'
                  className="flex-1 h-9 px-3 text-xs border border-black/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/30 bg-white"
                />
                <button
                  onClick={handleAiQuery}
                  className="h-9 px-4 bg-[#0f172a] text-white text-xs font-bold rounded-lg hover:bg-black/80 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Ask AI
                </button>
              </div>
              {aiResponse && (
                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-[#0F172A] leading-relaxed">
                  <strong>AI:</strong> {aiResponse}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
