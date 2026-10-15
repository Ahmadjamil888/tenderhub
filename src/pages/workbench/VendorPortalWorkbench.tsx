/**
 * VendorPortalWorkbench
 * The same Enterprise Workbench applied to the Vendor Portal.
 * Displays vendor-specific information while maintaining identical layout.
 * Route: /vendor-workbench/:moduleId?
 */
import { useParams, useNavigate } from "react-router-dom";
import EnterpriseWorkbench, {
  VENDOR_MODULES, WorkbenchRecord,
} from "@/components/EnterpriseWorkbench";
import { ZW_MINISTRIES } from "@/lib/zw-ministries";

const VENDOR_RECORD: WorkbenchRecord = {
  recordNumber:       "VEN-00481",
  referenceNumber:    "ZW-VEN-2026-00481",
  title:              "Vendor Portal — Zimbabwe Holdings Ltd",
  ministry:           "Zimbabwe Holdings Ltd",
  department:         "Procurement Division",
  financialYear:      "2026/2027",
  budgetCode:         "N/A",
  procurementType:    "Vendor Portal",
  currentStage:       "Active Vendor",
  status:             "Open",
  priority:           "High",
  dueDate:            "Ongoing",
  ageOnStage:         "Active",
  owner:              "J. Moyo",
  organization:       "Zimbabwe Holdings Ltd",
  percentageComplete: 72,
  userRole:           "Initiator",
  userName:           "J. Moyo",
  userJobTitle:       "Procurement Manager",
  userLocation:       "Harare",
  lastSaved:          "2026-06-26 09:00",
  connectionStatus:   "Online",
  version:            "v2.1",
  value:              "Active Contracts: USD 12.4M",
};

// Module ID → label lookup
const MODULE_MAP: Record<string, string> = {
  dashboard:      "Vendor Dashboard",
  tasks:          "Vendor Tasks",
  "tender-search":"Tender Search",
  "rfq-search":   "RFQ Search",
  "rfp-search":   "RFP Search",
  "eoi-search":   "EOI Search",
  auctions:       "Auction Participation",
  "bid-submission":"Bid Submission",
  "submitted-bids":"Submitted Bids",
  clarifications: "Clarifications",
  contracts:      "Contracts",
  payments:       "Payments",
  notifications:  "Notifications",
  messages:       "Messages",
  documents:      "Documents",
  ai:             "AI Assistant",
  audit:          "Audit History",
};

export default function VendorPortalWorkbench() {
  const { moduleId = "dashboard" } = useParams<{ moduleId?: string }>();
  const label = MODULE_MAP[moduleId] ?? "Vendor Dashboard";

  // Vendor record always shows vendor as the "ministry" field context
  const record: WorkbenchRecord = {
    ...VENDOR_RECORD,
    currentStage: label,
  };

  return (
    <EnterpriseWorkbench
      module={{ id: moduleId, label, allModules: VENDOR_MODULES }}
      record={record}
      isVendorPortal
      title={`Vendor Portal — ${label}`}
      subtitle="Enterprise Vendor Workbench · Vendor-specific information · Same enterprise design"
    />
  );
}
