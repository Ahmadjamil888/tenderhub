// Mock data for the National Procurement Platform — Government of Zimbabwe

// ── Monochrome chart palette (black / grey / white) ──
export const CHART_PALETTE = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];
export const CHART_INK = "#0f172a";
export const CHART_GRID = "#e5e7eb";
export const CHART_AXIS = "#6b7280";


export const kpis = {
  totalSpend: { value: "USD 2.84B", delta: "+6.2%", label: "Total Procurement Spend (YTD)" },
  activeTenders: { value: "1,287", delta: "+42", label: "Active Tenders" },
  openEvaluations: { value: "318", delta: "+12", label: "Open Evaluations" },
  contractsInProgress: { value: "964", delta: "+8", label: "Contracts in Progress" },
  procurementSavings: { value: "USD 184M", delta: "+11.4%", label: "Procurement Savings" },
  complianceScore: { value: "94.2%", delta: "+1.8 pts", label: "Compliance Score" },
  fraudAlerts: { value: "23", delta: "-5", label: "Open Fraud Alerts" },
  budgetUtilization: { value: "67.8%", delta: "On track", label: "Budget Utilization" },
};

export const spendTrend = [
  { month: "Jan", spend: 180, savings: 12 },
  { month: "Feb", spend: 210, savings: 14 },
  { month: "Mar", spend: 245, savings: 18 },
  { month: "Apr", spend: 230, savings: 17 },
  { month: "May", spend: 268, savings: 21 },
  { month: "Jun", spend: 290, savings: 24 },
  { month: "Jul", spend: 305, savings: 26 },
  { month: "Aug", spend: 312, savings: 28 },
  { month: "Sep", spend: 340, savings: 31 },
  { month: "Oct", spend: 358, savings: 33 },
  { month: "Nov", spend: 372, savings: 35 },
  { month: "Dec", spend: 390, savings: 38 },
];

export const categorySpend = [
  { name: "Infrastructure", value: 38 },
  { name: "Health & Pharma", value: 22 },
  { name: "ICT & Digital", value: 14 },
  { name: "Agriculture", value: 11 },
  { name: "Education", value: 9 },
  { name: "Other", value: 6 },
];

export const provinceSpend = [
  { province: "Harare", spend: 720, tenders: 312 },
  { province: "Bulawayo", spend: 410, tenders: 188 },
  { province: "Manicaland", spend: 280, tenders: 124 },
  { province: "Mashonaland West", spend: 245, tenders: 102 },
  { province: "Mashonaland East", spend: 220, tenders: 96 },
  { province: "Mashonaland Central", spend: 198, tenders: 88 },
  { province: "Midlands", spend: 235, tenders: 110 },
  { province: "Masvingo", spend: 175, tenders: 74 },
  { province: "Matabeleland North", spend: 142, tenders: 61 },
  { province: "Matabeleland South", spend: 125, tenders: 54 },
];

export type Tender = {
  id: string;
  title: string;
  entity: string;
  category: string;
  value: string;
  method: "Open" | "Restricted" | "Direct" | "Framework" | "RFQ";
  status: "Draft" | "Published" | "Bidding" | "Evaluation" | "Awarded" | "Cancelled";
  closing: string;
  bids: number;
};

export const tenders: Tender[] = [
  { id: "ZW-PRA-2026-00184", title: "Supply & Installation of Solar Mini-Grids — 12 Rural Clinics", entity: "Ministry of Energy", category: "Infrastructure", value: "USD 14,800,000", method: "Open", status: "Bidding", closing: "2026-07-08", bids: 11 },
  { id: "ZW-PRA-2026-00183", title: "Procurement of Antiretroviral Medicines (2-Year Framework)", entity: "Ministry of Health & Child Care", category: "Health & Pharma", value: "USD 42,500,000", method: "Framework", status: "Evaluation", closing: "2026-06-12", bids: 8 },
  { id: "ZW-PRA-2026-00182", title: "National Tax Administration System — Phase II", entity: "ZIMRA", category: "ICT & Digital", value: "USD 9,200,000", method: "Restricted", status: "Bidding", closing: "2026-07-21", bids: 5 },
  { id: "ZW-PRA-2026-00181", title: "Rehabilitation of Beitbridge–Harare Highway (Section 4)", entity: "Ministry of Transport", category: "Infrastructure", value: "USD 88,000,000", method: "Open", status: "Published", closing: "2026-08-04", bids: 0 },
  { id: "ZW-PRA-2026-00180", title: "Supply of Fertiliser — Pfumvudza Programme 2026/27", entity: "Ministry of Agriculture", category: "Agriculture", value: "USD 31,400,000", method: "Open", status: "Awarded", closing: "2026-05-30", bids: 14 },
  { id: "ZW-PRA-2026-00179", title: "Provision of External Audit Services (3 Years)", entity: "Office of the Auditor-General", category: "Services", value: "USD 1,850,000", method: "Open", status: "Evaluation", closing: "2026-06-18", bids: 9 },
  { id: "ZW-PRA-2026-00178", title: "School Textbooks — Primary Grades 1–7", entity: "Ministry of Primary & Secondary Education", category: "Education", value: "USD 6,700,000", method: "Open", status: "Bidding", closing: "2026-07-02", bids: 12 },
  { id: "ZW-PRA-2026-00177", title: "Construction of 4 District Hospitals", entity: "Ministry of Health & Child Care", category: "Infrastructure", value: "USD 56,000,000", method: "Open", status: "Draft", closing: "2026-09-15", bids: 0 },
];

