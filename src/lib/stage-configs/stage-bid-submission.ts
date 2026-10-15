import type { StageConfig } from "@/components/StageFormWorkbench";

export const BID_SUBMISSION_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 10,
    stageName: "Stage 10 — Bid Submission",
    subStageName: "Secure Bid Upload",
    majorActivity: "Supplier submits encrypted, digitally signed bid package",
    aiControl: "Digital Signatures & Encryption — AI verifies cryptographic integrity of every uploaded document",
    requiredAuthorization: "Supplier",
    steps: [
      {
        id: "bid-package",
        title: "Bid Package Upload",
        fields: [
          { id:"bid_ref2",         label:"Bid Reference",                   type:"readonly", placeholder:"Auto: BID-ZW-2026-XXXXX" },
          { id:"tender_ref_bs",    label:"Tender Reference",                type:"text",     required:true },
          { id:"bidder_company2",  label:"Bidding Company Name",            type:"text",     required:true },
          { id:"praz_reg_bs",      label:"PRAZ Registration Number",        type:"text",     required:true },
          { id:"submission_dt",    label:"Submission Date",                 type:"date",     required:true },
          { id:"bid_price",        label:"Total Bid Price (USD)",           type:"currency", required:true },
          { id:"vat_bs",           label:"VAT Inclusive?",                  type:"radio",    options:["Yes","No"] },
          { id:"currency_bs",      label:"Bid Currency",                   type:"select",   options:["USD","ZWL","ZiG","GBP","EUR","ZAR"] },
        ],
      },
      {
        id: "documents-security",
        title: "Documents & Security",
        fields: [
          { id:"tech_doc_uploaded",label:"Technical Proposal Uploaded?",    type:"radio",    required:true, options:["Yes","No"] },
          { id:"fin_doc_uploaded", label:"Financial Proposal Uploaded?",    type:"radio",    required:true, options:["Yes","No"] },
          { id:"compliance_docs2", label:"Compliance Documents Uploaded?",  type:"radio",    required:true, options:["Yes","No"] },
          { id:"bid_bond_bank",    label:"Bid Bond Issuing Bank",           type:"text",     placeholder:"Required if Bid Security specified in ITB" },
          { id:"bid_bond_value",   label:"Bid Bond Value (USD)",            type:"currency" },
          { id:"bid_bond_expiry",  label:"Bid Bond Expiry Date",            type:"date" },
          { id:"ai_sign_verify",   label:"AI Digital Signature Verification",type:"readonly",placeholder:"AI verifying cryptographic signatures on all documents..." },
          { id:"vault_encrypted",  label:"Vault Encryption Status",        type:"readonly", placeholder:"Bid encrypted and sealed in vault until opening date" },
        ],
      },
      {
        id: "bid-validity",
        title: "Validity & Declaration",
        fields: [
          { id:"bid_validity_days",label:"Bid Validity (days)",             type:"number",   required:true, hint:"Must be equal to or greater than ITB requirement" },
          { id:"bid_valid_to",     label:"Bid Valid Until",                 type:"date",     required:true },
          { id:"joint_venture_bid",label:"Joint Venture / Consortium Bid?",type:"radio",    options:["No — Single Company","Yes — Joint Venture"] },
          { id:"jv_partners",      label:"JV Partners (if applicable)",    type:"textarea", placeholder:"List all JV companies and their shares" },
          { id:"subcontractors",   label:"Subcontractors Proposed",        type:"textarea", placeholder:"List any proposed subcontractors and scope" },
          { id:"local_content_pct",label:"Local Content (%)",              type:"number",   placeholder:"e.g. 60" },
          { id:"authorized_signatory",label:"Authorized Signatory (Name)", type:"text",     required:true },
          { id:"bid_declaration",  label:"Binding Bid Declaration",        type:"checkbox", required:true, placeholder:"I confirm this bid is binding, accurate and submitted by authorised personnel" },
        ],
      },
    ],
  },
  {
    stageNumber: 10,
    stageName: "Stage 10 — Bid Submission",
    subStageName: "Bid Receipt Confirmation",
    majorActivity: "System confirms receipt of bid with timestamp",
    aiControl: "Time-Stamped Receipts — AI issues tamper-proof receipt with submission timestamp",
    requiredAuthorization: "System (Automated)",
    steps: [
      {
        id: "receipt",
        title: "Receipt Confirmation",
        fields: [
          { id:"receipt_ref",      label:"Receipt Reference",               type:"readonly", placeholder:"Auto: RCP-ZW-2026-XXXXX" },
          { id:"receipt_timestamp",label:"Receipt Timestamp",               type:"readonly", placeholder:"System-generated — immutable" },
          { id:"bid_ref_rcp",      label:"Bid Reference",                   type:"readonly", placeholder:"From submission" },
          { id:"tender_ref_rcp",   label:"Tender Reference",                type:"readonly", placeholder:"From submission" },
          { id:"files_received",   label:"Files Received",                  type:"readonly", placeholder:"Count of uploaded documents" },
          { id:"hash_value",       label:"Submission Hash (Integrity)",     type:"readonly", placeholder:"Cryptographic hash for integrity verification" },
          { id:"vault_position",   label:"Vault Position",                  type:"readonly", placeholder:"Sealed until opening date" },
          { id:"confirmation_sent",label:"Email Confirmation Sent?",        type:"readonly", placeholder:"Auto-sent to bidder email on file" },
        ],
      },
    ],
  },
];
