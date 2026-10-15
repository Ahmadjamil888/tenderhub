/**
 * TenderDocumentSuitePage
 * Surfaces all 5 procurement documents (Bid Opening Register, Evaluation Score Sheets,
 * Award Recommendation Letter, Letter of Award) in a tabbed DocumentViewerPanel-style layout.
 * Route: /tender-documents
 */
import { useState } from "react";
import { TenderBidOpeningRegister } from "@/components/procurement/TenderBidOpeningRegister";
import { EvaluationConsolidatedScoreSheet } from "@/components/procurement/EvaluationConsolidatedScoreSheet";
import { EvaluationBidderResultSheet } from "@/components/procurement/EvaluationBidderResultSheet";
import { AwardRecommendationLetter } from "@/components/procurement/AwardRecommendationLetter";
import { LetterOfAward } from "@/components/procurement/LetterOfAward";
import { AppShell } from "@/components/AppShell";
import { FileText, Award, ClipboardList, User, Send } from "lucide-react";
import type { ProcDocMeta } from "@/components/ui/ProcurementDocumentTemplate";

// ── Shared mock meta ──────────────────────────────────────────────────────────
const SHARED_META: ProcDocMeta = {
  referenceNumber:    "MOF/PROC/TEN/2027/001",
  date:               "23 July 2026",
  ministry:           "Ministry of Finance & Economic Development",
  department:         "Department of Procurement & Asset Management",
  procuringEntity:    "Ministry of Finance & Economic Development",
  financialYear:      "FY 2026/2027",
  tenderNumber:       "MOF/ICT/001/2026",
  tenderTitle:        "Supply, Delivery, Installation and Commissioning of ICT Infrastructure",
  serialNumber:       "DOC-2027-MOF-001-0042",
  auditTrailNumber:   "AT-2027-BC-00321-ZWE",
  currency:           "USD",
  reportClassification: "OFFICIAL",
  signers: [
    { name: "T. Mhaka",    role: "Evaluator",                     status: "signed", signedAt: "22 Jul 2026 10:45" },
    { name: "R. Moyo",     role: "Reviewer",                      status: "signed", signedAt: "22 Jul 2026 11:30" },
    { name: "C. Dube",     role: "Approver",                      status: "pending" },
    { name: "A. Ncube",    role: "Authorizer",                    status: "pending" },
    { name: "E. Sibanda",  role: "Proc. Oversight",               status: "pending" },
    { name: "J. Mokoena",  role: "Procurement Committee Chair",   status: "pending" },
  ],
  relationshipManager: {
    name:  "Ms. C. Chinyama",
    role:  "Senior Procurement Officer",
    phone: "+263 4 252096",
    email: "c.chinyama@finance.gov.zw",
  },
};

const COMMITTEE = [
  { role: "Evaluator",                   fullName: "T. Mhaka",    position: "Senior Procurement Officer",    dateTime: "22 Jul 2026 10:45" },
  { role: "Reviewer",                    fullName: "R. Moyo",     position: "Chief Procurement Officer",     dateTime: "22 Jul 2026 11:30" },
  { role: "Approver",                    fullName: "C. Dube",     position: "Finance Director",              dateTime: "" },
  { role: "Authorizer",                  fullName: "A. Ncube",    position: "Deputy Permanent Secretary",   dateTime: "" },
  { role: "Procurement Oversight",       fullName: "E. Sibanda",  position: "Internal Audit Director",      dateTime: "" },
  { role: "Adjudications",              fullName: "J. Banda",    position: "Legal Counsel",                dateTime: "" },
  { role: "Appeals",                    fullName: "B. Dlamini",  position: "Independent Adjudicator",      dateTime: "" },
  { role: "Procurement Committee Chair", fullName: "J. Mokoena",  position: "Permanent Secretary",         dateTime: "" },
];

