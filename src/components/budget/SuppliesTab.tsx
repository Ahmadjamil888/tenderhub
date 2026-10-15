/**
 * SuppliesTab — Goods Supplies Budget Schedule + Item Profile
 * Section 2 of the ZEPS budget build spec.
 * Schedule → click View → paginated Item Profile (50-field, 5 pages)
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiAgentChatPanel } from "@/components/ui/AiAgentChatPanel";
import { WorkflowActionBar } from "@/components/ui/WorkflowActionBar";
import { ApprovalSignatureBlock } from "@/components/ui/ApprovalSignatureBlock";
import { BudgetWorkflowStatusTracker, type WorkflowStep } from "@/components/ui/BudgetWorkflowStatusTracker";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import {
  ArrowLeft, Eye, Maximize2, ChevronLeft, ChevronRight, CheckSquare, Square,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type SupplyStatus = "Draft" | "Approved" | "Authorized";

type SupplyItem = {
  id: string;
  budgetVoteCode: string;
  goodsDescription: string;
  budgetedUnitCost: number;
  plannedQuantity: number;
  estimatedTotalCost: number;
  vatAmount: number;
  totalBudgetRequirement: number;
  status: SupplyStatus;
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_SUPPLIES: SupplyItem[] = [
  { id: "S001", budgetVoteCode: "2701-001", goodsDescription: "Office Stationery (Pens/Files/Paper/Envelopes)", budgetedUnitCost: 500, plannedQuantity: 100, estimatedTotalCost: 50000, vatAmount: 7500, totalBudgetRequirement: 57500, status: "Approved" },
  { id: "S002", budgetVoteCode: "2701-002", goodsDescription: "Desktop Computers – Intel i7/16GB RAM", budgetedUnitCost: 1200, plannedQuantity: 50, estimatedTotalCost: 60000, vatAmount: 9000, totalBudgetRequirement: 69000, status: "Approved" },
  { id: "S003", budgetVoteCode: "2701-003", goodsDescription: "Laptop Computers – Business Grade", budgetedUnitCost: 1500, plannedQuantity: 30, estimatedTotalCost: 45000, vatAmount: 6750, totalBudgetRequirement: 51750, status: "Draft" },
  { id: "S004", budgetVoteCode: "2701-004", goodsDescription: "Microsoft 365 Enterprise – Annual Subscription", budgetedUnitCost: 300, plannedQuantity: 200, estimatedTotalCost: 60000, vatAmount: 9000, totalBudgetRequirement: 69000, status: "Authorized" },
  { id: "S005", budgetVoteCode: "2701-005", goodsDescription: "Endpoint Protection Licences – Enterprise Security", budgetedUnitCost: 150, plannedQuantity: 200, estimatedTotalCost: 30000, vatAmount: 4500, totalBudgetRequirement: 34500, status: "Draft" },
  { id: "S006", budgetVoteCode: "2701-006", goodsDescription: "Switches & Routers – Enterprise Grade", budgetedUnitCost: 5000, plannedQuantity: 10, estimatedTotalCost: 50000, vatAmount: 7500, totalBudgetRequirement: 57500, status: "Approved" },
];

const WORKFLOW_STEPS: WorkflowStep[] = [
  { label: "Dept Planning",           status: "complete",    dateTime: "12 Jan 2026" },
  { label: "Budget Validation",       status: "complete",    dateTime: "15 Jan 2026" },
  { label: "Procurement Review",      status: "in-progress", dateTime: "20 Jan 2026" },
  { label: "Finance Review",          status: "pending" },
  { label: "Perm. Sec. Approval",     status: "pending" },
  { label: "Plan Published",          status: "pending" },
];

const INITIATIVE_OPTIONS = [
  "National Development Plan",
  "Party Manifesto",
  "National Priority Projects",
  "Presidential Directive",
  "Service Delivery",
  "Community Development",
  "Citizen Empowerment",
  "National Strategy",
  "Sustainable Development Goals",
  "Vision 2030",
  "Youth Employment",
  "Women Empowerment",
  "Youth Empowerment",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtCurrency(n: number) {
  return `USD ${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function StatusBadge({ status }: { status: SupplyStatus }) {
  const cls = {
    Draft:      "bg-amber-100 text-amber-700",
    Approved:   "bg-emerald-100 text-emerald-700",
    Authorized: "bg-blue-100 text-blue-700",
  }[status];
  return <Badge className={`text-xs ${cls}`}>{status}</Badge>;
}

// ── Field box component ───────────────────────────────────────────────────────
function FieldBox({ label, value, fullWidth = false }: { label: string; value?: string | number | null; fullWidth?: boolean }) {
  return (
    <div className={`border border-gray-200 rounded p-3 bg-white ${fullWidth ? "col-span-2" : ""}`}>
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</label>
      <div className="text-sm text-gray-800 min-h-[20px]">{value ?? "—"}</div>
    </div>
  );
}

// ── Multi-checkbox initiative selector ────────────────────────────────────────
function InitiativeSelector({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt]);
  };
  return (
    <div className="col-span-2 border border-gray-200 rounded p-3 bg-white">
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Initiative</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
        {INITIATIVE_OPTIONS.map(opt => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-emerald-700 transition-colors text-left"
          >
            {selected.includes(opt)
              ? <CheckSquare className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
              : <Square className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />}
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Page definitions (5 pages, ~10 fields each) ───────────────────────────────
const PAGES = [
  { title: "Identification & Classification", range: [1, 10] },
  { title: "Item Details & Quantities",       range: [11, 20] },
  { title: "Budget & Funding",                range: [21, 30] },
  { title: "Planning, Timeline & Risks",      range: [31, 40] },
  { title: "Initiatives, Employment & Justification", range: [41, 50] },
];

// ── Item Profile ──────────────────────────────────────────────────────────────
function ItemProfile({ item, onBack }: { item: SupplyItem; onBack: () => void }) {
  const [page, setPage] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const [initiatives, setInitiatives] = useState<string[]>(["Service Delivery", "National Development Plan"]);

  const totalPages = PAGES.length;

  return (
    <div className={`${fullScreen ? "fixed inset-0 z-50 overflow-auto bg-gray-100" : ""}`}>
      {/* Header */}
      <div className="bg-[#0f172a] text-white px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE · E-GP System</p>
          <h2 className="text-base font-semibold">Goods Supplies Item Profile — {item.id}</h2>
          <p className="text-xs text-slate-300">{item.goodsDescription}</p>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setFullScreen(f => !f)}>
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b px-6 py-2 flex items-center gap-2 text-xs text-gray-500">
        <button onClick={onBack} className="hover:text-gray-800 flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" /> Supplies Schedule
        </button>
        <span>/</span>
        <span className="text-gray-800 font-medium">Item Profile · {item.id}</span>
      </div>

      <div className="p-4 max-w-5xl mx-auto space-y-4">
        {/* Page stepper */}
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex-shrink-0 p-1 rounded hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {PAGES.map((pg, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  i === page
                    ? "bg-gray-900 text-white"
                    : i < page
                    ? "bg-emerald-600 text-white"
                    : "border border-gray-300 text-gray-500 bg-white"
                }`}
              >
                {i < page ? "✓ " : `${i + 1}. `}{pg.title}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="flex-shrink-0 p-1 rounded hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 pl-8">Page {page + 1} of {totalPages} — {PAGES[page].title}</p>
        </div>

        {/* Step content card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-base font-semibold text-gray-800 mb-4">
            Step {page + 1}: {PAGES[page].title}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {page === 0 && (<>
              <FieldBox label="Procurement Plan ID" value="APP-2027-000145" />
              <FieldBox label="Financial Year" value="FY 2026/2027" />
              <FieldBox label="Ministry" value="Ministry of Finance & Economic Development" />
              <FieldBox label="Department" value="Department of Procurement & Asset Mgmt" />
              <FieldBox label="Cost Centre" value="CC-1001" />
              <FieldBox label="Programme" value="Public Finance Management" />
              <FieldBox label="Project Code" value="PRJ-2027-001" />
              <FieldBox label="Procurement Category" value="Goods" />
              <FieldBox label="Procurement Type" value={item.goodsDescription.split("–")[0].trim()} />
              <FieldBox label="Procurement Classification" value="Inventory — Consumables" />
            </>)}

            {page === 1 && (<>
              <FieldBox label="Item Code" value={item.id} />
              <FieldBox label="Item Description" value={item.goodsDescription} />
              <FieldBox label="Detailed Specifications" value="Government standard grade as per PPRA approved specification list" fullWidth />
              <FieldBox label="Unit of Measure" value="Each / Box / Pack" />
              <FieldBox label="Quantity Required" value={item.plannedQuantity} />
              <FieldBox label="Estimated Unit Cost" value={fmtCurrency(item.budgetedUnitCost)} />
              <FieldBox label="Estimated Total Cost (Qty × Unit Cost)" value={fmtCurrency(item.estimatedTotalCost)} />
              <FieldBox label="VAT Amount (15%)" value={fmtCurrency(item.vatAmount)} />
              <FieldBox label="Total Budget Requirement (Gross)" value={fmtCurrency(item.totalBudgetRequirement)} />
              <FieldBox label="Delivery Location" value="Ministry Headquarters, Harare" />
            </>)}

            {page === 2 && (<>
              <FieldBox label="Budget Vote" value={item.budgetVoteCode} />
              <FieldBox label="Budget Line Item" value="Goods & Services – Office Supplies" />
              <FieldBox label="Source of Funding" value="Government" />
              <FieldBox label="Donor Name" value="N/A" />
              <FieldBox label="Budget Availability" value="Confirmed — Yes" />
              <FieldBox label="Budget Status" value={item.status} />
              <FieldBox label="Procurement Justification" value="Operational requirements for financial year 2026/2027" fullWidth />
              <FieldBox label="Strategic Objective" value="Enhance operational efficiency across ministry departments" fullWidth />
              <FieldBox label="NDP Alignment" value="National Development Plan II — Pillar 1: Economic Transformation" fullWidth />
              <FieldBox label="Procurement Priority" value="High" />
            </>)}

            {page === 3 && (<>
              <FieldBox label="Procurement Method" value="Open Tender" />
              <FieldBox label="Estimated Tender Advertisement Month" value="February 2027" />
              <FieldBox label="Planned Contract Award Month" value="April 2027" />
              <FieldBox label="Planned Delivery Month" value="May 2027" />
              <FieldBox label="Urgency" value="Routine" />
              <FieldBox label="Priority" value="High" />
              <FieldBox label="Existing Contract (Framework)" value="No" />
              <FieldBox label="Inventory Available (Current Stock)" value="Limited — reorder required" />
              <FieldBox label="Minimum Stock Level (Reorder Point)" value="20 units" />
              <FieldBox label="Procurement Risk Rating" value="Low" />
              <FieldBox label="Risk Comments" value="Standard procurement — low complexity" fullWidth />
            </>)}

            {page === 4 && (<>
              <InitiativeSelector selected={initiatives} onChange={setInitiatives} />
              <FieldBox label="Local Content Requirement" value="Minimum 30% citizen economic empowerment" fullWidth />
              <FieldBox label="Employment — Youth Jobs" value="5 youth" />
              <FieldBox label="Employment — Women Jobs" value="3 women" />
              <FieldBox label="Employment — Total Employed" value="8 total" />
              <FieldBox label="The Need" value="Operational stationery and ICT consumables required for daily ministerial functions. Current stock level insufficient for Q2 operations." fullWidth />
              <FieldBox label="Approval Status" value={item.status} />
              <FieldBox label="Department Head Approval" value="Director — Administration" />
              <FieldBox label="Finance Approval (CFO)" value="Chief Finance Officer" />
              <FieldBox label="Procurement Approval" value="Chief Procurement Officer" />
              <FieldBox label="Permanent Secretary Approval" value="Permanent Secretary — MoFED" />
              <FieldBox label="Justification" value="1. Essential for daily ministry operations. 2. Current stock below minimum threshold. 3. Supports NDP targets for service delivery." fullWidth />
            </>)}
          </div>
        </div>

        {/* Workflow tracker */}
        <BudgetWorkflowStatusTracker steps={WORKFLOW_STEPS} />

        {/* AI Chat */}
        <AiAgentChatPanel
          agentName="Budget AI"
          agentRole="Supplies Budget Intelligence"
          context="supplies budget item profile"
          suggestedPrompts={["Validate budget estimate", "Check procurement method", "Assess risk rating"]}
          color="emerald"
          defaultVisible={false}
        />

        {/* Approval block */}
        <ApprovalSignatureBlock
          reviewedBy={{ name: "T. Sibanda", position: "Finance Director", department: "Finance", role: "Reviewer", authority: "Finance Director", dateTime: "2026-01-20 09:30" }}
          approvedBy={{ name: "R. Moyo", position: "Chief Procurement Officer", department: "Procurement", role: "Approver", authority: "CPO", dateTime: "" }}
        />

        {/* Workflow action bar */}
        <WorkflowActionBar
          visibleButtons={["back", "next", "saveDraft", "return", "approve", "authorize", "escalate", "submit"]}
          onBack={() => page > 0 ? setPage(p => p - 1) : onBack()}
          onNext={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          showUtilities
        />
      </div>
    </div>
  );
}

// ── Schedule table ────────────────────────────────────────────────────────────
export function SuppliesTab() {
  const [selectedItem, setSelectedItem] = useState<SupplyItem | null>(null);

  const totalEstimated = MOCK_SUPPLIES.reduce((s, r) => s + r.estimatedTotalCost, 0);
  const totalVat       = MOCK_SUPPLIES.reduce((s, r) => s + r.vatAmount, 0);
  const totalBudget    = MOCK_SUPPLIES.reduce((s, r) => s + r.totalBudgetRequirement, 0);

  if (selectedItem) {
    return <ItemProfile item={selectedItem} onBack={() => setSelectedItem(null)} />;
  }

  return (
    <div className="space-y-4">
      {/* Gov header */}
      <div className="bg-[#0f172a] text-white px-6 py-3">
        <p className="text-[10px] uppercase tracking-widest text-slate-400">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</p>
        <p className="text-sm font-semibold">Ministry of Finance &amp; Economic Development</p>
        <p className="text-xs text-slate-300">Electronic Government Procurement System (E-GP) · FY 2026/2027</p>
      </div>
      {/* Breadcrumb */}
      <div className="bg-white border-b px-6 py-2 text-xs text-gray-500">
        Ministry of Finance › Budget Module › Supplies Schedule
      </div>

      {/* Filters */}
      <div className="px-4">
        <ModuleFilterBar
          ministries={[{ value: "mof", label: "Ministry of Finance" }]}
          departments={[{ value: "proc", label: "Procurement" }]}
          financialYears={[{ value: "2026", label: "FY 2026/2027" }]}
        />
      </div>

      {/* Table heading */}
      <div className="px-4">
        <h2 className="text-lg font-bold uppercase tracking-wide text-gray-900">Goods Supplies Budget Schedule</h2>
        <p className="text-sm text-gray-500">Annual Procurement Plan — Goods &amp; Supplies Budget</p>
      </div>

      {/* AI Chat */}
      <div className="px-4">
        <AiAgentChatPanel
          agentName="Supplies AI"
          agentRole="Budget Analysis"
          context="supplies schedule"
          suggestedPrompts={["Identify budget risks", "Highlight over-budget items", "Summarise procurement plan"]}
          color="emerald"
          defaultVisible={false}
        />
      </div>

      {/* Schedule table */}
      <div className="px-4">
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a6b3a] text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Budget Vote Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Goods Description</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Unit Cost</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Qty</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Est. Total Cost</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide whitespace-nowrap">VAT Amount</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Total Budget Req.</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_SUPPLIES.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.budgetVoteCode}</td>
                  <td className="px-4 py-3 text-gray-800">{item.goodsDescription}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmtCurrency(item.budgetedUnitCost)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{item.plannedQuantity}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmtCurrency(item.estimatedTotalCost)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{fmtCurrency(item.vatAmount)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmtCurrency(item.totalBudgetRequirement)}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-center">
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setSelectedItem(item)}>
                      <Eye className="h-3 w-3" /> View
                    </Button>
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              <tr className="bg-[#1a6b3a] text-white font-bold">
                <td className="px-4 py-3 text-xs uppercase tracking-wide" colSpan={4}>TOTAL</td>
                <td className="px-4 py-3 text-right text-xs">{fmtCurrency(totalEstimated)}</td>
                <td className="px-4 py-3 text-right text-xs">{fmtCurrency(totalVat)}</td>
                <td className="px-4 py-3 text-right text-xs">{fmtCurrency(totalBudget)}</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 italic">
          Developer Note: Click View to open the full Item Profile. Refer to Annexure A for the full cash Budget listing (do not print this note).
        </p>
      </div>

      <WorkflowActionBar visibleButtons={["saveDraft", "approve", "authorize"]} showUtilities />
    </div>
  );
}
