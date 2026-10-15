// Typed localStorage wrapper — all user data persists across reloads

export type StoredTender = {
  id: string; title: string; entity: string; category: string;
  method: string; value: string; status: string; closing: string;
  bids: number; createdBy: string; createdAt: string;
};

export type StoredRFQ = {
  id: string; title: string; dept: string; value: string;
  status: string; stage: number; deadline: string; createdBy: string;
};

export type StoredVendor = {
  id: string; name: string; category: string; email: string;
  status: string; rating: number; risk: string; registeredBy: string;
};

export type StoredInvoice = {
  id: string; vendor: string; amount: string; status: string;
  submittedDate: string; poRef: string; submittedBy: string;
};

export type StoredContract = {
  id: string; title: string; vendor: string; value: string;
  progress: number; status: string; endDate: string;
};

export type StoredAsset = {
  id: string;
  name: string;
  assetClass: string;
  category: string;
  status: "Active" | "Idle" | "Under Maintenance" | "Disposed" | "In Transfer" | "Unserviceable";
  condition: "Good" | "Fair" | "Poor" | "Critical";
  location: string;
  department: string;
  custodian: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  purchaseDate: string;
  acquisitionCost: string;
  currentValue: string;
  usefulLifeYears: number;
  depreciationMethod: "Straight-Line" | "Declining Balance" | "Units of Production";
  warrantyExpiry: string;
  lastInspectionDate: string;
  nextMaintenanceDate: string;
  barcode: string;
  notes: string;
  createdBy: string;
  createdAt: string;
};

export type StoredWorkOrder = {
  id: string;
  assetId: string;
  assetName: string;
  type: "Preventive" | "Corrective" | "Predictive" | "Emergency";
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Completed" | "Cancelled";
  description: string;
  assignedTo: string;
  scheduledDate: string;
  completedDate: string;
  laborHours: number;
  partsCost: string;
  totalCost: string;
  createdBy: string;
  createdAt: string;
};

export type StoredAssetTransfer = {
  id: string;
  assetId: string;
  assetName: string;
  fromDepartment: string;
  toDepartment: string;
  fromLocation: string;
  toLocation: string;
  fromCustodian: string;
  toCustodian: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  requestedBy: string;
  requestedAt: string;
  approvedBy: string;
};

// ── Inventory Management Types ────────────────────────────────────────────────

export type StoredInventoryItem = {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  classification: "Fast-Moving" | "Slow-Moving" | "Critical" | "High-Value" | "Hazardous" | "Consumable" | "Asset";
  unitOfMeasure: string;
  alternativeUnits: string;
  barcode: string;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  safetyStock: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  damagedStock: number;
  expiredStock: number;
  quarantineStock: number;
  unitCost: string;
  totalValue: string;
  location: string;
  warehouse: string;
  bin: string;
  supplierId: string;
  supplierName: string;
  leadTimeDays: number;
  expiryDate: string;
  lastReceivedDate: string;
  lastIssuedDate: string;
  status: "Active" | "Inactive" | "Discontinued" | "On Hold";
  photos: string[];
  notes: string;
  createdBy: string;
  createdAt: string;
};

export type StoredInventoryReceipt = {
  id: string;
  itemId: string;
  itemName: string;
  poReference: string;
  supplierId: string;
  supplierName: string;
  quantityOrdered: number;
  quantityReceived: number;
  quantityAccepted: number;
  quantityRejected: number;
  unitCost: string;
  totalValue: string;
  batchNumber: string;
  expiryDate: string;
  qualityStatus: "Pending" | "Passed" | "Failed" | "Quarantine";
  receivedBy: string;
  receivedAt: string;
  location: string;
  warehouse: string;
  notes: string;
};

export type StoredInventoryRequest = {
  id: string;
  itemId: string;
  itemName: string;
  requestedBy: string;
  requestingDepartment: string;
  quantityRequested: number;
  quantityIssued: number;
  purpose: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Pending" | "Approved" | "Partially Issued" | "Issued" | "Rejected" | "Cancelled";
  approvedBy: string;
  approvedAt: string;
  issuedBy: string;
  issuedAt: string;
  requestedAt: string;
  notes: string;
};

export type StoredStockAdjustment = {
  id: string;
  itemId: string;
  itemName: string;
  adjustmentType: "Received" | "Issued" | "Damaged" | "Expired" | "Found" | "Lost" | "Transfer" | "Return" | "Write-Off";
  quantityBefore: number;
  quantityAdjusted: number;
  quantityAfter: number;
  reason: string;
  reference: string;
  approvedBy: string;
  adjustedBy: string;
  adjustedAt: string;
  notes: string;
};

export type StoredStockCount = {
  id: string;
  countType: "Cycle Count" | "Full Stock Take" | "Spot Check";
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  scheduledDate: string;
  completedDate: string;
  countedBy: string;
  supervisedBy: string;
  totalItems: number;
  countedItems: number;
  variances: number;
  accuracyRate: number;
  notes: string;
  createdBy: string;
  createdAt: string;
};

// ── Organisation Hierarchy Types ─────────────────────────────────────────────

/** Level 1 — Ministry (root / mother entity) */
export type StoredMinistry = {
  id: string;
  name: string;
  code: string;           // e.g. MOF, MOH
  description: string;
  minister: string;
  phone: string;
  email: string;
  address: string;
  status: "Active" | "Inactive" | "Suspended";
  createdBy: string;
  createdAt: string;
};

/** Level 2a — Department (child of Ministry) */
export type StoredDepartment = {
  id: string;
  ministryId: string;     // FK → StoredMinistry.id
  name: string;
  code: string;
  description: string;
  head: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive";
  createdBy: string;
  createdAt: string;
};

/** Level 2b — State-Owned Entity (child of Ministry) */
export type StoredStateEntity = {
  id: string;
  ministryId: string;     // FK → StoredMinistry.id
  name: string;
  code: string;
  entityType: "State Enterprise" | "Revenue Authority" | "Parastatal" | "Local Authority" | "Regulatory Body" | "Development Agency";
  description: string;
  ceo: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive" | "Suspended";
  createdBy: string;
  createdAt: string;
};

