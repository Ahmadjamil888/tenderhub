/**
 * StageFormWorkbench — Reusable multi-step form shell
 * Used by ALL procurement stage workbenches (Stage 1–5 sub-stages).
 *
 * Features per spec:
 *  - Horizontal scrollable stepper (Back / Next)
 *  - 2-column field grid per step
 *  - Right-side document preview panel (Notification Letter, Auth Letter,
 *    Compliance Certificate, Schedule List, Minutes & Resolution)
 *  - Workflow footer: Return | Approve | Authorize | Adjudicate
 *  - AI control banner per stage
 *  - QR code placeholder, reference number, file number, tender number,
 *    ministry, budget code, financial year, project, location on every doc
 */
import { useState, useRef } from "react";
import {
  ChevronLeft, ChevronRight, CheckCircle2, FileText, Shield,
  Sparkles, Save, Send, RefreshCcw, Printer, Download, Eye,
  AlertTriangle, Clock, User, Building2, MapPin, Calendar,
  DollarSign, Hash, QrCode, Lock, ChevronDown,
} from "lucide-react";
import TenderGovernancePanel from "@/components/TenderGovernancePanel";

// ─── Types ────────────────────────────────────────────────────────────────────
export type FieldType =
  | "text" | "textarea" | "select" | "date" | "number"
  | "currency" | "email" | "readonly" | "radio" | "checkbox";

export type FormField = {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  hint?: string;
  fullWidth?: boolean;
};

export type FormStep = {
  id: string;
  title: string;
  fields: FormField[];
};

export type StageConfig = {
  stageNumber: number;
  stageName: string;       // e.g. "Stage 1 — Procurement Planning"
  subStageName: string;    // e.g. "Strategic Procurement Planning"
  majorActivity: string;
  aiControl: string;
  requiredAuthorization: string;
  steps: FormStep[];
  documents?: string[];    // Generated document types for this sub-stage
};

// ─── Approval colours ────────────────────────────────────────────────────────
const ACTION_STYLES: Record<string, string> = {
  return:      "bg-slate-100 text-[#0F172A] hover:bg-slate-200 border border-slate-200",
  approve:     "bg-[#0F172A] text-white hover:bg-[#0F172A]",
  authorize:   "bg-[#0F172A] text-white hover:bg-[#0F172A]",
  adjudicate:  "bg-[#0f172a] text-white hover:bg-black/80",
};

// ─── Document Reference Header (shown on every generated doc) ─────────────────
function DocRefHeader({
  docType, refNum, ministry, tenderId, budgetCode, financialYear, project, location,
}: {
  docType: string; refNum: string; ministry: string; tenderId: string;
  budgetCode: string; financialYear: string; project: string; location: string;
}) {
  return (
    <div className="border-b border-black/10 pb-4 mb-4">
      {/* Coat of arms placeholder */}
      <div className="flex flex-col items-center mb-3">
        <div className="h-12 w-12 rounded-full bg-[#0f172a] flex items-center justify-center mb-1">
          <Shield className="h-6 w-6 text-slate-500" />
        </div>
        <div className="text-[9px] font-black text-black/50 uppercase tracking-widest text-center">
          GOVERNMENT OF ZIMBABWE
        </div>
        <div className="text-[8px] text-black/35 text-center">Zimbabwe Electronic Procurement System — ZEPS</div>
      </div>
      {/* Document type title */}
      <div className="text-center mb-3">
        <div className="text-sm font-black text-[#0f172a] uppercase tracking-wide">{docType}</div>
        <div className="text-[10px] text-black/50 mt-0.5">{ministry}</div>
      </div>
      {/* Reference metadata grid */}
      <div className="grid grid-cols-2 gap-1 text-[9px] border border-black/10 p-2 bg-[#f8fafc]">
        {[
          { label:"Reference No.", value:refNum },
          { label:"Tender/Project No.", value:tenderId },
          { label:"Ministry", value:ministry },
          { label:"Budget Code", value:budgetCode },
          { label:"Financial Year", value:financialYear },
          { label:"Project", value:project },
          { label:"Location", value:location },
          { label:"Date", value:new Date().toLocaleDateString("en-GB") },
        ].map(r => (
          <div key={r.label} className="flex items-start gap-1">
            <span className="text-black/40 font-semibold shrink-0">{r.label}:</span>
            <span className="text-black/70 font-medium">{r.value}</span>
          </div>
        ))}
      </div>
      {/* QR placeholder */}
      <div className="flex justify-end mt-2">
        <div className="h-12 w-12 border-2 border-black/20 flex items-center justify-center">
          <QrCode className="h-8 w-8 text-black/25" />
        </div>
      </div>
    </div>
  );
}

