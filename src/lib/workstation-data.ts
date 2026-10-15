// ─── Workstation / Role Data ──────────────────────────────────────────────────
// Each department has an ordered chain of work stations (roles).
// The chain order defines the process flow — output of one feeds the next.

export type WorkstationStatus = "active" | "vacant" | "suspended";

export interface Workstation {
  id: string;           // slug, e.g. "permanent-secretary"
  role: string;         // full role title
  shortRole: string;    // abbreviated for tower display
  reportsTo: string;    // id of parent role (empty string for top)
  grade?: string;       // e.g. "D4", "C2"
  status: WorkstationStatus;
}

export interface Department {
  id: string;
  name: string;         // clear mandate title
  shortName: string;
  workstations: Workstation[];
}

// ─── 1. Office of the Permanent Secretary ────────────────────────────────────
const PS_OFFICE: Department = {
  id: "permanent-secretary",
  name: "Office of the Permanent Secretary",
  shortName: "PS Office",
  workstations: [
    { id: "permanent-secretary",      role: "Permanent Secretary",      shortRole: "Perm. Secretary",  reportsTo: "",                    grade: "D5", status: "active" },
    { id: "deputy-permanent-secretary",role: "Deputy Permanent Secretary",shortRole: "Deputy Perm. Sec", reportsTo: "permanent-secretary", grade: "D4", status: "active" },
    { id: "chief-of-staff",           role: "Chief of Staff",           shortRole: "Chief of Staff",   reportsTo: "deputy-permanent-secretary", grade: "D3", status: "active" },
    { id: "strategic-advisor",        role: "Strategic Advisor",        shortRole: "Strategic Advisor",reportsTo: "chief-of-staff",      grade: "C5", status: "active" },
    { id: "public-affairs-advisor",   role: "Public Affairs Advisor",   shortRole: "Public Affairs",   reportsTo: "chief-of-staff",      grade: "C4", status: "active" },
    { id: "board-affairs-officer",    role: "Board Affairs Officer",    shortRole: "Board Affairs",    reportsTo: "chief-of-staff",      grade: "C3", status: "active" },
    { id: "protocol-officer",         role: "Protocol Officer",         shortRole: "Protocol",         reportsTo: "chief-of-staff",      grade: "C2", status: "active" },
    { id: "executive-assistant",      role: "Executive Assistant",      shortRole: "Exec. Assistant",  reportsTo: "permanent-secretary", grade: "C2", status: "active" },
    { id: "secretariat-officer",      role: "Secretariat Officer",      shortRole: "Secretariat",      reportsTo: "executive-assistant", grade: "B3", status: "active" },
  ],
};

// ─── 2. Strategy, Policy and Planning ────────────────────────────────────────
const STRATEGY_DEPT: Department = {
  id: "strategy-policy-planning",
  name: "Strategy, Policy & Planning",
  shortName: "Strategy & Policy",
  workstations: [
    { id: "director-strategy",         role: "Director, Strategy and Planning",  shortRole: "Director",            reportsTo: "",                   grade: "D3", status: "active" },
    { id: "policy-manager",            role: "Policy Manager",                   shortRole: "Policy Manager",      reportsTo: "director-strategy",  grade: "C5", status: "active" },
    { id: "strategic-planning-officer",role: "Strategic Planning Officer",       shortRole: "Planning Officer",    reportsTo: "director-strategy",  grade: "C4", status: "active" },
    { id: "monitoring-evaluation-mgr", role: "Monitoring & Evaluation Manager",  shortRole: "M&E Manager",         reportsTo: "director-strategy",  grade: "C4", status: "active" },
    { id: "senior-policy-analyst",     role: "Senior Policy Analyst",            shortRole: "Sr Policy Analyst",   reportsTo: "policy-manager",     grade: "C3", status: "active" },
    { id: "research-officer",          role: "Research Officer",                 shortRole: "Research Officer",    reportsTo: "policy-manager",     grade: "C2", status: "active" },
    { id: "policy-analyst",            role: "Policy Analyst",                   shortRole: "Policy Analyst",      reportsTo: "senior-policy-analyst", grade: "C1", status: "active" },
    { id: "monitoring-evaluation-officer", role: "Monitoring & Evaluation Officer", shortRole: "M&E Officer",     reportsTo: "monitoring-evaluation-mgr", grade: "C2", status: "active" },
    { id: "performance-management-officer", role: "Performance Management Officer", shortRole: "Performance Mgmt", reportsTo: "monitoring-evaluation-mgr", grade: "C2", status: "active" },
    { id: "statistics-officer",        role: "Statistics Officer",               shortRole: "Statistics Officer",  reportsTo: "research-officer",   grade: "C2", status: "active" },
    { id: "data-analyst-spp",          role: "Data Analyst",                     shortRole: "Data Analyst",        reportsTo: "statistics-officer", grade: "B4", status: "active" },
  ],
};

