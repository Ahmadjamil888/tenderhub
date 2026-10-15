import { useState, useCallback } from "react";
import { getAll, addItem, updateItem, deleteItem, pushNotification } from "@/lib/local-store";
import type {
  StoredTender, StoredRFQ, StoredVendor, StoredInvoice, StoredContract,
  StoredAsset, StoredWorkOrder, StoredAssetTransfer,
  StoredInventoryItem, StoredInventoryReceipt, StoredInventoryRequest,
  StoredStockAdjustment, StoredStockCount,
  StoredTenderPrep, StoredAdvertisement, StoredBidSubmission,
  StoredContractAward, StoredContractExecution,
  StoredContractClosure, StoredWarrantyClaim, StoredAssetHandover,
  StoredSupplierEvaluation, StoredLessonLearned, StoredAuditEntry,
} from "@/lib/local-store";

export function useTenders() {
  const [tenders, setTenders] = useState<StoredTender[]>(() => getAll("tenders"));
  const refresh = useCallback(() => setTenders(getAll("tenders")), []);

  const add = (t: StoredTender) => { addItem("tenders", t); pushNotification(`New tender created: ${t.title}`, "success"); refresh(); };
  const update = (id: string, patch: Partial<StoredTender>) => { updateItem("tenders", id, patch); refresh(); };
  const remove = (id: string) => { deleteItem("tenders", id); refresh(); };

  return { tenders, add, update, remove, refresh };
}

export function useRFQs() {
  const [rfqs, setRFQs] = useState<StoredRFQ[]>(() => getAll("rfqs"));
  const refresh = useCallback(() => setRFQs(getAll("rfqs")), []);

  const add = (r: StoredRFQ) => { addItem("rfqs", r); pushNotification(`New RFQ created: ${r.title}`, "success"); refresh(); };
  const update = (id: string, patch: Partial<StoredRFQ>) => { updateItem("rfqs", id, patch); refresh(); };
  const remove = (id: string) => { deleteItem("rfqs", id); refresh(); };

  return { rfqs, add, update, remove, refresh };
}

export function useVendors() {
  const [vendors, setVendors] = useState<StoredVendor[]>(() => getAll("vendors"));
  const refresh = useCallback(() => setVendors(getAll("vendors")), []);

  const add = (v: StoredVendor) => { addItem("vendors", v); refresh(); };
  const update = (id: string, patch: Partial<StoredVendor>) => { updateItem("vendors", id, patch); refresh(); };

  return { vendors, add, update, refresh };
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<StoredInvoice[]>(() => getAll("invoices"));
  const refresh = useCallback(() => setInvoices(getAll("invoices")), []);

  const add = (inv: StoredInvoice) => { addItem("invoices", inv); refresh(); };
  const update = (id: string, patch: Partial<StoredInvoice>) => { updateItem("invoices", id, patch); refresh(); };

  return { invoices, add, update, refresh };
}

export function useContracts() {
  const [contracts, setContracts] = useState<StoredContract[]>(() => getAll("contracts"));
  const refresh = useCallback(() => setContracts(getAll("contracts")), []);
  const update = (id: string, patch: Partial<StoredContract>) => { updateItem("contracts", id, patch); refresh(); };
  return { contracts, update, refresh };
}

export function useAssets() {
  const [assets, setAssets] = useState<StoredAsset[]>(() => getAll("assets"));
  const refresh = useCallback(() => setAssets(getAll("assets")), []);
  const add = (a: StoredAsset) => { addItem("assets", a); pushNotification(`Asset registered: ${a.name}`, "success"); refresh(); };
  const update = (id: string, patch: Partial<StoredAsset>) => { updateItem("assets", id, patch); refresh(); };
  const remove = (id: string) => { deleteItem("assets", id); refresh(); };
  return { assets, add, update, remove, refresh };
}

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<StoredWorkOrder[]>(() => getAll("workOrders"));
  const refresh = useCallback(() => setWorkOrders(getAll("workOrders")), []);
  const add = (w: StoredWorkOrder) => { addItem("workOrders", w); pushNotification(`Work order created: ${w.id}`, "success"); refresh(); };
  const update = (id: string, patch: Partial<StoredWorkOrder>) => { updateItem("workOrders", id, patch); refresh(); };
  return { workOrders, add, update, refresh };
}

