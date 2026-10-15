import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { pushNotification, pushSeniorAlert } from "@/lib/local-store";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend, LineChart, Line,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import {
  Star, TrendingUp, AlertTriangle, Shield, Users, FileText, Award,
  CheckCircle2, XCircle, Clock, Activity, BarChart3, Package, Zap,
  MessageSquare, ThumbsUp, ThumbsDown, Eye, Download, Plus, Search,
  Filter, RefreshCw, Bell, Target, Briefcase, Map, Globe2, ChevronDown,
  ChevronRight, AlertOctagon, TrendingDown, DollarSign, Wrench, BookOpen,
  Ban, UserCheck, ShieldAlert, Layers, Cpu, BarChart2, Info,
} from "lucide-react";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const VENDOR_CATEGORIES = [
  "Works Contractors", "Consultants", "Professional Services", "Suppliers",
  "Manufacturers", "Logistics Providers", "Technology Vendors", "Maintenance Vendors",
  "Framework Agreement Vendors", "Strategic Partners", "Subcontractors",
];

const VENDOR_STATUSES = ["Active", "Suspended", "Blacklisted", "Expired", "Under Review"] as const;
type VendorStatus = typeof VENDOR_STATUSES[number];

const STATUS_TONE: Record<VendorStatus, "green" | "red" | "amber" | "muted" | "violet"> = {
  Active: "green", Suspended: "amber", Blacklisted: "red", Expired: "muted", "Under Review": "violet",
};

interface VendorRecord {
  id: string; name: string; category: string; status: VendorStatus;
  overallScore: number; deliveryScore: number; qualityScore: number;
  complianceScore: number; costScore: number; serviceScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  contracts: number; totalSpend: string; location: string;
  registeredDate: string; lastReviewDate: string;
  failureProbability: number; pendingActions: number;
}

const VENDORS: VendorRecord[] = [
  { id: "VEN-00482", name: "Highveld Engineering (Pvt) Ltd", category: "Works Contractors", status: "Active", overallScore: 91, deliveryScore: 94, qualityScore: 89, complianceScore: 96, costScore: 85, serviceScore: 91, riskLevel: "Low", contracts: 18, totalSpend: "USD 142M", location: "Harare", registeredDate: "2019-03-10", lastReviewDate: "2026-05-15", failureProbability: 4, pendingActions: 0 },
  { id: "VEN-00481", name: "Zimbabwe Pharma Holdings", category: "Suppliers", status: "Active", overallScore: 88, deliveryScore: 90, qualityScore: 92, complianceScore: 88, costScore: 80, serviceScore: 90, riskLevel: "Low", contracts: 24, totalSpend: "USD 98M", location: "Harare", registeredDate: "2018-07-20", lastReviewDate: "2026-06-01", failureProbability: 6, pendingActions: 1 },
  { id: "VEN-00480", name: "Sable ICT Solutions", category: "Technology Vendors", status: "Active", overallScore: 82, deliveryScore: 84, qualityScore: 80, complianceScore: 88, costScore: 76, serviceScore: 82, riskLevel: "Medium", contracts: 11, totalSpend: "USD 34M", location: "Harare", registeredDate: "2020-11-05", lastReviewDate: "2026-04-20", failureProbability: 14, pendingActions: 2 },
  { id: "VEN-00479", name: "Mashonaland Agri Supplies", category: "Suppliers", status: "Active", overallScore: 86, deliveryScore: 88, qualityScore: 84, complianceScore: 90, costScore: 82, serviceScore: 86, riskLevel: "Low", contracts: 16, totalSpend: "USD 28M", location: "Bindura", registeredDate: "2017-02-14", lastReviewDate: "2026-05-30", failureProbability: 8, pendingActions: 0 },
  { id: "VEN-00478", name: "Bulawayo Civil Works", category: "Works Contractors", status: "Under Review", overallScore: 68, deliveryScore: 62, qualityScore: 70, complianceScore: 72, costScore: 74, serviceScore: 62, riskLevel: "High", contracts: 9, totalSpend: "USD 56M", location: "Bulawayo", registeredDate: "2021-06-08", lastReviewDate: "2026-06-10", failureProbability: 32, pendingActions: 5 },
  { id: "VEN-00477", name: "Eastern Highlands Logistics", category: "Logistics Providers", status: "Active", overallScore: 84, deliveryScore: 88, qualityScore: 78, complianceScore: 86, costScore: 84, serviceScore: 84, riskLevel: "Low", contracts: 7, totalSpend: "USD 12M", location: "Mutare", registeredDate: "2020-09-22", lastReviewDate: "2026-03-18", failureProbability: 10, pendingActions: 0 },
  { id: "VEN-00476", name: "Granite Construction Group", category: "Works Contractors", status: "Blacklisted", overallScore: 34, deliveryScore: 28, qualityScore: 32, complianceScore: 40, costScore: 44, serviceScore: 26, riskLevel: "Critical", contracts: 4, totalSpend: "USD 21M", location: "Gweru", registeredDate: "2022-01-15", lastReviewDate: "2026-05-05", failureProbability: 88, pendingActions: 8 },
  { id: "VEN-00475", name: "ZimTech Consulting (Pvt) Ltd", category: "Consultants", status: "Active", overallScore: 79, deliveryScore: 76, qualityScore: 82, complianceScore: 80, costScore: 72, serviceScore: 85, riskLevel: "Medium", contracts: 6, totalSpend: "USD 8M", location: "Harare", registeredDate: "2021-04-12", lastReviewDate: "2026-04-05", failureProbability: 18, pendingActions: 1 },
  { id: "VEN-00474", name: "National Maintenance Corp", category: "Maintenance Vendors", status: "Suspended", overallScore: 52, deliveryScore: 48, qualityScore: 54, complianceScore: 58, costScore: 62, serviceScore: 48, riskLevel: "High", contracts: 12, totalSpend: "USD 18M", location: "Bulawayo", registeredDate: "2016-08-30", lastReviewDate: "2026-05-28", failureProbability: 54, pendingActions: 6 },
  { id: "VEN-00473", name: "Precision Engineering Ltd", category: "Manufacturers", status: "Active", overallScore: 93, deliveryScore: 96, qualityScore: 94, complianceScore: 92, costScore: 88, serviceScore: 95, riskLevel: "Low", contracts: 14, totalSpend: "USD 64M", location: "Harare", registeredDate: "2015-05-20", lastReviewDate: "2026-06-12", failureProbability: 3, pendingActions: 0 },
];

const SCORECARD_TREND = [
  { month: "Jan", avg: 79, top: 92, bottom: 34 },
  { month: "Feb", avg: 80, top: 91, bottom: 36 },
  { month: "Mar", avg: 81, top: 93, bottom: 35 },
  { month: "Apr", avg: 80, top: 90, bottom: 38 },
  { month: "May", avg: 82, top: 92, bottom: 40 },
  { month: "Jun", avg: 83, top: 93, bottom: 34 },
];

const SPEND_BY_CATEGORY = [
  { name: "Works Contractors", value: 42 },
  { name: "Suppliers", value: 24 },
  { name: "Technology Vendors", value: 14 },
  { name: "Consultants", value: 8 },
  { name: "Logistics", value: 6 },
  { name: "Maintenance", value: 6 },
];

const DISPUTES = [
  { id: "DSP-2026-018", vendor: "Bulawayo Civil Works", type: "Delay Penalty", value: "USD 420,000", status: "Open", days: 34 },
  { id: "DSP-2026-017", vendor: "National Maintenance Corp", type: "Quality Defect", value: "USD 180,000", status: "Negotiating", days: 67 },
  { id: "DSP-2026-016", vendor: "Sable ICT Solutions", type: "Scope Dispute", value: "USD 90,000", status: "Resolved", days: 12 },
  { id: "DSP-2026-015", vendor: "ZimTech Consulting", type: "Invoice Dispute", value: "USD 34,000", status: "Open", days: 8 },
];

const CORRECTIVE_ACTIONS = [
  { id: "CAP-2026-022", vendor: "Bulawayo Civil Works", issue: "Repeated schedule delays > 30 days", action: "Performance Improvement Plan", due: "2026-08-01", status: "In Progress" },
  { id: "CAP-2026-021", vendor: "National Maintenance Corp", issue: "Multiple failed quality inspections", action: "Root Cause Analysis + Corrective Action Plan", due: "2026-07-15", status: "Overdue" },
  { id: "CAP-2026-020", vendor: "ZimTech Consulting", issue: "Billing discrepancies Q1 2026", action: "Invoice Audit + Reconciliation", due: "2026-07-01", status: "Completed" },
  { id: "CAP-2026-019", vendor: "Sable ICT Solutions", issue: "SLA breaches — response time", action: "SLA Review Meeting + Updated KPIs", due: "2026-07-20", status: "In Progress" },
];

const COMPLIANCE_RECORDS = [
  { vendor: "Highveld Engineering", license: "2027-03-09", insurance: "2027-01-14", tax: "2026-12-31", safety: "2026-09-30", status: "Compliant" },
  { vendor: "Zimbabwe Pharma Holdings", license: "2027-07-20", insurance: "2026-12-31", tax: "2026-12-31", safety: "2026-11-15", status: "Compliant" },
  { vendor: "Sable ICT Solutions", license: "2026-08-05", insurance: "2026-07-14", tax: "2026-12-31", safety: "N/A", status: "Expiring Soon" },
  { vendor: "Bulawayo Civil Works", license: "2026-06-08", insurance: "EXPIRED", tax: "EXPIRED", safety: "2025-12-31", status: "Non-Compliant" },
  { vendor: "National Maintenance Corp", license: "SUSPENDED", insurance: "2026-09-22", tax: "2026-12-31", safety: "2026-08-01", status: "Suspended" },
  { vendor: "Precision Engineering Ltd", license: "2028-05-20", insurance: "2027-11-30", tax: "2026-12-31", safety: "2027-03-14", status: "Compliant" },
];

const AI_AGENTS_DATA = [
  { name: "Vendor Data Intelligence Agent", status: "Active", tasks: 1284, accuracy: 96, desc: "Cleans vendor data, detects duplicates, validates information" },
  { name: "Vendor Qualification Agent", status: "Active", tasks: 842, accuracy: 94, desc: "Scores vendor applications against prequalification criteria" },
  { name: "Vendor Risk Intelligence Agent", status: "Active", tasks: 2104, accuracy: 91, desc: "Calculates risk scores, monitors risk indicators, predicts failure" },
  { name: "Contract Intelligence Agent", status: "Active", tasks: 587, accuracy: 93, desc: "Reads contracts, extracts obligations, alerts on expiry" },
  { name: "Performance Scoring Agent", status: "Active", tasks: 921, accuracy: 95, desc: "Calculates performance scores, generates monthly scorecards" },
  { name: "Quality Inspection Agent", status: "Active", tasks: 348, accuracy: 89, desc: "Reviews quality results, predicts quality failures" },
  { name: "SLA Guardian Agent", status: "Active", tasks: 1420, accuracy: 97, desc: "Watches SLA commitments, triggers automatic escalation" },
  { name: "Spend Analytics Agent", status: "Active", tasks: 764, accuracy: 94, desc: "Analyses spending patterns, finds cost optimisation opportunities" },
  { name: "Compliance Monitoring Agent", status: "Active", tasks: 1832, accuracy: 98, desc: "Tracks document validity, regulatory compliance status" },
  { name: "Dispute Resolution Agent", status: "Standby", tasks: 124, accuracy: 88, desc: "Analyses disputes, recommends resolution strategies" },
  { name: "Market Intelligence Agent", status: "Active", tasks: 412, accuracy: 86, desc: "Tracks market prices, supplier availability, benchmarks" },
  { name: "Executive Reporting Agent", status: "Active", tasks: 284, accuracy: 92, desc: "Generates executive dashboards, trend reports, decision briefs" },
  { name: "Fraud Detection Agent", status: "Active", tasks: 2841, accuracy: 94, desc: "Detects collusion, bid manipulation, identity fraud" },
  { name: "Predictive Failure Agent", status: "Active", tasks: 648, accuracy: 87, desc: "Predicts vendor failure 60–90 days in advance" },
  { name: "Vendor Recommendation Agent", status: "Active", tasks: 318, accuracy: 90, desc: "Recommends best vendor for specific procurement requirements" },
];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#F97316"];

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  "Executive Dashboard",
  "Vendor Master",
  "Registration & Onboarding",
  "Prequalification",
  "Bidding Performance",
  "Selection & Award",
  "Contract Lifecycle",
  "Scorecards",
  "Quality Management",
  "Delivery & SLA",
  "Risk Management",
  "Financial Performance",
  "Compliance",
  "Vendor Relationships",
  "Corrective Actions",
  "Disputes",
  "Suspension & Exit",
  "Analytics & Intelligence",
  "Knowledge Base",
  "Market Intelligence",
  "AI Agents",
] as const;
type Tab = typeof TABS[number];

