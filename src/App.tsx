import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { MinistryProvider } from "./lib/ministry-context";

// ── Loading fallback ─────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#EAF1F8]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-[3px] border-[#0f172a]/20 border-t-[#0f172a] animate-spin" />
        <span className="text-xs font-semibold text-black/40 uppercase tracking-widest">Loading…</span>
      </div>
    </div>
  );
}

// ── Lazy page imports ────────────────────────────────────────────────────
// Core / always-needed (small)
const LandingPage            = lazy(() => import("./pages/LandingPage"));
const SignInPage             = lazy(() => import("./pages/SignInPage"));
const NotFound               = lazy(() => import("./pages/NotFound"));

// Public
const PortalPage             = lazy(() => import("./pages/PortalPage"));
const TenderDetailPage       = lazy(() => import("./pages/TenderDetailPage"));
const VendorSelfRegistrationPage = lazy(() => import("./pages/VendorSelfRegistrationPage"));
const SupplierRegistrationPage   = lazy(() => import("./pages/SupplierRegistrationPage"));
const GisMapPage             = lazy(() => import("./pages/GisMapPage"));
const ReportsComplaintsPage  = lazy(() => import("./pages/ReportsComplaintsPage"));
const ReportServiceDeliveryPage = lazy(() => import("./pages/ReportServiceDeliveryPage"));

// Dashboard
const DashboardRouter        = lazy(() => import("./pages/DashboardRouter"));
const SupplierPortalPage     = lazy(() => import("./pages/SupplierPortalPage"));

// Core procurement
const TendersPage            = lazy(() => import("./pages/TendersPage"));
const TenderStagePage        = lazy(() => import("./pages/TenderStagePage"));
const TenderLifecyclePage    = lazy(() => import("./pages/TenderLifecyclePage"));
const ProcurementLifecyclePage = lazy(() => import("./pages/ProcurementLifecyclePage"));
const EvaluationsPage        = lazy(() => import("./pages/EvaluationsPage"));
const AwardsPage             = lazy(() => import("./pages/AwardsPage"));
const RFQPage                = lazy(() => import("./pages/RFQPage"));
const RFPEOIPage             = lazy(() => import("./pages/RFPEOIPage"));
const AuctionsPage           = lazy(() => import("./pages/AuctionsPage"));
const PlanningPage           = lazy(() => import("./pages/PlanningPage"));

// Vendors / Contracts / Performance
const VendorsPage            = lazy(() => import("./pages/VendorsPage"));
const ContractsPage          = lazy(() => import("./pages/ContractsPage"));
const PerformancePage        = lazy(() => import("./pages/PerformancePage"));
const CertificatesPage       = lazy(() => import("./pages/CertificatesPage"));

// Finance / Budget
const FinancePage            = lazy(() => import("./pages/FinancePage"));
const BudgetManagementPage   = lazy(() => import("./pages/BudgetManagementPage"));
const BudgetCentresPage      = lazy(() => import("./pages/budget/BudgetCentresPage"));
const BudgetFormulationPage  = lazy(() => import("./pages/budget/BudgetFormulationPage"));
const BudgetExecutionPage    = lazy(() => import("./pages/budget/BudgetExecutionPage"));
const CommitmentsPage        = lazy(() => import("./pages/budget/CommitmentsPage"));
const ExpenditurePage        = lazy(() => import("./pages/budget/ExpenditurePage"));
const RevenuePage            = lazy(() => import("./pages/budget/RevenuePage"));
const TreasuryPage           = lazy(() => import("./pages/budget/TreasuryPage"));
const FraudDetectionPage     = lazy(() => import("./pages/budget/FraudDetectionPage"));
const FinancialStatementsPage = lazy(() => import("./pages/FinancialStatementsPage"));
const FinancialReconciliationPage = lazy(() => import("./pages/FinancialReconciliationPage"));

// Audit / Governance / Compliance
const AuditPage              = lazy(() => import("./pages/AuditPage"));
const AntiCorruptionPage     = lazy(() => import("./pages/AntiCorruptionPage"));
const GovernancePage         = lazy(() => import("./pages/GovernancePage"));
const RolesPage              = lazy(() => import("./pages/RolesPage"));
const SystemAdminPage        = lazy(() => import("./pages/SystemAdminPage"));

