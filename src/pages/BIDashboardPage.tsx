/**
 * BI Dashboard — Zimbabwe Government Procurement Intelligence
 * Tells the real story: spending, budgets, costs, shortages, corruption,
 * risk triggers, quality of life, economic indicators, wastage, and more.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader, KpiCard, Badge , PageContextBar } from "@/components/AppShell";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, ComposedChart, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ZAxis, ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, ShieldAlert,
  Activity, BarChart3, Users, Building2, Truck, Package, Fuel,
  Zap, Droplets, Stethoscope, BookOpen, Wrench, AlertOctagon,
  Target, Clock, CheckCircle2, XCircle, Flame, Globe2, ChevronRight,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import KpiScrollTicker from "@/components/KpiScrollTicker";
import ZimbabweMapTab from "@/components/ZimbabweMapTab";
import BudgetIntelligenceCentre from "@/components/BudgetIntelligenceCentre";

// ── Colour palette ──────────────────────────────────────────────────────────
const C = {
  // Each name accurately describes the actual color rendered
  blue:   "#3B82F6", // Vivid blue        — primary series / budget
  teal:   "#14B8A6", // Teal              — secondary series
  green:  "#10B981", // Emerald green     — positive / on-track / savings
  amber:  "#F59E0B", // Amber             — warning / forecast / target line
  red:    "#EF4444", // Red               — negative / overrun / critical
  violet: "#8B5CF6", // Violet            — 6th series (distinct from blue)
  orange: "#F97316", // Orange            — 7th series
  pink:   "#EC4899", // Pink              — 8th series
  cyan:   "#06B6D4", // Cyan              — 9th series
  indigo: "#6366F1", // Indigo            — 10th series
  dark:   "#0F172A", // Navy (backgrounds only — never use as chart fill)
};
const PIE = [C.blue, C.teal, C.green, C.amber, C.red, C.violet, C.orange, C.pink, C.cyan, C.indigo];

// ── Tabs ────────────────────────────────────────────────────────────────────
const TABS = [
  "National Spend Story",
  "Budget Performance",
  "Revenue & Economy",
  "Shortages & Wastage",
  "Corruption & Risk",
  "Supplier & Contractor",
  "Projects & Development",
  "Quality of Life Impact",
  "Price Indices",
  "Risk Dashboard",
  "Geography Map",
  "Budget Intelligence",
] as const;
type Tab = typeof TABS[number];

// ── Helper ──────────────────────────────────────────────────────────────────
function SectionTitle({ children, flag }: { children: React.ReactNode; flag?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-6">
      {flag && <span className="text-base">{flag}</span>}
      <h2 className="text-sm font-bold text-black uppercase tracking-wide">{children}</h2>
    </div>
  );
}

function StoryCard({ title, value, sub, color = "bg-[#0f172a]", textColor = "text-white", icon: Icon }:
  { title: string; value: string; sub?: string; color?: string; textColor?: string; icon?: React.ElementType }) {
  return (
    <div className={`${color} rounded-2xl p-4 flex flex-col gap-1`}>
      {Icon && <Icon className={`h-5 w-5 ${textColor} opacity-70 mb-1`} />}
      <div className={`text-2xl font-black tracking-tight ${textColor}`}>{value}</div>
      <div className={`text-xs font-semibold ${textColor} opacity-90`}>{title}</div>
      {sub && <div className={`text-[10px] ${textColor} opacity-60`}>{sub}</div>}
    </div>
  );
}

function RiskPill({ label, level }: { label: string; level: "critical" | "high" | "medium" | "low" }) {
  const cls = {
    critical: "bg-red-100 text-red-800 border-red-300",
    high:     "bg-slate-100 text-[#0F172A] border-slate-200",
    medium:   "bg-slate-100 text-[#0F172A] border-slate-200",
    low:      "bg-slate-100 text-[#0F172A] border-slate-200",
  }[level];
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${cls}`}>
    <span className="w-1.5 h-1.5 rounded-full bg-current" />{label}
  </span>;
}

const tt = { contentStyle: { background: "#0f172a", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 11, color: "#fff" } };

// ═══════════════════════════════════════════════════════════════════════════
// DATA — All Zimbabwe-contextual procurement intelligence data
// ═══════════════════════════════════════════════════════════════════════════

// ── National Spend 2020–2026 ────────────────────────────────────────────────
const SPEND_HISTORY = [
  { year: "2020", budget: 1840, actual: 1620, savings: 220, overrun: 0 },
  { year: "2021", budget: 2100, actual: 2340, savings: 0, overrun: 240 },
  { year: "2022", budget: 2400, actual: 2180, savings: 220, overrun: 0 },
  { year: "2023", budget: 2650, actual: 2590, savings: 60, overrun: 0 },
  { year: "2024", budget: 2890, actual: 3140, savings: 0, overrun: 250 },
  { year: "2025", budget: 3100, actual: 2940, savings: 160, overrun: 0 },
  { year: "2026", budget: 3400, actual: 2840, savings: 0, overrun: 0 },
];

const MONTHLY_SPEND_2026 = [
  { month: "Jan", actual: 180, budget: 283, variance: -103 },
  { month: "Feb", actual: 210, budget: 283, variance: -73 },
  { month: "Mar", actual: 245, budget: 283, variance: -38 },
  { month: "Apr", actual: 230, budget: 283, variance: -53 },
  { month: "May", actual: 268, budget: 283, variance: -15 },
  { month: "Jun", actual: 290, budget: 283, variance: 7 },
  { month: "Jul", actual: 0, budget: 283, variance: 0 },
];

const SPEND_BY_SECTOR = [
  { sector: "Infrastructure & Roads", usd: 1082, pct: 38, change: "+12%" },
  { sector: "Health & Pharmaceuticals", usd: 625, pct: 22, change: "+8%" },
  { sector: "ICT & Digital Systems", usd: 398, pct: 14, change: "+31%" },
  { sector: "Agriculture & Food", usd: 312, pct: 11, change: "-4%" },
  { sector: "Education & Training", usd: 256, pct: 9, change: "+2%" },
  { sector: "Other & Services", usd: 167, pct: 6, change: "-9%" },
];

// ── Budget Performance ──────────────────────────────────────────────────────
const MINISTRY_BUDGET = [
  { ministry: "Transport", budget: 620, spent: 578, pct: 93, status: "On Track" },
  { ministry: "Health", budget: 480, spent: 392, pct: 82, status: "On Track" },
  { ministry: "Education", budget: 380, spent: 291, pct: 77, status: "Slow" },
  { ministry: "Energy", budget: 320, spent: 184, pct: 57, status: "Underspent" },
  { ministry: "Agriculture", budget: 290, spent: 312, pct: 108, status: "Overrun" },
  { ministry: "Water", budget: 240, spent: 318, pct: 132, status: "Critical Overrun" },
  { ministry: "Defence", budget: 210, spent: 208, pct: 99, status: "On Track" },
  { ministry: "ICT", budget: 180, spent: 98, pct: 54, status: "Underspent" },
  { ministry: "Finance", budget: 160, spent: 142, pct: 89, status: "On Track" },
  { ministry: "Home Affairs", budget: 140, spent: 164, pct: 117, status: "Overrun" },
];

const BUDGET_ABSORPTION_TREND = [
  { q: "Q1 2024", absorbed: 18, target: 25 },
  { q: "Q2 2024", absorbed: 31, target: 50 },
  { q: "Q3 2024", absorbed: 52, target: 75 },
  { q: "Q4 2024", absorbed: 84, target: 100 },
  { q: "Q1 2025", absorbed: 21, target: 25 },
  { q: "Q2 2025", absorbed: 44, target: 50 },
  { q: "Q3 2025", absorbed: 68, target: 75 },
  { q: "Q4 2025", absorbed: 91, target: 100 },
  { q: "Q1 2026", absorbed: 19, target: 25 },
  { q: "Q2 2026", absorbed: 38, target: 50 },
];

// ── Revenue & Economy ───────────────────────────────────────────────────────
const REVENUE_TREND = [
  { month: "Jan", target: 890, actual: 812, shortfall: 78 },
  { month: "Feb", target: 890, actual: 847, shortfall: 43 },
  { month: "Mar", target: 890, actual: 923, shortfall: 0 },
  { month: "Apr", target: 920, actual: 874, shortfall: 46 },
  { month: "May", target: 920, actual: 901, shortfall: 19 },
  { month: "Jun", target: 950, actual: 988, shortfall: 0 },
];

const REVENUE_BREAKDOWN = [
  { source: "ZIMRA — Corporate Tax", value: 1840, pct: 31 },
  { source: "ZIMRA — VAT", value: 1420, pct: 24 },
  { source: "ZIMRA — PAYE/Income Tax", value: 1180, pct: 20 },
  { source: "Customs & Excise", value: 710, pct: 12 },
  { source: "Mining Royalties", value: 420, pct: 7 },
  { source: "State Enterprise Dividends", value: 178, pct: 3 },
  { source: "Other", value: 178, pct: 3 },
];

const ECONOMIC_INDICATORS = [
  { indicator: "Inflation Rate", value: "34.8%", trend: "up", status: "critical", prev: "29.2%", note: "Rising fast — food basket up 41%" },
  { indicator: "USD Exchange Rate (ZiG)", value: "13.42", trend: "up", status: "high", prev: "12.18", note: "Parallel market: 18.4" },
  { indicator: "GDP Growth (est.)", value: "3.2%", trend: "stable", status: "medium", prev: "2.8%", note: "Below 5% target for dev" },
  { indicator: "Unemployment Rate", value: "19.4%", trend: "down", status: "high", prev: "21.1%", note: "Youth unemployment 38%" },
  { indicator: "Public Debt / GDP", value: "82.6%", trend: "up", status: "critical", prev: "79.1%", note: "Threshold: 70% — breached" },
  { indicator: "Budget Deficit / GDP", value: "4.8%", trend: "up", status: "high", prev: "3.9%", note: "Target was 3%" },
  { indicator: "Foreign Reserves (months)", value: "1.8", trend: "down", status: "critical", prev: "2.1", note: "Critical — min 3 months" },
  { indicator: "Trade Balance (USD M)", value: "-$284M", trend: "down", status: "high", prev: "-$198M", note: "Imports outpacing exports" },
];

// ── Shortages & Wastage ─────────────────────────────────────────────────────
const SHORTAGE_DATA = [
  { category: "Hospital Beds (public)", current: 9842, required: 18000, gap: 8158, gapPct: 45, severity: "critical" },
  { category: "School Classrooms", current: 31200, required: 52000, gap: 20800, gapPct: 40, severity: "critical" },
  { category: "Govt Vehicles (operational)", current: 2840, required: 8400, gap: 5560, gapPct: 66, severity: "critical" },
  { category: "Medical Equipment (functional)", current: 1420, required: 4800, gap: 3380, gapPct: 70, severity: "critical" },
  { category: "ICT Workstations (govt offices)", current: 8200, required: 24000, gap: 15800, gapPct: 66, severity: "high" },
  { category: "Office Printers/Photocopiers", current: 1840, required: 5200, gap: 3360, gapPct: 65, severity: "high" },
  { category: "Water Treatment Plants (working)", current: 41, required: 68, gap: 27, gapPct: 40, severity: "high" },
  { category: "Ambulances (operational)", current: 124, required: 480, gap: 356, gapPct: 74, severity: "critical" },
];

const WASTAGE_DATA = [
  { category: "Expired Medicines (USD M)", value: 14.2, cause: "Poor cold chain, over-procurement" },
  { category: "Unfinished Buildings (USD M)", value: 84.6, cause: "Payment delays, abandoned contracts" },
  { category: "Idle Machinery & Equip (USD M)", value: 38.4, cause: "No maintenance budget, parts unavailable" },
  { category: "Over-priced Contracts (USD M)", value: 124.8, cause: "Weak competition, spec tailoring" },
  { category: "Fuel Theft / Misuse (USD M)", value: 22.1, cause: "No tracking system, ghost trips" },
  { category: "Stationery Overpurchase (USD M)", value: 8.4, cause: "Decentralised buying, no central control" },
  { category: "Duplicate Payments (USD M)", value: 18.9, cause: "Manual processing, no three-way match" },
  { category: "Abandoned IT Projects (USD M)", value: 46.2, cause: "Poor planning, vendor lock-in" },
];

const FUEL_USAGE = [
  { month: "Jan", allocated: 180000, used: 142000, stolen: 38000 },
  { month: "Feb", allocated: 185000, used: 148000, stolen: 37000 },
  { month: "Mar", allocated: 192000, used: 161000, stolen: 31000 },
  { month: "Apr", allocated: 188000, used: 152000, stolen: 36000 },
  { month: "May", allocated: 195000, used: 158000, stolen: 37000 },
  { month: "Jun", allocated: 200000, used: 163000, stolen: 37000 },
];

// ── Corruption & Risk ───────────────────────────────────────────────────────
const CORRUPTION_CASES = [
  { type: "Bid Rigging / Rotation", count: 48, valueUSD: 84.2, trend: "+18% YoY", severity: "critical" },
  { type: "Inflated Contract Prices", count: 124, valueUSD: 312.8, trend: "+24% YoY", severity: "critical" },
  { type: "Ghost Vendors / Suppliers", count: 31, valueUSD: 28.4, trend: "+6% YoY", severity: "high" },
  { type: "Spec Tailoring for Specific Bidder", count: 67, valueUSD: 142.1, trend: "+41% YoY", severity: "critical" },
  { type: "Conflict of Interest (undisclosed)", count: 29, valueUSD: 64.8, trend: "+12% YoY", severity: "high" },
  { type: "Duplicate / Fraudulent Payments", count: 84, valueUSD: 18.9, trend: "-8% YoY", severity: "high" },
  { type: "Procurement Method Abuse", count: 93, valueUSD: 98.4, trend: "+29% YoY", severity: "high" },
  { type: "PEP / Politically Exposed Entity", count: 18, valueUSD: 48.6, trend: "New", severity: "critical" },
];

const RISK_TRIGGERS = [
  { trigger: "Single-source procurement >40% of ministry budget", freq: 14, impact: "High", status: "Active" },
  { trigger: "Contract variations exceeding 25% of original value", freq: 28, impact: "Critical", status: "Active" },
  { trigger: "Payments to non-registered vendors", freq: 9, impact: "Critical", status: "Escalated" },
  { trigger: "Bid submission < 24 hrs before deadline (last-minute)", freq: 42, impact: "Medium", status: "Monitoring" },
  { trigger: "Same IP/device multiple bid submissions", freq: 7, impact: "High", status: "Investigating" },
  { trigger: "Evaluation scores identical across evaluators", freq: 18, impact: "High", status: "Active" },
  { trigger: "Director overlap between evaluating officer & vendor", freq: 12, impact: "Critical", status: "Escalated" },
  { trigger: "Award to non-lowest compliant bid (unexplained)", freq: 23, impact: "High", status: "Active" },
];

const RISK_BREAKERS = [
  { action: "Mandatory public bid opening (livestreamed)", status: "Implemented", impact: "Fraud ↓ 34%" },
  { action: "Beneficial ownership disclosure", status: "Partially done", impact: "PEP cases detected: 18" },
  { action: "AI fraud detection engine", status: "Active", impact: "124 alerts/month avg" },
  { action: "Three-way invoice matching", status: "Piloting (3 ministries)", impact: "Duplicates ↓ 61%" },
  { action: "e-Procurement platform adoption", status: "62% ministries onboarded", impact: "Savings: USD 184M" },
  { action: "Whistleblower portal (encrypted)", status: "Live", impact: "12 active cases" },
  { action: "Independent bid evaluation (AI-assisted)", status: "Piloting", impact: "Under assessment" },
  { action: "Asset tracking (GPS + RFID)", status: "Planning", impact: "Not yet measured" },
];

// ── Price Indices ───────────────────────────────────────────────────────────
const PRICE_INDEX = [
  { item: "Bitumen (per tonne)", unit: "USD/t", jan: 480, jun: 612, change: 27.5, trend: "up", note: "Global supply squeeze" },
  { item: "Reinforced Steel", unit: "USD/t", jan: 840, jun: 920, change: 9.5, trend: "up", note: "Import duty impact" },
  { item: "Diesel Fuel", unit: "USD/L", jan: 1.18, jun: 1.31, change: 11.0, trend: "up", note: "Forex allocation delays" },
  { item: "Medical Gloves (100 pack)", unit: "USD", jan: 4.20, jun: 4.80, change: 14.3, trend: "up", note: "Post-COVID supply reset" },
  { item: "A4 Paper (ream)", unit: "USD", jan: 3.80, jun: 4.10, change: 7.9, trend: "up", note: "Local paper mill output low" },
  { item: "Laptop (govt spec)", unit: "USD", jan: 680, jun: 720, change: 5.9, trend: "stable", note: "Within benchmark range" },
  { item: "School Desk & Chair (set)", unit: "USD", jan: 42, jun: 58, change: 38.1, trend: "up", note: "Timber shortage, craft levy" },
  { item: "Chlorine (per 50kg drum)", unit: "USD", jan: 84, jun: 112, change: 33.3, trend: "up", note: "Critical for water treatment" },
  { item: "Ambulance (basic)", unit: "USD K", jan: 48, jun: 54, change: 12.5, trend: "up", note: "Only 1 local assembler" },
  { item: "Cement (50kg bag)", unit: "USD", jan: 8.40, jun: 11.20, change: 33.3, trend: "up", note: "PPC export pressure" },
];

const PRICE_TREND_6M = [
  { month: "Jan", infrastructure: 100, health: 100, education: 100, ict: 100, fuel: 100 },
  { month: "Feb", infrastructure: 102, health: 101, education: 102, ict: 99, fuel: 104 },
  { month: "Mar", infrastructure: 105, health: 103, education: 104, ict: 100, fuel: 107 },
  { month: "Apr", infrastructure: 109, health: 104, education: 107, ict: 102, fuel: 109 },
  { month: "May", infrastructure: 115, health: 106, education: 110, ict: 103, fuel: 111 },
  { month: "Jun", infrastructure: 122, health: 108, education: 114, ict: 104, fuel: 113 },
];

// ── Quality of Life ─────────────────────────────────────────────────────────
const QOL_METRICS = [
  { metric: "Avg wait time — public hospital", value: "6.4 hrs", benchmark: "< 2 hrs", gap: "4.4 hrs excess", severity: "critical", trend: "worsening" },
  { metric: "School pupil-to-teacher ratio", value: "48:1", benchmark: "30:1", gap: "60% over recommended", severity: "high", trend: "stable" },
  { metric: "Access to clean water (rural)", value: "38%", benchmark: "90%+", gap: "52% unserved", severity: "critical", trend: "improving" },
  { metric: "Road in good condition (%)", value: "41%", benchmark: "75%+", gap: "34% below standard", severity: "high", trend: "worsening" },
  { metric: "Electricity uptime (ZESA)", value: "54%", benchmark: "95%+", gap: "41% load-shedding", severity: "critical", trend: "stable" },
  { metric: "Govt drug stockout rate", value: "62%", benchmark: "< 5%", gap: "57% above threshold", severity: "critical", trend: "worsening" },
  { metric: "Mean travel time to nearest hospital", value: "94 min", benchmark: "30 min", gap: "64 min excess", severity: "high", trend: "stable" },
  { metric: "Primary school net enrolment", value: "84%", benchmark: "100%", gap: "16% out-of-school", severity: "medium", trend: "improving" },
];

// ── Supplier / Contractor Performance ──────────────────────────────────────
const CONTRACTOR_DELIVERY = [
  { name: "Highveld Engineering", onTime: 94, quality: 89, safety: 96, cost: 85, disputes: 1, projects: 18 },
  { name: "Zimbabwe Pharma Holdings", onTime: 91, quality: 92, safety: 99, cost: 80, disputes: 0, projects: 24 },
  { name: "Sable ICT Solutions", onTime: 78, quality: 80, safety: 99, cost: 76, disputes: 2, projects: 11 },
  { name: "Bulawayo Civil Works", onTime: 52, quality: 61, safety: 74, cost: 68, disputes: 5, projects: 9 },
  { name: "Mashonaland Agri", onTime: 88, quality: 84, safety: 94, cost: 82, disputes: 0, projects: 16 },
  { name: "Eastern Highlands Logistics", onTime: 86, quality: 78, safety: 97, cost: 84, disputes: 1, projects: 7 },
  { name: "Granite Construction (BLACKLISTED)", onTime: 18, quality: 28, safety: 42, cost: 44, disputes: 8, projects: 4 },
];

const SME_PARTICIPATION = [
  { year: "2021", sme: 18, enterprise: 64, micro: 18 },
  { year: "2022", sme: 21, enterprise: 61, micro: 18 },
  { year: "2023", sme: 26, enterprise: 58, micro: 16 },
  { year: "2024", sme: 30, enterprise: 54, micro: 16 },
  { year: "2025", sme: 34, enterprise: 51, micro: 15 },
  { year: "2026", sme: 37, enterprise: 48, micro: 15 },
];

// ── Project Delivery ────────────────────────────────────────────────────────
const PROJECT_DELIVERY_STATS = [
  { status: "On Time, On Budget", count: 284, pct: 19 },
  { status: "Delayed (< 6 months)", count: 412, pct: 28 },
  { status: "Delayed (6–24 months)", count: 318, pct: 21 },
  { status: "Delayed (> 24 months)", count: 184, pct: 12 },
  { status: "Cost Overrun > 25%", count: 142, pct: 10 },
  { status: "Abandoned / Stalled", count: 147, pct: 10 },
];

const OVERRUN_BY_SECTOR = [
  { sector: "Roads & Transport", planned: 840, actual: 1248, overrun: 408, pct: 49 },
  { sector: "Water & Sanitation", planned: 380, actual: 614, overrun: 234, pct: 62 },
  { sector: "Health Facilities", planned: 290, actual: 408, overrun: 118, pct: 41 },
  { sector: "Schools & Education", planned: 210, actual: 284, overrun: 74, pct: 35 },
  { sector: "Energy & Power", planned: 180, actual: 228, overrun: 48, pct: 27 },
  { sector: "ICT & Systems", planned: 140, actual: 196, overrun: 56, pct: 40 },
];

// ═══════════════════════════════════════════════════════════════════════════
// TAB COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function NationalSpendTab() {
  return (
    <div className="space-y-5">
      {/* Headline KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StoryCard title="Total National Procurement Spend YTD" value="USD 2.84B" sub="+6.2% vs prior year" color="bg-[#0f172a]" icon={DollarSign} />
        <StoryCard title="Budget Utilisation" value="67.8%" sub="USD 3.4B total approved budget" color="bg-[#0F172A]" icon={Target} />
        <StoryCard title="Procurement Savings" value="USD 184M" sub="6.5% of total spend — below 8% target" color="bg-[#0F172A]" icon={TrendingDown} />
        <StoryCard title="Budget Overruns (active)" value="USD 498M" sub="Across 3 ministries" color="bg-red-700" icon={AlertTriangle} />
      </div>

      {/* Story: Budget vs Actual 6-year trend */}
      <Card>
        <CardHeader title="📊 The Overspending Cycle — 2020 to 2026" subtitle="Budget approved vs actual spend in USD millions — THE PATTERN IS CLEAR" />
        <div className="p-4 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={SPEND_HISTORY}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
              <Tooltip {...tt} formatter={(v: number, n) => [`USD ${v}M`, n]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="budget" name="Budget Approved" fill={C.indigo} radius={[3,3,0,0]} />
              <Bar dataKey="actual" name="Actual Spend" fill={C.teal} radius={[3,3,0,0]} />
              <Bar dataKey="overrun" name="Overrun ⚠️" fill={C.red} radius={[3,3,0,0]} />
              <Bar dataKey="savings" name="Savings ✓" fill={C.green} radius={[3,3,0,0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="px-5 pb-4 text-xs text-red-700 bg-red-50 mx-4 mb-4 rounded-xl p-3 font-medium">
          🔴 2021 & 2024 recorded overruns of USD 240M and USD 250M respectively. Agriculture & Water consistently breach their envelopes.
          These overruns divert funds from other critical programmes.
        </div>
      </Card>

      {/* Monthly 2026 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Monthly Spend vs Budget — 2026" subtitle="USD millions per month" />
          <div className="p-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_SPEND_2026}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
                <Tooltip {...tt} formatter={(v: number, n) => [`USD ${v}M`, n]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={283} stroke={C.amber} strokeDasharray="4 2" label={{ value: "Monthly Target", position: "right", fontSize: 9 }} />
                <Bar dataKey="actual" name="Actual" fill={C.teal} radius={[3,3,0,0]} />
                <Bar dataKey="budget" name="Budget" fill="#e2e8f0" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Where the Money Goes — Sector Distribution" subtitle="% of USD 2.84B YTD" />
          <div className="p-4 h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={SPEND_BY_SECTOR} dataKey="usd" nameKey="sector" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {SPEND_BY_SECTOR.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                </Pie>
                <Tooltip {...tt} formatter={(v: number) => [`USD ${v}M`, ""]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Sector spend table */}
      <Card>
        <CardHeader title="Sector Spend Detail — YTD FY2026" subtitle="With year-on-year change" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f8f9fa] text-xs text-black/50">
              <tr>{["Sector","USD Millions","% of Total","YoY Change"].map(h => <th key={h} className="px-4 py-2.5 text-left font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {SPEND_BY_SECTOR.map(r => (
                <tr key={r.sector} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-medium text-black">{r.sector}</td>
                  <td className="px-4 py-2.5 font-bold text-[#2563eb]">USD {r.usd}M</td>
                  <td className="px-4 py-2.5 text-black/70">{r.pct}%</td>
                  <td className="px-4 py-2.5">
                    <span className={`font-semibold text-xs ${r.change.startsWith("+") ? "text-[#0F172A]" : "text-red-500"}`}>{r.change}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function BudgetPerformanceTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StoryCard title="Ministries On Track" value="6/10" sub="60% within approved envelope" color="bg-[#0F172A]" icon={CheckCircle2} />
        <StoryCard title="Ministries with Overrun" value="3" sub="Water 132% | Agri 108% | Home 117%" color="bg-red-700" icon={AlertTriangle} />
        <StoryCard title="Underspent Ministries" value="2" sub="Energy 57% | ICT 54% absorbed" color="bg-[#0F172A]" icon={TrendingDown} />
        <StoryCard title="Budget Absorption Rate (Q2)" value="38%" sub="Target was 50% by Q2" color="bg-[#0f172a]" icon={Activity} />
      </div>

      <Card>
        <CardHeader title="🔴 Ministry Budget vs Actual Spend — Critical Overruns & Underspends Exposed"
          subtitle="Orange = overrun, Blue = underspent, Green = on track — USD millions" />
        <div className="p-4 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MINISTRY_BUDGET} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
              <YAxis type="category" dataKey="ministry" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={80} />
              <Tooltip {...tt} formatter={(v: number, n) => [`USD ${v}M`, n]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="budget" name="Budget" fill="#e2e8f0" radius={[0,3,3,0]} />
              <Bar dataKey="spent" name="Actual Spent" radius={[0,3,3,0]}
                fill={C.teal}>
                {MINISTRY_BUDGET.map((m, i) => (
                  <Cell key={i} fill={m.pct > 100 ? C.red : m.pct < 70 ? C.amber : C.teal} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="px-5 pb-4 space-y-1.5">
          {MINISTRY_BUDGET.filter(m => m.pct > 100 || m.pct < 65).map(m => (
            <div key={m.ministry} className={`text-xs px-3 py-2 rounded-lg font-medium ${m.pct > 100 ? "bg-red-50 text-red-700" : "bg-slate-50 text-[#0F172A]"}`}>
              {m.pct > 100 ? "🔴" : "🟡"} {m.ministry}: {m.pct}% absorption — {m.status}. Budget: USD {m.budget}M | Spent: USD {m.spent}M
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader title="Budget Absorption Rate — Quarterly Trend vs Target" subtitle="% of annual budget absorbed — slow start every year" />
        <div className="p-4 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={BUDGET_ABSORPTION_TREND}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="q" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip {...tt} formatter={(v: number, n) => [`${v}%`, n]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="target" name="Target %" fill="#e2e8f0" radius={[3,3,0,0]} />
              <Bar dataKey="absorbed" name="Actual %" radius={[3,3,0,0]}>
                {BUDGET_ABSORPTION_TREND.map((d, i) => (
                  <Cell key={i} fill={d.absorbed >= d.target ? C.green : d.absorbed >= d.target * 0.8 ? C.amber : C.red} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="px-5 pb-4 text-xs text-[#0F172A] bg-slate-50 mx-4 mb-4 rounded-xl p-3 font-medium">
          🟡 Zimbabwe's chronic slow budget absorption pattern means Q4 panic spending — rushed, poorly planned procurements at year-end,
          leading to inferior quality, overpricing and zero value for money.
        </div>
      </Card>
    </div>
  );
}

function RevenueEconomyTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StoryCard title="Total Revenue YTD" value="USD 5.34B" sub="On target by 2.1%" color="bg-[#0F172A]" icon={DollarSign} />
        <StoryCard title="Public Debt / GDP" value="82.6%" sub="🔴 CRITICAL — breached 70% threshold" color="bg-red-800" icon={AlertOctagon} />
        <StoryCard title="Foreign Reserves" value="1.8 months" sub="🔴 Minimum is 3 months — crisis level" color="bg-red-700" icon={AlertTriangle} />
        <StoryCard title="Inflation Rate" value="34.8%" sub="Food basket up 41% YoY" color="bg-[#0F172A]" icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader title="Revenue Collection vs Monthly Target — 2026" subtitle="USD millions — where collection is falling short" />
        <div className="p-4 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={REVENUE_TREND}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
              <Tooltip {...tt} formatter={(v: number, n) => [`USD ${v}M`, n]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="actual" name="Collected" fill={C.teal} radius={[3,3,0,0]} />
              <Bar dataKey="shortfall" name="Shortfall ⚠️" fill={C.red} radius={[3,3,0,0]} />
              <Line type="monotone" dataKey="target" name="Target" stroke={C.amber} strokeWidth={2} strokeDasharray="4 2" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Revenue Sources — Where Government Money Comes From" subtitle="FY2026 projected" />
          <div className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_BREAKDOWN} layout="vertical">
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
                <YAxis type="category" dataKey="source" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} width={160} />
                <Tooltip {...tt} formatter={(v: number) => [`USD ${v}M`, "Revenue"]} />
                <Bar dataKey="value" name="Revenue" radius={[0,4,4,0]}>
                  {REVENUE_BREAKDOWN.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="🚨 Key Economic Indicators — The Real Story" subtitle="What the numbers mean for citizens and procurement" />
          <div className="divide-y divide-black/5">
            {ECONOMIC_INDICATORS.map(ind => (
              <div key={ind.indicator} className={`px-4 py-3 flex items-start gap-3 ${ind.status === "critical" ? "bg-red-50/50" : ind.status === "high" ? "bg-slate-50/30" : ""}`}>
                <div className={`h-2.5 w-2.5 rounded-full mt-1.5 flex-shrink-0 ${ind.status === "critical" ? "bg-red-500" : ind.status === "high" ? "bg-[#0F172A]" : "bg-[#0F172A]"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-black">{ind.indicator}</span>
                    <span className={`text-sm font-black ${ind.status === "critical" ? "text-red-600" : ind.status === "high" ? "text-[#0F172A]" : "text-[#0F172A]"}`}>{ind.value}</span>
                    <span className="text-[10px] text-black/40">prev: {ind.prev}</span>
                  </div>
                  <div className="text-[10px] text-black/50 mt-0.5 italic">{ind.note}</div>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ind.trend === "up" ? "bg-red-100 text-red-700" : ind.trend === "down" ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-500"}`}>
                  {ind.trend === "up" ? "↑" : ind.trend === "down" ? "↓" : "→"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ShortagesWastageTab() {
  const totalWastage = WASTAGE_DATA.reduce((s, w) => s + w.value, 0);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StoryCard title="Total Estimated Annual Wastage" value={`USD ${totalWastage.toFixed(1)}M`} sub="Conservative estimate — actual likely 3× higher" color="bg-red-800" icon={Flame} />
        <StoryCard title="Govt Buildings with Defects/Incomplete" value="1,284" sub="Worth USD 84.6M stuck at various stages" color="bg-[#0F172A]" icon={Building2} />
        <StoryCard title="Non-operational Govt Vehicles" value="5,560" sub="66% of required fleet non-functional" color="bg-[#0F172A]" icon={Truck} />
        <StoryCard title="Drug Stockout Rate" value="62%" sub="62% of public health facilities short on medicines" color="bg-red-700" icon={Stethoscope} />
      </div>

      <Card>
        <CardHeader title="🏥🏫🚗 Critical Government Asset Shortages — The Gap Between What Exists and What Is Needed"
          subtitle="Shortage = unreported crisis affecting citizens daily" />
        <div className="p-4 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SHORTAGE_DATA} layout="vertical">
              <CartesianGrid stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={8.5} tickLine={false} axisLine={false} width={190} />
              <Tooltip {...tt} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="current" name="Available Now" fill={C.teal} radius={[0,3,3,0]} />
              <Bar dataKey="required" name="Required" fill="#e2e8f0" radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="💸 Where Government Money Is Being Wasted" subtitle={`Total estimated wastage: USD ${totalWastage.toFixed(1)}M annually`} />
          <div className="divide-y divide-black/5">
            {WASTAGE_DATA.sort((a,b) => b.value - a.value).map(w => (
              <div key={w.category} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-black">{w.category}</span>
                  <span className="text-sm font-black text-red-600">USD {w.value}M</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: `${(w.value / totalWastage * 100).toFixed(0)}%` }} />
                </div>
                <div className="text-[10px] text-black/45 italic">{w.cause}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="⛽ Fuel Allocation vs Actual Use vs Stolen" subtitle="Monthly litres — the hidden drain on transport budget" />
          <div className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FUEL_USAGE}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                <Tooltip {...tt} formatter={(v: number) => [v.toLocaleString() + " L", ""]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="used" name="Legitimately Used" fill={C.teal} stackId="a" radius={[0,0,0,0]} />
                <Bar dataKey="stolen" name="Unaccounted / Stolen ⚠️" fill={C.red} stackId="a" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pb-4 text-xs text-red-600 bg-red-50 mx-4 mb-4 rounded-xl p-3 font-medium">
            🔴 An estimated 19–20% of fuel allocated is unaccounted for every month. At current prices (USD 1.31/L) this equals ~USD 590,000/month lost to ghost trips and theft.
          </div>
        </Card>
      </div>
    </div>
  );
}

function CorruptionRiskTab() {
  const totalCorruptionUSD = CORRUPTION_CASES.reduce((s, c) => s + c.valueUSD, 0);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StoryCard title="Estimated Corruption Losses (Confirmed)" value={`USD ${totalCorruptionUSD.toFixed(0)}M`} sub="Per year — likely 5–10× if all cases tracked" color="bg-red-900" icon={ShieldAlert} />
        <StoryCard title="Active Fraud Investigations" value="141" sub="48 referred to ZACC" color="bg-red-700" icon={AlertOctagon} />
        <StoryCard title="Spec Tailoring Cases" value="67" sub="+41% YoY — most dangerous trend" color="bg-[#0F172A]" icon={AlertTriangle} />
        <StoryCard title="Ghost Vendor Payments" value="31 cases" sub="USD 28.4M paid to non-existent entities" color="bg-red-800" icon={Users} />
      </div>

      <Card>
        <CardHeader title="🚨 Corruption Typology — What's Happening, How Much It Costs"
          subtitle="Estimated USD value lost per type of corruption in procurement" />
        <div className="p-4 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[...CORRUPTION_CASES].sort((a,b) => b.valueUSD - a.valueUSD)} layout="vertical">
              <CartesianGrid stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
              <YAxis type="category" dataKey="type" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} width={210} />
              <Tooltip {...tt} formatter={(v: number, n) => [n === "valueUSD" ? `USD ${v}M` : String(v), n === "valueUSD" ? "Est. Loss" : "Cases"]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="valueUSD" name="Estimated Loss (USD M)" fill={C.red} radius={[0,4,4,0]} />
              <Bar dataKey="count" name="Number of Cases" fill={C.orange} radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="⚡ Risk Triggers — Active Procurement Anomalies" subtitle="Patterns being monitored by AI detection engine" />
          <div className="divide-y divide-black/5">
            {RISK_TRIGGERS.map(r => (
              <div key={r.trigger} className={`px-4 py-3 flex items-start gap-3 ${r.status === "Escalated" ? "bg-red-50/40" : r.status === "Investigating" ? "bg-slate-50/40" : ""}`}>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5
                  ${r.impact === "Critical" ? "bg-red-100 text-red-700" : r.impact === "High" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>
                  {r.impact}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-black/80">{r.trigger}</div>
                  <div className="text-[10px] text-black/40 mt-0.5">Detected: {r.freq} times · Status: {r.status}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="🛡️ Risk Breakers — What's Being Done (and What's Not)"
            subtitle="Countermeasures and their effectiveness" />
          <div className="divide-y divide-black/5">
            {RISK_BREAKERS.map(rb => (
              <div key={rb.action} className="px-4 py-3 flex items-start gap-3">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 whitespace-nowrap
                  ${rb.status === "Implemented" || rb.status === "Active" || rb.status === "Live" ? "bg-slate-100 text-[#0F172A]"
                  : rb.status === "Planning" ? "bg-gray-100 text-gray-500"
                  : "bg-slate-100 text-[#0F172A]"}`}>
                  {rb.status.includes("Implement") || rb.status === "Active" || rb.status === "Live" ? "✓" : rb.status === "Planning" ? "○" : "△"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-black">{rb.action}</div>
                  <div className="text-[10px] text-black/50 mt-0.5">Impact: {rb.impact}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SupplierContractorTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StoryCard title="Registered Suppliers" value="12,847" sub="+284 new this month" color="bg-[#0f172a]" icon={Users} />
        <StoryCard title="SME Participation Rate" value="37%" sub="Up from 18% in 2021 — target 40%" color="bg-[#0F172A]" icon={TrendingUp} />
        <StoryCard title="Blacklisted Vendors" value="228" sub="+8 this month — debarment active" color="bg-red-700" icon={XCircle} />
        <StoryCard title="Open Vendor Disputes" value="23" sub="USD 724K in contested value" color="bg-[#0F172A]" icon={AlertTriangle} />
      </div>

      <Card>
        <CardHeader title="Contractor Delivery Scorecard — The Performing and The Failing"
          subtitle="On-time, quality, safety, cost scores — 0 to 100" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f8f9fa] text-xs text-black/50">
              <tr>{["Contractor","On-Time","Quality","Safety","Cost Eff.","Disputes","Projects"].map(h => <th key={h} className="px-3 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {CONTRACTOR_DELIVERY.map(c => {
                const overall = Math.round((c.onTime + c.quality + c.safety + c.cost) / 4);
                return (
                  <tr key={c.name} className={`hover:bg-gray-50 ${overall < 50 ? "bg-red-50/30" : ""}`}>
                    <td className="px-3 py-2.5 font-semibold text-xs text-black">{c.name}</td>
                    {[c.onTime, c.quality, c.safety, c.cost].map((v, i) => (
                      <td key={i} className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${v}%`, background: v >= 85 ? C.green : v >= 65 ? C.amber : C.red }} />
                          </div>
                          <span className="text-[11px] font-bold" style={{ color: v >= 85 ? "#059669" : v >= 65 ? "#64748B" : "#dc2626" }}>{v}%</span>
                        </div>
                      </td>
                    ))}
                    <td className="px-3 py-2.5 text-xs font-bold text-center">
                      <span className={c.disputes > 3 ? "text-red-600" : c.disputes > 0 ? "text-[#0F172A]" : "text-[#0F172A]"}>{c.disputes}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-black/60">{c.projects}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="SME Participation in Government Tenders — 5-Year Trend" subtitle="Local business growth in procurement" />
        <div className="p-4 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SME_PARTICIPATION}>
              <defs>
                <linearGradient id="smeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.teal} stopOpacity={0.3} /><stop offset="100%" stopColor={C.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip {...tt} formatter={(v: number, n) => [`${v}%`, n]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="sme" name="SME %" stroke={C.teal} fill="url(#smeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="enterprise" name="Enterprise %" stroke={C.blue} fill="none" strokeWidth={2} />
              <Area type="monotone" dataKey="micro" name="Micro %" stroke={C.amber} fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function ProjectsDevelopmentTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StoryCard title="Total Infrastructure Projects" value="1,487" sub="Valued at USD 14.2B" color="bg-[#0f172a]" icon={Building2} />
        <StoryCard title="On Time & On Budget" value="19%" sub="Only 284 of 1,487 projects — shocking" color="bg-red-700" icon={XCircle} />
        <StoryCard title="Abandoned / Stalled" value="147" sub="Worth USD 418M — sitting idle" color="bg-red-800" icon={AlertTriangle} />
        <StoryCard title="Average Cost Overrun" value="43%" sub="Across overrunning projects" color="bg-[#0F172A]" icon={TrendingUp} />
      </div>

      <Card>
        <CardHeader title="📉 Project Delivery Status — Only 19% Delivered On Time and Budget. Why?"
          subtitle="Distribution of 1,487 active infrastructure projects" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PROJECT_DELIVERY_STATS} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
                  {PROJECT_DELIVERY_STATS.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? C.green : i < 3 ? C.amber : i < 4 ? C.orange : C.red} />
                  ))}
                </Pie>
                <Tooltip {...tt} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {PROJECT_DELIVERY_STATS.map((s, i) => (
              <div key={s.status} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: i === 0 ? C.green : i < 3 ? C.amber : i < 4 ? C.orange : C.red }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-black truncate">{s.status}</div>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                    <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: i === 0 ? C.green : i < 3 ? C.amber : C.red }} />
                  </div>
                </div>
                <span className="text-sm font-black text-black">{s.count}</span>
                <span className="text-xs text-black/40">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 pb-4 text-xs text-red-700 bg-red-50 mx-4 mb-4 rounded-xl p-3 font-medium">
          🔴 81% of government projects face delays or cost overruns. Key causes: inadequate planning, under-budgeting, weak contract management,
          and contractor cash-flow problems linked to slow payment cycles.
        </div>
      </Card>

      <Card>
        <CardHeader title="Cost Overruns by Sector — Planned vs Actual Spend (USD Millions)" subtitle="Grey = planned, coloured = actual" />
        <div className="p-4 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={OVERRUN_BY_SECTOR}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="sector" stroke="#94a3b8" fontSize={9.5} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${v}M`} />
              <Tooltip {...tt} formatter={(v: number, n) => [`USD ${v}M`, n]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="planned" name="Planned Budget" fill="#e2e8f0" radius={[3,3,0,0]} />
              <Bar dataKey="actual" name="Actual / Projected" fill={C.red} radius={[3,3,0,0]} fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function QualityOfLifeTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StoryCard title="Hospital Wait Time" value="6.4 hrs" sub="🔴 Target < 2 hrs. Medicines stockout 62% rate" color="bg-red-800" icon={Stethoscope} />
        <StoryCard title="Electricity Uptime (ZESA)" value="54%" sub="🔴 46% of time = load shedding. Dev impact critical" color="bg-red-700" icon={Zap} />
        <StoryCard title="Clean Water Access (rural)" value="38%" sub="🔴 62% of rural pop unserved — source of disease" color="bg-[#0F172A]" icon={Droplets} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StoryCard title="Pupil-to-Teacher Ratio" value="48:1" sub="🟡 Recommended: 30:1. 46M learners affected" color="bg-[#0F172A]" icon={BookOpen} />
        <StoryCard title="Roads in Good Condition" value="41%" sub="🟡 59% below standard — 3× vehicle maintenance cost" color="bg-[#0F172A]" icon={Truck} />
        <StoryCard title="Govt Machinery Operational" value="34%" sub="🔴 66% idle — needs parts, maintenance budget" color="bg-red-700" icon={Wrench} />
      </div>

      <Card>
        <CardHeader title="🌍 Quality of Life Metrics vs Benchmarks — THE REAL HUMAN IMPACT OF PROCUREMENT FAILURES"
          subtitle="Where procurement money should go — and what happens when it doesn't" />
        <div className="divide-y divide-black/5">
          {QOL_METRICS.map(m => (
            <div key={m.metric} className={`px-4 py-4 ${m.severity === "critical" ? "bg-red-50/30" : m.severity === "high" ? "bg-slate-50/20" : ""}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1">
                  <div className="text-xs font-bold text-black">{m.metric}</div>
                  <div className="text-[10px] text-black/50 mt-0.5">Benchmark: {m.benchmark}</div>
                </div>
                <div className="text-right">
                  <div className={`text-base font-black ${m.severity === "critical" ? "text-red-600" : m.severity === "high" ? "text-[#0F172A]" : "text-[#0F172A]"}`}>
                    {m.value}
                  </div>
                  <div className="text-[10px] text-black/40">{m.trend === "worsening" ? "📉 Worsening" : m.trend === "improving" ? "📈 Improving" : "→ Stable"}</div>
                </div>
              </div>
              <div className={`text-[11px] font-semibold px-2 py-1 rounded-lg inline-block
                ${m.severity === "critical" ? "bg-red-100 text-red-700" : m.severity === "high" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>
                Gap: {m.gap}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PriceIndicesTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StoryCard title="Infrastructure Price Index" value="+22%" sub="Since Jan 2026 — 6 months only" color="bg-red-700" icon={TrendingUp} />
        <StoryCard title="Cement Price Increase" value="+33%" sub="From USD 8.40 → 11.20 per bag" color="bg-[#0F172A]" icon={TrendingUp} />
        <StoryCard title="Drug/Pharma Price Change" value="+8%" sub="Still within procurement threshold" color="bg-[#0F172A]" icon={Activity} />
        <StoryCard title="Fuel Price Change (Jan→Jun)" value="+11%" sub="USD 1.18 → 1.31 per litre" color="bg-[#0F172A]" icon={Fuel} />
      </div>

      <Card>
        <CardHeader title="📈 Price Inflation Index by Sector — Jan 2026 = 100" subtitle="Procurement cost pressure — rising prices = less for same budget" />
        <div className="p-4 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={PRICE_TREND_6M}>
              <CartesianGrid stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[95, 130]} tickFormatter={v => `${v}`} />
              <Tooltip {...tt} formatter={(v: number, n) => [`Index: ${v}`, n]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="2 2" label={{ value: "Base (Jan)", fontSize: 9 }} />
              <Line type="monotone" dataKey="infrastructure" name="Infrastructure" stroke={C.red} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="health" name="Health/Pharma" stroke={C.blue} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="education" name="Education" stroke={C.green} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="fuel" name="Fuel" stroke={C.amber} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="ict" name="ICT" stroke={C.violet} strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader title="Key Goods & Services — Price Availability Tracking" subtitle="Government procurement benchmark items — Jan vs Jun 2026" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f8f9fa] text-xs text-black/50">
              <tr>{["Item","Unit","Jan 2026","Jun 2026","Change","Availability Note"].map(h => <th key={h} className="px-3 py-2.5 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {PRICE_INDEX.map(p => (
                <tr key={p.item} className={`hover:bg-gray-50 ${p.change > 25 ? "bg-red-50/20" : p.change > 10 ? "bg-slate-50/20" : ""}`}>
                  <td className="px-3 py-2.5 font-semibold text-xs text-black">{p.item}</td>
                  <td className="px-3 py-2.5 text-[11px] text-black/50">{p.unit}</td>
                  <td className="px-3 py-2.5 text-xs text-black/60">{p.jan}</td>
                  <td className="px-3 py-2.5 text-xs font-bold text-black">{p.jun}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs font-black ${p.change > 25 ? "text-red-600" : p.change > 10 ? "text-[#0F172A]" : "text-[#0F172A]"}`}>
                      +{p.change}%
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[10px] text-black/50 italic">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 pb-4 text-xs text-red-700 bg-red-50 mx-4 mb-4 rounded-xl p-3 font-medium mt-2">
          🔴 Infrastructure input prices rising 22–34% in 6 months will erode 2026 project budgets significantly.
          Ministries must re-evaluate budget sufficiency or scope will be cut. Chlorine shortage directly threatens water treatment at 27 plants.
        </div>
      </Card>
    </div>
  );
}

function RiskDashboardTab() {
  const criticalRisks = RISK_TRIGGERS.filter(r => r.impact === "Critical");
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StoryCard title="Critical Risk Triggers Active" value={String(criticalRisks.length)} sub="Require immediate intervention" color="bg-red-900" icon={AlertOctagon} />
        <StoryCard title="Escalated Investigations" value="2" sub="Referred to ZACC / AG" color="bg-red-700" icon={ShieldAlert} />
        <StoryCard title="Risk Breakers Fully Implemented" value="3/8" sub="37.5% — most still in pilot or planning" color="bg-[#0F172A]" icon={Target} />
        <StoryCard title="Projects on Critical Risk Register" value="4" sub="Total exposure: USD 186M" color="bg-[#0F172A]" icon={AlertTriangle} />
      </div>

      {/* Risk matrix scatter */}
      <Card>
        <CardHeader title="🎯 Risk Heat Map — Likelihood vs Impact" subtitle="Each bubble = active procurement risk (size = estimated financial exposure)" />
        <div className="p-4 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid stroke="#f1f5f9" />
              <XAxis type="number" dataKey="x" name="Likelihood" domain={[0, 5]} stroke="#94a3b8" fontSize={10} tickLine={false}
                label={{ value: "Likelihood →", position: "bottom", fontSize: 10, fill: "#94a3b8" }} />
              <YAxis type="number" dataKey="y" name="Impact" domain={[0, 5]} stroke="#94a3b8" fontSize={10} tickLine={false}
                label={{ value: "Impact ↑", angle: -90, position: "left", fontSize: 10, fill: "#94a3b8" }} />
              <ZAxis type="number" dataKey="z" range={[40, 400]} />
              <Tooltip {...tt} cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => active && payload?.[0] ? (
                  <div className="bg-[#0f172a] text-white text-[11px] p-2 rounded-lg border border-white/10">
                    <div className="font-bold">{(payload[0].payload as { name: string }).name}</div>
                    <div>Likelihood: {payload[0].payload.x}/5 · Impact: {payload[0].payload.y}/5</div>
                  </div>
                ) : null} />
              <Scatter data={[
                { x: 4, y: 5, z: 312, name: "Inflated Contracts", fill: C.red },
                { x: 3, y: 5, z: 142, name: "Spec Tailoring", fill: C.red },
                { x: 4, y: 4, z: 84, name: "Bid Rigging", fill: C.red },
                { x: 3, y: 4, z: 98, name: "Procurement Method Abuse", fill: C.orange },
                { x: 2, y: 5, z: 186, name: "Project Cost Overruns", fill: C.orange },
                { x: 3, y: 3, z: 28, name: "Ghost Vendors", fill: C.amber },
                { x: 4, y: 3, z: 22, name: "Fuel Theft", fill: C.amber },
                { x: 2, y: 4, z: 64, name: "PEP Conflicts", fill: C.red },
                { x: 1, y: 5, z: 498, name: "Ministry Budget Overrun", fill: C.violet },
                { x: 4, y: 2, z: 19, name: "Duplicate Payments", fill: C.blue },
              ].map(d => ({ ...d }))} fill="#DC2626" fillOpacity={0.7} name="Risks">
                {[C.red, C.red, C.red, C.orange, C.orange, C.amber, C.amber, C.red, C.violet, C.blue].map((fill, i) => (
                  <Cell key={i} fill={fill} fillOpacity={0.75} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Summary insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { title: "🔴 Top 3 Unresolved Critical Risks", items: ["Inflated contract pricing — USD 312M annual exposure", "Spec tailoring for preferred bidders — 67 active cases, +41% YoY", "Ministry budget overruns — Water & Agriculture, USD 498M combined"], color: "border-red-200 bg-red-50" },
          { title: "🟡 Risk Triggers to Monitor", items: ["Contract variations >25% — 28 active instances", "Single-source >40% of budget — 14 ministries", "Last-minute bids (<24hrs) — 42 suspicious patterns"], color: "border-slate-200 bg-slate-50" },
          { title: "🟢 What Must Be Done Now", items: ["Complete 3-way invoice matching across ALL ministries", "GPS/RFID asset tracking — stop the USD 38M idle machinery loss", "Beneficial ownership disclosure — 8 PEP cases need full investigation"], color: "border-slate-200 bg-slate-50" },
        ].map(panel => (
          <div key={panel.title} className={`border rounded-2xl p-4 ${panel.color}`}>
            <div className="text-xs font-bold text-black mb-3">{panel.title}</div>
            <ul className="space-y-2">
              {panel.items.map(item => (
                <li key={item} className="text-xs text-black/70 flex items-start gap-1.5">
                  <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0 text-black/40" />{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE (with AppShell — standalone route)
// ═══════════════════════════════════════════════════════════════════════════
export default function BIDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("National Spend Story");
  const navigate = useNavigate();

  const TAB_ICONS: Record<Tab, React.ElementType> = {
    "National Spend Story":  DollarSign,
    "Budget Performance":    BarChart3,
    "Revenue & Economy":     Globe2,
    "Shortages & Wastage":   Package,
    "Corruption & Risk":     ShieldAlert,
    "Supplier & Contractor": Users,
    "Projects & Development": Building2,
    "Quality of Life Impact": Stethoscope,
    "Price Indices":         TrendingUp,
    "Risk Dashboard":        AlertOctagon,
    "Geography Map":         Globe2,
    "Budget Intelligence":   BarChart3,
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Budget Intelligence"
        process="BI Dashboard"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge tone="red">🚨 Sensitive Intelligence</Badge>
            <Badge tone="amber">FY 2026 Data</Badge>
            <Badge tone="muted">Government of Zimbabwe — Ai Powered e-Government Procurement & Automated Oversight Intelligence System</Badge>
          </div>
          <PageHeader
            title="National Procurement Intelligence Dashboard"
            description="The real story behind Zimbabwe's public spending — budgets, overruns, shortages, corruption, risks, prices, quality of life, and what must change. Data that must not stay buried."
            actions={
              <button onClick={() => { pushNotification("BI Report exported — PDF/Excel ready in downloads.", "success"); }}
                className="h-9 px-4 rounded-xl bg-[#0f172a] text-white text-sm font-semibold hover:bg-black flex items-center gap-1.5">
                Export Full Report
              </button>
            }
          />
        </div>

        {/* Tab bar */}
        <div className="flex gap-0.5 mb-6 border-b border-border overflow-x-auto pb-0 scrollbar-none">
          {TABS.map(tab => {
            const Icon = TAB_ICONS[tab];
            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 -mb-px whitespace-nowrap flex-shrink-0 transition-colors
                  ${activeTab === tab ? "border-[#2563eb] text-[#2563eb]" : "border-transparent text-black/50 hover:text-black hover:border-black/20"}`}>
                <Icon className="h-3.5 w-3.5" />
                {tab}
              </button>
            );
          })}
        </div>

        {/* Tab content + right ticker strip */}
        <div className="flex gap-4 items-start">
          <div className="flex-1 min-w-0">
            {activeTab === "National Spend Story"    && <NationalSpendTab />}
            {activeTab === "Budget Performance"      && <BudgetPerformanceTab />}
            {activeTab === "Revenue & Economy"       && <RevenueEconomyTab />}
            {activeTab === "Shortages & Wastage"     && <ShortagesWastageTab />}
            {activeTab === "Corruption & Risk"       && <CorruptionRiskTab />}
            {activeTab === "Supplier & Contractor"   && <SupplierContractorTab />}
            {activeTab === "Projects & Development"  && <ProjectsDevelopmentTab />}
            {activeTab === "Quality of Life Impact"  && <QualityOfLifeTab />}
            {activeTab === "Price Indices"           && <PriceIndicesTab />}
            {activeTab === "Risk Dashboard"          && <RiskDashboardTab />}
            {activeTab === "Geography Map"           && <ZimbabweMapTab theme="dark" />}
            {activeTab === "Budget Intelligence"     && <div className="h-full min-h-[600px]"><BudgetIntelligenceCentre /></div>}
          </div>

          {/* Sticky live KPI ticker — right rail */}
          <div className="hidden xl:flex flex-col w-60 flex-shrink-0 sticky top-4 bg-[#0f172a] rounded-2xl overflow-hidden border border-white/8 shadow-xl" style={{ height: "calc(100vh - 180px)" }}>
            <div className="px-3 py-2.5 border-b border-white/10 flex-shrink-0">
              <div className="text-[10px] font-bold text-[#2563eb] uppercase tracking-widest flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] animate-pulse" />
                Live National KPIs
              </div>
              <div className="text-[9px] text-white/30 mt-0.5">Hover to pause · 50+ indicators</div>
            </div>
            <KpiScrollTicker theme="dark" height="100%" speed={0.7} showCategory />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EMBEDDED EXPORT — used by BriefingPage ExecutiveBITab (no AppShell)
// ═══════════════════════════════════════════════════════════════════════════
export function BIContent() {
  const [activeTab, setActiveTab] = useState<Tab>("National Spend Story");

  const TAB_ICONS: Record<Tab, React.ElementType> = {
    "National Spend Story":  DollarSign,
    "Budget Performance":    BarChart3,
    "Revenue & Economy":     Globe2,
    "Shortages & Wastage":   Package,
    "Corruption & Risk":     ShieldAlert,
    "Supplier & Contractor": Users,
    "Projects & Development": Building2,
    "Quality of Life Impact": Stethoscope,
    "Price Indices":         TrendingUp,
    "Risk Dashboard":        AlertOctagon,
    "Geography Map":         Globe2,
    "Budget Intelligence":   BarChart3,
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-[#EAF1F8]">
      {/* Tab bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-2 flex gap-0 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = TAB_ICONS[tab];
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold border-b-2 -mb-px whitespace-nowrap flex-shrink-0 transition-colors
                ${activeTab === tab ? "border-[#2563eb] text-[#2563eb]" : "border-transparent text-black/50 hover:text-black hover:border-black/20"}`}>
              <Icon className="h-3.5 w-3.5" />
              {tab}
            </button>
          );
        })}
      </div>

      {/* Scrollable content + right ticker */}
      <div className="flex flex-1 min-h-0 overflow-hidden gap-0">
        <div className="flex-1 overflow-y-auto p-4 min-w-0">
          {activeTab === "National Spend Story"    && <NationalSpendTab />}
          {activeTab === "Budget Performance"      && <BudgetPerformanceTab />}
          {activeTab === "Revenue & Economy"       && <RevenueEconomyTab />}
          {activeTab === "Shortages & Wastage"     && <ShortagesWastageTab />}
          {activeTab === "Corruption & Risk"       && <CorruptionRiskTab />}
          {activeTab === "Supplier & Contractor"   && <SupplierContractorTab />}
          {activeTab === "Projects & Development"  && <ProjectsDevelopmentTab />}
          {activeTab === "Quality of Life Impact"  && <QualityOfLifeTab />}
          {activeTab === "Price Indices"           && <PriceIndicesTab />}
          {activeTab === "Risk Dashboard"          && <RiskDashboardTab />}
          {activeTab === "Geography Map"           && <ZimbabweMapTab theme="dark" />}
          {activeTab === "Budget Intelligence"     && <div className="min-h-[600px]"><BudgetIntelligenceCentre /></div>}
        </div>

        {/* Right KPI ticker rail */}
        <div className="hidden xl:flex flex-col w-56 flex-shrink-0 bg-[#0f172a] border-l border-white/5" style={{ minHeight: 0 }}>
          <div className="px-3 py-2.5 border-b border-white/10 flex-shrink-0">
            <div className="text-[10px] font-bold text-[#2563eb] uppercase tracking-widest flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] animate-pulse" />
              Live KPIs
            </div>
          </div>
          <KpiScrollTicker theme="dark" height="100%" speed={0.7} showCategory />
        </div>
      </div>
    </div>
  );
}


