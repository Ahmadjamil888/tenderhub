/**
 * Stage 1 — Procurement Planning
 * Sub-stages per spec:
 *  1. Strategic Procurement Planning
 *  2. Needs Identification
 *  3. Demand Consolidation
 *  4. Budget Verification
 *  5. Procurement Requisition
 *  6. Requisition Review
 *  7. Requisition Approval
 *  8. Procurement Risk Assessment
 *  9. Procurement Method Selection
 * 10. Procurement Strategy Approval
 */
import type { StageConfig } from "@/components/StageFormWorkbench";

export const STAGE1_SUB_STAGES: StageConfig[] = [
  // ─── 1. Strategic Procurement Planning ────────────────────────────────────
  {
    stageNumber: 1,
    stageName: "Stage 1 — Procurement Planning",
    subStageName: "Strategic Procurement Planning",
    majorActivity: "Annual Procurement Planning",
    aiControl: "AI Budget Validation — validates planned procurement items against approved budget allocations",
    requiredAuthorization: "Head of Department (HOD)",
    steps: [
      {
        id: "org-details",
        title: "Organisation & Plan Details",
        fields: [
          { id:"ministry",        label:"Ministry / Entity",          type:"text",     required:true,  placeholder:"e.g. Ministry of Health" },
          { id:"department",      label:"Department / Unit",           type:"text",     required:true,  placeholder:"e.g. Finance Department" },
          { id:"financial_year",  label:"Financial Year",              type:"select",   required:true,  options:["FY 2026/27","FY 2027/28","FY 2028/29"] },
          { id:"plan_ref",        label:"Procurement Plan Reference",  type:"text",     required:true,  placeholder:"e.g. PP-2026/27-001" },
          { id:"prepared_by",     label:"Prepared By (Name & Title)",  type:"text",     required:true  },
          { id:"date_prepared",   label:"Date Prepared",               type:"date",     required:true  },
          { id:"budget_code",     label:"Budget Code / Vote",          type:"text",     required:true,  placeholder:"e.g. MOH/BUD/2026/001" },
          { id:"total_budget",    label:"Total Approved Budget (USD)", type:"currency", required:true,  hint:"Source: IFMIS — verified by Finance Manager" },
        ],
      },
      {
        id: "strategic-objectives",
        title: "Strategic Objectives & Alignment",
        fields: [
          { id:"strategic_plan",   label:"National Development Plan Reference",   type:"text",     placeholder:"e.g. NDP 2026-2030, Pillar 3" },
          { id:"ministry_plan",    label:"Ministry Strategic Plan Reference",      type:"text",     required:true },
          { id:"objective_1",      label:"Primary Strategic Objective",            type:"textarea", required:true, placeholder:"Describe the strategic objective this procurement supports" },
          { id:"objective_2",      label:"Secondary Objective (if applicable)",    type:"textarea", placeholder:"Optional" },
          { id:"outcomes",         label:"Expected Outcomes",                      type:"textarea", required:true, placeholder:"List measurable outcomes" },
          { id:"beneficiaries",    label:"Key Beneficiaries / Users",              type:"text",     required:true },
          { id:"risk_level",       label:"Initial Risk Level",                     type:"select",   options:["Low","Medium","High","Critical"] },
          { id:"priority",         label:"Programme Priority",                     type:"select",   options:["Routine","Priority","Urgent","Presidential Directive"] },
        ],
      },
      {
        id: "procurement-items",
        title: "Planned Procurement Items",
        fields: [
          { id:"item_category",    label:"Procurement Category",         type:"select",   required:true, options:["Goods","Services","Works","Consultancy","ICT","Infrastructure"] },
          { id:"item_description", label:"Item / Service Description",   type:"textarea", required:true, placeholder:"Detailed description of what is to be procured" },
          { id:"estimated_value",  label:"Estimated Contract Value (USD)",type:"currency",required:true },
          { id:"quantity",         label:"Quantity / Volume",            type:"text",     required:true },
          { id:"unit_of_measure",  label:"Unit of Measure",              type:"text",     placeholder:"e.g. units, litres, km, man-months" },
          { id:"procurement_method",label:"Proposed Procurement Method", type:"select",   options:["Open Tender","RFQ","RFP","EOI","Restricted Tender","Direct Procurement","Framework"] },
          { id:"planned_start",    label:"Planned Procurement Start",    type:"date",     required:true },
          { id:"planned_award",    label:"Target Award Date",            type:"date",     required:true },
        ],
      },
      {
        id: "budget-allocation",
        title: "Budget Allocation & IFMIS",
        fields: [
          { id:"budget_line",      label:"Budget Line Item",             type:"text",     required:true },
          { id:"budget_available", label:"Available Budget Balance (USD)",type:"currency",required:true, hint:"Real-time from IFMIS integration" },
          { id:"ifmis_ref",        label:"IFMIS Reference Number",       type:"text",     required:true },
          { id:"commitment_ref",   label:"Commitment / Encumbrance Ref", type:"text" },
          { id:"funding_source",   label:"Funding Source",               type:"select",   options:["Government Revenue","Development Partner","Loan","Grant","Special Fund"] },
          { id:"donor_ref",        label:"Donor Reference (if applicable)",type:"text",   placeholder:"Leave blank if government funded" },
          { id:"multi_year",       label:"Multi-Year Contract?",         type:"radio",    options:["Yes","No"] },
          { id:"year1_allocation", label:"Year 1 Allocation (USD)",      type:"currency" },
        ],
      },
      {
        id: "review-submit",
        title: "Review & Submit",
        fields: [
          { id:"hod_name",       label:"Head of Department (Name)",     type:"text",     required:true },
          { id:"hod_title",      label:"HOD Title",                     type:"text",     required:true },
          { id:"submission_date",label:"Submission Date",               type:"date",     required:true },
          { id:"remarks",        label:"Additional Remarks / Notes",    type:"textarea", placeholder:"Any special instructions or exceptions" },
          { id:"declaration",    label:"Declaration",                   type:"checkbox", placeholder:"I confirm the information provided is accurate and complete", required:true },
          { id:"ai_validated",   label:"AI Budget Validation Status",   type:"readonly", placeholder:"Pending — AI will validate on submission" },
          { id:"compliance_cert",label:"Compliance Certificate Status", type:"readonly", placeholder:"Auto-generated on HOD approval" },
          { id:"plan_status",    label:"Plan Status",                   type:"readonly", placeholder:"DRAFT" },
        ],
      },
    ],
  },

  // ─── 2. Needs Identification ───────────────────────────────────────────────
  {
    stageNumber: 1,
    stageName: "Stage 1 — Procurement Planning",
    subStageName: "Needs Identification",
    majorActivity: "Department identifies operational requirement",
    aiControl: "Duplicate Request Detection — AI checks for existing/similar active requisitions",
    requiredAuthorization: "Supervisor",
    steps: [
      {
        id: "need-details",
        title: "Operational Need Details",
        fields: [
          { id:"requesting_dept",  label:"Requesting Department",        type:"text",     required:true },
          { id:"need_category",    label:"Need Category",                type:"select",   required:true, options:["Goods","Services","Works","Maintenance","ICT Equipment","Consumables","Furniture","Vehicles","Other"] },
          { id:"need_description", label:"Description of Need",         type:"textarea", required:true, placeholder:"Clearly describe what is needed and why" },
          { id:"justification",    label:"Business Justification",       type:"textarea", required:true, placeholder:"Why is this item/service required?" },
          { id:"urgency",          label:"Urgency Level",                type:"select",   options:["Routine","Urgent","Emergency"] },
          { id:"required_by_date", label:"Required By Date",             type:"date",     required:true },
          { id:"estimated_cost",   label:"Estimated Cost (USD)",         type:"currency", required:true },
          { id:"previous_ref",     label:"Previous Purchase Reference",  type:"text",     placeholder:"If recurring, provide last PO/Contract ref" },
        ],
      },
      {
        id: "technical-specs",
        title: "Technical Specifications",
        fields: [
          { id:"spec_standard",    label:"Applicable Standard / Spec",   type:"text",     placeholder:"e.g. ISO 9001, ZESA Standard" },
          { id:"brand_preference", label:"Brand / Make Preference",      type:"text",     placeholder:"State brand or 'No preference'" },
          { id:"technical_detail", label:"Technical Details",            type:"textarea", required:true, placeholder:"Dimensions, capacity, grade, performance requirements" },
          { id:"quantity_detail",  label:"Quantity Required",            type:"text",     required:true },
          { id:"delivery_location",label:"Delivery Location",            type:"text",     required:true },
          { id:"installation",     label:"Installation / Commissioning Required?", type:"radio", options:["Yes","No"] },
          { id:"warranty",         label:"Warranty Required?",           type:"radio",    options:["Yes","No"] },
          { id:"warranty_period",  label:"Warranty Period",              type:"text",     placeholder:"e.g. 12 months, 24 months" },
        ],
      },
      {
        id: "supervisor-review",
        title: "Supervisor Review",
        fields: [
          { id:"supervisor_name",  label:"Supervisor Name",              type:"text",     required:true },
          { id:"supervisor_title", label:"Supervisor Title",             type:"text",     required:true },
          { id:"supervisor_email", label:"Supervisor Email",             type:"email",    required:true },
          { id:"duplicate_check",  label:"Duplicate Check Result",       type:"readonly", placeholder:"AI will populate — checking against active requisitions" },
          { id:"supervisor_remarks",label:"Supervisor Remarks",          type:"textarea" },
          { id:"supervisor_decision",label:"Supervisor Decision",        type:"select",   options:["Approved","Returned for Revision","Rejected"] },
          { id:"decision_date",    label:"Decision Date",                type:"date" },
          { id:"declaration2",     label:"Supervisor Declaration",       type:"checkbox", placeholder:"I confirm this need is genuine and not a duplicate", required:true },
        ],
      },
    ],
  },

  // ─── 3. Demand Consolidation ───────────────────────────────────────────────
  {
    stageNumber: 1,
    stageName: "Stage 1 — Procurement Planning",
    subStageName: "Demand Consolidation",
    majorActivity: "Merge similar requests across departments",
    aiControl: "AI Spend Analysis — identifies similar requests for consolidation to achieve economies of scale",
    requiredAuthorization: "Procurement Manager",
    steps: [
      {
        id: "consolidation-scope",
        title: "Consolidation Scope",
        fields: [
          { id:"consolidation_ref",   label:"Consolidation Reference",    type:"text",   required:true, placeholder:"e.g. CONS-2026/27-001" },
          { id:"consolidation_period",label:"Consolidation Period",       type:"select", options:["Q1 2026/27","Q2 2026/27","Q3 2026/27","Q4 2026/27","Annual 2026/27"] },
          { id:"item_category2",      label:"Item Category",              type:"select", required:true, options:["Goods","Services","Works","Consultancy","ICT","Infrastructure"] },
          { id:"total_requests",      label:"Number of Requests Identified",type:"number",required:true },
          { id:"departments_count",   label:"Number of Departments",      type:"number", required:true },
          { id:"total_value_before",  label:"Total Value Before Consolidation (USD)", type:"currency", required:true },
          { id:"estimated_saving",    label:"Estimated Saving from Consolidation (USD)", type:"currency", hint:"AI Spend Analysis will calculate" },
          { id:"ai_recommendation",   label:"AI Consolidation Recommendation", type:"readonly", placeholder:"Pending AI analysis" },
        ],
      },
      {
        id: "requests-list",
        title: "Requests Being Consolidated",
        fields: [
          { id:"request_refs",        label:"Request Reference Numbers",  type:"textarea", required:true, placeholder:"List all requisition refs being merged, one per line" },
          { id:"common_specification",label:"Common Specification",       type:"textarea", required:true, placeholder:"Agreed consolidated specification" },
          { id:"consolidated_qty",    label:"Consolidated Quantity",      type:"text",     required:true },
          { id:"consolidated_value",  label:"Consolidated Estimated Value (USD)", type:"currency", required:true },
          { id:"vendor_list",         label:"Potential Vendors (if known)", type:"textarea", placeholder:"List known capable vendors" },
          { id:"framework_applicable",label:"Framework Agreement Applicable?", type:"radio", options:["Yes","No","Under Review"] },
          { id:"proc_method_rec",     label:"Recommended Procurement Method", type:"select", options:["Open Tender","RFQ","RFP","Framework Call-Off","Direct"] },
          { id:"market_survey_done",  label:"Market Survey Conducted?",   type:"radio",    options:["Yes","No","In Progress"] },
        ],
      },
      {
        id: "pm-approval",
        title: "Procurement Manager Approval",
        fields: [
          { id:"pm_name",             label:"Procurement Manager Name",    type:"text",  required:true },
          { id:"pm_employee_id",      label:"Employee ID",                 type:"text" },
          { id:"pm_decision",         label:"Decision",                    type:"select",options:["Approved for Consolidation","Returned — Not Suitable","Rejected"] },
          { id:"pm_remarks",          label:"Remarks",                     type:"textarea" },
          { id:"consolidated_plan_ref",label:"Annual Plan Reference (updated)", type:"text", required:true },
          { id:"next_stage",          label:"Proceed to Next Stage",       type:"select",  options:["Budget Verification","Hold","Cancel"] },
          { id:"declaration3",        label:"PM Declaration",              type:"checkbox", placeholder:"I confirm the consolidation is valid and approved", required:true },
          { id:"pm_date",             label:"Approval Date",               type:"date",    required:true },
        ],
      },
    ],
  },
];