export const aiAgents = [
  { name: "Supplier Verification Agent", status: "Active", confidence: 96, actions: 1284, pending: 4 },
  { name: "Tender Drafting Copilot", status: "Active", confidence: 92, actions: 318, pending: 7 },
  { name: "Compliance Checker", status: "Active", confidence: 98, actions: 2104, pending: 2 },
  { name: "Fraud Detection Agent", status: "Active", confidence: 89, actions: 412, pending: 23 },
  { name: "Technical Evaluation Agent", status: "Active", confidence: 91, actions: 264, pending: 18 },
  { name: "Financial Evaluation Agent", status: "Active", confidence: 94, actions: 241, pending: 9 },
  { name: "Award Recommendation Agent", status: "Active", confidence: 90, actions: 138, pending: 6 },
  { name: "Contract Intelligence Agent", status: "Active", confidence: 93, actions: 587, pending: 11 },
  { name: "Vendor Performance Agent", status: "Active", confidence: 95, actions: 921, pending: 3 },
  { name: "Procurement Auditor Agent", status: "Standby", confidence: 88, actions: 76, pending: 1 },
  { name: "Executive AI Advisor", status: "Active", confidence: 92, actions: 154, pending: 0 },
];

export const vendors = [
  { id: "VEN-00482", name: "Highveld Engineering (Pvt) Ltd", category: "Infrastructure", rating: 4.7, contracts: 18, status: "Approved", risk: "Low" },
  { id: "VEN-00481", name: "Zimbabwe Pharma Holdings", category: "Health & Pharma", rating: 4.5, contracts: 24, status: "Approved", risk: "Low" },
  { id: "VEN-00480", name: "Sable ICT Solutions", category: "ICT & Digital", rating: 4.2, contracts: 11, status: "Approved", risk: "Medium" },
  { id: "VEN-00479", name: "Mashonaland Agri Supplies", category: "Agriculture", rating: 4.4, contracts: 16, status: "Approved", risk: "Low" },
  { id: "VEN-00478", name: "Bulawayo Civil Works", category: "Infrastructure", rating: 3.9, contracts: 9, status: "Under Review", risk: "Medium" },
  { id: "VEN-00477", name: "Eastern Highlands Logistics", category: "Logistics", rating: 4.1, contracts: 7, status: "Approved", risk: "Low" },
  { id: "VEN-00476", name: "Granite Construction Group", category: "Infrastructure", rating: 2.8, contracts: 4, status: "Blacklisted", risk: "High" },
];

export const contracts = [
  { id: "CN-2026-0418", title: "ARV Medicines Framework", vendor: "Zimbabwe Pharma Holdings", value: "USD 42.5M", progress: 38, status: "On Track", end: "2028-03-31" },
  { id: "CN-2026-0411", title: "Beitbridge Highway Section 3", vendor: "Highveld Engineering", value: "USD 71.0M", progress: 64, status: "On Track", end: "2026-12-15" },
  { id: "CN-2026-0404", title: "ZIMRA Tax System Phase I", vendor: "Sable ICT Solutions", value: "USD 7.8M", progress: 82, status: "At Risk", end: "2026-08-30" },
  { id: "CN-2026-0399", title: "Pfumvudza Fertiliser 2025/26", vendor: "Mashonaland Agri Supplies", value: "USD 28.4M", progress: 100, status: "Completed", end: "2026-05-30" },
  { id: "CN-2026-0388", title: "Primary School Textbooks 2025", vendor: "Sable Press Ltd", value: "USD 5.2M", progress: 47, status: "On Track", end: "2026-11-01" },
];

export const roles = [
  "Chief Procurement Officer", "Procurement Officer", "Evaluation Officer", "Adjudication Officer",
  "Finance Officer", "Project Manager", "Contract Manager", "Audit Officer",
  "Anti-Corruption Officer", "Compliance Officer", "Legal Officer", "Stores Officer",
  "Records Officer", "Executive Director", "Board Member", "Regulator",
  "System Administrator", "AI Governance Officer", "Data Analytics Officer", "Risk Officer",
  "Ethics Officer", "Quality Assurance Officer", "Inspection Officer", "Asset Manager",
  "Budget Officer", "Treasury Officer", "End User", "SME Supplier",
  "Contract Officer", "Vendor User", "Citizen", "Public Auditor",
];

import { Users, Activity, DollarSign, type LucideIcon } from "lucide-react";

export const monthlyTransactions = [
  { month: "Jan", volume: 1200000, share: 32 },
  { month: "Feb", volume: 1540000, share: 28 },
  { month: "Mar", volume: 1820000, share: 31 },
  { month: "Apr", volume: 1480000, share: 25 },
  { month: "May", volume: 2100000, share: 33 },
  { month: "Jun", volume: 1960000, share: 22 },
  { month: "Jul", volume: 2340000, share: 27 },
  { month: "Aug", volume: 2180000, share: 20 },
  { month: "Sep", volume: 2640000, share: 35 },
  { month: "Oct", volume: 2480000, share: 29 },
  { month: "Nov", volume: 2820000, share: 31 },
  { month: "Dec", volume: 3100000, share: 38 },
];

export const dailyReport: { label: string; today: string; total: string; color: string; icon: LucideIcon }[] = [
  { label: "Customers (T+1)", today: "248", total: "325,678", color: "#f59e0b", icon: Users },
  { label: "Transactions (T+1)", today: "664,657", total: "5,691,234", color: "#3b82f6", icon: Activity },
  { label: "Commission (T+1)", today: "912", total: "6,312", color: "#10b981", icon: DollarSign },
];

