import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import WorkflowStepper from "@/components/WorkflowStepper";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import WorkstationTower from "@/components/WorkstationTower";
import { DEPARTMENTS } from "./CorporatePage";
import { getDepartmentById } from "@/lib/workstation-data";
import { pushNotification } from "@/lib/local-store";
import {
  ArrowLeft, Users, CheckCircle2, Clock, AlertTriangle, Sparkles,
  TrendingUp, Activity, Download, ChevronRight, BarChart3,
  Target, Shield, Zap, Calendar, Flag, RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from "recharts";

// ─── Process Definitions ──────────────────────────────────────────────────────
const PROCESS_STEPS: Record<string, { group: string; steps: string[] }[]> = {
  "permanent-secretary": [
    { group: "Strategic Direction", steps: [
      "Receive government mandate and priorities",
      "Interpret policy directives",
      "Set institutional strategic direction",
      "Approve annual plans and budgets",
      "Assign responsibilities to departments",
    ]},
    { group: "Implementation Oversight", steps: [
      "Monitor implementation progress",
      "Review departmental performance reports",
      "Resolve cross-functional challenges",
      "Engage stakeholders and oversight bodies",
    ]},
    { group: "Evaluation & Reporting", steps: [
      "Evaluate institutional performance",
      "Approve corrective actions",
      "Report to Minister/Cabinet",
      "Continuous governance and improvement",
    ]},
  ],
  "strategy-policy-planning": [
    { group: "Policy Identification", steps: [
      "Identify policy issue/problem",
      "Conduct research and situation analysis",
      "Gather stakeholder inputs",
      "Develop policy options",
    ]},
    { group: "Development & Review", steps: [
      "Conduct impact assessment",
      "Draft policy/strategy document",
      "Internal consultations",
      "Management review",
      "External stakeholder validation",
      "Obtain approvals",
    ]},
    { group: "Implementation", steps: [
      "Develop implementation framework",
      "Monitor implementation",
      "Evaluate outcomes",
      "Revise policy where necessary",
    ]},
  ],
  "finance-accounting": [
    { group: "Budgeting", steps: [
      "Receive budget guidelines",
      "Collect departmental budget submissions",
      "Consolidate budget estimates",
      "Review and validate budget",
      "Obtain budget approval",
      "Allocate funds to departments",
    ]},
    { group: "Expenditure Processing", steps: [
      "Process expenditure requests",
      "Verify supporting documentation",
      "Approve payments",
      "Record financial transactions",
      "Conduct bank reconciliations",
    ]},
    { group: "Reporting & Closure", steps: [
      "Prepare financial reports",
      "Conduct internal reviews",
      "Support audits",
      "Close financial period",
      "Implement audit recommendations",
    ]},
  ],
  "procurement-supply-chain": [
    { group: "Needs & Requisition", steps: [
      "User department identifies need",
      "Raise requisition request",
      "Verify budget availability",
      "Approve procurement request",
      "Develop procurement specifications",
    ]},
    { group: "Sourcing", steps: [
      "Select procurement method",
      "Advertise/request quotations",
      "Receive bids",
      "Evaluate bids",
      "Recommend supplier",
      "Obtain procurement approval",
    ]},
    { group: "Contract & Delivery", steps: [
      "Issue purchase order/contract",
      "Supplier delivers goods/services",
      "Inspect and verify delivery",
      "Accept goods/services",
      "Process supplier invoice",
      "Authorize payment",
    ]},
    { group: "Post-Award", steps: [
      "Update inventory/assets register",
      "Evaluate supplier performance",
      "Contract close-out",
    ]},
  ],
  "service-delivery": [
    { group: "Request Management", steps: [
      "Receive client inquiry/request",
      "Register request",
      "Verify client information",
      "Assess service requirements",
      "Assign responsible officer",
    ]},
    { group: "Service Execution", steps: [
      "Process service request",
      "Communicate status updates",
      "Deliver service",
      "Obtain client confirmation",
    ]},
    { group: "Quality & Improvement", steps: [
      "Handle complaints if any",
      "Resolve issues",
      "Collect customer feedback",
      "Analyze service performance",
      "Implement service improvements",
    ]},
  ],
  "operations": [
    { group: "Planning", steps: [
      "Receive operational plan",
      "Allocate resources",
      "Schedule activities",
      "Deploy personnel and equipment",
    ]},
    { group: "Execution & Monitoring", steps: [
      "Execute operational activities",
      "Monitor operations",
      "Address operational issues",
      "Record operational data",
    ]},
    { group: "Performance", steps: [
      "Measure performance indicators",
      "Generate operational reports",
      "Review efficiency and effectiveness",
      "Implement operational improvements",
    ]},
  ],
  "human-resources": [
    { group: "Recruitment", steps: [
      "Identify vacancy",
      "Obtain recruitment approval",
      "Develop job description",
      "Advertise position",
      "Receive applications",
      "Screen applications",
      "Shortlist candidates",
      "Conduct interviews",
      "Select candidate",
      "Conduct background checks",
      "Issue offer letter",
      "Employee acceptance",
      "Onboarding and induction",
    ]},
    { group: "Employee Lifecycle", steps: [
      "Performance planning",
      "Performance monitoring",
      "Training and development",
      "Promotions/transfers",
      "Employee relations management",
      "Leave administration",
      "Disciplinary management",
      "Retirement/resignation/termination",
      "Exit interview",
      "Employee records closure",
    ]},
  ],
  "ict-digital": [
    { group: "Requirements", steps: [
      "Identify business need",
      "Gather user requirements",
      "Analyze requirements",
      "Design solution",
      "Obtain approvals",
    ]},
    { group: "Development & Deployment", steps: [
      "Develop/configure system",
      "Conduct testing",
      "User acceptance testing",
      "Deploy solution",
      "Train users",
      "Go-live support",
    ]},
    { group: "Operations & Improvement", steps: [
      "Monitor system performance",
      "Manage incidents",
      "Implement upgrades",
      "Conduct security reviews",
      "Evaluate solution effectiveness",
      "Continuous improvement",
    ]},
  ],
  "administration-facilities": [
    { group: "Service Request", steps: [
      "Identify administrative requirement",
      "Receive service request",
      "Assess requirement",
      "Allocate resources",
      "Arrange logistics/facilities support",
    ]},
    { group: "Delivery & Maintenance", steps: [
      "Execute support service",
      "Monitor service delivery",
      "Conduct maintenance inspections",
      "Address maintenance issues",
    ]},
    { group: "Asset & Improvement", steps: [
      "Manage office assets",
      "Update asset records",
      "Review service performance",
      "Plan facility improvements",
      "Implement improvements",
    ]},
  ],
  "legal-compliance-audit-risk": [
    { group: "Legal Services", steps: [
      "Receive legal matter/request",
      "Conduct legal assessment",
      "Research applicable laws",
      "Provide legal opinion",
      "Draft legal documents/contracts",
      "Review agreements",
      "Obtain approvals",
      "Support implementation",
      "Manage disputes/litigation",
      "Close legal matter",
      "Archive records",
    ]},
    { group: "Compliance Management", steps: [
      "Identify regulatory requirements",
      "Develop compliance framework",
      "Communicate requirements",
      "Monitor compliance activities",
      "Conduct compliance reviews",
      "Identify non-compliance issues",
      "Recommend corrective actions",
      "Implement corrective measures",
      "Verify compliance restoration",
      "Report compliance status",
      "Continuous monitoring",
    ]},
    { group: "Internal Audit", steps: [
      "Develop audit plan",
      "Conduct risk assessment",
      "Define audit scope",
      "Notify auditee",
      "Collect evidence",
      "Conduct fieldwork",
      "Analyze findings",
      "Draft audit report",
      "Management response",
      "Finalize report",
      "Issue recommendations",
      "Monitor implementation",
      "Follow-up audit",
      "Close audit",
    ]},
    { group: "Risk Management", steps: [
      "Identify risks",
      "Assess likelihood and impact",
      "Prioritize risks",
      "Develop mitigation strategies",
      "Assign risk owners",
      "Implement controls",
      "Monitor risk indicators",
      "Review risk effectiveness",
      "Update risk register",
      "Report risk status",
      "Continuous risk review and improvement",
    ]},
  ],
};

// ─── Monthly trend mock data ──────────────────────────────────────────────────
const TREND = [
  { m: "Jan", tasks: 28, closed: 24 },
  { m: "Feb", tasks: 34, closed: 30 },
  { m: "Mar", tasks: 22, closed: 20 },
  { m: "Apr", tasks: 40, closed: 36 },
  { m: "May", tasks: 38, closed: 33 },
  { m: "Jun", tasks: 45, closed: 42 },
];
const PIE_DATA = [
  { name: "Completed", value: 68, color: "#475569" },
  { name: "In Progress", value: 22, color: "#334155" },
  { name: "Overdue",    value: 10, color: "#64748B" },
];
const ACTIVITY_LOG = [
  { action: "Process step 4 completed — approved by Head of Department", time: "2 hrs ago",  type: "success" },
  { action: "New task assigned: Quarterly review preparation",             time: "3 hrs ago",  type: "info"    },
  { action: "AI Agent flagged anomaly in step 8 — requires review",        time: "4 hrs ago",  type: "warning" },
  { action: "Performance report submitted for Q2 2026",                    time: "Yesterday",  type: "success" },
  { action: "Compliance check passed — 98% score",                         time: "2 days ago", type: "success" },
  { action: "Step 12 escalated to Permanent Secretary",                    time: "3 days ago", type: "warning" },
];

// ─── Tab bar helper ───────────────────────────────────────────────────────────
const TABS = ["Overview", "Process Flow", "Workstations", "Performance", "AI Assistant"] as const;
type Tab = typeof TABS[number];

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-0.5 mb-5 border-b border-black/8 scrollbar-none">
      {TABS.map(t => (
        <button key={t} onClick={() => onChange(t)}
          className={`px-3 py-1.5 rounded-t-md text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
            active === t ? "bg-black/90 text-white" : "text-black/50 hover:text-black hover:bg-black/5"
          }`}>
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ dept }: { dept: typeof DEPARTMENTS[number] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Monthly Task Activity" subtitle="Tasks raised vs closed" />
          <div className="p-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND}>
                <defs>
                  <linearGradient id="colTasks"  x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#334155" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#334155" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="colClosed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#475569" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#475569" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="m" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="tasks"  stroke="#334155" fill="url(#colTasks)"  name="Raised"  strokeWidth={2} />
                <Area type="monotone" dataKey="closed" stroke="#475569" fill="url(#colClosed)" name="Closed"  strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Task Status Distribution" />
          <div className="p-4 h-[220px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pb-4 flex flex-col gap-1.5">
            {PIE_DATA.map(p => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                  <span className="text-black/60">{p.name}</span>
                </div>
                <span className="font-semibold text-black">{p.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent Activity" subtitle="Last actions and alerts" />
        <div className="divide-y divide-black/5">
          {ACTIVITY_LOG.map((a, i) => (
            <div key={i} className="px-5 py-3 flex items-start gap-3">
              <div className={`h-2 w-2 rounded-full flex-shrink-0 mt-1.5 ${
                a.type === "success" ? "bg-[#0F172A]" : a.type === "warning" ? "bg-[#0F172A]" : "bg-[#0F172A]"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-black">{a.action}</p>
                <p className="text-[10px] text-black/40 mt-0.5">{a.time}</p>
              </div>
              {a.type === "warning" && <AlertTriangle className="h-3.5 w-3.5 text-slate-600 flex-shrink-0 mt-0.5" />}
              {a.type === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-slate-600 flex-shrink-0 mt-0.5" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Process Flow Tab ─────────────────────────────────────────────────────────
function ProcessFlowTab({ deptId, deptName }: { deptId: string; deptName: string }) {
  const groups = PROCESS_STEPS[deptId] ?? [];
  const [activeStep, setActiveStep] = useState<string | null>(null);

  // Generate statuses (first group done, second active, rest pending)
  const getStatus = (groupIdx: number, stepIdx: number): "completed" | "active" | "pending" => {
    if (groupIdx === 0) return "completed";
    if (groupIdx === 1 && stepIdx === 0) return "active";
    return "pending";
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-black/50 flex-wrap">
        {[
          { color: "bg-[#0F172A]", label: "Completed" },
          { color: "bg-[#0F172A] animate-pulse", label: "Active" },
          { color: "bg-gray-300", label: "Pending" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-[#0F172A]">
          <div className="h-2 w-2 rounded-full bg-slate-300 animate-pulse" />
          AI-assisted step
        </div>
      </div>

      {groups.map((group, gi) => (
        <Card key={gi}>
          <CardHeader title={group.group} subtitle={`${group.steps.length} steps`} />
          <div className="p-4">
            {/* Horizontal stepper for the group */}
            <WorkflowStepper
              orientation="vertical"
              steps={group.steps.map((label, si) => ({
                id: si + 1,
                label,
                status: getStatus(gi, si),
                aiRole: (si % 4 === 0 && gi > 0) ? "AI Monitoring" : undefined,
              }))}
            />
          </div>
        </Card>
      ))}

      <Card>
        <CardHeader title="Process Tower Actions" subtitle="Available workflow actions" />
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Flag,       label: "Mark Step Active",    tone: "bg-slate-50 text-[#0F172A] border-slate-200"     },
            { icon: CheckCircle2, label: "Complete Step",     tone: "bg-slate-50 text-[#0F172A] border-slate-200" },
            { icon: AlertTriangle, label: "Flag for Review",  tone: "bg-slate-50 text-[#0F172A] border-slate-200"  },
            { icon: RefreshCw,  label: "Restart Process",     tone: "bg-gray-50 text-gray-600 border-gray-200"     },
          ].map(a => {
            const Icon = a.icon;
            return (
              <button key={a.label} onClick={() => pushNotification(`Action: ${a.label}`, "info")}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all hover:shadow-sm ${a.tone}`}>
                <Icon className="h-4 w-4 flex-shrink-0" /> {a.label}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── Performance Tab ──────────────────────────────────────────────────────────
function PerformanceTab({ dept }: { dept: typeof DEPARTMENTS[number] }) {
  const perfData = [
    { metric: "Q1 2025", score: 84 },
    { metric: "Q2 2025", score: 87 },
    { metric: "Q3 2025", score: 85 },
    { metric: "Q4 2025", score: 90 },
    { metric: "Q1 2026", score: dept.kpis.performanceScore - 2 },
    { metric: "Q2 2026", score: dept.kpis.performanceScore },
  ];
  const kpiItems = [
    { label: "Performance Score",  value: `${dept.kpis.performanceScore}%`, color: "green",  icon: TrendingUp    },
    { label: "Compliance Rate",    value: `${dept.kpis.compliance}%`,       color: "violet", icon: Shield        },
    { label: "Open Tasks",         value: String(dept.kpis.openTasks),      color: "amber",  icon: Clock         },
    { label: "Total Staff",        value: String(dept.kpis.staff),          color: "blue",   icon: Users         },
    { label: "Process Steps",      value: String(dept.steps),               color: "cyan",   icon: Activity      },
    { label: "Targets Met",        value: "8 / 10",                         color: "green",  icon: Target        },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {kpiItems.map(k => {
          const Icon = k.icon;
          return <KpiCard key={k.label} label={k.label} value={k.value} icon={Icon}
            color={k.color as "green"|"violet"|"amber"|"blue"|"cyan"} />;
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Performance Trend" subtitle="Quarterly scores" />
          <div className="p-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perfData}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="metric" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[70, 100]} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="score" fill="#334155" radius={[4, 4, 0, 0]} name="Score %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="KPI Scorecard" subtitle="Current period targets" />
          <div className="divide-y divide-black/5">
            {[
              { name: "Service Delivery Rate",    target: 95, actual: 92, unit: "%" },
              { name: "Process Adherence",         target: 98, actual: dept.kpis.compliance, unit: "%" },
              { name: "Staff Productivity Index",  target: 90, actual: dept.kpis.performanceScore, unit: "%" },
              { name: "Average Resolution Time",   target: 48, actual: 36, unit: "hrs" },
              { name: "Stakeholder Satisfaction",  target: 90, actual: 88, unit: "%" },
            ].map(kpi => (
              <div key={kpi.name} className="px-5 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-black/70">{kpi.name}</span>
                  <span className={`text-xs font-semibold ${kpi.actual >= kpi.target ? "text-[#0F172A]" : "text-[#0F172A]"}`}>
                    {kpi.actual}{kpi.unit} / {kpi.target}{kpi.unit}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${kpi.actual >= kpi.target ? "bg-[#0F172A]" : "bg-[#0F172A]"}`}
                    style={{ width: `${Math.min(100, (kpi.actual / kpi.target) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="AI Performance Insights" subtitle="Automated analysis by department AI" />
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Efficiency Opportunity", body: `${dept.shortName} can reduce average process cycle time by ~18% by automating steps 3–5 of its primary workflow.`, icon: Zap, color: "bg-slate-50 text-[#0F172A]" },
            { title: "Compliance Alert",        body: `2 regulatory deadlines are approaching within 14 days. Immediate action required on compliance checklist items.`,   icon: AlertTriangle, color: "bg-slate-50 text-[#0F172A]" },
            { title: "Resource Insight",        body: `Current staff-to-task ratio is 1:${Math.round(dept.kpis.openTasks / dept.kpis.staff)}. Consider redistributing workload across ${dept.kpis.staff} staff members.`, icon: Users, color: "bg-slate-50 text-[#0F172A]" },
            { title: "Trend Forecast",          body: `Based on historical data, performance score is projected to reach ${dept.kpis.performanceScore + 3}% in Q3 2026 if current trajectory is maintained.`, icon: TrendingUp, color: "bg-slate-50 text-[#0F172A]" },
          ].map(insight => {
            const Icon = insight.icon;
            return (
              <div key={insight.title} className={`rounded-xl p-4 border ${insight.color.replace("text-", "border-").replace("-600", "-200").replace("bg-", "")}`}>
                <div className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-lg grid place-items-center flex-shrink-0 ${insight.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-black mb-1">{insight.title}</div>
                    <p className="text-[11px] text-black/55 leading-relaxed">{insight.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function CorporateDepartmentPage() {
  const { deptId } = useParams<{ deptId: string }>();
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "workstations" ? "Workstations" : "Overview";
  const [tab, setTab] = useState<Tab>(initialTab as Tab);
  const [showAI, setShowAI] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

  const dept = DEPARTMENTS.find(d => d.id === deptId);

  if (!dept) {
    return (
      <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Corporate Governance"
        process="Corporate Department"
        financialYear="FY2026"
        pageType="dashboard"
      />
        <div className="p-6 text-center">
          <p className="text-sm text-black/50">Department not found.</p>
          <button onClick={() => navigate("/corporate")} className="mt-3 text-xs text-[#0F172A] hover:underline">
            ← Back to Corporate Module
          </button>
        </div>
      </AppShell>
    );
  }

  const Icon = dept.icon;
  const ibg  = {
    violet: "bg-slate-100 text-[#0F172A]", blue: "bg-slate-100 text-[#0F172A]",
    green:  "bg-slate-100 text-[#0F172A]", amber: "bg-slate-100 text-[#0F172A]",
    cyan:   "bg-slate-100 text-[#0F172A]", orange: "bg-slate-100 text-[#0F172A]",
    pink:   "bg-slate-100 text-[#0F172A]", red: "bg-red-100 text-red-600",
    muted:  "bg-gray-100 text-gray-600",
  }[dept.color] ?? "bg-slate-100 text-[#0F172A]";
  const tone = { violet:"violet", blue:"blue", green:"green", amber:"amber", cyan:"blue", orange:"amber", pink:"violet", red:"red", muted:"muted" }[dept.color] as "violet"|"blue"|"green"|"amber"|"red"|"muted" ?? "blue";

  return (
    <AppShell>
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4 text-xs text-black/40">
          <button onClick={() => navigate("/corporate")} className="hover:text-black transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Corporate Module
          </button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-black">{dept.name}</span>
        </div>

        {/* Dept header */}
        <div className="flex items-start gap-4 mb-5">
          <div className={`h-12 w-12 rounded-2xl grid place-items-center flex-shrink-0 ${ibg}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge tone="violet">Corporate Module</Badge>
              <Badge tone={tone}>{dept.shortName}</Badge>
              <Badge tone="muted">Government of Zimbabwe</Badge>
            </div>
            <PageHeader
              title={dept.name}
              description={dept.processTitle + " — " + dept.description}
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => { pushNotification(`Report generated for ${dept.name}`, "success"); }}
              className="h-8 px-3 rounded-lg border border-black/10 text-xs hover:bg-black/5 transition-colors flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Report
            </button>
            <button
              onClick={() => setAdminMode(v => !v)}
              className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                adminMode ? "bg-[#0F172A] text-white" : "border border-black/10 text-black/60 hover:bg-black/5"
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => setShowAI(v => !v)}
              className={`h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                showAI ? "bg-[#0F172A] text-white" : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> AI Assistant
            </button>
          </div>
        </div>

        {/* KPI summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <KpiCard label="Total Staff"           value={String(dept.kpis.staff)}             icon={Users}        color="blue"   />
          <KpiCard label="Open Tasks"            value={String(dept.kpis.openTasks)}         icon={Clock}        color="amber"  positive={false} />
          <KpiCard label="Compliance Rate"       value={`${dept.kpis.compliance}%`}          icon={Shield}       color="violet" />
          <KpiCard label="Performance Score"     value={`${dept.kpis.performanceScore}%`}    icon={TrendingUp}   color="green"  />
        </div>

        {/* Tab bar */}
        <TabBar active={tab} onChange={setTab} />

        {/* AI assistant panel */}
        {showAI && (
          <div className="mb-5">
            <AIAssistantPanel
              agentName={`${dept.shortName} AI Assistant`}
              agentRole="Department Intelligence Agent"
              color="violet"
              context={`${dept.name} department. Process: ${dept.processTitle}. ${dept.description}`}
              suggestedPrompts={[
                `Summarise the ${dept.shortName} process flow`,
                "What are the current compliance risks?",
                "Show performance recommendations",
                "Which process steps can be automated?",
              ]}
            />
          </div>
        )}

        {/* Tab content */}
        {tab === "Overview"      && <OverviewTab     dept={dept} />}
        {tab === "Process Flow"  && <ProcessFlowTab  deptId={dept.id} deptName={dept.name} />}
        {tab === "Workstations"  && (() => {
          const wsDept = getDepartmentById(dept.id);
          if (!wsDept) return (
            <div className="py-12 text-center text-sm text-black/40">
              Workstation data not yet configured for this department.
            </div>
          );
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">{wsDept.name} — Role Chain</p>
                  <p className="text-xs text-black/50 mt-0.5">
                    {wsDept.workstations.length} workstations · Roles flow from top to bottom.
                    Click any workstation to open its full profile.
                    {adminMode && <span className="ml-2 text-[#0F172A] font-semibold">Admin mode: hover cards to edit, hide, or remove.</span>}
                  </p>
                </div>
              </div>
              <WorkstationTower
                department={wsDept}
                adminMode={adminMode}
                onSelectWorkstation={(ws) => navigate(`/corporate/${dept.id}/workstation/${ws.id}`)}
              />
            </div>
          );
        })()}
        {tab === "Performance"   && <PerformanceTab  dept={dept} />}
        {tab === "AI Assistant"  && (
          <div>
            <AIAssistantPanel
              agentName={`${dept.shortName} AI Assistant`}
              agentRole="Department Intelligence Agent"
              color="violet"
              context={`${dept.name}: ${dept.processTitle}. ${dept.description} Staff: ${dept.kpis.staff}. Compliance: ${dept.kpis.compliance}%. Performance: ${dept.kpis.performanceScore}%.`}
              suggestedPrompts={[
                `What are the biggest risks in ${dept.shortName}?`,
                "Analyse the process steps and suggest improvements",
                "What KPIs should this department track?",
                "Draft a performance improvement plan",
              ]}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
}
