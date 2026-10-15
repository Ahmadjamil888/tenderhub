import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useTenders } from "@/hooks/use-store";
import { useAuth } from "@/lib/auth-context";
import { pushNotification } from "@/lib/local-store";
import { toast } from "@/lib/toast";
import {
  Plus, Download, Search, FileText, Clock, CheckCircle2, XCircle,
  Filter, LayoutGrid, Table2, ChevronDown, ChevronLeft, ChevronRight, X, Timer, Calendar,
  Building2, Tag, Banknote, Users, Bell, Eye, FileDown, Send, MapPin, Upload,
  Edit3, Sparkles, Trash2, Save, Printer, AlertTriangle, Zap,
} from "lucide-react";
import GisMapView from "@/components/GisMapView";
import { TENDER_PINS } from "@/lib/gis-data";
import { ZW_MINISTRIES, getMinistryOptions, getDepartmentsForMinistry } from "@/lib/zw-ministries";
import InlineWorkbench from "@/components/InlineWorkbench";


// ── Types ──────────────────────────────────────────────────────────────────

type TenderDoc = { name: string; type: string; size: string; url?: string };

const TENDER_STATUSES = [
  "Draft", "Approval Pending", "Published", "Pre-Bid Meeting",
  "Bidding Open", "Bid Closing Soon", "Bid Closed", "Opening",
  "Evaluation", "Award Recommended", "Awarded", "Contract Signed",
] as const;
type TenderStatus = typeof TENDER_STATUSES[number];

const STATUS_COLORS: Record<TenderStatus, string> = {
  "Draft": "bg-gray-100 text-gray-600",
  "Approval Pending": "bg-slate-100 text-[#0F172A]",
  "Published": "bg-slate-100 text-[#0F172A]",
  "Pre-Bid Meeting": "bg-slate-100 text-[#0F172A]",
  "Bidding Open": "bg-slate-100 text-[#0F172A]",
  "Bid Closing Soon": "bg-slate-100 text-[#0F172A]",
  "Bid Closed": "bg-red-100 text-red-700",
  "Opening": "bg-slate-100 text-[#0F172A]",
  "Evaluation": "bg-slate-100 text-[#0F172A]",
  "Award Recommended": "bg-slate-100 text-slate-500",
  "Awarded": "bg-slate-100 text-[#0F172A]",
  "Contract Signed": "bg-gray-100 text-gray-800",
};

const CATEGORIES = [
  "Infrastructure & Construction", "Health & Pharmaceuticals", "ICT & Digital Systems",
  "Agriculture & Food Security", "Education & Training", "Energy & Power",
  "Water & Sanitation", "Transport & Logistics", "Defence & Security",
  "Environmental Services", "Mining & Resources", "Financial Services",
  "Professional Services", "Consulting & Advisory", "Media & Communications",
  "Office Supplies & Stationery", "Furniture & Fittings", "Medical Equipment",
  "Laboratory Equipment", "Printing & Publishing", "Legal Services",
  "Audit & Accounting", "Research & Development", "Security Services",
];

const METHODS = ["Open Competitive", "Restricted", "Direct Procurement", "Framework Agreement", "RFQ", "RFP", "EOI"];

// ── Mock Extended Tender Data ─────────────────────────────────────────────

export type EnhancedTender = {
  id: string; title: string; entity: string; ministry: string;
  department: string; category: string; method: string;
  estimatedValue: string; currency: string;
  status: TenderStatus; bids: number;
  publishedDate: string; bidOpenDate: string;
  bidCloseDate: string; bidOpeningDate: string;
  preBidDate: string; preBidLocation: string;
  documentFee: string; emd: string;
  description: string; validityDays: number;
  relaxationMinutes: number;
};

const MOCK_TENDERS: EnhancedTender[] = [
  {
    id: "ZW-PRA-2026-00184", title: "Supply & Installation of Solar Mini-Grids — 12 Rural Clinics",
    entity: "Ministry of Energy and Power Development", ministry: "moepd",
    department: "Renewable Energy", category: "Energy & Power", method: "Open Competitive",
    estimatedValue: "14,800,000", currency: "USD", status: "Bidding Open", bids: 11,
    publishedDate: "2026-05-01T08:00", bidOpenDate: "2026-05-20T09:00",
    bidCloseDate: "2026-07-08T16:00", bidOpeningDate: "2026-07-09T10:00",
    preBidDate: "2026-05-25T10:00", preBidLocation: "Ministry of Energy Boardroom, Livingstone House, Harare",
    documentFee: "USD 500", emd: "USD 148,000",
    description: "Supply, installation, commissioning and maintenance of solar mini-grid systems at 12 rural clinics across 4 provinces.",
    validityDays: 120, relaxationMinutes: 30,
  },
  {
    id: "ZW-PRA-2026-00183", title: "Procurement of Antiretroviral Medicines (2-Year Framework)",
    entity: "Ministry of Health and Child Care", ministry: "moh",
    department: "Pharmacy and Medicines", category: "Health & Pharmaceuticals", method: "Framework Agreement",
    estimatedValue: "42,500,000", currency: "USD", status: "Evaluation", bids: 8,
    publishedDate: "2026-03-15T08:00", bidOpenDate: "2026-04-01T09:00",
    bidCloseDate: "2026-06-12T16:00", bidOpeningDate: "2026-06-13T10:00",
    preBidDate: "2026-04-10T10:00", preBidLocation: "MOH Conference Hall, Kaguvi Building",
    documentFee: "USD 1,000", emd: "USD 425,000",
    description: "National framework agreement for supply of essential ARV medicines including TDF/3TC, EFV and paediatric formulations.",
    validityDays: 180, relaxationMinutes: 0,
  },
  {
    id: "ZW-PRA-2026-00182", title: "National Tax Administration System — Phase II",
    entity: "ZIMRA", ministry: "mof",
    department: "Revenue and Taxation Policy", category: "ICT & Digital Systems", method: "Restricted",
    estimatedValue: "9,200,000", currency: "USD", status: "Bidding Open", bids: 5,
    publishedDate: "2026-05-10T08:00", bidOpenDate: "2026-06-01T09:00",
    bidCloseDate: "2026-07-21T16:00", bidOpeningDate: "2026-07-22T10:00",
    preBidDate: "2026-06-10T09:00", preBidLocation: "ZIMRA Head Office, Harare",
    documentFee: "USD 500", emd: "USD 92,000",
    description: "Development and implementation of integrated tax administration system phase II including taxpayer portal and analytics.",
    validityDays: 90, relaxationMinutes: 60,
  },
  {
    id: "ZW-PRA-2026-00181", title: "Rehabilitation of Beitbridge–Harare Highway (Section 4)",
    entity: "Ministry of Transport and Infrastructural Development", ministry: "mot",
    department: "Infrastructure Projects", category: "Infrastructure & Construction", method: "Open Competitive",
    estimatedValue: "88,000,000", currency: "USD", status: "Published", bids: 0,
    publishedDate: "2026-06-01T08:00", bidOpenDate: "2026-07-01T09:00",
    bidCloseDate: "2026-08-04T16:00", bidOpeningDate: "2026-08-05T10:00",
    preBidDate: "2026-07-08T10:00", preBidLocation: "Ministry of Transport Conference Room, Harare",
    documentFee: "USD 2,000", emd: "USD 880,000",
    description: "Rehabilitation and upgrading of 148km section of Beitbridge–Harare corridor including bridges and drainage.",
    validityDays: 180, relaxationMinutes: 30,
  },
  {
    id: "ZW-PRA-2026-00180", title: "Supply of Fertiliser — Pfumvudza Programme 2026/27",
    entity: "Ministry of Agriculture", ministry: "moam",
    department: "Agricultural Production and Extension", category: "Agriculture & Food Security", method: "Open Competitive",
    estimatedValue: "31,400,000", currency: "USD", status: "Awarded", bids: 14,
    publishedDate: "2026-01-10T08:00", bidOpenDate: "2026-02-01T09:00",
    bidCloseDate: "2026-05-30T16:00", bidOpeningDate: "2026-05-31T10:00",
    preBidDate: "2026-02-15T10:00", preBidLocation: "Ministry of Agriculture Boardroom, Harare",
    documentFee: "USD 750", emd: "USD 314,000",
    description: "Supply and delivery of blended NPK fertiliser (Compound D and AN) for the 2026/27 Pfumvudza programme.",
    validityDays: 120, relaxationMinutes: 0,
  },
  {
    id: "ZW-PRA-2026-00179", title: "School Textbooks — Primary Grades 1–7",
    entity: "Ministry of Primary and Secondary Education", ministry: "mopse",
    department: "Curriculum Development", category: "Education & Training", method: "Open Competitive",
    estimatedValue: "6,700,000", currency: "USD", status: "Bidding Open", bids: 12,
    publishedDate: "2026-05-15T08:00", bidOpenDate: "2026-06-01T09:00",
    bidCloseDate: "2026-07-02T16:00", bidOpeningDate: "2026-07-03T10:00",
    preBidDate: "2026-06-08T10:00", preBidLocation: "MOPSE Boardroom, Ambassador House",
    documentFee: "USD 300", emd: "USD 67,000",
    description: "Printing and supply of primary school textbooks for grades 1-7, all subjects, covering 1.2 million students.",
    validityDays: 90, relaxationMinutes: 30,
  },
  {
    id: "ZW-PRA-2026-00178", title: "Construction of 4 District Hospitals",
    entity: "Ministry of Health and Child Care", ministry: "moh",
    department: "Curative and Clinical Services", category: "Infrastructure & Construction", method: "Open Competitive",
    estimatedValue: "56,000,000", currency: "USD", status: "Draft", bids: 0,
    publishedDate: "2026-09-15T08:00", bidOpenDate: "2026-10-01T09:00",
    bidCloseDate: "2026-11-30T16:00", bidOpeningDate: "2026-12-01T10:00",
    preBidDate: "2026-10-10T10:00", preBidLocation: "MOH Conference Hall, Kaguvi Building",
    documentFee: "USD 1,500", emd: "USD 560,000",
    description: "Design and construction of 4 new district hospitals in Mashonaland West, Manicaland, Masvingo and Matebeleland North.",
    validityDays: 180, relaxationMinutes: 60,
  },
];


// ── Countdown Timer Component ─────────────────────────────────────────────

