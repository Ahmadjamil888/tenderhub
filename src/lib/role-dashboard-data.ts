// ─── Role Dashboard Configuration Data ───────────────────────────────────────
// Each role gets its own unique dashboard configuration with role-specific
// KPIs, quick actions, sub-modules, activity feed, and AI capabilities.

export type RoleKPI = {
  label: string; value: string; delta: string; positive: boolean;
  color: "blue"|"green"|"amber"|"red"|"violet"|"cyan"|"orange"|"pink";
};

export type RoleAction = {
  label: string; desc: string; icon: string; route?: string; color?: string;
};

export type RoleActivity = {
  action: string; time: string; type: "success"|"info"|"warning"|"error";
};

export type RoleSubModule = {
  label: string; route: string; icon: string; desc: string;
};

export type RoleChartPoint = { label: string; value: number; value2?: number };

export type RoleDashboardConfig = {
  role: string;
  title: string;
  subtitle: string;
  department: string;
  gradientFrom: string;
  gradientTo: string;
  accentHex: string;
  kpis: RoleKPI[];
  quickActions: RoleAction[];
  recentActivity: RoleActivity[];
  chartData: RoleChartPoint[];
  chartTitle: string;
  chartLabel1: string;
  chartLabel2?: string;
  aiName: string;
  aiCapabilities: string[];
  subModules: RoleSubModule[];
};

