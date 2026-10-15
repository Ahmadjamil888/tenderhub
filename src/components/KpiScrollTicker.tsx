/**
 * KpiScrollTicker — vertical auto-scrolling KPI indicator strip.
 * Content slides upward continuously. Pauses when user hovers.
 * Used across: BriefingPage, BI Dashboard, Analytics, Executive Dashboard.
 */

import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

export type TickerItem = {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  urgent?: boolean;
  category?: string;
};

// ── Full master list of Zimbabwe procurement KPIs ─────────────────────────
export const MASTER_KPI_TICKERS: TickerItem[] = [
  // Spending
  { label: "National Spend YTD",          value: "USD 2.84B",   delta: "+6.2% YoY",    up: true,  category: "Spend"    },
  { label: "Monthly Spend (Jun)",          value: "USD 290M",    delta: "+2.5% vs May", up: true,  category: "Spend"    },
  { label: "Budget Utilisation",           value: "67.8%",       delta: "On Track",     up: true,  category: "Budget"   },
  { label: "Budget Overruns (Active)",     value: "USD 498M",    delta: "3 ministries", up: false, urgent: true, category: "Budget" },
  { label: "Procurement Savings",          value: "USD 184M",    delta: "+11.4%",       up: true,  category: "Savings"  },
  // Revenue
  { label: "ZIMRA Revenue Collected",      value: "USD 18.2B",   delta: "+3.1% YTD",    up: true,  category: "Revenue"  },
  { label: "Revenue Shortfall (Jun)",      value: "USD 19M",     delta: "vs target",    up: false, urgent: true, category: "Revenue" },
  { label: "Mining Royalties",             value: "USD 420M",    delta: "+8.4%",        up: true,  category: "Revenue"  },
  // Economy
  { label: "Inflation Rate",               value: "34.8%",       delta: "+5.6pts YoY",  up: false, urgent: true, category: "Economy" },
  { label: "GDP Growth (est.)",            value: "3.2%",        delta: "Below 5% target", up: false, category: "Economy" },
  { label: "Foreign Reserves",             value: "1.8 months",  delta: "🔴 Crisis level", up: false, urgent: true, category: "Economy" },
  { label: "Public Debt / GDP",            value: "82.6%",       delta: "Breached 70%", up: false, urgent: true, category: "Economy" },
  { label: "USD/ZiG Exchange",             value: "13.42",       delta: "Parallel: 18.4", up: false, category: "Economy" },
  { label: "Unemployment Rate",            value: "19.4%",       delta: "-1.7pts",      up: true,  category: "Economy"  },
  // Projects
  { label: "Active Infrastructure Projects", value: "1,487",     delta: "+22 this qtr", up: true,  category: "Projects" },
  { label: "Projects On Time & Budget",    value: "284 (19%)",   delta: "🔴 81% delayed", up: false, urgent: true, category: "Projects" },
  { label: "Abandoned/Stalled Projects",   value: "147",         delta: "USD 418M stuck", up: false, urgent: true, category: "Projects" },
  { label: "Avg Cost Overrun",             value: "43%",         delta: "Above baseline", up: false, urgent: true, category: "Projects" },
  // Contracts
  { label: "Active Contracts",             value: "964",         delta: "+8 this month", up: true,  category: "Contracts" },
  { label: "Contracts At Risk",            value: "89",          delta: "9.2% of portfolio", up: false, urgent: true, category: "Contracts" },
  { label: "Procurement Cycle Time",       value: "42 days",     delta: "-3 days vs 2025", up: true, category: "Contracts" },
  // Tenders
  { label: "Active Tenders",               value: "1,287",       delta: "+42 new",      up: true,  category: "Tenders"  },
  { label: "Tenders Bidding Open",         value: "412",         delta: "Accepting bids", up: true, category: "Tenders" },
  { label: "Tenders Closing This Week",    value: "28",          delta: "Action required", up: false, category: "Tenders" },
  // Suppliers
  { label: "Registered Suppliers",         value: "12,847",      delta: "+284 this month", up: true, category: "Suppliers" },
  { label: "Blacklisted Vendors",          value: "228",         delta: "+8 this month", up: false, urgent: true, category: "Suppliers" },
  { label: "SME Participation Rate",       value: "37%",         delta: "Target: 40%",  up: true,  category: "Suppliers" },
  // Corruption
  { label: "Open Fraud Alerts",            value: "23",          delta: "+3 today",     up: false, urgent: true, category: "Corruption" },
  { label: "ZACC Referrals (YTD)",         value: "48",          delta: "+6 this month", up: false, urgent: true, category: "Corruption" },
  { label: "Spec Tailoring Cases",         value: "67",          delta: "+41% YoY 🔴",  up: false, urgent: true, category: "Corruption" },
  { label: "Ghost Vendor Detections",      value: "31",          delta: "USD 28.4M at risk", up: false, urgent: true, category: "Corruption" },
  { label: "Inflated Contract Value",      value: "USD 312M",    delta: "Est. annual loss", up: false, urgent: true, category: "Corruption" },
  // Wastage
  { label: "Annual Wastage (est.)",        value: "USD 357M",    delta: "Conservative est.", up: false, urgent: true, category: "Wastage" },
  { label: "Fuel Unaccounted Monthly",     value: "USD 590K",    delta: "19–20% of allocation", up: false, urgent: true, category: "Wastage" },
  { label: "Idle Govt Machinery",          value: "USD 38.4M",   delta: "66% fleet non-functional", up: false, urgent: true, category: "Wastage" },
  { label: "Expired Medicines",            value: "USD 14.2M",   delta: "Poor cold chain", up: false, urgent: true, category: "Wastage" },
  // Shortages
  { label: "Ambulance Shortage",           value: "74% gap",     delta: "124 of 480 needed", up: false, urgent: true, category: "Shortages" },
  { label: "Hospital Bed Shortage",        value: "45% gap",     delta: "8,158 beds needed", up: false, urgent: true, category: "Shortages" },
  { label: "Drug Stockout Rate",           value: "62%",         delta: "Public health facilities", up: false, urgent: true, category: "Shortages" },
  { label: "Classroom Shortage",           value: "40% gap",     delta: "20,800 classrooms", up: false, urgent: true, category: "Shortages" },
  { label: "Govt Vehicles Operational",    value: "34%",         delta: "5,560 non-functional", up: false, urgent: true, category: "Shortages" },
  // Quality of Life
  { label: "Hospital Wait Time",           value: "6.4 hrs",     delta: "Target < 2 hrs", up: false, urgent: true, category: "QoL" },
  { label: "Electricity Uptime (ZESA)",    value: "54%",         delta: "46% load-shedding", up: false, urgent: true, category: "QoL" },
  { label: "Clean Water (Rural Access)",   value: "38%",         delta: "62% unserved", up: false, urgent: true, category: "QoL" },
  { label: "Road Condition (Good)",        value: "41%",         delta: "59% below standard", up: false, category: "QoL" },
  // Compliance
  { label: "Compliance Score",             value: "94.2%",       delta: "+1.8pts",      up: true,  category: "Compliance" },
  { label: "Audit Exceptions (Open)",      value: "47",          delta: "+5 today",     up: false, category: "Compliance" },
  { label: "Supplier Compliance Rate",     value: "91.2%",       delta: "+0.8pts",      up: true,  category: "Compliance" },
  // Prices
  { label: "Infrastructure Price Index",   value: "+22%",        delta: "Jan→Jun 2026", up: false, urgent: true, category: "Prices" },
  { label: "Cement Price (50kg)",          value: "USD 11.20",   delta: "+33% since Jan", up: false, urgent: true, category: "Prices" },
  { label: "Diesel Fuel Price",            value: "USD 1.31/L",  delta: "+11% since Jan", up: false, category: "Prices" },
  { label: "Chlorine (50kg drum)",         value: "USD 112",     delta: "+33% — water crisis", up: false, urgent: true, category: "Prices" },
];

