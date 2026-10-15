// ─── Ministry Dashboard Data ─────────────────────────────────────────────────
// Provides per-ministry KPIs, departments, tenders, activity, senior staff
// Driven from ZW_MINISTRIES IDs in zw-ministries.ts

export type MinistryDashKpi = {
  activeTenders: number;
  activeContracts: number;
  budgetUtil: number;
  compliance: number;
  activeProjects: number;
  staffCount: number;
  totalBudgetM: number;
  spentM: number;
};

export type DashDept = {
  id: string;
  name: string;
  head: string;
  budget: number;
  spent: number;
  staff: number;
  status: "Active" | "At Risk" | "Critical";
};

export type DashTender = {
  id: string;
  title: string;
  value: string;
  status: string;
  closing: string;
};

export type DashEntity = {
  name: string;
  type: string;
  budget: string;
  status: string;
};

export type DashActivity = {
  time: string;
  event: string;
  type: "success" | "warning" | "info";
};

export type SeniorOfficer = {
  name: string;
  title: string;
  email: string;
  phone: string;
  dept: string;
  clearanceLevel: string;
  responsibilities: string[];
};

export type MinistryDashData = {
  name: string;
  badge: string;
  minister: string;
  hq: string;
  kpis: MinistryDashKpi;
  departments: DashDept[];
  tenders: DashTender[];
  entities: DashEntity[];
  activity: DashActivity[];
  spendByDept: { dept: string; spend: number }[];
  tenderStatus: { name: string; value: number }[];
  seniorOfficers: SeniorOfficer[];
};

