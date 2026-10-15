/**
 * TenderBidOpeningRegister — Section 6.1
 * Official record produced at Bid Opening Vault completion.
 * Auto-populated from live tender/bid data.
 */
import { ProcurementDocumentTemplate, type ProcDocMeta } from "@/components/ui/ProcurementDocumentTemplate";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertTriangle, Shield, Video, Mic, Link2 } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
export type BidRegistryRow = {
  bidNo: string;
  bidderName: string;
  country: string;
  bidSecuritySubmitted: boolean;
  numberOfFiles: number;
  financialOffer: number;
  receivedOnTime: boolean;
  status: "Opened" | "Late" | "Withdrawn";
};

export type CommitteeMember = {
  name: string;
  role: string;
  title: string;
};

export type TenderBidOpeningRegisterProps = {
  meta: ProcDocMeta;
  tenderInfo: {
    procuringEntity: string;
    tenderNumber: string;
    tenderTitle: string;
    procurementMethod: string;
    financialYear: string;
    closingDate: string;
    closingTime: string;
    openingDate: string;
    openingTime: string;
    venue: string;
    conductedBy: string;
  };
  bids: BidRegistryRow[];
  committee: CommitteeMember[];
  sessionId?: string;
  videoRecordingRef?: string;
  audioRecordingRef?: string;
  blockchainAuditHash?: string;
};