// Analytics / BI / AI
const AnalyticsPage          = lazy(() => import("./pages/AnalyticsPage"));
const BIDashboardPage        = lazy(() => import("./pages/BIDashboardPage"));
const DrillDownPage          = lazy(() => import("./pages/DrillDownPage"));
const AIAnalyticsEnginePage  = lazy(() => import("./pages/AIAnalyticsEnginePage"));
const AiAgentsPage           = lazy(() => import("./pages/AiAgentsPage"));
const GlobalSearchPage       = lazy(() => import("./pages/GlobalSearchPage"));
const ExecutiveDashboardPage = lazy(() => import("./pages/ExecutiveDashboardPage"));
const ReportsPage            = lazy(() => import("./pages/ReportsPage"));

// Briefing
const BriefingPage           = lazy(() => import("./pages/BriefingPage"));

// Assets / Inventory
const AssetManagementPage    = lazy(() => import("./pages/AssetManagementPage"));
const AssetMaintenancePage   = lazy(() => import("./pages/AssetMaintenancePage"));
const AssetFinancialsPage    = lazy(() => import("./pages/AssetFinancialsPage"));
const AssetDisposalPage      = lazy(() => import("./pages/AssetDisposalPage"));
const InventoryPage          = lazy(() => import("./pages/InventoryPage"));

// Teams / HR / Staff
const TeamsPage              = lazy(() => import("./pages/TeamsPage"));
const StaffProductivityPage  = lazy(() => import("./pages/StaffProductivityPage"));
const DepartmentActivitiesPage = lazy(() => import("./pages/DepartmentActivitiesPage"));
const HumanResourcesPage     = lazy(() => import("./pages/HumanResourcesPage"));
const NotificationsCenterPage = lazy(() => import("./pages/NotificationsCenterPage"));

// Organisations / Corporate
const OrganisationsPage      = lazy(() => import("./pages/OrganisationsPage"));
const CorporatePage          = lazy(() => import("./pages/CorporatePage"));
const CorporateDepartmentPage = lazy(() => import("./pages/CorporateDepartmentPage"));
const WorkstationDetailPage  = lazy(() => import("./pages/WorkstationDetailPage"));
const UtilityPage            = lazy(() => import("./pages/UtilityPage"));

// Dashboards — Ministry / Executive
const MinistryDashboardPage  = lazy(() => import("./pages/MinistryDashboardPage"));
const DepartmentDashboardPage = lazy(() => import("./pages/DepartmentDashboardPage"));
const SeniorDashboardPage    = lazy(() => import("./pages/SeniorDashboardPage"));
const PrimeEntityDashboard   = lazy(() => import("./pages/PrimeEntityDashboard"));
const PresidentDashboard     = lazy(() => import("./pages/PresidentDashboard"));
const PrimeMinisterDashboard = lazy(() => import("./pages/PrimeMinisterDashboard"));

// Projects
const ProjectManagementPage  = lazy(() => import("./pages/ProjectManagementPage"));
const ProjectsPage           = lazy(() => import("./pages/ProjectsPage"));

// Procurement stages (legacy)
const ProcurementPlanningPage    = lazy(() => import("./pages/ProcurementPlanningPage"));
const ProcurementRequisitionPage = lazy(() => import("./pages/ProcurementRequisitionPage"));
const ProcurementStrategyPage    = lazy(() => import("./pages/ProcurementStrategyPage"));
const TenderPreparationPage      = lazy(() => import("./pages/TenderPreparationPage"));
const AdvertisementPage          = lazy(() => import("./pages/AdvertisementPage"));
const BidSubmissionPage          = lazy(() => import("./pages/BidSubmissionPage"));
const ContractAwardWorkbenchPage     = lazy(() => import("./pages/ContractAwardWorkbenchPage"));
const ContractExecutionWorkbenchPage = lazy(() => import("./pages/ContractExecutionWorkbenchPage"));
const ContractClosureWorkbenchPage   = lazy(() => import("./pages/ContractClosureWorkbenchPage"));
const CompletionVerificationPage = lazy(() => import("./pages/CompletionVerificationPage"));
const WarrantyManagementPage     = lazy(() => import("./pages/WarrantyManagementPage"));
const AssetHandoverPage          = lazy(() => import("./pages/AssetHandoverPage"));
const SupplierEvaluationPage     = lazy(() => import("./pages/SupplierEvaluationPage"));
const FinalAcceptancePage        = lazy(() => import("./pages/FinalAcceptancePage"));
const LessonsLearnedPage         = lazy(() => import("./pages/LessonsLearnedPage"));
const KnowledgeBasePage          = lazy(() => import("./pages/KnowledgeBasePage"));

