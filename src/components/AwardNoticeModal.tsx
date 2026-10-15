/**
 * AwardNoticeModal — shown when a tender is awarded to a company.
 * Displays congratulation message + list of legal documents to submit.
 * Also triggers senior notification and AI report to CPO.
 */
import { useState } from "react";
import { X, CheckCircle2, FileText, Download, Send, Sparkles, Trophy, AlertCircle } from "lucide-react";
import { saveAwardNotice, pushSeniorAlert, saveAIReport } from "@/lib/local-store";
import type { AwardNotice } from "@/lib/local-store";

const LEGAL_DOCUMENTS = [
  { id: "d1", name: "Letter of Award (LOA)",                    desc: "Official letter confirming contract award",                required: true  },
  { id: "d2", name: "Draft Contract Agreement",                 desc: "Full contract document for review and signature",          required: true  },
  { id: "d3", name: "Performance Bond (10%)",                   desc: "Bank guarantee equal to 10% of contract value",            required: true  },
  { id: "d4", name: "Insurance Certificate",                    desc: "Public liability and contractor all-risk insurance",       required: true  },
  { id: "d5", name: "Tax Clearance Certificate",                desc: "Valid ZIMRA tax clearance — must be current",              required: true  },
  { id: "d6", name: "Updated Company Registration",             desc: "ZIMRA & IPEC certificates if renewed after submission",    required: false },
  { id: "d7", name: "Key Personnel CVs & Mobilisation Plan",    desc: "Final team structure and start-date confirmation",         required: false },
  { id: "d8", name: "Subcontractor Agreements (if any)",        desc: "Details of any approved subcontracting arrangements",      required: false },
];

type Props = {
  tender: { id: string; title: string; value: string; entity: string };
  vendor: string;
  awardedBy: string;
  onClose: () => void;
};

