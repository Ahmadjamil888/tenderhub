import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pushNotification } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import {
  CheckSquare, Square, ChevronDown, Upload, Save, Printer,
  Building2, Mail, Phone, MapPin, FileText, User, Calendar,
  AlertTriangle, CheckCircle2, X, Plus, Trash2,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
type CheckboxItem = { label: string; checked: boolean };

function Checkbox({ checked, onChange, label, bold = false }: {
  checked: boolean; onChange: () => void; label: string; bold?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none group">
      <button
        type="button"
        onClick={onChange}
        className={`h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
          ${checked
            ? "bg-[#2563eb] border-[#2563eb] shadow-sm"
            : "border-black/30 bg-white group-hover:border-[#2563eb]"}`}
      >
        {checked && <CheckSquare className="h-3 w-3 text-white fill-white stroke-white" />}
      </button>
      <span className={`text-sm ${bold ? "font-semibold" : "font-normal"} text-black/80`}>{label}</span>
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0f172a] text-white text-sm font-bold px-4 py-2 rounded-t-lg tracking-wide uppercase">
      {children}
    </div>
  );
}

function FieldRow({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="grid grid-cols-12 gap-3 items-center py-1.5 border-b border-black/6 last:border-0">
      <label className="col-span-12 sm:col-span-4 text-sm font-medium text-black/70 pr-2">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="col-span-12 sm:col-span-8">{children}</div>
    </div>
  );
}

const inp = "w-full h-9 px-3 rounded border border-black/15 bg-[#f0f8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40 focus:border-[#2563eb] transition-colors";
const sel = "w-full h-9 px-3 rounded border border-black/15 bg-[#f0f8f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]/40 focus:border-[#2563eb] transition-colors appearance-none";

