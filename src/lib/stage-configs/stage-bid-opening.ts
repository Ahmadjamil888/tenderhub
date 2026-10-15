/**
 * Bid Opening Workbench sub-stages (Stage 11 of 26)
 * Covers: Pre-Opening Checks, Electronic Opening Session, Opening Register, Post-Opening
 */
import type { StageConfig } from "@/components/StageFormWorkbench";

export const BID_OPENING_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 11,
    stageName: "Stage 11 — Bid Opening",
    subStageName: "Pre-Opening Checks",
    majorActivity: "Verify bid vault integrity and prepare opening committee",
    aiControl: "Vault Integrity Check — AI verifies no bids were tampered with since submission",
    requiredAuthorization: "Procurement Manager",
    steps: [
      {
        id: "vault-check",
        title: "Bid Vault Integrity",
        fields: [
          { id:"tender_ref_open",  label:"Tender Reference",                type:"text",     required:true },
          { id:"vault_seal_ts",    label:"Vault Seal Timestamp",            type:"readonly", placeholder:"From bid closing — system locked" },
          { id:"integrity_hash",   label:"Cryptographic Hash (Integrity)",  type:"readonly", placeholder:"AI verifying hash unchanged since closure..." },
          { id:"bids_in_vault",    label:"Total Bids in Vault",             type:"number",   required:true },
          { id:"committee_confirmed",label:"Opening Committee Assembled?",  type:"radio",    options:["Yes — Quorum Met","No — Reschedule"] },
          { id:"observers_invited",label:"Observers / Public Invited?",     type:"radio",    options:["Yes","No — Internal Only"] },
          { id:"opening_venue2",   label:"Opening Venue",                   type:"text",     required:true },
          { id:"ai_integrity",     label:"AI Vault Integrity Result",       type:"readonly", placeholder:"Verifying cryptographic seal..." },
        ],
      },
    ],
  },
  {
    stageNumber: 11,
    stageName: "Stage 11 — Bid Opening",
    subStageName: "Electronic Opening Session",
    majorActivity: "Open all bids publicly with automatic register generation",
    aiControl: "Automatic Opening Register — AI generates timestamped register with all bid values at point of opening",
    requiredAuthorization: "Opening Committee",
    steps: [
      {
        id: "opening-session",
        title: "Opening Session",
        fields: [
          { id:"opened_by",        label:"Opened By (Chairperson)",         type:"text",     required:true },
          { id:"opening_time2",    label:"Actual Opening Time",             type:"text",     required:true },
          { id:"committee_members",label:"Committee Members Present",       type:"textarea", required:true },
          { id:"bid_1_company",    label:"Bid 1 — Company Name",            type:"text",     required:true },
          { id:"bid_1_value",      label:"Bid 1 — Total Offer (USD)",       type:"currency", required:true },
          { id:"bid_2_company",    label:"Bid 2 — Company Name",            type:"text" },
          { id:"bid_2_value",      label:"Bid 2 — Total Offer (USD)",       type:"currency" },
          { id:"bid_3_company",    label:"Bid 3 — Company Name",            type:"text" },
        ],
      },
      {
        id: "opening-register",
        title: "Opening Register",
        fields: [
          { id:"bid_3_value",      label:"Bid 3 — Total Offer (USD)",       type:"currency" },
          { id:"bid_4_company",    label:"Bid 4 — Company Name",            type:"text" },
          { id:"bid_4_value",      label:"Bid 4 — Total Offer (USD)",       type:"currency" },
          { id:"bid_5_company",    label:"Bid 5 — Company Name",            type:"text" },
          { id:"bid_5_value",      label:"Bid 5 — Total Offer (USD)",       type:"currency" },
          { id:"ai_register",      label:"AI Auto-Generated Register",      type:"readonly", placeholder:"Register generated with timestamps..." },
          { id:"lowest_offer",     label:"Lowest Offer (USD)",              type:"readonly", placeholder:"Auto-identified by AI" },
          { id:"opening_declaration",label:"Committee Declaration",         type:"checkbox", placeholder:"We confirm the opening was public, fair and all bids were opened", required:true },
        ],
      },
    ],
  },
];
