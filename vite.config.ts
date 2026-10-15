import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    // Raise the advisory threshold — chunks will still be split but warning won't fire
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // ── Manual chunk groupings ─────────────────────────────────────
        manualChunks(id) {
          // ── React core ──────────────────────────────────────────────
          if (id.includes("node_modules/react/") ||
              id.includes("node_modules/react-dom/") ||
              id.includes("node_modules/scheduler/")) {
            return "vendor-react";
          }

          // ── React Router ─────────────────────────────────────────────
          if (id.includes("node_modules/react-router") ||
              id.includes("node_modules/@remix-run/")) {
            return "vendor-router";
          }

          // ── Recharts + D3 dependencies ────────────────────────────────
          if (id.includes("node_modules/recharts") ||
              id.includes("node_modules/d3-") ||
              id.includes("node_modules/victory-vendor") ||
              id.includes("node_modules/eventemitter3")) {
            return "vendor-charts";
          }

          // ── Leaflet / GIS ─────────────────────────────────────────────
          if (id.includes("node_modules/leaflet") ||
              id.includes("node_modules/react-leaflet")) {
            return "vendor-leaflet";
          }

          // ── Radix UI ──────────────────────────────────────────────────
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor-radix";
          }

          // ── Lucide icons ──────────────────────────────────────────────
          if (id.includes("node_modules/lucide-react")) {
            return "vendor-icons";
          }

          // ── Form / validation libs ────────────────────────────────────
          if (id.includes("node_modules/react-hook-form") ||
              id.includes("node_modules/@hookform/") ||
              id.includes("node_modules/zod")) {
            return "vendor-forms";
          }

          // ── Date / misc UI libs ────────────────────────────────────────
          if (id.includes("node_modules/date-fns") ||
              id.includes("node_modules/react-day-picker") ||
              id.includes("node_modules/embla-carousel") ||
              id.includes("node_modules/input-otp") ||
              id.includes("node_modules/cmdk") ||
              id.includes("node_modules/sonner") ||
              id.includes("node_modules/vaul") ||
              id.includes("node_modules/react-resizable-panels")) {
            return "vendor-ui-misc";
          }

          // ── Tailwind / class utilities ────────────────────────────────
          if (id.includes("node_modules/class-variance-authority") ||
              id.includes("node_modules/clsx") ||
              id.includes("node_modules/tailwind-merge")) {
            return "vendor-tw-utils";
          }

          // ── Workbench pages — split into its own chunk ─────────────────
          if (id.includes("/pages/workbench/")) {
            return "pages-workbench";
          }

          // ── Budget pages ───────────────────────────────────────────────
          if (id.includes("/pages/budget/")) {
            return "pages-budget";
          }

          // ── BI / Analytics / Briefing — heaviest pages ────────────────
          if (id.includes("/pages/BIDashboardPage") ||
              id.includes("/pages/BriefingPage") ||
              id.includes("/pages/ExecutiveDashboardPage") ||
              id.includes("/pages/AIAnalyticsEnginePage") ||
              id.includes("/components/BriefingDashboard") ||
              id.includes("/components/BIDashboardContent")) {
            return "pages-bi";
          }

          // ── GIS / Map pages ────────────────────────────────────────────
          if (id.includes("/pages/GisMapPage") ||
              id.includes("/components/GisMapView") ||
              id.includes("/lib/gis-data") ||
              id.includes("/lib/zw-provinces-geo")) {
            return "pages-gis";
          }

          // ── Tender / Procurement pages ─────────────────────────────────
          if (id.includes("/pages/TendersPage") ||
              id.includes("/pages/TenderDetail") ||
              id.includes("/pages/TenderPreparation") ||
              id.includes("/pages/TenderLifecycle") ||
              id.includes("/pages/EvaluationsPage") ||
              id.includes("/pages/BidSubmission") ||
              id.includes("/pages/ContractAward") ||
              id.includes("/pages/ContractExecution") ||
              id.includes("/pages/ContractClosure") ||
              id.includes("/components/TenderEvaluationForms") ||
              id.includes("/components/NewTenderModal")) {
            return "pages-tenders";
          }

          // ── Remaining app pages ────────────────────────────────────────
          if (id.includes("/src/pages/") || id.includes("/src/components/")) {
            return "pages-app";
          }
        },
      },
    },
  },
});
