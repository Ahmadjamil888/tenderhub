/**
 * TenderModulePage — Sub-tiles for each procurement type
 * Routes: /tenders/module/:moduleType
 * Shows 7 sub-tiles: Open Bids Vault, Bid Opening Vault, Tender List,
 * Create Tender, Evaluate Tenders, Investigation Cases, Reports & Intelligence
 */
import { useParams, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import {
  Lock, FileText, PlusCircle, Scale, AlertTriangle, BarChart3,
  ChevronRight, ShoppingCart, Users, Gavel,
  ShieldAlert, ArrowLeft, KeyRound,
} from "lucide-react";

const MODULE_META: Record<string, { label: string; desc: string; color: string; textColor: string }> = {
  tenders:    { label: "Tenders",        desc: "Open / restricted / direct appointment", color: "bg-[#2C3E50]", textColor: "text-white" },
  rfq:        { label: "RFQ",            desc: "Request for Quotation — supplies",       color: "bg-[#16A34A]", textColor: "text-white" },
  rfp:        { label: "RFP",            desc: "Request for Proposal — consulting",      color: "bg-[#7C3AED]", textColor: "text-white" },
  eoi:        { label: "EOI",            desc: "Expression of Interest — shortlisting",  color: "bg-[#EA580C]", textColor: "text-white" },
  unsolicited:{ label: "Unsolicited Bids",desc:"Unsolicited proposals",                  color: "bg-[#475569]", textColor: "text-white" },
  auctions:   { label: "Auctions",       desc: "Public auctions — asset disposal",      color: "bg-[#DC2626]", textColor: "text-white" },
};

const SUB_TILES = [
  { id: "open-bids",    label: "Open Bids Vault",       icon: Lock,          count: 12,   desc: "Open closed bids with 4-officer vault auth",              color: "bg-[#1e3a5f]" },
  { id: "bid-opening",  label: "Bid Opening Vault",     icon: KeyRound,      count: 3,    desc: "Live countdown 2FA opening — concurrent 4 officers",      color: "bg-[#7C2D2D]" },
  { id: "investigations",label:"Investigation Cases",   icon: AlertTriangle, count: 21,   desc: "View and manage tender investigations",                    color: "bg-[#EA580C]" },
  { id: "tender-list",  label: "Tender List",           icon: FileText,      count: 94,   desc: "Browse all tenders — filter by stage, category, ministry", color: "bg-[#16A34A]" },
  { id: "create",       label: "Create Tender",         icon: PlusCircle,    count: null, desc: "Start a new tender creation workflow with AI guidance",    color: "bg-[#475569]" },
  { id: "reports",      label: "Reports & Intelligence",icon: BarChart3,     count: 9,    desc: "Analytics, alerts, flagging and export reports",          color: "bg-[#DC2626]" },
  { id: "evaluate",     label: "Evaluate Tenders",      icon: Scale,         count: 38,   desc: "Access evaluation forms, process tower and scoring",       color: "bg-[#7C3AED]" },
];

export default function TenderModulePage() {
  const { moduleType = "tenders" } = useParams<{ moduleType: string }>();
  const navigate = useNavigate();
  const meta = MODULE_META[moduleType] ?? MODULE_META["tenders"];

  const getRoute = (subId: string) => {
    const base = `/tenders/module/${moduleType}`;
    switch (subId) {
      case "open-bids":      return `${base}/open-bids`;
      case "bid-opening":    return `${base}/bid-opening`;
      case "tender-list":    return `${base}/tender-list`;
      case "create":         return `${base}/create`;
      case "evaluate":       return `${base}/evaluate`;
      case "investigations": return `${base}/investigations`;
      case "reports":        return `${base}/reports`;
      default:               return base;
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Gov header */}
        <div className="bg-[#0F172A] text-white py-3 px-6 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              GOVERNMENT OF THE REPUBLIC OF ZIMBABWE — ZEPS
            </div>
            <div className="text-sm font-bold text-white mt-0.5">E-Procurement Platform — {meta.label}</div>
          </div>
          <button onClick={() => navigate("/tenders-hub")}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white border border-white/20 rounded-lg px-3 py-1.5 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Tender Hub
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-200 px-6 py-2 text-xs text-slate-500 flex items-center gap-1.5">
          <button onClick={() => navigate("/tenders-hub")} className="hover:text-slate-800 transition-colors">E-Procurement</button>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-slate-800">{meta.label}</span>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Module header */}
          <div className={`${meta.color} text-white rounded-2xl p-6 mb-8 flex items-center justify-between`}>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{meta.desc}</div>
              <h1 className="text-3xl font-black">{meta.label}</h1>
              <p className="text-sm opacity-75 mt-1">Select a sub-module below to proceed</p>
            </div>
            <div className="text-8xl font-black opacity-10">{meta.label.charAt(0)}</div>
          </div>

          {/* 7 sub-tiles — 4-col grid on large screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SUB_TILES.map(tile => {
              const Icon = tile.icon;
              return (
                <button key={tile.id} onClick={() => navigate(getRoute(tile.id))}
                  className="group text-left bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-xl hover:border-gray-300 transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`${tile.color} h-11 w-11 rounded-xl flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    {tile.count !== null && (
                      <span className="text-3xl font-black text-gray-200 group-hover:text-gray-300 transition-colors">
                        {tile.count}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">{tile.label}</h3>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">{tile.desc}</p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-gray-700 transition-colors">
                    Open <ChevronRight className="h-3 w-3" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
