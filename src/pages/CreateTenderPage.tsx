/**
 * CreateTenderPage — wraps BudgetModuleTabs for tender creation workflow
 * Route: /tenders/module/:moduleType/create
 * Shows multi-step tender creation form with AI assistant sidebar
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { AiAgentChatPanel } from "@/components/ui/AiAgentChatPanel";
import { ApprovalSignatureBlock } from "@/components/ui/ApprovalSignatureBlock";
import { WorkflowActionBar } from "@/components/ui/WorkflowActionBar";
import { DocumentViewerPanel } from "@/components/ui/DocumentViewerPanel";
import { ProcurementCategoryCodesPicker } from "@/components/ProcurementCategoryCodesPicker";
import { ArrowLeft, PlusCircle, CheckCircle2, ChevronLeft, ChevronRight, FileText } from "lucide-react";

const CREATION_STEPS = [
  "Ratio & Method",
  "Tender Details",
  "Scope & Specs",
  "Compliance",
  "Evaluation Design",
  "Committee",
  "Review & Submit",
];

export default function CreateTenderPage() {
  const { moduleType = "tenders" } = useParams<{ moduleType: string }>();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showAI, setShowAI] = useState(true);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [showDocViewer, setShowDocViewer] = useState(false);

  const NOTIFICATION_DOC = {
    id: "notif-letter",
    name: "Notification Letter (External)",
    type: "letter" as const,
    content: `
      <div style="font-family:Georgia,serif;padding:2rem;max-width:680px;margin:0 auto">
        <div style="text-align:center;margin-bottom:1.5rem">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#334155">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</div>
          <div style="font-size:18px;font-weight:900;text-transform:uppercase;margin-top:0.5rem">NOTIFICATION LETTER — EXTERNAL</div>
          <div style="font-size:11px;color:#64748b;margin-top:0.25rem">Ref: ZW-PRA-2026-DRAFT · Ministry: — · FY2025/26</div>
        </div>
        <div style="border-top:2px solid #0f172a;margin-bottom:1.5rem;padding-top:1.5rem">
          <p style="font-size:13px;line-height:1.8;color:#334155">
            This is to notify all interested parties that the Government of the Republic of Zimbabwe, through the [Ministry / Entity], invites suitably qualified entities to submit bids for the above-referenced tender.
          </p>
          <p style="font-size:13px;line-height:1.8;color:#334155;margin-top:1rem">
            Tender documents are available on the ZEPS portal at <strong>zeps.gov.zw</strong>. Submissions must be received no later than the closing date and time specified herein.
          </p>
        </div>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:1rem;margin-bottom:1.5rem">
          <table style="width:100%;font-size:12px;border-collapse:collapse">
            <tr><td style="padding:6px 0;color:#64748b;font-weight:600">Budget Code:</td><td style="padding:6px 0">—</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;font-weight:600">Project:</td><td style="padding:6px 0">—</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;font-weight:600">Financial Year:</td><td style="padding:6px 0">FY2025/26</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;font-weight:600">Location:</td><td style="padding:6px 0">—</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;font-weight:600">Closing Date:</td><td style="padding:6px 0">—</td></tr>
          </table>
        </div>
        <div style="margin-top:2rem;font-size:12px;color:#64748b">
          <p>Yours faithfully,</p>
          <div style="margin-top:2rem;border-bottom:1px solid #cbd5e1;width:200px"></div>
          <p style="margin-top:0.5rem"><strong>Head of Department</strong><br/>[Name / Position]<br/>[Ministry / Entity]</p>
        </div>
      </div>
    `,
  };

  const label = moduleType.charAt(0).toUpperCase() + moduleType.slice(1);

  return (
    <AppShell>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#0F172A] text-white px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#475569] flex items-center justify-center">
              <PlusCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Government of the Republic of Zimbabwe · {label}
              </div>
              <div className="text-sm font-black text-white">Create {label}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowAI(v => !v)}
              className="text-xs text-white/60 hover:text-white border border-white/20 rounded-lg px-3 py-1.5">
              {showAI ? "Hide AI" : "Show AI"}
            </button>
            <button onClick={() => navigate(`/tenders/module/${moduleType}`)}
              className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white border border-white/20 rounded-lg px-3 py-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center gap-1 overflow-x-auto">
            {CREATION_STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setStep(i)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    i < step  ? "bg-emerald-600 text-white" :
                    i === step ? "bg-[#0f172a] text-white" :
                    "border border-gray-300 text-gray-500 bg-white"
                  }`}>
                  {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{i + 1}</span>}
                  {s}
                </button>
                {i < CREATION_STEPS.length - 1 && <div className="h-px w-3 bg-gray-200 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto p-6 flex gap-5">
          {/* Main form */}
          <div className="flex-1 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">
                Step {step + 1} of {CREATION_STEPS.length}
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">{CREATION_STEPS[step]}</h2>
              {/* Step 0 — Ratio & Method */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900">
                    <strong>PPOPA 2018 — EVALUATION RATIO SETUP:</strong> Set the Technical vs Financial ratio first. 70/30 split is standard for most PPOPA tenders above USD 5M. Set passmark ≥ 70%.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Evaluation Method", placeholder: "e.g. QCBS — Quality and Cost Based Selection" },
                      { label: "Scoring Scale",     placeholder: "e.g. 100-point scale" },
                      { label: "Technical Weight (%)", placeholder: "e.g. 70" },
                      { label: "Financial Weight (%) — AUTO", placeholder: "Auto-calculated" },
                      { label: "Pass Mark (%)", placeholder: "e.g. 70" },
                      { label: "Procurement Method", placeholder: "e.g. Open Competitive Bidding" },
                    ].map(f => (
                      <div key={f.label} className="border border-gray-200 rounded-lg p-3">
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">{f.label}</label>
                        <input placeholder={f.placeholder} className="w-full text-sm text-gray-800 outline-none bg-transparent" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 1 — Tender Details */}
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Tender Title", "Reference Number", "Ministry / Entity",
                    "Department / Unit", "Category (Supplies/Works/Services)",
                    "Estimated Value (USD)", "Financial Year", "Procurement Plan Ref",
                    "Tender Type", "Closing Date & Time",
                  ].map(f => (
                    <div key={f} className="border border-gray-200 rounded-lg p-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">{f}</label>
                      <input className="w-full text-sm text-gray-800 outline-none bg-transparent" />
                    </div>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
                    <strong>Vendor Invitation:</strong> Select the procurement category codes. Only vendors registered under these codes will be invited to bid.
                  </div>
                  <ProcurementCategoryCodesPicker selectedCodes={selectedCodes} onSelectionChange={setSelectedCodes} />
                </div>
              )}

              {/* Step 3 — Compliance */}
              {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "PPDPA Compliance Reference",      placeholder: "e.g. PPDPA Section 32" },
                    { label: "Approval Authority",              placeholder: "e.g. Accounting Officer" },
                    { label: "Procurement Plan Reference",      placeholder: "e.g. PP-2026-MOF-041" },
                    { label: "Budget Code",                     placeholder: "e.g. BC-2026-0418" },
                    { label: "Compliance Certificate Status",   placeholder: "Auto-generated on HOD approval" },
                    { label: "Legal Review Status",             placeholder: "e.g. Pending / Approved" },
                    { label: "Environmental Impact Assessment", placeholder: "e.g. N/A / Required" },
                    { label: "Gender / SME Preference",        placeholder: "e.g. 30% women-owned" },
                  ].map(f => (
                    <div key={f.label} className="border border-gray-200 rounded-lg p-3">
                      <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">{f.label}</label>
                      <input placeholder={f.placeholder} className="w-full text-sm text-gray-800 outline-none bg-transparent" />
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4 — Evaluation Design */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900">
                    Define evaluation criteria. Sub-criteria must sum to 100% within their parent. Technical criteria are evaluated before financial.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Technical Criteria 1",     placeholder: "e.g. Relevant Experience" },
                      { label: "Technical Weight 1 (%)",   placeholder: "e.g. 25" },
                      { label: "Technical Criteria 2",     placeholder: "e.g. Key Personnel" },
                      { label: "Technical Weight 2 (%)",   placeholder: "e.g. 20" },
                      { label: "Technical Criteria 3",     placeholder: "e.g. Methodology" },
                      { label: "Technical Weight 3 (%)",   placeholder: "e.g. 25" },
                      { label: "Financial Criteria",       placeholder: "e.g. Price / Cost" },
                      { label: "Financial Weight (%)",     placeholder: "e.g. 30 (auto from Ratio step)" },
                      { label: "Minimum Technical Score",  placeholder: "e.g. 70 points to qualify" },
                      { label: "Evaluation Committee Size",placeholder: "e.g. 5 members" },
                    ].map(f => (
                      <div key={f.label} className="border border-gray-200 rounded-lg p-3">
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">{f.label}</label>
                        <input placeholder={f.placeholder} className="w-full text-sm text-gray-800 outline-none bg-transparent" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5 — Committee */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
                    Evaluation committee members must be registered in the system and declare no conflict of interest before participating.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      "Chairperson Name", "Chairperson Designation",
                      "Member 1 — Name", "Member 1 — Designation",
                      "Member 2 — Name", "Member 2 — Designation",
                      "Member 3 — Name", "Member 3 — Designation",
                      "Secretary Name", "Secretary Designation",
                    ].map(f => (
                      <div key={f} className="border border-gray-200 rounded-lg p-3">
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">{f}</label>
                        <input className="w-full text-sm text-gray-800 outline-none bg-transparent" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6 — Review & Submit — Section 5.3 */}
              {step === 6 && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900">
                    All required sections completed. Review below and submit for HOD authorisation.
                  </div>

                  {/* Summary fields */}
                  <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">TENDER SUMMARY</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: "TENDER TITLE",                val: "—" },
                      { label: "REFERENCE NUMBER",            val: "ZW-PRA-2026-DRAFT" },
                      { label: "MINISTRY / ENTITY",           val: "—" },
                      { label: "CATEGORY",                    val: "—" },
                      { label: "ESTIMATED VALUE",             val: "—" },
                      { label: "CLOSING DATE",                val: "—" },
                      { label: "PROCUREMENT METHOD",          val: "—" },
                      { label: "TECHNICAL / FINANCIAL SPLIT", val: "70 / 30" },
                      { label: "EVALUATION COMMITTEE",        val: "5 members assigned" },
                      { label: "BUDGET CODE",                 val: "—" },
                      { label: "COMPLIANCE CERT STATUS",      val: "Auto-generated on HOD approval" },
                      { label: "PLAN STATUS",                 val: "DRAFT" },
                    ].map(f => (
                      <div key={f.label} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{f.label}</div>
                        <div className="text-sm text-gray-700 mt-0.5">{f.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* HOD fields — Section 5.3 */}
                  <div className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 pt-2">HEAD OF DEPARTMENT</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label: "HOD NAME",             placeholder: "e.g. Dr. T. Moyo" },
                      { label: "HOD TITLE",            placeholder: "e.g. Permanent Secretary" },
                      { label: "SUBMISSION DATE",      placeholder: "DD / MM / YYYY" },
                      { label: "ADDITIONAL REMARKS",   placeholder: "Any notes for the reviewer…" },
                    ].map(f => (
                      <div key={f.label} className="border border-gray-200 rounded-lg p-3 bg-white">
                        <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">{f.label}</label>
                        <input placeholder={f.placeholder} className="w-full text-sm text-gray-800 outline-none bg-transparent" />
                      </div>
                    ))}
                  </div>

                  {/* AI Budget Validation */}
                  <div className="border border-amber-200 rounded-lg p-3 bg-amber-50 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-800">AI Budget Validation Status:</span>
                      <span className="text-xs text-amber-700 ml-1">Pending — AI will validate on submission</span>
                    </div>
                  </div>

                  {/* Declaration */}
                  <label className="flex items-start gap-3 cursor-pointer bg-white border border-gray-200 rounded-lg p-4">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-xs text-gray-700">
                      I, the undersigned, confirm that the information provided in this tender preparation form is accurate, complete and complies with the Public Procurement and Disposal of Public Assets Act (PPDPA 2018) and all applicable regulations. I declare no conflict of interest.
                    </span>
                  </label>

                  <ApprovalSignatureBlock
                    createdBy={{ name: "Current User", date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() }}
                    showComments={true}
                  />
                </div>
              )}

              {/* Nav */}
              <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                {step < CREATION_STEPS.length - 1
                  ? <button onClick={() => setStep(s => s + 1)}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0F172A] text-white text-sm font-semibold">
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  : <button className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold">
                      <CheckCircle2 className="h-4 w-4" /> Submit for Approval
                    </button>
                }
              </div>
            </div>

            <WorkflowActionBar
              visibleButtons={step === 6 ? ["back","saveDraft","return","approve","authorize","adjudicate","submit"] : ["back","saveDraft","approve","authorize"]}
              onBack={() => step > 0 ? setStep(s => s - 1) : navigate(`/tenders/module/${moduleType}`)}
            />
          </div>

          {/* Review step: Document Viewer for Notification Letter */}
          {step === 6 && (
            <div className="w-96 shrink-0">
              <button onClick={() => setShowDocViewer(v => !v)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 mb-2 w-full justify-center">
                <FileText className="h-3.5 w-3.5" />
                {showDocViewer ? "Hide" : "Show"} Notification Letter
              </button>
              {showDocViewer && (
                <DocumentViewerPanel
                  documents={[NOTIFICATION_DOC]}
                  defaultVisible={true}
                  className="rounded-xl border border-gray-200 min-h-[400px]"
                />
              )}
            </div>
          )}

          {/* AI sidebar */}
          {showAI && step !== 6 && (
            <div className="w-80 shrink-0">
              <AiAgentChatPanel
                agentName="AI Assistant"
                agentRole="Procurement Guidance"
                context="tender creation"
                suggestedPrompts={["70/30 ratio guidance","Passmark requirements","Category codes help","PPOPA compliance check"]}
                color="blue"
                defaultVisible={true}
              />
            </div>
          )}
          {showAI && step === 6 && (
            <div className="w-80 shrink-0">
              <AiAgentChatPanel
                agentName="AI Budget Validator"
                agentRole="Validation & Compliance"
                context="tender review and submission"
                suggestedPrompts={["Validate budget code","Check compliance","Generate compliance cert","Run final audit"]}
                color="emerald"
                defaultVisible={true}
              />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