const BIDS = [
  { bidNo: "BID-001", bidderName: "TechGiant Zimbabwe (Pvt) Ltd", country: "Zimbabwe", bidSecuritySubmitted: true, numberOfFiles: 4, financialOffer: 1_245_000, receivedOnTime: true, status: "Opened" as const },
  { bidNo: "BID-002", bidderName: "InfoSystems Africa Ltd", country: "South Africa", bidSecuritySubmitted: true, numberOfFiles: 3, financialOffer: 1_295_000, receivedOnTime: true, status: "Opened" as const },
  { bidNo: "BID-003", bidderName: "Digital Solutions Zim (Pvt) Ltd", country: "Zimbabwe", bidSecuritySubmitted: true, numberOfFiles: 5, financialOffer: 1_380_000, receivedOnTime: true, status: "Opened" as const },
  { bidNo: "BID-004", bidderName: "Pan-Africa ICT Consortium", country: "Kenya", bidSecuritySubmitted: false, numberOfFiles: 2, financialOffer: 0, receivedOnTime: false, status: "Late" as const },
];

const TECH_RESULTS = [
  { rank: 1, bidderName: "TechGiant Zimbabwe (Pvt) Ltd",    technicalScore: 88.5, weightedTechnicalScore: 70.8, technicalThreshold: 70, passedTechnical: true },
  { rank: 2, bidderName: "InfoSystems Africa Ltd",          technicalScore: 81.0, weightedTechnicalScore: 64.8, technicalThreshold: 70, passedTechnical: true },
  { rank: 3, bidderName: "Digital Solutions Zim (Pvt) Ltd", technicalScore: 74.5, weightedTechnicalScore: 59.6, technicalThreshold: 70, passedTechnical: true },
];

const FIN_RESULTS = [
  { bidderName: "TechGiant Zimbabwe (Pvt) Ltd",    tenderPrice: 1_245_000, lowestPrice: 1_245_000, financialWeight: 20, financialScore: 20.00, formula: "(1,245,000/1,245,000)×20" },
  { bidderName: "InfoSystems Africa Ltd",          tenderPrice: 1_295_000, lowestPrice: 1_245_000, financialWeight: 20, financialScore: 19.23, formula: "(1,245,000/1,295,000)×20" },
  { bidderName: "Digital Solutions Zim (Pvt) Ltd", tenderPrice: 1_380_000, lowestPrice: 1_245_000, financialWeight: 20, financialScore: 18.04, formula: "(1,245,000/1,380,000)×20" },
];

const COMBINED_RESULTS = [
  { finalRank: 1, bidderName: "TechGiant Zimbabwe (Pvt) Ltd",    technicalWeighted: 70.8, financialWeighted: 20.00, totalCombined: 90.80, recommendation: "Recommended for Award" },
  { finalRank: 2, bidderName: "InfoSystems Africa Ltd",          technicalWeighted: 64.8, financialWeighted: 19.23, totalCombined: 84.03, recommendation: "Reserve Bidder" },
  { finalRank: 3, bidderName: "Digital Solutions Zim (Pvt) Ltd", technicalWeighted: 59.6, financialWeighted: 18.04, totalCombined: 77.64, recommendation: "Third Ranked" },
];

const TECH_CRITERIA = [
  { criteria: "Technical Specifications Compliance", maximumMarks: 30, marksAwarded: 28, weightedScore: 22.4, justification: "The bidder's proposed ICT infrastructure fully meets the required technical specifications. Enterprise-grade servers with Intel Xeon processors and 128GB RAM were proposed, exceeding the minimum specification of 64GB RAM. All proposed equipment items have current manufacturer support lifecycle extending beyond the contract period." },
  { criteria: "Implementation Methodology & Plan", maximumMarks: 25, marksAwarded: 22, weightedScore: 17.6, justification: "A comprehensive implementation plan was submitted covering all phases from mobilisation to handover. The project timeline of 90 days is realistic and includes buffer periods. The Gantt chart is detailed and includes milestones. Minor deductions applied for insufficient detail in the testing phase documentation." },
  { criteria: "Company Profile & Experience", maximumMarks: 20, marksAwarded: 18, weightedScore: 14.4, justification: "The company has demonstrated 12 years of experience in ICT infrastructure deployment within the public sector. Five comparable contracts were submitted with supporting reference letters. All referees confirmed satisfactory performance. A minor deduction was applied as one reference contract value was below the required threshold." },
  { criteria: "Key Personnel & CVs", maximumMarks: 15, marksAwarded: 13, weightedScore: 10.4, justification: "The proposed Project Manager holds a PMP certification and has 8 years of relevant experience. The Lead Engineer is a Cisco Certified Network Professional (CCNP) with 6 years' experience. Two of the five proposed technicians had CVs that did not include certified training records as required by the tender." },
  { criteria: "After-Sales Support & Warranty",maximumMarks: 10, marksAwarded: 7.5, weightedScore: 6.0, justification: "A 3-year warranty period with on-site support was offered, exceeding the 2-year minimum. Response times of 4 hours for critical issues are compliant. However, the proposed spare parts inventory location was not clearly specified, raising some concern about response time reliability outside Harare CBD." },
];

