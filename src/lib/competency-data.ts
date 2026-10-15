/**
 * Competency Assessment Subsystem — Data Types & Seed Data
 * Government of Zimbabwe · PRAZ Procurement Platform
 * 
 * TWO SEPARATE COMPETENCY ASSESSMENT TRACKS:
 * Track 1: Director Competency Assessment
 * Track 2: Technical Engineer / Lead Technical Team Competency Assessment
 */

// ─── A. Resource Types ────────────────────────────────────────────────────────

export type ResourceCategory = "Director" | "Technical Engineer" | "Lead Technical Team" | "Other";
export type ResourceStatus    = "Active" | "Inactive" | "Pending Verification";

/**
 * TWO formal assessment types — each represents a separate competency track:
 * 1. Director Competency Assessment — for directors and leadership
 * 2. Technical Engineer / Lead Technical Team Competency Assessment — for technical execution roles
 */
export type AssessmentType =
  | "Director Competency Assessment"
  | "Technical Engineer / Lead Technical Team Competency Assessment";

export type AssessmentStatus =
  | "Not Assigned" | "Assigned" | "Pending" | "In Progress"
  | "Completed" | "Expired" | "Failed";

export type CompetencyRecord = {
  assessmentType: AssessmentType;
  attemptId: string;
  score: number; maxScore: number; percentage: number;
  passed: boolean; dateTaken: string; expiryDate: string;
  status: "Valid" | "Expired" | "Pending";
};

export type ResourceProfile = {
  id: string; fullName: string; role: ResourceCategory;
  designation: string; company: string; companyId: string;
  email: string; phone: string; specialisation: string;
  professionalBody?: string; membershipNumber?: string; idNumber: string;
  status: ResourceStatus; isDirector: boolean; isTechnical: boolean;
  eligibleForAssessment: boolean; assignedAssessmentType?: AssessmentType;
  competencyRecords: CompetencyRecord[];
  createdAt: string; updatedAt: string;
};

export type AssessmentAssignment = {
  id: string; resourceId: string; assessmentType: AssessmentType;
  assignedBy: string; assignedAt: string; dueDate: string;
  status: AssessmentStatus; accessCode?: string; otpVerified: boolean; attemptId?: string;
};

export type QuestionOption = { id: string; text: string };
export type AssessmentQuestion = {
  id: string; section: string; questionText: string;
  options: QuestionOption[]; correctOptionId: string;
  marks: number; difficulty: "Easy" | "Medium" | "Hard";
};

export type AttemptAnswer = {
  questionId: string; selectedOptionId: string | null; marksAwarded: number;
};

export type AssessmentAttempt = {
  id: string; assignmentId: string; resourceId: string;
  assessmentType: AssessmentType; startedAt: string; submittedAt?: string;
  timeLimitMinutes: number; answers: AttemptAnswer[];
  status: "In Progress" | "Submitted" | "Scored";
  score?: number; maxScore?: number; percentage?: number; passed?: boolean;
};

export type TenderResourceLink = {
  tenderId: string; tenderRef: string; tenderTitle: string;
  resourceId: string; role: ResourceCategory;
  competencyScore?: number; competencyMaxScore?: number;
  competencyPercentage?: number; competencyPassed?: boolean;
  assessmentType?: AssessmentType; dateTaken?: string;
};

// ─── Director Questions (10 questions) ───────────────────────────────────────

