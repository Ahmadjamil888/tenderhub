/**
 * budget-hierarchy-data.ts
 *
 * 5-level government budget hierarchy data model
 *
 * Level 1 — All Ministry    (aggregate / national view)
 * Level 2 — Ministry        (e.g. Ministry of Education, Ministry of Health)
 * Level 3 — Department/SOE  (e.g. Dept of Child Welfare, Dept of Pharmacy)
 * Level 4 — Centers Budget  (individual institutions: School A, Hospital B)
 * Level 5 — Cell Budget     (operational units: School Kitchen, Hospital Ward)
 */

export type BudgetLevel = "all" | "ministry" | "department" | "center" | "cell";

export type BudgetNode = {
  id: string;
  name: string;
  level: BudgetLevel;
  parentId: string | null;
  ministry: string;           // top-level ministry label for colouring
  approved: number;           // USD thousands
  spent: number;
  committed: number;
  status: "Active" | "At Risk" | "Frozen" | "Over Budget";
  children?: BudgetNode[];    // populated at runtime
};

// ─── Raw flat data ─────────────────────────────────────────────────────────

const RAW: Omit<BudgetNode, "children">[] = [

  // ── Level 1 ───────────────────────────────────────────────────────────────
  {
    id: "all",
    name: "All Government Ministries",
    level: "all",
    parentId: null,
    ministry: "all",
    approved: 4_800_000,
    spent: 2_760_000,
    committed: 620_000,
    status: "Active",
  },

  // ── Level 2 — Ministries ──────────────────────────────────────────────────
  {
    id: "min-edu",
    name: "Ministry of Education",
    level: "ministry",
    parentId: "all",
    ministry: "education",
    approved: 510_000,
    spent: 289_000,
    committed: 72_000,
    status: "Active",
  },
  {
    id: "min-health",
    name: "Ministry of Health & Child Care",
    level: "ministry",
    parentId: "all",
    ministry: "health",
    approved: 820_000,
    spent: 542_000,
    committed: 124_000,
    status: "Active",
  },
  {
    id: "min-finance",
    name: "Ministry of Finance",
    level: "ministry",
    parentId: "all",
    ministry: "finance",
    approved: 640_000,
    spent: 381_000,
    committed: 98_000,
    status: "Active",
  },
  {
    id: "min-transport",
    name: "Ministry of Transport",
    level: "ministry",
    parentId: "all",
    ministry: "transport",
    approved: 430_000,
    spent: 198_000,
    committed: 88_000,
    status: "Active",
  },

  // ── Level 3 — Departments under Education ─────────────────────────────────
  {
    id: "dept-edu-welfare",
    name: "Department of Child Welfare",
    level: "department",
    parentId: "min-edu",
    ministry: "education",
    approved: 80_000,
    spent: 44_000,
    committed: 10_000,
    status: "Active",
  },
  {
    id: "dept-edu-sports",
    name: "Department of Sports",
    level: "department",
    parentId: "min-edu",
    ministry: "education",
    approved: 60_000,
    spent: 30_000,
    committed: 8_000,
    status: "Active",
  },
  {
    id: "dept-edu-learning",
    name: "Department of Learning",
    level: "department",
    parentId: "min-edu",
    ministry: "education",
    approved: 200_000,
    spent: 130_000,
    committed: 32_000,
    status: "Active",
  },
  {
    id: "dept-edu-facilities",
    name: "Department of Learning Facilities",
    level: "department",
    parentId: "min-edu",
    ministry: "education",
    approved: 170_000,
    spent: 85_000,
    committed: 22_000,
    status: "At Risk",
  },

  // ── Level 3 — Departments under Health ────────────────────────────────────
  {
    id: "dept-health-pharmacy",
    name: "Department of Pharmacy",
    level: "department",
    parentId: "min-health",
    ministry: "health",
    approved: 120_000,
    spent: 72_000,
    committed: 24_000,
    status: "Active",
  },
  {
    id: "dept-health-bedding",
    name: "Department of Bedding / Ward",
    level: "department",
    parentId: "min-health",
    ministry: "health",
    approved: 90_000,
    spent: 60_000,
    committed: 18_000,
    status: "Active",
  },
  {
    id: "dept-health-radiology",
    name: "Department of Radiology",
    level: "department",
    parentId: "min-health",
    ministry: "health",
    approved: 140_000,
    spent: 98_000,
    committed: 28_000,
    status: "At Risk",
  },
  {
    id: "dept-health-paediatrics",
    name: "Department of Paediatrician",
    level: "department",
    parentId: "min-health",
    ministry: "health",
    approved: 110_000,
    spent: 60_000,
    committed: 20_000,
    status: "Active",
  },

  // ── Level 4 — Centers under Education (schools) ───────────────────────────
  {
    id: "center-school-a",
    name: "School A",
    level: "center",
    parentId: "dept-edu-learning",
    ministry: "education",
    approved: 95_000,
    spent: 62_000,
    committed: 14_000,
    status: "Active",
  },
  {
    id: "center-school-b",
    name: "School B",
    level: "center",
    parentId: "dept-edu-learning",
    ministry: "education",
    approved: 88_000,
    spent: 50_000,
    committed: 12_000,
    status: "Active",
  },

  // ── Level 4 — Centers under Health (hospitals) ────────────────────────────
  {
    id: "center-hospital-a",
    name: "Hospital A",
    level: "center",
    parentId: "dept-health-pharmacy",
    ministry: "health",
    approved: 58_000,
    spent: 36_000,
    committed: 10_000,
    status: "Active",
  },
  {
    id: "center-hospital-b",
    name: "Hospital B",
    level: "center",
    parentId: "dept-health-pharmacy",
    ministry: "health",
    approved: 50_000,
    spent: 28_000,
    committed: 8_000,
    status: "Active",
  },

  // ── Level 5 — Cells under School A ────────────────────────────────────────
  {
    id: "cell-school-a-grounds",
    name: "School Grounds",
    level: "cell",
    parentId: "center-school-a",
    ministry: "education",
    approved: 15_000,
    spent: 10_000,
    committed: 2_000,
    status: "Active",
  },
  {
    id: "cell-school-a-materials",
    name: "School Learning Materials",
    level: "cell",
    parentId: "center-school-a",
    ministry: "education",
    approved: 30_000,
    spent: 22_000,
    committed: 5_000,
    status: "Active",
  },
  {
    id: "cell-school-a-buildings",
    name: "School Buildings",
    level: "cell",
    parentId: "center-school-a",
    ministry: "education",
    approved: 35_000,
    spent: 20_000,
    committed: 6_000,
    status: "Active",
  },
  {
    id: "cell-school-a-kitchen",
    name: "School Kitchen",
    level: "cell",
    parentId: "center-school-a",
    ministry: "education",
    approved: 15_000,
    spent: 10_000,
    committed: 1_000,
    status: "Active",
  },

  // ── Level 5 — Cells under Hospital A ─────────────────────────────────────
  {
    id: "cell-hospital-a-kitchen",
    name: "Hospital Kitchen",
    level: "cell",
    parentId: "center-hospital-a",
    ministry: "health",
    approved: 10_000,
    spent: 7_000,
    committed: 2_000,
    status: "Active",
  },
  {
    id: "cell-hospital-a-radiology",
    name: "Hospital Radiology",
    level: "cell",
    parentId: "center-hospital-a",
    ministry: "health",
    approved: 18_000,
    spent: 14_000,
    committed: 3_000,
    status: "At Risk",
  },
  {
    id: "cell-hospital-a-cardiology",
    name: "Hospital Cardiology",
    level: "cell",
    parentId: "center-hospital-a",
    ministry: "health",
    approved: 20_000,
    spent: 10_000,
    committed: 3_000,
    status: "Active",
  },
  {
    id: "cell-hospital-a-wards",
    name: "Hospital Wards",
    level: "cell",
    parentId: "center-hospital-a",
    ministry: "health",
    approved: 10_000,
    spent: 5_000,
    committed: 2_000,
    status: "Active",
  },
];

