import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppShell, Card, CardHeader, Badge , PageContextBar } from "@/components/AppShell";
import { toast } from "@/lib/toast";
import { pushNotification } from "@/lib/local-store";
import {
  ArrowLeft, FileText, Building2, Tag, Banknote, Calendar, Clock,
  Users, Timer, Download, Send, Eye, ChevronRight, CheckCircle2,
  AlertTriangle, Info, MapPin, Phone, Mail, Globe, Printer,
  Lock, Unlock, Shield, Award, X, Plus, FileDown, MessageSquare,
  UserCircle2, ChevronDown, ChevronUp,
} from "lucide-react";
import { ZW_MINISTRIES } from "@/lib/zw-ministries";

// -- Types --
const TENDER_STAGES = [
  { key: "preparation",    label: "Preparation",     icon: FileText    },
  { key: "approval",       label: "Approval",         icon: Shield      },
  { key: "publication",    label: "Publication",      icon: Globe       },
  { key: "clarifications", label: "Clarifications",   icon: Info        },
  { key: "bidding",        label: "Bidding",          icon: Users       },
  { key: "opening",        label: "Bid Opening",      icon: Unlock      },
  { key: "evaluation",     label: "Evaluation",       icon: Eye         },
  { key: "award",          label: "Award",            icon: Award       },
] as const;

type StageKey = typeof TENDER_STAGES[number]["key"];

