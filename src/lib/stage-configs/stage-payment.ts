import type { StageConfig } from "@/components/StageFormWorkbench";

export const PAYMENT_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 18,
    stageName: "Stage 18 — Payment Management",
    subStageName: "Invoice Processing & Verification",
    majorActivity: "Three-way match: Contract — PO — GRN — Invoice",
    aiControl: "Three-Way Matching & Duplicate Detection — AI auto-matches and flags discrepancies",
    requiredAuthorization: "Finance Manager",
    steps: [
      {
        id: "invoice-header",
        title: "Invoice Header",
        fields: [
          { id:"invoice_no",       label:"Supplier Invoice Number",         type:"text",     required:true },
          { id:"invoice_date2",    label:"Invoice Date",                    type:"date",     required:true },
          { id:"supplier_name",    label:"Supplier Name",                   type:"text",     required:true },
          { id:"po_ref2",          label:"Purchase Order Reference",        type:"text",     required:true },
          { id:"contract_ref2",    label:"Contract Reference",              type:"text",     required:true },
          { id:"grn_ref",          label:"GRN / Acceptance Certificate Ref",type:"text",     required:true },
          { id:"invoice_amount",   label:"Invoice Amount (USD)",            type:"currency", required:true },
          { id:"vat_amount2",      label:"VAT Amount (USD)",                type:"currency" },
        ],
      },
      {
        id: "three-way",
        title: "Three-Way Match",
        fields: [
          { id:"total_invoice",    label:"Total Payable (USD)",             type:"readonly", placeholder:"Invoice + VAT auto-calculated" },
          { id:"po_match2",        label:"Matches PO Amount?",              type:"radio",    required:true, options:["Yes","No — Discrepancy"] },
          { id:"grn_match2",       label:"Matches GRN Quantity?",           type:"radio",    required:true, options:["Yes","No — Shortfall"] },
          { id:"contract_match2",  label:"Within Contract Terms?",          type:"radio",    required:true, options:["Yes","No — Over Contract"] },
          { id:"duplicate_check3", label:"AI Duplicate Payment Check",      type:"readonly", placeholder:"AI checking for prior payments on this invoice..." },
          { id:"ai_three_way2",    label:"AI Three-Way Match Result",       type:"readonly", placeholder:"Auto-matching in progress..." },
          { id:"finance_manager",  label:"Finance Manager Name",            type:"text",     required:true },
          { id:"match_declaration",label:"Finance Declaration",             type:"checkbox", placeholder:"I confirm the three-way match is complete and correct", required:true },
        ],
      },
    ],
  },
  {
    stageNumber: 18,
    stageName: "Stage 18 — Payment Management",
    subStageName: "Payment Approval & Treasury Release",
    majorActivity: "Electronic approval chain then EFT processing via treasury",
    aiControl: "Delegation Limits & Bank Integration — AI verifies approver authority and bank account details",
    requiredAuthorization: "CFO / Treasury",
    steps: [
      {
        id: "payment-approval",
        title: "Payment Approval",
        fields: [
          { id:"payment_ref",      label:"Payment Voucher Reference",       type:"readonly", placeholder:"Auto: PV-2026-XXXXX" },
          { id:"payment_amount",   label:"Payment Amount (USD)",            type:"currency", required:true },
          { id:"payment_type",     label:"Payment Type",                    type:"select",   options:["Full Payment","Partial / Milestone","Advance Payment","Retention Release","Final Payment"] },
          { id:"cfo_name",         label:"CFO Name",                        type:"text",     required:true },
          { id:"cfo_decision",     label:"CFO Decision",                    type:"select",   options:["Approved for Payment","Hold — Query","Rejected — Return Invoice"] },
          { id:"delegation_ref",   label:"Delegation of Authority Reference",type:"text",   required:true },
          { id:"ai_doa_check",     label:"AI DoA Verification",             type:"readonly", placeholder:"AI verifying CFO authority for this payment amount..." },
          { id:"cfo_declaration",  label:"CFO Declaration",                 type:"checkbox", placeholder:"I confirm this payment is authorised within my delegation", required:true },
        ],
      },
      {
        id: "treasury-payment",
        title: "Treasury EFT Payment",
        fields: [
          { id:"treasury_ref",     label:"Treasury Payment Reference",      type:"readonly", placeholder:"Auto: TRY-2026-XXXXX" },
          { id:"bank_name2",       label:"Beneficiary Bank",                type:"text",     required:true },
          { id:"account_no2",      label:"Beneficiary Account Number",      type:"text",     required:true, hint:"AI verifies against registered vendor bank details" },
          { id:"branch_code",      label:"Branch / Swift Code",             type:"text",     required:true },
          { id:"eft_date",         label:"EFT Processing Date",             type:"date",     required:true },
          { id:"payment_advice",   label:"Payment Advice Sent to Supplier?",type:"radio",   options:["Yes","Pending — Auto-send on processing"] },
          { id:"ai_bank_verify",   label:"AI Bank Account Verification",    type:"readonly", placeholder:"AI cross-checking bank account against vendor register..." },
          { id:"treasury_declaration",label:"Treasury Declaration",         type:"checkbox", placeholder:"I confirm this EFT has been processed and is final", required:true },
        ],
      },
    ],
  },
];