// ─── 3. Finance and Accounting ────────────────────────────────────────────────
const FINANCE_DEPT: Department = {
  id: "finance-accounting",
  name: "Finance & Accounting",
  shortName: "Finance",
  workstations: [
    { id: "director-finance",          role: "Director, Finance",                shortRole: "Director",            reportsTo: "",                   grade: "D3", status: "active" },
    { id: "chief-financial-officer",   role: "Chief Financial Officer",          shortRole: "CFO",                 reportsTo: "director-finance",   grade: "D2", status: "active" },
    { id: "finance-manager",           role: "Finance Manager",                  shortRole: "Finance Manager",     reportsTo: "chief-financial-officer", grade: "C5", status: "active" },
    { id: "budget-manager",            role: "Budget Manager",                   shortRole: "Budget Manager",      reportsTo: "finance-manager",    grade: "C4", status: "active" },
    { id: "treasury-manager",          role: "Treasury Manager",                 shortRole: "Treasury Manager",    reportsTo: "finance-manager",    grade: "C4", status: "active" },
    { id: "financial-accountant",      role: "Financial Accountant",             shortRole: "Financial Acct.",     reportsTo: "finance-manager",    grade: "C3", status: "active" },
    { id: "management-accountant",     role: "Management Accountant",            shortRole: "Mgmt. Accountant",    reportsTo: "finance-manager",    grade: "C3", status: "active" },
    { id: "revenue-accountant",        role: "Revenue Accountant",               shortRole: "Revenue Acct.",       reportsTo: "financial-accountant",grade: "C2", status: "active" },
    { id: "payroll-officer",           role: "Payroll Officer",                  shortRole: "Payroll",             reportsTo: "financial-accountant",grade: "C2", status: "active" },
    { id: "accounts-payable-officer",  role: "Accounts Payable Officer",         shortRole: "Accounts Payable",    reportsTo: "financial-accountant",grade: "C2", status: "active" },
    { id: "accounts-receivable-officer",role: "Accounts Receivable Officer",     shortRole: "Accounts Receivable", reportsTo: "revenue-accountant", grade: "C2", status: "active" },
    { id: "finance-officer",           role: "Finance Officer",                  shortRole: "Finance Officer",     reportsTo: "finance-manager",    grade: "C2", status: "active" },
    { id: "accounting-officer",        role: "Accounting Officer",               shortRole: "Accounting Officer",  reportsTo: "finance-officer",    grade: "C1", status: "active" },
    { id: "finance-clerk",             role: "Finance Clerk",                    shortRole: "Finance Clerk",       reportsTo: "accounting-officer", grade: "B3", status: "active" },
  ],
};

