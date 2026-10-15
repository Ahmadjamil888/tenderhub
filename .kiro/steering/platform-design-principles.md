---
inclusion: always
---

# Platform Design Principles — 4 Focal Areas

## Core Philosophy

Every page, module, and workbench in this platform must serve exactly ONE of four focal areas. Never mix them on the same screen. Clutter and noise are forbidden.

---

## The Four Focal Areas

### 1. VISUALS
**What belongs here:** Charts, dashboards, maps, GIS, Bloomberg-style terminals, KPI tickers, live data feeds.

**Reference implementation:** `BriefingDashboard.tsx` — the gold standard. Dark navy/slate background, seamless tile borders, live animated charts, no wasted space.

**GIS is part of Visuals.** The `GisMapView` component (left layers panel + map + right case details panel) is the visual area for geographic data.

**Rules:**
- No forms inside a Visuals page
- No tables of raw data (use a Table page for that)
- Charts fill all available space — no padding waste
- Use the Bloomberg color palette: green for up/positive, red for down/negative, blue for neutral

---

### 2. FORMS
**What belongs here:** Multi-step data capture, registration, tender preparation, evaluation forms, applications, status change workflows.

**Reference implementation:** `StageFormWorkbench.tsx` — exact pattern to follow for every new form.

**Rules:**
- Use the stepper bar (horizontal scrollable, completed=emerald, active=dark, upcoming=outlined)
- 2-column field grid on desktop (`grid grid-cols-1 md:grid-cols-2 gap-4`)
- Each field: bordered box, ALL CAPS label (`text-xs font-semibold uppercase tracking-wide text-gray-400`), value in `text-sm text-gray-800`
- Document preview panel on the right side (toggleable) — shows generated documents from form data
- AI Control Banner at the top of every form
- Workflow footer: Back | Next/Submit buttons only
- No charts, no tables, no document editors inside a form page

---

### 3. TABLES & FIGURES
**What belongs here:** Financial statements, reports, data grids, audit tables, procurement listings, budget variance reports, cost centre tables.

**Reference implementation:** `BudgetIntelligenceCentre.tsx` — the government financial statement format.

**Rules:**
- Dark green header row (`bg-[#1a6b3a]`) with white text for all table headers
- Government header block: "GOVERNMENT OF THE REPUBLIC OF ZIMBABWE" in navy (`bg-[#0f172a]`)
- Filters bar at the top: Financial Year / Ministry / Department / Entity Type / Cell — all with "All" default
- Briefing headline bar below filters: dark navy, AI briefing text, alert badge, audio toggle
- Horizontally scrollable tables with sticky first column
- Annual Total + all 12 months as columns for financial data
- Outflows in red with parentheses `(3,333.00)`, inflows in normal text
- Bold TOTAL rows, green/red NET POSITION row
- No forms, no document editors inside a Tables page

---

### 4. DOCUMENT VIEWER
**What belongs here:** Document editing, PDF viewing, board meeting packs, procurement document generation, letter drafting, compliance certificate viewing.

**Reference implementation:** `InlineWorkbench.tsx` (`RichDocEditor` and `DocViewer` components).

**Rules:**
- Use the MS Word-style ribbon (`bg-[#2b579a]`) for editable documents
- Document area has white background, A4 proportions, page shadow
- Toolbar: font family, font size, bold/italic/underline, alignment, lists, color picker, find, zoom
- Status bar at bottom: word count, filename, zoom
- PDF files rendered via `<iframe>` — never try to parse PDF in JavaScript
- For DOCX/TXT: open in `RichDocEditor`
- No charts, no forms inside a Document Viewer page
- Board Meeting Pack tab: agenda / minutes / documents sub-tabs

---

## Workbench Navigation Rule

The EnterpriseWorkbench left navigation panel should only show these 4 focal areas as top-level tabs:

| Tab | Focal Area | Icon |
|---|---|---|
| **Visuals** | Charts, KPIs, analytics for this record | BarChart3 |
| **Form** | The stage work form (multi-step) | FileText |
| **Tables** | Data grids, financials, evaluation tables | Table2 |
| **Documents** | Document viewer, board pack, generated docs | FolderOpen |

Supporting items (Participants, Risks, Audit, AI, etc.) belong as **sub-items** under the relevant focal area, not as top-level tabs cluttering the navigation.

---

## What to Remove / Avoid

- ❌ 15-tab navigation panels with mixed concerns
- ❌ Bottom panels with 7+ nested tabs
- ❌ KPI metric cards mixed with form fields on the same page
- ❌ Work queue filters, search panels, knowledge panels crammed into sidebars
- ❌ Any page that tries to be all four focal areas at once
- ❌ Empty areas — every section must have content

---

## Page Header Standard

Every page must start with:
1. Dark navy top bar: "GOVERNMENT OF THE REPUBLIC OF ZIMBABWE" + system name + ministry/FY context
2. White breadcrumb/context bar: Ministry › Module › Process
3. The focal area content (Visuals OR Form OR Tables OR Documents — never mixed)
