/**
 * PresidentDashboard — Briefing Module 13
 * Implements the full Executive KPI framework from spec:
 *   - National Performance Index (NPI) composite score
 *   - Top Banner (NPI, GDP, inflation, budget execution, revenue, citizen sat)
 *   - Ministry Scorecards (Green/Amber/Red, 7-component weighted score)
 *   - Action Centre (overdue directives, pending Cabinet, audit findings)
 *   - Service Delivery Panel (passports, licences, healthcare, education)
 *   - Risk & Security Panel
 *   - Executive Alerts
 *   - All 16 KPI category tabs (Budget, Procurement, Projects, HR, Audit, etc.)
 */
import { useState } from "react";
import { AppShell, PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { ZW_MINISTRIES } from "@/lib/zw-ministries";
import {
  Crown, Sparkles, TrendingUp, AlertTriangle, CheckCircle2, XCircle,
  Clock, AlertOctagon, Shield, Wallet, Building2, UsersRound, FileText,
  Landmark, BarChart3, Globe2, Activity, ChevronRight, Flag, Gavel,
  BookOpen, ShieldCheck, Target, Megaphone, MapPin, DollarSign, User,
  Bell, ChevronDown, RefreshCcw, Download, Printer,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, AreaChart, Area, Cell, Legend, RadialBarChart, RadialBar,
} from "recharts";

// ─── NPI Weights (from spec) ──────────────────────────────────────────────────
const NPI_WEIGHTS = [
  { area: "Project Delivery",          weight: 0.20, score: 87 },
  { area: "Strategic Goals",           weight: 0.15, score: 91 },
  { area: "Budget Performance",        weight: 0.15, score: 83 },
  { area: "Service Delivery",          weight: 0.15, score: 78 },
  { area: "Procurement Performance",   weight: 0.10, score: 85 },
  { area: "Audit Compliance",          weight: 0.10, score: 79 },
  { area: "Risk Management",           weight: 0.05, score: 88 },
  { area: "Human Resource Performance",weight: 0.05, score: 82 },
  { area: "Citizen Satisfaction",      weight: 0.05, score: 74 },
];
const NPI_SCORE = Math.round(NPI_WEIGHTS.reduce((s, x) => s + x.score * x.weight, 0));

// ─── Ministry scorecard weights (from spec) ───────────────────────────────────
// Budget Utilisation 20%, Project Delivery 25%, Service Delivery 20%,
// Financial Compliance 10%, Audit Findings 10%, Procurement Compliance 10%, Citizen Satisfaction 5%
function calcMinistryScore(i: number) {
  const seed = (base: number) => base + ((i * 17 + 31) % 25);
  const bu  = seed(70); // budget utilisation
  const pd  = seed(65); // project delivery
  const sd  = seed(68); // service delivery
  const fc  = seed(72); // financial compliance
  const af  = seed(60); // audit findings (inverted — lower findings = higher score)
  const pc  = seed(71); // procurement compliance
  const cs  = seed(63); // citizen satisfaction
  return Math.round(bu*0.20 + pd*0.25 + sd*0.20 + fc*0.10 + af*0.10 + pc*0.10 + cs*0.05);
}

const MINISTRY_DATA = ZW_MINISTRIES.map((m, i) => ({
  id: m.id, code: m.code,
  name: m.name.replace("Ministry of ", ""),
  fullName: m.name,
  depts: m.departments.length,
  soes: m.stateEntities.length,
  budget: 80 + ((i * 73) % 540),
  spent:  50 + ((i * 47) % 420),
  tenders: 3 + ((i * 11) % 28),
  contracts: 5 + ((i * 7) % 22),
  staff: 120 + ((i * 137) % 1800),
  score: calcMinistryScore(i),
  budgetUtil: 70 + ((i * 17 + 31) % 25),
  projectDelivery: 65 + ((i * 17 + 31) % 25),
  serviceDelivery: 68 + ((i * 17 + 31) % 25),
  financialCompliance: 72 + ((i * 17 + 31) % 25),
  auditFindings: 60 + ((i * 17 + 31) % 25),
  procurementCompliance: 71 + ((i * 17 + 31) % 25),
  citizenSatisfaction: 63 + ((i * 17 + 31) % 25),
}));

// ─── Performance grade helper ─────────────────────────────────────────────────
function grade(score: number) {
  if (score >= 90) return { label: "A", color: "text-[#0F172A]", bg: "bg-slate-100", ring: "ring-emerald-500", bar: "#475569" };
  if (score >= 80) return { label: "B", color: "text-[#0F172A]",    bg: "bg-slate-100",    ring: "ring-blue-500",    bar: "#334155" };
  if (score >= 70) return { label: "C", color: "text-[#0F172A]",   bg: "bg-slate-100",   ring: "ring-amber-500",   bar: "#64748B" };
  if (score >= 60) return { label: "D", color: "text-[#0F172A]",  bg: "bg-slate-100",  ring: "ring-orange-500",  bar: "#f97316" };
  return           { label: "E", color: "text-red-600",    bg: "bg-red-100",    ring: "ring-red-500",    bar: "#DC2626" };
}
function trafficLight(score: number) {
  if (score >= 80) return "bg-[#0F172A]";
  if (score >= 65) return "bg-slate-400";
  return "bg-red-500";
}
function npiStatus(score: number) {
  if (score >= 95) return { label: "Excellent",  color: "text-slate-500", interpretation: "Government is performing exceptionally well." };
  if (score >= 90) return { label: "Very Good",  color: "text-slate-400", interpretation: "Minor improvements required." };
  if (score >= 80) return { label: "Good",       color: "text-slate-400",    interpretation: "Performance is generally on track but should be monitored." };
  if (score >= 70) return { label: "Fair",       color: "text-slate-400",   interpretation: "Intervention needed in selected ministries or programmes." };
  if (score >= 60) return { label: "Poor",       color: "text-slate-400",  interpretation: "Executive intervention required." };
  return           { label: "Critical",  color: "text-red-400",     interpretation: "Immediate action and accountability measures required." };
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const QUARTERLY = [
  { q: "Q1 2025", spend: 412, revenue: 380, deficit: -32 },
  { q: "Q2 2025", spend: 488, revenue: 442, deficit: -46 },
  { q: "Q3 2025", spend: 521, revenue: 471, deficit: -50 },
  { q: "Q4 2025", spend: 567, revenue: 524, deficit: -43 },
  { q: "Q1 2026", spend: 594, revenue: 562, deficit: -32 },
  { q: "Q2 2026", spend: 628, revenue: 597, deficit: -31 },
];

const DIRECTIVES = [
  { id:"PD-001", directive:"Accelerate Hwange Power Station Units 7&8",         ministry:"Energy",       due:"2026-06-30", status:"Overdue",    daysLeft:-22 },
  { id:"PD-002", directive:"Implement National Health Insurance Framework",      ministry:"Health",       due:"2026-08-15", status:"In Progress",daysLeft:26  },
  { id:"PD-003", directive:"Complete 2,500 km Rural Road Programme — Phase II", ministry:"Transport",    due:"2026-09-01", status:"On Track",   daysLeft:43  },
  { id:"PD-004", directive:"Digitise all Land Registry Records",                 ministry:"Lands",        due:"2026-07-01", status:"Overdue",    daysLeft:-19 },
  { id:"PD-005", directive:"Reduce Passport Processing to 5 Working Days",      ministry:"Home Affairs", due:"2026-07-15", status:"In Progress",daysLeft:-5  },
  { id:"PD-006", directive:"Establish SME Credit Guarantee Fund",               ministry:"Finance",      due:"2026-08-30", status:"On Track",   daysLeft:41  },
];

const CABINET_DECISIONS = [
  { ref:"CAB-2026-041", decision:"National Development Plan 2026-2030 adoption",  due:"2026-07-10", status:"Pending",     ministry:"OPC"       },
  { ref:"CAB-2026-038", decision:"Public Sector Wage Review — FY2026/27",          due:"2026-07-05", status:"Overdue",     ministry:"Finance"   },
  { ref:"CAB-2026-035", decision:"New Investment Zones — 3 Special Economic Zones",due:"2026-07-20", status:"Pending",     ministry:"Industry"  },
  { ref:"CAB-2026-031", decision:"National Water Authority restructuring",          due:"2026-06-28", status:"Overdue",     ministry:"Water"     },
];

const AUDIT_UNRESOLVED = [
  { ministry:"Energy",     findings: 4, type:"Critical", since:"2026-03-12" },
  { ministry:"Transport",  findings: 3, type:"Critical", since:"2026-04-01" },
  { ministry:"Mines",      findings: 3, type:"High",     since:"2026-04-18" },
  { ministry:"Health",     findings: 2, type:"High",     since:"2026-05-02" },
  { ministry:"Agriculture",findings: 2, type:"High",     since:"2026-05-15" },
];

const SERVICE_DELIVERY = [
  { service:"Passport Issuance",       target:"5 Days",  actual:"8.3 Days",  score:60, status:"Behind" },
  { service:"Driving Licence",         target:"3 Days",  actual:"2.1 Days",  score:95, status:"On Track"},
  { service:"Business Registration",   target:"1 Day",   actual:"1.4 Days",  score:71, status:"Behind" },
  { service:"Birth Certificate",       target:"1 Day",   actual:"0.9 Days",  score:100,status:"On Track"},
  { service:"Health Outpatient",       target:"<2 hrs",  actual:"3.2 hrs",   score:63, status:"Behind" },
  { service:"Primary School Enrolment",target:"1 Day",   actual:"1.1 Days",  score:91, status:"On Track"},
  { service:"Social Protection Grant", target:"5 Days",  actual:"7.8 Days",  score:64, status:"Behind" },
  { service:"Land Title Transfer",     target:"10 Days", actual:"18.4 Days", score:54, status:"Behind" },
];

const RISKS = [
  { id:"RSK-01", area:"Fiscal",       risk:"Treasury cash reserve approaches floor threshold",         severity:"Critical", probability:"High",   days:11 },
  { id:"RSK-02", area:"Procurement",  risk:"Sole-source contract concentration — Energy ministry",    severity:"High",     probability:"High",   days:0  },
  { id:"RSK-03", area:"Projects",     risk:"Hwange Units 7&8 — 62% probability of >90-day slip",     severity:"High",     probability:"High",   days:90 },
  { id:"RSK-04", area:"HR",           risk:"Critical skills vacancy rate >12% in Health sector",      severity:"High",     probability:"Medium", days:30 },
  { id:"RSK-05", area:"Governance",   risk:"Conflict of interest declarations overdue — 18 officials",severity:"Medium",   probability:"Medium", days:14 },
  { id:"RSK-06", area:"Security",     risk:"3 border cyber-intrusion attempts detected this week",    severity:"Medium",   probability:"Low",    days:0  },
];

const AI_ALERTS = [
  { sev:"critical", text:"Anomaly: Energy ministry awarded 3 sole-source contracts >$10M in 7 days",       ts:"12 min ago" },
  { sev:"critical", text:"Hwange Unit 7&8 — 62% probability of >90-day project slip (AI forecast)",         ts:"45 min ago" },
  { sev:"high",     text:"Treasury cash position will breach reserve floor in 11 days at current burn rate", ts:"1h ago"     },
  { sev:"high",     text:"Vendor concentration: 4 vendors hold 38% of all active contract value",             ts:"2h ago"     },
  { sev:"high",     text:"Passport processing time has increased to 8.3 days — target is 5 days",            ts:"3h ago"     },
  { sev:"medium",   text:"PRAZ compliance score for Mines dropped 6 pts over last 30 days",                   ts:"4h ago"     },
  { sev:"medium",   text:"Budget variance >5% detected in 6 ministries — Q2 review due",                     ts:"6h ago"     },
  { sev:"low",      text:"14 presidential directives have fewer than 10 days to deadline",                    ts:"1d ago"     },
];

const PROCUREMENT_KPIS = [
  { kpi:"Procurement Plan Achievement", formula:"Completed ÷ Planned", value:"84%",   target:"100%", ok:false },
  { kpi:"Tender Completion Rate",       formula:"Completed ÷ Total",   value:"91%",   target:"90%",  ok:true  },
  { kpi:"Average Procurement Cycle",    formula:"Total Days ÷ No. Procurements", value:"38 days", target:"<45 days", ok:true },
  { kpi:"Competitive Tender Ratio",     formula:"Competitive ÷ Total", value:"88%",   target:"90%",  ok:false },
  { kpi:"Single Source Procurement",    formula:"Single Source ÷ Total",value:"12%",  target:"<10%", ok:false },
];

const PROJECT_KPIS = [
  { kpi:"Project Completion Rate",      formula:"Completed ÷ Total",        value:"89%",   target:"95%",  ok:false },
  { kpi:"Projects on Schedule",         formula:"On-Time ÷ Total",          value:"86%",   target:"90%",  ok:false },
  { kpi:"Cost Variance (avg)",          formula:"Actual Cost − Budget",      value:"+$12M", target:"<5%",  ok:false },
  { kpi:"Contractor Performance Index", formula:"Average Contractor Score",  value:"78/100",target:">80",  ok:false },
];

const BUDGET_KPIS = [
  { kpi:"Budget Utilisation",             formula:"Actual ÷ Approved ×100",     value:"82%",    target:"95-100%", ok:false },
  { kpi:"Development Budget Utilisation", formula:"Dev. Expenditure ÷ Dev. Budget ×100", value:"91%", target:">90%", ok:true },
  { kpi:"Recurrent Budget Utilisation",   formula:"Recurrent Expenditure ÷ Budget ×100",value:"99%", target:"<100%",ok:true },
  { kpi:"Budget Variance",               formula:"Budget − Actual",             value:"$218M",  target:"<5%",     ok:false },
  { kpi:"Revenue Collection",            formula:"Actual Revenue ÷ Target ×100",value:"97%",    target:">100%",   ok:false },
];

const STRATEGIC_KPIS = [
  { kpi:"Strategic Goal Achievement",            formula:"Achieved ÷ Planned ×100",               value:"88%", target:"90%", ok:false },
  { kpi:"National Development Plan Implementation",formula:"Completed Activities ÷ Planned ×100", value:"83%", target:"90%", ok:false },
  { kpi:"Annual Work Plan Completion",           formula:"Completed Activities ÷ Planned ×100",    value:"91%", target:"90%", ok:true  },
  { kpi:"Programme Success Rate",               formula:"Successful ÷ Total Programmes ×100",      value:"87%", target:"90%", ok:false },
];

// ─── Shared sub-components ────────────────────────────────────────────────────
function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${color}`}>{children}</span>;
}
function SectionHead({ title, sub, icon: Icon, count }: { title: string; sub?: string; icon?: React.ElementType; count?: number }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-black/8 flex-shrink-0">
      {Icon && <div className="h-8 w-8 rounded-lg bg-[#0f172a] grid place-items-center flex-shrink-0"><Icon className="h-4 w-4 text-white" /></div>}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-[#0f172a]">{title}</div>
        {sub && <div className="text-[10px] text-black/45">{sub}</div>}
      </div>
      {count !== undefined && (
        <span className="text-xs font-bold bg-[#0f172a] text-white px-2 py-0.5 rounded">{count}</span>
      )}
    </div>
  );
}
function KpiRow({ rows }: { rows: { kpi:string; formula:string; value:string; target:string; ok:boolean }[] }) {
  return (
    <table className="w-full text-xs">
      <thead className="bg-[#f8fafc] border-b border-black/8">
        <tr>
          {["KPI","Formula","Value","Target","Status"].map(h => (
            <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-black/50 whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-black/5">
        {rows.map(r => (
          <tr key={r.kpi} className={`${r.ok ? "bg-slate-50/30" : "bg-red-50/20"}`}>
            <td className="px-4 py-2.5 font-semibold text-black">{r.kpi}</td>
            <td className="px-4 py-2.5 text-black/55 font-mono text-[10px]">{r.formula}</td>
            <td className="px-4 py-2.5 font-bold text-[#0f172a]">{r.value}</td>
            <td className="px-4 py-2.5 text-black/50">{r.target}</td>
            <td className="px-4 py-2.5">
              {r.ok
                ? <Pill color="bg-slate-100 text-[#0F172A]">✓ ON TARGET</Pill>
                : <Pill color="bg-red-100 text-red-700">✗ BELOW TARGET</Pill>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Tab definitions ──────────────────────────────────────────────────────────
type Tab = "overview" | "ministry" | "action" | "budget" | "procurement" |
           "projects" | "service" | "risk" | "directives" | "cabinet" |
           "audit" | "strategic" | "hr" | "ict" | "financial" | "alerts";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id:"overview",    label:"Overview",              icon:Crown         },
  { id:"ministry",    label:"Ministry Scorecards",   icon:Landmark      },
  { id:"action",      label:"Action Centre",         icon:AlertOctagon  },
  { id:"budget",      label:"Budget Oversight",      icon:Wallet        },
  { id:"procurement", label:"Procurement KPIs",      icon:FileText      },
  { id:"projects",    label:"Project Management",    icon:Activity      },
  { id:"service",     label:"Service Delivery",      icon:UsersRound    },
  { id:"risk",        label:"Risk & Security",       icon:Shield        },
  { id:"directives",  label:"Presidential Directives",icon:Flag         },
  { id:"cabinet",     label:"Cabinet KPIs",          icon:Gavel         },
  { id:"audit",       label:"Internal Audit",        icon:ShieldCheck   },
  { id:"strategic",   label:"Strategic Planning",    icon:Target        },
  { id:"hr",          label:"Public Service HR",     icon:User          },
  { id:"ict",         label:"ICT KPIs",              icon:Globe2        },
  { id:"financial",   label:"Financial KPIs",        icon:DollarSign    },
  { id:"alerts",      label:"Executive Alerts",      icon:Bell          },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function PresidentDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [expandedMinistry, setExpandedMinistry] = useState<string | null>(null);
  const npi = npiStatus(NPI_SCORE);
  const totalBudget   = MINISTRY_DATA.reduce((s, m) => s + m.budget, 0);
  const totalSpent    = MINISTRY_DATA.reduce((s, m) => s + m.spent, 0);
  const totalTenders  = MINISTRY_DATA.reduce((s, m) => s + m.tenders, 0);
  const totalContracts= MINISTRY_DATA.reduce((s, m) => s + m.contracts, 0);
  const totalStaff    = MINISTRY_DATA.reduce((s, m) => s + m.staff, 0);
  const overdueDirectives = DIRECTIVES.filter(d => d.daysLeft < 0).length;
  const overdueDecisions  = CABINET_DECISIONS.filter(d => d.status === "Overdue").length;
  const criticalAudit     = AUDIT_UNRESOLVED.filter(a => a.type === "Critical").length;

  return (
    <AppShell>
      <PageContextBar
        ministry="Office of the President and Cabinet"
        module="Executive Dashboard"
        process="National Performance Command Centre"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="flex flex-col h-full overflow-hidden">

        {/* ── TOP BANNER ──────────────────────────────────────────────────── */}
        <div className="bg-[#0f172a] text-white flex-shrink-0 border-b border-white/10">
          {/* Header row */}
          <div className="flex items-center gap-4 px-5 py-3 border-b border-white/10">
            <div className="h-10 w-10 rounded-xl bg-[#0F172A] grid place-items-center flex-shrink-0">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold">Office of the President — National Command Centre</div>
              <div className="text-[10px] text-white/45">Briefing Module 13 · Whole-of-government oversight · {new Date().toLocaleString("en-GB")}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-xs">
                <div className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                Live
              </div>
              <button className="h-8 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs flex items-center gap-1.5 transition-colors">
                <RefreshCcw className="h-3.5 w-3.5" /> Refresh
              </button>
              <button className="h-8 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-xs flex items-center gap-1.5 transition-colors">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>
          </div>
          {/* NPI + macro KPIs */}
          <div className="flex items-stretch gap-0 overflow-x-auto">
            {/* NPI composite */}
            <div className="flex items-center gap-4 px-6 py-4 border-r border-white/10 flex-shrink-0 min-w-[220px]">
              <div className="relative h-16 w-16 flex-shrink-0">
                <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                  <circle cx="32" cy="32" r="28" fill="none" stroke={NPI_SCORE>=90?"#475569":NPI_SCORE>=80?"#334155":NPI_SCORE>=70?"#64748B":"#DC2626"}
                    strokeWidth="6" strokeDasharray={`${(NPI_SCORE/100)*175.9} 175.9`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center rotate-0">
                  <span className="text-lg font-black text-white">{NPI_SCORE}</span>
                </div>
              </div>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-0.5">National Performance Index</div>
                <div className={`text-lg font-black ${npi.color}`}>{npi.label}</div>
                <div className="text-[10px] text-white/50 mt-0.5 max-w-[140px] leading-relaxed">{npi.interpretation}</div>
              </div>
            </div>

            {/* Macro KPI tiles */}
            {[
              { label:"GDP Growth",       value:"4.2%",  sub:"FY2026 est.",    ok:true,  icon:TrendingUp  },
              { label:"Inflation",        value:"6.8%",  sub:"Annual CPI",     ok:true,  icon:Activity    },
              { label:"Budget Execution", value:"82%",   sub:"Target: 95–100%",ok:false, icon:Wallet      },
              { label:"Revenue Collection",value:"97%",  sub:"Target: >100%",  ok:false, icon:DollarSign  },
              { label:"Citizen Satisfaction",value:"74%",sub:"Target: >80%",   ok:false, icon:UsersRound  },
              { label:"Active Ministries",value:String(ZW_MINISTRIES.length), sub:"All compliant", ok:true, icon:Landmark },
              { label:"Live Contracts",   value:String(totalContracts), sub:`Tenders: ${totalTenders}`, ok:true, icon:FileText },
              { label:"Action Items",     value:String(overdueDirectives + overdueDecisions + criticalAudit), sub:"Require attention", ok:overdueDirectives+overdueDecisions+criticalAudit===0, icon:AlertOctagon },
            ].map(k => {
              const Icon = k.icon;
              return (
                <div key={k.label} className="flex flex-col justify-center px-4 py-4 border-r border-white/10 flex-shrink-0 min-w-[120px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-3.5 w-3.5 text-white/40 flex-shrink-0" />
                    <span className="text-[9px] font-semibold text-white/40 uppercase tracking-wider truncate">{k.label}</span>
                  </div>
                  <div className={`text-2xl font-black ${k.ok ? "text-slate-500" : "text-slate-500"}`}>{k.value}</div>
                  <div className="text-[10px] text-white/35 mt-0.5">{k.sub}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── TAB BAR ─────────────────────────────────────────────────────── */}
        <div className="bg-white border-b border-black/10 flex-shrink-0 overflow-x-auto">
          <div className="flex items-stretch min-w-max">
            {TABS.map(t => {
              const Icon = t.icon;
              const isAlert = t.id === "action" && (overdueDirectives + overdueDecisions + criticalAudit) > 0;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap relative
                    ${tab === t.id
                      ? "border-[#0f172a] text-[#0f172a] bg-white"
                      : "border-transparent text-black/45 hover:text-black hover:bg-gray-50"}`}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  {t.label}
                  {isAlert && (
                    <span className="h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-black grid place-items-center ml-0.5">
                      {overdueDirectives + overdueDecisions + criticalAudit}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CONTENT AREA ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-[#f4f7fb]">

          {/* ════ OVERVIEW ════ */}
          {tab === "overview" && (
            <div className="p-5 space-y-5">
              {/* NPI breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-white border border-black/8 rounded-xl overflow-hidden lg:col-span-2">
                  <SectionHead title="National Performance Index — Composite Breakdown" sub="Weighted score per area (from spec)" icon={Crown} />
                  <div className="p-4 space-y-2">
                    {NPI_WEIGHTS.map(w => {
                      const g = grade(w.score);
                      return (
                        <div key={w.area} className="flex items-center gap-3">
                          <div className="w-48 text-xs text-black/70 font-medium truncate flex-shrink-0">{w.area}</div>
                          <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all" style={{ width:`${w.score}%`, backgroundColor: g.bar }}>
                              <span className="text-[9px] font-black text-white">{w.score}%</span>
                            </div>
                          </div>
                          <div className={`text-[10px] font-black w-6 text-center ${g.color}`}>{g.label}</div>
                          <div className="text-[10px] text-black/40 w-14 text-right flex-shrink-0">{(w.weight*100).toFixed(0)}% weight</div>
                        </div>
                      );
                    })}
                    <div className="flex items-center gap-3 border-t border-black/8 pt-2 mt-2">
                      <div className="w-48 text-xs font-black text-[#0f172a] flex-shrink-0">COMPOSITE NPI SCORE</div>
                      <div className="flex-1 h-6 bg-[#0f172a] rounded-full overflow-hidden">
                        <div className="h-full rounded-full flex items-center justify-end pr-3 bg-[#0F172A]" style={{ width:`${NPI_SCORE}%` }}>
                          <span className="text-[10px] font-black text-white">{NPI_SCORE}%</span>
                        </div>
                      </div>
                      <div className={`text-sm font-black ${npi.color} bg-[#0f172a] px-2 py-0.5 rounded`}>{npi.label}</div>
                    </div>
                  </div>
                </div>

                {/* Performance grades legend + ministry summary */}
                <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                  <SectionHead title="Performance Grades" sub="A–E grading scale from spec" icon={BarChart3} />
                  <div className="p-4 space-y-2">
                    {[
                      { label:"A — Excellent",  range:"90–100", color:"bg-[#0F172A]" },
                      { label:"B — Good",       range:"80–89",  color:"bg-[#0F172A]"    },
                      { label:"C — Fair",       range:"70–79",  color:"bg-[#0F172A]"   },
                      { label:"D — Poor",       range:"60–69",  color:"bg-[#0F172A]"  },
                      { label:"E — Critical",   range:"Below 60",color:"bg-red-600"    },
                    ].map(g => (
                      <div key={g.label} className="flex items-center gap-3">
                        <div className={`h-6 w-16 rounded flex items-center justify-center text-white text-[10px] font-black ${g.color}`}>{g.range}</div>
                        <span className="text-xs text-black/70">{g.label}</span>
                      </div>
                    ))}
                    <div className="border-t border-black/8 pt-3 mt-2 grid grid-cols-2 gap-2">
                      {[
                        { label:"Green (≥80%)",  color:"bg-[#0F172A]", desc:"On track"  },
                        { label:"Amber (65–79%)",color:"bg-slate-400",   desc:"Watch"     },
                        { label:"Red (<65%)",    color:"bg-red-500",     desc:"Intervene" },
                      ].map(t => (
                        <div key={t.label} className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full flex-shrink-0 ${t.color}`} />
                          <span className="text-[10px] text-black/60">{t.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fiscal charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                  <SectionHead title="Quarterly Spend vs Revenue" sub="National treasury — $M" icon={Wallet} />
                  <div className="p-4" style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={QUARTERLY}>
                        <defs>
                          <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3}/><stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient>
                          <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.3}/><stop offset="100%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="q" fontSize={10} /><YAxis fontSize={10} />
                        <Tooltip /><Legend wrapperStyle={{ fontSize:11 }} />
                        <Area type="monotone" dataKey="spend"   name="Spend"   stroke="#3B82F6" fill="url(#gs)" />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" fill="url(#gr)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                  <SectionHead title="Fiscal Deficit Trend" sub="Quarterly deficit — $M" icon={TrendingUp} />
                  <div className="p-4" style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={QUARTERLY}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="q" fontSize={10} /><YAxis fontSize={10} />
                        <Tooltip />
                        <Line type="monotone" dataKey="deficit" stroke="#DC2626" strokeWidth={2.5} dot={{ r:4, fill:"#DC2626" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ MINISTRY SCORECARDS ════ */}
          {tab === "ministry" && (
            <div className="p-5">
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead
                  title="Ministry Scorecards — Colour-coded Rankings"
                  sub="7-component weighted score. Green ≥80 · Amber 65–79 · Red <65. Click any row to drill down."
                  icon={Landmark}
                  count={ZW_MINISTRIES.length}
                />
                {/* Legend */}
                <div className="px-4 py-2 bg-[#f8fafc] border-b border-black/8 flex items-center gap-4 text-[10px] text-black/50 flex-wrap">
                  {[
                    { w:"25%", label:"Project Delivery" }, { w:"20%", label:"Budget Utilisation" },
                    { w:"20%", label:"Service Delivery" }, { w:"10%", label:"Financial Compliance" },
                    { w:"10%", label:"Audit Findings" },   { w:"10%", label:"Procurement Compliance" },
                    { w:"5%",  label:"Citizen Satisfaction" },
                  ].map(c => <span key={c.label}><strong>{c.w}</strong> {c.label}</span>)}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-[#0f172a] text-white">
                      <tr>
                        {["Ministry","Score","Grade","Budget Util","Project Del","Service Del","Fin. Comp","Audit","Proc. Comp","Citizen Sat","Action"].map(h => (
                          <th key={h} className="text-left px-3 py-2.5 text-[10px] font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...MINISTRY_DATA].sort((a,b) => b.score - a.score).map(m => {
                        const g = grade(m.score);
                        const isExpanded = expandedMinistry === m.id;
                        return (
                          <>
                            <tr key={m.id}
                              className={`border-b border-black/6 cursor-pointer transition-colors
                                ${isExpanded ? "bg-slate-50" : "hover:bg-[#f4f7fb]"}`}
                              onClick={() => setExpandedMinistry(isExpanded ? null : m.id)}
                            >
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className={`h-3 w-3 rounded-full flex-shrink-0 ${trafficLight(m.score)}`} />
                                  <span className="font-semibold text-black truncate max-w-[200px]">{m.fullName}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-1.5">
                                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-16">
                                    <div className="h-full rounded-full" style={{ width:`${m.score}%`, backgroundColor: g.bar }} />
                                  </div>
                                  <span className="font-bold text-black whitespace-nowrap">{m.score}%</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <span className={`text-xs font-black px-2 py-0.5 rounded ${g.bg} ${g.color}`}>{g.label}</span>
                              </td>
                              {[m.budgetUtil, m.projectDelivery, m.serviceDelivery, m.financialCompliance, m.auditFindings, m.procurementCompliance, m.citizenSatisfaction].map((v, i) => (
                                <td key={i} className="px-3 py-2.5 text-center">
                                  <span className={`text-[10px] font-bold ${v>=80?"text-[#0F172A]":v>=65?"text-[#0F172A]":"text-red-600"}`}>{v}%</span>
                                </td>
                              ))}
                              <td className="px-3 py-2.5">
                                <ChevronDown className={`h-3.5 w-3.5 text-black/40 transition-transform ${isExpanded?"rotate-180":""}`} />
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr key={`${m.id}-detail`} className="bg-slate-50/70 border-b border-slate-200">
                                <td colSpan={11} className="px-5 py-4">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                    <div className="bg-white border border-black/8 rounded-lg p-3">
                                      <div className="text-[10px] text-black/45 uppercase font-semibold mb-1">Budget</div>
                                      <div className="font-bold text-black">${m.budget}M allocated</div>
                                      <div className="text-black/50">${m.spent}M spent ({Math.round((m.spent/m.budget)*100)}%)</div>
                                    </div>
                                    <div className="bg-white border border-black/8 rounded-lg p-3">
                                      <div className="text-[10px] text-black/45 uppercase font-semibold mb-1">Procurement</div>
                                      <div className="font-bold text-black">{m.tenders} active tenders</div>
                                      <div className="text-black/50">{m.contracts} live contracts</div>
                                    </div>
                                    <div className="bg-white border border-black/8 rounded-lg p-3">
                                      <div className="text-[10px] text-black/45 uppercase font-semibold mb-1">Human Resources</div>
                                      <div className="font-bold text-black">{m.staff.toLocaleString()} staff</div>
                                      <div className="text-black/50">{m.depts} departments</div>
                                    </div>
                                    <div className="bg-white border border-black/8 rounded-lg p-3">
                                      <div className="text-[10px] text-black/45 uppercase font-semibold mb-1">State Entities</div>
                                      <div className="font-bold text-black">{m.soes} SOEs</div>
                                      <div className={`font-bold mt-1 ${grade(m.score).color}`}>Grade {grade(m.score).label} — {m.score}%</div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════ ACTION CENTRE ════ */}
          {tab === "action" && (
            <div className="p-5 space-y-5">
              {/* Summary counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:"Overdue Directives",   value:DIRECTIVES.filter(d=>d.daysLeft<0).length,        color:"bg-red-600",    icon:Flag        },
                  { label:"Overdue Cabinet Items", value:CABINET_DECISIONS.filter(d=>d.status==="Overdue").length, color:"bg-[#0F172A]", icon:Gavel    },
                  { label:"Critical Audit Findings",value:AUDIT_UNRESOLVED.filter(a=>a.type==="Critical").length, color:"bg-red-700",    icon:ShieldCheck },
                  { label:"High Risks Active",     value:RISKS.filter(r=>r.severity==="Critical"||r.severity==="High").length, color:"bg-[#0F172A]", icon:AlertOctagon },
                ].map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className={`${s.color} text-white rounded-xl p-4 flex items-center gap-3`}>
                      <div className="h-10 w-10 rounded-xl bg-white/20 grid place-items-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-black">{s.value}</div>
                        <div className="text-xs text-white/80">{s.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overdue Presidential Directives */}
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Overdue Presidential Directives" sub="Requires immediate executive follow-up" icon={Flag} count={DIRECTIVES.filter(d=>d.daysLeft<0).length} />
                <table className="w-full text-xs">
                  <thead className="bg-[#f8fafc] border-b border-black/8">
                    <tr>{["ID","Directive","Ministry","Due Date","Status","Days"].map(h=><th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-black/50 whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {DIRECTIVES.map(d => (
                      <tr key={d.id} className={d.daysLeft < 0 ? "bg-red-50/40" : d.daysLeft < 10 ? "bg-slate-50/40" : ""}>
                        <td className="px-4 py-3 font-mono text-black/50">{d.id}</td>
                        <td className="px-4 py-3 font-medium text-black max-w-xs"><div className="truncate">{d.directive}</div></td>
                        <td className="px-4 py-3 text-black/60 whitespace-nowrap">{d.ministry}</td>
                        <td className="px-4 py-3 text-black/50 whitespace-nowrap">{d.due}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded
                            ${d.status==="Overdue"?"bg-red-100 text-red-700":d.status==="In Progress"?"bg-slate-100 text-[#0F172A]":"bg-slate-100 text-[#0F172A]"}`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold whitespace-nowrap">
                          <span className={d.daysLeft < 0 ? "text-red-600" : d.daysLeft < 10 ? "text-[#0F172A]" : "text-[#0F172A]"}>
                            {d.daysLeft < 0 ? `${Math.abs(d.daysLeft)} days overdue` : `${d.daysLeft} days left`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pending Cabinet Decisions */}
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Pending Cabinet Decisions" sub="Implementation tracking" icon={Gavel} count={CABINET_DECISIONS.length} />
                <table className="w-full text-xs">
                  <thead className="bg-[#f8fafc] border-b border-black/8">
                    <tr>{["Ref","Decision","Ministry","Due Date","Status"].map(h=><th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-black/50 whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {CABINET_DECISIONS.map(d => (
                      <tr key={d.ref} className={d.status==="Overdue"?"bg-red-50/40":""}>
                        <td className="px-4 py-3 font-mono text-black/50">{d.ref}</td>
                        <td className="px-4 py-3 font-medium text-black max-w-xs"><div className="truncate">{d.decision}</div></td>
                        <td className="px-4 py-3 text-black/60">{d.ministry}</td>
                        <td className="px-4 py-3 text-black/50">{d.due}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${d.status==="Overdue"?"bg-red-100 text-red-700":"bg-slate-100 text-[#0F172A]"}`}>{d.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Unresolved Audit Findings */}
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Unresolved Audit Findings — Critical & High" sub="Requiring executive attention" icon={ShieldCheck} count={AUDIT_UNRESOLVED.length} />
                <div className="divide-y divide-black/5">
                  {AUDIT_UNRESOLVED.map((a, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3">
                      <div className={`h-8 w-8 rounded-lg grid place-items-center flex-shrink-0 ${a.type==="Critical"?"bg-red-100":"bg-slate-100"}`}>
                        <AlertTriangle className={`h-4 w-4 ${a.type==="Critical"?"text-red-600":"text-[#0F172A]"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-black">{a.ministry}</div>
                        <div className="text-[10px] text-black/45">Outstanding since {a.since}</div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${a.type==="Critical"?"bg-red-100 text-red-700":"bg-slate-100 text-[#0F172A]"}`}>{a.type}</span>
                      <span className="text-sm font-black text-black">{a.findings} findings</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════ BUDGET OVERSIGHT ════ */}
          {tab === "budget" && (
            <div className="p-5 space-y-5">
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Budget Oversight KPIs" sub="Formula · Target · Status — from spec" icon={Wallet} />
                <KpiRow rows={BUDGET_KPIS} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                  <SectionHead title="Budget Utilisation by Ministry" sub="Top 12 ministries — $M" icon={BarChart3} />
                  <div className="p-4" style={{ height:300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[...MINISTRY_DATA].sort((a,b)=>b.budget-a.budget).slice(0,12)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" fontSize={10} tickFormatter={(v:number)=>`$${v}M`} />
                        <YAxis dataKey="name" type="category" fontSize={9} width={80} />
                        <Tooltip formatter={(v:number)=>`$${v}M`} />
                        <Legend wrapperStyle={{fontSize:10}} />
                        <Bar dataKey="budget" name="Budget" fill="#3B82F6" radius={[0,3,3,0]} />
                        <Bar dataKey="spent"  name="Spent"  fill="#10B981" radius={[0,3,3,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                  <SectionHead title="Revenue vs Target / Quarterly Spending" sub="National treasury — $M" icon={TrendingUp} />
                  <div className="p-4" style={{ height:300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={QUARTERLY}>
                        <defs>
                          <linearGradient id="bs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3}/><stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient>
                          <linearGradient id="br" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={0.3}/><stop offset="100%" stopColor="#10B981" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="q" fontSize={10} /><YAxis fontSize={10} />
                        <Tooltip /><Legend wrapperStyle={{fontSize:10}} />
                        <Area type="monotone" dataKey="spend"   name="Spending" stroke="#3B82F6" fill="url(#bs)" />
                        <Area type="monotone" dataKey="revenue" name="Revenue"  stroke="#10B981" fill="url(#br)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ PROCUREMENT KPIs ════ */}
          {tab === "procurement" && (
            <div className="p-5 space-y-5">
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Procurement KPIs" sub="PRAZ compliance · Tender cycle · Competitive ratios — from spec" icon={FileText} />
                <KpiRow rows={PROCUREMENT_KPIS} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:"Total Tenders",       value:String(totalTenders),   color:"text-[#0F172A]",    icon:FileText    },
                  { label:"Active Contracts",     value:String(totalContracts), color:"text-[#0F172A]", icon:ShieldCheck },
                  { label:"Avg Cycle (days)",     value:"38",                   color:"text-[#0F172A]",   icon:Clock       },
                  { label:"Competitive Rate",     value:"88%",                  color:"text-[#0F172A]",  icon:Target      },
                ].map(k => {
                  const Icon = k.icon;
                  return (
                    <div key={k.label} className="bg-white border border-black/8 rounded-xl p-4 flex items-center gap-3">
                      <Icon className={`h-7 w-7 ${k.color} flex-shrink-0`} />
                      <div>
                        <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                        <div className="text-[11px] text-black/45">{k.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Procurement Compliance by Ministry" sub="PRAZ compliance score" icon={BarChart3} />
                <div className="p-4" style={{ height:260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MINISTRY_DATA.slice(0,15)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="code" fontSize={9} />
                      <YAxis domain={[0,100]} fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="procurementCompliance" name="Compliance %" radius={[3,3,0,0]}>
                        {MINISTRY_DATA.slice(0,15).map((m,i) => (
                          <Cell key={i} fill={m.procurementCompliance>=80?"#475569":m.procurementCompliance>=65?"#64748B":"#DC2626"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ════ PROJECT MANAGEMENT ════ */}
          {tab === "projects" && (
            <div className="p-5 space-y-5">
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Project Management KPIs" sub="Completion · Schedule · Cost Variance · Contractor Performance — from spec" icon={Activity} />
                <KpiRow rows={PROJECT_KPIS} />
              </div>
              {/* Presidential Priority Programmes */}
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Presidential Priority Programmes" sub="Vision 2030 strategic themes" icon={Flag} />
                <table className="w-full text-xs">
                  <thead className="bg-[#f8fafc] border-b border-black/8">
                    <tr>{["Theme","On Track","At Risk","Delayed","Progress","Overall"].map(h=><th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-black/50 whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {[
                      { theme:"Vision 2030 Infrastructure",   on:18, atRisk:5, delayed:2 },
                      { theme:"Health Sector Reform",          on:9,  atRisk:3, delayed:1 },
                      { theme:"Education Modernisation",       on:12, atRisk:2, delayed:0 },
                      { theme:"Energy Self-Sufficiency",       on:7,  atRisk:4, delayed:3 },
                      { theme:"Digital Government",            on:14, atRisk:3, delayed:1 },
                      { theme:"Agriculture Transformation",    on:11, atRisk:5, delayed:2 },
                    ].map(p => {
                      const total = p.on + p.atRisk + p.delayed;
                      const pct   = Math.round((p.on / total) * 100);
                      const g     = grade(pct);
                      return (
                        <tr key={p.theme} className="hover:bg-[#f4f7fb]">
                          <td className="px-4 py-3 font-medium text-black">{p.theme}</td>
                          <td className="px-4 py-3 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0F172A]">{p.on}</span></td>
                          <td className="px-4 py-3 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0F172A]">{p.atRisk}</span></td>
                          <td className="px-4 py-3 text-center"><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">{p.delayed}</span></td>
                          <td className="px-4 py-3 w-40">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                                <div className="h-full rounded-full" style={{ width:`${pct}%`, backgroundColor: g.bar }} />
                              </div>
                              <span className="text-[10px] font-bold w-8 text-right">{pct}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded ${g.bg} ${g.color}`}>{g.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ SERVICE DELIVERY ════ */}
          {tab === "service" && (
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:"On Target",  value:String(SERVICE_DELIVERY.filter(s=>s.status==="On Track").length), color:"bg-[#0F172A]" },
                  { label:"Behind",     value:String(SERVICE_DELIVERY.filter(s=>s.status==="Behind").length),   color:"bg-red-600"     },
                  { label:"Avg Score",  value:`${Math.round(SERVICE_DELIVERY.reduce((s,x)=>s+x.score,0)/SERVICE_DELIVERY.length)}%`, color:"bg-[#0F172A]" },
                  { label:"Services Monitored", value:String(SERVICE_DELIVERY.length), color:"bg-slate-600" },
                ].map(k => (
                  <div key={k.label} className={`${k.color} text-white rounded-xl p-4`}>
                    <div className="text-2xl font-black">{k.value}</div>
                    <div className="text-xs text-white/80 mt-1">{k.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Citizen Service Delivery — Live Metrics" sub="Target processing times vs actual — from spec" icon={UsersRound} />
                <table className="w-full text-xs">
                  <thead className="bg-[#f8fafc] border-b border-black/8">
                    <tr>{["Service","Target","Actual","Score","Status"].map(h=><th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-black/50 whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {SERVICE_DELIVERY.map(s => (
                      <tr key={s.service} className={s.status==="Behind"?"bg-red-50/30":""}>
                        <td className="px-4 py-3 font-medium text-black">{s.service}</td>
                        <td className="px-4 py-3 text-black/50">{s.target}</td>
                        <td className="px-4 py-3 font-bold text-black">{s.actual}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width:`${s.score}%`, backgroundColor: s.score>=80?"#475569":s.score>=65?"#64748B":"#DC2626" }} />
                            </div>
                            <span className="font-bold text-[10px]">{s.score}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${s.status==="On Track"?"bg-slate-100 text-[#0F172A]":"bg-red-100 text-red-700"}`}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ RISK & SECURITY ════ */}
          {tab === "risk" && (
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:"Critical Risks", value:String(RISKS.filter(r=>r.severity==="Critical").length), color:"bg-red-600"    },
                  { label:"High Risks",     value:String(RISKS.filter(r=>r.severity==="High").length),     color:"bg-[#0F172A]" },
                  { label:"Medium Risks",   value:String(RISKS.filter(r=>r.severity==="Medium").length),   color:"bg-[#0F172A]"  },
                  { label:"Total Active",   value:String(RISKS.length),                                    color:"bg-slate-700"  },
                ].map(k => (
                  <div key={k.label} className={`${k.color} text-white rounded-xl p-4`}>
                    <div className="text-2xl font-black">{k.value}</div>
                    <div className="text-xs text-white/80 mt-1">{k.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Risk Register — Active High & Critical Risks" sub="Requiring executive attention or Cabinet escalation" icon={Shield} count={RISKS.length} />
                <div className="divide-y divide-black/5">
                  {RISKS.map(r => (
                    <div key={r.id} className={`flex items-start gap-4 px-5 py-4 ${r.severity==="Critical"?"bg-red-50/40":r.severity==="High"?"bg-slate-50/30":""}`}>
                      <div className={`h-10 w-10 rounded-xl grid place-items-center flex-shrink-0
                        ${r.severity==="Critical"?"bg-red-100":r.severity==="High"?"bg-slate-100":"bg-slate-100"}`}>
                        <AlertOctagon className={`h-5 w-5 ${r.severity==="Critical"?"text-red-600":r.severity==="High"?"text-[#0F172A]":"text-[#0F172A]"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-[10px] font-bold bg-[#0f172a] text-white px-2 py-0.5 rounded">{r.area}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded
                            ${r.severity==="Critical"?"bg-red-100 text-red-700":r.severity==="High"?"bg-slate-100 text-[#0F172A]":"bg-slate-100 text-[#0F172A]"}`}>
                            {r.severity}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded ${r.probability==="High"?"bg-red-50 text-red-500":r.probability==="Medium"?"bg-slate-50 text-[#0F172A]":"bg-gray-50 text-gray-500"}`}>
                            {r.probability} Probability
                          </span>
                        </div>
                        <div className="text-sm font-medium text-black">{r.risk}</div>
                      </div>
                      <div className="text-[10px] text-black/40 flex-shrink-0 text-right">
                        {r.id}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* National Security KPIs from spec */}
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="National Security KPIs" sub="From spec — critical incidents, response time, alerts" icon={Shield} />
                <KpiRow rows={[
                  { kpi:"Critical Incidents Responded", formula:"Responded ÷ Reported", value:"94%",     target:"100%",   ok:false },
                  { kpi:"Average Response Time",        formula:"Minutes",              value:"18 min",   target:"<15 min",ok:false },
                  { kpi:"Security Alerts Closed",       formula:"Closed ÷ Total Alerts",value:"87%",     target:">95%",   ok:false },
                  { kpi:"Border Incident Resolution",   formula:"Resolved ÷ Reported",  value:"91%",     target:">90%",   ok:true  },
                ]} />
              </div>
            </div>
          )}

          {/* ════ PRESIDENTIAL DIRECTIVES ════ */}
          {tab === "directives" && (
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:"Directives Completed",  value:`${Math.round((DIRECTIVES.filter(d=>d.status==="On Track").length/DIRECTIVES.length)*100)}%`, color:"text-[#0F172A]" },
                  { label:"Overdue Directives",     value:`${DIRECTIVES.filter(d=>d.daysLeft<0).length}`,   color:"text-red-600"     },
                  { label:"In Progress",            value:`${DIRECTIVES.filter(d=>d.status==="In Progress").length}`, color:"text-[#0F172A]" },
                  { label:"Avg Completion Days",    value:"42 days", color:"text-[#0F172A]" },
                ].map(k => (
                  <div key={k.label} className="bg-white border border-black/8 rounded-xl p-4">
                    <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                    <div className="text-[11px] text-black/45 mt-1">{k.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Presidential Directives KPIs" sub="Directive · Responsible Ministry · Status · Due Date · Days Remaining — from spec" icon={Flag} count={DIRECTIVES.length} />
                <table className="w-full text-xs">
                  <thead className="bg-[#0f172a] text-white">
                    <tr>{["ID","Directive","Ministry","Due Date","Status","Days Remaining"].map(h=><th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {DIRECTIVES.map(d => (
                      <tr key={d.id} className={`hover:bg-[#f4f7fb] ${d.daysLeft<0?"bg-red-50/40":d.daysLeft<10?"bg-slate-50/30":""}`}>
                        <td className="px-4 py-3 font-mono text-black/50">{d.id}</td>
                        <td className="px-4 py-3 font-medium text-black max-w-xs"><div className="truncate">{d.directive}</div></td>
                        <td className="px-4 py-3 text-black/60 whitespace-nowrap">{d.ministry}</td>
                        <td className="px-4 py-3 text-black/50 whitespace-nowrap">{d.due}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded
                            ${d.status==="Overdue"?"bg-red-100 text-red-700":d.status==="In Progress"?"bg-slate-100 text-[#0F172A]":"bg-slate-100 text-[#0F172A]"}`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold">
                          <span className={d.daysLeft<0?"text-red-600":d.daysLeft<10?"text-[#0F172A]":"text-[#0F172A]"}>
                            {d.daysLeft<0 ? `${Math.abs(d.daysLeft)}d overdue` : `${d.daysLeft}d left`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ CABINET KPIs ════ */}
          {tab === "cabinet" && (
            <div className="p-5 space-y-5">
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Cabinet KPIs" sub="Decisions implemented · Papers on time · Meeting attendance · Outstanding decisions" icon={Gavel} />
                <KpiRow rows={[
                  { kpi:"Cabinet Decisions Implemented", formula:"Completed ÷ Total Decisions",     value:"88%",  target:">90%", ok:false },
                  { kpi:"Cabinet Papers Submitted on Time",formula:"Timely Papers ÷ Total Papers",  value:"91%",  target:">95%", ok:false },
                  { kpi:"Meeting Attendance",             formula:"Attendance ÷ Expected Attendance",value:"96%", target:"100%", ok:false },
                  { kpi:"Outstanding Decisions",          formula:"Pending Decisions count",         value:"14",   target:"0",    ok:false },
                ]} />
              </div>
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Pending Cabinet Decisions Register" sub="Full tracking with responsible ministry and status" icon={Gavel} count={CABINET_DECISIONS.length} />
                <table className="w-full text-xs">
                  <thead className="bg-[#f8fafc] border-b border-black/8">
                    <tr>{["Ref","Decision","Ministry","Due Date","Status"].map(h=><th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-black/50 whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {CABINET_DECISIONS.map(d => (
                      <tr key={d.ref} className={`hover:bg-[#f4f7fb] ${d.status==="Overdue"?"bg-red-50/30":""}`}>
                        <td className="px-4 py-3 font-mono text-black/50">{d.ref}</td>
                        <td className="px-4 py-3 font-medium text-black max-w-xs"><div className="truncate">{d.decision}</div></td>
                        <td className="px-4 py-3 text-black/60">{d.ministry}</td>
                        <td className="px-4 py-3 text-black/50">{d.due}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${d.status==="Overdue"?"bg-red-100 text-red-700":"bg-slate-100 text-[#0F172A]"}`}>{d.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════ INTERNAL AUDIT ════ */}
          {tab === "audit" && (
            <div className="p-5 space-y-5">
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Internal Audit KPIs" sub="Findings closed · High risk · Repeat findings · Audit plan completion" icon={ShieldCheck} />
                <KpiRow rows={[
                  { kpi:"Audit Findings Closed",   formula:"Closed ÷ Total Findings",          value:"74%",  target:">90%", ok:false },
                  { kpi:"High Risk Findings",      formula:"High Risk ÷ Total Findings",        value:"18%",  target:"<10%", ok:false },
                  { kpi:"Repeat Findings",         formula:"Repeat ÷ Previous Findings",        value:"22%",  target:"<5%",  ok:false },
                  { kpi:"Audit Plan Completion",   formula:"Completed Audits ÷ Planned Audits", value:"81%",  target:">95%", ok:false },
                ]} />
              </div>
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Audit Findings by Ministry — Severity" sub="Current quarter outstanding" icon={BarChart3} />
                <div className="p-4" style={{ height:280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { ministry:"Energy",     critical:4, high:7,  medium:12, low:18 },
                      { ministry:"Transport",  critical:3, high:9,  medium:14, low:22 },
                      { ministry:"Health",     critical:2, high:5,  medium:11, low:16 },
                      { ministry:"Education",  critical:1, high:4,  medium:9,  low:14 },
                      { ministry:"Defence",    critical:2, high:6,  medium:8,  low:12 },
                      { ministry:"Mines",      critical:3, high:5,  medium:10, low:13 },
                      { ministry:"Finance",    critical:1, high:3,  medium:7,  low:11 },
                      { ministry:"Agriculture",critical:2, high:6,  medium:13, low:19 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="ministry" fontSize={9} angle={-20} textAnchor="end" height={45} />
                      <YAxis fontSize={10} />
                      <Tooltip /><Legend wrapperStyle={{fontSize:10}} />
                      <Bar dataKey="critical" stackId="a" name="Critical" fill="#DC2626" />
                      <Bar dataKey="high"     stackId="a" name="High"     fill="#F59E0B" />
                      <Bar dataKey="medium"   stackId="a" name="Medium"   fill="#8B5CF6" />
                      <Bar dataKey="low"      stackId="a" name="Low"      fill="#94A3B8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Risk Management KPIs" sub="High risks mitigated · Overdue · Review compliance · Emerging risks" icon={Shield} />
                <KpiRow rows={[
                  { kpi:"High Risks Mitigated",     formula:"Mitigated ÷ High Risks",               value:"71%",  target:">85%", ok:false },
                  { kpi:"Risks Overdue",            formula:"Overdue Risks ÷ Total Risks",           value:"14%",  target:"<5%",  ok:false },
                  { kpi:"Risk Review Compliance",   formula:"Reviews Conducted ÷ Planned Reviews",   value:"88%",  target:">95%", ok:false },
                  { kpi:"Emerging Risks Identified",formula:"New Risks Identified this quarter",     value:"6",    target:"—",    ok:true  },
                ]} />
              </div>
            </div>
          )}

          {/* ════ STRATEGIC PLANNING ════ */}
          {tab === "strategic" && (
            <div className="p-5 space-y-5">
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Strategic Planning KPIs" sub="Strategic goals · NDP implementation · Annual work plan · Programme success — target 90%" icon={Target} />
                <KpiRow rows={STRATEGIC_KPIS} />
              </div>
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Governance KPIs" sub="Ethics · Conflict declarations · Compliance rate · Policy compliance" icon={Landmark} />
                <KpiRow rows={[
                  { kpi:"Ethics Cases Closed",              formula:"Closed ÷ Total Cases",               value:"82%",  target:">95%", ok:false },
                  { kpi:"Conflict Declarations Submitted",  formula:"Submitted ÷ Expected",               value:"79%",  target:"100%", ok:false },
                  { kpi:"Compliance Rate",                  formula:"Compliant Activities ÷ Total",       value:"88%",  target:">95%", ok:false },
                  { kpi:"Policy Compliance — Ministries",   formula:"Compliant Ministries count",          value:"18/26",target:"26/26",ok:false },
                ]} />
              </div>
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Anti-Corruption KPIs" sub="Fraud cases · Procurement exceptions · Asset declarations · Case resolution" icon={AlertOctagon} />
                <KpiRow rows={[
                  { kpi:"Fraud Cases Investigated",      formula:"Completed ÷ Reported",          value:"91%",  target:"100%", ok:false },
                  { kpi:"Procurement Exceptions",        formula:"Exceptions ÷ Total Procurement", value:"8%",   target:"<5%",  ok:false },
                  { kpi:"Asset Declaration Compliance",  formula:"Submitted ÷ Required",           value:"84%",  target:"100%", ok:false },
                  { kpi:"Corruption Case Resolution",    formula:"Resolved ÷ Total Cases",         value:"78%",  target:">90%", ok:false },
                ]} />
              </div>
            </div>
          )}

          {/* ════ PUBLIC SERVICE HR ════ */}
          {tab === "hr" && (
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:"Total Civil Servants", value:totalStaff.toLocaleString(), color:"text-[#0F172A]"    },
                  { label:"Vacancy Rate",          value:"9.2%",                      color:"text-red-600"     },
                  { label:"Staff Turnover",        value:"4.8%",                      color:"text-[#0F172A]"   },
                  { label:"Training Completion",   value:"71%",                       color:"text-[#0F172A]"  },
                ].map(k => (
                  <div key={k.label} className="bg-white border border-black/8 rounded-xl p-4">
                    <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                    <div className="text-[11px] text-black/45 mt-1">{k.label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Public Service KPIs" sub="Vacancy · Recruitment cycle · Productivity · Turnover · Training — vacancy target <5%" icon={User} />
                <KpiRow rows={[
                  { kpi:"Vacancy Rate",          formula:"Vacant Posts ÷ Approved Posts",     value:"9.2%",    target:"<5%",    ok:false },
                  { kpi:"Recruitment Cycle",     formula:"Days to Fill Vacancy",               value:"62 days", target:"<45 days",ok:false },
                  { kpi:"Employee Productivity", formula:"Output ÷ Number of Employees",       value:"78/100",  target:">85",    ok:false },
                  { kpi:"Staff Turnover",        formula:"Employees Leaving ÷ Total Staff",    value:"4.8%",    target:"<5%",    ok:true  },
                  { kpi:"Training Completion",   formula:"Staff Trained ÷ Planned Training",   value:"71%",     target:">90%",   ok:false },
                ]} />
              </div>
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Staff Distribution by Ministry — Top 12" sub="Civil servants per ministry" icon={UsersRound} />
                <div className="p-4" style={{ height:260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[...MINISTRY_DATA].sort((a,b)=>b.staff-a.staff).slice(0,12)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" fontSize={10} tickFormatter={(v:number)=>v.toLocaleString()} />
                      <YAxis dataKey="name" type="category" fontSize={9} width={80} />
                      <Tooltip formatter={(v:number)=>v.toLocaleString()} />
                      <Bar dataKey="staff" name="Staff" fill="#6366f1" radius={[0,3,3,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ════ ICT KPIs ════ */}
          {tab === "ict" && (
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:"System Availability",  value:"99.7%", target:"99.9%", ok:false, color:"text-[#0F172A]"   },
                  { label:"Cyber Incidents (Q)",   value:"7",     target:"0",     ok:false, color:"text-red-600"     },
                  { label:"Avg Resolution Time",   value:"4.2h",  target:"<2h",   ok:false, color:"text-[#0F172A]"  },
                  { label:"User Satisfaction",     value:"78%",   target:">85%",  ok:false, color:"text-[#0F172A]"    },
                ].map(k => (
                  <div key={k.label} className="bg-white border border-black/8 rounded-xl p-4">
                    <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
                    <div className="text-[11px] text-black/45 mt-0.5">{k.label}</div>
                    <div className="text-[10px] text-black/30">Target: {k.target}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="ICT KPIs" sub="System availability target 99.9% · Cyber incidents · Resolution time · User satisfaction" icon={Globe2} />
                <KpiRow rows={[
                  { kpi:"System Availability",  formula:"Uptime Hours ÷ Total Hours",  value:"99.7%", target:"99.9%",  ok:false },
                  { kpi:"Cyber Incidents (Q)",  formula:"Incidents Reported",           value:"7",     target:"0",      ok:false },
                  { kpi:"Resolution Time",      formula:"Average Hours",                value:"4.2h",  target:"<2h",    ok:false },
                  { kpi:"User Satisfaction",    formula:"Survey Score",                 value:"78%",   target:">85%",   ok:false },
                ]} />
              </div>
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Executive Reporting KPIs" sub="Reports produced on time · Accuracy · Requests completed · Reporting time" icon={BarChart3} />
                <KpiRow rows={[
                  { kpi:"Reports Submitted on Time", formula:"Timely Reports ÷ Total",         value:"88%",  target:">95%", ok:false },
                  { kpi:"Report Accuracy",           formula:"Accurate Reports ÷ Total",        value:"94%",  target:">99%", ok:false },
                  { kpi:"Executive Requests Completed",formula:"Completed ÷ Requested",        value:"91%",  target:"100%", ok:false },
                  { kpi:"Average Reporting Time",    formula:"Days from period end to delivery",value:"4 days",target:"2 days",ok:false },
                ]} />
              </div>
            </div>
          )}

          {/* ════ FINANCIAL KPIs ════ */}
          {tab === "financial" && (
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label:"GDP Growth",              value:"4.2%",      trend:"+0.3%",  up:true  },
                  { label:"Inflation (CPI)",          value:"6.8%",      trend:"-0.4%",  up:false },
                  { label:"Debt to GDP",              value:"48.3%",     trend:"+1.2%",  up:false },
                  { label:"Budget Deficit",           value:"-$218M",    trend:"improving",up:true },
                  { label:"Fiscal Balance",           value:"-$218M",    trend:"Q2 FY2026",up:false},
                  { label:"Foreign Reserves",         value:"$1.84B",    trend:"3.2 mths",up:true },
                  { label:"Revenue Growth",           value:"+8.4%",     trend:"YoY",    up:true  },
                  { label:"Expenditure Growth",       value:"+11.2%",    trend:"YoY",    up:false },
                  { label:"Capital Expenditure Ratio",value:"22%",       trend:"of total",up:true },
                  { label:"Development Spending",     value:"18%",       trend:"of total",up:true },
                ].map(k => (
                  <div key={k.label} className="bg-white border border-black/8 rounded-xl p-4">
                    <div className={`text-xl font-bold ${k.up?"text-[#0F172A]":"text-red-600"}`}>{k.value}</div>
                    <div className="text-[11px] text-black/50 mt-0.5">{k.label}</div>
                    <div className="text-[10px] text-black/30">{k.trend}</div>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <SectionHead title="Disaster Management KPIs" sub="Response time · Relief distribution · Recovery · Emergency readiness" icon={AlertTriangle} />
                <KpiRow rows={[
                  { kpi:"Disaster Response Time",  formula:"Hours",                       value:"3.2h",  target:"<2h",    ok:false },
                  { kpi:"Relief Distribution",     formula:"Delivered ÷ Planned",          value:"87%",   target:">95%",   ok:false },
                  { kpi:"Recovery Completion",     formula:"Completed ÷ Planned",          value:"74%",   target:">90%",   ok:false },
                  { kpi:"Emergency Readiness",     formula:"Prepared Plans ÷ Required",    value:"91%",   target:"100%",   ok:false },
                ]} />
              </div>
            </div>
          )}

          {/* ════ EXECUTIVE ALERTS ════ */}
          {tab === "alerts" && (
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label:"Critical",value:String(AI_ALERTS.filter(a=>a.sev==="critical").length), color:"bg-red-600"    },
                  { label:"High",    value:String(AI_ALERTS.filter(a=>a.sev==="high").length),     color:"bg-[#0F172A]" },
                  { label:"Medium",  value:String(AI_ALERTS.filter(a=>a.sev==="medium").length),   color:"bg-[#0F172A]"  },
                  { label:"Low",     value:String(AI_ALERTS.filter(a=>a.sev==="low").length),      color:"bg-[#0F172A]"   },
                ].map(k => (
                  <div key={k.label} className={`${k.color} text-white rounded-xl p-4`}>
                    <div className="text-2xl font-black">{k.value}</div>
                    <div className="text-xs text-white/80 mt-1">{k.label} alerts</div>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-black/8 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3 border-b border-black/8">
                  <div className="h-8 w-8 rounded-lg bg-[#0f172a] grid place-items-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#0f172a]">AI Executive Alerts</div>
                    <div className="text-[10px] text-black/45">Automatic notifications — missed targets · budget overruns · procurement anomalies · project delays · deteriorating ministry performance</div>
                  </div>
                </div>
                <div className="divide-y divide-black/5">
                  {AI_ALERTS.map((a, i) => {
                    const sevColor =
                      a.sev==="critical" ? { bg:"bg-red-50",    pill:"bg-red-100 text-red-700",    bar:"bg-red-500"    } :
                      a.sev==="high"     ? { bg:"bg-slate-50", pill:"bg-slate-100 text-[#0F172A]",bar:"bg-[#0F172A]"} :
                      a.sev==="medium"   ? { bg:"bg-slate-50",  pill:"bg-slate-100 text-[#0F172A]", bar:"bg-slate-400"  } :
                                           { bg:"bg-slate-50/30",pill:"bg-slate-100 text-[#0F172A]",   bar:"bg-slate-400"   };
                    return (
                      <div key={i} className={`flex items-start gap-4 px-5 py-4 ${sevColor.bg}`}>
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 mt-2 ${sevColor.bar}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${sevColor.pill}`}>{a.sev}</span>
                          </div>
                          <div className="text-sm text-black leading-snug">{a.text}</div>
                          <div className="text-[10px] text-black/40 mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />{a.ts}
                          </div>
                        </div>
                        <button className="h-7 px-3 border border-black/15 text-[10px] text-black/60 hover:bg-gray-50 rounded flex items-center gap-1 flex-shrink-0 transition-colors">
                          <ChevronRight className="h-3 w-3" /> Investigate
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>{/* end content area */}
      </div>{/* end flex column */}
    </AppShell>
  );
}
