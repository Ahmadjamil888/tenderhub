/**
 * Stage 4 — Contract Management
 * Sub-stages per spec:
 *  1. Notice of Award
 *  2. Regret Letters
 *  3. Standstill Period
 *  4. Appeals Management
 *  5. Contract Negotiation
 *  6. Contract Approval
 *  7. Contract Signing
 *  8. Performance Security
 *  9. Contract Registration
 * 10. Purchase Order
 * 11. Contract Kick-off
 */
import type { StageConfig } from "@/components/StageFormWorkbench";

export const STAGE4_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 4,
    stageName: "Stage 4 — Contract Management",
    subStageName: "Notice of Award",
    majorActivity: "Issue formal award notice to successful bidder",
    aiControl: "Auto Notifications — AI generates and dispatches award notices automatically on approval",
    requiredAuthorization: "Procurement Officer",
    steps: [
      {
        id: "award-notice",
        title: "Award Notice Details",
        fields: [
          { id:"award_ref",        label:"Award Notice Reference",          type:"readonly", placeholder:"Auto-generated: AWARD-2026-XXXXX" },
          { id:"award_date",       label:"Date of Notice",                  type:"date",     required:true },
          { id:"awarded_bidder",   label:"Awarded Bidder / Company",        type:"text",     required:true },
          { id:"bidder_address",   label:"Bidder Postal Address",           type:"textarea", required:true },
          { id:"bidder_email",     label:"Bidder Email Address",            type:"email",    required:true },
          { id:"awarded_value",    label:"Awarded Contract Value (USD)",    type:"currency", required:true },
          { id:"delivery_period",  label:"Delivery / Completion Period",    type:"text",     required:true, placeholder:"e.g. 12 months from contract signing" },
          { id:"ai_notice_dispatch",label:"AI Auto-Dispatch Status",        type:"readonly", placeholder:"Notice will be auto-sent on approval" },
        ],
      },
      {
        id: "standstill-setup",
        title: "Standstill Period",
        fields: [
          { id:"standstill_days",  label:"Standstill Period (Days)",        type:"number",   required:true, placeholder:"Typically 10-14 days per PPDPAA" },
          { id:"standstill_start", label:"Standstill Start Date",           type:"date",     required:true },
          { id:"standstill_end",   label:"Standstill End Date",             type:"readonly", placeholder:"Auto-calculated" },
          { id:"appeals_window",   label:"Appeals Window Open?",            type:"readonly", placeholder:"System will monitor" },
          { id:"proc_officer",     label:"Procurement Officer Name",        type:"text",     required:true },
          { id:"proc_officer_date",label:"Notice Issued Date",              type:"date",     required:true },
          { id:"regret_letters_sent",label:"Regret Letters Sent to Unsuccessful Bidders?", type:"radio", options:["Yes","Pending"] },
          { id:"award_declaration",label:"Officer Declaration",             type:"checkbox", placeholder:"I confirm the award notice has been properly issued", required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 4,
    stageName: "Stage 4 — Contract Management",
    subStageName: "Contract Negotiation",
    majorActivity: "Negotiate final contract terms with awarded supplier",
    aiControl: "Clause Comparison — AI compares negotiated clauses against standard templates and flags unfavourable deviations",
    requiredAuthorization: "Legal",
    steps: [
      {
        id: "negotiation-scope",
        title: "Negotiation Scope",
        fields: [
          { id:"neg_date",         label:"Negotiation Session Date",        type:"date",     required:true },
          { id:"neg_venue",        label:"Venue / Platform",                type:"text",     required:true },
          { id:"gov_team",         label:"Government Negotiation Team",     type:"textarea", required:true },
          { id:"supplier_team",    label:"Supplier Negotiation Team",       type:"textarea", required:true },
          { id:"scope_items",      label:"Items for Negotiation",           type:"textarea", required:true, fullWidth:true, placeholder:"List specific terms, prices, delivery periods, warranty, milestones being negotiated" },
          { id:"original_value",   label:"Original Awarded Value (USD)",    type:"currency", required:true },
          { id:"ai_clause_compare",label:"AI Clause Comparison Status",     type:"readonly", placeholder:"AI comparing negotiated clauses against standard templates..." },
          { id:"negotiation_limit",label:"Maximum Allowed Deviation from Bid Value (%)", type:"number", placeholder:"e.g. 5" },
        ],
      },
      {
        id: "negotiation-outcome",
        title: "Negotiation Outcome",
        fields: [
          { id:"agreed_value",     label:"Final Agreed Contract Value (USD)",type:"currency",required:true },
          { id:"value_change",     label:"Change from Original Award Value", type:"readonly",placeholder:"Calculated automatically" },
          { id:"agreed_delivery",  label:"Agreed Delivery / Completion",    type:"text",    required:true },
          { id:"agreed_payment",   label:"Agreed Payment Terms",            type:"textarea",required:true },
          { id:"agreed_milestones",label:"Agreed Milestones",               type:"textarea" },
          { id:"flagged_clauses2", label:"AI-Flagged Clauses",              type:"readonly",placeholder:"AI will list any unfavourable deviations" },
          { id:"legal_approval_neg",label:"Legal Advisor Approval",         type:"radio",   options:["Approved","Conditional","Requires Escalation"] },
          { id:"neg_declaration",  label:"Negotiation Declaration",         type:"checkbox",placeholder:"Both parties confirm these negotiation outcomes are agreed", required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 4,
    stageName: "Stage 4 — Contract Management",
    subStageName: "Contract Signing",
    majorActivity: "Digital signatures by all authorised parties",
    aiControl: "Certificate Validation — AI verifies digital certificate authenticity and signing authority",
    requiredAuthorization: "Contracting Parties",
    steps: [
      {
        id: "signing-details",
        title: "Contract Signing",
        fields: [
          { id:"contract_number",  label:"Contract Number",                 type:"readonly", placeholder:"Auto-generated: CON-2026-XXXXX" },
          { id:"signing_date",     label:"Signing Date",                    type:"date",     required:true },
          { id:"gov_signatory",    label:"Government Signatory (Name & Title)", type:"text", required:true },
          { id:"gov_auth_ref",     label:"Government Signatory Authority",  type:"text",     required:true, hint:"Must reference current Delegation of Authority" },
          { id:"supplier_signatory",label:"Supplier Signatory (Name & Title)",type:"text",  required:true },
          { id:"supplier_auth_ref",label:"Supplier Signatory Authority",    type:"text",     required:true, hint:"Company resolution / board authority" },
          { id:"witnesses",        label:"Witnesses (names)",               type:"textarea" },
          { id:"ai_cert_validation",label:"AI Certificate Validation",      type:"readonly", placeholder:"AI verifying digital certificate authenticity..." },
        ],
      },
      {
        id: "contract-registration",
        title: "Contract Registration & PO",
        fields: [
          { id:"contract_reg_ref", label:"Contract Registry Reference",     type:"readonly", placeholder:"Auto-assigned on signing" },
          { id:"ifmis_reg_ref",    label:"IFMIS Registration Reference",    type:"text",     required:true },
          { id:"performance_bond2",label:"Performance Bond Lodged?",        type:"radio",    options:["Yes","Pending"] },
          { id:"insurance_received",label:"Insurance Certificates Received?",type:"radio",  options:["Yes","Pending","Not Required"] },
          { id:"po_number",        label:"Purchase Order Number",           type:"readonly", placeholder:"Auto-generated on contract registration" },
          { id:"budget_reserved",  label:"Budget Reserved in IFMIS?",       type:"radio",    options:["Yes","Pending"] },
          { id:"commencement_date",label:"Contract Commencement Date",      type:"date",     required:true },
          { id:"completion_date",  label:"Contract Completion Date",        type:"date",     required:true },
        ],
      },
    ],
  },
];
