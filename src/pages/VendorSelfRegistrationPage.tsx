/**
 * VendorSelfRegistrationPage — Self-service vendor/supplier registration.
 * Multi-step wizard following the system form design standards:
 * emerald stepper, rounded cards, bordered-box fields, 2-column grid.
 *
 * Step 5 — Resource Profiling & Competency Assessment
 * Resources (directors, technical team) are profiled here during vendor
 * onboarding. The system auto-assigns the correct competency assessment
 * track (Track 1 for directors, Track 2 for technical). Competency scores
 * are stored against the individual resource profile and later consumed by
 * the Tender Technical Evaluation process — never triggered fresh at bid
 * submission time.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2, Upload, Sparkles, X, ChevronRight, ChevronLeft,
  FileText, AlertTriangle, Info, Plus, Trash2, Users, BadgeCheck, Shield,
  Award, Clock, Edit3, UserPlus, Mail, Phone,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import {
  ResourceCategory, AssessmentType, deriveAssessmentType,
} from "@/lib/competency-data";

// ── Supplier category codes ────────────────────────────────────────────────
const SERVICE_CODES = [
  { code: "100", label: "Security Services" }, { code: "101", label: "Hotel and Catering Services" },
  { code: "102", label: "Tourism and Travel" }, { code: "103", label: "Hazardous Material Disposal" },
  { code: "104", label: "Maintenance of Vehicles & Machinery" }, { code: "111", label: "Maintenance of Vehicles Related Equipment" },
  { code: "112", label: "Maintenance of Medical Equipment" }, { code: "113", label: "Aircraft Maintenance" },
  { code: "115", label: "Office Equipment Maintenance" }, { code: "116", label: "Broadcasting & Audio Visual" },
  { code: "118", label: "Telecommunication Services" }, { code: "119", label: "Postal and Courier Services" },
  { code: "120", label: "ICT Technical Support" }, { code: "127", label: "Insurance & Pension" },
  { code: "128", label: "Media Services" }, { code: "129", label: "Passenger Transport" },
  { code: "130", label: "Freight Services" }, { code: "131", label: "Rental Services" },
  { code: "132", label: "Cleaning Services" }, { code: "133", label: "Public Utilities" },
  { code: "134", label: "Health Services" }, { code: "135", label: "Customs & Shipping" },
  { code: "136", label: "Auctioneering Services" }, { code: "137", label: "Gardening & Landscaping" },
  { code: "138", label: "Marketing & Public Relations" }, { code: "139", label: "Miscellaneous Services" },
  { code: "140", label: "Calibration Services" }, { code: "141", label: "Language & Interpretation" },
  { code: "142", label: "Aviation Services" }, { code: "143", label: "Human Resources Services" },
  { code: "144", label: "Training Services" }, { code: "145", label: "Safety Health & Environment" },
];
const SUPPLY_CODES = [
  { code: "200", label: "Agriculture Products & Equipment" }, { code: "201", label: "Printed Matter & Equipment" },
  { code: "202", label: "Medical Supplies & Equipment" }, { code: "203", label: "Electrical, Electronic & ICT" },
  { code: "207", label: "Food Supplies" }, { code: "208", label: "Transport Equipment & Accessories" },
  { code: "211", label: "General Supplies" }, { code: "212", label: "Manufacturers — Agricultural" },
  { code: "213", label: "General Manufacturers/Producers" }, { code: "214", label: "Petroleum Products" },
  { code: "216", label: "Gases" }, { code: "217", label: "Media Supplies" },
  { code: "218", label: "Psychosocial Material" }, { code: "219", label: "Defence Supplies" },
];
const CONSULTANT_CODES = [
  { code: "301", label: "Architecture Services" }, { code: "302", label: "Quantity Surveying" },
  { code: "303", label: "Civil Engineering" }, { code: "304", label: "Electrical Engineering" },
  { code: "305", label: "Mechanical Engineering" }, { code: "306", label: "Water Engineering" },
  { code: "307", label: "Mining Engineering" }, { code: "308", label: "Building Engineering" },
  { code: "311", label: "Project Management" }, { code: "313", label: "Environmental Services" },
  { code: "314", label: "Finance Related Services" }, { code: "315", label: "Human Resource Services" },
  { code: "317", label: "Other Consultancy Services" }, { code: "318", label: "Legal Services" },
  { code: "319", label: "ICT Consultancy" }, { code: "320", label: "Town & Regional Planning" },
  { code: "321", label: "Dispute Resolution" }, { code: "322", label: "Healthcare Consulting" },
  { code: "323", label: "Energy Management" },
];
const WORKS_CODES = [
  { code: "01", label: "Building Construction & Maintenance" }, { code: "02", label: "Electrical Engineering Works" },
  { code: "03", label: "Civil Engineering Works" }, { code: "04", label: "Works Maintenance" },
  { code: "05", label: "Water & Sewage Treatment" }, { code: "06", label: "Specialized Construction" },
  { code: "08", label: "Mechanical Engineering Works" }, { code: "09", label: "Drilling Works" },
  { code: "10", label: "Water Engineering Works" }, { code: "13", label: "Fencing Works" },
  { code: "14", label: "Roads — Ancillary Works" }, { code: "15", label: "Civil Aviation/Met Electronics" },
];

const STEPS = [
  "Company Details",
  "Ownership & Category",
  "Business Codes",
  "Directors & Shareholders",
  "Resource Profiling & Competency",
  "Banking Details",
  "Documents",
  "Review & Submit",
];

// ── Types ──────────────────────────────────────────────────────────────────
type Director = { name: string; middleName: string; surname: string; idNumber: string; nationality: string; gender: string; shareholding: string; youth: boolean; disabled: boolean };
type BankAccount = { accountName: string; bankName: string; accountNumber: string; branchName: string; accountType: string; branchCode: string; swiftCode: string };
type RegResource = {
  id: string; fullName: string; role: ResourceCategory; designation: string;
  email: string; phone: string; idNumber: string; specialisation: string;
  professionalBody: string; membershipNumber: string;
  assessmentType: AssessmentType; assessmentStatus: "Not Assigned" | "Assigned" | "Pending";
};

// ── Shared input styles ────────────────────────────────────────────────────
const inp = "w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-slate-200 transition-colors";
const sel = "w-full h-9 px-3 rounded border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-slate-200 transition-colors appearance-none";

// ── Field box (read-only display) ──────────────────────────────────────────
function FieldBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 rounded p-3 bg-white">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</div>
      <div className="text-sm text-gray-800 min-h-[20px]">{value || "—"}</div>
    </div>
  );
}

// ── Field input box ────────────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded p-3 bg-white">
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ── Code picker ────────────────────────────────────────────────────────────
function CodePicker({ codes, selected, onToggle, label }: {
  codes: { code: string; label: string }[];
  selected: string[];
  onToggle: (code: string) => void;
  label: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = codes.filter(c =>
    c.code.includes(search) || c.label.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-2">{label}</div>
      <div className="p-2 border-b border-gray-200">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search codes…"
          className="w-full h-7 px-2 text-xs rounded border border-gray-200 focus:outline-none focus:border-slate-200" />
      </div>
      <div className="max-h-48 overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
        {filtered.map(c => (
          <label key={c.code} className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer text-xs rounded transition-colors
            ${selected.includes(c.code) ? "bg-slate-50 border border-slate-200 font-semibold text-[#0F172A]" : "hover:bg-gray-50 border border-transparent"}`}>
            <input type="checkbox" checked={selected.includes(c.code)} onChange={() => onToggle(c.code)} className="h-3 w-3 accent-emerald-600" />
            <span className="font-mono text-[10px] text-gray-400 flex-shrink-0">{c.code}</span>
            <span className="truncate">{c.label}</span>
          </label>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-200 flex flex-wrap gap-1">
          {selected.map(code => {
            const item = codes.find(c => c.code === code);
            return item ? (
              <span key={code} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-[#0F172A] text-[10px] font-semibold rounded">
                {code} — {item.label}
                <button onClick={() => onToggle(code)} className="ml-0.5 text-[#0F172A] hover:text-[#0F172A]">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function VendorSelfRegistrationPage() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const appRef = `VEN-APP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000 + 10000))}`;

  // ── Form state ────────────────────────────────────────────────────────────
  const [applicationType, setApplicationType] = useState<"new" | "change">("new");
  const [ownership, setOwnership] = useState<string[]>([]);
  const [companyCategory, setCompanyCategory] = useState<string[]>([]);
  const [sector, setSector] = useState<string[]>([]);
  const [industry, setIndustry] = useState<string[]>([]);
  const [worksSize, setWorksSize] = useState<string[]>([]);
  const [serviceCodes, setServiceCodes] = useState<string[]>([]);
  const [supplyCodes, setSupplyCodes] = useState<string[]>([]);
  const [consultantCodes, setConsultantCodes] = useState<string[]>([]);
  const [worksCodes, setWorksCodes] = useState<string[]>([]);
  const [directors, setDirectors] = useState<Director[]>([
    { name: "", middleName: "", surname: "", idNumber: "", nationality: "Zimbabwean", gender: "", shareholding: "", youth: false, disabled: false },
  ]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    { accountName: "", bankName: "", accountNumber: "", branchName: "", accountType: "", branchCode: "", swiftCode: "" },
  ]);

  // ── Step 5 — Resource profiles ────────────────────────────────────────────
  const [resources, setResources] = useState<RegResource[]>([]);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editResourceId, setEditResourceId] = useState<string | null>(null);
  const blankResource: Omit<RegResource, "id" | "assessmentType"> = {
    fullName: "", role: "Technical Engineer", designation: "", email: "",
    phone: "", idNumber: "", specialisation: "", professionalBody: "",
    membershipNumber: "", assessmentStatus: "Not Assigned",
  };
  const [resourceForm, setResourceForm] = useState({ ...blankResource });

  const [companyInfo, setCompanyInfo] = useState({
    companyName: "", companyReg: "", dateReg: "", taxTin: "", vatNumber: "",
    subsidiaries: "", physicalAddress: "", postalAddress: "",
    contactName: "", contactCell: "", contactEmail: "", contactPhone: "", contactFax: "",
    altName: "", altCell: "", altEmail: "",
    website: "", yearsInBusiness: "",
  });
  const setCI = (k: string, v: string) => setCompanyInfo(f => ({ ...f, [k]: v }));

  // ── Toggles ───────────────────────────────────────────────────────────────
  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  // ── Directors ─────────────────────────────────────────────────────────────
  const addDirector = () => setDirectors(p => [...p, { name: "", middleName: "", surname: "", idNumber: "", nationality: "Zimbabwean", gender: "", shareholding: "", youth: false, disabled: false }]);
  const updateDirector = (i: number, k: keyof Director, v: any) =>
    setDirectors(p => p.map((d, idx) => idx === i ? { ...d, [k]: v } : d));
  const removeDirector = (i: number) => setDirectors(p => p.filter((_, idx) => idx !== i));

  // ── Bank accounts ─────────────────────────────────────────────────────────
  const addBankAccount = () => setBankAccounts(p => [...p, { accountName: "", bankName: "", accountNumber: "", branchName: "", accountType: "", branchCode: "", swiftCode: "" }]);
  const updateBank = (i: number, k: keyof BankAccount, v: string) =>
    setBankAccounts(p => p.map((b, idx) => idx === i ? { ...b, [k]: v } : b));
  const removeBank = (i: number) => setBankAccounts(p => p.filter((_, idx) => idx !== i));

  // ── Resources ─────────────────────────────────────────────────────────────
  const handleSaveResource = () => {
    if (!resourceForm.fullName.trim()) { pushNotification("Full Name is required", "error"); return; }
    const aType = deriveAssessmentType(resourceForm.role);
    if (editResourceId) {
      setResources(prev => prev.map(r => r.id === editResourceId ? { ...r, ...resourceForm, assessmentType: aType } : r));
      pushNotification(`Resource updated: ${resourceForm.fullName}`, "success");
    } else {
      setResources(prev => [...prev, { ...resourceForm, id: `VREG-${Date.now()}`, assessmentType: aType, assessmentStatus: "Assigned" }]);
      pushNotification(`Resource registered: ${resourceForm.fullName} — ${aType} assigned`, "success");
    }
    setShowResourceForm(false); setEditResourceId(null); setResourceForm({ ...blankResource });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    pushNotification(`Vendor application submitted: ${companyInfo.companyName || "New Vendor"} — Ref: ${appRef}`, "success");
    setSubmitted(true);
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="page-standalone bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-xl w-full max-w-md p-8 text-center shadow-sm">
          <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-[#0F172A]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Application Submitted</h2>
          <p className="text-sm text-gray-500 mb-4">Your vendor registration has been submitted for review. The Procurement Department will review and approve your application.</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-left text-xs mb-4 space-y-1">
            <div><span className="text-gray-400">Reference: </span><strong className="font-mono text-gray-800">{appRef}</strong></div>
            <div><span className="text-gray-400">Company: </span><strong className="text-gray-800">{companyInfo.companyName || "Your Company"}</strong></div>
            <div><span className="text-gray-400">Status: </span><span className="text-[#0F172A] font-semibold">Pending Review</span></div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-[#0F172A] text-left mb-4">
            <strong>What happens next?</strong> Our procurement team will review your application within 5–10 business days. You will be notified via email once approved or if additional information is required.
            {resources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-200">
                <strong>Competency assessments:</strong> {resources.length} resource profile(s) registered and assigned. Once approved, your team can complete assessments through the Competency Assessment Workbench.
              </div>
            )}
          </div>
          <Link to="/" className="block w-full text-center bg-[#0F172A] hover:bg-[#0F172A] text-white rounded-lg py-3 text-sm font-semibold transition-colors">
            Return to Portal
          </Link>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="page-standalone bg-gray-50 flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full ai-logo-gradient ai-logo-glow flex items-center justify-center flex-shrink-0">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-sm">AI Powered Electronic Government Procurement &amp; Oversight Intelligence System</div>
          <div className="text-slate-400 text-xs">Supplier Registration — Vendor Portal</div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <Link to="/supplier-registration"
            className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition-colors">
            <FileText className="h-3.5 w-3.5" /> Official Paper Form
          </Link>
          <Link to="/" className="text-white/60 hover:text-white text-sm">← Back to Portal</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex-1">

        {/* ── Form header ─────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm">
          <h1 className="text-2xl font-bold tracking-wide text-gray-900 uppercase mb-1">Supplier Registration Form</h1>
          <p className="text-sm text-gray-500">Complete this form to register as a supplier. Your application will be reviewed and approved by the Procurement Department.</p>
          <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-[#0F172A]">These supplier registration forms must match wherever they appear in the system. All fields are standardised with the official PRAZ Supplier Registration Form. This form and the official paper form capture the same information.</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={applicationType === "new"} onChange={() => setApplicationType("new")} className="accent-gray-900" />
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">New Application</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={applicationType === "change"} onChange={() => setApplicationType("change")} className="accent-gray-900" />
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Notification of Change of Status</span>
            </label>
          </div>
        </div>

        {/* ── Stepper ─────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 shadow-sm">
          <div className="flex items-center overflow-x-auto gap-0">
            <button className="flex-shrink-0 px-2 py-1 text-gray-400 hover:text-gray-600" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center flex-1 overflow-x-auto gap-0">
              {STEPS.map((s, i) => {
                const state = i + 1 < step ? "completed" : i + 1 === step ? "active" : "upcoming";
                return (
                  <div key={s} className="flex items-center flex-shrink-0">
                    <button
                      onClick={() => i + 1 <= step && setStep(i + 1)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap
                        ${state === "completed" ? "bg-[#0F172A] text-white" : state === "active" ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-400 bg-white"}`}>
                      {state === "completed"
                        ? <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                        : <span className="flex-shrink-0">{i + 1}</span>}
                      <span className="hidden sm:inline">{s}</span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className={`w-3 h-px flex-shrink-0 mx-0.5 ${i + 1 < step ? "bg-slate-400" : "bg-gray-200"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <button className="flex-shrink-0 px-2 py-1 text-gray-400 hover:text-gray-600" onClick={() => setStep(s => Math.min(STEPS.length, s + 1))} disabled={step === STEPS.length}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Step content card ────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-4">

          {/* STEP 1 — Company Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Step 1: Company Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { k: "companyName", label: "Company Name", required: true, ph: "Full registered company name" },
                  { k: "companyReg",  label: "Registration No.", required: true, ph: "e.g. 12345/2024" },
                  { k: "dateReg",     label: "Date of Registration", ph: "", type: "date" },
                  { k: "taxTin",      label: "Tax TIN Number", required: true, ph: "e.g. 1234567890" },
                  { k: "vatNumber",   label: "VAT Number", ph: "If applicable" },
                  { k: "subsidiaries",label: "Subsidiaries", ph: "List any subsidiary companies" },
                  { k: "yearsInBusiness", label: "Years in Business", ph: "e.g. 5" },
                  { k: "website",     label: "Website", ph: "https://www.company.co.zw" },
                ].map(({ k, label, required, ph, type }) => (
                  <Field key={k} label={label} required={required}>
                    <input type={type || "text"} value={(companyInfo as any)[k]} onChange={e => setCI(k, e.target.value)}
                      placeholder={ph} className={inp} />
                  </Field>
                ))}
                <Field label="Physical Address" required>
                  <textarea value={companyInfo.physicalAddress} onChange={e => setCI("physicalAddress", e.target.value)}
                    placeholder="Full physical address" rows={2}
                    className="w-full px-3 py-2 rounded border border-gray-300 bg-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-slate-200" />
                </Field>
                <Field label="Postal Address">
                  <textarea value={companyInfo.postalAddress} onChange={e => setCI("postalAddress", e.target.value)}
                    placeholder="Postal / PO Box address" rows={2}
                    className="w-full px-3 py-2 rounded border border-gray-300 bg-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-slate-200" />
                </Field>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Contact Person</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { k: "contactName",  label: "Full Name", required: true, ph: "Contact person full name" },
                    { k: "contactCell",  label: "Cell", ph: "+263 77 000 0000" },
                    { k: "contactEmail", label: "Email", required: true, ph: "contact@company.co.zw" },
                    { k: "contactPhone", label: "Telephone", ph: "+263 242 000000" },
                    { k: "contactFax",   label: "Fax", ph: "+263 242 000000" },
                  ].map(({ k, label, required, ph }) => (
                    <Field key={k} label={label} required={required}>
                      <input value={(companyInfo as any)[k]} onChange={e => setCI(k, e.target.value)}
                        placeholder={ph} className={inp} />
                    </Field>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Ownership & Category */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Step 2: Company Ownership Structure &amp; Category</h2>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Company Ownership Structure <span className="text-red-500">*</span></div>
                <div className="flex flex-wrap gap-2">
                  {["Citizen Owned", "Foreign Owned", "Joint Venture", "NGO"].map(v => (
                    <label key={v} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors
                      ${ownership.includes(v) ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-300 hover:bg-gray-50"}`}>
                      <input type="checkbox" checked={ownership.includes(v)} onChange={() => toggle(ownership, setOwnership, v)} className="hidden" />{v}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Company Category <span className="text-gray-400 font-normal normal-case">(select all that apply — attach supporting documents)</span></div>
                <div className="flex flex-wrap gap-2">
                  {["Youth", "Women", "PLD (Persons Living with Disability)", "Rural Location", "EDD (Economic Diversification Drive)", "Retired Public Officers", "OVCs (Orphans & Vulnerable Children)"].map(v => (
                    <label key={v} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border cursor-pointer text-xs transition-colors
                      ${companyCategory.includes(v) ? "bg-[#0F172A] text-white border-slate-200" : "bg-white border-gray-300 hover:bg-slate-50"}`}>
                      <input type="checkbox" checked={companyCategory.includes(v)} onChange={() => toggle(companyCategory, setCompanyCategory, v)} className="hidden" />{v}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sector <span className="text-red-500">*</span></div>
                <div className="flex flex-wrap gap-2">
                  {["SUPPLIES", "SERVICES", "CONTRACTOR"].map(v => (
                    <label key={v} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm font-semibold transition-colors
                      ${sector.includes(v) ? "bg-gray-900 text-white border-gray-900" : "bg-white border-gray-300 hover:bg-gray-50"}`}>
                      <input type="checkbox" checked={sector.includes(v)} onChange={() => toggle(sector, setSector, v)} className="hidden" />{v}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Industry</div>
                <div className="flex flex-wrap gap-2">
                  {["Manufacturing", "Mining", "Agriculture", "Other"].map(v => (
                    <label key={v} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors
                      ${industry.includes(v) ? "bg-[#0F172A] text-white border-slate-200" : "bg-white border-gray-300 hover:bg-gray-50"}`}>
                      <input type="checkbox" checked={industry.includes(v)} onChange={() => toggle(industry, setIndustry, v)} className="hidden" />{v}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Works Contractor Size (if applicable)</div>
                <div className="flex flex-wrap gap-2">
                  {["E-Class", "D-Class", "C-Class", "B-Class", "O-C Class"].map(v => (
                    <label key={v} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors
                      ${worksSize.includes(v) ? "bg-[#0F172A] text-white border-slate-200" : "bg-white border-gray-300 hover:bg-gray-50"}`}>
                      <input type="checkbox" checked={worksSize.includes(v)} onChange={() => toggle(worksSize, setWorksSize, v)} className="hidden" />{v}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 — Business Codes */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Step 3: Business Activity Codes</h2>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-start gap-2">
                <Info className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-[#0F172A]">Select the codes that describe your business activities. Once approved, you will only receive tender notifications and be eligible to bid for tenders matching your selected codes.</span>
              </div>
              <CodePicker codes={SERVICE_CODES} selected={serviceCodes} onToggle={c => setServiceCodes(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])} label="Services (Codes 100–145)" />
              <CodePicker codes={SUPPLY_CODES} selected={supplyCodes} onToggle={c => setSupplyCodes(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])} label="Supplies (Codes 200–219)" />
              <CodePicker codes={CONSULTANT_CODES} selected={consultantCodes} onToggle={c => setConsultantCodes(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])} label="Consultants (Codes 301–323)" />
              <CodePicker codes={WORKS_CODES} selected={worksCodes} onToggle={c => setWorksCodes(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])} label="Works Contractors (Codes 01–15)" />
              <div className="text-xs text-gray-400 p-3 border border-gray-200 rounded-lg bg-gray-50">
                Total selected codes: <strong className="text-gray-700">{serviceCodes.length + supplyCodes.length + consultantCodes.length + worksCodes.length}</strong>
              </div>
            </div>
          )}

          {/* STEP 4 — Directors & Shareholders */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Step 4: Directors / Partners / Members / Owners</h2>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-[#0F172A]">All fields will be compared against verification databases and flagged if anomalies are detected (such as blacklisted individuals).</span>
              </div>
              {directors.map((d, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Director / Partner {i + 1}</span>
                    {directors.length > 1 && (
                      <button onClick={() => removeDirector(i)} className="h-6 w-6 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { k: "name" as keyof Director, label: "First Name" },
                      { k: "middleName" as keyof Director, label: "Middle Name" },
                      { k: "surname" as keyof Director, label: "Surname" },
                      { k: "idNumber" as keyof Director, label: "ID Number" },
                      { k: "nationality" as keyof Director, label: "Nationality" },
                      { k: "shareholding" as keyof Director, label: "Shareholding %" },
                    ].map(({ k, label }) => (
                      <Field key={k} label={label}>
                        <input value={d[k] as string} onChange={e => updateDirector(i, k, e.target.value)} className={inp} />
                      </Field>
                    ))}
                    <Field label="Gender">
                      <select value={d.gender} onChange={e => updateDirector(i, "gender", e.target.value)} className={sel}>
                        <option value="">Select…</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </Field>
                    <div className="border border-gray-200 rounded p-3 bg-white flex gap-4 items-center">
                      <label className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0">Attributes</label>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input type="checkbox" checked={d.youth} onChange={e => updateDirector(i, "youth", e.target.checked)} className="accent-emerald-600" /> Youth
                      </label>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input type="checkbox" checked={d.disabled} onChange={e => updateDirector(i, "disabled", e.target.checked)} className="accent-emerald-600" /> Disabled
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addDirector} className="flex items-center gap-2 px-4 py-3 w-full border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                <Plus className="h-4 w-4" /> Add Director / Partner
              </button>
            </div>
          )}

          {/* STEP 5 — Resource Profiling & Competency */}
          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Step 5: Resource Profiling &amp; Competency Assessment Assignment</h2>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#0F172A] space-y-1">
                  <div className="font-bold text-[#0F172A]">Why this step is required by PRAZ</div>
                  <div>Competency assessment is a vendor capability qualification mechanism that must begin here, during vendor registration. Each director and technical team member must be profiled so the system can assign and track their competency assessments before any tender response is submitted.</div>
                  <div className="text-[#0F172A]">When this vendor later participates in a tender, the system pulls stored competency scores from these resource profiles directly into the Technical Bid Evaluation Score Card (Criteria 6a and 6b).</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border-l-4 border-slate-200 bg-slate-50 rounded-r-lg p-3">
                  <div className="text-[9px] font-black text-[#0F172A] uppercase tracking-widest mb-1">Track 1 · Director</div>
                  <div className="text-xs font-bold text-[#0F172A]">Director Competency Assessment</div>
                  <div className="text-[10px] text-gray-500 mt-1">Covers: Corporate Governance, Financial Responsibility, Anti-Corruption, Contract Obligations<br/><span className="text-[#0F172A] font-semibold">→ Feeds Criterion 6a (max 5 marks)</span></div>
                </div>
                <div className="border-l-4 border-slate-200 bg-slate-50 rounded-r-lg p-3">
                  <div className="text-[9px] font-black text-[#0F172A] uppercase tracking-widest mb-1">Track 2 · Technical</div>
                  <div className="text-xs font-bold text-[#0F172A]">Technical Engineer / Lead Technical Team</div>
                  <div className="text-[10px] text-gray-500 mt-1">Covers: Technical Execution, Quality Standards, HSE, Project Delivery<br/><span className="text-[#0F172A] font-semibold">→ Feeds Criterion 6b (max 5 marks)</span></div>
                </div>
              </div>

              {resources.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-2 flex items-center justify-between">
                    <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Registered Resources ({resources.length})</span>
                    <span className="text-white/40 text-[9px]">Competency assessments auto-assigned by role</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {resources.map(r => {
                      const isDir = r.role === "Director";
                      return (
                        <div key={r.id} className="px-3 py-3 flex items-start gap-3 hover:bg-gray-50 group">
                          <div className={`h-9 w-9 rounded flex-shrink-0 flex items-center justify-center text-xs font-bold ${isDir ? "bg-[#0F172A] text-white" : "bg-[#0F172A] text-white"}`}>
                            {r.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-gray-900">{r.fullName}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border-l-2 ${isDir ? "border-slate-200 bg-slate-50 text-[#0F172A]" : "border-slate-200 bg-slate-50 text-[#0F172A]"}`}>
                                {isDir ? "Track 1 · Director" : "Track 2 · Technical"}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-[#0F172A] font-semibold rounded flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" /> Assessment Assigned
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">{r.designation} · {r.role}</div>
                            <div className="text-[9px] text-gray-400 mt-0.5 flex items-center gap-3 flex-wrap">
                              {r.email && <span className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" />{r.email}</span>}
                              {r.phone && <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{r.phone}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => {
                              setResourceForm({ fullName: r.fullName, role: r.role, designation: r.designation, email: r.email, phone: r.phone, idNumber: r.idNumber, specialisation: r.specialisation, professionalBody: r.professionalBody, membershipNumber: r.membershipNumber, assessmentStatus: r.assessmentStatus });
                              setEditResourceId(r.id); setShowResourceForm(true);
                            }} className="h-7 px-2 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1 transition-colors">
                              <Edit3 className="h-3 w-3" /> Edit
                            </button>
                            <button onClick={() => setResources(prev => prev.filter(x => x.id !== r.id))}
                              className="h-7 px-2 text-[10px] bg-red-50 hover:bg-red-100 text-red-600 rounded flex items-center gap-1 transition-colors">
                              <Trash2 className="h-3 w-3" /> Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center gap-4 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1.5"><Shield className="h-3 w-3 text-[#0F172A]" /> {resources.filter(r => r.role === "Director").length} Director(s) — Track 1</span>
                    <span className="flex items-center gap-1.5"><Award className="h-3 w-3 text-slate-600" /> {resources.filter(r => r.role !== "Director").length} Technical — Track 2</span>
                  </div>
                </div>
              )}

              {showResourceForm ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-2">
                      <UserPlus className="h-3.5 w-3.5" />
                      {editResourceId ? "Edit Resource Profile" : "Add Resource Profile"}
                    </span>
                    <button onClick={() => { setShowResourceForm(false); setEditResourceId(null); setResourceForm({ ...blankResource }); }}
                      className="h-6 w-6 grid place-items-center hover:bg-white/20 rounded transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <Field label="Professional Category" required>
                      <select value={resourceForm.role} onChange={e => setResourceForm(prev => ({ ...prev, role: e.target.value as ResourceCategory }))} className={sel}>
                        <option value="Director">Director</option>
                        <option value="Technical Engineer">Technical Engineer</option>
                        <option value="Lead Technical Team">Lead Technical Team</option>
                        <option value="Other">Other</option>
                      </select>
                    </Field>
                    <div className={`px-3 py-2 rounded-lg border-l-4 text-[10px] font-semibold ${resourceForm.role === "Director" ? "border-slate-200 bg-slate-50 text-[#0F172A]" : "border-slate-200 bg-slate-50 text-[#0F172A]"}`}>
                      {resourceForm.role === "Director" ? "✦ Track 1 assigned → Director Competency Assessment (Criterion 6a)" : "✦ Track 2 assigned → Technical Engineer Competency Assessment (Criterion 6b)"}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { k: "fullName", label: "Full Name", required: true, ph: "e.g. Tendai Muzorewa" },
                        { k: "designation", label: "Designation / Title", ph: "e.g. Managing Director" },
                        { k: "email", label: "Email Address", ph: "name@company.co.zw" },
                        { k: "phone", label: "Phone Number", ph: "+263 77 000 0000" },
                        { k: "idNumber", label: "National ID Number", ph: "63-043291-A-21" },
                        { k: "specialisation", label: "Area of Specialisation", ph: "e.g. Civil Engineering" },
                        { k: "professionalBody", label: "Professional Body", ph: "e.g. ZIE, ECZ" },
                        { k: "membershipNumber", label: "Membership Number", ph: "e.g. ZIE-2841" },
                      ].map(f => (
                        <Field key={f.k} label={f.label} required={(f as any).required}>
                          <input value={(resourceForm as Record<string, string>)[f.k] ?? ""} onChange={e => setResourceForm(prev => ({ ...prev, [f.k]: e.target.value }))} placeholder={f.ph} className={inp} />
                        </Field>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveResource} className="h-9 px-5 bg-[#0F172A] hover:bg-[#0F172A] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors">
                        <BadgeCheck className="h-3.5 w-3.5" /> {editResourceId ? "Update Resource" : "Add Resource & Assign Assessment"}
                      </button>
                      <button onClick={() => { setShowResourceForm(false); setEditResourceId(null); setResourceForm({ ...blankResource }); }}
                        className="h-9 px-4 border border-gray-300 text-xs text-gray-600 rounded hover:bg-gray-50 transition-colors">Cancel</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setShowResourceForm(true); setEditResourceId(null); setResourceForm({ ...blankResource }); }}
                  className="flex items-center gap-2 px-4 py-3 w-full border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                  <Plus className="h-4 w-4" /> Add Director or Technical Team Member
                </button>
              )}
              {resources.length === 0 && !showResourceForm && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-[#0F172A]"><strong>Recommended:</strong> Add at least one Director (Criterion 6a) and one Technical Team member (Criterion 6b) so the system can assign their competency assessments before any tender participation.</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 6 — Banking Details */}
          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Step 6: Banking Details</h2>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-[#0F172A]">All banking details will be verified and compared to financial databases to detect anomalies.</span>
              </div>
              {bankAccounts.map((b, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bank Account {i + 1}</span>
                    {bankAccounts.length > 1 && (
                      <button onClick={() => removeBank(i)} className="h-6 w-6 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { k: "accountName" as keyof BankAccount, label: "Account Name" },
                      { k: "bankName" as keyof BankAccount, label: "Bank Name" },
                      { k: "accountNumber" as keyof BankAccount, label: "Account Number" },
                      { k: "branchName" as keyof BankAccount, label: "Branch Name" },
                      { k: "accountType" as keyof BankAccount, label: "Account Type" },
                      { k: "branchCode" as keyof BankAccount, label: "Branch Code" },
                      { k: "swiftCode" as keyof BankAccount, label: "SWIFT Code" },
                    ].map(({ k, label }) => (
                      <Field key={k} label={label}>
                        <input value={b[k]} onChange={e => updateBank(i, k, e.target.value)} className={inp} />
                      </Field>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={addBankAccount} className="flex items-center gap-2 px-4 py-3 w-full border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                <Plus className="h-4 w-4" /> Add Bank Account
              </button>
            </div>
          )}

          {/* STEP 7 — Documents */}
          {step === 7 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Step 7: Required Attachments &amp; Supporting Documents</h2>
              <div className="space-y-2">
                {[
                  { label: "All Company Forms certified by issuing authority", required: true },
                  { label: "Certified Share Certificates", required: true },
                  { label: "Trading License certified by issuing office", required: true },
                  { label: "Tax Clearance Certificate or Exemption", required: true },
                  { label: "PRAZ Registration Certificate", required: true },
                  { label: "Product Catalogue", required: false },
                  { label: "Certified copies of ID (Directors/Partners)", required: true },
                ].map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="flex-1 text-sm text-gray-800">{doc.label}</span>
                    {doc.required && <span className="text-[10px] text-red-500 font-semibold">Required</span>}
                    <label className="h-8 px-3 bg-[#0F172A] hover:bg-[#0F172A] text-white text-xs rounded flex items-center gap-1.5 cursor-pointer transition-colors">
                      <Upload className="h-3 w-3" /> Upload
                      <input type="file" className="hidden" accept=".pdf,.jpg,.png" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 8 — Review & Submit */}
          {step === 8 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-100 pb-2">Step 8: Review &amp; Submit Application</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FieldBox label="Company Name" value={companyInfo.companyName} />
                <FieldBox label="Registration No." value={companyInfo.companyReg} />
                <FieldBox label="Tax TIN" value={companyInfo.taxTin} />
                <FieldBox label="Ownership" value={ownership.join(", ")} />
                <FieldBox label="Sector" value={sector.join(", ")} />
                <FieldBox label="Industry" value={industry.join(", ")} />
                <FieldBox label="Company Category" value={companyCategory.join(", ")} />
                <FieldBox label="Website" value={companyInfo.website} />
                <FieldBox label="Service Codes" value={serviceCodes.length > 0 ? `${serviceCodes.length} selected` : "None"} />
                <FieldBox label="Supply Codes" value={supplyCodes.length > 0 ? `${supplyCodes.length} selected` : "None"} />
                <FieldBox label="Consultant Codes" value={consultantCodes.length > 0 ? `${consultantCodes.length} selected` : "None"} />
                <FieldBox label="Works Codes" value={worksCodes.length > 0 ? `${worksCodes.length} selected` : "None"} />
                <FieldBox label="Directors / Partners" value={`${directors.length} added`} />
                <FieldBox label="Bank Accounts" value={`${bankAccounts.length} added`} />
                <FieldBox label="Resource Profiles" value={resources.length > 0 ? `${resources.length} resource(s) — ${resources.filter(r => r.role === "Director").length} Director(s), ${resources.filter(r => r.role !== "Director").length} Technical` : "None added"} />
                <FieldBox label="Contact Email" value={companyInfo.contactEmail} />
              </div>

              {resources.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-900 text-white px-3 py-2 text-xs font-semibold flex items-center gap-2">
                    <BadgeCheck className="h-3.5 w-3.5 text-slate-400" /> Competency Assessment Readiness
                  </div>
                  <div className="divide-y divide-gray-100">
                    {resources.map(r => {
                      const isDir = r.role === "Director";
                      return (
                        <div key={r.id} className="px-3 py-2 flex items-center gap-3 text-xs">
                          <div className={`w-1 h-10 flex-shrink-0 rounded ${isDir ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{r.fullName}</div>
                            <div className="text-[10px] text-gray-500">{r.designation} · {r.role}</div>
                          </div>
                          <div className="text-right">
                            <div className={`text-[9px] font-black ${isDir ? "text-[#0F172A]" : "text-[#0F172A]"}`}>
                              {isDir ? "Track 1 · Criterion 6a" : "Track 2 · Criterion 6b"}
                            </div>
                            <div className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-[#0F172A] font-semibold rounded inline-block mt-0.5">Assessment Assigned</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-[#0F172A]">AI Compliance Check: All required fields are validated. Your application will be reviewed by the Procurement and Risk teams within 5–10 business days.</span>
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input type="checkbox" checked={declarationChecked} onChange={e => setDeclarationChecked(e.target.checked)} className="mt-0.5 accent-emerald-600 h-4 w-4 flex-shrink-0" />
                <span className="text-xs text-gray-700">I declare that all information provided is true and accurate. I understand that providing false information may result in disqualification and legal action under the Procurement and Disposal of Public Assets Act.</span>
              </label>
            </div>
          )}

        </div>

        {/* ── Navigation bar ───────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between shadow-sm">
          <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
            className="h-9 px-5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors flex items-center gap-1.5">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <span className="text-xs text-gray-400">Step {step} of {STEPS.length}</span>
          {step < STEPS.length ? (
            <button onClick={() => setStep(s => s + 1)}
              className="h-9 px-5 rounded-lg bg-[#0F172A] hover:bg-[#0F172A] text-white text-sm font-semibold flex items-center gap-1.5 transition-colors">
              Save &amp; Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={!declarationChecked}
              className="h-9 px-5 rounded-lg bg-[#0F172A] hover:bg-[#0F172A] text-white text-sm font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <CheckCircle2 className="h-4 w-4" /> Submit Application
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