export function useAssetTransfers() {
  const [transfers, setTransfers] = useState<StoredAssetTransfer[]>(() => getAll("assetTransfers"));
  const refresh = useCallback(() => setTransfers(getAll("assetTransfers")), []);
  const add = (t: StoredAssetTransfer) => { addItem("assetTransfers", t); pushNotification(`Transfer request submitted: ${t.assetName}`, "info"); refresh(); };
  const update = (id: string, patch: Partial<StoredAssetTransfer>) => { updateItem("assetTransfers", id, patch); refresh(); };
  return { transfers, add, update, refresh };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState(() => getAll("notifications"));
  const refresh = useCallback(() => setNotifications(getAll("notifications")), []);
  return { notifications, unread: notifications.filter(n => !n.read).length, refresh };
}

export function useInventoryItems() {
  const [items, setItems] = useState<StoredInventoryItem[]>(() => getAll("inventoryItems"));
  const refresh = useCallback(() => setItems(getAll("inventoryItems")), []);
  const add = (item: StoredInventoryItem) => { addItem("inventoryItems", item); pushNotification(`Item created: ${item.name}`, "success"); refresh(); };
  const update = (id: string, patch: Partial<StoredInventoryItem>) => { updateItem("inventoryItems", id, patch); refresh(); };
  const remove = (id: string) => { deleteItem("inventoryItems", id); refresh(); };
  return { items, add, update, remove, refresh };
}

export function useInventoryReceipts() {
  const [receipts, setReceipts] = useState<StoredInventoryReceipt[]>(() => getAll("inventoryReceipts"));
  const refresh = useCallback(() => setReceipts(getAll("inventoryReceipts")), []);
  const add = (r: StoredInventoryReceipt) => { addItem("inventoryReceipts", r); pushNotification(`Goods received: ${r.itemName}`, "success"); refresh(); };
  const update = (id: string, patch: Partial<StoredInventoryReceipt>) => { updateItem("inventoryReceipts", id, patch); refresh(); };
  return { receipts, add, update, refresh };
}

export function useInventoryRequests() {
  const [requests, setRequests] = useState<StoredInventoryRequest[]>(() => getAll("inventoryRequests"));
  const refresh = useCallback(() => setRequests(getAll("inventoryRequests")), []);
  const add = (r: StoredInventoryRequest) => { addItem("inventoryRequests", r); pushNotification(`Request submitted: ${r.itemName}`, "info"); refresh(); };
  const update = (id: string, patch: Partial<StoredInventoryRequest>) => { updateItem("inventoryRequests", id, patch); refresh(); };
  return { requests, add, update, refresh };
}

export function useStockAdjustments() {
  const [adjustments, setAdjustments] = useState<StoredStockAdjustment[]>(() => getAll("stockAdjustments"));
  const refresh = useCallback(() => setAdjustments(getAll("stockAdjustments")), []);
  const add = (a: StoredStockAdjustment) => { addItem("stockAdjustments", a); pushNotification(`Stock adjustment: ${a.itemName}`, "warning"); refresh(); };
  return { adjustments, add, refresh };
}

export function useStockCounts() {
  const [counts, setCounts] = useState<StoredStockCount[]>(() => getAll("stockCounts"));
  const refresh = useCallback(() => setCounts(getAll("stockCounts")), []);
  const add = (c: StoredStockCount) => { addItem("stockCounts", c); pushNotification(`Stock count created: ${c.id}`, "info"); refresh(); };
  const update = (id: string, patch: Partial<StoredStockCount>) => { updateItem("stockCounts", id, patch); refresh(); };
  return { counts, add, update, refresh };
}

export function useContractAwards() {
  const [awards, setAwards] = useState<StoredContractAward[]>(() => getAll("contractAwards"));
  const refresh = useCallback(() => setAwards(getAll("contractAwards")), []);
  const add = (a: StoredContractAward) => { addItem("contractAwards", a); pushNotification(`Contract award created: ${a.contractNumber}`, "success"); refresh(); };
  const update = (id: string, patch: Partial<StoredContractAward>) => { updateItem("contractAwards", id, patch); refresh(); };
  const remove = (id: string) => { deleteItem("contractAwards", id); refresh(); };
  return { awards, add, update, remove, refresh };
}