export const riskLoanData = [
  { type: "Housing loan", risk: "7.31%", amount: 280 },
  { type: "Second-hand", risk: "7.65%", amount: 310 },
  { type: "Other loans", risk: "9.97%", amount: 420 },
  { type: "House net worth", risk: "10.42%", amount: 380 },
  { type: "Mixed interest", risk: "12.05%", amount: 510 },
];

export const hrTurnoverData = {
  projectNumbers: [
    { projects: 2, turnover: 1567 },
    { projects: 3, turnover: 72 },
    { projects: 4, turnover: 409 },
    { projects: 5, turnover: 612 },
    { projects: 6, turnover: 655 },
    { projects: 7, turnover: 256 },
  ],
  positions: [
    { pos: "hr", rate: 15, count: 800 },
    { pos: "accounting", rate: 12, count: 600 },
    { pos: "technical", rate: 8, count: 1200 },
    { pos: "support", rate: 18, count: 400 },
    { pos: "sales", rate: 22, count: 1400 },
    { pos: "marketing", rate: 14, count: 700 },
    { pos: "IT", rate: 9, count: 900 },
  ],
};

// ── Project Management Data ────────────────────────────────────────────────

export type ProjectStatus = "Initiation" | "Planning" | "In Progress" | "On Hold" | "Completed" | "Cancelled" | "Troubled";
export type ProjectPriority = "Low" | "Medium" | "High" | "Critical";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type Project = {
  id: string;
  title: string;
  entity: string;
  manager: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  budget: string;
  budgetNum: number;
  spent: string;
  spentNum: number;
  progress: number;
  startDate: string;
  endDate: string;
  phase: string;
  riskLevel: RiskLevel;
  spi: number;
  cpi: number;
  daysDelay: number;
  category: string;
  healthScore: number;
};

export const projects: Project[] = [
  { id: "PROJ-2026-00041", title: "Beitbridge–Harare Highway Rehabilitation (Section 4)", entity: "Ministry of Transport", manager: "T. Moyo", status: "In Progress", priority: "Critical", budget: "USD 88,000,000", budgetNum: 88000000, spent: "USD 32,400,000", spentNum: 32400000, progress: 37, startDate: "2025-09-01", endDate: "2027-12-31", phase: "Construction", riskLevel: "Medium", spi: 0.94, cpi: 0.96, daysDelay: 12, category: "Infrastructure", healthScore: 72 },
  { id: "PROJ-2026-00040", title: "National Hospital Information System", entity: "Ministry of Health", manager: "P. Dube", status: "In Progress", priority: "High", budget: "USD 24,000,000", budgetNum: 24000000, spent: "USD 18,200,000", spentNum: 18200000, progress: 76, startDate: "2024-04-01", endDate: "2026-09-30", phase: "UAT & Training", riskLevel: "Low", spi: 1.02, cpi: 0.98, daysDelay: 0, category: "ICT & Digital", healthScore: 91 },
  { id: "PROJ-2026-00039", title: "Solar Mini-Grid — 12 Rural Clinics", entity: "Ministry of Energy", manager: "A. Mpofu", status: "In Progress", priority: "High", budget: "USD 14,800,000", budgetNum: 14800000, spent: "USD 4,200,000", spentNum: 4200000, progress: 28, startDate: "2026-01-15", endDate: "2027-06-30", phase: "Procurement & Design", riskLevel: "Low", spi: 1.05, cpi: 1.02, daysDelay: 0, category: "Infrastructure", healthScore: 88 },
  { id: "PROJ-2026-00038", title: "Harare Water Treatment Plant Upgrade", entity: "Ministry of Water", manager: "J. Banda", status: "Troubled", priority: "Critical", budget: "USD 56,000,000", budgetNum: 56000000, spent: "USD 48,200,000", spentNum: 48200000, progress: 58, startDate: "2023-06-01", endDate: "2026-08-31", phase: "Construction", riskLevel: "Critical", spi: 0.72, cpi: 0.79, daysDelay: 94, category: "Infrastructure", healthScore: 38 },
  { id: "PROJ-2026-00037", title: "Primary School Textbook Programme 2026/27", entity: "Ministry of Education", manager: "R. Chikwanda", status: "Planning", priority: "High", budget: "USD 6,700,000", budgetNum: 6700000, spent: "USD 280,000", spentNum: 280000, progress: 8, startDate: "2026-06-01", endDate: "2026-11-30", phase: "Planning", riskLevel: "Low", spi: 1.0, cpi: 1.0, daysDelay: 0, category: "Education", healthScore: 85 },
  { id: "PROJ-2026-00036", title: "ZIMRA Tax System Phase II", entity: "ZIMRA", manager: "A. Mpofu", status: "In Progress", priority: "High", budget: "USD 9,200,000", budgetNum: 9200000, spent: "USD 6,800,000", spentNum: 6800000, progress: 74, startDate: "2025-01-10", endDate: "2026-08-30", phase: "Development", riskLevel: "High", spi: 0.88, cpi: 0.91, daysDelay: 28, category: "ICT & Digital", healthScore: 61 },
  { id: "PROJ-2026-00035", title: "Pfumvudza Programme — 2026/27 Season", entity: "Ministry of Agriculture", manager: "T. Moyo", status: "Initiation", priority: "Critical", budget: "USD 31,400,000", budgetNum: 31400000, spent: "USD 0", spentNum: 0, progress: 0, startDate: "2026-08-01", endDate: "2027-04-30", phase: "Initiation", riskLevel: "Low", spi: 1.0, cpi: 1.0, daysDelay: 0, category: "Agriculture", healthScore: 95 },
  { id: "PROJ-2026-00034", title: "4 District Hospitals Construction", entity: "Ministry of Health", manager: "P. Dube", status: "Initiation", priority: "Critical", budget: "USD 56,000,000", budgetNum: 56000000, spent: "USD 1,400,000", spentNum: 1400000, progress: 3, startDate: "2026-09-15", endDate: "2029-12-31", phase: "Design & Approvals", riskLevel: "Medium", spi: 1.0, cpi: 0.97, daysDelay: 0, category: "Infrastructure", healthScore: 78 },
];

