import type { StageConfig } from "@/components/StageFormWorkbench";

export const GOVERNANCE_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 22,
    stageName: "Stage 22 — Governance",
    subStageName: "Conflict of Interest Monitoring",
    majorActivity: "Manage COI declarations and monitor for undisclosed conflicts",
    aiControl: "AI Relationship Mapping — detects hidden relationships between evaluators and bidders",
    requiredAuthorization: "Ethics Office",
    steps: [
      {
        id: "coi-declaration",
        title: "COI Declaration",
        fields: [
          { id:"officer_name",     label:"Officer Name",                    type:"text",     required:true },
          { id:"officer_title",    label:"Title / Position",                type:"text",     required:true },
          { id:"tender_ref_coi",   label:"Tender / Procurement Reference",  type:"text",     required:true },
          { id:"has_conflict",     label:"Do You Have a Conflict?",         type:"radio",    required:true, options:["No — No Conflict","Yes — Declare Below"] },
          { id:"conflict_nature",  label:"Nature of Conflict (if any)",     type:"textarea", placeholder:"Describe relationship, financial interest, family connection etc." },
          { id:"ai_rel_mapping",   label:"AI Relationship Mapping Result",  type:"readonly", placeholder:"AI scanning for undisclosed relationships..." },
          { id:"recusal",          label:"Recusal Required?",               type:"radio",    options:["No","Yes — Recused from Process"] },
          { id:"coi_declaration",  label:"COI Declaration",                 type:"checkbox", required:true, placeholder:"I declare the above is true and complete to the best of my knowledge" },
        ],
      },
    ],
  },
  {
    stageNumber: 22,
    stageName: "Stage 22 — Governance",
    subStageName: "Fraud & Collusion Detection",
    majorActivity: "Detect bid rigging, cartel behaviour and procurement fraud patterns",
    aiControl: "AI Fraud Engine — analyses bid patterns, pricing clusters and relationship networks for collusion signals",
    requiredAuthorization: "Anti-Corruption Officer",
    steps: [
      {
        id: "fraud-screening",
        title: "Fraud & Collusion Screening",
        fields: [
          { id:"screening_ref",    label:"Screening Reference",             type:"readonly", placeholder:"Auto: SCR-2026-XXXXX" },
          { id:"tender_ref_fraud", label:"Tender Reference",                type:"text",     required:true },
          { id:"bid_pattern_flag", label:"Suspicious Bid Patterns Detected?",type:"readonly",placeholder:"AI analysing pricing patterns..." },
          { id:"price_cluster",    label:"Price Clustering Detected?",      type:"readonly", placeholder:"AI checking for abnormally similar bids..." },
          { id:"common_ownership", label:"Common Ownership Links?",         type:"readonly", placeholder:"AI company relationship mapping..." },
          { id:"ip_address_check", label:"Same IP Submissions?",            type:"readonly", placeholder:"AI checking submission metadata..." },
          { id:"risk_score_fraud", label:"Overall Fraud Risk Score",        type:"readonly", placeholder:"AI risk engine calculating..." },
          { id:"action_required",  label:"Action Required?",                type:"select",   options:["No Action — Clean","Flag for Investigation","Refer to ZACC / Police","Disqualify Affected Bids"] },
        ],
      },
      {
        id: "whistleblower",
        title: "Whistleblower Management",
        fields: [
          { id:"complaint_ref",    label:"Complaint Reference",             type:"text" },
          { id:"complaint_nature", label:"Nature of Complaint",             type:"select",   options:["Bid Rigging","Bribery","Kickbacks","Conflict of Interest","Forgery","Other Fraud"] },
          { id:"anonymous",        label:"Anonymous Complaint?",            type:"radio",    options:["Yes","No"] },
          { id:"complaint_details",label:"Complaint Details",               type:"textarea", fullWidth:true },
          { id:"investigation_status",label:"Investigation Status",         type:"select",   options:["Received","Under Investigation","Substantiated","Unsubstantiated","Referred to Law Enforcement"] },
          { id:"confidentiality",  label:"Confidentiality Protected?",      type:"radio",    options:["Yes","No"] },
          { id:"case_officer",     label:"Assigned Case Officer",           type:"text" },
          { id:"fraud_declaration",label:"Anti-Corruption Officer Declaration",type:"checkbox",placeholder:"I confirm this case is being handled per protocol", required:true },
        ],
      },
    ],
  },
  {
    stageNumber: 22,
    stageName: "Stage 22 — Governance",
    subStageName: "Policy Compliance Monitoring",
    majorActivity: "Continuous monitoring of all procurement activities against PPDPAA and internal policies",
    aiControl: "AI Compliance Engine — real-time policy compliance scoring across all active tenders",
    requiredAuthorization: "Procurement Director",
    steps: [
      {
        id: "compliance-monitoring",
        title: "Compliance Monitoring",
        fields: [
          { id:"monitoring_period",label:"Monitoring Period",               type:"text",     required:true },
          { id:"tenders_audited",  label:"Number of Tenders Audited",       type:"number",   required:true },
          { id:"compliant_count2", label:"Fully Compliant",                 type:"number",   required:true },
          { id:"minor_issues",     label:"Minor Issues Found",              type:"number" },
          { id:"major_issues",     label:"Major Issues Found",              type:"number" },
          { id:"ai_compliance2",   label:"AI Overall Compliance Score",     type:"readonly", placeholder:"AI calculating compliance rate across all tenders..." },
          { id:"remediation_plan", label:"Remediation Plan",                type:"textarea", fullWidth:true, placeholder:"Actions to address any compliance gaps" },
          { id:"compliance_sign",  label:"Procurement Director Signature",  type:"text",     required:true },
        ],
      },
    ],
  },
];
