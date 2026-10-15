/**
 * STRICT ENTERPRISE THEME SYSTEM
 * 
 * This is the ONLY color palette allowed in the entire application.
 * 
 * Allowed Colors:
 * - Primary: #0F172A (navy/slate-900)
 * - Secondary: #FFFFFF (white)
 * 
 * ABSOLUTELY NO:
 * - Gradients
 * - Purple, Green, Yellow, Orange, Pink
 * - Red except for destructive/critical errors
 * - Random accent colors
 * - Multi-color dashboards
 */

export const THEME = {
  // ── Core Colors ──────────────────────────────────────────────────────────
  PRIMARY: "#0F172A",   // Navy - use for text, icons, buttons, borders
  SECONDARY: "#FFFFFF", // White - use for backgrounds, cards

  // ── Shades of Primary (for depth and hierarchy) ─────────────────────────
  PRIMARY_50: "#F8FAFC",   // Lightest - hover states, subtle backgrounds
  PRIMARY_100: "#F1F5F9",  // Very light - secondary backgrounds
  PRIMARY_200: "#E2E8F0",  // Light - borders, dividers
  PRIMARY_300: "#CBD5E1",  // Medium light - disabled states
  PRIMARY_400: "#94A3B8",  // Medium - muted text
  PRIMARY_500: "#64748B",  // Medium dark - secondary text
  PRIMARY_600: "#475569",  // Dark - active elements
  PRIMARY_700: "#334155",  // Darker - strong emphasis
  PRIMARY_800: "#1E293B",  // Very dark - strong backgrounds
  PRIMARY_900: "#0F172A",  // Darkest - primary (matches PRIMARY)

  // ── Opacity Values (for transparent overlays) ────────────────────────────
  OPACITY_5: "rgba(15, 23, 42, 0.05)",
  OPACITY_8: "rgba(15, 23, 42, 0.08)",
  OPACITY_10: "rgba(15, 23, 42, 0.10)",
  OPACITY_20: "rgba(15, 23, 42, 0.20)",
  OPACITY_30: "rgba(15, 23, 42, 0.30)",
  OPACITY_40: "rgba(15, 23, 42, 0.40)",
  OPACITY_50: "rgba(15, 23, 42, 0.50)",
  OPACITY_60: "rgba(15, 23, 42, 0.60)",
  OPACITY_70: "rgba(15, 23, 42, 0.70)",
  OPACITY_80: "rgba(15, 23, 42, 0.80)",
  OPACITY_90: "rgba(15, 23, 42, 0.90)",

  // ── Red for Critical/Destructive ONLY ────────────────────────────────────
  ERROR: "#DC2626",     // Red-600 - critical errors only
  ERROR_LIGHT: "#FEE2E2", // Red-50 - error backgrounds
  ERROR_DARK: "#991B1B",  // Red-800 - strong error emphasis

  // ── Background Colors ─────────────────────────────────────────────────────
  BG_PAGE: "#FFFFFF",           // Main page background
  BG_CARD: "#FFFFFF",           // Card backgrounds
  BG_HOVER: "#F8FAFC",          // Hover states
  BG_ACTIVE: "#F1F5F9",         // Active states
  BG_DISABLED: "#F1F5F9",       // Disabled states
  BG_SELECTED: "#E2E8F0",       // Selected items

  // ── Text Colors ───────────────────────────────────────────────────────────
  TEXT_PRIMARY: "#0F172A",      // Main text
  TEXT_SECONDARY: "#64748B",    // Secondary text
  TEXT_MUTED: "#94A3B8",        // Muted text
  TEXT_DISABLED: "#CBD5E1",     // Disabled text
  TEXT_INVERSE: "#FFFFFF",      // Text on dark backgrounds

  // ── Border Colors ─────────────────────────────────────────────────────────
  BORDER_DEFAULT: "#E2E8F0",    // Default borders
  BORDER_STRONG: "#CBD5E1",     // Strong borders
  BORDER_SUBTLE: "#F1F5F9",     // Subtle borders

  // ── Chart Colors (shades of PRIMARY only) ────────────────────────────────
  CHART_1: "#0F172A",
  CHART_2: "#1E293B",
  CHART_3: "#334155",
  CHART_4: "#475569",
  CHART_5: "#64748B",
  CHART_6: "#94A3B8",
  CHART_7: "#CBD5E1",
  CHART_8: "#E2E8F0",

  // ── Status Colors (only PRIMARY shades, RED for critical) ───────────────
  STATUS_DEFAULT: "#94A3B8",    // Neutral/pending
  STATUS_ACTIVE: "#0F172A",     // Active/in-progress
  STATUS_COMPLETE: "#334155",   // Completed
  STATUS_CRITICAL: "#DC2626",   // Critical/error (red only here)
} as const;

// ── Tailwind Class Mappings ──────────────────────────────────────────────────

export const TW_COLORS = {
  // Backgrounds
  bgPage: "bg-white",
  bgCard: "bg-white",
  bgHover: "hover:bg-slate-50",
  bgActive: "bg-slate-100",
  bgPrimary: "bg-[#0F172A]",
  bgPrimaryHover: "hover:bg-slate-800",
  
  // Text
  textPrimary: "text-[#0F172A]",
  textSecondary: "text-slate-500",
  textMuted: "text-slate-400",
  textDisabled: "text-slate-300",
  textInverse: "text-white",
  
  // Borders
  border: "border-slate-200",
  borderStrong: "border-slate-300",
  borderSubtle: "border-slate-100",
  
  // Buttons
  btnPrimary: "bg-[#0F172A] text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-400",
  btnSecondary: "bg-white text-[#0F172A] border border-slate-200 hover:bg-slate-50",
  btnGhost: "text-[#0F172A] hover:bg-slate-100",
  
  // Status
  statusDefault: "bg-slate-100 text-slate-600",
  statusActive: "bg-[#0F172A] text-white",
  statusComplete: "bg-slate-700 text-white",
  statusError: "bg-red-600 text-white",
} as const;

// ── Utility Functions ─────────────────────────────────────────────────────────

/**
 * Get opacity value for PRIMARY color
 */
export function getPrimaryOpacity(opacity: 5 | 8 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90): string {
  const key = `OPACITY_${opacity}` as keyof typeof THEME;
  return THEME[key];
}

/**
 * Get chart color by index (cycles through PRIMARY shades)
 */
export function getChartColor(index: number): string {
  const colors = [
    THEME.CHART_1,
    THEME.CHART_2,
    THEME.CHART_3,
    THEME.CHART_4,
    THEME.CHART_5,
    THEME.CHART_6,
    THEME.CHART_7,
    THEME.CHART_8,
  ];
  return colors[index % colors.length];
}

/**
 * Get status color based on status type
 */
export function getStatusColor(status: 'default' | 'active' | 'complete' | 'critical'): string {
  switch (status) {
    case 'active': return THEME.STATUS_ACTIVE;
    case 'complete': return THEME.STATUS_COMPLETE;
    case 'critical': return THEME.STATUS_CRITICAL;
    default: return THEME.STATUS_DEFAULT;
  }
}
