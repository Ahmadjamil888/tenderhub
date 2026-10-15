// ─── Procurement Workbench Data Types & Seed Data ─────────────────────────────
// Stages 1–3: Planning, Requisition, Strategy

// ─── Shared Types ─────────────────────────────────────────────────────────────
export type ProcurementStatus =
  | "Draft" | "Submitted" | "Under Review" | "Approved" | "Rejected" | "Returned";

export type WorkflowStage =
  | "Draft" | "Department Review" | "Budget Review" | "Approval" | "Approved"
  | "Supervisor Review" | "Finance Verification" | "Procurement Approval"
  | "Strategy Review" | "Compliance Check" | "Final Approval";

export type Priority = "Critical" | "High" | "Medium" | "Low";
export type ProcurementMethod =
  | "Open Tender" | "Restricted Tender" | "Request for Quotation"
  | "Direct Procurement" | "Framework Agreement" | "Two-Stage Tender"
  | "Request for Proposals" | "Expression of Interest";

// ─── Stage 1: Procurement Plan ────────────────────────────────────────────────
export type ProcurementPlan = {
  id: string;
  planNumber: string;
  title: string;
  department: string;
  ministry: string;
  financialYear: string;
  costCentre: string;
  fundingSource: string;
  procurementCategory: string;
  procurementMethod: ProcurementMethod;
  estimatedBudget: string;
  currency: string;
  priority: Priority;
  status: ProcurementStatus;
  workflowStage: WorkflowStage;
  workflowProgress: number;
  planningStartDate: string;
  planningEndDate: string;
  expectedAwardDate: string;
  expectedDeliveryDate: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  riskSummary: string;
  objectives: string;
  justification: string;
  notes: string;
  attachments: string[];
  owner: string;
  assignedUser: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  returnedReason?: string;
  complianceScore: number;
  aiRecommendations: string[];
};

// ─── Stage 2: Procurement Requisition ────────────────────────────────────────
export type RequisitionItem = {
  id: string;
  itemNo: number;
  description: string;
  specifications: string;
  quantity: number;
  unit: string;
  estimatedUnitCost: string;
  totalCost: string;
  category: string;
};

export type ProcurementRequisition = {
  id: string;
  requisitionNumber: string;
  title: string;
  department: string;
  ministry: string;
  requestingOfficer: string;
  requestingOfficerTitle: string;
  financialYear: string;
  budgetCode: string;
  costCentre: string;
  fundingSource: string;
  priority: Priority;
  status: ProcurementStatus;
  workflowStage: WorkflowStage;
  workflowProgress: number;
  items: RequisitionItem[];
  totalEstimatedCost: string;
  currency: string;
  budgetAvailable: string;
  budgetBalance: string;
  procurementJustification: string;
  deliveryAddress: string;
  deliveryRequirements: string;
  requiredDeliveryDate: string;
  attachments: string[];
  notes: string;
  owner: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  linkedPlanId?: string;
  complianceScore: number;
};

// ─── Stage 3: Procurement Strategy ───────────────────────────────────────────
export type StrategyRisk = {
  id: string;
  risk: string;
  likelihood: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  mitigation: string;
};

export type MarketAnalysis = {
  marketSize: string;
  activeSuppliers: number;
  competitionLevel: "Low" | "Medium" | "High";
  marketNotes: string;
};

export type SupplierAnalysis = {
  supplierName: string;
  capability: "Low" | "Medium" | "High";
  experience: string;
  riskRating: "Low" | "Medium" | "High";
};