// ─── Build the tree from flat list ────────────────────────────────────────

function buildTree(flat: Omit<BudgetNode, "children">[]): BudgetNode[] {
  const map = new Map<string, BudgetNode>();
  flat.forEach(n => map.set(n.id, { ...n, children: [] }));
  const roots: BudgetNode[] = [];
  map.forEach(node => {
    if (node.parentId === null) {
      roots.push(node);
    } else {
      const parent = map.get(node.parentId);
      if (parent) parent.children!.push(node);
    }
  });
  return roots;
}

export const BUDGET_TREE: BudgetNode[] = buildTree(RAW);
export const BUDGET_FLAT: BudgetNode[] = RAW.map(n => ({ ...n, children: [] }));

// ─── Helpers ─────────────────────────────────────────────────────────────

export const LEVEL_LABELS: Record<BudgetLevel, string> = {
  all:        "All Ministry",
  ministry:   "Ministry",
  department: "Department / SOE",
  center:     "Centers Budget",
  cell:       "Cell Budget",
};

export const LEVEL_ORDER: BudgetLevel[] = ["all", "ministry", "department", "center", "cell"];

export const MINISTRY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  all:        { bg: "bg-slate-100",   text: "text-slate-700",   dot: "#64748b" },
  education:  { bg: "bg-blue-50",     text: "text-blue-700",    dot: "#3b82f6" },
  health:     { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "#10b981" },
  finance:    { bg: "bg-violet-50",   text: "text-violet-700",  dot: "#8b5cf6" },
  transport:  { bg: "bg-amber-50",    text: "text-amber-700",   dot: "#f59e0b" },
};

export function pctUsed(node: BudgetNode): number {
  if (!node.approved) return 0;
  return Math.round(((node.spent + node.committed) / node.approved) * 100);
}

export function available(node: BudgetNode): number {
  return Math.max(0, node.approved - node.spent - node.committed);
}

export function formatK(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)     return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}
