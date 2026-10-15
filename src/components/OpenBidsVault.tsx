/**
 * OpenBidsVault — redesigned per 21 July Final Tenders Flow Design
 *
 * Per document spec:
 * - List rows: Tender Name, Tender Code, Closing Date & Time, Countdown Timer, Open Vault button
 * - Vault open: login popup with 4 authorized officers (password + OTP)
 * - Once vault opens: list of vendor bids with price offer drops down
 * - 4 officers then key electronic signatures → dry list is final
 * - Audit trail, AI chatbot, document viewer (hide/show)
 * - Full details created by at bottom of page (date and time)
 * - Add approved by, authorized by, officers electronic signatures, attached docs, resolutions, minutes
 */
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { ClosingCountdownTimer } from "./ui/ClosingCountdownTimer";
import { VaultLoginModal } from "./ui/VaultLoginModal";
import { WorkflowActionBar } from "./ui/WorkflowActionBar";
import { ApprovalSignatureBlock } from "./ui/ApprovalSignatureBlock";
import { DocumentViewerPanel } from "./ui/DocumentViewerPanel";
import { AiAgentChatPanel } from "./ui/AiAgentChatPanel";
import {
  Lock, Eye, Calendar, Building2, Tag, AlertTriangle, CheckCircle2,
  FileText, Bot, ChevronDown, DollarSign, User, Clock, Shield
} from "lucide-react";

type Tender = {
  id: string;
  name: string;
  code: string;
  ministry: string;
  closingDate: Date;
  bidOpeningDate: Date;
  status: "closed" | "opening" | "opened";
  createdBy: string;
  createdAt: string;
};

type VendorBid = {
  id: string;
  rank: number;
  vendorName: string;
  bidAmount: string;
  bidAmountRaw: number;
  submittedDate: string;
  documents: string[];
  status: "compliant" | "non-compliant" | "pending";
};

const MOCK_TENDERS: Tender[] = [
  {
    id: "1",
    name: "Supply & Installation of Solar Mini-Grids — 12 Rural Clinics",
    code: "ZW-PRA-2026-00184",
    ministry: "Ministry of Energy and Power Development",
    closingDate: new Date("2026-07-08T16:00:00"),
    bidOpeningDate: new Date("2026-07-09T10:00:00"),
    status: "closed",
    createdBy: "T. Moyo — Chief Procurement Officer",
    createdAt: "2026-04-12T09:15:00",
  },
  {
    id: "2",
    name: "Procurement of Antiretroviral Medicines (2-Year Framework)",
    code: "ZW-PRA-2026-00183",
    ministry: "Ministry of Health and Child Care",
    closingDate: new Date("2026-06-12T16:00:00"),
    bidOpeningDate: new Date("2026-06-13T10:00:00"),
    status: "opening",
    createdBy: "R. Chikwanda — Procurement Officer",
    createdAt: "2026-03-08T11:30:00",
  },
  {
    id: "3",
    name: "National Tax Administration System — Phase II",
    code: "ZW-PRA-2026-00182",
    ministry: "ZIMRA",
    closingDate: new Date("2026-07-21T16:00:00"),
    bidOpeningDate: new Date("2026-07-22T10:00:00"),
    status: "closed",
    createdBy: "P. Dube — Senior Procurement Officer",
    createdAt: "2026-04-20T14:00:00",
  },
];

const MOCK_VENDOR_BIDS: VendorBid[] = [
  { id:"1", rank:1, vendorName:"Highveld Engineering (Pvt) Ltd",     bidAmount:"USD 12,800,000", bidAmountRaw:12800000, submittedDate:"2026-07-08T14:30:00", documents:["Technical Proposal","Financial Proposal","Company Profile","Tax Clearance"], status:"compliant" },
  { id:"2", rank:2, vendorName:"Solar Energy Africa",                 bidAmount:"USD 13,200,000", bidAmountRaw:13200000, submittedDate:"2026-07-08T16:00:00", documents:["Technical Proposal","Financial Proposal","Experience Certificates"],          status:"compliant" },
  { id:"3", rank:3, vendorName:"ZimSolar Solutions",                  bidAmount:"USD 14,100,000", bidAmountRaw:14100000, submittedDate:"2026-07-08T15:45:00", documents:["Technical Proposal","Financial Proposal"],                                        status:"pending"   },
  { id:"4", rank:4, vendorName:"Green Power Systems",                 bidAmount:"USD 13,900,000", bidAmountRaw:13900000, submittedDate:"2026-07-08T15:15:00", documents:["Technical Proposal","Financial Proposal"],                                        status:"compliant" },
];

