/**
 * Stage 5 — Tender Implementation
 * Sub-stages per spec:
 *  1. Goods Delivery
 *  2. Services Delivery
 *  3. Project Monitoring
 *  4. GIS Monitoring
 *  5. Inspection
 *  6. Acceptance
 *  7. Invoice Submission
 *  8. Invoice Verification
 *  9. Payment Request
 * 10. Payment Approval
 * 11. Treasury Payment
 * 12. Supplier Notification
 * 13. Contract Closure
 */
import type { StageConfig } from "@/components/StageFormWorkbench";

export const STAGE5_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 5,
    stageName: "Stage 5 — Tender Implementation",
    subStageName: "Goods Delivery / Services Delivery",
    majorActivity: "Confirm delivery and service completion",
    aiControl: "GPS Validation & Milestone Verification — AI verifies delivery location and checks milestone completion against contract",
    requiredAuthorization: "Receiving Officer / User Department",
    steps: [
      {
        id: "delivery-details",
        title: "Delivery Details",
        fields: [
          { id:"grn_number",       label:"Goods Receipt Note (GRN) Number",  type:"readonly", placeholder:"Auto-generated: GRN-2026-XXXXX" },
          { id:"delivery_date2",   label:"Date of Delivery / Service",       type:"date",     required:true },
          { id:"delivery_type",    label:"Delivery Type",                    type:"radio",    required:true, options:["Goods","Services","Works Milestone","Partial Delivery"] },
          { id:"contract_ref",     label:"Contract Reference",               type:"text",     required:true },
          { id:"po_ref",           label:"Purchase Order Reference",         type:"text",     required:true },
          { id:"delivery_location2",label:"Delivery Location",              type:"text",     required:true },
          { id:"gps_coordinates",  label:"GPS Coordinates (if applicable)", type:"text",     placeholder:"e.g. -17.8252° S, 31.0335° E — AI validates" },
          { id:"ai_gps_check",     label:"AI GPS Validation Result",        type:"readonly", placeholder:"Pending GPS verification..." },
        ],
      },
      {
        id: "delivery-confirmation",
        title: "Delivery Confirmation & Inspection",
        fields: [
          { id:"qty_ordered",      label:"Quantity Ordered",                type:"number",   required:true },
          { id:"qty_delivered",    label:"Quantity Delivered",              type:"number",   required:true },
          { id:"qty_accepted",     label:"Quantity Accepted",               type:"number",   required:true },
          { id:"qty_rejected",     label:"Quantity Rejected / Short",       type:"number",   placeholder:"0 if all accepted" },
          { id:"condition",        label:"Condition on Delivery",           type:"select",   options:["Excellent","Good","Acceptable with Minor Issues","Rejected — Defective","Partial — Balance Pending"] },
          { id:"receiving_officer",label:"Receiving Officer Name",         type:"text",     required:true },
          { id:"receiving_date",   label:"Date Confirmed",                  type:"date",     required:true },
          { id:"grn_declaration",  label:"Receiving Officer Declaration",   type:"checkbox", placeholder:"I confirm the goods/services were received as described", required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 5,
    stageName: "Stage 5 — Tender Implementation",
    subStageName: "Inspection & Acceptance",
    majorActivity: "Quality verification and issuance of acceptance certificate",
    aiControl: "Checklist Engine — AI generates inspection checklist from contract specs; Digital Signatures on acceptance",
    requiredAuthorization: "Inspection Team / User Department",
    steps: [
      {
        id: "inspection",
        title: "Inspection",
        fields: [
          { id:"inspection_date",  label:"Inspection Date",                 type:"date",     required:true },
          { id:"inspection_team",  label:"Inspection Team Members",         type:"textarea", required:true },
          { id:"spec_compliance",  label:"Complies with Technical Specs?",  type:"radio",    options:["Yes — Full Compliance","Partial — Minor Issues","No — Defective"], required:true },
          { id:"quality_grade",    label:"Quality Grade",                   type:"select",   options:["Grade A — Excellent","Grade B — Good","Grade C — Acceptable","Grade D — Below Standard","Rejected"] },
          { id:"inspection_findings",label:"Inspection Findings",           type:"textarea", required:true, fullWidth:true },
          { id:"defects_noted",    label:"Defects / Issues Noted",          type:"textarea", placeholder:"Describe any defects, deviations or shortfalls" },
          { id:"ai_checklist",     label:"AI Inspection Checklist Status",  type:"readonly", placeholder:"AI checklist engine generating from contract specs..." },
          { id:"reinspection_required",label:"Re-inspection Required?",     type:"radio",    options:["No","Yes — Set New Date"] },
        ],
      },
      {
        id: "acceptance",
        title: "Acceptance Certificate",
        fields: [
          { id:"acceptance_cert_ref",label:"Acceptance Certificate Reference",type:"readonly",placeholder:"Auto-generated: ACC-2026-XXXXX" },
          { id:"acceptance_decision",label:"Acceptance Decision",            type:"select",  required:true, options:["Accepted — Full","Accepted — Provisional (conditions below)","Rejected — Return to Supplier"] },
          { id:"conditions_acceptance",label:"Conditions (if Provisional)", type:"textarea" },
          { id:"warranty_start",   label:"Warranty / Defects Liability Start",type:"date",  required:true },
          { id:"warranty_end",     label:"Warranty / Defects Liability End",  type:"date",  required:true },
          { id:"user_dept_head",   label:"User Department Head Name",        type:"text",    required:true },
          { id:"acceptance_digital_sign",label:"Digital Signature (User Dept Head)",type:"text",required:true },
          { id:"acceptance_declaration",label:"Acceptance Declaration",      type:"checkbox",placeholder:"I confirm acceptance of the goods/services/works as described", required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 5,
    stageName: "Stage 5 — Tender Implementation",
    subStageName: "Invoice Verification & Payment",
    majorActivity: "Three-way matching: Contract–PO–GRN–Invoice → Payment processing",
    aiControl: "Three-Way Matching & Duplicate Payment Detection — AI matches invoice against PO, GRN and contract; detects duplicates",
    requiredAuthorization: "Finance / CFO / Treasury",
    steps: [
      {
        id: "invoice-submission",
        title: "Invoice Submission",
        fields: [
          { id:"invoice_number",   label:"Supplier Invoice Number",          type:"text",     required:true },
          { id:"invoice_date",     label:"Invoice Date",                     type:"date",     required:true },
          { id:"invoice_value",    label:"Invoice Amount (USD)",             type:"currency", required:true },
          { id:"vat_amount",       label:"VAT Amount (USD)",                 type:"currency" },
          { id:"total_payable",    label:"Total Payable (USD)",              type:"readonly", placeholder:"Invoice + VAT" },
          { id:"payment_terms",    label:"Payment Terms",                    type:"select",   options:["Net 30 days","Net 45 days","Net 60 days","On Acceptance","Milestone-based"] },
          { id:"bank_name",        label:"Supplier Bank Name",               type:"text",     required:true },
          { id:"bank_account",     label:"Supplier Bank Account",            type:"text",     required:true, hint:"AI will verify against registered vendor bank details" },
        ],
      },
      {
        id: "three-way-match",
        title: "Three-Way Match & Payment Approval",
        fields: [
          { id:"po_match",         label:"Matches Purchase Order?",          type:"radio",    required:true, options:["Yes","No — Discrepancy"] },
          { id:"grn_match",        label:"Matches GRN / Acceptance Cert?",   type:"radio",    required:true, options:["Yes","No — Discrepancy"] },
          { id:"contract_match",   label:"Matches Contract Terms?",          type:"radio",    required:true, options:["Yes","No — Discrepancy"] },
          { id:"ai_three_way",     label:"AI Three-Way Match Result",        type:"readonly", placeholder:"AI auto-matching invoice vs PO vs GRN vs Contract..." },
          { id:"duplicate_check2", label:"AI Duplicate Payment Check",       type:"readonly", placeholder:"AI checking for previous payments on this invoice..." },
          { id:"cfo_approval",     label:"CFO Approval",                     type:"select",   options:["Approved for Payment","Returned — Discrepancy","On Hold — Investigation"] },
          { id:"payment_due_date", label:"Payment Due Date",                 type:"date",     required:true },
          { id:"payment_declaration",label:"Finance Declaration",            type:"checkbox", placeholder:"I confirm this payment is authorised and all checks have passed", required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 5,
    stageName: "Stage 5 — Tender Implementation",
    subStageName: "Contract Closure",
    majorActivity: "Close contract, final compliance validation, archive",
    aiControl: "Compliance Validation — AI runs final closure checklist against all contract obligations",
    requiredAuthorization: "Procurement Officer",
    steps: [
      {
        id: "closure-checklist",
        title: "Contract Closure Checklist",
        fields: [
          { id:"all_deliveries",   label:"All Deliveries Completed?",        type:"radio",    required:true, options:["Yes","No — Outstanding Items"] },
          { id:"all_payments",     label:"All Payments Made?",               type:"radio",    required:true, options:["Yes","No — Outstanding Payments"] },
          { id:"warranty_registered",label:"Warranty/DLP Registered?",       type:"radio",    options:["Yes","No","N/A"] },
          { id:"assets_registered",label:"Assets Registered in Asset Register?",type:"radio", options:["Yes","No","N/A"] },
          { id:"retention_released",label:"Retention Released?",             type:"radio",    options:["Yes","Pending","N/A"] },
          { id:"disputes_resolved",label:"All Disputes Resolved?",           type:"radio",    required:true, options:["Yes","No — Outstanding"] },
          { id:"lessons_learned",  label:"Lessons Learned Recorded?",        type:"radio",    options:["Yes","No"] },
          { id:"ai_closure_check", label:"AI Closure Compliance Check",      type:"readonly", placeholder:"AI final compliance validation..." },
        ],
      },
      {
        id: "closure-final",
        title: "Final Closure",
        fields: [
          { id:"closure_date",     label:"Contract Closure Date",            type:"date",     required:true },
          { id:"final_value",      label:"Final Contract Value (USD)",       type:"currency", required:true },
          { id:"variation_summary",label:"Summary of Variations (if any)",  type:"textarea", placeholder:"List any approved contract variations and their values" },
          { id:"performance_rating",label:"Supplier Performance Rating",    type:"select",   options:["Excellent (90-100%)","Good (75-89%)","Satisfactory (60-74%)","Below Standard (Below 60%)"] },
          { id:"perf_eval_ref",    label:"Performance Evaluation Reference",type:"text" },
          { id:"closure_officer",  label:"Procurement Officer Name",        type:"text",     required:true },
          { id:"closure_approval", label:"Closure Approved By",             type:"text",     required:true },
          { id:"closure_declaration",label:"Closure Declaration",           type:"checkbox", placeholder:"I confirm this contract is formally closed and all obligations met", required:true },
        ],
      },
    ],
  },
];