export const DIRECTOR_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "dq1", section: "Corporate Governance",
    questionText: "Under the Zimbabwe PPDPA Act, what is the minimum threshold requiring board-level approval?",
    options: [
      { id: "a", text: "USD 50,000" }, { id: "b", text: "USD 100,000" },
      { id: "c", text: "USD 250,000" }, { id: "d", text: "USD 500,000" },
    ],
    correctOptionId: "c", marks: 4, difficulty: "Medium",
  },
  {
    id: "dq2", section: "Corporate Governance",
    questionText: "A director must declare a conflict of interest in a procurement process:",
    options: [
      { id: "a", text: "Only if directly related to the evaluating officer" },
      { id: "b", text: "Before bid submission, in writing" },
      { id: "c", text: "Only after the contract is awarded" },
      { id: "d", text: "Verbally at the bid opening" },
    ],
    correctOptionId: "b", marks: 4, difficulty: "Easy",
  },
  {
    id: "dq3", section: "Corporate Governance",
    questionText: "Which body regulates public procurement in Zimbabwe?",
    options: [
      { id: "a", text: "Reserve Bank of Zimbabwe" }, { id: "b", text: "ZIMRA" },
      { id: "c", text: "PRAZ — Procurement Regulatory Authority of Zimbabwe" },
      { id: "d", text: "Ministry of Finance" },
    ],
    correctOptionId: "c", marks: 3, difficulty: "Easy",
  },
  {
    id: "dq4", section: "Financial Responsibility",
    questionText: "A company's gearing ratio for procurement qualification should ideally be:",
    options: [
      { id: "a", text: "Less than 40% debt-to-assets" }, { id: "b", text: "More than 60% debt-to-assets" },
      { id: "c", text: "Equal to 100%" }, { id: "d", text: "Not considered in procurement" },
    ],
    correctOptionId: "a", marks: 4, difficulty: "Medium",
  },
  {
    id: "dq5", section: "Financial Responsibility",
    questionText: "What document demonstrates tax compliance in a Zimbabwean tender?",
    options: [
      { id: "a", text: "Balance sheet only" }, { id: "b", text: "ZIMRA Tax Clearance Certificate" },
      { id: "c", text: "Bank statement" }, { id: "d", text: "Payroll summary" },
    ],
    correctOptionId: "b", marks: 4, difficulty: "Easy",
  },
  {
    id: "dq6", section: "Anti-Corruption & Ethics",
    questionText: "A director is offered a 'facilitation fee' by a procurement official. The correct action is:",
    options: [
      { id: "a", text: "Accept if the amount is small" },
      { id: "b", text: "Refuse and report to the Anti-Corruption Commission" },
      { id: "c", text: "Accept and declare it later" },
      { id: "d", text: "Ignore it and continue the process" },
    ],
    correctOptionId: "b", marks: 5, difficulty: "Easy",
  },
  {
    id: "dq7", section: "Anti-Corruption & Ethics",
    questionText: "The penalty for a director found guilty of bid rigging in Zimbabwe includes:",
    options: [
      { id: "a", text: "A written warning" }, { id: "b", text: "A fine only" },
      { id: "c", text: "Imprisonment and/or debarment from public procurement" },
      { id: "d", text: "Mandatory retraining" },
    ],
    correctOptionId: "c", marks: 5, difficulty: "Hard",
  },
  {
    id: "dq8", section: "Contract Obligations",
    questionText: "A performance bond in a public contract is typically set at:",
    options: [
      { id: "a", text: "1% of contract value" }, { id: "b", text: "5-10% of contract value" },
      { id: "c", text: "50% of contract value" }, { id: "d", text: "100% of contract value" },
    ],
    correctOptionId: "b", marks: 3, difficulty: "Medium",
  },
  {
    id: "dq9", section: "Contract Obligations",
    questionText: "When a contractor fails to perform, the procuring entity should first issue:",
    options: [
      { id: "a", text: "A blacklisting order immediately" },
      { id: "b", text: "An improvement notice before default proceedings" },
      { id: "c", text: "A court order" }, { id: "d", text: "Payment in full to avoid delay" },
    ],
    correctOptionId: "b", marks: 4, difficulty: "Medium",
  },
  {
    id: "dq10", section: "Risk Management",
    questionText: "Supply chain risk is best mitigated in a public contract by:",
    options: [
      { id: "a", text: "Accepting the lowest bid only" },
      { id: "b", text: "Single-source procurement" },
      { id: "c", text: "Framework agreements and pre-qualified supplier panels" },
      { id: "d", text: "Delaying procurement until budget is confirmed" },
    ],
    correctOptionId: "c", marks: 4, difficulty: "Hard",
  },
];

