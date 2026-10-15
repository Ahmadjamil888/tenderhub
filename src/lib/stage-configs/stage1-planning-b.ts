/**
 * Stage 1 — Procurement Planning (continued)
 * Sub-stages 4–10
 */
import type { StageConfig } from "@/components/StageFormWorkbench";

export const STAGE1_SUB_STAGES_B: StageConfig[] = [
  // ─── 4. Budget Verification ────────────────────────────────────────────────
  {
    stageNumber: 1,
    stageName: "Stage 1 — Procurement Planning",
    subStageName: "Budget Verification",
    majorActivity: "Budget availability check",
    aiControl: "Real-time IFMIS Integration — live budget balance confirmation before requisition proceeds",
    requiredAuthorization: "Finance Manager",
    steps: [
      {
        id: "budget-check",
        title: "IFMIS Budget Check",
        fields: [
          { id:"ifmis_account",    label:"IFMIS Account Code",           type:"text",     required:true },
          { id:"budget_vote",      label:"Budget Vote / Programme",       type:"text",     required:true },
          { id:"approved_budget",  label:"Approved Budget (USD)",         type:"currency", required:true },
          { id:"committed_amount", label:"Already Committed (USD)",       type:"currency", required:true, hint:"Auto-populated from IFMIS" },
          { id:"expended_amount",  label:"Expended to Date (USD)",        type:"currency", required:true, hint:"Auto-populated from IFMIS" },
          { id:"available_balance",label:"Available Balance (USD)",       type:"readonly", placeholder:"Calculated: Approved - Committed - Expended" },
          { id:"required_amount",  label:"Amount Required for This Procurement (USD)", type:"currency", required:true },
          { id:"budget_sufficient",label:"Budget Sufficiency Status",     type:"readonly", placeholder:"AI will assess: SUFFICIENT / INSUFFICIENT / PARTIAL" },
        ],
      },
      {
        id: "finance-details",
        title: "Finance Verification Details",
        fields: [
          { id:"finance_manager",  label:"Finance Manager Name",          type:"text",     required:true },
          { id:"finance_emp_id",   label:"Employee ID",                   type:"text" },
          { id:"verification_date",label:"Verification Date",             type:"date",     required:true },
          { id:"finance_remarks",  label:"Finance Remarks",               type:"textarea" },
          { id:"supplementary_budget",label:"Supplementary Budget Required?",type:"radio",options:["Yes","No"] },
          { id:"virement_required",label:"Virement Required?",            type:"radio",    options:["Yes","No"] },
          { id:"virement_ref",     label:"Virement Reference",            type:"text",     placeholder:"If applicable" },
          { id:"finance_decision", label:"Finance Decision",              type:"select",   options:["Funds Available — Proceed","Insufficient Funds — Hold","Partial Funds — Revise Scope"] },
        ],
      },
    ],
  },

  // ─── 5. Procurement Requisition ───────────────────────────────────────────
  {
    stageNumber: 1,
    stageName: "Stage 1 — Procurement Planning",
    subStageName: "Procurement Requisition",
    majorActivity: "Create electronic requisition",
    aiControl: "Policy Compliance Validation — checks requisition against PPDPAA and internal policy rules",
    requiredAuthorization: "Requisition Officer",
    steps: [
      {
        id: "requisition-header",
        title: "Requisition Header",
        fields: [
          { id:"requisition_no",   label:"Requisition Number",            type:"readonly", placeholder:"Auto-generated: REQ-2026/27-XXXXXX" },
          { id:"req_date",         label:"Requisition Date",              type:"date",     required:true },
          { id:"req_department",   label:"Requesting Department",         type:"text",     required:true },
          { id:"req_officer",      label:"Requisition Officer",           type:"text",     required:true },
          { id:"cost_centre",      label:"Cost Centre",                   type:"text",     required:true },
          { id:"project_code",     label:"Project Code",                  type:"text" },
          { id:"currency",         label:"Currency",                      type:"select",   options:["USD","ZWL","ZiG","RTGS"] },
          { id:"priority_level",   label:"Priority Level",                type:"select",   options:["Normal","Urgent","Emergency"] },
        ],
      },
      {
        id: "line-items",
        title: "Line Items",
        fields: [
          { id:"item_no",          label:"Item Description",              type:"textarea", required:true, placeholder:"Full description of goods/services/works required" },
          { id:"item_qty",         label:"Quantity",                      type:"number",   required:true },
          { id:"unit",             label:"Unit of Measure",               type:"text",     required:true },
          { id:"unit_price",       label:"Estimated Unit Price (USD)",    type:"currency", required:true },
          { id:"total_value",      label:"Total Estimated Value (USD)",   type:"readonly", placeholder:"Calculated automatically" },
          { id:"delivery_address", label:"Delivery Address",              type:"textarea", required:true },
          { id:"delivery_date",    label:"Required Delivery Date",        type:"date",     required:true },
          { id:"tech_spec_attached",label:"Technical Specifications Attached?", type:"radio", options:["Yes","No"] },
        ],
      },
      {
        id: "policy-compliance",
        title: "Policy Compliance Check",
        fields: [
          { id:"ppdpaa_method",    label:"PPDPAA Compliant Method?",      type:"radio",    options:["Yes","No","Exemption Applied"] },
          { id:"exemption_reason", label:"Exemption Reason (if any)",     type:"textarea", placeholder:"Provide legal basis for any exemption" },
          { id:"threshold_check",  label:"Procurement Threshold Applicable", type:"select",options:["Up to USD 10,000 — Supervisor","USD 10,001–100,000 — HOD + Finance","USD 100,001–500,000 — Director + PM","USD 500,001–2M — Procurement Committee + CFO","USD 2M–10M — Accounting Officer / PS","Above USD 10M — Minister / CTA / Board"] },
          { id:"ai_policy_result", label:"AI Policy Check Result",        type:"readonly", placeholder:"Pending — AI validating against PPDPAA rules" },
          { id:"conflicts",        label:"Conflict of Interest Declaration", type:"checkbox", placeholder:"I declare no conflict of interest in this requisition", required:true },
          { id:"req_officer_sign", label:"Requisition Officer Signature", type:"text",     required:true, placeholder:"Full name as electronic signature" },
          { id:"req_officer_date", label:"Sign Date",                     type:"date",     required:true },
          { id:"req_status",       label:"Requisition Status",            type:"readonly", placeholder:"DRAFT" },
        ],
      },
    ],
  },

  // ─── 6. Requisition Review ─────────────────────────────────────────────────
  {
    stageNumber: 1,
    stageName: "Stage 1 — Procurement Planning",
    subStageName: "Requisition Review",
    majorActivity: "Technical review of requisition for completeness",
    aiControl: "Completeness Validation — AI checks all mandatory fields, attachments, and specifications are present",
    requiredAuthorization: "Department Head",
    steps: [
      {
        id: "completeness-check",
        title: "Completeness Check",
        fields: [
          { id:"req_ref_review",   label:"Requisition Reference",         type:"text",     required:true, placeholder:"REQ number being reviewed" },
          { id:"specs_complete",   label:"Specifications Complete?",       type:"radio",    options:["Yes","No — Return for Revision"] },
          { id:"budget_confirmed", label:"Budget Code Confirmed?",         type:"radio",    options:["Yes","No"] },
          { id:"quantity_verified",label:"Quantity Verified?",             type:"radio",    options:["Yes","No"] },
          { id:"delivery_confirmed",label:"Delivery Terms Confirmed?",    type:"radio",    options:["Yes","No"] },
          { id:"attachments_ok",   label:"All Required Attachments Present?", type:"radio",options:["Yes","No — List Missing Below"] },
          { id:"missing_items",    label:"Missing Items / Issues",         type:"textarea", placeholder:"List any missing information or issues found" },
          { id:"ai_completeness",  label:"AI Completeness Score",          type:"readonly", placeholder:"Pending AI check" },
        ],
      },
      {
        id: "dept-head-review",
        title: "Department Head Review",
        fields: [
          { id:"dh_name",          label:"Department Head Name",           type:"text",     required:true },
          { id:"dh_employee_id",   label:"Employee ID",                    type:"text" },
          { id:"dh_review_date",   label:"Review Date",                    type:"date",     required:true },
          { id:"dh_remarks",       label:"Review Remarks",                 type:"textarea" },
          { id:"technical_validity",label:"Technical Validity Confirmed?", type:"radio",   options:["Yes","No"] },
          { id:"priority_confirmed",label:"Priority Level Confirmed?",     type:"radio",   options:["Yes","No — Revise"] },
          { id:"dh_decision",      label:"Department Head Decision",       type:"select",  options:["Approved — Forward to Requisition Approval","Returned — Revision Required","Rejected"] },
          { id:"dh_declaration",   label:"Department Head Declaration",    type:"checkbox", placeholder:"I confirm this requisition is technically valid and complete", required:true },
        ],
      },
    ],
  },

  // ─── 7. Requisition Approval ───────────────────────────────────────────────
  {
    stageNumber: 1,
    stageName: "Stage 1 — Procurement Planning",
    subStageName: "Requisition Approval",
    majorActivity: "Electronic approval workflow",
    aiControl: "Delegation of Authority Validation — AI checks approver has correct authority level for the value",
    requiredAuthorization: "Director",
    steps: [
      {
        id: "authority-check",
        title: "Delegation of Authority Check",
        fields: [
          { id:"req_value",        label:"Requisition Value (USD)",        type:"currency", required:true },
          { id:"approval_tier",    label:"Required Approval Tier",         type:"readonly", placeholder:"AI will determine based on value" },
          { id:"approver_name",    label:"Approving Director Name",        type:"text",     required:true },
          { id:"approver_emp_id",  label:"Employee ID",                    type:"text" },
          { id:"doa_ref",          label:"Delegation of Authority Reference", type:"text", required:true, hint:"Must match current DoA register" },
          { id:"doa_valid",        label:"DoA Validity Check",             type:"readonly", placeholder:"AI validating DoA..." },
          { id:"approval_date",    label:"Approval Date",                  type:"date",     required:true },
          { id:"approval_remarks", label:"Approval Remarks",               type:"textarea" },
        ],
      },
      {
        id: "director-approval",
        title: "Director Approval",
        fields: [
          { id:"director_decision",label:"Director Decision",              type:"select",  required:true, options:["Approved","Conditionally Approved","Returned","Rejected"] },
          { id:"conditions",       label:"Conditions (if Conditional Approval)", type:"textarea", placeholder:"State conditions that must be met" },
          { id:"director_signature",label:"Director Electronic Signature", type:"text",    required:true },
          { id:"witness_name",     label:"Witness Name",                   type:"text" },
          { id:"approved_amount",  label:"Approved Amount (USD)",          type:"currency",required:true },
          { id:"validity_period",  label:"Approval Validity Period",       type:"select",  options:["30 days","60 days","90 days","6 months","12 months"] },
          { id:"director_declaration",label:"Director Declaration",        type:"checkbox", placeholder:"I confirm I have the authority to approve this requisition", required:true },
          { id:"forward_to",       label:"Forward To (Next Stage)",        type:"select",  options:["Procurement Risk Assessment","Procurement Planning Team","Finance for PO","Hold"] },
        ],
      },
    ],
  },

  // ─── 8. Procurement Risk Assessment ───────────────────────────────────────
  {
    stageNumber: 1,
    stageName: "Stage 1 — Procurement Planning",
    subStageName: "Procurement Risk Assessment",
    majorActivity: "Risk scoring for this procurement activity",
    aiControl: "AI Procurement Risk Engine — scores market, delivery, compliance, and fraud risks automatically",
    requiredAuthorization: "Procurement Director",
    steps: [
      {
        id: "risk-identification",
        title: "Risk Identification",
        fields: [
          { id:"risk_category",    label:"Primary Risk Category",          type:"select",   required:true, options:["Market Risk","Delivery Risk","Compliance Risk","Fraud/Corruption Risk","Technical Risk","Financial Risk","Reputational Risk"] },
          { id:"market_risk",      label:"Market Risk Description",        type:"textarea", required:true, placeholder:"Limited suppliers, price volatility, import restrictions..." },
          { id:"delivery_risk",    label:"Delivery/Execution Risk",        type:"textarea", required:true, placeholder:"Supply chain issues, lead times, capacity constraints..." },
          { id:"compliance_risk",  label:"Compliance Risk",                type:"textarea", placeholder:"PPDPAA non-compliance risk, policy gaps..." },
          { id:"fraud_risk",       label:"Fraud & Corruption Risk",        type:"textarea", placeholder:"Sole-source risk, conflict of interest concerns..." },
          { id:"ai_risk_score",    label:"AI Risk Engine Score",           type:"readonly", placeholder:"Pending — AI Procurement Risk Engine" },
          { id:"overall_risk",     label:"Overall Risk Rating",            type:"readonly", placeholder:"LOW / MEDIUM / HIGH / CRITICAL" },
          { id:"risk_ref",         label:"Risk Register Reference",        type:"text" },
        ],
      },
      {
        id: "mitigation",
        title: "Risk Mitigation",
        fields: [
          { id:"mitigation_1",     label:"Mitigation Measure 1",           type:"textarea", required:true },
          { id:"mitigation_2",     label:"Mitigation Measure 2",           type:"textarea" },
          { id:"mitigation_owner", label:"Risk Owner",                     type:"text",     required:true },
          { id:"residual_risk",    label:"Residual Risk After Mitigation", type:"select",   options:["Low","Medium","High"] },
          { id:"risk_appetite",    label:"Within Risk Appetite?",          type:"radio",    options:["Yes","No — Escalate to Accounting Officer"] },
          { id:"proc_dir_name",    label:"Procurement Director Name",      type:"text",     required:true },
          { id:"proc_dir_date",    label:"Assessment Date",                type:"date",     required:true },
          { id:"proc_dir_sign",    label:"Procurement Director Signature", type:"text",     required:true },
        ],
      },
    ],
  },

  // ─── 9. Procurement Method Selection ──────────────────────────────────────
  {
    stageNumber: 1,
    stageName: "Stage 1 — Procurement Planning",
    subStageName: "Procurement Method Selection",
    majorActivity: "Select compliant method: Open Tender, RFQ, RFP, Restricted, Framework, Direct Procurement",
    aiControl: "AI Recommends Compliant Method — based on value, category, urgency, market conditions and PPDPAA thresholds",
    requiredAuthorization: "Procurement Committee",
    steps: [
      {
        id: "method-analysis",
        title: "Method Analysis",
        fields: [
          { id:"procurement_value",label:"Procurement Value (USD)",        type:"currency", required:true },
          { id:"ai_method_rec",    label:"AI Recommended Method",          type:"readonly", placeholder:"AI analysing value, category and policy..." },
          { id:"method_rationale", label:"Rationale for Method Selected",  type:"textarea", required:true },
          { id:"selected_method",  label:"Selected Procurement Method",    type:"select",   required:true, options:["Open International Tender","Open National Tender","Restricted Tender","Request for Quotation (RFQ)","Request for Proposal (RFP)","Expression of Interest (EOI)","Framework Agreement Call-off","Direct Procurement","Competitive Negotiation","Unsolicited Proposal"] },
          { id:"ppdpaa_basis",     label:"PPDPAA Legal Basis",             type:"text",     required:true, placeholder:"e.g. Section 28(1)(a) — Open Tender" },
          { id:"direct_justification",label:"Direct Procurement Justification (if applicable)", type:"textarea", placeholder:"Required only if Direct Procurement selected" },
          { id:"market_conditions",label:"Market Conditions Assessment",   type:"textarea", required:true },
          { id:"supplier_count",   label:"Estimated Number of Qualified Suppliers", type:"number", required:true },
        ],
      },
      {
        id: "committee-approval",
        title: "Procurement Committee Decision",
        fields: [
          { id:"committee_date",   label:"Committee Meeting Date",         type:"date",     required:true },
          { id:"committee_ref",    label:"Committee Meeting Reference",    type:"text",     required:true },
          { id:"committee_chair",  label:"Committee Chairperson",          type:"text",     required:true },
          { id:"members_present",  label:"Members Present",                type:"textarea", required:true, placeholder:"List names and titles" },
          { id:"quorum_met",       label:"Quorum Met?",                    type:"radio",    options:["Yes","No"] },
          { id:"committee_decision",label:"Committee Resolution",          type:"select",   options:["Method Approved","Method Revised — See Notes","Deferred","Rejected"] },
          { id:"committee_notes",  label:"Committee Notes",                type:"textarea" },
          { id:"committee_declaration",label:"Chairperson Declaration",    type:"checkbox", placeholder:"I confirm this resolution was properly passed", required:true },
        ],
      },
    ],
  },

  // ─── 10. Procurement Strategy Approval ────────────────────────────────────
  {
    stageNumber: 1,
    stageName: "Stage 1 — Procurement Planning",
    subStageName: "Procurement Strategy Approval",
    majorActivity: "Approve procurement approach and forward to Tender Preparation",
    aiControl: "Policy Validation — final AI check that full strategy complies with PPDPAA and internal policy",
    requiredAuthorization: "Accounting Officer",
    steps: [
      {
        id: "strategy-summary",
        title: "Strategy Summary",
        fields: [
          { id:"strategy_ref",     label:"Strategy Document Reference",   type:"text",     required:true },
          { id:"procurement_title",label:"Procurement Title",             type:"text",     required:true },
          { id:"total_est_value",  label:"Total Estimated Value (USD)",   type:"currency", required:true },
          { id:"method_confirmed", label:"Procurement Method (Confirmed)",type:"readonly", placeholder:"From Method Selection stage" },
          { id:"risk_rating",      label:"Risk Rating (from Risk Assessment)", type:"readonly", placeholder:"From Risk Assessment stage" },
          { id:"budget_confirmed2",label:"Budget Confirmed (from Finance)",type:"readonly", placeholder:"From Budget Verification stage" },
          { id:"ai_final_check",   label:"AI Final Policy Check",         type:"readonly", placeholder:"Pending final AI policy validation" },
          { id:"strategy_notes",   label:"Additional Strategy Notes",     type:"textarea" },
        ],
      },
      {
        id: "accounting-officer",
        title: "Accounting Officer Approval",
        fields: [
          { id:"ao_name",          label:"Accounting Officer Name",        type:"text",     required:true },
          { id:"ao_title",         label:"Title / Designation",            type:"text",     required:true, placeholder:"e.g. Permanent Secretary, CEO" },
          { id:"ao_employee_id",   label:"Employee ID",                    type:"text" },
          { id:"ao_decision",      label:"Accounting Officer Decision",    type:"select",   required:true, options:["Approved — Proceed to Tender Preparation","Approved with Conditions","Returned for Revision","Rejected"] },
          { id:"ao_conditions",    label:"Conditions (if applicable)",     type:"textarea" },
          { id:"ao_approval_date", label:"Approval Date",                  type:"date",     required:true },
          { id:"ao_signature",     label:"Accounting Officer Signature",   type:"text",     required:true },
          { id:"ao_declaration",   label:"Accounting Officer Declaration", type:"checkbox", placeholder:"I confirm this procurement strategy is approved and compliant", required:true },
        ],
      },
    ],
  },
];