/** Level 3 — Branch (grandchild — can belong to Department or StateEntity) */
export type StoredBranch = {
  id: string;
  parentId: string;       // FK → StoredDepartment.id OR StoredStateEntity.id
  parentType: "department" | "state_entity";
  ministryId: string;     // denormalised for fast lookups
  name: string;
  code: string;
  location: string;
  province: string;
  manager: string;
  phone: string;
  email: string;
  status: "Active" | "Inactive";
  createdBy: string;
  createdAt: string;
};

/** User ↔ Org mapping — links a user (by id/name/role) to an org node */
export type StoredOrgUser = {
  id: string;
  orgId: string;          // FK to any of the four levels
  orgType: "ministry" | "department" | "state_entity" | "branch";
  userId: string;         // AuthUser.id or custom id
  userName: string;
  userEmail: string;
  userRole: string;       // UserRole label
  department: string;
  assignedBy: string;
  assignedAt: string;
};

export type StoredAuditLog = {
  id: string; event: string; user: string; role: string;
  timestamp: string; risk: string;
};

export type StoredNotification = {
  id: string;
  msg: string;
  type: "info" | "success" | "warning" | "error";
  time: string;
  read: boolean;
  // optional rich fields
  from?: string;       // who triggered it
  fromRole?: string;   // their role
  category?: "action" | "ai_report" | "award" | "fraud" | "approval" | "system";
  ref?: string;        // tender/invoice/contract ref
  forCPO?: boolean;    // true = shows in CPO's senior feed
};

// ── Stage 4–6 Types ───────────────────────────────────────────────────────────
export type StoredTenderPrep = {
  id: string; tenderNumber: string; tenderTitle: string;
  ministry: string; department: string; procurementMethod: string;
  budgetAllocation: string; currency: string; approvalStatus: string;
  workflowProgress: number; closingDate: string; complianceScore: number;
  owner: string; createdAt: string; updatedAt: string;
};

export type StoredAdvertisement = {
  id: string; advertisementNumber: string; tenderTitle: string; tenderNumber: string;
  ministry: string; publicationDate: string; closingDate: string;
  status: string; workflowProgress: number; supplierCount: number;
  pendingClarifications: number; owner: string; createdAt: string;
};

export type StoredBidSubmission = {
  id: string; bidReference: string; tenderTitle: string; tenderNumber: string;
  supplierName: string; supplierEmail: string; financialProposalAmount: string;
  currency: string; status: string; workflowProgress: number;
  isEncrypted: boolean; isDigitallySigned: boolean;
  submissionReceiptNo: string; submissionTime: string;
  complianceScore: number; createdAt: string; updatedAt: string;
};

// ── Stage 11 – Contract Award ─────────────────────────────────────────────────
export type StoredContractAward = {
  id: string; awardReferenceNumber: string; tenderReference: string;
  contractNumber: string; winningSupplier: string; contractTitle: string;
  contractAmount: string; currency: string; awardDate: string;
  awardStatus: string; workflowProgress: number; ministry: string;
  complianceScore: number; owner: string; createdAt: string; updatedAt: string;
};

// ── Stage 12 – Contract Execution ────────────────────────────────────────────
export type StoredContractExecution = {
  id: string; contractNumber: string; contractTitle: string;
  supplierName: string; contractValue: string; currency: string;
  startDate: string; endDate: string; status: string;
  overallProgress: number; budgetUtilization: number;
  riskLevel: string; complianceScore: number;
  owner: string; createdAt: string; updatedAt: string;
};

// ── Stage 13 – Contract Closure ───────────────────────────────────────────────
export type StoredContractClosure = {
  id: string; contractNumber: string; tenderNumber: string;
  supplierName: string; projectTitle: string; ministry: string;
  contractValue: string; finalContractValue: string;
  completionDate: string; actualCompletionDate: string;
  contractStatus: string; finalPaymentStatus: string;
  warrantyStatus: string; retentionReleased: boolean;
  closureCertificate: boolean; complianceScore: number;
  workflowProgress: number; closedBy: string;
  createdAt: string; updatedAt: string;
};

export type StoredWarrantyClaim = {
  id: string; warrantyId: string; contractNumber: string;
  claimTitle: string; description: string; claimDate: string;
  priority: string; status: string; supplierResponse: string;
  resolvedDate: string; resolutionNotes: string;
};

export type StoredAssetHandover = {
  id: string; handoverNumber: string; contractNumber: string;
  projectTitle: string; supplierName: string; ministry: string;
  department: string; handoverDate: string; receivingOfficer: string;
  receivingDept: string; status: string; handoverCertificate: boolean;
  assetCount: number; notes: string; createdAt: string;
};

export type StoredSupplierEvaluation = {
  id: string; evalNumber: string; contractNumber: string;
  supplierName: string; supplierId: string; projectTitle: string;
  ministry: string; evaluationDate: string; evaluatorName: string;
  overallScore: number; rating: number; grade: string;
  recommendForFuture: boolean; comments: string; createdAt: string;
};

export type StoredLessonLearned = {
  id: string; refNumber: string; contractNumber: string;
  projectTitle: string; ministry: string; category: string;
  status: string; projectSummary: string; authorName: string;
  authorRole: string; submittedDate: string; tags: string[];
};

export type StoredAuditEntry = {
  id: string; event: string; user: string; role: string;
  module: string; previousValue: string; newValue: string;
  ipAddress: string; deviceInfo: string; browserInfo: string;
  digitalSignature: string; timestamp: string; risk: string;
};