// Workbench — global + ministry
const ProcurementWorkbenchPage = lazy(() => import("./pages/ProcurementWorkbenchPage"));
const MinistryWorkbenchPage    = lazy(() => import("./pages/MinistryWorkbenchPage"));

// Documents
const DocumentEditorPage = lazy(() => import("./pages/DocumentEditorPage"));

// Mail Registry
const MailRegistryPage = lazy(() => import("./pages/MailRegistryPage"));

// ── Applications Portal (6 public modules) ──────────────────────────────────
const ApplicationsPortalPage       = lazy(() => import("./pages/applications/ApplicationsPortalPage"));
const GovServicesPage              = lazy(() => import("./pages/applications/GovServicesPage"));
const EmploymentServicesPage       = lazy(() => import("./pages/applications/EmploymentServicesPage"));
const AnnualReturnsCompaniesPage   = lazy(() => import("./pages/applications/AnnualReturnsCompaniesPage"));
const AnnualReturnsIndividualsPage = lazy(() => import("./pages/applications/AnnualReturnsIndividualsPage"));
const OpportunitiesPage            = lazy(() => import("./pages/applications/OpportunitiesPage"));
const CommunicationsPortalPage     = lazy(() => import("./pages/applications/CommunicationsPortalPage"));

// ── E-Procurement restructured home ──────────────────────────────────────────
const EProcurementHomePage         = lazy(() => import("./pages/EProcurementHomePage"));

// ── Tender Tiles System (21 July design) ─────────────────────────────────────
const TenderTilesHome        = lazy(() => import("./pages/TenderTilesHome"));
const TenderModulePage       = lazy(() => import("./pages/TenderModulePage"));
const TenderListPage         = lazy(() => import("./pages/TenderListPage"));
const OpenBidsVaultPage      = lazy(() => import("./pages/OpenBidsVault"));
const EvaluateTendersPage    = lazy(() => import("./pages/EvaluateTendersPage"));
const InvestigationCasesPage = lazy(() => import("./pages/InvestigationCasesPage"));
const TenderReportsPage      = lazy(() => import("./pages/TenderReportsPage"));
const CreateTenderPage       = lazy(() => import("./pages/CreateTenderPage"));
const TenderProcessTower     = lazy(() => import("./pages/TenderProcessTower"));
const BidOpeningVaultPage    = lazy(() => import("./pages/BidOpeningVaultPage"));

// ── E-Recruitment ─────────────────────────────────────────────────────────────
const ERecruitmentPage             = lazy(() => import("./pages/ERecruitmentPage"));
const AssetDeclarationsPage        = lazy(() => import("./pages/AssetDeclarationsPage"));

// ── Budget Home ───────────────────────────────────────────────────────────────
const BudgetHomePage               = lazy(() => import("./pages/BudgetHomePage"));
const AnnualProcurementPlanPage    = lazy(() => import("./pages/AnnualProcurementPlanPage"));
const TenderDocumentSuitePage      = lazy(() => import("./pages/TenderDocumentSuitePage"));

// ── New 2026 Features ────────────────────────────────────────────────────────
const IntakePage                   = lazy(() => import("./pages/IntakePage"));
const SupplierMarketplacePage      = lazy(() => import("./pages/SupplierMarketplacePage"));
const AutonomousAgentsPage         = lazy(() => import("./pages/AutonomousAgentsPage"));
const SpendIntelligencePage        = lazy(() => import("./pages/SpendIntelligencePage"));

