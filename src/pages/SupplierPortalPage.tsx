import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { tenders } from "@/lib/mock-data";
import {
  Search, Download, FileText, Clock, CheckCircle2, LogOut,
  ChevronDown, ChevronRight, Bell, X, Upload, Send, Eye, AlertCircle,
  Building2, Paperclip, ArrowRight, Tag, Calendar,
  Hash, Users, ShieldCheck, Info, Package, CreditCard,
  MessageSquare, Settings, Filter, Star, Plus, Trash2,
  AlertTriangle, CheckSquare, Phone, Mail, MapPin, Share2,
} from "lucide-react";

function LogoIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 256 256" fill="currentColor">
      <path d="M 128.005 191.173 C 128.448 156.208 156.93 128 192 128 L 192 64 L 128 64 C 128 99.346 99.346 128 64 128 L 64 192 L 128 192 Z M 192 256 L 64 256 C 28.654 256 0 227.346 0 192 L 0 64 L 64 64 L 64 0 L 192 0 C 227.346 0 256 28.654 256 64 L 256 192 L 192 192 Z" />
    </svg>
  );
}

const STATUS_COLOR: Record<string, string> = {
  Published: "bg-slate-100 text-[#0F172A] border border-slate-200",
  Bidding:   "bg-slate-100 text-[#0F172A] border border-slate-200",
  Evaluation:"bg-slate-100 text-[#0F172A] border border-slate-200",
  Awarded:   "bg-gray-100 text-gray-500 border border-gray-200",
};

type Application = {
  tenderId: string;
  tenderTitle: string;
  submittedAt: string;
  status: "Submitted" | "Under Review" | "Shortlisted" | "Unsuccessful";
  bidAmount: string;
  files: string[];
};

