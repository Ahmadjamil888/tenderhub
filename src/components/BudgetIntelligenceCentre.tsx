import { useState } from "react";
import {
  Volume2, VolumeX, AlertTriangle, ChevronDown,
  TrendingUp, TrendingDown, Layers, FolderOpen,
  Hammer, ShoppingCart, Wrench, Star, Eye,
  BookOpen, Shield, Globe, Flag, Target,
  ChevronUp, EyeOff, Printer, Download, Share2,
  CheckCircle2, Clock, User, PenLine,
} from "lucide-react";
import { SuppliesTab as SuppliesScheduleTab } from "@/components/budget/SuppliesTab";
import { WorksTab as WorksScheduleTab } from "@/components/budget/WorksTab";
import { ServicesTab as ServicesScheduleTab } from "@/components/budget/ServicesTab";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

// ── Constants ──────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ── Budget Module top-level tabs ───────────────────────────────────────────
const BUDGET_MODULE_TABS = [
  { key: "consolidated",   label: "Consolidated Budget",        icon: Layers },
  { key: "projects",       label: "Projects",                   icon: FolderOpen },
  { key: "supplies",       label: "Supplies",                   icon: ShoppingCart },
  { key: "works",          label: "Works",                      icon: Hammer },
  { key: "services",       label: "Services",                   icon: Wrench },
  { key: "priorities",     label: "National Priorities",        icon: Star },
  { key: "vision2030",     label: "Vision 2030",                icon: Eye },
  { key: "ndp",            label: "National Development Plan",  icon: BookOpen },
  { key: "affirmative",    label: "Affirmative Action",         icon: Shield },
  { key: "sdg",            label: "Sustainable Dev. Goals",     icon: Globe },
  { key: "strategy",       label: "National Strategy",          icon: Target },
  { key: "manifesto",      label: "Party Manifesto",            icon: Flag },
] as const;
type BudgetModuleTab = (typeof BUDGET_MODULE_TABS)[number]["key"];

// ── Financial statement sub-tabs — Section 8.1 approved naming ──────────────
const TABS = [
  "Consolidated Cash Flow",
  "Operations",
  "Supplies",
  "Works",
  "Services",
] as const;
type Tab = (typeof TABS)[number];

const FIN_YEARS   = ["All Years",  "FY2026","FY2025","FY2024","FY2023"];
const MINISTRIES  = ["All Ministries","Finance","Health","Education","Transport","Energy","Agriculture","Water","ICT","Home Affairs"];
const DEPARTMENTS = [
  "All Departments",
  "Medical Stores",
  "Finance Department",
  "Procurement",
  "Infrastructure Division",
  "Roads & Bridges",
  "Primary Education",
  "Treasury Operations",
  "Revenue Authority",
  "Pharmaceutical Div",
  "Roads Dept",
  "Primary Schools",
  "ICT Infrastructure",
  "Water Utilities",
];
// SOE filter — SOEs and SPVs listed together under "SOE" label
const SOE_OPTIONS = [
  "All SOE",
  "─── SOEs ───",
  "ZESA Holdings",
  "NetOne Cellular",
  "Air Zimbabwe",
  "ZINARA",
  "NRZ (National Railways)",
  "ZUPCO",
  "Telecel Zimbabwe",
  "POSB (People's Own Savings Bank)",
  "Infrastructure Development Bank (IDBZ)",
  "ZB Financial Holdings",
  "─── SPVs ───",
  "Kuvimba Mining House",
  "Mutapa Investment Fund",
  "Zimbabwe Consolidated Diamond Company (ZCDC)",
  "Great Dyke Investments",
  "Zimbabwe Iron & Steel Company (ZISCO)",
];
// Unit (formerly Cell)
const UNIT_OPTIONS = ["All Units","Capital Projects","Recurrent Expenditure","Personnel","Grants","Transfers","Debt Service"];

const BRIEFINGS: Record<Tab, string> = {
  "Consolidated Cash Flow": "⚠ Revenue inflows at 82% of target. Donor Funds shortfall of USD 14M requires escalation. Cash position tightening — June outflows exceeded inflows by USD 46M. Treasury action required.",
  "Operations":             "✓ Operations expenditure on track. Personnel emoluments within approved limits. Goods & Services at 78% utilisation.",
  "Supplies":               "⚠ Supplies procurement spend at 94% of budget with 5 months remaining. 3 supply categories approaching threshold.",
  "Works":                  "🔴 HAZARD: Capital Works 108% consumed. Beitbridge Highway project over-run by USD 12M. Immediate Accounting Officer review required.",
  "Services":               "✓ Services expenditure within approved limits. 3 consulting contracts approaching renewal — action required by HOD.",
};

const ALERT_MODE: Record<Tab, boolean> = {
  "Consolidated Cash Flow": true,
  "Operations": false,
  "Supplies": true,
  "Works": true,
  "Services": false,
};

// ── Formatting helpers ─────────────────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtNeg(n: number): string {
  // outflows shown as (3,333.00) in red
  return `(${fmt(Math.abs(n))})`;
}

// ── Income Statement data ──────────────────────────────────────────────────
const IS_INFLOWS = [
  { label: "Government Allocation", annual: 20_000_000, monthly: 1_666_667 },
  { label: "Donor Funds",           annual: 800_000,    monthly: 66_667    },
  { label: "Income Subscriptions",  annual: 200_000,    monthly: 16_667    },
];
const IS_TOTAL_INFLOWS  = { annual: 21_000_000, monthly: 1_750_000 };
const IS_OUTFLOWS = [
  { label: "Rent",               annual: -40_000,      monthly: -3_333    },
  { label: "Admin Costs",        annual: -65_000,      monthly: -5_417    },
  { label: "Salaries",           annual: -1_200_000,   monthly: -100_000  },
  { label: "ICT & Systems",      annual: -180_000,     monthly: -15_000   },
  { label: "Capital Projects",   annual: -4_800_000,   monthly: -400_000  },
  { label: "Procurement Spend",  annual: -8_400_000,   monthly: -700_000  },
  { label: "Debt Servicing",     annual: -960_000,     monthly: -80_000   },
];
const IS_TOTAL_OUTFLOWS = { annual: -15_645_000, monthly: -1_303_750 };
const IS_NET_POSITION   = { annual:   5_355_000, monthly:    446_250 };