// ── Enterprise Workbench stages (26) ────────────────────────────────────
const ProcurementPlanningWorkbench   = lazy(() => import("./pages/workbench/ProcurementPlanningWorkbench"));
const RequisitionWorkbench           = lazy(() => import("./pages/workbench/RequisitionWorkbench"));
const StrategyWorkbench              = lazy(() => import("./pages/workbench/StrategyWorkbench"));
const TenderPreparationWorkbench     = lazy(() => import("./pages/workbench/TenderPreparationWorkbench"));
const TenderManagementWorkbench      = lazy(() => import("./pages/workbench/TenderManagementWorkbench"));
const RFQWorkbench                   = lazy(() => import("./pages/workbench/RFQWorkbench"));
const RFPWorkbench                   = lazy(() => import("./pages/workbench/RFPWorkbench"));
const EOIWorkbench                   = lazy(() => import("./pages/workbench/EOIWorkbench"));
const AuctionWorkbench               = lazy(() => import("./pages/workbench/AuctionWorkbench"));
const BidSubmissionWorkbench         = lazy(() => import("./pages/workbench/BidSubmissionWorkbench"));
const BidOpeningWorkbench            = lazy(() => import("./pages/workbench/BidOpeningWorkbench"));
const BidEvaluationWorkbench         = lazy(() => import("./pages/workbench/BidEvaluationWorkbench"));
const RecommendationWorkbench        = lazy(() => import("./pages/workbench/RecommendationWorkbench"));
const ContractAwardWorkbench         = lazy(() => import("./pages/workbench/ContractAwardWorkbench"));
const ContractExecutionWorkbench     = lazy(() => import("./pages/workbench/ContractExecutionWorkbench"));
const ContractManagementWorkbench    = lazy(() => import("./pages/workbench/ContractManagementWorkbench"));
const ProjectMonitoringWorkbench     = lazy(() => import("./pages/workbench/ProjectMonitoringWorkbench"));
const ContractClosureWorkbench       = lazy(() => import("./pages/workbench/ContractClosureWorkbench"));
const PaymentManagementWorkbench     = lazy(() => import("./pages/workbench/PaymentManagementWorkbench"));
const AssetManagementWorkbench       = lazy(() => import("./pages/workbench/AssetManagementWorkbench"));
const PerformanceEvalWorkbench       = lazy(() => import("./pages/workbench/PerformanceEvalWorkbench"));
const GovernanceWorkbench            = lazy(() => import("./pages/workbench/GovernanceWorkbench"));
const AppealsWorkbench               = lazy(() => import("./pages/workbench/AppealsWorkbench"));
const AuditWorkbench                 = lazy(() => import("./pages/workbench/AuditWorkbench"));
const ReportsWorkbench               = lazy(() => import("./pages/workbench/ReportsWorkbench"));
const AIAnalyticsWorkbench           = lazy(() => import("./pages/workbench/AIAnalyticsWorkbench"));
const VendorPortalWorkbench          = lazy(() => import("./pages/workbench/VendorPortalWorkbench"));
const CompetencyWorkbench            = lazy(() => import("./pages/workbench/CompetencyWorkbench"));

// ── Auth guard ───────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  return <>{children}</>;
}

// ── Vendor guard — blocks supplier/sme_supplier/vendor_user/public from
//    accessing any /workbench/* route and redirects to their own portal ──
const VENDOR_ROLES_SET = new Set(["supplier", "sme_supplier", "vendor_user", "public"]);
function VendorBlockedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (user?.role && VENDOR_ROLES_SET.has(user.role)) {
    return <Navigate to="/vendor-workbench" replace />;
  }
  return <>{children}</>;
}