/* ─── Tender Detail Modal ──────────────────────────────────────────────────── */
function TenderDetailModal({ tender, onClose, onApply }: {
  tender: typeof tenders[number];
  onClose: () => void;
  onApply: () => void;
}) {
  const SCOPE = [
    "Supply and installation of all materials as per Bill of Quantities",
    "Compliance with national technical standards and specifications",
    "Submission of performance bond (10% of contract value)",
    "Delivery within specified timeline — liquidated damages apply",
    "Warranty period: 24 months from date of practical completion",
    "On-site supervision and testing prior to handover",
  ];

  const ELIGIBILITY = [
    "Company registration certificate (current)",
    "Tax clearance certificate (valid)",
    "Audited financial statements (last 3 years)",
    "Minimum 5 years proven experience in similar projects",
    "PRAZ / relevant professional body registration",
    "Bid security: 2% of bid amount (bank guarantee or cash)",
  ];

  const TIMELINE = [
    { event: "Tender Published",      date: "2026-06-01", done: true  },
    { event: "Pre-bid Meeting",        date: "2026-06-20", done: true  },
    { event: "Clarifications Deadline",date: "2026-06-28", done: false },
    { event: "Bid Submission Deadline",date: tender.closing,           done: false },
    { event: "Bid Opening",            date: "Next business day",       done: false },
    { event: "Evaluation Period",      date: "4–6 weeks",               done: false },
    { event: "Award Notification",     date: "~8 weeks after closing",  done: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl sm:my-4 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-black/10 flex-shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${STATUS_COLOR[tender.status] ?? "bg-gray-100 text-gray-600"}`}>{tender.status}</span>
              <span className="text-[11px] font-mono text-black/40">{tender.id}</span>
            </div>
            <h2 className="text-sm font-bold text-black leading-snug">{tender.title}</h2>
            <div className="text-xs text-black/50 mt-0.5">{tender.entity}</div>
          </div>
          <button onClick={onClose} className="flex-shrink-0 h-8 w-8 rounded-lg hover:bg-black/5 grid place-items-center text-black/40 hover:text-black transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* Key Facts grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: Hash,        label: "Reference",     value: tender.id },
              { icon: Tag,         label: "Category",      value: tender.category },
              { icon: Building2,   label: "Procuring Entity", value: tender.entity },
              { icon: ShieldCheck, label: "Method",        value: tender.method },
              { icon: Calendar,    label: "Closing Date",  value: tender.closing },
              { icon: Users,       label: "Bids Received", value: `${tender.bids} bids` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-[#EAF1F8] rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="h-3.5 w-3.5 text-black/40" />
                  <span className="text-[10px] text-black/40 uppercase tracking-wider font-medium">{label}</span>
                </div>
                <div className="text-sm font-semibold text-black leading-tight">{value}</div>
              </div>
            ))}
          </div>

          {/* Estimated Value highlight */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-xs text-[#0F172A] font-medium uppercase tracking-wider mb-0.5">Estimated Contract Value</div>
              <div className="text-2xl font-bold text-[#0F172A]">{tender.value}</div>
            </div>
            <ShieldCheck className="h-8 w-8 text-slate-400" />
          </div>

          {/* Scope of Work */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-black/40" />
              <span className="text-sm font-semibold text-black">Scope of Work</span>
            </div>
            <div className="space-y-1.5">
              {SCOPE.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-black/70">
                  <CheckCircle2 className="h-3.5 w-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-black/40" />
              <span className="text-sm font-semibold text-black">Eligibility Requirements</span>
            </div>
            <div className="space-y-1.5">
              {ELIGIBILITY.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-black/70">
                  <div className="h-1.5 w-1.5 rounded-full bg-black/30 mt-1.5 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Procurement Timeline */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-black/40" />
              <span className="text-sm font-semibold text-black">Procurement Timeline</span>
            </div>
            <div className="relative pl-5">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-black/10" />
              {TIMELINE.map((ev, i) => (
                <div key={i} className="relative mb-3 last:mb-0">
                  <div className={`absolute -left-3 top-1 h-2.5 w-2.5 rounded-full border-2 ${ev.done ? "bg-[#0F172A] border-slate-200" : "bg-white border-black/20"}`} />
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm ${ev.done ? "text-[#0F172A] font-medium" : "text-black/70"}`}>{ev.event}</span>
                    <span className="text-xs text-black/40 whitespace-nowrap">{ev.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl border border-black/10 p-4 bg-black/2">
            <div className="text-xs font-semibold text-black/50 uppercase tracking-wider mb-2">Contact & Enquiries</div>
            <div className="text-sm text-black/70">For clarifications, contact the Procurement Unit at <span className="font-medium text-black">{tender.entity}</span></div>
            <div className="text-xs text-black/40 mt-1">All clarifications must be submitted in writing via the AI Powered Electronic Public Procurement and Oversight Intelligence System portal. Verbal clarifications will not be considered.</div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 px-5 pb-5 pt-3 border-t border-black/10 flex-shrink-0 flex-wrap">
          <button onClick={onApply}
            className="flex-1 sm:flex-none h-10 px-6 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#0F172A] transition-colors flex items-center justify-center gap-1.5">
            <Send className="h-3.5 w-3.5" /> Apply Now
          </button>
          <button onClick={() => {
            const content = `TENDER NOTICE\n\nReference: ${tender.id}\nTitle: ${tender.title}\nEntity: ${tender.entity}\nCategory: ${tender.category}\nValue: ${tender.value}\nMethod: ${tender.method}\nClosing Date: ${tender.closing}\nBids Received: ${tender.bids}\n\nGovernment of Zimbabwe · PRAZ\n© 2026 AI Powered Electronic Public Procurement and Oversight Intelligence System � Government of Zimbabwe`;
            const blob = new Blob([content], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = `${tender.id}-notice.txt`; a.click();
            URL.revokeObjectURL(url);
          }}
            className="h-10 px-4 rounded-xl border border-black/10 text-sm text-black/70 hover:bg-black/5 transition-colors flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" /> Download
          </button>
          <button onClick={onClose}
            className="h-10 px-4 rounded-xl border border-black/10 text-sm text-black/50 hover:bg-black/5 transition-colors ml-auto">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Bid / Apply Modal ────────────────────────────────────────────────────── */
function BidModal({ tender, onClose, onSubmit }: {
  tender: typeof tenders[number];
  onClose: () => void;
  onSubmit: (app: Application) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bidAmount, setBidAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const names = Array.from(e.target.files ?? []).map(f => f.name);
    setFiles(prev => [...prev, ...names]);
  };

  const handleSubmit = () => {
    setDone(true);
    onSubmit({
      tenderId: tender.id,
      tenderTitle: tender.title,
      submittedAt: new Date().toLocaleString(),
      status: "Submitted",
      bidAmount: `${currency} ${Number(bidAmount || 0).toLocaleString()}`,
      files,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg sm:my-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
          <div>
            <div className="text-sm font-bold text-black">Apply for Tender</div>
            <div className="text-xs text-black/50 truncate max-w-xs">{tender.title}</div>
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-black/40" /></button>
        </div>

        {!done ? (
          <>
            {/* Steps indicator */}
            <div className="flex px-5 pt-4 gap-2 mb-4">
              {["Bid Details", "Documents", "Review"].map((s, i) => (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className={`h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${step > i + 1 ? "bg-[#0F172A] text-white" : step === i + 1 ? "bg-black text-white" : "bg-black/10 text-black/40"}`}>
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs ${step === i + 1 ? "text-black font-medium" : "text-black/40"} hidden sm:inline`}>{s}</span>
                  {i < 2 && <div className="flex-1 h-px bg-black/10 mx-1" />}
                </div>
              ))}
            </div>

            <div className="px-5 pb-5 max-h-[50vh] overflow-y-auto">
              {step === 1 && (
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#0F172A]">
                    <strong>{tender.id}</strong> · {tender.entity} · Closes {tender.closing}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-black/50 uppercase tracking-wider">Bid Amount</label>
                    <div className="flex gap-2 mt-1.5">
                      <select value={currency} onChange={e => setCurrency(e.target.value)} className="h-10 px-3 rounded-xl border border-black/10 text-sm bg-white">
                        <option>USD</option><option>ZWL</option><option>EUR</option>
                      </select>
                      <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder="0.00"
                        className="flex-1 h-10 px-4 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/20" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-black/50 uppercase tracking-wider">Cover Letter / Bid Notes</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
                      placeholder="Briefly describe your bid approach, qualifications, and why you are best suited…"
                      className="mt-1.5 w-full px-4 py-3 rounded-xl border border-black/10 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black/20" />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-black mb-2">Required Documents</div>
                  {["Company Registration Certificate", "Tax Clearance Certificate", "Financial Statements (3 years)", "Technical Proposal", "Bid Security / Bank Guarantee"].map((doc) => (
                    <div key={doc} className="flex items-center justify-between p-3 rounded-xl border border-black/10 bg-black/2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-black/40" />
                        <span className="text-sm text-black">{doc}</span>
                      </div>
                      {files.some(f => f.toLowerCase().includes(doc.toLowerCase().split(" ")[0])) ? (
                        <CheckCircle2 className="h-4 w-4 text-slate-600" />
                      ) : (
                        <span className="text-xs text-black/30">Required</span>
                      )}
                    </div>
                  ))}
                  <div>
                    <input type="file" ref={fileRef} multiple className="hidden" onChange={addFile} />
                    <button onClick={() => fileRef.current?.click()}
                      className="w-full h-12 rounded-xl border-2 border-dashed border-black/20 text-sm text-black/50 hover:border-black/40 hover:text-black transition-colors flex items-center justify-center gap-2">
                      <Upload className="h-4 w-4" /> Click to attach documents (PDF, DOCX, XLSX)
                    </button>
                  </div>
                  {files.length > 0 && (
                    <div className="space-y-1.5">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                          <Paperclip className="h-3.5 w-3.5 text-[#0F172A] flex-shrink-0" />
                          <span className="text-xs text-[#0F172A] truncate flex-1">{f}</span>
                          <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}>
                            <X className="h-3.5 w-3.5 text-slate-500 hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-4 w-4 text-[#0F172A]" />
                      <span className="text-sm font-semibold text-[#0F172A]">Ready to Submit</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between"><span className="text-black/50">Tender</span><span className="font-medium text-black text-right max-w-[200px] truncate">{tender.title}</span></div>
                      <div className="flex justify-between"><span className="text-black/50">Reference</span><span className="font-mono text-black">{tender.id}</span></div>
                      <div className="flex justify-between"><span className="text-black/50">Bid Amount</span><span className="font-semibold text-black">{currency} {Number(bidAmount || 0).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-black/50">Documents</span><span className="text-black">{files.length} attached</span></div>
                      <div className="flex justify-between"><span className="text-black/50">Closing</span><span className="text-black">{tender.closing}</span></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex gap-2">
                    <AlertCircle className="h-4 w-4 text-[#0F172A] flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-[#0F172A]">By submitting you confirm all information is accurate and you agree to PPDPA procurement terms. Bid submissions are final.</div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-5 pb-5 pt-3 border-t border-black/10">
              <button onClick={() => setStep(s => Math.max(1, s - 1) as 1 | 2 | 3)} disabled={step === 1}
                className="h-9 px-4 rounded-xl border border-black/10 text-sm hover:bg-black/5 disabled:opacity-40">← Back</button>
              {step < 3
                ? <button onClick={() => setStep(s => (s + 1) as 1 | 2 | 3)} className="h-9 px-5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800">Continue →</button>
                : <button onClick={handleSubmit} className="h-9 px-5 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#0F172A] flex items-center gap-1.5"><Send className="h-4 w-4" /> Submit Application</button>
              }
            </div>
          </>
        ) : (
          <div className="px-5 py-10 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 grid place-items-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-[#0F172A]" />
            </div>
            <div className="text-lg font-bold text-black mb-2">Application Submitted!</div>
            <div className="text-sm text-black/50 mb-1">Your bid has been received by the procuring entity.</div>
            <div className="text-xs text-black/40 mb-6">Reference: {tender.id} · {new Date().toLocaleString()}</div>
            <button onClick={onClose} className="h-9 px-6 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Types for new tabs ──────────────────────────────────────────────────────
type CatalogueItem = {
  id: string; name: string; genericName: string; category: string;
  specs: string; dimensions: string; photo: string;
  stock: number; role: "Dealer" | "Manufacturer" | "Distributor";
  location: string; unitPrice: string;
};

type PortalNotification = {
  id: string; title: string; message: string; type: "info" | "success" | "warning" | "error";
  date: string; read: boolean;
};

type PaymentRecord = {
  id: string; contract: string; invoiceRef: string; amount: string;
  status: "Pending" | "Approved" | "Paid" | "Rejected"; dueDate: string; description: string;
};

type Complaint = {
  id: string; subject: string; ref: string; category: string;
  description: string; status: "Open" | "Under Review" | "Resolved" | "Closed";
  filedDate: string; resolution?: string;
};

const PORTAL_TABS = [
  { key: "tenders",       label: "Tenders" },
  { key: "rfqs",          label: "RFQs" },
  { key: "rfps",          label: "RFPs" },
  { key: "eois",          label: "EOIs" },
  { key: "auctions",      label: "Auctions" },
  { key: "myapps",        label: "My Applications" },
  { key: "pastbids",      label: "Past Bids" },
  { key: "workbench",     label: "Workbench" },
  { key: "mail",          label: "Mail" },
  { key: "catalogue",     label: "My Catalogue" },
  { key: "notifications", label: "My Notifications" },
  { key: "payments",      label: "Payment Tracker" },
  { key: "complaints",    label: "Complaints" },
  { key: "kyc",           label: "My KYC" },
  { key: "settings",      label: "Settings" },
  { key: "comm-crm",      label: "Communications" },
  { key: "service-crm",   label: "Service Delivery Complaints" },
  { key: "recruit-crm",   label: "Recruitment" },
  { key: "services-crm",  label: "Services Applications" },
  { key: "returns-crm",   label: "Annual Returns" },
] as const;
type PortalTab = typeof PORTAL_TABS[number]["key"];

const STATUS_FILTERS = ["All", "Coming", "Open", "Awarded", "Past", "Flagged", "Plan"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

const MOCK_PAYMENTS: PaymentRecord[] = [
  { id: "PAY-2026-001", contract: "CN-2026-0411", invoiceRef: "INV-2026-4821", amount: "USD 2,840,000", status: "Approved",  dueDate: "2026-07-15", description: "Milestone 3 — Supply & Installation Phase" },
  { id: "PAY-2026-002", contract: "CN-2026-0388", invoiceRef: "INV-2026-4810", amount: "USD 620,000",   status: "Pending",   dueDate: "2026-07-20", description: "Monthly service retainer — June 2026" },
  { id: "PAY-2026-003", contract: "CN-2026-0344", invoiceRef: "INV-2026-4798", amount: "USD 180,000",   status: "Paid",      dueDate: "2026-06-30", description: "Completion certificate — Phase 1" },
  { id: "PAY-2026-004", contract: "CN-2026-0321", invoiceRef: "INV-2026-4756", amount: "USD 45,000",    status: "Rejected",  dueDate: "2026-06-15", description: "Variation order — scope extension" },
];

const MOCK_NOTIFICATIONS: PortalNotification[] = [
  { id: "1", title: "Bid shortlisted", message: "Your bid for ZW-PRA-2026-00183 (ARV Medicines) has been shortlisted for financial evaluation.", type: "success", date: "2026-06-24", read: false },
  { id: "2", title: "New tender matching your profile", message: "ZW-PRA-2026-00185 — Medical Supplies Framework has been published. Closing: 2026-07-30.", type: "info", date: "2026-06-23", read: false },
  { id: "3", title: "Document expiry warning", message: "Your tax clearance certificate expires in 14 days. Please upload a renewed certificate to remain eligible.", type: "warning", date: "2026-06-22", read: false },
  { id: "4", title: "Payment approved", message: "Invoice INV-2026-4821 — USD 2,840,000 has been approved for payment. EFT expected within 5 business days.", type: "success", date: "2026-06-21", read: true },
  { id: "5", title: "Award notification", message: "You have been awarded contract CN-2026-0411. Please submit required legal documents within 14 working days.", type: "success", date: "2026-06-20", read: true },
];

const MOCK_COMPLAINTS: Complaint[] = [
  { id: "CMP-2026-008", subject: "Specification bias in tender ZW-PRA-2026-00170", ref: "ZW-PRA-2026-00170", category: "Specification Bias", description: "Tender specifications appear to favour a specific brand, limiting fair competition.", status: "Under Review", filedDate: "2026-06-10" },
  { id: "CMP-2026-005", subject: "Late payment — INV-2026-4756", ref: "CN-2026-0321", category: "Payment Dispute", description: "Invoice submitted on 2026-05-15 remains unpaid beyond the 30-day payment terms.", status: "Resolved", filedDate: "2026-05-20", resolution: "Payment processed 2026-06-05. Delayed due to approval backlog." },
];

/* ─── Main Supplier Portal ─────────────────────────────────────────────────── */
export default function SupplierPortalPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<PortalTab>("tenders");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [bidTender, setBidTender] = useState<typeof tenders[number] | null>(null);
  const [detailTender, setDetailTender] = useState<typeof tenders[number] | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showUser, setShowUser] = useState(false);
  const [catalogueItems, setCatalogueItems] = useState<CatalogueItem[]>([]);
  const [showAddCatalogue, setShowAddCatalogue] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>(MOCK_NOTIFICATIONS);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [showNewComplaint, setShowNewComplaint] = useState(false);
  const [newComplaint, setNewComplaint] = useState({ subject: "", ref: "", category: "Evaluation Error", description: "" });
  const [newCatalogueItem, setNewCatalogueItem] = useState<Partial<CatalogueItem>>({ role: "Dealer" });

  // Filter tenders by status
  const filterByStatus = (items: typeof tenders, type?: string) => {
    let base = type ? items.filter(t => t.method === type || t.category.toLowerCase().includes(type.toLowerCase())) : items;
    if (statusFilter === "All") return base;
    if (statusFilter === "Open")    return base.filter(t => ["Published", "Bidding"].includes(t.status));
    if (statusFilter === "Awarded") return base.filter(t => t.status === "Awarded");
    if (statusFilter === "Past")    return base.filter(t => ["Closed", "Cancelled", "Awarded"].includes(t.status));
    if (statusFilter === "Coming")  return base.filter(t => t.status === "Draft" || (t.status as string) === "Planned");
    if (statusFilter === "Flagged") return base.filter(t => t.bids === 0);
    if (statusFilter === "Plan")    return base.filter(t => t.status === "Published");
    return base;
  };

  const allTendersFiltered = filterByStatus(
    tenders.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.entity.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
    )
  );

  const published = tenders.filter(t => ["Published", "Bidding"].includes(t.status));

  const handleLogout = () => { logout(); navigate("/signin"); };

  const downloadPDF = (tender: typeof tenders[number]) => {
    const content = `TENDER NOTICE\n\nReference: ${tender.id}\nTitle: ${tender.title}\nEntity: ${tender.entity}\nCategory: ${tender.category}\nValue: ${tender.value}\nMethod: ${tender.method}\nClosing Date: ${tender.closing}\nBids Received: ${tender.bids}\n\nGovernment of Zimbabwe · PRAZ\n© 2026 AI Powered Electronic Public Procurement and Oversight Intelligence System � Government of Zimbabwe`;
    const blob = new Blob([content], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${tender.id}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Filter bar component ──────────────────────────────────────────────────
  // Rendered inline to avoid remount-on-render focus loss
  const renderFilterBar = () => (
    <div className="flex items-center gap-2 mb-4 flex-wrap">
      <Filter className="h-4 w-4 text-black/30 flex-shrink-0" />
      {STATUS_FILTERS.map(f => (
        <button key={f} onClick={() => setStatusFilter(f)}
          className={`h-7 px-3 rounded-full text-xs font-medium transition-colors ${
            statusFilter === f ? "bg-black text-white" : "bg-white border border-black/10 text-black/60 hover:border-black/30"
          }`}>
          {f}
        </button>
      ))}
      <div className="flex-1 min-w-[180px]">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, entity, ref…"
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-black/10 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-black/10" />
        </div>
      </div>
    </div>
  );

  // ── Tender card renderer (with countdown timer + strong border) ──────────
  const TenderCard = ({ t }: { t: typeof tenders[number] }) => {
    const closeMs = new Date(t.closing).getTime();
    const now = Date.now();
    const diff = closeMs - now;
    const days = Math.max(0, Math.floor(diff / 86400000));
    const hours = Math.max(0, Math.floor((diff % 86400000) / 3600000));
    const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));
    const urgent = diff > 0 && diff < 3 * 86400000;
    const closed = diff <= 0;
    return (
      <div className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all p-5 ${urgent ? "border-slate-200" : closed ? "border-red-300" : "border-[#0f172a]/20 hover:border-[#0f172a]/40"}`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${STATUS_COLOR[t.status] ?? "bg-gray-100 text-gray-600"}`}>{t.status}</span>
              <span className="text-[11px] text-black/40 font-mono">{t.id}</span>
            </div>
            <h3 className="text-sm font-semibold text-black leading-snug">{t.title}</h3>
            <div className="text-xs text-black/50 mt-1">{t.entity} · {t.category}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-base font-bold text-[#0f172a]">{t.value}</div>
            <div className="text-[11px] text-black/40">{t.method}</div>
          </div>
        </div>

        {/* Countdown timer */}
        <div className={`mb-3 rounded-lg px-3 py-2 border ${closed ? "bg-red-50 border-red-200" : urgent ? "bg-slate-50 border-slate-200" : "bg-[#0f172a]/5 border-[#0f172a]/15"}`}>
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-wider text-black/50">
              {closed ? "Closed" : "Closes in"}
            </div>
            <div className="text-[10px] text-black/40">{t.closing}</div>
          </div>
          {!closed && (
            <div className="flex items-center gap-2 mt-1">
              {[
                { n: days, l: "Days" },
                { n: hours, l: "Hrs" },
                { n: mins, l: "Min" },
              ].map(x => (
                <div key={x.l} className={`flex-1 text-center rounded px-1 py-1 ${urgent ? "bg-red-700 text-white" : "bg-slate-700 text-white"}`}>
                  <div className="text-sm font-bold leading-none">{String(x.n).padStart(2, "0")}</div>
                  <div className="text-[9px] opacity-70">{x.l}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-black/50 mb-4 flex-wrap">
          <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {t.bids} bids</span>
          <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {t.entity}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setBidTender(t)} disabled={closed} className="h-9 px-5 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5">
            <Send className="h-3.5 w-3.5" /> Apply Now
          </button>
          <button onClick={() => downloadPDF(t)} className="h-9 px-4 rounded-xl border border-black/10 text-sm text-black/70 hover:bg-black/5 transition-colors flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" /> Download
          </button>
          <button onClick={() => setDetailTender(t)} className="h-9 px-4 rounded-xl border border-black/10 text-sm text-black/70 hover:bg-black/5 transition-colors flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" /> View Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="page-standalone bg-[#EAF1F8] flex flex-col">
      {/* Header */}
      <header className="h-14 bg-white border-b border-black/10 flex items-center px-4 gap-3 sticky top-0 z-30 shadow-sm">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-semibold text-black hidden sm:block">AI Powered Procurement Portal</span>
        </Link>
        <div className="h-5 w-px bg-black/10 hidden sm:block" />
        <span className="text-xs font-medium text-[#0F172A] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full hidden sm:inline">Supplier Portal</span>
        {/* Vendor info pills */}
        <div className="hidden md:flex items-center gap-2 ml-1">
          <span className="text-xs text-black/50 bg-black/5 px-2 py-0.5 rounded-full font-mono">{user?.entity ?? "Vendor"}</span>
          <span className="text-xs text-black/40 bg-black/5 px-2 py-0.5 rounded-full font-mono">VEN-{String(user?.id ?? "00001").slice(-5).toUpperCase()}</span>
          <span className="text-xs text-black/40 bg-black/5 px-2 py-0.5 rounded-full">FY 2026/27</span>
          <span className="text-xs text-[#0F172A] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">Contractor / Supplier</span>
        </div>
        <Link
          to="/vendor-workbench/dashboard"
          className="hidden md:flex items-center gap-1.5 h-8 px-3 bg-black text-white text-xs font-medium rounded-lg hover:bg-black/80 transition-colors flex-shrink-0"
        >
          <span>Workbench</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
        <div className="flex-1" />
        {/* WhatsApp & Email quick contact */}
        <div className="hidden sm:flex items-center gap-1">
          <button title="Share via WhatsApp" className="h-8 w-8 grid place-items-center rounded-lg hover:bg-slate-50 text-[#0F172A] hover:text-[#0F172A] transition-colors">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          </button>
          <button title="Send Email" className="h-8 w-8 grid place-items-center rounded-lg hover:bg-slate-50 text-[#0F172A] hover:text-[#0F172A] transition-colors">
            <Mail className="h-4 w-4" />
          </button>
          <button title="Share to Sign" className="h-8 px-2.5 rounded-lg hover:bg-slate-50 text-[#0F172A] hover:text-[#0F172A] text-xs font-medium transition-colors flex items-center gap-1 border border-slate-200">
            <Send className="h-3 w-3" /> Sign
          </button>
        </div>
        <button className="relative h-9 w-9 grid place-items-center rounded-lg hover:bg-[#EAF1F8] text-black/40 hover:text-black">
          <Bell className="h-4 w-4" />
          {notifications.filter(n => !n.read).length > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </button>
        <div className="relative">
          <button onClick={() => setShowUser(!showUser)} className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-[#EAF1F8] transition-colors">
            <div className="h-7 w-7 rounded-full bg-[#0F172A] text-white text-xs font-bold grid place-items-center">{user?.avatar ?? "?"}</div>
            <span className="text-xs font-medium text-black hidden sm:block max-w-[100px] truncate">{user?.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-black/30 hidden sm:block" />
          </button>
          {showUser && (
            <div className="absolute right-0 top-full mt-1 w-52 rounded-2xl bg-white border border-black/10 shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-black/10">
                <div className="text-xs font-semibold text-black">{user?.name}</div>
                <div className="text-[11px] text-black/40">{user?.entity}</div>
                <div className="text-[11px] text-black/40">{user?.email}</div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-3 text-xs text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Welcome banner */}
      <div className="bg-[#0F172A] text-white px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-semibold">Welcome, {user?.name} 👋</div>
            <div className="text-xs text-slate-300 mt-0.5">{user?.entity} · Supplier Portal · Browse & apply for government tenders</div>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0 flex-wrap">
            <div className="text-center"><div className="text-xl font-bold">{published.length}</div><div className="text-xs text-slate-300">Open</div></div>
            <div className="text-center"><div className="text-xl font-bold">{applications.length}</div><div className="text-xs text-slate-300">Applied</div></div>
            <div className="text-center"><div className="text-xl font-bold">{notifications.filter(n => !n.read).length}</div><div className="text-xs text-slate-300">Unread</div></div>
            {/* Official Registration Form link */}
            <a href="/supplier-registration"
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold border border-white/30 transition-colors">
              <FileText className="h-3.5 w-3.5" /> Registration Form
            </a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-black/10 px-4 sm:px-6 sticky top-14 z-20">
        <div className="max-w-6xl mx-auto flex gap-0 overflow-x-auto scrollbar-none">
          {PORTAL_TABS.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key as PortalTab)}
              className={`px-3 py-3 text-xs font-medium border-b-2 -mb-px whitespace-nowrap flex-shrink-0 transition-colors ${
                activeTab === key ? "border-slate-200 text-[#0F172A]" : "border-transparent text-black/50 hover:text-black"
              }`}>
              {key === "notifications" && notifications.filter(n => !n.read).length > 0
                ? <span className="flex items-center gap-1">{label} <span className="h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold grid place-items-center">{notifications.filter(n => !n.read).length}</span></span>
                : label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 sm:px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {/* ── Tenders ── */}
          {activeTab === "tenders" && (
            <div className="space-y-3">
              {renderFilterBar()}
              {allTendersFiltered.length === 0 && (
                <div className="py-16 text-center text-black/40 text-sm">No tenders match your filters.</div>
              )}
              {allTendersFiltered.map(t => <TenderCard key={t.id} t={t} />)}
            </div>
          )}

          {/* ── RFQs ── */}
          {activeTab === "rfqs" && (
            <div className="space-y-3">
              {renderFilterBar()}
              {allTendersFiltered.filter(t => t.method === "RFQ" || t.category.includes("Quotation")).length === 0
                ? <div className="py-16 text-center text-black/40 text-sm">No RFQs match your filters.</div>
                : allTendersFiltered.filter(t => t.method === "RFQ" || t.category.includes("Quotation")).map(t => <TenderCard key={t.id} t={t} />)
              }
              {allTendersFiltered.filter(t => !t.method.includes("RFQ")).slice(0, 3).map(t => <TenderCard key={t.id} t={t} />)}
            </div>
          )}

          {/* ── RFPs ── */}
          {activeTab === "rfps" && (
            <div className="space-y-3">
              {renderFilterBar()}
              {allTendersFiltered.filter(t => (t.method as string) === "RFP" || t.category.includes("Proposal")).length === 0
                ? <div className="py-16 text-center text-black/40 text-sm">No RFPs match your filters.</div>
                : allTendersFiltered.filter(t => (t.method as string) === "RFP" || t.category.includes("Proposal")).map(t => <TenderCard key={t.id} t={t} />)
              }
              {allTendersFiltered.slice(0, 2).map(t => <TenderCard key={t.id} t={t} />)}
            </div>
          )}

          {/* ── EOIs ── */}
          {activeTab === "eois" && (
            <div className="space-y-3">
              {renderFilterBar()}
              {allTendersFiltered.filter(t => (t.method as string) === "EOI" || t.category.includes("Interest")).length === 0
                ? <div className="py-16 text-center text-black/40 text-sm">No EOIs match your filters.</div>
                : allTendersFiltered.filter(t => (t.method as string) === "EOI" || t.category.includes("Interest")).map(t => <TenderCard key={t.id} t={t} />)
              }
              {allTendersFiltered.slice(0, 2).map(t => <TenderCard key={t.id} t={t} />)}
            </div>
          )}

          {/* ── Auctions ── */}
          {activeTab === "auctions" && (
            <div className="space-y-3">
              {renderFilterBar()}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <div className="text-sm font-medium text-[#0F172A]">1 Live Auction Now — AUC-2026-012: Office Furniture & Fixtures — ZIMRA HQ · Reserve: USD 65,000</div>
              </div>
              {[
                { id: "AUC-2026-014", title: "Government Fleet Vehicles — Harare (24 lots)", entity: "Ministry of Finance", value: "Reserve USD 480,000", method: "Auction", status: "Published", category: "Assets", closing: "2026-06-28", bids: 142 },
                { id: "AUC-2026-013", title: "ICT Equipment Disposal — Ministry of Finance (38 lots)", entity: "Ministry of Finance", value: "Reserve USD 120,000", method: "Auction", status: "Bidding", category: "ICT", closing: "2026-07-05", bids: 89 },
                { id: "AUC-2026-012", title: "Office Furniture & Fixtures — ZIMRA HQ (62 lots)", entity: "ZIMRA", value: "Reserve USD 65,000", method: "Auction", status: "Bidding", category: "Furniture", closing: "2026-07-12", bids: 214 },
              ].map(t => <TenderCard key={t.id} t={t as typeof tenders[0]} />)}
            </div>
          )}

          {/* ── My Applications ── */}
          {activeTab === "myapps" && (
            <div className="space-y-3">
              {applications.length === 0 ? (
                <div className="py-16 text-center">
                  <FileText className="h-12 w-12 text-black/20 mx-auto mb-4" />
                  <div className="text-sm font-medium text-black/50 mb-1">No applications yet</div>
                  <div className="text-xs text-black/30 mb-4">Apply for a tender to see it here</div>
                  <button onClick={() => setActiveTab("tenders")} className="h-9 px-5 rounded-xl bg-[#0F172A] text-white text-sm font-medium hover:bg-[#0F172A] flex items-center gap-1.5 mx-auto">
                    <ArrowRight className="h-4 w-4" /> Browse Tenders
                  </button>
                </div>
              ) : applications.map((app, i) => (
                <div key={i} className="bg-white rounded-2xl border border-black/10 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="text-sm font-semibold text-black">{app.tenderTitle}</div>
                      <div className="text-xs font-mono text-black/40 mt-0.5">{app.tenderId}</div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                      app.status === "Shortlisted" ? "bg-slate-100 text-[#0F172A]" :
                      app.status === "Under Review" ? "bg-slate-100 text-[#0F172A]" :
                      app.status === "Unsuccessful" ? "bg-red-100 text-red-700" :
                      "bg-slate-100 text-[#0F172A]"
                    }`}>{app.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs mb-2">
                    <div><div className="text-black/40">Bid Amount</div><div className="font-semibold text-black mt-0.5">{app.bidAmount}</div></div>
                    <div><div className="text-black/40">Submitted</div><div className="text-black mt-0.5">{app.submittedAt}</div></div>
                    <div><div className="text-black/40">Documents</div><div className="text-black mt-0.5">{app.files.length} attached</div></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Past Bids ── */}
          {activeTab === "pastbids" && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-black mb-2">Past Bids, Applications & Submissions</div>
              <div className="flex gap-2 flex-wrap mb-3">
                {["All", "Tenders", "RFQs", "RFPs", "EOIs"].map(f => (
                  <button key={f} className="h-7 px-3 rounded-full text-xs font-medium bg-white border border-black/10 text-black/60 hover:bg-black hover:text-white transition-colors">{f}</button>
                ))}
              </div>
              {[
                { ref: "ZW-PRA-2026-00183", title: "Procurement of Antiretroviral Medicines (2-Year Framework)", type: "Tender", submitted: "2026-05-22", status: "Under Evaluation", amount: "USD 4,200,000" },
                { ref: "ZW-RFQ-2026-00142", title: "Office Supplies — ZIMRA Headquarters", type: "RFQ", submitted: "2026-04-15", status: "Awarded to Other", amount: "USD 48,500" },
                { ref: "ZW-PRA-2026-00128", title: "ICT Equipment Supply — Ministry of Education", type: "Tender", submitted: "2026-03-20", status: "Unsuccessful", amount: "USD 890,000" },
                { ref: "ZW-EOI-2026-00091", title: "Consultancy Services — Health Sector Reform", type: "EOI", submitted: "2026-02-10", status: "Shortlisted", amount: "USD 320,000" },
                { ref: "ZW-RFP-2026-00077", title: "Software Development — HR Management System", type: "RFP", submitted: "2026-01-28", status: "Awarded", amount: "USD 1,750,000" },
              ].map((bid, i) => (
                <div key={i} className="bg-white rounded-2xl border border-black/10 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-[11px] font-mono text-black/40">{bid.ref}</span>
                        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-[#0F172A]">{bid.type}</span>
                      </div>
                      <div className="text-sm font-semibold text-black">{bid.title}</div>
                      <div className="text-xs text-black/40 mt-0.5">Submitted: {bid.submitted}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-black">{bid.amount}</div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        bid.status === "Awarded" ? "bg-slate-100 text-[#0F172A]" :
                        bid.status === "Shortlisted" ? "bg-slate-100 text-[#0F172A]" :
                        bid.status === "Under Evaluation" ? "bg-slate-100 text-[#0F172A]" :
                        "bg-gray-100 text-gray-500"
                      }`}>{bid.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Workbench ── */}
          {activeTab === "workbench" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold text-black">Vendor Workbench</div>
                  <div className="text-xs text-black/40">Manage your active tenders, tasks, and procurement activities</div>
                </div>
                <Link to="/vendor-workbench/dashboard" className="h-9 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5" /> Open Full Workbench
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                {[
                  { label: "Active Tenders", value: "3", color: "text-[#0F172A]", bg: "bg-slate-50 border-slate-200" },
                  { label: "Tasks Due Today", value: "2", color: "text-red-600", bg: "bg-red-50 border-red-100" },
                  { label: "Documents Pending", value: "5", color: "text-[#0F172A]", bg: "bg-slate-50 border-slate-200" },
                ].map(k => (
                  <div key={k.label} className={`rounded-2xl border p-4 ${k.bg}`}>
                    <div className="text-xs text-black/40 mb-1">{k.label}</div>
                    <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-black/50 mb-2 uppercase tracking-wider">Active Case Files</div>
                {[
                  { ref: "ZW-PRA-2026-00183", title: "ARV Medicines Framework", stage: "Under Evaluation", due: "2026-07-10", task: "Submit technical addendum" },
                  { ref: "ZW-RFQ-2026-00201", title: "Medical Consumables Q3", stage: "Bid Preparation", due: "2026-07-05", task: "Upload BOQ and pricing schedule" },
                  { ref: "ZW-PRA-2026-00184", title: "Solar Mini-Grids — 12 Clinics", stage: "Bidding Open", due: "2026-07-08", task: "Finalise bid submission" },
                ].map((c, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-black/10 p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-black/40">{c.ref}</span>
                        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-[#0F172A]">{c.stage}</span>
                      </div>
                      <div className="text-sm font-semibold text-black truncate">{c.title}</div>
                      <div className="text-xs text-black/50 mt-0.5">Task: {c.task}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs text-black/40">Due</div>
                      <div className="text-xs font-semibold text-red-600">{c.due}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Mail ── */}
          {activeTab === "mail" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold text-black">Mail Inbox</div>
                  <div className="text-xs text-black/40">In-platform communication with procurement entities</div>
                </div>
                <button className="h-9 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Compose
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {["All Mail", "Unread", "Sent", "Archived"].map(f => (
                  <button key={f} className="h-8 rounded-xl border border-black/10 text-xs font-medium hover:bg-black hover:text-white transition-colors">{f}</button>
                ))}
              </div>
              <div className="bg-white rounded-2xl border border-black/10 overflow-hidden">
                {[
                  { from: "Procurement Officer — MOH", subject: "ARV Medicines — Clarification Request", preview: "Please provide the WHO pre-qualification certificates for the proposed ARV formulations...", time: "2026-06-24 10:30", unread: true, type: "Clarification" },
                  { from: "System — PRAZ Portal", subject: "Bid Acknowledgement — ZW-PRA-2026-00184", preview: "Your expression of interest for the Solar Mini-Grids tender has been received.", time: "2026-06-23 08:15", unread: true, type: "Notification" },
                  { from: "Finance Unit — ZIMRA", subject: "Invoice INV-2026-4821 — Payment Confirmation", preview: "Your invoice has been approved and queued for EFT payment.", time: "2026-06-21 14:00", unread: false, type: "Payment" },
                  { from: "CPO — Ministry of Health", subject: "Shortlisting Notification — ARV Framework", preview: "We are pleased to inform you that your bid has been shortlisted for financial evaluation.", time: "2026-06-20 09:00", unread: false, type: "Award" },
                  { from: "Procurement Officer — PRAZ", subject: "Bid Amendment Notice — ZW-PRA-2026-00183", preview: "Attention: Addendum 2 has been published. Please review and submit any updated bid documents.", time: "2026-06-19 16:30", unread: false, type: "Amendment" },
                ].map((m, i) => (
                  <div key={i} className={`flex items-start gap-3 px-5 py-4 border-b border-black/5 last:border-0 cursor-pointer hover:bg-[#EAF1F8] transition-colors ${m.unread ? "" : "opacity-70"}`}>
                    <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 mt-1.5 ${m.unread ? "bg-[#0F172A]" : "bg-transparent"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <span className={`text-sm truncate ${m.unread ? "font-semibold text-black" : "font-medium text-black/60"}`}>{m.from}</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            m.type === "Award" ? "bg-slate-100 text-[#0F172A]" :
                            m.type === "Payment" ? "bg-slate-100 text-[#0F172A]" :
                            m.type === "Clarification" ? "bg-slate-100 text-[#0F172A]" :
                            "bg-gray-100 text-gray-600"
                          }`}>{m.type}</span>
                          <span className="text-[10px] text-black/30">{m.time}</span>
                        </div>
                      </div>
                      <div className={`text-sm ${m.unread ? "font-medium text-black" : "text-black/70"} truncate`}>{m.subject}</div>
                      <div className="text-xs text-black/40 mt-0.5 truncate">{m.preview}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── My Catalogue ── */}
          {activeTab === "catalogue" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold text-black">My Product Catalogue</div>
                  <div className="text-xs text-black/40">{catalogueItems.length} item{catalogueItems.length !== 1 ? "s" : ""} registered</div>
                </div>
                <button onClick={() => setShowAddCatalogue(true)} className="h-9 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Add Item
                </button>
              </div>
              {catalogueItems.length === 0 ? (
                <div className="py-16 text-center bg-white rounded-2xl border border-black/10">
                  <Package className="h-12 w-12 text-black/20 mx-auto mb-4" />
                  <div className="text-sm font-medium text-black/50 mb-1">No catalogue items yet</div>
                  <div className="text-xs text-black/30 mb-4">Add your products and services to be matched with relevant tenders</div>
                  <button onClick={() => setShowAddCatalogue(true)} className="h-9 px-5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 flex items-center gap-1.5 mx-auto">
                    <Plus className="h-4 w-4" /> Add First Item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catalogueItems.map(item => (
                    <div key={item.id} className="bg-white rounded-2xl border border-black/10 shadow-sm p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-black truncate">{item.name}</div>
                          <div className="text-xs text-black/40">{item.genericName}</div>
                        </div>
                        <button onClick={() => setCatalogueItems(prev => prev.filter(c => c.id !== item.id))} className="h-6 w-6 rounded-lg hover:bg-red-50 text-black/30 hover:text-red-500 grid place-items-center">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs mb-3">
                        <div><span className="text-black/40">Category</span><div className="font-medium text-black mt-0.5">{item.category}</div></div>
                        <div><span className="text-black/40">Role</span><div className="font-medium text-black mt-0.5">{item.role}</div></div>
                        <div><span className="text-black/40">Stock</span><div className="font-medium text-black mt-0.5">{item.stock} units</div></div>
                        <div><span className="text-black/40">Unit Price</span><div className="font-medium text-black mt-0.5">{item.unitPrice}</div></div>
                      </div>
                      <div className="text-xs text-black/40 flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location}</div>
                    </div>
                  ))}
                </div>
              )}

              {showAddCatalogue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
                      <div className="text-sm font-bold text-black">Add Catalogue Item</div>
                      <button onClick={() => setShowAddCatalogue(false)}><X className="h-5 w-5 text-black/40" /></button>
                    </div>
                    <div className="px-5 py-4 space-y-3">
                      {([
                        ["Item Name", "name", "e.g. Laptop Computer"],
                        ["Generic Name", "genericName", "e.g. Computer Hardware"],
                        ["Category", "category", "e.g. ICT Equipment"],
                        ["Specifications", "specs", "e.g. Intel i7, 16GB RAM, 512GB SSD"],
                        ["Dimensions / Size", "dimensions", "e.g. 35cm × 24cm × 2cm"],
                        ["Unit Price (USD)", "unitPrice", "e.g. USD 850"],
                        ["Location / Depot", "location", "e.g. Harare, Zimbabwe"],
                      ] as [string, keyof CatalogueItem, string][]).map(([label, field, placeholder]) => (
                        <div key={field}>
                          <label className="text-xs font-semibold text-black/50 uppercase tracking-wider">{label}</label>
                          <input value={(newCatalogueItem[field] as string) ?? ""} onChange={e => setNewCatalogueItem(prev => ({ ...prev, [field]: e.target.value }))}
                            placeholder={placeholder}
                            className="mt-1 w-full h-10 px-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                        </div>
                      ))}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-black/50 uppercase tracking-wider">Role</label>
                          <select value={newCatalogueItem.role} onChange={e => setNewCatalogueItem(prev => ({ ...prev, role: e.target.value as CatalogueItem["role"] }))}
                            className="mt-1 w-full h-10 px-3 rounded-xl border border-black/10 text-sm bg-white focus:outline-none">
                            <option>Dealer</option><option>Manufacturer</option><option>Distributor</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-black/50 uppercase tracking-wider">Stock Qty</label>
                          <input type="number" value={newCatalogueItem.stock ?? ""} onChange={e => setNewCatalogueItem(prev => ({ ...prev, stock: Number(e.target.value) }))}
                            placeholder="0" className="mt-1 w-full h-10 px-3 rounded-xl border border-black/10 text-sm focus:outline-none" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 px-5 pb-5 pt-3 border-t border-black/10">
                      <button onClick={() => setShowAddCatalogue(false)} className="h-9 px-4 rounded-xl border border-black/10 text-sm hover:bg-black/5">Cancel</button>
                      <button onClick={() => {
                        if (!newCatalogueItem.name) return;
                        setCatalogueItems(prev => [...prev, { ...newCatalogueItem as CatalogueItem, id: `CAT-${Date.now()}`, photo: "" }]);
                        setNewCatalogueItem({ role: "Dealer" });
                        setShowAddCatalogue(false);
                      }} className="h-9 px-5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800">Save Item</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── My Notifications ── */}
          {activeTab === "notifications" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-black">{notifications.filter(n => !n.read).length} unread notification{notifications.filter(n => !n.read).length !== 1 ? "s" : ""}</div>
                <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} className="text-xs text-[#0F172A] hover:underline">Mark all as read</button>
              </div>
              <div className="space-y-2">
                {notifications.map(notif => (
                  <div key={notif.id} onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                    className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all ${notif.read ? "border-black/8 opacity-70" : "border-black/15 shadow-sm"}`}>
                    <div className="flex items-start gap-3">
                      <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${notif.read ? "bg-black/20" : notif.type === "success" ? "bg-[#0F172A]" : notif.type === "warning" ? "bg-[#0F172A]" : notif.type === "error" ? "bg-red-500" : "bg-[#0F172A]"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <div className="text-sm font-semibold text-black">{notif.title}</div>
                          <div className="text-xs text-black/40 flex-shrink-0">{notif.date}</div>
                        </div>
                        <div className="text-xs text-black/60 leading-relaxed">{notif.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Payment Tracker ── */}
          {activeTab === "payments" && (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Total Outstanding", value: "USD 3,460,000", color: "text-[#0F172A]" },
                  { label: "Approved / EFT Pending", value: "USD 2,840,000", color: "text-[#0F172A]" },
                  { label: "Paid YTD", value: "USD 180,000", color: "text-[#0F172A]" },
                  { label: "Rejected", value: "USD 45,000", color: "text-red-600" },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-2xl border border-black/10 p-4">
                    <div className="text-xs text-black/40 mb-1">{k.label}</div>
                    <div className={`text-base font-bold ${k.color}`}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {MOCK_PAYMENTS.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-black/10 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-mono text-black/40">{p.id}</span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            p.status === "Paid" ? "bg-slate-100 text-[#0F172A]" :
                            p.status === "Approved" ? "bg-slate-100 text-[#0F172A]" :
                            p.status === "Rejected" ? "bg-red-100 text-red-700" :
                            "bg-slate-100 text-[#0F172A]"
                          }`}>{p.status}</span>
                        </div>
                        <div className="text-sm font-semibold text-black">{p.description}</div>
                        <div className="text-xs text-black/40 mt-0.5">{p.contract} · Invoice: {p.invoiceRef}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-base font-bold text-black">{p.amount}</div>
                        <div className="text-xs text-black/40">Due: {p.dueDate}</div>
                      </div>
                    </div>
                    {p.status === "Rejected" && (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-xs text-red-700 flex items-center gap-1.5 mt-1">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" /> Payment rejected — please contact the finance office for reasons and resubmission.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Complaints ── */}
          {activeTab === "complaints" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm font-semibold text-black">Complaints & Disputes</div>
                  <div className="text-xs text-black/40">{complaints.length} filed · {complaints.filter(c => c.status === "Open" || c.status === "Under Review").length} active</div>
                </div>
                <button onClick={() => setShowNewComplaint(true)} className="h-9 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> File Complaint
                </button>
              </div>
              <div className="space-y-3">
                {complaints.map(c => (
                  <div key={c.id} className="bg-white rounded-2xl border border-black/10 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-mono text-black/40">{c.id}</span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            c.status === "Resolved" || c.status === "Closed" ? "bg-slate-100 text-[#0F172A]" :
                            c.status === "Under Review" ? "bg-slate-100 text-[#0F172A]" :
                            "bg-slate-100 text-[#0F172A]"
                          }`}>{c.status}</span>
                        </div>
                        <div className="text-sm font-semibold text-black">{c.subject}</div>
                        <div className="text-xs text-black/40 mt-0.5">Ref: {c.ref} · {c.category} · Filed: {c.filedDate}</div>
                      </div>
                    </div>
                    <div className="text-xs text-black/60 leading-relaxed mb-2">{c.description}</div>
                    {c.resolution && (
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-[#0F172A]">
                        <span className="font-medium">Resolution:</span> {c.resolution}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {showNewComplaint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
                      <div className="text-sm font-bold text-black">File a Complaint</div>
                      <button onClick={() => setShowNewComplaint(false)}><X className="h-5 w-5 text-black/40" /></button>
                    </div>
                    <div className="px-5 py-4 space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-black/50 uppercase tracking-wider">Subject</label>
                        <input value={newComplaint.subject} onChange={e => setNewComplaint(p => ({ ...p, subject: e.target.value }))} placeholder="Brief description of complaint"
                          className="mt-1 w-full h-10 px-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-black/50 uppercase tracking-wider">Tender / Contract Reference</label>
                        <input value={newComplaint.ref} onChange={e => setNewComplaint(p => ({ ...p, ref: e.target.value }))} placeholder="e.g. ZW-PRA-2026-00183"
                          className="mt-1 w-full h-10 px-3 rounded-xl border border-black/10 text-sm focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-black/50 uppercase tracking-wider">Category</label>
                        <select value={newComplaint.category} onChange={e => setNewComplaint(p => ({ ...p, category: e.target.value }))}
                          className="mt-1 w-full h-10 px-3 rounded-xl border border-black/10 text-sm bg-white focus:outline-none">
                          <option>Evaluation Error</option><option>Specification Bias</option><option>Payment Dispute</option>
                          <option>Procedural Breach</option><option>Conflict of Interest</option><option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-black/50 uppercase tracking-wider">Description</label>
                        <textarea value={newComplaint.description} onChange={e => setNewComplaint(p => ({ ...p, description: e.target.value }))} rows={4}
                          placeholder="Describe the issue in detail with supporting evidence references…"
                          className="mt-1 w-full px-3 py-2 rounded-xl border border-black/10 text-sm resize-none focus:outline-none" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 px-5 pb-5 pt-3 border-t border-black/10">
                      <button onClick={() => setShowNewComplaint(false)} className="h-9 px-4 rounded-xl border border-black/10 text-sm hover:bg-black/5">Cancel</button>
                      <button onClick={() => {
                        if (!newComplaint.subject) return;
                        setComplaints(prev => [...prev, { ...newComplaint, id: `CMP-${Date.now()}`, status: "Open", filedDate: new Date().toISOString().split("T")[0] }]);
                        setNewComplaint({ subject: "", ref: "", category: "Evaluation Error", description: "" });
                        setShowNewComplaint(false);
                      }} className="h-9 px-5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800">Submit</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── My KYC ── */}
          {activeTab === "kyc" && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-[#0F172A] flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-[#0F172A]">KYC Status: Verified</div>
                  <div className="text-xs text-[#0F172A]">Last reviewed: 2026-03-15 · Next renewal: 2027-03-15</div>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-5">
                <div className="text-sm font-semibold text-black mb-4">Company Information</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Company Name", value: user?.entity ?? "—" },
                    { label: "Registration Number", value: "ZW-REG-2018-04821" },
                    { label: "Tax Clearance Number", value: "TC-2026-08821" },
                    { label: "PRAZ Registration", value: "PRAZ-2024-00312" },
                    { label: "VAT Number", value: "V40004821" },
                    { label: "Physical Address", value: "14 Baker Avenue, Harare" },
                    { label: "Phone", value: "+263 242 700 821" },
                    { label: "Email", value: user?.email ?? "—" },
                  ].map(field => (
                    <div key={field.label}>
                      <div className="text-xs text-black/40 mb-0.5">{field.label}</div>
                      <div className="text-sm font-medium text-black">{field.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-5">
                <div className="text-sm font-semibold text-black mb-4">KYC Documents</div>
                <div className="space-y-2">
                  {[
                    { doc: "Certificate of Incorporation", status: "Valid", expiry: "Permanent" },
                    { doc: "Tax Clearance Certificate", status: "Expiring Soon", expiry: "2026-07-09" },
                    { doc: "PRAZ Registration Certificate", status: "Valid", expiry: "2027-01-31" },
                    { doc: "Audited Financial Statements (2025)", status: "Valid", expiry: "Annual" },
                    { doc: "Director ID Copies", status: "Valid", expiry: "2028-04-22" },
                    { doc: "Bank Account Confirmation Letter", status: "Valid", expiry: "2026-12-31" },
                    { doc: "Conflict of Interest Declaration", status: "Valid", expiry: "Annual" },
                    { doc: "Ultimate Beneficial Ownership Form", status: "Valid", expiry: "Annual" },
                  ].map(d => (
                    <div key={d.doc} className="flex items-center justify-between p-3 rounded-xl border border-black/8 hover:bg-black/2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-black/30" />
                        <span className="text-sm text-black">{d.doc}</span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-black/40">{d.expiry}</span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${d.status === "Valid" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{d.status}</span>
                        <button className="h-7 px-2.5 rounded-lg border border-black/10 text-xs hover:bg-black/5 flex items-center gap-1">
                          <Upload className="h-3 w-3" /> Update
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Settings ── */}
          {activeTab === "settings" && (
            <div className="space-y-4 max-w-2xl">
              <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-5">
                <div className="text-sm font-semibold text-black mb-4">Account Details</div>
                <div className="space-y-3">
                  {[
                    { label: "Full Name", value: user?.name ?? "", type: "text" },
                    { label: "Email Address", value: user?.email ?? "", type: "email" },
                    { label: "Phone Number", value: "+263 77 123 4567", type: "tel" },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="text-xs font-semibold text-black/50 uppercase tracking-wider">{field.label}</label>
                      <input defaultValue={field.value} type={field.type}
                        className="mt-1 w-full h-10 px-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-5">
                <div className="text-sm font-semibold text-black mb-4">Notification Preferences</div>
                <div className="space-y-3">
                  {[
                    "New tenders matching my categories",
                    "Application status updates",
                    "Award notifications",
                    "Payment approvals and EFT confirmations",
                    "Document expiry reminders (30 days notice)",
                    "Complaint status updates",
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-black">{pref}</span>
                      <div className="h-6 w-10 rounded-full bg-[#0F172A] relative cursor-pointer flex-shrink-0">
                        <div className="h-5 w-5 rounded-full bg-white absolute top-0.5 right-0.5 shadow-sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-black/10 shadow-sm p-5">
                <div className="text-sm font-semibold text-black mb-3">Category Preferences</div>
                <div className="text-xs text-black/40 mb-3">Select the procurement categories you operate in to receive matched tender alerts.</div>
                <div className="flex flex-wrap gap-2">
                  {["ICT & Technology", "Construction & Civil", "Medical Supplies", "Office Supplies", "Consulting Services", "Transport & Logistics", "Food & Agriculture", "Energy & Solar", "Security Services", "Training & Education"].map(cat => (
                    <button key={cat} className="h-7 px-3 rounded-full text-xs font-medium bg-slate-100 text-[#0F172A] border border-slate-200 hover:bg-slate-200 transition-colors">{cat}</button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button className="h-9 px-5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800">Save Changes</button>
              </div>
            </div>
          )}

          {/* ── Communications CRM ── */}
          {activeTab === "comm-crm" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold text-black">Communications</div>
                  <div className="text-xs text-black/40">Manage all outgoing and incoming communications with government entities</div>
                </div>
                <button className="h-9 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> New Communication
                </button>
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total Sent", value: "48", color: "text-[#0F172A]" },
                  { label: "Awaiting Reply", value: "7", color: "text-[#0F172A]" },
                  { label: "Resolved", value: "39", color: "text-[#0F172A]" },
                  { label: "Escalated", value: "2", color: "text-red-600" },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-2xl border border-black/10 p-4">
                    <div className="text-xs text-black/40 mb-1">{k.label}</div>
                    <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { ref: "COMM-2026-048", subject: "Request for Clarification — Tender ZW-PRA-2026-00183", to: "Ministry of Health Procurement Unit", date: "2026-06-20", status: "Replied", type: "Clarification" },
                  { ref: "COMM-2026-047", subject: "Delivery Notification — Contract CN-2026-0411 Milestone 3", to: "Finance Unit — MOF", date: "2026-06-18", status: "Acknowledged", type: "Notification" },
                  { ref: "COMM-2026-046", subject: "Appeal Against Disqualification — ZW-PRA-2026-00168", to: "PRAZ Oversight Committee", date: "2026-06-12", status: "Under Review", type: "Appeal" },
                  { ref: "COMM-2026-045", subject: "Variation Order Request — CN-2026-0344", to: "CPO — Ministry of Education", date: "2026-05-30", status: "Awaiting Reply", type: "Request" },
                ].map((c, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-black/10 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-mono text-black/40">{c.ref}</span>
                          <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                            c.type === "Appeal" ? "bg-red-100 text-red-700" : c.type === "Clarification" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"
                          }`}>{c.type}</span>
                        </div>
                        <div className="text-sm font-semibold text-black">{c.subject}</div>
                        <div className="text-xs text-black/40 mt-0.5">To: {c.to} · {c.date}</div>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        c.status === "Replied" || c.status === "Acknowledged" ? "bg-slate-100 text-[#0F172A]" :
                        c.status === "Under Review" ? "bg-slate-100 text-[#0F172A]" :
                        "bg-slate-100 text-[#0F172A]"
                      }`}>{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Service Delivery Complaints CRM ── */}
          {activeTab === "service-crm" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold text-black">Service Delivery Complaints</div>
                  <div className="text-xs text-black/40">Log and track service delivery issues with government procurement entities</div>
                </div>
                <button className="h-9 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Log Complaint
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total Logged", value: "12", color: "text-[#0F172A]" },
                  { label: "Open", value: "4", color: "text-red-600" },
                  { label: "Under Investigation", value: "3", color: "text-[#0F172A]" },
                  { label: "Resolved", value: "5", color: "text-[#0F172A]" },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-2xl border border-black/10 p-4">
                    <div className="text-xs text-black/40 mb-1">{k.label}</div>
                    <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { ref: "SDC-2026-012", issue: "Delayed payment beyond contracted 30-day terms", entity: "Ministry of Finance", logged: "2026-06-01", status: "Under Investigation", priority: "High" },
                  { ref: "SDC-2026-011", issue: "Failure to issue purchase order after contract signing", entity: "Ministry of Health", logged: "2026-05-20", status: "Open", priority: "High" },
                  { ref: "SDC-2026-009", issue: "Incorrect tender specifications causing additional compliance costs", entity: "PRAZ", logged: "2026-05-05", status: "Resolved", priority: "Medium" },
                  { ref: "SDC-2026-007", issue: "Communication breakdown — no response to clarification requests", entity: "Ministry of Education", logged: "2026-04-18", status: "Resolved", priority: "Low" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-black/10 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-mono text-black/40">{s.ref}</span>
                          <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                            s.priority === "High" ? "bg-red-100 text-red-700" : s.priority === "Medium" ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-600"
                          }`}>{s.priority}</span>
                        </div>
                        <div className="text-sm font-semibold text-black">{s.issue}</div>
                        <div className="text-xs text-black/40 mt-0.5">{s.entity} · Logged: {s.logged}</div>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        s.status === "Resolved" ? "bg-slate-100 text-[#0F172A]" :
                        s.status === "Under Investigation" ? "bg-slate-100 text-[#0F172A]" :
                        "bg-red-100 text-red-700"
                      }`}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Recruitment CRM ── */}
          {activeTab === "recruit-crm" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold text-black">Recruitment</div>
                  <div className="text-xs text-black/40">Browse and apply for employment opportunities advertised through the portal</div>
                </div>
                <button className="h-9 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Submit Application
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Open Vacancies", value: "24", color: "text-[#0F172A]" },
                  { label: "Applications Made", value: "3", color: "text-[#0F172A]" },
                  { label: "Shortlisted", value: "1", color: "text-[#0F172A]" },
                  { label: "Interviews Scheduled", value: "1", color: "text-[#0F172A]" },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-2xl border border-black/10 p-4">
                    <div className="text-xs text-black/40 mb-1">{k.label}</div>
                    <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { ref: "VAC-2026-024", title: "Senior Procurement Officer — Grade D4", entity: "Ministry of Finance", type: "Permanent", closing: "2026-07-31", salary: "USD 2,400 – 3,200/month", location: "Harare", applied: false },
                  { ref: "VAC-2026-021", title: "Logistics Coordinator — Supply Chain Unit", entity: "Ministry of Health", type: "Contract", closing: "2026-07-20", salary: "USD 1,800 – 2,400/month", location: "Harare", applied: true },
                  { ref: "VAC-2026-019", title: "ICT Systems Administrator", entity: "ZIMRA", type: "Permanent", closing: "2026-07-15", salary: "USD 2,100 – 2,800/month", location: "Bulawayo", applied: false },
                  { ref: "VAC-2026-015", title: "Graduate Trainee — Procurement", entity: "PRAZ", type: "Internship", closing: "2026-07-10", salary: "Stipend USD 600/month", location: "Harare", applied: true },
                ].map((v, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-black/10 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-mono text-black/40">{v.ref}</span>
                          <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${
                            v.type === "Permanent" ? "bg-slate-100 text-[#0F172A]" : v.type === "Contract" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"
                          }`}>{v.type}</span>
                        </div>
                        <div className="text-sm font-semibold text-black">{v.title}</div>
                        <div className="text-xs text-black/50 mt-0.5">{v.entity} · {v.location}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-semibold text-black">{v.salary}</div>
                        <div className="text-[11px] text-black/40 flex items-center gap-1 mt-0.5"><Clock className="h-3 w-3" /> Closes {v.closing}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {v.applied ? (
                        <span className="h-8 px-3 rounded-xl bg-slate-100 text-[#0F172A] text-xs font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                        </span>
                      ) : (
                        <button className="h-8 px-4 rounded-xl bg-[#0F172A] text-white text-xs font-medium hover:bg-[#0F172A] transition-colors flex items-center gap-1.5">
                          <Send className="h-3 w-3" /> Apply Now
                        </button>
                      )}
                      <button className="h-8 px-3 rounded-xl border border-black/10 text-xs text-black/60 hover:bg-black/5 transition-colors flex items-center gap-1.5">
                        <Eye className="h-3 w-3" /> View Details
                      </button>
                      <button className="h-8 px-3 rounded-xl border border-black/10 text-xs text-black/60 hover:bg-black/5 transition-colors flex items-center gap-1.5">
                        <Share2 className="h-3 w-3" /> Share
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Services Applications CRM ── */}
          {activeTab === "services-crm" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold text-black">Services Applications</div>
                  <div className="text-xs text-black/40">Apply for and track government service applications and approvals</div>
                </div>
                <button className="h-9 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> New Application
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Applications Submitted", value: "9", color: "text-[#0F172A]" },
                  { label: "Pending Review", value: "3", color: "text-[#0F172A]" },
                  { label: "Approved", value: "5", color: "text-[#0F172A]" },
                  { label: "Rejected / Returned", value: "1", color: "text-red-600" },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-2xl border border-black/10 p-4">
                    <div className="text-xs text-black/40 mb-1">{k.label}</div>
                    <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { ref: "SVC-2026-009", service: "PRAZ Supplier Registration Renewal", category: "Registration", submitted: "2026-06-10", status: "Approved", notes: "Renewed until 2027-06-30" },
                  { ref: "SVC-2026-008", service: "Tax Clearance Application — 2026/27", category: "Compliance", submitted: "2026-06-01", status: "Pending Review", notes: "ZIMRA processing" },
                  { ref: "SVC-2026-007", service: "Export Permit — Medical Supplies (Batch 4)", category: "Export / Import", submitted: "2026-05-22", status: "Approved", notes: "Permit valid 90 days" },
                  { ref: "SVC-2026-005", service: "Change of Directorship — Company CR14", category: "Company Registry", submitted: "2026-04-15", status: "Pending Review", notes: "Awaiting ZIMRA confirmation" },
                  { ref: "SVC-2026-003", service: "VAT Registration Amendment", category: "Compliance", submitted: "2026-03-20", status: "Rejected / Returned", notes: "Incomplete supporting documents — resubmit" },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-black/10 shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs font-mono text-black/40">{s.ref}</span>
                          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-[#0F172A]">{s.category}</span>
                        </div>
                        <div className="text-sm font-semibold text-black">{s.service}</div>
                        <div className="text-xs text-black/40 mt-0.5">Submitted: {s.submitted} · {s.notes}</div>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        s.status === "Approved" ? "bg-slate-100 text-[#0F172A]" :
                        s.status.includes("Rejected") ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-[#0F172A]"
                      }`}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Annual Returns CRM ── */}
          {activeTab === "returns-crm" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-semibold text-black">Annual Returns</div>
                  <div className="text-xs text-black/40">Submit and manage annual company and individual returns</div>
                </div>
                <button className="h-9 px-4 rounded-xl bg-black text-white text-xs font-medium hover:bg-gray-800 flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Submit Returns
                </button>
              </div>
              {/* Compliance alert */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-[#0F172A] flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-[#0F172A]">Annual Returns Due — 2026 Filing Season</div>
                  <div className="text-xs text-[#0F172A] mt-0.5">Company annual returns for FY 2025/26 must be submitted to ZIMRA and CIPZ by 31 August 2026. Late filing attracts penalties.</div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Returns Filed", value: "4", color: "text-[#0F172A]" },
                  { label: "Pending Filing", value: "2", color: "text-[#0F172A]" },
                  { label: "Overdue", value: "0", color: "text-red-600" },
                  { label: "Next Due Date", value: "31 Aug", color: "text-[#0F172A]" },
                ].map(k => (
                  <div key={k.label} className="bg-white rounded-2xl border border-black/10 p-4">
                    <div className="text-xs text-black/40 mb-1">{k.label}</div>
                    <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                  </div>
                ))}
              </div>
              {/* Returns table */}
              <div className="bg-white rounded-2xl border border-black/10 overflow-hidden">
                <div className="px-4 py-3 border-b border-black/8">
                  <div className="text-xs font-semibold text-black">Filing History</div>
                </div>
                <div className="divide-y divide-black/5">
                  {[
                    { year: "FY 2024/25", type: "Company Annual Returns — CIPZ", dueDate: "2025-08-31", filedDate: "2025-07-15", status: "Filed", receiptRef: "CIPZ-RET-2025-4821" },
                    { year: "FY 2024/25", type: "Tax Returns — Corporate Income Tax", dueDate: "2025-09-30", filedDate: "2025-09-10", status: "Filed", receiptRef: "ZIMRA-CIT-2025-88912" },
                    { year: "FY 2024/25", type: "VAT Annual Reconciliation", dueDate: "2025-01-31", filedDate: "2025-01-20", status: "Filed", receiptRef: "ZIMRA-VAT-2025-44120" },
                    { year: "FY 2023/24", type: "Company Annual Returns — CIPZ", dueDate: "2024-08-31", filedDate: "2024-08-28", status: "Filed", receiptRef: "CIPZ-RET-2024-3614" },
                    { year: "FY 2025/26", type: "Company Annual Returns — CIPZ", dueDate: "2026-08-31", filedDate: "—", status: "Pending", receiptRef: "—" },
                    { year: "FY 2025/26", type: "Tax Returns — Corporate Income Tax", dueDate: "2026-09-30", filedDate: "—", status: "Pending", receiptRef: "—" },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-black/2 transition-colors">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-black">{r.type}</div>
                        <div className="text-xs text-black/40 mt-0.5">{r.year} · Due: {r.dueDate} · Ref: {r.receiptRef}</div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {r.filedDate !== "—" && <span className="text-xs text-black/40">Filed: {r.filedDate}</span>}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          r.status === "Filed" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"
                        }`}>{r.status}</span>
                        {r.status === "Pending" && (
                          <button className="h-7 px-3 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors">
                            File Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Tender Detail Modal */}
      {detailTender && (
        <TenderDetailModal tender={detailTender} onClose={() => setDetailTender(null)}
          onApply={() => { setBidTender(detailTender); setDetailTender(null); }} />
      )}

      {/* Apply Modal */}
      {bidTender && (
        <BidModal tender={bidTender} onClose={() => setBidTender(null)}
          onSubmit={(app) => { setApplications(prev => [app, ...prev]); setBidTender(null); setActiveTab("myapps"); }} />
      )}
    </div>
  );
}