// ─── 4. Procurement and Supply Chain ─────────────────────────────────────────
const PROCUREMENT_DEPT: Department = {
  id: "procurement-supply-chain",
  name: "Procurement & Supply Chain",
  shortName: "Procurement",
  workstations: [
    { id: "director-procurement",      role: "Director, Procurement",            shortRole: "Director",            reportsTo: "",                    grade: "D3", status: "active" },
    { id: "procurement-manager",       role: "Procurement Manager",              shortRole: "Procurement Mgr",     reportsTo: "director-procurement",grade: "C5", status: "active" },
    { id: "senior-procurement-officer",role: "Senior Procurement Officer",       shortRole: "Sr Procurement",      reportsTo: "procurement-manager", grade: "C4", status: "active" },
    { id: "tender-contracts-officer",  role: "Tender and Contracts Officer",     shortRole: "Tenders & Contracts", reportsTo: "procurement-manager", grade: "C3", status: "active" },
    { id: "procurement-officer",       role: "Procurement Officer",              shortRole: "Procurement Officer", reportsTo: "senior-procurement-officer", grade: "C2", status: "active" },
    { id: "contract-management-officer",role: "Contract Management Officer",     shortRole: "Contract Mgmt",       reportsTo: "tender-contracts-officer", grade: "C2", status: "active" },
    { id: "supplier-management-officer",role: "Supplier Management Officer",     shortRole: "Supplier Mgmt",       reportsTo: "tender-contracts-officer", grade: "C2", status: "active" },
    { id: "inventory-manager",         role: "Inventory Manager",                shortRole: "Inventory Manager",   reportsTo: "procurement-manager", grade: "C3", status: "active" },
    { id: "stores-officer",            role: "Stores Officer",                   shortRole: "Stores Officer",      reportsTo: "inventory-manager",   grade: "C2", status: "active" },
    { id: "logistics-officer",         role: "Logistics Officer",                shortRole: "Logistics",           reportsTo: "inventory-manager",   grade: "C2", status: "active" },
    { id: "warehouse-officer",         role: "Warehouse Officer",                shortRole: "Warehouse",           reportsTo: "stores-officer",      grade: "B4", status: "active" },
    { id: "asset-disposal-officer",    role: "Asset Disposal Officer",           shortRole: "Asset Disposal",      reportsTo: "inventory-manager",   grade: "C2", status: "active" },
  ],
};

// ─── 5. Service Delivery and Client Services ──────────────────────────────────
const SERVICE_DELIVERY_DEPT: Department = {
  id: "service-delivery",
  name: "Service Delivery & Client Services",
  shortName: "Service Delivery",
  workstations: [
    { id: "director-service-delivery", role: "Director, Service Delivery",       shortRole: "Director",            reportsTo: "",                    grade: "D3", status: "active" },
    { id: "service-centre-manager",    role: "Service Centre Manager",           shortRole: "Service Centre Mgr",  reportsTo: "director-service-delivery", grade: "C5", status: "active" },
    { id: "customer-service-manager",  role: "Customer Service Manager",         shortRole: "Customer Svc Mgr",    reportsTo: "director-service-delivery", grade: "C5", status: "active" },
    { id: "applications-processing-mgr",role: "Applications Processing Manager", shortRole: "Applications Mgr",    reportsTo: "service-centre-manager",grade: "C4", status: "active" },
    { id: "front-office-supervisor",   role: "Front Office Supervisor",          shortRole: "Front Office Sup.",   reportsTo: "service-centre-manager",grade: "C3", status: "active" },
    { id: "applications-officer",      role: "Applications Officer",             shortRole: "Applications",        reportsTo: "applications-processing-mgr", grade: "C2", status: "active" },
    { id: "licensing-officer",         role: "Licensing Officer",                shortRole: "Licensing",           reportsTo: "applications-processing-mgr", grade: "C2", status: "active" },
    { id: "permit-officer",            role: "Permit Officer",                   shortRole: "Permits",             reportsTo: "applications-processing-mgr", grade: "C2", status: "active" },
    { id: "approval-officer",          role: "Approval Officer",                 shortRole: "Approvals",           reportsTo: "applications-processing-mgr", grade: "C2", status: "active" },
    { id: "revenue-collection-officer",role: "Revenue Collection Officer",       shortRole: "Revenue Collection",  reportsTo: "front-office-supervisor",grade: "C2", status: "active" },
    { id: "cashier",                   role: "Cashier",                          shortRole: "Cashier",             reportsTo: "revenue-collection-officer", grade: "B4", status: "active" },
    { id: "customer-service-officer",  role: "Customer Service Officer",         shortRole: "Customer Service",    reportsTo: "customer-service-manager",grade: "C2", status: "active" },
    { id: "call-centre-officer",       role: "Call Centre Officer",              shortRole: "Call Centre",         reportsTo: "customer-service-manager",grade: "B4", status: "active" },
    { id: "complaints-officer",        role: "Complaints Officer",               shortRole: "Complaints",          reportsTo: "customer-service-manager",grade: "C2", status: "active" },
    { id: "communications-officer-sd", role: "Communications Officer",          shortRole: "Communications",      reportsTo: "customer-service-manager",grade: "C2", status: "active" },
  ],
};

