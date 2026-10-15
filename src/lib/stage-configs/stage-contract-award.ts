import type { StageConfig } from "@/components/StageFormWorkbench";

export const CONTRACT_AWARD_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 14,
    stageName: "Stage 14 — Contract Award",
    subStageName: "Award Notice & Regret Letters",
    majorActivity: "Issue formal award to winner and regret letters to unsuccessful bidders",
    aiControl: "Auto Notifications — AI auto-generates and dispatches award and regret communications",
    requiredAuthorization: "Procurement Officer",
    steps: [
      {
        id: "award-details",
        title: "Award Details",
        fields: [
          { id:"award_ref2",       label:"Award Notice Reference",          type:"readonly", placeholder:"Auto: AWARD-ZW-2026-XXXXX" },
          { id:"tender_ref_aw",    label:"Tender Reference",                type:"text",     required:true },
          { id:"awarded_company",  label:"Awarded Company",                 type:"text",     required:true },
          { id:"award_value_usd",  label:"Award Value (USD)",               type:"currency", required:true },
          { id:"award_date2",      label:"Date of Award",                   type:"date",     required:true },
          { id:"contract_duration",label:"Contract Duration",               type:"text",     required:true, placeholder:"e.g. 24 months" },
          { id:"standstill_period",label:"Standstill Period (days)",        type:"number",   required:true, placeholder:"Min 10 days per PPDPAA" },
          { id:"ai_notice",        label:"AI Auto-Dispatch Status",         type:"readonly", placeholder:"Award + regret letters auto-generated..." },
        ],
      },
      {
        id: "regret-details",
        title: "Regret Letters",
        fields: [
          { id:"unsuccessful_1",   label:"Unsuccessful Bidder 1",           type:"text" },
          { id:"unsuccessful_2",   label:"Unsuccessful Bidder 2",           type:"text" },
          { id:"unsuccessful_3",   label:"Unsuccessful Bidder 3",           type:"text" },
          { id:"regret_reason",    label:"Standard Regret Reason",          type:"textarea", required:true, placeholder:"Standard wording for all unsuccessful bidders" },
          { id:"debrief_offered",  label:"Debrief Offered?",                type:"radio",    options:["Yes — on request","No"] },
          { id:"appeals_info",     label:"Appeals Information Included?",   type:"radio",    options:["Yes","No"] },
          { id:"regrets_sent",     label:"All Regret Letters Sent?",        type:"radio",    options:["Yes","Pending"] },
          { id:"award_declaration3",label:"Officer Declaration",            type:"checkbox", placeholder:"I confirm all notifications have been properly issued", required:true },
        ],
      },
    ],
  },
  {
    stageNumber: 14,
    stageName: "Stage 14 — Contract Award",
    subStageName: "Appeals Management",
    majorActivity: "Handle objections during standstill period",
    aiControl: "Workflow Tracking — AI tracks all appeals, deadlines and response obligations",
    requiredAuthorization: "Appeals Committee",
    steps: [
      {
        id: "appeal-registration",
        title: "Appeal Registration",
        fields: [
          { id:"appeal_ref",       label:"Appeal Reference",                type:"readonly", placeholder:"Auto: APP-2026-XXXXX" },
          { id:"appellant",        label:"Appellant Company",               type:"text",     required:true },
          { id:"appeal_date",      label:"Date of Appeal",                  type:"date",     required:true },
          { id:"grounds",          label:"Grounds for Appeal",              type:"textarea", required:true, fullWidth:true },
          { id:"supporting_docs",  label:"Supporting Documents Attached?",  type:"radio",    options:["Yes","No"] },
          { id:"within_standstill",label:"Lodged Within Standstill Period?",type:"radio",    options:["Yes","No — Out of Time"] },
          { id:"ai_appeal_track",  label:"AI Appeal Tracking Status",       type:"readonly", placeholder:"AI tracking deadlines and response obligations..." },
          { id:"committee_assigned",label:"Appeals Committee Assigned?",    type:"radio",    options:["Yes","Pending Assignment"] },
        ],
      },
      {
        id: "appeal-decision",
        title: "Committee Decision",
        fields: [
          { id:"hearing_date",     label:"Hearing Date",                    type:"date",     required:true },
          { id:"committee_chair3", label:"Committee Chairperson",           type:"text",     required:true },
          { id:"decision",         label:"Committee Decision",              type:"select",   required:true, options:["Appeal Dismissed — Award Upheld","Appeal Upheld — Re-evaluate","Appeal Upheld — Re-tender","Settled Amicably"] },
          { id:"decision_reasons", label:"Decision Reasons",                type:"textarea", required:true, fullWidth:true },
          { id:"decision_date",    label:"Decision Date",                   type:"date",     required:true },
          { id:"communicated",     label:"Decision Communicated to Parties?",type:"radio",  options:["Yes","Pending"] },
          { id:"escalation",       label:"Escalated to High Court?",        type:"radio",    options:["No","Yes — Refer to Legal"] },
          { id:"appeal_declaration",label:"Committee Declaration",          type:"checkbox", placeholder:"We confirm this decision was reached fairly and impartially", required:true },
        ],
      },
    ],
  },
];
