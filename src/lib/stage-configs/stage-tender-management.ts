import type { StageConfig } from "@/components/StageFormWorkbench";

export const TENDER_MGMT_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 5,
    stageName: "Stage 5 — Tender Management",
    subStageName: "Active Tender Monitoring",
    majorActivity: "Monitor all active tenders — timelines, queries, amendments, compliance",
    aiControl: "AI Tender Health Score — real-time scoring of each tender's compliance, progress and risk",
    requiredAuthorization: "Procurement Manager",
    steps: [
      {
        id: "tender-dashboard",
        title: "Active Tender Status",
        fields: [
          { id:"monitoring_ref",   label:"Monitoring Record Reference",     type:"readonly", placeholder:"Auto: MON-2026-XXXXX" },
          { id:"tender_ref_mgmt",  label:"Tender Reference",                type:"text",     required:true },
          { id:"current_stage",    label:"Current Procurement Stage",       type:"select",   options:["Advertised","Clarification Period","Site Visit Done","Submission Open","Bid Closing","Evaluation","Award Pending","Awarded","Contract Signed"] },
          { id:"days_to_close",    label:"Days to Bid Closing",             type:"number" },
          { id:"bids_received_so_far",label:"Bids Received So Far",         type:"number" },
          { id:"queries_outstanding",label:"Outstanding Queries",           type:"number" },
          { id:"ai_health_score",  label:"AI Tender Health Score",          type:"readonly", placeholder:"AI scoring compliance, timeline and risk..." },
          { id:"risk_flag",        label:"Risk Flags",                      type:"readonly", placeholder:"AI flagging any issues requiring attention..." },
        ],
      },
      {
        id: "addenda-management",
        title: "Addenda & Amendment Management",
        fields: [
          { id:"addendum_ref",     label:"Addendum Reference",              type:"text",     placeholder:"e.g. ADD-2026-001 (leave blank if none)" },
          { id:"addendum_reason",  label:"Reason for Addendum",             type:"textarea", placeholder:"Specification change, timeline extension, correction..." },
          { id:"addendum_issued",  label:"Addendum Issued?",                type:"radio",    options:["Yes — Published to All Bidders","No — Pending","Not Required"] },
          { id:"deadline_extended",label:"Bid Deadline Extended?",          type:"radio",    options:["No","Yes — New Date Below"] },
          { id:"new_deadline",     label:"New Bid Deadline (if extended)",  type:"date" },
          { id:"all_notified",     label:"All Bidders Notified?",           type:"radio",    options:["Yes — Via Portal","Pending"] },
          { id:"pm_mgmt_name",     label:"Procurement Manager Name",        type:"text",     required:true },
          { id:"mgmt_declaration", label:"Management Declaration",          type:"checkbox", placeholder:"I confirm all tender management activities are properly recorded", required:true },
        ],
      },
    ],
  },
  {
    stageNumber: 5,
    stageName: "Stage 5 — Tender Management",
    subStageName: "Tender Register",
    majorActivity: "Maintain the official tender register with all key dates and statuses",
    aiControl: "Auto-Updates — AI automatically updates register from procurement workflow events",
    requiredAuthorization: "Procurement Officer",
    steps: [
      {
        id: "register-entry",
        title: "Tender Register Entry",
        fields: [
          { id:"reg_tender_no",    label:"Tender Number",                   type:"text",     required:true },
          { id:"reg_title",        label:"Tender Title",                    type:"text",     required:true },
          { id:"reg_entity",       label:"Procuring Entity",                type:"text",     required:true },
          { id:"reg_category",     label:"Category",                        type:"select",   options:["Goods","Works","Services","Consultancy","ICT","Infrastructure"] },
          { id:"reg_value",        label:"Estimated / Awarded Value (USD)", type:"currency", required:true },
          { id:"reg_method",       label:"Procurement Method",              type:"select",   options:["Open Tender","RFQ","RFP","EOI","Restricted","Direct","Framework","Auction"] },
          { id:"reg_status",       label:"Status",                          type:"select",   options:["Planning","Advertised","Evaluation","Awarded","Contract Active","Completed","Cancelled"] },
          { id:"reg_award_date",   label:"Award Date",                      type:"date" },
        ],
      },
    ],
  },
];