type Store = {
  tenders: StoredTender[];
  rfqs: StoredRFQ[];
  vendors: StoredVendor[];
  invoices: StoredInvoice[];
  contracts: StoredContract[];
  auditLogs: StoredAuditLog[];
  notifications: StoredNotification[];
  aiReports: AIReport[];
  awardNotices: AwardNotice[];
  assets: StoredAsset[];
  workOrders: StoredWorkOrder[];
  assetTransfers: StoredAssetTransfer[];
  inventoryItems: StoredInventoryItem[];
  inventoryReceipts: StoredInventoryReceipt[];
  inventoryRequests: StoredInventoryRequest[];
  stockAdjustments: StoredStockAdjustment[];
  stockCounts: StoredStockCount[];
  ministries: StoredMinistry[];
  departments: StoredDepartment[];
  stateEntities: StoredStateEntity[];
  branches: StoredBranch[];
  orgUsers: StoredOrgUser[];
  tenderPreps: StoredTenderPrep[];
  advertisements: StoredAdvertisement[];
  bidSubmissions: StoredBidSubmission[];
  contractAwards: StoredContractAward[];
  contractExecutions: StoredContractExecution[];
  contractClosures: StoredContractClosure[];
  warrantyClaims: StoredWarrantyClaim[];
  assetHandovers: StoredAssetHandover[];
  supplierEvaluations: StoredSupplierEvaluation[];
  lessonsLearned: StoredLessonLearned[];
  auditEntries: StoredAuditEntry[];
};

export type AIReport = {
  id: string;
  officer: string;
  role: string;
  date: string;
  summary: string;
  actions: { time: string; action: string; ref: string; outcome: string }[];
  sentToCPO: boolean;
};

export type AwardNotice = {
  id: string;
  tenderId: string;
  tenderTitle: string;
  vendorName: string;
  vendorEmail: string;
  awardedBy: string;
  awardDate: string;
  contractValue: string;
  documents: string[];
  status: "sent" | "pending";
};

const KEY = "aeppois_procurement_data";

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        aiReports: [], awardNotices: [], assets: [], workOrders: [], assetTransfers: [],
        inventoryItems: [], inventoryReceipts: [], inventoryRequests: [],
        stockAdjustments: [], stockCounts: [],
        ministries: [], departments: [], stateEntities: [], branches: [], orgUsers: [],
        tenderPreps: [], advertisements: [], bidSubmissions: [],
        contractAwards: [], contractExecutions: [],
        contractClosures: [], warrantyClaims: [], assetHandovers: [],
        supplierEvaluations: [], lessonsLearned: [], auditEntries: [],
        ...parsed
      };
    }
  } catch {}
  return {
    tenders: [], rfqs: [], vendors: [], invoices: [], contracts: [], auditLogs: [],
    notifications: [], aiReports: [], awardNotices: [], assets: [], workOrders: [],
    assetTransfers: [], inventoryItems: [], inventoryReceipts: [], inventoryRequests: [],
    stockAdjustments: [], stockCounts: [],
    ministries: [], departments: [], stateEntities: [], branches: [], orgUsers: [],
    tenderPreps: [], advertisements: [], bidSubmissions: [],
    contractAwards: [], contractExecutions: [],
    contractClosures: [], warrantyClaims: [], assetHandovers: [],
    supplierEvaluations: [], lessonsLearned: [], auditEntries: [],
  };
}

function save(store: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {}
}

// Generic helpers
export function getAll<K extends keyof Store>(key: K): Store[K] {
  return load()[key] as Store[K];
}

export function addItem<K extends keyof Store>(key: K, item: Store[K][number]) {
  const store = load();
  (store[key] as unknown[]).unshift(item);
  store.auditLogs.unshift({
    id: `AUD-${Date.now()}`,
    event: `Created ${key.slice(0, -1)}: ${(item as Record<string, unknown>).title ?? (item as Record<string, unknown>).id}`,
    user: (item as Record<string, unknown>).createdBy as string ?? "System",
    role: "system",
    timestamp: new Date().toISOString(),
    risk: "Low",
  });
  save(store);
}

export function updateItem<K extends keyof Store>(
  key: K,
  id: string,
  patch: Partial<Store[K][number]>,
) {
  const store = load();
  const arr = store[key] as Record<string, unknown>[];
  const idx = arr.findIndex((x) => x.id === id);
  if (idx !== -1) { arr[idx] = { ...arr[idx], ...patch }; save(store); }
}

export function deleteItem<K extends keyof Store>(key: K, id: string) {
  const store = load();
  (store[key] as Record<string, unknown>[]) = (store[key] as Record<string, unknown>[]).filter((x) => x.id !== id);
  save(store);
}

/** Push a notification visible to the current user */
export function pushNotification(
  msg: string,
  type: "info" | "success" | "warning" | "error",
  extras?: Partial<Omit<StoredNotification, "id" | "msg" | "type" | "time" | "read">>
) {
  const store = load();
  store.notifications.unshift({
    id: `N-${Date.now()}`,
    msg,
    type,
    time: new Date().toLocaleString(),
    read: false,
    ...extras,
  });
  save(store);
}

/**
 * Push a notification AND escalate a copy to the senior feed (visible to CPO/Minister).
 * Use this whenever any officer takes a significant action.
 */
export function pushSeniorAlert(
  msg: string,
  type: "info" | "success" | "warning" | "error",
  extras?: Partial<Omit<StoredNotification, "id" | "msg" | "type" | "time" | "read">>
) {
  const store = load();
  const base: StoredNotification = {
    id: `N-${Date.now()}`,
    msg,
    type,
    time: new Date().toLocaleString(),
    read: false,
    forCPO: true,
    ...extras,
  };
  store.notifications.unshift(base);
  // Also push a CPO-tagged copy so CPO dashboard shows it separately
  store.notifications.unshift({
    ...base,
    id: `N-CPO-${Date.now()}`,
    msg: `[Senior Alert] ${msg}`,
    forCPO: true,
  });
  save(store);
}

