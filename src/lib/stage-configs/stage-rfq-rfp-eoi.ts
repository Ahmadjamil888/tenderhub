/**
 * RFQ, RFP, EOI, Auction sub-stages
 * Note per spec: RFQ and Auctions do NOT have Technical Evaluation.
 */
import type { StageConfig } from "@/components/StageFormWorkbench";

// ─── RFQ Sub-Stages ───────────────────────────────────────────────────────────
export const RFQ_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 6,
    stageName: "Stage 6 — RFQ Management",
    subStageName: "RFQ Preparation & Issue",
    majorActivity: "Prepare and issue Request for Quotation to shortlisted suppliers",
    aiControl: "AI Price Benchmarking — validates quotes against historical and market pricing",
    requiredAuthorization: "Procurement Officer",
    steps: [
      {
        id: "rfq-details",
        title: "RFQ Details",
        fields: [
          { id:"rfq_ref",          label:"RFQ Reference",                   type:"readonly", placeholder:"Auto: RFQ-ZW-2026-XXXXX" },
          { id:"rfq_title",        label:"RFQ Title / Description",         type:"text",     required:true },
          { id:"rfq_date",         label:"RFQ Issue Date",                  type:"date",     required:true },
          { id:"response_deadline",label:"Quote Response Deadline",         type:"date",     required:true },
          { id:"estimated_value2", label:"Estimated Value (USD)",           type:"currency", required:true, hint:"Must be within RFQ threshold" },
          { id:"rfq_threshold",    label:"Applicable Threshold",            type:"select",   options:["Up to USD 10,000 — Supervisor","USD 10,001–100,000 — HOD + Finance"] },
          { id:"suppliers_invited",label:"Suppliers Invited (min 3)",       type:"textarea", required:true, placeholder:"List at least 3 invited suppliers" },
          { id:"ai_price_bench",   label:"AI Price Benchmark",              type:"readonly", placeholder:"AI benchmarking against market rates..." },
        ],
      },
      {
        id: "rfq-evaluation",
        title: "Quote Evaluation (NO Technical Evaluation — Price Only)",
        fields: [
          { id:"quote_1_supplier", label:"Supplier 1 Name",                 type:"text",     required:true },
          { id:"quote_1_price",    label:"Supplier 1 Quote (USD)",          type:"currency", required:true },
          { id:"quote_2_supplier", label:"Supplier 2 Name",                 type:"text",     required:true },
          { id:"quote_2_price",    label:"Supplier 2 Quote (USD)",          type:"currency", required:true },
          { id:"quote_3_supplier", label:"Supplier 3 Name",                 type:"text",     required:true },
          { id:"quote_3_price",    label:"Supplier 3 Quote (USD)",          type:"currency", required:true },
          { id:"lowest_quote",     label:"Lowest Compliant Quote",          type:"readonly", placeholder:"AI identifying lowest quote..." },
          { id:"recommended_rfq",  label:"Recommended Supplier",            type:"text",     required:true },
        ],
      },
      {
        id: "rfq-award",
        title: "RFQ Award",
        fields: [
          { id:"rfq_award_value",  label:"Award Value (USD)",               type:"currency", required:true },
          { id:"rfq_delivery_days",label:"Delivery Period (days)",           type:"number",   required:true },
          { id:"rfq_approver",     label:"Approving Officer",               type:"text",     required:true },
          { id:"rfq_approval_tier",label:"Approval Tier Applied",           type:"readonly", placeholder:"AI confirming correct authority level..." },
          { id:"po_issued",        label:"Purchase Order Issued?",          type:"radio",    options:["Yes","No — Issue Required"] },
          { id:"po_ref_rfq",       label:"PO Reference",                   type:"text" },
          { id:"rfq_declaration",  label:"RFQ Award Declaration",          type:"checkbox", placeholder:"I confirm this RFQ award is compliant and properly authorised", required:true },
          { id:"rfq_award_date",   label:"Award Date",                     type:"date",     required:true },
        ],
      },
    ],
  },
];

