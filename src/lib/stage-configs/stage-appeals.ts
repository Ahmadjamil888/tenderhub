import type { StageConfig } from "@/components/StageFormWorkbench";

export const APPEALS_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 23,
    stageName: "Stage 23 — Appeals",
    subStageName: "Appeal Lodgement",
    majorActivity: "Register and track formal procurement appeals",
    aiControl: "Workflow Tracking — AI monitors all deadlines, response obligations and escalation timelines",
    requiredAuthorization: "Appeals Committee",
    steps: [
      {
        id: "lodge-appeal",
        title: "Lodge Appeal",
        fields: [
          { id:"appeal_ref2",      label:"Appeal Reference",                type:"readonly", placeholder:"Auto: APP-ZW-2026-XXXXX" },
          { id:"tender_ref_app",   label:"Tender / Procurement Reference",  type:"text",     required:true },
          { id:"appellant2",       label:"Appellant Company",               type:"text",     required:true },
          { id:"appellant_contact",label:"Appellant Contact Person",        type:"text",     required:true },
          { id:"appellant_email",  label:"Appellant Email",                 type:"email",    required:true },
          { id:"appeal_type",      label:"Type of Appeal",                  type:"select",   required:true, options:["Award Decision","Disqualification","Evaluation Methodology","Technical Specification Challenge","Procedural Irregularity","Other"] },
          { id:"appeal_grounds",   label:"Grounds for Appeal",              type:"textarea", required:true, fullWidth:true },
          { id:"supporting_evidence",label:"Supporting Evidence Description",type:"textarea",placeholder:"Describe documents / evidence attached" },
        ],
      },
      {
        id: "appeal-processing",
        title: "Processing & Decision",
        fields: [
          { id:"appeal_date2",     label:"Date Lodged",                     type:"date",     required:true },
          { id:"within_time",      label:"Within Statutory Time Limit?",    type:"radio",    options:["Yes","No — Out of Time"] },
          { id:"committee_chair4", label:"Appeals Committee Chairperson",   type:"text",     required:true },
          { id:"hearing_date2",    label:"Hearing Date",                    type:"date",     required:true },
          { id:"ai_deadline_track",label:"AI Deadline Tracking",            type:"readonly", placeholder:"AI monitoring response deadlines..." },
          { id:"decision2",        label:"Committee Decision",              type:"select",   options:["Dismissed — Award Upheld","Upheld — Re-evaluate","Upheld — Re-tender","Settled","Escalated to High Court"] },
          { id:"decision_date2",   label:"Decision Date",                   type:"date",     required:true },
          { id:"app_declaration",  label:"Committee Declaration",           type:"checkbox", placeholder:"We confirm this appeal was heard fairly and impartially", required:true },
        ],
      },
    ],
  },
];