export const MINISTRY_DASH: Record<string, MinistryDashData> = {
  mof: {
    name: "Ministry of Finance and Investment Promotion", badge: "💰",
    minister: "Hon. Prof. Mthuli Ncube", hq: "Munhumutapa Building, Samora Machel Avenue, Harare",
    kpis: { activeTenders: 14, activeContracts: 22, budgetUtil: 68, compliance: 98, activeProjects: 4, staffCount: 1840, totalBudgetM: 640, spentM: 435 },
    departments: [
      { id: "mof-bud", name: "Budget & Public Finance", head: "Mr. G. Chigumba", budget: 180, spent: 122, staff: 120, status: "Active" },
      { id: "mof-debt", name: "Debt Management Office", head: "Dr. A. Kwaramba", budget: 90, spent: 61, staff: 42, status: "Active" },
      { id: "mof-rev", name: "Revenue & Taxation Policy", head: "Ms. T. Mutasa", budget: 140, spent: 96, staff: 86, status: "Active" },
      { id: "mof-inv", name: "Investment Promotion", head: "Mr. C. Ndlovu", budget: 80, spent: 48, staff: 74, status: "At Risk" },
    ],
    tenders: [
      { id: "ZW-MOF-2026-00041", title: "Treasury IT Platform Upgrade", value: "USD 8.4M", status: "Evaluation", closing: "2026-07-10" },
      { id: "ZW-MOF-2026-00038", title: "Fiscal Management Software", value: "USD 5.2M", status: "Bidding", closing: "2026-07-28" },
      { id: "ZW-MOF-2026-00030", title: "ZIMRA Systems Maintenance", value: "USD 3.1M", status: "Awarded", closing: "2026-06-01" },
    ],
    entities: [
      { name: "ZIMRA", type: "Revenue Authority", budget: "USD 220M", status: "Active" },
      { name: "ZB Financial Holdings", type: "State Enterprise", budget: "USD 85M", status: "Active" },
      { name: "National Building Society", type: "Parastatal", budget: "USD 42M", status: "Active" },
    ],
    activity: [
      { time: "10:45", event: "Q3 budget execution report submitted to Cabinet", type: "success" },
      { time: "09:30", event: "ZIMRA revenue exceeds monthly target by 6%", type: "success" },
      { time: "08:15", event: "Investment Promotion overspend flag raised", type: "warning" },
      { time: "07:55", event: "Treasury IT tender — 6 bidders qualified", type: "info" },
    ],
    spendByDept: [
      { dept: "Budget", spend: 122 }, { dept: "Debt Mgmt", spend: 61 },
      { dept: "Revenue", spend: 96 }, { dept: "Investment", spend: 48 },
    ],
    tenderStatus: [{ name: "Bidding", value: 3 }, { name: "Evaluation", value: 4 }, { name: "Awarded", value: 6 }, { name: "Draft", value: 1 }],
    seniorOfficers: [
      { name: "Mr. G. Chigumba", title: "Director of Budget", email: "gchigumba@mof.gov.zw", phone: "+263 4 794 571", dept: "Budget & Public Finance", clearanceLevel: "Secret", responsibilities: ["Annual budget formulation", "PFMS oversight", "Fiscal reporting to Parliament"] },
      { name: "Dr. A. Kwaramba", title: "Director Debt Management", email: "akwaramba@mof.gov.zw", phone: "+263 4 794 572", dept: "Debt Management Office", clearanceLevel: "Top Secret", responsibilities: ["Sovereign debt portfolio", "IMF & World Bank liaison", "Debt sustainability analysis"] },
      { name: "Ms. T. Mutasa", title: "Director Revenue Policy", email: "tmutasa@mof.gov.zw", phone: "+263 4 794 573", dept: "Revenue & Taxation Policy", clearanceLevel: "Confidential", responsibilities: ["Tax policy design", "Revenue forecasting", "ZIMRA policy liaison"] },
      { name: "Mr. C. Ndlovu", title: "Director Investment Promotion", email: "cndlovu@mof.gov.zw", phone: "+263 4 794 574", dept: "Investment Promotion", clearanceLevel: "Confidential", responsibilities: ["FDI attraction", "Investment incentives framework", "ZIDA coordination"] },
    ],
  },

  moh: {
    name: "Ministry of Health and Child Care", badge: "🏥",
    minister: "Hon. Dr Douglas Mombeshora", hq: "Kaguvi Building, 4th Street, Harare",
    kpis: { activeTenders: 24, activeContracts: 18, budgetUtil: 81, compliance: 96, activeProjects: 6, staffCount: 4820, totalBudgetM: 820, spentM: 664 },
    departments: [
      { id: "moh-ps", name: "Preventive Services", head: "Dr. E. Dhliwayo", budget: 200, spent: 148, staff: 1240, status: "Active" },
      { id: "moh-curative", name: "Curative & Clinical Services", head: "Dr. P. Mutasa", budget: 280, spent: 224, staff: 1820, status: "Active" },
      { id: "moh-pharma", name: "Pharmacy & Medicines", head: "Mr. T. Rusike", budget: 180, spent: 142, staff: 480, status: "Active" },
      { id: "moh-mch", name: "Maternal & Child Health", head: "Dr. B. Sithole", budget: 160, spent: 110, staff: 1280, status: "At Risk" },
    ],
    tenders: [
      { id: "ZW-PRA-2026-00183", title: "ARV Medicines Framework", value: "USD 42.5M", status: "Evaluation", closing: "2026-06-12" },
      { id: "ZW-PRA-2026-00177", title: "4 District Hospitals", value: "USD 56.0M", status: "Draft", closing: "2026-09-15" },
      { id: "ZW-PRA-2026-00171", title: "Medical Equipment Supply", value: "USD 18.2M", status: "Bidding", closing: "2026-07-20" },
    ],
    entities: [
      { name: "NATPHARM", type: "State Enterprise", budget: "USD 42M", status: "Active" },
      { name: "MCAZ", type: "Regulatory Body", budget: "USD 18M", status: "Active" },
      { name: "NIMR", type: "Parastatal", budget: "USD 12M", status: "Active" },
    ],
    activity: [
      { time: "10:32", event: "ARV tender evaluation completed — 8 bids scored", type: "success" },
      { time: "09:14", event: "District Hospital design approved by Cabinet", type: "info" },
      { time: "08:02", event: "Pharmacy overspend warning: 94% of ceiling", type: "warning" },
      { time: "07:45", event: "NATPHARM delivery confirmed: 2.4M units ARV", type: "success" },
    ],
    spendByDept: [
      { dept: "Preventive", spend: 148 }, { dept: "Clinical", spend: 224 },
      { dept: "Pharmacy", spend: 142 }, { dept: "MCH", spend: 110 },
    ],
    tenderStatus: [{ name: "Bidding", value: 3 }, { name: "Evaluation", value: 4 }, { name: "Awarded", value: 12 }, { name: "Draft", value: 5 }],
    seniorOfficers: [
      { name: "Dr. E. Dhliwayo", title: "Director Preventive Services", email: "edhliwayo@mohcc.gov.zw", phone: "+263 4 730 011", dept: "Preventive Services", clearanceLevel: "Confidential", responsibilities: ["Disease surveillance", "Vaccination programmes", "Environmental health oversight"] },
      { name: "Dr. P. Mutasa", title: "Director Clinical Services", email: "pmutasa@mohcc.gov.zw", phone: "+263 4 730 012", dept: "Curative & Clinical Services", clearanceLevel: "Confidential", responsibilities: ["Hospital management", "Clinical protocols", "Specialist referral pathways"] },
      { name: "Mr. T. Rusike", title: "Director Pharmacy", email: "trusike@mohcc.gov.zw", phone: "+263 4 730 013", dept: "Pharmacy & Medicines", clearanceLevel: "Secret", responsibilities: ["Essential medicines list", "NATPHARM interface", "MCAZ compliance"] },
      { name: "Dr. B. Sithole", title: "Director Maternal & Child Health", email: "bsithole@mohcc.gov.zw", phone: "+263 4 730 014", dept: "Maternal & Child Health", clearanceLevel: "Confidential", responsibilities: ["Maternal mortality reduction", "Child immunisation", "Community health worker programme"] },
    ],
  },

  mopse: {
    name: "Ministry of Primary & Secondary Education", badge: "📚",
    minister: "Hon. T. Moyo", hq: "Ambassador House, Union Avenue, Harare",
    kpis: { activeTenders: 16, activeContracts: 14, budgetUtil: 72, compliance: 94, activeProjects: 5, staffCount: 44200, totalBudgetM: 980, spentM: 706 },
    departments: [
      { id: "mopse-curr", name: "Curriculum Development", head: "Mr. N. Munayi", budget: 120, spent: 86, staff: 240, status: "Active" },
      { id: "mopse-exam", name: "Examinations & Qualifications", head: "Ms. F. Mpofu", budget: 180, spent: 126, staff: 460, status: "Active" },
      { id: "mopse-teach", name: "Teacher Education & Development", head: "Dr. A. Mazonde", budget: 640, spent: 468, staff: 43500, status: "Active" },
    ],
    tenders: [
      { id: "ZW-MOPSE-2026-00051", title: "School Textbook Supply 2026/27", value: "USD 28.4M", status: "Bidding", closing: "2026-07-30" },
      { id: "ZW-MOPSE-2026-00048", title: "STEM Lab Equipment", value: "USD 12.6M", status: "Evaluation", closing: "2026-07-05" },
      { id: "ZW-MOPSE-2026-00039", title: "School Furniture Framework", value: "USD 8.2M", status: "Awarded", closing: "2026-05-20" },
    ],
    entities: [
      { name: "ZIMSEC", type: "Parastatal", budget: "USD 32M", status: "Active" },
    ],
    activity: [
      { time: "11:00", event: "Textbook tender — 9 suppliers pre-qualified", type: "success" },
      { time: "09:20", event: "ZIMSEC O-Level results processing commenced", type: "info" },
      { time: "08:40", event: "Teacher payroll variance reported — 340 discrepancies", type: "warning" },
    ],
    spendByDept: [
      { dept: "Curriculum", spend: 86 }, { dept: "Exams", spend: 126 }, { dept: "Teachers", spend: 468 },
    ],
    tenderStatus: [{ name: "Bidding", value: 4 }, { name: "Evaluation", value: 3 }, { name: "Awarded", value: 7 }, { name: "Draft", value: 2 }],
    seniorOfficers: [
      { name: "Mr. N. Munayi", title: "Director Curriculum", email: "nmunayi@mopse.gov.zw", phone: "+263 4 727 023", dept: "Curriculum Development", clearanceLevel: "Confidential", responsibilities: ["National curriculum design", "Learning materials approval", "Examination standards"] },
      { name: "Ms. F. Mpofu", title: "Director Examinations", email: "fmpofu@mopse.gov.zw", phone: "+263 4 727 024", dept: "Examinations & Qualifications", clearanceLevel: "Secret", responsibilities: ["ZIMSEC liaison", "Exam integrity programme", "Results certification"] },
      { name: "Dr. A. Mazonde", title: "Director Teacher Development", email: "amazonde@mopse.gov.zw", phone: "+263 4 727 025", dept: "Teacher Education & Development", clearanceLevel: "Confidential", responsibilities: ["Teacher training colleges oversight", "CPD programmes", "Teacher welfare"] },
    ],
  },

  mot: {
    name: "Ministry of Transport and Infrastructural Development", badge: "🛣️",
    minister: "Hon. Felix Mhona", hq: "Kaguvi Building, 4th Street, Harare",
    kpis: { activeTenders: 18, activeContracts: 12, budgetUtil: 76, compliance: 91, activeProjects: 8, staffCount: 2840, totalBudgetM: 740, spentM: 562 },
    departments: [
      { id: "mot-roads", name: "Roads & Traffic", head: "Eng. T. Ncube", budget: 320, spent: 248, staff: 860, status: "Active" },
      { id: "mot-rail", name: "Rail & Inland Waterways", head: "Eng. S. Zimba", budget: 180, spent: 110, staff: 740, status: "At Risk" },
      { id: "mot-civil", name: "Civil Aviation", head: "Capt. J. Mawire", budget: 140, spent: 84, staff: 320, status: "Active" },
      { id: "mot-proj", name: "Infrastructure Projects", head: "Eng. R. Choto", budget: 320, spent: 214, staff: 1240, status: "At Risk" },
    ],
    tenders: [
      { id: "ZW-PRA-2026-00181", title: "Beitbridge–Harare Highway Sec 4", value: "USD 88.0M", status: "Published", closing: "2026-08-04" },
      { id: "ZW-PRA-2026-00162", title: "Bridge Rehabilitation Programme", value: "USD 24.0M", status: "Bidding", closing: "2026-07-15" },
      { id: "ZW-PRA-2026-00145", title: "CAAZ Navigation Equipment", value: "USD 6.8M", status: "Evaluation", closing: "2026-06-28" },
    ],
    entities: [
      { name: "ZINARA", type: "Regulatory Body", budget: "USD 95M", status: "Active" },
      { name: "NRZ", type: "State Enterprise", budget: "USD 64M", status: "Active" },
      { name: "CAAZ", type: "Regulatory Body", budget: "USD 38M", status: "Active" },
      { name: "ZIMPOST", type: "State Enterprise", budget: "USD 22M", status: "Active" },
    ],
    activity: [
      { time: "11:20", event: "Beitbridge Highway Sec 4 tender advertised", type: "info" },
      { time: "09:45", event: "Rail spend at 61% — on track", type: "success" },
      { time: "08:30", event: "Infrastructure Division 88% spend — warning", type: "warning" },
    ],
    spendByDept: [
      { dept: "Roads", spend: 248 }, { dept: "Rail", spend: 110 }, { dept: "Aviation", spend: 84 }, { dept: "Projects", spend: 214 },
    ],
    tenderStatus: [{ name: "Bidding", value: 4 }, { name: "Evaluation", value: 2 }, { name: "Awarded", value: 8 }, { name: "Published", value: 4 }],
    seniorOfficers: [
      { name: "Eng. T. Ncube", title: "Director Roads", email: "tncube@transport.gov.zw", phone: "+263 4 700 991", dept: "Roads & Traffic", clearanceLevel: "Confidential", responsibilities: ["National roads policy", "ZINARA oversight", "Road safety strategy"] },
      { name: "Eng. S. Zimba", title: "Director Rail", email: "szimba@transport.gov.zw", phone: "+263 4 700 992", dept: "Rail & Inland Waterways", clearanceLevel: "Confidential", responsibilities: ["NRZ turnaround programme", "Inland waterways development", "SADC rail integration"] },
      { name: "Capt. J. Mawire", title: "Director Civil Aviation", email: "jmawire@transport.gov.zw", phone: "+263 4 700 993", dept: "Civil Aviation", clearanceLevel: "Secret", responsibilities: ["ICAO compliance", "CAAZ oversight", "Airport infrastructure"] },
      { name: "Eng. R. Choto", title: "Director Infrastructure Projects", email: "rchoto@transport.gov.zw", phone: "+263 4 700 994", dept: "Infrastructure Projects", clearanceLevel: "Confidential", responsibilities: ["Capital project portfolio", "Contractor management", "Donor-funded projects"] },
    ],
  },

  moam: {
    name: "Ministry of Agriculture, Mechanisation & Irrigation Development", badge: "🌾",
    minister: "Hon. Anxious Masuka", hq: "1 Borrowdale Road, Harare",
    kpis: { activeTenders: 20, activeContracts: 16, budgetUtil: 79, compliance: 90, activeProjects: 7, staffCount: 5400, totalBudgetM: 620, spentM: 490 },
    departments: [
      { id: "moam-agric", name: "Agricultural Production & Extension", head: "Dr. M. Chivasa", budget: 280, spent: 214, staff: 4240, status: "Active" },
      { id: "moam-irrig", name: "Irrigation Development", head: "Eng. P. Ncube", budget: 180, spent: 140, staff: 640, status: "Active" },
      { id: "moam-mech", name: "Mechanisation & Equipment", head: "Eng. B. Chikwanda", budget: 140, spent: 116, staff: 520, status: "At Risk" },
    ],
    tenders: [
      { id: "ZW-MOAM-2026-00062", title: "Drip Irrigation Infrastructure — Phase II", value: "USD 32.4M", status: "Bidding", closing: "2026-08-10" },
      { id: "ZW-MOAM-2026-00055", title: "Tractors & Farm Implements 2026", value: "USD 18.6M", status: "Evaluation", closing: "2026-07-14" },
      { id: "ZW-MOAM-2026-00048", title: "Agrochemicals Framework", value: "USD 9.2M", status: "Awarded", closing: "2026-05-30" },
    ],
    entities: [
      { name: "AGRITEX", type: "Development Agency", budget: "USD 45M", status: "Active" },
      { name: "ZFC", type: "State Enterprise", budget: "USD 62M", status: "Active" },
    ],
    activity: [
      { time: "10:15", event: "Irrigation Phase II — 12 contractors pre-qualified", type: "success" },
      { time: "09:00", event: "Mechanisation budget 87% utilised — alert raised", type: "warning" },
      { time: "08:20", event: "Agrochemicals contract signed with 3 suppliers", type: "success" },
    ],
    spendByDept: [
      { dept: "Agric & Ext", spend: 214 }, { dept: "Irrigation", spend: 140 }, { dept: "Mechanisation", spend: 116 },
    ],
    tenderStatus: [{ name: "Bidding", value: 5 }, { name: "Evaluation", value: 4 }, { name: "Awarded", value: 8 }, { name: "Draft", value: 3 }],
    seniorOfficers: [
      { name: "Dr. M. Chivasa", title: "Director Agricultural Production", email: "mchivasa@agritex.gov.zw", phone: "+263 4 706 081", dept: "Agricultural Production & Extension", clearanceLevel: "Confidential", responsibilities: ["Extension service delivery", "Crop production targets", "Food security monitoring"] },
      { name: "Eng. P. Ncube", title: "Director Irrigation", email: "pncube@agritex.gov.zw", phone: "+263 4 706 082", dept: "Irrigation Development", clearanceLevel: "Confidential", responsibilities: ["Irrigation infrastructure rollout", "Water allocation", "Smallholder scheme management"] },
      { name: "Eng. B. Chikwanda", title: "Director Mechanisation", email: "bchikwanda@agritex.gov.zw", phone: "+263 4 706 083", dept: "Mechanisation & Equipment", clearanceLevel: "Confidential", responsibilities: ["Farm equipment fleet", "Mechanisation programme", "Equipment maintenance contracts"] },
    ],
  },
  moepd: {
    name: "Ministry of Energy and Power Development", badge: "⚡",
    minister: "Hon. Edgar Moyo", hq: "Livingstone House, Harare",
    kpis: { activeTenders: 12, activeContracts: 9, budgetUtil: 70, compliance: 93, activeProjects: 5, staffCount: 1640, totalBudgetM: 480, spentM: 336 },
    departments: [
      { id: "moepd-elec", name: "Electricity & Energy", head: "Eng. N. Matambo", budget: 240, spent: 168, staff: 840, status: "Active" },
      { id: "moepd-petrol", name: "Petroleum & Gas", head: "Mr. S. Mathe", budget: 120, spent: 86, staff: 440, status: "Active" },
      { id: "moepd-renew", name: "Renewable Energy", head: "Eng. B. Nyoni", budget: 80, spent: 56, staff: 360, status: "Active" },
    ],
    tenders: [
      { id: "ZW-MOEPD-2026-00033", title: "Solar Mini-Grids — Rural Electrification", value: "USD 28.0M", status: "Bidding", closing: "2026-07-25" },
      { id: "ZW-MOEPD-2026-00028", title: "ZETDC Meter Replacement Programme", value: "USD 14.5M", status: "Evaluation", closing: "2026-07-08" },
      { id: "ZW-MOEPD-2026-00021", title: "Hwange Unit 7 Maintenance", value: "USD 9.8M", status: "Awarded", closing: "2026-06-15" },
    ],
    entities: [
      { name: "ZETDC", type: "State Enterprise", budget: "USD 140M", status: "Active" },
      { name: "ZPC", type: "State Enterprise", budget: "USD 180M", status: "Active" },
      { name: "ZERA", type: "Regulatory Body", budget: "USD 28M", status: "Active" },
    ],
    activity: [
      { time: "11:30", event: "Solar Mini-Grids tender — 8 bidders registered", type: "info" },
      { time: "10:00", event: "ZPC Hwange Unit 7 back online — power restored", type: "success" },
      { time: "08:45", event: "ZERA quarterly compliance report approved", type: "success" },
    ],
    spendByDept: [
      { dept: "Electricity", spend: 168 }, { dept: "Petroleum", spend: 86 }, { dept: "Renewable", spend: 56 },
    ],
    tenderStatus: [{ name: "Bidding", value: 3 }, { name: "Evaluation", value: 2 }, { name: "Awarded", value: 5 }, { name: "Draft", value: 2 }],
    seniorOfficers: [
      { name: "Eng. N. Matambo", title: "Director Electricity", email: "nmatambo@energy.gov.zw", phone: "+263 4 706 820", dept: "Electricity & Energy", clearanceLevel: "Secret", responsibilities: ["Load-shedding policy", "ZETDC oversight", "Grid infrastructure"] },
      { name: "Mr. S. Mathe", title: "Director Petroleum", email: "smathe@energy.gov.zw", phone: "+263 4 706 821", dept: "Petroleum & Gas", clearanceLevel: "Confidential", responsibilities: ["Fuel pricing regulation", "Strategic fuel reserves", "NOIC oversight"] },
      { name: "Eng. B. Nyoni", title: "Director Renewable Energy", email: "bnyoni@energy.gov.zw", phone: "+263 4 706 822", dept: "Renewable Energy", clearanceLevel: "Confidential", responsibilities: ["Solar & wind programme", "Rural electrification", "Climate finance projects"] },
    ],
  },

  mommd: {
    name: "Ministry of Mines and Mining Development", badge: "⛏️",
    minister: "Hon. Winston Chitando", hq: "Zimre Centre, Harare",
    kpis: { activeTenders: 10, activeContracts: 8, budgetUtil: 65, compliance: 89, activeProjects: 4, staffCount: 1240, totalBudgetM: 280, spentM: 182 },
    departments: [
      { id: "mommd-mines", name: "Mines Administration", head: "Mr. T. Mwanza", budget: 100, spent: 64, staff: 540, status: "Active" },
      { id: "mommd-geo", name: "Geological Survey", head: "Dr. E. Mambwe", budget: 80, spent: 52, staff: 280, status: "Active" },
      { id: "mommd-gold", name: "Gold & Precious Minerals", head: "Mr. C. Hlupeko", budget: 60, spent: 48, staff: 420, status: "At Risk" },
    ],
    tenders: [
      { id: "ZW-MOMMD-2026-00018", title: "Mining Survey Equipment", value: "USD 4.8M", status: "Bidding", closing: "2026-07-20" },
      { id: "ZW-MOMMD-2026-00014", title: "Geological Lab Supplies", value: "USD 2.4M", status: "Awarded", closing: "2026-06-10" },
    ],
    entities: [
      { name: "ZMDC", type: "State Enterprise", budget: "USD 85M", status: "Active" },
      { name: "Fidelity Printers & Refiners", type: "State Enterprise", budget: "USD 60M", status: "Active" },
      { name: "MMCZ", type: "Parastatal", budget: "USD 40M", status: "Active" },
    ],
    activity: [
      { time: "10:20", event: "Gold deliveries to Fidelity exceed Q2 target by 8%", type: "success" },
      { time: "09:10", event: "ZMDC environmental audit finding — 14 corrective actions", type: "warning" },
      { time: "08:00", event: "Geological survey data — 3 new mineral deposits confirmed", type: "info" },
    ],
    spendByDept: [
      { dept: "Mines Admin", spend: 64 }, { dept: "Geology", spend: 52 }, { dept: "Gold & PM", spend: 48 },
    ],
    tenderStatus: [{ name: "Bidding", value: 2 }, { name: "Evaluation", value: 1 }, { name: "Awarded", value: 6 }, { name: "Draft", value: 1 }],
    seniorOfficers: [
      { name: "Mr. T. Mwanza", title: "Director Mines Administration", email: "tmwanza@mines.gov.zw", phone: "+263 4 771 944", dept: "Mines Administration", clearanceLevel: "Confidential", responsibilities: ["Mine licensing", "Safety inspections", "ZMDC oversight"] },
      { name: "Dr. E. Mambwe", title: "Director Geology", email: "emambwe@mines.gov.zw", phone: "+263 4 771 945", dept: "Geological Survey", clearanceLevel: "Secret", responsibilities: ["National geological survey", "Mineral exploration data", "Research partnerships"] },
      { name: "Mr. C. Hlupeko", title: "Director Gold & Precious Minerals", email: "chlupeko@mines.gov.zw", phone: "+263 4 771 946", dept: "Gold & Precious Minerals", clearanceLevel: "Top Secret", responsibilities: ["Gold marketing policy", "Fidelity Printers liaison", "MMCZ oversight"] },
    ],
  },
  moect: {
    name: "Ministry of Environment, Climate & Tourism", badge: "🌿",
    minister: "Hon. Nqobizitha Ndlovu", hq: "Makombe Complex, Harare",
    kpis: { activeTenders: 8, activeContracts: 6, budgetUtil: 62, compliance: 88, activeProjects: 3, staffCount: 1080, totalBudgetM: 220, spentM: 136 },
    departments: [
      { id: "moect-env", name: "Environmental Management", head: "Dr. T. Mubvumbi", budget: 80, spent: 48, staff: 460, status: "Active" },
      { id: "moect-climate", name: "Climate Change & Meteorology", head: "Dr. A. Chikwanda", budget: 60, spent: 38, staff: 280, status: "Active" },
      { id: "moect-tour", name: "Tourism Development", head: "Ms. G. Madhuku", budget: 80, spent: 50, staff: 340, status: "At Risk" },
    ],
    tenders: [
      { id: "ZW-MOECT-2026-00022", title: "Climate Monitoring Stations", value: "USD 3.6M", status: "Bidding", closing: "2026-07-18" },
      { id: "ZW-MOECT-2026-00017", title: "Park Conservation Equipment", value: "USD 2.8M", status: "Awarded", closing: "2026-06-05" },
    ],
    entities: [
      { name: "EMA", type: "Regulatory Body", budget: "USD 32M", status: "Active" },
      { name: "ZPWMA", type: "Parastatal", budget: "USD 48M", status: "Active" },
      { name: "ZTDC", type: "Development Agency", budget: "USD 22M", status: "Active" },
    ],
    activity: [
      { time: "10:40", event: "Victoria Falls tourism figures up 12% YoY", type: "success" },
      { time: "09:15", event: "EMA issued 2 environment protection orders — Harare", type: "warning" },
      { time: "08:30", event: "Climate finance GEF grant — USD 4.2M approved", type: "success" },
    ],
    spendByDept: [
      { dept: "Environment", spend: 48 }, { dept: "Climate", spend: 38 }, { dept: "Tourism", spend: 50 },
    ],
    tenderStatus: [{ name: "Bidding", value: 2 }, { name: "Evaluation", value: 1 }, { name: "Awarded", value: 4 }, { name: "Draft", value: 1 }],
    seniorOfficers: [
      { name: "Dr. T. Mubvumbi", title: "Director Environment", email: "tmubvumbi@environment.gov.zw", phone: "+263 4 707 681", dept: "Environmental Management", clearanceLevel: "Confidential", responsibilities: ["EMA oversight", "Environmental impact policy", "Pollution control"] },
      { name: "Dr. A. Chikwanda", title: "Director Climate Change", email: "achikwanda@environment.gov.zw", phone: "+263 4 707 682", dept: "Climate Change & Meteorology", clearanceLevel: "Confidential", responsibilities: ["NDC implementation", "Met department oversight", "Climate finance"] },
      { name: "Ms. G. Madhuku", title: "Director Tourism", email: "gmadhuku@environment.gov.zw", phone: "+263 4 707 683", dept: "Tourism Development", clearanceLevel: "Confidential", responsibilities: ["Tourism promotion strategy", "ZTDC oversight", "ZPWMA liaison"] },
    ],
  },
  mohach: {
    name: "Ministry of Home Affairs and Cultural Heritage", badge: "🏛️",
    minister: "Hon. Kazembe Kazembe", hq: "Makombe Complex, Harare",
    kpis: { activeTenders: 9, activeContracts: 7, budgetUtil: 74, compliance: 92, activeProjects: 3, staffCount: 8400, totalBudgetM: 380, spentM: 281 },
    departments: [
      { id: "mohach-immig", name: "Immigration", head: "Mr. J. Nhira", budget: 120, spent: 88, staff: 2840, status: "Active" },
      { id: "mohach-civil", name: "Civil Registry", head: "Ms. T. Chinenyanga", budget: 100, spent: 74, staff: 3040, status: "Active" },
      { id: "mohach-culture", name: "Cultural Heritage", head: "Dr. P. Mufunde", budget: 60, spent: 40, staff: 2520, status: "Active" },
    ],
    tenders: [
      { id: "ZW-MOHACH-2026-00019", title: "Biometric Passport System Upgrade", value: "USD 14.2M", status: "Evaluation", closing: "2026-07-22" },
      { id: "ZW-MOHACH-2026-00014", title: "Civil Registry IT Infrastructure", value: "USD 6.4M", status: "Bidding", closing: "2026-08-01" },
    ],
    entities: [
      { name: "Zimbabwe Republic Police", type: "Parastatal", budget: "USD 180M", status: "Active" },
      { name: "NMMZ", type: "Parastatal", budget: "USD 18M", status: "Active" },
    ],
    activity: [
      { time: "10:55", event: "Biometric passport tender — 5 bidders qualified", type: "info" },
      { time: "09:30", event: "ZRP joint procurement review completed", type: "success" },
      { time: "08:45", event: "Civil registry backlog reduced by 18%", type: "success" },
    ],
    spendByDept: [
      { dept: "Immigration", spend: 88 }, { dept: "Civil Registry", spend: 74 }, { dept: "Culture", spend: 40 },
    ],
    tenderStatus: [{ name: "Bidding", value: 2 }, { name: "Evaluation", value: 2 }, { name: "Awarded", value: 4 }, { name: "Draft", value: 1 }],
    seniorOfficers: [
      { name: "Mr. J. Nhira", title: "Director Immigration", email: "jnhira@homeaffairs.gov.zw", phone: "+263 4 703 641", dept: "Immigration", clearanceLevel: "Top Secret", responsibilities: ["Border control policy", "Passport issuance", "Visa regulation"] },
      { name: "Ms. T. Chinenyanga", title: "Director Civil Registry", email: "tchinenyanga@homeaffairs.gov.zw", phone: "+263 4 703 642", dept: "Civil Registry", clearanceLevel: "Secret", responsibilities: ["Birth & death registration", "National ID issuance", "Voter roll liaison"] },
      { name: "Dr. P. Mufunde", title: "Director Culture", email: "pmufunde@homeaffairs.gov.zw", phone: "+263 4 703 643", dept: "Cultural Heritage", clearanceLevel: "Confidential", responsibilities: ["Heritage site protection", "NMMZ oversight", "Cultural policy"] },
    ],
  },

  mojlpa: {
    name: "Ministry of Justice, Legal & Parliamentary Affairs", badge: "⚖️",
    minister: "Hon. Ziyambi Ziyambi", hq: "Old Mutual Building, Harare",
    kpis: { activeTenders: 6, activeContracts: 5, budgetUtil: 60, compliance: 97, activeProjects: 2, staffCount: 980, totalBudgetM: 160, spentM: 96 },
    departments: [
      { id: "mojlpa-legal", name: "Legal Administration", head: "Mr. M. Chinhengo", budget: 60, spent: 36, staff: 380, status: "Active" },
      { id: "mojlpa-parl", name: "Parliamentary Affairs", head: "Mr. G. Mutema", budget: 40, spent: 24, staff: 220, status: "Active" },
      { id: "mojlpa-law", name: "Law Reform Commission", head: "Prof. L. Madhuku", budget: 40, spent: 28, staff: 380, status: "Active" },
    ],
    tenders: [
      { id: "ZW-MOJLPA-2026-00012", title: "Court Management System", value: "USD 3.8M", status: "Bidding", closing: "2026-07-30" },
      { id: "ZW-MOJLPA-2026-00009", title: "Legal Aid Services", value: "USD 2.2M", status: "Awarded", closing: "2026-06-01" },
    ],
    entities: [
      { name: "Zimbabwe Law Reform Commission", type: "Regulatory Body", budget: "USD 12M", status: "Active" },
    ],
    activity: [
      { time: "10:00", event: "Court management system tender — 4 pre-qualifiers", type: "info" },
      { time: "09:00", event: "Legal Aid contract awarded — 3 firms onboarded", type: "success" },
      { time: "08:30", event: "Law Reform Commission annual report published", type: "info" },
    ],
    spendByDept: [
      { dept: "Legal Admin", spend: 36 }, { dept: "Parliamentary", spend: 24 }, { dept: "Law Reform", spend: 28 },
    ],
    tenderStatus: [{ name: "Bidding", value: 2 }, { name: "Evaluation", value: 1 }, { name: "Awarded", value: 2 }, { name: "Draft", value: 1 }],
    seniorOfficers: [
      { name: "Mr. M. Chinhengo", title: "Director Legal Administration", email: "mchinhengo@justice.gov.zw", phone: "+263 4 774 620", dept: "Legal Administration", clearanceLevel: "Secret", responsibilities: ["State litigation", "Attorney-General liaison", "Judicial service delivery"] },
      { name: "Mr. G. Mutema", title: "Director Parliamentary Affairs", email: "gmutema@justice.gov.zw", phone: "+263 4 774 621", dept: "Parliamentary Affairs", clearanceLevel: "Confidential", responsibilities: ["Parliamentary legislation tracking", "Government Bills coordination", "Hansard liaison"] },
      { name: "Prof. L. Madhuku", title: "Director Law Reform", email: "lmadhuku@justice.gov.zw", phone: "+263 4 774 622", dept: "Law Reform Commission", clearanceLevel: "Confidential", responsibilities: ["Law reform agenda", "Constitutional alignment", "Public consultation processes"] },
    ],
  },
  mofait: {
    name: "Ministry of Foreign Affairs and International Trade", badge: "🌐",
    minister: "Hon. Frederick Shava", hq: "Munhumutapa Building, Harare",
    kpis: { activeTenders: 7, activeContracts: 6, budgetUtil: 55, compliance: 95, activeProjects: 3, staffCount: 1240, totalBudgetM: 180, spentM: 99 },
    departments: [
      { id: "mofait-diplo", name: "Diplomatic & Consular Services", head: "Amb. T. Chikwanda", budget: 100, spent: 55, staff: 880, status: "Active" },
      { id: "mofait-trade", name: "International Trade", head: "Ms. N. Dube", budget: 60, spent: 34, staff: 360, status: "Active" },
    ],
    tenders: [
      { id: "ZW-MOFAIT-2026-00011", title: "Embassy Renovations — 4 Missions", value: "USD 5.6M", status: "Bidding", closing: "2026-08-05" },
      { id: "ZW-MOFAIT-2026-00008", title: "Diplomatic Courier Services", value: "USD 1.8M", status: "Awarded", closing: "2026-06-10" },
    ],
    entities: [
      { name: "ZIDA", type: "Development Agency", budget: "USD 38M", status: "Active" },
    ],
    activity: [
      { time: "11:00", event: "SADC Trade Protocol review completed", type: "info" },
      { time: "09:30", event: "Embassy renovation tender — 3 firms shortlisted", type: "info" },
      { time: "08:00", event: "ZIDA investment facilitation — 4 new FDI cases", type: "success" },
    ],
    spendByDept: [
      { dept: "Diplomatic", spend: 55 }, { dept: "Intl Trade", spend: 34 },
    ],
    tenderStatus: [{ name: "Bidding", value: 2 }, { name: "Evaluation", value: 1 }, { name: "Awarded", value: 3 }, { name: "Draft", value: 1 }],
    seniorOfficers: [
      { name: "Amb. T. Chikwanda", title: "Director Diplomatic Services", email: "tchikwanda@foreign.gov.zw", phone: "+263 4 727 005", dept: "Diplomatic & Consular Services", clearanceLevel: "Top Secret", responsibilities: ["Foreign mission management", "Treaty negotiations", "Protocol & accreditation"] },
      { name: "Ms. N. Dube", title: "Director International Trade", email: "ndube@foreign.gov.zw", phone: "+263 4 727 006", dept: "International Trade", clearanceLevel: "Secret", responsibilities: ["AfCFTA implementation", "Trade negotiations", "ZIDA coordination"] },
    ],
  },
};
