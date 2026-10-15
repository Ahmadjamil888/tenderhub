import { useParams, useNavigate } from "react-router-dom";
import { AppShell , PageContextBar } from "@/components/AppShell";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { ArrowLeft, Download, Printer, BarChart3, TrendingUp, DollarSign, Users } from "lucide-react";

const COLORS = ["#F97316","#3B82F6","#14B8A6","#10B981","#8B5CF6","#F59E0B","#EF4444","#EC4899"];

// ── Mock breakdown data by segment ──────────────────────────────────────────
const DRILL_DATA: Record<string, {
  title: string; tab: string; kpis: { label: string; value: string; color: string }[];
  monthlyTrend: { month: string; value: number }[];
  products: { name: string; value: number }[];
  details: { ref: string; date: string; amount: string; status: string }[];
}> = {
  default: {
    title: "Segment Analysis", tab: "Business Analysis",
    kpis: [
      { label: "Total Revenue", value: "USD 25.55M", color: "bg-[#0F172A]" },
      { label: "Total Orders", value: "746,115", color: "bg-[#0F172A]" },
      { label: "Gross Profit", value: "USD 8.90M", color: "bg-[#0F172A]" },
      { label: "Avg Order Value", value: "USD 34.24", color: "bg-[#0F172A]" },
    ],
    monthlyTrend: [
      { month: "Jan", value: 4537 }, { month: "Feb", value: 2450 },
      { month: "Mar", value: 6151 }, { month: "Apr", value: 2201 },
      { month: "May", value: 3410 }, { month: "Jun", value: 1070 },
      { month: "Jul", value: 350  }, { month: "Aug", value: 240 },
      { month: "Sep", value: 230  }, { month: "Oct", value: 190 },
      { month: "Nov", value: 150  }, { month: "Dec", value: 120 },
    ],
    products: [
      { name: "Spanish", value: 431709 }, { name: "Sign Language", value: 138854 },
      { name: "Arabic", value: 56624 }, { name: "Vietnamese", value: 62925 },
      { name: "Farsi", value: 23496 }, { name: "Korean", value: 16624 },
    ],
    details: [
      { ref: "ORD-001", date: "2022-01-15", amount: "USD 1,240", status: "Invoiced" },
      { ref: "ORD-002", date: "2022-01-18", amount: "USD 880", status: "Invoiced" },
      { ref: "ORD-003", date: "2022-02-02", amount: "USD 2,100", status: "Cancelled" },
      { ref: "ORD-004", date: "2022-02-14", amount: "USD 560", status: "Invoiced" },
      { ref: "ORD-005", date: "2022-03-01", amount: "USD 3,200", status: "Invoiced" },
      { ref: "ORD-006", date: "2022-03-18", amount: "USD 1,780", status: "Scheduled" },
      { ref: "ORD-007", date: "2022-04-05", amount: "USD 940", status: "Invoiced" },
      { ref: "ORD-008", date: "2022-04-22", amount: "USD 2,560", status: "Invoiced" },
    ],
  },
};

function getDrillData(category: string, value: string) {
  const key = `${category}-${value}`.toLowerCase().replace(/\s+/g, "-");
  const data = DRILL_DATA[key] ?? DRILL_DATA["default"];
  return {
    ...data,
    title: `${decodeURIComponent(value)} — ${decodeURIComponent(category)} Analysis`,
    tab: decodeURIComponent(category).replace(/-/g, " "),
  };
}

export default function DrillDownPage() {
  const { category = "", value = "" } = useParams();
  const navigate = useNavigate();
  const data = getDrillData(category, value);

  const printPage = () => window.print();

  const exportCSV = () => {
    const rows = ["Ref,Date,Amount,Status", ...data.details.map(d => `${d.ref},${d.date},${d.amount},${d.status}`)].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `drill-${category}-${value}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Analytics & Intelligence"
        process="Data Drill-Down"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4 flex-wrap">
          <button onClick={() => navigate("/bi-dashboards")} className="hover:text-foreground transition-colors flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5" /> BI Dashboards
          </button>
          <span>/</span>
          <span className="text-muted-foreground/60">{decodeURIComponent(category).replace(/-/g, " ")}</span>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">{decodeURIComponent(value)}</span>
        </nav>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="text-xl font-semibold text-foreground">{data.title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Detailed breakdown for this segment</p>
          </div>
          <div className="flex gap-2">
            <button onClick={printPage} className="h-9 px-3 rounded-lg border border-border text-sm flex items-center gap-1.5 hover:bg-secondary">
              <Printer className="h-4 w-4" /> Print
            </button>
            <button onClick={exportCSV} className="h-9 px-3 rounded-lg border border-border text-sm flex items-center gap-1.5 hover:bg-secondary">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {data.kpis.map(k => (
            <div key={k.label} className={`${k.color} rounded-xl p-4 text-white`}>
              <div className="text-xl font-bold">{k.value}</div>
              <div className="text-xs font-medium opacity-85 mt-1">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Monthly Trend */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#0F172A]" /> Monthly Orders Trend</h2>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyTrend}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2.5} dot={{ fill: "#f97316", r: 3 }} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Breakdown Donut */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Users className="h-4 w-4 text-slate-600" /> Product / Language Breakdown</h2>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.products} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                    dataKey="value" nameKey="name" paddingAngle={2}>
                    {data.products.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number) => [v.toLocaleString(), "Orders"]} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Products Bar Chart */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4 text-slate-600" /> Volume by Product</h2>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.products} layout="vertical">
                <CartesianGrid stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} width={88} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="value" fill="#f97316" radius={[0, 3, 3, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detail Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold">Transaction Detail Records</h2>
            <span className="text-xs text-muted-foreground">{data.details.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs text-muted-foreground">
                <tr>
                  {["Reference", "Date", "Amount", "Status"].map(h => (
                    <th key={h} className="text-left font-medium px-5 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.details.map(row => (
                  <tr key={row.ref} className="hover:bg-secondary/30">
                    <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">{row.ref}</td>
                    <td className="px-5 py-3">{row.date}</td>
                    <td className="px-5 py-3 font-medium">{row.amount}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        row.status === "Invoiced" ? "bg-slate-100 text-[#0F172A]" :
                        row.status === "Cancelled" ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-[#0F172A]"
                      }`}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
