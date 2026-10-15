import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, KpiCard , PageContextBar } from "@/components/AppShell";
import {
  FileText, Download, Search, Filter, Sparkles, BarChart3, Eye,
  Clock, CheckCircle2, RefreshCcw, Plus, Printer,
} from "lucide-react";
import { pushNotification } from "@/lib/local-store";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

type ReportCategory = "Procurement" | "Contract" | "Supplier" | "Financial" | "Compliance" | "Risk" | "Audit" | "Executive" | "AI Analytics" | "Performance";
type ReportStatus = "Ready" | "Generating" | "Scheduled" | "Failed";

type Report = {
  id: string; title: string; category: ReportCategory; description: string;
  status: ReportStatus; lastGenerated: string; size: string;
  period: string; generatedBy: string; downloads: number;
  formats: ("PDF" | "Excel" | "Word" | "Print")[];
};

const REPORTS: Report[] = [
  { id: "R-001", title: "Procurement Summary Report", category: "Procurement", description: "Comprehensive summary of all procurement activities including tenders, evaluations, and awards.", status: "Ready", lastGenerated: "2026-06-25", size: "2.4 MB", period: "YTD 2026", generatedBy: "System", downloads: 142, formats: ["PDF", "Excel", "Print"] },
  { id: "R-002", title: "Annual Procurement Report 2025", category: "Procurement", description: "Full annual procurement analysis with statistics, trends and recommendations.", status: "Ready", lastGenerated: "2026-01-31", size: "8.7 MB", period: "FY 2025", generatedBy: "System", downloads: 892, formats: ["PDF", "Word", "Print"] },
  { id: "R-003", title: "Contract Closure Report Q2 2026", category: "Contract", description: "All contract closures in Q2 2026 with compliance scores and final financial positions.", status: "Ready", lastGenerated: "2026-06-24", size: "1.8 MB", period: "Q2 2026", generatedBy: "T. Moyo", downloads: 34, formats: ["PDF", "Excel"] },
  { id: "R-004", title: "Supplier Performance Report — June 2026", category: "Supplier", description: "Monthly supplier performance analysis with KPI scores and improvement notices.", status: "Ready", lastGenerated: "2026-06-20", size: "3.2 MB", period: "June 2026", generatedBy: "System", downloads: 78, formats: ["PDF", "Excel", "Print"] },
  { id: "R-005", title: "Financial Report — YTD 2026", category: "Financial", description: "Year to date financial summary including spend, savings, budget utilization and payment status.", status: "Ready", lastGenerated: "2026-06-25", size: "4.1 MB", period: "YTD 2026", generatedBy: "System", downloads: 203, formats: ["PDF", "Excel", "Print"] },
  { id: "R-006", title: "Budget Utilization Report Q2 2026", category: "Financial", description: "Budget vs actual analysis by ministry, department and category.", status: "Ready", lastGenerated: "2026-06-25", size: "2.8 MB", period: "Q2 2026", generatedBy: "System", downloads: 156, formats: ["PDF", "Excel"] },
  { id: "R-007", title: "Compliance & Regulatory Report", category: "Compliance", description: "Compliance scores, deviations, corrective actions and regulatory submissions.", status: "Ready", lastGenerated: "2026-06-22", size: "1.9 MB", period: "H1 2026", generatedBy: "System", downloads: 89, formats: ["PDF", "Print"] },
  { id: "R-008", title: "Risk Assessment Report — Q2 2026", category: "Risk", description: "All active risks, mitigation status, escalations and risk heat map.", status: "Ready", lastGenerated: "2026-06-20", size: "2.2 MB", period: "Q2 2026", generatedBy: "System", downloads: 67, formats: ["PDF", "Excel"] },
  { id: "R-009", title: "Internal Audit Report — H1 2026", category: "Audit", description: "Audit findings, management responses and corrective action tracking.", status: "Ready", lastGenerated: "2026-06-15", size: "5.4 MB", period: "H1 2026", generatedBy: "Audit Division", downloads: 312, formats: ["PDF", "Print"] },
  { id: "R-010", title: "Executive Dashboard Report", category: "Executive", description: "Board-ready executive summary of all procurement KPIs and strategic indicators.", status: "Ready", lastGenerated: "2026-06-25", size: "1.4 MB", period: "June 2026", generatedBy: "System", downloads: 421, formats: ["PDF", "Print"] },
  { id: "R-011", title: "AI Analytics — Procurement Trends Report", category: "AI Analytics", description: "AI-generated insights on procurement trends, forecast, fraud patterns and opportunities.", status: "Ready", lastGenerated: "2026-06-24", size: "3.8 MB", period: "YTD 2026", generatedBy: "AI Engine", downloads: 98, formats: ["PDF", "Excel"] },
  { id: "R-012", title: "Performance KPI Report — Q2 2026", category: "Performance", description: "All KPIs across procurement cycle time, quality, savings and compliance.", status: "Generating", lastGenerated: "", size: "—", period: "Q2 2026", generatedBy: "System", downloads: 0, formats: ["PDF", "Excel", "Print"] },
];