// ─── Helper Components ────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const tone = score >= 85 ? "green" : score >= 70 ? "blue" : score >= 55 ? "amber" : "red";
  const label = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 55 ? "Needs Improvement" : "Poor";
  return <Badge tone={tone}>{score}% — {label}</Badge>;
}

function ScoreBar({ value, max = 100, color = "#334155" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const bg = value >= 85 ? "#475569" : value >= 70 ? "#334155" : value >= 55 ? "#64748B" : "#DC2626";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#EAF1F8] rounded-full overflow-hidden">
        <div style={{ width: `${pct}%`, background: bg }} className="h-full rounded-full transition-all" />
      </div>
      <span className="text-xs font-semibold text-black/70 w-8 text-right">{value}%</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-semibold text-black mb-3 mt-6">{children}</h2>;
}

function FeatureCard({ title, desc, icon: Icon, color = "blue" }: { title: string; desc: string; icon?: React.ElementType; color?: string }) {
  const bg: Record<string, string> = { blue: "bg-slate-50 text-[#0F172A]", green: "bg-slate-50 text-[#0F172A]", amber: "bg-slate-50 text-[#0F172A]", violet: "bg-slate-50 text-[#0F172A]", cyan: "bg-slate-50 text-[#0F172A]", red: "bg-red-50 text-red-600" };
  return (
    <div className="bg-white border border-black/8 rounded-xl p-4 hover:shadow-sm hover:border-black/15 transition-all">
      {Icon && <div className={`h-8 w-8 rounded-lg grid place-items-center mb-2 ${bg[color] ?? bg.blue}`}><Icon className="h-4 w-4" /></div>}
      <div className="text-sm font-semibold text-black mb-1">{title}</div>
      <div className="text-xs text-black/50 leading-relaxed">{desc}</div>
    </div>
  );
}

// ─── Tab: Executive Dashboard ─────────────────────────────────────────────────
function ExecutiveDashboard() {
  const radarData = [
    { subject: "Delivery", market: 87, best: 96, worst: 48 },
    { subject: "Quality", market: 82, best: 94, worst: 32 },
    { subject: "Compliance", market: 84, best: 96, worst: 40 },
    { subject: "Cost", market: 78, best: 88, worst: 44 },
    { subject: "Service", market: 80, best: 95, worst: 26 },
    { subject: "Risk", market: 76, best: 96, worst: 12 },
  ];
  const riskyVendors = VENDORS.filter(v => v.riskLevel === "High" || v.riskLevel === "Critical");
  const avgScore = Math.round(VENDORS.reduce((s, v) => s + v.overallScore, 0) / VENDORS.length);
  const topVendors = [...VENDORS].sort((a, b) => b.overallScore - a.overallScore).slice(0, 3);
  const bottomVendors = [...VENDORS].sort((a, b) => a.overallScore - b.overallScore).slice(0, 3);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total Vendors" value="12,847" delta="+284 this month" icon={Users} color="blue" />
        <KpiCard label="Active Vendors" value="11,204" delta="87.2% active" icon={CheckCircle2} color="green" />
        <KpiCard label="Average Score" value={`${avgScore}%`} delta="+2.1 pts QoQ" icon={Star} color="violet" />
        <KpiCard label="High Risk Vendors" value={String(riskyVendors.length + 142)} delta="Needs attention" positive={false} icon={AlertTriangle} color="red" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="On-Time Delivery" value="87.4%" delta="+1.2 pts" icon={TrendingUp} color="green" />
        <KpiCard label="Quality Defect Rate" value="2.8%" delta="-0.4 pts" icon={Activity} color="cyan" />
        <KpiCard label="SLA Compliance" value="91.2%" delta="+0.8 pts" icon={Target} color="blue" />
        <KpiCard label="Open Disputes" value="23" delta="4 escalated" positive={false} icon={AlertOctagon} color="amber" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <KpiCard label="Total Vendor Spend (YTD)" value="USD 484M" delta="+6.2% YoY" icon={DollarSign} color="green" />
        <KpiCard label="Cost Savings Achieved" value="USD 28.4M" delta="5.9% of spend" icon={TrendingDown} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Performance Trend" subtitle="6-month average vs best/worst vendor" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SCORECARD_TREND}>
                <defs>
                  <linearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[20, 100]} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Area dataKey="top" stroke="#10B981" fill="url(#topGrad)" name="Top Vendor" strokeWidth={2} />
                <Area dataKey="avg" stroke="#3B82F6" fill="url(#avgGrad)" name="Average" strokeWidth={2} />
                <Area dataKey="bottom" stroke="#DC2626" fill="none" name="Lowest Vendor" strokeWidth={1.5} strokeDasharray="4 2" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Spend by Category" subtitle="YTD distribution" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={SPEND_BY_CATEGORY} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {SPEND_BY_CATEGORY.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader title="Performance Radar" subtitle="Market avg vs best vendor" />
          <div className="p-2 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
                <Radar name="Market Avg" dataKey="market" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                <Radar name="Best Vendor" dataKey="best" stroke="#10B981" fill="#10B981" fillOpacity={0.1} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Top Performers" subtitle="By overall score" />
          <div className="divide-y divide-black/5">
            {topVendors.map((v, i) => (
              <div key={v.id} className="px-4 py-3 flex items-center gap-3">
                <div className={`h-6 w-6 rounded-full grid place-items-center text-xs font-bold text-white flex-shrink-0 ${i === 0 ? "bg-slate-400" : i === 1 ? "bg-slate-400" : "bg-slate-200"}`}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-black truncate">{v.name}</div>
                  <div className="text-[10px] text-black/40">{v.category}</div>
                </div>
                <Badge tone="green">{v.overallScore}%</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Needs Attention" subtitle="Lowest performing vendors" />
          <div className="divide-y divide-black/5">
            {bottomVendors.map((v) => (
              <div key={v.id} className="px-4 py-3 flex items-center gap-3">
                <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${v.overallScore < 55 ? "text-red-500" : "text-slate-600"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-black truncate">{v.name}</div>
                  <div className="text-[10px] text-black/40">{v.category}</div>
                </div>
                <Badge tone={STATUS_TONE[v.status]}>{v.overallScore}%</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionTitle>Decisions Required</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Vendors to Suspend", value: "3", tone: "red", icon: Ban, desc: "Performance below 55% for 3+ months" },
          { label: "Contracts to Renegotiate", value: "7", tone: "amber", icon: FileText, desc: "SLA breaches or cost overruns detected" },
          { label: "Improvement Plans Required", value: "9", tone: "violet", icon: Target, desc: "CAP overdue or not yet initiated" },
        ].map(item => (
          <div key={item.label} className="bg-white border border-black/8 rounded-xl p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl grid place-items-center flex-shrink-0 ${item.tone === "red" ? "bg-red-100 text-red-600" : item.tone === "amber" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-black">{item.value}</div>
              <div className="text-xs font-semibold text-black/70">{item.label}</div>
              <div className="text-[10px] text-black/40 mt-0.5">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Vendor Master Data ──────────────────────────────────────────────────
function VendorMaster({ onAction }: { onAction: (msg: string) => void }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCat, setFilterCat] = useState("All");
  const filtered = VENDORS.filter(v =>
    (filterStatus === "All" || v.status === filterStatus) &&
    (filterCat === "All" || v.category === filterCat) &&
    (v.name.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total Vendors" value="12,847" delta="+284 this month" icon={Users} color="blue" />
        <KpiCard label="Active" value="11,204" delta="87.2%" icon={CheckCircle2} color="green" />
        <KpiCard label="Under Review" value="1,415" delta="Processing" icon={Clock} color="amber" />
        <KpiCard label="Blacklisted" value="228" delta="+8 this month" positive={false} icon={Ban} color="red" />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors…"
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm">
          <option>All</option>
          {VENDOR_STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm">
          <option>All</option>
          {VENDOR_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <Card className="mb-6">
        <CardHeader title={`Vendor Master Registry — ${filtered.length + 12837} vendors`} action={
          <button onClick={() => onAction("Vendor registry exported to CSV")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1">
            <Download className="h-3 w-3" /> Export
          </button>
        } />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["ID", "Name", "Category", "Status", "Overall", "Delivery", "Quality", "Risk", "Contracts", "Actions"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3 font-mono text-[11px] text-black/40">{v.id}</td>
                  <td className="px-4 py-3 font-semibold text-black text-xs max-w-[180px] truncate">{v.name}</td>
                  <td className="px-4 py-3 text-xs text-black/60 whitespace-nowrap">{v.category}</td>
                  <td className="px-4 py-3"><Badge tone={STATUS_TONE[v.status]}>{v.status}</Badge></td>
                  <td className="px-4 py-3 w-32"><ScoreBar value={v.overallScore} /></td>
                  <td className="px-4 py-3 w-28"><ScoreBar value={v.deliveryScore} /></td>
                  <td className="px-4 py-3 w-28"><ScoreBar value={v.qualityScore} /></td>
                  <td className="px-4 py-3"><Badge tone={v.riskLevel === "Critical" ? "red" : v.riskLevel === "High" ? "amber" : v.riskLevel === "Medium" ? "blue" : "green"}>{v.riskLevel}</Badge></td>
                  <td className="px-4 py-3 text-xs text-black/60">{v.contracts}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => onAction(`Viewing profile: ${v.name}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1">
                        <Eye className="h-3 w-3" /> View
                      </button>
                      {v.status === "Under Review" && (
                        <button onClick={() => onAction(`Approved: ${v.name}`)} className="h-7 px-2 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A]">✓ Approve</button>
                      )}
                      {v.status !== "Blacklisted" && v.status !== "Suspended" && (
                        <button onClick={() => onAction(`Flagged for review: ${v.name}`)} className="h-7 px-2 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50">Flag</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SectionTitle>Master Data Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Vendor Registration", desc: "Online application, document submission, auto-screening and completeness checks", icon: Users, color: "blue" },
          { title: "Profile Management", desc: "Ownership info, contacts, geographic coverage, products/services catalogue", icon: Briefcase, color: "green" },
          { title: "Classification Engine", desc: "AI-powered automatic vendor classification by category, size, capability", icon: Layers, color: "violet" },
          { title: "Duplicate Detection", desc: "AI agent detects duplicate registrations, merges records automatically", icon: RefreshCw, color: "amber" },
          { title: "Certification Tracking", desc: "Licences, certifications, tax clearance — automated expiry alerts", icon: Shield, color: "cyan" },
          { title: "Status Lifecycle", desc: "Active → Under Review → Suspended → Blacklisted → Reinstated workflow", icon: Activity, color: "red" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Registration & Onboarding ──────────────────────────────────────────
function RegistrationOnboarding({ onAction }: { onAction: (msg: string) => void }) {
  const apps = [
    { id: "APP-2026-0142", name: "Sunrise Civil Engineering", category: "Works Contractors", submitted: "2026-06-18", stage: "Document Review", score: 72, completeness: 88 },
    { id: "APP-2026-0141", name: "MedSupply Africa Ltd", category: "Suppliers", submitted: "2026-06-17", stage: "Qualification", score: 85, completeness: 96 },
    { id: "APP-2026-0140", name: "TechBridge Zimbabwe", category: "Technology Vendors", submitted: "2026-06-15", stage: "Final Approval", score: 91, completeness: 100 },
    { id: "APP-2026-0139", name: "Delta Transport Co", category: "Logistics Providers", submitted: "2026-06-12", stage: "Pending Documents", score: 48, completeness: 62 },
    { id: "APP-2026-0138", name: "Consolidated Mining Supply", category: "Manufacturers", submitted: "2026-06-10", stage: "Rejected", score: 32, completeness: 54 },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Pending Applications" value="284" delta="12 urgent" icon={Clock} color="amber" />
        <KpiCard label="Approval Turnaround" value="4.2 days" delta="-0.8 days" icon={TrendingDown} color="green" />
        <KpiCard label="Rejected (MTD)" value="38" delta="13.4% rejection" positive={false} icon={XCircle} color="red" />
        <KpiCard label="Onboarding Complete" value="92.1%" delta="+1.4 pts" icon={CheckCircle2} color="blue" />
      </div>

      <Card className="mb-6">
        <CardHeader title="Pending Vendor Applications" subtitle="Awaiting review and approval" action={
          <button onClick={() => onAction("Bulk screening initiated for 284 applications")} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1">
            <Zap className="h-3 w-3" /> AI Screen All
          </button>
        } />
        <div className="divide-y divide-black/5">
          {apps.map(a => (
            <div key={a.id} className="px-5 py-3 hover:bg-[#EAF1F8]/50">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-sm font-semibold text-black">{a.name}</div>
                  <div className="text-[11px] text-black/40 font-mono mt-0.5">{a.id} · {a.category} · Submitted {a.submitted}</div>
                </div>
                <Badge tone={a.stage === "Rejected" ? "red" : a.stage === "Final Approval" ? "green" : a.stage === "Pending Documents" ? "amber" : "blue"}>{a.stage}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div><div className="text-[10px] text-black/40 mb-1">Screening Score</div><ScoreBar value={a.score} /></div>
                <div><div className="text-[10px] text-black/40 mb-1">Document Completeness</div><ScoreBar value={a.completeness} /></div>
              </div>
              {a.stage !== "Rejected" && (
                <div className="flex gap-2">
                  <button onClick={() => onAction(`Approved application: ${a.name}`)} className="h-7 px-3 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A] flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Approve</button>
                  <button onClick={() => onAction(`Requested more documents from: ${a.name}`)} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><FileText className="h-3 w-3" /> Request Docs</button>
                  <button onClick={() => onAction(`Rejected application: ${a.name}`)} className="h-7 px-3 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50 flex items-center gap-1"><XCircle className="h-3 w-3" /> Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>Onboarding Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Online Application Portal", desc: "Vendors apply online with guided multi-step registration wizard", icon: Globe2, color: "blue" },
          { title: "Automated Document Verification", desc: "AI validates company registration, tax clearance, bank details", icon: Shield, color: "green" },
          { title: "Onboarding Checklist", desc: "Step-by-step checklist ensures complete onboarding before activation", icon: CheckCircle2, color: "violet" },
          { title: "Code of Conduct Acceptance", desc: "Digital signature of ethical conduct agreement before activation", icon: FileText, color: "amber" },
          { title: "Approval Routing", desc: "Multi-level approval workflow with escalation and SLA monitoring", icon: ChevronRight, color: "cyan" },
          { title: "Vendor Certificate Generation", desc: "Auto-generate registration certificates upon successful onboarding", icon: Award, color: "red" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Prequalification ────────────────────────────────────────────────────
function Prequalification({ onAction }: { onAction: (msg: string) => void }) {
  const preqs = [
    { vendor: "Highveld Engineering", technical: 94, financial: 88, experience: 96, equipment: 90, safety: 92, hr: 86, qualified: true, score: 91 },
    { vendor: "Zimbabwe Pharma Holdings", technical: 88, financial: 92, experience: 90, equipment: 82, safety: 88, hr: 84, qualified: true, score: 87 },
    { vendor: "Bulawayo Civil Works", technical: 72, financial: 64, experience: 70, equipment: 68, safety: 74, hr: 66, qualified: false, score: 69 },
    { vendor: "ZimTech Consulting", technical: 82, financial: 78, experience: 80, equipment: 72, safety: 84, hr: 80, qualified: true, score: 79 },
    { vendor: "Delta Transport Co", technical: 58, financial: 52, experience: 60, equipment: 54, safety: 62, hr: 50, qualified: false, score: 56 },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Qualified Vendors" value="9,842" delta="76.6% of all" icon={CheckCircle2} color="green" />
        <KpiCard label="Pending Qualification" value="1,620" delta="In assessment" icon={Clock} color="amber" />
        <KpiCard label="Failed Qualification" value="1,385" delta="10.8% fail rate" positive={false} icon={XCircle} color="red" />
        <KpiCard label="Avg Capability Score" value="78.4%" delta="+2.2 pts" icon={BarChart3} color="blue" />
      </div>

      <Card className="mb-6">
        <CardHeader title="Prequalification Assessments" subtitle="Technical, financial, and capability scoring" action={
          <button onClick={() => onAction("AI qualification scoring initiated")} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1">
            <Zap className="h-3 w-3" /> Auto-Score
          </button>
        } />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["Vendor", "Technical", "Financial", "Experience", "Equipment", "Safety", "HR", "Score", "Status"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {preqs.map(p => (
                <tr key={p.vendor} className="hover:bg-[#EAF1F8]/50 cursor-pointer" onClick={() => onAction(`Reviewing prequalification: ${p.vendor}`)}>
                  <td className="px-4 py-3 font-semibold text-xs text-black">{p.vendor}</td>
                  {[p.technical, p.financial, p.experience, p.equipment, p.safety, p.hr].map((s, i) => (
                    <td key={i} className="px-4 py-3 w-24"><ScoreBar value={s} /></td>
                  ))}
                  <td className="px-4 py-3"><Badge tone={p.score >= 75 ? "green" : p.score >= 60 ? "amber" : "red"}>{p.score}%</Badge></td>
                  <td className="px-4 py-3"><Badge tone={p.qualified ? "green" : "red"}>{p.qualified ? "Qualified" : "Not Qualified"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SectionTitle>Prequalification Criteria</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Technical Capability", desc: "Past projects, specialisation, methodology, technology used, certifications", icon: Wrench, color: "blue" },
          { title: "Financial Assessment", desc: "Audited financials, liquidity ratios, debt levels, credit history", icon: DollarSign, color: "green" },
          { title: "Past Experience Review", desc: "Reference checks, past contract performance, client testimonials", icon: BookOpen, color: "violet" },
          { title: "Equipment Assessment", desc: "Plant and equipment inventory, condition, capacity, mobilisation plan", icon: Package, color: "amber" },
          { title: "Human Resources", desc: "Key personnel CVs, qualifications, capacity, workforce plan", icon: Users, color: "cyan" },
          { title: "Safety & Quality", desc: "HSE policy, incident history, quality management system (ISO 9001)", icon: Shield, color: "red" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Bidding Performance ─────────────────────────────────────────────────
function BiddingPerformance({ onAction }: { onAction: (msg: string) => void }) {
  const bidData = [
    { vendor: "Highveld Engineering", invited: 24, participated: 22, won: 18, withdrawn: 1, rejected: 3, winRate: 82, avgScore: 91 },
    { vendor: "Zimbabwe Pharma Holdings", invited: 30, participated: 28, won: 24, withdrawn: 0, rejected: 4, winRate: 86, avgScore: 88 },
    { vendor: "Sable ICT Solutions", invited: 18, participated: 15, won: 11, withdrawn: 2, rejected: 2, winRate: 73, avgScore: 82 },
    { vendor: "Bulawayo Civil Works", invited: 16, participated: 10, won: 9, withdrawn: 4, rejected: 2, winRate: 90, avgScore: 68 },
    { vendor: "ZimTech Consulting", invited: 12, participated: 11, won: 6, withdrawn: 1, rejected: 4, winRate: 55, avgScore: 79 },
    { vendor: "Eastern Highlands Logistics", invited: 10, participated: 9, won: 7, withdrawn: 0, rejected: 2, winRate: 78, avgScore: 84 },
  ];
  const participationChart = bidData.map(d => ({ name: d.vendor.split(" ")[0], invited: d.invited, participated: d.participated, won: d.won }));

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Avg Bid Participation Rate" value="84.2%" delta="+2.1 pts" icon={Users} color="blue" />
        <KpiCard label="Avg Win Rate" value="77.4%" delta="+1.8 pts" icon={Award} color="green" />
        <KpiCard label="Bid Withdrawals (QTD)" value="18" delta="4.2% withdrawal rate" positive={false} icon={AlertTriangle} color="amber" />
        <KpiCard label="Bid Quality Score" value="82.6%" delta="+0.9 pts" icon={Star} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader title="Bidding Behaviour Analysis" subtitle="Invitation vs Participation vs Wins" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participationChart}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="invited" fill="#e2e8f0" radius={[3, 3, 0, 0]} name="Invited" />
                <Bar dataKey="participated" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Participated" />
                <Bar dataKey="won" fill="#10B981" radius={[3, 3, 0, 0]} name="Won" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Vendor Bidding Scorecard" subtitle="Win rate and bid quality" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#EAF1F8] text-xs text-black/40">
                <tr>{["Vendor", "Participation", "Win Rate", "Withdrawn", "Rejected", "Avg Score"].map(h => (
                  <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {bidData.map(d => (
                  <tr key={d.vendor} className="hover:bg-[#EAF1F8]/50 cursor-pointer" onClick={() => onAction(`Bid analysis: ${d.vendor}`)}>
                    <td className="px-4 py-2.5 text-xs font-semibold text-black">{d.vendor.split(" ").slice(0, 2).join(" ")}</td>
                    <td className="px-4 py-2.5 text-xs">{d.participated}/{d.invited}</td>
                    <td className="px-4 py-2.5 w-28"><ScoreBar value={d.winRate} /></td>
                    <td className="px-4 py-2.5 text-xs text-[#0F172A]">{d.withdrawn}</td>
                    <td className="px-4 py-2.5 text-xs text-red-500">{d.rejected}</td>
                    <td className="px-4 py-2.5"><Badge tone={d.avgScore >= 85 ? "green" : d.avgScore >= 70 ? "blue" : "amber"}>{d.avgScore}%</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <SectionTitle>Bidding Intelligence Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Bid Participation Tracking", desc: "Track invitations, submissions, withdrawals and non-participation", icon: Activity, color: "blue" },
          { title: "Abnormal Pattern Detection", desc: "AI detects bid rotation, collusion patterns, price fixing signals", icon: AlertOctagon, color: "red" },
          { title: "Bid Quality Assessment", desc: "Score bid completeness, technical accuracy, and pricing competitiveness", icon: Star, color: "green" },
          { title: "Market Price Intelligence", desc: "Compare submitted prices against market benchmarks automatically", icon: BarChart3, color: "violet" },
          { title: "Unreliable Bidder Flags", desc: "Flag vendors with high withdrawal rates or pattern of non-compliance", icon: AlertTriangle, color: "amber" },
          { title: "Competitive Index", desc: "Measure market competition level per category and tender type", icon: TrendingUp, color: "cyan" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Selection & Award ───────────────────────────────────────────────────
function SelectionAward({ onAction }: { onAction: (msg: string) => void }) {
  const evaluations = [
    { tender: "ZW-PRA-2026-00184", title: "Solar Mini-Grids", vendors: 11, status: "Finalising", recommended: "Precision Engineering Ltd", techScore: 91, commScore: 88, finalScore: 90 },
    { tender: "ZW-PRA-2026-00183", title: "ARV Medicines Framework", vendors: 8, status: "Awarded", recommended: "Zimbabwe Pharma Holdings", techScore: 88, commScore: 92, finalScore: 90 },
    { tender: "ZW-PRA-2026-00182", title: "National Tax System II", vendors: 5, status: "Evaluation", recommended: "Pending", techScore: 0, commScore: 0, finalScore: 0 },
    { tender: "ZW-PRA-2026-00179", title: "External Audit Services", vendors: 9, status: "Evaluation", recommended: "Pending", techScore: 0, commScore: 0, finalScore: 0 },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Evaluations (MTD)" value="28" delta="+4 from last month" icon={BarChart3} color="blue" />
        <KpiCard label="Avg Evaluation Duration" value="8.4 days" delta="-1.2 days" icon={Clock} color="green" />
        <KpiCard label="Awards (MTD)" value="14" delta="USD 84.2M total" icon={Award} color="violet" />
        <KpiCard label="Appeals Lodged" value="3" delta="2 resolved" positive={false} icon={AlertTriangle} color="amber" />
      </div>

      <Card className="mb-6">
        <CardHeader title="Active Evaluations & Awards" subtitle="Weighted scoring and recommendation pipeline" />
        <div className="divide-y divide-black/5">
          {evaluations.map(ev => (
            <div key={ev.tender} className="px-5 py-4 hover:bg-[#EAF1F8]/50">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-sm font-semibold text-black">{ev.title}</div>
                  <div className="text-[11px] text-black/40 font-mono">{ev.tender} · {ev.vendors} bidders</div>
                </div>
                <Badge tone={ev.status === "Awarded" ? "green" : ev.status === "Finalising" ? "violet" : "blue"}>{ev.status}</Badge>
              </div>
              {ev.finalScore > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-2">
                  <div><div className="text-[10px] text-black/40 mb-1">Technical Score</div><ScoreBar value={ev.techScore} /></div>
                  <div><div className="text-[10px] text-black/40 mb-1">Commercial Score</div><ScoreBar value={ev.commScore} /></div>
                  <div><div className="text-[10px] text-black/40 mb-1">Final Weighted</div><ScoreBar value={ev.finalScore} /></div>
                </div>
              )}
              {ev.recommended !== "Pending" && (
                <div className="text-xs text-[#0F172A] font-medium">✓ Recommended: {ev.recommended}</div>
              )}
              <div className="flex gap-2 mt-2">
                <button onClick={() => onAction(`Viewing evaluation: ${ev.tender}`)} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3" /> Scoresheet</button>
                {ev.status === "Finalising" && (
                  <button onClick={() => onAction(`Award approved: ${ev.recommended} for ${ev.tender}`)} className="h-7 px-3 rounded-lg bg-[#0F172A] text-white text-xs hover:bg-[#0F172A] flex items-center gap-1"><Award className="h-3 w-3" /> Approve Award</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>Selection Process Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Weighted Scoring", desc: "Configurable technical/commercial split (70/30, 80/20, etc.) per tender type", icon: BarChart2, color: "blue" },
          { title: "Evaluation Audit Trail", desc: "Every score recorded with evaluator identity, timestamp and rationale", icon: FileText, color: "green" },
          { title: "AI Scoring Inconsistency Detection", desc: "Flags unusual scoring patterns or deviations from historical benchmarks", icon: AlertOctagon, color: "red" },
          { title: "Negotiation Records", desc: "Document pre-award negotiations, BAFO requests and responses", icon: MessageSquare, color: "violet" },
          { title: "Award Recommendation Report", desc: "AI-generated recommendation memo with supporting evidence", icon: Award, color: "amber" },
          { title: "Historical Performance Comparison", desc: "Compare candidates against past performance on similar contracts", icon: TrendingUp, color: "cyan" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Contract Lifecycle ──────────────────────────────────────────────────
function ContractLifecycle({ onAction }: { onAction: (msg: string) => void }) {
  const contracts = [
    { id: "CN-2026-0418", vendor: "Zimbabwe Pharma Holdings", title: "ARV Medicines Framework", value: "USD 42.5M", start: "2026-04-01", end: "2028-03-31", progress: 38, sla: 92, obligations: 24, fulfilled: 21, status: "On Track" },
    { id: "CN-2026-0411", vendor: "Highveld Engineering", title: "Beitbridge Highway Section 3", value: "USD 71.0M", start: "2025-09-01", end: "2026-12-15", progress: 64, sla: 88, obligations: 36, fulfilled: 30, status: "On Track" },
    { id: "CN-2026-0408", vendor: "Bulawayo Civil Works", title: "Gweru Road Rehabilitation", value: "USD 18.4M", start: "2025-06-01", end: "2026-08-31", progress: 42, sla: 62, obligations: 28, fulfilled: 18, status: "At Risk" },
    { id: "CN-2026-0402", vendor: "National Maintenance Corp", title: "Hospital Maintenance SLA", value: "USD 8.2M", start: "2025-01-01", end: "2026-12-31", progress: 55, sla: 54, obligations: 48, fulfilled: 28, status: "At Risk" },
    { id: "CN-2026-0398", vendor: "Precision Engineering Ltd", title: "Water Pump Procurement", value: "USD 6.8M", start: "2026-01-15", end: "2026-07-15", progress: 96, sla: 98, obligations: 18, fulfilled: 18, status: "Near Completion" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Active Contracts" value="964" delta="+8 new" icon={FileText} color="blue" />
        <KpiCard label="SLA Compliance" value="88.4%" delta="-1.2 pts" icon={Target} color="green" />
        <KpiCard label="Expiring (90 days)" value="84" delta="Renewal action needed" positive={false} icon={Clock} color="amber" />
        <KpiCard label="Obligations Overdue" value="127" delta="Escalation required" positive={false} icon={AlertTriangle} color="red" />
      </div>

      <Card className="mb-6">
        <CardHeader title="Contract Register" subtitle="Active contracts with SLA and obligations tracking" />
        <div className="divide-y divide-black/5">
          {contracts.map(c => (
            <div key={c.id} className="px-5 py-4 hover:bg-[#EAF1F8]/50">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-sm font-semibold text-black">{c.title}</div>
                  <div className="text-[11px] text-black/40 font-mono">{c.id} · {c.vendor} · {c.value}</div>
                </div>
                <Badge tone={c.status === "On Track" ? "green" : c.status === "Near Completion" ? "blue" : "amber"}>{c.status}</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2 text-xs">
                <div><span className="text-black/40">Progress: </span><span className="font-semibold">{c.progress}%</span></div>
                <div><span className="text-black/40">SLA: </span><span className={`font-semibold ${c.sla >= 80 ? "text-[#0F172A]" : c.sla >= 65 ? "text-[#0F172A]" : "text-red-500"}`}>{c.sla}%</span></div>
                <div><span className="text-black/40">Obligations: </span><span className="font-semibold">{c.fulfilled}/{c.obligations}</span></div>
                <div><span className="text-black/40">End: </span><span className="font-semibold">{c.end}</span></div>
              </div>
              <div className="h-1.5 bg-[#EAF1F8] rounded-full overflow-hidden mb-2">
                <div style={{ width: `${c.progress}%` }} className={`h-full rounded-full ${c.progress >= 80 ? "bg-[#0F172A]" : c.status === "At Risk" ? "bg-slate-400" : "bg-[#0F172A]"}`} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => onAction(`Viewing contract: ${c.id}`)} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3" /> View</button>
                <button onClick={() => onAction(`Milestone updated: ${c.id}`)} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Milestone</button>
                {c.status === "At Risk" && <button onClick={() => onAction(`Escalation raised: ${c.id}`)} className="h-7 px-3 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Escalate</button>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>Contract Management Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Contract Repository", desc: "Centralised vault with version control, clause library, e-signature support", icon: FileText, color: "blue" },
          { title: "Milestone & Deliverable Tracking", desc: "Payment milestones, completion certificates, progress updates", icon: Target, color: "green" },
          { title: "SLA Management", desc: "KPI definitions, breach detection, automatic penalty calculation", icon: Activity, color: "red" },
          { title: "Obligations Register", desc: "Extract and track all contractual obligations with due dates", icon: CheckCircle2, color: "violet" },
          { title: "Contract Amendments", desc: "Variation orders, scope changes, price adjustments with approval workflow", icon: RefreshCw, color: "amber" },
          { title: "Renewal Intelligence", desc: "AI predicts renewal decisions 90 days before expiry with recommendations", icon: Zap, color: "cyan" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Scorecards ─────────────────────────────────────────────────────────
function Scorecards({ onAction }: { onAction: (msg: string) => void }) {
  const radarData = [
    { subject: "Delivery", market: 87, highveld: 94, bulawayo: 62 },
    { subject: "Quality", market: 82, highveld: 89, bulawayo: 70 },
    { subject: "Compliance", market: 84, highveld: 96, bulawayo: 72 },
    { subject: "Cost", market: 78, highveld: 85, bulawayo: 74 },
    { subject: "Service", market: 80, highveld: 91, bulawayo: 62 },
    { subject: "Safety", market: 83, highveld: 94, bulawayo: 68 },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Scorecards Generated (MTD)" value="284" delta="All active vendors" icon={BarChart3} color="blue" />
        <KpiCard label="Vendors Above 85%" value="6,842" delta="Excellent tier" icon={Star} color="green" />
        <KpiCard label="Vendors Below 55%" value="428" delta="Requires intervention" positive={false} icon={AlertTriangle} color="red" />
        <KpiCard label="Avg Score (YTD)" value="78.4%" delta="+2.1 pts YoY" icon={TrendingUp} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Vendor Scorecards — All Dimensions" subtitle="Current month scores across all performance pillars" action={
            <button onClick={() => onAction("Scorecard report downloaded")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Download className="h-3 w-3" /> Export</button>
          } />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#EAF1F8] text-xs text-black/40">
                <tr>{["Vendor", "Delivery", "Quality", "Compliance", "Cost", "Service", "Overall", "Trend"].map(h => (
                  <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {VENDORS.filter(v => v.status !== "Blacklisted").map(v => (
                  <tr key={v.id} className="hover:bg-[#EAF1F8]/50 cursor-pointer" onClick={() => onAction(`Scorecard detail: ${v.name}`)}>
                    <td className="px-4 py-2.5 text-xs font-semibold text-black max-w-[140px] truncate">{v.name}</td>
                    <td className="px-4 py-2.5 w-24"><ScoreBar value={v.deliveryScore} /></td>
                    <td className="px-4 py-2.5 w-24"><ScoreBar value={v.qualityScore} /></td>
                    <td className="px-4 py-2.5 w-24"><ScoreBar value={v.complianceScore} /></td>
                    <td className="px-4 py-2.5 w-24"><ScoreBar value={v.costScore} /></td>
                    <td className="px-4 py-2.5 w-24"><ScoreBar value={v.serviceScore} /></td>
                    <td className="px-4 py-2.5"><ScoreBadge score={v.overallScore} /></td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-semibold ${v.overallScore >= 80 ? "text-[#0F172A]" : v.overallScore >= 65 ? "text-slate-600" : "text-red-500"}`}>
                        {v.overallScore >= 80 ? "▲ Rising" : v.overallScore >= 65 ? "→ Stable" : "▼ Falling"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardHeader title="Comparative Radar" subtitle="Top vs low performer vs market" />
          <div className="p-2 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#64748b" }} />
                <Radar name="Market Avg" dataKey="market" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
                <Radar name="Top Vendor" dataKey="highveld" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                <Radar name="Low Vendor" dataKey="bulawayo" stroke="#DC2626" fill="#DC2626" fillOpacity={0.1} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <SectionTitle>Scorecard Dimensions</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Delivery Performance", desc: "On-time delivery rate, schedule adherence, completion rate by milestone", icon: TrendingUp, color: "blue" },
          { title: "Quality Performance", desc: "Defect rates, returns, rework, inspection pass rate, warranty claims", icon: Star, color: "green" },
          { title: "Cost Performance", desc: "Price competitiveness, cost variance, savings contribution, cost escalation", icon: DollarSign, color: "violet" },
          { title: "Service & Responsiveness", desc: "Query response time, complaint resolution, communication quality", icon: MessageSquare, color: "amber" },
          { title: "Compliance Performance", desc: "Regulatory compliance, document validity, code of conduct adherence", icon: Shield, color: "cyan" },
          { title: "Safety Performance", desc: "HSE incidents, near-misses, safety violations on project sites", icon: ShieldAlert, color: "red" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Quality Management ──────────────────────────────────────────────────
function QualityManagement({ onAction }: { onAction: (msg: string) => void }) {
  const defects = [
    { vendor: "Bulawayo Civil Works", category: "Construction", defects: 28, returns: 4, rework: 12, ncrs: 8, status: "Escalated" },
    { vendor: "National Maintenance Corp", category: "Maintenance", defects: 22, returns: 2, rework: 18, ncrs: 6, status: "CAP Active" },
    { vendor: "Sable ICT Solutions", category: "ICT", defects: 14, returns: 0, rework: 8, ncrs: 3, status: "Monitoring" },
    { vendor: "ZimTech Consulting", category: "Consultancy", defects: 6, returns: 0, rework: 4, ncrs: 1, status: "Resolved" },
    { vendor: "Highveld Engineering", category: "Construction", defects: 4, returns: 0, rework: 2, ncrs: 0, status: "Good" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Defect Rate (YTD)" value="2.8%" delta="-0.4 pts" icon={AlertTriangle} color="amber" />
        <KpiCard label="Return Rate" value="0.6%" delta="-0.1 pts" icon={RefreshCw} color="green" />
        <KpiCard label="Active NCRs" value="18" delta="6 escalated" positive={false} icon={XCircle} color="red" />
        <KpiCard label="Quality Score Avg" value="84.2%" delta="+1.8 pts" icon={Star} color="blue" />
      </div>

      <Card className="mb-6">
        <CardHeader title="Non-Conformance & Defect Register" subtitle="Quality issues by vendor and corrective action status" action={
          <button onClick={() => onAction("NCR report generated")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><FileText className="h-3 w-3" /> NCR Report</button>
        } />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["Vendor", "Category", "Defects", "Returns", "Rework", "NCRs", "Status", "Actions"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {defects.map(d => (
                <tr key={d.vendor} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3 text-xs font-semibold text-black">{d.vendor}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{d.category}</td>
                  <td className="px-4 py-3 text-xs"><span className={d.defects > 15 ? "text-red-600 font-semibold" : d.defects > 8 ? "text-[#0F172A]" : "text-[#0F172A]"}>{d.defects}</span></td>
                  <td className="px-4 py-3 text-xs text-black/60">{d.returns}</td>
                  <td className="px-4 py-3 text-xs text-[#0F172A]">{d.rework}</td>
                  <td className="px-4 py-3 text-xs text-red-600 font-semibold">{d.ncrs}</td>
                  <td className="px-4 py-3"><Badge tone={d.status === "Good" ? "green" : d.status === "Resolved" ? "blue" : d.status === "Monitoring" ? "violet" : "red"}>{d.status}</Badge></td>
                  <td className="px-4 py-3">
                    <button onClick={() => onAction(`Quality inspection report: ${d.vendor}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3" /> Inspect</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SectionTitle>Quality Management Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Quality Inspections", desc: "Scheduled and ad-hoc inspections with mobile checklist and photo capture", icon: CheckCircle2, color: "blue" },
          { title: "Non-Conformance Reports", desc: "NCR lifecycle from detection through corrective action to closure", icon: XCircle, color: "red" },
          { title: "Defect Prediction", desc: "AI predicts quality failures based on vendor history and patterns", icon: Zap, color: "violet" },
          { title: "Warranty Claim Management", desc: "Track warranty claims, vendor response, replacement and resolution", icon: Shield, color: "green" },
          { title: "AI Defect Detection", desc: "Computer vision analysis of inspection photos for defect identification", icon: Cpu, color: "amber" },
          { title: "Quality Ranking", desc: "Vendor quality ranking updated monthly, feeds into prequalification score", icon: Star, color: "cyan" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Delivery & SLA ──────────────────────────────────────────────────────
function DeliverySLA({ onAction }: { onAction: (msg: string) => void }) {
  const slaData = [
    { vendor: "Highveld Engineering", sla: 94, onTime: 96, avgDelay: 0.8, milestones: 36, completed: 34, breaches: 2 },
    { vendor: "Zimbabwe Pharma", sla: 92, onTime: 94, avgDelay: 1.2, milestones: 48, completed: 46, breaches: 2 },
    { vendor: "Sable ICT Solutions", sla: 78, onTime: 80, avgDelay: 4.8, milestones: 22, completed: 18, breaches: 8 },
    { vendor: "Bulawayo Civil Works", sla: 58, onTime: 52, avgDelay: 18.4, milestones: 28, completed: 16, breaches: 14 },
    { vendor: "National Maintenance Corp", sla: 52, onTime: 48, avgDelay: 24.2, milestones: 48, completed: 26, breaches: 18 },
    { vendor: "Precision Engineering", sla: 98, onTime: 98, avgDelay: 0.2, milestones: 18, completed: 18, breaches: 0 },
  ];
  const slaChart = slaData.map(d => ({ name: d.vendor.split(" ")[0], sla: d.sla, target: 90 }));

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Overall SLA Compliance" value="88.4%" delta="+0.8 pts" icon={Target} color="green" />
        <KpiCard label="On-Time Delivery" value="87.4%" delta="+1.2 pts" icon={CheckCircle2} color="blue" />
        <KpiCard label="SLA Breaches (MTD)" value="44" delta="8 escalated" positive={false} icon={AlertTriangle} color="red" />
        <KpiCard label="Avg Delay (Days)" value="3.8 days" delta="-0.6 days" icon={Clock} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader title="SLA Compliance by Vendor" subtitle="Current month vs 90% target" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={slaChart}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="sla" fill="#3B82F6" radius={[3, 3, 0, 0]} name="SLA %" />
                <Bar dataKey="target" fill="#e2e8f0" radius={[3, 3, 0, 0]} name="Target 90%" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Delivery & Milestone Tracker" subtitle="Per vendor milestone completion" />
          <div className="divide-y divide-black/5">
            {slaData.map(d => (
              <div key={d.vendor} className="px-4 py-2.5 hover:bg-[#EAF1F8]/50 cursor-pointer" onClick={() => onAction(`SLA detail: ${d.vendor}`)}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-black">{d.vendor}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-black/40">{d.completed}/{d.milestones} milestones</span>
                    {d.breaches > 0 && <Badge tone={d.breaches > 10 ? "red" : "amber"}>{d.breaches} breaches</Badge>}
                  </div>
                </div>
                <ScoreBar value={d.sla} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionTitle>Delivery & SLA Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Real-Time SLA Monitoring", desc: "Live dashboard showing SLA status for all active contracts and vendors", icon: Activity, color: "blue" },
          { title: "Automatic Escalation", desc: "Breach detected → notify vendor → escalate to contract manager → CPO", icon: Bell, color: "red" },
          { title: "Delivery Tracking", desc: "Track actual vs planned delivery dates for goods, services, and milestones", icon: Target, color: "green" },
          { title: "Delay Prediction Agent", desc: "AI predicts potential delays 2–4 weeks in advance using historical patterns", icon: Zap, color: "violet" },
          { title: "Penalty Calculation", desc: "Automatic liquidated damages calculation based on contract terms", icon: DollarSign, color: "amber" },
          { title: "Service Response Timing", desc: "Track emergency response times against SLA requirements per category", icon: Clock, color: "cyan" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Risk Management ─────────────────────────────────────────────────────
function RiskManagement({ onAction }: { onAction: (msg: string) => void }) {
  const risks = VENDORS.map(v => ({
    vendor: v.name, category: v.category, financial: v.riskLevel === "Critical" ? 85 : v.riskLevel === "High" ? 62 : v.riskLevel === "Medium" ? 38 : 18,
    operational: v.overallScore < 55 ? 78 : v.overallScore < 70 ? 52 : 28,
    compliance: 100 - v.complianceScore, reputation: v.status === "Blacklisted" ? 95 : v.status === "Suspended" ? 70 : v.status === "Under Review" ? 45 : 20,
    dependency: v.contracts > 15 ? 72 : v.contracts > 8 ? 42 : 22, riskLevel: v.riskLevel, failure: v.failureProbability,
  }));

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Critical Risk Vendors" value="3" delta="Immediate action" positive={false} icon={AlertOctagon} color="red" />
        <KpiCard label="High Risk Vendors" value="18" delta="Close monitoring" positive={false} icon={AlertTriangle} color="amber" />
        <KpiCard label="Vendors Under Watch" value="142" delta="Increased monitoring" icon={Eye} color="violet" />
        <KpiCard label="Risk Mitigation Plans" value="21" delta="18 on track" icon={Shield} color="blue" />
      </div>

      <Card className="mb-6">
        <CardHeader title="Vendor Risk Register" subtitle="Multi-dimensional risk assessment with AI failure probability" action={
          <button onClick={() => onAction("Risk register exported")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Download className="h-3 w-3" /> Export</button>
        } />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["Vendor", "Category", "Financial Risk", "Operational", "Compliance", "Reputation", "Dependency", "Risk Level", "Failure Prob.", "Actions"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {risks.map(r => (
                <tr key={r.vendor} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-2.5 text-xs font-semibold text-black max-w-[140px] truncate">{r.vendor}</td>
                  <td className="px-4 py-2.5 text-xs text-black/60 whitespace-nowrap">{r.category.split(" ")[0]}</td>
                  {[r.financial, r.operational, r.compliance, r.reputation, r.dependency].map((v, i) => (
                    <td key={i} className="px-4 py-2.5 w-24 text-xs">
                      <span className={v > 60 ? "text-red-600 font-semibold" : v > 40 ? "text-[#0F172A]" : "text-[#0F172A]"}>{v}%</span>
                    </td>
                  ))}
                  <td className="px-4 py-2.5"><Badge tone={r.riskLevel === "Critical" ? "red" : r.riskLevel === "High" ? "amber" : r.riskLevel === "Medium" ? "blue" : "green"}>{r.riskLevel}</Badge></td>
                  <td className="px-4 py-2.5 text-xs font-semibold">
                    <span className={r.failure > 60 ? "text-red-600" : r.failure > 30 ? "text-[#0F172A]" : "text-[#0F172A]"}>{r.failure}%</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => onAction(`Risk mitigation plan: ${r.vendor}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800">Mitigate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SectionTitle>Risk Intelligence Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Risk Register", desc: "Multi-category risk register: financial, operational, compliance, reputational, dependency", icon: ShieldAlert, color: "red" },
          { title: "Early Warning System", desc: "AI monitors 40+ risk indicators and triggers alerts before failure occurs", icon: Bell, color: "amber" },
          { title: "Failure Probability Scoring", desc: "Predictive AI calculates vendor failure probability 60–90 days in advance", icon: Zap, color: "violet" },
          { title: "Dependency Risk Analysis", desc: "Identifies single-vendor dependencies and concentration risks", icon: Layers, color: "blue" },
          { title: "Risk Heatmap", desc: "Visual heatmap of vendor risk across categories, entities, and spend", icon: Map, color: "cyan" },
          { title: "Mitigation Action Tracking", desc: "Track risk mitigation plans, deadlines, owners, and effectiveness", icon: Target, color: "green" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Financial Performance ───────────────────────────────────────────────
function FinancialPerformance({ onAction }: { onAction: (msg: string) => void }) {
  const spendData = [
    { month: "Jan", spend: 38, savings: 2.8, invoices: 42 },
    { month: "Feb", spend: 42, savings: 3.1, invoices: 48 },
    { month: "Mar", spend: 51, savings: 3.8, invoices: 54 },
    { month: "Apr", spend: 48, savings: 3.2, invoices: 52 },
    { month: "May", spend: 56, savings: 4.1, invoices: 62 },
    { month: "Jun", spend: 62, savings: 4.4, invoices: 68 },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Total Vendor Spend (YTD)" value="USD 484M" delta="+6.2% YoY" icon={DollarSign} color="blue" />
        <KpiCard label="Cost Savings Achieved" value="USD 28.4M" delta="5.9% of spend" icon={TrendingDown} color="green" />
        <KpiCard label="Price Escalations Detected" value="14" delta="USD 4.2M impact" positive={false} icon={TrendingUp} color="amber" />
        <KpiCard label="Invoices Processed (MTD)" value="326" delta="USD 62M value" icon={FileText} color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader title="Monthly Spend & Savings Trend" subtitle="Total vendor spend vs cost savings (USD M)" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendData}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="spend" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Spend (USD M)" />
                <Bar dataKey="savings" fill="#10B981" radius={[3, 3, 0, 0]} name="Savings (USD M)" />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Spend by Vendor" subtitle="Top vendors by total contract value" />
          <div className="divide-y divide-black/5">
            {VENDORS.filter(v => v.status === "Active").slice(0, 6).map(v => (
              <div key={v.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-[#EAF1F8]/50 cursor-pointer" onClick={() => onAction(`Spend analysis: ${v.name}`)}>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-black truncate">{v.name}</div>
                  <div className="text-[10px] text-black/40">{v.contracts} contracts</div>
                </div>
                <div className="text-xs font-semibold text-black">{v.totalSpend}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionTitle>Financial Management Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Contract Value Tracking", desc: "Monitor committed vs actual spend per contract and vendor", icon: DollarSign, color: "blue" },
          { title: "Spend Analysis", desc: "Spend by category, entity, vendor, time period and procurement method", icon: BarChart3, color: "green" },
          { title: "Invoice Management", desc: "Invoice receipt, validation, approval workflow, payment tracking", icon: FileText, color: "violet" },
          { title: "Price Anomaly Detection", desc: "AI flags unusual price increases compared to market benchmarks", icon: AlertTriangle, color: "red" },
          { title: "Cost Escalation Prediction", desc: "Predict cost escalation risks 90 days ahead for budget planning", icon: TrendingUp, color: "amber" },
          { title: "Savings Identification", desc: "AI identifies savings opportunities: consolidation, renegotiation, alternatives", icon: Zap, color: "cyan" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Compliance Management ───────────────────────────────────────────────
function ComplianceManagement({ onAction }: { onAction: (msg: string) => void }) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Fully Compliant Vendors" value="9,204" delta="71.6% of active" icon={CheckCircle2} color="green" />
        <KpiCard label="Expiring Documents (30d)" value="284" delta="Renewal alerts sent" positive={false} icon={Clock} color="amber" />
        <KpiCard label="Non-Compliant Vendors" value="142" delta="Immediate action" positive={false} icon={XCircle} color="red" />
        <KpiCard label="Compliance Score Avg" value="84.2%" delta="+1.4 pts" icon={Shield} color="blue" />
      </div>

      <Card className="mb-6">
        <CardHeader title="Vendor Compliance Register" subtitle="Document validity and regulatory status" action={
          <button onClick={() => onAction("Compliance alerts dispatched to 284 vendors")} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1">
            <Bell className="h-3 w-3" /> Send Reminders
          </button>
        } />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["Vendor", "Business Licence", "Insurance", "Tax Clearance", "Safety Cert.", "Status", "Actions"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {COMPLIANCE_RECORDS.map(r => (
                <tr key={r.vendor} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3 text-xs font-semibold text-black">{r.vendor}</td>
                  {[r.license, r.insurance, r.tax, r.safety].map((val, i) => (
                    <td key={i} className="px-4 py-3 text-xs">
                      <span className={val === "EXPIRED" || val === "SUSPENDED" ? "text-red-600 font-semibold" : val === "N/A" ? "text-black/30" : new Date(val) < new Date("2026-08-01") ? "text-[#0F172A]" : "text-[#0F172A]"}>
                        {val}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-3"><Badge tone={r.status === "Compliant" ? "green" : r.status === "Expiring Soon" ? "amber" : "red"}>{r.status}</Badge></td>
                  <td className="px-4 py-3">
                    <button onClick={() => onAction(`Compliance review: ${r.vendor}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3" /> Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SectionTitle>Compliance Management Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Document Validity Tracking", desc: "Auto-track expiry of licences, certifications, insurance and tax clearance", icon: FileText, color: "blue" },
          { title: "Automated Expiry Alerts", desc: "Email/SMS alerts to vendors 90, 60, 30, 14 days before expiry", icon: Bell, color: "amber" },
          { title: "Regulatory Intelligence Agent", desc: "AI monitors regulatory changes and updates compliance requirements automatically", icon: Cpu, color: "violet" },
          { title: "Ethics & Conduct Monitoring", desc: "Track adherence to code of conduct, conflict of interest declarations", icon: Shield, color: "green" },
          { title: "Audit Finding Integration", desc: "Link compliance issues to audit findings and corrective action plans", icon: BookOpen, color: "red" },
          { title: "Compliance Scoring", desc: "Automated compliance score influences prequalification and contract awards", icon: Star, color: "cyan" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Vendor Relationships ────────────────────────────────────────────────
function VendorRelationships({ onAction }: { onAction: (msg: string) => void }) {
  const relationships = [
    { vendor: "Highveld Engineering", type: "Strategic Partner", meetingsYTD: 8, openCommitments: 2, satisfaction: 94, relationshipScore: 92, tier: "Tier 1" },
    { vendor: "Zimbabwe Pharma Holdings", type: "Strategic Partner", meetingsYTD: 6, openCommitments: 1, satisfaction: 90, relationshipScore: 88, tier: "Tier 1" },
    { vendor: "Precision Engineering Ltd", type: "Strategic Partner", meetingsYTD: 5, openCommitments: 0, satisfaction: 96, relationshipScore: 94, tier: "Tier 1" },
    { vendor: "Sable ICT Solutions", type: "Key Supplier", meetingsYTD: 4, openCommitments: 3, satisfaction: 78, relationshipScore: 76, tier: "Tier 2" },
    { vendor: "Eastern Highlands Logistics", type: "Key Supplier", meetingsYTD: 3, openCommitments: 1, satisfaction: 82, relationshipScore: 80, tier: "Tier 2" },
    { vendor: "ZimTech Consulting", type: "Standard Vendor", meetingsYTD: 2, openCommitments: 2, satisfaction: 74, relationshipScore: 72, tier: "Tier 3" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Strategic Vendors" value="84" delta="Tier 1 relationships" icon={Briefcase} color="violet" />
        <KpiCard label="Avg Relationship Score" value="82.4%" delta="+1.8 pts" icon={Star} color="green" />
        <KpiCard label="Open Commitments" value="142" delta="28 overdue" positive={false} icon={Clock} color="amber" />
        <KpiCard label="Vendor Satisfaction" value="84.2%" delta="+2.1 pts" icon={ThumbsUp} color="blue" />
      </div>

      <Card className="mb-6">
        <CardHeader title="Vendor Relationship Register" subtitle="Relationship health and engagement tracking" action={
          <button onClick={() => onAction("Relationship summary generated")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><FileText className="h-3 w-3" /> Summary</button>
        } />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["Vendor", "Type", "Tier", "Meetings (YTD)", "Open Commitments", "Satisfaction", "Relationship Score", "Actions"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {relationships.map(r => (
                <tr key={r.vendor} className="hover:bg-[#EAF1F8]/50">
                  <td className="px-4 py-3 text-xs font-semibold text-black">{r.vendor}</td>
                  <td className="px-4 py-3 text-xs text-black/60">{r.type}</td>
                  <td className="px-4 py-3"><Badge tone={r.tier === "Tier 1" ? "violet" : r.tier === "Tier 2" ? "blue" : "muted"}>{r.tier}</Badge></td>
                  <td className="px-4 py-3 text-xs text-black/70">{r.meetingsYTD}</td>
                  <td className="px-4 py-3 text-xs"><span className={r.openCommitments > 2 ? "text-red-500" : r.openCommitments > 0 ? "text-slate-600" : "text-slate-600"}>{r.openCommitments}</span></td>
                  <td className="px-4 py-3 w-28"><ScoreBar value={r.satisfaction} /></td>
                  <td className="px-4 py-3 w-28"><ScoreBar value={r.relationshipScore} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => onAction(`Meeting scheduled with: ${r.vendor}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Meet</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <SectionTitle>VRM Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Meeting & Review Management", desc: "Schedule, record and track quarterly business reviews and strategic meetings", icon: MessageSquare, color: "blue" },
          { title: "Relationship Intelligence Agent", desc: "AI measures relationship health, predicts deterioration, suggests interventions", icon: Cpu, color: "violet" },
          { title: "Feedback Management", desc: "Structured vendor feedback collection, analysis, and response tracking", icon: ThumbsUp, color: "green" },
          { title: "Commitment Tracking", desc: "Track all vendor commitments made in meetings with due dates and owners", icon: Target, color: "amber" },
          { title: "Partnership Management", desc: "Strategic partner programme: joint planning, innovation partnerships, SROI", icon: Briefcase, color: "cyan" },
          { title: "Improvement Plans", desc: "Collaborative improvement planning with measurable targets and timelines", icon: TrendingUp, color: "red" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Corrective Actions ──────────────────────────────────────────────────
function CorrectiveActions({ onAction }: { onAction: (msg: string) => void }) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Active CAPs" value="9" delta="3 overdue" positive={false} icon={Target} color="red" />
        <KpiCard label="Completed This Month" value="4" delta="Closed successfully" icon={CheckCircle2} color="green" />
        <KpiCard label="Vendors Under PIP" value="6" delta="Performance Improvement" icon={TrendingUp} color="amber" />
        <KpiCard label="Recurring Failures" value="3" delta="Escalation triggered" positive={false} icon={AlertTriangle} color="violet" />
      </div>

      <Card className="mb-6">
        <CardHeader title="Corrective Action Plans" subtitle="Active performance improvement and corrective action tracking" action={
          <button onClick={() => onAction("New CAP created")} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Plus className="h-3 w-3" /> New CAP</button>
        } />
        <div className="divide-y divide-black/5">
          {CORRECTIVE_ACTIONS.map(c => (
            <div key={c.id} className="px-5 py-4 hover:bg-[#EAF1F8]/50">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-sm font-semibold text-black">{c.vendor}</div>
                  <div className="text-[11px] text-black/40 font-mono">{c.id} · Due: {c.due}</div>
                </div>
                <Badge tone={c.status === "Completed" ? "green" : c.status === "Overdue" ? "red" : "amber"}>{c.status}</Badge>
              </div>
              <div className="text-xs text-black/70 mb-1"><span className="font-semibold text-black">Issue: </span>{c.issue}</div>
              <div className="text-xs text-black/70 mb-3"><span className="font-semibold text-black">Action: </span>{c.action}</div>
              <div className="flex gap-2">
                <button onClick={() => onAction(`CAP progress updated: ${c.id}`)} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Update Progress</button>
                {c.status !== "Completed" && <button onClick={() => onAction(`Escalated: ${c.vendor} — ${c.id}`)} className="h-7 px-3 rounded-lg border border-red-200 text-red-600 text-xs hover:bg-red-50 flex items-center gap-1"><AlertOctagon className="h-3 w-3" /> Escalate</button>}
                {c.status === "In Progress" && <button onClick={() => onAction(`CAP closed: ${c.id}`)} className="h-7 px-3 rounded-lg border border-slate-200 text-[#0F172A] text-xs hover:bg-slate-50 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Close</button>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>Corrective Action Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Performance Improvement Plans", desc: "Structured PIPs with SMART targets, milestones, and review schedule", icon: Target, color: "blue" },
          { title: "Root Cause Analysis", desc: "Fishbone diagrams, 5-Why analysis, systemic cause identification", icon: Search, color: "violet" },
          { title: "AI Improvement Coach", desc: "AI agent suggests corrective actions based on failure type and vendor history", icon: Cpu, color: "green" },
          { title: "Action Tracking", desc: "Completion status, responsible parties, evidence upload, verification", icon: CheckCircle2, color: "amber" },
          { title: "Escalation Management", desc: "Automatic escalation to CPO if CAP overdue by defined tolerance", icon: Bell, color: "red" },
          { title: "Recurring Failure Detection", desc: "AI flags repeated failures suggesting systemic vendor capability gaps", icon: AlertOctagon, color: "cyan" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Disputes ────────────────────────────────────────────────────────────
function Disputes({ onAction }: { onAction: (msg: string) => void }) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Open Disputes" value="12" delta="4 escalated" positive={false} icon={AlertOctagon} color="red" />
        <KpiCard label="Avg Resolution Time" value="24 days" delta="-3 days" icon={Clock} color="green" />
        <KpiCard label="Total Dispute Value" value="USD 842K" delta="3 near resolution" icon={DollarSign} color="amber" />
        <KpiCard label="Resolved YTD" value="28" delta="91% success rate" icon={CheckCircle2} color="blue" />
      </div>

      <Card className="mb-6">
        <CardHeader title="Dispute Register" subtitle="Active complaints, claims and disputes" action={
          <button onClick={() => onAction("New dispute lodged")} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Plus className="h-3 w-3" /> New Dispute</button>
        } />
        <div className="divide-y divide-black/5">
          {DISPUTES.map(d => (
            <div key={d.id} className="px-5 py-3 hover:bg-[#EAF1F8]/50">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-black">{d.vendor}</div>
                  <div className="text-[11px] text-black/40 font-mono">{d.id} · {d.type} · {d.value}</div>
                  <div className="text-[11px] text-black/40 mt-0.5">Open for {d.days} days</div>
                </div>
                <Badge tone={d.status === "Resolved" ? "green" : d.status === "Negotiating" ? "blue" : "red"}>{d.status}</Badge>
              </div>
              <div className="flex gap-2 mt-2">
                <button onClick={() => onAction(`Dispute detail: ${d.id}`)} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3" /> View</button>
                {d.status !== "Resolved" && <>
                  <button onClick={() => onAction(`Mediation initiated: ${d.id}`)} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Mediate</button>
                  <button onClick={() => onAction(`Dispute resolved: ${d.id}`)} className="h-7 px-3 rounded-lg border border-slate-200 text-[#0F172A] text-xs hover:bg-slate-50 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Resolve</button>
                </>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>Dispute Management Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Dispute Registration", desc: "Lodge complaints, claims, and disputes with supporting documentation", icon: FileText, color: "blue" },
          { title: "Dispute Categorisation", desc: "AI categorises disputes by type, value, and escalation risk automatically", icon: Cpu, color: "violet" },
          { title: "Mediation Workflow", desc: "Structured mediation process with nominated mediator and hearing schedule", icon: MessageSquare, color: "green" },
          { title: "Escalation Prediction", desc: "AI predicts which disputes will escalate to arbitration or legal action", icon: AlertOctagon, color: "red" },
          { title: "Resolution Tracking", desc: "Track negotiation progress, offers, counteroffers, and settlement terms", icon: Target, color: "amber" },
          { title: "Root Cause Analysis", desc: "Identify and record root causes to prevent similar disputes in future", icon: Search, color: "cyan" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Suspension & Exit ───────────────────────────────────────────────────
function SuspensionExit({ onAction }: { onAction: (msg: string) => void }) {
  const actions = [
    { vendor: "Granite Construction Group", action: "Blacklisted", date: "2026-05-05", reason: "Contract abandonment, fraud investigation", contracts: 4, appeal: "Rejected" },
    { vendor: "National Maintenance Corp", action: "Suspended", date: "2026-05-28", reason: "Repeated quality failures, non-compliance", contracts: 12, appeal: "In Progress" },
    { vendor: "Delta Transport Co", action: "Suspended", date: "2026-06-10", reason: "False documentation submitted at registration", contracts: 2, appeal: "None" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Suspended Vendors" value="48" delta="+3 this month" positive={false} icon={AlertTriangle} color="amber" />
        <KpiCard label="Blacklisted Vendors" value="228" delta="+8 this month" positive={false} icon={Ban} color="red" />
        <KpiCard label="Exit Reviews (YTD)" value="84" delta="Completed exits" icon={UserCheck} color="blue" />
        <KpiCard label="Reinstatements (YTD)" value="12" delta="After remediation" icon={RefreshCw} color="green" />
      </div>

      <Card className="mb-6">
        <CardHeader title="Suspension & Blacklist Register" subtitle="Vendor lifecycle termination actions" action={
          <button onClick={() => onAction("Suspension workflow initiated")} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Ban className="h-3 w-3" /> Suspend Vendor</button>
        } />
        <div className="divide-y divide-black/5">
          {actions.map(a => (
            <div key={a.vendor} className="px-5 py-4 hover:bg-[#EAF1F8]/50">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-sm font-semibold text-black">{a.vendor}</div>
                  <div className="text-[11px] text-black/40">Action Date: {a.date} · {a.contracts} contracts affected</div>
                </div>
                <Badge tone={a.action === "Blacklisted" ? "red" : "amber"}>{a.action}</Badge>
              </div>
              <div className="text-xs text-black/70 mb-1"><span className="font-semibold">Reason: </span>{a.reason}</div>
              <div className="text-xs text-black/60 mb-2"><span className="font-semibold">Appeal Status: </span>
                <span className={a.appeal === "Rejected" ? "text-red-600" : a.appeal === "In Progress" ? "text-[#0F172A]" : "text-black/40"}>{a.appeal}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onAction(`Suspension review: ${a.vendor}`)} className="h-7 px-3 rounded-lg bg-black text-white text-xs hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3" /> Review</button>
                {a.action === "Suspended" && <button onClick={() => onAction(`Reinstatement initiated: ${a.vendor}`)} className="h-7 px-3 rounded-lg border border-slate-200 text-[#0F172A] text-xs hover:bg-slate-50 flex items-center gap-1"><RefreshCw className="h-3 w-3" /> Reinstate</button>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SectionTitle>Suspension & Exit Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Suspension Workflow", desc: "Structured process: notice → hearing → decision → appeal → outcome", icon: AlertTriangle, color: "amber" },
          { title: "Blacklisting Register", desc: "Maintain national blacklist shared across all government entities", icon: Ban, color: "red" },
          { title: "AI Suspension Recommendation", desc: "AI flags vendors meeting suspension criteria and recommends action", icon: Cpu, color: "violet" },
          { title: "Exit Review Process", desc: "Document exit reasons, lessons learned, and outstanding liabilities", icon: FileText, color: "blue" },
          { title: "Reinstatement Pathway", desc: "Structured rehabilitation process with conditions and monitoring period", icon: RefreshCw, color: "green" },
          { title: "Historical Record Maintenance", desc: "Permanent record of all actions preserved for audit and reference", icon: BookOpen, color: "cyan" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Analytics & Intelligence ───────────────────────────────────────────
function AnalyticsIntelligence({ onAction }: { onAction: (msg: string) => void }) {
  const distributionData = [
    { range: "90–100%", count: 2840 },
    { range: "80–89%", count: 4002 },
    { range: "70–79%", count: 2840 },
    { range: "60–69%", count: 1620 },
    { range: "50–59%", count: 820 },
    { range: "<50%", count: 725 },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Analytics Reports (MTD)" value="284" delta="Automated daily" icon={BarChart3} color="blue" />
        <KpiCard label="AI Predictions Made" value="1,284" delta="94% accuracy" icon={Zap} color="violet" />
        <KpiCard label="Early Warnings Issued" value="48" delta="32 actioned" icon={Bell} color="amber" />
        <KpiCard label="Savings Opportunities" value="USD 4.2M" delta="Identified by AI" icon={DollarSign} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader title="Vendor Score Distribution" subtitle="All vendors across performance bands" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} name="Vendors">
                  {distributionData.map((_, i) => <Cell key={i} fill={i < 2 ? "#475569" : i < 4 ? "#334155" : i < 5 ? "#64748B" : "#DC2626"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="AI Executive Control Tower" subtitle="Chief Vendor Intelligence Agent — Real-time status" />
          <div className="p-4 space-y-3">
            {[
              { label: "Vendors Monitored", value: "12,847", status: "Live", color: "text-[#0F172A]" },
              { label: "Performance Failures Predicted", value: "18", status: "⚠ Action Required", color: "text-[#0F172A]" },
              { label: "Fraud Signals Detected", value: "4", status: "🔴 Critical", color: "text-red-600" },
              { label: "Savings Opportunities Found", value: "USD 4.2M", status: "✓ Briefing Ready", color: "text-[#0F172A]" },
              { label: "Contract Risks Identified", value: "22", status: "⚠ Review Required", color: "text-[#0F172A]" },
              { label: "Vendors Recommended for Suspension", value: "3", status: "🔴 Approval Needed", color: "text-red-600" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-black/5 last:border-0">
                <span className="text-xs text-black/60">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-black">{item.value}</span>
                  <span className={`text-[10px] font-medium ${item.color}`}>{item.status}</span>
                </div>
              </div>
            ))}
            <button onClick={() => onAction("Executive intelligence brief generated")} className="w-full h-9 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 mt-2 flex items-center justify-center gap-2">
              <Zap className="h-4 w-4" /> Generate Executive Brief
            </button>
          </div>
        </Card>
      </div>

      <SectionTitle>Analytics Platform Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Vendor Health Scorecard", desc: "Comprehensive health score combining all performance dimensions", icon: Activity, color: "blue" },
          { title: "Predictive Analytics", desc: "Forecast vendor performance trajectories and failure probabilities", icon: TrendingUp, color: "violet" },
          { title: "Spend Intelligence", desc: "Category spend trends, concentration risks, savings opportunities", icon: DollarSign, color: "green" },
          { title: "Market Benchmarking", desc: "Compare vendor performance against industry and market benchmarks", icon: BarChart3, color: "amber" },
          { title: "Executive Reports", desc: "Auto-generated weekly and monthly executive briefings with actions", icon: FileText, color: "cyan" },
          { title: "Real-Time Alerts", desc: "Instant alerts for critical events, breaches, and risk threshold crossings", icon: Bell, color: "red" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: Knowledge Base ──────────────────────────────────────────────────────
function KnowledgeBase({ onAction }: { onAction: (msg: string) => void }) {
  const lessons = [
    { ref: "KL-2026-042", vendor: "Highveld Engineering", project: "Beitbridge Highway Phase 2", type: "Best Practice", insight: "Early community engagement reduced delays by 6 weeks", category: "Stakeholder Management" },
    { ref: "KL-2026-041", vendor: "Zimbabwe Pharma Holdings", project: "ARV Framework 2024", type: "Lesson Learned", insight: "Cold chain monitoring critical — 2% spoilage rate without IoT tracking", category: "Quality" },
    { ref: "KL-2026-040", vendor: "Bulawayo Civil Works", project: "Gweru Road Rehab", type: "Failure Case", insight: "Under-capitalised contractor — cash flow monitoring needed from month 1", category: "Financial Risk" },
    { ref: "KL-2026-039", vendor: "Sable ICT Solutions", project: "ZIMRA Tax System Phase 1", type: "Lesson Learned", insight: "Data migration testing required 3x longer than planned in government contexts", category: "Technical Risk" },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Knowledge Records" value="2,841" delta="+142 this quarter" icon={BookOpen} color="blue" />
        <KpiCard label="Best Practices" value="684" delta="Shared across entities" icon={Star} color="green" />
        <KpiCard label="Failure Cases" value="428" delta="Preventive lessons" icon={AlertTriangle} color="amber" />
        <KpiCard label="AI Queries Answered" value="1,284" delta="This month" icon={Zap} color="violet" />
      </div>

      <Card className="mb-6">
        <CardHeader title="Lessons Learned Register" subtitle="Historical vendor performance intelligence" action={
          <button onClick={() => onAction("Knowledge base searched by AI")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Search className="h-3 w-3" /> AI Search</button>
        } />
        <div className="divide-y divide-black/5">
          {lessons.map(l => (
            <div key={l.ref} className="px-5 py-4 hover:bg-[#EAF1F8]/50 cursor-pointer" onClick={() => onAction(`Knowledge record: ${l.ref}`)}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-sm font-semibold text-black">{l.vendor}</div>
                <Badge tone={l.type === "Best Practice" ? "green" : l.type === "Failure Case" ? "red" : "blue"}>{l.type}</Badge>
              </div>
              <div className="text-[11px] text-black/40 mb-1">{l.ref} · {l.project} · {l.category}</div>
              <div className="text-xs text-black/70">{l.insight}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="bg-[#0F172A] border border-slate-200 rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-xl bg-[#0F172A] grid place-items-center"><Cpu className="h-5 w-5 text-white" /></div>
          <div><div className="text-sm font-semibold text-black">Vendor Knowledge Assistant</div><div className="text-xs text-black/50">Ask about vendor history, past performance, and recommendations</div></div>
        </div>
        <div className="space-y-2">
          {["Which vendors performed best on hospital construction contracts?", "Which suppliers caused delays on ICT projects previously?", "What is the recommended vendor for pharmaceutical supply in Matabeleland?"].map(q => (
            <button key={q} onClick={() => onAction(`AI answered: "${q}"`)} className="w-full text-left px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-black/70 hover:border-slate-200 hover:bg-slate-50 transition-all">
              💡 {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Market Intelligence ─────────────────────────────────────────────────
function MarketIntelligence({ onAction }: { onAction: (msg: string) => void }) {
  const marketData = [
    { category: "Infrastructure", vendors: 3284, avgPrice: "USD 1,840/m²", benchmark: "USD 1,720/m²", gap: "+7.0%", trend: "Rising" },
    { category: "Pharmaceuticals", vendors: 1842, avgPrice: "USD 8.50/pack", benchmark: "USD 7.80/pack", gap: "+9.0%", trend: "Stable" },
    { category: "ICT Equipment", vendors: 924, avgPrice: "USD 1,280/unit", benchmark: "USD 1,150/unit", gap: "+11.3%", trend: "Falling" },
    { category: "Agriculture", vendors: 2104, avgPrice: "USD 420/tonne", benchmark: "USD 390/tonne", gap: "+7.7%", trend: "Rising" },
    { category: "Logistics", vendors: 684, avgPrice: "USD 0.28/km", benchmark: "USD 0.24/km", gap: "+16.7%", trend: "Rising" },
  ];
  const priceChart = marketData.map(d => ({ name: d.category.split(" ")[0], gap: parseFloat(d.gap) }));

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Vendors Monitored" value="12,847" delta="Global + regional" icon={Globe2} color="blue" />
        <KpiCard label="Price Benchmarks Active" value="284" delta="Across 42 categories" icon={BarChart3} color="green" />
        <KpiCard label="New Suppliers Discovered" value="842" delta="This quarter" icon={Search} color="violet" />
        <KpiCard label="Categories Above Benchmark" value="18" delta="Savings opportunity" positive={false} icon={TrendingUp} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader title="Price Gap vs Market Benchmark" subtitle="Government prices vs market average %" />
          <div className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceChart}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} formatter={(v) => `+${v}%`} />
                <Bar dataKey="gap" radius={[3, 3, 0, 0]} name="Price Gap">
                  {priceChart.map((d, i) => <Cell key={i} fill={d.gap > 10 ? "#DC2626" : d.gap > 7 ? "#64748B" : "#475569"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <CardHeader title="Category Market Intelligence" subtitle="Benchmark comparison by procurement category" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#EAF1F8] text-xs text-black/40">
                <tr>{["Category", "Vendors", "Gov Avg Price", "Market Benchmark", "Gap", "Trend"].map(h => (
                  <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {marketData.map(d => (
                  <tr key={d.category} className="hover:bg-[#EAF1F8]/50 cursor-pointer" onClick={() => onAction(`Market intelligence: ${d.category}`)}>
                    <td className="px-4 py-2.5 text-xs font-semibold text-black">{d.category}</td>
                    <td className="px-4 py-2.5 text-xs text-black/60">{d.vendors.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-xs text-black/70">{d.avgPrice}</td>
                    <td className="px-4 py-2.5 text-xs text-[#0F172A]">{d.benchmark}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-red-600">{d.gap}</td>
                    <td className="px-4 py-2.5"><Badge tone={d.trend === "Falling" ? "green" : d.trend === "Stable" ? "blue" : "amber"}>{d.trend}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <SectionTitle>Market Intelligence Capabilities</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { title: "Real-Time Price Monitoring", desc: "AI tracks market prices across commodity and service categories continuously", icon: Activity, color: "blue" },
          { title: "Vendor Discovery", desc: "Identify new qualified vendors globally and regionally to increase competition", icon: Search, color: "green" },
          { title: "Industry Benchmarking", desc: "Compare government procurement prices against industry and regional benchmarks", icon: BarChart3, color: "violet" },
          { title: "Supply Chain Risk Intelligence", desc: "Monitor global supply chain disruptions, shortages, and price spikes", icon: AlertTriangle, color: "red" },
          { title: "Demand Forecasting", desc: "AI forecasts procurement demand by category to inform market engagement", icon: TrendingUp, color: "amber" },
          { title: "Supplier Diversity Analysis", desc: "Track SME, women-owned, and local content participation rates by category", icon: Users, color: "cyan" },
        ].map(f => <FeatureCard key={f.title} {...f} />)}
      </div>
    </div>
  );
}

// ─── Tab: AI Agents ───────────────────────────────────────────────────────────
function AIAgents({ onAction }: { onAction: (msg: string) => void }) {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard label="Active AI Agents" value="14" delta="1 standby" icon={Cpu} color="violet" />
        <KpiCard label="Total Actions (MTD)" value="14,284" delta="+1,840 from last month" icon={Zap} color="blue" />
        <KpiCard label="Avg Accuracy" value="92.6%" delta="+0.8 pts" icon={Target} color="green" />
        <KpiCard label="Alerts Generated" value="284" delta="242 actioned" icon={Bell} color="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
        {AI_AGENTS_DATA.map(agent => (
          <div key={agent.name} className="bg-white border border-black/8 rounded-xl p-4 hover:shadow-sm hover:border-black/15 transition-all">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-slate-100 grid place-items-center flex-shrink-0"><Cpu className="h-4 w-4 text-[#0F172A]" /></div>
              <Badge tone={agent.status === "Active" ? "green" : "muted"}>{agent.status}</Badge>
            </div>
            <div className="text-sm font-semibold text-black mb-1">{agent.name}</div>
            <div className="text-xs text-black/50 mb-3 leading-relaxed">{agent.desc}</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="text-center bg-[#EAF1F8] rounded-lg p-2">
                <div className="text-base font-bold text-black">{agent.tasks.toLocaleString()}</div>
                <div className="text-[10px] text-black/40">Tasks</div>
              </div>
              <div className="text-center bg-[#EAF1F8] rounded-lg p-2">
                <div className="text-base font-bold text-black">{agent.accuracy}%</div>
                <div className="text-[10px] text-black/40">Accuracy</div>
              </div>
            </div>
            <ScoreBar value={agent.accuracy} />
            <button onClick={() => onAction(`Activating ${agent.name}`)} className="w-full h-7 rounded-lg bg-black text-white text-xs hover:bg-gray-800 mt-2 flex items-center justify-center gap-1.5">
              <Zap className="h-3 w-3" /> Run Agent
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function PerformancePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Executive Dashboard");

  const handleAction = (msg: string) => {
    pushSeniorAlert(msg, "info", { from: user?.name, fromRole: user?.role ?? "officer", category: "action" });
    pushNotification(msg, "success");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "Executive Dashboard":      return <ExecutiveDashboard />;
      case "Vendor Master":            return <VendorMaster onAction={handleAction} />;
      case "Registration & Onboarding": return <RegistrationOnboarding onAction={handleAction} />;
      case "Prequalification":         return <Prequalification onAction={handleAction} />;
      case "Bidding Performance":      return <BiddingPerformance onAction={handleAction} />;
      case "Selection & Award":        return <SelectionAward onAction={handleAction} />;
      case "Contract Lifecycle":       return <ContractLifecycle onAction={handleAction} />;
      case "Scorecards":               return <Scorecards onAction={handleAction} />;
      case "Quality Management":       return <QualityManagement onAction={handleAction} />;
      case "Delivery & SLA":           return <DeliverySLA onAction={handleAction} />;
      case "Risk Management":          return <RiskManagement onAction={handleAction} />;
      case "Financial Performance":    return <FinancialPerformance onAction={handleAction} />;
      case "Compliance":               return <ComplianceManagement onAction={handleAction} />;
      case "Vendor Relationships":     return <VendorRelationships onAction={handleAction} />;
      case "Corrective Actions":       return <CorrectiveActions onAction={handleAction} />;
      case "Disputes":                 return <Disputes onAction={handleAction} />;
      case "Suspension & Exit":        return <SuspensionExit onAction={handleAction} />;
      case "Analytics & Intelligence": return <AnalyticsIntelligence onAction={handleAction} />;
      case "Knowledge Base":           return <KnowledgeBase onAction={handleAction} />;
      case "Market Intelligence":      return <MarketIntelligence onAction={handleAction} />;
      case "AI Agents":                return <AIAgents onAction={handleAction} />;
      default:                         return null;
    }
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Performance Management"
        process="Performance Monitoring"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="violet">Vendor Performance Control Tower</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
          <Badge tone="blue">20 Modules · 15 AI Agents</Badge>
        </div>
        <PageHeader
          title="Vendor Performance Management"
          description="Complete vendor intelligence platform — from registration through qualification, bidding, contract execution, performance monitoring, and lifecycle exit. Powered by 15 specialized AI agents."
          actions={
            <div className="flex gap-2">
              <button onClick={() => handleAction("Global vendor performance report generated")}
                className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm font-medium hover:bg-[#EAF1F8] flex items-center gap-1.5 transition-colors">
                <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export Report</span>
              </button>
              <button onClick={() => handleAction("All AI agents activated for vendor analysis")}
                className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800 transition-colors">
                <Zap className="h-4 w-4" /> Run All Agents
              </button>
            </div>
          }
        />

        {/* Tab Navigation */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-none border-b border-black/10">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                activeTab === tab
                  ? "bg-black text-white"
                  : "text-black/50 hover:text-black hover:bg-[#EAF1F8]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTab()}
      </div>
    </AppShell>
  );
}