export type ProjectMilestone = {
  id: string; projectId: string; title: string;
  plannedDate: string; actualDate: string;
  status: "Pending" | "On Track" | "At Risk" | "Delayed" | "Completed";
  progress: number; owner: string;
};

export const projectMilestones: ProjectMilestone[] = [
  { id: "MS-001", projectId: "PROJ-2026-00041", title: "Site Establishment Complete", plannedDate: "2026-01-31", actualDate: "2026-02-14", status: "Completed", progress: 100, owner: "T. Moyo" },
  { id: "MS-002", projectId: "PROJ-2026-00041", title: "Earthworks 50% Complete", plannedDate: "2026-04-30", actualDate: "", status: "Delayed", progress: 38, owner: "J. Banda" },
  { id: "MS-003", projectId: "PROJ-2026-00041", title: "Bridge Structures Complete", plannedDate: "2026-09-30", actualDate: "", status: "At Risk", progress: 12, owner: "J. Banda" },
  { id: "MS-004", projectId: "PROJ-2026-00041", title: "Surfacing & Markings", plannedDate: "2027-06-30", actualDate: "", status: "Pending", progress: 0, owner: "T. Moyo" },
  { id: "MS-005", projectId: "PROJ-2026-00040", title: "System Architecture Approved", plannedDate: "2024-07-31", actualDate: "2024-07-28", status: "Completed", progress: 100, owner: "A. Mpofu" },
  { id: "MS-006", projectId: "PROJ-2026-00040", title: "Core Modules Developed", plannedDate: "2025-12-31", actualDate: "2026-01-15", status: "Completed", progress: 100, owner: "P. Dube" },
  { id: "MS-007", projectId: "PROJ-2026-00040", title: "UAT Sign-off", plannedDate: "2026-07-31", actualDate: "", status: "On Track", progress: 65, owner: "P. Dube" },
  { id: "MS-008", projectId: "PROJ-2026-00040", title: "Go-Live", plannedDate: "2026-09-01", actualDate: "", status: "Pending", progress: 0, owner: "P. Dube" },
  { id: "MS-009", projectId: "PROJ-2026-00038", title: "Phase 1 Civil Works", plannedDate: "2024-06-30", actualDate: "2024-11-30", status: "Completed", progress: 100, owner: "J. Banda" },
  { id: "MS-010", projectId: "PROJ-2026-00038", title: "Mechanical & Electrical Installation", plannedDate: "2025-09-30", actualDate: "", status: "Delayed", progress: 42, owner: "J. Banda" },
  { id: "MS-011", projectId: "PROJ-2026-00038", title: "Commissioning & Testing", plannedDate: "2026-05-31", actualDate: "", status: "Delayed", progress: 0, owner: "J. Banda" },
];

export type ProjectRisk = {
  id: string; projectId: string; title: string; category: string;
  likelihood: number; impact: number; riskScore: number; level: RiskLevel;
  status: "Open" | "Mitigating" | "Escalated" | "Closed";
  owner: string; mitigation: string; dateLogged: string;
};

export const projectRisks: ProjectRisk[] = [
  { id: "RSK-001", projectId: "PROJ-2026-00038", title: "Contractor cash flow leading to work stoppages", category: "Financial", likelihood: 4, impact: 5, riskScore: 20, level: "Critical", status: "Escalated", owner: "J. Banda", mitigation: "Weekly cash flow monitoring; mobilisation advance reviewed", dateLogged: "2026-03-10" },
  { id: "RSK-002", projectId: "PROJ-2026-00038", title: "Geological surprises increasing excavation costs", category: "Technical", likelihood: 3, impact: 4, riskScore: 12, level: "High", status: "Mitigating", owner: "J. Banda", mitigation: "Additional geotechnical borings commissioned", dateLogged: "2026-02-20" },
  { id: "RSK-003", projectId: "PROJ-2026-00041", title: "Delayed procurement of bitumen — global supply issue", category: "Procurement", likelihood: 3, impact: 4, riskScore: 12, level: "High", status: "Mitigating", owner: "T. Moyo", mitigation: "Pre-order placed; alternative supplier identified", dateLogged: "2026-04-05" },
  { id: "RSK-004", projectId: "PROJ-2026-00041", title: "Community disputes over land access", category: "Stakeholder", likelihood: 2, impact: 3, riskScore: 6, level: "Medium", status: "Open", owner: "T. Moyo", mitigation: "Community liaison officer engaged", dateLogged: "2026-05-01" },
  { id: "RSK-005", projectId: "PROJ-2026-00036", title: "ZIMRA data migration complexity", category: "Technical", likelihood: 3, impact: 4, riskScore: 12, level: "High", status: "Open", owner: "A. Mpofu", mitigation: "Parallel run scheduled for 3 months before cutover", dateLogged: "2026-04-12" },
  { id: "RSK-006", projectId: "PROJ-2026-00040", title: "Connectivity at remote rural facilities", category: "Infrastructure", likelihood: 2, impact: 3, riskScore: 6, level: "Medium", status: "Mitigating", owner: "P. Dube", mitigation: "Offline-first module design approved", dateLogged: "2026-01-15" },
];