export type ProcurementStrategy = {
  id: string;
  strategyNumber: string;
  title: string;
  department: string;
  ministry: string;
  financialYear: string;
  linkedRequisitionId?: string;
  linkedPlanId?: string;
  procurementMethod: ProcurementMethod;
  methodJustification: string;
  strategyObjective: string;
  marketAnalysis: MarketAnalysis;
  supplierAnalysis: SupplierAnalysis[];
  risks: StrategyRisk[];
  evaluationCriteria: { criterion: string; weight: number }[];
  estimatedBudget: string;
  currency: string;
  costAnalysisSummary: string;
  plannedAdvertisementDate: string;
  plannedClosingDate: string;
  plannedEvaluationDate: string;
  plannedAwardDate: string;
  status: ProcurementStatus;
  workflowStage: WorkflowStage;
  workflowProgress: number;
  priority: Priority;
  aiRecommendations: string[];
  complianceScore: number;
  notes: string;
  attachments: string[];
  owner: string;
  version: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Seed Data: Procurement Plans ────────────────────────────────────────────
export const SEED_PLANS: ProcurementPlan[] = [
  {
    id: "plan-001",
    planNumber: "APP-2026-001",
    title: "Medical Supplies & Pharmaceuticals — FY2026/27",
    department: "Pharmacy & Medicines Control",
    ministry: "Ministry of Health & Child Care",
    financialYear: "2026/2027",
    costCentre: "CC-MHCC-001",
    fundingSource: "Treasury — Vote 8",
    procurementCategory: "Health & Pharmaceuticals",
    procurementMethod: "Open Tender",
    estimatedBudget: "8,200,000",
    currency: "USD",
    priority: "Critical",
    status: "Under Review",
    workflowStage: "Budget Review",
    workflowProgress: 50,
    planningStartDate: "2026-06-01",
    planningEndDate: "2026-07-31",
    expectedAwardDate: "2026-09-30",
    expectedDeliveryDate: "2026-10-31",
    riskLevel: "Medium",
    riskSummary: "Supply chain delays; single-source pharmaceuticals",
    objectives: "Ensure uninterrupted supply of essential medicines to 24 district hospitals for FY2026/27.",
    justification: "Critical healthcare mandate. Current stock levels will deplete by October 2026.",
    notes: "Coordinate with NMAZ for prequalified supplier list.",
    attachments: ["Needs Assessment Report.pdf", "Budget Allocation Letter.pdf"],
    owner: "Dr. P. Dube",
    assignedUser: "A. Mpofu",
    version: "v2.1",
    createdAt: "2026-06-01",
    updatedAt: "2026-06-20",
    complianceScore: 87,
    aiRecommendations: [
      "Use framework agreement for recurring items to reduce lead times",
      "Mandatory domestic preference clause applies — local suppliers must be considered",
      "Budget appears sufficient based on prior-year actuals",
    ],
  },
  {
    id: "plan-002",
    planNumber: "APP-2026-002",
    title: "ICT Equipment Procurement — Ministry of Education",
    department: "ICT Services",
    ministry: "Ministry of Education",
    financialYear: "2026/2027",
    costCentre: "CC-MOE-012",
    fundingSource: "World Bank Grant — ESSP",
    procurementCategory: "ICT & Digital",
    procurementMethod: "Request for Proposals",
    estimatedBudget: "2,400,000",
    currency: "USD",
    priority: "High",
    status: "Approved",
    workflowStage: "Approved",
    workflowProgress: 100,
    planningStartDate: "2026-05-15",
    planningEndDate: "2026-06-30",
    expectedAwardDate: "2026-08-15",
    expectedDeliveryDate: "2026-09-30",
    riskLevel: "Low",
    riskSummary: "Donor conditions; import lead times",
    objectives: "Procure 1,200 laptops and network infrastructure for secondary schools in 4 provinces.",
    justification: "Digital education mandate under Zimbabwe Education 2030 Strategic Plan.",
    notes: "Donor procurement guidelines apply — World Bank Procurement Framework.",
    attachments: ["Education Technology Plan.pdf"],
    owner: "R. Chikwanda",
    assignedUser: "R. Chikwanda",
    version: "v3.0",
    createdAt: "2026-05-15",
    updatedAt: "2026-06-18",
    approvedBy: "T. Moyo",
    approvedAt: "2026-06-18",
    complianceScore: 98,
    aiRecommendations: [
      "RFP is appropriate; ensure technical specifications are technology-neutral",
      "Consider life-cycle cost in evaluation criteria",
    ],
  },
  {
    id: "plan-003",
    planNumber: "APP-2026-003",
    title: "Road Maintenance — Midlands Province Q3 2026",
    department: "Roads & Infrastructure",
    ministry: "Ministry of Transport & Infrastructural Development",
    financialYear: "2026/2027",
    costCentre: "CC-MTID-041",
    fundingSource: "ZINARA Road Fund",
    procurementCategory: "Infrastructure & Construction",
    procurementMethod: "Open Tender",
    estimatedBudget: "14,600,000",
    currency: "USD",
    priority: "High",
    status: "Draft",
    workflowStage: "Draft",
    workflowProgress: 10,
    planningStartDate: "2026-06-15",
    planningEndDate: "2026-08-15",
    expectedAwardDate: "2026-10-01",
    expectedDeliveryDate: "2027-03-31",
    riskLevel: "High",
    riskSummary: "Contractor capacity; rainy season delays; bitumen pricing",
    objectives: "Rehabilitate 340 km of trunk roads in Midlands province.",
    justification: "Roads are critical economic infrastructure. ZINARA mandated fund deployment.",
    notes: "Requires ZINARA board approval before commencement.",
    attachments: [],
    owner: "J. Banda",
    assignedUser: "J. Banda",
    version: "v1.0",
    createdAt: "2026-06-15",
    updatedAt: "2026-06-15",
    complianceScore: 61,
    aiRecommendations: [
      "Bill of Quantities required before tendering — not yet attached",
      "Consider lot packaging to attract more contractors",
      "ZINARA approval letter must be obtained before publishing",
    ],
  },
];

// ─── Seed Data: Requisitions ──────────────────────────────────────────────────
export const SEED_REQUISITIONS: ProcurementRequisition[] = [
  {
    id: "req-001",
    requisitionNumber: "PR-2026-0041",
    title: "ARV Medicines — Emergency Resupply",
    department: "Pharmacy & Medicines Control",
    ministry: "Ministry of Health & Child Care",
    requestingOfficer: "Dr. P. Dube",
    requestingOfficerTitle: "Director of Pharmacy",
    financialYear: "2026/2027",
    budgetCode: "BC-MHCC-2026-0041",
    costCentre: "CC-MHCC-001",
    fundingSource: "Treasury — Vote 8",
    priority: "Critical",
    status: "Under Review",
    workflowStage: "Finance Verification",
    workflowProgress: 60,
    items: [
      { id: "ri-001", itemNo: 1, description: "Tenofovir/Lamivudine/Dolutegravir (TLD) 90-tab packs", specifications: "WHO prequalified, min 24-month shelf life", quantity: 50000, unit: "Pack", estimatedUnitCost: "12.50", totalCost: "625,000", category: "Pharmaceuticals" },
      { id: "ri-002", itemNo: 2, description: "Lopinavir/Ritonavir Tablets 200/50mg", specifications: "WHO prequalified, heat-stable formulation", quantity: 10000, unit: "Pack", estimatedUnitCost: "18.00", totalCost: "180,000", category: "Pharmaceuticals" },
      { id: "ri-003", itemNo: 3, description: "Efavirenz 600mg Tablets", specifications: "WHO prequalified", quantity: 20000, unit: "Pack", estimatedUnitCost: "8.75", totalCost: "175,000", category: "Pharmaceuticals" },
    ],
    totalEstimatedCost: "980,000",
    currency: "USD",
    budgetAvailable: "1,200,000",
    budgetBalance: "220,000",
    procurementJustification: "Current ARV stock will reach critical levels within 45 days. Emergency resupply required to avoid treatment interruption for 48,000 patients.",
    deliveryAddress: "National Medicines Warehouse, Wilkins, Harare",
    deliveryRequirements: "Cold chain transport required. Delivery within 60 days of award.",
    requiredDeliveryDate: "2026-08-31",
    attachments: ["Stock Level Report.pdf", "Ministry Authorisation Letter.pdf"],
    notes: "Urgent — expedited approval requested.",
    owner: "Dr. P. Dube",
    version: "v1.2",
    createdAt: "2026-06-18",
    updatedAt: "2026-06-24",
    linkedPlanId: "plan-001",
    complianceScore: 91,
  },
  {
    id: "req-002",
    requisitionNumber: "PR-2026-0040",
    title: "Laptops & Network Equipment — Secondary Schools",
    department: "ICT Services",
    ministry: "Ministry of Education",
    requestingOfficer: "R. Chikwanda",
    requestingOfficerTitle: "ICT Director",
    financialYear: "2026/2027",
    budgetCode: "BC-MOE-2026-0040",
    costCentre: "CC-MOE-012",
    fundingSource: "World Bank Grant — ESSP",
    priority: "High",
    status: "Approved",
    workflowStage: "Approved",
    workflowProgress: 100,
    items: [
      { id: "ri-004", itemNo: 1, description: "Student Laptops 15.6\" Intel Core i5", specifications: "8GB RAM, 256GB SSD, Windows 11 Pro, 3yr warranty", quantity: 1200, unit: "Unit", estimatedUnitCost: "850.00", totalCost: "1,020,000", category: "ICT Equipment" },
      { id: "ri-005", itemNo: 2, description: "Managed Network Switches 24-port", specifications: "Cisco or equivalent, PoE+, Layer 2/3", quantity: 48, unit: "Unit", estimatedUnitCost: "1,200.00", totalCost: "57,600", category: "Networking" },
      { id: "ri-006", itemNo: 3, description: "Wireless Access Points", specifications: "Wi-Fi 6, dual band, enterprise grade", quantity: 240, unit: "Unit", estimatedUnitCost: "380.00", totalCost: "91,200", category: "Networking" },
    ],
    totalEstimatedCost: "1,168,800",
    currency: "USD",
    budgetAvailable: "2,400,000",
    budgetBalance: "1,231,200",
    procurementJustification: "Digital education programme. Equipping 40 secondary schools with ICT infrastructure as per Education 2030 Strategic Plan.",
    deliveryAddress: "Ministry of Education Warehouse, Causeway, Harare — to be distributed to schools",
    deliveryRequirements: "Delivery to MoE central warehouse. Ministry responsible for school distribution.",
    requiredDeliveryDate: "2026-09-30",
    attachments: ["Technical Specs.pdf", "School List.pdf"],
    notes: "World Bank prior review applies for contracts above USD 500,000.",
    owner: "R. Chikwanda",
    version: "v2.0",
    createdAt: "2026-05-20",
    updatedAt: "2026-06-15",
    linkedPlanId: "plan-002",
    complianceScore: 97,
  },
];

// ─── Seed Data: Strategies ────────────────────────────────────────────────────
export const SEED_STRATEGIES: ProcurementStrategy[] = [
  {
    id: "strat-001",
    strategyNumber: "PS-2026-001",
    title: "ARV Medicines Procurement Strategy — FY2026/27",
    department: "Pharmacy & Medicines Control",
    ministry: "Ministry of Health & Child Care",
    financialYear: "2026/2027",
    linkedRequisitionId: "req-001",
    linkedPlanId: "plan-001",
    procurementMethod: "Open Tender",
    methodJustification: "Value exceeds ZWL threshold for open competitive bidding. Framework agreement recommended for recurring items to ensure continuity.",
    strategyObjective: "Procure essential ARV medicines competitively to ensure best value for money while ensuring quality and timely delivery.",
    marketAnalysis: {
      marketSize: "USD 800M+ (global ARV market)",
      activeSuppliers: 12,
      competitionLevel: "Medium",
      marketNotes: "Market dominated by 3–4 WHO-prequalified manufacturers. Generic competition exists but quality verification is critical. Local suppliers have limited capacity.",
    },
    supplierAnalysis: [
      { supplierName: "Zimbabwe Pharma Holdings", capability: "High", experience: "8 years government supply", riskRating: "Low" },
      { supplierName: "Aspen Pharmacare", capability: "High", experience: "WHO prequalified, 15 years", riskRating: "Low" },
      { supplierName: "Generic Pharma Africa", capability: "Medium", experience: "3 years regional supply", riskRating: "Medium" },
    ],
    risks: [
      { id: "sr-001", risk: "Single-source dependency for specific ARVs", likelihood: "Medium", impact: "High", mitigation: "Multi-lot tender; qualify alternative suppliers" },
      { id: "sr-002", risk: "Cold chain failure during transport", likelihood: "Low", impact: "High", mitigation: "Mandatory cold chain compliance; quality inspections at delivery" },
      { id: "sr-003", risk: "Currency fluctuations increasing cost", likelihood: "High", impact: "Medium", mitigation: "USD-denominated contracts; forward exchange planning" },
    ],
    evaluationCriteria: [
      { criterion: "Technical Compliance (Quality & Specs)", weight: 40 },
      { criterion: "Price", weight: 35 },
      { criterion: "Delivery Schedule", weight: 15 },
      { criterion: "Company Financial Stability", weight: 10 },
    ],
    estimatedBudget: "8,200,000",
    currency: "USD",
    costAnalysisSummary: "Prior-year actual spend was USD 7.4M. Budget increase of 10.8% reflects currency devaluation and increased patient numbers.",
    plannedAdvertisementDate: "2026-08-01",
    plannedClosingDate: "2026-09-15",
    plannedEvaluationDate: "2026-10-01",
    plannedAwardDate: "2026-10-31",
    status: "Under Review",
    workflowStage: "Strategy Review",
    workflowProgress: 40,
    priority: "Critical",
    aiRecommendations: [
      "Open Tender is appropriate given contract value and regulatory requirements",
      "Framework agreement for recurring items will reduce future procurement lead times by ~60%",
      "Consider WHO joint procurement mechanism for cost savings",
      "Domestic preference policy requires 10% price preference for local suppliers",
    ],
    complianceScore: 89,
    notes: "NMAZ to provide updated prequalified supplier list before advertising.",
    attachments: ["Market Survey Report.pdf", "Prior Year Analysis.pdf"],
    owner: "Dr. P. Dube",
    version: "v1.1",
    createdAt: "2026-06-20",
    updatedAt: "2026-06-25",
  },
];

// ─── Lookup Lists ─────────────────────────────────────────────────────────────
export const PROCUREMENT_CATEGORIES = [
  "Health & Pharmaceuticals", "ICT & Digital", "Infrastructure & Construction",
  "Agriculture & Food", "Education & Training", "Transport & Logistics",
  "Security & Defence", "Professional Services", "Office Supplies & Consumables",
  "Energy & Utilities", "Water & Sanitation", "Environmental Services",
];

export const FUNDING_SOURCES = [
  "Treasury — Consolidated Revenue Fund", "ZINARA Road Fund",
  "World Bank Grant", "African Development Bank Loan", "IMF Facility",
  "Bilateral Aid — China", "Bilateral Aid — EU", "Bilateral Aid — USAID",
  "Own Revenue (Fees & Levies)", "Donor Pool Fund", "Public Private Partnership",
];

export const ZIMBABWE_MINISTRIES = [
  "Ministry of Health & Child Care", "Ministry of Education",
  "Ministry of Finance & Economic Development", "Ministry of Transport & Infrastructural Development",
  "Ministry of Agriculture, Fisheries, Water & Rural Development",
  "Ministry of Public Service, Labour & Social Welfare",
  "Ministry of Energy & Power Development", "Ministry of Environment, Climate, Tourism & Hospitality Industry",
  "Ministry of ICT, Postal & Courier Services", "Ministry of Justice, Legal & Parliamentary Affairs",
  "Ministry of Home Affairs & Cultural Heritage", "Ministry of Foreign Affairs & International Trade",
  "Ministry of Defence & War Veterans Affairs", "Ministry of Local Government & Public Works",
];

export const WORKFLOW_STAGES_PLAN: WorkflowStage[] = [
  "Draft", "Department Review", "Budget Review", "Approval", "Approved",
];

export const WORKFLOW_STAGES_REQUISITION: WorkflowStage[] = [
  "Draft", "Supervisor Review", "Finance Verification", "Procurement Approval", "Approved",
];

export const WORKFLOW_STAGES_STRATEGY: WorkflowStage[] = [
  "Draft", "Strategy Review", "Compliance Check", "Final Approval", "Approved",
];

// ─── Stage 4: Tender Preparation ─────────────────────────────────────────────
export type TenderWorkflowStage =
  | "Draft" | "Internal Review" | "Legal Review" | "Finance Review"
  | "Compliance Check" | "Approval" | "Approved" | "Published";

export type BOQItem = {
  id: string;
  itemNo: number;
  description: string;
  unit: string;
  quantity: number;
  unitRate: string;
  totalAmount: string;
  notes: string;
};

export type EvaluationCriterion = {
  id: string;
  criterion: string;
  weight: number;
  description: string;
  passMark?: number;
};

export type TenderAttachment = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  category: "Specification" | "Drawing" | "ToR" | "BOQ" | "Supporting" | "Legal";
};

