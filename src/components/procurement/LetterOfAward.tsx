/**
 * LetterOfAward — Section 6.5
 * Formal notice of award to winning bidder.
 * Government of Zimbabwe / Ministry of Finance letterhead.
 */
import { ProcurementDocumentTemplate, type ProcDocMeta } from "@/components/ui/ProcurementDocumentTemplate";
import { CheckCircle2, AlertTriangle, Calendar, MapPin } from "lucide-react";

export type LetterOfAwardProps = {
  meta: ProcDocMeta;
  referenceNumber: string;
  bidderMD?: string;
  bidderCompanyName: string;
  bidderAddress: string;
  awardDetails: {
    tenderNumber: string;
    tenderTitle: string;
    successfulBidder: string;
    contractAmount: number;
    contractDuration: string;
    deliveryPeriod: string;
    procurementMethod: string;
    fundingSource: string;
    financialYear: string;
  };
  evaluationStrengths: string[];
  conditionsOfAward: Array<{
    item: string;
    deadline?: string;
  }>;
  nextSteps: Array<{
    event: string;
    date?: string;
    time?: string;
    venue?: string;
  }>;
  permanentSecretaryName: string;
  ministry: string;
  completeByDays?: number; // e.g. 14
};

function fmtCurrency(n: number, currency = "USD") {
  return `${currency} ${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export function LetterOfAward({
  meta,
  referenceNumber,
  bidderMD,
  bidderCompanyName,
  bidderAddress,
  awardDetails,
  evaluationStrengths,
  conditionsOfAward,
  nextSteps,
  permanentSecretaryName,
  ministry,
  completeByDays = 14,
}: LetterOfAwardProps) {
  const currency = meta.currency ?? "USD";

  return (
    <ProcurementDocumentTemplate
      meta={meta}
      documentTitle="Notice of Award of Tender"
      documentSubtitle={`${awardDetails.tenderNumber} — ${awardDetails.tenderTitle}`}
      onPrint={() => window.print()}
    >
      {/* Letter header */}
      <div className="mb-6 text-sm space-y-1">
        <p><strong>Ref:</strong> {referenceNumber}</p>
        <p><strong>Date:</strong> {meta.date}</p>
        <div className="mt-4">
          {bidderMD && <p className="font-semibold">{bidderMD}</p>}
          <p className="font-semibold">{bidderCompanyName}</p>
          <p className="whitespace-pre-line text-gray-700">{bidderAddress}</p>
        </div>
        <div className="mt-4 font-black uppercase text-base underline tracking-wide">
          NOTICE OF AWARD OF TENDER — {awardDetails.tenderNumber}
        </div>
      </div>

      {/* Body */}
      <section className="mb-5 text-sm text-gray-800 space-y-3 leading-relaxed">
        <p>
          On behalf of the <strong>{ministry}</strong>, I am pleased to inform you that following a competitive tendering
          process conducted in accordance with the <strong>Public Procurement Act</strong> and applicable procurement
          regulations, and upon the recommendation of the duly constituted Tender Evaluation Committee and approval of
          the Ministry Procurement Committee, your organisation has been selected as the <strong>Best Evaluated
          Responsive Bidder</strong> for the above-referenced tender.
        </p>
        <p>
          Your bid was evaluated against the approved Tender Evaluation Criteria and achieved the highest overall
          combined evaluation score among all responsive bidders.
        </p>
      </section>

      {/* Award details table */}
      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">
          Award Details
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {[
            ["Tender Number",        awardDetails.tenderNumber],
            ["Tender Title",         awardDetails.tenderTitle],
            ["Successful Bidder",    awardDetails.successfulBidder],
            ["Contract Amount",      fmtCurrency(awardDetails.contractAmount, currency)],
            ["Contract Duration",    awardDetails.contractDuration],
            ["Delivery Period",      awardDetails.deliveryPeriod],
            ["Procurement Method",   awardDetails.procurementMethod],
            ["Funding Source",       awardDetails.fundingSource],
            ["Financial Year",       awardDetails.financialYear],
          ].map(([label, value]) => (
            <div key={String(label)} className="border border-gray-200 rounded p-2">
              <p className="font-semibold uppercase tracking-wide text-gray-400 mb-0.5 text-[10px]">{label}</p>
              <p className={`font-bold text-gray-900 ${label === "Contract Amount" ? "text-emerald-700" : ""}`}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Evaluation outcome — strengths */}
      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">
          Evaluation Outcome
        </h2>
        <p className="text-xs text-gray-700 mb-2">Your bid demonstrated the following key strengths:</p>
        <ul className="space-y-1">
          {evaluationStrengths.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* Conditions of award */}
      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">
          Conditions of Award
        </h2>
        <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            This Notice of Award is subject to the successful completion of the following conditions within{" "}
            <strong>{completeByDays} calendar days</strong> of receipt of this letter. Failure to comply may result
            in withdrawal of the award and consideration of the next ranked bidder.
          </p>
        </div>
        <ol className="list-decimal list-inside space-y-2 text-xs text-gray-700 ml-2">
          {conditionsOfAward.map((cond, i) => (
            <li key={i} className="leading-relaxed">
              {cond.item}
              {cond.deadline && <span className="text-amber-700 font-semibold"> (Deadline: {cond.deadline})</span>}
            </li>
          ))}
        </ol>
      </section>

      {/* Next steps */}
      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">
          Next Steps
        </h2>
        <div className="space-y-2">
          {nextSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 border border-gray-200 rounded p-3 bg-gray-50 text-xs">
              <div className="h-6 w-6 rounded-full bg-[#1a6b3a] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{step.event}</p>
                <div className="flex flex-wrap gap-3 mt-1 text-gray-500">
                  {step.date  && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{step.date}</span>}
                  {step.time  && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{step.time}</span>}
                  {step.venue && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{step.venue}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing signature */}
      <section className="mt-8 text-sm">
        <p className="text-gray-700 leading-relaxed mb-6">
          We look forward to a successful partnership. Please do not hesitate to contact the Relationship Manager
          detailed in the footer of this letter should you require any clarification.
        </p>
        <p className="font-semibold">Yours faithfully,</p>
        <div className="mt-8 border-b border-gray-400 w-48 pb-1 mb-1" />
        <p className="font-bold">{permanentSecretaryName}</p>
        <p className="text-gray-600">Permanent Secretary</p>
        <p className="text-gray-600">{ministry}</p>
        <p className="text-gray-600">Government of Zimbabwe</p>
      </section>

      <p className="text-[10px] text-gray-400 text-center mt-6">
        End of Letter · {awardDetails.tenderNumber} · {meta.date}
      </p>
    </ProcurementDocumentTemplate>
  );
}
