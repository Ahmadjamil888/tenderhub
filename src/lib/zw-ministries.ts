// Zimbabwe Government Ministries — Complete Data
// Based on actual Zimbabwe government structure (2024-2026)

export type ZWRole = {
  title: string;
  level: "Executive" | "Senior" | "Officer" | "Support";
  count: number;
};

export type ZWDepartment = {
  id: string;
  name: string;
  code: string;
  head: string;
  roles: ZWRole[];
};

export type ZWStateEntity = {
  id: string;
  name: string;
  code: string;
  type: string;
  ceo: string;
};

export type ZWMinistry = {
  id: string;
  name: string;
  code: string;
  minister: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  cpo: string;           // Chief Procurement Officer name for this ministry
  departments: ZWDepartment[];
  stateEntities: ZWStateEntity[];
};

// ─── Presidency / Office of the President and Cabinet ─────────────────────────
export type ZWPresidency = {
  id: "presidency";
  name: "Office of the President and Cabinet";
  code: "OPC";
  title: string;        // e.g. "President / Head of State"
  incumbent: string;    // e.g. "H.E. President E.D. Mnangagwa"
  phone: string;
  email: string;
  address: string;
  description: string;
  departments: ZWDepartment[];
};

export const ZW_PRESIDENCY: ZWPresidency = {
  id: "presidency",
  name: "Office of the President and Cabinet",
  code: "OPC",
  title: "President / Head of State",
  incumbent: "H.E. President E.D. Mnangagwa",
  phone: "+263 4 707 941",
  email: "info@opc.gov.zw",
  address: "State House, Harare",
  description: "The supreme executive authority of the Republic of Zimbabwe. The Office of the President and Cabinet coordinates government policy across all ministries and state entities.",
  departments: [
    {
      id: "opc-cabinet",
      name: "Cabinet Affairs and Policy Coordination",
      code: "CAPC",
      head: "Chief Secretary to the President and Cabinet",
      roles: [
        { title: "President / Head of State",              level: "Executive", count: 1 },
        { title: "Chief Secretary to the Cabinet",         level: "Executive", count: 1 },
        { title: "Principal Director Cabinet Affairs",     level: "Senior",    count: 2 },
        { title: "Senior Cabinet Officer",                 level: "Senior",    count: 4 },
        { title: "Cabinet Officer",                        level: "Officer",   count: 10 },
        { title: "Administrative Officer",                 level: "Support",   count: 15 },
      ],
    },
    {
      id: "opc-national-security",
      name: "National Security and Intelligence",
      code: "NSI",
      head: "Director-General National Security",
      roles: [
        { title: "Director-General National Security",    level: "Executive", count: 1 },
        { title: "Deputy Director-General",               level: "Senior",    count: 2 },
        { title: "Principal Intelligence Officer",        level: "Senior",    count: 5 },
        { title: "Intelligence Officer",                  level: "Officer",   count: 20 },
        { title: "Support Officer",                       level: "Support",   count: 18 },
      ],
    },
    {
      id: "opc-state-residences",
      name: "State Residences and Protocol",
      code: "SRP",
      head: "Director State Residences",
      roles: [
        { title: "Director State Residences",             level: "Executive", count: 1 },
        { title: "Chief Protocol Officer",                level: "Senior",    count: 2 },
        { title: "Protocol Officer",                      level: "Officer",   count: 8 },
        { title: "Support Officer",                       level: "Support",   count: 25 },
      ],
    },
    {
      id: "opc-procurement",
      name: "Presidential Procurement and Supply",
      code: "PPS",
      head: "Chief Procurement Officer — OPC",
      roles: [
        { title: "Chief Procurement Officer — OPC",       level: "Executive", count: 1 },
        { title: "Senior Procurement Officer",            level: "Senior",    count: 3 },
        { title: "Procurement Officer",                   level: "Officer",   count: 8 },
        { title: "Procurement Clerk",                     level: "Support",   count: 6 },
      ],
    },
  ],
};