// ─── 6. Operations ────────────────────────────────────────────────────────────
const OPERATIONS_DEPT: Department = {
  id: "operations",
  name: "Operations",
  shortName: "Operations",
  workstations: [
    { id: "director-operations",       role: "Director, Operations",             shortRole: "Director",            reportsTo: "",                    grade: "D3", status: "active" },
    { id: "operations-manager",        role: "Operations Manager",               shortRole: "Operations Mgr",      reportsTo: "director-operations",  grade: "C5", status: "active" },
    { id: "regional-operations-mgr",   role: "Regional Operations Manager",      shortRole: "Regional Ops Mgr",    reportsTo: "operations-manager",   grade: "C4", status: "active" },
    { id: "risk-officer-ops",          role: "Risk Officer",                     shortRole: "Risk Officer",        reportsTo: "operations-manager",   grade: "C3", status: "active" },
    { id: "quality-assurance-officer", role: "Quality Assurance Officer",        shortRole: "QA Officer",          reportsTo: "operations-manager",   grade: "C3", status: "active" },
    { id: "district-operations-mgr",   role: "District Operations Manager",      shortRole: "District Ops Mgr",    reportsTo: "regional-operations-mgr",grade: "C3", status: "active" },
    { id: "operations-officer",        role: "Operations Officer",               shortRole: "Operations Officer",  reportsTo: "district-operations-mgr",grade: "C2", status: "active" },
    { id: "field-supervisor",          role: "Field Supervisor",                 shortRole: "Field Supervisor",    reportsTo: "operations-officer",   grade: "C2", status: "active" },
    { id: "field-inspector",           role: "Field Inspector",                  shortRole: "Field Inspector",     reportsTo: "field-supervisor",     grade: "C1", status: "active" },
    { id: "facilities-operations-officer",role: "Facilities Operations Officer", shortRole: "Facilities Ops",      reportsTo: "operations-manager",   grade: "C2", status: "active" },
    { id: "fleet-officer",             role: "Fleet Officer",                    shortRole: "Fleet Officer",       reportsTo: "facilities-operations-officer",grade: "C1", status: "active" },
    { id: "logistics-coordinator",     role: "Logistics Coordinator",            shortRole: "Logistics Coord.",    reportsTo: "facilities-operations-officer",grade: "C1", status: "active" },
  ],
};

// ─── 7. Human Resources ───────────────────────────────────────────────────────
const HR_DEPT: Department = {
  id: "human-resources",
  name: "Human Resources",
  shortName: "HR",
  workstations: [
    { id: "director-hr",               role: "Director, Human Resources",        shortRole: "Director",            reportsTo: "",                    grade: "D3", status: "active" },
    { id: "hr-manager",                role: "HR Manager",                       shortRole: "HR Manager",          reportsTo: "director-hr",         grade: "C5", status: "active" },
    { id: "recruitment-officer",       role: "Recruitment Officer",              shortRole: "Recruitment",         reportsTo: "hr-manager",          grade: "C3", status: "active" },
    { id: "talent-management-officer", role: "Talent Management Officer",        shortRole: "Talent Mgmt",         reportsTo: "hr-manager",          grade: "C3", status: "active" },
    { id: "learning-development-officer",role: "Learning & Development Officer", shortRole: "L&D Officer",         reportsTo: "hr-manager",          grade: "C3", status: "active" },
    { id: "employee-relations-officer",role: "Employee Relations Officer",       shortRole: "Employee Relations",  reportsTo: "hr-manager",          grade: "C3", status: "active" },
    { id: "performance-mgmt-officer-hr",role: "Performance Management Officer",  shortRole: "Performance Mgmt",    reportsTo: "hr-manager",          grade: "C3", status: "active" },
    { id: "compensation-benefits-officer",role: "Compensation & Benefits Officer",shortRole: "Comp. & Benefits",   reportsTo: "hr-manager",          grade: "C3", status: "active" },
    { id: "wellness-officer",          role: "Wellness Officer",                 shortRole: "Wellness Officer",    reportsTo: "hr-manager",          grade: "C2", status: "active" },
    { id: "ohs-officer",               role: "Occupational Health & Safety Officer",shortRole: "OHS Officer",      reportsTo: "wellness-officer",    grade: "C2", status: "active" },
    { id: "hr-officer",                role: "HR Officer",                       shortRole: "HR Officer",          reportsTo: "hr-manager",          grade: "C2", status: "active" },
    { id: "hr-assistant",              role: "HR Assistant",                     shortRole: "HR Assistant",        reportsTo: "hr-officer",          grade: "B3", status: "active" },
  ],
};