// ── Balance Sheet data ─────────────────────────────────────────────────────
const BS_ASSETS = [
  { label: "Cash & Cash Equivalents", annual: 284_000_000, monthly: 0 },
  { label: "Accounts Receivable",     annual: 124_000_000, monthly: 0 },
  { label: "Inventory & Stores",      annual:  48_000_000, monthly: 0 },
  { label: "Fixed Assets (Net)",      annual: 980_000_000, monthly: 0 },
  { label: "Capital Work in Progress",annual: 210_000_000, monthly: 0 },
];
const BS_TOTAL_ASSETS = { annual: 1_646_000_000, monthly: 0 };
const BS_LIABILITIES = [
  { label: "Accounts Payable",        annual: -96_000_000,  monthly: 0 },
  { label: "Short-term Borrowings",   annual: -120_000_000, monthly: 0 },
  { label: "Long-term Debt",          annual: -480_000_000, monthly: 0 },
  { label: "Deferred Revenue",        annual: -42_000_000,  monthly: 0 },
];
const BS_TOTAL_LIABILITIES = { annual: -738_000_000, monthly: 0 };
const BS_EQUITY = { annual: 908_000_000, monthly: 0 };

// ── Cash Flow data ─────────────────────────────────────────────────────────
const CF_INFLOWS = [
  { label: "Tax Receipts",            annual: 6_200_000_000, monthly: 516_666_667 },
  { label: "Donor Receipts",          annual: 480_000_000,   monthly: 40_000_000  },
  { label: "Loan Proceeds",           annual: 960_000_000,   monthly: 80_000_000  },
  { label: "SOE Dividends Received",  annual: 98_000_000,    monthly: 8_166_667   },
];
const CF_TOTAL_INFLOWS  = { annual: 7_738_000_000, monthly: 644_833_333 };
const CF_OUTFLOWS = [
  { label: "Personnel Costs",         annual: -2_256_000_000, monthly: -188_000_000 },
  { label: "Capital Expenditure",     annual: -1_240_000_000, monthly: -103_333_333 },
  { label: "Recurrent Expenditure",   annual: -980_000_000,   monthly: -81_666_667  },
  { label: "Debt Repayments",         annual: -520_000_000,   monthly: -43_333_333  },
  { label: "Grants & Transfers",      annual: -324_000_000,   monthly: -27_000_000  },
];
const CF_TOTAL_OUTFLOWS = { annual: -5_320_000_000, monthly: -443_333_333 };
const CF_NET_POSITION   = { annual:  2_418_000_000, monthly:  201_500_000 };

// ── Budget Variance data ───────────────────────────────────────────────────
interface VarianceRow {
  label: string;
  approved: number;
  revised: number;
  actuals: number[];   // 12 months
}

const BV_ROWS: VarianceRow[] = [
  { label: "Government Allocation", approved: 20_000_000, revised: 20_000_000,
    actuals: [1_400_000,1_600_000,1_700_000,1_650_000,1_750_000,1_800_000,1_666_667,1_666_667,1_666_667,1_666_667,1_666_667,1_666_667] },
  { label: "Donor Funds",           approved: 800_000,    revised: 720_000,
    actuals: [50_000,60_000,55_000,60_000,65_000,70_000,60_000,58_000,55_000,60_000,62_000,65_000] },
  { label: "Salaries",              approved: -1_200_000, revised: -1_200_000,
    actuals: [-100_000,-100_000,-100_000,-100_000,-100_000,-100_000,-100_000,-100_000,-100_000,-100_000,-100_000,-100_000] },
  { label: "Capital Projects",      approved: -4_800_000, revised: -5_000_000,
    actuals: [-380_000,-420_000,-450_000,-480_000,-520_000,-560_000,-400_000,-400_000,-400_000,-400_000,-400_000,-390_000] },
  { label: "Procurement Spend",     approved: -8_400_000, revised: -8_400_000,
    actuals: [-650_000,-680_000,-700_000,-720_000,-750_000,-800_000,-700_000,-700_000,-700_000,-700_000,-700_000,-700_000] },
  { label: "Debt Servicing",        approved: -960_000,   revised: -960_000,
    actuals: [-80_000,-80_000,-80_000,-80_000,-80_000,-80_000,-80_000,-80_000,-80_000,-80_000,-80_000,-80_000] },
  { label: "ICT & Systems",         approved: -180_000,   revised: -200_000,
    actuals: [-14_000,-15_000,-16_000,-17_000,-18_000,-20_000,-15_000,-15_000,-15_000,-15_000,-15_000,-15_000] },
  { label: "Admin Costs",           approved: -65_000,    revised: -65_000,
    actuals: [-5_200,-5_400,-5_500,-5_300,-5_400,-5_600,-5_417,-5_417,-5_417,-5_417,-5_417,-5_515] },
];

// monthly bar/line chart data for variance tab
const BV_CHART_DATA = MONTHS.map((month, i) => {
  const approvedBudget = BV_ROWS.reduce((sum, r) => sum + Math.abs(r.approved) / 12, 0);
  const revisedBudget  = BV_ROWS.reduce((sum, r) => sum + Math.abs(r.revised)  / 12, 0);
  const actual = BV_ROWS.reduce((sum, r) => sum + Math.abs(r.actuals[i]), 0);
  return { month, approved: Math.round(approvedBudget), revised: Math.round(revisedBudget), actual: Math.round(actual) };
});

// cumulative for line chart
let cumApproved = 0, cumRevised = 0, cumActual = 0;
const BV_CUMULATIVE = BV_CHART_DATA.map(d => {
  cumApproved += d.approved;
  cumRevised  += d.revised;
  cumActual   += d.actual;
  return { month: d.month, cumApproved, cumRevised, cumActual };
});

// ── Shared sub-components ──────────────────────────────────────────────────

