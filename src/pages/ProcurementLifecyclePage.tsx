import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import {
  FileText, ShoppingCart, Gavel, ClipboardList, CheckCircle2, Clock, Sparkles,
  AlertTriangle, Users, ChevronRight, X, Search, Filter, Download, Upload,
  FileSignature, Wallet, ShieldCheck, TrendingUp, Building2, Star,
  MessageSquare, Bell, BarChart3, Settings, RefreshCcw, Eye, Lock, Unlock,
  AlertOctagon, Scale, PenLine, Send, CalendarDays, DollarSign, Package,
  Calendar, Hash, Layers, Tag,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";

// ── Types ────────────────────────────────────────────────────────────────────
type ProcType = "Tender" | "RFQ" | "RFP" | "EOI" | "Auction";

type ProcRecord = {
  id: string;
  title: string;
  entity: string;
  ministry: string;
  department: string;
  projectCode: string;
  projectName: string;
  type: ProcType;
  value: string;
  status: string;
  currentStage: number;
  totalStages: number;
  currentStageLabel: string;
  stageLevel: string;
  closing: string;
  openedDate: string;
  bids: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  aiAlerts: string[];
};

type StageStatus = "completed" | "active" | "pending" | "skipped";

type LifecycleStage = {
  id: number;
  label: string;
  shortLabel: string;
  status: StageStatus;
  description: string;
  aiRole: string;
  owner: string;
  dueDate?: string;
  completedDate?: string;
};

// ── Mock procurement records ─────────────────────────────────────────────────
const PROC_RECORDS: ProcRecord[] = [
  {
    id: "ZW-PRA-2026-00184", title: "Supply & Installation of Solar Mini-Grids — 12 Rural Clinics",
    entity: "Ministry of Energy", ministry: "Ministry of Energy", department: "Renewable Energy Dept",
    projectCode: "MOE-SOLAR-2026-001", projectName: "Rural Electrification Phase III",
    type: "Tender", value: "USD 14,800,000",
    status: "Bidding", currentStage: 8, totalStages: 26, currentStageLabel: "Bid Submission",
    stageLevel: "Procurement",
    closing: "2026-07-08", openedDate: "2026-04-10", bids: 11, riskLevel: "Low", aiAlerts: [],
  },
  {
    id: "ZW-PRA-2026-00183", title: "Procurement of Antiretroviral Medicines (2-Year Framework)",
    entity: "Ministry of Health & Child Care", ministry: "Ministry of Health & Child Care", department: "Pharmacy & Medicines Control",
    projectCode: "MOH-ARV-2026-002", projectName: "National ARV Programme 2026–2028",
    type: "Tender", value: "USD 42,500,000",
    status: "Evaluation", currentStage: 12, totalStages: 26, currentStageLabel: "Technical Evaluation",
    stageLevel: "Evaluation",
    closing: "2026-06-12", openedDate: "2026-02-20", bids: 8, riskLevel: "Medium",
    aiAlerts: ["2 evaluators diverge >15pts — consensus meeting required"],
  },
  {
    id: "ZW-PRA-2026-00182", title: "National Tax Administration System — Phase II",
    entity: "ZIMRA", ministry: "Ministry of Finance", department: "Revenue & Tax Systems",
    projectCode: "ZIMRA-NTAS-2026-003", projectName: "Tax Digitalisation Programme",
    type: "Tender", value: "USD 9,200,000",
    status: "Bidding", currentStage: 5, totalStages: 26, currentStageLabel: "Advertisement",
    stageLevel: "Procurement",
    closing: "2026-07-21", openedDate: "2026-05-01", bids: 5, riskLevel: "Low", aiAlerts: [],
  },
  {
    id: "RFQ-2026-0892", title: "Office Stationery — Q3 2026",
    entity: "Finance Department", ministry: "Ministry of Finance", department: "Corporate Services",
    projectCode: "MOF-STAT-2026-004", projectName: "Corporate Supplies Q3 2026",
    type: "RFQ", value: "USD 4,200",
    status: "Evaluating", currentStage: 9, totalStages: 18, currentStageLabel: "Technical Evaluation",
    stageLevel: "Evaluation",
    closing: "2026-06-28", openedDate: "2026-06-10", bids: 4, riskLevel: "Low", aiAlerts: [],
  },
  {
    id: "RFP-2026-0041", title: "Provision of Legal Advisory Services — 3 Years",
    entity: "Ministry of Justice", ministry: "Ministry of Justice", department: "Legal Services Unit",
    projectCode: "MOJ-LEGAL-2026-005", projectName: "Legal Advisory Framework 2026–2029",
    type: "RFP", value: "USD 2,400,000",
    status: "Evaluation", currentStage: 10, totalStages: 22, currentStageLabel: "Financial Evaluation",
    stageLevel: "Evaluation",
    closing: "2026-06-30", openedDate: "2026-04-15", bids: 6, riskLevel: "Low", aiAlerts: [],
  },
  {
    id: "EOI-2026-0018", title: "Expression of Interest — Water Treatment Consultancy",
    entity: "Ministry of Water", ministry: "Ministry of Environment, Water & Climate", department: "Water Resources Management",
    projectCode: "MOW-CONS-2026-006", projectName: "Water Treatment Modernisation Study",
    type: "EOI", value: "Est. USD 800,000",
    status: "Open", currentStage: 3, totalStages: 14, currentStageLabel: "EOI Advertisement",
    stageLevel: "Procurement",
    closing: "2026-07-15", openedDate: "2026-06-01", bids: 0, riskLevel: "Low", aiAlerts: [],
  },
  {
    id: "AUC-2026-0007", title: "Disposal of Surplus Government Vehicles (42 Units)",
    entity: "Ministry of Finance", ministry: "Ministry of Finance", department: "Asset Management Unit",
    projectCode: "MOF-AUC-2026-007", projectName: "Government Fleet Disposal 2026",
    type: "Auction", value: "Reserve: USD 420,000",
    status: "Bidding", currentStage: 4, totalStages: 10, currentStageLabel: "Live Auction",
    stageLevel: "Auction",
    closing: "2026-06-25", openedDate: "2026-06-05", bids: 38, riskLevel: "Low", aiAlerts: [],
  },
  {
    id: "ZW-PRA-2026-00181", title: "Rehabilitation of Beitbridge–Harare Highway (Section 4)",
    entity: "Ministry of Transport", ministry: "Ministry of Transport & Infrastructural Development", department: "Roads Directorate",
    projectCode: "MOT-ROAD-2026-008", projectName: "Beitbridge-Harare Corridor Upgrade",
    type: "Tender", value: "USD 88,000,000",
    status: "Published", currentStage: 4, totalStages: 26, currentStageLabel: "Approval",
    stageLevel: "Procurement",
    closing: "2026-08-04", openedDate: "2026-05-20", bids: 0, riskLevel: "High",
    aiAlerts: ["BOQ incomplete — 3 sections missing before publication"],
  },
];

// ── Stage builder per procurement type ───────────────────────────────────────
function buildStages(record: ProcRecord): LifecycleStage[] {
  const base = [
    { id: 0,  label: "Governance & Setup",    shortLabel: "Governance",    aiRole: "Policy Advisor",         owner: "CPO" },
    { id: 1,  label: "Planning & Demand",      shortLabel: "Planning",      aiRole: "Demand Forecaster",      owner: "Planning Officer" },
    { id: 2,  label: "Sourcing Strategy",      shortLabel: "Strategy",      aiRole: "Strategy Advisor",       owner: "Procurement Officer" },
    { id: 3,  label: "Preparation & Drafting", shortLabel: "Preparation",   aiRole: "Drafting AI",            owner: "Procurement Officer" },
    { id: 4,  label: "Internal Approval",      shortLabel: "Approval",      aiRole: "Compliance Checker",     owner: "Legal / Finance" },
    { id: 5,  label: "Advertisement",          shortLabel: "Advertisement", aiRole: "Publication AI",         owner: "Communications" },
    { id: 6,  label: "Supplier Management",    shortLabel: "Supplier Mgmt", aiRole: "Supplier Risk AI",       owner: "Procurement Officer" },
    { id: 7,  label: "Clarifications & Q&A",   shortLabel: "Clarifications",aiRole: "Clarification AI",       owner: "Procurement Officer" },
    { id: 8,  label: "Bid / Quote Submission", shortLabel: "Bid Submission",aiRole: "Bid Compliance AI",      owner: "Bidders" },
    { id: 9,  label: "Closing & Bid Opening",  shortLabel: "Bid Opening",   aiRole: "Opening Recorder",       owner: "Committee" },
    { id: 10, label: "Admin Evaluation",       shortLabel: "Admin Eval",    aiRole: "Compliance Eval AI",     owner: "Evaluators" },
    { id: 11, label: "Technical Evaluation",   shortLabel: "Tech Eval",     aiRole: "Tech Eval AI",           owner: "Evaluators" },
    { id: 12, label: "Financial Evaluation",   shortLabel: "Fin Eval",      aiRole: "Financial Eval AI",      owner: "Evaluators" },
    { id: 13, label: "Combined Ranking",       shortLabel: "Combined Eval", aiRole: "Award Rec AI",           owner: "Evaluation Committee" },
    { id: 14, label: "Due Diligence",          shortLabel: "Due Diligence", aiRole: "Due Diligence AI",       owner: "Procurement Officer" },
    { id: 15, label: "Award Approval",         shortLabel: "Award Approval",aiRole: "Award Review AI",        owner: "Adjudication Board" },
    { id: 16, label: "Notification & Standstill", shortLabel: "Notification",aiRole: "Notification AI",      owner: "Communications" },
    { id: 17, label: "Contract Drafting",      shortLabel: "Contract Draft",aiRole: "Contract AI",            owner: "Legal Officer" },
    { id: 18, label: "Contract Execution",     shortLabel: "Contract Exec", aiRole: "Performance AI",         owner: "Contract Manager" },
    { id: 19, label: "Delivery & Milestones",  shortLabel: "Delivery",      aiRole: "Performance AI",         owner: "Project Manager" },
    { id: 20, label: "Invoicing & 3-Way Match",shortLabel: "Invoicing",     aiRole: "Invoice AI",             owner: "Finance Officer" },
    { id: 21, label: "Payment Approval",       shortLabel: "Payment",       aiRole: "Payment AI",             owner: "Finance Officer" },
    { id: 22, label: "Vendor Performance",     shortLabel: "Vendor Perf",   aiRole: "Performance AI",         owner: "Contract Manager" },
    { id: 23, label: "Audit & Compliance",     shortLabel: "Audit",         aiRole: "Audit AI",               owner: "Auditor" },
    { id: 24, label: "Analytics & Reporting",  shortLabel: "Analytics",     aiRole: "Intelligence AI",        owner: "Analytics Officer" },
    { id: 25, label: "Closeout & Archive",     shortLabel: "Closeout",      aiRole: "Closeout AI",            owner: "Records Officer" },
  ];

  const descriptions: Record<number, string> = {
    0:  "Policies, thresholds, roles, and regulatory framework configured",
    1:  "Procurement request approved, budget validated, demand assessed",
    2:  "Procurement method selected and justified based on value and complexity",
    3:  "Specifications, BOQ, TOR, and evaluation criteria drafted",
    4:  "Legal, finance, and compliance review; internal sign-offs obtained",
    5:  "Multi-channel publication — gazette, website, portal, PRAZ",
    6:  "Supplier KYC, qualification checks, risk scoring",
    7:  "Questions received, addenda issued, pre-bid meeting held",
    8:  "Encrypted electronic vault; late bid prevention; compliance check",
    9:  "Auto-close at deadline; opening ceremony; public minutes",
    10: "Compliance matrix — mandatory requirements check",
    11: "Weighted technical scoring — consensus across evaluators",
    12: "BOQ arithmetic check, price normalisation, life-cycle costing",
    13: "QCBS / LERB ranking; combined evaluation recommendation report",
    14: "Reference checks, site visits, financial capacity verification",
    15: "Tender committee, board approval, exception handling",
    16: "Award & regret notices, 10-day standstill period",
    17: "Contract terms negotiated, drafted, signed, deposited",
    18: "SLAs active, milestones tracked, variation order management",
    19: "Deliverable acceptance, inspection reports, completion certificates",
    20: "Invoice received, 3-way PO–GRN–Invoice match, tax validation",
    21: "Multi-level payment approval, EFT generation, remittance advice",
    22: "KPI monitoring, scorecards, performance improvement plan",
    23: "Immutable audit trail, compliance reporting, findings management",
    24: "Spend analytics, savings measurement, cycle-time dashboards",
    25: "Defects liability period, warranty monitoring, final archive",
  };

  return base.map((b, i) => ({
    ...b,
    description: descriptions[b.id] ?? "",
    status: (
      b.id < record.currentStage ? "completed"
      : b.id === record.currentStage ? "active"
      : "pending"
    ) as StageStatus,
    dueDate: b.id === record.currentStage ? record.closing : undefined,
    completedDate: b.id < record.currentStage ? "2026-06-" + String(b.id + 1).padStart(2, "0") : undefined,
  }));
}

// ── Stage detail data — tools per stage (all 26 stages) ──────────────────────
const STAGE_TOOLS: Record<number, {
  documents: string[];
  workflow: string[];
  automation: string[];
  aiCapabilities: string[];
  approvals: string[];
  communications: string[];
  riskFlags: string[];
  finance: string[];
}> = {
  0: {
    documents: ["Procurement Policy Manual", "Regulatory Framework Document", "Threshold & Delegation Schedule", "User Role Matrix", "System Access Register"],
    workflow: ["Configure procurement thresholds per method", "Set up delegation of authority levels", "Define role permissions & access controls", "Register approval workflows", "Activate compliance rule engine", "Enable audit trail logging"],
    automation: ["System auto-enforces method thresholds", "Role-based access controls applied on login", "Audit trail starts automatically on record creation", "Compliance engine validates every action against policy"],
    aiCapabilities: ["Recommend procurement method from value & complexity inputs", "Flag policy violations in real-time", "Auto-classify procurement by category & risk", "Generate governance health score"],
    approvals: ["CPO policy sign-off", "Accounting Officer acknowledgement", "Regulator (PRAZ) compliance confirmation"],
    communications: ["Policy update notice to all procurement staff", "System access credentials issued", "Compliance briefing scheduled"],
    riskFlags: ["Outdated thresholds not aligned to current regulations", "Inactive user accounts with elevated permissions", "Missing conflict-of-interest declarations"],
    finance: ["Financial delegation schedule configured in IFMIS", "Budget module integration verified", "Chart of accounts mapping confirmed"],
  },
  1: {
    documents: ["Procurement Requisition Form", "Annual Procurement Plan", "Needs Assessment Report", "Budget Confirmation Letter", "Prior Year Spend Analysis"],
    workflow: ["User department submits procurement request", "Procurement officer reviews and validates need", "Check against annual procurement plan", "Confirm budget availability in IFMIS", "Assign procurement reference number", "Route for demand aggregation if applicable"],
    automation: ["Auto-check requisition against approved plan", "Budget balance queried from IFMIS in real-time", "Demand aggregation engine suggests consolidation", "Duplicate request detection across departments"],
    aiCapabilities: ["Analyse historical demand to forecast future needs", "Detect off-plan procurement requests", "Recommend consolidation of similar requisitions", "Flag unusual spend patterns vs prior periods"],
    approvals: ["Head of Department approval", "Budget Officer confirmation", "Procurement Officer acceptance"],
    communications: ["PR acknowledgement to requesting department", "Budget officer budget confirmation request", "Procurement plan update notification"],
    riskFlags: ["Procurement not in approved annual plan", "Insufficient budget available", "Request submitted without proper authorisation"],
    finance: ["Budget availability confirmed", "IFMIS budget earmark created", "Preliminary cost estimate documented"],
  },
  2: {
    documents: ["Procurement Method Justification", "Market Analysis Report", "Estimated Cost Summary", "Method Selection Checklist", "PRAZ Method Approval (if required)"],
    workflow: ["Review procurement value against thresholds", "Assess market conditions and supplier landscape", "Select appropriate procurement method", "Document justification for method choice", "Obtain PRAZ approval for exceptions", "Record method decision in procurement file"],
    automation: ["Method auto-suggested based on value & category", "Threshold compliance checked automatically", "Market intelligence pulled from vendor database", "Timeline auto-projected based on selected method"],
    aiCapabilities: ["Recommend optimal method using historical outcomes", "Predict likely bidder pool by category", "Identify risk of single-source situations", "Generate method justification narrative"],
    approvals: ["CPO method approval", "PRAZ approval for direct procurement above threshold"],
    communications: ["Method decision recorded in procurement file", "Legal officer notified for complex methods"],
    riskFlags: ["Method selected below applicable threshold to avoid competition", "Insufficient market analysis performed", "Method not aligned to regulatory requirements"],
    finance: ["Value-for-money method confirmed", "Savings opportunity documented", "Framework agreement check completed"],
  },
  3: {
    documents: ["Tender Notice Template", "Bill of Quantities", "Terms of Reference", "Instruction to Bidders", "Bid Forms", "Evaluation Criteria Matrix"],
    workflow: ["Create tender record & assign number", "Attach project documents", "Define evaluation stages & weights", "Assign committee members", "Collect COI declarations", "Submit for internal approval"],
    automation: ["AI drafts specs from similar tenders", "BOQ auto-populated from item catalogue", "Timeline auto-generated by method", "Evaluation weights suggested by category"],
    aiCapabilities: ["Generate full TOR from project description", "Detect specification ambiguities", "Suggest evaluation criteria", "Draft SCC & GCC clauses"],
    approvals: ["Procurement Officer review", "Legal sign-off", "Finance budget confirmation", "CPO approval"],
    communications: ["Internal draft sharing", "Stakeholder review invites", "Committee notification"],
    riskFlags: ["Specification too broad or too narrow", "Unrealistic timeline", "Missing mandatory documents"],
    finance: ["Budget code confirmed", "Estimated value approved", "IFMIS commitment raised"],
  },
  4: {
    documents: ["Internal Review Checklist", "Legal Clearance Certificate", "Finance Endorsement Letter", "Compliance Sign-Off Form", "CPO Approval Memo"],
    workflow: ["Submit complete procurement package for review", "Legal officer reviews terms, conditions & clauses", "Finance officer confirms budget & cost reasonableness", "Compliance officer checks regulatory conformity", "CPO reviews complete package and approves", "Record all approvals in procurement file"],
    automation: ["Approval routing triggered automatically on submission", "SLA clock starts on receipt by each approver", "Escalation triggered if SLA breached", "Approval chain locks document version"],
    aiCapabilities: ["Check completeness of submission package", "Flag legal or compliance gaps before submission", "Predict approval likelihood based on package quality", "Summarise package for approver review"],
    approvals: ["Legal Officer clearance", "Finance Officer endorsement", "Compliance Officer sign-off", "CPO final approval"],
    communications: ["Submission acknowledgement to procurement officer", "Approval request to each reviewer", "SLA reminder notifications", "Approval confirmation to procurement team"],
    riskFlags: ["Missing mandatory documents in submission", "Legal issues flagged in review", "Budget not confirmed before advertisement"],
    finance: ["Budget adequacy confirmed", "Cost reasonableness assessed", "Financial risk reviewed"],
  },
  5: {
    documents: ["Published Tender Notice", "Addendum Log", "Publication Proof", "Distribution List"],
    workflow: ["Publish to PRAZ system", "Post on ministry website", "Submit to Government Gazette", "Notify registered suppliers", "Set countdown timer"],
    automation: ["Multi-channel simultaneous publication", "Supplier matching — notify relevant vendors", "Countdown timer activated", "Extension logic on system"],
    aiCapabilities: ["Optimise tender reach across channels", "Translate notice to local languages", "Identify under-represented supplier categories", "Forecast bid response rate"],
    approvals: ["CPO publication sign-off", "Communications officer confirmation"],
    communications: ["Email to registered suppliers", "Gazette submission", "Portal announcement", "SMS blast to SME database"],
    riskFlags: ["Insufficient notice period", "Publication not reaching target suppliers"],
    finance: ["Advertisement cost authorised"],
  },
  6: {
    documents: ["Vendor Qualification Questionnaire", "KYC Checklist", "Tax Clearance Certificates", "PRAZ Registration Certificate", "Blacklist Check Report"],
    workflow: ["Open vendor portal for registration", "Suppliers submit qualification documents", "Run KYC checks on all applicants", "Verify PRAZ registration status", "Screen against debarment & blacklist databases", "Issue qualification results to applicants"],
    automation: ["PRAZ registration verified via API", "ZIMRA tax clearance checked in real-time", "Blacklist screening against PRAZ & OFAC databases", "Duplicate entity detection across subsidiaries"],
    aiCapabilities: ["Score vendor financial strength from submitted accounts", "Detect related-party structures and beneficial ownership", "Flag politically exposed persons (PEPs)", "Predict default risk from financial ratios"],
    approvals: ["Procurement Officer qualification review", "CPO approval of qualified vendor list"],
    communications: ["Qualification invitation to prospective vendors", "Qualification outcome letters", "Appeals process notification"],
    riskFlags: ["Vendor on national debarment register", "Expired tax clearance submitted", "Beneficial ownership not disclosed", "Front company indicators detected"],
    finance: ["Vendor financial capacity threshold verified", "Bank account details validated", "Credit rating check completed"],
  },
  7: {
    documents: ["Bidder Query Log", "Official Addendum / Clarification Notice", "Pre-Bid Meeting Minutes", "Site Visit Register", "Updated Tender Documents"],
    workflow: ["Open Q&A portal for bidder queries", "Receive and log all questions", "Prepare consolidated responses", "Issue official addendum via portal", "Conduct pre-bid meeting if required", "Record site visit attendance", "Close clarification period"],
    automation: ["All queries auto-logged with timestamp", "Addendum auto-distributed to all registered bidders", "Pre-bid meeting video recorded and archived", "Query deadline countdown visible to bidders"],
    aiCapabilities: ["Classify queries by type and sensitivity", "Draft standard responses from previous addenda", "Detect queries hinting at inside information", "Flag queries from non-registered parties"],
    approvals: ["CPO approval of all addenda before issue", "Legal review for scope-changing clarifications"],
    communications: ["Query acknowledgement to bidder", "Addendum distribution to all registered bidders", "Pre-bid meeting invitation", "Site visit confirmation"],
    riskFlags: ["Addendum issued within 48hrs of closing — insufficient time", "Query answered only to one bidder", "Scope substantially changed via addendum"],
    finance: ["No financial impact — clarification stage only"],
  },
  8: {
    documents: ["Encrypted Bid Package", "Bid Bond / Security", "Signed Declarations", "Technical Proposal", "Financial Proposal"],
    workflow: ["Electronic bid vault opens", "Bidder uploads encrypted package", "System validates completeness", "Acknowledgement receipt issued", "Vault locks at deadline"],
    automation: ["Completeness check on upload", "Bid security validity verified", "Late submission blocked automatically", "Duplicate bid detection"],
    aiCapabilities: ["Extract bid data into structured format", "Flag missing mandatory documents", "Pre-screen for conflict of interest", "Verify signatory authority"],
    approvals: ["Bid Submission Module auto-validates", "Manual override only by CPO"],
    communications: ["Upload confirmation to bidder", "Deadline reminders (48h, 24h, 1h)", "Late bid rejection notice"],
    riskFlags: ["Bid security expiring before award", "Missing declarations", "Unusual formatting suggesting collusion"],
    finance: ["Bid bond amounts verified against tender value"],
  },
  9: {
    documents: ["Bid Closing Certificate", "Late Bid Register", "Bid Opening Minutes", "Bid Register (number of bids received)", "Witness Signatures"],
    workflow: ["System auto-closes bid vault at deadline", "Generate late bid log", "Convene bid opening ceremony", "Publicly announce number of bids received", "Open and read out bid prices aloud", "Record all bids in official register", "Witnesses and observers sign opening minutes"],
    automation: ["Vault locked automatically at exact deadline", "Late bids flagged and rejected without manual intervention", "Bid count and values auto-recorded in minutes", "Livestream of opening ceremony auto-started"],
    aiCapabilities: ["Detect statistically abnormal bid pricing", "Flag potential bid rigging through price clustering", "Identify bids from related entities", "Generate bid opening summary report"],
    approvals: ["Bid Opening Committee chairperson signs minutes", "All witnesses countersign", "CPO receives certified copy"],
    communications: ["Opening ceremony invitation to registered bidders", "Bid opening minutes distributed to all bidders", "Media briefing if public interest tender"],
    riskFlags: ["Bid vault accessed before official opening", "Fewer bids than expected — possible collusion", "Bid prices identical across multiple bidders"],
    finance: ["All bid prices officially recorded", "Reserve price comparison initiated", "Budget sufficiency confirmed vs lowest bid"],
  },
  10: {
    documents: ["Administrative Compliance Matrix", "Responsiveness Checklist", "Mandatory Requirements Register", "Non-Responsive Bid Rejection Letters"],
    workflow: ["Extract compliance criteria from tender documents", "Check each bid against mandatory requirements", "Mark bids responsive or non-responsive", "Document reasons for rejection", "Notify non-responsive bidders", "Prepare shortlist for technical evaluation"],
    automation: ["Compliance matrix auto-populated from tender criteria", "Pass/fail scoring automated for binary criteria", "Rejection letters auto-generated with reasons", "Shortlist advanced to technical evaluation stage"],
    aiCapabilities: ["Parse bid documents to extract compliance evidence", "Flag ambiguous compliance claims for human review", "Compare bid content against mandatory criteria", "Detect document tampering or post-submission modifications"],
    approvals: ["Evaluation committee signs compliance matrix", "Chairperson approves non-responsive list"],
    communications: ["Rejection notices to non-responsive bidders", "Appeals window notification", "Shortlist communicated to technical evaluators"],
    riskFlags: ["Responsive bid count too low — consider re-tendering", "Inconsistent compliance decisions across evaluators", "Rejection reasons not adequately documented"],
    finance: ["No financial evaluation at this stage — admin gate only"],
  },
  11: {
    documents: ["Evaluation Score Sheets", "Consensus Meeting Minutes", "Individual Evaluator Reports", "Clarification Requests", "Evaluation Narrative"],
    workflow: ["Distribute bids to evaluators", "Independent scoring portal", "Flag divergences >15pts", "Consensus meeting if needed", "Moderator resolves disputes", "Generate evaluation report"],
    automation: ["Scores consolidated automatically", "Weighted totals calculated in real-time", "Divergence alerts triggered", "Narrative auto-generated per bidder"],
    aiCapabilities: ["AI scores each criterion from documents", "Extract relevant experience automatically", "Identify spec deviations", "Suggest clarification questions"],
    approvals: ["All evaluators sign off", "Chairperson approves narrative", "CPO review before proceeding"],
    communications: ["Evaluator task assignments", "Clarification requests to bidders", "Committee meeting invites"],
    riskFlags: ["Conflict of interest detected", "Score manipulation pattern", "Missing evaluator submissions"],
    finance: ["No financial data shared at this stage — blind evaluation"],
  },
  12: {
    documents: ["Financial Evaluation Scoresheet", "BOQ Arithmetic Check Report", "Price Normalisation Workings", "Life-Cycle Cost Analysis", "Currency Conversion Log"],
    workflow: ["Open financial proposals after technical shortlist confirmed", "Run arithmetic check on all BOQs", "Normalise prices for comparison", "Apply life-cycle costing model if required", "Calculate QCBS combined score", "Generate financial ranking"],
    automation: ["Arithmetic errors auto-corrected per PPDPA rules", "Price normalisation calculations automated", "QCBS weighted total auto-calculated", "Currency conversion applied at published rate"],
    aiCapabilities: ["Flag unrealistically low bids for abnormality analysis", "Predict contractor financial risk from pricing patterns", "Identify price manipulation across related entities", "Model total cost of ownership scenarios"],
    approvals: ["Finance evaluators sign financial scoresheet", "Chairperson approves ranking", "CPO reviews before combined scoring"],
    communications: ["Clarification requests for arithmetic errors", "Bidder notification of error corrections made"],
    riskFlags: ["Abnormally low bid — risk of non-performance", "Identical prices from multiple bidders", "Currency mismatches in BOQ items"],
    finance: ["All financial proposals reviewed and ranked", "Total contract value validated", "Life-cycle cost premium assessed"],
  },
  13: {
    documents: ["Combined Evaluation Report", "QCBS/LERB Ranking Table", "Award Recommendation Memo", "Minority Opinion (if any)", "Procurement Committee Endorsement"],
    workflow: ["Merge technical and financial scores", "Apply method-specific weighting (QCBS/LERB)", "Produce ranked list of bidders", "Evaluation committee reviews combined report", "Record any minority opinions", "Chairperson endorses award recommendation"],
    automation: ["Combined scores calculated automatically", "Ranking auto-generated and locked", "Report auto-drafted from scores and narratives", "Minority opinion workflow triggered if needed"],
    aiCapabilities: ["Validate scoring consistency across all evaluators", "Detect bias patterns in scoring", "Generate executive summary of recommendation", "Compare outcome against historical similar awards"],
    approvals: ["Full evaluation committee sign-off", "Procurement Officer review", "CPO acceptance before escalation to award approval"],
    communications: ["Committee meeting notice for review", "Award recommendation memo to CPO", "Evaluation summary to accounting officer"],
    riskFlags: ["Wide divergence between technical and financial rankings", "Recommended bidder has prior performance issues", "Evaluation completed by insufficient number of evaluators"],
    finance: ["Recommended value vs budget confirmed", "Savings or cost escalation documented", "Contingency provision noted"],
  },
  14: {
    documents: ["Reference Check Reports", "Site Visit Findings", "Financial Capacity Verification", "Company Search Certificate", "Past Performance Certificates"],
    workflow: ["Contact references provided by preferred bidder", "Conduct site visit to bidder's premises", "Verify financial standing via bank confirmation", "Search company registry for ownership details", "Review track record on similar contracts", "Compile due diligence report"],
    automation: ["Reference check questionnaires auto-sent", "Company registry searched via API", "Bank confirmation request auto-generated", "Due diligence report compiled from individual findings"],
    aiCapabilities: ["Analyse reference patterns for coached responses", "Cross-reference declared assets vs company registry", "Score due diligence findings against risk matrix", "Predict delivery capability from resource base"],
    approvals: ["Procurement officer signs due diligence report", "CPO accepts findings before award approval"],
    communications: ["Reference check requests to nominated referees", "Site visit appointment notification", "Bank confirmation request"],
    riskFlags: ["Reference provided by related party", "Site visit reveals capacity concerns", "Financial statements inconsistent with bid price", "Unresolved litigation disclosed"],
    finance: ["Financial capacity confirmed vs contract value", "Advance payment risk assessed", "Performance bond quantum confirmed"],
  },
  15: {
    documents: ["Award Recommendation Report", "Approval Package", "Committee Resolution", "Board Minutes", "Regulator Notification"],
    workflow: ["Submit award package to committee", "Committee review meeting", "Vote & resolution recorded", "Board approval if >threshold", "CPO countersigns", "Notify PRAZ"],
    automation: ["Routes to correct tier by value threshold", "Escalates overdue approvals", "Generates approval summary", "Records resolution on blockchain"],
    aiCapabilities: ["Validate evaluation integrity", "Check for procedural compliance", "Assess approval readiness", "Generate award justification"],
    approvals: ["Tender Committee approval", "Board approval (>USD 1M)", "Minister approval (>USD 10M)", "Cabinet approval (>USD 50M)"],
    communications: ["Committee meeting notice", "Board papers circulation", "Regulator submission"],
    riskFlags: ["Approval threshold exceeded without escalation", "Missing committee quorum", "Regulator filing deadline missed"],
    finance: ["Final value confirmed for commitment", "VAT and withholding tax calculated"],
  },
  16: {
    documents: ["Award Notice", "Regret Letters", "Standstill Period Notice", "Appeals Register", "PRAZ Publication Proof"],
    workflow: ["Issue award notice to successful bidder", "Issue regret letters to unsuccessful bidders", "Publish award on portal and gazette", "Open 10-day standstill period", "Log and respond to any debriefs requested", "Handle any formal appeals within period", "Confirm no successful challenge before proceeding"],
    automation: ["Award and regret notices auto-generated from template", "Standstill countdown timer activated", "PRAZ award publication submitted automatically", "Appeals window closes automatically after period"],
    aiCapabilities: ["Draft personalised regret letters with scoring feedback", "Monitor for appeal filings across channels", "Summarise evaluation outcome for award notice", "Predict likelihood of challenge based on score spreads"],
    approvals: ["CPO signs award notice", "Accounting Officer countersigns if above threshold", "Legal Officer clears standstill management"],
    communications: ["Award notice to winner", "Regret notices to unsuccessful bidders", "PRAZ portal publication", "Gazette submission", "Debrief meeting invitations"],
    riskFlags: ["Standstill period too short", "Award published before standstill ends", "Appeal filed — procurement must pause"],
    finance: ["Commitment entered in IFMIS pending contract execution", "Performance bond quantum notified to winner"],
  },
  17: {
    documents: ["Draft Contract", "Negotiation Record (if any)", "Final Signed Contract", "Performance Bond Certificate", "Insurance Policy Certificates", "Contract Repository Receipt"],
    workflow: ["Prepare contract from approved template", "Negotiate special conditions if permitted", "Legal review of final draft", "Obtain signatures from both parties", "Register contract in repository", "Issue contract commencement notice", "Activate performance bond verification"],
    automation: ["Contract auto-drafted from approved terms", "Signature workflow dispatched electronically", "Contract registered in repository automatically", "Performance bond expiry alert configured"],
    aiCapabilities: ["Review contract for unusual or risky clauses", "Extract and index contract obligations and milestones", "Flag deviations from standard conditions", "Generate contract summary for management"],
    approvals: ["Legal Officer reviews final draft", "CPO approves before signing", "Accounting Officer countersigns", "Supplier CEO signature"],
    communications: ["Contract execution notice to all stakeholders", "Commencement notice to project team", "Finance team budget activation notification"],
    riskFlags: ["Performance bond submitted from unrecognised institution", "Special conditions deviate significantly from tender terms", "Signing authority not verified"],
    finance: ["Contract value registered in IFMIS", "Performance bond amount and validity confirmed", "Advance payment terms activated if applicable", "Retention percentage configured"],
  },
  18: {
    documents: ["Signed Contract", "Performance Bond", "Insurance Certificates", "Work Programme", "SLA Schedule", "Variation Order Log"],
    workflow: ["Contract signed by both parties", "Performance bond lodged", "Work programme approved", "Site handover completed", "Progress meetings scheduled", "Variation order workflow active"],
    automation: ["Milestone calendar auto-generated", "Payment schedule built from contract", "Variation order threshold alerts", "SLA breach notifications"],
    aiCapabilities: ["Monitor contract performance against SLAs", "Flag potential cost overruns", "Predict delivery delays", "Draft variation order justifications"],
    approvals: ["Contract signed by vendor CEO", "Countersigned by Accounting Officer", "Finance officer endorsement"],
    communications: ["Contract commencement notice", "Site meeting invites", "Progress report templates distributed"],
    riskFlags: ["Performance bond not submitted", "Work programme not approved", "Insurance lapse"],
    finance: ["IFMIS contract registered", "Advance payment processed if applicable", "Retention schedule configured"],
  },
  19: {
    documents: ["Delivery Schedule", "Goods Received Notes", "Completion Certificates", "Variation Order Log", "Milestone Achievement Reports", "Defect Notification Log"],
    workflow: ["Receive and inspect deliverables per schedule", "Issue GRN or completion certificate on acceptance", "Log and process variation orders", "Track milestone achievements vs schedule", "Issue defect notices for non-conformance", "Manage extensions of time requests", "Update contract register with actuals"],
    automation: ["Milestone due dates trigger automatic reminders", "Variation order value accumulates vs approved threshold", "GRN matched to delivery schedule automatically", "Defect liability period countdown tracked"],
    aiCapabilities: ["Predict delay risk from progress data", "Flag scope creep from variation order patterns", "Auto-generate milestone achievement reports", "Monitor contractor performance against contract KPIs"],
    approvals: ["Project Manager accepts deliverables", "Finance officer approves GRN for payment trigger", "CPO approves variation orders above threshold"],
    communications: ["Delivery acceptance or rejection notice to supplier", "Milestone achievement certificate issued", "Variation order approval notification", "Defect notice to contractor"],
    riskFlags: ["Milestone consistently missed — performance risk", "Variation orders exceed 15% of contract value", "Defect notices not responded to within SLA", "Contractor substituting specified materials"],
    finance: ["Actuals tracked vs contract value in IFMIS", "Variation order budget provisions updated", "Retention releases linked to milestone certificates", "Advance payment recovery tracked"],
  },
  20: {
    documents: ["Tax Invoice", "Goods Received Note", "Completion Certificate", "Purchase Order", "3-Way Match Report"],
    workflow: ["Invoice received in system", "Match invoice to PO & GRN", "Tax compliance check (ZIMRA)", "Route for payment approval", "Generate EFT batch", "Remittance sent to vendor"],
    automation: ["3-way match runs automatically", "ZIMRA tax status verified in real-time", "Duplicate invoice detection", "Currency conversion at spot rate"],
    aiCapabilities: ["Extract invoice data via OCR", "Flag anomalies vs contract rates", "Predict payment date", "Detect suspected fraud patterns"],
    approvals: ["Finance officer review", "Budget officer confirmation", "Accounting officer approval", "Treasury batch sign-off"],
    communications: ["Invoice receipt acknowledgement", "Query notice to vendor if issues", "Payment confirmation / remittance advice"],
    riskFlags: ["Invoice exceeds PO value", "ZIMRA clearance lapsed", "Duplicate invoice", "Bank details changed recently"],
    finance: ["Budget line debited", "IFMIS payment entry", "Withholding tax calculated & remitted", "EFT reference logged"],
  },
  21: {
    documents: ["Payment Voucher", "EFT Batch File", "Treasury Authorization", "Remittance Advice", "Withholding Tax Certificate", "IFMIS Payment Entry"],
    workflow: ["Finance officer prepares payment voucher", "Budget officer confirms expenditure code", "Accounting officer approves payment", "Treasury generates EFT batch", "Bank executes transfer", "Remittance advice sent to vendor", "Payment recorded in IFMIS", "Withholding tax remitted to ZIMRA"],
    automation: ["Payment voucher auto-generated from approved invoice", "EFT batch auto-populated from queue", "ZIMRA WHT remittance scheduled automatically", "IFMIS payment entry auto-posted on bank confirmation"],
    aiCapabilities: ["Detect payment anomalies vs contract schedule", "Flag payments to recently changed bank accounts", "Predict cash flow demand for upcoming payments", "Identify duplicate payment attempts across systems"],
    approvals: ["Finance Officer signs payment voucher", "Budget Officer confirms budget code", "Accounting Officer authorises", "Treasury Officer releases EFT batch"],
    communications: ["Remittance advice emailed to vendor", "Payment confirmation to contract manager", "WHT certificate issued to vendor", "IFMIS posting notification to finance team"],
    riskFlags: ["Payment to bank account changed within last 30 days", "Payment exceeds contract value — overpayment risk", "WHT not remitted within statutory deadline", "Duplicate EFT entry detected"],
    finance: ["Expenditure posted against correct budget line", "Cumulative payments vs contract value tracked", "Retention balance updated", "WHT liability cleared"],
  },
  22: {
    documents: ["Vendor Performance Scorecard", "KPI Assessment Report", "Performance Improvement Plan", "Contractor Default Notice", "Performance Bond Claim (if required)"],
    workflow: ["Score vendor performance against contract KPIs", "Issue periodic performance reports to vendor", "Hold performance review meetings", "Issue improvement notice if below threshold", "Initiate performance bond claim if default confirmed", "Update vendor performance record in registry", "Feed results into future qualification scoring"],
    automation: ["KPI scores auto-calculated from delivery data", "Performance below 70% triggers alert automatically", "Improvement plan template issued on first warning", "Vendor performance registry updated in real-time"],
    aiCapabilities: ["Benchmark vendor performance vs industry peers", "Predict risk of contract default from trend data", "Recommend sanctions proportional to breach severity", "Generate performance report narrative automatically"],
    approvals: ["Contract Manager approves scorecard", "CPO approves performance improvement notices", "Accounting Officer approves bond claim initiation"],
    communications: ["Performance scorecard shared with vendor", "Improvement notice with response deadline", "Performance review meeting invitations", "Bond claim notice to guarantor bank"],
    riskFlags: ["Vendor KPI score below 60% — default threshold approaching", "No improvement after first notice", "Performance bond about to expire while dispute ongoing", "Vendor disputing KPI scores"],
    finance: ["Contract deductions calculated for SLA breaches", "Performance bond status monitored", "Deduction register updated in IFMIS", "Penalty interest applied if applicable"],
  },
  23: {
    documents: ["Immutable Audit Log", "Compliance Assessment Report", "Exception Register", "Audit Findings Report", "Management Response", "Corrective Action Plan"],
    workflow: ["Generate immutable audit trail export", "Run automated compliance checks against policy", "Identify and log exceptions", "Report findings to management", "Obtain management responses", "Track corrective action implementation", "Close audit cycle with confirmation"],
    automation: ["Audit trail cannot be modified — blockchain-backed", "Compliance checks run nightly against all records", "Exception auto-classified by severity", "Corrective action due dates tracked automatically"],
    aiCapabilities: ["Pattern-match across records to detect systemic fraud", "Score compliance health across all procurement records", "Generate audit summary for Auditor-General submission", "Flag transactions requiring forensic review"],
    approvals: ["Audit team validates all findings", "Management signs response to findings", "CPO acknowledges corrective actions"],
    communications: ["Audit findings report issued to management", "OAG submission if threshold met", "PRAZ compliance report submission", "Parliament notification if applicable"],
    riskFlags: ["Repeat exceptions from same officer — misconduct risk", "Corrective actions overdue", "Management response not received within 30 days", "Systemic compliance failure pattern detected"],
    finance: ["Financial irregularity value quantified", "Recovery action initiated for overpayments", "Budget impact of findings reported", "PFMA compliance status confirmed"],
  },
  24: {
    documents: ["Spend Analytics Dashboard", "Savings Report", "Cycle-Time Analysis", "Supplier Market Analysis", "Procurement Performance Report", "Board Intelligence Brief"],
    workflow: ["Aggregate spend data across all completed procurements", "Calculate realised savings vs market benchmarks", "Measure cycle times per procurement phase", "Analyse supplier concentration and risk", "Generate periodic management reports", "Present insights to CPO and board", "Feed learnings into next planning cycle"],
    automation: ["Spend data aggregated automatically from IFMIS", "Savings calculated vs pre-set benchmark prices", "Cycle-time metrics computed from stage timestamps", "Dashboard refreshed in real-time"],
    aiCapabilities: ["Identify savings opportunities from spend patterns", "Forecast next period procurement demand", "Detect price inflation trends by category", "Benchmark against peer entities and regional standards"],
    approvals: ["CPO validates analytics report", "Board receives intelligence brief quarterly"],
    communications: ["Monthly spend dashboard distributed to CFO", "Quarterly savings report to Minister", "Annual procurement performance report published", "PRAZ statistics submission"],
    riskFlags: ["Spend concentration in single supplier > 40%", "Savings target not being met", "Cycle times increasing — process deterioration", "Data quality issues in underlying records"],
    finance: ["Total procurement spend reported by category", "Savings vs budget targets tracked", "ROI of procurement processes calculated", "IFMIS data reconciliation confirmed"],
  },
  25: {
    documents: ["Final Completion Certificate", "Defects Liability Period Register", "Warranty Register", "Contract Closeout Report", "Lessons Learned Register", "Archive Index"],
    workflow: ["Issue practical completion certificate", "Activate defects liability period monitoring", "Release retention after defects period (if clean)", "Register all warranties in warranty tracker", "Conduct contract closeout meeting", "Document lessons learned", "Archive all contract records in repository", "Update vendor performance registry with final rating"],
    automation: ["Defects liability period countdown automated", "Retention release triggered on DLP expiry", "Warranty expiry alerts scheduled", "All documents auto-indexed on archive"],
    aiCapabilities: ["Extract lessons learned from performance data", "Recommend improvements to future similar procurements", "Generate closeout narrative from contract history", "Score contract overall success for benchmarking"],
    approvals: ["Project Manager issues completion certificate", "Finance Officer releases retention", "CPO signs off closeout report", "Auditor confirms records are complete"],
    communications: ["Completion certificate to contractor", "Retention release notification to finance", "Warranty registration confirmations", "Lessons learned distributed to procurement team"],
    riskFlags: ["Outstanding defects not rectified before retention release", "Warranty documents not received", "Lessons learned not captured — knowledge lost", "Records incomplete before archiving"],
    finance: ["Final retention released after DLP confirmation", "All financial obligations settled", "Contract closed in IFMIS", "Final savings reported to finance"],
  },
};

// ── Helper components ─────────────────────────────────────────────────────────
const TYPE_COLORS: Record<ProcType, string> = {
  Tender:  "bg-slate-100 text-[#0F172A] border-slate-200",
  RFQ:     "bg-slate-100 text-[#0F172A] border-slate-200",
  RFP:     "bg-slate-100 text-[#0F172A] border-slate-200",
  EOI:     "bg-slate-100 text-[#0F172A] border-slate-200",
  Auction: "bg-rose-100 text-rose-700 border-rose-200",
};

const RISK_COLORS: Record<string, string> = {
  Low:      "text-[#0F172A] bg-slate-50",
  Medium:   "text-[#0F172A] bg-slate-50",
  High:     "text-red-600 bg-red-50",
  Critical: "text-red-800 bg-red-100",
};

const STATUS_TONE: Record<string, "green" | "blue" | "amber" | "muted"> = {
  "Bidding":    "blue",
  "Evaluation": "amber",
  "Published":  "muted",
  "Evaluating": "amber",
  "Open":       "blue",
  "Awarded":    "green",
  "Draft":      "muted",
};

const STAGE_STATUS_STYLE: Record<StageStatus, string> = {
  completed: "bg-[#0F172A] text-white border-slate-200",
  active:    "bg-black text-white border-black ring-2 ring-black ring-offset-2",
  pending:   "bg-white text-black/40 border-black/15",
  skipped:   "bg-gray-100 text-gray-400 border-gray-200",
};

function StagePin({ status, index }: { status: StageStatus; index: number }) {
  return (
    <div className={`w-6 h-6 rounded-full border-2 grid place-items-center text-[9px] font-bold flex-shrink-0 ${STAGE_STATUS_STYLE[status]}`}>
      {status === "completed" ? <CheckCircle2 className="h-3 w-3" /> : index}
    </div>
  );
}

function ToolRow({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-start gap-2 text-xs text-foreground py-0.5">
      <Icon className="h-3.5 w-3.5 text-black/40 mt-0.5 flex-shrink-0" />
      <span>{label}</span>
    </div>
  );
}

// ── Tender Compliance Check (extracted to avoid hooks-in-loops) ───────────────
const TENDER_COMPLIANCE_ITEMS = [
  "All required tender documents prepared and uploaded",
  "Procurement method verified and approved by CPO",
  "Budget availability confirmed in IFMIS",
  "Evaluation criteria pre-disclosed and approved",
  "All mandatory approvals obtained before proceeding",
  "Conflict of interest declarations collected from all evaluators",
];

function TenderComplianceCheck({ onAction }: { onAction: (msg: string) => void }) {
  const [checks, setChecks] = useState<boolean[]>([true, true, true, false, false, false]);
  const toggle = (i: number) => setChecks(prev => prev.map((v, idx) => idx === i ? !v : v));
  const done = checks.filter(Boolean).length;

  return (
    <div>
      <div className="h-1.5 w-full bg-black/8 rounded-full overflow-hidden mb-3">
        <div className="h-full rounded-full bg-[#0F172A] transition-all" style={{ width: `${Math.round(done / TENDER_COMPLIANCE_ITEMS.length * 100)}%` }} />
      </div>
      {TENDER_COMPLIANCE_ITEMS.map((item, i) => (
        <label key={i} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer mb-1.5 transition-colors ${checks[i] ? "border-slate-200 bg-slate-50/50" : "border-black/8 hover:bg-[#EAF1F8]"}`}>
          <input type="checkbox" className="h-4 w-4 rounded accent-black" checked={checks[i]} onChange={() => { toggle(i); onAction(`Compliance item ${i + 1} ${!checks[i] ? "checked" : "unchecked"}`); }} />
          <span className="text-xs text-black">{item}</span>
          {checks[i] && <CheckCircle2 className="h-3.5 w-3.5 text-slate-600 ml-auto flex-shrink-0" />}
        </label>
      ))}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcAge(openedDate: string): string {
  const opened = new Date(openedDate);
  const now = new Date("2026-06-26");
  const days = Math.floor((now.getTime() - opened.getTime()) / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month" : `${months} months`;
}

// ── Stage Detail Slide-over Panel ─────────────────────────────────────────────
type StagePanelTab = "tender" | "overview" | "documents" | "workflow" | "automation" | "ai" | "approvals" | "comms" | "risk" | "finance" | "chat";

function StageDetailPanel({
  record, stage, onClose,
}: {
  record: ProcRecord;
  stage: LifecycleStage;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<StagePanelTab>("overview");
  const tools = STAGE_TOOLS[stage.id] ?? STAGE_TOOLS[0];
  const age = calcAge(record.openedDate);
  const now = new Date("2026-06-26");
  const dateTimeStr = now.toLocaleString("en-ZW", { dateStyle: "medium", timeStyle: "short" });

  const tabs: { key: StagePanelTab; label: string; icon: React.ElementType }[] = [
    { key: "tender",     label: "Tender",        icon: FileText      },
    { key: "overview",   label: "Overview",      icon: Eye           },
    { key: "documents",  label: "Documents",     icon: FileSignature },
    { key: "workflow",   label: "Workflow",      icon: RefreshCcw    },
    { key: "automation", label: "Automation",    icon: Settings      },
    { key: "ai",         label: "AI Assistant",  icon: Sparkles      },
    { key: "approvals",  label: "Approvals",     icon: CheckCircle2  },
    { key: "comms",      label: "Comms",         icon: MessageSquare },
    { key: "risk",       label: "Risk & Flags",  icon: AlertTriangle },
    { key: "finance",    label: "Finance",       icon: Wallet        },
    { key: "chat",       label: "Chat Thread",   icon: MessageSquare },
  ];

  const handleAction = (action: string) => {
    pushNotification(`${action} — ${stage.label} · ${record.id}`, "success");
  };

  // Demo participants for Chat Thread tab
  const PARTICIPANTS = [
    { name: "T. Moyo",      role: "Chief Procurement Officer",  avatar: "TM", action: "Approved stage advancement",          time: "09:14", online: true  },
    { name: "A. Mpofu",     role: "Procurement Officer",         avatar: "AM", action: "Uploaded compliance checklist",       time: "08:45", online: true  },
    { name: "R. Chikwanda", role: "Finance Officer",             avatar: "RC", action: "Confirmed budget availability",       time: "Yesterday", online: false },
    { name: "P. Dube",      role: "Evaluator",                   avatar: "PD", action: "Submitted evaluation scores",         time: "Yesterday", online: false },
    { name: "L. Ndlovu",    role: "Legal Officer",               avatar: "LN", action: "Issued legal clearance certificate", time: "Mon",  online: false },
    { name: "CPO",          role: "Oversight / Auditor",         avatar: "CP", action: "Monitoring stage compliance",         time: "Mon",  online: true  },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-black/8 flex-shrink-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              {/* Badges row */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${TYPE_COLORS[record.type]}`}>{record.type}</span>
                <Badge tone={stage.status === "active" ? "blue" : stage.status === "completed" ? "green" : "muted"}>
                  Stage {stage.id} of {record.totalStages - 1}
                </Badge>
                <Badge tone="muted">{record.stageLevel}</Badge>
                {stage.status === "active" && (
                  <span className="flex items-center gap-1 text-[10px] text-[#0F172A] font-semibold bg-slate-50 px-1.5 py-0.5 rounded">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0F172A] animate-pulse inline-block" />
                    ACTIVE
                  </span>
                )}
                <Badge tone={
                  record.status === "Awarded" ? "green" :
                  record.status === "Evaluation" || record.status === "Evaluating" ? "amber" :
                  record.status === "Bidding" || record.status === "Open" ? "blue" : "muted"
                }>{record.status}</Badge>
              </div>
              {/* Tender code and name — bold, large */}
              <div className="text-[10px] font-mono text-black/50 mb-0.5">{record.id} · {record.projectCode}</div>
              <h2 className="text-base font-bold text-black leading-tight mb-1">{record.title}</h2>
              <div className="text-[11px] font-semibold text-black/70 mb-0.5">{record.projectName}</div>
              {/* Stage label */}
              <div className="text-xs text-black/50 font-medium">{stage.label}</div>
            </div>
            <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-[#EAF1F8] text-black/40 hover:text-black transition-colors flex-shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Meta row — Ministry · Dept · Date/Time · Age · Closing */}
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <div className="flex items-center gap-1 text-[10px] text-black/50">
              <Building2 className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{record.ministry}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-black/50">
              <Hash className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{record.department}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-black/50">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>{dateTimeStr}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-black/50">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>Age: {age}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-black/50">
              <CalendarDays className="h-3 w-3 flex-shrink-0" />
              <span>Closes: {record.closing}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-black/50">
              <Layers className="h-3 w-3 flex-shrink-0" />
              <span>{record.type} · {record.value}</span>
            </div>
          </div>

          {/* AI role + owner pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
              <Sparkles className="h-3 w-3 text-[#0F172A]" />
              <span className="text-[11px] text-[#0F172A] font-medium">{stage.aiRole}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#EAF1F8] rounded-full px-2.5 py-1">
              <Users className="h-3 w-3 text-black/40" />
              <span className="text-[11px] text-black/60">{stage.owner}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-black/8 flex-shrink-0 scrollbar-none">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors -mb-px flex-shrink-0
                ${tab === t.key ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"}`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {tab === "overview" && (
            <>
              <div className="bg-[#EAF1F8] rounded-xl p-4">
                <p className="text-sm text-black/70 leading-relaxed">{stage.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {stage.dueDate && (
                  <div className="border border-black/8 rounded-xl p-3">
                    <div className="text-[10px] text-black/40 uppercase tracking-wider mb-1">Due Date</div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-black">
                      <CalendarDays className="h-4 w-4 text-black/40" />{stage.dueDate}
                    </div>
                  </div>
                )}
                {stage.completedDate && (
                  <div className="border border-slate-200 bg-slate-50 rounded-xl p-3">
                    <div className="text-[10px] text-[#0F172A] uppercase tracking-wider mb-1">Completed</div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0F172A]">
                      <CheckCircle2 className="h-4 w-4" />{stage.completedDate}
                    </div>
                  </div>
                )}
                <div className="border border-black/8 rounded-xl p-3">
                  <div className="text-[10px] text-black/40 uppercase tracking-wider mb-1">Value at Stake</div>
                  <div className="text-sm font-semibold text-black">{record.value}</div>
                </div>
                <div className="border border-black/8 rounded-xl p-3">
                  <div className="text-[10px] text-black/40 uppercase tracking-wider mb-1">Risk Level</div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${RISK_COLORS[record.riskLevel]}`}>{record.riskLevel}</span>
                </div>
              </div>
              {record.aiAlerts.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#0F172A] font-semibold text-xs">
                    <AlertTriangle className="h-4 w-4" /> AI Alerts ({record.aiAlerts.length})
                  </div>
                  {record.aiAlerts.map((a, i) => (
                    <div key={i} className="text-xs text-[#0F172A]">{a}</div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleAction("Stage advanced")} className="h-9 bg-black text-white rounded-lg text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5" /> Advance Stage
                </button>
                <button onClick={() => handleAction("Report downloaded")} className="h-9 border border-black/10 rounded-lg text-xs font-medium hover:bg-[#EAF1F8] transition-colors flex items-center justify-center gap-1.5">
                  <Download className="h-3.5 w-3.5" /> Download Report
                </button>
              </div>
            </>
          )}

          {tab === "documents" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-black/60">Stage Documents</span>
                <button onClick={() => handleAction("Document uploaded")} className="h-7 px-2.5 bg-black text-white rounded-lg text-[10px] font-medium flex items-center gap-1 hover:opacity-90">
                  <Upload className="h-3 w-3" /> Upload
                </button>
              </div>
              {tools.documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-black/8 rounded-xl hover:bg-[#EAF1F8] transition-colors group">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-black/30" />
                    <span className="text-xs text-black">{doc}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleAction(`Viewing ${doc}`)} className="h-6 px-2 rounded-md bg-[#EAF1F8] text-[10px] hover:bg-black hover:text-white transition-colors">View</button>
                    <button onClick={() => handleAction(`Downloaded ${doc}`)} className="h-6 px-2 rounded-md bg-[#EAF1F8] text-[10px] hover:bg-black hover:text-white transition-colors">DL</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "workflow" && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-black/60">Process Steps</span>
              {tools.workflow.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border border-black/8 rounded-xl">
                  <div className="w-5 h-5 rounded-full bg-black text-white text-[9px] font-bold grid place-items-center flex-shrink-0 mt-0.5">{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-xs text-black">{step}</p>
                  </div>
                  <button onClick={() => handleAction(`${step} — marked complete`)} className="h-6 px-2 rounded-md bg-[#EAF1F8] text-[10px] hover:bg-[#0F172A] hover:text-white transition-colors flex-shrink-0">Done</button>
                </div>
              ))}
            </div>
          )}

          {tab === "automation" && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-black/60">Automated Actions at This Stage</span>
              {tools.automation.map((a, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <Settings className="h-3.5 w-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-[#0F172A]">{a}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "ai" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <Sparkles className="h-4 w-4 text-[#0F172A] flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-[#0F172A]">{stage.aiRole} — Active</div>
                  <div className="text-[11px] text-[#0F172A] mt-0.5">Monitoring stage · 94% confidence</div>
                </div>
              </div>
              <span className="text-xs font-semibold text-black/60">AI Capabilities at This Stage</span>
              {tools.aiCapabilities.map((c, i) => (
                <div key={i} className="flex items-start gap-2 p-3 border border-black/8 rounded-xl hover:border-slate-200 transition-colors">
                  <div className="h-4 w-4 rounded-full bg-slate-100 grid place-items-center flex-shrink-0 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#0F172A] animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-black">{c}</p>
                  </div>
                  <button onClick={() => handleAction(`AI action: ${c}`)} className="h-6 px-2 rounded-md bg-slate-100 text-[#0F172A] text-[10px] font-medium hover:bg-[#0F172A] hover:text-white transition-colors flex-shrink-0">Run</button>
                </div>
              ))}
            </div>
          )}

          {tab === "approvals" && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-black/60">Required Approvals</span>
              {tools.approvals.map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-black/8 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-5 w-5 rounded-full grid place-items-center ${i === 0 ? "bg-[#0F172A]" : "bg-black/10"}`}>
                      {i === 0 ? <CheckCircle2 className="h-3 w-3 text-white" /> : <Lock className="h-2.5 w-2.5 text-black/30" />}
                    </div>
                    <span className="text-xs text-black">{a}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${i === 0 ? "bg-slate-100 text-[#0F172A]" : "bg-[#EAF1F8] text-black/40"}`}>
                    {i === 0 ? "Approved" : "Pending"}
                  </span>
                </div>
              ))}
              <button onClick={() => handleAction("Approval submitted")} className="w-full h-9 mt-2 bg-black text-white rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">
                Submit for Approval
              </button>
            </div>
          )}

          {tab === "comms" && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-black/60">Communications at This Stage</span>
              {tools.communications.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-black/8 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="h-3.5 w-3.5 text-black/30" />
                    <span className="text-xs text-black">{c}</span>
                  </div>
                  <button onClick={() => handleAction(`${c} sent`)} className="h-6 px-2 rounded-md bg-[#EAF1F8] text-[10px] hover:bg-black hover:text-white transition-colors">
                    Send
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "risk" && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-black/60">Risk Flags & Monitoring</span>
              {tools.riskFlags.map((r, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <AlertOctagon className="h-3.5 w-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-[#0F172A]">{r}</span>
                </div>
              ))}
              <button onClick={() => handleAction("Risk report generated")} className="w-full h-9 mt-2 border border-slate-200 text-[#0F172A] bg-slate-50 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" /> Generate Risk Report
              </button>
            </div>
          )}

          {tab === "finance" && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-black/60">Financial Controls at This Stage</span>
              {tools.finance.map((f, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <DollarSign className="h-3.5 w-3.5 text-slate-600 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-[#0F172A]">{f}</span>
                </div>
              ))}
              <div className="border border-black/8 rounded-xl p-3 mt-2">
                <div className="text-[10px] text-black/40 uppercase tracking-wider mb-1">Estimated Value</div>
                <div className="text-base font-bold text-black">{record.value}</div>
              </div>
            </div>
          )}

          {tab === "tender" && (
            <div className="space-y-4">
              {/* Tender Documents */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-black/60">Tender Documents</span>
                  <button onClick={() => handleAction("Tender document uploaded")} className="h-7 px-2.5 bg-black text-white rounded-lg text-[10px] font-medium flex items-center gap-1 hover:opacity-90">
                    <Upload className="h-3 w-3" /> Upload
                  </button>
                </div>
                {tools.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-black/8 rounded-xl hover:bg-[#EAF1F8] transition-colors group mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-black/30" />
                      <span className="text-xs text-black">{doc}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleAction(`Viewed ${doc}`)} className="h-6 px-2 rounded-md bg-[#EAF1F8] text-[10px] hover:bg-black hover:text-white transition-colors">View</button>
                      <button onClick={() => handleAction(`Downloaded ${doc}`)} className="h-6 px-2 rounded-md bg-[#EAF1F8] text-[10px] hover:bg-black hover:text-white transition-colors">DL</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Minutes and Resolutions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-black/60">Minutes & Resolutions</span>
                  <button onClick={() => handleAction("Minutes uploaded")} className="h-7 px-2.5 bg-black text-white rounded-lg text-[10px] font-medium flex items-center gap-1 hover:opacity-90">
                    <Upload className="h-3 w-3" /> Upload
                  </button>
                </div>
                {[
                  { ref: "MTG-001", date: "2026-06-02", title: "Stage kickoff meeting minutes", status: "Uploaded" },
                  { ref: "RES-001", date: "2026-06-03", title: "Resolution to proceed to next stage", status: "AI Reviewed" },
                  { ref: "MTG-002", date: "2026-06-10", title: "Evaluation committee sitting minutes", status: "Pending Review" },
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-black/8 rounded-xl mb-1.5 hover:bg-[#EAF1F8] transition-colors">
                    <div>
                      <div className="text-xs font-semibold text-black">{m.title}</div>
                      <div className="text-[10px] text-black/40 mt-0.5">{m.ref} · {m.date}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${m.status === "AI Reviewed" ? "bg-slate-100 text-[#0F172A]" : m.status === "Uploaded" ? "bg-slate-100 text-[#0F172A]" : "bg-slate-100 text-[#0F172A]"}`}>{m.status}</span>
                      <button onClick={() => handleAction(`Viewed ${m.ref}`)} className="h-6 px-2 rounded-md bg-[#EAF1F8] text-[10px] hover:bg-black hover:text-white transition-colors">View</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compliance Check Box */}
              <div>
                <span className="text-xs font-semibold text-black/60 block mb-2">Compliance Check</span>
                <TenderComplianceCheck onAction={handleAction} />
              </div>
            </div>
          )}

          {tab === "chat" && (
            <div className="space-y-4">
              {/* Participants list */}
              <div>
                <span className="text-xs font-semibold text-black/60 block mb-2">Stage Participants ({PARTICIPANTS.length})</span>
                {PARTICIPANTS.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-black/8 rounded-xl mb-1.5 hover:bg-[#EAF1F8] transition-colors">
                    <div className="relative flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-black text-white text-xs font-bold grid place-items-center">{p.avatar}</div>
                      {p.online && <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-slate-400 border-2 border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-black">{p.name}</span>
                        <span className="text-[10px] text-black/40">· {p.role}</span>
                      </div>
                      <div className="text-[10px] text-black/50 truncate">{p.action}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[9px] text-black/30">{p.time}</div>
                      {p.online && <div className="text-[9px] text-[#0F172A] font-semibold mt-0.5">Online</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat thread */}
              <div>
                <span className="text-xs font-semibold text-black/60 block mb-2">Chat Thread</span>
                <div className="space-y-3 mb-3">
                  {[
                    { from: "T. Moyo", avatar: "TM", msg: "Stage documentation is complete. Moving to bid submission phase.", time: "09:14", self: false },
                    { from: "A. Mpofu", avatar: "AM", msg: "Compliance checklist uploaded. Please review and confirm.", time: "08:45", self: false },
                    { from: "R. Chikwanda", avatar: "RC", msg: "Budget confirmed — USD commitment created in IFMIS.", time: "Yesterday", self: false },
                    { from: "You", avatar: "ME", msg: "Acknowledged. Proceeding to next stage.", time: "Yesterday", self: true },
                  ].map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.self ? "flex-row-reverse" : ""}`}>
                      <div className={`h-7 w-7 rounded-full text-white text-[10px] font-bold grid place-items-center flex-shrink-0 ${msg.self ? "bg-[#0F172A]" : "bg-black"}`}>{msg.avatar}</div>
                      <div className={`max-w-[75%] ${msg.self ? "items-end" : "items-start"} flex flex-col`}>
                        {!msg.self && <span className="text-[10px] text-black/40 mb-0.5">{msg.from}</span>}
                        <div className={`px-3 py-2 rounded-xl text-xs ${msg.self ? "bg-[#0F172A] text-white rounded-tr-sm" : "bg-[#EAF1F8] text-black rounded-tl-sm"}`}>
                          {msg.msg}
                        </div>
                        <span className="text-[9px] text-black/25 mt-0.5">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Message input */}
                <div className="flex gap-2">
                  <input
                    placeholder="Type a message to stage participants…"
                    className="flex-1 h-9 px-3 rounded-xl border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                  <button onClick={() => handleAction("Message sent to stage participants")} className="h-9 px-3 bg-black text-white rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5 text-xs font-medium">
                    <Send className="h-3.5 w-3.5" /> Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Lifecycle Stage Map for a selected record ─────────────────────────────────
function LifecycleStageMap({
  record, onSelectStage,
}: {
  record: ProcRecord;
  onSelectStage: (stage: LifecycleStage) => void;
}) {
  const stages = buildStages(record);

  const row1 = stages.slice(0, 9);
  const row2 = stages.slice(9, 18);
  const row3 = stages.slice(18);

  const renderRow = (items: LifecycleStage[], reverse = false) => (
    <div className={`flex items-stretch gap-0 ${reverse ? "flex-row-reverse" : ""}`}>
      {items.map((stage, idx) => (
        <button
          key={stage.id}
          onClick={() => onSelectStage(stage)}
          className={`flex-1 min-w-0 relative group flex flex-col items-center gap-1 px-1 py-2 rounded-lg border transition-all hover:border-black/30 hover:bg-[#EAF1F8]/80 text-center
            ${stage.status === "active" ? "border-black bg-black/5" : "border-transparent"}
          `}
          title={`${stage.label} — ${stage.status}`}
        >
          <StagePin status={stage.status} index={stage.id} />
          <span className={`text-[9px] font-medium leading-tight mt-0.5 w-full truncate
            ${stage.status === "completed" ? "text-[#0F172A]" : stage.status === "active" ? "text-black font-bold" : "text-black/35"}`}>
            {stage.shortLabel}
          </span>
          {/* connector */}
          {idx < items.length - 1 && (
            <div className={`absolute top-[18px] ${reverse ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"} w-4 h-0.5 z-10
              ${stage.status === "completed" ? "bg-slate-400" : "bg-black/10"}`}
            />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-2">
      {renderRow(row1)}
      <div className="flex items-center gap-2 px-2">
        <div className="flex-1 h-0.5 bg-black/8" />
        <ChevronRight className="h-3 w-3 text-black/20 rotate-90" />
        <div className="flex-1 h-0.5 bg-black/8" />
      </div>
      {renderRow(row2, true)}
      <div className="flex items-center gap-2 px-2">
        <div className="flex-1 h-0.5 bg-black/8" />
        <ChevronRight className="h-3 w-3 text-black/20 rotate-90" />
        <div className="flex-1 h-0.5 bg-black/8" />
      </div>
      {renderRow(row3)}
    </div>
  );
}

// ── Record Selector Card ──────────────────────────────────────────────────────
function RecordCard({
  record, selected, onClick,
}: {
  record: ProcRecord;
  selected: boolean;
  onClick: () => void;
}) {
  const progress = Math.round((record.currentStage / (record.totalStages - 1)) * 100);
  const age = calcAge(record.openedDate);

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all hover:border-black/30
        ${selected ? "border-black bg-black/5 shadow-sm" : "border-black/8 bg-white hover:bg-[#EAF1F8]/60"}`}
    >
      {/* Type badge + title */}
      <div className="flex items-start gap-2.5 mb-3">
        <div className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 mt-0.5 ${TYPE_COLORS[record.type]}`}>
          {record.type}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-black leading-tight mb-0.5">{record.title}</div>
          <div className="text-[10px] text-black/50 font-mono truncate">{record.id}</div>
        </div>
        {record.aiAlerts.length > 0 && (
          <AlertTriangle className="h-3.5 w-3.5 text-slate-600 flex-shrink-0 mt-0.5" />
        )}
      </div>

      {/* Ministry · Dept */}
      <div className="flex items-center gap-1.5 mb-1">
        <Building2 className="h-3 w-3 text-black/25 flex-shrink-0" />
        <span className="text-[10px] text-black/50 truncate">{record.ministry}</span>
      </div>
      <div className="text-[10px] text-black/35 truncate pl-4.5 mb-2">{record.department}</div>

      {/* Status row */}
      <div className="flex items-center gap-2 mb-3">
        <Badge tone={STATUS_TONE[record.status] ?? "muted"}>{record.status}</Badge>
        <span className="text-[10px] text-black/40">{record.currentStageLabel}</span>
        <span className="text-[10px] text-black/25 ml-auto">Age: {age}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-black/8 overflow-hidden mb-1">
        <div
          className="h-full rounded-full bg-black transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mb-3">
        <span className="text-[9px] text-black/30">Stage {record.currentStage}/{record.totalStages - 1}</span>
        <span className="text-[9px] text-black/40 font-medium">{progress}%</span>
      </div>

      {/* Footer — value · risk · closing */}
      <div className="flex items-center justify-between pt-2 border-t border-black/5">
        <span className="text-[10px] font-semibold text-black/70">{record.value}</span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-black/35">Closes {record.closing}</span>
          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${RISK_COLORS[record.riskLevel]}`}>
            {record.riskLevel} Risk
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProcurementLifecyclePage() {
  const [selectedRecord, setSelectedRecord] = useState<ProcRecord>(PROC_RECORDS[0]);
  const [selectedStage, setSelectedStage]   = useState<LifecycleStage | null>(null);
  const [typeFilter, setTypeFilter]         = useState<ProcType | "All">("All");
  const [search, setSearch]                 = useState("");
  const [dateFrom, setDateFrom]             = useState("");
  const [dateTo, setDateTo]                 = useState("");

  const now = new Date("2026-06-26");
  const dateTimeStr = now.toLocaleString("en-ZW", { dateStyle: "full", timeStyle: "short" });

  const filteredRecords = PROC_RECORDS.filter(r => {
    const matchType = typeFilter === "All" || r.type === typeFilter;
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase())
      || r.id.toLowerCase().includes(search.toLowerCase())
      || r.entity.toLowerCase().includes(search.toLowerCase())
      || r.projectCode.toLowerCase().includes(search.toLowerCase());
    const matchFrom = !dateFrom || r.openedDate >= dateFrom;
    const matchTo = !dateTo || r.closing <= dateTo;
    return matchType && matchSearch && matchFrom && matchTo;
  });

  const stages = buildStages(selectedRecord);
  const completedStages = stages.filter(s => s.status === "completed").length;
  const activeStage = stages.find(s => s.status === "active");

  const totalAlerts = PROC_RECORDS.reduce((n, r) => n + r.aiAlerts.length, 0);

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Procurement Lifecycle"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1800px] mx-auto">

        {/* Header */}
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Procurement Control Tower</Badge>
          <Badge tone="muted">All Instruments · Full Lifecycle</Badge>
          {/* Stage/level indicator */}
          {activeStage && (
            <Badge tone="violet">
              <Layers className="h-3 w-3 mr-1" />Stage {selectedRecord.currentStage} · {selectedRecord.stageLevel}
            </Badge>
          )}
          {totalAlerts > 0 && (
            <Badge tone="amber">
              <AlertTriangle className="h-3 w-3 mr-1" />{totalAlerts} AI Alerts
            </Badge>
          )}
          {/* Date and time */}
          <span className="ml-auto text-[10px] text-black/40 flex items-center gap-1">
            <Calendar className="h-3 w-3" />{dateTimeStr}
          </span>
        </div>
        <PageHeader
          title="Procurement Lifecycle Control Tower"
          description="Select any procurement record — Tender, RFQ, RFP, EOI, or Auction — to view its full lifecycle stage map. Click any stage for complete tooling, AI capabilities, approvals, documents, and finance controls."
          actions={
            <div className="flex gap-2">
              <button
                onClick={() => pushNotification("Lifecycle report exported to PDF.", "success")}
                className="h-9 px-3 rounded-md border border-black/10 text-sm font-medium flex items-center gap-1.5 hover:bg-[#EAF1F8] transition-colors"
              >
                <Download className="h-4 w-4" /> Export
              </button>
              <button
                onClick={() => pushNotification("All lifecycle data refreshed.", "info")}
                className="h-9 px-3 rounded-md bg-black text-white text-sm font-medium flex items-center gap-1.5 hover:opacity-90"
              >
                <RefreshCcw className="h-4 w-4" /> Refresh
              </button>
            </div>
          }
        />

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Active Procurements" value="8" delta="Across all instruments" icon={FileText} />
          <KpiCard label="Stages Completed" value={String(completedStages)} delta={`${selectedRecord.id}`} icon={CheckCircle2} />
          <KpiCard label="AI Alerts" value={String(totalAlerts)} delta="Requiring attention" icon={AlertTriangle} />
          <KpiCard label="AI Agents Active" value="12" delta="All stages monitored" icon={Sparkles} />
        </div>

        {/* Main layout: sidebar list + stage map */}
        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-4">

          {/* ── Left: record selector ───────────────────────────────────── */}
          <div className="space-y-3">
            <Card>
              <div className="px-4 pt-4 pb-3 border-b border-black/8">
                <div className="text-sm font-semibold text-black mb-3">Procurement Records</div>

                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-black/30" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by title, ID, project code, entity…"
                    className="w-full h-8 pl-8 pr-3 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                {/* Class filter pills — Tender / RFQ / RFP / EOI / Auction */}
                <div className="mb-3">
                  <div className="text-[9px] font-semibold text-black/35 uppercase tracking-wider mb-1.5">Filter by Class</div>
                  <div className="flex gap-1.5 flex-wrap">
                    {(["All", "Tender", "RFQ", "RFP", "EOI", "Auction"] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`h-6 px-2.5 rounded-full text-[10px] font-semibold transition-colors
                          ${typeFilter === t ? "bg-black text-white" : "bg-[#EAF1F8] text-black/50 hover:bg-black/10"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date period filter */}
                <div>
                  <div className="text-[9px] font-semibold text-black/35 uppercase tracking-wider mb-1.5">Date Period (Opened → Closing)</div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={e => setDateFrom(e.target.value)}
                        className="w-full h-7 px-2 rounded-lg border border-black/10 text-[10px] focus:outline-none focus:ring-2 focus:ring-black/10"
                      />
                      <div className="text-[9px] text-black/30 mt-0.5 text-center">From</div>
                    </div>
                    <div className="flex-1">
                      <input
                        type="date"
                        value={dateTo}
                        onChange={e => setDateTo(e.target.value)}
                        className="w-full h-7 px-2 rounded-lg border border-black/10 text-[10px] focus:outline-none focus:ring-2 focus:ring-black/10"
                      />
                      <div className="text-[9px] text-black/30 mt-0.5 text-center">To</div>
                    </div>
                    {(dateFrom || dateTo) && (
                      <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="h-7 px-2 text-[10px] text-black/40 hover:text-black border border-black/10 rounded-lg transition-colors self-start">×</button>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 space-y-2 max-h-[calc(100vh-420px)] overflow-y-auto">
                {filteredRecords.length === 0 && (
                  <div className="text-center py-8 text-xs text-black/30">No records match your filter</div>
                )}
                {filteredRecords.map(r => (
                  <RecordCard
                    key={r.id}
                    record={r}
                    selected={selectedRecord.id === r.id}
                    onClick={() => setSelectedRecord(r)}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* ── Right: stage map ────────────────────────────────────────── */}
          <div className="space-y-4">
            <Card>
              <div className="px-5 pt-5 pb-4 border-b border-black/10">
                {/* Tender Ref / Code */}
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${TYPE_COLORS[selectedRecord.type]}`}>{selectedRecord.type}</span>
                  <span className="text-[10px] font-mono text-black/50">{selectedRecord.id}</span>
                  <span className="text-[10px] font-mono text-black/35">·</span>
                  <span className="text-[10px] font-mono text-black/50">{selectedRecord.projectCode}</span>
                  <Badge tone={STATUS_TONE[selectedRecord.status] ?? "muted"}>{selectedRecord.status}</Badge>
                  <Badge tone="muted">{selectedRecord.stageLevel}</Badge>
                </div>
                {/* Tender name — bold, large */}
                <h2 className="text-lg font-bold text-black leading-tight mb-1">{selectedRecord.title}</h2>
                <div className="text-sm font-semibold text-black/60 mb-2">{selectedRecord.projectName}</div>
                {/* Ministry · Dept · Closing · Age */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-black/50">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{selectedRecord.ministry}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{selectedRecord.department}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3 flex-shrink-0" />
                    <span>Closes: {selectedRecord.closing}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span>Age: {calcAge(selectedRecord.openedDate)}</span>
                  </div>
                </div>
              </div>

              {/* Active stage callout */}
              {activeStage && (
                <div className="mx-5 mb-3 flex items-center gap-3 bg-black text-white rounded-xl px-4 py-3">
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold">Current Stage: {activeStage.label}</div>
                    <div className="text-[11px] text-white/60 truncate">{activeStage.description}</div>
                  </div>
                  <button
                    onClick={() => setSelectedStage(activeStage)}
                    className="h-7 px-2.5 bg-white text-black rounded-lg text-[10px] font-semibold hover:bg-white/90 transition-colors flex-shrink-0 flex items-center gap-1"
                  >
                    Open <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Stage map */}
              <div className="px-5 pb-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-black/40">
                    <div className="w-3 h-3 rounded-full bg-[#0F172A]" /> Completed
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-black/40">
                    <div className="w-3 h-3 rounded-full bg-black" /> Active
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-black/40">
                    <div className="w-3 h-3 rounded-full border-2 border-black/15 bg-white" /> Pending
                  </div>
                  <span className="ml-auto text-[10px] text-black/40">Click any stage to open full toolset →</span>
                </div>
                <LifecycleStageMap record={selectedRecord} onSelectStage={setSelectedStage} />
              </div>
            </Card>

            {/* Stage summary grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stages.filter(s => s.status !== "pending").slice(0, 4).map(stage => (
                <button
                  key={stage.id}
                  onClick={() => setSelectedStage(stage)}
                  className="p-4 bg-white border border-black/8 rounded-xl text-left hover:border-black/25 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <StagePin status={stage.status} index={stage.id} />
                    <ChevronRight className="h-3.5 w-3.5 text-black/20 group-hover:text-black transition-colors" />
                  </div>
                  <div className="text-xs font-semibold text-black leading-tight">{stage.shortLabel}</div>
                  <div className="text-[10px] text-black/40 mt-0.5">{stage.owner}</div>
                  <div className="flex items-center gap-1 mt-2">
                    <Sparkles className="h-2.5 w-2.5 text-slate-400" />
                    <span className="text-[9px] text-[#0F172A]">{stage.aiRole}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Alerts for selected record */}
            {selectedRecord.aiAlerts.length > 0 && (
              <Card>
                <CardHeader
                  title="AI Alerts — Action Required"
                  action={<Badge tone="amber">{selectedRecord.aiAlerts.length} open</Badge>}
                />
                <div className="divide-y divide-black/5">
                  {selectedRecord.aiAlerts.map((alert, i) => (
                    <div key={i} className="px-5 py-3.5 flex items-start gap-3">
                      <AlertTriangle className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-black font-medium">{alert}</p>
                        <p className="text-[10px] text-black/40 mt-0.5">{selectedRecord.id} · {activeStage?.label}</p>
                      </div>
                      <button
                        onClick={() => pushNotification(`Alert resolved: ${alert}`, "success")}
                        className="h-7 px-2.5 bg-black text-white rounded-lg text-[10px] font-medium hover:opacity-90 flex-shrink-0"
                      >
                        Resolve
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Stage Detail Slide-over */}
      {selectedStage && (
        <StageDetailPanel
          record={selectedRecord}
          stage={selectedStage}
          onClose={() => setSelectedStage(null)}
        />
      )}

      <AIAssistantPanel
        agentName="Lifecycle Control AI"
        agentRole="Monitors all stages across all procurement instruments"
        context="procurement lifecycle"
        color="blue"
        suggestedPrompts={[
          "Summarise risk across all active procurements",
          "Which records are overdue at their current stage?",
          "Generate lifecycle report for ZW-PRA-2026-00183",
          "What approvals are pending right now?",
        ]}
      />
    </AppShell>
  );
}