// ─── Lead Technical Team Questions (10 questions) ────────────────────────────
// NOTE: These questions serve as the Track 2 question bank for the
// "Technical Engineer / Lead Technical Team Competency Assessment".
// The legacy TECHNICAL_ENGINEER_QUESTIONS array has been retired —
// Track 2 uses this more comprehensive lead-team set exclusively.

export const LEAD_TECH_TEAM_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "ltq1", section: "Technical Specifications",
    questionText: "A lead technical team member must ensure that the submitted BOQ and specification are:",
    options: [
      { id: "a", text: "Approximate figures only" },
      { id: "b", text: "Fully priced, itemised and technically verified against the tender document" },
      { id: "c", text: "Identical to competitor submissions" },
      { id: "d", text: "Submitted unsigned" },
    ],
    correctOptionId: "b", marks: 5, difficulty: "Medium",
  },
  {
    id: "ltq2", section: "Technical Specifications",
    questionText: "The minimum professional experience for a lead technical engineer on a large infrastructure tender is typically:",
    options: [
      { id: "a", text: "2 years" }, { id: "b", text: "3 years" },
      { id: "c", text: "5 years" }, { id: "d", text: "8 years" },
    ],
    correctOptionId: "c", marks: 5, difficulty: "Hard",
  },
  {
    id: "ltq3", section: "Quality & Standards",
    questionText: "ISO 9001 and ISO 14001 are respectively concerned with:",
    options: [
      { id: "a", text: "Safety and financial auditing" },
      { id: "b", text: "Quality management and environmental management" },
      { id: "c", text: "Procurement and contract management" },
      { id: "d", text: "IT security and data protection" },
    ],
    correctOptionId: "b", marks: 4, difficulty: "Medium",
  },
  {
    id: "ltq4", section: "Quality & Standards",
    questionText: "The lead technical team is responsible for ensuring non-conformances are:",
    options: [
      { id: "a", text: "Hidden from the procuring entity" },
      { id: "b", text: "Documented, corrective-actioned and closed with evidence" },
      { id: "c", text: "Accepted as normal practice" },
      { id: "d", text: "Reported only at project completion" },
    ],
    correctOptionId: "b", marks: 5, difficulty: "Hard",
  },
  {
    id: "ltq5", section: "Health, Safety & Environment",
    questionText: "A lead technical team is responsible for the site safety plan, which must include:",
    options: [
      { id: "a", text: "Only fire safety procedures" },
      { id: "b", text: "Risk assessment, emergency procedures, PPE requirements and NSSA compliance" },
      { id: "c", text: "Only the company's insurance policy" },
      { id: "d", text: "A list of subcontractors only" },
    ],
    correctOptionId: "b", marks: 5, difficulty: "Medium",
  },
  {
    id: "ltq6", section: "Project Execution",
    questionText: "When a project is running behind on the critical path, the lead technical team should:",
    options: [
      { id: "a", text: "Wait for the client to notice" },
      { id: "b", text: "Prepare a revised programme with recovery measures and notify the project manager" },
      { id: "c", text: "Submit an extension of time claim immediately" },
      { id: "d", text: "Reduce quality standards to speed up delivery" },
    ],
    correctOptionId: "b", marks: 5, difficulty: "Hard",
  },
  {
    id: "ltq7", section: "Project Execution",
    questionText: "The lead team is responsible for ensuring GRNs are issued:",
    options: [
      { id: "a", text: "Before goods are inspected" },
      { id: "b", text: "After confirmed inspection and acceptance of goods at delivery" },
      { id: "c", text: "Only after final payment" },
      { id: "d", text: "Retroactively at project closure" },
    ],
    correctOptionId: "b", marks: 4, difficulty: "Medium",
  },
  {
    id: "ltq8", section: "Technical Proposal",
    questionText: "A comprehensive risk profile prepared by the lead technical team should include:",
    options: [
      { id: "a", text: "Only supply chain risks" },
      { id: "b", text: "All identified risks with likelihood, impact, owner and mitigation strategy" },
      { id: "c", text: "A list of past contracts only" },
      { id: "d", text: "Financial ratios only" },
    ],
    correctOptionId: "b", marks: 6, difficulty: "Hard",
  },
  {
    id: "ltq9", section: "Team Leadership",
    questionText: "A lead technical team member is responsible for ensuring team CVs submitted in the bid are:",
    options: [
      { id: "a", text: "Fabricated to meet requirements" },
      { id: "b", text: "Accurate, certified and relevant to the procurement scope" },
      { id: "c", text: "Not required if the company has ISO certification" },
      { id: "d", text: "Submitted unsigned" },
    ],
    correctOptionId: "b", marks: 5, difficulty: "Medium",
  },
  {
    id: "ltq10", section: "Team Leadership",
    questionText: "The maximum number of concurrent public contracts a single technical lead can be named on is governed by:",
    options: [
      { id: "a", text: "No limit" },
      { id: "b", text: "Capacity and conflict-of-interest rules in the tender requirements" },
      { id: "c", text: "The Ministry of Finance only" },
      { id: "d", text: "The number of years in practice" },
    ],
    correctOptionId: "b", marks: 5, difficulty: "Hard",
  },
];