export type ProjectTask = {
  id: string; projectId: string; title: string; assignee: string;
  startDate: string; endDate: string; progress: number;
  status: "Not Started" | "In Progress" | "Completed" | "Overdue" | "On Hold";
  priority: ProjectPriority; wbsCode: string;
};

export const projectTasks: ProjectTask[] = [
  { id: "TSK-001", projectId: "PROJ-2026-00041", title: "Detailed Engineering Design", assignee: "J. Banda", startDate: "2025-09-01", endDate: "2025-11-30", progress: 100, status: "Completed", priority: "High", wbsCode: "1.1" },
  { id: "TSK-002", projectId: "PROJ-2026-00041", title: "Site Preparation & Clearing", assignee: "J. Banda", startDate: "2025-12-01", endDate: "2026-02-28", progress: 100, status: "Completed", priority: "High", wbsCode: "1.2" },
  { id: "TSK-003", projectId: "PROJ-2026-00041", title: "Earthworks & Grading", assignee: "J. Banda", startDate: "2026-03-01", endDate: "2026-07-31", progress: 38, status: "In Progress", priority: "Critical", wbsCode: "1.3" },
  { id: "TSK-004", projectId: "PROJ-2026-00041", title: "Drainage & Culverts", assignee: "T. Moyo", startDate: "2026-04-01", endDate: "2026-08-31", progress: 22, status: "In Progress", priority: "High", wbsCode: "1.4" },
  { id: "TSK-005", projectId: "PROJ-2026-00041", title: "Bridge Structures — Limpopo Crossing", assignee: "J. Banda", startDate: "2026-06-01", endDate: "2026-12-31", progress: 5, status: "In Progress", priority: "Critical", wbsCode: "1.5" },
  { id: "TSK-006", projectId: "PROJ-2026-00041", title: "Asphalt Surfacing", assignee: "T. Moyo", startDate: "2027-01-01", endDate: "2027-08-31", progress: 0, status: "Not Started", priority: "High", wbsCode: "1.6" },
  { id: "TSK-007", projectId: "PROJ-2026-00040", title: "Requirements Gathering", assignee: "P. Dube", startDate: "2024-04-01", endDate: "2024-06-30", progress: 100, status: "Completed", priority: "High", wbsCode: "2.1" },
  { id: "TSK-008", projectId: "PROJ-2026-00040", title: "System Architecture & Design", assignee: "A. Mpofu", startDate: "2024-07-01", endDate: "2024-09-30", progress: 100, status: "Completed", priority: "High", wbsCode: "2.2" },
  { id: "TSK-009", projectId: "PROJ-2026-00040", title: "Core Module Development", assignee: "A. Mpofu", startDate: "2024-10-01", endDate: "2025-12-31", progress: 100, status: "Completed", priority: "Critical", wbsCode: "2.3" },
  { id: "TSK-010", projectId: "PROJ-2026-00040", title: "User Acceptance Testing", assignee: "P. Dube", startDate: "2026-03-01", endDate: "2026-07-31", progress: 65, status: "In Progress", priority: "Critical", wbsCode: "2.4" },
  { id: "TSK-011", projectId: "PROJ-2026-00040", title: "Staff Training", assignee: "R. Chikwanda", startDate: "2026-07-01", endDate: "2026-08-31", progress: 0, status: "Not Started", priority: "High", wbsCode: "2.5" },
  { id: "TSK-012", projectId: "PROJ-2026-00038", title: "Phase 1 Civil Works", assignee: "J. Banda", startDate: "2023-06-01", endDate: "2024-11-30", progress: 100, status: "Completed", priority: "Critical", wbsCode: "3.1" },
  { id: "TSK-013", projectId: "PROJ-2026-00038", title: "M&E Installation", assignee: "J. Banda", startDate: "2024-09-01", endDate: "2026-05-31", progress: 42, status: "Overdue", priority: "Critical", wbsCode: "3.2" },
  { id: "TSK-014", projectId: "PROJ-2026-00038", title: "Commissioning & Testing", assignee: "J. Banda", startDate: "2026-06-01", endDate: "2026-08-31", progress: 0, status: "Not Started", priority: "Critical", wbsCode: "3.3" },
];

export const projectSpendTrend = [
  { month: "Jan", planned: 42, actual: 38, forecast: 42 },
  { month: "Feb", planned: 67, actual: 60, forecast: 67 },
  { month: "Mar", planned: 98, actual: 91, forecast: 98 },
  { month: "Apr", planned: 132, actual: 128, forecast: 132 },
  { month: "May", planned: 168, actual: 161, forecast: 170 },
  { month: "Jun", planned: 210, actual: 198, forecast: 215 },
  { month: "Jul", planned: 248, actual: 0, forecast: 255 },
  { month: "Aug", planned: 290, actual: 0, forecast: 302 },
  { month: "Sep", planned: 335, actual: 0, forecast: 350 },
];

export const projectsByStatus = [
  { name: "In Progress", value: 4 },
  { name: "Initiation", value: 2 },
  { name: "Planning", value: 1 },
  { name: "Troubled", value: 1 },
];

