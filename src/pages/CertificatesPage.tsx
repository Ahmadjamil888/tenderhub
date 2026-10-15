import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { useAuth } from "@/lib/auth-context";
import { pushNotification } from "@/lib/local-store";
import {
  Award, FileCheck, ShieldCheck, Search, Download, Plus, Eye,
  CheckCircle2, Clock, AlertTriangle, FileText, Stamp, Filter,
  ScrollText, Star, Send, RefreshCw, Building2, Gavel, DollarSign,
  Activity, BarChart3, Users, Sparkles, ChevronRight, Archive, Bell,
} from "lucide-react";

// ─── Certificate Catalogue ────────────────────────────────────────────────────
type CertStage =
  | "Vendor Registration"
  | "Procurement Opportunity"
  | "Bid Submission"
  | "Bid Opening & Compliance"
  | "Evaluation"
  | "Award & Contracting"
  | "Contract Administration"
  | "Payment & Finance"
  | "Performance & Close-Out"
  | "Governance & Audit";

type CertType = "Certificate" | "Notice" | "Acknowledgement" | "Report" | "Scorecard";

interface CertDef {
  id: string;
  number: number;
  name: string;
  stage: CertStage;
  type: CertType;
  desc: string;
  applicableTo: string[];
  autoGenerate: boolean;
}

