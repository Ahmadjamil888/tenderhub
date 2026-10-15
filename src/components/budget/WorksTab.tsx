/**
 * WorksTab — Annual Procurement Plan – Works Contracts Budget Schedule + Project Profile
 * Section 3 of the ZEPS budget build spec.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiAgentChatPanel } from "@/components/ui/AiAgentChatPanel";
import { WorkflowActionBar } from "@/components/ui/WorkflowActionBar";
import { ApprovalSignatureBlock } from "@/components/ui/ApprovalSignatureBlock";
import { BudgetWorkflowStatusTracker, type WorkflowStep } from "@/components/ui/BudgetWorkflowStatusTracker";
import { ModuleFilterBar } from "@/components/ui/ModuleFilterBar";
import { ArrowLeft, Eye, FileText, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type WorksStatus = "Draft" | "Approved" | "Authorized";

type WorksProject = {
  id: string;
  budgetCode: string;
  projectCode: string;
  procurementPlanId: string;
  projectName: string;
  scopeSummary: string;
  professionalEstimate: number;
  status: WorksStatus;
};

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_WORKS: WorksProject[] = [
  { id: "WP001", budgetCode: "3101-001", projectCode: "PROJ-2027-001", procurementPlanId: "APP-2027-WK-001", projectName: "Ministry HQ Office Renovation", scopeSummary: "Full renovation of 4th & 5th floors including partitioning, electrical, plumbing", professionalEstimate: 2_500_000, status: "Approved" },
  { id: "WP002", budgetCode: "3101-002", projectCode: "PROJ-2027-002", procurementPlanId: "APP-2027-WK-002", projectName: "Solar Power Installation — Regional Offices", scopeSummary: "Installation of 50kW solar energy systems at 5 regional offices", professionalEstimate: 1_800_000, status: "Draft" },
  { id: "WP003", budgetCode: "3101-003", projectCode: "PROJ-2027-003", procurementPlanId: "APP-2027-WK-003", projectName: "Backup Generator Installation — Nationwide", scopeSummary: "Supply and installation of 250kVA diesel generators at 10 ministry sites", professionalEstimate: 3_200_000, status: "Authorized" },
  { id: "WP004", budgetCode: "3101-004", projectCode: "PROJ-2027-004", procurementPlanId: "APP-2027-WK-004", projectName: "CCTV Infrastructure Installation", scopeSummary: "Security surveillance infrastructure upgrade for all ministry buildings", professionalEstimate: 950_000, status: "Approved" },
  { id: "WP005", budgetCode: "3101-005", projectCode: "PROJ-2027-005", procurementPlanId: "APP-2027-WK-005", projectName: "Annual Building Maintenance Programme", scopeSummary: "Structural maintenance, painting, roof repairs across all ministry properties", professionalEstimate: 1_200_000, status: "Draft" },
];

const WORKFLOW_STEPS: WorkflowStep[] = [
  { label: "Dept Planning",       status: "complete",     dateTime: "10 Jan 2026" },
  { label: "Drawings",            status: "complete",     dateTime: "25 Jan 2026" },
  { label: "BOQ",                 status: "in-progress",  dateTime: "05 Feb 2026" },
  { label: "Market Valuations",   status: "pending" },
  { label: "Budget Validation",   status: "pending" },
  { label: "Procurement Review",  status: "pending" },
  { label: "Finance Review",      status: "pending" },
  { label: "Perm. Sec. Approval", status: "pending" },
  { label: "Plan Published",      status: "pending" },
];

const PAGES = [
  { title: "Project Identification" },
  { title: "Location & Design" },
  { title: "Timeline & Procurement" },
  { title: "Budget & Funding" },
  { title: "Readiness, Employment & Justification" },
];

function fmtCurrency(n: number) {
  return `USD ${n.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function StatusBadge({ status }: { status: WorksStatus }) {
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

// ── Project Profile ───────────────────────────────────────────────────────────
function ProjectProfile({ project, onBack }: { project: WorksProject; onBack: () => void }) {
  const [page, setPage] = useState(0);
  const [fullScreen, setFullScreen] = useState(false);
  const totalPages = PAGES.length;

  return (
    <div className={`${fullScreen ? "fixed inset-0 z-50 overflow-auto bg-gray-100" : ""}`}>
      <div className="bg-[#0f172a] text-white px-6 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE · E-GP System</p>
          <h2 className="text-base font-semibold">Works Contract Profile — {project.projectCode}</h2>
          <p className="text-xs text-slate-300">{project.projectName}</p>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setFullScreen(f => !f)}>
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="bg-white border-b px-6 py-2 flex items-center gap-2 text-xs text-gray-500">
        <button onClick={onBack} className="hover:text-gray-800 flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> Works Schedule</button>
        <span>/</span>
        <span className="text-gray-800 font-medium">{project.projectCode}</span>
      </div>

      <div className="p-4 max-w-5xl mx-auto space-y-4">
        {/* Stepper */}
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

        {/* Content card */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Step {page + 1}: {PAGES[page].title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {page === 0 && (<>
              <FieldBox label="Procurement Plan ID" value={project.procurementPlanId} />
              <FieldBox label="Financial Year" value="FY 2026/2027" />
              <FieldBox label="Ministry" value="Ministry of Finance & Economic Development" />
              <FieldBox label="Department" value="Infrastructure & Facilities Management" />
              <FieldBox label="Cost Centre" value="CC-3101" />
              <FieldBox label="Programme" value="Capital Infrastructure Development" />
              <FieldBox label="Project Code" value={project.projectCode} />
              <FieldBox label="NDP Alignment" value="National Development Plan II — Infrastructure Pillar" />
              <FieldBox label="Project Name" value={project.projectName} />
              <FieldBox label="Asset Classification" value="Buildings" />
              <FieldBox label="Asset Definition" value="Government Office Building" />
              <FieldBox label="Project Description" value={project.scopeSummary} fullWidth />
            </>)}

            {page === 1 && (<>
              <FieldBox label="Works Category" value="Renovation & Refurbishment" />
              <FieldBox label="Project Type" value="Rehabilitation" />
              <FieldBox label="Asset Category" value="Buildings" />
              <FieldBox label="Project Location" value="Harare Central Business District" />
              <FieldBox label="GPS Coordinates" value="-17.829110, 31.052200" />
              <FieldBox label="Ward / District" value="Harare Central — Ward 8" />
              <FieldBox label="Responsible Engineer" value="Sr. Eng. T. Mhaka — DoPI" />
              <FieldBox label="Project Sponsor" value="Deputy Minister of Finance" />
              <FieldBox label="Project Manager" value="Ms. C. Chinyama" />
              <FieldBox label="Project Priority" value="High" />
              <FieldBox label="Strategic Objective" value="Improve government service delivery infrastructure" fullWidth />
              <FieldBox label="Project Justification" value="Current office facilities are over 20 years old and require full refurbishment to modern standards to support ministry operations." fullWidth />
            </>)}

            {page === 2 && (<>
              <FieldBox label="Estimated Beneficiaries" value="500 ministry staff" />
              <FieldBox label="Estimated Contract Duration" value="12 months" />
              <FieldBox label="Planned Start Date" value="01 April 2027" />
              <FieldBox label="Planned Completion Date" value="31 March 2028" />
              <FieldBox label="Procurement Method" value="Open Tender" />
              <FieldBox label="Tender Advertisement Month" value="January 2027" />
              <FieldBox label="Contract Award Month" value="March 2027" />
              <FieldBox label="Construction Start Month" value="April 2027" />
              <FieldBox label="Practical Completion (Expected)" value="March 2028" />
              <FieldBox label="Defects Liability Period" value="12 months" />
            </>)}

            {page === 3 && (<>
              <FieldBox label="Engineer's Estimate" value={fmtCurrency(project.professionalEstimate)} />
              <FieldBox label="Contingency Amount (10%)" value={fmtCurrency(project.professionalEstimate * 0.1)} />
              <FieldBox label="Total Estimated Project Cost" value={fmtCurrency(project.professionalEstimate * 1.1)} />
              <FieldBox label="VAT (15%)" value={fmtCurrency(project.professionalEstimate * 1.1 * 0.15)} />
              <FieldBox label="Grand Total Budget (incl. VAT)" value={fmtCurrency(project.professionalEstimate * 1.1 * 1.15)} />
              <FieldBox label="Budget Vote" value={project.budgetCode} />
              <FieldBox label="Budget Vote Quorum %" value="75% of required votes secured" />
              <FieldBox label="Budget Line Item" value="Capital Expenditure — Buildings" />
              <FieldBox label="Funding Source" value="Government Treasury" />
              <FieldBox label="Donor Name" value="N/A" />
              <FieldBox label="Counterpart Funding" value={fmtCurrency(project.professionalEstimate * 1.1 * 1.15)} />
              <FieldBox label="Donor Funding" value="N/A" />
            </>)}

            {page === 4 && (<>
              <FieldBox label="Land Availability" value="Yes — Government Land, title held" />
              <FieldBox label="Environmental Approval (EIA)" value="EIA Certificate obtained — ZINEF" />
              <FieldBox label="Planning Permission" value="Approved — Harare City Council" />
              <FieldBox label="Building Plans Approved" value="Approved — Ministry of Local Government" />
              <FieldBox label="Utility Services Available" value="Water, Sewer, Electricity — All available" />
              <FieldBox label="Design Completed" value="Yes — Architectural drawings approved" />
              <FieldBox label="Bills of Quantities Completed" value="Yes — BOQ prepared by DoQS" />
              <FieldBox label="Employment — Youth Jobs" value="15 youth" />
              <FieldBox label="Employment — Women Jobs" value="8 women" />
              <FieldBox label="Employment — Total Employed" value="45 total" />
              <FieldBox label="Key Risks" value="Contractor capacity risk (mitigated: JV requirement); material price escalation (mitigated: price adjustment clause)" fullWidth />
              <FieldBox label="The Need" value="Ministry headquarters requires full refurbishment to support expanded operations, digital infrastructure, and staff welfare commitments." fullWidth />
              <FieldBox label="Local Content Requirement" value="Minimum 40% citizen participation" />
              <FieldBox label="ESG Compliance" value="Yes — Environmental & Social Management Plan submitted" />
              <FieldBox label="Procurement Status" value={project.status} />
            </>)}
          </div>
        </div>

        <BudgetWorkflowStatusTracker steps={WORKFLOW_STEPS} />

        <AiAgentChatPanel
          agentName="Works AI"
          agentRole="Capital Works Intelligence"
          context="works project profile"
          suggestedPrompts={["Validate BOQ estimates", "Check EIA compliance", "Review procurement method"]}
          color="blue"
          defaultVisible={false}
        />

        <ApprovalSignatureBlock
          reviewedBy={{ name: "Eng. T. Mhaka", position: "Infrastructure Director", department: "DoPI", role: "Reviewer", authority: "Director", dateTime: "2026-01-25 14:00" }}
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

// ── Schedule table ────────────────────────────────────────────────────────────
export function WorksTab() {
  const [selectedProject, setSelectedProject] = useState<WorksProject | null>(null);

  const totalEstimate = MOCK_WORKS.reduce((s, r) => s + r.professionalEstimate, 0);

  if (selectedProject) {
    return <ProjectProfile project={selectedProject} onBack={() => setSelectedProject(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-[#0f172a] text-white px-6 py-3">
        <p className="text-[10px] uppercase tracking-widest text-slate-400">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</p>
        <p className="text-sm font-semibold">Ministry of Finance &amp; Economic Development</p>
        <p className="text-xs text-slate-300">Electronic Government Procurement System (E-GP) · FY 2026/2027</p>
      </div>
      <div className="bg-white border-b px-6 py-2 text-xs text-gray-500">
        Ministry of Finance › Budget Module › Works Schedule
      </div>

      <div className="px-4">
        <ModuleFilterBar
          ministries={[{ value: "mof", label: "Ministry of Finance" }]}
          departments={[{ value: "proc", label: "Procurement" }]}
          financialYears={[{ value: "2026", label: "FY 2026/2027" }]}
        />
      </div>

      <div className="px-4">
        <h2 className="text-lg font-bold uppercase tracking-wide text-gray-900">Annual Procurement Plan — Works Contracts Budget Schedule</h2>
        <p className="text-sm text-gray-500">Capital Works &amp; Infrastructure Projects</p>
      </div>

      <div className="px-4">
        <AiAgentChatPanel
          agentName="Works AI"
          agentRole="Capital Budget Analysis"
          context="works schedule"
          suggestedPrompts={["Identify delayed projects", "Flag over-budget items", "Summarise capital plan"]}
          color="blue"
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Project Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Scope Summary</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide whitespace-nowrap">Prof. Estimate</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">View BOQ</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">View Doc</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_WORKS.map(project => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{project.budgetCode}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{project.projectCode}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{project.procurementPlanId}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{project.projectName}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[200px]">{project.scopeSummary}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmtCurrency(project.professionalEstimate)}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={project.status} /></td>
                  <td className="px-4 py-3 text-center">
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setSelectedProject(project)}>
                      <Eye className="h-3 w-3" /> BOQ
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => setSelectedProject(project)}>
                      <FileText className="h-3 w-3" /> Doc
                    </Button>
                  </td>
                </tr>
              ))}
              <tr className="bg-[#1a6b3a] text-white font-bold">
                <td className="px-4 py-3 text-xs uppercase tracking-wide" colSpan={5}>TOTAL</td>
                <td className="px-4 py-3 text-right text-xs">{fmtCurrency(totalEstimate)}</td>
                <td colSpan={3} />
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 italic">
          Developer Note: Click View BOQ to open the Bill of Quantities profile. Click View Doc to open the project document. No long scroll — profiles paginated with Next/Back.
        </p>
      </div>

      <WorkflowActionBar visibleButtons={["saveDraft", "approve", "authorize"]} showUtilities />
    </div>
  );
}