export const projectAIAgents = [
  { name: "Portfolio Intelligence Agent", status: "Active", confidence: 94, actions: 842, pending: 3 },
  { name: "Schedule Control Agent", status: "Active", confidence: 91, actions: 1204, pending: 8 },
  { name: "Cost Control Agent", status: "Active", confidence: 96, actions: 621, pending: 2 },
  { name: "Risk Intelligence Agent", status: "Active", confidence: 89, actions: 384, pending: 14 },
  { name: "Contractor Evaluation Agent", status: "Active", confidence: 93, actions: 472, pending: 5 },
  { name: "Quality Inspector Agent", status: "Active", confidence: 88, actions: 284, pending: 9 },
  { name: "Document Intelligence Agent", status: "Active", confidence: 95, actions: 1082, pending: 1 },
  { name: "Chief Project Intelligence Agent", status: "Active", confidence: 92, actions: 213, pending: 4 },
];

export const contractorPerformance = [
  { name: "Highveld Engineering", quality: 4.6, schedule: 4.2, safety: 4.8, overall: 4.5, projects: 3, defects: 2 },
  { name: "Sable ICT Solutions", quality: 4.1, schedule: 3.8, safety: 4.9, overall: 4.0, projects: 2, defects: 5 },
  { name: "Zimbabwe Pharma Holdings", quality: 4.7, schedule: 4.5, safety: 4.9, overall: 4.7, projects: 2, defects: 1 },
  { name: "Mashonaland Agri Supplies", quality: 4.3, schedule: 4.6, safety: 4.8, overall: 4.5, projects: 2, defects: 3 },
  { name: "Bulawayo Civil Works", quality: 3.4, schedule: 3.1, safety: 3.8, overall: 3.3, projects: 1, defects: 12 },
];

export const projectCostData = [
  { category: "Infrastructure", budgeted: 204, actual: 163, variance: 41 },
  { category: "ICT & Digital", budgeted: 33, actual: 25, variance: 8 },
  { category: "Health", budgeted: 80, actual: 19, variance: 61 },
  { category: "Agriculture", budgeted: 31, actual: 0, variance: 31 },
  { category: "Education", budgeted: 7, actual: 0.3, variance: 6.7 },
];

// ─── Grouped Navigation Sections (expandable parent → children) ──────────────
// Each section can have sub-groups for the collapsible sidebar design.
// The flat "items" array is used for role-based whitelist filtering.