const ALL_CERTS: CertDef[] = [
  // ── Vendor Registration ──────────────────────────────────────────────────
  { id:"CERT-001", number:1, name:"Vendor Registration Certificate", stage:"Vendor Registration", type:"Certificate",
    desc:"Issued upon successful registration and approval of a supplier, service provider, or contractor.",
    applicableTo:["Open","Restricted","RFQ","RFP","EOI","Framework"], autoGenerate:true },
  { id:"CERT-002", number:2, name:"Vendor Profile Verification Certificate", stage:"Vendor Registration", type:"Certificate",
    desc:"Confirms that the vendor's legal, financial, tax, licensing, and compliance documentation has been verified.",
    applicableTo:["All"], autoGenerate:true },
  { id:"CERT-003", number:3, name:"Vendor Compliance Clearance Certificate", stage:"Vendor Registration", type:"Certificate",
    desc:"Certifies that the vendor has met all mandatory eligibility, regulatory, and procurement compliance requirements.",
    applicableTo:["All"], autoGenerate:true },
  { id:"CERT-004", number:4, name:"Vendor Category Accreditation Certificate", stage:"Vendor Registration", type:"Certificate",
    desc:"Confirms the approved categories, goods, services, or works for which the vendor is eligible to participate.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-005", number:5, name:"Vendor Prequalification Certificate", stage:"Vendor Registration", type:"Certificate",
    desc:"Issued to vendors that successfully pass a prequalification exercise and are eligible for future opportunities.",
    applicableTo:["Prequalification","Open","Restricted"], autoGenerate:true },
  { id:"CERT-006", number:6, name:"Vendor Due Diligence Assessment Certificate", stage:"Vendor Registration", type:"Certificate",
    desc:"Confirms completion of integrity, risk, financial capability, and background assessments.",
    applicableTo:["All"], autoGenerate:false },
  // ── Procurement Opportunity ──────────────────────────────────────────────
  { id:"CERT-007", number:7, name:"Procurement Opportunity Publication Notice", stage:"Procurement Opportunity", type:"Notice",
    desc:"Confirms official publication of a tender, RFQ, RFP, EOI, auction, or other solicitation.",
    applicableTo:["Open","Restricted","RFQ","RFP","EOI","Auction","Emergency"], autoGenerate:true },
  { id:"CERT-008", number:8, name:"Procurement Advertisement Certificate", stage:"Procurement Opportunity", type:"Certificate",
    desc:"Evidence that the opportunity was publicly advertised in accordance with procurement regulations.",
    applicableTo:["Open","Framework","EOI"], autoGenerate:true },
  { id:"CERT-009", number:9, name:"Bid Document Access Acknowledgement", stage:"Procurement Opportunity", type:"Acknowledgement",
    desc:"Confirms that a vendor has successfully downloaded or accessed solicitation documents.",
    applicableTo:["All"], autoGenerate:true },
  { id:"CERT-010", number:10, name:"Clarification Request Acknowledgement", stage:"Procurement Opportunity", type:"Acknowledgement",
    desc:"Confirms receipt of a vendor's request for clarification on solicitation documents.",
    applicableTo:["All"], autoGenerate:true },
  { id:"CERT-011", number:11, name:"Clarification Response Notice", stage:"Procurement Opportunity", type:"Notice",
    desc:"Records the official response provided to all participating vendors.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-012", number:12, name:"Addendum / Amendment Notice", stage:"Procurement Opportunity", type:"Notice",
    desc:"Issued whenever procurement requirements, specifications, timelines, or conditions are modified.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-013", number:13, name:"Pre-Bid Meeting Attendance Certificate", stage:"Procurement Opportunity", type:"Certificate",
    desc:"Confirms vendor participation in a mandatory or optional pre-bid meeting.",
    applicableTo:["Open","Restricted","RFP"], autoGenerate:true },
  { id:"CERT-014", number:14, name:"Site Visit Attendance Certificate", stage:"Procurement Opportunity", type:"Certificate",
    desc:"Confirms participation in a mandatory site inspection or project briefing session.",
    applicableTo:["Open","Restricted","Works"], autoGenerate:true },
  // ── Bid Submission ───────────────────────────────────────────────────────
  { id:"CERT-015", number:15, name:"Tender Bid Submission Acknowledgement", stage:"Bid Submission", type:"Acknowledgement",
    desc:"Confirms successful submission of a tender bid before the closing date.",
    applicableTo:["Open","Restricted","Emergency"], autoGenerate:true },
  { id:"CERT-016", number:16, name:"RFQ Response Submission Acknowledgement", stage:"Bid Submission", type:"Acknowledgement",
    desc:"Confirms successful submission of a quotation response.",
    applicableTo:["RFQ","Direct","Call-Off"], autoGenerate:true },
  { id:"CERT-017", number:17, name:"RFP Proposal Submission Acknowledgement", stage:"Bid Submission", type:"Acknowledgement",
    desc:"Confirms successful submission of a proposal.",
    applicableTo:["RFP","Framework"], autoGenerate:true },
  { id:"CERT-018", number:18, name:"Expression of Interest Submission Acknowledgement", stage:"Bid Submission", type:"Acknowledgement",
    desc:"Confirms successful submission of an EOI response.",
    applicableTo:["EOI","Prequalification"], autoGenerate:true },
  { id:"CERT-019", number:19, name:"Auction Participation Confirmation", stage:"Bid Submission", type:"Acknowledgement",
    desc:"Confirms registration and participation in an electronic procurement auction.",
    applicableTo:["Auction","Reverse Auction"], autoGenerate:true },
  { id:"CERT-020", number:20, name:"Bid Receipt Certificate", stage:"Bid Submission", type:"Certificate",
    desc:"Provides a secure timestamped record confirming receipt of a bid.",
    applicableTo:["All"], autoGenerate:true },
  { id:"CERT-021", number:21, name:"Bid Security Receipt Certificate", stage:"Bid Submission", type:"Certificate",
    desc:"Acknowledges receipt and validation of bid security, bid bond, or guarantee documents.",
    applicableTo:["Open","Restricted","Emergency"], autoGenerate:true },
  { id:"CERT-022", number:22, name:"Bid Withdrawal Acknowledgement", stage:"Bid Submission", type:"Acknowledgement",
    desc:"Confirms a vendor's formal withdrawal from a procurement process.",
    applicableTo:["All"], autoGenerate:true },
  { id:"CERT-023", number:23, name:"Bid Modification Acknowledgement", stage:"Bid Submission", type:"Acknowledgement",
    desc:"Confirms successful submission of amended bid documents before closure.",
    applicableTo:["All"], autoGenerate:true },
  { id:"CERT-024", number:24, name:"Late Submission Notice", stage:"Bid Submission", type:"Notice",
    desc:"Records and communicates rejection or handling of submissions received after the deadline.",
    applicableTo:["All"], autoGenerate:true },
  // ── Bid Opening & Compliance ─────────────────────────────────────────────
  { id:"CERT-025", number:25, name:"Bid Opening Certificate", stage:"Bid Opening & Compliance", type:"Certificate",
    desc:"Records the official opening of submitted bids and participating bidders.",
    applicableTo:["Open","Restricted","RFP","Emergency"], autoGenerate:false },
  { id:"CERT-026", number:26, name:"Bid Opening Attendance Certificate", stage:"Bid Opening & Compliance", type:"Certificate",
    desc:"Confirms attendance by authorized observers or stakeholders during bid opening.",
    applicableTo:["Open","Restricted","RFP"], autoGenerate:true },
  { id:"CERT-027", number:27, name:"Vendor Bid Compliance Vetting Certificate", stage:"Bid Opening & Compliance", type:"Certificate",
    desc:"Certifies completion of preliminary compliance and responsiveness checks.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-028", number:28, name:"Administrative Compliance Assessment Certificate", stage:"Bid Opening & Compliance", type:"Certificate",
    desc:"Documents the outcome of administrative and mandatory compliance reviews.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-029", number:29, name:"Technical Compliance Assessment Certificate", stage:"Bid Opening & Compliance", type:"Certificate",
    desc:"Confirms evaluation of technical specifications and requirements.",
    applicableTo:["Open","Restricted","RFP","Framework"], autoGenerate:false },
  { id:"CERT-030", number:30, name:"Financial Compliance Assessment Certificate", stage:"Bid Opening & Compliance", type:"Certificate",
    desc:"Confirms review of pricing schedules, financial proposals, and commercial requirements.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-031", number:31, name:"Responsiveness Determination Certificate", stage:"Bid Opening & Compliance", type:"Certificate",
    desc:"Declares whether a submission is responsive or non-responsive.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-032", number:32, name:"Disqualification Notice", stage:"Bid Opening & Compliance", type:"Notice",
    desc:"Provides reasons for non-compliance, disqualification, or rejection of a submission.",
    applicableTo:["All"], autoGenerate:false },
  // ── Evaluation ───────────────────────────────────────────────────────────
  { id:"CERT-033", number:33, name:"Tender Bid Evaluation Certificate", stage:"Evaluation", type:"Certificate",
    desc:"Certifies completion of the bid evaluation process.",
    applicableTo:["Open","Restricted","RFP","Framework","Emergency"], autoGenerate:false },
  { id:"CERT-034", number:34, name:"Technical Evaluation Report and Certificate", stage:"Evaluation", type:"Report",
    desc:"Documents technical assessment results and recommendations.",
    applicableTo:["Open","Restricted","RFP","Framework"], autoGenerate:false },
  { id:"CERT-035", number:35, name:"Financial Evaluation Report and Certificate", stage:"Evaluation", type:"Report",
    desc:"Documents commercial and financial assessment outcomes.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-036", number:36, name:"Combined Evaluation Scorecard", stage:"Evaluation", type:"Scorecard",
    desc:"Provides detailed technical, financial, and overall scores for each bidder.",
    applicableTo:["Open","Restricted","RFP","Framework"], autoGenerate:false },
  { id:"CERT-037", number:37, name:"Evaluation Justification Certificate", stage:"Evaluation", type:"Certificate",
    desc:"Records the rationale supporting evaluation scores, rankings, and recommendations.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-038", number:38, name:"Evaluation Committee Approval Certificate", stage:"Evaluation", type:"Certificate",
    desc:"Confirms approval of evaluation results by the authorized evaluation committee.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-039", number:39, name:"Value-for-Money Assessment Certificate", stage:"Evaluation", type:"Certificate",
    desc:"Confirms that the recommended award provides optimum value for money.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-040", number:40, name:"Best Evaluated Bidder Certificate", stage:"Evaluation", type:"Certificate",
    desc:"Identifies the highest-ranked compliant bidder.",
    applicableTo:["Open","Restricted","RFP","Emergency"], autoGenerate:false },
  // ── Award & Contracting ──────────────────────────────────────────────────
  { id:"CERT-041", number:41, name:"Tender Award Recommendation Certificate", stage:"Award & Contracting", type:"Certificate",
    desc:"Documents the recommendation for contract award.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-042", number:42, name:"Tender Award Approval Certificate", stage:"Award & Contracting", type:"Certificate",
    desc:"Confirms approval by the designated approving authority.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-043", number:43, name:"Tender Award Certificate", stage:"Award & Contracting", type:"Certificate",
    desc:"Officially certifies the award of the procurement opportunity.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-044", number:44, name:"Tender Award Notice", stage:"Award & Contracting", type:"Notice",
    desc:"Formal notification issued to the successful bidder.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-045", number:45, name:"Regret Letter / Unsuccessful Bidder Notice", stage:"Award & Contracting", type:"Notice",
    desc:"Notifies unsuccessful participants and may include debriefing information.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-046", number:46, name:"Notice of Intent to Award", stage:"Award & Contracting", type:"Notice",
    desc:"Provides advance notice before contract execution where required by regulations.",
    applicableTo:["Open","Restricted","RFP","Framework"], autoGenerate:false },
  { id:"CERT-047", number:47, name:"Contract Acceptance Acknowledgement", stage:"Award & Contracting", type:"Acknowledgement",
    desc:"Confirms acceptance of the award by the successful vendor.",
    applicableTo:["All"], autoGenerate:true },
  { id:"CERT-048", number:48, name:"Contract Execution Certificate", stage:"Award & Contracting", type:"Certificate",
    desc:"Confirms signing and execution of the contract by all parties.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-049", number:49, name:"Contract Registration Certificate", stage:"Award & Contracting", type:"Certificate",
    desc:"Records the contract within the procurement management system.",
    applicableTo:["All"], autoGenerate:true },
  { id:"CERT-050", number:50, name:"Performance Security Receipt Certificate", stage:"Award & Contracting", type:"Certificate",
    desc:"Acknowledges receipt and verification of required performance guarantees.",
    applicableTo:["Open","Restricted","Works","Framework"], autoGenerate:true },
  // ── Contract Administration ──────────────────────────────────────────────
  { id:"CERT-051", number:51, name:"Purchase Order Issuance Certificate", stage:"Contract Administration", type:"Certificate",
    desc:"Confirms issuance of a purchase order.",
    applicableTo:["RFQ","Direct","Call-Off","Framework"], autoGenerate:true },
  { id:"CERT-052", number:52, name:"Work Commencement Certificate", stage:"Contract Administration", type:"Certificate",
    desc:"Authorizes commencement of services, works, or supply activities.",
    applicableTo:["Works","Services","Framework"], autoGenerate:false },
  { id:"CERT-053", number:53, name:"Delivery Schedule Approval Certificate", stage:"Contract Administration", type:"Certificate",
    desc:"Confirms approved delivery milestones and timelines.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-054", number:54, name:"Goods Delivery Acknowledgement Certificate", stage:"Contract Administration", type:"Acknowledgement",
    desc:"Confirms receipt of goods supplied.",
    applicableTo:["RFQ","Direct","Call-Off","Framework"], autoGenerate:true },
  { id:"CERT-055", number:55, name:"Service Delivery Acknowledgement Certificate", stage:"Contract Administration", type:"Acknowledgement",
    desc:"Confirms satisfactory delivery of services.",
    applicableTo:["Services","RFP","Framework"], autoGenerate:true },
  { id:"CERT-056", number:56, name:"Works Completion Milestone Certificate", stage:"Contract Administration", type:"Certificate",
    desc:"Confirms achievement of specific project milestones.",
    applicableTo:["Works","Infrastructure"], autoGenerate:false },
  { id:"CERT-057", number:57, name:"Inspection and Acceptance Certificate", stage:"Contract Administration", type:"Certificate",
    desc:"Confirms successful inspection and acceptance of deliverables.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-058", number:58, name:"Quality Assurance Compliance Certificate", stage:"Contract Administration", type:"Certificate",
    desc:"Confirms that delivered goods, services, or works meet required quality standards.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-059", number:59, name:"Satisfactory Delivery Acknowledgement", stage:"Contract Administration", type:"Acknowledgement",
    desc:"Confirms satisfactory performance and acceptance of delivered outputs.",
    applicableTo:["All"], autoGenerate:true },
  { id:"CERT-060", number:60, name:"Defect Liability Certificate", stage:"Contract Administration", type:"Certificate",
    desc:"Records commencement or completion of the defect liability period.",
    applicableTo:["Works","Services"], autoGenerate:false },
  { id:"CERT-061", number:61, name:"Contract Variation Approval Certificate", stage:"Contract Administration", type:"Certificate",
    desc:"Documents approved changes to scope, price, duration, or deliverables.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-062", number:62, name:"Contract Extension Approval Certificate", stage:"Contract Administration", type:"Certificate",
    desc:"Confirms approved contract extensions.",
    applicableTo:["All"], autoGenerate:false },
  // ── Payment & Finance ────────────────────────────────────────────────────
  { id:"CERT-063", number:63, name:"Invoice Receipt Acknowledgement", stage:"Payment & Finance", type:"Acknowledgement",
    desc:"Confirms receipt of a vendor invoice.",
    applicableTo:["All"], autoGenerate:true },
  { id:"CERT-064", number:64, name:"Invoice Verification Certificate", stage:"Payment & Finance", type:"Certificate",
    desc:"Confirms verification and approval of invoiced deliverables.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-065", number:65, name:"Payment Authorization Certificate", stage:"Payment & Finance", type:"Certificate",
    desc:"Approves payment processing for a verified invoice.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-066", number:66, name:"Vendor Proof of Payment Certificate", stage:"Payment & Finance", type:"Certificate",
    desc:"Provides evidence that payment has been successfully processed and remitted.",
    applicableTo:["All"], autoGenerate:true },
  { id:"CERT-067", number:67, name:"Payment Reconciliation Certificate", stage:"Payment & Finance", type:"Certificate",
    desc:"Confirms reconciliation between procurement, finance, and payment records.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-068", number:68, name:"Retention Release Certificate", stage:"Payment & Finance", type:"Certificate",
    desc:"Confirms release of retained contract funds where applicable.",
    applicableTo:["Works","Services","Framework"], autoGenerate:false },
  { id:"CERT-069", number:69, name:"Final Account Settlement Certificate", stage:"Payment & Finance", type:"Certificate",
    desc:"Confirms closure of all financial obligations under the contract.",
    applicableTo:["All"], autoGenerate:false },
  // ── Performance & Close-Out ──────────────────────────────────────────────
  { id:"CERT-070", number:70, name:"Vendor Performance Evaluation Certificate", stage:"Performance & Close-Out", type:"Certificate",
    desc:"Documents vendor performance against agreed KPIs.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-071", number:71, name:"Vendor Performance Grading Certificate", stage:"Performance & Close-Out", type:"Certificate",
    desc:"Issued after every specified number of completed projects, summarising cumulative performance ratings.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-072", number:72, name:"Contract Completion Certificate", stage:"Performance & Close-Out", type:"Certificate",
    desc:"Confirms successful completion of all contractual obligations.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-073", number:73, name:"Tender Certificate of Completion", stage:"Performance & Close-Out", type:"Certificate",
    desc:"Certifies formal closure of the procurement engagement.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-074", number:74, name:"Final Acceptance Certificate", stage:"Performance & Close-Out", type:"Certificate",
    desc:"Confirms final acceptance after all obligations have been fulfilled.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-075", number:75, name:"Contract Close-Out Certificate", stage:"Performance & Close-Out", type:"Certificate",
    desc:"Confirms administrative, technical, legal, and financial closure of the contract.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-076", number:76, name:"Vendor Recognition Certificate", stage:"Performance & Close-Out", type:"Certificate",
    desc:"Issued to vendors demonstrating exceptional performance, quality, compliance, or innovation.",
    applicableTo:["All"], autoGenerate:false },
  // ── Governance & Audit ───────────────────────────────────────────────────
  { id:"CERT-077", number:77, name:"Procurement Audit Trail Certificate", stage:"Governance & Audit", type:"Certificate",
    desc:"Provides a certified record of all procurement activities and transactions.",
    applicableTo:["All"], autoGenerate:true },
  { id:"CERT-078", number:78, name:"Procurement Compliance Certificate", stage:"Governance & Audit", type:"Certificate",
    desc:"Confirms that the procurement process complied with applicable laws, regulations, and policies.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-079", number:79, name:"Conflict of Interest Declaration Certificate", stage:"Governance & Audit", type:"Certificate",
    desc:"Records declarations by evaluators, approvers, and stakeholders.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-080", number:80, name:"Procurement Integrity Certificate", stage:"Governance & Audit", type:"Certificate",
    desc:"Confirms adherence to ethical and anti-corruption requirements.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-081", number:81, name:"Stakeholder Approval Certificate", stage:"Governance & Audit", type:"Certificate",
    desc:"Documents approvals obtained at required governance stages.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-082", number:82, name:"Procurement Closure and Archival Certificate", stage:"Governance & Audit", type:"Certificate",
    desc:"Confirms secure archival of all procurement records.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-083", number:83, name:"Procurement Performance Analytics Report", stage:"Governance & Audit", type:"Report",
    desc:"Provides performance metrics and procurement insights for management.",
    applicableTo:["All"], autoGenerate:true },
  { id:"CERT-084", number:84, name:"Supplier Blacklisting Notice", stage:"Governance & Audit", type:"Notice",
    desc:"Records suspension, debarment, or blacklisting decisions where applicable.",
    applicableTo:["All"], autoGenerate:false },
  { id:"CERT-085", number:85, name:"Supplier Reinstatement Certificate", stage:"Governance & Audit", type:"Certificate",
    desc:"Confirms restoration of eligibility following suspension or corrective action.",
    applicableTo:["All"], autoGenerate:false },
];

