/**
 * ServicesTab — Services Contracts Budget Schedule + Service Profile
 * Section 4 of the ZEPS budget build spec.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiAgentChatPanel } from "@/components/ui/AiAgentChatPanel";
import { WorkflowActionBar } from "@/components/ui/WorkflowActionBar";
import { ApprovalSignatureBlock } from "@/components/ui/ApprovalSignatureBlock";
import { BudgetWorkflowStatusTracker, type WorkflowStep } from "@/components/ui/BudgetWorkflowStatusTracker";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ArrowLeft, Eye, Maximize2, ChevronLeft, ChevronRight, CheckSquare, Square } from "lucide-react";

type ServicesStatus = "Draft" | "Approved" | "Authorized";

type ServiceItem = {
  id: string;
  budgetCode: string;
  projectCode: string;
  procurementPlanId: string;
  serviceCategory: string;
  projectName: string;
  scopeSummary: string;
  professionalEstimate: number;
  status: ServicesStatus;
};

const MOCK_SERVICES: ServiceItem[] = [
  { id: "SV001", budgetCode: "4201-001", projectCode: "SVC-2027-001", procurementPlanId: "APP-2027-SV-001", serviceCategory: "ICT Services", projectName: "Enterprise Software Support & Maintenance", scopeSummary: "Annual support and maintenance for IFMIS, Payroll and HR systems", professionalEstimate: 1_200_000, status: "Approved" },
  { id: "SV002", budgetCode: "4201-002", projectCode: "SVC-2027-002", procurementPlanId: "APP-2027-SV-002", serviceCategory: "Audit & Assurance", projectName: "External Audit Services — Financial Statements", scopeSummary: "Independent audit of ministry consolidated financial statements FY2026/27", professionalEstimate: 450_000, status: "Authorized" },
  { id: "SV003", budgetCode: "4201-003", projectCode: "SVC-2027-003", procurementPlanId: "APP-2027-SV-003", serviceCategory: "Legal Services", projectName: "Legal Advisory Retainer — Contract Law", scopeSummary: "Ongoing legal advisory services for procurement contracts and disputes", professionalEstimate: 360_000, status: "Draft" },
  { id: "SV004", budgetCode: "4201-004", projectCode: "SVC-2027-004", procurementPlanId: "APP-2027-SV-004", serviceCategory: "Security Services", projectName: "Manned Security Services — Ministry Buildings", scopeSummary: "24/7 manned security guarding for all ministry-owned properties", professionalEstimate: 800_000, status: "Approved" },
  { id: "SV005", budgetCode: "4201-005", projectCode: "SVC-2027-005", procurementPlanId: "APP-2027-SV-005", serviceCategory: "Consultancy", projectName: "Procurement Capacity Development Programme", scopeSummary: "Training and capacity building for 200 procurement officers across 10 ministries", professionalEstimate: 620_000, status: "Draft" },
];

const WORKFLOW_STEPS: WorkflowStep[] = [
  { label: "Dept Planning",       status: "complete",     dateTime: "08 Jan 2026" },
  { label: "Budget Validation",   status: "complete",     dateTime: "14 Jan 2026" },
  { label: "Procurement Review",  status: "in-progress",  dateTime: "22 Jan 2026" },
  { label: "Finance Review",      status: "pending" },
  { label: "Perm. Sec. Approval", status: "pending" },
  { label: "Plan Published",      status: "pending" },
];

const INITIATIVE_OPTIONS = [
  "National Development Plan", "Party Manifesto", "National Priority Projects",
  "Presidential Directive", "Service Delivery", "Community Development",
  "Citizen Empowerment", "National Strategy", "Sustainable Development Goals",
  "Vision 2030", "Youth Employment", "Women Empowerment", "Youth Empowerment",
];

const PAGES = [
  { title: "Service Identification" },
  { title: "Scope, Deliverables & SLA" },
  { title: "Contract Timeline" },
  { title: "Budget, Funding & Resources" },
  { title: "Compliance, Risks & Justification" },
];

function fmtCurrency(n: number) {
  return `USD ${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function StatusBadge({ status }: { status: ServicesStatus }) {
  const cls = { Draft: "bg-amber-100 text-amber-700", Approved: "bg-emerald-100 text-emerald-700", Authorized: "bg-blue-100 text-blue-700" }[status];
  return <Badge className={`text-xs ${cls}`}>{status}</Badge>;
}

function FieldBox({ label, value, fullWidth = false }: { label: string; value?: string | number | null; fullWidth?: boolean }) {
  return (
    <div className={`border border-gray-200 rounded p-3 bg-white ${fullWidth ? "col-span-2" : ""}`}>
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">{label}</label>
      <div className="text-sm text-gray-800 min-h-[20px]">{value ?? "—"}</div>
    </div>
  );
}

function InitiativeSelector({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) => onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt]);
  return (
    <div className="col-span-2 border border-gray-200 rounded p-3 bg-white">
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Initiative</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
        {INITIATIVE_OPTIONS.map(opt => (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-emerald-700 transition-colors text-left">
            {selected.includes(opt) ? <CheckSquare className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" /> : <Square className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />}
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ServiceProfile({ item, onBack }: { item: ServiceItem; onBack: () => void }) {
  const [page, setPage] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const [initiatives, setInitiatives] = useState<string[]>(["Service Delivery", "National Development Plan"]);
  const totalPages = PAGES.length;

  return (
    <div className={`${fullScreen ? "fixed inset-0 z-50 overflow-auto bg-gray-100" : ""}`}>
      <div className="bg-[#0f172a] text-white px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE · E-GP System</p>
          <h2 className="text-base font-semibold">Services Profile — {item.projectCode}</h2>
          <p className="text-xs text-slate-300">{item.projectName}</p>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setFullScreen(f => !f)}>
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-white border-b px-6 py-2 flex items-center gap-2 text-xs text-gray-500">
        <button onClick={onBack} className="hover:text-gray-800 flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Services Schedule</button>
        <span>/</span>
        <span className="text-gray-800 font-medium">{item.projectCode}</span>
      </div>

      <div className="p-4 max-w-5xl mx-auto space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="flex-shrink-0 p-1 rounded hover:bg-gray-100 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {PAGES.map((pg, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${i === page ? "bg-gray-900 text-white" : i < page ? "bg-emerald-600 text-white" : "border border-gray-300 text-gray-500 bg-white"}`}>
                {i < page ? "✓ " : `${i + 1}. `}{pg.title}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="flex-shrink-0 p-1 rounded hover:bg-gray-100 disabled:opacity-40">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 pl-8">Page {page + 1} of {totalPages} — {PAGES[page].title}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Step {page + 1}: {PAGES[page].title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {page === 0 && (<>
              <FieldBox label="Procurement Plan ID" value={item.procurementPlanId} />
              <FieldBox label="Financial Year" value="FY 2026/2027" />
              <FieldBox label="Ministry" value="Ministry of Finance & Economic Development" />
              <FieldBox label="Department" value="Department of Procurement & Asset Mgmt" />
              <FieldBox label="Cost Centre" value="CC-4201" />
              <FieldBox label="Programme" value="Institutional Strengthening" />
              <FieldBox label="Project Code" value={item.projectCode} />
              <FieldBox label="Service Category" value={item.serviceCategory} />
              <FieldBox label="Service Type" value="Professional" />
              <FieldBox label="Service Name" value={item.projectName} />
              <FieldBox label="Service Classification" value="Consulting / Advisory" />
              <FieldBox label="Detailed Scope of Services" value={item.scopeSummary} fullWidth />
            </>)}

            {page === 1 && (<>
              <FieldBox label="Service Objective" value="Enhance government service delivery capacity and operational efficiency" fullWidth />
              <FieldBox label="Expected Deliverables" value="1. Quarterly service reports. 2. Annual performance review. 3. Incident response within SLA. 4. Training materials." fullWidth />
              <FieldBox label="Performance Indicators / KPIs" value="99.5% system uptime; 4-hour incident response; monthly reporting" fullWidth />
              <FieldBox label="SLA Requirement" value="4-hour response time for critical issues; 24-hour for non-critical" fullWidth />
              <FieldBox label="Contract Manager" value="IT Director — Ministry of Finance" />
              <FieldBox label="End User Department" value="All ministry departments" />
              <FieldBox label="Procurement Justification" value="Existing support contract expires March 2027. Continuity of service critical for financial management operations." fullWidth />
            </>)}

            {page === 2 && (<>
              <FieldBox label="Estimated Contract Duration" value="24 months" />
              <FieldBox label="Contract Start Date" value="01 April 2027" />
              <FieldBox label="Contract End Date" value="31 March 2029" />
              <FieldBox label="Renewal Option" value="Yes — one 12-month extension by mutual agreement" />
              <FieldBox label="Procurement Priority" value="Critical" />
              <FieldBox label="Procurement Method" value="Open Tender" />
              <FieldBox label="Procurement Strategy" value="Multi-year Framework Contract" />
              <FieldBox label="Procurement Advertisement Month" value="December 2026" />
              <FieldBox label="Contract Award Month" value="March 2027" />
              <FieldBox label="Mobilisation Date" value="01 April 2027" />
              <FieldBox label="Deliverable Completion Date" value="31 March 2029" />
            </>)}

            {page === 3 && (<>
              <FieldBox label="Estimated Contract Value (before VAT)" value={fmtCurrency(item.professionalEstimate)} />
              <FieldBox label="VAT Amount (15%)" value={fmtCurrency(item.professionalEstimate * 0.15)} />
              <FieldBox label="Grand Total Budget" value={fmtCurrency(item.professionalEstimate * 1.15)} />
              <FieldBox label="Budget Vote" value={item.budgetCode} />
              <FieldBox label="Budget Line Item" value="Goods & Services — Professional Services" />
              <FieldBox label="Funding Source" value="Government Treasury" />
              <FieldBox label="Donor Funding" value="N/A" />
              <FieldBox label="Internal Budget Available" value="Yes — confirmed by CFO" />
              <FieldBox label="Number of Resources Required" value="5 senior consultants; 3 junior consultants" />
              <FieldBox label="Required Qualifications" value="BSc Computer Science / Accounting; CIPS or equivalent" />
              <FieldBox label="Experience Requirement" value="Minimum 7 years in equivalent role" />
            </>)}

            {page === 4 && (<>
              <FieldBox label="Local Content Requirement" value="Minimum 30% citizen participation" />
              <FieldBox label="Citizen Empowerment" value="Yes — reserved procurement for citizen-owned firms" />
              <FieldBox label="ESG Requirement" value="Contractor must comply with environmental and social standards" fullWidth />
              <FieldBox label="Confidentiality Requirement" value="Yes — NDA required from all consultant personnel" />
              <FieldBox label="Data Security Classification" value="Confidential — Government financial data" />
              <FieldBox label="Performance Bond Required" value="Yes — 10% of contract value" />
              <FieldBox label="Insurance Requirement" value="Professional Indemnity — USD 2,000,000 minimum" />
              <FieldBox label="Risk Rating" value="Medium" />
              <FieldBox label="Risk Description" value="Key person dependency; vendor lock-in risk. Mitigated by knowledge transfer requirements and documentation standards." fullWidth />
              <FieldBox label="Approval Status" value={item.status} />
              <FieldBox label="Department Approval" value="Director — ICT Services" />
              <FieldBox label="Finance Approval (CFO)" value="Chief Finance Officer" />
              <FieldBox label="Procurement Approval" value="Chief Procurement Officer" />
              <FieldBox label="Permanent Secretary Approval" value="Permanent Secretary — MoFED" />
              <FieldBox label="Current Workflow Stage" value="Procurement Review" />
              <FieldBox label="Remarks" value="Priority contract — approve urgently to ensure FY2027 continuity." fullWidth />
              <FieldBox label="Justification" value="1. Existing contract expires March 2027. 2. Critical systems support required. 3. Open tender ensures value for money. 4. Supports NDP digital transformation goals." fullWidth />
              <InitiativeSelector selected={initiatives} onChange={setInitiatives} />
            </>)}
          </div>
        </div>

        <BudgetWorkflowStatusTracker steps={WORKFLOW_STEPS} />

        <AiAgentChatPanel
          agentName="Services AI"
          agentRole="Services Budget Intelligence"
          context="services budget profile"
          suggestedPrompts={["Validate service rates", "Check SLA benchmarks", "Review procurement method"]}
          color="violet"
          defaultVisible={false}
        />

        <ApprovalSignatureBlock
          reviewedBy={{ name: "N. Dube", position: "IT Director", department: "ICT", role: "Reviewer", authority: "IT Director", dateTime: "2026-01-22 11:30" }}
          approvedBy={{ name: "R. Moyo", position: "Chief Procurement Officer", department: "Procurement", role: "Approver", authority: "CPO", dateTime: "" }}
        />

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

export function ServicesTab() {
  const [selectedItem, setSelectedItem] = useState<ServiceItem | null>(null);
  const totalEstimate = MOCK_SERVICES.reduce((s, r) => s + r.professionalEstimate, 0);

  if (selectedItem) {
    return <ServiceProfile item={selectedItem} onBack={() => setSelectedItem(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#0f172a] text-white px-6 py-3">
        <p className="text-[10px] uppercase tracking-widest text-slate-400">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</p>
        <p className="text-sm font-semibold">Ministry of Finance &amp; Economic Development</p>
        <p className="text-xs text-slate-300">Electronic Government Procurement System (E-GP) · FY 2026/2027</p>
      </div>
      <div className="bg-white border-b px-6 py-2 text-xs text-gray-500">
        Ministry of Finance › Budget Module › Services Schedule
      </div>

      <div className="px-4">
        <ModuleFilterBar
          ministries={[{ value: "mof", label: "Ministry of Finance" }]}
          departments={[{ value: "proc", label: "Procurement" }]}
          financialYears={[{ value: "2026", label: "FY 2026/2027" }]}
        />
      </div>

      <div className="px-4">
        <h2 className="text-lg font-bold uppercase tracking-wide text-gray-900">Services Contracts Budget Schedule</h2>
        <p className="text-sm text-gray-500">Annual Procurement Plan — Professional &amp; Non-Professional Services</p>
      </div>

      <div className="px-4">
        <AiAgentChatPanel
          agentName="Services AI"
          agentRole="Services Budget Analysis"
          context="services schedule"
          suggestedPrompts={["Identify contract renewals", "Flag expiring SLAs", "Summarise services plan"]}
          color="violet"
          defaultVisible={false}
        />
      </div>

      <div className="px-4">
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1a6b3a] text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Budget Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Project Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Plan ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Service Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Project Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Scope Summary</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Prof. Estimate</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">View SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_SERVICES.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.budgetCode}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.projectCode}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{item.procurementPlanId}</td>
                  <td className="px-4 py-3 text-gray-700 text-xs">{item.serviceCategory}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{item.projectName}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px]">{item.scopeSummary}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmtCurrency(item.professionalEstimate)}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={item.status} /></td>
                  <td className="px-4 py-3 text-center">
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setSelectedItem(item)}>
                      <Eye className="h-3 w-3" /> View
                    </Button>
                  </td>
                </tr>
              ))}
              <tr className="bg-[#1a6b3a] text-white font-bold">
                <td className="px-4 py-3 text-xs uppercase tracking-wide" colSpan={6}>TOTAL</td>
                <td className="px-4 py-3 text-right text-xs">{fmtCurrency(totalEstimate)}</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <WorkflowActionBar visibleButtons={["saveDraft", "approve", "authorize"]} showUtilities />
    </div>
  );
}