const AUTHORIZED_OFFICERS = [
  { id:"1", name:"T. Moyo",       role:"Chief Procurement Officer",  isAuthenticated: false },
  { id:"2", name:"R. Chikwanda",  role:"Finance Director",           isAuthenticated: false },
  { id:"3", name:"S. Nkosi",      role:"Audit Officer",              isAuthenticated: false },
  { id:"4", name:"P. Dube",       role:"Evaluation Officer",         isAuthenticated: false },
];

const BID_STATUS_COLOR: Record<string, string> = {
  compliant:     "bg-emerald-100 text-emerald-700",
  "non-compliant":"bg-red-100 text-red-700",
  pending:        "bg-amber-100 text-amber-700",
};

export function OpenBidsVault() {
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [vaultOpen, setVaultOpen]           = useState(false);
  const [vaultModalOpen, setVaultModalOpen] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(true);
  const [showAiChat, setShowAiChat]         = useState(true);

  const handleOpenVault = (tender: Tender) => {
    setSelectedTender(tender);
    setVaultModalOpen(true);
  };

  const handleVaultAuthenticated = () => {
    setVaultModalOpen(false);
    setVaultOpen(true);
  };

  const handleCloseVault = () => {
    setVaultOpen(false);
    setSelectedTender(null);
  };

  /* ── LIST VIEW ─────────────────────────────────────────────────── */
  if (!selectedTender) {
    return (
      <div className="space-y-4">
        {/* KPI strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label:"Closed — Pending Opening", value: MOCK_TENDERS.filter(t => t.status === "closed").length,   color:"text-[#0f172a]",  bg:"bg-white" },
            { label:"Opening in Progress",       value: MOCK_TENDERS.filter(t => t.status === "opening").length,  color:"text-amber-700",  bg:"bg-amber-50 border-amber-200" },
            { label:"Already Opened",            value: MOCK_TENDERS.filter(t => t.status === "opened").length,   color:"text-emerald-700",bg:"bg-emerald-50 border-emerald-200" },
          ].map(k => (
            <div key={k.label} className={`${k.bg} border rounded-xl px-4 py-3`}>
              <div className={`text-2xl font-black ${k.color}`}>{k.value}</div>
              <div className="text-[11px] text-gray-500">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Security notice */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <strong>SECURE BID VAULT:</strong> Opening a bid requires authentication from all 4 authorized officers using passwords and OTP.
            This ensures bid integrity and prevents manipulation. All actions are logged in the audit trail.
          </div>
        </div>

        {/* Tenders table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-[#1a3a5c] px-4 py-3 flex items-center justify-between">
            <span className="text-white text-xs font-black uppercase tracking-widest">Closed Tenders — Awaiting Bid Opening</span>
            <span className="text-white/50 text-xs">{MOCK_TENDERS.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Tender Name","Tender Code","Ministry","Closing Date & Time","Countdown Timer","Action"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_TENDERS.map(tender => (
                  <tr key={tender.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 text-xs max-w-[260px]">
                        <div className="truncate" title={tender.name}>{tender.name}</div>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {tender.status === "opening" && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                            <AlertTriangle className="h-2.5 w-2.5" /> Opening Imminent
                          </span>
                        )}
                        {tender.status === "opened" && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Opened
                          </span>
                        )}
                        {tender.status === "closed" && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            <Lock className="h-2.5 w-2.5" /> Vault Locked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] text-gray-500">{tender.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-600 flex items-center gap-1 max-w-[160px]">
                        <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{tender.ministry}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-700 whitespace-nowrap">
                        {tender.closingDate.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {tender.closingDate.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ClosingCountdownTimer closingDate={tender.closingDate} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleOpenVault(tender)}
                        disabled={tender.status === "opened"}
                        className="flex items-center gap-1.5 h-8 px-3 bg-[#0f172a] text-white text-[10px] font-bold rounded-lg hover:bg-black/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                      >
                        <Lock className="h-3 w-3" />
                        {tender.status === "opened" ? "Already Opened" : "Open Vault"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  /* ── VAULT DETAIL VIEW ─────────────────────────────────────────── */
  return (
    <div className="flex gap-4">
      {/* Main panel */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Tender header */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[10px] text-gray-400">{selectedTender.code}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${vaultOpen ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                  {vaultOpen ? "🔓 VAULT OPEN" : "🔒 VAULT LOCKED"}
                </span>
              </div>
              <h2 className="text-base font-black text-gray-900 leading-snug mb-1">{selectedTender.name}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{selectedTender.ministry}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Closed: {selectedTender.closingDate.toLocaleDateString()}</span>
              </div>
            </div>
            <button onClick={handleCloseVault}
              className="shrink-0 h-8 px-3 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              ← Back to List
            </button>
          </div>
        </div>

        {!vaultOpen ? (
          /* Locked state */
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-black text-gray-800 mb-2">Vault is Locked</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
              All 4 authorized officers must authenticate with their password and OTP before the vault can be opened and bids revealed.
            </p>
            {/* Officers list */}
            <div className="max-w-sm mx-auto mb-6 space-y-2">
              {AUTHORIZED_OFFICERS.map(o => (
                <div key={o.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2.5">
                  <div className="h-7 w-7 rounded-full bg-[#0f172a] text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                    {o.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs font-bold text-gray-800">{o.name}</div>
                    <div className="text-[10px] text-gray-400">{o.role}</div>
                  </div>
                  <div className="text-[10px] text-amber-600 font-semibold">Pending</div>
                </div>
              ))}
            </div>
            <button onClick={() => setVaultModalOpen(true)}
              className="inline-flex items-center gap-2 h-10 px-6 bg-[#0f172a] text-white text-sm font-bold rounded-xl hover:bg-black/80 transition-colors">
              <Lock className="h-4 w-4" /> Authenticate to Open Vault
            </button>
          </div>
        ) : (
          /* Opened state — vendor bids */
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-emerald-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span className="text-white text-xs font-black uppercase tracking-wide">Vault Opened — Vendor Bids (Dry List)</span>
              </div>
              <span className="text-white/70 text-xs">{MOCK_VENDOR_BIDS.length} bids received</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Rank","Vendor Name","Bid Amount","Submitted","Documents","Status","Action"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {MOCK_VENDOR_BIDS.sort((a,b) => a.bidAmountRaw - b.bidAmountRaw).map((bid, i) => (
                    <tr key={bid.id} className={`hover:bg-gray-50 transition-colors ${i === 0 ? "bg-emerald-50/50" : ""}`}>
                      <td className="px-4 py-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${i === 0 ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900 text-xs">{bid.vendorName}</div>
                        {i === 0 && <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 rounded">LOWEST BID</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 font-mono font-bold text-sm text-gray-900">
                          <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                          {bid.bidAmount.replace("USD ","")}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {new Date(bid.submittedDate).toLocaleDateString()}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(bid.submittedDate).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {bid.documents.map((doc, di) => (
                            <span key={di} className="text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{doc}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${BID_STATUS_COLOR[bid.status]}`}>
                          {bid.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="flex items-center gap-1 h-7 px-2.5 bg-[#0f172a] text-white text-[10px] font-bold rounded-lg hover:bg-black/80">
                          <Eye className="h-3 w-3" /> View Bid
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Workflow action bar */}
        {vaultOpen && (
          <WorkflowActionBar
            visibleButtons={["back","saveDraft","approve","authorize","adjudicate"]}
            onBack={handleCloseVault}
            showUtilities={true}
          />
        )}

        {/* Approval & signature block */}
        {vaultOpen && (
          <ApprovalSignatureBlock
            reviewedBy={{ name:"T. Moyo",         position:"Chief Procurement Officer", department:"Procurement", role:"Reviewer",  authority:"CPO",              dateTime:new Date().toLocaleString() }}
            approvedBy={{ name:"R. Chikwanda",     position:"Finance Director",          department:"Finance",    role:"Approver",  authority:"Finance Director",  dateTime:new Date().toLocaleString() }}
            createdBy={{  name: selectedTender.createdBy, date:new Date(selectedTender.createdAt).toLocaleDateString(), time:new Date(selectedTender.createdAt).toLocaleTimeString() }}
          />
        )}

        {/* Created by — always visible at bottom per spec */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <User className="h-4 w-4 text-gray-400" />
          <div className="text-xs text-gray-600">
            <span className="font-semibold">Created by:</span> {selectedTender.createdBy} &nbsp;·&nbsp;
            <Clock className="h-3 w-3 inline mr-0.5 text-gray-400" />
            {new Date(selectedTender.createdAt).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Right panels */}
      <div className="w-80 shrink-0 space-y-3">
        <div className="flex justify-end gap-2">
          <button onClick={() => setShowAiChat(v => !v)}
            className={`h-7 px-2.5 text-xs rounded-lg border flex items-center gap-1 transition-colors ${showAiChat ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-gray-200 text-gray-500"}`}>
            <Bot className="h-3.5 w-3.5" /> {showAiChat ? "Hide AI" : "Show AI"}
          </button>
          <button onClick={() => setShowDocumentViewer(v => !v)}
            className={`h-7 px-2.5 text-xs rounded-lg border flex items-center gap-1 transition-colors ${showDocumentViewer ? "bg-[#0f172a] text-white border-[#0f172a]" : "border-gray-200 text-gray-500"}`}>
            <FileText className="h-3.5 w-3.5" /> {showDocumentViewer ? "Hide Doc" : "Show Doc"}
          </button>
        </div>

        {showDocumentViewer && (
          <DocumentViewerPanel
            documents={[{
              id:"1", name:"Notification Letter (External)", type:"letter",
              content:`<div style="font-family:Arial,sans-serif;padding:24px;max-width:600px">
                <h2 style="text-align:center;font-size:14px;text-transform:uppercase">Government of Zimbabwe</h2>
                <h3 style="text-align:center;font-size:12px">${selectedTender.ministry}</h3>
                <p style="text-align:center;margin-top:16px"><strong>NOTIFICATION LETTER — BID OPENING</strong></p>
                <p style="margin-top:24px">Reference: ${selectedTender.code}</p>
                <p>Date: ${new Date().toLocaleDateString()}</p>
                <p style="margin-top:16px">Dear Bidder,</p>
                <p>This letter confirms the bid opening for the above-referenced tender has been completed.</p>
                <p style="margin-top:20px">Yours faithfully,<br/>T. Moyo<br/>Chief Procurement Officer</p>
              </div>`
            }]}
            defaultVisible={true}
          />
        )}
        {showAiChat && (
          <AiAgentChatPanel
            agentName="Bid Opening Assistant"
            agentRole="Procurement Intelligence"
            context="bid opening and vault management"
            suggestedPrompts={["Check bid compliance","Compare bid amounts","Identify anomalies","Generate dry list report"]}
            color="blue"
            defaultVisible={true}
          />
        )}
      </div>

      {/* Vault Login Modal */}
      <VaultLoginModal
        isOpen={vaultModalOpen}
        onClose={() => { setVaultModalOpen(false); setSelectedTender(null); }}
        title="Tender Bid Vault Authentication"
        officers={AUTHORIZED_OFFICERS}
        onAuthenticate={(officerId, password, otp) => { console.log(`Auth: ${officerId}`); }}
        onAllAuthenticated={handleVaultAuthenticated}
      />
    </div>
  );
}