// ─── Assessment Metadata ──────────────────────────────────────────────────────
// TWO formal assessment tracks — each with its own identity, timing, pass mark
// and question bank. These are never merged or combined.

export type AssessmentTrackInfo = {
  timeLimitMinutes: number;
  passPercentage: number;
  maxScore: number;
  description: string;
  audience: string;
  scorecardCriterion: string;
  trackLabel: string;
  trackNumber: 1 | 2;
  questions: AssessmentQuestion[];
};

export const ASSESSMENT_META: Record<AssessmentType, AssessmentTrackInfo> = {
  "Director Competency Assessment": {
    timeLimitMinutes: 40,
    passPercentage: 70,
    maxScore: DIRECTOR_QUESTIONS.reduce((a, q) => a + q.marks, 0),
    description:
      "Assesses corporate governance, financial responsibility, anti-corruption " +
      "knowledge and contract obligations for company directors.",
    audience: "Company Directors and equivalent leadership resources",
    scorecardCriterion: "6a — Directors Competency Online Test",
    trackLabel: "Track 1 · Director",
    trackNumber: 1,
    questions: DIRECTOR_QUESTIONS,
  },
  "Technical Engineer / Lead Technical Team Competency Assessment": {
    timeLimitMinutes: 60,
    passPercentage: 70,
    maxScore: LEAD_TECH_TEAM_QUESTIONS.reduce((a, q) => a + q.marks, 0),
    description:
      "Evaluates technical execution capability, quality standards, HSE knowledge, " +
      "project delivery and technical team leadership competency.",
    audience:
      "Technical Engineers, Lead Technical Team Members and specialist technical resources",
    scorecardCriterion: "6b — Technical Team Competency Online Test",
    trackLabel: "Track 2 · Technical",
    trackNumber: 2,
    questions: LEAD_TECH_TEAM_QUESTIONS,
  },
};

// ─── Seed: Resource Profiles ──────────────────────────────────────────────────