// ── Supplier Codes table row ───────────────────────────────────────────────────
function CodeRow({ idx, code, desc, onRemove, onChange }: {
  idx: number; code: string; desc: string;
  onRemove: () => void; onChange: (k: "code" | "desc", v: string) => void;
}) {
  return (
    <tr className="border-b border-black/8">
      <td className="py-1.5 pr-2 text-xs text-black/40 w-8 text-center">{idx + 1}</td>
      <td className="py-1.5 pr-2">
        <input value={code} onChange={e => onChange("code", e.target.value)}
          placeholder="e.g. 72100000"
          className="w-full h-8 px-2 rounded border border-black/15 bg-[#f0f8f0] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563eb]/40" />
      </td>
      <td className="py-1.5 pr-2">
        <input value={desc} onChange={e => onChange("desc", e.target.value)}
          placeholder="e.g. Computer and related services"
          className="w-full h-8 px-2 rounded border border-black/15 bg-[#f0f8f0] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563eb]/40" />
      </td>
      <td className="py-1.5 w-8">
        <button type="button" onClick={onRemove} className="h-7 w-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

// ── Director row (with Gender + ID upload) ───────────────────────────────────
function DirectorRow({ idx, data, onRemove, onChange }: {
  idx: number;
  data: { name: string; id: string; gender: string; shares: string; nationality: string; idFile: string };
  onRemove: () => void;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <tr className="border-b border-black/8">
      <td className="py-1.5 pr-2 text-xs text-black/40 w-8 text-center">{idx + 1}</td>
      <td className="py-1.5 pr-2">
        <input value={data.name} onChange={e => onChange("name", e.target.value)} placeholder="Full name"
          className="w-full h-8 px-2 rounded border border-black/15 bg-[#f0f8f0] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563eb]/40" />
      </td>
      <td className="py-1.5 pr-2">
        <input value={data.id} onChange={e => onChange("id", e.target.value)} placeholder="ID / Passport No."
          className="w-full h-8 px-2 rounded border border-black/15 bg-[#f0f8f0] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563eb]/40" />
      </td>
      <td className="py-1.5 pr-2">
        <select value={data.gender} onChange={e => onChange("gender", e.target.value)}
          className="w-full h-8 px-2 rounded border border-black/15 bg-[#f0f8f0] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563eb]/40">
          <option value="">—</option><option>Male</option><option>Female</option><option>Other</option>
        </select>
      </td>
      <td className="py-1.5 pr-2">
        <input value={data.shares} onChange={e => onChange("shares", e.target.value)} placeholder="%"
          className="w-full h-8 px-2 rounded border border-black/15 bg-[#f0f8f0] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563eb]/40" />
      </td>
      <td className="py-1.5 pr-2">
        <input value={data.nationality} onChange={e => onChange("nationality", e.target.value)} placeholder="Nationality"
          className="w-full h-8 px-2 rounded border border-black/15 bg-[#f0f8f0] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563eb]/40" />
      </td>
      <td className="py-1.5 pr-2">
        <label className="flex items-center gap-1 h-8 px-2 rounded border border-dashed border-[#2563eb]/40 bg-slate-50 text-[10px] text-[#2563eb] cursor-pointer hover:bg-slate-100">
          <Upload className="h-3 w-3" />
          <span className="truncate max-w-[70px]">{data.idFile || "Attach ID"}</span>
          <input type="file" className="hidden" accept=".pdf,.jpg,.png"
            onChange={e => onChange("idFile", e.target.files?.[0]?.name ?? "")} />
        </label>
      </td>
      <td className="py-1.5 w-8">
        <button type="button" onClick={onRemove} className="h-7 w-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

// ── Beneficial Owner row (separate — regulatory KYC) ─────────────────────────
function BOwnerRow({ idx, data, onRemove, onChange }: {
  idx: number;
  data: { name: string; id: string; gender: string; ownership: string; nationality: string; sourceOfFunds: string; idFile: string };
  onRemove: () => void;
  onChange: (k: string, v: string) => void;
}) {
  return (
    <tr className="border-b border-black/8">
      <td className="py-1.5 pr-2 text-xs text-black/40 w-8 text-center">{idx + 1}</td>
      {(["name","id","gender","ownership","nationality","sourceOfFunds"] as const).map(k => (
        <td key={k} className="py-1.5 pr-2">
          {k === "gender" ? (
            <select value={data[k]} onChange={e => onChange(k, e.target.value)}
              className="w-full h-8 px-2 rounded border border-black/15 bg-[#fef9e7] text-xs">
              <option value="">—</option><option>Male</option><option>Female</option><option>Other</option>
            </select>
          ) : (
            <input value={data[k]} onChange={e => onChange(k, e.target.value)}
              placeholder={k === "name" ? "Full name" : k === "id" ? "ID / Passport" : k === "ownership" ? "% beneficial" : k === "sourceOfFunds" ? "Source of funds" : "Nationality"}
              className="w-full h-8 px-2 rounded border border-black/15 bg-[#fef9e7] text-xs focus:outline-none focus:ring-1 focus:ring-[#2563eb]/40" />
          )}
        </td>
      ))}
      <td className="py-1.5 pr-2">
        <label className="flex items-center gap-1 h-8 px-2 rounded border border-dashed border-[#2563eb]/40 bg-slate-50 text-[10px] text-[#2563eb] cursor-pointer hover:bg-slate-100">
          <Upload className="h-3 w-3" />
          <span className="truncate max-w-[70px]">{data.idFile || "Attach ID"}</span>
          <input type="file" className="hidden" accept=".pdf,.jpg,.png"
            onChange={e => onChange("idFile", e.target.files?.[0]?.name ?? "")} />
        </label>
      </td>
      <td className="py-1.5 w-8">
        <button type="button" onClick={onRemove} className="h-7 w-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </td>
    </tr>
  );
}

// ── PPADB code catalog ────────────────────────────────────────────────────────
const PPADB_CODES = [
  { code: "PPADB-100", desc: "General Building — Class A" },
  { code: "PPADB-101", desc: "General Building — Class B" },
  { code: "PPADB-102", desc: "General Building — Class C" },
  { code: "PPADB-200", desc: "Civil Engineering & Roads" },
  { code: "PPADB-300", desc: "Electrical Installations" },
  { code: "PPADB-400", desc: "Mechanical Engineering" },
  { code: "PPADB-500", desc: "ICT & Systems Integration" },
  { code: "PPADB-600", desc: "Medical Supplies & Pharma" },
  { code: "PPADB-700", desc: "General Supplies & Stationery" },
  { code: "PPADB-800", desc: "Consultancy Services" },
  { code: "PPADB-900", desc: "Security Services" },
  { code: "PPADB-950", desc: "Cleaning & Facilities" },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function SupplierRegistrationPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [refNo] = useState(`GOV-SRF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000 + 10000))}`);

  // ── Section A: Application Type ──────────────────────────────────────────
  const [appType, setAppType] = useState<"new" | "change" | "">("");

  // ── Section B: Ownership ─────────────────────────────────────────────────
  const [ownership, setOwnership] = useState<"citizen" | "foreign" | "joint" | "">("");

  // ── Section C: Company Category ─────────────────────────────────────────
  const [categories, setCategories] = useState({
    youth: false, women: false, pld: false, ruralLocation: false,
    edd: false, bidPublicOfficers: false, ovcs: false,
  });
  const toggleCat = (k: keyof typeof categories) =>
    setCategories(p => ({ ...p, [k]: !p[k] }));

  // ── Section D: Sector / Industry ────────────────────────────────────────
  const [sectors, setSectors] = useState({ supplies: false, services: false, contractor: false });
  const [industries, setIndustries] = useState({ manufacturing: false, mining: false, agriculture: false, other: false });
  const [contractorSize, setContractorSize] = useState<"E" | "D" | "C" | "B" | "">("");

  // ── Section E: Supplier Codes ────────────────────────────────────────────
  const [codes, setCodes] = useState([{ code: "", desc: "" }]);
  const addCode = () => setCodes(p => [...p, { code: "", desc: "" }]);
  const removeCode = (i: number) => setCodes(p => p.filter((_, idx) => idx !== i));
  const updateCode = (i: number, k: "code" | "desc", v: string) =>
    setCodes(p => p.map((c, idx) => idx === i ? { ...c, [k]: v } : c));

  // ── Section F: Company Details ───────────────────────────────────────────
  const [company, setCompany] = useState({
    name: "", regNo: "", dateOfReg: "", vatNo: "", bpNo: "",
    physicalAddress: "", city: "", postalAddress: "", province: "",
    country: "Zimbabwe", tel: "", fax: "", mobile: "", email: "", website: "",
  });
  const setC = (k: string, v: string) => setCompany(p => ({ ...p, [k]: v }));

  // ── Section G: Directors / Partners ─────────────────────────────────────
  const [directors, setDirectors] = useState([
    { name: "", id: "", gender: "", shares: "", nationality: "", idFile: "" },
  ]);
  const addDir = () => setDirectors(p => [...p, { name: "", id: "", gender: "", shares: "", nationality: "", idFile: "" }]);
  const removeDir = (i: number) => setDirectors(p => p.filter((_, idx) => idx !== i));
  const updateDir = (i: number, k: string, v: string) =>
    setDirectors(p => p.map((d, idx) => idx === i ? { ...d, [k]: v } : d));

  // ── Section G2: Beneficial Owners (separate KYC/AML table) ──────────────
  const [bOwners, setBOwners] = useState([
    { name: "", id: "", gender: "", ownership: "", nationality: "", sourceOfFunds: "", idFile: "" },
  ]);
  const addBO = () => setBOwners(p => [...p, { name: "", id: "", gender: "", ownership: "", nationality: "", sourceOfFunds: "", idFile: "" }]);
  const removeBO = (i: number) => setBOwners(p => p.filter((_, idx) => idx !== i));
  const updateBO = (i: number, k: string, v: string) =>
    setBOwners(p => p.map((d, idx) => idx === i ? { ...d, [k]: v } : d));

  // ── Section E2: PPADB Registration Codes ────────────────────────────────
  const [ppadbCodes, setPpadbCodes] = useState<string[]>([]);
  const togglePpadb = (code: string) =>
    setPpadbCodes(p => p.includes(code) ? p.filter(c => c !== code) : [...p, code]);

  // ── Section H: Contact Person ────────────────────────────────────────────
  const [contact, setContact] = useState({ name: "", designation: "", tel: "", mobile: "", email: "" });
  const setCt = (k: string, v: string) => setContact(p => ({ ...p, [k]: v }));

  // ── Section I: Banking Details ───────────────────────────────────────────
  const [bank, setBank] = useState({ bankName: "", branch: "", accountNo: "", accountType: "", swiftCode: "" });
  const setB = (k: string, v: string) => setBank(p => ({ ...p, [k]: v }));

  // ── Section J: Tax Compliance ────────────────────────────────────────────
  const [tax, setTax] = useState({ tinNo: "", itfCertNo: "", itfExpiry: "", vatRegNo: "" });
  const setT = (k: string, v: string) => setTax(p => ({ ...p, [k]: v }));

  // ── Section K: Documents checklist ──────────────────────────────────────
  const [docs, setDocs] = useState({
    certOfIncorp: false, cr14: false, taxClearance: false,
    vatCert: false, auditedAccounts: false, profileBrochure: false,
    idCopies: false, proofOfAddress: false,
  });
  const toggleDoc = (k: keyof typeof docs) => setDocs(p => ({ ...p, [k]: !p[k] }));

  // ── Section L: Declaration ───────────────────────────────────────────────
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryDesignation, setSignatoryDesignation] = useState("");
  const [declarationDate, setDeclarationDate] = useState("");

  // ── Submit ───────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!appType) errs.push("Please select application type (New Application or Change of Status).");
    if (!ownership) errs.push("Please select company ownership structure.");
    if (!company.name) errs.push("Company name is required.");
    if (!company.regNo) errs.push("Company registration number is required.");
    if (!company.email) errs.push("Company email is required.");
    if (!tax.tinNo) errs.push("Tax Identification Number (TIN) is required.");
    if (!declarationAccepted) errs.push("You must accept the declaration to submit.");
    if (!signatoryName) errs.push("Signatory name is required.");
    if (errs.length > 0) { setErrors(errs); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setErrors([]);
    pushNotification(`Supplier registration submitted: ${company.name} — Ref: ${refNo}`, "success");
    toast("Registration submitted successfully. You will receive a confirmation email within 2 business days.", "success");
    setSubmitted(true);
  };

  // ── Success screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="page-standalone w-full bg-[#EAF1F8] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-black/10 p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-[#0F172A]" />
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">Registration Submitted</h1>
          <p className="text-black/60 mb-4">Your supplier registration has been submitted successfully.</p>
          <div className="bg-[#f0f8f0] border border-slate-200 rounded-lg px-6 py-4 inline-block mb-6">
            <div className="text-xs text-black/50 mb-1">Reference Number</div>
            <div className="text-lg font-mono font-bold text-[#0F172A]">{refNo}</div>
          </div>
          <p className="text-sm text-black/50 mb-6">
            Keep this reference number for tracking your application. You will receive an email confirmation within 2 business days.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => window.print()} className="flex items-center gap-2 h-10 px-5 rounded-lg border border-black/15 text-sm font-medium hover:bg-black/5 transition-colors">
              <Printer className="h-4 w-4" /> Print Receipt
            </button>
            <button onClick={() => navigate("/supplier-portal")} className="flex items-center gap-2 h-10 px-5 rounded-lg bg-[#2563eb] text-white text-sm font-medium hover:bg-[#1d4ed8] transition-colors">
              Go to Supplier Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-standalone w-full bg-[#EAF1F8]">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-32">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="text-center mb-6 border-b-2 border-[#0f172a] pb-4">
          <div className="text-xs text-black/40 mb-1 tracking-widest uppercase">Government of Zimbabwe · AI-Powered Electronic Government Procurement &amp; Automated Oversight Intelligence System</div>
          <h1 className="text-2xl font-black text-black tracking-wide uppercase">Supplier Registration Form</h1>
          <div className="text-xs text-black/50 mt-1">Procurement Regulatory Authority of Zimbabwe (PRAZ)</div>
          <div className="mt-2 inline-block bg-[#0f172a] text-white text-xs px-3 py-1 rounded-full font-mono">
            Ref: {refNo}
          </div>
          <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs text-[#0F172A] flex items-center justify-center gap-2">
            <span>⚠️</span>
            <span>These supplier registration forms must match across the system. All fields are standardised with the online Vendor Registration Portal.</span>
          </div>
        </div>

        {/* ── Errors ──────────────────────────────────────────────────── */}
        {errors.length > 0 && (
          <div className="mb-5 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-red-700">Please fix the following errors:</span>
            </div>
            <ul className="space-y-1">
              {errors.map((e, i) => <li key={i} className="text-xs text-red-600 flex items-start gap-1.5"><span className="mt-0.5">•</span>{e}</li>)}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── SECTION A: Application Type ────────────────────────────── */}
          <div className="border border-black/12 rounded-lg overflow-hidden">
            <SectionTitle>A. Tick Where Applicable</SectionTitle>
            <div className="p-4 bg-white">
              <div className="flex flex-wrap gap-6">
                <Checkbox checked={appType === "new"} onChange={() => setAppType(appType === "new" ? "" : "new")}
                  label="NEW APPLICATION" bold />
                <Checkbox checked={appType === "change"} onChange={() => setAppType(appType === "change" ? "" : "change")}
                  label="NOTIFICATION OF CHANGE OF STATUS" bold />
              </div>
            </div>
          </div>

          {/* ── SECTION B: Ownership Structure ─────────────────────────── */}
          <div className="border border-black/12 rounded-lg overflow-hidden">
            <SectionTitle>B. Company Ownership Structure</SectionTitle>
            <div className="p-4 bg-white">
              <div className="flex flex-wrap gap-6">
                {([
                  ["citizen", "Citizen Owned"],
                  ["foreign",  "Foreign Owned"],
                  ["joint",    "Joint Venture"],
                ] as const).map(([val, label]) => (
                  <Checkbox key={val}
                    checked={ownership === val}
                    onChange={() => setOwnership(ownership === val ? "" : val)}
                    label={label} />
                ))}
              </div>
            </div>
          </div>

          {/* ── SECTION C: Company Category ────────────────────────────── */}
          <div className="border border-black/12 rounded-lg overflow-hidden">
            <SectionTitle>C. Company Category</SectionTitle>
            <div className="p-4 bg-white space-y-3">
              <p className="text-xs text-black/50 italic">
                Supplier can select more than one group if they qualify. Attach supporting documents as proof.
              </p>
              <div className="flex flex-wrap gap-4">
                {([
                  ["youth",           "Youth"],
                  ["women",           "Women"],
                  ["pld",             "PLD (Persons Living with Disability)"],
                  ["ruralLocation",   "Rural Location"],
                  ["edd",             "EDD (Economically Disadvantaged)"],
                  ["bidPublicOfficers","Bid Public Officers"],
                  ["ovcs",            "OVCs (Orphans & Vulnerable Children)"],
                ] as [keyof typeof categories, string][]).map(([k, label]) => (
                  <Checkbox key={k} checked={categories[k]} onChange={() => toggleCat(k)} label={label} />
                ))}
              </div>
            </div>
          </div>

          {/* ── SECTION D: Sector & Industry ───────────────────────────── */}
          <div className="border border-black/12 rounded-lg overflow-hidden">
            <SectionTitle>D. Sector, Industry &amp; Works Contractor Size</SectionTitle>
            <div className="p-4 bg-white space-y-4">
              <div>
                <div className="text-xs font-bold text-black/60 uppercase tracking-wider mb-2">Sector</div>
                <div className="flex flex-wrap gap-5">
                  {([["supplies","Supplies"],["services","Services"],["contractor","Contractor"]] as const).map(([k,l]) => (
                    <Checkbox key={k} checked={sectors[k]} onChange={() => setSectors(p=>({...p,[k]:!p[k]}))} label={l} />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-black/60 uppercase tracking-wider mb-2">Industry</div>
                <div className="flex flex-wrap gap-5">
                  {([["manufacturing","Manufacturing"],["mining","Mining"],["agriculture","Agriculture"],["other","Other"]] as const).map(([k,l]) => (
                    <Checkbox key={k} checked={industries[k]} onChange={() => setIndustries(p=>({...p,[k]:!p[k]}))} label={l} />
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-black/60 uppercase tracking-wider mb-2">Works Contractor Size</div>
                <div className="flex flex-wrap gap-5">
                  {(["E","D","C","B"] as const).map(cls => (
                    <Checkbox key={cls}
                      checked={contractorSize === cls}
                      onChange={() => setContractorSize(contractorSize === cls ? "" : cls)}
                      label={`${cls}-Class`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION E: Supplier Codes ───────────────────────────────── */}
          <div className="border border-black/12 rounded-lg overflow-hidden">
            <SectionTitle>E. Supplier Codes (from dropdown — add applicable codes)</SectionTitle>
            <div className="p-4 bg-white">
              <p className="text-xs text-black/50 italic mb-3">From the drop down menu, add the supplier codes applicable to your business.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black/10">
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/50 w-8">#</th>
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/50 w-40">Supplier Code</th>
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/50">Description</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((c, i) => (
                      <CodeRow key={i} idx={i} code={c.code} desc={c.desc}
                        onRemove={() => removeCode(i)}
                        onChange={(k, v) => updateCode(i, k, v)} />
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addCode}
                className="mt-3 flex items-center gap-1.5 text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Code
              </button>
            </div>
          </div>

          {/* ── SECTION F: Company Details ──────────────────────────────── */}
          <div className="border border-black/12 rounded-lg overflow-hidden">
            <SectionTitle>F. Company Details</SectionTitle>
            <div className="p-4 bg-white space-y-1">
              <FieldRow label="Company Name" required>
                <input value={company.name} onChange={e=>setC("name",e.target.value)} placeholder="Registered company name" className={inp} />
              </FieldRow>
              <FieldRow label="Company Reg. No." required>
                <input value={company.regNo} onChange={e=>setC("regNo",e.target.value)} placeholder="e.g. 123/2024" className={inp} />
              </FieldRow>
              <FieldRow label="Date of Registration" required>
                <input type="date" value={company.dateOfReg} onChange={e=>setC("dateOfReg",e.target.value)} className={inp} />
              </FieldRow>
              <FieldRow label="VAT Registration No.">
                <input value={company.vatNo} onChange={e=>setC("vatNo",e.target.value)} placeholder="e.g. ZW-VAT-000000" className={inp} />
              </FieldRow>
              <FieldRow label="BP Number">
                <input value={company.bpNo} onChange={e=>setC("bpNo",e.target.value)} placeholder="Business Partner No." className={inp} />
              </FieldRow>
              <FieldRow label="Physical Address" required>
                <input value={company.physicalAddress} onChange={e=>setC("physicalAddress",e.target.value)} placeholder="Street address" className={inp} />
              </FieldRow>
              <FieldRow label="City / Town">
                <input value={company.city} onChange={e=>setC("city",e.target.value)} placeholder="e.g. Harare" className={inp} />
              </FieldRow>
              <FieldRow label="Province">
                <select value={company.province} onChange={e=>setC("province",e.target.value)} className={sel}>
                  <option value="">Select province…</option>
                  {["Harare","Bulawayo","Manicaland","Mashonaland Central","Mashonaland East","Mashonaland West",
                    "Masvingo","Matabeleland North","Matabeleland South","Midlands"].map(p=>(
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </FieldRow>
              <FieldRow label="Postal Address">
                <input value={company.postalAddress} onChange={e=>setC("postalAddress",e.target.value)} placeholder="P.O. Box / Bag" className={inp} />
              </FieldRow>
              <FieldRow label="Country">
                <input value={company.country} onChange={e=>setC("country",e.target.value)} className={inp} />
              </FieldRow>
              <FieldRow label="Telephone">
                <input value={company.tel} onChange={e=>setC("tel",e.target.value)} placeholder="+263 4 000 0000" className={inp} />
              </FieldRow>
              <FieldRow label="Mobile">
                <input value={company.mobile} onChange={e=>setC("mobile",e.target.value)} placeholder="+263 77 000 0000" className={inp} />
              </FieldRow>
              <FieldRow label="Fax">
                <input value={company.fax} onChange={e=>setC("fax",e.target.value)} placeholder="+263 4 000 0001" className={inp} />
              </FieldRow>
              <FieldRow label="Email Address" required>
                <input type="email" value={company.email} onChange={e=>setC("email",e.target.value)} placeholder="procurement@company.co.zw" className={inp} />
              </FieldRow>
              <FieldRow label="Website">
                <input value={company.website} onChange={e=>setC("website",e.target.value)} placeholder="https://www.company.co.zw" className={inp} />
              </FieldRow>
            </div>
          </div>

          {/* ── SECTION E2: PPADB Registration Codes ───────────────────── */}
          <div className="border border-black/12 rounded-lg overflow-hidden">
            <SectionTitle>E2. PPADB Registration Codes (select all that apply)</SectionTitle>
            <div className="p-4 bg-white">
              <p className="text-xs text-black/50 italic mb-3">
                Select every Procurement Practitioners Board (PPADB) code your business is registered to bid under. This drives eligibility for filtered tender categories.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PPADB_CODES.map(c => {
                  const on = ppadbCodes.includes(c.code);
                  return (
                    <label key={c.code}
                      className={`flex items-center gap-2 border rounded px-3 py-2 cursor-pointer transition-colors ${on ? "border-[#2563eb] bg-slate-50" : "border-black/10 bg-white hover:border-[#2563eb]/40"}`}>
                      <input type="checkbox" checked={on} onChange={() => togglePpadb(c.code)}
                        className="h-4 w-4 accent-[#2563eb]" />
                      <span className="text-xs font-mono font-bold text-[#0f172a]">{c.code}</span>
                      <span className="text-xs text-black/70">{c.desc}</span>
                    </label>
                  );
                })}
              </div>
              {ppadbCodes.length > 0 && (
                <div className="mt-3 text-xs text-[#0F172A] bg-slate-50 border border-slate-200 rounded px-3 py-2">
                  <strong>{ppadbCodes.length}</strong> PPADB code{ppadbCodes.length !== 1 ? "s" : ""} selected — you will be notified of matching tenders.
                </div>
              )}
            </div>
          </div>

          {/* ── SECTION G: Directors / Partners ────────────────────────── */}
          <div className="border border-black/12 rounded-lg overflow-hidden">
            <SectionTitle>G. Directors / Partners / Shareholders</SectionTitle>
            <div className="p-4 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-black/10">
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/50 w-8">#</th>
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/50">Full Name</th>
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/50">ID / Passport No.</th>
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/50 w-20">Gender</th>
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/50 w-16">Shares %</th>
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/50">Nationality</th>
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/50 w-24">ID Copy</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {directors.map((d, i) => (
                      <DirectorRow key={i} idx={i} data={d} onRemove={() => removeDir(i)} onChange={(k,v) => updateDir(i,k,v)} />
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addDir}
                className="mt-3 flex items-center gap-1.5 text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Director / Partner
              </button>
            </div>
          </div>

          {/* ── SECTION G2: Beneficial Owners (KYC / AML) ─────────────── */}
          <div className="border-2 border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-[#0F172A] text-white text-sm font-bold px-4 py-2 rounded-t-lg tracking-wide uppercase">
              G2. Beneficial Owners (Ultimate Beneficial Owners — Regulatory KYC)
            </div>
            <div className="p-4 bg-white">
              <p className="text-xs text-black/60 italic mb-3">
                A <strong>Beneficial Owner</strong> is the natural person who ultimately owns or controls the company (directly or indirectly holding ≥ 10%). This is a separate, regulated disclosure distinct from Directors/Shareholders.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/60 w-8">#</th>
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/60">Full Name</th>
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/60">ID / Passport</th>
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/60 w-20">Gender</th>
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/60 w-24">% Ownership</th>
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/60">Nationality</th>
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/60">Source of Funds</th>
                      <th className="text-left py-2 pr-2 text-xs font-semibold text-black/60 w-24">ID Copy</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {bOwners.map((d, i) => (
                      <BOwnerRow key={i} idx={i} data={d} onRemove={() => removeBO(i)} onChange={(k,v) => updateBO(i,k,v)} />
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addBO}
                className="mt-3 flex items-center gap-1.5 text-xs text-[#0F172A] hover:text-[#0F172A] font-medium transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add Beneficial Owner
              </button>
            </div>
          </div>

          {/* ── SECTION H: Contact Person ───────────────────────────────── */}
          <div className="border border-black/12 rounded-lg overflow-hidden">
            <SectionTitle>H. Contact Person</SectionTitle>
            <div className="p-4 bg-white space-y-1">
              <FieldRow label="Full Name" required>
                <input value={contact.name} onChange={e=>setCt("name",e.target.value)} placeholder="Contact person full name" className={inp} />
              </FieldRow>
              <FieldRow label="Designation">
                <input value={contact.designation} onChange={e=>setCt("designation",e.target.value)} placeholder="e.g. Procurement Manager" className={inp} />
              </FieldRow>
              <FieldRow label="Telephone">
                <input value={contact.tel} onChange={e=>setCt("tel",e.target.value)} placeholder="+263 4 000 0000" className={inp} />
              </FieldRow>
              <FieldRow label="Mobile" required>
                <input value={contact.mobile} onChange={e=>setCt("mobile",e.target.value)} placeholder="+263 77 000 0000" className={inp} />
              </FieldRow>
              <FieldRow label="Email" required>
                <input type="email" value={contact.email} onChange={e=>setCt("email",e.target.value)} placeholder="contact@company.co.zw" className={inp} />
              </FieldRow>
            </div>
          </div>

          {/* ── SECTION I: Banking Details ──────────────────────────────── */}
          <div className="border border-black/12 rounded-lg overflow-hidden">
            <SectionTitle>I. Banking Details</SectionTitle>
            <div className="p-4 bg-white space-y-1">
              <FieldRow label="Bank Name" required>
                <select value={bank.bankName} onChange={e=>setB("bankName",e.target.value)} className={sel}>
                  <option value="">Select bank…</option>
                  {["CBZ Bank","FBC Bank","Stanbic Bank","Standard Chartered","Ecobank Zimbabwe","BancABC",
                    "NMB Bank","Nedbank Zimbabwe","ZB Bank","CABS","Steward Bank","Other"].map(b=>(
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </FieldRow>
              <FieldRow label="Branch">
                <input value={bank.branch} onChange={e=>setB("branch",e.target.value)} placeholder="Branch name / code" className={inp} />
              </FieldRow>
              <FieldRow label="Account Number" required>
                <input value={bank.accountNo} onChange={e=>setB("accountNo",e.target.value)} placeholder="Account number" className={inp} />
              </FieldRow>
              <FieldRow label="Account Type">
                <select value={bank.accountType} onChange={e=>setB("accountType",e.target.value)} className={sel}>
                  <option value="">Select type…</option>
                  <option>Current Account</option>
                  <option>Savings Account</option>
                  <option>NOSTRO Account</option>
                </select>
              </FieldRow>
              <FieldRow label="SWIFT / BIC Code">
                <input value={bank.swiftCode} onChange={e=>setB("swiftCode",e.target.value)} placeholder="e.g. CBZWZWHX" className={inp} />
              </FieldRow>
            </div>
          </div>

          {/* ── SECTION J: Tax Compliance ───────────────────────────────── */}
          <div className="border border-black/12 rounded-lg overflow-hidden">
            <SectionTitle>J. Tax Compliance</SectionTitle>
            <div className="p-4 bg-white space-y-1">
              <FieldRow label="Tax Identification No. (TIN)" required>
                <input value={tax.tinNo} onChange={e=>setT("tinNo",e.target.value)} placeholder="TIN-XXXXXXXXX" className={inp} />
              </FieldRow>
              <FieldRow label="ITF-263 Certificate No.">
                <input value={tax.itfCertNo} onChange={e=>setT("itfCertNo",e.target.value)} placeholder="Certificate number" className={inp} />
              </FieldRow>
              <FieldRow label="ITF-263 Expiry Date">
                <input type="date" value={tax.itfExpiry} onChange={e=>setT("itfExpiry",e.target.value)} className={inp} />
              </FieldRow>
              <FieldRow label="VAT Registration No.">
                <input value={tax.vatRegNo} onChange={e=>setT("vatRegNo",e.target.value)} placeholder="VAT Reg. No." className={inp} />
              </FieldRow>
            </div>
          </div>

          {/* ── SECTION K: Documents Checklist ─────────────────────────── */}
          <div className="border border-black/12 rounded-lg overflow-hidden">
            <SectionTitle>K. Documents to be Attached (tick submitted documents)</SectionTitle>
            <div className="p-4 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {([
                  ["certOfIncorp",    "Certificate of Incorporation"],
                  ["cr14",           "CR14 — List of Directors"],
                  ["taxClearance",   "Tax Clearance Certificate (ITF-263)"],
                  ["vatCert",        "VAT Registration Certificate"],
                  ["auditedAccounts","Latest Audited Financial Statements"],
                  ["profileBrochure","Company Profile / Brochure"],
                  ["idCopies",       "Certified Copies of Directors' IDs"],
                  ["proofOfAddress", "Proof of Physical Address"],
                ] as [keyof typeof docs, string][]).map(([k, label]) => (
                  <div key={k} className="flex items-center justify-between border border-black/8 rounded-lg px-3 py-2 bg-[#fafafa]">
                    <span className="text-sm text-black/70">{label}</span>
                    <div className="flex items-center gap-3">
                      <Checkbox checked={docs[k]} onChange={() => toggleDoc(k)} label="" />
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-[#2563eb] hover:text-[#1d4ed8] font-medium">
                        <Upload className="h-3.5 w-3.5" /> Upload
                        <input type="file" className="hidden" accept=".pdf,.jpg,.png" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── SECTION L: Declaration ──────────────────────────────────── */}
          <div className="border-2 border-[#0f172a] rounded-lg overflow-hidden">
            <SectionTitle>L. Declaration</SectionTitle>
            <div className="p-4 bg-white space-y-4">
              <div className="bg-[#f8f9fa] border border-black/8 rounded-lg p-4 text-sm text-black/70 leading-relaxed">
                I/We the undersigned, being duly authorised representative(s) of the above company/firm,
                hereby declare that:
                <ul className="list-disc ml-5 mt-2 space-y-1">
                  <li>All information provided in this form is true, correct and complete.</li>
                  <li>The company is not debarred, blacklisted or under investigation by any government authority.</li>
                  <li>No director, partner or shareholder is an employee of the procuring entity.</li>
                  <li>The company complies with all applicable laws and regulations of Zimbabwe.</li>
                  <li>We understand that providing false information is a criminal offence and may result in deregistration.</li>
                </ul>
              </div>
              <Checkbox
                checked={declarationAccepted}
                onChange={() => setDeclarationAccepted(v => !v)}
                label="I/We accept and confirm the above declaration"
                bold
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <FieldRow label="Signatory Name">
                  <input value={signatoryName} onChange={e=>setSignatoryName(e.target.value)}
                    placeholder="Full name" className={inp} />
                </FieldRow>
                <FieldRow label="Designation">
                  <input value={signatoryDesignation} onChange={e=>setSignatoryDesignation(e.target.value)}
                    placeholder="e.g. Director" className={inp} />
                </FieldRow>
                <FieldRow label="Date">
                  <input type="date" value={declarationDate} onChange={e=>setDeclarationDate(e.target.value)} className={inp} />
                </FieldRow>
              </div>
            </div>
          </div>

          {/* ── Submit bar ──────────────────────────────────────────────── */}
          <div className="mt-6 bg-white border-t-2 border-[#0f172a] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl shadow-2xl">
            <p className="text-xs text-black/50">
              Fields marked <span className="text-red-500 font-bold">*</span> are required.
              Ensure all documents are attached before submitting.
            </p>
            <div className="flex gap-3 flex-shrink-0">
              <button type="button" onClick={() => window.print()}
                className="flex items-center gap-2 h-10 px-4 rounded-lg border border-black/15 text-sm font-medium hover:bg-black/5 transition-colors">
                <Printer className="h-4 w-4" /> Print
              </button>
              <button type="submit"
                className="flex items-center gap-2 h-10 px-6 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-bold transition-colors shadow-md">
                <Save className="h-4 w-4" /> Submit Registration
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}