export type TenderPreparation = {
  id: string;
  tenderNumber: string;
  tenderTitle: string;
  procurementMethod: ProcurementMethod;
  procurementCategory: string;
  procuringEntity: string;
  ministry: string;
  department: string;
  budgetAllocation: string;
  currency: string;
  tenderDescription: string;
  scopeOfWork: string;
  technicalSpecifications: string;
  termsOfReference: string;
  eligibilityRequirements: string;
  requiredDocuments: string[];
  closingDate: string;
  openingDate: string;
  approvalStatus: TenderWorkflowStage;
  workflowProgress: number;
  boqItems: BOQItem[];
  boqTotalAmount: string;
  evaluationCriteria: EvaluationCriterion[];
  tenderConditions: string;
  procurementSchedule: { milestone: string; date: string; responsible: string }[];
  attachments: TenderAttachment[];
  linkedStrategyId?: string;
  linkedRequisitionId?: string;
  complianceScore: number;
  aiRecommendations: string[];
  owner: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
};

// ─── Stage 5: Advertisement ───────────────────────────────────────────────────
export type AdvertisementStatus =
  | "Draft" | "Internal Review" | "Approval" | "Published"
  | "Advertisement Active" | "Closed";

export type PublicationChannel = {
  id: string;
  channel: "Procurement Portal" | "Newspaper" | "Government Gazette" | "Website" | "Radio" | "Notice Board";
  publicationDate: string;
  closingDate: string;
  reference: string;
  status: "Pending" | "Published" | "Confirmed";
  cost: string;
};

export type ClarificationRequest = {
  id: string;
  supplierName: string;
  supplierEmail: string;
  question: string;
  submittedAt: string;
  response: string;
  respondedAt: string;
  respondedBy: string;
  isPublic: boolean;
  status: "Pending" | "Answered" | "Dismissed";
};

export type SupplierEngagement = {
  id: string;
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  registrationStatus: "Verified" | "Pending" | "Rejected";
  documentsDownloaded: boolean;
  downloadedAt: string;
  notificationSent: boolean;
  lastActivity: string;
  activityLog: { action: string; timestamp: string }[];
};