// ─── 8. ICT & Digital Transformation ─────────────────────────────────────────
const ICT_DEPT: Department = {
  id: "ict-digital",
  name: "ICT & Digital Transformation",
  shortName: "ICT",
  workstations: [
    { id: "director-ict",              role: "Director, ICT",                    shortRole: "Director",            reportsTo: "",                    grade: "D3", status: "active" },
    { id: "ict-manager",               role: "ICT Manager",                      shortRole: "ICT Manager",         reportsTo: "director-ict",        grade: "C5", status: "active" },
    { id: "digital-transformation-officer",role: "Digital Transformation Officer",shortRole: "Digital Transform.", reportsTo: "ict-manager",         grade: "C4", status: "active" },
    { id: "business-systems-analyst",  role: "Business Systems Analyst",         shortRole: "Systems Analyst",     reportsTo: "ict-manager",         grade: "C4", status: "active" },
    { id: "systems-administrator",     role: "Systems Administrator",            shortRole: "Sys. Admin",          reportsTo: "ict-manager",         grade: "C3", status: "active" },
    { id: "network-administrator",     role: "Network Administrator",            shortRole: "Network Admin",       reportsTo: "ict-manager",         grade: "C3", status: "active" },
    { id: "database-administrator",    role: "Database Administrator",           shortRole: "DB Admin",            reportsTo: "ict-manager",         grade: "C3", status: "active" },
    { id: "cybersecurity-officer",     role: "Cybersecurity Officer",            shortRole: "Cybersecurity",       reportsTo: "ict-manager",         grade: "C3", status: "active" },
    { id: "software-developer",        role: "Software Developer",               shortRole: "Developer",           reportsTo: "ict-manager",         grade: "C3", status: "active" },
    { id: "data-officer-ict",          role: "Data Officer",                     shortRole: "Data Officer",        reportsTo: "database-administrator",grade: "C2", status: "active" },
    { id: "ict-support-officer",       role: "ICT Support Officer",              shortRole: "ICT Support",         reportsTo: "systems-administrator",grade: "C2", status: "active" },
    { id: "service-desk-officer",      role: "Service Desk Officer",             shortRole: "Service Desk",        reportsTo: "ict-support-officer", grade: "B4", status: "active" },
  ],
};

// ─── 9. Marketing, Communications and Public Relations ───────────────────────
const COMMS_DEPT: Department = {
  id: "communications-pr",
  name: "Communications & Public Relations",
  shortName: "Communications",
  workstations: [
    { id: "director-communications",   role: "Director, Communications",         shortRole: "Director",            reportsTo: "",                    grade: "D3", status: "active" },
    { id: "pr-manager",                role: "Public Relations Manager",         shortRole: "PR Manager",          reportsTo: "director-communications",grade: "C5", status: "active" },
    { id: "corporate-comms-officer",   role: "Corporate Communications Officer", shortRole: "Corporate Comms",     reportsTo: "pr-manager",          grade: "C3", status: "active" },
    { id: "marketing-officer",         role: "Marketing Officer",                shortRole: "Marketing",           reportsTo: "pr-manager",          grade: "C3", status: "active" },
    { id: "media-relations-officer",   role: "Media Relations Officer",          shortRole: "Media Relations",     reportsTo: "pr-manager",          grade: "C3", status: "active" },
    { id: "stakeholder-engagement-officer",role: "Stakeholder Engagement Officer",shortRole: "Stakeholder Engmt.", reportsTo: "pr-manager",          grade: "C3", status: "active" },
    { id: "digital-comms-officer",     role: "Digital Communications Officer",   shortRole: "Digital Comms",       reportsTo: "pr-manager",          grade: "C2", status: "active" },
    { id: "community-outreach-officer",role: "Community Outreach Officer",       shortRole: "Community Outreach",  reportsTo: "pr-manager",          grade: "C2", status: "active" },
    { id: "social-media-officer",      role: "Social Media Officer",             shortRole: "Social Media",        reportsTo: "digital-comms-officer",grade: "C1", status: "active" },
    { id: "graphic-designer",          role: "Graphic Designer",                 shortRole: "Graphic Designer",    reportsTo: "digital-comms-officer",grade: "C1", status: "active" },
    { id: "events-officer",            role: "Events Officer",                   shortRole: "Events Officer",      reportsTo: "pr-manager",          grade: "C2", status: "active" },
  ],
};

