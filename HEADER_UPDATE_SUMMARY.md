# Government Header Implementation — Summary

## What Changed

The platform-wide page header system has been enhanced to meet government document standards with proper institutional identification and space optimization.

---

## 1. Enhanced `PageContextBar` Component

**Location:** `src/components/AppShell.tsx`

### New Structure

The header now has **two rows**:

#### **Row 1 — Government Identity Bar** (collapsible, dark navy #0f172a)
- **"GOVERNMENT OF THE REPUBLIC OF ZIMBABWE"** (all caps, white/50% opacity, 10px)
- **Ministry/Entity Name** (bold, white, 14px) — automatically pulled from logged-in user's `entity` field
- **Financial Year** (with calendar icon)
- **Collapse/Expand toggle button** (ChevronUp/Down icon)

#### **Row 2 — Breadcrumb & Tools** (always visible, white background)
- **Expand button** (only shown when header is collapsed)
- **Ministry pill** (shown in collapsed mode for quick reference)
- **Module › Process** breadcrumb
- **Financial Year** (pill format, always visible)
- **Page Type Badge** (Dashboard/Form/Workbench/Report)
- **AI Assistant** button (gradient blue/purple)

### Collapse Behavior

- **Collapsed state:** Government identity row (Row 1) hides → content area gains ~50-60px vertical space
- **Expand button:** Appears in Row 2 when collapsed, one click restores full header
- **State persistence:** Collapse state is per-session (not persisted to localStorage — intentional so users start fresh each session)

---

## 2. Automatic Ministry Resolution

The component now **reads the logged-in user's ministry automatically** from the `useAuth()` context:

```typescript
const { user } = useAuth();
const resolvedMinistry = 
  ministry ??  // 1. Explicit prop override (optional)
  (user?.entity && user.entity !== "Government of Zimbabwe" ? user.entity : null) ??  // 2. User's entity
  "Government of Zimbabwe";  // 3. Fallback
```

### What This Means for Pages

Pages **no longer need to pass** `ministry` prop explicitly unless they need a specific override. The header will automatically show:
- `"Ministry of Finance & Economic Development"` when a Finance Ministry user logs in
- `"Ministry of Health"` when a Health Ministry user logs in
- `"Government of Zimbabwe"` as the generic fallback

### Financial Year Resolution

Financial year now defaults to `"2026/2027"` (format update from `"FY2026"` to match government budget cycle notation). Pages can still override via `financialYear` prop if needed.

---

## 3. Briefing Module Exception

**Location:** `src/pages/BriefingPage.tsx`

The Executive Briefing dashboard uses a **lightweight header mode** with no government identity bar:

```typescript
<PageContextBar
  module="Executive Briefing"
  process="Senior Management Briefing"
  briefingMode={true}  // <-- Special flag
/>
```

**Why:** Executive briefing centers have a distinct visual aesthetic focused on data visualization without heavy institutional branding.

**Briefing Mode Header:** Shows only the breadcrumb row (Module › Process) + FY + AI Assistant — no collapsible government block.

---

## 4. Pages Using Explicit Ministry Overrides

These pages intentionally override the auto-resolved ministry with specific values:

| Page | Ministry Override | Reason |
|------|-------------------|--------|
| `PresidentDashboard.tsx` | `"Office of the President and Cabinet"` | Presidential command center |
| `BudgetManagementPage.tsx` | `"Ministry of Finance & Economic Development"` | Budget is always Finance domain |
| `FinanceDashboard.tsx` | `"Ministry of Finance & Economic Development"` | Finance-specific dashboard |
| `FinancePage.tsx` | `"Ministry of Finance & Economic Development"` | Finance module |
| `FinancialStatementsPage.tsx` | `"Ministry of Finance & Economic Development"` | Government financial statements |
| `FinancialReconciliationPage.tsx` | `"Ministry of Finance & Economic Development"` | Finance reconciliation |
| All `/budget/*` pages | `"Ministry of Finance & Economic Development"` | Budget centres, formulation, execution, etc. |

**All other pages** (procurement, tenders, evaluations, contracts, vendors, etc.) use the **auto-resolved ministry** from the logged-in user's entity.

