import type { StageConfig } from "@/components/StageFormWorkbench";

export const CONTRACT_CLOSURE_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 19,
    stageName: "Stage 19 — Contract Closure",
    subStageName: "Final Acceptance & Closure",
    majorActivity: "Issue final acceptance, release retention, close contract",
    aiControl: "Compliance Validation — AI final checklist ensuring all obligations met before closure",
    requiredAuthorization: "Procurement Officer",
    steps: [
      {
        id: "final-acceptance",
        title: "Final Acceptance",
        fields: [
          { id:"closure_contract_ref",label:"Contract Reference",           type:"text",     required:true },
          { id:"final_inspect_date",label:"Final Inspection Date",          type:"date",     required:true },
          { id:"all_works_complete",label:"All Works / Deliverables Complete?",type:"radio", required:true, options:["Yes","No — Outstanding Items"] },
          { id:"defects_rectified",label:"All Defects Rectified?",          type:"radio",    required:true, options:["Yes","No — DLP Still Active"] },
          { id:"final_cert_issued",label:"Final Acceptance Certificate Issued?",type:"radio",options:["Yes","No"] },
          { id:"retention_status", label:"Retention Status",                type:"select",   options:["Released","Pending — DLP Active","Withheld — Defects Outstanding"] },
          { id:"ai_closure_final", label:"AI Final Closure Check",          type:"readonly", placeholder:"AI running final compliance checklist..." },
          { id:"outstanding_issues",label:"Outstanding Issues",             type:"textarea", placeholder:"List any unresolved matters" },
        ],
      },
      {
        id: "lessons-learned",
        title: "Lessons Learned & Archive",
        fields: [
          { id:"final_contract_value",label:"Final Contract Value (USD)",   type:"currency", required:true },
          { id:"original_value",   label:"Original Contract Value (USD)",   type:"currency", required:true },
          { id:"total_variations", label:"Total Approved Variations (USD)", type:"currency" },
          { id:"final_duration",   label:"Actual Contract Duration",        type:"text",     required:true, placeholder:"e.g. 18 months" },
          { id:"planned_duration", label:"Planned Contract Duration",       type:"text",     required:true },
          { id:"supplier_final_grade",label:"Supplier Final Performance Grade",type:"select",options:["A — Excellent (90-100%)","B — Good (75-89%)","C — Satisfactory (60-74%)","D — Below Standard (<60%)"] },
          { id:"lessons_learned2", label:"Key Lessons Learned",             type:"textarea", required:true, fullWidth:true, placeholder:"What went well, what could be improved, recommendations for future similar procurements" },
          { id:"closure_declaration2",label:"Closure Declaration",          type:"checkbox", placeholder:"I confirm this contract is formally closed, all obligations met and records archived", required:true },
        ],
      },
    ],
  },
  {
    stageNumber: 19,
    stageName: "Stage 19 — Contract Closure",
    subStageName: "Asset Handover & Registration",
    majorActivity: "Transfer delivered assets to asset register",
    aiControl: "Asset Registry Integration — AI auto-registers delivered assets in the national asset register",
    requiredAuthorization: "Asset Manager",
    steps: [
      {
        id: "asset-handover",
        title: "Asset Handover",
        fields: [
          { id:"asset_handover_ref",label:"Handover Certificate Reference", type:"readonly", placeholder:"Auto: AHC-2026-XXXXX" },
          { id:"asset_description",label:"Asset Description",               type:"textarea", required:true },
          { id:"asset_quantity",   label:"Quantity of Assets",              type:"number",   required:true },
          { id:"asset_value",      label:"Asset Value (USD)",               type:"currency", required:true },
          { id:"receiving_dept",   label:"Receiving Department",            type:"text",     required:true },
          { id:"asset_location",   label:"Asset Location",                  type:"text",     required:true },
          { id:"ai_asset_reg",     label:"AI Asset Register Status",        type:"readonly", placeholder:"AI auto-populating asset register..." },
          { id:"handover_declaration",label:"Handover Declaration",         type:"checkbox", placeholder:"I confirm assets have been handed over and registered", required:true },
        ],
      },
    ],
  },
];
