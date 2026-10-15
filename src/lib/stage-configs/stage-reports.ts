import type { StageConfig } from "@/components/StageFormWorkbench";

export const REPORTS_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 25,
    stageName: "Stage 25 — Reports",
    subStageName: "Procurement Performance Report",
    majorActivity: "Generate and submit procurement performance analytics reports",
    aiControl: "AI Auto-Report Generation — generates comprehensive reports from live procurement data",
    requiredAuthorization: "Procurement Director",
    steps: [
      {
        id: "report-params",
        title: "Report Parameters",
        fields: [
          { id:"report_ref2",      label:"Report Reference",                type:"readonly", placeholder:"Auto: RPT-2026-XXXXX" },
          { id:"report_type",      label:"Report Type",                     type:"select",   required:true, options:["Monthly Performance Report","Quarterly Analytics Report","Annual Procurement Report","Ad-hoc Executive Report","Public Procurement Report","Audit Report","Savings Analysis","Contract Compliance Report","Supplier Performance Report"] },
          { id:"report_period",    label:"Reporting Period",                type:"text",     required:true, placeholder:"e.g. Q1 FY2026/27 or Jan–Mar 2026" },
          { id:"prepared_by_rpt",  label:"Prepared By",                    type:"text",     required:true },
          { id:"ministry_rpt",     label:"Ministry / Entity",              type:"text",     required:true },
          { id:"audience",         label:"Report Audience",                type:"select",   options:["Internal — Procurement Team","HOD / Director","Accounting Officer","Minister","Parliament","Public","PRAZ","Auditor General"] },
          { id:"ai_report_gen",    label:"AI Report Generation Status",    type:"readonly", placeholder:"AI generating report from live data..." },
          { id:"data_sources",     label:"Data Sources",                   type:"textarea", placeholder:"e.g. IFMIS, Tender Register, Contract Database, Supplier Evaluations" },
        ],
      },
      {
        id: "report-content",
        title: "Report Content & Approval",
        fields: [
          { id:"total_value_rpt",  label:"Total Procurement Value (USD)",   type:"currency", required:true },
          { id:"tenders_processed",label:"Tenders Processed",               type:"number",   required:true },
          { id:"awards_made",      label:"Awards Made",                     type:"number",   required:true },
          { id:"avg_cycle_rpt",    label:"Average Cycle Time (days)",       type:"number",   required:true },
          { id:"savings_rpt",      label:"Savings Achieved (USD)",          type:"currency" },
          { id:"compliance_rpt",   label:"Compliance Rate (%)",             type:"number",   required:true },
          { id:"key_findings_rpt", label:"Key Findings",                   type:"textarea", required:true, fullWidth:true },
          { id:"director_approval2",label:"Procurement Director Approval",  type:"radio",   options:["Approved for Distribution","Draft — Review Required"] },
        ],
      },
    ],
  },
  {
    stageNumber: 25,
    stageName: "Stage 25 — Reports",
    subStageName: "Public Procurement Reporting",
    majorActivity: "Publish required public procurement disclosures per PPDPAA",
    aiControl: "Disclosure Compliance Check — AI validates all required public disclosures are complete",
    requiredAuthorization: "Accounting Officer",
    steps: [
      {
        id: "public-disclosure",
        title: "Public Disclosure",
        fields: [
          { id:"disclosure_ref",   label:"Disclosure Reference",            type:"readonly", placeholder:"Auto: DISC-2026-XXXXX" },
          { id:"disclosure_period",label:"Disclosure Period",               type:"text",     required:true },
          { id:"awards_to_disclose",label:"Awards to Disclose",             type:"number",   required:true },
          { id:"portal_published", label:"Published to PRAZ Portal?",       type:"radio",    options:["Yes","Pending","Exemption Applied"] },
          { id:"gazette_published",label:"Published in Government Gazette?",type:"radio",   options:["Yes","Pending","N/A"] },
          { id:"ai_disclosure",    label:"AI Disclosure Completeness Check",type:"readonly", placeholder:"AI validating all required disclosures..." },
          { id:"exemptions",       label:"Exemptions Applied (if any)",     type:"textarea", placeholder:"State legal basis for any non-disclosure" },
          { id:"ao_disclosure",    label:"Accounting Officer Sign-off",     type:"checkbox", placeholder:"I confirm all required public disclosures have been made", required:true },
        ],
      },
    ],
  },
];