---

## 5. Visual Design Standards

### Colors
- **Government identity bar:** Dark navy `#0f172a` (same as sidebar)
- **Breadcrumb row:** White `#ffffff`
- **Text hierarchy:**
  - "GOVERNMENT OF..." → 10px, bold, white/50%
  - Ministry name → 14px, bold, white/90%
  - Module/Process → 11px, bold, navy
  - Labels → 10px, semibold, black/35%

### Icons
- **Government coat-of-arms:** Building/Parliament icon in white circle
- **Calendar icon:** Financial year indicator
- **ChevronDown:** Collapse/expand toggle (rotates 180° when collapsed)

### Spacing
- **Row 1 height:** ~48px (when expanded)
- **Row 2 height:** ~40px (always visible)
- **Padding:** 16-24px horizontal (responsive)
- **Collapsed space saved:** ~48-50px

---

## 6. Implementation Impact

### Files Modified
1. `src/components/AppShell.tsx` — `PageContextBar` component enhanced
2. `src/pages/BriefingPage.tsx` — Added `briefingMode={true}` flag

### Files NOT Modified
All other pages (60+ files) **continue to work without changes** because:
- `ministry` prop is now optional (auto-resolved)
- `financialYear` prop is now optional (defaults to `"2026/2027"`)
- Component is backwards-compatible

### Zero Breaking Changes
- Existing `ministry` prop overrides still work
- Existing `financialYear` prop values still work
- All pages compile and render correctly

---

## 7. User Experience

### Space Optimization
Users can **collapse the government header** when they need maximum content space for:
- Large data tables (financial statements, procurement listings)
- Multi-column forms (tender preparation, evaluation workbenches)
- Charts and dashboards (budget intelligence, spend analytics)

### Context Preservation
Even when collapsed, the breadcrumb row shows:
- **Ministry pill** (truncated, left side)
- **Module › Process** (breadcrumb)
- **Financial Year** (right side)
- **Page Type badge** (Dashboard/Form/etc.)
- **AI Assistant** button

### One-Click Restore
The expand button (blue circle with chevron) appears prominently in the breadcrumb row when the header is collapsed — one click restores the full government identity bar.

---

## 8. Compliance with Government Standards

✅ **Institutional Identification:** "GOVERNMENT OF THE REPUBLIC OF ZIMBABWE" prominently displayed  
✅ **Ministry Attribution:** Every page shows the responsible ministry/entity  
✅ **Financial Year Context:** Budget cycle year always visible  
✅ **Space Efficiency:** Collapsible header prevents header bloat  
✅ **Accessibility:** Proper ARIA roles (`role="banner"`), labels, and semantic HTML  
✅ **Responsive Design:** Header adapts to mobile/tablet (wraps, hides labels, keeps core info)

---

## 9. Testing Checklist

- [x] Header auto-resolves logged-in user's ministry correctly
- [x] Collapse/expand toggle works smoothly
- [x] Ministry pill appears in breadcrumb row when collapsed
- [x] Briefing mode shows lightweight header only
- [x] Finance pages show "Ministry of Finance & Economic Development" override
- [x] President Dashboard shows "Office of the President and Cabinet"
- [x] All other pages show logged-in user's entity
- [x] Financial year displays correctly (`"2026/2027"` format)
- [x] No TypeScript errors or diagnostics
- [x] Responsive behavior on mobile/tablet

---

## 10. Future Enhancements (Optional)

1. **Persist collapse state** per user in localStorage (`header-collapsed-<userId>`)
2. **Ministry selector** for cross-ministry roles (e.g., Treasury, PRAZ regulators)
3. **Multi-language support** for "GOVERNMENT OF THE REPUBLIC OF ZIMBABWE" label
4. **Custom coat-of-arms SVG** replacing the generic building icon
5. **Ministry color themes** — each ministry gets a signature accent color

---

## Summary

The government header implementation provides:
- **Professional institutional branding** on every page
- **Automatic ministry attribution** from user context
- **Space optimization** via collapse toggle
- **Zero breaking changes** to existing pages
- **Executive briefing exception** for data-focused dashboards

All pages now meet government document standards while preserving usability and flexibility.