export const navSections = [
  {
    label: "Briefing",
    icon: "Sparkles",
    items: [
      { to: "/briefing",              label: "1. Notes & Alerts",       icon: "Bell"          },
      { to: "/briefing",              label: "2. Visual Dashboard",     icon: "BarChart3"     },
      { to: "/briefing",              label: "3. AI Briefing Video",    icon: "Sparkles"      },
      { to: "/briefing",              label: "4. Executive BI",         icon: "Globe2"        },
      { to: "/briefing",              label: "5. Projects & Tenders",   icon: "MapPin"        },
      { to: "/briefing",              label: "6. My Briefing",          icon: "Star"          },
      { to: "/briefing",              label: "7. AI Summary",           icon: "Sparkles"      },
    ],
  },
  {
    label: "My Work Space",
    icon: "LayoutDashboard",
    items: [
      { to: "/dashboard",             label: "Dashboard",              icon: "LayoutDashboard" },
      { to: "/teams",                 label: "My Work Space",          icon: "UsersRound" },
      { to: "/staff-productivity",    label: "Staff Productivity",     icon: "TrendingUp" },
      { to: "/department-activities", label: "Department Activities",  icon: "Building2" },
      { to: "/analytics",             label: "Analytics",              icon: "BarChart3" },
      { to: "/bi-dashboards",         label: "BI Dashboards",          icon: "BarChart3" },
      { to: "/ai-agents",             label: "AI Operations",          icon: "Sparkles" },
    ],
  },
  {
    label: "E-Procurement",
    icon: "ShoppingCart",
    items: [
      { to: "/tenders-hub",                         label: "Tender Hub (All Modules)",      icon: "Newspaper"      },
      { to: "/tenders/module/tenders",              label: "Tenders",                       icon: "FileText"       },
      { to: "/tenders/module/rfq",                  label: "RFQ",                           icon: "ShoppingCart"   },
      { to: "/tenders/module/rfp",                  label: "RFP",                           icon: "ClipboardList"  },
      { to: "/tenders/module/eoi",                  label: "EOI",                           icon: "UsersRound"     },
      { to: "/tenders/module/unsolicited",          label: "Unsolicited Bids",              icon: "Send"           },
      { to: "/tenders/module/auctions",             label: "Auctions",                      icon: "Gavel"          },
      { to: "/workbench",                           label: "Procurement Dashboard",         icon: "LayoutDashboard"},
      { to: "/intake",                              label: "Intake Portal",                 icon: "Send"           },
      { to: "/lifecycle",                           label: "Process Tower",                 icon: "Activity"       },
    ],
  },
  {
    label: "Documents",
    icon: "FileText",
    items: [
      { to: "/docs/editor",                       label: "Document Editor",            icon: "Edit3"           },
      { to: "/docs/library",                      label: "Document Library",           icon: "FolderOpen"      },
      { to: "/docs/templates",                    label: "Templates",                  icon: "BookOpen"        },
      { to: "/docs/contracts",                    label: "Contract Documents",         icon: "FileSignature"   },
      { to: "/docs/tender-docs",                  label: "Tender Documents",           icon: "FileText"        },
      { to: "/docs/evaluations",                  label: "Evaluation Reports",         icon: "ClipboardList"   },
      { to: "/docs/minutes",                      label: "Minutes & Resolutions",      icon: "CheckCircle"     },
      { to: "/docs/compliance",                   label: "Compliance Docs",            icon: "ShieldCheck"     },
      { to: "/docs/archive",                      label: "Archive",                    icon: "Package"         },
    ],
  },
  {
    label: "Vendor Management",
    icon: "Building2",
    items: [
      { to: "/vendor-register",  label: "Vendor Self-Registration",    icon: "UserPlus"        },
      { to: "/vendors",          label: "Vendor Register & Applications", icon: "Building2"    },
      { to: "/marketplace",      label: "🌐 Supplier Marketplace",     icon: "Globe2"          },
      { to: "/performance",      label: "Performance Scores",          icon: "TrendingUp"      },
    ],
  },
  {
    label: "Intelligence Analysis",
    icon: "Sparkles",
    items: [
      { to: "/spend-intelligence",     label: "💡 Spend Intelligence",   icon: "TrendingUp" },
      { to: "/ai-agents",              label: "AI Agents",               icon: "Sparkles"   },
      { to: "/bi-dashboards",          label: "BI Dashboards",           icon: "BarChart3"  },
      { to: "/analytics",              label: "Analytics",               icon: "BarChart3"  },
      { to: "/workbench/ai-analytics", label: "AI Analytics",           icon: "Sparkles"   },
      { to: "/workbench/reports",      label: "Reports",                 icon: "BarChart3"  },
      { to: "/anti-corruption",        label: "Anti-Corruption",         icon: "AlertOctagon" },
      { to: "/audit",                  label: "Audit Intelligence",      icon: "ShieldCheck" },
    ],
  },
  {
    label: "Budget Management",
    icon: "Wallet",
    items: [
      { to: "/budget",                      label: "Budget Module Home",        icon: "Wallet"        },
      { to: "/budget",                      label: "1. Lifecycle Tower",        icon: "Activity"      },
      { to: "/budget",                      label: "2. Create Budget",          icon: "FileText"      },
      { to: "/budget",                      label: "3. Budget Reports",         icon: "BarChart3"     },
      { to: "/budget",                      label: "4. Admin Workbench",        icon: "Settings"      },
      { to: "/annual-procurement-plan",     label: "Annual Procurement Plan",   icon: "ClipboardList" },
      { to: "/tender-documents",            label: "Tender Document Suite",     icon: "FolderOpen"    },
    ],
  },
  {
    label: "Financial Statements & Accounts",
    icon: "FileText",
    items: [
      { to: "/financial-statements",                 label: "Financial Statements", icon: "FileText"     },
      { to: "/finance",                              label: "Finance & Accounts",   icon: "Wallet"       },
      { to: "/procurement/financial-reconciliation", label: "Reconciliation",       icon: "CheckCircle"  },
      { to: "/reports",                              label: "Statutory Reports",    icon: "FileText"     },
    ],
  },
  {
    label: "Audit, Risk & Compliance",
    icon: "ShieldCheck",
    items: [
      { to: "/audit",          label: "Internal Audit",    icon: "ShieldCheck"  },
      { to: "/anti-corruption",label: "Anti-Corruption",   icon: "AlertOctagon" },
      { to: "/governance",     label: "Governance",        icon: "Landmark"     },
      { to: "/roles",          label: "Roles & Permissions",icon: "UsersRound"  },
    ],
  },
  {
    label: "Asset & Inventory",
    icon: "Package",
    items: [
      { to: "/assets",                     label: "Asset Register",           icon: "Package"    },
      { to: "/assets/maintenance",         label: "Maintenance",              icon: "Wrench"     },
      { to: "/assets/maintenance-crm",     label: "Assets Maintenance CRM",   icon: "Headphones" },
      { to: "/assets/financials",          label: "Asset Financials",         icon: "DollarSign" },
      { to: "/assets/disposal",            label: "Asset Disposal",           icon: "Trash2"     },
      { to: "/inventory",                  label: "Inventory Control",        icon: "Boxes"      },
      { to: "/inventory/receiving",        label: "Receiving",                icon: "PackageCheck"},
      { to: "/inventory/requests",         label: "Issue Requests",           icon: "ScanLine"   },
      { to: "/inventory/warehouse",        label: "Warehouse",                icon: "Warehouse"  },
    ],
  },
  {
    label: "Human Resources",
    icon: "UsersRound",
    items: [
      { to: "/human-resources",                 label: "HR Dashboard",              icon: "UsersRound"    },
      { to: "/asset-declarations",              label: "⭐ Asset Declarations",      icon: "ShieldCheck"   },
      { to: "/e-recruitment",                   label: "⭐ E-Recruitment Portal",    icon: "UserPlus"      },
      { to: "/e-recruitment",                   label: "1. HR Planning",             icon: "BarChart3"     },
      { to: "/e-recruitment",                   label: "2. Recruitment",             icon: "UserPlus"      },
      { to: "/e-recruitment",                   label: "3. Contracting",             icon: "FileText"      },
      { to: "/e-recruitment",                   label: "4. Orientation & Training",  icon: "BookOpen"      },
      { to: "/e-recruitment",                   label: "5. Employee Management",     icon: "UsersRound"    },
      { to: "/e-recruitment",                   label: "6. Promotions/Transfers",    icon: "TrendingUp"    },
      { to: "/e-recruitment",                   label: "7. Exit / Retirement",       icon: "Star"          },
      { to: "/human-resources/recruitment-crm", label: "Recruitment CRM",           icon: "Headphones"    },
      { to: "/human-resources",                 label: "Payroll & Benefits",         icon: "DollarSign"    },
      { to: "/human-resources",                 label: "Leave Management",           icon: "CalendarDays"  },
      { to: "/human-resources",                 label: "Disciplinary & Grievance",   icon: "ShieldCheck"   },
    ],
  },
  {
    label: "Project Management",
    icon: "Briefcase",
    items: [
      { to: "/projects",              label: "PM Tower",             icon: "LayoutDashboard" },
      { to: "/projects/portfolio",    label: "Project Portfolio",    icon: "Briefcase"       },
      { to: "/projects/crm",          label: "Projects CRM",         icon: "Headphones"      },
      { to: "/projects/planning",     label: "Planning & WBS",       icon: "ClipboardList"   },
      { to: "/projects/schedule",     label: "Schedule & Gantt",     icon: "BarChart3"       },
      { to: "/projects/costs",        label: "Cost & Finance",       icon: "Wallet"          },
      { to: "/projects/risks",        label: "Risk & Issues",        icon: "ShieldCheck"     },
      { to: "/projects/quality",      label: "Quality",              icon: "CheckCircle"     },
      { to: "/projects/resources",    label: "Resources",            icon: "UsersRound"      },
      { to: "/projects/contractors",  label: "Contractors",          icon: "Building2"       },
      { to: "/projects/documents",    label: "Documents",            icon: "FileText"        },
      { to: "/gis",                   label: "GIS Map",              icon: "MapPin"          },
    ],
  },
  {
    label: "Communications & Media",
    icon: "MessageSquare",
    items: [
      { to: "/utility/communications",     label: "Communications",           icon: "MessageSquare" },
      { to: "/utility/gazette",            label: "Government Gazette",       icon: "Newspaper"     },
      { to: "/utility/announcements",      label: "Announcements",            icon: "Bell"          },
      { to: "/utility/public-records",     label: "Public Records",           icon: "FileText"      },
      { to: "/utility/media",              label: "Media Library",            icon: "Image"         },
      { to: "/utility",                    label: "Catalogue",                icon: "BookOpen"      },
      { to: "/report-service-delivery",    label: "Report Service Delivery",  icon: "AlertTriangle" },
    ],
  },
  {
    label: "Corporate & Governance",
    icon: "Crown",
    items: [
      { to: "/corporate",                               label: "Corporate Module",                    icon: "Crown"      },
      { to: "/corporate/customer-services-crm",         label: "Customer Services Delivery CRM",      icon: "Headphones" },
      { to: "/corporate/service-complaints-crm",        label: "Service Delivery Complaints CRM",     icon: "Headphones" },
      { to: "/corporate/recruitment-crm",               label: "Recruitment CRM",                     icon: "Headphones" },
      { to: "/corporate/services-applications-crm",     label: "Services Applications CRM",           icon: "Headphones" },
      { to: "/corporate/annual-returns-crm",            label: "Annual Returns CRM",                  icon: "Headphones" },
      { to: "/corporate/communications-crm",            label: "Communications CRM",                  icon: "Headphones" },
      { to: "/mail-registry",                           label: "Mail Registry",                       icon: "Mail"       },
      { to: "/prime-entity",                            label: "Prime Entity",                        icon: "Landmark"   },
      { to: "/organisations",                           label: "Organisation Registry",               icon: "Building2"  },
      { to: "/president",                               label: "Executive Dashboard",                 icon: "Landmark"   },
      { to: "/prime-minister",                          label: "Prime Minister Portal",               icon: "Star"       },
    ],
  },
  {
    label: "AI & Intelligence",
    icon: "Sparkles",
    items: [
      { to: "/ai-agents",                  label: "AI Agents",                  icon: "Sparkles"  },
      { to: "/agents/orchestration",       label: "🤖 Autonomous Orchestration", icon: "Bot"       },
      { to: "/spend-intelligence",         label: "💡 Spend Intelligence",       icon: "TrendingUp"},
      { to: "/bi-dashboards",              label: "BI Dashboards",              icon: "BarChart3" },
      { to: "/analytics",                  label: "Analytics",                  icon: "BarChart3" },
      { to: "/projects/ai-tower",          label: "PM AI Tower",                icon: "Sparkles"  },
      { to: "/budget/ai-agents",           label: "Budget AI",                  icon: "Sparkles"  },
      { to: "/inventory/ai-agents",        label: "Inventory AI",               icon: "Sparkles"  },
    ],
  },
  {
    label: "Knowledge & Learning",
    icon: "BookOpen",
    items: [
      { to: "/lessons-learned",  label: "Lessons Learned",      icon: "BookOpen"  },
      { to: "/knowledge-base",   label: "Knowledge Base",       icon: "BookOpen"  },
    ],
  },
  {
    label: "Executive & Reports",
    icon: "BarChart3",
    items: [
      { to: "/executive-dashboard", label: "Executive Dashboard", icon: "LayoutDashboard" },
      { to: "/reports",             label: "Reports & BI",        icon: "BarChart3"       },
      { to: "/notifications",       label: "Notifications Center",icon: "Bell"            },
    ],
  },
  {
    label: "Administration",
    icon: "Settings",
    items: [
      { to: "/system-admin",    label: "System Administration", icon: "Settings"  },
      { to: "/roles",           label: "Roles & Permissions",   icon: "UsersRound"},
      { to: "/organisations",   label: "Organisation Registry", icon: "Building2" },
    ],
  },
];