export const SEED_RESOURCES: ResourceProfile[] = [
  {
    id: "RES-001",
    fullName: "Tendai Muzorewa",
    role: "Director",
    designation: "Managing Director",
    company: "Highveld Engineering (Pvt) Ltd",
    companyId: "VEN-00482",
    email: "tmuzorewa@highveld.co.zw",
    phone: "+263 77 200 1001",
    specialisation: "Civil & Structural Engineering",
    professionalBody: "Zimbabwe Institution of Engineers",
    membershipNumber: "ZIE-2841",
    idNumber: "63-043291-A-21",
    status: "Active",
    isDirector: true,
    isTechnical: false,
    eligibleForAssessment: true,
    assignedAssessmentType: "Director Competency Assessment",
    competencyRecords: [
      {
        assessmentType: "Director Competency Assessment",
        attemptId: "ATT-001",
        score: 32,
        maxScore: 40,
        percentage: 80,
        passed: true,
        dateTaken: "2026-05-10",
        expiryDate: "2027-05-10",
        status: "Valid",
      },
    ],
    createdAt: "2026-04-15",
    updatedAt: "2026-05-10",
  },
  {
    id: "RES-002",
    fullName: "Blessing Chikwanda",
    role: "Technical Engineer",
    designation: "Senior Civil Engineer",
    company: "Highveld Engineering (Pvt) Ltd",
    companyId: "VEN-00482",
    email: "bchikwanda@highveld.co.zw",
    phone: "+263 77 200 1002",
    specialisation: "Road & Bridge Construction",
    professionalBody: "Engineering Council of Zimbabwe",
    membershipNumber: "ECZ-1192",
    idNumber: "75-021045-B-14",
    status: "Active",
    isDirector: false,
    isTechnical: true,
    eligibleForAssessment: true,
    assignedAssessmentType: "Technical Engineer / Lead Technical Team Competency Assessment",
    competencyRecords: [
      {
        assessmentType: "Technical Engineer / Lead Technical Team Competency Assessment",
        attemptId: "ATT-002",
        score: 35,
        maxScore: 40,
        percentage: 87.5,
        passed: true,
        dateTaken: "2026-05-14",
        expiryDate: "2027-05-14",
        status: "Valid",
      },
    ],
    createdAt: "2026-04-15",
    updatedAt: "2026-05-14",
  },
  {
    id: "RES-003",
    fullName: "Fungai Dube",
    role: "Lead Technical Team",
    designation: "Lead Project Engineer",
    company: "Highveld Engineering (Pvt) Ltd",
    companyId: "VEN-00482",
    email: "fdube@highveld.co.zw",
    phone: "+263 77 200 1003",
    specialisation: "Project Management",
    professionalBody: "Zimbabwe Institution of Engineers",
    membershipNumber: "ZIE-3405",
    idNumber: "82-065321-C-22",
    status: "Active",
    isDirector: false,
    isTechnical: true,
    eligibleForAssessment: true,
    assignedAssessmentType: "Technical Engineer / Lead Technical Team Competency Assessment",
    competencyRecords: [],
    createdAt: "2026-04-20",
    updatedAt: "2026-04-20",
  },
  {
    id: "RES-004",
    fullName: "Simbarashe Moyo",
    role: "Director",
    designation: "Finance Director",
    company: "Sable ICT Solutions",
    companyId: "VEN-00480",
    email: "smoyo@sable-ict.co.zw",
    phone: "+263 71 305 0042",
    specialisation: "Financial Management",
    idNumber: "78-052144-D-10",
    status: "Active",
    isDirector: true,
    isTechnical: false,
    eligibleForAssessment: true,
    assignedAssessmentType: "Director Competency Assessment",
    competencyRecords: [
      {
        assessmentType: "Director Competency Assessment",
        attemptId: "ATT-004",
        score: 24,
        maxScore: 40,
        percentage: 60,
        passed: false,
        dateTaken: "2026-05-18",
        expiryDate: "N/A",
        status: "Expired",
      },
    ],
    createdAt: "2026-04-18",
    updatedAt: "2026-05-18",
  },
  {
    id: "RES-005",
    fullName: "Rudo Ndlovu",
    role: "Technical Engineer",
    designation: "ICT Systems Architect",
    company: "Sable ICT Solutions",
    companyId: "VEN-00480",
    email: "rndlovu@sable-ict.co.zw",
    phone: "+263 71 305 0043",
    specialisation: "Enterprise Systems & Networking",
    idNumber: "90-077312-E-05",
    status: "Active",
    isDirector: false,
    isTechnical: true,
    eligibleForAssessment: true,
    assignedAssessmentType: "Technical Engineer / Lead Technical Team Competency Assessment",
    competencyRecords: [],
    createdAt: "2026-04-18",
    updatedAt: "2026-04-18",
  },
];

// ─── Seed: Assessment Assignments ────────────────────────────────────────────