export default function AwardNoticeModal({ tender, vendor, awardedBy, onClose }: Props) {
  const [step, setStep] = useState<"congrats" | "documents" | "sent">("congrats");
  const [vendorEmail, setVendorEmail] = useState("");
  const [checkedDocs, setCheckedDocs] = useState<string[]>(LEGAL_DOCUMENTS.filter(d => d.required).map(d => d.id));
  const [sending, setSending] = useState(false);

  const toggleDoc = (id: string) => {
    setCheckedDocs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      const selectedDocs = LEGAL_DOCUMENTS.filter(d => checkedDocs.includes(d.id)).map(d => d.name);

      // Save award notice
      saveAwardNotice({
        tenderId: tender.id,
        tenderTitle: tender.title,
        vendorName: vendor,
        vendorEmail: vendorEmail || `procurement@${vendor.toLowerCase().replace(/\s+/g, "")}.co.zw`,
        awardedBy,
        awardDate: new Date().toISOString().split("T")[0],
        contractValue: tender.value,
        documents: selectedDocs,
        status: "sent",
      });

      // Senior notification to CPO/Minister
      pushSeniorAlert(
        `Contract awarded: "${tender.title}" → ${vendor} (${tender.value}) by ${awardedBy}. ${selectedDocs.length} legal documents requested.`,
        "success",
        { from: awardedBy, fromRole: "Adjudication Officer", category: "award", ref: tender.id }
      );

      // AI report
      saveAIReport({
        officer: awardedBy,
        role: "Adjudication Officer",
        date: new Date().toISOString().split("T")[0],
        summary: `Award issued for ${tender.title} to ${vendor}. All legal document requests sent.`,
        actions: [
          { time: new Date().toLocaleTimeString(), action: "Award Letter Issued", ref: tender.id, outcome: `${vendor} selected` },
          { time: new Date().toLocaleTimeString(), action: "Legal Documents Requested", ref: tender.id, outcome: `${selectedDocs.length} documents` },
          { time: new Date().toLocaleTimeString(), action: "Vendor Notified", ref: tender.id, outcome: vendorEmail || "Email sent" },
        ],
        sentToCPO: true,
      });

      setSending(false);
      setStep("sent");
    }, 1200);
  };

  return (
    <div className="bg-white border border-black/10 mb-6">

      {/* ── Step 1: Congratulation ── */}
      {step === "congrats" && (
        <>
          <div className="bg-[#0f172a] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-[#0F172A] grid place-items-center flex-shrink-0">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-base font-bold uppercase tracking-wide">Tender Award — Congratulation Notice</div>
                <div className="text-xs text-white/50 mt-0.5">{tender.id}</div>
              </div>
            </div>
            <button onClick={onClose} className="h-8 w-8 grid place-items-center hover:bg-white/10 transition-colors">
              <X className="h-4 w-4 text-white/70" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-5">
            {/* Congrats banner */}
            <div className="bg-[#0F172A] p-5 text-white">
              <div className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-300">🎉 Congratulations</div>
              <div className="text-xl font-bold leading-snug mb-1">{vendor}</div>
              <div className="text-sm text-slate-200">has been selected as the successful bidder for:</div>
              <div className="text-base font-semibold mt-2">{tender.title}</div>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="text-xs bg-white/20 px-2 py-0.5">{tender.value}</span>
                <span className="text-xs bg-white/20 px-2 py-0.5">{tender.entity}</span>
                <span className="text-xs bg-white/20 px-2 py-0.5">{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {/* Section header */}
            <div className="bg-[#0f172a] text-white px-4 py-2 flex items-center gap-2">
              <span className="text-[10px] font-black opacity-50">1.1</span>
              <span className="text-xs font-bold uppercase tracking-wider">Congratulation Message Preview</span>
            </div>
            <div className="border border-black/10 bg-[#EAF1F8] px-5 py-4">
              <div className="text-xs text-black/70 leading-relaxed space-y-2">
                <p>Dear <strong>{vendor}</strong>,</p>
                <p>We are pleased to inform you that following a rigorous and transparent evaluation process, your company has been selected as the successful bidder for the above-referenced tender.</p>
                <p>Your bid demonstrated the strongest technical and financial proposal among all responsive submissions. The AI-assisted evaluation confirmed your compliance with all mandatory requirements.</p>
                <p>Please find attached the <strong>Letter of Award</strong> and a list of required legal documents to be submitted within <strong>14 working days</strong> to formalise the contract.</p>
                <p>Congratulations on this award. We look forward to a successful working partnership.</p>
                <p className="text-black/50">— {awardedBy}, Adjudication Officer · {tender.entity}</p>
              </div>
            </div>

            {/* Vendor email */}
            <div>
              <label className="block text-[10px] font-bold text-black/50 uppercase tracking-wider mb-1">Vendor Contact Email</label>
              <input value={vendorEmail} onChange={e => setVendorEmail(e.target.value)}
                placeholder={`procurement@${vendor.toLowerCase().replace(/\s+/g, "").slice(0,10)}.co.zw`}
                className="w-full h-10 px-3 border border-black/15 bg-[#EAF1F8] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/50" />
            </div>

            {/* AI note */}
            <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 px-4 py-3">
              <Sparkles className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#0F172A]">
                <strong>AI will automatically:</strong> Notify the CPO and Minister with a senior alert, generate an AI activity report for today, and log this award in the national procurement audit trail.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-6 py-4 border-t-2 border-black/10 bg-[#EAF1F8]">
            <button onClick={() => setStep("documents")}
              className="h-11 px-8 bg-[#0f172a] text-white text-sm font-bold hover:bg-[#1e293b] transition-colors flex items-center gap-2 uppercase tracking-wide">
              <FileText className="h-4 w-4" /> Continue — Request Documents →
            </button>
            <button onClick={onClose}
              className="h-11 px-6 border border-black/20 text-sm font-bold text-black/50 hover:bg-white transition-colors uppercase tracking-wide">
              Cancel
            </button>
          </div>
        </>
      )}

      {/* ── Step 2: Legal Documents ── */}
      {step === "documents" && (
        <>
          <div className="bg-[#0f172a] text-white px-6 py-4 flex items-center justify-between">
            <div>
              <div className="text-base font-bold uppercase tracking-wide">Required Legal Documents</div>
              <div className="text-xs text-white/50 mt-0.5">Select which documents to request from {vendor}</div>
            </div>
            <button onClick={onClose} className="h-8 w-8 grid place-items-center hover:bg-white/10 transition-colors">
              <X className="h-4 w-4 text-white/70" />
            </button>
          </div>

          <div className="px-6 py-6 space-y-2">
            <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-slate-50 border border-slate-200">
              <AlertCircle className="h-4 w-4 text-[#0F172A] flex-shrink-0" />
              <span className="text-xs text-[#0F172A]">All required documents must be submitted within <strong>14 working days</strong> of this notice. Failure to submit may result in forfeiture of the award.</span>
            </div>

            {LEGAL_DOCUMENTS.map(doc => (
              <label key={doc.id} className={`flex items-start gap-3 px-4 py-3 border cursor-pointer transition-all ${checkedDocs.includes(doc.id) ? "border-[#0f172a] bg-[#EAF1F8]" : "border-black/10 bg-white hover:border-black/30 hover:bg-[#EAF1F8]/50"}`}>
                <input type="checkbox" checked={checkedDocs.includes(doc.id)} onChange={() => toggleDoc(doc.id)}
                  className="mt-0.5 h-4 w-4 accent-black flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-black">{doc.name}</span>
                    {doc.required && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 font-bold uppercase tracking-wide">Required</span>}
                  </div>
                  <div className="text-xs text-black/40 mt-0.5">{doc.desc}</div>
                </div>
                <FileText className={`h-4 w-4 flex-shrink-0 mt-0.5 ${checkedDocs.includes(doc.id) ? "text-[#0f172a]" : "text-black/20"}`} />
              </label>
            ))}
          </div>

          <div className="flex items-center gap-3 px-6 py-4 border-t-2 border-black/10 bg-[#EAF1F8]">
            <button onClick={handleSend} disabled={sending || checkedDocs.length === 0}
              className="h-11 px-8 bg-[#0F172A] text-white text-sm font-bold hover:bg-[#0F172A] disabled:opacity-50 transition-colors flex items-center gap-2 uppercase tracking-wide">
              {sending ? (
                <><span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Sending…</>
              ) : (
                <><Send className="h-4 w-4" /> Send Award Notice + {checkedDocs.length} Documents</>
              )}
            </button>
            <button onClick={() => setStep("congrats")}
              className="h-11 px-6 border border-black/20 text-sm font-bold text-black/50 hover:bg-white transition-colors uppercase tracking-wide">
              ← Back
            </button>
          </div>
        </>
      )}

      {/* ── Step 3: Sent confirmation ── */}
      {step === "sent" && (
        <div className="px-6 py-10 text-center">
          <div className="h-16 w-16 bg-slate-100 grid place-items-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-[#0F172A]" />
          </div>
          <div className="text-xl font-bold text-black mb-2 uppercase tracking-wide">Award Notice Sent!</div>
          <div className="text-sm text-black/50 mb-5">Congratulation message and document request sent to <strong>{vendor}</strong>.</div>

          <div className="border border-black/10 bg-[#EAF1F8] px-5 py-4 text-left space-y-2 mb-5 max-w-sm mx-auto">
            {[
              "Award notice emailed to vendor",
              `${checkedDocs.length} legal documents requested (14-day deadline)`,
              "Senior alert sent to CPO & Minister",
              "AI daily report submitted to CPO",
              "Audit log entry created",
              "14-day standstill period started",
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <button onClick={onClose}
            className="h-11 px-10 bg-[#0f172a] text-white text-sm font-bold hover:bg-[#1e293b] transition-colors uppercase tracking-wide">
            Done
          </button>
        </div>
      )}
    </div>
  );
}