// ─── 10. Administration and Facilities Management ────────────────────────────
const ADMIN_DEPT: Department = {
  id: "administration-facilities",
  name: "Administration & Facilities Management",
  shortName: "Admin & Facilities",
  workstations: [
    { id: "director-administration",   role: "Director, Administration",         shortRole: "Director",            reportsTo: "",                    grade: "D3", status: "active" },
    { id: "administration-manager",    role: "Administration Manager",           shortRole: "Admin Manager",       reportsTo: "director-administration",grade: "C5", status: "active" },
    { id: "office-manager",            role: "Office Manager",                   shortRole: "Office Manager",      reportsTo: "administration-manager",grade: "C4", status: "active" },
    { id: "records-manager",           role: "Records Manager",                  shortRole: "Records Manager",     reportsTo: "administration-manager",grade: "C4", status: "active" },
    { id: "facilities-manager",        role: "Facilities Manager",               shortRole: "Facilities Manager",  reportsTo: "administration-manager",grade: "C4", status: "active" },
    { id: "executive-secretary",       role: "Executive Secretary",              shortRole: "Exec. Secretary",     reportsTo: "office-manager",      grade: "C3", status: "active" },
    { id: "administrative-officer",    role: "Administrative Officer",           shortRole: "Admin Officer",       reportsTo: "office-manager",      grade: "C2", status: "active" },
    { id: "transport-officer",         role: "Transport Officer",                shortRole: "Transport Officer",   reportsTo: "facilities-manager",  grade: "C2", status: "active" },
    { id: "facilities-officer",        role: "Facilities Officer",               shortRole: "Facilities Officer",  reportsTo: "facilities-manager",  grade: "C2", status: "active" },
    { id: "records-officer",           role: "Records Officer",                  shortRole: "Records Officer",     reportsTo: "records-manager",     grade: "C2", status: "active" },
    { id: "security-officer",          role: "Security Officer",                 shortRole: "Security Officer",    reportsTo: "facilities-manager",  grade: "C1", status: "active" },
    { id: "administrative-assistant",  role: "Administrative Assistant",         shortRole: "Admin Assistant",     reportsTo: "administrative-officer",grade: "B4", status: "active" },
    { id: "registry-clerk",            role: "Registry Clerk",                   shortRole: "Registry Clerk",      reportsTo: "records-officer",     grade: "B3", status: "active" },
    { id: "receptionist",              role: "Receptionist",                     shortRole: "Receptionist",        reportsTo: "office-manager",      grade: "B3", status: "active" },
  ],
};