const AI_COMPLIANCE = [
  { complianceArea: "Mandatory Documents",       status: "✔ All documents submitted",    compliant: true },
  { complianceArea: "PPRA/PPADB Registration",   status: "✔ Current — Verified",         compliant: true },
  { complianceArea: "Tax Clearance Certificate", status: "✔ Valid — ZIMRA Verified",     compliant: true },
  { complianceArea: "Company Registration",      status: "✔ Active — CIPO Verified",     compliant: true },
  { complianceArea: "Technical Specifications",  status: "✔ Compliant",                  compliant: true },
  { complianceArea: "Local Preference (30%+)",   status: "✔ Citizen-owned entity",        compliant: true },
  { complianceArea: "Pricing Arithmetic Check",  status: "✔ No errors detected",         compliant: true },
  { complianceArea: "Conflict of Interest",      status: "✔ No issues detected",         compliant: true },
  { complianceArea: "Debarment Screening",       status: "✔ Cleared — PPRA database",    compliant: true },
  { complianceArea: "Document Authenticity",     status: "✔ AI verification passed",     compliant: true },
];

const TABS = [
  { id: "bid-opening",    label: "Bid Opening Register",           icon: ClipboardList },
  { id: "eval-consolidated", label: "Consolidated Score Sheet",   icon: FileText },
  { id: "eval-bidder",    label: "Bidder Result Sheet",            icon: User },
  { id: "award-rec",      label: "Award Recommendation Letter",    icon: Award },
  { id: "letter-award",   label: "Letter of Award",                icon: Send },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function TenderDocumentSuitePage() {
  const [activeTab, setActiveTab] = useState<TabId>("bid-opening");

  return (
    <AppShell>
      <div className="flex flex-col h-full">
        {/* Page header */}
        <div className="bg-[#0f172a] text-white px-6 py-3 shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-slate-400">GOVERNMENT OF THE REPUBLIC OF ZIMBABWE</p>
          <p className="text-sm font-semibold">Ministry of Finance &amp; Economic Development</p>
          <p className="text-xs text-slate-300">E-GP System — Tender Document Suite</p>
        </div>
        <div className="bg-white border-b px-6 py-2 text-xs text-gray-500 shrink-0">
          Tenders › MOF/ICT/001/2026 › Documents
        </div>

        {/* Tab bar */}
        <div className="bg-white border-b flex overflow-x-auto shrink-0">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? "border-[#1a6b3a] text-[#1a6b3a] bg-green-50"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Document content */}
        <div className="flex-1 overflow-auto bg-gray-100">
          {activeTab === "bid-opening" && (
            <TenderBidOpeningRegister
              meta={SHARED_META}
              tenderInfo={{
                procuringEntity: "Ministry of Finance & Economic Development",
                tenderNumber: "MOF/ICT/001/2026",
                tenderTitle: "Supply, Delivery, Installation and Commissioning of ICT Infrastructure",
                procurementMethod: "Open National Tender",
                financialYear: "FY 2026/2027",
                closingDate: "15 July 2026",
                closingTime: "10:00 hrs",
                openingDate: "15 July 2026",
                openingTime: "10:30 hrs",
                venue: "Ministry of Finance, 10th Floor Conference Room, Harare",
                conductedBy: "T. Mhaka — Senior Procurement Officer",
              }}
              bids={BIDS}
              committee={[
                { name: "T. Mhaka",   role: "Chairperson",          title: "Senior Procurement Officer" },
                { name: "R. Moyo",    role: "Member",               title: "Procurement Officer" },
                { name: "C. Dube",    role: "Member",               title: "Finance Representative" },
                { name: "A. Ncube",   role: "Member (Observer)",    title: "Internal Audit Observer" },
                { name: "E. Sibanda", role: "Member",               title: "Legal Representative" },
              ]}
              blockchainAuditHash="0x3f9a7b2d1c4e5f8a9b0c1d2e3f4a5b6c"
            />
          )}

          {activeTab === "eval-consolidated" && (
            <EvaluationConsolidatedScoreSheet
              meta={SHARED_META}
              sectionA={{
                procuringEntity: "Ministry of Finance & Economic Development",
                procuringDepartment: "Department of Procurement & Asset Management",
                tenderNumber: "MOF/ICT/001/2026",
                tenderTitle: "Supply, Delivery, Installation and Commissioning of ICT Infrastructure",
                procurementMethod: "Open National Tender",
                financialYear: "FY 2026/2027",
                closingDate: "15 July 2026",
                evaluationDate: "22 July 2026",
                evaluationCommitteeRef: "TEC/MOF/001/2026",
                numberOfBiddersReceived: 4,
                numberOfResponsiveBidders: 3,
                currency: "USD",
                evaluationMethodology: "QCBS (Quality & Cost-Based Selection)",
                technicalWeight: 80,
                financialWeight: 20,
              }}
              technicalResults={TECH_RESULTS}
              financialResults={FIN_RESULTS}
              combinedResults={COMBINED_RESULTS}
              committee={COMMITTEE}
            />
          )}

          {activeTab === "eval-bidder" && (
            <EvaluationBidderResultSheet
              meta={{ ...SHARED_META, tenderTitle: "Supply, Delivery, Installation and Commissioning of ICT Infrastructure — Bidder Debrief" }}
              sectionA={{
                procuringEntity: "Ministry of Finance & Economic Development",
                procuringDepartment: "Department of Procurement & Asset Management",
                tenderNumber: "MOF/ICT/001/2026",
                tenderTitle: "Supply, Delivery, Installation and Commissioning of ICT Infrastructure",
                procurementMethod: "Open National Tender",
                tenderCategory: "Goods",
                financialYear: "FY 2026/2027",
                fundingSource: "Government Treasury",
                evaluationMethod: "80:20",
                closingDate: "15 July 2026",
                evaluationDate: "22 July 2026",
                evaluationCommitteeRef: "TEC/MOF/001/2026",
                bidValidityDays: 90,
                evaluationStatus: "Completed — AI Generated",
              }}
              sectionB={{
                companyName: "TechGiant Zimbabwe (Pvt) Ltd",
                companyRegistration: "ZW-REG-2009-004521",
                taxIdentificationNumber: "TIN-ZW-2009-004521",
                ppadbRegistrationNumber: "PPRA-ZW-2015-00187",
                citizenOwned: true,
                physicalAddress: "12 Enterprise Road, Workington, Harare, Zimbabwe",
                contactPerson: "Mr. T. Banda — Managing Director",
                tenderAmountSubmitted: 1_245_000,
              }}
              technicalCriteria={TECH_CRITERIA}
              technicalThreshold={70}
              technicalWeight={80}
              financial={{
                lowestResponsiveBid: 1_245_000,
                thisBidderPrice: 1_245_000,
                financialWeight: 20,
                financialFormula: "(1,245,000/1,245,000)×20 = 20.00",
                financialScore: 20.00,
              }}
              allBiddersRanking={COMBINED_RESULTS.map(r => ({ rank: r.finalRank, bidderName: r.bidderName, totalScore: r.totalCombined }))}
              committee={COMMITTEE}
              aiComplianceItems={AI_COMPLIANCE}
              strengths={[
                "Full technical specification compliance with enterprise-grade equipment exceeding minimum requirements",
                "Citizen-owned entity — satisfies local content and citizen empowerment requirements",
                "Lowest responsive bid — best financial value for money",
                "12 years proven public sector ICT experience in Zimbabwe",
                "Comprehensive 3-year warranty with 4-hour on-site response time",
                "All mandatory documents submitted; tax clearance and company registration verified",
              ]}
              adjudicationRequired={false}
            />
          )}

          {activeTab === "award-rec" && (
            <AwardRecommendationLetter
              meta={SHARED_META}
              ourRef="TEC/MOF/002/2026/001"
              permanentSecretaryName="Honourable Dr. G. Ncube"
              ministry="Ministry of Finance & Economic Development"
              tenderParticulars={{
                procuringEntity: "Ministry of Finance & Economic Development",
                tenderNumber: "MOF/ICT/001/2026",
                tenderTitle: "Supply, Delivery, Installation and Commissioning of ICT Infrastructure",
                procurementMethod: "Open National Tender",
                financialYear: "FY 2026/2027",
                closingDate: "15 July 2026",
                evaluationCompletionDate: "22 July 2026",
              }}
              summaryResults={COMBINED_RESULTS.map(r => ({
                bidder: r.bidderName,
                technicalScoreWeighted: r.technicalWeighted,
                financialScoreWeighted: r.financialWeighted,
                overallScore: r.totalCombined,
              }))}
              recommendedBidder="TechGiant Zimbabwe (Pvt) Ltd"
              tenderSum={1_245_000}
              recommendationReasons={[
                "Achieved the highest combined evaluation score of 90.80 points out of 100",
                "Full technical compliance — all mandatory requirements met or exceeded",
                "Best financial value — lowest responsive bid at USD 1,245,000",
                "Demonstrated implementation capability — 12 years public sector experience",
                "Citizen-owned entity — satisfies local content and empowerment requirements",
                "Lowest procurement risk — established track record with comparable contracts",
              ]}
              chairpersonName="T. Mhaka"
              committee={COMMITTEE}
            />
          )}

          {activeTab === "letter-award" && (
            <LetterOfAward
              meta={SHARED_META}
              referenceNumber="MOF/PROC/AWARD/2026/001"
              bidderMD="The Managing Director"
              bidderCompanyName="TechGiant Zimbabwe (Pvt) Ltd"
              bidderAddress={"12 Enterprise Road\nWorkington\nHarare\nZimbabwe"}
              awardDetails={{
                tenderNumber:      "MOF/ICT/001/2026",
                tenderTitle:       "Supply, Delivery, Installation and Commissioning of ICT Infrastructure",
                successfulBidder:  "TechGiant Zimbabwe (Pvt) Ltd",
                contractAmount:    1_245_000,
                contractDuration:  "90 calendar days",
                deliveryPeriod:    "90 days from contract signing",
                procurementMethod: "Open National Tender",
                fundingSource:     "Government Treasury",
                financialYear:     "FY 2026/2027",
              }}
              evaluationStrengths={[
                "Full technical compliance with all mandatory requirements",
                "Highest combined evaluation score (90.80/100)",
                "Lowest responsive bid — best value for money",
                "Citizen-owned enterprise — local empowerment compliant",
                "3-year warranty with 4-hour on-site response SLA",
                "Quality assurance plan meets ISO 9001 standards",
                "12 years proven public sector delivery track record",
              ]}
              conditionsOfAward={[
                { item: "Submit Performance Security Bond — 10% of contract value (USD 124,500)", deadline: "06 August 2026" },
                { item: "Submit valid Tax Clearance Certificate from ZIMRA", deadline: "06 August 2026" },
                { item: "Confirm Company Registration — Certificate of Incorporation", deadline: "06 August 2026" },
                { item: "Confirm PPRA/PPADB Registration — current certificate", deadline: "06 August 2026" },
                { item: "Sign Integrity Declaration — Anti-Corruption Form", deadline: "06 August 2026" },
                { item: "Execute Contract Agreement", deadline: "06 August 2026" },
                { item: "Submit Insurance Certificates (Public Liability & Professional Indemnity)", deadline: "06 August 2026" },
                { item: "Submit detailed Delivery and Implementation Schedule", deadline: "06 August 2026" },
              ]}
              nextSteps={[
                { event: "Contract Signing",            date: "06 August 2026", time: "10:00 hrs", venue: "Ministry of Finance, Harare" },
                { event: "Project Kick-off Meeting",    date: "07 August 2026", time: "09:00 hrs", venue: "Ministry of Finance, 10th Floor" },
                { event: "Delivery Planning Session",   date: "07 August 2026", time: "14:00 hrs", venue: "Ministry of Finance, 10th Floor" },
                { event: "Project Team Introduction",   date: "08 August 2026", time: "09:00 hrs", venue: "Ministry of Finance, ICT Floor" },
                { event: "Contract Administration Briefing", date: "08 August 2026", time: "14:00 hrs", venue: "Ministry of Finance, Training Room" },
              ]}
              permanentSecretaryName="Dr. G. Ncube"
              ministry="Ministry of Finance & Economic Development"
              completeByDays={14}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
