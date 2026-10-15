import type { StageConfig } from "@/components/StageFormWorkbench";

export const RECOMMENDATION_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 13,
    stageName: "Stage 13 — Award Recommendation",
    subStageName: "Evaluation Report & Recommendation",
    majorActivity: "Compile evaluation report and recommend award to Accounting Officer",
    aiControl: "Consistency Validation — AI checks all scores are consistent, calculations correct, no gaps",
    requiredAuthorization: "Procurement Committee",
    steps: [
      {
        id: "eval-report",
        title: "Evaluation Report",
        fields: [
          { id:"report_ref",       label:"Evaluation Report Reference",     type:"readonly", placeholder:"Auto: EVAL-RPT-2026-XXXXX" },
          { id:"tender_ref_rec",   label:"Tender Reference",                type:"text",     required:true },
          { id:"report_date",      label:"Report Date",                     type:"date",     required:true },
          { id:"committee_chair5", label:"Committee Chairperson",           type:"text",     required:true },
          { id:"total_bids2",      label:"Total Bids Received",             type:"number",   required:true },
          { id:"compliant_bids",   label:"Compliant Bids",                  type:"number",   required:true },
          { id:"disqualified_bids",label:"Disqualified Bids",               type:"number",   required:true },
          { id:"ai_consistency",   label:"AI Consistency Check",            type:"readonly", placeholder:"AI validating all scores and calculations..." },
        ],
      },
      {
        id: "recommendation",
        title: "Award Recommendation",
        fields: [
          { id:"recommended_supplier",label:"Recommended Supplier",         type:"text",     required:true },
          { id:"rec_score",        label:"Recommended Supplier Score (%)",  type:"number",   required:true },
          { id:"rec_value",        label:"Recommended Contract Value (USD)",type:"currency", required:true },
          { id:"second_place",     label:"Second-Place Supplier",           type:"text" },
          { id:"recommendation_basis",label:"Recommendation Basis",         type:"textarea", required:true, fullWidth:true },
          { id:"committee_resolution2",label:"Committee Resolution",        type:"textarea", required:true, fullWidth:true },
          { id:"ao_submit_date",   label:"Submitted to Accounting Officer", type:"date",     required:true },
          { id:"rec_declaration",  label:"Committee Declaration",           type:"checkbox", placeholder:"We confirm this recommendation is fair, supported by evidence and compliant", required:true },
        ],
      },
    ],
  },
];