// ── Wrapped shorthands ───────────────────────────────────────────────────
function P({ c: C }: { c: React.ComponentType }) {
  return <ProtectedRoute><C /></ProtectedRoute>;
}
// PV = protected + vendor-blocked (for all /workbench/* routes)
function PV({ c: C }: { c: React.ComponentType }) {
  return <VendorBlockedRoute><C /></VendorBlockedRoute>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/"                          element={<LandingPage />} />
        <Route path="/signin"                    element={<SignInPage />} />
        <Route path="/portal"                    element={<PortalPage />} />
        <Route path="/public/tenders"            element={<PortalPage />} />
        <Route path="/public/tenders/:id"        element={<TenderDetailPage />} />
        <Route path="/vendor-register"           element={<VendorSelfRegistrationPage />} />
        <Route path="/supplier-registration"     element={<SupplierRegistrationPage />} />
        <Route path="/gis"                       element={<GisMapPage />} />
        <Route path="/reports-complaints"        element={<ReportsComplaintsPage />} />
        <Route path="/report-service-delivery"   element={<ReportServiceDeliveryPage />} />


        {/* Dashboard */}
        <Route path="/dashboard"                 element={<P c={DashboardRouter} />} />
        <Route path="/supplier-portal"           element={<P c={SupplierPortalPage} />} />

        {/* Briefing */}
        <Route path="/briefing"                  element={<P c={BriefingPage} />} />
        <Route path="/briefing/*"                element={<P c={BriefingPage} />} />

        {/* Analytics / BI / AI */}
        <Route path="/analytics"                 element={<P c={AnalyticsPage} />} />
        <Route path="/bi-dashboards"             element={<P c={BIDashboardPage} />} />
        <Route path="/bi-dashboards/drill/:category/:value" element={<P c={DrillDownPage} />} />
        <Route path="/ai-analytics"              element={<P c={AIAnalyticsEnginePage} />} />
        <Route path="/ai-agents"                 element={<P c={AiAgentsPage} />} />
        <Route path="/search"                    element={<P c={GlobalSearchPage} />} />
        <Route path="/executive-dashboard"       element={<P c={ExecutiveDashboardPage} />} />
        <Route path="/reports"                   element={<P c={ReportsPage} />} />

        {/* Tenders */}
        <Route path="/planning"                  element={<P c={PlanningPage} />} />
        <Route path="/tenders"                   element={<P c={TendersPage} />} />
        <Route path="/tenders/:id"               element={<P c={TenderDetailPage} />} />
        <Route path="/tenders/:id/stage/:stage"  element={<P c={TenderStagePage} />} />
        <Route path="/tenders-lifecycle"         element={<P c={TenderLifecyclePage} />} />
        <Route path="/lifecycle"                 element={<P c={ProcurementLifecyclePage} />} />
        <Route path="/rfq"                       element={<P c={RFQPage} />} />
        <Route path="/rfp-eoi"                   element={<P c={RFPEOIPage} />} />
        <Route path="/auctions"                  element={<P c={AuctionsPage} />} />
        <Route path="/evaluations"               element={<P c={EvaluationsPage} />} />
        <Route path="/awards"                    element={<P c={AwardsPage} />} />

        {/* Vendors / Contracts */}
        <Route path="/vendors"                   element={<P c={VendorsPage} />} />
        <Route path="/contracts"                 element={<P c={ContractsPage} />} />
        <Route path="/performance"               element={<P c={PerformancePage} />} />
        <Route path="/certificates"              element={<P c={CertificatesPage} />} />

        {/* Finance / Budget */}
        <Route path="/finance"                   element={<P c={FinancePage} />} />
        <Route path="/financial-statements"      element={<P c={FinancialStatementsPage} />} />
        <Route path="/budget"                    element={<P c={BudgetHomePage} />} />
        <Route path="/budget/centres"            element={<P c={BudgetHomePage} />} />
        <Route path="/budget/formulation"        element={<P c={BudgetHomePage} />} />
        <Route path="/budget/execution"          element={<P c={BudgetHomePage} />} />
        <Route path="/budget/commitments"        element={<P c={BudgetHomePage} />} />
        <Route path="/budget/expenditure"        element={<P c={BudgetHomePage} />} />
        <Route path="/budget/revenue"            element={<P c={BudgetHomePage} />} />
        <Route path="/budget/treasury"           element={<P c={BudgetHomePage} />} />
        <Route path="/budget/fraud"              element={<P c={BudgetHomePage} />} />
        <Route path="/budget/ai-agents"          element={<P c={BudgetHomePage} />} />
        <Route path="/annual-procurement-plan"   element={<P c={AnnualProcurementPlanPage} />} />
        <Route path="/tender-documents"           element={<P c={TenderDocumentSuitePage} />} />

        {/* Audit / Governance */}
        <Route path="/audit"                     element={<P c={AuditPage} />} />
        <Route path="/anti-corruption"           element={<P c={AntiCorruptionPage} />} />
        <Route path="/governance"                element={<P c={GovernancePage} />} />
        <Route path="/roles"                     element={<P c={RolesPage} />} />
        <Route path="/system-admin"              element={<P c={SystemAdminPage} />} />
        <Route path="/notifications"             element={<P c={NotificationsCenterPage} />} />
        {/* Human Resources */}
        <Route path="/human-resources"           element={<P c={HumanResourcesPage} />} />
        <Route path="/human-resources/recruitment-crm" element={<P c={HumanResourcesPage} />} />

        {/* E-Recruitment Portal */}
        <Route path="/e-recruitment"             element={<P c={ERecruitmentPage} />} />
        <Route path="/e-recruitment/:module"     element={<P c={ERecruitmentPage} />} />

        {/* Asset Declarations Portal */}
        <Route path="/asset-declarations"        element={<P c={AssetDeclarationsPage} />} />

        {/* Assets */}
        <Route path="/assets"                    element={<P c={AssetManagementPage} />} />
        <Route path="/assets/maintenance"        element={<P c={AssetMaintenancePage} />} />
        <Route path="/assets/maintenance-crm"    element={<P c={AssetMaintenancePage} />} />
        <Route path="/assets/financials"         element={<P c={AssetFinancialsPage} />} />
        <Route path="/assets/disposal"           element={<P c={AssetDisposalPage} />} />

        {/* Inventory */}
        <Route path="/inventory"                 element={<P c={InventoryPage} />} />
        <Route path="/inventory/items"           element={<P c={InventoryPage} />} />
        <Route path="/inventory/receiving"       element={<P c={InventoryPage} />} />
        <Route path="/inventory/requests"        element={<P c={InventoryPage} />} />
        <Route path="/inventory/warehouse"       element={<P c={InventoryPage} />} />
        <Route path="/inventory/stock-count"     element={<P c={InventoryPage} />} />
        <Route path="/inventory/reconciliation"  element={<P c={InventoryPage} />} />
        <Route path="/inventory/ai-agents"       element={<P c={InventoryPage} />} />

        {/* Teams / Staff */}
        <Route path="/teams"                     element={<P c={TeamsPage} />} />
        <Route path="/staff-productivity"        element={<P c={StaffProductivityPage} />} />
        <Route path="/department-activities"     element={<P c={DepartmentActivitiesPage} />} />

        {/* Organisations / Corporate */}
        <Route path="/organisations"             element={<P c={OrganisationsPage} />} />
        <Route path="/corporate"                 element={<P c={CorporatePage} />} />
        <Route path="/corporate/customer-services-crm"     element={<P c={CorporatePage} />} />
        <Route path="/corporate/service-complaints-crm"    element={<P c={CorporatePage} />} />
        <Route path="/corporate/recruitment-crm"           element={<P c={CorporatePage} />} />
        <Route path="/corporate/services-applications-crm" element={<P c={CorporatePage} />} />
        <Route path="/corporate/annual-returns-crm"        element={<P c={CorporatePage} />} />
        <Route path="/corporate/communications-crm"        element={<P c={CorporatePage} />} />
        <Route path="/corporate/:deptId"         element={<P c={CorporateDepartmentPage} />} />
        <Route path="/corporate/:deptId/workstation/:wsId" element={<P c={WorkstationDetailPage} />} />
        <Route path="/utility"                   element={<P c={UtilityPage} />} />
        <Route path="/utility/catalogue"         element={<P c={UtilityPage} />} />
        <Route path="/utility/communications"    element={<P c={UtilityPage} />} />
        <Route path="/utility/gazette"           element={<P c={UtilityPage} />} />
        <Route path="/utility/announcements"     element={<P c={UtilityPage} />} />
        <Route path="/utility/public-records"    element={<P c={UtilityPage} />} />
        <Route path="/utility/media"             element={<P c={UtilityPage} />} />

        {/* Ministry dashboards */}
        <Route path="/ministry/:ministryId/dashboard"              element={<P c={MinistryDashboardPage} />} />
        <Route path="/ministry/:ministryId/department/:deptId"     element={<P c={DepartmentDashboardPage} />} />
        <Route path="/ministry/:ministryId/senior/:officerIdx"     element={<P c={SeniorDashboardPage} />} />
        <Route path="/prime-entity"              element={<P c={PrimeEntityDashboard} />} />
        <Route path="/president"                 element={<P c={PresidentDashboard} />} />
        <Route path="/prime-minister"            element={<P c={PrimeMinisterDashboard} />} />

        {/* Projects */}
        <Route path="/projects"                  element={<P c={ProjectManagementPage} />} />
        <Route path="/projects/portfolio"        element={<P c={ProjectManagementPage} />} />
        <Route path="/projects/crm"              element={<P c={ProjectManagementPage} />} />
        <Route path="/projects/planning"         element={<P c={ProjectManagementPage} />} />
        <Route path="/projects/schedule"         element={<P c={ProjectManagementPage} />} />
        <Route path="/projects/costs"            element={<P c={ProjectManagementPage} />} />
        <Route path="/projects/risks"            element={<P c={ProjectManagementPage} />} />
        <Route path="/projects/quality"          element={<P c={ProjectManagementPage} />} />
        <Route path="/projects/resources"        element={<P c={ProjectManagementPage} />} />
        <Route path="/projects/contractors"      element={<P c={ProjectManagementPage} />} />
        <Route path="/projects/documents"        element={<P c={ProjectManagementPage} />} />
        <Route path="/projects/ai-tower"         element={<P c={ProjectManagementPage} />} />

        {/* Procurement stages legacy */}
        <Route path="/procurement/planning"              element={<P c={ProcurementPlanningPage} />} />
        <Route path="/procurement/requisition"           element={<P c={ProcurementRequisitionPage} />} />
        <Route path="/procurement/strategy"              element={<P c={ProcurementStrategyPage} />} />
        <Route path="/procurement/tender-preparation"    element={<P c={TenderPreparationPage} />} />
        <Route path="/procurement/advertisement"         element={<P c={AdvertisementPage} />} />
        <Route path="/procurement/bid-submission"        element={<P c={BidSubmissionPage} />} />
        <Route path="/procurement/contract-award"        element={<P c={ContractAwardWorkbenchPage} />} />
        <Route path="/procurement/contract-execution"    element={<P c={ContractExecutionWorkbenchPage} />} />
        <Route path="/procurement/contract-closure"      element={<P c={ContractClosureWorkbenchPage} />} />
        <Route path="/procurement/completion-verification" element={<P c={CompletionVerificationPage} />} />
        <Route path="/procurement/warranty-management"   element={<P c={WarrantyManagementPage} />} />
        <Route path="/procurement/asset-handover"        element={<P c={AssetHandoverPage} />} />
        <Route path="/procurement/supplier-evaluation"   element={<P c={SupplierEvaluationPage} />} />
        <Route path="/procurement/final-acceptance"      element={<P c={FinalAcceptancePage} />} />
        <Route path="/procurement/financial-reconciliation" element={<P c={FinancialReconciliationPage} />} />
        <Route path="/lessons-learned"                   element={<P c={LessonsLearnedPage} />} />
        <Route path="/knowledge-base"                    element={<P c={KnowledgeBasePage} />} />

        {/* Workbench — E-Procurement restructured home */}
        <Route path="/workbench"                 element={<PV c={EProcurementHomePage} />} />

        {/* ── Tender Tiles System — 21 July Final Design ───────────────── */}
        {/* Level 0: Main tile homepage */}
        <Route path="/tenders-hub"               element={<P c={TenderTilesHome} />} />
        {/* Level 1: Sub-tiles per procurement type */}
        <Route path="/tenders/module/:moduleType"                    element={<P c={TenderModulePage} />} />
        {/* Level 2: Each sub-module */}
        <Route path="/tenders/module/:moduleType/tender-list"        element={<P c={TenderListPage} />} />
        <Route path="/tenders/module/:moduleType/open-bids"          element={<P c={OpenBidsVaultPage} />} />
        <Route path="/tenders/module/:moduleType/bid-opening"        element={<P c={BidOpeningVaultPage} />} />
        <Route path="/tenders/module/:moduleType/evaluate"           element={<P c={EvaluateTendersPage} />} />
        <Route path="/tenders/module/:moduleType/evaluate/:tenderId" element={<P c={TenderProcessTower} />} />
        <Route path="/tenders/module/:moduleType/investigations"     element={<P c={InvestigationCasesPage} />} />
        <Route path="/tenders/module/:moduleType/reports"            element={<P c={TenderReportsPage} />} />
        <Route path="/tenders/module/:moduleType/create"             element={<P c={CreateTenderPage} />} />

        {/* ── New 2026 Features ── */}
        <Route path="/intake"                    element={<P c={IntakePage} />} />
        <Route path="/marketplace"               element={<P c={SupplierMarketplacePage} />} />
        <Route path="/agents/orchestration"      element={<P c={AutonomousAgentsPage} />} />
        <Route path="/spend-intelligence"        element={<P c={SpendIntelligencePage} />} />
        <Route path="/workbench/planning"        element={<PV c={ProcurementPlanningWorkbench} />} />
        <Route path="/workbench/requisition"     element={<PV c={RequisitionWorkbench} />} />
        <Route path="/workbench/strategy"        element={<PV c={StrategyWorkbench} />} />
        <Route path="/workbench/tender-preparation" element={<PV c={TenderPreparationWorkbench} />} />
        <Route path="/workbench/tender-management"  element={<PV c={TenderManagementWorkbench} />} />
        <Route path="/workbench/rfq"             element={<PV c={RFQWorkbench} />} />
        <Route path="/workbench/rfp"             element={<PV c={RFPWorkbench} />} />
        <Route path="/workbench/eoi"             element={<PV c={EOIWorkbench} />} />
        <Route path="/workbench/auction"         element={<PV c={AuctionWorkbench} />} />
        <Route path="/workbench/bid-submission"  element={<PV c={BidSubmissionWorkbench} />} />
        <Route path="/workbench/bid-opening"     element={<PV c={BidOpeningWorkbench} />} />
        <Route path="/workbench/bid-evaluation"  element={<PV c={BidEvaluationWorkbench} />} />
        <Route path="/workbench/recommendation"  element={<PV c={RecommendationWorkbench} />} />
        <Route path="/workbench/contract-award"  element={<PV c={ContractAwardWorkbench} />} />
        <Route path="/workbench/contract-execution" element={<PV c={ContractExecutionWorkbench} />} />
        <Route path="/workbench/contract-management" element={<PV c={ContractManagementWorkbench} />} />
        <Route path="/workbench/project-monitoring"  element={<PV c={ProjectMonitoringWorkbench} />} />
        <Route path="/workbench/contract-closure"    element={<PV c={ContractClosureWorkbench} />} />
        <Route path="/workbench/payment-management"  element={<PV c={PaymentManagementWorkbench} />} />
        <Route path="/workbench/asset-management"    element={<PV c={AssetManagementWorkbench} />} />
        <Route path="/workbench/performance-eval"    element={<PV c={PerformanceEvalWorkbench} />} />
        <Route path="/workbench/governance"          element={<PV c={GovernanceWorkbench} />} />
        <Route path="/workbench/appeals"             element={<PV c={AppealsWorkbench} />} />
        <Route path="/workbench/audit"               element={<PV c={AuditWorkbench} />} />
        <Route path="/workbench/reports"             element={<PV c={ReportsWorkbench} />} />
        <Route path="/workbench/ai-analytics"        element={<PV c={AIAnalyticsWorkbench} />} />
        <Route path="/workbench/competency-assessment" element={<PV c={CompetencyWorkbench} />} />
        <Route path="/workbench/competency-assessment/resources"   element={<PV c={CompetencyWorkbench} />} />
        <Route path="/workbench/competency-assessment/assignments" element={<PV c={CompetencyWorkbench} />} />
        <Route path="/workbench/competency-assessment/assessment"  element={<PV c={CompetencyWorkbench} />} />
        <Route path="/workbench/competency-assessment/scoring"     element={<PV c={CompetencyWorkbench} />} />
        <Route path="/workbench/competency-assessment/records"     element={<PV c={CompetencyWorkbench} />} />
        <Route path="/workbench/competency-assessment/integration" element={<PV c={CompetencyWorkbench} />} />
        <Route path="/workbench/:ministryId"         element={<PV c={MinistryWorkbenchPage} />} />
        <Route path="/vendor-workbench"              element={<P c={VendorPortalWorkbench} />} />
        <Route path="/vendor-workbench/:moduleId"    element={<P c={VendorPortalWorkbench} />} />

        {/* Documents */}
        <Route path="/docs"               element={<P c={DocumentEditorPage} />} />

        {/* Mail Registry */}
        <Route path="/mail-registry"      element={<P c={MailRegistryPage} />} />
        <Route path="/mail-registry/:folder" element={<P c={MailRegistryPage} />} />

        {/* Applications Portal — public modules (no auth required) */}
        <Route path="/applications"                          element={<ApplicationsPortalPage />} />
        <Route path="/applications/government-services"      element={<GovServicesPage />} />
        <Route path="/applications/employment-services"      element={<EmploymentServicesPage />} />
        <Route path="/applications/annual-returns-companies" element={<AnnualReturnsCompaniesPage />} />
        <Route path="/applications/annual-returns-individuals" element={<AnnualReturnsIndividualsPage />} />
        <Route path="/applications/opportunities"            element={<OpportunitiesPage />} />
        <Route path="/applications/communications"           element={<CommunicationsPortalPage />} />
        <Route path="/docs/editor"        element={<P c={DocumentEditorPage} />} />
        <Route path="/docs/library"       element={<P c={DocumentEditorPage} />} />
        <Route path="/docs/templates"     element={<P c={DocumentEditorPage} />} />
        <Route path="/docs/contracts"     element={<P c={DocumentEditorPage} />} />
        <Route path="/docs/tender-docs"   element={<P c={DocumentEditorPage} />} />
        <Route path="/docs/evaluations"   element={<P c={DocumentEditorPage} />} />
        <Route path="/docs/minutes"       element={<P c={DocumentEditorPage} />} />
        <Route path="/docs/compliance"    element={<P c={DocumentEditorPage} />} />
        <Route path="/docs/archive"       element={<P c={DocumentEditorPage} />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MinistryProvider>
        <AppRoutes />
      </MinistryProvider>
    </AuthProvider>
  );
}