// -- Mock tender data map --
const MOCK_DETAIL: Record<string, {
  id: string; title: string; entity: string; ministry: string;
  department: string; category: string; method: string;
  estimatedValue: string; currency: string;
  status: string; bids: number; currentStage: StageKey;
  publishedDate: string; bidOpenDate: string;
  bidCloseDate: string; bidOpeningDate: string;
  preBidDate: string; preBidLocation: string;
  documentFee: string; emd: string; performanceBond: string;
  description: string; scope: string; validityDays: number;
  relaxationMinutes: number; fundingSource: string;
  contactName: string; contactEmail: string; contactPhone: string;
  documents: { name: string; size: string; type: string }[];
  timeline: { stage: string; date: string; status: "done" | "active" | "pending" }[];
  bidders: {
    name: string;
    submitted: string;
    status: string;
    reviewStatus: "Under Review" | "Assessed" | "Done";
    contact: string;
    email: string;
    phone: string;
    regNo: string;
    country: string;
    experience: string;
    category: string;
    certifications: string[];
    pastProjects: string[];
  }[];
  qa: { q: string; a: string; date: string }[];
}> = {
  "ZW-PRA-2026-00184": {
    id: "ZW-PRA-2026-00184",
    title: "Supply & Installation of Solar Mini-Grids — 12 Rural Clinics",
    entity: "Ministry of Energy and Power Development",
    ministry: "moepd", department: "Renewable Energy",
    category: "Energy & Power", method: "Open Competitive",
    estimatedValue: "14,800,000", currency: "USD",
    status: "Bidding Open", bids: 11, currentStage: "bidding",
    publishedDate: "2026-05-01T08:00",
    bidOpenDate: "2026-05-20T09:00",
    bidCloseDate: "2026-07-08T16:00",
    bidOpeningDate: "2026-07-09T10:00",
    preBidDate: "2026-05-25T10:00",
    preBidLocation: "Ministry of Energy Boardroom, Livingstone House, Harare",
    documentFee: "USD 500", emd: "USD 148,000", performanceBond: "10%",
    fundingSource: "Government of Zimbabwe — Treasury",
    description: "Supply, installation, commissioning and 5-year maintenance of solar mini-grid systems at 12 rural clinics across Mashonaland West, Midlands, Manicaland and Masvingo provinces.",
    scope: "Scope includes: PV panels (min. 50kWp per site), battery storage (min. 100kWh), inverters, distribution boards, protective equipment, grid synchronisation, commissioning, handover training and 5-year O&M contract.",
    validityDays: 120, relaxationMinutes: 30,
    contactName: "Mrs. T. Nyoni (Procurement Officer)",
    contactEmail: "tenders@energy.gov.zw",
    contactPhone: "+263 4 706 830",
    documents: [
      { name: "Invitation to Tender", size: "2.4 MB", type: "PDF" },
      { name: "Technical Specifications", size: "8.1 MB", type: "PDF" },
      { name: "Bill of Quantities", size: "1.8 MB", type: "Excel" },
      { name: "General Conditions of Contract", size: "3.2 MB", type: "PDF" },
      { name: "Bid Submission Forms", size: "0.9 MB", type: "PDF" },
      { name: "Site Visit Report", size: "5.6 MB", type: "PDF" },
    ],
    timeline: [
      { stage: "Preparation",   date: "2026-04-01", status: "done"    },
      { stage: "Approval",      date: "2026-04-28", status: "done"    },
      { stage: "Publication",   date: "2026-05-01", status: "done"    },
      { stage: "Clarifications",date: "2026-05-25", status: "done"    },
      { stage: "Bidding",       date: "2026-07-08", status: "active"  },
      { stage: "Bid Opening",   date: "2026-07-09", status: "pending" },
      { stage: "Evaluation",    date: "2026-07-30", status: "pending" },
      { stage: "Award",         date: "2026-08-15", status: "pending" },
    ],
    bidders: [
      {
        name: "SunPower Zimbabwe (Pvt) Ltd",
        submitted: "2026-06-10", status: "Registered", reviewStatus: "Assessed",
        contact: "Mr. T. Mupfumi", email: "t.mupfumi@sunpowerzw.co.zw", phone: "+263 77 312 4400",
        regNo: "ZW/BRE/2018/04821", country: "Zimbabwe", experience: "9 years",
        category: "Renewable Energy — Solar Systems",
        certifications: ["ISO 9001:2015", "ZESA Approved Installer", "SEI Solar Professional"],
        pastProjects: ["ZETDC Rural Electrification (USD 2.4M)", "Harare Hospital Solar (USD 800K)", "Midlands Schools Grid (USD 1.1M)"],
      },
      {
        name: "Highveld Engineering (Pvt) Ltd",
        submitted: "2026-06-12", status: "Registered", reviewStatus: "Under Review",
        contact: "Ms. R. Chikwanda", email: "r.chikwanda@highveld.co.zw", phone: "+263 71 584 2201",
        regNo: "ZW/BRE/2015/03144", country: "Zimbabwe", experience: "12 years",
        category: "Electrical & Mechanical Engineering",
        certifications: ["ISO 14001:2015", "ERB Registered", "ZESA Class A Contractor"],
        pastProjects: ["Bulawayo Water Works Electrification (USD 3.2M)", "ZETDC HV Lines (USD 5.1M)", "Victoria Falls Airport Power (USD 900K)"],
      },
      {
        name: "Africa Solar Solutions Ltd",
        submitted: "2026-06-14", status: "Registered", reviewStatus: "Under Review",
        contact: "Mr. K. Asante", email: "k.asante@africasolarsolutions.com", phone: "+263 78 904 1122",
        regNo: "ZW/BRE/2020/07341", country: "Zimbabwe / South Africa", experience: "7 years",
        category: "Renewable Energy — Solar & Storage",
        certifications: ["SAPVIA Accredited", "IEC 62109 Certified Products"],
        pastProjects: ["Zambia Rural Clinics Solar (USD 4.8M)", "Mozambique Border Posts (USD 1.9M)"],
      },
      {
        name: "Harare Green Energy Co.",
        submitted: "2026-06-15", status: "Registered", reviewStatus: "Done",
        contact: "Eng. J. Zimba", email: "j.zimba@harareenergy.co.zw", phone: "+263 4 708 993",
        regNo: "ZW/BRE/2019/05988", country: "Zimbabwe", experience: "6 years",
        category: "Renewable Energy — Solar PV",
        certifications: ["ERB Registered", "SEI Solar Professional"],
        pastProjects: ["Masvingo Solar Irrigation (USD 750K)", "Harare City Council Offices (USD 420K)"],
      },
    ],
    qa: [
      { q: "Can a JV bid?", a: "Yes. Joint ventures are permitted provided the lead partner holds ≥51% stake.", date: "2026-05-28" },
      { q: "Is the Pre-Bid meeting mandatory?", a: "Attendance is highly recommended but not mandatory. Minutes will be published.", date: "2026-05-26" },
      { q: "What is the minimum experience requirement?", a: "Minimum 5 years in solar installation with at least 3 projects ≥USD 1M each.", date: "2026-05-29" },
    ],
  },
  "ZW-PRA-2026-00183": {
    id: "ZW-PRA-2026-00183",
    title: "Procurement of Antiretroviral Medicines (2-Year Framework)",
    entity: "Ministry of Health and Child Care",
    ministry: "moh", department: "Pharmacy and Medicines",
    category: "Health & Pharmaceuticals", method: "Framework Agreement",
    estimatedValue: "42,500,000", currency: "USD",
    status: "Evaluation", bids: 8, currentStage: "evaluation",
    publishedDate: "2026-03-15T08:00",
    bidOpenDate: "2026-04-01T09:00",
    bidCloseDate: "2026-06-12T16:00",
    bidOpeningDate: "2026-06-13T10:00",
    preBidDate: "2026-04-10T10:00",
    preBidLocation: "MOH Conference Hall, Kaguvi Building",
    documentFee: "USD 1,000", emd: "USD 425,000", performanceBond: "10%",
    fundingSource: "Government of Zimbabwe / Global Fund",
    description: "National 2-year framework agreement for the supply of essential antiretroviral medicines.",
    scope: "TDF/3TC 300/300mg, EFV 600mg, DTG 50mg and paediatric formulations. Estimated 1.4 million patient-months annually.",
    validityDays: 180, relaxationMinutes: 0,
    contactName: "Mr. G. Rusike (Procurement Manager)",
    contactEmail: "procurement@mohcc.gov.zw",
    contactPhone: "+263 4 730 021",
    documents: [
      { name: "Request for Proposal", size: "3.8 MB", type: "PDF" },
      { name: "Technical Specifications", size: "6.2 MB", type: "PDF" },
      { name: "Framework Agreement Template", size: "2.1 MB", type: "PDF" },
    ],
    timeline: [
      { stage: "Preparation",   date: "2026-02-15", status: "done"   },
      { stage: "Approval",      date: "2026-03-10", status: "done"   },
      { stage: "Publication",   date: "2026-03-15", status: "done"   },
      { stage: "Clarifications",date: "2026-04-10", status: "done"   },
      { stage: "Bidding",       date: "2026-06-12", status: "done"   },
      { stage: "Bid Opening",   date: "2026-06-13", status: "done"   },
      { stage: "Evaluation",    date: "2026-07-10", status: "active" },
      { stage: "Award",         date: "2026-07-30", status: "pending"},
    ],
    bidders: [
      {
        name: "Zimbabwe Pharma Holdings",
        submitted: "2026-05-20", status: "Under Evaluation", reviewStatus: "Assessed",
        contact: "Dr. P. Mhuriro", email: "p.mhuriro@zpharma.co.zw", phone: "+263 4 703 441",
        regNo: "ZW/BRE/2010/01248", country: "Zimbabwe", experience: "15 years",
        category: "Pharmaceuticals & Medical Supplies",
        certifications: ["WHO GMP Certified", "MCAZ Registered", "ISO 9001:2015"],
        pastProjects: ["MOHCC ARV Supply 2023 (USD 18M)", "UNFPA Contraceptive Procurement (USD 4.2M)", "UNICEF Paediatric Medicines (USD 2.8M)"],
      },
      {
        name: "NATPHARM",
        submitted: "2026-05-22", status: "Under Evaluation", reviewStatus: "Under Review",
        contact: "Mr. D. Machingura", email: "procurement@natpharm.co.zw", phone: "+263 4 621 050",
        regNo: "ZW/PARA/1982/00001", country: "Zimbabwe", experience: "40 years",
        category: "Pharmaceuticals — National Distributor",
        certifications: ["WHO Prequalified", "MCAZ Licensed", "GDP Compliant"],
        pastProjects: ["National ARV Programme 2020–2024", "COVID-19 Vaccine Cold Chain (USD 6M)", "Essential Medicines Supply (USD 22M/yr)"],
      },
      {
        name: "Africa Health Supplies Ltd",
        submitted: "2026-05-25", status: "Under Evaluation", reviewStatus: "Done",
        contact: "Ms. A. Nkomo", email: "a.nkomo@africahealth.com", phone: "+263 77 201 3344",
        regNo: "ZW/BRE/2017/06112", country: "Zimbabwe / Kenya", experience: "10 years",
        category: "Pharmaceuticals & Healthcare Logistics",
        certifications: ["ISO 13485", "KEBS Approved", "MCAZ Licensed Importer"],
        pastProjects: ["East Africa ARV Framework (USD 11M)", "PEPFAR Supply Chain Support (USD 7.4M)"],
      },
    ],
    qa: [
      { q: "Are generic ARVs acceptable?", a: "Yes, provided they carry WHO pre-qualification or equivalent NRA approval.", date: "2026-04-12" },
    ],
  },
};

