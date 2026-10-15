/**
 * EvaluationBidderResultSheet — Section 6.3
 * Single-bidder result transcript / debrief.
 * Includes per-criterion AI-generated justification blocks.
 */
import { useState } from "react";
import { ProcurementDocumentTemplate, type ProcDocMeta } from "@/components/ui/ProcurementDocumentTemplate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Bot, Edit3, Gavel, Scale, AlertTriangle } from "lucide-react";
import type { EvalStatus } from "./EvaluationConsolidatedScoreSheet";

// ── Types ─────────────────────────────────────────────────────────────────────
export type TechCriterion = {
  criteria: string;
  maximumMarks: number;
  marksAwarded: number;
  weightedScore: number;
  justification: string; // AI-generated multi-sentence justification
};

export type AIComplianceItem = {
  complianceArea: string;
  status: string; // e.g. "✔ Compliant" | "✔ Valid" | "✖ Missing"
  compliant: boolean;
};

export type BidderResultProps = {
  meta: ProcDocMeta;
  sectionA: {
    procuringEntity: string;
    procuringDepartment: string;
    tenderNumber: string;
    tenderTitle: string;
    procurementMethod: string;
    tenderCategory: string;
    financialYear: string;
    fundingSource: string;
    evaluationMethod: string; // e.g. "80:20"
    closingDate: string;
    evaluationDate: string;
    evaluationCommitteeRef: string;
    bidValidityDays: number;
    evaluationStatus: string;
  };
  sectionB: {
    companyName: string;
    companyRegistration: string;
    taxIdentificationNumber: string;
    ppadbRegistrationNumber: string;
    citizenOwned: boolean;
    physicalAddress: string;
    contactPerson: string;
    tenderAmountSubmitted: number;
  };
  technicalCriteria: TechCriterion[];
  technicalThreshold: number; // e.g. 70
  technicalWeight: number;    // e.g. 80
  financial: {
    lowestResponsiveBid: number;
    thisBidderPrice: number;
    financialWeight: number; // e.g. 20
    financialFormula: string;
    financialScore: number;
  };
  allBiddersRanking: Array<{ rank: number; bidderName: string; totalScore: number }>;
  committee: Array<{ role: string; fullName: string; position: string; dateTime?: string }>;
  aiComplianceItems: AIComplianceItem[];
  strengths?: string[];
  adjudicationRequired?: boolean;
  initialEvalStatus?: EvalStatus;
};

