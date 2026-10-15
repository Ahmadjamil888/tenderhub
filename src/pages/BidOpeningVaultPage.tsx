/**
 * BidOpeningVaultPage — Section 3.3
 * Purpose: Moment a tender/RFQ/EOI/RFP/Unsolicited Bid closes, 4 authorised
 * officers open it concurrently using 2FA. Applies to ALL procurement modules.
 *
 * Features:
 * - List with name, ministry, closing date, countdown timer (flashing near zero)
 * - When countdown hits zero → VaultLoginModal with 4 pre-selected officers
 * - After auth: reveal full vendor bids list + amounts (Bids Opening Register)
 * - Printable, shareable, downloadable register
 * - Full-page / hide toggle on right-hand detail panel
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { ClosingCountdownTimer } from "@/components/ui/ClosingCountdownTimer";
import { VaultLoginModal } from "@/components/ui/VaultLoginModal";
import { WorkflowActionBar } from "@/components/ui/WorkflowActionBar";
import { ApprovalSignatureBlock } from "@/components/ui/ApprovalSignatureBlock";
import { DocumentViewerPanel } from "@/components/ui/DocumentViewerPanel";
import { AiAgentChatPanel } from "@/components/ui/AiAgentChatPanel";
import {
  KeyRound, AlertTriangle, ChevronRight, Printer, Download,
  Share2, Eye, EyeOff, Maximize2, Minimize2, Clock, CheckCircle2,
  ArrowLeft, Building2, Calendar, DollarSign, Users, FileText,
} from "lucide-react";

// ── Module label map ─────────────────────────────────────────────────────────
const MODULE_LABELS: Record<string, string> = {
  tenders: "Tenders", rfq: "RFQ", rfp: "RFP",
  eoi: "EOI", unsolicited: "Unsolicited Bids", auctions: "Auctions",
};

// ── Mock bids approaching/at zero countdown ──────────────────────────────────
const MOCK_BIDS = [
  {
    id: "BO-2026-0041",
    name: "Supply & Installation of Solar Mini-Grids — 12 Rural Clinics",
    ministry: "Ministry of Energy",
    closingDate: new Date(Date.now() + 1000 * 30),       // 30 seconds — critical
    stage: "Closing Imminent",
    bidsReceived: 11,
    estimatedValue: "USD 14,800,000",
    status: "imminent" as const,
  },
  {
    id: "BO-2026-0040",
    name: "National Tax Administration System — Phase II",
    ministry: "ZIMRA",
    closingDate: new Date(Date.now() + 1000 * 60 * 4),   // 4 min
    stage: "Closing Soon",
    bidsReceived: 5,
    estimatedValue: "USD 9,200,000",
    status: "soon" as const,
  },
  {
    id: "BO-2026-0039",
    name: "Procurement of Antiretroviral Medicines (2-Year Framework)",
    ministry: "Ministry of Health & Child Care",
    closingDate: new Date(Date.now() - 1000 * 60 * 5),   // Already closed 5 min ago
    stage: "Closed — Awaiting Opening",
    bidsReceived: 8,
    estimatedValue: "USD 42,500,000",
    status: "closed" as const,
  },
  {
    id: "BO-2026-0038",
    name: "Rehabilitation of Beitbridge–Harare Highway (Section 4)",
    ministry: "Ministry of Transport",
    closingDate: new Date(Date.now() + 1000 * 60 * 18),  // 18 min
    stage: "Closing Soon",
    bidsReceived: 0,
    estimatedValue: "USD 88,000,000",
    status: "soon" as const,
  },
  {
    id: "BO-2026-0037",
    name: "School Textbooks — Primary Grades 1–7",
    ministry: "Ministry of Primary & Secondary Education",
    closingDate: new Date(Date.now() + 1000 * 60 * 45),  // 45 min
    stage: "Open",
    bidsReceived: 12,
    estimatedValue: "USD 6,700,000",
    status: "open" as const,
  },
];

// ── Mock vendors revealed after vault opens ──────────────────────────────────
const MOCK_VENDORS: Record<string, { vendorName: string; refNo: string; amount: string; technical: number; financial: number; }[]> = {
  "BO-2026-0041": [
    { vendorName: "Highveld Solar Energy (Pvt) Ltd",   refNo: "BID-2026-00184-01", amount: "USD 13,450,000", technical: 82, financial: 91 },
    { vendorName: "Sable Green Technologies",           refNo: "BID-2026-00184-02", amount: "USD 14,120,000", technical: 78, financial: 87 },
    { vendorName: "Zambezi Power Solutions",            refNo: "BID-2026-00184-03", amount: "USD 12,900,000", technical: 85, financial: 93 },
    { vendorName: "AfriSolar Holdings Ltd",             refNo: "BID-2026-00184-04", amount: "USD 15,200,000", technical: 74, financial: 82 },
    { vendorName: "Bulawayo Energy Consortium",         refNo: "BID-2026-00184-05", amount: "USD 13,750,000", technical: 80, financial: 89 },
  ],
  "BO-2026-0039": [
    { vendorName: "Zimbabwe Pharma Holdings",           refNo: "BID-2026-00183-01", amount: "USD 41,200,000", technical: 91, financial: 95 },
    { vendorName: "Harare Medical Supplies Ltd",        refNo: "BID-2026-00183-02", amount: "USD 43,500,000", technical: 88, financial: 90 },
    { vendorName: "MedServe Africa (Pvt) Ltd",          refNo: "BID-2026-00183-03", amount: "USD 40,800,000", technical: 86, financial: 96 },
    { vendorName: "Continental Pharma Group",           refNo: "BID-2026-00183-04", amount: "USD 44,100,000", technical: 79, financial: 84 },
  ],
};

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusPill({ status }: { status: typeof MOCK_BIDS[0]["status"] }) {
  const map = {
    imminent: "animate-pulse bg-red-600 text-white",
    closed:   "bg-red-100 text-red-700 border border-red-300",
    soon:     "bg-amber-100 text-amber-800 border border-amber-300",
    open:     "bg-slate-100 text-slate-700 border border-slate-200",
  };
  const labels = {
    imminent: "⚡ OPENING IMMINENT",
    closed:   "🔒 CLOSED — OPEN NOW",
    soon:     "⏱ CLOSING SOON",
    open:     "Open",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BidOpeningVaultPage() {
  const { moduleType = "tenders" } = useParams();
  const navigate = useNavigate();
  const moduleLabel = MODULE_LABELS[moduleType] ?? "Tenders";

  // State
  const [selectedBid, setSelectedBid] = useState<typeof MOCK_BIDS[0] | null>(null);
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const [openedBids, setOpenedBids] = useState<Set<string>>(new Set());
  const [showDetail, setShowDetail] = useState(true);
  const [detailFullPage, setDetailFullPage] = useState(false);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);

  const handleOpenVault = (bid: typeof MOCK_BIDS[0]) => {
    setSelectedBid(bid);
    setVaultModalOpen(true);
  };

  const handleVaultAuthenticated = () => {
    if (selectedBid) {
      setOpenedBids(prev => new Set([...prev, selectedBid.id]));
    }
    setVaultModalOpen(false);
  };

  const vendors = selectedBid ? (MOCK_VENDORS[selectedBid.id] ?? []) : [];
  const isOpened = selectedBid ? openedBids.has(selectedBid.id) : false;

  return (
    <AppShell>
      {/* Gov Header */}
      <div className="bg-[#0f172a] text-white px-6 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              GOVERNMENT OF THE REPUBLIC OF ZIMBABWE — ZEPS
            </div>
            <div className="text-base font-black uppercase tracking-wide mt-0.5 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-red-400" />
              {moduleLabel} — Bid Opening Vault
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Authorised 2FA opening · 4 concurrent officers required · FY2025/26
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/tenders/module/${moduleType}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs hover:bg-white/10">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Module
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs hover:bg-white/10">
              <Printer className="h-3.5 w-3.5" /> Print Register
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs hover:bg-white/10">
              <Download className="h-3.5 w-3.5" /> Download
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs hover:bg-white/10">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 text-xs text-slate-500 flex items-center gap-1.5 shrink-0">
        <span>E-Procurement</span>
        <ChevronRight className="h-3 w-3" />
        <span>{moduleLabel}</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold text-slate-800">Bid Opening Vault</span>
      </div>

      {/* Alert banner */}
      <div className="bg-red-50 border-b border-red-200 px-6 py-2 flex items-center gap-2 shrink-0">
        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 animate-pulse" />
        <p className="text-xs text-red-800 font-semibold">
          OFFICIAL NOTICE: Bid opening is a formal procurement event. All 4 authorised officers must be present and authenticate concurrently. Unauthorised access or premature opening is a PPDPA offence.
        </p>
      </div>

      {/* Main content area */}
      <div className={`flex flex-1 min-h-0 overflow-hidden ${detailFullPage ? "flex-col" : ""}`}>
        {/* Left: bid list */}
        <div className={`${detailFullPage ? "hidden" : "flex-1"} overflow-y-auto bg-[#f8fafc]`}>

          {/* KPI strip */}
          <div className="grid grid-cols-4 gap-3 px-6 pt-4 pb-3">
            {[
              { label: "Total Closing Today", val: MOCK_BIDS.length, icon: Clock, color: "text-slate-700" },
              { label: "Imminent (< 1 hr)", val: MOCK_BIDS.filter(b => b.status === "imminent" || b.status === "soon").length, icon: AlertTriangle, color: "text-red-600" },
              { label: "Awaiting Opening", val: MOCK_BIDS.filter(b => b.status === "closed").length + openedBids.size, icon: KeyRound, color: "text-amber-600" },
              { label: "Successfully Opened", val: openedBids.size, icon: CheckCircle2, color: "text-emerald-600" },
            ].map(k => (
              <div key={k.label} className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <k.icon className={`h-5 w-5 flex-shrink-0 ${k.color}`} />
                <div>
                  <div className="text-xl font-black text-slate-900">{k.val}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{k.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bids Opening Register table */}
          <div className="px-6 pb-6">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-[#0f172a] text-white px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    GOVERNMENT OF THE REPUBLIC OF ZIMBABWE
                  </div>
                  <div className="text-sm font-black uppercase tracking-wide mt-0.5">
                    BIDS OPENING REGISTER — {moduleLabel.toUpperCase()} · FY2025/26
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {new Date().toLocaleDateString("en-ZW", { day: "2-digit", month: "short", year: "numeric" })}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#1a6b3a] text-white">
                      {["REF NO","TENDER / BID NAME","MINISTRY","CLOSING DATE & TIME","COUNTDOWN","BIDS RECEIVED","EST. VALUE","STATUS","ACTION"].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left font-bold uppercase tracking-wide whitespace-nowrap border-r border-white/10 last:border-r-0">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_BIDS.map((bid, i) => {
                      const isThisOpened = openedBids.has(bid.id);
                      const isSelected = selectedBid?.id === bid.id;
                      return (
                        <tr
                          key={bid.id}
                          onClick={() => setSelectedBid(bid)}
                          className={`border-b border-slate-100 cursor-pointer transition-colors ${
                            isSelected ? "bg-slate-100" : i % 2 === 0 ? "bg-white hover:bg-slate-50" : "bg-slate-50/50 hover:bg-slate-100/60"
                          }`}
                        >
                          <td className="px-3 py-3 font-mono text-slate-500 whitespace-nowrap">{bid.id}</td>
                          <td className="px-3 py-3 font-semibold text-slate-900 max-w-[220px]">
                            <div className="truncate" title={bid.name}>{bid.name}</div>
                          </td>
                          <td className="px-3 py-3 text-slate-700 whitespace-nowrap">
                            <div className="flex items-center gap-1"><Building2 className="h-3 w-3 text-slate-400" />{bid.ministry}</div>
                          </td>
                          <td className="px-3 py-3 text-slate-700 whitespace-nowrap">
                            <div className="flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-400" />
                              {bid.closingDate.toLocaleDateString("en-ZW", { day: "2-digit", month: "short", year: "numeric" })}{" "}
                              {bid.closingDate.toLocaleTimeString("en-ZW", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <ClosingCountdownTimer closingDate={bid.closingDate} showLabel={false} size="sm" />
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-slate-800">
                            <div className="flex items-center gap-1"><Users className="h-3 w-3 text-slate-400" />{bid.bidsReceived}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1"><DollarSign className="h-3 w-3 text-slate-400" />{bid.estimatedValue}</div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {isThisOpened
                              ? <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-300">✓ OPENED</span>
                              : <StatusPill status={bid.status} />
                            }
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            {isThisOpened ? (
                              <button onClick={e => { e.stopPropagation(); setSelectedBid(bid); setShowDetail(true); }}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 text-[11px] font-semibold hover:bg-slate-200 transition-all">
                                <Eye className="h-3 w-3" /> View Bids
                              </button>
                            ) : (
                              <button
                                onClick={e => { e.stopPropagation(); handleOpenVault(bid); }}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-[11px] font-bold transition-all ${
                                  bid.status === "imminent" || bid.status === "closed"
                                    ? "bg-red-600 hover:bg-red-700 animate-pulse"
                                    : "bg-[#0f172a] hover:bg-slate-700"
                                }`}>
                                <KeyRound className="h-3 w-3" />
                                {bid.status === "imminent" || bid.status === "closed" ? "OPEN VAULT" : "Open Vault"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right: detail panel */}
        {showDetail && selectedBid && (
          <div className={`${detailFullPage ? "flex-1" : "w-[520px]"} flex-shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden`}>
            {/* Panel header */}
            <div className="bg-[#0f172a] text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-red-400" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide">Bid Opening Detail</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[280px]">{selectedBid.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setDetailFullPage(v => !v)}
                  className="h-7 w-7 grid place-items-center rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title={detailFullPage ? "Restore panel" : "Full page"}>
                  {detailFullPage ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => setShowDetail(false)}
                  className="h-7 w-7 grid place-items-center rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Hide panel">
                  <EyeOff className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Bid info cards */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "REF NO",          val: selectedBid.id          },
                  { label: "MINISTRY",        val: selectedBid.ministry    },
                  { label: "EST. VALUE",      val: selectedBid.estimatedValue },
                  { label: "BIDS RECEIVED",   val: String(selectedBid.bidsReceived) },
                  { label: "CLOSING DATE",    val: selectedBid.closingDate.toLocaleString("en-ZW") },
                  { label: "STAGE",           val: selectedBid.stage       },
                ].map(f => (
                  <div key={f.label} className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{f.label}</div>
                    <div className="text-xs font-semibold text-slate-800 mt-0.5 truncate">{f.val}</div>
                  </div>
                ))}
              </div>

              {/* Countdown */}
              <div className="border border-slate-200 rounded-lg p-3 bg-white flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Time to Close:</span>
                <ClosingCountdownTimer closingDate={selectedBid.closingDate} showLabel={false} size="md" />
              </div>

              {/* Vendor bids — shown only after vault opened */}
              {isOpened ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700">Vault Opened — Bids Revealed</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">BIDS OPENING REGISTER</div>
                  {vendors.length > 0 ? (
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-[#1a6b3a] text-white grid grid-cols-4 text-[10px] font-bold uppercase px-3 py-2">
                        <span>VENDOR</span><span>REF NO</span><span className="text-right">AMOUNT</span><span className="text-right">TECH</span>
                      </div>
                      {vendors.map((v, i) => (
                        <div key={i} className={`grid grid-cols-4 px-3 py-2 text-xs border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                          <span className="font-medium text-slate-800 truncate pr-1">{v.vendorName}</span>
                          <span className="font-mono text-slate-500 text-[10px]">{v.refNo.split("-").slice(-1)}</span>
                          <span className="text-right font-bold text-slate-900">{v.amount}</span>
                          <span className="text-right font-bold text-slate-600">{v.technical}/100</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
                      No bid submissions recorded for this tender. Verify with procurement system.
                    </div>
                  )}

                  {/* Printable register actions */}
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs hover:bg-slate-50">
                      <Printer className="h-3.5 w-3.5" /> Print Register
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs hover:bg-slate-50">
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs hover:bg-slate-50">
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-4 text-center">
                  <KeyRound className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-amber-800">Vault is locked</p>
                  <p className="text-[11px] text-amber-600 mt-1">All 4 authorised officers must authenticate to reveal bid contents</p>
                  <button onClick={() => handleOpenVault(selectedBid)}
                    className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold mx-auto">
                    <KeyRound className="h-3.5 w-3.5" /> Authenticate & Open
                  </button>
                </div>
              )}

              {/* Doc viewer toggle */}
              <div className="flex gap-2">
                <button onClick={() => setShowDocViewer(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 transition-colors">
                  <FileText className="h-3.5 w-3.5" />
                  {showDocViewer ? "Hide" : "Show"} Document Viewer
                </button>
                <button onClick={() => setShowAiChat(v => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50 transition-colors">
                  {showAiChat ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  {showAiChat ? "Hide" : "Show"} AI Assistant
                </button>
              </div>

              {showDocViewer && (
                <DocumentViewerPanel
                  documents={[{ id: "1", name: `${selectedBid.id} — Opening Minute`, type: "letter" }]}
                  defaultVisible={true}
                  className="rounded-lg border border-slate-200 min-h-[200px]"
                />
              )}
              {showAiChat && (
                <AiAgentChatPanel
                  agentName="Bid Opening Agent"
                  agentRole="Procurement Compliance"
                  context="bid opening process"
                  defaultVisible={true}
                  className="rounded-lg border border-slate-200 min-h-[200px]"
                />
              )}

              {/* Approval signature block */}
              {isOpened && (
                <ApprovalSignatureBlock
                  createdBy={{ name: "System", date: new Date().toLocaleDateString("en-ZW"), time: new Date().toLocaleTimeString("en-ZW") }}
                  showComments={true}
                />
              )}
            </div>

            {/* Workflow action bar */}
            {isOpened && (
              <div className="border-t border-slate-200 shrink-0">
                <WorkflowActionBar
                  visibleButtons={["back", "saveDraft", "approve", "authorize", "adjudicate"]}
                  onBack={() => setSelectedBid(null)}
                  showUtilities={true}
                  className="px-4 py-3"
                />
              </div>
            )}
          </div>
        )}

        {/* Show detail button when hidden */}
        {!showDetail && selectedBid && (
          <div className="w-10 flex-shrink-0 border-l border-slate-200 bg-white flex items-start justify-center pt-4">
            <button onClick={() => setShowDetail(true)}
              className="h-8 w-8 grid place-items-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              title="Show detail panel">
              <Eye className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Vault Login Modal */}
      <VaultLoginModal
        isOpen={vaultModalOpen}
        onClose={() => { setVaultModalOpen(false); }}
        title="Tender Bid Vault — Opening Authentication"
        officers={[
          { id: "1", name: "T. Moyo",      role: "Chief Procurement Officer", isAuthenticated: false },
          { id: "2", name: "R. Chikwanda", role: "Finance Director",           isAuthenticated: false },
          { id: "3", name: "P. Dube",      role: "Evaluation Officer",         isAuthenticated: false },
          { id: "4", name: "S. Nkosi",     role: "Audit Officer",              isAuthenticated: false },
        ]}
        onAuthenticate={(officerId, password, otp) => { console.log(`BidOpening auth: ${officerId}`); }}
        onAllAuthenticated={handleVaultAuthenticated}
      />
    </AppShell>
  );
}