// ─── Demo issued records ──────────────────────────────────────────────────────
type IssuedStatus = "Issued" | "Pending" | "Overdue" | "Draft";
interface IssuedRecord {
  id: string; certId: string; certName: string; stage: CertStage;
  issuedTo: string; tenderId: string; issuedDate: string;
  status: IssuedStatus; issuedBy: string;
}

const ISSUED_RECORDS: IssuedRecord[] = [
  { id:"ISS-001", certId:"CERT-001", certName:"Vendor Registration Certificate", stage:"Vendor Registration", issuedTo:"Highveld Engineering (Pvt) Ltd", tenderId:"VEN-00482", issuedDate:"2026-06-01", status:"Issued", issuedBy:"System" },
  { id:"ISS-002", certId:"CERT-007", certName:"Procurement Opportunity Publication Notice", stage:"Procurement Opportunity", issuedTo:"Public", tenderId:"ZW-PRA-2026-00184", issuedDate:"2026-06-10", status:"Issued", issuedBy:"T. Moyo" },
  { id:"ISS-003", certId:"CERT-015", certName:"Tender Bid Submission Acknowledgement", stage:"Bid Submission", issuedTo:"Zimbabwe Pharma Holdings", tenderId:"ZW-PRA-2026-00183", issuedDate:"2026-06-12", status:"Issued", issuedBy:"System" },
  { id:"ISS-004", certId:"CERT-025", certName:"Bid Opening Certificate", stage:"Bid Opening & Compliance", issuedTo:"Evaluation Committee", tenderId:"ZW-PRA-2026-00183", issuedDate:"2026-06-14", status:"Issued", issuedBy:"P. Dube" },
  { id:"ISS-005", certId:"CERT-036", certName:"Combined Evaluation Scorecard", stage:"Evaluation", issuedTo:"ARV Framework Evaluation Committee", tenderId:"ZW-PRA-2026-00183", issuedDate:"2026-06-20", status:"Draft", issuedBy:"P. Dube" },
  { id:"ISS-006", certId:"CERT-044", certName:"Tender Award Notice", stage:"Award & Contracting", issuedTo:"Mashonaland Agri Supplies", tenderId:"ZW-PRA-2026-00180", issuedDate:"2026-06-15", status:"Issued", issuedBy:"T. Moyo" },
  { id:"ISS-007", certId:"CERT-045", certName:"Regret Letter / Unsuccessful Bidder Notice", stage:"Award & Contracting", issuedTo:"Bulawayo Civil Works", tenderId:"ZW-PRA-2026-00180", issuedDate:"2026-06-15", status:"Issued", issuedBy:"System" },
  { id:"ISS-008", certId:"CERT-057", certName:"Inspection and Acceptance Certificate", stage:"Contract Administration", issuedTo:"Highveld Engineering", tenderId:"CN-2026-0411", issuedDate:"2026-06-18", status:"Pending", issuedBy:"J. Banda" },
  { id:"ISS-009", certId:"CERT-066", certName:"Vendor Proof of Payment Certificate", stage:"Payment & Finance", issuedTo:"Zimbabwe Pharma Holdings", tenderId:"INV-2026-4821", issuedDate:"2026-06-21", status:"Issued", issuedBy:"System" },
  { id:"ISS-010", certId:"CERT-070", certName:"Vendor Performance Evaluation Certificate", stage:"Performance & Close-Out", issuedTo:"Mashonaland Agri Supplies", tenderId:"CN-2026-0399", issuedDate:"2026-06-19", status:"Issued", issuedBy:"R. Chikwanda" },
  { id:"ISS-011", certId:"CERT-078", certName:"Procurement Compliance Certificate", stage:"Governance & Audit", issuedTo:"Ministry of Energy", tenderId:"ZW-PRA-2026-00184", issuedDate:"2026-06-22", status:"Pending", issuedBy:"S. Nkosi" },
  { id:"ISS-012", certId:"CERT-084", certName:"Supplier Blacklisting Notice", stage:"Governance & Audit", issuedTo:"Granite Construction Group", tenderId:"VEN-00476", issuedDate:"2026-06-20", status:"Issued", issuedBy:"CPO Office" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STAGES: CertStage[] = [
  "Vendor Registration", "Procurement Opportunity", "Bid Submission",
  "Bid Opening & Compliance", "Evaluation", "Award & Contracting",
  "Contract Administration", "Payment & Finance", "Performance & Close-Out", "Governance & Audit",
];

const STAGE_COLORS: Record<CertStage, string> = {
  "Vendor Registration":      "bg-slate-100 text-[#0F172A]",
  "Procurement Opportunity":  "bg-slate-100 text-[#0F172A]",
  "Bid Submission":           "bg-slate-100 text-[#0F172A]",
  "Bid Opening & Compliance": "bg-slate-100 text-[#0F172A]",
  "Evaluation":               "bg-slate-100 text-[#0F172A]",
  "Award & Contracting":      "bg-slate-100 text-[#0F172A]",
  "Contract Administration":  "bg-slate-100 text-slate-500",
  "Payment & Finance":        "bg-slate-100 text-[#0F172A]",
  "Performance & Close-Out":  "bg-slate-100 text-[#0F172A]",
  "Governance & Audit":       "bg-red-100 text-red-700",
};

const TYPE_TONE: Record<CertType, "blue"|"green"|"amber"|"violet"|"red"> = {
  Certificate: "blue", Notice: "amber", Acknowledgement: "green",
  Report: "violet", Scorecard: "red",
};

const STATUS_TONE: Record<IssuedStatus, "green"|"amber"|"red"|"muted"> = {
  Issued: "green", Pending: "amber", Overdue: "red", Draft: "muted",
};

function stageIcon(stage: CertStage) {
  switch (stage) {
    case "Vendor Registration":      return Building2;
    case "Procurement Opportunity":  return FileText;
    case "Bid Submission":           return Send;
    case "Bid Opening & Compliance": return Gavel;
    case "Evaluation":               return BarChart3;
    case "Award & Contracting":      return Award;
    case "Contract Administration":  return FileCheck;
    case "Payment & Finance":        return DollarSign;
    case "Performance & Close-Out":  return Star;
    case "Governance & Audit":       return ShieldCheck;
    default:                         return ScrollText;
  }
}

// ─── Catalogue Tab ────────────────────────────────────────────────────────────
function CataloguTab({ onAction }: { onAction: (m: string) => void }) {
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState<CertStage | "All">("All");
  const [filterType, setFilterType] = useState<CertType | "All">("All");
  const [filterAuto, setFilterAuto] = useState<"All" | "Auto" | "Manual">("All");
  const [expandedStage, setExpandedStage] = useState<CertStage | null>(null);

  const filtered = ALL_CERTS.filter(c =>
    (filterStage === "All" || c.stage === filterStage) &&
    (filterType === "All" || c.type === filterType) &&
    (filterAuto === "All" || (filterAuto === "Auto" ? c.autoGenerate : !c.autoGenerate)) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()))
  );

  const byStage = STAGES.map(s => ({
    stage: s,
    items: filtered.filter(c => c.stage === s),
    total: ALL_CERTS.filter(c => c.stage === s).length,
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search certificates & notices…"
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none" />
        </div>
        <select value={filterStage} onChange={e => setFilterStage(e.target.value as CertStage | "All")}
          className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm">
          <option value="All">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value as CertType | "All")}
          className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm">
          <option value="All">All Types</option>
          {(["Certificate","Notice","Acknowledgement","Report","Scorecard"] as CertType[]).map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filterAuto} onChange={e => setFilterAuto(e.target.value as "All"|"Auto"|"Manual")}
          className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm">
          <option value="All">All Generation</option>
          <option value="Auto">Auto-Generated</option>
          <option value="Manual">Manual Issue</option>
        </select>
      </div>

      <div className="text-xs text-black/40 font-medium">{filtered.length} of {ALL_CERTS.length} certificates & notices</div>

      {byStage.map(({ stage, items }) => {
        const StageIcon = stageIcon(stage);
        const isExpanded = expandedStage === stage || filterStage !== "All" || search.length > 0;
        return (
          <Card key={stage}>
            <div className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-[#EAF1F8]/50 transition-colors rounded-t-2xl border-b border-black/5"
              onClick={() => setExpandedStage(isExpanded && expandedStage === stage ? null : stage)}>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg grid place-items-center flex-shrink-0 ${STAGE_COLORS[stage]}`}>
                  <StageIcon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-black">{stage}</div>
                  <div className="text-[11px] text-black/40 mt-0.5">{items.length} certificate{items.length !== 1 ? "s" : ""} shown · {ALL_CERTS.filter(c => c.stage === stage).length} total</div>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 text-black/30 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            </div>
            {isExpanded && (
              <div className="divide-y divide-black/5">
                {items.map(cert => (
                  <div key={cert.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-[#EAF1F8]/40 transition-colors">
                    <div className="h-7 w-7 rounded-lg bg-[#EAF1F8] border border-black/8 grid place-items-center flex-shrink-0 mt-0.5">
                      <span className="text-[9px] font-bold text-black/40">#{cert.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs font-semibold text-black">{cert.name}</span>
                        <Badge tone={TYPE_TONE[cert.type]}>{cert.type}</Badge>
                        {cert.autoGenerate && (
                          <span className="text-[9px] font-semibold bg-slate-50 text-[#0F172A] px-1.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-0.5">
                            <Sparkles className="h-2.5 w-2.5" /> Auto
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-black/50 leading-relaxed">{cert.desc}</div>
                      <div className="text-[10px] text-black/30 mt-1">Applies to: {cert.applicableTo.join(", ")}</div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0 mt-0.5">
                      <button onClick={() => onAction(`Issuing: ${cert.name}`)}
                        className="h-7 px-2.5 rounded-lg bg-black text-white text-[10px] font-medium hover:bg-gray-800 flex items-center gap-1">
                        <Stamp className="h-3 w-3" /> Issue
                      </button>
                      <button onClick={() => onAction(`Viewing template: ${cert.name}`)}
                        className="h-7 px-2 rounded-lg border border-black/10 text-[10px] hover:bg-[#EAF1F8] flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Issued Records Tab ───────────────────────────────────────────────────────
function IssuedTab({ onAction }: { onAction: (m: string) => void }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<IssuedStatus | "All">("All");
  const [filterStage, setFilterStage] = useState<CertStage | "All">("All");

  const filtered = ISSUED_RECORDS.filter(r =>
    (filterStatus === "All" || r.status === filterStatus) &&
    (filterStage === "All" || r.stage === filterStage) &&
    (r.certName.toLowerCase().includes(search.toLowerCase()) ||
     r.issuedTo.toLowerCase().includes(search.toLowerCase()) ||
     r.tenderId.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search issued records…"
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-black/10 bg-white text-sm focus:outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as IssuedStatus | "All")}
          className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm">
          <option value="All">All Statuses</option>
          {(["Issued","Pending","Overdue","Draft"] as IssuedStatus[]).map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filterStage} onChange={e => setFilterStage(e.target.value as CertStage | "All")}
          className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm">
          <option value="All">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => onAction("Issue new certificate")}
          className="h-9 px-4 rounded-xl bg-black text-white text-sm font-medium flex items-center gap-1.5 hover:bg-gray-800 ml-auto">
          <Plus className="h-4 w-4" /> Issue New
        </button>
      </div>

      <Card>
        <CardHeader title={`Issued Records — ${filtered.length} items`} action={
          <button onClick={() => onAction("Records exported")} className="h-7 px-3 rounded-lg border border-black/10 text-xs hover:bg-[#EAF1F8] flex items-center gap-1"><Download className="h-3 w-3" /> Export</button>
        } />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EAF1F8] text-xs text-black/40">
              <tr>{["#","Certificate / Notice","Stage","Issued To","Ref / ID","Date","Issued By","Status","Actions"].map(h => (
                <th key={h} className="text-left font-medium px-4 py-2.5 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map(r => {
                const StageIcon = stageIcon(r.stage);
                return (
                  <tr key={r.id} className="hover:bg-[#EAF1F8]/50">
                    <td className="px-4 py-3 font-mono text-[10px] text-black/30">{r.id}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-black max-w-[220px]">
                      <div className="truncate">{r.certName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1 w-fit ${STAGE_COLORS[r.stage]}`}>
                        <StageIcon className="h-2.5 w-2.5" />
                        <span className="truncate max-w-[100px]">{r.stage}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-black/60 max-w-[160px] truncate">{r.issuedTo}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-black/40">{r.tenderId}</td>
                    <td className="px-4 py-3 text-xs text-black/60 whitespace-nowrap">{r.issuedDate}</td>
                    <td className="px-4 py-3 text-xs text-black/60">{r.issuedBy}</td>
                    <td className="px-4 py-3"><Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => onAction(`Viewing: ${r.id}`)} className="h-7 px-2.5 rounded-lg bg-black text-white text-[10px] hover:bg-gray-800 flex items-center gap-1"><Eye className="h-3 w-3" /> View</button>
                        <button onClick={() => onAction(`Downloading: ${r.id}`)} className="h-7 px-2 rounded-lg border border-black/10 text-[10px] hover:bg-[#EAF1F8] flex items-center gap-1"><Download className="h-3 w-3" /></button>
                        {r.status === "Pending" && (
                          <button onClick={() => onAction(`Issued: ${r.id}`)} className="h-7 px-2 rounded-lg bg-[#0F172A] text-white text-[10px] hover:bg-[#0F172A] flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ onAction }: { onAction: (m: string) => void }) {
  const byStageData = STAGES.map(s => ({
    name: s.split(" ")[0],
    fullName: s,
    total: ALL_CERTS.filter(c => c.stage === s).length,
    issued: ISSUED_RECORDS.filter(r => r.stage === s && r.status === "Issued").length,
    pending: ISSUED_RECORDS.filter(r => r.stage === s && r.status === "Pending").length,
  }));

  const typeData = (["Certificate","Notice","Acknowledgement","Report","Scorecard"] as CertType[]).map(t => ({
    name: t,
    count: ALL_CERTS.filter(c => c.type === t).length,
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Certificate Types" value="85" delta="Across all stages" icon={ScrollText} color="blue" />
        <KpiCard label="Issued This Month" value={String(ISSUED_RECORDS.filter(r => r.status === "Issued").length)} delta="Auto + Manual" icon={CheckCircle2} color="green" />
        <KpiCard label="Pending Issuance" value={String(ISSUED_RECORDS.filter(r => r.status === "Pending").length)} delta="Require action" icon={Clock} color="amber" positive={false} />
        <KpiCard label="Auto-Generated" value={String(ALL_CERTS.filter(c => c.autoGenerate).length)} delta="System-triggered" icon={Sparkles} color="violet" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Certificates by Stage" subtitle="Total defined vs issued this period" />
          <div className="divide-y divide-black/5">
            {byStageData.map(s => {
              const StageIcon = stageIcon(s.fullName as CertStage);
              return (
                <div key={s.name} className="px-5 py-3 flex items-center gap-3">
                  <div className={`h-6 w-6 rounded-md grid place-items-center flex-shrink-0 ${STAGE_COLORS[s.fullName as CertStage]}`}>
                    <StageIcon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-black truncate">{s.fullName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-black/8 rounded-full h-1.5">
                        <div className="bg-black h-1.5 rounded-full" style={{ width: `${Math.min((s.issued / Math.max(s.total, 1)) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold text-black">{s.total}</div>
                    <div className="text-[9px] text-black/40">types</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold text-[#0F172A]">{s.issued}</div>
                    <div className="text-[9px] text-black/40">issued</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Certificate Type Distribution" subtitle="Breakdown by document category" />
          <div className="p-5 space-y-3">
            {typeData.map(t => (
              <div key={t.name} className="flex items-center gap-3">
                <div className="w-24 text-xs font-medium text-black/70 flex-shrink-0">{t.name}</div>
                <div className="flex-1 bg-black/5 rounded-full h-2">
                  <div className="bg-black h-2 rounded-full transition-all" style={{ width: `${(t.count / ALL_CERTS.length) * 100 * 1.3}%` }} />
                </div>
                <div className="text-xs font-bold text-black w-6 text-right">{t.count}</div>
              </div>
            ))}
          </div>
          <div className="px-5 pb-4">
            <div className="bg-[#EAF1F8] rounded-xl p-3">
              <div className="text-[10px] text-black/40 mb-2">Procurement Methods Covered</div>
              <div className="flex flex-wrap gap-1">
                {["Open Tender","Restricted","RFQ","RFP","EOI","Auction","Framework","Direct","Emergency","Call-Off","Purchase Order","Prequalification"].map(m => (
                  <span key={m} className="text-[9px] font-medium bg-white border border-black/10 text-black/60 px-1.5 py-0.5 rounded-md">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Issue Wizard Tab ─────────────────────────────────────────────────────────
function IssueWizardTab({ onAction }: { onAction: (m: string) => void }) {
  const [step, setStep] = useState<1|2|3>(1);
  const [selectedStage, setSelectedStage] = useState<CertStage | "">("");
  const [selectedCert, setSelectedCert] = useState<CertDef | null>(null);
  const [form, setForm] = useState({ issuedTo: "", refId: "", notes: "" });

  const stageOptions = selectedStage
    ? ALL_CERTS.filter(c => c.stage === selectedStage)
    : [];

  function handleIssue() {
    onAction(`Certificate issued: ${selectedCert?.name} → ${form.issuedTo}`);
    setStep(3);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Stepper */}
      <div className="flex items-center gap-0">
        {[{n:1,label:"Select Stage & Type"},{n:2,label:"Fill Details"},{n:3,label:"Issue & Download"}].map((s, i) => (
          <div key={s.n} className="flex items-center flex-1 last:flex-none">
            <div className={`flex items-center gap-2 flex-shrink-0 ${step >= s.n ? "text-black" : "text-black/30"}`}>
              <div className={`h-7 w-7 rounded-full grid place-items-center text-xs font-bold flex-shrink-0 ${step > s.n ? "bg-[#0F172A] text-white" : step === s.n ? "bg-black text-white" : "bg-black/10 text-black/40"}`}>
                {step > s.n ? <CheckCircle2 className="h-4 w-4" /> : s.n}
              </div>
              <span className="text-xs font-medium hidden sm:block">{s.label}</span>
            </div>
            {i < 2 && <div className={`flex-1 h-px mx-2 ${step > s.n ? "bg-slate-400" : "bg-black/10"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader title="Step 1 — Select Stage & Certificate Type" />
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-black mb-2 block">Procurement Stage</label>
              <select value={selectedStage} onChange={e => { setSelectedStage(e.target.value as CertStage); setSelectedCert(null); }}
                className="w-full h-10 px-3 rounded-xl border border-black/10 bg-[#EAF1F8] text-sm">
                <option value="">Select stage…</option>
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {selectedStage && (
              <div>
                <label className="text-xs font-semibold text-black mb-2 block">Certificate / Notice Type</label>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                  {stageOptions.map(cert => (
                    <button key={cert.id} onClick={() => setSelectedCert(cert)}
                      className={`text-left px-4 py-3 rounded-xl border transition-all ${selectedCert?.id === cert.id ? "border-black bg-black/5" : "border-black/8 hover:border-black/20 bg-white"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-black">{cert.name}</span>
                        <Badge tone={TYPE_TONE[cert.type]}>{cert.type}</Badge>
                        {cert.autoGenerate && <span className="text-[9px] font-semibold bg-slate-50 text-[#0F172A] px-1.5 py-0.5 rounded-full">Auto</span>}
                      </div>
                      <div className="text-[11px] text-black/50">{cert.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button disabled={!selectedCert} onClick={() => setStep(2)}
              className="h-10 px-6 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2">
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </Card>
      )}

      {step === 2 && selectedCert && (
        <Card>
          <CardHeader title={`Step 2 — Issue: ${selectedCert.name}`} />
          <div className="p-5 space-y-4">
            <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full ${STAGE_COLORS[selectedCert.stage]}`}>
              {selectedCert.stage}
            </div>
            <div>
              <label className="text-xs font-semibold text-black mb-1.5 block">Issue To (Vendor / Entity / Public)</label>
              <input value={form.issuedTo} onChange={e => setForm(v => ({ ...v, issuedTo: e.target.value }))}
                placeholder="e.g. Highveld Engineering (Pvt) Ltd"
                className="w-full h-10 px-3 rounded-xl border border-black/10 bg-[#EAF1F8] text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-black mb-1.5 block">Reference ID (Tender / Contract / Vendor)</label>
              <input value={form.refId} onChange={e => setForm(v => ({ ...v, refId: e.target.value }))}
                placeholder="e.g. ZW-PRA-2026-00184 or CN-2026-0411"
                className="w-full h-10 px-3 rounded-xl border border-black/10 bg-[#EAF1F8] text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-black mb-1.5 block">Notes / Remarks (optional)</label>
              <textarea value={form.notes} onChange={e => setForm(v => ({ ...v, notes: e.target.value }))}
                rows={3} placeholder="Additional remarks or conditions…"
                className="w-full px-3 py-2 rounded-xl border border-black/10 bg-[#EAF1F8] text-sm resize-none focus:outline-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="h-10 px-5 rounded-xl border border-black/10 text-sm hover:bg-[#EAF1F8]">Back</button>
              <button disabled={!form.issuedTo || !form.refId} onClick={handleIssue}
                className="h-10 px-6 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2">
                <Stamp className="h-4 w-4" /> Issue Certificate
              </button>
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <div className="p-8 flex flex-col items-center text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 grid place-items-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-[#0F172A]" />
            </div>
            <div className="text-lg font-bold text-black mb-1">Certificate Issued Successfully</div>
            <div className="text-sm text-black/50 mb-5">{selectedCert?.name} has been generated and recorded.</div>
            <div className="flex gap-3">
              <button onClick={() => onAction("Certificate PDF downloaded")} className="h-10 px-5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 flex items-center gap-2">
                <Download className="h-4 w-4" /> Download PDF
              </button>
              <button onClick={() => onAction("Certificate emailed")} className="h-10 px-5 rounded-xl border border-black/10 text-sm hover:bg-[#EAF1F8] flex items-center gap-2">
                <Send className="h-4 w-4" /> Send to Vendor
              </button>
              <button onClick={() => { setStep(1); setSelectedStage(""); setSelectedCert(null); setForm({ issuedTo:"",refId:"",notes:"" }); }}
                className="h-10 px-5 rounded-xl border border-black/10 text-sm hover:bg-[#EAF1F8] flex items-center gap-2">
                <RefreshCw className="h-4 w-4" /> Issue Another
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "catalogue", label: "Certificate Catalogue", icon: ScrollText },
  { id: "issued",    label: "Issued Records",         icon: FileCheck },
  { id: "issue",     label: "Issue / Generate",       icon: Stamp },
  { id: "analytics", label: "Analytics",              icon: BarChart3 },
] as const;
type TabId = typeof TABS[number]["id"];

export default function CertificatesPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<TabId>("catalogue");
  const [toast, setToast] = useState<string | null>(null);

  function handleAction(msg: string) {
    pushNotification(msg, "info");
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Certificates & Clearances"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Certificates, Notices & Acknowledgements"
          description="Issue, manage, and track all procurement lifecycle certificates, official notices, acknowledgements, reports, and scorecards across all procurement methods"
          actions={
            <div className="flex gap-2">
              <button onClick={() => handleAction("Bulk export initiated")}
                className="h-8 px-3 rounded-xl border border-black/10 text-xs font-medium flex items-center gap-1.5 hover:bg-[#EAF1F8] transition-colors text-black/60 hover:text-black">
                <Download className="h-3.5 w-3.5" /> Export All
              </button>
              <button onClick={() => { setTab("issue"); }}
                className="h-8 px-3 rounded-xl bg-black text-white text-xs font-medium flex items-center gap-1.5 hover:bg-gray-800 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Issue Certificate
              </button>
            </div>
          }
        />

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 bg-black text-white text-xs px-4 py-2.5 rounded-xl shadow-lg">
            {toast}
          </div>
        )}

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <KpiCard label="Total Certificate Types" value="85" delta="Across 10 stages" icon={ScrollText} color="blue" />
          <KpiCard label="Issued This Month" value={String(ISSUED_RECORDS.filter(r => r.status === "Issued").length)} delta="Auto + Manual" icon={CheckCircle2} color="green" />
          <KpiCard label="Pending" value={String(ISSUED_RECORDS.filter(r => r.status === "Pending").length)} delta="Awaiting action" icon={Clock} color="amber" positive={false} />
          <KpiCard label="Auto-Generated" value={String(ALL_CERTS.filter(c => c.autoGenerate).length)} delta="System-triggered" icon={Sparkles} color="violet" />
          <KpiCard label="Procurement Methods" value="12" delta="All methods covered" icon={Activity} color="blue" />
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-black/8 mb-6 overflow-x-auto scrollbar-none">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"
              }`}>
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "catalogue" && <CataloguTab onAction={handleAction} />}
        {tab === "issued"    && <IssuedTab    onAction={handleAction} />}
        {tab === "issue"     && <IssueWizardTab onAction={handleAction} />}
        {tab === "analytics" && <AnalyticsTab  onAction={handleAction} />}
      </div>
    </AppShell>
  );
}