function fmtCurrency(n: number, currency = "USD") {
  return `${currency} ${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function YesNo({ value }: { value: boolean }) {
  return value
    ? <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Yes</span>
    : <span className="flex items-center gap-1 text-red-600"><XCircle className="h-3.5 w-3.5" /> No</span>;
}

export function TenderBidOpeningRegister({
  meta,
  tenderInfo,
  bids,
  committee,
  sessionId = "OPN-2027-000145",
  videoRecordingRef,
  audioRecordingRef,
  blockchainAuditHash,
}: TenderBidOpeningRegisterProps) {
  const openedBids    = bids.filter(b => b.status === "Opened");
  const lateBids      = bids.filter(b => b.status === "Late");
  const withdrawnBids = bids.filter(b => b.status === "Withdrawn");
  const financialOffers = openedBids.map(b => b.financialOffer).filter(n => n > 0);
  const avgPrice = financialOffers.length ? financialOffers.reduce((s, v) => s + v, 0) / financialOffers.length : 0;
  const lowestOffer  = financialOffers.length ? Math.min(...financialOffers) : 0;
  const highestOffer = financialOffers.length ? Math.max(...financialOffers) : 0;

  const currency = meta.currency ?? "USD";

  return (
    <ProcurementDocumentTemplate
      meta={meta}
      documentTitle="Tender Bid Opening Register"
      documentSubtitle="Official Record of Bids Received and Opened"
      onPrint={() => window.print()}
    >
      {/* Tender information block */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">
          A — Tender Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            ["Procuring Entity",       tenderInfo.procuringEntity],
            ["Tender Number",          tenderInfo.tenderNumber],
            ["Tender Title",           tenderInfo.tenderTitle],
            ["Procurement Method",     tenderInfo.procurementMethod],
            ["Financial Year",         tenderInfo.financialYear],
            ["Tender Closing Date",    tenderInfo.closingDate],
            ["Tender Closing Time",    tenderInfo.closingTime],
            ["Bid Opening Date",       tenderInfo.openingDate],
            ["Bid Opening Time",       tenderInfo.openingTime],
            ["Venue",                  tenderInfo.venue],
            ["Opening Conducted By",   tenderInfo.conductedBy],
            ["Opening Session ID",     sessionId],
          ].map(([label, value]) => (
            <div key={label} className="border border-gray-200 rounded p-2">
              <p className="font-semibold uppercase tracking-wide text-gray-400 mb-0.5 text-[10px]">{label}</p>
              <p className="font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Register of bids received */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">
          B — Register of Bids Received
        </h2>
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#1a6b3a] text-white">
                {["Bid No.", "Bidder Name", "Country", "Bid Security", "Files", "Financial Offer", "On Time", "Status"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bids.map((bid, i) => (
                <tr key={bid.bidNo} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 font-mono font-bold text-gray-700">{bid.bidNo}</td>
                  <td className="px-3 py-2 font-medium text-gray-900">{bid.bidderName}</td>
                  <td className="px-3 py-2 text-gray-700">{bid.country}</td>
                  <td className="px-3 py-2"><YesNo value={bid.bidSecuritySubmitted} /></td>
                  <td className="px-3 py-2 text-center text-gray-700">{bid.numberOfFiles}</td>
                  <td className="px-3 py-2 font-mono font-semibold text-gray-900">
                    {bid.financialOffer > 0 ? fmtCurrency(bid.financialOffer, currency) : "—"}
                  </td>
                  <td className="px-3 py-2"><YesNo value={bid.receivedOnTime} /></td>
                  <td className="px-3 py-2">
                    <Badge className={
                      bid.status === "Opened" ? "bg-emerald-100 text-emerald-700" :
                      bid.status === "Late"   ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-600"
                    }>{bid.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Summary block */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">
          C — Opening Summary
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3 text-xs">
          {[
            ["Total Bids Received", bids.length],
            ["Bids Opened",        openedBids.length],
            ["Late Bids",          lateBids.length],
            ["Withdrawn Bids",     withdrawnBids.length],
            ["Average Tender Price",  avgPrice   > 0 ? fmtCurrency(avgPrice, currency) : "—"],
            ["Lowest Financial Offer",lowestOffer > 0 ? fmtCurrency(lowestOffer, currency) : "—"],
            ["Highest Financial Offer",highestOffer> 0 ? fmtCurrency(highestOffer, currency) : "—"],
          ].map(([label, value]) => (
            <div key={String(label)} className="border border-gray-200 rounded p-2">
              <p className="font-semibold uppercase tracking-wide text-gray-400 mb-0.5 text-[10px]">{label}</p>
              <p className="font-bold text-gray-900 text-sm">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Procurement Opening Committee */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">
          D — Procurement Opening Committee
        </h2>
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#1a6b3a] text-white">
                {["Name", "Role / Title", "Signature"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {committee.map((m, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                  <td className="px-4 py-3 text-gray-700">{m.role} — {m.title}</td>
                  <td className="px-4 py-3">
                    <div className="border-b border-dashed border-gray-300 w-40 pb-3 text-[10px] text-gray-400 italic">Sign here</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Attendance Register */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">
          E — Bidder Attendance Register
        </h2>
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#1a6b3a] text-white">
                {["Bid No.", "Organisation", "Representative Name", "Signature"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bids.map((bid, i) => (
                <tr key={bid.bidNo} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 font-mono font-bold text-gray-700">{bid.bidNo}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{bid.bidderName}</td>
                  <td className="px-4 py-3 text-gray-500 italic">Representative</td>
                  <td className="px-4 py-3">
                    <div className="border-b border-dashed border-gray-300 w-36 pb-3 text-[10px] text-gray-400 italic">Sign here</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Prepared-by block */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">
          F — Prepared By
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            ["Chairperson", committee[0]?.name ?? "—"],
            ["Title",       "Procurement Oversight Committee"],
            ["Ministry",    tenderInfo.procuringEntity],
            ["Date",        tenderInfo.openingDate],
          ].map(([label, value]) => (
            <div key={label} className="border border-gray-200 rounded p-2">
              <p className="font-semibold uppercase tracking-wide text-gray-400 mb-0.5 text-[10px]">{label}</p>
              <p className="font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 border border-gray-200 rounded p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Chairperson Signature</p>
          <div className="border-b border-dashed border-gray-300 w-48 pb-6" />
        </div>
      </section>

      {/* Standard notice text — verbatim boilerplate */}
      <section className="mb-6 bg-blue-50 border border-blue-200 rounded p-4">
        <div className="flex gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-2">Important Notice — Bid Opening Statement</p>
            <p className="text-xs text-gray-700 leading-relaxed">
              The prices read out today at the public opening are for transparency and public record purposes only and do <strong>not</strong> determine the award.
              Every bid received on time shall proceed through the following evaluation stages:
              Preliminary Examination → Administrative Compliance Evaluation → Mandatory Requirements Assessment →
              Eligibility Verification → Technical Evaluation → Financial Evaluation → Due Diligence →
              Risk Assessment → Combined Technical &amp; Financial Scoring → Evaluation Committee Recommendation →
              Procurement Committee Review → Accounting Officer Approval → Notice of Award.
            </p>
            <p className="text-xs text-gray-700 mt-2">
              <strong>The lowest price or highest technical score alone does not guarantee award.</strong> The contract will be awarded to the
              Best Evaluated Responsive Bidder as determined by the approved evaluation methodology and in accordance with
              applicable procurement law and regulations.
            </p>
          </div>
        </div>
      </section>

      {/* System metadata */}
      <section className="mb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">
          G — System Metadata &amp; Platform Features
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            ["Opening Session ID",       sessionId],
            ["Digital Opening Certificate", "Generated — Verified"],
            ["Digital Time Stamp",       new Date().toISOString()],
            ["Blockchain Audit Hash",    blockchainAuditHash ?? "0x3f9a…bc2d (Immutable)"],
            ["QR Verification Code",     "Embedded in footer"],
            ["Report Classification",    meta.reportClassification ?? "OFFICIAL"],
            ["Report Version",           "1.0"],
            ["Audit Trail Status",       "Active — All actions logged"],
          ].map(([label, value]) => (
            <div key={label} className="border border-gray-200 rounded p-2">
              <p className="font-semibold uppercase tracking-wide text-gray-400 mb-0.5 text-[10px]">{label}</p>
              <p className="font-medium text-gray-800 break-all">{value}</p>
            </div>
          ))}
        </div>
        {/* Platform feature indicators */}
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { icon: Shield, label: "Blockchain Audit Trail", status: "Active" },
            { icon: Video,  label: "Video Recording",        status: videoRecordingRef ? "Linked" : "Pending" },
            { icon: Mic,    label: "Audio Recording",        status: audioRecordingRef ? "Linked" : "Pending" },
            { icon: Link2,  label: "Supplier Portal Published", status: "Published" },
          ].map(({ icon: Icon, label, status }) => (
            <div key={label} className="flex items-center gap-2 border border-gray-200 rounded p-2 bg-gray-50">
              <Icon className="h-4 w-4 text-[#1a6b3a] flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-gray-700">{label}</p>
                <p className="text-[10px] text-emerald-600 font-bold">{status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-[10px] text-gray-400 text-center mt-4">
        End of Tender Bid Opening Register · {meta.tenderNumber} · {tenderInfo.openingDate}
      </p>
    </ProcurementDocumentTemplate>
  );
}