const CATEGORY_COLOR: Record<ReportCategory, string> = {
  Procurement: "bg-slate-100 text-[#0F172A]", Contract: "bg-slate-100 text-[#0F172A]",
  Supplier: "bg-slate-100 text-[#0F172A]", Financial: "bg-slate-100 text-[#0F172A]",
  Compliance: "bg-slate-100 text-[#0F172A]", Risk: "bg-red-100 text-red-700",
  Audit: "bg-slate-100 text-[#0F172A]", Executive: "bg-black text-white",
  "AI Analytics": "bg-slate-100 text-[#0F172A]", Performance: "bg-slate-100 text-[#0F172A]",
};
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316", "#000", "#A855F7", "#06B6D4"];

const FORMAT_ICON: Record<string, React.ElementType> = {
  PDF: FileText, Excel: FileText, Word: FileText, Print: Printer,
};

export default function ReportsPage() {
  const [reports, setReports] = useState(REPORTS);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [generating, setGenerating] = useState<string | null>(null);
  const [tab, setTab] = useState<"Library" | "Analytics" | "Schedule">("Library");

  const filtered = reports.filter(r =>
    (catFilter === "All" || r.category === catFilter) &&
    (r.title.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase()))
  );

  const generateReport = (id: string) => {
    setGenerating(id);
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: "Generating" as ReportStatus } : r));
    setTimeout(() => {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: "Ready" as ReportStatus, lastGenerated: new Date().toISOString().split("T")[0], size: "2.1 MB" } : r));
      setGenerating(null);
      pushNotification("Report generated successfully. Ready for download.", "success");
    }, 2000);
  };

  const categories = Array.from(new Set(reports.map(r => r.category)));

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Reports & Analytics"
        process="Reports Centre"
        financialYear="FY2026"
        pageType="report"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <PageHeader
          title="Reports & Business Intelligence"
          description="Generate, schedule and download enterprise procurement reports with PDF, Excel, Word and Print support."
          actions={
            <>
              <button onClick={() => { reports.forEach(r => { if (r.status === "Ready") pushNotification(`${r.title} — sending to print queue`, "info"); }); pushNotification("All ready reports sent to print queue.", "info"); }} className="h-9 px-3 rounded-md border border-border bg-card text-sm flex items-center gap-1.5 hover:bg-secondary">
                <Printer className="h-4 w-4" /> Print All
              </button>
              <button onClick={() => generateReport("R-012")} className="h-9 px-3 rounded-md bg-black text-white text-sm flex items-center gap-1.5 hover:bg-gray-800">
                <Plus className="h-4 w-4" /> Generate Report
              </button>
            </>
          }
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Reports" value={String(reports.length)} delta="In library" />
          <KpiCard label="Ready to Download" value={String(reports.filter(r => r.status === "Ready").length)} delta="Available now" positive />
          <KpiCard label="Total Downloads" value={reports.reduce((s, r) => s + r.downloads, 0).toLocaleString()} delta="All time" positive />
          <KpiCard label="Categories" value={String(categories.length)} delta="Report types" />
        </div>

        <div className="flex gap-1 mb-6 border-b border-border">
          {(["Library", "Analytics", "Schedule"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
          ))}
        </div>

        {tab === "Library" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/30" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports…" className="w-full h-9 pl-9 pr-4 rounded-lg border border-black/10 text-sm focus:outline-none" /></div>
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="h-9 px-3 rounded-lg border border-black/10 text-sm bg-white focus:outline-none">
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(report => (
                <Card key={report.id} className="hover:border-black/20 transition-all">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${CATEGORY_COLOR[report.category]}`}>{report.category}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${report.status === "Ready" ? "bg-slate-100 text-[#0F172A]" : report.status === "Generating" ? "bg-slate-100 text-[#0F172A]" : "bg-gray-100 text-gray-600"}`}>{report.status}</span>
                    </div>
                    <div className="text-sm font-semibold text-black leading-tight mb-1">{report.title}</div>
                    <div className="text-xs text-black/50 line-clamp-2 mb-3">{report.description}</div>
                    <div className="flex items-center gap-3 text-[10px] text-black/40 mb-3">
                      {report.lastGenerated && <span><Clock className="h-3 w-3 inline mr-0.5" />{report.lastGenerated}</span>}
                      <span>{report.period}</span>
                      {report.size !== "—" && <span>{report.size}</span>}
                      <span>{report.downloads} downloads</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.status === "Ready" ? (
                        <>
                          {report.formats.map(fmt => {
                            const Icon = FORMAT_ICON[fmt] ?? FileText;
                            return (
                              <button key={fmt} onClick={() => pushNotification(`${report.title} downloading as ${fmt}…`, "success")} className="h-7 px-2 rounded-lg border border-black/10 text-[10px] text-black/60 hover:bg-[#EAF1F8] flex items-center gap-1">
                                <Icon className="h-3 w-3" />{fmt}
                              </button>
                            );
                          })}
                        </>
                      ) : (
                        <button onClick={() => generateReport(report.id)} disabled={generating === report.id} className="h-7 px-3 rounded-lg bg-black text-white text-[10px] hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1">
                          <RefreshCcw className={`h-3 w-3 ${generating === report.id ? "animate-spin" : ""}`} />
                          {generating === report.id ? "Generating…" : "Generate"}
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === "Analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader title="Reports by Category" />
              <div className="p-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories.map(c => ({ name: c, value: reports.filter(r => r.category === c).length }))} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                      {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title="Most Downloaded Reports" />
              <div className="p-4 h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={[...reports].sort((a, b) => b.downloads - a.downloads).slice(0, 5).map(r => ({ name: r.title.substring(0, 25) + "…", downloads: r.downloads }))}>
                    <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} width={150} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="downloads" fill="#000" radius={[0, 3, 3, 0]} name="Downloads" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {tab === "Schedule" && (
          <Card>
            <CardHeader title="Report Schedule" subtitle="Automated report generation schedule" />
            <div className="p-4 space-y-3">
              {[
                { report: "Executive Dashboard Report", frequency: "Daily at 06:00", next: "Tomorrow 06:00", enabled: true },
                { report: "Procurement Summary Report", frequency: "Weekly — Monday 07:00", next: "Mon 30 Jun 2026", enabled: true },
                { report: "Financial Report", frequency: "Monthly — 1st of month", next: "1 Jul 2026", enabled: true },
                { report: "Supplier Performance Report", frequency: "Monthly — 20th", next: "20 Jul 2026", enabled: true },
                { report: "Compliance Report", frequency: "Quarterly", next: "1 Oct 2026", enabled: true },
                { report: "Annual Procurement Report", frequency: "Annually — 31 Jan", next: "31 Jan 2027", enabled: true },
              ].map(s => (
                <div key={s.report} className="flex items-center justify-between p-3 border border-black/8 rounded-xl">
                  <div>
                    <div className="text-sm font-semibold text-black">{s.report}</div>
                    <div className="text-xs text-black/50 mt-0.5">{s.frequency}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[10px] text-black/40">Next run</div>
                      <div className="text-xs font-medium text-black">{s.next}</div>
                    </div>
                    <div className={`h-5 w-9 rounded-full flex items-center px-0.5 cursor-pointer ${s.enabled ? "bg-black justify-end" : "bg-gray-200 justify-start"}`} onClick={() => pushNotification(`Schedule ${s.enabled ? "disabled" : "enabled"} for ${s.report}`, "info")}>
                      <div className="h-4 w-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