// ─── Document Viewer Panel ────────────────────────────────────────────────────
function DocumentViewer({
  docType, formData, ministry, config,
}: {
  docType: string; formData: Record<string,string>;
  ministry: string; config: StageConfig;
}) {
  const refNum = `ZW-${config.stageNumber.toString().padStart(2,"0")}-${Date.now().toString().slice(-6)}`;
  const tenderId = formData["tender_number"] || formData["project_reference"] || "ZW-PRA-2026-TBD";
  const budgetCode = formData["budget_code"] || "MOF/BUD/2026/001";
  const financialYear = formData["financial_year"] || "FY 2026/27";
  const project = formData["project_name"] || formData["project_title"] || config.subStageName;
  const location = formData["location"] || formData["delivery_location"] || "Harare, Zimbabwe";

  const isLetter = docType.toLowerCase().includes("letter");
  const isCertificate = docType.toLowerCase().includes("certificate");
  const isMinutes = docType.toLowerCase().includes("minutes");
  const isSchedule = docType.toLowerCase().includes("schedule");

  return (
    <div className="bg-white border border-black/10 rounded text-xs h-full overflow-y-auto">
      <div className="sticky top-0 bg-[#0f172a] text-white px-3 py-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[10px] font-semibold">{docType}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="h-6 px-2 bg-white/10 hover:bg-white/20 text-[9px] flex items-center gap-1 rounded transition-colors">
            <Download className="h-3 w-3" /> PDF
          </button>
          <button className="h-6 px-2 bg-white/10 hover:bg-white/20 text-[9px] flex items-center gap-1 rounded transition-colors">
            <Printer className="h-3 w-3" /> Print
          </button>
        </div>
      </div>
      <div className="p-4">
        <DocRefHeader
          docType={docType}
          refNum={refNum}
          ministry={ministry}
          tenderId={tenderId}
          budgetCode={budgetCode}
          financialYear={financialYear}
          project={project}
          location={location}
        />

        {/* Letter format */}
        {isLetter && (
          <div className="space-y-3 text-[10px] text-black/80 leading-relaxed">
            <div>
              <div className="font-bold">To:</div>
              <div>{formData["recipient_name"] || "[Recipient Name]"}</div>
              <div>{formData["recipient_organization"] || "[Organisation / Ministry]"}</div>
              <div>{formData["recipient_address"] || "[Address]"}</div>
            </div>
            <div className="text-right">
              <div>Date: {new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"long", year:"numeric" })}</div>
              <div>Ref: {refNum}</div>
            </div>
            <div className="font-bold underline text-center uppercase">
              {docType.toUpperCase()}
            </div>
            <p>
              Dear {formData["recipient_salutation"] || "Sir/Madam"},
            </p>
            <p>
              We refer to the above-mentioned procurement activity and wish to notify you of the current stage: <strong>{config.subStageName}</strong> under <strong>{config.stageName}</strong>.
            </p>
            <p>
              {formData["letter_body"] || `This letter serves to formally notify / authorise the activities as per the ${config.subStageName} stage requirements under the Zimbabwe Public Procurement and Disposal of Public Assets Act.`}
            </p>
            <p>
              The activity: <strong>{config.majorActivity}</strong> has been initiated and requires your attention/action as per the procurement schedule.
            </p>
            <p>Yours faithfully,</p>
            <div className="mt-6 border-t border-black/20 pt-3">
              <div>{formData["signatory_name"] || "_________________________"}</div>
              <div className="text-black/50">{formData["signatory_title"] || "[Name, Title, Department]"}</div>
              <div className="text-black/50">{ministry}</div>
            </div>
            <div className="mt-3 text-[8px] text-black/35 border-t border-black/10 pt-2">
              Page 1 of 1 · Printed: {new Date().toLocaleString("en-GB")} · Authorised by: {formData["authorised_by"] || "[Authorising Officer]"}
            </div>
          </div>
        )}

        {/* Certificate format */}
        {isCertificate && (
          <div className="space-y-3 text-[10px] text-black/80 leading-relaxed">
            <div className="text-center border-2 border-[#0f172a] p-4 mt-2">
              <div className="text-xs font-black uppercase tracking-wider text-[#0f172a] mb-1">COMPLIANCE CERTIFICATE</div>
              <div className="text-[9px] text-black/50 mb-3">{config.stageName} · {config.subStageName}</div>
              <div className="text-[10px]">
                This is to certify that all prescribed activities for the stage <strong>{config.subStageName}</strong>
                have been completed in accordance with the requirements of the Zimbabwe Public Procurement and Disposal
                of Public Assets Act (PPDPAA) and applicable regulations.
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-left">
                {[
                  { label:"Stage", value:config.stageName },
                  { label:"Sub-Stage", value:config.subStageName },
                  { label:"AI Control", value:config.aiControl },
                  { label:"Required Authorization", value:config.requiredAuthorization },
                  { label:"Certificate No.", value:refNum },
                  { label:"Issued Date", value:new Date().toLocaleDateString("en-GB") },
                ].map(r => (
                  <div key={r.label} className="border border-black/10 p-1.5">
                    <div className="text-[8px] text-black/40 uppercase font-semibold">{r.label}</div>
                    <div className="font-semibold text-black">{r.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#0F172A]" />
                <span className="font-black text-[#0F172A] text-sm">STAGE COMPLIANT</span>
              </div>
            </div>
            <div className="flex justify-between items-end mt-4 text-[9px] text-black/50">
              <div>
                <div>Certified by: {formData["certified_by"] || "[Certification Officer]"}</div>
                <div>Title: {formData["certifier_title"] || "[Title, Department]"}</div>
              </div>
              <div className="h-14 w-14 border border-black/20 flex items-center justify-center">
                <QrCode className="h-10 w-10 text-black/20" />
              </div>
            </div>
          </div>
        )}

        {/* Schedule / Minutes format */}
        {(isSchedule || isMinutes) && (
          <div className="space-y-3 text-[10px] text-black/80 leading-relaxed">
            <div className="font-black text-center uppercase text-xs text-[#0f172a]">
              {isSchedule ? "SCHEDULE OF ACTIVITIES" : "MINUTES & RESOLUTION"}
            </div>
            <div className="text-[9px] text-center text-black/45">
              {config.stageName} — {config.subStageName}
            </div>
            {isSchedule && (
              <table className="w-full text-[9px] border-collapse border border-black/20">
                <thead>
                  <tr className="bg-[#0f172a] text-white">
                    {["No.","Activity","Responsible","Target Date","Status"].map(h=>(
                      <th key={h} className="px-2 py-1.5 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { activity: config.majorActivity,           responsible: config.requiredAuthorization, target:"TBD", status:"In Progress" },
                    { activity: "Document preparation",          responsible:"Procurement Officer",          target:"TBD", status:"Pending"     },
                    { activity: "AI control check: "+config.aiControl, responsible:"System / AI Engine",   target:"Auto", status:"Pending"    },
                    { activity: "Compliance certification",      responsible:"Compliance Officer",           target:"TBD", status:"Pending"     },
                    { activity: "Authorization — "+config.requiredAuthorization, responsible:config.requiredAuthorization, target:"TBD", status:"Pending" },
                  ].map((r,i) => (
                    <tr key={i} className="border-b border-black/10 hover:bg-[#f8fafc]">
                      <td className="px-2 py-1.5 font-mono text-black/40">{i+1}</td>
                      <td className="px-2 py-1.5">{r.activity}</td>
                      <td className="px-2 py-1.5 text-black/60">{r.responsible}</td>
                      <td className="px-2 py-1.5 text-black/60">{r.target}</td>
                      <td className="px-2 py-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${r.status==="In Progress"?"bg-slate-100 text-[#0F172A]":"bg-gray-100 text-gray-600"}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {isMinutes && (
              <div className="border border-black/10 p-3 space-y-2">
                <div><strong>Meeting:</strong> {config.subStageName} Review</div>
                <div><strong>Date:</strong> {new Date().toLocaleDateString("en-GB")}</div>
                <div><strong>Attendees:</strong> {config.requiredAuthorization}, Procurement Officer, Finance Representative</div>
                <div className="border-t border-black/10 pt-2 mt-2">
                  <div className="font-bold mb-1">RESOLUTION:</div>
                  <p>That the activities for {config.subStageName} have been reviewed and are hereby approved to proceed to the next stage, subject to the conditions noted.</p>
                </div>
                <div className="border-t border-black/10 pt-2 flex justify-between">
                  <div><div className="font-semibold">Chairperson:</div><div className="h-8 border-b border-black/30 w-32 mt-2" /></div>
                  <div><div className="font-semibold">Secretary:</div><div className="h-8 border-b border-black/30 w-32 mt-2" /></div>
                </div>
              </div>
            )}
            <div className="text-[8px] text-black/35 border-t border-black/10 pt-2">
              Page 1 of 1 · Printed: {new Date().toLocaleString("en-GB")} · Ref: {refNum}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI Control Banner ────────────────────────────────────────────────────────
function AIControlBanner({ aiControl, majorActivity, authorization }: {
  aiControl: string; majorActivity: string; authorization: string;
}) {
  return (
    <div className="bg-[#0F172A] text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
      <div className="h-8 w-8 rounded-lg bg-[#0F172A]/20 grid place-items-center flex-shrink-0">
        <Sparkles className="h-4 w-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">AI &amp; RISK CONTROL</div>
        <div className="text-xs font-semibold text-white">{aiControl}</div>
        <div className="text-[10px] text-white/50">Activity: {majorActivity}</div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-[9px] text-white/40 uppercase tracking-wider mb-0.5">Required Authorization</div>
        <div className="text-xs font-bold text-slate-400">{authorization}</div>
      </div>
    </div>
  );
}

// ─── Workflow Footer ──────────────────────────────────────────────────────────
function WorkflowFooter({
  onAction, onSave, saving,
}: {
  onAction: (action: string) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="flex-shrink-0 border-t border-black/10 bg-white px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="h-8 px-4 border border-black/20 text-xs font-semibold text-black/70 hover:bg-gray-50 rounded flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving…" : "Save Draft"}
        </button>
        <button className="h-8 px-3 border border-black/20 text-xs text-black/60 hover:bg-gray-50 rounded flex items-center gap-1.5 transition-colors">
          <RefreshCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {(["return","approve","authorize","adjudicate"] as const).map(action => (
          <button
            key={action}
            onClick={() => onAction(action)}
            className={`h-8 px-4 text-xs font-bold rounded capitalize flex items-center gap-1.5 transition-colors ${ACTION_STYLES[action]}`}
          >
            {action === "return"     && <ChevronLeft className="h-3.5 w-3.5" />}
            {action === "approve"    && <CheckCircle2 className="h-3.5 w-3.5" />}
            {action === "authorize"  && <Shield className="h-3.5 w-3.5" />}
            {action === "adjudicate" && <Lock className="h-3.5 w-3.5" />}
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBar({
  steps, currentStep, completedSteps, onGoTo,
}: {
  steps: FormStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onGoTo: (i: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) scrollRef.current.scrollLeft += dir === "left" ? -160 : 160;
  };
  return (
    <div className="flex-shrink-0 flex items-center gap-0 border-b border-black/10 bg-white">
      <button onClick={() => scroll("left")} className="h-10 w-8 flex items-center justify-center border-r border-black/8 hover:bg-gray-50 flex-shrink-0">
        <ChevronLeft className="h-4 w-4 text-black/40" />
      </button>
      <div ref={scrollRef} className="flex-1 flex items-center gap-0 overflow-x-auto scrollbar-none">
        {steps.map((step, i) => {
          const done    = completedSteps.has(i);
          const active  = currentStep === i;
          return (
            <button
              key={step.id}
              onClick={() => onGoTo(i)}
              className={`flex items-center gap-2 px-4 h-10 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex-shrink-0
                ${active  ? "border-[#0f172a] text-[#0f172a] bg-white"
                : done    ? "border-slate-200 text-[#0F172A] bg-slate-50/50"
                : "border-transparent text-black/40 hover:text-black hover:bg-gray-50"}`}
            >
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0
                ${active ? "bg-[#0f172a] text-white"
                : done   ? "bg-[#0F172A] text-white"
                : "bg-gray-200 text-gray-500"}`}>
                {done ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
              </div>
              {step.title}
            </button>
          );
        })}
      </div>
      <button onClick={() => scroll("right")} className="h-10 w-8 flex items-center justify-center border-l border-black/8 hover:bg-gray-50 flex-shrink-0">
        <ChevronRight className="h-4 w-4 text-black/40" />
      </button>
    </div>
  );
}

// ─── Field renderer ───────────────────────────────────────────────────────────
function FieldRenderer({
  field, value, onChange,
}: {
  field: FormField;
  value: string;
  onChange: (id: string, val: string) => void;
}) {
  const base = "w-full border border-gray-200 focus:border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-sm text-gray-800 bg-white px-3";

  return (
    <div className={`border border-gray-200 rounded p-3 bg-white ${field.fullWidth ? "col-span-2" : ""}`}>
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
        {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {field.type === "textarea" && (
        <textarea
          rows={3}
          placeholder={field.placeholder || "—"}
          value={value}
          onChange={e => onChange(field.id, e.target.value)}
          className={`${base} py-2 rounded resize-none`}
        />
      )}
      {field.type === "select" && (
        <select
          value={value}
          onChange={e => onChange(field.id, e.target.value)}
          className={`${base} h-9 rounded`}
        >
          <option value="">— Select —</option>
          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
      {field.type === "readonly" && (
        <div className="text-sm text-gray-800 min-h-[20px] py-1">{value || field.placeholder || "—"}</div>
      )}
      {field.type === "radio" && (
        <div className="flex items-center gap-4 pt-1">
          {field.options?.map(o => (
            <label key={o} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={o}
                checked={value === o}
                onChange={() => onChange(field.id, o)}
                className="accent-emerald-600"
              />
              <span className="font-semibold uppercase text-xs">{o}</span>
            </label>
          ))}
        </div>
      )}
      {field.type === "checkbox" && (
        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={value === "true"}
            onChange={e => onChange(field.id, e.target.checked ? "true" : "false")}
            className="accent-emerald-600 h-4 w-4"
          />
          <span className="text-sm text-gray-700">{field.placeholder || "Yes"}</span>
        </label>
      )}
      {["text","date","number","currency","email"].includes(field.type) && (
        <input
          type={field.type === "currency" || field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          placeholder={field.placeholder || "—"}
          value={value}
          onChange={e => onChange(field.id, e.target.value)}
          className={`${base} h-9 rounded`}
        />
      )}
      {field.hint && (
        <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
          <AlertTriangle className="h-2.5 w-2.5" />{field.hint}
        </div>
      )}
    </div>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────
export function StageFormWorkbench({
  config,
  ministry = "Ministry of Finance & Economic Development",
  onComplete,
}: {
  config: StageConfig;
  ministry?: string;
  onComplete?: (data: Record<string, string>) => void;
}) {
  const [currentStep, setCurrentStep]       = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [formData, setFormData]             = useState<Record<string, string>>({});
  const [activeDoc, setActiveDoc]           = useState(0);
  const [saving, setSaving]                 = useState(false);
  const [actionLog, setActionLog]           = useState<{ action: string; ts: string }[]>([]);
  const [showDocPanel, setShowDocPanel]     = useState(true);

  const DOCS = config.documents ?? [
    "Notification Letter (External)",
    "Authorization Letter (Internal)",
    "Compliance Certificate",
    "Schedule List",
    "Minutes & Resolution Letter",
  ];

  const step   = config.steps[currentStep];
  const isLast = currentStep === config.steps.length - 1;

  function handleChange(id: string, val: string) {
    setFormData(prev => ({ ...prev, [id]: val }));
  }

  function handleNext() {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (!isLast) setCurrentStep(s => s + 1);
    else onComplete?.(formData);
  }

  function handleBack() {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  }

  function handleAction(action: string) {
    setActionLog(prev => [{ action: action.toUpperCase(), ts: new Date().toLocaleTimeString("en-GB") }, ...prev]);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f4f7fb]">
      {/* Stage header */}
      <div className="flex-shrink-0 bg-white border-b border-black/8 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#0f172a] grid place-items-center flex-shrink-0">
            <span className="text-white text-xs font-black">{config.stageNumber}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-widest text-black/40">{config.stageName}</div>
            <div className="text-sm font-bold text-[#0f172a]">{config.subStageName}</div>
          </div>
          <button
            onClick={() => setShowDocPanel(v => !v)}
            className="h-7 px-3 border border-black/15 text-[10px] text-black/60 hover:bg-gray-50 rounded flex items-center gap-1.5 transition-colors"
          >
            <Eye className="h-3 w-3" />
            {showDocPanel ? "Hide Docs" : "Show Docs"}
          </button>
        </div>
      </div>

      {/* AI banner */}
      <AIControlBanner
        aiControl={config.aiControl}
        majorActivity={config.majorActivity}
        authorization={config.requiredAuthorization}
      />

      {/* Step bar */}
      <StepBar
        steps={config.steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
        onGoTo={setCurrentStep}
      />

      {/* Main body — form + doc preview side by side */}
      <div className="flex-1 flex overflow-hidden gap-0">

        {/* ── Form area ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-4">
              <div className="text-sm font-bold text-[#0f172a]">
                Step {currentStep + 1}: {step.title}
              </div>
              <div className="text-[11px] text-black/45 mt-0.5">
                Complete all required fields marked with *
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {step.fields.map(field => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  value={formData[field.id] ?? ""}
                  onChange={handleChange}
                />
              ))}
            </div>

            {/* Action log */}
            {actionLog.length > 0 && (
              <div className="mt-4 border border-black/8 rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-[#f8fafc] border-b border-black/8 text-[10px] font-semibold text-black/50 uppercase">
                  Workflow Actions Log
                </div>
                {actionLog.slice(0, 5).map((a, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 border-b border-black/5 last:border-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-slate-600 flex-shrink-0" />
                    <span className="text-xs font-bold text-black">{a.action}</span>
                    <span className="text-[10px] text-black/40 ml-auto">{a.ts}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Governance panel — collapsed by default in form view */}
            <div className="mt-4">
              <TenderGovernancePanel mode="inline" defaultOpen={false} />
            </div>
          </div>

          {/* Step nav buttons */}
          <div className="flex-shrink-0 px-5 py-3 bg-white border-t border-black/8 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="h-9 px-5 border border-black/20 text-sm font-semibold text-black/60 hover:bg-gray-50 rounded-lg flex items-center gap-2 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <div className="text-xs text-black/40">
              Step {currentStep + 1} of {config.steps.length}
            </div>
            <button
              onClick={handleNext}
              className="h-9 px-6 bg-[#0F172A] hover:bg-[#0F172A] text-white text-sm font-bold rounded-lg flex items-center gap-2 transition-colors"
            >
              {isLast ? "Submit" : "Next"} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Document preview panel ── */}
        {showDocPanel && (
          <div className="w-80 flex-shrink-0 flex flex-col border-l border-black/10 bg-white overflow-hidden">
            {/* Doc tabs */}
            <div className="flex-shrink-0 border-b border-black/8 overflow-x-auto">
              <div className="flex items-stretch min-w-max">
                {DOCS.map((doc, i) => (
                  <button
                    key={doc}
                    onClick={() => setActiveDoc(i)}
                    className={`px-3 py-2 text-[9px] font-semibold whitespace-nowrap border-b-2 transition-colors
                      ${activeDoc === i
                        ? "border-[#0f172a] text-[#0f172a] bg-white"
                        : "border-transparent text-black/40 hover:text-black hover:bg-gray-50"}`}
                  >
                    {doc.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
            {/* Doc viewer */}
            <div className="flex-1 overflow-hidden">
              <DocumentViewer
                docType={DOCS[activeDoc]}
                formData={formData}
                ministry={ministry}
                config={config}
              />
            </div>
          </div>
        )}
      </div>

      {/* Workflow footer */}
      <WorkflowFooter onAction={handleAction} onSave={handleSave} saving={saving} />
    </div>
  );
}

export default StageFormWorkbench;
