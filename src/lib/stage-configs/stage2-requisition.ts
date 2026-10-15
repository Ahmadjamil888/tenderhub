/**
 * Requisition Workbench configs (Stage 2 of the legacy 26-stage sidebar)
 * Maps to the Bid Submission / Clarification / Site Visit / Bid Closing
 * sub-stages from the spec (Stage 2 continuation from Tender Preparation).
 *
 * Sub-stages:
 *  1. Supplier Registration & Onboarding
 *  2. Clarification Period (Q&A)
 *  3. Site Visit
 *  4. Bid Submission
 *  5. Bid Closing
 */
import type { StageConfig } from "@/components/StageFormWorkbench";

export const REQUISITION_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 2,
    stageName: "Stage 2 — Bid Preparation & Submission",
    subStageName: "Supplier Registration & Onboarding",
    majorActivity: "Vendor onboarding — register and verify supplier details",
    aiControl: "AI Due Diligence — automated background screening, sanctions check, tax verification",
    requiredAuthorization: "Vendor Management",
    steps: [
      {
        id: "supplier-profile",
        title: "Supplier Basic Profile",
        fields: [
          { id:"company_name",     label:"Company / Entity Name",           type:"text",     required:true },
          { id:"registration_no",  label:"Company Registration Number",     type:"text",     required:true, hint:"ZIMRA / CRSE registration" },
          { id:"trading_name",     label:"Trading Name (if different)",     type:"text" },
          { id:"company_type",     label:"Company Type",                    type:"select",   required:true, options:["Private Company (Pvt Ltd)","Public Company (Ltd)","Partnership","Sole Trader","NGO / Trust","Joint Venture","Cooperative"] },
          { id:"incorporation_date",label:"Date of Incorporation",          type:"date",     required:true },
          { id:"physical_address", label:"Physical Address",                type:"textarea", required:true },
          { id:"postal_address",   label:"Postal Address",                  type:"textarea" },
          { id:"country",          label:"Country of Registration",         type:"select",   options:["Zimbabwe","South Africa","Botswana","Zambia","Mozambique","Other"] },
        ],
      },
      {
        id: "contact-details",
        title: "Contact & Banking Details",
        fields: [
          { id:"primary_contact",  label:"Primary Contact Person",          type:"text",     required:true },
          { id:"contact_email",    label:"Contact Email",                   type:"email",    required:true },
          { id:"contact_phone",    label:"Contact Phone",                   type:"text",     required:true },
          { id:"website",          label:"Website (if any)",                type:"text" },
          { id:"bank_name",        label:"Bank Name",                       type:"text",     required:true },
          { id:"branch_name",      label:"Branch Name",                     type:"text",     required:true },
          { id:"account_number",   label:"Account Number",                  type:"text",     required:true, hint:"AI will verify against ZIMRA records" },
          { id:"account_type",     label:"Account Type",                    type:"select",   options:["Current / Cheque","Savings","Foreign Currency"] },
        ],
      },
      {
        id: "compliance-docs",
        title: "Compliance Documents",
        fields: [
          { id:"tax_clearance_ref",label:"Tax Clearance Certificate Number",type:"text",     required:true },
          { id:"tax_expiry",       label:"Tax Clearance Expiry Date",       type:"date",     required:true },
          { id:"praz_reg_no",      label:"PRAZ Registration Number",        type:"text",     required:true },
          { id:"praz_class",       label:"PRAZ Registration Class",         type:"select",   options:["Class A — Works","Class B — Supplies","Class C — Services","Class D — Consultancy","Class E — ICT"] },
          { id:"bee_certificate",  label:"BEE / Indigenisation Certificate",type:"text" },
          { id:"insurance_policy", label:"Insurance Policy Reference",      type:"text" },
          { id:"ai_due_diligence", label:"AI Due Diligence Status",         type:"readonly", placeholder:"AI running background checks, sanctions & tax verification..." },
          { id:"blacklist_status", label:"Blacklist Check Result",          type:"readonly", placeholder:"AI checking PRAZ blacklist..." },
        ],
      },
      {
        id: "categories",
        title: "Procurement Categories & Capabilities",
        fields: [
          { id:"supply_categories",label:"Supply Categories",               type:"textarea", required:true, fullWidth:true, placeholder:"List all goods/services/works categories this supplier can provide" },
          { id:"annual_turnover",  label:"Annual Turnover (USD)",           type:"currency", required:true },
          { id:"employee_count",   label:"Number of Employees",             type:"number" },
          { id:"sme_status",       label:"SME / Woman-Owned / Youth-Owned?",type:"select",  options:["Standard Enterprise","SME","Woman-Owned Business","Youth Enterprise","Disability-Owned","Community Organisation"] },
          { id:"iso_certified",    label:"ISO Certified?",                  type:"radio",    options:["Yes","No"] },
          { id:"iso_details",      label:"ISO Certificate Details",         type:"text",     placeholder:"e.g. ISO 9001:2015 — Exp 2026-12-31" },
          { id:"declaration_vendor",label:"Vendor Declaration",             type:"checkbox", placeholder:"I confirm all information provided is accurate and complete", required:true },
          { id:"vendor_sign_date", label:"Declaration Date",                type:"date",     required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 2,
    stageName: "Stage 2 — Bid Preparation & Submission",
    subStageName: "Clarification Period",
    majorActivity: "Questions and answers — suppliers submit queries, procuring entity responds",
    aiControl: "Audit Trail — all Q&A automatically logged with timestamps for transparency",
    requiredAuthorization: "Procurement Officer",
    steps: [
      {
        id: "query-submission",
        title: "Query Registration",
        fields: [
          { id:"query_ref",        label:"Query Reference",                 type:"readonly", placeholder:"Auto-generated: QRY-2026-XXXX" },
          { id:"tender_ref_query", label:"Tender Reference",                type:"text",     required:true },
          { id:"submitting_company",label:"Submitting Company",             type:"text",     required:true },
          { id:"query_date",       label:"Query Submission Date",           type:"date",     required:true },
          { id:"query_type",       label:"Query Type",                      type:"select",   options:["Technical Specification","Commercial / Financial","Eligibility","Submission Format","Site Visit","General Clarification"] },
          { id:"query_description",label:"Query Description",               type:"textarea", required:true, fullWidth:true, placeholder:"Detailed description of the clarification being sought" },
          { id:"reference_clause", label:"Reference Clause / Section",      type:"text",     placeholder:"e.g. Section 4.2, BOQ Item 3, ITB Clause 12" },
          { id:"urgency_query",    label:"Urgency",                         type:"radio",    options:["Standard","Urgent — Impacts Bid Preparation"] },
        ],
      },
      {
        id: "official-response",
        title: "Official Response",
        fields: [
          { id:"response_date",    label:"Response Date",                   type:"date",     required:true },
          { id:"response_officer", label:"Responding Officer",              type:"text",     required:true },
          { id:"official_response",label:"Official Response",               type:"textarea", required:true, fullWidth:true, placeholder:"Provide clear, unambiguous official answer to the query" },
          { id:"doc_amendment",    label:"Requires Tender Document Amendment?", type:"radio",options:["Yes — Issue Addendum","No"] },
          { id:"addendum_ref",     label:"Addendum Reference (if issued)",  type:"text",     placeholder:"e.g. ADD-2026-001" },
          { id:"extension_required",label:"Bid Deadline Extension Required?",type:"radio",  options:["Yes","No"] },
          { id:"new_deadline",     label:"New Submission Deadline (if extended)", type:"date" },
          { id:"published_to_all", label:"Response Published to ALL Bidders?", type:"radio",options:["Yes — Via Portal","Pending"] },
        ],
      },
    ],
  },

  {
    stageNumber: 2,
    stageName: "Stage 2 — Bid Preparation & Submission",
    subStageName: "Site Visit",
    majorActivity: "Mandatory / optional site visit — attendance recording",
    aiControl: "GPS Verification — AI verifies site visit location against procurement GIS data",
    requiredAuthorization: "Technical Team",
    steps: [
      {
        id: "site-visit-details",
        title: "Site Visit Details",
        fields: [
          { id:"site_visit_ref",   label:"Site Visit Reference",            type:"readonly", placeholder:"Auto-generated: SVR-2026-XXXX" },
          { id:"tender_ref_sv",    label:"Tender Reference",                type:"text",     required:true },
          { id:"visit_date",       label:"Site Visit Date",                 type:"date",     required:true },
          { id:"visit_time",       label:"Site Visit Time",                 type:"text",     required:true, placeholder:"e.g. 09:00 AM" },
          { id:"site_location",    label:"Site Location / Address",         type:"textarea", required:true },
          { id:"gps_coords_sv",    label:"GPS Coordinates",                 type:"text",     placeholder:"AI will validate location" },
          { id:"mandatory",        label:"Site Visit Mandatory?",           type:"radio",    options:["Mandatory — No Bid Without Attendance","Optional"] },
          { id:"contact_on_site",  label:"Government Contact on Site",      type:"text",     required:true },
        ],
      },
      {
        id: "attendance-register",
        title: "Attendance Register",
        fields: [
          { id:"companies_attended",label:"Companies in Attendance",        type:"textarea", required:true, fullWidth:true, placeholder:"List all companies and their representatives who attended" },
          { id:"total_attendees",  label:"Total Companies Attended",        type:"number",   required:true },
          { id:"tech_team_lead",   label:"Technical Team Lead",             type:"text",     required:true },
          { id:"minutes_prepared", label:"Site Visit Minutes Prepared?",    type:"radio",    options:["Yes","Pending"] },
          { id:"issues_raised",    label:"Issues / Observations Raised",    type:"textarea" },
          { id:"ai_gps_sv",        label:"AI GPS Verification Result",      type:"readonly", placeholder:"Verifying location coordinates..." },
          { id:"sv_declaration",   label:"Site Visit Declaration",          type:"checkbox", placeholder:"I confirm the site visit was conducted as scheduled", required:true },
          { id:"sv_report_ref",    label:"Site Visit Report Reference",     type:"text" },
        ],
      },
    ],
  },

  {
    stageNumber: 2,
    stageName: "Stage 2 — Bid Preparation & Submission",
    subStageName: "Bid Submission",
    majorActivity: "Secure encrypted bid upload by suppliers",
    aiControl: "Digital Signatures — AI verifies cryptographic signatures on all uploaded bid documents",
    requiredAuthorization: "Supplier",
    steps: [
      {
        id: "bid-details",
        title: "Bid Submission Details",
        fields: [
          { id:"bid_ref",          label:"Bid Reference",                   type:"readonly", placeholder:"Auto-generated: BID-2026-XXXX" },
          { id:"tender_ref_bid",   label:"Tender Reference",                type:"text",     required:true },
          { id:"bidder_company",   label:"Bidding Company",                 type:"text",     required:true },
          { id:"submission_date",  label:"Submission Date & Time",          type:"date",     required:true },
          { id:"bid_validity",     label:"Bid Validity Period (days)",      type:"number",   required:true, placeholder:"Must meet minimum validity in ITB" },
          { id:"bid_value",        label:"Total Bid Price (USD)",           type:"currency", required:true },
          { id:"vat_inclusive",    label:"VAT Inclusive?",                  type:"radio",    options:["Yes","No"] },
          { id:"lot_no",           label:"Lot Number (if multi-lot)",       type:"text",     placeholder:"e.g. Lot 1, Lot 2, All Lots" },
        ],
      },
      {
        id: "bid-documents",
        title: "Bid Documents & Security",
        fields: [
          { id:"technical_proposal",label:"Technical Proposal Uploaded?",  type:"radio",    required:true, options:["Yes","No"] },
          { id:"financial_proposal",label:"Financial Proposal Uploaded?",  type:"radio",    required:true, options:["Yes","No"] },
          { id:"bid_security_bank",label:"Bid Security / Bank Guarantee",  type:"text",     placeholder:"Bank guarantee number and issuing bank" },
          { id:"bid_security_value",label:"Bid Security Value (USD)",      type:"currency" },
          { id:"bid_security_expiry",label:"Bid Security Expiry Date",     type:"date" },
          { id:"ai_signature_check",label:"AI Digital Signature Verification",type:"readonly",placeholder:"AI verifying cryptographic signatures..." },
          { id:"encryption_status",label:"Bid Encryption Status",          type:"readonly", placeholder:"Encrypted bid vault sealed until opening date" },
          { id:"submission_declaration",label:"Submission Declaration",    type:"checkbox", placeholder:"I confirm this bid is submitted on behalf of the company and is binding", required:true },
        ],
      },
    ],
  },

  {
    stageNumber: 2,
    stageName: "Stage 2 — Bid Preparation & Submission",
    subStageName: "Bid Closing",
    majorActivity: "Automatic closure of bid submission at deadline",
    aiControl: "Time-Lock Encryption — system automatically seals all bids at exact closing time",
    requiredAuthorization: "System (Automated)",
    steps: [
      {
        id: "closing-details",
        title: "Bid Closing",
        fields: [
          { id:"closing_date_time",label:"Closing Date & Time",             type:"date",     required:true },
          { id:"bids_received_count",label:"Total Bids Received",           type:"number",   required:true },
          { id:"late_submissions", label:"Late Submissions (Auto-Rejected)",type:"number",   placeholder:"System auto-rejects — should be 0" },
          { id:"vault_sealed",     label:"Bid Vault Sealed?",               type:"readonly", placeholder:"Auto-sealed at closing time" },
          { id:"seal_timestamp",   label:"Vault Seal Timestamp",            type:"readonly", placeholder:"System-generated timestamp" },
          { id:"opening_date_set", label:"Bid Opening Date Confirmed",      type:"date",     required:true },
          { id:"committee_notified",label:"Opening Committee Notified?",    type:"radio",    options:["Yes","Pending"] },
          { id:"closing_declaration",label:"System Closure Confirmation",   type:"readonly", placeholder:"Automated closure confirmed by system" },
        ],
      },
    ],
  },
];