export const SEED_ASSIGNMENTS: AssessmentAssignment[] = [
  {
    id: "ASN-001",
    resourceId: "RES-001",
    assessmentType: "Director Competency Assessment",
    assignedBy: "PRAZ-Evaluator",
    assignedAt: "2026-05-01",
    dueDate: "2026-05-15",
    status: "Completed",
    accessCode: "DA-2841",
    otpVerified: true,
    attemptId: "ATT-001",
  },
  {
    id: "ASN-002",
    resourceId: "RES-002",
    assessmentType: "Technical Engineer / Lead Technical Team Competency Assessment",
    assignedBy: "PRAZ-Evaluator",
    assignedAt: "2026-05-01",
    dueDate: "2026-05-20",
    status: "Completed",
    accessCode: "TE-1192",
    otpVerified: true,
    attemptId: "ATT-002",
  },
  {
    id: "ASN-003",
    resourceId: "RES-003",
    assessmentType: "Technical Engineer / Lead Technical Team Competency Assessment",
    assignedBy: "PRAZ-Evaluator",
    assignedAt: "2026-05-05",
    dueDate: "2026-07-10",
    status: "Pending",
    accessCode: "LT-3405",
    otpVerified: false,
  },
  {
    id: "ASN-004",
    resourceId: "RES-004",
    assessmentType: "Director Competency Assessment",
    assignedBy: "PRAZ-Evaluator",
    assignedAt: "2026-05-05",
    dueDate: "2026-05-20",
    status: "Failed",
    accessCode: "DA-0480",
    otpVerified: true,
    attemptId: "ATT-004",
  },
  {
    id: "ASN-005",
    resourceId: "RES-005",
    assessmentType: "Technical Engineer / Lead Technical Team Competency Assessment",
    assignedBy: "PRAZ-Evaluator",
    assignedAt: "2026-06-01",
    dueDate: "2026-07-15",
    status: "Assigned",
    accessCode: "TE-0480",
    otpVerified: false,
  },
];

// ─── Seed: Tender Resource Links ──────────────────────────────────────────────

export const SEED_TENDER_LINKS: TenderResourceLink[] = [
  {
    tenderId: "ZW-PRA-2026-00181",
    tenderRef: "ZW-PRA-2026-00181",
    tenderTitle: "Rehabilitation of Beitbridge–Harare Highway (Section 4)",
    resourceId: "RES-001",
    role: "Director",
    competencyScore: 32,
    competencyMaxScore: 40,
    competencyPercentage: 80,
    competencyPassed: true,
    assessmentType: "Director Competency Assessment",
    dateTaken: "2026-05-10",
  },
  {
    tenderId: "ZW-PRA-2026-00181",
    tenderRef: "ZW-PRA-2026-00181",
    tenderTitle: "Rehabilitation of Beitbridge–Harare Highway (Section 4)",
    resourceId: "RES-002",
    role: "Technical Engineer",
    competencyScore: 35,
    competencyMaxScore: 40,
    competencyPercentage: 87.5,
    competencyPassed: true,
    assessmentType: "Technical Engineer / Lead Technical Team Competency Assessment",
    dateTaken: "2026-05-14",
  },
  {
    tenderId: "ZW-PRA-2026-00181",
    tenderRef: "ZW-PRA-2026-00181",
    tenderTitle: "Rehabilitation of Beitbridge–Harare Highway (Section 4)",
    resourceId: "RES-003",
    role: "Lead Technical Team",
    assessmentType: "Technical Engineer / Lead Technical Team Competency Assessment",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getStatusColor(status: AssessmentStatus): string {
  switch (status) {
    case "Completed":    return "bg-emerald-100 text-emerald-700";
    case "In Progress":  return "bg-blue-100 text-blue-700";
    case "Assigned":     return "bg-amber-100 text-amber-700";
    case "Pending":      return "bg-yellow-100 text-yellow-700";
    case "Expired":      return "bg-red-100 text-red-600";
    case "Failed":       return "bg-red-100 text-red-700";
    default:             return "bg-gray-100 text-gray-600";
  }
}

export function deriveAssessmentType(role: ResourceCategory): AssessmentType {
  if (role === "Director") return "Director Competency Assessment";
  // Technical Engineer, Lead Technical Team, and Other all belong to Track 2
  return "Technical Engineer / Lead Technical Team Competency Assessment";
}
