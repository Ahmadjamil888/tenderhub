/**
 * Stage 3 — Tender Evaluation
 * Sub-stages per spec:
 *  1. Bid Opening
 *  2. Preliminary Examination
 *  3. Technical Evaluation
 *  4. Financial Evaluation
 *  5. Life Cycle Cost Analysis
 *  6. Supplier Due Diligence
 *  7. Integrity Assessment
 *  8. Price Benchmarking
 *  9. Risk Assessment
 * 10. Combined Evaluation
 * 11. Evaluation Report
 * 12. Procurement Committee Review
 * 13. Award Recommendation
 * 14. Accounting Officer Approval
 */
import type { StageConfig } from "@/components/StageFormWorkbench";

export const STAGE3_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 3,
    stageName: "Stage 3 — Tender Evaluation",
    subStageName: "Bid Opening",
    majorActivity: "Electronic opening of all submitted bids",
    aiControl: "Automatic Opening Register — AI generates timestamped opening register with bid counts and values",
    requiredAuthorization: "Opening Committee",
    steps: [
      {
        id: "opening-details",
        title: "Opening Session Details",
        fields: [
          { id:"opening_date",     label:"Opening Date",                   type:"date",     required:true },
          { id:"opening_time",     label:"Opening Time",                   type:"text",     required:true, placeholder:"e.g. 10:00 AM" },
          { id:"opening_venue",    label:"Opening Venue",                  type:"text",     required:true },
          { id:"chair_name",       label:"Opening Committee Chairperson",  type:"text",     required:true },
          { id:"members_present2", label:"Committee Members Present",      type:"textarea", required:true },
          { id:"observers",        label:"Observers Present (if any)",     type:"textarea" },
          { id:"bids_received",    label:"Total Bids Received",            type:"number",   required:true },
          { id:"late_bids",        label:"Late Bids (Rejected)",           type:"number",   placeholder:"Must be 0 — system rejects automatically" },
        ],
      },
      {
        id: "bid-register",
        title: "Bid Opening Register",
        fields: [
          { id:"bidder_1",         label:"Bidder 1 — Name",               type:"text",     required:true },
          { id:"bidder_1_value",   label:"Bidder 1 — Bid Value (USD)",    type:"currency", required:true },
          { id:"bidder_2",         label:"Bidder 2 — Name",               type:"text" },
          { id:"bidder_2_value",   label:"Bidder 2 — Bid Value (USD)",    type:"currency" },
          { id:"bidder_3",         label:"Bidder 3 — Name",               type:"text" },
          { id:"bidder_3_value",   label:"Bidder 3 — Bid Value (USD)",    type:"currency" },
          { id:"ai_register_generated",label:"AI Opening Register Status",type:"readonly", placeholder:"Auto-generated register with timestamps" },
          { id:"opening_signed",   label:"Opening Committee Declaration",  type:"checkbox", placeholder:"We certify the opening was conducted fairly and transparently", required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 3,
    stageName: "Stage 3 — Tender Evaluation",
    subStageName: "Preliminary Examination",
    majorActivity: "Check mandatory requirements — Pass/Fail",
    aiControl: "AI Checklist Validation — auto-checks all mandatory compliance items against each bid",
    requiredAuthorization: "Evaluation Team",
    steps: [
      {
        id: "compliance-checks",
        title: "Mandatory Compliance Checks",
        fields: [
          { id:"company_registration",label:"Company Registration Certificate",type:"select",options:["Pass","Fail","Pending"], required:true },
          { id:"tax_clearance",    label:"Tax Clearance Certificate (ZIMRA)",  type:"select",options:["Pass","Fail","Pending"], required:true },
          { id:"praz_certificate", label:"PRAZ Registration Certificate",      type:"select",options:["Pass","Fail","Pending"], required:true },
          { id:"bid_security_check",label:"Bid Security Submitted",            type:"select",options:["Pass","Fail","N/A"],     required:true },
          { id:"criminal_directors",label:"Directors Criminal Records Clear",  type:"select",options:["Pass","Fail","Pending"], required:true },
          { id:"blacklist_check",  label:"Not Blacklisted (PRAZ Register)",    type:"select",options:["Pass","Fail","Pending"], required:true },
          { id:"solvency_check",   label:"Company Solvency — Not Insolvent",   type:"select",options:["Pass","Fail","Pending"] },
          { id:"ai_compliance_result",label:"AI Checklist Result",             type:"readonly",placeholder:"AI auto-validating all compliance items..." },
        ],
      },
      {
        id: "preliminary-outcome",
        title: "Preliminary Examination Outcome",
        fields: [
          { id:"compliant_count",  label:"Number of Compliant Bidders",         type:"number",  required:true },
          { id:"disqualified_count",label:"Number Disqualified",                type:"number",  required:true },
          { id:"disqualified_list",label:"Disqualified Bidders (with reasons)", type:"textarea", fullWidth:true },
          { id:"evaluation_team_lead",label:"Evaluation Team Leader",           type:"text",    required:true },
          { id:"prelim_date",      label:"Examination Completion Date",          type:"date",    required:true },
          { id:"proceed_technical",label:"Proceed to Technical Evaluation?",    type:"radio",   options:["Yes — Sufficient Compliant Bids","No — Re-tender Required"] },
          { id:"prelim_notes",     label:"Notes",                               type:"textarea" },
          { id:"prelim_declaration",label:"Team Declaration",                   type:"checkbox",placeholder:"We confirm preliminary examination was conducted fairly", required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 3,
    stageName: "Stage 3 — Tender Evaluation",
    subStageName: "Technical Evaluation",
    majorActivity: "Technical scoring against published weighted criteria",
    aiControl: "AI-Assisted Scoring Support — AI suggests scores based on bid content analysis and flags inconsistencies",
    requiredAuthorization: "Technical Committee",
    steps: [
      {
        id: "technical-scoring",
        title: "Technical Scoring",
        fields: [
          { id:"evaluator_1",      label:"Technical Evaluator 1 Name",         type:"text",    required:true },
          { id:"evaluator_2",      label:"Technical Evaluator 2 Name",         type:"text",    required:true },
          { id:"evaluator_3",      label:"Technical Evaluator 3 Name",         type:"text" },
          { id:"scoring_method",   label:"Scoring Method Applied",             type:"select",  options:["Individual then Consensus","Panel Scoring","Independent then Average"] },
          { id:"max_tech_score",   label:"Maximum Technical Score",            type:"number",  required:true, placeholder:"e.g. 100" },
          { id:"pass_threshold",   label:"Pass Threshold (%)",                 type:"number",  required:true, placeholder:"e.g. 70" },
          { id:"ai_scoring_assist",label:"AI Scoring Assistance Status",       type:"readonly",placeholder:"AI analysing bids and suggesting scores..." },
          { id:"scoring_date",     label:"Scoring Session Date",               type:"date",    required:true },
        ],
      },
      {
        id: "scores-summary",
        title: "Scores Summary",
        fields: [
          { id:"tech_score_1",     label:"Bidder 1 Technical Score (%)",       type:"number",  required:true },
          { id:"tech_score_2",     label:"Bidder 2 Technical Score (%)",       type:"number" },
          { id:"tech_score_3",     label:"Bidder 3 Technical Score (%)",       type:"number" },
          { id:"tech_score_4",     label:"Bidder 4 Technical Score (%)",       type:"number" },
          { id:"tech_score_5",     label:"Bidder 5 Technical Score (%)",       type:"number" },
          { id:"tech_passed_count",label:"Number Passing Technical Threshold", type:"number",  required:true },
          { id:"tech_committee_chair",label:"Technical Committee Chairperson", type:"text",    required:true },
          { id:"tech_declaration", label:"Technical Committee Declaration",    type:"checkbox",placeholder:"We confirm all scores are independent, fair and properly recorded", required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 3,
    stageName: "Stage 3 — Tender Evaluation",
    subStageName: "Financial Evaluation",
    majorActivity: "Price comparison and financial offer ranking",
    aiControl: "Outlier Detection — AI flags abnormally low or high bids that suggest errors or front-loading",
    requiredAuthorization: "Financial Evaluators",
    steps: [
      {
        id: "financial-scoring",
        title: "Financial Ranking",
        fields: [
          { id:"financial_method", label:"Financial Evaluation Method",        type:"select",  options:["Lowest Price","Formula: Lowest/This Bid × 100","Life Cycle Cost","Cost Per Deliverable"] },
          { id:"fin_offer_1",      label:"Bidder 1 Financial Offer (USD)",     type:"currency",required:true },
          { id:"fin_offer_2",      label:"Bidder 2 Financial Offer (USD)",     type:"currency" },
          { id:"fin_offer_3",      label:"Bidder 3 Financial Offer (USD)",     type:"currency" },
          { id:"fin_offer_4",      label:"Bidder 4 Financial Offer (USD)",     type:"currency" },
          { id:"lowest_bid",       label:"Lowest Responsive Bid (USD)",        type:"readonly",placeholder:"Auto-identified" },
          { id:"ai_outlier_check", label:"AI Outlier Detection Result",        type:"readonly",placeholder:"AI checking for abnormal pricing..." },
          { id:"abnormal_bids",    label:"Abnormal Bids Flagged",              type:"textarea",placeholder:"AI will list any bids flagged as outliers" },
        ],
      },
      {
        id: "financial-outcome",
        title: "Financial Evaluation Outcome",
        fields: [
          { id:"fin_score_1",      label:"Bidder 1 Financial Score (%)",       type:"number",  required:true },
          { id:"fin_score_2",      label:"Bidder 2 Financial Score (%)",       type:"number" },
          { id:"fin_score_3",      label:"Bidder 3 Financial Score (%)",       type:"number" },
          { id:"budget_check",     label:"Lowest Bid Within Budget?",          type:"radio",   options:["Yes","No — Scope Reduction Required","No — Seek Additional Funds"] },
          { id:"vat_included",     label:"VAT Inclusive?",                     type:"radio",   options:["Yes","No"] },
          { id:"fin_evaluator",    label:"Financial Evaluator Name",           type:"text",    required:true },
          { id:"fin_eval_date",    label:"Evaluation Date",                    type:"date",    required:true },
          { id:"fin_declaration",  label:"Financial Evaluator Declaration",    type:"checkbox",placeholder:"I confirm financial evaluation was conducted correctly", required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 3,
    stageName: "Stage 3 — Tender Evaluation",
    subStageName: "Combined Evaluation & Award Recommendation",
    majorActivity: "Final ranking and award recommendation",
    aiControl: "AI Recommendation — AI generates ranked list with weighted combined scores and flags any concerns",
    requiredAuthorization: "Evaluation Committee",
    steps: [
      {
        id: "combined-scores",
        title: "Combined Weighted Scores",
        fields: [
          { id:"tech_weight_final",label:"Technical Weight Applied (%)",       type:"number",  required:true, placeholder:"e.g. 70" },
          { id:"fin_weight_final", label:"Financial Weight Applied (%)",       type:"number",  required:true, placeholder:"e.g. 30" },
          { id:"combined_1",       label:"Bidder 1 Combined Score (%)",        type:"number",  required:true },
          { id:"combined_2",       label:"Bidder 2 Combined Score (%)",        type:"number" },
          { id:"combined_3",       label:"Bidder 3 Combined Score (%)",        type:"number" },
          { id:"recommended_bidder",label:"Recommended Bidder",               type:"text",    required:true },
          { id:"recommended_value",label:"Recommended Contract Value (USD)",   type:"currency",required:true },
          { id:"ai_recommendation2",label:"AI Recommendation Note",           type:"readonly",placeholder:"AI generating recommendation with rationale..." },
        ],
      },
      {
        id: "award-approval",
        title: "Award Recommendation & Accounting Officer Approval",
        fields: [
          { id:"committee_resolution",label:"Committee Resolution",            type:"textarea",required:true, fullWidth:true, placeholder:"Full committee resolution text recommending award" },
          { id:"ao_name_eval",     label:"Accounting Officer Name",           type:"text",    required:true },
          { id:"ao_decision_eval", label:"Accounting Officer Decision",       type:"select",  required:true, options:["Award Approved","Deferred — Further Review","Re-tender","Cancelled"] },
          { id:"ao_award_date",    label:"Decision Date",                     type:"date",    required:true },
          { id:"ao_award_sign",    label:"Accounting Officer Signature",      type:"text",    required:true },
          { id:"authority_limits", label:"Authority Limits Confirmed?",       type:"radio",   options:["Yes — within limits","No — Escalate to Minister"] },
          { id:"proceed_award",    label:"Proceed to Contract Management?",   type:"radio",   options:["Yes","No — Hold"] },
          { id:"ao_eval_declaration",label:"AO Declaration",                  type:"checkbox",placeholder:"I confirm this award decision is final and within my authority", required:true },
        ],
      },
    ],
  },
];
