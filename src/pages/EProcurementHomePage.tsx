/**
 * EProcurementHomePage — Steps-to-Tendering flow (11 July spec)
 *
 * Navigation hierarchy (exact match to flow diagram):
 *   Level 0 – Sidebar tiles: Tenders | RFQ | Unsolicited Bids | RFP | EOI | Auctions
 *   Level 1 – Tenders Listing + Tender Reports sub-tiles
 *   Level 2 – Specific Tender → Process Tower | Bidders List | Bids Reports tabs
 *   Level 3 – Specific Bidder → 4 Bid Evaluation stages:
 *               Compliance Stage
 *               Competency Examination Assessment
 *               Technical Specifications Assessment
 *               Financial Assessment & Score
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { AppShell, PageContextBar } from "@/components/AppShell";
import {
  ChevronRight, ChevronLeft, FileText, Users, Eye, FolderOpen,
  Search, Filter, Download, CheckCircle2, AlertTriangle, XCircle,
  Gavel, ShoppingCart, FileSearch, BarChart3, Award, X,
  Sparkles, Shield, Send, DollarSign, ClipboardList, BookOpen,
  Lock, Save, Printer, Plus, Building2, TrendingUp, PlusCircle, Scale,
} from "lucide-react";
import NewFeaturesBanner from "@/components/NewFeaturesBanner";
import LifecycleTower from "@/components/LifecycleTower";
import { TENDER_PREPARATION_STAGES } from "@/lib/lifecycle-stages";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProcTile = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  hoverColor: string;
  desc: string;
  count: number;
};

type TenderItem = {
  id: string; title: string; entity: string;
  value: string; status: string; closing: string; bids: number;
};

type BidderItem = {
  id: string; name: string; status: string;
  complianceResult: "PASS" | "FAIL" | "PENDING";
  competencyScore: number; technicalScore: number; financialScore: number;
  finalScore: number; rank: number;
};

type EvalStage = "compliance" | "competency" | "technical" | "financial";

// ─── Procurement Type Tiles (sidebar) ────────────────────────────────────────
const PROC_TILES: ProcTile[] = [
  { id:"tenders",       label:"Tenders",          icon:FileText,    color:"bg-[#1e3a5f]", hoverColor:"hover:bg-[#162d4a]", desc:"Open / restricted / direct appointment",  count:187 },
  { id:"rfq",           label:"RFQ",              icon:ShoppingCart,color:"bg-[#0F172A]",hoverColor:"hover:bg-[#0F172A]",desc:"Request for Quotation — supplies",         count:94  },
  { id:"unsolicited",   label:"Unsolicited Bids", icon:Shield,      color:"bg-slate-700",  hoverColor:"hover:bg-slate-800",  desc:"Unsolicited proposals",                   count:12  },
  { id:"rfp",           label:"RFP",              icon:FileSearch,  color:"bg-[#0F172A]", hoverColor:"hover:bg-[#0F172A]", desc:"Request for Proposal — consulting/services",count:38  },
  { id:"eoi",           label:"EOI",              icon:Users,       color:"bg-[#0F172A]",  hoverColor:"hover:bg-[#0F172A]",  desc:"Expression of Interest — shortlisting",   count:21  },
  { id:"auctions",      label:"Auctions",         icon:Gavel,       color:"bg-rose-700",   hoverColor:"hover:bg-rose-800",   desc:"Public auctions — asset disposal",         count:9   },
];

// ─── Mock Tender Data ─────────────────────────────────────────────────────────
const MOCK_TENDERS: Record<string, TenderItem[]> = {
  tenders: [
    { id:"ZW-PRA-2026-00184", title:"Solar Mini-Grids — 12 Rural Clinics",                 entity:"Ministry of Energy",   value:"USD 14,800,000", status:"Evaluation", closing:"2026-07-08", bids:11 },
    { id:"ZW-PRA-2026-00183", title:"Procurement of ARV Medicines (2-Year Framework)",     entity:"Ministry of Health",   value:"USD 42,500,000", status:"Bidding",    closing:"2026-06-12", bids:8  },
    { id:"ZW-PRA-2026-00182", title:"National Tax Administration System Phase II",         entity:"ZIMRA",                value:"USD 9,200,000",  status:"Published",  closing:"2026-07-21", bids:5  },
    { id:"ZW-PRA-2026-00181", title:"Beitbridge–Harare Highway Rehabilitation — Sect 4",  entity:"Ministry of Transport",value:"USD 88,000,000", status:"Published",  closing:"2026-08-04", bids:0  },
    { id:"ZW-PRA-2026-00180", title:"Supply of Fertiliser — Pfumvudza Programme 2026/27", entity:"Ministry of Agriculture",value:"USD 31,400,000",status:"Awarded",   closing:"2026-05-30", bids:14 },
    { id:"ZW-PRA-2026-00179", title:"School Textbooks — Primary Grades 1–7",              entity:"Ministry of Education", value:"USD 6,700,000", status:"Bidding",    closing:"2026-07-02", bids:12 },
  ],
  rfq: [
    { id:"RFQ-2026-00091", title:"Office Stationery & Supplies — Q3 2026",         entity:"Ministry of Finance",  value:"USD 45,000",  status:"Evaluation", closing:"2026-07-01", bids:7 },
    { id:"RFQ-2026-00090", title:"Fuel Supply — Government Fleet Jul–Sep 2026",    entity:"Ministry of Transport",value:"USD 320,000", status:"Bidding",    closing:"2026-07-05", bids:4 },
    { id:"RFQ-2026-00089", title:"Cleaning Materials — Harare Central Government", entity:"OPC",                  value:"USD 18,000",  status:"Published",  closing:"2026-07-10", bids:0 },
  ],
  rfp: [
    { id:"RFP-2026-00022", title:"External Audit Services (3 Years)",         entity:"Auditor-General",  value:"USD 1,850,000", status:"Evaluation", closing:"2026-06-18", bids:9 },
    { id:"RFP-2026-00021", title:"ICT Managed Services — Government Datacentre",entity:"Ministry of ICT",value:"USD 4,200,000", status:"Bidding",    closing:"2026-07-15", bids:6 },
  ],
  eoi: [
    { id:"EOI-2026-00014", title:"Rural Broadband Infrastructure Partnership",    entity:"POTRAZ",            value:"TBD",          status:"Evaluation", closing:"2026-07-10", bids:12 },
    { id:"EOI-2026-00013", title:"Smart City Pilot — Bulawayo CBD",              entity:"Bulawayo City Council",value:"TBD",        status:"Published",  closing:"2026-08-01", bids:0  },
  ],
  auctions: [
    { id:"AUC-2026-00008", title:"Government Fleet Disposal — 48 Vehicles",      entity:"Ministry of Finance",value:"Est. USD 480,000", status:"Published", closing:"2026-07-20", bids:0  },
    { id:"AUC-2026-00007", title:"Surplus Office Furniture & Equipment",          entity:"ZIMRA",             value:"Est. USD 35,000",  status:"Bidding",   closing:"2026-07-12", bids:18 },
  ],
  unsolicited: [
    { id:"USB-2026-00003", title:"Smart Irrigation System — Lowveld Estates",     entity:"Ministry of Agriculture",value:"USD 7,600,000", status:"Review", closing:"2026-08-01", bids:1 },
  ],
};

// ─── Mock Bidders ─────────────────────────────────────────────────────────────
const MOCK_BIDDERS: BidderItem[] = [
  { id:"VEN-00481", name:"Zimbabwe Pharma Holdings",  status:"Compliant",        complianceResult:"PASS",    competencyScore:88, technicalScore:87, financialScore:92, finalScore:88.6, rank:1 },
  { id:"VEN-00495", name:"National Distributors Ltd", status:"Compliant",        complianceResult:"PASS",    competencyScore:75, technicalScore:74, financialScore:81, finalScore:76.7, rank:2 },
  { id:"VEN-00502", name:"Bulawayo Supplies Co.",     status:"Compliant",        complianceResult:"PASS",    competencyScore:70, technicalScore:68, financialScore:70, finalScore:68.8, rank:3 },
  { id:"VEN-00511", name:"Eastern Consortium Ltd",    status:"Non-Compliant",    complianceResult:"FAIL",    competencyScore:0,  technicalScore:0,  financialScore:0,  finalScore:0,    rank:0 },
  { id:"VEN-00478", name:"Mutare Trading Group",      status:"Pending Review",   complianceResult:"PENDING", competencyScore:0,  technicalScore:0,  financialScore:0,  finalScore:0,    rank:0 },
];

// ─── Bidder Documents ─────────────────────────────────────────────────────────
const BIDDER_DOCS = [
  { name:"Company Registration Certificate.pdf", cat:"Compliance", size:"320 KB" },
  { name:"Tax Clearance Certificate.pdf",        cat:"Compliance", size:"180 KB" },
  { name:"PRAZ Registration Certificate.pdf",    cat:"Compliance", size:"210 KB" },
  { name:"Technical Proposal.pdf",               cat:"Technical",  size:"4.2 MB" },
  { name:"Competence Test Responses.pdf",        cat:"Technical",  size:"980 KB" },
  { name:"Financial Proposal — Price Schedule.xlsx", cat:"Financial", size:"640 KB" },
  { name:"Bank Guarantee.pdf",                   cat:"Financial",  size:"290 KB" },
  { name:"Company Profile.pdf",                  cat:"Profile",    size:"1.8 MB" },
];

// ─── Compliance checklist items ───────────────────────────────────────────────
const COMPLIANCE_ITEMS = [
  { id:1,  type:"Standard", label:"Company Solvency — not blacklisted"                                   },
  { id:2,  type:"Standard", label:"Tax Clearance Certificate (ZIMRA) — valid"                           },
  { id:3,  type:"Standard", label:"Directors Criminal Records — clear"                                   },
  { id:4,  type:"Standard", label:"Company Registration (ZIMRA / CRSE) — valid"                         },
  { id:5,  type:"Standard", label:"Bid Security / Tender Guarantee — submitted"                         },
  { id:6,  type:"Standard", label:"PRAZ Registration Certificate — valid"                                },
  { id:7,  type:"Optional", label:"Company Liquidity Ratio check"                                       },
  { id:8,  type:"Optional", label:"Gearing Ratio < 40% (Debt to Assets)"                               },
  { id:9,  type:"Optional", label:"Shareholders Criminal Records"                                        },
  { id:10, type:"Optional", label:"BEE / Indigenisation Compliance"                                     },
  { id:11, type:"Optional", label:"Insurance Coverage (Professional Indemnity)"                         },
  { id:12, type:"Optional", label:"Conflict of Interest Declaration signed"                              },
];

// ─── Technical scoring criteria ───────────────────────────────────────────────
const TECH_CRITERIA = [
  { id:"T1",  label:"Technical Skills & Competency",             maxScore:15, score:13 },
  { id:"T2",  label:"Teams Relevant Technical Experience",        maxScore:10, score:8  },
  { id:"T3",  label:"Academic Qualifications (Masters/Degree+)",  maxScore:10, score:9  },
  { id:"T4",  label:"More than 3 Years in Industry",              maxScore:5,  score:5  },
  { id:"T5",  label:"Machinery & Equipment",                      maxScore:5,  score:4  },
  { id:"T6",  label:"Scale of Operations",                        maxScore:5,  score:4  },
  { id:"T7",  label:"Technical Proposal / Methodology",           maxScore:20, score:18 },
  { id:"T8",  label:"Risk Profile",                               maxScore:5,  score:4  },
  { id:"T9",  label:"More than 10 Completed Past Projects",       maxScore:5,  score:5  },
  { id:"T10", label:"Reference Letters from Past Projects",       maxScore:10, score:9  },
  { id:"T11", label:"More than 3 Large Completed Projects",        maxScore:5,  score:5  },
  { id:"T12", label:"Directors Competency Online Test",           maxScore:5,  score:4  },
  { id:"T13", label:"Technical Team Competency Online Test",      maxScore:5,  score:4  },
];

// ─── Helper: Status Badge ─────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Evaluation"    ? "bg-slate-100 text-[#0F172A]" :
    status === "Bidding"       ? "bg-slate-100 text-[#0F172A]" :
    status === "Published"     ? "bg-slate-100 text-[#0F172A]" :
    status === "Awarded"       ? "bg-slate-100 text-[#0F172A]" :
    status === "Review"        ? "bg-slate-100 text-[#0F172A]" :
    status === "Compliant"     ? "bg-slate-100 text-[#0F172A]" :
    status === "Non-Compliant" ? "bg-red-100 text-red-700" :
    status === "Pending Review"? "bg-slate-100 text-[#0F172A]" :
    "bg-gray-100 text-gray-600";
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${cls}`}>{status}</span>;
}

// ─── Helper: Breadcrumb bar ────────────────────────────────────────────────────
function Breadcrumb({ crumbs }: { crumbs: { label: string; onClick?: () => void }[] }) {
  return (
    <div className="bg-white border-b border-black/8 px-5 py-2 flex items-center gap-1.5 text-xs flex-shrink-0 flex-wrap">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3 text-black/25 flex-shrink-0" />}
          {c.onClick ? (
            <button onClick={c.onClick} className="text-black/45 hover:text-black font-medium transition-colors">
              {c.label}
            </button>
          ) : (
            <span className="font-semibold text-black">{c.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

// ─── Level 0: Procurement Sidebar Tiles ──────────────────────────────────────
function ProcTiles({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="p-5">
      <NewFeaturesBanner />
      {/* Intake CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 p-4 rounded-xl bg-[#0F172A] text-white">
        <div className="h-10 w-10 rounded-xl bg-white/20 grid place-items-center flex-shrink-0">
          <Send className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm">Use the Intake Portal for new procurement requests</div>
          <div className="text-xs text-slate-300 mt-0.5">AI automatically routes any request to the correct workflow — Tender, RFQ, RFP, EOI or Direct.</div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-[#0f172a] mb-1">E-Procurement</h2>
      <p className="text-sm text-black/50 mb-5">Click on a procurement type to view its listings and reports.</p>

      {/* 6 Tiles — matching the diagram */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {PROC_TILES.map(tile => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              onClick={() => onSelect(tile.id)}
              className={`group text-left ${tile.color} ${tile.hoverColor} rounded-2xl p-5 transition-all hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-white/20 grid place-items-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-white/60 text-xs font-mono">{tile.count}</span>
              </div>
              <div className="text-white font-bold text-base">{tile.label}</div>
              <div className="text-white/60 text-[11px] mt-1 leading-snug">{tile.desc}</div>
              <div className="mt-3 flex items-center gap-1 text-white/40 text-[10px]">
                <span>View listings</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { l:"Total Registered", v:"361",  icon:FileText,  color:"text-[#0F172A]"   },
          { l:"Under Evaluation", v:"318",  icon:BarChart3, color:"text-[#0F172A]" },
          { l:"Awarded",          v:"84",   icon:Award,     color:"text-[#0F172A]"},
          { l:"Open Bids",        v:"641",  icon:Users,     color:"text-[#0F172A]"  },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.l} className="bg-white border border-black/8 rounded-xl p-4 flex items-center gap-3">
              <Icon className={`h-7 w-7 ${s.color} flex-shrink-0`} />
              <div>
                <div className="text-xl font-bold text-black">{s.v}</div>
                <div className="text-[11px] text-black/45">{s.l}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Per-type counts — every procurement type has its OWN numbers ────────────
const MODULE_SUB_COUNTS: Record<string, {
  openBids: number; investigations: number; tenderList: number;
  evaluations: number; reports: number;
}> = {
  tenders:    { openBids:12, investigations:5,  tenderList:187, evaluations:38, reports:24 },
  rfq:        { openBids: 8, investigations:2,  tenderList: 94, evaluations:14, reports:11 },
  unsolicited:{ openBids: 3, investigations:1,  tenderList: 12, evaluations: 4, reports: 6 },
  rfp:        { openBids: 6, investigations:1,  tenderList: 38, evaluations: 9, reports: 8 },
  eoi:        { openBids: 4, investigations:0,  tenderList: 21, evaluations: 7, reports: 5 },
  auctions:   { openBids: 2, investigations:0,  tenderList:  9, evaluations: 3, reports: 4 },
};

// ─── Level 1: 6 sub-tiles for each procurement type ─────────────────────────
function TypeSubTiles({
  typeId, typeLabel, onSelectListing, onSelectReports,
}: {
  typeId: string; typeLabel: string;
  onSelectListing: () => void;
  onSelectReports: () => void;
}) {
  const navigate = useNavigate();
  const tile = PROC_TILES.find(t => t.id === typeId)!;
  const Icon = tile?.icon ?? FileText;

  // Use THIS type's own counts — not hardcoded shared values
  const counts = MODULE_SUB_COUNTS[typeId] ?? MODULE_SUB_COUNTS["tenders"];

  const SUB_TILES = [
    {
      id: "open-bids",
      label: "Open Bids Vault",
      desc: "Open closed bids with 4-officer vault authentication",
      icon: Lock,
      color: "bg-[#1e3a5f]",
      count: counts.openBids,
      action: () => navigate(`/tenders/module/${typeId}/open-bids`),
    },
    {
      id: "investigations",
      label: "Investigation Cases",
      desc: "View and manage procurement misconduct investigations",
      icon: AlertTriangle,
      color: "bg-[#EA580C]",
      count: counts.investigations,
      action: () => navigate(`/tenders/module/${typeId}/investigations`),
    },
    {
      id: "tender-list",
      label: `${typeLabel} List`,
      desc: `Browse all ${typeLabel.toLowerCase()} — filter by stage, category, ministry`,
      icon: ClipboardList,
      color: "bg-[#16A34A]",
      count: counts.tenderList,
      action: onSelectListing,
    },
    {
      id: "create",
      label: `Create ${typeLabel}`,
      desc: `Start a new ${typeLabel.toLowerCase()} creation workflow with AI guidance`,
      icon: PlusCircle,
      color: "bg-[#475569]",
      count: null as number | null,
      action: () => navigate(`/tenders/module/${typeId}/create`),
    },
    {
      id: "reports",
      label: "Reports and Intelligence",
      desc: "Analytics, alerts, flagging, spend reports and exports",
      icon: BarChart3,
      color: "bg-[#DC2626]",
      count: counts.reports,
      action: onSelectReports,
    },
    {
      id: "evaluate",
      label: `Evaluate ${typeLabel}`,
      desc: "Access evaluation forms, process tower and scoring sheets",
      icon: Scale,
      color: "bg-[#7C3AED]",
      count: counts.evaluations,
      action: () => navigate(`/tenders/module/${typeId}/evaluate`),
    },
  ];

  return (
    <div className="p-5">
      {/* Type header banner */}
      <div className={`${tile.color} text-white rounded-xl px-5 py-4 mb-6 flex items-center gap-3`}>
        <div className="h-10 w-10 rounded-xl bg-white/20 grid place-items-center flex-shrink-0">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-lg">{typeLabel}</div>
          <div className="text-white/60 text-xs">{counts.tenderList} registered · Select a module below</div>
        </div>
      </div>

      {/* 6 sub-tiles grid — matches 21 July design document exactly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SUB_TILES.map(sub => {
          const SubIcon = sub.icon;
          return (
            <button
              key={sub.id}
              onClick={sub.action}
              className={`group text-left ${sub.color} rounded-2xl p-5 transition-all hover:scale-[1.02] hover:shadow-xl`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-11 w-11 rounded-xl bg-white/20 grid place-items-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <SubIcon className="h-5 w-5 text-white" />
                </div>
                {sub.count !== null && sub.count !== undefined && (
                  <span className="text-3xl font-black text-white/20 group-hover:text-white/30 transition-colors">
                    {sub.count}
                  </span>
                )}
              </div>
              <div className="text-white font-bold text-base mb-1">{sub.label}</div>
              <div className="text-white/60 text-[11px] leading-snug mb-3">{sub.desc}</div>
              <div className="flex items-center gap-1 text-white/40 text-[10px] group-hover:text-white/70 transition-colors">
                <span>View listings</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Level 1b: Tender Reports panel ──────────────────────────────────────────
function TenderReportsPanel({ typeLabel }: { typeLabel: string }) {
  const REPORT_ROWS = [
    { ref:"RPT-2026-001", title:`${typeLabel} — Evaluation Summary Q2 2026`,   date:"2026-06-30", status:"Ready",    records:48 },
    { ref:"RPT-2026-002", title:`${typeLabel} — Spend Analysis H1 2026`,        date:"2026-06-30", status:"Ready",    records:120 },
    { ref:"RPT-2026-003", title:`${typeLabel} — Awards Register FY2026/27`,     date:"2026-07-01", status:"Pending",  records:12 },
    { ref:"RPT-2026-004", title:`${typeLabel} — Compliance Audit Report`,       date:"2026-07-05", status:"Draft",    records:67 },
    { ref:"RPT-2026-005", title:`${typeLabel} — Bidder Performance Summary`,    date:"2026-07-10", status:"Pending",  records:89 },
  ];
  return (
    <div className="p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-9 w-9 rounded-xl bg-[#0F172A] grid place-items-center flex-shrink-0">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#0f172a]">Tender Reports — {typeLabel}</h2>
          <p className="text-xs text-black/45">Consolidated reports, analytics and audit exports</p>
        </div>
      </div>
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { l:"Total Reports",     v:"5",    c:"text-[#0F172A]"   },
          { l:"Ready for Download",v:"2",    c:"text-[#0F172A]"},
          { l:"Pending",           v:"2",    c:"text-[#0F172A]"  },
          { l:"Draft",             v:"1",    c:"text-gray-500"   },
        ].map(k => (
          <div key={k.l} className="bg-white border border-black/8 rounded-xl p-4">
            <div className={`text-2xl font-bold ${k.c}`}>{k.v}</div>
            <div className="text-[11px] text-black/45">{k.l}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-black/8 flex items-center justify-between">
          <span className="text-sm font-semibold">Reports Register</span>
          <button className="h-7 px-3 bg-[#0f172a] text-white text-[10px] font-semibold rounded-lg flex items-center gap-1">
            <Download className="h-3 w-3" /> Export All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#f8fafc] border-b border-black/8">
              <tr>
                {["Ref","Title","Date","Status","Records","Action"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-black/50 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {REPORT_ROWS.map(r => (
                <tr key={r.ref} className="hover:bg-[#f4f7fb] transition-colors">
                  <td className="px-4 py-3 font-mono text-black/50">{r.ref}</td>
                  <td className="px-4 py-3 font-medium text-black">{r.title}</td>
                  <td className="px-4 py-3 text-black/50">{r.date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.status==="Ready"?"bg-slate-100 text-[#0F172A]":r.status==="Pending"?"bg-slate-100 text-[#0F172A]":"bg-gray-100 text-gray-600"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-black/60">{r.records}</td>
                  <td className="px-4 py-3">
                    <button className="h-7 px-3 bg-[#0f172a] text-white text-[10px] font-semibold rounded-lg flex items-center gap-1">
                      <Download className="h-3 w-3" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Level 2a: Tenders Listing table ─────────────────────────────────────────
function TendersListing({
  typeId, typeLabel, onSelectTender,
}: {
  typeId: string; typeLabel: string;
  onSelectTender: (t: TenderItem) => void;
}) {
  const [search, setSearch] = useState("");
  const items = MOCK_TENDERS[typeId] ?? [];
  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.id.toLowerCase().includes(search.toLowerCase()) ||
    i.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-xl bg-[#1e3a5f] grid place-items-center flex-shrink-0">
          <ClipboardList className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#0f172a]">{typeLabel} Listing</h2>
          <p className="text-xs text-black/45">Click a record to view Process Tower, Bidders and Bids Reports</p>
        </div>
      </div>
      {/* Search */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, reference or entity…"
            className="w-full h-9 pl-9 pr-3 text-sm border border-black/10 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <button className="h-9 px-3 bg-white border border-black/10 text-sm text-black/60 hover:bg-gray-50 rounded-lg flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5" /> Filter
        </button>
      </div>

      <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-black/8 flex items-center justify-between">
          <span className="text-sm font-semibold text-black">{typeLabel} Register</span>
          <span className="text-xs text-black/40">{filtered.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f8fafc] border-b border-black/8">
              <tr>
                {["Ref / ID","Title","Entity","Value","Closing","Status","Bids","Action"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-black/50 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-black/35">No records found</td></tr>
              )}
              {filtered.map(item => (
                <tr
                  key={item.id}
                  className="hover:bg-[#f4f7fb] transition-colors cursor-pointer"
                  onClick={() => onSelectTender(item)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-black/50 whitespace-nowrap">{item.id}</td>
                  <td className="px-4 py-3 font-medium text-black max-w-xs">
                    <div className="truncate">{item.title}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-black/60 whitespace-nowrap">{item.entity}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-black whitespace-nowrap">{item.value}</td>
                  <td className="px-4 py-3 text-xs text-black/50 whitespace-nowrap">{item.closing}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-xs text-center font-semibold text-black/60">{item.bids}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={e => { e.stopPropagation(); onSelectTender(item); }}
                      className="h-7 px-3 bg-[#0f172a] text-white text-[10px] font-semibold hover:bg-black/80 rounded transition-colors flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Level 2b: Specific Tender — 3-tab panel ─────────────────────────────────
type TenderTab = "process-tower" | "bidders-list" | "bids-reports";

function TenderDetailPanel({
  tender, typeLabel, onSelectBidder,
}: {
  tender: TenderItem; typeLabel: string;
  onSelectBidder: (b: BidderItem) => void;
}) {
  const [tab, setTab] = useState<TenderTab>("bidders-list");
  const navigate = useNavigate();

  const TABS: { id: TenderTab; label: string; icon: React.ElementType }[] = [
    { id:"process-tower",  label:"Process Tower",  icon:TrendingUp  },
    { id:"bidders-list",   label:"Bidders List",   icon:Users       },
    { id:"bids-reports",   label:"Bids Reports",   icon:BarChart3   },
  ];

  return (
    <div className="p-5">
      {/* Tender header card */}
      <div className="bg-white border border-black/8 rounded-xl p-5 mb-5">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="font-mono text-xs text-black/40 mb-1">{tender.id}</div>
            <h2 className="text-base font-bold text-[#0f172a] leading-snug mb-2">{tender.title}</h2>
            <div className="flex items-center gap-3 flex-wrap text-xs text-black/50">
              <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{tender.entity}</span>
              <span className="font-semibold text-black">{tender.value}</span>
              <span>Closing: {tender.closing}</span>
              <StatusBadge status={tender.status} />
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            <button
              onClick={() => navigate("/workbench/bid-evaluation")}
              className="h-9 px-4 bg-[#0f172a] text-white text-xs font-semibold hover:bg-black/80 rounded-lg flex items-center gap-1.5"
            >
              <FolderOpen className="h-3.5 w-3.5" /> Open Workbench
            </button>
            <button className="h-9 px-3 border border-black/15 text-xs font-semibold hover:bg-gray-50 rounded-lg flex items-center gap-1.5">
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
          </div>
        </div>
      </div>

      {/* 3 Tab bar */}
      <div className="flex border-b border-black/10 mb-5 bg-white rounded-t-xl overflow-hidden">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex-1 justify-center
              ${tab === t.id
                ? "border-[#0f172a] text-[#0f172a] bg-white"
                : "border-transparent text-black/45 hover:text-black hover:bg-gray-50"}`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Process Tower tab ── */}
      {tab === "process-tower" && (
        <div className="bg-white border border-black/8 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#0f172a]">Procurement Process Tower</h3>
            <p className="text-xs text-black/45 mt-0.5">Full 26-stage procurement lifecycle for this tender. Click any stage to open its full toolset.</p>
          </div>
          <LifecycleTower
            title={`Process Tower — ${tender.id}`}
            subtitle="Click any stage to open documents, workflow, compliance, AI tools and more."
            stages={TENDER_PREPARATION_STAGES}
            context={`${tender.id} — ${tender.title}`}
            badgeLabel={tender.status}
          />
        </div>
      )}

      {/* ── Bidders List tab ── */}
      {tab === "bidders-list" && (
        <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-black/8 flex items-center justify-between">
            <span className="text-sm font-semibold text-black">Bidders — {MOCK_BIDDERS.length} participants</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-50 text-[#0F172A] px-2 py-0.5 rounded font-semibold">
                {MOCK_BIDDERS.filter(b => b.complianceResult === "PASS").length} Compliant
              </span>
              <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded font-semibold">
                {MOCK_BIDDERS.filter(b => b.complianceResult === "FAIL").length} Disqualified
              </span>
            </div>
          </div>
          <div className="divide-y divide-black/5">
            {MOCK_BIDDERS.map(b => (
              <div key={b.id} className="px-4 py-4 flex items-center gap-4 hover:bg-[#f4f7fb] transition-colors">
                <div className={`h-10 w-10 rounded-xl grid place-items-center flex-shrink-0 font-bold text-sm text-white
                  ${b.complianceResult === "PASS" ? "bg-[#0F172A]" : b.complianceResult === "FAIL" ? "bg-red-500" : "bg-[#0F172A]"}`}>
                  {b.rank > 0 ? `#${b.rank}` : "—"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-mono text-[10px] text-black/35">{b.id}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="text-sm font-semibold text-black">{b.name}</div>
                  {b.finalScore > 0 && (
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-[11px] text-black/50">Technical: <strong className="text-black">{b.technicalScore}%</strong></span>
                      <span className="text-[11px] text-black/50">Financial: <strong className="text-black">{b.financialScore}%</strong></span>
                      <span className="text-[11px] font-bold text-[#0f172a]">Final: {b.finalScore}%</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onSelectBidder(b)}
                  className="h-8 px-4 bg-[#0f172a] text-white text-xs font-semibold hover:bg-black/80 rounded transition-colors flex items-center gap-1.5 flex-shrink-0"
                >
                  <Eye className="h-3.5 w-3.5" /> View Bidder
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bids Reports tab ── */}
      {tab === "bids-reports" && (
        <div className="bg-white border border-black/8 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#0f172a]">Bids Reports — {tender.id}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { l:"Total Bids",       v:String(tender.bids), c:"text-[#0F172A]"   },
              { l:"Compliant",        v:"3",                  c:"text-[#0F172A]"},
              { l:"Disqualified",     v:"1",                  c:"text-red-600"   },
              { l:"Pending Review",   v:"1",                  c:"text-[#0F172A]" },
            ].map(k => (
              <div key={k.l} className="bg-[#f8fafc] border border-black/8 rounded-xl p-4">
                <div className={`text-2xl font-bold ${k.c}`}>{k.v}</div>
                <div className="text-[11px] text-black/45">{k.l}</div>
              </div>
            ))}
          </div>
          {/* Rankings table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#0f172a] text-white">
                  {["Rank","Bidder","Ref","Compliance","Competency","Technical","Financial","Final Score","Result"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_BIDDERS.filter(b => b.rank > 0).sort((a,b) => a.rank - b.rank).map(b => (
                  <tr key={b.id} className={`border-b border-black/8 ${b.rank===1?"bg-slate-50":""}`}>
                    <td className="px-3 py-2">
                      <span className={`h-6 w-6 inline-flex items-center justify-center text-[10px] font-bold rounded-full ${b.rank===1?"bg-slate-400 text-white":"bg-gray-100 text-gray-600"}`}>{b.rank}</span>
                    </td>
                    <td className="px-3 py-2 font-semibold text-black whitespace-nowrap">{b.name}</td>
                    <td className="px-3 py-2 font-mono text-black/50">{b.id}</td>
                    <td className="px-3 py-2"><span className="text-[10px] font-bold text-[#0F172A]">PASS</span></td>
                    <td className="px-3 py-2 text-center font-mono">{b.competencyScore}%</td>
                    <td className="px-3 py-2 text-center font-mono">{b.technicalScore}%</td>
                    <td className="px-3 py-2 text-center font-mono">{b.financialScore}%</td>
                    <td className="px-3 py-2 text-center font-black text-[#0f172a]">{b.finalScore}%</td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${b.rank===1?"bg-slate-100 text-[#0F172A]":"bg-gray-100 text-gray-600"}`}>
                        {b.rank===1?"🏆 Recommended":"—"}
                      </span>
                    </td>
                  </tr>
                ))}
                {MOCK_BIDDERS.filter(b => b.rank === 0).map(b => (
                  <tr key={b.id} className="border-b border-black/8 bg-red-50/40">
                    <td className="px-3 py-2 text-center text-black/30">—</td>
                    <td className="px-3 py-2 text-black/60 whitespace-nowrap">{b.name}</td>
                    <td className="px-3 py-2 font-mono text-black/40">{b.id}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] font-bold ${b.complianceResult==="FAIL"?"text-red-600":"text-[#0F172A]"}`}>
                        {b.complianceResult==="FAIL"?"FAIL":"PENDING"}
                      </span>
                    </td>
                    <td colSpan={5} className="px-3 py-2 text-[10px] text-black/35 italic">
                      {b.complianceResult==="FAIL"?"Disqualified at compliance stage — not evaluated further":"Pending compliance review"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2">
            <button className="h-8 px-4 bg-[#0f172a] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export PDF Report
            </button>
            <button className="h-8 px-3 border border-black/15 text-xs font-semibold hover:bg-gray-50 rounded-lg flex items-center gap-1.5">
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Level 3: Bidder Evaluation — 4 Stages ───────────────────────────────────
function BidderEvalPanel({ bidder, tender }: { bidder: BidderItem; tender: TenderItem }) {
  const [stage, setStage] = useState<EvalStage>("compliance");
  const [compChecks, setCompChecks] = useState<Record<number, "pass"|"fail"|"na">>(
    Object.fromEntries(COMPLIANCE_ITEMS.filter(i=>i.type==="Standard").map(i=>[i.id,"pass"]))
  );
  const [techScores, setTechScores] = useState<Record<string, number>>(
    Object.fromEntries(TECH_CRITERIA.map(c=>[c.id, c.score]))
  );

  const STAGES: { id: EvalStage; label: string; icon: React.ElementType; subtitle: string }[] = [
    { id:"compliance",  label:"Compliance Stage",                  icon:Shield,       subtitle:"Administrative & mandatory compliance — Pass/Fail"      },
    { id:"competency",  label:"Competency Examination Assessment",  icon:BookOpen,     subtitle:"Director & technical team competency test scores"        },
    { id:"technical",   label:"Technical Specifications Assessment",icon:ClipboardList,subtitle:"Technical proposal scoring against published criteria"   },
    { id:"financial",   label:"Financial Assessment & Score",       icon:DollarSign,   subtitle:"Financial offer ranking, weighted score and final result" },
  ];

  const compliancePassed = COMPLIANCE_ITEMS.filter(i=>i.type==="Standard").every(i=>compChecks[i.id]==="pass");
  const techTotal = Object.values(techScores).reduce((a,b)=>a+b,0);
  const techMax   = TECH_CRITERIA.reduce((a,c)=>a+c.maxScore,0);
  const techPct   = techMax > 0 ? Math.round((techTotal/techMax)*100) : 0;

  return (
    <div className="p-5">
      {/* Bidder header */}
      <div className="bg-white border border-black/8 rounded-xl p-5 mb-5">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-12 w-12 rounded-xl bg-[#0f172a] grid place-items-center flex-shrink-0">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] text-black/35 mb-0.5">{bidder.id}</div>
            <div className="text-base font-bold text-[#0f172a]">{bidder.name}</div>
            <div className="text-xs text-black/45 mt-0.5">Bidder for: {tender.id} — {tender.title}</div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <StatusBadge status={bidder.status} />
            {bidder.rank > 0 && (
              <span className="text-[10px] font-bold text-[#0F172A]">Rank #{bidder.rank} · Final: {bidder.finalScore}%</span>
            )}
          </div>
        </div>
        {/* Score summary pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { l:"Compliance",   v:bidder.complianceResult, c:bidder.complianceResult==="PASS"?"text-[#0F172A]":bidder.complianceResult==="FAIL"?"text-red-600":"text-[#0F172A]" },
            { l:"Competency",   v:bidder.competencyScore>0?`${bidder.competencyScore}%`:"—", c:"text-[#0F172A]"  },
            { l:"Technical",    v:bidder.technicalScore>0?`${bidder.technicalScore}%`:"—",   c:"text-[#0F172A]"    },
            { l:"Financial",    v:bidder.financialScore>0?`${bidder.financialScore}%`:"—",   c:"text-[#0F172A]" },
          ].map(s => (
            <div key={s.l} className="bg-[#f8fafc] border border-black/8 rounded-xl p-3">
              <div className="text-[10px] text-black/40 font-medium mb-1">{s.l}</div>
              <div className={`text-lg font-bold ${s.c}`}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 4-Stage stepper */}
      <div className="flex items-stretch gap-0 mb-5 overflow-x-auto">
        {STAGES.map((s, i) => {
          const done = STAGES.indexOf(STAGES.find(x=>x.id===stage)!) > i;
          const active = s.id === stage;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => setStage(s.id)}
              className={`flex-1 min-w-[160px] flex flex-col items-center gap-2 px-4 py-3 border-b-2 transition-all text-center
                ${active
                  ? "border-[#0f172a] bg-white text-[#0f172a]"
                  : done
                  ? "border-slate-200 bg-slate-50/50 text-[#0F172A]"
                  : "border-transparent bg-gray-50 text-black/40 hover:text-black hover:bg-white"}`}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0
                ${active?"bg-[#0f172a] text-white":done?"bg-[#0F172A] text-white":"bg-gray-200 text-gray-500"}`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="text-xs font-semibold leading-tight">{s.label}</div>
            </button>
          );
        })}
      </div>

      {/* Stage subtitle */}
      <div className="mb-4 px-1">
        <h3 className="text-sm font-bold text-[#0f172a]">
          {STAGES.find(s=>s.id===stage)?.label}
        </h3>
        <p className="text-xs text-black/45 mt-0.5">
          {STAGES.find(s=>s.id===stage)?.subtitle}
        </p>
      </div>

      {/* ── Stage: Compliance ── */}
      {stage === "compliance" && (
        <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
          <div className={`px-4 py-3 border-b border-black/8 flex items-center justify-between ${compliancePassed?"bg-slate-50":"bg-red-50"}`}>
            <div className="flex items-center gap-2">
              {compliancePassed
                ? <CheckCircle2 className="h-4 w-4 text-[#0F172A]" />
                : <XCircle className="h-4 w-4 text-red-600" />}
              <span className={`text-sm font-bold ${compliancePassed?"text-[#0F172A]":"text-red-700"}`}>
                RESULT: {compliancePassed ? "PASS — Proceed to Technical Evaluation" : "FAIL — DISQUALIFIED"}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="h-7 px-3 bg-[#0f172a] text-white text-[10px] font-semibold rounded flex items-center gap-1">
                <Save className="h-3 w-3" /> Save
              </button>
              <button className="h-7 px-3 border border-black/15 text-[10px] hover:bg-gray-50 rounded flex items-center gap-1">
                <Download className="h-3 w-3" /> PDF
              </button>
            </div>
          </div>
          <div className="p-1">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-[10px] text-[#0F172A] flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              Standards are mandatory — FAIL on any standard = DISQUALIFIED. Optional items at admin discretion.
            </div>
            <table className="w-full text-xs">
              <thead className="bg-[#f8fafc] border-b border-black/8">
                <tr>
                  <th className="px-3 py-2 text-left w-8 font-semibold text-black/50">No.</th>
                  <th className="px-3 py-2 text-left w-20 font-semibold text-black/50">Type</th>
                  <th className="px-3 py-2 text-left font-semibold text-black/50">Compliance Metric</th>
                  <th className="px-3 py-2 text-center w-32 font-semibold text-black/50">Check</th>
                </tr>
              </thead>
              <tbody>
                {COMPLIANCE_ITEMS.map(item => (
                  <tr key={item.id} className={`border-b border-black/6 ${compChecks[item.id]==="fail"?"bg-red-50":compChecks[item.id]==="pass"?"bg-slate-50/40":""}`}>
                    <td className="px-3 py-2 font-mono text-black/40">{item.id}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.type==="Standard"?"bg-[#0f172a] text-white":"bg-slate-100 text-[#0F172A]"}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-black/80">{item.label}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        {(["pass","fail","na"] as const).map(v => (
                          <button
                            key={v}
                            onClick={() => setCompChecks(p => ({...p, [item.id]: v}))}
                            className={`h-6 w-12 text-[9px] font-bold border transition-colors rounded
                              ${compChecks[item.id]===v
                                ? v==="pass"?"bg-[#0F172A] text-white border-slate-200"
                                  :v==="fail"?"bg-red-600 text-white border-red-600"
                                  :"bg-gray-500 text-white border-gray-500"
                                :"bg-white text-black/40 border-black/20 hover:bg-gray-50"}`}
                          >
                            {v.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Stage: Competency Examination ── */}
      {stage === "competency" && (
        <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-black/8 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#0F172A]" />
              <span className="text-sm font-bold text-[#0F172A]">Competency Examination Assessment</span>
            </div>
            <span className="text-[10px] bg-slate-100 text-[#0F172A] px-2 py-0.5 rounded font-semibold">
              Score: {bidder.competencyScore}% — AUTO-POPULATED from Vendor Registration
            </span>
          </div>
          <div className="p-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 text-xs text-[#0F172A] flex items-start gap-2">
              <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5 text-slate-600" />
              <div>
                <strong>Track 1 (Directors)</strong> and <strong>Track 2 (Technical Team)</strong> competency scores
                are auto-populated from the bidder's Vendor Registration — Step 5 (Resource Profiling).
                These scores are verified in the Competency Assessment Workbench and cannot be changed here.
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {[
                { track:"Track 1 — Directors",       score:bidder.competencyScore,    color:"bg-[#0F172A]", label:"Director Competency Test" },
                { track:"Track 2 — Technical Team",   score:Math.round(bidder.competencyScore*0.97), color:"bg-[#0F172A]",   label:"Technical Team Test" },
              ].map(t => (
                <div key={t.track} className="border border-black/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-8 w-8 rounded-lg ${t.color} grid place-items-center flex-shrink-0`}>
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-black">{t.track}</div>
                      <div className="text-[10px] text-black/45">{t.label}</div>
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-black">{t.score}%</span>
                    <span className={`text-sm font-bold mb-1 ${t.score>=70?"text-[#0F172A]":"text-red-600"}`}>
                      {t.score>=70?"PASS":"FAIL"}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                    <div className={`h-full rounded-full ${t.score>=70?"bg-[#0F172A]":"bg-red-500"}`} style={{width:`${t.score}%`}} />
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Lock className="h-3 w-3 text-black/30" />
                    <span className="text-[10px] text-black/40">Auto-populated from vendor registration · Read-only</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Test questions summary */}
            <div className="border border-black/10 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-black/8 bg-[#f8fafc]">
                <span className="text-xs font-semibold text-black/60">Examination Summary</span>
              </div>
              {[
                { q:"Procurement regulations knowledge (PPDPA 2018)",       score:18, max:20 },
                { q:"Financial management and costing principles",           score:16, max:20 },
                { q:"Technical specification compliance methodology",        score:17, max:20 },
                { q:"Contract management and risk mitigation",               score:19, max:20 },
                { q:"Ethics and anti-corruption compliance",                 score:18, max:20 },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-black/5 last:border-0">
                  <span className="text-[10px] font-mono text-black/30 w-4">{i+1}</span>
                  <span className="flex-1 text-xs text-black">{row.q}</span>
                  <span className="text-xs font-bold text-black whitespace-nowrap">{row.score}/{row.max}</span>
                </div>
              ))}
              <div className="px-4 py-2.5 bg-[#0f172a] text-white flex items-center justify-between">
                <span className="text-xs font-bold">TOTAL COMPETENCY SCORE</span>
                <span className="text-sm font-black text-slate-500">{bidder.competencyScore}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stage: Technical Specifications ── */}
      {stage === "technical" && (
        <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-black/8 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[#0F172A]" />
              <span className="text-sm font-bold text-[#0F172A]">Technical Specifications Assessment</span>
            </div>
            <div className={`flex items-center gap-2 text-sm font-bold ${techPct>=70?"text-[#0F172A]":"text-red-600"}`}>
              <span>{techTotal}/{techMax} marks · {techPct}%</span>
              <span className={`text-xs px-2 py-0.5 rounded font-bold ${techPct>=70?"bg-slate-100 text-[#0F172A]":"bg-red-100 text-red-700"}`}>
                {techPct>=70?"PASS":"FAIL"}
              </span>
            </div>
          </div>
          {/* Score progress bar */}
          <div className="px-4 pt-3 pb-1">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${techPct>=70?"bg-[#0F172A]":"bg-red-500"}`} style={{width:`${techPct}%`}} />
            </div>
            <div className="text-[9px] text-black/40 mt-1">Pass threshold: 70%</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#f8fafc] border-b border-black/8">
                <tr>
                  <th className="px-3 py-2 text-left w-8 font-semibold text-black/50">No.</th>
                  <th className="px-3 py-2 text-left font-semibold text-black/50">Technical Criterion</th>
                  <th className="px-3 py-2 text-center w-20 font-semibold text-black/50">Max</th>
                  <th className="px-3 py-2 text-center w-28 font-semibold text-black/50">Score</th>
                  <th className="px-3 py-2 text-center w-16 font-semibold text-black/50">%</th>
                </tr>
              </thead>
              <tbody>
                {TECH_CRITERIA.map((c, i) => {
                  const pct = c.maxScore > 0 ? Math.round((techScores[c.id]/c.maxScore)*100) : 0;
                  return (
                    <tr key={c.id} className={`border-b border-black/6 ${pct>=80?"bg-slate-50/30":pct<50?"bg-red-50/30":""}`}>
                      <td className="px-3 py-2 font-mono text-black/40">{c.id}</td>
                      <td className="px-3 py-2 text-black">{c.label}</td>
                      <td className="px-3 py-2 text-center font-mono text-black/60">{c.maxScore}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number" min={0} max={c.maxScore}
                            value={techScores[c.id] ?? 0}
                            onChange={e => setTechScores(p => ({...p, [c.id]: Math.min(c.maxScore, Math.max(0, Number(e.target.value)))}))}
                            className={`w-14 h-7 text-center text-xs font-bold border focus:outline-none rounded
                              ${pct>=80?"border-slate-200 bg-slate-50 text-[#0F172A]":pct>=50?"border-slate-200 bg-slate-50 text-[#0F172A]":"border-red-300 bg-red-50 text-red-700"}`}
                          />
                          <span className="text-[10px] text-black/40">/{c.maxScore}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`text-[10px] font-bold ${pct>=70?"text-[#0F172A]":"text-red-500"}`}>{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-[#0f172a] text-white font-bold">
                  <td colSpan={2} className="px-3 py-2 text-xs">TOTAL TECHNICAL SCORE</td>
                  <td className="px-3 py-2 text-center text-xs">{techMax}</td>
                  <td className="px-3 py-2 text-center text-xs">{techTotal}</td>
                  <td className={`px-3 py-2 text-center text-xs font-black ${techPct>=70?"text-slate-500":"text-red-400"}`}>{techPct}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 flex gap-2">
            <button className="h-8 px-4 bg-[#0f172a] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5">
              <Save className="h-3.5 w-3.5" /> Save Scores
            </button>
            <button className="h-8 px-3 border border-black/15 text-xs hover:bg-gray-50 rounded-lg flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export PDF
            </button>
          </div>
        </div>
      )}

      {/* ── Stage: Financial Assessment & Score ── */}
      {stage === "financial" && (
        <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-black/8 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#0F172A]" />
              <span className="text-sm font-bold text-[#0F172A]">Financial Assessment &amp; Score</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-black/40" />
              <span className="text-[10px] text-black/45">System-generated · Auto-ranked by lowest bid</span>
            </div>
          </div>

          <div className="p-4 space-y-5">
            {/* Formula banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-[#0F172A]">
              <strong>Formula:</strong> Financial Score = (Lowest Bid ÷ This Bidder's Bid) × 100%.
              The lowest responsive bid receives 100%. All others are scored proportionally.
              Financial vault opens automatically on bid opening date.
            </div>

            {/* All-bidder financial ranking table */}
            <div>
              <div className="text-xs font-bold text-black/60 uppercase tracking-wider mb-2">All Bidders — Financial Ranking</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0f172a] text-white">
                      {["Rank","Bidder","Ref","Offer (USD)","Score","Comment"].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { rank:1, name:"Zimbabwe Pharma Holdings", ref:"VEN-00481", offer:38_400_000, score:100   },
                      { rank:2, name:"National Distributors Ltd",ref:"VEN-00495", offer:39_800_000, score:96.5  },
                      { rank:3, name:"Bulawayo Supplies Co.",    ref:"VEN-00502", offer:41_200_000, score:93.2  },
                    ].map(r => {
                      const isActive = r.ref === bidder.id;
                      return (
                        <tr key={r.ref} className={`border-b border-black/8 ${r.rank===1?"bg-slate-50":""} ${isActive?"ring-2 ring-inset ring-blue-400":""}`}>
                          <td className="px-3 py-2">
                            <span className={`h-6 w-6 inline-flex items-center justify-center text-[10px] font-bold rounded-full ${r.rank===1?"bg-slate-400 text-white":"bg-gray-100 text-gray-600"}`}>
                              {r.rank}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-semibold text-black whitespace-nowrap">
                            {r.name}
                            {isActive && <span className="ml-2 text-[9px] bg-slate-100 text-[#0F172A] px-1.5 py-0.5 rounded font-bold">CURRENT</span>}
                          </td>
                          <td className="px-3 py-2 font-mono text-black/50">{r.ref}</td>
                          <td className="px-3 py-2 font-mono text-black whitespace-nowrap">USD {r.offer.toLocaleString()}</td>
                          <td className={`px-3 py-2 font-black font-mono ${r.rank===1?"text-[#0F172A]":"text-[#0F172A]"}`}>{r.score}%</td>
                          <td className="px-3 py-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${r.rank===1?"bg-slate-100 text-[#0F172A]":"bg-gray-100 text-gray-600"}`}>
                              {r.rank===1?"LOWEST":"OTHERS"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* This bidder's weighted final score */}
            <div>
              <div className="text-xs font-bold text-black/60 uppercase tracking-wider mb-2">
                Weighted Final Score — {bidder.name}
              </div>
              <div className="border border-black/10 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-[#f8fafc] border-b border-black/8">
                    <tr>
                      {["Component","Bidder Score","Weight","Weighted Score"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-semibold text-black/50">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-black/6">
                      <td className="px-4 py-3 font-semibold text-black">Technical Score</td>
                      <td className="px-4 py-3 font-mono text-black">{bidder.technicalScore}%</td>
                      <td className="px-4 py-3 text-black/60">70%</td>
                      <td className="px-4 py-3 font-bold text-black">{(bidder.technicalScore * 0.70).toFixed(1)}%</td>
                    </tr>
                    <tr className="border-b border-black/6">
                      <td className="px-4 py-3 font-semibold text-black">Financial Score</td>
                      <td className="px-4 py-3 font-mono text-black">{bidder.financialScore}%</td>
                      <td className="px-4 py-3 text-black/60">30%</td>
                      <td className="px-4 py-3 font-bold text-black">{(bidder.financialScore * 0.30).toFixed(1)}%</td>
                    </tr>
                    <tr className="bg-[#0f172a] text-white font-bold">
                      <td colSpan={3} className="px-4 py-3 text-sm">TOTAL FINAL SCORE</td>
                      <td className="px-4 py-3 text-xl font-black text-slate-500">{bidder.finalScore}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Result verdict */}
            <div className={`flex items-center gap-4 p-4 rounded-xl border-2 ${bidder.rank===1?"border-slate-200 bg-slate-50":"border-slate-200 bg-slate-50"}`}>
              {bidder.rank===1
                ? <Award className="h-8 w-8 text-slate-600 flex-shrink-0" />
                : <CheckCircle2 className="h-8 w-8 text-slate-600 flex-shrink-0" />}
              <div>
                <div className={`text-base font-black ${bidder.rank===1?"text-[#0F172A]":"text-[#0F172A]"}`}>
                  {bidder.rank===1?"🏆 RECOMMENDED WINNER":"EVALUATED — Not Top Ranked"}
                </div>
                <div className="text-xs text-black/55 mt-0.5">
                  Final weighted score: <strong>{bidder.finalScore}%</strong> · Rank #{bidder.rank} of {MOCK_BIDDERS.filter(b=>b.rank>0).length} compliant bidders
                </div>
              </div>
            </div>

            {/* Audit lock note */}
            <div className="flex items-start gap-2 bg-gray-50 border border-black/8 rounded-lg p-3 text-[10px] text-black/50">
              <Lock className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              System-generated and blockchain-secured. No manual edits permitted after submission.
              All scores, timestamps and evaluator actions form part of the permanent audit trail.
            </div>

            <div className="flex gap-2">
              <button className="h-9 px-5 bg-[#0F172A] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-[#0F172A]">
                <Award className="h-3.5 w-3.5" /> Generate Result Slip
              </button>
              <button className="h-9 px-4 bg-[#0f172a] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-black/80">
                <Download className="h-3.5 w-3.5" /> Export PDF
              </button>
              <button className="h-9 px-4 border border-black/15 text-xs font-semibold hover:bg-gray-50 rounded-lg flex items-center gap-1.5">
                <Printer className="h-3.5 w-3.5" /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EProcurementHomePage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();

  // Vendor roles go straight to their own portal
  const VENDOR_ROLES = new Set(["supplier","sme_supplier","vendor_user","public"]);
  useEffect(() => {
    if (user?.role && VENDOR_ROLES.has(user.role)) {
      navigate("/vendor-workbench", { replace: true });
    }
  }, [user, navigate]);
  if (user?.role && VENDOR_ROLES.has(user.role)) return null;

  // ── Navigation state ────────────────────────────────────────────────────────
  // level: 0=tiles | 1=sub-tiles | 1r=reports | 2=listing | 3=tender-detail | 4=bidder-eval
  type Level = "tiles" | "subtiles" | "reports" | "listing" | "tender" | "bidder";
  const [level,          setLevel]          = useState<Level>("tiles");
  const [activeTileId,   setActiveTileId]   = useState<string>("");
  const [selectedTender, setSelectedTender] = useState<TenderItem | null>(null);
  const [selectedBidder, setSelectedBidder] = useState<BidderItem | null>(null);

  const activeTile  = PROC_TILES.find(t => t.id === activeTileId);
  const activeLabel = activeTile?.label ?? "";

  // ── Breadcrumb builder ──────────────────────────────────────────────────────
  const crumbs = () => {
    const base = [{ label:"E-Procurement", onClick: level!=="tiles" ? () => { setLevel("tiles"); setActiveTileId(""); setSelectedTender(null); setSelectedBidder(null); } : undefined }];
    if (level === "subtiles" || level === "reports" || level === "listing" || level === "tender" || level === "bidder") {
      base.push({ label: activeLabel, onClick: level!=="subtiles" ? () => { setLevel("subtiles"); setSelectedTender(null); setSelectedBidder(null); } : undefined });
    }
    if (level === "reports") {
      base.push({ label:"Tender Reports", onClick: undefined });
    }
    if (level === "listing" || level === "tender" || level === "bidder") {
      base.push({ label:`${activeLabel} Listing`, onClick: level!=="listing" ? () => { setLevel("listing"); setSelectedTender(null); setSelectedBidder(null); } : undefined });
    }
    if ((level === "tender" || level === "bidder") && selectedTender) {
      base.push({ label: selectedTender.id, onClick: level==="bidder" ? () => { setLevel("tender"); setSelectedBidder(null); } : undefined });
    }
    if (level === "bidder" && selectedBidder) {
      base.push({ label: selectedBidder.name, onClick: undefined });
    }
    return base;
  };

  return (
    <AppShell>
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="E-Procurement"
        process={
          level === "bidder"  && selectedBidder ? `Bidder Evaluation — ${selectedBidder.name}` :
          level === "tender"  && selectedTender ? `Tender — ${selectedTender.id}` :
          level === "listing"                   ? `${activeLabel} Listing` :
          level === "reports"                   ? `Tender Reports` :
          level === "subtiles"                  ? activeLabel :
          "Procurement Home"
        }
        financialYear="FY2026"
        pageType="workbench"
      />

      <div className="h-full flex flex-col overflow-hidden">
        {/* Top header */}
        <div className="bg-[#0f172a] text-white px-5 py-3 flex items-center gap-3 flex-shrink-0 border-b border-slate-200/50">
          <Sparkles className="h-5 w-5 text-slate-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold">E-Procurement Module</div>
            <div className="text-xs text-white/50">AI-Powered Electronic Government Procurement &amp; Automated Oversight Intelligence System</div>
          </div>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb crumbs={crumbs()} />

        {/* Main scrollable area */}
        <div className="flex-1 overflow-y-auto bg-[#f4f7fb]">

          {/* ── Level 0: Procurement tiles ── */}
          {level === "tiles" && (
            <ProcTiles onSelect={id => { setActiveTileId(id); setLevel("subtiles"); }} />
          )}

          {/* ── Level 1: Sub-tiles (Listing + Reports) ── */}
          {level === "subtiles" && activeTile && (
            <TypeSubTiles
              typeId={activeTileId}
              typeLabel={activeLabel}
              onSelectListing={() => setLevel("listing")}
              onSelectReports={() => setLevel("reports")}
            />
          )}

          {/* ── Level 1b: Tender Reports ── */}
          {level === "reports" && (
            <TenderReportsPanel typeLabel={activeLabel} />
          )}

          {/* ── Level 2: Tenders Listing ── */}
          {level === "listing" && (
            <TendersListing
              typeId={activeTileId}
              typeLabel={activeLabel}
              onSelectTender={t => { setSelectedTender(t); setLevel("tender"); }}
            />
          )}

          {/* ── Level 3: Specific Tender detail ── */}
          {level === "tender" && selectedTender && (
            <TenderDetailPanel
              tender={selectedTender}
              typeLabel={activeLabel}
              onSelectBidder={b => { setSelectedBidder(b); setLevel("bidder"); }}
            />
          )}

          {/* ── Level 4: Bidder evaluation ── */}
          {level === "bidder" && selectedBidder && selectedTender && (
            <BidderEvalPanel
              bidder={selectedBidder}
              tender={selectedTender}
            />
          )}

        </div>
      </div>
    </AppShell>
  );
}
