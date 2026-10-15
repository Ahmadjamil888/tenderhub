import type { StageConfig } from "@/components/StageFormWorkbench";

export const AUDIT_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 24,
    stageName: "Stage 24 — Audit",
    subStageName: "Internal Audit",
    majorActivity: "Conduct internal procurement audit against plan and compliance requirements",
    aiControl: "AI Audit Trail Review — immutable audit trail analysis with anomaly detection",
    requiredAuthorization: "Internal Audit Manager",
    steps: [
      {
        id: "audit-plan",
        title: "Audit Plan",
        fields: [
          { id:"audit_ref",        label:"Audit Reference",                 type:"readonly", placeholder:"Auto: AUD-INT-2026-XXXXX" },
          { id:"audit_period",     label:"Audit Period",                    type:"text",     required:true },
          { id:"auditor_name",     label:"Lead Auditor",                    type:"text",     required:true },
          { id:"scope",            label:"Audit Scope",                     type:"textarea", required:true, fullWidth:true, placeholder:"What aspects of procurement will be audited" },
          { id:"tenders_in_scope", label:"Tenders / Contracts in Scope",    type:"textarea", required:true, placeholder:"List tender/contract references" },
          { id:"audit_objectives", label:"Audit Objectives",                type:"textarea", required:true },
          { id:"ai_trail_check",   label:"AI Audit Trail Analysis",         type:"readonly", placeholder:"AI scanning immutable audit trail for anomalies..." },
          { id:"risk_areas",       label:"High Risk Areas Identified",      type:"textarea" },
        ],
      },
      {
        id: "audit-findings",
        title: "Audit Findings & Report",
        fields: [
          { id:"critical_findings",label:"Critical Findings",               type:"number",   required:true },
          { id:"high_findings",    label:"High Risk Findings",              type:"number",   required:true },
          { id:"medium_findings",  label:"Medium Risk Findings",            type:"number" },
          { id:"low_findings",     label:"Low Risk Findings",               type:"number" },
          { id:"findings_detail",  label:"Key Findings Summary",            type:"textarea", required:true, fullWidth:true },
          { id:"management_response",label:"Management Response",           type:"textarea", required:true, fullWidth:true },
          { id:"action_plan",      label:"Remediation Action Plan",         type:"textarea", required:true, fullWidth:true },
          { id:"audit_declaration",label:"Auditor Declaration",             type:"checkbox", placeholder:"I confirm this audit was conducted independently and objectively", required:true },
        ],
      },
    ],
  },
  {
    stageNumber: 24,
    stageName: "Stage 24 — Audit",
    subStageName: "Audit Trail Review",
    majorActivity: "Review complete immutable audit trail for selected procurement",
    aiControl: "Blockchain-Secured Audit Trail — every action timestamped and immutable",
    requiredAuthorization: "Compliance Officer",
    steps: [
      {
        id: "trail-review",
        title: "Audit Trail Review",
        fields: [
          { id:"trail_tender_ref", label:"Tender / Contract Reference",     type:"text",     required:true },
          { id:"review_date",      label:"Review Date",                     type:"date",     required:true },
          { id:"reviewer",         label:"Compliance Officer",              type:"text",     required:true },
          { id:"trail_complete",   label:"Audit Trail Complete?",           type:"readonly", placeholder:"AI verifying all required events logged..." },
          { id:"gaps_detected",    label:"Gaps / Missing Events",           type:"readonly", placeholder:"AI identifying missing workflow steps..." },
          { id:"tampering_detected",label:"Tampering Detected?",            type:"readonly", placeholder:"AI verifying cryptographic hash integrity..." },
          { id:"trail_score",      label:"Trail Completeness Score",        type:"readonly", placeholder:"AI scoring 0-100..." },
          { id:"trail_declaration",label:"Compliance Declaration",          type:"checkbox", placeholder:"I confirm the audit trail review is complete", required:true },
        ],
      },
    ],
  },
];
