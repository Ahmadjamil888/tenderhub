/**
 * Annual Procurement Plan — copy of final approved Budget Module, renamed.
 * Tabs: Operations · Works · Services · Supplies · Variance
 * Filters: Ministry / Department / Unit / Financial Year
 */
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import BudgetIntelligenceCentre from "@/components/BudgetIntelligenceCentre";
import { Download, Printer, Share2, CheckCircle2, Clock, AlertTriangle, Layers } from "lucide-react";

const STATUS_ITEMS = [
  { label: "Total Planned Items", value: "247",      icon: Layers,        color: "border-slate-200 bg-slate-50 text-[#0f172a]" },
  { label: "Approved Budget",     value: "USD 4.8M", icon: CheckCircle2,  color: "border-slate-200 bg-slate-50 text-[#0f172a]" },
  { label: "HOD Approval",        value: "Pending",  icon: Clock,         color: "border-amber-200 bg-amber-50 text-amber-700"  },
  { label: "Compliance Status",   value: "Draft",    icon: AlertTriangle, color: "border-slate-200 bg-slate-50 text-[#0f172a]" },
];

export default function AnnualProcurementPlanPage() {
  return (
    <AppShell>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-[#0f172a] text-white px-6 py-3 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              GOVERNMENT OF THE REPUBLIC OF ZIMBABWE
            </div>
            <div className="text-base font-black uppercase tracking-wide mt-0.5">
              Annual Procurement Plan — FY2026/2027
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Derived from Approved Budget · Zimbabwe Public Procurement and Disposal of Public Assets Act
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs hover:bg-white/10">
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs hover:bg-white/10">
              <Download className="h-3.5 w-3.5" /> Export PDF
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-white text-xs hover:bg-white/10">
              <Share2 className="h-3.5 w-3.5" /> Share
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-3 bg-gray-50 border-b border-gray-200 shrink-0">
          {STATUS_ITEMS.map(k => (
            <div key={k.label} className={`flex items-center gap-3 border rounded-xl px-4 py-2.5 ${k.color}`}>
              <k.icon className="h-5 w-5 opacity-70 shrink-0" />
              <div>
                <div className="text-lg font-black">{k.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wide opacity-60">{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Reuse full BudgetIntelligenceCentre — same tabs, data, filters */}
        <div className="flex-1 overflow-hidden">
          <BudgetIntelligenceCentre />
        </div>
      </div>
    </AppShell>
  );
}