// ─── RFP Sub-Stages ───────────────────────────────────────────────────────────
export const RFP_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 7,
    stageName: "Stage 7 — RFP Management",
    subStageName: "RFP Preparation & Evaluation",
    majorActivity: "Issue RFP, evaluate technical and financial proposals",
    aiControl: "AI Quality & Cost Analysis — weighted scoring of quality-based proposals",
    requiredAuthorization: "Evaluation Committee",
    steps: [
      {
        id: "rfp-scope",
        title: "RFP Scope",
        fields: [
          { id:"rfp_ref",          label:"RFP Reference",                   type:"readonly", placeholder:"Auto: RFP-ZW-2026-XXXXX" },
          { id:"rfp_title",        label:"Assignment Title",                type:"text",     required:true },
          { id:"rfp_type",         label:"RFP Type",                        type:"select",   options:["Consulting Services","Technical Studies","Management Consulting","Design Services","ICT Implementation","Legal Advisory","Financial Advisory","Other Professional Services"] },
          { id:"rfp_budget",       label:"Assignment Budget (USD)",         type:"currency", required:true },
          { id:"rfp_duration",     label:"Assignment Duration",             type:"text",     required:true, placeholder:"e.g. 6 months" },
          { id:"tech_weight_rfp",  label:"Technical Proposal Weight (%)",  type:"number",   required:true, placeholder:"e.g. 80" },
          { id:"fin_weight_rfp",   label:"Financial Proposal Weight (%)",  type:"number",   required:true, placeholder:"e.g. 20" },
          { id:"min_tech_rfp",     label:"Minimum Technical Score (%)",    type:"number",   required:true, placeholder:"e.g. 70" },
        ],
      },
      {
        id: "rfp-evaluation",
        title: "Technical & Financial Evaluation",
        fields: [
          { id:"firms_invited",    label:"Firms Shortlisted",               type:"textarea", required:true },
          { id:"proposals_received",label:"Proposals Received",             type:"number",   required:true },
          { id:"tech_score_rfp_1", label:"Firm 1 Technical Score (%)",     type:"number",   required:true },
          { id:"tech_score_rfp_2", label:"Firm 2 Technical Score (%)",     type:"number" },
          { id:"tech_score_rfp_3", label:"Firm 3 Technical Score (%)",     type:"number" },
          { id:"financial_open",   label:"Financial Envelopes Opened?",    type:"radio",    options:["Yes — After Tech Threshold","No — Pending Tech Results"] },
          { id:"combined_rfp_1",   label:"Firm 1 Combined Score (%)",      type:"number" },
          { id:"recommended_rfp",  label:"Recommended Firm",               type:"text",     required:true },
        ],
      },
      {
        id: "rfp-award",
        title: "RFP Award & Contract",
        fields: [
          { id:"rfp_award_value",  label:"Negotiated Contract Value (USD)", type:"currency", required:true },
          { id:"rfp_approver",     label:"Approving Authority",            type:"text",     required:true },
          { id:"rfp_approval_date",label:"Approval Date",                  type:"date",     required:true },
          { id:"contract_type_rfp",label:"Contract Type",                  type:"select",   options:["Lump Sum","Time-Based","Retainer","Output-Based","Success Fee"] },
          { id:"ai_rfp_analysis",  label:"AI Quality Score Analysis",      type:"readonly", placeholder:"AI validating scoring consistency..." },
          { id:"rfp_declaration",  label:"Committee Declaration",          type:"checkbox", placeholder:"We confirm the RFP evaluation was conducted fairly and transparently", required:true },
          { id:"po_rfp",           label:"Contract / PO Reference",        type:"text" },
          { id:"commencement_rfp", label:"Assignment Commencement Date",   type:"date",     required:true },
        ],
      },
    ],
  },
];

// ─── EOI Sub-Stages ───────────────────────────────────────────────────────────
export const EOI_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 8,
    stageName: "Stage 8 — EOI Management",
    subStageName: "Expression of Interest — Shortlisting",
    majorActivity: "Invite EOIs, evaluate capability and shortlist firms for RFP or restricted tender",
    aiControl: "AI Capability Screening — auto-scores EOI submissions against shortlisting criteria",
    requiredAuthorization: "Procurement Committee",
    steps: [
      {
        id: "eoi-scope",
        title: "EOI Details",
        fields: [
          { id:"eoi_ref",          label:"EOI Reference",                   type:"readonly", placeholder:"Auto: EOI-ZW-2026-XXXXX" },
          { id:"eoi_title",        label:"EOI Title",                       type:"text",     required:true },
          { id:"eoi_purpose",      label:"Purpose of EOI",                  type:"select",   options:["Shortlisting for RFP","Shortlisting for Restricted Tender","Pre-qualification","Market Testing","Capability Assessment","PPP Partner Identification"] },
          { id:"eoi_deadline",     label:"EOI Submission Deadline",         type:"date",     required:true },
          { id:"shortlist_number", label:"Target Shortlist Size",           type:"number",   required:true, placeholder:"e.g. 5 firms" },
          { id:"eoi_criteria",     label:"Shortlisting Criteria",           type:"textarea", required:true, placeholder:"List criteria e.g. 5 years experience, ISO certified, min turnover USD 2M" },
          { id:"ai_capability",    label:"AI Capability Screening Status",  type:"readonly", placeholder:"AI scoring EOI submissions..." },
          { id:"eoi_submissions",  label:"EOI Submissions Received",        type:"number",   required:true },
        ],
      },
      {
        id: "eoi-shortlist",
        title: "Shortlisting Decision",
        fields: [
          { id:"shortlisted_firms",label:"Shortlisted Firms",               type:"textarea", required:true, fullWidth:true, placeholder:"List shortlisted firms with their scores" },
          { id:"not_shortlisted",  label:"Firms Not Shortlisted (reasons)", type:"textarea", placeholder:"Brief reason for each non-shortlisted firm" },
          { id:"committee_chair6", label:"Committee Chairperson",           type:"text",     required:true },
          { id:"shortlist_date",   label:"Shortlisting Date",               type:"date",     required:true },
          { id:"notification_sent",label:"Shortlist Notifications Sent?",   type:"radio",    options:["Yes","Pending"] },
          { id:"next_stage_eoi",   label:"Next Stage",                      type:"select",   options:["Issue RFP to Shortlisted Firms","Issue Restricted Tender","Hold","Cancel"] },
          { id:"eoi_declaration",  label:"Committee Declaration",           type:"checkbox", placeholder:"We confirm the shortlisting was fair and criteria-based", required:true },
          { id:"eoi_report_ref",   label:"EOI Evaluation Report Reference", type:"text" },
        ],
      },
    ],
  },
];

