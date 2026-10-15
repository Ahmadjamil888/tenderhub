import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { FeatureGrid } from "@/components/ModulePage";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ClipboardList, DollarSign, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "@/lib/toast";

const planItems = [
  { id: "PR-2026-1284", title: "ICT Equipment — Ministry of Education", category: "ICT & Digital", budget: "USD 2,400,000", quarter: "Q3 2026", status: "Approved" },
  { id: "PR-2026-1283", title: "Medical Supplies — 24 District Hospitals", category: "Health & Pharma", budget: "USD 8,200,000", quarter: "Q3 2026", status: "Budget Validation" },
  { id: "PR-2026-1282", title: "Road Maintenance — Midlands Province", category: "Infrastructure", budget: "USD 14,600,000", quarter: "Q4 2026", status: "Draft" },
  { id: "PR-2026-1281", title: "Security Services — 12 Government Buildings", category: "Services", budget: "USD 1,800,000", quarter: "Q3 2026", status: "Approved" },
  { id: "PR-2026-1280", title: "Fertiliser Pre-positioning 2026/27", category: "Agriculture", budget: "USD 22,000,000", quarter: "Q3 2026", status: "Review" },
];

const forecastData = [
  { quarter: "Q3 2026", planned: 420, forecast: 448 },
  { quarter: "Q4 2026", planned: 380, forecast: 395 },
  { quarter: "Q1 2027", planned: 310, forecast: 290 },
  { quarter: "Q2 2027", planned: 350, forecast: 368 },
];

export default function PlanningPage() {
  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Procurement"
        process="Procurement Planning"
        financialYear="FY2026"
        pageType="workbench"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="blue">Phase 1</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Procurement Planning & Demand Management"
          description="Procurement requisitions, budget validation, AI demand forecasting, annual / quarterly / project / department plans with funding validation and approval workflows."
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Active PRs" value="384" delta="+28 this week" icon={ClipboardList} />
          <KpiCard label="Committed Budget" value="USD 840M" delta="78% of APP" icon={DollarSign} />
          <KpiCard label="Q3 Plan Items" value="142" delta="64 approved" icon={Calendar} />
          <KpiCard label="AI Forecasts Active" value="28" delta="Category demand models" icon={CheckCircle2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader title="AI Demand Forecast" subtitle="Planned vs AI forecast (USD M)" />
            <div className="p-4 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastData}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="planned" fill="#3B82F6" radius={[3, 3, 0, 0]} name="Planned (USD M)" />
                  <Bar dataKey="forecast" fill="#8B5CF6" radius={[3, 3, 0, 0]} name="AI Forecast (USD M)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader title="Annual Procurement Plan Progress" subtitle="FY2026 APP execution" />
            <div className="p-5 space-y-3">
              {[
                { cat: "Infrastructure", planned: 840, actual: 612, pct: 73 },
                { cat: "Health & Pharma", planned: 420, actual: 318, pct: 76 },
                { cat: "ICT & Digital", planned: 210, actual: 148, pct: 70 },
                { cat: "Agriculture", planned: 380, actual: 272, pct: 72 },
                { cat: "Education", planned: 180, actual: 124, pct: 69 },
              ].map((c) => (
                <div key={c.cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">{c.cat}</span>
                    <span className="text-muted-foreground">{c.pct}% executed</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader title="Procurement Requisitions" subtitle="Pending approval and in progress" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs text-muted-foreground">
                <tr>
                  {["PR ID", "Title", "Category", "Budget", "Quarter", "Status", ""].map((h) => (
                    <th key={h} className="text-left font-medium px-5 py-2.5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {planItems.map((p) => (
                  <tr key={p.id} className="hover:bg-secondary/40">
                    <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">{p.id}</td>
                    <td className="px-5 py-3 font-medium text-foreground">{p.title}</td>
                    <td className="px-5 py-3 text-foreground">{p.category}</td>
                    <td className="px-5 py-3 font-semibold text-foreground">{p.budget}</td>
                    <td className="px-5 py-3 text-foreground">{p.quarter}</td>
                    <td className="px-5 py-3">
                      <Badge tone={p.status === "Approved" ? "green" : p.status === "Draft" ? "muted" : "amber"}>{p.status}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toast(`${p.id} — ${p.title} | ${p.category} | ${p.budget} | ${p.quarter} | Status: ${p.status}`, "info")}
                        className="h-7 px-2.5 rounded-md border border-border text-xs hover:bg-secondary transition-colors">Open</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <FeatureGrid features={[
          { title: "Procurement Requisition", desc: "Structured PR creation with item catalog, specifications, budget linkage, and approver routing." },
          { title: "Budget Validation", desc: "Real-time check against vote, fund, cost centre and project balance before commitment." },
          { title: "AI Demand Forecasting", desc: "Historical consumption, seasonality, and project pipeline to predict 12–24 month demand by category." },
          { title: "Annual Procurement Plan", desc: "Consolidated APP per entity, published to citizens, regulator-ready format." },
          { title: "Quarterly & Project Plans", desc: "Rolling planning cadence with variance tracking against the APP." },
          { title: "Funding Validation", desc: "Funding source (treasury, donor, grant, loan) verification with controls per source." },
        ]} />
      </div>
    </AppShell>
  );
}
