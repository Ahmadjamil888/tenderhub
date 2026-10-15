import { ReactNode } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, PageContextBar } from "@/components/AppShell";

export function ModulePage({
  title,
  description,
  phase,
  children,
  ministry = "Government of Zimbabwe",
  module,
  process,
  financialYear = "FY2026",
  pageType = "workbench",
}: {
  title: string;
  description: string;
  phase?: string;
  children?: ReactNode;
  /** Ministry name shown in the context bar */
  ministry?: string;
  /** Module name — defaults to the page title if not provided */
  module?: string;
  /** Specific process name — defaults to the page title if not provided */
  process?: string;
  /** Financial year shown in context bar */
  financialYear?: string;
  /** Page type badge: dashboard | form | workbench | report */
  pageType?: "dashboard" | "form" | "workbench" | "report";
}) {
  return (
    <AppShell>
      {/* Page Context Bar: Ministry · Module · Process · Financial Year · AI */}
      <PageContextBar
        ministry={ministry}
        module={module ?? title}
        process={process ?? title}
        financialYear={financialYear}
        pageType={pageType}
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-4 flex items-center gap-2">
          {phase && <Badge tone="blue">{phase}</Badge>}
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader title={title} description={description} />
        {children}
      </div>
    </AppShell>
  );
}

export function FeatureGrid({ features }: { features: { title: string; desc: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {features.map((f) => (
        <Card key={f.title} className="p-4 hover:border-primary/40 transition-colors">
          <div className="text-sm font-semibold text-foreground">{f.title}</div>
          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</div>
        </Card>
      ))}
    </div>
  );
}

export { Card, CardHeader, Badge };
