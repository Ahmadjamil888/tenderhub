# COMPREHENSIVE UI/UX REFACTOR PLAN — STRICT ENTERPRISE DESIGN SYSTEM

## STATUS: IN PROGRESS

This document tracks the complete transformation of the gov-tender-hub application to a strict **#0F172A + #FFFFFF** enterprise design system.

---

## ✅ COMPLETED CHANGES

### 1. Core Theme System
- ✅ Created `src/lib/theme.ts` — central color palette with STRICT rules
- ✅ Documented PRIMARY (#0F172A) and SECONDARY (#FFFFFF) only
- ✅ Defined shades (PRIMARY_50 to PRIMARY_900)
- ✅ Defined opacity values for transparent overlays
- ✅ RED for critical errors ONLY (#DC2626)
- ✅ Utility functions: `getPrimaryOpacity()`, `getChartColor()`, `getStatusColor()`

### 2. AppShell.tsx — Navigation & Header
- ✅ Notifications Panel: Changed from multi-color to PRIMARY shades only
  - Success: PRIMARY + slate-100 (was emerald)
  - Warning: PRIMARY + slate-100 (was amber)
  - Info: PRIMARY + slate-100 (was blue)
  - Error: RED-600 (kept for critical only)
- ✅ Notifications border/background: Changed to slate-200/slate-100 (was black/10, #EAF1F8)

---

## 🔄 IN PROGRESS

### 3. AppShell.tsx — Messages Panel
- ⏳ Change message item colors from blue/emerald/amber to PRIMARY shades
- ⏳ Change compose button from black to PRIMARY
- ⏳ Change message badges from colored to PRIMARY/white

### 4. AppShell.tsx — Inbox Panel
- ⏳ Change item type badges (Approval/Payment/Variation/Review) from colored to PRIMARY shades
- ⏳ Change "Approve" button from black to PRIMARY
- ⏳ Change amber badge to PRIMARY

### 5. AppShell.tsx — Top Header
- ⏳ Change AI Co-Pilot button: Remove gradient (from-[#2563eb] to-[#7c3aed]) → solid PRIMARY
- ⏳ Remove emerald pulse dot → PRIMARY pulse dot
- ⏳ Change user avatar from blue-600 to PRIMARY
- ⏳ Change notification badges from blue-600/amber to PRIMARY

### 6. AppShell.tsx — Sidebar Navigation
- ⏳ Change active nav from blue-600 (#2563eb) to PRIMARY
- ⏳ Change blue shadows/glows to PRIMARY shadows
- ⏳ Change pill badges from colored to PRIMARY/white
- ⏳ Remove DbFolderIcon teal color → PRIMARY only

### 7. AppShell.tsx — Mobile Bottom Nav
- ⏳ Change active bg from blue-600 to PRIMARY

### 8. AppShell.tsx — Shared Components
- ⏳ KpiCard: Change all color options to PRIMARY shades only
- ⏳ Badge: Remove all colored tones (blue/green/amber/violet/purple/yellow) → PRIMARY + RED for errors
- ⏳ PageContextBar: Remove gradient (from-[#2563eb] to-[#7c3aed]) → solid PRIMARY

---

## 📋 TODO — COMPONENTS

### Priority Components (Most Visible)
- ⏸️ BriefingDashboard.tsx — Remove ALL colors, use PRIMARY shades only
  - Charts: PRIMARY shades (8 levels)
  - Down trends: RED (not green)
  - Up trends: PRIMARY-700 (not green)
  - Background: white (not dark navy #030f1e)
- ⏸️ BudgetIntelligenceCentre.tsx
  - Header: Change green (#1a6b3a) to PRIMARY
  - Inflows: Change blue to PRIMARY-100/PRIMARY-700
  - Outflows: Keep RED
  - NET POSITION: Change green to PRIMARY, keep RED
- ⏸️ StageFormWorkbench.tsx
  - Stepper: Change emerald-600 to PRIMARY
  - Primary button: Change emerald-600 to PRIMARY
  - Active step: Keep gray-900 or change to PRIMARY-900
- ⏸️ KpiScrollTicker.tsx
  - Up trends: Change emerald/green to PRIMARY-700
  - Down trends: Keep RED for critical
  - Neutral: PRIMARY-400
  - Remove all colored category badges → PRIMARY/white
- ⏸️ MyBriefingTiles.tsx
  - Change blue theme (blue-600/blue-100/blue-800) to PRIMARY shades
  - Calendar events: Remove all colors → PRIMARY shades
  - Tiles: Remove blue backgrounds → white + PRIMARY
- ⏸️ NewFeaturesBanner.tsx
  - Background: Change gradient (from-[#0f172a] to-[#1e3a5f]) to solid PRIMARY
  - Feature cards: Remove colored backgrounds (blue/emerald/violet/amber) → PRIMARY shades
  - Badges: Change colored to PRIMARY/white
  - Stats pill: Change emerald to PRIMARY
- ⏸️ EnterpriseWorkbench.tsx
  - Active tab: Change blue-600 to PRIMARY
  - Role colors: Remove violet/emerald/amber → all PRIMARY shades
  - Reduce tabs to 4 (Visuals, Form, Tables, Documents)
- ⏸️ InlineWorkbench.tsx
  - Ribbon: Change blue (#2b579a) to PRIMARY
- ⏸️ AIAssistantPanel.tsx
  - Remove theme colors (violet/emerald/amber/rose) → PRIMARY only
  - Change blue-600 to PRIMARY
- ⏸️ WorkstationTower.tsx
  - Status dots: Change emerald/amber/red to PRIMARY/PRIMARY-400/RED
- ⏸️ LifecycleTower.tsx
  - Status pins: Change emerald to PRIMARY, keep RED
- ⏸️ TenderGovernancePanel.tsx
  - Remove all colored badges → PRIMARY + RED for critical
- ⏸️ WorkflowStepper.tsx
  - Change emerald/blue/amber to PRIMARY shades
- ⏸️ GisMapView.tsx
  - Map markers: PRIMARY shades only
  - Remove colored pins

### Secondary Components
- ⏸️ TodayActivity.tsx
- ⏸️ SeniorFeed.tsx
- ⏸️ HODBriefingTab.tsx
- ⏸️ PerformanceOversightTab.tsx
- ⏸️ PriorityBriefTab.tsx
- ⏸️ ZimbabweMapTab.tsx
- ⏸️ BudgetHierarchyTree.tsx
- ⏸️ CompetencySubsystem.tsx
- ⏸️ TechnicalEvaluationModule.tsx
- ⏸️ TenderEvaluationForms.tsx
- ⏸️ AwardNoticeModal.tsx
- ⏸️ NewTenderModal.tsx
- ⏸️ ToastContainer.tsx — Remove colored toasts → PRIMARY + RED

---

## 📋 TODO — PAGES (150+ files)

### Dashboard Pages
- ⏸️ DashboardRouter.tsx
- ⏸️ ExecutiveDashboardPage.tsx
- ⏸️ BIDashboardPage.tsx
- ⏸️ MinistryDashboardPage.tsx
- ⏸️ DepartmentDashboardPage.tsx
- ⏸️ SeniorDashboardPage.tsx
- ⏸️ PrimeEntityDashboard.tsx
- ⏸️ PresidentDashboard.tsx
- ⏸️ PrimeMinisterDashboard.tsx

### Briefing Pages
- ⏸️ BriefingPage.tsx — Remove ALL multi-color dashboards → PRIMARY + white only

### Procurement Pages
- ⏸️ TendersPage.tsx
- ⏸️ TenderDetailPage.tsx
- ⏸️ TenderStagePage.tsx
- ⏸️ TenderLifecyclePage.tsx
- ⏸️ ProcurementLifecyclePage.tsx
- ⏸️ RFQPage.tsx
- ⏸️ RFPEOIPage.tsx
- ⏸️ AuctionsPage.tsx
- ⏸️ PlanningPage.tsx
- ⏸️ EvaluationsPage.tsx
- ⏸️ AwardsPage.tsx

### Workbench Pages (26 stages)
- ⏸️ ProcurementPlanningWorkbench.tsx
- ⏸️ RequisitionWorkbench.tsx
- ⏸️ StrategyWorkbench.tsx
- ⏸️ TenderPreparationWorkbench.tsx
- ⏸️ TenderManagementWorkbench.tsx
- ⏸️ RFQWorkbench.tsx
- ⏸️ RFPWorkbench.tsx
- ⏸️ EOIWorkbench.tsx
- ⏸️ AuctionWorkbench.tsx
- ⏸️ BidSubmissionWorkbench.tsx
- ⏸️ BidOpeningWorkbench.tsx
- ⏸️ BidEvaluationWorkbench.tsx
- ⏸️ RecommendationWorkbench.tsx
- ⏸️ ContractAwardWorkbench.tsx
- ⏸️ ContractExecutionWorkbench.tsx
- ⏸️ ContractManagementWorkbench.tsx
- ⏸️ ProjectMonitoringWorkbench.tsx
- ⏸️ ContractClosureWorkbench.tsx
- ⏸️ PaymentManagementWorkbench.tsx
- ⏸️ AssetManagementWorkbench.tsx
- ⏸️ PerformanceEvalWorkbench.tsx
- ⏸️ GovernanceWorkbench.tsx
- ⏸️ AppealsWorkbench.tsx
- ⏸️ AuditWorkbench.tsx
- ⏸️ ReportsWorkbench.tsx
- ⏸️ AIAnalyticsWorkbench.tsx
- ⏸️ CompetencyWorkbench.tsx

### Vendor/Contract/Performance Pages
- ⏸️ VendorsPage.tsx
- ⏸️ ContractsPage.tsx
- ⏸️ PerformancePage.tsx
- ⏸️ CertificatesPage.tsx
- ⏸️ SupplierPortalPage.tsx
- ⏸️ VendorPortalWorkbench.tsx

### Finance/Budget Pages
- ⏸️ FinancePage.tsx
- ⏸️ BudgetHomePage.tsx — Change ALL colored charts → PRIMARY shades
- ⏸️ BudgetManagementPage.tsx
- ⏸️ BudgetCentresPage.tsx
- ⏸️ BudgetFormulationPage.tsx
- ⏸️ BudgetExecutionPage.tsx
- ⏸️ CommitmentsPage.tsx
- ⏸️ ExpenditurePage.tsx
- ⏸️ RevenuePage.tsx
- ⏸️ TreasuryPage.tsx
- ⏸️ FraudDetectionPage.tsx
- ⏸️ FinancialStatementsPage.tsx
- ⏸️ FinancialReconciliationPage.tsx

### Projects Pages
- ⏸️ ProjectManagementPage.tsx
- ⏸️ ProjectsPage.tsx

### Assets/Inventory Pages
- ⏸️ AssetManagementPage.tsx
- ⏸️ AssetMaintenancePage.tsx
- ⏸️ AssetFinancialsPage.tsx
- ⏸️ AssetDisposalPage.tsx
- ⏸️ InventoryPage.tsx

### Audit/Governance Pages
- ⏸️ AuditPage.tsx
- ⏸️ AntiCorruptionPage.tsx
- ⏸️ GovernancePage.tsx
- ⏸️ RolesPage.tsx
- ⏸️ SystemAdminPage.tsx

### Analytics/BI/AI Pages
- ⏸️ AnalyticsPage.tsx — Remove ALL colored charts → PRIMARY shades ONLY
- ⏸️ DrillDownPage.tsx
- ⏸️ AIAnalyticsEnginePage.tsx
- ⏸️ AiAgentsPage.tsx
- ⏸️ GlobalSearchPage.tsx
- ⏸️ ReportsPage.tsx

### Teams/HR Pages
- ⏸️ TeamsPage.tsx
- ⏸️ StaffProductivityPage.tsx
- ⏸️ DepartmentActivitiesPage.tsx
- ⏸️ HumanResourcesPage.tsx
- ⏸️ ERecruitmentPage.tsx

### Organizations/Corporate Pages
- ⏸️ OrganisationsPage.tsx
- ⏸️ CorporatePage.tsx
- ⏸️ CorporateDepartmentPage.tsx
- ⏸️ WorkstationDetailPage.tsx
- ⏸️ UtilityPage.tsx

### New 2026 Feature Pages
- ⏸️ IntakePage.tsx
- ⏸️ SupplierMarketplacePage.tsx
- ⏸️ AutonomousAgentsPage.tsx
- ⏸️ SpendIntelligencePage.tsx

### Public Pages
- ⏸️ LandingPage.tsx
- ⏸️ SignInPage.tsx
- ⏸️ PortalPage.tsx
- ⏸️ GisMapPage.tsx
- ⏸️ ReportsComplaintsPage.tsx
- ⏸️ VendorSelfRegistrationPage.tsx
- ⏸️ SupplierRegistrationPage.tsx

### Miscellaneous Pages
- ⏸️ NotificationsCenterPage.tsx
- ⏸️ DocumentEditorPage.tsx
- ⏸️ MailRegistryPage.tsx
- ⏸️ KnowledgeBasePage.tsx
- ⏸️ LessonsLearnedPage.tsx
- ⏸️ NotFound.tsx

---

## 🎨 GLOBAL SEARCH & REPLACE PATTERNS

Use these regex patterns to find and replace across ALL files:

### Background Colors
- Find: `bg-blue-\\d+` → Replace: `bg-[#0F172A]` or `bg-slate-[50-900]`
- Find: `bg-emerald-\\d+` → Replace: `bg-[#0F172A]` or `bg-slate-[50-900]`
- Find: `bg-green-\\d+` → Replace: `bg-[#0F172A]` or `bg-slate-[50-900]`
- Find: `bg-amber-\\d+` → Replace: `bg-[#0F172A]` or `bg-slate-[50-900]` (or `bg-red-` if error)
- Find: `bg-violet-\\d+` → Replace: `bg-[#0F172A]` or `bg-slate-[50-900]`
- Find: `bg-purple-\\d+` → Replace: `bg-[#0F172A]` or `bg-slate-[50-900]`
- Find: `bg-pink-\\d+` → Replace: `bg-[#0F172A]` or `bg-slate-[50-900]`
- Find: `bg-orange-\\d+` → Replace: `bg-[#0F172A]` or `bg-slate-[50-900]`
- Find: `bg-cyan-\\d+` → Replace: `bg-[#0F172A]` or `bg-slate-[50-900]`
- Find: `bg-teal-\\d+` → Replace: `bg-[#0F172A]` or `bg-slate-[50-900]`
- Find: `bg-sky-\\d+` → Replace: `bg-[#0F172A]` or `bg-slate-[50-900]`
- Find: `bg-indigo-\\d+` → Replace: `bg-[#0F172A]` or `bg-slate-[50-900]`

### Text Colors
- Find: `text-blue-\\d+` → Replace: `text-[#0F172A]` or `text-slate-[400-900]`
- Find: `text-emerald-\\d+` → Replace: `text-[#0F172A]` or `text-slate-[400-900]`
- Find: `text-green-\\d+` → Replace: `text-[#0F172A]` or `text-slate-[400-900]`
- Find: `text-amber-\\d+` → Replace: `text-[#0F172A]` or `text-slate-[400-900]` (or `text-red-` if critical)
- Find: `text-violet-\\d+` → Replace: `text-[#0F172A]` or `text-slate-[400-900]`
- Find: `text-purple-\\d+` → Replace: `text-[#0F172A]` or `text-slate-[400-900]`

### Border Colors
- Find: `border-blue-\\d+` → Replace: `border-slate-200` or `border-[#0F172A]/10`
- Find: `border-emerald-\\d+` → Replace: `border-slate-200` or `border-[#0F172A]/10`
- Find: `border-green-\\d+` → Replace: `border-slate-200` or `border-[#0F172A]/10`
- Find: `border-amber-\\d+` → Replace: `border-slate-200` or `border-[#0F172A]/10` (or `border-red-` if error)
- Find: `border-black/\\d+` → Replace: `border-slate-200` or `border-[#0F172A]/10`

### Gradients (REMOVE ALL)
- Find: `bg-gradient-to-r from-.*? to-.*?` → Replace: `bg-[#0F172A]`
- Find: `bg-gradient-to-l from-.*? to-.*?` → Replace: `bg-[#0F172A]`
- Find: `bg-gradient-to-br from-.*? to-.*?` → Replace: `bg-[#0F172A]`

### Recharts Chart Colors
- Find: `fill=".*?"` in chart components → Replace: use `getChartColor()` function
- Find: `stroke=".*?"` in chart components → Replace: use PRIMARY shades

### Hex Colors (Direct)
- Find: `#2563eb|#3b82f6|#60a5fa|#93c5fd` (blues) → Replace: `#0F172A` or shades
- Find: `#10b981|#16a34a|#00e676` (greens) → Replace: `#0F172A` or shades
- Find: `#f59e0b|#d97706` (ambers) → Replace: `#0F172A` or RED for critical
- Find: `#8b5cf6|#7c3aed` (violets) → Replace: `#0F172A` or shades
- Find: `#ec4899` (pink) → Replace: `#0F172A` or shades
- Find: `#f97316` (orange) → Replace: `#0F172A` or shades
- Find: `#06b6d4` (cyan) → Replace: `#0F172A` or shades

---

## 🚨 CRITICAL RULES

### ALLOWED COLORS
✅ #0F172A (PRIMARY)
✅ #FFFFFF (WHITE)
✅ Slate shades (slate-50 to slate-900)
✅ #DC2626 (RED for critical errors ONLY)

### FORBIDDEN COLORS
❌ Blue (#2563eb, #3b82f6, etc.)
❌ Green (#10b981, #16a34a, #00e676)
❌ Emerald
❌ Amber
❌ Violet
❌ Purple
❌ Pink
❌ Orange
❌ Teal
❌ Cyan
❌ Yellow
❌ Gradients (ALL)
❌ Multi-color dashboards

### CHARTS
- Use ONLY PRIMARY shades (8 levels from THEME.CHART_1 to THEME.CHART_8)
- Down trends: RED (#DC2626)
- Up trends: PRIMARY-700 (#334155)
- Neutral: PRIMARY-400 (#94A3B8)

### STATUS INDICATORS
- Active: PRIMARY (#0F172A)
- Complete: PRIMARY-700 (#334155)
- Pending: PRIMARY-400 (#94A3B8)
- Critical/Error: RED-600 (#DC2626)

### BACKGROUNDS
- Page: WHITE (#FFFFFF)
- Cards: WHITE (#FFFFFF)
- Hover: slate-50 (#F8FAFC)
- Active: slate-100 (#F1F5F9)
- Selected: slate-200 (#E2E8F0)

---

## 📊 PROGRESS TRACKER

- **Total Files**: ~200+
- **Completed**: 2 (theme.ts + partial AppShell.tsx)
- **In Progress**: AppShell.tsx
- **Remaining**: ~198

---

## 🔍 VERIFICATION CHECKLIST

After completing all changes, verify:

- [ ] NO blue/green/amber/violet/purple/pink/orange/teal/cyan/yellow colors anywhere
- [ ] ALL charts use PRIMARY shades only (8 levels)
- [ ] ALL status indicators use PRIMARY + RED for critical only
- [ ] ALL gradients removed
- [ ] ALL backgrounds are WHITE or slate shades
- [ ] ALL text is PRIMARY or slate shades
- [ ] ALL borders are slate-200 or PRIMARY/10
- [ ] Global search returns ZERO results for forbidden color classes
- [ ] Logo is PRIMARY + WHITE only (no gradients)
- [ ] Theme toggle works (light/dark both PRIMARY-based)
- [ ] No broken layouts or missing content
- [ ] No empty spaces (audit complete)
- [ ] All 4 focal areas separated (no mixing)

---

## 📝 NOTES

- This is a PRODUCTION-LEVEL refactor affecting 150+ pages and 40+ components
- Every page, module, section, card, table, chart, widget, modal, dialog, dropdown, navigation item, form, button, icon must be updated
- The final result must feel like ONE unified enterprise Government ERP system
- Design philosophy: Minimal. Professional. Government enterprise. Modern ERP. High readability. Premium software experience.

---

**Last Updated**: 2026-07-21
**Status**: ⏳ IN PROGRESS
