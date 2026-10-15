import { useState } from "react";
import {
  FileText, ShoppingCart, ShieldAlert, RefreshCcw, Users, Gavel,
  Lock, AlertTriangle, ListChecks, FilePlus, BarChart3, Scale,
  ChevronRight, ArrowLeft, KeyRound
} from "lucide-react";
import { Link } from "react-router-dom";

// ─── Per-type data — every procurement type has its OWN counts ───────────────
// These numbers are separate for each module. Tenders has 187 tenders but only
// 12 open bids. RFQ has 94 but only 8 open bids. etc.
const MODULE_DATA: Record<string, {
  totalCount:        number;   // shown on main tile
  openBidsCount:     number;   // Open Bids Vault
  investigationCount:number;   // Investigation Cases
  tenderListCount:   number;   // Tender List (same as total usually)
  evaluationCount:   number;   // Evaluate Tenders
  reportsCount:      number;   // Reports & Intelligence
}> = {
  tenders: {
    totalCount:         187,
    openBidsCount:       12,
    investigationCount:   5,
    tenderListCount:    187,
    evaluationCount:     38,
    reportsCount:        24,
  },
  rfq: {
    totalCount:          94,
    openBidsCount:        8,
    investigationCount:   2,
    tenderListCount:     94,
    evaluationCount:     14,
    reportsCount:        11,
  },
  unsolicited: {
    totalCount:          12,
    openBidsCount:        3,
    investigationCount:   1,
    tenderListCount:     12,
    evaluationCount:      4,
    reportsCount:         6,
  },
  rfp: {
    totalCount:          38,
    openBidsCount:        6,
    investigationCount:   1,
    tenderListCount:     38,
    evaluationCount:      9,
    reportsCount:         8,
  },
  eoi: {
    totalCount:          21,
    openBidsCount:        4,
    investigationCount:   0,
    tenderListCount:     21,
    evaluationCount:      7,
    reportsCount:         5,
  },
  auctions: {
    totalCount:           9,
    openBidsCount:        2,
    investigationCount:   0,
    tenderListCount:      9,
    evaluationCount:      3,
    reportsCount:         4,
  },
};

// ─── Main tile definitions ────────────────────────────────────────────────────
const MAIN_TILES = [
  { id:"tenders",    title:"Tenders",         subtitle:"Open / restricted / direct appointment",   icon:FileText,    bgColor:"bg-[#2C3E50]" },
  { id:"rfq",        title:"RFQ",             subtitle:"Request for Quotation — supplies",          icon:ShoppingCart,bgColor:"bg-[#16A34A]" },
  { id:"unsolicited",title:"Unsolicited Bids",subtitle:"Unsolicited proposals",                     icon:ShieldAlert, bgColor:"bg-[#475569]" },
  { id:"rfp",        title:"RFP",             subtitle:"Request for Proposal — consulting/services",icon:RefreshCcw,  bgColor:"bg-[#7C3AED]" },
  { id:"eoi",        title:"EOI",             subtitle:"Expression of Interest — shortlisting",     icon:Users,       bgColor:"bg-[#EA580C]" },
  { id:"auctions",   title:"Auctions",        subtitle:"Public auctions — asset disposal",          icon:Gavel,       bgColor:"bg-[#DC2626]" },
];

// ─── Build sub-tiles using THIS TYPE's own data ───────────────────────────────
function buildSubTiles(moduleId: string) {
  const data = MODULE_DATA[moduleId] ?? MODULE_DATA["tenders"];
  const base = `/tenders/module/${moduleId}`;

  return [
    {
      title:   "Open Bids Vault",
      desc:    "Open closed bids with 4-officer vault authentication",
      count:   data.openBidsCount,
      icon:    Lock,
      bgColor: "bg-[#1e3a5f]",
      route:   `${base}/open-bids`,
    },
    {
      title:   "Bid Opening Vault",
      desc:    "Live countdown — 4-officer concurrent 2FA opening when timer hits zero",
      count:   data.openBidsCount,
      icon:    KeyRound,
      bgColor: "bg-[#7C2D2D]",
      route:   `${base}/bid-opening`,
    },
    {
      title:   "Investigation Cases",
      desc:    "View and manage procurement misconduct investigations",
      count:   data.investigationCount,
      icon:    AlertTriangle,
      bgColor: "bg-[#EA580C]",
      route:   `${base}/investigations`,
    },
    {
      title:   "Tender List",
      desc:    "Browse all records — filter by stage, category, ministry",
      count:   data.tenderListCount,
      icon:    ListChecks,
      bgColor: "bg-[#16A34A]",
      route:   `${base}/tender-list`,
    },
    {
      title:   "Create Tender",
      desc:    "Start a new tender creation workflow with AI guidance",
      count:   null as number | null,
      icon:    FilePlus,
      bgColor: "bg-[#475569]",
      route:   `${base}/create`,
    },
    {
      title:   "Reports and Intelligence",
      desc:    "Analytics, alerts, flagging, spend reports and exports",
      count:   data.reportsCount,
      icon:    BarChart3,
      bgColor: "bg-[#DC2626]",
      route:   `${base}/reports`,
    },
    {
      title:   "Evaluate Tenders",
      desc:    "Access evaluation forms, process tower and scoring sheets",
      count:   data.evaluationCount,
      icon:    Scale,
      bgColor: "bg-[#7C3AED]",
      route:   `${base}/evaluate`,
    },
  ];
}

