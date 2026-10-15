import type { StageConfig } from "@/components/StageFormWorkbench";

export const AI_ANALYTICS_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 26,
    stageName: "Stage 26 — AI Analytics",
    subStageName: "AI Procurement Intelligence",
    majorActivity: "AI-driven analysis of procurement patterns, risks and opportunities",
    aiControl: "Predictive Analytics Engine — forecasts delays, cost overruns, supplier risks and savings opportunities",
    requiredAuthorization: "Procurement Director",
    steps: [
      {
        id: "ai-analysis-scope",
        title: "Analysis Scope",
        fields: [
          { id:"analysis_ref",     label:"Analysis Reference",              type:"readonly", placeholder:"Auto: AI-2026-XXXXX" },
          { id:"analysis_period2", label:"Analysis Period",                 type:"text",     required:true },
          { id:"analysis_type",    label:"Analysis Type",                   type:"select",   required:true, options:["Spend Intelligence","Risk Prediction","Supplier Analysis","Compliance Analytics","Savings Opportunity","Fraud Detection","Market Intelligence","Contract Performance","Demand Forecasting","Full Portfolio"] },
          { id:"data_scope",       label:"Data Scope",                      type:"select",   options:["Single Ministry","Multiple Ministries","National — All Entities","Specific Category","Specific Suppliers"] },
          { id:"time_horizon",     label:"Forecast Horizon",                type:"select",   options:["Current Quarter","Next Quarter","Next 6 Months","Next 12 Months","3-Year Outlook"] },
          { id:"confidence_level", label:"Required Confidence Level (%)",   type:"number",   placeholder:"e.g. 85 — AI will flag results below this threshold" },
          { id:"ai_engine_status", label:"AI Engine Status",                type:"readonly", placeholder:"AI analytics engine initialising..." },
          { id:"models_applied",   label:"AI Models Applied",               type:"readonly", placeholder:"AI will list models used for this analysis" },
        ],
      },
      {
        id: "ai-findings",
        title: "AI Findings & Recommendations",
        fields: [
          { id:"risk_predictions",  label:"Top Risk Predictions",           type:"readonly", placeholder:"AI generating risk forecast..." },
          { id:"savings_identified",label:"Savings Opportunities Identified (USD)", type:"readonly", placeholder:"AI calculating potential savings..." },
          { id:"fraud_signals",     label:"Fraud / Anomaly Signals",        type:"readonly", placeholder:"AI scanning for unusual patterns..." },
          { id:"supplier_risks",    label:"High-Risk Suppliers Flagged",    type:"readonly", placeholder:"AI supplier risk scoring..." },
          { id:"delay_forecast",    label:"Predicted Delayed Contracts",    type:"readonly", placeholder:"AI predicting delivery delays..." },
          { id:"budget_forecast",   label:"Budget Overrun Forecast (USD)",  type:"readonly", placeholder:"AI forecasting cost overruns..." },
          { id:"recommendations",   label:"AI Recommendations",             type:"readonly", placeholder:"AI generating actionable recommendations..." },
          { id:"director_sign2",    label:"Procurement Director Sign-off",  type:"checkbox", placeholder:"I have reviewed the AI analysis and findings", required:true },
        ],
      },
    ],
  },
  {
    stageNumber: 26,
    stageName: "Stage 26 — AI Analytics",
    subStageName: "Executive AI Procurement Advisor",
    majorActivity: "Natural language Q&A about procurement status, risks, contracts and suppliers",
    aiControl: "Executive AI Assistant — answers natural language questions from procurement data",
    requiredAuthorization: "Accounting Officer / Minister",
    steps: [
      {
        id: "ai-advisor",
        title: "AI Advisor Query",
        fields: [
          { id:"query_officer",    label:"Querying Officer Name",           type:"text",     required:true },
          { id:"query_role",       label:"Role / Title",                   type:"text",     required:true },
          { id:"query_text",       label:"Your Question",                  type:"textarea", required:true, fullWidth:true, placeholder:"Ask in plain English e.g. 'Which contracts are at risk of delay in Q3?', 'What is our procurement compliance rate?', 'Which suppliers have poor performance scores?'" },
          { id:"context_tender",   label:"Specific Tender Reference (optional)",type:"text",placeholder:"Leave blank for system-wide analysis" },
          { id:"context_ministry", label:"Specific Ministry (optional)",   type:"text",     placeholder:"Leave blank for all ministries" },
          { id:"ai_answer",        label:"AI Response",                    type:"readonly", placeholder:"AI processing your query..." },
          { id:"data_sources2",    label:"Data Sources Used",              type:"readonly", placeholder:"AI will list data sources referenced in response" },
          { id:"confidence",       label:"AI Confidence Score",            type:"readonly", placeholder:"AI confidence in this response..." },
        ],
      },
      {
        id: "national-intel-centre",
        title: "National Procurement Intelligence Centre",
        fields: [
          { id:"npi_period",       label:"NPI Analysis Period",            type:"text",     required:true },
          { id:"national_spend",   label:"National Procurement Spend (USD)",type:"currency",required:true },
          { id:"active_tenders",   label:"Active Tenders (National)",      type:"number",   required:true },
          { id:"active_contracts", label:"Active Contracts (National)",    type:"number",   required:true },
          { id:"at_risk_count",    label:"At-Risk Contracts",              type:"readonly", placeholder:"AI identifying contracts at risk..." },
          { id:"top_category",     label:"Top Spend Category",             type:"readonly", placeholder:"AI analysing spend by category..." },
          { id:"vendor_concentration",label:"Vendor Concentration Alert",  type:"readonly", placeholder:"AI flagging vendor concentration risks..." },
          { id:"npi_sign",         label:"National Intelligence Centre Director",type:"text",required:true },
        ],
      },
    ],
  },
];