// Fallback tender
const DEFAULT_TENDER = MOCK_DETAIL["ZW-PRA-2026-00184"];

// -- Countdown Timer --
function CountdownTimer({ target, label, color = "text-[#0F172A]" }: { target: string; label: string; color?: string }) {
  const [diff, setDiff] = useState(new Date(target).getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(new Date(target).getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  if (diff <= 0) return <span className={`text-xs font-medium text-red-500`}>{label}: Expired</span>;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return (
    <div className="flex items-center gap-1.5">
      <Timer className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className={`text-xs font-mono font-bold ${color}`}>{d > 0 ? `${d}d ` : ""}{h}h {m}m {s}s</span>
    </div>
  );
}

// -- EOI Modal --
function EOIModal({ tender, onClose }: { tender: typeof DEFAULT_TENDER; onClose: () => void }) {
  const [form, setForm] = useState({ company: "", contact: "", email: "", phone: "", regNo: "", experience: "", statement: "" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const inp = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  const submit = () => {
    if (!form.company || !form.email) { toast("Company name and email are required", "warning"); return; }
    pushNotification(`EOI submitted for ${tender.id} by ${form.company}`, "success");
    toast(`EOI submitted successfully for ${tender.id}`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border border-border my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold">Expression of Interest</h2>
            <p className="text-xs text-muted-foreground">{tender.id} — {tender.title.slice(0, 50)}…</p>
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="p-6 space-y-3">
          <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company / Organisation Name *</label>
            <input className={`${inp} mt-1`} value={form.company} onChange={e => set("company", e.target.value)} placeholder="e.g. Highveld Engineering (Pvt) Ltd" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Person</label>
              <input className={`${inp} mt-1`} value={form.contact} onChange={e => set("contact", e.target.value)} /></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Registration No.</label>
              <input className={`${inp} mt-1`} value={form.regNo} onChange={e => set("regNo", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email *</label>
              <input type="email" className={`${inp} mt-1`} value={form.email} onChange={e => set("email", e.target.value)} /></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</label>
              <input className={`${inp} mt-1`} value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
          </div>
          <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Years of Relevant Experience</label>
            <input type="number" className={`${inp} mt-1`} value={form.experience} onChange={e => set("experience", e.target.value)} /></div>
          <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statement of Interest</label>
            <textarea className={`${inp} mt-1`} rows={3} value={form.statement} onChange={e => set("statement", e.target.value)}
              placeholder="Briefly describe your capability and interest in this tender…" /></div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm hover:bg-secondary">Cancel</button>
          <button onClick={submit} className="h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5">
            <Send className="h-4 w-4" /> Submit EOI
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Bidder Profile Modal --
type Bidder = typeof DEFAULT_TENDER.bidders[0];

function BidderProfileModal({ bidder, onClose }: { bidder: Bidder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg border border-border my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserCircle2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">{bidder.name}</h2>
              <p className="text-xs text-muted-foreground">{bidder.regNo}</p>
            </div>
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Contact Person", value: bidder.contact },
              { label: "Country", value: bidder.country },
              { label: "Experience", value: bidder.experience },
              { label: "Category", value: bidder.category },
            ].map(row => (
              <div key={row.label} className="bg-secondary/40 rounded-xl p-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">{row.label}</div>
                <div className="text-sm font-medium text-foreground">{row.value}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <a href={`mailto:${bidder.email}`} className="text-primary hover:underline truncate text-xs">{bidder.email}</a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs">{bidder.phone}</span>
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Certifications</div>
            <div className="flex flex-wrap gap-1.5">
              {bidder.certifications.map(c => (
                <span key={c} className="text-[11px] bg-slate-50 text-[#0F172A] border border-slate-200 px-2 py-0.5 rounded-full font-medium">{c}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Past Projects</div>
            <ul className="space-y-1.5">
              {bidder.pastProjects.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-border">
          <button onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm hover:bg-secondary">Close</button>
        </div>
      </div>
    </div>
  );
}

// -- Review Status helpers --
const REVIEW_STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  "Under Review": { bg: "bg-slate-50 border-slate-200",  text: "text-[#0F172A]",  dot: "bg-slate-400"  },
  "Assessed":     { bg: "bg-slate-50 border-slate-200",    text: "text-[#0F172A]",   dot: "bg-[#0F172A]"   },
  "Done":         { bg: "bg-slate-50 border-slate-200", text: "text-[#0F172A]", dot: "bg-[#0F172A]" },
};

// -- Bidder Card --
function BidderCard({ bidder, tenderId, onViewProfile }: {
  bidder: Bidder;
  tenderId: string;
  onViewProfile: (b: Bidder) => void;
}) {
  const [msgOpen, setMsgOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<{ text: string; time: string }[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const rs = REVIEW_STATUS_STYLES[bidder.reviewStatus] ?? REVIEW_STATUS_STYLES["Under Review"];

  const sendMsg = () => {
    const text = draft.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setSent(prev => [...prev, { text, time }]);
    setDraft("");
    toast(`Message sent to ${bidder.name}`, "success");
    pushNotification(`Procurement notice sent to ${bidder.name} (${tenderId})`, "info");
  };

  useEffect(() => {
    if (msgOpen && endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [sent, msgOpen]);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-start justify-between p-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">{bidder.name}</div>
            <div className="text-xs text-muted-foreground">{bidder.contact} · Submitted {bidder.submitted}</div>
          </div>
        </div>
        {/* Review status badge */}
        <span className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${rs.bg} ${rs.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${rs.dot}`} />
          {bidder.reviewStatus}
        </span>
      </div>

      {/* Contact row */}
      <div className="px-4 pb-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{bidder.email}</span>
        <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{bidder.phone}</span>
      </div>

      {/* Bid status chip */}
      <div className="px-4 pb-3">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${bidder.status.includes("Evaluation") ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>
          {bidder.status}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 pb-4 border-t border-border pt-3">
        <button
          onClick={() => onViewProfile(bidder)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors"
        >
          <Eye className="h-3.5 w-3.5" /> View Profile
        </button>
        <button
          onClick={() => setMsgOpen(v => !v)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Send Notice
          {sent.length > 0 && (
            <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
              {sent.length}
            </span>
          )}
          {msgOpen ? <ChevronUp className="h-3 w-3 opacity-60" /> : <ChevronDown className="h-3 w-3 opacity-60" />}
        </button>
      </div>

      {/* One-way messaging panel */}
      {msgOpen && (
        <div className="border-t border-border bg-secondary/20">
          {/* Sent messages */}
          <div className="max-h-48 overflow-y-auto px-4 py-3 space-y-2">
            {sent.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-3">
                No notices sent yet. Messages here are one-way — the bidder cannot reply.
              </p>
            ) : (
              sent.map((m, i) => (
                <div key={i} className="flex flex-col items-end gap-0.5">
                  <div className="bg-primary text-primary-foreground text-xs px-3 py-2 rounded-2xl rounded-br-sm max-w-[85%] leading-relaxed">
                    {m.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{m.time} · Sent (no reply)</span>
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>
          {/* Compose */}
          <div className="flex gap-2 px-4 pb-4">
            <textarea
              rows={2}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
              placeholder="Type a procurement notice or instruction… (no reply will be received)"
              className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={sendMsg}
              disabled={!draft.trim()}
              className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 flex-shrink-0 self-end"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// -- Main Page --
export default function TenderDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "documents" | "bidders" | "qa" | "timeline">("overview");
  const [showEOI, setShowEOI] = useState(false);
  const [profileBidder, setProfileBidder] = useState<Bidder | null>(null);

  const tender = MOCK_DETAIL[id] ?? DEFAULT_TENDER;

  const isOpen = tender.status === "Bidding Open";
  const isPublished = tender.status === "Published";

  const downloadDoc = (doc: typeof tender.documents[0]) => {
    toast(`Downloading ${doc.name}…`, "info");
    pushNotification(`Document downloaded: ${doc.name} (${tender.id})`, "success");
  };

  const downloadAll = () => {
    toast("Preparing full document package…", "info");
    setTimeout(() => {
      const blob = new Blob([`TENDER: ${tender.id}\nTITLE: ${tender.title}\nENTITY: ${tender.entity}\n\nFor full documents, contact: ${tender.contactEmail}`], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${tender.id}-Documents.txt`; a.click(); URL.revokeObjectURL(url);
    }, 600);
  };

  const stageOrder = TENDER_STAGES.map(s => s.key);
  const currentStageIdx = stageOrder.indexOf(tender.currentStage);

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Tender Detail"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 flex-wrap">
          <button onClick={() => navigate("/tenders")} className="hover:text-foreground flex items-center gap-1">
            <FileText className="h-3.5 w-3.5" /> Tenders
          </button>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <span className="font-mono">{tender.id}</span>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{tender.title.slice(0, 40)}…</span>
        </nav>

        {/* Header card */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-5 shadow-sm">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="font-mono text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-lg">{tender.id}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  tender.status === "Bidding Open" ? "bg-slate-100 text-[#0F172A]" :
                  tender.status === "Evaluation" ? "bg-slate-100 text-[#0F172A]" :
                  tender.status === "Awarded" ? "bg-slate-100 text-[#0F172A]" :
                  tender.status === "Published" ? "bg-slate-100 text-[#0F172A]" :
                  "bg-gray-100 text-gray-600"
                }`}>{tender.status}</span>
                <span className="text-xs bg-secondary text-foreground/60 px-2 py-0.5 rounded-full">{tender.method}</span>
              </div>
              <h1 className="text-lg font-bold text-foreground leading-snug">{tender.title}</h1>
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" /> {tender.entity}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0 flex-wrap">
              <button onClick={() => window.print()} className="h-9 px-3 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:bg-secondary">
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
              <button onClick={downloadAll} className="h-9 px-3 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:bg-secondary">
                <Download className="h-3.5 w-3.5" /> Documents
              </button>
              {(isOpen || isPublished) && (
                <button onClick={() => setShowEOI(true)} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 hover:opacity-90">
                  <Send className="h-3.5 w-3.5" /> Submit EOI
                </button>
              )}
            </div>
          </div>

          {/* Key numbers row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Estimated Value</span>
              <span className="text-base font-bold text-foreground mt-0.5">{tender.currency} {Number(tender.estimatedValue).toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Document Fee</span>
              <span className="text-base font-bold text-foreground mt-0.5">{tender.documentFee}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Earnest Money (EMD)</span>
              <span className="text-base font-bold text-foreground mt-0.5">{tender.emd}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Bids Received</span>
              <span className="text-base font-bold text-foreground mt-0.5">{tender.bids}</span>
            </div>
          </div>

          {/* Live timers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-4 bg-secondary/40 rounded-xl p-3">
            {tender.preBidDate && <CountdownTimer target={tender.preBidDate} label="Pre-Bid Meeting" color="text-[#0F172A]" />}
            {tender.bidOpenDate && <CountdownTimer target={tender.bidOpenDate} label="Bidding Opens" color="text-[#0F172A]" />}
            {tender.bidCloseDate && <CountdownTimer target={tender.bidCloseDate} label="Submission Closes" color={isOpen ? "text-[#0F172A]" : "text-red-500"} />}
            {tender.bidOpeningDate && <CountdownTimer target={tender.bidOpeningDate} label="Bid Opening" color="text-[#0F172A]" />}
          </div>
        </div>

        {/* Stage progress bar */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-5 overflow-x-auto">
          <div className="flex items-center gap-0 min-w-max">
            {TENDER_STAGES.map((stage, idx) => {
              const isDone = idx < currentStageIdx;
              const isActive = idx === currentStageIdx;
              const Icon = stage.icon;
              return (
                <div key={stage.key} className="flex items-center">
                  <button
                    onClick={() => navigate(`/tenders/${tender.id}/stage/${stage.key}`)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors text-center group hover:bg-secondary/60 ${isActive ? "bg-primary/10 border border-primary/30" : ""}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isDone ? "bg-[#0F172A] text-white" : isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={`text-[10px] font-semibold whitespace-nowrap ${isActive ? "text-primary" : isDone ? "text-[#0F172A]" : "text-muted-foreground"}`}>
                      {stage.label}
                    </span>
                  </button>
                  {idx < TENDER_STAGES.length - 1 && (
                    <div className={`h-0.5 w-6 flex-shrink-0 ${idx < currentStageIdx ? "bg-slate-400" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-5 overflow-x-auto">
          {(["overview","documents","bidders","qa","timeline"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`h-9 px-4 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t === "qa" ? "Q & A" : t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <Card>
                <CardHeader title="Tender Description" />
                <div className="px-5 py-4">
                  <p className="text-sm text-foreground/80 leading-relaxed">{tender.description}</p>
                </div>
              </Card>
              <Card>
                <CardHeader title="Scope of Work" />
                <div className="px-5 py-4">
                  <p className="text-sm text-foreground/80 leading-relaxed">{tender.scope}</p>
                </div>
              </Card>
              <Card>
                <CardHeader title="Key Dates & Schedule" />
                <div className="divide-y divide-border">
                  {[
                    { label: "Publication Date", value: tender.publishedDate ? new Date(tender.publishedDate).toLocaleString() : "—" },
                    { label: "Pre-Bid Meeting", value: tender.preBidDate ? new Date(tender.preBidDate).toLocaleString() : "—" },
                    { label: "Bid Submission Opens", value: tender.bidOpenDate ? new Date(tender.bidOpenDate).toLocaleString() : "—" },
                    { label: "Bid Submission Closes", value: tender.bidCloseDate ? new Date(tender.bidCloseDate).toLocaleString() : "—" },
                    { label: "Bid Opening Date", value: tender.bidOpeningDate ? new Date(tender.bidOpeningDate).toLocaleString() : "—" },
                    { label: "Bid Validity (days)", value: `${tender.validityDays} days` },
                    { label: "Relaxation Time", value: tender.relaxationMinutes > 0 ? `${tender.relaxationMinutes} minutes` : "None" },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between px-5 py-3">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className="text-sm font-medium text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-5">
              <Card>
                <CardHeader title="Tender Details" />
                <div className="divide-y divide-border">
                  {[
                    { label: "Ministry", value: tender.entity },
                    { label: "Department", value: tender.department },
                    { label: "Category", value: tender.category },
                    { label: "Method", value: tender.method },
                    { label: "Funding Source", value: tender.fundingSource },
                    { label: "Performance Bond", value: tender.performanceBond },
                    { label: "Pre-Bid Location", value: tender.preBidLocation },
                  ].map(row => (
                    <div key={row.label} className="px-5 py-2.5">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{row.label}</div>
                      <div className="text-sm text-foreground mt-0.5">{row.value}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader title="Contact Information" />
                <div className="px-5 py-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-muted-foreground" /> {tender.contactName}</div>
                  <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /> <a href={`mailto:${tender.contactEmail}`} className="text-primary hover:underline">{tender.contactEmail}</a></div>
                  <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /> {tender.contactPhone}</div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "documents" && (
          <Card>
            <CardHeader title="Tender Documents" subtitle={`${tender.documents.length} documents available`}
              action={<button onClick={downloadAll} className="h-7 px-3 rounded-lg bg-primary text-primary-foreground text-xs flex items-center gap-1"><Download className="h-3.5 w-3.5" /> Download All</button>} />
            <div className="divide-y divide-border">
              {tender.documents.map(doc => (
                <div key={doc.name} className="flex items-center justify-between px-5 py-4 hover:bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-bold ${doc.type === "PDF" ? "bg-red-100 text-red-700" : "bg-slate-100 text-[#0F172A]"}`}>{doc.type}</div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">{doc.size}</div>
                    </div>
                  </div>
                  <button onClick={() => downloadDoc(doc)} className="h-8 px-3 rounded-lg border border-border text-xs flex items-center gap-1.5 hover:bg-secondary">
                    <FileDown className="h-3.5 w-3.5" /> Download
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === "bidders" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-foreground">
                Registered Bidders & Vendors
                <span className="ml-2 text-xs font-normal text-muted-foreground">({tender.bidders.length} registered)</span>
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                {(["Under Review", "Assessed", "Done"] as const).map(s => {
                  const rs = REVIEW_STATUS_STYLES[s];
                  return (
                    <span key={s} className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${rs.bg} ${rs.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${rs.dot}`} />{s}
                    </span>
                  );
                })}
              </div>
            </div>
            {tender.bidders.length === 0 ? (
              <Card>
                <div className="px-5 py-12 text-center text-muted-foreground text-sm">No bidders registered yet.</div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tender.bidders.map(b => (
                  <BidderCard
                    key={b.name}
                    bidder={b}
                    tenderId={tender.id}
                    onViewProfile={setProfileBidder}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "qa" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="Questions & Answers" subtitle="Official clarifications" />
              {tender.qa.map((item, i) => (
                <div key={i} className="px-5 py-4 border-b border-border last:border-0">
                  <div className="flex gap-2 mb-2">
                    <div className="h-6 w-6 rounded-full bg-slate-100 text-[#0F172A] text-xs font-bold flex items-center justify-center flex-shrink-0">Q</div>
                    <p className="text-sm font-medium text-foreground">{item.q}</p>
                  </div>
                  <div className="flex gap-2 pl-0">
                    <div className="h-6 w-6 rounded-full bg-slate-100 text-[#0F172A] text-xs font-bold flex items-center justify-center flex-shrink-0">A</div>
                    <div>
                      <p className="text-sm text-foreground/80">{item.a}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Posted: {item.date}</p>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {tab === "timeline" && (
          <Card>
            <CardHeader title="Tender Timeline" subtitle="Stage-by-stage progress" />
            <div className="px-5 py-5">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                {tender.timeline.map((item, i) => (
                  <div key={i} className="relative flex items-start gap-4 pb-6 last:pb-0">
                    <div className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.status === "done" ? "bg-[#0F172A] text-white" :
                      item.status === "active" ? "bg-primary text-primary-foreground" :
                      "bg-secondary border-2 border-border text-muted-foreground"
                    }`}>
                      {item.status === "done" ? <CheckCircle2 className="h-4 w-4" /> :
                       item.status === "active" ? <Clock className="h-4 w-4" /> :
                       <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${item.status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>{item.stage}</span>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                      <span className={`text-[11px] font-medium mt-0.5 inline-block ${
                        item.status === "done" ? "text-[#0F172A]" :
                        item.status === "active" ? "text-primary" :
                        "text-muted-foreground"
                      }`}>{item.status === "done" ? "Completed" : item.status === "active" ? "In Progress" : "Pending"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
      {showEOI && <EOIModal tender={tender} onClose={() => setShowEOI(false)} />}
      {profileBidder && <BidderProfileModal bidder={profileBidder} onClose={() => setProfileBidder(null)} />}
    </AppShell>
  );
}