// ─── Sub-tile card component ──────────────────────────────────────────────────
function SubTileCard({
  title, desc, count, icon: Icon, bgColor, route,
}: ReturnType<typeof buildSubTiles>[number]) {
  return (
    <Link
      to={route}
      className={`${bgColor} text-white rounded-xl p-6 relative overflow-hidden
        transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group block`}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center
            group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6 text-white" />
          </div>
          {count !== null && count !== undefined && (
            <span className="text-3xl font-black opacity-25 group-hover:opacity-40 transition-opacity">
              {count}
            </span>
          )}
        </div>
        <h3 className="text-base font-bold mb-1">{title}</h3>
        <p className="text-xs opacity-70 leading-relaxed mb-4">{desc}</p>
        <div className="flex items-center gap-1 text-xs opacity-60 group-hover:opacity-100 transition-opacity">
          <span>View</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
      {/* Background icon decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.06]">
        <Icon className="w-28 h-28" />
      </div>
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TenderTilesHome() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const activeTile = MAIN_TILES.find(t => t.id === activeModule);

  return (
    <div className="min-h-screen bg-[#F0F4F8]">

      {/* Government Header */}
      <div className="bg-[#0F172A] text-white py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold tracking-widest uppercase">
              Government of the Republic of Zimbabwe
            </h1>
            <p className="text-xs opacity-60 mt-0.5">
              Integrated E-Procurement Platform · FY 2025/26
            </p>
          </div>
          <div className="text-xs opacity-50 font-mono">PPRA · PRAZ · ZIMRA Integrated</div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-black/8 px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-xs text-black/50">
          <button
            onClick={() => setActiveModule(null)}
            className={activeModule ? "hover:text-black transition-colors" : ""}
          >
            E-Procurement
          </button>
          {activeModule && activeTile && (
            <>
              <ChevronRight className="w-3 h-3 opacity-40" />
              <span className="font-semibold text-black">{activeTile.title}</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        {!activeModule ? (
          /* ── LEVEL 1: Six main procurement type tiles ── */
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#0F172A] tracking-wide uppercase mb-1">
                E-Procurement — Tender Management
              </h2>
              <p className="text-sm text-black/50">
                Click a procurement type to view its sub-modules.
                Each type has its own independent listings, vault, evaluations and investigations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MAIN_TILES.map(tile => {
                const Icon = tile.icon;
                const data = MODULE_DATA[tile.id];
                return (
                  <button
                    key={tile.id}
                    onClick={() => setActiveModule(tile.id)}
                    className={`${tile.bgColor} text-white rounded-2xl p-6 relative overflow-hidden
                      transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group text-left w-full`}
                  >
                    <div className="relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center
                        mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-2xl font-bold mb-1">{tile.title}</h3>
                      <p className="text-sm opacity-80 mb-4">{tile.subtitle}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs opacity-70 group-hover:opacity-100 flex items-center gap-1">
                          View listings <ChevronRight className="w-3 h-3" />
                        </span>
                        <span className="text-4xl font-black opacity-20 group-hover:opacity-30">
                          {data.totalCount}
                        </span>
                      </div>
                    </div>
                    <div className="absolute -right-6 -bottom-6 opacity-10">
                      <Icon className="w-32 h-32" />
                    </div>
                  </button>
                );
              })}
            </div>
          </>

        ) : (
          /* ── LEVEL 2: Six sub-tiles for the selected type ── */
          <>
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={() => setActiveModule(null)}
                className="flex items-center gap-2 text-sm text-black/50
                  hover:text-black transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {/* Active type banner */}
              <div className={`${activeTile!.bgColor} text-white rounded-xl px-5 py-3
                flex items-center gap-3 flex-1`}>
                {(() => {
                  const Icon = activeTile!.icon;
                  return <Icon className="w-5 h-5 opacity-80 shrink-0" />;
                })()}
                <div>
                  <div className="font-bold text-base">{activeTile!.title}</div>
                  <div className="text-xs opacity-70">{activeTile!.subtitle}</div>
                </div>
                <div className="ml-auto text-3xl font-black opacity-20">
                  {MODULE_DATA[activeModule].totalCount}
                </div>
              </div>
            </div>

            <div className="mb-5">
              <h2 className="text-xl font-bold text-[#0F172A] uppercase tracking-wide mb-1">
                {activeTile!.title} — Sub-Modules
              </h2>
              <p className="text-sm text-black/50">
                Each sub-module shows data specific to <strong>{activeTile!.title}</strong> only.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {buildSubTiles(activeModule).map(sub => (
                <SubTileCard key={sub.title} {...sub} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