/** Save an AI activity report for an officer, flagged for CPO review */
export function saveAIReport(report: Omit<AIReport, "id">) {
  const store = load();
  store.aiReports.unshift({ id: `RPT-${Date.now()}`, ...report });
  // Also push a CPO notification
  store.notifications.unshift({
    id: `N-AI-${Date.now()}`,
    msg: `AI Report: ${report.officer} (${report.role}) — ${report.actions.length} actions today. ${report.summary}`,
    type: "info",
    time: new Date().toLocaleString(),
    read: false,
    from: report.officer,
    fromRole: report.role,
    category: "ai_report",
    forCPO: true,
  });
  save(store);
}

/** Save a tender award notice and send congratulation + documents message */
export function saveAwardNotice(notice: Omit<AwardNotice, "id">) {
  const store = load();
  const id = `AWD-${Date.now()}`;
  store.awardNotices.unshift({ id, ...notice });
  // Push notification for current user
  store.notifications.unshift({
    id: `N-AWD-${Date.now()}`,
    msg: `Award issued: ${notice.tenderTitle} → ${notice.vendorName}`,
    type: "success",
    time: new Date().toLocaleString(),
    read: false,
    category: "award",
    ref: notice.tenderId,
    forCPO: true,
  });
  // Push CPO senior alert
  store.notifications.unshift({
    id: `N-CPO-AWD-${Date.now()}`,
    msg: `[Senior Alert] Contract awarded by ${notice.awardedBy}: ${notice.tenderTitle} → ${notice.vendorName} (${notice.contractValue})`,
    type: "success",
    time: new Date().toLocaleString(),
    read: false,
    category: "award",
    ref: notice.tenderId,
    from: notice.awardedBy,
    forCPO: true,
  });
  save(store);
  return id;
}

export function markNotificationsRead() {
  const store = load();
  store.notifications = store.notifications.map((n) => ({ ...n, read: true }));
  save(store);
}

export function clearStore() {
  localStorage.removeItem(KEY);
}