function FilterDropdown({
  label, value, options, onChange,
}: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative flex items-center">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-8 py-1.5 text-xs font-medium text-gray-700 cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0F172A]/20 focus:border-slate-200"
      >
        {options.map(o => {
          const isSeparator = o.startsWith("───");
          return (
            <option key={o} value={o} disabled={isSeparator}
              style={isSeparator ? { color: "#9ca3af", fontStyle: "italic", backgroundColor: "#f3f4f6" } : undefined}>
              {o}
            </option>
          );
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-gray-400" />
    </div>
  );
}

// Radio button for filter focus selection
function FilterRadio({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all ${
        checked
          ? "bg-[#0f172a] text-white border-[#0f172a]"
          : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
      }`}
    >
      <span className={`h-2.5 w-2.5 rounded-full border-2 flex-shrink-0 ${checked ? "border-white bg-white" : "border-gray-400"}`} />
      {label}
    </button>
  );
}

// Signature block component for forms
export function SignatureBlock() {
  return (
    <div className="border-t-2 border-gray-200 mt-6 pt-5">
      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Authorisation Signatures</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { role: "Reviewed By", color: "border-blue-200 bg-blue-50" },
          { role: "Approved By", color: "border-emerald-200 bg-emerald-50" },
          { role: "Authorized By", color: "border-[#0f172a]/20 bg-slate-50" },
        ].map(sig => (
          <div key={sig.role} className={`border rounded-xl p-3 ${sig.color}`}>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{sig.role}</div>
            <div className="space-y-1.5">
              {["Name", "Position", "Department", "Role / Authority"].map(f => (
                <div key={f} className="border border-gray-200 rounded bg-white px-2 py-1.5">
                  <div className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">{f}</div>
                  <div className="text-xs text-gray-800 min-h-[14px]">—</div>
                </div>
              ))}
              <div className="border border-gray-200 rounded bg-white px-2 py-1.5">
                <div className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">Date & Time</div>
                <div className="text-xs text-gray-800">{new Date().toLocaleDateString("en-ZW", { day: "2-digit", month: "short", year: "numeric" })}</div>
              </div>
              <div className="border-t border-dashed border-gray-300 mt-2 pt-2">
                <div className="text-[9px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Electronic Signature</div>
                <div className="h-8 border border-dashed border-gray-300 rounded bg-white flex items-center justify-center">
                  <PenLine className="h-3.5 w-3.5 text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Workflow action footer
export function WorkflowFooter({
  onBack, onNext, onSubmit, onApprove, onAuthorize, onEscalate, onReturn,
  onPrint, onDownload, onShare,
  step, totalSteps, label = "Next",
}: {
  onBack?: () => void; onNext?: () => void; onSubmit?: () => void;
  onApprove?: () => void; onAuthorize?: () => void;
  onEscalate?: () => void; onReturn?: () => void;
  onPrint?: () => void; onDownload?: () => void; onShare?: () => void;
  step?: number; totalSteps?: number; label?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-200">
      <div className="flex items-center gap-2">
        {onBack     && <button onClick={onBack}     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"><ChevronDown className="h-3.5 w-3.5 rotate-90" />Back</button>}
        {onReturn   && <button onClick={onReturn}   className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50">↩ Return</button>}
        {onEscalate && <button onClick={onEscalate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100">↑ Escalate</button>}
        {onPrint    && <button onClick={onPrint}    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"><Printer className="h-3.5 w-3.5" />Print</button>}
        {onDownload && <button onClick={onDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"><Download className="h-3.5 w-3.5" />Download</button>}
        {onShare    && <button onClick={onShare}    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50"><Share2 className="h-3.5 w-3.5" />Share</button>}
      </div>
      <div className="flex items-center gap-2">
        {step !== undefined && totalSteps !== undefined && (
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Step {step + 1} of {totalSteps}</span>
        )}
        {onApprove   && <button onClick={onApprove}   className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"><CheckCircle2 className="h-3.5 w-3.5" />Approve</button>}
        {onAuthorize && <button onClick={onAuthorize} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold"><User className="h-3.5 w-3.5" />Authorize</button>}
        {onNext      && <button onClick={onNext}      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold">{label}<ChevronDown className="h-3.5 w-3.5 -rotate-90" /></button>}
        {onSubmit    && <button onClick={onSubmit}    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"><CheckCircle2 className="h-3.5 w-3.5" />Submit</button>}
      </div>
    </div>
  );
}

type FilterFocus = "ministry" | "department" | "soe" | "unit";

function FiltersBar({
  year, ministry, department, soe, cell,
  setYear, setMinistry, setDepartment, setSoe, setCell,
  collapsed, onToggle,
}: {
  year: string; ministry: string; department: string; soe: string; cell: string;
  setYear: (v: string) => void; setMinistry: (v: string) => void;
  setDepartment: (v: string) => void; setSoe: (v: string) => void; setCell: (v: string) => void;
  collapsed: boolean; onToggle: () => void;
}) {
  const [focus, setFocus] = useState<FilterFocus>("ministry");

  if (collapsed) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Filters</span>
        <span className="text-[10px] text-gray-400">— {ministry} · {department} · {soe} · {cell} · {year}</span>
        <button onClick={onToggle} className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 rounded px-2 py-0.5">
          <Eye className="h-3 w-3" /> Show Filters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 shrink-0">
      {/* Row 1: all filters + year in one row */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mr-1">Filters:</span>
        {/* Ministry */}
        <div className="flex flex-col gap-0.5">
          <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-0.5">Ministry</div>
          <FilterDropdown label="Ministry" value={ministry} options={MINISTRIES} onChange={setMinistry} />
        </div>
        {/* Department */}
        <div className="flex flex-col gap-0.5">
          <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-0.5">Department</div>
          <FilterDropdown label="Department" value={department} options={DEPARTMENTS} onChange={setDepartment} />
        </div>
        {/* SOE */}
        <div className="flex flex-col gap-0.5">
          <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-0.5">SOE</div>
          <FilterDropdown label="SOE" value={soe} options={SOE_OPTIONS} onChange={setSoe} />
        </div>
        {/* Unit */}
        <div className="flex flex-col gap-0.5">
          <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-0.5">Unit</div>
          <FilterDropdown label="Unit" value={cell} options={UNIT_OPTIONS} onChange={setCell} />
        </div>
        {/* Year — no radio button needed */}
        <div className="flex flex-col gap-0.5">
          <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 px-0.5">Year</div>
          <FilterDropdown label="Year" value={year} options={FIN_YEARS} onChange={setYear} />
        </div>
        {/* Reset + Hide */}
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => { setMinistry(MINISTRIES[0]); setDepartment(DEPARTMENTS[0]); setSoe(SOE_OPTIONS[0]); setCell(UNIT_OPTIONS[0]); }}
            className="text-[10px] font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 rounded px-2 py-1">
            Reset All
          </button>
          <button onClick={onToggle} className="flex items-center gap-1 text-[10px] font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 rounded px-2 py-1">
            <EyeOff className="h-3 w-3" /> Hide
          </button>
        </div>
      </div>
      {/* Row 2: radio buttons for report focus (Ministry / Department / SOE / Unit) */}
      <div className="flex items-center gap-2 px-4 pb-2">
        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mr-1">Report Focus:</span>
        <FilterRadio label="Ministry"   checked={focus === "ministry"}   onChange={() => setFocus("ministry")} />
        <FilterRadio label="Department" checked={focus === "department"} onChange={() => setFocus("department")} />
        <FilterRadio label="SOE"        checked={focus === "soe"}        onChange={() => setFocus("soe")} />
        <FilterRadio label="Unit"       checked={focus === "unit"}       onChange={() => setFocus("unit")} />
        <span className="ml-2 text-[9px] text-gray-400">— prints one report at a time based on selection</span>
      </div>
    </div>
  );
}

interface StatementHeaderProps {
  ministry: string;
  department: string;
  year: string;
  tabName: string;
}

function StatementHeader({ ministry, department, year, tabName }: StatementHeaderProps) {
  const TAB_TITLE_MAP: Record<string, string> = {
    "Consolidated Cash Flow": "CONSOLIDATED CASH FLOW STATEMENT",
    "Operations":             "OPERATIONS BUDGET",
    "Supplies":               "SUPPLIES PROCUREMENT BUDGET",
    "Works":                  "WORKS PROGRAMME BUDGET",
    "Services":               "SERVICES PROCUREMENT BUDGET",
  };
  const statementTitle = TAB_TITLE_MAP[tabName] ?? `BUDGET MODULE — ${tabName.toUpperCase()}`;

  return (
    <div className="bg-[#0f172a] text-white px-6 py-4 text-center">
      <div className="text-sm font-black uppercase tracking-[0.15em] text-white">
        GOVERNMENT OF THE REPUBLIC OF ZIMBABWE
      </div>
      <div className="mt-1 text-xs text-slate-400 font-semibold tracking-wide">
        {ministry}
      </div>
      <div className="text-xs text-slate-400 underline underline-offset-2 cursor-pointer mt-0.5">
        {department}
      </div>
      <div className="mt-2 text-[11px] font-bold uppercase tracking-widest text-white/80">
        {statementTitle} — FINANCIAL YEAR {year === "All Years" ? "FY2026" : year}
      </div>
    </div>
  );
}

// ── Financial statement table ──────────────────────────────────────────────
interface TableRow {
  label: string;
  annual: number;
  monthly: number;
  isNegative?: boolean;   // outflow
  isTotal?: boolean;
  isSectionHeader?: boolean;
  sectionType?: "inflows" | "outflows";
  isNetPosition?: boolean;
}

function FinancialTable({ rows, tableLabel }: { rows: TableRow[]; tableLabel: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse min-w-[1100px]">
        <thead>
          <tr className="bg-[#1a6b3a] text-white">
            <th className="px-4 py-2.5 text-left font-bold uppercase tracking-wider w-56 border-r border-slate-200">
              {tableLabel}
            </th>
            <th className="px-3 py-2.5 text-right font-bold uppercase tracking-wider border-r border-slate-200 w-32">
              Annual Total
            </th>
            {MONTHS.map(m => (
              <th key={m} className="px-2 py-2.5 text-right font-bold w-20 border-r border-slate-200 last:border-r-0">
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            if (row.isSectionHeader) {
              const bg   = row.sectionType === "inflows"  ? "bg-slate-50"  : "bg-red-50";
              const text = row.sectionType === "inflows"  ? "text-[#0F172A]" : "text-red-700";
              return (
                <tr key={i} className={`${bg} border-b border-gray-200`}>
                  <td colSpan={14} className={`px-4 py-2 font-black uppercase text-[11px] tracking-widest ${text}`}>
                    {row.label}
                  </td>
                </tr>
              );
            }

            if (row.isNetPosition) {
              const positive = row.annual >= 0;
              return (
                <tr key={i} className="bg-gray-100 border-t-2 border-gray-400">
                  <td className="px-4 py-2.5 font-black uppercase text-[11px] tracking-wide text-gray-800 border-r border-gray-300">
                    {row.label}
                  </td>
                  <td className={`px-3 py-2.5 text-right font-black border-r border-gray-300 ${positive ? "text-[#0F172A]" : "text-red-700"}`}>
                    {positive ? fmt(row.annual) : fmtNeg(row.annual)}
                  </td>
                  {MONTHS.map(m => (
                    <td key={m} className={`px-2 py-2.5 text-right font-black border-r border-gray-200 last:border-r-0 ${positive ? "text-[#0F172A]" : "text-red-700"}`}>
                      {positive ? fmt(row.monthly) : fmtNeg(row.monthly)}
                    </td>
                  ))}
                </tr>
              );
            }

            if (row.isTotal) {
              const negative = row.annual < 0;
              const bg = negative ? "bg-red-50" : "bg-slate-50";
              const textColor = negative ? "text-red-700" : "text-[#0F172A]";
              return (
                <tr key={i} className={`${bg} border-t border-b-2 border-gray-300`}>
                  <td className={`px-4 py-2.5 font-black uppercase text-[11px] tracking-wide border-r border-gray-300 ${textColor}`}>
                    {row.label}
                  </td>
                  <td className={`px-3 py-2.5 text-right font-black border-r border-gray-300 ${textColor}`}>
                    {negative ? fmtNeg(row.annual) : fmt(row.annual)}
                  </td>
                  {MONTHS.map(m => (
                    <td key={m} className={`px-2 py-2.5 text-right font-black border-r border-gray-200 last:border-r-0 ${textColor}`}>
                      {negative ? fmtNeg(row.monthly) : fmt(row.monthly)}
                    </td>
                  ))}
                </tr>
              );
            }

            // regular data row
            const negative = row.isNegative || row.annual < 0;
            const rowBg = i % 2 === 0 ? "bg-white" : "bg-gray-50";
            return (
              <tr key={i} className={`${rowBg} border-b border-gray-100 hover:bg-slate-50/30 transition-colors`}>
                <td className="px-4 py-2 text-gray-700 border-r border-gray-200 pl-8">
                  {row.label}
                </td>
                <td className={`px-3 py-2 text-right border-r border-gray-200 font-mono ${negative ? "text-red-600" : "text-gray-800"}`}>
                  {negative ? fmtNeg(row.annual) : fmt(row.annual)}
                </td>
                {MONTHS.map(m => (
                  <td key={m} className={`px-2 py-2 text-right border-r border-gray-100 last:border-r-0 font-mono ${negative ? "text-red-600" : "text-gray-700"}`}>
                    {negative ? fmtNeg(row.monthly) : fmt(row.monthly)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Tab content builders ───────────────────────────────────────────────────

function IncomeStatementTab() {
  const rows: TableRow[] = [
    { label: "OPERATING ACTIVITIES — INFLOWS", isSectionHeader: true, sectionType: "inflows", annual: 0, monthly: 0 },
    ...IS_INFLOWS.map(r => ({ label: r.label, annual: r.annual, monthly: r.monthly })),
    { label: "TOTAL INFLOWS", isTotal: true, annual: IS_TOTAL_INFLOWS.annual, monthly: IS_TOTAL_INFLOWS.monthly },
    { label: "OPERATING ACTIVITIES — OUTFLOWS", isSectionHeader: true, sectionType: "outflows", annual: 0, monthly: 0 },
    ...IS_OUTFLOWS.map(r => ({ label: r.label, annual: r.annual, monthly: r.monthly, isNegative: true })),
    { label: "TOTAL OUTFLOWS", isTotal: true, annual: IS_TOTAL_OUTFLOWS.annual, monthly: IS_TOTAL_OUTFLOWS.monthly },
    { label: "NET POSITION", isNetPosition: true, annual: IS_NET_POSITION.annual, monthly: IS_NET_POSITION.monthly },
  ];
  return <FinancialTable rows={rows} tableLabel="INCOME STATEMENT" />;
}

function BalanceSheetTab() {
  const rows: TableRow[] = [
    { label: "ASSETS", isSectionHeader: true, sectionType: "inflows", annual: 0, monthly: 0 },
    ...BS_ASSETS.map(r => ({ label: r.label, annual: r.annual, monthly: r.monthly })),
    { label: "TOTAL ASSETS", isTotal: true, annual: BS_TOTAL_ASSETS.annual, monthly: 0 },
    { label: "LIABILITIES", isSectionHeader: true, sectionType: "outflows", annual: 0, monthly: 0 },
    ...BS_LIABILITIES.map(r => ({ label: r.label, annual: r.annual, monthly: r.monthly, isNegative: true })),
    { label: "TOTAL LIABILITIES", isTotal: true, annual: BS_TOTAL_LIABILITIES.annual, monthly: 0 },
    { label: "NET EQUITY / GOVERNMENT FUND", isNetPosition: true, annual: BS_EQUITY.annual, monthly: 0 },
  ];
  return <FinancialTable rows={rows} tableLabel="BALANCE SHEET" />;
}

function CashFlowTab() {
  const rows: TableRow[] = [
    { label: "CASH INFLOWS — OPERATING", isSectionHeader: true, sectionType: "inflows", annual: 0, monthly: 0 },
    ...CF_INFLOWS.map(r => ({ label: r.label, annual: r.annual, monthly: r.monthly })),
    { label: "TOTAL CASH INFLOWS", isTotal: true, annual: CF_TOTAL_INFLOWS.annual, monthly: CF_TOTAL_INFLOWS.monthly },
    { label: "CASH OUTFLOWS — OPERATING", isSectionHeader: true, sectionType: "outflows", annual: 0, monthly: 0 },
    ...CF_OUTFLOWS.map(r => ({ label: r.label, annual: r.annual, monthly: r.monthly, isNegative: true })),
    { label: "TOTAL CASH OUTFLOWS", isTotal: true, annual: CF_TOTAL_OUTFLOWS.annual, monthly: CF_TOTAL_OUTFLOWS.monthly },
    { label: "NET CASH POSITION", isNetPosition: true, annual: CF_NET_POSITION.annual, monthly: CF_NET_POSITION.monthly },
  ];
  return <FinancialTable rows={rows} tableLabel="CASH FLOW" />;
}

// ── Budget Variance tab ────────────────────────────────────────────────────

function VarianceStatusBadge({ pct, isInflow }: { pct: number; isInflow: boolean }) {
  // For inflows: <100% is bad (shortfall). For outflows: >100% is bad (over budget).
  let label = "";
  let cls   = "";
  if (isInflow) {
    if (pct >= 100) { label = "ON TARGET"; cls = "bg-slate-100 text-[#0F172A]"; }
    else if (pct >= 90) { label = "NEAR TARGET"; cls = "bg-slate-100 text-[#0F172A]"; }
    else { label = "SHORTFALL"; cls = "bg-red-100 text-red-700"; }
  } else {
    if (pct <= 95) { label = "UNDER BUDGET"; cls = "bg-slate-100 text-[#0F172A]"; }
    else if (pct <= 100) { label = "ON BUDGET"; cls = "bg-slate-100 text-[#0F172A]"; }
    else if (pct <= 105) { label = "NEAR LIMIT"; cls = "bg-slate-100 text-[#0F172A]"; }
    else { label = "OVER BUDGET"; cls = "bg-red-100 text-red-700"; }
  }
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${cls}`}>{label}</span>;
}

function BudgetVarianceTab() {
  const chartTooltipStyle = {
    contentStyle: { background: "#0f172a", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 11, color: "#fff" },
  };

  return (
    <div>
      {/* Variance table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[1600px]">
          <thead>
            <tr className="bg-[#1a6b3a] text-white">
              <th className="px-4 py-2.5 text-left font-bold uppercase tracking-wider w-44 border-r border-slate-200 sticky left-0 bg-[#1a6b3a] z-10">
                Line Item
              </th>
              <th className="px-3 py-2.5 text-right font-bold border-r border-slate-200 w-28">Approved Budget</th>
              <th className="px-3 py-2.5 text-right font-bold border-r border-slate-200 w-28">Revised Budget</th>
              {MONTHS.map(m => (
                <th key={m} className="px-2 py-2.5 text-right font-bold w-20 border-r border-slate-200">{m} Actual</th>
              ))}
              <th className="px-3 py-2.5 text-right font-bold border-r border-slate-200 w-28">Annual Actual</th>
              <th className="px-3 py-2.5 text-right font-bold border-r border-slate-200 w-24">Variance $</th>
              <th className="px-3 py-2.5 text-right font-bold border-r border-slate-200 w-20">Variance %</th>
              <th className="px-3 py-2.5 text-center font-bold w-28">Status</th>
            </tr>
          </thead>
          <tbody>
            {BV_ROWS.map((row, i) => {
              const isInflow = row.approved > 0;
              const annualActual = row.actuals.reduce((s, v) => s + v, 0);
              const variance    = annualActual - row.revised;
              const pct         = Math.abs(annualActual / row.revised) * 100;
              const rowBg       = i % 2 === 0 ? "bg-white" : "bg-gray-50";
              const negActual   = annualActual < 0;
              const negVariance = variance < 0;

              return (
                <tr key={i} className={`${rowBg} border-b border-gray-100 hover:bg-slate-50/40 transition-colors`}>
                  <td className="px-4 py-2 font-medium text-gray-800 border-r border-gray-200 sticky left-0 bg-inherit z-10">
                    {row.label}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-gray-700 border-r border-gray-200">
                    {row.approved < 0 ? fmtNeg(row.approved) : fmt(row.approved)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-gray-700 border-r border-gray-200">
                    {row.revised < 0 ? fmtNeg(row.revised) : fmt(row.revised)}
                  </td>
                  {row.actuals.map((v, mi) => (
                    <td key={mi} className={`px-2 py-2 text-right font-mono border-r border-gray-100 ${v < 0 ? "text-red-600" : "text-gray-700"}`}>
                      {v < 0 ? fmtNeg(v) : fmt(v)}
                    </td>
                  ))}
                  <td className={`px-3 py-2 text-right font-mono font-bold border-r border-gray-200 ${negActual ? "text-red-600" : "text-gray-800"}`}>
                    {negActual ? fmtNeg(annualActual) : fmt(annualActual)}
                  </td>
                  <td className={`px-3 py-2 text-right font-mono font-bold border-r border-gray-200 ${negVariance ? "text-red-600" : "text-[#0F172A]"}`}>
                    {negVariance ? fmtNeg(variance) : fmt(variance)}
                  </td>
                  <td className={`px-3 py-2 text-right font-bold border-r border-gray-200 ${pct > 105 ? "text-red-600" : pct > 100 ? "text-[#0F172A]" : "text-[#0F172A]"}`}>
                    {pct.toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-center">
                    <VarianceStatusBadge pct={pct} isInflow={isInflow} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-gray-50 border-t border-gray-200">
        {/* Bar chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
            Budget vs Actual by Month (USD)
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BV_CHART_DATA} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`} />
                <Tooltip {...chartTooltipStyle}
                  formatter={(v: number, n: string) => [`$${(v/1_000_000).toFixed(2)}M`, n]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="approved" name="Approved Budget" fill="#1D4ED8" radius={[3,3,0,0]} />
                <Bar dataKey="revised"  name="Revised Budget"  fill="#D97706" radius={[3,3,0,0]} />
                <Bar dataKey="actual"   name="Actual Spend"    fill="#DC2626" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">
            Cumulative Budget vs Cumulative Actual (USD)
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={BV_CUMULATIVE} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v / 1_000_000).toFixed(1)}M`} />
                <Tooltip {...chartTooltipStyle}
                  formatter={(v: number, n: string) => [`$${(v/1_000_000).toFixed(2)}M`, n]} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line type="monotone" dataKey="cumApproved" name="Cum. Approved" stroke="#1D4ED8" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="cumRevised"  name="Cum. Revised"  stroke="#D97706" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="cumActual"   name="Cum. Actual"   stroke="#DC2626" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Budget Module stub tabs ────────────────────────────────────────────────

interface BudgetStubRow {
  code: string;
  description: string;
  approved: number;
  revised: number;
  actual: number;
  variance: number;
  status: "ON TRACK" | "AT RISK" | "OVER BUDGET" | "PENDING";
}

const statusColor: Record<BudgetStubRow["status"], string> = {
  "ON TRACK":    "bg-emerald-100 text-emerald-800",
  "AT RISK":     "bg-amber-100 text-amber-800",
  "OVER BUDGET": "bg-red-100 text-red-700",
  "PENDING":     "bg-slate-100 text-slate-600",
};

function BudgetStubTable({
  heading, rows,
}: { heading: string; rows: BudgetStubRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-[#1a6b3a] text-white">
            <th className="px-4 py-2.5 text-left font-bold uppercase tracking-wider border-r border-slate-200 w-28">Code</th>
            <th className="px-4 py-2.5 text-left font-bold uppercase tracking-wider border-r border-slate-200">{heading}</th>
            <th className="px-3 py-2.5 text-right font-bold uppercase tracking-wider border-r border-slate-200 w-32">Approved (USD)</th>
            <th className="px-3 py-2.5 text-right font-bold uppercase tracking-wider border-r border-slate-200 w-32">Revised (USD)</th>
            <th className="px-3 py-2.5 text-right font-bold uppercase tracking-wider border-r border-slate-200 w-32">Actuals (USD)</th>
            <th className="px-3 py-2.5 text-right font-bold uppercase tracking-wider border-r border-slate-200 w-32">Variance (USD)</th>
            <th className="px-3 py-2.5 text-center font-bold uppercase tracking-wider w-28">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const rowBg = i % 2 === 0 ? "bg-white" : "bg-gray-50";
            const negV  = row.variance < 0;
            return (
              <tr key={i} className={`${rowBg} border-b border-gray-100 hover:bg-slate-50/30 transition-colors`}>
                <td className="px-4 py-2 font-mono text-gray-500 border-r border-gray-200">{row.code}</td>
                <td className="px-4 py-2 text-gray-800 font-medium border-r border-gray-200">{row.description}</td>
                <td className="px-3 py-2 text-right font-mono text-gray-700 border-r border-gray-200">{fmt(row.approved)}</td>
                <td className="px-3 py-2 text-right font-mono text-gray-700 border-r border-gray-200">{fmt(row.revised)}</td>
                <td className="px-3 py-2 text-right font-mono text-gray-800 font-semibold border-r border-gray-200">{fmt(row.actual)}</td>
                <td className={`px-3 py-2 text-right font-mono font-bold border-r border-gray-200 ${negV ? "text-red-600" : "text-[#0F172A]"}`}>
                  {negV ? fmtNeg(row.variance) : fmt(row.variance)}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${statusColor[row.status]}`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            );
          })}
          {/* Totals row */}
          <tr className="bg-slate-50 border-t-2 border-gray-300 font-black text-xs">
            <td className="px-4 py-2.5 border-r border-gray-200"></td>
            <td className="px-4 py-2.5 text-[#0F172A] uppercase tracking-wide border-r border-gray-200">TOTAL</td>
            <td className="px-3 py-2.5 text-right font-mono text-[#0F172A] border-r border-gray-200">{fmt(rows.reduce((s,r)=>s+r.approved,0))}</td>
            <td className="px-3 py-2.5 text-right font-mono text-[#0F172A] border-r border-gray-200">{fmt(rows.reduce((s,r)=>s+r.revised,0))}</td>
            <td className="px-3 py-2.5 text-right font-mono text-[#0F172A] border-r border-gray-200">{fmt(rows.reduce((s,r)=>s+r.actual,0))}</td>
            {(() => {
              const tot = rows.reduce((s,r)=>s+r.variance,0);
              return (
                <td className={`px-3 py-2.5 text-right font-mono font-black border-r border-gray-200 ${tot<0?"text-red-600":"text-[#0F172A]"}`}>
                  {tot<0?fmtNeg(tot):fmt(tot)}
                </td>
              );
            })()}
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// Stub data factories
function makeRows(prefix: string, labels: string[]): BudgetStubRow[] {
  const statuses: BudgetStubRow["status"][] = ["ON TRACK","AT RISK","OVER BUDGET","PENDING","ON TRACK","AT RISK","ON TRACK","PENDING"];
  return labels.map((desc, i) => {
    const approved = Math.round((1_000_000 + Math.random() * 4_000_000) / 1000) * 1000;
    const revised  = Math.round(approved * (0.95 + Math.random() * 0.1) / 1000) * 1000;
    const actual   = Math.round(revised  * (0.75 + Math.random() * 0.4) / 1000) * 1000;
    return {
      code: `${prefix}-${String(i + 1).padStart(3,"0")}`,
      description: desc,
      approved,
      revised,
      actual,
      variance: actual - revised,
      status: statuses[i % statuses.length],
    };
  });
}

const PROJECT_ROWS  = makeRows("PROJ", ["Road Rehabilitation — Harare-Beit Bridge","Limpopo Valley Water Scheme","Kariba South Power Extension","National Data Centre Phase II","Bulawayo Ring Road","Hwange Coal Power Station Units 7 & 8","Cyclone Idai Reconstruction Programme","Border Modernisation Initiative"]);
const SUPPLIES_ROWS = makeRows("SUP",  ["Medical Consumables & PPE","Office Stationery & Equipment","Fuel & Lubricants","Agricultural Inputs — Fertilisers","Road Construction Materials","School Textbooks","Police Uniform & Equipment","IT Hardware & Software Licences"]);
const WORKS_ROWS    = makeRows("WKS",  ["Bridge Construction — Zambezi Crossing","School Blocks Construction — Rural","Government Complex Renovation","Dam Wall Rehabilitation","Street Lighting — Harare CBD","Border Post Infrastructure","Hospital Wards Extension","Community Boreholes Programme"]);
const SERVICES_ROWS = makeRows("SVC",  ["Professional Consulting Services","Security Services — Government Buildings","Cleaning & Hygiene Services","ICT Managed Services","Legal & Advisory Services","Training & Capacity Building","Transport & Fleet Management","Catering Services"]);
const PRIORITIES_ROWS = makeRows("NP", ["Food Security Programme","Infrastructure Development","Human Capital Development","Industrialisation & Value Addition","Social Protection Programme","Governance & Rule of Law","Digital Transformation","Public Health Strengthening"]);
const VISION_ROWS     = makeRows("V2030",["Financial Inclusion Initiative","Upper-Middle Income Economy Transition","Tourism Revitalisation","Special Economic Zones Development","Smart Cities Programme","Manufacturing Sector Growth","Agricultural Modernisation","Technology & Innovation Hubs"]);
const NDP_ROWS        = makeRows("NDP", ["NDP Pillar 1 — Economic Growth","NDP Pillar 2 — Infrastructure","NDP Pillar 3 — Human Capital","NDP Pillar 4 — Food Security","NDP Pillar 5 — Governance","NDP Pillar 6 — Environment","NDP Pillar 7 — Social Protection","NDP Pillar 8 — Digital Economy"]);
const AFFIRMATIVE_ROWS= makeRows("AA",  ["Women in Business Support Fund","Youth Empowerment Programme","Persons with Disabilities Procurement Reserve","Rural Community Enterprise Fund","Veteran Entrepreneurs Support","Disadvantaged Communities Fund","SME Development Programme","Cooperative Societies Support"]);
const SDG_ROWS        = makeRows("SDG", ["SDG 1 — No Poverty","SDG 2 — Zero Hunger","SDG 3 — Good Health","SDG 4 — Quality Education","SDG 6 — Clean Water","SDG 7 — Affordable Energy","SDG 8 — Decent Work","SDG 13 — Climate Action"]);
const STRATEGY_ROWS   = makeRows("NS",  ["National Security Strategy","Export Growth Strategy","Foreign Direct Investment Strategy","Public Sector Efficiency Strategy","Climate Resilience Strategy","Border Security Strategy","Regional Integration Strategy","Anti-Corruption Strategy"]);
const MANIFESTO_ROWS  = makeRows("PM",  ["SMART Zimbabwe Initiative","100 Days Priority Projects","Leave No One & No Place Behind","Devolution Funding","Command Agriculture Extension","Education 5.0 Programme","Industry 4.0 Adoption","Health Infrastructure Upgrade"]);

function ProjectsTab()     { return <BudgetStubTable heading="Capital Project" rows={PROJECT_ROWS}    />; }
function SuppliesTab()     { return <SuppliesScheduleTab />; }
function WorksTab()        { return <WorksScheduleTab />; }
function ServicesTab()     { return <ServicesScheduleTab />; }
function PrioritiesTab()   { return <BudgetStubTable heading="National Priority Area" rows={PRIORITIES_ROWS}/>; }
function Vision2030Tab()   { return <BudgetStubTable heading="Vision 2030 Programme" rows={VISION_ROWS}    />; }
function NDPTab()          { return <BudgetStubTable heading="NDP Pillar / Programme" rows={NDP_ROWS}      />; }
function AffirmativeTab()  { return <BudgetStubTable heading="Affirmative Action Programme" rows={AFFIRMATIVE_ROWS}/>; }
function SDGTab()          { return <BudgetStubTable heading="SDG Goal / Target" rows={SDG_ROWS}      />; }
function StrategyTab()     { return <BudgetStubTable heading="Strategy Area" rows={STRATEGY_ROWS}    />; }
function ManifestoTab()    { return <BudgetStubTable heading="Manifesto Commitment" rows={MANIFESTO_ROWS} />; }

// ── Main component ─────────────────────────────────────────────────────────

export default function BudgetIntelligenceCentre({ compact = false }: { compact?: boolean }) {
  const [activeModuleTab, setActiveModuleTab] = useState<BudgetModuleTab>("consolidated");
  const [activeTab, setActiveTab] = useState<Tab>("Consolidated Cash Flow");
  const [audioOn,   setAudioOn]   = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

  // Filters state
  const [year,       setYear]       = useState(FIN_YEARS[0]);
  const [ministry,   setMinistry]   = useState(MINISTRIES[0]);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [soe,        setSoe]        = useState(SOE_OPTIONS[0]);
  const [cell,       setCell]       = useState(UNIT_OPTIONS[0]);

  const isAlert = activeModuleTab === "consolidated" ? ALERT_MODE[activeTab] : false;
  const briefing = activeModuleTab === "consolidated" ? BRIEFINGS[activeTab] : "Budget allocation data loaded. Review each category for expenditure tracking and variance analysis.";

  function renderModuleContent() {
    switch (activeModuleTab) {
      case "consolidated": return renderConsolidatedContent();
      case "projects":     return <ProjectsTab />;
      case "supplies":     return <SuppliesTab />;
      case "works":        return <WorksTab />;
      case "services":     return <ServicesTab />;
      case "priorities":   return <PrioritiesTab />;
      case "vision2030":   return <Vision2030Tab />;
      case "ndp":          return <NDPTab />;
      case "affirmative":  return <AffirmativeTab />;
      case "sdg":          return <SDGTab />;
      case "strategy":     return <StrategyTab />;
      case "manifesto":    return <ManifestoTab />;
      default:             return null;
    }
  }

  function renderConsolidatedContent() {
    switch (activeTab) {
      case "Consolidated Cash Flow": return <CashFlowTab />;
      case "Operations":             return <IncomeStatementTab />;
      case "Supplies":               return <SuppliesScheduleTab />;
      case "Works":                  return <WorksScheduleTab />;
      case "Services":               return <ServicesScheduleTab />;
      default:                       return null;
    }
  }

  // ── Active tab name for header ─────────────────────────────────────────
  const headerTabName: string = activeModuleTab === "consolidated"
    ? activeTab
    : (BUDGET_MODULE_TABS.find(t => t.key === activeModuleTab)?.label ?? "Budget Module");

  return (
    <div className={`flex flex-col h-full bg-[#f8fafc] ${compact ? "text-[11px]" : ""}`}>

      {/* ── 0. Budget Module top-level tab bar ───────────────────────────── */}
      <div className="flex items-center bg-[#0f172a] border-b border-white/10 overflow-x-auto shrink-0">
        {BUDGET_MODULE_TABS.map(({ key, label, icon: Icon }) => {
          const active = key === activeModuleTab;
          return (
            <button
              key={key}
              onClick={() => setActiveModuleTab(key)}
              className={`
                shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider
                transition-colors whitespace-nowrap border-b-2
                ${active
                  ? "border-slate-200 text-slate-400 bg-white/5"
                  : "border-transparent text-white/50 hover:text-white/80 hover:bg-white/5"}
              `}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </button>
          );
        })}
      </div>
      {/* ── 1. Financial statement sub-tabs (consolidated tab only) ─────── */}
      {activeModuleTab === "consolidated" && (
      <div className="flex items-center bg-white border-b border-gray-200 overflow-x-auto shrink-0">
        {TABS.map(tab => {
          const active = tab === activeTab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                shrink-0 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap border-b-2
                ${active
                  ? "border-slate-200 text-[#0F172A] bg-slate-50"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"}
              `}
            >
              {tab}
            </button>
          );
        })}
        {/* trend indicator */}
        <div className="ml-auto pr-4 flex items-center gap-2 shrink-0">
          {activeTab === "Consolidated Cash Flow" || activeTab === "Works"
            ? <TrendingDown className="h-4 w-4 text-red-400" />
            : <TrendingUp   className="h-4 w-4 text-slate-600" />
          }
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Live</span>
          <span className="h-2 w-2 rounded-full bg-[#0F172A] animate-pulse" />
        </div>
      </div>
      )}

      {/* ── 2. Filters bar ────────────────────────────────────────────────── */}
      <FiltersBar
        year={year}         setYear={setYear}
        ministry={ministry} setMinistry={setMinistry}
        department={department} setDepartment={setDepartment}
        soe={soe}           setSoe={setSoe}
        cell={cell}         setCell={setCell}
        collapsed={filtersCollapsed}
        onToggle={() => setFiltersCollapsed(v => !v)}
      />

      {/* ── 3. Briefing headline bar ──────────────────────────────────────── */}
      <div className={`
        flex items-center gap-3 px-4 py-2.5 shrink-0
        ${isAlert ? "bg-[#0f172a]" : "bg-[#0f2a1a]"}
      `}>
        {isAlert
          ? <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 animate-pulse" />
          : <span className="text-slate-500 text-sm shrink-0">✓</span>
        }
        <p className={`flex-1 text-xs font-medium leading-snug ${isAlert ? "text-red-200" : "text-slate-300"}`}>
          {briefing}
        </p>
        {/* alert badge */}
        {isAlert && (
          <span className="shrink-0 flex items-center gap-1 bg-red-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
            <AlertTriangle className="h-3 w-3" /> ALERT
          </span>
        )}
        {/* audio toggle */}
        <button
          onClick={() => setAudioOn(p => !p)}
          title={audioOn ? "Mute briefing" : "Play briefing"}
          className="shrink-0 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
        >
          {audioOn
            ? <Volume2 className="h-4 w-4" />
            : <VolumeX  className="h-4 w-4 text-white/50" />
          }
        </button>
      </div>

      {/* ── 4. Dark header block ─────────────────────────────────────────── */}
      <StatementHeader
        ministry={ministry}
        department={department}
        year={year}
        tabName={headerTabName}
      />

      {/* ── 5. Content area (scrollable) ─────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {renderModuleContent()}
      </div>

    </div>
  );
}