// ─── 11. Legal and Compliance ─────────────────────────────────────────────────
const LEGAL_DEPT: Department = {
  id: "legal-compliance",
  name: "Legal & Compliance",
  shortName: "Legal & Compliance",
  workstations: [
    { id: "director-legal",            role: "Director, Legal Services",         shortRole: "Director",            reportsTo: "",                    grade: "D3", status: "active" },
    { id: "legal-counsel",             role: "Legal Counsel",                    shortRole: "Legal Counsel",       reportsTo: "director-legal",      grade: "C5", status: "active" },
    { id: "compliance-manager",        role: "Compliance Manager",               shortRole: "Compliance Mgr",      reportsTo: "director-legal",      grade: "C5", status: "active" },
    { id: "senior-legal-officer",      role: "Senior Legal Officer",             shortRole: "Sr Legal Officer",    reportsTo: "legal-counsel",       grade: "C4", status: "active" },
    { id: "governance-officer",        role: "Governance Officer",               shortRole: "Governance",          reportsTo: "compliance-manager",  grade: "C3", status: "active" },
    { id: "regulatory-affairs-officer",role: "Regulatory Affairs Officer",       shortRole: "Regulatory Affairs",  reportsTo: "compliance-manager",  grade: "C3", status: "active" },
    { id: "ethics-officer",            role: "Ethics Officer",                   shortRole: "Ethics Officer",      reportsTo: "compliance-manager",  grade: "C3", status: "active" },
    { id: "legal-officer",             role: "Legal Officer",                    shortRole: "Legal Officer",       reportsTo: "senior-legal-officer",grade: "C2", status: "active" },
    { id: "compliance-officer",        role: "Compliance Officer",               shortRole: "Compliance Officer",  reportsTo: "compliance-manager",  grade: "C2", status: "active" },
    { id: "risk-compliance-analyst",   role: "Risk & Compliance Analyst",        shortRole: "Risk & Compliance",   reportsTo: "compliance-officer",  grade: "C1", status: "active" },
  ],
};

// ─── 12. Internal Audit and Risk Management ───────────────────────────────────
const AUDIT_RISK_DEPT: Department = {
  id: "internal-audit-risk",
  name: "Internal Audit & Risk Management",
  shortName: "Audit & Risk",
  workstations: [
    { id: "chief-internal-auditor",    role: "Chief Internal Auditor",           shortRole: "Chief Auditor",       reportsTo: "",                    grade: "D3", status: "active" },
    { id: "internal-audit-manager",    role: "Internal Audit Manager",           shortRole: "Audit Manager",       reportsTo: "chief-internal-auditor",grade: "C5", status: "active" },
    { id: "risk-manager",              role: "Risk Manager",                     shortRole: "Risk Manager",        reportsTo: "chief-internal-auditor",grade: "C5", status: "active" },
    { id: "senior-internal-auditor",   role: "Senior Internal Auditor",          shortRole: "Sr Auditor",          reportsTo: "internal-audit-manager",grade: "C4", status: "active" },
    { id: "internal-controls-officer", role: "Internal Controls Officer",        shortRole: "Internal Controls",   reportsTo: "internal-audit-manager",grade: "C3", status: "active" },
    { id: "fraud-prevention-officer",  role: "Fraud Prevention Officer",         shortRole: "Fraud Prevention",    reportsTo: "internal-audit-manager",grade: "C3", status: "active" },
    { id: "business-continuity-officer",role: "Business Continuity Officer",     shortRole: "Business Continuity", reportsTo: "risk-manager",        grade: "C3", status: "active" },
    { id: "risk-officer",              role: "Risk Officer",                     shortRole: "Risk Officer",        reportsTo: "risk-manager",        grade: "C2", status: "active" },
    { id: "internal-auditor",          role: "Internal Auditor",                 shortRole: "Auditor",             reportsTo: "senior-internal-auditor",grade: "C2", status: "active" },
  ],
};

