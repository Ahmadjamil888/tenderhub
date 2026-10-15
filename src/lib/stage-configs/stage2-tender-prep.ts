/**
 * Stage 2 — Tender Preparation
 * Sub-stages per spec:
 *  1. Tender Initiation
 *  2. Technical Specifications
 *  3. Bill of Quantities (BOQ)
 *  4. Evaluation Criteria
 *  5. Tender Documents
 *  6. Legal Review
 *  7. Internal Tender Approval
 *  8. Tender Advertisement
 *  9. Supplier Registration
 * 10. Clarification Period
 * 11. Site Visit
 * 12. Bid Submission
 * 13. Bid Closing
 */
import type { StageConfig } from "@/components/StageFormWorkbench";

export const STAGE2_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 2,
    stageName: "Stage 2 — Tender Preparation",
    subStageName: "Tender Initiation",
    majorActivity: "Create procurement project in the system",
    aiControl: "Duplicate Tender Detection — AI checks for similar active tenders to prevent duplication",
    requiredAuthorization: "Procurement Manager",
    steps: [
      {
        id: "tender-basic",
        title: "Tender Basic Information",
        fields: [
          { id:"tender_number",    label:"Tender Number",                  type:"readonly", placeholder:"Auto-generated: ZW-PRA-2026-XXXXX" },
          { id:"tender_title",     label:"Tender Title",                   type:"text",     required:true, placeholder:"e.g. Supply of ARV Medicines — 2-Year Framework" },
          { id:"tender_category",  label:"Procurement Category",           type:"select",   required:true, options:["Goods","Works","Services","Consultancy","ICT","Infrastructure","Framework Agreement"] },
          { id:"procurement_method2",label:"Procurement Method",           type:"select",   required:true, options:["Open International Tender","Open National Tender","Restricted Tender","RFQ","RFP","EOI","Direct Procurement","Framework Call-off"] },
          { id:"ministry2",        label:"Procuring Entity / Ministry",    type:"text",     required:true },
          { id:"department2",      label:"User Department",                type:"text",     required:true },
          { id:"project_ref2",     label:"Project / Programme Reference",  type:"text" },
          { id:"strategy_ref2",    label:"Approved Strategy Reference",    type:"text",     required:true, hint:"From Stage 1 — Strategy Approval" },
        ],
      },
      {
        id: "tender-dates",
        title: "Tender Timeline",
        fields: [
          { id:"advert_date",      label:"Planned Advertisement Date",     type:"date",     required:true },
          { id:"clarification_date",label:"Clarification Period Closes",   type:"date",     required:true },
          { id:"site_visit_date",  label:"Mandatory Site Visit Date",      type:"date" },
          { id:"submission_deadline",label:"Bid Submission Deadline",      type:"date",     required:true },
          { id:"opening_date",     label:"Bid Opening Date",               type:"date",     required:true },
          { id:"evaluation_end",   label:"Evaluation Completion Target",   type:"date",     required:true },
          { id:"award_date",       label:"Planned Award Date",             type:"date",     required:true },
          { id:"contract_start",   label:"Expected Contract Start",        type:"date",     required:true },
        ],
      },
      {
        id: "tender-value",
        title: "Value & Budget",
        fields: [
          { id:"estimated_value2", label:"Estimated Contract Value (USD)", type:"currency", required:true },
          { id:"bid_security",     label:"Bid Security Required (USD)",    type:"currency", hint:"Typically 1-2% of estimated value" },
          { id:"performance_bond", label:"Performance Bond Required (%)",  type:"number",   placeholder:"e.g. 10" },
          { id:"advance_payment",  label:"Advance Payment Allowed?",       type:"radio",    options:["Yes — up to 15%","No"] },
          { id:"budget_line2",     label:"Budget Line Reference",          type:"text",     required:true },
          { id:"ifmis_ref2",       label:"IFMIS Commitment Reference",     type:"text",     required:true },
          { id:"ai_duplicate_check",label:"AI Duplicate Tender Check",     type:"readonly", placeholder:"Pending — AI checking for similar active tenders" },
          { id:"pm_decision_init", label:"Procurement Manager Decision",   type:"select",   options:["Approved — Proceed","Duplicate Found — Hold","Revised Scope — Return"] },
        ],
      },
    ],
  },

  {
    stageNumber: 2,
    stageName: "Stage 2 — Tender Preparation",
    subStageName: "Technical Specifications",
    majorActivity: "Draft technical specifications for the tender",
    aiControl: "AI Detects Restrictive Specifications — flags specs that unduly limit competition or favour specific brands",
    requiredAuthorization: "User Department",
    steps: [
      {
        id: "spec-general",
        title: "General Specifications",
        fields: [
          { id:"spec_ref",         label:"Specification Reference",        type:"text",     required:true },
          { id:"spec_title",       label:"Specification Title",            type:"text",     required:true },
          { id:"prepared_by_tech", label:"Prepared By (Technical Officer)",type:"text",     required:true },
          { id:"review_date",      label:"Technical Review Date",          type:"date",     required:true },
          { id:"standard_applied", label:"Applicable Standard / Code",     type:"text",     placeholder:"e.g. ISO 9001, ZESA Standard, WHO GMP" },
          { id:"performance_based",label:"Performance-Based Specification?",type:"radio",  options:["Yes","No — Prescriptive"] },
          { id:"brand_neutral",    label:"Brand Neutral?",                 type:"radio",    options:["Yes","No — Equivalent Allowed","No — Specific Brand (Justification Required)"] },
          { id:"ai_spec_check",    label:"AI Restrictive Spec Check",      type:"readonly", placeholder:"Pending AI analysis..." },
        ],
      },
      {
        id: "spec-technical",
        title: "Technical Requirements",
        fields: [
          { id:"functional_reqs",  label:"Functional Requirements",        type:"textarea", required:true, fullWidth:true, placeholder:"What the item/service must DO — functional capabilities" },
          { id:"technical_reqs",   label:"Technical Requirements",         type:"textarea", required:true, fullWidth:true, placeholder:"Technical parameters — dimensions, capacity, power, speed etc." },
          { id:"quality_standards",label:"Quality Standards Required",     type:"textarea", required:true, placeholder:"Quality certifications, testing requirements" },
          { id:"environmental",    label:"Environmental / Sustainability",  type:"textarea", placeholder:"Green procurement requirements" },
          { id:"warranty_spec",    label:"Warranty Requirements",          type:"text",     placeholder:"e.g. 24 months parts and labour" },
          { id:"maintenance",      label:"Maintenance Requirements",       type:"textarea", placeholder:"Ongoing maintenance obligations" },
          { id:"training_req",     label:"Training Requirements",          type:"text",     placeholder:"e.g. 5-day operator training on site" },
          { id:"delivery_spec",    label:"Delivery / Installation Spec",   type:"textarea", required:true },
        ],
      },
      {
        id: "spec-approval",
        title: "User Department Approval",
        fields: [
          { id:"dept_head_tech",   label:"Department Head (User Dept)",    type:"text",     required:true },
          { id:"tech_approved",    label:"Specifications Approved?",       type:"radio",    options:["Yes — Proceed","No — Revise"] },
          { id:"tech_conditions",  label:"Conditions / Revisions Required",type:"textarea" },
          { id:"spec_approval_date",label:"Approval Date",                 type:"date",     required:true },
          { id:"spec_declaration", label:"Department Declaration",         type:"checkbox", placeholder:"I confirm these specifications are fair, non-restrictive and complete", required:true },
          { id:"forward_to_boq",   label:"Forward to BOQ Preparation?",   type:"radio",    options:["Yes","No — Additional Review Required"] },
          { id:"spec_version",     label:"Specification Version",          type:"text",     placeholder:"e.g. v1.0, v2.1 Final" },
          { id:"spec_file_ref",    label:"Document File Reference",        type:"text" },
        ],
      },
    ],
  },

  {
    stageNumber: 2,
    stageName: "Stage 2 — Tender Preparation",
    subStageName: "Bill of Quantities (BOQ)",
    majorActivity: "Prepare Bill of Quantities for works/supplies",
    aiControl: "AI Pricing Comparison — benchmarks BOQ unit rates against market and historical data",
    requiredAuthorization: "Engineer",
    steps: [
      {
        id: "boq-header",
        title: "BOQ Header",
        fields: [
          { id:"boq_ref",          label:"BOQ Reference",                  type:"text",     required:true },
          { id:"project_location", label:"Project Location",               type:"text",     required:true },
          { id:"prepared_by_eng",  label:"Prepared By (Engineer)",         type:"text",     required:true },
          { id:"checked_by",       label:"Checked By",                     type:"text" },
          { id:"boq_date",         label:"BOQ Date",                       type:"date",     required:true },
          { id:"currency_boq",     label:"Currency",                       type:"select",   options:["USD","ZWL","ZiG"] },
          { id:"provisional_sums", label:"Provisional Sums Included?",     type:"radio",    options:["Yes","No"] },
          { id:"contingency_pct",  label:"Contingency Allowance (%)",      type:"number",   placeholder:"e.g. 10" },
        ],
      },
      {
        id: "boq-items",
        title: "BOQ Items",
        fields: [
          { id:"section_1",        label:"Section / Division Description",  type:"text",     required:true, placeholder:"e.g. Civil Works, Electrical, Mechanical" },
          { id:"item_desc_boq",    label:"Item Description",               type:"textarea", required:true, fullWidth:true },
          { id:"qty_boq",          label:"Quantity",                       type:"number",   required:true },
          { id:"unit_boq",         label:"Unit of Measure",                type:"text",     required:true },
          { id:"unit_rate",        label:"Estimated Unit Rate (USD)",       type:"currency", required:true },
          { id:"item_total",       label:"Item Total (USD)",                type:"readonly", placeholder:"Auto: Qty × Rate" },
          { id:"ai_rate_check",    label:"AI Benchmark Rate",               type:"readonly", placeholder:"AI will compare against market data" },
          { id:"rate_variance",    label:"Rate Variance from Benchmark",    type:"readonly", placeholder:"Pending AI analysis" },
        ],
      },
      {
        id: "boq-totals",
        title: "BOQ Summary & Engineer Approval",
        fields: [
          { id:"subtotal_works",   label:"Sub-total Works (USD)",           type:"currency", required:true },
          { id:"provisional",      label:"Provisional Sums (USD)",          type:"currency" },
          { id:"contingency_value",label:"Contingency (USD)",               type:"currency" },
          { id:"boq_grand_total",  label:"Grand Total (USD)",               type:"readonly", placeholder:"Auto-calculated" },
          { id:"budget_variance_boq",label:"Variance from Budget (USD)",    type:"readonly", placeholder:"Grand Total vs Approved Budget" },
          { id:"engineer_approval",label:"Engineer Approval",               type:"select",   options:["Approved","Revised — See Notes","Rejected"] },
          { id:"engineer_name",    label:"Engineer Name & Registration No.",type:"text",     required:true },
          { id:"eng_declaration",  label:"Engineer Declaration",            type:"checkbox", placeholder:"I certify this BOQ is accurate and professionally prepared", required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 2,
    stageName: "Stage 2 — Tender Preparation",
    subStageName: "Evaluation Criteria",
    majorActivity: "Define weighted evaluation criteria for this tender",
    aiControl: "AI Compliance Validation — checks criteria comply with PPDPAA, no discrimination, correct weighting",
    requiredAuthorization: "Evaluation Committee",
    steps: [
      {
        id: "criteria-type",
        title: "Evaluation Approach",
        fields: [
          { id:"eval_method",      label:"Evaluation Method",              type:"select",   required:true, options:["Lowest Price — Technically Compliant (LPTC)","Merit Points System (Technical + Financial)","Quality & Cost Based (QCBS)","Fixed Budget","Least Cost"] },
          { id:"pass_fail",        label:"Pass/Fail Preliminary Criteria?",type:"radio",    options:["Yes","No"] },
          { id:"technical_weight", label:"Technical Weight (%)",           type:"number",   required:true, placeholder:"e.g. 70" },
          { id:"financial_weight", label:"Financial Weight (%)",           type:"number",   required:true, placeholder:"e.g. 30" },
          { id:"min_tech_score",   label:"Minimum Technical Score to Pass (%)", type:"number", placeholder:"e.g. 70" },
          { id:"competency_weight",label:"Competency Assessment Weight (%)",type:"number",  hint:"Criterion 6a (Directors) + 6b (Technical Team) per spec" },
          { id:"ai_criteria_check",label:"AI Criteria Compliance Check",   type:"readonly", placeholder:"Pending AI validation..." },
          { id:"eval_committee_ref",label:"Evaluation Committee Reference",type:"text",    required:true },
        ],
      },
      {
        id: "technical-criteria",
        title: "Technical Scoring Criteria",
        fields: [
          { id:"crit_1",           label:"Criterion 1 — Technical Skills & Competency", type:"text", required:true, placeholder:"Max score: 15" },
          { id:"crit_2",           label:"Criterion 2 — Relevant Experience",           type:"text", required:true, placeholder:"Max score: 10" },
          { id:"crit_3",           label:"Criterion 3 — Academic Qualifications",       type:"text", placeholder:"Max score: 10" },
          { id:"crit_4",           label:"Criterion 4 — Years in Industry (>3 yrs)",    type:"text", placeholder:"Max score: 5" },
          { id:"crit_5",           label:"Criterion 5 — Machinery & Equipment",         type:"text", placeholder:"Max score: 5" },
          { id:"crit_6a",          label:"Criterion 6a — Director Competency Test",      type:"text", placeholder:"Max score: 5 — auto from vendor registration" },
          { id:"crit_6b",          label:"Criterion 6b — Technical Team Competency",    type:"text", placeholder:"Max score: 5 — auto from vendor registration" },
          { id:"crit_7",           label:"Criterion 7 — Technical Proposal",            type:"text", placeholder:"Max score: 25" },
        ],
      },
      {
        id: "criteria-approval",
        title: "Evaluation Committee Approval",
        fields: [
          { id:"committee_chair2", label:"Committee Chairperson",          type:"text",     required:true },
          { id:"committee_date2",  label:"Meeting Date",                   type:"date",     required:true },
          { id:"quorum2",          label:"Quorum Achieved?",               type:"radio",    options:["Yes","No"] },
          { id:"criteria_approved",label:"Criteria Approved?",             type:"radio",    options:["Yes","No — Revise"] },
          { id:"criteria_notes",   label:"Notes / Revisions",              type:"textarea" },
          { id:"criteria_declaration",label:"Committee Declaration",       type:"checkbox", placeholder:"We confirm these criteria are fair, objective and compliant", required:true },
          { id:"criteria_version", label:"Criteria Document Version",      type:"text",     placeholder:"e.g. v1.0 Final" },
          { id:"forward_to_docs",  label:"Forward to Tender Documents?",   type:"radio",    options:["Yes","No"] },
        ],
      },
    ],
  },

  {
    stageNumber: 2,
    stageName: "Stage 2 — Tender Preparation",
    subStageName: "Tender Documents",
    majorActivity: "Generate complete bid document package",
    aiControl: "Missing Clauses Detection — AI scans draft documents for mandatory clauses and compliance gaps",
    requiredAuthorization: "Procurement Manager",
    steps: [
      {
        id: "doc-checklist",
        title: "Document Checklist",
        fields: [
          { id:"instructions_bidders",label:"Instructions to Bidders",     type:"radio",    options:["Included","Missing","In Progress"], required:true },
          { id:"general_conditions", label:"General Conditions of Contract",type:"radio",   options:["Included","Missing","In Progress"], required:true },
          { id:"special_conditions", label:"Special Conditions of Contract",type:"radio",   options:["Included","Missing","In Progress"], required:true },
          { id:"tech_specs_doc",    label:"Technical Specifications (final)",type:"radio",  options:["Included","Missing","In Progress"], required:true },
          { id:"boq_doc",           label:"Bill of Quantities (final)",     type:"radio",   options:["Included","Missing","In Progress"] },
          { id:"bid_data_sheet",    label:"Bid Data Sheet",                 type:"radio",   options:["Included","Missing","In Progress"], required:true },
          { id:"bid_form",          label:"Bid Form Template",              type:"radio",   options:["Included","Missing","In Progress"], required:true },
          { id:"ai_missing_clauses",label:"AI Missing Clauses Report",      type:"readonly",placeholder:"Pending AI document scan..." },
        ],
      },
      {
        id: "doc-details",
        title: "Document Details",
        fields: [
          { id:"doc_language",     label:"Tender Document Language",        type:"select",  options:["English","Shona","Ndebele","English + Shona"] },
          { id:"bid_validity",     label:"Bid Validity Period (days)",      type:"number",  required:true, placeholder:"e.g. 90" },
          { id:"doc_price",        label:"Tender Document Price (USD)",     type:"currency", placeholder:"0 if free" },
          { id:"submission_format",label:"Submission Format",              type:"select",  options:["Electronic Only","Hard Copy Only","Electronic + Hard Copy"] },
          { id:"envelope_format",  label:"Number of Envelopes",            type:"select",  options:["Single Envelope","Two Envelopes (Technical + Financial)","Three Envelopes"] },
          { id:"lot_structure",    label:"Lot Structure",                  type:"radio",   options:["Single Lot","Multiple Lots","Framework Lots"] },
          { id:"subcontracting",   label:"Subcontracting Allowed?",        type:"radio",   options:["Yes — up to 25%","No","Yes — No Limit"] },
          { id:"joint_venture",    label:"Joint Ventures Allowed?",        type:"radio",   options:["Yes","No"] },
        ],
      },
      {
        id: "pm-doc-approval",
        title: "Procurement Manager Approval",
        fields: [
          { id:"pm_doc_review",    label:"Documents Complete?",             type:"radio",   required:true, options:["Yes — All Clauses Present","No — Issues Found"] },
          { id:"pm_doc_notes",     label:"Issues / Notes",                  type:"textarea" },
          { id:"pm_doc_name",      label:"Procurement Manager Name",        type:"text",    required:true },
          { id:"pm_doc_date",      label:"Approval Date",                   type:"date",    required:true },
          { id:"pm_doc_decision",  label:"Decision",                        type:"select",  options:["Approved — Forward to Legal","Returned for Revision","Escalate to Committee"] },
          { id:"doc_version_final",label:"Final Document Version",          type:"text",    placeholder:"e.g. v3.0 Final" },
          { id:"doc_file_size",    label:"Total Document Package Size",     type:"text",    placeholder:"e.g. 45 pages, 12 MB" },
          { id:"pm_doc_declaration",label:"PM Declaration",                 type:"checkbox",placeholder:"I confirm these tender documents are complete and compliant", required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 2,
    stageName: "Stage 2 — Tender Preparation",
    subStageName: "Legal Review",
    majorActivity: "Contract and tender document legal validation",
    aiControl: "AI Legal Clause Comparison — compares contract clauses against standard templates and flags deviations",
    requiredAuthorization: "Legal Advisor",
    steps: [
      {
        id: "legal-review",
        title: "Legal Review",
        fields: [
          { id:"legal_ref",        label:"Legal Review Reference",         type:"text",     required:true },
          { id:"legal_advisor",    label:"Legal Advisor Name",             type:"text",     required:true },
          { id:"legal_date",       label:"Review Date",                    type:"date",     required:true },
          { id:"contract_type",    label:"Contract Type",                  type:"select",   options:["Supply Contract","Works Contract","Service Agreement","Consultancy Agreement","Framework Agreement","Maintenance Contract"] },
          { id:"governing_law",    label:"Governing Law",                  type:"text",     placeholder:"e.g. Laws of Zimbabwe" },
          { id:"dispute_resolution",label:"Dispute Resolution Mechanism",  type:"select",  options:["Arbitration — Zimbabwe","Mediation first then Arbitration","Courts of Zimbabwe","UNCITRAL Rules"] },
          { id:"ai_clause_check",  label:"AI Clause Comparison Result",    type:"readonly", placeholder:"Pending AI legal scan..." },
          { id:"flagged_clauses",  label:"Flagged Clauses",                type:"textarea", placeholder:"AI will list any non-standard or risky clauses" },
        ],
      },
      {
        id: "legal-decision",
        title: "Legal Advisor Decision",
        fields: [
          { id:"indemnity_ok",     label:"Indemnity Clauses Acceptable?",  type:"radio",   options:["Yes","No — Revise"] },
          { id:"ip_rights_ok",     label:"IP Rights Clauses Adequate?",    type:"radio",   options:["Yes","No"] },
          { id:"termination_ok",   label:"Termination Clauses Adequate?",  type:"radio",   options:["Yes","No"] },
          { id:"force_majeure_ok", label:"Force Majeure Clause Present?",  type:"radio",   options:["Yes","No"] },
          { id:"legal_remarks",    label:"Legal Remarks & Recommended Changes", type:"textarea", required:true },
          { id:"legal_decision",   label:"Legal Decision",                 type:"select",  options:["Approved — Legally Sound","Conditional — Minor Amendments","Major Revision Required","Rejected — Restart Drafting"] },
          { id:"legal_sign",       label:"Legal Advisor Signature",        type:"text",    required:true },
          { id:"legal_declaration",label:"Legal Declaration",              type:"checkbox",placeholder:"I certify this document has been reviewed and meets legal requirements", required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 2,
    stageName: "Stage 2 — Tender Preparation",
    subStageName: "Internal Tender Approval",
    majorActivity: "Final approval before publication on the procurement portal",
    aiControl: "Compliance Score — AI generates overall compliance score for the tender package",
    requiredAuthorization: "Accounting Officer",
    steps: [
      {
        id: "pre-publish-check",
        title: "Pre-Publication Checklist",
        fields: [
          { id:"strategy_approved",label:"Strategy Approved (Stage 1)?",   type:"radio",   required:true, options:["Yes","No"] },
          { id:"specs_approved2",  label:"Technical Specs Approved?",       type:"radio",  required:true, options:["Yes","No"] },
          { id:"boq_approved2",    label:"BOQ Approved (if works)?",        type:"radio",  options:["Yes","No","N/A"] },
          { id:"criteria_set",     label:"Evaluation Criteria Set?",        type:"radio",  required:true, options:["Yes","No"] },
          { id:"docs_complete2",   label:"Tender Documents Complete?",      type:"radio",  required:true, options:["Yes","No"] },
          { id:"legal_cleared",    label:"Legal Review Cleared?",           type:"radio",  required:true, options:["Yes","No"] },
          { id:"budget_cleared",   label:"Budget Confirmed & Available?",   type:"radio",  required:true, options:["Yes","No"] },
          { id:"ai_compliance_score",label:"AI Compliance Score",           type:"readonly",placeholder:"Pending AI assessment..." },
        ],
      },
      {
        id: "ao-approval",
        title: "Accounting Officer Approval",
        fields: [
          { id:"ao_name2",         label:"Accounting Officer Name",         type:"text",    required:true },
          { id:"ao_title2",        label:"Title / Designation",             type:"text",    required:true },
          { id:"ao_review_date",   label:"Review Date",                     type:"date",    required:true },
          { id:"ao_remarks2",      label:"Remarks",                         type:"textarea" },
          { id:"ao_decision2",     label:"Accounting Officer Decision",     type:"select",  required:true, options:["Approved — Publish Immediately","Approved — Publish on Scheduled Date","Conditional Approval","Returned — Issues Found","Rejected"] },
          { id:"publish_date",     label:"Authorised Publication Date",     type:"date",    required:true },
          { id:"ao_signature2",    label:"Accounting Officer Signature",    type:"text",    required:true },
          { id:"ao_declaration2",  label:"AO Declaration",                  type:"checkbox",placeholder:"I authorise publication of this tender on the Zimbabwe e-procurement portal", required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 2,
    stageName: "Stage 2 — Tender Preparation",
    subStageName: "Tender Advertisement",
    majorActivity: "Publish tender to the procurement portal and notify suppliers",
    aiControl: "Automatic Supplier Notification — AI identifies and notifies registered suppliers matching this category",
    requiredAuthorization: "Procurement Unit",
    steps: [
      {
        id: "publication-details",
        title: "Publication Details",
        fields: [
          { id:"portal_category",  label:"Portal Category",                type:"select",   required:true, options:["Goods","Works","Services","Consultancy","ICT","Infrastructure"] },
          { id:"publication_date2",label:"Publication Date",               type:"date",     required:true },
          { id:"closing_date",     label:"Tender Closing Date",            type:"date",     required:true },
          { id:"tender_fee",       label:"Tender Document Fee (USD)",       type:"currency", placeholder:"0 if free to download" },
          { id:"contact_person",   label:"Procurement Contact Person",     type:"text",     required:true },
          { id:"contact_email",    label:"Contact Email",                  type:"email",    required:true },
          { id:"contact_phone",    label:"Contact Phone",                  type:"text",     required:true },
          { id:"queries_deadline", label:"Queries Deadline Date",          type:"date",     required:true },
        ],
      },
      {
        id: "notification",
        title: "Supplier Notification",
        fields: [
          { id:"gazette_notice",   label:"Government Gazette Notice?",      type:"radio",   options:["Yes","No"] },
          { id:"newspaper_advert", label:"Newspaper Advertisement?",        type:"radio",   options:["Yes — list below","No"] },
          { id:"newspapers",       label:"Newspapers (if applicable)",      type:"text",    placeholder:"e.g. The Herald, Zimbabwe Independent" },
          { id:"praz_portal",      label:"PRAZ Portal Published?",          type:"radio",   required:true, options:["Yes","Pending"] },
          { id:"ai_notify_count",  label:"AI Notified Suppliers Count",     type:"readonly",placeholder:"AI will auto-notify matching registered suppliers" },
          { id:"supplier_categories",label:"Supplier Categories Notified",  type:"text",    placeholder:"e.g. Class A Works, Medical Supplies, ICT" },
          { id:"publication_officer",label:"Published By (Officer Name)",   type:"text",    required:true },
          { id:"publication_declaration",label:"Publication Declaration",   type:"checkbox",placeholder:"I confirm this tender has been published as authorised", required:true },
        ],
      },
    ],
  },
];