const CONFIGS: Record<string, RoleDashboardConfig> = {

// ── PERMANENT SECRETARY ──────────────────────────────────────────────────────
permanent_secretary: {
  role: "permanent_secretary", title: "Permanent Secretary", subtitle: "Institutional Head · Strategic Oversight",
  department: "Office of the Permanent Secretary", gradientFrom: "#1e1b4b", gradientTo: "#312e81", accentHex: "#818cf8",
  kpis: [
    { label: "Departments Under Oversight", value: "14", delta: "All operational", positive: true, color: "violet" },
    { label: "Strategic Plans Active", value: "7", delta: "+2 this quarter", positive: true, color: "blue" },
    { label: "Cabinet Submissions Pending", value: "3", delta: "Due this week", positive: false, color: "amber" },
    { label: "Overall Compliance Rate", value: "96.4%", delta: "+1.2 pts", positive: true, color: "green" },
    { label: "Staff Headcount", value: "348", delta: "Across all depts", positive: true, color: "cyan" },
    { label: "Open Issues Escalated", value: "5", delta: "Requires action", positive: false, color: "red" },
  ],
  quickActions: [
    { label: "Review Strategic Plans", desc: "Annual plans progress review", icon: "Target", route: "/corporate" },
    { label: "Cabinet Reports", desc: "Prepare ministerial reports", icon: "FileText", route: "/department-activities" },
    { label: "Approve Budgets", desc: "Sign off departmental budgets", icon: "Wallet", route: "/budget" },
    { label: "Staff Performance Review", desc: "Quarterly performance oversight", icon: "TrendingUp", route: "/staff-productivity" },
    { label: "Risk Register", desc: "Institutional risk overview", icon: "ShieldCheck", route: "/audit" },
    { label: "AI Briefing", desc: "Get AI institutional summary", icon: "Sparkles", route: "/ai-agents" },
  ],
  recentActivity: [
    { action: "Strategic Plan Q2 review completed — 88% targets on track", time: "1 hr ago", type: "success" },
    { action: "Cabinet submission prepared for Infrastructure Development Act", time: "3 hrs ago", type: "info" },
    { action: "Finance Department flagged budget overrun — USD 1.2M", time: "4 hrs ago", type: "warning" },
    { action: "HR Department submitted recruitment plan for 48 vacancies", time: "Yesterday", type: "info" },
    { action: "Compliance audit report received — 96.4% score", time: "2 days ago", type: "success" },
  ],
  chartData: [
    { label: "PS Office", value: 94 }, { label: "Strategy", value: 88 }, { label: "Finance", value: 91 },
    { label: "Procurement", value: 89 }, { label: "HR", value: 92 }, { label: "ICT", value: 93 },
    { label: "Legal", value: 95 }, { label: "Audit", value: 97 }, { label: "Operations", value: 86 },
  ],
  chartTitle: "Departmental Performance Scores", chartLabel1: "Score %",
  aiName: "Executive AI Advisor",
  aiCapabilities: ["Summarise all department performance", "Draft cabinet reports", "Flag cross-department risks", "Generate institutional health report"],
  subModules: [
    { label: "Corporate Module", route: "/corporate", icon: "Crown", desc: "All 14 departments" },
    { label: "Strategic Planning", route: "/corporate/strategy-policy-planning", icon: "Target", desc: "Plans & policies" },
    { label: "Budget Oversight", route: "/budget", icon: "Wallet", desc: "Financial control" },
    { label: "Staff Productivity", route: "/staff-productivity", icon: "Users", desc: "Performance metrics" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "Compliance & rules" },
    { label: "AI Operations", route: "/ai-agents", icon: "Sparkles", desc: "AI agents status" },
  ],
},

// ── CHIEF EXECUTIVE ──────────────────────────────────────────────────────────
chief_executive: {
  role: "chief_executive", title: "Chief Executive Officer", subtitle: "Entity-Level Strategic Management",
  department: "Executive Office", gradientFrom: "#0f172a", gradientTo: "#1e293b", accentHex: "#94a3b8",
  kpis: [
    { label: "Revenue YTD", value: "USD 84.2M", delta: "+12% vs target", positive: true, color: "green" },
    { label: "Operating Costs", value: "USD 61.8M", delta: "Within budget", positive: true, color: "blue" },
    { label: "Staff Headcount", value: "1,240", delta: "14 vacancies open", positive: false, color: "amber" },
    { label: "Projects Active", value: "23", delta: "5 at risk", positive: false, color: "red" },
    { label: "Compliance Score", value: "94.8%", delta: "+0.6 pts", positive: true, color: "violet" },
    { label: "Customer Satisfaction", value: "4.2/5", delta: "+0.3 pts", positive: true, color: "cyan" },
  ],
  quickActions: [
    { label: "Executive Dashboard", desc: "Full entity overview", icon: "LayoutDashboard", route: "/prime-entity" },
    { label: "Board Reports", desc: "Prepare board packs", icon: "FileText", route: "/department-activities" },
    { label: "Financial Review", desc: "P&L and cash flow", icon: "DollarSign", route: "/finance" },
    { label: "People & Culture", desc: "HR metrics and talent", icon: "Users", route: "/staff-productivity" },
    { label: "Strategic Projects", desc: "Portfolio overview", icon: "Briefcase", route: "/projects" },
    { label: "Risk & Compliance", desc: "Enterprise risk view", icon: "ShieldCheck", route: "/audit" },
  ],
  recentActivity: [
    { action: "Q2 Board Pack finalised and distributed to all board members", time: "2 hrs ago", type: "success" },
    { action: "Revenue target exceeded by 12% — commendation to Finance team", time: "4 hrs ago", type: "success" },
    { action: "3 strategic projects flagged at risk — urgent review required", time: "5 hrs ago", type: "warning" },
    { action: "New CFO appointment approved by Board", time: "Yesterday", type: "info" },
    { action: "Annual performance reviews commenced across all departments", time: "2 days ago", type: "info" },
  ],
  chartData: [
    { label: "Jan", value: 6.2, value2: 5.1 }, { label: "Feb", value: 7.1, value2: 5.6 },
    { label: "Mar", value: 6.8, value2: 5.3 }, { label: "Apr", value: 7.9, value2: 5.9 },
    { label: "May", value: 8.4, value2: 6.1 }, { label: "Jun", value: 7.6, value2: 5.8 },
  ],
  chartTitle: "Revenue vs Operating Costs (USD M)", chartLabel1: "Revenue", chartLabel2: "Costs",
  aiName: "CEO AI Advisor",
  aiCapabilities: ["Executive performance briefing", "Board report generation", "Strategic risk analysis", "Department comparison reports"],
  subModules: [
    { label: "Prime Entity Dashboard", route: "/prime-entity", icon: "Landmark", desc: "Full oversight" },
    { label: "Financial Control", route: "/finance", icon: "Wallet", desc: "P&L, cash flow" },
    { label: "Project Portfolio", route: "/projects/portfolio", icon: "Briefcase", desc: "All projects" },
    { label: "Risk & Audit", route: "/audit", icon: "ShieldCheck", desc: "Enterprise risks" },
    { label: "People Analytics", route: "/staff-productivity", icon: "Users", desc: "HR metrics" },
    { label: "Analytics Hub", route: "/analytics", icon: "BarChart3", desc: "BI dashboards" },
  ],
},

// ── ADJUDICATION OFFICER ─────────────────────────────────────────────────────
adjudication_officer: {
  role: "adjudication_officer", title: "Adjudication Officer", subtitle: "Award Decisions · Appeals · Committee",
  department: "Procurement — Adjudication Unit", gradientFrom: "#3b0764", gradientTo: "#581c87", accentHex: "#c084fc",
  kpis: [
    { label: "Pending Adjudications", value: "8", delta: "3 urgent", positive: false, color: "amber" },
    { label: "Awards Issued (MTD)", value: "14", delta: "+4 vs last month", positive: true, color: "green" },
    { label: "Appeals Received", value: "3", delta: "2 under review", positive: false, color: "red" },
    { label: "Avg Decision Time", value: "4.2 days", delta: "Target: 5 days", positive: true, color: "blue" },
    { label: "COI Checks Completed", value: "22/22", delta: "All cleared", positive: true, color: "violet" },
  ],
  quickActions: [
    { label: "Review Evaluation Reports", desc: "Pending for adjudication", icon: "FileText", route: "/evaluations" },
    { label: "Issue Award", desc: "Formally recommend award", icon: "Trophy", route: "/awards" },
    { label: "Process Appeal", desc: "Handle bid appeals", icon: "Scale", route: "/awards" },
    { label: "Committee Minutes", desc: "Record proceedings", icon: "ClipboardList", route: "/tenders" },
    { label: "COI Declaration Check", desc: "Verify member declarations", icon: "ShieldCheck", route: "/governance" },
    { label: "Generate Report", desc: "Adjudication summary", icon: "BarChart3", route: "/analytics" },
  ],
  recentActivity: [
    { action: "Award recommended — ZW-PRA-2026-00183 ARV Medicines USD 42.5M", time: "2 hrs ago", type: "success" },
    { action: "COI check completed for all 5 committee members", time: "4 hrs ago", type: "success" },
    { action: "Appeal received from Bulawayo Civil Works — ZW-PRA-2026-00181", time: "5 hrs ago", type: "warning" },
    { action: "Evaluation report reviewed — Solar Mini-Grids", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "Jan", value: 8 }, { label: "Feb", value: 11 }, { label: "Mar", value: 9 },
    { label: "Apr", value: 13 }, { label: "May", value: 12 }, { label: "Jun", value: 14 },
  ],
  chartTitle: "Awards Issued Per Month", chartLabel1: "Awards",
  aiName: "Adjudication AI",
  aiCapabilities: ["Evaluate bid scoring consistency", "Flag conflict of interest patterns", "Draft award recommendation", "Generate adjudication report"],
  subModules: [
    { label: "Evaluations", route: "/evaluations", icon: "Scale", desc: "Bid evaluation reports" },
    { label: "Awards & Appeals", route: "/awards", icon: "Trophy", desc: "Award decisions" },
    { label: "Tenders Register", route: "/tenders", icon: "FileText", desc: "Active tenders" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "COI & compliance" },
    { label: "Certificates", route: "/certificates", icon: "BookOpen", desc: "Award notices" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Performance data" },
  ],
},

// ── CONTRACT OFFICER ─────────────────────────────────────────────────────────
contract_officer: {
  role: "contract_officer", title: "Contract Officer", subtitle: "Contract Drafting · Execution · Monitoring",
  department: "Contracts Unit", gradientFrom: "#164e63", gradientTo: "#0e7490", accentHex: "#22d3ee",
  kpis: [
    { label: "Contracts Under Management", value: "18", delta: "4 expiring soon", positive: false, color: "blue" },
    { label: "Draft Contracts Pending", value: "5", delta: "Due this week", positive: false, color: "amber" },
    { label: "Contracts On Track", value: "14", delta: "77.8% rate", positive: true, color: "green" },
    { label: "Variation Orders Active", value: "3", delta: "Pending approval", positive: false, color: "red" },
    { label: "Avg Contract Value", value: "USD 8.4M", delta: "Portfolio total USD 151M", positive: true, color: "violet" },
  ],
  quickActions: [
    { label: "Draft Contract", desc: "New contract from template", icon: "FileText", route: "/contracts" },
    { label: "Milestone Update", desc: "Log delivery milestone", icon: "CheckCircle2", route: "/contracts" },
    { label: "Variation Order", desc: "Process scope change", icon: "RefreshCcw", route: "/contracts" },
    { label: "Performance Score", desc: "Rate vendor delivery", icon: "TrendingUp", route: "/performance" },
    { label: "Expiry Alerts", desc: "Contracts due renewal", icon: "Clock", route: "/contracts" },
    { label: "Legal Review", desc: "Clause risk review", icon: "Scale", route: "/governance" },
  ],
  recentActivity: [
    { action: "Contract drafted — CN-2026-0425 Beitbridge Phase 4 USD 88M", time: "1 hr ago", type: "success" },
    { action: "Milestone certified — CN-2026-0411 earthworks 64% complete", time: "3 hrs ago", type: "success" },
    { action: "Variation order VAR-2026-013 pending CPO approval", time: "5 hrs ago", type: "warning" },
    { action: "Vendor performance scorecard issued to Zimbabwe Pharma Holdings", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "On Track", value: 14 }, { label: "At Risk", value: 2 }, { label: "Expiring", value: 4 }, { label: "Completed", value: 8 },
  ],
  chartTitle: "Contract Status Distribution", chartLabel1: "Count",
  aiName: "Contract AI",
  aiCapabilities: ["Draft contract clauses", "Flag non-standard terms", "Monitor milestone adherence", "Predict variation risk"],
  subModules: [
    { label: "Contracts", route: "/contracts", icon: "FileSignature", desc: "All contracts" },
    { label: "Vendor Performance", route: "/performance", icon: "TrendingUp", desc: "KPI scorecards" },
    { label: "Awards Register", route: "/awards", icon: "Trophy", desc: "Awarded tenders" },
    { label: "Finance", route: "/finance", icon: "Wallet", desc: "Payment tracking" },
    { label: "Legal Governance", route: "/governance", icon: "Landmark", desc: "Compliance" },
    { label: "Certificates", route: "/certificates", icon: "BookOpen", desc: "Completion certs" },
  ],
},

// ── AUDIT OFFICER ────────────────────────────────────────────────────────────
audit_officer: {
  role: "audit_officer", title: "Audit Officer", subtitle: "Internal Audit · Transaction Verification · Compliance",
  department: "Internal Audit & Risk Management", gradientFrom: "#422006", gradientTo: "#78350f", accentHex: "#fbbf24",
  kpis: [
    { label: "Audits In Progress", value: "4", delta: "2 fieldwork stage", positive: true, color: "blue" },
    { label: "Findings Raised (YTD)", value: "38", delta: "12 critical", positive: false, color: "red" },
    { label: "Corrective Actions Open", value: "14", delta: "6 overdue", positive: false, color: "amber" },
    { label: "Audit Coverage", value: "72%", delta: "Target: 85%", positive: false, color: "orange" },
    { label: "Audit Opinion", value: "Qualified", delta: "2 depts at risk", positive: false, color: "red" },
  ],
  quickActions: [
    { label: "Open Audit File", desc: "Start new engagement", icon: "Search", route: "/audit" },
    { label: "Log Finding", desc: "Record audit exception", icon: "AlertTriangle", route: "/audit" },
    { label: "Compliance Scan", desc: "Run automated check", icon: "ShieldCheck", route: "/audit" },
    { label: "Transaction Sample", desc: "AI-assisted sampling", icon: "BarChart3", route: "/bi-dashboards" },
    { label: "Verify Documents", desc: "Document authenticity check", icon: "Eye", route: "/audit" },
    { label: "Corrective Actions", desc: "Track remediation progress", icon: "CheckCircle2", route: "/governance" },
  ],
  recentActivity: [
    { action: "Audit finding raised — Finance Dept VAT reconciliation gap USD 84K", time: "2 hrs ago", type: "error" },
    { action: "Compliance scan completed — 94.2% pass rate on 318 transactions", time: "3 hrs ago", type: "success" },
    { action: "Corrective action overdue — Procurement ghost vendor case FRD-2026-089", time: "4 hrs ago", type: "warning" },
    { action: "Annual audit plan updated — 4 high-risk areas added", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "Critical", value: 12 }, { label: "High", value: 14 }, { label: "Medium", value: 8 }, { label: "Low", value: 4 },
  ],
  chartTitle: "Audit Findings by Severity", chartLabel1: "Count",
  aiName: "Audit AI",
  aiCapabilities: ["Analyse 100% of transactions", "Detect fraud signatures", "Auto-classify findings", "Predict non-compliance risk"],
  subModules: [
    { label: "Audit & Compliance", route: "/audit", icon: "ShieldCheck", desc: "Internal audit hub" },
    { label: "Anti-Corruption", route: "/anti-corruption", icon: "AlertOctagon", desc: "Fraud detection" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Audit analytics" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "Control framework" },
    { label: "BI Dashboards", route: "/bi-dashboards", icon: "BarChart3", desc: "Risk intelligence" },
    { label: "Public Records", route: "/utility/public-records", icon: "FileText", desc: "Evidence vault" },
  ],
},

// ── ANTI-CORRUPTION OFFICER ──────────────────────────────────────────────────
anti_corruption_officer: {
  role: "anti_corruption_officer", title: "Anti-Corruption Officer", subtitle: "Fraud Detection · Investigation · ZACC Referrals",
  department: "Anti-Corruption & Integrity Unit", gradientFrom: "#450a0a", gradientTo: "#7f1d1d", accentHex: "#f87171",
  kpis: [
    { label: "Active Investigations", value: "7", delta: "3 new this week", positive: false, color: "red" },
    { label: "Fraud Alerts (MTD)", value: "23", delta: "+5 from AI agents", positive: false, color: "red" },
    { label: "ZACC Referrals", value: "4", delta: "YTD total: 12", positive: true, color: "amber" },
    { label: "Cases Closed (YTD)", value: "18", delta: "USD 2.1M recovered", positive: true, color: "green" },
    { label: "Risk Score Average", value: "High", delta: "3 entities flagged", positive: false, color: "red" },
  ],
  quickActions: [
    { label: "Open Investigation", desc: "New case file", icon: "Search", route: "/anti-corruption" },
    { label: "ZACC Referral", desc: "Submit referral form", icon: "Send", route: "/anti-corruption" },
    { label: "Fraud Alert Review", desc: "AI-flagged anomalies", icon: "AlertTriangle", route: "/anti-corruption" },
    { label: "Asset Tracing", desc: "Track suspicious assets", icon: "Package", route: "/assets" },
    { label: "Vendor Blacklist", desc: "Update debarment register", icon: "XCircle", route: "/vendors" },
    { label: "COI Investigation", desc: "Conflict of interest case", icon: "Eye", route: "/governance" },
  ],
  recentActivity: [
    { action: "Bid rotation pattern detected — 3 vendors, 7 tenders — ZACC referral filed", time: "1 hr ago", type: "error" },
    { action: "Ghost vendor FRD-2026-089 investigation completed — USD 840K recovered", time: "3 hrs ago", type: "success" },
    { action: "AI agent flagged anomalous payment pattern — Transport Dept", time: "4 hrs ago", type: "warning" },
    { action: "Conflict of interest declared — Evaluator P. Chanda recused", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "Jan", value: 5 }, { label: "Feb", value: 8 }, { label: "Mar", value: 6 },
    { label: "Apr", value: 11 }, { label: "May", value: 9 }, { label: "Jun", value: 7 },
  ],
  chartTitle: "Fraud Alerts Detected Per Month", chartLabel1: "Alerts",
  aiName: "Anti-Corruption AI",
  aiCapabilities: ["Detect bid rotation patterns", "Ghost vendor identification", "Payment anomaly detection", "Vendor blacklist screening"],
  subModules: [
    { label: "Anti-Corruption", route: "/anti-corruption", icon: "AlertOctagon", desc: "Case management" },
    { label: "Fraud Detection", route: "/budget/fraud", icon: "ShieldCheck", desc: "AI fraud engine" },
    { label: "Vendor Registry", route: "/vendors", icon: "Building2", desc: "Vendor risk" },
    { label: "Audit Module", route: "/audit", icon: "Search", desc: "Evidence trail" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Risk analytics" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "COI declarations" },
  ],
},

// ── COMPLIANCE OFFICER ───────────────────────────────────────────────────────
compliance_officer: {
  role: "compliance_officer", title: "Compliance Officer", subtitle: "PPDPA Compliance · Regulatory Monitoring · Exceptions",
  department: "Legal & Compliance", gradientFrom: "#431407", gradientTo: "#9a3412", accentHex: "#fb923c",
  kpis: [
    { label: "Compliance Score", value: "94.2%", delta: "+1.8 pts this quarter", positive: true, color: "green" },
    { label: "Open Exceptions", value: "12", delta: "3 critical", positive: false, color: "red" },
    { label: "Regulations Monitored", value: "47", delta: "All current", positive: true, color: "blue" },
    { label: "Training Completions", value: "218/240", delta: "91% compliance staff", positive: true, color: "violet" },
    { label: "Corrective Plans Active", value: "8", delta: "2 overdue", positive: false, color: "amber" },
  ],
  quickActions: [
    { label: "Compliance Scan", desc: "Run automated check", icon: "ShieldCheck", route: "/audit" },
    { label: "Log Exception", desc: "Record non-compliance", icon: "AlertTriangle", route: "/governance" },
    { label: "Policy Register", desc: "Manage PPDPA policies", icon: "BookOpen", route: "/governance" },
    { label: "Training Records", desc: "Staff compliance training", icon: "GraduationCap", route: "/staff-productivity" },
    { label: "Report to Regulator", desc: "PRAZ statutory report", icon: "Send", route: "/utility/communications" },
    { label: "Exception Report", desc: "Generate exception summary", icon: "FileText", route: "/analytics" },
  ],
  recentActivity: [
    { action: "PPDPA quarterly compliance report submitted to PRAZ", time: "2 hrs ago", type: "success" },
    { action: "Exception logged — Sole-source procurement without proper justification", time: "3 hrs ago", type: "warning" },
    { action: "Compliance training completed by 28 procurement officers", time: "Yesterday", type: "success" },
    { action: "Corrective action plan approved — Finance Department exceptions", time: "2 days ago", type: "info" },
  ],
  chartData: [
    { label: "Passed", value: 94 }, { label: "Minor Issues", value: 4 }, { label: "Critical", value: 2 },
  ],
  chartTitle: "Compliance Check Results (%)", chartLabel1: "Percentage",
  aiName: "Compliance AI",
  aiCapabilities: ["Automated PPDPA checks", "Threshold monitoring", "Exception pattern analysis", "Regulatory gap identification"],
  subModules: [
    { label: "Audit & Compliance", route: "/audit", icon: "ShieldCheck", desc: "Compliance hub" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "Policy management" },
    { label: "Corporate Module", route: "/corporate", icon: "Crown", desc: "Department compliance" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Compliance metrics" },
    { label: "Communications", route: "/utility/communications", icon: "MessageSquare", desc: "Regulator liaison" },
    { label: "Public Records", route: "/utility/public-records", icon: "FileText", desc: "Disclosure" },
  ],
},

// ── LEGAL OFFICER ────────────────────────────────────────────────────────────
legal_officer: {
  role: "legal_officer", title: "Legal Officer", subtitle: "Contract Review · Legal Opinions · Dispute Management",
  department: "Legal Services", gradientFrom: "#1c1917", gradientTo: "#292524", accentHex: "#a8a29e",
  kpis: [
    { label: "Legal Matters Open", value: "15", delta: "3 disputes", positive: false, color: "red" },
    { label: "Contracts Reviewed (MTD)", value: "22", delta: "All cleared", positive: true, color: "green" },
    { label: "Legal Opinions Issued", value: "9", delta: "+3 urgent", positive: false, color: "amber" },
    { label: "Litigation Cases", value: "2", delta: "1 in arbitration", positive: false, color: "red" },
    { label: "Avg Review Time", value: "2.4 days", delta: "Target: 3 days", positive: true, color: "blue" },
  ],
  quickActions: [
    { label: "Review Contract", desc: "Legal clause review", icon: "FileText", route: "/contracts" },
    { label: "Legal Opinion", desc: "Draft legal advice", icon: "Scale", route: "/governance" },
    { label: "Dispute File", desc: "Log dispute / litigation", icon: "Gavel", route: "/governance" },
    { label: "Policy Review", desc: "Regulatory compliance check", icon: "BookOpen", route: "/governance" },
    { label: "Compliance Check", desc: "PPDPA legal assessment", icon: "ShieldCheck", route: "/audit" },
    { label: "Legal Report", desc: "Monthly summary", icon: "BarChart3", route: "/analytics" },
  ],
  recentActivity: [
    { action: "Legal opinion issued — Beitbridge contract variation USD 2.4M approved", time: "1 hr ago", type: "success" },
    { action: "Dispute filed by Granite Construction — referred to arbitration", time: "3 hrs ago", type: "warning" },
    { action: "Contract reviewed — ARV Medicines Framework special conditions cleared", time: "4 hrs ago", type: "success" },
    { action: "PPDPA compliance opinion requested by CPO for sole-source exemption", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "Contracts", value: 22 }, { label: "Opinions", value: 9 }, { label: "Disputes", value: 3 }, { label: "Policy", value: 6 },
  ],
  chartTitle: "Legal Work by Category (MTD)", chartLabel1: "Count",
  aiName: "Legal AI",
  aiCapabilities: ["Flag non-standard contract clauses", "Dispute risk assessment", "Legal opinion drafting", "Regulatory compliance checking"],
  subModules: [
    { label: "Contracts", route: "/contracts", icon: "FileSignature", desc: "Contract management" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "Policy & law" },
    { label: "Audit & Compliance", route: "/audit", icon: "ShieldCheck", desc: "Legal compliance" },
    { label: "Tenders", route: "/tenders", icon: "FileText", desc: "Legal reviews" },
    { label: "Communications", route: "/utility/communications", icon: "MessageSquare", desc: "Legal notices" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Legal metrics" },
  ],
},

// ── STORES OFFICER ───────────────────────────────────────────────────────────
stores_officer: {
  role: "stores_officer", title: "Stores Officer", subtitle: "Inventory Control · Stock Management · Goods Receipt",
  department: "Procurement & Supply Chain — Stores", gradientFrom: "#052e16", gradientTo: "#14532d", accentHex: "#4ade80",
  kpis: [
    { label: "Items in Stock", value: "1,284", delta: "Across 8 warehouses", positive: true, color: "blue" },
    { label: "Stock Value", value: "USD 284K", delta: "+12K received today", positive: true, color: "green" },
    { label: "Reorder Alerts", value: "7", delta: "3 critical items", positive: false, color: "red" },
    { label: "GRNs Today", value: "4", delta: "2 pending inspection", positive: true, color: "amber" },
    { label: "Stockout Events (MTD)", value: "2", delta: "ARV stock critical", positive: false, color: "red" },
  ],
  quickActions: [
    { label: "Receive Goods", desc: "Create GRN", icon: "PackageCheck", route: "/inventory/receiving" },
    { label: "Issue Stock", desc: "Process issue request", icon: "Send", route: "/inventory/requests" },
    { label: "Stock Count", desc: "Physical count", icon: "ScanLine", route: "/inventory/stock-count" },
    { label: "Reorder Report", desc: "Items at reorder level", icon: "AlertTriangle", route: "/inventory" },
    { label: "Warehouse Map", desc: "Location & bin view", icon: "Warehouse", route: "/inventory/warehouse" },
    { label: "AI Demand Forecast", desc: "Predicted stock needs", icon: "Sparkles", route: "/inventory/ai-agents" },
  ],
  recentActivity: [
    { action: "GRN-2026-0042 processed — 500 ARV packs received from Zimbabwe Pharma", time: "1 hr ago", type: "success" },
    { action: "Reorder alert triggered — Diesel stock below 8,000L safety level", time: "2 hrs ago", type: "warning" },
    { action: "IRQ-2026-0031 issued — 20 laptops to ICT department", time: "4 hrs ago", type: "info" },
    { action: "Stock count completed — 98.2% accuracy rate", time: "Yesterday", type: "success" },
  ],
  chartData: [
    { label: "Pharmaceuticals", value: 1240 }, { label: "ICT Equipment", value: 18 }, { label: "Office Supplies", value: 124 },
    { label: "Construction", value: 680 }, { label: "Fuel", value: 22400 }, { label: "Medical", value: 845 },
  ],
  chartTitle: "Stock Levels by Category", chartLabel1: "Units",
  aiName: "Inventory AI",
  aiCapabilities: ["Demand forecasting", "Reorder level optimisation", "FIFO rotation enforcement", "Stockout prediction"],
  subModules: [
    { label: "Inventory", route: "/inventory", icon: "Boxes", desc: "Full inventory" },
    { label: "Receiving", route: "/inventory/receiving", icon: "PackageCheck", desc: "GRN processing" },
    { label: "Issue Requests", route: "/inventory/requests", icon: "Send", desc: "Stock issues" },
    { label: "Warehouse", route: "/inventory/warehouse", icon: "Warehouse", desc: "Location map" },
    { label: "Stock Count", route: "/inventory/stock-count", icon: "ScanLine", desc: "Physical counts" },
    { label: "Inventory AI", route: "/inventory/ai-agents", icon: "Sparkles", desc: "AI analytics" },
  ],
},

// ── RECORDS OFFICER ──────────────────────────────────────────────────────────
records_officer: {
  role: "records_officer", title: "Records Officer", subtitle: "Document Management · Archiving · Records Lifecycle",
  department: "Administration & Facilities — Records", gradientFrom: "#1e1b4b", gradientTo: "#3730a3", accentHex: "#818cf8",
  kpis: [
    { label: "Documents Filed (MTD)", value: "842", delta: "+124 vs last month", positive: true, color: "blue" },
    { label: "Pending Classification", value: "38", delta: "Due this week", positive: false, color: "amber" },
    { label: "Archive Requests", value: "12", delta: "6 processed today", positive: true, color: "green" },
    { label: "Retention Review Due", value: "156", delta: "Q2 2026 batch", positive: false, color: "orange" },
    { label: "Access Control Flags", value: "3", delta: "Unauthorised attempts", positive: false, color: "red" },
  ],
  quickActions: [
    { label: "File Document", desc: "Register new document", icon: "FileText", route: "/utility/public-records" },
    { label: "Archive Batch", desc: "Archive closed files", icon: "Archive", route: "/utility/public-records" },
    { label: "Access Log Review", desc: "Who accessed what", icon: "Eye", route: "/audit" },
    { label: "Retention Schedule", desc: "Review disposal dates", icon: "Clock", route: "/governance" },
    { label: "Document Search", desc: "Find any record", icon: "Search", route: "/utility/public-records" },
    { label: "Records Report", desc: "Monthly statistics", icon: "BarChart3", route: "/analytics" },
  ],
  recentActivity: [
    { action: "Tender file ZW-PRA-2026-00184 archived — all 22 documents complete", time: "2 hrs ago", type: "success" },
    { action: "Retention review flagged 156 documents approaching disposal date", time: "3 hrs ago", type: "warning" },
    { action: "Unauthorised access attempt to Cabinet submissions — IT notified", time: "5 hrs ago", type: "error" },
    { action: "Annual archive audit completed — 99.1% accuracy score", time: "Yesterday", type: "success" },
  ],
  chartData: [
    { label: "Jan", value: 640 }, { label: "Feb", value: 718 }, { label: "Mar", value: 692 },
    { label: "Apr", value: 774 }, { label: "May", value: 801 }, { label: "Jun", value: 842 },
  ],
  chartTitle: "Documents Filed Per Month", chartLabel1: "Documents",
  aiName: "Records AI",
  aiCapabilities: ["Auto-classify document types", "Retention date calculation", "Unauthorised access detection", "Archive completeness check"],
  subModules: [
    { label: "Public Records", route: "/utility/public-records", icon: "FileText", desc: "Document vault" },
    { label: "Media Library", route: "/utility/media", icon: "Image", desc: "Media archive" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "Retention policy" },
    { label: "Audit Trail", route: "/audit", icon: "Search", desc: "Access logs" },
    { label: "Announcements", route: "/utility/announcements", icon: "Bell", desc: "Official notices" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Records metrics" },
  ],
},

// ── SYSTEM ADMIN ─────────────────────────────────────────────────────────────
system_admin: {
  role: "system_admin", title: "System Administrator", subtitle: "Platform Configuration · Users · Security · Integration",
  department: "ICT & Digital Transformation", gradientFrom: "#0c0a09", gradientTo: "#1c1917", accentHex: "#a8a29e",
  kpis: [
    { label: "Active Users", value: "1,284", delta: "+18 this week", positive: true, color: "blue" },
    { label: "System Uptime", value: "99.94%", delta: "SLA: 99.5%", positive: true, color: "green" },
    { label: "Security Alerts", value: "7", delta: "2 critical", positive: false, color: "red" },
    { label: "Pending Approvals", value: "23", delta: "User role changes", positive: false, color: "amber" },
    { label: "API Integrations", value: "14", delta: "All healthy", positive: true, color: "violet" },
    { label: "Data Backup Status", value: "Current", delta: "Last: 04:00 today", positive: true, color: "green" },
  ],
  quickActions: [
    { label: "User Management", desc: "Create / modify users", icon: "Users", route: "/roles" },
    { label: "Role Permissions", desc: "Manage access rights", icon: "ShieldCheck", route: "/roles" },
    { label: "System Health", desc: "Server & API status", icon: "Activity", route: "/ai-agents" },
    { label: "Security Log", desc: "Intrusion & access log", icon: "AlertTriangle", route: "/audit" },
    { label: "Org Structure", desc: "Ministry & dept config", icon: "Building2", route: "/organisations" },
    { label: "BI Configuration", desc: "Dashboard settings", icon: "BarChart3", route: "/bi-dashboards" },
  ],
  recentActivity: [
    { action: "24 new user accounts created — Ministry of Finance onboarding", time: "1 hr ago", type: "success" },
    { action: "Security alert — 2 failed login attempts from external IP", time: "2 hrs ago", type: "error" },
    { action: "System backup completed — 2,840 records backed up", time: "4 hrs ago", type: "success" },
    { action: "ZIMRA API integration health check passed", time: "6 hrs ago", type: "success" },
  ],
  chartData: [
    { label: "Jan", value: 1180 }, { label: "Feb", value: 1208 }, { label: "Mar", value: 1231 },
    { label: "Apr", value: 1254 }, { label: "May", value: 1268 }, { label: "Jun", value: 1284 },
  ],
  chartTitle: "Active User Growth", chartLabel1: "Users",
  aiName: "System AI",
  aiCapabilities: ["Automated security scanning", "User behaviour anomaly detection", "System performance optimisation", "Compliance configuration audit"],
  subModules: [
    { label: "Roles & Permissions", route: "/roles", icon: "ShieldCheck", desc: "Access control" },
    { label: "Organisations", route: "/organisations", icon: "Building2", desc: "Org structure" },
    { label: "AI Agents", route: "/ai-agents", icon: "Sparkles", desc: "Agent management" },
    { label: "Audit Logs", route: "/audit", icon: "Search", desc: "System audit trail" },
    { label: "BI Dashboards", route: "/bi-dashboards", icon: "BarChart3", desc: "Analytics config" },
    { label: "Prime Entity", route: "/prime-entity", icon: "Landmark", desc: "Platform admin" },
  ],
},

// ── AI GOVERNANCE OFFICER ────────────────────────────────────────────────────
ai_governance_officer: {
  role: "ai_governance_officer", title: "AI Governance Officer", subtitle: "AI Model Oversight · Explainability · Ethics",
  department: "ICT & Digital — AI Governance", gradientFrom: "#1e1b4b", gradientTo: "#4c1d95", accentHex: "#c084fc",
  kpis: [
    { label: "AI Agents Active", value: "8", delta: "All systems nominal", positive: true, color: "violet" },
    { label: "Avg AI Confidence", value: "92.5%", delta: "+0.8 pts this week", positive: true, color: "green" },
    { label: "Bias Flags Raised", value: "2", delta: "Under investigation", positive: false, color: "red" },
    { label: "Explainability Score", value: "88%", delta: "Target: 90%", positive: false, color: "amber" },
    { label: "Models Under Governance", value: "12", delta: "3 pending review", positive: false, color: "blue" },
  ],
  quickActions: [
    { label: "Agent Monitor", desc: "Real-time agent status", icon: "Activity", route: "/ai-agents" },
    { label: "Explainability Review", desc: "AI decision trails", icon: "Eye", route: "/ai-agents" },
    { label: "Bias Audit", desc: "Fairness assessment", icon: "Scale", route: "/ai-agents" },
    { label: "Threshold Management", desc: "Confidence settings", icon: "Settings", route: "/ai-agents" },
    { label: "AI Performance Report", desc: "Monthly accuracy metrics", icon: "BarChart3", route: "/analytics" },
    { label: "Ethics Policy", desc: "AI governance register", icon: "BookOpen", route: "/governance" },
  ],
  recentActivity: [
    { action: "AI Agent 'Fraud Detection' confidence improved to 89% after retraining", time: "2 hrs ago", type: "success" },
    { action: "Bias flag raised — Award Recommendation AI favouring large vendors", time: "3 hrs ago", type: "warning" },
    { action: "Monthly AI performance report compiled — 8 agents reviewed", time: "Yesterday", type: "info" },
    { action: "Explainability dashboard updated with 420 new decision trails", time: "2 days ago", type: "info" },
  ],
  chartData: [
    { label: "Supplier Verify", value: 96 }, { label: "Fraud Detect", value: 89 }, { label: "Compliance", value: 98 },
    { label: "Evaluation", value: 91 }, { label: "Award Rec", value: 90 }, { label: "Contract Intel", value: 93 },
  ],
  chartTitle: "AI Agent Confidence Scores (%)", chartLabel1: "Confidence %",
  aiName: "Meta AI",
  aiCapabilities: ["AI audit and explainability", "Bias detection algorithms", "Model performance benchmarking", "Governance policy compliance"],
  subModules: [
    { label: "AI Agents", route: "/ai-agents", icon: "Sparkles", desc: "Agent control centre" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "AI performance" },
    { label: "BI Dashboards", route: "/bi-dashboards", icon: "BarChart3", desc: "Intelligence hub" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "AI ethics policy" },
    { label: "Audit", route: "/audit", icon: "ShieldCheck", desc: "AI audit trails" },
    { label: "Budget AI", route: "/budget/ai-agents", icon: "Sparkles", desc: "Finance AI" },
  ],
},

// ── DATA ANALYTICS OFFICER ───────────────────────────────────────────────────
data_analytics_officer: {
  role: "data_analytics_officer", title: "Data Analytics Officer", subtitle: "BI Dashboards · Reporting · Data Intelligence",
  department: "ICT & Digital — Analytics", gradientFrom: "#0f172a", gradientTo: "#1e3a5f", accentHex: "#38bdf8",
  kpis: [
    { label: "Active Dashboards", value: "28", delta: "+4 this month", positive: true, color: "blue" },
    { label: "Reports Generated (MTD)", value: "142", delta: "+18 vs last month", positive: true, color: "green" },
    { label: "Data Sources Connected", value: "14", delta: "All live", positive: true, color: "violet" },
    { label: "Data Quality Score", value: "94.7%", delta: "+0.3 pts", positive: true, color: "cyan" },
    { label: "Pending Data Requests", value: "8", delta: "3 urgent", positive: false, color: "amber" },
  ],
  quickActions: [
    { label: "Open BI Hub", desc: "All dashboards", icon: "BarChart3", route: "/bi-dashboards" },
    { label: "New Report", desc: "Build custom report", icon: "FileText", route: "/analytics" },
    { label: "Data Pipeline", desc: "ETL & integrations", icon: "RefreshCcw", route: "/ai-agents" },
    { label: "Drill-Down Analysis", desc: "Explore any dataset", icon: "Search", route: "/bi-dashboards" },
    { label: "Export Data", desc: "Download datasets", icon: "Download", route: "/analytics" },
    { label: "AI Insights", desc: "AI-generated findings", icon: "Sparkles", route: "/ai-agents" },
  ],
  recentActivity: [
    { action: "Q2 Procurement Analytics Report published — 184 entities covered", time: "2 hrs ago", type: "success" },
    { action: "New dashboard deployed — Budget Execution real-time tracker", time: "4 hrs ago", type: "success" },
    { action: "Data quality anomaly detected in ZIMRA tax dataset — flagged for review", time: "5 hrs ago", type: "warning" },
    { action: "BI drill-down request fulfilled for Audit Officer — 3 datasets", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "Jan", value: 98 }, { label: "Feb", value: 112 }, { label: "Mar", value: 108 },
    { label: "Apr", value: 124 }, { label: "May", value: 131 }, { label: "Jun", value: 142 },
  ],
  chartTitle: "Reports Generated Per Month", chartLabel1: "Reports",
  aiName: "Analytics AI",
  aiCapabilities: ["Automated insight generation", "Anomaly detection in datasets", "Predictive trend analysis", "Natural language report drafting"],
  subModules: [
    { label: "BI Dashboards", route: "/bi-dashboards", icon: "BarChart3", desc: "Intelligence hub" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Procurement analytics" },
    { label: "AI Agents", route: "/ai-agents", icon: "Sparkles", desc: "AI operations" },
    { label: "Staff Productivity", route: "/staff-productivity", icon: "TrendingUp", desc: "Performance data" },
    { label: "Budget Analytics", route: "/budget", icon: "Wallet", desc: "Financial data" },
    { label: "Vendor Performance", route: "/performance", icon: "TrendingUp", desc: "Vendor metrics" },
  ],
},

// ── RISK OFFICER ─────────────────────────────────────────────────────────────
risk_officer: {
  role: "risk_officer", title: "Risk Officer", subtitle: "Enterprise Risk · Risk Register · Mitigation",
  department: "Internal Audit & Risk Management", gradientFrom: "#450a0a", gradientTo: "#991b1b", accentHex: "#fca5a5",
  kpis: [
    { label: "Open Risks", value: "34", delta: "8 critical", positive: false, color: "red" },
    { label: "Risks Mitigated (MTD)", value: "12", delta: "+4 vs last month", positive: true, color: "green" },
    { label: "Avg Risk Score", value: "7.2/10", delta: "High territory", positive: false, color: "red" },
    { label: "Risk Owners Assigned", value: "28/34", delta: "6 unassigned", positive: false, color: "amber" },
    { label: "Risk Appetite Breaches", value: "3", delta: "Board notification sent", positive: false, color: "red" },
  ],
  quickActions: [
    { label: "Add Risk", desc: "Log new enterprise risk", icon: "AlertTriangle", route: "/audit" },
    { label: "Risk Assessment", desc: "Likelihood × impact", icon: "BarChart3", route: "/audit" },
    { label: "Mitigation Plan", desc: "Assign controls", icon: "ShieldCheck", route: "/governance" },
    { label: "Escalate Risk", desc: "Board-level escalation", icon: "Send", route: "/anti-corruption" },
    { label: "Risk Report", desc: "Executive risk summary", icon: "FileText", route: "/analytics" },
    { label: "Business Continuity", desc: "BCP status", icon: "Activity", route: "/governance" },
  ],
  recentActivity: [
    { action: "Critical risk escalated — Water Treatment Plant contractor cash flow", time: "1 hr ago", type: "error" },
    { action: "Risk mitigation confirmed — Bitumen supply risk reduced to Medium", time: "3 hrs ago", type: "success" },
    { action: "Risk appetite breach notified to Board — 3 Critical risks open", time: "5 hrs ago", type: "warning" },
    { action: "Monthly risk register updated — 34 active risks, 12 mitigated", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "Critical", value: 8 }, { label: "High", value: 14 }, { label: "Medium", value: 9 }, { label: "Low", value: 3 },
  ],
  chartTitle: "Enterprise Risk Profile", chartLabel1: "Count",
  aiName: "Risk Intelligence AI",
  aiCapabilities: ["Risk score calculation", "Residual risk modelling", "Emerging risk identification", "Business continuity scenario planning"],
  subModules: [
    { label: "Audit & Risk", route: "/audit", icon: "ShieldCheck", desc: "Risk register" },
    { label: "Anti-Corruption", route: "/anti-corruption", icon: "AlertOctagon", desc: "Fraud risks" },
    { label: "Contracts Risk", route: "/contracts", icon: "FileSignature", desc: "Contract risk" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Risk analytics" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "Control framework" },
    { label: "Projects Risk", route: "/projects/risks", icon: "AlertTriangle", desc: "Project risk" },
  ],
},

// ── ETHICS OFFICER ───────────────────────────────────────────────────────────
ethics_officer: {
  role: "ethics_officer", title: "Ethics Officer", subtitle: "COI Declarations · Whistleblowing · Ethics Governance",
  department: "Legal & Compliance — Ethics Unit", gradientFrom: "#1a1a2e", gradientTo: "#16213e", accentHex: "#7c3aed",
  kpis: [
    { label: "COI Declarations Submitted", value: "218/240", delta: "22 outstanding", positive: false, color: "amber" },
    { label: "Whistleblower Reports", value: "6", delta: "3 under review", positive: false, color: "red" },
    { label: "Ethics Training Completed", value: "91%", delta: "+4% this quarter", positive: true, color: "green" },
    { label: "Disciplinary Cases Open", value: "4", delta: "1 pending hearing", positive: false, color: "red" },
    { label: "Ethics Policy Compliance", value: "96.2%", delta: "+0.8 pts", positive: true, color: "violet" },
  ],
  quickActions: [
    { label: "COI Register", desc: "Manage declarations", icon: "Scale", route: "/governance" },
    { label: "Whistleblower Portal", desc: "Anonymous reports", icon: "Eye", route: "/anti-corruption" },
    { label: "Ethics Training", desc: "Staff training records", icon: "BookOpen", route: "/staff-productivity" },
    { label: "Disciplinary Case", desc: "Open new case", icon: "AlertTriangle", route: "/governance" },
    { label: "Ethics Report", desc: "Monthly summary", icon: "FileText", route: "/analytics" },
    { label: "Policy Update", desc: "Ethics policy register", icon: "ShieldCheck", route: "/governance" },
  ],
  recentActivity: [
    { action: "COI declaration flagged — Evaluator relationship with Highveld Engineering", time: "2 hrs ago", type: "warning" },
    { action: "Ethics training session completed — 48 procurement officers certified", time: "4 hrs ago", type: "success" },
    { action: "Anonymous whistleblower report received — procurement irregularity", time: "5 hrs ago", type: "warning" },
    { action: "Disciplinary hearing scheduled — Case DISC-2026-008", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "Submitted", value: 218 }, { label: "Outstanding", value: 22 }, { label: "Flagged", value: 4 },
  ],
  chartTitle: "COI Declaration Status", chartLabel1: "Count",
  aiName: "Ethics AI",
  aiCapabilities: ["COI pattern detection", "Whistleblower report analysis", "Ethics risk scoring", "Policy compliance checking"],
  subModules: [
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "Ethics framework" },
    { label: "Anti-Corruption", route: "/anti-corruption", icon: "AlertOctagon", desc: "Fraud & ethics" },
    { label: "Audit", route: "/audit", icon: "ShieldCheck", desc: "Compliance audit" },
    { label: "Staff Records", route: "/staff-productivity", icon: "Users", desc: "Training records" },
    { label: "Communications", route: "/utility/communications", icon: "MessageSquare", desc: "Ethics notices" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Ethics metrics" },
  ],
},

// ── QA OFFICER ───────────────────────────────────────────────────────────────
qa_officer: {
  role: "qa_officer", title: "Quality Assurance Officer", subtitle: "Standards · Inspections · Non-Conformances",
  department: "Operations — Quality Assurance", gradientFrom: "#0c4a6e", gradientTo: "#0369a1", accentHex: "#7dd3fc",
  kpis: [
    { label: "Inspections (MTD)", value: "34", delta: "+8 vs last month", positive: true, color: "blue" },
    { label: "Pass Rate", value: "91.2%", delta: "Target: 95%", positive: false, color: "amber" },
    { label: "NCRs Open", value: "7", delta: "2 critical", positive: false, color: "red" },
    { label: "Quality Score Avg", value: "4.1/5", delta: "+0.2 pts", positive: true, color: "green" },
    { label: "Test Certificates Issued", value: "28", delta: "All current", positive: true, color: "cyan" },
  ],
  quickActions: [
    { label: "Log Inspection", desc: "Record delivery inspection", icon: "CheckCircle2", route: "/performance" },
    { label: "Raise NCR", desc: "Non-conformance report", icon: "AlertTriangle", route: "/contracts" },
    { label: "Quality Scorecard", desc: "Vendor quality rating", icon: "Star", route: "/performance" },
    { label: "Test Certificates", desc: "Manage certifications", icon: "Award", route: "/certificates" },
    { label: "Checklists", desc: "QA inspection forms", icon: "ClipboardList", route: "/governance" },
    { label: "Quality Report", desc: "Monthly performance", icon: "BarChart3", route: "/analytics" },
  ],
  recentActivity: [
    { action: "Inspection passed — Highveld Engineering delivery batch 12 — 4.6/5 quality", time: "1 hr ago", type: "success" },
    { action: "NCR raised — Cement bags failed moisture test — 15 bags rejected", time: "3 hrs ago", type: "warning" },
    { action: "Test certificate issued — Zimbabwe Pharma Holdings ARV batch", time: "4 hrs ago", type: "success" },
    { action: "Quality review meeting with Sable ICT Solutions — 3 open NCRs resolved", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "Passed", value: 31 }, { label: "Minor NCR", value: 5 }, { label: "Critical NCR", value: 2 }, { label: "Rejected", value: 2 },
  ],
  chartTitle: "Inspection Results Distribution", chartLabel1: "Count",
  aiName: "QA Intelligence AI",
  aiCapabilities: ["Defect pattern recognition", "Quality trend prediction", "NCR root cause analysis", "Vendor quality benchmarking"],
  subModules: [
    { label: "Vendor Performance", route: "/performance", icon: "TrendingUp", desc: "Quality scorecards" },
    { label: "Contracts", route: "/contracts", icon: "FileSignature", desc: "Contract quality" },
    { label: "Certificates", route: "/certificates", icon: "Award", desc: "QA certificates" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "QA standards" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Quality metrics" },
    { label: "Inventory", route: "/inventory", icon: "Boxes", desc: "Goods quality" },
  ],
},

// ── INSPECTION OFFICER ───────────────────────────────────────────────────────
inspection_officer: {
  role: "inspection_officer", title: "Inspection Officer", subtitle: "Delivery Inspection · GRN Certification · Site Visits",
  department: "Operations — Inspections", gradientFrom: "#083344", gradientTo: "#0e7490", accentHex: "#22d3ee",
  kpis: [
    { label: "Inspections Today", value: "6", delta: "2 site visits", positive: true, color: "blue" },
    { label: "GRNs Certified", value: "18", delta: "This week", positive: true, color: "green" },
    { label: "Rejected Deliveries", value: "3", delta: "Returns in process", positive: false, color: "red" },
    { label: "Inspection Backlog", value: "4", delta: "Due tomorrow", positive: false, color: "amber" },
    { label: "Quantity Accuracy", value: "98.6%", delta: "vs PO quantities", positive: true, color: "cyan" },
  ],
  quickActions: [
    { label: "Certify Delivery", desc: "Issue acceptance GRN", icon: "CheckCircle2", route: "/inventory/receiving" },
    { label: "Reject Delivery", desc: "Document rejection", icon: "XCircle", route: "/inventory/receiving" },
    { label: "Site Visit Report", desc: "On-site inspection", icon: "MapPin", route: "/contracts" },
    { label: "Photo Evidence", desc: "Upload inspection photos", icon: "Image", route: "/utility/media" },
    { label: "Defect Trends", desc: "Vendor defect analysis", icon: "TrendingUp", route: "/performance" },
    { label: "Inspection Schedule", desc: "Upcoming deliveries", icon: "Calendar", route: "/inventory" },
  ],
  recentActivity: [
    { action: "GRN-2026-0044 certified — Caterpillar 320 spare parts — full delivery", time: "1 hr ago", type: "success" },
    { action: "Delivery rejected — Cement batch 22 — moisture damage — 180 bags", time: "2 hrs ago", type: "error" },
    { action: "Site visit completed — Beitbridge Highway Section 4 — 38% progress confirmed", time: "4 hrs ago", type: "info" },
    { action: "Defect trend alert — Sable ICT Solutions — 3 consecutive failed deliveries", time: "Yesterday", type: "warning" },
  ],
  chartData: [
    { label: "Mon", value: 8 }, { label: "Tue", value: 6 }, { label: "Wed", value: 9 },
    { label: "Thu", value: 7 }, { label: "Fri", value: 6 }, { label: "Sat", value: 2 },
  ],
  chartTitle: "Daily Inspections This Week", chartLabel1: "Inspections",
  aiName: "Inspection AI",
  aiCapabilities: ["Delivery quantity verification", "Photo defect detection", "GRN auto-population", "Vendor defect pattern analysis"],
  subModules: [
    { label: "Inventory Receiving", route: "/inventory/receiving", icon: "PackageCheck", desc: "GRN processing" },
    { label: "Contracts", route: "/contracts", icon: "FileSignature", desc: "Delivery specs" },
    { label: "Vendor Performance", route: "/performance", icon: "TrendingUp", desc: "Quality history" },
    { label: "Media Library", route: "/utility/media", icon: "Image", desc: "Photo evidence" },
    { label: "Inventory", route: "/inventory", icon: "Boxes", desc: "Stock records" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Inspection metrics" },
  ],
},

// ── ASSET MANAGER ────────────────────────────────────────────────────────────
asset_manager: {
  role: "asset_manager", title: "Asset Manager", subtitle: "Government Asset Register · Lifecycle · Disposal",
  department: "Finance & Administration — Asset Management", gradientFrom: "#14532d", gradientTo: "#166534", accentHex: "#4ade80",
  kpis: [
    { label: "Registered Assets", value: "8,420", delta: "+124 this quarter", positive: true, color: "blue" },
    { label: "Total Asset Value", value: "USD 284M", delta: "Book value", positive: true, color: "green" },
    { label: "Assets Under Maintenance", value: "38", delta: "12 critical", positive: false, color: "amber" },
    { label: "Disposal Queue", value: "14", delta: "Awaiting approval", positive: false, color: "orange" },
    { label: "Asset Verification Done", value: "84%", delta: "Annual target: 100%", positive: false, color: "red" },
  ],
  quickActions: [
    { label: "Register Asset", desc: "New asset capture", icon: "Plus", route: "/assets" },
    { label: "Work Order", desc: "Create maintenance WO", icon: "Wrench", route: "/assets/maintenance" },
    { label: "Transfer Asset", desc: "Inter-dept transfer", icon: "ArrowRight", route: "/assets" },
    { label: "Disposal Request", desc: "Initiate disposal", icon: "Trash2", route: "/assets/disposal" },
    { label: "Asset Verification", desc: "Physical verification", icon: "Search", route: "/assets" },
    { label: "Valuation Report", desc: "Current asset values", icon: "DollarSign", route: "/assets/financials" },
  ],
  recentActivity: [
    { action: "Asset transfer approved — Toyota Land Cruiser VDJ200 to Ministry of Health", time: "2 hrs ago", type: "success" },
    { action: "Work order WO-2026-0001 — Caterpillar excavator hydraulic repair in progress", time: "3 hrs ago", type: "info" },
    { action: "14 assets flagged for disposal — end of useful life confirmed", time: "4 hrs ago", type: "warning" },
    { action: "Annual asset verification — 7,065/8,420 assets verified to date", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "Active", value: 7820 }, { label: "Maintenance", value: 38 }, { label: "Idle", value: 414 },
    { label: "Disposal Queue", value: 14 }, { label: "Transferred", value: 134 },
  ],
  chartTitle: "Asset Status Distribution", chartLabel1: "Count",
  aiName: "Asset Intelligence AI",
  aiCapabilities: ["Remaining useful life prediction", "Maintenance cost optimisation", "Disposal timing recommendations", "Asset utilisation analysis"],
  subModules: [
    { label: "Asset Register", route: "/assets", icon: "Package", desc: "Full register" },
    { label: "Maintenance", route: "/assets/maintenance", icon: "Wrench", desc: "Work orders" },
    { label: "Financials", route: "/assets/financials", icon: "DollarSign", desc: "Valuation" },
    { label: "Disposal", route: "/assets/disposal", icon: "Trash2", desc: "Disposal process" },
    { label: "Inventory", route: "/inventory", icon: "Boxes", desc: "Stock & assets" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Asset analytics" },
  ],
},

// ── BUDGET OFFICER ───────────────────────────────────────────────────────────
budget_officer: {
  role: "budget_officer", title: "Budget Officer", subtitle: "Budget Control · Commitments · Expenditure Monitoring",
  department: "Finance & Accounting — Budget", gradientFrom: "#052e16", gradientTo: "#064e3b", accentHex: "#34d399",
  kpis: [
    { label: "Budget Available", value: "USD 184M", delta: "67.8% utilized", positive: true, color: "green" },
    { label: "Commitments", value: "USD 124M", delta: "Active POs & contracts", positive: true, color: "blue" },
    { label: "Expenditure YTD", value: "USD 84.2M", delta: "On track vs plan", positive: true, color: "green" },
    { label: "Overrun Alerts", value: "3", delta: "Finance dept flagged", positive: false, color: "red" },
    { label: "Pending Approvals", value: "11", delta: "Commitment requests", positive: false, color: "amber" },
  ],
  quickActions: [
    { label: "Commitment Control", desc: "Approve/reject requests", icon: "CheckCircle2", route: "/budget/commitments" },
    { label: "Budget Execution", desc: "Real-time spend view", icon: "TrendingUp", route: "/budget/execution" },
    { label: "Expenditure Review", desc: "Line-by-line analysis", icon: "DollarSign", route: "/budget/expenditure" },
    { label: "Virement Request", desc: "Budget reallocation", icon: "RefreshCcw", route: "/budget/formulation" },
    { label: "Revenue Tracking", desc: "Income collections", icon: "PiggyBank", route: "/budget/revenue" },
    { label: "Fraud Detection", desc: "AI anomaly check", icon: "AlertTriangle", route: "/budget/fraud" },
  ],
  recentActivity: [
    { action: "Commitment approved — Procurement Dept USD 14.8M Solar Mini-Grids", time: "1 hr ago", type: "success" },
    { action: "Budget overrun alert — Transport Dept Q2 expenditure +USD 1.2M", time: "2 hrs ago", type: "warning" },
    { action: "Virement approved — USD 2M from Admin to ICT digital transformation", time: "4 hrs ago", type: "info" },
    { action: "Revenue collection exceeded target by 8% — USD 42M YTD", time: "Yesterday", type: "success" },
  ],
  chartData: [
    { label: "Jan", value: 12.4, value2: 11.8 }, { label: "Feb", value: 14.2, value2: 13.9 },
    { label: "Mar", value: 13.8, value2: 14.2 }, { label: "Apr", value: 15.6, value2: 15.1 },
    { label: "May", value: 14.9, value2: 15.8 }, { label: "Jun", value: 13.3, value2: 14.2 },
  ],
  chartTitle: "Budget Plan vs Actual (USD M)", chartLabel1: "Plan", chartLabel2: "Actual",
  aiName: "Budget AI",
  aiCapabilities: ["Year-end outturn forecasting", "Idle commitment identification", "Expenditure anomaly detection", "Revenue collection prediction"],
  subModules: [
    { label: "Budget Centre", route: "/budget", icon: "Wallet", desc: "Command centre" },
    { label: "Commitments", route: "/budget/commitments", icon: "FileSignature", desc: "PO commitments" },
    { label: "Execution", route: "/budget/execution", icon: "TrendingUp", desc: "Real-time spend" },
    { label: "Expenditure", route: "/budget/expenditure", icon: "DollarSign", desc: "Line items" },
    { label: "Revenue", route: "/budget/revenue", icon: "PiggyBank", desc: "Income tracking" },
    { label: "Fraud Detection", route: "/budget/fraud", icon: "AlertTriangle", desc: "AI fraud engine" },
  ],
},

// ── TREASURY OFFICER ─────────────────────────────────────────────────────────
treasury_officer: {
  role: "treasury_officer", title: "Treasury Officer", subtitle: "Payment Authorisation · Cash Management · EFT Processing",
  department: "Finance & Accounting — Treasury", gradientFrom: "#064e3b", gradientTo: "#065f46", accentHex: "#6ee7b7",
  kpis: [
    { label: "Payments Processed Today", value: "USD 4.2M", delta: "18 transactions", positive: true, color: "green" },
    { label: "Pending EFT Batches", value: "3", delta: "USD 12.8M total", positive: false, color: "amber" },
    { label: "Cash Position", value: "USD 28.4M", delta: "Operating accounts", positive: true, color: "blue" },
    { label: "WHT Due ZIMRA", value: "USD 840K", delta: "Due 25th this month", positive: false, color: "red" },
    { label: "Reconciliation Status", value: "Current", delta: "Last: today 06:00", positive: true, color: "green" },
  ],
  quickActions: [
    { label: "Release EFT Batch", desc: "Authorise payment batch", icon: "Send", route: "/budget/treasury" },
    { label: "Cash Position", desc: "Current balances", icon: "Wallet", route: "/budget/treasury" },
    { label: "ZIMRA WHT", desc: "Withholding tax payment", icon: "DollarSign", route: "/finance" },
    { label: "Bank Reconciliation", desc: "Match bank to IFMIS", icon: "RefreshCcw", route: "/budget/treasury" },
    { label: "Payment Query", desc: "Supplier payment status", icon: "Search", route: "/finance" },
    { label: "Cash Flow Forecast", desc: "30-day projection", icon: "TrendingUp", route: "/analytics" },
  ],
  recentActivity: [
    { action: "EFT batch processed — 18 suppliers — USD 4.2M — all transfers confirmed", time: "2 hrs ago", type: "success" },
    { action: "WHT remittance due in 3 days — USD 840K to ZIMRA", time: "3 hrs ago", type: "warning" },
    { action: "Bank reconciliation completed — zero unreconciled items", time: "4 hrs ago", type: "success" },
    { action: "Cash flow forecast updated — 30-day liquidity position adequate", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "Mon", value: 3.8 }, { label: "Tue", value: 5.2 }, { label: "Wed", value: 4.4 },
    { label: "Thu", value: 6.1 }, { label: "Fri", value: 4.2 }, { label: "Mon", value: 3.1 },
  ],
  chartTitle: "Daily Payment Volumes (USD M)", chartLabel1: "USD M",
  aiName: "Treasury AI",
  aiCapabilities: ["Cash flow forecasting", "Anomalous payment detection", "WHT calculation and filing", "Bank reconciliation automation"],
  subModules: [
    { label: "Treasury & Cash", route: "/budget/treasury", icon: "Landmark", desc: "Cash management" },
    { label: "Finance", route: "/finance", icon: "Wallet", desc: "Payment processing" },
    { label: "Revenue", route: "/budget/revenue", icon: "PiggyBank", desc: "Collections" },
    { label: "Expenditure", route: "/budget/expenditure", icon: "DollarSign", desc: "Spending track" },
    { label: "Fraud Detection", route: "/budget/fraud", icon: "AlertTriangle", desc: "Payment fraud" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Cash analytics" },
  ],
},

// ── PROJECT MANAGER ──────────────────────────────────────────────────────────
project_manager: {
  role: "project_manager", title: "Project Manager", subtitle: "Contract Delivery · Milestones · Risk · Resources",
  department: "Project Management Office", gradientFrom: "#0c2340", gradientTo: "#1e3a5f", accentHex: "#60a5fa",
  kpis: [
    { label: "Active Projects", value: "8", delta: "2 at risk", positive: false, color: "blue" },
    { label: "On-Time Delivery", value: "75%", delta: "6/8 on schedule", positive: false, color: "amber" },
    { label: "Budget Utilization", value: "68%", delta: "Within plan", positive: true, color: "green" },
    { label: "Open Risks", value: "12", delta: "4 critical", positive: false, color: "red" },
    { label: "Milestone Completion", value: "84%", delta: "YTD average", positive: true, color: "violet" },
  ],
  quickActions: [
    { label: "PM Control Tower", desc: "All projects overview", icon: "LayoutDashboard", route: "/projects" },
    { label: "Update Milestone", desc: "Log progress", icon: "CheckCircle2", route: "/projects/planning" },
    { label: "Risk Log", desc: "New risk entry", icon: "AlertTriangle", route: "/projects/risks" },
    { label: "Gantt Chart", desc: "Schedule view", icon: "BarChart3", route: "/projects/schedule" },
    { label: "Cost Report", desc: "Budget vs actual", icon: "DollarSign", route: "/projects/costs" },
    { label: "Resource Plan", desc: "Team allocation", icon: "Users", route: "/projects/resources" },
  ],
  recentActivity: [
    { action: "Milestone certified — NHIS UAT Sign-off 65% complete — on track", time: "1 hr ago", type: "success" },
    { action: "Risk escalated — Water Treatment Plant M&E installation critically delayed", time: "2 hrs ago", type: "error" },
    { action: "Project cost report updated — Beitbridge Highway CPI 0.96", time: "4 hrs ago", type: "info" },
    { action: "Resource conflict resolved — 3 engineers reallocated from Pfumvudza", time: "Yesterday", type: "success" },
  ],
  chartData: [
    { label: "On Track", value: 5 }, { label: "At Risk", value: 2 }, { label: "Delayed", value: 1 }, { label: "Completed", value: 4 },
  ],
  chartTitle: "Project Status Distribution", chartLabel1: "Projects",
  aiName: "PM AI Tower",
  aiCapabilities: ["Schedule delay prediction", "Cost overrun forecasting", "Resource optimisation", "Risk correlation analysis"],
  subModules: [
    { label: "PM Tower", route: "/projects", icon: "LayoutDashboard", desc: "All projects" },
    { label: "Portfolio", route: "/projects/portfolio", icon: "Briefcase", desc: "Project portfolio" },
    { label: "Schedule", route: "/projects/schedule", icon: "BarChart3", desc: "Gantt chart" },
    { label: "Cost & Finance", route: "/projects/costs", icon: "DollarSign", desc: "Budget tracking" },
    { label: "Risks", route: "/projects/risks", icon: "AlertTriangle", desc: "Risk register" },
    { label: "Resources", route: "/projects/resources", icon: "Users", desc: "Team management" },
  ],
},

// ── PLANNING OFFICER ─────────────────────────────────────────────────────────
planning_officer: {
  role: "planning_officer", title: "Planning Officer", subtitle: "Demand Planning · Procurement Plans · Forecasting",
  department: "Procurement — Planning Unit", gradientFrom: "#2e1065", gradientTo: "#4c1d95", accentHex: "#a78bfa",
  kpis: [
    { label: "Procurement Plans Active", value: "12", delta: "Q3 2026 cycle", positive: true, color: "violet" },
    { label: "Demand Requests (MTD)", value: "84", delta: "+12 this week", positive: true, color: "blue" },
    { label: "Plans Approved", value: "9/12", delta: "3 pending approval", positive: false, color: "amber" },
    { label: "Budget Coverage", value: "94%", delta: "Plans with budget", positive: true, color: "green" },
    { label: "Forecast Accuracy", value: "88%", delta: "Q2 actuals vs plan", positive: true, color: "cyan" },
  ],
  quickActions: [
    { label: "New Demand Request", desc: "Raise requisition", icon: "Plus", route: "/planning" },
    { label: "Annual Procurement Plan", desc: "View / update plan", icon: "ClipboardList", route: "/planning" },
    { label: "Budget Alignment", desc: "Match plans to budget", icon: "Wallet", route: "/budget" },
    { label: "Tender Calendar", desc: "Upcoming tenders", icon: "Calendar", route: "/tenders" },
    { label: "Market Research", desc: "Price benchmarking", icon: "Search", route: "/analytics" },
    { label: "Forecast Report", desc: "Demand projections", icon: "TrendingUp", route: "/analytics" },
  ],
  recentActivity: [
    { action: "Q3 2026 Annual Procurement Plan finalised — 84 items, USD 42M", time: "2 hrs ago", type: "success" },
    { action: "Demand request DR-2026-0842 approved — Medical supplies USD 1.2M", time: "3 hrs ago", type: "success" },
    { action: "3 procurement plans awaiting Finance budget confirmation", time: "4 hrs ago", type: "warning" },
    { action: "Market survey completed — ICT equipment — 3 suppliers benchmarked", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "Infrastructure", value: 18 }, { label: "Health", value: 14 }, { label: "ICT", value: 9 },
    { label: "Agriculture", value: 11 }, { label: "Education", value: 7 }, { label: "Admin", value: 5 },
  ],
  chartTitle: "Procurement Plans by Sector", chartLabel1: "Plans",
  aiName: "Planning AI",
  aiCapabilities: ["Demand forecasting", "Budget-plan alignment", "Market price benchmarking", "Procurement calendar optimisation"],
  subModules: [
    { label: "Planning & Demand", route: "/planning", icon: "ClipboardList", desc: "Annual plans" },
    { label: "Tenders Register", route: "/tenders", icon: "FileText", desc: "Tender pipeline" },
    { label: "Budget", route: "/budget", icon: "Wallet", desc: "Budget alignment" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Demand analytics" },
    { label: "Vendor Registry", route: "/vendors", icon: "Building2", desc: "Supplier market" },
    { label: "Catalogue", route: "/utility", icon: "BookOpen", desc: "Item catalogue" },
  ],
},

// ── COMMUNICATIONS OFFICER ───────────────────────────────────────────────────
communications_officer: {
  role: "communications_officer", title: "Communications Officer", subtitle: "Publications · Media · Stakeholder Engagement",
  department: "Communications & Public Relations", gradientFrom: "#1e1b4b", gradientTo: "#312e81", accentHex: "#818cf8",
  kpis: [
    { label: "Tender Notices Published", value: "28", delta: "This month", positive: true, color: "blue" },
    { label: "Media Queries (MTD)", value: "14", delta: "6 pending response", positive: false, color: "amber" },
    { label: "Stakeholder Engagements", value: "9", delta: "+3 scheduled", positive: true, color: "green" },
    { label: "Social Media Reach", value: "48K", delta: "+12% this week", positive: true, color: "violet" },
    { label: "Award Notices Issued", value: "12", delta: "All published", positive: true, color: "cyan" },
  ],
  quickActions: [
    { label: "Publish Tender Notice", desc: "Portal & newspaper", icon: "Globe", route: "/utility/gazette" },
    { label: "Award Notice", desc: "Publish contract award", icon: "Trophy", route: "/utility/announcements" },
    { label: "Media Release", desc: "Draft press release", icon: "Newspaper", route: "/utility/communications" },
    { label: "Stakeholder Update", desc: "Send stakeholder brief", icon: "Send", route: "/utility/communications" },
    { label: "Social Media", desc: "Post update", icon: "MessageSquare", route: "/utility/media" },
    { label: "Media Library", desc: "Photos, videos, docs", icon: "Image", route: "/utility/media" },
  ],
  recentActivity: [
    { action: "Tender notice published — ZW-PRA-2026-00184 Solar Mini-Grids in Herald", time: "1 hr ago", type: "success" },
    { action: "Media query response sent — ARV procurement process explanation", time: "3 hrs ago", type: "info" },
    { action: "Award notice issued — Beitbridge Highway Section 4 — Highveld Engineering", time: "4 hrs ago", type: "success" },
    { action: "Stakeholder engagement meeting scheduled — Q3 procurement updates", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "Tender Notices", value: 28 }, { label: "Award Notices", value: 12 }, { label: "Media Releases", value: 8 },
    { label: "Stakeholder Briefs", value: 9 }, { label: "Gazette Entries", value: 16 },
  ],
  chartTitle: "Communications Output (MTD)", chartLabel1: "Count",
  aiName: "Comms AI",
  aiCapabilities: ["Auto-draft tender notices", "Media monitoring", "Stakeholder communication tracking", "Publication schedule management"],
  subModules: [
    { label: "Communications", route: "/utility/communications", icon: "MessageSquare", desc: "Comms hub" },
    { label: "Government Gazette", route: "/utility/gazette", icon: "Newspaper", desc: "Official gazette" },
    { label: "Announcements", route: "/utility/announcements", icon: "Bell", desc: "Official notices" },
    { label: "Media Library", route: "/utility/media", icon: "Image", desc: "Media assets" },
    { label: "Public Records", route: "/utility/public-records", icon: "FileText", desc: "Transparency" },
    { label: "Portal", route: "/portal", icon: "Globe", desc: "Public portal" },
  ],
},

// ── PERFORMANCE OFFICER ──────────────────────────────────────────────────────
performance_officer: {
  role: "performance_officer", title: "Performance Officer", subtitle: "KPIs · Vendor Scorecards · Staff Performance",
  department: "Strategy, Policy & Planning — Performance", gradientFrom: "#0a2540", gradientTo: "#1a4480", accentHex: "#60a5fa",
  kpis: [
    { label: "Vendors Scored (MTD)", value: "42", delta: "Quarterly reviews", positive: true, color: "blue" },
    { label: "Avg Vendor Score", value: "4.2/5", delta: "+0.2 pts", positive: true, color: "green" },
    { label: "Staff KPIs Met", value: "84%", delta: "Target: 90%", positive: false, color: "amber" },
    { label: "Below-Threshold Vendors", value: "6", delta: "Improvement notices", positive: false, color: "red" },
    { label: "Performance Reports Due", value: "4", delta: "By end of week", positive: false, color: "orange" },
  ],
  quickActions: [
    { label: "Score Vendor", desc: "Quarterly scorecard", icon: "Star", route: "/performance" },
    { label: "Staff KPI Review", desc: "Employee assessment", icon: "Users", route: "/staff-productivity" },
    { label: "Improvement Notice", desc: "Issue to vendor", icon: "AlertTriangle", route: "/performance" },
    { label: "Department Report", desc: "Performance by dept", icon: "BarChart3", route: "/department-activities" },
    { label: "KPI Dashboard", desc: "Live metrics view", icon: "TrendingUp", route: "/analytics" },
    { label: "Benchmarking", desc: "Compare vs peers", icon: "Target", route: "/bi-dashboards" },
  ],
  recentActivity: [
    { action: "Quarterly scorecard issued to Highveld Engineering — 4.5/5 overall", time: "2 hrs ago", type: "success" },
    { action: "Improvement notice issued to Bulawayo Civil Works — 3.3/5 below threshold", time: "3 hrs ago", type: "warning" },
    { action: "Staff KPI review completed — Finance Department 88% average", time: "4 hrs ago", type: "info" },
    { action: "Performance dashboard updated with Q2 actuals", time: "Yesterday", type: "success" },
  ],
  chartData: [
    { label: "Highveld Eng", value: 4.5 }, { label: "Zim Pharma", value: 4.7 }, { label: "Sable ICT", value: 4.0 },
    { label: "Masho Agri", value: 4.5 }, { label: "Bulawayo Civil", value: 3.3 }, { label: "Eastern Highlands", value: 4.1 },
  ],
  chartTitle: "Vendor Performance Scores", chartLabel1: "Score /5",
  aiName: "Performance AI",
  aiCapabilities: ["Automated KPI scoring", "Performance trend prediction", "Vendor risk from score data", "Staff performance benchmarking"],
  subModules: [
    { label: "Vendor Performance", route: "/performance", icon: "TrendingUp", desc: "Vendor KPIs" },
    { label: "Staff Productivity", route: "/staff-productivity", icon: "Users", desc: "HR performance" },
    { label: "Department Activities", route: "/department-activities", icon: "Building2", desc: "Dept metrics" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Performance data" },
    { label: "BI Dashboards", route: "/bi-dashboards", icon: "BarChart3", desc: "Intelligence" },
    { label: "Contracts", route: "/contracts", icon: "FileSignature", desc: "Contract KPIs" },
  ],
},

// ── IT OFFICER ───────────────────────────────────────────────────────────────
it_officer: {
  role: "it_officer", title: "IT Officer", subtitle: "System Support · Integration · Digital Services",
  department: "ICT & Digital Transformation", gradientFrom: "#0f172a", gradientTo: "#1e293b", accentHex: "#38bdf8",
  kpis: [
    { label: "Open Support Tickets", value: "24", delta: "8 urgent", positive: false, color: "amber" },
    { label: "System Uptime", value: "99.94%", delta: "SLA 99.5% — OK", positive: true, color: "green" },
    { label: "Tickets Resolved Today", value: "12", delta: "Avg 45 min MTTR", positive: true, color: "blue" },
    { label: "Security Incidents", value: "2", delta: "Both contained", positive: false, color: "red" },
    { label: "Users Supported", value: "1,284", delta: "All ministries", positive: true, color: "violet" },
  ],
  quickActions: [
    { label: "New Ticket", desc: "Log support request", icon: "Plus", route: "/teams" },
    { label: "System Status", desc: "All services health", icon: "Activity", route: "/ai-agents" },
    { label: "User Account", desc: "Create/modify user", icon: "User", route: "/roles" },
    { label: "Security Alert", desc: "Investigate incident", icon: "AlertTriangle", route: "/audit" },
    { label: "API Status", desc: "Integration health", icon: "RefreshCcw", route: "/ai-agents" },
    { label: "System Report", desc: "Monthly IT report", icon: "FileText", route: "/analytics" },
  ],
  recentActivity: [
    { action: "ZIMRA API integration restored after 12-minute outage", time: "1 hr ago", type: "success" },
    { action: "Security incident — brute force attempt blocked — IP blacklisted", time: "2 hrs ago", type: "error" },
    { action: "12 support tickets resolved — average resolution time 45 minutes", time: "4 hrs ago", type: "success" },
    { action: "System backup completed — all 2,840 records secure", time: "6 hrs ago", type: "info" },
  ],
  chartData: [
    { label: "Mon", value: 18 }, { label: "Tue", value: 24 }, { label: "Wed", value: 21 },
    { label: "Thu", value: 16 }, { label: "Fri", value: 14 }, { label: "Sat", value: 4 },
  ],
  chartTitle: "Support Tickets Per Day", chartLabel1: "Tickets",
  aiName: "ICT AI",
  aiCapabilities: ["Automated ticket routing", "System anomaly detection", "Security threat analysis", "Integration health monitoring"],
  subModules: [
    { label: "AI Agents", route: "/ai-agents", icon: "Sparkles", desc: "System intelligence" },
    { label: "Roles & Permissions", route: "/roles", icon: "ShieldCheck", desc: "Access control" },
    { label: "Organisations", route: "/organisations", icon: "Building2", desc: "Org structure" },
    { label: "Audit Logs", route: "/audit", icon: "Search", desc: "System audit" },
    { label: "BI Dashboards", route: "/bi-dashboards", icon: "BarChart3", desc: "Analytics" },
    { label: "Prime Entity", route: "/prime-entity", icon: "Landmark", desc: "Platform admin" },
  ],
},

// ── LOGISTICS OFFICER ────────────────────────────────────────────────────────
logistics_officer: {
  role: "logistics_officer", title: "Logistics Officer", subtitle: "Delivery Coordination · Fleet Management · Warehousing",
  department: "Procurement & Supply Chain — Logistics", gradientFrom: "#0c4a6e", gradientTo: "#075985", accentHex: "#38bdf8",
  kpis: [
    { label: "Deliveries In Transit", value: "14", delta: "3 delayed", positive: false, color: "amber" },
    { label: "On-Time Delivery Rate", value: "78.6%", delta: "Target: 90%", positive: false, color: "red" },
    { label: "Fleet Vehicles Active", value: "42/48", delta: "6 in maintenance", positive: true, color: "blue" },
    { label: "Dispatches Today", value: "8", delta: "USD 1.4M goods value", positive: true, color: "green" },
    { label: "Warehouse Capacity", value: "74%", delta: "3 warehouses", positive: true, color: "violet" },
  ],
  quickActions: [
    { label: "Track Deliveries", desc: "In-transit shipments", icon: "Package", route: "/inventory/receiving" },
    { label: "Dispatch Request", desc: "Plan outbound delivery", icon: "Send", route: "/inventory/requests" },
    { label: "Fleet Status", desc: "Vehicle availability", icon: "TruckIcon", route: "/assets" },
    { label: "Warehouse Map", desc: "Storage locations", icon: "Warehouse", route: "/inventory/warehouse" },
    { label: "Delivery Issue", desc: "Log delay / damage", icon: "AlertTriangle", route: "/inventory" },
    { label: "Logistics Report", desc: "Monthly performance", icon: "BarChart3", route: "/analytics" },
  ],
  recentActivity: [
    { action: "Delivery confirmed — ARV batch 14 received at Bindura clinic", time: "1 hr ago", type: "success" },
    { action: "Delay alert — Cement delivery to Beitbridge site — road closure", time: "2 hrs ago", type: "warning" },
    { action: "Fleet vehicle ZW-4821-AH dispatched to Masvingo Hospital", time: "3 hrs ago", type: "info" },
    { action: "Warehouse capacity alert — Mashonaland Agri Depot at 91%", time: "Yesterday", type: "warning" },
  ],
  chartData: [
    { label: "On Time", value: 11 }, { label: "Delayed", value: 3 }, { label: "Pending", value: 4 }, { label: "Completed", value: 28 },
  ],
  chartTitle: "Delivery Status (Month to Date)", chartLabel1: "Count",
  aiName: "Logistics AI",
  aiCapabilities: ["Route optimisation", "Delivery delay prediction", "Fleet maintenance scheduling", "Warehouse space optimisation"],
  subModules: [
    { label: "Inventory", route: "/inventory", icon: "Boxes", desc: "Stock management" },
    { label: "Receiving", route: "/inventory/receiving", icon: "PackageCheck", desc: "Inbound goods" },
    { label: "Issue Requests", route: "/inventory/requests", icon: "Send", desc: "Outbound orders" },
    { label: "Warehouse", route: "/inventory/warehouse", icon: "Warehouse", desc: "Storage view" },
    { label: "Asset Fleet", route: "/assets", icon: "Package", desc: "Fleet management" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Logistics metrics" },
  ],
},

// ── HEALTH & SAFETY OFFICER ──────────────────────────────────────────────────
health_safety_officer: {
  role: "health_safety_officer", title: "Health & Safety Officer", subtitle: "HSE Compliance · Site Safety · Incident Management",
  department: "Operations — Health, Safety & Environment", gradientFrom: "#450a0a", gradientTo: "#7f1d1d", accentHex: "#fca5a5",
  kpis: [
    { label: "Active Site Inspections", value: "8", delta: "3 due this week", positive: false, color: "amber" },
    { label: "Incidents Reported (MTD)", value: "4", delta: "0 fatalities", positive: true, color: "green" },
    { label: "HSE Plans Approved", value: "12", delta: "All contracts active", positive: true, color: "blue" },
    { label: "Lost Time Injury Rate", value: "0.8", delta: "Target: <1.0", positive: true, color: "green" },
    { label: "Compliance Rate", value: "94%", delta: "+2% this quarter", positive: true, color: "violet" },
  ],
  quickActions: [
    { label: "Log Incident", desc: "Record workplace incident", icon: "AlertTriangle", route: "/contracts" },
    { label: "Site Audit", desc: "Safety inspection form", icon: "ClipboardList", route: "/governance" },
    { label: "Review HSE Plan", desc: "Contractor submission", icon: "ShieldCheck", route: "/contracts" },
    { label: "Incident Statistics", desc: "Frequency & severity", icon: "BarChart3", route: "/analytics" },
    { label: "Safety Training", desc: "Staff safety records", icon: "BookOpen", route: "/staff-productivity" },
    { label: "HSE Report", desc: "Monthly summary", icon: "FileText", route: "/analytics" },
  ],
  recentActivity: [
    { action: "HSE plan approved — Beitbridge Highway Phase 4 contractor submission", time: "2 hrs ago", type: "success" },
    { action: "Minor injury reported — Water Treatment Plant — worker medical leave 3 days", time: "3 hrs ago", type: "warning" },
    { action: "Site safety audit completed — Solar Mini-Grids Bindura — 96% compliance", time: "4 hrs ago", type: "success" },
    { action: "Emergency drill completed — 4 District Hospitals construction site", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "Jan", value: 2 }, { label: "Feb", value: 1 }, { label: "Mar", value: 3 },
    { label: "Apr", value: 1 }, { label: "May", value: 2 }, { label: "Jun", value: 4 },
  ],
  chartTitle: "Incidents Reported Per Month", chartLabel1: "Incidents",
  aiName: "HSE AI",
  aiCapabilities: ["Incident pattern analysis", "Safety risk prediction", "HSE compliance scoring", "Contractor safety ranking"],
  subModules: [
    { label: "Contracts", route: "/contracts", icon: "FileSignature", desc: "HSE requirements" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "Safety standards" },
    { label: "Staff Records", route: "/staff-productivity", icon: "Users", desc: "Safety training" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "HSE metrics" },
    { label: "Projects", route: "/projects/quality", icon: "CheckCircle2", desc: "Site quality" },
    { label: "Vendor Performance", route: "/performance", icon: "TrendingUp", desc: "HSE scores" },
  ],
},

// ── ENVIRONMENT OFFICER ──────────────────────────────────────────────────────
environment_officer: {
  role: "environment_officer", title: "Environment Officer", subtitle: "EIA Review · Green Procurement · Environmental Compliance",
  department: "Operations — Environment Unit", gradientFrom: "#052e16", gradientTo: "#14532d", accentHex: "#86efac",
  kpis: [
    { label: "EIAs Under Review", value: "6", delta: "2 awaiting sign-off", positive: false, color: "amber" },
    { label: "Green Procurement Score", value: "78%", delta: "+5% this quarter", positive: true, color: "green" },
    { label: "Carbon Footprint (QTD)", value: "2,840 tCO2", delta: "-8% vs last quarter", positive: true, color: "blue" },
    { label: "Environmental Conditions", value: "14", delta: "Attached to contracts", positive: true, color: "violet" },
    { label: "Compliance Breaches", value: "1", delta: "Under investigation", positive: false, color: "red" },
  ],
  quickActions: [
    { label: "Review EIA", desc: "Environmental assessment", icon: "Leaf", route: "/contracts" },
    { label: "Green Score", desc: "Rate procurement activity", icon: "Star", route: "/analytics" },
    { label: "Carbon Calculator", desc: "Estimate CO2 footprint", icon: "BarChart3", route: "/analytics" },
    { label: "Attach Conditions", desc: "Environmental conditions", icon: "FileText", route: "/contracts" },
    { label: "Monitor Compliance", desc: "Site monitoring", icon: "Eye", route: "/governance" },
    { label: "Green Report", desc: "Quarterly summary", icon: "TrendingUp", route: "/analytics" },
  ],
  recentActivity: [
    { action: "EIA approved — Beitbridge Highway Phase 4 — Limpopo River crossing", time: "2 hrs ago", type: "success" },
    { action: "Environmental breach reported — Caterpillar excavator oil spill — Beitbridge", time: "3 hrs ago", type: "error" },
    { action: "Green procurement score updated — 78% for Q2 2026", time: "4 hrs ago", type: "info" },
    { action: "Environmental conditions attached to Water Treatment Plant contract", time: "Yesterday", type: "success" },
  ],
  chartData: [
    { label: "Q1 2025", value: 3120 }, { label: "Q2 2025", value: 2980 }, { label: "Q3 2025", value: 3240 },
    { label: "Q4 2025", value: 2940 }, { label: "Q1 2026", value: 3080 }, { label: "Q2 2026", value: 2840 },
  ],
  chartTitle: "Carbon Footprint (tCO2 per Quarter)", chartLabel1: "tCO2",
  aiName: "Environment AI",
  aiCapabilities: ["EIA risk assessment", "Carbon footprint calculation", "Green procurement scoring", "Environmental compliance monitoring"],
  subModules: [
    { label: "Contracts", route: "/contracts", icon: "FileSignature", desc: "Environmental conditions" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "Environmental policy" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Environmental metrics" },
    { label: "Vendor Performance", route: "/performance", icon: "TrendingUp", desc: "Green scores" },
    { label: "Projects Quality", route: "/projects/quality", icon: "CheckCircle2", desc: "Site compliance" },
    { label: "Public Records", route: "/utility/public-records", icon: "FileText", desc: "EIA disclosures" },
  ],
},

// ── EXECUTIVE DIRECTOR / BOARD MEMBER ───────────────────────────────────────
executive_director: {
  role: "executive_director", title: "Executive Director", subtitle: "Entity Oversight · Governance · Strategic Approval",
  department: "Executive Office", gradientFrom: "#1e293b", gradientTo: "#334155", accentHex: "#94a3b8",
  kpis: [
    { label: "Entity Budget", value: "USD 84M", delta: "68% utilized", positive: true, color: "blue" },
    { label: "Active Tenders", value: "12", delta: "3 above threshold", positive: true, color: "green" },
    { label: "Contracts Portfolio", value: "USD 420M", delta: "18 active", positive: true, color: "violet" },
    { label: "Compliance Standing", value: "94.2%", delta: "PRAZ rating: Good", positive: true, color: "green" },
    { label: "Pending Approvals", value: "6", delta: "High-value tenders", positive: false, color: "amber" },
  ],
  quickActions: [
    { label: "Entity Dashboard", desc: "Full overview", icon: "LayoutDashboard", route: "/prime-entity" },
    { label: "Approve Tenders", desc: "High-value sign-off", icon: "CheckCircle2", route: "/tenders" },
    { label: "Contract Portfolio", desc: "All active contracts", icon: "FileSignature", route: "/contracts" },
    { label: "Financial Summary", desc: "Budget utilization", icon: "DollarSign", route: "/finance" },
    { label: "Compliance Report", desc: "PRAZ standing", icon: "ShieldCheck", route: "/audit" },
    { label: "Strategic Overview", desc: "KPIs & targets", icon: "Target", route: "/analytics" },
  ],
  recentActivity: [
    { action: "High-value tender approved — Solar Mini-Grids USD 14.8M", time: "2 hrs ago", type: "success" },
    { action: "Q2 entity performance report reviewed — 94.2% compliance", time: "3 hrs ago", type: "success" },
    { action: "Board meeting scheduled — agenda circulated to all directors", time: "4 hrs ago", type: "info" },
    { action: "Contract CN-2026-0404 flagged at risk — review required", time: "Yesterday", type: "warning" },
  ],
  chartData: [
    { label: "Q1 2025", value: 78 }, { label: "Q2 2025", value: 82 }, { label: "Q3 2025", value: 85 },
    { label: "Q4 2025", value: 88 }, { label: "Q1 2026", value: 91 }, { label: "Q2 2026", value: 94 },
  ],
  chartTitle: "Entity Compliance Trend (%)", chartLabel1: "Compliance %",
  aiName: "Executive AI",
  aiCapabilities: ["Strategic performance briefing", "Budget utilization analysis", "Risk portfolio overview", "Board report generation"],
  subModules: [
    { label: "Prime Entity", route: "/prime-entity", icon: "Landmark", desc: "Full oversight" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "KPI dashboard" },
    { label: "Contracts", route: "/contracts", icon: "FileSignature", desc: "Contract portfolio" },
    { label: "Finance", route: "/finance", icon: "Wallet", desc: "Financial overview" },
    { label: "Audit", route: "/audit", icon: "ShieldCheck", desc: "Compliance status" },
    { label: "Corporate", route: "/corporate", icon: "Crown", desc: "Corporate module" },
  ],
},

board_member: {
  role: "board_member", title: "Board Member", subtitle: "Governance Oversight · Policy Approval · Accountability",
  department: "Board of Directors", gradientFrom: "#111827", gradientTo: "#1f2937", accentHex: "#9ca3af",
  kpis: [
    { label: "Board Resolutions (YTD)", value: "28", delta: "All documented", positive: true, color: "blue" },
    { label: "Agenda Items Pending", value: "6", delta: "Next meeting 3 days", positive: false, color: "amber" },
    { label: "Financial Oversight", value: "USD 84M", delta: "Entity budget", positive: true, color: "green" },
    { label: "Audit Committee Items", value: "3", delta: "For board review", positive: false, color: "red" },
  ],
  quickActions: [
    { label: "Board Pack", desc: "Meeting documents", icon: "FileText", route: "/analytics" },
    { label: "Financial Statements", desc: "Annual financials", icon: "DollarSign", route: "/finance" },
    { label: "Audit Report", desc: "Internal audit findings", icon: "ShieldCheck", route: "/audit" },
    { label: "Resolutions Register", desc: "Board decisions", icon: "BookOpen", route: "/governance" },
    { label: "Entity Performance", desc: "KPI dashboard", icon: "TrendingUp", route: "/analytics" },
    { label: "Risk Overview", desc: "Enterprise risks", icon: "AlertTriangle", route: "/audit" },
  ],
  recentActivity: [
    { action: "Board resolution passed — Annual budget USD 84M approved", time: "3 hrs ago", type: "success" },
    { action: "Audit committee report reviewed — 3 critical findings", time: "4 hrs ago", type: "warning" },
    { action: "Board pack circulated — Q2 2026 performance review", time: "Yesterday", type: "info" },
    { action: "Annual report signed — FY2025 financial statements approved", time: "3 days ago", type: "success" },
  ],
  chartData: [
    { label: "Governance", value: 94 }, { label: "Financial", value: 88 }, { label: "Risk", value: 82 }, { label: "Compliance", value: 91 },
  ],
  chartTitle: "Board Oversight Scores (%)", chartLabel1: "Score %",
  aiName: "Board AI",
  aiCapabilities: ["Board pack summarisation", "Governance gap analysis", "Risk portfolio reporting", "Regulatory compliance briefing"],
  subModules: [
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Performance data" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "Policy register" },
    { label: "Finance", route: "/finance", icon: "Wallet", desc: "Financials" },
    { label: "Audit", route: "/audit", icon: "ShieldCheck", desc: "Audit reports" },
    { label: "Corporate", route: "/corporate", icon: "Crown", desc: "Corporate module" },
    { label: "Prime Entity", route: "/prime-entity", icon: "Landmark", desc: "Entity overview" },
  ],
},

// ── REGULATOR / PUBLIC AUDITOR / CITIZEN / END USER ─────────────────────────
regulator: {
  role: "regulator", title: "Regulator — PRAZ", subtitle: "National Procurement Regulation · Policy Enforcement",
  department: "Procurement Regulatory Authority (PRAZ)", gradientFrom: "#1e1b4b", gradientTo: "#312e81", accentHex: "#818cf8",
  kpis: [
    { label: "Entities Monitored", value: "184", delta: "All government", positive: true, color: "blue" },
    { label: "Compliance Rate Avg", value: "87.4%", delta: "+2.1 pts YTD", positive: true, color: "green" },
    { label: "Investigations Open", value: "8", delta: "3 critical entities", positive: false, color: "red" },
    { label: "Debarments Active", value: "12", delta: "5 new this quarter", positive: false, color: "amber" },
    { label: "Regulatory Reports", value: "4", delta: "Q2 cycle due", positive: false, color: "orange" },
  ],
  quickActions: [
    { label: "National Compliance", desc: "All entities overview", icon: "ShieldCheck", route: "/analytics" },
    { label: "Investigation", desc: "Open investigation file", icon: "Search", route: "/anti-corruption" },
    { label: "Suspension Order", desc: "Vendor debarment", icon: "AlertTriangle", route: "/vendors" },
    { label: "Regulatory Report", desc: "National statistics", icon: "BarChart3", route: "/analytics" },
    { label: "Policy Update", desc: "PPDPA amendments", icon: "BookOpen", route: "/governance" },
    { label: "Market Intelligence", desc: "Price benchmarking", icon: "TrendingUp", route: "/bi-dashboards" },
  ],
  recentActivity: [
    { action: "Compliance audit completed — 184 entities — 87.4% average", time: "2 hrs ago", type: "success" },
    { action: "Vendor suspension issued — Granite Construction — bid rigging", time: "3 hrs ago", type: "warning" },
    { action: "PPDPA regulatory report Q2 2026 published", time: "Yesterday", type: "info" },
    { action: "Investigation opened — ghost vendor payments Ministry of Transport", time: "2 days ago", type: "error" },
  ],
  chartData: [
    { label: "Fully Compliant", value: 142 }, { label: "Minor Issues", value: 28 }, { label: "Non-Compliant", value: 14 },
  ],
  chartTitle: "Entity Compliance Status (184 Entities)", chartLabel1: "Count",
  aiName: "Regulatory AI",
  aiCapabilities: ["National compliance monitoring", "Entity risk ranking", "Market price benchmarking", "Policy gap detection"],
  subModules: [
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "National statistics" },
    { label: "Anti-Corruption", route: "/anti-corruption", icon: "AlertOctagon", desc: "Fraud monitoring" },
    { label: "Vendor Registry", route: "/vendors", icon: "Building2", desc: "Debarment register" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "Policy management" },
    { label: "BI Dashboards", route: "/bi-dashboards", icon: "BarChart3", desc: "Intelligence" },
    { label: "Public Records", route: "/utility/public-records", icon: "FileText", desc: "Transparency" },
  ],
},

public_auditor: {
  role: "public_auditor", title: "Public Auditor", subtitle: "External Audit · Accountability · Public Transparency",
  department: "Office of the Auditor-General", gradientFrom: "#1c1917", gradientTo: "#292524", accentHex: "#d6d3d1",
  kpis: [
    { label: "Entities Under Audit", value: "42", delta: "Annual cycle", positive: true, color: "blue" },
    { label: "Qualified Opinions", value: "8", delta: "Parliament notified", positive: false, color: "red" },
    { label: "Value of Findings", value: "USD 84M", delta: "Irregular expenditure", positive: false, color: "red" },
    { label: "Clean Opinions", value: "28", delta: "66.7% clean", positive: true, color: "green" },
  ],
  quickActions: [
    { label: "Audit Trail", desc: "Transaction logs", icon: "Search", route: "/audit" },
    { label: "Compliance Check", desc: "Statutory compliance", icon: "ShieldCheck", route: "/audit" },
    { label: "Evidence Pack", desc: "Download audit files", icon: "Archive", route: "/utility/public-records" },
    { label: "Public Records", desc: "Transparency portal", icon: "Globe", route: "/utility/public-records" },
    { label: "Statistical Report", desc: "National audit statistics", icon: "BarChart3", route: "/analytics" },
    { label: "Parliament Report", desc: "Tabled reports", icon: "FileText", route: "/analytics" },
  ],
  recentActivity: [
    { action: "Ministry of Transport audit completed — Qualified opinion issued", time: "3 hrs ago", type: "warning" },
    { action: "Irregular expenditure of USD 84M referred to Parliament", time: "Yesterday", type: "error" },
    { action: "Ministry of Health audit — clean opinion — USD 42M ARV contract", time: "2 days ago", type: "success" },
  ],
  chartData: [
    { label: "Clean", value: 28 }, { label: "Qualified", value: 8 }, { label: "Adverse", value: 2 }, { label: "Disclaimer", value: 4 },
  ],
  chartTitle: "Audit Opinion Distribution", chartLabel1: "Count",
  aiName: "External Audit AI",
  aiCapabilities: ["Transaction verification", "Irregular expenditure detection", "Audit opinion risk assessment", "Parliament report drafting"],
  subModules: [
    { label: "Audit Module", route: "/audit", icon: "ShieldCheck", desc: "Audit hub" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Audit statistics" },
    { label: "Public Records", route: "/utility/public-records", icon: "FileText", desc: "Public access" },
    { label: "Anti-Corruption", route: "/anti-corruption", icon: "AlertOctagon", desc: "Fraud cases" },
    { label: "BI Dashboards", route: "/bi-dashboards", icon: "BarChart3", desc: "Data intelligence" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "Standards" },
  ],
},

end_user: {
  role: "end_user", title: "End User / Requisitioner", subtitle: "Raise Requisitions · Track Requests · Receive Goods",
  department: "User Department", gradientFrom: "#0c2340", gradientTo: "#1e3a5f", accentHex: "#93c5fd",
  kpis: [
    { label: "My Open Requisitions", value: "4", delta: "2 approved", positive: true, color: "blue" },
    { label: "Items Delivered (MTD)", value: "12", delta: "All accepted", positive: true, color: "green" },
    { label: "Pending Deliveries", value: "2", delta: "Expected next week", positive: false, color: "amber" },
    { label: "My Budget Allocation", value: "USD 28K", delta: "USD 12K remaining", positive: true, color: "violet" },
  ],
  quickActions: [
    { label: "Raise Requisition", desc: "New purchase request", icon: "Plus", route: "/planning" },
    { label: "Track My Requests", desc: "Requisition status", icon: "Search", route: "/planning" },
    { label: "View Catalogue", desc: "Available items", icon: "BookOpen", route: "/utility" },
    { label: "My Deliveries", desc: "Goods received", icon: "PackageCheck", route: "/inventory/receiving" },
    { label: "Budget Status", desc: "My allocation", icon: "Wallet", route: "/budget" },
    { label: "Submit Feedback", desc: "Service rating", icon: "Star", route: "/teams" },
  ],
  recentActivity: [
    { action: "Requisition REQ-2026-0284 approved — 5 laptops ICT dept", time: "2 hrs ago", type: "success" },
    { action: "Delivery received — office stationery 20 boxes — GRN issued", time: "3 hrs ago", type: "success" },
    { action: "Requisition REQ-2026-0281 pending budget confirmation", time: "Yesterday", type: "warning" },
  ],
  chartData: [
    { label: "Pending", value: 2 }, { label: "Approved", value: 2 }, { label: "Delivered", value: 12 }, { label: "Rejected", value: 1 },
  ],
  chartTitle: "My Requisition Status", chartLabel1: "Count",
  aiName: "User Assistant AI",
  aiCapabilities: ["Smart item recommendations", "Budget balance checking", "Delivery tracking", "Supplier lead time prediction"],
  subModules: [
    { label: "Planning & Demand", route: "/planning", icon: "ClipboardList", desc: "My requisitions" },
    { label: "Inventory", route: "/inventory", icon: "Boxes", desc: "Stock availability" },
    { label: "Catalogue", route: "/utility", icon: "BookOpen", desc: "Items catalogue" },
    { label: "Teams", route: "/teams", icon: "Users", desc: "My workspace" },
    { label: "Budget", route: "/budget", icon: "Wallet", desc: "My budget" },
    { label: "Tenders", route: "/tenders", icon: "FileText", desc: "View tenders" },
  ],
},

citizen: {
  role: "citizen", title: "Citizen Observer", subtitle: "Public Transparency · Open Data · Feedback Portal",
  department: "Public Access", gradientFrom: "#0f4c81", gradientTo: "#1a6b9e", accentHex: "#93c5fd",
  kpis: [
    { label: "Published Tenders", value: "1,287", delta: "Open for viewing", positive: true, color: "blue" },
    { label: "Contract Awards", value: "842", delta: "Public record", positive: true, color: "green" },
    { label: "Feedback Submitted", value: "3", delta: "My contributions", positive: true, color: "violet" },
    { label: "Total Spend Public", value: "USD 2.84B", delta: "This fiscal year", positive: true, color: "cyan" },
  ],
  quickActions: [
    { label: "Browse Tenders", desc: "View published tenders", icon: "FileText", route: "/portal" },
    { label: "Search Awards", desc: "Contract award records", icon: "Search", route: "/portal" },
    { label: "Submit Feedback", desc: "Public comment", icon: "MessageSquare", route: "/teams" },
    { label: "Spending Data", desc: "Public procurement data", icon: "BarChart3", route: "/analytics" },
    { label: "Gazette", desc: "Official publications", icon: "Newspaper", route: "/utility/gazette" },
    { label: "Public Records", desc: "Open documents", icon: "FileText", route: "/utility/public-records" },
  ],
  recentActivity: [
    { action: "Viewed tender ZW-PRA-2026-00184 — Solar Mini-Grids", time: "1 hr ago", type: "info" },
    { action: "Feedback submitted on Beitbridge Highway procurement process", time: "Yesterday", type: "info" },
    { action: "Award notice viewed — ARV Medicines Framework USD 42.5M", time: "3 days ago", type: "info" },
  ],
  chartData: [
    { label: "Infrastructure", value: 38 }, { label: "Health", value: 22 }, { label: "ICT", value: 14 },
    { label: "Agriculture", value: 11 }, { label: "Education", value: 9 }, { label: "Other", value: 6 },
  ],
  chartTitle: "Government Spend by Sector (%)", chartLabel1: "Percentage",
  aiName: "Transparency AI",
  aiCapabilities: ["Procurement data summarisation", "Spend analysis by sector", "Public interest flagging", "Open data export"],
  subModules: [
    { label: "Supplier Portal", route: "/portal", icon: "Globe", desc: "Public portal" },
    { label: "Tenders", route: "/tenders", icon: "FileText", desc: "Published tenders" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Spending data" },
    { label: "Gazette", route: "/utility/gazette", icon: "Newspaper", desc: "Official notices" },
    { label: "Public Records", route: "/utility/public-records", icon: "FileText", desc: "Open records" },
    { label: "Announcements", route: "/utility/announcements", icon: "Bell", desc: "Notices" },
  ],
},

procurement_director: {
  role: "procurement_director", title: "Procurement Director", subtitle: "Procurement Division Leadership · Policy · Oversight",
  department: "Procurement & Supply Chain", gradientFrom: "#1c1917", gradientTo: "#292524", accentHex: "#fbbf24",
  kpis: [
    { label: "Active Tenders", value: "42", delta: "+8 this month", positive: true, color: "amber" },
    { label: "Procurement Value (MTD)", value: "USD 28.4M", delta: "+12% vs plan", positive: true, color: "green" },
    { label: "Compliance Score", value: "94.2%", delta: "PRAZ certified", positive: true, color: "blue" },
    { label: "Staff Under Direction", value: "28", delta: "All roles active", positive: true, color: "violet" },
    { label: "Pending Approvals", value: "14", delta: "8 high value", positive: false, color: "red" },
  ],
  quickActions: [
    { label: "Lifecycle Tower", desc: "Full procurement overview", icon: "BarChart3", route: "/lifecycle" },
    { label: "Approve Tenders", desc: "Director-level sign-off", icon: "CheckCircle2", route: "/tenders" },
    { label: "Team Performance", desc: "Procurement staff KPIs", icon: "TrendingUp", route: "/staff-productivity" },
    { label: "Policy Register", desc: "Procurement policies", icon: "BookOpen", route: "/governance" },
    { label: "Analytics Hub", desc: "Procurement intelligence", icon: "BarChart3", route: "/analytics" },
    { label: "Vendor Oversight", desc: "Vendor registry", icon: "Building2", route: "/vendors" },
  ],
  recentActivity: [
    { action: "Approved tender ZW-PRA-2026-00181 — Beitbridge Highway USD 88M", time: "1 hr ago", type: "success" },
    { action: "Procurement plan Q3 2026 approved — USD 42M pipeline", time: "2 hrs ago", type: "success" },
    { action: "Compliance report reviewed — 94.2% — submitted to PRAZ", time: "3 hrs ago", type: "info" },
    { action: "Team meeting held — 28 officers briefed on new PPDPA thresholds", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "Jan", value: 18.4 }, { label: "Feb", value: 22.1 }, { label: "Mar", value: 19.8 },
    { label: "Apr", value: 24.6 }, { label: "May", value: 26.2 }, { label: "Jun", value: 28.4 },
  ],
  chartTitle: "Procurement Value per Month (USD M)", chartLabel1: "USD M",
  aiName: "Procurement Director AI",
  aiCapabilities: ["Portfolio overview briefing", "Policy compliance monitoring", "Team performance analysis", "Market intelligence reports"],
  subModules: [
    { label: "Lifecycle Tower", route: "/lifecycle", icon: "BarChart3", desc: "Full lifecycle" },
    { label: "Tenders", route: "/tenders", icon: "FileText", desc: "Tender register" },
    { label: "Vendor Registry", route: "/vendors", icon: "Building2", desc: "Vendor management" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Intelligence hub" },
    { label: "Contracts", route: "/contracts", icon: "FileSignature", desc: "Contract portfolio" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "Policy & compliance" },
  ],
},

gender_officer: {
  role: "gender_officer", title: "Gender & Inclusion Officer", subtitle: "Gender Equity · Inclusive Procurement · Social Impact",
  department: "Human Resources — Inclusion Unit", gradientFrom: "#4a044e", gradientTo: "#701a75", accentHex: "#f0abfc",
  kpis: [
    { label: "Women-Led Vendor Contracts", value: "18%", delta: "Target: 30%", positive: false, color: "pink" },
    { label: "Gender Audits Completed", value: "6", delta: "This quarter", positive: true, color: "violet" },
    { label: "Inclusive Policies Active", value: "12", delta: "All departments", positive: true, color: "blue" },
    { label: "Gender Training Sessions", value: "24", delta: "+4 this quarter", positive: true, color: "green" },
  ],
  quickActions: [
    { label: "Gender Audit", desc: "Procurement gender analysis", icon: "Users", route: "/analytics" },
    { label: "Women Vendors", desc: "Women-led supplier list", icon: "Star", route: "/vendors" },
    { label: "Policy Review", desc: "Inclusion policies", icon: "BookOpen", route: "/governance" },
    { label: "Training Records", desc: "Gender training log", icon: "BookOpen", route: "/staff-productivity" },
    { label: "Impact Report", desc: "Social impact metrics", icon: "TrendingUp", route: "/analytics" },
    { label: "Stakeholder Brief", desc: "Gender inclusion update", icon: "Send", route: "/utility/communications" },
  ],
  recentActivity: [
    { action: "Gender audit completed — women-led contracts increased to 18%", time: "2 hrs ago", type: "info" },
    { action: "Gender training session completed — 24 procurement officers", time: "4 hrs ago", type: "success" },
    { action: "Inclusive procurement policy updated — women SME threshold revised", time: "Yesterday", type: "info" },
  ],
  chartData: [
    { label: "Q1 2025", value: 14 }, { label: "Q2 2025", value: 15 }, { label: "Q3 2025", value: 16 },
    { label: "Q4 2025", value: 17 }, { label: "Q1 2026", value: 18 }, { label: "Q2 2026", value: 18 },
  ],
  chartTitle: "Women-Led Vendor Contracts (%)", chartLabel1: "Percentage",
  aiName: "Inclusion AI",
  aiCapabilities: ["Vendor diversity analysis", "Gender gap identification", "Inclusive policy recommendations", "Impact measurement"],
  subModules: [
    { label: "Vendor Registry", route: "/vendors", icon: "Building2", desc: "Vendor diversity" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Inclusion metrics" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "Inclusion policies" },
    { label: "Staff Productivity", route: "/staff-productivity", icon: "Users", desc: "HR training" },
    { label: "Communications", route: "/utility/communications", icon: "MessageSquare", desc: "Stakeholder briefs" },
    { label: "Planning", route: "/planning", icon: "ClipboardList", desc: "Inclusive plans" },
  ],
},

// ── DEFAULT FALLBACK ─────────────────────────────────────────────────────────
}; // end CONFIGS

const DEFAULT_CONFIG: RoleDashboardConfig = {
  role: "default", title: "My Dashboard", subtitle: "Role-Based Management Dashboard",
  department: "Government of Zimbabwe", gradientFrom: "#1e293b", gradientTo: "#334155", accentHex: "#94a3b8",
  kpis: [
    { label: "My Tasks", value: "8", delta: "3 pending", positive: false, color: "blue" },
    { label: "Reports Due", value: "2", delta: "This week", positive: false, color: "amber" },
    { label: "Performance", value: "88%", delta: "+3 pts", positive: true, color: "green" },
    { label: "CPD Hours", value: "24", delta: "of 40 target", positive: false, color: "violet" },
  ],
  quickActions: [
    { label: "My Workspace", desc: "Tasks and work items", icon: "LayoutDashboard", route: "/teams" },
    { label: "Corporate Module", desc: "Department overview", icon: "Crown", route: "/corporate" },
    { label: "Analytics", desc: "View dashboards", icon: "BarChart3", route: "/analytics" },
    { label: "Communications", desc: "Messages & email", icon: "MessageSquare", route: "/teams" },
    { label: "Governance", desc: "Policies & compliance", icon: "ShieldCheck", route: "/governance" },
    { label: "AI Assistant", desc: "Get AI help", icon: "Sparkles", route: "/ai-agents" },
  ],
  recentActivity: [
    { action: "Dashboard loaded successfully", time: "Just now", type: "success" },
    { action: "Welcome to the AI Powered Electronic Public Procurement and Oversight Intelligence System — your role-based workspace", time: "Just now", type: "info" },
  ],
  chartData: [
    { label: "Mon", value: 6 }, { label: "Tue", value: 8 }, { label: "Wed", value: 5 },
    { label: "Thu", value: 9 }, { label: "Fri", value: 7 }, { label: "Sat", value: 2 },
  ],
  chartTitle: "Weekly Activity", chartLabel1: "Tasks",
  aiName: "Procurement Intelligence AI Assistant",
  aiCapabilities: ["Summarise my work activities", "Generate activity report", "Suggest next actions", "Draft communications"],
  subModules: [
    { label: "My Workspace", route: "/teams", icon: "Users", desc: "Daily work" },
    { label: "Corporate", route: "/corporate", icon: "Crown", desc: "All departments" },
    { label: "Analytics", route: "/analytics", icon: "BarChart3", desc: "Dashboards" },
    { label: "Governance", route: "/governance", icon: "Landmark", desc: "Policies" },
    { label: "Communications", route: "/utility/communications", icon: "MessageSquare", desc: "Comms" },
    { label: "AI Agents", route: "/ai-agents", icon: "Sparkles", desc: "AI tools" },
  ],
};

export function getRoleDashboardConfig(role: string): RoleDashboardConfig {
  return CONFIGS[role] ?? DEFAULT_CONFIG;
}