// Seed some initial data if empty
export function seedIfEmpty(userName: string) {
  const store = load();
  if (store.tenders.length === 0) {
    store.tenders = [
      { id: "ZW-PRA-2026-00184", title: "Solar Mini-Grids — 12 Rural Clinics", entity: "Ministry of Energy", category: "Infrastructure", method: "Open", value: "USD 14,800,000", status: "Bidding", closing: "2026-07-08", bids: 11, createdBy: userName, createdAt: new Date().toISOString() },
      { id: "ZW-PRA-2026-00183", title: "ARV Medicines Framework (2yr)", entity: "Ministry of Health", category: "Health & Pharma", method: "Framework", value: "USD 42,500,000", status: "Evaluation", closing: "2026-06-12", bids: 8, createdBy: userName, createdAt: new Date().toISOString() },
      { id: "ZW-PRA-2026-00182", title: "National Tax Administration System II", entity: "ZIMRA", category: "ICT & Digital", method: "Restricted", value: "USD 9,200,000", status: "Bidding", closing: "2026-07-21", bids: 5, createdBy: userName, createdAt: new Date().toISOString() },
    ];
    store.rfqs = [
      { id: "RFQ-2026-0892", title: "Office Stationery Q3 2026", dept: "Finance Dept", value: "USD 4,200", status: "Active", stage: 5, deadline: "2026-06-28", createdBy: userName },
      { id: "RFQ-2026-0891", title: "Printer Cartridges & Toner", dept: "IT Department", value: "USD 1,800", status: "Evaluating", stage: 9, deadline: "2026-06-25", createdBy: userName },
    ];
    store.vendors = [
      { id: "VEN-00482", name: "Highveld Engineering (Pvt) Ltd", category: "Infrastructure", email: "info@highveld.co.zw", status: "Approved", rating: 4.7, risk: "Low", registeredBy: "System" },
      { id: "VEN-00481", name: "Zimbabwe Pharma Holdings", category: "Health & Pharma", email: "procurement@zph.co.zw", status: "Approved", rating: 4.5, risk: "Low", registeredBy: "System" },
      { id: "VEN-00480", name: "Sable ICT Solutions", category: "ICT & Digital", email: "bids@sableict.co.zw", status: "Approved", rating: 4.2, risk: "Medium", registeredBy: "System" },
    ];
    store.contracts = [
      { id: "CN-2026-0411", title: "Beitbridge Highway Section 3", vendor: "Highveld Engineering", value: "USD 71.0M", progress: 64, status: "On Track", endDate: "2026-12-15" },
      { id: "CN-2026-0418", title: "ARV Medicines Framework", vendor: "Zimbabwe Pharma Holdings", value: "USD 42.5M", progress: 38, status: "On Track", endDate: "2028-03-31" },
    ];
    store.invoices = [
      { id: "INV-2026-4821", vendor: "Highveld Engineering", amount: "USD 2,840,000", status: "Approved", submittedDate: "2026-06-15", poRef: "PO-2026-0411", submittedBy: "J. Banda" },
    ];
    // Seed some CPO senior alerts so the feed is not empty
    store.notifications = [
      { id: "N-SEED-1", msg: "[Senior Alert] Finance Officer approved INV-2026-4821 — USD 2,840,000 (Highveld Engineering)", type: "success", time: new Date().toLocaleString(), read: false, from: "R. Chikwanda", fromRole: "Finance Officer", category: "action", forCPO: true },
      { id: "N-SEED-2", msg: "[Senior Alert] Compliance Officer flagged EXC-2026-089 — missing legal clearance on ZW-PRA-2026-00182", type: "warning", time: new Date().toLocaleString(), read: false, from: "System", fromRole: "Compliance Officer", category: "action", forCPO: true },
      { id: "N-SEED-3", msg: "[Senior Alert] Anti-Corruption Officer referred bid rotation case FRD-2026-089 to ZACC", type: "error", time: new Date().toLocaleString(), read: false, from: "System", fromRole: "Anti-Corruption Officer", category: "fraud", forCPO: true },
      { id: "N-SEED-4", msg: "AI Report: Finance Officer (R. Chikwanda) — 6 actions today. 3 invoices approved, 2 flagged, 1 scheduled for payment.", type: "info", time: new Date().toLocaleString(), read: false, category: "ai_report", forCPO: true },
    ];
    // Seed asset data
    if (!store.assets || store.assets.length === 0) {
      store.assets = [
        { id: "AST-2026-00001", name: "Toyota Land Cruiser VDJ200 — ZW 4821 AH", assetClass: "Vehicles & Fleets", category: "Government Vehicle", status: "Active", condition: "Good", location: "Harare Motor Pool", department: "Ministry of Transport", custodian: "T. Moyo", serialNumber: "VDJ200-882143", manufacturer: "Toyota", model: "Land Cruiser 200", purchaseDate: "2023-03-15", acquisitionCost: "USD 98,500", currentValue: "USD 74,200", usefulLifeYears: 10, depreciationMethod: "Straight-Line", warrantyExpiry: "2026-03-14", lastInspectionDate: "2026-04-10", nextMaintenanceDate: "2026-07-10", barcode: "BC-AST-00001", notes: "Official government vehicle", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "AST-2026-00002", name: "Dell PowerEdge R750 Server", assetClass: "IT Equipment", category: "Server Hardware", status: "Active", condition: "Good", location: "Harare Data Centre — Rack C4", department: "ZIMRA", custodian: "A. Mpofu", serialNumber: "SVRC-D750-2024-001", manufacturer: "Dell Technologies", model: "PowerEdge R750", purchaseDate: "2024-01-20", acquisitionCost: "USD 24,800", currentValue: "USD 19,840", usefulLifeYears: 5, depreciationMethod: "Straight-Line", warrantyExpiry: "2027-01-19", lastInspectionDate: "2026-05-01", nextMaintenanceDate: "2026-08-01", barcode: "BC-AST-00002", notes: "Primary database server for ZIMRA TMS", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "AST-2026-00003", name: "Caterpillar 320 Excavator", assetClass: "Plant & Machinery", category: "Construction Equipment", status: "Under Maintenance", condition: "Fair", location: "Beitbridge Site Yard", department: "Ministry of Transport", custodian: "J. Banda", serialNumber: "CAT320-ZW-0048", manufacturer: "Caterpillar", model: "320 Hydraulic Excavator", purchaseDate: "2021-06-01", acquisitionCost: "USD 142,000", currentValue: "USD 98,600", usefulLifeYears: 15, depreciationMethod: "Declining Balance", warrantyExpiry: "2024-05-31", lastInspectionDate: "2026-03-20", nextMaintenanceDate: "2026-06-25", barcode: "BC-AST-00003", notes: "Deployed on Beitbridge–Harare highway project", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "AST-2026-00004", name: "Mashonaland Rural Clinic A — Bindura", assetClass: "Property & Buildings", category: "Government Building", status: "Active", condition: "Good", location: "Bindura, Mashonaland Central", department: "Ministry of Health", custodian: "P. Dube", serialNumber: "PROP-MHC-BIND-001", manufacturer: "N/A", model: "Clinic Block", purchaseDate: "2019-11-05", acquisitionCost: "USD 480,000", currentValue: "USD 420,000", usefulLifeYears: 50, depreciationMethod: "Straight-Line", warrantyExpiry: "N/A", lastInspectionDate: "2026-02-14", nextMaintenanceDate: "2026-11-01", barcode: "BC-AST-00004", notes: "100-bed rural clinic", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "AST-2026-00005", name: "Solar Power Generator — 50kVA", assetClass: "Production Equipment", category: "Energy Equipment", status: "Active", condition: "Good", location: "Masvingo General Hospital", department: "Ministry of Health", custodian: "S. Nkosi", serialNumber: "SLR-GEN-50KVA-007", manufacturer: "SunPower Zimbabwe", model: "SP-50KVA Gen", purchaseDate: "2025-02-10", acquisitionCost: "USD 38,200", currentValue: "USD 34,580", usefulLifeYears: 20, depreciationMethod: "Straight-Line", warrantyExpiry: "2030-02-09", lastInspectionDate: "2026-05-15", nextMaintenanceDate: "2026-08-15", barcode: "BC-AST-00005", notes: "Main backup power for hospital", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "AST-2026-00006", name: "HP OfficeJet Pro 9025e Multifunction Printer", assetClass: "IT Equipment", category: "Printing Equipment", status: "Idle", condition: "Good", location: "PRAZ HQ — Floor 3", department: "PRAZ", custodian: "R. Chikwanda", serialNumber: "HP9025-ZW-0284", manufacturer: "HP Inc.", model: "OfficeJet Pro 9025e", purchaseDate: "2024-07-01", acquisitionCost: "USD 820", currentValue: "USD 640", usefulLifeYears: 5, depreciationMethod: "Straight-Line", warrantyExpiry: "2027-06-30", lastInspectionDate: "2026-04-30", nextMaintenanceDate: "2026-10-01", barcode: "BC-AST-00006", notes: "Procurement tender printing unit", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "AST-2026-00007", name: "Fluke 87V Industrial Multimeter", assetClass: "Tools & Instruments", category: "Electrical Instrument", status: "Active", condition: "Good", location: "ZETDC Workshop — Bulawayo", department: "ZETDC", custodian: "A. Mpofu", serialNumber: "FLK87V-BYO-021", manufacturer: "Fluke Corporation", model: "87V True-RMS", purchaseDate: "2022-09-14", acquisitionCost: "USD 540", currentValue: "USD 380", usefulLifeYears: 10, depreciationMethod: "Straight-Line", warrantyExpiry: "2025-09-13", lastInspectionDate: "2026-01-20", nextMaintenanceDate: "2027-01-20", barcode: "BC-AST-00007", notes: "Calibrated — next calibration Jan 2027", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "AST-2026-00008", name: "Herman Miller Aeron Chair — Series B", assetClass: "Furniture & Office Assets", category: "Office Furniture", status: "Active", condition: "Good", location: "Cabinet Office — Office 14B", department: "Cabinet Office", custodian: "Hon. B. Mutasa", serialNumber: "HM-AERON-B-0091", manufacturer: "Herman Miller", model: "Aeron Series B", purchaseDate: "2023-01-10", acquisitionCost: "USD 1,480", currentValue: "USD 1,120", usefulLifeYears: 10, depreciationMethod: "Straight-Line", warrantyExpiry: "2035-01-09", lastInspectionDate: "2025-12-01", nextMaintenanceDate: "2026-12-01", barcode: "BC-AST-00008", notes: "Executive office furniture", createdBy: userName, createdAt: new Date().toISOString() },
      ];
      store.workOrders = [
        { id: "WO-2026-0001", assetId: "AST-2026-00003", assetName: "Caterpillar 320 Excavator", type: "Corrective", priority: "High", status: "In Progress", description: "Hydraulic pump failure — oil leak detected at boom cylinder", assignedTo: "B. Ndlovu (Technician)", scheduledDate: "2026-06-20", completedDate: "", laborHours: 16, partsCost: "USD 4,200", totalCost: "USD 5,800", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "WO-2026-0002", assetId: "AST-2026-00001", assetName: "Toyota Land Cruiser VDJ200", type: "Preventive", priority: "Medium", status: "Open", description: "Scheduled 60,000km service — oil change, filters, brake inspection", assignedTo: "CABS Motor Services", scheduledDate: "2026-07-10", completedDate: "", laborHours: 6, partsCost: "USD 320", totalCost: "USD 680", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "WO-2026-0003", assetId: "AST-2026-00005", assetName: "Solar Power Generator 50kVA", type: "Preventive", priority: "Medium", status: "Completed", description: "Quarterly battery bank inspection and electrolyte check", assignedTo: "SunPower Zimbabwe (SLA)", scheduledDate: "2026-05-15", completedDate: "2026-05-15", laborHours: 4, partsCost: "USD 0", totalCost: "USD 400", createdBy: userName, createdAt: new Date().toISOString() },
      ];
      store.assetTransfers = [
        { id: "TRF-2026-0001", assetId: "AST-2026-00006", assetName: "HP OfficeJet Pro 9025e", fromDepartment: "Finance Dept", toDepartment: "PRAZ", fromLocation: "MOF — Floor 2", toLocation: "PRAZ HQ — Floor 3", fromCustodian: "E. Chirwa", toCustodian: "R. Chikwanda", reason: "Departmental restructuring — surplus equipment reallocation", status: "Completed", requestedBy: userName, requestedAt: "2026-06-01", approvedBy: "T. Moyo (CPO)" },
        { id: "TRF-2026-0002", assetId: "AST-2026-00001", assetName: "Toyota Land Cruiser VDJ200", fromDepartment: "Ministry of Transport", toDepartment: "Ministry of Health", fromLocation: "Harare Motor Pool", toLocation: "Masvingo Provincial Hospital", fromCustodian: "T. Moyo", toCustodian: "P. Dube", reason: "Emergency health service fleet reinforcement", status: "Pending", requestedBy: userName, requestedAt: "2026-06-18", approvedBy: "" },
      ];
    }
    // Seed inventory data
    if (!store.inventoryItems || store.inventoryItems.length === 0) {
      store.inventoryItems = [
        { id: "INV-2026-00001", sku: "MED-ARV-TDF3TC", name: "ARV Tenofovir/Lamivudine 300/300mg Tablets", description: "Antiretroviral medication for HIV treatment — 30-tablet blister pack", category: "Pharmaceuticals", classification: "Critical", unitOfMeasure: "Pack", alternativeUnits: "Tablets", barcode: "BC-INV-00001", minStockLevel: 500, maxStockLevel: 5000, reorderPoint: 800, safetyStock: 300, currentStock: 1240, reservedStock: 180, availableStock: 1060, damagedStock: 0, expiredStock: 12, quarantineStock: 0, unitCost: "USD 8.50", totalValue: "USD 10,540", location: "Warehouse A — Shelf B3", warehouse: "Harare Medical Stores", bin: "B3-14", supplierId: "VEN-00481", supplierName: "Zimbabwe Pharma Holdings", leadTimeDays: 21, expiryDate: "2027-12-31", lastReceivedDate: "2026-05-15", lastIssuedDate: "2026-06-18", status: "Active", photos: [], notes: "Cold chain not required", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "INV-2026-00002", sku: "OFF-A4-80GSM", name: "A4 Printing Paper 80gsm (Box of 5 Reams)", description: "Standard office printing paper, white, 80gsm, 500 sheets per ream", category: "Office Supplies", classification: "Fast-Moving", unitOfMeasure: "Box", alternativeUnits: "Reams", barcode: "BC-INV-00002", minStockLevel: 50, maxStockLevel: 500, reorderPoint: 80, safetyStock: 40, currentStock: 124, reservedStock: 20, availableStock: 104, damagedStock: 2, expiredStock: 0, quarantineStock: 0, unitCost: "USD 12.00", totalValue: "USD 1,488", location: "Warehouse B — Shelf A1", warehouse: "PRAZ General Stores", bin: "A1-02", supplierId: "VEN-00480", supplierName: "Sable ICT Solutions", leadTimeDays: 7, expiryDate: "N/A", lastReceivedDate: "2026-06-01", lastIssuedDate: "2026-06-20", status: "Active", photos: [], notes: "High-velocity consumable", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "INV-2026-00003", sku: "ICT-LAPTOP-DEL15", name: "Dell Latitude 5540 Laptop 15\"", description: "Business laptop, Intel Core i7, 16GB RAM, 512GB SSD, Windows 11 Pro", category: "ICT Equipment", classification: "High-Value", unitOfMeasure: "Unit", alternativeUnits: "", barcode: "BC-INV-00003", minStockLevel: 5, maxStockLevel: 50, reorderPoint: 8, safetyStock: 3, currentStock: 18, reservedStock: 5, availableStock: 13, damagedStock: 1, expiredStock: 0, quarantineStock: 2, unitCost: "USD 1,280", totalValue: "USD 23,040", location: "Warehouse B — Cage C1", warehouse: "PRAZ General Stores", bin: "C1-CAGE", supplierId: "VEN-00480", supplierName: "Sable ICT Solutions", leadTimeDays: 14, expiryDate: "N/A", lastReceivedDate: "2026-04-20", lastIssuedDate: "2026-06-15", status: "Active", photos: [], notes: "Secured cage storage required", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "INV-2026-00004", sku: "CON-CEMENT-42.5N", name: "Portland Cement 42.5N (50kg Bag)", description: "Ordinary Portland Cement, Grade 42.5N, suitable for structural concrete", category: "Construction Materials", classification: "Fast-Moving", unitOfMeasure: "Bag", alternativeUnits: "Tonnes", barcode: "BC-INV-00004", minStockLevel: 200, maxStockLevel: 2000, reorderPoint: 350, safetyStock: 150, currentStock: 680, reservedStock: 200, availableStock: 480, damagedStock: 15, expiredStock: 0, quarantineStock: 0, unitCost: "USD 9.80", totalValue: "USD 6,664", location: "Warehouse C — Bay 1", warehouse: "Beitbridge Site Store", bin: "BAY-01", supplierId: "VEN-00482", supplierName: "Highveld Engineering", leadTimeDays: 3, expiryDate: "2027-03-01", lastReceivedDate: "2026-06-10", lastIssuedDate: "2026-06-21", status: "Active", photos: [], notes: "Store in dry conditions, avoid moisture", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "INV-2026-00005", sku: "CHEM-CHLORINE-HTH", name: "HTH Chlorine Granules 70% (25kg Drum)", description: "High-test hypochlorite granules for water treatment and disinfection", category: "Chemicals", classification: "Hazardous", unitOfMeasure: "Drum", alternativeUnits: "kg", barcode: "BC-INV-00005", minStockLevel: 10, maxStockLevel: 100, reorderPoint: 20, safetyStock: 8, currentStock: 34, reservedStock: 8, availableStock: 26, damagedStock: 0, expiredStock: 0, quarantineStock: 3, unitCost: "USD 42.00", totalValue: "USD 1,428", location: "Hazmat Store — Bay H1", warehouse: "Harare Water Treatment", bin: "H1-HAZMAT", supplierId: "VEN-00479", supplierName: "Mashonaland Agri Supplies", leadTimeDays: 10, expiryDate: "2027-06-30", lastReceivedDate: "2026-05-28", lastIssuedDate: "2026-06-12", status: "Active", photos: [], notes: "HAZMAT — PPE required. Store separately from flammables.", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "INV-2026-00006", sku: "FUEL-DIESEL-BULK", name: "Diesel Fuel (Bulk Litres)", description: "Ultra-low sulphur diesel for government vehicle fleet and generators", category: "Fuel & Lubricants", classification: "Fast-Moving", unitOfMeasure: "Litre", alternativeUnits: "KL", barcode: "BC-INV-00006", minStockLevel: 5000, maxStockLevel: 50000, reorderPoint: 8000, safetyStock: 3000, currentStock: 22400, reservedStock: 4000, availableStock: 18400, damagedStock: 0, expiredStock: 0, quarantineStock: 0, unitCost: "USD 1.42", totalValue: "USD 31,808", location: "Fuel Depot — Tank F1", warehouse: "Harare Motor Pool", bin: "FUEL-TANK-F1", supplierId: "VEN-00479", supplierName: "Mashonaland Agri Supplies", leadTimeDays: 2, expiryDate: "N/A", lastReceivedDate: "2026-06-18", lastIssuedDate: "2026-06-22", status: "Active", photos: [], notes: "Underground tank capacity 50,000L", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "INV-2026-00007", sku: "MED-GLOVES-NITRILE-M", name: "Nitrile Examination Gloves Medium (Box 100)", description: "Powder-free nitrile gloves, medium size, medical grade", category: "Medical Supplies", classification: "Consumable", unitOfMeasure: "Box", alternativeUnits: "Pairs", barcode: "BC-INV-00007", minStockLevel: 100, maxStockLevel: 2000, reorderPoint: 200, safetyStock: 80, currentStock: 845, reservedStock: 100, availableStock: 745, damagedStock: 5, expiredStock: 0, quarantineStock: 0, unitCost: "USD 6.40", totalValue: "USD 5,408", location: "Warehouse A — Shelf D2", warehouse: "Harare Medical Stores", bin: "D2-08", supplierId: "VEN-00481", supplierName: "Zimbabwe Pharma Holdings", leadTimeDays: 14, expiryDate: "2028-08-31", lastReceivedDate: "2026-05-20", lastIssuedDate: "2026-06-19", status: "Active", photos: [], notes: "Standard PPE item", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "INV-2026-00008", sku: "AGR-FERTILISER-NPK", name: "NPK 10-20-20 Compound Fertiliser (50kg Bag)", description: "Granular compound fertiliser for Pfumvudza programme distribution", category: "Agricultural Inputs", classification: "Slow-Moving", unitOfMeasure: "Bag", alternativeUnits: "Tonnes", barcode: "BC-INV-00008", minStockLevel: 1000, maxStockLevel: 50000, reorderPoint: 2000, safetyStock: 800, currentStock: 8420, reservedStock: 2000, availableStock: 6420, damagedStock: 120, expiredStock: 0, quarantineStock: 0, unitCost: "USD 22.50", totalValue: "USD 189,450", location: "Warehouse D — Bay 3", warehouse: "Mashonaland Agri Depot", bin: "BAY-03", supplierId: "VEN-00479", supplierName: "Mashonaland Agri Supplies", leadTimeDays: 30, expiryDate: "2026-10-31", lastReceivedDate: "2026-04-01", lastIssuedDate: "2026-06-01", status: "Active", photos: [], notes: "Seasonal item — Pfumvudza 2026 season", createdBy: userName, createdAt: new Date().toISOString() },
      ];
      store.inventoryReceipts = [
        { id: "GRN-2026-0001", itemId: "INV-2026-00001", itemName: "ARV Tenofovir/Lamivudine Tablets", poReference: "PO-2026-0418", supplierId: "VEN-00481", supplierName: "Zimbabwe Pharma Holdings", quantityOrdered: 500, quantityReceived: 498, quantityAccepted: 486, quantityRejected: 12, unitCost: "USD 8.50", totalValue: "USD 4,131", batchNumber: "BATCH-ARV-2026-14", expiryDate: "2027-12-31", qualityStatus: "Passed", receivedBy: userName, receivedAt: "2026-05-15", location: "Warehouse A — Shelf B3", warehouse: "Harare Medical Stores", notes: "12 packs rejected — packaging damage" },
        { id: "GRN-2026-0002", itemId: "INV-2026-00006", itemName: "Diesel Fuel (Bulk)", poReference: "PO-2026-0420", supplierId: "VEN-00479", supplierName: "Mashonaland Agri Supplies", quantityOrdered: 10000, quantityReceived: 10000, quantityAccepted: 10000, quantityRejected: 0, unitCost: "USD 1.42", totalValue: "USD 14,200", batchNumber: "N/A", expiryDate: "N/A", qualityStatus: "Passed", receivedBy: userName, receivedAt: "2026-06-18", location: "Fuel Depot", warehouse: "Harare Motor Pool", notes: "Full delivery — tank dip confirmed" },
        { id: "GRN-2026-0003", itemId: "INV-2026-00003", itemName: "Dell Latitude 5540 Laptops", poReference: "PO-2026-0415", supplierId: "VEN-00480", supplierName: "Sable ICT Solutions", quantityOrdered: 20, quantityReceived: 20, quantityAccepted: 18, quantityRejected: 0, unitCost: "USD 1,280", totalValue: "USD 25,600", batchNumber: "DELL-5540-2026-B3", expiryDate: "N/A", qualityStatus: "Quarantine", receivedBy: userName, receivedAt: "2026-04-20", location: "Warehouse B — Cage C1", warehouse: "PRAZ General Stores", notes: "2 units quarantined — awaiting IT configuration check" },
      ];
      store.inventoryRequests = [
        { id: "IRQ-2026-0001", itemId: "INV-2026-00002", itemName: "A4 Printing Paper 80gsm", requestedBy: "R. Chikwanda", requestingDepartment: "Finance Department", quantityRequested: 20, quantityIssued: 20, purpose: "Monthly office operations — printing requirements", priority: "Medium", status: "Issued", approvedBy: "T. Moyo", approvedAt: "2026-06-20", issuedBy: userName, issuedAt: "2026-06-20", requestedAt: "2026-06-19", notes: "" },
        { id: "IRQ-2026-0002", itemId: "INV-2026-00001", itemName: "ARV Tenofovir/Lamivudine Tablets", requestedBy: "P. Dube", requestingDepartment: "Ministry of Health", quantityRequested: 100, quantityIssued: 0, purpose: "Bindura clinic resupply — critical patient need", priority: "Urgent", status: "Approved", approvedBy: "T. Moyo", approvedAt: "2026-06-21", issuedBy: "", issuedAt: "", requestedAt: "2026-06-20", notes: "Urgent — clinic stock critically low" },
        { id: "IRQ-2026-0003", itemId: "INV-2026-00003", itemName: "Dell Latitude 5540 Laptops", requestedBy: "A. Mpofu", requestingDepartment: "PRAZ IT Department", quantityRequested: 5, quantityIssued: 0, purpose: "New staff onboarding — Q3 2026", priority: "High", status: "Pending", approvedBy: "", approvedAt: "", issuedBy: "", issuedAt: "", requestedAt: "2026-06-21", notes: "" },
      ];
      store.stockAdjustments = [
        { id: "ADJ-2026-0001", itemId: "INV-2026-00001", itemName: "ARV Tenofovir/Lamivudine Tablets", adjustmentType: "Issued", quantityBefore: 1340, quantityAdjusted: -100, quantityAfter: 1240, reason: "Issued to Harare Polyclinic", reference: "IRQ-2026-PREV-048", approvedBy: "T. Moyo", adjustedBy: userName, adjustedAt: "2026-06-18", notes: "" },
        { id: "ADJ-2026-0002", itemId: "INV-2026-00004", itemName: "Portland Cement 42.5N", adjustmentType: "Damaged", quantityBefore: 695, quantityAdjusted: -15, quantityAfter: 680, reason: "Water ingress damage — bags split", reference: "DMG-2026-0042", approvedBy: "T. Moyo", adjustedBy: userName, adjustedAt: "2026-06-20", notes: "Damaged stock written off — insurance claim filed" },
      ];
      store.stockCounts = [
        { id: "STC-2026-0001", countType: "Cycle Count", status: "Completed", scheduledDate: "2026-06-15", completedDate: "2026-06-15", countedBy: userName, supervisedBy: "T. Moyo", totalItems: 8, countedItems: 8, variances: 1, accuracyRate: 98.2, notes: "Minor variance in cement stock — investigated and explained", createdBy: userName, createdAt: new Date().toISOString() },
        { id: "STC-2026-0002", countType: "Full Stock Take", status: "Scheduled", scheduledDate: "2026-07-01", completedDate: "", countedBy: "All Stores Staff", supervisedBy: "T. Moyo", totalItems: 0, countedItems: 0, variances: 0, accuracyRate: 0, notes: "Q2 2026 Annual stock take", createdBy: userName, createdAt: new Date().toISOString() },
      ];
    }
    save(store);
  }
}

