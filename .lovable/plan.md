# Implementation Plan

Scope is large. I'll execute in these ordered phases so nothing gets missed.

## Phase 1 — Global theme unification (portal look everywhere)
- Extract the public LandingPage palette (soft blue/white/grey, bordered cards, gov-portal look) into design tokens in `src/styles.css`.
- Add a shared `PortalShell` header/footer style used by SignIn, SupplierPortal, SupplierDashboard.
- Soften tab/section backgrounds; where currently shaded, add visible `border border-border` so tabs are clearly delineated.

## Phase 2 — Monochrome graphs (black / white / grey)
- Introduce `CHART_PALETTE` in `src/lib/mock-data.ts` (e.g. `#111`, `#4b5563`, `#9ca3af`, `#d1d5db`, `#f3f4f6`).
- Sweep all `recharts` usages (`stroke`, `fill`, `Cell`) to reference the palette. Pie/Bar/Line/Area/Radar all monochrome.

## Phase 3 — Sign-In page redesign
- Rebrand to match LandingPage (top utility bar, gov header, blue accent).
- Left panel: full-height, scrollable Government Hierarchy tree (Ministry → Department/SOE → Branch → Roles) with visible scrollbar, expanded height (covers ~70% viewport), moved to top.
- Right panel: compact sign-in form styled like portal cards.
- Remove "Vendor Registration" tab/CTA (vendors self-register from public portal; admin approves).

## Phase 4 — Supplier Portal & Supplier Dashboard theme
- Replace black/gray tokens with portal blue/white.
- Bordered cards, gov-style header, monochrome charts, same typography.

## Phase 5 — AI Briefing Video page
- Expand video frame to full available height/width.
- Remove transcript panel entirely.
- Add compact AI chat box directly underneath the video (input + streamed messages area, mock responses for now).

## Phase 6 — Briefing Notes / Alerts (scroll-up hazards feed)
- Rebuild as auto-scrolling ticker of hazard cards.
- Each row: hazard icon, colored severity (🔴 critical / 🟡 serious / 🟢 caution / 🔵 watch), message, `View` button → drill to source.
- Red rows get pulsing glow (`animate-pulse` + custom `shadow-[0_0_12px_red]`).
- Topic headline rotates automatically: play all alerts of topic A, replay once, then advance to topic B.

## Phase 7 — Tender creation revamp
- Admin-only "Create Tender" wizard (`NewTenderModal` refactor):
  1. Basic info + document attachments (multi-file).
  2. **Evaluation matrix builder**: Technical vs Financial weighting slider (e.g. 70/30). Sub-criteria rows under each with weights that must sum to 100.
  3. Timeline (publish/close/open/evaluate dates).
  4. Review & publish.
- Tender lifecycle page: shows the two matrices, AI auto-scoring column, admin approval column.
- Each workbench (bid evaluation, contract award, etc.) uses the **Board Pack style document editor** (agenda list + document viewer + comment/mark panel) — extract shared `<BoardStyleWorkbench>` component from `BoardPackPage`.

## Phase 8 — Build & verify
- Run typecheck, fix all errors.

## Technical notes
- No backend changes. Mock data only.
- Reuse existing `DocumentExplorer` + `BoardPackPage` layout for the workbench refactor.
- Chart palette exported as constant, no hardcoded hex in components.
- Hierarchy data sourced from existing `ZW_MINISTRIES`.

Proceeding to implementation on approval.