// ─── 13. Research, Monitoring and Evaluation ─────────────────────────────────
const RESEARCH_ME_DEPT: Department = {
  id: "research-monitoring-evaluation",
  name: "Research, Monitoring & Evaluation",
  shortName: "Research & M&E",
  workstations: [
    { id: "director-research-me",      role: "Director, Research & M&E",         shortRole: "Director",            reportsTo: "",                    grade: "D3", status: "active" },
    { id: "research-manager",          role: "Research Manager",                 shortRole: "Research Manager",    reportsTo: "director-research-me",grade: "C5", status: "active" },
    { id: "me-manager",                role: "Monitoring & Evaluation Manager",  shortRole: "M&E Manager",         reportsTo: "director-research-me",grade: "C5", status: "active" },
    { id: "statistician",              role: "Statistician",                     shortRole: "Statistician",        reportsTo: "research-manager",    grade: "C4", status: "active" },
    { id: "knowledge-management-officer",role: "Knowledge Management Officer",   shortRole: "Knowledge Mgmt",      reportsTo: "research-manager",    grade: "C3", status: "active" },
    { id: "research-officer-rme",      role: "Research Officer",                 shortRole: "Research Officer",    reportsTo: "research-manager",    grade: "C2", status: "active" },
    { id: "me-officer",                role: "Monitoring & Evaluation Officer",  shortRole: "M&E Officer",         reportsTo: "me-manager",          grade: "C2", status: "active" },
    { id: "survey-officer",            role: "Survey Officer",                   shortRole: "Survey Officer",      reportsTo: "me-manager",          grade: "C2", status: "active" },
    { id: "data-analyst-rme",          role: "Data Analyst",                     shortRole: "Data Analyst",        reportsTo: "statistician",        grade: "C1", status: "active" },
  ],
};

// ─── 14. Regional and District Offices ───────────────────────────────────────
const REGIONAL_DISTRICT_DEPT: Department = {
  id: "regional-district-offices",
  name: "Regional & District Offices",
  shortName: "Regional Offices",
  workstations: [
    { id: "regional-director",         role: "Regional Director",                shortRole: "Regional Director",   reportsTo: "",                    grade: "D3", status: "active" },
    { id: "regional-operations-manager",role: "Regional Operations Manager",     shortRole: "Regional Ops Mgr",    reportsTo: "regional-director",   grade: "C5", status: "active" },
    { id: "district-coordinator",      role: "District Coordinator",             shortRole: "District Coordinator",reportsTo: "regional-operations-manager",grade: "C4", status: "active" },
    { id: "district-officer",          role: "District Officer",                 shortRole: "District Officer",    reportsTo: "district-coordinator",grade: "C3", status: "active" },
    { id: "finance-officer-regional",  role: "Finance Officer",                  shortRole: "Finance Officer",     reportsTo: "district-coordinator",grade: "C2", status: "active" },
    { id: "administrative-officer-regional",role: "Administrative Officer",      shortRole: "Admin Officer",       reportsTo: "district-coordinator",grade: "C2", status: "active" },
    { id: "field-officer",             role: "Field Officer",                    shortRole: "Field Officer",       reportsTo: "district-officer",    grade: "C2", status: "active" },
    { id: "customer-service-officer-reg",role: "Customer Service Officer",       shortRole: "Customer Service",    reportsTo: "district-officer",    grade: "C1", status: "active" },
    { id: "community-liaison-officer", role: "Community Liaison Officer",        shortRole: "Community Liaison",   reportsTo: "field-officer",       grade: "C1", status: "active" },
  ],
};

// ─── Master registry ──────────────────────────────────────────────────────────
export const WORKSTATION_DEPARTMENTS: Department[] = [
  PS_OFFICE,
  STRATEGY_DEPT,
  FINANCE_DEPT,
  PROCUREMENT_DEPT,
  SERVICE_DELIVERY_DEPT,
  OPERATIONS_DEPT,
  HR_DEPT,
  ICT_DEPT,
  COMMS_DEPT,
  ADMIN_DEPT,
  LEGAL_DEPT,
  AUDIT_RISK_DEPT,
  RESEARCH_ME_DEPT,
  REGIONAL_DISTRICT_DEPT,
];

/** Look up a department by id */
export function getDepartmentById(id: string): Department | undefined {
  return WORKSTATION_DEPARTMENTS.find(d => d.id === id);
}

/** Look up a workstation by dept id + workstation id */
export function getWorkstationById(deptId: string, wsId: string): Workstation | undefined {
  return getDepartmentById(deptId)?.workstations.find(w => w.id === wsId);
}

/** Workstation tab list — drives the detail tabs for each role */
export const WORKSTATION_TABS = [
  "Profile",
  "Role",
  "Workload",
  "Reports",
  "Performance",
  "Awards",
  "Training",
  "Health & Wellness",
  "Declarations",
  "Applications",
  "CPD",
  "Time Clocking",
  "Discipline",
  "Documents",
] as const;
export type WorkstationTab = typeof WORKSTATION_TABS[number];