// ── Component ─────────────────────────────────────────────────────────────

interface KpiScrollTickerProps {
  /** Filter by category (undefined = show all) */
  categories?: string[];
  /** Height of the visible window */
  height?: number | string;
  /** 'dark' for dark backgrounds, 'light' for white backgrounds */
  theme?: "dark" | "light";
  /** Speed multiplier — higher = faster (default 1) */
  speed?: number;
  /** Show category label pills */
  showCategory?: boolean;
}

export default function KpiScrollTicker({
  categories,
  height = 400,
  theme = "dark",
  speed = 1,
  showCategory = true,
}: KpiScrollTickerProps) {
  const items = categories
    ? MASTER_KPI_TICKERS.filter(k => categories.includes(k.category ?? ""))
    : MASTER_KPI_TICKERS;

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  const duration = Math.max(8, Math.round(doubled.length * 1.4 / speed));

  const isDark = theme === "dark";

  return (
    <div
      className={`kpi-ticker-wrap ${theme === "light" ? "light" : ""}`}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
      }}
    >
      {/* inject dynamic duration via a CSS variable so the base keyframe is reused */}
      <style>{`
        .kpi-ticker-track { animation-duration: ${duration}s; }
      `}</style>
      <div className="kpi-ticker-track">
        {doubled.map((kpi, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-3 py-2.5 border-b ${
              isDark
                ? kpi.urgent
                  ? "border-red-500/20 bg-red-950/30"
                  : "border-white/6 bg-white/3 hover:bg-white/8"
                : kpi.urgent
                  ? "border-red-100 bg-red-50/60"
                  : "border-black/5 hover:bg-gray-50"
            } transition-colors cursor-default`}
          >
            {/* Status dot */}
            <div
              className={`h-2 w-2 rounded-full flex-shrink-0 ${
                kpi.urgent ? "bg-red-400 animate-pulse" : kpi.up ? "bg-emerald-400" : "bg-red-400"
              }`}
            />

            {/* Label */}
            <div className="flex-1 min-w-0">
              <div className={`text-[12px] font-medium truncate ${isDark ? "text-white/90" : "text-black/80"}`}>
                {kpi.label}
                {showCategory && kpi.category && (
                  <span className={`ml-1.5 text-[10px] px-1.5 rounded ${isDark ? "bg-white/15 text-white/70" : "bg-black/8 text-black/60"}`}>
                    {kpi.category}
                  </span>
                )}
              </div>
            </div>

            {/* Value */}
            <div className="flex-shrink-0 text-right">
              <div className={`text-[13px] font-bold ${
                kpi.urgent
                  ? "text-red-400"
                  : kpi.up
                    ? isDark ? "text-emerald-400" : "text-emerald-700"
                    : isDark ? "text-red-400"    : "text-red-600"
              }`}>
                {kpi.value}
              </div>
              <div className={`text-[10px] flex items-center justify-end gap-0.5 font-medium ${
                kpi.up
                  ? isDark ? "text-emerald-500" : "text-emerald-600"
                  : isDark ? "text-red-400"     : "text-red-500"
              }`}>
                {kpi.up
                  ? <TrendingUp className="h-3 w-3" />
                  : kpi.urgent
                    ? <AlertTriangle className="h-3 w-3" />
                    : <TrendingDown className="h-3 w-3" />
                }
                <span>{kpi.delta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
