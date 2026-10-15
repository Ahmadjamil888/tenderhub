/**
 * ministry-context.tsx
 * Dynamic multi-ministry context — no hardcoded ministry names.
 * Derives the ministry/dept list from ZW_MINISTRIES (full government structure).
 */
import { createContext, useContext, useState, ReactNode } from "react";
import { ZW_MINISTRIES } from "@/lib/zw-ministries";

// Re-export ministry list derived from ZW_MINISTRIES for backwards-compat
export const MINISTRIES = ZW_MINISTRIES.map(m => ({
  id:        m.id,
  name:      m.name,
  shortName: m.code,
  badge:     "🏛️",
  departments: m.departments,
  stateEntities: m.stateEntities,
}));

// Legacy simple list kept for components that only need id/name/shortName/badge
export const MINISTRY_LIST = [
  ...MINISTRIES,
  { id: "prime", name: "Prime Entity (Super Admin)", shortName: "PRAZ", badge: "🏛️", departments: [], stateEntities: [] },
];

type MinistryContextType = {
  currentMinistryId: string | null;
  setCurrentMinistry: (id: string | null) => void;
  currentDeptId: string | null;
  setCurrentDept: (id: string | null) => void;
  /** Resolved ministry name for display in context headers */
  currentMinistryName: string;
  /** Resolved department name for display */
  currentDeptName: string;
  /** All departments for the selected ministry */
  currentDepartments: Array<{ id: string; name: string; code: string; head: string }>;
};

const MinistryContext = createContext<MinistryContextType | null>(null);

export function MinistryProvider({ children }: { children: ReactNode }) {
  const [currentMinistryId, setCurrentMinistryId] = useState<string | null>(null);
  const [currentDeptId, setCurrentDeptId]         = useState<string | null>(null);

  const setCurrentMinistry = (id: string | null) => {
    setCurrentMinistryId(id);
    setCurrentDeptId(null);  // reset dept when ministry changes
  };
  const setCurrentDept = (id: string | null) => setCurrentDeptId(id);

  const foundMinistry  = MINISTRIES.find(m => m.id === currentMinistryId);
  const currentMinistryName = foundMinistry?.name ?? "Government of Zimbabwe";

  const currentDepartments = (foundMinistry?.departments ?? []) as Array<{ id: string; name: string; code: string; head: string }>;
  const foundDept      = currentDepartments.find(d => d.id === currentDeptId);
  const currentDeptName = foundDept?.name ?? "";

  return (
    <MinistryContext.Provider value={{
      currentMinistryId, setCurrentMinistry,
      currentDeptId, setCurrentDept,
      currentMinistryName, currentDeptName,
      currentDepartments,
    }}>
      {children}
    </MinistryContext.Provider>
  );
}

export function useMinistry() {
  const ctx = useContext(MinistryContext);
  if (!ctx) throw new Error("useMinistry must be inside MinistryProvider");
  return ctx;
}