function CountdownTimer({ target, label, color = "text-[#0F172A]" }: { target: string; label: string; color?: string }) {
  const [diff, setDiff] = useState(0);

  useEffect(() => {
    const calc = () => setDiff(new Date(target).getTime() - Date.now());
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (diff <= 0) return <span className="text-xs text-red-500 font-medium">{label}: Expired</span>;

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex items-center gap-1">
      <Timer className="h-3 w-3 text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground">{label}:</span>
      <span className={`text-[11px] font-mono font-bold ${color}`}>
        {d > 0 ? `${d}d ` : ""}{h}h {m}m {s}s
      </span>
    </div>
  );
}

// ── New Tender — Full-Page 7-Step Registration Form ──────────────────────

const TENDER_STEPS = [
  { id: 1, label: "Ratio & Method",    short: "Ratio"      },
  { id: 2, label: "Tender Details",    short: "Details"    },
  { id: 3, label: "Scope & Specs",     short: "Specs"      },
  { id: 4, label: "Compliance",        short: "Compliance" },
  { id: 5, label: "Evaluation Design", short: "Evaluation" },
  { id: 6, label: "Committee",         short: "Committee"  },
  { id: 7, label: "Review & Submit",   short: "Submit"     },
];

const EVAL_METHODS_LIST = [
  { v: "QCBS",  l: "QCBS — Quality and Cost Based Selection"   },
  { v: "LRB",   l: "LRB — Lowest Responsive Bidder"           },
  { v: "LERB",  l: "LERB — Lowest Evaluated Responsive Bidder"},
  { v: "QBS",   l: "QBS — Quality Based Selection"            },
  { v: "Fixed", l: "Fixed Budget Selection"                   },
  { v: "CQS",   l: "CQS — Consultant Qualification Selection" },
  { v: "SSS",   l: "SSS — Single Source Selection"            },
];

const PROC_TYPES_LIST  = ["Open Tender","RFQ","RFP","EOI","Auction","RFI","Framework","Direct"];
const PROC_METHODS_LIST = ["Open Competitive","Restricted Competitive","Direct Procurement","Framework Agreement","Emergency Procurement","Single Source"];

const DEFAULT_COMPLIANCE_ITEMS = [
  { id:1,  type:"Standard", label:"Valid bid bond / tender security submitted"                        },
  { id:2,  type:"Standard", label:"Bid submitted before closing deadline"                             },
  { id:3,  type:"Standard", label:"Bid properly signed, sealed and witnessed"                        },
  { id:4,  type:"Standard", label:"Correct bid form used (as issued)"                               },
  { id:5,  type:"Standard", label:"All mandatory documents included and complete"                    },
  { id:6,  type:"Standard", label:"Valid tax clearance certificate (ZIMRA)"                          },
  { id:7,  type:"Standard", label:"Valid PRAZ registration certificate"                              },
  { id:8,  type:"Standard", label:"Valid company registration documents"                             },
  { id:9,  type:"Standard", label:"Company solvency — not blacklisted"                               },
  { id:10, type:"Standard", label:"Directors criminal records check"                                 },
  { id:11, type:"Optional", label:"Company liquidity ratio check"                                   },
  { id:12, type:"Optional", label:"Gearing ratio < 40% (Debt to Assets)"                           },
  { id:13, type:"Optional", label:"Shareholders criminal record check"                              },
  { id:14, type:"Optional", label:"Directors court cases — fraud/theft/tax evasion"                },
  { id:15, type:"Optional", label:"BEE / indigenisation compliance"                                 },
  { id:16, type:"Optional", label:"Insurance coverage (professional indemnity)"                    },
  { id:17, type:"Optional", label:"Affirmative action compliance"                                   },
  { id:18, type:"Optional", label:"Conflict of interest declaration signed"                         },
];

const DEFAULT_TECH = [
  { id:"T1",  label:"Technical Skills & Competency",             wt:15, subs:["Core expertise demonstrated","Professional certifications","Technical capacity of firm"] },
  { id:"T2",  label:"Teams Relevant Technical Experience",       wt:10, subs:["Similar projects completed","Team qualifications","Years in sector"] },
  { id:"T3",  label:"Academic Qualifications (Degree+)",         wt:10, subs:["Lead professional qualification","Team academic credentials"] },
  { id:"T4",  label:"More than 3 Years in Industry",             wt:5,  subs:["Company registration date","Proof of 3+ years trading"] },
  { id:"T5",  label:"Machinery & Equipment",                     wt:5,  subs:["Equipment list provided","Ownership/lease proof"] },
  { id:"T6",  label:"Scale of Operations",                       wt:5,  subs:["Turnover evidence","Number of permanent staff"] },
  { id:"T7",  label:"Technical Proposal / Methodology",          wt:20, subs:["Logical work plan","Risk mitigation","Quality assurance"] },
  { id:"T8",  label:"Risk Profile",                              wt:5,  subs:["Risk register provided","Insurance coverage"] },
  { id:"T9",  label:"More than 10 Completed Past Projects",      wt:5,  subs:["Project list","Completion certificates"] },
  { id:"T10", label:"Reference Letters from Past Projects",      wt:10, subs:["3+ reference letters","Govt entity references"] },
  { id:"T11", label:"More than 3 Large Completed Projects",      wt:3,  subs:["Large project definition met","Satisfactory completion"] },
  { id:"T12", label:"Directors Competency Online Test",          wt:4,  subs:["Test completed","Pass mark achieved"] },
  { id:"T13", label:"Technical Team Competency Online Test",     wt:3,  subs:["All key personnel tested","Team aggregate score"] },
];

const DEFAULT_FIN = [
  { id:"F1", label:"Total Bid Price (Lowest = Full Marks)", wt:70, subs:["Price arithmetic verified","Unit rates reasonable"] },
  { id:"F2", label:"Financial Capacity & Stability",        wt:15, subs:["Audited financials 3 years","Positive net worth"] },
  { id:"F3", label:"Payment Terms Favourability",           wt:5,  subs:["Advance payment terms","Milestone alignment"] },
  { id:"F4", label:"Life-Cycle / Total Cost of Ownership",  wt:5,  subs:["Operating cost stated","Maintenance estimate"] },
  { id:"F5", label:"Local Content / Indigenisation %",      wt:5,  subs:["Local procurement %","Local workforce %"] },
];

const PROVINCES_ZW = ["Harare","Bulawayo","Manicaland","Mashonaland Central","Mashonaland East","Mashonaland West","Masvingo","Matabeleland North","Matabeleland South","Midlands"];

// ── Criterion row used in Evaluation Design step ──────────────────────────
type CritItem = { id: string; label: string; wt: number; subs: string[] };
function CRow({ c, i, arr, setArr }: {
  c: CritItem; i: number;
  arr: CritItem[];
  setArr: React.Dispatch<React.SetStateAction<CritItem[]>>;
}) {
  return (
    <div className="border border-black/10 bg-white mb-2">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border-b border-black/6">
        <span className="text-[9px] font-bold text-black/35 w-6">{c.id}</span>
        <input value={c.label} onChange={e => setArr(prev => prev.map((x,j) => j===i ? {...x, label:e.target.value} : x))}
          className="flex-1 h-7 px-2 border border-black/10 text-xs font-medium focus:outline-none bg-white" />
        <label className="text-[9px] text-black/40">Wt%</label>
        <input type="number" value={c.wt} onChange={e => setArr(prev => prev.map((x,j) => j===i ? {...x, wt:Number(e.target.value)} : x))}
          className="w-12 h-7 px-1 text-center border border-black/10 text-xs font-bold focus:outline-none" />
        <button onClick={() => setArr(prev => prev.filter((_,j) => j!==i))} className="text-red-400 hover:text-red-600 ml-1">
          <Trash2 className="h-3 w-3"/>
        </button>
      </div>
      <div className="px-3 py-1.5 grid grid-cols-1 md:grid-cols-2 gap-1">
        {c.subs.map((sc,j) => (
          <div key={j} className="flex items-center gap-1">
            <span className="text-[9px] text-black/30 w-4">{j+1}.</span>
            <input value={sc} onChange={e => setArr(prev => prev.map((x,xi) => xi===i ? {...x, subs:x.subs.map((s,si) => si===j ? e.target.value : s)} : x))}
              className="flex-1 h-6 px-2 border border-black/8 text-[10px] focus:outline-none bg-gray-50/80" />
            <button onClick={() => setArr(prev => prev.map((x,xi) => xi===i ? {...x, subs:x.subs.filter((_,si) => si!==j)} : x))}
              className="text-red-300 hover:text-red-500"><X className="h-3 w-3"/></button>
          </div>
        ))}
        <button onClick={() => setArr(prev => prev.map((x,xi) => xi===i ? {...x, subs:[...x.subs,""]} : x))}
          className="text-[10px] text-slate-600 hover:underline text-left mt-0.5 col-span-2">+ sub-check</button>
      </div>
    </div>
  );
}

function NewTenderModal({ onClose, onSave }: { onClose: () => void; onSave: (t: EnhancedTender) => void }) {
  const ministryOptions = getMinistryOptions();
  // ── step state ────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  // ── ratio / eval state ─────────────────────────────────────────────────
  const [techWeight, setTechWeight] = useState(70);
  const finWeight = 100 - techWeight;
  const [passmark, setPassmark]   = useState(70);
  const [minQual, setMinQual]     = useState(60);
  const [evalMethod, setEvalMethod] = useState("QCBS");
  const [scoringScale, setScoringScale] = useState("100-point scale");
  const [tieBreaker, setTieBreaker]     = useState("Lowest price wins");
  const [evalRounds, setEvalRounds]     = useState("2-envelope (Tech then Fin)");
  const [negotiations, setNegotiations] = useState("No — fixed bid");

  // ── main form ─────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    title: "", ministry: "", department: "", division: "",
    entity: "", category: CATEGORIES[0],
    procType: "Open Tender", procMethod: "Open Competitive",
    supplyType: "Supplies / Goods", tenderScope: "National",
    estimatedValue: "", currency: "USD", fundingSource: "",
    budgetCode: "", programmeCode: "", ppaPBCode: "",
    financialYear: "2026/2027",
    performanceBondPct: "10", retentionPct: "5", mobilisationPct: "15",
    docCost: "", docCostCurrency: "USD",
    advertisementDate: "", bidCloseDate: "", bidCloseTime: "10:00",
    bidOpenDate: "", bidOpenTime: "10:00",
    evaluationDate: "", awardDate: "", contractStart: "", contractEnd: "",
    preBidDate: "", preBidMode: "Physical", preBidVenue: "",
    siteVisitDate: "", briefingDate: "",
    validityDays: "120", tenderPeriod: "90", deliveryPeriod: "", warrantyPeriod: "",
    contactPerson: "", contactEmail: "", contactPhone: "",
    venue: "", province: "", location: "",
    description: "", specs: "",
    siteVisitRequired: false, briefingRequired: false,
    insuranceRequired: false, boqAttached: false, torAttached: false,
    aiScoring: true, blockchainRecord: true,
  });
  const [depts, setDepts] = useState<{ id: string; name: string }[]>([]);
  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }));

  // compliance / criteria / committee
  const [compliance, setCompliance] = useState(DEFAULT_COMPLIANCE_ITEMS.map(c => ({ ...c })));
  const [techCrit, setTechCrit] = useState<CritItem[]>(DEFAULT_TECH.map(c => ({ ...c })));
  const [finCrit, setFinCrit]   = useState<CritItem[]>(DEFAULT_FIN.map(c => ({ ...c })));
  const [committee, setCommittee]   = useState([
    { role: "Chairperson",           name: "", designation: "", dept: "", phone: "", email: "", coi: false },
    { role: "Technical Evaluator 1", name: "", designation: "", dept: "", phone: "", email: "", coi: false },
    { role: "Technical Evaluator 2", name: "", designation: "", dept: "", phone: "", email: "", coi: false },
    { role: "Financial Evaluator",   name: "", designation: "", dept: "", phone: "", email: "", coi: false },
    { role: "Legal Advisor",         name: "", designation: "", dept: "", phone: "", email: "", coi: false },
    { role: "Procurement Officer",   name: "", designation: "", dept: "", phone: "", email: "", coi: false },
  ]);

  useEffect(() => {
    if (form.ministry) {
      const ds = getDepartmentsForMinistry(form.ministry);
      setDepts(ds);
      if (ds.length > 0) set("department", ds[0].name);
    }
  }, [form.ministry]);

  const autoId = useRef(`ZW-PRA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`);

  // shared style tokens
  const fi = "w-full h-9 px-3 border border-black/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/50 rounded-none";
  const se = "w-full h-9 px-3 border border-black/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/50 rounded-none";
  const lb = (t: string) => <label className="block text-[10px] font-bold text-black/50 uppercase tracking-wider mb-1">{t}</label>;
  const SH = ({ n, title, color = "bg-[#0f172a]" }: { n: string; title: string; color?: string }) => (
    <div className={`${color} text-white px-4 py-2 flex items-center gap-2 mb-3 -mx-1`}>
      <span className="text-[10px] font-black opacity-50">{n}</span>
      <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
    </div>
  );

  const submit = () => {
    if (!form.title || !form.ministry || !form.estimatedValue) {
      toast("Title, Ministry and Estimated Value are required", "warning"); return;
    }
    const min = ZW_MINISTRIES.find(m => m.id === form.ministry);
    const tender: EnhancedTender = {
      id: autoId.current, title: form.title, description: form.description,
      entity: form.entity || min?.name || "Unknown",
      ministry: form.ministry, department: form.department,
      category: form.category, method: form.procMethod,
      estimatedValue: form.estimatedValue, currency: form.currency,
      status: "Draft", bids: 0,
      publishedDate: form.advertisementDate, bidOpenDate: form.bidCloseDate,
      bidCloseDate: form.bidCloseDate, bidOpeningDate: form.bidOpenDate,
      preBidDate: form.preBidDate, preBidLocation: form.preBidVenue,
      documentFee: `${form.docCostCurrency} ${form.docCost}`,
      emd: "", validityDays: Number(form.validityDays), relaxationMinutes: 30,
    };
    onSave(tender);
    pushNotification(`New tender created: ${autoId.current} — ${form.title}`, "success");
    onClose();
  };

  // ─────────────────────────────────────────────────────────────────────
  // Step renders
  // ─────────────────────────────────────────────────────────────────────
  const sumWt = (arr: CritItem[]) => arr.reduce((a, c) => a + c.wt, 0);
  const techTotal = sumWt(techCrit);
  const finTotal  = sumWt(finCrit);

  const step1 = (
    <div className="space-y-5">
      <div className="bg-[#0f172a] text-white px-5 py-4">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">PPDPA 2018 — EVALUATION RATIO SETUP</div>
        <div className="text-base font-bold uppercase">Step 1 — Evaluation Method and Technical/Financial Ratio</div>
        <div className="text-xs text-white/50 mt-0.5">Set the ratio FIRST — it drives all scoring below</div>
      </div>
      <div className="px-1 space-y-4">
        <SH n="1.1" title="Evaluation Method" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>{lb("Evaluation Method *")}<select value={evalMethod} onChange={e => setEvalMethod(e.target.value)} className={se}>{EVAL_METHODS_LIST.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}</select></div>
          <div>{lb("Scoring Scale")}<select value={scoringScale} onChange={e => setScoringScale(e.target.value)} className={se}><option>100-point scale</option><option>10-point scale</option></select></div>
        </div>
        <SH n="1.2" title="Technical vs Financial Ratio" color="bg-[#1e3a5f]" />
        <div className="border-2 border-[#0f172a] p-5">
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>{lb("Technical Weight (%) *")}
              <input type="number" min={0} max={100} value={techWeight} onChange={e => setTechWeight(Math.min(100,Math.max(0,Number(e.target.value))))}
                className="w-full h-14 text-3xl font-black text-center border-2 border-[#0f172a] bg-white focus:outline-none" />
            </div>
            <div>{lb("Financial Weight (%) — Auto")}
              <div className="w-full h-14 text-3xl font-black text-center border-2 border-slate-200 bg-slate-50 text-[#0F172A] flex items-center justify-center">{finWeight}</div>
            </div>
          </div>
          <div className="flex h-8 overflow-hidden border border-black/10 mb-4">
            <div className="bg-[#0f172a] flex items-center justify-center text-white text-xs font-bold transition-all" style={{ width: `${techWeight}%` }}>T {techWeight}%</div>
            <div className="bg-[#0F172A] flex items-center justify-center text-white text-xs font-bold transition-all flex-1">F {finWeight}%</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>{lb("Technical Pass Mark (%)")}<input type="number" value={passmark} onChange={e => setPassmark(Number(e.target.value))} className={fi} /></div>
            <div>{lb("Min Qualifying Score (%)")}<input type="number" value={minQual} onChange={e => setMinQual(Number(e.target.value))} className={fi} /></div>
            <div>{lb("Tie-Breaker Rule")}<select value={tieBreaker} onChange={e => setTieBreaker(e.target.value)} className={se}><option>Lowest price wins</option><option>Higher technical score wins</option><option>Random draw</option></select></div>
            <div>{lb("Evaluation Rounds")}<select value={evalRounds} onChange={e => setEvalRounds(e.target.value)} className={se}><option>2-envelope (Tech then Fin)</option><option>1-envelope simultaneous</option><option>3-stage</option></select></div>
            <div>{lb("Negotiations")}<select value={negotiations} onChange={e => setNegotiations(e.target.value)} className={se}><option>No — fixed bid</option><option>Yes — top-ranked only</option><option>Yes — top 3 bidders</option></select></div>
            <div>{lb("AI Auto-Scoring")}
              <div className="flex gap-2 h-9 items-center">
                {[true,false].map(v => <label key={String(v)} className={`flex items-center gap-1.5 px-3 py-1.5 border cursor-pointer text-xs font-semibold transition-colors ${form.aiScoring===v?"bg-[#0f172a] text-white border-[#0f172a]":"border-black/15 hover:bg-gray-50"}`}><input type="radio" checked={form.aiScoring===v} onChange={() => set("aiScoring",v)} className="hidden"/>{v?"Enabled":"Disabled"}</label>)}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 text-xs text-[#0F172A]">
          ✨ <strong>AI:</strong> 70/30 T/F split recommended for tenders above USD 5M. Pass mark ≥ 70% required. Bidders below pass mark are disqualified before financial envelopes open.
        </div>
      </div>
    </div>
  );

  // ── Step 2: Tender Details ──────────────────────────────────────────
  const step2 = (
    <div className="space-y-5">
      <div className="bg-[#0f172a] text-white px-5 py-4">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">TENDER REGISTRATION FORM — GOZ</div>
        <div className="text-base font-bold uppercase">Step 2 — Tender Details</div>
        <div className="text-xs text-white/50 mt-0.5">Full identification, entity, financial parameters and key dates</div>
      </div>
      <div className="px-1 space-y-5">
        <SH n="2.1" title="Tender Identification" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            {lb("Tender Reference (Auto)")}
            <div className="h-9 px-3 border-2 border-[#0f172a] bg-gray-50 flex items-center text-sm font-mono font-bold text-[#0f172a]">{autoId.current}</div>
          </div>
          <div className="md:col-span-2">{lb("Procurement Title *")}<input value={form.title} onChange={e => set("title",e.target.value)} placeholder="e.g. Two Year Supply Framework — Office Furniture" className={`${fi} font-semibold`} /></div>
        </div>

        <SH n="2.2" title="Procuring Entity" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>{lb("Ministry *")}<select value={form.ministry} onChange={e => set("ministry",e.target.value)} className={se}><option value="">Select ministry…</option>{ministryOptions.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}</select></div>
          <div>{lb("Department")}<select value={form.department} onChange={e => set("department",e.target.value)} className={se}>{depts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</select></div>
          <div>{lb("Division / Unit")}<input value={form.division} onChange={e => set("division",e.target.value)} placeholder="Division/Unit…" className={fi} /></div>
          <div>{lb("Procuring Entity")}<input value={form.entity} onChange={e => set("entity",e.target.value)} placeholder="e.g. ZIMRA" className={fi} /></div>
          <div>{lb("Financial Year *")}<select value={form.financialYear} onChange={e => set("financialYear",e.target.value)} className={se}><option>2026/2027</option><option>2025/2026</option><option>2027/2028</option></select></div>
          <div>{lb("Budget Code")}<input value={form.budgetCode} onChange={e => set("budgetCode",e.target.value)} placeholder="BC-MOH-2026-0001" className={fi} /></div>
          <div>{lb("Programme Code")}<input value={form.programmeCode} onChange={e => set("programmeCode",e.target.value)} placeholder="PROG-001" className={fi} /></div>
          <div>{lb("PPADB / CPB Code")}<input value={form.ppaPBCode} onChange={e => set("ppaPBCode",e.target.value)} placeholder="PPADB-2026-…" className={fi} /></div>
        </div>

        <SH n="2.3" title="Procurement Classification" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>{lb("Procurement Type *")}
            <div className="grid grid-cols-2 gap-1">
              {PROC_TYPES_LIST.map(t => <label key={t} className={`flex items-center gap-1.5 px-2 py-1.5 border cursor-pointer text-xs font-medium transition-colors ${form.procType===t?"bg-[#0f172a] text-white border-[#0f172a]":"border-black/15 hover:bg-gray-50"}`}><input type="radio" name="ptype" checked={form.procType===t} onChange={() => set("procType",t)} className="hidden"/>{t}</label>)}
            </div>
          </div>
          <div>
            {lb("Procurement Method *")}<select value={form.procMethod} onChange={e => set("procMethod",e.target.value)} className={`${se} mb-2`}>{PROC_METHODS_LIST.map(m => <option key={m}>{m}</option>)}</select>
            {lb("Supply Type")}<select value={form.supplyType} onChange={e => set("supplyType",e.target.value)} className={se}><option>Supplies / Goods</option><option>Works / Construction</option><option>Services / Consultancy</option><option>Mixed</option></select>
          </div>
          <div>
            {lb("Category *")}<select value={form.category} onChange={e => set("category",e.target.value)} className={`${se} mb-2`}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
            {lb("Scope")}<select value={form.tenderScope} onChange={e => set("tenderScope",e.target.value)} className={se}><option>National</option><option>International</option><option>Regional (SADC)</option><option>Local (Province)</option></select>
          </div>
        </div>

        <SH n="2.4" title="Financial Parameters" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="col-span-2">{lb("Estimated Contract Value *")}
            <div className="flex"><select value={form.currency} onChange={e => set("currency",e.target.value)} className={`w-20 ${se} border-r-0`}><option>USD</option><option>ZWL</option><option>EUR</option><option>GBP</option><option>ZAR</option></select><input type="number" value={form.estimatedValue} onChange={e => set("estimatedValue",e.target.value)} placeholder="0.00" className={`${fi} flex-1`} /></div>
          </div>
          <div>{lb("Funding Source")}<select value={form.fundingSource} onChange={e => set("fundingSource",e.target.value)} className={se}><option value="">Select…</option><option>Government Treasury</option><option>World Bank</option><option>African Dev. Bank</option><option>Donor Grant</option><option>Bilateral Loan</option></select></div>
          <div>{lb("Bid Document Cost")}<div className="flex"><select value={form.docCostCurrency} onChange={e => set("docCostCurrency",e.target.value)} className={`w-16 ${se} border-r-0`}><option>USD</option><option>ZWL</option></select><input value={form.docCost} onChange={e => set("docCost",e.target.value)} placeholder="0.00" className={`${fi} flex-1`} /></div></div>
          <div>{lb("Performance Bond (%)")}<input value={form.performanceBondPct} onChange={e => set("performanceBondPct",e.target.value)} placeholder="10" className={fi} /></div>
          <div>{lb("Retention (%)")}<input value={form.retentionPct} onChange={e => set("retentionPct",e.target.value)} placeholder="5" className={fi} /></div>
          <div>{lb("Mobilisation Advance (%)")}<input value={form.mobilisationPct} onChange={e => set("mobilisationPct",e.target.value)} placeholder="15" className={fi} /></div>
          <div>{lb("Bid Validity (days)")}<input value={form.validityDays} onChange={e => set("validityDays",e.target.value)} placeholder="120" className={fi} /></div>
        </div>

        <SH n="2.5" title="Key Procurement Dates" color="bg-[#1e3a5f]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {([["advertisementDate","Advertisement Date *"],["bidCloseDate","Bid Closing Date *"],["bidOpenDate","Bid Opening Date"],["evaluationDate","Evaluation Date"],["awardDate","Award Date (Target)"],["contractStart","Contract Start Date"],["contractEnd","Contract End Date"],["preBidDate","Pre-Bid Meeting Date"],["siteVisitDate","Site Visit Date"],["briefingDate","Briefing Session Date"]] as [string,string][]).map(([k,l]) => (
            <div key={k}>{lb(l)}<input type="date" value={(form as unknown as Record<string,string>)[k]??""} onChange={e => set(k,e.target.value)} className={fi} /></div>
          ))}
          <div>{lb("Closing Time")}<input type="time" value={form.bidCloseTime} onChange={e => set("bidCloseTime",e.target.value)} className={fi} /></div>
          <div>{lb("Opening Time")}<input type="time" value={form.bidOpenTime} onChange={e => set("bidOpenTime",e.target.value)} className={fi} /></div>
          <div>{lb("Tender Period (days)")}<input value={form.tenderPeriod} onChange={e => set("tenderPeriod",e.target.value)} placeholder="90" className={fi} /></div>
          <div>{lb("Delivery Period")}<input value={form.deliveryPeriod} onChange={e => set("deliveryPeriod",e.target.value)} placeholder="e.g. 120 days ARO" className={fi} /></div>
          <div>{lb("Warranty Period")}<input value={form.warrantyPeriod} onChange={e => set("warrantyPeriod",e.target.value)} placeholder="e.g. 24 months" className={fi} /></div>
        </div>

        <SH n="2.6" title="Contact & Location" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>{lb("Contact Person")}<input value={form.contactPerson} onChange={e => set("contactPerson",e.target.value)} placeholder="Name & designation" className={fi} /></div>
          <div>{lb("Contact Email")}<input type="email" value={form.contactEmail} onChange={e => set("contactEmail",e.target.value)} placeholder="procurement@ministry.gov.zw" className={fi} /></div>
          <div>{lb("Contact Phone")}<input value={form.contactPhone} onChange={e => set("contactPhone",e.target.value)} placeholder="+263 242 …" className={fi} /></div>
          <div>{lb("Bid Opening Venue")}<input value={form.venue} onChange={e => set("venue",e.target.value)} placeholder="e.g. Room 4B, Mukwati Building" className={fi} /></div>
          <div>{lb("Province")}<select value={form.province} onChange={e => set("province",e.target.value)} className={se}><option value="">Select…</option>{PROVINCES_ZW.map(p => <option key={p}>{p}</option>)}</select></div>
          <div>{lb("District / Location")}<input value={form.location} onChange={e => set("location",e.target.value)} placeholder="District / physical location" className={fi} /></div>
        </div>

        <SH n="2.7" title="Pre-Bid & Site Visit" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>{lb("Pre-Bid Mode")}<select value={form.preBidMode} onChange={e => set("preBidMode",e.target.value)} className={se}><option>Physical</option><option>Online</option><option>Hybrid</option></select></div>
          <div className="md:col-span-2">{lb("Pre-Bid Venue")}<input value={form.preBidVenue} onChange={e => set("preBidVenue",e.target.value)} placeholder="Pre-bid meeting venue / link" className={fi} /></div>
        </div>

        <SH n="2.8" title="Special Conditions" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {([["siteVisitRequired","Site Visit Required"],["briefingRequired","Briefing Session Req."],["insuranceRequired","Insurance Required"],["boqAttached","BOQ Attached"],["torAttached","TOR Attached"],["blockchainRecord","Blockchain Record"],["aiScoring","AI Auto-Scoring"]] as [string,string][]).map(([k,l]) => (
            <label key={k} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!(form as Record<string,unknown>)[k]} onChange={e => set(k,e.target.checked)} className="h-4 w-4 accent-[#0f172a]" />
              <span className="text-xs font-medium text-black/70">{l}</span>
            </label>
          ))}
        </div>

        <div>{lb("Brief Description / Scope Summary")}<textarea value={form.description} onChange={e => set("description",e.target.value)} rows={3} placeholder="Briefly describe the procurement need, objective and expected deliverables…" className="w-full px-3 py-2 border border-black/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/50 rounded-none resize-none" /></div>
      </div>
    </div>
  );

  // ── Step 3: Scope & Specs ─────────────────────────────────────────────
  const step3 = (
    <div className="space-y-5">
      <div className="bg-[#0f172a] text-white px-5 py-4">
        <div className="text-base font-bold uppercase">Step 3 — Scope of Work, Technical Specifications and Documents</div>
        <div className="text-xs text-white/50 mt-0.5">Full scope text, required bidder documents and file attachments</div>
      </div>
      <div className="px-1 space-y-4">
        <SH n="3.1" title="Technical Specifications / Scope of Work" />
        <textarea value={form.specs} onChange={e => set("specs",e.target.value)} rows={10}
          placeholder="Paste or describe technical specifications. Include: objectives, scope boundaries, deliverables, standards, performance requirements, inspection criteria…"
          className="w-full px-3 py-2 border border-black/15 bg-white text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20/50 rounded-none resize-none" />

        <SH n="3.2" title="Required Bidder Documents" color="bg-[#065f46]" />
        <div className="border border-black/10 bg-white p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
          {["Completed bid form","Bid security / tender guarantee","Company profile","Certificate of incorporation","Tax clearance (ZIMRA)","PRAZ registration","Audited financials (3 years)","Bank reference letter","Key personnel CVs","Equipment ownership proof","Similar project references","Subcontracting plan","HSE policy document","Insurance certificates","Local content declaration","Conflict of interest declaration","Directors competency test result","Technical team competency test result"].map((doc,i) => (
            <label key={i} className="flex items-center gap-2 text-xs text-black/70 cursor-pointer hover:text-black">
              <input type="checkbox" defaultChecked={i < 12} className="h-3.5 w-3.5 accent-[#0f172a]" />{doc}
            </label>
          ))}
        </div>

        <SH n="3.3" title="Document Attachments" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {["Invitation to Tender","Technical Specifications","Bill of Quantities (BOQ)","Terms of Reference (TOR)","Bid Data Sheet","General Conditions of Contract","Price Schedule / Form","Bid Bond Template","Draft Contract","Site Plans / Drawings"].map(doc => (
            <label key={doc} className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-black/20 cursor-pointer text-[10px] font-medium hover:border-slate-200 hover:bg-slate-50">
              <input type="checkbox" className="h-3 w-3 accent-blue-600" /><span>📎 {doc}</span>
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 border border-dashed border-black/20 px-4 py-3 cursor-pointer hover:bg-gray-50 text-xs text-black/50">
          <Plus className="h-4 w-4" /> Upload additional files (PDF, DOCX, XLSX, DWG)
          <input type="file" multiple accept=".pdf,.docx,.xlsx,.dwg,.zip" className="hidden" />
        </label>
      </div>
    </div>
  );

  // ── Step 4: Compliance ─────────────────────────────────────────────
  const step4 = (
    <div className="space-y-5">
      <div className="bg-[#0f172a] text-white px-5 py-4">
        <div className="text-base font-bold uppercase">Step 4 — Compliance Checklist (Stage 1 — Pass/Fail)</div>
        <div className="text-xs text-white/50 mt-0.5">Standard items are mandatory. Failure = DISQUALIFIED. Optional items set by admin.</div>
      </div>
      <div className="px-1">
        <div className="bg-slate-50 border border-slate-200 p-3 flex gap-2 mb-4">
          <AlertTriangle className="h-4 w-4 text-[#0F172A] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#0F172A]">Bidders failing any <strong>Standard</strong> item are automatically disqualified before technical evaluation begins.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-black/10">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                <th className="px-3 py-2 text-left w-8">No.</th>
                <th className="px-3 py-2 text-left w-24">Type</th>
                <th className="px-3 py-2 text-left">Compliance Metric</th>
                <th className="px-3 py-2 text-center w-32">Check Type</th>
                <th className="px-3 py-2 text-center w-10">Del</th>
              </tr>
            </thead>
            <tbody>
              {compliance.map((c, i) => (
                <tr key={c.id} className={`border-b border-black/6 ${i%2===0?"bg-white":"bg-gray-50/50"}`}>
                  <td className="px-3 py-2 font-mono text-black/40">{c.id}</td>
                  <td className="px-3 py-2">
                    <select value={c.type} onChange={e => { const n=[...compliance]; n[i]={...n[i],type:e.target.value}; setCompliance(n); }}
                      className="w-22 h-7 px-1 border border-black/15 bg-white text-[10px] focus:outline-none">
                      <option>Standard</option><option>Optional</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input value={c.label} onChange={e => { const n=[...compliance]; n[i]={...n[i],label:e.target.value}; setCompliance(n); }}
                      className="w-full h-7 px-2 border border-black/10 bg-white text-xs focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20" />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <select className="w-28 h-7 px-1 border border-black/15 bg-white text-[10px] focus:outline-none">
                      <option>Pass / Fail</option><option>Scored (0–10)</option><option>Yes / No</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => setCompliance(prev => prev.filter((_,j) => j!==i))} className="text-red-400 hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => setCompliance(prev => [...prev, { id:prev.length+1, type:"Optional", label:"" }])}
          className="mt-3 text-xs text-[#0F172A] hover:underline font-semibold flex items-center gap-1">
          <Plus className="h-3 w-3" /> Add compliance criterion
        </button>
      </div>
    </div>
  );

  // ── Step 5: Evaluation Design ─────────────────────────────────────

  const step5 = (
    <div className="space-y-5">
      <div className="bg-[#0f172a] text-white px-5 py-4">
        <div className="text-base font-bold uppercase">Step 5 — Technical and Financial Evaluation Criteria</div>
        <div className="text-xs text-white/50 mt-0.5">Design the scoring matrix — weights must sum to 100 per section</div>
      </div>
      <div className="px-1 space-y-5">
        {/* Ratio reminder banner */}
        <div className="flex gap-4 p-3 bg-[#0f172a] text-white">
          {[{l:"Technical",v:`${techWeight}%`,c:"text-slate-500"},{l:"Financial",v:`${finWeight}%`,c:"text-slate-400"},{l:"Pass Mark",v:`${passmark}%`,c:"text-slate-500"},{l:"Method",v:evalMethod,c:"text-white"}].map(({l,v,c})=>(
            <div key={l} className="text-center px-3 border-r border-white/10 last:border-0">
              <div className="text-[9px] text-white/40 uppercase">{l}</div>
              <div className={`text-xl font-black ${c}`}>{v}</div>
            </div>
          ))}
        </div>

        <div className={`text-[10px] font-semibold ${techTotal===100?"text-[#0F172A]":"text-red-600"}`}>
          Technical weights: {techTotal}% {techTotal===100?"✓ OK":"⚠ must equal 100%"}
        </div>
        <div className="bg-[#1e3a5f] text-white px-4 py-2 flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black opacity-50">5.1</span>
          <span className="text-xs font-bold uppercase tracking-wider">Technical Scoring Matrix — Stage 2</span>
        </div>
        {techCrit.map((c,i) => <CRow key={c.id} c={c} i={i} arr={techCrit} setArr={setTechCrit} />)}
        <button onClick={()=>setTechCrit(p=>[...p,{id:`T${p.length+1}`,label:"New Technical Criterion",wt:5,subs:["Sub-criterion 1"]}])}
          className="text-xs text-[#0F172A] hover:underline font-semibold flex items-center gap-1 mb-4"><Plus className="h-3 w-3"/>Add technical criterion</button>

        <div className={`text-[10px] font-semibold ${finTotal===100?"text-[#0F172A]":"text-red-600"}`}>
          Financial weights: {finTotal}% {finTotal===100?"✓ OK":"⚠ must equal 100%"}
        </div>
        <div className="bg-[#1e3a5f] text-white px-4 py-2 flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black opacity-50">5.2</span>
          <span className="text-xs font-bold uppercase tracking-wider">Financial Scoring Matrix — Stage 3</span>
        </div>
        {finCrit.map((c,i) => <CRow key={c.id} c={c} i={i} arr={finCrit} setArr={setFinCrit} />)}
        <button onClick={()=>setFinCrit(p=>[...p,{id:`F${p.length+1}`,label:"New Financial Criterion",wt:5,subs:["Sub-criterion 1"]}])}
          className="text-xs text-[#0F172A] hover:underline font-semibold flex items-center gap-1"><Plus className="h-3 w-3"/>Add financial criterion</button>

        <div className="bg-[#065f46] text-white px-4 py-2 flex items-center gap-2 mt-4 mb-2">
          <span className="text-[10px] font-black opacity-50">5.3</span>
          <span className="text-xs font-bold uppercase tracking-wider">Scoring Rules & Result Parameters</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 border border-black/10 bg-white">
          <div><label className="block text-[10px] font-bold text-black/50 uppercase tracking-wider mb-1">Scoring Scale</label><select value={scoringScale} onChange={e=>setScoringScale(e.target.value)} className="w-full h-9 px-3 border border-black/15 bg-white text-sm focus:outline-none rounded-none"><option>100-point scale</option><option>10-point scale</option></select></div>
          <div><label className="block text-[10px] font-bold text-black/50 uppercase tracking-wider mb-1">Tie-Breaker</label><select value={tieBreaker} onChange={e=>setTieBreaker(e.target.value)} className="w-full h-9 px-3 border border-black/15 bg-white text-sm focus:outline-none rounded-none"><option>Lowest price wins</option><option>Higher technical score wins</option><option>Random draw</option></select></div>
          <div><label className="block text-[10px] font-bold text-black/50 uppercase tracking-wider mb-1">Eval Rounds</label><select value={evalRounds} onChange={e=>setEvalRounds(e.target.value)} className="w-full h-9 px-3 border border-black/15 bg-white text-sm focus:outline-none rounded-none"><option>2-envelope</option><option>1-envelope</option><option>3-stage</option></select></div>
          <div><label className="block text-[10px] font-bold text-black/50 uppercase tracking-wider mb-1">Negotiations</label><select value={negotiations} onChange={e=>setNegotiations(e.target.value)} className="w-full h-9 px-3 border border-black/15 bg-white text-sm focus:outline-none rounded-none"><option>No — fixed bid</option><option>Yes — top-ranked</option><option>Yes — top 3</option></select></div>
          <div><label className="block text-[10px] font-bold text-black/50 uppercase tracking-wider mb-1">Pass Mark (%)</label><input type="number" value={passmark} onChange={e=>setPassmark(Number(e.target.value))} className="w-full h-9 px-3 border border-black/15 bg-white text-sm focus:outline-none rounded-none" /></div>
          <div><label className="block text-[10px] font-bold text-black/50 uppercase tracking-wider mb-1">Min Qualifying (%)</label><input type="number" value={minQual} onChange={e=>setMinQual(Number(e.target.value))} className="w-full h-9 px-3 border border-black/15 bg-white text-sm focus:outline-none rounded-none" /></div>
        </div>
      </div>
    </div>
  );

  // ── Step 6: Committee ────────────────────────────────────────────────
  const step6 = (
    <div className="space-y-5">
      <div className="bg-[#0f172a] text-white px-5 py-4">
        <div className="text-base font-bold uppercase">Step 6 — Committee Composition and Approval Workflow</div>
        <div className="text-xs text-white/50 mt-0.5">Assign evaluators and configure the approval chain</div>
      </div>
      <div className="px-1 space-y-4">
        <div className="bg-slate-50 border border-slate-200 p-3 text-xs text-[#0F172A]">
          Minimum 5 members required for tenders above USD 1M. All members must complete COI declarations before evaluation begins.
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-black/10">
            <thead>
              <tr className="bg-[#0f172a] text-white">
                {["Role","Full Name","Designation","Department","Phone","Email","COI ✓"].map(h=>(
                  <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {committee.map((m,i)=>(
                <tr key={i} className={`border-b border-black/6 ${i%2===0?"bg-white":"bg-gray-50/50"}`}>
                  <td className="px-3 py-2 text-[10px] font-bold text-[#0f172a] whitespace-nowrap">{m.role}</td>
                  {(["name","designation","dept","phone","email"] as const).map(k=>(
                    <td key={k} className="px-2 py-2">
                      <input value={m[k]} onChange={e=>{const n=[...committee];n[i]={...n[i],[k]:e.target.value};setCommittee(n);}}
                        placeholder={k==="email"?"email@gov.zw":k==="phone"?"+263…":`${k}…`}
                        className="w-full h-7 px-2 border border-black/10 text-xs focus:outline-none bg-white focus:ring-1 focus:ring-[#0F172A]/20 min-w-[100px]" />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center">
                    <input type="checkbox" checked={m.coi} onChange={e=>{const n=[...committee];n[i]={...n[i],coi:e.target.checked};setCommittee(n);}} className="h-4 w-4 accent-emerald-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={()=>setCommittee(c=>[...c,{role:`Member ${c.length+1}`,name:"",designation:"",dept:"",phone:"",email:"",coi:false}])}
          className="text-xs text-[#0F172A] hover:underline font-semibold flex items-center gap-1">
          <Plus className="h-3 w-3"/>Add committee member
        </button>

        <div className="bg-[#1e3a5f] text-white px-4 py-2 flex items-center gap-2 mt-4 mb-2">
          <span className="text-[10px] font-black opacity-50">6.2</span>
          <span className="text-xs font-bold uppercase tracking-wider">Approval Workflow Chain</span>
        </div>
        <div className="border border-black/10 bg-white overflow-hidden">
          {[
            {step:"Initiated by",  person:"Current User",           action:"submit",                              court:""},
            {step:"Reviewed by",   person:"Procurement Manager",    action:"review / approve / reject / return",  court:""},
            {step:"Approved by",   person:"Head of Department",     action:"approve / reject / return",           court:""},
            {step:"Authorized by", person:"Accounting Officer / PS",action:"authorize / reject / return",         court:"Magistrate Court"},
            {step:"Adjudicated by",person:"Tender Committee",       action:"adjudicate / approve / reject",       court:"High Court"},
            {step:"Appealed by",   person:"Appeals Authority",      action:"final decision",                      court:"Appeals Court"},
          ].map((row,i)=>(
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-black/5 last:border-0">
              <div className="h-6 w-6 rounded-full bg-[#0f172a] text-white text-[10px] font-bold grid place-items-center flex-shrink-0">{i+1}</div>
              <div className="w-28 text-[10px] font-bold text-black/60 flex-shrink-0">{row.step}:</div>
              <div className="flex-1 text-xs font-medium text-black">{row.person}</div>
              <div className="text-[10px] text-black/40 flex-1 hidden md:block">{row.action}</div>
              {row.court && <div className="text-[10px] text-[#0F172A] italic flex-shrink-0">{row.court}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Step 7: Review & Submit ───────────────────────────────────────────
  const coiPct = Math.round((committee.filter(m=>m.coi).length / Math.max(committee.length,1)) * 100);
  const step7 = (
    <div className="space-y-5">
      <div className="bg-[#0f172a] text-white px-5 py-4">
        <div className="text-base font-bold uppercase">Step 7 — Final Review and Submit for Approval</div>
        <div className="text-xs text-white/50 mt-0.5">Verify all sections before submitting to the approval workflow</div>
      </div>
      <div className="px-1 space-y-4">
        {/* Summary grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {l:"Reference",       v:autoId.current,                               ok:true},
            {l:"Title",           v:form.title||"⚠ Not set",                      ok:!!form.title},
            {l:"Ministry",        v:form.ministry||"⚠ Not set",                   ok:!!form.ministry},
            {l:"Category",        v:form.category||"⚠ Not set",                   ok:!!form.category},
            {l:"Method",          v:form.procMethod,                              ok:true},
            {l:"Value",           v:form.estimatedValue?`${form.currency} ${Number(form.estimatedValue).toLocaleString()}`:"⚠ Not set", ok:!!form.estimatedValue},
            {l:"Closing Date",    v:form.bidCloseDate||"⚠ Not set",               ok:!!form.bidCloseDate},
            {l:"Eval Method",     v:evalMethod,                                   ok:true},
            {l:"Tech Weight",     v:`${techWeight}%`,                             ok:true},
            {l:"Fin Weight",      v:`${finWeight}%`,                              ok:true},
            {l:"Pass Mark",       v:`${passmark}%`,                               ok:true},
            {l:"Compliance Items",v:`${compliance.length} (${compliance.filter(c=>c.type==="Standard").length} std)`, ok:compliance.length>=5},
            {l:"Tech Criteria",   v:`${techCrit.length} — Total ${techTotal}%`,   ok:techTotal===100},
            {l:"Fin Criteria",    v:`${finCrit.length} — Total ${finTotal}%`,     ok:finTotal===100},
            {l:"Committee",       v:`${committee.length} members`,                ok:committee.length>=5},
            {l:"COI Declarations",v:`${committee.filter(m=>m.coi).length}/${committee.length} (${coiPct}%)`, ok:coiPct===100},
          ].map(({l,v,ok})=>(
            <div key={l} className={`border p-3 ${ok?"bg-white border-black/8":"bg-red-50 border-red-200"}`}>
              <div className="text-[9px] text-black/50 uppercase font-semibold tracking-wider mb-0.5">{l}</div>
              <div className={`text-xs font-bold leading-tight ${ok?"text-black":"text-red-700"}`}>{v}</div>
            </div>
          ))}
        </div>

        {/* AI validation */}
        <div className="bg-slate-50 border border-slate-200 p-4 flex gap-3">
          <Sparkles className="h-5 w-5 text-[#0F172A] flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-[#0F172A] mb-2">AI Compliance Check</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
              {[
                [!!form.title,           "Tender title set"],
                [!!form.ministry,        "Ministry assigned"],
                [!!form.estimatedValue,  "Estimated value entered"],
                [!!form.bidCloseDate,    "Closing date set"],
                [techTotal===100,        "Technical weights = 100%"],
                [finTotal===100,         "Financial weights = 100%"],
                [compliance.length>=5,   "Compliance checklist configured"],
                [committee.length>=5,    "Min 5 committee members"],
                [passmark>=50,           "Technical pass mark ≥ 50%"],
                [techWeight+finWeight===100, "Ratio totals 100%"],
              ].map(([ok,msg])=>(
                <div key={String(msg)} className={`flex items-center gap-1.5 text-[11px] ${ok?"text-[#0F172A]":"text-red-600"}`}>
                  {ok ? <CheckCircle2 className="h-3 w-3"/> : <AlertTriangle className="h-3 w-3"/>}
                  {String(msg)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document editor section */}
        <div className="bg-[#0f172a] text-white px-4 py-2 flex items-center gap-2">
          <span className="text-[10px] font-black opacity-50">7.1</span>
          <span className="text-xs font-bold uppercase tracking-wider">Tender Document Editor — Final Draft</span>
        </div>
        <div className="border border-black/10 p-3 bg-white">
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {["Invitation to Tender","Bid Data Sheet","Technical Specs","BOQ","Price Schedule","Draft Contract"].map(tpl=>(
              <button key={tpl} className="h-7 px-2 bg-[#0f172a] text-white text-[10px] font-semibold hover:opacity-80">{tpl}</button>
            ))}
          </div>
          <div className="border border-black/10 p-2">
            <div className="flex flex-wrap gap-1 mb-2 border-b border-black/8 pb-1.5">
              {["B","I","U","H1","H2","List","Table"].map(t=>(
                <button key={t} className="h-6 min-w-6 px-1 border border-black/10 text-[10px] hover:bg-gray-50 font-semibold">{t}</button>
              ))}
            </div>
            <textarea rows={5} className="w-full text-xs text-gray-700 resize-none focus:outline-none placeholder:text-gray-300"
              placeholder="Draft tender document auto-populated from form data. Edit before submission…" />
          </div>
          <div className="flex gap-2 mt-2">
            <button className="h-7 px-3 bg-[#0F172A] text-white text-[10px] font-bold flex items-center gap-1"><Save className="h-3 w-3"/>Save Draft</button>
            <button className="h-7 px-3 bg-gray-100 text-gray-700 text-[10px] font-bold flex items-center gap-1"><Download className="h-3 w-3"/>Export DOCX</button>
            <button className="h-7 px-3 bg-gray-100 text-gray-700 text-[10px] font-bold flex items-center gap-1"><Printer className="h-3 w-3"/>Print</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Main render — FULL PAGE ───────────────────────────────────────────
  const STEPS_CONTENT = [step1, step2, step3, step4, step5, step6, step7];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#EAF1F8] overflow-hidden">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-[#0f172a] text-white px-4 py-2.5 flex items-center gap-3 shadow-lg">
        <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold uppercase tracking-widest">Ai Powered e-Government Procurement & Automated Oversight Intelligence System — New Tender Registration</div>
          <div className="text-[10px] text-white/40">Government of Zimbabwe · PPDPA 2018 · {autoId.current}</div>
        </div>
        <button onClick={()=>window.print()} className="h-7 px-3 bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold flex items-center gap-1 flex-shrink-0">
          <Printer className="h-3 w-3"/>Print
        </button>
        <button onClick={onClose} className="h-7 w-7 grid place-items-center bg-red-600/80 hover:bg-red-500 text-white rounded flex-shrink-0">
          <X className="h-4 w-4"/>
        </button>
      </div>

      {/* Step strip */}
      <div className="flex-shrink-0 bg-white border-b border-black/10 overflow-x-auto">
        <div className="flex px-3 pt-1.5 pb-0 gap-0">
          {TENDER_STEPS.map((s,i)=>{
            const done=i+1<step, active=i+1===step;
            return (
              <button key={s.id} onClick={()=>done&&setStep(s.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition-all flex-shrink-0
                  ${active?"border-[#0f172a] text-[#0f172a]":done?"border-slate-200 text-[#0F172A] cursor-pointer hover:bg-slate-50":"border-transparent text-black/30 cursor-not-allowed"}`}>
                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0
                  ${active?"bg-[#0f172a] text-white":done?"bg-[#0F172A] text-white":"bg-black/8 text-black/35"}`}>
                  {done?<CheckCircle2 className="h-3 w-3"/>:s.id}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content + right AI panel */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-white min-w-0">
          <div className="max-w-5xl mx-auto px-4 py-5 pb-10">
            {STEPS_CONTENT[step-1]}
          </div>
        </div>

        {/* Right AI panel */}
        <div className="hidden xl:flex flex-col w-60 flex-shrink-0 bg-[#faf8ff] border-l border-slate-200 overflow-y-auto">
          <div className="px-4 py-3 bg-[#0F172A] text-white flex items-center gap-2 flex-shrink-0">
            <Sparkles className="h-4 w-4"/>
            <span className="text-xs font-bold uppercase tracking-wider">AI Assistant</span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-200 animate-pulse ml-auto"/>
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <div className="text-[10px] font-bold text-[#0F172A] uppercase mb-1">
                {["Ratio Guidance","Details Check","Specification Help","Compliance Advisor","Criteria Weights","Committee Rules","Final Validation"][step-1]}
              </div>
              <div className="text-[11px] text-[#0F172A] leading-relaxed">
                {[
                  "70/30 T/F split is standard for most PPDPA tenders above USD 5M. Set passmark ≥ 70%.",
                  "All starred (*) fields are required. Ministry and Category are mandatory for approval routing.",
                  "Specifications must be neutral — avoid brand names. Attach BOQ for works, TOR for consulting.",
                  "Standard items are mandatory. Failure on any Standard item = automatic disqualification.",
                  "Technical weights must sum to exactly 100%. AI will auto-score sub-criteria during evaluation.",
                  "Minimum 5 members for tenders > USD 1M. All must complete COI declarations before evaluation.",
                  "Check all red indicators before submitting. Blockchain record created on submission.",
                ][step-1]}
              </div>
            </div>
            {/* Completion tracker */}
            <div>
              <div className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-2">Completion</div>
              {[
                {l:"Ratio & Method",  done:true},
                {l:"Tender Details",  done:!!form.title&&!!form.ministry&&!!form.bidCloseDate},
                {l:"Scope & Specs",   done:!!form.specs},
                {l:"Compliance",      done:compliance.length>0},
                {l:"Evaluation",      done:techCrit.length>0},
                {l:"Committee",       done:committee.filter(m=>m.name).length>=3},
                {l:"Review",          done:false},
              ].map((item,i)=>(
                <div key={item.l} className="flex items-center gap-2 py-0.5">
                  <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${item.done?"bg-[#0F172A]":i+1===step?"bg-[#0F172A]":"bg-black/10"}`}/>
                  <span className={`text-[10px] ${item.done?"text-[#0F172A] font-semibold":i+1===step?"text-[#0F172A] font-semibold":"text-black/35"}`}>{item.l}</span>
                  {item.done&&<CheckCircle2 className="h-3 w-3 text-slate-600 ml-auto"/>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav bar */}
      <div className="flex-shrink-0 bg-white border-t border-black/10 px-4 py-3 flex items-center gap-2 flex-wrap">
        <div className="text-[10px] text-black/35 hidden md:flex items-center gap-2 flex-wrap">
          <span>Created by: <strong className="text-black/55">Current User</strong></span>
          <span>·</span><span>Approver: <strong className="text-[#0F172A]">Procurement Manager</strong></span>
          <span>·</span><span>Authorizer: <strong className="text-[#0F172A]">CPO / Director</strong></span>
          <span>·</span><span>{new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex-1"/>
        <button onClick={()=>setStep(s=>Math.max(1,s-1))} disabled={step===1}
          className="h-9 px-4 border border-black/15 text-sm font-medium flex items-center gap-1.5 hover:bg-gray-50 disabled:opacity-30">
          <ChevronLeft className="h-4 w-4"/>Back
        </button>
        <button onClick={onClose} className="h-9 px-4 border border-black/15 text-sm text-black/50 hover:bg-gray-50">Cancel</button>
        {step < TENDER_STEPS.length ? (
          <button onClick={()=>setStep(s=>Math.min(TENDER_STEPS.length,s+1))}
            className="h-9 px-6 bg-[#0f172a] text-white text-sm font-bold flex items-center gap-1.5 hover:opacity-90">
            Next: {TENDER_STEPS[step]?.short}<ChevronRight className="h-4 w-4"/>
          </button>
        ) : (
          <button onClick={submit}
            className="h-9 px-6 bg-[#0F172A] text-white text-sm font-bold flex items-center gap-1.5 hover:opacity-90">
            <Zap className="h-4 w-4"/>Submit for Approval
          </button>
        )}
      </div>
    </div>
  );
}

// ── Document Uploader (for tender creation) ───────────────────────────────
function TenderDocUploader() {
  const [docs, setDocs] = useState<TenderDoc[]>([]);
  const [viewDoc, setViewDoc] = useState<TenderDoc | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      setDocs(prev => [...prev, {
        name: file.name,
        type: file.name.split(".").pop()?.toUpperCase() ?? "DOC",
        size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`,
        url,
      }]);
    });
  };

  const typeColor: Record<string, string> = { PDF: "bg-red-500", XLSX: "bg-[#0F172A]", DOCX: "bg-[#0F172A]", PPTX: "bg-[#0F172A]", TXT: "bg-gray-500" };

  if (viewDoc) {
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-[#0f172a] text-white">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-semibold truncate">{viewDoc.name}</span>
          </div>
          <button onClick={() => setViewDoc(null)} className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 text-white rounded">✕ Close</button>
        </div>
        <div className="bg-gray-50 p-6 min-h-[200px] flex flex-col items-center justify-center text-center gap-3">
          {viewDoc.type === "PDF" && viewDoc.url ? (
            <iframe src={viewDoc.url} className="w-full h-64 border-0" title={viewDoc.name} />
          ) : (
            <>
              <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold ${typeColor[viewDoc.type] ?? "bg-gray-400"}`}>{viewDoc.type}</div>
              <div className="text-sm font-semibold text-black">{viewDoc.name}</div>
              <div className="text-xs text-black/50">{viewDoc.size}</div>
              {viewDoc.url && (
                <a href={viewDoc.url} download={viewDoc.name}
                  className="text-xs bg-[#0f172a] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90">
                  <Download className="h-3.5 w-3.5" /> Download File
                </a>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); }}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
        <p className="text-xs text-muted-foreground">Drop files here or <span className="text-primary font-semibold underline cursor-pointer">browse</span></p>
        <p className="text-[10px] text-muted-foreground mt-0.5">PDF, DOCX, XLSX, PPTX — BOQ, TOR, Drawings, Specs</p>
        <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" className="hidden"
          onChange={e => handleFiles(e.target.files)} />
      </div>

      {/* Doc list */}
      {docs.length > 0 && (
        <div className="space-y-1.5">
          {docs.map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 border border-border rounded-lg bg-background">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${typeColor[doc.type] ?? "bg-gray-400"}`}>{doc.type}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">{doc.name}</div>
                <div className="text-[10px] text-muted-foreground">{doc.size}</div>
              </div>
              <button onClick={() => setViewDoc(doc)} className="text-xs text-[#0F172A] hover:underline flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> View
              </button>
              <button onClick={() => setDocs(prev => prev.filter((_, xi) => xi !== i))} className="text-xs text-red-500 hover:underline">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── EOI Modal ─────────────────────────────────────────────────────────────

function EOIModal({ tender, onClose }: { tender: EnhancedTender; onClose: () => void }) {
  const [form, setForm] = useState({ company: "", contactPerson: "", email: "", phone: "", experience: "", statement: "" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const inp = "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  const submit = () => {
    if (!form.company || !form.email) { toast("Company and email required", "warning"); return; }
    pushNotification(`EOI submitted for ${tender.id} by ${form.company}`, "success");
    toast(`Expression of Interest submitted for ${tender.title}`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold">Expression of Interest</h2>
            <p className="text-xs text-muted-foreground">{tender.id}</p>
          </div>
          <button onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-3">
          <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Name *</label>
            <input className={`${inp} mt-1`} value={form.company} onChange={e => set("company", e.target.value)} /></div>
          <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Person</label>
            <input className={`${inp} mt-1`} value={form.contactPerson} onChange={e => set("contactPerson", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email *</label>
              <input type="email" className={`${inp} mt-1`} value={form.email} onChange={e => set("email", e.target.value)} /></div>
            <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</label>
              <input className={`${inp} mt-1`} value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
          </div>
          <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Relevant Experience (years)</label>
            <input type="number" className={`${inp} mt-1`} value={form.experience} onChange={e => set("experience", e.target.value)} /></div>
          <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statement of Interest</label>
            <textarea className={`${inp} mt-1`} rows={3} value={form.statement} onChange={e => set("statement", e.target.value)} /></div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm">Cancel</button>
          <button onClick={submit} className="h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5">
            <Send className="h-4 w-4" /> Submit EOI
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Tender Card Component ─────────────────────────────────────────────────

function TenderCard({ t, onEOI, onOpen }: { t: EnhancedTender; onEOI: (t: EnhancedTender) => void; onOpen: (t: EnhancedTender) => void }) {
  const navigate = useNavigate();
  const isOpen = t.status === "Bidding Open";
  const isClosingSoon = t.status === "Bid Closing Soon";
  const isClosed = ["Bid Closed", "Opening", "Evaluation", "Award Recommended", "Awarded", "Contract Signed"].includes(t.status);

  const downloadDocs = () => {
    toast(`Downloading bidding documents for ${t.id}…`, "info");
    pushNotification(`Documents downloaded for tender ${t.id}`, "success");
    setTimeout(() => {
      const blob = new Blob([`TENDER BIDDING DOCUMENTS\n\nReference: ${t.id}\nTitle: ${t.title}\nEntity: ${t.entity}\nEstimated Value: ${t.currency} ${Number(t.estimatedValue).toLocaleString()}\nClose Date: ${t.bidCloseDate}\n\nFor full document package, contact the procuring entity.\n\nDocument Fee: ${t.documentFee}\nEMD Required: ${t.emd}`], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${t.id}-BiddingDocs.txt`; a.click();
      URL.revokeObjectURL(url);
    }, 800);
  };

  const statusCls = STATUS_COLORS[t.status] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded">{t.id}</span>
            <button onClick={() => onOpen(t)} className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusCls} cursor-pointer hover:opacity-80 transition-opacity`}>
              {t.status}
            </button>
          </div>
          <h3 className="font-semibold text-sm text-foreground leading-snug cursor-pointer hover:text-primary transition-colors" onClick={() => onOpen(t)}>
            {t.title}
          </h3>
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{t.entity}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Tag className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{t.category}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <FileText className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{t.method}</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-foreground">
          <Banknote className="h-3.5 w-3.5 flex-shrink-0 text-[#0F172A]" />
          <span>{t.currency} {Number(t.estimatedValue).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
          <span>Doc Fee: {t.documentFee}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{t.bids} {t.bids === 1 ? "bid" : "bids"}</span>
        </div>
      </div>

      {/* Timers */}
      <div className="bg-secondary/50 rounded-xl p-3 space-y-1.5">
        {t.preBidDate && <CountdownTimer target={t.preBidDate} label="Pre-Bid Meeting" color="text-[#0F172A]" />}
        {t.bidOpenDate && <CountdownTimer target={t.bidOpenDate} label="Bidding Opens" color="text-[#0F172A]" />}
        {t.bidCloseDate && (
          <CountdownTimer
            target={t.bidCloseDate}
            label="Bid Submission Deadline"
            color={isClosingSoon ? "text-[#0F172A]" : isClosed ? "text-red-500" : "text-[#0F172A]"}
          />
        )}
        {t.bidOpeningDate && <CountdownTimer target={t.bidOpeningDate} label="Bid Opening" color="text-[#0F172A]" />}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <button onClick={() => onOpen(t)} className="flex items-center gap-1.5 text-xs h-8 px-3 rounded-lg border border-border hover:bg-secondary transition-colors">
          <Eye className="h-3.5 w-3.5" /> View Details
        </button>
        <button onClick={downloadDocs} className="flex items-center gap-1.5 text-xs h-8 px-3 rounded-lg border border-border hover:bg-secondary transition-colors">
          <FileDown className="h-3.5 w-3.5" /> Documents
        </button>
        {(isOpen || t.status === "Published") && (
          <button onClick={() => onEOI(t)} className="flex items-center gap-1.5 text-xs h-8 px-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity ml-auto">
            <Send className="h-3.5 w-3.5" /> Submit EOI
          </button>
        )}
      </div>

      {/* Lifecycle stages clickable */}
      <div className="flex gap-1 flex-wrap">
        {["Preparation", "Approval", "Publication", "Clarifications", "Bidding", "Opening", "Evaluation", "Award"].map((stage) => (
          <button key={stage} onClick={() => navigate(`/tenders/${t.id}/stage/${stage.toLowerCase()}`)}
            className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-secondary hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground">
            {stage}
          </button>
        ))}
      </div>
    </div>
  );
}


// ── Filter Sidebar ────────────────────────────────────────────────────────

function FilterSidebar({ filters, setFilters, onClose }: {
  filters: Record<string, string>;
  setFilters: (f: Record<string, string>) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState({ ...filters });
  const set = (k: string, v: string) => setLocal(p => ({ ...p, [k]: v }));
  const inp = "w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30";

  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex">
      <div className="w-80 bg-card border-r border-border h-full overflow-y-auto p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Filter Tenders</h3>
          <button onClick={onClose}><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Ministry</label>
            <select className={inp} value={local.ministry} onChange={e => set("ministry", e.target.value)}>
              <option value="">All Ministries</option>
              {getMinistryOptions().map(m => <option key={m.value} value={m.value}>{m.code} — {m.label.replace("Ministry of ", "")}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Category</label>
            <select className={inp} value={local.category} onChange={e => set("category", e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Method</label>
            <select className={inp} value={local.method} onChange={e => set("method", e.target.value)}>
              <option value="">All Methods</option>
              {METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Status</label>
            <select className={inp} value={local.status} onChange={e => set("status", e.target.value)}>
              <option value="">All Statuses</option>
              {TENDER_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Min Value (USD)</label>
            <input type="number" className={inp} value={local.minValue} onChange={e => set("minValue", e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Max Value (USD)</label>
            <input type="number" className={inp} value={local.maxValue} onChange={e => set("maxValue", e.target.value)} placeholder="No limit" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Closing From</label>
            <input type="date" className={inp} value={local.closeFrom} onChange={e => set("closeFrom", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Closing To</label>
            <input type="date" className={inp} value={local.closeTo} onChange={e => set("closeTo", e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={() => { setFilters(local); onClose(); }} className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
            Apply Filters
          </button>
          <button onClick={() => { const e = { ministry: "", category: "", method: "", status: "", minValue: "", maxValue: "", closeFrom: "", closeTo: "" }; setLocal(e); setFilters(e); }} className="h-9 px-3 rounded-lg border border-border text-sm">
            Reset
          </button>
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
}

// ── Tender Detail Window (full-screen inline) ─────────────────────────────
import TenderEvaluationForms from "@/components/TenderEvaluationForms";

type DetailTab = "overview" | "documents" | "evaluation" | "lifecycle" | "bids";

function TenderDetailWindow({ tender, onClose, onEdit }: {
  tender: EnhancedTender;
  onClose: () => void;
  onEdit: (t: EnhancedTender) => void;
}) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<DetailTab>("overview");
  const [docs, setDocs] = useState<{ name: string; type: string; size: string; url?: string }[]>([
    { name: `${tender.id}-BiddingDocument.pdf`,  type: "PDF",  size: "2.4 MB" },
    { name: `${tender.id}-BOQ.xlsx`,             type: "XLSX", size: "840 KB" },
    { name: `${tender.id}-TechnicalSpecs.pdf`,   type: "PDF",  size: "1.1 MB" },
    { name: `${tender.id}-DrawingsPackage.pdf`,  type: "PDF",  size: "4.8 MB" },
  ]);
  const [viewDoc, setViewDoc] = useState<{ name: string; type: string; size: string; url?: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const statusCls = STATUS_COLORS[tender.status] ?? "bg-gray-100 text-gray-600";
  const typeColor: Record<string, string> = { PDF: "bg-red-500", XLSX: "bg-[#0F172A]", DOCX: "bg-[#0F172A]", PPTX: "bg-[#0F172A]" };

  const DETAIL_TABS: { id: DetailTab; label: string }[] = [
    { id: "overview",   label: "📋 Overview" },
    { id: "documents",  label: "📁 Documents" },
    { id: "evaluation", label: "📊 Evaluation Forms" },
    { id: "lifecycle",  label: "🔄 Lifecycle Stages" },
    { id: "bids",       label: "👥 Bidders" },
  ];

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(f => {
      const url = URL.createObjectURL(f);
      setDocs(prev => [...prev, {
        name: f.name,
        type: (f.name.split(".").pop() ?? "DOC").toUpperCase(),
        size: f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
        url,
      }]);
    });
    pushNotification(`${files.length} document(s) attached to ${tender.id}`, "success");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-stretch justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-6xl flex flex-col overflow-hidden sm:rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="flex-shrink-0 bg-[#0f172a] text-white px-5 py-3 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-[11px] bg-white/10 px-2 py-0.5 rounded text-white/80">{tender.id}</span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${statusCls}`}>{tender.status}</span>
              <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded text-white/70">{tender.method}</span>
            </div>
            <h2 className="text-sm font-bold text-white leading-snug">{tender.title}</h2>
            <div className="text-[11px] text-white/55 mt-0.5">{tender.entity} · {tender.category}</div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => onEdit(tender)}
              className="h-8 px-3 bg-[#0F172A] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-[#0F172A]">
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </button>
            <button onClick={() => navigate(`/tenders/${tender.id}`)}
              className="h-8 px-3 bg-white/10 text-white text-xs rounded-lg flex items-center gap-1.5 hover:bg-white/20">
              <Eye className="h-3.5 w-3.5" /> Full Page
            </button>
            <button onClick={onClose}
              className="h-8 w-8 bg-red-700/80 text-white rounded-lg flex items-center justify-center hover:bg-red-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Sub-tab strip */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 overflow-x-auto">
          <div className="flex px-2 gap-0.5 pt-1">
            {DETAIL_TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap rounded-t-lg border border-b-0 transition-all ${tab === t.id ? "bg-white border-gray-200 text-[#0F172A] -mb-px pb-3 z-10 relative" : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left: Key details */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Tender Details</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      { label: "Estimated Value",  value: `${tender.currency} ${Number(tender.estimatedValue).toLocaleString()}` },
                      { label: "Method",           value: tender.method },
                      { label: "Category",         value: tender.category },
                      { label: "Document Fee",     value: tender.documentFee },
                      { label: "EMD Required",     value: tender.emd },
                      { label: "Bid Validity",     value: `${tender.validityDays} days` },
                      { label: "Bids Received",    value: String(tender.bids) },
                      { label: "Relaxation",       value: `${tender.relaxationMinutes} min` },
                    ].map(f => (
                      <div key={f.label} className="bg-white rounded-lg border border-gray-100 p-2.5">
                        <div className="text-[9px] text-gray-400 uppercase tracking-wider">{f.label}</div>
                        <div className="text-xs font-semibold text-gray-800 mt-0.5">{f.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</div>
                  <p className="text-xs text-gray-700 leading-relaxed">{tender.description}</p>
                </div>
              </div>
              {/* Right: Dates + timers */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Key Dates & Countdowns</div>
                  <div className="space-y-2.5">
                    {[
                      { label: "Published",         value: tender.publishedDate,   timer: null },
                      { label: "Pre-Bid Meeting",   value: tender.preBidDate,      timer: tender.preBidDate },
                      { label: "Bidding Opens",     value: tender.bidOpenDate,     timer: tender.bidOpenDate },
                      { label: "Bid Close Deadline",value: tender.bidCloseDate,    timer: tender.bidCloseDate },
                      { label: "Bid Opening",       value: tender.bidOpeningDate,  timer: tender.bidOpeningDate },
                    ].map(d => (
                      <div key={d.label} className="flex items-center justify-between gap-3 p-2 bg-white rounded-lg border border-gray-100">
                        <div>
                          <div className="text-[9px] text-gray-400 uppercase tracking-wider">{d.label}</div>
                          <div className="text-xs font-semibold text-gray-700">{d.value?.split("T")[0] ?? "—"}</div>
                        </div>
                        {d.timer && <CountdownTimer target={d.timer} label="" color="text-[#0F172A]" />}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pre-Bid Meeting</div>
                  <div className="text-xs text-gray-600 flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    {tender.preBidLocation || "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENTS */}
          {tab === "documents" && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-sm font-bold text-gray-900">Tender Documents</div>
                <div className="flex gap-2">
                  <button onClick={() => fileRef.current?.click()}
                    className="h-8 px-3 bg-[#0f172a] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-[#1e293b]">
                    <Upload className="h-3.5 w-3.5" /> Upload Document
                  </button>
                  <input ref={fileRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.pptx" className="hidden" onChange={e => handleFileUpload(e.target.files)} />
                </div>
              </div>

              {/* Document viewer */}
              {viewDoc && (
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f172a] text-white">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-semibold">{viewDoc.name}</span>
                      <span className="text-[10px] text-white/50">{viewDoc.size}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {viewDoc.url && (
                        <a href={viewDoc.url} download={viewDoc.name}
                          className="h-7 px-3 bg-white/10 hover:bg-white/20 text-white text-[10px] rounded-lg flex items-center gap-1">
                          <Download className="h-3 w-3" /> Download
                        </a>
                      )}
                      <button onClick={() => setViewDoc(null)}
                        className="h-7 w-7 bg-red-700/80 hover:bg-red-600 text-white rounded-lg flex items-center justify-center">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-100 p-6">
                    {viewDoc.type === "PDF" && viewDoc.url ? (
                      <iframe src={viewDoc.url} className="w-full h-[400px] border-0 rounded-lg shadow" title={viewDoc.name} />
                    ) : (
                      <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-3 text-center">
                        <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-white font-bold ${typeColor[viewDoc.type] ?? "bg-gray-500"}`}>{viewDoc.type}</div>
                        <div className="text-sm font-bold text-black">{viewDoc.name}</div>
                        <div className="text-xs text-gray-400">{viewDoc.size}</div>
                        {viewDoc.url && (
                          <a href={viewDoc.url} download={viewDoc.name}
                            className="text-xs bg-[#0f172a] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90">
                            <Download className="h-3.5 w-3.5" /> Download File
                          </a>
                        )}
                        <p className="text-xs text-gray-400">Preview only available for PDF files. Download to view {viewDoc.type}.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Drop zone */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-slate-200 hover:bg-slate-50/30 transition-colors"
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}>
                <Upload className="h-7 w-7 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Drop files here or <span className="text-[#0F172A] font-semibold">browse</span></p>
                <p className="text-[10px] text-gray-400 mt-0.5">PDF, DOCX, XLSX — BOQ, TOR, Drawings, Bidding Documents</p>
              </div>

              {/* Document list */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {docs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 group">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${typeColor[doc.type] ?? "bg-gray-500"}`}>{doc.type}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{doc.name}</div>
                      <div className="text-[10px] text-gray-400">{doc.size}</div>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setViewDoc(doc)}
                        className="h-7 px-3 text-xs text-[#0F172A] hover:bg-slate-50 rounded-lg font-medium flex items-center gap-1">
                        <Eye className="h-3 w-3" /> View
                      </button>
                      {doc.url && (
                        <a href={doc.url} download={doc.name}
                          className="h-7 px-3 text-xs text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1">
                          <Download className="h-3 w-3" /> Download
                        </a>
                      )}
                      <button onClick={() => setDocs(p => p.filter((_, xi) => xi !== i))}
                        className="h-7 w-7 text-red-400 hover:bg-red-50 rounded-lg flex items-center justify-center">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {docs.length === 0 && (
                  <div className="px-4 py-8 text-center text-xs text-gray-400">No documents yet. Upload files above.</div>
                )}
              </div>
            </div>
          )}

          {/* EVALUATION FORMS */}
          {tab === "evaluation" && (
            <div className="h-full min-h-[600px]">
              <TenderEvaluationForms tender={tender.id} bidder="CLEMENT PTY LTD" embedded />
            </div>
          )}

          {/* LIFECYCLE STAGES */}
          {tab === "lifecycle" && (
            <div className="p-5 space-y-3">
              <div className="text-sm font-bold text-gray-900 mb-2">Procurement Lifecycle — {tender.method}</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { stage: "Preparation", done: true }, { stage: "Approval", done: true },
                  { stage: "Publication", done: ["Published","Bidding Open","Evaluation","Awarded"].includes(tender.status) },
                  { stage: "Clarifications", done: ["Bidding Open","Evaluation","Awarded"].includes(tender.status) },
                  { stage: "Bidding", done: ["Evaluation","Award Recommended","Awarded","Contract Signed"].includes(tender.status) },
                  { stage: "Opening", done: ["Evaluation","Award Recommended","Awarded","Contract Signed"].includes(tender.status) },
                  { stage: "Evaluation", done: ["Award Recommended","Awarded","Contract Signed"].includes(tender.status) },
                  { stage: "Award", done: ["Awarded","Contract Signed"].includes(tender.status) },
                ].map((s, i) => (
                  <button key={s.stage} onClick={() => navigate(`/tenders/${tender.id}/stage/${s.stage.toLowerCase()}`)}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all hover:shadow-sm ${s.done ? "bg-slate-50 border-slate-200 text-[#0F172A]" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold ${s.done ? "bg-[#0F172A] text-white" : "bg-gray-200 text-gray-500"}`}>
                        {s.done ? "✓" : i + 1}
                      </span>
                      {s.stage}
                    </div>
                    <div className="text-[9px] text-gray-400">Click to open stage</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 p-4 bg-[#0f172a] rounded-xl text-white">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Current Stage</div>
                <div className="text-lg font-bold">{tender.status}</div>
                <div className="text-xs text-white/60 mt-0.5">Ref: {tender.id} · {tender.entity}</div>
              </div>
            </div>
          )}

          {/* BIDDERS */}
          {tab === "bids" && (
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-gray-900">{tender.bids} Bid{tender.bids !== 1 ? "s" : ""} Received</div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusCls}`}>{tender.status}</span>
              </div>
              {tender.bids === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No bids submitted yet.</p>
                  <p className="text-xs mt-1">Bid closing: {tender.bidCloseDate?.split("T")[0]}</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {Array.from({ length: tender.bids }, (_, i) => ({
                    name: ["Highveld Engineering", "Zimbabwe Pharma Holdings", "Sable ICT Solutions", "Mashonaland Agri Supplies", "Bulawayo Civil Works", "Eastern Highlands Logistics", "Granite Construction Group", "National Trading Co.", "ZimBuild Limited", "SouthernCross Supplies", "TechVenture Ltd", "AfricaBuild Solutions"][i % 12],
                    ref: `BID-${tender.id}-${String(i+1).padStart(3,"0")}`, received: "2026-06-15", status: ["Under Review","Shortlisted","Evaluated","Qualified"][i % 4],
                  })).map((bid, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <div className="h-8 w-8 rounded-full bg-[#0f172a] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i+1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800">{bid.name}</div>
                        <div className="text-[10px] text-gray-400">{bid.ref} · Received: {bid.received}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bid.status === "Shortlisted" ? "bg-slate-100 text-[#0F172A]" : bid.status === "Qualified" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{bid.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

type MainTab = "Tenders Register" | "GIS Map";
const MAIN_TABS: MainTab[] = ["Tenders Register", "GIS Map"];

export default function TendersPage() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<MainTab>("Tenders Register");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"card" | "table">("card");
  const [showNew, setShowNew] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [eoiTender, setEoiTender] = useState<EnhancedTender | null>(null);
  const [localTenders, setLocalTenders] = useState<EnhancedTender[]>(MOCK_TENDERS);
  const [filters, setFilters] = useState<Record<string, string>>({ ministry: "", category: "", method: "", status: "", minValue: "", maxValue: "", closeFrom: "", closeTo: "" });
  const [selectedTender, setSelectedTender] = useState<EnhancedTender | null>(null);
  const [editTender, setEditTender] = useState<EnhancedTender | null>(null);

  const filtered = localTenders.filter(t => {
    const q = search.toLowerCase();
    if (q && !t.title.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q) && !t.entity.toLowerCase().includes(q)) return false;
    if (filters.ministry && t.ministry !== filters.ministry) return false;
    if (filters.category && t.category !== filters.category) return false;
    if (filters.method && t.method !== filters.method) return false;
    if (filters.status && t.status !== filters.status) return false;
    if (filters.minValue && Number(t.estimatedValue.replace(/,/g, "")) < Number(filters.minValue)) return false;
    if (filters.maxValue && Number(t.estimatedValue.replace(/,/g, "")) > Number(filters.maxValue)) return false;
    return true;
  });

  const statusCounts = localTenders.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {} as Record<string, number>);

  const exportCSV = () => {
    const rows = ["Reference,Title,Entity,Category,Method,Value,Currency,Status,BidClose,Bids",
      ...filtered.map(t => `${t.id},"${t.title}","${t.entity}","${t.category}","${t.method}",${t.estimatedValue},${t.currency},${t.status},${t.bidCloseDate},${t.bids}`)
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "tenders-register.csv"; a.click();
    URL.revokeObjectURL(url);
    pushNotification("Tenders exported to CSV", "success");
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Tenders Register"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className={`p-4 sm:p-6 mx-auto ${mainTab === "GIS Map" ? "max-w-[1800px] flex flex-col h-[calc(100vh-56px)]" : "max-w-[1600px]"}`}>
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold bg-slate-100 text-[#0F172A] px-2 py-0.5 rounded-full">Phases 3–10</span>
          <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Government of Zimbabwe</span>
        </div>
        <PageHeader
          title="Tenders Register"
          description="NITB-style tender hub — full lifecycle from preparation to contract signing with real-time countdowns."
          actions={
            mainTab === "Tenders Register" ? (
              <button onClick={() => setShowNew(true)} className="h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1.5 hover:opacity-90">
                <Plus className="h-4 w-4" /> New Tender
              </button>
            ) : null
          }
        />

        {/* Main tab bar */}
        <div className="flex gap-1 border-b border-border mb-5">
          {MAIN_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setMainTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                mainTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "GIS Map" && <MapPin className="h-3.5 w-3.5" />}
              {tab}
            </button>
          ))}
        </div>

        {/* ── GIS Map Tab ─────────────────────────────────────────────── */}
        {mainTab === "GIS Map" && (
          <div className="flex-1 rounded-2xl overflow-hidden border border-border shadow-sm min-h-0" style={{ minHeight: "500px" }}>
            <GisMapView
              pins={TENDER_PINS}
              height="100%"
              title="Tenders GIS Map"
              onNavigate={pin => navigate(`/tenders/${pin.id}`)}
            />
          </div>
        )}

        {/* ── Tenders Register Tab ─────────────────────────────────────── */}
        {mainTab === "Tenders Register" && (<>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Tenders" value={String(localTenders.length)} delta="All statuses" icon={FileText} />
          <KpiCard label="Bidding Open" value={String(statusCounts["Bidding Open"] || 0)} delta="Accepting bids now" icon={Clock} />
          <KpiCard label="Awarded" value={String(statusCounts["Awarded"] || 0)} delta="This period" icon={CheckCircle2} />
          <KpiCard label="Draft" value={String(statusCounts["Draft"] || 0)} delta="Pending approval" icon={XCircle} />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tenders, references, entities…"
              className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button onClick={() => setShowFilters(true)} className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary">
            <Filter className="h-4 w-4" /> Filters
          </button>
          <div className="flex border border-border rounded-md overflow-hidden">
            <button onClick={() => setView("card")} className={`h-9 px-3 text-sm flex items-center gap-1.5 transition-colors ${view === "card" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`}>
              <LayoutGrid className="h-4 w-4" /> Cards
            </button>
            <button onClick={() => setView("table")} className={`h-9 px-3 text-sm flex items-center gap-1.5 transition-colors ${view === "table" ? "bg-primary text-primary-foreground" : "bg-card hover:bg-secondary"}`}>
              <Table2 className="h-4 w-4" /> Table
            </button>
          </div>
          <button onClick={exportCSV} className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-4">{filtered.length} tender{filtered.length !== 1 ? "s" : ""} found</p>

        {/* Card View */}
        {view === "card" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {filtered.map(t => <TenderCard key={t.id} t={t} onEOI={setEoiTender} onOpen={setSelectedTender} />)}
            {filtered.length === 0 && (
              <div className="col-span-3 py-16 text-center text-muted-foreground text-sm">No tenders match your search or filters.</div>
            )}
          </div>
        )}

        {/* Table View */}
        {view === "table" && (
          <Card className="mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-xs text-muted-foreground">
                  <tr>{["Ref", "Title", "Entity", "Category", "Method", "Value", "Bid Close", "Bids", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">No tenders found.</td></tr>
                  ) : filtered.map(t => (
                    <tr key={t.id} className="hover:bg-secondary/30 cursor-pointer">
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{t.id}</td>
                      <td className="px-4 py-3 max-w-[220px]"><div className="truncate font-medium" onClick={() => setSelectedTender(t)}>{t.title}</div></td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">{t.entity}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">{t.category}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><span className="text-[11px] bg-secondary px-2 py-0.5 rounded">{t.method}</span></td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-xs">{t.currency} {Number(t.estimatedValue).toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">{t.bidCloseDate.split("T")[0]}</td>
                      <td className="px-4 py-3 text-xs">{t.bids}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status]}`}>{t.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedTender(t)} className="text-xs text-primary hover:underline">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {showNew && <NewTenderModal onClose={() => setShowNew(false)} onSave={t => setLocalTenders(p => [t, ...p])} />}
        {editTender && <NewTenderModal onClose={() => setEditTender(null)} onSave={t => { setLocalTenders(p => p.map(x => x.id === t.id ? t : x)); setEditTender(null); }} />}
        {showFilters && <FilterSidebar filters={filters} setFilters={setFilters} onClose={() => setShowFilters(false)} />}
        {eoiTender && <EOIModal tender={eoiTender} onClose={() => setEoiTender(null)} />}
        {selectedTender && <TenderDetailWindow tender={selectedTender} onClose={() => setSelectedTender(null)} onEdit={t => { setSelectedTender(null); setEditTender(t); }} />}
        </>)}
      </div>
      <InlineWorkbench context="Tenders" />
    </AppShell>
  );
}