export type Advertisement = {
  id: string;
  advertisementNumber: string;
  tenderId: string;
  tenderTitle: string;
  tenderNumber: string;
  ministry: string;
  department: string;
  publicationDate: string;
  closingDate: string;
  status: AdvertisementStatus;
  workflowProgress: number;
  publicationChannels: PublicationChannel[];
  clarificationRequests: ClarificationRequest[];
  supplierEngagements: SupplierEngagement[];
  preBidMeetingDate: string;
  preBidMeetingLocation: string;
  documentFee: string;
  contactEmail: string;
  contactPhone: string;
  additionalNotes: string;
  attachments: TenderAttachment[];
  linkedTenderId?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Stage 6: Bid Submission ───────────────────────────────────────────────────
export type BidStatus =
  | "Draft" | "Validation" | "Digital Signature" | "Encrypted Submission"
  | "Submission Confirmation" | "Receipt Generated" | "Late" | "Rejected";

export type BidDocument = {
  id: string;
  name: string;
  category: "Technical Proposal" | "Financial Proposal" | "Bid Security" | "Supporting" | "Legal" | "Certificates";
  size: string;
  uploadedAt: string;
  version: string;
  isSigned: boolean;
  isEncrypted: boolean;
  status: "Uploaded" | "Verified" | "Rejected";
};

export type BidSubmission = {
  id: string;
  bidReference: string;
  tenderId: string;
  tenderTitle: string;
  tenderNumber: string;
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  supplierRegistrationNo: string;
  technicalProposalSummary: string;
  financialProposalAmount: string;
  currency: string;
  bidSecurityAmount: string;
  bidSecurityProvider: string;
  bidSecurityExpiry: string;
  submissionTime: string;
  submissionDeadline: string;
  status: BidStatus;
  workflowProgress: number;
  isEncrypted: boolean;
  isDigitallySigned: boolean;
  digitalSignatureRef: string;
  submissionReceiptNo: string;
  documents: BidDocument[];
  validationResults: { check: string; passed: boolean; notes: string }[];
  complianceScore: number;
  ipAddress: string;
  deviceInfo: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Seed Data: Tender Preparations ──────────────────────────────────────────
export const SEED_TENDER_PREPARATIONS: TenderPreparation[] = [
  {
    id: "tp-001",
    tenderNumber: "ZW-PRA-2026-00185",
    tenderTitle: "Supply of Essential Medicines — ARV Framework 2026/27",
    procurementMethod: "Open Tender",
    procurementCategory: "Health & Pharmaceuticals",
    procuringEntity: "Ministry of Health & Child Care",
    ministry: "Ministry of Health & Child Care",
    department: "Pharmacy & Medicines Control",
    budgetAllocation: "8,200,000",
    currency: "USD",
    tenderDescription: "Open competitive tender for supply of antiretroviral and essential medicines under a two-year framework agreement.",
    scopeOfWork: "Supply, delivery and quality assurance of WHO-prequalified ARV and essential medicines to central warehouse and district hospitals.",
    technicalSpecifications: "All medicines must be WHO prequalified or equivalent. Minimum 24-month remaining shelf life on delivery. Cold chain compliance required for temperature-sensitive items.",
    termsOfReference: "Supplier shall provide quality certificates, batch records, and cold chain documentation. Delivery within 60 days of call-off order.",
    eligibilityRequirements: "Registered pharmaceutical supplier; valid MCAZ licence; minimum 3 years relevant experience; ISO 9001 or GMP certified; financial capacity USD 2M minimum.",
    requiredDocuments: [
      "Company Registration Certificate",
      "MCAZ Licence",
      "Audited Financial Statements (3 years)",
      "Tax Clearance Certificate",
      "Quality Certification (ISO/GMP)",
      "List of Similar Contracts",
      "Technical Proposal",
      "Financial Proposal",
      "Bid Security",
    ],
    closingDate: "2026-09-15",
    openingDate: "2026-09-16",
    approvalStatus: "Internal Review",
    workflowProgress: 25,
    boqItems: [
      { id: "boq-001", itemNo: 1, description: "TLD (Tenofovir/Lamivudine/Dolutegravir) 90-tab pack", unit: "Pack", quantity: 50000, unitRate: "12.50", totalAmount: "625,000", notes: "WHO prequalified" },
      { id: "boq-002", itemNo: 2, description: "Lopinavir/Ritonavir 200/50mg 60-tab pack", unit: "Pack", quantity: 10000, unitRate: "18.00", totalAmount: "180,000", notes: "Second-line ARV" },
      { id: "boq-003", itemNo: 3, description: "Efavirenz 600mg 30-tab pack", unit: "Pack", quantity: 20000, unitRate: "8.75", totalAmount: "175,000", notes: "First-line ARV" },
      { id: "boq-004", itemNo: 4, description: "Amoxicillin 500mg 21-cap pack", unit: "Pack", quantity: 30000, unitRate: "2.40", totalAmount: "72,000", notes: "Essential antibiotic" },
    ],
    boqTotalAmount: "1,052,000",
    evaluationCriteria: [
      { id: "ec-001", criterion: "Technical Compliance", weight: 40, description: "Quality certifications, product compliance, cold chain capacity", passMark: 70 },
      { id: "ec-002", criterion: "Price", weight: 35, description: "Unit prices, total bid price, payment terms", passMark: 0 },
      { id: "ec-003", criterion: "Delivery Schedule", weight: 15, description: "Lead times, delivery plan, logistics capacity", passMark: 0 },
      { id: "ec-004", criterion: "Financial Stability", weight: 10, description: "Turnover, net assets, banking references", passMark: 60 },
    ],
    tenderConditions: "Tender documents are non-refundable. Bid validity: 120 days from closing date. Bid security: USD 82,000 or 1% of bid value. Late bids will not be considered.",
    procurementSchedule: [
      { milestone: "Tender Preparation Approved", date: "2026-07-31", responsible: "CPO" },
      { milestone: "Advertisement Published", date: "2026-08-01", responsible: "Communications" },
      { milestone: "Pre-Bid Meeting", date: "2026-08-20", responsible: "Procurement Officer" },
      { milestone: "Clarification Deadline", date: "2026-08-31", responsible: "Procurement Officer" },
      { milestone: "Bid Closing", date: "2026-09-15", responsible: "System" },
      { milestone: "Bid Opening", date: "2026-09-16", responsible: "Opening Committee" },
      { milestone: "Technical Evaluation", date: "2026-09-30", responsible: "Evaluators" },
      { milestone: "Financial Evaluation", date: "2026-10-10", responsible: "Evaluators" },
      { milestone: "Award Recommendation", date: "2026-10-20", responsible: "CPO" },
    ],
    attachments: [
      { id: "att-001", name: "Technical Specifications.pdf", type: "PDF", size: "1.2 MB", uploadedBy: "Dr. P. Dube", uploadedAt: "2026-06-25", category: "Specification" },
      { id: "att-002", name: "Bill of Quantities v1.xlsx", type: "XLSX", size: "248 KB", uploadedBy: "A. Mpofu", uploadedAt: "2026-06-26", category: "BOQ" },
    ],
    linkedStrategyId: "strat-001",
    linkedRequisitionId: "req-001",
    complianceScore: 78,
    aiRecommendations: [
      "BOQ total (USD 1.05M) significantly below budget allocation — verify completeness",
      "Technical specifications should explicitly state minimum shelf life",
      "Evaluation criteria weights sum to 100% — compliant",
      "Pre-bid meeting is mandatory for complex health procurement",
      "Consider splitting into lots by product category for better competition",
    ],
    owner: "A. Mpofu",
    version: "v1.2",
    createdAt: "2026-06-24",
    updatedAt: "2026-06-26",
  },
  {
    id: "tp-002",
    tenderNumber: "ZW-PRA-2026-00186",
    tenderTitle: "ICT Equipment — Secondary Schools Digital Programme",
    procurementMethod: "Request for Proposals",
    procurementCategory: "ICT & Digital",
    procuringEntity: "Ministry of Education",
    ministry: "Ministry of Education",
    department: "ICT Services",
    budgetAllocation: "2,400,000",
    currency: "USD",
    tenderDescription: "RFP for supply, delivery and installation of laptops and network infrastructure for 40 secondary schools.",
    scopeOfWork: "Supply 1,200 laptops, 48 managed switches, 240 wireless access points, installation, configuration and staff training.",
    technicalSpecifications: "Laptops: 15.6\", Intel Core i5 11th gen+, 8GB RAM, 256GB SSD, Win 11 Pro, 3yr onsite warranty. Network: Wi-Fi 6, managed PoE switches.",
    termsOfReference: "Supplier shall supply, deliver to central warehouse, install and configure at schools, provide training to 80 teachers, and provide 3-year support.",
    eligibilityRequirements: "Registered ICT company; authorised dealer for proposed brands; minimum 5 years ICT supply; reference deployments in education sector.",
    requiredDocuments: [
      "Company Registration", "Tax Clearance", "Audited Accounts (3yr)",
      "OEM Authorisation Letters", "Technical Proposal", "Financial Proposal",
      "Implementation Plan", "Bid Security",
    ],
    closingDate: "2026-08-30",
    openingDate: "2026-09-01",
    approvalStatus: "Approved",
    workflowProgress: 100,
    boqItems: [
      { id: "boq-005", itemNo: 1, description: "Student Laptop 15.6\" Intel i5 8GB/256GB", unit: "Unit", quantity: 1200, unitRate: "850.00", totalAmount: "1,020,000", notes: "Including 3yr warranty" },
      { id: "boq-006", itemNo: 2, description: "Managed Network Switch 24-port PoE+", unit: "Unit", quantity: 48, unitRate: "1,200.00", totalAmount: "57,600", notes: "Cisco or equivalent" },
      { id: "boq-007", itemNo: 3, description: "Wireless Access Point Wi-Fi 6 Enterprise", unit: "Unit", quantity: 240, unitRate: "380.00", totalAmount: "91,200", notes: "Indoor, dual-band" },
      { id: "boq-008", itemNo: 4, description: "Installation, Config & Training (per school)", unit: "School", quantity: 40, unitRate: "1,500.00", totalAmount: "60,000", notes: "Including 2-day teacher training" },
    ],
    boqTotalAmount: "1,228,800",
    evaluationCriteria: [
      { id: "ec-005", criterion: "Technical Proposal", weight: 45, description: "Specifications compliance, implementation plan, team qualifications", passMark: 75 },
      { id: "ec-006", criterion: "Price", weight: 30, description: "Total contract price and life-cycle costs", passMark: 0 },
      { id: "ec-007", criterion: "Experience & References", weight: 15, description: "Education sector experience, similar deployments", passMark: 0 },
      { id: "ec-008", criterion: "After-Sales Support", weight: 10, description: "Support structure, response times, spare parts availability", passMark: 60 },
    ],
    tenderConditions: "Tender documents fee: USD 200. Bid security: USD 24,000. Bid validity: 90 days. Delivery to central warehouse within 45 days of award.",
    procurementSchedule: [
      { milestone: "Advertisement Published", date: "2026-07-15", responsible: "Communications" },
      { milestone: "Pre-Bid Meeting", date: "2026-07-30", responsible: "Procurement Officer" },
      { milestone: "Bid Closing", date: "2026-08-30", responsible: "System" },
      { milestone: "Bid Opening", date: "2026-09-01", responsible: "Opening Committee" },
      { milestone: "Evaluation", date: "2026-09-20", responsible: "Evaluators" },
      { milestone: "Award", date: "2026-10-05", responsible: "CPO" },
    ],
    attachments: [
      { id: "att-003", name: "Technical Specifications ICT.pdf", type: "PDF", size: "2.1 MB", uploadedBy: "R. Chikwanda", uploadedAt: "2026-06-15", category: "Specification" },
      { id: "att-004", name: "BOQ Schools ICT.xlsx", type: "XLSX", size: "180 KB", uploadedBy: "R. Chikwanda", uploadedAt: "2026-06-15", category: "BOQ" },
      { id: "att-005", name: "Draft RFP Document.docx", type: "DOCX", size: "542 KB", uploadedBy: "A. Mpofu", uploadedAt: "2026-06-18", category: "ToR" },
    ],
    linkedStrategyId: undefined,
    linkedRequisitionId: "req-002",
    complianceScore: 96,
    aiRecommendations: [
      "RFP is appropriate for this complex ICT procurement",
      "Technical scoring at 45% aligns with World Bank procurement framework requirements",
      "Consider requiring OEM authorisation letters at technical evaluation stage",
    ],
    owner: "R. Chikwanda",
    version: "v3.0",
    createdAt: "2026-06-14",
    updatedAt: "2026-06-20",
    approvedBy: "T. Moyo",
    approvedAt: "2026-06-20",
  },
];

// ─── Seed Data: Advertisements ────────────────────────────────────────────────
export const SEED_ADVERTISEMENTS: Advertisement[] = [
  {
    id: "adv-001",
    advertisementNumber: "ADV-2026-0041",
    tenderId: "tp-002",
    tenderTitle: "ICT Equipment — Secondary Schools Digital Programme",
    tenderNumber: "ZW-PRA-2026-00186",
    ministry: "Ministry of Education",
    department: "ICT Services",
    publicationDate: "2026-07-15",
    closingDate: "2026-08-30",
    status: "Advertisement Active",
    workflowProgress: 85,
    publicationChannels: [
      { id: "pc-001", channel: "Procurement Portal", publicationDate: "2026-07-15", closingDate: "2026-08-30", reference: "PRAZ-PORTAL-2026-0186", status: "Published", cost: "USD 0" },
      { id: "pc-002", channel: "Newspaper", publicationDate: "2026-07-16", closingDate: "2026-07-16", reference: "Herald Ref: ADV-2026-0784", status: "Published", cost: "USD 1,200" },
      { id: "pc-003", channel: "Government Gazette", publicationDate: "2026-07-18", closingDate: "2026-07-18", reference: "Gazette Vol 104 No 28", status: "Published", cost: "USD 480" },
      { id: "pc-004", channel: "Website", publicationDate: "2026-07-15", closingDate: "2026-08-30", reference: "moe.gov.zw/tenders/2026-00186", status: "Published", cost: "USD 0" },
    ],
    clarificationRequests: [
      { id: "cq-001", supplierName: "Sable ICT Solutions", supplierEmail: "bids@sableict.co.zw", question: "Is the Core i5 11th generation requirement strict or can 12th generation be offered?", submittedAt: "2026-07-22 09:15", response: "Addendum 1: Minimum Intel Core i5 10th generation or equivalent. Higher specifications are acceptable and will not be penalised.", respondedAt: "2026-07-25 14:30", respondedBy: "A. Mpofu", isPublic: true, status: "Answered" },
      { id: "cq-002", supplierName: "TechZim Supplies Ltd", supplierEmail: "procurement@techzim.co.zw", question: "Can refurbished equipment be offered for the wireless access points?", submittedAt: "2026-07-24 11:40", response: "", respondedAt: "", respondedBy: "", isPublic: false, status: "Pending" },
    ],
    supplierEngagements: [
      { id: "se-001", supplierName: "Sable ICT Solutions", supplierEmail: "bids@sableict.co.zw", supplierPhone: "+263-4-776120", registrationStatus: "Verified", documentsDownloaded: true, downloadedAt: "2026-07-16 08:42", notificationSent: true, lastActivity: "2026-07-22 09:15", activityLog: [{ action: "Documents downloaded", timestamp: "2026-07-16 08:42" }, { action: "Clarification request submitted", timestamp: "2026-07-22 09:15" }] },
      { id: "se-002", supplierName: "Dell Technologies Zimbabwe", supplierEmail: "govt@dell.co.zw", supplierPhone: "+263-4-864200", registrationStatus: "Verified", documentsDownloaded: true, downloadedAt: "2026-07-17 10:20", notificationSent: true, lastActivity: "2026-07-17 10:20", activityLog: [{ action: "Tender notification sent", timestamp: "2026-07-15 08:00" }, { action: "Documents downloaded", timestamp: "2026-07-17 10:20" }] },
      { id: "se-003", supplierName: "TechZim Supplies Ltd", supplierEmail: "procurement@techzim.co.zw", supplierPhone: "+263-4-251900", registrationStatus: "Pending", documentsDownloaded: true, downloadedAt: "2026-07-20 14:05", notificationSent: true, lastActivity: "2026-07-24 11:40", activityLog: [{ action: "Documents downloaded", timestamp: "2026-07-20 14:05" }, { action: "Clarification submitted", timestamp: "2026-07-24 11:40" }] },
    ],
    preBidMeetingDate: "2026-07-30T10:00",
    preBidMeetingLocation: "Ministry of Education Boardroom, Causeway, Harare",
    documentFee: "USD 200",
    contactEmail: "procurement@moe.gov.zw",
    contactPhone: "+263-4-728731",
    additionalNotes: "Tender documents available from Ministry of Education Procurement Office, 7th Floor, Kaguvi Building, or via portal.",
    attachments: [
      { id: "att-adv-001", name: "Advertisement Notice.pdf", type: "PDF", size: "420 KB", uploadedBy: "A. Mpofu", uploadedAt: "2026-07-15", category: "Supporting" },
      { id: "att-adv-002", name: "Addendum 1 — Clarification.pdf", type: "PDF", size: "85 KB", uploadedBy: "A. Mpofu", uploadedAt: "2026-07-25", category: "Supporting" },
    ],
    linkedTenderId: "tp-002",
    owner: "A. Mpofu",
    createdAt: "2026-07-14",
    updatedAt: "2026-07-25",
  },
];

// ─── Seed Data: Bid Submissions ───────────────────────────────────────────────
export const SEED_BID_SUBMISSIONS: BidSubmission[] = [
  {
    id: "bid-001",
    bidReference: "BID-2026-00186-001",
    tenderId: "tp-002",
    tenderTitle: "ICT Equipment — Secondary Schools Digital Programme",
    tenderNumber: "ZW-PRA-2026-00186",
    supplierName: "Sable ICT Solutions",
    supplierEmail: "bids@sableict.co.zw",
    supplierPhone: "+263-4-776120",
    supplierRegistrationNo: "VEN-00480",
    technicalProposalSummary: "Proposing Dell Latitude 5540 laptops (i7 12th gen upgrade), Cisco Catalyst 1000 switches, and Cisco Aironet WAPs. Full installation and 3-year onsite support included.",
    financialProposalAmount: "1,184,400",
    currency: "USD",
    bidSecurityAmount: "24,000",
    bidSecurityProvider: "CBZ Bank Zimbabwe",
    bidSecurityExpiry: "2026-12-15",
    submissionTime: "2026-08-28 14:22",
    submissionDeadline: "2026-08-30 16:00",
    status: "Receipt Generated",
    workflowProgress: 100,
    isEncrypted: true,
    isDigitallySigned: true,
    digitalSignatureRef: "DSIG-2026-SABLE-00186-001",
    submissionReceiptNo: "RCPT-2026-00186-001",
    documents: [
      { id: "bd-001", name: "Technical Proposal.pdf", category: "Technical Proposal", size: "4.2 MB", uploadedAt: "2026-08-28 13:45", version: "v1.0", isSigned: true, isEncrypted: true, status: "Verified" },
      { id: "bd-002", name: "Financial Proposal.pdf", category: "Financial Proposal", size: "1.1 MB", uploadedAt: "2026-08-28 14:00", version: "v1.0", isSigned: true, isEncrypted: true, status: "Verified" },
      { id: "bd-003", name: "Bid Security — CBZ.pdf", category: "Bid Security", size: "420 KB", uploadedAt: "2026-08-28 14:10", version: "v1.0", isSigned: true, isEncrypted: false, status: "Verified" },
      { id: "bd-004", name: "Company Registration.pdf", category: "Legal", size: "380 KB", uploadedAt: "2026-08-28 13:20", version: "v1.0", isSigned: false, isEncrypted: false, status: "Verified" },
      { id: "bd-005", name: "Tax Clearance.pdf", category: "Certificates", size: "210 KB", uploadedAt: "2026-08-28 13:22", version: "v1.0", isSigned: false, isEncrypted: false, status: "Verified" },
      { id: "bd-006", name: "OEM Authorisation — Dell.pdf", category: "Supporting", size: "890 KB", uploadedAt: "2026-08-28 13:30", version: "v1.0", isSigned: false, isEncrypted: false, status: "Verified" },
    ],
    validationResults: [
      { check: "Mandatory documents submitted", passed: true, notes: "All 8 required documents uploaded" },
      { check: "File format compliance", passed: true, notes: "All files in PDF/DOCX/XLSX format" },
      { check: "Submission before deadline", passed: true, notes: "Submitted 25h 38m before deadline" },
      { check: "Bid security provided", passed: true, notes: "CBZ Bank guarantee USD 24,000 — valid to 2026-12-15" },
      { check: "Digital signature applied", passed: true, notes: "Valid company digital signature" },
      { check: "Encryption verified", passed: true, notes: "Technical and financial proposals encrypted" },
      { check: "Eligibility requirements", passed: true, notes: "All eligibility criteria met per declaration" },
    ],
    complianceScore: 98,
    ipAddress: "196.41.82.14",
    deviceInfo: "Chrome 126 / Windows 11",
    createdAt: "2026-08-25",
    updatedAt: "2026-08-28",
  },
];

// ─── Workflow Stage Lists ─────────────────────────────────────────────────────
export const TENDER_WORKFLOW_STAGES: TenderWorkflowStage[] = [
  "Draft", "Internal Review", "Legal Review", "Finance Review",
  "Compliance Check", "Approval", "Approved", "Published",
];

export const ADVERTISEMENT_WORKFLOW_STAGES: AdvertisementStatus[] = [
  "Draft", "Internal Review", "Approval", "Published", "Advertisement Active", "Closed",
];

export const BID_WORKFLOW_STAGES: BidStatus[] = [
  "Draft", "Validation", "Digital Signature", "Encrypted Submission",
  "Submission Confirmation", "Receipt Generated",
];

// ─── Stage 11: Contract Award ─────────────────────────────────────────────────
export type AwardStatus =
  | "Draft" | "Under Review" | "Pending Approval" | "Approved" | "Award Issued"
  | "Standstill" | "Contract Signed" | "Rejected";

export type AwardWorkflowStage =
  | "Draft" | "Legal Review" | "Finance Review" | "CPO Approval"
  | "Minister Approval" | "Award Issued" | "Signed";

export type AwardDocument = {
  id: string;
  name: string;
  type: "Award Letter" | "Notice of Award" | "Regret Letter" | "Public Award Notice"
      | "Contract Summary" | "Contract Document" | "Supporting";
  version: string;
  generatedAt: string;
  generatedBy: string;
  isSigned: boolean;
  signedAt: string;
  signedBy: string;
  status: "Draft" | "Finalised" | "Signed" | "Sent";
};

export type AwardCondition = {
  id: string;
  condition: string;
  responsible: string;
  dueDate: string;
  status: "Pending" | "Met" | "Waived";
};

export type ContractClause = {
  id: string;
  clauseNumber: string;
  title: string;
  category: "General" | "Special" | "Financial" | "Performance" | "Dispute";
  content: string;
  isStandard: boolean;
};

export type ContractAward = {
  id: string;
  awardReferenceNumber: string;
  tenderReference: string;
  contractNumber: string;
  winningSupplier: string;
  supplierEmail: string;
  supplierPhone: string;
  contractTitle: string;
  contractAmount: string;
  currency: string;
  awardDate: string;
  awardApprovalDate: string;
  effectiveDate: string;
  contractDurationMonths: number;
  startDate: string;
  endDate: string;
  awardStatus: AwardStatus;
  workflowStage: AwardWorkflowStage;
  workflowProgress: number;
  awardJustification: string;
  awardConditions: AwardCondition[];
  documents: AwardDocument[];
  digitalSignatureRef: string;
  version: string;
  approvedBy: string;
  approvedAt: string;
  ministry: string;
  department: string;
  procurementMethod: ProcurementMethod;
  complianceScore: number;
  aiRecommendations: string[];
  contractClauses: ContractClause[];
  owner: string;
  createdAt: string;
  updatedAt: string;
};

export const AWARD_WORKFLOW_STAGES: AwardWorkflowStage[] = [
  "Draft", "Legal Review", "Finance Review", "CPO Approval", "Minister Approval", "Award Issued", "Signed",
];

// ─── Stage 12: Contract Execution ────────────────────────────────────────────
export type ExecutionStatus =
  | "Mobilisation" | "In Progress" | "On Track" | "At Risk" | "Delayed"
  | "Suspended" | "Completed" | "Terminated";

export type MilestoneStatus = "Pending" | "On Track" | "At Risk" | "Delayed" | "Completed";

export type ContractMilestone = {
  id: string;
  milestoneName: string;
  plannedDate: string;
  actualDate: string;
  completionPercent: number;
  responsibleOfficer: string;
  supportingDocuments: string[];
  status: MilestoneStatus;
  comments: string;
};

export type ContractDeliverable = {
  id: string;
  deliverableName: string;
  dueDate: string;
  submissionDate: string;
  reviewStatus: "Pending" | "Under Review" | "Reviewed" | "Rejected";
  approvalStatus: "Pending" | "Approved" | "Rejected";
  qualityStatus: "Pending" | "Passed" | "Failed";
  acceptanceStatus: "Pending" | "Accepted" | "Rejected";
  documents: string[];
};

export type PaymentCertificate = {
  id: string;
  certificateNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  paymentRequest: string;
  approvedAmount: string;
  tax: string;
  retention: string;
  deductions: string;
  netPayment: string;
  status: "Pending" | "Verified" | "Approved" | "Paid" | "Rejected";
  paymentDate: string;
  financeApprovalRef: string;
  isFinal: boolean;
  paymentMethod: string;
};

export type ContractVariation = {
  id: string;
  variationNumber: string;
  variationType: "Scope Change" | "Budget Change" | "Time Extension" | "Additional Deliverables";
  description: string;
  originalContractValue: string;
  revisedContractValue: string;
  originalCompletionDate: string;
  revisedCompletionDate: string;
  justification: string;
  supportingDocuments: string[];
  status: "Draft" | "Under Review" | "Approved" | "Rejected";
  approvedBy: string;
  approvedAt: string;
  requestedBy: string;
  requestedAt: string;
  version: number;
};

export type ContractRisk = {
  id: string;
  riskCategory: string;
  riskDescription: string;
  probability: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  riskScore: number;
  mitigationPlan: string;
  responsibleOfficer: string;
  monitoringStatus: "Open" | "Mitigating" | "Escalated" | "Closed";
  dateLogged: string;
};

export type SupplierPerformanceScore = {
  quality: number;
  costControl: number;
  deliveryPerformance: number;
  responsiveness: number;
  compliance: number;
  communication: number;
  innovation: number;
  overallRating: number;
  evaluatedBy: string;
  evaluatedAt: string;
  comments: string;
};

export type CommunicationLog = {
  id: string;
  type: "Internal" | "Supplier" | "Email" | "Meeting Notes" | "Clarification";
  subject: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  attachments: string[];
};

export type ContractExecution = {
  id: string;
  contractNumber: string;
  contractTitle: string;
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  contractValue: string;
  currency: string;
  startDate: string;
  endDate: string;
  contractDurationMonths: number;
  status: ExecutionStatus;
  overallProgress: number;
  budgetUtilization: number;
  ministry: string;
  department: string;
  projectManager: string;
  contractManager: string;
  linkedAwardId: string;
  milestones: ContractMilestone[];
  deliverables: ContractDeliverable[];
  payments: PaymentCertificate[];
  variations: ContractVariation[];
  risks: ContractRisk[];
  performanceScore: SupplierPerformanceScore | null;
  communications: CommunicationLog[];
  complianceScore: number;
  aiRecommendations: string[];
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  owner: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Seed Data: Contract Awards ───────────────────────────────────────────────
export const SEED_CONTRACT_AWARDS: ContractAward[] = [
  {
    id: "award-001",
    awardReferenceNumber: "AWD-2026-0041",
    tenderReference: "ZW-PRA-2026-00186",
    contractNumber: "CN-2026-0441",
    winningSupplier: "Sable ICT Solutions",
    supplierEmail: "contracts@sableict.co.zw",
    supplierPhone: "+263-4-776120",
    contractTitle: "ICT Equipment — Secondary Schools Digital Programme",
    contractAmount: "1,184,400",
    currency: "USD",
    awardDate: "2026-10-05",
    awardApprovalDate: "2026-10-03",
    effectiveDate: "2026-10-15",
    contractDurationMonths: 6,
    startDate: "2026-10-15",
    endDate: "2027-04-15",
    awardStatus: "Contract Signed",
    workflowStage: "Signed",
    workflowProgress: 100,
    awardJustification: "Sable ICT Solutions achieved the highest combined technical and financial score of 87.4/100. Their proposal offered superior technical specifications, lower life-cycle costs, and a comprehensive 3-year support plan.",
    ministry: "Ministry of Education",
    department: "ICT Services",
    procurementMethod: "Request for Proposals",
    complianceScore: 98,
    aiRecommendations: [
      "Contract value within approved budget — no variance approval required",
      "Performance bond should be lodged within 14 days of signing",
      "Advance payment not recommended given supplier's strong financial position",
      "Include milestone-based payment schedule to manage delivery risk",
    ],
    awardConditions: [
      { id: "ac-001", condition: "Performance Bond: 10% of contract value (USD 118,440) within 14 days", responsible: "Sable ICT Solutions", dueDate: "2026-10-29", status: "Met" },
      { id: "ac-002", condition: "Insurance Certificate (All-Risks) submitted", responsible: "Sable ICT Solutions", dueDate: "2026-10-15", status: "Met" },
      { id: "ac-003", condition: "Detailed Implementation Plan approved by MoE", responsible: "Project Manager", dueDate: "2026-10-22", status: "Met" },
    ],
    documents: [
      { id: "adoc-001", name: "Award Letter — Sable ICT Solutions.pdf", type: "Award Letter", version: "v1.0", generatedAt: "2026-10-05", generatedBy: "System", isSigned: true, signedAt: "2026-10-05", signedBy: "T. Moyo (CPO)", status: "Sent" },
      { id: "adoc-002", name: "Notice of Award — ZW-PRA-2026-00186.pdf", type: "Notice of Award", version: "v1.0", generatedAt: "2026-10-05", generatedBy: "System", isSigned: true, signedAt: "2026-10-05", signedBy: "T. Moyo (CPO)", status: "Sent" },
      { id: "adoc-003", name: "Regret Letter — Dell Technologies.pdf", type: "Regret Letter", version: "v1.0", generatedAt: "2026-10-05", generatedBy: "System", isSigned: true, signedAt: "2026-10-06", signedBy: "T. Moyo (CPO)", status: "Sent" },
      { id: "adoc-004", name: "Public Award Notice.pdf", type: "Public Award Notice", version: "v1.0", generatedAt: "2026-10-07", generatedBy: "System", isSigned: true, signedAt: "2026-10-07", signedBy: "T. Moyo (CPO)", status: "Sent" },
      { id: "adoc-005", name: "CN-2026-0441 Contract Document.pdf", type: "Contract Document", version: "v2.0", generatedAt: "2026-10-12", generatedBy: "System", isSigned: true, signedAt: "2026-10-14", signedBy: "R. Chikwanda / CEO Sable ICT", status: "Finalised" },
    ],
    digitalSignatureRef: "DSIG-AWARD-2026-0441",
    version: "v2.0",
    approvedBy: "Minister of Education",
    approvedAt: "2026-10-03",
    contractClauses: [
      { id: "cc-001", clauseNumber: "1.1", title: "Scope of Work", category: "General", content: "The Supplier shall supply, deliver, install, configure and commission 1,200 student laptops, 48 managed network switches, and 240 wireless access points at 40 designated secondary schools.", isStandard: true },
      { id: "cc-002", clauseNumber: "2.1", title: "Payment Terms", category: "Financial", content: "Payment shall be made in three tranches: 30% on delivery to central warehouse, 50% on installation completion at all 40 schools, 20% upon final acceptance.", isStandard: false },
      { id: "cc-003", clauseNumber: "3.1", title: "Performance Security", category: "Performance", content: "The Supplier shall provide a performance bond equal to 10% of the contract value within 14 days of contract signing.", isStandard: true },
      { id: "cc-004", clauseNumber: "4.1", title: "Penalty Clauses", category: "Performance", content: "For each day of delay beyond the agreed delivery schedule, a penalty of 0.1% of the undelivered portion's value shall be deducted, up to a maximum of 10%.", isStandard: true },
      { id: "cc-005", clauseNumber: "5.1", title: "Dispute Resolution", category: "Dispute", content: "Any dispute shall first be referred to the Contract Manager. If unresolved within 30 days, the matter proceeds to arbitration under the Zimbabwe Arbitration Act.", isStandard: true },
    ],
    owner: "T. Moyo",
    createdAt: "2026-10-01",
    updatedAt: "2026-10-14",
  },
  {
    id: "award-002",
    awardReferenceNumber: "AWD-2026-0040",
    tenderReference: "ZW-PRA-2026-00185",
    contractNumber: "CN-2026-0440",
    winningSupplier: "Zimbabwe Pharma Holdings",
    supplierEmail: "contracts@zph.co.zw",
    supplierPhone: "+263-4-776000",
    contractTitle: "Supply of Essential Medicines — ARV Framework 2026/27",
    contractAmount: "8,200,000",
    currency: "USD",
    awardDate: "2026-11-01",
    awardApprovalDate: "2026-10-29",
    effectiveDate: "2026-11-15",
    contractDurationMonths: 24,
    startDate: "2026-11-15",
    endDate: "2028-11-15",
    awardStatus: "Award Issued",
    workflowStage: "Award Issued",
    workflowProgress: 85,
    awardJustification: "Zimbabwe Pharma Holdings submitted the most technically compliant and financially competitive bid, scoring 90.4/100. All medicines offered are WHO prequalified with proven cold chain capacity.",
    ministry: "Ministry of Health & Child Care",
    department: "Pharmacy & Medicines Control",
    procurementMethod: "Open Tender",
    complianceScore: 95,
    aiRecommendations: [
      "Recommend call-off order mechanism for framework — avoids large single orders",
      "Performance bond lodgement deadline is 2026-11-29",
      "Cold chain compliance audit recommended within first 30 days",
    ],
    awardConditions: [
      { id: "ac-004", condition: "Performance Bond: 5% of contract value (USD 410,000)", responsible: "Zimbabwe Pharma Holdings", dueDate: "2026-11-29", status: "Pending" },
      { id: "ac-005", condition: "Cold Chain Facility Inspection by MCAZ", responsible: "Project Manager", dueDate: "2026-12-15", status: "Pending" },
    ],
    documents: [
      { id: "adoc-006", name: "Award Letter — ZPH.pdf", type: "Award Letter", version: "v1.0", generatedAt: "2026-11-01", generatedBy: "System", isSigned: true, signedAt: "2026-11-01", signedBy: "T. Moyo (CPO)", status: "Sent" },
      { id: "adoc-007", name: "Notice of Award — ARV Framework.pdf", type: "Notice of Award", version: "v1.0", generatedAt: "2026-11-01", generatedBy: "System", isSigned: false, signedAt: "", signedBy: "", status: "Draft" },
    ],
    digitalSignatureRef: "",
    version: "v1.0",
    approvedBy: "Permanent Secretary — MoHCC",
    approvedAt: "2026-10-29",
    contractClauses: [],
    owner: "Dr. P. Dube",
    createdAt: "2026-10-25",
    updatedAt: "2026-11-01",
  },
];

// ─── Seed Data: Contract Executions ──────────────────────────────────────────
export const SEED_CONTRACT_EXECUTIONS: ContractExecution[] = [
  {
    id: "exec-001",
    contractNumber: "CN-2026-0441",
    contractTitle: "ICT Equipment — Secondary Schools Digital Programme",
    supplierName: "Sable ICT Solutions",
    supplierEmail: "contracts@sableict.co.zw",
    supplierPhone: "+263-4-776120",
    contractValue: "1,184,400",
    currency: "USD",
    startDate: "2026-10-15",
    endDate: "2027-04-15",
    contractDurationMonths: 6,
    status: "In Progress",
    overallProgress: 52,
    budgetUtilization: 48,
    ministry: "Ministry of Education",
    department: "ICT Services",
    projectManager: "R. Chikwanda",
    contractManager: "T. Moyo",
    linkedAwardId: "award-001",
    riskLevel: "Low",
    complianceScore: 94,
    aiRecommendations: [
      "Progress is on schedule — all key milestones met",
      "Retention release of 5% due at final acceptance",
      "Recommend site visits to 5 schools to verify installation quality",
      "3-year support commencement date should be confirmed in writing",
    ],
    milestones: [
      { id: "ms-001", milestoneName: "Contract Commencement / Mobilisation", plannedDate: "2026-10-15", actualDate: "2026-10-15", completionPercent: 100, responsibleOfficer: "R. Chikwanda", supportingDocuments: ["Commencement Notice.pdf"], status: "Completed", comments: "Supplier mobilised on time" },
      { id: "ms-002", milestoneName: "Delivery to Central Warehouse (All Equipment)", plannedDate: "2026-11-30", actualDate: "2026-11-28", completionPercent: 100, responsibleOfficer: "R. Chikwanda", supportingDocuments: ["GRN-001.pdf", "Delivery Note.pdf"], status: "Completed", comments: "All 1,488 units delivered — verified against BOQ" },
      { id: "ms-003", milestoneName: "Installation Complete — Harare Schools (10)", plannedDate: "2026-12-31", actualDate: "2026-12-30", completionPercent: 100, responsibleOfficer: "R. Chikwanda", supportingDocuments: ["Installation Certificate Batch 1.pdf"], status: "Completed", comments: "10 Harare schools commissioned" },
      { id: "ms-004", milestoneName: "Installation Complete — Bulawayo & Midlands (15)", plannedDate: "2027-01-31", actualDate: "", completionPercent: 65, responsibleOfficer: "R. Chikwanda", supportingDocuments: [], status: "On Track", comments: "10 of 15 schools complete" },
      { id: "ms-005", milestoneName: "Installation Complete — Remaining Provinces (15)", plannedDate: "2027-02-28", actualDate: "", completionPercent: 0, responsibleOfficer: "R. Chikwanda", supportingDocuments: [], status: "Pending", comments: "" },
      { id: "ms-006", milestoneName: "Teacher Training — All 40 Schools", plannedDate: "2027-03-31", actualDate: "", completionPercent: 25, responsibleOfficer: "R. Chikwanda", supportingDocuments: [], status: "On Track", comments: "Training commenced for Harare batch" },
      { id: "ms-007", milestoneName: "Final Acceptance & Handover", plannedDate: "2027-04-15", actualDate: "", completionPercent: 0, responsibleOfficer: "T. Moyo", supportingDocuments: [], status: "Pending", comments: "" },
    ],
    deliverables: [
      { id: "del-001", deliverableName: "1,200 Student Laptops", dueDate: "2026-11-30", submissionDate: "2026-11-28", reviewStatus: "Reviewed", approvalStatus: "Approved", qualityStatus: "Passed", acceptanceStatus: "Accepted", documents: ["GRN-001.pdf"] },
      { id: "del-002", deliverableName: "48 Managed Network Switches", dueDate: "2026-11-30", submissionDate: "2026-11-28", reviewStatus: "Reviewed", approvalStatus: "Approved", qualityStatus: "Passed", acceptanceStatus: "Accepted", documents: ["GRN-001.pdf"] },
      { id: "del-003", deliverableName: "240 Wireless Access Points", dueDate: "2026-11-30", submissionDate: "2026-11-28", reviewStatus: "Reviewed", approvalStatus: "Approved", qualityStatus: "Passed", acceptanceStatus: "Accepted", documents: ["GRN-001.pdf"] },
      { id: "del-004", deliverableName: "Installation & Configuration — 40 Schools", dueDate: "2027-02-28", submissionDate: "", reviewStatus: "Pending", approvalStatus: "Pending", qualityStatus: "Pending", acceptanceStatus: "Pending", documents: [] },
      { id: "del-005", deliverableName: "Teacher Training Programme", dueDate: "2027-03-31", submissionDate: "", reviewStatus: "Pending", approvalStatus: "Pending", qualityStatus: "Pending", acceptanceStatus: "Pending", documents: [] },
    ],
    payments: [
      { id: "pay-001", certificateNumber: "PC-001", invoiceNumber: "INV-SABLE-2026-001", invoiceDate: "2026-12-01", paymentRequest: "355,320", approvedAmount: "355,320", tax: "0", retention: "17,766", deductions: "0", netPayment: "337,554", status: "Paid", paymentDate: "2026-12-15", financeApprovalRef: "FA-2026-1201", isFinal: false, paymentMethod: "EFT" },
      { id: "pay-002", certificateNumber: "PC-002", invoiceNumber: "INV-SABLE-2027-001", invoiceDate: "2027-01-15", paymentRequest: "592,200", approvedAmount: "592,200", tax: "0", retention: "29,610", deductions: "0", netPayment: "562,590", status: "Approved", paymentDate: "", financeApprovalRef: "FA-2027-0115", isFinal: false, paymentMethod: "EFT" },
    ],
    variations: [],
    risks: [
      { id: "rsk-001", riskCategory: "Technical", riskDescription: "Connectivity issues at rural school sites may delay network configuration", probability: "Medium", impact: "Low", riskScore: 4, mitigationPlan: "Offline configuration mode enabled; site visits scheduled", responsibleOfficer: "R. Chikwanda", monitoringStatus: "Open", dateLogged: "2026-11-20" },
    ],
    performanceScore: {
      quality: 4.7, costControl: 4.5, deliveryPerformance: 4.8, responsiveness: 4.6,
      compliance: 4.9, communication: 4.7, innovation: 4.2, overallRating: 4.63,
      evaluatedBy: "R. Chikwanda", evaluatedAt: "2026-12-31", comments: "Excellent delivery performance. Responsive to queries."
    },
    communications: [
      { id: "comm-001", type: "Internal", subject: "Delivery Inspection Report", from: "R. Chikwanda", to: "T. Moyo", content: "All equipment inspected and verified against delivery note. No defects found. Recommend 30% payment.", timestamp: "2026-11-28 16:00", attachments: ["Inspection Report.pdf"] },
      { id: "comm-002", type: "Supplier", subject: "Installation Schedule — Batch 2", from: "Sable ICT Solutions", to: "R. Chikwanda", content: "We confirm installation will commence at Bulawayo schools on 2027-01-08 as scheduled.", timestamp: "2026-12-20 09:30", attachments: [] },
    ],
    owner: "T. Moyo",
    createdAt: "2026-10-15",
    updatedAt: "2027-01-15",
  },
];
