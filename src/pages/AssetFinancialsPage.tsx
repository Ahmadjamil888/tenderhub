import { useState } from "react";
import { AppShell, PageHeader, Card, CardHeader, Badge, KpiCard , PageContextBar } from "@/components/AppShell";
import { FeatureGrid } from "@/components/ModulePage";
import { useAssets } from "@/hooks/use-store";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import { DollarSign, TrendingDown, TrendingUp, AlertTriangle, PiggyBank } from "lucide-react";

const TABS = ["Overview", "Depreciation", "Valuation", "Lifecycle Costs", "Capital Planning"] as const;
type Tab = typeof TABS[number];
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#84CC16", "#F97316"];

export default function AssetFinancialsPage() {
  const { assets } = useAssets();
  const [tab, setTab] = useState<Tab>("Overview");

  const totalAcquisitionCost = assets.reduce((s, a) => s + (parseFloat(a.acquisitionCost.replace(/[^0-9.]/g, "")) || 0), 0);
  const totalCurrentValue = assets.reduce((s, a) => s + (parseFloat(a.currentValue.replace(/[^0-9.]/g, "")) || 0), 0);
  const totalDepreciated = totalAcquisitionCost - totalCurrentValue;
  const avgDepreciationRate = totalAcquisitionCost > 0 ? (totalDepreciated / totalAcquisitionCost * 100) : 0;

  const byClassValue = (() => {
    const map: Record<string, number> = {};
    assets.forEach(a => {
      const v = parseFloat(a.currentValue.replace(/[^0-9.]/g, "")) || 0;
      map[a.assetClass] = (map[a.assetClass] || 0) + v;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value / 1000) })).sort((a, b) => b.value - a.value);
  })();

  const depreciationTrend = [
    { year: "2021", value: 820, depreciation: 62 },
    { year: "2022", value: 780, depreciation: 58 },
    { year: "2023", value: 740, depreciation: 55 },
    { year: "2024", value: 720, depreciation: 49 },
    { year: "2025", value: Math.round(totalCurrentValue / 1000 + 20), depreciation: 44 },
    { year: "2026", value: Math.round(totalCurrentValue / 1000), depreciation: Math.round(avgDepreciationRate) },
  ];

  const lifeCycleCosts = [
    { category: "Acquisition", cost: Math.round(totalAcquisitionCost / 1000) },
    { category: "Maintenance", cost: Math.round(totalAcquisitionCost * 0.04 / 1000) },
    { category: "Operations", cost: Math.round(totalAcquisitionCost * 0.06 / 1000) },
    { category: "Insurance", cost: Math.round(totalAcquisitionCost * 0.01 / 1000) },
    { category: "Disposal", cost: Math.round(totalAcquisitionCost * 0.005 / 1000) },
  ];

  const capitalPlan = [
    { year: "2027", replacement: 180, newAcquisition: 240 },
    { year: "2028", replacement: 320, newAcquisition: 180 },
    { year: "2029", replacement: 210, newAcquisition: 290 },
    { year: "2030", replacement: 450, newAcquisition: 150 },
    { year: "2031", replacement: 380, newAcquisition: 200 },
  ];

  return (
    <AppShell>
      {/* Page Context Bar */}
      <PageContextBar
        ministry="Government of Zimbabwe"
        module="Enterprise Asset Management"
        process="Asset Financials"
        financialYear="FY2026"
        pageType="dashboard"
      />
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <Badge tone="green">Asset Financial Management</Badge>
          <Badge tone="muted">Government of Zimbabwe</Badge>
        </div>
        <PageHeader
          title="Asset Financials"
          description="Asset valuation, depreciation management, lifecycle costing, capital investment planning, and financial reporting."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <KpiCard label="Total Acquisition Cost" value={`USD ${(totalAcquisitionCost / 1e6).toFixed(2)}M`} delta="Historical cost basis" icon={DollarSign} color="blue" />
          <KpiCard label="Current Book Value" value={`USD ${(totalCurrentValue / 1e6).toFixed(2)}M`} delta="Net asset value" icon={PiggyBank} color="green" />
          <KpiCard label="Total Depreciation" value={`USD ${(totalDepreciated / 1e6).toFixed(2)}M`} delta={`${avgDepreciationRate.toFixed(1)}% written down`} positive={false} icon={TrendingDown} color="amber" />
          <KpiCard label="Replacement Reserve" value={`USD ${(totalCurrentValue * 0.12 / 1e6).toFixed(2)}M`} delta="12% of book value" icon={TrendingUp} color="violet" />
        </div>

        <div className="flex gap-1 mb-6 border-b border-black/10 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                tab === t ? "border-black text-black" : "border-transparent text-black/60 hover:text-black"
              }`}>{t}</button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader title="Asset Value by Class" subtitle="Current book value (USD thousands)" />
                <div className="p-4 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byClassValue}>
                      <CartesianGrid stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                        formatter={(v: number) => [`USD ${v}K`, "Value"]} />
                      <Bar dataKey="value" fill="#334155" radius={[3, 3, 0, 0]} name="Value (USD K)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card>
                <CardHeader title="Portfolio Value Distribution" subtitle="By asset class" />
                <div className="p-4 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={byClassValue} cx="50%" cy="50%" innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={2}>
                        {byClassValue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                        formatter={(v: number) => [`USD ${v}K`, ""]} />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === "Depreciation" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="Asset Value & Depreciation Trend" subtitle="6-year historical and current period (USD thousands)" />
              <div className="p-4 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={depreciationTrend}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [`USD ${v}K`, ""]} />
                    <Area type="monotone" dataKey="value" stroke="#334155" fill="#dbeafe" name="Book Value" strokeWidth={2} />
                    <Area type="monotone" dataKey="depreciation" stroke="#64748B" fill="#fef3c7" name="Annual Depreciation" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <CardHeader title="Asset Depreciation Schedule" subtitle="Per-asset depreciation summary" />
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-black/10">
                      {["Asset ID", "Name", "Method", "Useful Life", "Acquisition Cost", "Current Value", "% Depreciated"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-black/50 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {assets.map(a => {
                      const acq = parseFloat(a.acquisitionCost.replace(/[^0-9.]/g, "")) || 0;
                      const cur = parseFloat(a.currentValue.replace(/[^0-9.]/g, "")) || 0;
                      const pct = acq > 0 ? ((acq - cur) / acq * 100).toFixed(1) : "0.0";
                      return (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 font-mono text-black/50">{a.id}</td>
                          <td className="px-4 py-2.5 font-medium max-w-[200px] truncate">{a.name}</td>
                          <td className="px-4 py-2.5 text-black/60">{a.depreciationMethod}</td>
                          <td className="px-4 py-2.5 text-black/60">{a.usefulLifeYears} yrs</td>
                          <td className="px-4 py-2.5">{a.acquisitionCost}</td>
                          <td className="px-4 py-2.5">{a.currentValue}</td>
                          <td className="px-4 py-2.5">
                            <span className={parseFloat(pct) > 60 ? "text-red-600 font-semibold" : parseFloat(pct) > 30 ? "text-[#0F172A]" : "text-black/60"}>{pct}%</span>
                          </td>
                        </tr>
                      );
                    })}
                    {assets.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-black/40">No assets registered yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab === "Lifecycle Costs" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="Total Cost of Ownership Breakdown" subtitle="Estimated lifecycle cost categories (USD thousands)" />
              <div className="p-4 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={lifeCycleCosts}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [`USD ${v}K`, ""]} />
                    <Bar dataKey="cost" fill="#475569" radius={[3, 3, 0, 0]} name="Cost (USD K)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {tab === "Capital Planning" && (
          <div className="space-y-4">
            <Card>
              <CardHeader title="5-Year Capital Investment Forecast" subtitle="Asset replacement and new acquisition requirements (USD thousands)" />
              <div className="p-4 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={capitalPlan}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="year" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [`USD ${v}K`, ""]} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="replacement" fill="#DC2626" radius={[2, 2, 0, 0]} name="Replacement" stackId="a" />
                    <Bar dataKey="newAcquisition" fill="#334155" radius={[3, 3, 0, 0]} name="New Acquisition" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {tab === "Valuation" && (
          <div className="space-y-4">
            <FeatureGrid features={[
              { title: "Fair Market Valuation", desc: "AI-assisted market value estimates using comparable sales data, condition assessment, and age adjustment factors." },
              { title: "Insurance Valuation", desc: "Replacement cost calculations for insurance purposes updated annually or after significant asset modifications." },
              { title: "Impairment Testing", desc: "Automated impairment indicators monitoring with IAS 36 compliant testing workflows and write-down processing." },
              { title: "Revaluation Model", desc: "Support for revaluation accounting model with periodic fair value adjustments and accumulated depreciation resets." },
              { title: "ERP Integration", desc: "Bi-directional sync with PFMS, IFMIS and other government financial systems for real-time balance sheet accuracy." },
              { title: "Disposal Value Estimation", desc: "AI estimates scrap, resale, and auction recovery values to inform retirement and disposal decisions." },
            ]} />
          </div>
        )}
      </div>
      <AIAssistantPanel agentName="Financial Asset Agent" agentRole="Asset financial lifecycle — depreciation, valuation, ROI, and capital planning"
        context="asset financial management and capital planning" color="emerald"
        suggestedPrompts={["Show fully depreciated assets", "Forecast replacement costs for next 3 years", "Identify highest ROI assets", "Calculate total cost of ownership"]} />
    </AppShell>
  );
}
