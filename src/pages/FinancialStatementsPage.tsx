/**
 * FinancialStatementsPage — Income Statement, Balance Sheet, Cash Flow.
 * Based on the sample budget structure provided.
 */
import { useState } from "react";
import { AppShell, Card, CardHeader , PageContextBar } from "@/components/AppShell";
import { Sparkles, Download, Printer, Share2, Filter, ChevronDown, TrendingUp, TrendingDown } from "lucide-react";

const MINISTRIES = ["All Ministries", "Ministry of Health and Child Care", "Ministry of Finance", "Ministry of Education", "Ministry of Transport", "Ministry of Energy", "Ministry of Agriculture", "Ministry of Water", "Ministry of ICT"];
const DEPARTMENTS = ["All Departments", "Medical Stores", "Finance Department", "Procurement", "Infrastructure Division", "Roads & Bridges", "Primary Education", "Treasury Operations"];
const SOE_SPV_OPTS = ["All SOE / SPV", "ZIMRA", "ZINARA", "ZESA Holdings", "NetOne", "TelOne", "Air Zimbabwe", "CBZ Holdings", "IDBZ"];
const CELL_OPTS   = ["All Cells", "Capital Projects", "Recurrent Expenditure", "Personnel & Payroll", "Grants & Transfers", "Debt Service", "Research & Development"];
const FINANCIAL_YEARS = ["All Years", "FY2026/27", "FY2025/26", "FY2024/25", "FY2023/24"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// INCOME STATEMENT DATA (based on sample budget)
const INCOME_STATEMENT = {
  income: [
    { label: "Government Allocation",  annual: 20000000, monthly: 1666667 },
    { label: "Donors",                 annual: 800000,   monthly: 66667   },
    { label: "Income Subscriptions",   annual: 200000,   monthly: 16667   },
  ],
  recurring: [
    { label: "Rent",                annual: 40000,   monthly: 3333   },
    { label: "Admin Costs",         annual: 65000,   monthly: 5417   },
    { label: "Marketing Costs",     annual: 80000,   monthly: 6667   },
    { label: "Salaries and Wages",  annual: 1200000, monthly: 100000 },
    { label: "Travelling",          annual: 500000,  monthly: 41667  },
    { label: "Operating Costs",     annual: 600000,  monthly: 50000  },
    { label: "Office Costs",        annual: 400000,  monthly: 33333  },
    { label: "Training Costs",      annual: 200000,  monthly: 16667  },
    { label: "Vehicle Maintenance", annual: 300000,  monthly: 25000  },
  ],
  capital: [
    { label: "Vehicles",             annual: 5400000, monthly: 450000 },
    { label: "Buildings",            annual: 4200000, monthly: 350000 },
    { label: "Development Projects", annual: 4500000, monthly: 375000 },
  ],
};

// BALANCE SHEET DATA
const BALANCE_SHEET = {
  currentAssets: [
    { label: "Cash and Bank Balances",          value: 45000   },
    { label: "Accounts Receivable, net",        value: 3300    },
    { label: "Office Supplies",                 value: 500     },
    { label: "Prepayments",                     value: 2000    },
    { label: "Short-term Investments",          value: 8000    },
  ],
  nonCurrentAssets: [
    { label: "Equipment, net",                  value: 22020   },
    { label: "Vehicles, net",                   value: 31200   },
    { label: "Buildings, net",                  value: 185000  },
    { label: "Land",                            value: 45000   },
    { label: "Intangible Assets",               value: 8500    },
  ],
  currentLiabilities: [
    { label: "Accounts Payable",                value: 6000    },
    { label: "Accrued Expenses",                value: 1500    },
    { label: "Utilities Payable",               value: 3360    },
    { label: "Short-term Loans",                value: 12000   },
  ],
  nonCurrentLiabilities: [
    { label: "Long-term Loans",                 value: 85000   },
    { label: "Deferred Income",                 value: 4000    },
  ],
};

// CASH FLOW DATA
const CASH_FLOW_DATA = [
  { month: "Jan", inflow: 1778400, outflow: 1457083, net: 321317  },
  { month: "Feb", inflow: 1778400, outflow: 1457083, net: 614233  },
  { month: "Mar", inflow: 1778400, outflow: 1457083, net: 907150  },
  { month: "Apr", inflow: 1778400, outflow: 1457083, net: 1200067 },
  { month: "May", inflow: 1778400, outflow: 1457083, net: 1492983 },
  { month: "Jun", inflow: 1778400, outflow: 1457083, net: 1785900 },
  { month: "Jul", inflow: 1778400, outflow: 1457083, net: 2078817 },
  { month: "Aug", inflow: 1778400, outflow: 1457083, net: 2371733 },
  { month: "Sep", inflow: 1778400, outflow: 1457083, net: 2664650 },
  { month: "Oct", inflow: 1778400, outflow: 1457083, net: 2957567 },
  { month: "Nov", inflow: 1778400, outflow: 1457083, net: 3250483 },
  { month: "Dec", inflow: 1778400, outflow: 1457083, net: 3543400 },
];

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtShort(n: number) {
  if (n >= 1000000) return `${(n/1000000).toFixed(2)}M`;
  if (n >= 1000) return `${(n/1000).toFixed(1)}K`;
  return n.toString();
}

type StmtTab = "income" | "balance" | "cashflow" | "variance";

function IncomeStatement({ ministry, dept, year }: { ministry: string; dept: string; year: string }) {
  const totalIncome = INCOME_STATEMENT.income.reduce((s, r) => s + r.annual, 0);
  const totalRecurring = INCOME_STATEMENT.recurring.reduce((s, r) => s + r.annual, 0);
  const totalCapital = INCOME_STATEMENT.capital.reduce((s, r) => s + r.annual, 0);
  const totalExpenditure = totalRecurring + totalCapital;
  const netCashFlow = totalIncome - totalExpenditure;

  return (
    <div className="bg-white border border-black/10 overflow-hidden" style={{ borderRadius: 0 }}>
      {/* Header */}
      <div className="bg-[#0f172a] text-white text-center py-4 px-4">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</div>
        <div className="font-bold text-base">{ministry}</div>
        <div className="text-slate-400 text-sm">{dept}</div>
        <div className="text-white/80 text-xs mt-1">INCOME STATEMENT — FINANCIAL YEAR {year}</div>
        <div className="text-white/60 text-[10px] mt-0.5">Budget Code: {year.replace("/","")}/MOH/MS/0331 · Date: {new Date().toLocaleDateString("en-GB", { day:"2-digit", month:"long", year:"numeric" })}</div>
      </div>

      {/* Income section */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0F172A] text-white">
              <th className="text-left px-4 py-2 text-xs font-bold">INCOME</th>
              <th className="text-right px-4 py-2 text-xs font-bold">Annual Budget</th>
              {MONTHS.map(m => <th key={m} className="text-right px-2 py-2 text-[9px] font-bold whitespace-nowrap">{m.slice(0,3)}</th>)}
            </tr>
          </thead>
          <tbody>
            {INCOME_STATEMENT.income.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-slate-50/30" : "bg-white"}>
                <td className="px-4 py-2 text-xs text-[#0f172a]">{row.label}</td>
                <td className="px-4 py-2 text-xs text-right font-semibold text-[#0f172a]">{fmt(row.annual)}</td>
                {MONTHS.map(m => <td key={m} className="px-2 py-2 text-[10px] text-right text-black/60">{fmt(row.monthly)}</td>)}
              </tr>
            ))}
            <tr className="bg-slate-100 font-bold">
              <td className="px-4 py-2 text-xs font-bold text-[#0F172A]">TOTAL INCOME</td>
              <td className="px-4 py-2 text-xs text-right font-bold text-[#0F172A]">{fmt(totalIncome)}</td>
              {MONTHS.map(m => <td key={m} className="px-2 py-2 text-[10px] text-right font-bold text-[#0F172A]">{fmt(INCOME_STATEMENT.income.reduce((s,r)=>s+r.monthly,0))}</td>)}
            </tr>
          </tbody>

          {/* Recurring expenditure */}
          <thead>
            <tr className="bg-[#0F172A] text-white">
              <th className="text-left px-4 py-2 text-xs font-bold">RECURRING EXPENDITURE</th>
              <th className="text-right px-4 py-2 text-xs font-bold">Annual</th>
              {MONTHS.map(m => <th key={m} className="text-right px-2 py-2 text-[9px] font-bold">{m.slice(0,3)}</th>)}
            </tr>
          </thead>
          <tbody>
            {INCOME_STATEMENT.recurring.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-slate-50/30" : "bg-white"}>
                <td className="px-4 py-2 text-xs text-[#0f172a]">{row.label}</td>
                <td className="px-4 py-2 text-xs text-right font-semibold text-[#0f172a]">{fmt(row.annual)}</td>
                {MONTHS.map(m => <td key={m} className="px-2 py-2 text-[10px] text-right text-black/60">{fmt(row.monthly)}</td>)}
              </tr>
            ))}
          </tbody>

          {/* Capital expenditure */}
          <thead>
            <tr className="bg-[#0F172A] text-white">
              <th className="text-left px-4 py-2 text-xs font-bold">CAPITAL EXPENDITURE</th>
              <th className="text-right px-4 py-2 text-xs font-bold">Annual</th>
              {MONTHS.map(m => <th key={m} className="text-right px-2 py-2 text-[9px] font-bold">{m.slice(0,3)}</th>)}
            </tr>
          </thead>
          <tbody>
            {INCOME_STATEMENT.capital.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-slate-50/30" : "bg-white"}>
                <td className="px-4 py-2 text-xs text-[#0f172a]">{row.label}</td>
                <td className="px-4 py-2 text-xs text-right font-semibold text-[#0f172a]">{fmt(row.annual)}</td>
                {MONTHS.map(m => <td key={m} className="px-2 py-2 text-[10px] text-right text-black/60">{fmt(row.monthly)}</td>)}
              </tr>
            ))}
            <tr className="bg-red-100 font-bold">
              <td className="px-4 py-2 text-xs font-bold text-red-900">TOTAL EXPENDITURE</td>
              <td className="px-4 py-2 text-xs text-right font-bold text-red-900">{fmt(totalExpenditure)}</td>
              {MONTHS.map(m => <td key={m} className="px-2 py-2 text-[10px] text-right font-bold text-red-900">{fmt(totalExpenditure/12)}</td>)}
            </tr>
            <tr className="bg-[#0F172A] text-white font-bold">
              <td className="px-4 py-2 text-sm font-bold">NET CASH FLOW</td>
              <td className="px-4 py-2 text-sm text-right font-bold">{fmt(netCashFlow)}</td>
              {MONTHS.map((m,i) => (
                <td key={m} className="px-2 py-2 text-[10px] text-right font-bold">
                  {fmt(CASH_FLOW_DATA[i]?.net ?? 0)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BalanceSheet({ ministry, dept, year }: { ministry: string; dept: string; year: string }) {
  const totalCurrentAssets = BALANCE_SHEET.currentAssets.reduce((s,r)=>s+r.value,0);
  const totalNonCurrentAssets = BALANCE_SHEET.nonCurrentAssets.reduce((s,r)=>s+r.value,0);
  const totalAssets = totalCurrentAssets + totalNonCurrentAssets;
  const totalCurrentLiab = BALANCE_SHEET.currentLiabilities.reduce((s,r)=>s+r.value,0);
  const totalNonCurrentLiab = BALANCE_SHEET.nonCurrentLiabilities.reduce((s,r)=>s+r.value,0);
  const totalLiabilities = totalCurrentLiab + totalNonCurrentLiab;
  const equity = totalAssets - totalLiabilities;

  const Section = ({ title, rows, total, color }: { title: string; rows: {label:string;value:number}[]; total: number; color: string }) => (
    <div className="mb-4">
      <div className={`${color} text-white px-4 py-1.5 text-xs font-bold uppercase`}>{title}</div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r,i) => (
            <tr key={i} className={i%2===0?"bg-[#F9F9F9]":"bg-white"}>
              <td className="px-6 py-1.5 text-xs text-[#0f172a]">{r.label}</td>
              <td className="px-4 py-1.5 text-xs text-right text-black/70">{fmt(r.value)}</td>
              <td className="w-24 px-4 py-1.5" />
            </tr>
          ))}
          <tr className="border-t-2 border-black/20">
            <td className="px-6 py-2 text-xs font-bold text-[#0f172a]">Total</td>
            <td />
            <td className="px-4 py-2 text-xs font-bold text-right text-[#0f172a] border-t border-black/20">{fmt(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white border border-black/10" style={{ borderRadius: 0 }}>
      <div className="bg-[#0f172a] text-white text-center py-4 px-4">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</div>
        <div className="font-bold text-base">{ministry}</div>
        <div className="text-slate-400 text-sm">{dept}</div>
        <div className="text-white/80 text-xs mt-1">STATEMENT OF FINANCIAL POSITION (BALANCE SHEET) — AS AT 31 DECEMBER {year.split("/")[0]}</div>
        <div className="text-white/50 text-[10px] mt-0.5">(Amounts in USD)</div>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Section title="Current Assets" rows={BALANCE_SHEET.currentAssets} total={totalCurrentAssets} color="bg-[#0F172A]" />
          <Section title="Non-Current Assets" rows={BALANCE_SHEET.nonCurrentAssets} total={totalNonCurrentAssets} color="bg-[#0F172A]" />
          <div className="bg-[#0f172a] text-white px-4 py-2 flex justify-between text-sm font-bold">
            <span>TOTAL ASSETS</span><span>{fmt(totalAssets)}</span>
          </div>
        </div>
        <div>
          <Section title="Current Liabilities" rows={BALANCE_SHEET.currentLiabilities} total={totalCurrentLiab} color="bg-red-700" />
          <Section title="Non-Current Liabilities" rows={BALANCE_SHEET.nonCurrentLiabilities} total={totalNonCurrentLiab} color="bg-red-800" />
          <div className="bg-[#0F172A] text-white px-4 py-1.5 text-xs font-bold uppercase mb-2">Owner's Equity / Capital</div>
          <table className="w-full text-sm mb-2">
            <tbody>
              <tr className="bg-[#F9F9F9]">
                <td className="px-6 py-1.5 text-xs text-[#0f172a]">Capital / Retained Earnings</td>
                <td className="px-4 py-1.5 text-xs text-right">{fmt(equity)}</td>
                <td className="w-24 px-4" />
              </tr>
              <tr className="border-t-2 border-black/20">
                <td className="px-6 py-2 text-xs font-bold">Total Equity</td>
                <td />
                <td className="px-4 py-2 text-xs font-bold text-right border-t border-black/20">{fmt(equity)}</td>
              </tr>
            </tbody>
          </table>
          <div className="bg-[#0f172a] text-white px-4 py-2 flex justify-between text-sm font-bold">
            <span>TOTAL LIABILITIES AND EQUITY</span><span>{fmt(totalLiabilities + equity)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CashFlowStatement({ ministry, dept, year }: { ministry: string; dept: string; year: string }) {
  const totalIn = CASH_FLOW_DATA.reduce((s,r)=>s+r.inflow,0);
  const totalOut = CASH_FLOW_DATA.reduce((s,r)=>s+r.outflow,0);
  const netFlow = CASH_FLOW_DATA[11].net;
  return (
    <div className="bg-white border border-black/10" style={{ borderRadius: 0 }}>
      <div className="bg-[#0f172a] text-white text-center py-4 px-4">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</div>
        <div className="font-bold text-base">{ministry}</div>
        <div className="text-slate-400 text-sm">{dept}</div>
        <div className="text-white/80 text-xs mt-1">STATEMENT OF CASH FLOWS — FINANCIAL YEAR {year}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0F172A] text-white">
              <th className="text-left px-4 py-2 text-xs font-bold">CASH FLOW</th>
              <th className="text-right px-4 py-2 text-xs">Annual Total</th>
              {MONTHS.map(m => <th key={m} className="text-right px-2 py-2 text-[9px] whitespace-nowrap">{m.slice(0,3)}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr className="bg-slate-50 font-semibold">
              <td className="px-4 py-2 text-xs font-bold text-[#0F172A]">OPERATING ACTIVITIES — INFLOWS</td>
              <td colSpan={13} />
            </tr>
            <tr>
              <td className="px-6 py-1.5 text-xs text-[#0f172a]">Government Allocation</td>
              <td className="px-4 py-1.5 text-xs text-right">{fmt(20000000)}</td>
              {MONTHS.map(m => <td key={m} className="px-2 py-1.5 text-[10px] text-right text-black/60">{fmt(1666667)}</td>)}
            </tr>
            <tr className="bg-[#F9F9F9]">
              <td className="px-6 py-1.5 text-xs text-[#0f172a]">Donor Funds</td>
              <td className="px-4 py-1.5 text-xs text-right">{fmt(800000)}</td>
              {MONTHS.map(m => <td key={m} className="px-2 py-1.5 text-[10px] text-right text-black/60">{fmt(66667)}</td>)}
            </tr>
            <tr>
              <td className="px-6 py-1.5 text-xs text-[#0f172a]">Income Subscriptions</td>
              <td className="px-4 py-1.5 text-xs text-right">{fmt(200000)}</td>
              {MONTHS.map(m => <td key={m} className="px-2 py-1.5 text-[10px] text-right text-black/60">{fmt(16667)}</td>)}
            </tr>
            <tr className="bg-slate-100 font-bold">
              <td className="px-4 py-2 text-xs font-bold text-[#0F172A]">TOTAL INFLOWS</td>
              <td className="px-4 py-2 text-xs text-right font-bold text-[#0F172A]">{fmt(totalIn)}</td>
              {MONTHS.map((m,i) => <td key={m} className="px-2 py-2 text-[10px] text-right font-bold text-[#0F172A]">{fmt(CASH_FLOW_DATA[i].inflow)}</td>)}
            </tr>

            <tr className="bg-red-50 font-semibold">
              <td className="px-4 py-2 text-xs font-bold text-red-900">OPERATING ACTIVITIES — OUTFLOWS</td>
              <td colSpan={13} />
            </tr>
            {INCOME_STATEMENT.recurring.slice(0,4).map((r,i) => (
              <tr key={i} className={i%2===0?"bg-white":"bg-[#F9F9F9]"}>
                <td className="px-6 py-1.5 text-xs text-[#0f172a]">{r.label}</td>
                <td className="px-4 py-1.5 text-xs text-right text-red-700">({fmt(r.annual)})</td>
                {MONTHS.map(m => <td key={m} className="px-2 py-1.5 text-[10px] text-right text-red-600">({fmt(r.monthly)})</td>)}
              </tr>
            ))}
            <tr className="bg-red-100 font-bold">
              <td className="px-4 py-2 text-xs font-bold text-red-900">TOTAL OUTFLOWS</td>
              <td className="px-4 py-2 text-xs text-right font-bold text-red-900">({fmt(totalOut)})</td>
              {MONTHS.map((m,i) => <td key={m} className="px-2 py-2 text-[10px] text-right font-bold text-red-900">({fmt(CASH_FLOW_DATA[i].outflow)})</td>)}
            </tr>

            <tr className="bg-[#0f172a] text-white font-bold">
              <td className="px-4 py-3 text-sm font-bold">NET CASH POSITION</td>
              <td className="px-4 py-3 text-sm text-right font-bold">{fmt(netFlow)}</td>
              {MONTHS.map((m,i) => <td key={m} className="px-2 py-3 text-[10px] text-right font-bold">{fmt(CASH_FLOW_DATA[i].net)}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VarianceReport({ ministry, dept, year }: { ministry: string; dept: string; year: string }) {
  const rows = [
    { label: "Government Allocation", budgeted: 1666667, actual: 1800000 },
    { label: "Donors",               budgeted: 66667,   actual: 72000   },
    { label: "Income Subscriptions", budgeted: 16667,   actual: 18000   },
    { label: "Rent",                 budgeted: 3333,    actual: 3600     },
    { label: "Admin Costs",          budgeted: 5417,    actual: 5850     },
    { label: "Salaries and Wages",   budgeted: 100000,  actual: 108000  },
    { label: "Travelling",           budgeted: 41667,   actual: 45000   },
    { label: "Vehicles",             budgeted: 450000,  actual: 486000  },
    { label: "Buildings",            budgeted: 350000,  actual: 378000  },
    { label: "Development Projects", budgeted: 375000,  actual: 405000  },
  ];
  return (
    <div className="bg-white border border-black/10" style={{ borderRadius: 0 }}>
      <div className="bg-[#0f172a] text-white text-center py-4 px-4">
        <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</div>
        <div className="font-bold text-base">{ministry} — {dept}</div>
        <div className="text-white/80 text-xs mt-1">BUDGET VARIANCE REPORT — BUDGET VS ACTUAL — FY {year}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e293b] text-white">
              <th className="text-left px-4 py-2 text-xs font-bold">Item</th>
              <th className="text-right px-4 py-2 text-xs font-bold">Annual Budget</th>
              <th className="text-right px-4 py-2 text-xs font-bold">Budgeted (Month)</th>
              <th className="text-right px-4 py-2 text-xs font-bold">Actual</th>
              <th className="text-right px-4 py-2 text-xs font-bold">Variance</th>
              <th className="text-right px-4 py-2 text-xs font-bold">Variance %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const variance = r.budgeted - r.actual;
              const pct = ((variance / r.budgeted) * 100).toFixed(1);
              const over = variance < 0;
              return (
                <tr key={i} className={i%2===0?"bg-[#F9F9F9]":"bg-white"}>
                  <td className="px-4 py-2 text-xs text-[#0f172a]">{r.label}</td>
                  <td className="px-4 py-2 text-xs text-right">{fmt(r.budgeted * 12)}</td>
                  <td className="px-4 py-2 text-xs text-right">{fmt(r.budgeted)}</td>
                  <td className="px-4 py-2 text-xs text-right">{fmt(r.actual)}</td>
                  <td className={`px-4 py-2 text-xs text-right font-semibold ${over?"text-red-600":"text-[#0F172A]"}`}>
                    {over ? `(${fmt(Math.abs(variance))})` : fmt(variance)}
                  </td>
                  <td className={`px-4 py-2 text-xs text-right font-semibold ${over?"text-red-600":"text-[#0F172A]"}`}>
                    {over ? `(${Math.abs(Number(pct))}%)` : `${pct}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Ministry sidebar data ────────────────────────────────────────────────
const MINISTRY_LIST = [
  { id: "mof",    short: "Finance",     full: "Ministry of Finance & Economic Development", dept: "Treasury Operations",          pct: 57 },
  { id: "moh",    short: "Health",      full: "Ministry of Health & Child Care",            dept: "Medical Stores Division",      pct: 70 },
  { id: "moe",    short: "Education",   full: "Ministry of Education",                      dept: "Primary Education Dept",       pct: 57 },
  { id: "mot",    short: "Transport",   full: "Ministry of Transport",                      dept: "Infrastructure Division",      pct: 87 },
  { id: "moag",   short: "Agriculture", full: "Ministry of Agriculture",                    dept: "Agric. Development Div.",      pct: 52 },
  { id: "moict",  short: "ICT",         full: "Ministry of ICT",                            dept: "ICT Infrastructure Div.",      pct: 64 },
  { id: "moenrg", short: "Energy",      full: "Ministry of Energy",                         dept: "Energy Development Div.",      pct: 86 },
  { id: "mow",    short: "Water",       full: "Ministry of Water",                          dept: "Water Utilities Dept",         pct: 67 },
  { id: "moha",   short: "Home Affairs",full: "Ministry of Home Affairs",                   dept: "Administration Dept",          pct: 70 },
  { id: "zimra",  short: "ZIMRA",       full: "Zimbabwe Revenue Authority",                 dept: "Revenue Operations",           pct: 70 },
  { id: "zinara", short: "ZINARA",      full: "Zimbabwe National Roads Administration",     dept: "Roads Fund Administration",    pct: 80 },
];

export default function FinancialStatementsPage() {
  const [tab, setTab] = useState<StmtTab>("income");
  const [selectedMinistryId, setSelectedMinistryId] = useState(MINISTRY_LIST[0].id);
  const [dept, setDept] = useState(DEPARTMENTS[0]);
  const [soespv, setSoespv] = useState(SOE_SPV_OPTS[0]);
  const [cell, setCell] = useState(CELL_OPTS[0]);
  const [year, setYear] = useState(FINANCIAL_YEARS[0]);

  const selectedMinistryObj = MINISTRY_LIST.find(m => m.id === selectedMinistryId) ?? MINISTRY_LIST[0];
  const ministry = selectedMinistryObj.full;

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Ministry of Finance & Economic Development"
        module="Finance"
        process="Financial Statements"
        financialYear="FY2026"
        pageType="report"
      />
      <div className="flex h-full">
        {/* Ministry Sidebar */}
        <div className="w-56 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col overflow-hidden">
          <div className="px-3 pt-3 pb-2 border-b border-gray-100">
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Ministries & Entities</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {MINISTRY_LIST.map(m => (
              <button key={m.id} onClick={() => setSelectedMinistryId(m.id)}
                className={`w-full text-left px-3 py-2.5 border-b border-gray-50 transition-colors ${
                  selectedMinistryId === m.id ? "bg-[#0f172a] text-white" : "hover:bg-slate-50/60 text-gray-800"
                }`}>
                <div className={`text-xs font-semibold truncate ${selectedMinistryId === m.id ? "text-white" : "text-gray-900"}`}>{m.short}</div>
                <div className="flex items-center justify-between mt-0.5 gap-1">
                  <div className={`flex-1 h-1 rounded-full overflow-hidden ${selectedMinistryId === m.id ? "bg-white/20" : "bg-gray-100"}`}>
                    <div className={`h-full rounded-full ${m.pct >= 85 ? "bg-red-400" : m.pct >= 75 ? "bg-slate-400" : "bg-slate-400"}`}
                      style={{ width: `${m.pct}%` }} />
                  </div>
                  <span className={`text-[9px] font-bold flex-shrink-0 ${selectedMinistryId === m.id ? "text-white/80" : "text-gray-500"}`}>{m.pct}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* AI Header */}
        <div className="bg-[#0f172a] text-white px-5 py-4 flex items-center gap-3" style={{ borderRadius: 0 }}>
          <div className="h-10 w-10 rounded-full ai-logo-gradient ai-logo-glow flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold">Financial Statements</h1>
            <p className="text-slate-400 text-xs">Income Statement · Balance Sheet · Cash Flow Statement · Variance Report</p>
          </div>
          <div className="flex gap-2">
            <button className="h-8 px-3 border border-white/20 text-white text-xs flex items-center gap-1.5 hover:bg-white/10 appois-glow-on-hover" style={{ borderRadius: 0 }}>
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
            <button className="h-8 px-3 bg-[#0F172A] text-white text-xs flex items-center gap-1.5 hover:bg-[#0F172A] appois-glow-on-hover" style={{ borderRadius: 0 }}>
              <Download className="h-3.5 w-3.5" /> Export Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-black/10 px-4 py-3 flex flex-wrap items-center gap-3" style={{ borderRadius: 0 }}>
          <Filter className="h-4 w-4 text-black/40" />
          {[
            { label: "SOE / SPV",     value: soespv,   setValue: setSoespv,   options: SOE_SPV_OPTS    },
            { label: "Cell",          value: cell,     setValue: setCell,     options: CELL_OPTS       },
            { label: "Financial Year",value: year,     setValue: setYear,     options: FINANCIAL_YEARS },
          ].map(({ label, value, setValue, options }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="text-xs text-black/50 font-semibold">{label}:</span>
              <select value={value} onChange={e => setValue(e.target.value)}
                className="h-8 px-2 text-xs border border-black/15 bg-white focus:outline-none" style={{ borderRadius: 0 }}>
                {options.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <button onClick={() => { setSoespv(SOE_SPV_OPTS[0]); setCell(CELL_OPTS[0]); setYear(FINANCIAL_YEARS[0]); }}
            className="h-8 px-3 border border-black/10 text-xs text-black/50 hover:bg-gray-50 ml-auto" style={{ borderRadius: 0 }}>
            Reset All
          </button>
        </div>

        {/* Statement tabs */}
        <div className="flex border-b border-black/10 bg-white overflow-x-auto">
          {[
            { key: "income" as StmtTab,    label: "📊 Income Statement" },
            { key: "balance" as StmtTab,   label: "⚖️ Balance Sheet" },
            { key: "cashflow" as StmtTab,  label: "💵 Cash Flow Statement" },
            { key: "variance" as StmtTab,  label: "📈 Budget Variance Report" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors -mb-px ${tab === t.key ? "border-[#0f172a] text-[#0f172a] bg-slate-50/50" : "border-transparent text-black/40 hover:text-black hover:bg-[#F9F9F9]"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "income"   && <IncomeStatement   ministry={ministry} dept={selectedMinistryObj.dept} year={year} />}
        {tab === "balance"  && <BalanceSheet       ministry={ministry} dept={selectedMinistryObj.dept} year={year} />}
        {tab === "cashflow" && <CashFlowStatement  ministry={ministry} dept={selectedMinistryObj.dept} year={year} />}
        {tab === "variance" && <VarianceReport     ministry={ministry} dept={selectedMinistryObj.dept} year={year} />}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