function fmtCurrency(n: number, currency = "USD") {
  return `${currency} ${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export function EvaluationBidderResultSheet({
  meta,
  sectionA,
  sectionB,
  technicalCriteria,
  technicalThreshold,
  technicalWeight,
  financial,
  allBiddersRanking,
  committee,
  aiComplianceItems,
  strengths = [],
  adjudicationRequired = false,
  initialEvalStatus = "AI-Generated",
}: BidderResultProps) {
  const [evalStatus, setEvalStatus] = useState<EvalStatus>(initialEvalStatus);

  const currency = meta.currency ?? "USD";
  const rawTechScore     = technicalCriteria.reduce((s, c) => s + c.marksAwarded, 0);
  const maxTechScore     = technicalCriteria.reduce((s, c) => s + c.maximumMarks, 0);
  const techPercent      = maxTechScore > 0 ? (rawTechScore / maxTechScore) * 100 : 0;
  const weightedTech     = (techPercent / 100) * technicalWeight;
  const passedTechnical  = techPercent >= technicalThreshold;
  const myRank           = allBiddersRanking.find(r => r.bidderName === sectionB.companyName);
  const finalScore       = weightedTech + financial.financialScore;

  return (
    <ProcurementDocumentTemplate
      meta={meta}
      documentTitle="Tender Evaluation Result Sheet — Specific Bidder"
      documentSubtitle={`Bidder: ${sectionB.companyName}`}
      onPrint={() => window.print()}
    >
      {/* Eval status banner */}
      <div className="mb-4 flex items-center gap-3 bg-slate-50 border border-gray-200 rounded p-3">
        {evalStatus === "AI-Generated" && <Bot className="h-5 w-5 text-blue-600" />}
        {evalStatus === "Manually-Overridden" && <Edit3 className="h-5 w-5 text-amber-600" />}
        {evalStatus === "Adjudication" && <Gavel className="h-5 w-5 text-orange-600" />}
        {evalStatus === "Appeal" && <Scale className="h-5 w-5 text-purple-600" />}
        {evalStatus === "Final" && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-700">
            Evaluation Status: <Badge className={{
              "AI-Generated": "bg-blue-100 text-blue-700",
              "Manually-Overridden": "bg-amber-100 text-amber-700",
              "Adjudication": "bg-orange-100 text-orange-700",
              "Appeal": "bg-purple-100 text-purple-700",
              "Final": "bg-emerald-100 text-emerald-700",
            }[evalStatus] ?? ""}>{evalStatus}</Badge>
          </p>
        </div>
        {evalStatus === "AI-Generated" && (
          <Button size="sm" variant="outline" className="gap-1 text-xs text-amber-700 border-amber-300" onClick={() => setEvalStatus("Manually-Overridden")}>
            <Edit3 className="h-3 w-3" /> Dispute &amp; Override
          </Button>
        )}
      </div>

      {/* Section A — Tender Particulars */}
      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">Section A — Tender Particulars</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {[
            ["Procuring Entity",       sectionA.procuringEntity],
            ["Tender Number",          sectionA.tenderNumber],
            ["Tender Title",           sectionA.tenderTitle],
            ["Procurement Method",     sectionA.procurementMethod],
            ["Tender Category",        sectionA.tenderCategory],
            ["Financial Year",         sectionA.financialYear],
            ["Funding Source",         sectionA.fundingSource],
            ["Evaluation Method",      sectionA.evaluationMethod],
            ["Closing Date",           sectionA.closingDate],
            ["Evaluation Date",        sectionA.evaluationDate],
            ["Committee Ref",          sectionA.evaluationCommitteeRef],
            ["Bid Validity (days)",    sectionA.bidValidityDays],
            ["Evaluation Status",      sectionA.evaluationStatus],
          ].map(([label, value]) => (
            <div key={String(label)} className="border border-gray-200 rounded p-2">
              <p className="font-semibold uppercase tracking-wide text-gray-400 mb-0.5 text-[10px]">{label}</p>
              <p className="font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section B — Bidder Information */}
      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">Section B — Bidder Information</h2>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ["Company Name",                   sectionB.companyName],
            ["Company Registration",           sectionB.companyRegistration],
            ["Tax Identification Number",       sectionB.taxIdentificationNumber],
            ["PPRA/PPADB Registration",         sectionB.ppadbRegistrationNumber],
            ["Citizen Owned",                   sectionB.citizenOwned ? "Yes" : "No"],
            ["Physical Address",               sectionB.physicalAddress],
            ["Contact Person",                 sectionB.contactPerson],
            ["Tender Amount Submitted",        fmtCurrency(sectionB.tenderAmountSubmitted, currency)],
          ].map(([label, value]) => (
            <div key={String(label)} className="border border-gray-200 rounded p-2">
              <p className="font-semibold uppercase tracking-wide text-gray-400 mb-0.5 text-[10px]">{label}</p>
              <p className="font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section C — Technical Evaluation */}
      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">Section C — Technical Evaluation Results</h2>
        <div className="overflow-x-auto border border-gray-200 rounded mb-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#1a6b3a] text-white">
                {["Evaluation Criteria", "Max Marks", "Marks Awarded", "Weighted Score"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {technicalCriteria.map((c, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-3 py-2 font-medium text-gray-900">{c.criteria}</td>
                  <td className="px-3 py-2 font-mono text-gray-700">{c.maximumMarks}</td>
                  <td className={`px-3 py-2 font-mono font-bold ${c.marksAwarded < c.maximumMarks * 0.7 ? "text-red-600" : "text-gray-900"}`}>{c.marksAwarded}</td>
                  <td className="px-3 py-2 font-mono text-gray-800">{c.weightedScore.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="bg-slate-50 font-bold border-t-2 border-gray-300">
                <td className="px-3 py-2 text-[#0f172a] uppercase tracking-wide text-[10px]">TOTAL TECHNICAL SCORE</td>
                <td className="px-3 py-2 font-mono text-[#0f172a]">{maxTechScore}</td>
                <td className="px-3 py-2 font-mono text-[#0f172a]">{rawTechScore}</td>
                <td className="px-3 py-2 font-mono text-[#0f172a]">{weightedTech.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded ${passedTechnical ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
          {passedTechnical ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          <span className="text-xs font-bold uppercase">Technical Threshold ({technicalThreshold}%): {passedTechnical ? "PASSED" : "FAILED"} — {techPercent.toFixed(1)}%</span>
        </div>
      </section>

      {/* Section D — Financial Evaluation */}
      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">Section D — Financial Evaluation</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {[
            ["Lowest Responsive Bid",   fmtCurrency(financial.lowestResponsiveBid, currency)],
            ["This Bidder's Price",     fmtCurrency(financial.thisBidderPrice, currency)],
            ["Financial Formula",       financial.financialFormula],
            ["Financial Weight",        `${financial.financialWeight}%`],
            ["Financial Score",         financial.financialScore.toFixed(2)],
          ].map(([label, value]) => (
            <div key={String(label)} className="border border-gray-200 rounded p-2">
              <p className="font-semibold uppercase tracking-wide text-gray-400 mb-0.5 text-[10px]">{label}</p>
              <p className="font-mono font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section E — Final Combined Result */}
      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">Section E — Final Combined Result</h2>
        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          {[
            { label: "Technical Score (Weighted)", value: weightedTech.toFixed(2), color: "text-blue-700" },
            { label: "Financial Score (Weighted)", value: financial.financialScore.toFixed(2), color: "text-green-700" },
            { label: "FINAL COMBINED SCORE", value: finalScore.toFixed(2), color: "text-[#0f172a] text-2xl font-black" },
          ].map(({ label, value, color }) => (
            <div key={label} className="border-2 border-gray-200 rounded-lg p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</p>
              <p className={`font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
        {/* Ranking table */}
        <div className="overflow-x-auto border border-gray-200 rounded">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#1a6b3a] text-white">
                {["Rank", "Bidder", "Total Score"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allBiddersRanking.map((r, i) => (
                <tr key={r.rank} className={`${i % 2 === 0 ? "bg-white" : "bg-gray-50"} ${r.bidderName === sectionB.companyName ? "ring-1 ring-inset ring-blue-400" : ""}`}>
                  <td className="px-4 py-2 font-black text-lg text-gray-500">#{r.rank}</td>
                  <td className={`px-4 py-2 font-medium ${r.bidderName === sectionB.companyName ? "text-blue-700 font-bold" : "text-gray-900"}`}>{r.bidderName}{r.bidderName === sectionB.companyName ? " ← This Bidder" : ""}</td>
                  <td className="px-4 py-2 font-mono font-bold text-gray-900">{r.totalScore.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Annexure A — Debrief Report */}
      <section className="mb-5 border border-gray-200 rounded-lg">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a]">Annexure A — Bidder Debrief Report (AI Generated)</h2>
        </div>
        <div className="p-4 space-y-4 text-xs">
          {/* Executive summary */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="font-bold text-blue-800 uppercase tracking-wide text-[10px] mb-1">Executive Summary</p>
            <p className="text-gray-700">
              <strong>{sectionB.companyName}</strong> submitted a bid of <strong>{fmtCurrency(sectionB.tenderAmountSubmitted, currency)}</strong> for{" "}
              <strong>{sectionA.tenderTitle}</strong>. The bidder achieved a technical score of <strong>{techPercent.toFixed(1)}%</strong> ({passedTechnical ? "passing" : "failing"} the {technicalThreshold}% threshold) and a financial score of <strong>{financial.financialScore.toFixed(2)}</strong>.
              The combined score of <strong>{finalScore.toFixed(2)}</strong> places this bidder at rank <strong>#{myRank?.rank ?? "N/A"}</strong>.
            </p>
          </div>

          {/* Detailed technical evaluation matrix */}
          <div>
            <h3 className="font-bold text-gray-700 uppercase tracking-wide text-[10px] mb-2">Detailed Technical Evaluation Matrix</h3>
            <div className="space-y-3">
              {technicalCriteria.map((c, i) => (
                <div key={i} className="border border-gray-200 rounded p-3">
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-gray-800">{c.criteria}</span>
                    <span className={`font-mono font-bold ${c.marksAwarded < c.maximumMarks * 0.7 ? "text-red-600" : "text-emerald-700"}`}>
                      {c.marksAwarded}/{c.maximumMarks}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{c.justification}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          {strengths.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-700 uppercase tracking-wide text-[10px] mb-2">Strengths Identified</h3>
              <ul className="space-y-1">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Compliance Assessment */}
          <div>
            <h3 className="font-bold text-gray-700 uppercase tracking-wide text-[10px] mb-2">AI Compliance Assessment</h3>
            <div className="overflow-x-auto border border-gray-200 rounded">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-600">Compliance Area</th>
                    <th className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {aiComplianceItems.map((item, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 text-gray-800">{item.complianceArea}</td>
                      <td className={`px-3 py-2 font-medium ${item.compliant ? "text-emerald-700" : "text-red-600"}`}>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Overall outcome */}
          <div className={`border rounded p-3 ${myRank?.rank === 1 ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"}`}>
            <p className="font-bold text-gray-800 uppercase tracking-wide text-[10px] mb-1">Overall Evaluation Outcome — AI Recommendation</p>
            <p className="text-gray-700">
              Based on the comprehensive evaluation conducted by the AI Evaluation Engine, {sectionB.companyName} has been assessed
              as {myRank?.rank === 1 ? "the Best Evaluated Responsive Bidder and is recommended for award of this tender" : `Rank #${myRank?.rank ?? "N/A"} in the final evaluation ranking`}.
              The recommendation is based on the bidder's {passedTechnical ? "successful technical compliance" : "technical shortfall"} and
              competitive financial offer, evaluated against all other responsive bidders.
            </p>
          </div>
        </div>
      </section>

      {/* Committee signatures */}
      <section className="mb-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#1a6b3a] border-b border-[#1a6b3a] pb-1 mb-3">Evaluation Committee Signatures</h2>
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

      {/* Adjudication / Appeal — conditional */}
      {adjudicationRequired && (
        <section className="mb-5 border border-orange-200 rounded p-4 bg-orange-50">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="w-full">
              <h3 className="text-xs font-bold uppercase tracking-wide text-orange-700 mb-3">If and only if these were involved:</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="border border-orange-200 rounded p-3 bg-white">
                  <p className="font-semibold text-gray-400 uppercase tracking-wide text-[10px] mb-2">Adjudicated By</p>
                  <div className="border border-gray-200 rounded p-2 mb-2">
                    <p className="text-[10px] text-gray-400 mb-0.5">Name / Position</p>
                    <div className="border-b border-dashed border-gray-300 pb-3" />
                  </div>
                  <div className="border border-gray-200 rounded p-2">
                    <p className="text-[10px] text-gray-400 mb-0.5">Signature / Date</p>
                    <div className="border-b border-dashed border-gray-300 pb-3" />
                  </div>
                </div>
                <div className="border border-orange-200 rounded p-3 bg-white">
                  <p className="font-semibold text-gray-400 uppercase tracking-wide text-[10px] mb-2">Appeals Ruling By</p>
                  <div className="border border-gray-200 rounded p-2 mb-2">
                    <p className="text-[10px] text-gray-400 mb-0.5">Name / Position</p>
                    <div className="border-b border-dashed border-gray-300 pb-3" />
                  </div>
                  <div className="border border-gray-200 rounded p-2">
                    <p className="text-[10px] text-gray-400 mb-0.5">Signature / Date (Final — Binding)</p>
                    <div className="border-b border-dashed border-gray-300 pb-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <p className="text-[10px] text-gray-400 text-center mt-4">
        End of Report · {sectionA.tenderNumber} · {sectionB.companyName} · {sectionA.evaluationDate}
      </p>
    </ProcurementDocumentTemplate>
  );
}
