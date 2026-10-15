import type { StageConfig } from "@/components/StageFormWorkbench";

export const CONTRACT_EXECUTION_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 15,
    stageName: "Stage 15 — Contract Execution",
    subStageName: "Contract Mobilisation & Kick-off",
    majorActivity: "Supplier mobilises resources, site handover, kickoff meeting",
    aiControl: "Readiness Checklist — AI verifies all preconditions met before execution starts",
    requiredAuthorization: "Project Manager",
    steps: [
      {
        id: "mobilisation",
        title: "Mobilisation Details",
        fields: [
          { id:"contract_ref_exec",label:"Contract Reference",              type:"text",     required:true },
          { id:"kickoff_date",     label:"Kickoff Meeting Date",            type:"date",     required:true },
          { id:"site_handover_date",label:"Site Handover Date",             type:"date" },
          { id:"supplier_pm",      label:"Supplier Project Manager",        type:"text",     required:true },
          { id:"govt_pm",          label:"Government Project Manager",      type:"text",     required:true },
          { id:"work_programme",   label:"Work Programme Submitted?",       type:"radio",    options:["Yes","Pending","Not Required"] },
          { id:"resources_deployed",label:"Key Resources Deployed?",        type:"radio",    options:["Yes","Partial","No — Behind Schedule"] },
          { id:"ai_readiness",     label:"AI Readiness Check",              type:"readonly", placeholder:"AI verifying all preconditions are met..." },
        ],
      },
      {
        id: "progress-tracking",
        title: "Progress Tracking",
        fields: [
          { id:"reporting_frequency",label:"Progress Reporting Frequency",  type:"select",  options:["Weekly","Bi-Weekly","Monthly","Milestone-Based"] },
          { id:"milestone_1",      label:"Milestone 1 Description",         type:"text",     required:true },
          { id:"milestone_1_date", label:"Milestone 1 Target Date",         type:"date",     required:true },
          { id:"milestone_2",      label:"Milestone 2 Description",         type:"text" },
          { id:"milestone_2_date", label:"Milestone 2 Target Date",         type:"date" },
          { id:"ai_schedule",      label:"AI Schedule Analysis",            type:"readonly", placeholder:"AI comparing programme vs contract milestones..." },
          { id:"delay_risk",       label:"Delay Risk Flag",                 type:"readonly", placeholder:"AI predicting delay probability..." },
          { id:"pm_declaration",   label:"Project Manager Declaration",     type:"checkbox", placeholder:"I confirm the contract execution has commenced as planned", required:true },
        ],
      },
    ],
  },
  {
    stageNumber: 15,
    stageName: "Stage 15 — Contract Execution",
    subStageName: "Variation & Change Management",
    majorActivity: "Manage approved contract variations and change orders",
    aiControl: "Scope Creep Detection — AI flags variations exceeding approved thresholds",
    requiredAuthorization: "Accounting Officer",
    steps: [
      {
        id: "variation-request",
        title: "Variation Request",
        fields: [
          { id:"variation_ref",    label:"Variation Order Reference",       type:"readonly", placeholder:"Auto: VO-2026-XXXXX" },
          { id:"variation_type",   label:"Variation Type",                  type:"select",   options:["Additional Works","Reduced Scope","Time Extension","Specification Change","Provisional Sum Instruction","Emergency Works"] },
          { id:"variation_desc",   label:"Description of Variation",        type:"textarea", required:true, fullWidth:true },
          { id:"variation_value",  label:"Variation Value (USD)",           type:"currency", required:true },
          { id:"cumulative_variation",label:"Cumulative Variation % of Original Contract",type:"number", hint:"Alert if >10% — requires Accounting Officer approval" },
          { id:"ai_scope_creep",   label:"AI Scope Creep Flag",             type:"readonly", placeholder:"AI monitoring cumulative variations vs threshold..." },
          { id:"variation_justification",label:"Variation Justification",   type:"textarea", required:true },
          { id:"ao_variation_approval",label:"Accounting Officer Approval", type:"select",   options:["Approved","Rejected","Escalated to Minister"] },
        ],
      },
    ],
  },
];
