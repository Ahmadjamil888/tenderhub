/**
 * CHART COLOR SYSTEM — Single Source of Truth
 *
 * All charts, pies, bars, lines, and area charts across the platform
 * must import from this file. Never define ad-hoc color arrays inline.
 *
 * Design principles:
 *  - Every color is perceptually distinct (hue, lightness, saturation all vary)
 *  - Semantic colors always mean the same thing everywhere
 *  - Categorical colors cycle clearly through ≥8 distinct hues
 *  - Optimised for light backgrounds (white/slate)
 */

// ── Semantic colors (always mean the same thing) ──────────────────────────
export const CHART_SEMANTIC = {
  positive:     "#10B981", // Emerald green  — up / on-track / surplus
  positiveDeep: "#059669", // Deep emerald   — strong positive
  negative:     "#EF4444", // Red            — down / overrun / critical
  negativeDeep: "#B91C1C", // Deep red       — critical strong
  warning:      "#F59E0B", // Amber          — warning / forecast / near-limit
  neutral:      "#3B82F6", // Blue           — neutral / informational
  muted:        "#94A3B8", // Slate muted    — de-emphasis / background series
} as const;

// ── Categorical palette — 10 clearly distinct hues ───────────────────────
// Use in order: series 1 → series 2 → … for multi-series charts
export const CHART_COLORS = [
  "#3B82F6", // [0] Blue         — primary series
  "#10B981", // [1] Emerald      — secondary series / positive
  "#F59E0B", // [2] Amber        — tertiary series / warning
  "#EF4444", // [3] Red          — 4th series / negative
  "#8B5CF6", // [4] Violet       — 5th series
  "#06B6D4", // [5] Cyan         — 6th series
  "#F97316", // [6] Orange       — 7th series
  "#EC4899", // [7] Pink/Rose    — 8th series
  "#14B8A6", // [8] Teal         — 9th series
  "#6366F1", // [9] Indigo       — 10th series
] as const;

// Alias for pie charts specifically (same array, explicit name)
export const PIE_COLORS = CHART_COLORS;

// ── Budget / finance specific ─────────────────────────────────────────────
export const BUDGET_COLORS = {
  approved: "#1D4ED8", // Royal blue    — approved budget
  revised:  "#D97706", // Amber         — revised budget
  actual:   "#DC2626", // Red           — actual spend
  forecast: "#7C3AED", // Violet        — forecast
  savings:  "#10B981", // Emerald       — savings / surplus
  overrun:  "#EF4444", // Red           — overrun
} as const;

// ── Status colors ─────────────────────────────────────────────────────────
export const STATUS_COLORS = {
  active:    "#10B981",
  pending:   "#F59E0B",
  critical:  "#EF4444",
  completed: "#3B82F6",
  cancelled: "#94A3B8",
} as const;

// ── Grid / axis colors (consistent across all charts) ────────────────────
export const CHART_GRID = {
  grid:   "rgba(15,23,42,0.06)",
  border: "rgba(15,23,42,0.10)",
  axis:   "#94A3B8",
  label:  "#64748B",
} as const;

// ── Helper: get color by index (wraps around) ─────────────────────────────
export function chartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}