// ─── Auction Sub-Stages ───────────────────────────────────────────────────────
export const AUCTION_SUB_STAGES: StageConfig[] = [
  {
    stageNumber: 9,
    stageName: "Stage 9 — Auction Management",
    subStageName: "Public Auction — Asset Disposal",
    majorActivity: "Conduct public auction for government asset disposal",
    aiControl: "Auction Management System — AI manages bidding, auto-detects collusion, generates auction register",
    requiredAuthorization: "Accounting Officer",
    steps: [
      {
        id: "auction-setup",
        title: "Auction Setup",
        fields: [
          { id:"auction_ref",      label:"Auction Reference",               type:"readonly", placeholder:"Auto: AUC-ZW-2026-XXXXX" },
          { id:"auction_title",    label:"Auction Title",                   type:"text",     required:true, placeholder:"e.g. Government Fleet Disposal — 48 Vehicles" },
          { id:"auction_type",     label:"Auction Type",                    type:"select",   options:["Open Outcry (Physical)","Online / Electronic","Sealed Bid Auction","Dutch Auction","Reverse Auction"] },
          { id:"auction_date",     label:"Auction Date",                    type:"date",     required:true },
          { id:"auction_venue",    label:"Auction Venue",                   type:"text",     required:true },
          { id:"reserve_price",    label:"Reserve Price (USD)",             type:"currency", hint:"Minimum acceptable price — not disclosed" },
          { id:"registration_fee", label:"Bidder Registration Fee (USD)",  type:"currency" },
          { id:"deposit_required", label:"Refundable Deposit Required (USD)",type:"currency" },
        ],
      },
      {
        id: "auction-lots",
        title: "Auction Lots",
        fields: [
          { id:"lot_1",            label:"Lot 1 Description",               type:"text",     required:true },
          { id:"lot_1_reserve",    label:"Lot 1 Reserve Price (USD)",       type:"currency", required:true },
          { id:"lot_2",            label:"Lot 2 Description",               type:"text" },
          { id:"lot_2_reserve",    label:"Lot 2 Reserve Price (USD)",       type:"currency" },
          { id:"lot_3",            label:"Lot 3 Description",               type:"text" },
          { id:"lot_3_reserve",    label:"Lot 3 Reserve Price (USD)",       type:"currency" },
          { id:"note_no_tech_eval",label:"NOTE",                            type:"readonly", placeholder:"⚠ Auctions do NOT have Technical Evaluation — price only per spec" },
          { id:"ai_auction",       label:"AI Collusion Detection",          type:"readonly", placeholder:"AI monitoring for bid rigging patterns..." },
        ],
      },
      {
        id: "auction-results",
        title: "Auction Results",
        fields: [
          { id:"bidders_registered",label:"Total Registered Bidders",       type:"number",   required:true },
          { id:"lots_sold",        label:"Lots Successfully Sold",          type:"number",   required:true },
          { id:"lots_unsold",      label:"Lots Unsold (Reserve Not Met)",   type:"number" },
          { id:"total_proceeds",   label:"Total Auction Proceeds (USD)",    type:"currency", required:true },
          { id:"highest_lot",      label:"Highest Single Lot Price (USD)",  type:"currency" },
          { id:"auctioneer",       label:"Auctioneer Name",                 type:"text",     required:true },
          { id:"ao_auction",       label:"Accounting Officer Confirmation", type:"checkbox", placeholder:"I confirm the auction was conducted fairly and proceeds are correct", required:true },
          { id:"auction_date_final",label:"Auction Completion Date",        type:"date",     required:true },
        ],
      },
    ],
  },
];