export const ZW_MINISTRIES: ZWMinistry[] = [
  {
    id: "mof",
    name: "Ministry of Finance and Investment Promotion",
    code: "MOF",
    minister: "Hon. Prof. Mthuli Ncube",
    phone: "+263 4 794 571",
    email: "info@mof.gov.zw",
    address: "Munhumutapa Building, Samora Machel Avenue, Harare",
    description: "National treasury, fiscal policy, budget management, tax administration and investment promotion",
    cpo: "Mrs. G. Chideme (CPO — MOF)",
    departments: [
      {
        id: "mof-bud", name: "Budget and Public Finance", code: "BPF", head: "Mr. G. Chigumba",
        roles: [
          { title: "Director of Budget", level: "Executive", count: 1 },
          { title: "Senior Budget Analyst", level: "Senior", count: 4 },
          { title: "Budget Officer", level: "Officer", count: 12 },
          { title: "Budget Clerk", level: "Support", count: 8 },
        ],
      },
      {
        id: "mof-debt", name: "Debt Management Office", code: "DMO", head: "Dr. A. Kwaramba",
        roles: [
          { title: "Director Debt Management", level: "Executive", count: 1 },
          { title: "Debt Analyst", level: "Senior", count: 3 },
          { title: "Debt Officer", level: "Officer", count: 6 },
          { title: "Data Clerk", level: "Support", count: 4 },
        ],
      },
      {
        id: "mof-rev", name: "Revenue and Taxation Policy", code: "RTP", head: "Ms. T. Mutasa",
        roles: [
          { title: "Director Revenue Policy", level: "Executive", count: 1 },
          { title: "Tax Policy Analyst", level: "Senior", count: 3 },
          { title: "Revenue Officer", level: "Officer", count: 8 },
          { title: "Support Officer", level: "Support", count: 5 },
        ],
      },
      {
        id: "mof-inv", name: "Investment Promotion", code: "INV", head: "Mr. C. Ndlovu",
        roles: [
          { title: "Director Investment Promotion", level: "Executive", count: 1 },
          { title: "Investment Promotion Officer", level: "Senior", count: 5 },
          { title: "Investment Analyst", level: "Officer", count: 8 },
          { title: "Administrative Officer", level: "Support", count: 6 },
        ],
      },
    ],
    stateEntities: [
      { id: "zimra", name: "Zimbabwe Revenue Authority", code: "ZIMRA", type: "Revenue Authority", ceo: "Ms. Regina Chinamasa" },
      { id: "zbfh", name: "ZB Financial Holdings", code: "ZBFH", type: "State Enterprise", ceo: "Mr. R. Nkambule" },
      { id: "nbs", name: "National Building Society", code: "NBS", type: "Parastatal", ceo: "Mr. T. Zindoga" },
    ],
  },
  {
    id: "moh",
    name: "Ministry of Health and Child Care",
    code: "MOH",
    minister: "Hon. Dr Douglas Mombeshora",
    phone: "+263 4 730 011",
    email: "info@mohcc.gov.zw",
    address: "Kaguvi Building, 4th Street, Harare",
    description: "National health services, disease control, pharmaceuticals, maternal and child health",
    cpo: "Mr. T. Rusike (CPO — MOH)",
    departments: [
      {
        id: "moh-ps", name: "Preventive Services", code: "PS", head: "Dr. E. Dhliwayo",
        roles: [
          { title: "Director Preventive Services", level: "Executive", count: 1 },
          { title: "Public Health Specialist", level: "Senior", count: 5 },
          { title: "Environmental Health Officer", level: "Officer", count: 18 },
          { title: "Health Inspector", level: "Support", count: 24 },
        ],
      },
      {
        id: "moh-curative", name: "Curative and Clinical Services", code: "CCS", head: "Dr. P. Mutasa",
        roles: [
          { title: "Director Clinical Services", level: "Executive", count: 1 },
          { title: "Medical Superintendent", level: "Senior", count: 8 },
          { title: "Clinical Officer", level: "Officer", count: 42 },
          { title: "Nursing Officer", level: "Support", count: 64 },
        ],
      },
      {
        id: "moh-pharma", name: "Pharmacy and Medicines", code: "PMD", head: "Mr. T. Rusike",
        roles: [
          { title: "Director Pharmacy", level: "Executive", count: 1 },
          { title: "Senior Pharmacist", level: "Senior", count: 6 },
          { title: "Pharmacist", level: "Officer", count: 22 },
          { title: "Pharmacy Technician", level: "Support", count: 30 },
        ],
      },
      {
        id: "moh-mch", name: "Maternal and Child Health", code: "MCH", head: "Dr. B. Sithole",
        roles: [
          { title: "Director MCH", level: "Executive", count: 1 },
          { title: "Senior Midwife", level: "Senior", count: 4 },
          { title: "Midwife", level: "Officer", count: 35 },
          { title: "Community Health Worker", level: "Support", count: 80 },
        ],
      },
    ],
    stateEntities: [
      { id: "natpharm", name: "National Pharmaceuticals Company", code: "NATPHARM", type: "State Enterprise", ceo: "Mr. G. Nzenze" },
      { id: "mcaz", name: "Medicines Control Authority of Zimbabwe", code: "MCAZ", type: "Regulatory Body", ceo: "Ms. T. Mhlanga" },
      { id: "nimr", name: "National Institute for Medical Research", code: "NIMR", type: "Parastatal", ceo: "Prof. K. Mutasa" },
    ],
  },
  {
    id: "mopse",
    name: "Ministry of Primary and Secondary Education",
    code: "MOPSE",
    minister: "Hon. T. Moyo",
    phone: "+263 4 727 023",
    email: "info@mopse.gov.zw",
    address: "Ambassador House, Union Avenue, Harare",
    description: "Primary and secondary school education, curriculum development, teacher training and welfare",
    cpo: "Ms. F. Mpofu (CPO — MOPSE)",
    departments: [
      {
        id: "mopse-curr", name: "Curriculum Development", code: "CD", head: "Mr. N. Munayi",
        roles: [
          { title: "Director Curriculum", level: "Executive", count: 1 },
          { title: "Curriculum Specialist", level: "Senior", count: 6 },
          { title: "Education Officer", level: "Officer", count: 20 },
          { title: "Support Officer", level: "Support", count: 10 },
        ],
      },
      {
        id: "mopse-exam", name: "Examinations and Qualifications", code: "ZIMSEC-L", head: "Ms. F. Mpofu",
        roles: [
          { title: "Director Examinations", level: "Executive", count: 1 },
          { title: "Senior Examinations Officer", level: "Senior", count: 5 },
          { title: "Examinations Officer", level: "Officer", count: 25 },
          { title: "Invigilator Coordinator", level: "Support", count: 40 },
        ],
      },
      {
        id: "mopse-teach", name: "Teacher Education and Development", code: "TED", head: "Dr. A. Mazonde",
        roles: [
          { title: "Director Teacher Development", level: "Executive", count: 1 },
          { title: "Teacher Trainer", level: "Senior", count: 8 },
          { title: "Headmaster/Mistress", level: "Officer", count: 150 },
          { title: "Teacher", level: "Support", count: 42000 },
        ],
      },
    ],
    stateEntities: [
      { id: "zimsec", name: "Zimbabwe Schools Examinations Council", code: "ZIMSEC", type: "Parastatal", ceo: "Ms. N. Moyo" },
    ],
  },
  {
    id: "mohte",
    name: "Ministry of Higher and Tertiary Education",
    code: "MOHTE",
    minister: "Hon. Prof. Amon Murwira",
    phone: "+263 4 792 681",
    email: "info@mhte.gov.zw",
    address: "Harare",
    description: "Universities, polytechnics, teachers colleges and vocational training centres",
    cpo: "Prof. S. Chitura (CPO — MOHTE)",
    departments: [
      {
        id: "mohte-univ", name: "University Education", code: "UE", head: "Prof. S. Chitura",
        roles: [
          { title: "Director University Education", level: "Executive", count: 1 },
          { title: "Higher Education Analyst", level: "Senior", count: 4 },
          { title: "University Liaison Officer", level: "Officer", count: 10 },
          { title: "Administrative Officer", level: "Support", count: 8 },
        ],
      },
      {
        id: "mohte-tvet", name: "Technical and Vocational Education", code: "TVET", head: "Mr. B. Dube",
        roles: [
          { title: "Director TVET", level: "Executive", count: 1 },
          { title: "TVET Specialist", level: "Senior", count: 5 },
          { title: "TVET Officer", level: "Officer", count: 15 },
          { title: "Administrative Officer", level: "Support", count: 10 },
        ],
      },
    ],
    stateEntities: [
      { id: "uz", name: "University of Zimbabwe", code: "UZ", type: "State Enterprise", ceo: "Prof. P. Muzondo (Vice-Chancellor)" },
      { id: "nust", name: "National University of Science and Technology", code: "NUST", type: "State Enterprise", ceo: "Prof. E. Bhamu (Vice-Chancellor)" },
      { id: "hit", name: "Harare Institute of Technology", code: "HIT", type: "State Enterprise", ceo: "Dr. F. Hove (Vice-Chancellor)" },
      { id: "msu", name: "Midlands State University", code: "MSU", type: "State Enterprise", ceo: "Prof. A. Dzvimbo (Vice-Chancellor)" },
      { id: "gsu", name: "Great Zimbabwe University", code: "GZU", type: "State Enterprise", ceo: "Prof. T. Washaya (Vice-Chancellor)" },
    ],
  },
  {
    id: "mot",
    name: "Ministry of Transport and Infrastructural Development",
    code: "MOT",
    minister: "Hon. Felix Mhona",
    phone: "+263 4 700 991",
    email: "info@transport.gov.zw",
    address: "Kaguvi Building, 4th Street, Harare",
    description: "Roads, railways, aviation, civil aviation, ZINARA, postal services and infrastructure development",
    cpo: "Eng. R. Choto (CPO — MOT)",
    departments: [
      {
        id: "mot-roads", name: "Roads and Traffic", code: "RT", head: "Eng. T. Ncube",
        roles: [
          { title: "Director Roads", level: "Executive", count: 1 },
          { title: "Chief Roads Engineer", level: "Senior", count: 4 },
          { title: "Roads Engineer", level: "Officer", count: 22 },
          { title: "Road Inspector", level: "Support", count: 50 },
        ],
      },
      {
        id: "mot-rail", name: "Rail and Inland Waterways", code: "RIW", head: "Eng. S. Zimba",
        roles: [
          { title: "Director Rail", level: "Executive", count: 1 },
          { title: "Railway Engineer", level: "Senior", count: 3 },
          { title: "Rail Operations Officer", level: "Officer", count: 12 },
          { title: "Track Maintenance Crew", level: "Support", count: 80 },
        ],
      },
      {
        id: "mot-civil", name: "Civil Aviation", code: "CA", head: "Capt. J. Mawire",
        roles: [
          { title: "Director Civil Aviation", level: "Executive", count: 1 },
          { title: "Air Traffic Controller", level: "Senior", count: 10 },
          { title: "Aviation Safety Officer", level: "Officer", count: 8 },
          { title: "Ground Crew", level: "Support", count: 30 },
        ],
      },
      {
        id: "mot-proj", name: "Infrastructure Projects", code: "IP", head: "Eng. R. Choto",
        roles: [
          { title: "Director Projects", level: "Executive", count: 1 },
          { title: "Project Manager", level: "Senior", count: 6 },
          { title: "Civil Engineer", level: "Officer", count: 18 },
          { title: "Site Supervisor", level: "Support", count: 45 },
        ],
      },
    ],
    stateEntities: [
      { id: "zinara", name: "Zimbabwe National Road Administration", code: "ZINARA", type: "Regulatory Body", ceo: "Mr. D. Nhamo" },
      { id: "nrz", name: "National Railways of Zimbabwe", code: "NRZ", type: "State Enterprise", ceo: "Mr. A. Nhamo" },
      { id: "caaz", name: "Civil Aviation Authority of Zimbabwe", code: "CAAZ", type: "Regulatory Body", ceo: "Mr. D. Mapondera" },
      { id: "zimpost", name: "Zimbabwe Posts", code: "ZIMPOST", type: "State Enterprise", ceo: "Mr. T. Chivango" },
    ],
  },
  {
    id: "moam",
    name: "Ministry of Agriculture, Mechanisation and Irrigation Development",
    code: "MOAM",
    minister: "Hon. Anxious Masuka",
    phone: "+263 4 706 081",
    email: "info@agritex.gov.zw",
    address: "1 Borrowdale Road, Harare",
    description: "Agricultural production, mechanisation, irrigation, food security and farmer support programmes",
    cpo: "Dr. M. Chivasa (CPO — MOAM)",
    departments: [
      {
        id: "moam-agric", name: "Agricultural Production and Extension", code: "APE", head: "Dr. M. Chivasa",
        roles: [
          { title: "Director Agricultural Production", level: "Executive", count: 1 },
          { title: "Senior Agricultural Advisor", level: "Senior", count: 6 },
          { title: "Agricultural Extension Officer", level: "Officer", count: 120 },
          { title: "Agri Demonstrator", level: "Support", count: 200 },
        ],
      },
      {
        id: "moam-irrig", name: "Irrigation Development", code: "IRD", head: "Eng. P. Ncube",
        roles: [
          { title: "Director Irrigation", level: "Executive", count: 1 },
          { title: "Irrigation Engineer", level: "Senior", count: 5 },
          { title: "Irrigation Technician", level: "Officer", count: 25 },
          { title: "Field Crew", level: "Support", count: 60 },
        ],
      },
      {
        id: "moam-mech", name: "Mechanisation and Equipment", code: "ME", head: "Eng. B. Chikwanda",
        roles: [
          { title: "Director Mechanisation", level: "Executive", count: 1 },
          { title: "Agricultural Mechanisation Specialist", level: "Senior", count: 4 },
          { title: "Equipment Officer", level: "Officer", count: 15 },
          { title: "Mechanic", level: "Support", count: 40 },
        ],
      },
    ],
    stateEntities: [
      { id: "agritex", name: "Agricultural Technical and Extension Services", code: "AGRITEX", type: "Development Agency", ceo: "Dr. N. Manyanga" },
      { id: "zfc", name: "Zimbabwe Fertilizer Company", code: "ZFC", type: "State Enterprise", ceo: "Mr. W. Chikwava" },
    ],
  },
  {
    id: "molawr",
    name: "Ministry of Lands, Agriculture, Water and Rural Resettlement",
    code: "MOLAWR",
    minister: "Hon. Anxious Masuka",
    phone: "+263 4 706 081",
    email: "info@lands.gov.zw",
    address: "Ngungunyana Building, Harare",
    description: "Land reform, rural resettlement, water resources management and land administration",
    cpo: "Ms. N. Marufu (CPO — MOLAWR)",
    departments: [
      {
        id: "molawr-land", name: "Land Administration and Survey", code: "LAS", head: "Mr. T. Samhungu",
        roles: [
          { title: "Director Land Administration", level: "Executive", count: 1 },
          { title: "Land Surveyor", level: "Senior", count: 8 },
          { title: "Land Officer", level: "Officer", count: 30 },
          { title: "Land Clerk", level: "Support", count: 40 },
        ],
      },
      {
        id: "molawr-water", name: "Water Resources Management", code: "WRM", head: "Eng. D. Mafunda",
        roles: [
          { title: "Director Water Resources", level: "Executive", count: 1 },
          { title: "Hydrologist", level: "Senior", count: 5 },
          { title: "Water Engineer", level: "Officer", count: 20 },
          { title: "Dam Operator", level: "Support", count: 35 },
        ],
      },
      {
        id: "molawr-resettle", name: "Rural Resettlement", code: "RR", head: "Ms. N. Marufu",
        roles: [
          { title: "Director Resettlement", level: "Executive", count: 1 },
          { title: "Resettlement Officer", level: "Senior", count: 5 },
          { title: "Land Allocation Officer", level: "Officer", count: 22 },
          { title: "Field Officer", level: "Support", count: 45 },
        ],
      },
    ],
    stateEntities: [
      { id: "zmwda", name: "Zimbabwe National Water Authority", code: "ZINWA", type: "Regulatory Body", ceo: "Eng. M. Mabika" },
      { id: "cig", name: "Crops & Irrigation Grant Agency", code: "CIGA", type: "Development Agency", ceo: "Mr. P. Chatora" },
    ],
  },
  {
    id: "mommd",
    name: "Ministry of Mines and Mining Development",
    code: "MOMMD",
    minister: "Hon. Winston Chitando",
    phone: "+263 4 771 944",
    email: "info@mines.gov.zw",
    address: "Zimre Centre, Harare",
    description: "Mining regulation, mineral development, geological surveys and gold marketing",
    cpo: "Mr. T. Mwanza (CPO — MOMMD)",
    departments: [
      {
        id: "mommd-mines", name: "Mines Administration", code: "MA", head: "Mr. T. Mwanza",
        roles: [
          { title: "Director Mines Administration", level: "Executive", count: 1 },
          { title: "Chief Mining Engineer", level: "Senior", count: 4 },
          { title: "Mining Inspector", level: "Officer", count: 20 },
          { title: "Mines Clerk", level: "Support", count: 15 },
        ],
      },
      {
        id: "mommd-geo", name: "Geological Survey", code: "GS", head: "Dr. E. Mambwe",
        roles: [
          { title: "Director Geology", level: "Executive", count: 1 },
          { title: "Senior Geologist", level: "Senior", count: 6 },
          { title: "Geologist", level: "Officer", count: 18 },
          { title: "Lab Technician", level: "Support", count: 12 },
        ],
      },
      {
        id: "mommd-gold", name: "Gold and Precious Minerals", code: "GPM", head: "Mr. C. Hlupeko",
        roles: [
          { title: "Director Gold Marketing", level: "Executive", count: 1 },
          { title: "Senior Gold Officer", level: "Senior", count: 3 },
          { title: "Precious Minerals Officer", level: "Officer", count: 12 },
          { title: "Assay Technician", level: "Support", count: 20 },
        ],
      },
    ],
    stateEntities: [
      { id: "zmdc", name: "Zimbabwe Mining Development Corporation", code: "ZMDC", type: "State Enterprise", ceo: "Mr. M. Muzondo" },
      { id: "fidelity", name: "Fidelity Printers and Refiners", code: "FPR", type: "State Enterprise", ceo: "Mr. C. Chitura" },
      { id: "mmcz", name: "Minerals Marketing Corporation of Zimbabwe", code: "MMCZ", type: "Parastatal", ceo: "Ms. R. Mhangami" },
    ],
  },
  {
    id: "moepd",
    name: "Ministry of Energy and Power Development",
    code: "MOEPD",
    minister: "Hon. Edgar Moyo",
    phone: "+263 4 706 820",
    email: "info@energy.gov.zw",
    address: "Livingstone House, Harare",
    description: "Electricity generation and distribution, energy policy, petroleum regulation, renewable energy",
    cpo: "Eng. B. Nyoni (CPO — MOEPD)",
    departments: [
      {
        id: "moepd-elec", name: "Electricity and Energy", code: "EE", head: "Eng. N. Matambo",
        roles: [
          { title: "Director Electricity", level: "Executive", count: 1 },
          { title: "Power Systems Engineer", level: "Senior", count: 5 },
          { title: "Electrical Engineer", level: "Officer", count: 22 },
          { title: "Electrical Technician", level: "Support", count: 50 },
        ],
      },
      {
        id: "moepd-petrol", name: "Petroleum and Gas", code: "PG", head: "Mr. S. Mathe",
        roles: [
          { title: "Director Petroleum", level: "Executive", count: 1 },
          { title: "Petroleum Engineer", level: "Senior", count: 3 },
          { title: "Petroleum Officer", level: "Officer", count: 10 },
          { title: "Support Officer", level: "Support", count: 8 },
        ],
      },
      {
        id: "moepd-renew", name: "Renewable Energy", code: "RE", head: "Eng. B. Nyoni",
        roles: [
          { title: "Director Renewable Energy", level: "Executive", count: 1 },
          { title: "Solar Energy Specialist", level: "Senior", count: 4 },
          { title: "Renewable Energy Officer", level: "Officer", count: 12 },
          { title: "Field Technician", level: "Support", count: 25 },
        ],
      },
    ],
    stateEntities: [
      { id: "zetdc", name: "Zimbabwe Electricity Transmission & Distribution Company", code: "ZETDC", type: "State Enterprise", ceo: "Eng. J. Chiremba" },
      { id: "zpc", name: "Zimbabwe Power Company", code: "ZPC", type: "State Enterprise", ceo: "Eng. M. Mundoga" },
      { id: "zera", name: "Zimbabwe Energy Regulatory Authority", code: "ZERA", type: "Regulatory Body", ceo: "Mr. E. Mudzengi" },
    ],
  },
  {
    id: "moect",
    name: "Ministry of Environment, Climate and Tourism",
    code: "MOECT",
    minister: "Hon. Nqobizitha Ndlovu",
    phone: "+263 4 707 681",
    email: "info@environment.gov.zw",
    address: "Makombe Complex, Harare",
    description: "Environmental protection, climate change policy, tourism development, wildlife conservation",
    cpo: "Ms. G. Madhuku (CPO — MOECT)",
    departments: [
      {
        id: "moect-env", name: "Environmental Management", code: "EM", head: "Dr. T. Mubvumbi",
        roles: [
          { title: "Director Environment", level: "Executive", count: 1 },
          { title: "Senior Environmental Officer", level: "Senior", count: 5 },
          { title: "Environmental Inspector", level: "Officer", count: 25 },
          { title: "Environmental Technician", level: "Support", count: 30 },
        ],
      },
      {
        id: "moect-climate", name: "Climate Change and Meteorology", code: "CCM", head: "Dr. A. Chikwanda",
        roles: [
          { title: "Director Climate Change", level: "Executive", count: 1 },
          { title: "Meteorologist", level: "Senior", count: 8 },
          { title: "Climate Analyst", level: "Officer", count: 14 },
          { title: "Met Observer", level: "Support", count: 40 },
        ],
      },
      {
        id: "moect-tour", name: "Tourism Development", code: "TD", head: "Ms. G. Madhuku",
        roles: [
          { title: "Director Tourism", level: "Executive", count: 1 },
          { title: "Tourism Development Officer", level: "Senior", count: 6 },
          { title: "Tourism Promotion Officer", level: "Officer", count: 15 },
          { title: "Tourism Facilitator", level: "Support", count: 22 },
        ],
      },
    ],
    stateEntities: [
      { id: "zimra-env", name: "Environmental Management Agency", code: "EMA", type: "Regulatory Body", ceo: "Mr. F. Mutasa" },
      { id: "zpwma", name: "Zimbabwe Parks and Wildlife Management Authority", code: "ZPWMA", type: "Parastatal", ceo: "Mr. F. Marimbe" },
      { id: "ztdc", name: "Zimbabwe Tourism Development Corporation", code: "ZTDC", type: "Development Agency", ceo: "Ms. C. Nyamhunga" },
    ],
  },
  {
    id: "mohach",
    name: "Ministry of Home Affairs and Cultural Heritage",
    code: "MOHACH",
    minister: "Hon. Kazembe Kazembe",
    phone: "+263 4 703 641",
    email: "info@homeaffairs.gov.zw",
    address: "Makombe Complex, Harare",
    description: "Police, immigration, national registration, civil registry, cultural heritage and traditional affairs",
    cpo: "Mr. J. Nhira (CPO — MOHACH)",
    departments: [
      {
        id: "mohach-immig", name: "Immigration", code: "IMM", head: "Mr. J. Nhira",
        roles: [
          { title: "Director Immigration", level: "Executive", count: 1 },
          { title: "Senior Immigration Officer", level: "Senior", count: 8 },
          { title: "Immigration Officer", level: "Officer", count: 120 },
          { title: "Immigration Clerk", level: "Support", count: 80 },
        ],
      },
      {
        id: "mohach-civil", name: "Civil Registry", code: "CR", head: "Ms. T. Chinenyanga",
        roles: [
          { title: "Director Civil Registry", level: "Executive", count: 1 },
          { title: "Senior Registration Officer", level: "Senior", count: 6 },
          { title: "Registration Officer", level: "Officer", count: 80 },
          { title: "Registry Clerk", level: "Support", count: 120 },
        ],
      },
      {
        id: "mohach-culture", name: "Cultural Heritage", code: "CH", head: "Dr. P. Mufunde",
        roles: [
          { title: "Director Culture", level: "Executive", count: 1 },
          { title: "Cultural Heritage Officer", level: "Senior", count: 4 },
          { title: "Heritage Site Manager", level: "Officer", count: 12 },
          { title: "Heritage Guide", level: "Support", count: 25 },
        ],
      },
    ],
    stateEntities: [
      { id: "zrp", name: "Zimbabwe Republic Police", code: "ZRP", type: "Parastatal", ceo: "Commissioner General K. Matanga" },
      { id: "nmmz", name: "National Museums and Monuments of Zimbabwe", code: "NMMZ", type: "Parastatal", ceo: "Dr. G. Matumba" },
    ],
  },
  {
    id: "modwv",
    name: "Ministry of Defence and War Veterans",
    code: "MODWV",
    minister: "Hon. Oppah Muchinguri-Kashiri",
    phone: "+263 4 700 155",
    email: "info@defence.gov.zw",
    address: "Defence House, Harare",
    description: "National defence, Zimbabwe National Army, war veterans affairs and demobilisation",
    cpo: "Maj. Gen. P. Moyo (CPO — MODWV)",
    departments: [
      {
        id: "modwv-def", name: "Defence Administration", code: "DA", head: "Maj. Gen. P. Moyo",
        roles: [
          { title: "Permanent Secretary", level: "Executive", count: 1 },
          { title: "Defence Advisor", level: "Senior", count: 4 },
          { title: "Administrative Officer", level: "Officer", count: 15 },
          { title: "Administrative Clerk", level: "Support", count: 20 },
        ],
      },
      {
        id: "modwv-wv", name: "War Veterans Administration", code: "WVA", head: "Mr. C. Mutinhiri",
        roles: [
          { title: "Director War Veterans", level: "Executive", count: 1 },
          { title: "War Veterans Welfare Officer", level: "Senior", count: 5 },
          { title: "Benefits Officer", level: "Officer", count: 18 },
          { title: "Records Clerk", level: "Support", count: 15 },
        ],
      },
    ],
    stateEntities: [
      { id: "dmi", name: "Defence Industries", code: "DI", type: "State Enterprise", ceo: "Brig. Gen. T. Muzenda" },
    ],
  },
  {
    id: "mofait",
    name: "Ministry of Foreign Affairs and International Trade",
    code: "MOFAIT",
    minister: "Hon. Frederick Shava",
    phone: "+263 4 727 005",
    email: "info@foreign.gov.zw",
    address: "Munhumutapa Building, Harare",
    description: "Diplomatic relations, foreign missions, international trade negotiations and treaty management",
    cpo: "Amb. T. Chikwanda (CPO — MOFAIT)",
    departments: [
      {
        id: "mofait-diplo", name: "Diplomatic and Consular Services", code: "DCS", head: "Amb. T. Chikwanda",
        roles: [
          { title: "Director Diplomatic Services", level: "Executive", count: 1 },
          { title: "Ambassador", level: "Senior", count: 30 },
          { title: "First Secretary", level: "Officer", count: 50 },
          { title: "Consular Officer", level: "Support", count: 60 },
        ],
      },
      {
        id: "mofait-trade", name: "International Trade", code: "IT", head: "Ms. N. Dube",
        roles: [
          { title: "Director International Trade", level: "Executive", count: 1 },
          { title: "Trade Negotiator", level: "Senior", count: 6 },
          { title: "Trade Officer", level: "Officer", count: 15 },
          { title: "Trade Clerk", level: "Support", count: 10 },
        ],
      },
    ],
    stateEntities: [
      { id: "zimtrade-fa", name: "Zimbabwe Investment and Development Agency", code: "ZIDA", type: "Development Agency", ceo: "Mr. W. Chitando" },
    ],
  },
  {
    id: "mojlpa",
    name: "Ministry of Justice, Legal and Parliamentary Affairs",
    code: "MOJLPA",
    minister: "Hon. Ziyambi Ziyambi",
    phone: "+263 4 774 620",
    email: "info@justice.gov.zw",
    address: "Old Mutual Building, Harare",
    description: "Legal affairs, judicial administration, law reform, constitutional development and parliamentary affairs",
    cpo: "Mr. M. Chinhengo (CPO — MOJLPA)",
    departments: [
      {
        id: "mojlpa-legal", name: "Legal Administration", code: "LA", head: "Mr. M. Chinhengo",
        roles: [
          { title: "Director Legal Administration", level: "Executive", count: 1 },
          { title: "State Counsel", level: "Senior", count: 12 },
          { title: "Legal Officer", level: "Officer", count: 25 },
          { title: "Paralegal", level: "Support", count: 20 },
        ],
      },
      {
        id: "mojlpa-parl", name: "Parliamentary Affairs", code: "PA", head: "Mr. G. Mutema",
        roles: [
          { title: "Director Parliamentary Affairs", level: "Executive", count: 1 },
          { title: "Parliamentary Liaison Officer", level: "Senior", count: 4 },
          { title: "Parliamentary Officer", level: "Officer", count: 10 },
          { title: "Clerk", level: "Support", count: 12 },
        ],
      },
      {
        id: "mojlpa-law", name: "Law Reform Commission", code: "LRC", head: "Prof. L. Madhuku",
        roles: [
          { title: "Director Law Reform", level: "Executive", count: 1 },
          { title: "Legal Researcher", level: "Senior", count: 8 },
          { title: "Law Officer", level: "Officer", count: 15 },
          { title: "Legal Clerk", level: "Support", count: 10 },
        ],
      },
    ],
    stateEntities: [
      { id: "zlrc", name: "Zimbabwe Law Reform Commission", code: "ZLRC", type: "Regulatory Body", ceo: "Prof. L. Madhuku" },
    ],
  },
  {
    id: "mopslsw",
    name: "Ministry of Public Service, Labour and Social Welfare",
    code: "MOPSLSW",
    minister: "Hon. Paul Mavima",
    phone: "+263 4 793 481",
    email: "info@publicservice.gov.zw",
    address: "Compensation House, Harare",
    description: "Public service management, labour relations, social welfare, social protection and poverty reduction",
    cpo: "Ms. N. Mushayandebvu (CPO — MOPSLSW)",
    departments: [
      {
        id: "mopslsw-ps", name: "Public Service Commission", code: "PSC", head: "Ms. N. Mushayandebvu",
        roles: [
          { title: "Director Public Service", level: "Executive", count: 1 },
          { title: "HR Director", level: "Senior", count: 5 },
          { title: "HR Officer", level: "Officer", count: 30 },
          { title: "HR Clerk", level: "Support", count: 40 },
        ],
      },
      {
        id: "mopslsw-labour", name: "Labour Relations", code: "LR", head: "Mr. T. Murambiwa",
        roles: [
          { title: "Director Labour", level: "Executive", count: 1 },
          { title: "Labour Relations Officer", level: "Senior", count: 8 },
          { title: "Labour Inspector", level: "Officer", count: 40 },
          { title: "Labour Clerk", level: "Support", count: 25 },
        ],
      },
      {
        id: "mopslsw-sw", name: "Social Welfare", code: "SW", head: "Ms. A. Chiweza",
        roles: [
          { title: "Director Social Welfare", level: "Executive", count: 1 },
          { title: "Social Welfare Officer", level: "Senior", count: 10 },
          { title: "Social Worker", level: "Officer", count: 80 },
          { title: "Community Care Worker", level: "Support", count: 200 },
        ],
      },
    ],
    stateEntities: [
      { id: "nssa", name: "National Social Security Authority", code: "NSSA", type: "Parastatal", ceo: "Mr. A. Madzorera" },
      { id: "nec", name: "National Employment Council", code: "NEC", type: "Regulatory Body", ceo: "Mr. B. Mahachi" },
    ],
  },
  {
    id: "moipbs",
    name: "Ministry of Information, Publicity and Broadcasting Services",
    code: "MOIPBS",
    minister: "Hon. Monica Mutsvangwa",
    phone: "+263 4 703 891",
    email: "info@information.gov.zw",
    address: "Linquenda House, Harare",
    description: "Public information, broadcasting, state media, publications and government communications",
    cpo: "Mr. N. Mushangwe (CPO — MOIPBS)",
    departments: [
      {
        id: "moipbs-broadcast", name: "Broadcasting Services", code: "BS", head: "Mr. D. Mwonzora",
        roles: [
          { title: "Director Broadcasting", level: "Executive", count: 1 },
          { title: "Broadcasting Regulator", level: "Senior", count: 5 },
          { title: "Content Officer", level: "Officer", count: 15 },
          { title: "Broadcast Technician", level: "Support", count: 30 },
        ],
      },
      {
        id: "moipbs-comms", name: "Government Communications", code: "GC", head: "Mr. N. Mushangwe",
        roles: [
          { title: "Director Communications", level: "Executive", count: 1 },
          { title: "Senior Communications Officer", level: "Senior", count: 5 },
          { title: "Communications Officer", level: "Officer", count: 18 },
          { title: "Media Liaison Officer", level: "Support", count: 12 },
        ],
      },
    ],
    stateEntities: [
      { id: "zbc", name: "Zimbabwe Broadcasting Corporation", code: "ZBC", type: "State Enterprise", ceo: "Mr. S. Siziba" },
      { id: "herald", name: "Zimbabwe Newspapers Group", code: "ZIMPAPERS", type: "State Enterprise", ceo: "Mr. G. Chikwanda" },
      { id: "baz", name: "Broadcasting Authority of Zimbabwe", code: "BAZ", type: "Regulatory Body", ceo: "Mr. T. Mandizha" },
    ],
  },
  {
    id: "molgpw",
    name: "Ministry of Local Government and Public Works",
    code: "MOLGPW",
    minister: "Hon. July Moyo",
    phone: "+263 4 706 671",
    email: "info@localgovernment.gov.zw",
    address: "Makombe Complex, Harare",
    description: "Local authority oversight, urban and rural councils, public works and government buildings",
    cpo: "Eng. T. Chimutengo (CPO — MOLGPW)",
    departments: [
      {
        id: "molgpw-local", name: "Local Authorities", code: "LA", head: "Mr. B. Chirinda",
        roles: [
          { title: "Director Local Authorities", level: "Executive", count: 1 },
          { title: "Local Government Inspector", level: "Senior", count: 8 },
          { title: "Local Government Officer", level: "Officer", count: 35 },
          { title: "Administrative Clerk", level: "Support", count: 30 },
        ],
      },
      {
        id: "molgpw-pw", name: "Public Works", code: "PW", head: "Eng. T. Chimutengo",
        roles: [
          { title: "Director Public Works", level: "Executive", count: 1 },
          { title: "Chief Civil Engineer", level: "Senior", count: 5 },
          { title: "Civil Engineer", level: "Officer", count: 30 },
          { title: "Artisan", level: "Support", count: 80 },
        ],
      },
      {
        id: "molgpw-urban", name: "Urban Development", code: "UD", head: "Mr. P. Gumbo",
        roles: [
          { title: "Director Urban Development", level: "Executive", count: 1 },
          { title: "Urban Planner", level: "Senior", count: 6 },
          { title: "Town Planning Officer", level: "Officer", count: 20 },
          { title: "Building Inspector", level: "Support", count: 35 },
        ],
      },
    ],
    stateEntities: [
      { id: "zinara-lg", name: "City of Harare", code: "CHC", type: "Local Authority", ceo: "Town Clerk Mr. L. Zvobgo" },
      { id: "bulawayo", name: "City of Bulawayo", code: "CBC", type: "Local Authority", ceo: "Town Clerk Mr. C. Dube" },
    ],
  },
  {
    id: "mowacs",
    name: "Ministry of Women Affairs, Community, SMEs and Cooperative Development",
    code: "MOWACS",
    minister: "Hon. Sithembiso Nyoni",
    phone: "+263 4 771 381",
    email: "info@women.gov.zw",
    address: "Kaguvi Building, Harare",
    description: "Women empowerment, SME development, cooperative societies and community development",
    cpo: "Ms. T. Museka (CPO — MOWACS)",
    departments: [
      {
        id: "mowacs-women", name: "Women Empowerment", code: "WE", head: "Ms. T. Museka",
        roles: [
          { title: "Director Women Empowerment", level: "Executive", count: 1 },
          { title: "Women Development Officer", level: "Senior", count: 6 },
          { title: "Gender Officer", level: "Officer", count: 22 },
          { title: "Community Facilitator", level: "Support", count: 60 },
        ],
      },
      {
        id: "mowacs-sme", name: "SME Development", code: "SME", head: "Mr. D. Chirwa",
        roles: [
          { title: "Director SMEs", level: "Executive", count: 1 },
          { title: "Business Development Officer", level: "Senior", count: 5 },
          { title: "SME Liaison Officer", level: "Officer", count: 18 },
          { title: "Business Advisor", level: "Support", count: 30 },
        ],
      },
      {
        id: "mowacs-coop", name: "Cooperative Development", code: "CD", head: "Ms. B. Mpofu",
        roles: [
          { title: "Director Cooperatives", level: "Executive", count: 1 },
          { title: "Cooperative Inspector", level: "Senior", count: 6 },
          { title: "Cooperative Officer", level: "Officer", count: 20 },
          { title: "Field Agent", level: "Support", count: 40 },
        ],
      },
    ],
    stateEntities: [
      { id: "smedco", name: "Small and Medium Enterprises Development Corporation", code: "SMEDCO", type: "Development Agency", ceo: "Ms. T. Mhene" },
    ],
  },
  {
    id: "moyedvt",
    name: "Ministry of Youth Empowerment, Development and Vocational Training",
    code: "MOYEDVT",
    minister: "Hon. Tino Machakaire",
    phone: "+263 4 792 741",
    email: "info@youth.gov.zw",
    address: "Kaguvi Building, Harare",
    description: "Youth development, vocational training, skills development and youth enterprise",
    cpo: "Ms. A. Muzondo (CPO — MOYEDVT)",
    departments: [
      {
        id: "moyedvt-youth", name: "Youth Development", code: "YD", head: "Mr. T. Makoni",
        roles: [
          { title: "Director Youth", level: "Executive", count: 1 },
          { title: "Youth Development Officer", level: "Senior", count: 8 },
          { title: "Youth Officer", level: "Officer", count: 35 },
          { title: "Youth Facilitator", level: "Support", count: 80 },
        ],
      },
      {
        id: "moyedvt-vt", name: "Vocational Training", code: "VT", head: "Ms. A. Muzondo",
        roles: [
          { title: "Director Vocational Training", level: "Executive", count: 1 },
          { title: "Vocational Training Specialist", level: "Senior", count: 5 },
          { title: "Vocational Trainer", level: "Officer", count: 40 },
          { title: "Workshop Instructor", level: "Support", count: 60 },
        ],
      },
    ],
    stateEntities: [
      { id: "zimdef", name: "Zimbabwe Manpower Development Fund", code: "ZIMDEF", type: "Development Agency", ceo: "Mr. B. Nyambuya" },
    ],
  },
  {
    id: "moict",
    name: "Ministry of ICT, Postal and Courier Services",
    code: "MOICT",
    minister: "Hon. Jenfan Muswere",
    phone: "+263 4 795 421",
    email: "info@ict.gov.zw",
    address: "Munhumutapa Building, Harare",
    description: "ICT policy, telecommunications regulation, postal services and digital economy development",
    cpo: "Mr. T. Chinyanga (CPO — MOICT)",
    departments: [
      {
        id: "moict-ict", name: "ICT Policy and Development", code: "ICTPD", head: "Mr. T. Chinyanga",
        roles: [
          { title: "Director ICT", level: "Executive", count: 1 },
          { title: "ICT Policy Specialist", level: "Senior", count: 5 },
          { title: "ICT Officer", level: "Officer", count: 18 },
          { title: "ICT Support Technician", level: "Support", count: 20 },
        ],
      },
      {
        id: "moict-postal", name: "Postal and Courier Services", code: "PCS", head: "Ms. R. Ndororo",
        roles: [
          { title: "Director Postal Services", level: "Executive", count: 1 },
          { title: "Postal Operations Manager", level: "Senior", count: 4 },
          { title: "Postal Inspector", level: "Officer", count: 15 },
          { title: "Postmaster", level: "Support", count: 60 },
        ],
      },
      {
        id: "moict-digital", name: "Digital Economy and E-Government", code: "DEG", head: "Mr. S. Mutuwa",
        roles: [
          { title: "Director Digital Economy", level: "Executive", count: 1 },
          { title: "Digital Transformation Advisor", level: "Senior", count: 4 },
          { title: "E-Government Officer", level: "Officer", count: 12 },
          { title: "Digital Support Officer", level: "Support", count: 15 },
        ],
      },
    ],
    stateEntities: [
      { id: "telone", name: "TelOne", code: "TELONE", type: "State Enterprise", ceo: "Mr. P. Denhere" },
      { id: "netone", name: "NetOne Cellular", code: "NETONE", type: "State Enterprise", ceo: "Mr. D. Mushayabasa" },
      { id: "powertel", name: "Powertel Communications", code: "POWERTEL", type: "State Enterprise", ceo: "Mr. T. Dube" },
      { id: "potraz", name: "Postal and Telecommunications Regulatory Authority", code: "POTRAZ", type: "Regulatory Body", ceo: "Mr. D. Mandava" },
    ],
  },
  {
    id: "moiac",
    name: "Ministry of Industry and Commerce",
    code: "MOIAC",
    minister: "Hon. Sekai Nzenza",
    phone: "+263 4 702 731",
    email: "info@industry.gov.zw",
    address: "Mukwati Building, Harare",
    description: "Industrial development, trade and commerce, consumer protection, standards and quality",
    cpo: "Mr. C. Machingauta (CPO — MOIAC)",
    departments: [
      {
        id: "moiac-ind", name: "Industrial Development", code: "ID", head: "Mr. C. Machingauta",
        roles: [
          { title: "Director Industrial Development", level: "Executive", count: 1 },
          { title: "Industrial Economist", level: "Senior", count: 5 },
          { title: "Industrial Officer", level: "Officer", count: 20 },
          { title: "Industrial Inspector", level: "Support", count: 25 },
        ],
      },
      {
        id: "moiac-trade", name: "Trade and Commerce", code: "TC", head: "Ms. T. Mabunda",
        roles: [
          { title: "Director Trade", level: "Executive", count: 1 },
          { title: "Trade Officer", level: "Senior", count: 6 },
          { title: "Commerce Officer", level: "Officer", count: 18 },
          { title: "Trade Clerk", level: "Support", count: 15 },
        ],
      },
      {
        id: "moiac-consumer", name: "Consumer Protection", code: "CP", head: "Mr. P. Makanda",
        roles: [
          { title: "Director Consumer Protection", level: "Executive", count: 1 },
          { title: "Consumer Rights Officer", level: "Senior", count: 5 },
          { title: "Consumer Inspector", level: "Officer", count: 20 },
          { title: "Consumer Clerk", level: "Support", count: 15 },
        ],
      },
    ],
    stateEntities: [
      { id: "zimtrade", name: "ZimTrade", code: "ZIMTRADE", type: "Development Agency", ceo: "Mr. A. Masuka" },
      { id: "sirdc", name: "Scientific and Industrial Research and Development Centre", code: "SIRDC", type: "Parastatal", ceo: "Dr. P. Mukwewa" },
      { id: "saz", name: "Standards Association of Zimbabwe", code: "SAZ", type: "Regulatory Body", ceo: "Mr. R. Machingura" },
    ],
  },
  {
    id: "opc",
    name: "Office of the President and Cabinet",
    code: "OPC",
    minister: "H.E. President E.D. Mnangagwa",
    phone: "+263 4 707 401",
    email: "info@cabinet.gov.zw",
    address: "Munhumutapa Building, Harare",
    description: "Cabinet secretariat, policy coordination, national procurement oversight, anti-corruption and state security",
    cpo: "Mr. T. Moyo (CPO — OPC)",
    departments: [
      {
        id: "opc-cabinet", name: "Cabinet Secretariat", code: "CS", head: "Dr. C. Mutisi",
        roles: [
          { title: "Cabinet Secretary", level: "Executive", count: 1 },
          { title: "Deputy Cabinet Secretary", level: "Senior", count: 2 },
          { title: "Cabinet Officer", level: "Officer", count: 15 },
          { title: "Administrative Officer", level: "Support", count: 20 },
        ],
      },
      {
        id: "opc-proc", name: "Procurement Regulatory Authority", code: "PRAZ-SEC", head: "Mr. T. Moyo",
        roles: [
          { title: "Director General PRAZ", level: "Executive", count: 1 },
          { title: "Chief Procurement Officer", level: "Senior", count: 4 },
          { title: "Procurement Regulator", level: "Officer", count: 20 },
          { title: "Compliance Officer", level: "Support", count: 15 },
        ],
      },
      {
        id: "opc-intelligence", name: "Intelligence Services", code: "IS", head: "Dir. (Classified)",
        roles: [
          { title: "Director General", level: "Executive", count: 1 },
          { title: "Senior Intelligence Officer", level: "Senior", count: 8 },
          { title: "Intelligence Officer", level: "Officer", count: 30 },
          { title: "Field Officer", level: "Support", count: 60 },
        ],
      },
    ],
    stateEntities: [
      { id: "praz", name: "Procurement Regulatory Authority of Zimbabwe", code: "PRAZ", type: "Regulatory Body", ceo: "Mr. T. Nhemachena" },
      { id: "zacc", name: "Zimbabwe Anti-Corruption Commission", code: "ZACC", type: "Regulatory Body", ceo: "Ms. L. Gwindi" },
      { id: "ncz", name: "National Competitiveness Commission", code: "NCC", type: "Regulatory Body", ceo: "Mr. B. Mumpande" },
    ],
  },
];

// Helper: get ministry by ID
export function getMinistryById(id: string): ZWMinistry | undefined {
  return ZW_MINISTRIES.find((m) => m.id === id);
}

// Helper: get all ministry names for dropdowns
export function getMinistryOptions() {
  return ZW_MINISTRIES.map((m) => ({ value: m.id, label: m.name, code: m.code }));
}

// Helper: get departments for a ministry
export function getDepartmentsForMinistry(ministryId: string): ZWDepartment[] {
  return ZW_MINISTRIES.find((m) => m.id === ministryId)?.departments ?? [];
}
