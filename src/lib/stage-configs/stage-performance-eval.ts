import type { StageConfig } from "@/components/StageFormWorkbench";

export const PERFORMANCE_EVAL_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 21,
    stageName: "Stage 21 — Performance Evaluation",
    subStageName: "Supplier Performance Evaluation",
    majorActivity: "Evaluate supplier delivery, quality, compliance and responsiveness",
    aiControl: "AI Performance Scoring — auto-calculates scores from delivery records, quality reports and compliance logs",
    requiredAuthorization: "Procurement Manager",
    steps: [
      {
        id: "supplier-perf",
        title: "Performance Assessment",
        fields: [
          { id:"eval_period",      label:"Evaluation Period",               type:"text",     required:true, placeholder:"e.g. Jan–Jun 2026" },
          { id:"supplier_eval",    label:"Supplier Name",                   type:"text",     required:true },
          { id:"contract_ref3",    label:"Contract Reference",              type:"text",     required:true },
          { id:"delivery_score",   label:"Delivery Timeliness Score (0-25)",type:"number",   required:true },
          { id:"quality_score",    label:"Quality / Specification Score (0-25)",type:"number",required:true },
          { id:"compliance_score2",label:"Compliance Score (0-25)",         type:"number",   required:true },
          { id:"responsiveness",   label:"Responsiveness Score (0-25)",     type:"number",   required:true },
          { id:"ai_perf_score",    label:"AI Calculated Overall Score",     type:"readonly", placeholder:"AI aggregating performance data..." },
        ],
      },
      {
        id: "perf-outcome",
        title: "Evaluation Outcome",
        fields: [
          { id:"total_score",      label:"Total Performance Score (/100)",  type:"readonly", placeholder:"Sum of all criteria" },
          { id:"perf_grade",       label:"Performance Grade",               type:"readonly", placeholder:"A=90-100, B=75-89, C=60-74, D=Below 60" },
          { id:"improvement_areas",label:"Areas for Improvement",           type:"textarea" },
          { id:"blacklist_trigger",label:"Trigger Blacklist Process?",      type:"radio",    options:["No","Yes — Score Below 50"] },
          { id:"preferred_supplier",label:"Retain as Preferred Supplier?",  type:"radio",   options:["Yes","No — Delist"] },
          { id:"next_eval_date",   label:"Next Evaluation Date",            type:"date" },
          { id:"pm_perf_name",     label:"Procurement Manager Name",        type:"text",     required:true },
          { id:"perf_declaration", label:"PM Declaration",                  type:"checkbox", placeholder:"I confirm this evaluation is fair, accurate and properly recorded", required:true },
        ],
      },
    ],
  },
  {
    stageNumber: 21,
    stageName: "Stage 21 — Performance Evaluation",
    subStageName: "Procurement Performance Analytics",
    majorActivity: "Analyse procurement KPIs: cycle time, savings, compliance rate, vendor concentration",
    aiControl: "AI Analytics Engine — generates procurement performance dashboard and trend analysis",
    requiredAuthorization: "Procurement Director",
    steps: [
      {
        id: "kpi-data",
        title: "Procurement KPI Data",
        fields: [
          { id:"period_analytics", label:"Analysis Period",                 type:"text",     required:true },
          { id:"total_proc_value", label:"Total Procurement Value (USD)",   type:"currency", required:true },
          { id:"avg_cycle_days",   label:"Average Procurement Cycle (days)",type:"number",   required:true },
          { id:"competitive_pct",  label:"Competitive Procurement (%)",     type:"number",   required:true },
          { id:"single_source_pct",label:"Single Source Procurement (%)",   type:"number",   required:true },
          { id:"savings_achieved", label:"Savings Achieved (USD)",          type:"currency" },
          { id:"compliance_rate",  label:"Procurement Compliance Rate (%)", type:"number",   required:true },
          { id:"ai_analytics",     label:"AI Analytics Summary",            type:"readonly", placeholder:"AI generating performance dashboard..." },
        ],
      },
      {
        id: "kpi-targets",
        title: "KPI Targets vs Actuals",
        fields: [
          { id:"cycle_target",     label:"Cycle Time Target (days)",        type:"number",   placeholder:"Target: <45 days" },
          { id:"cycle_actual",     label:"Cycle Time Actual (days)",        type:"number",   required:true },
          { id:"competitive_target",label:"Competitive Procurement Target (%)",type:"number",placeholder:"Target: >90%" },
          { id:"savings_target",   label:"Savings Target (USD)",            type:"currency" },
          { id:"plan_achievement", label:"Procurement Plan Achievement (%)",type:"number",   required:true },
          { id:"lessons",          label:"Key Lessons Learned",             type:"textarea", fullWidth:true },
          { id:"analytics_director",label:"Procurement Director Name",      type:"text",     required:true },
          { id:"analytics_declaration",label:"Director Declaration",        type:"checkbox", placeholder:"I confirm these analytics are accurate and complete", required:true },
        ],
      },
    ],
  },
];
