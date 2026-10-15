/**
 * AwardRecommendationLetter — Section 6.4
 * Formal letter to Permanent Secretary from Tender Evaluation Committee.
 */
import { ProcurementDocumentTemplate, type ProcDocMeta } from "@/components/ui/ProcurementDocumentTemplate";

export type AwardRecommendationLetterProps = {
  meta: ProcDocMeta;
  ourRef: string; // e.g. "TEC/MOF/002/2026/001"
  permanentSecretaryName: string;
  ministry: string;
  tenderParticulars: {
    procuringEntity: string;
    tenderNumber: string;
    tenderTitle: string;
    procurementMethod: string;
    financialYear: string;
    closingDate: string;
    evaluationCompletionDate: string;
  };
  summaryResults: Array<{
    bidder: string;
    technicalScoreWeighted: number;
    financialScoreWeighted: number;
    overallScore: number;
  }>;
  recommendedBidder: string;
  tenderSum: number;
  recommendationReasons: string[];
  chairpersonName: string;
  chairpersonTitle?: string;
  committee: Array<{ role: string; fullName: string; position: string; dateTime?: string }>;
};

function fmtCurrency(n: number, currency = "USD") {
  return `${currency} ${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export function AwardRecommendationLetter({
  meta,
  ourRef,
  permanentSecretaryName,
  ministry,
  tenderParticulars,
  summaryResults,
  recommendedBidder,
  tenderSum,
  recommendationReasons,
  chairpersonName,
  chairpersonTitle = "Chairperson, Tender Evaluation Committee",
  committee,
}: AwardRecommendationLetterProps) {
  const currency = meta.currency ?? "USD";

  return (
    <ProcurementDocumentTemplate
      meta={meta}
      documentTitle="Tender Evaluation Committee Decision / Award Recommendation Letter"
      documentSubtitle={`Re: ${tenderParticulars.tenderTitle}`}
      onPrint={() => window.print()}
    >
      {/* Letter header block */}
      <div className="mb-6 text-sm space-y-1">
        <p><strong>Our Ref:</strong> {ourRef}</p>
        <p><strong>Date:</strong> {meta.date}</p>
        <div className="mt-4">
          <p className="font-semibold">{permanentSecretaryName}</p>
          <p>Permanent Secretary</p>
          <p>{ministry}</p>
        </div>
        <div className="mt-4 font-bold underline uppercase">
          RE: TENDER EVALUATION COMMITTEE RECOMMENDATION — {tenderParticulars.tenderNumber} — {tenderParticulars.tenderTitle.toUpperCase()}
        </div>
      </div>

      {/* Introduction */}
      <section className="mb-5 text-sm text-gray-700">
        <p className="leading-relaxed">
          I write on behalf of the Tender Evaluation Committee (TEC) constituted under the Ministry's Procurement Procedures
          to submit the Committee's formal recommendation following the completion of the evaluation process for the
          above-referenced tender. The evaluation was conducted in strict accordance with the approved evaluation criteria
          and methodology, and in compliance with the applicable procurement legislation and regulations.
        </p>
      </section>

      {/* Tender Particulars */}
      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">1. Tender Particulars</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {[
            ["Procuring Entity",          tenderParticulars.procuringEntity],
            ["Tender Number",             tenderParticulars.tenderNumber],
            ["Tender Title",              tenderParticulars.tenderTitle],
            ["Procurement Method",        tenderParticulars.procurementMethod],
            ["Financial Year",            tenderParticulars.financialYear],
            ["Tender Closing Date",       tenderParticulars.closingDate],
            ["Evaluation Completion Date",tenderParticulars.evaluationCompletionDate],
          ].map(([label, value]) => (
            <div key={String(label)} className="border border-gray-200 rounded p-2">
              <p className="font-semibold uppercase tracking-wide text-gray-400 mb-0.5 text-[10px]">{label}</p>
              <p className="font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Evaluation Process */}
      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">2. Evaluation Process</h2>
        <p className="text-xs text-gray-700 mb-2">The Committee conducted the following evaluation stages:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs text-gray-700 ml-2">
          {["Preliminary Examination","Administrative Compliance Evaluation","Technical Evaluation","Financial Evaluation","Due Diligence","Combined Technical & Financial Evaluation","Risk Assessment","Evaluation Committee Recommendation"].map((stage, i) => (
            <li key={i}>{stage}</li>
          ))}
        </ol>
      </section>

      {/* Summary of Results */}
      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">3. Summary of Results</h2>
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#1a6b3a] text-white">
                {["Bidder", "Technical Score (Weighted %)", "Financial Score (Weighted %)", "Overall Score"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {summaryResults.map((r, i) => (
                <tr key={r.bidder} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} ${r.bidder === recommendedBidder ? "font-bold ring-1 ring-inset ring-emerald-400" : ""}`}>
                  <td className="px-4 py-3 text-gray-900">{r.bidder}{r.bidder === recommendedBidder ? " ★" : ""}</td>
                  <td className="px-4 py-3 font-mono">{r.technicalScoreWeighted.toFixed(2)}%</td>
                  <td className="px-4 py-3 font-mono">{r.financialScoreWeighted.toFixed(2)}%</td>
                  <td className={`px-4 py-3 font-mono font-bold ${r.bidder === recommendedBidder ? "text-emerald-700" : "text-gray-800"}`}>{r.overallScore.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recommendation */}
      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">4. Recommendation</h2>
        <div className="bg-emerald-50 border border-emerald-200 rounded p-4 text-sm text-gray-800 leading-relaxed">
          <p>
            The Tender Evaluation Committee unanimously recommends the award of <strong>{tenderParticulars.tenderTitle}</strong> to{" "}
            <strong>{recommendedBidder}</strong> at a tender sum of <strong>{fmtCurrency(tenderSum, currency)}</strong>.
          </p>
          <p className="mt-2">The recommended bidder has been identified as the <strong>Best Evaluated Responsive Bidder</strong> on the basis of:</p>
          <ul className="mt-2 space-y-1">
            {recommendationReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold flex-shrink-0">{i + 1}.</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Approval block */}
      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">5. Approvals</h2>
        {/* Recommended by - Chairperson */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
          <div className="border border-gray-200 rounded p-4">
            <p className="font-semibold uppercase tracking-wide text-gray-400 text-[10px] mb-3">Recommended By — Chairperson, TEC</p>
            <p className="font-semibold text-gray-800">{chairpersonName}</p>
            <p className="text-gray-600 mb-3">{chairpersonTitle}</p>
            <div className="border-b border-dashed border-gray-300 pb-5 mb-2" />
            <p className="text-gray-400 text-[10px]">Signature / Date</p>
          </div>
          <div className="border border-gray-200 rounded p-4">
            <p className="font-semibold uppercase tracking-wide text-gray-400 text-[10px] mb-3">Procurement Oversight — Reviewed By</p>
            <div className="border-b border-dashed border-gray-300 pb-5 mb-2" />
            <p className="text-gray-400 text-[10px]">Name / Position / Signature / Date</p>
          </div>
        </div>
        {/* Full committee table */}
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#1a6b3a] text-white">
                {["Role", "Full Name", "Position", "Signature", "Date & Time"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {committee.map((m, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-4 py-3 font-semibold text-gray-700">{m.role}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{m.fullName}</td>
                  <td className="px-4 py-3 text-gray-700">{m.position}</td>
                  <td className="px-4 py-3"><div className="border-b border-dashed border-gray-300 w-36 pb-3" /></td>
                  <td className="px-4 py-3 text-gray-500">{m.dateTime ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="text-xs text-gray-500 italic mt-2">
        Annexure A — Tender Evaluation Score Result Sheet is attached hereto and forms part of this recommendation.
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-4">
        End of Recommendation Letter · {tenderParticulars.tenderNumber} · {meta.date}
      </p>
    </ProcurementDocumentTemplate>
  );
}