export function useContractExecutions() {
  const [executions, setExecutions] = useState<StoredContractExecution[]>(() => getAll("contractExecutions"));
  const refresh = useCallback(() => setExecutions(getAll("contractExecutions")), []);
  const add = (e: StoredContractExecution) => { addItem("contractExecutions", e); pushNotification(`Contract execution started: ${e.contractNumber}`, "success"); refresh(); };
  const update = (id: string, patch: Partial<StoredContractExecution>) => { updateItem("contractExecutions", id, patch); refresh(); };
  const remove = (id: string) => { deleteItem("contractExecutions", id); refresh(); };
  return { executions, add, update, remove, refresh };
}

// ── Stage 13 hooks ────────────────────────────────────────────────────────────

export function useContractClosures() {
  const [closures, setClosures] = useState<StoredContractClosure[]>(() => getAll("contractClosures"));
  const refresh = useCallback(() => setClosures(getAll("contractClosures")), []);
  const add = (c: StoredContractClosure) => { addItem("contractClosures", c); pushNotification(`Contract closure created: ${c.contractNumber}`, "success"); refresh(); };
  const update = (id: string, patch: Partial<StoredContractClosure>) => { updateItem("contractClosures", id, patch); refresh(); };
  const remove = (id: string) => { deleteItem("contractClosures", id); refresh(); };
  return { closures, add, update, remove, refresh };
}

export function useWarrantyClaims() {
  const [claims, setClaims] = useState<StoredWarrantyClaim[]>(() => getAll("warrantyClaims"));
  const refresh = useCallback(() => setClaims(getAll("warrantyClaims")), []);
  const add = (c: StoredWarrantyClaim) => { addItem("warrantyClaims", c); pushNotification(`Warranty claim submitted: ${c.claimTitle}`, "info"); refresh(); };
  const update = (id: string, patch: Partial<StoredWarrantyClaim>) => { updateItem("warrantyClaims", id, patch); refresh(); };
  return { claims, add, update, refresh };
}

export function useAssetHandovers() {
  const [handovers, setHandovers] = useState<StoredAssetHandover[]>(() => getAll("assetHandovers"));
  const refresh = useCallback(() => setHandovers(getAll("assetHandovers")), []);
  const add = (h: StoredAssetHandover) => { addItem("assetHandovers", h); pushNotification(`Asset handover created: ${h.handoverNumber}`, "success"); refresh(); };
  const update = (id: string, patch: Partial<StoredAssetHandover>) => { updateItem("assetHandovers", id, patch); refresh(); };
  return { handovers, add, update, refresh };
}

export function useSupplierEvaluations() {
  const [evaluations, setEvaluations] = useState<StoredSupplierEvaluation[]>(() => getAll("supplierEvaluations"));
  const refresh = useCallback(() => setEvaluations(getAll("supplierEvaluations")), []);
  const add = (e: StoredSupplierEvaluation) => { addItem("supplierEvaluations", e); pushNotification(`Supplier evaluation added: ${e.supplierName}`, "success"); refresh(); };
  const update = (id: string, patch: Partial<StoredSupplierEvaluation>) => { updateItem("supplierEvaluations", id, patch); refresh(); };
  return { evaluations, add, update, refresh };
}

export function useLessonsLearned() {
  const [lessons, setLessons] = useState<StoredLessonLearned[]>(() => getAll("lessonsLearned"));
  const refresh = useCallback(() => setLessons(getAll("lessonsLearned")), []);
  const add = (l: StoredLessonLearned) => { addItem("lessonsLearned", l); pushNotification(`Lesson learned recorded: ${l.projectTitle}`, "success"); refresh(); };
  const update = (id: string, patch: Partial<StoredLessonLearned>) => { updateItem("lessonsLearned", id, patch); refresh(); };
  return { lessons, add, update, refresh };
}

export function useAuditEntries() {
  const [entries, setEntries] = useState<StoredAuditEntry[]>(() => getAll("auditEntries"));
  const refresh = useCallback(() => setEntries(getAll("auditEntries")), []);
  const add = (e: StoredAuditEntry) => { addItem("auditEntries", e); refresh(); };
  return { entries, add, refresh };
}
