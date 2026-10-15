import type { StageConfig } from "@/components/StageFormWorkbench";

export const ASSET_MGMT_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 20,
    stageName: "Stage 20 — Asset Management",
    subStageName: "Asset Registration",
    majorActivity: "Register procured assets in the national asset register",
    aiControl: "Asset Registry Integration — AI auto-populates register from contract and GRN data",
    requiredAuthorization: "Asset Manager",
    steps: [
      {
        id: "asset-registration",
        title: "Asset Registration",
        fields: [
          { id:"asset_reg_ref",    label:"Asset Register Reference",        type:"readonly", placeholder:"Auto: AST-2026-XXXXX" },
          { id:"asset_name",       label:"Asset Name / Description",        type:"text",     required:true },
          { id:"asset_category",   label:"Asset Category",                  type:"select",   required:true, options:["Land & Buildings","Vehicles & Equipment","ICT Equipment","Furniture & Fittings","Machinery & Plant","Infrastructure","Intangible Assets"] },
          { id:"asset_serial",     label:"Serial Number / Asset Tag",       type:"text",     required:true },
          { id:"asset_cost",       label:"Asset Acquisition Cost (USD)",    type:"currency", required:true },
          { id:"acquisition_date", label:"Acquisition Date",                type:"date",     required:true },
          { id:"useful_life",      label:"Useful Life (years)",             type:"number",   required:true },
          { id:"depreciation_method",label:"Depreciation Method",          type:"select",   options:["Straight Line","Reducing Balance","Units of Production"] },
        ],
      },
      {
        id: "asset-assignment",
        title: "Assignment & Location",
        fields: [
          { id:"assigned_dept",    label:"Assigned Department",             type:"text",     required:true },
          { id:"custodian",        label:"Asset Custodian",                 type:"text",     required:true },
          { id:"physical_location",label:"Physical Location",              type:"text",     required:true },
          { id:"gps_asset",        label:"GPS Location (if applicable)",   type:"text",     placeholder:"AI will validate" },
          { id:"condition",        label:"Current Condition",              type:"select",   options:["New","Good","Fair","Poor","Condemned"] },
          { id:"maintenance_plan", label:"Maintenance Plan Required?",     type:"radio",    options:["Yes","No"] },
          { id:"insurance_required",label:"Insurance Required?",           type:"radio",    options:["Yes","No"] },
          { id:"asset_declaration",label:"Asset Manager Declaration",      type:"checkbox", placeholder:"I confirm this asset has been registered correctly", required:true },
        ],
      },
    ],
  },
  {
    stageNumber: 20,
    stageName: "Stage 20 — Asset Management",
    subStageName: "Asset Disposal",
    majorActivity: "Manage disposal of obsolete or condemned assets",
    aiControl: "Disposal Compliance Check — AI validates disposal method against Treasury Instructions",
    requiredAuthorization: "Accounting Officer",
    steps: [
      {
        id: "disposal-request",
        title: "Disposal Request",
        fields: [
          { id:"disposal_ref",     label:"Disposal Reference",              type:"readonly", placeholder:"Auto: DISP-2026-XXXXX" },
          { id:"asset_ref_disp",   label:"Asset Register Reference",        type:"text",     required:true },
          { id:"disposal_reason",  label:"Reason for Disposal",             type:"select",   options:["Obsolete / End of Life","Condemned — Beyond Repair","Surplus to Requirements","Donated / Transferred","Lost / Stolen"] },
          { id:"disposal_method",  label:"Proposed Disposal Method",        type:"select",   options:["Public Auction","Competitive Sale","Trade-In","Donation to NGO","Destruction / Scrapping","Transfer to Another Entity"] },
          { id:"net_book_value",   label:"Net Book Value (USD)",            type:"currency" },
          { id:"estimated_proceeds",label:"Estimated Proceeds (USD)",       type:"currency" },
          { id:"ai_disposal_check",label:"AI Disposal Compliance Check",   type:"readonly", placeholder:"AI validating disposal method vs Treasury Instructions..." },
          { id:"ao_disposal",      label:"Accounting Officer Approval",     type:"select",   options:["Approved","Rejected","Further Justification Required"] },
        ],
      },
    ],
  },
];
