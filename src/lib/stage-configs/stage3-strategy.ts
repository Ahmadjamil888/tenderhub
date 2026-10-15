/**
 * Strategy Workbench sub-stages
 * Covers: Market Analysis, Sourcing Strategy, Make-or-Buy, Framework decisions,
 * Category Management, Supplier Landscape, Strategy Approval
 */
import type { StageConfig } from "@/components/StageFormWorkbench";

export const STRATEGY_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 3,
    stageName: "Stage 3 — Procurement Strategy & Sourcing",
    subStageName: "Market Analysis",
    majorActivity: "Analyse the market for available suppliers and price benchmarks",
    aiControl: "AI Market Intelligence — auto-analyses supplier landscape, price trends and market depth",
    requiredAuthorization: "Procurement Manager",
    steps: [
      {
        id: "market-scope",
        title: "Market Scope",
        fields: [
          { id:"category",         label:"Procurement Category",            type:"select",   required:true, options:["Goods","Works","Services","Consultancy","ICT","Infrastructure","Healthcare","Education"] },
          { id:"market_ref",       label:"Market Analysis Reference",       type:"text",     required:true },
          { id:"analysis_date",    label:"Analysis Date",                   type:"date",     required:true },
          { id:"analyst_name",     label:"Analyst / Procurement Officer",   type:"text",     required:true },
          { id:"geographic_scope", label:"Geographic Market Scope",         type:"select",   options:["Local — Zimbabwe","Regional — SADC","International","All Markets"] },
          { id:"estimated_suppliers",label:"Estimated Number of Suppliers", type:"number",   required:true },
          { id:"market_maturity",  label:"Market Maturity",                 type:"select",   options:["Mature — Many Suppliers","Growing — Limited Suppliers","Niche — Specialist Only","Monopoly / Duopoly"] },
          { id:"ai_market_intel",  label:"AI Market Intelligence Result",   type:"readonly", placeholder:"AI scanning supplier database and price trends..." },
        ],
      },
      {
        id: "market-findings",
        title: "Market Findings",
        fields: [
          { id:"supply_risks",     label:"Supply Side Risks",               type:"textarea", required:true, placeholder:"Shortage, single source, import dependency, capacity constraints" },
          { id:"demand_risks",     label:"Demand / Competition Risks",      type:"textarea", placeholder:"Competitor demand, price inflation, seasonal variations" },
          { id:"price_range_low",  label:"Market Price Range — Low (USD)",  type:"currency", required:true },
          { id:"price_range_high", label:"Market Price Range — High (USD)", type:"currency", required:true },
          { id:"ai_benchmark_price",label:"AI Benchmark Price (USD)",       type:"readonly", placeholder:"AI calculating from historical and market data..." },
          { id:"local_content",    label:"Local Content Available?",        type:"radio",    options:["Yes — Adequate","Partial — Supplemented Imports","No — Import Only"] },
          { id:"sme_suppliers",    label:"SME Suppliers Available?",        type:"radio",    options:["Yes","No","Limited"] },
          { id:"market_summary",   label:"Market Analysis Summary",         type:"textarea", required:true, fullWidth:true },
        ],
      },
    ],
  },

  {
    stageNumber: 3,
    stageName: "Stage 3 — Procurement Strategy & Sourcing",
    subStageName: "Sourcing Strategy",
    majorActivity: "Define sourcing approach — single vs multi-source, framework, direct, open competition",
    aiControl: "AI Recommends Optimal Sourcing Strategy — based on market analysis, value, risk and policy",
    requiredAuthorization: "Procurement Director",
    steps: [
      {
        id: "strategy-options",
        title: "Sourcing Strategy Options",
        fields: [
          { id:"sourcing_approach",label:"Sourcing Approach",               type:"select",   required:true, options:["Open Competition","Restricted / Shortlisted","Single Source (Justified)","Framework Agreement","Collaborative / Consortium Buying","Public-Private Partnership","Build-Operate-Transfer"] },
          { id:"make_or_buy",      label:"Make or Buy Decision",            type:"radio",    options:["Buy — External Procurement","Make — In-House","Hybrid"] },
          { id:"single_multi",     label:"Single or Multi-Supplier?",       type:"radio",    options:["Single Supplier","Multi-Supplier (Competition)","Framework — Multiple Suppliers"] },
          { id:"lot_strategy",     label:"Lot Strategy",                    type:"select",   options:["Single Lot","Geographic Lots","Category Lots","Value-Based Lots","No Lots"] },
          { id:"local_preference", label:"Apply Local Preference Policy?",  type:"radio",    options:["Yes — 10% Margin","Yes — 15% Margin","No"] },
          { id:"sme_reservation",  label:"Reserved for SMEs?",              type:"radio",    options:["Yes","No","Partial Reservation"] },
          { id:"ai_strategy_rec",  label:"AI Recommended Strategy",         type:"readonly", placeholder:"AI analysing options against policy and risk..." },
          { id:"strategy_rationale",label:"Chosen Strategy Rationale",      type:"textarea", required:true },
        ],
      },
      {
        id: "strategy-approval",
        title: "Strategy Approval",
        fields: [
          { id:"proc_director",    label:"Procurement Director Name",       type:"text",     required:true },
          { id:"strategy_decision",label:"Strategy Approved?",              type:"select",   options:["Approved","Conditionally Approved","Revised","Escalated to Committee"] },
          { id:"conditions_str",   label:"Conditions (if any)",             type:"textarea" },
          { id:"approval_date_str",label:"Approval Date",                   type:"date",     required:true },
          { id:"forward_to_prep",  label:"Forward to Tender Preparation?",  type:"radio",    options:["Yes","No — Revise"] },
          { id:"framework_register",label:"Register in Framework Agreement Register?", type:"radio", options:["Yes","No"] },
          { id:"strategy_version", label:"Strategy Document Version",       type:"text",     placeholder:"e.g. v1.0 Final" },
          { id:"str_declaration",  label:"Director Declaration",            type:"checkbox", placeholder:"I confirm this sourcing strategy is approved and compliant", required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 3,
    stageName: "Stage 3 — Procurement Strategy & Sourcing",
    subStageName: "Category Management",
    majorActivity: "Manage procurement by category for spend optimisation",
    aiControl: "AI Spend Analysis — identifies spend patterns, consolidation opportunities and preferred supplier agreements",
    requiredAuthorization: "Procurement Manager",
    steps: [
      {
        id: "category-profile",
        title: "Category Profile",
        fields: [
          { id:"category_name",    label:"Category Name",                   type:"text",     required:true },
          { id:"category_code",    label:"Category Code (UNSPSC / Local)", type:"text",     placeholder:"e.g. 42000000 — Medical Equipment" },
          { id:"annual_spend",     label:"Annual Spend on Category (USD)", type:"currency", required:true },
          { id:"no_of_suppliers",  label:"Current Number of Suppliers",    type:"number",   required:true },
          { id:"preferred_suppliers",label:"Preferred Suppliers (if any)", type:"textarea", placeholder:"List current preferred / approved suppliers" },
          { id:"contract_coverage",label:"Category Under Framework?",      type:"radio",    options:["Yes","No","Partially"] },
          { id:"ai_spend_analysis",label:"AI Spend Analysis",              type:"readonly", placeholder:"AI analysing category spend and optimisation opportunities..." },
          { id:"category_risk",    label:"Category Risk Rating",           type:"select",   options:["Low","Medium","High","Strategic"] },
        ],
      },
      {
        id: "category-strategy",
        title: "Category Strategy",
        fields: [
          { id:"reduction_target", label:"Cost Reduction Target (%)",      type:"number",   placeholder:"e.g. 10" },
          { id:"consolidation_opp",label:"Consolidation Opportunities",    type:"textarea" },
          { id:"innovation_opp",   label:"Innovation / Substitution",      type:"textarea" },
          { id:"local_dev_opp",    label:"Local Supplier Development Opportunity", type:"textarea" },
          { id:"sustainability",   label:"Sustainability / Green Procurement Goal", type:"textarea" },
          { id:"category_manager", label:"Category Manager Name",          type:"text",    required:true },
          { id:"review_frequency", label:"Category Review Frequency",      type:"select",  options:["Monthly","Quarterly","Bi-Annual","Annual"] },
          { id:"cat_declaration",  label:"Category Manager Declaration",   type:"checkbox",placeholder:"I confirm this category strategy is correct and approved", required:true },
        ],
      },
    ],
  },
];
